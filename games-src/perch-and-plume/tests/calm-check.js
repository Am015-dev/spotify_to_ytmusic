// Calm check (F1, Nov 2026): one helper at a time, no infinite animations. Runs the REAL tutorial from the title ("New here?"),
// tapping only Ottilie's marked target, then a Quick game with hints on (tapping the glowing / legal targets), then 15 s after the bulb.
// Every 0.5 s it counts helpers = distinct things that tell you what to do: a coach bubble (its marked target is part of it),
// a .tutpoint with no bubble, every visible .glow, every Best badge (.bestb) not on a glowing / marked element, the move rating (#rate).
// loops = visible elements running an infinite animation (document.getAnimations() + computed animation-iteration-count).
//   node tests/calm-check.js [stageDir=/tmp/x] [W=375] [H=667]      exit 1 if maxHelpers > 1 or loops > 0
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const gx = require(path.join(ROOT, 'scripts', 'gx-serve.js'));
const { chromium } = require(path.join(ROOT, 'node_modules', 'playwright'));
const STAGE = process.argv[2] || '/tmp/x', W = +(process.argv[3] || 375), H = +(process.argv[4] || 667);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SAMPLE = () => {
  const vis = e => { if (!e || !e.isConnected || e.closest('[hidden]')) return false; for (let x = e; x && x !== document.documentElement; x = x.parentElement) { const s = getComputedStyle(x); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity < 0.05) return false; } const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth; };
  const loops = new Set();
  for (const a of document.getAnimations()) { try { if (a.playState === 'running' && a.effect.getComputedTiming().iterations === Infinity && a.effect.target && vis(a.effect.target)) loops.add(a.effect.target); } catch (e) { } }
  for (const el of document.querySelectorAll('body *')) { const s = getComputedStyle(el); if (s.animationName !== 'none' && /infinite/.test(s.animationIterationCount) && s.animationPlayState !== 'paused' && vis(el)) loops.add(el); }
  const q = s => [...document.querySelectorAll(s)].filter(vis);
  const bub = q('.coachb'), tp = q('.tutpoint'), glow = q('.glow'), best = q('.bestb').map(b => { for (let x = b.parentElement; x; x = x.parentElement) if (x.classList.contains('glow') || x.classList.contains('tutpoint')) return x; return b.parentElement; }), rate = q('#rate');
  const name = e => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className ? '.' + e.className.trim().split(/\s+/).slice(0, 3).join('.') : '');
  const marked = new Set([...tp, ...glow]);
  const h = { bubble: bub.length, ring: bub.length ? 0 : tp.length, glow: glow.filter(e => !tp.includes(e)).length, best: best.filter(e => !marked.has(e)).length, rate: rate.length };
  const tot = h.bubble + h.ring + h.glow + h.best + h.rate; if (tot > 1) h.who = [...glow.map(name), ...best.filter(e => !marked.has(e)).map(e => 'best:' + name(e))].join(' ');
  return { helpers: tot, parts: h, loops: [...loops].map(name), step: window.GXCOACH && GXCOACH.step, mode: window.UI && UI.mode };
};
(async () => {
  const srv = await gx.startServer({ stage: STAGE }), base = srv.base.replace(/\/+$/, '');
  const b = await chromium.launch(), ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  const R = { maxH: 0, at: '', loops: 0, loopers: new Set(), steps: [], taps: 0 };
  const sample = async tag => { const s = await p.evaluate(SAMPLE).catch(() => null); if (!s) return s; if (s.helpers > R.maxH) { R.maxH = s.helpers; R.at = tag + ' ' + (s.step || '') + ' ' + JSON.stringify(s.parts); } if (s.loops.length > R.loops) R.loops = s.loops.length; s.loops.forEach(l => R.loopers.add(l)); return s; };
  const tapEl = async sel => { const c = await p.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().width > 2); if (!e) return null; e.scrollIntoView({ block: 'nearest' }); const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + Math.min(r.height / 2, 30) }; }, sel); if (c) { await p.touchscreen.tap(c.x, c.y); R.taps++; } return !!c; };
  const tapText = async re => { const c = await p.evaluate(src => { const re = new RegExp(src, 'i'); const e = [...document.querySelectorAll('button')].find(x => x.offsetParent && re.test(x.textContent)); if (!e) return null; e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, re.source); if (c) { await p.touchscreen.tap(c.x, c.y); R.taps++; } return !!c; };
  // 1) the real tutorial, fresh storage
  await p.goto(base + '/perch-and-plume/'); await p.evaluate(() => localStorage.clear()); await p.goto(base + '/perch-and-plume/'); await sleep(1500);
  await tapText(/new here|learn/); await sleep(1200);
  let last = null, t0 = Date.now();
  while (Date.now() - t0 < 150000) {
    const s = await sample('tutorial'); if (!s) break;
    if (s.step !== last) { last = s.step; R.steps.push(s.step); }
    if (s.mode !== 'tutfree' || s.step === null) break;
    if (s.step === 'real') { await tapEl('#result #again'); await sleep(1500); break; }
    const has = await p.evaluate(() => !!document.querySelector('.tutpoint'));
    if (has) { await tapEl('.tutpoint'); await sleep(450); } else { await sleep(500); }
  }
  // 2) the real game that follows (hints on by default): keep, then play by tapping the glow or a legal target
  await tapText(/keep these/); await sleep(1500);
  t0 = Date.now();
  while (Date.now() - t0 < 45000) {
    await sample('game'); await sleep(250);
    const mine = await p.evaluate(() => typeof myTurn === 'function' && myTurn() && !UI.busy).catch(() => false);
    if (!mine) { await sleep(250); continue; }
    if (!(await tapEl('.glow'))) if (!(await tapEl('[data-legal]'))) if (!(await tapEl('#acts [data-a="playgo"]'))) await tapEl('#acts [data-a="mv"]');
    await sleep(400);
  }
  // 3) the bulb: 15 s after a tap
  await tapEl('#bulbbtn'); for (let k = 0; k < 30; k++) { await sample('bulb'); await sleep(500); }
  console.log(`calm-check ${W}x${H}: tutorial steps ${R.steps.length} (${R.steps.join(' > ')}), taps ${R.taps}`);
  console.log(`maxHelpers=${R.maxH}${R.at ? ' at ' + R.at : ''} loops=${R.loops}${R.loopers.size ? ' [' + [...R.loopers].slice(0, 6).join(', ') + ']' : ''} errors=${errs.length}${errs.length ? ' ' + errs.slice(0, 2).join(' | ') : ''}`);
  console.log((R.maxH <= 1 && R.loops === 0 && !errs.length ? 'PASS' : 'FAIL') + ' calm-check');
  process.exitCode = R.maxH <= 1 && R.loops === 0 && !errs.length ? 0 : 1;
  await b.close(); try { srv.close(); } catch (e) { } process.exit(process.exitCode);
})();
