#!/usr/bin/env node
// Nightrun POWER-UPS (flag RET.pw2): DRUM BURST reliability + six new timed powers. Real page in sim mode (?sim=1, stepped by hand), headless.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/ret-pw2-test.js     env: GAME_DIR=...
// 1 DRUM BURST: an auto-shot on EVERY beat of 8 bars (plain, after a hit, with a boss, frame stalls, FEVER, a power replaced); drum layer only while on
// 2 each new power: its effect measured (ghost shots, nova clears bullets, pickups pulled, wing shots, damage grows, shield absorbs once)
// 3 one timed power at a time, 8 bars, bullet caps held, drop table about as common as SLOW GROOVE
// 4 flag off = baseline (no new powers in the table, the old timer drum), HUD inside the viewport at 390x763 and 1280x720, no page errors
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const res = []; const ok = (n, p, i) => { res.push(p); console.log((p ? 'PASS ' : 'FAIL ') + n + (p || i === undefined ? '' : ' :: ' + i)); };
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const br = await PW.chromium.launch(); const errs = [];
  const open = async (vp, q = '') => {
    const p = await br.newPage({ viewport: vp }); p.on('pageerror', e => errs.push(e.message + ' @' + String(e.stack).split('\n').slice(1, 3).join(' '))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
    const pe0 = errs.push.bind(errs); errs.push = (x) => /slotFor/.test(x) ? errs.length : pe0(x);   // the fake AudioContext the test installs has no music slots
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&nomusic=1&hint=0${q}`);  /* obsolete-fixed: these checks read the old G.hint bubble; hints now go through the HINT pill queue (?hint=0 = the old bubble) */ await p.waitForFunction(() => window.__mnr && window.__mnr.RET, null, { timeout: 10000 }); return p;
  };
  const p = await open({ width: 390, height: 763 });
  const R = await p.evaluate(() => {
    const m = window.__mnr, out = {}, G = () => m.G, P = m.P, PW = m.PW, NR = window.NR, P2 = PW.p2;
    let fa = null; const fresh = () => { const sv = m.AU.a; m.AU.a = null; m.abort(); m.startStory(1); m.AU.a = sv; m.simOn(true); m.god = true; m.STILL.t = 0; window.localStorage.removeItem('mnr_pw2seen'); P2.seen = {}; };
    const pwErr = []; window.addEventListener('error', e => pwErr.push(String(e.error && e.error.stack || e.message).split('\n').slice(0, 4).join('|'))); out.pwErr = pwErr;
    const step = (n, f, dt = 1 / 60) => { for (let i = 0; i < n; i++) { if (f) f(i); m.STILL.t = 0; if (m.god) P.hp = P.max; G().pk = G().pk.filter(k => k.t !== 'pw'); if (G().boss && !m.keepBoss) G().boss = null; m.step(dt); } };
    const bars = [], beats = [], fires = []; NR.on('bar', () => bars.push(1)); NR.on('beat', d => beats.push(d.i)); NR.on('fire', f => fires.push(f.pf ? 1 : 0));
    // fake audio clock + counted synth calls so the drum layer can be measured without a real AudioContext
    let nOsc = 0, hits = [], clock = 0; m.AU.a = { state: 'running', get currentTime() { return clock; } }; m.AU.a.createGain = null; m.AU.osc = () => { nOsc++; }; m.AU.noise = () => { nOsc++; };
    const hit0 = PW.hit; PW.hit = function (n, t) { hits.push({ n, t, on: PW.on('drum'), now: clock }); hit0.call(this, n, t); };
    const runner = (f) => { for (let i = 0; i < 60 * 40; i++) { clock = G().t; step(1, f); if (done) break; } };
    let done = false;
    // ---- 1 drum reliability: auto-shot count == beat count while on, over 8 bars ----
    const drumRun = (label, opt = {}) => {
      fresh(); m.RET.fever = opt.fever !== false && m.RET.fever; if (opt.fever) { m.RET.fv.on = true; m.AU.fever = true; }
      m.keepBoss = !!opt.boss; if (opt.boss) { m.bossNow(); step(30); }
      PW.give('drum', false); const a = G().pw.act.find(x => x.k === 'drum'); const b0 = beats.length, au0 = PW.stat.auto, h0 = hits.length; let seen = 0, lastBeat = null, firedBeats = 0;
      const unsub = []; let auBefore = PW.stat.auto; const per = [];
      NR.on('beat', function h() { if (G().pw && PW.on('drum')) { seen++; per.push(PW.stat.auto); } });
      let n = 0, hurtAt = opt.hurt ? 40 : -1;
      for (let i = 0; i < 60 * 60 && G().pw && PW.on('drum'); i++) { clock = G().t; if (i === hurtAt) { m.god = false; P.inv = 0; P.hp = P.max; m.hurt(); m.god = true; }
        if (opt.resume && i === 120) { NR.emit('runStart', { resume: true }); PW.give('drum', false); }
        const dt = opt.stall && i % 20 === 0 ? 0.28 : 1 / 60; step(1, null, dt); n++; }
      const shots = PW.stat.auto - au0, beatsOn = beats.length - b0;
      out[label] = { shots, beatsOn, seen, h: hits.length - h0, alive: !!G().pw };
      m.keepBoss = false; m.RET.fv.on = false; m.AU.fever = false;
    };
    drumRun('plain'); drumRun('hit', { hurt: 1 }); drumRun('boss', { boss: 1 }); drumRun('stall', { stall: 1 }); drumRun('fever', { fever: 1 }); drumRun('resume', { resume: 1 });
    // drum layer audible only while on
    { fresh(); hits.length = 0; step(60 * 6); out.hitsOff = hits.length; PW.give('drum', false); hits.length = 0; const bb = beats.length; step(60 * 4); out.hitsOn = hits.length; out.beatsWin = beats.length - bb; const onBad = hits.filter(h => !h.on).length;
      step(60 * 40); const before = hits.length; step(60 * 6); out.hitsAfter = hits.length - before; out.hitsBad = onBad; }
    // grid: hits are on the song grid (BT.off included)
    { fresh(); hits.length = 0; PW.give('drum', false); step(60 * 3); const bt = m.BT; out.grid = hits.every(h => { const k = (h.t - (bt.t0 + bt.off)) / (bt.spb / 4); return h.t <= h.now + .0031 || Math.abs(k - Math.round(k)) < 1e-6; }); }
    // ---- 2 powers ----
    const give = (k) => { fresh(); PW.give(k, false); return G().pw.act.find(x => x.k === k); };
    // exclusivity + length
    { fresh(); PW.give('echo', false); PW.give('nova', false); out.ex1 = G().pw.act.map(a => a.k).join(); PW.give('drum', false); out.ex2 = G().pw.act.map(a => a.k).join(); PW.give('wing', false); out.ex3 = G().pw.act.map(a => a.k).join();
      out.len = G().pw.act[0].d; const b0 = bars.length; for (let i = 0; i < 60 * 90 && PW.on('wing'); i++) step(1); out.ended = !PW.on('wing'); out.barsLasted = bars.length - b0; }
    // tips: first time long, once
    { fresh(); PW.give('echo', false); out.tip1 = G().hint && G().hint.t; G().pw.act.length = 0; PW.give('echo', false); out.tip2 = G().hint && G().hint.t; out.tipTxt = G().hint.txt; }
    // ECHO
    { const a = give('echo'); const g0 = P2.stat.echo; const f0 = fires.length; step(60 * 8); const fp = fires.slice(f0).filter(x => x).length; out.echo = { ghosts: P2.stat.echo - g0, onBeatShots: fp }; }
    // NOVA: a bullet near the ship at a bar line is cleared, an enemy takes light damage
    { give('nova'); let cleared = 0, tried = 0, dmg = 0; const dummy = { type: 'drone', dummy: 1, x: P.x + 120, y: P.y, r: 16, hp: 1e6, max: 1e6, hq: 1e6, flash: 0, t: 0, bf: 99, bn: 0, gr: 0, tin: 0, by: P.y };
      const hp0 = dummy.hp; const nv0 = P2.stat.nova;
      let waitBar = bars.length; for (let i = 0; i < 60 * 12; i++) { clock = G().t; P.x = 150; P.y = 270; dummy.x = P.x + 120; dummy.y = P.y; dummy.hp = 1e6; dummy.dead = 0; if (!G().en.includes(dummy)) G().en.push(dummy); step(1); if (bars.length > waitBar) { waitBar = bars.length; tried++; const bullet = { x: P.x + 90, y: P.y, vx: 0, vy: 0, r: 5, c: '#f0f', k: 'n' }; G().eb.push(bullet); const before = G().eb.length; step(30); if (!G().eb.includes(bullet) || bullet.dead) cleared++; } }
      out.nova = { rings: P2.stat.nova - nv0, tried, cleared, dmg: hp0 - dummy.hp, hits: P2.stat.novaHit }; }
    // MAGNET BASS: a pickup 400 px away reaches the ship much sooner than without the power
    { const reach = (on) => { fresh(); P.x = 100; P.y = 270; if (on) PW.give('magb', false); const pk = { t: 'shard', x: 500, y: 270, vx: -70, vy: 0, bob: 0 }; G().pk.push(pk); let t = 0; for (; t < 60 * 20 && !pk.dead; t++) { P.x = 100; P.y = 270; step(1); } return t / 60; };
      out.magb = { off: reach(false), on: reach(true) }; }
    // WINGMATES: shots only on off-beats, about one volley per beat, two drones
    { give('wing'); const w0 = P2.stat.wing, b0 = beats.length; step(60 * 8); out.wing = { volleys: P2.stat.wing - w0, beats: beats.length - b0, drones: G().p2 && G().p2.wm.on }; }
    // CRESCENDO: x1.12 per bar, caps 1.6, a hit resets
    { const a = give('cres'); const ks = []; const b0 = bars.length; let last = -1; for (let i = 0; i < 60 * 40; i++) { clock = G().t; step(1); const n = bars.length - b0; if (n !== last) { last = n; ks.push(+P2.cresK().toFixed(2)); } if (!PW.on('cres')) break; }
      out.cres = ks; const a2 = give('cres'); step(60 * 12); const before = P2.cresK(); m.god = false; P.inv = 0; m.hurt(); m.god = true; out.cresReset = [before, P2.cresK()];
      fresh(); PW.give('cres', false); step(60 * 12); const dm0 = G().pb.length; const n0 = G().pb.length; m.SH.volley(P.x + 22, P.y, 0); out.cresDm = G().pb.slice(n0).map(b => b.dm); }
    // CHORD SHIELD: first hit absorbed, released on the next beat, second hit lands
    { const a = give('chord'); const P = m.P; m.SH.sh = 0; step(60 * 3); P.hp = P.max; m.god = false; P.inv = 0; const hp0 = P.hp; m.hurt(); const hp1 = P.hp; const used = a.used; const b0 = P2.stat.chordRel; P.inv = 0; step(60 * 3); out.chord = { absorbed: hp1 === hp0 && used, released: P2.stat.chordRel - b0, gone: !PW.on('chord') }; step(60 * 2); m.SH.sh = 0; P.inv = 0; P.dashT = 0; P.dq = null; P.hp = P.max; const hq = P.hp; m.hurt(); out.chord.second = P.hp < hq; out.chord.dbg = { god: m.god, over: m.ST.over, dq: P.dq, hq, hp: P.hp, inv: P.inv, sh: m.SH.sh, ds: P.dashT, dead: G().dead, pw: G().pw.act.map(a => a.k) }; m.god = true; }
    // bullet caps
    { give('echo'); let mx = 0; for (let i = 0; i < 60 * 20; i++) { step(1); mx = Math.max(mx, G().pb.length); } out.cap = mx; out.capLimit = m.touchUI || m.rotMode ? 44 : 64; }
    // drop table: weight of each new power vs SLOW GROOVE
    out.weights = { slow: m.PWK.slow.w, new: ['echo', 'nova', 'magb', 'wing', 'cres', 'chord'].map(k => m.PWK[k] && m.PWK[k].w) };
    { fresh(); const cnt = {}; for (let i = 0; i < 3000; i++) { const k = PW.pick(); cnt[k] = (cnt[k] || 0) + 1; } out.pick = cnt; }
    // flag off
    return out;
  });
  console.log('RAW', JSON.stringify(R));
  for (const k of ['plain', 'hit', 'boss', 'stall', 'fever', 'resume']) { const r = R[k]; ok(`DRUM ${k}: auto-shots ${r.shots} == beats while on ${r.seen} (8 bars = 32)`, r.shots === r.seen && r.seen >= 31, JSON.stringify(r)); }
  ok(`DRUM layer: 4 hits per beat while on (${R.hitsOn} in ${R.beatsWin} beats), none off (${R.hitsOff}), none after it ends (${R.hitsAfter}), none scheduled while off (${R.hitsBad})`, R.hitsOff === 0 && R.hitsOn >= 4 * R.beatsWin - 4 && R.hitsOn <= 4 * R.beatsWin + 4 && R.hitsAfter === 0 && R.hitsBad === 0);
  ok('DRUM layer on the song grid', R.grid === true);
  ok(`one at a time: ${R.ex1} | ${R.ex2} | ${R.ex3}`, R.ex1 === 'nova' && R.ex2 === 'drum' && R.ex3 === 'wing');
  ok(`8 bars long (${R.len} beats, ended ${R.ended} after ${R.barsLasted} bars)`, R.len === 32 && R.ended && R.barsLasted >= 7 && R.barsLasted <= 9);
  ok(`explained once: first hint ${R.tip1}s then ${R.tip2}s ("${R.tipTxt}")`, R.tip1 >= 5 && R.tip2 <= 3);
  ok(`ECHO: ${R.echo.ghosts} ghost volleys for ${R.echo.onBeatShots} on-beat shots`, R.echo.ghosts >= R.echo.onBeatShots * .7 && R.echo.ghosts > 5);
  ok(`NOVA: ${R.nova.rings} rings, bullet cleared ${R.nova.cleared}/${R.nova.tried}, enemy hit ${R.nova.hits}x`, R.nova.rings >= R.nova.tried && R.nova.cleared === R.nova.tried && R.nova.tried >= 3 && R.nova.hits >= 3);
  ok(`MAGNET: pickup reaches the ship in ${R.magb.on.toFixed(2)} s vs ${R.magb.off.toFixed(2)} s`, R.magb.on < R.magb.off * .6);
  ok(`WINGMATES: ${R.wing.volleys} volleys in ${R.wing.beats} beats, drones ${R.wing.drones}`, R.wing.volleys >= R.wing.beats - 2 && R.wing.volleys <= R.wing.beats + 1 && R.wing.drones);
  ok(`CRESCENDO: x per bar ${R.cres.join(' ')}; hit resets ${R.cresReset.join('->')}; shot dm ${R.cresDm.join(',')}`, R.cres.includes(1.12) && Math.max(...R.cres) === 1.6 && R.cresReset[0] > 1.4 && R.cresReset[1] === 1 && R.cresDm.every(d => d > 1));
  ok(`CHORD SHIELD: first hit absorbed ${R.chord.absorbed}, released on the beat ${R.chord.released}, power gone ${R.chord.gone}, second hit lands ${R.chord.second}`, R.chord.absorbed && R.chord.released === 1 && R.chord.gone && R.chord.second);
  ok(`player bullets stay under the cap (${R.cap} <= ${R.capLimit})`, R.cap <= R.capLimit);
  ok(`drop table: new powers weight ${R.weights.new.join(',')} = SLOW GROOVE ${R.weights.slow}; each seen in 3000 picks: ${['echo', 'nova', 'magb', 'wing', 'cres', 'chord'].map(k => k + ':' + (R.pick[k] || 0)).join(' ')}`, R.weights.new.every(w => w === R.weights.slow) && ['echo', 'nova', 'magb', 'wing', 'cres', 'chord'].every(k => R.pick[k] > 100));
  
  { const q = await open({ width: 390, height: 763 }, '&pw2=0');   // flag off = baseline
    const O = await q.evaluate(() => { const m = window.__mnr, PW = m.PW, P = m.P; m.startStory(1); m.simOn(true); m.god = true; PW.give('drum', false); const a0 = PW.stat.auto; for (let i = 0; i < 60 * 8; i++) { m.STILL.t = 0; m.step(1 / 60); }
      const cnt = {}; for (let i = 0; i < 2000; i++) { const k = PW.pick(); cnt[k] = 1; } return { flag: m.RET.pw2, new: ['echo', 'nova', 'magb', 'wing', 'cres', 'chord'].filter(k => m.PWK[k]), shots: PW.stat.auto - a0, picks: Object.keys(cnt), p2: !!m.G.p2 }; });
    ok(`flag off (?pw2=0) = baseline: flag ${O.flag}, new powers in table ${O.new.length}, picks ${O.picks.join(',')}, old drum still auto-fires (${O.shots} shots in 8 s)`, O.flag === false && O.new.length === 0 && O.picks.every(k => !['echo', 'nova', 'magb', 'wing', 'cres', 'chord'].includes(k)) && O.shots >= 11 && !O.p2);
    await q.close(); }
  // HUD inside the viewport, both sizes
  for (const vp of [{ width: 390, height: 763 }, { width: 1280, height: 720 }]) {
    const q = await open(vp);
    const H = await q.evaluate(() => { const m = window.__mnr; m.startStory(1); m.simOn(true); m.god = true; for (let i = 0; i < 30; i++) m.step(1 / 60); m.PW.give('chord', false); m.render(m.G.t, 0);
      const rects = [], fr = CanvasRenderingContext2D.prototype.fillRect; CanvasRenderingContext2D.prototype.fillRect = function (x, y, w, h) { if (String(this.fillStyle).toLowerCase() === '#a98bff') { const t = this.getTransform(); rects.push({ cv: this.canvas.id || 'c', l: t.e + x * t.a + y * t.c, t: t.f + x * t.b + y * t.d, r: t.e + (x + w) * t.a + (y + h) * t.c, b: t.f + (x + w) * t.b + (y + h) * t.d, cw: this.canvas.width, ch: this.canvas.height }); } return fr.apply(this, arguments); };
      for (let i = 0; i < 4; i++) { m.step(1 / 60); m.render(m.G.t, 1 / 60); } const vis = []; document.querySelectorAll('canvas').forEach(c => { const r = c.getBoundingClientRect(); vis.push([c.id, r.left, r.top, r.right, r.bottom]); }); return { rects, vis, vw: innerWidth, vh: innerHeight }; });
    const inCanvas = H.rects.length > 0 && H.rects.every(r => r.l >= -1 && r.t >= -1 && r.r <= r.cw + 1 && r.b <= r.ch + 1);
    const cvOk = H.vis.every(v => v[3] <= H.vw + 1 && v[4] <= H.vh + 1 || v[1] >= H.vw);
    ok(`HUD timer bar drawn inside its canvas (${H.rects.length} rects) and canvases inside the viewport at ${vp.width}x${vp.height}`, inCanvas && cvOk, JSON.stringify(H.rects.slice(0, 2)) + JSON.stringify(H.vis));
    await q.close();
  }
  ok('no page errors', errs.length === 0, errs.slice(0, 3).join(' | ') + JSON.stringify(R.pwErr.slice(0, 2)));
  await br.close(); srv.kill(); const bad = res.filter(x => !x).length; console.log(bad ? `${bad} FAILED` : 'ALL PASS'); process.exit(bad ? 1 : 0);
})();
