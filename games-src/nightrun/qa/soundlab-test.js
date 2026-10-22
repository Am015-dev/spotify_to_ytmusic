#!/usr/bin/env node
// Lab SOUND page (parts/audio/soundlab.js + the SND gate in puremusic.js). PASS/FAIL lines only.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/soundlab-test.js     env: GAME_DIR=<dir with index.html>
//  (a) the SOUND tab opens in the Lab, >= 20 rows (each with PLAY and ON/OFF), default = only hurt, pick, boom on, all music effects off, no page error
//  (b) toggling a row changes the gate (SND.on, PURE.KEEP), ALL EFFECTS OFF mutes all three, the music route goes direct <-> through the filters
//  (c) the choice and the Effects volume survive a reload (localStorage nr_snd)  (d) PLAY runs for every row without a page error
const { boot, open, sleep, ok, done } = require('./lib.js');
(async () => {
  const b = await boot();
  try {
    const p = await open(b.br, b.base, 390, 763, '?nomusic=1&lab=1', 0, true);
    await p.waitForFunction(() => window.__mnr && __mnr.G && __mnr.G.lab, null, { timeout: 20000 }).catch(() => { });
    await p.evaluate(() => { const t = document.getElementById('labTab_sound'); t && t.click(); }); await sleep(300);
    const rows = await p.evaluate(() => [...document.querySelectorAll('#labP .snr')].map(r => ({ id: r.dataset.id, btn: r.querySelectorAll('button').length })));
    ok(`SOUND tab: ${rows.length} rows (>= 20), each with PLAY and ON/OFF`, rows.length >= 20 && rows.every(r => r.btn === 2), JSON.stringify(rows.filter(r => r.btn !== 2)));
    const def = await p.evaluate(() => { const on = SND.T.filter(r => SND.on(r[0])).map(r => r[0]); return { on, keep: Object.keys(PURE.KEEP).sort(), mu: SND.musicFx() }; });
    ok('default: flight = only hurt, pick, boom on; on foot = gun shot, hit, pick-up, stage song start; no music effect', def.on.sort().join() === 'boom,f_hit,f_mstart,f_pick,f_shot,hurt,pick' && def.keep.join() === 'boom,hurt,pick' && !def.mu, JSON.stringify(def));
    // ON FOOT group (street run): 14 rows, each its own switch, every on-foot AU.sfx call and song call goes through the gate
    const ft = await p.evaluate(() => ({ n: SND.T.filter(r => r[1] === 'ft').length, grp: SND.G.ft, rows: document.querySelectorAll('#labP .snr[data-id^="f_"]').length, onN: SND.T.filter(r => r[1] === 'ft' && SND.on(r[0])).map(r => r[0]).sort().join() }));
    ok('ON FOOT group: 14 rows, group title, default on = f_hit,f_mstart,f_pick,f_shot', ft.n === 14 && ft.grp === 'ON FOOT' && ft.rows === 14 && ft.onN === 'f_hit,f_mstart,f_pick,f_shot', JSON.stringify(ft));
    const gate = await p.evaluate(() => { const AU = SND.AU; const calls = []; const o = AU.sfx; AU.sfx = n => { calls.push(n); }; const s0 = AU.startStage, m0 = AU.menuMusic; let ss = 0, mm = 0; AU.startStage = () => { ss++; }; AU.menuMusic = () => { mm++; };
      const sf = FOOT._in.sfx; for (const n of ['shot', 'hit', 'pick', 'big', 'hurt', 'dash', 'graze', 'warn', 'up', 'tier']) sf(n); const def = calls.join();
      for (const id of ['f_big', 'f_hurt', 'f_dash', 'f_graze', 'f_warn', 'f_up', 'f_fever']) SND.set(id, true); calls.length = 0; for (const n of ['big', 'hurt', 'dash', 'graze', 'warn', 'up', 'tier']) sf(n); const allOn = calls.join();
      SND.set('f_hit', false); calls.length = 0; sf('hit'); const hitOff = calls.length; AU.sfx = o; AU.startStage = s0; AU.menuMusic = m0;
      for (const id of ['f_big', 'f_hurt', 'f_dash', 'f_graze', 'f_warn', 'f_up', 'f_fever', 'f_hit']) SND.cfg.on[id] = undefined; SND.cfg.on = {}; SND.save(); return { def, allOn, hitOff, cue: SND.on('f_mcue'), cp: SND.on('f_mcp'), menu: SND.on('f_mmenu') }; });
    ok('ON FOOT default: only shot, hit, pick reach AU.sfx; the other seven are silent until switched on; a switch off silences hit', gate.def === 'shot,hit,pick' && gate.allOn === 'big,hurt,dash,graze,warn,up,tier' && gate.hitOff === 0, JSON.stringify(gate));
    ok('ON FOOT default: song cues, checkpoint restart and menu song are OFF', !gate.cue && !gate.cp && !gate.menu, JSON.stringify(gate));
    const mp = await p.evaluate(() => { const AU = SND.AU, MP = __mnr.RET.MP, F = FOOT; const k = MP.fk; MP.fk = '__x'; let sw = 0; const s0 = AU.startStage; AU.startStage = () => { sw++; }; const on0 = MP.on; MP.on = () => true; const ff = F.on, fs = F.S; F.on = true; F.S = { end: null, bossOn: true, boss: null, lock: null }; try { MP.foot(); } catch (e) { } const off = sw; SND.set('f_mcue', true); try { MP.foot(); } catch (e) { } const on = sw; SND.set('f_mcue', false); F.on = ff; F.S = fs; MP.on = on0; AU.startStage = s0; MP.fk = k; SND.cfg.on = {}; SND.save(); return { off, on }; });
    ok('music-pack cue switching (the song change on foot) is silent by default (f_mcue off)', mp.off === 0, JSON.stringify(mp));
    ok('every id of the table has a row', await p.evaluate(() => SND.T.every(r => document.querySelector('#labP .snr[data-id="' + r[0] + '"]'))));
    // (b) a click on a row's switch changes the gate
    await p.evaluate(() => document.querySelector('#labP .snr[data-id="perfect"] button:nth-of-type(2)').click());
    ok('toggle PERFECT chime on: SND.on + PURE.KEEP', await p.evaluate(() => SND.on('perfect') && !!PURE.KEEP.perfect));
    await p.evaluate(() => document.querySelector('#labP .snr[data-id="boom"] button:nth-of-type(2)').click());
    ok('toggle boom off: gate follows', await p.evaluate(() => !SND.on('boom') && !PURE.KEEP.boom));
    await p.evaluate(() => document.querySelector('#labP .snr[data-id="m_slow"] button:nth-of-type(2)').click());
    ok('a music effect on: the song goes through the filter path', await p.evaluate(() => SND.on('m_slow') && SND.musicFx() && (!PURE.done || PURE.full === true)));
    await p.evaluate(() => { const s = document.getElementById('sndVol'); s.value = 150; s.dispatchEvent(new Event('input')); });
    ok('effects volume slider saved', await p.evaluate(() => Math.abs(SND.cfg.vol - 1.5) < 1e-6));
    // (c) survives a reload
    await p.reload({ waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.SND, null, { timeout: 15000 });
    const re = await p.evaluate(() => ({ perfect: SND.on('perfect'), boom: SND.on('boom'), slow: SND.on('m_slow'), vol: SND.cfg.vol, hurt: SND.on('hurt') }));
    ok('choice and volume survive a reload', re.perfect && !re.boom && re.slow && re.vol === 1.5 && re.hurt, JSON.stringify(re));
    // ALL EFFECTS OFF
    await p.evaluate(() => SND.setOff(true));
    ok('ALL EFFECTS OFF mutes hurt, pick, boom and the music effects', await p.evaluate(() => !SND.on('hurt') && !SND.on('pick') && !SND.on('boom') && !SND.on('m_slow') && !SND.musicFx()));
    await p.evaluate(() => { SND.cfg.on = {}; SND.cfg.off = false; SND.save(); });
    // (d) PLAY every row: no page error (silent when the audio context cannot start in headless)
    await p.evaluate(() => { try { AU.unlock(); } catch (e) { } });
    const err = await p.evaluate(() => { const e = []; for (const r of SND.T) { try { SND.play(r[0]); } catch (x) { e.push(r[0] + ': ' + x.message); } } return e; });
    ok('PLAY runs for every row without an error', !err.length, err.join(' | '));
    ok('no page errors', !p.errs.length, p.errs.join(' | '));
    // the old mix: ?pure=0 plays everything (nothing gated)
    const q = await open(b.br, b.base, 390, 763, '?nomusic=1&pure=0', 0, true);
    ok('?pure=0: gate open for every id', await q.evaluate(() => SND.on('perfect') && SND.on('m_duck') && sndOn('heart')));
    ok('?pure=0: no page errors', !q.errs.length, q.errs.join(' | '));
  } finally { await b.close(); }
  done('soundlab');
})();
