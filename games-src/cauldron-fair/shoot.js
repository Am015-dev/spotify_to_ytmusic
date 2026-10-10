// Screenshot helper.  node shoot.js <WxH> <scenario> [outPrefix] [--phone]
// scenarios: title setup guided turn mid boom report shop final hot rules refs menu all
const fs = require('fs'), path = require('path');
const { chromium } = require(process.env.PW || 'playwright');
const html = fs.readFileSync(path.join(__dirname, 'cauldron-fair.html'), 'utf8');
const [W, H] = (process.argv[2] || '1366x768').split('x').map(Number); const scen = process.argv[3] || 'all'; const pre = process.argv[4] || ('s_' + W + 'x' + H);
const OUT = path.join(__dirname, 'shots'); fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, hasTouch: Math.min(W, H) < 600 });
  await ctx.route('**/*', r => r.request().url().startsWith('https://gns.test/') ? r.fulfill({ body: html, contentType: 'text/html' }) : r.abort());
  const p = await ctx.newPage(); p.setDefaultTimeout(60000); const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('https://gns.test/' + (process.argv.includes('--phone') ? '?phone=1' : '')); await p.waitForTimeout(500);
  const shot = async n => { await p.waitForTimeout(350); await p.screenshot({ path: path.join(OUT, pre + '_' + n + '.png') }); console.log('shot', n); };
  const ck = sel => p.click(sel);
  const ev = f => p.evaluate(f);
  const want = n => scen === 'all' || scen === n;
  if (want('title')) await shot('00title');
  await ck('[data-a=play]'); await p.waitForTimeout(200);
  if (want('setup')) { await shot('01setup'); if (await p.$('[data-a=cfgopen]')) { await ck('[data-a=cfgopen]'); await shot('02configure'); await ck('[data-a=cfgclose]'); } }
  await ev('UI.seed=21'); await ck('[data-start=guided]'); await p.waitForTimeout(300);
  if (want('guided')) await shot('10guided');
  await ev('AIDELAY=0'); await ev('UI.tip=null;UI.coach.level="off";renderTip();');
  const drawN = async n => { for (let i = 0; i < n; i++) { if (!(await p.$('#acts .drawb'))) break; await p.click('#acts .drawb',{timeout:4000}).catch(()=>{}); await p.waitForTimeout(150); } };
  if (want('turn') || want('mid') || want('all')) { await drawN(3); await shot('11turn'); await drawN(3); await shot('12mid'); }
  if (want('boom') || want('all')) { await drawN(12); await shot('13afterdraws'); }
  await p.waitForTimeout(300);
  if (await p.$('#acts .stopb')) await ck('#acts .stopb'); await p.waitForTimeout(800);
  if (want('report') || want('all')) await shot('20report');
  if (want('shop') || want('all')) { if (await ev('!!(G.players[0].q&&G.players[0].q.h==="shop")')) { await shot('21shop'); } }
  if (want('rules')) { await ev("GX.show('rulesd')"); await shot('30rules'); await ev('GX.close()'); }
  if (want('refs')) { await ev("GX.show('refd')"); await shot('31refs'); await ev('GX.close()'); }
  if (want('menu')) { await ev("GX.show('setd')"); await shot('32menu'); await ev('GX.close()'); }
  console.log('errors', JSON.stringify(errs.slice(0, 5)));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
