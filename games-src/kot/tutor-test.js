// Crown City Smash: the staged tutorial (tutor.js + shell/gx-tutor.js). Plays it through the REAL page, doing exactly what each step asks.
//   NODE_PATH=/opt/node-tools/node_modules node tutor-test.js        env: FILE=kot2.html  ONLY=a,b,c,d,e,f,g   SHOTS=playtest
// a) 390x763 (touch), screenshots: early step, mid step, scoring step, end card -> playtest/tutor-*.png
// b) 375x553 (touch)       c) rotation: portrait -> landscape -> portrait part way, then on to the end
// d) leave and return: Skip half way, the menu says "Tutorial (continue?)" and the game is back to normal; start again and finish
// e) skip at once, then the menu shows "Tutorial" and a real game starts       f) fresh profile: the Story button runs Chapter 0, then "Start chapter 1"
// g) desktop 1280x800 (mouse)
// Per step it checks: title <= 4 words and text <= 20 words, the spotlight is on screen and its centre is not covered by anything of ours,
// the bubble is on screen and off the spotlight, a wrong tap does not advance (and shakes the bubble), the engine shows what the text says,
// nothing stays "pending" for more than 8 s, no page errors, nothing was saved, and the end card appears.
const PW = require('/opt/node22/lib/node_modules/playwright'), path = require('path'), fs = require('fs'), http = require('http');
const E = process.env, FILE = path.resolve(E.FILE || path.join(__dirname, 'kot2.html')), ONLY = (E.ONLY || 'a,b,c,d,e,f,g').split(',');
const LIVE = path.resolve(__dirname, '../../games/crown-city-smash'), SHOTS = path.resolve(E.SHOTS || path.join(__dirname, 'playtest'));
fs.mkdirSync(SHOTS, { recursive: true });
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]); const f = u === '/' ? FILE : path.join(LIVE, u);
  if ((!f.startsWith(LIVE) && f !== FILE) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.statusCode = 404; return r.end() }
  r.writeHead(200, { 'Content-Type': f.endsWith('.html') ? 'text/html' : f.endsWith('.webp') ? 'image/webp' : f.endsWith('.mp4') ? 'video/mp4' : f.endsWith('.json') ? 'application/json' : 'application/octet-stream' }); r.end(fs.readFileSync(f)) });
