// tW13f.js: drive-feel gate (turn at 5 s-of-GAS speed, slaloms 120 city / 160 Autobahn, hard brakes 120 / 170). FAST=1 TEST=turn,slalom,brake TAG=x node tools/tW13f.js <url> <outdir>
//         (gnd ray from 0.6 m above the tyre, and a THREE ray against the visible road meshes). Player at rest, at 60 km/h, and after a stop.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const path=require('path');const {execSync}=require('child_process');
const src=fs.readFileSync(path.join(__dirname,'tPlay.js'),'utf8');const INIT=eval('`'+/const INIT=`([\s\S]*?)`;/.exec(src)[1]+'`');
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
 if(has('turn')){
  const J=await p.evaluate(([sx,sz])=>{const M=__mho,N=M.HUB.nodes;let best=null;for(let i=0;i<N.length;i++){const n=N[i];if(!n||!n.nb||n.nb.length<3||n.ab||n.g)continue;const d0=Math.hypot(n.x-sx,n.z-sz);if(d0>1500)continue;
   for(const a of n.nb)for(const c of n.nb){if(a===c)continue;const A=N[a],C=N[c];if(!A||!C||A.ab||C.ab||A.g||C.g)continue;const la=Math.hypot(A.x-n.x,A.z-n.z),lc=Math.hypot(C.x-n.x,C.z-n.z);if(la<120||lc<45)continue;
    const hin=Math.atan2(n.x-A.x,n.z-A.z),hout=Math.atan2(C.x-n.x,C.z-n.z);let t=hout-hin;while(t>Math.PI)t-=2*Math.PI;while(t<-Math.PI)t+=2*Math.PI;if(Math.abs(Math.abs(t)-Math.PI/2)>.15)continue;
    const ok=(x,z)=>{const q=__oc.ev('cityAt')(x,z);return q&&q.d<q.road.w/2};if(!ok((A.x+n.x)/2,(A.z+n.z)/2)||!ok(n.x+(C.x-n.x)/lc*30,n.z+(C.z-n.z)/lc*30))continue;
    const s=Math.abs(Math.abs(t)-Math.PI/2)+d0/5000-la/2000;if(!best||s<best.s)best={s,A:[A.x,A.z],n:[n.x,n.z],C:[C.x,C.z],hin,hout,t,la,w:n.w||A.w||16}}}return best},[S0.x,S0.z]);
  res.turnJ=J;console.log('J',JSON.stringify(J));
  if(J){const hin=J.hin,sx=Math.sin(hin),sz=Math.cos(hin);
   for(const mode of ['human','nobrake']){
    // distance covered by 5 s of GAS from rest on this build (dry run on the approach leg)
    const st0=[J.n[0]-sx*(J.la-8),J.n[1]-sz*(J.la-8)];const lane=await laneStart(st0[0],st0[1],hin,3.2);await place(lane[0],lane[1],hin);await log(true);await apply({gas:true});await tick(300);await apply({gas:false});
    const Ld=await log(false),d5=Math.hypot(Ld[Ld.length-1].x-lane[0],Ld[Ld.length-1].z-lane[1]),v5=Math.abs(Ld[Ld.length-1].v)*3.6;
    const off=Math.min(process.env.OFF?+process.env.OFF:d5,J.la-6);const lx=lane[0]-J.n[0]+sx*0,lz=lane[1]-J.n[1];const lat=lx*Math.cos(hin)-lz*Math.sin(hin);
    const st=[J.n[0]-sx*off+Math.cos(hin)*lat,J.n[1]-sz*off-Math.sin(hin)*lat];await place(st[0],st[1],hin);await log(true);await apply({gas:true});
    const shots=[];let steering=null,done=false,f=0,tS=null,tE=null,braking=false;
    while(f<60*14){await tick(3);f+=3;const s=await p.evaluate(([nx0,nz0])=>{const R=__mho.RO;return{x:R.x,z:R.z,h:R.h,v:R.v,top:R.top,d:(nx0-R.x)*Math.sin(R.h)+(nz0-R.z)*Math.cos(R.h)}},J.n);
     const kmh=s.v*3.6;
     if(mode==='human'&&!steering){const want=s.d<45&&kmh>50;if(want!==braking){braking=want;await apply({gas:!want,brake:want})}}
     const rT=Math.abs(s.v)/Math.max(.4,1.35-.75*Math.min(1,Math.abs(s.v)/Math.max(30,s.top||40)));
     if(!steering&&s.d<Math.max(12,rT*.9)){steering=J.t>0?'L':'R';await apply({gas:true,brake:false,[steering]:true});tS=f}
     if(steering&&!done){if(Math.abs(ad(s.h,hin))>=Math.abs(J.t)-.12){await apply({L:false,R:false});done=true;tE=f}}
     if(steering&&shots.length<6&&(f-tS)%15===0)shots.push(await shot(TAG+'_turn_'+mode+'_'+shots.length));
     if(done&&f-tE>120)break}
    await apply({gas:false,brake:false,L:false,R:false});const Lg=await log(false);
    const tot=ad(Lg[Lg.length-1].h,hin)*D,iS=Math.max(0,Lg.length-1-(f-(tS||f))),seg=Lg.slice(iS);
    const slip=Math.max(...seg.filter(o=>Math.abs(o.v)>3).map(o=>Math.abs(ad(o.h,o.vh))*D));
    const t45=seg.findIndex(o=>Math.abs(ad(o.h,hin))>=Math.PI/4),c45=seg.findIndex(o=>Math.abs(ad(o.cy,seg[0].cy))>=Math.PI/4);
    const cl=Math.hypot(J.C[0]-J.n[0],J.C[1]-J.n[1]),ux=(J.C[0]-J.n[0])/cl,uz=(J.C[1]-J.n[1])/cl,hw=await p.evaluate(([x,z])=>{const q=__oc.ev('cityAt')(x,z);return q?q.road.w/2:null},[J.n[0]+ux*30,J.n[1]+uz*30]);
    const post=seg.filter(o=>((o.x-J.n[0])*ux+(o.z-J.n[1])*uz)>4).map(o=>Math.abs((o.x-J.n[0])*uz-(o.z-J.n[1])*ux));const offMax=post.length&&hw?Math.max(...post)-hw:99;
    const r={mode,v5:+v5.toFixed(0),d5:+d5.toFixed(0),entryKmh:+(Math.abs(seg[0]?seg[0].v:0)*3.6).toFixed(0),turnedDeg:+tot.toFixed(0),maxSlipDeg:+slip.toFixed(1),camLagS:t45>=0&&c45>=0?+((c45-t45)/60).toFixed(2):null,exitRoadHalfW:hw,maxOffExitCentreM:post.length?+Math.max(...post).toFixed(1):null,offRoadMaxM:+offMax.toFixed(1),onRoad:offMax<=0,wallHits:hits(seg),wrongWay:seg.some(o=>o.ww),exitKmh:+(Math.abs(Lg[Lg.length-1].v)*3.6).toFixed(0)};
    res['turn_'+mode]=r;strip(shots,TAG+'_strip_turn_'+mode+'.jpg');console.log('TURN',JSON.stringify(r))}}}
 if(has('slalom')){for(const [k,tgt] of [['city',120],['ab',160]]){const q=runs[k];if(!q)continue;const lane=await laneStart(q.x+Math.sin(q.h)*20,q.z+Math.cos(q.h)*20,q.h,k==='ab'?5.5:3.2);await place(lane[0],lane[1],q.h);await log(true);await apply({gas:true});
   let f=0;for(;f<60*20&&(await p.evaluate(()=>__mho.RO.v*3.6))<tgt;f+=6)await tick(6);const reach=f/60;const i0=(await p.evaluate(()=>__L.length));const shots=[];
   const seq=[['L',.4],['R',.8],['L',.8],['R',.8],['L',.8],['R',.4]];for(const [key,t] of seq){await apply({[key]:true});for(let g=0;g<t*60;g+=6){const v=await p.evaluate(()=>__mho.RO.v*3.6);await apply({gas:v<tgt});await tick(6);if(shots.length<6&&g===0)shots.push(await shot(TAG+'_sl_'+k+'_'+shots.length))}await apply({[key]:false})}
   await tick(60);await apply({gas:false});const L=(await log(false)).slice(i0);
   const sl=Math.max(...L.map(o=>Math.abs(ad(o.h,o.vh))*D)),hs=L.map(o=>ad(o.h,q.h)*D),r={k,target:tgt,reachS:reach,maxSlipDeg:+sl.toFixed(1),headingSwingDeg:+(Math.max(...hs)-Math.min(...hs)).toFixed(1),vMin:+Math.min(...L.map(o=>o.v*3.6)).toFixed(0),vMax:+Math.max(...L.map(o=>o.v*3.6)).toFixed(0),wallHits:hits(L),offRoad:k==='city'?Math.max(...L.map(o=>o.on??99)):null,wrongWay:L.some(o=>o.ww)};
   res['slalom_'+k]=r;strip(shots,TAG+'_strip_slalom_'+k+'.jpg');console.log('SLALOM',JSON.stringify(r))}}
 if(has('brake')){for(const [k,tgt] of [['city',120],['ab',170]]){const q=runs[k];if(!q)continue;const lane=await laneStart(q.x+Math.sin(q.h)*20,q.z+Math.cos(q.h)*20,q.h,k==='ab'?5.5:3.2);await place(lane[0],lane[1],q.h);await apply({gas:true});
   let f=0;for(;f<60*30&&(await p.evaluate(()=>__mho.RO.v*3.6))<tgt;f+=3)await tick(3);const v0=await p.evaluate(()=>__mho.RO.v*3.6);await log(true);await apply({gas:false,brake:true});const shots=[];let g=0;
   for(;g<60*12;g+=3){await tick(3);if(g%24===0&&shots.length<6)shots.push(await shot(TAG+'_br_'+k+'_'+shots.length));if(await p.evaluate(()=>Math.abs(__mho.RO.v)<.3))break}await apply({brake:false});const L=await log(false);
   const dist=L.reduce((a,o,i)=>i?a+Math.hypot(o.x-L[i-1].x,o.z-L[i-1].z):0,0),yaw=Math.max(...L.map(o=>Math.abs(ad(o.h,L[0].h))*D)),r={k,fromKmh:+v0.toFixed(0),stopM:+dist.toFixed(1),stopS:+(g/60).toFixed(2),maxYawDeg:+yaw.toFixed(1),wrongWay:L.some(o=>o.ww)};
   res['brake_'+k]=r;strip(shots,TAG+'_strip_brake_'+k+'.jpg');console.log('BRAKE',JSON.stringify(r))}}
 fs.writeFileSync(path.join(OUT,'feel_'+TAG+'.json'),JSON.stringify(res,null,1));console.log('ERRS',JSON.stringify(errs.slice(0,5)));await b.close()})().catch(e=>{console.error('ERR',e);process.exit(1)});
