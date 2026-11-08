// Game-feel shots (8 Nov brief): node feel-shots.js WxH [phone] -> ../playable-shots/feel/<WxH>-<n>.png
// title, Learn-to-play first screen, Goal card, first turn, rival turn (covers lifting), mid-game, result. Taps by touch on phones.
const PW = require(process.env.PW || (require('child_process').execSync('npm root -g').toString().trim() + '/playwright'));
const fs = require('fs'), path = require('path'); const OUT = path.join(__dirname, '..', 'playable-shots', 'feel'); fs.mkdirSync(OUT, { recursive: true });
const html = fs.readFileSync(path.join(__dirname, 'kaiten.html'));
const [W, H] = (process.argv[2] || '390x844').split('x').map(Number); const PH = process.argv[3] === 'phone';
(async () => {
  const b = await PW.chromium.launch();
  const ctx = await b.newContext(Object.assign({ viewport: { width: W, height: H }, deviceScaleFactor: 1 }, PH ? { isMobile: true, hasTouch: true } : {}));
  const LIVE = path.join(__dirname, '..', '..', '..', 'games', 'kaiten-kitchen');   // media/, models/, music/ as deployed
  await ctx.route('**/*', r => { const u = new URL(r.request().url()); if (u.host !== 'gns.test') return r.abort(); if (u.pathname === '/' ) return r.fulfill({ status: 200, contentType: 'text/html', body: html });
    const f = path.join(LIVE, decodeURIComponent(u.pathname)); return fs.existsSync(f) ? r.fulfill({ path: f }) : r.fulfill({ status: 404, body: '' }); });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  const sh = n => p.screenshot({ path: path.join(OUT, `${W}x${H}-${n}.png`) });
  const tap = async sel => { const el = await p.waitForSelector(sel, { state: 'visible', timeout: 8000 }); const r = await el.boundingBox(); const x = r.x + r.width / 2, y = r.y + r.height / 2; if (PH) await p.touchscreen.tap(x, y); else await p.mouse.click(x, y); };
  const idle = async () => { for (let k = 0; k < 150; k++) { if (await p.evaluate(() => typeof canPick === 'function' && canPick() && !UI.busy)) return true; if (await p.evaluate(() => G && G.phase === 'over')) return false; await p.evaluate(() => { const c = document.querySelector('#rs [data-a=rsnext]'); if (c) c.click(); }); await p.waitForTimeout(150); } return false; };
  await p.goto('https://gns.test/'); await p.waitForTimeout(1800);
  await p.evaluate(() => { try { localStorage.clear(); } catch (e) { } });
  await sh('1-title');
  // Learn to play: the first screen is the Goal card
  await p.evaluate(() => { const b = [...document.querySelectorAll('#start button')].find(x => /Learn/.test(x.textContent)); b.click(); });
  await p.waitForTimeout(1500); await sh('2-learn-first');
  await tap('#kkgoal .kgo'); await p.waitForTimeout(900); await sh('2b-learn-suzu');
  // Quick game: back to the title, start a game against two computer chefs
  await p.evaluate(() => { UI.started = false; G = null; coachStop(); showStart(); goalCard.seen = 0; });
  await p.waitForTimeout(400); await tap('[data-a=play]'); await p.waitForTimeout(400);
  await p.evaluate(() => { UI.seed = 7; UI.opt.np = 3; setNp(3); renderStart(); }); await p.waitForTimeout(300); await tap('[data-start=vs]'); await p.waitForTimeout(1300);
  await sh('3-goal-card'); await tap('#kkgoal .kgo'); await p.waitForTimeout(500);
  await idle(); await p.waitForTimeout(300); await sh('4-first-turn');
  await tap('#belt .hc[data-up="1"]'); await p.waitForTimeout(250);
  for (let k = 0; k < 60; k++) { if (await p.evaluate(() => !!document.querySelector('.kk-cloche.kk-lift'))) break; await p.waitForTimeout(60); } await p.waitForTimeout(350); await sh('5-rival-turn');
  for (let t = 0; t < 5; t++) { if (!await idle()) break; await tap('#belt .hc[data-up="1"]'); await p.waitForTimeout(300); }
  await idle(); await p.waitForTimeout(500); await sh('6-mid-game');
  // play out the game by taps (fast), then the result
  await p.evaluate(() => { AIDELAY = 0; UI.fast = true; });
  for (let k = 0; k < 1500; k++) {
    const o = await p.evaluate(() => ({ over: G && G.phase === 'over' && UI.overShown, pk: canPick() && !UI.busy, rs: !!document.querySelector('#rs [data-a=rsnext]') }));
    if (o.over) break; if (o.rs) await tap('#rs [data-a=rsnext]').catch(() => { }); else if (o.pk) await tap('#belt .hc[data-up="1"]').catch(() => { }); await p.waitForTimeout(100);
  }
  await p.waitForTimeout(1500); await sh('7-result');
  console.log(`${W}x${H}`, 'over', await p.evaluate(() => G && G.phase), 'errors', JSON.stringify(errs));
  await b.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
