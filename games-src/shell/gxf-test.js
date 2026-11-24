// Floating tutorial kit (gx-float.js) test on its worked example, Kaiten Kitchen with ?gxf=1.
//   node shell/gxf-test.js [sizes=402x874,1366x768]   prints PASS/FAIL, exit 1 on a problem; screenshots in shell/proof/
// Asserts: opens on the HUD map; map labels never overlap each other; a label tap explains it; the lessons complete by taps (predicate or
// Next); taps on things that are not the suggestion work; the window never overlaps the suggested target; minimise/chip, drag remembers
// position, close and ? reopen work; 0 JS errors.
const PW = (() => { try { return require('playwright'); } catch (e) { return require('../../node_modules/playwright'); } })();
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'kaiten', 'game', 'kaiten.html'));
const SIZES = (process.argv[2] || '402x874,1366x768').split(',').map(s => s.split('x').map(Number));
const PROOF = path.join(__dirname, 'proof'); fs.mkdirSync(PROOF, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms)); const probs = [];
const hit = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
async function run(b, W, H) {
  const tag = W + 'x' + H, phone = W < 600, note = m => probs.push(tag + ': ' + m);
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: phone, hasTouch: true });
  await ctx.route('**/*', r => new URL(r.request().url()).host === 'gns.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
  const p = await ctx.newPage(); p.setDefaultTimeout(15000);
  p.on('pageerror', e => note('PAGE ERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load|favicon/.test(m.text())) note('console error ' + m.text().slice(0, 140)); });
  await p.goto('https://gns.test/?gxf=1' + (phone ? '&phone=1' : ''));
  await p.waitForFunction(() => window.GXF && GXF.state() && GXF.state().open && document.querySelectorAll('#belt .hc[data-id]').length >= 5, null, { timeout: 20000 });
  await p.evaluate(() => { try { AIDELAY = 120; } catch (e) { } window.__ev = []; addEventListener('gxf', e => __ev.push(e.detail.type)); }); await sleep(800);
  const st = () => p.evaluate(() => GXF.state());
  // tap the centre of the first visible match; the element under the finger must be that element (nothing of the kit on top of it)
  const tap = async sel => {
    const pt = await p.evaluate(sel => { for (const e of document.querySelectorAll(sel)) { const r = e.getBoundingClientRect(); if (r.width < 8 || r.height < 8) continue; const x = r.left + r.width / 2, y = r.top + r.height / 2, u = document.elementFromPoint(x, y); return { x, y, ok: !!u && (u === e || e.contains(u)) }; } return null; }, sel);
    if (!pt) { note('nothing to tap: ' + sel); return false; } if (!pt.ok) note('something covers ' + sel);
    await p.touchscreen.tap(pt.x, pt.y); await sleep(400); return true;
  };
  const noOverlap = async where => { const s = await st(); if (s.overlap) note('window overlaps the target at ' + where); };
  // 1) HUD map first, labels apart
  let s = await st();
  if (!s.map) note('did not begin on the HUD map');
  if (s.labels.length < 8) note('only ' + s.labels.length + ' HUD labels');
  for (let i = 0; i < s.labels.length; i++) for (let j = i + 1; j < s.labels.length; j++) if (hit(s.labels[i], s.labels[j])) note('labels overlap: ' + s.labels[i].sel + ' / ' + s.labels[j].sel);
  if (s.labels.some(l => l.left < 0 || l.top < 0 || l.right > W || l.bottom > H)) note('a label is off screen');
  for (const l of s.labels) if (hit(s.win, l)) note('window covers label ' + l.sel);
  await p.screenshot({ path: path.join(PROOF, 'gxf-' + tag + '-map.png') });
  await tap('.gxf-lab[data-sel="#belt"]');
  if (!/Belt:/.test(await p.textContent('.gxf-say'))) note('label tap did not explain the belt');
  await noOverlap('map info');
  await p.screenshot({ path: path.join(PROOF, 'gxf-' + tag + '-label.png') });
  await tap('.gxf-ft .pri');   // Start lessons
  s = await st(); if (s.map || s.id !== 'pick') note('Start lessons did not open lesson 1');
  // 2) a tap on something NOT suggested works: open and close the rules
  await tap('[data-gx="rulesd"]');
  const rulesOpen = await p.evaluate(() => document.querySelector('[data-gx="rulesd"]').getAttribute('aria-expanded') === 'true' || !!document.querySelector('.gx-drawer[open], dialog[open]'));
  if (!rulesOpen) note('non-suggested tap (Rules) did nothing');
  await p.keyboard.press('Escape'); await sleep(300);
  await p.evaluate(() => { try { GX.close(); } catch (e) { } }); await sleep(300);
  // 3) lessons by taps: pick by taking a dish (predicate), Next, pass (predicate), Next, Next
  await noOverlap('pick'); await p.screenshot({ path: path.join(PROOF, 'gxf-' + tag + '-pick.png') });
  const takeDish = async want => {
    for (let k = 0; k < 6 && (await st()).id !== want; k++) {
      await p.waitForFunction(() => typeof canPick === 'function' && canPick(), null, { timeout: 15000 }).catch(() => { });
      await tap('#belt .hc[data-id]:not(.locked)'); await sleep(500);
      if (await p.evaluate(() => G.phase === 'pick' && !G.players[viewSeat()].picked && !!document.querySelector('#belt .hc.sel'))) {
        const serve = await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /serve/i.test(x.textContent) && x.getBoundingClientRect().width > 8); if (!b) return null; const r = b.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
        if (serve) await p.touchscreen.tap(serve[0], serve[1]); else await tap('#belt .hc.sel');
      }
      await sleep(1500);
    }
  };
  await takeDish('tray');
  s = await st(); if (s.id !== 'tray') note('taking a dish did not complete lesson 1 (at ' + s.id + ')');
  await noOverlap('tray'); await tap('.gxf-ft .pri');
  await noOverlap('pass'); await takeDish('rivals');
  s = await st(); if (s.id !== 'rivals') note('second dish did not complete the pass lesson (at ' + s.id + ')');
  await noOverlap('rivals'); await p.screenshot({ path: path.join(PROOF, 'gxf-' + tag + '-rivals.png') });
  // 4) minimise to a chip, restore; drag the header and check the position is stored
  await tap('.gxf-hd .gxf-ib[aria-label="Minimise"]'); if (!(await st()).min || !(await p.$('.gxf-chip'))) note('minimise gave no chip');
  await tap('.gxf-chip'); if ((await st()).min) note('chip did not restore the window');
  const hd = await p.evaluate(() => { const r = document.querySelector('.gxf-hd b').getBoundingClientRect(); return [r.left + 10, r.top + r.height / 2]; });
  await p.mouse.move(hd[0], hd[1]); await p.mouse.down(); await p.mouse.move(hd[0] + 3, hd[1] + 40, { steps: 4 }); await p.mouse.move(hd[0] + 6, hd[1] + 80, { steps: 4 }); await p.mouse.up(); await sleep(400);
  const stored = await p.evaluate(() => { try { return JSON.parse(localStorage.getItem('gxf-kaiten')).pos; } catch (e) { return null; } });
  if (!stored) note('dragged position was not remembered');
  await noOverlap('after drag');
  await tap('.gxf-ft .pri'); await noOverlap('hint'); await tap('.gxf-ft .pri');
  s = await st(); if (!s.complete) note('tutorial did not complete'); if (s.done.length !== 5) note('checklist ticked ' + s.done.length + '/5');
  await p.screenshot({ path: path.join(PROOF, 'gxf-' + tag + '-done.png') });
  // 5) close, then ? reopens the HUD map
  await tap('.gxf-hd .gxf-ib[aria-label="Close"]'); if ((await st()).open || await p.$('.gxf-win')) note('close left the window');
  await tap('.gxf-q'); s = await st(); if (!s.open || !s.map) note('? did not reopen the HUD map');
  const ev = await p.evaluate(() => __ev.join(',')); ['step', 'complete', 'close', 'open'].forEach(t => { if (ev.indexOf(t) < 0) note('no ' + t + ' event'); });
  await ctx.close();
}
(async () => {
  const b = await PW.chromium.launch();
  for (const [W, H] of SIZES) { const n = probs.length; await run(b, W, H).catch(e => probs.push(W + 'x' + H + ': CRASH ' + e.message.split('\n')[0])); console.log((probs.length === n ? 'PASS ' : 'FAIL ') + W + 'x' + H); }
  await b.close(); probs.forEach(x => console.log('  ' + x)); process.exit(probs.length ? 1 : 0);
})();
