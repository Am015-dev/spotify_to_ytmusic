#!/usr/bin/env node
// BEAT LOCK gate (owner 22 Oct: "not beat and tension of enemies"): enemy volleys sit on the song's beat grid and intensity follows the song's sections.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/beatlock-test.js     env: STAGES=1,6,10 SECS=150 (game seconds per stage, stepped, no wall-clock wait) GAME_DIR=...
// Stepped page (?sim=1, game clock = beat clock). A volley = all enemy bullets that appear in one step. 1 volleys within 60 ms of a beat >= 80% per stage
// 2 intensity: enemies spawned per bar in the loud bars of the song (energy >= 7) are >= 1.4x those in the quiet bars (energy <= 3) when both exist
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const STAGES = (process.env.STAGES || '1,6,10').split(',').map(Number), SECS = +process.env.SECS || 150;
const SONGM = new Function(require('fs').readFileSync(path.resolve(__dirname, 'parts/songs.js'), 'utf8') + ';return SONGM;')();
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const RUN = ({ n, secs }) => {
  const m = window.__mnr; m.god = true; m.startStory(n); m.simOn(true); const dt = 1 / 120, seen = new WeakSet(), seenE = new WeakSet(), vol = [], spawn = [];
  for (let i = 0; i < 60; i++) m.step(dt);
  for (let i = 0; i < secs / dt; i++) {
    m.step(dt); if (!m.running) { m.startStory(n); m.simOn(true); }
    const G = m.G; let ns = 0; for (const e of G.en) if (!seenE.has(e)) { seenE.add(e); ns++; } if (ns) spawn.push({ bar: Math.floor(m.bpos() / 4), k: ns });
    let k = 0; for (const b of G.eb) if (!seen.has(b)) { seen.add(b); k++; }
    if (k) { const p = m.bpos(), spb = m.BT.spb; vol.push({ ms: Math.abs(p - Math.round(p)) * spb * 1000, bar: Math.floor((p - 0) / 4), k }); }
    if (G.en.length < 3 && G.boss === undefined) { /* waves come from the director */ }
  }
  const song = m.ST.def.song, S = {};
  return { spawn, bb: m.DIR.bossBar, song, bpm: m.BT.bpm, spb: m.BT.spb, e: '', vol };
};
(async () => {
  const port = await freePort(); const srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const br = await PW.chromium.launch(); let bad = 0; const errs = [];
  for (const n of STAGES) {
    const p = await br.newPage({ viewport: { width: 960, height: 540 } }); p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(() => { try { localStorage.setItem('mnr_tut', '1'); } catch (e) { } });
    await p.goto(`http://127.0.0.1:${port}/index.html?sim=1`, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr);
    const r = await p.evaluate(RUN, { n, secs: SECS }); await p.close();
    const v = r.vol, on = v.filter(x => x.ms <= 60).length, pct = v.length ? 100 * on / v.length : 0;
    const per = {}; for (const x of r.spawn) per[x.bar] = (per[x.bar] || 0) + x.k;
    r.e = (SONGM[r.song] || {}).e || '';
    const bars = r.e.length, avg = f => { let s = 0, c = 0; for (let b = 0; b < Math.min(bars, r.bb || bars, Math.floor(SECS / (r.spb * 4))); b++) if (f(+r.e[b])) { s += per[b] || 0; c++; } return c ? s / c : null; };
    const lo = avg(e => e <= 3), hi = avg(e => e >= 7), ratio = lo === null || hi === null ? null : lo === 0 ? 99 : hi / lo;
    const p1 = pct >= 80, p2 = ratio === null || ratio >= 1.4; if (!p1) bad++; if (!p2) bad++;
    console.log(`${p1 ? 'PASS' : 'FAIL'} 1 stage ${n} (${r.song} ${r.bpm} bpm): ${pct.toFixed(1)}% of ${v.length} volleys within 60 ms of a beat (median off ${v.length ? v.map(x => x.ms).sort((a, b) => a - b)[v.length >> 1].toFixed(0) : '-'} ms)`);
    console.log(`${p2 ? 'PASS' : 'FAIL'} 2 stage ${n}: enemies spawned per bar quiet ${lo === null ? '-' : lo.toFixed(2)} vs loud ${hi === null ? '-' : hi.toFixed(2)} (ratio ${ratio === null ? '-' : ratio.toFixed(2)})`);
  }
  if (errs.length) { bad++; console.log('FAIL page errors ' + errs.slice(0, 2)); }
  srv.kill(); await br.close(); console.log(bad ? bad + ' FAILED' : 'all passed'); process.exit(bad ? 1 : 0);
})().catch(e => { console.log('FAIL crash :: ' + e.stack); process.exit(1); });
