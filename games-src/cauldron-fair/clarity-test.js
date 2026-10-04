// Clarity checks from the blind playtests: player-facing text has no typos, and every point a maker gains in a day
// is explained by a "scores N point(s)" log line on that day (so the day report can show where each point came from).
//   node clarity-test.js [games=40]
const CF = require('./src/engine.js'); require('./src/ai.js');
const N = +process.argv[2] || 40; let fails = 0, checks = 0;
const bad = [/rubyies/, /\b1 spaces\b/, /\b1 rubies\b/, /\b1 points\b/, /\b1 chips\b/];
const fail = m => { fails++; if (fails <= 12) console.log('FAIL', m); };
for (let g = 0; g < N; g++) {
  const G = CF.newGame({ players: 2 + g % 3, seed: 500 + g, ai: ['normal', 'easy', 'hard', 'normal'].slice(0, 2 + g % 3), setMode: [1, 2, 3, 4, 'random'][g % 5] });
  let st = 0;
  while (G.phase !== 'over' && st < 6000) {
    const pend = CF.pending(G); if (!pend.length) break;
    for (const s of pend) {
      for (const m of CF.moves(G, s)) { checks++; for (const b of bad) if (b.test(m.label || '')) fail('label "' + m.label + '" seed ' + (500 + g)); }
      const m = Object.assign({}, CF.AI.choose(G, s)); delete m.label; const e0 = G.evN, l0 = G.logN; CF.apply(G, s, m); st++;
      // every chip a maker is handed (fortune, die, chip power, gift) has a log line that names it and the maker
      for (const e of G.events) if (e.n > e0 && e.t === 'gainChip') {
        const who = G.players[e.seat].name, chip = CF.nameOf(e.chip.c + e.chip.v); checks++;
        if (!G.log.some(l => l.i > l0 && l.t.indexOf(who) >= 0 && l.t.indexOf(chip) >= 0)) fail('chip ' + chip + ' given to ' + who + ' with no log line (move ' + JSON.stringify(m) + ', seed ' + (500 + g) + ')');
      }
    }
  }
  for (const l of G.log) { checks++; for (const b of bad) if (b.test(l.t)) fail('log "' + l.t + '" seed ' + (500 + g)); }
  // every VP change on a day is explained by "<name> scores N point(s)" or "<name> loses N point(s)" lines of that day
  for (const hh of G.hist) {
    const p = G.players[hh.seat], re = new RegExp('^' + p.name + ' (scores|loses) (\\d+) points?');
    if (!G.log.length || G.log[0].round >= hh.round) continue;   // the log keeps the last 500 lines only
    let sum = 0; for (const l of G.log) if (l.round === hh.round && !/rubies at 2 to 1/.test(l.t)) {   // (end-of-game ruby points come after the day's tally)
      const m = re.exec(l.t); if (m) sum += (m[1] === 'loses' ? -1 : 1) * +m[2]; }
    const prev = G.hist.find(x => x.seat === hh.seat && x.round === hh.round - 1), day = hh.after - (prev ? prev.after : 0);   // the whole day, fortune points included
    checks++; if (sum !== day) fail('day ' + hh.round + ' ' + p.name + ' gained ' + day + ' but the log explains ' + sum + ' (seed ' + (500 + g) + ')');
  }
}
console.log((fails ? fails + ' FAILED' : 'all passed') + ' (' + checks + ' checks, ' + N + ' games)'); process.exit(fails ? 1 : 0);
