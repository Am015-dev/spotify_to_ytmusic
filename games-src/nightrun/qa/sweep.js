#!/usr/bin/env node
// (f) text overflow + (g) phone sweep: every DOM screen opens at 375x553, 390x763, 844x390;
//   (g) no visible element outside the viewport (scroll boxes and full-screen backdrops excepted), no sideways page scroll, nothing throws;
//   (f) every visible text fits its box: not cut by overflow:hidden (scrollWidth/Height), not sticking out of its button / card, no "..." ellipsis on a label.
// Canvas text (HUD, banners) is covered by ui-align-test.js (qa.sh runs it on the canvas screens).
const { boot, open, ok, done, sleep } = require('./lib');
const VPS = [[375, 553], [390, 763], [844, 390]];
const menu = async p => { await p.evaluate(() => { if (window.RET && RET.menuOpen) RET.menuOpen(); }); await sleep(150); };
const run = async p => { await p.evaluate(() => document.getElementById('startBtn').click()); await p.waitForFunction(() => __mnr.running, null, { timeout: 6000 }); await p.evaluate(() => { __mnr.god = true; }); await sleep(900); };
const garage = tab => async p => { await p.evaluate(() => (document.getElementById('hub_hangar') || document.getElementById('gaBtn')).click()); await sleep(450); if (tab) { const b = await p.$(`#garage .tabs button[data-t="${tab}"]`); if (!b) throw new Error('no tab ' + tab); await b.click({ force: true }); await sleep(350); } };
const SCREENS = [
  ['title', async p => { }],
  ['menu', menu],
  ['settings', async p => { await menu(p); await p.click('#setBtn'); await sleep(300); }],
  ['settings-end', async p => { await menu(p); await p.click('#setBtn'); await sleep(300); await p.evaluate(() => { const b = document.getElementById('setBody'); if (b) b.scrollTop = 1e6; }); await sleep(200); }],
  ['story-map', async p => { await menu(p); await p.click('#storyBtn'); await sleep(600); }],
  ['story-stage', async p => { await p.evaluate(() => { __mnr.sSave.all = true; __mnr.startStory(1); }); await sleep(900); }],
  ['story-fail', async p => { await p.evaluate(() => { __mnr.sSave.all = true; __mnr.startStory(1); }); await sleep(700); await p.evaluate(() => __mnr.ST.fail()); await sleep(900); }],
  ['run', run],
  ['pause', async p => { await run(p); await p.keyboard.press('Escape'); await sleep(400); }],
  ['pit-shop', async p => { await run(p); await p.evaluate(() => { __mnr.SH.neon = 200; __mnr.SH.pit(() => { }); }); await sleep(900); }],
  ['game-over', async p => { await run(p); await p.evaluate(() => { __mnr.god = false; __mnr.hurt(99); __mnr.G.deadT = 9; }); await sleep(1800); }],
  ...['', 'ships', 'crew', 'looks', 'load', 'mkt', 'forge', 'pilot'].map(t => ['garage' + (t ? '-' + t : ''), garage(t)]),
  ...['foes', 'items', 'cheats'].map(t => ['lab-' + t, async p => { await menu(p); await p.click('#labBtn'); await sleep(900); await p.click('#labTab_' + t); await sleep(300); }]),
];
function audit() {
  const vw = innerWidth, vh = innerHeight, g = [], f = [];
  const d = e => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/)[0] : '');
  const vis = e => { for (let x = e; x && x !== document.documentElement; x = x.parentElement) { const c = getComputedStyle(x); if (c.display === 'none' || c.visibility === 'hidden' || +c.opacity < .05 || x.hidden) return false; } return true; };
  const IGN = e => e.closest('#fpsEl,#nrChk,script,style,[data-ui-ignore],canvas');
  const inScroll = e => { for (let x = e.parentElement; x && x !== document.body; x = x.parentElement) { const c = getComputedStyle(x); if (/auto|scroll/.test(c.overflowX + c.overflowY) && (x.scrollHeight > x.clientHeight + 1 || x.scrollWidth > x.clientWidth + 1)) return true; } return false; };
  if (document.documentElement.scrollWidth > vw + 1) g.push(`page scrolls sideways (${document.documentElement.scrollWidth} > ${vw})`);
  for (const e of document.body.querySelectorAll('*')) {
    if (IGN(e) || !vis(e)) continue; const r = e.getBoundingClientRect(); if (r.width < 1 || r.height < 1) continue;
    const own = [...e.childNodes].some(n => n.nodeType === 3 && n.nodeValue.trim()), tag = e.tagName, ctl = /^(BUTTON|INPUT|SELECT|IMG|A)$/.test(tag) || e.getAttribute('role') === 'button';
    if ((own || ctl) && !inScroll(e)) { const out = r.left < -2 || r.top < -2 || r.right > vw + 2 || r.bottom > vh + 2; const big = r.width >= vw - 4 && r.height >= vh - 4;
      if (out && !big && getComputedStyle(e).position !== 'fixed' || out && !big) g.push(`${d(e)} "${(e.textContent || e.alt || '').trim().slice(0, 24)}" outside the screen [${[r.left, r.top, r.right, r.bottom].map(Math.round)}] vs ${vw}x${vh}`); }
    if (own) { const c = getComputedStyle(e), tx = (e.textContent || '').trim().slice(0, 26);
      const clipsX = /hidden|clip/.test(c.overflowX), clipsY = /hidden|clip/.test(c.overflowY);
      if (clipsX && e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 0) f.push(`"${tx}" in ${d(e)} is cut: ${e.scrollWidth} px of text in ${e.clientWidth}`);
      else if (clipsY && e.scrollHeight > e.clientHeight + 2 && e.clientHeight > 0 && !/auto|scroll/.test(c.overflowY)) f.push(`"${tx}" in ${d(e)} is cut: ${e.scrollHeight} px tall in ${e.clientHeight}`);
      if (c.textOverflow === 'ellipsis' && e.scrollWidth > e.clientWidth + 1) f.push(`"${tx}" in ${d(e)} ends in "..."`);
      const pl = e.closest('button,[role=button],.card,.chk,.sl'); let plScroll = false; for (let x = e; pl && x && x !== pl; x = x.parentElement) if (/auto|scroll/.test(getComputedStyle(x).overflowY)) plScroll = true; if (pl && c.position !== 'absolute') {   /* inside a scroll box only left/right can be judged */ const rg = document.createRange(); rg.selectNodeContents(e); const t = rg.getBoundingClientRect(), pr = pl.getBoundingClientRect(); if (t.width && (t.left < pr.left - 2 || t.right > pr.right + 2 || (!plScroll && (t.top < pr.top - 2 || t.bottom > pr.bottom + 2)))) f.push(`"${tx}" sticks out of ${d(pl)} [text ${[t.left, t.top, t.right, t.bottom].map(Math.round)} box ${[pr.left, pr.top, pr.right, pr.bottom].map(Math.round)}]`); } }
  }
  return { g: [...new Set(g)], f: [...new Set(f)] };
}
(async () => {
  const B = await boot(); const W = { g: {}, f: {} }; let n = 0, unreach = [];
  await Promise.all(VPS.map(async ([vw, vh]) => { for (const [name, setup] of SCREENS) {
    if (process.env.ONLY && !name.startsWith(process.env.ONLY)) continue;
    const p = await open(B.br, B.base, vw, vh, '', { mnr_story: '{"stars":{"1":3,"2":2},"snap":{},"all":true}' });
    try { await setup(p); await sleep(250); const r = await p.evaluate(audit); n++;
      for (const m of r.g) (W.g[`${vw}x${vh} ${name}`] = W.g[`${vw}x${vh} ${name}`] || []).push(m); for (const m of r.f) (W.f[`${vw}x${vh} ${name}`] = W.f[`${vw}x${vh} ${name}`] || []).push(m);
      if (p.errs.length) (W.g[`${vw}x${vh} ${name}`] = W.g[`${vw}x${vh} ${name}`] || []).push('page error: ' + p.errs[0]);
    } catch (e) { unreach.push(`${vw}x${vh} ${name}: ${String(e.message).split('\n')[0].slice(0, 80)}`); }
    await p.context().close();
  } }));   // the 3 sizes run side by side (no timing is measured here)
  ok(`all ${n} screen openings reachable (3 sizes)`, !unreach.length && (n >= 60 || process.env.ONLY), unreach.slice(0, 4).join(' | '));
  const rep = (label, o) => { const ks = Object.keys(o); ok(label, !ks.length, ks.slice(0, 6).map(k => k + ': ' + o[k][0]).join(' || ')); for (const k of ks) for (const m of o[k].slice(0, 6)) console.log(`  ${label.split(':')[0]} ${k}: ${m}`); };
  rep('phone sweep: no element outside the viewport, no sideways scroll', W.g);
  rep('text overflow: every visible text fits its box', W.f);
  await B.close(); done('sweep');
})().catch(e => { console.log('FAIL sweep crash :: ' + e.message); process.exit(1); });
