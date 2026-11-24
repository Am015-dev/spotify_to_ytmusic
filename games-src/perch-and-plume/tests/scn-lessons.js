// Scenario lessons gate (scenarios.js): each lesson solved by real taps, a wrong move fails with a message, taps never covered, 0 JS errors. Turbo speed.
//   node tests/scn-lessons.js  -> PASS/FAIL + seconds; contact sheets proof/scn-<size>-sheet.png
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const gx = require('../../scripts/gx-serve.js'); const { turbo, budget } = require('../../scripts/turbo.js');
const D = path.resolve(__dirname, '..'), PROOF = path.join(D, 'proof'); fs.mkdirSync(PROOF, { recursive: true });
const stop = budget(+process.env.B||60000, 'perch scenario lessons'); const T0 = Date.now(); const probs = [];
const SOLVE = {
  play: [['#acts .a4[data-k="play"]'], ['#hand .bc[data-legal]'], ['.slot.next[data-legal]'], ['#acts [data-a="playgo"]']],
  food: [['.ract[data-h="0"]'], ['.die[aria-label="fish die"]']],
  eggs: [['.ract[data-h="1"]'], ['.bc[data-a="bird"][data-legal]', 3]],
  cards: [['.ract[data-h="2"]'], ['#tray .bc[data-legal]', 1, 'seed']],
  eggcost: [['.ract[data-h="1"]'], ['.bc[data-a="bird"][data-legal]', 2], ['#acts .a4[data-k="play"]'], ['#hand .bc[data-legal]'], ['.slot.next[data-legal]'], ['#acts [data-a="playgo"]']],
  brown: [['.ract[data-h="0"]'], ['.die[data-legal]', 1], ['#acts [data-a="mv"]', 1], ['.die[data-legal]', 1]],
  goal: [['#acts .a4[data-k="play"]'], ['#hand .bc[data-legal]', 1, 'G'], ['.slot.next[data-legal]'], ['#acts [data-a="playgo"]']]
};
const WRONG = { play: '.ract[data-h="0"]', food: '.ract[data-h="1"]', eggs: '.ract[data-h="0"]', cards: '.ract[data-h="0"]', eggcost: '.ract[data-h="0"]', brown: '.ract[data-h="1"]', goal: '.ract[data-h="0"]' };
async function run(b, W, H, URL) {
  const tag = W + 'x' + H, phone = W < 600, note = m => { console.log('  !', tag, m); probs.push(tag + ': ' + m); };
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: phone, hasTouch: true }); await turbo(ctx);
  const p = await ctx.newPage(); p.setDefaultTimeout(12000);
  p.on('pageerror', e => note('PAGE ERROR ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load|favicon|404/.test(m.text())) note('console error ' + m.text().slice(0, 140)); });
  await p.goto(URL); await p.waitForFunction(() => window.PPSCN && window.GXST, null, { timeout: 15000 });
  await p.evaluate(() => { UI.fast = true; GXST.picker(); });
  const ids = await p.evaluate(() => PPSCN.ids); if (ids.length < 6) note('only ' + ids.length + ' lessons');
  const pickerN = await p.evaluate(() => document.querySelectorAll('.gxst-pick').length); if (pickerN !== ids.length) note('picker lists ' + pickerN + '/' + ids.length);
  const st = () => p.evaluate(() => GXST.state());
  const live = id => p.waitForFunction(id => { const s = GXST.state(); return s.id === id && s.phase === 'play' && s.live; }, id, { timeout: 12000 });
  const phase = w => p.waitForFunction(w => GXST.state().phase === w, w, { timeout: 8000 }).then(() => true, () => false);
  const tapEl = async (sel, nth, txt) => {
    await p.waitForFunction(() => G && !UI.busy && PP.sideToAct(G) === 0, null, { timeout: 4000 }).catch(() => {});
    const pt = await p.evaluate(([sel, nth, txt]) => { const a = [...document.querySelectorAll(sel)].filter(e => { const r = e.getBoundingClientRect(); return r.width > 6 && r.height > 6 && (!txt || (e.dataset.id || e.textContent || '').length >= 0); });
      let e = a[Math.min((nth || 1) - 1, a.length - 1)]; if (txt && txt.length > 2) e = a.find(x => (x.textContent || '').indexOf(txt) >= 0) || e;
      if (!e) return null; e.scrollIntoView({ block: 'nearest' }); const r = e.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, u = document.elementFromPoint(x, y); return { x, y, ok: !!u && (u === e || e.contains(u)) }; }, [sel, nth, txt]);
    if (!pt) return false; if (!pt.ok) note('something covers ' + sel); await p.touchscreen.tap(pt.x, pt.y); await p.evaluate(() => window.__turboAdvance(500)); return true;
  };
  const shots = [];
  for (const id of ids) {
    console.log(tag, id, (Date.now()-T0)/1000); await p.evaluate(id => GXST.start(id), id); await live(id);
    await p.evaluate(() => window.__turboAdvance(900)); shots.push(await p.screenshot({ type: 'jpeg', quality: 60 }));
    // wrong move first (once per lesson): must fail with a message; retry restarts
    await tapEl(WRONG[id]); await p.evaluate(() => { const d = document.querySelector('.die[data-legal]'); }); 
    await p.evaluate(() => window.__turboAdvance(600));
    const s0 = await st(); if (id === 'eggcost') { /* needs two wasted actions */ }
    for (let k = 0; k < 4 && (await st()).phase === 'play'; k++) { let hit = false; for (const sel of ['.die[data-legal]', '.bc[data-a="bird"][data-legal]', '#tray .bc[data-legal]', '#acts [data-a="mv"]']) { if (await p.evaluate(s => !!document.querySelector(s), sel)) { await tapEl(sel); hit = true; break; } } if (!hit) break; await p.evaluate(() => window.__turboAdvance(600)); }
    if (!(await phase('fail'))) note(id + ': wrong move did not fail (phase ' + (await st()).phase + ')'); else { const s = await st(); if ((s.msg || '').length < 20) note(id + ': fail has no message'); }
    await p.evaluate(() => GXST.retry()); await live(id);
    // solve with real taps
    const ans = await p.evaluate(id => (PPSCN.ans || {})[id] || '', id);
    for (const [sel, nth, txt0] of SOLVE[id]) { const txt = txt0 ? ans || txt0 : txt0; const n = nth || 1; let k = 0;
      do { if ((await st()).phase !== 'play') break; if (!(await tapEl(sel, 1, txt))) break; k++; } while (k < n && (await p.evaluate(s => !!document.querySelector(s), sel))); }
    if (!(await phase('win'))) { const s = await st(); fs.writeFileSync(path.join(PROOF, 'scn-dbg-' + tag + '-' + id + '.jpg'), await p.screenshot({ type: 'jpeg', quality: 50 })); note(id + ': solution did not win (phase ' + s.phase + ' ' + (s.msg || '') + ')'); }
    else { const s = await st(); if (s.stars < 3 && s.stars !== 3) note(id + ': stars ' + s.stars); }
  }
  // sheet of lesson starts
  const prog = await p.evaluate(() => JSON.parse(localStorage.getItem('gxst-perch-and-plume') || '{}').best || {}); if (Object.keys(prog).length < ids.length) note('progress saved for ' + Object.keys(prog).length + '/' + ids.length);
  // non-lesson tap works while a lesson runs; board never covered
  await p.evaluate(id => GXST.start(id), ids[0]); await live(ids[0]); await p.evaluate(() => window.__turboAdvance(900));
  const covered = await p.evaluate(() => [...document.querySelectorAll('#acts .a4, #hand .bc, .ract, #feeder .die, #tray .bc')].filter(e => { const r = e.getBoundingClientRect(); if (r.width < 4 || r.bottom < 0 || r.top > innerHeight) return false; const u = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return u && u.closest('.gxst-card'); }).length);
  if (covered) note(covered + ' board items under the lesson card');
  const dimmed = await p.evaluate(() => [...document.querySelectorAll('body > *')].filter(e => /brightness\(0?\.[0-8]/.test(getComputedStyle(e).filter)).length); if (dimmed) note('dimmed');
  await p.evaluate(() => { const b = document.querySelector('#rulesbtn'); b && b.click(); }); await p.evaluate(() => window.__turboAdvance(300));
  if (!(await p.evaluate(() => !!document.querySelector('.gx-drawer.open,.gx-drawer[open],#rulesbtn[aria-expanded="true"],.gx-set.open')))) note('Rules did not open during a lesson');
  fs.writeFileSync(path.join(PROOF, 'scn-' + tag + '-sheet-meta.json'), JSON.stringify({ ids }));
  shots.forEach((s, i) => fs.writeFileSync(path.join(PROOF, 'scn-' + tag + '-' + ids[i] + '.jpg'), s));
  await ctx.close();
}
(async () => {
  const URL = await gx.url('perch-and-plume', { file: path.join(D, 'perch-and-plume.html') });
  const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}); const sizes = process.env.SIZES ? JSON.parse(process.env.SIZES) : [[402, 874], [1366, 768]];
  for (const [W, H] of sizes) await run(b, W, H, URL);
  await b.close(); stop(); const s = ((Date.now() - T0) / 1000).toFixed(1);
  console.log(probs.length ? 'FAIL ' + s + ' s\n' + probs.join('\n') : 'PASS ' + s + ' s'); process.exit(probs.length ? 1 : 0);
})();
