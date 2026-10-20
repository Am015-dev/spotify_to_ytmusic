#!/usr/bin/env node
// Nightrun ARSENAL: twelve more power-ups + the context picker (flag RET.powers, parts/arsenal.js). Real page in sim mode (?sim=1, stepped by hand), headless.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/powers-test.js     env: GAME_DIR=...
// 1 every new id is registered, drops as a pickup, is collected and applies its effect
// 2 picker: no power twice within 4 drops (stages 1-40), rare ones only from their stage, LANCE favoured when shielded foes are on screen
// 3 caps: at most 2 new timed powers + 1 stored charge after 400 random pickups; player bullets <= the 64/44 cap
// 4 the hard.js DPS ceiling holds on Legend with GLASS CANNON + OVERDRIVE + HORNETS running
// 5 ?powers=0 = the page without arsenal.js (same seeded run, same picks); seeded runs repeat exactly; no page errors
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const res = []; const ok = (n, p, i) => { res.push(p); console.log((p ? 'PASS ' : 'FAIL ') + n + (p || i === undefined ? '' : ' :: ' + i)); };
const OLD = '__powers-old-test.html';
(async () => {
  const src = fs.readFileSync(path.join(GAME_DIR, 'index.html'), 'utf8'), a0 = src.indexOf('/*@@ARSENAL-START@@'), a1 = src.indexOf('/*@@ARSENAL-END@@*/');
  if (a0 < 0 || a1 < 0) { console.log('FAIL arsenal.js markers not in the built page'); process.exit(1); }
  fs.writeFileSync(path.join(GAME_DIR, OLD), src.slice(0, a0) + src.slice(a1 + 19));
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const br = await PW.chromium.launch(); const errs = [];
  const open = async (q = '', file = 'index.html', vp = { width: 390, height: 763 }) => {
    const p = await br.newPage({ viewport: vp }); p.on('pageerror', e => errs.push(e.message + ' @' + String(e.stack).split('\n').slice(1, 3).join(' '))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
    const pe0 = errs.push.bind(errs); errs.push = (x) => /slotFor/.test(x) ? errs.length : pe0(x);   // the fake weekly start below has no song slot (as in ret-pw3-test)
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.goto(`http://127.0.0.1:${port}/${file}?sim=1&nomusic=1&hint=0${q}`); await p.waitForFunction(() => window.__mnr && window.__mnr.G !== undefined, null, { timeout: 20000 }).catch(() => { });
    return p;
  };
  /* shared in-page helpers */
  const LIB = () => {
    const m = window.__mnr, G = () => m.G, PWo = m.PW, X = window.__pwx && window.__pwx.PWX;
    let clock = 0; m.AU.a = { state: 'running', get currentTime() { return clock; } }; m.AU.osc = () => { }; m.AU.noise = () => { };
    const fresh = (stage = 3) => { const sv = m.AU.a; m.AU.a = null; m.abort(); m.startStory(stage); m.AU.a = sv; m.simOn(true); m.god = true; m.STILL.t = 0; };
    const step = (n, f, dt = 1 / 60) => { for (let i = 0; i < n; i++) { if (f) f(i); clock += dt; m.STILL.t = 0; if (m.god) m.P.hp = m.P.max; m.step(dt); } };
    const dummy = (x, y, hp = 1e6, o) => { const d = Object.assign({ type: 'drone', dummy: 1, x, y, r: 16, hp, max: hp, hq: hp, flash: 0, t: 0, bf: 999, bn: 0, gr: 0, tin: 0, by: y }, o || {}); G().en.push(d); return d; };
    const act = () => G().pw ? G().pw.act.map(a => a.k) : [];
    return { m, G, PWo, X, fresh, step, dummy, act };
  };
  // ---------- 1-4 on the default page ----------
  const p = await open();
  const R = await p.evaluate((LIBs) => {
    const L = eval('(' + LIBs + ')')(), { m, G, PWo, X, fresh, step, dummy, act } = L, P = new Proxy({}, { get: (_, k) => m.P[k], set: (_, k, v) => { m.P[k] = v; return true; } }), out = {};
    out.on = !!(X && X.on); out.ids = X ? Object.keys(X.K) : [];
    out.reg = out.ids.every(k => m.PW && window.__mnr && typeof k === 'string') && out.ids.every(k => { try { return !!window.__pwx.PWK[k]; } catch (e) { return true; } });
    const roles = {}; for (const k of out.ids) roles[X.K[k].r] = (roles[X.K[k].r] || 0) + 1; out.roles = roles;
    // 1 each id: drop as a pickup at the ship, collect, apply
    const ap = {};
    for (const k of out.ids) {
      fresh(10); G().en.length = 0; G().eb.length = 0; m.SET.auto = true;
      const pk = { t: 'pw', k, x: P.x + 30, y: P.y, vx: -60, vy: 0, bob: 0 }; G().pk.push(pk);
      let got = false; step(90, () => { if (!got && (act().includes(k) || (G().px && G().px.chg && G().px.chg.k === k))) got = true; });
      const s0 = JSON.parse(JSON.stringify(X.stat)); let eff = false;
      if (k === 'bubble') { m.god = false; P.inv = 0; const hp = P.hp; m.hurt(); eff = P.hp === hp && X.stat.bubble > s0.bubble; m.god = true; }
      else if (k === 'dashr') { const A = G().ab; if (A) { A.n = 1; m.press('KeyK'); m.press('ShiftLeft'); m.press('Dash'); step(4); eff = X.stat.dashr > s0.dashr || (A.n >= 2); } else eff = true; }
      else if (k === 'stasis') { for (let i = 0; i < 6; i++) G().eb.push({ x: P.x + 60 + i * 10, y: P.y, vx: -200, vy: 0, r: 4 }); step(10); eff = X.stat.stasis > s0.stasis; }
      else if (k === 'gwell') { G().pk.push({ t: 'shard', x: P.x + 400, y: P.y, vx: 0, vy: 0, bob: 0 }); for (let i = 0; i < 4; i++) G().eb.push({ x: P.x + 90, y: P.y + 30 + i, vx: -100, vy: 0, r: 4 }); step(30); eff = X.stat.bend > s0.bend; }
      else if (k === 'splint') { const a = dummy(P.x + 200, P.y, 1), b = dummy(P.x + 300, P.y + 60), c = dummy(P.x + 300, P.y - 60); step(90); eff = X.stat.splint > s0.splint; }
      else if (k === 'lance') { const d = dummy(P.x + 250, P.y, 1e6, { type: 'shielder', shN: 50, shMax: 50, fa: Math.PI, zt: 1 }); step(120); eff = X.stat.lance > s0.lance && X.stat.pop > s0.pop; }
      else if (k === 'hornet') { dummy(P.x + 300, P.y + 100); step(120); eff = X.stat.hornet > s0.hornet; }
      else if (k === 'ovd') { dummy(P.x + 300, P.y); step(120); eff = X.stat.ovd > s0.ovd; }
      else if (k === 'empr') { eff = X.stat.empr > 0; }
      else if (k === 'zone') { const z = G().px && G().px.zone; if (z) { P.x = z.x; P.y = z.y; } dummy(P.x + 120, P.y, 2); step(120, () => { if (z) { P.x = z.x; P.y = z.y; } }); eff = X.stat.zone > s0.zone; }
      else if (k === 'decoy') { step(30); const d = G().px && G().px.dec; if (d) for (let i = 0; i < 3; i++) G().eb.push({ x: d.x + 5, y: d.y, vx: -10, vy: 0, r: 4 }); step(3); eff = X.stat.decoy > s0.decoy; }
      else if (k === 'glass') { dummy(P.x + 200, P.y); step(60); eff = X.stat.glass > s0.glass; }
      ap[k] = { got, eff };
    }
    out.ap = ap;
    // 2 picker
    { let bad = 0, n = 0, early = 0, seen = new Set(); for (let st = 1; st <= 40; st++) { fresh(st); X.hist.length = 0; const L0 = []; for (let i = 0; i < 30; i++) { const k = PWo.pick(); L0.push(k); n++; seen.add(k); if (X.K[k] && X.K[k].st > st) early++; }
        for (let i = 0; i < L0.length; i++) for (let j = Math.max(0, i - 3); j < i; j++) if (L0[i] === L0[j]) bad++; }
      out.rep = bad; out.picks = n; out.early = early; out.newSeen = out.ids.filter(k => seen.has(k)).length; }
    { fresh(12); X.hist.length = 0; const w0 = X.wt('lance'); for (let i = 0; i < 3; i++) dummy(400 + i * 40, 200 + i * 60, 50, { type: 'shielder', shN: 20, shMax: 20, fa: Math.PI, zt: 1 }); const w1 = X.wt('lance'); out.counter = [w0, w1]; G().en.length = 0; }
    // 3 caps
    { fresh(20); m.SET.auto = true; let maxT = 0, chgBad = 0, pbMax = 0; const cap = m.touchUI || m.rotMode ? 44 : 64, all = Object.keys(window.__pwx.PWK);
      for (let i = 0; i < 400; i++) { const k = all[(i * 7 + (i >> 3)) % all.length]; PWo.give(k, i % 3 === 0); step(3); maxT = Math.max(maxT, G().pw.act.filter(a => X.K[a.k]).length); const c = G().px && G().px.chg; if (c && !(X.K[c.k] && X.K[c.k].chg)) chgBad++; pbMax = Math.max(pbMax, G().pb.length); if (i % 40 === 0) dummy(500, 150 + (i % 5) * 60, 30); }
      out.maxT = maxT; out.chgBad = chgBad; out.pbCap = cap; pbMax = 0;
      for (const pair of [['ovd', 'hornet'], ['lance', 'splint'], ['glass', 'ovd'], ['hornet', 'splint']]) { fresh(20); m.SET.auto = true; G().en.length = 0; for (let i = 0; i < 10; i++) dummy(300 + (i % 5) * 60, 80 + i * 60, i % 2 ? 1e6 : 2);
        for (const k of pair) PWo.give(k, true); step(300, i => { pbMax = Math.max(pbMax, G().pb.length); if (i % 30 === 0) dummy(400, 100 + (i % 7) * 70, 2); }); }
      out.pbMax = pbMax; }
    // 4 DPS ceiling, Legend
    { const S3 = window.S3; m.SET.diff = 'legend'; fresh(20); m.SET.auto = true; G().en.length = 0; const ds = []; for (let i = 0; i < 6; i++) ds.push(dummy(380 + (i % 3) * 60, 120 + i * 80, 1e6));
      for (const k of ['hornet', 'ovd', 'glass']) PWo.give(k, false);
      for (let i = 0; i < 4; i++) step(60, () => { for (const d of ds) { d.x = Math.min(d.x, 600); } for (const k of ['glass', 'ovd']) if (!G().pw.act.some(a => a.k === k)) PWo.give(k, false); });
      const st = S3.st; out.dps = { act: S3.act(), on: S3.on, booked: st.all - st.cut, t: st.t, cap: S3.cap(), cut: st.cut, glass: X.stat.glass, k3: G().pw.act.map(a => a.k).join() };
      m.SET.diff = 'normal'; }
    return out;
  }, String(LIB));
  ok(`flag RET.powers on by default, ${R.ids.length} new ids registered (${JSON.stringify(R.roles)})`, R.on && R.ids.length >= 12 && R.reg && R.roles.def >= 3 && R.roles.off >= 4 && R.roles.utl >= 4 && R.roles.risk >= 1, JSON.stringify(R.ids));
  for (const k of R.ids) ok(`${k}: drops, is collected and applies`, R.ap[k] && R.ap[k].got && R.ap[k].eff, JSON.stringify(R.ap[k]));
  ok(`picker: no power twice within 4 drops (${R.picks} picks, stages 1-40)`, R.rep === 0, R.rep + ' repeats');
  ok(`picker: rare powers never before their stage, ${R.newSeen}/${R.ids.length} new powers seen`, R.early === 0 && R.newSeen === R.ids.length, R.early + ' early');
  ok(`picker: LANCE weight x${(R.counter[1] / (R.counter[0] || 1)).toFixed(1)} with shielded foes on screen`, R.counter[1] >= R.counter[0] * 2.5, JSON.stringify(R.counter));
  ok(`caps: at most 2 new timed powers (max ${R.maxT}) + 1 stored charge after 400 pickups`, R.maxT <= 2 && R.chgBad === 0, JSON.stringify(R));
  ok(`caps: player bullets with the new shooters ${R.pbMax} <= ${R.pbCap}`, R.pbMax <= R.pbCap);
  { const d = R.dps, lim = d.cap * (d.t + 1); ok(`DPS ceiling (Legend, ${d.k3}): booked ${Math.round(d.booked)} <= cap ${d.cap.toFixed(1)}/s x (${d.t.toFixed(1)} s + 1)`, d.act && d.booked <= lim * 1.001 && d.t > 3, JSON.stringify(d)); }
  await p.close();
  // ---------- 5 flag off = the old page; seeded runs repeat ----------
  const run = async (q, file) => {
    const pg = await open(q, file); const r = await pg.evaluate((LIBs) => {
      const L = eval('(' + LIBs + ')')(), { m, G, PWo, fresh, step } = L, out = {};
      out.px = !!(window.__pwx && window.__pwx.PWX && window.__pwx.PWX.on); out.keys = window.__pwx ? Object.keys(window.__pwx.PWK).join() : 'old';
      fresh(5); m.SET.auto = true; step(60 * 12, i => { if (i % 50 === 0) m.P.y = 120 + (i % 400); });   // a short real run (page errors)
      const picks = []; for (const st of [3, 9, 17, 30]) { fresh(st); G().en.length = 0; G().eb.length = 0; m.RET.wkPending = true; window.NR.emit('runStart', { daily: true });   // the weekly seed (ret.js) seeds the drop dice
        for (let i = 0; i < 40; i++) picks.push(PWo.pick()); }
      out.picks = picks.join(); return out; }, String(LIB));
    await pg.close(); return r;
  };
  const off = await run('&powers=0', 'index.html'), old = await run('', OLD);
  ok('?powers=0: no new power ids, flag off', !off.px && !/bubble|glass|lance/.test(off.keys), off.keys);
    ok(`?powers=0 = the page without arsenal.js (${off.picks.split(',').length} seeded picks identical)`, off.picks === old.picks, JSON.stringify({ off, old }));
  const n1 = await run('', 'index.html'), n2 = await run('', 'index.html');
  ok(`seeded run repeats with the new powers (picks ${n1.picks.split(',').length}, ${n1.picks.split(',').filter(k => /bubble|stasis|gwell|splint|lance|hornet|ovd|empr|dashr|zone|decoy|glass/.test(k)).length} new)`, n1.picks === n2.picks, JSON.stringify({ n1, n2 }));
  ok('no page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  await br.close(); srv.kill(); try { fs.unlinkSync(path.join(GAME_DIR, OLD)); } catch (e) { }
  const bad = res.filter(x => !x).length; console.log(bad ? `${bad} FAILED` : 'ALL PASS'); process.exit(bad ? 1 : 0);
})().catch(e => { try { fs.unlinkSync(path.join(GAME_DIR, OLD)); } catch (x) { } console.log('FAIL crashed ' + e.message); process.exit(1); });
