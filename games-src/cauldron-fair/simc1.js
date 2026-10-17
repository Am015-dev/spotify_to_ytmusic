// Chapter-1 balance: a simple newcomer (draw until risk>30%, buy AI's "best" shop pick) vs the chapter's rival. node simc1.js [N] [level] [aiStyle]
const CF = require('./src/engine.js'); require('./src/ai.js');
const N = +process.argv[2] || 400, LV = process.argv[3] || 'easy';
const camp = require('./campaign.json').chapters[0];
let win = 0, goal = 0, tie = 0, sc = 0, rs = 0;
for (let g = 0; g < N; g++) {
  const G = CF.newGame({ players: 2, seed: 9000 + g, ai: ['simple', LV], setMode: camp.setup.setMode, firstCard: camp.setup.firstCard }); G.nolog = true;
  let st = 0;
  while (G.phase !== 'over' && st++ < 6000) {
    for (const s of CF.pending(G)) {
      let m;
      if (s === 0) {
        const p = G.players[0], L = CF.moves(G, 0);
        if (G.phase === 'brew' && p.st === 'draw') { const dr = L.find(x => x.t === 'draw'), stp = L.find(x => x.t === 'stop'); m = dr && (!stp || CF.risk(G, 0).pBoom <= .3) ? dr : (stp || dr); }
        if (!m) m = CF.AI.choose(G, 0, 'normal');
      } else m = CF.AI.choose(G, s);
      if (!m) m = CF.moves(G, s)[0]; const mm = Object.assign({}, m); delete mm.label; if (!CF.apply(G, s, mm).ok) { console.log('illegal', JSON.stringify(mm)); process.exit(1); }
    }
  }
  const a = G.players[0].vp, b = G.players[1].vp; sc += a; if (a > b) win++; else if (a === b) tie++; if (a >= 15) goal++;
}
console.log('c1 newcomer vs', LV, 'win', (100 * win / N).toFixed(0) + '%', 'tie', tie, 'goal15', (100 * goal / N).toFixed(0) + '%', 'avg', (sc / N).toFixed(1));
