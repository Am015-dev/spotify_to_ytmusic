// Screenshot helper: node shoot.js [WxH] [phone] [scenario] [gfx] [mode] -> shots/s_<size>_*.png
const PW = (() => { try { return require('playwright'); } catch (e) { return require(process.env.PW || (require('child_process').execSync('npm root -g').toString().trim() + '/playwright')); } })();
const fs = require('fs'), path = require('path'); const OUT = path.join(__dirname, 'shots'); fs.mkdirSync(OUT, { recursive: true });
const html = fs.readFileSync(path.join(__dirname, 'final-approach.html'));
const [W, H] = (process.argv[2] || '1366x768').split('x').map(Number); const PH = process.argv[3] === 'phone'; const SC = process.argv[4] || 'g1'; const GFX = process.argv[5] || 'high'; const MODE = process.argv[6] || 'vs';
(async () => {
  const b = await PW.chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await b.newContext(Object.assign({ viewport: { width: W, height: H }, deviceScaleFactor: 1 }, PH ? { isMobile: true, hasTouch: true } : {}));
  await ctx.route('**/*', r => new URL(r.request().url()).host === 'gns.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load/.test(m.text())) errs.push(m.text()); });
  const t = `${W}x${H}${process.env.TAG ? '_' + process.env.TAG : ''}`; const sh = n => p.screenshot({ path: path.join(OUT, `s_${t}_${n}.png`) });
  await p.goto('https://gns.test/'); await p.waitForTimeout(1500);
  await p.evaluate(g => { try { localStorage.removeItem('fa_save'); } catch (e) { } if (typeof setGfx === 'function' && PX.on) setGfx(g); }, GFX);
  await sh('00title');
  await p.click('[data-a=play]'); await p.waitForTimeout(400); await sh('01setup');
  if (PH) { await p.click('[data-a=cfgopen]'); await p.waitForTimeout(300); await sh('02configure'); await p.click('#cfg .cfghead [data-a=cfgclose]'); await p.waitForTimeout(200); }
  await p.evaluate(sc => { UI.seed = 7; AIDELAY = 120; UI.opt = Object.assign(UI.opt || {}, { scenario: sc }); }, SC);
  if (MODE === 'guided') await p.click('[data-start=guided]'); else await p.click('[data-start=vs]');
  await p.waitForTimeout(1200); if (await p.$('#rs.story')) { await sh('09story'); await p.evaluate(() => { const c = document.querySelector('#rs.story [data-a=rsclose]'); if (c) c.click(); }); await p.waitForTimeout(500); }
  await sh('10brief');
  await p.evaluate(() => { const b = document.querySelector('#acts [data-a=ready]'); if (b) b.click(); }); await p.waitForTimeout(1800); await sh('11rolled');
  await p.evaluate(() => { const d = document.querySelector('.tray .die:not(.cover):not(.used)'); if (d) d.click(); }); await p.waitForTimeout(400); await sh('12picked');
  if (process.argv[7] !== 'short') {
    await p.evaluate(() => { const k = document.querySelector('.tipx,[data-a=tipclose],[data-a=tipoff]'); if (k) k.click(); G.ai = [true, true]; AIDELAY = 500; schedule(); });
    await p.waitForTimeout(9000); await sh('20mid');
    for (let i = 0; i < 40; i++) { const o = await p.evaluate(() => !!(G && G.result)); if (o) break; await p.waitForTimeout(1500); }
    await p.waitForTimeout(1200); await sh('30ending'); await p.waitForTimeout(4000); await sh('31end');
  }
  console.log(t, 'errors', JSON.stringify(errs));
  await b.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
