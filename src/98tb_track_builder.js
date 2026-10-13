
// ===== TB (track-1, 2026-10-13): TRACK BUILDER. Alex: "make the tracks with a track builder so they are not so boring; I make the
// tracks from the game and we push them". A top-down editor (phone 852×393 + PC): drop/drag control points on the city map, paint the
// surface per segment, place pieces (jump, boost, item row, checkpoint gate, water / off-road shortcut, start), live lint from
// docs/TRACK_FUN.md (L1–L15) with an estimated lap time, TEST DRIVE with the race engine and AI rivals, SAVE to the artifact db
// (collection "tracks": name, city, json, author, time) or localStorage + a copyable track code. Builder tracks run as OPEN courses
// (98ro_open.js: 96 m ribbon, asphalt in the middle, terrain beside it, routes behind an island, pit jumps).
// Track JSON v1: {v,id,name,city,laps,road,pts:[[x,z,h,ter]…] (world m; ter = surface of the segment pt→next), pc:[{k,x,z,n?}…], st:[x,z]}
const TB_TERS=['grass','dirt','sand','cobble'],TB_TCOL={grass:'#58b43a',dirt:'#9b6a3c',sand:'#e2c98a',cobble:'#9a948a'};
const TB_V={top:62,lat:13,acc:7,brk:16,cal:1};// lap estimate (docs/TRACK_FUN.md); cal = measured / estimated (test drive)
const TB_PCS={jump:{ic:'⤴',c:'#ff7a1c',l:'JUMP'},boost:{ic:'⚡',c:'#ffd12c',l:'BOOST'},item:{ic:'?',c:'#4ceaff',l:'ITEMS'},gate:{ic:'⛩',c:'#ff2d95',l:'GATE'},
  scw:{ic:'≈',c:'#29b6ff',l:'WATER SC'},scd:{ic:'⛰',c:'#ff9a1f',l:'DIRT SC'}};
const TB={on:false,trk:null,undo:[],tool:'pt',sel:-1,view:{s:.25,x:0,z:0},snap:false,lint:null,el:null,cv:null,defs:{},list:{},db:null,uid:null,dbErr:'',ptr:new Map(),drag:null,toast:0};
const TB_clone=o=>JSON.parse(JSON.stringify(o));
function TB_new(city){return{v:1,id:'tb_'+Date.now().toString(36)+Math.floor(Math.random()*1296).toString(36),name:'My Track',city:city||'fra',laps:3,road:14,pts:[],pc:[],st:null}}

/* ---------------- geometry: the same closed centripetal Catmull-Rom the race uses (buildTrackData) */
function TB_geo(t){const n=t.pts.length;if(n<3)return null;const pts=t.pts.map(p=>V3(p[0],p[2]||0,p[1])),cu=new THREE.CatmullRomCurve3(pts,true,'centripetal',.5);
  const L0=cu.getLength();if(!(L0>60))return null;const N=Math.max(30,Math.round(L0/2)),ds=L0/N,sp=cu.getSpacedPoints(N);sp.length=N;
  const X=new Float32Array(N),Z=new Float32Array(N),Y=new Float32Array(N);for(let i=0;i<N;i++){X[i]=sp[i].x;Y[i]=sp[i].y;Z[i]=sp[i].z}
  const tx=[],tz=[];for(let i=0;i<N;i++){const a=sp[(i-1+N)%N],b=sp[(i+1)%N],l=Math.hypot(b.x-a.x,b.z-a.z)||1;tx.push((b.x-a.x)/l);tz.push((b.z-a.z)/l)}
  let k=new Float32Array(N);const w=4;for(let i=0;i<N;i++){const a=(i-w+N)%N,b=(i+w)%N;k[i]=Math.atan2(tx[a]*tz[b]-tz[a]*tx[b],tx[a]*tx[b]+tz[a]*tz[b])/(2*w*ds)}
  const sm=(a,r)=>{const o=new Float32Array(N);for(let i=0;i<N;i++){let s=0;for(let j=-r;j<=r;j++)s+=a[(i+j+N)%N];o[i]=s/(2*r+1)}return o};k=sm(sm(k,8),8);
  // sample → segment (pt i → i+1): nearest sample of each control point, in order
  const cpI=t.pts.map(p=>{let bi=0,bd=1e18;for(let i=0;i<N;i++){const d=(X[i]-p[0])**2+(Z[i]-p[1])**2;if(d<bd){bd=d;bi=i}}return bi});
  const SEG=new Int16Array(N).fill(-1);for(let q=0;q<n;q++){const a=cpI[q],b=cpI[(q+1)%n];let i=a,g=0;while(i!==b&&g++<N){SEG[i]=q;i=(i+1)%N}}for(let i=0;i<N;i++)if(SEG[i]<0)SEG[i]=SEG[(i-1+N)%N]<0?0:SEG[(i-1+N)%N];
  return{N,ds,L:N*ds,X,Y,Z,TX:tx,TZ:tz,K:k,SEG,cpI}}
const TB_near=(g,x,z)=>{let bi=0,bd=1e18;for(let i=0;i<g.N;i++){const d=(g.X[i]-x)**2+(g.Z[i]-z)**2;if(d<bd){bd=d;bi=i}}return{i:bi,d:Math.sqrt(bd)}};