let BASE = '', bad = 0; const fail = (t, m) => { bad++; console.log('FAIL', t, m) }, ok = (t, m) => console.log('ok  ', t, m || '');
const words = t => String(t || '').replace(/[^a-zA-Z0-9'’+]+/g, ' ').trim().split(' ').filter(Boolean).length;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'];
async function open(b, w, h, { touch = true, ls = null, qs = '?phone=1' } = {}) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1 });
  if (ls) await ctx.addInitScript(l => { try { if (!sessionStorage.__s) { sessionStorage.__s = 1; for (const k in l) localStorage.setItem(k, l[k]) } } catch (e) { } }, ls);
  const p = await ctx.newPage(); p.setDefaultTimeout(60000); p.errs = []; p.touch = touch;
  p.on('pageerror', e => p.errs.push('pageerror ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load|favicon|fonts\.g|404|WebGL|certificate/i.test(m.text())) p.errs.push('console ' + m.text()) });
  await p.goto(BASE + '/' + qs); await p.waitForSelector('[data-start]'); await p.waitForTimeout(1200);
  await p.evaluate(() => { AIDELAY = 150 });
  return { ctx, p };
}
const tapAt = async (p, x, y) => { if (p.touch) await p.touchscreen.tap(x, y); else await p.mouse.click(x, y) };
const ST = p => p.evaluate(() => { const s = GXT.state(); return Object.assign({ running: GXT.running(), active: GXT.active(), W: innerWidth, H: innerHeight }, s) });
// the geometry checks for a step that is showing
async function checkShown(p, tag, s) {
  const t = s.title ? words(s.title) : 0; if (t > 4) fail(tag, s.id + ': title ' + t + ' words');
  if (words(s.say) > 20) fail(tag, s.id + ': text ' + words(s.say) + ' words: ' + s.say);
  if (!s.hole) { fail(tag, s.id + ': no spotlight'); return }
  for (const h of s.holes) {
    if (h.width < 8 || h.height < 8) fail(tag, s.id + ': spotlight tiny ' + Math.round(h.width) + 'x' + Math.round(h.height));
    if (h.cx < 0 || h.cy < 0 || h.cx > s.W || h.cy > s.H) fail(tag, s.id + ': spotlight off screen ' + Math.round(h.cx) + ',' + Math.round(h.cy));
  }
  const cov = await p.evaluate(hs => hs.map(h => { const e = document.elementFromPoint(h.cx, h.cy); return !e ? 'nothing' : e.closest('.gxt-clear') ? null : e.closest('.gxt-cell') ? 'cell' : e.closest('.gxt-bubble,.gxh-bubble,.gxt-end') ? 'bubble' : null }), s.holes);
  cov.forEach((c, i) => { if (c) fail(tag, s.id + ': spotlight ' + i + ' covered by ' + c) });
  const b = s.bubble; if (!b) { fail(tag, s.id + ': no bubble'); return }
  if (b.left < -1 || b.top < -1 || b.right > s.W + 1 || b.bottom > s.H + 1) fail(tag, s.id + ': bubble off screen ' + JSON.stringify(b));
  for (const h of s.holes) if (b.left < h.left + h.width && b.right > h.left && b.top < h.top + h.height && b.bottom > h.top) fail(tag, s.id + ': bubble covers the spotlight');
}
// a tap on something that is not the target must not advance the step
async function wrongTap(p, tag, s) {
  const pt = await p.evaluate(hs => { const cands = [...document.querySelectorAll('#dice .die,#pacts button,#pchips .pchip,#choice button,.gx-bar button,#pshop [data-shop],.gx-board')];
    for (const e of cands) { const r = e.getBoundingClientRect(); if (r.width < 4 || r.height < 4) continue; const x = r.left + r.width / 2, y = r.top + r.height / 2;
      if (hs.some(h => x > h.left - 10 && x < h.right + 10 && y > h.top - 10 && y < h.bottom + 10)) continue;
      const t = document.elementFromPoint(x, y); if (t && t.closest('.gxt-cell')) return { x, y } } return null }, s.holes.map(h => ({ left: h.left, top: h.top, right: h.left + h.width, bottom: h.top + h.height })));
  if (!pt) return;
  const before = await p.evaluate(() => JSON.stringify([G.phase, G.rolls, G.dice.map(d => d.f + (d.k ? 'k' : '')), G.active, P(0).vp, P(0).en, P(0).hp, G.market.join()]));
  await tapAt(p, pt.x, pt.y); await p.waitForTimeout(250);
  const s2 = await ST(p), after = await p.evaluate(() => JSON.stringify([G.phase, G.rolls, G.dice.map(d => d.f + (d.k ? 'k' : '')), G.active, P(0).vp, P(0).en, P(0).hp, G.market.join()]));
  if (s2.id !== s.id || s2.count !== s.count) fail(tag, s.id + ': a wrong tap moved the step on'); else if (!(s2.wrongs > s.wrongs)) fail(tag, s.id + ': a wrong tap did not shake the bubble');
  if (before !== after) fail(tag, s.id + ': a wrong tap changed the game ' + before + ' -> ' + after);
}
// what the engine shows must match what the text promises
async function checkFacts(p, tag, s) {
  const g = await p.evaluate(() => ({ vp: P(0).vp, en: P(0).en, hp: P(0).hp, city: G.city, cards: P(0).cards.slice(), dice: G.dice.map(d => d.f) }));
  const need = { score1: g.vp === 4 && g.en === 3 && g.city === 0, buy: g.en >= 3, end1: g.cards.includes('cosmic'), bonus: g.vp >= 6 && g.city === 0, score2: g.city === 0 && g.en === 2, score3: g.city !== 0 && g.hp >= 6 }[s.id];
  if (need === false) fail(tag, s.id + ': engine disagrees with the text ' + JSON.stringify(g));
}
async function doStep(p, tag, s, o) {
  if (o.wrong) await wrongTap(p, tag, s);
  if (!s.wait) { await p.evaluate(() => document.querySelector('.gxt-next').click()); return }
  const h = s.holes[Math.min(s.count, s.holes.length - 1)] || s.hole;
  await tapAt(p, h.cx, h.cy);
}
// run the tutorial to its end card (or stop at stopAt) and return the ids seen
async function drive(p, tag, o = {}) {
  const seen = []; let last = '', since = Date.now(), n = 0;
  const t0 = Date.now();
  for (;;) {
    if (Date.now() - t0 > 240000) { fail(tag, "tutorial took over 240 s"); return seen }
    const s = await ST(p);
    if (!s.running) return seen;
    if (s.phase === 'end') return seen;
    const key = s.id + ':' + s.phase + ':' + s.count;
    if (key !== last) { last = key; since = Date.now() } else if (Date.now() - since > 8000 && s.phase !== 'show') { fail(tag, s.id + ': stuck pending for 8 s'); await p.screenshot({ path: path.join(SHOTS, 'stuck-' + tag + '.png') }); return seen }
    if (s.phase !== 'show' || !s.shown) { await sleep(120); continue }
    if (!seen.includes(s.id)) { seen.push(s.id); n++; if (E.V) console.log('  step', s.id, Math.round((Date.now() - t0) / 1000) + 's');
      await sleep(300); let s1 = await ST(p); if (s1.id !== s.id || s1.phase !== 'show') continue;
      if (o.at) { const r = await o.at(p, s1, seen); if (r) { s1 = r } }
      if (o.shots && o.shots[s1.id]) { await sleep(500); await p.screenshot({ path: path.join(SHOTS, o.shots[s1.id]) }) }
      await checkFacts(p, tag, s1); await checkShown(p, tag, s1);
      if (p.errs.length) { fail(tag, 'page error ' + p.errs[0]); return seen }
      if (o.stopAt && s1.id === o.stopAt) return seen;
      await doStep(p, tag, s1, { wrong: true }); continue }
    // the same step again (a two-tap step, after the first tap)
    if (s.count > 0 || s.wait) { const s1 = await ST(p); if (s1.phase === 'show' && s1.shown && s1.id === s.id) await doStep(p, tag, s1, {}) }
  }
}
async function endCard(p, tag, label) {
  await p.waitForSelector('.gxt-end', { timeout: 15000 }).catch(() => { });
  const vis = await p.evaluate(() => { const e = document.querySelector('.gxt-end .gxt-endc'); if (!e) return null; const r = e.getBoundingClientRect(); return { ok: r.width > 100 && r.left >= 0 && r.right <= innerWidth + 1 && r.top >= 0 && r.bottom <= innerHeight + 1, btns: [...document.querySelectorAll('[data-gxt-end]')].map(b => b.textContent) } });
  if (!vis) fail(tag, 'no end card'); else if (!vis.ok) fail(tag, 'end card off screen'); else ok(tag, 'end card: ' + vis.btns.join(' | '));
  return vis;
}
const noSave = async (p, tag) => { const sv = await p.evaluate(() => localStorage.getItem('ccs_save2')); if (sv) fail(tag, 'the staged game was saved') };
const IDS = ['goal', 'keep', 'roll1', 'third', 'energy', 'roll2', 'done1', 'score1', 'shop', 'buy', 'end1', 'rivals', 'stay', 'bonus', 'done2', 'score2', 'sweep', 'end2', 'yield', 'done3', 'score3', 'finish'];
const shown = async (p, id, ms = 6000) => { const t0 = Date.now(); for (;;) { const s = await ST(p); if (s.running && s.id === id && s.phase === 'show' && s.shown) return s; if (Date.now() - t0 > ms) return null; await sleep(150) } };
async function full(b, tag, w, h, { touch = true, qs = '?phone=1', shots = null, mid = null, expectPhone = true } = {}) {
  const { ctx, p } = await open(b, w, h, { touch, qs }); const phone = await p.evaluate(() => PHONE.on);
  if (phone !== expectPhone) fail(tag, 'phone mode is ' + phone);
  const first = await p.evaluate(() => (document.querySelector('[data-gxt-open] b') || {}).textContent); if (!/New here/.test(first || '')) fail(tag, 'start screen does not offer the tutorial first: ' + first);
  await p.evaluate(() => document.querySelector('[data-gxt-open]').click()); await p.waitForTimeout(800);
  const t0 = Date.now(); const seen = await drive(p, tag, { shots, at: mid });
  const want = IDS.filter(i => phone || i !== 'shop');
  if (seen.join() !== want.join()) fail(tag, 'steps seen ' + seen.join() + ' want ' + want.join());
  await endCard(p, tag); if (shots) await p.screenshot({ path: path.join(SHOTS, shots.end || 'tutor-end.png') });
  await noSave(p, tag);
  const secs = Math.round((Date.now() - t0) / 1000);
  await p.evaluate(() => document.querySelector('[data-gxt-end="play"]').click()); await p.waitForTimeout(1500);
  const after = await p.evaluate(() => ({ g: !!G, tut: !!(G && G.tut), st: GXT.status('crown-city-smash'), n: G && G.pl.length, lab: GXT.label('crown-city-smash', false), on: document.documentElement.classList.contains('gxt-on'), cells: document.querySelectorAll('.gxt-cell,.gxt-end').length }));
  if (!after.g || after.tut) fail(tag, 'Play a real game did not start a real game ' + JSON.stringify(after)); if (!after.st.done) fail(tag, 'not marked done');
  if (after.on || after.cells) fail(tag, 'tutorial leftovers on the page ' + JSON.stringify(after));
  if (p.errs.length) fail(tag, 'page errors ' + p.errs.slice(0, 3).join(' | '));
  ok(tag, `${seen.length} steps in ${secs}s (AI delay 150ms), real game after: ${after.n} monsters, "${after.lab}"`);
  await ctx.close(); return seen.length;
}
(async () => {
  await new Promise(r => srv.listen(0, r)); BASE = 'http://localhost:' + srv.address().port;
  const b = await PW.chromium.launch({ args: ARGS });
  if (ONLY.includes('a')) await full(b, 'a:390x763', 390, 763, { shots: { keep: 'tutor-1-early.png', buy: 'tutor-2-mid.png', score1: 'tutor-3-scoring.png', end: 'tutor-4-end.png' } });
  if (ONLY.includes('b')) await full(b, 'b:375x553', 375, 553);
  if (ONLY.includes('c')) { // rotate: portrait -> landscape at the shop, back to portrait at the sweep, landscape again at the yield
    const rot = async (p, s, w, h, tag) => { await p.setViewportSize({ width: w, height: h }); await sleep(900);
      const s2 = await shown(p, s.id); if (!s2) { fail('c:rotate', s.id + ': step not showing after rotating to ' + w + 'x' + h); return null }
      await checkShown(p, 'c:rotate ' + w + 'x' + h, s2); return s2 };
    await full(b, 'c:rotate', 390, 763, { mid: async (p, s) => { if (s.id === 'buy') return rot(p, s, 844, 390); if (s.id === 'sweep') return rot(p, s, 390, 763); if (s.id === 'yield') return rot(p, s, 844, 390); } });
  }
  if (ONLY.includes('d')) { // leave half way and come back
    const tag = 'd:leave', { ctx, p } = await open(b, 390, 763);
    await p.evaluate(() => document.querySelector('[data-gxt-open]').click()); await p.waitForTimeout(800);
    await drive(p, tag, { stopAt: 'done2' }); const s = await ST(p);
    await p.evaluate(() => document.querySelector('.gxt-skip').click()); await p.waitForTimeout(800);
    const st = await p.evaluate(() => ({ run: GXT.running(), g: !!G, info: UI.info, lab: (document.querySelector('[data-gxt-open] b') || {}).textContent, on: document.documentElement.classList.contains('gxt-on'), cells: document.querySelectorAll('.gxt-cell').length, saved: localStorage.getItem('ccs_save2') }));
    if (st.run || st.g || !st.info || st.on || st.cells || st.saved) fail(tag, 'leaving left things behind ' + JSON.stringify(st)); else ok(tag, 'left at ' + s.id + ', menu: ' + st.lab);
    // back in: from a real game's menu, the entry restarts the tutorial from step 1
    await p.evaluate(() => document.querySelector('[data-gxt-open]').click()); await p.waitForTimeout(800);
    const s1 = await shown(p, 'goal', 8000); if (!s1) fail(tag, 'tutorial did not restart at step 1'); else await drive(p, tag, {});
    await endCard(p, tag); await noSave(p, tag); if (p.errs.length) fail(tag, 'page errors ' + p.errs.slice(0, 3).join(' | '));
    await ctx.close();
    { // a reload half way: the menu entry offers Restart or Exit
      const c2 = await open(b, 390, 763, { ls: { 'gxt-crown-city-smash': JSON.stringify({ open: 1, step: 7 }) } });
      const lab = await c2.p.evaluate(() => (document.querySelector('[data-gxt-open] b') || {}).textContent); if (lab !== 'Tutorial (continue?)') fail(tag, 'half-way label is "' + lab + '"');
      await c2.p.evaluate(() => document.querySelector('[data-gxt-open]').click()); await c2.p.waitForTimeout(500);
      const dlg = await c2.p.evaluate(() => [...document.querySelectorAll('[data-gxt-dlg]')].map(b => b.textContent));
      if (dlg.join() !== 'Restart tutorial,Exit') fail(tag, 'restart/exit dialog missing: ' + dlg.join()); else ok(tag, 'a reload half way offers: ' + dlg.join(' | '));
      await c2.ctx.close();
    }
  }
  if (ONLY.includes('e')) { // skip straight away, then a real game
    const tag = 'e:skip', { ctx, p } = await open(b, 390, 763);
    await p.evaluate(() => document.querySelector('[data-gxt-open]').click()); await shown(p, 'goal', 8000);
    await p.evaluate(() => document.querySelector('.gxt-skip').click()); await p.waitForTimeout(800);
    const lab = await p.evaluate(() => (document.querySelector('[data-gxt-open] b') || {}).textContent); if (lab !== 'Tutorial') fail(tag, 'menu label after skipping is "' + lab + '"'); else ok(tag, 'menu says "' + lab + '"');
    await p.evaluate(() => document.querySelector('[data-start="solo"]').click()); await p.waitForTimeout(2500);
    const g = await p.evaluate(() => ({ g: !!G, tut: !!(G && G.tut), n: G && G.pl.length, intro: UI.intro, cells: document.querySelectorAll('.gxt-cell').length }));
    if (!g.g || g.tut || g.cells || g.n !== 4) fail(tag, 'a real game after skipping: ' + JSON.stringify(g)); else ok(tag, 'real game after skipping: ' + JSON.stringify(g));
    if (p.errs.length) fail(tag, 'page errors ' + p.errs.slice(0, 3).join(' | '));
    await ctx.close();
  }
  if (ONLY.includes('f')) { // fresh profile: Story runs Chapter 0, then Start chapter 1; the second tap opens the map
    const tag = 'f:story', { ctx, p } = await open(b, 390, 763);
    await p.evaluate(() => document.querySelector('[data-camp="open"]').click()); await p.waitForTimeout(1000);
    const first = await shown(p, 'goal', 8000); if (!first) fail(tag, 'Story did not start the tutorial'); else await drive(p, tag, {});
    const vis = await endCard(p, tag); if (vis && vis.btns.join() !== 'Start chapter 1') fail(tag, 'end card buttons: ' + vis.btns.join());
    await p.evaluate(() => document.querySelector('[data-gxt-end="chapter"]').click()); await p.waitForTimeout(2500);
    const ch = await p.evaluate(() => ({ g: !!G, tut: !!(G && G.tut), gxc: !!document.querySelector('.gxc:not([hidden])'), camp: !!(window.GXC && GXC.active()), txt: (document.querySelector('.gxc') || { textContent: '' }).textContent.slice(0, 80) }));
    if (ch.tut || !(ch.gxc || ch.camp)) fail(tag, 'chapter 1 did not start ' + JSON.stringify(ch)); else ok(tag, 'chapter 1 starts: ' + JSON.stringify(ch));
    await p.evaluate(() => { try { GXC.close() } catch (e) { } UI.camp = null; G = null; UI.info = true; render() }); await p.waitForTimeout(500);
    await p.evaluate(() => document.querySelector('[data-camp="open"]').click()); await p.waitForTimeout(900);
    const map = await p.evaluate(() => ({ run: GXT.running(), gxc: !!document.querySelector('.gxc:not([hidden])'), tut: [...document.querySelectorAll('.gxc-ib')].map(b => b.textContent) }));
    if (map.run || !map.gxc || !map.tut.includes('Tutorial')) fail(tag, 'second Story tap should open the map with a Tutorial button ' + JSON.stringify(map)); else ok(tag, 'second Story tap opens the chapter map with a Tutorial button');
    await p.evaluate(() => [...document.querySelectorAll('.gxc-ib')].find(b => b.textContent === 'Tutorial').click()); const again = await shown(p, 'goal', 8000);
    if (!again) fail(tag, 'the chapter map Tutorial button did not replay it'); else ok(tag, 'replay from the chapter map works');
    if (p.errs.length) fail(tag, 'page errors ' + p.errs.slice(0, 3).join(' | '));
    await ctx.close();
  }
  if (ONLY.includes('h')) await full(b, 'h:844x390', 844, 390);
  if (ONLY.includes('g')) await full(b, 'g:1280x800', 1280, 800, { touch: false, qs: '?phone=0', expectPhone: false });
  await b.close(); srv.close(); console.log(bad ? 'TUTOR TEST FAILED ' + bad : 'TUTOR TEST PASS'); process.exit(bad ? 1 : 0)
})();
