const fs = require('fs'), path = require('path'); const { chromium } = require(process.env.PW || 'playwright');
const html = fs.readFileSync(path.join(__dirname, 'cauldron-fair.html'), 'utf8');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await b.newContext({ viewport: { width: 1366, height: 768 } });
  await ctx.route('**/*', r => r.request().url().startsWith('https://gns.test/') ? r.fulfill({ body: html, contentType: 'text/html' }) : r.abort());
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (['error','warning'].includes(m.type())) errs.push(m.text()); });
  await p.goto('https://gns.test/'); await p.waitForTimeout(1500);
  await p.click('[data-a=play]'); await p.evaluate('UI.seed=21'); await p.click('[data-start=guided]'); await p.waitForTimeout(500);
  await p.evaluate('UI.coach.level="off";UI.tip=null;renderTip();AIDELAY=100');
  for (let i = 0; i < 4; i++) { await p.click('#acts .drawb',{timeout:4000}).catch(()=>{}); await p.waitForTimeout(250); }
  await p.waitForTimeout(900);
  console.log(await p.evaluate('JSON.stringify({on:PX.on,kind:PX.kind,err:PX.err,q:PX.q,sprites:PX.sprites&&PX.sprites().length,pot:G.players[0].pot.length,frames:PX.frames,res:PX.res,soft:PX.soft,gpu:PX.gpu})'));
  await p.screenshot({ path: path.join(__dirname, 'shots', 'px1.png') });
  console.log(errs.slice(0, 6)); await b.close();
})();
