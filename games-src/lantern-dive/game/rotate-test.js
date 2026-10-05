// Rotation test: play a few moves, rotate the phone back and forth (also with the stale iOS size right after turning), and check the table each time.
//   NODE_PATH=/opt/node-tools/node_modules node rotate-test.js [games=6]
// Fails on: page errors, horizontal scroll, a hand card or seat off screen, a seat covering a trick card, the table collapsed, a glowing card that cannot be tapped after turning.
const { chromium } = require('playwright');
const path = require('path');
const FILE = path.resolve(__dirname, 'lantern-dive.html'), N = +process.argv[2] || 6;
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const AUDIT = `(() => {
  const bad = [], W = innerWidth, H = innerHeight, de = document.documentElement;
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 3 && r.height > 3 && !e.closest('[hidden]'); };
  if (Math.max(de.scrollWidth, document.body.scrollWidth) > W + 1) bad.push('hscroll ' + de.scrollWidth + '>' + W);
  const tr = document.getElementById('table').getBoundingClientRect(); if (tr.height < 100 || tr.width < W - 4) bad.push('table collapsed ' + Math.round(tr.width) + 'x' + Math.round(tr.height));
  if (H > W && 100 * tr.height / H < 55) bad.push('table ' + Math.round(100 * tr.height / H) + '%');
  if (document.getElementById('bd').getBoundingClientRect().bottom > H + 1) bad.push('board taller than the screen');
  for (const e of document.querySelectorAll('#hand .hc')) { const r = e.getBoundingClientRect(); if (r.left < -1 || r.right > W + 1 || r.bottom > H + 1) bad.push('hand card off screen'); }
  const ov = (a, b, m) => a.left < b.right - m && a.right > b.left + m && a.top < b.bottom - m && a.bottom > b.top + m;
  const slots = [...document.querySelectorAll('.tslot')].filter(vis);
  for (const s of document.querySelectorAll('#opp .seat')) { if (!vis(s)) continue; const r = s.getBoundingClientRect(); if (r.left < -1 || r.right > W + 1 || r.top < tr.top - 1 || r.bottom > tr.bottom + 1) bad.push('seat off the table'); for (const t of slots) if (ov(r, t.getBoundingClientRect(), 4)) bad.push('seat covers a trick slot'); }
  for (const b of document.querySelectorAll('#acts button')) { if (!vis(b)) continue; const r = b.getBoundingClientRect(); for (const t of slots) if (ov(r, t.getBoundingClientRect(), 4)) bad.push('button covers a trick slot'); if (r.right > W + 1 || r.left < -1) bad.push('button off screen'); }
  const pr = document.getElementById('prompt').textContent.replace(/[^a-zA-Z0-9'’]+/g, ' ').trim().split(' ').filter(Boolean); if (pr.length > 8) bad.push('status over 8 words');
  return bad;
})()`;
const SEQ = [[390, 763], [844, 390], [390, 763], [375, 553], [812, 375], [390, 763]];

async function one(browser, gi) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 763 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA, serviceWorkers: 'block' });
  const page = await ctx.newPage(); const errs = [], issues = new Set();
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  try {
    await page.goto('file://' + FILE); await sleep(900);
    const np = [4, 3, 5, 2, 4, 5][gi % 6], mission = [1, 2, 3, 5, 9, 17][gi % 6];
    await page.evaluate(`AIDELAY=120;UI.seed=${gi * 31 + 5};newGame('vs',{np:${np},mission:${mission},kind:'log'})`);
    const step = async () => {   // a few real moves on whatever glows
      for (let k = 0; k < 7; k++) {
        const st = await page.evaluate('({over:G.phase==="over",must:iMustAct(),busy:UI.busy})'); if (st.over) return;
        if (st.must && !st.busy) {
          const r = await page.evaluate(`(()=>{const q=s=>[...document.querySelectorAll(s)].filter(e=>e.getBoundingClientRect().width>3&&!e.disabled&&!e.closest('[hidden]'));const e=q('#pool .jcard.glow')[0]||q('#hand .hc.glow')[0]||q('#opp .dc.glow')[0]||q('.seat.glow')[0]||q('#acts button')[0];if(!e)return null;const r=e.getBoundingClientRect();const t=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return {x:r.left+r.width/2,y:r.top+r.height/2,ok:!!t&&(t===e||e.contains(t)||t.contains(e))}})()`);
          if (r && r.ok) await page.touchscreen.tap(r.x, r.y); else if (r) issues.add('a glowing target is covered after rotating');
        }
        await sleep(260);
      }
    };
    await step();
    for (let i = 1; i < SEQ.length * 2; i++) {
      const [w, h] = SEQ[i % SEQ.length], stale = i % 2 === 0;
      const ev = () => page.evaluate(`(()=>{window.dispatchEvent(new Event('resize'));window.dispatchEvent(new Event('orientationchange'));try{screen.orientation&&screen.orientation.dispatchEvent(new Event('change'))}catch(e){}})()`).catch(() => {});
      if (stale) { await ev(); await page.setViewportSize({ width: w, height: h }); await ev(); await sleep(250); await sleep(1100); }
      else { await page.setViewportSize({ width: w, height: h }); await ev(); await sleep(1100); }
      for (const b of await page.evaluate(AUDIT)) issues.add(w + 'x' + h + ' ' + b);
      await step();
      for (const b of await page.evaluate(AUDIT)) issues.add(w + 'x' + h + ' after moves: ' + b);
      if ((await page.evaluate('G.phase')) === 'over') break;
    }
  } catch (e) { issues.add('crash ' + String(e.message).slice(0, 100)); }
  await ctx.close();
  return { gi, errs, issues: [...issues] };
}
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const res = []; let next = 0;
  const worker = async () => { while (next < N) { const g = next++; const r = await one(browser, g); res.push(r); console.log((r.errs.length || r.issues.length ? 'FAIL ' : 'ok   ') + 'rotate game ' + g + (r.errs.length ? ' ERR ' + [...new Set(r.errs)].slice(0, 2).join(' | ') : '') + (r.issues.length ? ' ISSUES ' + r.issues.slice(0, 5).join(' | ') : '')); } };
  await Promise.all([worker(), worker()]);
  await browser.close();
  const bad = res.filter(r => r.errs.length || r.issues.length);
  console.log('ROTATE ' + (bad.length ? 'FAIL' : 'PASS') + ': ' + res.length + ' games, ' + bad.length + ' with problems');
  process.exit(bad.length ? 1 : 0);
})();
