// Rotation test: play a few real moves, turn the phone back and forth (also with the stale iOS size right after turning) and check the table each time.
//   NODE_PATH=/opt/node-tools/node_modules node rotate-test.js [games=6] [file=sands.html]
// Fails on: page errors, horizontal scroll, the grid or a seat or a button off screen or covered, the grid collapsed, a glowing tile that cannot be tapped after turning,
// the wrong layout class for the size, a status line over 8 words.
const { chromium } = require('playwright');
const path = require('path');
const FILE = path.resolve(__dirname, process.argv[3] || 'sands.html'), N = +process.argv[2] || 6;
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const AUDIT = `(() => {
  const bad = [], W = innerWidth, H = innerHeight, de = document.documentElement;
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 3 && r.height > 3 && !e.closest('[hidden]'); };
  if (Math.max(de.scrollWidth, document.body.scrollWidth) > W + 1) bad.push('hscroll ' + de.scrollWidth + '>' + W);
  const g = document.getElementById('grid').getBoundingClientRect();
  if (g.width < 150 || g.height < 120) bad.push('grid collapsed ' + Math.round(g.width) + 'x' + Math.round(g.height));
  if (g.right > W + 1 || g.left < -1 || g.bottom > H + 1 || g.top < 0) bad.push('grid off screen ' + [g.left, g.top, g.right, g.bottom].map(Math.round));
  const want = W > H && W >= 520; if (de.classList.contains('land') !== want) bad.push('layout class land=' + de.classList.contains('land') + ' for ' + W + 'x' + H);
  const bd = document.querySelector('[data-board]').getBoundingClientRect(); if (H > W && 100 * bd.width * bd.height / (W * H) < 55) bad.push('board ' + Math.round(100 * bd.width * bd.height / (W * H)) + '%');
  for (const s of document.querySelectorAll('#seats .sch')) { const r = s.getBoundingClientRect(); if (r.left < -1 || r.right > W + 1 || r.bottom > H + 1 || r.height < 20) bad.push('seat chip off screen or collapsed'); }
  for (const b of document.querySelectorAll('#acts button')) { if (!vis(b)) continue; const r = b.getBoundingClientRect(); if (r.left < -1 || r.right > W + 1 || r.bottom > H + 1) bad.push('button off screen'); const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); if (t && t !== b && !b.contains(t)) bad.push('button covered'); }
  const ln = document.getElementById('line').textContent.replace(/[^a-zA-Z0-9'’]+/g, ' ').trim().split(' ').filter(w => /[a-z][a-z]/i.test(w)); if (ln.length > 8) bad.push('status over 8 words');
  const tl = [...document.querySelectorAll('#grid .tile')]; const sm = tl.filter(t => { const r = t.getBoundingClientRect(); return r.width < 28 || r.height < 28; }); if (sm.length) bad.push(sm.length + ' tiles under 28px');
  return bad;
})()`;
const SEQ = [[390, 763], [844, 390], [390, 763], [375, 553], [812, 375], [390, 763], [1024, 768], [390, 763]];
async function one(browser, gi) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 763 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA, serviceWorkers: 'block' });
  const page = await ctx.newPage(); const errs = [], issues = new Set();
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  try {
    await page.goto('file://' + FILE); await sleep(700);
    await page.evaluate(`setSeed(${gi * 31 + 5});UI.setup.np=${[2, 3, 2, 4, 2, 5][gi % 6]};UI.setup.ex=Object.assign(UI.setup.ex,{artisans:${gi % 3 === 2},sultan:${gi % 6 === 5}});beginGame();UI.speed=6`);
    const step = async () => { for (let k = 0; k < 9; k++) {
      const st = await page.evaluate('({over:!!G.over,me:!!me(),modal:UI.modal})'); if (st.over) return;
      if (st.me) { const r = await page.evaluate(`(()=>{const q=s=>[...document.querySelectorAll(s)].filter(e=>e.getBoundingClientRect().width>3&&!e.disabled&&!e.closest('[hidden]'));const e=q('#chz button')[0]||q('.glow')[0]||q('#acts button:not(.ghost)')[0];if(!e)return null;e.scrollIntoView&&0;const r=e.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,t=document.elementFromPoint(x,y);return {x,y,ok:t&&(t===e||e.contains(t)||t.contains(e)),cov:t&&(t.id||t.className)}})()`);
        if (r && r.ok) await page.touchscreen.tap(r.x, r.y); else if (r) issues.add('a glowing target is covered after turning: ' + r.cov); }
      await sleep(180); } };
    await step();
    for (let i = 1; i < SEQ.length * 2; i++) {
      const [w, h] = SEQ[i % SEQ.length], stale = i % 2 === 0;
      const ev = () => page.evaluate(`(()=>{window.dispatchEvent(new Event('resize'));window.dispatchEvent(new Event('orientationchange'));try{screen.orientation&&screen.orientation.dispatchEvent(new Event('change'))}catch(e){}})()`).catch(() => {});
      if (stale) { await ev(); await page.setViewportSize({ width: w, height: h }); await ev(); await sleep(250); await sleep(900); }
      else { await page.setViewportSize({ width: w, height: h }); await ev(); await sleep(900); }
      for (const b of await page.evaluate(AUDIT)) issues.add(w + 'x' + h + ' ' + b);
      await step();
      for (const b of await page.evaluate(AUDIT)) issues.add(w + 'x' + h + ' after moves: ' + b);
      if (await page.evaluate('!!G.over')) break;
    }
  } catch (e) { issues.add('crash ' + String(e.message).slice(0, 100)); }
  await ctx.close(); return { gi, errs, issues: [...issues] };
}
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] }); const out = []; const q = [...Array(N).keys()]; let fail = 0;
  await Promise.all(Array.from({ length: Math.min(3, N) }, async () => { while (q.length) { const r = await one(browser, q.shift()); out.push(r); const bad = r.errs.length || r.issues.length; if (bad) fail++;
    console.log(`${bad ? 'FAIL' : 'ok  '} rotate game ${r.gi}${r.errs.length ? ' errors: ' + [...new Set(r.errs)].join(' | ') : ''}`); for (const i of r.issues.slice(0, 8)) console.log('     - ' + i); } }));
  await browser.close(); console.log(`\n${out.length - fail}/${out.length} rotation runs clean`); process.exit(fail ? 1 : 0);
})();
