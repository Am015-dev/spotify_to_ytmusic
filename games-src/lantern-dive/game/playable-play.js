// W390: plays a Quick game (Free play) and Story stage 1 to the RESULT screen at 390x763 using only touch taps on visible, uncovered UI
// (no engine calls to act; the engine is only READ to know the phase). PASS prints one line per mode.
//   PLAYWRIGHT_BROWSERS_PATH=... NODE_PATH=games-src/node_modules node playable-play.js
const PW = (() => { try { return require('playwright'); } catch (e) { return require('/opt/node-tools/node_modules/playwright'); } })();
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(process.env.HTML || path.join(__dirname, 'lantern-dive.html'));
const sleep = ms => new Promise(r => setTimeout(r, ms)); const probs = [];
// tap a point of the first matching element that is really on top there (so a covered button is never "tapped")
async function tap(p, sel, filter) {
  const t = await p.evaluate(([sel, filter]) => {
    for (const e of document.querySelectorAll(sel)) {
      const r = e.getBoundingClientRect(); if (r.width < 4 || r.height < 4) continue; if (filter && !new RegExp(filter, 'i').test(e.textContent.trim())) continue;
      for (const [fx, fy] of [[.5, .5], [.3, .3], [.7, .3], [.3, .7], [.7, .7], [.5, .2], [.5, .8], [.15, .5], [.85, .5]]) {
        const x = r.left + r.width * fx, y = r.top + r.height * fy; if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue;
        const t = document.elementFromPoint(x, y); if (t && (t === e || e.contains(t))) return [x, y, (e.dataset.a || e.className) + ':' + e.textContent.trim().slice(0, 18)];
      } } return null;
  }, [sel, filter || null]);
  if (!t) return null; await p.touchscreen.tap(t[0], t[1]); return t[2];
}
async function playDive(p, tag, shots) {
  let n = 0, resultSeen = false, last = '', lastT = Date.now(), cards = 0;
  for (let i = 0; i < 700; i++) {
    const s = await p.evaluate(() => ({ ph: G.phase, must: iMustAct(), busy: UI.busy, sig: G.phase + G.att + G.tricks.length + (G.trick ? G.trick.plays.length : 0) + (G.tasks || []).map(t => t.owner).join('') }));
    if (s.sig !== last) { last = s.sig; lastT = Date.now(); } else if (Date.now() - lastT > 12000) { probs.push(tag + ': stuck in phase ' + s.ph + ' ' + JSON.stringify(await p.evaluate(() => (document.querySelector('#prompt') || {}).textContent))); return false; }
    if (s.ph === 'over') { // the result button / sheet
      if (await tap(p, '#acts button, #rs button, .sheet button, button', '^(Result|Show result)$')) { await sleep(700); }
      const res = await p.evaluate(() => { const e = document.querySelector('#rs, .rs, .result'); return e && e.getBoundingClientRect().width > 0 ? e.innerText.slice(0, 80) : ''; });
      if (res || await p.evaluate(() => UI.overShown)) { resultSeen = true; if (shots) await p.screenshot({ path: shots + '-result.png' }); return true; }
      await sleep(400); continue;
    }
    let a = await tap(p, 'button', '^(Next|Got it|Continue|OK|Dive)$');
    if (!a && s.must && !s.busy) {
      if (s.ph === 'assign') a = await tap(p, '.jcard.glow');
      else if (s.ph === 'distress') a = await tap(p, '#acts button', 'No flare|No|Skip');
      else if (s.ph === 'signal') a = await tap(p, '#acts button', 'No signal');
      else if (s.ph === 'predict') a = await tap(p, '#acts button.go, #acts button');
      else if (s.ph === 'pass') a = await tap(p, '#hand .hc.glow');
      else if (s.ph === 'play') { a = await tap(p, '#hand .hc.glow'); if (a) cards++; }
    }
    if (shots && a && s.ph === 'play' && (cards === 1 || cards === 3)) { await sleep(500); await p.screenshot({ path: shots + '-turn' + cards + '.png' }); }
    await sleep(a ? 450 : 250);
  }
  probs.push(tag + ': no result screen after the move budget'); return false;
}
async function boot(browser) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 763 }, isMobile: true, hasTouch: true });
  await ctx.route('**/*', r => new URL(r.request().url()).host === 'gns.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
  const p = await ctx.newPage(); p.setDefaultTimeout(15000); let errs = 0;
  p.on('pageerror', e => { errs++; probs.push('PAGE ERROR ' + e.message); }); p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load|favicon/.test(m.text())) { errs++; probs.push('console ' + m.text().slice(0, 120)); } });
  await p.goto('https://gns.test/?phone=1'); await sleep(900); await p.evaluate(() => { try { localStorage.clear(); } catch (e) { } }); await p.reload(); await sleep(1200);
  await p.evaluate(() => { AIDELAY = 200; }); return { ctx, p };
}
(async () => {
  const browser = await PW.chromium.launch(); const SH = process.env.SHOTS ? path.join(process.env.SHOTS) : null;
  { // ---- Quick game: Free play -> Start the dive
    const { ctx, p } = await boot(browser);
    if (!await tap(p, '[data-a=play]')) probs.push('quick: no Free play button on the title');
    await sleep(500); if (!await tap(p, '[data-start=vs]')) probs.push('quick: no Start button'); await sleep(1200);
    await p.evaluate(() => { AIDELAY = 200; });
    const ok = await playDive(p, 'quick', SH && SH + '/quick'); console.log(ok ? 'PASS quick game to the result screen' : 'FAIL quick game'); await ctx.close();
  }
  { // ---- Story stage 1: Story -> (skip the tutorial) -> map -> chapter 1 -> Play
    const { ctx, p } = await boot(browser);
    await tap(p, '[data-a=story]'); await sleep(700); await tap(p, '.gxt-skip'); await sleep(700); await tap(p, '[data-a=story]'); await sleep(800);
    await p.evaluate(() => { const e = [...document.querySelectorAll('button,div')].find(e => /^1Training Day/.test(e.textContent.trim()) && e.getBoundingClientRect().width > 0); e && e.click(); }); await sleep(600);
    if (!await tap(p, 'button', '^Play$')) probs.push('story: no Play button on the chapter card'); await sleep(1200);
    for (let k = 0; k < 6; k++) { if (!await tap(p, 'button', '^(Next|Skip)$')) break; await sleep(500); } // the chief's briefing
    await p.evaluate(() => { AIDELAY = 200; });
    const ok = await playDive(p, 'story1', SH && SH + '/story'); console.log(ok ? 'PASS story stage 1 to the result screen' : 'FAIL story stage 1'); await ctx.close();
  }
  await browser.close(); console.log(probs.length ? 'PROBLEMS\n' + probs.join('\n') : 'PASS no console/page errors'); process.exit(probs.length ? 1 : 0);
})().catch(e => { console.log('CRASH', e.message); process.exit(1); });
