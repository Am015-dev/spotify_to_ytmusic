// Final Approach scenario lessons test (lessons.js on shell/gx-scenario-tutor.js). Model: tidewake/game/lessons-test.js.
//   node games-src/final-approach/game/lessons-test.js [sizes=402x874,1366x768]    prints PASS/FAIL + seconds, exit 1 on a problem.
//   env HTML=<built html> (default games-src/.staging/final-approach/index.html).
// Asserts: picker lists all 7 lessons; every lesson is solved by real taps (3 stars, no hint); every tap lands on the element tapped (the card never
// covers a die, slot or the action bar); a wrong move fails with a message and Retry restarts; on a phone the card sits clear of the trays; 0 JS errors.
// Machine speed: scripts/turbo.js (x100). Proof: games-src/final-approach/proof/
const PW = (() => { try { return require(process.env.PW_DIR || 'playwright'); } catch (e) { return require('../../node_modules/playwright'); } })();
const { turbo, budget } = require('../../scripts/turbo');
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(process.env.HTML || path.join(__dirname, '..', '..', '.staging', 'final-approach', 'index.html'));
const SIZES = (process.argv[2] || '402x874,1366x768').split(',').map(s => s.split('x').map(Number));
const PROOF = path.join(__dirname, '..', 'proof'); fs.mkdirSync(PROOF, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms)); const probs = [];
// scripted solutions: [die index, slot key]; 'plus' = tap the coffee "+" chip first
const SOLVE = {
  axis: [[0, 'ax0']], speed: [[0, 'en0']], radio: [[0, 'ra0'], [1, 'en0']], gear: [[2, 'lg1'], [0, 'lg2']],
  brakes: [[1, 'br0'], [0, 'br1']], coffee: [[1, 'co0'], [0, 'br0', 'plus']], touchdown: [[0, 'ax0'], [1, 'en0'], [2, 'br2'], [3, 'co1']]
};
const WRONG = { axis: [1, 'ax0'], speed: [1, 'en0'], radio: [1, 'en0'], gear: [2, 'en0'], brakes: [1, 'ax0'], coffee: [0, 'ax0'], touchdown: [2, 'en0'] };
async function run(b, W, H) {
  const tag = W + 'x' + H, phone = W < 600, note = m => probs.push(tag + ': ' + m);
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: phone, hasTouch: true });
  await turbo(ctx);
  await ctx.route('**/*', r => new URL(r.request().url()).host === 'fa.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
  const p = await ctx.newPage(); p.setDefaultTimeout(15000);
  p.on('pageerror', e => note('PAGE ERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load|favicon|ERR_/.test(m.text())) note('console error ' + m.text().slice(0, 140)); });
  await p.goto('https://fa.test/?lessons=1', { waitUntil: 'domcontentloaded' });
  if (process.env.V) console.log(tag, 'loaded');
  await p.waitForFunction(() => window.GXST && GXST.state() && GXST.state().phase === 'picker', null, { timeout: 30000 });
  const st = () => p.evaluate(() => GXST.state());
  const n = await p.evaluate(() => document.querySelectorAll('.gxst-pick').length);
  if (n !== 7) note('picker shows ' + n + ' lessons, want 7');
  await p.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-picker.png') });
  const tapSel = async (sel, what) => {
    const pt = await p.evaluate(sel => {
      const e = [...document.querySelectorAll(sel)].find(e => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4; }); if (!e) return null;
      const r = e.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, u = document.elementFromPoint(x, y);
      return { x, y, ok: !!u && (e === u || e.contains(u) || u.contains(e)), by: u ? (u.className || u.tagName) : 'none' };
    }, sel);
    if (!pt) { note('nothing to tap: ' + what); return false; }
    if (!pt.ok) note('something covers ' + what + ' (' + pt.by + ')');
    await p.touchscreen.tap(pt.x, pt.y); await sleep(120); return true;
  };
  const mv = async ([d, k, plus]) => {
    await tapSel('#pz .die[data-s="0"][data-d="' + d + '"]', 'die ' + d);
    if (plus) await tapSel('.chipb:not(.gxst-btn)', 'coffee +'), await p.evaluate(() => { const c = [...document.querySelectorAll('.chipb')].find(e => e.textContent.trim() === '+'); if (c) c.click(); });
    await tapSel('#pz .slot[data-slot="' + k + '"]', 'slot ' + k);
  };
  const start = async id => { await p.evaluate(i => GXST.start(i), id); await p.waitForFunction(id => { const s = GXST.state(); return s.id === id && s.phase === 'play' && s.live; }, id, { timeout: 20000 }).catch(() => note(id + ' did not start')); await sleep(150); };
  const geom = async id => {   // phone: card clear of the trays and the action bar; always inside the viewport
    const g = await p.evaluate(() => { const c = document.querySelector('.gxst-card'); if (!c) return null; const r = c.getBoundingClientRect(); const bad = [];
      document.querySelectorAll('#pz .tray, #pz .die, #pz .slot, #acts button, #acts .btn').forEach(e => { const q = e.getBoundingClientRect(); if (q.width < 4 || q.height < 4) return; if (Math.min(r.right, q.right) - Math.max(r.left, q.left) > 1 && Math.min(r.bottom, q.bottom) - Math.max(r.top, q.top) > 1) bad.push(e.className || e.tagName); });
      return { bad: bad.slice(0, 3), in: r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight }; });
    if (g && phone && g.bad.length) note(id + ': card covers ' + g.bad.join(','));
    if (g && !g.in) note(id + ': card outside the viewport');
  };
  const t0 = Date.now();
  for (const id of Object.keys(SOLVE)) {
    if (process.env.V) console.log(tag, id, ((Date.now() - t0) / 1000).toFixed(1));
    await start(id); await geom(id);
    if (WRONG[id]) {
      await mv(WRONG[id]);
      await p.waitForFunction(() => GXST.state().phase === 'fail', null, { timeout: 15000 }).then(async () => { const s = await st(); if (!/\w{4}/.test(s.msg || '')) note(id + ': fail has no message'); await geom(id + ' fail'); if (process.env.SHOTS) await p.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-' + id + '-fail.png') }); await p.evaluate(() => GXST.retry()); await p.waitForFunction(() => GXST.state().phase === 'play' && GXST.state().live, null, { timeout: 15000 }); }).catch(() => note(id + ': wrong move did not fail'));
      await sleep(150);
    }
    for (const m of SOLVE[id]) await mv(m);
    const won = await p.waitForFunction(() => GXST.state().phase === 'win', null, { timeout: 15000 }).then(() => true, () => false);
    const s = await st();
    if (!won) note(id + ': scripted solution did not win (phase ' + s.phase + ', ' + (s.msg || '') + ')'); else { if (s.stars !== 3) note(id + ': ' + s.stars + ' stars, want 3'); await geom(id + ' win'); }
    if (process.env.SHOTS) await p.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-' + id + '-win.png') });
  }
  console.log(tag + ': ' + ((Date.now() - t0) / 1000).toFixed(1) + ' s');
  await ctx.close();
}
(async () => {
  const stop = budget(150000, 'final-approach lessons');
  const b = await PW.chromium.launch();
  for (const [W, H] of SIZES) { const t = Date.now(); await run(b, W, H); if (Date.now() - t > 60000) probs.push(W + 'x' + H + ': over 60 s'); }
  await b.close(); clearTimeout(stop);
  console.log(probs.length ? 'FAIL\n' + probs.join('\n') : 'PASS'); process.exit(probs.length ? 1 : 0);
})();
