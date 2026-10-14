// ===== QA KIT (qa-1, 2026-10-14): runtime invariants + error hooks + one-button bug report. Lazy chunk: packed by tools/qa/pack.sh into models/qa.js
// as a string and eval'd in the page's module scope by src/98qa_loader.js (so it sees RO, OF, HUB, groundAt, roamHit…). ?qa=0 turns it off.
// window.__bugs = [{name,x,z,y,city,ride,t,build,n,d}] deduped by name + 5 m cell. window.__qa = {tick,report,repro,hits,step,…}.
(()=>{
if(window.__qa)return;
const Q={pchk:new WeakSet(),bugs:[],warn:{},inp:[],ctl:[],t:0,acc:0,still:0,rev:0,ticks:0,off:{},prev:null,hits:{},err:0};
window.__bugs=Q.bugs;window.__qa=Q;
const r1=v=>Math.round(v*10)/10,r2=v=>Math.round(v*100)/100;
const build=()=>{try{return OD_CHANGELOG[0].v}catch(e){return'?'}};
const ride=()=>{try{return GAR_get().sel||'?'}catch(e){return'?'}};
const city=()=>{try{return CID}catch(e){return'?'}};
const mode=()=>{const m={};try{if(RO.foot&&RO.foot!=='car')m.foot=RO.foot;if(RO.ch)m.ch=RO.ch.id||RO.ch.name||1;if(RO.sp)m.sp=1;if(pl&&(pl.boatK||0)>.5)m.boat=1;if(pl&&pl.air)m.air=1;if(RO.boosting||RO.turbo>0)m.boost=1}catch(e){}return m};
// ---- the bug list
function bug(name,x,z,y,d,key){
  const k=name+'|'+(key||Math.floor(x/5)+','+Math.floor(z/5));let b=Q.hits[k];
  if(b){b.n++;b.t2=r1(Q.t);return b}
  b=Q.hits[k]={name,x:r1(x),z:r1(z),y:r1(y||0),city:city(),ride:ride(),mode:mode(),t:r1(Q.t),wall:Date.now(),build:build(),n:1,d:d||''};Q.bugs.push(b);
  const w=Q.warn[name]||0;if(Date.now()-w>60000){Q.warn[name]=Date.now();try{console.warn('[QA] '+name+' @'+b.x+','+b.z+' ride '+b.ride+' '+b.d)}catch(e){}}
  return b}
Q.bug=bug;
// ---- error hooks (all land in the same list; keyed by message)
const errBug=(name,msg,extra)=>{const m=String(msg).replace(/\s+/g,' ').slice(0,200);bug(name,safe('x'),safe('z'),safe('y'),m+(extra?' | '+String(extra).slice(0,160):''),m.slice(0,80))};
const safe=k=>{try{return RO[k]||0}catch(e){return 0}};
addEventListener('error',e=>errBug('js_error',e.message||'error',(e.filename||'').split('/').pop()+':'+e.lineno));
addEventListener('unhandledrejection',e=>errBug('unhandled_rejection',e.reason&&(e.reason.stack||e.reason.message)||e.reason));
{const ce=console.error;console.error=function(){try{if(!Q.inErr){Q.inErr=1;errBug('console_error',[].map.call(arguments,a=>a&&a.message||String(a)).join(' '))}}catch(e){}finally{Q.inErr=0}return ce.apply(this,arguments)}}
try{renderer.domElement.addEventListener('webglcontextlost',e=>errBug('webgl_context_lost','webgl context lost'),false)}catch(e){}
// ---- input ring buffer (last 30 s): raw events + control samples
const T0=performance.now(),nowS=()=>(performance.now()-T0)/1000;
const rec=(o)=>{o.t=r1(nowS());Q.inp.push(o);const lim=o.t-30;while(Q.inp.length&&Q.inp[0].t<lim)Q.inp.shift()};
addEventListener('keydown',e=>{if(!e.repeat)rec({k:'d',c:e.code})},true);addEventListener('keyup',e=>rec({k:'u',c:e.code}),true);
for(const ty of['touchstart','touchend','touchcancel'])addEventListener(ty,e=>{const t=e.changedTouches&&e.changedTouches[0];rec({k:ty[5]==='s'?'ts':'te',x:t?Math.round(t.clientX):0,y:t?Math.round(t.clientY):0,id:t?t.identifier:0})},{capture:true,passive:true});
// ---- helpers: the figure's world position, wheels, ground
const gy=(x,z,y)=>groundAt(x,z,y);
const foot=()=>RO.foot==='walk'||RO.foot==='sit';
const wheels=ud=>{const host=ud&&ud.m;if(!host)return[];const W=[];host.traverse(w=>{if(!w.isMesh||!w.userData.r)return;let v=true,q=w;while(q&&q!==host){if(!q.visible)v=false;q=q.parent}if(v)W.push(w)});return W};
const _p=new THREE.Vector3(),_s=new THREE.Vector3();
// ---- the invariants. Each pushes bug(...) itself.
function invariants(){
  const px=RO.x,pz=RO.z,py=RO.y,onFoot=foot(),gnd=gy(px,pz,py+1.5);
  // NaN positions (player car, on-foot figure, camera, ride mesh)
  {const bad=[];for(const[k,v]of[['x',RO.x],['y',RO.y],['z',RO.z],['h',RO.h],['v',RO.v],['vy',RO.vy],['camx',camera.position.x],['camy',camera.position.y],['camz',camera.position.z],['mx',pl&&pl.mesh.position.x],['my',pl&&pl.mesh.position.y],['mz',pl&&pl.mesh.position.z],['ofx',onFoot?OF.x:0],['ofy',onFoot?OF.y:0],['ofz',onFoot?OF.z:0]])if(!Number.isFinite(v))bad.push(k);
    if(bad.length){bug('nan_position',Number.isFinite(px)?px:0,Number.isFinite(pz)?pz:0,0,bad.join(','),'nan:'+bad.join());return}}
  const ud=pl&&pl.mesh&&pl.mesh.userData,boat=pl&&(pl.boatK||0)>.5;
  // 1) ride body below road/ground > 0.1 m (lowest body point vs the road/deck under it)
  if(!onFoot&&!boat&&!(pl&&pl.air)&&ud&&ud.m&&RO.foot!=='jack'){
    let worst=0,wx=0,wz=0;try{const pts=CR_bodyPts(ud);ud.m.updateMatrixWorld(true);for(const p of pts){_p.copy(p).applyMatrix4(ud.m.matrixWorld);const g=gy(_p.x,_p.z,_p.y+1.5),d=_p.y-g;if(d<worst){worst=d;wx=_p.x;wz=_p.z}}}catch(e){}
    if(worst<-.1)bug('ride_below_ground',wx||px,wz||pz,py,'body '+r2(worst)+' m under the road');
    // 2) any wheel gap > 0.05 m while parked/settled (still ≥ 1 s, on the ground)
    if(Math.abs(RO.v)<.5)Q.still+=.5;else Q.still=0;
    if(Q.still>=1){let mx=-9,mn=9,mxw=null;for(const w of wheels(ud)){w.getWorldPosition(_p);w.getWorldScale(_s);const g=gy(_p.x,_p.z,_p.y+1),gap=_p.y-w.userData.r*_s.y-g;if(gap>mx){mx=gap;mxw=_p.clone()}if(gap<mn)mn=gap}
      if(mxw&&mx>.05)bug('wheel_gap',mxw.x,mxw.z,mxw.y,'tyre '+r2(mx)+' m above the road');
      if(mn<-.12)bug('wheel_sunk',px,pz,py,'tyre '+r2(mn)+' m inside the road')}
  }else Q.still=0;
  // 3) on-foot feet off the surface > 0.05 m / sunk
  if(onFoot&&!OF.air&&RO.foot==='walk'){const g=gy(OF.x,OF.z,OF.y+1),d=OF.y-g;if(d>.05)bug('foot_float',OF.x,OF.z,OF.y,'feet '+r2(d)+' m above the surface');else if(d<-.1)bug('foot_sunk',OF.x,OF.z,OF.y,'feet '+r2(d)+' m inside the surface')}
  // 4) player or NPC inside a car / prop / building collider
  {const fx=onFoot?OF.x:px,fz=onFoot?OF.z:pz,fy=onFoot?OF.y:py;
    const b=roamHit(fx,fz,-.2,fy);if(b&&!boat)bug(onFoot?'foot_in_building':'ride_in_building',fx,fz,fy,'inside collider '+(b.t||b.n||b.id||'box'));
    if(HUB.cars)for(const c of HUB.cars){if(c.dead>0||c.x==null)continue;const dx=c.x-fx,dz=c.z-fz;if(dx*dx+dz*dz<(onFoot?.3:1.3)*(onFoot?.3:1.3)&&Math.abs((c.y||0)-fy)<2&&!(onFoot&&c.pk&&0)){if(RO.foot==='jack'||RO.foot==='enter'||RO.foot==='exit'||(OF.jk&&OF.jk.c===c))continue;bug(onFoot?'foot_in_car':'ride_in_car',fx,fz,fy,'inside traffic car '+(c.k||c.j))}}
    let np=0;if(HUB.peds)for(const p of HUB.peds){if(p.x==null||p.dead)continue;const dx=p.x-fx,dz=p.z-fz;if(dx*dx+dz*dz>1600)continue;np++;const hb=roamHit(p.x,p.z,-.2,p.y||0);if(hb)bug('npc_in_building',p.x,p.z,p.y||0,'ped inside collider')}}
  // 5) prop / fill / tree instance inside a road polygon (props near the player)
  if(HUB.props){for(const p of HUB.props){if(p.alive===false||p.x==null)continue;const dx=p.x-px,dz=p.z-pz;if(dx*dx+dz*dz>3600||Q.pchk.has(p)||ROAD_OK.has(p.t))continue;Q.pchk.add(p);if(CE_onRoad(p.x,p.z))bug('prop_on_road',p.x,p.z,p.y||0,'prop '+p.t+' inside a road polygon','p:'+p.t+':'+Math.round(p.x)+','+Math.round(p.z))}}
  // 6) camera ray to the player blocked (or camera under the ground)
  if(!onFoot&&state==='roam'&&!(RO.pOpen||RO.frozen)){const c=camera.position,hx=px,hy=py+1.2,hz=pz,dx=c.x-hx,dy=c.y-hy,dz=c.z-hz,L=Math.hypot(dx,dy,dz);
    if(L>2.5&&L<40){let hit=0;for(let s=1.5;s<L-.5;s+=1){const k=s/L,x=hx+dx*k,y=hy+dy*k,z=hz+dz*k;if(roamHit(x,z,.15,y))hit++}
      if(hit>=2)bug('camera_blocked',px,pz,py,'building between camera and car ('+hit+' samples, cam '+r1(L)+' m away)')}
    if(c.y<gy(c.x,c.z,c.y+2)-.2)bug('camera_underground',c.x,c.z,c.y,'camera '+r2(gy(c.x,c.z,c.y+2)-c.y)+' m under the ground')}
  // 8) heading vs velocity reversed for > 1 s (position delta against the nose, while the sim says forward)
  {const P=Q.prev;Q.prev={x:px,z:pz};if(P&&!onFoot&&!(pl&&pl.air)){const vx=(px-P.x)/.5,vz=(pz-P.z)/.5,sp=Math.hypot(vx,vz);
    if(sp>6&&sp<90&&RO.v>0&&(vx*Math.sin(RO.h)+vz*Math.cos(RO.h))<-.6*sp)Q.rev+=.5;else Q.rev=0;
    if(Q.rev>=1)bug('heading_reversed',px,pz,py,'moving '+r1(sp)+' m/s against the nose for '+Q.rev+' s')}}
  // 9) HUD element overlapping the figure / the touch controls
  hudCheck(px,pz,py,onFoot);
}
const ROAD_OK=new Set(['gold','bricks','barrier','clight','cone','stud','ramp','ring','check','cp','coin','brick']);
const HUD_SEL=['#roamPlate','#ogArea','#roamPrompt','#msg','#sub','#roamHint','#roamArrow','#itemBox','#radio','#roamMini','#roamTop'],CTL_SEL=['#tG','#tB','#tF','#tN','#tD','#tP','#tL','#tR','#steerZone'];
const vis=e=>{if(!e||e.hidden||!e.offsetWidth)return null;const cs=getComputedStyle(e);if(cs.visibility==='hidden'||+cs.opacity<.2||cs.display==='none')return null;const r=e.getBoundingClientRect();return r.width>4&&r.height>4?r:null};
const inter=(a,b)=>Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
function hudCheck(px,pz,py,onFoot){
  if(!$('#roam')||$('#roam').hidden||RO.pOpen||RO.mapOpen)return;
  const H=[];for(const s of HUD_SEL){const r=vis(document.querySelector(s));if(r)H.push([s,r])}
  // figure box: the player's screen point ± a car-sized box (phone landscape ~90×50 px at chase distance)
  camera.updateMatrixWorld();const v=new THREE.Vector3(onFoot?OF.x:px,(onFoot?OF.y:py)+.8,onFoot?OF.z:pz).project(camera),W=innerWidth,Hh=innerHeight,sx=(v.x+1)/2*W,sy=(1-v.y)/2*Hh;
  const fig=v.z<1?{left:sx-45,right:sx+45,top:sy-28,bottom:sy+28}:null;
  for(const[s,r]of H){if(fig&&s!=='#roamMini'&&inter(r,fig)>.25*Math.min(r.width*r.height,90*56))bug('hud_over_figure:'+s,px,pz,py,s+' covers the '+(onFoot?'walker':'car')+' on screen','h:'+s);
    if(TOUCH&&TOUCH.on)for(const cs of CTL_SEL){const c=vis(document.querySelector(cs));if(c&&cs!==s&&inter(r,c)>.3*Math.min(r.width*r.height,c.width*c.height))bug('hud_over_controls:'+s+'/'+cs,px,pz,py,s+' overlaps '+cs,'hc:'+s+cs)}}
}
// ---- the tick: sim-time accumulator (fast-mode and bot steps count too), 0.5 s
Q.tick=function(dt){Q.t+=dt;Q.acc+=dt;if(Q.acc<.5)return;Q.acc=0;
  if(state!=='roam'||!RO.on||!RO.built||!pl||LD.busy||Q.off.all)return;
  Q.ticks++;try{const c=CTL||{};Q.ctl.push({t:r1(nowS()),st:r2(c.steer||0),g:+!!(c.thr>0||c.gas),b:+!!c.brk,n:+!!(RO.boosting||RO.turbo>0),v:r1(RO.v||0),x:r1(RO.x),z:r1(RO.z),h:r2(RO.h),f:RO.foot});while(Q.ctl.length>60)Q.ctl.shift()}catch(e){}
  try{invariants()}catch(e){if(!Q.err++)console.warn('[QA] invariant error',e)}};
roamStep=(f=>function(dt){const r=f.apply(this,arguments);if(dt)try{Q.tick(dt)}catch(e){}return r})(roamStep);
// ---- bug report: screenshot + state → repro URL
const b64=s=>btoa(unescape(encodeURIComponent(s))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
Q.state=function(){const o={v:1,b:build(),c:city(),ride:ride(),x:r2(RO.x),z:r2(RO.z),y:r2(RO.y),h:r2(RO.h),sp:r1(RO.v||0),foot:RO.foot||'car',m:mode()};
  if(foot()){o.ox=r2(OF.x);o.oz=r2(OF.z);o.oy=r2(OF.y);o.oh=r2(OF.h)}
  try{o.fl=Object.keys(flags()).filter(k=>flags()[k]===true).slice(0,40)}catch(e){}
  try{if(typeof SC_S!=='undefined')o.sc=1}catch(e){}return o};
Q.reproUrl=function(){return location.origin+location.pathname+'?repro='+b64(JSON.stringify(Q.state()))};
Q.bundle=function(){const o=Q.state();o.bugs=Q.bugs.slice(-30);o.inputs=Q.inp.slice();o.ctl=Q.ctl.slice(-60);o.ua=navigator.userAgent;o.vp=[innerWidth,innerHeight,devicePixelRatio];return o};
Q.shot=()=>new Promise(res=>{try{try{composer.render()}catch(e){}renderer.domElement.toBlob(b=>res(b),'image/png')}catch(e){res(null)}});
const toast=(m)=>{let t=document.getElementById('qaToast');if(!t){t=document.createElement('div');t.id='qaToast';t.style.cssText='position:fixed;left:50%;top:18%;transform:translateX(-50%);z-index:99999;background:rgba(10,10,12,.92);color:#fff;font:600 13px system-ui,sans-serif;padding:8px 14px;border-radius:10px;max-width:80vw;text-align:center;pointer-events:none';document.body.appendChild(t)}t.textContent=m;t.style.display='block';clearTimeout(t._h);t._h=setTimeout(()=>t.style.display='none',4500)};
async function report(){
  const url=Q.reproUrl(),bundle=Q.bundle(),blob=await Q.shot();Q.last={url,bundle,blob};
  const name='od-bug-'+build()+'-'+Date.now()+'.png',file=blob?new File([blob],name,{type:'image/png'}):null;
  const txt='🐞 '+build()+' '+city()+' ride '+ride()+' @'+Math.round(RO.x)+','+Math.round(RO.z)+(Q.bugs.length?' · '+Q.bugs.slice(-3).map(b=>b.name).join(','):'')+'\n'+url;
  try{if(file&&navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],text:txt});return'shared'}}catch(e){if(e&&e.name==='AbortError')return'cancelled';Q.pending={file,txt};return'tap-again'}
  let how='';try{await navigator.clipboard.writeText(txt);how='copied'}catch(e){how='clip-failed'}
  if(blob){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},4000);how+='+png'}
  return how}
