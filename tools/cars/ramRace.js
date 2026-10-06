// ramRace.js <url> <out>: race SMASH test with real touch BOOST (CDP touch on #tN) and real gas key; test-driven rAF (60 fps frames).
// 10 tries: an AI rival is put 10 m ahead in the player's line at 70 % speed; count takedowns.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const INIT=`(()=>{const q=[];let t=0;window.__auto=true;window.requestAnimationFrame=cb=>{q.push(cb);return q.length};window.cancelAnimationFrame=()=>{};
 window.__tick=n=>{for(let i=0;i<n;i++){t+=1000/60;const c=q.splice(0);for(const f of c){try{f(t)}catch(e){window.__err=String(e)}}}return t};
 setInterval(()=>{if(window.__dbg&&!window.__fastR){window.__fastR=__dbg.composer.render;__dbg.composer.render=()=>{}}if(window.__auto)window.__tick(1)},16)})();`;
(async()=>{const [URL,OUT,TAB='quick']=process.argv.slice(2);const br=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const ctx=await br.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});await ctx.addInitScript(INIT);const p=await ctx.newPage();p.setDefaultTimeout(600000);
const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,150)));
await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
await p.evaluate(()=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}))});await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
await p.evaluate(()=>{window.__auto=false});await p.evaluate(t=>__dbg.RS(t),TAB);
const tick=n=>p.evaluate(n=>__tick(n),n);const K=p.keyboard;await K.down('ArrowUp');await tick(240);for(let k=0;k<20;k++){await tick(30);if(await p.evaluate(()=>__dbg.ST==='race'&&__dbg.PL.v*3.6>100))break}
const cdp=await ctx.newCDPSession(p);const rb=await p.evaluate(()=>{const r=document.getElementById('tN').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2,l:document.getElementById('tN').innerText}});console.log('button',JSON.stringify(rb));
const out=[];for(let n=0;n<10;n++){const ai=await p.evaluate(n=>{const P=__dbg.PL,A=__dbg.SH.filter(s=>!s.isPlayer&&!(s.dead>0)&&!s.eliminated);const a=A[n%A.length];a.dist=P.dist+10;a.x=P.x;a.v=P.v*.7;P.bm=100;return __dbg.SH.indexOf(a)},n);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:rb.x,y:rb.y,id:4}]});let ok=false,pk=0,L=[];
 for(let k=0;k<60;k++){const q=await p.evaluate(i=>{__tick(2);const a=__dbg.SH[i],P=__dbg.PL;return{dead:a.dead>0,gap:a.dist-P.dist,dx:a.x-P.x,kmh:P.v*3.6,nitro:!!P.nitro}},ai);pk=Math.max(pk,q.kmh);L.push([+q.gap.toFixed(1),+q.dx.toFixed(1),q.nitro?1:0]);if(q.dead){ok=true;break}if(q.gap<-8)break}
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});if(ok&&!out.some(x=>x.ok)){await tick(6);await p.evaluate(()=>{__dbg.SS();__fastR.call(__dbg.composer)});await p.screenshot({path:OUT+'_race_smash.png'})}
 if(!ok)console.log('miss',n,JSON.stringify(L.filter((x,i)=>i%5===0)));out.push({n,ok,kmh:+pk.toFixed(0)});await tick(120)}
console.log('RACE',out.filter(x=>x.ok).length+'/'+out.length,JSON.stringify(out));console.log('errs',errs);await br.close()})();
