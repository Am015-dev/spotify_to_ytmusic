// tShot.js — phone screenshots (852x393, real touch). usage: node tools/tShot.js <url> <outdir> [city fra|ath] [drive-seconds]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const URL=process.argv[2],OUT=process.argv[3]||'v85shots',city=process.argv[4]||'fra',DR=+(process.argv[5]||6);fs.mkdirSync(OUT,{recursive:true});
const INIT=`(()=>{const q=[];let t=0;window.__auto=true;window.requestAnimationFrame=cb=>{q.push(cb);return q.length};window.cancelAnimationFrame=()=>{};
 window.__tick=n=>{for(let i=0;i<n;i++){t+=1000/60;const c=q.splice(0);for(const f of c){try{f(t)}catch(e){setTimeout(()=>{throw e})}}}return t};
 setInterval(()=>{if(window.__auto)window.__tick(1)},16)})();`;
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await ctx.newPage();p.setDefaultTimeout(600000);
const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,200)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,200))});
await p.addInitScript(INIT);const cdp=await ctx.newCDPSession(p);
const tick=n=>p.evaluate(n=>__tick(n),n);
const F={};const pts=()=>Object.values(F).map(f=>({x:f.x,y:f.y,id:f.id,radiusX:6,radiusY:6,force:1}));
const center=sel=>p.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();const cs=getComputedStyle(e);if(r.width<4||cs.display==='none'||cs.visibility==='hidden')return null;for(let a=e;a;a=a.parentElement)if(a.hidden)return null;return[r.left+r.width/2,r.top+r.height/2]},sel);
const down=async(n,xy)=>{if(!xy)return;let id=0;while(Object.values(F).some(o=>o.id===id))id++;F[n]={x:xy[0],y:xy[1],id};await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:pts()})};
const up=async n=>{if(!F[n])return;delete F[n];const P=pts();await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});if(P.length)await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:P})};
const tap=async s=>{const xy=await center(s);if(!xy)return false;await down('tap',xy);await tick(4);await up('tap');await tick(4);return true};
const shot=async n=>{await p.screenshot({path:`${OUT}/${n}.png`});console.log('shot',n)};
await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
await p.evaluate(([c])=>{localStorage.clear();localStorage.setItem('mho_slot','1');if(c==='ath'){localStorage.setItem('mho_city@1',c);localStorage.setItem('mho_athd@1','A');localStorage.setItem('mho_roam.ath@1','{"otg":{}}');localStorage.setItem('mho_story.ath@1','{"seen":1}')}},[city]);
await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
await tap('#hcStory');await tick(10);await tap('#slotList .go');
for(let i=0;i<120;i++){try{if(await p.evaluate(()=>window.__mho&&__mho.state==='roam'))break;await p.waitForTimeout(2000)}catch(e){await p.waitForTimeout(2000)}}
await p.evaluate(()=>{window.__auto=false});
const CONT=['#storyGo','#m1Cs','#rcGo','#ogRetryB','#resBtn','#tutSkip'];
for(let i=0;i<30;i++){await tick(30);let t=false;for(const s of CONT)if(await tap(s)){t=true;break}if(!t)break}
await tick(30);await shot('1_start');
// drive: hold GAS, gentle steering
await down('gas',await center('#tG'));
for(let s=0;s<DR;s++){await tick(60);if(s%3==1)await shot('2_drive'+s)}
await up('gas');
console.log('speed',await p.evaluate(()=>__mho.RO.v*3.6),'errs',errs);
await b.close()})();
