// tParts.js — render every builder part on one sheet + the palette tabs. node tools/tParts.js <outdir>  (needs http.server 8766 and local.html)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const OUT=process.argv[2];fs.mkdirSync(OUT,{recursive:true});
(async()=>{const br=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await br.newContext({viewport:{width:852,height:393},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await ctx.newPage();p.setDefaultTimeout(600000);
const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,200)));
await p.goto('http://127.0.0.1:8766/local.html');await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
await p.evaluate(()=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_athpre','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}));localStorage.setItem('mho_story@1',JSON.stringify({ath:1}))});
await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
await p.evaluate(()=>{try{__m1&&__m1.skip&&__m1.skip()}catch(e){}__mho.enterRoam()});await p.waitForFunction(()=>__mho.state==='roam');await p.evaluate(()=>__mho.storyClose&&__mho.storyClose());await p.waitForTimeout(1500);
await p.evaluate(()=>document.querySelector('#roamPause [data-p="garage"]')?.click()||__mho.pause?.());await p.waitForTimeout(500);
await p.waitForFunction(()=>!document.querySelector('#gbx').hidden,null,{timeout:8000}).catch(async()=>{await p.keyboard.press('Escape');await p.waitForTimeout(500);await p.evaluate(()=>document.querySelector('#roamPause [data-p="garage"]').click());await p.waitForFunction(()=>!document.querySelector('#gbx').hidden)});
await p.evaluate(()=>document.querySelector('#gbx .gbTabs [data-t="bricks"]').click());await p.waitForTimeout(1200);await p.evaluate(()=>__gb.preset(0));await p.waitForTimeout(500);
for(const ct of ['Power','Deco']){await p.evaluate(ct=>document.querySelector(`#gbBkCt [data-ct="${ct}"]`).click(),ct);await p.waitForTimeout(300);await p.screenshot({path:`${OUT}/pal_${ct}.png`})}
const keys=await p.evaluate(()=>[...document.querySelectorAll('#gbBkPc .gbPc')].map(b=>b.dataset.p));console.log(keys.length,'parts');
if(process.env.KEYS)keys.splice(0,keys.length,...process.env.KEYS.split(','));const per=Math.ceil(keys.length/(process.env.KEYS?1:2));
for(const half of(process.env.KEYS?[0]:[0,1])){await p.evaluate(([ks,KZ])=>{const L=[];let x=-10,z=-9,rowD=0;const cols=['#d01712','#0055bf','#fac80a','#00852b','#f4f4f4','#fe8a18','#36aebf'];ks.forEach((k,i)=>{const P=__gb.PC[k];if(x+P.w>10){x=-10;z+=rowD+1;rowD=0}L.push({t:k,x,z,y:(k[0]==='w'&&k.length===2)?-2:0,r:0,m:0,c:cols[i%cols.length]});x+=P.w+1;rowD=Math.max(rowD,P.d)});__gb.d().bricks=L;__gb.d().bp=1;__gb.refresh();__gb.GB_.dist*=(KZ);__gb.GB_.pit=.55},[keys.slice(half*per,(half+1)*per),process.env.KEYS?1.05:1.9]).catch(e=>console.log('E',e.message));
 await p.waitForTimeout(900);await p.screenshot({path:`${OUT}/sheet${half}.png`});await p.evaluate(()=>{__gb.GB_.dist/=1.9})}
console.log('errs',errs);await br.close()})();
