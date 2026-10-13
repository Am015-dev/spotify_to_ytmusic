// race shot from the menu (Enter = quick race), 852x393: node p1race.js <url> <out.png>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [URL,OUTF]=process.argv.slice(2);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const ctx=await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true});
 const p=await ctx.newPage();p.setDefaultTimeout(300000);const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,200)));p.on('console',m=>{if(m.type()==='error'&&!/404/.test(m.text()))errs.push(m.text().slice(0,200))});
 await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:200});await p.waitForTimeout(1500);
 await p.evaluate(()=>document.dispatchEvent(new KeyboardEvent('keydown',{code:'Enter',key:'Enter',bubbles:true})));await p.waitForFunction(()=>__mho.state&&__mho.state!=='menu'&&!(__mho.LD&&__mho.LD.on),null,{polling:100});
 await p.waitForTimeout(5000);await p.keyboard.down('ArrowUp');await p.waitForTimeout(5000);await p.screenshot({path:OUTF});await p.keyboard.up('ArrowUp');
 console.log(JSON.stringify({state:await p.evaluate(()=>__mho.state),progs:await p.evaluate(()=>__mho.info().progs),errs}));await b.close()})().catch(e=>{console.error(e);process.exit(1)});
