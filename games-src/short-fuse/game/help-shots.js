// Help kit screenshots: NODE_PATH=/opt/node-tools/node_modules node help-shots.js [outdir] [file]
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const OUT = path.resolve(process.argv[2] || path.join(__dirname, '..', 'playtest')), FILE = path.resolve(__dirname, process.argv[3] || 'shortfuse.html');
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mobile/15E148 Safari/604.1'; const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.mkdirSync(OUT, { recursive: true }); const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 763 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA, serviceWorkers: 'block' });
  const p = await ctx.newPage(); p.on('pageerror', e => console.log('PAGE ERROR', e.message));
  await p.goto('file://' + FILE); await sleep(600);
  await p.evaluate(`AIDELAY=100;UI.speed=5;UI.setup=UI.setup||defaultSetup();startJob({job:1,np:3,seats:['human','ai','ai','ai','ai'],lv:'normal',names:DEFNAMES.slice(),chars:[],captain:0,seed:11})`);
  await sleep(500); await p.evaluate(`if(UI.brief){UI.brief=null;refresh()}`); await sleep(900);
  const ph = await p.evaluate('hlpPhase()'); console.log('phase', ph, JSON.stringify(await p.evaluate('GXH.state()')));
  await p.screenshot({ path: OUT + '/help-coach-bubble.png' });
  await p.evaluate('GXH.hide()');
  await p.touchscreen.tap(...(await p.evaluate(`(()=>{const r=document.getElementById('bulbbtn').getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]})()`))); await sleep(500);
  console.log('bulb', JSON.stringify(await p.evaluate('GXH.state()')), JSON.stringify(await p.evaluate(`(()=>{const f=document.querySelector('.gxh-finger');return f&&f.dataset})()`)));
  await p.screenshot({ path: OUT + '/help-bulb-suggestion.png' });
  await p.evaluate(`document.querySelector('.gxh-link')&&document.querySelector('.gxh-link').click()`); await sleep(400);
  await p.screenshot({ path: OUT + '/help-rules-card.png' });
  await b.close();
})();
