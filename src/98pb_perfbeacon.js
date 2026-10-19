// phone-2 (2026-10-18, Alex: "unplayable on iPhone 17, it lags"): real-device perf beacon + FPS chip.
// Beacon: 20 s after the player starts driving, then every 60 s (≤ 5 per session), one doc → shared db collection 'perf'
// (same window.claude db path as the 🐞 button, src/assets/qa/code.js). No db (live site) → nothing, silently.
// Per-system ms = self time (children subtracted) of the wrapped frame stages, averaged per recorded frame.
// FPS chip (#pbChip, 12 px, top edge, pointer-events none): Settings → "FPS chip", long-press ⚙ (0.6 s) or ?fps=1.
const PB={t0:0,next:0,n:0,max:5,iv:new Float32Array(8192),k:0,slow:0,worst:0,busy:0,sys:{},fs:{sim:0,cam:0,traffic:0,world:0,streets:0,hud:0,render:0},child:0,db:undefined,sent:[],q:[],qt:0,err:'',perm:'',last:0,gpu:null,chip:null,cf:[],ct:0};
if(SET.fpsChip==null)SET.fpsChip=false;
function PB_wrap(name,fn){return function(){const t0=performance.now(),sv=PB.child;PB.child=0;try{return fn.apply(this,arguments)}finally{const d=performance.now()-t0;PB.fs[name]+=d-PB.child;PB.child=sv+d}}}
roamStep=PB_wrap('sim',roamStep);roamCam=PB_wrap('cam',roamCam);drawTraffic=PB_wrap('traffic',drawTraffic);updWorld=PB_wrap('world',updWorld);hubTrafficStep=PB_wrap('streets',hubTrafficStep);updHud=PB_wrap('hud',updHud);
{const r=composer.render;composer.render=PB_wrap('render',r)}
function PB_reset(){PB.k=0;PB.slow=0;PB.worst=0;PB.busy=0;PB.sys={}}
const PB_live=()=>!paused&&!document.hidden&&!LD.on&&(state==='roam'||state==='race'||state==='countdown');
function PB_gpu(){if(PB.gpu)return PB.gpu;try{const gl=renderer.getContext(),e=gl.getExtension('WEBGL_debug_renderer_info');PB.gpu=String(e?gl.getParameter(e.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)).slice(0,120)}catch(e){PB.gpu='?'}return PB.gpu}
const PB_q=(a,k)=>a.length?a[Math.min(a.length-1,Math.floor(a.length*k))]:0,PB_r=x=>Math.round(x*10)/10;
// the doc for the frames recorded since the last report (pure: tests call it directly)
function PB_doc(S=PB){const a=S.iv.slice(0,S.k).sort(),n=a.length,m50=PB_q(a,.5),m90=PB_q(a,.9),top=Object.entries(S.sys).sort((x,y)=>y[1]-x[1]).slice(0,3).map(([k,v])=>({k,ms:PB_r(v/Math.max(1,n))}));
  let heap=null;try{const M=performance.memory;if(M)heap={usedMB:Math.round(M.usedJSHeapSize/1048576),limitMB:Math.round(M.jsHeapSizeLimit/1048576)}}catch(e){}
  let L=null;try{const l=window.__life&&window.__life.LIFE;if(l&&l.ms!=null)L=PB_r(l.ms)}catch(e){}
  let ifr=false;try{ifr=window.self!==window.top}catch(e){ifr=true}
  return{at:new Date().toISOString(),n:S.n!=null?S.n:PB.n+1,build:(()=>{try{return OD_CHANGELOG[0].v}catch(e){return'?'}})(),city:typeof CID!=='undefined'?CID:'?',mode:state==='race'||state==='countdown'||state==='finished'?'race':'roam',
    ua:navigator.userAgent.slice(0,200),vp:innerWidth+'x'+innerHeight,dpr:+(devicePixelRatio||1).toFixed(2),pr:+renderer.getPixelRatio().toFixed(2),gpu:PB_gpu(),touch:!!lowGfx,iframe:ifr,
    gfx:SET.qm||SET.q,auto:!!GOV.on,tier:LK_LV[Math.min(3,GOV.d)]||SET.q,scale:+(DRES.s||1).toFixed(2),
    frames:n,fps50:m50?Math.round(1000/m50):0,fps90:m90?Math.round(1000/m90):0,ms50:PB_r(m50),ms90:PB_r(m90),over50:S.slow,worstMs:Math.round(S.worst),busyMs:PB_r(S.busy/Math.max(1,n)),top,lifeMs:L,heap,govLog:GOV.log.slice(-6)}}