/* ---------------- lint (docs/TRACK_FUN.md L1–L15) + lap estimate */
function TB_lint(t){const g=TB_geo(t),R=[],marks=[];const rule=(id,name,ok,val,need)=>R.push({id,name,ok:!!ok,val,need});
  if(!g){return{g:null,rules:[{id:'L0',name:'Draw a loop',ok:false,val:t.pts.length+' pts',need:'≥ 3 points'}],lap:0,race:0,marks}}
  const{N,ds,L,K,SEG,Y}=g,ter=i=>(t.pts[SEG[i]]&&t.pts[SEG[i]][3])||'grass',Rr=i=>1/Math.max(1e-5,Math.abs(K[i]));
  // speed profile: cap → forward (accel) → backward (brake), on a 2-lap ring so the start is not a standing start
  const cap=new Float32Array(N);for(let i=0;i<N;i++){const tm=ter(i)==='cobble'?1:.93;cap[i]=Math.min(TB_V.top*tm,Math.sqrt(TB_V.lat*Rr(i)))}
  const v=new Float32Array(N);let c=cap[0];for(let r=0;r<2;r++)for(let i=0;i<N;i++){c=Math.min(cap[i],Math.sqrt(c*c+2*TB_V.acc*ds));v[i]=c}
  c=v[0];for(let r=0;r<2;r++)for(let i=N-1;i>=0;i--){c=Math.min(v[i],Math.sqrt(c*c+2*TB_V.brk*ds));v[i]=c}
  const T=new Float32Array(N+1);for(let i=0;i<N;i++)T[i+1]=T[i]+ds/Math.max(5,v[i]);const lap=T[N]*TB_V.cal,race=lap*t.laps+6;g.T=T;g.v=v;
  rule('L1','Lap time',lap>=35&&lap<=75,lap.toFixed(0)+' s','35–75 s');
  rule('L2','Race time',race>=120&&race<=180,Math.floor(race/60)+':'+String(Math.round(race%60)).padStart(2,'0'),'2:00–3:00');
  rule('L3','Width',t.road>=10,'96 m · road '+t.road+' m','≥ 30 m');
  // L4 longest straight (radius > 400 m) in seconds
  {let best=0,bi=0,run=0,r0=0,st=-1;for(let q=0;q<2*N;q++){const i=q%N;if(Rr(i)>400){if(run===0)r0=q;run+=ds/Math.max(5,v[i]);if(run>best&&q-r0<N){best=run;bi=r0}}else run=0}
    best*=TB_V.cal;rule('L4','No long straight',best<=12,best.toFixed(1)+' s','≤ 12 s');if(best>12){const i=(bi+Math.round(best/2*TB_V.top/ds))%N;marks.push({x:g.X[i],z:g.Z[i],r:60,c:'#ff9a1f',t:'STRAIGHT'})}}
  // corners: runs with R < 450; class by the tightest point
  const cor=[];{let i0=-1;for(let s=0;s<N;s++)if(Rr(s)>=450){i0=s;break}if(i0<0)i0=0;let inC=false,mn=1e9,mi=0,sg=0;
    for(let q=1;q<=N;q++){const i=(i0+q)%N,r=Rr(i);if(r<450){if(!inC||Math.sign(K[i])!==sg){if(inC)cor.push({r:mn,i:mi,sg});inC=true;mn=1e9;sg=Math.sign(K[i])}if(r<mn){mn=r;mi=i}}else if(inC){cor.push({r:mn,i:mi,sg});inC=false}}if(inC)cor.push({r:mn,i:mi,sg})}
  const nF=cor.filter(c=>c.r>=180).length,nM=cor.filter(c=>c.r>=90&&c.r<180).length,nT=cor.filter(c=>c.r<90).length;
  rule('L5','Corner mix',nF>=2&&nM>=2&&nT>=1,`${nF} fast · ${nM} med · ${nT} tight`,'2 · 2 · 1');
  {const nr=cor.filter(c=>c.sg>0).length,nl=cor.length-nr,f=cor.length?Math.min(nl,nr)/cor.length:0;rule('L6','Left and right',cor.length>=2&&f>=.3,`${nl} L · ${nr} R`,'each ≥ 30 %')}
  {const mn=cor.reduce((a,c)=>Math.min(a,c.r),1e9);rule('L7','Drivable corners',mn>=55,(mn>1e8?'–':Math.round(mn)+' m'),'R ≥ 55 m');for(const c of cor)if(c.r<55)marks.push({x:g.X[c.i],z:g.Z[c.i],r:40,c:'#ff3b3b',t:'R '+Math.round(c.r)})}
  // L8 overlap: ≥ 110 m from any part more than 300 m away along the track
  {let bad=0,bx=0,bz=0,st=Math.max(1,Math.round(10/ds));for(let i=0;i<N&&bad<1;i+=st)for(let j=i+st;j<N;j+=st){const da=Math.min(j-i,N-(j-i))*ds;if(da<300)continue;if((g.X[i]-g.X[j])**2+(g.Z[i]-g.Z[j])**2<110*110){bad++;bx=(g.X[i]+g.X[j])/2;bz=(g.Z[i]+g.Z[j])/2;break}}
    rule('L8','No overlap',!bad,bad?'crosses':'clear','gap ≥ 110 m');if(bad)marks.push({x:bx,z:bz,r:70,c:'#ff3b3b',t:'OVERLAP'})}
  const pos=k=>t.pc.filter(p=>p.k===k).map(p=>({...p,i:TB_near(g,p.x,p.z).i})).sort((a,b)=>a.i-b.i),gap=(a,b)=>{const d=Math.abs(a-b)*ds;return Math.min(d,L-d)};
  {const J=pos('jump');let ok=J.length>=1&&J.length<=3;for(const j of J){let st=true;for(let d=-30;d<=30;d++)if(Rr((j.i+d+N)%N)<250)st=false;if(!st){ok=false;marks.push({x:g.X[j.i],z:g.Z[j.i],r:40,c:'#ff3b3b',t:'JUMP IN BEND'})}}
    for(let a=0;a<J.length;a++)for(let b=a+1;b<J.length;b++)if(gap(J[a].i,J[b].i)<300)ok=false;rule('L9','Jumps',ok,J.length+' per lap','1–3, straight')}
  {const S=t.pc.filter(p=>p.k==='scw'||p.k==='scd');let good=0;for(const p of S){const q=TB_segOf(t,g,p),a=g.cpI[q],b=g.cpI[(q+1)%t.pts.length],n=(b-a+N)%N,len=n*ds;let km=0;for(let d=0;d<n;d++)km+=K[(a+d)%N];km/=Math.max(1,n);
      const ok=len>=200&&len<=800&&Math.abs(km)>1/700;if(ok)good++;else marks.push({x:p.x,z:p.z,r:50,c:'#ff3b3b',t:len<200?'SC TOO SHORT':len>800?'SC TOO LONG':'SC NOT ON A BEND'})}
    rule('L10','Shortcut with a trade-off',good>=1,good+' ok of '+S.length,'≥ 1 on a bend')}
  {const n=pos('boost').length;rule('L11','Boost pads',n>=2&&n<=6,n+'','2–6')}
  {const I=pos('item');let ok=I.length>=2&&I.length<=5;for(let a=0;a<I.length;a++){const b=(a+1)%I.length;if(I.length>1&&gap(I[a].i,I[b].i)<400)ok=false}rule('L12','Item rows',ok,I.length+' rows','2–5, ≥ 400 m apart')}
  {let up=0,mg=0;const st=Math.max(1,Math.round(20/ds));for(let i=0;i<N;i+=st){const j=(i+st)%N,dy=Y[j]-Y[i];if(dy>0)up+=dy;mg=Math.max(mg,Math.abs(dy)/(st*ds))}rule('L13','Elevation',up>=15&&mg<=.1,Math.round(up)+' m · '+Math.round(mg*100)+' %','≥ 15 m · ≤ 10 %')}
  {const G=pos('gate');let mx=0;for(let a=0;a<G.length;a++){const b=(a+1)%G.length,i0=G[a].i,i1=G[b].i;let dt=i1>i0?T[i1]-T[i0]:T[N]-T[i0]+T[i1];if(G.length===1)dt=T[N];mx=Math.max(mx,dt*TB_V.cal)}
    rule('L14','Checkpoints',G.length>=3&&mx<=25,G.length+' gates · '+(G.length?Math.round(mx)+' s':'–'),'≥ 3 · ≤ 25 s')}
  {const k=new Set(t.pts.map(p=>p[3]||'grass'));if(t.pc.some(p=>p.k==='scw'))k.add('water');if(t.pc.some(p=>p.k==='scd'))k.add('dirt');rule('L15','Surface mix',k.size>=2,[...k].join(' '),'≥ 2 kinds')}
  return{g,rules:R,lap,race,marks,cor}}
// segment a piece sits on (nearest sample → SEG)
function TB_segOf(t,g,p){return g.SEG[TB_near(g,p.x,p.z).i]}

