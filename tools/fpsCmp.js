// fpsCmp.js — frame time (ms per __tick incl. render, software GL) on 3 fixed routes (park, hill, city), phone 852x393, holding GAS by touch.
// usage: node tools/fpsCmp.js <split overdrive.html url>  (run live and candidate back to back; compare medians)
// dev.js — persistent phone browser (852x393 touch) with an HTTP control port, so a patch can be tried without re-booting.
// node tools/dev.js <url> [city] [port]   then: curl -s localhost:9333/eval --data 'js expr' ; /shot?n=name ; /hold?k=gas|L|R|B|N|D&on=1 ; /tick?n=60 ; /tap?s=#sel
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const http=require('http');const fs=require('fs');
const URL=process.argv[2],city=process.argv[3]||'fra',PORT=+(process.argv[4]||9333);fs.mkdirSync('v85shots',{recursive:true});//cshot = canvas read back right after a render (headless screenshots of the WebGL canvas can be stale)

const INIT=`(()=>{const q=[];let t=performance.now();window.__auto=true;window.requestAnimationFrame=cb=>{q.push(cb);return q.length};window.cancelAnimationFrame=()=>{};
 window.__tick=n=>{for(let i=0;i<n;i++){t+=1000/60;const c=q.splice(0);for(const f of c){try{f(t)}catch(e){setTimeout(()=>{throw e})}}}return t};
 setInterval(()=>{if(window.__auto)window.__tick(1)},16)})();`;
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:+(process.env.VW||852),height:+(process.env.VH||393)},deviceScaleFactor:+(process.env.DSF||1),isMobile:true,hasTouch:true});const p=await ctx.newPage();p.setDefaultTimeout(600000);
const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,200)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,200))});
await p.addInitScript(INIT);const cdp=await ctx.newCDPSession(p);
const tick=n=>p.evaluate(n=>__tick(n),n);
const F={};const pts=()=>Object.values(F).map(f=>({x:f.x,y:f.y,id:f.id,radiusX:6,radiusY:6,force:1}));
const SEL={gas:'#tG',L:'#tL',R:'#tR',B:'#tB',N:'#tN',D:'#tD'};
const center=sel=>p.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();const cs=getComputedStyle(e);if(r.width<4||cs.display==='none'||cs.visibility==='hidden')return null;for(let a=e;a;a=a.parentElement)if(a.hidden)return null;return[r.left+r.width/2,r.top+r.height/2]},sel);
const down=async(n,xy)=>{if(!xy)return;if(F[n])await up(n);let id=0;while(Object.values(F).some(o=>o.id===id))id++;F[n]={x:xy[0],y:xy[1],id};await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:pts()})};
const up=async n=>{if(!F[n])return;delete F[n];const P=pts();await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});if(P.length)await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:P})};
const tap=async s=>{const xy=await center(s);if(!xy)return false;await down('tap',xy);await tick(4);await up('tap');await tick(4);return true};
const boot=async()=>{await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
await p.evaluate(([c])=>{localStorage.clear();localStorage.setItem('mho_slot','1');if(c==='ath'){localStorage.setItem('mho_city@1',c);localStorage.setItem('mho_athd@1','A');localStorage.setItem('mho_roam.ath@1','{"otg":{}}');localStorage.setItem('mho_story.ath@1','{"seen":1}')}},[city]);
await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
await tap('#hcStory');await tick(10);await tap('#slotList .go');
for(let i=0;i<120;i++){try{if(await p.evaluate(()=>window.__mho&&__mho.state==='roam'))break;await p.waitForTimeout(2000)}catch(e){await p.waitForTimeout(2000)}}
await p.evaluate(()=>{window.__auto=false});
const CONT=['#storyGo','#m1Cs','#rcGo','#ogRetryB','#resBtn','#tutSkip'];
for(let i=0;i<30;i++){await tick(30);let t=false;for(const s of CONT)if(await tap(s)){t=true;break}if(!t)break}await tick(30);console.log('BOOTED')};
await boot();
const res={};for(const [name,x,z,h] of [['park',2280,600,0],['hill',1957,-1012,0.6],['city',2400,576,1.57]]){
 await p.evaluate(([x,z,h])=>{const M=__mho;M.warp(x,z,h,true);const R=M.RO;R.x=x;R.z=z;R.h=h;R.v=0},[x,z,h]);await tick(20);await down('gas',await center("#tG"));await tick(30);
 res[name]=await p.evaluate(()=>{const a=[];for(let i=0;i<120;i++){const t=performance.now();__tick(1);a.push(performance.now()-t)}a.sort((x,y)=>x-y);return{med:+a[60].toFixed(1),p90:+a[108].toFixed(1),mean:+(a.reduce((s,v)=>s+v,0)/a.length).toFixed(1),v:+__mho.RO.v.toFixed(1)}});await up('gas')}
console.log(JSON.stringify({url:URL,res,errs:errs.slice(0,3)}));await b.close()})();
