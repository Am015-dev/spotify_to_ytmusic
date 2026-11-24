// Hollowbough scenario lessons test (pattern of vale-of-banners/tools/lessons-test.js); machine speed (scripts/turbo.js).
//   node games-src/hollowbough/game/lessons-test.js [sizes=402x874,1366x768]   prints PASS/FAIL + seconds, exit 1 on a problem.
// Per lesson: a wrong move fails with a message, Retry restarts it, the scripted solution wins with 3 stars (real taps). Also: picker lists every
// lesson, hint nudge then show ring, minimise/drag/close/reopen, progress saved, 0 JS errors. Contact sheet: proof/lessons-<size>-sheet.jpg
const PW = (() => { try { return require('/opt/node-tools/node_modules/playwright'); } catch (e) { return require('playwright'); } })();
const fs = require('fs'), path = require('path'); const { turbo, budget, tick } = require('../../scripts/turbo');
const html = fs.readFileSync(path.join(__dirname, 'hollowbough.html'));
const SIZES = (process.argv[2] || '402x874,1366x768').split(',').map(s => s.split('x').map(Number));
const PROOF = path.join(__dirname, '..', 'proof'); fs.mkdirSync(PROOF, { recursive: true });
const probs = [], w = n => 'w:basic:' + n;
const SOLVE = {   // basic places: 0 berry patch, 1 dewberry, 3 pebble, 4 twig, 5 gossip, 6 resin
  twig: { wrong: [w(3)], right: [w(4)] },
  shared: { wrong: [w(6)], right: [w(0)] },
  forest: { wrong: [w(0)], right: ['w:forest:0'] },
  draw: { wrong: [w(0)], right: [w(1)] },
  points: { wrong: [w(3)], right: [w(5)] },
  build: { wrong: [w(4)], right: ['hand:bramble_allotment'] },
  meadow: { wrong: [w(4)], right: ['mead:reedpunt_toad'] },
  prepare: { wrong: [w(3)], right: [w(4), 'prep'] }
};
async function run(b, W, H) {
  const tag = W + 'x' + H, phone = W < 600, note = m => probs.push(tag + ': ' + m), shots = [];
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: phone, hasTouch: true }); await turbo(ctx);
  await ctx.route('**/*', r => (u => u.host === 'gns.test' ? (u.pathname === '/' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.fulfill({ status: 404, body: '' })) : r.abort())(new URL(r.request().url())));
  const p = await ctx.newPage(); p.setDefaultTimeout(15000);
  p.on('pageerror', e => note('PAGE ERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load|favicon/.test(m.text())) note('console error ' + m.text().slice(0, 140)); });
  await p.goto('https://gns.test/?lessons=1' + (phone ? '&phone=1' : ''));
  await p.waitForFunction(() => window.GXST && GXST.state() && GXST.state().open, null, { timeout: 20000 });
  await p.evaluate(() => { window.__ev = []; addEventListener('gxst', e => __ev.push(e.detail.type + ':' + (e.detail.id || ''))); });
  const st = () => p.evaluate(() => GXST.state());
  const resolve = async s => s.startsWith('hand:') || s.startsWith('mead:') ? p.evaluate(s => { const hand = s[0] === 'h', k = s.slice(5), ids = hand ? G.players[0].hand : G.meadow, id = ids.find(i => i >= 0 && HB.cardKey(i) === k); return id == null ? null : '[data-t="p:' + (hand ? 'hand' : 'meadow') + ':' + id + '"]'; }, s) : '[data-t="' + s + '"]';
  const where = sel => p.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(e => { const r = e.getBoundingClientRect(); return r.width > 8 && r.height > 8; }); if (!e) return null; e.scrollIntoView && e.scrollIntoView({ block: 'nearest', inline: 'nearest' }); const r = e.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2, u = document.elementFromPoint(x, y); return { x, y, ok: !!u && (u === e || e.contains(u) || u.contains(e)), by: u && (u.id || u.className) }; }, sel);
  const tapSel = async raw => {
    const sel = raw[0] === '[' || raw[0] === '.' || raw[0] === '#' ? raw : await resolve(raw); if (!sel) { note('no target for ' + raw); return false; }
    let pt = await where(sel); for (let k = 0; k < 6 && !pt; k++) { await tick(p, 400); pt = await where(sel); }
    for (let k = 0; k < 8 && pt; k++) { await tick(p, 300); const q = await where(sel); if (!q) { pt = q; break; } const still = Math.abs(q.x - pt.x) < 1 && Math.abs(q.y - pt.y) < 1; pt = q; if (still && pt.ok) break; }
    if (!pt) { note('nothing to tap: ' + sel); return false; } if (!pt.ok) note('something covers ' + sel + ' (' + pt.by + ')');
    await p.touchscreen.tap(pt.x, pt.y); await tick(p, 400); return true;
  };
  const myTurn = () => p.waitForFunction(() => G && G.phase !== 'over' && HB.actor(G) === 0 && !UI.animBusy && !UI.cards.length && !G.q, null, { timeout: 8000 }).then(() => true, () => false);
  const live = id => p.waitForFunction(id => { const s = GXST.state(); return s.id === id && s.phase === 'play' && s.live; }, id, { timeout: 20000 });
  const phase = (want, ms) => p.waitForFunction(w => GXST.state().phase === w, want, { timeout: ms || 12000 }).then(async ok => { await tick(p, 1500); return ok; }, () => false);
  const play = async steps => { for (const s of steps) { await myTurn(); await tapSel(s); } };
  let s = await st();
  const ids = Object.keys(SOLVE), n = await p.evaluate(() => document.querySelectorAll('.gxst-pick').length);
  if (s.phase !== 'picker' || n !== s.count || n < 6 || n !== ids.length) note('picker shows ' + n + ' of ' + s.count + ' lessons, test knows ' + ids.length);
  await p.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-picker.png') });
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i], tl = Date.now();
    await p.evaluate(id => GXST.start(id), id); await live(id).catch(() => note(id + ' did not start')); await tick(p, 1500);
    shots.push(await p.screenshot({ type: 'jpeg', quality: 70 }));
    if (!(await p.$('.gxst-card'))) note(id + ': no objective card');
    if (i === 0) {   // hint nudge then show-me ring (target must not sit under the card)
      if (phone) { if (!(await p.$('.gxst-chip'))) note('phone lesson does not start as a chip'); await tapSel('.gxst-chip'); }
      await tapSel('.gxst-bulb'); await tapSel('.gxst-bulb'); await tick(p, 600); s = await st();
      if (s.hint !== 2 || !s.target) note('show-me hint has no target'); if (s.overlap) note('card covers the hinted target');
      if (!(await p.$('.gxst-ring'))) note('no hint ring');
      await p.evaluate(id => GXST.start(id), id); await live(id); await tick(p, 400);
      await p.evaluate(() => { const b = JSON.parse(localStorage.getItem('gxst-hollowbough') || '{}'); b.best = {}; localStorage.setItem('gxst-hollowbough', JSON.stringify(b)); });
    }
    await play(SOLVE[id].wrong);
    if (!(await phase('fail', 14000))) { note(id + ': a wrong move did not fail'); await p.evaluate(() => GXST.retry()); }
    else {
      s = await st(); if (!/\w{4}/.test(s.msg || '') || !/\S/.test(await p.textContent('.gxst-msg'))) note(id + ': fail has no message');
      if (i === 0) await p.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-fail.png') });
      for (let k = 0; k < 4 && (await st()).phase === 'fail'; k++) await tapSel('.gxst-ft .pri');
    }
    await live(id).catch(() => note(id + ': Retry did not restart')); await tick(p, 1500);
    await play(SOLVE[id].right);
    if (!(await phase('win', 16000))) { s = await st(); note(id + ': scripted solution did not win (phase ' + s.phase + (s.msg ? ', ' + s.msg : '') + ')'); }
    else { s = await st(); if (s.stars !== 3) note(id + ': clean solve gave ' + s.stars + ' stars'); }
    if (i === 0) await p.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-win.png') });
    if (process.env.DBG) console.log('  lesson', id, ((Date.now() - tl) / 1000).toFixed(1) + 's');
  }
  s = await st(); if (Object.keys(s.best).length !== ids.length) note('progress saved for ' + Object.keys(s.best).length + '/' + ids.length);
  await tapSel('.gxst-hd .gxst-ib[aria-label="Minimise"]'); await tick(p, 1500); if (!(await st()).min || !(await p.$('.gxst-chip'))) note('minimise gave no chip');
  await tapSel('.gxst-chip'); await tick(p, 1500); if ((await st()).min) note('chip did not restore');
  await tapSel('.gxst-hd .gxst-ib[aria-label="Close"]'); if ((await st()).open || await p.$('.gxst-card')) note('close left the card');
  await tapSel('.gxst-q'); s = await st(); if (!s.open || s.phase !== 'picker') note('Lessons did not reopen the picker');
  const ev = await p.evaluate(() => __ev.join(',')); ['start', 'fail', 'retry', 'hint', 'win', 'close', 'picker'].forEach(t => { if (ev.indexOf(t + ':') < 0) note('no ' + t + ' event'); });
  const cols = phone ? 4 : 3, cw = phone ? 250 : 455, ch = Math.round(cw * H / W);
  const cells = shots.map((bf, i) => '<figure><img src="data:image/jpeg;base64,' + bf.toString('base64') + '"><figcaption>' + (i + 1) + ' ' + ids[i] + '</figcaption></figure>').join('');
  const sp = await ctx.newPage(); await sp.setViewportSize({ width: cols * (cw + 8) + 8, height: Math.ceil(shots.length / cols) * (ch + 30) + 8 });
  await sp.setContent('<style>body{margin:4px;background:#222;display:flex;flex-wrap:wrap;font:14px sans-serif;color:#fff}figure{margin:4px;width:' + cw + 'px}img{width:100%;display:block}figcaption{padding:2px}</style>' + cells);
  await sp.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-sheet.jpg'), type: 'jpeg', quality: 72, fullPage: true });
  await ctx.close();
}
(async () => {
  const stop = budget(120000, 'hollowbough lessons test');
  const b = await PW.chromium.launch();
  for (const [W, H] of SIZES) { const n = probs.length, t0 = Date.now(); await run(b, W, H).catch(e => probs.push(W + 'x' + H + ': CRASH ' + e.message.split('\n')[0])); console.log((probs.length === n ? 'PASS ' : 'FAIL ') + W + 'x' + H + ' ' + ((Date.now() - t0) / 1000).toFixed(1) + 's'); }
  await b.close(); probs.forEach(x => console.log('  ' + x)); process.exit(probs.length ? 1 : 0);
})();
