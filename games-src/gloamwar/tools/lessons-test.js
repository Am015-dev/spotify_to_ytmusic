// Gloamwar scenario lessons test (src/lessons.js). Machine speed (scripts/turbo.js).
//   node gloamwar/tools/lessons-test.js [sizes=402x874,1366x768]   prints PASS/FAIL + seconds, exit 1 on a problem.
// Asserts: picker lists every lesson; each lesson fails on a wrong move with a message, Retry restarts it, then the scripted solution wins with
// real taps (3 stars); lesson card never covers dice/actions/dock; hint nudge then ring; minimise/drag/close/reopen; progress saved; 0 JS errors.
const PW = (() => { try { return require('/opt/node-tools/node_modules/playwright'); } catch (e) { return require('playwright'); } })();
const fs = require('fs'), path = require('path'); const { turbo, budget, tick } = require('../../scripts/turbo');
const html = fs.readFileSync(path.join(__dirname, '..', 'gloamwar.html'));
const SIZES = (process.argv[2] || '402x874,1366x768').split(',').map(s => s.split('x').map(Number));
const PROOF = path.join(__dirname, '..', 'proof'); fs.mkdirSync(PROOF, { recursive: true });
const probs = [];
const D = f => '#mydice .die[data-f="' + f + '"]', A = k => '#acts .act[data-key="' + k + '"]', T = r => '[data-tap="s:' + r + '"]', K = (r, s) => '#tok-' + r + '-' + s;
const SOLVE = {
  walk: { wrong: [D('X'), A('skip')], right: [D('C'), A('cmove')] },
  hide: { wrong: [D('M'), A('skip')], right: [D('C'), A('chide')] },
  war: { wrong: [D('M'), A('dip'), A('dip-gr')], right: [D('M'), A('dip'), A('dip-au')] },
  march: { wrong: [D('X'), A('skip')], right: [D('X'), A('amove'), K('citadel', 'D'), T('crossing'), 'done:mvdone'] },
  fight: { wrong: [D('X'), A('skip')], right: [D('X'), A('attack'), K('ottercrag', 'G'), 'battle'] },
  muster: { wrong: [D('M'), A('recruit'), T('citadel'), A('rec-r')], right: [D('M'), A('recruit'), T('citadel'), A('rec-e')] },
  draw: { wrong: [D('M'), A('skip')], right: [D('E'), A('draw'), A('draw-DC')] }
};
async function run(b, W, H) {
  const tag = W + 'x' + H, phone = W < 600, note = m => probs.push(tag + ': ' + m), shots = [];
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: phone, hasTouch: true }); await turbo(ctx);
  await ctx.route('**/*', r => (u => u.host === 'gns.test' ? (u.pathname === '/' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.fulfill({ status: 404, body: '' })) : r.abort())(new URL(r.request().url())));
  const p = await ctx.newPage(); p.setDefaultTimeout(15000);
  p.on('pageerror', e => note('PAGE ERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load|favicon/.test(m.text())) note('console error ' + m.text().slice(0, 140)); });
  await p.goto('https://gns.test/?lessons=1');
  await p.waitForFunction(() => window.GXST && GXST.state() && GXST.state().open, null, { timeout: 20000 });
  await p.evaluate(() => { window.__ev = []; addEventListener('gxst', e => __ev.push(e.detail.type + ':' + (e.detail.id || ''))); });
  const st = () => p.evaluate(() => GXST.state());
  const where = sel => p.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(e => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4 && e.getClientRects().length; }); if (!e) return null; const r = e.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, u = document.elementFromPoint(x, y); return { x, y, ok: !!u && (e === u || e.contains(u) || u.contains(e) || !u.closest('.gxst-card,.gxst-chip')), by: u && (u.className && u.className.baseVal === undefined ? u.className : u.tagName) }; }, sel);
  const tapSel = async sel => {
    let pt = await where(sel); for (let k = 0; k < 6 && !pt; k++) { await tick(p, 300); pt = await where(sel); }
    for (let k = 0; k < 8 && pt; k++) { await tick(p, 250); const q = await where(sel); if (!q) { pt = q; break; } const still = Math.abs(q.x - pt.x) < 1 && Math.abs(q.y - pt.y) < 1; pt = q; if (still && pt.ok) break; }
    if (!pt) { note('nothing to tap: ' + sel); return false; } if (!pt.ok) note('something covers ' + sel + ' (' + pt.by + ')');
    await p.touchscreen.tap(pt.x, pt.y); await tick(p, 350); return true;
  };
  const live = id => p.waitForFunction(id => { const s = GXST.state(); return s.id === id && s.phase === 'play' && s.live; }, id, { timeout: 20000 });
  const phase = (want, ms) => p.waitForFunction(w => GXST.state().phase === w, want, { timeout: ms || 12000 }).then(async () => { await tick(p, 1200); return true; }, () => false);
  const step = async s => {
    if (s === 'battle') { for (let n = 0; n < 14; n++) { if (!(await p.evaluate(() => !!(G.pend && G.pend.h === 'battle')))) break; await tapSel('#battle .btn.pri') || await tapSel('#battle .btn'); await tick(p, 500); } return; }
    if (s.startsWith('done:')) { const k = s.slice(5); if (await p.$('#acts .act[data-key="' + k + '"]')) await tapSel(A(k)); return; }
    return tapSel(s);
  };
  const play = async steps => { for (const s of steps) await step(s); };
  let s = await st();
  const n = await p.evaluate(() => document.querySelectorAll('.gxst-pick').length), ids = Object.keys(SOLVE).filter(k => !process.env.ONLY || process.env.ONLY.split(',').includes(k));
  if (s.phase !== 'picker' || n !== s.count || n < 6 || n !== Object.keys(SOLVE).length) note('picker shows ' + n + ' of ' + s.count + ' lessons, test knows ' + Object.keys(SOLVE).length);
  await p.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-picker.png') });
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i], tl = Date.now();
    await p.evaluate(id => GXST.start(id), id); await live(id).catch(() => note(id + ' did not start')); await tick(p, 1500);
    shots.push(await p.screenshot({ type: 'jpeg', quality: 70 }));
    if (!(await p.$('.gxst-card'))) note(id + ': no objective card');
    const covered = await p.evaluate(() => [...document.querySelectorAll('#mydice .die, #acts .act, #tabs .tab, #hudL .rb, #cD, #cG, #cT')].filter(e => { const r = e.getBoundingClientRect(); if (r.width < 4 || !e.offsetParent) return false; const u = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return u && u.closest('.gxst-card,.gxst-chip') && !e.closest('.gxst-card'); }).map(e => e.id || e.className).slice(0, 4).join(','));
    if (covered) note(id + ': lesson card covers ' + covered);
    if (i === 0) {
      if (phone) { await tapSel('.gxst-chip'); await tick(p, 1500); }
      if (process.env.DBG) console.log('pre-bulb', JSON.stringify(await st()).slice(0, 200)); await tapSel('.gxst-bulb'); await tick(p, 1200); if (process.env.DBG) console.log('b1', JSON.stringify(await st()).slice(0, 120)); await tapSel('.gxst-bulb'); await tick(p, 600); s = await st(); if (process.env.DBG) console.log('b2', JSON.stringify(s).slice(0, 160));
      if (s.hint !== 2 || !s.target) note('show-me hint has no target'); if (s.overlap) note('card covers the hinted target');
      if (!(await p.$('.gxst-ring'))) note('no hint ring');
      await p.evaluate(id => GXST.start(id), id); await live(id); await tick(p, 400);
      await p.evaluate(() => { const b = JSON.parse(localStorage.getItem('gxst-gloamwar') || '{}'); b.best = {}; localStorage.setItem('gxst-gloamwar', JSON.stringify(b)); });
    }
    await play(SOLVE[id].wrong);
    if (!(await phase('fail', 14000))) note(id + ': a wrong move did not fail');
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
  const stop = budget(120000, 'gloamwar lessons test');
  const b = await PW.chromium.launch();
  for (const [W, H] of SIZES) { const n = probs.length, t0 = Date.now(); await run(b, W, H).catch(e => probs.push(W + 'x' + H + ': CRASH ' + e.message.split('\n')[0])); console.log((probs.length === n ? 'PASS ' : 'FAIL ') + W + 'x' + H + ' ' + ((Date.now() - t0) / 1000).toFixed(1) + 's'); }
  await b.close(); probs.forEach(x => console.log('  ' + x)); process.exit(probs.length ? 1 : 0);
})();
