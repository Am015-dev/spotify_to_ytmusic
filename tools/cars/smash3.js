// smash.js <url> <out>: real touch. Roam: hold BOOST (#tN) 1.2 s at cruise -> log meter/boost/speed; Race: hold #tN 1.2 s. Screenshots.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const [URL,OUT]=process.argv.slice(2);const br=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const ctx=await br.newContext({viewport:{width:852,height:393},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await ctx.newPage();p.setDefaultTimeout(600000);
const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,150)));
await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
await p.evaluate(()=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}))});await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
await p.evaluate(()=>{try{__m1.skip()}catch(e){}__mho.enterRoam()});await p.waitForFunction(()=>__mho.state==='roam');await p.evaluate(()=>__mho.storyClose&&__mho.storyClose());await p.waitForTimeout(3000);await p.evaluate(()=>{window.requestAnimationFrame=()=>0;__ju.autoClose(true)});
const cdp=await ctx.newCDPSession(p);
const hold=async(sel,ms)=>{const b=await p.evaluate(sel=>{const e=document.querySelector(sel);if(!e)return null;const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2,w:r.width,vis:getComputedStyle(e).display!=='none'&&getComputedStyle(e).visibility!=='hidden'}},sel);if(!b)return {missing:true};
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:b.x,y:b.y,id:7}]});const S=[];for(let k=0;k<Math.round(ms/100);k++){S.push(await p.evaluate(()=>{__ju.step(6);const R=__dbg.RO,P=__dbg.PL;return{kmh:+(R.v*3.6).toFixed(0),bm:+(P&&P.bm||0).toFixed(1),boosting:!!R.boosting,turbo:+(R.turbo||0).toFixed(2),nitro:!!(P&&P.nitro)}}))}
 await p.evaluate(()=>{try{__dbg.composer.render()}catch(e){}});await p.screenshot({path:OUT+'_'+sel.replace('#','')+'_'+(await p.evaluate(()=>__dbg.ST))+'.png'});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});return{b,S}};
await p.evaluate(()=>__ju.step(240));
const shot=async n=>{await p.evaluate(()=>{try{__dbg.composer.render()}catch(e){}});await p.screenshot({path:OUT+'_'+n+'.png'})};
const press=async(ms,n)=>{const b=await p.evaluate(()=>{const e=document.getElementById('tN');const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2,pos:getComputedStyle(e).position}});await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:b.x,y:b.y,id:9}]});const S=[];for(let k=0;k<ms/100;k++){S.push(await p.evaluate(()=>{__ju.step(6);const e=document.getElementById('tN');return{kmh:+(__dbg.RO.v*3.6).toFixed(0),bm:+(__dbg.PL.bm||0).toFixed(1),deny:e.classList.contains('crDeny'),say:(document.querySelector('#say,.say,#banner')||{}).textContent||'',ring:e.style.getPropertyValue('--crbm')}}));if(k===2)await shot(n)}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});return{pos:b.pos,S:S.filter((x,i)=>i%3===0)}};
await p.evaluate(()=>{__dbg.PL.bm=0;__ju.step(6)});
console.log('ROAM empty',JSON.stringify(await press(1200,'roam_empty')));
await p.evaluate(()=>{__dbg.PL.bm=60;__ju.step(6)});
console.log('ROAM 60',JSON.stringify(await press(900,'roam_60')));
await p.evaluate(()=>__dbg.RS('quick'));for(let k=0;k<40;k++){await p.evaluate(()=>__ju.step(10));if(await p.evaluate(()=>__dbg.ST==='race'))break}await p.evaluate(()=>{__ju.step(120);__dbg.PL.bm=0});
console.log('RACE empty',JSON.stringify(await press(1200,'race_empty')));
console.log('errs',errs);await br.close()})();
