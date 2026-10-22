#!/usr/bin/env node
// GRIT gate (parts/enemies/grit.js, flag RET.grit, default on; ?grit=0 = old). Prints PASS/FAIL lines.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/grit-test.js     env: OLD=1 (measure the old build via ?grit=0) RUNS=2 STAGES=8,20 SECS=120 TTKSt=8
// 1 EMP rate: the balance-test dodger on Normal (mid build): charges earned per minute <= 1.5, EMP uses per minute <= 1.5 (target .3-1.5, printed)
// 2 TTK table: the owner's build (PULSE 3 + SWARM 10) alone against one foe of each kind on Normal at TTKSt: median seconds of focused fire (printed; normal-class 3-5 s, gunship 8-15 s judged when GRIT is on)
// 3 durability kinds: plate/shield/medic/evasive all appear and carry a tell; flag off (?grit=0): no kind, the old weapon curve, hullK 1
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const OLD = process.env.OLD === '1', RUNS = +process.env.RUNS || 2, STAGES = (process.env.STAGES || '8,20').split(',').map(Number), TTKS = +process.env.TTKSt || 8;
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const src = fs.readFileSync(path.join(__dirname, 'balance-test.js'), 'utf8'), i0 = src.indexOf('const BOT = '), i1 = src.indexOf('\n(async');
const BOTSRC = src.slice(i0 + 'const BOT = '.length, i1).trim().replace(/;$/, '');
const med = a => { if (!a.length) return 0; const s = a.slice().sort((x, y) => x - y); return s[s.length >> 1]; };
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const br = await PW.chromium.launch(), p = await br.newPage({ viewport: { width: 960, height: 540 } }), perr = []; p.on('pageerror', e => perr.push(e.message));
  await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&all=1&nomusic=1${OLD ? '&grit=0' : ''}`); await p.waitForFunction(() => window.__mnr && window.__wp, null, { timeout: 10000 });
  let bad = 0; const line = (ok, s) => { if (!ok) bad++; console.log((ok ? 'PASS ' : 'FAIL ') + s); };
  // 1 EMP rate
  let secs = 0, charges = 0, uses = 0, clr = 0, hits = 0, n = 0;
  for (const st of STAGES) for (let k = 0; k < RUNS; k++) {
    const r = await p.evaluate(async ({ BOTSRC, st }) => {
      const m = window.__mnr, A = window.ABIL, a0 = m.abort; let snap = null;
      m.abort = function () { try { snap = { t: m.G.t, uses: A.stat.emp - u0, ch: window.GRIT ? GRIT.st.charges : 0, pu: A.stat.fill }; } catch (e) { } return a0.apply(this, arguments); };
      const u0 = A.stat.emp; if (window.GRIT) for (const q in GRIT.st) GRIT.st[q] = 0;
      const res = (0, eval)('(' + BOTSRC + ')')({ n: st, MAXT: 240, build: 'mid', diff: 'normal' });
      m.abort = a0; return { res, snap };
    }, { BOTSRC, st });
    if (r.snap) { secs += r.snap.t; charges += r.snap.ch; uses += r.snap.uses; } n++; if (r.res.clear) clr++; hits += r.res.hits;
  }
  const mins = secs / 60 || 1;
  console.log(`EMP (${OLD ? 'old' : 'new'}): ${(uses / mins).toFixed(2)} uses/min, ${(charges / mins).toFixed(2)} charges/min, ${clr}/${n} cleared, ${(hits / n).toFixed(1)} hits/run over ${secs.toFixed(0)} s`);
  if (!OLD) { line(charges / mins <= 1.5, `EMP charges/min ${(charges / mins).toFixed(2)} <= 1.5`); line(uses / mins <= 1.5, `EMP uses/min ${(uses / mins).toFixed(2)} <= 1.5`); }
  // 2 TTK table
  const TTK = ({ st, kinds }) => {
    const m = window.__mnr, wp = window.__wp, out = {}, W = 960, H = 540;
    m.SET.diff = 'normal'; m.SET.auto = true; try { m.applySet(); } catch (e) { }
    wp.eq = ['pulse', 'swarm']; wp._fk = null; wp.lv = {}; wp.xp = {}; wp.pl = { pulse: 1 }; wp.perm('pulse', 3); wp.perm('swarm', 10); wp.sync();
    for (const k of kinds) { out[k] = [];
      for (let rep = 0; rep < 4; rep++) {
        m.startStory(st); m.simOn(true); m.god = true; const e = window.__scale.en(k, { x: 640, y: 120 + rep * 90 }); let t = 0;
        for (let i = 0; i < 30 * 60 && e.hp > 0; i++) { const P = m.P, G = m.G; if (m.SH.active) m.SH.close(); P.hp = P.max; P.x = 180; P.y += Math.max(-6, Math.min(6, e.y - P.y)); for (const q of G.en) if (q !== e) q.hp = 0; G.eb.length = 0; m.step(1 / 60); t += 1 / 60; if (e.x < -10) break; }
        out[k].push({ t: e.hp <= 0 ? t : 30, gk: e.gk || '' }); m.abort();
      } }
    return out;
  };
  const kinds = ['drone', 'charger', 'flank', 'turret', 'gate', 'gunship'];
  const tt = await p.evaluate(TTK, { st: TTKS, kinds });
  const NEED = { drone: [3, 5], charger: [3, 5], flank: [3, 5], turret: [3, 8], gate: [3, 8], gunship: [8, 15] };
  for (const k of kinds) { const m = med(tt[k].map(r => r.t)); console.log(`TTK ${k}: median ${m.toFixed(1)} s focused fire (st ${TTKS}, Normal, PULSE 3 + SWARM 10)`); }
  // 3 kinds + flag off
  const K = ({ st }) => {
    const m = window.__mnr; m.SET.diff = 'normal'; m.startStory(st); m.simOn(true); const c = {}, G = m.G; let n = 0;
    for (let i = 0; i < 400; i++) { const k = ['turret', 'charger', 'flank', 'drone', 'gate'][i % 5]; const e = window.__scale.en(k, { x: 900, y: 100 + (i % 7) * 50 }); if (e.gk) { c[e.gk] = (c[e.gk] || 0) + 1; } n++; G.en.length = 0; }
    const on = !!(window.GRIT && GRIT.on); const lv = window.SC ? SC.lvW(10) : 0; m.abort(); return { c, n, on, lv, hk: window.SC ? SC.hpK() : 0 };
  };
  const kd = await p.evaluate(K, { st: 10 });
  if (OLD) line(!kd.on && !Object.keys(kd.c).length && Math.abs(kd.lv - 1.8) < 1e-6, `flag off: no kinds, lvW(10) ${kd.lv.toFixed(2)} = 1.80, grit.on false`);
  else { line(['plate', 'shield', 'med', 'eva'].every(k => kd.c[k] > 0), `kinds spawn: ${JSON.stringify(kd.c)} of ${kd.n}`); line(kd.lv < 1.8 + 1e-9 && kd.lv > 1.55, `lvW(10) ${kd.lv.toFixed(2)} (old 1.80)`); }
  if (perr.length) line(false, 'page errors: ' + perr.slice(0, 3).join(' | '));
  console.log((bad ? 'FAIL' : 'PASS') + ' grit-test');
  await br.close(); srv.kill(); process.exit(bad ? 1 : 0);
})();
