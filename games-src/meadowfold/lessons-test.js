// Meadowfold scenario lessons (src/lessons.js) test, pattern of vale-of-banners/tools/lessons-test.js, machine speed (scripts/turbo.js).
//   node games-src/meadowfold/lessons-test.js [sizes=402x874,1366x768]   prints PASS/FAIL + seconds, exit 1 on a problem. ONLY=pocket,stack filters lessons.
// Asserts: picker lists 6; every lesson fails on a wrong move with a message, Retry restarts it, then the scripted solution wins with 3 stars and no hint
// (real taps, elementFromPoint checked); hint twice shows the ring and the card does not cover the target; Rules opens mid-lesson; minimise / restore /
// close / reopen; progress saved; ?lesson=stack starts directly; 0 JS errors. Contact sheet of every lesson start: proof/lessons-<size>-sheet.jpg
const PW = (() => { try { return require('/opt/node-tools/node_modules/playwright'); } catch (e) { return require('playwright'); } })();
const fs = require('fs'), path = require('path'); const { turbo, budget, tick } = require('../scripts/turbo');
const html = fs.readFileSync(path.join(__dirname, 'meadowfold.html'));
const SIZES = (process.argv[2] || '402x874,1366x768').split(',').map(s => s.split('x').map(Number));
const PROOF = path.join(__dirname, 'proof'); fs.mkdirSync(PROOF, { recursive: true });
const probs = [];
// plan(e) runs in the page and returns tap steps; step kinds: {s:selector} tap, {k:'c,r'} tap hex, {h:n} select hand token n then see {k}
const IDS = ['pocket', 'stack', 'tree', 'fields', 'river', 'animal'];
const PLAN = () => {
  const nb = k => E.nb('A', k), all = [...document.querySelectorAll('#map .hx')].map(e => e.dataset.k), c = '2,2', n0 = nb(c)[0], n1 = nb(c)[1];
  const far = (avoid) => all.find(k => avoid.indexOf(k) < 0 && !avoid.some(a => nb(a).indexOf(k) >= 0));
  const place = (h, k) => [{ s: '.htok[data-h="' + h + '"]' }, { k }];
  const f1 = far([c]), f2 = far([c, f1]), f3 = far([c, f1, f2]);
  const a1 = n0, a2 = nb(a1).find(k => k !== c && nb(c).indexOf(k) < 0), a3 = nb(a2).find(k => k !== a1 && k !== c && nb(c).indexOf(k) < 0 && nb(a1).indexOf(k) < 0);
  return {
    pocket: { wrong: [{ s: '.pocket[data-pocket="0"]' }], right: [{ s: '.pocket[data-pocket="1"]' }, ...place(0, c), ...place(0, c), ...place(0, c)] },
    stack: { wrong: [...place(0, c), ...place(0, n0), ...place(0, n1)], right: [...place(0, c), ...place(0, c), ...place(0, c)] },
    tree: { wrong: [...place(2, c), ...place(0, n0), ...place(0, n1)], right: [...place(0, c), ...place(1, c), ...place(0, n0)] },
    fields: { wrong: [...place(0, c), ...place(0, f1), ...place(0, f2)], right: [...place(0, c), ...place(0, n0), ...place(0, f1)] },
    river: { wrong: [...place(0, f1), ...place(0, f2), ...place(0, f3)], right: [...place(0, a1), ...place(0, a2), ...place(0, a3)] },
    animal: { wrong: [{ s: '#endB' }], right: [{ s: '[data-row="0"]' }, { s: '#takeB' }, { s: '[data-ci="0"]' }, { s: '#map .hx.glow' }] }
  };
};
async function run(b, W, H) {
  const tag = W + 'x' + H, phone = W < 600, note = m => { probs.push(tag + ': ' + m); console.log('  NOTE', m); }, shots = [];
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: phone, hasTouch: true }); await turbo(ctx);
  await ctx.route('**/*', r => (u => u.host === 'gns.test' ? (u.pathname === '/' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.fulfill({ status: 404, body: '' })) : r.abort())(new URL(r.request().url())));
  const p = await ctx.newPage(); p.setDefaultTimeout(15000);
  p.on('pageerror', e => note('PAGE ERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load|favicon/.test(m.text())) note('console error ' + m.text().slice(0, 140)); });
  await p.goto('https://gns.test/');
  await p.waitForFunction(() => window.GXST && window.MFL && GXST.state(), null, { timeout: 20000 });
  await p.evaluate(() => { const s = document.getElementById('start'); if (s) s.hidden = true; GXST.picker(); });
  const st = () => p.evaluate(() => GXST.state());
  const where = sel => p.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(e => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4; }); if (!e) return null; const r = e.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, u = document.elementFromPoint(x, y); return { x, y, ok: !!u && (u === e || e.contains(u) || u.contains(e) || (u.closest && u.closest(sel) === e)), by: u && (u.id || u.className) }; }, sel);
  const tapSel = async sel => {
    let pt = await where(sel); for (let k = 0; k < 6 && !pt; k++) { await tick(p, 400); pt = await where(sel); }
    for (let k = 0; k < 8 && pt; k++) { await tick(p, 300); const q = await where(sel); if (!q) { pt = q; break; } const still = Math.abs(q.x - pt.x) < 1 && Math.abs(q.y - pt.y) < 1; pt = q; if (still && pt.ok) break; }
    if (!pt) { note('nothing to tap: ' + sel); return false; } if (!pt.ok) note('something covers ' + sel + ' (' + pt.by + ')');
    await p.touchscreen.tap(pt.x, pt.y); await tick(p, 400); return true;
  };
  const play = async steps => { for (const s of steps) { if (s.k) await tapSel('#map .hx[data-k="' + s.k + '"]'); else await tapSel(s.s); } };
  const phase = (want, ms) => p.waitForFunction(w => GXST.state().phase === w, want, { timeout: ms || 12000 }).then(async () => { await tick(p, 1500); return true; }, () => false);
  const live = id => p.waitForFunction(id => { const s = GXST.state(); return s.id === id && s.phase === 'play' && s.live; }, id, { timeout: 20000 });
  let s = await st(); const n = await p.evaluate(() => document.querySelectorAll('.gxst-pick').length), ids = IDS.filter(k => !process.env.ONLY || process.env.ONLY.split(',').includes(k));
  if (s.phase !== 'picker' || n !== 6) note('picker shows ' + n + ' lessons, expected 6');
  await p.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-picker.png') });
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    await p.evaluate(id => GXST.start(id), id); await live(id).catch(() => note(id + ' did not start')); await tick(p, 1500);
    shots.push(await p.screenshot({ type: 'jpeg', quality: 70 }));
    if (!(await p.$('.gxst-card'))) note(id + ': no objective card');
    if (i === 0) {
      const t0 = await p.evaluate(() => [...document.querySelectorAll('#map .hx, .pocket, #endB')].filter(e => { const r = e.getBoundingClientRect(); if (r.width < 4) return false; const u = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return u && u.closest && u.closest('.gxst-card'); }).length);
      if (t0) note(t0 + ' board items under the lesson card');
      await p.evaluate(() => GX.show('rulesd')); await tick(p, 400);
      if (!(await p.evaluate(() => !!document.querySelector('.gx-drawer.open, .gx-drawer[open], [data-gx="rulesd"][aria-expanded="true"]') || !!document.querySelector('.gx-drawer')))) note('Rules did not open mid-lesson');
      await p.keyboard.press('Escape'); await p.evaluate(() => { try { GX.close(); } catch (e) { } }); await tick(p, 300);
      if (phone && (await p.$('.gxst-chip'))) await tapSel('.gxst-chip');
      await tapSel('.gxst-bulb'); await tapSel('.gxst-bulb'); await tick(p, 600); s = await st();
      if (s.hint !== 2 || !s.target) note('show-me hint has no target'); if (s.overlap) note('card covers the hinted target');
      if (!(await p.$('.gxst-ring'))) note('no hint ring');
      await p.evaluate(id => GXST.start(id), id); await live(id); await tick(p, 400);
      await p.evaluate(() => { const b = JSON.parse(localStorage.getItem('gxst-meadowfold') || '{}'); b.best = {}; localStorage.setItem('gxst-meadowfold', JSON.stringify(b)); });
    }
    const plan = await p.evaluate('(' + PLAN.toString() + ')()');
    await play(plan[id].wrong);
    if (!(await phase('fail', 14000))) { note(id + ': a wrong move did not fail'); await p.evaluate(() => GXST.retry()); }
    else { s = await st(); if (!/\w{4}/.test(s.msg || '')) note(id + ': fail has no message'); for (let k = 0; k < 4 && (await st()).phase === 'fail'; k++) await tapSel('.gxst-ft .pri'); }
    await live(id).catch(() => note(id + ': Retry did not restart')); await tick(p, 1500);
    const plan2 = await p.evaluate('(' + PLAN.toString() + ')()');
    await play(plan2[id].right);
    if (!(await phase('win', 16000))) { s = await st(); note(id + ': scripted solution did not win (phase ' + s.phase + (s.msg ? ', ' + s.msg : '') + ')'); }
    else { s = await st(); if (s.stars !== 3) note(id + ': clean solve gave ' + s.stars + ' stars'); }
    if (i === 0) await p.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-win.png') });
  }
  s = await st(); if (Object.keys(s.best).length !== ids.length) note('progress saved for ' + Object.keys(s.best).length + '/' + ids.length);
  await tapSel('.gxst-hd .gxst-ib[aria-label="Minimise"]'); await tick(p, 1500); if (!(await st()).min || !(await p.$('.gxst-chip'))) note('minimise gave no chip');
  await tapSel('.gxst-chip'); await tick(p, 1500); if ((await st()).min) note('chip did not restore');
  await tapSel('.gxst-hd .gxst-ib[aria-label="Close"]'); if ((await st()).open || await p.$('.gxst-card')) note('close left the card');
  await tapSel('.gxst-q'); s = await st(); if (!s.open || s.phase !== 'picker') note('Lessons did not reopen the picker');
  const p2 = await ctx.newPage(); await p2.goto('https://gns.test/?lesson=stack'); await p2.waitForFunction(() => window.GXST && GXST.state() && GXST.state().id === 'stack' && GXST.state().phase === 'play', null, { timeout: 15000 }).catch(() => note('?lesson=stack did not start the lesson')); await p2.close();
  const cols = phone ? 3 : 3, cw = phone ? 250 : 455, ch = Math.round(cw * H / W);
  const cells = shots.map((bf, i) => '<figure><img src="data:image/jpeg;base64,' + bf.toString('base64') + '"><figcaption>' + (i + 1) + ' ' + ids[i] + '</figcaption></figure>').join('');
  const sp = await ctx.newPage(); await sp.setViewportSize({ width: cols * (cw + 8) + 8, height: Math.ceil(shots.length / cols) * (ch + 30) + 8 });
  await sp.setContent('<style>body{margin:4px;background:#222;display:flex;flex-wrap:wrap;font:14px sans-serif;color:#fff}figure{margin:4px;width:' + cw + 'px}img{width:100%;display:block}figcaption{padding:2px}</style>' + cells);
  await sp.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-sheet.jpg'), type: 'jpeg', quality: 72, fullPage: true });
  await ctx.close();
}
(async () => {
  const stop = budget(90000, 'meadowfold lessons test');
  const b = await PW.chromium.launch();
  for (const [W, H] of SIZES) { const n = probs.length, t0 = Date.now(); await run(b, W, H).catch(e => probs.push(W + 'x' + H + ': CRASH ' + e.message.split('\n')[0])); console.log((probs.length === n ? 'PASS ' : 'FAIL ') + W + 'x' + H + ' ' + ((Date.now() - t0) / 1000).toFixed(1) + 's'); }
  await b.close(); probs.forEach(x => console.log('  ' + x)); process.exit(probs.length ? 1 : 0);
})();