/* ---------------- builder JSON → race def (open course) */
function TB_def(t){const key=JSON.stringify(t);if(TB.defs[t.id]&&TB.defs[t.id].key===key)return TB.defs[t.id].def;
  const g=TB_geo(t);if(!g)return null;const n=t.pts.length,ath=t.city==='ath';
  let st=0;if(t.st){let bd=1e18;t.pts.forEach((p,i)=>{const d=(p[0]-t.st[0])**2+(p[1]-t.st[1])**2;if(d<bd){bd=d;st=i}})}
  const rot=i=>(i-st+n)%n,G=t.pc.filter(p=>p.k==='gate').map(p=>({...p,q:TB_segOf(t,g,p)}));
  // sector names: the latest gate at or before the segment (checkpoint names show in the HUD), else the course name
  const secOf=q=>{let best=null,bd=1e9;for(const p of G){const d=(q-p.q+n)%n;if(d<bd){bd=d;best=p}}return(best&&best.n)||(t.name||'COURSE').toUpperCase()};
  const cp=[],ter={},tseg=[];for(let k=0;k<n;k++){const i=(st+k)%n,p=t.pts[i],nm=secOf(i);cp.push([p[0]/S,p[2]||0,p[1]/S,nm]);tseg.push(p[3]||'grass')}
  const jumps=t.pc.filter(p=>p.k==='jump').map((p,k)=>({id:'tbj'+k,name:'JUMP',kind:'pit',at:[p.x/S,p.z/S],half:22,floor:-8,style:ath?'rock':'creek',msg:'BIG AIR'}));
  const routes=t.pc.filter(p=>p.k==='scw'||p.k==='scd').map(p=>{const q=rot(TB_segOf(t,g,p));return{a:q,b:(q+1)%n,kind:p.k==='scw'?'water':'dirt',kf:p.k==='scw'?1.45:undefined}}).filter((r,i,a)=>a.findIndex(o=>o.a===r.a)===i);
  // laps: 99_api.js scales every race's laps by CR_RK (round(laps·CR_RK)); pre-divided so the author's 1–3 laps survive
  const def={id:t.id,tb:t,name:t.name||'My Track',short:(t.name||'My Track').slice(0,18),open:1,w:96,w15:96,laps:t.laps/CR_RK,bank:.25,road:clamp(t.road/2,5,8.5),mood:ath?'athnoon':'brick',tunnel:'',clear:[],city:ath?'ath':undefined,
    desc:'Built in the track builder.',cp,jumps,ro:{ter,tseg,routes,cliffs:[],sky:ath?0:1,acro:ath?1:0,col:ath?[0xa7a94a,0xa8763e,0xecd9a0,0xd8cdb8]:[0x58b43a,0x9b6a3c,0xe2c98a,0x9a948a]}};
  if(!ath)delete def.city;TB.defs[t.id]={key,def};return def}
function TB_reg(def){const i=TRACK_DEFS.findIndex(d=>d.id===def.id);if(i>=0)TRACK_DEFS[i]=def;else TRACK_DEFS.push(def);return def}
// race hooks: asphalt width, per-segment surface, authored pads, checkpoint gates
{const _lt=loadTrack;loadTrack=function(id){const d=TRACK_DEFS.find(t=>t.id===id);OPN_ROAD=d&&d.road?d.road:7.2;const r=_lt(id);if(r&&d&&d.tb)try{TB_gates()}catch(e){console.warn('TB gates',e)}return r}}
{const _p=OPN_prep;OPN_prep=function(){_p();const o=TRK&&TRK.ro;if(!TRK.tb||!o||!o.tseg||!OPN)return;const n=OPN.cpS.length;
  for(let q=0;q<n;q++){let s0=OPN.cpS[q],s1=OPN.cpS[(q+1)%n];if(s1<=s0)s1+=OPN.L;const tv=OPN_TER[o.tseg[q]]||0;for(let s=s0;s<s1;s+=OPN.ds/2)OPN.TER[OPN_i(s)]=tv}}}
{const _pd=R15_pads;R15_pads=function(){if(!(TRK&&TRK.tb&&OPN_on()))return _pd();pads.length=0;const t=TRK.tb,L=TD.L;
  for(const j of TD.jumps)pads.push({s:j.s0-140,x:0,type:'boost'});OPN_pads();
  const sAt=(x,z)=>{let bi=0,bd=1e18;for(let i=0;i<TD.N;i++){const d=(TD.P[i*3]-x)**2+(TD.P[i*3+2]-z)**2;if(d<bd){bd=d;bi=i}}return bi*TD.ds};
  for(const p of t.pc){if(p.k==='boost')pads.push({s:sAt(p.x,p.z),x:0,type:'boost'});else if(p.k==='item'&&RC&&RC.items){const s=sAt(p.x,p.z);for(const x of[-21,-7,7,21])pads.push({s,x,type:'item'})}}}}
function TB_gates(){const t=TRK.tb,f=mkF(),pm=new THREE.MeshStandardMaterial({color:0x22232a,roughness:.5});
  for(const p of t.pc){if(p.k!=='gate')continue;let bi=0,bd=1e18;for(let i=0;i<TF.N;i++){const d=(TF.P[i*3]-p.x)**2+(TF.P[i*3+2]-p.z)**2;if(d<bd){bd=d;bi=i}}frameAt(TF,bi*TF.ds,f);
    const g=new THREE.Group(),w=34;for(const sx of[-1,1]){const po=new THREE.Mesh(new THREE.BoxGeometry(1.6,11,1.6),pm);po.position.set(sx*w/2,5.5,0);g.add(po)}
    const b=new THREE.Mesh(new THREE.BoxGeometry(w+2,3.6,.6),new THREE.MeshBasicMaterial({map:textTex(p.n||'CHECKPOINT','#ffd12c',1024,110)}));b.position.y=11.6;g.add(b);
    g.position.copy(f.p);g.lookAt(f.p.clone().add(f.t));WORLD.add(g)}}

/* ---------------- storage: artifact db "tracks" (beta) · localStorage + track code (fallback) */
const TB_LS='mho_tb_tracks';
function TB_loadLocal(){const o=store.get(TB_LS,{});TB.list={};for(const id in o)if(o[id]&&o[id].pts)TB.list[id]={t:o[id],src:'local'};for(const t of TB_BUILTIN)if(!TB.list[t.id])TB.list[t.id]={t,src:'demo'}}
function TB_saveLocal(t){const o=store.get(TB_LS,{});o[t.id]=t;store.set(TB_LS,o)}
const TB_code=t=>'ODT1:'+btoa(unescape(encodeURIComponent(JSON.stringify(t))));
function TB_decode(s){s=String(s||'').trim();const m=s.match(/ODT1:([A-Za-z0-9+/=]+)/);const j=m?decodeURIComponent(escape(atob(m[1]))):s;const t=JSON.parse(j);if(!t||!Array.isArray(t.pts))throw new Error('not a track');return Object.assign(TB_new(t.city),t)}
async function TB_dbInit(){try{if(!(window.claude&&typeof claude.use==='function'))return;const db=await claude.use('db');if(!db)return;TB.db=db;try{const u=await claude.use('user');if(u&&u.id)TB.uid=await u.id()}catch(e){}
  const snap=await db.collection('tracks').orderBy('time','desc').limit(60).get();for(const d of snap.docs){try{const v=d.data(),t=TB_decode(v.json);t.id=d.id;if(!TB.list[t.id]||TB.list[t.id].src==='demo')TB.list[t.id]={t,src:'db',author:v.author,time:v.time};TB_reg(TB_def(t)||{id:t.id})}catch(e){}}
  if(TB.el&&!TB.el.hidden)TB_drawList()}catch(e){TB.dbErr=(e&&e.code)||'db';console.warn('TB db',e)}}
async function TB_save(){const t=TB.trk;if(!t)return;TB_saveLocal(t);TB.list[t.id]={t:TB_clone(t),src:'local'};let msg='Saved on this device';
  if(TB.db){try{await TB.db.collection('tracks').doc(t.id).set({name:t.name,city:t.city,json:JSON.stringify(t),author:TB.uid||'',time:Date.now()});TB.list[t.id].src='db';msg='Saved · shared with the team'}catch(e){msg='Saved on this device (db: '+((e&&e.code)||'error')+')'}}
  TB_toast(msg);TB_regAll();TB_ui()}
function TB_regAll(){for(const id in TB.list){try{const d=TB_def(TB.list[id].t);if(d)TB_reg(d)}catch(e){}}}

