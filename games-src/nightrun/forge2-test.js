#!/usr/bin/env node
// One-screen forge test (flag RET.forge2, parts/weapons/forgeone.js). Prints pass/fail lines only.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/forge2-test.js        env: GAME_DIR=...
// 1 fit at 390x763, 375x553, 844x390 in 9 states (empty, one slot, two + preview, post-merge, equip, many items, mods, presets, info sheet):
//   document and forge box never taller than the viewport, the page never scrolls, MERGE inside the viewport, the strip is the only scroller,
//   targets >= 44 px, text >= 14 px, the main zones and slots do not overlap, lesson hooks kept
// 2 every old feature reachable: recipes list, UNDO, cost, good-against, stage badge, level up / scrap / craft / socket, mod remove, presets, cores
// 3 real touch (CDP Input.dispatchTouchEvent): tap card -> slot A, tap card -> slot B, tap MERGE, tap ship slot 1 = equipped; swipe moves the strip only;
//   hold = info sheet
// 4 ?forge2=0 = the forgeui.js screen; no page errors
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0; const line = (ok, s, info) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + s + (ok || info == null ? '' : ' :: ' + info)); };
const OPEN = () => { const { FG } = window.__fg, GA = window.__ga.GA, s = FG.st(); s.scrap = 10; GA.bank = 1000; FG.save();
  for (const id of ['pulse', 'swarm', 'laser', 'beat', 'disc']) window.__wp.perm(id, 2);
  window.__inv.open('title'); const t = document.querySelector('#garage .tabs button[data-t=forge]'); if (!t) return 'no FORGE tab'; t.click(); return ''; };
