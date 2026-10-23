#!/usr/bin/env node
// STREETHARD (parts/street/streethard.js, flag RET.streethard): stepped-time bots on the one street stage, flag on vs off (?streethard=0), no screenshots.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/streethard-test.js     env: RUNS=8  GATE=0 (numbers only)  BEFORE=0 (skip the flag-off runs)  SH='{"SH":{"CALL":9},"T":{"cap":4}}' (tuning)
// Bots: 'decent' = street2-test's human-style bot (takes cover, ducks shots, jumps lunges, shoots the nearest foe); 'gfirst' = the same bot that goes for the gunner first (shoots it when it shows, walks up to it while no rusher is close)
//       (decision 1, kill order: the gap between the two clear rates is the value of the decision);
//       'idle' = no input at all.
// Gates: (a) median time-to-kill with the pistol: rusher >= 2 s, gunner and heavy 4-8 s  (b) idle bot never clears  (c) decent bot clears 50-75% (RUNS>=8: 3-6 of 8 counted as pass,
//        it is a small sample)  (d) the two decisions show up: gunner calls > 0 per run and cover blocks > 0 per run  (e) 0 page errors
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME = process.env.GAME_DIR || path.resolve(__dirname, '../../../games/mainhattan-nightrun'), RUNS = +process.env.RUNS || 8, GATE = process.env.GATE !== '0', BEFORE = process.env.BEFORE !== '0';
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const res = [], ok = (p, n) => { res.push(!!p); console.log((p ? 'PASS ' : 'FAIL ') + n); };
const src = fs.readFileSync(path.join(__dirname, 'street2-test.js'), 'utf8'), RUN = src.slice(src.indexOf('const RUN = ') + 12, src.indexOf('\n(async () =>')).trim().replace(/;$/, '');
const NEAR = 'if (near) P.facing = near.x > P.x ? 1 : -1;'; if (!RUN.includes(NEAR)) throw new Error('street2-test bot changed: facing line not found');
const DUCK = '// bullets: hop low ones'; if (!RUN.includes(DUCK)) throw new Error('street2-test bot changed: bullet line not found');
const RUNG = RUN.replace(NEAR, "{ const ga = window.__gf && live.find(e => e.id === 'gunner'), gf = ga && !ga.hid ? ga : null, tg = gf || near; if (tg) P.facing = tg.x > P.x ? 1 : -1;" +
    " if (ga && !live.some(e => e.id === 'rusher' && Math.abs(e.x - P.x) < 170)) { window.__gpush = ga.x > P.x ? 1 : -1; window.__gpd = Math.abs(ga.x - P.x); } else window.__gpush = 0; }")
  .replace("for (const p of S.pk) if (", "if (window.__gpush && window.__gpd > 150) { I.l = window.__gpush < 0 ? 1 : 0; I.r = window.__gpush > 0 ? 1 : 0; P.facing = window.__gpush; }   // gunner-first: walks up to the gunner while no rusher is close\n    for (const p of S.pk) if (")
  .replace(DUCK, "for (const b of S.eb) { const t = (P.x - b.x) / (b.vx || 1e-6); if (t > 0 && t < .35 && !b.vy && P.onGround && see({ id: 'd', _bid: b.x0 || (b.x0 = b.x) }, 'd')) b.duck = 1; if (b.duck && t > -.1 && t < .35) I.d = 1; }   // duck a level shot (streethard)\n" + DUCK);   // 'gunner-first' bot: same bot, shoots a visible gunner before the nearest foe
const SEED = () => { try { localStorage.clear(); localStorage.setItem('mnr_story', JSON.stringify({ stars: { 1: 3, 2: 3, 3: 2 }, snap: {}, all: false, v30: 1, v40: 1 })); localStorage.setItem('mnr_tut', '2'); localStorage.setItem('mnr_foot', '{"seen":{"b":1,"a":1},"hint":1}'); } catch (e) {} };
// time-to-kill measured by the test itself (works with the flag off too): seen -> dead, pistol only (pickups that change the gun are left on the road)
const HOOK = () => { const FE = window.FOOT_ENEMIES, T = window.__ttk = { ttk: {} };
  for (const id of ['rusher', 'gunner', 'heavy']) { const d = FE[id], od = d.onDeath; d.onDeath = function (e) { if (!e._tk) { e._tk = 1; const S = FOOT.S, t0 = e.seenAt2 != null ? e.seenAt2 : e.born; if (S.P.w === 'pistol') (T.ttk[id] = T.ttk[id] || []).push(S.time - t0); } return od.apply(this, arguments); }; } };
