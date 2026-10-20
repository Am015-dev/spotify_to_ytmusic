#!/usr/bin/env node
// Nightrun industry-standards audit: measures what INDUSTRY-STANDARDS.md can check today and prints PASS / FAIL / SKIP per standard.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/industry-audit.js
//   env: STAGES=3,8,10,20,30 (Normal, one run each)  SEEDS=3  MAXT=400 (game s per stage)  PAR=4  Q=<extra query string, e.g. &react=1>
//        REPEAT=<file> (repeat-audit json to read the cross-session numbers from; default: newest review/repeat-audit*.json)
//        RUN_REPEAT=1 (run repeat-audit.js arcade-normal first, ~10+ min)  OUT=<file> (default review/industry-audit.json)
// The bot is repeat-audit.js's dodger (its `dec` grid is cut out of that file, so it is the same bot); god mode so every stage is seen to its end.
// Per frame it watches: each enemy (first visible -> removed: killed or escaped), enemy bullets on screen, the boss window, dash/EMP presses.
// Predictability: stage 10 played with SEEDS different Math.random seeds (spawn-schedule Jaccard, first-15 spawn orders, fire-interval CV).
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
// --quick: one stage, no seeds, no non-god runs, plus the cheap harnesses (counter-test, abil-test, ~1 min total)   --gate: exit 1 when any hard standard FAILs
const QUICK = process.argv.includes('--quick'), GATE = process.argv.includes('--gate');
const STAGES = (process.env.STAGES || (QUICK ? '3' : '3,8,10,20,30')).split(',').map(Number), SEEDS = process.env.SEEDS != null ? +process.env.SEEDS : (QUICK ? 0 : 3), MAXT = +process.env.MAXT || (QUICK ? 120 : 400), PAR = +process.env.PAR || 4;
const NOGOD = QUICK ? [] : (process.env.NOGOD || '3,8,20').split(',').filter(Boolean).map(Number);   // bot not in god mode: bullet contacts (S24)
const OUT = process.env.OUT || path.join(__dirname, 'review', 'industry-audit.json');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const med = a => { if (!a.length) return null; const s = a.slice().sort((x, y) => x - y), h = s.length >> 1; return s.length % 2 ? s[h] : (s[h - 1] + s[h]) / 2; };
const pct = (a, q) => { if (!a.length) return null; const s = a.slice().sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(q * s.length))]; };
const mean = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null, r2 = x => x == null ? null : Math.round(x * 100) / 100;

// the dodge grid is cut out of repeat-audit.js so both audits use the same bot
const RA = fs.readFileSync(path.join(__dirname, 'repeat-audit.js'), 'utf8'), a0 = RA.indexOf('  const dec = () => {'), a1 = RA.indexOf('\n  };\n', a0) + 6;
if (a0 < 0 || a1 < 6) { console.error('cannot find the bot (dec) in repeat-audit.js'); process.exit(2); }
const DEC = RA.slice(a0, a1);

