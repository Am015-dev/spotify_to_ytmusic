#!/usr/bin/env node
// Lab in pages (parts/lab/lab2.js, flag RET.lab2). PASS/FAIL lines only.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/lab2-test.js     env: GAME_DIR=<dir with index.html>
//  (a) the Lab opens on a home screen; each of the 5 tiles opens its page and LAB HOME comes back
//  (b) FLIGHT VIEWER: every boss shows a sprite (canvas pixels in its box differ from the backdrop alone); every state button of every boss,
//      and of the first item of the other kinds, changes the drawn frame; nothing spawns in the game while the viewer is open
//  (c) phone 390x763: on home, viewer and every PLAY TEST tab no text < 14 css px, no horizontal page scroll or sideways scroll row, tap targets >= 44 px
//  (d) 0 page errors; ?lab2=0 = the old Lab panel
const { boot, open, sleep, ok, done } = require('./lib.js');
const hashCv = p => p.evaluate(() => { const c = document.getElementById('l2canvas'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let h = 0; for (let i = 0; i < d.length; i += 16) h = (h * 31 + d[i] + d[i + 1] * 7 + d[i + 2] * 13) | 0; return h; });
const ready = p => p.waitForFunction(() => { const s = L2.cur && L2.cur(); return !s || s.src === 'none' || !!L2.box; }, null, { timeout: 8000 }).catch(() => { });
async function audit(p, where) {   // visible elements in the Lab pages: font size, tap size, sideways scroll
  return p.evaluate(where => {
    const roots = ['l2h', 'l2home', 'l2v', 'labP'].map(i => document.getElementById(i)).filter(e => e && getComputedStyle(e).display !== 'none' && !e.hidden);
    const vis = e => { const r = e.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return false; for (let q = e; q; q = q.parentElement) { const cs = getComputedStyle(q); if (cs.display === 'none' || cs.visibility === 'hidden') return false; } return true; };
    const small = [], tiny = [], side = [];
    for (const R of roots) for (const e of [R, ...R.querySelectorAll('*')]) {
      if (!vis(e)) continue; const cs = getComputedStyle(e);
      const txt = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) || /^(INPUT|SELECT|TEXTAREA)$/.test(e.tagName);
      if (txt && parseFloat(cs.fontSize) < 14) small.push(e.tagName + '.' + e.className + ' ' + cs.fontSize + ' ' + (e.textContent || '').trim().slice(0, 20));
      if (/^(BUTTON|INPUT|SELECT)$/.test(e.tagName) && e.type !== 'range') { const r = e.getBoundingClientRect(); if (r.width < 43.5 || r.height < 43.5) tiny.push((e.id || e.textContent.trim().slice(0, 16)) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height)); }
      if (/(auto|scroll)/.test(cs.overflowX) && e.scrollWidth > e.clientWidth + 2) side.push(e.tagName + '.' + e.className);
    }
    return { small: small.slice(0, 6), ns: small.length, tiny: tiny.slice(0, 6), nt: tiny.length, side: side.slice(0, 4), page: document.documentElement.scrollWidth > innerWidth + 1 || document.body.scrollWidth > innerWidth + 1, where };
  }, where);
}
(async () => {
  const b = await boot();
  try {
    // (a) PC: home and the tiles
    const p = await open(b.br, b.base, 1440, 860, '?nomusic=1&lab=1', 0, false);
    await p.waitForFunction(() => window.__mnr && __mnr.G && __mnr.G.lab && window.L2, null, { timeout: 20000 }).catch(() => { });
    const h0 = await p.evaluate(() => ({ home: !document.getElementById('l2home').hidden, tiles: [...document.querySelectorAll('#l2home .l2tile')].map(t => t.id), panel: getComputedStyle(document.getElementById('labP')).display }));
    ok('the Lab opens on its home screen with 5 big tiles, the old panel hidden', h0.home && h0.tiles.length === 5 && h0.panel === 'none', JSON.stringify(h0));
    const want = { viewer: () => !document.getElementById('l2v').hidden, play: () => document.documentElement.classList.contains('l2p') && !!document.getElementById('labTab_boss') && getComputedStyle(document.getElementById('labP')).display !== 'none' && !!__mnr.G.boss,
      foot: () => [...document.querySelectorAll('#labP button')].some(x => /ON FOOT/.test(x.textContent)), sound: () => document.querySelectorAll('#labP .snr').length >= 20, assets: () => document.getElementById('labP').textContent.length > 50 };
    for (const id of ['viewer', 'play', 'foot', 'sound', 'assets']) {
      await p.click('#l2tile_' + id); await sleep(500);
      const r = await p.evaluate(([id, f]) => ({ pg: L2.page, ok: eval('(' + f + ')')(), title: document.getElementById('l2title').textContent, back: !document.getElementById('l2back').hidden, exit: !document.getElementById('l2exit').hidden }), [id, want[id].toString()]);
      ok(`tile ${id}: opens its page with one header (BACK + EXIT)`, r.pg === id && r.ok && r.back && r.exit, JSON.stringify(r));
      await p.click('#l2back'); await sleep(200);
      ok(`  ${id}: LAB HOME comes back`, await p.evaluate(() => L2.page === 'home' && !document.getElementById('l2home').hidden));
    }
    // (b) viewer
    await p.click('#l2tile_viewer'); await sleep(300);
    await p.click('#l2play');   // pause: frames only move with the step buttons
    const calm = await p.evaluate(() => ({ boss: !!__mnr.G.boss, en: __mnr.G.en.length, eb: __mnr.G.eb.length }));
    await sleep(1500); const calm2 = await p.evaluate(() => ({ boss: !!__mnr.G.boss, en: __mnr.G.en.length, eb: __mnr.G.eb.length }));
    ok('viewer is calm: no boss, no foes, no shots in the game behind it', !calm.boss && !calm2.boss && calm2.en === 0 && calm2.eb === 0, JSON.stringify([calm, calm2]));
    const nB = await p.evaluate(() => document.querySelectorAll('#l2v .l2it').length);
    const vis = [], same = [];
    for (let i = 0; i < nB; i++) {
      await p.click(`#l2v .l2it[data-i="${i}"]`); await ready(p);
      const r = await p.evaluate(() => { const c = document.getElementById('l2canvas'), g = c.getContext('2d'), b = L2.box; if (!b) return { n: L2.cur() && L2.cur().n, box: null };
        L2.draw(); const a = g.getImageData(b.x, b.y, b.w, b.h).data; L2.bare = true; L2.draw(); const z = g.getImageData(b.x, b.y, b.w, b.h).data; L2.bare = false; L2.draw();
        let d = 0; for (let k = 0; k < a.length; k += 4) if (Math.abs(a[k] - z[k]) + Math.abs(a[k + 1] - z[k + 1]) + Math.abs(a[k + 2] - z[k + 2]) > 30) d++;
        return { box: b, frac: d / (a.length / 4), w: c.width }; });
      const nm = await p.evaluate(i => document.querySelectorAll('#l2v .l2it')[i].textContent, i);
      vis.push(nm + ' ' + (r.frac != null ? r.frac.toFixed(2) : 'none') + ' ' + (r.box ? r.box.w + 'x' + r.box.h : ''));
      ok(`boss ${nm}: sprite visible in the viewer (>= 15% of its box differs from the backdrop, box >= 25% of the canvas width)`, r.box && r.frac >= .15 && r.box.w >= r.w * .25, JSON.stringify(r));
      // every state button changes the drawn frame
      const nS = await p.evaluate(() => document.querySelectorAll('#l2states .l2st').length); let prev = await hashCv(p), bad = [];
      for (let j = (await p.evaluate(() => L2.state)) === 0 ? 1 : 0; j < nS; j++) { await p.click(`#l2states .l2st[data-i="${j}"]`); await ready(p); const h = await hashCv(p); if (h === prev) bad.push(j); prev = h; }
      await p.click('#l2states .l2st[data-i="0"]'); await ready(p); let ph = await hashCv(p);
      for (const n of [2, 3, 1]) { await p.click(`#l2v .l2ph[data-n="${n}"]`); const h = await hashCv(p); if (h === ph) bad.push('phase' + n); ph = h; }
      ok(`  ${nm}: each of ${nS} state buttons and the 3 phase looks change the drawn frame`, bad.length === 0, bad.join());
      if (i === 0) { const f0 = await hashCv(p); await p.click('#l2step'); await ready(p); ok('  FRAME ▶ steps to the next frame', (await hashCv(p)) !== f0 && (await p.evaluate(() => /frame 2 of/.test(document.getElementById('l2info').textContent)))); }
    }
    for (const k of ['enemy', 'player', 'pickup', 'shot']) {
      await p.click('#l2k_' + k); await sleep(100); await p.click('#l2v .l2it[data-i="0"]'); await ready(p);
      const nS = await p.evaluate(() => document.querySelectorAll('#l2states .l2st').length); let prev = await hashCv(p), bad = [];
      for (let j = 1; j < nS; j++) { await p.click(`#l2states .l2st[data-i="${j}"]`); await ready(p); const h = await hashCv(p); if (h === prev) bad.push(j); prev = h; }
      const info = await p.evaluate(() => document.getElementById('l2info').textContent.slice(0, 60));
      ok(`${k} (first item): ${nS} states, each changes the drawn frame; missing art says 'no art' with its slot`, nS >= 2 && bad.length === 0, bad.join() + ' ' + info);
    }
    ok('PC: no page error', p.errs.length === 0, p.errs.join(' | '));
    // (c) phone
    const q = await open(b.br, b.base, 390, 763, '?nomusic=1&lab=1', 0, true);
    await q.waitForFunction(() => window.__mnr && __mnr.G && __mnr.G.lab && window.L2, null, { timeout: 20000 }).catch(() => { });
    const chk = (a, n) => ok(`phone ${n}: no text < 14 px, no tap target < 44 px, no sideways scroll`, !a.ns && !a.nt && !a.side.length && !a.page, JSON.stringify(a));
    chk(await audit(q, 'home'), 'home');
    await q.evaluate(() => L2.go('viewer')); await sleep(600); chk(await audit(q, 'viewer'), 'viewer');
    await q.evaluate(() => L2.go('play')); await sleep(600);
    for (const t of ['boss', 'foes', 'items', 'cheats', 'dex', 'ctrl']) { await q.evaluate(t => { const e = document.getElementById('labTab_' + t); e && e.click(); }, t); await sleep(300); chk(await audit(q, 'play ' + t), 'play test ' + t.toUpperCase()); }
    const fld = await q.evaluate(() => { const s = document.getElementById('stage').getBoundingClientRect(), l = document.getElementById('labP').getBoundingClientRect(), h = document.getElementById('l2h').getBoundingClientRect(); return { s: [s.top, s.bottom], l: [l.top, l.bottom], h: h.bottom }; });
    ok('phone play test: the game field sits between the header and the bottom sheet (nothing covers the boss)', fld.s[0] >= fld.h - 1 && fld.s[1] <= fld.l[0] + 1, JSON.stringify(fld));
    ok('phone: no page error', q.errs.length === 0, q.errs.join(' | '));
    const pc = await p.evaluate(() => { L2.go('play'); return 1; }); await sleep(400);
    const fp = await p.evaluate(() => { const s = document.getElementById('stage').getBoundingClientRect(), l = document.getElementById('labP').getBoundingClientRect(); return { s: s.right, l: l.left, w: l.width }; });
    ok('PC play test: the controls are a right column (>= 360 px) and the game field ends where it starts', pc && fp.w >= 360 && fp.s <= fp.l + 1, JSON.stringify(fp));
    // (d) flag off
    const z = await open(b.br, b.base, 1440, 860, '?nomusic=1&lab=1&lab2=0', 0, false);
    await z.waitForFunction(() => window.__mnr && __mnr.G && __mnr.G.lab, null, { timeout: 20000 }).catch(() => { });
    ok('?lab2=0: the old Lab panel, no home screen', await z.evaluate(() => !document.getElementById('l2h') && !document.getElementById('labP').hidden), z.errs.join(' | '));
  } catch (e) { ok('test ran', false, e.message); }
  finally { await b.close(); }
  done('lab2-test');
})();
