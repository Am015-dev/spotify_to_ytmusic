#!/usr/bin/env node
// ABUP gate (parts/powers/abup.js, flag RET.abup): DASH / EMP upgrades + power-up interaction. Prints PASS/FAIL lines.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/abup-test.js
// 1 each upgrade buys (Garage ABILITY tab click + ABUP.buy), costs its Neon, persists over a reload
// 2 each upgrade applies: double hop after a beat dash only, trail after a beat dash, refund on PERFECT only (not GOOD, not off-beat), EMP reserve, wide EMP radii, salvage
// 3 EMP consumes the held power-up (stored charge, or a timed one with < half left; not one with > half left); the slot trade refills the dash, then cools down
// 4 caps: EMP <= 3 held (+1 reserve), dash charges <= max; a random masher with every upgrade gets no refund / double hop beyond the beat judge
// 5 ?abup=0: no tab, no slot chip, a PERFECT dash in empty air costs its charge even with every upgrade saved; no page errors
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
let fails = 0; const line = (ok, s) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + s); };
const READY = p => p.waitForFunction(() => window.__mnr && window.__mnr.TR.list.length > 0 && window.ABIL, null, { timeout: 10000 }).catch(() => { });
const IDS = ['dd', 'trail', 'pref', 'ecap', 'erad', 'econv'];

