// Descent difficulty curve: win rate of an all-computer crew (normal) for every stage.   node desc-gauntlet.js [games]
const LD = require('./src/engine.js'); require('./src/ai.js');
const N = +process.argv[2] || 20;
const DESC = [[2, 3, 4, ['low', 4, 2]], [4, [5, 'murky'], 5, ['sleep low', 6, 2]], [6, 7, [7, 'murky'], ['any sleep low', 7, 2]], [8, [8, 'murky'], 9, ['low sleep any', 8, 1]]];
for (const [zi, Z] of DESC.entries()) {
  const row = [];
  for (const st of Z) {
    let win = 0, tr = 0;
    for (let g = 1; g <= N; g++) {
      const boss = Array.isArray(st) && typeof st[0] === 'string' ? { id: 'b', pool: st[0].split(' '), every: st[2] } : null;
      const d = boss ? st[1] : Array.isArray(st) ? st[0] : st, cmt = Array.isArray(st) && !boss ? st[1] : 'normal';
      const G = LD.newGame({ players: 4, seed: g * 97 + zi * 13 + d, mission: { kind: 'free', d, cmt }, ai: ['normal', 'normal', 'normal', 'normal'], boss });
      let k = 0; while (G.phase !== 'over' && k++ < 1500) if (!LD.AI.step(G)) break;
      if (G.result && G.result.ok) win++; tr += G.tricks.length;
    }
    row.push((Array.isArray(st) && typeof st[0] === 'string' ? 'BOSS ' : 'd') + (Array.isArray(st) ? (typeof st[0] === 'string' ? st[1] : st[0]) : st) + ' ' + Math.round(100 * win / N) + '%');
  }
  console.log('zone ' + (zi + 1) + ': ' + row.join(' | '));
}
