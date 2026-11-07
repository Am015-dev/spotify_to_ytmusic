// Tutorial to the end, by real taps: fresh storage, open the tutorial from the title, tap the centre of each spotlit target (asserting
// elementFromPoint there IS the target, not something covering it) or the Next button, until the end card. Phone 390x763 and PC 1440x860.
// Asserts every step id listed in TUTORIAL-COVERAGE.md was shown. Usage: node tutorial-end.js [page url]   (default: the local build)
const { chromium } = require('playwright');
const EXE = require('fs').existsSync('/opt/pw-browsers/chromium') ? { executablePath: '/opt/pw-browsers/chromium' } : {};
const URL = process.argv[2] || 'file://' + __dirname + '/wildmark.html';
const WANT = ['goal', 'cards', 'take', 'spot', 'ok', 'tok', 'acorn', 'take2', 'spot2', 'rot', 'ok2', 'tok2', 'pair', 'sweep', 'free', 'freet', 'freek', 'spot3', 'ok3', 'tok3', 'end'];
(async () => {
  const b = await chromium.launch(EXE); let allOk = true;
  for (const [name, vp, touch] of [['phone', { width: 390, height: 763 }, true], ['pc', { width: 1440, height: 860 }, false]]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch }), p = await ctx.newPage(), errs = [], seen = [], covered = [];
    p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
    await p.goto(URL); await p.evaluate(() => { try { localStorage.clear(); } catch (e) { } }); await p.goto(URL); await p.waitForTimeout(900);
    const tapXY = async (x, y) => { if (touch) await p.touchscreen.tap(x, y); else await p.mouse.click(x, y); };
    const first = p.locator('#start button').first(); if (touch) await first.tap(); else await first.click();
    let ended = false;
    for (let g = 0; g < 400 && !ended; g++) {
      await p.waitForTimeout(250);
      const st = await p.evaluate(() => {
        const S = window.GXT && GXT.state ? GXT.state() : null, cur = window.GXT && GXT.current ? GXT.current() : null;
        const endCard = [...document.querySelectorAll('button')].find(x => x.offsetWidth && /^(Play|Start region|Done|Finish|Close)/.test(x.textContent.trim()) && x.closest('.gxt-end, .gxt-dlg, [class*=gxt]'));
        const nx = document.querySelector('.gxt-next'); const vis = e => e && e.getBoundingClientRect().width > 0;
        let tgt = null; try { tgt = cur && cur.target ? cur.target() : null; } catch (e) { }
        const r = tgt && tgt.getBoundingClientRect(), cx = r ? r.left + r.width / 2 : 0, cy = r ? r.top + r.height / 2 : 0;
        const hit = r ? document.elementFromPoint(cx, cy) : null;
        return { id: cur && cur.id, running: !!(window.GXT && GXT.running()), next: vis(nx) ? (() => { const q = nx.getBoundingClientRect(); return [q.left + q.width / 2, q.top + q.height / 2]; })() : null,
          wait: !!(cur && cur.wait), xy: r && r.width ? [cx, cy] : null, clear: !!(hit && tgt && (hit === tgt || tgt.contains(hit) || hit.closest('.gxt-clear'))), endBtn: !!endCard, over: !!(window.G && G.over) };
      });
      if (st.id && seen[seen.length - 1] !== st.id) seen.push(st.id);
      if (!st.running) { ended = true; break; }
      if (st.next) { await tapXY(st.next[0], st.next[1]); await p.waitForTimeout(250); continue; }
      if (st.wait && st.xy) { if (!st.clear && covered.indexOf(st.id) < 0) covered.push(st.id); await tapXY(st.xy[0], st.xy[1]); await p.waitForTimeout(300); continue; }
      const endB = p.locator('.gxt-end button, .gxt-dlg button').first();
      if (await endB.count() && await endB.isVisible().catch(() => false)) { ended = true; break; }
    }
    const missing = WANT.filter(id => seen.indexOf(id) < 0), endCard = await p.locator('.gxt-end button, .gxt-dlg button, [class*=gxt] button').count();
    const pass = ended && !missing.length && !covered.length && !errs.length;
    if (!pass) allOk = false;
    console.log((pass ? 'PASS' : 'FAIL') + ' tutorial-to-end ' + name + ': steps seen ' + seen.length + '/' + WANT.length + (missing.length ? ' missing ' + missing.join(',') : '') + (covered.length ? ' covered targets ' + covered.join(',') : '') + (errs.length ? ' errors ' + errs.slice(0, 2).join(' | ') : '') + ' end card ' + (endCard > 0));
    await ctx.close();
  }
  await b.close(); process.exit(allOk ? 0 : 1);
})();