/* ---------------- the builder screen */
const TB_css=`body.tbOn #tuG,body.tbOn #odNew,body.tbOn #odPin{display:none!important}
#tbx{position:fixed;inset:0;z-index:9000;background:#0d1626;color:#eef3ff;font:600 13px/1.2 system-ui,sans-serif;touch-action:none;user-select:none;-webkit-user-select:none}
#tbx canvas{position:absolute;left:0;top:0}#tbx .tbar{position:absolute;left:0;right:0;top:0;height:48px;display:flex;gap:4px;align-items:center;padding:2px 6px calc(2px) max(6px,env(safe-area-inset-left));background:rgba(8,14,28,.92);overflow-x:auto}
#tbx button{min-width:44px;min-height:44px;border:0;border-radius:10px;background:#24324f;color:#fff;font:800 13px system-ui,sans-serif;padding:0 8px;flex:0 0 auto}#tbx button[aria-pressed=true]{background:#ffd12c;color:#111}
#tbx button.go{background:#2bd46b;color:#06210f}#tbx .nm{max-width:150px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
#tbx .pal{position:absolute;left:max(4px,env(safe-area-inset-left));top:54px;display:grid;grid-template-columns:48px 48px;gap:4px}#tbx .pal button{width:48px;height:44px;padding:0;font-size:12px;line-height:1;display:flex;flex-direction:column;align-items:center;justify-content:center}
#tbx .pal button i{font-style:normal;font-size:18px}#tbx .pal button small{font-size:9px;font-weight:800;margin-top:2px}
#tbx .lint{position:absolute;right:max(4px,env(safe-area-inset-right));top:54px;bottom:4px;width:228px;background:rgba(8,14,28,.88);border-radius:12px;padding:6px 8px;overflow:auto}
#tbx .lint.min{bottom:auto;height:auto}#tbx .lint h4{margin:0 0 4px;font:900 15px system-ui;display:flex;justify-content:space-between;align-items:center;gap:6px}#tbx .lint h4 button{min-height:32px;min-width:44px}
#tbx .lr{display:flex;gap:6px;align-items:baseline;font-size:12px;padding:2px 0;border-bottom:1px solid rgba(255,255,255,.06)}#tbx .lr b{width:14px;flex:0 0 14px}#tbx .lr span{flex:1}#tbx .lr em{font-style:normal;opacity:.8;font-size:12px;text-align:right}
#tbx .ok b{color:#3ee07a}#tbx .no b{color:#ff4d4d}#tbx .sel{position:absolute;left:110px;bottom:max(6px,env(safe-area-inset-bottom));display:flex;gap:4px;background:rgba(8,14,28,.9);padding:4px;border-radius:12px}
#tbx .sel span{min-width:56px;text-align:center;align-self:center}#tbx .toast{position:absolute;left:50%;top:56px;transform:translateX(-50%);background:#ffd12c;color:#111;padding:8px 14px;border-radius:10px;font-weight:900;pointer-events:none}
#tbx .hint{position:absolute;left:112px;top:56px;right:240px;font-size:12px;opacity:.85;pointer-events:none;text-shadow:0 1px 2px #000}
#tbx .ov{position:absolute;inset:0;background:rgba(4,8,18,.94);display:flex;flex-direction:column;padding:10px max(14px,env(safe-area-inset-left));overflow:auto;gap:8px}#tbx .ov h3{margin:4px 0;font:900 18px system-ui}
#tbx .ov .rowb{display:flex;flex-wrap:wrap;gap:6px}#tbx .ov .trk{display:flex;gap:6px;align-items:center;background:#16223a;border-radius:12px;padding:6px 8px}#tbx .ov .trk b{flex:1;min-width:120px}
#tbx textarea{width:100%;min-height:70px;background:#0a1122;color:#cfe;border:1px solid #345;border-radius:8px;font:12px monospace;user-select:text;-webkit-user-select:text;touch-action:auto;box-sizing:border-box}
#tbx .ov{touch-action:pan-y}#tbx .exp{background:#16223a;border-radius:12px;padding:8px;display:flex;flex-direction:column;gap:6px}#tbx .exp small{opacity:.8;font-size:12px}`;
function TB_mk(){if(TB.el)return TB.el;const st=document.createElement('style');st.textContent=TB_css;document.head.appendChild(st);
  const e=document.createElement('div');e.id='tbx';e.hidden=true;e.innerHTML=`<canvas id="tbC"></canvas><div class="tbar" id="tbBar"></div><div class="pal" id="tbPal"></div><div class="hint" id="tbHint"></div><div class="lint" id="tbLint"></div><div class="sel" id="tbSel" hidden></div><div class="toast" id="tbToast" hidden></div><div class="ov" id="tbOv" hidden></div>`;
  document.body.appendChild(e);TB.el=e;TB.cv=e.querySelector('#tbC');TB_input();addEventListener('resize',()=>{if(TB.on)TB_draw()});return e}
function TB_toast(m){const e=TB.el&&TB.el.querySelector('#tbToast');if(!e)return;e.textContent=m;e.hidden=false;clearTimeout(TB.toast);TB.toast=setTimeout(()=>e.hidden=true,2200)}
function TB_open(t){TB_mk();TB.on=true;TB.el.hidden=false;document.body.classList.add('tbOn');TB.el.querySelector('#tbOv').hidden=true;if(t){TB.trk=TB_clone(t);TB.lint=null;TB.undo=[];TB.sel=-1;TB_fit()}if(!TB.trk){TB_drawList();return}TB_ui()}
function TB_close(){TB.on=false;document.body.classList.remove('tbOn');if(TB.el)TB.el.hidden=true;try{buildMenu()}catch(e){}}
function TB_push(){TB.undo.push(JSON.stringify(TB.trk));if(TB.undo.length>80)TB.undo.shift()}
function TB_changed(){TB.lint=TB_lint(TB.trk);TB_ui()}
const TB_btn=(lab,fn,o={})=>{const b=document.createElement('button');b.innerHTML=lab;b.onclick=e=>{e.stopPropagation();fn(b)};if(o.p!=null)b.setAttribute('aria-pressed',!!o.p);if(o.c)b.className=o.c;if(o.t)b.title=o.t;return b};
function TB_ui(){const t=TB.trk,e=TB.el;if(!t||!e)return;if(!TB.lint)TB.lint=TB_lint(t);const bar=e.querySelector('#tbBar');bar.innerHTML='';
  bar.append(TB_btn('◀',()=>TB_drawList(),{t:'My tracks'}),TB_nameIn(t));
  for(const[c,l]of[['fra','FRA'],['ath','ATH']])bar.append(TB_btn(l,()=>{if(t.city!==c){TB_push();t.city=c;TB_changed();TB_draw()}},{p:t.city===c}));
  bar.append(TB_btn('LAPS '+t.laps,()=>{TB_push();t.laps=t.laps%3+1;TB_changed()},{t:'Laps 1–3'}));
  const rw=document.createElement('label');rw.style.cssText='display:flex;align-items:center;gap:4px;font-size:12px;flex:0 0 auto';rw.innerHTML=`ROAD <input type=range min=10 max=17 step=1 value=${t.road} style="width:84px;height:40px"> <b>${t.road} m</b>`;
  const ri=rw.querySelector('input');ri.oninput=()=>{t.road=+ri.value;rw.querySelector('b').textContent=t.road+' m';TB.lint=TB_lint(t);TB_lintUi();TB_draw()};ri.onchange=()=>TB_push();bar.append(rw);
  bar.append(TB_btn('SNAP',()=>{TB.snap=!TB.snap;TB_ui()},{p:TB.snap,t:'Snap points to the city roads'}),TB_btn('↶',()=>{const s=TB.undo.pop();if(s){TB.trk=JSON.parse(s);TB.sel=-1;TB_changed();TB_draw()}},{t:'Undo'}),
    TB_btn('💾',()=>TB_save(),{t:'Save'}),TB_btn('⧉ EXPORT',()=>TB_export(TB.trk),{t:'Export a track code'}),TB_btn('▶ TEST',()=>TB_test(),{c:'go',t:'Test drive with AI rivals'}));
  const pal=e.querySelector('#tbPal');pal.innerHTML='';const tools=[['pt','●','POINT'],['ter','🎨','SURFACE'],['start','🏁','START'],...Object.entries(TB_PCS).map(([k,v])=>[k,v.ic,v.l]),['del','✕','ERASE']];
  for(const[k,ic,l]of tools)pal.append(TB_btn(`<i>${ic}</i><small>${l}</small>`,()=>{TB.tool=k;TB.sel=-1;TB_ui()},{p:TB.tool===k}));
  e.querySelector('#tbHint').textContent=t.pts.length<3?'Tap the map to drop points (a loop closes itself). Drag a point to move it. Drag the map to pan, pinch or wheel to zoom.':
    {pt:'Tap the map: add a point (on the track: insert). Drag points. Tap a point for height / delete.',ter:'Tap a segment to change its surface: grass → dirt → sand → cobbles.',start:'Tap a point: the grid starts there.',del:'Tap a piece or a point to erase it.'}[TB.tool]||('Tap the track to place: '+TB_PCS[TB.tool].l);
  TB_lintUi();TB_selUi();TB_draw()}
