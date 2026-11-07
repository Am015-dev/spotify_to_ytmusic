// Gate for build-all.py: the headless rules test (targeted rule checks + bot games). QUICK=1 -> 40 games.
const cp = require('child_process'), path = require('path');
const n = process.env.QUICK ? '40' : '300';
const r = cp.spawnSync('node', [path.join(__dirname, 'rules-test.js'), n], { encoding: 'utf8' });
const lines = (r.stdout || '').trim().split('\n'); console.log(lines.slice(-3).join('\n')); process.exit(r.status || 0);
