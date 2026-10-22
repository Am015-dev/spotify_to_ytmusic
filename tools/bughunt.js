// bughunt: fast, strict, automated bug hunt on the BUILT page (bughunt-x1000, 2026-10-22). No graphics while it runs, no game code changed.
// A bored-phone-player AUTOPLAYER (full gas, steering bursts, side streets, off road, up hills, rams NPC cars head-on/side/rear at 10-60 km/h, reverse, boost,
// pause, fast travel, pins, on-foot bursts) drives the real frame loop with a fixed dt in a tight loop (rAF is captured and stepped from page.evaluate), seeded.
// DETECTORS log time, seed, city, x,y,z, a repro URL and one line; hits are deduped per detector by 25 m cell. Then real touch taps on ❚❚ / RESET CAR / map / FAST TRAVEL.
//   node tools/bughunt.js --hours 2 --city fra            gate: one PASS/FAIL line per detector (wall budget --budget 270 s incl. boot; sim time achieved is printed)
//   node tools/bughunt.js --hours 6 --city both --budget 2400 --json docs/shots/bughunt/fra_ath.json --shots 10   long hunt + 393x852 shots of the worst cells
//   --build out/<ver>  use an existing build (default: tools/build.sh bughunt once, reused while src/ is older)   --dt 0.05 (frame clamp = 20 fps phone; 0.0333 = 30 fps)
//   --seed0 K  offset the seeds (more samples from repeat runs)   --seeds N  episodes per city (default: one per 10 sim-min)   --pages N  parallel pages per city (default 1)   --notap  skip the touch-tap check
// Speed note: the game's own frame (streets step ~11 ms + roamStep ~6 ms + cam ~4 ms on this 4-core container) caps one page at ~2-3x real time, not x1000;
// --hours is the TARGET, --budget the wall cap: the result is scaled to per hour and the line says how many sim-minutes it really covered.
const {chromium}=(()=>{try{return require('playwright')}catch(e){return require('/opt/node22/lib/node_modules/playwright')}})();
const fs=require('fs'),path=require('path'),http=require('http'),cp=require('child_process');
const A=process.argv.slice(2),arg=(k,d)=>{const i=A.indexOf('--'+k);return i<0?d:(A[i+1]&&!A[i+1].startsWith('--')?A[i+1]:true)};
const HOURS=+arg('hours',2),CITY=arg('city','fra'),BUDGET=+arg('budget',270),DT=+arg('dt',0.05),PAGES=+arg('pages',1),JSON_OUT=arg('json',''),SHOTS=+arg('shots',0),NOTAP=!!arg('notap',false);
const ROOT=path.join(__dirname,'..'),T0=Date.now(),wall=()=>(Date.now()-T0)/1000;
const LIMIT={nan:0,bounds:0,jsErr:0,belowGround:0,yJump:0,launch:0,stuck:4,npcOverlap:2,npcLateral:3,npcPop:6,backOnRoad:6,frustration:15,invisible:1,popup:2,deadButton:0};
let BUILD=arg('build','');
if(!BUILD){BUILD=path.join(ROOT,'out/bughunt');const idx=path.join(BUILD,'index.html');const newest=d=>fs.readdirSync(d).reduce((m,f)=>Math.max(m,fs.statSync(path.join(d,f)).mtimeMs),0);
 if(!fs.existsSync(idx)||fs.statSync(idx).mtimeMs<newest(path.join(ROOT,'src'))){const r=cp.spawnSync('bash',['tools/build.sh','bughunt'],{cwd:ROOT,encoding:'utf8'});if(!/BUILD_OK/.test(r.stdout)){console.log('FAIL build\n'+(r.stdout+r.stderr).slice(-600));process.exit(2)}}}
const serve=dir=>new Promise(res=>{const T={'.html':'text/html','.js':'text/javascript','.json':'application/json','.mp3':'audio/mpeg'};const s=http.createServer((q,r)=>{let f=path.join(dir,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,b)=>{if(e){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});r.end(b)})}).listen(0,'127.0.0.1',()=>res([s,s.address().port]))});

