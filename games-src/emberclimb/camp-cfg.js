// Story chapter run options (shared by the game and the balance check): node camp-cfg.js [runs=100]
const CH = [
  null,
  { heroes: ['w'], floors: 2, boss: 'warden-captain', relic: 'iron-bangle' },
  { heroes: ['s'], floors: 3, boss: 'thorn-brute', relic: 'bag-of-marbles' },
  { heroes: ['a'], floors: 4, boss: 'sleeper-statue', relic: 'candle-stub' },
  { heroes: ['m'], floors: 5, boss: 'sleeper-statue', relic: 'lantern', hpPct: 110 },
  { heroes: ['w'], floors: 6, boss: 'mire-behemoth', relic: 'tin-flute', hpPct: 85 },
  { heroes: ['s'], floors: 6, boss: 'ashen-wraith', relic: 'smoking-censer', hpPct: 110 },
  { heroes: ['a'], floors: 8, boss: 'ashen-wraith', relic: 'iron-bangle', hpPct: 105 },
  { heroes: ['m'], floors: 9, boss: 'gate-colossus', relic: 'dawnstone', hpPct: 110 }
];
if (typeof module !== 'undefined') module.exports = CH;
if (require.main === module) { const E = require('./core.js').E, N = +process.argv[2] || 100; CH.forEach((c, i) => { if (!c) return; let w = 0; for (let k = 0; k < N; k++) w += E.autoplay(Object.assign({ seed: 7000 + k }, c)).won ? 1 : 0; console.log('ch' + (i + 1), JSON.stringify(c), 'win', Math.round(100 * w / N) + '%'); }); }
