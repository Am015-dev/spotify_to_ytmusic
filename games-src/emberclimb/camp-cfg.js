// Story chapter run options (shared by the game and the balance check): node camp-cfg.js [runs=100]
const CH = [
  null,
  {"heroes": ["w"], "floors": 2, "boss": "warden-captain", "relic": "iron-bangle", "hpPct": 106},
  {"heroes": ["s"], "floors": 3, "boss": "mire-behemoth", "relic": "bag-of-marbles", "hpPct": 70},
  {"heroes": ["a"], "floors": 4, "boss": "skyclaw", "relic": "candle-stub", "startAct": 2, "hpPct": 53},
  {"heroes": ["m"], "floors": 5, "boss": "sleeper-statue", "relic": "lantern", "hpPct": 86, "startAct": 2},
  {"heroes": ["w"], "floors": 6, "boss": "ashen-wraith", "relic": "tin-flute", "hpPct": 75, "startAct": 2},
  {"heroes": ["s"], "floors": 6, "boss": "tomb-king", "relic": "smoking-censer", "hpPct": 49, "startAct": 3},
  {"heroes": ["a"], "floors": 8, "boss": "thorn-brute", "relic": "iron-bangle", "hpPct": 42, "startAct": 3},
  {"heroes": ["m"], "floors": 9, "boss": "gate-colossus", "relic": "dawnstone", "hpPct": 47, "startAct": 3},
  {"heroes": ["w", "m"], "floors": 6, "boss": "ember-tyrant", "startAct": 4, "relic": "phoenix-ash", "hpPct": 32}
];
if (typeof module !== 'undefined') module.exports = CH;
if (require.main === module) { const E = require('./core.js').E, N = +process.argv[2] || 100; CH.forEach((c, i) => { if (!c) return; let w = 0; for (let k = 0; k < N; k++) w += E.autoplay(Object.assign({ seed: 7000 + k }, c)).won ? 1 : 0; console.log('ch' + (i + 1), JSON.stringify(c), 'win', Math.round(100 * w / N) + '%'); }); }