// r11d (Alex: the Beta `perf` collection stayed empty for 4 builds while 🐞 -> `bugs` worked): same API (claude.use('db') + collection().add), but 🐞 runs inside a tap, which is where the
// platform's lazy consent dialog can show; the beacon's first db call came from a timer 20 s into a drive (no gesture), and PB_db cached the first null/failure for good while PB_send swallowed the error.
// Now: (1) the consent is asked once on the first tap of the page (PB_perm, menu time, never while driving), (2) null/failed lookups are never cached, (3) a failed doc is queued and retried (3 tries, 30 s apart), (4) PB.err keeps the last reason.
async function PB_db(){if(window.__pbDbMock)return window.__pbDbMock;if(PB.db)return PB.db;try{if(window.claude&&claude.use)PB.db=await claude.use('db')||null}catch(e){PB.db=null;PB.err=String(e&&e.message||e).slice(0,120)}return PB.db}
async function PB_send(doc){try{const db=await PB_db();if(!db||!db.collection){PB.err=PB.err||'nodb';return'nodb'}await db.collection('perf').add(doc);PB.sent.push(doc.at);PB.err='';return'sent'}catch(e){PB.err=String(e&&(e.code||e.message)||e).slice(0,120);return'fail'}}
// failed/nodb docs wait in PB.q (max 5, 3 tries each, 30 s apart); the retry is a setTimeout task like the first send
function PB_flush(now){if(!PB.q.length||now<PB.qt)return;PB.qt=now+30000;const d=PB.q[0];setTimeout(async()=>{try{if(await PB_send(d.doc)==='sent')PB.q.shift();else if(++d.tries>=3)PB.q.shift()}catch(e){PB.q.shift()}},0)}
async function PB_post(doc){const r=await PB_send(doc);if(r!=='sent'&&PB.q.length<5)PB.q.push({doc,tries:1});return r}
async function PB_perm(){try{if(!window.claude||!claude.use)return;const p=await claude.use('permissions');if(!p)return;PB.perm=await p.state('db');if(PB.perm==='prompt')PB.perm=(await p.request(['db'])).db}catch(e){}}
{const f=()=>{document.removeEventListener('pointerdown',f,true);PB_perm()};document.addEventListener('pointerdown',f,true)}
function PB_tick(now){if(PB.q.length)PB_flush(now);if(PB.n>=PB.max)return;
  if(!PB.t0){if(PB_live()&&state!=='countdown'&&Math.abs((state==='roam'?RO.v:pl&&pl.v)||0)>2){PB.t0=now;PB.next=now+20000;PB_reset()}return}
  // boot-2: the tick only snapshots the counters (a typed-array copy, <0.1 ms); the sort, the doc and the db write run in a later task, off the frame
  if(now>=PB.next&&PB.k>=30){const S={iv:PB.iv.slice(0,PB.k),k:PB.k,slow:PB.slow,worst:PB.worst,busy:PB.busy,sys:PB.sys,n:++PB.n};PB.next=now+60000;PB_reset();
   setTimeout(()=>{try{PB_post(PB_doc(S))}catch(e){}},0)}}
