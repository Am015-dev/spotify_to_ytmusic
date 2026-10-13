// quick garage check from the menu: node p1gb.js <url> <tag> [js to eval after open]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [URL,TAG,JS]=process.argv.slice(2);const OUT=process.env.OUT||'.';
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const ctx=await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true});
 const p=await ctx.newPage();p.setDefaultTimeout(300000);const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,200)));p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errs.push(m.type()+': '+m.text().slice(0,200))});
 await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:200});await p.waitForTimeout(1000);
 const t=Date.now();await p.evaluate(()=>document.querySelector('#gbMenuBtn').click());await p.waitForFunction(()=>{const g=document.querySelector('#gbx');return g&&!g.hidden&&g.getBoundingClientRect().width>10},null,{polling:50});await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 console.log('open_s',(Date.now()-t)/1000);await p.waitForTimeout(3000);
 if(JS)console.log('js',await p.evaluate(JS));await p.waitForTimeout(1500);
 // freeze rotation for comparable shots
 await p.screenshot({path:`${OUT}/${TAG}_gb.png`});console.log(JSON.stringify(errs.slice(0,6)));await b.close()})().catch(e=>{console.error(e);process.exit(1)});
