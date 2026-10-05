// shot.js <url> <outdir> : 852x393 phone screenshots (start / mid-drive) for fra and ath; LOOK at the PNGs
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const URL=process.argv[2],OUT=process.argv[3];fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const city of (process.env.CITIES||'fra,ath').split(',')){
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await ctx.newPage();p.setDefaultTimeout(600000);const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,150)));
 await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
 await p.evaluate(c=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_city@1',c);if(c==='ath'){localStorage.setItem('mho_athd@1','A');localStorage.setItem('mho_roam.ath@1','{"otg":{}}')}else localStorage.setItem('mho_roam@1','{"tut":1,"otg":{}}')},city);
 await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
 await p.evaluate(()=>__mho.enterRoam());await p.waitForFunction(()=>__mho.state==='roam',null,{polling:500});
 const sh=async n=>{await p.screenshot({path:`${OUT}/${city}_${n}.png`,timeout:600000})};
 await p.evaluate(()=>{try{__mho.storyClose()}catch(e){}try{window.__m1&&__m1.skip&&__m1.skip()}catch(e){}__mho.roamSim(30)});await sh('start');
 await p.evaluate(()=>{__mho.K.ArrowUp=true;__mho.roamSim(240);});await sh('drive');
 console.log(city,'errs',errs);await ctx.close()}
await b.close()})();
