// player car height over the road while driving (tPlay's yh = RO.y - gnd), mean/max over 60 samples: node p1gap.js <url>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [URL]=process.argv.slice(2);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const ctx=await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true});
 const p=await ctx.newPage();p.setDefaultTimeout(600000);await p.addInitScript("Object.defineProperty(window,'devicePixelRatio',{get:()=>0.35,configurable:true})");
 await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:200});
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}))});await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:200});
 await p.evaluate(()=>__mho.enterRoam());await p.waitForFunction(()=>__mho.state==='roam'&&!(__mho.LD&&__mho.LD.on),null,{polling:200});await p.keyboard.down('ArrowUp');await p.waitForTimeout(3000);
 const S=[];for(let i=0;i<60;i++){S.push(await p.evaluate(()=>{const R=__mho.RO;return R.y-__mho.gnd(R.x,R.z,R.y+.3)}));await p.waitForTimeout(50)}
 const m=S.reduce((a,b)=>a+b,0)/S.length;console.log(JSON.stringify({mean:+m.toFixed(3),max:+Math.max(...S).toFixed(3),min:+Math.min(...S).toFixed(3)}));await b.close()})().catch(e=>{console.error(e);process.exit(1)});