// ---------- in-page hunter (evaluated in module scope through __oc.ev, so it sees the game's globals) ----------
const HUNTER=String.raw`(()=>{if(window.__BH)return 'again';
const BH=window.__BH={ev:[],cells:{},cnt:{},t:0,gasT:0,slowT:0,km:0,hits:{npc:0,world:0,invisible:0},msgs:{},lastAct:-99,seed:1,dt:.05,q:[],act:'',acts:{}};
const raf0=window.requestAnimationFrame.bind(window);BH.raf0=raf0;BH.F=()=>frame;window.requestAnimationFrame=cb=>{if(cb!==BH.F())BH.q.push(cb);return 1};   // capture the frame loop: from now on only BH.step() advances the game
let vt=performance.now()+1e6;
const rnd=()=>{BH.s=(BH.s*16807)%2147483647;return BH.s/2147483647};
const cell=(x,z)=>Math.floor(x/25)+','+Math.floor(z/25);
const add=(det,desc,x,z,y,extra)=>{x=x??RO.x;z=z??RO.z;y=y??RO.y;BH.cnt[det]=(BH.cnt[det]||0)+1;const k=det+'|'+cell(x,z);const c=BH.cells[k];if(c){c.n++;return}
 BH.cells[k]={det,n:1,t:+BH.t.toFixed(1),seed:BH.seed,city:CID,x:+x.toFixed(1),y:+(+y).toFixed(1),z:+z.toFixed(1),h:+RO.h.toFixed(2),kmh:Math.round(Math.abs(RO.v)*3.6),act:BH.act,mode:BH.mode||'',desc,repro:'?test='+CID+'&at='+Math.round(x)+','+Math.round(z)+' seed '+BH.seed+' t '+BH.t.toFixed(0)+' s',...(extra||{})}};
BH.add=add;
// messages: BACK ON THE ROAD and every toast the player sees
const wrapMsg=(name,ti)=>{try{const f=eval(name);if(typeof f!=='function')return;const __w=function(){try{const s=[...arguments].slice(0,ti+1).filter(a=>typeof a==='string').join(' ').trim();if(s&&BH.on){BH.msgs[s]=(BH.msgs[s]||0)+1;if(/^UNSTUCK/.test(s))add('unstuck','UNSTUCK auto-reverse');if(/BACK ON THE ROAD/.test(s)&&BH.t-(BH.borT||-9)>1.5){BH.borT=BH.t;BH.borP=1;add('backOnRoad','re-placed: '+s.slice(0,60))}}}catch(e){}return f.apply(this,arguments)};eval(name+'=__w')}catch(e){}};
wrapMsg('say',1);wrapMsg('feed',0);
// popups: top-level overlays that become visible with no player action in the last 2 s
const POP='#roamCard,#roamPop,#roamPrompt,#storyGo,#rcGo,#m1Cs,#tutSkip,#settings,#gbx,#spRes,#roamPause,#profile,#roamMap,.m1go,[id$=Card],[id$=card],[class*=modal]';
const visible=e=>{if(!e||e.hidden)return false;const r=e.getBoundingClientRect();if(r.width<60||r.height<30)return false;const s=getComputedStyle(e);return s.display!=='none'&&s.visibility!=='hidden'&&+s.opacity>.2};
BH.popSeen=new Set();
const popScan=()=>{const now=new Set();let big=[];try{big=[...document.querySelectorAll(POP)]}catch(e){}
 for(const e of document.body.children){if(e.tagName==='CANVAS'||e.tagName==='SCRIPT')continue;const s=getComputedStyle(e);if((s.position==='fixed'||s.position==='absolute')&&(+s.zIndex||0)>=40)big.push(e)}
 for(const e of big){if(!visible(e))continue;const r=e.getBoundingClientRect();if(r.width*r.height<.06*innerWidth*innerHeight&&!/card|pop|story|modal/i.test(e.id+' '+e.className))continue;const id=e.id||e.className||e.tagName,tx=(e.innerText||'').trim();if(!tx)continue;now.add(id);
  if(!BH.popSeen.has(id)&&BH.t-BH.lastAct>2)add('popup','"'+id+'" appeared without a tap: '+(e.innerText||'').replace(/\s+/g,' ').slice(0,70))}
 BH.popSeen=now};
// ---------- autoplayer ----------
const keys=()=>{for(const k in K)K[k]=false};
const nearCar=(R)=>{let b=null,bd=R;for(const c of HUB.cars){if(c.dead>0||c.pk)continue;const d=Math.hypot(c.x-RO.x,c.z-RO.z);if(d<bd&&d>3){bd=d;b=c}}return b};
const steerTo=a=>{const e=Math.atan2(Math.sin(a-RO.h),Math.cos(a-RO.h));K.ArrowRight=e>.08;K.ArrowLeft=e<-.08;return e};   // RO.h grows to the right: sin(h),cos(h) is forward
const groundY=(x,z)=>{try{return roamTerr(x,z,999).g}catch(e){return 0}};
const garages=()=>(RO.marks||[]).filter(m=>m.kind==='garage'&&m.id&&(()=>{try{return markKnown(m)}catch(e){return false}})());
const MODES=['cruise','cruise','cruise','side','offroad','hill','ram','ram','ram','reverse','boost','pause','ft','pin','foot'];
const pick=()=>{const m=MODES[Math.floor(rnd()*MODES.length)];BH.mode=m;BH.mT=0;BH.mDur=m==='cruise'?4+rnd()*10:m==='ram'?12:m==='foot'?10:m==='hill'?14:m==='offroad'?8:2+rnd()*3;BH.mTgt=null;BH.mSp=10+rnd()*50;BH.dir=rnd()<.5?-1:1;BH.bT=0;BH.acts[m]=(BH.acts[m]||0)+1;
 if(m==='pause'){try{roamPauseOpen();BH.lastAct=BH.t}catch(e){}}
 if(m==='ft'){const g=garages();if(g.length){const t=g[Math.floor(rnd()*g.length)];RO.ftT=0;BH.lastAct=BH.t;BH.warp=BH.t;try{fastTravel(t)}catch(e){add('jsErr','fastTravel threw '+String(e).slice(0,60))}}}
 if(m==='pin'){BH.lastAct=BH.t;try{PIN_set(RO.x+(rnd()-.5)*1200,RO.z+(rnd()-.5)*1200,true)}catch(e){}}
 if(m==='foot'){BH.lastAct=BH.t;try{if(typeof OF_exit==='function'){OF_exit();BH.foot=1}}catch(e){BH.foot=0}}};
const drive=dt=>{const m=BH.mode;BH.mT+=dt;keys();BH.gas=false;
 if(m==='pause'){if(BH.mT>BH.mDur*.5){try{roamPauseClose()}catch(e){}BH.mT=BH.mDur}return}
 if(m==='foot'){if(BH.foot&&RO.foot&&RO.foot!=='car'){K.ArrowUp=true;BH.bT-=dt;if(BH.bT<=0){BH.bT=.3+rnd()*1.2;BH.dir=rnd()<.33?-1:rnd()<.5?1:0}K.ArrowLeft=BH.dir<0;K.ArrowRight=BH.dir>0;if(rnd()<.01)K.Space=true}
  if(BH.mT>=BH.mDur){try{OF_reset()}catch(e){}BH.foot=0;BH.lastAct=BH.t}return}
 K.ArrowUp=true;BH.gas=true;
 if(m==='cruise'||m==='side'||m==='boost'){BH.bT-=dt;if(BH.bT<=0){BH.bT=m==='side'?1.2+rnd():.2+rnd()*1.3;BH.dir=rnd()<.5?(rnd()<.5?-1:1):0;if(m==='side')BH.dir=BH.dir||1}K.ArrowLeft=BH.dir<0;K.ArrowRight=BH.dir>0;if(m==='boost')K.ShiftLeft=true}
 else if(m==='offroad'){if(BH.mTgt==null)BH.mTgt=RO.h+BH.dir*(1.2+rnd()*.8);steerTo(BH.mTgt)}
 else if(m==='hill'){if(BH.mTgt==null||BH.mT%3<dt){let best=RO.h,bg=-1e9;for(let i=0;i<8;i++){const a=i*Math.PI/4,g=groundY(RO.x+Math.sin(a)*40,RO.z+Math.cos(a)*40);if(g>bg){bg=g;best=a}}BH.mTgt=best}steerTo(BH.mTgt)}
 else if(m==='ram'){if(!BH.mTgt||BH.mTgt.dead>0)BH.mTgt=nearCar(90);const c=BH.mTgt;if(c){steerTo(Math.atan2(c.x-RO.x,c.z-RO.z));const v=Math.abs(RO.v)*3.6;if(v>BH.mSp){K.ArrowUp=false;BH.gas=false;if(v>BH.mSp+8)K.ArrowDown=true}BH.ramD=Math.hypot(c.x-RO.x,c.z-RO.z)}}
 else if(m==='reverse'){K.ArrowUp=false;BH.gas=false;K.ArrowDown=true;K.ArrowLeft=BH.dir<0;K.ArrowRight=BH.dir>0}};
// ---------- detectors ----------
const P={x:RO.x,y:RO.y,z:RO.z,v:RO.v},CP=new Map();let ovl=new Map(),belowN=0,stuckT=0,stuckOn=false;
const detect=dt=>{const x=RO.x,y=RO.y,z=RO.z,foot=RO.foot&&RO.foot!=='car',busy=RO.frozen||RO.card||RO.mapOpen||RO.wk||state!=='roam';
 const mv=Math.hypot(x-P.x,z-P.z),warp=mv>12||BH.t-(BH.warp||-99)<1.5;if(mv>12)BH.warp=BH.t;
 if(!isFinite(x+y+z+RO.v+RO.h))add('nan','player NaN x/y/z/v/h',0,0,0);
 if(x<WX0+5||x>WX1-5||z<WZS+5||z>WZN-5)add('bounds','player out of the world box');
 if(!foot&&!busy){
  const g=groundY(x,z);if(y<g-1){if(++belowN===3)add('belowGround','car '+(g-y).toFixed(1)+' m under the ground line')}else belowN=0;
  if(!warp&&Math.abs(y-P.y)>2)add('yJump','car y jumped '+(y-P.y).toFixed(1)+' m in one step at '+Math.round(Math.abs(RO.v)*3.6)+' km/h');
  if((RO.vy||0)>15)add('launch','car launched up at '+RO.vy.toFixed(0)+' m/s');
  const gs=warp?99:mv/dt;BH.km+=Math.min(mv,60)/1000;
  if(BH.gas){BH.gasT+=dt;if(gs<10/3.6)BH.slowT+=dt;if(gs<3/3.6){stuckT+=dt;if(stuckT>2&&!stuckOn){stuckOn=true;add('stuck','gas held, < 3 km/h for 2 s (mode '+BH.mode+')')}}else{stuckT=0;stuckOn=false}}else{stuckT=0;stuckOn=false}
  // contacts: a speed drop of > 6 m/s in one step without the brake
  const dv=Math.abs(P.v)-Math.abs(RO.v);
  if(!warp&&dv>6&&!K.ArrowDown){const c=nearCar(8),fx=Math.sin(RO.h),fz=Math.cos(RO.h);
   if(c){BH.hits.npc++}else{let b=null;for(const r of[1.5,2.5,3.5]){try{b=roamHit(x+fx*r,z+fz*r,1.4,y)}catch(e){}if(b)break}
    if(b){BH.hits.world++}else{const g2=groundY(x+fx*3,z+fz*3);if(g2-y<.6){BH.hits.invisible++;add('invisible','stopped by nothing: -'+(dv*3.6).toFixed(0)+' km/h in one step, no NPC, no collider, no slope ahead')}}}}}
 const NDG=(c,p)=>{const f=v=>typeof v==='number'?+v.toFixed(2):v;return{dg:{a:c.a,b:c.b,t:f(c.t),cv:f(c.cv),hh:f(c.hh),yo:f(c.yo),lr:[f(c.lrx),f(c.lrz)],route:!!c.route,tr:!!c.tr,hitT:f(c.hitT),deS:c.deS,hold:f(c.hold),fdt:f(c.fdt),dx:p?f(c.x-p.x):null,dz:p?f(c.z-p.z):null,p:p?{a:p.a,b:p.b,t:f(p.t),cv:f(p.cv),hh:f(p.hh),yo:f(p.yo),lr:[f(p.lrx),f(p.lrz)],mx:f(p.mx),mz:f(p.mz),dead:f(p.dead)}:null,act:BH.act}}};
 // stuck ladder / UNSTUCK cells (ath-trap-r22e14): where the ladder fires, so the trap geometry can be found
 try{const S=SKH.cnt;for(const k of['rev','lift']){const n=S[k]|0,o=BH['skh_'+k]??n;if(n>o)k==='lift'?add('skh_lift','stuck ladder lift (from here)',P.x,P.z,P.y):add('skh_rev','stuck ladder reverse-assist');BH['skh_'+k]=n}}catch(e){}
 if(BH.borP){BH.borP=0;if(mv>12)add('liftFrom','BACK ON THE ROAD lifted from here',P.x,P.z,P.y)}
 // NPC cars
 const cf=(()=>{try{const d=new THREE.Vector3();camera.getWorldDirection(d);return[camera.position.x,camera.position.z,d.x,d.z]}catch(e){return[x,z,Math.sin(RO.h),Math.cos(RO.h)]}})();
 for(const c of HUB.cars){if(!isFinite(c.x+c.z)){add('nan','NPC car NaN',x,z,y);continue}const dd=Math.hypot(c.x-x,c.z-z);const p=CP.get(c),alive=!(c.dead>0)&&!c.pk;
  if(alive&&dd<60&&!warp){const vx=c.x-cf[0],vz=c.z-cf[1],vd=Math.hypot(vx,vz)||1,view=(vx*cf[2]+vz*cf[3])/vd>.64&&vd>6;
   if(view&&(!p||!p.alive||Math.hypot(c.x-p.x,c.z-p.z)>6))add('npcPop',p&&p.alive?'NPC jumped '+Math.hypot(c.x-p.x,c.z-p.z).toFixed(0)+' m in one step, '+dd.toFixed(0)+' m away in view':'NPC appeared '+dd.toFixed(0)+' m away in view',c.x,c.z,c.y,NDG(c,p));
   // traffic-in-view-r22e15: sideways = the step measured against the car's last step of motion (velocity direction, else its lane edge A->B) AND its pose heading; c.hh is the DRAWN heading
   // (93_cars_lego CR_susp, drawn cars only, set after the pose), so on junction curves and for undrawn/LOD cars it lagged the motion and read as a slide
   if(p&&p.alive&&dd<30){const mx=c.x-p.x,mz=c.z-p.z,m=Math.hypot(mx,mz);if(m<6){let hx=p.mx,hz=p.mz,hm=Math.hypot(hx||0,hz||0);if(!(hm>.02)){const N=HUB.nodes,A=N&&N[c.a],B=N&&N[c.b];hx=A&&B?B.x-A.x:Math.sin(c.hh||0);hz=A&&B?B.z-A.z:Math.cos(c.hh||0);hm=Math.hypot(hx,hz)||1}
    {const h=typeof c.hh==='number'?c.hh:Math.atan2(c.hdx||0,c.hdz||1),l0=Math.abs(mx*Math.cos(h)-mz*Math.sin(h))/dt;if(l0>3){if((p.l0=(p.l0||0)+1)===2)BH.cnt.npcLatHH=(BH.cnt.npcLatHH||0)+1}else p.l0=0}/* the old c.hh reading, counted only (INFO) */
    const l1=Math.abs(mx*hz-mz*hx)/hm/dt,dm=Math.hypot(c.hdx||0,c.hdz||0),lat=dm>.5?Math.min(l1,Math.abs(mx*c.hdz-mz*c.hdx)/dm/dt):l1;/* both references must call it sideways: a car pivoting at a node points where it now moves (its pose heading c.hdx/hdz, set on every pose, drawn or not) */if(lat>3){if((p.lat=(p.lat||0)+1)===2)add('npcLateral','NPC slides sideways '+lat.toFixed(1)+' m/s, '+dd.toFixed(0)+' m from the player',c.x,c.z,c.y,NDG(c,p))}else p.lat=0}}}
  if(alive&&dd<9&&!foot&&Math.abs((c.y||y)-y)<2){let M=null;try{const[w,l]=OB_cdim(c.k);M=NC_mtv(x,z,RO.h,OB_HW,OB_HL,c.x,c.z,typeof c.hh==='number'?c.hh:Math.atan2(c.hdx||0,c.hdz||1),w,l)}catch(e){}
   const o=ovl.get(c)||0;if(M&&M[2]>.25){ovl.set(c,o+1);if(o+1===3)add('npcOverlap','player box inside an NPC car '+M[2].toFixed(2)+' m for 3 frames at '+Math.round(Math.abs(RO.v)*3.6)+' km/h (mode '+BH.mode+')')}else ovl.delete(c)}
  CP.set(c,{x:c.x,z:c.z,alive,lat:p&&p.lat,l0:p&&p.l0,mx:p&&p.alive?c.x-p.x:0,mz:p&&p.alive?c.z-p.z:0,a:c.a,b:c.b,t:c.t,cv:c.cv,hh:c.hh,yo:c.yo,lrx:c.lrx,lrz:c.lrz,dead:c.dead,pk:c.pk})}
  // let-cars-climb-r22e17: slope slide-backs per bot mode (gas held on a terrain slope facing up it, the car moving back down) with the clamp that did it, and wall climbs
  {const md=BH.mode||'',S=RO.trSlope,sk=(()=>{try{return SKH.cnt.slide|0}catch(e){return 0}})(),skd=sk>(BH.skS??sk);BH.skS=sk;BH.mT2=BH.mT2||{};BH.mT2[md]=(BH.mT2[md]||0)+dt;
   const up=S&&S.a>.15,back=!warp&&up&&BH.gas&&(skd||(RO.trSl||0)>.5||RO.v<-.3);
   if(back&&!BH.slOn){BH.slOn=1;const why=skd?'skh':(RO.trSl||0)>.5?'trSl':(RO.trGrip??1)<1?'grip':'grav',k=md+'|'+why;BH.sl=BH.sl||{};BH.sl[k]=(BH.sl[k]||0)+1;BH.cnt.slopeSlide=(BH.cnt.slopeSlide||0)+1}else if(!back&&(!up||RO.v>1))BH.slOn=0;
   let wc=false;try{wc=!warp&&y-P.y>.05&&y-roamTerr(x,z,y+.3).g>.8&&roamHit(x,z,2.2,y-.5)}catch(e){}if(wc&&!BH.wcOn){BH.wcOn=1;add('wallClimb','car climbs a wall: '+(y-groundY(x,z)).toFixed(1)+' m over the ground line inside a collider')}else if(!wc)BH.wcOn=0}
 P.x=x;P.y=y;P.z=z;P.v=RO.v};
// ---------- stepping ----------
BH.episode=(seed,dt)=>{BH.seed=seed;BH.s=seed*7919+13;BH.dt=dt;Math.random=rnd;try{__tq.reset()}catch(e){}
 const N=HUB.nodes||[];for(let k=0;k<20;k++){const n=N[Math.floor(rnd()*N.length)];if(n&&!n.ab&&!n.pk){try{if(roamWarp(n.x,n.z,rnd()*6.28))break}catch(e){}}}
 BH.warp=BH.t;P.x=RO.x;P.y=RO.y;P.z=RO.z;P.v=RO.v;CP.clear();ovl.clear();pick();return [RO.x,RO.z]};
BH.run=(ms,max)=>{const t0=performance.now();let n=0;BH.on=true;
 while(performance.now()-t0<ms&&n<(max||1e9)){if(LD.on||LD.busy){BH.ldWait=(BH.ldWait||0)+1;break}   // a loader (far fast travel builds a biome) runs on real rAF + promises: hand back so it can finish
  const dt=BH.dt;if(BH.mT>=BH.mDur)pick();drive(dt);vt+=dt*1000;const q=BH.q;BH.q=[];for(const cb of q){try{cb(vt)}catch(e){}}try{BH.F()(vt)}catch(e){add('jsErr','frame threw: '+String(e).slice(0,80))}
  if(!(state==='roam'))try{__tq.skip()}catch(e){}
  BH.t+=dt;n++;try{detect(dt)}catch(e){add('jsErr','detector: '+String(e).slice(0,80))}if(n%20===0)popScan()}
 BH.on=false;keys();return n};
BH.release=()=>{window.requestAnimationFrame=BH.raf0;for(const cb of BH.q)BH.raf0(cb);BH.q=[];BH.raf0(BH.F());keys()};
BH.capture=()=>{window.requestAnimationFrame=cb=>{if(cb!==BH.F())BH.q.push(cb);return 1}};
BH.report=()=>({ldWait:BH.ldWait||0,t:BH.t,km:BH.km,cnt:BH.cnt,gasT:BH.gasT,slowT:BH.slowT,hits:BH.hits,acts:BH.acts,cells:Object.values(BH.cells),msgs:Object.entries(BH.msgs).sort((a,b)=>b[1]-a[1]).slice(0,25),xcErr:(()=>{try{return XC.err.slice(0,10)}catch(e){return[]}})(),skh:(()=>{try{return SKH.cnt}catch(e){return null}})(),sl:BH.sl||{},mT:BH.mT2||{}});
return 'ok'})()`;