const STATES = {
  empty: () => { const U = window.__fgu, F = window.__fg2; F.tab = 'w'; F.sheet = null; window.INV.f = 'w'; U.a = U.b = null; U.arm = null; window.INV.sel = null; },
  one: () => { window.__fgu.a = 'pulse'; },
  two: () => { window.__fgu.b = 'swarm'; },
  merged: () => { const U = window.__fgu; U.a = 'pulse'; U.b = 'swarm'; window.INV.say(U.merge()); },
  equip: () => { window.INV.sel = 'h:seedfan'; },
  many: () => { const { FG, FGR } = window.__fg, s = FG.st(); for (const R of FGR.slice(0, 12)) s.hy[R[2]] = 1; for (const id of ['laser', 'beat', 'disc', 'arc', 'orbit', 'mine', 'frost', 'flame', 'wave', 'shell', 'drone', 'well', 'rail', 'storm']) try { window.__wp.perm(id, 1); } catch (e) { } window.INV.sel = null; window.INV.f = 'all'; },
  mods: () => { const F = window.__fg2; F.tab = 'm'; window.INV.f = 'm'; },
  presets: () => { window.__fg2.tab = 'p'; },
  sheet: () => { const F = window.__fg2; F.tab = 'w'; window.INV.f = 'w'; F.sheet = 'h:seedfan'; },
};
const FIT = st => {   // 1
  const out = [], box = document.getElementById('gaCards'), H = innerHeight, W = innerWidth, de = document.documentElement;
  if (!box.classList.contains('f2')) return ['not the forge2 screen'];
  scrollTo(0, 900); if (scrollY !== 0 || de.scrollTop !== 0) out.push('page scrolled ' + scrollY);
  if (de.scrollHeight > H + 1) out.push('document ' + de.scrollHeight + '>' + H);
  if (box.scrollHeight > box.clientHeight + 1) out.push('forge box ' + box.scrollHeight + '>' + box.clientHeight);
  const mg = document.getElementById('fuMerge'), mr = mg && mg.getBoundingClientRect();
  if (!mr || mr.top < 0 || mr.bottom > H + .5 || mr.left < 0 || mr.right > W + .5 || mr.height < 44) out.push('MERGE outside the viewport');
  const scr = [...document.querySelectorAll('#garage *')].filter(e => { const c = getComputedStyle(e); return e.offsetParent && ((/(auto|scroll)/.test(c.overflowX) && e.scrollWidth > e.clientWidth + 1) || (/(auto|scroll)/.test(c.overflowY) && e.scrollHeight > e.clientHeight + 1)); });
  const allowed = e => e.id === 'fuStrip' || (st === 'sheet' && e.classList.contains('lst'));
  for (const e of scr) if (!allowed(e)) { out.push('scroller ' + (e.id || e.className)); break; }
  if (st !== 'sheet') for (const t of box.querySelectorAll('button,input')) { if (!t.offsetParent) continue; const r = t.getBoundingClientRect(); if (r.right < 0 || r.left > W) continue;
    if (r.height < 43.5 || r.width < 43.5) { out.push('small target ' + (t.textContent || t.tagName).trim().slice(0, 20) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height)); break; }
    if (!t.closest('#fuStrip') && (r.right > W + .5 || r.left < -.5 || r.bottom > H + .5)) { out.push('cut by the edge ' + t.textContent.trim().slice(0, 20)); break; } }
  const w = document.createTreeWalker(box, NodeFilter.SHOW_TEXT); for (let n; (n = w.nextNode());) { if (!n.textContent.trim() || !n.parentElement.offsetParent) continue; const fs = parseFloat(getComputedStyle(n.parentElement).fontSize); if (fs < 13.9) { out.push('text ' + fs + 'px ' + n.textContent.trim().slice(0, 20)); break; } }
  const ov = sel => { const g = [...box.querySelectorAll(sel)].filter(e => e.offsetParent).map(e => e.getBoundingClientRect()); for (let i = 0; i < g.length; i++) for (let j = i + 1; j < g.length; j++) { const a = g[i], b = g[j]; if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) return true; } return false; };
  if (ov(':scope>.f2-top,:scope>.f2-st,:scope>.f2-bench,:scope>.f2-lo,:scope>.f2-inv,:scope>.f2-pre')) out.push('zones overlap');
  if (ov('.f2-slot,.f2-op')) out.push('forge slots overlap'); if (ov('.fgslot')) out.push('ship slots overlap'); if (ov('.f2-card')) out.push('cards overlap');
  for (const e of box.querySelectorAll('.f2-b,.f2-tab,.f2-merge')) if (e.offsetParent && e.scrollWidth > e.clientWidth + 2) { out.push('text spills ' + e.textContent.trim().slice(0, 20)); break; }
  for (const k of ['forge-slot-a', 'forge-slot-b', 'forge-merge']) if (!box.querySelector(`[data-lesson="${k}"]`)) out.push('no data-lesson ' + k);
  if (box.querySelectorAll('[data-lesson="loadout-slot"]').length !== 4) out.push('loadout-slot hooks != 4');
  return out;
};
const FEAT = () => {   // 2
  const { FG } = window.__fg, U = window.__fgu, F = window.__fg2, s = FG.st(), o = {}, $ = id => document.getElementById(id), draw = () => window.__inv.draw();
  F.tab = 'w'; F.sheet = null; U.a = 'pulse'; U.b = 'swarm'; window.INV.sel = null; window.INV.f = 'w'; draw();
  o.cost = /3 scrap \+ 120 Neon/.test($('fuMerge').textContent); o.good = /Good vs \S/.test($('fuPrev').textContent); o.delta = !!$('fuPrev').querySelector('[data-delta=dmg]');
  $('fuRec').click(); o.recipes = document.querySelectorAll('#fuSheet .lst button').length; $('fuClose').click();
  $('fuMerge').click(); o.undo = !!$('fuUndo'); const b0 = window.__ga.GA.bank; $('fuUndo').click(); o.undone = !s.hy.seedfan && window.__ga.GA.bank === b0 + 120; $('fuMerge').click();
  window.INV.f = 'all'; draw(); o.badge = document.querySelectorAll('#fuStrip small.rec').length;
  F.sheet = 'h:seedfan'; draw(); const acts = [...document.querySelectorAll('#fuSheet .acts button')].map(b => b.textContent).join('|'); o.hyActs = /LEVEL UP/.test(acts) && /SCRAP IT/.test(acts) && /EQUIP SLOT 1/.test(acts);
  F.sheet = 'm:' + window.__fg.FGM[0][0]; draw(); o.craft = /CRAFT/.test(document.querySelector('#fuSheet').textContent); [...document.querySelectorAll('#fuSheet .acts button')].find(b => /CRAFT/.test(b.textContent)).click();
  F.sheet = 'm:' + window.__fg.FGM[0][0]; draw(); o.socket = /SOCKET SLOT 1/.test(document.querySelector('#fuSheet').textContent); [...document.querySelectorAll('#fuSheet .acts button')].find(b => /SOCKET SLOT 1/.test(b.textContent)).click();
  F.sheet = 'slot:0'; draw(); o.modOut = /TAKE OUT/.test(document.querySelector('#fuSheet').textContent); o.addMod = /\+ MOD|PICK A WEAPON/.test(document.querySelector('#fuSheet').textContent); $('fuClose').click();
  document.querySelector('.f2-tab[data-tab=m]').click(); o.mods = document.querySelectorAll('#fuStrip .f2-card[data-it^="m:"]').length;
  document.querySelector('[data-f=type]').click(); o.cores = document.querySelectorAll('#fuStrip .f2-card[data-it^="k:"]').length;
  document.querySelector('.f2-tab[data-tab=p]').click(); o.pre = document.querySelectorAll('#fuPre input').length === 3 && /SAVE/.test($('fuPre').textContent) && /LOAD/.test($('fuPre').textContent);
  document.querySelector('.f2-tab[data-tab=w]').click(); document.querySelector('[data-f=eq]').click(); const cs = [...document.querySelectorAll('#fuStrip .f2-card')]; o.eqOnly = cs.length > 0 && cs.every(c => /ON SHIP/.test(c.textContent)); document.querySelector('[data-f=eq]').click();
  o.cnt = /^\d+(-\d+)?\/\d+$/.test($('fuCnt').textContent);
  $('fuBack').click(); o.back = !document.getElementById('garage').classList.contains('f2') && !!document.querySelector('#garage .tabs');
  document.querySelector('#garage .tabs button[data-t=forge]').click();
  return o;
};
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await sleep(800); const br = await PW.chromium.launch({ args: ['--window-size=1000,1000'] }), errs = [], U = q => `http://127.0.0.1:${port}/index.html?nomusic=1${q || ''}`;
  const page = async (q, vp) => { const ctx = await br.newContext({ viewport: vp, hasTouch: true, isMobile: true }); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(() => { try { localStorage.setItem('mnr_tut', '1'); localStorage.setItem('mnr_tipdone', 'true'); localStorage.setItem('mnr_fscard', '99'); } catch (e) { } });
    await p.goto(U(q)); await p.waitForFunction(() => window.__mnr && window.__fg && window.__inv && window.__fgu, null, { timeout: 15000 }); await sleep(600); p.ctx = ctx; return p; };
  const nums = [];
  for (const [w, h] of [[390, 763], [375, 553], [844, 390]]) {
    const p = await page('', { width: w, height: h }), m = await p.evaluate(OPEN); await sleep(300); const bad = [], hs = [];
    if (m) bad.push(m);
    else for (const k in STATES) { await p.evaluate(f => { eval('(' + f + ')')(); window.__inv.draw(); }, STATES[k].toString()); await sleep(80);
      const r = await p.evaluate(FIT, k); hs.push(k + ' ' + await p.evaluate(() => document.documentElement.scrollHeight + '/' + innerHeight)); for (const x of r) bad.push(k + ': ' + x); }
    nums.push(`${w}x${h}: ` + hs.join(', '));
    line(!bad.length, `fit ${w}x${h}: 9 states, no page scroll, MERGE in view, strip the only scroller, targets >= 44, text >= 14, no overlap, lesson hooks`, bad.slice(0, 4).join(' | '));
    await p.ctx.close();
  }
  console.log('  heights ' + nums.join(' ; '));
  // 2 features
  { const p = await page('', { width: 375, height: 553 }); await p.evaluate(OPEN); await sleep(200); const f = await p.evaluate(FEAT);
    line(f.cost && f.good && f.delta && f.recipes === 24 && f.undo && f.undone, 'bench: cost on MERGE, deltas, good-against, RECIPES lists 24, UNDO gives Neon back', JSON.stringify(f));
    line(f.badge >= 1 && f.hyActs && f.craft && f.socket && f.modOut && f.addMod, 'sheets: stage badge, hybrid LEVEL UP / SCRAP / EQUIP, mod CRAFT + SOCKET, slot sheet TAKE OUT / + MOD', JSON.stringify(f));
    line(f.mods >= 10 && f.cores >= 1 && f.pre && f.eqOnly && f.cnt && f.back, 'tabs: MODS strip, CORES chip, PRESETS 3 rows, ON SHIP filter, counter, back to the hangar', JSON.stringify(f));
    await p.ctx.close(); }
  // 3 real touch
  { const p = await page('', { width: 390, height: 763 }); await p.evaluate(OPEN); await sleep(200);
    await p.evaluate(() => { const U = window.__fgu; U.a = U.b = null; U.arm = null; window.INV.sel = null; window.INV.f = 'w'; window.__fg2.tab = 'w'; window.__inv.draw(); });
    const cdp = await p.ctx.newCDPSession(p), at = async sel => { const r = await p.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const st = e.closest('#fuStrip'); if (st) { st.scrollLeft = Math.max(0, e.offsetLeft - st.offsetLeft - 8); } const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, sel); await sleep(120); return r && await p.evaluate(sel => { const r = document.querySelector(sel).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, sel); };
    const tap = async (sel, hold) => { const c = await at(sel); if (!c) return false; await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: c.x, y: c.y }] }); await sleep(hold || 40); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(250); return true; };
    const t = {}; await tap('#fuStrip [data-it="w:pulse"]'); t.a = await p.evaluate(() => window.__fgu.a); await tap('#fuStrip [data-it="w:swarm"]'); t.b = await p.evaluate(() => window.__fgu.b);
    const s0 = await p.evaluate(() => window.__fg.FG.st().scrap); await tap('#fuMerge'); t.made = await p.evaluate(s0 => !!window.__fg.FG.st().hy.seedfan && window.__fg.FG.st().scrap === s0 - 3, s0);
    t.sel = await p.evaluate(() => window.INV.sel); await tap('#fuLoad .fgslot[data-slot="0"] button'); t.eq = await p.evaluate(() => window.__fg.FG.st().lo.w[0] === 'h:seedfan' && window.__wp.eq[0] === 'pulse');
    // swipe the strip: it moves, the page does not
    await p.evaluate(() => { document.getElementById('fuStrip').scrollLeft = 0; }); const sr = await p.evaluate(() => { const r = document.getElementById('fuStrip').getBoundingClientRect(); return { x: r.left + r.width * .8, y: r.top + r.height / 2 }; });
    const mv = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
    await mv('touchStart', sr.x, sr.y); for (let i = 1; i <= 12; i++) { await mv('touchMove', sr.x - i * 15, sr.y - i * 4); await sleep(20); } await mv('touchEnd'); await sleep(600);
    t.swipe = await p.evaluate(() => ({ sx: document.getElementById('fuStrip').scrollLeft, y: scrollY, box: document.getElementById('gaCards').scrollTop }));
    await tap('#fuStrip [data-it="w:laser"]', 650); t.hold = await p.evaluate(() => !!document.getElementById('fuSheet') && /LASER/.test(document.getElementById('fuSheet').textContent));
    line(t.a === 'pulse' && t.b === 'swarm' && t.made && t.sel === 'h:seedfan' && t.eq, 'touch: card -> slot A, card -> slot B, MERGE, ship slot 1 equips the new hybrid', JSON.stringify(t));
    line(t.swipe.sx > 20 && t.swipe.y === 0 && t.swipe.box === 0 && t.hold, 'touch: swipe moves only the strip; hold opens the info sheet', JSON.stringify(t.swipe) + ' hold ' + t.hold);
    await p.ctx.close(); }
  // 4 flag off
  { const o = await page('&forge2=0', { width: 390, height: 763 }); await o.evaluate(OPEN); await sleep(300);
    const r = await o.evaluate(() => ({ fu: !!document.getElementById('fuForge') && document.getElementById('gaCards').classList.contains('fu'), f2: document.getElementById('gaCards').classList.contains('f2') || document.getElementById('garage').classList.contains('f2'), grid: !!document.querySelector('#gaCards .fu-grid') }));
    line(r.fu && r.grid && !r.f2, '?forge2=0: the forgeui screen, untouched', JSON.stringify(r)); await o.ctx.close(); }
  line(!errs.length, 'no page errors', errs.slice(0, 3).join(' | '));
  await br.close(); srv.kill(); console.log(fails ? `${fails} FAILED` : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch(e => { console.log('FAIL crash :: ' + e.message); process.exit(1); });
