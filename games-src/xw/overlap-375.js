// 10-turn overlap check at 375x667 (BRIEF-GAMEFEEL point 5): plays by touch, then after every turn from 10 on scans visible text
// boxes of unrelated elements for overlap (same rule as feel-audit (e)) and saves a shot. usage: node overlap-375.js [index.html]
const { chromium } = require('playwright'); const fs = require('fs');
const SITE = process.env.SITE || '/tmp/na-site'; if (process.argv[2] && !process.argv[2].startsWith('--')) fs.copyFileSync(process.argv[2], SITE + '/index.html');
const sleep = ms => new Promise(r => setTimeout(r, ms));

// --dial: maneuver-dial layout check at 375x667 and 390x844 against a served build (DIAL_URL, default http://127.0.0.1:8791/nebula-aces/).
// Asserts: ship centre not covered by any dial chip, every chip fully inside the viewport and above the bottom bar, no two chips overlap,
// the suggested move is the same on a second opening. Saves playable-shots/dial-<w>.png. usage: node overlap-375.js --dial
if (process.argv.includes('--dial')) (async () => { const b = await chromium.launch(); let fails = 0;
  for (const [w, h] of [[375, 667], [390, 844]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    const URL = process.env.DIAL_URL || 'http://127.0.0.1:8791/nebula-aces/';
    await p.goto(URL); await sleep(1500); await p.evaluate(() => { try { localStorage.setItem('na_played', '1'); } catch (e) { } }); await p.reload(); await sleep(2000);
    const tap = async q => { const e = await p.$(q); if (!e) return false; const bx = await e.boundingBox(); if (!bx) return false; await p.touchscreen.tap(bx.x + bx.width / 2, bx.y + bx.height / 2); return true; };
    await tap('button.primary:visible:has-text("Launch")'); await sleep(1500); await tap('[data-bf="brief"]'); await sleep(1500);
    const open = async () => { await tap('.bfring.need'); await sleep(1300); };
    await open(); const first = await p.evaluate(() => document.querySelector('#bfdial .dwd').textContent);
    await p.screenshot({ path: __dirname + '/playable-shots/dial-' + w + '.png' });
    const r = await p.evaluate(() => { const R = e => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom }; }; const f = [];
      const chips = [...document.querySelectorAll('#bfdial .ditem,.bfm')].filter(e => e.offsetParent !== null || getComputedStyle(e).display !== 'none'); const win = document.querySelector('#bfdial .dwin');
      const bar = R(document.getElementById('bfbar')), ring = R(document.querySelector('.bfring.sel')), cx = (ring.l + ring.r) / 2, cy = (ring.t + ring.b) / 2;
      if (!chips.length) f.push('no dial chips');
      const boxes = chips.map(R); boxes.forEach((q, i) => { if (q.l < 0 || q.t < 0 || q.r > innerWidth || q.b > innerHeight) f.push('chip ' + i + ' outside viewport'); if (q.b > bar.t + 1) f.push('chip ' + i + ' under the bottom bar');
        if (cx > q.l && cx < q.r && cy > q.t && cy < q.b) f.push('chip ' + i + ' covers the ship'); });
      for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) { const a = boxes[i], c = boxes[j]; if (Math.min(a.r, c.r) - Math.max(a.l, c.l) > 1 && Math.min(a.b, c.b) - Math.max(a.t, c.t) > 1) f.push('chips ' + i + ' and ' + j + ' overlap'); }
      if (win) { const q = R(win); if (cx > q.l && cx < q.r && cy > q.t && cy < q.b) f.push('label covers the ship'); if (q.b > bar.t) f.push('label under bar'); }
      return { f, n: chips.length }; });
    await tap('[data-bf="dclose"]'); await sleep(600); await open(); const second = await p.evaluate(() => document.querySelector('#bfdial .dwd') && document.querySelector('#bfdial .dwd').textContent);
    const sg = await p.evaluate(() => { const o = []; for (let i = 0; i < 4; i++) { UI.sugCache = null; o.push(suggestDial(ship('s1'))); } return o; }); if (new Set(sg).size !== 1) r.f.push('suggestDial unstable: ' + sg);
    if (first !== second) r.f.push('suggestion changed between openings: ' + first + ' / ' + second);
    if (/off|mat edge/i.test(first)) r.f.push('default is off-mat');
    console.log(w + 'x' + h, 'chips', r.n, 'default', first, 'problems', r.f.length, r.f.slice(0, 6), 'errors', errs.length); fails += r.f.length + errs.length; await ctx.close(); }
  await b.close(); process.exit(fails ? 1 : 0); })();
else
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + SITE + '/index.html'); await sleep(1500); await p.evaluate(() => { try { localStorage.setItem('na_played', '1'); } catch (e) { } }); await p.reload(); await sleep(2000);
  const tap = async q => { const e = await p.$(q); if (!e) return false; const bx = await e.boundingBox(); if (!bx) return false; await p.touchscreen.tap(bx.x + bx.width / 2, bx.y + bx.height / 2); return true; };
  await tap('button.primary:visible:has-text("Launch")'); await sleep(1500); await tap('[data-bf="brief"]'); await sleep(1500);
  let turns = 0, bad = [];
  for (let i = 0; i < 500 && turns < 22; i++) {
    const st = await p.evaluate(() => ({ win: G.winner, ph: G.phase })); if (st.win) break;
    let ok = await tap('[data-bf="auto"]'); if (ok) { await sleep(250); ok = await tap('[data-bf="fly"]:not([disabled])'); }
    if (!ok) for (const q of ['.bftgt', '.bfact', '.bfring.need', '.bfm.sug', '#bfdice .die.pick', '#bfbtns .btn:not([disabled])']) if (await tap(q)) { ok = true; break; }
    if (ok) turns++; await sleep(700);
    if (turns >= 10 && ok) {
      const ov = await p.evaluate(() => { const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), it = [];
        for (let n; (n = w.nextNode());) { const e = n.parentElement; if (!e || !n.nodeValue.trim() || e.closest('script,style,[data-fa-skip]')) continue; const cs = getComputedStyle(e); if (cs.visibility === 'hidden') continue;
          const rg = document.createRange(); rg.selectNodeContents(n); const r = rg.getBoundingClientRect(); if (r.width < 6 || r.height < 6 || r.bottom < 0 || r.top > innerHeight) continue;
          const t = document.elementFromPoint(Math.min(innerWidth - 1, Math.max(0, r.left + r.width / 2)), Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2))); if (!t || !(t === e || e.contains(t) || t.contains(e))) continue; it.push({ e, r, s: n.nodeValue.trim().slice(0, 30) }); }
        const f = []; for (let i = 0; i < it.length; i++) for (let j = i + 1; j < it.length; j++) { const a = it[i], b = it[j]; if (a.e === b.e || a.e.contains(b.e) || b.e.contains(a.e)) continue;
          const ix = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left), iy = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top); if (ix > 2 && iy > 2) f.push(a.s + ' | ' + b.s); } return f; });
      if (ov.length) { bad.push(...ov); await p.screenshot({ path: __dirname + '/playable-shots/feel/overlap-375-t' + turns + '.png' }); }
    }
  }
  await p.screenshot({ path: __dirname + '/playable-shots/feel/check-375x667.png' });
  console.log('375x667 turns', turns, 'overlaps', bad.length, [...new Set(bad)].slice(0, 6), 'errors', errs.length); await b.close(); process.exit(bad.length || errs.length ? 1 : 0); })();
