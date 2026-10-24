#!/usr/bin/env node
// Lab SOUND page (parts/audio/soundlab.js + the SND gate in puremusic.js). PASS/FAIL lines only.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/soundlab-test.js     env: GAME_DIR=<dir with index.html>
//  (a) the SOUND tab opens in the Lab, >= 20 rows (each with PLAY and ON/OFF), default = only hurt, pick, boom on, all music effects off, no page error
//  (b) toggling a row changes the gate (SND.on, PURE.KEEP), ALL EFFECTS OFF mutes all three, the music route goes direct <-> through the filters
//  (c) the choice and the Effects volume survive a reload (localStorage nr_snd)  (d) PLAY runs for every row without a page error
//  (e) MUSIC: a song list with PLAY / STOP, a pick changes the song AU.startStage starts (title, street, district, boss), ?musiclab=0 ignores picks
//  (f) EXPORT -> IMPORT round trip equals, bad input is refused and changes nothing, the buttons confirm in words  (g) jingles: with every s_* row off, no AU.sting reaches the speakers in a flight stage or a street run
const { boot, open, sleep, ok, done } = require('./lib.js');
(async () => {
  const b = await boot();
  try {
    const p = await open(b.br, b.base, 390, 763, '?nomusic=1&lab=1', 0, true);
    await p.waitForFunction(() => window.__mnr && __mnr.G && __mnr.G.lab, null, { timeout: 20000 }).catch(() => { });
    await p.evaluate(() => { const t = document.getElementById('labTab_sound'); t && t.click(); }); await sleep(300);
    const rows = await p.evaluate(() => [...document.querySelectorAll('#labP .snr[data-id]')].map(r => ({ id: r.dataset.id, btn: r.querySelectorAll('button').length })));
    ok(`SOUND tab: ${rows.length} rows (>= 20), each with PLAY and ON/OFF`, rows.length >= 20 && rows.every(r => r.btn === 2), JSON.stringify(rows.filter(r => r.btn !== 2)));
    const def = await p.evaluate(() => { const on = SND.T.filter(r => SND.on(r[0])).map(r => r[0]); return { on, keep: Object.keys(PURE.KEEP).sort(), mu: SND.musicFx() }; });
    ok('default: flight = only hurt, pick, boom on; on foot = the old gun shot, hit, pick-up, stage song start + the 13 new W193 sounds + the 17 W200 flight sounds; no music effect', def.on.sort().join() === 'boom,f_block,f_finisher,f_foedeath,f_foehurt,f_hit,f_impact,f_kaihurt,f_knifehit,f_mstart,f_pick,f_pickup,f_pistol,f_rocket,f_shot,f_shotgun,f_smg,f_swish,hurt,pick,y_bossdeath,y_bosshit,y_ehit,y_emp,y_eshot,y_graze,y_medal,y_multbreak,y_phit,y_pickup,y_pshot_beam,y_pshot_mine,y_pshot_pulse,y_pshot_swarm,y_xbig,y_xmed,y_xsmall' && def.keep.join() === 'boom,hurt,pick' && !def.mu, JSON.stringify(def));
    // ON FOOT group (street run): 14 rows, each its own switch, every on-foot AU.sfx call and song call goes through the gate
    const ft = await p.evaluate(() => ({ n: SND.T.filter(r => r[1] === 'ft').length, grp: SND.G.ft, rows: document.querySelectorAll('#labP .snr[data-id^="f_"]').length, onN: SND.T.filter(r => r[1] === 'ft' && SND.on(r[0])).map(r => r[0]).sort().join() }));
    ok('ON FOOT group: 27 rows (14 + 13 W193 sounds), group title, default on = the 4 old + 13 new', ft.n === 27 && ft.grp === 'ON FOOT' && ft.rows === 27 && ft.onN === 'f_block,f_finisher,f_foedeath,f_foehurt,f_hit,f_impact,f_kaihurt,f_knifehit,f_mstart,f_pick,f_pickup,f_pistol,f_rocket,f_shot,f_shotgun,f_smg,f_swish', JSON.stringify(ft));
    const gate = await p.evaluate(() => { const AU = SND.AU; __mnr.RET.footsfx = false;   // this block checks the old on-foot gate; footsfx-test.js covers the new set
      const calls = []; const o = AU.sfx; AU.sfx = n => { calls.push(n); }; const s0 = AU.startStage, m0 = AU.menuMusic; let ss = 0, mm = 0; AU.startStage = () => { ss++; }; AU.menuMusic = () => { mm++; };
      const sf = FOOT._in.sfx; for (const n of ['shot', 'hit', 'pick', 'big', 'hurt', 'dash', 'graze', 'warn', 'up', 'tier']) sf(n); const def = calls.join();
      for (const id of ['f_big', 'f_hurt', 'f_dash', 'f_graze', 'f_warn', 'f_up', 'f_fever']) SND.set(id, true); calls.length = 0; for (const n of ['big', 'hurt', 'dash', 'graze', 'warn', 'up', 'tier']) sf(n); const allOn = calls.join();
      SND.set('f_hit', false); calls.length = 0; sf('hit'); const hitOff = calls.length; AU.sfx = o; AU.startStage = s0; AU.menuMusic = m0;
      for (const id of ['f_big', 'f_hurt', 'f_dash', 'f_graze', 'f_warn', 'f_up', 'f_fever', 'f_hit']) SND.cfg.on[id] = undefined; SND.cfg.on = {}; SND.save(); __mnr.RET.footsfx = true; return { def, allOn, hitOff, cue: SND.on('f_mcue'), cp: SND.on('f_mcp'), menu: SND.on('f_mmenu') }; });
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
    // (e) MUSIC section
    await p.waitForFunction(() => window.__mnr && __mnr.G && __mnr.G.lab, null, { timeout: 20000 }).catch(() => { });
    await p.evaluate(() => { const t = document.getElementById('labTab_sound'); t && t.click(); }); await sleep(300);
    const mus = await p.evaluate(() => ({ songs: document.querySelectorAll('#labP .snr[data-song]').length, places: [...document.querySelectorAll('#labP .snr[data-place] select')].map(s => s.options.length), pl: SND.places().map(x => x.id).join() }));
    ok('MUSIC: every song has a PLAY row, every place has a picker (title, street, districts, bosses)', mus.songs >= 11 && mus.places.length === mus.pl.split(',').length && mus.places.every(n => n >= 9), JSON.stringify(mus));
    const pv = await p.evaluate(() => { const row = document.querySelector('#labP .snr[data-song]'), b = row.querySelector('button'); b.click(); const on = SND.pvSong === row.dataset.song; const t1 = b.textContent; b.click(); return { on, t1, off: SND.pvSong, t2: b.textContent }; });
    ok('PLAY starts the song and the button turns into STOP; STOP ends the preview', pv.on === true && pv.t1 === 'STOP' && pv.off === null && pv.t2 === 'PLAY', JSON.stringify(pv));
    const pk = await p.evaluate(() => { const AU = SND.AU, o = {}; const st = (k) => { AU.startStage(k); return SND.BT.stage; };
      SND.cfg.music = {}; o.def = [__mnr.RET.focus ? 'menu' : st('menu'), st('stage2'), st('boss')].join();   // focus mode: the title is silent without a pick (focus-test.js), so the default title song is only checked with ?focus=0
      SND.setMusic('title', 'boss2'); o.title = st('menu'); SND.setMusic('title', '');
      SND.setMusic('street', 'stage3'); FOOT.on = true; o.street = st('stage2'); FOOT.on = false; SND.setMusic('street', '');
      const R = __mnr.RET, G = __mnr.G, di0 = G.di; G.di = 1; const dp = R.DP && R.DP.pool ? R.DP.pool(1)[0] : 'stage2'; SND.setMusic('d1', dp === 'endless2' ? 'endless' : 'endless2'); o.d1 = st(dp); o.d1want = SND.cfg.music.d1; G.di = di0; SND.lastOut = null;
      const b0 = SND.places().find(x => x.id === 'b0').def; SND.setMusic('b0', b0 === 'boss3' ? 'boss2' : 'boss3'); o.boss = st(b0); o.bosswant = SND.cfg.music.b0; SND.cfg.music = {}; SND.save(); o.back = st('stage1'); __mnr.RET.musiclab = false; SND.setMusic('title', 'boss2'); o.off = st('menu'); __mnr.RET.musiclab = true; SND.cfg.music = {}; SND.save(); return o; });
    ok('a pick changes the song AU.startStage starts: title, street (on foot), flight district, boss; default unchanged; ?musiclab=0 ignores picks',
      pk.def === 'menu,stage2,boss' && pk.title === 'boss2' && pk.street === 'stage3' && pk.d1 === pk.d1want && pk.boss === pk.bosswant && pk.back === 'stage1' && pk.off === 'menu', JSON.stringify(pk));
    // (f) export -> import round trip
    const rt = await p.evaluate(() => { SND.cfg.on = {}; SND.cfg.off = false; SND.cfg.vol = 1; SND.cfg.music = {}; SND.set('perfect', true); SND.set('boom', false); SND.setVol(1.3); SND.setMusic('title', 'boss2'); SND.setMusic('d0', 'endless');
      const a = SND.exportJson(); const full = JSON.parse(a); const n = SND.T.length;
      SND.cfg.on = {}; SND.cfg.vol = 1; SND.cfg.off = true; SND.cfg.music = {}; const r = SND.importJson(a); const b = SND.exportJson();
      return { same: a === b, ok: r.ok, count: Object.keys(full.on).length, n, fmt: full.format, vol: SND.cfg.vol, off: SND.cfg.off, music: JSON.stringify(SND.cfg.music), perfect: SND.on('perfect'), boom: SND.on('boom') }; });
    ok('export -> import round trip equals, every sound row is in the file, applied at once', rt.same && rt.ok && rt.count === rt.n && rt.fmt === 'nightrun-sound-settings' && rt.vol === 1.3 && !rt.off && rt.music === '{"title":"boss2","d0":"endless"}' && rt.perfect && !rt.boom, JSON.stringify(rt));
    const bad = await p.evaluate(() => { const a = SND.exportJson(), res = []; for (const t of ['nope', '{}', JSON.stringify({ format: 'nightrun-sound-settings', version: 1, on: { zzz: true } }), JSON.stringify({ format: 'nightrun-sound-settings', version: 1, vol: 9 }), JSON.stringify({ format: 'nightrun-sound-settings', version: 1, music: { title: 'nosong' } }), JSON.stringify({ format: 'nightrun-sound-settings', version: 1, on: { boom: 'yes' } })]) { const r = SND.importJson(t); res.push(r.ok ? 'ACCEPTED ' + t : r.error.length > 10); }
      return { res, same: SND.exportJson() === a }; });
    ok('bad JSON, unknown names and wrong values are refused with a plain message and change nothing', bad.res.every(x => x === true) && bad.same, JSON.stringify(bad));
    const ui = await p.evaluate(async () => { const btn = n => [...document.querySelectorAll('#labP button')].find(b => b.textContent === n); const box = document.getElementById('sndJson');
      btn('EXPORT').click(); await new Promise(r => setTimeout(r, 400)); const txt = box.value, m1 = document.querySelector('#labP .snm').textContent;
      SND.cfg.on = {}; SND.cfg.music = {}; box.value = txt; btn('IMPORT').click(); const m2 = document.querySelector('#labP .snm').textContent; const back = SND.exportJson() === txt;
      box.value = '{bad'; btn('IMPORT').click(); const m3 = document.querySelector('#labP .snm').textContent;
      const sz = [...document.querySelectorAll('#labP .snr .sn, #labP .snr select, #labP .snm')].map(e => parseFloat(getComputedStyle(e).fontSize)), tap = [...document.querySelectorAll('#labP .snr button, #labP .snr select')].map(e => e.getBoundingClientRect().height);
      return { len: txt.length, m1, m2, back, m3, minFont: Math.min(...sz), minTap: Math.min(...tap) }; });
    ok('EXPORT fills the box and says "Copied" or "Saved"; IMPORT applies it and confirms; bad text says "Not imported"', ui.len > 500 && /Copied|Saved/.test(ui.m1) && /Imported/.test(ui.m2) && ui.back && /Not imported/.test(ui.m3), JSON.stringify(ui));
    ok('phone readable: text >= 14 px, tap targets >= 40 px', ui.minFont >= 14 && ui.minTap >= 40, JSON.stringify(ui));
    await p.evaluate(() => { SND.cfg.on = {}; SND.cfg.off = false; SND.cfg.vol = 1; SND.cfg.music = {}; SND.save(); });
    // (g) jingles: every s_* row off = no AU.sting reaches the speakers (PURE.stung counts the calls that pass the gate)
    const NAMES = ['perfect', 'tierup1', 'tierup2', 'tierup3', 'fever', 'phase', 'boss-in', 'clear', 'fail', 'unlock', 'newbest'];
    const jg = await p.evaluate((NAMES) => { SND.cfg.on = {}; for (const r of SND.T) if (r[1] === 'st') SND.cfg.on[r[0]] = false; PURE.stung = 0; PURE.blocked = 0; for (const n of NAMES) SND.AU.sting(n); const direct = { stung: PURE.stung, blocked: PURE.blocked };
      const m = __mnr; m.SET.diff = 'normal'; m.startStory(1); m.simOn(true); const G = m.G; let i = 0; PURE.stung = 0;
      while (m.running && i < 1500) { if (m.SH && m.SH.active) m.SH.close(); if (m.ST.over) break; m.touchTo(220 + 70 * Math.sin(i * .009), 300); if (i % 20 === 0) m.press('Fire'); if (i === 600) m.bossNow(); if (i === 300) { NR.emit('perfect', { kind: 'dash' }); NR.emit('tier', { tier: 2 }); NR.emit('tier', { tier: 3 }); NR.emit('bossPhase', {}); NR.emit('bossIn', {}); NR.emit('weaponUp', {}); NR.emit('stageClear', {}); } window.__vt += 1000 / 60; m.step(1 / 60); i++; if (G.dead) { m.P.hp = m.P.max; } }
      const flight = { stung: PURE.stung, blocked: PURE.blocked - direct.blocked, frames: i };
      const SNDm = SND; SNDm.set('s_perfect', true); SND.AU.sting('perfect'); const one = PURE.stung; SNDm.set('s_perfect', false); return { direct, flight, one }; }, NAMES);
    ok('all jingle rows off: 11 jingle calls are all blocked; a flight stage (1500 frames, a boss, and the perfect, tier, boss and clear events) lets none through (and the game did ask for some); one switched on lets it pass', jg.direct.stung === 0 && jg.direct.blocked === NAMES.length && jg.flight.stung === 0 && jg.flight.blocked > 0 && jg.one === 1, JSON.stringify(jg));
    const sp = await open(b.br, b.base, 390, 763, '?nomusic=1', 0, true); await sp.waitForFunction(() => window.FOOT && FOOT.S3 && window.SND, null, { timeout: 15000 });
    const sj = await sp.evaluate((NAMES) => { __mnr.RET.tale = false; PURE.stung = 0; FOOT.start('zeil'); const S = FOOT.S; S.P.hp = 99; let n = 0; for (let k = 0; k < 900; k++) { FOOT.sim(.5 / 30, 1 / 60); n++; } for (const x of NAMES) SND.AU.sting(x); const r = { stung: PURE.stung, n, fcue: SND.on('f_mcue'), fcp: SND.on('f_mcp') }; FOOT.stop(); return r; }, NAMES);
    ok('street run with all jingles off: no jingle passes; the song-switch rows f_mcue and f_mcp are off by default', sj.stung === 0 && !sj.fcue && !sj.fcp, JSON.stringify(sj));
    // the old mix: ?pure=0 plays everything (nothing gated)
    const q = await open(b.br, b.base, 390, 763, '?nomusic=1&pure=0', 0, true);
    ok('?pure=0: gate open for every id', await q.evaluate(() => SND.on('perfect') && SND.on('m_duck') && sndOn('heart')));
    ok('?pure=0: no page errors', !q.errs.length, q.errs.join(' | '));
  } finally { await b.close(); }
  done('soundlab');
})();
