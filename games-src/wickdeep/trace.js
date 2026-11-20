global.window = global; ['data', 'scen', 'engine', 'ai'].forEach(f => require('./src/' + f + '.js'));
const E = WD, AI = WDAI, D = WDD; const sc = +process.argv[2], seed = +process.argv[3] || 1, cls = (process.argv[4] || 'warden,ringer').split(',');
const G = E.newScenario(sc, cls.map(c => ({ cls: c, lvl: +process.argv[5] || 1 })), { seed });
let n = 0, lastR = 0;
const nm = id => { const f = E.fig(G, id); return f ? (f.kind === 'hero' ? D.HERO[f.cls].n : (f.kind === 'boss' ? D.BOSS[f.type].n : f.kind === 'obj' ? f.name : D.MON[f.type] ? D.MON[f.type].n + f.num : f.type)) : id; };
while (!G.done && n++ < 5000) {
  if (G.round !== lastR) { lastR = G.round; console.log('--- round', G.round, G.figs.map(f => nm(f.id) + '@' + f.pos + ' ' + f.hp + 'hp' + (f.kind === 'hero' ? ' h' + f.hand.length + '/d' + f.disc.length + '/l' + f.lost.length : '')).join(' | ')); }
  const m = AI.choose(G); E.apply(G, m);
  G.ev.forEach(e => { if (['atk', 'move', 'die', 'exh', 'door', 'half', 'mturn', 'lrest', 'srest', 'block'].includes(e.e)) console.log('  ', e.e, e.e === 'atk' ? nm(e.a) + '->' + nm(e.t) + ' ' + e.base + ' ' + JSON.stringify(e.mod) + ' dmg ' + e.dmg : e.e === 'move' ? nm(e.id) + ' ' + e.path.join(' ') : e.e === 'half' ? nm(e.id) + ' ' + D.CARD[e.c].n + ' ' + e.h + (e.basic ? ' basic' : '') : e.e === 'mturn' ? e.type + ' ' + D.MDECK[G.md[e.type].fam][e.card].a : JSON.stringify(e).slice(0, 90)); });
  G.ev = [];
}
console.log(JSON.stringify(G.done && { won: G.done.won, round: G.done.round }));
