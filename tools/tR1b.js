// tR1b.js: R1 probe 2 (852x393 touch): fresh save → menu → START (quick race) → start shot + mood; then the garage stat box (chips + weight).
// usage: node tools/tR1b.js <url> <outdir>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const path=require('path');
const URL=process.argv[2],OUT=process.argv[3]||'qa_r1';fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,hasTouch:true,isMobile:true});const p=await ctx.newPage();p.setDefaultTimeout(900000);
 const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,200)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,200))});
 await ctx.addInitScript(`(()=>{const q=[];let t=0;window.requestAnimationFrame=cb=>{q.push(cb);return q.length};window.__auto=true;window.__tick=n=>{for(let i=0;i<n;i++){t+=1000/60;const c=q.splice(0);for(const f of c)try{f(t)}catch(e){setTimeout(()=>{throw e})}}};setInterval(()=>{if(window.__dbg&&!window.__fr&&!window.__sh){window.__fr=__dbg.composer.render;__dbg.composer.render=()=>{}}if(window.__auto)__tick(1)},16)})()`);
 await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:300000,polling:500});
 await p.evaluate(s=>{localStorage.clear();localStorage.setItem('mho_slot','1');if(s)localStorage.setItem('mho_mood','night')},!!process.env.STALE);await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:300000,polling:500});
 const shot=async n=>{await p.evaluate(()=>{window.__sh=1;if(window.__fr){__dbg.composer.render=window.__fr;window.__fr=null}__tick(1)});await p.screenshot({path:path.join(OUT,n+'.png')});await p.evaluate(()=>{window.__sh=0})};
 console.log('MENU',JSON.stringify(await p.evaluate(()=>({menuMood:__oc.ev('menuMood'),MOOD:__oc.ev('MOOD.id'),tab:__oc.ev('menuTab')}))));
 console.log('step click');await p.evaluate(()=>document.querySelector('#startBtn').click());await p.waitForFunction(()=>__mho.state!=='menu',null,{timeout:120000,polling:500});console.log('step started');await p.evaluate(()=>{window.__auto=false;__tick(90)});
 await shot('race_start');console.log('RACE',JSON.stringify(await p.evaluate(()=>({state:__mho.state,MOOD:__oc.ev('MOOD.id'),name:__oc.ev('MOOD.name'),track:__oc.ev('RC&&RC.track')}))));
 await p.evaluate(()=>{window.__auto=true});await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:300000,polling:500});console.log('step garage');
 await p.evaluate(()=>__oc.ev('gbOpen()'));await p.waitForTimeout(1500);await p.evaluate(()=>{window.__auto=false;__tick(20)});
 await shot('garage_stats');console.log('STATS',JSON.stringify(await p.evaluate(()=>{const e=document.querySelector('#gbStats');const r=e.getBoundingClientRect();return{txt:e.innerText.replace(/\n/g,' | '),n:__oc.ev('GB.d.bricks.length'),box:[r.x,r.y,r.width,r.height].map(Math.round),vis:getComputedStyle(e).display}})));
 console.log('ERRS',JSON.stringify(errs));await b.close()})().catch(e=>{console.error('ERR',e);process.exit(1)});
