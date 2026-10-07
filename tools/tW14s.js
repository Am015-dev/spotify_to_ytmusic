// tW14s.js: steering probe (W14). Real touch ◀/▶ at 852×393: tap, hold+release, quick corrections, lane change at 30/60/90 km/h on a city straight; per-frame steer/yaw log.
// usage: FAST=1 [STEP=30] TAG=x node tools/tW14s.js <url> <outdir>   STEP=30 → 30 fps clock (non-fast)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const path=require('path');const {execSync}=require('child_process');
const src=fs.readFileSync(path.join(__dirname,'tPlay.js'),'utf8');const INIT0=eval("`"+/const INIT=`([\s\S]*?)`;/.exec(src)[1]+"`"),INIT=process.env.STEP?INIT0.split("t+=1000/60").join("t+=1000/"+process.env.STEP):INIT0;
const FASTM=process.env.FAST==='1',URL0=process.argv[2]||'http://127.0.0.1:8766/local_dbg.html',URL=FASTM&&!/fast=1/.test(URL0)?URL0+(URL0.includes('?')?'&':'?')+'fast=1':URL0;
const OUT=process.argv[3]||'qa_w13';fs.mkdirSync(OUT,{recursive:true});const TEST=process.env.TEST||'all',has=t=>TEST==='all'||TEST.split(',').includes(t);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:3,isMobile:true,hasTouch:true});
 const p=await ctx.newPage();p.setDefaultTimeout(900000);const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,200)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,200))});
 await p.addInitScript(INIT);const cdp=await ctx.newCDPSession(p);let SYN=Date.now()/1000;if(FASTM){const s0=cdp.send.bind(cdp);cdp.send=(m,o)=>s0(m,m==='Input.dispatchTouchEvent'?{...o,timestamp:SYN}:o)}
 const tick=n=>{if(FASTM)SYN+=n/60;return p.evaluate(n=>__tick(n),n)};
 const F={};const pts=()=>Object.values(F).map(f=>({x:f.x,y:f.y,id:f.id,radiusX:6,radiusY:6,force:1}));
 const center=sel=>p.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();if(r.width<4)return null;for(let a=e;a;a=a.parentElement)if(a.hidden)return null;if(getComputedStyle(e).display==='none')return null;return[r.left+r.width/2,r.top+r.height/2]},sel);
 const send=()=>cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:pts()});
 const down=async(n,xy)=>{if(!xy)return false;let id=0;while(Object.values(F).some(o=>o.id===id))id++;F[n]={x:xy[0],y:xy[1],id};await send();return true};
 const up=async n=>{if(!F[n])return;delete F[n];const P=pts();await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});if(P.length){SYN+=.44;await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:P})}};
 const tap=async s=>{const xy=await center(s);if(!xy)return false;await down('tap',xy);await tick(4);await up('tap');await tick(4);return true};
 const ctl={gas:false,brake:false,L:false,R:false};
 async function apply(c){c={...ctl,...c};for(const [k,sel] of [['gas','#tG'],['brake','#tB'],['L','#tL'],['R','#tR']])if(c[k]!==ctl[k]){if(c[k])await down(k,await center(sel));else await up(k)}Object.assign(ctl,c)}
 const render=async()=>p.evaluate(()=>{window.__shooting=1;if(window.__fastR){__dbg.composer.render=window.__fastR;window.__fastR=null}__tick(1)});
 const unrender=async()=>p.evaluate(()=>{window.__shooting=0;if(!window.__fastR){window.__fastR=__dbg.composer.render;__dbg.composer.render=()=>{}}});
 const shot=async name=>{await render();const f=path.join(OUT,name+'.jpg');await p.screenshot({path:f,type:'jpeg',quality:75});await unrender();return f};
 // ---- start like a player
 await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('mho_slot','1')});await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
 await tap('#hcStory');await tick(10);await tap('#slotList .go');
 for(let i=0;i<150;i++){if(await p.evaluate(()=>window.__mho&&__mho.state==='roam'))break;await p.waitForTimeout(2000)}await p.evaluate(()=>{window.__auto=false});
 const CONT=['#storyGo','#m1Cs','#rcGo','#ogRetryB','#setDone','.m1go','#resBtn','#tutSkip'];
 for(let i=0;i<30;i++){await tick(30);let t=null;for(const s of CONT)if(await tap(s)){t=s;break}if(!t)break}
 await tap('#tG');await tick(2);
 await p.evaluate(()=>{window.__L=[];window.__mon=()=>{if(!window.__logOn)return;const R=__mho.RO,c=__dbg.camera,d=new __dbg.THREE.Vector3();c.getWorldDirection(d);
  __L.push({h:R.h,vh:R.vh??R.h,v:R.v,x:R.x,z:R.z,y:R.y,st:R.stkT||0,cy:Math.atan2(d.x,d.z),msg:(document.querySelector('#msg')||{}).textContent||''})}});
 const busy=()=>p.evaluate(()=>{const R=__mho.RO;return!!(R.card||R.mapOpen||R.story||R.frozen)});
 async function clear(){for(let i=0;i<10;i++){if(!(await busy()))return;for(const s of CONT)if(await tap(s))break;await tick(20)}}
 const place=async(x,z,h,v=0)=>{await p.evaluate(([x,z,h])=>{const M=__mho,R=M.RO;M.warp(x,z,h,performance.now());R.x=x;R.z=z;R.y=M.gnd(x,z,R.y+30);R.v=0;R.yr=0;R.vh=h;R.h=h;R.stkT=0;R.crTurn=null},[x,z,h]);await tick(30);await clear();await p.evaluate(([x,z,h,v])=>{const R=__mho.RO;R.x=x;R.z=z;R.h=R.vh=h;R.v=v;R.yr=0;R.stkT=0},[x,z,h,v]);await tick(2)};
 const EV=s=>p.evaluate(s=>__oc.ev(s),s);
 const log=async on=>{await p.evaluate(on=>{window.__logOn=on;if(on)window.__L=[]},on);if(!on)return p.evaluate(()=>__L)};
 const TAG=process.env.TAG||'x';
 const D=180/Math.PI,ad=(a,b)=>{let d=a-b;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return d};
 await p.evaluate(()=>{window.__mon=()=>{if(!window.__logOn)return;const R=__mho.RO,c=__dbg.camera,d=new __dbg.THREE.Vector3();c.getWorldDirection(d);const q=__oc.ev('cityAt')(R.x,R.z);
  __L.push({h:R.h,vh:R.vh??R.h,v:R.v,x:R.x,z:R.z,cy:Math.atan2(d.x,d.z),on:q?+(q.d-q.road.w/2).toFixed(2):null,ab:!!R.onAB,ww:[...document.querySelectorAll('body *')].some(e=>e.children.length===0&&/WRONG WAY/.test(e.textContent)&&e.getClientRects().length&&getComputedStyle(e).opacity!=='0')})}});
 await apply({gas:true});await tick(120);await apply({gas:false});await tick(60);
 for(let i=0;i<3;i++){if(!(await p.evaluate(()=>!!(__mho.RO.ch))))break;await p.keyboard.press('Escape');await tick(20);console.log('EVA',await tap('#roamPause [data-p="eva"]'));await tick(30);if(await p.evaluate(()=>{const e=document.querySelector('#roamPause');return e&&!e.hidden}))await tap('#roamPause [data-p="resume"]');await tick(20);await clear()}console.log('QUEST',await p.evaluate(()=>!!__mho.RO.ch));
 const res={};const S0=await p.evaluate(()=>{const R=__mho.RO;return{x:R.x,z:R.z,h:R.h}});
 const hits=L=>{let n=0;for(let i=3;i<L.length;i++)if(L[i].v<L[i-3].v-3&&!L[i].brk)n++;return n};
 const strip=(sh,name)=>{if(sh.length)execSync(`montage ${sh.join(' ')} -tile 3x2 -geometry 852x393+2+2 ${path.join(OUT,name)}`)};
 // lane in the traffic direction: try both kerb-side offsets, keep the one without WRONG WAY after 1.5 s of GAS
 // traffic side: mean sign of the traffic cars' offset from their own segment line, measured along (cos h,-sin h)
 const TSIDE=await p.evaluate(()=>{const H=__mho.HUB,N=H.nodes;let sum=0,n=0;for(const c of H.cars){if(c.dead||c.x==null)continue;const A=N[c.a],B=N[c.b];if(!A||!B)continue;const l=Math.hypot(B.x-A.x,B.z-A.z);if(l<5)continue;const h=Math.atan2(B.x-A.x,B.z-A.z);const lat=(c.x-A.x)*Math.cos(h)-(c.z-A.z)*Math.sin(h);if(Math.abs(lat)>.5){sum+=Math.sign(lat);n++;(window.__lats=window.__lats||[]).push(+lat.toFixed(1))}}return{side:Math.sign(sum)||1,n,sum,lats:window.__lats.slice(0,25)}});console.log('TSIDE',JSON.stringify(TSIDE));
 async function laneStart(x,z,h,w){const s=TSIDE.side;return[x+Math.cos(h)*s*w,z-Math.sin(h)*s*w]}
 // straight runs (as tW13 speed): city street and Autobahn
 const runs=await p.evaluate(()=>{const N=__mho.HUB.nodes,out={city:null,ab:null};
   for(let a=0;a<N.length;a++)for(const b of N[a].nb||[]){const A=N[a],B=N[b];let L=Math.hypot(B.x-A.x,B.z-A.z);if(L<5)continue;const dx=(B.x-A.x)/L,dz=(B.z-A.z)/L;let cur=b,prev=a,tot=L;
     for(let i=0;i<40;i++){const C=N[cur];let best=null;for(const n of C.nb||[]){if(n===prev)continue;const Dd=N[n],l=Math.hypot(Dd.x-C.x,Dd.z-C.z);if(l<1)continue;if(((Dd.x-C.x)*dx+(Dd.z-C.z)*dz)/l>.995){best=n;break}}if(best==null)break;tot+=Math.hypot(N[best].x-C.x,N[best].z-C.z);prev=cur;cur=best}
     const k=A.ab?'ab':'city';if(k==='city'){const ok=t=>{const c=__oc.ev('cityAt')(A.x+dx*t,A.z+dz*t);return c&&c.d<c.road.w/2};if(!(ok(5)&&ok(Math.min(tot,500)*.5)&&ok(Math.min(tot,500)-5)))continue}if(!out[k]||Math.min(tot,900)>Math.min(out[k].L,900))out[k]={L:tot,x:A.x,z:A.z,h:Math.atan2(dx,dz),w:(A.w||16)}}return out});
 res.runs=runs;console.log('RUNS',JSON.stringify(runs));
 // per-frame steering log
 await p.evaluate(()=>{const gc=__oc.ev('()=>CTL');window.__mon=()=>{if(!window.__logOn)return;const R=__mho.RO;const c=gc()||{};__L.push({t:performance.now(),st:+(c.steer||0).toFixed(3),yr:R.yr||0,h:R.h,vh:R.vh??R.h,v:R.v,x:R.x,z:R.z,dd:R.dDir||0,sk:R.stkT||0,cr:R.crTurn!=null?1:0,dl:R.dl||0,x26:R.c26x||0,hit:R.lastHit||0})}});
 const out={};const q=runs.city;const seqs={tap:[['L',.1]],hold:[['R',.8]],quick:[['L',.15],[null,.1],['R',.15],[null,.1],['L',.15]],lane:[['L',.35],[null,.05],['R',.35]]};
 for(const kmh of [30,60,90])for(const [nm,seq] of Object.entries(seqs)){
  const lane=await laneStart(q.x+Math.sin(q.h)*20,q.z+Math.cos(q.h)*20,q.h,3.2);await place(lane[0],lane[1],q.h);await apply({gas:true});
  let f=0;for(;f<60*15&&(await p.evaluate(()=>__mho.RO.v*3.6))<kmh;f+=2)await tick(2);
  // hold speed: gas pulses by speed during the manoeuvre
  await log(true);const ev=[];let fr=0;const step=async n=>{for(let g=0;g<n;g+=2){const v=await p.evaluate(()=>__mho.RO.v*3.6);await apply({gas:v<kmh});await tick(2);fr+=2}};
  await step(10);for(const [k,t] of seq){if(k){ev.push(['dn',k,fr]);await apply({[k]:true})}await step(Math.round(t*60));if(k){ev.push(['up',k,fr]);await apply({[k]:false})}}await step(90);
  const L=await log(false);
  // metrics
  const yr=L.map(o=>o.yr),dh=L.map((o,i)=>i?Math.abs(ad(o.h,L[i-1].h)):0);const peak=Math.max(...yr.map(Math.abs));const i0=ev[0][2]>>0;
  let t63=null;for(let i=i0;i<L.length;i++)if(Math.abs(yr[i])>=.63*peak){t63=(i-i0)/60;break}
  const iu=ev.filter(e=>e[0]==='up').pop()[2];const s0=Math.sign(yr[iu-1]||yr[iu]||0);let over=0;for(let i=iu;i<L.length;i++)if(Math.sign(yr[i])===-s0)over=Math.max(over,Math.abs(yr[i]));
  let flips=0;for(let i=iu+1;i<L.length;i++)if(Math.abs(yr[i])>.03&&Math.abs(yr[i-1])>.03&&Math.sign(yr[i])!==Math.sign(yr[i-1]))flips++;
  const jerk=Math.max(...L.map((o,i)=>i?Math.abs(o.yr-L[i-1].yr)*60:0));
  const r={kmh,nm,vStart:+(L[0].v*3.6).toFixed(0),peakYr:+peak.toFixed(2),t63:t63,overshootYr:+over.toFixed(3),overPct:+(100*over/Math.max(peak,1e-3)).toFixed(0),signFlipsAfterRelease:flips,maxYawAccel:+jerk.toFixed(1),maxDhDeg:+(Math.max(...dh)*D).toFixed(2),drift:L.some(o=>o.dd),pinned:L.some(o=>o.cr||o.sk>.3),slipMaxDeg:+Math.max(...L.map(o=>Math.abs(ad(o.h,o.vh))*D)).toFixed(1),headingNetDeg:+(ad(L[L.length-1].h,L[0].h)*D).toFixed(1)};
  out[kmh+'_'+nm]=r;console.log('ST',JSON.stringify(r));fs.writeFileSync(path.join(OUT,'st_'+TAG+'_'+kmh+'_'+nm+'.json'),JSON.stringify({ev,L}))}
 fs.writeFileSync(path.join(OUT,'steer_'+TAG+'.json'),JSON.stringify(out,null,1));console.log('ERRS',JSON.stringify(errs.slice(0,5)));await b.close()})().catch(e=>{console.error('ERR',e);process.exit(1)});
