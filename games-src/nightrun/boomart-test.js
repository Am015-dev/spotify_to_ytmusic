#!/usr/bin/env node
// PURPOSE: W209 probe - which explosion sheets are drawn on which events (stepped, human-model bot, stage 1..N); gate for flag RET.boomart
//   NODE_PATH=$(npm root -g) node games-src/nightrun/boomart-test.js     env: GAME_DIR=<dir with index.html> STAGES=1 SEEDS=3 URLX=&boomart=0 (baseline) VERBOSE=1
//  (a) every kill (not a boss) queues a boom sheet whose size matches the enemy (small/medium/large by hull radius) and whose look matches its kind (fire/electric/plasma)
//  (b) bosses queue boom-boss-a/b; medium and larger kills also queue boom-debris
//  (c) hits queue hit-spark (fx-spark) and boss hits hitconfirm
//  (d) >= 6 different fx-boom-* sheets are DRAWN in stage 1 (counted at ART.drawAnim)
//  (e) no page errors. PASS/FAIL lines only.
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const [S0, S1] = (process.env.STAGES || '1-1').split('-').map(Number), SEEDS = process.env.SEEDS !== undefined ? +process.env.SEEDS : 3, VERBOSE = !!process.env.VERBOSE;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const hb = fs.readFileSync(path.resolve(__dirname, 'humanbot.js'), 'utf8'), a0 = hb.indexOf('const BOT = (o) => {'), a1 = hb.indexOf('\n};\n(async', a0);
const BOTSRC = hb.slice(a0 + 'const BOT = '.length, a1 + 3);

const INIT = () => {
  window.__bm = { log: [], drawn: {}, kills: [], step: 0, errs: 0 };
  const hook = () => {
    const ART = window.__mnr && window.__mnr.ART; if (!ART || !ART.boom || window.__bm.hooked) return;
    window.__bm.hooked = 1; const B = window.__bm;
    const ob = ART.boom; ART.boom = function (k, x, y, sz) { B.log.push({ k, sz, x, y, st: B.step }); return ob.apply(this, arguments); };
    const od = ART.drawAnim; ART.drawAnim = function (c, key) { if (/^fx-(boom|spark|hitconfirm)/.test(key)) B.drawn[key] = (B.drawn[key] || 0) + 1; return od.apply(this, arguments); };
  };
  window.__bmHook = hook;
};
const RUN = `(async (o) => { const B = window.__bm; window.__bmHook();
  const m = window.__mnr; let ons = false;
  window.__rec = (mm, i) => { B.step = i; if (i % 3 === 0) mm.render(mm.G.t, 3 / 60); if (!ons) { ons = true; window.NR.on('kill', ({ e, boss }) => { const at = B.step; B.kills.push({ ty: e.type, r: e.r, boss: !!boss, wk: e._wk || '', ks: B.log.filter(l => (l.st === at || l.st === at - 1) && Math.abs(l.x - e.x) < 1 && Math.abs(l.y - e.y) < 1).map(l => l.k) }); }); } };
  const BOT = ${BOTSRC}; const r = BOT(o); window.__rec = null; return r; })`;