const med = a => a && a.length ? +a.slice().sort((x, y) => x - y)[a.length >> 1].toFixed(2) : null;
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME], { stdio: 'ignore' });
  await sleep(700); const br = await PW.chromium.launch(), errs = [];
  const open = async (q) => { const ctx = await br.newContext({ viewport: { width: 1440, height: 860 } }); await ctx.addInitScript(SEED); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1${q}`, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && window.FOOT && FOOT.S3, null, { timeout: 20000 }); await sleep(300); await p.evaluate(HOOK); if (process.env.SH) await p.evaluate(o => { if (FOOT.SH) { Object.assign(FOOT.SH, o.SH || {}); Object.assign(FOOT.S3.T, o.T || {}); } }, JSON.parse(process.env.SH)); return { ctx, p }; };
  const batch = async (q, bot, n) => { const { ctx, p } = await open(q), out = [];
    for (let i = 0; i < n; i++) { const seed = 4321 + i * 7919;
      const r = bot === 'idle' ? await p.evaluate((seed) => { let s = seed; Math.random = () => (s = (s * 16807) % 2147483647) / 2147483647; FOOT.ctl = (S, I) => { for (const k in I) if (typeof I[k] === 'number') I[k] = 0; };
          RET.tale = false; FOOT.start('zeil'); let S = FOOT.S; for (let j = 0; j < 200 && S && !S.end; j++) S = FOOT.sim(1, 1 / 60); S = FOOT.S; const o = { clear: !!(S.end && S.end.cleared), time: +S.time.toFixed(1), hp: S.P.hp, hurts: S.hurts, kills: S.kills }; FOOT.ctl = null; FOOT.stop(); return o; }, seed)
        : await p.evaluate(`(()=>{ window.__gf=${bot === 'gfirst'}; return (${RUNG})(${seed}); })()`);
      const x = await p.evaluate(() => { const S = FOOT.S, h = S.sh || {}; return { called: h.called | 0, blocked: h.blocked | 0, coverBroke: h.coverBroke | 0, hlog: (S.hlog || []).join(' ') }; });
      Object.assign(r, x); out.push(r); }
    const T = await p.evaluate(() => window.__ttk.ttk); await ctx.close(); return { out, T }; };
  const show = (n, b) => { const c = b.out.filter(r => r.clear).length, hl = b.out.map(r => r.hlog).join(' ').split(' ').filter(Boolean), src = {}; for (const h of hl) src[h] = (src[h] || 0) + 1;
    console.log(`  ${n}: clears ${c}/${b.out.length}; ttk median rusher ${med(b.T.rusher)} s (n${(b.T.rusher || []).length}), gunner ${med(b.T.gunner)} s (n${(b.T.gunner || []).length}), heavy ${med(b.T.heavy)} s (n${(b.T.heavy || []).length}); ` +
      `hurts/run ${(hl.length / b.out.length).toFixed(1)} (${Object.entries(src).map(([k, v]) => k + ' ' + v).join(', ')}); gunner calls/run ${(b.out.reduce((a, r) => a + r.called, 0) / b.out.length).toFixed(1)}; cover blocks/run ${(b.out.reduce((a, r) => a + r.blocked, 0) / b.out.length).toFixed(1)}, covers broken/run ${(b.out.reduce((a, r) => a + r.coverBroke, 0) / b.out.length).toFixed(1)}; ` +
      `end times ${b.out.map(r => (r.clear ? '' : 'x') + r.time).join(',')}`); return c; };
  let B0 = null; if (BEFORE) { B0 = await batch('&streethard=0', 'decent', RUNS); show('BEFORE decent', B0); show('BEFORE idle', await batch('&streethard=0', 'idle', 2)); }
  const A = await batch('', 'decent', RUNS), cA = show('AFTER decent', A);
  const G = await batch('', 'gfirst', RUNS), cG = show('AFTER gunner-first', G);
  const I = await batch('', 'idle', 3), cI = show('AFTER idle', I);
  if (GATE) {
    // (a) ttk limits, (c) decent-bot clear rate and (f) kill order: retired 23 Oct (W162), replaced by qa/streetsim.js (50 runs per bot)
    if (0) ok(med(A.T.rusher) >= 2 && med(A.T.gunner) >= 4 && med(A.T.gunner) <= 8 && med(A.T.heavy) >= 4 && med(A.T.heavy) <= 8.5, `(a) ttk rusher ${med(A.T.rusher)} gunner ${med(A.T.gunner)} heavy ${med(A.T.heavy)}`);
    ok(cI === 0, `(b) idle bot clears ${cI}/3`);
    if (0) ok(cA / RUNS >= .375 && cA / RUNS <= .75, `(c) decent bot clears ${cA}/${RUNS}`);
    ok(A.out.every(r => r.called > 0 && r.blocked > 0), `(d) gunner calls and cover blocks in every run (${A.out.map(r => r.called + "/" + r.blocked).join(" ")})`);
    if (0) ok(cG >= cA, `(f) kill order matters: gunner-first clears ${cG}/${RUNS} vs nearest-first ${cA}/${RUNS}`);
    ok(errs.length === 0, `(e) page errors ${errs.length}${errs.length ? ' ' + errs[0] : ''}`);
  }
  await br.close(); srv.kill(); const f = res.filter(x => !x).length; console.log(f ? 'FAIL streethard-test' : 'PASS streethard-test'); process.exit(f ? 1 : 0);
})().catch(e => { console.log('FAIL streethard-test ' + e.message); process.exit(1); });
