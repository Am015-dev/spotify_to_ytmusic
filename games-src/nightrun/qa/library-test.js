#!/usr/bin/env node
// LIBRARY (parts/music/library.js): one song per stage and boss, no jingles, no menu song until the title. Real audio clock (song changes wait for a bar line), game stepped.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/library-test.js     env: PART=flight|foot (default both), LOG=1 prints the whole track log
const L = require('./lib.js'), { boot, open, ok, done, sleep } = L;
const SPY = () => { const AU = SND.AU, BT = __mnr.BT, T = window.__LT = { t0: performance.now(), tracks: [], calls: [], fx: [] };
  const now = () => +((performance.now() - T.t0) / 1000).toFixed(1);
  for (const f of ['sting', 'startStage', 'switchTo', 'menuMusic']) { const o = AU[f]; AU[f] = function () { T.calls.push(now() + ' ' + f + ':' + [].slice.call(arguments).filter(x => typeof x === 'string').join(',')); return o.apply(this, arguments); }; }
  { const o = AU.sfx; AU.sfx = function (n) { T.fx.push(now() + ' ' + n); return o.apply(this, arguments); }; }
  setInterval(() => { const c = AU.cur, s = c && c.stage; if (s && (!T.tracks.length || T.tracks[T.tracks.length - 1].s !== s)) T.tracks.push({ s, t: now(), src: c.el ? (c.el.currentSrc || c.el.src || '').split('/').pop() : '', bt: BT.stage }); }, 100); };
