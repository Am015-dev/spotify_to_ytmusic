// telemetry-r20g (2026-10-20, Alex has no time to test): always-on `session` doc per play session -> shared db collection 'perf' (same path as the beacon; no db = live site = silent).
// Fields: build, device, city, vp, dpr, boot phases {fetch,eval,build,reveal} + bootMs, long frames in the first 3 s after the first playable frame, p50/p95/max frame ms per state (roam/race),
// longest gap + its state, JS errors (message), heap, shader programs, hints (cores/mem/saveData/battery/30-fps cap). Flushed on pagehide / hidden and every 60 s.
// Rate limit: ≤ 1 write / 20 s (a pagehide flush may go after 5 s), ≤ 30 docs per session; the docs of one session share `sid`, the highest `seq` is the latest. ?pbb=0 = off.
const PS={on:!/[?&]pbb=0/.test(location.search),sid:Math.random().toString(36).slice(2,10),seq:0,maxDocs:30,gapMs:20000,hideGapMs:5000,lastW:-1e9,sent:0,dirty:false,tm:0,
  tEval:performance.now(),tLd:0,tPlay:0,last:0,long3:0,gap:0,gapState:'',err:[],errN:0,hint:{},st:{roam:{a:new Float32Array(4096),k:0,n:0},race:{a:new Float32Array(4096),k:0,n:0}}};
try{const n=navigator,h=PS.hint;h.cores=n.hardwareConcurrency||0;h.mem=n.deviceMemory||0;h.saveData=!!(n.connection&&n.connection.saveData);
  if(n.getBattery)n.getBattery().then(b=>{h.batt=Math.round(b.level*100);h.chg=!!b.charging}).catch(()=>{})}catch(e){}
addEventListener('error',e=>{PS.errN++;if(PS.err.length<5)PS.err.push(String(e&&e.message||e).slice(0,160))});
addEventListener('unhandledrejection',e=>{PS.errN++;if(PS.err.length<5)PS.err.push(('rej: '+(e&&e.reason&&e.reason.message||e&&e.reason||'')).slice(0,160))});
// first hide of the loader = the build phase is over; the first playable frame after it ends the reveal
{const _h=ldHide;ldHide=function(...a){if(!PS.tLd)PS.tLd=performance.now();return _h.apply(this,a)}}
const PS_q=(a,k)=>a.length?a[Math.min(a.length-1,Math.floor(a.length*k))]:0,PS_r=x=>Math.round(x*10)/10;
function PS_stat(s){const a=s.a.slice(0,Math.min(s.k,s.a.length)).sort();return s.n?{n:s.n,p50:PS_r(PS_q(a,.5)),p95:PS_r(PS_q(a,.95)),max:PS_r(a[a.length-1])}:null}
function PS_doc(){let nav=null,fetch=0;try{nav=performance.getEntriesByType('navigation')[0];if(nav)fetch=Math.round(nav.responseEnd)}catch(e){}
  const b=(typeof PB_base==='function')?PB_base('session'):{kind:'session',at:new Date().toISOString(),ua:navigator.userAgent.slice(0,200),vp:innerWidth+'x'+innerHeight,dpr:+(devicePixelRatio||1).toFixed(2)};
  const ev=Math.round(PS.tEval),bd=PS.tLd?Math.round(PS.tLd):0,pl=Math.round(PS.tPlay);
  b.sid=PS.sid;b.seq=++PS.seq;b.up=Math.round(performance.now()/1000);
  b.bootMs=pl||null;b.phase=pl?{fetch,eval:Math.max(0,ev-fetch),build:Math.max(0,(bd||ev)-ev),reveal:Math.max(0,pl-(bd||ev))}:null;
  b.long3=PS.tPlay?PS.long3:null;b.roam=PS_stat(PS.st.roam);b.race=PS_stat(PS.st.race);b.gapMs=Math.round(PS.gap);b.gapState=PS.gapState;
  b.lf=PS.lf.slice();b.pRev=PS.pRev;b.pRoam=PS.pRoam;if(typeof PREW!=='undefined'){b.prew={ran:PREW.ran,abortedAtMs:PREW.ab,programs:PREW.n,ms:PREW.ms,of:PREW.prog,p0:PREW.p0,p1:PREW.p1};b.prewArm=PREW.arm}if(typeof DREV!=='undefined'){const D=DREV;b.drev={on:D.on,ran:D.ran,ms:D.ms,gateMs:D.gateMs,prewMs:D.prewMs,xcMs:D.xcMs,settleMs:D.settleMs,frames:D.frames,capped:D.capped,hard:D.hard,xcTimeout:D.xcTimeout,p0:D.p0,p1:D.p1,full:D.full,fin:D.fin,h0:D.h0,h1:D.h1,h2:D.h2}}b.errN=PS.errN;b.err=PS.err.slice();b.prog=b.ri&&b.ri.prog;b.hint=Object.assign({},PS.hint);
  const r=PS.st.roam,c=PS.st.race,m=(r.n+c.n)?[r,c].map(s=>PS_q(s.a.slice(0,Math.min(s.k,s.a.length)).sort(),.5)):[0,0];b.hint.cap30=Math.max(m[0],m[1])>=30&&Math.max(m[0],m[1])<=36;
  return b}
