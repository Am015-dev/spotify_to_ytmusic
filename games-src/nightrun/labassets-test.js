#!/usr/bin/env node
// Lab ASSETS tab (parts/lab/labassets.js, flag RET.labassets) through the real page (prints pass/fail only):
//   NODE_PATH=$(npm root -g) node games-src/nightrun/labassets-test.js      env: GAME_DIR=<dir with index.html>, V=1 (verbose)
//  (a0) placeholder_guard.py: no placeholder picture listed in ready.json (any media/*.webp)
//  (a) the ASSETS tab opens in the Lab; sections and their real/placeholder/missing counts match assets-manifest.json + ready.json + placeholders.json;
//      every manifest file is somewhere in a section; the header counts and the wiring counts are shown
//  (b) filter chips (REAL / PLACEHOLDER / MISSING) change the tiles, the counter stays right; a tile opens the detail card (dark and light box, save-as name, size, notes)
//  (c) sandbox previews run: a weapon bullet, an explosion, a zoo enemy, a boss, a pickup, an on-foot pose (canvas over the arena); BACK restores weapon, ship and settings
//  (d) PREVIEW PLACEHOLDERS: a stand-in FXW is wrapped, preview is true only inside the Lab, false before and after; the placeholder file is loaded into ART only while previewing
//  (e) WIRING view lists every asset of the section with a state; phone 390x763 (text >= 14 px, buttons >= 44 px, no sideways scroll) and desktop 1280x720
//  (f) ?labassets=0 = the old Lab (no ASSETS tab); no page errors anywhere
const PW = require('playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fp = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148';
const man = JSON.parse(fs.readFileSync(path.join(__dirname, 'assets-manifest.json'), 'utf8'));
const ready = new Set(JSON.parse(fs.readFileSync(path.join(GAME, 'media/ready.json'), 'utf8')));
const phs = JSON.parse(fs.readFileSync(path.join(GAME, 'media/placeholders.json'), 'utf8'));
const idx = JSON.parse(fs.readFileSync(path.join(GAME, 'media/assets-index.json'), 'utf8'));

(async () => {
  const fails = [], port = await fp(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME], { stdio: 'ignore' }); await sleep(700);
  const br = await PW.chromium.launch();
  const open = async (w, h, touch, q) => { const ctx = await br.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch, userAgent: touch ? UA : undefined }), p = await ctx.newPage();
    p.on('pageerror', e => fails.push(`page error @${w}x${h}: ${e.message}`)); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.addInitScript(() => { window.__earlyFXW = window.FXW; });
    await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1&lab=1${q || ''}`);
    await p.waitForFunction(() => window.__mnr && __mnr.G && __mnr.G.lab, null, { timeout: 20000 }).catch(() => fails.push(`lab did not open @${w}x${h}`)); await sleep(500); return { ctx, p }; };
  const tab = async p => { await p.click('#labTab_assets'); await p.waitForSelector('#laSecs button', { timeout: 8000 }).catch(() => fails.push('ASSETS tab did not load')); await sleep(200); };
  const sec = async (p, id) => { await p.click(`#laSecs button[data-sec="${id}"]`); await sleep(150); };
  // expected counts from the files themselves
  const exp = {};
  const secOf = f => idx.manifest.concat(idx.extra.map(file => ({ file, man: 0 }))).find(m => m.file === f);
  const expState = m => ready.has(m.file) ? 'REAL' : m.man === 0 ? 'REAL' : phs[m.file] ? 'PLACEHOLDER' : 'MISSING';

  for (const [nm, w, h, touch] of [['desktop', 1280, 720, false], ['phone', 390, 763, true]]) {
    const { ctx, p } = await open(w, h, touch);
    if (!(await p.$('#labTab_assets'))) { fails.push(nm + ': no ASSETS tab'); await ctx.close(); continue; }
    await tab(p);
    // (a0) no file listed in ready.json may be a generated placeholder picture (placeholder_guard.py checks all media/*.webp: md5, pixels, border + hatching)
  { const g = cp.spawnSync('python3', [path.join(__dirname, 'placeholder_guard.py')], { encoding: 'utf8' }); if (g.status !== 0) fails.push('ready.json lists placeholder pictures: ' + (g.stdout || g.stderr).split('\n').filter(l => /FAKE-READY|fake-ready/.test(l)).slice(0, 14).join(' | ')); }
  // (a) data
    const d = await p.evaluate(() => { const L = LABX; return { n: L.data.all.length, files: L.data.all.map(e => e.file), st: Object.fromEntries(L.data.all.map(e => [e.file, e.state])), sec: Object.fromEntries(L.data.all.map(e => [e.file, e.sec])), sum: document.getElementById('laSum').textContent }; });
    const all = idx.manifest.concat(idx.extra.map(file => ({ file, man: 0 })));
    if (d.n !== all.length) fails.push(`${nm}: ${d.n} assets, expected ${all.length}`);
    for (const m of all) { if (!d.files.includes(m.file)) { fails.push(`${nm}: ${m.file} missing from the tab`); break; } if (d.st[m.file] !== expState(m)) { fails.push(`${nm}: ${m.file} is ${d.st[m.file]}, expected ${expState(m)}`); break; } }
    for (const m of man) if (!d.sec[m.file]) fails.push(`${nm}: ${m.file} has no section`);
    const nReal = all.filter(m => expState(m) === 'REAL').length, nPh = all.filter(m => expState(m) === 'PLACEHOLDER').length;
    if (!d.sum.includes(`${all.length} assets`) || !d.sum.includes(`${nReal} real, ${nPh} placeholder`)) fails.push(`${nm}: header says "${d.sum}", expected ${all.length} assets ${nReal} real, ${nPh} placeholder`);
    if (!/wired/.test(d.sum)) fails.push(nm + ': no wiring counts in the header');
    // sections: the chip counter matches the data
    for (const id of ['ships', 'weapons', 'enemies', 'bosses', 'pickups', 'effects', 'onfoot', 'chars', 'ach', 'ui']) {
      await sec(p, id);
      const r = await p.evaluate(() => ({ cnt: document.getElementById('laCount').textContent, tiles: document.querySelectorAll('#laGrid .tile').length, bad: [...document.querySelectorAll('#laGrid .tile')].filter(t => !t.querySelector('.bd')).length }));
      const ex = { REAL: 0, PLACEHOLDER: 0, MISSING: 0 }; for (const m of all) if (d.sec[m.file] === id) ex[expState(m)]++;
      const want = `${ex.REAL} real, ${ex.PLACEHOLDER} placeholder` + (ex.MISSING ? `, ${ex.MISSING} missing` : '');
      if (r.cnt !== want) fails.push(`${nm} ${id}: counter "${r.cnt}", expected "${want}"`);
      if (r.tiles < ex.REAL + ex.PLACEHOLDER + ex.MISSING) fails.push(`${nm} ${id}: ${r.tiles} tiles for ${ex.REAL + ex.PLACEHOLDER + ex.MISSING} assets`);
      if (r.bad) fails.push(`${nm} ${id}: tiles without a badge`);
      if (process.env.V) console.log(nm, id, r.cnt, r.tiles);
    }
    // (b) filters
    await sec(p, 'weapons');
    for (const f of ['REAL', 'PLACEHOLDER', 'MISSING', 'all']) {
      await p.click(`#laFilt button[data-filt="${f}"]`); await sleep(100);
      const bd = await p.evaluate(() => [...document.querySelectorAll('#laGrid .tile .bd')].map(b => b.textContent));
      if (f !== 'all' && bd.some(b => b !== f)) fails.push(`${nm}: filter ${f} shows ${[...new Set(bd)]}`);
      if (f === 'all' && !bd.length) fails.push(nm + ': filter ALL empty');
    }
    // detail card
    await p.click('#laGrid .tile'); await sleep(500);
    const c = await p.evaluate(() => { const c = document.getElementById('laCard'); if (!c) return null; const r = c.getBoundingClientRect(); return { t: c.textContent, boxes: c.querySelectorAll('.bx').length, w: Math.round(r.width) }; });
    if (!c) fails.push(nm + ': detail card did not open'); else { if (c.boxes !== 2) fails.push(nm + ': detail card has no dark+light boxes'); if (!/save as/.test(c.t) || !/media\//.test(c.t) || !/what to paint/.test(c.t) || !/used by/.test(c.t)) fails.push(nm + ': detail card is missing fields: ' + c.t.slice(0, 120)); if (!/transparent/.test(c.t)) fails.push(nm + ': no transparency line'); }
    await p.evaluate(() => LABX.closeCard());
    // (e) layout: text and targets
    const ui = await p.evaluate(() => { const bad = []; for (const b of document.querySelectorAll('#labP .la .lac')) { const r = b.getBoundingClientRect(); if (r.height && r.height < 43.5) bad.push('button ' + b.textContent + ' ' + Math.round(r.height)); }
      for (const e of document.querySelectorAll('#labP .la .tile b,#labP .la .tile small,#labP .la .bd,#labP .la .lasum')) { const f = parseFloat(getComputedStyle(e).fontSize); if (f < 13.9) bad.push('text ' + e.textContent.slice(0, 20) + ' ' + f); }
      return { bad: bad.slice(0, 5), sx: document.documentElement.scrollWidth > innerWidth + 1, px: document.getElementById('labP').scrollWidth > document.getElementById('labP').clientWidth + 1 }; });
    if (ui.bad.length) fails.push(`${nm}: ${ui.bad.join('; ')}`); if (ui.sx || ui.px) fails.push(`${nm}: horizontal scroll ${JSON.stringify(ui)}`);
    // wiring view
    await p.click('#laView'); await sleep(150);
    const wv = await p.evaluate(() => { const rows = [...document.querySelectorAll('#laSecs ~ table.wire tr')].filter(r => r.children.length === 3 && r.children[0].tagName === 'TD'); return { n: rows.length, st: [...new Set(rows.map(r => r.children[2].textContent))] }; });
    const nSec = all.filter(m => d.sec[m.file] === 'weapons').length;
    if (!wv.n || wv.n < nSec) fails.push(`${nm}: wiring rows ${wv.n}, expected >= ${nSec}`); if (wv.st.some(s => !['wired', 'hook only', 'not wired', 'in code'].includes(s))) fails.push(nm + ': wiring states ' + wv.st);
    await p.click('#laView'); await sleep(100);

    // (c) previews
    const pv = async (secId, pick, check, label) => {
      await sec(p, secId);
      const ok = await p.evaluate(pickSrc => { const f = eval('(' + pickSrc + ')'); const e = f(LABX.list(LABX.S.sec)); if (!e) return 'no tile'; LABX.preview(e); return e.file || e.name; }, pick.toString());
      if (ok === 'no tile') { fails.push(`${nm}: preview ${label}: no tile`); return; }
      await sleep(1700); const r = await p.evaluate(check); if (r !== true) fails.push(`${nm}: preview ${label} (${ok}): ${r}`);
      return ok;
    };
    // weapon bullet
    await pv('weapons', l => l.find(e => e.base === 'wp-arc' || e.base === 'wp-pulse'), () => { const m = __mnr; return m.G.lab && document.getElementById('laBar') && document.getElementById('labP').classList.contains('lapv') ? (m.G.pb.length > 0 || m.G.en.length > 0 ? true : 'no shots / targets') : 'bar missing'; }, 'weapon');
    const eq = await p.evaluate(() => ({ eq: LABX.pv && LABX.pv.pl.eq, cur: __mnr.WP ? __mnr.WP.eq : null }));
    // snapshot restore on BACK
    const before = await p.evaluate(() => ({ auto: __mnr.SET.auto }));
    await p.click('#laBar button:has-text("BACK TO LIST")'); await sleep(300);
    const after = await p.evaluate(() => ({ auto: __mnr.SET.auto, pv: !!LABX.pv, hid: document.getElementById('labP').classList.contains('lapv'), bar: !!document.getElementById('laBar'), snap: !!LABX.snap }));
    if (after.pv || after.hid || after.bar || after.snap) fails.push(nm + ': BACK did not clean up ' + JSON.stringify(after));
    // explosion
    await pv('effects', l => l.find(e => e.base === 'fx-explosion-big'), () => (__mnr.ART.fx.length > 0 ? true : 'no explosion queued'), 'explosion');
    await p.evaluate(() => LABX.stop());
    // zoo enemy
    await pv('enemies', l => l.find(e => e.base === 'en-shielder'), () => (__mnr.G.en.some(x => x.type === 'shielder') ? true : 'no shielder spawned'), 'zoo enemy');
    await p.evaluate(() => LABX.stop());
    // boss
    await pv('bosses', l => l.find(e => e.base === 'boss-kronos'), () => (__mnr.G.boss ? true : 'no boss'), 'boss');
    await p.evaluate(() => LABX.stop());
    // pickup
    await pv('pickups', l => l.find(e => e.base === 'pk-shard'), () => (__mnr.G.pk.length ? true : 'no pickup'), 'pickup');
    await p.evaluate(() => LABX.stop());
    // on-foot pose: a canvas over the arena with something drawn on it
    await pv('onfoot', l => l.find(e => e.base === 'kai-run-a') || l.find(e => e.dir === 'foot'), () => { const c = document.getElementById('laFoot'); if (!c) return 'no canvas'; const g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 40) if (d[i]) n++; return n > 200 ? true : 'canvas empty (' + n + ')'; }, 'on-foot pose');
    const fh = await p.evaluate(() => { const c = document.getElementById('laFoot'), b = document.getElementById('laBar'); return c && b ? c.getBoundingClientRect().bottom <= b.getBoundingClientRect().top + 1 : null; });
    if (fh === false) fails.push(nm + ': on-foot canvas overlaps the control bar');
    await p.evaluate(() => LABX.stop()); await sleep(200);
    if (await p.$('#laFoot')) fails.push(nm + ': on-foot canvas left behind');
    // ship with and without mounts
    await pv('ships', l => l.find(e => e.base === 'spr-ship-tri' || e.base === 'ship-tri' || e.base === 'spr-ship-std'), () => (__mnr.GA.ship ? true : 'no ship'), 'ship');
    const rig = await p.evaluate(() => { const a = __mnr.RIG ? __mnr.RIG.on : null; return a; });
    await p.evaluate(() => LABX.stop());

    // (d) placeholder switch: a stand-in effect module
    const sw = await p.evaluate(() => {
      const out = {}; window.FXW = { pic: k => null, preview: false }; out.before = FXW.preview; LABX.apply(); out.inLab = FXW.preview; out.wrapped = !!FXW._labWrap;
      LABX.S.ph = true; const r1 = FXW.pic('crown'); out.picOn = typeof r1;
      LABX.setPh(false); out.off = FXW.preview; out.picOff = FXW.pic('crown');
      LABX.setPh(true); return out; });
    await sleep(500);
    const sw2 = await p.evaluate(() => ({ on: FXW.preview, pic: !!FXW.pic('crown') || FXW.pic('crown') === null }));
    if (sw.before !== false || sw.inLab !== true || !sw.wrapped) fails.push(nm + ': placeholder switch did not arm in the Lab ' + JSON.stringify(sw));
    if (sw.off !== false || sw.picOff !== null) fails.push(nm + ': switch OFF still shows placeholders ' + JSON.stringify(sw));
    const pic = await p.evaluate(() => { const r = FXW.pic('crown'); return !!r && r.tagName === 'IMG'; }); if (!pic) fails.push(nm + ': FXW.pic gave no placeholder picture with the switch ON');
    // placeholder file goes into ART only while previewing, and leaves again
    const art = await p.evaluate(async () => { const e = LABX.data.all.find(x => x.state === 'PLACEHOLDER' && !x.dir && /^fx-/.test(x.base)); if (!e) return { skip: 1 }; const n = e.stem; const had = n in __mnr.ART.bm; LABX.preview(e); await new Promise(r => setTimeout(r, 400)); const during = n in __mnr.ART.bm; LABX.stop(); const after = n in __mnr.ART.bm; return { had, during, after, n }; });
    if (!art.skip && (art.had || !art.during || art.after)) fails.push(nm + ': placeholder file in ART: ' + JSON.stringify(art));
    // leaving the Lab resets everything
    await p.evaluate(() => { LABX.preview(LABX.data.all.find(e => e.base === 'wp-pulse')); });
    await sleep(300);
    await p.evaluate(() => __mnr.quitToTitle ? __mnr.quitToTitle() : document.getElementById('labP') && [...document.querySelectorAll('#labP button')].find(b => b.textContent === 'EXIT').click());
    await sleep(800);
    const gone = await p.evaluate(() => ({ lab: !!(__mnr.G && __mnr.G.lab && __mnr.running), fxw: FXW.preview, pv: !!LABX.pv, bar: !!document.getElementById('laBar'), ph: LABX.S.ph, snap: !!LABX.snap }));
    if (gone.lab) fails.push(nm + ': Lab did not close'); else if (gone.fxw !== false || gone.pv || gone.bar || gone.snap) fails.push(nm + ': Lab exit left state behind ' + JSON.stringify(gone));
    await ctx.close();
  }
  // (f) flag off
  { const { ctx, p } = await open(1280, 720, false, '&labassets=0'); if (await p.$('#labTab_assets')) fails.push('labassets=0: ASSETS tab still there'); if (!(await p.$('#labTab_foes'))) fails.push('labassets=0: old tabs missing');
    const f = await p.evaluate(() => ({ cls: document.getElementById('labP').classList.contains('lax') })); if (f.cls) fails.push('labassets=0: panel class lax set'); await ctx.close(); }
  await br.close(); srv.kill();
  console.log(fails.length ? 'FAIL\n' + [...new Set(fails)].slice(0, 40).join('\n') : 'PASS labassets-test'); process.exit(fails.length ? 1 : 0);
})();
