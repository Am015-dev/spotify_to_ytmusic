// Scripted sweep (no AI eyes): plays full missions through the real page with touch taps, only on things that glow, at phone sizes,
// then two story chapters through the campaign kit.
//   NODE_PATH=/opt/node-tools/node_modules node sweep.js [games=24] [file=shortfuse.html] [story=2]
// Fails on: page errors, a glowing target that does not respond, a status line over 8 words, wires cut / fuse / finished numbers / wire counts on
// screen that differ from the engine, a ghost finger that does not point at the move the engine would make, anything stuck > 8 s, tiles
// off screen or under another element, horizontal scroll, the table under 55 % of a portrait screen, a turn with nothing glowing.
const { chromium } = require('playwright');
const path = require('path');
const N = process.argv[2] != null ? +process.argv[2] : 24, FILE = path.resolve(__dirname, process.argv[3] || 'shortfuse.html'), STORY = process.argv[4] != null ? +process.argv[4] : 2;
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SIZES = [[390, 763], [375, 553]];
const JOBS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 13, 15, 17, 18, 20, 22, 24, 26, 28, 31, 34, 36, 40, 44, 46, 50, 52, 55, 57, 60, 11, 14, 21, 33, 38, 45, 56, 62];
const NPS = [3, 4, 2, 5, 3, 4];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const PAGE = `(() => {
  const vis = e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 3 && r.height > 3 && s.visibility !== 'hidden' && s.display !== 'none' && !e.closest('[hidden]'); };
  const words = t => t.replace(/[^a-zA-Z0-9'’]+/g, ' ').trim().split(' ').filter(w => /[a-z][a-z]/i.test(w));
  window.__sw = {
    sig() { return JSON.stringify([G.logN, G.step, G.actor, G.turn, G.q ? G.q.kind + G.q.opts.length : 0, UI.sel, UI.brief ? 1 : 0, G.over ? 1 : 0, UI.holder, G.dial]); },
    st() { const V = UI.V; const me = V ? V.seat : -1; return { over: !!G.over, brief: !!UI.brief, me, mine: me >= 0 && decider() === me, dec: decider(), q: G.q ? G.q.kind : '', step: G.step, camp: !!UI.camp, pass: passTo() >= 0, off: !!(UI.sel && UI.sel.off), sel: UI.sel ? UI.sel.mode : '' }; },
    cands() {
      const out = [], add = (sel, kind) => { for (const e of document.querySelectorAll(sel)) { if (!vis(e) || e.disabled) continue; const r = e.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2; if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue;
        const t = document.elementFromPoint(x, y); if (!t || !(e === t || e.contains(t) || t.contains(e))) { out.push({ kind: 'COVERED', x, y, what: sel + ' ' + (e.className || '') + ' <- ' + (t ? (t.id || String(t.className).slice(0, 30)) + ' ' + t.tagName : 'nothing') }); continue; }
        out.push({ kind, x, y, cls: String(e.className), u: e.dataset.u, s: e.dataset.s, k: e.dataset.k, chip: e.dataset.chip, seat: e.dataset.seat, eq: e.dataset.eq, txt: (e.innerText || '').slice(0, 30) }); } };
      add('#tb .tile.glow', 'tile'); add('#tb .plate.glow', 'plate'); add('#tb .eqk.glow', 'eq'); add('#tb .chip', 'chip'); add('#cover button', 'cover'); add('#over button', 'over'); add('.gxc button', 'gxc');
      return out;
    },
    ai() { const V = UI.V; if (!V || V.seat < 0) return null; const key = G.logN + ':' + G.turn + ':' + G.step + ':' + (G.q ? G.q.kind : ''); if (window.__plan && window.__plan.key === key) return window.__plan.m; let m = null; try { if (decider() === V.seat) { m = aiMove(V.seat); if (m && legal(m, V.seat)) m = null; } } catch (e) { } window.__plan = { key, m }; return m; },
    where(si, k) { const sl = G.st[si].w[k]; return sl ? sl.u : null; },
    myU(v) { const V = UI.V; const o = []; for (const st of V.stands) if (st.mine) for (const x of st.slots) if (!x.cut && x.v === v && !x.flip) o.push(x.u); return o; },
    audit() {
      const bad = [], W = innerWidth, H = innerHeight, de = document.documentElement, V = UI.V;
      if (Math.max(de.scrollWidth, document.body.scrollWidth) > W + 1) bad.push('hscroll ' + de.scrollWidth + '>' + W);
      const tb = document.getElementById('tb'); const tr = tb.getBoundingClientRect();
      if (H > W && !UI.brief && !G.over) { const pct = 100 * Math.min(tr.right, W) * Math.max(0, Math.min(tr.bottom, H) - Math.max(tr.top, 0)) / (W * H); if (pct < 55) bad.push('table ' + pct.toFixed(1) + '%'); }
      const say = document.getElementById('say').textContent; if (words(say).length > 8) bad.push('status ' + words(say).length + ' words: ' + say);
      for (const e of document.querySelectorAll('#tb *')) { if (!e.children.length && e.textContent && vis(e) && !e.closest('#fx,[hidden]')) { /* leaf text blocks */ const w = words(e.textContent); if (w.length > 8) bad.push('text ' + w.length + ' words: ' + w.slice(0, 5).join(' ')); } }
      for (const e of document.querySelectorAll('#tb .tile:not(.snap):not(.buzz):not(.aim):not(.sel):not(.lift)')) { const r = e.getBoundingClientRect(); if (r.left < -1 || r.right > W + 1 || r.bottom > H + 1 || r.top < 0) bad.push('tile off screen ' + Math.round(r.left) + ',' + Math.round(r.top) + ',' + Math.round(r.right) + ',' + Math.round(r.bottom)); if (r.width < 21 && !UI.brief) bad.push('tile too small ' + Math.round(r.width)); }
      const animating = document.querySelector('#tb .snap,#tb .buzz,#tb .aim,#tb .lift,#tb .sel,#tb.shake'); for (const id of ['crew', 'mine']) { if (animating) break; const c = document.getElementById(id); if (c.scrollHeight > c.clientHeight + 2 && !UI.brief && (id !== 'crew' || !TBL.lay || TBL.lay.tw > 22)) bad.push(id + ' overflows ' + c.scrollHeight + '>' + c.clientHeight); if (c.scrollWidth > c.clientWidth + 2) bad.push(id + ' overflows wide'); }
      const mine = document.getElementById('mine').getBoundingClientRect(), crew = document.getElementById('crew').getBoundingClientRect(); if (mine.height > 0 && crew.bottom > mine.top + 2) bad.push('crew overlaps my stand');
      if (V && !G.over) {
        const cut = G.st.reduce((a, s) => a + s.w.filter(x => x.cut).length, 0), tot = G.st.reduce((a, s) => a + s.w.length, 0), cc = document.querySelector('#cutc .cc'); if (cc && cc.textContent.replace(/\\s/g, '') !== cut + '/' + tot) bad.push('cut count ' + cc.textContent + ' != ' + cut + '/' + tot);
        const fz = document.querySelector('#fuse .fz'); if (G.dial != null && fz && +fz.dataset.left !== G.dial) bad.push('fuse ' + fz.dataset.left + ' != ' + G.dial);
        if (!V.validOff) { const d = document.querySelectorAll('#track .cn12.done').length; if (d !== V.valid.filter(v => v !== 'Y').length) bad.push('track ' + d + ' != ' + V.valid.length); }
        for (const p of document.querySelectorAll('#tb .plate')) { const s = V.seats[+p.dataset.seat]; const em = p.querySelector('em'); if (s && em && +em.textContent !== s.nUncut) bad.push('wire count ' + em.textContent + ' != ' + s.nUncut + ' for seat ' + p.dataset.seat); }
        const nt = document.querySelectorAll('#tb .tile').length, want = V.stands.reduce((a, s) => a + s.slots.length, 0); if (nt !== want) bad.push('tiles ' + nt + ' != ' + want);
        // hidden information: crew wires that are not cut show no face
        for (const e of document.querySelectorAll('#crew .tile.back .f')) if (e.textContent.trim()) bad.push('a hidden crew wire shows a face');
      }
      // the ghost finger points at the move the engine would make
      const gh = document.getElementById('ghost');
      if (gh) { let plan = null; try { plan = ghostPlan(UI.V); } catch (e) { } if (!plan) bad.push('ghost finger without a plan'); else { const el = document.querySelector('#tb .tile[data-u="' + (plan.from != null ? plan.from : plan.u) + '"]'); if (!el) bad.push('ghost target missing'); else { const r = el.getBoundingClientRect(), g = gh.getBoundingClientRect(); if (Math.abs(g.left + 14 - (r.left + r.width / 2)) > r.width) bad.push('ghost not on its tile'); }
        if (plan && plan.kind === 'drag') { const W2 = wwk(UI.V); const m = W2 && W2.suggestion && W2.suggestion.m; if (!m || m.a !== 'dual' || G.st[m.st].w[m.ks[0]].u !== plan.u) bad.push('ghost differs from the suggestion'); } }
      }
      return bad;
    }
  };
})()`;