// ---------- touch taps (real Playwright touch on the real buttons, rAF released) ----------
async function taps(p){const out=[];const T=async(sel)=>{const b=await p.$(sel);if(!b)return'missing';const r=await b.boundingBox();if(!r||r.width<1)return'not visible';await p.touchscreen.tap(r.x+r.width/2,r.y+r.height/2);await p.waitForTimeout(700);return'ok'};
 const ev=s=>p.evaluate(c=>__oc.ev(c),s);
 await ev(`__BH.release();try{__tq.reset()}catch(e){}RO.v=0;0`);await p.waitForTimeout(800);
 let a=await T('#tP');let s=await ev(`JSON.stringify({open:!$('#roamPause').hidden,frozen:!!RO.frozen})`);s=JSON.parse(s);out.push(['pause ❚❚ opens the menu',a==='ok'&&s.open,a+' open='+s.open]);
 a=await T('#roamPause .pg [data-fd=reset]');s=JSON.parse(await ev(`JSON.stringify({closed:$('#roamPause').hidden,pill:typeof SKH_vis==='function'&&SKH_vis()})`));out.push(['RESET CAR re-places + closes pause',a==='ok'&&s.closed,a+' closed='+s.closed+' pill='+s.pill]);
 if(!s.closed)await ev(`try{roamPauseClose()}catch(e){}0`);
 a=await T('#roamMapBtn');if(a!=='ok')a=await T('#roamMini');s=JSON.parse(await ev(`JSON.stringify({map:!!RO.mapOpen})`));out.push(['map (button or minimap) opens the map',a==='ok'&&s.map,a+' map='+s.map]);
 const g=JSON.parse(await ev(`(()=>{if(!RO.mapOpen)toggleMap(true);const gs=RO.marks.filter(m=>m.kind==='garage'&&m.id&&m.id!=='g_city'&&markKnown(m)).sort((a,b)=>Math.hypot(b.x-RO.x,b.z-RO.z)-Math.hypot(a.x-RO.x,a.z-RO.z));RO.ftT=0;RO.card=null;if(gs[0])ftShow(gs[0]);return JSON.stringify({id:gs[0]&&gs[0].id,x:RO.x,z:RO.z})})()`));
 a=await T('#roamFT');const tf=Date.now();await p.waitForTimeout(1500);await p.waitForFunction(()=>__oc.ev('!LD.on&&!LD.busy&&state==="roam"'),null,{polling:250,timeout:90000}).catch(()=>{});const ftS=(Date.now()-tf)/1000;s=JSON.parse(await ev(`JSON.stringify({x:RO.x,z:RO.z,map:!!RO.mapOpen,st:state})`));const mv=Math.hypot(s.x-g.x,s.z-g.z);out.push(['FAST TRAVEL tap moves the car',a==='ok'&&mv>100,a+' to '+g.id+' moved '+mv.toFixed(0)+' m in '+ftS.toFixed(0)+' s real, map='+s.map]);
 await ev(`try{if(RO.mapOpen)toggleMap(false)}catch(e){}try{__tq.reset()}catch(e){}__BH.capture();0`);await p.waitForTimeout(300);return out}

