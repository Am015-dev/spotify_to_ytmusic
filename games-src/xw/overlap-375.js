// 10-turn overlap check at 375x667 (BRIEF-GAMEFEEL point 5): plays by touch, then after every turn from 10 on scans visible text
// boxes of unrelated elements for overlap (same rule as feel-audit (e)) and saves a shot. usage: node overlap-375.js [index.html]
const { chromium } = require('playwright'); const fs = require('fs');
const SITE = process.env.SITE || '/tmp/na-site'; if (process.argv[2]) fs.copyFileSync(process.argv[2], SITE + '/index.html');
const sleep = ms => new Promise(r => setTimeout(r, ms));
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
