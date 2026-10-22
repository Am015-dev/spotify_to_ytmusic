#!/usr/bin/env node
// Weapon Forge test (flag RET.forge, parts/weapons/forge.js + parts/weapons/inventory.js). Prints pass/fail lines only (REPORT=1 adds the tables).
//   NODE_PATH=$(npm root -g) node games-src/nightrun/forge-test.js        env: HARD=0 skips the Hard stage-30 bot runs, RUNS=2, PAR=4
// 1 recipes: every recipe forges its hybrid (scrap and Neon paid, parents stay), equips, fires 5 s with its traits, draws; no page error, bullet cap kept
// 2 power: dummy DPS of each hybrid at LV5 (+ HEAVY mod) <= 1.35x its parent weapon alone at the same level; on Hard stage 30 the dealt DPS <= hard.js's ceiling x1.1
// 3 Hard stage 30, the top 10 hybrids by DPS with the story bot (god mode, so time = time to clear): mean time and hits within 15% of their median (report table)
// 4 inventory: craft, socket limits (2 per weapon, 1 per hybrid), core/passive, presets save/load, scrap/sell, persistence over a reload, corrupt save survives
// 5 UI at 390x763, 360x640, 844x390: Garage FORGE tab, tiles >= 44 px, text >= 14 px, no overlapping tiles, no horizontal overflow; pit-stop preset row
// 6 ?forge=0: no FORGE tab, no traits on bullets, WP.mod output identical to the old one
// (bots that must not clear Normal: mustmove-test.js with Q='&fgt=all&fgm=heavy,zap'; the dodger: balance-test.js with the same Q)
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const RUNS = +process.env.RUNS || 4, PAR = +process.env.PAR || 4;
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const src = fs.readFileSync(path.join(__dirname, 'story-sim.js'), 'utf8'), i0 = src.indexOf('const BOT = '), i1 = src.indexOf('\n(async');
const BOTSRC = src.slice(i0 + 'const BOT = '.length, i1).trim().replace(/;$/, '');
let fails = 0; const line = (ok, s) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + s); };
const REC = () => {   // 1: every recipe
  const m = window.__mnr, wp = window.__wp, { FG, FGR } = window.__fg, GA = window.__ga.GA, out = [];
  for (const R of FGR) {
    const errs = []; localStorage.removeItem('mnr_forge'); FG.s = null; FG.ver++; GA.bank = 1000; const s = FG.st(); s.scrap = 10;
    wp.perm(R[0], 5); wp.perm(R[1], 5); const b0 = GA.bank, sc0 = s.scrap, msg = FG.forge(R[0], R[1]);
    if (msg) errs.push('forge: ' + msg); if (!s.hy[R[2]]) errs.push('no hybrid'); if (GA.bank !== b0 - 120 || s.scrap !== sc0 - 3) errs.push('cost not paid');
    if (!wp.has(R[0]) || !wp.has(R[1])) errs.push('parents gone');
    m.startStory(1); m.simOn(true); m.god = true; wp.eq = [R[0], R[1]]; wp._fk = null; FG.equip(0, 'h:' + R[2]);
    if (wp.eq[0] !== R[0]) errs.push('slot weapon ' + wp.eq[0]);
    const tr = FG.tr(R[0]); if (!tr || !Object.keys(R[4]).every(k => tr.t[k])) errs.push('traits missing');
    let fg = 0, max = 0; const cap = matchMedia('(pointer:coarse)').matches ? 44 : 64;
    for (let i = 0; i < 300; i++) { if (m.SH.active) m.SH.close(); m.P.hp = m.P.max; m.P.x = 200; m.P.y = 270 + 120 * Math.sin(i / 40); if (i % 6 === 0) m.SH.volley(m.P.x + 22, m.P.y + 2, 0);
      try { m.step(1 / 60); } catch (e) { errs.push(e.message); break; } fg += m.G.pb.filter(b => b.fg).length; max = Math.max(max, m.G.pb.length); }
    if (!fg) errs.push('no forge bullets'); if (max > cap) errs.push('bullets ' + max);
    try { wp.drawWorld(1); const c = document.createElement('canvas').getContext('2d'); FG.icon(c, 'h:' + R[2], 40); } catch (e) { errs.push('draw ' + e.message); }
    m.abort(); out.push({ id: R[2], n: R[3], errs });
  }
  return out;
};
const DPS = ({ rid, w, L, secs, diff, n, mods }) => {   // dummy DPS (weapon-test.js method); rid null = the parent weapon alone
  const m = window.__mnr, wp = window.__wp, { FG } = window.__fg; m.SET.diff = diff || 'normal'; try { m.applySet(); } catch (e) { }
  localStorage.removeItem('mnr_forge'); FG.s = null; FG.ver++; const s = FG.st();
  m.startStory(n || 1); m.simOn(true); m.god = true; wp.lv = {}; wp.xp = {}; wp.pl = { pulse: 1 }; wp.perm(w, L);
  wp.eq = [w, null]; wp._fk = null; if (rid) { s.hy[rid] = 5; s.lo.w = ['h:' + rid, null]; } for (const md of mods || []) { s.mods[md] = 1; s.lo.m[0].push(md); } FG.ver++; wp.reset(); wp.sync();
  const G = () => m.G, P = m.P, dum = [], DX = 200 + ({ orbit: 55, storm: 50, flame: 100 }[w] || 150);
  for (const dy of [-80, -40, 0, 40, 80]) dum.push({ type: 'drone', dummy: 1, x: DX, y: 270 + dy, r: 16, hp: 1e6, max: 1e6, hq: 1e6, flash: 0, t: 0, bf: 99, bn: 0, gr: 0, tin: 0, by: 270 + dy });
  let dealt = 0; const S3 = window.__s3 && window.__s3.S3, cap = S3 && S3.act() ? S3.cap() : 0;
  for (let i = 0; i < Math.round(secs * 60); i++) {
    if (m.SH.active) m.SH.close(); P.hp = P.max; P.x = 200; P.y = 270 + 50 * Math.sin(i / 60 * 1.6);
    G().en = G().en.filter(e => e.dummy); G().eb = []; for (const d of dum) if (!G().en.includes(d)) G().en.push(d);
    if (i % 8 === 0) m.SH.volley(P.x + 22, P.y + 2, 0);
    m.step(1 / 60);
    for (const d of dum) { dealt += 1e6 - d.hp; d.hp = d.hq = 1e6; d.x = DX; d.y = P.y + (d.by - 270); d.dead = 0; d.dying = 0; d.chl = 0; }
  }
  m.abort(); m.SET.diff = 'normal'; return { dps: dealt / secs, cap };
};
const INVT = () => {   // 4: inventory rules + save
  const wp = window.__wp, { FG } = window.__fg, GA = window.__ga.GA, f = [];
  localStorage.removeItem('mnr_forge'); FG.s = null; const s = FG.st(); if (s.scrap !== 4) f.push('first gift ' + s.scrap); s.scrap = 40; GA.bank = 2000;
  wp.perm('pulse', 3); wp.perm('swarm', 3); wp.perm('beat', 3); wp.eq = ['pulse', 'swarm'];
  if (FG.forge('pulse', 'laser') === '') f.push('forged without owning laser');
  if (FG.forge('pulse', 'swarm')) f.push('forge failed'); if (FG.forge('swarm', 'pulse') === '') f.push('forged twice');
  if (FG.craft('m', 'heavy') || FG.craft('m', 'zap') || FG.craft('m', 'pierce')) f.push('craft failed');
  if (FG.equip(0, 'h:seedfan')) f.push('equip hybrid'); if (FG.socket(0, 'heavy')) f.push('socket 1'); if (FG.socket(0, 'zap') === '') f.push('hybrid took 2 mods');
  if (FG.socket(1, 'zap') || FG.socket(1, 'pierce')) f.push('weapon slot 2 mods'); if (FG.socket(1, 'heavy') === '') f.push('weapon took 3 mods / used mod twice');
  if (FG.craft('k', 'burn') || FG.equip('core', 'burn') || FG.craft('p', 'salvage') || FG.equip('pas', 'salvage')) f.push('core/passive');
  if (FG.savePre(0, 'SEEDS')) f.push('save preset'); const lv0 = FG.levelUp('seedfan'); if (lv0 || s.hy.seedfan !== 2) f.push('level up ' + lv0);
  FG.equip(0, 'pulse'); if (wp.eq[0] !== 'pulse' || FG.tr('pulse') && FG.tr('pulse').t.seeds) f.push('unequip hybrid');
  if (FG.usePre(0) || s.lo.w[0] !== 'h:seedfan' || s.lo.m[0][0] !== 'heavy') f.push('load preset');
  if (FG.scrapIt('m', 'heavy') === '') f.push('sold a mod in use'); FG.craft('m', 'pierce'); const b = GA.bank; if (FG.scrapIt('m', 'pierce') || GA.bank !== b + 30) f.push('sell mod');
  for (let i = 0; i < 4; i++) FG.levelUp('seedfan'); if (s.hy.seedfan !== 5 || FG.levelUp('seedfan') !== 'Max level') f.push('level cap');
  const sc = s.scrap; if (FG.scrapIt('h', 'seedfan') || s.scrap !== sc + 6 || s.lo.w[0] === 'h:seedfan') f.push('scrap hybrid');
  FG.forge('pulse', 'swarm'); FG.equip(0, 'h:seedfan'); FG.save();
  return { f, saved: localStorage.getItem('mnr_forge') };
};
const UI = () => {   // 5: in the page, the Garage FORGE tab
  const { FG } = window.__fg, GA = window.__ga.GA, out = [];
  const s = FG.st(); s.scrap = 30; GA.bank = 3000; FG.save(); window.__wp.perm('swarm', 2); window.__wp.perm('beat', 2);
  const IV = window.__inv; IV.open('title'); const tab = document.querySelector('#garage .tabs button[data-t=forge]') || [...document.querySelectorAll('.tabs button')].find(b => b.dataset.t === 'forge');
  if (!tab) return ['no FORGE tab']; tab.click(); window.INV.sel = 'm:heavy'; window.INV.f = 'all'; IV.draw();
  const box = document.getElementById('gaCards'), bw = box.getBoundingClientRect();
  if (box.scrollWidth > box.clientWidth + 2) out.push('horizontal overflow ' + box.scrollWidth + '>' + box.clientWidth);
  const tiles = [...box.querySelectorAll('button,select,input')].filter(e => e.offsetParent);
  for (const t of tiles) { const r = t.getBoundingClientRect(); if (r.height < 43.5 || r.width < 43.5) { out.push('small ' + (t.textContent || t.tagName).trim().slice(0, 20) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height)); break; } if (r.right > bw.right + 1 || r.left < bw.left - 1) { out.push('outside ' + (t.textContent || '').trim().slice(0, 20)); break; } }
  for (const e of box.querySelectorAll('span,small,b,button,h4,div.fgmsg,option')) { if (!e.offsetParent || !e.textContent.trim() || e.tagName === 'OPTION') continue; const fs = parseFloat(getComputedStyle(e).fontSize); if (fs < 13.9) { out.push('text ' + fs + 'px: ' + e.textContent.trim().slice(0, 20)); break; } }
  const g = [...box.querySelectorAll('.fgt')].map(e => e.getBoundingClientRect());
  for (let i = 0; i < g.length; i++) for (let j = i + 1; j < g.length; j++) { const a = g[i], b = g[j]; if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) { out.push('tiles overlap'); i = g.length; break; } }
  if (g.length < 20) out.push('only ' + g.length + ' tiles');
  // tap-to-swap: select a weapon tile, tap slot 2
  window.INV.sel = 'w:beat'; IV.draw(); box.querySelector('.fgslot[data-slot="1"] button').click(); if (window.__wp.eq[1] !== 'beat') out.push('tap-to-swap failed: ' + window.__wp.eq);
  IV.close(); return out;
};
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const br = await PW.chromium.launch(), U = q => `http://127.0.0.1:${port}/index.html?sim=1&nomusic=1${q || ''}`;
  const page = async (q, vp) => { const p = await br.newPage({ viewport: vp || { width: 960, height: 540 } }); p.perr = []; p.on('pageerror', e => p.perr.push(e.message)); await p.goto(U(q)); await p.waitForFunction(() => window.__mnr && window.__wp && window.__fg, null, { timeout: 10000 }); return p; };
  const p = await page();
  const rec = await p.evaluate(REC), rb = rec.filter(r => r.errs.length);
  for (const r of rb.slice(0, 4)) console.log('  ' + r.id + ': ' + r.errs.slice(0, 3).join(' | '));
  line(!rb.length && rec.length >= 20, `recipes: ${rec.length - rb.length}/${rec.length} forge, equip, fire with their traits, draw, keep the bullet cap`);
  // 2 power
  const { FGR } = await p.evaluate(() => ({ FGR: window.__fg.FGR }));
  const parent = {}, tab = [];
  for (const R of FGR) { if (!(R[0] in parent)) parent[R[0]] = (await p.evaluate(DPS, { rid: null, w: R[0], L: 5, secs: 8 })).dps;
    const h = (await p.evaluate(DPS, { rid: R[2], w: R[0], L: 5, secs: 8, mods: ['heavy'] })).dps; tab.push({ id: R[2], w: R[0], h, par: parent[R[0]], k: h / Math.max(1, parent[R[0]]) }); }
  tab.sort((a, b) => b.k - a.k); const worst = tab[0];
  if (process.env.REPORT) for (const t of tab) console.log(`  ${t.id.padEnd(13)} ${t.w.padEnd(6)} hybrid+HEAVY ${t.h.toFixed(1)}/s  parent ${t.par.toFixed(1)}/s  x${t.k.toFixed(2)}`);
  line(worst.k <= 1.35, `power: every hybrid LV5 + HEAVY <= 1.35x its parent alone (top ${worst.id} x${worst.k.toFixed(2)}, median x${tab[tab.length >> 1].k.toFixed(2)})`);
  let capBad = 0, capTxt = ''; for (const t of tab.slice(0, 5)) for (const diff of ['hard', 'legend']) { const r = await p.evaluate(DPS, { rid: t.id, w: t.w, L: 10, secs: 8, diff, n: 30, mods: ['heavy'] }); if (r.cap && r.dps > r.cap * 1.1) { capBad++; capTxt += ` ${t.id}/${diff} ${r.dps.toFixed(0)}>${r.cap.toFixed(0)}`; } }
  line(!capBad, 'ceiling: the top 5 hybrids at LV10 parents on Hard/Legend stage 30 stay under hard.js\'s DPS ceiling x1.1' + capTxt);
  // 3 Hard stage 30 with the story bot
  if (process.env.HARD !== '0') {   // time to clear Hard stage 30 (story bot, god mode) with the hybrid / with its two parents alone: every ratio within 15% of the median ratio
    const top = tab.slice(0, 10), jobs = []; for (const t of top) for (let r = 0; r < RUNS; r++) for (const h of [1, 0]) jobs.push({ t, h }); const res = []; let nx = 0;
    const run = async (q, h) => { while (nx < jobs.length) { const j = jobs.find((x, k) => k >= nx && x.h === h); if (!j) return; jobs.splice(jobs.indexOf(j), 1); const pair = FGR.find(R => R[2] === j.t.id);
        const r = await q.evaluate(({ a, b }) => { const m = window.__mnr, wp = window.__wp; m.SET.diff = 'hard'; try { m.applySet(); } catch (e) { } m.god = true; wp.eq = [a, b]; wp._fk = null; wp.lv = {}; wp.xp = {}; wp.pl = { pulse: 1 }; wp.perm(a, 6); wp.perm(b, 6); window.__fg.FG.ver++; }, { a: pair[0], b: pair[1] }).then(() => q.evaluate(new Function('o', 'return (' + BOTSRC + ')(o)'), { n: 30, PC: .4, MAXT: 420, endless: false })).catch(e => ({ err: e.message }));
        res.push(Object.assign({ id: j.t.id, h }, r)); } };
    await Promise.all(Array.from({ length: PAR }, async (_, k) => { const h = k % 2 ? 0 : 1; const q = await page('&all=1' + (h ? '&fgt=' + top.map(t => t.id).join(',') : '&forge=0')); await run(q, h); await q.close(); }));
    const avg = (id, h) => { const a = res.filter(r => r.id === id && r.h === h && r.t); return a.reduce((x, y) => x + y.t, 0) / Math.max(1, a.length); };
    const rows = top.map(t => ({ id: t.id, th: avg(t.id, 1), tp: avg(t.id, 0), c: res.filter(r => r.id === t.id && r.h && r.clear).length + '/' + res.filter(r => r.id === t.id && r.h).length })).map(r => Object.assign(r, { k: r.th / Math.max(1, r.tp) }));
    const v = rows.map(r => r.k).sort((a, b) => a - b), mk = (v[(v.length - 1) >> 1] + v[v.length >> 1]) / 2;
    console.log('  Hard stage 30, story bot in god mode, parents LV6, hybrid LV5: hybrid / time with hybrid / time parents alone / ratio / clears');
    for (const r of rows) console.log(`  ${r.id.padEnd(13)} ${r.th.toFixed(0).padStart(4)}s ${r.tp.toFixed(0).padStart(4)}s  x${r.k.toFixed(2)}  ${r.c}`);
    const out = rows.filter(r => Math.abs(r.k - mk) > .15 * mk);
    line(!out.length, `Hard stage 30: every top-10 hybrid's clear time vs its parents within 15% of the median ratio x${mk.toFixed(2)}` + (out.length ? ' (out: ' + out.map(r => r.id + ' x' + r.k.toFixed(2)).join(', ') + ')' : ''));
  }
  // 4 inventory + persistence
  const iv = await p.evaluate(INVT); line(!iv.f.length, 'inventory rules: forge, craft, sockets 1/2, core, passive, presets, level cap, sell, scrap' + (iv.f.length ? ': ' + iv.f.join(', ') : ''));
  await p.reload(); await p.waitForFunction(() => window.__fg, null, { timeout: 10000 });
  const back = await p.evaluate(() => { const s = window.__fg.FG.st(); return !!s.hy.seedfan && s.pre[0] && s.pre[0].n === 'SEEDS' && s.lo.core === 'burn'; });
  line(back, 'persistence: hybrids, presets and the loadout survive a reload');
  await p.evaluate(() => localStorage.setItem('mnr_forge', '{bad json')); await p.reload(); await p.waitForFunction(() => window.__fg, null, { timeout: 10000 });
  line(await p.evaluate(() => { const s = window.__fg.FG.st(); return s.scrap === 4 && Array.isArray(s.lo.w); }), 'a corrupt save starts a fresh forge, no error');
  line(!p.perr.length, 'no page errors (main page)' + (p.perr[0] ? ': ' + p.perr[0] : ''));
  // 5 UI sizes
  for (const vp of [{ width: 390, height: 763 }, { width: 360, height: 640 }, { width: 844, height: 390 }]) {
    const q = await br.newPage({ viewport: vp, isMobile: true, hasTouch: true }); const pe = []; q.on('pageerror', e => pe.push(e.message)); await q.goto(U('&forge2=0'));   // the grid check is for the forgeui screen; forge2-test.js covers the one-screen forge await q.waitForFunction(() => window.__fg, null, { timeout: 10000 });
    const r = await q.evaluate(UI).catch(e => ['eval ' + e.message]);
    const pit = await q.evaluate(() => { const { FG } = window.__fg; FG.savePre(1, 'FAST'); window.INV.pit(); const el = document.getElementById('fgQuick'); el.parentNode.hidden = false; const b = el.querySelector('button'); const r = b && b.getBoundingClientRect(); const ok = !el.hidden && b && r.height >= 43.5 && parseFloat(getComputedStyle(b).fontSize) >= 14; el.parentNode.hidden = true; return ok; });
    line(!r.length && pit && !pe.length, `UI ${vp.width}x${vp.height}: FORGE tab tiles >= 44 px, text >= 14 px, no overlap or overflow, tap-to-swap, pit-stop preset row` + (r.length ? ': ' + r.slice(0, 3).join(' | ') : '') + (pit ? '' : ' (pit row)') + (pe[0] ? ' ' + pe[0] : ''));
    await q.close();
  }
  // 6 flag off
  const o = await page('&forge=0');
  const off = await o.evaluate(() => { const m = window.__mnr, wp = window.__wp, { FG } = window.__fg; const s = FG.st(); s.hy.seedfan = 5; s.lo.w = ['h:seedfan', null]; s.lo.m = [['heavy'], []]; s.mods.heavy = 1; FG.ver++;
    const tab = [...document.querySelectorAll('.tabs button')].find(b => b.dataset.t === 'forge'); m.startStory(1); m.simOn(true); m.god = true; wp.eq = ['pulse', null]; wp._fk = null;
    for (let i = 0; i < 120; i++) { if (m.SH.active) m.SH.close(); if (i % 6 === 0) m.SH.volley(m.P.x + 22, m.P.y, 0); m.step(1 / 60); }
    const fg = m.G.pb.some(b => b.fg), mo = JSON.stringify(wp.mod('pulse', { y: 1 })); m.abort(); return { tab: !!(tab && !tab.hidden), fg, mo }; });
  line(!off.tab && !off.fg && off.mo === '{"wid":"pulse","y":1}', '?forge=0: no FORGE tab, no forge traits on bullets, WP.mod unchanged' + (off.tab || off.fg ? ' ' + JSON.stringify(off) : ''));
  line(!o.perr.length, 'no page errors (?forge=0)' + (o.perr[0] ? ': ' + o.perr[0] : ''));
  await br.close(); srv.kill(); process.exit(fails ? 1 : 0);
})();
