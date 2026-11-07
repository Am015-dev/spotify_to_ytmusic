// Plays the WHOLE guided tutorial game from fresh storage: taps the centre of each spotlit element (or Next on "see" steps) after
// checking nothing covers it, asserts every step listed in TUTORIAL-COVERAGE.md was shown, then taps "Finish this game" and plays
// the rest of the year by tapping only visible, uncovered UI until the result screen.   node tests/tutorial-end.js [phone|pc] [url]
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const SIZE = process.argv[2] || 'phone', URL = process.argv[3] || 'http://127.0.0.1:8765/perch-and-plume/';
const VP = SIZE === 'pc' ? { width: 1440, height: 860 } : { width: 390, height: 763 }, TOUCH = SIZE !== 'pc';
const COVER = fs.readFileSync(path.join(__dirname, '..', 'TUTORIAL-COVERAGE.md'), 'utf8');
const WANT = [...new Set([...COVER.matchAll(/step `([a-z0-9]+)`/g)].map(m => m[1]))];
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: VP, hasTouch: TOUCH, isMobile: TOUCH });
  const p = await ctx.newPage(); const errs = []; let fails = 0;
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const ok = (c, m) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + SIZE + ' ' + m); };
  const tapXY = async (x, y) => TOUCH ? p.touchscreen.tap(x, y) : p.mouse.click(x, y);
  const uncovered = (x, y, box) => p.evaluate(([x, y, h]) => { const e = document.elementFromPoint(x, y); if (!e) return 'nothing';
    if (e.closest('.gxt-top,.gxt-cell,.turnban,.reveal,#toast,.gxh-bub:not(.gxt-bub)')) return 'covered by ' + (e.className || e.tagName);
    if (!h) return 'ok'; const r = e.getBoundingClientRect(); return (r.left >= h.left - 6 && r.top >= h.top - 6 && r.right <= h.left + h.width + 6 && r.bottom <= h.top + h.height + 6) ? 'ok' : 'outside ' + e.className; }, [x, y, box]);
  await p.goto(URL); await p.waitForTimeout(1000);
  const open = await p.$('[data-gxt-open]'); ok(!!open, 'tutorial button on the title (fresh storage)');
  const r0 = await open.boundingBox(); await tapXY(r0.x + r0.width / 2, r0.y + r0.height / 2);
  const shown = new Set(), seen = new Set(); let n = 0, t0 = Date.now(), lastKey = '', taps = 0;
  while (Date.now() - t0 < 150000) {
    await p.waitForTimeout(250);
    const end = await p.$('.gxt-end .gxt-b.pri'); if (end && await end.isVisible()) break;
    const st = await p.evaluate(() => typeof GXT !== 'undefined' ? GXT.state() : { active: false });
    if (!st.active) continue; n = st.n;
    if (st.phase !== 'show' || !st.shown) continue;
    shown.add(st.id);
    const key = st.id + ':' + st.count; if (key === lastKey) { if (++taps > 8) { ok(false, 'stuck at ' + key); break; } } else { lastKey = key; taps = 0; }
    if (!st.wait) {
      const nx = await p.$('.gxt-next'); const r = nx && await nx.boundingBox(); if (!r) continue;
      const cx = r.x + r.width / 2, cy = r.y + r.height / 2, hit = await uncovered(cx, cy, null);
      if (!seen.has(key)) { ok(hit === 'ok', `step ${st.i + 1}/${st.n} ${st.id} (see) Next uncovered: ${hit}`); seen.add(key); }
      await tapXY(cx, cy); await p.waitForTimeout(350); continue;
    }
    if (!st.hole) continue;
    const cx = st.hole.cx != null ? st.hole.cx : st.hole.left + st.hole.width / 2, cy = st.hole.cy != null ? st.hole.cy : st.hole.top + st.hole.height / 2;
    const hit = await uncovered(cx, cy, st.hole);
    if (!seen.has(key)) { ok(hit === 'ok', `step ${st.i + 1}/${st.n} ${st.id} (${st.count + 1}/${st.times}) target uncovered: ${hit}`); seen.add(key); }
    await tapXY(cx, cy); await p.waitForTimeout(400);
  }
  const end = await p.$('.gxt-end .gxt-b.pri'); ok(!!end && await end.isVisible(), `reached the guided part's end card (${n} steps)`);
  const miss = WANT.filter(id => !shown.has(id)); ok(WANT.length > 0 && miss.length === 0, `every TUTORIAL-COVERAGE.md step was shown (${WANT.length} ids${miss.length ? ', missing ' + miss.join(',') : ''})`);
  if (end) { await end.click(); await p.waitForTimeout(800); }
  // the rest of the real game, by visible taps only
  let res = false, idle = Date.now(); const t1 = Date.now();
  while (Date.now() - t1 < 240000) {
    const h = await p.evaluateHandle(() => {
      const vis = e => { if (!e || e.hidden) return false; for (let x = e; x; x = x.parentElement) { if (x.hidden || getComputedStyle(x).display === 'none') return false; } return e.getBoundingClientRect().width > 0; };
      const q = s => [...document.querySelectorAll(s)].filter(vis);
      if (vis(document.getElementById('result'))) return 'result';
      if (q('.turnban,.reveal').length) return null;
      const pop = document.getElementById('pop'); if (vis(pop)) return pop.querySelector('[data-a="popx"]');
      const acts = q('#acts button'); const pg = acts.find(b => b.dataset.a === 'playgo'); if (pg) return pg;
      const g = q('.glow'); if (g.length) { const sl = g.find(e => e.matches('.slot')); if (sl) return sl; const hd = g.find(e => e.closest('#hand')); return hd || g[Math.floor(Math.random() * g.length)]; }
      const mv = acts.filter(b => b.dataset.a === 'mv'); if (mv.length) return mv.find(b => /no thanks|skip/i.test(b.textContent)) || mv[0];
      return q('.bonc')[0] || null;
    });
    const v = await h.jsonValue().catch(() => undefined); if (v === 'result') { res = true; break; }
    const el = h.asElement();
    if (el) { const r = await el.boundingBox(); if (r) { const x = r.x + r.width / 2, y = r.y + Math.min(r.height / 2, 30);
      if (await el.evaluate((e, [x, y]) => { const t = document.elementFromPoint(x, y); return e.isConnected && !!t && (t === e || e.contains(t)); }, [x, y])) { await tapXY(x, y); idle = Date.now(); await p.waitForTimeout(150); continue; } } }
    if (Date.now() - idle > 20000) break;
    await p.waitForTimeout(200);
  }
  const txt = res ? await p.evaluate(() => document.getElementById('result').innerText.slice(0, 80).replace(/\s+/g, ' ')) : '';
  ok(res, 'the guided game was played to the result screen' + (txt ? ' (' + txt + ')' : ''));
  if (res) await p.screenshot({ path: `shots/tutorial-${SIZE}-result.png` });
  ok(errs.length === 0, 'console errors ' + errs.length + ' ' + errs.slice(0, 2).join(' | '));
  await b.close(); process.exit(fails ? 1 : 0);
})();