const snap = p => p.evaluate(() => { const AU = SND.AU, c = AU.cur, BT = __mnr.BT; return { song: c && c.stage, bt: BT.stage, mode: BT.mode, pos: c && c.el ? +c.el.currentTime.toFixed(1) : -1, rate: NR.music.rate, low: LIB.low, gain: AU.musv ? +AU.musv.gain.value.toFixed(2) : -1, ...LIB.st() }; });
const step = (p, n) => p.evaluate(n => { for (let i = 0; i < n; i++) { __mnr.P.hp = __mnr.P.max; __mnr.step(1 / 60); } }, n);
const log = (s) => { if (process.env.LOG) console.log('  ' + s); };
(async () => {
  const b = await boot(); const part = process.env.PART || 'both';
  let p = await open(b.br, b.base, 1000, 700, '', null, false); await sleep(500);
  const fresh = async () => { await p.evaluate(() => { SND.AU.init(); SND.AU.a.resume(); SND.AU.menuMusic(); }); await sleep(3000); await p.evaluate(SPY); };
  const reports = [], report = async (n) => { const T = await p.evaluate(() => ({ fx: __LT.fx, calls: __LT.calls, tracks: __LT.tracks, refused: LIB.refused, lib: LIB.log })); reports.push(T); console.log(`TRACKS(${n}) ` + T.tracks.map(t => `${t.t}s ${t.s}`).join(' | ')); console.log(`SFX(${n}) ` + T.fx.filter(f => !/ (shot|hit|boom|hurt|pick)$/.test(f)).join(' | ')); console.log(`REFUSED(${n}) ` + (T.refused.join(' ') || 'none')); console.log(`LIB(${n}) ` + T.lib.join(' | ')); };
  await fresh(); const flightSongs = [];
  if (part !== 'foot') {
    let s = await snap(p); ok('title plays the menu song (a full track)', s.song === 'menu' && s.rate === 1, JSON.stringify(s));
    // stage 1 -> clear -> result -> next -> stage 2 -> boss stage
    for (const n of [1, 2]) {
      await p.evaluate(n => __mnr.startStory(n), n); await sleep(500); await step(p, 120); await sleep(4500); await step(p, 60); s = await snap(p); flightSongs.push(s.song);
      log(`stage ${n} song ${s.song} ${JSON.stringify(s)}`); ok(`stage ${n} plays a stage song, not the menu song`, !!s.song && s.song !== 'menu' && s.run, JSON.stringify(s));
      if (n === 1) {
        await p.evaluate(() => __mnr.ST.clear(false)); for (let i = 0; i < 40 && !(await p.evaluate(() => LIB.st().res)); i++) { await step(p, 60); await sleep(100); }
        await sleep(2500); s = await snap(p); ok('result screen: stage song keeps playing, 6 dB lower', s.res && s.song === flightSongs[0] && s.low && s.gain < .6 * (await p.evaluate(() => __mnr.SET.music)) + .01, JSON.stringify(s));
        await p.evaluate(() => document.getElementById('srNext').click()); await sleep(1000);
      }
    }
    ok('stage 1 and stage 2 play different songs', flightSongs[0] !== flightSongs[1], flightSongs.join(' vs '));
    // the first ten story stages: ten different songs, none twice in a row (straight from the map the game uses)
    const first = await p.evaluate(() => __dp.STAGES.filter(s => !s.ch).map(s => s.song));
    ok('stages 1-10 are 10 different songs', new Set(first.slice(0, 10)).size === 10, first.slice(0, 10).join(','));
    ok('no two consecutive story stages share a song (1-40)', first.every((x, i) => !i || x !== first[i - 1]), first.join(','));
    await report('title,stage1,result,stage2'); p.errs0 = p.errs; await p.reload({ waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr, null, { timeout: 15000 }); await sleep(800); await fresh();
    // boss of the first district
    await p.evaluate(() => __mnr.startStory(8)); await sleep(500);
    const bs = await p.evaluate(() => { const M = __mnr; M.simOn(true); for (let i = 0; i < 30; i++) M.step(1 / 60); M.G.dbar = Math.max(M.G.dbar, (M.ST.def.lead || 0) + 3); for (let i = 0; i < 20000 && !M.G.boss && !LIB.st().over; i++) { M.P.hp = M.P.max; M.step(1 / 60); } return !!M.G.boss; });
    await p.evaluate(() => __mnr.simOn(false)); await sleep(6000); s = await snap(p);
    ok('boss fight plays its own boss song', bs && /^boss/.test(s.song) && s.song !== flightSongs[0], JSON.stringify(s));
    const bossSongs = await p.evaluate(() => [0, 1, 2, 3, 6].map(k => __dp.bossStage(k)));
    ok('the 5 bosses have 5 different songs', new Set(bossSongs).size === 5, bossSongs.join(','));
    // leave to the title: the menu song comes back only now
    await p.keyboard.press('p'); await sleep(300); await p.click('#quitBtn'); await sleep(300); let q = await snap(p); ok('quit to title: the title is up and the boss song has not been replaced yet', q.title && !q.run, JSON.stringify(q));
    await sleep(5000); q = await snap(p); ok('on the title the menu song plays (after leaving the stage)', q.title && q.song === 'menu' && !q.low, JSON.stringify(q));
    await report('boss,quit,title');
    const mb = await p.evaluate(() => (window.__LT.tracks.map(t => t.s)));
    log('tracks ' + (await p.evaluate(() => JSON.stringify(__LT.tracks))));
  }
  if (part !== 'flight') {
    if (part === 'foot') await fresh(); else { await p.reload({ waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr, null, { timeout: 15000 }); await sleep(800); await fresh(); }
    await p.waitForFunction(() => window.FOOT && FOOT.S3, null, { timeout: 20000 }); await p.evaluate(() => { RET.tale = false; FOOT.ui = 1; FOOT.start('zeil'); }); await p.waitForFunction(() => FOOT.on && FOOT.S && !document.getElementById('footQ'), null, { timeout: 25000 });
    await sleep(6000); let s = await snap(p); ok('on foot: the street song plays', s.foot && s.song === 'street1' && s.mode === 'file', JSON.stringify(s));
    const want = async (name, set, re, wait) => { await p.evaluate(set); await sleep(wait || 9000); const x = await snap(p); ok(`on foot: ${name}`, re.test(x.song || ''), JSON.stringify(x)); return x; };
    await want('arena lock plays the lock song', () => { Object.defineProperty(FOOT.S, 'lock', { get: () => 1, set() { }, configurable: true }); }, /^street1-lock$/);
    await want('boss plays its own boss song', () => { Object.defineProperty(FOOT.S, 'lock', { get: () => 0, set() { }, configurable: true }); FOOT.S.bossOn = 1; }, /^street1-boss/);
    s = await want('clear plays the clear song (a full track), result screen 6 dB lower', () => { FOOT.S.bossOn = 0; FOOT.S.end = { cleared: true }; }, /^street1-clear$/); ok('on foot result: song lowered, no menu song', s.low, JSON.stringify(s));
    await p.evaluate(() => { FOOT.S.end = null; }); await p.keyboard.press('p'); await sleep(300); await p.evaluate(() => { const b = document.getElementById('fQuit'); if (b) b.click(); }); await sleep(7000);
    s = await snap(p); ok('after leaving the street the title plays the menu song', s.title && s.song === 'menu', JSON.stringify(s));
    await report('on foot: street, lock, boss, clear, title');
  }
  const T = { fx: reports.flatMap(r => r.fx), calls: reports.flatMap(r => r.calls), refused: reports.flatMap(r => r.refused) };
  const cnt = (a, re) => a.filter(x => re.test(x)).length;
  ok('every warn / perfect call was refused (none reached the mixer)', cnt(T.fx, /warn|perfect/) === cnt(T.refused, /^sfx:(warn|perfect)/), `${cnt(T.fx, /warn|perfect/)} calls, ${cnt(T.refused, /^sfx:(warn|perfect)/)} refused`);
  ok('every sting call was refused', T.calls.filter(c => / sting:/.test(c)).length === cnt(T.refused, /^sting:/), `${T.calls.filter(c => / sting:/.test(c)).length} calls, ${cnt(T.refused, /^sting:/)} refused`);
  ok('no page error', !p.errs.length, p.errs.join(' | ')); await b.close(); done('library-test');
})().catch(e => { console.log('FAIL library-test ' + e.message); process.exit(1); });