Q.report=report;
function addBtn(){const pg=document.querySelector('#roamPause .pg');if(!pg||pg.querySelector('[data-p="bug"]'))return!!pg;
  const b=document.createElement('button');b.dataset.p='bug';b.id='qaBugBtn';b.textContent='🐞 BUG';b.style.cssText='font-size:13px';
  b.addEventListener('click',async e=>{e.stopPropagation();e.preventDefault();try{if(Q.pending){const p=Q.pending;Q.pending=null;try{await navigator.share({files:[p.file],text:p.txt});toast('🐞 shared');b.textContent='🐞 BUG';return}catch(er){}}
      b.textContent='🐞 …';const r=await report();if(r==='tap-again'){b.textContent='📤 TAP TO SHARE';toast('🐞 ready · tap again to share');return}toast(r==='shared'?'🐞 report shared':r==='cancelled'?'🐞 cancelled':'🐞 repro link '+(r.indexOf('copied')===0?'copied':'not copied')+(r.indexOf('png')>0?' · screenshot saved':''))}catch(er){toast('🐞 failed: '+er)}finally{if(!Q.pending)b.textContent='🐞 BUG'}},true);
  pg.appendChild(b);return true}
if(!addBtn()){const iv=setInterval(()=>{if(addBtn())clearInterval(iv)},500);setTimeout(()=>clearInterval(iv),30000)}
// the pause menu's own click handler would read data-p="bug" as a command: ours runs first (capture) and stops it
// ---- repro: ?repro=<b64 json> spawns exactly that state (10_core3.js TQ takes city/ride/spot from it; this puts the car / figure on the exact spot)
Q.apply=function(R){R=R||window.__repro;if(!R)return false;
  const wait=()=>{if(!(window.__tq&&__tq.ready&&state==='roam'&&RO.on&&!LD.busy))return setTimeout(wait,200);
    try{for(const k of(R.fl||[]))try{const F=flags();F[k]=true;store.set('mho_flags',F)}catch(e){}
      roamWarp(R.x,R.z,R.h);RO.x=R.x;RO.z=R.z;RO.y=R.y!=null?Math.max(R.y,gy(R.x,R.z,99)):RO.y;RO.h=RO.vh=R.h;RO.v=0;
      if((R.foot==='walk'||R.foot==='sit')&&RO.foot==='car'){OF_exit();let n=0;const w=()=>{if(RO.foot==='walk'||++n>50){if(RO.foot==='walk'){OF.x=R.ox;OF.z=R.oz;OF.y=gy(R.ox,R.oz,(R.oy||R.y||0)+1);OF.h=R.oh||R.h}Q.at=RO.foot==='walk'?[OF.x,OF.z]:[RO.x,RO.z];Q.applied=true}else{for(let i=0;i<20&&RO.foot==='exit';i++)roamStep(1/60);setTimeout(w,50)}};w()}
      else{Q.at=[RO.x,RO.z];Q.applied=true}camSnap=true}catch(e){Q.applied='ERR '+e}};
  wait();return true};