const BUY = () => {   // Garage UI click for the first upgrade, ABUP.buy for the rest
  const X = window.__abup, T = X.T, GA = T.GA, out = {}; GA.bank = 2000; T.gsave(); T.open('title'); const tab = document.querySelector('#garage .tabs button[data-t="abil"]'); out.tab = !!tab;
  if (tab) tab.click(); const c = document.querySelector('#gaCards [data-id="ab_dd"]'); out.card = !!c; const b0 = GA.bank; if (c) c.click(); out.clickCost = b0 - GA.bank; out.clickOwn = X.own.dd === 1;
  out.cards = document.querySelectorAll('#gaCards [data-kind="abup"]').length; let cost = 0; for (const id of ['trail', 'pref', 'ecap', 'erad', 'econv']) { const p = X.def(id).p, b = GA.bank; out[id] = X.buy(id) && b - GA.bank === p; cost += p; }
  out.again = X.buy('dd'); out.saved = JSON.parse(localStorage.getItem('mnr_abup') || '{}'); T.close(); return out;
};
const APPLY = () => {
  const m = window.__mnr, A = window.ABIL, X = window.__abup, T = window.TIM, out = {}, W0 = m.winMs();
  const to = k => { for (let i = 0; i < 800; i++) { const p = m.bpos(), f = p - Math.round(p), d = Math.abs(f) * m.BT.spb * 1000; if (k === 'pf' ? d < 10 : k === 'good' ? f > 0 && d > W0 * .75 && d < W0 * .92 : f > 0 && d > Math.max(200, W0 * 1.5)) return; m.step(1 / 240); } };
  const set = () => { m.startStory(3); m.simOn(true); m.god = true; m.G.en = []; m.G.eb = []; m.G.pk = []; m.G.waveT = 99; m.G.waveWait = 1; m.P.x = 200; m.P.y = 270; m.P.dx = 1; m.P.dy = 0; for (let i = 0; i < 5; i++) m.step(1 / 60); if (m.G.tm) { m.G.tm.em = 0; m.G.tm.pen = 0; m.G.tm.h = 0; m.G.tm.hl = 0; } A.st().n = A.max(); };
  const run = f => { for (let i = 0; i < f; i++) m.step(1 / 60); };
  const dash = k => { to(k); m.press('Dash'); run(1); };
  const foe = (x, y) => { const e = { type: 'drone', x, y, r: 14, hp: 60, max: 60, hq: 60, flash: 0, t: 0, bf: 99, bn: 0, gr: 0, tin: 0, score: 100, vx: 0, vy: 0, dummy: 1, by: y }; m.G.en.push(e); return e; };
  const cool = () => { run(40); if (m.G.tm) { m.G.tm.h = 0; m.G.tm.pen = 0; } };
  out.tm = !!(T && T.on);
  // refund: PERFECT empty air keeps the charge, GOOD and off-beat cost
  { set(); const n0 = A.st().n; dash('pf'); out.pfCost = n0 - A.st().n; cool(); A.st().n = A.max(); const n1 = A.st().n; dash('good'); out.goodCost = n1 - A.st().n; cool(); A.st().n = A.max(); const n2 = A.st().n; dash('off'); out.offCost = n2 - A.st().n; out.pref = X.stat.pref; m.abort(); }
  // double dash: a 2nd press within .35 s of a beat dash hops; after an off-beat dash it does not
  { set(); const d0 = X.stat.dd; dash('pf'); run(12); m.press('Dash'); run(1); out.dd = X.stat.dd - d0; cool(); A.st().n = A.max(); const d1 = X.stat.dd; dash('off'); run(12); m.press('Dash'); run(1); out.ddOff = X.stat.dd - d1; m.abort(); }
  // trail: a beat dash past a foe burns it
  { set(); const b0 = A.stat.burn, t0 = X.stat.trail; dash('good'); run(4); const tp = A.st().trail[0] || { x: 200, y: 270 }; m.P.x = 600; m.P.y = 120; foe(tp.x, tp.y); run(20); out.trail = X.stat.trail - t0; out.burn = A.stat.burn - b0; m.abort(); }
  // wide EMP radius
  out.er = T ? [T.ER[1], T.ER[2], T.ER[3]] : null;
  // reserve: with 3 held the meter fills a 4th that slots in after the next EMP
  { set(); m.P.emp = 3; for (let i = 0; i < 80 && !X.r().res; i++) { if (window.GRIT) GRIT.g().b = 1; A.gain(.3, 'graze'); } out.res = X.r().res; out.empHeld = m.P.emp;
    for (let i = 0; i < 20; i++) m.G.eb.push({ x: 220 + i * 6, y: 270, vx: -10, vy: 0, r: 5, dmg: 1 }); if (m.G.tm) m.G.tm.h = 0; m.press('Emp'); run(3); out.resIn = X.stat.resIn; out.empAfter = m.P.emp; m.abort(); }
  // salvage: a 14-bullet wipe pays score and drops a power-up
  { set(); m.P.emp = 3; for (let i = 0; i < 14; i++) m.G.eb.push({ x: 220 + i * 6, y: 270, vx: -10, vy: 0, r: 5, dmg: 1 }); const s0 = X.stat.sal, p0 = X.stat.salPk; m.press('Emp'); run(1); out.sal = X.stat.sal - s0; out.salPk = X.stat.salPk - p0; out.pkPw = m.G.pk.filter(p => p.t === 'pw').length; m.abort(); }
  // EMP consumes the stored charge (BUBBLE = defensive = SHIELD EMP)
  { set(); m.PW.give('bubble'); out.stored = !!(m.G.px && m.G.px.chg); m.P.emp = 3; for (let i = 0; i < 14; i++) m.G.eb.push({ x: 220 + i * 6, y: 270, vx: -10, vy: 0, r: 5, dmg: 1 }); const s0 = X.stat.shield; m.press('Emp'); run(1); out.shield = X.stat.shield - s0; out.storedAfter = !!(m.G.px && m.G.px.chg); out.inv = m.P.inv; m.abort(); }
  // a timed offensive power with > half left stays; with < half left it becomes a HOMING EMP
  { set(); m.PW.give('hornet'); m.P.emp = 3; for (let i = 0; i < 14; i++) m.G.eb.push({ x: 220 + i * 6, y: 270, vx: -10, vy: 0, r: 5, dmg: 1 }); const h0 = X.stat.homing; m.press('Emp'); run(1); out.fresh = m.PW.on('hornet') && X.stat.homing === h0;
    cool(); const a = m.G.pw.act.find(a => a.k === 'hornet'); if (a) a.s -= a.d * .7; foe(600, 270); m.P.emp = 3; for (let i = 0; i < 14; i++) m.G.eb.push({ x: 220 + i * 6, y: 270, vx: -10, vy: 0, r: 5, dmg: 1 }); if (m.G.tm) m.G.tm.em = 0; m.press('Emp'); run(1); out.homing = X.stat.homing - h0; out.hornetAfter = m.PW.on('hornet'); m.abort(); }
  // the slot: trade for a dash refill, then the cooldown, then (dash full) a new drop
  { set(); m.PW.give('stasis'); A.st().n = 0; const ok = X.trade(); out.trade = ok && A.st().n === A.max(); m.PW.give('lance'); out.cd = X.trade() === false; m.G.abx.cd = 0; const k0 = m.G.pk.length; out.spawn = X.trade() && m.G.pk.length === k0 + 1; out.chip = !!document.getElementById('bPwr'); m.abort(); }
  // pickup charges the dash refill a little
  { set(); A.st().n = 0; A.st().r = 0; X.T.emit('pickup', { t: 'pw', k: 'drum' }); out.pkr = +A.st().r.toFixed(2); m.abort(); }
  // caps + masher: real judge, a press every 3 frames for 12 s with every upgrade
  { set(); foe(500, 200); let eMax = 0, nMax = 0; const pf0 = T ? T.stat.pf : 0, g0 = T ? T.stat.good : 0, r0 = X.stat.pref, d0 = X.stat.dd;
    for (let i = 0; i < 720; i++) { if (i % 3 === 0) m.press('Dash'); if (i % 50 === 0) { m.P.emp = 3; m.press('Emp'); } if (window.GRIT) GRIT.g().b = 1; A.gain(.05, 'graze'); m.step(1 / 60); eMax = Math.max(eMax, m.P.emp); nMax = Math.max(nMax, A.st().n - A.max()); }
    out.eMax = eMax; out.nOver = nMax; out.mPref = X.stat.pref - r0; out.mPf = T ? T.stat.pf - pf0 : 0; out.mDd = X.stat.dd - d0; out.mBeat = T ? T.stat.pf - pf0 + T.stat.good - g0 : 0; m.abort(); }
  return out;
};
const OFF = () => {
  const m = window.__mnr, A = window.ABIL, W0 = m.winMs(); m.startStory(3); m.simOn(true); m.god = true; m.G.en = []; m.G.eb = []; for (let i = 0; i < 5; i++) m.step(1 / 60);
  if (m.G.tm) { m.G.tm.h = 0; m.G.tm.pen = 0; } A.st().n = A.max(); for (let i = 0; i < 800; i++) { const p = m.bpos(); if (Math.abs(p - Math.round(p)) * m.BT.spb * 1000 < 10) break; m.step(1 / 240); } const n0 = A.st().n; m.press('Dash'); m.step(1 / 60);
  const r = { on: window.__abup.on, tab: !!document.querySelector('#garage .tabs button[data-t="abil"]'), chip: !!document.getElementById('bPwr'), cost: n0 - A.st().n, er: window.TIM ? window.TIM.ER[1] : 0, g: !!m.G.abx }; m.abort(); return r;
};
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800)); const br = await PW.chromium.launch(); const U = q => `http://127.0.0.1:${port}/index.html?sim=1${q}`;
  let errs = 0; const ctx = await br.newContext({ viewport: { width: 960, height: 540 } });
  { const p = await ctx.newPage(); p.on('pageerror', e => { if (errs++ < 3) console.log('PAGE ERROR', e.message); }); await p.goto(U('&lessons=0')); await READY(p);
    await p.evaluate(() => { localStorage.removeItem('mnr_abup'); }); await p.reload(); await READY(p);
    const b = await p.evaluate(BUY);
    line(b.tab && b.card && b.cards === 6, `Garage ABILITY tab with ${b.cards} upgrade cards`);
    line(b.clickOwn && b.clickCost === 90, `DOUBLE DASH bought by a card tap for ${b.clickCost} Neon`);
    for (const id of ['trail', 'pref', 'ecap', 'erad', 'econv']) line(b[id], `${id} bought for its price`);
    line(!b.again, 'an owned upgrade is not sold twice');
    await p.reload(); await READY(p); const own = await p.evaluate(() => Object.assign({}, window.__abup.own));
    line(IDS.every(id => own[id] === 1), `all six persist over a reload (${Object.keys(own).join(',')})`);
    const o = await p.evaluate(APPLY);
    line(o.tm, 'timing.js is on (PERFECT / GOOD / off-beat judged by it)');
    line(o.pfCost === 0 && o.goodCost === 1 && o.offCost >= 1, `BEAT REFUND: PERFECT costs ${o.pfCost}, GOOD ${o.goodCost}, off-beat ${o.offCost} charge(s)`);
    line(o.dd === 1 && o.ddOff === 0, `DOUBLE DASH: 2nd hop after a beat dash ${o.dd}, after an off-beat dash ${o.ddOff}`);
    line(o.trail > 0 && o.burn > 0, `BURN TRAIL: ${o.trail} trail points, ${o.burn} burn ticks on a foe`);
    line(o.er && o.er[0] === 216 && o.er[1] === 432 && o.er[2] === 0, `WIDE EMP radii ${o.er}`);
    line(o.res === 1 && o.empHeld === 3 && o.resIn >= 1 && o.empAfter === 1, `EMP RESERVE: reserve ${o.res} with ${o.empHeld} held, slots in after the EMP (${o.empAfter} held)`);
    line(o.sal >= 14 && o.salPk === 1 && o.pkPw >= 1, `EMP SALVAGE: ${o.sal} bullets paid, ${o.salPk} power-up drop`);
    line(o.stored && o.shield === 1 && !o.storedAfter && o.inv >= 1.5, `EMP consumes the stored BUBBLE: SHIELD EMP ${o.shield}, i-frames ${o.inv.toFixed(2)}`);
    line(o.fresh && o.homing === 1 && !o.hornetAfter, `a fresh HORNETS stays (${o.fresh}); with < half left the EMP turns it into a HOMING EMP (${o.homing})`);
    line(o.trade && o.cd && o.spawn && o.chip, `slot: trade refills the dash ${o.trade}, cooldown ${o.cd}, dash full = new drop ${o.spawn}, chip ${o.chip}`);
    line(o.pkr > 0, `a power-up pickup charges the dash refill (${o.pkr})`);
    line(o.eMax <= 3 && o.nOver <= 0, `caps: EMP held at most ${o.eMax}, dash charges over max ${o.nOver}`);
    line(o.mPref <= o.mPf && o.mDd <= o.mBeat, `masher: refunds ${o.mPref} <= PERFECTs ${o.mPf}, double hops ${o.mDd} <= beat dashes ${o.mBeat}`);
    await p.close(); }
  { const p = await ctx.newPage(); p.on('pageerror', e => { if (errs++ < 3) console.log('PAGE ERROR', e.message); }); await p.goto(U('&abup=0&lessons=0')); await READY(p); const o = await p.evaluate(OFF);
    line(!o.on && !o.tab && !o.chip && o.cost === 1 && o.er === 160 && !o.g, `?abup=0 with every upgrade saved: no tab, no chip, PERFECT empty air costs ${o.cost}, EMP x1 radius ${o.er}`); await p.close(); }
  line(errs === 0, `no page errors (${errs})`);
  await br.close(); srv.kill(); console.log(fails ? `FAIL abup-test: ${fails} check(s)` : 'PASS abup-test'); process.exit(fails ? 1 : 0);
})();
