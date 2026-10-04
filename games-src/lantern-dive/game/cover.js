// Coverage: random + computer play with the invariants checked after EVERY move; every job card, every kind of job-handing, every signalling
// rule, every dive rule and the drone must fire.   node cover.js [rounds=3]
const LD = require('./src/engine.js'); require('./src/ai.js'); global.LD = LD; const D = LD.DATA;
const R = +process.argv[2] || 3;
const fired = {}; const fire = k => { fired[k] = (fired[k] || 0) + 1; };
const jobDone = new Array(96).fill(0), jobFail = new Array(96).fill(0), jobDrawn = new Array(96).fill(0);
let moves = 0, games = 0, problems = 0; const bad = [];
let seedn = 1;
function rndMove(G, s, r) { const mv = LD.moves(G, s); if (!mv.length) return null; const np2 = mv.filter(m => m.t !== 'ping'); const pool = (np2.length && r() > .12) ? np2 : mv; return pool[Math.floor(r() * pool.length)]; }
function mk(seed) { let t = seed >>> 0; return () => { t = (t + 0x6D2B79F5) | 0; let x = Math.imul(t ^ t >>> 15, 1 | t); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; }; }
function runGame(opts, mode) {
  const G = LD.newGame(opts); const r = mk(opts.seed * 31 + 7); games++;
  G.tasks.forEach(t => jobDrawn[t.id]++);
  fire('comm:' + G.comm); if (G.unk >= 0) fire('unknown-drawn'); if (G.two) fire('drone'); fire('assign:' + G.as.mode); if (G.mission.sel) fire('sel:' + G.mission.sel); if (G.clock) fire('clock');
  let steps = 0, lastMode = G.as.mode;
  while (G.phase !== 'over' && steps++ < 3000) {
    const pend = LD.pending(G); if (!pend.length) { problems++; bad.push('nobody pending ' + G.phase); break; }
    let acted = false;
    if (mode === 'ai' && G.phase === 'play' && G.trick.plays.length === 0) for (const p of G.players) if (!p.helper && LD.AI.pingChoice(G, p.seat, 'normal')) { const m = LD.AI.pingChoice(G, p.seat, 'normal'); if (LD.apply(G, p.seat, m).ok) { fire('ping:' + (m.k || 'murky')); acted = true; break; } }
    if (!acted) {
      const s = pend[Math.floor(r() * pend.length)]; let m;
      if (mode === 'ai' && !G.players[s].helper || (mode === 'mix' && r() > .5)) m = LD.AI.choose(G, s, ['easy', 'normal', 'hard'][steps % 3]); else m = rndMove(G, s, r);
      if (!m) { problems++; bad.push('no move ' + G.phase); break; }
      const r0 = LD.apply(G, s, m); moves++; if (!r0.ok) { problems++; bad.push('illegal ' + JSON.stringify(m) + ' ' + r0.error); break; }
      fire('move:' + m.t); if (m.t === 'ping') fire('ping:' + (m.k || 'murky')); if (m.t === 'dist' && m.on) fire('flare dir ' + m.dir); if (m.t === 'predict') fire('predict:' + (D.tasks[G.tasks[m.i].id].open ? 'open' : 'secret')); if (m.as !== undefined) fire('drone-play');
      for (const e of G.events) { if (e.t === 'offer') fire('cmd-offer'); if (e.t === 'swap') fire('swap'); }
    }
    const e = LD.checkInvariants(G); if (e.length) { problems++; bad.push('invariant ' + e.join(';') + ' phase ' + G.phase + ' dive ' + G.mission.id); break; }
    if (G.as && G.as.mode !== lastMode) { fire('assign:' + G.as.mode); lastMode = G.as.mode; }
  }
  if (G.phase !== 'over') { problems++; bad.push('stall ' + G.mission.id); return G; }
  G.result.tasks.forEach((s, i) => { const id = G.tasks[i].id; if (s > 0) jobDone[id]++; else jobFail[id]++; });
  fire('result:' + (G.result.ok ? 'won' : 'lost')); if (/Sunstar 5/.test(G.result.why)) fire('m27-fail'); if (/two more/.test(G.result.why)) fire('gap-fail'); if (/Coral card or a Lantern/.test(G.result.why)) fire('m12-fail'); if (/first trick winner/.test(G.result.why)) fire('m23-fail'); if (/Time/.test(G.result.why)) fire('time-fail');
  if (G.mission.m27) fire('m27-played'); if (G.mission.m23) fire('m23-played'); if (G.mission.gap) fire('gap-played'); if (G.mission.m12) fire('m12-played');
  // retry both ways
  if (!G.result.ok && G.att < 3) { LD.nextAttempt(G, { same: games % 2 === 0 }); fire(games % 2 === 0 ? 'retry-same' : 'retry-new'); if (LD.checkInvariants(G).length) { problems++; bad.push('retry invariant'); } }
  return G;
}
const t0 = Date.now();
for (let rd = 0; rd < R; rd++) {
  // every logbook dive, every crew size, random / mixed / computer play
  for (let id = 1; id <= 32; id++) for (const np of [2, 3, 4, 5]) { const mode = ['rnd', 'mix', 'ai'][(id + np + rd) % 3]; runGame({ players: np, seed: seedn++, mission: { kind: 'log', id }, timer: (id + rd) % 2 === 0, ai: Array(np).fill('normal') }, mode); }
  // deep dives and free dives
  for (const lv of [18, 19, 24, 30]) runGame({ players: 3 + (lv % 3), seed: seedn++, mission: { kind: 'deep', level: lv } }, 'mix');
  for (const cmt of ['normal', 'murky', 'narc', 'unknown', 'none']) runGame({ players: 4, seed: seedn++, mission: { kind: 'free', d: 8, cmt } }, 'mix');
  // job practice: all 96 job cards, 3 / 4 / 5 divers, computer and random play
  for (let j = 0; j < 96; j++) for (const np of [3, 4, 5, 2]) { runGame({ players: np, seed: seedn++, mission: { kind: 'free', d: 1, jobs: [j] } }, (j + np + rd) % 2 ? 'ai' : 'rnd'); runGame({ players: np, seed: seedn++, mission: { kind: 'free', d: 1, jobs: [j] } }, 'rnd'); }
}
const REQ = ['comm:normal', 'comm:murky', 'comm:narc', 'comm:none', 'unknown-drawn', 'drone', 'drone-play', 'clock', 'assign:draft', 'assign:free', 'assign:cmd', 'assign:vote', 'assign:vol', 'assign:split', 'assign:hardfirst', 'cmd-offer', 'sel:fixed', 'sel:cmdnone', 'sel:two', 'sel:one', 'sel:hard', 'sel:vote', 'sel:cmd', 'sel:free',
  'move:take', 'move:pass', 'move:done', 'move:keep', 'move:offer', 'move:accept', 'move:decline', 'move:vote', 'move:yes', 'move:no', 'move:dist', 'move:give', 'move:predict', 'move:ping', 'move:nosig', 'move:play', 'flare dir 1', 'flare dir -1', 'swap', 'predict:open', 'predict:secret', 'ping:high', 'ping:low', 'ping:only', 'ping:murky',
  'result:won', 'result:lost', 'retry-same', 'retry-new', 'm27-fail', 'gap-fail', 'm12-fail', 'm23-fail', 'm27-played', 'm23-played', 'gap-played', 'm12-played'];
const missing = REQ.filter(k => !fired[k]);
const noDone = [], noFail = [], noDrawn = []; for (let i = 0; i < 96; i++) { if (!jobDrawn[i]) noDrawn.push(i + 1); if (!jobDone[i]) noDone.push(i + 1); if (!jobFail[i]) noFail.push(i + 1); }
console.log(JSON.stringify({ rounds: R, games, moves, problems, secs: +((Date.now() - t0) / 1000).toFixed(1), required: REQ.length, firedOf: REQ.length - missing.length, missing, jobsDrawn: 96 - noDrawn.length, jobsDone: 96 - noDone.length, jobsFailed: 96 - noFail.length, neverDone: noDone, neverFailed: noFail }));
for (const b of bad.slice(0, 8)) console.log('  ' + b);
process.exit(problems || missing.length || noDone.length || noFail.length ? 1 : 0);
