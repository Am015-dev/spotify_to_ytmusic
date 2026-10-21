#!/usr/bin/env node
// Forge screen test (flag RET.forgeui, parts/forgeui.js). Prints pass/fail lines only.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/forgeui-test.js        env: GAME_DIR=...
// 1 layout at 390x763, 375x553, 844x390, 1280x800: three zones, lesson hooks, targets >= 44 px, text >= 12 px, no side scroll, cards and slots do not overlap
// 2 select: tap a card then slot A / B, and tap a slot then a card; the preview shows the hybrid, recipe, deltas (red damage, green effects), good-against line
// 3 disabled reasons: one weapon, no recipe, not enough Neon, not enough scrap; MERGE disabled with the reason shown
// 4 merge pays the cost, UNDO gives it back, merge again, equip the hybrid in loadout slot 1 (WP.eq follows), EQUIPPED chip filter, stage badge
// 5 saves intact over a reload; ?forgeui=0 shows the old screen; no page errors (pinned to &forge2=0: the one-screen forge has its own forge2-test.js)
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0; const line = (ok, s, info) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + s + (ok || info == null ? '' : ' :: ' + info)); };
const OPEN = () => { const { FG } = window.__fg, GA = window.__ga.GA, s = FG.st(); s.scrap = 10; GA.bank = 1000; FG.save();
  for (const id of ['pulse', 'swarm', 'laser', 'beat', 'disc']) window.__wp.perm(id, 2);
  window.__inv.open('title'); const t = document.querySelector('#garage .tabs button[data-t=forge]'); if (!t) return 'no FORGE tab'; t.click(); return ''; };
