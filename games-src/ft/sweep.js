// Scripted sweep (no AI eyes): plays full games of Sands of Qamar through the real page with touch taps, only on things that glow
// (or on the buttons under the table), at phone sizes, plus story chapters. Run before every deploy; a failure blocks the deploy.
//   NODE_PATH=/opt/node-tools/node_modules node sweep.js [games=24] [file=sands.html] [story=2]
// Fails on: page errors, a glowing target that does not respond (a dead tap), a status line over 8 words, a seat score that differs from
// the engine, anything stuck > 8 s, buttons off screen or covered, horizontal scroll, the table under 55 % of a portrait screen,
// a ghost finger that is not on something that glows or is a button, engine invariants broken, no result screen at the end.
const { chromium } = require('playwright');
const path = require('path');
const N = +process.argv[2] || 24, FILE = path.resolve(__dirname, process.argv[3] || 'sands.html'), STORY = process.argv[4] != null ? +process.argv[4] : 2;
const JOBS = +process.env.JOBS || 4, STEP_CAP = +process.env.STEP_CAP || 3500;
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SIZES = [[390, 763], [375, 553]];
const MODES = [{ np: 2 }, { np: 3, ex: { thieves: 1 } }, { np: 2, ex: { artisans: 1 } }, { np: 2, ex: { promos: 1 } }, { np: 4 }, { np: 2, ex: { sultan: 1 } },
  { np: 3, ex: { artisans: 1, thieves: 1 } }, { np: 5 }, { np: 2, ex: { artisans: 1, sultan: 1, thieves: 1, promos: 1 } }, { np: 2 }];
const sleep = ms => new Promise(r => setTimeout(r, ms));
function rng(seed) { let t = seed >>> 0; return () => { t = (t + 0x6D2B79F5) >>> 0; let x = Math.imul(t ^ t >>> 15, t | 1); x ^= x + Math.imul(x ^ x >>> 7, x | 61); return ((x ^ x >>> 14) >>> 0) / 4294967296; }; }