// the GPU string (a GL query = a pipeline sync) is read once in the loader, not inside the 20 s frame
{const _lp=ldPrewarm;ldPrewarm=async function(...a){try{PB_gpu()}catch(e){}return _lp.apply(this,a)}}
try{PB_gpu()}catch(e){}   // perf-r13b: and once now, before any program is queued: in the loader that sync waited for every queued link (5.2 s Athens PC)
// chip: fps (last ~1 s), p90 ms, tier, render scale, pixel ratio
function PB_chipEl(){if(PB.chip)return PB.chip;const st=document.createElement('style');st.textContent='#pbChip{position:fixed;z-index:9989;left:50%;top:calc(1px + env(safe-area-inset-top,0px));transform:translateX(-50%);pointer-events:none;white-space:nowrap;font:700 12px/15px ui-monospace,monospace;color:#9fe8ff;background:rgba(0,0,0,.6);padding:1px 7px;border-radius:0 0 6px 6px}';document.head.appendChild(st);
  const el=document.createElement('div');el.id='pbChip';el.hidden=true;document.body.appendChild(el);return PB.chip=el}
function PB_chipStep(now,ms){const el=PB_chipEl();if(!SET.fpsChip){if(!el.hidden)el.hidden=true;return}if(ms>0&&ms<1000)PB.cf.push(ms);if(now-PB.ct<500)return;PB.ct=now;
  const a=PB.cf.splice(0).sort((x,y)=>x-y),avg=a.length?a.reduce((s,x)=>s+x,0)/a.length:0;el.hidden=false;
  el.textContent=`${avg?Math.round(1000/avg):0} fps · p90 ${Math.round(PB_q(a,.9))} ms · ${GOV.on?'auto ':''}${LK_LV[Math.min(3,GOV.d)]||SET.q} · ×${(DRES.s||1).toFixed(2)} · pr ${renderer.getPixelRatio().toFixed(2)}`}
function PB_toggleChip(){SET.fpsChip=!SET.fpsChip;saveSet();PB.ct=0;PB_chipStep(performance.now(),0);}
// ios-r17b (Alex: iPhone 17 freezes, `perf` stayed empty because the first doc came 20 s into a drive): (1) a 'boot' doc at the first playable frame, (2) a localStorage heartbeat every 2 s while playing,
// cleared when the page hides; a heartbeat found at the next boot = the tab froze or was killed -> 'killed' doc with that snapshot, sent before the boot doc, (3) a 'freeze' doc per frame gap > 1 s while visible (≤ 3)
// with the frame-system timers of that frame. Default ON, ?pbb=0 = off. Every storage access is try/catch.
PB.on=!/[?&]pbb=0/.test(location.search);PB.booted=0;PB.fz=0;PB.hb=0;PB.hw=0;PB.hid=0;PB.t1=0;PB.HK='od_pb_hb';
const PB_play=()=>!paused&&!document.hidden&&!LD.on&&(state==='roam'||state==='race'||state==='countdown');
function PB_ri(){try{const i=renderer.info,m=i.memory||{};return{geo:m.geometries,tex:m.textures,prog:i.programs?i.programs.length:0,calls:i.render&&i.render.calls,tris:i.render&&i.render.triangles}}catch(e){return null}}
function PB_heap(){try{const M=performance.memory;if(M)return{usedMB:Math.round(M.usedJSHeapSize/1048576),limitMB:Math.round(M.jsHeapSizeLimit/1048576)}}catch(e){}return null}
function PB_base(kind){let ifr=false;try{ifr=window.self!==window.top}catch(e){ifr=true}
  return{kind,at:new Date().toISOString(),build:(()=>{try{return OD_CHANGELOG[0].v}catch(e){return'?'}})(),city:typeof CID!=='undefined'?CID:'?',state,ua:navigator.userAgent.slice(0,200),vp:innerWidth+'x'+innerHeight,dpr:+(devicePixelRatio||1).toFixed(2),gpu:PB_gpu(),iframe:ifr,ri:PB_ri(),heap:PB_heap()}}
