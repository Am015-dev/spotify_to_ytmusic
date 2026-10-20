#!/usr/bin/env node
// VISIBLE gate (parts/visible.js, flag RET.vis, default on; ?vis=0 = old). Prints PASS/FAIL lines (and the table with TABLE=1).
//   NODE_PATH=$(npm root -g) node games-src/nightrun/visible-test.js     env: VIS=0 (measure the old rules) SECS=60 STAGES=3,10,20 ALL=1 (all 16 weapons)
// For every kill: seconds on screen (first frame at x < W-20 inside the playfield, to death) and 'killed before visible' (died at x >= W-20 or off-screen).
// Gate on Normal with the owner's build (PULSE 3 + SWARM 10) at stages 3/10/20: killed-before-visible = 0, median life per kind:
// drone >= 1.5 s, charger/flank >= 2, gunship >= 5, gate/tank/turret >= 3, swarm >= 1, zoo kinds >= 2 (kinds with < 3 kills are not judged);
// and (ALL=1) every single weapon at level 10's median life within +-40% of the all-weapon median.
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const STAGES = (process.env.STAGES || '3,10,20').split(',').map(Number), SECS = +process.env.SECS || 60;
const IDS = ['pulse', 'laser', 'swarm', 'beat', 'arc', 'orbit', 'disc', 'mine', 'frost', 'flame', 'wave', 'shell', 'drone', 'well', 'rail', 'storm'];
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const RUN = ({ st, eq, lv, secs }) => {
  const m = window.__mnr, wp = window.__wp, W = 960, H = 540, rec = [];
  m.SET.diff = 'normal'; m.SET.auto = true; try { m.applySet(); } catch (e) { }
  wp.eq = eq.slice(); wp._fk = null; wp.lv = {}; wp.xp = {}; wp.pl = { pulse: 1 }; eq.forEach((id, i) => id && wp.perm(id, lv[i])); wp.sync();
  m.startStory(st); m.simOn(true); m.god = true;
  const kind = e => e.zt ? 'zoo-' + (e.zk || e.zn || e.sub || e.type) : (e.type === 'gtank' ? 'tank' : e.type === 'gwalker' ? 'walker' : e.type === 'gturret' ? 'turret' : e.type);
  const seen = e => e.x < W - 20 && e.x > -10 && e.y > -10 && e.y < H + 10;
  const h = d => { const e = d && d.e; if (!e || e.type === 'boss') return; const vis = seen(e); rec.push({ k: kind(e), life: e._v0 != null ? m.G.t - e._v0 : 0, pre: !vis || e._v0 == null }); };
  m.NR.on('kill', h);
  const dt = 1 / 60;
  for (let i = 0; i < secs * 60; i++) {
    const G = m.G, P = m.P; if (!G || G.dead) break; P.hp = P.max;
    for (const e of G.en) if (e._v0 == null && seen(e)) e._v0 = G.t;
    let best = null, bd = 1e9; for (const e of G.en) { if (e.type === 'boss' || e.hp <= 0 || !seen(e)) continue; const d = e.x; if (d < bd) { bd = d; best = e; } }
    const ty = best ? best.y : H / 2; P.y += Math.max(-6, Math.min(6, ty - P.y)); P.x = 180;
    if (m.SH.active) m.SH.close(); m.step(dt);
  }
  m.NR.off ? m.NR.off('kill', h) : (m.NR._h.kill = (m.NR._h.kill || []).filter(f => f !== h));
  m.abort(); return rec;
};
const med = a => { if (!a.length) return 0; const s = a.slice().sort((x, y) => x - y); return s[s.length >> 1]; };
const NEED = k => /^zoo-/.test(k) ? 2 : ({ drone: 1.5, charger: 2, flank: 2, gunship: 5, gate: 3, tank: 3, turret: 3, swarm: 1, walker: 2, mine: 1 })[k];
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const br = await PW.chromium.launch(); const p = await br.newPage({ viewport: { width: 960, height: 540 } }); const perr = []; p.on('pageerror', e => perr.push(e.message));
  const q = process.env.VIS === '0' ? '&vis=0' : '';
  await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&all=1&nomusic=1${q}`); await p.waitForFunction(() => window.__mnr && window.__wp, null, { timeout: 10000 });
  const own = [];
  for (const st of STAGES) own.push(...await p.evaluate(RUN, { st, eq: ['pulse', 'swarm'], lv: [3, 10], secs: SECS }));
  const by = {}; for (const r of own) (by[r.k] = by[r.k] || []).push(r);
  const pre = own.filter(r => r.pre).length; let bad = 0;
  console.log((pre ? 'FAIL' : 'PASS') + ` killed before visible (PULSE 3 + SWARM 10, Normal st ${STAGES}): ${pre}/${own.length}`); if (pre) bad++;
  for (const k of Object.keys(by).sort()) {
    const a = by[k].filter(r => !r.pre).map(r => r.life), m = med(a), need = NEED(k);
    const judged = need != null && a.length >= 3, ok = !judged || m >= need; if (!ok) bad++;
    console.log((ok ? 'PASS' : 'FAIL') + ` ${k}: median ${m.toFixed(2)} s on screen (n ${a.length}, pre ${by[k].length - a.length})` + (need != null ? ` need >= ${need}` : ''));
  }
  if (process.env.ALL === '1') {
    const W = {}; for (const id of IDS) { const r = []; for (const st of STAGES) r.push(...await p.evaluate(RUN, { st, eq: [id, null], lv: [10], secs: Math.min(SECS, 40) })); W[id] = r; }
    const all = med(Object.values(W).flat().filter(r => !r.pre).map(r => r.life));
    for (const id of IDS) { const a = W[id].filter(r => !r.pre).map(r => r.life), m = med(a), pr = W[id].length - a.length, ok = m >= all * .6 && m <= all * 1.4 && !pr; if (!ok) bad++;
      console.log((ok ? 'PASS' : 'FAIL') + ` ${id} L10: median ${m.toFixed(2)} s (all ${all.toFixed(2)}), pre ${pr}/${W[id].length}`); }
  }
  if (perr.length) { bad++; console.log('FAIL page errors: ' + perr.slice(0, 3).join(' | ')); }
  console.log((bad ? 'FAIL' : 'PASS') + ' visible-test');
  await br.close(); srv.kill(); process.exit(bad ? 1 : 0);
})();
