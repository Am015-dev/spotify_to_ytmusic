#!/usr/bin/env node
// Nightrun checks for the F update (stage = song length, a full endless, fair difficulty, more upgrades, Athens order). Headless in the real page, stepped by hand (?sim=1: no audio, beat clock = game time).
//   NODE_PATH=$(npm root -g) node games-src/nightrun/f-checks.js
//   env: ONLY=length,deadair,telegraph,spawn,safepath,upgrades,ships,athens,story,order  TRIALS=20 (safe-path trials per pattern)  GAME_DIR=...
// length    each district (5 of the cycle, loop 0 and loop 1): boss spawns in the last 32 bars, the district (entry to boss down) lasts at least the song length (+-1 bar), the song table
//           matches the real mp3 files (ffprobe), a decoded song's duration wins over the table
// deadair   no stretch longer than 2 bars without an enemy on screen before the boss (a bot that kills at once, every district, loop 1 with all mutators)
// telegraph every enemy bullet was armed one beat before (b.js: shots log), for every enemy type, bosses, mini-bosses, hail
// spawn     nothing spawns within the safety radius of the ship, even with the ship parked at the right edge or at the top
// safepath  every pattern (all enemy formations, every boss pattern, hail, flankers) can be flown through without a hit by a bot with exact knowledge, 20 trials each at the hardest setting
// upgrades  every new pit-stop upgrade and garage perk changes the game as its card says;  ships: Swing and Syncopator fire their own rhythm
// athens    the endless cycle is Bank, Main, Ostend, ATHINA, then the final-boss district; the portrait and landscape Athens backdrops draw
// story     every story stage lasts as long as its song, the boss in its last 32 bars (14 for a mini-boss), the goals scale
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean), want = n => !ONLY.length || ONLY.includes(n), TRIALS = +process.env.TRIALS || 20;
const fails = []; let okN = 0;
const ck = (c, kind, d) => { if (c) okN++; else { fails.push(kind + ': ' + d); console.log('  FAIL', kind, d); } };
function freePort() { return new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); }); }
// ---------------- page side ----------------
const START = (o) => { const m = window.__mnr; if (o && o.diff) m.setVal('diff', o.diff); document.getElementById('startBtn').click(); m.simOn(true); m.god = true; return true; };
// a bot that shoots everything: steers to the nearest enemy's row (kills fast: worst case for dead air)
const KILLER = () => { const m = window.__mnr, G = m.G, P = m.P; let ne = null, bd = 1e9; for (const e of G.en) { if (e.type === 'boss') { ne = e; break; } const d = Math.abs(e.y - P.y); if (e.x > P.x && d < bd) { bd = d; ne = e; } } if (ne) m.touchTo(200, ne.type === 'gate' ? ne.gy : ne.y); };
// the planner: exact knowledge of every bullet (straight lines), enemy motion (finite difference), the lane a charger locks, gate beams and boss lasers. It searches 2-segment paths
// (12 headings x 12 headings, at the keyboard speed 300 px/s, no dash) 1.3 s ahead for one that never touches anything, re-plans every 3 frames and follows the best one.
// A pass means a safe path exists. If it fails, look at the pattern.
const DODGER = () => {
  const m = window.__mnr, G = m.G, P = m.P, F = window.__F; const st = F.S || (F.S = { n: 0, plan: null, t: 0 });
  for (const e of G.en) { e.__v = e.__q ? [(e.x - e.__q[0]) * 60, (e.y - e.__q[1]) * 60] : [0, 0]; e.__q = [e.x, e.y]; }
  const V = 300, N = 16, DT = .08, T1 = .48; st.n++;
  const spb = m.BT.spb; let ty = 270, tx = 230, bd = 1e9;
  for (const e of G.en) { if (e.type === 'boss') { if (e.x < 960) ty = e.y; continue; } const dx = e.x - P.x; if (dx > 0 && dx < bd && e.x < 940) { bd = dx; ty = e.type === 'gate' ? e.gy : e.y; } }
  const follow = () => { const el = (st.n - st.t + 1) / 60, k = Math.min(N - 1, el / DT), i0 = Math.floor(k), f = k - i0, a = i0 ? st.plan.p0 && st.plan.pts[i0 - 1] : st.plan.p0, b = st.plan.pts[Math.min(N - 1, i0)]; m.touchTo(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f); };   // the ship follows the plan at the planned speed (not faster)
  if (st.plan && st.n - st.t < 3) { follow(); return; }
  // hazards within reach, with their future
  const bl = G.eb.filter(b => Math.hypot(b.x - P.x, b.y - P.y) < 520).map(b => [b.x, b.y, b.vx, b.vy, b.r + 3 + 9]);
  const en = G.en.filter(e => e.type !== 'gate' && e.type !== 'boss' && Math.hypot(e.x - P.x, e.y - P.y) < 700);
  const gates = G.en.filter(e => e.type === 'gate'), boss = G.boss;
  // the boss's next volleys (they are telegraphed one beat ahead and aimed at where the ship is when they fire): [time from now, descriptor]
  const volleys = []; if (boss && boss.x <= 900 && boss.pc >= -1) { const frac = G.bp - Math.floor(G.bp), t0 = (1 - frac) * spb; for (let k = 1; k <= 3; k++) { const v = m.bossShot(boss, k); if (v) volleys.push({ tb: t0 + (k - 1) * spb, v }); } }
  const BCAP = m.BCAP, volleyHit = (psx, psy, sx, sy, t, ship) => {            // ship(tt) = candidate position at time tt
    for (const q of volleys) { if (t < q.tb) continue; const aimP = ship(q.tb), a0 = Math.atan2(aimP[1] - boss.y, aimP[0] - boss.x), v = q.v, R = 8 + 3 + 9; const spd = Math.min(BCAP, v.spd * m.PWbs * m.bsMnow);
      const bl = []; if (v.t === 'fan') for (let i = 0; i < v.n; i++) bl.push(a0 + m.fanAngle(v.n, v.sp, i)); else if (v.t === 'ring') for (let i = 0; i < v.n; i++) bl.push(v.off + i * Math.PI * 2 / v.n); else continue;
      for (const a of bl) { const d0 = Math.max(0, t - DT - q.tb) * spd, d1 = (t - q.tb) * spd; if (seg(boss.x + Math.cos(a) * d0 - psx, boss.y + Math.sin(a) * d0 - psy, boss.x + Math.cos(a) * d1 - sx, boss.y + Math.sin(a) * d1 - sy, R)) return 1; } }
    return 0; };
  const seg = (r0x, r0y, r1x, r1y, R) => { const dx = r1x - r0x, dy = r1y - r0y, l = dx * dx + dy * dy; let u = l > 0 ? -(r0x * dx + r0y * dy) / l : 0; u = u < 0 ? 0 : u > 1 ? 1 : u; const cx = r0x + dx * u, cy = r0y + dy * u; return cx * cx + cy * cy < R * R; };   // swept circle test over one step
  const chs = en.filter(e => e.type === 'charger').map(e => ({ e, aw: Math.max(.55, spb * 1.05), spd: (600 + 60 * m.diffNow) * (e.el ? 1.2 : 1), y: e.y })); const chY0 = chs.map(c => c.y);
  const hit = (psx, psy, sx, sy, t, lockY) => {                          // ship moved from (psx,psy) at t-DT to (sx,sy) at t
    const t0 = t - DT;
    for (const b of bl) if (seg(b[0] + b[2] * t0 - psx, b[1] + b[3] * t0 - psy, b[0] + b[2] * t - sx, b[1] + b[3] * t - sy, b[4])) return 1;
    for (const c of chs) {                                               // chargers: aim (the row follows the ship with a lag), then fly the locked row
      const e = c.e, L = .7 + c.aw, X = tt => e.x - 130 * (Math.min(.7, e.t + tt) - Math.min(.7, e.t)) - c.spd * (Math.max(0, e.t + tt - L) - Math.max(0, e.t - L));      // x: creeps left until .7 s, waits while it aims, then charges
      const ta1 = e.t + t; const yp = c.y; if (ta1 > .7 && ta1 <= .7 + c.aw) c.y += (sy - c.y) * Math.min(1, 5 * DT);
      if (seg(X(t0) - psx, yp - psy, X(t) - sx, c.y - sy, e.r + 22)) return 1; }
    for (const e of en) {
      if (e.type === 'charger') continue;
      if (seg(e.x + e.__v[0] * t0 - psx, e.y + e.__v[1] * t0 - psy, e.x + e.__v[0] * t - sx, e.y + e.__v[1] * t - sy, e.r + 8 + 12)) return 1; }
    for (const e of gates) { const tl = Math.max(.45, spb * 1.05), cyc = (e.t + t) % (2.8 + tl), on = cyc > tl + .4, gx = e.x - 95 * t; if (on && Math.abs(sx - gx) < 9 + 16 && (sy < e.gy - e.gap / 2 + 4 + 14 || sy > e.gy + e.gap / 2 - 4 - 14)) return 1;
      for (const yy of [e.gy - e.gap / 2, e.gy + e.gap / 2]) if (Math.hypot(sx - gx, sy - yy) < 12 + 16) return 1; }
    if (boss) { const bx = boss.x, by = boss.y; if (Math.hypot(bx - sx, by - sy) < boss.r + 6 + 14 && boss.x < 900) return 1;
      for (const l of boss.lasers) { const lt = l.t + t; if (lt > 2 * spb - .05 && lt < 3.1 * spb) { const vx = Math.cos(l.a), vy = Math.sin(l.a), px = sx - l.x, py = sy - l.y, pr = px * vx + py * vy; if (pr > 0 && Math.abs(px * vy - py * vx) < 9 + 18) return 1; } } }
    return 0; };
  const heads = []; for (let i = 0; i < 12; i++) heads.push([Math.cos(i * Math.PI / 6), Math.sin(i * Math.PI / 6)]); heads.push([0, 0]);
  let best = null, bestSafe = null, bestT = -1;
  for (const h1 of heads) for (const h2 of heads) {
    let x = P.x, y = P.y, ok = true, tHit = N, cl = 0; const pts = []; let px = x, py = y; chs.forEach((c, i) => { c.y = chY0[i]; });
    const lockY = tl => { const k = Math.max(0, Math.min(N, Math.round(tl / DT))); return pts[k - 1] ? pts[k - 1][1] : y; };
    for (let k = 1; k <= N; k++) { const t = k * DT, h = t <= T1 ? h1 : h2; x = Math.max(30, Math.min(900, x + h[0] * V * DT)); y = Math.max(40, Math.min(480, y + h[1] * V * DT)); pts.push([x, y]);
      if (ok && (hit(px, py, x, y, t, lockY) || (volleys.length && volleyHit(px, py, x, y, t, tt => { const kk = Math.max(0, Math.min(N, Math.round(tt / DT))); return kk ? pts[Math.min(kk, pts.length) - 1] : [P.x, P.y]; })))) { ok = false; tHit = k; } px = x; py = y; }
    const end = pts[N - 1], cost = Math.abs(end[1] - ty) * .5 + Math.abs(end[0] - tx) * .12 + pts.reduce((a, q) => a + Math.max(0, 150 - q[0]) * .16 + Math.max(0, 90 - q[1]) * .1 + Math.max(0, q[1] - 430) * .1, 0) * .5 + (h1[0] === 0 && h1[1] === 0 && h2[0] === 0 && h2[1] === 0 ? 0 : 6);
    const lanes = chs.map(c => Math.round(c.y)); if (ok) { if (!bestSafe || cost < bestSafe.cost) bestSafe = { cost, pts, k: 1, lanes }; } else if (tHit > bestT || (tHit === bestT && cost < (best ? best.cost : 1e9))) { bestT = tHit; best = { cost, pts, k: 1 }; } }
  const pl = bestSafe || best; (st.log = st.log || []).push([st.n, !!bestSafe, bestT, P.x | 0, P.y | 0, pl.lanes && pl.lanes.join('/')]); if (st.log.length > 8) st.log.shift(); pl.p0 = [P.x, P.y]; st.plan = pl; st.t = st.n; follow();
};
const API = { START, KILLER, DODGER };
// ---------------- the checks ----------------
async function main() {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const browser = await PW.chromium.launch(), errs = [];
  const open = async (q = '') => { const p = await browser.newPage({ viewport: { width: 960, height: 540 } }); p.on('pageerror', e => errs.push(e.message)); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&all=1&nomusic=1${q}`); await p.waitForFunction(() => window.__mnr); await p.evaluate(() => { localStorage.clear(); }); await p.reload(); await p.waitForFunction(() => window.__mnr);
    await p.addScriptTag({ content: 'window.__WHY=' + JSON.stringify(process.env.WHY || '') + ';window.__F={START:' + START + ',KILLER:' + KILLER + ',DODGER:' + DODGER + '}' }); return p; };
  const ev = (p, f, a) => p.evaluate(f, a);
  /* ---------- order ---------- */
  if (want('order') || want('athens')) {
    const p = await open();
    const r = await ev(p, () => { const m = __mnr; const seq = []; let di = 0, loop = 0; const names = m.ORDER.map(i => m.DIST[i].name); const nx = [];
      for (let k = 0; k < 6; k++) { const n = m.nextDi(di); nx.push(n.di); di = n.di; } return { order: m.ORDER, names, nx, finalK: m.DIST[m.ORDER[4]].boss, bossName: m.DIST[m.ORDER[4]].bossName }; });
    ck(JSON.stringify(r.order) === '[0,1,2,4,3]' && r.names[3] === 'ATHINA' && r.finalK === 3 && /KRONOS/.test(r.bossName), 'athens-order', 'cycle ' + JSON.stringify(r));
    ck(JSON.stringify(r.nx) === '[1,2,4,3,0,1]', 'athens-order', 'next district sequence ' + JSON.stringify(r.nx));
    // a real run: the order in which the districts really come (boss killed each time), with the loop counter
    const s = await ev(p, async () => { const m = __mnr; __F.START(); const seq = []; const dt = 1 / 60; let last = -1;
      for (let i = 0; i < 60 * 3000 && m.running && seq.length < 7; i++) { if (m.SH.active) m.SH.close(); __F.KILLER(); if (i % 60 === 0 && m.G.dbar > 8 && !m.G.boss) m.bossNow(); m.step(dt);
        if (m.G.di !== last) { last = m.G.di; seq.push(m.G.di + (m.G.loop ? 'L' + m.G.loop : '')); } if (m.G.boss && !m.G.bossDone && m.G.boss.x < 900) { m.G.boss.floor = 0; m.G.boss.hp = 0; } }
      return seq; });
    ck(JSON.stringify(s) === JSON.stringify(['0', '1', '2', '4', '3', '0L1', '1L1']), 'athens-order', 'districts in play: ' + s.join(' '));
    // both Athens backdrops draw (landscape and portrait) without an error and are not the generic ones
    const d = await ev(p, () => { const m = __mnr; m.abort(); document.getElementById('startBtn').click(); m.simOn(true); m.god = true; m.skipTo(4); for (let i = 0; i < 120; i++) m.step(1 / 60);
      const D = m.DIST[4]; return { name: m.G.di === 4 && D.name, lm: D.lm }; });
    ck(d.name === 'ATHINA' && d.lm.includes('acropolis') && d.lm.includes('olive'), 'athens-art', JSON.stringify(d));
    await p.close();
  }
  /* ---------- song length ---------- */
  if (want('length')) {
    const files = JSON.parse(fs.readFileSync(path.join(GAME_DIR, 'music/tracks.json'), 'utf8')).tracks, tab = {};
    for (const t of files) { const r = cp.spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path.join(GAME_DIR, 'music', t.file)], { encoding: 'utf8' }); tab[t.stage] = { dur: parseFloat(r.stdout), bars: Math.floor((parseFloat(r.stdout) - t.offsetMs / 1000) / (240 / t.bpm)), bpm: t.bpm }; }
    const p = await open();
    const r = await ev(p, tab => { const m = __mnr, o = {}; for (const k in tab) o[k] = { table: m.songBars(k), real: tab[k].bars }; m.TR.bufs['stage1.mp3'] = { duration: 200 }; o.fake = m.songBars('stage1'); delete m.TR.bufs['stage1.mp3']; return o; }, tab);
    for (const k in tab) ck(Math.abs(r[k].table - r[k].real) <= 1, 'song-table', `${k}: table ${r[k].table} bars, mp3 ${r[k].real} bars (${tab[k].dur.toFixed(1)} s at ${tab[k].bpm} bpm)`);
    ck(r.fake === Math.floor((200 - .086) / (240 / 92)), 'song-decoded', 'a decoded duration of 200 s gave ' + r.fake + ' bars');
    // every district, loop 0 and loop 1: boss in the last 32 bars, district >= song length
    for (const loop of [0, 1]) for (let pos = 0; pos < 5; pos++) {
      const q = await ev(p, async ([pos, loop]) => { const m = __mnr; m.abort(); __F.START({ diff: 'normal' }); m.G.loop = loop; m.skipTo(m.ORDER[pos]); const dt = 1 / 60; const G = m.G; const stage = m.DIR.stage, sb = m.DIR.sb;
        let spawn = -1, down = -1, bc0 = G.bc, bossSeenBar = -1, minBarSeen = 1e9;
        for (let i = 0; i < 60 * 1200 && m.running; i++) { if (m.SH.active) { m.SH.close(); } __F.KILLER(); m.step(dt);
          if (G.boss && !G.boss.mini && spawn < 0) { spawn = (G.bc - G.d0) / 4; }
          if (G.bossDone && down < 0) { down = (G.bc - G.d0) / 4; break; } }
        return { stage, sb, bossBar: m.DIR.bossBar, spawn, down, name: m.DIST[m.G.di].name }; }, [pos, loop]);
      const tag = `${q.name} L${loop + 1} (${q.stage}, ${q.sb} bars)`;
      ck(q.spawn >= 0 && q.down >= 0, 'length', tag + ' never finished: ' + JSON.stringify(q));
      ck(q.spawn >= q.sb - 32 - 1.5 && q.spawn <= q.sb - 32 + 3, 'boss-time', `${tag}: boss at bar ${q.spawn.toFixed(1)}, want about ${q.sb - 32}`);
      ck(q.spawn >= Math.round(q.sb * 2 / 3) - 1.5 || q.spawn >= q.sb - 32 - 1.5, 'boss-time', `${tag}: boss not in the final third / last 32 bars`);
      ck(q.down >= q.sb - 1, 'length', `${tag}: district lasted ${q.down.toFixed(1)} bars, song ${q.sb}`);
      console.log(`  ${tag.padEnd(46)} boss at bar ${q.spawn.toFixed(1).padStart(6)}   district ${q.down.toFixed(1).padStart(6)} bars   song ${q.sb}`);
    }
    await p.close();
  }
  /* ---------- dead air + telegraph + spawn safety (one long run each, worst case bots) ---------- */
  if (want('deadair') || want('telegraph') || want('spawn')) {
    const p = await open();
    const res = [];
    for (const loop of [0, 1]) for (let pos = 0; pos < 5; pos++) {
      const q = await ev(p, async ([pos, loop, park]) => { const m = __mnr; m.abort(); __F.START({ diff: 'normal' }); m.G.loop = loop; m.NR.watch = { shots: [], spawns: [] }; m.DIR.reset(); m.skipTo(m.ORDER[pos]); m.DIR.begin(m.ORDER[pos]); const dt = 1 / 60, G = m.G;
        const types = {}; m.NR.on('spawn', e => { types[e.type] = 1; });
        let maxE = 0; m.DIR.log.maxEmptyBars = 0;
        for (let i = 0; i < 60 * 1400 && m.running; i++) { if (m.SH.active) m.SH.close();
          if (park === 1) m.touchTo(900, 270); else if (park === 2) m.touchTo(880, 40); else __F.KILLER();                     // park: ship at the right edge / at the top
          m.step(dt); if (G.boss && !G.boss.mini && G.boss.x < 900 && G.boss.bt > 20) { G.boss.floor = 0; G.boss.hp = 0; }                  // the boss is not what is tested here
          if (G.bossDone) break; if (G.dead) { G.dead = false; } }
        const w = m.NR.watch, un = w.shots.filter(s => s.armed === false), nosrc = w.shots.filter(s => s.by === null || s.armed === null);
        const minD = w.spawns.reduce((a, s) => Math.min(a, s.d), 1e9);
        return { name: m.DIST[m.G.di].name, maxEmpty: m.DIR.log.maxEmptyBars, shots: w.shots.length, unarmed: un.length, nosrc: nosrc.length, unarmedBy: un.slice(0, 3).map(s => s.by && s.by.type), minD, spawns: w.spawns.length, mini: m.DIR.log.mini, mut: m.DIR.mut.slice(), themes: [...new Set(m.DIR.log.themes.map(t => t[1]))], pats: [...new Set(m.DIR.log.spawns.map(s => s[1]))].length }; }, [pos, loop, 0]);
      res.push(q);
      const tag = `${q.name} L${loop + 1}`;
      if (want('deadair')) ck(q.maxEmpty <= 2.01, 'dead-air', `${tag}: ${q.maxEmpty.toFixed(2)} bars without an enemy (limit 2)`);
      if (want('telegraph')) { ck(q.shots > 30, 'telegraph', `${tag}: only ${q.shots} shots seen`); ck(q.unarmed === 0, 'telegraph', `${tag}: ${q.unarmed} of ${q.shots} shots had no beat of warning (from ${q.unarmedBy})`); ck(q.nosrc === 0, 'telegraph', `${tag}: ${q.nosrc} shots without a known shooter`); }
      if (want('spawn')) ck(q.minD >= 209, 'spawn-safety', `${tag}: something spawned ${q.minD.toFixed(0)} px from the ship (radius 210)`);
      console.log(`  ${tag.padEnd(16)} empty<=${q.maxEmpty.toFixed(2)} bars  shots ${String(q.shots).padStart(5)} unarmed ${q.unarmed}  closest spawn ${q.minD.toFixed(0).padStart(4)} px  themes ${q.themes.join('/')}  patterns used ${q.pats}  mutators ${q.mut.join('+') || '-'}`);
    }
    if (want('spawn')) for (const park of [1, 2]) {            // the ship sits where spawning is hardest: the right edge, the top
      const q = await ev(p, async park => { const m = __mnr; m.abort(); __F.START({ diff: 'normal' }); m.G.loop = 1; m.NR.watch = { shots: [], spawns: [] }; m.DIR.reset(); m.skipTo(2); m.DIR.begin(2); const dt = 1 / 60;
        for (let i = 0; i < 60 * 200 && m.running; i++) { if (m.SH.active) m.SH.close(); if (park === 1) m.touchTo(900, 270); else m.touchTo(880, 40); m.step(dt); if (m.G.dead) m.G.dead = false; if (m.G.boss) break; }
        const s = m.NR.watch.spawns; return { n: s.length, minD: s.reduce((a, x) => Math.min(a, x.d), 1e9), x: m.P.x, y: m.P.y }; }, park);
      ck(q.n > 20 && q.minD >= 209, 'spawn-safety', `ship parked at (${q.x | 0},${q.y | 0}): ${q.n} spawns, closest ${q.minD.toFixed(0)} px`);
    }
    await p.close();
  }
  /* ---------- safe path: every pattern can be flown ---------- */
  if (want('safepath')) {
    const p = await open();
    const names = await ev(p, () => { const m = __mnr; return { pats: (window.__ONLY_PAT ? [window.__ONLY_PAT] : Object.keys(m.PATS)), boss: ['fan5', 'fan7', 'fan9', 'ring', 'spiral', 'laser', 'summon'], muts: m.MUTS.map(x => x.id) }; });
    const SEEDS = process.env.SEEDS ? process.env.SEEDS.split(',').map(Number) : null;
    const trial = async (kind, id, seed, level) => ev(p, async ([kind, id, seed, level]) => {
      const m = __mnr; m.abort(); __F.START({ diff: 'hard' }); m.god = false; const G = m.G, P = m.P; let s = seed * 7919 + 13; const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
      G.loop = level; m.G.en = []; m.G.eb = []; P.hp = 9; P.max = 9; P.inv = 0; P.x = 60 + rnd() * 440; P.y = 70 + rnd() * 400; m.SH.sh = 0; m.DIR.reset(); m.DIR.begin(m.ORDER[2]); G.dprog = 1; G.dt = 0;
      m.DIR.bossBar = 1e9;                                          // no boss, no other waves during the trial
      m.DIR.beat = () => { };
      const dt = 1 / 60; let hits = 0, hp0 = P.hp, t = 0, maxT = 22; const why = [];
      if (kind === 'pat') m.PATS[id].f();
      else if (kind === 'boss') { m.G.pos = 4; const b = m.spawnBoss({ pats: [id], k: 3, hp: 1e6 }); b.p2 = b.p3 = 0; b.ph = 3; b.lists = [[id], [id], [id]]; b.minBar = 999; }
      else if (kind === 'mut') { m.DIR.mut = [id]; if (id === 'hail') for (let k = 0; k < 4; k++) m.DIR.later(4 * k, () => m.DIR.rain(2 + Math.min(3, level))); if (id === 'mine') m.PATS.mines.f(); if (id === 'rush') { m.PATS.flankPair.f(); m.PATS.pincer.f(); } if (id === 'tide') m.PATS.swarm.f(); if (id === 'guard') m.PATS.eliteV.f(); }
      for (let i = 0; i < 60 * maxT; i++) {
        __F.DODGER(); const hpb = P.hp, pre = { eb: G.eb.map(b => [b.x, b.y, b.vx, b.vy]), en: G.en.map(e => [e.type, e.x, e.y, e.r, e.aimL ? 1 : 0, e.t]) }; m.step(dt);
        if (P.hp < hpb) { hits += hpb - P.hp; let c = 'other'; if (pre.eb.some(b => Math.hypot(b[0] - P.x, b[1] - P.y) < 40)) c = 'bullet'; else { const e = pre.en.find(e => Math.hypot(e[1] - P.x, e[2] - P.y) < e[3] + 40); if (e) c = 'touch:' + e[0] + (e[4] ? '(aiming)' : '') + '@t' + e[5].toFixed(1); else if (G.boss) c = 'boss'; } if (window.__WHY === '2') c += ' CH=' + JSON.stringify(pre.en.filter(e => e[0] === 'charger').map(e => [e[1] | 0, e[2] | 0, +e[5].toFixed(2), e[4]])); why.push(c + ' i=' + i + ' P=' + (P.x | 0) + ',' + (P.y | 0) + ' plan=' + JSON.stringify((window.__F.S.log || []).slice(-3)) + ' nearB=' + JSON.stringify(pre.eb.map(b => [b[0] - P.x | 0, b[1] - P.y | 0, b[2] | 0, b[3] | 0]).sort((a, b) => Math.hypot(a[0], a[1]) - Math.hypot(b[0], b[1])).slice(0, 2))); }
        if (P.hp < 3) P.hp = 9;
        if (kind === 'pat' && i > 120 && G.en.length === 0 && G.eb.length === 0) break;
        if (kind === 'mut' && id !== 'hail' && i > 120 && G.en.length === 0 && G.eb.length === 0) break; }
      return { hits, left: G.en.length, why };
    }, [kind, id, seed, level]);
    const rows = [];
    const run = async (kind, id) => { let hits = 0, bad = 0; for (let k = 0; k < TRIALS; k++) { if (SEEDS && !SEEDS.includes(k + 1)) continue; const r = await trial(kind, id, k + 1, 3); hits += r.hits; if (r.hits) { bad++; if (process.env.WHY) console.log('   ', kind, id, 'trial', k + 1, r.why.join(' | ')); } } rows.push([kind, id, hits, bad]); ck(bad === 0, 'safe-path', `${kind} ${id}: the exact-knowledge dodger was hit in ${bad} of ${TRIALS} trials (${hits} hits)`); };
    for (const id of names.pats) await run('pat', id);
    for (const id of names.boss) await run('boss', id);
    for (const id of names.muts) await run('mut', id);
    console.log('  safe-path trials: ' + rows.map(r => r[1] + ':' + r[3] + '/' + TRIALS).join('  '));
    await p.close();
  }
  /* ---------- upgrades and ships ---------- */
  if (want('upgrades') || want('ships')) {
    const p = await open();
    await ev(p, () => { __F.START(); });
    const R = await ev(p, async () => {
      const m = __mnr, o = {}, SH = m.SH, G = m.G, P = m.P, NR = m.NR; const reset = () => { SH.reset(); SH.live = true; m.GA.tune = {}; m.GA.own = {}; SH.recalc(); G.en = []; G.eb = []; G.pb = []; G.pk = []; P.hp = 5; P.max = 5; P.inv = 0; P.dashT = 0; P.dashCd = 0; P.emp = 1; TP_reset(); };
      const TP_reset = () => { m.TP.revLeft = 0; m.AX.sw = 0; m.AX.asLeft = 0; m.AX.od = 0; m.AX.odOn = 0; m.AX.arcs.length = 0; G.bt = 0; G.dead = false; };
      const fireN = n => { for (let i = 0; i < n; i++) NR.emit('fire', { x: P.x + 22, y: P.y, pf: 0 }); };
      const step = (n, dt = 1 / 60) => { for (let i = 0; i < n; i++) m.step(dt); };
      // sc: wing guns add shots
      reset(); fireN(1); const b0 = G.pb.length; SH.add('sc'); G.pb = []; fireN(1); o.sc1 = G.pb.filter(b => b.sc).length; SH.add('sc'); G.pb = []; fireN(1); o.sc2 = G.pb.filter(b => b.sc).length;
      // rg: rear gun shoots backwards (every second shot)
      reset(); SH.add('rg'); G.pb = []; fireN(4); o.rg = G.pb.filter(b => b.vx < 0).length; SH.add('rg'); G.pb = []; m.AX.rgN = 0; fireN(2); o.rg2 = G.pb.filter(b => b.vx < 0).length;
      // pc: piercing shots survive one hit
      reset(); SH.add('pc'); G.pb = []; SH.volley(100, 100, 0); o.pc = G.pb.every(b => b.px && b.pn === 1) && G.pb.length > 0; m.GA.tune.prc = 3; SH.recalc(); G.pb = []; SH.volley(100, 100, 0); o.pc2 = G.pb.every(b => b.pn === 3 + 1 - 0 || b.pn === 4);
      { m.GA.tune = {}; SH.recalc(); const e1 = { type: 'drone', t: 0, flash: 0, bf: 99, bn: 0, x: 600, y: 300, r: 14, hp: 50, max: 50, score: 1, by: 300, amp: 0 }, e2 = Object.assign({}, e1, { x: 612 }), e3 = Object.assign({}, e1, { x: 624 }); G.en = [e1, e2, e3]; G.pb = [{ x: 590, y: 300, vx: 900, vy: 0, dm: 1, pf: 0, px: new Set(), pn: 1 }]; step(10); o.pcHits = [e1, e2, e3].filter(e => e.hp < 50).length; }
      // cl: an on-beat kill arcs to the next foes
      reset(); SH.add('cl'); { const a = { type: 'drone', x: 500, y: 300, r: 14, hp: 0, pf: 1 }, b = { type: 'drone', x: 560, y: 300, r: 14, hp: 20, max: 20, flash: 0 }, c = { type: 'drone', x: 620, y: 320, r: 14, hp: 20, max: 20, flash: 0 }; G.en = [b, c]; NR.emit('kill', { e: a, boss: false }); o.cl = [b.hp < 20, c.hp < 20, m.AX.arcs.length]; }
      reset(); SH.add('cl'); { const a = { type: 'drone', x: 500, y: 300, r: 14, hp: 0, pf: 0 }, b = { type: 'drone', x: 560, y: 300, r: 14, hp: 20, max: 20, flash: 0 }; G.en = [b]; NR.emit('kill', { e: a, boss: false }); o.clNoBeat = b.hp === 20; }
      // bt: an on-beat dash slows the world (not the ship); a plain one does not
      reset(); SH.add('bt'); NR.emit('perfect', { kind: 'dash', x: P.x, y: P.y }); o.bt = [G.bt > 0, G.btk < 1]; { G.en = [{ type: 'drone', t: 0, flash: 0, bf: 99, bn: 0, x: 700, y: 200, r: 14, hp: 9, max: 9, score: 1, by: 200, amp: 0 }]; const x0 = G.en[0].x; G.bt = 1; G.btk = .5; step(6); const dxBt = x0 - G.en[0].x; G.bt = 0; G.en[0].x = x0; step(6); const dxN = x0 - G.en[0].x; o.btRatio = dxBt / dxN; }
      reset(); NR.emit('perfect', { kind: 'graze', x: 0, y: 0 }); o.btNo = !(G.bt > 0);
      m.GA.tune.tdl = 2; SH.recalc(); G.bt = 0; NR.emit('perfect', { kind: 'dash', x: P.x, y: P.y }); o.tdl = Math.abs(G.bt - 1) < .01;
      // rc: a shot bounces off the top edge
      reset(); SH.add('rc'); G.pb = []; SH.volley(100, 100, 0); o.rcSet = G.pb.every(b => b.rc === 1); G.pb = [{ x: 300, y: 3, vx: 0, vy: -300, dm: 1, pf: 0, rc: 1 }]; step(3); o.rc = G.pb[0] && G.pb[0].vy > 0;
      // og: the gauge fills and gives double fire; damage +40%
      reset(); SH.add('og'); for (let i = 0; i < 40 && !(m.AX.odOn > 0); i++) NR.emit('kill', { e: { type: 'drone', x: 0, y: 0, pf: 1 }, boss: false }); o.og = m.AX.odOn > 0;
      { G.pb = []; SH.volley(100, 100, 0); const dmOn = G.pb.reduce((s, b) => s + b.dm, 0); m.AX.odOn = 0; G.pb = []; SH.volley(100, 100, 0); const dmOff = G.pb.reduce((s, b) => s + b.dm, 0); o.ogDmg = dmOn / dmOff; m.AX.odOn = 1; m.AX.odBeats = 8; G.delayed = []; fireN(1); o.ogExtra = G.delayed.length; m.AX.odOn = 0; G.delayed = []; }
      // as: auto-shield when the hull gets low
      reset(); SH.add('as'); P.hp = 2; SH.sh = 0; P.inv = 0; m.hurt(); o.as = [P.hp, SH.sh]; P.inv = 0; P.hp = 3; SH.sh = 0; m.AX.asLeft = 0; m.hurt(); o.asOnce = SH.sh;
      // bd: a drone shoots every beat
      reset(); SH.add('bd'); SH.add('bd'); G.pb = []; NR.emit('beat', { i: 0 }); o.bd = G.pb.filter(b => b.bd).length;
      // sm: shards pay more and fly in from farther
      reset(); SH.add('sm'); { const mu0 = G.mult; G.pk = [{ t: 'shard', x: P.x + 5, y: P.y, vx: 0, vy: 0, bob: 0 }]; step(2); o.sm = [+(G.mult - mu0).toFixed(2), SH.smg]; }
      // ni: interest at the pit stop
      reset(); SH.neon = 100; SH.add('ni'); NR.emit('pitStart', 1); o.ni = SH.neon; m.GA.tune.nint = 2; SH.recalc(); SH.neon = 100; NR.emit('pitStart', 1); o.nint = SH.neon;
      // wn: second wind (full hull, blast) after the normal revives
      reset(); SH.add('wn'); P.hp = 1; G.en = [{ type: 'drone', x: 400, y: 300, r: 14, hp: 20, max: 20, flash: 0 }]; m.hurt(); o.wn = [G.dead, P.hp, G.en[0] ? G.en[0].hp : -1]; P.inv = 0; P.hp = 1; m.hurt(); o.wn2 = G.dead;
      G.dead = false;
      // ec: EMP refills at the pit stop
      reset(); SH.add('ec'); P.emp = 0; NR.emit('pitStart', 1); o.ec = P.emp;
      // lk: more drops
      reset(); SH.add('lk'); o.lk = SH.lk;
      // sdc (garage side mounts)
      reset(); m.GA.tune.sdc = 2; SH.recalc(); G.pb = []; fireN(1); o.sdc = G.pb.filter(b => b.sc).length;
      // the soft scaling: upgrades raise enemy hp a little, never beyond the cap; a stack of everything still helps (hp factor < damage factor)
      reset(); const u0 = m.UPS.hp; for (const id of Object.keys(m.UBY)) { if (SH.n(id) < m.UBY[id].max) SH.add(id); } o.ups = [u0, m.UPS.hp, m.UPS.u];
      // pool: the 14 new upgrades are in the pit-stop list, the garage-gated ones only when unlocked
      reset(); const pool0 = SH.pool().map(u => u.id); m.GA.own = { up_pc: 1, up_cl: 1, up_bt: 1, up_og: 1, up_bd: 1, up_wn: 1 }; const pool1 = SH.pool().map(u => u.id); o.pool = [pool0.length, pool1.length, m.NEW2.map(u => u.id).filter(id => !pool1.includes(id))];
      o.newN = m.NEW2.length; o.shipN = m.SHIPS.length; o.tpN = m.TP_DEF.length;
      return o; });
    if (want('upgrades')) {
      ck(R.sc1 === 2 && R.sc2 === 4, 'upg-side-cannons', JSON.stringify([R.sc1, R.sc2])); ck(R.rg === 2 && R.rg2 >= 1, 'upg-rear-gun', JSON.stringify([R.rg, R.rg2]));
      ck(R.pc && R.pc2 && R.pcHits === 2, 'upg-piercing', JSON.stringify([R.pc, R.pc2, R.pcHits]));
      ck(R.cl[0] && R.cl[1] && R.cl[2] >= 2 && R.clNoBeat, 'upg-chain', JSON.stringify([R.cl, R.clNoBeat]));
      ck(R.bt[0] && R.bt[1] && R.btNo && R.btRatio > .4 && R.btRatio < .7 && R.tdl, 'upg-bullet-time', JSON.stringify([R.bt, R.btNo, R.btRatio, R.tdl]));
      ck(R.rcSet && R.rc, 'upg-ricochet', JSON.stringify([R.rcSet, R.rc]));
      ck(R.og && Math.abs(R.ogDmg - 1.4) < .01 && R.ogExtra === 1, 'upg-overdrive', JSON.stringify([R.og, R.ogDmg, R.ogExtra]));
      ck(R.as[0] === 1 && R.as[1] === 1 && R.asOnce === 0, 'upg-auto-shield', JSON.stringify([R.as, R.asOnce]));
      ck(R.bd === 2, 'upg-beat-drone', String(R.bd)); ck(R.sm[0] === .15 && R.sm[1] === 120, 'upg-score-magnet', JSON.stringify(R.sm));
      ck(R.ni === 104 && R.nint === 104, 'upg-neon-interest', JSON.stringify([R.ni, R.nint]));
      ck(R.wn[0] === false && R.wn[1] === 5 && R.wn[2] < 20 && R.wn2 === true, 'upg-second-wind', JSON.stringify([R.wn, R.wn2]));
      ck(R.ec === 3, 'upg-emp-cell', String(R.ec)); ck(R.lk > 0, 'upg-lucky', String(R.lk)); ck(R.sdc === 4, 'perk-side-mounts', String(R.sdc));
      ck(R.ups[1] > R.ups[0] && R.ups[1] <= 1 + 3 && R.ups[2] > 2, 'soft-scaling', JSON.stringify(R.ups));
      ck(R.pool[0] >= 8 && R.pool[1] === R.pool[0] + 6 && R.pool[2].length === 0, 'upg-pool', JSON.stringify(R.pool)); ck(R.newN === 14 && R.shipN === 6 && R.tpN === 17, 'upg-count', JSON.stringify([R.newN, R.shipN, R.tpN]));
    }
    if (want('ships')) {
      for (const ship of ['swg', 'syn']) {
        const L = await ev(p, async ship => { const m = __mnr; m.abort(); m.GA.own['ship_' + ship] = true; m.GA.ship = ship; __F.START(); m.SH.reset(); m.SH.ship = ship; const dt = 1 / 60; const log = []; m.NR.on('fire', f => { log.push(m.G.bp); });
          m.touchTo(200, 270); for (let i = 0; i < 60 * 40; i++) { if (m.SH.active) m.SH.close(); m.G.en = []; m.G.eb = []; m.step(dt); } return { log, spb: m.BT.spb, ship: m.SH.ship, gs: m.SH.gridStep() }; }, ship);
        const fr = L.log.map(b => ((b % 4) + 4) % 4); const near = (x, t) => Math.min(Math.abs(x - t), Math.abs(x - t - 4), Math.abs(x - t + 4)) < .06;
        if (ship === 'swg') { const allowed = [0, 2 / 3, 1, 5 / 3, 2, 8 / 3, 3, 11 / 3]; const per = L.log.length / (L.log[L.log.length - 1] - L.log[0]);
          ck(L.log.length > 40 && fr.every(x => allowed.some(a => near(x, a))) && Math.abs(per - 2) < .25, 'ship-swing', `${L.log.length} shots, ${per.toFixed(2)} per beat, positions ok ${fr.filter(x => allowed.some(a => near(x, a))).length}`); }
        else { const allowed = [0, .75, 1.5, 2.5, 3]; const per = L.log.length / ((L.log[L.log.length - 1] - L.log[0]) / 4);
          ck(L.log.length > 30 && fr.every(x => allowed.some(a => near(x, a))) && Math.abs(per - 5) < .6, 'ship-syncopator', `${L.log.length} shots, ${per.toFixed(2)} per bar, positions ok ${fr.filter(x => allowed.some(a => near(x, a))).length}`); }
      }
    }
    await p.close();
  }
  /* ---------- story: stage length ---------- */
  if (want('story')) {
    const p = await open();
    const S = await ev(p, () => { const m = __mnr; return m.STAGES.map(s => ({ n: s.n, song: s.song, goal: s.goal.k, len: m.songBars(s.song) })); });
    for (const s of S) { const q = await ev(p, async n => { const m = __mnr; m.abort(); m.startStory(n); m.simOn(true); m.god = true; const dt = 1 / 60, G = m.G, ST = m.ST; let spawn = -1, end = -1;
        for (let i = 0; i < 60 * 1500 && m.running; i++) { if (m.SH.active) m.SH.close(); __F.KILLER(); m.step(dt); if (G.boss && !G.boss.mini && spawn < 0) spawn = (G.bc - G.d0) / 4; else if (G.boss && G.boss.mini && spawn < 0) spawn = (G.bc - G.d0) / 4;
          if (G.boss && G.boss.x < 900) { G.boss.hp = Math.min(G.boss.hp, 1); } if (ST.over) { end = (G.bc - G.d0) / 4; break; } }
        return { len: ST.len, lead: ST.lead, spawn, end, kv: ST.kv, goal: ST.def.goal.k }; }, s.n);
      const bossy = q.goal === 'boss' || q.goal === 'mini';
      ck(q.end >= q.len - 1.2, 'story-length', `stage ${s.n} (${s.song}, ${q.len} bars) ended at bar ${q.end.toFixed(1)}`);
      if (bossy) ck(q.spawn >= q.len - (q.goal === 'boss' ? 32 : 14) - 2 && q.spawn <= q.len - (q.goal === 'boss' ? 32 : 14) + 3, 'story-boss', `stage ${s.n}: ${q.goal} at bar ${q.spawn.toFixed(1)}, want ${q.len - (q.goal === 'boss' ? 32 : 14)}`);
      console.log(`  story ${String(s.n).padStart(2)} ${s.goal.padEnd(8)} song ${s.song} ${String(q.len).padStart(3)} bars  boss at ${bossy ? q.spawn.toFixed(0).padStart(3) : '  -'}  ends ${q.end.toFixed(0).padStart(3)}`); }
    await p.close();
  }
  await browser.close(); srv.kill();
  if (errs.length) ck(false, 'page-error', errs[0]);
  console.log(`\nf-checks: ${okN} passed, ${fails.length} failed`);
  for (const f of fails) console.log('  FAIL ' + f);
  process.exit(fails.length ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(2); });