// ---- help kit checks (same contract as thornbound/game/sweep.js): each bubble once, short, never over a glowing target, dismisses on a tap;
//      the bulb's finger is the advisor's move, why <= 15 words, rules 2-4 cards <= 20 words with a picture; tips off shows no bubble.
const totals = { bubbles: {}, bulbs: 0, bulbNull: 0, rulesOpened: 0, tipsOffGames: 0, pointed: 0 };
const wc = t => String(t || '').replace(/[^a-zA-Z0-9'’+]+/g, ' ').trim().split(' ').filter(Boolean).length;
const NEUTRAL = [18, 18];   // the bomb icon in the top bar: a tap there does nothing else
const GEO = `(() => { const W = innerWidth, Hh = innerHeight, bad = [];
  const hb = [...document.querySelectorAll('.gxh-bub.on')];
  if (!GXH.enabled() && hb.some(b => b.dataset.phase)) bad.push('a coach bubble with tips off');
  const dense = document.querySelectorAll('#crew .tile.glow').length >= 12;   // every crew wire is a legal target: on a packed table the bubble may sit over some of them (never over the target, my wires, buttons or cards)
  const cores = [...document.querySelectorAll('.glow,.sel,#tray .chip,#mine .chip,#over .big,#cover .big')].filter(e => !e.closest('[data-help]') && !e.closest('[hidden]') && !(dense && e.closest('#crew,#gear'))).map(e => e.getBoundingClientRect()).filter(q => q.width && q.height && q.right > 0 && q.bottom > 0 && q.left < W && q.top < Hh).map(q => { let w = q.width, h = q.height; const cx = q.left + w / 2, cy = q.top + h / 2; if (w > 56) w = 32; if (h > 56) h = 32; return { left: cx - w / 2, top: cy - h / 2, right: cx + w / 2, bottom: cy + h / 2 }; });
  for (const b of hb) { const r = b.getBoundingClientRect(); if (r.left < -1 || r.top < -1 || r.right > W + 1 || r.bottom > Hh + 1) bad.push('help bubble outside the screen');
    for (const c of cores) if (r.left < c.right && r.right > c.left && r.top < c.bottom && r.bottom > c.top) { bad.push('help bubble covers a glowing target or button'); break; } }
  return bad; })()`;
async function ctr(page, sel) { return page.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return r.width ? [r.left + r.width / 2, r.top + r.height / 2] : null; }, sel); }
async function rulesCheck(page, note, ph) {
  totals.rulesOpened++;
  const R = await page.evaluate(() => { const e = document.querySelector('.gxh-rules'); if (!e) return null; const out = [], n = +e.dataset.count;
    for (let i = 0; i < n; i++) { out.push({ t: e.querySelector('.gxh-rt').textContent, x: e.querySelector('.gxh-rx').textContent, pic: !!e.querySelector('.gxh-pic svg') }); if (i < n - 1) e.querySelector('.gxh-next').click(); }
    const r = e.querySelector('.gxh-card').getBoundingClientRect(); return { n, cards: out, inside: r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight }; });
  if (!R) { note('rules cards did not open (' + ph + ')'); return; }
  if (R.n < 2 || R.n > 4) note('rules for ' + ph + ' have ' + R.n + ' cards (want 2-4)');
  R.cards.forEach(c => { if (wc(c.x) > 20) note('rules card over 20 words (' + ph + '): ' + c.x); if (!c.pic) note('rules card without a picture (' + ph + '): ' + c.t); });
  if (!R.inside) note('rules card outside the screen (' + ph + ')');
  await page.evaluate(() => document.querySelector('.gxh-rules .gxh-x').click()); await sleep(100);
  if (await page.evaluate(() => !!document.querySelector('.gxh-rules'))) note('rules cards did not close');
}
// returns true when it did something (the caller then looks at the page again)
async function helpFlow(page, note, seenPh, bulbN) {
  const hs = await page.evaluate(() => ({ ph: hlpPhase(), step: !!HLP_STEPS[hlpPhase()], on: GXH.enabled(), rules: GXH.state().rules, sig: __sw.sig() }));
  if (hs.rules) { note('rules overlay stuck open'); await page.evaluate(() => GXH.hide()); return false; }
  if (!hs.ph) return false;
  // 1) the first-time bubble of this phase
  if (hs.on && hs.step && !seenPh.has(hs.ph)) {
    seenPh.add(hs.ph); let b = null; const t1 = Date.now();
    while (Date.now() - t1 < 2500) { b = await page.evaluate(ph => { const e = document.querySelector('.gxh-bub.on[data-phase]'); if (!e) return null; const te = HLP_STEPS[ph].target(); const tq = te && te.getBoundingClientRect(); const T = tq && { left: tq.left, top: tq.top, right: tq.right, bottom: tq.bottom }; const r = e.getBoundingClientRect();
      return { id: e.dataset.phase, title: e.querySelector('.gxh-tt').textContent, text: e.querySelector('.gxh-tx').textContent, arrow: !!e.querySelector('.gxh-arr'), ok: !!e.querySelector('.gxh-ok'), r: [r.left, r.top, r.right, r.bottom], T }; }, hs.ph).catch(() => null); if (b) break; await sleep(80); }
    if (!b) { note('no coach bubble for phase ' + hs.ph); return false; }
    totals.bubbles[hs.ph] = (totals.bubbles[hs.ph] || 0) + 1;
    if (b.id !== hs.ph) note('bubble for ' + b.id + ' shown in phase ' + hs.ph);
    if (wc(b.title) > 4) note('bubble title over 4 words: ' + b.title); if (wc(b.text) > 20) note('bubble text over 20 words (' + wc(b.text) + '): ' + b.text);
    if (!b.arrow || !b.ok) note('bubble without arrow or Got it (' + hs.ph + ')');
    if (b.T) { const [l, t, r, bt] = b.r; if (l < b.T.right && r > b.T.left && t < b.T.bottom && bt > b.T.top) note('bubble covers its target (' + hs.ph + ')'); }
    for (const x of await page.evaluate(GEO)) { note(x + ' (' + hs.ph + ')'); if (process.env.SHOTS) await page.screenshot({ path: process.env.SHOTS + '/coachgeo_' + Date.now() + '.png' }).catch(() => { }); }
    await page.touchscreen.tap(...NEUTRAL); await sleep(160);
    if (await page.evaluate(() => !!document.querySelector('.gxh-bub'))) note('bubble did not dismiss on a tap (' + hs.ph + ')');
    return true;
  }
  // 2) the lightbulb: the first time in every phase, then a quarter of the time
  if ((!seenPh.has('bulb:' + hs.ph) || Math.random() < .25) && bulbN.n < 14) {
    seenPh.add('bulb:' + hs.ph); bulbN.n++; totals.bulbs++;
    const pre = await page.evaluate(() => { const p = hlpPlan(); const c = r => { const e = hlpEl(r); if (!e) return null; const q = e.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2, w: q.width, h: q.height }; };
      return { plan: p && { kind: p.kind, to: c(p.to), from: p.from ? c(p.from) : null, why: p.why }, sig: __sw.sig() }; });
    const bb = await ctr(page, '#bulbbtn'); if (!bb) { note('no bulb button'); return false; }
    await page.touchscreen.tap(...bb); await sleep(350);
    const r = await page.evaluate(() => { const f = document.querySelector('.gxh-finger'), b = document.querySelector('.gxh-bub.on'), ru = document.querySelector('.gxh-rules');
      return { f: f && { ...f.dataset }, ring: document.querySelectorAll('.gxh-ring').length, why: b && b.querySelector('.gxh-tx').textContent, link: !!(b && b.querySelector('.gxh-link')), rules: !!ru }; });
    if (pre.plan && pre.plan.to) {
      totals.pointed++;
      if (!r.f) note('bulb tapped, no finger (' + hs.ph + ')');
      else { if (Math.abs(+r.f.tx - pre.plan.to.x) > pre.plan.to.w / 2 + 4 || Math.abs(+r.f.ty - pre.plan.to.y) > pre.plan.to.h / 2 + 4) note('bulb finger ' + r.f.tx + ',' + r.f.ty + ' != the advised move ' + Math.round(pre.plan.to.x) + ',' + Math.round(pre.plan.to.y) + ' (' + hs.ph + ')');
        if (pre.plan.from && (!r.f.fx || Math.abs(+r.f.fx - pre.plan.from.x) > pre.plan.from.w / 2 + 4 || Math.abs(+r.f.fy - pre.plan.from.y) > pre.plan.from.h / 2 + 4)) note('bulb finger start != the advised number (' + hs.ph + ')'); }
      if (!r.ring) note('bulb: nothing glows at the suggestion');
      if (!r.why || wc(r.why) > 15) note('bulb why ' + wc(r.why) + ' words: ' + r.why); if (!r.link) note('bulb bubble has no "How does this work?"');
      { const cv = await page.evaluate(() => { const p = hlpPlan(); const e = p && hlpEl(p.to), b = document.querySelector('.gxh-bub.on'); if (!e || !b) return false; const q = e.getBoundingClientRect(), r = b.getBoundingClientRect(); return r.left < q.right && r.right > q.left && r.top < q.bottom && r.bottom > q.top; }); if (cv) note('bubble covers the advised wire (' + hs.ph + ')'); }
      for (const x of await page.evaluate(GEO)) { note(x + ' (bulb ' + hs.ph + ')'); if (process.env.SHOTS) await page.screenshot({ path: process.env.SHOTS + '/bulbgeo_' + Date.now() + '.png' }).catch(() => { }); }
      if (Math.random() < .5 && r.link) { const lk = await ctr(page, '.gxh-bub .gxh-link'); if (lk) { await page.touchscreen.tap(...lk); await sleep(250); await rulesCheck(page, note, hs.ph); } }
      else { await page.touchscreen.tap(...NEUTRAL); await sleep(150); }
    } else {
      totals.bulbNull++; if (r.f) note('bulb with no suggestion still pointed a finger (' + hs.ph + ')');
      if (!r.rules) note('bulb with no suggestion did not open the rules (' + hs.ph + ')'); else await rulesCheck(page, note, hs.ph);
    }
    await page.evaluate(() => GXH.hide());
    const a = await page.evaluate(() => ({ g: !!document.querySelector('.gxh-bub,.gxh-ring,.gxh-finger,.gxh-rules'), sig: __sw.sig() }));
    if (a.g) note('help still on screen after a tap (' + hs.ph + ')'); if (a.sig !== pre.sig) note('tapping the bulb changed the game (' + hs.ph + ')');
    return true;
  }
  return false;
}

