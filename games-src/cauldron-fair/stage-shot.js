// Day-end walk-through with real taps: plays to the end of day 1, then screenshots the tally mid-sequence and after it,
// the market stall (and one chip in the bag), and the ruby board when it comes. Saves to playtest/stage_<size>_NN_name.png.
//   node stage-shot.js [WxH=390x763] [seed=21] [prefix=stage]   env: RUBIES=6 (start with that many rubies), BOOM=1 (never stop: reach the points-or-shop choice), DAYS=3, GUIDED=1
const fs = require('fs'), path = require('path'); const L = require('./pwlib.js');
const [W, H] = (process.argv[2] || '390x763').split('x').map(Number), seed = process.argv[3] || '21', pre = process.argv[4] || 'stage';
const OUT = path.join(__dirname, 'playtest'); fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await L.launch(); const p = await L.page(b, W, H, { mobile: true, touch: true });
  await p.goto('https://gns.test/?seed=' + seed); await p.waitForTimeout(900);
  let n = 0; const shot = async nm => { const f = path.join(OUT, pre + '_' + W + 'x' + H + '_' + String(++n).padStart(2, '0') + '_' + nm + '.png'); await p.screenshot({ path: f }); console.log('shot', f); };
  const tapSel = async sel => { const e = await p.$(sel); if (!e) return false; const r = await e.boundingBox(); if (!r) return false; await p.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); return true; };
  await tapSel('[data-a=play]'); await p.waitForTimeout(300); await tapSel(process.env.GUIDED ? '[data-start=guided]' : '[data-start=vs]'); await p.waitForTimeout(1200);
  if (process.env.RUBIES) await p.evaluate(n => { G.players[0].rubies = +n; render(); }, process.env.RUBIES);
  for (let day = 1; day <= (+process.env.DAYS || 3); day++) {
    for (let k = 0; k < 20; k++) {
      if (await tapSel('#pc [data-a=tipok]')) { await p.waitForTimeout(250); }
      const st = await p.evaluate(() => { const v = viewSeat(), q = G.players[v]; return { brew: G.phase === 'brew' && q.st === 'draw' && !q.q, q: q.q && q.q.h, pb: G.phase === 'brew' && q.st === 'draw' ? CF.risk(G, v).pBoom : 0, rs: UI.rsOpen, n: q.pot.length }; });
      if (st.rs) break;
      if (st.q && !st.brew) { await tapSel('#qbox [data-a=mv]'); await p.waitForTimeout(600); continue; }
      if (!st.brew) { await p.waitForTimeout(500); continue; }
      if (!process.env.BOOM && st.n >= 3 && st.pb >= .15) { await tapSel('#acts .stopb'); await p.waitForTimeout(500); break; }
      await tapSel('#acts .bagb'); await p.waitForTimeout(1100);
    }
    for (let w = 0; w < 60; w++) { if (await p.evaluate(() => UI.rsOpen && UI.rsMode === 'report' && !!document.querySelector('#rs .ds'))) break; await p.waitForTimeout(250); }
    await p.waitForTimeout(700); await shot('d' + day + '_tally_mid');
    await p.waitForTimeout(2600); await shot('d' + day + '_tally_end');
    for (let k = 0; k < 14; k++) {
      const st = await p.evaluate(() => { const v = viewSeat(), q = G.players[v]; return { rs: UI.rsOpen, q: q.q && q.q.h, kind: (document.querySelector('.rsbox.stg') || {}).className || '' }; });
      if (!st.rs) break;
      if (await tapSel('#rstip [data-a=tipok]')) { await p.waitForTimeout(300); continue; }
      if (st.q === 'shop') { await shot('d' + day + '_shop'); await tapSel('#rs .tok:not([disabled])'); await p.waitForTimeout(250); await shot('d' + day + '_shopfly'); await p.waitForTimeout(600); await shot('d' + day + '_shop1'); await tapSel('#rs [data-a=shopbuy]'); await p.waitForTimeout(1500); continue; }
      if (st.q === 'ruby') { await shot('d' + day + '_ruby'); await tapSel('#rs .rtg:not(.here)'); await p.waitForTimeout(400); await shot('d' + day + '_ruby2'); await tapSel('#rs [data-a=rubygo]'); await p.waitForTimeout(1200); continue; }
      if (st.q === 'de') { await shot('d' + day + '_de'); await tapSel('#rs .dpick'); await p.waitForTimeout(900); continue; }
      if (st.q) { await shot('d' + day + '_q-' + st.q); await tapSel('#rs .dec [data-a=mv]'); await p.waitForTimeout(700); continue; }
      if (await tapSel('#rs [data-a=rscont]:not([disabled])')) { await p.waitForTimeout(900); continue; }
      await p.waitForTimeout(500);
    }
    await shot('d' + (day + 1) + '_begin');
  }
  console.log('errors', JSON.stringify(p.errs.slice(0, 5)));
  await b.close();
})();
