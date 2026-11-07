// Solo balance: node bal.js [runs=200] -> win rate per hero with the test bot, one run each (seeds 1..N)
const EC = require('./core.js'), E = EC.E; const N = +process.argv[2] || 200;
for (const k of ['w', 's', 'a', 'm']) { let w = 0, fl = 0; for (let i = 0; i < N; i++) { const r = E.autoplay({ heroes: [k], seed: 5000 + i }); w += r.won ? 1 : 0; fl += r.floor || 0; } console.log(k, 'win', (100 * w / N).toFixed(0) + '%', 'avg floor', (fl / N).toFixed(1)); }