async function cityRun(b,base,city,simTarget,wallEnd,pageNo){const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await ctx.newPage();const errs=[];p.setDefaultTimeout(180000);
 await p.addInitScript(()=>{window.__dbg=1});p.on('pageerror',e=>errs.push(String(e).slice(0,160)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,160))});
 const tb=Date.now();await p.goto(base+'?test='+city+'&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready&&window.__oc,null,{polling:250,timeout:420000});const boot=(Date.now()-tb)/1000;
 const ev=s=>p.evaluate(c=>__oc.ev(c),s);if(await ev('1')!==1)throw new Error('__oc.ev disabled (needs window.__dbg)');
 await ev(HUNTER);await p.waitForTimeout(400);   // let the pending real rAF land in the captured queue
 const epLen=Math.max(120,+arg('ep',600));let ep=0,sim=0,steps=0,tapRes=[];const seed0=1+pageNo*1000+(city==='ath'?500:0)+(+arg('seed0',0)||0);
 if(!NOTAP&&pageNo===0){try{tapRes=await taps(p)}catch(e){tapRes=[['touch taps ran',false,String(e).slice(0,80)]]}}
 while(sim<simTarget&&Date.now()<wallEnd){await ev(`__BH.episode(${seed0+ep},${DT});0`);ep++;let e=0;
  while(e<epLen&&sim<simTarget&&Date.now()<wallEnd){const n=await ev('__BH.run(1500,'+Math.ceil(Math.min(epLen-e,simTarget-sim)/DT)+')');steps+=n;e+=n*DT;sim+=n*DT;if(!n){await ev('__BH.release();0');await p.waitForTimeout(500);await ev('__BH.capture();0');await p.waitForTimeout(50)}else await p.waitForTimeout(5)}}   // 5 ms gaps: lazy chunks, timers and promises get to run
 const R=JSON.parse(await ev('JSON.stringify(__BH.report())'));R.city=city;R.boot=boot;R.steps=steps;R.episodes=ep;R.pageErrs=errs.slice(0,20);R.nPageErr=errs.length;R.taps=tapRes;R.page=p;R.ctx=ctx;R.msPerStep=0;return R}