function TB_lintUi(){const e=TB.el.querySelector('#tbLint'),L=TB.lint,ok=L.rules.filter(r=>r.ok).length,fm=x=>Math.floor(x/60)+':'+String(Math.round(x%60)).padStart(2,'0');
  const min=TB.lintMin;e.className='lint'+(min?' min':'');e.innerHTML=`<h4><span>${ok}/${L.rules.length} ✓ · lap ${L.lap?Math.round(L.lap)+' s':'–'} · race ${L.race?fm(L.race):'–'}</span></h4>`;
  e.querySelector('h4').append(TB_btn(min?'▾':'▴',()=>{TB.lintMin=!TB.lintMin;TB_lintUi()},{t:'Show / hide the rules'}));if(min)return;
  for(const r of L.rules){const d=document.createElement('div');d.className='lr '+(r.ok?'ok':'no');d.innerHTML=`<b>${r.ok?'✔':'✕'}</b><span>${r.name}<br><em>${r.need}</em></span><em>${r.val}</em>`;d.title=r.id;e.append(d)}}
function TB_selUi(){const e=TB.el.querySelector('#tbSel'),t=TB.trk,i=TB.sel;if(!(i>=0&&t.pts[i])||TB.tool!=='pt'){e.hidden=true;return}e.hidden=false;e.innerHTML='';const p=t.pts[i];
  const sp=document.createElement('span');sp.textContent='↕ '+Math.round(p[2]||0)+' m';e.append(TB_btn('▼',()=>{TB_push();p[2]=Math.max(0,(p[2]||0)-3);TB_changed()}),sp,TB_btn('▲',()=>{TB_push();p[2]=Math.min(60,(p[2]||0)+3);TB_changed()}),
    TB_btn('✕',()=>{TB_push();t.pts.splice(i,1);TB.sel=-1;TB_changed()},{t:'Delete point'}),TB_btn('OK',()=>{TB.sel=-1;TB_ui()}))}
// ---- view
function TB_bg(city){const ath=city==='ath',L=(ath?ATH_TRACKS:TDF).filter(d=>!d.open&&!d.tb),roads=L.map(d=>d.cp.map(c=>[c[0]*S,c[2]*S])),lab={};
  for(const d of L)for(const c of d.cp){const n=String(c[3]).split(' · ')[0];(lab[n]=lab[n]||[]).push([c[0]*S,c[2]*S])}
  return{roads,labels:Object.entries(lab).map(([n,a])=>[n,a.reduce((s,p)=>s+p[0],0)/a.length,a.reduce((s,p)=>s+p[1],0)/a.length]),river:ath?null:[450*S,750*S]}}
function TB_fit(){const t=TB.trk,cv=TB.cv;let P=t&&t.pts.length?t.pts.map(p=>[p[0],p[1]]):TB_bg(t?t.city:'fra').roads.flat();if(!P.length)P=[[0,0]];
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const[x,z]of P){x0=Math.min(x0,x);x1=Math.max(x1,x);z0=Math.min(z0,z);z1=Math.max(z1,z)}
  const W=innerWidth-110-240,H=innerHeight-60;TB.view.s=clamp(Math.min(W/Math.max(200,x1-x0+260),H/Math.max(200,z1-z0+260)),.02,3);TB.view.x=(x0+x1)/2;TB.view.z=(z0+z1)/2}