(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  for (let i = 0; i < 60; i++) { try { if ((await fetch(`http://127.0.0.1:${port}/index.html`)).ok) break; } catch (e) { } await sleep(100); }
  const br = await PW.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const kills = [], drawn = {}, log = [], errs = [], boss = { log: [], drawn: {} }; let runs = 0;
  for (let n = S0; n <= S1; n++) for (let seed = 1; seed <= SEEDS; seed++) {
    const ctx = await br.newContext({ viewport: { width: 390, height: 763 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true }), p = await ctx.newPage();
    p.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.addInitScript(() => { try { localStorage.setItem('mnr_tipdone', 'true'); localStorage.setItem('mnr_fscard', '99'); } catch (e) { } });
    await p.addInitScript(INIT);
    await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&all=1&nomusic=1${process.env.URLX || ''}`, { waitUntil: 'domcontentloaded' });
    await p.waitForFunction(() => window.__mnr && window.__mnr.TR.list.length > 0, null, { timeout: 20000 }).catch(() => { }); await sleep(400);
    await p.waitForFunction(() => __mnr.ART.rd && __mnr.ART.rd.size > 0, null, { timeout: 20000 }).catch(() => { });
    await p.evaluate(() => { const ART = __mnr.ART; window.__bmHook(); for (const k of Object.keys(ART.ANIM.s)) if (/^fx-(boom|spark|hitconfirm)/.test(k)) ART.anim(k); }); await sleep(2500);
    try { await p.evaluate(`${RUN}(${JSON.stringify({ n, bot: 'human', seed, build: 'fresh', diff: 'normal', MAXT: 300 })})`); } catch (e) { errs.push('harness ' + String(e.message).slice(0, 120)); }
    const B = await p.evaluate(() => ({ kills: window.__bm.kills, drawn: window.__bm.drawn, log: window.__bm.log.map(l => l.k) }));
    kills.push(...B.kills); for (const k in B.drawn) drawn[k] = (drawn[k] || 0) + B.drawn[k]; log.push(...B.log); runs++;
    await ctx.close();
  }
  { // boss: a fake boss kill in a running stage, stepped and rendered for 2 s
    const ctx = await br.newContext({ viewport: { width: 390, height: 763 }, hasTouch: true, isMobile: true }), p = await ctx.newPage();
    p.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort()); await p.addInitScript(INIT);
    await p.addInitScript(() => { try { localStorage.setItem('mnr_tipdone', 'true'); localStorage.setItem('mnr_fscard', '99'); } catch (e) { } });
    await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&all=1&nomusic=1${process.env.URLX || ''}`, { waitUntil: 'domcontentloaded' });
    await p.waitForFunction(() => window.__mnr && window.__mnr.TR.list.length > 0, null, { timeout: 20000 }).catch(() => { }); await sleep(2500);
    await p.evaluate(() => { for (const k of ['fx-boom-boss-a/burst', 'fx-boom-boss-b/burst']) __mnr.ART.anim(k); }); await sleep(2500);   // the game warms these on the boss intro (SPR.warmBoss)
    const r = await p.evaluate(() => { const m = __mnr; window.__bmHook(); m.startStory(1); m.simOn(true); for (let i = 0; i < 60; i++) m.step(1 / 60);
      window.NR.emit('kill', { e: { type: 'boss', x: 600, y: 270, r: 38, hp: 0, nm: 'test' }, boss: true });
      for (let i = 0; i < 150; i++) { m.step(1 / 60); if (i % 3 === 0) m.render(m.G.t, 3 / 60); }
      return { log: window.__bm.log.map(l => l.k), drawn: window.__bm.drawn }; }).catch(e => ({ log: [], drawn: {}, err: String(e.message).slice(0, 120) }));
    boss.log = r.log; boss.drawn = r.drawn; if (r.err) errs.push('boss ' + r.err); await ctx.close();
  }
  await br.close(); srv.kill();
  const cnt = a => a.reduce((o, k) => (o[k] = (o[k] || 0) + 1, o), {});
  const isBoom = k => /^boom-/.test(k) && k !== 'boom-debris';
  const sizeOf = r => r < 18 ? 'small' : r < 30 ? 'medium' : 'large';
  const byTy = {}; for (const k of kills) { const t = k.ty + (k.boss ? '*boss' : ''); (byTy[t] = byTy[t] || { n: 0, r: k.r, keys: {} }).n++; for (const q of k.ks) byTy[t].keys[q] = (byTy[t].keys[q] || 0) + 1; }
  if (VERBOSE) { for (const k of kills.filter(k => !k.boss && !k.ks.some(isBoom)).slice(0, 5)) console.log('INFO unmatched', JSON.stringify(k)); console.log('INFO runs', runs, 'kills', kills.length); console.log('INFO queued', JSON.stringify(cnt(log))); console.log('INFO drawn', JSON.stringify(drawn)); for (const t in byTy) console.log('INFO kill', t, 'r=' + byTy[t].r, 'n=' + byTy[t].n, JSON.stringify(byTy[t].keys)); }
  let fails = 0; const ok = (name, cond, info) => { if (!cond) fails++; console.log((cond ? 'PASS ' : 'FAIL ') + name + (info ? ' :: ' + info : '')); };
  const plain = kills.filter(k => !k.boss), bossK = kills.filter(k => k.boss);
  const LOOK = { turret: 'electric', sniper: 'electric', shielder: 'electric', healer: 'electric', gate: 'electric', gunship: 'plasma', carrier: 'plasma' };
  const matched = plain.filter(k => k.ks.includes('boom-' + sizeOf(k.r || 14) + '-' + (LOOK[k.ty] || 'fire')));
  ok('a every kill shows the boom sheet of its size and kind', plain.length > 0 && matched.length === plain.length, matched.length + '/' + plain.length + ' kills');
  const deb = plain.filter(k => sizeOf(k.r || 14) !== 'small'), debOk = deb.filter(k => k.ks.includes('boom-debris'));
  ok('b medium+ kills also queue debris', debOk.length === deb.length, debOk.length + '/' + deb.length);
  const bl = cnt(boss.log); ok('b a boss kill queues five boss-a/b blasts, drawn', (bl['boom-boss-a'] || 0) + (bl['boom-boss-b'] || 0) === 5 && boss.drawn['fx-boom-boss-a/burst'] > 0 && boss.drawn['fx-boom-boss-b/burst'] > 0, JSON.stringify(bl) + ' ' + JSON.stringify(boss.drawn));
  const lg = cnt(log);
  ok('c hits queue the spark sheet', (lg['hit-spark'] || 0) > 0, 'hit-spark ' + (lg['hit-spark'] || 0) + ', hitconfirm ' + (lg['hitconfirm'] || 0));
  for (const k in boss.drawn) drawn[k] = (drawn[k] || 0) + boss.drawn[k]; const sheets = Object.keys(drawn).filter(k => /^fx-boom-/.test(k));
  ok('d >= 6 different boom sheets drawn', sheets.length >= 6, sheets.length + ' ' + sheets.map(s => s.replace('fx-boom-', '').replace('/burst', '')).join(','));
  ok('d spark / hitconfirm drawn', !!drawn['fx-spark/burst'], Object.keys(drawn).filter(k => !/^fx-boom-/.test(k)).join(','));
  ok('e no page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  console.log(fails ? 'FAIL boomart-test (' + fails + ')' : 'PASS boomart-test');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.log('FAIL boomart-test crashed: ' + e.stack); process.exit(2); });
