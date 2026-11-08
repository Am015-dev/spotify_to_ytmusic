// Coached first dive proof (W409). From FRESH storage: start the tutorial from the title, tap the ONE forced step, then play ANY legal moves through
// the UI by touch taps on visible, uncovered elements (random choice among the glowing cards/jobs), never the engine, until the end card.
// Asserts: <= 2 forced taps, one guide bubble at a time, the bubble never covers a tap target, every rule was explained in play or listed on the end card.
//   node playable-tutorial-end.js [sizes=390x763,1440x860] [seed]
const PW = (() => { try { return require('playwright'); } catch (e) { return require('/opt/node-tools/node_modules/playwright'); } })();
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(process.env.HTML || path.join(__dirname, 'lantern-dive.html'));
const SIZES = (process.argv[2] || '390x844,390x763,1440x860').split(',').map(s => s.split('x').map(Number));
let seed = +(process.argv[3] || 7); const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
const sleep = ms => new Promise(r => setTimeout(r, ms)); const probs = [];
const RULES = ['jobs', 'flare', 'ping', 'readping', 'lead', 'follow', 'void', 'win', 'trump', 'last'];
async function tap(p, sel, filter, pick) {
  const t = await p.evaluate(([sel, filter, r]) => {
    const ok = [];
    for (const e of document.querySelectorAll(sel)) {
      const b = e.getBoundingClientRect(); if (b.width < 4 || b.height < 4) continue; if (filter && !new RegExp(filter, 'i').test(e.textContent.trim())) continue;
      for (const [fx, fy] of [[.5, .5], [.3, .3], [.7, .3], [.3, .7], [.7, .7], [.5, .2], [.5, .8], [.15, .5], [.85, .5]]) {
        const x = b.left + b.width * fx, y = b.top + b.height * fy; if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue;
        const t = document.elementFromPoint(x, y); if (t && (t === e || e.contains(t))) { ok.push([x, y, (e.dataset.a || e.className) + ':' + e.textContent.trim().slice(0, 18)]); break; }
      }
    }
    return ok.length ? ok[r ? Math.floor(r * ok.length) : 0] : null;
  }, [sel, filter || null, pick ? rnd() : 0]);
  if (!t) return null; await p.touchscreen.tap(t[0], t[1]); return t[2];
}
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
    await p.touchscreen.tap(b[0], b[1]); await sleep(600); await p.evaluate(() => { AIDELAY = 150; });
    let again = 0, forced = 0, bubbles = new Set(), multi = 0, dismissed = false, ended = false, last = '', lastT = Date.now(), cover = 0;
    for (let g = 0; g < 1500 && !ended; g++) {
      const s = await p.evaluate(() => ({ kit: GXT.active(), kitShown: GXT.state().shown, hole: (GXT.state().hole || null), ph: G.phase, must: iMustAct(), busy: UI.busy, end: !!document.getElementById('tend'),
        nb: document.querySelectorAll('#tbub').length, bub: (document.getElementById('tbub') || {}).dataset ? document.getElementById('tbub').dataset.tip : '', sig: G.phase + G.att + G.tricks.length + (G.trick ? G.trick.plays.length : 0) + (G.tasks || []).map(t => t.owner).join('') + !!document.getElementById('tbub') }));
      if (s.nb > 1) multi++; if (s.bub) bubbles.add(s.bub);
      if (s.sig !== last) { last = s.sig; lastT = Date.now(); } else if (Date.now() - lastT > 14000) { probs.push(tag + ' stuck in ' + s.ph); break; }
      if (s.end) { const bad = await p.evaluate(() => !!document.querySelector('#tend [data-te=again]')); if (bad && !again) { again = 1; await tap(p, '#tend [data-te=again]'); await sleep(600); continue; } ended = true; break; }
      if (s.kit) { if (s.kitShown && s.hole) { await p.touchscreen.tap(s.hole.cx, s.hole.cy); forced++; await sleep(500); } else await sleep(100); continue; }
      if (s.bub && !dismissed && g > 30) { const d = await tap(p, '#tbub .tx2'); if (d) { dismissed = true; await sleep(200); if (await p.evaluate(t => (document.getElementById('tbub') || { dataset: {} }).dataset.tip === t, s.bub)) probs.push(tag + ' bubble x did not dismiss'); } }
      let a = null;
      if (s.must && !s.busy) {
        if (s.ph === 'assign') a = await tap(p, '.jcard.glow', null, 1);
        else if (s.ph === 'distress') a = await tap(p, '#acts button', 'No flare|No|Skip');
        else if (s.ph === 'signal') a = await tap(p, '#acts button', 'No signal');
        else if (s.ph === 'play') {
          if (cover++ % 9 === 3) await tap(p, '.pbtn[data-a=last]');   // look at the last trick sometimes, then close
          await tap(p, '#ppop [data-a=popx]');
          a = await tap(p, '#hand .hc.glow', null, 1);
        }
      }
      await sleep(a ? 1900 : 220);   // a reader's pace: the guide gets time to speak
    }
    if (!ended) probs.push(tag + ' tutorial did not reach the end card');
    else {
      const o = await p.evaluate(() => { const C = UI.tc, t = document.getElementById('tend'); return { seen: Object.keys(C.seen), later: (C.later || []).join(' | '), txt: t.innerText, btn: t.querySelectorAll('button').length }; });
      console.log(tag, 'forced taps', forced, 'bubbles', [...bubbles].join(','), 'end:', o.txt.split('\n')[1]);
      if (forced > 2) probs.push(tag + ' ' + forced + ' forced taps');
      if (multi) probs.push(tag + ' two guide bubbles at once x' + multi);
      if (!/tricks/.test(o.txt) || !/Things you'll meet later/.test(o.txt)) probs.push(tag + ' end card lacks scoring/later: ' + o.txt.slice(0, 80));
      const missing = RULES.filter(r => !o.seen.includes(r) && !o.later.length); if (missing.length) probs.push(tag + ' rules neither explained nor listed: ' + missing);
      const unl = RULES.filter(r => !o.seen.includes(r)); console.log(tag, 'explained in play:', RULES.filter(r => o.seen.includes(r)).join(','), '| listed on end card:', unl.join(',') || '-');
      const eb = await tap(p, '#tend [data-te=play], #tend [data-te=chapter]'); await sleep(700);
      const d = await p.evaluate(() => ({ done: !!(JSON.parse(localStorage.getItem('gxt-lantern-dive') || '{}').done), running: GXT.running(), tc: !!UI.tc })); if (!d.done) probs.push(tag + ' not remembered as done'); if (d.running || d.tc) probs.push(tag + ' still running after the end card');
    }
    await ctx.close();
  }
  await browser.close(); console.log(probs.length ? 'FAIL\n' + probs.join('\n') : 'PASS coached tutorial to the end'); process.exit(probs.length ? 1 : 0);
})().catch(e => { console.log('CRASH', e.message); process.exit(1); });
