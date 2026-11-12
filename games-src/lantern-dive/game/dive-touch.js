// R13 fix gate: full Free-play dives by touch at default computer speed. Measures the wait from each of my card taps to my next turn,
// counts dives won, checks no cut text (ellipsis/clamp overflow) in my seat strip, 0 errors. Policy "careful newcomer": take the glowing job the
// game offers, never signal, play the card a careful but imperfect player picks (the computer's easy level: few futures, 22 % random).
// NAIVE=1: lowest glowing card, the highest when my job card is on the table.  SIZE=375x667 DIVES=4 node dive-touch.js
const PW = (() => { try { return require('playwright'); } catch (e) { return require('/opt/node-tools/node_modules/playwright'); } })();
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, 'lantern-dive.html'));
const [VW, VH] = (process.env.SIZE || '390x844').split('x').map(Number), DIVES = +process.env.DIVES || 3, SH = process.env.SHOTS;
const sleep = ms => new Promise(r => setTimeout(r, ms)); const probs = [];
async function tapAt(p, sel, filter, pick) {
  const t = await p.evaluate(([sel, filter, pick]) => {
    let els = [...document.querySelectorAll(sel)].filter(e => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4 && (!filter || new RegExp(filter, 'i').test(e.textContent.trim())); });
    if (pick === 'last') els = els.reverse();
    for (const e of els) { const r = e.getBoundingClientRect();
      for (const [fx, fy] of [[.3, .25], [.5, .5], [.3, .5], [.2, .2], [.5, .2], [.15, .6]]) { const x = r.left + r.width * fx, y = r.top + r.height * fy; if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue;
        const t = document.elementFromPoint(x, y); if (t && (t === e || e.contains(t))) return [x, y]; } } return null;
  }, [sel, filter || null, pick || null]);
  if (!t) return false; await p.touchscreen.tap(t[0], t[1]); return true;
}
async function cutCheck(p, tag) {
  const bad = await p.evaluate(() => { const out = []; for (const e of document.querySelectorAll('#mine *, #barprompt *, #prompt, .seat .jc, .seat .t, #acts *')) { const r = e.getBoundingClientRect(); if (r.width < 2 || !e.childNodes.length || ![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
    const cs = getComputedStyle(e); if (e.scrollWidth > e.clientWidth + 1 && cs.overflow !== 'visible') out.push('W:' + e.textContent.trim().slice(0, 30)); if (e.scrollHeight > e.clientHeight + 4 && cs.overflow !== 'visible' && cs.display !== 'inline') out.push('H:' + e.textContent.trim().slice(0, 30));
    if (parseFloat(cs.fontSize) < 13.9) out.push('px' + cs.fontSize + ':' + e.textContent.trim().slice(0, 20)); } return out; });
  if (bad.length) probs.push(tag + ' cut/small text: ' + [...new Set(bad)].slice(0, 5).join(' | '));
}
(async () => {
  const browser = await PW.chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: VW, height: VH }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  await ctx.route('**/*', r => { const u = new URL(r.request().url()); if (u.host !== 'gns.test') return r.abort(); return u.pathname === '/' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.fulfill({ status: 404, body: '' }); });
  const p = await ctx.newPage(); p.setDefaultTimeout(15000);
  p.on('pageerror', e => probs.push('PAGE ERROR ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load|favicon|404/.test(m.text())) probs.push('console ' + m.text().slice(0, 120)); });
  await p.goto('https://gns.test/?phone=1'); await sleep(900); await p.evaluate(() => { try { localStorage.clear(); } catch (e) { } }); await p.reload(); await sleep(1500);
  if (!await tapAt(p, '[data-a=play]')) probs.push('no Free play'); await sleep(600);
  if (!await tapAt(p, '[data-start=vs]')) probs.push('no Start'); await sleep(1200);
  const waits = []; let wins = 0, done = 0, tAfter = 0, shot = 0, last = '', lastT = Date.now();
  for (let i = 0; i < 6000 && done < DIVES; i++) {
    const s = await p.evaluate(() => ({ ph: G.phase, must: iMustAct(), busy: UI.busy, over: UI.overShown, ok: G.result && G.result.ok, sig: G.phase + G.att + G.tricks.length + (G.trick ? G.trick.plays.length : 0) + (G.tasks || []).map(t => t.owner).join('') }));
    if (s.sig !== last) { last = s.sig; lastT = Date.now(); } else if (Date.now() - lastT > 15000) { probs.push('stuck in ' + s.ph); break; }
    if (s.ph === 'over') {
      if (await p.evaluate(() => !!UI.overShown)) { done++; if (s.ok) wins++; console.log('dive', done, s.ok ? 'WON' : 'lost', await p.evaluate(() => (G.result.why || '').slice(0, 60)));
        if (SH && done === 1) await p.screenshot({ path: SH + '-result.png' });
        await sleep(400); if (!await tapAt(p, '#rs button, .sheet button, #dlg button, button', s.ok ? '^(Next dive|Next|Continue)' : '^(Try again|Same jobs|Retry|Dive again)')) await tapAt(p, '#rs button, #dlg button, .sheet button'); await sleep(1200); tAfter = 0; continue; }
      await tapAt(p, 'button', '^(Result|Show result)$'); await sleep(300); continue;
    }
    let a = await tapAt(p, 'button', '^(Next|Got it|Continue|OK|Dive|Ready)$');
    if (!a && s.must && !s.busy) {
      if (s.ph === 'play' && tAfter) { waits.push((Date.now() - tAfter) / 1000); tAfter = 0; }
      if (s.ph === 'assign') a = (await tapAt(p, '.jcard.glow')) || (await tapAt(p, '[data-a=seat].glow, .seat.glow')) || (await tapAt(p, '#acts button.go, #acts button'));
      else if (s.ph === 'distress') a = await tapAt(p, '#acts button', 'No flare|No|Skip');
      else if (s.ph === 'signal') a = await tapAt(p, '#acts button', 'No signal');
      else if (s.ph === 'predict') { const n = await p.evaluate(() => { let m = null; try { m = LD.AI.choose(G, viewSeat(), 'easy'); } catch (e) { } return m && m.n != null ? m.n : 1; }); a = await tapAt(p, '#acts button', '^' + n + '$'); if (a) { await sleep(200); await tapAt(p, '#acts button', '^(Confirm|OK|Done|Say it)'); } }
      else if (s.ph === 'pass') a = await tapAt(p, '#hand .hc.glow');
      else if (s.ph === 'play') {
        const plan = await p.evaluate((NAIVE_) => { const v = viewSeat(), L = LD.playable(G, v), tagged = [...document.querySelectorAll('#hand .hc.glow .jtg.me')].map(e => +e.closest('.hc').dataset.id);
          const onTable = G.trick.plays.some(x => G.tasks.some((t, i) => t.owner === v && jobSt(i) === 0 && (TASKS[t.id].cs || []).includes(x.c)));
          const val = c => c >= 36 ? 20 + c : c % 9; const srt = L.slice().sort((a, b) => val(a) - val(b));
          if (NAIVE_) { if (onTable) return srt[srt.length - 1]; if (tagged.length && G.trick.plays.length) return tagged[0]; return srt[0]; }
          let m = null; try { m = LD.AI.choose(G, v, 'easy'); } catch (e) { } return m && m.t === 'play' ? m.c : srt[0]; }, !!process.env.NAIVE);
        if (SH && shot < 2 && (i % 7 === 0)) { await p.screenshot({ path: SH + '-turn' + (++shot) + '.png' }); await cutCheck(p, 'turn'); }
        await cutCheck(p, 'play');
        a = await tapAt(p, '#hand .hc[data-id="' + plan + '"]'); if (a) tAfter = Date.now();
      }
    }
    await sleep(a ? 120 : 60);
  }
  waits.sort((a, b) => a - b); const med = waits.length ? waits[Math.floor(waits.length / 2)] : 0;
  console.log(VW + 'x' + VH + ': dives ' + done + ', won ' + wins + ', turns ' + waits.length + ', wait median ' + med.toFixed(1) + ' s, max ' + (waits[waits.length - 1] || 0).toFixed(1) + ' s');
  console.log(probs.length ? 'PROBLEMS\n' + [...new Set(probs)].slice(0, 12).join('\n') : 'PASS 0 errors, no cut text');
  await browser.close(); process.exit(probs.length ? 1 : 0);
})().catch(e => { console.log('CRASH', e.message); process.exit(1); });
