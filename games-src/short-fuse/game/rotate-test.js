// Rotation test: play a few moves, rotate the phone back and forth (also with the stale iOS size right after turning), and check the table each time.
//   NODE_PATH=/opt/node-tools/node_modules node rotate-test.js [games=6]
// Fails on: page errors, horizontal scroll, tiles off screen or clipped, my stand covered, the table collapsed, a glowing tile that cannot be tapped after turning.
const { chromium } = require('playwright');
const path = require('path');
const FILE = path.resolve(__dirname, 'shortfuse.html'), N = +process.argv[2] || 6;
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const AUDIT = `(() => {
  const bad = [], W = innerWidth, H = innerHeight, de = document.documentElement;
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 3 && r.height > 3 && !e.closest('[hidden]'); };
  if (Math.max(de.scrollWidth, document.body.scrollWidth) > W + 1) bad.push('hscroll ' + de.scrollWidth + '>' + W);
  const tb = document.getElementById('tb'), tr = tb.getBoundingClientRect(); if (tr.height < 100 || tr.width < W - 4) bad.push('table collapsed ' + Math.round(tr.width) + 'x' + Math.round(tr.height));
  if (H > W && 100 * tr.height / H < 55) bad.push('table ' + Math.round(100 * tr.height / H) + '%');
  if (tr.bottom > H + 1) bad.push('table taller than the screen');
  const animating = document.querySelector('#tb .snap,#tb .buzz,#tb .aim,#tb .lift,#tb .sel,#tb.shake');
  if (!animating) for (const e of document.querySelectorAll('#tb .tile')) { const r = e.getBoundingClientRect(); if (r.left < -1 || r.right > W + 1 || r.bottom > H + 1 || r.top < 0) bad.push('tile off screen'); }
  const crew = document.getElementById('crew').getBoundingClientRect(), mine = document.getElementById('mine').getBoundingClientRect();
  if (mine.height > 0 && crew.bottom > mine.top + 2) bad.push('crew overlaps my stand');
  for (const id of ['crew', 'mine']) { const c = document.getElementById(id); if (!animating && c.scrollWidth > c.clientWidth + 2) bad.push(id + ' overflows wide'); }
  const pr = document.getElementById('say').textContent.replace(/[^a-zA-Z0-9'’]+/g, ' ').trim().split(' ').filter(Boolean); if (pr.length > 8) bad.push('status over 8 words');
  for (const e of document.querySelectorAll('#tb .tile.glow')) { const r = e.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2; if (x < 0 || y < 0 || x > W || y > H) { bad.push('glowing tile off screen'); continue; } const t = document.elementFromPoint(x, y); if (t && !(e === t || e.contains(t) || t.contains(e))) bad.push('glowing tile covered'); }
  return bad;
})()`;
const SEQ = [[390, 763], [844, 390], [390, 763], [375, 553], [812, 375], [390, 763]];

async function one(browser, gi) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 763 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA, serviceWorkers: 'block' });
  await ctx.route(/fonts\.(googleapis|gstatic)/, r => r.abort());
  const page = await ctx.newPage(); const errs = [], issues = new Set();
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  try {
    await page.goto('file://' + FILE); await sleep(800);
    const np = [4, 3, 5, 2, 4, 5][gi % 6], job = [4, 1, 12, 5, 9, 17][gi % 6];
    const pl = await page.evaluate(`MISSIONS[${job}].pl`), np2 = pl.includes(np) ? np : pl[0];
    await page.evaluate(`AIDELAY=100;UI.speed=5;startJob({job:${job},np:${np2},seats:['human','ai','ai','ai','ai'],lv:'normal',names:DEFNAMES.slice(),chars:[],captain:${gi % 3},seed:${gi * 31 + 5}});UI.brief=null;refresh()`);
    const step = async () => {   // a few real moves on whatever glows
      for (let k = 0; k < 7; k++) {
        const st = await page.evaluate('({over:!!G.over,mine:decider()===(UI.V?UI.V.seat:-9)})'); if (st.over) return;
        const r = await page.evaluate(`(()=>{const e=[...document.querySelectorAll('#tb .tile.glow,#tb .chip.glow,#tb .plate.glow')].find(e=>{const r=e.getBoundingClientRect();return r.width>3&&r.right<=innerWidth&&r.bottom<=innerHeight});if(!e)return null;const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}})()`);
        if (r && st.mine) await page.touchscreen.tap(r.x, r.y);
        await sleep(260);
      }
    };
    await step();
    for (let i = 1; i < SEQ.length * 2; i++) {
      const [w, h] = SEQ[i % SEQ.length], stale = i % 2 === 0;
      const ev = () => page.evaluate(`(()=>{window.dispatchEvent(new Event('resize'));window.dispatchEvent(new Event('orientationchange'));try{screen.orientation&&screen.orientation.dispatchEvent(new Event('change'))}catch(e){}})()`).catch(() => { });
      if (stale) { await ev(); await page.setViewportSize({ width: w, height: h }); await ev(); await sleep(250); await sleep(1100); }
      else { await page.setViewportSize({ width: w, height: h }); await ev(); await sleep(1100); }
      for (const b of await page.evaluate(AUDIT)) issues.add(w + 'x' + h + ' ' + b);
      await step();
      for (const b of await page.evaluate(AUDIT)) issues.add(w + 'x' + h + ' after moves: ' + b);
      if (await page.evaluate('!!G.over')) break;
    }
  } catch (e) { issues.add('crash ' + String(e.message).slice(0, 100)); }
  await ctx.close();
  return { gi, errs, issues: [...issues] };
}
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const res = []; let next = 0;
  const worker = async () => { while (next < N) { const g = next++; const r = await one(browser, g); res.push(r); console.log((r.errs.length || r.issues.length ? 'FAIL ' : 'ok   ') + 'rotate game ' + g + (r.errs.length ? ' ERR ' + [...new Set(r.errs)].slice(0, 2).join(' | ') : '') + (r.issues.length ? ' :: ' + r.issues.slice(0, 4).join(' | ') : '')); } };
  await Promise.all([worker(), worker()]);
  await browser.close();
  const bad = res.filter(r => r.errs.length || r.issues.length);
  console.log('ROTATE ' + (bad.length ? 'FAIL' : 'PASS') + ': ' + res.length + ' games, ' + bad.length + ' with problems');
  process.exit(bad.length ? 1 : 0);
})();