async function tap(page, x, y) { await page.touchscreen.tap(x, y); }
async function playGame(browser, size, gi, rep, opts) {
  const [W, H] = size, tag = W + 'x' + H + ' g' + gi;
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA, serviceWorkers: 'block' });
  await ctx.route(/fonts\.(googleapis|gstatic)/, r => r.abort());
  await ctx.addInitScript(() => { try { const ch = {}; for (const id of ['c1','c2','c3','c4','c5','c6','c7','c8','c9']) ch[id] = { beaten: true, stars: 1, best: 1, tries: 1, losses: 0 }; if (location.search.indexOf('x') < 0) localStorage.setItem('gns-campaign-short-fuse', JSON.stringify({ v: 1, ch, unlocked: [], last: 'c1' })); } catch (e) { } });
  let tipsOff = false; const page = await ctx.newPage(); const errs = [], issues = new Set(); const stats = { taps: 0, dead: 0, won: 0, lost: 0 };
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|Failed to load resource/.test(m.text())) errs.push('console: ' + m.text().slice(0, 140)); });
  try {
    await page.goto('file://' + FILE); await sleep(700);
    await page.evaluate(PAGE);
    const job = opts.job != null ? opts.job : JOBS[gi % JOBS.length];
    let np = opts.np || NPS[gi % NPS.length]; const pl = await page.evaluate(`MISSIONS[${job}].pl`); if (!pl.includes(np)) np = pl.find(x => x >= np) || pl[pl.length - 1];
    await page.evaluate(`AIDELAY=${120};UI.speed=${opts.speed || 5};UI.setup=UI.setup||defaultSetup();`);
    if (opts.story) {
      await page.evaluate(`GXC.open()`); await sleep(300);
    } else {
      await page.evaluate(`startJob({job:${job},np:${np},seats:['human','ai','ai','ai','ai'],lv:'${['easy', 'normal', 'hard'][gi % 3]}',names:DEFNAMES.slice(),chars:[],captain:${gi % np},seed:${gi * 977 + 11}})`);
      if (gi % 5 === 4) { await page.evaluate('GXH.setEnabled(false)'); tipsOff = true; totals.tipsOffGames++; }
    }
    const seenPh = new Set(), bulbN = { n: 0 }, hnote = m => issues.add(m);
    let last = '', lastAt = Date.now(), audits = 0, overAt = 0, noCand = 0, storyStarted = false, ghostSeen = 0;
    const t0 = Date.now(), limit = opts.limit || 170000;
    if (opts.story) { await page.evaluate(`GXC.play('${opts.story}')`); }
    while (Date.now() - t0 < limit) {
      const gx = await page.evaluate(`!!document.querySelector('.gxc.on,.gxc .gxc-screen,[class*=gxc-on]')`);
      const hasGame = await page.evaluate(`typeof G!=='undefined'&&!!G&&UI.started`);
      if (!hasGame || gx) {
        // the story screens: tap the primary button until the game starts
        const b = await page.evaluate(`(()=>{const bs=[...document.querySelectorAll('.gxc button')].filter(e=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3});const pick=bs.find(e=>/go|fight/.test(e.className))||bs.find(e=>/Start|Fight|Next|Continue|Skip|Play/i.test(e.innerText))||bs[0];if(!pick)return null;const r=pick.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,t:pick.innerText}})()`);
        if (b) { await tap(page, b.x, b.y); await sleep(250); if (opts.story && hasGame) storyStarted = true; }
        else await sleep(250);
        if (opts.story && hasGame && !gx) storyStarted = true;
        if (Date.now() - t0 > 40000 && !hasGame) { issues.add('story did not start'); break; }
        continue;
      }
      if (await page.evaluate('!!GX.open')) { await page.evaluate('GX.close()'); await sleep(250); continue; }
      const st = await page.evaluate('__sw.st()');
      if (st.over) { if (!overAt) overAt = Date.now(); if (Date.now() - overAt > (opts.story ? 5000 : 1800)) break; }
      const sig = await page.evaluate('__sw.sig()');
      if (sig !== last) { last = sig; lastAt = Date.now(); noCand = 0; } else if (Date.now() - lastAt > 8000) { if (process.env.SHOTS) await page.screenshot({ path: process.env.SHOTS + '/' + tag.replace(/ /g, '_') + '_stuck.png' }).catch(() => { }); issues.add('stuck 8s (dec ' + st.dec + ', q ' + st.q + ', step ' + st.step + ', mine ' + st.mine + ')'); break; }
      if (audits < 500) { audits++; const bad = await page.evaluate('__sw.audit()'); for (const b of bad) { if (process.env.SHOTS && !issues.size) await page.screenshot({ path: process.env.SHOTS + '/' + tag.replace(/ /g, '_') + '.png' }).catch(() => { }); issues.add(b); } }
      if (st.over) { await sleep(200); continue; }
      if (!st.brief && !st.pass && !(await page.evaluate('!!GX.open')) && await helpFlow(page, hnote, seenPh, bulbN)) { stats.help = (stats.help || 0) + 1; continue; }
      const cs = await page.evaluate('__sw.cands()');
      for (const c of cs) if (c.kind === 'COVERED') { if (process.env.SHOTS && !issues.size) await page.screenshot({ path: process.env.SHOTS + '/' + tag.replace(/ /g, '_') + '.png' }).catch(() => { }); issues.add('covered: ' + c.what); }
      const ok = cs.filter(c => c.kind !== 'COVERED');
      const modal = ok.filter(c => c.kind === 'cover' || c.kind === 'over');
      let pick = null;
      if (modal.length) pick = modal.find(c => /go|Go/.test(c.cls + c.txt)) || modal[0];
      else if (st.mine || st.off || st.step === 'claim' || st.step === 'snip') {
        const play = ok.filter(c => c.kind !== 'over' && !(c.kind === 'eq' && st.sel === 'choose'));
        if (!play.length) { noCand++; if (noCand > 8) { issues.add('my turn with nothing glowing (q ' + st.q + ', step ' + st.step + ') ' + await page.evaluate('JSON.stringify([G.phase,G.step,G.actor,G.turn,G.q&&G.q.kind,UI.sel&&UI.sel.mode,UI.brief,passTo(),document.getElementById("say").textContent,Object.keys(UI.V.legal||{}).map(k=>k+":"+(Array.isArray(UI.V.legal[k])?UI.V.legal[k].length:1))])').catch(() => '')); if (process.env.SHOTS) await page.screenshot({ path: process.env.SHOTS + '/' + tag.replace(/ /g, '_') + '_nc.png' }).catch(() => { }); noCand = -999; } await sleep(180); continue; }
        // follow the engine's own best move most of the time, tap anything that glows otherwise
        let want = null; const m = Math.random() < .85 ? await page.evaluate('__sw.ai()') : null;
        if (m) {
          if (m.a === 'q') { const o = await page.evaluate(`(()=>{const o=G.q.opts[${m.i}];return o&&o.d?o.d:null})()`); const u = o && o.u != null ? o.u : null; if (u != null) want = play.find(c => c.kind === 'tile' && +c.u === u); else if (o && o.seat != null) want = play.find(c => c.kind === 'plate' && +c.seat === o.seat); if (!want) want = play.find(c => c.kind === 'chip' && /glow/.test(c.cls)); }
          else if (m.a === 'dual' && !m.tool && !m.two && !m.own) { const sel = await page.evaluate('UI.sel'); const tu = await page.evaluate(`__sw.where(${m.st},${m.ks[0]})`);
            if (sel && sel.tg && sel.tg.length) { const us = await page.evaluate(`__sw.myU(${JSON.stringify(m.v)})`); want = play.find(c => c.kind === 'tile' && us.includes(+c.u)); } else want = play.find(c => c.kind === 'tile' && +c.u === tu); }
          else if (m.a === 'solo' && !m.flip) { const us = await page.evaluate(`__sw.myU(${JSON.stringify(m.v)})`); want = play.find(c => c.kind === 'tile' && us.includes(+c.u) && /g-solo/.test(c.cls)); }
          else if (m.a === 'reveal') want = play.find(c => c.kind === 'tile' && /g-rev/.test(c.cls));
        }
        pick = want || play[Math.floor(Math.random() * play.length)];
      } else {
        // not my turn: an any-time card or a rule button may glow; use one now and then
        const play = ok.filter(c => ['eq', 'chip', 'plate'].includes(c.kind) && /glow/.test(c.cls));
        if (play.length && Math.random() < .04) pick = play[0]; else { await sleep(120); continue; }
      }
      if (!pick) continue;
      if (process.env.DEBUG) console.log(tag, 'm', JSON.stringify(await page.evaluate('window.__plan&&window.__plan.m')), 'pick', pick.kind, (pick.cls || '').slice(0, 40), pick.u, 'sel', JSON.stringify(await page.evaluate('UI.sel&&{t:UI.sel.tg,v:UI.sel.v}')));
      const before = await page.evaluate('__sw.sig()');
      await tap(page, pick.x, pick.y); stats.taps++;
      const t1 = Date.now(); let moved = false; while (Date.now() - t1 < 1400) { await sleep(60); const a = await page.evaluate('__sw.sig()'); if (a !== before) { moved = true; break; } }
      if (!moved && pick.kind !== 'cover') { stats.dead++; const dbg = await page.evaluate("JSON.stringify([UI.sel&&UI.sel.mode,G.q&&G.q.kind,G.step,G.actor,UI.V&&UI.V.seat,document.getElementById('say').textContent])").catch(() => ''); issues.add('a glowing ' + pick.kind + ' did not respond (' + (pick.cls || '').replace(/\s+/g, ' ').slice(0, 40) + ') ' + dbg.slice(0, 160) + ' s=' + pick.s + ' k=' + pick.k); }
    }
    const fin = await page.evaluate(`G&&G.over?(G.over.win?1:2):0`).catch(() => 0); stats.why = await page.evaluate(`G&&G.over&&!G.over.win?G.over.why:''`).catch(() => ''); if (fin === 1) stats.won = 1; if (fin === 2) stats.lost = 1;
    if (Date.now() - t0 >= limit) issues.add('did not finish in ' + (limit / 1000) + ' s');
    if (opts.story && !storyStarted) issues.add('chapter never started');
    { const hst = await page.evaluate(() => GXH.state()).catch(() => null); if (hst) { const dup = hst.shown.filter((x, i) => hst.shown.indexOf(x) !== i); if (dup.length) issues.add('bubble shown twice: ' + dup.join()); if (tipsOff && hst.shown.length) issues.add('tips off but bubbles shown: ' + hst.shown.join()); } }
    const inv = await page.evaluate(`checkInvariants()`).catch(() => []); for (const v of inv || []) issues.add('invariant: ' + v);
  } catch (e) { issues.add('crash: ' + String(e.stack || e.message).split('\n').slice(0, 3).join(' / ').slice(0, 260)); }
  await ctx.close().catch(() => { });
  const bad = [...errs.map(e => 'PAGE ERROR ' + e), ...issues];
  rep.push({ tag, job: opts.job != null ? opts.job : JOBS[gi % JOBS.length], bad, stats });
  console.log((bad.length ? 'FAIL ' : 'ok   ') + tag + (opts.story ? ' story ' + opts.story : ' job ' + JOBS[gi % JOBS.length]) + ' taps ' + stats.taps + (stats.won ? ' WON' : stats.lost ? ' lost: ' + (stats.why || '').slice(0, 60) : '') + (bad.length ? ' :: ' + bad.slice(0, 4).join(' | ') : ''));
}
(async () => {
  const browser = await chromium.launch(); const rep = []; const jobs = [];
  const GI = process.env.GI ? process.env.GI.split(',').map(Number) : null;
  for (let g = 0; g < N; g++) if (!GI || GI.includes(g)) jobs.push([SIZES[g % 2], g, {}]);
  for (let s = 0; s < STORY; s++) jobs.push([SIZES[s % 2], 100 + s, { story: ['c1', 'c7', 'c10'][s % 3] }]);
  let i = 0; const par = +process.env.PAR || 3;
  await Promise.all(Array.from({ length: par }, async () => { while (i < jobs.length) { const j = jobs[i++]; await playGame(browser, j[0], j[1], rep, j[2]); } }));
  await browser.close();
  const fails = rep.filter(r => r.bad.length);
  const all = {}; for (const r of fails) for (const b of r.bad) { const k = b.replace(/\d+/g, '#').slice(0, 90); all[k] = (all[k] || 0) + 1; }
  console.log('\nhelp: bubbles ' + JSON.stringify(totals.bubbles) + ', bulb taps ' + totals.bulbs + ' (' + totals.pointed + ' with a finger, ' + totals.bulbNull + ' rules only), rules opened ' + totals.rulesOpened + ', tips-off games ' + totals.tipsOffGames);
  console.log('\n' + rep.length + ' games, ' + fails.length + ' with problems; won ' + rep.filter(r => r.stats.won).length + ', lost ' + rep.filter(r => r.stats.lost).length);
  for (const k in all) console.log('  ' + all[k] + 'x ' + k);
  process.exit(fails.length ? 1 : 0);
})();
