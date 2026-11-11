// Board-first walk-through with real taps (no dispatched clicks): title -> guided game -> pull chips from the bag -> stop / explode ->
// day report -> shop (tap chips, Done) -> day 2. Saves screenshots to shots/<prefix>_NN_name.png and prints page errors.
//   node bf-shot.js [WxH=390x763] [prefix=bf] [--vs]
const fs = require('fs'), path = require('path');
const L = require('./pwlib.js');
const [W, H] = (process.argv[2] || '390x763').split('x').map(Number), pre = process.argv[3] || 'bf', vs = process.argv.includes('--vs');
const OUT = path.join(__dirname, 'shots'); fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await L.launch(); const p = await L.page(b, W, H, { mobile: true, touch: true });
  await p.goto('https://gns.test/?seed=21'); await p.waitForTimeout(900);
  let n = 0; const shot = async nm => { await p.screenshot({ path: path.join(OUT, pre + '_' + String(++n).padStart(2, '0') + '_' + nm + '.png') }); console.log('shot', n, nm); };
  const tapSel = async sel => { const e = await p.$(sel); if (!e) return false; const r = await e.boundingBox(); if (!r) return false; await p.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); return true; };
  await tapSel('[data-a=play]'); await p.waitForTimeout(300);
  await tapSel(vs ? '[data-start=vs]' : '[data-start=guided]'); await p.waitForTimeout(1200); await shot('start');
  for (let day = 1; day <= 2; day++) {
    for (let k = 0; k < 16; k++) {
      if (await tapSel('#pc [data-a=tipok]')) { await p.waitForTimeout(300); }
      const st = await p.evaluate(() => { const v = viewSeat(), q = G.players[v]; return { brew: G.phase === 'brew' && q.st === 'draw' && !q.q, q: q.q && q.q.h, pb: G.phase === 'brew' && q.st === 'draw' ? CF.risk(G, v).pBoom : 0, rs: !UI.rsOpen ? '' : UI.rsMode, n: q.pot.length }; });
      if (st.rs) break;
      if (st.q && !st.brew) { await shot('d' + day + 'q-' + st.q); await tapSel('#qbox [data-a=mv]'); await p.waitForTimeout(600); continue; }
      if (!st.brew) { await p.waitForTimeout(500); continue; }
      if (st.n >= 3 && st.pb >= .3 && day === 1 && !vs) { await shot('d' + day + 'risky'); await tapSel('#acts .stopb'); await p.waitForTimeout(800); await shot('d' + day + 'stopped'); break; }
      await tapSel('#acts .bagb'); await p.waitForTimeout(250); if (k === 1) await shot('d' + day + 'pulling'); await p.waitForTimeout(700); if (k < 3 || k % 3 === 0) await shot('d' + day + 'chip' + k);
    }
    for (let w = 0; w < 40; w++) { if (await p.evaluate(() => UI.rsOpen)) break; await p.waitForTimeout(300); }
    await p.waitForTimeout(500); await shot('d' + day + 'report');
    for (let k = 0; k < 12; k++) {
      const st = await p.evaluate(() => { const v = viewSeat(), q = G.players[v]; return { rs: UI.rsOpen, q: q.q && q.q.h }; });
      if (!st.rs) break;
      if (await tapSel('#rstip [data-a=tipok]')) { await p.waitForTimeout(300); continue; }
      if (st.q === 'shop') { await shot('d' + day + 'shop'); await tapSel('#rs .tok:not([disabled])'); await p.waitForTimeout(200); await shot('d' + day + 'shopfly'); await p.waitForTimeout(500); await shot('d' + day + 'shop1'); await tapSel('#rs [data-a=shopbuy]'); await p.waitForTimeout(350); await shot('d' + day + 'buying'); await p.waitForTimeout(900); continue; }
      if (st.q && !['gift','g2','g4','p1','g3','p2','p4','de','shop','ruby'].includes(st.q)) { if (await tapSel('#rs [data-a=rscont]:not([disabled])')) { await p.waitForTimeout(900); continue; } }
      if (st.q) { await shot('d' + day + 'q-' + st.q); await tapSel('#rs .dec [data-a=mv]'); await p.waitForTimeout(700); continue; }
      if (await tapSel('#rs [data-a=rscont]:not([disabled])')) { await p.waitForTimeout(900); continue; }
      await p.waitForTimeout(500);
    }
    await shot('d' + (day + 1) + 'begin');
  }
  console.log('errors', JSON.stringify(p.errs.slice(0, 5)));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
