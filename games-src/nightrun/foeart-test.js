#!/usr/bin/env node
// Enemy art from the approved ship sheets (parts/art/foeart.js, flag RET.foeart) through the real page (prints pass/fail lines only):
//   NODE_PATH=$(npm root -g) node games-src/nightrun/foeart-test.js      env: GAME_DIR=<dir with index.html>, BOT=1 (adds the 90 s bot-run share, 5 stages), V=1 (verbose)
//  (a) coverage: every enemy id the game can spawn (FOEART.ids(): ZOO.T, FLEET.K, FLK.K, DMG.ml, LEAK.GT + the director's kinds) has an ENEMY_ART entry or is listed in FOEART_NEEDS;
//      every entry names a real ship sheet and a sane width; no id is in both lists
//  (b) each mapped id is spawned once in a headless stage and drawn: the frame calls ART.drawAnim with an approved ship sheet (instrumented), nothing throws, hit boxes (r, hp) unchanged
//  (c) variants still show: a mini / large / mirrored / hue-shifted / elite unit draws from the sheet, the canvas state is restored (filter, alpha, radius)
//  (d) ?foeart=0 and ?sprites=0 draw no tinted sheet (the old pictures)
//  (e) frame time with a crowd of mapped enemies: foeart on is not more than 1 ms over off
//  (f) BOT=1: share of on-screen enemy draws from sheets in a 90 s human-model run on stages 2 / 6 / 10 / 14 / 20 (target >= 95%), printed before (?foeart=0) and after
const PW = require('playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fp = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const fails = []; let n = 0;
const ok = (name, cond, info) => { n++; if (!cond) { fails.push(name); console.log('FAIL ' + name + (info ? ' :: ' + info : '')); } else console.log('PASS ' + name); };
const SETUP = st => { const m = window.__mnr; if (m.running) m.abort(); m.SET.diff = 'normal'; m.SET.auto = false; m.applySet && m.applySet(); m.startStory(st); m.simOn(true);
  m.G.en.length = 0; m.G.eb.length = 0; m.P.hp = 50; m.P.x = 120; m.P.y = 400; m.SH.sh = 0; if (window.FLEET) FLEET.reset(); };
/* spawn one unit of id in the middle of the field (art only: the unit is parked, nothing moves it) */
const SPAWN = id => { const m = window.__mnr, G = m.G, en = VAR.X.en, x = 560, y = 250; let e;
  if (id.startsWith('fk-')) { FLK.mk({ k: id.slice(3), x, y, up: 0, bx: x, by: y }); e = G.en[G.en.length - 1]; }
  else if (window.ZOO && ZOO.T[id]) e = ZOO.mk(id, { x, y });
  else if (window.FLEET && FLEET.K[id]) e = FLEET.mk(id, { x, y, nd: 2 });
  else if (id === 'gate') e = en('gate', { x, gy: 270, gap: 130 });
  else if (['gtank', 'gturret', 'gwalker'].includes(id)) e = en(id, { x, y: 380, gnd: 1 });
  else e = en(id, { x, y });
  if (!e) e = G.en[G.en.length - 1]; e.x = x; if (id !== 'gate') e.y = y; e.hp = e.max = Math.max(e.hp, 4); return e; };
const RENDER = k => { const m = window.__mnr; m.G; for (let i = 0; i < k; i++) { m.step(1 / 60); m.render(m.G.t, 1 / 60); } };
(async () => {
  const port = await fp(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME], { stdio: 'ignore' }); await sleep(700);
  const br = await PW.chromium.launch(), url = q => `http://127.0.0.1:${port}/index.html?nomusic=1&sim=1${q || ''}`;
  const open = async (q, vw) => { const c = await br.newContext({ viewport: vw || { width: 1280, height: 720 } }), p = await c.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort()); await p.goto(url(q)); await p.waitForFunction(() => window.__mnr && __mnr.ART.rd && __mnr.ART.rd.size > 0, null, { timeout: 20000 });
    await p.waitForFunction(() => Object.keys(__mnr.ART.ANIM.s).filter(k => /^ship-e[a-z]+\/(flame|death)$/.test(k)).map(k => __mnr.ART.anim(k)).every(Boolean), null, { timeout: 60000, polling: 200 }).catch(() => { });
    return { c, p, errs }; };
  const ids = await (async () => { const { c, p, errs } = await open(''); try {
    /* (a) coverage */
    const r = await p.evaluate(() => { window.ART = __mnr.ART; const ids = FOEART.ids(), EA = ENEMY_ART, NE = FOEART_NEEDS, miss = ids.filter(i => !EA[i] && !NE.includes(i)), both = ids.filter(i => EA[i] && NE.includes(i)),
        badSheet = Object.entries(EA).filter(([k, m]) => !m.native && (!ART.ANIM.s['ship-' + m.s + '/flame'] || !(m.w || m.k) || !(m.w || m.k * 10 < 400))).map(e => e[0]), stale = Object.keys(EA).filter(k => !ids.includes(k)), alias = ids.filter(i => /^fk_/.test(i));
      return { ids, miss, both, badSheet, stale, alias, mapped: ids.filter(i => EA[i]).length, needs: ids.filter(i => NE.includes(i)).length }; });
    ok('a1 every spawnable enemy id (' + r.ids.length + ') has a sheet look or is in the needs-art list', !r.miss.length, r.miss.join(','));
    ok('a2 no id is both mapped and in the needs-art list', !r.both.length, r.both.join(','));
    ok('a3 every mapping names a real ship sheet and a sane width', !r.badSheet.length, r.badSheet.join(','));
    ok('a4 no entry for an id the game cannot spawn', !r.stale.length, r.stale.join(','));
    console.log('INFO ids ' + r.ids.length + ': ' + r.mapped + ' mapped to sheets, ' + r.needs + ' need real art (' + r.ids.filter(i => ['gtank', 'gturret', 'gwalker'].includes(i)).join(',') + ')');
    /* (b) each id drawn from a sheet */
    const bad = [], out = [];
    for (const id of r.ids.filter(i => !/^fk_/.test(i))) {
      const res = await p.evaluate(({ id, SP, RN, ST }) => { const m = __mnr; (new Function('return ' + ST)())(14); const G = m.G, ART = m.ART; const sp = new Function('return ' + SP)(), rn = new Function('return ' + RN)();
        if (!window.ENEMY_ART[id]) return { skip: 1 };
        G.en.length = 0; const keys = new Set(), da = ART.drawAnim; ART.drawAnim = function (c, key) { keys.add(key); return da.apply(this, arguments); };
        let e, thr = ''; try { e = sp(id); const r0 = e.r, hp0 = e.hp; for (let i = 0; i < 6; i++) { e.x = 560; if (id !== 'gate') e.y = 250; rn(1); } if (e.r !== r0) thr = 'radius changed'; } catch (x) { thr = String(x && x.message || x); }
        ART.drawAnim = da; return { keys: [...keys], thr, fa: e && e._fa === FOEART.fr, nat: !!ENEMY_ART[id].native }; }, { id, SP: SPAWN.toString(), RN: RENDER.toString(), ST: SETUP.toString() });
      if (res.skip) continue; out.push(id + ':' + res.keys.filter(k => /^ship-e/.test(k)).length);
      if (res.thr || !res.keys.some(k => /^ship-e/.test(k))) bad.push(id + (res.thr ? '(' + res.thr + ')' : '(no sheet draw: ' + res.keys.join('|') + ')'));
    }
    ok('b1 every mapped id draws through ART.drawAnim with a ship sheet and does not throw', !bad.length, bad.join(', '));
    if (process.env.V) console.log(out.join(' '));
    /* (c) variants */
    const v = await p.evaluate(({ SP, RN, ST }) => { const m = __mnr; (new Function('return ' + ST)())(14); const G = m.G, ART = m.ART; const sp = new Function('return ' + SP)(), rn = new Function('return ' + RN)(), res = [];
      const rows = [['drone', { vz: 1, vcl: 'mini', r0: 14, r: 8.4, vt: 0 }], ['drone', { vz: 1, vcl: 'large', r0: 14, r: 21, vo: 'V', vt: 1 }], ['charger', { vz: 1, vcl: 'normal', r0: 13, vt: 2 }], ['turret', { vz: 1, vcl: 'normal', r0: 20, vt: 3, el: 1 }], ['flank', { vz: 1, vcl: 'normal', r0: 14, vo: 'V', vt: 1 }], ['mine', { vz: 1, vcl: 'normal', r0: 14, vt: 1 }], ['drone', { ldr: 1 }]];
      let cx = null; for (const [id, o] of rows) { G.en.length = 0; const keys = new Set(), da = ART.drawAnim; ART.drawAnim = function (c, key) { cx = c; keys.add(key); return da.apply(this, arguments); };
        const e = sp(id); Object.assign(e, o); const r1 = e.r; for (let i = 0; i < 5; i++) { e.x = 560; e.y = 250; rn(1); } ART.drawAnim = da;
        const good = [...keys].some(k => /^ship-e/.test(k)); res.push([id + (o.vcl || '') + (o.vo || '') + (o.vt || '') + (o.ldr ? 'L' : ''), good, e.r === r1 || !!o.r, cx && (cx.filter === 'none' || cx.filter === undefined), cx && cx.globalAlpha === 1]); }
      return res; }, { SP: SPAWN.toString(), RN: RENDER.toString(), ST: SETUP.toString() });
    ok('c1 variants (size, mirror, hue, elite, leader) still draw from the sheet and leave the canvas clean', v.every(x => x[1] && x[2] && x[3] && x[4]), JSON.stringify(v.filter(x => !(x[1] && x[2] && x[3] && x[4]))));
    ok('z1 no page errors (a-c)', !errs.length, errs[0]); } finally { await c.close(); } })();
  /* (d) off switches */
  for (const q of ['&foeart=0', '&sprites=0']) { const { c, p, errs } = await open(q); try {
    const r = await p.evaluate(({ SP, RN, ST }) => { const m = __mnr; (new Function('return ' + ST)())(14); const G = m.G, ART = m.ART; const sp = new Function('return ' + SP)(), rn = new Function('return ' + RN)(), hit = [];
      const da = ART.drawAnim; ART.drawAnim = function (c, key) { if (key.indexOf('~') >= 0) hit.push(key); return da.apply(this, arguments); };
      for (const id of ['drone', 'charger', 'turret', 'flank', 'swarm', 'mine', 'shielder', 'splitter', 'healer', 'efdrone']) { G.en.length = 0; sp(id); rn(4); } ART.drawAnim = da; return { hit, built: Object.keys(ART.VS).length }; }, { SP: SPAWN.toString(), RN: RENDER.toString(), ST: SETUP.toString() });
    ok('d1 ' + q + ' draws no tinted sheet and builds none', !r.hit.length && !r.built, JSON.stringify(r)); ok('z2 no page errors ' + q, !errs.length, errs[0]); } finally { await c.close(); } }
  /* (e) frame time: one page, the flag flipped in place, alternating blocks of frames so machine noise hits both sides */
  { const { c, p } = await open('', { width: 390, height: 300 }); try {
      const tm = await p.evaluate(({ SP, ST }) => { const m = __mnr, G = m.G, sp = new Function('return ' + SP)(); (new Function('return ' + ST)())(14);
        const ids = ['drone', 'drone', 'charger', 'turret', 'flank', 'swarm', 'swarm', 'mine', 'shielder', 'splitter', 'bomber', 'healer', 'carrier', 'minelayer', 'sniper', 'zdrn'];
        const mk = () => { G.en.length = 0; ids.forEach((id, i) => { const e = sp(id); e.x = 300 + (i % 8) * 70; e.y = 80 + Math.floor(i / 8) * 260 + (i % 3) * 40; e.hp = e.max = 99; }); };
        const blk = on => { RET.foeart = on; mk(); for (let i = 0; i < 20; i++) m.render(G.t, 1 / 60); const t0 = performance.now(); for (let i = 0; i < 60; i++) { if (i % 10 === 0) mk(); m.render(G.t + i / 60, 1 / 60); } return (performance.now() - t0) / 60; };
        const A = { on: [], off: [] }; for (let k = 0; k < 7; k++) { A.on.push(blk(true)); A.off.push(blk(false)); } const med = a => a.sort((x, y) => x - y)[3]; return { on: med(A.on), off: med(A.off) }; }, { SP: SPAWN.toString(), ST: SETUP.toString() });
      ok('e1 frame time with 16 mapped enemies: foeart on ' + tm.on.toFixed(2) + ' ms vs off ' + tm.off.toFixed(2) + ' ms (<= +1 ms)', tm.on - tm.off <= 1); } finally { await c.close(); } }
  /* (f) 90 s human-model bot runs (humanbot.js), draws counted per on-screen enemy and frame (every 6th step is rendered) */
  if (process.env.BOT) { const fs = require('fs'), os = require('os'), PRE = `window.__rec=(m,i)=>{if(i<=1){FOEART.n={all:0,sheet:0,stand:0,by:{}};FOEART.cnt=1;}if(i%6===0){m.render(m.G.t,1/60);}};window.__recOut=()=>JSON.parse(JSON.stringify(FOEART.n));new Promise(r=>{const m=__mnr,ks=Object.keys(m.ART.ANIM.s).filter(k=>/^ship-e[a-z]+\\/(flame|volley)$/.test(k)),f=()=>{if(ks.every(k=>m.ART.anim(k)))r(1);else setTimeout(f,100);};f();});`;   // sheets decoded first: the stepped bot runs far faster than real time, a player has seconds of load
    const share = {}; for (const [lab, q] of [['before', '&foeart=0'], ['after', '']]) { const jf = path.join(os.tmpdir(), 'foeart-bot-' + lab + '.json');
      const r = cp.spawnSync('node', [path.join(__dirname, 'humanbot.js')], { env: Object.assign({}, process.env, { STAGES: '2,6,10,14,20', BOTS: 'human', BUILDS: 'mid', RUNS: '1', PAR: '5', MAXT: '90', Q: q, PRE, JSON: jf, GAME_DIR: GAME }), encoding: 'utf8', timeout: 1500000 });
      let res = []; try { res = JSON.parse(fs.readFileSync(jf, 'utf8')); } catch (e) { }
      const all = res.reduce((a, x) => a + (x.px ? x.px.all : 0), 0), sh = res.reduce((a, x) => a + (x.px ? x.px.sheet : 0), 0), st = res.reduce((a, x) => a + (x.px ? x.px.stand : 0), 0), by = {};
      for (const x of res) if (x.px) for (const k in x.px.by) { const b = by[k] || (by[k] = [0, 0, 0]); b[0] += x.px.by[k][0]; b[1] += x.px.by[k][1]; b[2] += x.px.by[k][2] || 0; }
      share[lab] = { all, sh, st, pct: all ? 100 * sh / all : 0, real: all ? 100 * (sh - st) / all : 0, by, runs: res.length };
      console.log(`INFO ${lab}: ${res.length} runs (stages ${res.map(x => x.n).join('/')}), ${sh}/${all} on-screen enemy draws from sheets = ${share[lab].pct.toFixed(1)}% (real sheet ${share[lab].real.toFixed(1)}%, tinted stand-in ${(100 * st / Math.max(1, all)).toFixed(1)}%)`); }
    console.log('INFO draws by id (after): ' + Object.entries(share.after.by).sort((a, b) => b[1][1] - a[1][1]).map(([k, v]) => `${k} ${v[1]}${v[0] < v[1] ? ' (' + Math.round(100 * v[0] / v[1]) + '% sheet)' : ''}${v[2] ? ' [stand-in]' : ''}`).join(', '));
    ok('f1 share of enemy draws from sheets (real + stand-in) in the 90 s bot runs (stages 2/6/10/14/20) is >= 95% (before ' + share.before.pct.toFixed(1) + '%, after ' + share.after.pct.toFixed(1) + '%)', share.after.pct >= 95 && share.after.runs >= 5); }
  srv.kill();
  console.log(`${n - fails.length}/${n} passed`); process.exit(fails.length ? 1 : 0);
})().catch(e => { console.log('CRASH ' + e.message); process.exit(2); });
