#!/usr/bin/env node
// Build pressure + real choices gate (flag RET.build2, default off; the test runs ?build2=1, Q=&build2=0 compares). Prints pass/fail lines only (REPORT=1 adds tables).
//   NODE_PATH=$(npm root -g) node games-src/nightrun/choices-test.js     env: RUNS=4 PAR=4 PART=unit,camp,weap,ui Q=&build2=0 (compare)
// camp: Hard, max build (two weapons at permanent LV10 + every garage perk + shop picks + power-ups), stages 20/30: camper parked at x=70
//   (tracks height, reflex dash) vs the same dodger as reward-test. Hard mid build dodger. Legend max dodger vs ?build2=0.
// weap: Hard stage 30, god mode, max build, weapon X + swarm: seconds to clear and hits taken; the best pair within 15% of the median.
// ui: choice cards on a phone portrait + landscape: 3 cards, tap targets >= 44 px, text >= 14 px; a pick is logged in G stats and fires an event.
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const RUNS = +process.env.RUNS || 4, PAR = +process.env.PAR || 4, Q = process.env.Q || '', PART = (process.env.PART || 'unit,camp,weap,ui').split(','), REPORT = !!process.env.REPORT;
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const BOT = (o) => {
  const m = window.__mnr, rnd = Math.random, SH = m.SH, WP = window.__wp; m.SET.diff = o.diff; try { m.applySet(); } catch (e) { }
  const max = o.build === 'max', GA = window.__ga.GA;   // the Garage applies at run start: set it first (perks, permanent levels), then start
  GA.tune = {}; GA.eqAll = max; WP.pl = {}; if (max) { for (const d of m.TP_DEF) GA.tune[d.id] = d.max || 3; for (const id of o.wp) WP.pl[id] = 10; }
  m.startStory(o.n); m.simOn(true); let gh = 0, gl = -9; if (o.god) m.god = true;   // god mode: count would-be hits (a bullet or a body on the ship, 1 s apart)
  const ups = () => {
    WP.eq = o.wp.slice(); WP.lv = {}; for (const id of WP.eq) WP.lv[id] = max ? 5 : 2; WP.sync();
    const ids = SH.UPG.map(u => u.id), want = max ? { fr: 5, hm: 3, sb: 5, dm: 5, cr: 5, pc: 3, sc: 3, cl: 3, og: 2, rc: 2, dr: 2, rg: 2 } : { fr: 2, dm: 2, hm: 1 };
    for (const id in want) if (ids.includes(id)) for (let k = 0; k < want[id]; k++) { try { SH.add(id); } catch (e) { } }
    try { SH.recalc && SH.recalc(); } catch (e) { }
  };
  ups();
  const keepPw = () => { if (!max) return; for (const k of ['drum', 'tempo', 'slow', 'mag', 'tri']) if (!m.PW.on(k)) { try { m.PW.give(k); } catch (e) { } } };
  const dec = () => {
    const G = m.G, P = m.P; let ty = 270 + 140 * Math.sin(G.t * .9), tx = 220 + 70 * Math.sin(G.t * .55), bd = 1e9;
    for (const e of G.en) { if (e.type === 'boss') { if (e.x < 960) ty = e.cores && e.cores.length ? e.cores[0].y : e.y; continue; } const dx = e.x - P.x; if (dx > 0 && dx < bd && e.x < 940) { bd = dx; ty = e.type === 'gate' ? e.gy : e.y; } }
    if (o.mode === 'camp') tx = 70;
    let bc = 1e18, bx = P.x, by = P.y;
    for (let ix = -5; ix <= 5; ix++) for (let iy = -5; iy <= 5; iy++) {
      const cx = P.x + ix * 24, cy = P.y + iy * 24; if (cx < 30 || cx > 900 || cy < 40 || cy > 480) continue; let c = 0;
      for (const b of G.eb) { const px = b.x + b.vx * .14, py = b.y + b.vy * .14, d = Math.hypot(px - cx, py - cy); if (d < 70) c += (70 - d) * (70 - d) * (d < 26 ? 30 : 1); }
      for (const e of G.en) { if (e.type === 'gate') { if (Math.abs(e.x - cx) < 60 && (cy < e.gy - e.gap / 2 + 12 || cy > e.gy + e.gap / 2 - 12)) c += 3000; continue; } const d = Math.hypot(e.x - cx, e.y - cy), r = e.r + 55; if (d < r) c += (r - d) * (r - d) * 3; }
      if (window.MM && MM.col) c += MM.cost(cx);
      c += Math.abs(cy - ty) * .6 + Math.abs(cx - tx) * (o.mode === 'camp' ? .5 : .15) + Math.hypot(ix, iy) * 4; if (c < bc) { bc = c; bx = cx; by = cy; }
    }
    const near = G.eb.some(b => Math.hypot(b.x + b.vx * .08 - P.x, b.y + b.vy * .08 - P.y) < 30);
    return { bx, by, dash: near && P.dashCd <= 0 && rnd() < .5, emp: P.emp > 0 && (G.eb.length > 45 || (P.hp <= 1 && near)) };
  };
  let i = 0, lastBeat = -1, d = null, cleared = false; const dt = 1 / 60;
  while (m.running && m.G.t < o.MAXT) {
    if (m.SH.active) { m.SH.close(); ups(); }
    if (window.CHO && CHO.open) CHO.pick(Math.floor(rnd() * 3));
    if (i % 60 === 0) keepPw();
    if (i % 3 === 0) { d = dec(); m.touchTo(d.bx, d.by); if (d.dash) m.press('Dash'); if (d.emp) m.press('Emp'); }
    const bn = Math.floor(m.bpos()); if (bn !== lastBeat) { lastBeat = bn; m.press('Fire'); }
    m.step(dt); i++; if (o.god && m.G.t - gl > 1) { const P = m.P; if (m.G.eb.some(b => Math.hypot(b.x - P.x, b.y - P.y) < (b.r || 5) + 10) || m.G.en.some(e => e.type !== 'boss' && Math.hypot(e.x - P.x, e.y - P.y) < (e.r || 14) + 6)) { gh++; gl = m.G.t; } }
    if (m.G.dead) break; if (m.ST.over) { cleared = true; break; }
  }
  const r = { clear: cleared, t: +m.G.t.toFixed(0), hits: o.god ? gh : m.ST.hits, picks: window.CHO ? CHO.stat.n : 0, rear: window.CHO ? CHO.stat.rear : 0 };
  m.abort(); return r;
};
const UNIT = () => {
  const m = window.__mnr, out = [], ok = (n, c, x) => out.push((c ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? ' ' + x : ''));
  ok('flag on by default', !!(window.RET && RET.build2 && window.CHO && CHO.on));
  m.SET.diff = 'hard'; try { m.applySet(); } catch (e) { } m.startStory(10); m.simOn(true); for (let i = 0; i < 30; i++) m.step(1 / 60);
  let ev = 0; m.NR.on('choice', () => ev++);
  const c = CHO.offer('lvl'); ok('level-up offers 3 cards', c && c.length === 3, c && c.map(x => x.id).join(','));
  ok('a risky card has a drawback', CHO.DECK.some(k => k.risk && k.bad), CHO.DECK.filter(k => k.risk).length);
  const n0 = CHO.log.length; CHO.pick(0); const n1 = CHO.log.length;
  ok('pick logged in CHO.log and fires a stats event', n1 === n0 + 1 && ev === 1, n1 + ' ev ' + ev);
  const P = m.P, G = m.G; G.pk.length = 0; let tries = 0; while (!CHO.pairs.length && tries++ < 60) { G.pk.push({ t: 'up', x: P.x + 300, y: 200, vx: 0, vy: 0, bob: 0 }); m.step(1 / 60); }
  const pr = CHO.pairs[0]; if (pr) { const a = pr[0]; a.x = P.x + 5; a.y = P.y; a.vx = a.vy = 0; } for (let i = 0; i < 4; i++) m.step(1 / 60);
  ok('pair drop: two pickups, take one and the other vanishes', !!pr && pr[0].dead && pr[1].dead && CHO.stat.pair === 1, pr ? [pr[0].t, pr[1].t, !!pr[0].dead, !!pr[1].dead, CHO.stat.pair, Math.round(pr[0].x - P.x), Math.round(pr[1].x-P.x)].join('/') : 'no pair');
  CHO.offer('lvl'); const lv0 = JSON.stringify(m.G && window.__wp.lv); CHO.pick(1); ok('a non-level card takes the level back', CHO.log[CHO.log.length - 1].id !== 'lv');
  m.abort(); return out;
};
const UI = async (p) => p.evaluate(() => {
  const m = window.__mnr; m.startStory(10); m.simOn(true); for (let i = 0; i < 20; i++) m.step(1 / 60); CHO.offer('pit');
  const el = document.getElementById('choL'), bs = [...el.querySelectorAll('button')], vis = getComputedStyle(el).display !== 'none';
  const sz = bs.map(b => { const r = b.getBoundingClientRect(); return [r.width, r.height, r.left, r.right, r.top, r.bottom]; });
  const fs = [...el.querySelectorAll('*')].filter(e => e.childNodes.length && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())).map(e => parseFloat(getComputedStyle(e).fontSize));
  const W = innerWidth, H = innerHeight; CHO.pick(1); const gone = getComputedStyle(el).display === 'none'; m.abort();
  return { vis, n: bs.length, minH: Math.min(...sz.map(s => s[1])), minW: Math.min(...sz.map(s => s[0])), inside: sz.every(s => s[2] >= 0 && s[3] <= W + 1 && s[4] >= 0 && s[5] <= H + 1), minF: Math.min(...fs), gone };
});
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const br = await PW.chromium.launch(); let fails = 0; const errs = [];
  const chk = (n, c, x) => { console.log((c ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? ' ' + x : '')); if (!c) fails++; };
  const mk = async (q, vp) => { const p = await br.newPage({ viewport: vp || { width: 960, height: 540 } }); p.on('pageerror', e => errs.push(e.message)); await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&all=1${q === undefined ? '&build2=1' : q}`); await p.waitForFunction(() => window.__mnr && window.__mnr.TR.list.length > 0, null, { timeout: 8000 }).catch(() => { }); return p; };
  if (PART.includes('unit') && Q === '&build2=1') { const u = await mk(); for (const l of await u.evaluate(UNIT)) { console.log(l); if (l.startsWith('FAIL')) fails++; } await u.close(); }
  const run = async (jobs, q) => { const res = []; let next = 0;
    await Promise.all(Array.from({ length: PAR }, async () => { const p = await mk(q); while (next < jobs.length) { const j = jobs[next++]; try { const r = await p.evaluate(BOT, j); res.push(Object.assign(r, j)); } catch (e) { console.log('RUN ERROR', JSON.stringify(j), e.message.slice(0, 120)); } await p.reload(); await p.waitForFunction(() => window.__mnr && window.__mnr.TR.list.length > 0, null, { timeout: 8000 }).catch(() => { }); } await p.close(); }));
    return res; };
  const PAIRS = [['pulse', 'swarm'], ['laser', 'beat'], ['well', 'swarm'], ['disc', 'frost']];
  const rate = (rs, f) => { const a = rs.filter(f); return a.length ? a.filter(r => r.clear).length / a.length : 0; };
  if (PART.includes('camp')) {
    const jobs = []; for (const mode of ['camp', 'dodge']) for (const n of [20, 30]) for (let k = 0; k < RUNS; k++) jobs.push({ mode, n, diff: 'hard', build: 'max', wp: PAIRS[k % PAIRS.length], MAXT: 420 });
    for (const n of [3, 10, 20]) for (let k = 0; k < RUNS; k++) jobs.push({ mode: 'dodge', n, diff: 'hard', build: 'mid', wp: ['pulse', 'swarm'], MAXT: 420 });
    for (const n of [20, 30]) for (let k = 0; k < Math.ceil(RUNS / 2); k++) jobs.push({ mode: 'dodge', n, diff: 'legend', build: 'max', wp: PAIRS[k % PAIRS.length], MAXT: 600 });
    const rs = await run(jobs, Q); if (process.env.DBG) for (const r of rs) console.log(JSON.stringify(r));
    const cm = rate(rs, r => r.mode === 'camp'), dg = rate(rs, r => r.mode === 'dodge' && r.build === 'max' && r.diff === 'hard'), mid = rate(rs, r => r.build === 'mid'), lg = rate(rs, r => r.diff === 'legend');
    const rear = rs.filter(r => r.mode === 'camp').reduce((s, r) => s + r.rear, 0) / Math.max(1, rs.filter(r => r.mode === 'camp').length);
    const hh = f => { const a = rs.filter(f); return (a.reduce((s, r) => s + r.hits, 0) / Math.max(1, a.length)).toFixed(1); };
    console.log(`REPORT${Q} hard max camper ${Math.round(cm * 100)}% (hits ${hh(r => r.mode === 'camp')}) dodger ${Math.round(dg * 100)}% (hits ${hh(r => r.mode === 'dodge' && r.build === 'max' && r.diff === 'hard')}) | hard mid dodger ${Math.round(mid * 100)}% | legend max dodger ${Math.round(lg * 100)}% | rear spawns/camp run ${rear.toFixed(1)}`);
    if (Q === '&build2=1') { chk('Hard max camper clears <= 30%', cm <= .3, Math.round(cm * 100) + '%'); chk('Hard max dodger clears >= 65%', dg >= .65, Math.round(dg * 100) + '%'); chk('Hard mid dodger clears >= 45%', mid >= .45, Math.round(mid * 100) + '%'); }
  }
  if (PART.includes('weap')) {
    const W = (process.env.WEAPS || 'pulse,laser,beat,arc,orbit,mine,disc,frost,wave,shell,drone,well,storm,rail,flame').split(','), jobs = [];
    for (const w of W) for (let k = 0; k < 2; k++) jobs.push({ mode: 'dodge', n: 30, diff: 'hard', build: 'max', god: true, wp: [w, 'swarm'], MAXT: 420, w });
    const rs = await run(jobs, Q), tab = {};
    for (const r of rs) { const a = tab[r.w] = tab[r.w] || { t: 0, h: 0, n: 0, c: 0 }; a.t += r.clear ? r.t : 420; a.h += r.hits; a.n++; a.c += r.clear ? 1 : 0; }
    const rows = Object.entries(tab).map(([w, a]) => [w, a.t / a.n, a.h / a.n, a.c / a.n]), med = (k) => { const v = rows.map(r => r[k]).sort((a, b) => a - b); return v[Math.floor(v.length / 2)]; };
    const mt = med(1), mh = med(2); console.log(`REPORT${Q} weapon+swarm Hard st30 god: median ${mt.toFixed(0)} s ${mh.toFixed(1)} hits`);
    for (const r of rows.sort((a, b) => a[1] - b[1])) console.log(`REPORT${Q}  ${r[0].padEnd(6)} ${r[1].toFixed(0).padStart(4)} s ${r[2].toFixed(1).padStart(5)} hits clear ${Math.round(r[3] * 100)}% (${((r[1] / mt - 1) * 100).toFixed(0)}% t, ${((r[2] / mh - 1) * 100).toFixed(0)}% hits)`);
    const well = tab.well ? [tab.well.t / tab.well.n, tab.well.h / tab.well.n] : [mt, mh];
    if (Q === '&build2=1') chk('Well+Swarm within 15% of the median time and hits (Hard st30)', well[0] >= mt * .85 && well[1] >= mh * .85, well[0].toFixed(0) + 's/' + well[1].toFixed(1) + ' vs ' + mt.toFixed(0) + 's/' + mh.toFixed(1));
  }
  if (PART.includes('ui') && Q === '&build2=1') for (const vp of [{ width: 390, height: 763 }, { width: 763, height: 390 }]) {
    const p = await mk('', vp), u = await UI(p); await p.close(); const tag = vp.width + 'x' + vp.height;
    chk(tag + ' choice cards shown, 3 buttons', u.vis && u.n === 3, u.n); chk(tag + ' tap targets >= 44 px', u.minH >= 44 && u.minW >= 44, Math.round(u.minW) + 'x' + Math.round(u.minH));
    chk(tag + ' text >= 14 px', u.minF >= 14, u.minF); chk(tag + ' cards inside the screen', u.inside); chk(tag + ' sheet closes on a pick', u.gone);
  }
  chk('no page errors', errs.length === 0, errs[0] || '');
  await br.close(); srv.kill(); console.log(fails ? 'RESULT FAIL ' + fails : 'RESULT PASS'); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
