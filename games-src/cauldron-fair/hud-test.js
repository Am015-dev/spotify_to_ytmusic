// HUD test (W675): at machine speed, (1) every window (scores, log, rules, menu) opens by tap and closes by X and by tap-outside, never two at once,
// (2) a full quick game is played with real taps (PICK reused from tap-play.js), 0 JS errors, < 60 s. usage: node hud-test.js [pc|phone] [http://localhost:8780]
const PW = (() => { try { return require('playwright'); } catch (e) { return require('../node_modules/playwright'); } })();
const { turbo, tick, budget } = require('../scripts/turbo');
const PICK = /const PICK = `([\s\S]*?)`;\nasync function play/.exec(require('fs').readFileSync(__dirname + '/tap-play.js', 'utf8'))[1].replace(/\\\\/g, '\\');
const mode = process.argv[2] || 'pc', BASE = process.argv[3] || 'http://localhost:8780', mob = mode === 'phone';
(async () => {
  const stop = budget(60000, 'cauldron hud ' + mode), t0 = Date.now();
  const b = await PW.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const c = await b.newContext({ viewport: mob ? { width: 402, height: 874 } : { width: 1366, height: 768 }, hasTouch: mob, isMobile: mob, serviceWorkers: 'block' }); await turbo(c);
  const p = await c.newPage(); const errs = [], fails = [];
  p.on('pageerror', e => errs.push(String(e).slice(0, 120))); p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load/.test(m.text())) errs.push(m.text().slice(0, 120)); });
  const tap = async (x, y) => mob ? p.touchscreen.tap(x, y) : p.mouse.click(x, y);
  await p.goto(BASE + '/cauldron-fair/?scn=cf-board' + (mob ? '' : '')); await tick(p, 3000);
  // 1. windows
  const wins = mob ? ['scored', 'rulesd', 'setd'] : ['scored', 'logd', 'rulesd', 'setd'];   // phone: the log opens from the Menu window
  const open = () => p.evaluate(() => [...document.querySelectorAll('.gx-drawer.on')].map(d => d.id));
  const ctr = sel => p.evaluate(s => { const r = document.querySelector(s).getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, r.width, r.height]; }, sel);
  for (const w of wins) {
    let btn = '.gx-bar [data-gx=' + w + ']'; if (!(await p.evaluate(s => { const e = document.querySelector(s); return e && e.getBoundingClientRect().width > 4 && getComputedStyle(e).display !== 'none'; }, btn))) { fails.push(w + ': no visible opener (phone keeps it in the Menu)'); continue; }
    let [x, y] = await ctr(btn); await tap(x, y); await tick(p, 400); await p.waitForTimeout(120);
    if ((await open()).join() !== w) fails.push(w + ' did not open: ' + (await open()));
    const [xx, xy, xw, xh] = await ctr('#' + w + ' .gx-x'); if (xw < 44 || xh < 44) fails.push(w + ' X smaller than 44px: ' + xw + 'x' + xh);
    await tap(xx, xy); await tick(p, 400); if ((await open()).length) fails.push(w + ' X did not close');
    await tap(x, y); await tick(p, 400); await p.waitForTimeout(120); if ((await open()).join() !== w) fails.push(w + ' reopen failed');
    // never two: open another opener while this one is open must replace (modal scrim covers the bar, so tap the scrim instead = close)
    const out = await p.evaluate(() => { for (const [x, y] of [[5, 400], [5, innerHeight - 20], [innerWidth / 2, innerHeight - 20], [5, 60]]) { const e = document.elementFromPoint(x, y); if (e && e.classList.contains('gx-scrim')) return [x, y]; } return null; });
    if (!out) fails.push(w + ' has no outside area to tap'); else await tap(out[0], out[1]); await tick(p, 400); if ((await open()).length) fails.push(w + ' tap-outside did not close');
  }
  // 2. full game
  await p.goto(BASE + '/cauldron-fair/?phone=' + (mob ? 1 : 0)); await tick(p, 1500); await p.evaluate(m => { try { localStorage.clear(); } catch (e) { } window.__tapmode = m; }, 'quick');
  const pl = await p.locator('[data-a=play]').first().boundingBox(); await tap(pl.x + pl.width / 2, pl.y + pl.height / 2); await tick(p, 600);
  let over = false, idle = 0, taps = 0;
  for (let i = 0; i < 1500 && Date.now() - t0 < 55000; i++) {
    const gc = await p.evaluate(() => { const e = document.querySelector('#goalcard .gcok'); if (!e) return null; const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });   // the day-start goal card is a real modal: tap its OK
    if (gc) { await tap(gc[0], gc[1]); taps++; await tick(p, 400); continue; }
    const r = await p.evaluate(PICK).catch(() => ({ wait: 1 }));
    if (r.done) { over = true; break; } if (r.wait) { if (++idle > 120) break; await tick(p, 300); continue; } idle = 0;
    if (!r.ok) { if (process.env.DBG) console.log('covered', JSON.stringify(r)); await tick(p, 300); continue; } if (process.env.DBG) console.log('tap', JSON.stringify(r)); await tap(r.cx, r.cy); taps++; await tick(p, r.why === 'draw' ? 700 : 450);
  }
  if (!over) console.log('stuck', await p.evaluate(() => JSON.stringify({ph: G && G.phase, r: G && G.round, rs: !document.querySelector('#rs').hidden, start: !document.querySelector('#start').hidden, bub: [...document.querySelectorAll('.gxh-bub button')].map(b => b.className + ':' + b.textContent.trim() + ':' + (b.getBoundingClientRect().width|0)).join(','), txt: document.body.innerText.replace(/\s+/g, ' ').slice(0, 260)})).catch(e => String(e)));
  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(mode, 'windows:', fails.length ? fails.join(' | ') : 'all open/close by X + tap-outside', '| game', over ? 'REACHED RESULT' : 'NOT REACHED', 'taps', taps, '| errors', JSON.stringify(errs), '|', secs + 's');
  stop(); await b.close(); process.exit(!fails.length && over && !errs.length ? 0 : 1);
})();
