// Guided first game, walked by touch (W500 gameplay gate). Fresh storage, Learn to play from the title, tap the centre of every spotlit target
// (after proving nothing covers it) or Next, to the end card, then "Play a real game". Checks per step: one sentence of <= 12 words, a highlighted
// target, steps in TUT_RULES order, every core rule step shown, the guided game reached a winner, a real (non-tutorial) game starts after, 0 errors.
// Usage: node tut-walk.js [w] [h] [shotsDir]     (default 390 844; shots tut-1..tut-N.png at each step)
const L = require('./playable/lib.js'), path = require('path'), fs = require('fs'), http = require('http');
const [W, H, SH] = [+process.argv[2] || 390, +process.argv[3] || 844, process.argv[4]];
const FILE = path.join(__dirname, 'kot2.html'), LIVE = path.resolve(__dirname, '../../games/crown-city-smash');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.glb': 'model/gltf-binary', '.json': 'application/json', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.css': 'text/css' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]); const f = u === '/' ? FILE : path.join(LIVE, u);
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return } r.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); r.end(d) }) });
(async () => {
  await new Promise(r => srv.listen(0, r)); const url = 'http://127.0.0.1:' + srv.address().port + '/';
  const b = await L.launch(), { p } = await L.open(b, W, H, url);
  const bad = [], seen = [], texts = {}; let last = '', n = 0;
  if (!await L.tapSel(p, '[data-gxt-open]')) throw new Error('no Learn to play button on the title screen');
  await L.sleep(1500);
  const rules = await p.evaluate(() => TUT_RULES), ids = await p.evaluate(() => tutSteps().map(s => s.id));
  const t0 = Date.now(); let since = Date.now(), guard = 0;
  while (Date.now() - t0 < 300000) {
    if (await p.evaluate(() => { const e = document.querySelector('[data-gxt-end]'); return !!(e && e.getBoundingClientRect().width) })) break;
    const st = await p.evaluate(() => (typeof GXT !== 'undefined' ? GXT.state() : { active: false }));
    if (!st || !st.active) { await L.sleep(300); if (++guard > 60) { bad.push('tutorial ended without an end card'); break } continue }
    if (st.id !== last) { last = st.id; since = Date.now() }
    if (Date.now() - since > 25000) { bad.push('stuck on step ' + st.id); break }
    if (!st.shown) { await L.sleep(200); continue }
    if (!seen.includes(st.id)) {
      seen.push(st.id); await L.sleep(450);
      const t = await p.evaluate(() => { const e = document.querySelector('.gxt-bub .gxh-tx, .gxt-bub p, .gxt-bub'); const tt = document.querySelector('.gxt-bub .gxh-tt, .gxt-bub b'); let s = e ? e.textContent : ''; if (tt) s = s.replace(tt.textContent, ''); return s.replace(/Next|Finish|Skip.*$/g, '').trim() });
      texts[st.id] = t;
      const words = t.split(/\s+/).filter(w => /[\p{L}\p{N}★⚡♥]/u.test(w)).length, sentences = (t.match(/[.!?](\s|$)/g) || []).length;
      if (words > 12) bad.push(`step ${st.id}: ${words} words "${t}"`);
      if (!st.hole) bad.push(`step ${st.id}: nothing highlighted`);
      if (SH) await p.screenshot({ path: `${SH}/tut-${++n}.png` });
      if (st.wait === 'tap' && st.hole) {
        const c = await p.evaluate(h => { const e = document.elementFromPoint(h.cx, h.cy); if (!e) return 'nothing'; if (e.closest('.gxt-ring,.gxt-top,[class*="gxh-"],#ccbanner')) return 'covered by ' + (e.className || e.tagName); return 'ok' }, st.hole);
        if (c !== 'ok') bad.push(`step ${st.id}: target centre ${c}`);
      }
    }
    if (st.wait === 'tap' && st.hole) {
      const hs = st.holes && st.holes.length ? st.holes : [st.hole]; const h = hs[Math.min(st.count || 0, hs.length - 1)];
      // R7: after one die is kept, the strong ring (first hole) must move to the die still to keep, never stay on the kept one
      if (st.id === 'keep' && st.count === 1) { const kept = await p.evaluate(h => { const e = document.elementFromPoint(h.cx, h.cy); const d = e && e.closest('[data-die]'); return d ? !!G.dice[+d.dataset.die].k : null }, hs[0]); if (kept !== false) bad.push('step keep: the strong ring stays on the kept die'); if (SH) await p.screenshot({ path: `${SH}/tut-keep-second.png` }) }
      await p.touchscreen.tap(h.cx, h.cy); await L.sleep(450);
    } else if (!st.wait) { await L.sleep(650); const nb = await p.evaluate(() => { const e = document.querySelector('.gxt-next'); if (!e) return null; const r = e.getBoundingClientRect(); return r.width ? [r.left + r.width / 2, r.top + r.height / 2] : null }); if (nb) await p.touchscreen.tap(nb[0], nb[1]); await L.sleep(400) }
    else await L.sleep(300);
  }
  const winner = await p.evaluate(() => !!(typeof G !== 'undefined' && G && G.winner && G.tut));
  if (SH) await p.screenshot({ path: `${SH}/tut-${++n}.png` });
  const order = rules.map(r => seen.indexOf(r[1]));
  rules.forEach((r, i) => { if (order[i] < 0) bad.push('rule never taught: ' + r[0]) });
  for (let i = 1; i < order.length; i++) if (order[i] >= 0 && order[i - 1] >= 0 && order[i] < order[i - 1]) bad.push('rule out of order: ' + rules[i][0]);
  const missing = ids.filter(i => !seen.includes(i)); if (missing.length) bad.push('steps never shown: ' + missing.join(','));
  if (!winner) bad.push('the guided game did not reach a winner');
  if (!await L.tapSel(p, '[data-gxt-end="play"]')) bad.push('no "Play a real game" button on the end card');
  else { await L.sleep(2500); const real = await p.evaluate(() => !!(typeof G !== 'undefined' && G && !G.tut && G.pl && G.pl.length >= 2)); if (!real) bad.push('no real game after the tutorial') }
  if (await p.evaluate(() => !!document.querySelector('.ppcoach.on, #ppcoach.on'))) bad.push('a coached-game bubble is still showing');
  if (p.errs.length) bad.push('errors: ' + p.errs.slice(0, 2).join(' | '));
  if (process.env.V) console.log(JSON.stringify(texts, null, 1));
  console.log((bad.length ? 'FAIL' : 'PASS') + ` tut-walk ${W}x${H} steps=${seen.length}/${ids.length} rules=${rules.length - order.filter(o => o < 0).length}/${rules.length} winner=${winner}` + (bad.length ? ' :: ' + bad.join('; ') : ''));
  await b.close(); srv.close(); process.exit(bad.length ? 1 : 0);
})().catch(e => { console.log('FAIL tut-walk', e.message); process.exit(1) });
