// probe23: fresh story start, skip scenes, then run an in-page probe expression (argv[3], a function body returning JSON)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const ctx=await b.newContext({viewport:{width:852,height:393}});const p=await ctx.newPage();
 p.on('pageerror',e=>console.log('PAGEERR',e.message.slice(0,200)));
 await ctx.addInitScript(`(()=>{const q=[];let t=0;window.requestAnimationFrame=cb=>{q.push(cb);return q.length};window.__auto=true;window.__tick=n=>{for(let i=0;i<n;i++){t+=1000/60;const c=q.splice(0);for(const f of c)try{f(t)}catch(e){}}};setInterval(()=>{if(window.__dbg&&!window.__fr){window.__fr=1;__dbg.composer.render=()=>{}}if(window.__auto)__tick(1)},16)})()`);
 await p.goto(process.argv[2]);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:300000,polling:500});
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('mho_slot','1')});await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:300000,polling:500});
 await p.click('#hcStory');await p.waitForTimeout(300);await p.click('#slotList .go');await p.waitForFunction(()=>__mho.state==='roam',null,{timeout:300000,polling:1000});await p.evaluate(()=>{window.__auto=false});
 for(let i=0;i<40;i++){await p.evaluate(()=>{__tick(10);if(__m1.cs())__m1.skip();for(const s of['#storyGo','#rcGo','.m1go','#tutSkip']){const e=document.querySelector(s);if(e&&!e.hidden&&e.offsetWidth)e.click()}})}
 const r=await p.evaluate(new Function(require('fs').readFileSync(process.argv[3],'utf8')));console.log('PROBE',JSON.stringify(r));await b.close()})().catch(e=>{console.error('ERR',e.message);process.exit(1)});
