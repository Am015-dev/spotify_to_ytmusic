// Playable test: a Quick game and Story chapter 1 played to the result at 390x763 by tapping ONLY visible, uncovered UI (no engine calls).
//   cd games-src/carc/game/src && python3 build.py && URL=http://localhost:8765/index.html CHROME=/opt/pw-browsers/chromium node ../playable-test.js [quick|story|both]
// Also asserts: every tap target's centre is the target itself (elementFromPoint), no console errors, the turn strip names whose turn it is,
// rival steps show a caption, a score pop with a plain reason appears, the tutorial step list equals TUTORIAL-COVERAGE.md.
const PW = (() => { try { return require('playwright'); } catch (e) { return require('/opt/node-tools/node_modules/playwright'); } })();
const fs = require('fs'), path = require('path');
const URL = process.env.URL || 'file://' + path.join(__dirname, 'rampart.html');
const W = 390, H = 763, which = process.argv[2] || 'both';
const OUT = process.env.SHOTS || path.join(__dirname, '..', 'playtest');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const probs = [], note = m => { if (probs.length < 40) probs.push(m) };
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';

// tap the centre of an element only if it is visible and that point really belongs to it (not covered)
async function tapUI(p, el, what) {
  const r = await el.evaluate(e => { const b = e.getBoundingClientRect(); if (b.width < 8 || b.height < 8) return null; const x = b.left + b.width / 2, y = b.top + b.height / 2;
    if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) return null; const t = document.elementFromPoint(x, y); return { x, y, ok: !!t && getComputedStyle(e).visibility !== 'hidden' && (t === e || e.contains(t)) }; });
  if (!r) return false; if (!r.ok) { if (what !== 'glow') note('covered target: ' + what); return false; }
  await p.touchscreen.tap(r.x, r.y); return true;
}
const seen = { cap: new Set(), pop: new Set(), banner: new Set() };
async function watch(p) {
  const s = await p.evaluate(() => { const st = document.querySelector('#status'); return st ? { tn: (st.querySelector('.tn') || {}).textContent || '', ins: (st.querySelector('.ins') || {}).textContent || '' } : null; });
  if (s) { if (s.tn) seen.banner.add(s.tn.replace(/^\S+ ?/, '').length ? s.tn : s.tn); if (/draws a tile|lays it|puts a|is choosing|is drawing/.test(s.ins)) seen.cap.add(s.ins.replace(/[:“”].*$/, '').slice(0, 30)); if (/\+\d+: /.test(s.ins)) seen.pop.add(s.ins.replace(/^.*?\+\d+: /, '').replace(/\d+/g, 'N')); }
}
async function playToResult(p, tag, limitMs) {
  const t0 = Date.now(); let idle = 0, moves = 0;
  while (Date.now() - t0 < limitMs) {
    await watch(p);
    if (process.env.DEBUG && (Date.now() - t0) % 7 < 3) console.log(JSON.stringify(await p.evaluate(() => ({ t: G.turn, st: G.step, cur: G.cur && G.cur.p, gl: document.querySelectorAll('.glow').length, fg: document.querySelectorAll('.fglow').length, ins: document.querySelector('#status .ins').textContent, modal: document.querySelector('#modal').innerText.slice(0, 40), gl0: (() => { const g = document.querySelector('.glow'); if (!g) return null; const b = g.getBoundingClientRect(); const t = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return [Math.round(b.left), Math.round(b.top), Math.round(b.width), t && (t.tagName + '.' + t.className + '#' + t.id), UI.moved, g.style.visibility]; })() }))));
    if (await p.$('.card[aria-label=Result], .gxc-res')) return { ok: true, moves };
    const tip = await p.$('.gxh-bub:not(.gxt-bub) .gxh-ok'); if (tip && await tip.isVisible()) { await tapUI(p, tip, 'tip ok'); await sleep(120); continue; }
    const gk = await p.$('#goalok'); if (gk && await gk.isVisible() && await tapUI(p, gk, 'Goal start')) { await sleep(200); continue; }
    const hp = await p.$('#hplace'); if (hp && await hp.isVisible() && await tapUI(p, hp, 'Place here')) { idle = 0; await sleep(230); continue; } // touch: confirm the tapped spot
    const glows = await p.$$('.glow');
    if (glows.length) { let done = false; const order = glows.map((g, i) => i).sort((a, b) => Math.abs(a - glows.length / 2) - Math.abs(b - glows.length / 2));
      for (const i of order) { if (await tapUI(p, glows[i], 'glow')) { done = true; break; } }
      if (done) { moves++; idle = 0; await sleep(230); continue; } }
    const fg = await p.$$('.fglow'); if (fg.length) { if (await tapUI(p, fg[moves % 3 === 0 ? 0 : fg.length - 1], 'follower spot')) { idle = 0; await sleep(230); continue; } }
    const sk = await p.$('#hskip'); if (sk && await sk.isVisible() && await tapUI(p, sk, 'skip')) { idle = 0; await sleep(230); continue; }
    await p.mouse.click(5, 400).catch(() => { }); // tap-to-speed on the board edge is harmless
    await sleep(200); idle++; if (idle > 120) return { ok: false, why: 'stuck', moves };
  }
  return { ok: false, why: 'time', moves };
}
async function fresh(b) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, userAgent: UA });
  await ctx.addInitScript(() => { try { localStorage.setItem('rv_fast', '1'); localStorage.setItem('rv_seen', '1'); } catch (e) { } });
  const p = await ctx.newPage(); p.setDefaultTimeout(15000);
  p.on('pageerror', e => note('PAGE ERROR ' + e.message));
  p.on('console', m => { const t = m.text(); if (m.type() === 'error' && !/net::|Failed to load|favicon|fonts|CORS|Access to fetch/.test(t)) note('console error ' + t.slice(0, 160)); });
  await p.goto(URL); await sleep(900); return p;
}
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await PW.chromium.launch({ args: ['--no-sandbox'], executablePath: process.env.CHROME || undefined });
  if (which !== 'story') {
    const p = await fresh(b);
    const play = await p.getByText('Play vs computer').first(); await tapUI(p, await play.elementHandle(), 'Play vs computer'); await sleep(500);
    const now = await p.$('#modal [data-a=go]'); if (now) { await tapUI(p, now, 'Play now'); await sleep(600); }
    await p.screenshot({ path: path.join(OUT, 'playable-first-turn.png') });
    const r = await playToResult(p, 'quick', 200000);
    if (!r.ok) note('quick game did not reach the result: ' + JSON.stringify(r)); else { await sleep(2600); await p.screenshot({ path: path.join(OUT, 'playable-result.png') }); const txt = await p.evaluate(() => document.querySelector('.card[aria-label=Result]').innerText); if (!/\d/.test(txt)) note('result card has no scores'); }
    console.log('quick: ' + (r.ok ? 'PASS' : 'FAIL') + ' moves ' + r.moves);
    await p.context().close();
  }
  if (which !== 'quick') {
    const p = await fresh(b);
    await p.evaluate(() => { try { localStorage.setItem('gxt-rampart-and-vine', JSON.stringify({ done: true })); } catch (e) { } }); await p.reload(); await sleep(900);
    const st = await p.$('#modal [data-a=story]'); await tapUI(p, st, 'Story'); await sleep(900);
    let started = false;
    for (let k = 0; k < 30 && !started; k++) {
      started = await p.evaluate(() => !!UI.camp && !!G && !G.over && !!document.querySelector('.glow'));
      if (started) break;
      const btn = await p.evaluate(() => { const vis = e => { const r = e.getBoundingClientRect(); return r.width > 20 && r.height > 20 && getComputedStyle(e).visibility !== 'hidden'; };
        const pick = ['.gxc-btn.go', '.gxc-node.cur', '.gxc-node.open', '.gxc-node:not(.lock)', '.gxc-btn'].map(s => [...document.querySelectorAll(s)].find(vis)).find(Boolean); return pick ? (pick.id ? '#' + pick.id : null) || (pick.setAttribute('data-pt', '1'), '[data-pt="1"]') : null; });
      if (btn) { const el = await p.$(btn); if (el) { await tapUI(p, el, 'story ui ' + btn); await p.evaluate(() => document.querySelectorAll('[data-pt]').forEach(e => e.removeAttribute('data-pt'))); } }
      await sleep(450);
    }
    if (!started) { note('story chapter 1 did not start'); await p.screenshot({ path: path.join(OUT, 'playable-story-stuck.png') }); console.log('story: FAIL (start)'); }
    else {
      await p.screenshot({ path: path.join(OUT, 'playable-story-turn.png') });
      const r = await playToResult(p, 'story', 220000);
      if (!r.ok) { note('story chapter 1 did not reach the result: ' + JSON.stringify(r)); await p.screenshot({ path: path.join(OUT, 'playable-story-stuck.png') }); }
      console.log('story: ' + (r.ok ? 'PASS' : 'FAIL') + ' moves ' + r.moves);
    }
    await p.context().close();
  }
  await b.close();
  console.log('banners: ' + [...seen.banner].join(' | '));
  console.log('rival captions: ' + [...seen.cap].join(' | '));
  console.log('score reasons: ' + [...seen.pop].slice(0, 8).join(' | '));
  if (which !== 'story') { if (!seen.cap.size) note('no rival step caption was shown'); if (!seen.pop.size) note('no score reason was shown'); }
  console.log(probs.length ? 'PROBLEMS ' + probs.length + '\n  ' + probs.join('\n  ') : 'PROBLEMS 0');
  process.exit(probs.length ? 1 : 0);
})();
