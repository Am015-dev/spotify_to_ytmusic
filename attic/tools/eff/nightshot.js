// PERF-4 quick review shot: Frankfurt roam at night (headlights on), 852×393, after 20 s of driving; prints headlight mesh id/count and console errors.
// usage: node tools/eff/nightshot.js <url local_dbg.html> <out.png>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await ctx.newPage();p.setDefaultTimeout(900000);
const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,160)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,160))});
await p.goto(process.argv[2]);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:200});
await p.evaluate(()=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}));localStorage.setItem('mho_fl_tod','0.93')});
await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:200});
await p.evaluate(()=>__mho.enterRoam());await p.waitForFunction(()=>__mho.state==='roam'&&!(__mho.LD&&__mho.LD.on),null,{polling:200});
await p.evaluate(()=>__oc.ev('SET.tod="night"'));for(let i=0;i<5;i++){const b=await p.$('button:has-text("CONTINUE")');if(b&&await b.isVisible()){await b.click();await p.waitForTimeout(800)}else break}await p.keyboard.down('ArrowUp');const ids=[];for(let i=0;i<20;i++){await p.waitForTimeout(1000);ids.push(await p.evaluate(()=>__oc.ev('FL.hl?FL.hl.id+":"+FL.hl.count+"/"+FL.hl.instanceMatrix.count:"none"')))}await p.keyboard.up('ArrowUp');
await p.waitForTimeout(1500);await p.screenshot({path:process.argv[3]});console.log('HL',[...new Set(ids)].join(' '),'n',await p.evaluate(()=>__oc.ev('FL.n')));console.log('errs',JSON.stringify(errs));await b.close()})().catch(e=>{console.error(e);process.exit(1)});
