// Guide test (W494): the guided tutorial walk by real touch taps at 390x844 and 375x667 lives in tools/tut-walk.js (every rule step in order,
// 12 words or fewer per step, the run continues afterwards, no page errors). This wrapper keeps the old entry point.
// Run: node tutor-test.js
const cp = require('child_process'), path = require('path');
const r = cp.spawnSync('node', [path.join(__dirname, 'tools', 'tut-walk.js')], { stdio: 'inherit' });
console.log(r.status ? 'TUTOR TEST FAIL' : 'TUTOR TEST PASS'); process.exit(r.status ? 1 : 0);
