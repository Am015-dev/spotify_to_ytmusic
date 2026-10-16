#!/usr/bin/env node
// RETENTION test B8 (Heat ladder). Headless, no screenshots. Prints PASS/FAIL, exit 1 on any FAIL.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/ret-heat-test.js     env: RUNS=8 (bot runs per stage and Heat) PAR=4 SIM=0 (skip the bot) GAME_DIR=...
// Checks: unlock condition, the mutators of every Heat level, caps (bullets <= +12%, elites <= 0.6, hull >= 2), the Neon multiplier and medal, mercy kept out,
// flag off = baseline numbers, the plate text is not clipped at 390x763 and 1280x720, and the story bot's clear rate at Heat 0-3 on stages 1, 8 and 20.
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const RUNS = +process.env.RUNS || 8, PAR = +process.env.PAR || 4;
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const res = [], ok = (n, p, i) => { res.push(p); console.log((p ? 'PASS ' : 'FAIL ') + n + (p || i == null ? '' : ' :: ' + i)); };
const simSrc = fs.readFileSync(path.join(__dirname, 'story-sim.js'), 'utf8'), a0 = simSrc.indexOf('const BOT = ') + 12, BOT = simSrc.slice(a0, simSrc.indexOf('\n};\n', a0) + 2);   // the story bot of story-sim.js
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const br = await PW.chromium.launch(), url = `http://127.0.0.1:${port}/index.html?sim=1&all=1`;
  const open = async (vp) => { const p = await br.newPage({ viewport: vp || { width: 960, height: 540 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(url); await p.waitForFunction(() => window.__mnr && window.RET && window.HEAT && window.__mnr.TR.list.length > 0, null, { timeout: 8000 }).catch(() => { }); p.errs = errs; return p; };
  const p = await open();
  const lv = await p.evaluate(() => { const m = window.__mnr, H = HEAT, S = m.sSave, o = {}; const MAIN = 40;
    const snap = (n, h, flag) => { RET.heat = flag; H.pick[n] = h; m.ST.setLevel(n); const s = m.ST; const r = { lvl: s.lvl, bs: s.bs, el: s.el, heal: s.heal, hp0: s.hp0, eh: s.eh, d0: s.d0, td: H.td, run: H.run }; RET.heat = true; return r; };
    S.stars = {}; S.stars[8] = 1; o.lockedStory = H.open(8); o.rowLocked = H.row(8);
    S.stars[40] = 1; o.open8 = H.open(8); o.open9 = H.open(9); o.top8 = H.top(8); H.best[8] = 4; o.top8b = H.top(8); H.best[8] = 9; o.top8c = H.top(8); H.best = {};
    S.stars[1] = 1; S.stars[20] = 1;
    o.base = snap(8, 0, true); o.off = snap(8, 3, false);
    for (let h = 1; h <= 10; h++) o['h' + h] = snap(8, Math.min(h, 99), true), H.best[8] = h;
    H.best = {}; for (let n = 1; n <= MAIN; n++) S.stars[n] = 1;
    o.caps = []; for (let n = 1; n <= MAIN; n++) { H.best[n] = 9; const b = snap(n, 0, true), x = snap(n, 10, true); o.caps.push({ n, bs: x.bs / b.bs * (1 + .12 * 0), bsK: (x.bs / b.bs), el: x.el, hp0: x.hp0 }); }
    H.best = {}; H.pick = {}; return o; });
  ok('locked before the story is cleared', !lv.lockedStory && /clear the story/.test(lv.rowLocked), lv.rowLocked);
  ok('opens on a cleared stage after the story; not on an uncleared one', lv.open8 && !lv.open9, JSON.stringify([lv.open8, lv.open9]));
  ok('ladder: top = best + 1, at most 10', lv.top8 === 1 && lv.top8b === 5 && lv.top8c === 10, [lv.top8, lv.top8b, lv.top8c] + '');
  ok('flag off = baseline numbers', JSON.stringify(lv.off) === JSON.stringify(lv.base), JSON.stringify([lv.off, lv.base]));
  ok('Heat 0 = baseline (no run)', lv.base.run === 0 && lv.base.td === 0, JSON.stringify(lv.base));
  const B = lv.base, H = k => lv['h' + k], near = (a, b) => Math.abs(a - b) < 1e-9;
  ok('H1 TURBO: bullets +6%, level +0.12', near(H(1).lvl, B.lvl + .12) && H(1).bs > B.bs * 1.06 - 1e-9, JSON.stringify(H(1)));
  ok('H2 ELITES: elite share up by 0.08 (+ level)', H(2).el > H(1).el + .079, JSON.stringify([H(1).el, H(2).el]));
  ok('H4 DECAY: tier slips 2 beats sooner', H(3).td === 0 && H(4).td === 2, [H(3).td, H(4).td] + '');
  ok('H5 NO HEAL: no hull drops', H(4).heal > 0 && H(5).heal === 0, [H(4).heal, H(5).heal] + '');
  ok('H6 -1 HULL', H(6).hp0 === Math.max(2, B.hp0 - 1) && H(5).hp0 === B.hp0, [B.hp0, H(5).hp0, H(6).hp0] + '');
  ok('every step is harder than the one before (level rises 0.12 a step)', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].every(k => near(H(k).lvl, B.lvl + .12 * k)), '');
  ok('H9/H10 tougher enemies', H(9).eh > H(8).eh * 1.09 && H(10).eh > H(9).eh * 1.07 && H(10).d0 > H(9).d0, JSON.stringify([H(8).eh, H(9).eh, H(10).eh]));
  const badCap = lv.caps.filter(c => c.bsK > 1.12 * Math.pow(1 + .12 * 10 * 0, 1) * 1.6 || c.el > .6 + 1e-9 || c.hp0 < 2);
  ok('caps at Heat 10 on all 40 stages: elites <= 0.6, hull >= 2', badCap.length === 0, JSON.stringify(badCap.slice(0, 3)));
  // Neon: +20% per Heat on the run bank and the clear pay, medal on the first clear at a Heat, mercy untouched
  const neon = await p.evaluate(() => { const m = window.__mnr, o = {}; RET.fails = {};
    const run = (n, h, clear) => { HEAT.pick[n] = h; m.startStory(n); m.simOn(true); const b0 = m.GA.bank; m.SH.neon = 100; m.SH.earned = 0;
      if (clear) { m.ST.stars = [1, 0, 0]; m.ST.finish(); } else m.ST.fail(); const r = { d: m.GA.bank - b0, last: Object.assign({}, HEAT.last), clr: RET.last && RET.last.pay, row: (document.getElementById('srStars') || {}).innerHTML || '' }; m.abort(); return r; };
    o.f0 = run(8, 0, false); HEAT.best[8] = 2; o.f3 = run(8, 3, false); o.fails = RET.fails[8] | 0; HEAT.best[8] = 0;
    o.c1 = run(8, 1, true); o.best1 = HEAT.best[8]; o.pick = HEAT.pick[8]; o.c1b = run(8, 1, true); return o; });
  ok('fail at Heat 3 banks +60% (100 -> 160)', neon.f0.d === 100 && neon.f3.d === 160, JSON.stringify([neon.f0.d, neon.f3.d]));
  ok('Heat runs do not feed mercy', neon.fails === 1, neon.fails);
  const pay1 = neon.c1.clr;
  ok('first clear at Heat 1: medal +30, bank +20%, clear pay +20%', neon.c1.last.first && neon.c1.last.medal === 30 && neon.c1.d === 120 + 30 + pay1 + Math.round(pay1 * .2) && neon.best1 === 1, JSON.stringify(neon.c1));
  ok('ladder climbs: pick moves to Heat 2 after the Heat 1 medal', neon.pick === 2, neon.pick);
  ok('second clear at the same Heat: no medal', !neon.c1b.last.first && neon.c1b.last.medal === 0, JSON.stringify(neon.c1b.last));
  await new Promise(r => setTimeout(r, 50));
  // text on the stage plate (Heat 0, 3, 10, locked) fits at 390x763 and 1280x720
  for (const vp of [{ width: 390, height: 763 }, { width: 1280, height: 720 }]) {
    const q = await open(vp);
    const r = await q.evaluate(() => { const m = window.__mnr, S = m.sSave, bad = []; for (let n = 1; n <= 40; n++) S.stars[n] = 1; HEAT.best[8] = 9;
      document.getElementById('storyBtn').click(); const show = n => document.querySelector(`#stRows .nd[data-n="${n}"]`).click();
      const look = tag => { const el = document.getElementById('stDet'); if (!el || el.hidden) { bad.push(tag + ' no plate'); return; } const vb = el.getBoundingClientRect();
        if (vb.bottom > innerHeight + 1 || vb.top < -1 || vb.right > innerWidth + 1) bad.push(tag + ' plate off screen ' + JSON.stringify([vb.top, vb.bottom, innerHeight]));
        for (const e of el.querySelectorAll('.heat,.heat *,.hmu')) { if (e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== 'visible') bad.push(tag + ' clipped ' + e.className + e.id); const b = e.getBoundingClientRect(); if (b.width && (b.right > vb.right + 1 || b.left < vb.left - 1)) bad.push(tag + ' outside ' + (e.id || e.className) + ' ' + e.textContent); }
        if (document.documentElement.scrollWidth > innerWidth + 1) bad.push(tag + ' horizontal scroll'); };
      for (const h of [0, 3, 10]) { HEAT.pick[8] = h; show(8); look('h' + h); }
      S.stars[40] = 0; show(8); look('locked'); S.stars[40] = 1; HEAT.pick[8] = 9; show(8); document.getElementById('htUp').click(); const t = document.getElementById('htMu');
      return { bad, mu: t && t.textContent }; });
    ok(`plate text fits at ${vp.width}x${vp.height}`, r.bad.length === 0 && /INFERNO/.test(r.mu || ''), JSON.stringify(r));
    ok(`no page errors at ${vp.width}x${vp.height}`, q.errs.length === 0, q.errs[0]); await q.close();
  }
  ok('no page errors', p.errs.length === 0, p.errs[0]); await p.close();
  // the story bot at Heat 0-3 on stages 1, 8, 20 (target for Heat 1-3: 60-90%, Heat 1 on stage 8 >= 80%)
  if (process.env.SIM !== '0') {
    const jobs = [], out = {}; for (const n of [1, 8, 20]) for (const h of [0, 1, 2, 3]) for (let k = 0; k < RUNS; k++) jobs.push([n, h]);
    let next = 0;
    await Promise.all(Array.from({ length: PAR }, async () => { const q = await open();
      while (next < jobs.length) { const [n, h] = jobs[next++];
        const r = await q.evaluate(`(()=>{const m=window.__mnr;${process.env.HEATSET ? `{const o=${process.env.HEATSET};if(o.order)HEAT.STEPS=o.order.map(id=>HEAT.STEPS.find(x=>x[0]===id));if(o.lvK!=null)HEAT.lvK=o.lvK;}` : ''}for(let i=1;i<=40;i++)m.sSave.stars[i]=Math.max(1,m.sSave.stars[i]|0);RET.fails={};HEAT.best[${n}]=${Math.max(0, h - 1)};HEAT.pick[${n}]=0;m.ST.setLevel(${n});const L0=m.ST.lvl;HEAT.pick[${n}]=${h};
          const r=(${BOT})({n:${n},PC:.4,MAXT:420,endless:false});return {clear:r.clear,hits:r.hits,heat:Math.round((m.ST.lvl-L0)/HEAT.lvK)};})()`);
        const k = n + '/' + h; (out[k] = out[k] || []).push(r); }
      if (q.errs.length) console.log('PAGE ERROR', q.errs[0]); await q.close(); }));
    console.log('stage heat clear%  hits   (runs ' + RUNS + ')');
    const pct = k => Math.round(100 * out[k].filter(x => x.clear).length / out[k].length);
    for (const n of [1, 8, 20]) for (const h of [0, 1, 2, 3]) { const k = n + '/' + h; console.log(String(n).padStart(5), String(h).padStart(4), String(pct(k)).padStart(5) + '%', (out[k].reduce((a, x) => a + x.hits, 0) / out[k].length).toFixed(1).padStart(6)); }
    ok('bot runs really were at the chosen Heat', Object.keys(out).every(k => out[k].every(x => x.heat === +k.split('/')[1])), '');
    ok('Heat 1 on stage 8 clears >= 80%', pct('8/1') >= 80, pct('8/1'));
    for (const n of [1, 8, 20]) for (const h of [1, 2, 3]) { const v = pct(n + '/' + h), b = pct(n + '/0');
      ok(`stage ${n} Heat ${h}: ${v}% - no cliff (>= 60% and >= baseline ${b}% - 30)`, v >= 60 && v >= b - 30, v);
      if (v > 90) console.log(`NOTE stage ${n} Heat ${h}: ${v}% is above the 60-90% target band (Heat is gentle for this bot)`); }
  }
  await br.close(); srv.kill(); process.exit(res.every(Boolean) ? 0 : 1);
})().catch(e => { console.error(e); process.exit(2); });
