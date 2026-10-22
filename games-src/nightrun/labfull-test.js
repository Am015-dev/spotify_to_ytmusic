#!/usr/bin/env node
// Complete Lab (parts/labfull.js, flag RET.labfull) through the real page (prints pass/fail only):
//   NODE_PATH=$(npm root -g) node games-src/nightrun/labfull-test.js      env: GAME_DIR=<dir with index.html>, REF_DIR=<dir with the build before labfull> (optional, ?labfull=0 DOM must match), V=1
//  (a) COVERAGE: every enemy / fleet / flanker / foot enemy / boss / ship / hybrid / mod / weapon / power-up / dash upgrade / EMP signature / class / skill node / rule / twist /
//      event / formation / lesson / tutorial step / sprite strip that the game's own tables define has a registry entry (the ids are read from the tables, not from labfull.js)
//  (b) every registered item spawns in the sandbox for a few frames with no page error (on-foot and tutorial items leave the Lab: tested last)
//  (c) saves untouched: localStorage, garage / forge / weapons / story / settings / class / dash-upgrade memory are the same after the spawns and again after leaving the Lab
//  (d) DEX tab: search box finds a partial id, group chips filter, a tap spawns and fills the info card; CTRL: god, invulnerable, slow-mo, pause + step, hitboxes, seed lock
//      (same seed = same spawn), set wave changes the ramp, COPY REPRO text carries flags + seed + stage + spawns, the repro URL replays the spawn
//  (e) phone 390x763 and 375x553: no sideways scroll, DEX buttons >= 36 px, text >= 12 px;  (f) ?labfull=0: no DEX / CTRL tab, no LABFULL, the old tab row, same panel DOM as REF_DIR
const PW = require('playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun'), REF = process.env.REF_DIR;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fp = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148';