function PB_hbGet(){try{const r=localStorage.getItem(PB.HK);return r?JSON.parse(r):null}catch(e){return null}}
function PB_hbSet(o){try{if(o)localStorage.setItem(PB.HK,JSON.stringify(o));else localStorage.removeItem(PB.HK)}catch(e){}}
function PB_boot(now){if(PB.booted)return;PB.booted=1;PB.t1=now;const old=PB_hbGet();
  setTimeout(()=>{try{if(old){PB_hbSet(null);PB_post(Object.assign(PB_base('killed'),{last:old}))}const d=PB_base('boot');d.bootMs=Math.round(now);PB_post(d)}catch(e){}},0)}
function PB_life(now,ms){if(!PB.on)return;
  if(ms>PB.hw)PB.hw=ms;
  if(ms>1000&&!PB.hid&&!document.hidden&&PB.fz<3){PB.fz++;const fs={};for(const k in PB.fs)fs[k]=PB_r(PB.fs[k]);const d=PB_base('freeze');d.gapMs=Math.round(ms);d.fs=fs;d.n=PB.fz;setTimeout(()=>{try{PB_post(d)}catch(e){}},0)}
  PB.hid=0;
  if(!PB_play())return;
  if(!PB.booted)PB_boot(now);
  if(now-PB.hb>=2000){PB.hb=now;PB_hbSet({t:Date.now(),state,city:typeof CID!=='undefined'?CID:'?',sec:Math.round((now-PB.t1)/1000),worstMs:Math.round(PB.hw),ri:PB_ri(),heap:PB_heap(),orient:innerWidth>=innerHeight?'land':'port',vp:innerWidth+'x'+innerHeight});PB.hw=0}}
{const clr=()=>{PB.hid=1;PB_hbSet(null)};addEventListener('pagehide',clr);document.addEventListener('visibilitychange',()=>{if(document.hidden)clr();else{PB.hid=1;PB.hb=0}})}
{const _fr=frame;frame=function(now){const a=performance.now();PB.child=0;const ms=PB.last?now-PB.last:0;PB.last=now;_fr(now);try{PB_life(now,ms)}catch(e){}
  if(ms>0&&ms<1000&&PB_live()&&PB.t0&&PB.k<PB.iv.length){PB.iv[PB.k++]=ms;if(ms>50)PB.slow++;if(ms>PB.worst)PB.worst=ms;PB.busy+=performance.now()-a;for(const k in PB.fs)PB.sys[k]=(PB.sys[k]||0)+PB.fs[k]}
  for(const k in PB.fs)PB.fs[k]=0;
  PB_tick(now);PB_chipStep(now,ms)}}
// long-press (0.6 s) on a ⚙ (#tuG on every device, #roamSetBtn on PC; ❚❚ pauses on touchstart, so not that) toggles the chip, or Settings → FPS chip, or ?fps=1.
// Delegated on document (capture) because #tuG is created later; the click that ends a long-press is swallowed.
if(/[?&]fps=1/.test(location.search))SET.fpsChip=true;
{let tm=0,fired=0;const G='#tuG,#roamSetBtn',hit=e=>e.target&&e.target.closest&&e.target.closest(G);
  document.addEventListener('pointerdown',e=>{if(!hit(e))return;fired=0;clearTimeout(tm);tm=setTimeout(()=>{fired=1;PB_toggleChip()},600)},true);
  for(const ev of['pointerup','pointercancel'])document.addEventListener(ev,()=>clearTimeout(tm),true);
  document.addEventListener('click',e=>{if(fired&&hit(e)){fired=0;e.stopImmediatePropagation();e.preventDefault()}},true)}
window.__pb={PB,life:PB_life,boot:PB_boot,hbGet:PB_hbGet,hbSet:PB_hbSet,doc:PB_doc,send:PB_send,post:PB_post,flush:PB_flush,perm:PB_perm,tick:PB_tick,toggle:PB_toggleChip,reset:PB_reset};
