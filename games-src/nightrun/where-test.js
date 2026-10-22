#!/usr/bin/env node
// WHERE.md / MODULES-COMPACT.md are up to date and small (no browser; prints PASS/FAIL lines only).
//   node games-src/nightrun/where-test.js        stale? run: python3 games-src/scripts/where.py && python3 games-src/scripts/modmap.py mainhattan-nightrun
const fs = require('fs'), path = require('path'), cp = require('child_process');
const NR = __dirname, SCRIPTS = path.join(NR, '..', 'scripts'), PARTS = path.join(NR, 'parts');
const res = [], ok = (n, p, i) => { res.push(!!p); console.log((p ? 'PASS ' : 'FAIL ') + n + (p || i == null ? '' : ' :: ' + i)); };
const read = f => fs.readFileSync(f, 'utf8'), py = (...a) => cp.spawnSync('python3', a, { encoding: 'utf8' });
const where = path.join(NR, 'WHERE.md'), compact = path.join(NR, 'MODULES-COMPACT.md');

const chk = py(path.join(SCRIPTS, 'where.py'), '--check');
ok('WHERE.md is up to date (where.py --check)', chk.status === 0, (chk.stdout + chk.stderr).trim());

const before = fs.existsSync(compact) ? read(compact) : '';
const gen = py(path.join(SCRIPTS, 'modmap.py'), 'mainhattan-nightrun');
const after = fs.existsSync(compact) ? read(compact) : '';
ok('MODULES-COMPACT.md regenerates with no diff', gen.status === 0 && before === after, gen.stderr.trim().slice(0, 200));

const W = read(where), C = read(compact);
ok('WHERE.md <= 8 KB', Buffer.byteLength(W) <= 8192, Buffer.byteLength(W));
ok('MODULES-COMPACT.md <= 8 KB', Buffer.byteLength(C) <= 8192, Buffer.byteLength(C));

const parts = require('./parts-index.js').list().filter(f => f.endsWith('.js')).map(f => path.basename(f));
const noLine = parts.filter(f => !new RegExp('^' + f.slice(0, -3).replace(/[.]/g, '\\.') + '\\|', 'm').test(C));
ok('MODULES-COMPACT.md has a line for every part file (' + parts.length + ')', noLine.length === 0, noLine.join(' '));

const flagged = parts.filter(f => /if\(RET\.\w+===undefined\)RET\.\w+=/.test(read(path.join(PARTS, require('./parts-index.js').find(f)))));
const miss = flagged.filter(f => { const stem = f.slice(0, -3); return !W.split('\n').some(l => l.startsWith('|') && (l.split('|')[2] || '').trim().split(' ')[0] === stem); });
ok('every part file with a RET flag has a row in WHERE.md (' + flagged.length + ')', miss.length === 0, miss.join(' '));

const recipes = (W.match(/^\d+\. \*\*/gm) || []).length;
ok('WHERE.md has >= 10 recipes and a Do not read list', recipes >= 10 && /## Do not read/.test(W), recipes);

process.exit(res.every(Boolean) ? 0 : 1);
