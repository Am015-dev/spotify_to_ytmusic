#!/usr/bin/env node
// STREET3 (parts/street/street3.js, flag RET.street3): one 2.5-3 min Zeil stage on one song, stepped time (FOOT.sim) with street2-test's human-style bot, no screenshots.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/street3-test.js     env: RUNS=4  GATE=0 (numbers only)
// Gates: (a) stage length 150-180 s (clears)  (b) threat curve monotonic, rising to its peak at 80-90% of the run  (c) frame rate per action within 10% of target
//        (idle 7 fps ping-pong, shots 12 fps)  (d) STREET RUN start: the first drawn frame is the painted street and no placeholder backdrop after it  (e) max upscale of a
//        sheet <= 1.1 at 1440x860 and 390x763 dpr2  (f) foes walk at <= 75% of street2  (g) one song, no lock/boss/clear switch  (h) 0 page errors
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME = process.env.GAME_DIR || path.resolve(__dirname, '../../../games/mainhattan-nightrun'), RUNS = +process.env.RUNS || 4, GATE = process.env.GATE !== '0';
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const res = [], ok = (p, n) => { res.push(!!p); console.log((p ? 'PASS ' : 'FAIL ') + n); };
const src = fs.readFileSync(path.join(__dirname, 'street2-test.js'), 'utf8'), RUN = src.slice(src.indexOf('const RUN = ') + 12, src.indexOf('\n(async () =>')).trim().replace(/;$/, '');   // the same bot as street2-test
const SEED = () => { try { localStorage.clear(); localStorage.setItem('mnr_story', JSON.stringify({ stars: { 1: 3, 2: 3, 3: 2 }, snap: {}, all: false, v30: 1, v40: 1 })); localStorage.setItem('mnr_tut', '2'); localStorage.setItem('mnr_foot', '{"seen":{"b":1,"a":1},"hint":1}'); } catch (e) {} };
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME], { stdio: 'ignore' });
  await sleep(700); const br = await PW.chromium.launch(), errs = [];
  const open = async (vp, dpr, q) => { const ctx = await br.newContext({ viewport: vp, deviceScaleFactor: dpr || 1, hasTouch: !!q && q.touch, isMobile: !!q && q.touch }); await ctx.addInitScript(SEED);
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1`, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && window.FOOT && FOOT.S3, null, { timeout: 20000 }); await sleep(400); return { ctx, p }; };
  // (d)+(e): the real start through the STREET RUN hold, drawn in real time
  const startLook = async (vp, dpr, touch) => { const { ctx, p } = await open(vp, dpr, { touch });
    const r = await p.evaluate(async () => { const t0 = performance.now(), fr = [], l0 = FOOT.S3.lit; RET.tale = false; FOOT.ui = 1; FOOT.start('zeil');
      await new Promise(done => { const tick = () => { const S = FOOT.S, on = FOOT.on && S && !document.getElementById('footQ');
          if (on) fr.push({ t: +((performance.now() - t0) / 1000).toFixed(2), paint: FOOT.look.paint, full: FOOT.S3.full, lit: FOOT.S3.lit, st: S.time });
          if (performance.now() - t0 > 12000 || (fr.length && fr[fr.length - 1].st > 2.5)) done(); else requestAnimationFrame(tick); }; tick(); });
      const drawn = fr.filter(f => f.lit > l0), first = drawn[0] || {}, after = fr.filter(f => f.full > 0), bad = after.filter(f => !f.paint).length;
      const at = [.2, .5, 1, 2].map(s => { const f = fr.find(q => q.st >= s) || {}; return s + 's:' + (f.paint ? 'painted' : 'placeholder') + '/' + (f.full ? 'sheets' : 'none'); });
      return { hold: (FOOT.q && FOOT.q.waited) | 0, first, bad, at, up: +FOOT.S3.up.toFixed(3), upKey: FOOT.S3.upKey, lit: FOOT.S3.lit, n: fr.length }; });
    await ctx.close(); return r; };
  const D = await startLook({ width: 1440, height: 860 }, 1), M = await startLook({ width: 390, height: 763 }, 2, true);
  for (const [n, r] of [['1440x860', D], ['390x763@2', M]]) console.log(`  ${n}: hold ${r.hold} ms, first frame ${r.first.paint ? 'painted' : 'PLACEHOLDER'}, frames ${r.n}, placeholder frames after first sheet ${r.bad}, ${r.at.join(' ')}, max upscale ${r.up} (${r.upKey}), lit frames ${r.lit}`);
  // (a)(b)(f)(g): stepped runs
  const { p } = await open({ width: 1440, height: 860 });
  const fps = await p.evaluate(() => { const ART = FOOT.S3.ART, out = {}; for (const k of ['kai/idle', 'knife/idle', 'gunman/idle', 'bruiser/idle', 'kai/shoot', 'gunman/shoot', 'kai/melee', 'kai/crouchshoot']) { if (!ART.ANIM.s[k]) continue;
      const o = ART.aS(k), lp = o.loop, T = lp ? 3 : o.tot; let ch = 0, last = ART.aframe(k, 0); for (let t = 1 / 480; t < T - 1e-4; t += 1 / 480) { const i = ART.aframe(k, t); if (i !== last) { ch++; last = i; } }
      out[k] = +((lp ? ch / T : (o.m[0]) / o.tot)).toFixed(2); } return out; });
  const sp = await p.evaluate(() => { const S0 = FOOT.S; RET.tale = false; FOOT.start('zeil'); const S = FOOT.S; S.P.hp = 99; const e = FOOT.env.spawn('rusher', S.camX + 700, null); e.grace = 0; const x0 = e.x; FOOT.sim(.5, 1 / 60); const v = Math.abs(e.x - x0) / .5; FOOT.stop && FOOT.stop(); return +v.toFixed(0); });
  const R = []; for (let i = 0; i < RUNS; i++) { const r = await p.evaluate(`(${RUN})(${4321 + i * 7919})`);
    const s3 = await p.evaluate(() => { const f = FOOT.S.s3 || {}; return { waves: (f.waves || []).map(w => [w.t, w.thr]), boss: f.boss, held: f.held, heals: f.healN | 0, hp: (f.hpLog || []).join(' '), intro: f.intro, song: FOOT.S3.song || 'stage2', bossOn: FOOT.S.bossOn, mp: window.__mp ? window.__mp.fk : '' }; });
    r.s3 = s3; R.push(r); console.log(`  run ${i + 1}: ${r.clear ? 'CLEAR' : 'down '} t=${r.time}s hp=${r.hp} kills=${r.kills} hurts=${r.hurts} broke=${r.broke} boss at ${s3.boss}s bossLife=${r.boss}s hits=${r.hlog} held=${s3.held} heals=${s3.heals} hp ${s3.hp} song=${s3.song}/${s3.mp}`); }
  const w = R[0].s3.waves, thr = w.map(x => x[1]), mono = thr.every((v, i) => !i || v >= thr[i - 1]), ct = R.filter(r => r.clear).map(r => r.time), med = ct.length ? ct.slice().sort((a, b) => a - b)[ct.length >> 1] : R[0].time, pk = w[thr.indexOf(Math.max(...thr))][0];
  console.log(`  threat curve (t s: threat): ${w.map(x => x[0] + ':' + x[1]).join(' ')}; intro ${R[0].s3.intro}s; peak at ${pk}s = ${(100 * pk / med).toFixed(0)}% of ${med}s`);
  console.log(`  frame rates: ${Object.entries(fps).map(([k, v]) => k + ' ' + v).join(', ')}; rusher walk ${sp} u/s (street2 300); clears ${ct.length}/${R.length} times ${ct.join(',')}; page errors ${errs.length}${errs.length ? ' ' + errs.slice(0, 2).join(' | ') : ''}`);
  if (GATE) {
    ok(ct.length > 0 && ct.every(t => t >= 150 && t <= 180), `(a) stage length ${ct.join(',')} s (150-180)`);
    ok(mono && pk / med >= .8 && pk / med <= .9 && thr[0] < thr[thr.length - 1], `(b) threat ${thr[0]} -> ${Math.max(...thr)} monotonic ${mono}, peak at ${(100 * pk / med).toFixed(0)}% (80-90)`);
    const tgt = k => /idle/.test(k) ? 7 : 12, fr = Object.entries(fps).filter(([k, v]) => Math.abs(v / tgt(k) - 1) > .1);
    ok(Object.keys(fps).length >= 6 && !fr.length, `(c) frame rate per action within 10% (${fr.map(x => x.join(' ')).join(', ') || 'all'})`);
    ok(D.first.paint && M.first.paint && !D.bad && !M.bad, `(d) first frame painted, placeholder frames after it ${D.bad}+${M.bad}`);
    ok(D.up <= 1.1 && M.up <= 1.1, `(e) max upscale ${D.up} / ${M.up} (<= 1.1)`);
    ok(sp <= 225, `(f) rusher walk ${sp} u/s (<= 75% of 300)`);
    ok(R.every(r => !/street1-/.test(r.s3.mp || '')), `(g) one song (${R.map(r => r.s3.song + '/' + r.s3.mp).join(' ')})`);
    ok(errs.length === 0, `(h) page errors ${errs.length}`);
  }
  await br.close(); srv.kill(); const f = res.filter(x => !x).length; console.log(f ? 'FAIL street3-test' : 'PASS street3-test'); process.exit(f ? 1 : 0);
})().catch(e => { console.log('FAIL street3-test ' + e.message); process.exit(1); });