async function shots(b,base,cells,dir){fs.mkdirSync(dir,{recursive:true});const ctx=await b.newContext({viewport:{width:393,height:852},deviceScaleFactor:1,isMobile:true,hasTouch:true});const out=[];
 const by={};for(const c of cells)(by[c.city]=by[c.city]||[]).push(c);
 for(const city in by){const p=await ctx.newPage();await p.addInitScript(()=>{window.__dbg=1});await p.goto(base+'?test='+city+'&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready&&window.__oc,null,{polling:250,timeout:240000});
  await p.evaluate(()=>__tq.draw()).catch(()=>{});
  for(const c of by[city]){const f=path.join(dir,`${city}_${c.det}_${Math.round(c.x)}_${Math.round(c.z)}.jpg`);
   await p.evaluate(s=>__oc.ev(s),`try{__tq.reset()}catch(e){}roamWarp(${c.x},${c.z},${c.h});RO.v=0;0`);await p.waitForTimeout(2500);await p.evaluate(()=>__tq.draw()).catch(()=>{});await p.waitForTimeout(300);await p.evaluate(()=>__tq.draw()).catch(()=>{});
   await p.screenshot({path:f,type:'jpeg',quality:70});out.push(path.relative(ROOT,f))}await p.close()}
 await ctx.close();return out}

(async()=>{const[s,port]=await serve(BUILD);const base=`http://127.0.0.1:${port}/index.html`;const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-background-timer-throttling','--disable-renderer-backgrounding']});
 // --shotat 'fra:det:x,z,h;ath:det:x,z,h'  only take 393x852 shots at these spots (repro check of a hotspot), no hunt
 if(arg('shotat','')){const cells=String(arg('shotat')).split(';').filter(Boolean).map(q=>{const[city,det,xz]=q.split(':'),[x,z,h]=xz.split(',').map(Number);return{city,det,x,z,h:h||0}});console.log((await shots(b,base,cells,path.join(ROOT,'docs/shots/bughunt'))).join('\n'));await b.close();s.close();return}
 const cities=CITY==='both'?['fra','ath']:[CITY],wallEnd=T0+Math.max(30,BUDGET-(SHOTS?60*Math.ceil(SHOTS/4):0)-15)*1000;
 const jobs=[];for(const c of cities)for(let i=0;i<PAGES;i++)jobs.push(cityRun(b,base,c,HOURS*3600/PAGES,wallEnd,i).catch(e=>({city:c,fail:String(e).slice(0,200)})));
 const runs=await Promise.all(jobs);const res={};let fails=0;
 for(const r of runs){if(r.fail){console.log('FAIL boot '+r.city+' '+r.fail);fails++;continue}const C=res[r.city]=res[r.city]||{t:0,km:0,cnt:{},gasT:0,slowT:0,hits:{npc:0,world:0,invisible:0},cells:[],msgs:{},taps:[],errs:[],nErr:0,steps:0,episodes:0,boot:[],xcErr:[],acts:{},skh:[],sl:{},mT:{}};
  C.t+=r.t;C.km+=r.km;C.gasT+=r.gasT;C.slowT+=r.slowT;C.steps+=r.steps;C.episodes+=r.episodes;C.boot.push(r.boot);C.cells.push(...r.cells);C.taps.push(...r.taps);C.errs.push(...r.pageErrs);C.nErr+=r.nPageErr;C.xcErr.push(...r.xcErr);C.skh.push(r.skh);
  for(const k in r.cnt)C.cnt[k]=(C.cnt[k]||0)+r.cnt[k];for(const k in r.hits)C.hits[k]+=r.hits[k];for(const[m,n]of r.msgs)C.msgs[m]=(C.msgs[m]||0)+n;for(const k in r.acts)C.acts[k]=(C.acts[k]||0)+r.acts[k];for(const k in r.sl||{})C.sl[k]=(C.sl[k]||0)+r.sl[k];for(const k in r.mT||{})C.mT[k]=(C.mT[k]||0)+r.mT[k]}
 const lines=[];
 for(const city in res){const C=res[city],h=Math.max(C.t,1)/3600;C.cnt.jsErr=(C.cnt.jsErr||0)+C.nErr+C.xcErr.length;C.cnt.deadButton=C.taps.filter(t=>!t[1]).length;C.frustration=C.gasT?100*C.slowT/C.gasT:0;C.perH={};
  for(const d in LIMIT){const n=d==='frustration'?C.frustration:(C.cnt[d]||0),ph=d==='frustration'?n:n/h,abs=['nan','bounds','jsErr','belowGround','yJump','launch','deadButton'].includes(d);C.perH[d]=+ph.toFixed(2);
   const ok=abs?n<=LIMIT[d]:ph<=LIMIT[d];if(!ok)fails++;lines.push(`${ok?'PASS':'FAIL'} ${d} ${city} ${d==='frustration'?n.toFixed(1)+' % of gas time under 10 km/h':n+' hits = '+ph.toFixed(1)+'/h'} (limit ${LIMIT[d]}${d==='frustration'?' %':abs?' total':'/h'})`)}
  lines.push(`INFO ${city} npc sideways by the old c.hh reading ${C.cnt.npcLatHH||0} vs step-velocity ${C.cnt.npcLateral||0}`);lines.push(`INFO ${city} sim ${(C.t/60).toFixed(1)} min (${(C.t/3600).toFixed(2)} of ${HOURS} h target) · ${C.km.toFixed(1)} km · ${C.steps} steps @ dt ${DT} · ${C.episodes} seeds · contacts/km npc ${(C.hits.npc/Math.max(C.km,.1)).toFixed(2)} world ${(C.hits.world/Math.max(C.km,.1)).toFixed(2)} invisible ${(C.hits.invisible/Math.max(C.km,.1)).toFixed(2)} · boot ${C.boot.map(x=>x.toFixed(0)).join('/')} s`);
  {const sk=C.skh.reduce((a,q)=>a+((q&&q.rev)|0)+((q&&q.lift)|0),0),un=C.msgs.UNSTUCK|0,bo=C.cnt.backOnRoad|0;lines.push(`INFO trap ${city} ladder ${(sk/h).toFixed(1)}/h · UNSTUCK ${(un/h).toFixed(1)}/h · BACK ON THE ROAD ${(bo/h).toFixed(1)}/h · sum ${((sk+un+bo)/h).toFixed(1)}/h`)}
  {const by={},wy={};for(const k in C.sl){const[m,w]=k.split('|');by[m]=(by[m]||0)+C.sl[k];wy[w]=(wy[w]||0)+C.sl[k]}lines.push(`INFO slope ${city} slides ${C.cnt.slopeSlide|0} = ${((C.cnt.slopeSlide|0)/h).toFixed(1)}/h · per mode `+Object.keys(by).sort().map(m=>`${m||'-'} ${by[m]} (${(by[m]/Math.max(C.mT[m]||1,1)*3600).toFixed(0)}/mode-h)`).join(', ')+` · by clamp `+Object.entries(wy).map(([w,n])=>w+' '+n).join(', ')+` · wallClimb ${C.cnt.wallClimb|0} · yJump ${C.cnt.yJump|0} · belowGround ${C.cnt.belowGround|0}`)}
  for(const t of C.taps)if(!t[1])lines.push(`  dead button ${city}: ${t[0]} · ${t[2]}`)}
 let shotList=[];
 if(SHOTS){const all=Object.values(res).flatMap(C=>C.cells).filter(c=>!['jsErr','nan'].includes(c.det)).sort((a,b)=>b.n-a.n),pick=[],seen=new Set();for(const c of all){const k=c.city+Math.floor(c.x/60)+','+Math.floor(c.z/60);if(seen.has(k))continue;seen.add(k);pick.push(c);if(pick.length>=SHOTS)break}
  try{shotList=await shots(b,base,pick,path.join(ROOT,'docs/shots/bughunt'))}catch(e){lines.push('WARN shots: '+String(e).slice(0,120))}}
 for(const l of lines)console.log(l);
 console.log(`${fails?'FAIL':'PASS'} bughunt ${CITY} · ${fails} detector(s) over the limit · ${wall().toFixed(0)} s wall`);
 if(JSON_OUT){for(const c in res){res[c].cells.sort((a,b)=>b.n-a.n)}fs.mkdirSync(path.dirname(JSON_OUT),{recursive:true});fs.writeFileSync(JSON_OUT,JSON.stringify({args:{HOURS,CITY,BUDGET,DT,PAGES},res,shots:shotList,limit:LIMIT},null,1))}
 await b.close();s.close();process.exit(fails?1:0)})();