// ---------- in the page: one stage, instrumented ----------
const RUN = new Function('o', `
  const m = window.__mnr; let sd = o.seed >>> 0; const rnd = () => { sd = (sd + 0x6D2B79F5) >>> 0; let t = sd; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const realRnd = Math.random; Math.random = rnd;
  m.SET.diff = 'normal'; m.applySet(); if (m.ARC) m.ARC.set(true); m.god = o.god !== false;
  const NR = m.NR, sp = [], pits = [], bossIn = [];
  if (!window.__ia) { window.__ia = { on: 1 }; }
  window.__iaH = window.__iaH || [];
  const h1 = NR.on('spawn', e => sp.push([m.G.t, e.type + (e.el ? '*' : '')])), h2 = NR.on('pitStart', () => pits.push(m.G.t)), h3 = NR.on('bossIn', x => bossIn.push([m.G.t, !!x.mini]));
  m.startStory(o.n); m.simOn(true); m.NR.watch = { shots: [], spawns: [] };
  ${DEC}
  const seen = new Map(), life = [], ebN = [], enN = [], bossEbN = [], fireBy = new Map(); const hitSeen = new WeakSet(); let wouldHit = 0, dashes = 0, reflex = 0, emps = 0, d = null, i = 0, lastBoss = null, bossWin = [], bossNow = null, bossMax = 0, lanes = 0, lastLane = null, hp0 = null;
  const dt = 1 / 60, cap = o.maxt, ST = m.ST; let cleared = false, lastBeat = -1, tapAt = -1;
  while (m.running && m.G.t < cap) {
    const G = m.G, P = m.P; if (m.SH.active) m.SH.close();
    if (i % 3 === 0) { d = dec(); m.touchTo(d.bx, d.by);
      if (d.dash && P.dashCd <= 0) { dashes++; if (G.eb.some(b => Math.hypot(b.x - P.x, b.y - P.y) < 60)) reflex++; m.press('Dash'); }
      if (d.emp) { emps++; m.press('Emp'); }
      const lane = Math.round(d.by / 90); if (lastLane != null && lane !== lastLane) lanes++; lastLane = lane; }
    const bp = m.bpos(), bn = Math.floor(bp); if (bn !== lastBeat) { lastBeat = bn; tapAt = bn + (rnd() < .4 ? 0 : (.15 + rnd() * .7)); } if (tapAt >= 0 && bp >= tapAt) { m.press('Fire'); tapAt = -1; }
    for (const b of G.eb) if (!hitSeen.has(b) && Math.hypot(b.x - P.x, b.y - P.y) < b.r + 3) { hitSeen.add(b); wouldHit++; }
    m.step(dt); i++;
    const G2 = m.G, now = G2.t, cur = new Set();
    for (const e of G2.en) { if (e.type === 'boss') continue; cur.add(e); let s = seen.get(e); if (!s && e.x < 950 && e.x > -20) { s = { t0: now, k: e.type + (e.el ? '*' : ''), x0: e.x }; seen.set(e, s); } }
    for (const [e, s] of seen) if (!cur.has(e) && !s.done) { s.done = 1; life.push({ k: s.k, life: now - s.t0, killed: e.x > -20 && e.x < 940 }); seen.delete(e); }
    if (i % 6 === 0) { enN.push(cur.size); (G2.boss ? bossEbN : ebN).push(G2.eb.length); }
    const b = G2.boss; if (b && !bossNow) { bossNow = { t0: now, nm: b.nm, ph: 0, verbs: new Set() }; } if (bossNow) { if (b) { bossNow.ph = Math.max(bossNow.ph, b.ph || 0); if (b.lists) for (const l of b.lists) for (const v of l) bossNow.verbs.add(v); bossNow.mini = !!(b.mini || (bossIn.length && bossIn[bossIn.length - 1][1])); } else { bossNow.dur = now - bossNow.t0; bossNow.verbs = [...bossNow.verbs]; bossWin.push(bossNow); bossNow = null; } }
    const w = m.NR.watch; if (w && i % 6 === 0) { for (const s of w.shots) if (s.by && s.by.type !== 'boss') { let a = fireBy.get(s.by); if (!a) fireBy.set(s.by, a = []); if (!a.length || s.t - a[a.length - 1] > .25) a.push(s.t); } w.shots.length = 0; w.spawns.length = 0; }
    if (G2.dead) break; if (ST.over) { cleared = true; break; }
  }
  if (bossNow) { bossNow.dur = m.G.t - bossNow.t0; bossNow.verbs = [...bossNow.verbs]; bossNow.open = 1; bossWin.push(bossNow); }
  const cvs = []; for (const [, a] of fireBy) if (a.length >= 3) { const g = []; for (let j = 1; j < a.length; j++) g.push(a[j] - a[j - 1]); const mu = g.reduce((x, y) => x + y, 0) / g.length; if (mu > 0) cvs.push(Math.sqrt(g.reduce((x, y) => x + (y - mu) * (y - mu), 0) / g.length) / mu); }
  const r = { n: o.n, seed: o.seed, t: +m.G.t.toFixed(1), clear: cleared, hits: wouldHit, life, ebN, enN, bossEbN, bossWin, spawns: sp, dashes, reflex, emps, lanes, pits: pits.length, fireCV: cvs, setKeys: Object.keys(m.SET || {}) };
  m.NR.watch = null; m.abort(); m.god = false; Math.random = realRnd; return r;`);

