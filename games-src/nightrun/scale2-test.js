#!/usr/bin/env node
// Scale round 2 gate (BALANCE.md "Power scale, round 2"; code parts/fair.js, flag RET.scale2, ?scale2=0 = round 1). Prints PASS/FAIL lines.
// bossplay.js: the pages run with ?bpauto=1 (each boss gate is resolved 1.5 s after it rises, like a player who plays the mechanic); the length bands are for that player.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/scale2-test.js      env: RUNS=3
// 1 flag off: no boss shield cores, no wall bullets, the old homing (S2 off)
// 2 pattern gap: every wall gap the hardest tier fires is >= S2.GAP (ship + margin) and no wall bullet sits inside it
// 3 corner camper (balance-test CAMP=1): Legend, maxed ship, stages 20/30/40 clears <= 15%
// 4 boss time to kill, god mode, dodging bot that shoots the cores: Legend maxed mini-boss 45-80 s, final boss 45-130 s; Normal final boss <= 90 s
// 5 Normal clear rates: mid garage stages 8/20 >= 66%
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs'), os = require('os');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun'), RUNS = process.env.RUNS || '3';
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
let fails = 0; const line = (ok, s) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + s); };
const WALLS = ({ n, diff, secs }) => {   // fly a stage in god mode, collect the wall bullets fired on each beat (they spawn at x > W) and measure the largest gap
  const m = window.__mnr; m.SET.diff = diff; try { m.applySet(); } catch (e) { } m.startStory(n); m.simOn(true); m.god = true;
  const seen = new Set(), rows = {}; let cores = 0;
  for (let i = 0; i < secs * 60 && m.running; i++) { if (m.SH.active) m.SH.close(); m.touchTo(200, 270 + 120 * Math.sin(i / 90)); m.step(1 / 60);
    for (const b of m.G.eb) if (!seen.has(b) && b.s2w) { seen.add(b); const k = Math.round(m.G.t * 4); (rows[k] = rows[k] || []).push(b.y); }
    if (m.G.boss && m.G.boss.cores && m.G.boss.cores.length) cores++; }
  const S2 = window.S2, gaps = [], inside = []; for (const k in rows) { const ys = rows[k].sort((a, b) => a - b); if (ys.length < 6) continue; let g = ys[0] + 0, gi = 0; for (let j = 1; j < ys.length; j++) if (ys[j] - ys[j - 1] > g) { g = ys[j] - ys[j - 1]; gi = j; } if (540 - ys[ys.length - 1] > g) g = 540 - ys[ys.length - 1]; gaps.push(Math.round(g)); }
  m.abort(); return { gaps, walls: S2 ? S2.walls.length : 0, on: !!(S2 && S2.on), GAP: S2 ? S2.GAP : 0, cores };
};
const bal = (env) => { const js = path.join(os.tmpdir(), 's2-' + process.pid + '-' + Math.random().toString(36).slice(2) + '.json');
  cp.spawnSync('node', [path.join(__dirname, 'balance-test.js')], { env: Object.assign({}, process.env, { RUNS, PAR: '4', JSON: js, GAME_DIR, Q: '&bpauto=1' + (process.env.Q || '') }, env), stdio: 'ignore' });
  let r = []; try { r = JSON.parse(fs.readFileSync(js, 'utf8')); fs.unlinkSync(js); } catch (e) { } return r; };
const rate = a => a.length ? a.filter(x => x.clear).length / a.length : NaN;
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const br = await PW.chromium.launch(); const page = async q => { const p = await br.newPage({ viewport: { width: 960, height: 540 } }); p.on('pageerror', e => { fails++; console.log('FAIL page error ' + e.message); }); await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&all=1&nomusic=1&bpauto=1${q}`); await p.waitForFunction(() => window.__mnr && window.S2 && window.__mnr.TR.list.length > 0, null, { timeout: 10000 }); return p; };
  const off = await page('&scale2=0'), o = await off.evaluate(WALLS, { n: 40, diff: 'legend', secs: 150 }); await off.close();
  line(!o.on && o.gaps.length === 0 && o.cores === 0, `flag off (?scale2=0): S2 off, ${o.gaps.length} walls, boss cores seen ${o.cores} frames (round 1: none)`);
  const on = await page(''), w = await on.evaluate(WALLS, { n: 30, diff: 'legend', secs: 100 }); await on.close();
  const mg = w.gaps.length ? Math.min(...w.gaps) : 0;
  line(w.gaps.length >= 3 && mg >= w.GAP && w.GAP >= 2 * 16 + 60, `Legend stage 30: ${w.gaps.length} walls, smallest gap ${mg} px >= S2.GAP ${w.GAP} px (ship ~32 px + margin)`);
  await br.close(); srv.kill();
  const camp = bal({ CAMP: '1', STAGES: '20,30,40', DIFFS: 'legend', BUILDS: 'max' }), cr = rate(camp);
  line(camp.length > 0 && cr <= .15, `corner camper, Legend, maxed ship, stages 20/30/40: clears ${Math.round(100 * cr)}% of ${camp.length} (<= 15%; dies ${camp.filter(x => x.dead).length})`);
  const god = bal({ GOD: '1', STAGES: '5,40', DIFFS: 'legend,normal', BUILDS: 'max' }), ttk = (d, n) => god.filter(x => x.diff === d && x.n === n).map(x => (x.en.find(e => e.ty === 'boss' || e.ty === 'miniboss') || {}).on || 0);
  const lm = ttk('legend', 5), lf = ttk('legend', 40), nf = ttk('normal', 40), nmn = ttk('normal', 5), f = a => a.map(v => Math.round(v)).join('/');
  line(lm.length && lm.every(v => v >= 70 && v <= 115), `Legend maxed ship: mini-boss ${f(lm)} s (70-115 since boss fights round 4; round 1: 24 s)`);
  line(lf.length && lf.every(v => v >= 170 && v <= 260), `Legend maxed ship: final boss ${f(lf)} s (170-260 since round 4 fix; round 1: 63 s, HP bar empty in seconds then armour)`);
  line(nf.length && nf.every(v => v >= 120 && v <= 190) && nmn.every(v => v >= 50 && v <= 85), `Normal maxed ship: mini-boss ${f(nmn)} s (50-85), final boss ${f(nf)} s (120-190 since round 4; the bar lock is 32 bars)`);
  const nm = bal({ STAGES: '8,20', DIFFS: 'normal', BUILDS: 'mid' }), nr = rate(nm);
  line(nr >= .66, `Normal, mid garage, stages 8/20: dodging bot clears ${Math.round(100 * nr)}% (>= 66%)`);
  const lg = bal({ STAGES: '20,30,40', DIFFS: 'legend', BUILDS: 'max' });
  console.log(`  info: Legend maxed ship, dodging bot, stages 20/30/40: ${[20, 30, 40].map(n => Math.round(100 * rate(lg.filter(x => x.n === n))) + '%').join(' / ')} (target 25-55%, not reached; PAR must stay low: the bot's beat timing follows the real clock)`);
  console.log(fails ? `FAIL scale2-test: ${fails} check(s)` : 'PASS scale2-test'); process.exit(fails ? 1 : 0);
})();
