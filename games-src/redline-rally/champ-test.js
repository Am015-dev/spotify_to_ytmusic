/* Championship: three races in a row with the same drivers, points table after each, champion screen at the end. Usage: PW=../node_modules/playwright node champ-test.js */
const {chromium}=require(process.env.PW||'playwright'),gx=require('../scripts/gx-serve.js');
(async()=>{const url=await gx.url('redline-rally',{file:require('path').join(__dirname,'redline-rally.html')});const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:390,height:763}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));
await p.addInitScript(()=>{localStorage.setItem('gxt-redline-rally',JSON.stringify({done:1}));localStorage.setItem('rr_seen','1')});
await p.goto(url+(url.includes('?')?'&':'?')+'fast=1');await p.waitForTimeout(500);
for(let r=0;r<3;r++){ if(r===0) await p.click('#champB'); else await p.click('#cNext');
 await p.waitForSelector('#goB'); const t=await p.evaluate(()=>G.track+' '+G.cars.map(c=>c.name).join(','));console.log('race',r+1,t);
 await p.evaluate(()=>{UI.forceEnd();G.cars.forEach(function(c,i){c.pos=total(G)+5-i;c.fin=i+1;});G.over=true;G.phase='over';G.rank=rankList(G);showResult();});
 await p.waitForTimeout(300); console.log(await p.evaluate(()=>[...document.querySelectorAll('table.champ tbody tr')].map(t=>t.textContent).join(' | ')));}
console.log((await p.locator('#cNew').count())?'PASS championship ends with a champion':'FAIL no champion screen', 'errs', errs.length);await b.close();process.exit(errs.length?1:0)})();