// checkpoints (S26) are built per story stage (never in arcade), so this reads the plan the page builds for each stage; no sim runs
const CPPROBE = (stages) => { const m = window.__mnr, out = []; for (const n of stages) { m.ARC.on = false; m.ST.setLevel(n); m.ST.on = true; window.CHK.build(); out.push({ n, len: Math.round(m.ST.len), cps: window.CHK.plan.length }); } return out; };

// the harnesses print their numbers in PASS/FAIL lines; these are read back from the output
const harness = (file, env, ms) => { const r = cp.spawnSync('node', [path.join(__dirname, file)], { cwd: __dirname, env: Object.assign({}, process.env, env || {}), encoding: 'utf8', timeout: ms || 600000 }); return (r.stdout || '') + (r.stderr || ''); };   // a timeout keeps the lines printed so far

(async () => {
  const t0 = Date.now(), errors = [];
  if (process.env.RUN_REPEAT) { console.log('running repeat-audit (arcade-normal)...'); cp.spawnSync('node', [path.join(__dirname, 'repeat-audit.js')], { env: Object.assign({}, process.env, { CONFIGS: 'arcade-normal', PAR: '1', OUT: path.join(__dirname, 'review', 'repeat-audit-industry.json') }), stdio: 'inherit' }); }
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const browser = await PW.chromium.launch();
  const newPage = async () => { const ctx = await browser.newContext({ viewport: { width: 960, height: 540 } }), p = await ctx.newPage(); p.on('pageerror', e => errors.push(e.message.slice(0, 160)));
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort()); await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&all=1${process.env.Q || ''}`);
    await p.waitForFunction(() => window.__mnr && window.__mnr.TR.list.length > 0, null, { timeout: 15000 }).catch(() => { }); return p; };
  const jobs = STAGES.map(n => ({ n, seed: 1000 + n, maxt: MAXT }));
  for (let s = 0; s < SEEDS; s++) jobs.push({ n: 10, seed: 7 + s * 101, maxt: 90, pred: 1 });
  for (const n of NOGOD) jobs.push({ n, seed: 2000 + n, maxt: MAXT, god: false, nogod: 1 });
  const runs = [], queue = jobs.slice();
  await Promise.all(Array.from({ length: Math.min(PAR, queue.length) }, async () => { const p = await newPage();
    while (queue.length) { const j = queue.shift(); const r = await p.evaluate(`(${RUN.toString().replace(/^function anonymous\(o\s*\)\s*\{/, 'function(o){')})(${JSON.stringify(j)})`).catch(e => ({ err: String(e).slice(0, 200), n: j.n })); r.pred = j.pred; r.nogod = j.nogod; runs.push(r); console.log(`stage ${j.n} seed ${j.seed}${j.pred ? ' (pred)' : ''}: ${r.err || r.t + ' s, ' + (r.clear ? 'clear' : 'not cleared')}`); } }));
  const cpRows = await newPage().then(p => p.evaluate(CPPROBE, STAGES)).catch(e => { errors.push('cp probe: ' + String(e).slice(0, 160)); return []; });
  await browser.close(); srv.kill();
  const main = runs.filter(r => !r.pred && !r.nogod && !r.err).sort((a, b) => a.n - b.n), pred = runs.filter(r => r.pred && !r.err), nog = runs.filter(r => r.nogod && !r.err);
  if (!main.length) { console.error('no stage run succeeded', runs.map(r => r.err)); process.exit(2); }

  // ---------- measures ----------
  const M = {}, allLife = main.flatMap(r => r.life), kinds = {};
  for (const l of allLife) (kinds[l.k] = kinds[l.k] || []).push(l);
  M.lifeByKind = Object.fromEntries(Object.entries(kinds).filter(([, a]) => a.length >= 8).map(([k, a]) => [k, { n: a.length, median: r2(med(a.map(x => x.life))), killedShare: r2(a.filter(x => x.killed).length / a.length), killedWithin07: r2(a.filter(x => x.killed && x.life < .7).length / a.length) }]));
  M.lifeMedianAll = r2(med(allLife.map(l => l.life))); { const ks = Object.entries(M.lifeByKind).sort((a, b) => a[1].median - b[1].median)[0]; M.kindMedianMin = ks[1].median; M.kindMedianMinKind = ks[0]; }
  const killed = allLife.filter(l => l.killed); M.killedShare = r2(killed.length / Math.max(1, allLife.length)); M.killedUnder07 = r2(killed.filter(l => l.life < .7).length / Math.max(1, killed.length));
  M.ebMean = r2(mean(main.flatMap(r => r.ebN))); M.ebP95 = pct(main.flatMap(r => r.ebN), .95); M.ebBossP95 = pct(main.flatMap(r => r.bossEbN), .95); M.ebMax = Math.max(...main.flatMap(r => r.ebN.concat(r.bossEbN)));
  M.enMean = r2(mean(main.flatMap(r => r.enN)));
  const byStage = n => main.find(r => r.n === n); const lo = main[0], hi = main[main.length - 1];
  M.ebRamp = r2(mean(hi.ebN) / Math.max(1, mean(lo.ebN))); M.ebRampStages = [lo.n, hi.n];
  const mins = main.reduce((a, r) => a + r.t, 0) / 60; M.gameMinutes = r2(mins);
  M.spawnsPerMin = r2(main.reduce((a, r) => a + r.spawns.length, 0) / mins);
  const drone = main.flatMap(r => r.spawns).filter(s => /^drone/.test(s[1])).length, spN = main.reduce((a, r) => a + r.spawns.length, 0); M.droneShare = r2(drone / Math.max(1, spN));
  M.stageSecs = main.map(r => [r.n, r.t, r.clear]); M.stageSecsMedian = r2(med(main.map(r => r.t)));
  const bw = main.flatMap(r => r.bossWin.filter(b => !b.open).map(b => Object.assign({ n: r.n }, b)));
  M.bosses = bw.map(b => ({ n: b.n, nm: b.nm, secs: r2(b.dur), phases: b.ph, verbs: b.verbs.length, mini: !!b.mini }));
  M.bossSecsMedian = r2(med(bw.filter(b => b.dur > 8).map(b => b.dur))); { const ph = bw.filter(b => b.dur > 8 && !b.mini && b.ph > 0).map(b => b.ph); M.bossPhasesMin = ph.length ? Math.min(...ph) : null; M.bossPhasesMedian = med(ph); M.bossesWithPhaseData = ph.length; }
  M.bossVerbsMedian = r2(med(bw.map(b => b.verbs.length)));
  const secs = main.reduce((a, r) => a + r.t, 0) / 60;
  M.dashPerMin = r2(main.reduce((a, r) => a + r.dashes, 0) / secs); M.empPerMin = r2(main.reduce((a, r) => a + r.emps, 0) / secs); M.laneChangesPerMin = r2(main.reduce((a, r) => a + r.lanes, 0) / secs);
  M.dashReflexShare = r2(main.reduce((a, r) => a + r.reflex, 0) / Math.max(1, main.reduce((a, r) => a + r.dashes, 0)));
  // WHY[id] = the reason a SKIP is a SKIP (printed next to it)
  const WHY = {};
  // S24: bullet contacts come from the non-god runs only (the god-mode bot is never hit by design)
  M.hitsPerStage = nog.length ? r2(mean(nog.map(r => r.hits))) : null; M.nogodRuns = nog.map(r => [r.n, r.t, r.clear, r.hits]);
  if (!nog.length) WHY.S24 = 'no non-god run (NOGOD empty)';
  // S26: checkpoints per story stage of 150 s or longer (the worst such stage counts)
  const cpLong = cpRows.filter(x => x.len >= 150); M.checkpointsPerStage = cpLong.length ? Math.min(...cpLong.map(x => x.cps)) : null; M.cpRows = cpRows;
  if (!cpLong.length) WHY.S26 = 'no story stage of 150 s or longer (CPPROBE: ' + cpRows.map(x => x.n + '=' + x.len + 's').join(' ') + ')';
  // S27: pit stops in the arcade sim (every main run is arcade)
  const pitN = main.reduce((a, r) => a + r.pits, 0); M.pitStopsPerHour = pitN ? r2(pitN / (mins / 60)) : null;
  if (!pitN) WHY.S27 = `pit stop never fired in ${r2(mins)} game-min of arcade sim (0 pitStart); not changed here, see choices-test.js`;
  M.assistKeys = [...new Set(main[0].setKeys)].filter(k => /assist|slow|speed|invinc|aim|easy|auto|hit/i.test(k));
  if (pred.length >= 2) {
    const sched = r => new Set(r.spawns.map(s => s[1] + '@' + Math.floor(s[0] / 3))), jac = (a, b) => { let i = 0; for (const x of a) if (b.has(x)) i++; return i / (a.size + b.size - i || 1); };
    const js = []; for (let i = 0; i < pred.length; i++) for (let j = i + 1; j < pred.length; j++) js.push(jac(sched(pred[i]), sched(pred[j])));
    M.predJaccard = r2(mean(js)); M.predDistinctOrders = new Set(pred.map(r => r.spawns.slice(0, 15).map(s => s[1]).join(','))).size; M.predSeeds = pred.length;
    const cv = pred.flatMap(r => r.fireCV); M.fireCV = r2(med(cv)); M.fireCVn = cv.length;
  }
  // cross-session numbers (repeat-audit)
  const rf = process.env.REPEAT || (() => { const d = path.join(__dirname, 'review'); const f = fs.readdirSync(d).filter(x => /^repeat-audit.*\.json$/.test(x)).map(x => [x, fs.statSync(path.join(d, x)).mtimeMs]).sort((a, b) => b[1] - a[1]); return f.length ? path.join(d, f[0][0]) : ''; })();
  let RA3 = null; if (rf && fs.existsSync(rf)) { try { RA3 = JSON.parse(fs.readFileSync(rf, 'utf8'))['arcade-normal']; M.repeatFile = path.relative(process.cwd(), rf); } catch (e) { } }
  if (RA3) { const st = Object.values(RA3.stages || {}); Object.assign(M, { repeat5: RA3.repeatRatio5min, plainLoop: RA3.plainLoopShare, jaccardStages: RA3.jaccardMedian, longestMechGapMin: RA3.longestMechGapMin, newThingsPer30: RA3.newThingsFirst30, firstTryClear: r2(1 - RA3.firstTryFails / Math.max(1, st.length)), bossKits: RA3.distinctBossVerbKits, bossFights: RA3.bossFights, pitStops: RA3.pitStops, gameMinSession: RA3.gameMinutes, per5min: RA3.per5min }); }

  // ---------- harness probes: run one after another (never in parallel with the sims above) ----------
  const H = { threats: [], abilClear: null, firstKill: null, weapons: [] };
  { const cnt = harness('counter-test.js');   // per threat: "PASS SEEKER (...): hull lost without 4, with the timed answer 0"
    H.threats = [...cnt.matchAll(/^(?:PASS|FAIL) ([^:\n]+):[^\n]*?without (\d+), with the timed (?:answer|EMP) (\d+)/gm)].map(m => ({ threat: m[1].trim(), without: +m[2], with: +m[3], ratio: +m[2] / Math.max(+m[3], 1) }));
    const ab = harness('abil-test.js').match(/clears (\d+)% with abilities, (\d+)% without/);   // logged for reference; S30 itself is the hull ratio (its own definition)
    H.abilClear = ab ? { with: +ab[1], without: +ab[2] } : null; }
  if (!QUICK) {
    const tu = harness('tutorial-test.js');   // "FIRSTKILL desktop 12.3" / "FIRSTKILL phone 14.0": seconds from the flight school start to the first kill
    const fk = [...tu.matchAll(/FIRSTKILL (\w+) ([\d.]+)/g)].map(m => +m[2]); H.firstKill = fk.length ? Math.max(...fk) : null;
    const wp = harness('weapon-test.js', { BOT: '1' }, 420000);   // "PASS pulse alone at level 1 clears stage 1 (41 s, hits 3, kills 22)"; capped at 7 min
    H.weapons = [...wp.matchAll(/^(?:PASS|FAIL) (\S+) alone at level 1 clears stage 1 \(([\d.]+) s/gm)].map(m => ({ id: m[1], secs: +m[2] })); }

  // ---------- standards ----------  [id, level, topic, range text, value, ok(value)]
  const S = [];
  const add = (id, lvl, topic, range, val, ok, gap) => S.push({ id, level: lvl, topic, range, value: val, status: val == null ? 'SKIP' : (ok(val) ? 'PASS' : 'FAIL'), gap: val == null || ok(val) ? 0 : gap(val) });
  const out = (lo, hi) => v => Math.abs(v < lo ? (lo - v) / lo : v > hi ? (v - hi) / hi : 0);
  add('S01', 'hard', 'Median on-screen life of the shortest-lived enemy kind (s)', '>= 1.5', M.kindMedianMin, v => v >= 1.5, v => (1.5 - v) / 1.5);
  add('S02', 'hard', 'Enemies killed < 0.7 s after entering view (share of kills)', '<= 0.15', M.killedUnder07, v => v <= .15, v => (v - .15) / .15);
  add('S03', 'guide', 'Median on-screen life, all kinds (s)', '3 - 10', M.lifeMedianAll, v => v >= 3 && v <= 10, out(3, 10));
  add('S04', 'guide', 'Enemy bullets on screen, mean (non-boss + boss)', '12 - 60', M.ebMean, v => v >= 12 && v <= 60, out(12, 60));
  add('S05', 'hard', 'Enemy bullets on screen, p95 (non-boss)', '<= 150', M.ebP95, v => v <= 150, v => (v - 150) / 150);
  add('S06', 'guide', 'Bullet density ramp, late stage / early stage', '1.5 - 3.5', M.ebRamp, v => v >= 1.5 && v <= 3.5, out(1.5, 3.5));
  add('S07', 'guide', 'Enemies on screen at once, mean', '3 - 10', M.enMean, v => v >= 3 && v <= 10, out(3, 10));
  add('S08', 'guide', 'Spawns per minute', '20 - 80', M.spawnsPerMin, v => v >= 20 && v <= 80, out(20, 80));
  add('S09', 'hard', 'Single enemy kind share of spawns', '<= 0.35', M.droneShare, v => v <= .35, v => (v - .35) / .35);
  add('S10', 'hard', 'Median stage boss fight length (s)', '40 - 110', M.bossSecsMedian, v => v >= 40 && v <= 110, out(40, 110));
  add('S11', 'hard', 'Fewest phases in a stage boss', '>= 3', M.bossPhasesMin, v => v >= 3, v => (3 - v) / 3);
  add('S12', 'guide', 'Median distinct boss attacks per fight', '6 - 12', M.bossVerbsMedian, v => v >= 6 && v <= 12, out(6, 12));
  add('S13', 'hard', 'Repeat within 5 min (arcade-normal)', '< 0.75', M.repeat5, v => v < .75, v => (v - .75) / .75);
  add('S14', 'hard', 'Plain-loop share of play time', '< 0.35', M.plainLoop, v => v < .35, v => (v - .35) / .35);
  add('S15', 'hard', 'Longest gap with no new mechanic (min)', '<= 15', M.longestMechGapMin, v => v <= 15, v => (v - 15) / 15);
  add('S16', 'guide', 'New things in the first 30 game-min', '>= 40', M.newThingsPer30, v => v >= 40, v => (40 - v) / 40);
  add('S17', 'hard', 'Spawn-schedule Jaccard across seeds, stage 10', '<= 0.35', M.predJaccard, v => v <= .35, v => (v - .35) / .35);
  add('S18', 'guide', 'Median enemy fire-interval CV, stage 10', '>= 0.25', M.fireCV, v => v >= .25, v => (.25 - v) / .25);
  add('S19', 'guide', 'Distinct first-15 spawn orders across seeds (share of seeds)', '>= 0.67', M.predDistinctOrders == null ? null : M.predDistinctOrders / M.predSeeds, v => v >= .67, v => (.67 - v) / .67);
  add('S20', 'guide', 'Panic button (EMP) uses per minute, competent bot', '0.3 - 1.5', M.empPerMin, v => v >= .3 && v <= 1.5, out(.3, 1.5));
  add('S21', 'guide', 'Dash uses per minute, competent bot', '3 - 10', M.dashPerMin, v => v >= 3 && v <= 10, out(3, 10));
  add('S22', 'guide', 'Share of dashes that are last-moment reflexes (bullet within 60 px)', '<= 0.70', M.dashReflexShare, v => v <= .70, v => (v - .70) / .70);
  add('S23', 'hard', 'First-try stage clear, bot with no oracle (Normal)', '0.55 - 0.90', M.firstTryClear, v => v >= .55 && v <= .90, out(.55, .90));
  add('S24', 'guide', 'Bullet contacts per stage (bullet inside the ship hit radius; dash/invuln not excluded), competent bot', '3 - 8', M.hitsPerStage, v => v >= 3 && v <= 8, out(3, 8));
  add('S25', 'hard', 'Stage length, median (s)', '90 - 240', M.stageSecsMedian, v => v >= 90 && v <= 240, out(90, 240));
  add('S26', 'guide', 'Checkpoints per stage of 150 s or longer', '>= 1', M.checkpointsPerStage, v => v >= 1, v => (1 - v));
  add('S27', 'guide', 'Choice points (pit-stop cards) per hour', '>= 6', M.pitStopsPerHour, v => v >= 6, v => (6 - v) / 6);
  add('S28', 'guide', 'Assist options in settings (count)', '>= 3', M.assistKeys.length, v => v >= 3, v => (3 - v) / 3);
  const minRatio = H.threats.length ? Math.min(...H.threats.map(t => t.ratio)) : null;
  if (!H.threats.length) WHY.S30 = 'counter-test printed no threat lines';
  add('S30', 'hard', 'Answer value: hull lost without the timed answer / with it, worst threat (counter-test)', '>= 2x', minRatio, v => v >= 2, v => (2 - v) / 2);
  WHY.S29 = 'no decision log: the harnesses report presses and hull, not choices (dash and EMP rates are S20 and S21)';
  S.push({ id: 'S29', level: 'guide', topic: 'Real decisions per minute', range: '>= 6 (est.)', value: null, status: 'SKIP', gap: 0 });
  const wMed = med(H.weapons.map(w => w.secs)), wBest = H.weapons.length ? Math.min(...H.weapons.map(w => w.secs)) : null;
  const spread = wMed && wBest != null ? (wMed - wBest) / wMed : null;
  if (spread == null) WHY.S31 = QUICK ? 'not run in --quick (weapon-test)' : 'weapon-test printed no stage-1 clear times';
  add('S31', 'guide', 'Weapon spread: fastest single weapon to clear stage 1 vs the median weapon, LV1 (weapon-test)', '<= 15%', spread, v => v <= .15, v => (v - .15) / .15);
  if (H.firstKill == null) WHY.S32 = QUICK ? 'not run in --quick (tutorial-test)' : 'tutorial-test printed no FIRSTKILL line';
  add('S32', 'guide', 'Time to first kill in a new session, worst of desktop and phone, s (tutorial-test)', '<= 20', H.firstKill, v => v <= 20, v => (v - 20) / 20);
  for (const s of S) if (s.status === 'SKIP') s.reason = WHY[s.id];

  const order = S.slice().sort((a, b) => b.gap - a.gap);
  console.log('\n=== Nightrun industry audit (largest gaps first) ===');
  for (const s of order) console.log(`${s.status.padEnd(4)} ${s.id} [${s.level}] ${s.topic}: ${s.value == null ? 'not measured' : r2(s.value)}  (target ${s.range})${s.gap ? '  gap ' + r2(s.gap * 100) + '%' : ''}${s.reason ? '  - ' + s.reason : ''}`);
  const f = S.filter(s => s.status === 'FAIL'), p = S.filter(s => s.status === 'PASS');
  console.log(`\nPASS ${p.length}  FAIL ${f.length} (hard ${f.filter(s => s.level === 'hard').length})  SKIP ${S.filter(s => s.status === 'SKIP').length}`);
  const git = cp.spawnSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: __dirname }).stdout.toString().trim();
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ meta: { date: new Date().toISOString(), head: git, quick: QUICK, stages: STAGES, seeds: SEEDS, nogod: NOGOD, realSecs: Math.round((Date.now() - t0) / 1000), pageErrors: errors.slice(0, 5) }, standards: order, measures: M, harness: H }, null, 1));
  console.log('wrote ' + path.relative(process.cwd(), OUT));
  if (GATE && f.some(s => s.level === 'hard')) { console.log('--gate: hard FAIL, exit 1'); process.exitCode = 1; }
})().catch(e => { console.error(e); process.exit(2); });
