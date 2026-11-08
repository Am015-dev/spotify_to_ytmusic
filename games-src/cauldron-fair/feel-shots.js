// Brief GAMEFEEL shots: node feel-shots.js <WxH> [prefix]. Title, Learn first screen, Goal card, first turn, mid, rival turn, result.
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const html = fs.readFileSync(path.join(__dirname, 'cauldron-fair.html'), 'utf8');
const [W, H] = (process.argv[2] || '390x844').split('x').map(Number); const pre = process.argv[3] || (W + 'x' + H);
const OUT = path.join(__dirname, 'playable-shots', 'feel'); fs.mkdirSync(OUT, { recursive: true });
const ph = W < 600;
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, hasTouch: ph });
  const LIVE = path.join(__dirname, '..', '..', 'games', 'cauldron-fair');
  await ctx.route('**/*', r => { const u = r.request().url(); if (!u.startsWith('https://gns.test/')) return r.abort(); const rel = decodeURIComponent(new URL(u).pathname.slice(1)); if (!rel || rel === 'index.html') return r.fulfill({ body: html, contentType: 'text/html' }); const f = path.join(LIVE, rel); return fs.existsSync(f) ? r.fulfill({ path: f }) : r.fulfill({ status: 404, body: '' }); });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
  const shot = async n => { await p.waitForTimeout(600); await p.screenshot({ path: path.join(OUT, pre + '_' + n + '.png') }); console.log('shot', n); };
  const tap = async sel => { const e = await p.$(sel); if (!e) return false; const bb = await e.boundingBox(); if (!bb) return false; if (ph) await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); else await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); return true; };
  await p.goto('https://gns.test/'); await p.waitForTimeout(1200);
  await shot('1-title');
  // Learn to play: first screen
  const lt = await p.$$eval('button', bs => { const b = bs.find(x => /New here|Learn/i.test(x.textContent) && x.getBoundingClientRect().width); if (b) { b.setAttribute('data-feel', 'learn'); return true; } return false; });
  if (lt) { await tap('[data-feel=learn]'); await p.waitForTimeout(2500); await shot('2-learn'); }
  // back to a fresh quick game
  await p.evaluate(() => { try { localStorage.setItem('cf_prefs', JSON.stringify({ p: { played: true } })); } catch (e) { } });
  await p.goto('https://gns.test/'); await p.waitForTimeout(1200);
  await p.evaluate(() => { UI.seed = 21; newGame('vs', { np: 2 }); });
  await p.waitForTimeout(2000);
  await shot('4-firstturn');
  // goal card
  const gsel = await p.evaluate(() => { const e = document.querySelector('[data-a=goal],[data-a=campgoal],#goalcard,.goalc'); return e ? true : false; });
  await p.evaluate(() => { if (typeof showGoal === 'function') showGoal(); });
  await shot('3-goal');
  await p.evaluate(() => { document.querySelectorAll('.gx-card-x,[data-a=goalx]').forEach(e => e.click()); });
  for (let i = 0; i < 4; i++) { await tap('#acts .bagb:not(.off), #acts .drawb'); await p.waitForTimeout(1500); }
  await shot('5-mid');
  await tap('#acts .stopb'); await p.waitForTimeout(1500);
  await shot('6-rival');
  await p.evaluate(() => { AIDELAY = 0; ANIM = 0; });
  // auto-play rest by AI
  await p.evaluate(() => { for (const pl of G.players) pl.ai = pl.ai || 'normal'; schedule(); });
  for (let i = 0; i < 120; i++) { const over = await p.evaluate(() => G.phase === 'over'); if (over) break; await p.evaluate(() => { try { closeRS && closeRS(true); } catch (e) { } schedule(); }); await p.waitForTimeout(500); }
  await p.waitForTimeout(3000);
  await shot('7-result');
  console.log('errors', errs.length, errs.slice(0, 3).join(' | '));
  await b.close();
})();
