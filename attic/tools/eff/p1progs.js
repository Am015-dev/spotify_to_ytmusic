// dump shader program cache keys at menu / roam / race (p1 build exposes window.__P1): node p1progs.js <url> [fra|ath]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [URL,CITY='fra']=process.argv.slice(2);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const ctx=await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true});
 const p=await ctx.newPage();p.setDefaultTimeout(900000);await p.addInitScript("Object.defineProperty(window,'devicePixelRatio',{get:()=>0.35,configurable:true})");
 const dump=()=>p.evaluate(()=>__P1.keys());const O={};
 await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:200});await p.waitForTimeout(1500);O.menu=await dump();
 await p.evaluate(c=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}))});
 await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:200});await p.waitForTimeout(1500);O.menu2=await dump();
 await p.evaluate(()=>__mho.enterRoam());await p.waitForFunction(()=>__mho.state==='roam'&&!(__mho.LD&&__mho.LD.on),null,{polling:200});await p.waitForTimeout(3000);O.roam=await dump();
 require('fs').writeFileSync(process.env.OUT||'progs.json',JSON.stringify(O));console.log(O.menu.length,O.menu2.length,O.roam.length);await b.close()})().catch(e=>{console.error(e);process.exit(1)});