const TB_cx=()=>110+(innerWidth-110-(TB.lintMin?0:236))/2,TB_cy=()=>48+(innerHeight-48)/2;
const TB_w2s=(x,z)=>[TB_cx()+(x-TB.view.x)*TB.view.s,TB_cy()+(z-TB.view.z)*TB.view.s],TB_s2w=(px,py)=>[TB.view.x+(px-TB_cx())/TB.view.s,TB.view.z+(py-TB_cy())/TB.view.s];
function TB_draw(){const cv=TB.cv,t=TB.trk;if(!cv||!t)return;const dpr=Math.min(2,devicePixelRatio||1),W=innerWidth,H=innerHeight;if(cv.width!==W*dpr||cv.height!==H*dpr){cv.width=W*dpr;cv.height=H*dpr;cv.style.width=W+'px';cv.style.height=H+'px'}
  const g=cv.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);g.fillStyle=t.city==='ath'?'#2b2a24':'#14261c';g.fillRect(0,0,W,H);const s=TB.view.s,bg=TB_bg(t.city);
  // grid every 500 m + scale bar
  g.strokeStyle='rgba(255,255,255,.05)';g.lineWidth=1;const[a0,b0]=TB_s2w(0,0),[a1,b1]=TB_s2w(W,H);for(let x=Math.floor(a0/500)*500;x<a1;x+=500){const[p]=TB_w2s(x,0);g.beginPath();g.moveTo(p,0);g.lineTo(p,H);g.stroke()}
  for(let z=Math.floor(b0/500)*500;z<b1;z+=500){const[,q]=TB_w2s(0,z);g.beginPath();g.moveTo(0,q);g.lineTo(W,q);g.stroke()}
  if(bg.river){const[,y0]=TB_w2s(0,bg.river[0]),[,y1]=TB_w2s(0,bg.river[1]);g.fillStyle='#1f5f9e';g.fillRect(0,y0,W,y1-y0);g.fillStyle='rgba(255,255,255,.5)';g.font='800 12px system-ui';g.fillText('MAIN',TB_cx()-14,(y0+y1)/2+4)}
  g.lineJoin=g.lineCap='round';for(const r of bg.roads){g.strokeStyle='rgba(190,200,215,.28)';g.lineWidth=Math.max(3,18*s);g.beginPath();r.forEach(([x,z],i)=>{const[p,q]=TB_w2s(x,z);i?g.lineTo(p,q):g.moveTo(p,q)});g.closePath();g.stroke()}
  g.font='700 12px system-ui';g.fillStyle='rgba(230,236,255,.5)';{const put=[];for(const[n,x,z]of bg.labels){const[p,q]=TB_w2s(x,z),w=g.measureText(n).width;if(put.some(b=>p<b[0]+b[2]+8&&p+w+8>b[0]&&Math.abs(q-b[1])<18))continue;put.push([p,q,w]);g.fillText(n,p+6,q-6)}}
  {const m=100*s>=40?100:500*s>=40?500:1000,[p0]=TB_w2s(0,0),y=H-14,x=118;g.fillStyle='#fff';g.fillRect(x,y,m*s,3);g.fillText(m+' m',x,y-4)}
  const L=TB.lint,G=L&&L.g;
  if(G){// ribbon (96 m) coloured by segment surface, asphalt core, centre line
    const rib=(w,col)=>{g.lineWidth=Math.max(2,w*s);for(let q=0;q<t.pts.length;q++){g.strokeStyle=typeof col==='function'?col(q):col;g.beginPath();let f=true;for(let i=0;i<G.N;i++){if(G.SEG[i]!==q)continue;const[p,r]=TB_w2s(G.X[i],G.Z[i]);f?g.moveTo(p,r):g.lineTo(p,r);f=false}const j=G.cpI[(q+1)%t.pts.length],[p,r]=TB_w2s(G.X[j],G.Z[j]);g.lineTo(p,r);g.stroke()}};
    g.globalAlpha=.55;rib(96,q=>TB_TCOL[t.pts[q][3]||'grass']);g.globalAlpha=1;rib(t.road,'#5b5f66');
    g.setLineDash([6,8]);g.strokeStyle='#ffc81e';g.lineWidth=1.5;g.beginPath();for(let i=0;i<=G.N;i++){const[p,r]=TB_w2s(G.X[i%G.N],G.Z[i%G.N]);i?g.lineTo(p,r):g.moveTo(p,r)}g.stroke();g.setLineDash([]);
    // direction arrows every ~250 m
    g.fillStyle='rgba(255,255,255,.8)';const st=Math.max(1,Math.round(250/G.ds));for(let i=st/2|0;i<G.N;i+=st){const[p,r]=TB_w2s(G.X[i],G.Z[i]),a=Math.atan2(G.TZ[i],G.TX[i]);g.save();g.translate(p,r);g.rotate(a);g.beginPath();g.moveTo(7,0);g.lineTo(-5,-5);g.lineTo(-5,5);g.fill();g.restore()}
    for(const m of L.marks){const[p,r]=TB_w2s(m.x,m.z);g.strokeStyle=m.c;g.lineWidth=3;g.beginPath();g.arc(p,r,Math.max(16,m.r*s),0,7);g.stroke();g.fillStyle=m.c;g.font='900 12px system-ui';g.fillText(m.t,p+Math.max(16,m.r*s)+3,r+4)}}
  else if(t.pts.length>1){g.strokeStyle='#ffd12c';g.lineWidth=2;g.setLineDash([5,5]);g.beginPath();t.pts.forEach((p,i)=>{const[a,b]=TB_w2s(p[0],p[1]);i?g.lineTo(a,b):g.moveTo(a,b)});g.stroke();g.setLineDash([])}
  // start grid
  {let si=-1;if(t.st&&t.pts.length){let bd=1e18;t.pts.forEach((p,i)=>{const d=(p[0]-t.st[0])**2+(p[1]-t.st[1])**2;if(d<bd){bd=d;si=i}})}else if(t.pts.length)si=0;
    if(si>=0){const[p,r]=TB_w2s(t.pts[si][0],t.pts[si][1]);for(let a=0;a<4;a++)for(let b=0;b<2;b++){g.fillStyle=(a+b)%2?'#111':'#fff';g.fillRect(p-16+a*8,r-22+b*8,8,8)}g.fillStyle='#fff';g.font='900 12px system-ui';g.fillText('START',p-16,r-26)}}
  // pieces
  for(const pc of t.pc){const d=TB_PCS[pc.k];if(!d)continue;const[p,r]=TB_w2s(pc.x,pc.z);g.fillStyle=d.c;g.beginPath();g.arc(p,r,13,0,7);g.fill();g.fillStyle='#111';g.font='900 15px system-ui';g.textAlign='center';g.fillText(d.ic,p,r+5);g.textAlign='left';
    if(pc.k==='gate'&&pc.n){g.fillStyle='#ff9ccc';g.font='800 12px system-ui';g.fillText(pc.n,p+15,r-8)}}
  // control points (drawn 12 px, hit radius 26 px)
  t.pts.forEach((p,i)=>{const[a,b]=TB_w2s(p[0],p[1]);g.fillStyle=i===TB.sel?'#ffd12c':'#fff';g.strokeStyle='#111';g.lineWidth=2;g.beginPath();g.arc(a,b,i===TB.sel?13:10,0,7);g.fill();g.stroke();
    if(p[2]){g.fillStyle='#bfe3ff';g.font='800 12px system-ui';g.fillText('↑'+Math.round(p[2]),a+12,b+14)}})}
// ---- input: one finger = tap / drag a point / pan; two fingers = pinch zoom; wheel = zoom
function TB_hitPt(px,py){const t=TB.trk;let bi=-1,bd=26*26;t.pts.forEach((p,i)=>{const[a,b]=TB_w2s(p[0],p[1]),d=(a-px)**2+(b-py)**2;if(d<bd){bd=d;bi=i}});return bi}
function TB_hitPc(px,py){const t=TB.trk;let bi=-1,bd=24*24;t.pc.forEach((p,i)=>{const[a,b]=TB_w2s(p.x,p.z),d=(a-px)**2+(b-py)**2;if(d<bd){bd=d;bi=i}});return bi}
function TB_snapW(x,z){if(!TB.snap)return[x,z];const bg=TB_bg(TB.trk.city);let best=null,bd=(40/TB.view.s)**2;for(const r of bg.roads)for(let i=0;i<r.length;i++){const a=r[i],b=r[(i+1)%r.length],dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1,u=clamp(((x-a[0])*dx+(z-a[1])*dz)/l2,0,1),px=a[0]+dx*u,pz=a[1]+dz*u,d=(px-x)**2+(pz-z)**2;if(d<bd){bd=d;best=[px,pz]}}return best||[x,z]}
function TB_tap(px,py){const t=TB.trk,[x,z]=TB_s2w(px,py),G=TB.lint&&TB.lint.g,tool=TB.tool;
  if(tool==='pt'){const h=TB_hitPt(px,py);if(h>=0){TB.sel=TB.sel===h?-1:h;TB_ui();return}const[sx,sz]=TB_snapW(x,z);TB_push();
    if(G){const n=TB_near(G,sx,sz);if(n.d*TB.view.s<30){const q=G.SEG[n.i];t.pts.splice(q+1,0,[sx,sz,TB_hAt(G,n.i),t.pts[q][3]||'grass']);TB.sel=q+1;TB_changed();return}}
    const q=TB.sel>=0?TB.sel+1:t.pts.length,prev=t.pts[q-1];t.pts.splice(q,0,[sx,sz,prev?prev[2]||0:4,prev?prev[3]||'grass':'grass']);TB.sel=q;TB_changed();return}
  if(tool==='del'){const c=TB_hitPc(px,py);if(c>=0){TB_push();t.pc.splice(c,1);TB_changed();return}const h=TB_hitPt(px,py);if(h>=0){TB_push();t.pts.splice(h,1);TB_changed()}return}
  if(tool==='start'){const h=TB_hitPt(px,py);if(h>=0){TB_push();t.st=[t.pts[h][0],t.pts[h][1]];TB_changed()}return}
  if(!G)return TB_toast('Draw a loop first (3+ points)');const n=TB_near(G,x,z);if(n.d*TB.view.s>40)return;
  if(tool==='ter'){TB_push();const q=G.SEG[n.i],p=t.pts[q];p[3]=TB_TERS[(TB_TERS.indexOf(p[3]||'grass')+1)%TB_TERS.length];TB_changed();return}
  const c=TB_hitPc(px,py);if(c>=0&&t.pc[c].k===tool){TB_push();t.pc.splice(c,1);TB_changed();return}
  const pc={k:tool,x:G.X[n.i],z:G.Z[n.i]};if(tool==='gate'){const k=t.pc.filter(p=>p.k==='gate').length+1;pc.n=(TB_lab(G.X[n.i],G.Z[n.i])||'CHECKPOINT '+k).toUpperCase().slice(0,22)}// named after the nearest landmark (no prompt(): the app's sandboxed iframe may block modals)
  TB_push();t.pc.push(pc);TB_changed()}