const PAGE = `(() => {
  const vis = e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 3 && r.height > 3 && s.visibility !== 'hidden' && s.display !== 'none' && !e.closest('[hidden]'); };
  const lab = e => (e.getAttribute('aria-label') || e.innerText || e.className || '').toString().replace(/\\s+/g, ' ').trim().slice(0, 40);
  const hash = s => { let h = s.length; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; };
  window.__sw = {
    sig() { return [G ? G.logN : 'x', G && G.step, G && G.phase, G && G.move ? G.move.path.length + ':' + G.move.hand.length : -1, G && !!G.q, G && G.q ? G.q.title : '', UI.modal, !!UI.pendDj, !!UI.pendItem, UI.mkSel.join(), UI.sellSel.join(), UI.chz ? UI.chz.opts.length : 0, hash(document.getElementById('bd').innerHTML)].join('|'); },
    state() {
      if (!G) return { none: true, modal: UI.modal, sig: this.sig() };
      return { over: !!G.over, modal: UI.modal, me: !!me(), sig: this.sig(), step: G.step, phase: G.phase, round: G.round };
    },
    cands() {
      const out = [], seen = new Set();
      const add = (e, kind) => { if (seen.has(e) || !vis(e) || e.disabled) return; seen.add(e); const r = e.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2;
        if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) return; const t = document.elementFromPoint(x, y);
        const cover = t && t !== e && !e.contains(t) && !t.contains(e) ? (t.closest('#chz') ? 'chz' : t.id ? '#' + t.id : t.tagName.toLowerCase() + '.' + String(t.className).split(' ')[0]) : '';
        out.push({ x, y, kind, label: lab(e), cover, cls: String(e.className).slice(0, 60) }); };
      for (const e of document.querySelectorAll('#chz button')) add(e, 'chz');
      for (const e of document.querySelectorAll('.glow')) add(e, 'glow');
      for (const e of document.querySelectorAll('#acts button,#mine button')) add(e, e.classList.contains('ghost') ? 'ghost' : 'btn');
      return out;
    },
    audit() {
      const bad = [], W = innerWidth, H = innerHeight, de = document.documentElement;
      if (Math.max(de.scrollWidth, document.body.scrollWidth) > W + 1) bad.push('hscroll ' + de.scrollWidth + '>' + W);
      const bd = document.querySelector('[data-board]'); if (bd && H > W) { const r = bd.getBoundingClientRect(); const pct = 100 * Math.max(0, Math.min(r.right, W) - Math.max(r.left, 0)) * Math.max(0, Math.min(r.bottom, H) - Math.max(r.top, 0)) / (W * H); if (pct < 55) bad.push('board ' + pct.toFixed(1) + '% seats ' + Math.round(document.getElementById('seats').offsetHeight) + ' line ' + Math.round(document.getElementById('line').offsetHeight) + ' acts ' + Math.round(document.getElementById('acts').offsetHeight) + ' mine ' + document.getElementById('mine').offsetHeight + ' step ' + (G && G.step) + ' phase ' + (G && G.phase) + ' bar ' + Math.round(document.querySelector('.gx-bar').offsetHeight)); }
      if (!G) return bad;
      const gr = document.getElementById('grid').getBoundingClientRect(); if (gr.right > W + 1 || gr.left < -1 || gr.bottom > H + 1) bad.push('grid off screen');
      const ln = document.getElementById('line').textContent.replace(/[^a-zA-Z0-9'’]+/g, ' ').trim().split(' ').filter(w => /[a-z][a-z]/i.test(w)); if (ln.length > 8) bad.push('line ' + ln.length + ' words: ' + ln.join(' '));
      if (!UI.modal) { for (const b of document.querySelectorAll('#acts button')) { if (!vis(b)) continue; const r = b.getBoundingClientRect(); if (r.left < -1 || r.right > W + 1 || r.bottom > H + 1 || r.top < 0) bad.push('button off screen: ' + lab(b));
          const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); if (t && t !== b && !b.contains(t) && !t.closest('#chz')) bad.push('button covered: ' + lab(b) + ' by ' + (t.id || t.className)); } }
      G.pl.forEach((p, i) => { const e = document.querySelector('#seats [data-seat="' + i + '"] .ss'); if (!e) { bad.push('no seat chip ' + i); return; } const v = +e.textContent.replace(/[^0-9-]/g, ''); if (v !== shownTotal(p)) bad.push('score seat ' + i + ': screen ' + v + ' engine ' + shownTotal(p)); });
      const inv = checkInvariants(); if (inv.length && !G.q) bad.push('invariants: ' + inv.join('; ') + ' | last: ' + G.log.slice(0, 5).map(l => l.t).join(' / ') + ' | q=' + (G.q ? G.q.kind : '') + ' step=' + G.step);
      const f = document.getElementById('finger'); if (f && !f.hidden && !UI.modal) { const r = f.getBoundingClientRect(); const fx = parseFloat(f.style.left), fy = parseFloat(f.style.top); const t = document.elementFromPoint(fx, fy);
        const hit = t && t.closest('.glow,#acts button,.tile,.mcard,.dcard,.sp-b,.chb,.sch'); if (!hit) bad.push('finger not on a target at ' + Math.round(fx) + ',' + Math.round(fy));
        else if (!hit.classList.contains('glow') && !hit.closest('#acts')) bad.push('finger on a non-glowing ' + String(hit.className).slice(0, 30)); }
      return bad;
    }
  };
})()`;


