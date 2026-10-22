#!/usr/bin/env node
// B27 transitions + bank chip + count-up, B36 grade pops (real page, ?nomusic=1). PASS/FAIL lines; exit 1 on any FAIL.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/ret-trans-test.js     env: GAME_DIR=...
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const res = []; const ok = (n, p, i) => { res.push(p); console.log((p ? 'PASS ' : 'FAIL ') + n + (p || !i ? '' : ' :: ' + i)); };
const PHONE = { viewport: { width: 390, height: 763 }, hasTouch: true, isMobile: true };
const fin = () => { const m = window.__mnr; m.startStory(1); m.G.score = 123456; m.SH.neon = 40; m.SH.bankRun(); m.ST.fail(); return { score: fmtN(m.G.score), bank: m.GA.bank }; };
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', port, '--bind', '127.0.0.1'], { cwd: GAME_DIR, stdio: 'ignore' }); await sleep(800);
  const br = await PW.chromium.launch();
  async function open(opt, pre) {
    const ctx = await br.newContext(opt), p = await ctx.newPage(), errs = []; p.errs = errs; p.on('pageerror', e => errs.push(e.message)); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.addInitScript(() => { try { localStorage.setItem('mnr_tut', '1'); } catch (e) { } });
    await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1&tale=0`, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && window.RET && window.RET.pop); await sleep(500);
    if (pre) await p.evaluate(pre); return p;
  }
  // ---- flag on, phone
  let p = await open(PHONE);
  const anims = () => p.evaluate(() => document.getAnimations().filter(a => a.animationName === 'retIn').map(a => a.effect.getTiming().duration));
  const t0 = await p.evaluate(fin);
  const a1 = await anims();
  ok('fade runs on the game-over screen, 180 ms (<= 220)', a1.length === 1 && a1[0] <= 220, JSON.stringify(a1));
  const btnT = await p.evaluate(() => { const b = document.getElementById('againBtn'), r = b.getBoundingClientRect(); return r.width > 0 && getComputedStyle(b).pointerEvents !== 'none'; });
  ok('ONE MORE RUN is tappable while the fade runs', btnT);
  await sleep(300);
  ok('fade finished, screen not stuck (opacity 1)', (await anims()).length === 0 && await p.evaluate(() => getComputedStyle(document.getElementById('over')).opacity === '1'));
  // count-up and chip
  const mid = await p.evaluate(() => 0); await sleep(700);
  const e1 = await p.evaluate(() => ({ s: document.getElementById('oScore').textContent, c: document.querySelector('#over .retChip b').textContent, bank: fmtN(window.__mnr.GA.bank) }));
  ok('score count-up ends on the exact score', e1.s === t0.score, JSON.stringify([e1.s, t0.score]));
  ok('bank chip equals the wallet after a banked run', e1.c === e1.bank && t0.bank > 0, JSON.stringify(e1));
  // mid count (second run), tap skips
  await p.evaluate(() => { document.getElementById('againBtn').click(); }); await sleep(300);
  const t1 = await p.evaluate(fin); await sleep(250);
  const midv = await p.evaluate(() => document.getElementById('oScore').textContent);
  ok('count-up is mid-way after 250 ms', midv !== t1.score, midv);
  await p.evaluate(() => document.getElementById('over').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })));
  const skip = await p.evaluate(() => ({ s: document.getElementById('oScore').textContent, c: document.querySelector('#over .retChip b').textContent, b: fmtN(window.__mnr.GA.bank) }));
  ok('tap skips the count-up to the final values', skip.s === t1.score && skip.c === skip.b, JSON.stringify(skip));
  // stage clear + map
  await p.evaluate(() => { const m = window.__mnr; document.getElementById('againBtn').click(); m.startStory(1); m.ST.stars = [1, 1, 0]; m.G.score = 5000; m.ST.finish(); });
  await sleep(1100);
  ok('clear screen count-up + chip exact', await p.evaluate(() => document.getElementById('srScore').textContent === '5000' && document.querySelector('#stres .retChip b').textContent === fmtN(window.__mnr.GA.bank)));
  ok('map screen has the chip', await p.evaluate(() => { const e = document.getElementById('stsel'); return !!e.querySelector('.retChip'); }));
  // ONE MORE RUN timing
  await p.evaluate(fin); await sleep(700); const tr = Date.now();
  await p.tap('#againBtn'); await p.waitForFunction(() => window.__mnr.running && window.__mnr.ST.n === 1, null, { timeout: 3000 });
  ok(`ONE MORE RUN restarts in ${Date.now() - tr} ms (< 1000)`, Date.now() - tr < 1000);
  // grades
  const gr = await p.evaluate(() => {
    const m = window.__mnr, out = {};
    const run = (perf, hits) => { m.NR.emit('runStart', {}); m.G.live = true; m.G.dead = false; const g = window.RET.gr; for (let i = 0; i < 16; i++) { if (i === 8) { m.G.perf += perf; g.hits += hits; } m.NR.emit('bar', { i: i * 4, bar: i }); } return g.list.slice(); };
    out.perfect = run(60, 0); out.idle = run(0, 0); out.hurt = run(40, 3); out.mid = run(20, 1); out.popText = document.getElementById('retPop').textContent;
    window.RET.grade = false; out.off = run(60, 0); window.RET.grade = true; return out;
  });
  ok('perfect bot gets S', gr.perfect[0] === 'S', JSON.stringify(gr));
  ok('idle bot gets C', gr.idle[0] === 'C');
  ok('hits pull the grade down (S-level perfects, 3 hits -> B or lower)', 'BC'.includes(gr.hurt[0]));
  ok('grade B/A in between', 'AB'.includes(gr.mid[0]), gr.mid[0]);
  ok('grade flag off = no grade', gr.off.length === 0);
  const pop = await p.evaluate(() => { const m = window.__mnr; m.NR.emit('runStart', {}); m.G.live = true; const g = window.RET.gr; g.bar = 15; m.G.perf += 60; m.NR.emit('bar', { i: 64, bar: 16 });
    const e = document.getElementById('retPop'), r = e.getBoundingClientRect();
    const hit = ['bPause', 'bDash', 'bEmp'].map(id => document.getElementById(id)).filter(b => b && b.getClientRects().length).some(b => { const q = b.getBoundingClientRect(); return !(r.right < q.left || r.left > q.right || r.bottom < q.top || r.top > q.bottom); });
    return { on: e.classList.contains('on'), t: e.textContent, hit, dur: getComputedStyle(e).animationDuration, top: r.top, h: innerHeight }; });
  ok('grade pop shows the letter, <= 0.8 s, top area, clear of the touch buttons', pop.on && pop.t === 'S' && pop.dur === '0.75s' && !pop.hit && pop.top < pop.h * .3, JSON.stringify(pop));
  await sleep(900); ok('grade pop is gone after 0.9 s', await p.evaluate(() => !document.getElementById('retPop').classList.contains('on')));
  // overlap with the grade-pop and the other overlays' buttons while an overlay is open
  // cost
  const cost = await p.evaluate(() => { const m = window.__mnr; m.G.live = true; const f = () => { const t = performance.now(); for (let i = 0; i < 20000; i++) m.NR.emit('tick', .016); return (performance.now() - t) / 20000; };
    f(); const on = f(); const keep = window.RET.grade; return on; });
  ok(`per-frame cost of the tick hook ${cost.toFixed(4)} ms (<= 0.2)`, cost <= 0.2 + 0.0, cost);
  ok('no page errors (flag on)', !p.errs.length, p.errs[0]);
  await p.context().close();
  // ---- reduced motion
  p = await open({ ...PHONE, reducedMotion: 'reduce' });
  await p.evaluate(fin); await sleep(60);
  const rm = await p.evaluate(() => ({ cls: document.documentElement.className, an: document.getAnimations().length, s: document.getElementById('oScore').textContent, final: fmtN(window.__mnr.G.score), c: document.querySelector('#over .retChip b').textContent, b: fmtN(window.__mnr.GA.bank) }));
  ok('reduced motion: no fade, no count-up (values final at once)', !/rtr/.test(rm.cls) && rm.an === 0 && rm.s === rm.final && rm.c === rm.b, JSON.stringify(rm));
  await p.context().close();
  // ---- flags off
  p = await open(PHONE, () => { window.RET.trans = false; window.RET.grade = false; window.RET.syncMotion(); });
  const t2 = await p.evaluate(fin); await sleep(100);
  const off = await p.evaluate(() => ({ cls: document.documentElement.className, chip: !!document.querySelector('.retChip'), s: document.getElementById('oScore').textContent, an: document.getAnimations().filter(a => a.animationName === 'retIn').length, gr: !!document.getElementById('grO') }));
  ok('flags off = old game (no fade, chip, count-up, grades)', !/rtr/.test(off.cls) && !off.chip && off.s === t2.score && !off.an && !off.gr, JSON.stringify(off));
  ok('no page errors (flags off)', !p.errs.length, p.errs[0]);
  await br.close(); srv.kill();
  const bad = res.filter(x => !x).length; console.log(bad ? `${bad} FAIL` : 'ALL PASS'); process.exit(bad ? 1 : 0);
})().catch(e => { console.log('FAIL crash ' + e.stack); process.exit(1); });
