#!/usr/bin/env node
// RETENTION/POLISH test B24 (save export / import). Headless, no screenshots. Prints PASS/FAIL, exit 1 on any FAIL.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/ret-saveio-test.js     env: GAME_DIR=...
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const res = [], ok = (n, p, i) => { res.push(p); console.log((p ? 'PASS ' : 'FAIL ') + n + (p || i == null ? '' : ' :: ' + i)); };
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const br = await PW.chromium.launch(), url = `http://127.0.0.1:${port}/index.html?sim=1`;
  const ctx = await br.newContext({ viewport: { width: 390, height: 763 }, hasTouch: true, acceptDownloads: true });
  await ctx.addInitScript(() => { window.__persist = 0; try { Object.defineProperty(navigator, 'storage', { value: { persist() { window.__persist++; return Promise.resolve(true); }, persisted() { return Promise.resolve(false); } }, configurable: true }); } catch (e) { } });
  const open = async (vp) => { const p = await ctx.newPage(), errs = []; p.errs = errs; p.on('pageerror', e => errs.push(e.message)); if (vp) await p.setViewportSize(vp);
    await p.goto(url); await p.waitForFunction(() => window.RET && window.RET.sio && document.getElementById('setBtn'), null, { timeout: 8000 }).catch(() => { }); await p.evaluate(() => { RET.sioNoReload = true; }); return p; };
  const openSet = async p => { await p.evaluate(() => { document.getElementById('setBtn').click(); }); await p.waitForTimeout(250); };
  let p = await open();
  // a save with non-default values
  const SEED = { mnr_bank: '777', mnr_wplv: '{"pulse":3,"spread":2}', mnr_own: '{"a":1}', mnr_ship: '"drift"', mnr_runs: '12', mnr_tune: '{"dmg":3}', mnr_eq: '{"dmg":true}', mnr_tut: '2', mnr_tutgift: '1',
    mnr_best: '{"score":4321,"dist":"Roemer"}', mnr_story: '{"stars":{"1":3,"2":2},"snap":{},"all":false}', mnr_heat: '{"pick":{"8":2},"best":{"8":2}}', mnr_streak: '{"last":5,"streak":4,"seen":5,"wk":0,"wkN":0,"wkBest":0}', mnr_set: '{"diff":"hard","master":0.4}', mnr_mute: 'true', mnr_theme: '"neon"' };
  await p.evaluate(s => { for (const k in s) localStorage.setItem(k, s[k]); }, SEED);
  await openSet(p);
  ok('Save group visible', await p.evaluate(() => !!document.getElementById('sioBox')));
  const code = await p.evaluate(() => RET.sioUI.code());
  const file = await p.evaluate(() => RET.sio.pack());
  ok('code has prefix', code.startsWith('MNR1.'));
  // download works
  const dl = await Promise.all([p.waitForEvent('download', { timeout: 4000 }).catch(() => null), p.evaluate(() => document.getElementById('sioFile').click())]);
  ok('export file downloads (.json)', !!dl[0] && /\.json$/.test(dl[0].suggestedFilename()));
  ok('last-backup note set', await p.evaluate(() => /Last backup: (?!never)/.test(document.getElementById('sioLast').textContent)));
  // clear then import by code
  await p.evaluate(() => { for (const k of RET.sioKeys) localStorage.removeItem(k); });
  await p.evaluate(c => { document.getElementById('sioTxt').value = c; document.getElementById('sioPaste').click(); }, code);
  ok('confirm step shown', await p.evaluate(() => !document.getElementById('sioAsk').hidden && /Replace progress on this device\?/.test(document.getElementById('sioAsk').textContent)));
  ok('nothing changed before confirm', await p.evaluate(() => localStorage.getItem('mnr_bank') == null));
  await p.evaluate(() => document.getElementById('sioYes').click());
  const back = await p.evaluate(() => { const o = {}; for (const k of RET.sioKeys) { const v = localStorage.getItem(k); if (v != null) o[k] = v; } return o; });
  ok('round trip: every key identical', Object.keys(SEED).every(k => back[k] === SEED[k]) && Object.keys(back).length === Object.keys(SEED).length, JSON.stringify(back).slice(0, 200));
  ok('backup slot exists after import', await p.evaluate(() => RET.sio.hasUndo()));
  // file import (JSON) with pre-clear
  await p.evaluate(() => { for (const k of RET.sioKeys) localStorage.removeItem(k); });
  const fileKeys = await p.evaluate(f => { const r = RET.sio.parse(f); return r.ok ? Object.keys(r.keys).length : -1; }, file);
  ok('json file text parses', fileKeys === Object.keys(SEED).length, fileKeys);
  // undo: current (empty) save was backed up before the previous import? import changes: do a different import then undo
  await p.evaluate(s => { for (const k in s) localStorage.setItem(k, s[k]); localStorage.setItem('mnr_bank', '5'); }, SEED);
  const before = await p.evaluate(() => localStorage.getItem('mnr_bank'));
  await p.evaluate(c => { document.getElementById('sioTxt').value = c; document.getElementById('sioPaste').click(); document.getElementById('sioYes').click(); }, code);
  ok('import replaced wallet', await p.evaluate(() => localStorage.getItem('mnr_bank')) === '777');
  await openSet(p);
  ok('undo button visible', await p.evaluate(() => !document.getElementById('sioUndo').hidden));
  await p.evaluate(() => document.getElementById('sioUndo').click());
  ok('undo restores previous save', await p.evaluate(() => localStorage.getItem('mnr_bank')) === before);
  // hostile inputs
  const good = JSON.parse(file);
  const bad = {
    'wrong version': JSON.stringify({ ...good, v: 2 }),
    'huge': 'x'.repeat(300000),
    '__proto__ key': '{"app":"mnr","v":1,"sum":"0","keys":{"__proto__":"{\\"a\\":1}"}}',
    '__proto__ inside value': (() => { const k = { mnr_set: '{"__proto__":{"x":1}}' }; return JSON.stringify({ app: 'mnr', v: 1, sum: 'x', keys: k }); })(),
    'non-numeric wallet': 'WALLET',
    'unknown key': 'UNKNOWN',
    'bad checksum': JSON.stringify({ ...good, sum: '0' }),
    'garbage': 'hello world',
    'html': '<script>alert(1)</script>',
    'negative wallet': 'NEG', 'infinite wallet': 'INF', 'not an object': '[1,2,3]' };
  const mk = (keys) => p.evaluate(k => { const sum = RET.sio.sum(k); return JSON.stringify({ app: 'mnr', v: 1, t: 1, sum, keys: k }); }, keys);
  bad['non-numeric wallet'] = await mk({ mnr_bank: '"lots"' }); bad['unknown key'] = await mk({ mnr_evil: '1' }); bad['negative wallet'] = await mk({ mnr_bank: '-5' }); bad['infinite wallet'] = await mk({ mnr_bank: '1e999' });
  bad['proto in value'] = await mk({ mnr_set: '{"__proto__":{"x":1}}' });
  await p.evaluate(() => localStorage.setItem('mnr_bank', '42'));
  for (const n in bad) { const r = await p.evaluate(t => { const x = RET.sio.parse(t); return { ok: x.ok, polluted: ({}).x !== undefined }; }, bad[n]);
    ok('rejects: ' + n, !r.ok && !r.polluted); }
  await p.evaluate(t => { document.getElementById('sioTxt').value = t; document.getElementById('sioPaste').click(); }, bad['non-numeric wallet']);
  ok('rejected paste changes nothing and shows error', await p.evaluate(() => localStorage.getItem('mnr_bank') === '42' && document.getElementById('sioAsk').hidden && /failed/i.test(document.getElementById('sioMsg').textContent)));
  await p.evaluate(() => document.getElementById('sioTxt').value = '');
  ok('cancel keeps save', await (async () => { await p.evaluate(c => { document.getElementById('sioTxt').value = c; document.getElementById('sioPaste').click(); document.getElementById('sioNo').click(); }, code); return p.evaluate(() => localStorage.getItem('mnr_bank') === '42'); })());
  ok('persist() requested at most once', await p.evaluate(() => { RET.sio.persist(); RET.sio.persist(); return window.__persist <= 1; }), await p.evaluate(() => window.__persist));
  ok('no page errors', p.errs.length === 0, p.errs.join('|'));
  // layout
  for (const vp of [{ width: 390, height: 763 }, { width: 375, height: 553 }, { width: 1280, height: 720 }]) {
    const q = await open(vp); await openSet(q);
    const r = await q.evaluate(() => { const body = document.getElementById('setBody'); document.getElementById('sioH').scrollIntoView(); const bad = [], W = innerWidth;
      for (const id of ['sioFile', 'sioCopy', 'sioPaste', 'sioLoad', 'sioTxt']) { const e = document.getElementById(id), b = e.getBoundingClientRect(); if (b.height < 43.5 && id !== 'sioTxt' || b.width < 43.5 || b.left < -0.5 || b.right > W + .5 || e.scrollWidth > e.clientWidth + 1 && id !== 'sioTxt') bad.push(id + ':' + [b.left, b.right, b.width, b.height].map(Math.round)); }
      return { bad, hs: document.documentElement.scrollWidth > innerWidth }; });
    ok(`buttons readable at ${vp.width}x${vp.height}`, !r.bad.length && !r.hs, JSON.stringify(r));
    await q.close(); }
  // flag off = old settings
  const o = await open(); await o.evaluate(() => { RET.saveio = false; }); await openSet(o);
  ok('flag off: no Save group', await o.evaluate(() => !document.getElementById('sioBox') && !document.getElementById('sioH')));
  srv.kill(); await br.close();
  const fails = res.filter(x => !x).length; console.log(fails ? `${fails} FAIL` : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
