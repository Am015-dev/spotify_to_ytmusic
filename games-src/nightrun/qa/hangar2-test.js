#!/usr/bin/env node
// HANGAR2 (parts/menus/hangar2.js, flag RET.hangar2): ship bay with 4 stat bars + slots, 4 big tabs (FORGE in MORE), no filter chips,
// PC: tiles >= 64 px icons, right panel shows the selected tile, its button = the old card click; phone: text >= 14 px; ?hangar2=0 = old. PASS/FAIL only.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/hangar2-test.js
const { boot, open, sleep, ok, done } = require('./lib.js');
const SEED = { mnr_bank: '140', mnr_tut: '2' };
const fs = require('fs'), crypto = require('crypto'), MEDIA = require('path').join(require('./lib.js').GAME_DIR, 'media');
// H2 gates, every main tab: no debug size text (e.g. '256x256'), smallest visible text, no faded tile (effective opacity), weapon icons not placeholders
const scan = (p, minPx) => p.evaluate(async (minPx) => {
  const out = [];
  for (const t of ['ships', 'weapons', 'pilot', 'tune']) {
    document.querySelector('#garage .tabs button[data-t="' + t + '"]').click(); await new Promise(r => setTimeout(r, 250));
    const root = document.getElementById('garage'); let small = null;
    for (const e of root.querySelectorAll('*')) { if (!e.offsetParent || e.closest('#mfSheet')) continue;
      const own = [...e.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim(); if (!own) continue;
      const r = e.getBoundingClientRect(); if (r.width < 1 || r.bottom < 0 || r.top > innerHeight) continue;
      if (/\d+x\d+/.test(own)) out.push(t + ': debug text "' + own.slice(0, 30) + '"');
      const fs = parseFloat(getComputedStyle(e).fontSize); if (fs < minPx && (!small || fs < small[0])) small = [fs, own.slice(0, 24), e.className]; }
    if (small) out.push(t + ': text ' + small[0] + 'px "' + small[1] + '" .' + small[2]);
    for (const c of root.querySelectorAll('#gaCards .card, #gaCards .clsC, #gaCards .clsN')) { if (!c.offsetParent) continue; let o = 1;
      for (let x = c; x && x !== document.body; x = x.parentElement) o *= +getComputedStyle(x).opacity;
      for (const k of c.querySelectorAll('*')) { let ok = +getComputedStyle(k).opacity; if (ok * o < .85 && k.offsetParent && (k.textContent.trim() || k.tagName === 'CANVAS' || k.tagName === 'IMG')) { o = Math.min(o, ok * o); } }
      if (o < .85) { out.push(t + ': tile opacity ' + o.toFixed(2) + ' ' + (c.textContent || '').trim().slice(0, 20)); break; } } }
  return out; }, minPx);
(async () => {
  { const ready = JSON.parse(fs.readFileSync(MEDIA + '/ready.json')), ph = JSON.parse(fs.readFileSync(MEDIA + '/placeholders.json'));
    const bad = ready.filter(f => /^wp-/.test(f) && ph[f] === crypto.createHash('md5').update(fs.readFileSync(MEDIA + '/' + f)).digest('hex'));
    ok('no placeholder weapon picture is listed as real art (media/ready.json)', !bad.length, bad.join(',')); }
  const b = await boot();
  try {
    { const p = await open(b.br, b.base, 1440, 860, '?nomusic=1', SEED, false);
      await p.evaluate(() => { __hub.hangar(); document.querySelector('#garage .tabs button[data-t="tune"]').click(); }); await sleep(300);
      const r = await p.evaluate(() => { const vis = e => e && e.offsetParent !== null; const tabs = [...document.querySelectorAll('#garage .tabs button')].filter(vis).map(x => x.dataset.t || x.id);
        const c = document.querySelector('#gaCards .card'), ic = c.querySelector(':scope>svg,:scope>img,:scope>canvas').getBoundingClientRect();
        return { tabs, bay: vis(document.getElementById('h2Bay')), stats: document.querySelectorAll('#h2St i').length, pane: vis(document.getElementById('h2Pane')), chips: vis(document.querySelector('#gaCards .gfBar')), ic: Math.min(ic.width, ic.height), mf: !!document.getElementById('mfI_forge') }; });
      ok('PC: 4 big tabs + MORE, FORGE moved to the MORE sheet', r.tabs.length === 5 && !r.tabs.includes('forge') && r.mf, JSON.stringify(r.tabs));
      ok('PC: ship bay with 4 stat bars, right panel shown, no filter chips', r.bay && r.stats === 4 && r.pane && !r.chips, JSON.stringify(r));
      ok('PC: tile icons >= 64 px', r.ic >= 64, r.ic);
      const bank0 = await p.evaluate(() => +document.getElementById('gaBankN').textContent.replace(/\D/g, ''));
      const box = await p.locator('#gaCards .card[data-id="tp_rof"]').boundingBox(); await p.mouse.click(box.x + box.width / 2, box.y + box.height / 2); await sleep(200);
      const s = await p.evaluate(() => ({ sel: __h2.sel(), h: document.querySelector('#h2Pane h3').textContent, bank: +document.getElementById('gaBankN').textContent.replace(/\D/g, '') }));
      ok('PC: a click on a tile selects it (no purchase)', s.sel === 'tune:tp_rof' && /Rapid/.test(s.h) && s.bank === bank0, JSON.stringify(s));
      await p.click('#h2Buy'); await sleep(200);
      const bank1 = await p.evaluate(() => +document.getElementById('gaBankN').textContent.replace(/\D/g, ''));
      ok('PC: the panel button buys (old card click)', bank1 < bank0, bank0 + ' -> ' + bank1);
      const g = await scan(p, 15); ok('PC: every tab: no debug size text, text >= 15 px, tiles opacity >= .85', !g.length, g.join(' | '));
      await p.evaluate(() => document.querySelector('#garage .tabs button[data-t="pilot"]').click()); await sleep(250);
      const pl = await p.evaluate(() => ({ tiles: document.querySelectorAll('#gaCards .clsC').length, bars: document.querySelectorAll('#h2Pane .ps i').length, h: (document.querySelector('#h2Pane h3') || {}).textContent, btn: (document.getElementById('h2Buy') || {}).textContent }));
      ok('PC: PILOT = class tiles + the class in the panel (3 worded bars, one pick button)', pl.tiles >= 4 && pl.bars === 3 && !!pl.h && /PICK|PICKED|YOUR/i.test(pl.btn || ''), JSON.stringify(pl));
      const sw = await p.evaluate(() => { const b = document.querySelector('#h2St i b'); return b ? parseFloat(b.style.width) : 0; });
      ok('PC: starter ship stat bar reads 30-40 %', sw >= 30 && sw <= 40, sw);
      ok('PC: no page errors', !p.errs.length, p.errs.join(' | ')); await p.context().close(); }
    { const p = await open(b.br, b.base, 390, 763, '?nomusic=1', SEED, true);
      await p.evaluate(() => { __hub.hangar(); document.querySelector('#garage .tabs button[data-t="tune"]').click(); }); await sleep(300);
      const r = await p.evaluate(() => { let min = 99; for (const e of document.querySelectorAll('#garage .tabs button, #h2Bay .slot, #gaCards .card .n, #gaCards .card .t')) { if (!e.offsetParent) continue; min = Math.min(min, parseFloat(getComputedStyle(e).fontSize)); } return { min, bay: !!document.getElementById('h2Bay').offsetParent }; });
      ok('phone: bay on top, tab / slot / tile text >= 14 px', r.bay && r.min >= 14, JSON.stringify(r));
      const g = await scan(p, 14); ok('phone: every tab: no debug size text, text >= 14 px, tiles opacity >= .85', !g.length, g.join(' | '));
      ok('phone: no page errors', !p.errs.length, p.errs.join(' | ')); await p.context().close(); }
    { const p = await open(b.br, b.base, 1440, 860, '?nomusic=1&hangar2=0', SEED, false);
      await p.evaluate(() => __hub.hangar()); await sleep(300);
      ok('?hangar2=0: no bay, the old hangar', await p.evaluate(() => !document.getElementById('h2Bay')));
      ok('?hangar2=0: no page errors', !p.errs.length, p.errs.join(' | ')); await p.context().close(); }
  } finally { await b.close(); }
  done('hangar2');
})();