const LAYOUT = () => {   // 1
  const box = document.getElementById('gaCards'), bw = box.getBoundingClientRect(), out = [];
  for (const id of ['fuForge', 'fuInv', 'fuLoad', 'fuSlotA', 'fuSlotB', 'fuOut', 'fuMerge']) if (!document.getElementById(id)) out.push('missing #' + id);
  for (const k of ['forge-slot-a', 'forge-slot-b', 'forge-merge', 'forge-out', 'forge-preview', 'forge-inventory', 'forge-filter']) if (!box.querySelector(`[data-lesson="${k}"]`)) out.push('no data-lesson ' + k);
  if (box.querySelectorAll('[data-lesson="loadout-slot"]').length !== 4) out.push('loadout-slot hooks != 4');
  if (box.scrollWidth > box.clientWidth + 2 || document.documentElement.scrollWidth > innerWidth + 1) out.push('side scroll');
  for (const t of box.querySelectorAll('button,input')) { if (!t.offsetParent) continue; const r = t.getBoundingClientRect(); if (r.height < 43.5 || r.width < 43.5) { out.push('small target ' + (t.textContent || t.tagName).trim().slice(0, 24) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height)); break; } if (r.right > bw.right + 1 || r.left < bw.left - 1) { out.push('outside ' + (t.textContent || '').trim().slice(0, 24)); break; } }
  const w = document.createTreeWalker(box, NodeFilter.SHOW_TEXT); for (let n; (n = w.nextNode());) { if (!n.textContent.trim() || !n.parentElement.offsetParent) continue; const fs = parseFloat(getComputedStyle(n.parentElement).fontSize); if (fs < 12) { out.push('text ' + fs + 'px ' + n.textContent.trim().slice(0, 20)); break; } }
  const ov = sel => { const g = [...box.querySelectorAll(sel)].filter(e => e.offsetParent).map(e => e.getBoundingClientRect()); for (let i = 0; i < g.length; i++) for (let j = i + 1; j < g.length; j++) { const a = g[i], b = g[j]; if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) return true; } return false; };
  if (ov('.fu-card')) out.push('cards overlap'); if (ov('.fu-slot,.fu-op')) out.push('forge slots overlap'); if (ov('.fgslot')) out.push('loadout slots overlap');
  for (const e of box.querySelectorAll('.fu-card,.fu-slot,.fu-b')) if (e.offsetParent && e.scrollWidth > e.clientWidth + 2) { out.push('text spills ' + e.textContent.trim().slice(0, 20)); break; }
  return out;
};
const FLOW = () => {   // 2-4, by real clicks
  const { FG } = window.__fg, GA = window.__ga.GA, U = window.__fgu, s = FG.st(), out = {}, $ = id => document.getElementById(id), card = it => document.querySelector(`#gaCards .fu-card[data-it="${it}"]`);
  const chip = f => document.querySelector(`#gaCards .fu-chips [data-f="${f}"]`);
  U.a = U.b = null; U.arm = null; U.undo = null; window.INV.sel = null; chip('w').click();
  // 3 one weapon only
  card('w:pulse').click(); out.bar = !!$('fuBar'); $('fuSlotA').click(); out.a = U.a;
  out.why1 = $('fuMerge').disabled && /2 weapons/.test(($('fuWhy') || {}).textContent || '');
  // 2 tap a slot first, then a card
  $('fuSlotB').click(); card('w:laser').click(); out.b1 = U.b; out.whyRec = $('fuMerge').disabled && /No recipe/.test(($('fuWhy') || {}).textContent || '');
  // the partner chip for swarm
  const pc = [...document.querySelectorAll('#fuForge .fu-b')].find(b => /SWARM/.test(b.textContent)); out.partner = !!pc; if (pc) pc.click(); out.b2 = U.b;
  const pv = $('fuPrev'); out.name = /SEED FAN/.test(pv.textContent); out.recipe = /PULSE \+ SWARM/.test(pv.textContent); out.good = /Good against: \S/.test(pv.textContent);
  const dd = pv.querySelector('[data-delta=dmg]'), df = pv.querySelector('[data-delta=fx]'); out.deltas = !!dd && dd.classList.contains('dn') && !!df && df.classList.contains('up');
  out.cost = /3 scrap \+ 120 Neon/.test(pv.textContent); out.ready = !$('fuMerge').disabled;
  GA.bank = 50; window.__inv.draw(); out.whyNeon = $('fuMerge').disabled && /Neon/.test($('fuWhy').textContent); GA.bank = 1000;
  s.scrap = 1; window.__inv.draw(); out.whyScrap = $('fuMerge').disabled && /scrap/.test($('fuWhy').textContent); s.scrap = 10; window.__inv.draw();
  // 4 merge, undo, merge, equip
  const b0 = GA.bank, s0 = s.scrap; $('fuMerge').click(); out.made = !!s.hy.seedfan && GA.bank === b0 - 120 && s.scrap === s0 - 3;
  out.undoBtn = !!$('fuUndo'); if ($('fuUndo')) $('fuUndo').click(); out.undone = !s.hy.seedfan && GA.bank === b0 && s.scrap === s0;
  $('fuMerge').click(); out.made2 = !!s.hy.seedfan; out.selHy = window.INV.sel === 'h:seedfan';
  document.querySelector('#gaCards .fgslot[data-slot="0"] button').click(); out.equip = s.lo.w[0] === 'h:seedfan' && window.__wp.eq[0] === 'pulse';
  chip('eq').click(); const cs = [...document.querySelectorAll('#gaCards .fu-card')]; out.eqFilter = cs.length > 0 && cs.every(c => c.querySelector('.fu-tag.eq'));
  chip('all').click(); out.badge = document.querySelectorAll('#gaCards .fu-tag.rec').length; out.tiles = document.querySelectorAll('#gaCards .fgt').length;
  return out;
};
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await sleep(800); const br = await PW.chromium.launch(), errs = [], U = q => `http://127.0.0.1:${port}/index.html?nomusic=1&forge2=0${q || ''}`;
  const page = async (q, vp, touch) => { const ctx = await br.newContext({ viewport: vp, hasTouch: !!touch, isMobile: !!touch }); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(() => { try { localStorage.setItem('mnr_tut', '1'); localStorage.setItem('mnr_tipdone', 'true'); localStorage.setItem('mnr_fscard', '99'); } catch (e) { } });
    await p.goto(U(q)); await p.waitForFunction(() => window.__mnr && window.__fg && window.__inv && window.__fgu, null, { timeout: 15000 }); await sleep(600); p.ctx = ctx; return p; };
  for (const [w, h, t] of [[390, 763, 1], [375, 553, 1], [844, 390, 1], [1280, 800, 0]]) {
    const p = await page('', { width: w, height: h }, t), m = await p.evaluate(OPEN); await sleep(300);
    let r = m ? [m] : await p.evaluate(LAYOUT);
    // the same with a card selected (action bar) and with a hybrid in the forge
    if (!m) { await p.evaluate(() => { window.INV.sel = 'w:pulse'; window.__fgu.a = 'pulse'; window.__fgu.b = 'swarm'; window.__inv.draw(); }); r = r.concat(await p.evaluate(LAYOUT)); }
    line(!r.length, `layout ${w}x${h}: three zones, lesson hooks, targets >= 44 px, text >= 12 px, no overlap, no side scroll`, r.slice(0, 4).join(' | '));
    await p.ctx.close();
  }
  const p = await page('', { width: 390, height: 763 }, 1); await p.evaluate(OPEN); await sleep(300); const f = await p.evaluate(FLOW);
  line(f.bar && f.a === 'pulse' && f.b1 === 'laser' && f.b2 === 'swarm', 'select: card then slot A, slot B then card, partner chip fills B', JSON.stringify([f.bar, f.a, f.b1, f.b2]));
  line(f.name && f.recipe && f.deltas && f.good && f.cost && f.ready, 'preview: SEED FAN, recipe PULSE + SWARM, red damage / green effects deltas, good-against, cost line', JSON.stringify(f));
  line(f.why1 && f.whyRec && f.whyNeon && f.whyScrap, 'disabled reasons: needs 2 weapons, no recipe, not enough Neon, not enough scrap', JSON.stringify([f.why1, f.whyRec, f.whyNeon, f.whyScrap]));
  line(f.made && f.undoBtn && f.undone && f.made2, 'merge pays 3 scrap + 120 Neon; UNDO gives both back; merge again', JSON.stringify([f.made, f.undoBtn, f.undone, f.made2]));
  line(f.selHy && f.equip, 'loadout: the new hybrid is selected, tap slot 1 equips it (fires as PULSE)', JSON.stringify([f.selHy, f.equip]));
  line(f.eqFilter && f.badge >= 1 && f.tiles >= 20, `chips: EQUIPPED shows only equipped cards; ${f.badge} stage badge(s); ${f.tiles} cards under ALL`);
  await p.reload(); await p.waitForFunction(() => window.__fg && window.__ga, null, { timeout: 15000 });
  const sv = await p.evaluate(() => { const { FG } = window.__fg; FG.s = null; const s = FG.st(); return { hy: !!s.hy.seedfan, w0: s.lo.w[0], eq: window.__wp.eq[0], bank: window.__ga.GA.bank }; });
  line(sv.hy && sv.w0 === 'h:seedfan' && sv.eq === 'pulse' && sv.bank === 880, 'saves intact over a reload (hybrid, loadout, Neon)', JSON.stringify(sv));
  await p.ctx.close();
  const o = await page('&forgeui=0', { width: 390, height: 763 }, 1); await o.evaluate(OPEN); await sleep(300);
  const old = await o.evaluate(() => ({ old: !!document.getElementById('fgA') && !!document.getElementById('fgGo'), neu: !!document.getElementById('fuForge') }));
  line(old.old && !old.neu, '?forgeui=0: the old forge screen', JSON.stringify(old)); await o.ctx.close();
  line(!errs.length, 'no page errors', errs.slice(0, 3).join(' | '));
  await br.close(); srv.kill(); console.log(fails ? `${fails} FAILED` : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch(e => { console.log('FAIL crash :: ' + e.message); process.exit(1); });
