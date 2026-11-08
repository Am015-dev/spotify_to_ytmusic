// Clean Play screen check (Addendum 7): node shoot-play.js <out.png> [WxH]  -> a Quick game at the first own turn, hints off.
// Prints which panels are visible besides the board, the tray, the tracker, the checklist line and the top bar (should be none).
const PW = (() => { try { return require('playwright'); } catch (e) { return require('/home/user/spotify_to_ytmusic/games-src/node_modules/playwright'); } })();
const fs = require('fs');
const html = fs.readFileSync(__dirname + '/final-approach.html');
const [W, H] = (process.argv[3] || '390x763').split('x').map(Number), sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await PW.chromium.launch(), ph = W < 700, ctx = await b.newContext({ viewport: { width: W, height: H }, isMobile: ph, hasTouch: ph });
  await ctx.route('**/*', r => new URL(r.request().url()).host === 'gns.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('https://gns.test/' + (ph ? '?phone=1' : '')); await sleep(800); await p.evaluate(() => { localStorage.clear(); localStorage.setItem('fa_offer', '1'); localStorage.setItem('fa_prefs', JSON.stringify({ won: { g1: 1 } })); }); await p.reload(); await sleep(1200);
  const click = s => p.evaluate(s => { const e = [...document.querySelectorAll(s)].find(e => e.offsetWidth); if (e) e.click(); return !!e; }, s);
  await p.evaluate(() => { const e = [...document.querySelectorAll('#start button')].find(b => b.textContent.trim() === 'Computer'); e && e.click(); }); await sleep(900); await click('#start [data-a=start][data-m=vs]'); await sleep(1500);
  const goal = await p.evaluate(() => (document.querySelector('.fa-goal,.stbox .fgoal') || {}).textContent || '');
  if (process.argv[4]) await p.screenshot({ path: process.argv[4] });
  await click('.fa-goal [data-ro=go]'); await click('[data-a=rsclose]'); await sleep(500);
  for (let i = 0; i < 40; i++) { const st = await p.evaluate(() => !window.G ? {} : ({ ph: G.phase, t: G.turn, pend: !!G.pend })); if (st.ph === 'brief') await click('[data-a=ready]'); else if (st.ph === 'place' && st.t === 0 && !st.pend) break; await sleep(500); }
  await sleep(1500);
  await click('#pz .die.can'); await sleep(700);
  const extra = await p.evaluate(() => ['.fa-coach', '.gxh-bub', '#fprev:not([hidden])', '.fa-ro', '#toast.on', '#fx .gh', '.rchip'].filter(s => { const e = document.querySelector(s); return e && e.getBoundingClientRect().width > 0; }));
  await p.screenshot({ path: process.argv[2] });
  console.log((extra.length || errs.length ? 'FAIL' : 'PASS') + ' clean play ' + W + 'x' + H + ' extra=' + JSON.stringify(extra) + ' goal=' + JSON.stringify(goal.slice(0, 90)) + (errs.length ? ' errors ' + errs[0] : ''));
  await b.close();
})();
