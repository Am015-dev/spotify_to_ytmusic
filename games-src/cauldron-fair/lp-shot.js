// Long-press check: the fortune chip on the board and a chip in the market. Saves playtest/lp_<size>_*.png and prints the bubble text.
//   node lp-shot.js [WxH=390x763] [seed=21]
const fs = require('fs'), path = require('path'); const L = require('./pwlib.js');
const [W, H] = (process.argv[2] || '390x763').split('x').map(Number), seed = process.argv[3] || '21';
const OUT = path.join(__dirname, 'playtest'); fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await L.launch(); const p = await L.page(b, W, H, { mobile: false, touch: false });
  await p.goto('https://gns.test/?seed=' + seed); await p.waitForTimeout(900);
  const tapSel = async sel => { const e = await p.$(sel); if (!e) return false; const r = await e.boundingBox(); if (!r) return false; await p.mouse.click(r.x + r.width / 2, r.y + r.height / 2); return true; };
  const press = async (sel, name) => { const e = await p.$(sel); if (!e) { console.log('missing', sel); return; } const r = await e.boundingBox(); await p.mouse.move(r.x + r.width / 2, r.y + r.height / 2); await p.mouse.down(); await p.waitForTimeout(650); await p.screenshot({ path: path.join(OUT, 'lp_' + W + 'x' + H + '_' + name + '.png') }); console.log(name, JSON.stringify(await p.evaluate(() => { const b = document.querySelector('#lpb'); return b ? b.innerText : null; }))); await p.mouse.up(); await p.waitForTimeout(200); };
  await tapSel('[data-a=play]'); await p.waitForTimeout(300); await tapSel('[data-start=vs]'); await p.waitForTimeout(1200);
  for (let k = 0; k < 3; k++) { if (await tapSel('#pc [data-a=tipok]')) await p.waitForTimeout(250); }
  await press('#fortchip', 'fortune');
  for (let k = 0; k < 20; k++) {
    if (await tapSel('#pc [data-a=tipok]')) { await p.waitForTimeout(250); }
    const st = await p.evaluate(() => { const v = viewSeat(), q = G.players[v]; return { brew: G.phase === 'brew' && q.st === 'draw' && !q.q, q: q.q && q.q.h, rs: UI.rsOpen, n: q.pot.length, pb: G.phase === 'brew' && q.st === 'draw' ? CF.risk(G, v).pBoom : 0 }; });
    if (st.rs) break; if (st.q && !st.brew) { await tapSel('#qbox [data-a=mv]'); await p.waitForTimeout(600); continue; }
    if (!st.brew) { await p.waitForTimeout(500); continue; }
    if (st.n >= 3 && st.pb >= .15) { await tapSel('#acts .stopb'); await p.waitForTimeout(500); break; }
    await tapSel('#acts .bagb'); await p.waitForTimeout(1100);
  }
  for (let w = 0; w < 60; w++) { if (await p.evaluate(() => UI.rsOpen && !!document.querySelector('#rs .mkt'))) break; await p.waitForTimeout(300); }
  await p.waitForTimeout(500);
  await press('#rs .tokw >> nth=1', 'chip'); await press('#rs .stall.locked', 'locked');
  console.log('errors', JSON.stringify(p.errs.slice(0, 5))); await b.close();
})();
