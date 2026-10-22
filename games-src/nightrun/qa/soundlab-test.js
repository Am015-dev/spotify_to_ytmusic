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
    ok('default: only hurt, pick, boom on; no music effect', def.on.sort().join() === 'boom,hurt,pick' && def.keep.join() === 'boom,hurt,pick' && !def.mu, JSON.stringify(def));
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
