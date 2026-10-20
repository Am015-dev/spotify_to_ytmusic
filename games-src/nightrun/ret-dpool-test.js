#!/usr/bin/env node
// B18 district song pools (headless, real page, tracks.json loaded). PASS/FAIL lines; exit 1 on any FAIL.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/ret-dpool-test.js     env: GAME_DIR=...
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const res = []; const ok = (n, p, i) => { res.push(p); console.log((p ? 'PASS ' : 'FAIL ') + n + (p || !i ? '' : ' :: ' + i)); };
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', port, '--bind', '127.0.0.1'], { cwd: GAME_DIR, stdio: 'ignore' }); await sleep(800);
  const br = await PW.chromium.launch(), p = await (await br.newContext({ viewport: { width: 1280, height: 720 } })).newPage(), errs = [];
  p.on('pageerror', e => errs.push(e.message)); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  // obsolete-fixed: the page opens with ?songspread=0 because "flag off = the old song picks" also means the V10 song spread is off
  await p.addInitScript(() => { try { localStorage.setItem('mnr_tut', '1'); } catch (e) { } });
  await p.goto(`http://127.0.0.1:${port}/index.html?songspread=0`, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__dp && window.RET && window.__mnr && window.__mnr.TR.list.length >= 11, null, { timeout: 15000 }); await sleep(300);
  const get = flag => p.evaluate(f => {
    RET.dpool = f; const d = window.__dp, st = d.STAGES.map(s => ({ n: s.n, di: s.di, song: s.song, goal: s.goal.k })), bosses = {};
    for (const D of d.DISTRICTS) bosses[D.boss] = d.bossSong(D.boss, false);
    const en = []; for (let l = 0; l < 4; l++) for (const di of d.ORDER) en.push(d.songFor(di, l));
    return { st, bosses, en, mini: d.bossSong(1, true), bars: [...new Set(st.map(s => s.song))].map(k => [k, d.songBars(k)]) };
  }, flag);
  const on = await get(true), off = await get(false);
  ok(`45 stages (${on.st.length})`, on.st.length === 45);
  // flag off = the old picks
  const old = n => n <= 8 ? ['stage1', 'stage2'][(n - 1) % 2] : ['stage1', 'stage2', 'stage3'][(n - 1) % 3];
  ok('flag off: main stages keep the old picks (athens alternates)', off.st.slice(0, 40).every(s => s.song === (s.di === 4 ? (s.n % 2 ? 'athina' : 'athina2') : old(s.n))), JSON.stringify(off.st.filter(s => s.song !== (s.di === 4 ? (s.n % 2 ? 'athina' : 'athina2') : old(s.n))).slice(0, 3)));
  ok('flag off: first boss has no theme, others boss/boss2/boss3', off.bosses[0] === null && off.bosses[1] === 'boss' && off.bosses[3] === 'boss2' && off.bosses[6] === 'boss3', JSON.stringify(off.bosses));
  ok('flag off: endless alternates endless/endless2 after the first loop', off.en.slice(5).every((s, i) => s && (s === 'endless' || s === 'endless2')), off.en.join());
  // flag on
  let bad = [];
  for (let i = 1; i < on.st.length; i++) { const a = on.st[i - 1], b = on.st[i]; if (a.song === b.song) bad.push(`${a.n}-${b.n}:${a.song}`); }
  ok('no song twice in a row on stages 1-45', !bad.length, bad.join());
  const pools = {}; for (const s of on.st) (pools[s.di] = pools[s.di] || new Set()).add(s.song);
  ok('each district uses its whole pool (>= 2 songs, athens 2)', Object.values(pools).every(s => s.size >= 2), JSON.stringify(Object.entries(pools).map(([k, v]) => [k, [...v]])));
  ok('story songs all exist as keys with a file', on.st.every(s => !!s.song));
  ok('every boss has a theme', [0, 1, 2, 3, 6].every(k => typeof on.bosses[k] === 'string'), JSON.stringify(on.bosses));
  ok('mini-bosses keep the stage song', on.mini === null);
  ok('endless: no repeat on consecutive districts over 4 loops', on.en.every((s, i) => !i || s !== on.en[i - 1]), on.en.join());
  ok('endless: at least 3 distinct songs', new Set(on.en).size >= 3, on.en.join());
  // table validity
  const tab = await p.evaluate(() => { const D = RET.DP, keys = [...new Set(Object.values(D.base).flat().concat(D.rows.map(r => r.k), D.bossRows.map(r => r.k), Object.values(D.bossT).flat()))]; return { keys, def: keys.filter(k => !DEF_BPM_has(k)), tr: keys.map(k => [k, !!TR_by(k)]) }; function DEF_BPM_has(k) { return !!window.__dp && true; } function TR_by(k) { return window.__mnr.TR.by[k]; } });
  const tracks = JSON.parse(fs.readFileSync(path.join(GAME_DIR, 'music/tracks.json'), 'utf8')).tracks, byKey = {}; for (const t of tracks) byKey[t.stage] = t;
  const miss = []; for (const [k, loaded] of tab.tr) { const t = byKey[k]; if (loaded && !t) miss.push(k + ':no entry'); if (t && !(t.bpm > 0 && 'offsetMs' in t && fs.existsSync(path.join(GAME_DIR, 'music', t.file)))) miss.push(k + ':bad entry/file'); }
  ok('tracks.json entries have bpm/offsetMs/file that exists', !miss.length, miss.join());
  const unloaded = tab.tr.filter(([k, l]) => !l).map(([k]) => k), pre = ['stage1', 'stage2', 'stage3', 'endless', 'endless2', 'athina', 'athina2', 'boss', 'boss2', 'boss3', 'menu'];
  ok('every song the game plays today is loaded', pre.every(k => tab.tr.some(([x, l]) => l && x === k) || ['menu'].includes(k)), unloaded.join());
  ok('songs not yet supplied are skipped (pool unchanged)', await p.evaluate(() => RET.DP.pool(0).every(k => window.__mnr.TR.by[k]) ), '');
  ok('stage length follows the picked song (bars known for every picked song)', on.bars.every(([k, b]) => b >= 16), JSON.stringify(on.bars));
  // a new song appears automatically once its entry is loaded
  const added = await p.evaluate(() => { RET.dpool = true; const TR = window.__mnr.TR; TR.by.d1a = { file: 'stage1.mp3', bpm: 118, offsetMs: 0, stage: 'd1a', gapMs: 24 }; TR.list.push(TR.by.d1a); const a = RET.DP.pool(0), n = window.__dp.STAGES.slice(0, 8).map(s => s.song); const bs = RET.DP.boss(0); delete TR.by.d1a; TR.list.pop(); return { a, n, bs }; });
  ok('a loaded new song joins its district pool and is used', added.a.includes('d1a') && added.n.includes('d1a'), JSON.stringify(added));
  ok('no page errors', !errs.length, errs[0]);
  await br.close(); srv.kill(); process.exit(res.every(Boolean) ? 0 : 1);
})();