if(window.__repro)Q.apply();
// ---- deterministic stepping for the monkey bot: n frames with a fixed 1/60 s clock, rAF chain stopped (the page does not run by itself)
Q.manual=false;Q.clock=0;
Q.step=function(n,dt){dt=dt||1/60;if(!Q.manual){Q.manual=true;const r0=window.requestAnimationFrame;Q._raf=r0;window.requestAnimationFrame=()=>0;Q.clock=performance.now()+1000;frame(Q.clock)}
  for(let i=0;i<n;i++){Q.clock+=dt*1000;frame(Q.clock)}return{t:r1(Q.t),n:Q.bugs.length}};
// synchronous check of the current state (tests corrupt a value, call this, expect the bug)
Q.check=function(opt){opt=opt||{};Q.acc=0;if(opt.settled)Q.still=1;if(opt.noPrev)Q.prev=null;invariants();return Q.bugs.length};
Q.inv=invariants;
// module-scope eval for the test tools (built pages have no other hook into RO / OF / HUB…); inert unless a test calls it
Q.ev=js=>eval(js);
Q.live=function(){if(Q.manual){window.requestAnimationFrame=Q._raf;Q.manual=false;requestAnimationFrame(frame)}};
console.log('[QA] kit on · build',build(),'· window.__bugs / __qa');
})();
