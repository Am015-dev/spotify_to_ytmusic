#!/usr/bin/env node
// Nightrun scale probe: damage per second on dummies and time-to-kill of a gunship / drone / mini-boss for fresh, mid-game and max builds.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/scale-probe.js     env: Q="scale=0" (query), STAGE=20, DIFF=legend
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const PROBE = ({ build, stage, diff, secs }) => {
  const m = window.__mnr, wp = window.__wp, S = window.__scale; m.SET.diff = diff; try { m.applySet(); } catch (e) { }
  m.startStory(stage); m.simOn(true); m.god = true;
  const SH = m.SH, TP = m.TP;
  wp.lv = {}; wp.xp = {}; wp.pl = { pulse: 1 };
  const GA = window.__ga.GA; GA.eqAll = true; for (const d of m.TP_DEF) GA.tune[d.id] = 0;
  const setBuild = () => {
    if (build === 'fresh') { wp.eq = ['pulse', null]; wp.pl = { pulse: 1 }; }
    else if (build === 'mid') { wp.pl = { pulse: 4, swarm: 4 }; wp.eq = ['pulse', 'swarm']; for (const d of m.TP_DEF) GA.tune[d.id] = Math.floor((d.max || 3) / 2); for (const id of ['fr', 'dm', 'hm']) for (let k = 0; k < 2; k++) { try { SH.add(id); } catch (e) { } } }
    else { wp.pl = { pulse: 10, swarm: 10, laser: 10, beat: 10 }; wp.eq = ['laser', 'beat']; for (const d of m.TP_DEF) GA.tune[d.id] = d.max || 3; const want = { fr: 5, hm: 3, sb: 5, dm: 5, cr: 5, pc: 3, sc: 3, cl: 3, og: 2, rc: 2, dr: 2, rg: 2 }; const ids = SH.UPG.map(u => u.id); for (const id in want) if (ids.includes(id)) for (let k = 0; k < want[id]; k++) { try { SH.add(id); } catch (e) { } } }
    wp._fk = null; wp.reset(); wp.sync(); try { SH.recalc(); } catch (e) { } S.upsCalc();
  };
  setBuild();
  const out = { build, power: +S.SC.power().toFixed(2), exp: +S.SC.exp().toFixed(2), f: +S.SC.f().toFixed(2), hpK: +S.SC.hpK().toFixed(2), upsHp: +S.UPS.hp.toFixed(2), u: +S.UPS.u.toFixed(2), wu: +S.SC.wu().toFixed(2), dmgK: +S.SC.dmgK().toFixed(2) };
  const G = () => m.G, P = m.P, dt = 1 / 60;
  // dps: 3 dummies right in front of the ship, hp reset each frame
  const dum = []; for (const dy of [-18, 0, 18]) dum.push({ type: 'drone', dummy: 1, x: 340, y: 270 + dy, r: 16, hp: 1e6, max: 1e6, hq: 1e6, flash: 0, t: 0, bf: 99, bn: 0, gr: 0, tin: 0, by: 270 + dy });
  let dealt = 0;
  for (let i = 0; i < Math.round(secs * 60); i++) {
    if (SH.active) { SH.close(); } P.hp = P.max; P.x = 200; P.y = 270;
    G().en = G().en.filter(e => e.dummy); G().eb = []; for (const d of dum) if (!G().en.includes(d)) G().en.push(d);
    if (i % 8 === 0) SH.volley(P.x + 22, P.y + 2, 0);
    m.step(dt);
    for (const d of dum) { dealt += 1e6 - d.hp; d.hp = d.hq = 1e6; d.x = 340; d.dead = 0; d.dying = 0; d.chl = 0; }
  }
  out.dps = Math.round(dealt / secs / 3);
  // enemy hull points as spawned now
  G().en = []; const hp = {}; for (const t of ['drone', 'turret', 'gunship']) { const e = S.en(t, { x: 600, y: 270 }); hp[t] = e.hp; G().en = []; }
  out.hp = hp; out.ttk = {}; for (const t in hp) out.ttk[t] = +(hp[t] / out.dps).toFixed(1);
  m.abort(); return out;
};
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const br = await PW.chromium.launch(); const p = await br.newPage({ viewport: { width: 960, height: 540 } }); p.on('pageerror', e => console.log('PAGEERR', e.message));
  const rows = [];
  for (const diff of (process.env.DIFFS || 'normal,legend').split(',')) for (const stage of (process.env.STAGES || '8,20,40').split(',').map(Number)) for (const build of ['fresh', 'mid', 'max']) {
    await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&all=1&nomusic=1&${process.env.Q || ''}`); await p.waitForFunction(() => window.__mnr && window.__wp && window.__scale, null, { timeout: 10000 });
    const r = await p.evaluate(PROBE, { build, stage, diff, secs: 8 }); r.diff = diff; r.stage = stage; rows.push(r);
    console.log(diff, 'st' + stage, build.padEnd(5), 'power', r.power, 'exp', r.exp, 'f', r.f, 'hpK', r.hpK, 'UPS.hp', r.upsHp, 'u', r.u, 'wu', r.wu, 'dmgK', r.dmgK, '| dps', r.dps, '| hp', JSON.stringify(r.hp), '| ttk s', JSON.stringify(r.ttk));
  }
  await br.close(); srv.kill();
})();
