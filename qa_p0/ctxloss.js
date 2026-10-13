// qa_p0/ctxloss.js: Frankfurt roam, then WEBGL_lose_context lose+restore, shots before/after. usage: node qa_p0/ctxloss.js <url> <out>
const fs=require('fs');const{chromium,INIT}=require('../tools/d24lib');const URL=process.argv[2],OUT=process.argv[3];fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:1910,height:895},deviceScaleFactor:1});const p=await ctx.newPage();p.setDefaultTimeout(900000);
 const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,200)));p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errs.push(m.type()+': '+m.text().slice(0,200))});
 await p.addInitScript(INIT(60));await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('mho_slot','1')});await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
 await p.click('#hcStory');await p.evaluate(()=>__tick(10));await p.click('#slotList .go');
 for(let i=0;i<150;i++){try{if(await p.evaluate(()=>window.__mho&&__mho.state==='roam'))break}catch(e){}await p.waitForTimeout(2000)}await p.evaluate(()=>{window.__auto=false});
 await p.evaluate(()=>{for(let i=0;i<20;i++){__tick(5);for(const s of['#storyGo','#rcGo','.m1go','#tutSkip','#m1Cs']){const e=document.querySelector(s);if(e&&!e.hidden&&e.offsetWidth)e.click()}}});
 const shot=async n=>{await p.evaluate(()=>{window.__shooting=1;if(window.__fastR){__dbg.composer.render=window.__fastR;window.__fastR=null}__tick(2)});await p.screenshot({path:OUT+'/'+n+'.jpg',type:'jpeg',quality:60});await p.evaluate(()=>{window.__shooting=0})};
 await shot('c0_before');
 const r=await p.evaluate(()=>__g9ev(`(()=>{const gl=renderer.getContext(),ext=gl.getExtension('WEBGL_lose_context');window.__ext=ext;ext.loseContext();return !!ext})()`));console.log('lost',r);
 await p.waitForTimeout(1500);await p.evaluate(()=>__g9ev(`__ext.restoreContext()`));await p.waitForTimeout(3000);
 for(let k=0;k<5;k++){await p.evaluate(()=>__tick(10));await p.waitForTimeout(500)}
 await shot('c1_after_restore');
 console.log('msgs',errs.length,JSON.stringify(errs.slice(0,12)));await b.close()})();
