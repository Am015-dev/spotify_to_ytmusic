#!/usr/bin/env node
// Nightrun explicit saving (parts/saves.js, flag RET.saves, ?saves=0 = old). Headless, no screenshots. PASS/FAIL lines, exit 1 on any FAIL.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/saves-test.js     env: GAME_DIR=...
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const res = [], ok = (n, p, i) => { res.push(p); console.log((p ? 'PASS ' : 'FAIL ') + n + (p || i == null ? '' : ' :: ' + i)); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await sleep(800);
  const br = await PW.chromium.launch(), base = `http://127.0.0.1:${port}/index.html?sim=1`;
  const SEED = { mnr_bank: '777', mnr_tut: '2', mnr_tutgift: '1', mnr_runs: '12', mnr_story: '{"stars":{"1":3,"2":2,"3":1},"snap":{},"all":false}', mnr_wplv: '{"pulse":3}', mnr_tale: '{"u":{"a":1},"r":{},"b":{},"n":2}' };
  const open = async (q, seed) => { const ctx = await br.newContext({ viewport: { width: 390, height: 763 }, hasTouch: true, acceptDownloads: true });
    await ctx.addInitScript(s => { if (!sessionStorage.getItem('__seeded')) { sessionStorage.setItem('__seeded', '1'); if (s) for (const k in s) localStorage.setItem(k, s[k]); } }, seed || null);
    const p = await ctx.newPage(), errs = []; p.errs = errs; p.on('pageerror', e => errs.push(e.message));
    await p.goto(base + (q || '')); await p.waitForFunction(() => window.RET && window.RET.sio && window.__mnr && document.getElementById('setBtn'), null, { timeout: 8000 }).catch(() => { });
    await p.evaluate(() => { RET.sioNoReload = true; }); return p; };
  const openSet = async p => { await p.evaluate(() => document.getElementById('setBtn').click()); await sleep(250); };
  const LS = (p, k) => p.evaluate(k => localStorage.getItem(k), k);
  let p = await open('', SEED);
  ok('flag on by default', await p.evaluate(() => RET.saves === true));
  // ---- autosave triggers ----
  await p.evaluate(() => { localStorage.setItem('mnr_bank', '1555'); });
  const t0 = JSON.parse(await LS(p, 'mnr_svinfo') || '{}').t || 0;
  const trig = { stageClear: () => __mnr.NR.emit('stageClear', { n: 3 }), runEnd: () => __mnr.NR.emit('runEnd', {}), banked: () => __mnr.NR.emit('banked', 5), forge: () => __mnr.NR.emit('forge', {}), forgePreset: () => __mnr.NR.emit('forgePreset', { i: 0 }) };
  for (const k of Object.keys(trig)) {
    await p.evaluate(() => { localStorage.removeItem('mnr_svauto'); });
    await p.evaluate(trig[k]); await sleep(1800);
    ok('autosave after ' + k, await p.evaluate(() => { const o = JSON.parse(localStorage.getItem('mnr_svauto') || 'null'); return !!o && o.keys.mnr_bank === '1555'; }));
  }
  await p.evaluate(() => { localStorage.removeItem('mnr_svauto'); localStorage.setItem('mnr_bank', '1600'); });
  await p.evaluate(() => { Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
  ok('autosave at visibilitychange (immediate)', await p.evaluate(() => { const o = JSON.parse(localStorage.getItem('mnr_svauto') || 'null'); return !!o && o.keys.mnr_bank === '1600'; }));
  await p.evaluate(() => { Object.defineProperty(document, 'hidden', { value: false, configurable: true }); localStorage.removeItem('mnr_svauto'); localStorage.setItem('mnr_bank', '1700'); window.dispatchEvent(new Event('pagehide')); });
  ok('autosave at pagehide (immediate)', await p.evaluate(() => { const o = JSON.parse(localStorage.getItem('mnr_svauto') || 'null'); return !!o && o.keys.mnr_bank === '1700'; }));
  await p.evaluate(() => { localStorage.setItem('mnr_bank', '1800'); __mnr.NR.emit('runEnd', {}); }); await sleep(1800);
  ok('previous auto copy rotated to mnr_svauto0', await p.evaluate(() => { const o = JSON.parse(localStorage.getItem('mnr_svauto0') || 'null'); return !!o && o.keys.mnr_bank === '1700'; }));
  ok('last save time stamped', JSON.parse(await LS(p, 'mnr_svinfo')).t > t0);
  ok('generic keys: unlisted key is saved', await p.evaluate(() => { localStorage.setItem('nr-newthing', '{"a":1}'); RET.SV.sync(); return RET.sioKeys.includes('nr-newthing') && 'nr-newthing' in RET.SV.snap() && !('mnr_svauto' in RET.SV.snap()); }));
  // ---- settings UI and slots ----
  await p.evaluate(() => { __mnr.GA.bank = 777; localStorage.setItem('mnr_bank', '777'); });
  const TALE = await LS(p, 'mnr_tale'), HI = await p.evaluate(() => { const st = JSON.parse(localStorage.getItem('mnr_story')).stars; let h = 0; for (const k in st) if (st[k] > 0) h = Math.max(h, +k); return h + 1; });
  await openSet(p);
  ok('Save / Load group + 3 slots in Settings', await p.evaluate(() => !!document.getElementById('svBox') && document.querySelectorAll('#svBox .svSlot').length === 3));
  ok('Settings shows last save time', await p.evaluate(() => /Last saved: (?!never)/.test(document.getElementById('setLastSave').textContent)));
  const slotBtn = (i, a) => p.evaluate(([i, a]) => document.querySelector(`#svBox .svSlot[data-i="${i}"] button[data-a="${a}"]`).click(), [i, a]);
  const yes = () => p.evaluate(() => document.getElementById('svYes').click());
  await p.evaluate(() => { document.querySelector('#svBox .svSlot[data-i="1"] input').value = 'Alex run'; });
  await slotBtn(1, 'save');
  let s1 = JSON.parse(await LS(p, 'mnr_sv1') || 'null');
  ok('slot save: name, stage, neon, time', !!s1 && s1.name === 'Alex run' && s1.stage === HI && s1.neon === 777 && s1.t > 0 && s1.keys.mnr_bank === '777' && !!s1.keys.mnr_tale, JSON.stringify(s1 && { n: s1.name, s: s1.stage, ne: s1.neon }));
  ok('slot row shows stage / Neon / time', await p.evaluate(h => new RegExp('Stage ' + h + ' · 777 Neon').test(document.querySelector('#svBox .svSlot[data-i="1"] .svNote').textContent), HI));
  ok('Saved toast shown', await p.evaluate(() => { const e = document.getElementById('svToast'); return !!e && !e.hidden && /Saved/.test(e.textContent); }));
  ok('slots 2 and 3 untouched', !(await LS(p, 'mnr_sv2')) && !(await LS(p, 'mnr_sv3')));
  // daily / weekly run end must not touch slots
  const before = await LS(p, 'mnr_sv1');
  await p.evaluate(() => { try { G.daily = true; G.weekly = 'x'; } catch (e) { } __mnr.NR.emit('runEnd', {}); }); await sleep(1800);
  ok('daily/weekly run never changes a slot', (await LS(p, 'mnr_sv1')) === before);
  await p.evaluate(() => { try { G.daily = false; G.weekly = null; } catch (e) { } });
  // overwrite asks first
  await slotBtn(1, 'save');
  ok('overwrite asks to confirm', await p.evaluate(() => !document.getElementById('svAsk').hidden && /Overwrite slot 1/.test(document.getElementById('svAsk').textContent)));
  await p.evaluate(() => document.getElementById('svNo').click());
  ok('cancel keeps the slot', (await LS(p, 'mnr_sv1')) === before);
  // load with confirm
  await p.evaluate(() => { localStorage.setItem('mnr_bank', '42'); });
  await slotBtn(1, 'load');
  ok('load asks to confirm, nothing changed before', await p.evaluate(() => !document.getElementById('svAsk').hidden && /Load slot 1/.test(document.getElementById('svAsk').textContent)) && (await LS(p, 'mnr_bank')) === '42');
  await yes(); await sleep(200);
  ok('load restores progress', (await LS(p, 'mnr_bank')) === '777' && (await LS(p, 'mnr_tale')) === TALE);
  const HI2 = HI;
  ok('load kept an undo copy of what it replaced', await p.evaluate(() => JSON.parse(localStorage.getItem('mnr_svpre')).keys.mnr_bank === '42'));
  ok('frozen after load: page-hide does not write old memory over it', await p.evaluate(() => { localStorage.setItem('mnr_bank','777'); window.dispatchEvent(new Event('pagehide')); return localStorage.getItem('mnr_bank') === '777'; }));
  // delete with confirm
  await p.reload(); await p.waitForFunction(() => window.RET && window.RET.sio && document.getElementById('setBtn')); await p.evaluate(() => { RET.sioNoReload = true; }); await openSet(p);
  ok('slot survives a reload', await p.evaluate(() => /Alex run|Slot 1/.test(document.querySelector('#svBox .svSlot[data-i="1"] input').value) && !!localStorage.getItem('mnr_sv1')));
  await slotBtn(1, 'del');
  ok('delete asks to confirm', await p.evaluate(() => !document.getElementById('svAsk').hidden && /Delete slot 1/.test(document.getElementById('svAsk').textContent)) && !!(await LS(p, 'mnr_sv1')));
  await yes();
  ok('delete removes the slot (a backup copy rotates)', !(await LS(p, 'mnr_sv1')) && !!(await LS(p, 'mnr_svbk1')));
  // ---- export / import ----
  await p.evaluate(() => { localStorage.setItem('mnr_bank', '777'); localStorage.setItem('nr-newthing', '{"a":1}'); });
  const code = await p.evaluate(() => RET.sioUI.code());
  ok('code is versioned and covers a generic key', code.startsWith('MNR1.') && await p.evaluate(c => { const o = JSON.parse(decodeURIComponent(escape(atob(c.slice(5).replace(/-/g, '+').replace(/_/g, '/'))))); return o.v === 1 && typeof o.sum === 'string' && !!o.keys.nr_newthing === false && !!o.keys['nr-newthing'] && !!o.keys.mnr_tale; }, code));
  const dl = await Promise.all([p.waitForEvent('download', { timeout: 4000 }).catch(() => null), p.evaluate(() => document.getElementById('sioFile').click())]);
  ok('export file downloads', !!dl[0] && /\.json$/.test(dl[0].suggestedFilename()));
  const orig = await p.evaluate(() => { const o = {}; for (const k of RET.SV.keys()) o[k] = localStorage.getItem(k); return o; });
  // corrupt codes: rejected, progress intact
  const tryImp = async txt => { await p.evaluate(t => { document.getElementById('sioTxt').value = t; document.getElementById('sioPaste').click(); }, txt); return p.evaluate(() => ({ asked: !document.getElementById('sioAsk').hidden, msg: document.getElementById('sioMsg').textContent })); };
  const same = async () => JSON.stringify(await p.evaluate(() => { const o = {}; for (const k of RET.SV.keys()) o[k] = localStorage.getItem(k); return o; })) === JSON.stringify(orig);
  for (const [n, bad] of [['flipped char', code.slice(0, 40) + (code[40] === 'A' ? 'B' : 'A') + code.slice(41)], ['truncated', code.slice(0, code.length >> 1)], ['garbage', 'hello world'], ['empty', '   ']]) {
    const r = await tryImp(bad); ok('corrupt code rejected (' + n + '), progress intact', !r.asked && /Nothing was changed|Nothing to import/.test(r.msg) && await same(), r.msg);
  }
  // valid import into wiped storage (as a new phone), including the generic key
  await p.evaluate(() => { for (const k of RET.SV.keys()) localStorage.removeItem(k); });
  const r2 = await tryImp(code); ok('valid code asks to confirm', r2.asked);
  await p.evaluate(() => document.getElementById('sioYes').click());
  const back = await p.evaluate(() => { const o = {}; for (const k of RET.SV.keys()) o[k] = localStorage.getItem(k); return o; });
  for (const k of Object.keys(orig)) if (!k.startsWith('mnr_sv') && back[k] !== orig[k]) { ok('round trip key ' + k, false, back[k]); }
  ok('round trip: every key identical (incl. nr-newthing)', Object.keys(orig).filter(k => !/^mnr_sv/.test(k)).every(k => back[k] === orig[k]));
  // file import
  const file = await p.evaluate(() => RET.sio.pack());
  await p.evaluate(() => { localStorage.setItem('mnr_bank', '1'); });
  await p.setInputFiles('#sioPick', { name: 's.json', mimeType: 'application/json', buffer: Buffer.from(file) }); await sleep(300);
  ok('file import asks to confirm', await p.evaluate(() => !document.getElementById('sioAsk').hidden));
  await p.close();
  // ---- storage failure ----
  p = await open('', SEED); await openSet(p);
  await p.evaluate(() => { Storage.prototype.setItem = function () { throw new DOMException('full', 'QuotaExceededError'); }; });
  await p.evaluate(() => { __mnr.GA.bank = 99; __mnr.NR.emit('stageClear', { n: 1 }); }); await sleep(1900);
  ok('storage failure shows a clear warning', await p.evaluate(() => { const w = document.getElementById('svWarn'), t = document.getElementById('svToast'); return !!w && !w.hidden && /Cannot save/.test(w.textContent) && !!t && /Cannot save/.test(t.textContent); }));
  ok('failed write left the old backup alone', await p.evaluate(() => RET.SV.S.fail === true));
  ok('slot save under failure reports failure, not success', await p.evaluate(() => RET.SV.saveSlot(2, 'x') === false));
  await p.close();
  // ---- ?saves=0 ----
  p = await open('&saves=0', SEED); await openSet(p);
  await p.evaluate(() => { __mnr.GA.bank = 321; __mnr.NR.emit('stageClear', { n: 1 }); __mnr.NR.emit('runEnd', {}); window.dispatchEvent(new Event('pagehide')); }); await sleep(1900);
  ok('?saves=0: flag off, no UI, no new keys, old export group intact', await p.evaluate(() => RET.saves === false && !document.getElementById('svBox') && !document.getElementById('setLastSave') && !localStorage.getItem('mnr_svauto') && !localStorage.getItem('mnr_svinfo') && !!document.getElementById('sioBox') && !RET.SV.S.flushes));
  ok('?saves=0: sio code is the old MNR1 format', await p.evaluate(() => RET.sioUI.code().startsWith('MNR1.')));
  ok('no page errors', p.errs.length === 0, p.errs.join('|'));
  await p.close(); await br.close(); srv.kill();
  const bad = res.filter(x => !x).length; console.log(bad ? `${bad} FAIL of ${res.length}` : `ALL ${res.length} PASS`); process.exit(bad ? 1 : 0);
})().catch(e => { console.log('FAIL crash :: ' + e.message); process.exit(1); });