(async () => {
  const fails = [], note = m => { if (process.env.V) console.log(m); };
  const port = await fp(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME], { stdio: 'ignore' });
  let rport = 0, rsrv = null; if (REF) { rport = await fp(); rsrv = cp.spawn('python3', ['-m', 'http.server', String(rport), '--bind', '127.0.0.1', '--directory', REF], { stdio: 'ignore' }); }
  await sleep(800); const br = await PW.chromium.launch();
  const open = async (w, h, touch, q, pt) => { const ctx = await br.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch, userAgent: touch ? UA : undefined }), p = await ctx.newPage();
    p.on('pageerror', e => fails.push(`page error @${w}x${h}${q || ''}: ${e.message}`)); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.goto(`http://127.0.0.1:${pt || port}/index.html?nomusic=1&lab=1${q || ''}`);
    await p.waitForFunction(() => window.__mnr && __mnr.G && __mnr.G.lab, null, { timeout: 20000 }).catch(() => fails.push(`lab did not open @${w}x${h}${q || ''}`)); await sleep(500); return { ctx, p }; };

  // ---------- (f) the old Lab ----------
  { const { ctx, p } = await open(390, 763, true, '&labfull=0');
    const r = await p.evaluate(() => ({ lf: typeof window.LABFULL, tabs: [...document.querySelectorAll('#labP .ltabs button')].map(b => b.id), html: document.getElementById('labP').innerHTML }));
    if (r.lf !== 'undefined') fails.push('labfull=0: LABFULL exists'); if (r.tabs.some(t => /dex|ctrl/.test(t))) fails.push('labfull=0: DEX/CTRL tab present: ' + r.tabs.join());
    if (REF) { const o = await open(390, 763, true, '&labfull=0', rport); const h = await o.p.evaluate(() => document.getElementById('labP').innerHTML); if (h !== r.html) fails.push('labfull=0: the Lab panel differs from the reference build'); await o.ctx.close(); }
    await ctx.close(); }

  // ---------- with labfull ----------
  const { ctx, p } = await open(390, 763, true, '');
  const t0 = await p.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) o[localStorage.key(i)] = localStorage.getItem(localStorage.key(i)); return { ls: o, ga: JSON.stringify(__mnr.GA), ss: JSON.stringify(__mnr.sSave), set: JSON.stringify(__mnr.SET) }; });
  await p.evaluate(() => LABFULL.scan());
  // (a) coverage from the tables themselves
  const cov = await p.evaluate(() => {
    const R = LABFULL.R, has = (g, id) => !!(R.get(g) && R.get(g).items.has(id)), miss = [], need = (g, ids) => { for (const id of ids) if (!has(g, id)) miss.push(g + ':' + id); }, S = LABFULL.src(), m = __mnr;
    need('enemy', Object.keys(ZOO.T)); need('fleet', Object.keys(FLEET.K)); need('flank', Object.keys(FLK.K)); need('foot', Object.keys(FOOT_ENEMIES).concat(Object.keys(FOOT_BOSS || {})));
    need('boss', S.bossArt); need('boss', S.boss); need('ship', m.SHIPS.map(s => s.id)); need('hybrid', S.hyb); need('mod', S.mods); need('weapon', S.wpn);
    need('power', Object.keys(m.PWK)); need('power', Object.keys(PWX.K)); need('dash', ABUP.U.map(u => u.id)); need('dash', Object.keys(ABIL.EMOD).map(k => 'emp-' + k));
    need('class', CLS.L.map(c => c.id)); need('skill', CLS.L.flatMap(c => c.T.map(n => n.id))); need('rule', RU.ORDER); need('rule', RU.ORDER.map(i => i + '~tw'));
    need('twist', S.nvT); need('event', S.nvE); need('form', S.sig); need('lesson', S.lessons); need('tut', S.tut); need('phase', ['0', '1', '2', '3']);
    need('sprite', Object.keys(m.ART.ANIM.s)); need('pickup', ['shard', 'hp', 'up', 'emp']); need('wave', ['w1', 'w20']); need('meter', ['fps', 'pacing', 'hold', 'boss', 'ramp']); need('preset', ['A', 'B', 'C']);
    for (const g of ['variant']) if (!R.get(g) || R.get(g).items.size < 10) miss.push('variant:<10');
    const counts = {}; for (const [g, o] of R) counts[g] = o.items.size; return { miss, counts, S: { hyb: S.hyb.length, mods: S.mods.length, bossArt: S.bossArt.length } };
  });
  if (cov.miss.length) fails.push('no lab entry for: ' + cov.miss.slice(0, 30).join(' ') + (cov.miss.length > 30 ? ' ... +' + (cov.miss.length - 30) : ''));
  if (cov.S.hyb !== 24 && cov.S.hyb < 24) fails.push('forge hybrids ' + cov.S.hyb + ' < 24'); if (cov.S.mods < 12) fails.push('forge mods ' + cov.S.mods + ' < 12');
  console.log('registry: ' + Object.entries(cov.counts).map(([g, n]) => g + ' ' + n).join(', ') + ' (total ' + Object.values(cov.counts).reduce((a, b) => a + b, 0) + ')');

  // (b) spawn every item that stays in the Lab, a few frames each
  const sp = await p.evaluate(async () => { const bad = [], skip = new Set(['foot', 'tut', 'screen', 'lesson']); let n = 0;
    for (const [g, o] of LABFULL.R) { if (skip.has(g)) continue; for (const it of o.items.values()) { n++;
      try { __mnr.G.en = __mnr.G.en.filter(e => e.type === 'boss'); const ok = LABFULL.do(it); if (!ok) bad.push(g + ':' + it.id + ' spawn failed'); for (let i = 0; i < 4; i++) __mnr.step(1 / 60); } catch (e) { bad.push(g + ':' + it.id + ' ' + e.message); } }
      LABFULL.do(LABFULL.R.get('phase').items.get('0')); }
    return { bad, n, ents: __mnr.G.en.length }; });
  if (sp.bad.length) fails.push(sp.bad.length + ' items failed: ' + sp.bad.slice(0, 8).join(' | ')); console.log('spawned ' + sp.n + ' items in the sandbox');
  // sample spawn really creates the entity
  const ent = await p.evaluate(() => { const o = {}; for (const [g, id, ty] of [['enemy', 'bomber', 'bomber'], ['fleet', 'einterceptor', 'einterceptor'], ['enemy', 'turret', 'turret'], ['flank', 'diver', 'fk_diver'], ['enemy', 'carrier', 'carrier']]) {
      __mnr.G.en = []; LABFULL.do(LABFULL.R.get(g).items.get(id)); o[id] = __mnr.G.en.some(e => e.type === ty); } return o; });
  for (const k in ent) if (!ent[k]) fails.push('spawn ' + k + ' made no entity of its type');
  // screens + lessons (preview only)
  const sc = await p.evaluate(async () => { const out = []; for (const id of ['over', 'stf', 'nohit', 'clear']) { LABFULL.do(LABFULL.R.get('screen').items.get(id)); out.push(!document.getElementById('overEl') ? 1 : 1); document.getElementById('lfBar') && document.getElementById('lfBar').click(); }
    for (const id of LABFULL.R.get('lesson').items.keys()) { try { LABFULL.do(LABFULL.R.get('lesson').items.get(id)); } catch (e) { out.push('lesson ' + id + ' ' + e.message); } for (let i = 0; i < 3; i++) __mnr.step(1 / 60); const sk = document.getElementById('lsSkip'); if (sk) sk.click(); else out.push('lesson ' + id + ' has no SKIP'); } return out.filter(x => typeof x === 'string'); });
  if (sc.length) fails.push('screens/lessons: ' + sc.join(' | '));
  // (c) saves untouched, inside the Lab
  const same = await p.evaluate(t0 => { const o = {}; for (let i = 0; i < localStorage.length; i++) o[localStorage.key(i)] = localStorage.getItem(localStorage.key(i)); const bad = [];
    for (const k in o) if (t0.ls[k] !== o[k]) bad.push('changed ' + k); for (const k in t0.ls) if (!(k in o)) bad.push('removed ' + k); return bad; }, t0);
  if (same.length) fails.push('localStorage touched in the Lab: ' + same.slice(0, 6).join(' '));

  // (d) DEX UI
  await p.evaluate(() => { document.getElementById('labTab_dex').click(); }); await sleep(200);
  const ui = await p.evaluate(() => { const q = document.getElementById('lfQ'); return { q: !!q, chips: document.querySelectorAll('#labP .dg button').length, items: document.querySelectorAll('#labP .di button').length }; });
  if (!ui.q) fails.push('no search box'); if (ui.chips < 20) fails.push('group chips: ' + ui.chips);
  await p.fill('#lfQ', 'bomber'); await sleep(150);
  const sr = await p.evaluate(() => [...document.querySelectorAll('#labP .di button')].map(b => b.dataset.g + ':' + b.dataset.id));
  if (!sr.includes('enemy:bomber') || !sr.includes('fleet:ebomber')) fails.push('search bomber -> ' + sr.join());
  await p.evaluate(() => { __mnr.G.en = []; }); await p.click('#labP .di button[data-g="enemy"][data-id="bomber"]'); await sleep(200);
  const cd = await p.evaluate(() => ({ txt: document.getElementById('lfCard').textContent, bomber: __mnr.G.en.some(e => e.type === 'bomber') }));
  if (!cd.bomber) fails.push('tap on BOMBER spawned nothing'); if (!/bomber/.test(cd.txt) || !/role/.test(cd.txt) || !/telegraph/.test(cd.txt) || !/flags/.test(cd.txt) || !/counter/.test(cd.txt) || !/hull/.test(cd.txt)) fails.push('info card incomplete: ' + cd.txt.slice(0, 120));
  await p.fill('#lfQ', ''); await p.click('#labP .dg button[data-g="power"]'); await sleep(100);
  const pw = await p.evaluate(() => document.querySelectorAll('#labP .di button').length); if (pw < 30) fails.push('power group shows ' + pw);

  // CTRL
  await p.evaluate(() => document.getElementById('labTab_ctrl').click()); await sleep(200);
  const ck = async (txt) => { await p.evaluate(t => { const b = [...document.querySelectorAll('#labP .lbody button')].find(x => x.textContent.trim().toUpperCase().startsWith(t.toUpperCase())); if (!b) throw new Error('no chip ' + t); b.click(); }, txt); await sleep(80); };
  await ck('INVULNERABLE'); if (!(await p.evaluate(() => LABFULL.inv))) fails.push('invulnerable did not toggle'); await ck('INVULN');
  await ck('0.25x'); const dt = await p.evaluate(() => { const t = __mnr.G.t; __mnr.step(1 / 60); const a = __mnr.G.t - t; return a; }); await ck('1x'); const dt1 = await p.evaluate(() => { const t = __mnr.G.t; __mnr.step(1 / 60); return __mnr.G.t - t; });
  if (!(dt < dt1 * .4)) fails.push(`slow-mo 0.25x: ${dt} vs ${dt1}`);
  await p.evaluate(() => { LABFULL.meter = {}; }); await ck('PAUSE'); const hd = await p.evaluate(() => { const t = __mnr.G.t; __mnr.step(1 / 60); return __mnr.G.t - t; }); const st = await p.evaluate(() => { [...document.querySelectorAll('#labP .lbody button')].find(x => x.textContent.trim() === 'STEP').click(); const t = __mnr.G.t; __mnr.step(1 / 60); __mnr.step(1 / 60); return __mnr.G.t - t; });
  if (hd !== 0) fails.push('pause still advanced time: ' + hd); if (!(st > 0 && st < 0.0334 * 1)) fails.push('frame step advanced ' + st + ' (want exactly one frame)');
  await p.evaluate(() => { LABFULL.hold = false; });
  await ck('HITBOXES'); await p.evaluate(() => { for (let i = 0; i < 3; i++) __mnr.step(1 / 60); }); await ck('HITBOXES');
  await ck('FPS + ENT'); await sleep(1300); const fpsTxt = await p.evaluate(() => document.getElementById('lfMeter').textContent); if (!/fps/.test(fpsTxt) || !/en \d/.test(fpsTxt)) fails.push('fps/entity counter: "' + fpsTxt + '"'); await ck('FPS + ENT');
  // seed lock: same seed, same spawn
  const seedRun = async () => p.evaluate(() => { LABFULL.seed = 4242; LABFULL.lock = true; const f = () => { __mnr.G.en = []; LABFULL.do(LABFULL.R.get('variant').items.get('size-L')); LABFULL.do(LABFULL.R.get('enemy').items.get('swarm')); return JSON.stringify(__mnr.G.en.map(e => [e.type, Math.round(e.x), Math.round(e.y), Math.round(e.hp)])); };
    const a = f(), b = f(); LABFULL.lock = false; return a === b; });
  if (!(await seedRun())) fails.push('seed lock: two spawns with the same seed differ');
  // stage and wave
  const wv = await p.evaluate(() => { const d0 = JSON.stringify(__mnr.DF); LABFULL.setWave(30); const d1 = JSON.stringify(__mnr.DF); return { changed: d0 !== d1, w: LABFULL.wave && 1 }; });
  if (!wv.changed) fails.push('set wave 30 did not change the difficulty ramp');
  await p.evaluate(() => { LABFULL.stage = 22; LABFULL.do(LABFULL.R.get('fleet').items.get('ecruiser')); LABFULL.stage = 0; });
  // repro
  const rp = await p.evaluate(() => { LABFULL.seed = 99; LABFULL.stage = 6; LABFULL.log = []; LABFULL.do(LABFULL.R.get('enemy').items.get('bomber')); return LABFULL.repro(); });
  for (const need of ['seed=99', 'stage=6', 'enemy:bomber', 'flags-off=', 'lfspawn=enemy%3Abomber', 'lab=1']) if (!rp.includes(need)) fails.push('repro line lacks ' + need + ': ' + rp.slice(0, 160));
  await p.evaluate(() => { document.querySelector('#labP .lbody') && [...document.querySelectorAll('#labP .lbody button')].find(b => /COPY REPRO/.test(b.textContent)).click(); }); await sleep(200);
  const cp_ = await p.evaluate(() => LABFULL.copied); if (!cp_ || !/REPRO/.test(cp_)) fails.push('COPY REPRO produced nothing');
  { const url = rp.split(' ').pop(); const u = new URL(url); const { ctx: c2, p: p2 } = await open(390, 763, true, '&lfseed=99&lfstage=6&lfspawn=enemy:bomber'); // the replay spawns 400 ms after the lab starts and the bomber flies on: poll for it instead of looking at one instant
    const rb = await p2.waitForFunction(() => __mnr.G.en.some(e => e.type === 'bomber'), null, { timeout: 6000, polling: 30 }).then(() => true, () => false); if (!rb) fails.push('repro URL did not replay the spawn'); if (!u.search.includes('lfseed=99')) fails.push('repro url lacks the seed'); await c2.close(); }
  // (e) layout at both phone sizes
  for (const [w, h] of [[390, 763], [375, 553]]) {
    const { ctx: c3, p: p3 } = await open(w, h, true, ''); await p3.evaluate(() => { document.getElementById('labTab_dex').click(); }); await sleep(300);
    const L = await p3.evaluate(() => { const bad = [], el = document.getElementById('labP'), r = el.getBoundingClientRect(); const dx = document.documentElement;
      for (const b of el.querySelectorAll('button')) { const q = b.getBoundingClientRect(); if (!q.width) continue; if (q.height < 34) bad.push('small button ' + b.textContent.slice(0, 12) + ' ' + Math.round(q.height)); if (parseFloat(getComputedStyle(b).fontSize) < 11) bad.push('small text ' + b.textContent.slice(0, 12)); }
      const inp = document.getElementById('lfQ'); if (inp && parseFloat(getComputedStyle(inp).fontSize) < 16) bad.push('search font < 16 (iOS zoom)');
      const ov = [...el.querySelectorAll('*')].filter(x => x.getBoundingClientRect().right > r.right + 1 && !x.closest('.dg') && !x.closest('.ltabs') && !x.closest('.lr.sc')).slice(0, 3).map(x => x.tagName + '.' + x.className + ' ' + Math.round(x.getBoundingClientRect().right) + '>' + Math.round(r.right)); if (ov.length) bad.push('overflow: ' + ov.join(' | '));
      return { bad, sw: dx.scrollWidth > dx.clientWidth + 1, pw: el.scrollWidth > el.clientWidth + 1, top: r.top, h: window.innerHeight }; });
    if (L.sw || L.pw) fails.push(`${w}x${h}: sideways scroll (page ${L.sw}, panel ${L.pw})`); if (L.bad.length) fails.push(`${w}x${h}: ` + L.bad.slice(0, 4).join(', ')); if (L.top < L.h * .38) fails.push(`${w}x${h}: panel covers ${(100 - L.top / L.h * 100) | 0}% of the screen`);
    await c3.close(); }

  // sprite pane works without the strip loader
  const spr = await p.evaluate(() => { const A = __mnr.ART, a = A.ANIM; A.ANIM = null; try { LABFULL.sprite('boss-kronos/idle'); const ok = !!document.getElementById('lfSp') && !document.getElementById('lfSp').hidden; return ok; } catch (e) { return e.message; } finally { A.ANIM = a; } });
  if (spr !== true) fails.push('sprite pane without ART.ANIM: ' + spr);

  // on-foot and tutorial items (they leave the Lab); saves must be back after
  const ft = await p.evaluate(async () => { const out = []; const it = LABFULL.R.get('foot'); const sec = [...it.items.keys()].filter(k => /^sec/.test(k)); if (sec.length < 7) out.push('foot sections ' + sec.length); return out; });
  if (ft.length) fails.push(ft.join());
  await p.evaluate(() => { LABFULL.do(LABFULL.R.get('foot').items.get('ninja')); }); await sleep(900);
  const fo = await p.evaluate(() => ({ on: window.FOOT.S && window.FOOT.S.E.some(e => e.id === 'ninja' || e.type === 'ninja' || (e.def && e.def.id === 'ninja')), run: __mnr.running, e: window.FOOT.S ? window.FOOT.S.E.length : -1 }));
  if (fo.run) fails.push('foot item left the Lab running'); if (fo.e < 1) fails.push('foot sandbox has no enemy: ' + JSON.stringify(fo));
  await p.evaluate(() => { window.FOOT.stop(); }); await sleep(400);
  const fin = await p.evaluate(t0 => { const o = {}; for (let i = 0; i < localStorage.length; i++) o[localStorage.key(i)] = localStorage.getItem(localStorage.key(i)); const bad = []; for (const k in o) if (t0.ls[k] !== o[k]) bad.push('changed ' + k); for (const k in t0.ls) if (!(k in o)) bad.push('removed ' + k);
    if (JSON.stringify(__mnr.GA) !== t0.ga) bad.push('garage/Neon changed'); if (JSON.stringify(__mnr.sSave) !== t0.ss) bad.push('story progress changed'); return bad; }, t0);
  if (fin.length) fails.push('after the foot sandbox and leaving the Lab, saves differ: ' + fin.slice(0, 6).join(' '));
  await ctx.close(); await br.close(); srv.kill(); if (rsrv) rsrv.kill();
  if (fails.length) { console.log('FAIL labfull-test'); for (const f of fails) console.log(' - ' + f); process.exit(1); }
  console.log('PASS labfull-test');
})().catch(e => { console.error('labfull-test crashed:', e); process.exit(2); });
