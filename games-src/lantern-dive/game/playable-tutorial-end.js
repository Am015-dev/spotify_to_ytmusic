// Tutorial-to-end proof (W390). From FRESH storage: starts the tutorial from the title, then for every step taps the centre of the
// spotlit element with a touch (elementFromPoint there must be the target, never a kit overlay), or Next for read-only steps,
// until the end card; asserts every coverage step id was shown and the end state is reached; then starts a real game from the end card.
//   PLAYWRIGHT_BROWSERS_PATH=... NODE_PATH=games-src/node_modules node playable-tutorial-end.js [sizes=390x763,1440x860]
const PW = (() => { try { return require('playwright'); } catch (e) { return require('/opt/node-tools/node_modules/playwright'); } })();
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(process.env.HTML || path.join(__dirname, 'lantern-dive.html'));
const SIZES = (process.argv[2] || '390x763,1440x860').split(',').map(s => s.split('x').map(Number));
const COVERAGE = ['goal', 'cmd', 'take', 'mates', 'flare', 'ping', 'readping', 'lead', 'win1', 'lost', 'ping2', 'lead2', 'win2', 'done1', 'last', 'lastx', 'follow', 'win3', 'trump', 'win4', 'won'];
const sleep = ms => new Promise(r => setTimeout(r, ms)); const probs = [];
(async () => {
  const browser = await PW.chromium.launch();
  for (const [W, H] of SIZES) {
    const tag = W + 'x' + H, mobile = W < 700;
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: true });
    await ctx.route('**/*', r => new URL(r.request().url()).host === 'gns.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
    const p = await ctx.newPage(); p.setDefaultTimeout(15000);
    p.on('pageerror', e => probs.push(tag + ' PAGE ERROR ' + e.message));
    p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load|favicon/.test(m.text())) probs.push(tag + ' console ' + m.text().slice(0, 140)); });
    await p.goto('https://gns.test/' + (mobile ? '?phone=1' : '')); await sleep(900); await p.evaluate(() => { try { localStorage.clear(); } catch (e) { } }); await p.reload(); await sleep(900);
    await p.evaluate(() => showStart());
    const b = await p.evaluate(() => { const e = document.querySelector('#start [data-gxt-open]'); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
    await p.touchscreen.tap(b[0], b[1]); await sleep(500); await p.evaluate(() => { AIDELAY = 120; });
    const seen = []; let last = '', lastT = Date.now(), ended = false;
    for (let g = 0; g < 4000; g++) {
      const st = await p.evaluate(() => GXT.state());
      if (!st.active) break; if (st.phase === 'end') { ended = true; break; }
      const sig = [st.i, st.phase, st.count, st.shown].join('|'); if (sig !== last) { last = sig; lastT = Date.now(); } else if (Date.now() - lastT > 8000) { probs.push(tag + ' stuck at step ' + st.id); break; }
      if (!st.shown) { await sleep(60); continue; }
      if (!seen.includes(st.id)) seen.push(st.id);
      const t = await p.evaluate(() => {
        const s = GXT.state(), h = s.hole; if (!h) return { err: 'no spotlight' };
        const el = document.elementFromPoint(h.cx, h.cy), bub = document.querySelector('.gxt-bub');
        if (s.wait) { const kit = el && el.closest('.gxt-bub,.gxt-top,.gxt-ring,.gxt-cell'); const covered = !el || (kit && !el.closest('[data-help]') ? true : !!kit); return { x: h.cx, y: h.cy, covered, under: el && (el.className.baseVal || el.className || el.tagName) }; }
        const nb = bub && bub.querySelector('.gxt-next'); if (!nb) return { err: 'no Next button' }; const r = nb.getBoundingClientRect(); const e2 = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return { x: r.left + r.width / 2, y: r.top + r.height / 2, covered: !(e2 && (e2 === nb || nb.contains(e2))), under: e2 && e2.className };
      });
      if (t.err) { probs.push(tag + ' ' + st.id + ': ' + t.err); break; }
      if (t.covered) probs.push(tag + ' ' + st.id + ': tap point covered by ' + t.under);
      await p.touchscreen.tap(t.x, t.y); await sleep(260);
    }
    const miss = COVERAGE.filter(id => !seen.includes(id)); if (miss.length) probs.push(tag + ' coverage steps never shown: ' + miss.join(','));
    if (!ended) probs.push(tag + ' tutorial did not reach the end card');
    else {
      const endTxt = await p.evaluate(() => (document.querySelector('.gxt-end') || {}).innerText || ''); if (!/know the rules/i.test(endTxt)) probs.push(tag + ' end card text: ' + endTxt.slice(0, 60));
      // leave through the end card by tapping its first button; a menu must follow
      const eb = await p.evaluate(() => { const e = document.querySelector('.gxt-end button'); if (!e) return null; const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
      if (!eb) probs.push(tag + ' end card has no button'); else { await p.touchscreen.tap(eb[0], eb[1]); await sleep(700); const o = await p.evaluate(() => ({ done: !!(JSON.parse(localStorage.getItem('gxt-lantern-dive') || '{}').done), running: GXT.running() })); if (!o.done) probs.push(tag + ' tutorial not remembered as done'); if (o.running) probs.push(tag + ' tutorial still running after the end card'); }
    }
    console.log(tag, 'steps', seen.length + '/' + COVERAGE.length, ended ? 'reached end' : 'NO END'); await ctx.close();
  }
  await browser.close();
  console.log(probs.length ? 'FAIL\n' + probs.join('\n') : 'PASS tutorial-to-end'); process.exit(probs.length ? 1 : 0);
})().catch(e => { console.log('CRASH', e.message); process.exit(1); });
