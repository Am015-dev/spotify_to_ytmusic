#!/usr/bin/env node
// Nightrun music pack (parts/musicpack.js, flag RET.musicpack, ?musicpack=0 = the old music). Real page, real mp3 files, headless, no screenshots.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/musicpack-test.js     env: GAME_DIR=...
// 1 every cue listed in media/ready.json is registered as a track (bpm / offset from the table); stage picks: pack cues first per district, Athens gets athA/athB
// 2 bosses: boss-dN on entry, the ~b take on phase 1, back to the a take on phase 2 (alternating); endless3 = last district, and Ostend from the 2nd loop
// 3 fever: the cue of the stage's tempo band, combo tier 4 = one band up, back to the song before when it ends; pit: pit cue and back
// 4 on foot: run / lock / boss (a/b per phase) / clear; stingers: pack buffers decoded, clear / unlock / boss defeat play from the file
// 5 mute respected; a missing file (not in ready.json) and a listed-but-404 file fall back to the old songs without page errors; ?musicpack=0 = the old picks exactly
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const res = []; const ok = (n, p, i) => { res.push(p); console.log((p ? 'PASS ' : 'FAIL ') + n + (p || i === undefined ? '' : ' :: ' + JSON.stringify(i))); };
(async () => {
  const port = await freePort(); const srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  for (let i = 0; i < 50; i++) { try { if ((await fetch(`http://127.0.0.1:${port}/index.html`)).ok) break; } catch (e) { } await sleep(100); }
  const br = await PW.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const allErrs = [];
  const open = async ({ q = '', route, wait = true, stub = true } = {}) => {
    const ctx = await br.newContext({ viewport: { width: 1280, height: 720 }, serviceWorkers: 'block' }), p = await ctx.newPage(), errs = [];
    p.on('pageerror', e => errs.push('page: ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push('console: ' + m.text()); });
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    if (route) await route(p);
    await p.addInitScript(() => { try { localStorage.setItem('mnr_tut', '1'); } catch (e) { } });
    await p.goto(`http://127.0.0.1:${port}/index.html${q}`, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr);
    await sleep(1200);
    await p.click('#startBtn'); await p.waitForFunction(() => window.__mnr.running, null, { timeout: 5000 });
    if (wait) await p.waitForFunction(() => __mnr.BT.mode === 'file' && !__mnr.BT.pend && __mnr.AU.a.state === 'running', null, { timeout: 20000 });
    if (stub) await p.evaluate(() => { window.__sw = []; window.__st = []; const A = __mnr.AU; A.__sw = A.switchTo; A.switchTo = function (s) { window.__sw.push(s); }; A.__ss = A.startStage; A.startStage = function (s) { window.__st.push(s); }; });
    return { p, errs, ctx };
  };
  const sw = (p) => p.evaluate(() => { const o = window.__sw.slice(); window.__sw.length = 0; return o; });
  const stg = (p) => p.evaluate(() => { const o = window.__st.slice(); window.__st.length = 0; return o; });

  // ---------- flags on
  const { p, errs } = await open();
  const T = await p.evaluate(() => ({ n: Object.keys(__mp.T).length, reg: Object.keys(__mp.reg).length, miss: Object.keys(__mp.T).filter(k => !__mnr.TR.by[k]), d1a: __mnr.TR.by.d1a, ready: __mp.ready && __mp.ready.size }));
  ok(`1 all ${T.n} cues listed in ready.json are registered (${T.reg}); none missing`, T.reg === T.n && !T.miss.length && T.ready >= T.n + 9, T);
  ok('1 table bpm / offset reach the track (pulse tempo = cue tempo)', await p.evaluate(() => { const t = __mnr.TR.by.d1a, m = __mp.T.d1a; return t.bpm === m[0] && t.offsetMs === m[1] && __mnr.SONGM.d1a.bars === m[3]; }));
  const st = await p.evaluate(() => { const D = __dp, di = k => D.STAGES.filter(s => !s.ch && s.di === k).map(s => s.song); return { bank: di(0), main: di(1), ost: di(2), messe: di(3), ath: di(4), first: __mnr.BT.stage }; });
  const PK = /^(d[1-4][ab]|ath[AB])$/;
  ok(`2 stages: the first stage of every district takes a pack cue (bank ${st.bank[0]}, main ${st.main[0]}, ostend ${st.ost[0]}, messe ${st.messe[0]}, athens ${st.ath[0]})`, [st.bank, st.main, st.ost, st.messe, st.ath].every(a => a.length && PK.test(a[0])), st);
  ok('2 Bank uses d1a/d1b before any old song; Athens uses athA/athB', st.bank.slice(0, 2).every(k => /^d1[ab]$/.test(k)) && st.ath.slice(0, 2).every(k => /^ath[AB]$/.test(k)), st);
  ok(`2 the run itself plays a pack cue from the first bar (${st.first})`, PK.test(st.first));
  const bs = await p.evaluate(() => [0, 1, 2, 3].map(k => __dp.bossStage(k)));
  ok('2 boss entry: boss-d1..d4', bs.join() === 'boss-d1,boss-d2,boss-d3,boss-d4', bs);
  // boss a/b alternation per phase
  await p.evaluate(() => { __mnr.BT.stage = 'boss-d2'; NR.emit('bossIn', {}); NR.emit('bossPhase'); });
  const b1 = await sw(p);
  await p.evaluate(() => { __mnr.BT.stage = 'boss-d2~b'; NR.emit('bossPhase'); });
  const b2 = await sw(p);
  await p.evaluate(() => { __mnr.BT.stage = 'boss-d2'; NR.emit('bossPhase'); });
  const b3 = await sw(p);
  ok('2 boss phases alternate a / b / a / b', b1.join() === 'boss-d2~b' && b2.join() === 'boss-d2' && b3.join() === 'boss-d2~b', [b1, b2, b3]);
  await p.evaluate(() => { __mnr.BT.stage = 'd1a'; NR.emit('bossPhase'); });
  ok('2 a phase outside a boss cue does nothing', !(await sw(p)).length);
  // endless3
  const en = await p.evaluate(() => ({ l0m: __dp.songFor(3, 0), l0o: __dp.songFor(2, 0), l1o: __dp.songFor(2, 1), l1b: __dp.songFor(0, 1) }));
  ok('2 endless3 = last district (loop 1), Ostend from loop 2; other districts keep their pool', en.l0m === 'endless3' && en.l1o === 'endless3' && en.l0o !== 'endless3' && en.l1b !== 'endless3', en);
  // fever
  const fv = async (stage, tier, fever) => { await p.evaluate(([s, t, f]) => { __mnr.BT.stage = s; __mnr.AU.tier = t; __mnr.AU.fever = f; NR.emit('beat', { i: 0 }); }, [stage, tier, fever]); return sw(p); };
  const f1 = await fv('d1a', 2, true);
  const f1b = await fv('fever-120', 2, false);
  ok('3 fever on Bank (120 band) = fever-120, back to d1a when it ends', f1.join() === 'fever-120' && f1b.join() === 'd1a', [f1, f1b]);
  const f2 = await fv('d3a', 2, true); await fv('fever-128', 2, false);
  const f3 = await fv('d3a', 4, true); await fv('fever-132', 4, false);
  const f4 = await fv('d4a', 4, true); await fv('fever-132', 1, false);
  ok('3 fever tiers by tempo band and combo: 128 -> fever-128; tier 4 one band up -> fever-132; top band stays', f2.join() === 'fever-128' && f3.join() === 'fever-132' && f4.join() === 'fever-132', [f2, f3, f4]);
  const f5 = await fv('stage1', 2, true); await fv('fever-120', 2, false);   // an old song: the band comes from its tempo
  ok('3 an old song picks the band by its tempo', /^fever-1(20|28|32)$/.test(f5[0] || ''), f5);
  // pit
  await p.evaluate(() => { __mnr.BT.stage = 'd2b'; NR.emit('pitStart', 1); });
  const pt = await sw(p);
  await p.evaluate(() => { __mnr.BT.stage = 'pit'; __mnr.SH.active = true; __mnr.SH.cb = null; __mnr.SH.close(); });
  const pb = await sw(p);
  ok('3 pit stop: pit cue, then back to the song before', pt.join() === 'pit' && pb.join() === 'd2b', [pt, pb]);
  // foot
  const ft = async (S) => { await p.evaluate(S => { const F = window.FOOT; F.on = true; F.S = S; __mp.foot(); }, S); return stg(p); };
  await p.evaluate(() => { __mp.fk = null; __mp.fb = 0; });
  const r1 = await ft({}); const r2 = await ft({ lock: 'A' }); const r3 = await ft({ bossOn: true });
  await p.evaluate(() => NR.emit('footPhase', { id: 'x', phase: 1 })); const r4 = await ft({ bossOn: true });
  await p.evaluate(() => NR.emit('footPhase', { id: 'x', phase: 2 })); const r5 = await ft({ bossOn: true });
  const r6 = await ft({ end: { cleared: true } }); const r7 = await ft({ end: { cleared: true } });
  await p.evaluate(() => { window.FOOT.on = false; window.FOOT.S = null; });
  ok('4 on foot: run, lock, boss, boss ~b, boss a, clear (once)', [r1, r2, r3, r4, r5, r6].map(a => a.join()).join('|') === 'street1|street1-lock|street1-boss|street1-boss~b|street1-boss|street1-clear' && !r7.length, [r1, r2, r3, r4, r5, r6, r7]);
  // stingers
  await p.waitForFunction(() => __mp.ST.every(n => __mnr.AU.stg[n] && __mnr.AU.stg[n].duration > 0), null, { timeout: 8000 }).catch(() => { });
  const sb = await p.evaluate(() => Object.fromEntries(__mp.ST.map(n => [n, !!(__mnr.AU.stg[n] && __mnr.AU.stg[n].duration > 0)])));
  ok('4 all 9 stingers decoded from the pack files', Object.values(sb).every(Boolean), sb);
  const played = async (fn, want = true) => { let r = ''; for (let i = 0; i < (want ? 5 : 1) && !r; i++) { await sleep(450); await p.evaluate(() => { __mnr.AU.stLog.length = 0; }); await p.evaluate(fn); await sleep(100); r = await p.evaluate(() => __mnr.AU.stLog.map(e => e.n + ':' + e.file).join()); } return r; };   // the game's own stingers can hold the rate limit for a moment: ask again
  const s1 = await played(() => NR.emit('stageClear', {})), s2 = await played(() => NR.emit('weaponUp')), s3 = await played(() => NR.emit('kill', { e: { mini: false }, boss: true })), s4 = await played(() => NR.emit('runEnd', { cleared: false }));
  ok('4 stage clear / new weapon / boss defeat / fail play the pack stinger', s1 === 'clear:true' && s2 === 'unlock:true' && s3 === 'clear:true' && s4 === 'fail:true', [s1, s2, s3, s4]);
  const s5 = await played(() => NR.emit('kill', { e: { mini: true }, boss: true }), false);
  ok('4 a mini-boss does not play the boss stinger', s5 === '', s5);
  // mute
  const mu = await p.evaluate(() => { const S = __mnr.SET, A = __mnr.AU; S.mute = true; A.vol(true); const r = A.sting('perfect'); return { r, g: A.m.gain.value }; });
  await sleep(150); const mg = await p.evaluate(() => __mnr.AU.m.gain.value);
  ok('5 mute: stingers refuse, master gain 0', mu.r === false && mg < .001, { mu, mg });
  await p.evaluate(() => { __mnr.SET.mute = false; __mnr.AU.vol(true); });
  ok('5 no page errors with the pack', errs.length === 0, errs); allErrs.push(...errs);
  const pickOn = await p.evaluate(() => __dp.STAGES.map(s => s.song).join());
  await p.context().close();

  // ---------- fallback 1: nothing of the pack listed in ready.json
  const noList = { route: async pg => { await pg.route('**/media/ready.json', async r => { const resp = await r.fetch(); const j = await resp.json(); await r.fulfill({ response: resp, body: JSON.stringify(j.filter(x => !/\.mp3$/.test(x))) }); }); } };
  const o1 = await open(noList);
  const fb1 = await o1.p.evaluate(() => ({ reg: Object.keys(__mp.reg).length, byD1a: !!__mnr.TR.by.d1a, songs: __dp.STAGES.map(s => s.song).join(), st: __mnr.BT.stage, mode: __mnr.BT.mode }));
  ok(`5 no pack file listed: nothing registered, the old songs play (${fb1.st}, ${fb1.mode})`, fb1.reg === 0 && !fb1.byD1a && /^(stage|endless|athina|boss)/.test(fb1.st) && fb1.mode === 'file', fb1);
  await o1.p.evaluate(() => { __mnr.AU.fever = true; NR.emit('beat', {}); NR.emit('pitStart', 1); NR.emit('weaponUp'); NR.emit('footStart', {}); __mp.foot(); });
  ok('5 no pack file listed: fever / pit / foot / stinger hooks do nothing and do not throw', !(await sw(o1.p)).length && !(await stg(o1.p)).length && o1.errs.length === 0, o1.errs);
  allErrs.push(...o1.errs); await o1.ctx.close();

  // ---------- fallback 2: listed but the files 404
  const o2 = await open({ wait: false, stub: false, route: async pg => { await pg.route('**/media/mp-*.mp3', r => r.fulfill({ status: 404, body: 'x' })); } });
  await sleep(6000);
  const fb2 = await o2.p.evaluate(() => ({ dead: Object.keys(__mp.dead), reg: Object.keys(__mp.reg).length, st: __mnr.BT.stage, mode: __mnr.BT.mode }));
  ok(`5 listed but 404: the cue is dropped and the old song takes over (${fb2.st}/${fb2.mode}, dropped ${fb2.dead.join()})`, fb2.dead.includes('d1a') && !fb2.dead.includes(fb2.st) && o2.errs.length === 0, fb2);
  allErrs.push(...o2.errs); await o2.ctx.close();

  // ---------- ?musicpack=0 = identical to the old picks
  const o0 = await open({ q: '?musicpack=0' });
  const off = await o0.p.evaluate(() => ({ on: __mnr.RET.musicpack, reg: Object.keys(__mp.reg).length, songs: __dp.STAGES.map(s => s.song).join(), bosses: [0, 1, 2, 3].map(k => __dp.bossStage(k)).join(), st: __mnr.BT.stage, en: [__dp.songFor(3, 0), __dp.songFor(2, 1)].join() }));
  const ref = await open(noList);
  const rf = await ref.p.evaluate(() => ({ songs: __dp.STAGES.map(s => s.song).join(), bosses: [0, 1, 2, 3].map(k => __dp.bossStage(k)).join(), en: [__dp.songFor(3, 0), __dp.songFor(2, 1)].join() }));
  ok('5 ?musicpack=0: flag off, nothing registered, stage / boss / endless picks identical to a build without the files', off.on === false && off.reg === 0 && off.songs === rf.songs && off.bosses === rf.bosses && off.en === rf.en && !/^(d[1-4]|ath[AB])/.test(off.st), { off, rf });
  ok('5 the pack really changes the picks when on', pickOn !== rf.songs);
  allErrs.push(...o0.errs, ...ref.errs);
  ok('5 no page errors anywhere', allErrs.length === 0, allErrs);
  await br.close(); srv.kill();
  console.log(res.every(Boolean) ? 'ALL PASS' : 'SOME FAILED'); process.exit(res.every(Boolean) ? 0 : 1);
})().catch(e => { console.log('FAIL crash: ' + e.stack); process.exit(1); });
