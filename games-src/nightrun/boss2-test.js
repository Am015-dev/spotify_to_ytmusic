#!/usr/bin/env node
// Boss fights that last (BALANCE.md "Boss fights, round 4"; code parts/armour.js, flag RET.boss2, ?boss2=0 = before). Prints PASS/FAIL lines.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/boss2-test.js      env: GAME_DIR, STAGES=5,8,13,16,21,24,29,32,37,40
// 1 god-damage stress: every frame the boss loses 1e6 HP (any source goes through the same e.hp): the fight still lasts >= its floor (B2X.T), every boss, Normal + Legend
// 2 phases: 2 and 3 start on a bar line (bt % 4 == 0), in order, with calm after; the armour absorbed damage and the bar sheen showed
// 3 flag off (?boss2=0): no B2X state on the boss, the old HP-bar phases
// 4 HUD: the boss bar with the armour sheen draws without errors at phone portrait 390x763 and desktop 960x540
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const STAGES = (process.env.STAGES || '5,8,13,16,21,24,29,32,37,40').split(',').map(Number);
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
let fails = 0; const line = (ok, s) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + s); };
const UP = { normal: { mini: 80, dist: 120, fin: 180 }, legend: { mini: 110, dist: 170, fin: 260 } };   // the upper targets: the cap, not shields or repair, sets the length
const STRESS = ({ n, diff, dmg }) => {
  const m = window.__mnr; m.SET.diff = diff; try { m.applySet(); } catch (e) { } m.startStory(n); m.simOn(true); m.god = true;
  const B = window.B2X; let t0 = null, t1 = null, sheen = 0, kind = '', T = 0, ok = 1, max = 0, phs = [];
  for (let i = 0; i < 700 * 60 && m.running; i++) { if (m.SH.active) m.SH.close(); m.touchTo(200, 270 + 120 * Math.sin(i / 90));
    const e = m.G.boss; if (e && t0 == null && e.x < 800) { t0 = m.G.t; kind = B ? B.kind(e) : ''; T = B ? B.tf(e) : 0; max = e.max; }
    if (e && e.x < 940 && dmg) e.hp -= dmg;
    m.step(1 / 60); if (m.G.boss && m.G.boss.b2s) sheen++;
    if (t0 != null && !m.G.boss) { t1 = m.G.t; break; } }
  const st = B ? B.st : {}; phs = (st.ph || []).map(p => p.bt);
  m.abort(); return { n, diff, kind, T, ttk: t1 == null ? null : +(t1 - t0).toFixed(1), sheen, abs: Math.round(st.abs || 0), phs, ph: st.ph || [], calm: st.calm || 0, ls: st.ls || 0, hz: st.hz || 0, on: !!(B && B.on), max };
};
const OFF = ({ n }) => { const m = window.__mnr; m.SET.diff = 'legend'; try { m.applySet(); } catch (e) { } m.startStory(n); m.simOn(true); m.god = true; let b2 = 0, p2 = 0;
  for (let i = 0; i < 300 * 60 && m.running; i++) { if (m.SH.active) m.SH.close(); m.step(1 / 60); const e = m.G.boss; if (e) { if (e.b2) b2++; p2 = e.p2; if (e.x < 800) break; } }
  m.abort(); return { b2, p2, on: !!(window.B2X && window.B2X.on) }; };
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const br = await PW.chromium.launch();
  const page = async (q, vp) => { const p = await br.newPage({ viewport: vp || { width: 960, height: 540 } }); p.on('pageerror', e => { fails++; console.log('FAIL page error ' + e.message); }); await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&all=1&nomusic=1${q}`); await p.waitForFunction(() => window.__mnr && window.__mnr.startStory, null, { timeout: 30000 }); return p; };
  // 1 + 2: stress, every boss, both difficulties (4 pages in parallel)
  const jobs = []; for (const diff of ['normal', 'legend']) for (const n of STAGES) jobs.push({ n, diff, dmg: 1e6 });
  const res = []; const pages = await Promise.all([0, 1, 2, 3].map(() => page('')));
  await Promise.all(pages.map(async (p, k) => { for (let j = k; j < jobs.length; j += 4) { await p.reload(); await p.waitForFunction(() => window.__mnr && window.__mnr.startStory); res.push(await p.evaluate(STRESS, jobs[j])); } }));
  res.sort((a, b) => a.diff.localeCompare(b.diff) || a.n - b.n);
  for (const r of res) line(r.ttk != null && r.ttk >= r.T && r.ttk <= UP[r.diff][r.kind], `stress ${r.diff} stage ${r.n} ${r.kind}: killed in ${r.ttk} s with 1e6 HP/frame (floor ${r.T} s, at most ${UP[r.diff][r.kind]} s), absorbed ${r.abs}, phases at beats ${r.phs.join('/')}, last stand ${r.ls}, beams ${r.hz}`);
  line(res.every(r => r.phs.length === 2 && r.phs.every(b => b % 4 === 0) && r.ph[0].ph === 2 && r.ph[1].ph === 3), 'phases 2 and 3 start on a bar line (beat % 4 == 0), in order, on every boss');
  line(res.every(r => r.calm >= 2 && r.abs > 0 && r.sheen > 0), 'every fight: a calm bar per phase change, armour absorbed damage, the bar sheen showed');
  line(res.every(r => r.ls >= 1), 'every fight has its last stand (EXPOSED) in phase 3');
  // 3 flag off
  const off = await page('&boss2=0'), o = await off.evaluate(OFF, { n: 8 }); await off.close();
  line(!o.on && o.b2 === 0 && o.p2 < 1e9, `flag off (?boss2=0): B2X off, no armour state on the boss (frames ${o.b2}), bar phases (p2 ${o.p2})`);
  // 4 HUD sheen draws on phone portrait and desktop
  for (const vp of [{ width: 390, height: 763 }, { width: 960, height: 540 }]) { const p = await page('', vp);
    const r = await p.evaluate(() => { const m = window.__mnr; m.SET.diff = 'legend'; try { m.applySet(); } catch (e) { } m.startStory(8); m.simOn(true); m.god = true; let s = 0;
      for (let i = 0; i < 200 * 60 && m.running; i++) { if (m.SH.active) m.SH.close(); const e = m.G.boss; if (e && e.x < 800) { e.hp -= 1e6; } m.step(1 / 60); if (m.G.boss && m.G.boss.b2s && m.G.boss.x < 800) { s++; if (s > 30) break; } }
      try { m.render(m.G.t, 1 / 60); } catch (e) { return 'err ' + e.message; } return s; });
    await p.screenshot({ path: path.join(require('os').tmpdir(), `boss2-hud-${vp.width}.png`) });
    line(typeof r === 'number' && r > 30, `HUD ${vp.width}x${vp.height}: boss bar with armour sheen drawn (${r} frames)`); await p.close(); }
  await br.close(); srv.kill(); console.log(fails ? `FAIL boss2-test (${fails})` : 'PASS boss2-test'); process.exit(fails ? 1 : 0);
})();