// the send, rate-limited: returns 'sent' | 'wait' | 'cap' | 'nodb'
async function PS_flush(hiding){if(!PS.on||!PS.dirty)return'idle';if(PS.sent>=PS.maxDocs)return'cap';const now=performance.now();
  if(now-PS.lastW<(hiding?PS.hideGapMs:PS.gapMs)){if(!hiding&&!PS.tm)PS.tm=setTimeout(()=>{PS.tm=0;PS_flush(false)},PS.gapMs-(now-PS.lastW)+50);return'wait'}
  PS.lastW=now;PS.dirty=false;PS.sent++;const d=PS_doc();let r='nodb';try{r=await PB_send(d)}catch(e){}if(r!=='sent'){PS.sent--;PS.dirty=true}return r}
// ios-r20m: every frame > 50 ms in the first 5 s after reveal -> doc.lf [[ms since reveal, frame ms, programs before, programs after]] (<= 24), doc.pRev = programs at reveal, doc.pRoam = programs 5 s later, doc.prew = prewarm draw {n reps, prog, p0, p1, ms}
const PS_pc=()=>{try{return renderer.info.programs.length}catch(e){return -1}};PS.lf=[];PS.pRev=-1;PS.pRoam=-1;
{const _fr=frame;frame=function(now){const ms=PS.last?now-PS.last:0;PS.last=now;const pb=PS_pc();_fr(now);const pa=PS_pc();
  try{if(ms>0&&PB_play()){const hid=PB.hid;
    if(!PS.tPlay&&!hid){PS.tPlay=now;PS.dirty=true;PS.nextAt=now+60000;PS.pRev=pb}
    if(PS.tPlay&&!hid){const dt=now-PS.tPlay;if(dt<=5000){if(ms>50&&PS.lf.length<24)PS.lf.push([Math.round(dt),Math.round(ms),pb,pa])}else if(PS.pRoam<0)PS.pRoam=pa}
    if(!hid&&ms<5000){const s=PS.st[state==='race'||state==='countdown'?'race':state==='roam'?'roam':'']; if(s){s.a[s.k++%s.a.length]=ms;s.n++}
      if(ms>PS.gap){PS.gap=ms;PS.gapState=state}
      if(PS.tPlay&&now-PS.tPlay<=3000&&ms>50)PS.long3++}
    if(PS.tPlay&&now>=PS.nextAt){PS.nextAt=now+60000;PS.dirty=true;setTimeout(()=>{try{PS_flush(false)}catch(e){}},0)}
    else if(PS.dirty&&PS.sent===0&&PS.tPlay&&now-PS.tPlay>5000)setTimeout(()=>{try{PS_flush(false)}catch(e){}},0)}}catch(e){}}}
{const hide=()=>{PS.dirty=true;try{PS_flush(true)}catch(e){}};addEventListener('pagehide',hide);document.addEventListener('visibilitychange',()=>{if(document.hidden)hide()})}
window.__ps={PS,doc:PS_doc,flush:PS_flush,stat:PS_stat};
