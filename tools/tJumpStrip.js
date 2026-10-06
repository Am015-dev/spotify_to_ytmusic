// tJumpStrip.js — frames of one race jump in a clean time-trial (from the menu, Rookie, real keyboard: hold ArrowUp, lane steering),
// takeoff → mid-air → landing at real speed. usage: node tools/tJumpStrip.js <url> <outdir> [track] [jump] ; 852x393
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const URL=process.argv[2],OUT=process.argv[3]||'strip',TRK=process.argv[4]||'grand',JID=process.argv[5]||'main',LANE=+(process.env.LANE||7);fs.mkdirSync(OUT,{recursive:true});
const INIT=`(()=>{const q=[];let t=0;window.requestAnimationFrame=cb=>{q.push(cb);return q.length};window.cancelAnimationFrame=()=>{};
 window.__tick=n=>{for(let i=0;i<n;i++){t+=1000/60;const c=q.splice(0);for(const f of c){try{f(t)}catch(e){setTimeout(()=>{throw e})}}}return t};
 setInterval(()=>{if(window.__auto)window.__tick(1)},16);window.__auto=true})();`;
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await (await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true})).newPage();p.setDefaultTimeout(900000);const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,200)));
await p.addInitScript(INIT);await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});await p.evaluate(()=>{window.__auto=false});
const tick=n=>p.evaluate(n=>__tick(n),n);let k=0;
const shot=async lab=>{await p.evaluate(()=>{const c=document.querySelector('canvas#c')||document.querySelector('canvas');__tick(1);const url=c.toDataURL('image/png');let im=document.getElementById('__cs');if(!im){im=document.createElement('img');im.id='__cs';document.body.appendChild(im)}const r=c.getBoundingClientRect();Object.assign(im.style,{position:'fixed',left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',zIndex:getComputedStyle(c).zIndex==='auto'?0:getComputedStyle(c).zIndex,pointerEvents:'none'});c.after(im);return new Promise(res=>{im.onload=res;im.src=url})});const n=`${OUT}/6_jump_${String(++k).padStart(2,'0')}_${lab}.png`;await p.screenshot({path:n});await p.evaluate(()=>{const im=document.getElementById('__cs');if(im)im.remove()});console.log('shot',n)};
await p.evaluate(([t])=>{const M=__mho;M.setOpt('tab','tt');M.setOpt('cls','rookie');M.setOpt('track',t);M.startRace()},[TRK]);for(let i=0;i<400;i++){await tick(10);if(await p.evaluate(()=>__mho.state==='race'))break}
const J=await p.evaluate(([id,x])=>{const j=__mho.TD.jumps.find(j=>j.id===id);const P=__mho.pl;P.dist=j.s0-900;P.v=0;P.x=x;return{s0:j.s0,s1:j.s1}},[JID,LANE]);
await p.keyboard.down('ArrowUp');let side=0,state=0,last=0,f=0;
for(;f<6000;f+=2){const o=await p.evaluate(()=>{const P=__mho.pl;return{d:P.dist,x:P.x,lv:P.latV||0,v:P.v,air:P.air?P.air.t:-1,dead:P.dead}});
  const m=o.d-J.s0;
  if(state===0&&m>-45){await shot('approach');state=1}
  if(state===1&&o.air>=0){await shot('takeoff');state=2;last=o.air}
  if(state===2&&o.air>=0&&o.air-last>=.45){await shot('air');last=o.air}
  if(state===2&&o.air<0){await tick(6);await shot(o.dead>0?'WIPEOUT':'landed');await tick(30);await shot('after');break}
  const e=LANE-o.x,dl=Math.max(-3,Math.min(3,e*.5))-o.lv;const want=o.air>=0||Math.abs(dl)<.6?0:Math.sign(dl);
  if(want!==side){if(side)await p.keyboard.up(side>0?'ArrowRight':'ArrowLeft');if(want)await p.keyboard.down(want>0?'ArrowRight':'ArrowLeft');side=want}
  await tick(2)}
console.log('ERRS',JSON.stringify(errs.slice(0,5)));await b.close()})();
