#!/usr/bin/env node
// CLAIMS CHECK (W267): the texts players read equal what the game does. Prints PASS/FAIL lines only.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/claims-check.js   (uses the built games/mainhattan-nightrun/index.html)
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME = process.env.GAME_DIR || path.resolve(__dirname, '../../../games/mainhattan-nightrun');
const PARTS = path.resolve(__dirname, '../parts');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
let fails = 0; const ck = (ok, msg) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + msg); };
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME], { stdio: 'ignore' }); await sleep(600);
  const b = await PW.chromium.launch(), errs = [];
  const p = await b.newPage({ viewport: { width: 1000, height: 700 } }); p.on('pageerror', e => errs.push(e.message));
  await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&all=1&nomusic=1`); await p.waitForFunction(() => window.__mnr, null, { timeout: 20000 }); await sleep(1500);
  const r = await p.evaluate(() => {
    const M = __mnr, o = {}; M.startStory(1); for (let i = 0; i < 30; i++) M.step(1 / 60);
    // 1 dash capacitor: text numbers = ABIL.max() and ABIL.refill() at each level
    const dsh = M.TP_DEF.find(d => d.id === 'dsh'); o.dash = [];
    for (let l = 1; l <= 5; l++) { M.SH.dmax = l; const m = /(\d) dash charges, a charge back every ([\d.]+) s/.exec(dsh.t(l)); o.dash.push({ l, txt: dsh.t(l), tmax: m && +m[1], tref: m && +m[2], max: ABIL.max(), ref: +ABIL.refill().toFixed(2) }); } M.SH.dmax = 0;
    // texts
    o.pwd = M.TP_DEF.find(d => d.id === 'pwd').t(3); o.crt = M.TP_DEF.find(d => d.id === 'crt').t(4); o.dmg = M.TP_DEF.find(d => d.id === 'dmg').t(5);
    // 2 fifth-of-a-charge: under timing a dead-on-beat dash without a shot near gives no refund; with a shot it gives a whole charge
    const S = ABIL.st(), P = M.P; o.timing = TIM.on; S.n = 2; S.r = 0; M.G.eb.length = 0; TIM.dash({ ok: true, dt: 0, beat: 0 }, S); o.noShot = { n: S.n, r: S.r };
    S.n = 2; S.r = 0; M.G.eb.push({ x: P.x + 60, y: P.y, vx: 0, vy: 0, r: 4, dm: 1 }); TIM.dash({ ok: true, dt: 0, beat: 0 }, S); o.shot = { n: S.n, r: S.r }; M.G.eb.length = 0;
    // 3 EMP CHARGE: the meter fills x2 while the pickup runs
    const was = M.PW.on; const fill = on => { M.PW.on = k => on && k === 'empr'; const a = ABIL.st(); a.m = 0; M.P.emp = 0; ABIL.gain(.1); const v = a.m; return v; };
    const g0 = window.GRIT && GRIT.on; if (window.GRIT) GRIT.on = false;   // the grit meter rescales every EMP fill; measure the pickup's own doubling
    o.emp = { off: +fill(false).toFixed(4) }; for (let i = 0; i < 300; i++) M.step(1 / 60); M.P.emp = 0; o.emp.on = +fill(true).toFixed(4); if (window.GRIT) GRIT.on = g0;   // 5 s apart: the grit meter limits repeated fills M.PW.on = was;
    return o;
  });
  for (const d of r.dash) ck(d.tmax === d.max && Math.abs(d.tref - d.ref) <= .06, `dash text L${d.l} "${d.txt}" = ABIL.max ${d.max}, refill ${d.ref} s`);
  ck(/SLOW, MAGNET and TEMPO/.test(r.pwd), `Power Amp text names the kinds it speeds up: "${r.pwd}"`);
  ck(/up to 3x/.test(r.crt) && /above 2x counts half/.test(r.crt), `Critical Core text states the cap: "${r.crt}"`);
  ck(/counts half/.test(r.dmg), `Power Core text states the cap: "${r.dmg}"`);
  ck(r.timing === true && r.noShot.n === 2 && r.noShot.r === 0, `on-beat dash with no shot near: no refund (n ${r.noShot.n}, r ${r.noShot.r}); the old fifth-charge sentence is gone`);
  ck(r.shot.n === 3, `on-beat dash that parries a shot refunds a whole charge (n 2 -> ${r.shot.n})`);
  ck(r.emp.off > 0 && r.emp.on > r.emp.off, `EMP CHARGE: the meter charges faster (same hit fills ${r.emp.off} off, ${r.emp.on} on; the exact factor is rescaled by the grit meter, so the text names no number)`);
  // the damage cap the texts name (core/b.js DMG.hk / DMG.half)
  const bj = fs.readFileSync(path.join(PARTS, 'core/b.js'), 'utf8'), hk = /hk:(\d+)/.exec(bj), hf = /half:(\.?\d+)/.exec(bj);
  ck(hk && +hk[1] === 2 && hf && +hf[1] === .5, 'DMG.hit: damage above 2 counts half (the sentence in the shop texts)');
  ck(/up to x2 damage/.test(fs.readFileSync(path.join(PARTS, 'powers/arsenal.js'), 'utf8')), 'GLASS tip says "up to x2"');
  // street: the hint strip and a teaching note are really drawn (L.hud.hint is set only when the strip is drawn)
  const q = await b.newPage({ viewport: { width: 390, height: 763 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true }); q.on('pageerror', e => errs.push(e.message));
  await q.goto(`http://127.0.0.1:${port}/index.html?nomusic=1`); await q.waitForFunction(() => window.__mnr && window.FOOT, null, { timeout: 20000 }); await sleep(1500);
  const s = await q.evaluate(async () => { const M = __mnr, F = FOOT; for (let i = 0; i < 150 && !M.ART.anim('kai/run'); i++) await new Promise(r => setTimeout(r, 100));
    for (let i = 0; i < 100 && !(F.q && F.q.picsReady()); i++) await new Promise(r => setTimeout(r, 100)); M.RET.tale = false; try { localStorage.removeItem('mnr_guard'); } catch (e) {} F.start('zeil');
    const o = { purefoot: M.RET.purefoot }; await new Promise(r => setTimeout(r, 1500)); const L = F._in.L(); o.hint = L.hud && L.hud.hint ? F._in.hintText() : null;
    for (let i = 0; i < 100 && F.S.time < 3.4; i++) await new Promise(r => setTimeout(r, 100)); o.note = F.S.note.t > 0 ? F.S.note.txt : null; o.noteHint = L.hud && L.hud.hint ? 1 : 0; return o; });
  ck(s.purefoot && /Push the stick right/.test(s.hint || ''), `street (live purefoot look) draws the hint strip: "${s.hint}"`);
  ck(/GUARD: hold/.test(s.note || '') && s.noteHint === 1, `street draws the one-time GUARD note: "${s.note}"`);
  ck(errs.length === 0, 'no page errors ' + (errs[0] || ''));
  console.log(fails ? 'FAIL ' + fails : 'PASS all'); await b.close(); srv.kill(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log('FAIL ' + e.stack); process.exit(2); });
