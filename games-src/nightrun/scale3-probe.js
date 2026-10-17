#!/usr/bin/env node
// Scale round 3 probe (BALANCE.md "Power scale, round 3"): strongest realistic builds on Legend, parked (auto-aim only) and moving, god mode.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/scale3-probe.js     env: Q='&scale3=0' (round 2)  STAGES=20  SECS=60  PAIRS=swarm+beat,...  POWS=none,echo,cres,wing,drum
// Prints per build: dps on ordinary enemies (all damage the hull lost / s), auto-aim share, damage cut by the ceiling, and (stage 40) boss seconds.
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const RUN = (o) => {
  const m = window.__mnr, WP = window.__wp, SH = m.SH; m.SET.diff = o.diff; try { m.applySet(); } catch (e) { } m.startStory(o.n); m.simOn(true); m.god = true;
  const ups = () => { if (o.fresh) return; const GA = window.__ga.GA; GA.eqAll = true; for (const d of m.TP_DEF) GA.tune[d.id] = d.max || 3; const [a, b] = o.pair.split('+'); WP.pl = { [a]: 10, [b]: 10 }; WP.eq = [a, b]; WP.lv = { [a]: 5, [b]: 5 }; WP.sync();
    const ids = SH.UPG.map(u => u.id), want = { fr: 5, hm: 3, sb: 5, dm: 5, cr: 5, pc: 3, sc: 3, cl: 3, og: 2, rc: 2, dr: 2, rg: 2 }; for (const id in want) if (ids.includes(id)) for (let k = 0; k < want[id]; k++) { try { SH.add(id); } catch (e) { } } try { SH.recalc && SH.recalc(); } catch (e) { } };
  ups(); const S3 = window.S3; let i = 0, lb = -1, bt0 = -1, bt1 = -1; const dt = 1 / 60;
  while (m.running && m.G.t < o.secs) { const G = m.G, P = m.P;
    if (m.SH.active) { m.SH.close(); ups(); }
    if (i % 30 === 0 && o.pow !== 'none' && !m.PW.on(o.pow)) { try { m.PW.give(o.pow); } catch (e) { } }
    if (i % 3 === 0) { if (o.park) m.touchTo(120, 270); else { let ty = 270 + 140 * Math.sin(G.t * .9); let bd = 1e9; for (const e of G.en) { if (e.type === 'boss') { if (e.x < 960) ty = e.cores && e.cores.length ? e.cores[0].y : e.y; continue; } const dx = e.x - P.x; if (dx > 0 && dx < bd && e.x < 940) { bd = dx; ty = e.y; } } m.touchTo(200, ty); } }
    const bn = Math.floor(m.bpos()); if (bn !== lb) { lb = bn; m.press('Fire'); }
    if (G.boss && bt0 < 0 && G.boss.x < 800) bt0 = G.t;
    m.step(dt); i++; if (m.ST.over) { bt1 = m.G.t; break; } }
  const s = S3 ? S3.st : {}, r = { pair: o.pair, pow: o.pow, park: o.park, n: o.n, dps: +(s.all / Math.max(1, s.t)).toFixed(1), app: +((s.all - s.cut) / Math.max(1, s.t)).toFixed(1), aup: +(s.aup / Math.max(1, s.aup + s.man)).toFixed(2), au: +(s.au / Math.max(1, s.au + s.man)).toFixed(2), cut: +(s.cut / Math.max(1, s.all)).toFixed(2), kills: m.ST.kills || 0, boss: bt0 >= 0 ? +((bt1 > 0 ? bt1 : m.G.t) - bt0).toFixed(0) : -1, clear: !!m.ST.over, reg: Math.round(s.reg || 0) };
  m.abort(); return r; };
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' }); await new Promise(r => setTimeout(r, 800));
  const br = await PW.chromium.launch(), jobs = [], out = [];
  const pairs = (process.env.PAIRS || 'fresh,pulse+swarm,swarm+beat,swarm+laser,swarm+arc,laser+beat,arc+beat').split(','), pows = (process.env.POWS || 'none,echo,cres,wing,drum').split(','), stages = (process.env.STAGES || '20').split(',').map(Number), parks = (process.env.PARK || '1,0').split(',').map(Number);
  for (const n of stages) for (const pair of pairs) for (const pow of (pair === 'fresh' ? ['none'] : pows)) for (const park of parks) jobs.push({ n, pair, pow, park: !!park, fresh: pair === 'fresh', diff: process.env.DIFF || 'legend', secs: +(process.env.SECS || (n === 40 ? 200 : 60)) });
  let next = 0; await Promise.all(Array.from({ length: +(process.env.PAR || 4) }, async () => { const p = await br.newPage({ viewport: { width: 960, height: 540 } }); p.on('pageerror', e => console.log('PAGE ERROR ' + e.message));
    await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&all=1&nomusic=1${process.env.Q || ''}`); await p.waitForFunction(() => window.__mnr && window.__mnr.TR.list.length > 0, null, { timeout: 10000 });
    while (next < jobs.length) { const j = jobs[next++]; try { const r = await p.evaluate(RUN, j); out.push(r); console.log(JSON.stringify(r)); } catch (e) { console.log('ERR', j.pair, e.message.slice(0, 150)); } } await p.close(); }));
  await br.close(); srv.kill();
})();