// ---- help kit checks (GX-KIT.md section 9): a fresh profile gets each coach bubble once; it never covers a glowing target, dismisses on a tap and the game still
// completes; the bulb's finger is on the computer player's own move (hlpAdvice), why <= 15 words, rules 2-4 cards <= 20 words with a picture; tips off = no bubbles.
const HT = { bubbles: {}, bulbs: 0, bulbNull: 0, rules: 0, followed: 0, tipsOffGames: 0, nullWhy: {} };
const NEUTRAL = [60, 22];   // the game title in the top bar: a tap there does nothing else
const wc = t => String(t || '').replace(/[^a-zA-Z0-9'’+]+/g, ' ').trim().split(' ').filter(Boolean).length;
const GEOM = `(() => { const W = innerWidth, Hh = innerHeight; const r = document.querySelector('.gxh-bub.on'); if (!r) return null; const q = r.getBoundingClientRect(); const bad = [];
  const cores = [...document.querySelectorAll('.glow,#acts .ab,#acts .sp-b,#mine .gchip')].filter(e => !e.closest('[data-help]') && !e.closest('[hidden]')).map(e => e.getBoundingClientRect()).filter(b => b.width && b.height && b.right > 0 && b.bottom > 0 && b.left < W && b.top < Hh).map(b => { let w = b.width, h = b.height; const cx = b.left + w / 2, cy = b.top + h / 2; if (w > 56) w = 32; if (h > 56) h = 32; return { left: cx - w / 2, top: cy - h / 2, right: cx + w / 2, bottom: cy + h / 2 }; });
  for (const c of cores) if (q.left < c.right && q.right > c.left && q.top < c.bottom && q.bottom > c.top) { bad.push('help bubble covers a glowing target or button'); break; }
  if (q.left < -1 || q.right > W + 1 || q.top < -1 || q.bottom > Hh + 1) bad.push('help bubble off screen');
  const bar = document.querySelector('.gx-bar'); if (bar && q.top < bar.getBoundingClientRect().bottom - 1) bad.push('help bubble over the top bar');
  return bad; })()`;
async function helpStatic(page, issue) {
  const r = await page.evaluate(() => { const out = []; const w = t => String(t || '').replace(/[^a-zA-Z0-9'’+]+/g, ' ').trim().split(' ').filter(Boolean).length;
    for (const [k, s] of Object.entries(HLP_STEPS)) { if (w(s.title) > 4) out.push('step title > 4 words: ' + k); if (w(s.text) > 20) out.push('step text > 20 words: ' + k); if (!s.target) out.push('step without target: ' + k);
      const rs = HLP_RULES.filter(c => c.phase === k); if (rs.length < 2 || rs.length > 4) out.push('rules for ' + k + ': ' + rs.length + ' cards (want 2-4)'); }
    for (const c of HLP_RULES) { if (w(c.text) > 20) out.push('rules card > 20 words: ' + c.title); if (w(c.title) > 5) out.push('rules title > 5 words: ' + c.title); if (!c.pic || !/<svg/.test(c.pic())) out.push('rules card without a picture: ' + c.title); if (c.phase && !HLP_STEPS[c.phase]) out.push('rules card for unknown phase ' + c.phase); }
    if (HLP_RULES.filter(c => c.phase == null).length < 2) out.push('need 2+ general rules cards'); return out; });
  for (const x of r) issue('help: ' + x);
}
async function helpFlow(page, H, issue, ctr, tap, responded, rnd) {
  const hs = await page.evaluate(() => { const ph = hlpPhase(); return { ph, step: !!(ph && HLP_STEPS[ph]), st: GXH.state() }; });
  if (hs.st.rules) { issue('rules overlay stuck open'); await page.evaluate(() => GXH.hide()); return false; }
  if (!hs.ph) return false;
  // 1) the first-time bubble of this phase
  if (H.tipsOn && hs.step && !H.seen.has(hs.ph)) { H.seen.add(hs.ph);
    let b = null; const t1 = Date.now();
    while (Date.now() - t1 < 2500) { b = await page.evaluate(ph => { const e = document.querySelector('.gxh-bub.on[data-phase]'); if (!e) return null; const te = HLP_STEPS[ph].target(); const tq = te && te.getBoundingClientRect(); const T = tq && { left: tq.left, top: tq.top, right: tq.right, bottom: tq.bottom }; const r = e.getBoundingClientRect();
        return { id: e.dataset.phase, title: e.querySelector('.gxh-tt').textContent, text: e.querySelector('.gxh-tx').textContent, arrow: !!e.querySelector('.gxh-arr'), ok: !!e.querySelector('.gxh-ok'), r: [r.left, r.top, r.right, r.bottom], T }; }, hs.ph).catch(() => null); if (b) break; await new Promise(r => setTimeout(r, 80)); }
    if (!b) issue('no coach bubble for phase ' + hs.ph);
    else { HT.bubbles[hs.ph] = (HT.bubbles[hs.ph] || 0) + 1;
      if (b.id !== hs.ph) issue('bubble for ' + b.id + ' shown in phase ' + hs.ph);
      if (wc(b.title) > 4) issue('bubble title over 4 words: ' + b.title); if (wc(b.text) > 20) issue('bubble text over 20 words (' + wc(b.text) + '): ' + b.text);
      if (!b.arrow || !b.ok) issue('bubble without arrow or Got it (' + hs.ph + ')');
      if (b.T) { const [l, t, r, bt] = b.r; if (l < b.T.right && r > b.T.left && t < b.T.bottom && bt > b.T.top) issue('bubble covers its target (' + hs.ph + ')'); }
      for (const x of (await page.evaluate(GEOM)) || []) issue(x + ' (' + hs.ph + ')');
      await tap(...NEUTRAL); await new Promise(r => setTimeout(r, 140));
      if (await page.evaluate(() => !!document.querySelector('.gxh-bub'))) issue('bubble did not dismiss on a tap (' + hs.ph + ')');
      return true; } }
  // 2) the lightbulb: the first time in every phase, then now and then
  if ((!H.seen.has('bulb:' + hs.ph) || rnd() < .25) && H.bulbN < 14) { H.seen.add('bulb:' + hs.ph); H.bulbN++; HT.bulbs++;
    const pre = await page.evaluate(() => { const hp = me(); const m = hlpAdvice(); const sg = hlpSuggest(); let tr = null; if (sg) { const e = sg.target(); if (e) { const r = e.getBoundingClientRect(); tr = { x: r.left + r.width / 2, y: r.top + r.height / 2 }; } }
      return { m, sg: !!sg, why: sg && sg.why, tr, legal: !!(m && validMoves(hp.i).some(x => same(x, m))), sig: window.__sw.sig(), gs: [G.logN, G.step, G.phase, G.move ? G.move.path.join('-') : '', G.q ? G.q.kind : '', UI.pendDj ? 1 : 0, UI.pendItem ? 1 : 0].join('|') }; });
    const bb = await ctr('#bulbbtn'); if (!bb) { issue('no bulb button'); return false; }
    await tap(...bb); await new Promise(r => setTimeout(r, 380));
    const r = await page.evaluate(() => { const f = document.querySelector('.gxh-finger'), b = document.querySelector('.gxh-bub.on'), ru = document.querySelector('.gxh-rules');
      return { f: f && { ...f.dataset }, ring: document.querySelectorAll('.gxh-ring').length, why: b && b.querySelector('.gxh-tx').textContent, link: !!(b && b.querySelector('.gxh-link')), rules: !!ru, sig: window.__sw.sig() }; });
    let followed = false;
    if (pre.sg) {
      if (!pre.legal) issue('bulb suggestion not legal ' + JSON.stringify(pre.m));
      if (!r.f) issue('bulb tapped, no finger (' + hs.ph + ') ' + JSON.stringify(pre.m));
      else if (pre.tr && (Math.abs(+r.f.tx - pre.tr.x) > 2 || Math.abs(+r.f.ty - pre.tr.y) > 2)) issue('bulb finger ' + r.f.tx + ',' + r.f.ty + ' != suggestion ' + Math.round(pre.tr.x) + ',' + Math.round(pre.tr.y) + ' (' + hs.ph + ')');
      if (!r.ring) issue('bulb: nothing glows at the suggestion (' + hs.ph + ')');
      if (!r.why || wc(r.why) > 15) issue('bulb why ' + wc(r.why) + ' words: ' + r.why); else if (r.why !== pre.why) issue('bulb why differs from suggestion: ' + r.why);
      if (!r.link) issue('bulb bubble has no "How does this work?"');
      for (const x of (await page.evaluate(GEOM)) || []) issue(x + ' (bulb ' + hs.ph + ')');
      if (r.f && rnd() < .4) { followed = true; HT.followed++; await tap(+r.f.tx, +r.f.ty); if (!(await responded(pre.sig))) issue('tapping the bulb finger target did nothing (' + hs.ph + ') ' + JSON.stringify(pre.m)); }
      else if (r.link && rnd() < .5) { const lk = await ctr('.gxh-bub .gxh-link'); if (lk) { await tap(...lk); await new Promise(r => setTimeout(r, 250)); await helpRules(page, hs.ph, issue); } }
      else { await tap(...NEUTRAL); await new Promise(r => setTimeout(r, 150)); }
    } else {
      HT.bulbNull++; HT.nullWhy[hs.ph] = (HT.nullWhy[hs.ph] || 0) + 1;
      if (r.f) issue('bulb with no suggestion still pointed a finger (' + hs.ph + ')');
      if (!r.rules) issue('bulb with no suggestion did not open the rules (' + hs.ph + ')'); else await helpRules(page, hs.ph, issue);
    }
    await page.evaluate(() => GXH.hide());
    const a = await page.evaluate(() => ({ g: !!document.querySelector('.gxh-bub,.gxh-ring,.gxh-finger,.gxh-rules'), gs: [G.logN, G.step, G.phase, G.move ? G.move.path.join('-') : '', G.q ? G.q.kind : '', UI.pendDj ? 1 : 0, UI.pendItem ? 1 : 0].join('|') }));
    if (a.g) issue('help still on screen after a tap (' + hs.ph + ')');
    if (!followed && a.gs !== pre.gs) issue('tapping the bulb changed the game (' + hs.ph + ': ' + pre.gs + ' -> ' + a.gs + ')');
    return true; }
  return false;
}
async function helpRules(page, ph, issue) { HT.rules++;
  const R = await page.evaluate(() => { const e = document.querySelector('.gxh-rules'); if (!e) return null; const out = []; const n = +e.dataset.count; const card = e.querySelector('.gxh-card');
    for (let i = 0; i < n; i++) { out.push({ t: e.querySelector('.gxh-rt').textContent, x: e.querySelector('.gxh-rx').textContent, pic: !!e.querySelector('.gxh-pic svg') }); if (i < n - 1) e.querySelector('.gxh-next').click(); }
    const r = card.getBoundingClientRect(); return { n, cards: out, inside: r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight }; });
  if (!R) { issue('rules cards did not open (' + ph + ')'); return; }
  if (R.n < 2 || R.n > 4) issue('rules for ' + ph + ' have ' + R.n + ' cards (want 2-4)');
  R.cards.forEach(c => { if (wc(c.x) > 20) issue('rules card over 20 words (' + ph + '): ' + c.x); if (!c.pic) issue('rules card without a picture (' + ph + '): ' + c.t); });
  if (!R.inside) issue('rules card outside the screen (' + ph + ')');
  await page.evaluate(() => document.querySelector('.gxh-rules .gxh-x').click()); await new Promise(r => setTimeout(r, 100));
  if (await page.evaluate(() => !!document.querySelector('.gxh-rules'))) issue('rules cards did not close');
}

async function play(browser, job) {
  const { idx, size, mode, seed, story } = job; const rnd = rng(seed * 7919 + idx);
  const ctx = await browser.newContext({ viewport: { width: size[0], height: size[1] }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA, serviceWorkers: 'block' });
  const page = await ctx.newPage(); const res = { idx, size: size.join('x'), mode: JSON.stringify(mode), seed, taps: 0, issues: new Set(), errors: [], rounds: 0, over: false, won: null, story: story || null };
  page.on('pageerror', e => res.errors.push(String(e.message || e).split('\n')[0].slice(0, 140)));
  page.on('console', m => { if (m.type() === 'error') res.errors.push('console: ' + m.text().slice(0, 140)); });
  const issue = s => { if (res.issues.size < 12) res.issues.add(s); };
  const t0 = Date.now();
  const H = { tipsOn: idx % 4 !== 3, seen: new Set(), bulbN: 0 };
  if (!H.tipsOn) await ctx.addInitScript(() => { try { localStorage.setItem('gxh-sands-of-qamar', JSON.stringify({ on: false, seen: {} })); } catch (e) { } });
  try {
    if (story) { const n = +story.slice(1); const ch = {}; for (let k = 1; k < n; k++) ch['c' + k] = { beaten: true, stars: 1, best: null, tries: 1, losses: 0, easy: false }; await ctx.addInitScript(p => { try { localStorage.setItem('gns-campaign-sands', JSON.stringify({ v: 1, ch: p, unlocked: [], last: null })); } catch (e) { } }, ch); }
    await page.goto('file://' + FILE, { waitUntil: 'load', timeout: 30000 }); await sleep(500); await page.evaluate(PAGE); if (idx === 0) await helpStatic(page, issue);
    if (story) {
      await page.evaluate(id => { setSeed(1000 + (+id.slice(1))); GXC.play(id); }, story); await sleep(400);
      for (let k = 0; k < 14; k++) { // intro, boss card, goal: tap the kit's own buttons until the game starts
        if (await page.evaluate(() => !!G && !!UI.camp)) break;
        const b = await page.evaluate(() => { const bs = [...document.querySelectorAll('.gxc button')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 3 && !e.closest('[hidden]'); });
          const pick = bs.find(e => /^(skip|start|play|go|begin|let|fight|face|enter|ok|got|next|continue)/i.test(e.innerText.trim())) || bs.find(e => /skip|play|start|next|go|face|begin/i.test(e.innerText)) || null;
          if (!pick) return null; const r = pick.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, t: pick.innerText.trim() }; });
        if (!b) { await sleep(300); continue; } await page.touchscreen.tap(b.x, b.y); await sleep(350);
      }
      if (!(await page.evaluate(() => !!G && !!UI.camp))) { issue('story chapter did not start'); return res; }
    } else {
      await page.evaluate(m => { setSeed(m.seed); UI.setup.np = m.mode.np; UI.setup.seats = ['human', 'ai', 'ai', 'ai', 'ai']; UI.setup.lv = ['normal', m.hard ? 'hard' : 'normal', 'easy', 'normal', 'hard']; UI.setup.ex = Object.assign({ artisans: false, sultan: false, thieves: false, promos: false }, m.mode.ex ? Object.fromEntries(Object.keys(m.mode.ex).map(k => [k, true])) : {}); }, { mode, seed, hard: idx % 3 === 1 });
      if (mode.np === 2 && !mode.ex) { await page.tap('text=Play vs computer'); }
      else { await page.evaluate(() => { document.querySelector('#modal details').open = true; }); await sleep(100); const b = await page.evaluate(() => { const e = [...document.querySelectorAll('#modal button')].find(x => /Begin/.test(x.innerText)); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
        if (b) { await page.evaluate(() => { const e = [...document.querySelectorAll('#modal button')].find(x => /Begin/.test(x.innerText)); e.scrollIntoView({ block: 'center' }); }); await sleep(50); const b2 = await page.evaluate(() => { const e = [...document.querySelectorAll('#modal button')].find(x => /Begin/.test(x.innerText)); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }); await page.touchscreen.tap(b2.x, b2.y); } else issue('no Begin button'); }
      await sleep(300);
    }
    await page.evaluate(() => { UI.speed = 14; });
    let lastSig = '', lastChange = Date.now(), dead = {}, deadN = 0, auditN = 0;
    for (let step = 0; step < STEP_CAP; step++) {
      const st = await page.evaluate('window.__sw.state()');
      if (st.sig !== lastSig) { lastSig = st.sig; lastChange = Date.now(); }
      if (Date.now() - lastChange > 8000) { issue('stuck >8 s in ' + st.phase + '/' + st.step + ' modal=' + st.modal); break; }
      if (st.over && (st.modal === 'over' || story)) { res.over = true; break; }
      if (st.modal && st.modal !== 'over' && !story) { await sleep(100); continue; }
      if (step % 3 === 0 || st.me) { const a = await page.evaluate('window.__sw.audit()'); for (const x of a) issue(x); auditN++; }
      if (!st.me) { await sleep(40); continue; }
      if (await helpFlow(page, H, issue, async sel => page.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return r.width ? [r.left + r.width / 2, r.top + r.height / 2] : null; }, sel), async (x, y) => { await page.touchscreen.tap(x, y); res.taps++; }, async sig => { const t = Date.now(); while (Date.now() - t < 1500) { await sleep(60); if ((await page.evaluate('window.__sw.sig()')) !== sig) return true; } return false; }, rnd)) { lastChange = Date.now(); continue; }
      let cands = (await page.evaluate('window.__sw.cands()')).filter(c => !c.cover && !(dead[c.label + '|' + c.kind + '|' + st.sig] >= 1));
      if (!cands.length) { await sleep(60); continue; }
      const glow = cands.filter(c => c.kind === 'glow' || c.kind === 'chz'), btn = cands.filter(c => c.kind === 'btn'), ghost = cands.filter(c => c.kind === 'ghost');
      let pool = glow.length && (rnd() < .8 || !btn.length) ? glow : btn.length ? btn : glow.length ? glow : (rnd() < .03 ? ghost : []);
      if (!pool.length) { await sleep(60); continue; }
      const c = pool[Math.floor(rnd() * pool.length)];
      await page.touchscreen.tap(c.x, c.y); res.taps++;
      let changed = false; for (let k = 0; k < 40; k++) { await sleep(25); const s2 = await page.evaluate('window.__sw.sig()'); if (s2 !== st.sig) { changed = true; break; } }
      if (!changed) { const dd = await page.evaluate(() => JSON.stringify({ ph: G.phase, st: G.step, act: G.act && G.act.color, q: G.q && G.q.kind, pick: UI.pick, pd: UI.pendDj, pi: UI.pendItem, vm: validMoves(me() ? me().i : 0).slice(0, 5) })).catch(() => ''); if (process.env.DBG) { console.log('DEAD', c.label, dd); const r2 = await page.evaluate(() => { const e = document.querySelector('#acts [data-pw]'); const a = window.__sw.sig(); const pd0 = JSON.stringify(UI.pendDj); if (e) e.click(); return [pd0, JSON.stringify(UI.pendDj), a === window.__sw.sig(), e ? e.dataset.pw : null, document.querySelectorAll('#acts [data-pw]').length]; }); console.log('RETRY', JSON.stringify(r2)); } dead[c.label + '|' + c.kind + '|' + st.sig] = 1; if (++deadN > 3) { issue('dead taps: ' + c.kind + ' "' + c.label + '" (' + c.cls + ')'); break; } else issue('dead tap: ' + c.kind + ' "' + c.label + '" (' + c.cls + ')'); }
    }
    { const hst = await page.evaluate(() => GXH.state()); const dup = hst.shown.filter((x, i) => hst.shown.indexOf(x) !== i); if (dup.length) issue('bubble shown twice: ' + dup.join()); if (!H.tipsOn) { HT.tipsOffGames++; if (hst.shown.length) issue('tips off but bubbles shown: ' + hst.shown.join()); } }
    const fin = await page.evaluate(() => ({ over: !!(G && G.over), round: G && G.round, win: G && G.over && G.over.win, scores: G && G.over && G.over.scores.map(s => s.s.total), inv: G ? checkInvariants() : [] }));
    res.rounds = fin.round; res.won = fin.win ? fin.win.includes(0) : null; res.scores = fin.scores;
    if (!fin.over) issue('game did not finish within ' + STEP_CAP + ' steps / 8 s'); if (fin.inv.length) issue('final invariants: ' + fin.inv.join('; '));
    if (fin.over && !story) { const m = await page.evaluate(() => { const e = document.querySelector('#modal .mbox.over'); return e ? e.innerText.length : 0; }); if (!m) issue('no result screen'); }
    if (story) { await sleep(2500); const r = await page.evaluate(() => ({ res: !!document.querySelector('.gxc-res-on'), p: JSON.stringify(GXC.progress().ch) })); res.story = story + ' result screen ' + (r.res ? 'shown' : 'missing') + ' progress ' + r.p; if (!r.res && !/beaten/.test(r.p)) issue('story: no result screen'); }
  } catch (e) { issue('crash: ' + String(e.message).slice(0, 120)); }
  res.ms = Date.now() - t0; await ctx.close().catch(() => { }); return res;
}

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const jobs = []; for (let i = 0; i < N; i++) jobs.push({ idx: i, size: SIZES[i % 2], mode: MODES[i % MODES.length], seed: 100 + i });
  for (let k = 0; k < STORY; k++) jobs.push({ idx: N + k, size: SIZES[k % 2], mode: { np: 2 }, seed: 500 + k, story: ['c1', 'c4', 'c10', 'c5'][k % 4] });
  const out = [], q = (process.env.ONLY ? jobs.filter(j => process.env.ONLY.split(',').includes(String(j.idx))) : jobs).slice(); let fail = 0;
  await Promise.all(Array.from({ length: Math.min(JOBS, jobs.length) }, async () => { while (q.length) { const j = q.shift(); const r = await play(browser, j); out.push(r);
    const bad = r.issues.size || r.errors.length; if (bad) fail++;
    console.log(`${bad ? 'FAIL' : 'ok  '} #${r.idx} ${r.size} ${r.story ? 'story ' + j.story : r.mode} seed ${r.seed}: ${r.taps} taps, round ${r.rounds}, ${r.over ? 'finished' : 'NOT finished'}, ${(r.ms / 1000).toFixed(0)}s${r.scores ? ' scores ' + r.scores.join('/') : ''}${r.story && j.story ? ' ' + r.story : ''}`);
    for (const i of r.issues) console.log('     - ' + i); for (const e of [...new Set(r.errors)].slice(0, 4)) console.log('     ! ' + e); } }));
  await browser.close();
  const win = out.filter(r => !r.story && r.won != null), w = win.filter(r => r.won).length;
  console.log('help kit: bubbles per phase ' + JSON.stringify(HT.bubbles) + '; bulbs ' + HT.bulbs + ' (rules only ' + HT.bulbNull + ' ' + JSON.stringify(HT.nullWhy) + '), finger followed ' + HT.followed + ', rules opened ' + HT.rules + ', tips-off games ' + HT.tipsOffGames);
  console.log(`\n${out.length - fail}/${out.length} runs clean; ${out.filter(r => r.over).length} finished; random-tap player won ${w}/${win.length}`);
  process.exit(fail ? 1 : 0);
})();
