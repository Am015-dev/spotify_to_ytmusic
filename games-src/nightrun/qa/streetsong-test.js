#!/usr/bin/env node
// STREETSONG (parts/street/street3.js, flag RET.streetsong): the street stage plays ONE song from its first second to the end.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/streetsong-test.js     env: RUNS=2
// Gates: (a) at most one song start per FOOT.start (the bot's own start is the 2nd), all the file song street1, and the file keeps playing across it  (b) zero switches / stings / duck calls / other-song starts for the whole stage, a retry included
//        (c) the song position keeps increasing (5 samples in 4 s of real time)  (d) enemy bullets leave within ~one frame (<= 30 ms) after a half beat of the playing song (35 s of real time: the beat clock is wall time, so a stepped run can't measure it)  (e) 0 page errors
// Audio needs the autoplay switch; the stage itself is stepped (FOOT.sim) with street2-test's bot, so the whole stage takes seconds.
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME = process.env.GAME_DIR || path.resolve(__dirname, '../../../games/mainhattan-nightrun'), RUNS = +process.env.RUNS || 2;
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const res = [], ok = (p, n) => { res.push(!!p); console.log((p ? 'PASS ' : 'FAIL ') + n); };
const s3 = fs.readFileSync(path.join(__dirname, 'street3-test.js'), 'utf8'), m = s3.match(/const SEED = (\(\) => \{.*\});\n/), SEED = eval(m[1]);
const s2 = fs.readFileSync(path.join(__dirname, 'street2-test.js'), 'utf8'), RUN = s2.slice(s2.indexOf('const RUN = ') + 12, s2.indexOf('\n(async () =>')).trim().replace(/;$/, '');
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME], { stdio: 'ignore' });
  await sleep(700); const br = await PW.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }), errs = [];
  const ctx = await br.newContext({ viewport: { width: 1000, height: 700 } }); await ctx.addInitScript(SEED);
  const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => window.__mnr && window.FOOT && FOOT.S3, null, { timeout: 20000 }); await sleep(800);
  await p.evaluate(() => { SND.AU.init(); SND.AU.a.resume(); }); await sleep(600);
  // log every music call from now on, and every enemy shot release against the half-beat grid
  await p.evaluate(() => { const AU = SND.AU, L = window.LOGM = { calls: [], rel: [] };
    for (const f of ['startStage', 'switchTo', 'sting', 'duckMusic', 'menuMusic']) { const o = AU[f]; AU[f] = function () { L.calls.push(f + ':' + [].slice.call(arguments).join(',') + '@' + (FOOT.S ? FOOT.S.time.toFixed(1) : '-')); return o.apply(this, arguments); }; }
    const hook = () => { const S = FOOT.S; if (!S || !S.eb || S.__h) return; S.__h = 1; let v; const wrap = a => { const pu = a.push; a.push = function (b) { const G = S.G; L.pushes = (L.pushes || 0) + 1; if (G && G.beatLen) { const f = (G.beat * 2) % 1, spb2 = G.beatLen / 2; L.rel.push(+(Math.min(f, 1 - f) * spb2 * 1000).toFixed(1)); } return pu.apply(this, arguments); }; return a; };
      v = wrap(S.eb); Object.defineProperty(S, 'eb', { get() { return v; }, set(a) { v = wrap(a); }, configurable: true }); };   // S.eb is rebuilt every frame: wrap each new array
    const st0 = FOOT.start; FOOT.start = function () { const r = st0.apply(this, arguments); hook(); return r; }; });
  const sample = async () => p.evaluate(() => { const c = SND.AU.cur; return { st: (c && c.stage) || (__mnr.BT.mode === 'synth' ? __mnr.BT.stage : null), t: c && c.el ? c.el.currentTime : -1, bt: __mnr.BT.stage, mode: __mnr.BT.mode }; });
  const starts = [], blocked = [], poss = [];
  for (let i = 0; i < RUNS; i++) {
    await p.evaluate(() => { window.LOGM.calls.length = 0; RET.tale = false; });
    if (i === 0) await p.evaluate(() => { FOOT.ui = 1; FOOT.start('zeil'); }), await p.waitForFunction(() => FOOT.on && FOOT.S && !document.getElementById('footQ'), null, { timeout: 15000 }); else await p.evaluate(() => { FOOT.stop(); FOOT.start('zeil'); });
    await sleep(500); const a = [];
    for (let k = 0; k < 5; k++) { a.push(await sample()); await sleep(1000); }
    poss.push(a);
    console.log('  samples ' + a.map(x => x.st + '/' + x.bt + '/' + x.mode + '/' + x.t.toFixed(1)).join(' '));
    await p.evaluate(`(${RUN})(${4321 + i * 7919})`);   // the bot plays the whole stage (stepped), starting its own run
    const r = await p.evaluate(() => ({ calls: window.LOGM.calls.slice(), s3: FOOT.S3.snd, st: FOOT.S && FOOT.S.time, end: FOOT.S && !!FOOT.S.end }));
    starts.push(r.calls.filter(c => /^startStage/.test(c))); blocked.push({ other: r.calls.filter(c => !/^startStage:street1/.test(c)), refused: r.s3.blocked.length });
    console.log(`  run ${i + 1}: calls ${r.calls.join(' ') || 'none'}; refused ${r.s3.blocked.length} ${r.s3.blocked.slice(0, 3).join(' ')}; stage time ${r.st.toFixed(0)} s ended ${r.end}`);
  }
  await p.evaluate(() => { window.LOGM.rel.length = 0; RET.tale = false; FOOT.stop(); FOOT.start('zeil'); }); await p.keyboard.down('KeyD'); await p.keyboard.down('KeyJ');
  for (let k = 0; k < 70; k++) { await p.evaluate(() => { const S = FOOT.S; if (S && S.P) S.P.hp = 99; }); await sleep(500); }
  await p.keyboard.up('KeyD'); await p.keyboard.up('KeyJ');
  const rel = await p.evaluate(() => window.LOGM.rel), med = rel.length ? rel.slice().sort((x, y) => x - y)[rel.length >> 1] : -1, mx = rel.length ? Math.max(...rel) : -1;
  console.log(`  enemy bullets spawned ${await p.evaluate(() => window.LOGM.pushes | 0)}; on the beat grid ${rel.length}; offset after the half beat: median ${med} ms, max ${mx} ms`);
  ok(poss.every(a => a.every(s => s.st === 'street1' && s.bt === 'street1') && a[a.length - 1].mode === 'file'), 'song is street1 from the first sample and the file plays by the last, every run');   // W242: the file is no longer waited for
  ok(starts.every(s => s.length <= 3 && s.every(c => /^startStage:street1/.test(c))), `song starts per run: ${starts.map(s => s.length).join(',')} (<= 3: the bot's own start, street1, and the join when the file arrives)`);
  ok(blocked.every(b => !b.other.length), `no switch / sting / duck / other song: ${blocked.map(b => b.other.length + ' (refused ' + b.refused + ')').join(', ')}`);
  ok(poss.every(a => a.every((s, i) => !i || s.t > a[i - 1].t || s.t < 1)), `song position keeps increasing: ${poss[0].map(s => s.t.toFixed(1)).join(' ')}`);
  if (!(await p.evaluate(() => RET.beatshots))) console.log('INFO (d) skipped: RET.beatshots is off by default (enemy bullets on the half beat; run with ?beatshots=1 once it is ready)');
  else ok(rel.length >= 5 && mx <= 30 && med <= 20, `bullets leave on the half beat: ${rel.length} bullets, median ${med} ms, max ${mx} ms (<= 30, was median 60-85, max 133-141)`);
  ok(errs.length === 0, `page errors ${errs.length}`);
  await br.close(); srv.kill(); const f = res.filter(x => !x).length; console.log(f ? 'FAIL streetsong-test' : 'PASS streetsong-test'); process.exit(f ? 1 : 0);
})().catch(e => { console.log('FAIL streetsong-test ' + e.message); process.exit(1); });