const TB_hAt=(G,i)=>Math.round(G.Y[i]);
// track name: an inline text field (no prompt())
function TB_nameIn(t){const i=document.createElement('input');i.value=t.name;i.maxLength=28;i.setAttribute('aria-label','Track name');i.style.cssText='width:130px;min-height:40px;border-radius:10px;border:0;background:#24324f;color:#fff;font:800 13px system-ui;padding:0 8px;flex:0 0 auto';
  i.onchange=()=>{const v=i.value.trim();if(v&&v!==t.name){TB_push();t.name=v.slice(0,28);TB.lint=TB_lint(t);TB_lintUi()}};i.onkeydown=e=>{if(e.key==='Enter')i.blur()};return i}
function TB_lab(x,z){const bg=TB_bg(TB.trk.city);let b=null,bd=600*600;for(const[n,a,c]of bg.labels){const d=(a-x)**2+(c-z)**2;if(d<bd){bd=d;b=n}}return b}
function TB_input(){const cv=TB.cv,P=TB.ptr;
  cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);P.set(e.pointerId,{x:e.clientX,y:e.clientY,x0:e.clientX,y0:e.clientY});
    if(P.size===1){const h=TB.tool==='pt'?TB_hitPt(e.clientX,e.clientY):-1;TB.drag={pt:h,moved:false,pushed:false}}else{TB.drag={pinch:true};const[a,b]=[...P.values()];TB.pz={d:Math.hypot(a.x-b.x,a.y-b.y),s:TB.view.s}}});
  cv.addEventListener('pointermove',e=>{const p=P.get(e.pointerId);if(!p)return;const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;const D=TB.drag;if(!D)return;
    if(D.pinch&&P.size>=2){const[a,b]=[...P.values()],d=Math.hypot(a.x-b.x,a.y-b.y);TB.view.s=clamp(TB.pz.s*d/Math.max(10,TB.pz.d),.02,3);TB_draw();return}
    if(Math.hypot(e.clientX-p.x0,e.clientY-p.y0)>8)D.moved=true;if(!D.moved)return;
    if(D.pt>=0){if(!D.pushed){TB_push();D.pushed=true}const[x,z]=TB_snapW(...TB_s2w(e.clientX,e.clientY)),q=TB.trk.pts[D.pt];q[0]=x;q[1]=z;TB.lint=TB_lint(TB.trk);TB_draw()}
    else{TB.view.x-=dx/TB.view.s;TB.view.z-=dy/TB.view.s;TB_draw()}});
  const end=e=>{const p=P.get(e.pointerId);P.delete(e.pointerId);const D=TB.drag;if(!D||!p)return;if(D.pinch){if(!P.size)TB.drag=null;return}TB.drag=null;
    if(!D.moved)TB_tap(e.clientX,e.clientY);else if(D.pt>=0){TB.sel=D.pt;TB_changed()}};
  cv.addEventListener('pointerup',end);cv.addEventListener('pointercancel',e=>{P.delete(e.pointerId);TB.drag=null});
  cv.addEventListener('wheel',e=>{e.preventDefault();const[x,z]=TB_s2w(e.clientX,e.clientY);TB.view.s=clamp(TB.view.s*Math.exp(-e.deltaY*.0015),.02,3);const[x2,z2]=TB_s2w(e.clientX,e.clientY);TB.view.x+=x-x2;TB.view.z+=z-z2;TB_draw()},{passive:false});
  addEventListener('keydown',e=>{if(!TB.on||e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')return;if((e.ctrlKey||e.metaKey)&&e.key==='z'){e.preventDefault();const s=TB.undo.pop();if(s){TB.trk=JSON.parse(s);TB_changed()}}else if(e.key==='Delete'&&TB.sel>=0){TB_push();TB.trk.pts.splice(TB.sel,1);TB.sel=-1;TB_changed()}e.stopPropagation()},true)}
// ---- MY TRACKS / new / copy a circuit / track code
function TB_drawList(){TB_mk();TB.on=true;TB.el.hidden=false;document.body.classList.add('tbOn');const o=TB.el.querySelector('#tbOv');o.hidden=false;o.innerHTML='';
  const head=document.createElement('div');head.className='rowb';head.append(TB_btn('◀ MENU',()=>{o.hidden=true;TB_close()}),TB_btn('＋ NEW FRANKFURT',()=>{o.hidden=true;TB_open(TB_new('fra'))}),TB_btn('＋ NEW ATHENS',()=>{o.hidden=true;TB_open(TB_new('ath'))}));
  if(TB.trk)head.append(TB_btn('✎ BACK TO EDITOR',()=>{o.hidden=true;TB_ui()},{c:'go'}));o.append(head);
  const h3=document.createElement('h3');h3.textContent='IMPORT · PASTE A TRACK CODE';o.append(h3);const ir=document.createElement('div');ir.className='rowb';ir.style.flexWrap='nowrap';const ta=document.createElement('textarea');ta.placeholder='ODT1:…';ta.rows=2;ta.style.minHeight='44px';ir.append(ta);o.append(ir);
  ir.append(TB_btn('IMPORT',()=>{let t;try{t=TB_decode(ta.value)}catch(e){TB_toast('That is not a track code');return}if(TB.list[t.id]&&TB.list[t.id].src==='demo')t.id=TB_new(t.city).id;TB_saveLocal(t);TB.list[t.id]={t:TB_clone(t),src:'local'};TB_regAll();o.hidden=true;TB_open(t);TB_toast('Imported · saved on this device')},{c:'go'}))
  const h=document.createElement('h3');h.textContent='MY TRACKS'+(TB.db?' · shared':' · on this device');o.append(h);
  const ids=Object.keys(TB.list).sort((a,b)=>(TB.list[b].time||0)-(TB.list[a].time||0));if(!ids.length){const p=document.createElement('div');p.textContent='No tracks yet. Start a NEW one or copy a circuit below.';o.append(p)}
  for(const id of ids){const it=TB.list[id],t=it.t,r=document.createElement('div');r.className='trk';const L=TB_lint(t),ok=L.rules.filter(x=>x.ok).length;
    r.innerHTML=`<b>${t.name.replace(/</g,'')}<br><small style="opacity:.75">${t.city==='ath'?'Athens':'Frankfurt'} · ${t.laps} laps · ~${Math.round(L.race)} s · lint ${ok}/${L.rules.length}${it.src==='demo'?' · demo':''}</small></b>`;
    r.append(TB_btn('▶ RACE',()=>{o.hidden=true;TB.trk=TB_clone(t);TB_test()},{c:'go'}),TB_btn('✎ EDIT',()=>{o.hidden=true;TB_open(t)}),TB_btn('⧉ EXPORT',()=>TB_export(t)));o.append(r)}
  const h2=document.createElement('h3');h2.textContent='COPY A CIRCUIT INTO THE BUILDER';o.append(h2);const cr=document.createElement('div');cr.className='rowb';
  for(const d of TRACK_DEFS.filter(d=>!d.tb&&!d.open))cr.append(TB_btn(d.short,()=>{o.hidden=true;TB_open(TB_fromDef(d))}));o.append(cr);}

// EXPORT (track-1/2, Alex: "allowing to export the track so we can include in the game"): the ODT1 code in a selectable box + COPY
// (clipboard API, then execCommand, then "long-press to copy": the Claude app iframe may block the clipboard) + 💾 save (db in the Lab artifact)
function TB_export(t){if(!t)return;TB_mk();TB.on=true;TB.el.hidden=false;document.body.classList.add('tbOn');const o=TB.el.querySelector('#tbOv');o.hidden=false;o.innerHTML='';
  const box=document.createElement('div');box.className='exp';const h=document.createElement('h3');h.textContent='EXPORT · '+t.name;const ta=document.createElement('textarea');ta.id='tbExp';ta.value=TB_code(t);ta.readOnly=true;ta.rows=5;
  const L=TB_lint(t),ok=L.rules.filter(r=>r.ok).length,inf=document.createElement('small');inf.textContent=`${t.city==='ath'?'Athens':'Frankfurt'} · ${t.laps} laps · lint ${ok}/${L.rules.length} · ${ta.value.length} characters. Send this code to the team; IMPORT (MY TRACKS) loads it back.`;
  const sel=()=>{try{ta.focus();ta.select();ta.setSelectionRange(0,ta.value.length)}catch(e){}};ta.onclick=sel;ta.onfocus=sel;
  const r=document.createElement('div');r.className='rowb';
  r.append(TB_btn('⧉ COPY',async()=>{sel();let done=false;try{if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(ta.value);done=true}}catch(e){}
      if(!done)try{done=document.execCommand('copy')}catch(e){}TB_toast(done?'Copied':'Copy blocked here: long-press the code → Copy')},{c:'go'}),
    TB_btn('💾 SAVE',()=>{TB.trk=TB_clone(t);TB_save().then(()=>TB_export(t))},{t:TB.db?'Save to the team db':'Save on this device'}),
    TB_btn('◀ BACK',()=>{o.hidden=true;if(TB.trk)TB_ui();else TB_drawList()}));
  box.append(h,ta,inf,r);o.append(box);o.scrollTop=0;sel()}
const TB_codeBox=TB_export;
function TB_fromDef(d){const t=TB_new(d.city==='ath'?'ath':'fra');t.name=d.short+' (copy)';t.laps=Math.min(3,d.laps||3);t.pts=d.cp.map(c=>[Math.round(c[0]*S),Math.round(c[2]*S),Math.max(0,Math.round(c[1])),'grass']);return t}
// ---- TEST DRIVE: register the def and start a quick race on it (RETRY reuses the built world: no rebuild)
function TB_test(){const t=TB.trk;if(!t)return;const def=TB_def(t);if(!def){TB_toast('Draw a loop first (3+ points)');return}TB_reg(def);TB.list[t.id]=Object.assign({src:'draft'},TB.list[t.id],{t:TB_clone(t)});
  TB.on=false;TB.el.hidden=true;document.body.classList.remove('tbOn');menuTab='quick';menuTrack=t.id;menuMood=def.mood;if(typeof trkCity!=='undefined')trkCity=t.city;startRace()}
// pause + results: ✎ EDIT TRACK (only on builder tracks), MY TRACKS block in the race menu, BUILDER on the home footer
function TB_editBtns(){for(const[sel,id]of[['#pause .row','tbEdP'],['#results .row','tbEdR']]){const row=$(sel);if(!row)continue;let b=document.getElementById(id);
  if(!b){b=document.createElement('button');b.id=id;b.className='go alt';b.textContent='✎ EDIT TRACK';b.onclick=()=>{paused=false;$('#pause').hidden=true;$('#results').hidden=true;const t=TRK&&TRK.tb;try{toMenu()}catch(e){}if(t)TB_open(t)};row.appendChild(b)}b.hidden=!(TRK&&TRK.tb)}}
setupRace=(f=>function(cfg){const r=f.apply(this,arguments);try{TB_editBtns()}catch(e){}return r})(setupRace);
buildMenu=(f=>function(){const r=f.apply(this,arguments);try{TB_menu()}catch(e){console.warn('TB menu',e)}return r})(buildMenu);
function TB_menu(){const tw=$('#tracks');if(!tw)return;let m=$('#tbMy');if(!m){m=document.createElement('div');m.id='tbMy';m.style.cssText='display:flex;flex-wrap:wrap;gap:6px;margin:8px 0';}
  const after=$('#trkDesc')||tw;if(m.previousSibling!==after)after.after(m);m.innerHTML='';const cy=(typeof trkCity!=='undefined'&&trkCity)||'fra';
  const lab=document.createElement('b');lab.textContent='MY TRACKS';lab.style.cssText='width:100%;font-size:13px;letter-spacing:.08em';m.append(lab);
  for(const id in TB.list){const t=TB.list[id].t;if((t.city||'fra')!==cy)continue;const b=document.createElement('button');b.className='trk';b.style.minHeight='44px';b.setAttribute('aria-pressed',menuTrack===id);b.innerHTML=`<b>${t.name.replace(/</g,'')}</b><em>${t.laps} laps · builder</em>`;
    b.onclick=()=>{const d=TB_def(t);if(!d)return;TB_reg(d);menuTrack=id;menuMood=d.mood;buildMenu();try{refreshAttract()}catch(e){}};m.append(b)}
  const nb=document.createElement('button');nb.className='go alt';nb.style.minHeight='44px';nb.textContent='🛠 TRACK BUILDER';nb.onclick=()=>TB_drawList();m.append(nb)}
{const f=document.querySelector('#home .hfoot');if(f){const b=document.createElement('button');b.textContent='🛠 BUILDER';b.onclick=e=>{e.stopPropagation();TB_drawList()};f.appendChild(b)}}
// ---- built-in demo (STEP 3): the Sachsenhausen Twister rebuilt as an open course that passes every lint rule
// Twister (copy) lints 6/15 (no jumps, shortcut, pads, gates; one surface; R 54 m hairpin). Rebuilt: 16 points, 2 laps, all 15 green (tools/tbLint.mjs).
const TB_BUILTIN=[{"v":1,"id":"tb_demo_twister","name":"Twister GP","city":"fra","laps":2,"road":14,"pts":[[930,900,8,"cobble"],[698,1032,12,"cobble"],[425,1083,17,"grass"],[268,1152,23,"grass"],[60,1260,28,"grass"],[-254,1279,32,"dirt"],[-455,1157,34,"dirt"],[-473,1010,34,"grass"],[-512,900,32,"sand"],[-612,761,28,"sand"],[-536,602,23,"grass"],[-230,550,17,"grass"],[60,621,12,"cobble"],[245,677,8,"cobble"],[507,677,6,"grass"],[837,739,6,"grass"]],"pc":[{"k":"jump","x":637,"z":1048},{"k":"jump","x":-215,"z":551},{"k":"scd","x":-402,"z":1210},{"k":"scw","x":-438,"z":564},{"k":"boost","x":847,"z":971},{"k":"boost","x":-101,"z":1288},{"k":"boost","x":75,"z":625},{"k":"item","x":346,"z":1114},{"k":"item","x":-519,"z":888},{"k":"item","x":290,"z":681},{"k":"gate","x":526,"z":1064,"n":"SCHWEIZER STRASSE"},{"k":"gate","x":-213,"z":1286,"n":"GOETHETURM"},{"k":"gate","x":-587,"z":663,"n":"STADTWALD"},{"k":"gate","x":217,"z":672,"n":"OBERRAD"}],"st":[507,677]}];
TB_loadLocal();TB_regAll();
if(String(menuTrack).startsWith('tb_')&&!TRACK_DEFS.some(d=>d.id===menuTrack)){menuTrack='grand'}
TB_dbInit();
window.__tbS=(x,z)=>TB_w2s(x,z);window.__tb={open:TB_open,list:TB_drawList,lint:t=>TB_lint(t||TB.trk),def:t=>TB_def(t||TB.trk),get:()=>TB.trk,set:t=>{TB.trk=t;TB.undo=[];TB.lint=null;TB_changed()},fit:()=>{TB_fit();TB_draw()},test:TB_test,state:()=>({on:TB.on,tool:TB.tool,n:TB.trk&&TB.trk.pts.length,db:!!TB.db,dbErr:TB.dbErr,list:Object.keys(TB.list)}),V:TB_V,code:TB_code,decode:TB_decode,export:t=>TB_export(t||TB.trk)};
