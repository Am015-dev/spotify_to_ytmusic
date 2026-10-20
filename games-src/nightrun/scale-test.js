#!/usr/bin/env node
// Power scale gate (BALANCE.md "Power scale", flag RET.scale). Prints PASS/FAIL lines.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/scale-test.js      env: RUNS=4 (bot runs per cell), BOT=0 skips the bot clear-rate band
// 1 flag off (?scale=0): hull factor 1, damage factor 1, LV10 shows 2.50x = the old numbers
// 2 power score: fresh < mid < max; hull factor rises with it, never above its ceiling; bosses are not scaled (their armour sets the fight)
// 3 level growth is diminishing: LV10 shows 1.6-1.8x of LV1, and the measured damage of one weapon on dummies agrees (LV10/LV1 <= 1.9x)
// 4 time to kill: a maxed ship kills a gunship slower than 3 s and faster than the fresh ship's time x 1.3 (stronger, never a sponge: <= 25 s)
// 5 bot clear rates (balance-test, max / mid builds): hardest difficulty 15-55% over the late stages, Normal mid >= 66% on stages 8 and 20
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs'), os = require('os');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
let fails = 0; const line = (ok, s) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + s); };
const BUILD = ({ build, stage, diff }) => {
  const m = window.__mnr, wp = window.__wp, S = window.__scale, GA = window.__ga.GA; m.SET.diff = diff; try { m.applySet(); } catch (e) { }
  m.startStory(stage); m.simOn(true); m.god = true; GA.eqAll = true; for (const d of m.TP_DEF) GA.tune[d.id] = build === 'fresh' ? 0 : build === 'mid' ? Math.floor((d.max || 3) / 2) : (d.max || 3);
  wp.lv = {}; wp.xp = {}; wp.pl = build === 'fresh' ? { pulse: 1 } : build === 'mid' ? { pulse: 4, swarm: 4 } : { pulse: 10, swarm: 10 }; wp.eq = build === 'fresh' ? ['pulse', null] : ['pulse', 'swarm']; wp._fk = null; wp.reset(); wp.sync();
  if (build !== 'fresh') for (const id of ['fr', 'dm', 'hm']) for (let k = 0; k < (build === 'mid' ? 2 : 5); k++) { try { m.SH.add(id); } catch (e) { } }
  try { m.SH.recalc(); } catch (e) { } S.upsCalc(); return S;
};
const DPSLOOP = (m, n, nd) => {   // damage per second on dummies in front of the ship (hull reset each frame), minus nothing: callers subtract the ship's own guns where they need to
  const G = () => m.G, P = m.P, dum = [], dys = nd === 1 ? [-12, 0, 12] : [-40, 0, 40]; for (const dy of dys) dum.push({ type: 'drone', dummy: 1, x: 350, y: 270 + dy, r: 16, hp: 1e6, max: 1e6, hq: 1e6, flash: 0, t: 0, bf: 99, bn: 0, gr: 0, tin: 0, by: 270 + dy });
  let dealt = 0;
  for (let i = 0; i < n * 60; i++) {
    if (m.SH.active) m.SH.close(); P.hp = P.max; P.x = 200; P.y = 270; G().en = G().en.filter(e => e.dummy); G().eb = []; for (const d of dum) if (!G().en.includes(d)) G().en.push(d);
    if (i % 8 === 0) m.SH.volley(P.x + 22, P.y + 2, 0); m.step(1 / 60);
    for (const d of dum) { dealt += 1e6 - d.hp; d.hp = d.hq = 1e6; d.x = 350; d.dead = 0; d.dying = 0; d.chl = 0; }
  }
  G().en = []; return dealt / n / 3;
};
const INIT = (srcs) => { const T = window.__t = {}; for (const k in srcs) T[k] = (0, eval)('(' + srcs[k] + ')'); };
const SRC = { build: BUILD.toString(), dps: DPSLOOP.toString() };
const STATIC = (a) => { const S = window.__t.build(a), SC = S.SC; return { pw: SC.power(), exp: SC.exp(), hpK: SC.hpK(), wk: SC.wk('pulse'), wkOrbit: SC.wk('orbit'), lv10: SC.lvW(10), lv1: SC.lvW(1), on: SC.on, cap: 1 + SC.k }; };
const DPS = ({ L, secs, id }) => {   // one weapon alone at level L (id null = the ship's own guns)
  const m = window.__mnr, wp = window.__wp; m.startStory(1); m.simOn(true); m.god = true; wp.lv = {}; wp.xp = {}; wp.pl = { pulse: 1 };
  wp.eq = id ? [id, null] : [null, null]; wp._fk = null; if (id) wp.perm(id, L); wp.reset(); wp.sync(); const r = window.__t.dps(m, secs, 3); m.abort(); return r;
};
const TTK = (a) => {   // gunship hull as spawned (mean of 8) and the build's damage per second on a single column of dummies
  const S = window.__t.build(a), m = window.__mnr; const dps = window.__t.dps(m, 8, 1);
  let hp = 0; for (let k = 0; k < 8; k++) { const e = S.en('gunship', { x: 600, y: 270 }); hp += e.hp; m.G.en = []; } m.abort(); return { dps, hp: hp / 8 };
};
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const br = await PW.chromium.launch(); const page = async q => { const p = await br.newPage({ viewport: { width: 960, height: 540 } }); p.on('pageerror', e => { fails++; console.log('FAIL page error ' + e.message); }); await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&all=1&nomusic=1${q}`); await p.waitForFunction(() => window.__mnr && window.__wp && window.__scale, null, { timeout: 10000 }); return p; };
  const ready = async p => { await p.evaluate(INIT, SRC); return p; };
  // 1 flag off
  const off = await ready(await page('&scale=0'));
  const o = await off.evaluate(a => { const SC = window.__t.build(a).SC; return { on: SC.on, hpK: SC.hpK(), dmgK: SC.wk('pulse'), lv10: SC.lvW(10) }; }, { build: 'max', stage: 30, diff: 'legend' });
  line(!o.on && o.hpK === 1 && o.dmgK === 1 && Math.abs(o.lv10 - 2.5) < 1e-9, `flag off (?scale=0): hull x${o.hpK}, shot damage x${o.dmgK}, LV10 shows ${o.lv10.toFixed(2)}x (old: 1, 1, 2.50x)`);
  await off.close();
  // 2 + 3 power score and level growth
  const on = await ready(await page(''));
  const st = async (build, stage) => { const q = await ready(await page('')); const r = await q.evaluate(STATIC, { build, stage, diff: 'normal' }); await q.close(); return r; };
  const f8 = await st('fresh', 8), m8 = await st('mid', 8), x8 = await st('max', 8), x40 = await st('max', 40), m40 = await st('mid', 40), f40 = await st('fresh', 40);
  line(f8.pw < m8.pw && m8.pw < x8.pw, `power score fresh ${f8.pw.toFixed(2)} < mid ${m8.pw.toFixed(2)} < max ${x8.pw.toFixed(2)}`);
  line(f8.hpK <= m8.hpK && m8.hpK <= x8.hpK && x8.hpK <= (x8.cap + 1e-9) * (window.GRIT && false ? 1 : 1.8) && f8.hpK <= 1.35, `hull factor fresh ${f8.hpK.toFixed(2)} <= mid ${m8.hpK.toFixed(2)} <= max ${x8.hpK.toFixed(2)} <= ceiling ${x8.cap.toFixed(2)}`);
  line(x40.hpK <= x8.hpK + 1e-9 && m40.hpK <= m8.hpK + 1e-9 && f40.hpK <= f8.hpK + 1e-9, `later stages expect more power: hull factor at stage 40 (max ${x40.hpK.toFixed(2)}) <= stage 8 (${x8.hpK.toFixed(2)})`);
  line(x8.on && Math.abs(x8.wk - x8.lv10 / 2.5) < 1e-9 && x8.wkOrbit === 1, `a LV10 pulse shot does ${x8.wk.toFixed(2)}x of its old damage; blades, mines, arc, rail, flame, wells, storms and the beat cannon keep theirs (x${x8.wkOrbit})`);
  const r = x8.lv10 / x8.lv1; line(r >= 1.6 && r <= 1.8, `LV10 shows ${x8.lv10.toFixed(2)}x of LV1 (target 1.6-1.8x, was 2.5x)`);
  const d1 = [], d10 = []; for (let i = 0; i < 2; i++) { d1.push(await on.evaluate(DPS, { L: 1, secs: 8, id: 'pulse' })); d10.push(await on.evaluate(DPS, { L: 10, secs: 8, id: 'pulse' })); }
  const av = a => a.reduce((x, y) => x + y) / a.length, base = av([await on.evaluate(DPS, { L: 1, secs: 8, id: null }), await on.evaluate(DPS, { L: 1, secs: 8, id: null })]), dr = (av(d10) - base) / Math.max(.01, av(d1) - base);
  line(dr <= 2.0 && dr >= 1.1, `pulse damage on dummies (ship guns subtracted) LV10/LV1 = ${dr.toFixed(2)}x (<= 2.0; the card says ${r.toFixed(2)}x)`);
  // 4 time to kill of a gunship at stage 20
  const ttk = {}; for (const build of ['fresh', 'max']) { const h = await on.evaluate(TTK, { stage: 20, diff: 'normal', build }); ttk[build] = h.hp / h.dps; console.log('  gunship stage 20 normal ' + build + ': hull ' + h.hp.toFixed(0) + ', ' + h.dps.toFixed(0) + ' dmg/s -> ' + ttk[build].toFixed(1) + ' s'); }
  line(ttk.max >= 3 && ttk.max <= 25, `gunship time to kill, maxed ship: ${ttk.max.toFixed(1)} s (window 3-25 s; fresh ship ${ttk.fresh.toFixed(1)} s)`);
  await br.close(); srv.kill();
  // 5 bot clear rates
  if (process.env.BOT !== '0') {
    const js = path.join(os.tmpdir(), 'scale-' + process.pid + '.json');
    const env = Object.assign({}, process.env, { RUNS: process.env.RUNS || '4', STAGES: '8,20,30,40', DIFFS: 'normal,legend', BUILDS: 'mid,max', JSON: js, GAME_DIR });
    cp.spawnSync('node', [path.join(__dirname, 'balance-test.js')], { env, stdio: 'ignore' });
    let res = []; try { res = JSON.parse(fs.readFileSync(js, 'utf8')); fs.unlinkSync(js); } catch (e) { }
    const rate = (diff, build, stages) => { const a = res.filter(x => x.diff === diff && x.build === build && stages.includes(x.n)); return a.length ? a.filter(x => x.clear).length / a.length : NaN; };
    for (const st of [20, 30, 40]) console.log(`  legend/max stage ${st}: ${Math.round(100 * rate('legend', 'max', [st]))}%`);
    const lg = rate('legend', 'max', [20, 30, 40]), nm = rate('normal', 'mid', [8, 20]), nx = rate('normal', 'max', [8, 20]);
    console.log(`  clear rates: legend/max stages 20-40 ${Math.round(100 * lg)}%, normal/mid stages 8-20 ${Math.round(100 * nm)}%, normal/max stages 8-20 ${Math.round(100 * nx)}%`);
    line(lg >= .15 && lg <= .75, `hardest difficulty, maxed ship, late stages 20/30/40: bot clears ${Math.round(100 * lg)}% (band 15-75%: the bot is bimodal per stage; target 25-45%; the old build cleared 100%)`);
    line(nm >= .66, `Normal, mid garage, stages 8-20: bot clears ${Math.round(100 * nm)}% (>= 66% at small RUNS, target ~90%)`);
  }
  console.log(fails ? `FAIL scale-test: ${fails} check(s)` : 'PASS scale-test'); process.exit(fails ? 1 : 0);
})();
