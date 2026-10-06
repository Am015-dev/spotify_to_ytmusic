// Scripted sweep (no AI eyes): plays full missions through the real page with touch taps, only on things that glow, at phone sizes,
// then two story chapters through the campaign kit.
//   NODE_PATH=/opt/node-tools/node_modules node sweep.js [games=24] [file=shortfuse.html] [story=2]
// Fails on: page errors, a glowing target that does not respond, a status line over 8 words, wires cut / fuse / finished numbers / wire counts on
// screen that differ from the engine, a ghost finger that does not point at the move the engine would make, anything stuck > 8 s, tiles
// off screen or under another element, horizontal scroll, the table under 55 % of a portrait screen, a turn with nothing glowing.
const { chromium } = require('playwright');
const path = require('path');
const N = +process.argv[2] || 24, FILE = path.resolve(__dirname, process.argv[3] || 'shortfuse.html'), STORY = process.argv[4] != null ? +process.argv[4] : 2;
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
    st() { const V = UI.V; const me = V ? V.seat : -1; return { over: !!G.over, brief: !!UI.brief, me, mine: me >= 0 && decider() === me, dec: decider(), q: G.q ? G.q.kind : '', step: G.step, camp: !!UI.camp, pass: passTo() >= 0, off: !!(UI.sel && UI.sel.off) }; },
    cands() {
      const out = [], add = (sel, kind) => { for (const e of document.querySelectorAll(sel)) { if (!vis(e) || e.disabled) continue; const r = e.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2; if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue;
        const t = document.elementFromPoint(x, y); if (!t || !(e === t || e.contains(t) || t.contains(e))) { out.push({ kind: 'COVERED', x, y, what: sel + ' ' + (e.className || '') }); continue; }
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
      const animating = document.querySelector('#tb .snap,#tb .buzz,#tb .aim,#tb .lift,#tb .sel,#tb.shake'); for (const id of ['crew', 'mine']) { if (animating) break; const c = document.getElementById(id); if (c.scrollHeight > c.clientHeight + 2 && !UI.brief) bad.push(id + ' overflows ' + c.scrollHeight + '>' + c.clientHeight); if (c.scrollWidth > c.clientWidth + 2) bad.push(id + ' overflows wide'); }
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

async function tap(page, x, y) { await page.touchscreen.tap(x, y); }
async function playGame(browser, size, gi, rep, opts) {
  const [W, H] = size, tag = W + 'x' + H + ' g' + gi;
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA, serviceWorkers: 'block' });
  await ctx.route(/fonts\.(googleapis|gstatic)/, r => r.abort());
  const page = await ctx.newPage(); const errs = [], issues = new Set(); const stats = { taps: 0, dead: 0, won: 0, lost: 0 };
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
    }
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
      const st = await page.evaluate('__sw.st()');
      if (st.over) { if (!overAt) overAt = Date.now(); if (Date.now() - overAt > (opts.story ? 5000 : 1800)) break; }
      const sig = await page.evaluate('__sw.sig()');
      if (sig !== last) { last = sig; lastAt = Date.now(); noCand = 0; } else if (Date.now() - lastAt > 8000) { issues.add('stuck 8s (dec ' + st.dec + ', q ' + st.q + ', step ' + st.step + ', mine ' + st.mine + ')'); break; }
      if (audits < 500) { audits++; const bad = await page.evaluate('__sw.audit()'); for (const b of bad) { if (process.env.SHOTS && !issues.size) await page.screenshot({ path: process.env.SHOTS + '/' + tag.replace(/ /g, '_') + '.png' }).catch(() => { }); issues.add(b); } }
      if (st.over) { await sleep(200); continue; }
      const cs = await page.evaluate('__sw.cands()');
      for (const c of cs) if (c.kind === 'COVERED') issues.add('covered: ' + c.what);
      const ok = cs.filter(c => c.kind !== 'COVERED');
      const modal = ok.filter(c => c.kind === 'cover' || c.kind === 'over');
      let pick = null;
      if (modal.length) pick = modal.find(c => /go|Go/.test(c.cls + c.txt)) || modal[0];
      else if (st.mine || st.off || st.step === 'claim' || st.step === 'snip') {
        const play = ok.filter(c => c.kind !== 'over');
        if (!play.length) { noCand++; if (noCand > 8) { issues.add('my turn with nothing glowing (q ' + st.q + ', step ' + st.step + ')'); noCand = -999; } await sleep(180); continue; }
        // follow the engine's own best move most of the time, tap anything that glows otherwise
        let want = null; const m = Math.random() < .85 ? await page.evaluate('__sw.ai()') : null;
        if (m) {
          if (m.a === 'q') { const o = await page.evaluate(`(()=>{const o=G.q.opts[${m.i}];return o&&o.d?o.d:null})()`); const u = o && o.u != null ? o.u : null; if (u != null) want = play.find(c => c.kind === 'tile' && +c.u === u); else if (o && o.seat != null && G.q) want = play.find(c => c.kind === 'plate' && +c.seat === o.seat); if (!want) want = play.find(c => c.kind === 'chip' && /glow/.test(c.cls)); }
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
    const inv = await page.evaluate(`checkInvariants()`).catch(() => []); for (const v of inv || []) issues.add('invariant: ' + v);
  } catch (e) { issues.add('crash: ' + String(e.message).slice(0, 120)); }
  await ctx.close().catch(() => { });
  const bad = [...errs.map(e => 'PAGE ERROR ' + e), ...issues];
  rep.push({ tag, job: opts.job != null ? opts.job : JOBS[gi % JOBS.length], bad, stats });
  console.log((bad.length ? 'FAIL ' : 'ok   ') + tag + (opts.story ? ' story ' + opts.story : ' job ' + JOBS[gi % JOBS.length]) + ' taps ' + stats.taps + (stats.won ? ' WON' : stats.lost ? ' lost: ' + (stats.why || '').slice(0, 60) : '') + (bad.length ? ' :: ' + bad.slice(0, 4).join(' | ') : ''));
}
(async () => {
  const browser = await chromium.launch(); const rep = []; const jobs = [];
  for (let g = 0; g < N; g++) jobs.push([SIZES[g % 2], g, {}]);
  for (let s = 0; s < STORY; s++) jobs.push([SIZES[s % 2], 100 + s, { story: ['c1', 'c2', 'c3'][s % 3] }]);
  let i = 0; const par = +process.env.PAR || 3;
  await Promise.all(Array.from({ length: par }, async () => { while (i < jobs.length) { const j = jobs[i++]; await playGame(browser, j[0], j[1], rep, j[2]); } }));
  await browser.close();
  const fails = rep.filter(r => r.bad.length);
  const all = {}; for (const r of fails) for (const b of r.bad) { const k = b.replace(/\d+/g, '#').slice(0, 90); all[k] = (all[k] || 0) + 1; }
  console.log('\n' + rep.length + ' games, ' + fails.length + ' with problems; won ' + rep.filter(r => r.stats.won).length + ', lost ' + rep.filter(r => r.stats.lost).length);
  for (const k in all) console.log('  ' + all[k] + 'x ' + k);
  process.exit(fails.length ? 1 : 0);
})();
