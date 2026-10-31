#!/usr/bin/env node
// W293 push-or-hold gate (waves.js GOLD bounty, design DESIGN-DECISION-W247.md). Runs humanbot.js (human model, Normal, fresh build, sim steps) four ways:
//   HOLD (home x 220, the old bot), PUSH (flies in on every bounty squad), CHOOSE (pushes when hull >= 2 and no charger aims at its row),
//   CHOOSE-NOAB (CHOOSE with DASH and EMP off). Prints PASS/FAIL lines only; TABLE=1 adds the table.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/push-gate.js     env: SEEDBASE=0 RUNS=8 STAGES=1,2,3,4,5,6 PAR=4 GAME_DIR=... TABLE=1 OUT=/tmp/pg
const cp = require('child_process'), path = require('path'), fs = require('fs'), os = require('os');
const RUNS = process.env.RUNS || '24', STAGES = process.env.STAGES || '1,4,6', PAR = process.env.PAR || '4';
// W314: paired seeds (humanbot seeds the game dice too, so HOLD/PUSH/CHOOSE play the same seeds); the gate runs once per SEEDBASES entry and passes only if every base passes.
const BASES = (process.env.SEEDBASES || process.env.SEEDBASE || '0,1000').split(',');
const OUT0 = process.env.OUT || fs.mkdtempSync(path.join(os.tmpdir(), 'pg-')); fs.mkdirSync(OUT0, { recursive: true });
const HB = path.resolve(__dirname, '../humanbot.js');
const CFG = [['hold', 'hold', '{}'], ['push', 'push', '{}'], ['choose', 'choose', '{}']].concat(process.env.NOAB ? [['noab', 'choose', '{"dash":0,"emp":999}']] : []);
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null, REUSE = process.env.REUSE;   // ONLY=push,choose re-runs just those; REUSE=dir takes the others from an earlier run (same layout: dir/<base>/<bot>.json)
let fails = 0; const line = (ok, s) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + s); };
for (const SB of BASES) {
const OUT = path.join(OUT0, 'b' + SB); fs.mkdirSync(OUT, { recursive: true }); const res = {};
for (const [k, pol, hp] of CFG) {
  const json = path.join(OUT, k + '.json'), rj = REUSE && path.join(REUSE, 'b' + SB, k + '.json');
  if (ONLY && !ONLY.includes(k) && rj && fs.existsSync(rj)) { fs.copyFileSync(rj, json); res[k] = JSON.parse(fs.readFileSync(json, 'utf8')); continue; }
  const r = cp.spawnSync('node', [HB], { env: Object.assign({}, process.env, { POLICY: pol, HP: hp, BOTS: 'human', BUILDS: 'fresh', STAGES, RUNS, PAR, JSON: json, SEEDBASE: SB }), encoding: 'utf8', maxBuffer: 1 << 26 });
  if (!fs.existsSync(json)) { console.log('FAIL push-gate: humanbot ' + k + ' wrote no result\n' + (r.stdout || '').slice(-600) + (r.stderr || '').slice(-600)); process.exit(1); }
  if (/FAIL page error|RUN ERROR/.test(r.stdout || '')) console.log('FAIL ' + k + ': page errors\n' + r.stdout.split('\n').filter(l => /FAIL page|RUN ERROR/.test(l)).slice(0, 3).join('\n'));
  res[k] = JSON.parse(fs.readFileSync(json, 'utf8'));
}
const med = a => { if (!a.length) return 0; a = a.slice().sort((x, y) => x - y); return a[Math.floor(a.length / 2)]; };
const clr = a => a.length ? Math.round(100 * a.filter(r => r.clear).length / a.length) : 0;
const sqs = a => [].concat(...a.map(r => r.sqLog || []));
const grate = a => { const s = sqs(a).filter(q => q.why !== 'cap'); return s.length ? Math.round(100 * s.filter(q => q.gold).length / s.length) : 0; };
const ratio = (a, b) => { // median over stage x seed pairs of score a / score b (same seed and stage)
  const v = []; for (const x of a) { const y = b.find(r => r.n === x.n && r.seed === x.seed) || null; if (y && y.score > 0) v.push(x.score / y.score); }
  return v.length ? med(v) : 0; };
const H = res.hold, P = res.push, C = res.choose, N = res.noab;
const sumScore = a => a.reduce((x, r) => x + r.score, 0);
const scoreK = sumScore(C) / Math.max(1, sumScore(H)), scoreMed = med(C.map(r => r.score)) / Math.max(1, med(H.map(r => r.score)));
line(scoreK >= 1.25, `CHOOSE pooled score ${scoreK.toFixed(2)}x HOLD (gate >= 1.25; median-run ratio ${scoreMed.toFixed(2)}, paired median ${ratio(C, H).toFixed(2)})`);
line(clr(C) >= clr(H), `CHOOSE clear ${clr(C)}% >= HOLD ${clr(H)}% (base ${SB}, stages ${STAGES}, ${RUNS} paired seeds)`);
line(clr(P) <= clr(C) - 15, `PUSH clear ${clr(P)}% <= CHOOSE ${clr(C)}% - 15`);
const swr = med(C.map(r => r.sw * 20 / Math.max(1, r.t)));
line(swr >= 1, `CHOOSE mode switches per 20 s, median ${swr.toFixed(2)} (gate >= 1)`);
let dif = 0, tot = 0; for (const r of C) { const m = r.sqMode || []; for (let i = 1; i < m.length; i++) { tot++; if (m[i] !== m[i - 1]) dif++; } }
line(tot && dif / tot >= .3, `CHOOSE squads whose mode differs from the previous squad: ${tot ? Math.round(100 * dif / tot) : 0}% (gate >= 30%, n=${tot})`);
if (N) { const gC = C.reduce((x, r) => x + r.gold, 0), gN = N.reduce((x, r) => x + r.gold, 0);
line(gN <= gC * .8, `CHOOSE without DASH/EMP golds ${gN} vs ${gC} with (${gC ? Math.round(100 * (1 - gN / gC)) : 0}% fewer, gate >= 20%)`); }
const hl = a => (a.reduce((x, r) => x + r.hits, 0) / Math.max(1, a.length)).toFixed(2);
for (const [k, a] of [['HOLD', H], ['PUSH', P], ['CHOOSE', C]]) console.log(`info base ${SB} ${k.padEnd(6)} clear ${clr(a)}%  score sum ${sumScore(a)}  median ${med(a.map(r => r.score))}  hearts lost/run ${hl(a)}  gold/run ${(a.reduce((x, r) => x + r.gold, 0) / Math.max(1, a.length)).toFixed(2)}`);
let cw = 0, hw = 0; for (const x of C) { const y = H.find(r => r.n === x.n && r.seed === x.seed); if (!y) continue; if (x.clear && !y.clear) cw++; if (y.clear && !x.clear) hw++; } console.log(`info base ${SB} paired seeds: CHOOSE clears where HOLD dies ${cw}, HOLD clears where CHOOSE dies ${hw}`);
console.log(`info GOLD rate (squads paid / squads with a live bounty): HOLD ${grate(H)}% PUSH ${grate(P)}% CHOOSE ${grate(C)}% NOAB ${N ? grate(N) + "%" : "-"} (design: HOLD <= 10, CHOOSE 40-70)`);
if (process.env.TABLE) {
  console.log('bot     stage clear%  score(med)  gold(med)/5  hits(med)  time(med)');
  for (const k of Object.keys(res)) for (const n of STAGES.split(',').map(Number)) { const a = res[k].filter(r => r.n === n);
    console.log(`${k.padEnd(7)} ${String(n).padEnd(5)} ${String(clr(a)).padStart(6)}  ${String(med(a.map(r => r.score))).padStart(10)}  ${String(med(a.map(r => r.gold))).padStart(11)}  ${String(med(a.map(r => r.hits))).padStart(9)}  ${String(med(a.map(r => r.t))).padStart(9)}`); }
}
}
console.log(fails ? `FAIL push-gate: ${fails} check(s) (results in ${OUT0})` : `PASS push-gate (results in ${OUT0})`); process.exit(fails ? 1 : 0);
