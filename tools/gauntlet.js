// gauntlet (gauntlet-g0, 2026-10-29): the test a PLAYER would be. Real boot of the BUILT page, phone profile, input ONLY through real
// Playwright/CDP touch on the real on-screen buttons (PLAY, GAS, BRAKE, ◀ ▶, BOOST, ❚❚, RESUME, card buttons, RETRY, RACES, START).
// page.evaluate only READS (position, speed, health, mission/race state, DOM boxes), like a player looking at the screen. Docs: docs/GAUNTLET.md.
//   node tools/gauntlet.js [--build out/<ver>] [--url URL] [--ver <label>] [--only boot,drive,hit,drift,wall,mission,race,pause,ath,portrait] [--throttle 6]
// Output: one table (row, number, bar, PASS/FAIL, shot) on stdout and docs/shots/gauntlet/<ver>/REPORT.md, shots in the same folder. Exit code = FAIL rows.
// Clock: this lab renders with software GL at ~2-3 fps, so after the (real-time, 6x CPU) boot the harness becomes the page's vsync: it steps the
// game's own rAF callback at a fixed 1/30 s phone frame and skips GPU draws except for screenshots (bughunt's capture, tools/bughunt.js). That is the
// clock, not game state: nothing in RO/HUB/state is written and no game function is called. All bars are in GAME seconds (T).
const {chromium}=(()=>{try{return require('playwright')}catch(e){return require('/opt/node22/lib/node_modules/playwright')}})();
const fs=require('fs'),path=require('path'),http=require('http'),cp=require('child_process');
const A=process.argv.slice(2),arg=(k,d)=>{const i=A.indexOf('--'+k);return i<0?d:(A[i+1]&&!A[i+1].startsWith('--')?A[i+1]:true)};
// traffic-r30c2: the bot's own choices (branch pick, reverse steer, wall side) come from a seeded RNG (--seed N, default 7), so runs of two builds drive the same choices; the game's randomness is untouched
const RNG=(s=>()=>(s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296)((+arg('seed',7))>>>0||7);
const ROOT=path.join(__dirname,'..'),T0=Date.now(),wall=()=>((Date.now()-T0)/1000).toFixed(0);
const ONLY=String(arg('only','boot,perf,hud,steer,drive,hit,drift,wall,mission,race,pause,ath,portrait')).split(','),on=k=>ONLY.includes(k);
const THR=+arg('throttle',6),DT=1/30;
const IPHONE_UA='Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
let BUILD=arg('build',''),URL0=arg('url','');
if(!URL0&&!BUILD){BUILD='out/gauntlet';const r=cp.spawnSync('bash',['tools/build.sh','gauntlet'],{cwd:ROOT,encoding:'utf8'});if(!/BUILD_OK/.test(r.stdout)){console.log('FAIL build\n'+(r.stdout+r.stderr).slice(-600));process.exit(99)}}
const VER=String(arg('ver','')||(()=>{try{return /v:'([^']+)'/.exec(fs.readFileSync(path.join(ROOT,BUILD||'.','index.html'),'utf8'))[1]}catch(e){return 'url'}})());
const OUT=path.join(ROOT,'docs/shots/gauntlet',VER);fs.mkdirSync(OUT,{recursive:true});
const serve=dir=>new Promise(res=>{const T={'.html':'text/html','.js':'text/javascript','.json':'application/json','.mp3':'audio/mpeg'};const s=http.createServer((q,r)=>{let f=path.join(dir,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,b)=>{if(e){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});r.end(b)})}).listen(0,'127.0.0.1',()=>res([s,s.address().port]))});

// ---------- rows ----------
const ROWS=[];const row=(id,what,num,bar,pass,shot,note)=>{const r={id,what,num:String(num),bar,pass:pass===null?'INFO':pass?'PASS':'FAIL',shot:shot?path.relative(ROOT,shot):'',note:note||''};ROWS.push(r);console.log(`${r.pass.padEnd(4)} ${id.padEnd(16)} ${r.num.padEnd(28)} bar ${bar}${note?' · '+note:''}`);return r};

// ---------- in-page harness (evaluated in the game's module scope through __tk.q = read access; it WRITES nothing the game reads) ----------
const HARNESS=String.raw`(()=>{if(window.__GH)return 'again';
const G=window.__GH={q:[],on:false,draw:true,vt:0,frames:0,pops:[],n40:0,n40s:0,hb:[0,0,0,0,0,0,0,0],maxDrop:0,ev:[],P:null,CP:new Map(),mem:0};
const raf0=window.requestAnimationFrame.bind(window);G.raf0=raf0;
window.requestAnimationFrame=cb=>{if(G.on){G.q.push(cb);return 1}return raf0(cb)};
{const r0=renderer.render.bind(renderer);renderer.render=function(){if(G.on&&!G.draw)return;return r0.apply(this,arguments)};
 try{const c0=composer.render.bind(composer);composer.render=function(){if(G.on&&!G.draw)return;return c0.apply(this,arguments)}}catch(e){}}
G.capture=()=>{G.on=true;G.draw=false;G.vt=performance.now()+50};
G.release=()=>{G.on=false;G.draw=true;const q=G.q;G.q=[];for(const cb of q)raf0(cb)};
const W=a=>Math.atan2(Math.sin(a),Math.cos(a));
G.read=()=>{const o={T:+T.toFixed(3),st:state,on:!!RO.on,fz:!!RO.frozen,bh:!!RO.bootHold,x:+RO.x.toFixed(2),y:+RO.y.toFixed(2),z:+RO.z.toFixed(2),h:+RO.h.toFixed(4),vh:+(RO.vh??RO.h).toFixed(4),v:+(RO.v*3.6).toFixed(1),hp:+(RO.hp??100).toFixed(1),card:!!RO.card,ch:!!RO.ch,map:!!RO.mapOpen,paused:!!paused,ld:!!(LD.on||LD.busy)};
 try{if(RO.ch){const c=RO.ch;o.chk=c.m&&c.m.ev&&c.m.ev.kind;o.chLeft=c.v2?+(+c.v2.left).toFixed(1):(c.left!=null?+(+c.left).toFixed(1):null);o.chStage=c.v2?c.v2.i:null;o.chCd=c.cd||0;const g=c.v2&&(c.v2.tgt||c.v2.t||null);if(c.gx!=null){o.tx=c.gx;o.tz=c.gz}else if(g&&g.x!=null){o.tx=g.x;o.tz=g.z}}}catch(e){}
 try{if(pl&&(state==='race'||state==='countdown'||state==='finished')){o.race={x:+pl.x.toFixed(2),yaw:+pl.yaw.toFixed(3),v:+(pl.v*3.6).toFixed(0),lap:pl.lap,dist:+pl.dist.toFixed(0),fin:!!pl.fin,hw:+((typeof TD!=='undefined'&&TD.hw)||0)}}}catch(e){}
 return o};
G.cars=(R)=>{const out=[];for(const c of HUB.cars||[]){if(c.dead>0||c.pk)continue;const d=Math.hypot(c.x-RO.x,c.z-RO.z);if(d<R)out.push({i:HUB.cars.indexOf(c),x:+c.x.toFixed(2),z:+c.z.toFixed(2),d:+d.toFixed(1),hh:typeof c.hh==='number'?+c.hh.toFixed(3):null})}return out.sort((a,b)=>a.d-b.d)};
G.car=i=>{const c=(HUB.cars||[])[i];return c?{T:+T.toFixed(3),x:+c.x.toFixed(2),z:+c.z.toFixed(2),dead:+(c.dead||0),pk:!!c.pk,hitT:c.hitT||0,d:+Math.hypot(c.x-RO.x,c.z-RO.z).toFixed(2)}:null};
G.nodes=()=>(HUB.nodes||[]).map(n=>[+n.x.toFixed(1),+n.z.toFixed(1),n.nb||[],n.pk?1:0,n.ab?1:0,+(n.w||8)]);
G.marks=()=>(RO.marks||[]).filter(m=>m.ev).map(m=>({x:m.x,z:m.z,kind:m.ev.kind,id:m.ev.id||'',name:String(m.ev.name||m.ev.t||'').slice(0,40),dyn:!!m.dyn,d:Math.round(Math.hypot(m.x-RO.x,m.z-RO.z))})).sort((a,b)=>a.d-b.d).slice(0,40);
// pure collider lookup (no side effects): used only to SEE where a wall is, like a player looking ahead
G.wallAhead=(a,R)=>{for(let r=2;r<=R;r+=1){const x=RO.x+Math.sin(a)*r,z=RO.z+Math.cos(a)*r;let b=null;try{b=roamHit(x,z,.6,RO.y+.5)}catch(e){return -1}if(b)return r}return 0};
G.sample=dt=>{const x=RO.x,z=RO.z,P=G.P||{x,z,v:RO.v};const mv=Math.hypot(x-P.x,z-P.z),warp=mv>12;
 const drop=(Math.abs(P.v)-Math.abs(RO.v))*3.6;if(!warp&&drop>G.maxDrop)G.maxDrop=drop;
 let cf;try{const d=new THREE.Vector3();camera.getWorldDirection(d);cf=[camera.position.x,camera.position.z,d.x,d.z]}catch(e){cf=[x,z,Math.sin(RO.h),Math.cos(RO.h)]}
 let n40=0;const live=new Set();
 if(state==='roam'&&RO.on)for(const c of HUB.cars||[]){if(!isFinite(c.x+c.z))continue;const alive=!(c.dead>0)&&!c.pk,dd=Math.hypot(c.x-x,c.z-z);if(alive&&dd<40)n40++;if(state==='roam'&&RO.on){const bi=c.pk?5:c.dead>0?6:dd<40?0:dd<80?1:dd<150?2:dd<300?3:4;G.hb[bi]++;if(!c.pk&&!(c.dead>0)&&dd<150&&(c.cv||0)<1)G.hb[7]++}live.add(c);const p=G.CP.get(c);
  if(alive&&dd<60&&dd>6&&!warp&&!(c.hitT>0)){const vx=c.x-cf[0],vz=c.z-cf[1],vd=Math.hypot(vx,vz)||1,view=(vx*cf[2]+vz*cf[3])/vd>.64;
   if(view&&G.LR){const L=G.LR,rx=c.lrx||0,rz=c.lrz||0,hx=c.thx||0,hz=c.thz||0,lat=Math.abs(-rx*hz+rz*hx);L.n++;if(lat>2){L.g2++;c.ghLT=(c.ghLT||0)+dt;if(c.ghLT>3)L.long++}else c.ghLT=0;if(lat>4)L.g4++;if(lat>L.mx){L.mx=+lat.toFixed(2);L.why='k'+c.k+' '+c.a+'>'+c.b+'@'+(+c.t).toFixed(2)+' d'+dd.toFixed(0)}}
   if(view&&p&&p.alive){const j=Math.hypot(c.x-p.x,c.z-p.z);if(j>2)G.pops.push({T:+T.toFixed(1),kind:'jump',m:+j.toFixed(1),d:+dd.toFixed(0),x:+c.x.toFixed(0),z:+c.z.toFixed(0),why:'k'+c.k+' '+p.a+'>'+p.b+'@'+p.t+' -> '+c.a+'>'+c.b+'@'+(+c.t).toFixed(2)+' cv'+(c.cv||0).toFixed(1)+(c.dgw&&T-c.dgT<.2?' w:'+c.dgw:'')})}
   else if(view&&p&&!p.alive&&dd<40)G.pops.push({T:+T.toFixed(1),kind:'appear',m:0,d:+dd.toFixed(0),x:+c.x.toFixed(0),z:+c.z.toFixed(0)})}
  G.CP.set(c,{x:c.x,z:c.z,alive,a:c.a,b:c.b,t:(+c.t).toFixed(2)})}
 if(state==='roam'&&RO.on){G.n40+=n40;G.n40s++}
 G.P={x,z,v:RO.v}};
G.step=(n,dt)=>{for(let i=0;i<n;i++){G.vt+=dt*1000;const q=G.q;G.q=[];for(const cb of q){try{cb(G.vt)}catch(e){G.err=String(e&&e.stack||e).replace(/\s+/g," ").replace(/ at [^ ]* \(https:\/\/cdn[^)]*\)/g,"").slice(0,500)}}G.frames++;try{G.sample(dt)}catch(e){G.serr=String(e).slice(0,120)}}
 try{const m=performance.memory&&performance.memory.usedJSHeapSize;if(m>G.mem)G.mem=m}catch(e){}return G.read()};
G.pullPops=()=>{const p=G.pops;G.pops=[];return p};
G.resetStats=()=>{G.hb=[0,0,0,0,0,0,0,0];G.n40=0;G.n40s=0;G.maxDrop=0;G.pops=[];G.LR={n:0,g2:0,g4:0,mx:0,why:'',long:0}};
// world-r30b reads (no writes): mark icons + their drawn opacity, drawn objects inside the car body / at the lens (WRG_inside = the GO world/* scan), tall props, scattered flocks vs the camera height
G.mk=k=>(RO.marks||[]).filter(m=>k==='quest'?m.kind==='quest'&&m.ev&&!m.dyn&&!markLocked(m)&&!markDone(m):m.kind===k).map(m=>({x:m.x,z:m.z,id:(m.ev&&m.ev.id)||m.id||'',op:m.sp?+m.sp.material.opacity.toFixed(2):null,d:Math.round(Math.hypot(m.x-RO.x,m.z-RO.z))})).sort((a,b)=>a.d-b.d).slice(0,8);
const WV=new THREE.Vector3(),WM=new THREE.Matrix4(),WI=new THREE.Matrix4(),WB=new THREE.Box3(),WP=new THREE.Vector3();
const carM=o=>{const MG=new Set((RO.marks||[]).map(m=>m.g).filter(Boolean));let q=o;while(q){if(q===(pl&&pl.mesh)||MG.has(q)||q.userData&&(q.userData.carG!==undefined||q.userData.sky))return true;q=q.parent}return false};   // the car, the sky and the beacons themselves are not 'objects in the car'
// drawn objects (visible meshes / instanced slots, their own bounding box) that hold one of the points; read-only (same rule as GO world/*); buildings (> 6 m or building layers) are tagged 'bld'
const inside=(pts,R)=>{const out=[];scene.traverse(o=>{if(!(o.isMesh||o.isInstancedMesh)||!o.geometry||carM(o))return;let v=true,q=o;while(q){if(!q.visible){v=false;break}q=q.parent}if(!v)return;const g=o.geometry,bb=g.boundingBox;if(!bb)return;const sz=bb.getSize(WV).clone();if(!o.isInstancedMesh&&sz.length()>16)return;
  const hit=mw=>{WI.copy(mw).invert();WB.copy(bb).expandByScalar(.05);return pts.some(p=>WB.containsPoint(WP.copy(p).applyMatrix4(WI)))},tag=mw=>{const e=mw.elements,w=Math.max(sz.x*Math.hypot(e[0],e[1],e[2]),sz.y*Math.hypot(e[4],e[5],e[6]),sz.z*Math.hypot(e[8],e[9],e[10])),pu=o.parent&&o.parent.userData||{};return(w>6||'bvL' in pu||'athB' in pu?'bld ':'')+(o.name||o.type)+'<'+(o.parent&&(o.parent.name||o.parent.type))+'{'+Object.keys(pu).slice(0,3)+'}{'+Object.keys(o.userData).slice(0,3)+'} '+w.toFixed(1)+'m'};
  if(o.isInstancedMesh){const a=o.instanceMatrix.array;for(let i=0;i<o.count;i++){const e=i*16;if(a[e]===0&&a[e+5]===0&&a[e+10]===0)continue;WM.fromArray(a,e).premultiply(o.matrixWorld);WV.setFromMatrixPosition(WM);if(WV.distanceTo(pts[0])>R)continue;if(hit(WM))out.push(tag(WM))}}
  else{o.getWorldPosition(WV);if(WV.distanceTo(pts[0])<=R&&hit(o.matrixWorld))out.push(tag(o.matrixWorld))}});return out};
G.over=()=>{try{const fx=Math.sin(RO.h),fz=Math.cos(RO.h),P=[-1.6,0,1.6].map(a=>new THREE.Vector3(RO.x+fx*a,RO.y+.8,RO.z+fz*a));return inside(P,12)}catch(e){return['err '+String(e).slice(0,40)]}};
G.camIn=()=>{try{return inside([camera.position.clone()],10)}catch(e){return['err '+String(e).slice(0,40)]}};
G.props=()=>{const L=[];for(const l of HUB.pgrid.values())for(const p of l){if(!p.im||p.alive===false||p.t==='lamp'||CVF_RX.test(p.t))continue;const g=p.im.geometry;if(!g.boundingBox||g.boundingBox.max.y-g.boundingBox.min.y<1.6)continue;const d=Math.hypot(p.x-RO.x,p.z-RO.z);if(d>30&&d<220)L.push({x:p.x,z:p.z,t:p.t,d:Math.round(d)})}return L.sort((a,b)=>a.d-b.d).slice(0,6)};
G.flock=()=>{const B=window.LV&&LV.birds||(typeof LV!=='undefined'&&LV.birds);if(!B)return null;const c=camera.position;let n=0,band=0,dmin=1e9,fl=0;for(const F of B.fl){if(!F.on||F.st!==2||F.gull)continue;fl++;for(const b of F.b){const hd=Math.hypot(b.x-c.x,b.z-c.z);if(hd>60)continue;n++;if(hd<45&&Math.abs(b.y-c.y)<2.5)band++;dmin=Math.min(dmin,hd)}}return{fl,n,band,dmin:Math.round(dmin)}};
return 'ok'})()`;
// visible-element boxes: buttons the thumbs use, and every visible text/HUD element
const VIS=String.raw`(()=>{const v=e=>{if(!e)return null;const r=e.getBoundingClientRect();if(r.width<4||r.height<4)return null;let n=e;while(n&&n!==document.body){const s=getComputedStyle(n);if(n.hidden||s.display==='none'||s.visibility==='hidden'||+s.opacity<.05)return null;n=n.parentElement}if(r.right<=0||r.bottom<=0||r.left>=innerWidth||r.top>=innerHeight)return null;return [r.left,r.top,r.width,r.height]};
 const B={};for(const id of ['tL','tR','tG','tB','tN','tD','tF','tP','tU','tW','tM3']){const b=v(document.getElementById(id));if(b)B[id]=b}
 const ids={};for(const id of ['menu','ld2','roam','roamPrompt','roamCard','roamPause','results','pause','npcSay','touch','hud','m1Cs','storyGo','rcGo','ob2Play']){ids[id]=!!v(document.getElementById(id))}
 const txt=[];const TB=new Set(Object.keys(B).map(k=>document.getElementById(k)));
 for(const e of document.querySelectorAll('body *')){if(e.closest('#touch'))continue;if(e.children.length&&![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))continue;const t=(e.textContent||'').trim();if(t.length<1)continue;const b=v(e);if(!b)continue;const fs=parseFloat(getComputedStyle(e).fontSize)||0;txt.push({id:e.id||(e.parentElement&&e.parentElement.id)||e.tagName,t:t.replace(/\s+/g,' ').slice(0,60),b,fs})}
 const btn=[...document.querySelectorAll('button')].map(e=>({id:e.id,t:(e.textContent||'').trim().replace(/\s+/g,' ').slice(0,30),b:v(e),dp:e.dataset.p||''})).filter(x=>x.b);
 return {B,ids,txt,btn,W:innerWidth,H:innerHeight}})()`;

// ---------- player ----------
class Player{
 constructor(ctx,p,cdp){this.ctx=ctx;this.p=p;this.cdp=cdp;this.pts=new Map();this.nid=1;this.B={};this.lastBrake=0;this.errs=[];this.reloads=0;this.st=null}
 ev(s){return this.p.evaluate(s=>__tk.q(s),s)}
 async vis(){const v=await this.p.evaluate(VIS);this.B=v.B;return v}
 async touch(type,pts){await this.cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts})}
 async down(k){if(this.pts.has(k))return;let b=this.B[k];if(!b){await this.vis();b=this.B[k]}if(!b)return false;if(k==='tB'&&Date.now()-this.lastBrake<420&&Math.abs(this.st?this.st.v:0)<20)await this.p.waitForTimeout(420);if(k==='tB')this.lastBrake=Date.now();
  const pt={x:b[0]+b[2]/2,y:b[1]+b[3]/2,id:this.nid++};this.pts.set(k,pt);await this.touch('touchStart',[...this.pts.values()]);return true}
 async up(k){const pt=this.pts.get(k);if(!pt)return;this.pts.delete(k);await this.touch('touchEnd',[pt])}
 async set(want){for(const k of [...this.pts.keys()])if(!want.includes(k))await this.up(k);for(const k of want)if(!this.pts.has(k))await this.down(k)}
 async allUp(){for(const k of [...this.pts.keys()])await this.up(k)}
 async tapSel(sel){const b=await this.p.locator(sel).first().boundingBox().catch(()=>null);if(!b||b.width<2)return false;await this.p.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);return true}
 async tapText(re){const v=await this.vis();const b=v.btn.find(x=>re.test(x.t));if(!b)return false;await this.p.touchscreen.tap(b.b[0]+b.b[2]/2,b.b[1]+b.b[3]/2);return b.t}
 async step(n){this.st=await this.ev(`__GH.step(${n},${DT})`);return this.st}
 // run the sim for `sec` game seconds; policy(st) returns the list of buttons to hold (or 'stop')
 async run(sec,policy,chunk=3){const t0=this.st?this.st.T:0;let st=this.st||await this.step(1);const end=st.T+sec;let guard=0;
  while(st.T<end&&guard++<sec*40){const w=await policy(st);if(w==='stop')break;await this.set(w||[]);st=await this.step(chunk);if(st.st!=='roam'&&st.st!=='race'&&st.st!=='countdown'&&!policy.any)break}
  return st}
 async shot(name,draw=true){const f=path.join(OUT,name+'.jpg');try{if(draw){await this.ev('__GH.draw=true;0');await this.step(2)}await this.p.screenshot({path:f,type:'jpeg',quality:72,timeout:120000});if(draw)await this.ev('__GH.draw=false;0')}catch(e){console.log('WARN shot '+name+' '+String(e).slice(0,80));return ''}return f}
}
const W=a=>Math.atan2(Math.sin(a),Math.cos(a));
// measured (row steer/buttons): ◀ makes RO.h grow (+x is screen-left with the camera looking down +z), ▶ makes it shrink
const steer=(st,a,dead=.06)=>{const e=W(a-st.h);return e>dead?['tL']:e<-dead?['tR']:[]};
// speed hold with GAS / BRAKE like a thumb would
const pace=(st,kmh)=>st.v<kmh-3?['tG']:st.v>kmh+10?['tB']:[];

// ---------- road follower (reads the street graph = the streets the player sees) ----------
function Router(nodes){const N=nodes,ok=i=>N[i]&&!N[i][3]&&!N[i][4];
 // pure pursuit on the nearest street segment: aim 12-25 m ahead along it; at its end take the branch with the smallest turn (or toward a goal)
 const near=st=>{let b=null;for(let i=0;i<N.length;i++){const n=N[i];if(!ok(i)||Math.abs(n[0]-st.x)>90||Math.abs(n[1]-st.z)>90)continue;for(const j of n[2]){if(!ok(j)||j<i&&N[j][2].includes(i))continue;const m=N[j],dx=m[0]-n[0],dz=m[1]-n[1],L2=dx*dx+dz*dz;if(L2<1)continue;let t=((st.x-n[0])*dx+(st.z-n[1])*dz)/L2;t=Math.max(0,Math.min(1,t));const d=Math.hypot(n[0]+dx*t-st.x,n[1]+dz*t-st.z);if(!b||d<b.d)b={i,j,t,d,w:Math.max(n[5],m[5])}}}return b};
 return{N,choice:{},
 seg(st){const s=near(st);if(!s)return null;let a=s.i,b=s.j,t=s.t;const n=N[a],m=N[b];if((m[0]-n[0])*Math.sin(st.h)+(m[1]-n[1])*Math.cos(st.h)<0){[a,b]=[b,a];t=1-t}return{a,b,t,d:s.d,w:s.w}},
 pick(a,b,h,goal){const k=a+'>'+b;if(this.choice[k]!=null)return this.choice[k];const m=N[b];let best=null,bs=1e9;for(const j of m[2]){if(j===a||!ok(j))continue;const q=N[j],ang=Math.atan2(q[0]-m[0],q[1]-m[1]),turn=Math.abs(W(ang-h));if(turn>2.4)continue;const sc=goal?Math.hypot(q[0]-goal[0],q[1]-goal[1])+turn*15:turn+RNG()*.9;if(sc<bs){bs=sc;best=j}}this.choice[k]=best;return best},
 aim(st,goal){const s=this.seg(st);if(!s)return st.h;const n=N[s.a],m=N[s.b],L=Math.hypot(m[0]-n[0],m[1]-n[1]),rem=L*(1-s.t),look=12+Math.abs(st.v)/3.6*.6;this.bend=0;
  if(rem>=look){const f=(L*s.t+look)/L;return Math.atan2(n[0]+(m[0]-n[0])*f-st.x,n[1]+(m[1]-n[1])*f-st.z)}
  const h=Math.atan2(m[0]-n[0],m[1]-n[1]),j=this.pick(s.a,s.b,h,goal);if(j==null)return Math.atan2(m[0]-st.x,m[1]-st.z);
  const q=N[j],L2=Math.hypot(q[0]-m[0],q[1]-m[1])||1,f=Math.min(1,(look-rem)/L2);this.bend=Math.abs(W(Math.atan2(q[0]-m[0],q[1]-m[1])-h));
  return Math.atan2(m[0]+(q[0]-m[0])*f-st.x,m[1]+(q[1]-m[1])*f-st.z)},
 // a thumb slows for a bend: cruise kmh, 30 km/h into a bend > 0.6 rad
 drive(st,kmh=55,goal){const a=this.aim(st,goal),e=Math.abs(W(a-st.h));return[...pace(st,e>.6||this.bend>.6?30:kmh),...steer(st,a)]},
 off(st){const s=near(st);return s?s.d-s.w/2:99}}}

// ---------- scenarios ----------
async function bootPlayer(b,base,{w=852,h=393,label='fra',throttle=THR,init=null}={}){
 const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:2,isMobile:true,hasTouch:true,userAgent:IPHONE_UA});if(init)await ctx.addInitScript(init);
 const p=await ctx.newPage();p.setDefaultTimeout(300000);const cdp=await ctx.newCDPSession(p);const P=new Player(ctx,p,cdp);
 p.on('pageerror',e=>{P.errs.push(String(e).slice(0,160));if(process.env.GSTACK)console.log('STACK '+String(e.stack||e).replace(/\s+/g,' ').slice(0,700))});p.on('console',m=>{if(m.type()==='error')P.errs.push('console: '+m.text().slice(0,160))});
 let loads=0;p.on('load',()=>{loads++;if(loads>1)P.reloads++});
 if(throttle>1)await cdp.send('Emulation.setCPUThrottlingRate',{rate:throttle});
 const tg=Date.now();await p.goto(base);
 await p.waitForSelector('#ob2Play',{state:'visible',timeout:420000});const tPlayVis=(Date.now()-tg)/1000;await p.waitForTimeout(800);
 // sampler (read-only): #menu / #ld2 visibility and car control, every 40 ms and every frame (tools/tHrBoot.js)
 await p.evaluate(()=>{const v=e=>{if(!e)return false;const r=e.getBoundingClientRect();if(r.width<4||r.height<4)return false;let n=e;while(n&&n!==document.body){const s=getComputedStyle(n);if(n.hidden||s.display==='none'||s.visibility==='hidden'||+s.opacity<.05)return false;n=n.parentElement}return true};
  const S=window.__gbS=[];const f=()=>{let R=null;try{R=__tk.q('typeof RO!=="undefined"?{on:RO.on,fz:RO.frozen,bh:RO.bootHold}:null')}catch(e){}S.push({t:Math.round(performance.now()),menu:v(document.getElementById('menu')),ld:v(document.getElementById('ld2')),ctl:!!(R&&R.on&&!R.fz&&!R.bh)})};
  window.__gbI=setInterval(f,40);const g=()=>{if(window.__gbStop)return;f();requestAnimationFrame(g)};requestAnimationFrame(g);
  window.__gbClick=0;document.getElementById('ob2Play').addEventListener('click',()=>{window.__gbClick=Math.round(performance.now())},true)});
 const welcome=await P.shot(label+'_0_title',false);
 await P.tapSel('#ob2Play');
 await p.waitForFunction(()=>window.__gbClick>0,null,{polling:100,timeout:60000}).catch(()=>{});
 const tTap=await p.evaluate(()=>window.__gbClick);const R0={};
 const ok=await p.waitForFunction(t=>window.__gbS?__gbS.some(s=>s.t>t&&s.ctl):!!(window.__tk&&__tk.q('typeof RO!=="undefined"&&RO.on&&!RO.frozen&&!RO.bootHold')),tTap,{polling:250,timeout:600000}).then(()=>true).catch(()=>false);
 await p.waitForTimeout(1200);await p.evaluate(()=>{window.__gbStop=1;clearInterval(window.__gbI)});
 const S=((await p.evaluate(()=>window.__gbS))||[]).filter(s=>s.t>=tTap);R0.lost=!S.length;const first=S.find(s=>s.ctl);
 const R={...R0,tPlayVis,ok,toCtl:first?(first.t-tTap)/1000:null,menuN:S.filter(s=>s.menu).length,ldCtlN:S.filter(s=>s.ctl&&s.ld).length,welcome};
 R.ctlShot=await P.shot(label+'_1_first_control',false);
 return {P,R}}

async function harness(P){const r=await P.ev(HARNESS);await P.cdp.send('Emulation.setCPUThrottlingRate',{rate:1});await P.ev('__GH.capture();0');await P.p.waitForTimeout(300);await P.step(2);return r}

// HUD/text over the touch buttons, and text smaller than 12 px
function hudCheck(v,tag){const out={over:[],small:[]};const ov=(a,b)=>Math.max(0,Math.min(a[0]+a[2],b[0]+b[2])-Math.max(a[0],b[0]))*Math.max(0,Math.min(a[1]+a[3],b[1]+b[3])-Math.max(a[1],b[1]));
 for(const t of v.txt){for(const k in v.B){const o=ov(t.b,v.B[k]);if(o>16)out.over.push(`${tag}: "${t.t.slice(0,28)}" (#${t.id}) over ${k} ${Math.round(o)} px²`)}if(t.fs&&t.fs<12)out.small.push(`${tag}: "${t.t.slice(0,24)}" (#${t.id}) ${t.fs}px`)}return out}

async function scDrive(P,router){await P.ev('__GH.resetStats();0');const s0=await P.step(1);let gasT=0,slowT=0,stuck=0,rev=0,shot=null,km=0,last=s0,vs=[],offN=0,offR=0;
 const pol=async st=>{const dv=Math.hypot(st.x-last.x,st.z-last.z);if(dv<20)km+=dv/1000;last=st;vs.push(st.v);
  if(rev>0){rev-=DT*3;return['tB',...(RNG()<.5?['tL']:[])]}
  if(st.v<3){stuck+=DT*3;if(stuck>2){stuck=0;rev=1.5;}}else stuck=0;
  if(process.env.GDEBUG&&offN%20===0){const sg=router.seg(st);console.log('DBG',JSON.stringify({held:[...P.pts.keys()],x:st.x,z:st.z,h:st.h,v:st.v,sg,aim:+router.aim(st).toFixed(2),off:+router.off(st).toFixed(1)}))}
  gasT+=DT*3;if(st.v<10)slowT+=DT*3;offN++;if(router.off(st)>1.5)offR++;
  if(!shot&&st.v>=30){const c=await P.ev('__GH.cars(40).length');if(c>=1)shot='take'}
  return router.drive(st)};
 let st=s0;for(let k=0;k<12&&st.T-s0.T<120;k++){st=await P.run(10,pol);if(shot==='take'){shot=await P.shot('fra_2_street_at_speed')}}
 const pops=await P.ev('__GH.pullPops()'),n40=await P.ev('__GH.n40s?__GH.n40/__GH.n40s:0');
 const avg=vs.reduce((a,b)=>a+b,0)/Math.max(1,vs.length);
 row('drive/time','2 min street drive, gas held, following streets',`${(st.T-s0.T).toFixed(0)} s game, ${km.toFixed(2)} km, avg ${avg.toFixed(0)} km/h`,'>= 110 s game and >= 1.0 km',st.T-s0.T>=110&&km>=1,shot&&shot!=='take'?shot:'');
 row('drive/frustration','time under 10 km/h with GAS held',`${(100*slowT/Math.max(gasT,1)).toFixed(0)} %`,'<= 15 % (bughunt frustration limit)',100*slowT/Math.max(gasT,1)<=15,'');
 const jumps=pops.filter(q=>q.kind==='jump'),app=pops.filter(q=>q.kind==='appear');
 row('drive/pop','traffic car pops on screen (in view, 6-60 m)',`${jumps.length} jumps > 2 m, ${app.length} appear < 40 m`,'0 jumps > 2 m; 0 appear < 40 m',jumps.length===0&&app.length===0,'',pops.slice(0,3).map(q=>`${q.kind} ${q.m}m@${q.d}m T${q.T}${q.why?' ('+q.why+')':''}`).join('; '));
 row('drive/onStreet','bot check: share of the drive on a street (a bot off the street makes the drive rows meaningless)',`${(100-100*offR/Math.max(offN,1)).toFixed(0)} %`,'>= 80 % (script validity)',100-100*offR/Math.max(offN,1)>=80,'');
 {const L=await P.ev('__GH.LR');if(L)row('drive/offLane','in-view traffic sideways off its lane (junction hand-off residual, 6-60 m; REVIEW_2K_30 rev/latres)',`>2 m ${(100*L.g2/Math.max(1,L.n)).toFixed(1)} %, >4 m ${(100*L.g4/Math.max(1,L.n)).toFixed(2)} % of ${L.n} samples, ${L.long} samples > 2 m for > 3 s, max ${L.mx} m (${L.why})`,'INFO',null,'')}
 const hb=await P.ev('__GH.hb.map(v=>v/Math.max(1,__GH.n40s))');row('drive/near','traffic near the player (HITRUN_GAP gap 8)',`${n40.toFixed(1)} cars within 40 m (avg)`,'>= 2.5 (hr/near)',n40>=2.5,'',`avg cars per frame by distance: <40 ${hb[0].toFixed(1)}, 40-80 ${hb[1].toFixed(1)}, 80-150 ${hb[2].toFixed(1)}, 150-300 ${hb[3].toFixed(1)}, >300 ${hb[4].toFixed(1)}; parked ${hb[5].toFixed(1)}, dead ${hb[6].toFixed(1)}; standing (<150 m, cv<1) ${hb[7].toFixed(1)}; ${await P.ev('`cars ${HUB.cars.length}, hour ${(FL_time()*24).toFixed(1)}, hourK ${QS_hourK().toFixed(2)}, trHour ${TUNE.trHour}`')}; far(>240 m) cars: ${await P.ev('(()=>{const o={n:0,route:0,tr:0,pk:0,dead:0,noPop:0,ok:0};for(const c of HUB.cars){if(Math.hypot(c.x-RO.x,c.z-RO.z)<240)continue;o.n++;if(c.route)o.route++;else if(c.tr)o.tr++;else if(c.pk)o.pk++;else if(c.dead>0)o.dead++;else if(!HT_canPop(c.x,c.z,c.y))o.noPop++;else o.ok++}return JSON.stringify(o)+" held "+HT_POP.held+" law "+HT_POP.on+" lvTraf "+TUNE.lvTraf+" trFar "+LV_trFar()+(typeof TRR!=="undefined"?" ring "+JSON.stringify(TRR.n):"")+(typeof HT_RS!=="undefined"?" rc "+JSON.stringify(HT_RS)+" rdRev "+(RD_US.rev|0):"")})()')}`);
 return st}

// ◀ / ▶ each turn the car: hold GAS 2.5 s, then GAS+◀ 1.2 s, straighten, GAS+▶ 1.2 s; heading change per side
async function scSteer(P,router){const out={};const dbg=process.env.GDEBUG;
 for(const k of ['tL','tR','tL','tR']){let st=await onStraight(P,router,45);if(st.bad){(out[k]=out[k]||[]).push({dh:0,v0:st.v,bad:1});continue}const h0=st.h,v0=st.v;let tr=[];
  st=await P.run(1.2,async s=>{if(dbg)tr.push((await P.ev('[+(TOUCH.steer||0).toFixed(2),TOUCH.dir]')).join('/')+' h'+s.h.toFixed(2));return['tG',k]},1);
  const dh=W(st.h-h0)*57.3;(out[k]=out[k]||[]).push({dh:+dh.toFixed(0),v0});if(dbg)console.log('DBG steer',k,v0,dh.toFixed(1),tr.filter((x,i)=>i%4===0).join(' '));await P.allUp()}
 const okL=out.tL.every(x=>!x.bad&&x.dh>20),okR=out.tR.every(x=>!x.bad&&x.dh<-20);
 row('steer/buttons','hold GAS + ◀ (or ▶) for 1.2 s at ~30-50 km/h turns the car that way',`◀ ${out.tL.map(x=>'left '+x.dh+'°').join(', ')} · ▶ ${out.tR.map(x=>'right '+(-x.dh)+'°').join(', ')}`,'each >= 20° the pressed way',okL&&okR,'',out.tL.concat(out.tR).map(x=>(x.bad?'no setup (script) at ':'from ')+x.v0+' km/h').join(', '))}

async function scHits(P,router){const res=[];const shots=[];
 for(let k=0;k<5;k++){// a traffic car 12-70 m ahead within ±60°: drive at it, catching up if it drives away, ~40 km/h in the last 15 m
  let st=P.st,tgt=null;for(let tries=0;tries<20&&!tgt;tries++){const c1=await P.ev('__GH.cars(70)');st=await P.run(.3,s=>router.drive(s));const c2=await P.ev('__GH.cars(70)');const fx=Math.sin(st.h),fz=Math.cos(st.h);const cand=c2.map(c=>{const o=c1.find(q=>q.i===c.i);if(!o)return null;const vx=(c.x-o.x)/.3,vz=(c.z-o.z)/.3;return{...c,along:vx*fx+vz*fz}}).filter(c=>c&&c.d>12&&c.d<70&&Math.abs(W(Math.atan2(c.x-st.x,c.z-st.z)-st.h))<1.0);tgt=cand.find(c=>c.along<6)||(tries>=8?cand.find(c=>c.along<12):null);if(!tgt)st=await P.run(1.5,s=>router.drive(s))}
  if(!tgt){res.push({ok:false,minD:null,why:'no car in front'});continue}
  const t0=st.T,hp0=st.hp;let minD=1e9,contact=null,vAt12=null,vC=null,prev=null,velB=null,velA=null,gone=null;
  while(st.T-t0<12){const c=await P.ev(`__GH.car(${tgt.i})`);if(!c)break;if(prev&&Math.hypot(c.x-prev.x,c.z-prev.z)>15){if(!contact&&prev.d<7){contact={T:st.T,d:prev.d,smash:1};vC=st.v;velA=[99,99];velB=[0,0]}else if(!contact)gone=prev.d;break}
   if(prev&&c.T>prev.T){const vx=(c.x-prev.x)/(c.T-prev.T),vz=(c.z-prev.z)/(c.T-prev.T);if(!contact)velB=[vx,vz];else if(st.T-contact.T>.3&&!velA)velA=[vx,vz]}prev=c;
   minD=Math.min(minD,c.d);if(vAt12==null&&c.d<12)vAt12=st.v;
   if(!contact&&c.d<6){contact={T:st.T,d:c.d};vC=st.v;shots[k]=await P.shot(`fra_3_hit_${k+1}`)}
   if(contact&&velA)break;if(contact&&st.T-contact.T>1.2)break;
   const a=Math.atan2(c.x-st.x,c.z-st.z);await P.set([...(c.d>18?pace(st,c.d>30?65:45):['tG']),...steer(st,a,.04)]);st=await P.step(2)}/* last 18 m: GAS held, never BRAKE, so any speed lost before contact is the game's */
  const dv=velB&&velA?Math.hypot(velA[0]-velB[0],velA[1]-velB[1]):0;
  res.push({ok:!!contact,gone,minD:+minD.toFixed(1),vAt12,vC,dv:+dv.toFixed(1),react:!!contact&&dv>2,hp:+(hp0-st.hp).toFixed(1)});
  await P.allUp();st=await P.run(1,s=>['tB']);st=await P.run(2,s=>router.drive(s))}
 const n=res.filter(r=>r.ok).length,re=res.filter(r=>r.react).length;
 row('hit/contact','nose into 5 traffic cars ahead that close on me (oncoming/slower), GAS held in the last 18 m',`${n}/5 contacts`,'>= 4/5 (hr/hit: contact in >= 9/10)',n>=4,shots.find(Boolean)||'',res.map(r=>r.ok?`hit at ${r.vC} km/h`:r.minD==null?'no car in front':r.gone!=null?`target vanished at ${r.gone} m`:`miss, closest ${r.minD} m`).join(', '));
 row('hit/react','hit car reacts: its HUB position velocity changes > 2 m/s within 0.3-1.2 s',`${re}/${n} contacts`,'INFO: this read misses thrown cars (shots show them tumbling); judge by the hit shots',null,'',res.filter(r=>r.ok).map(r=>'Δv '+r.dv+' m/s').join(', '));
 const slow=res.filter(r=>r.ok&&r.vAt12>0).map(r=>100*(1-r.vC/r.vAt12));
 row('hit/noBrake','our speed lost between 12 m and contact (no braking against nothing)',slow.length?`max ${Math.max(...slow).toFixed(0)} %`:'n/a (no contact)','<= 5 % (HITRUN_GAP gap 1)',slow.length?Math.max(...slow)<=5:false,'');
 return res}

async function onStraight(P,router,kmh){let st=P.st;for(let i=0;i<60;i++){st=await P.run(.5,s=>router.drive(s,kmh+4));if(st.v>=kmh-6&&st.v<=kmh+12&&Math.abs(W(router.aim(st)-st.h))<.3)return st}st.bad=1;return st}
async function scDrift(P,router){const D=[],T=[];let shot='';
 for(let k=0;k<3;k++){let st=await onStraight(P,router,52);if(st.bad){D.push({bad:1,v0:st.v});continue}const v0=st.v,t0=st.T;let peak=0,s=k%2?'tR':'tL';
  st=await P.run(1.4,x=>{peak=Math.max(peak,Math.abs(W(x.h-x.vh)));return['tB',s]});if(!shot)shot=await P.shot('fra_4_drift_'+(k+1));
  await P.allUp();D.push({v0,peak:+(peak*57.3).toFixed(1),vEnd:st.v})}
 for(let k=0;k<3;k++){let st=await onStraight(P,router,50);if(st.bad){T.push({bad:1});continue}let peak=0;const s=k%2?'tR':'tL';
  st=await P.run(.5,x=>{peak=Math.max(peak,Math.abs(W(x.h-x.vh)));return['tG',s]});
  st=await P.run(.15,x=>{peak=Math.max(peak,Math.abs(W(x.h-x.vh)));return['tB',s]},1);
  st=await P.run(1.2,x=>{peak=Math.max(peak,Math.abs(W(x.h-x.vh)));return['tG',s]});await P.allUp();T.push({peak:+(peak*57.3).toFixed(1)})}
 const dOk=D.filter(d=>!d.bad&&d.peak>=15).length,dBad=D.filter(d=>d.bad).length,tB=T.filter(t=>t.bad).length;
 row('drift/start','BRAKE + steer at ~50 km/h starts a drift',`${dOk}/3 (peak slip ${D.map(d=>d.bad?'no setup':d.peak+'°').join(', ')})`,'3/3 with slip >= 15°',dOk===3,shot,(dBad?dBad+' setups never reached 46-64 km/h (script) · ':'')+D.filter(d=>!d.bad).map(d=>`${d.v0}->${d.vEnd} km/h`).join(', '));
 const tBad=T.filter(t=>!t.bad&&t.peak>8).length;
 row('drift/tap','a 0.15 s BRAKE tap in a corner never slides',`${tBad}/${3-tB} slid (peak ${T.map(t=>t.bad?'no setup':t.peak+'°').join(', ')})`,'0 slid, 3 valid setups',tBad===0&&tB===0,'')}

async function scWalls(P,router){const G=[],H=[];let shots=[];
 const one=async(ang,kind,idx)=>{for(let a=0;a<6;a++){let st=await onStraight(P,router,kind==='head'?45:40);const side=RNG()<.5?-1:1;const road=router.aim(st);const tgt=road+side*ang;
   if(st.bad)continue;const wd=await P.ev(`__GH.wallAhead(${tgt},45)`);if(!(wd>7)){await P.run(2,s=>router.drive(s));continue}
   // turn onto the wall line with ◀/▶, then hold GAS straight at it
   st=await P.run(2,s=>Math.abs(W(tgt-s.h))<.05?'stop':[...pace(s,kind==='head'?45:40),...steer(s,tgt,.03)]);
   const hp0=st.hp;let vb=null,hit=null,va=null,peakDrop=0;const t0=st.T;let prev=st;const sx=st.x,sz=st.z;
   while(st.T-t0<6){st=await P.step(1);const drop=prev.v-st.v;if(!hit&&drop>2.5&&st.v<prev.v&&Math.hypot(st.x-sx,st.z-sz)>=wd-3.5){hit={T:st.T};vb=prev.v;if(vb<(kind==='head'?30:25)){hit=null;break}shots[idx]=await P.shot(`fra_5_${kind}_${idx+1}`)}if(hit&&st.T-hit.T>=.5){va=st.v;break}if(!hit){const k=Math.abs(W(tgt-st.h))>.04?steer(st,tgt,.03):[];await P.set([...pace(st,kind==='head'?45:40),...k])}else await P.set(['tG']);prev=st}
   await P.allUp();if(!hit)continue;st=await P.run(1.2,s=>['tB']);await P.allUp();st=await P.run(1.5,s=>router.drive(s));
   if(!hit)continue;return{ang:Math.round(ang*57.3),vb:+vb.toFixed(0),va:+(va??st.v).toFixed(0),keep:Math.round(100*(va??0)/Math.max(vb,1)),hp:+(hp0-st.hp).toFixed(1),dist:wd}}return null};
 const angs=[.35,.5,.65,.78];for(let i=0;i<4;i++)G.push(await one(angs[i],'glance',i));for(let i=0;i<2;i++)H.push(await one(1.45,'head',i));
 const g=G.filter(Boolean),h=H.filter(Boolean),gOk=g.filter(x=>x.keep>=60&&x.hp<=0).length;
 row('wall/glance','glance a wall at 20-45° at ~40 km/h',`${gOk}/4 keep >= 60 % & no damage (${g.map(x=>x.ang+'° '+x.vb+' km/h '+x.keep+'% -'+x.hp+'hp').join(', ')||'no wall reached'}${G.length-g.length?'; '+(G.length-g.length)+' not set up (script)':''})`,'4/4',gOk===4,shots.slice(0,4).find(Boolean)||'');
 const hOk=h.filter(x=>x.keep<=35).length;
 row('wall/headon','head-on into a wall at ~45 km/h slows hard',`${hOk}/2 (${h.map(x=>x.vb+'->'+x.va+' km/h -'+x.hp+'hp').join(', ')||'no wall reached'}${H.length-h.length?'; '+(H.length-h.length)+' not set up (script)':''})`,'2/2 keep <= 35 %',hOk===2,shots.slice(4).find(Boolean)||'')}

async function scMission(P,router){let marks=await P.ev('__GH.marks()');const QK=['quest','collect','smash','wall','drift','speed','longjump','chase','deliver','taxi','photo','stunt','escort','ball','checkpoint'],m=marks.find(q=>['quest','collect'].includes(q.kind)&&!q.dyn&&q.d<400)||marks.filter(q=>QK.includes(q.kind)&&!q.dyn).sort((a,b)=>a.d-b.d)[0]/* a quest / challenge card at any distance, never a race-mode card */||marks.find(q=>!q.dyn&&!['garage','flight','nav','pit','gate','chase'].includes(q.kind));/* a static beacon (quest / stud rush) first: a chase van drives off */
 if(!m){row('mission/reach','drive to the nearest mission marker','no marker','reached <= 60 s game',false,'');return}
 let st=P.st;const t0=st.T;let card=false,stuck=0,rev=0;const goal=[m.x,m.z];
 let tapped=0;while(st.T-t0<90&&!card){st=await P.run(1,s=>{if(rev>0){rev-=DT*3;return['tB','tL']}const d=Math.hypot(goal[0]-s.x,goal[1]-s.z);if(d<9)return s.v>2?['tB']:[];/* stop in the beacon */if(s.v<3){stuck+=DT*3;if(stuck>2){stuck=0;rev=1.2}}else stuck=0;const a=d<150?Math.atan2(goal[0]-s.x,goal[1]-s.z):router.aim(s,goal);return[...pace(s,d<40?25:45),...steer(s,a)]/* within 150 m a player turns to the beacon and drives straight at it */});
  let v=await P.vis();if(v.ids.roamPrompt&&!st.card){await P.allUp();if(await P.tapSel('#roamPrompt'))tapped++;await P.step(6);v=await P.vis()}
  card=st.card||v.ids.roamCard||v.ids.rcGo||st.ch;if(process.env.GDEBUG)console.log('DBG mission',JSON.stringify({d:Math.round(Math.hypot(goal[0]-st.x,goal[1]-st.z)),v:st.v,card:st.card,ch:st.ch,ids:Object.keys(v.ids).filter(k=>v.ids[k]).join(',')}))}
 await P.allUp();
 row('mission/reach',`drive to the nearest mission marker (${m.kind} "${m.name}", ${m.d} m)`,card?`${(st.T-t0).toFixed(0)} s game${tapped?', tapped the TAP TO OPEN prompt':', stopped in the beacon'}`:'no card in 90 s','reached <= 60 s game',card&&st.T-t0<=60,'');
 if(!card)return;
 await P.step(6);let v=await P.vis();const cardShot=await P.shot('fra_6_mission_card');
 const cardTxt=v.txt.filter(t=>/roamCard|rc|card|Card|npcSay|banner|roamTop|qv/i.test(t.id+'')).map(t=>t.t);const big=v.txt.filter(t=>t.b[2]*t.b[3]>0.3*v.W*v.H);
 const cardP=await P.p.evaluate(()=>{const c=document.querySelector('#roamCard');if(!c||c.hidden)return{h:'',t:''};const k=c.cloneNode(true);k.querySelectorAll('button').forEach(b=>b.remove());const h=k.querySelector('h4'),ht=h?h.textContent:'';if(h)h.remove();const W=x=>(x||'').replace(/\s+/g,' ').trim();return{h:W(ht),t:W(k.innerText||k.textContent)}});
 const wc=t=>t.split(/\s+/).filter(w=>/[A-Za-z0-9]/.test(w)).length,cardT=cardP.h+' | '+cardP.t;
 const words={n:wc(cardP.t),nh:wc(cardP.h),s:cardT};
 const hc=hudCheck(v,'mission card');
 row('mission/card','mission card before START: name + ONE line (buttons not counted)',`name ${words.nh} words + line ${words.n} words: "${words.s.slice(0,70)}"`,'name <= 4 words, objective line <= 6 words, nothing else (Alex: a 40-word card; Hit & Run shows 3; gui-r30a: stars, times, rewards and the long brief are behind DETAILS)',words.n<=6&&words.n>0&&words.nh>0&&words.nh<=4,cardShot);
 {const det=await P.tapText(/^DETAILS$/);await P.step(6);const dt=await P.p.evaluate(()=>{const c=document.querySelector('#roamCard');return c&&!c.hidden?(c.innerText||'').replace(/\s+/g,' ').trim():''});const dshot=await P.shot('fra_6a_mission_details');
  row('mission/details','DETAILS is one tap away and shows the stars / times / rewards',det?`${dt.split(/\s+/).length} words after the tap`:'no DETAILS button','a DETAILS tap shows > 6 words (and START is still on the card)',!!det&&dt.split(/\s+/).length>6&&/LET'?S GO|START/i.test(dt),dshot,dt.slice(0,100))}
 row('mission/cover','HUD/cards over the touch buttons at mission start',`${hc.over.length} overlaps`,'0',hc.over.length===0,cardShot,hc.over.slice(0,2).join('; '));
 // accept like a player: the big green button on the card, if there is one
 const tGo=P.st.T,acc=await P.tapText(/LET'?S GO|START|GO ▶|^GO$|ACCEPT/i);if(acc){await P.step(30)}
 {await P.step(12);/* the HUD pill is repainted on a wall-clock timer: give it a moment (script timing; the final run read it empty once) */const v3=await P.vis();const obj=v3.txt.filter(t=>t.b[1]<v3.H*.6&&!/^[\d:.\s]+$|KM\/H|❚/.test(t.t)&&/[A-Za-z]{3}/.test(t.t)).sort((a,b)=>b.b[2]*b.b[3]-a.b[2]*a.b[3])[0];const n=obj?obj.t.split(/\s+/).filter(w=>/[A-Za-z0-9]/.test(w)).length:0;const sh=await P.shot('fra_6b_mission_start');
  row('mission/objective','first objective text after START (largest text line)',obj?`${n} words: "${obj.t.slice(0,60)}"`:'none visible','<= 6 words (hr/mstart)',n>0&&n<=6,sh,v3.txt.filter(t=>t.b[1]<v3.H*.6).map(t=>t.t).join(' | ').slice(0,160))}
 {/* the coach toast (#npcSay) must be gone within 4 s: sampled every 0.5 game s for 10 s after START (wall-clock timers do not run while the harness steps, so the toast also hides on game time) */
  let first=null,last=null,toastShot='';for(let i=0;i<20;i++){const vis=await P.ev("(()=>{const e=document.getElementById('npcSay');if(!e||e.hidden)return false;const r=e.getBoundingClientRect();return r.height>0&&r.width>0})()");const t=P.st.T;if(vis){if(first==null)first=t;last=t;if(!toastShot&&t-first>=3)toastShot=await P.shot('fra_7a_toast_3s')}await P.step(15)}
  const dur=first==null?0:last-first+.5;row('mission/toast','the coach toast over the road after START',first==null?'never shown':`on screen ${dur.toFixed(1)} s game (from ${(first-tGo).toFixed(1)} s after START)`,'<= 4 s on screen (the objective lives in the one-line HUD slot)',dur<=4,toastShot)}
 st=await P.step(3);const tq=st.T;let hudShot='';let res=null,lastLeft=null;
 while(st.T-tq<200){st=await P.run(2,s=>{if(s.tx!=null){const d=Math.hypot(s.tx-s.x,s.tz-s.z);return[...pace(s,d<40?30:60),...steer(s,d<50?Math.atan2(s.tx-s.x,s.tz-s.z):router.aim(s,[s.tx,s.tz]))]}return router.drive(s)});
  if(!hudShot&&st.ch&&st.T-tq>4)hudShot=await P.shot('fra_7_mission_hud');lastLeft=st.chLeft;
  if(!st.ch){v=await P.vis();const rb=v.btn.find(b=>/RETRY/i.test(b.t));const done=v.txt.some(t=>/COMPLETE|STARS?|★|WELL DONE|DELIVERED|FINISH/i.test(t.t));res={over:true,retry:!!rb,done,txt:v.txt.map(t=>t.t).filter(t=>t.length>3).slice(0,6).join(' | ')};break}}
 await P.allUp();
 if(!res){row('mission/end','mission ends (complete, or a fail screen)',`still running after ${(st.T-tq).toFixed(0)} s game (left ${lastLeft})`,'ends <= 200 s game',false,hudShot);return}
 const endShot=await P.shot('fra_8_mission_end');
 if(res.done&&!res.retry){row('mission/end','mission completes',`completed in ${(st.T-tq).toFixed(0)} s game`,'complete, or fail + RETRY works',true,endShot,res.txt.slice(0,120));return}
 row('mission/end','mission ends with a fail screen that offers RETRY',res.retry?'fail screen with RETRY':'no RETRY button','RETRY visible',res.retry,endShot,res.txt.slice(0,120));
 if(res.retry){const tr=st.T,wr=Date.now();await P.tapText(/RETRY/i);let ok=false;for(let i=0;i<40;i++){st=await P.step(3);if(st.ch&&st.on&&!st.fz){ok=true;break}await P.p.waitForTimeout(100)}
  row('mission/retry','RETRY from the fail screen puts me back in the mission',ok?`${(st.T-tr).toFixed(1)} s game, ${((Date.now()-wr)/1000).toFixed(1)} s lab`:'mission not restarted','back driving <= 2 s game',ok&&st.T-tr<=2,'');
  if(ok){await P.run(3,s=>router.drive(s));await P.allUp();const ab=await P.ev('0');void ab}}}

// world-r30b (REVIEW_2K_28): the world rows by real input only: the garage icon on approach, 3 quest STARTs, a kiosk glance, a pigeon flock at speed. Opt-in: --only world
async function scWorld(P,router){
 const closeCard=async()=>{for(let i=0;i<3;i++){const v=await P.vis();if(!(v.ids.roamCard||v.ids.rcGo))break;await P.allUp();if(!await P.tapText(/^LATER$|NOT NOW|CLOSE|^✕$/i))break;await P.step(6)}};await closeCard();
 const go=async(goal,stopR,maxS,kmh,each)=>{let st=P.st,stuck=0,rev=0;const t0=st.T;while(st.T-t0<maxS){st=await P.run(.5,s=>{if(rev>0){rev-=DT*3;return['tB','tL']}const d=Math.hypot(goal[0]-s.x,goal[1]-s.z);if(d<stopR)return s.v>2?['tB']:[];if(s.v<3){stuck+=DT*3;if(stuck>2){stuck=0;rev=1.2}}else stuck=0;const a=d<150?Math.atan2(goal[0]-s.x,goal[1]-s.z):router.aim(s,goal);return[...pace(s,d<25?15:d<60?Math.min(kmh,30):kmh),...steer(s,a)]});const d=Math.hypot(goal[0]-st.x,goal[1]-st.z);if(each&&await each(st,d))break;if(d<stopR&&st.v<2)break}await P.allUp();return st};
 // 1 garage icon: opacity read + shots at 40 / 25 / 12 m on a real approach
 {const g=(await P.ev('__GH.mk("garage")'))[0];const ops={},sh={};if(g){await go([g.x,g.z],9,80,45,async(st,d)=>{for(const k of[40,25,12])if(d<=k&&ops[k]==null){const m=(await P.ev('__GH.mk("garage")'))[0];ops[k]=m?m.op:null;sh[k]=await P.shot('world_garage_'+k+'m')}return ops[12]!=null})}
  const v=[ops[25],ops[12]].filter(x=>x!=null);row('world/pickup','drive at the garage 🔧: the icon is readable on the way into its ring',g?`opacity 40 m ${ops[40]} · 25 m ${ops[25]} · 12 m ${ops[12]}`:'no garage marker','>= 0.75 at 25 m and 12 m (REVIEW_2K_28: 0.31 at 26 m)',v.length===2&&Math.min(...v)>=.75,sh[25]||sh[40]||'')}
 // 2 three quests: stop in the beacon, open, LET'S GO, look at the car; abandon with ✕
 {let n=0,started=0,over=0;const ex=[],shots=[],notes=[];const tried=new Set();for(let k=0;k<3;k++){const q=(await P.ev('__GH.mk("quest")')).find(m=>!tried.has(m.id)&&m.d<700);if(!q)break;tried.add(q.id);n++;
   let st=await go([q.x,q.z],7,100,45,async(st,d)=>{if(d<12){const v=await P.vis();if(v.ids.roamPrompt&&!st.card){await P.allUp();await P.tapSel('#roamPrompt');await P.step(6)}const s2=await P.step(1);return s2.card||s2.ch}return false});
   st=await P.step(6);for(let w=0;w<10&&!(st.card||st.ch);w++){const v=await P.vis();if(v.ids.roamPrompt){await P.tapSel('#roamPrompt');await P.step(6)}else{await P.p.waitForTimeout(500)/* the TAP TO OPEN prompt runs on a wall-clock timer */;const d=Math.hypot(q.x-st.x,q.z-st.z);await P.run(.3,s=>d>6?[...pace(s,8),...steer(s,Math.atan2(q.x-s.x,q.z-s.z))]:(s.v>1?['tB']:[]))}st=await P.step(1)}
   const opened=st.card||st.ch,acc=await P.tapText(/LET'?S GO|START|GO ▶|^GO$|ACCEPT/i);await P.step(30);st=await P.step(1);if(st.ch)started++;notes.push(q.id+` d${Math.round(Math.hypot(q.x-st.x,q.z-st.z))}m v${Math.round(st.v)}`+(opened?' opened':' no card')+(acc?' tapped '+acc:'')+(st.ch?' started':''));const o=await P.ev('__GH.over()');over+=o.length;if(o.length)ex.push(q.id+':'+o.slice(0,2).join('+'));shots.push(await P.shot('world_quest'+(k+1)+'_start'));
   if(st.ch){await P.tapSel('#qAbn');await P.step(10);await P.tapText(/ABANDON|YES|QUIT|OK/i).catch(()=>0);await P.step(20)}void acc}
  row('world/quests','3 quests started by real input (beacon, prompt, LET\'S GO): anything drawn inside my car?',`${started}/${n} started, ${over} objects in the car body${ex.length?' ('+ex.join(', ')+')':''}`,'3/3 started, 0 (gauntlet seen/prop-on-car)',started>=3&&over===0,shots[0]||'',notes.join('; '))}
 // 3 kiosk glance: drive past a tall street prop 2.5 m to its side at ~40 km/h; every step: is the lens inside anything drawn?
 {const pr=(await P.ev('__GH.props()'))[0];let fr=0,inside=0,bldF=0,sh='',best=1e9;const ex=[];if(pr){let st=P.st;const a=Math.atan2(pr.x-st.x,pr.z-st.z),gx=pr.x+Math.cos(a)*2.5,gz=pr.z-Math.sin(a)*2.5;
   st=await go([gx-Math.sin(a)*30,gz-Math.cos(a)*30],6,60,40);const t0=st.T;while(st.T-t0<6){st=await P.run(.2,s=>[...pace(s,40),...steer(s,Math.atan2(gx+Math.sin(a)*20-s.x,gz+Math.cos(a)*20-s.z))]);const d=Math.hypot(pr.x-st.x,pr.z-st.z);const c0=await P.ev('__GH.camIn()'),c=c0.filter(x=>!/^bld /.test(x));fr++;if(c0.length>c.length)bldF++;if(c.length){inside++;if(ex.length<3)ex.push(c[0])}if(d<best){best=d;if(d<8)sh=await P.shot('world_glance_kiosk')}if(d>best+15)break}await P.allUp()}
  row('world/glance','drive past a kiosk/sign/stall 2.5 m to its side at ~40 km/h: the lens inside a drawn object',pr?`${inside}/${fr} frames inside a prop (${pr.t}, closest ${best.toFixed(1)} m)${ex.length?' '+ex.join(','):''}; ${bldF} frames inside a building (INFO)`:'no tall prop','0 frames (gauntlet seen/camera-in-props)',!!pr&&fr>5&&inside===0,sh)}
 // 4 birds at speed: drive the streets at ~70 km/h until a flock scatters ahead; band = birds at camera height (+-2.5 m, < 45 m)
 {let st=P.st;const t0=st.T;let sh='',n=0,band=0,seen=0;while(st.T-t0<90&&seen<6){st=await P.run(.5,s=>router.drive(s,70));const f=await P.ev('__GH.flock()');if(f&&f.fl&&f.n){if(st.v>=55){n+=f.n;band+=f.band;seen++;if(!sh)sh=await P.shot('world_birds_speed')}}}await P.allUp();
  row('world/birds','scattered pigeons seen from the car at >= 55 km/h (real drive)',seen?`${band}/${n} bird samples at camera height (${(100*band/Math.max(1,n)).toFixed(0)} %), ${seen} samples`:'no flock scattered in 90 s','<= 10 % at camera height (REVIEW_2K_28: grey drones 3-8 m up)',seen>0&&band/Math.max(1,n)<=.1,sh)}}
async function scPause(P){let st=await P.run(1.5,s=>['tG']);await P.allUp();await P.tapSel('#tP');await P.step(6);let v=await P.vis();const open=v.ids.roamPause||v.ids.pause;
 const c0=await P.ev('__GH.cars(80)');const a=await P.step(1);st=await P.step(30);const c1=await P.ev('__GH.cars(80)');const carMv=Math.hypot(st.x-a.x,st.z-a.z);
 const trMv=Math.max(0,...c0.map(c=>{const o=c1.find(q=>q.i===c.i);return o?Math.hypot(o.x-c.x,o.z-c.z):0}));const frozen=carMv<.05&&trMv<.05;
 const sh=await P.shot('fra_9_pause');
 await P.tapText(/RESUME/);await P.step(6);v=await P.vis();const closed=!v.ids.roamPause&&!v.ids.pause;const b=await P.step(1);await P.down('tG');st=await P.step(30);await P.up('tG');const moved=Math.hypot(st.x-b.x,st.z-b.z)>.3;
 row('pause/resume','❚❚ opens pause (car + traffic stand still for 1 s), ▶ RESUME drives on',`open ${!!open}, car moved ${carMv.toFixed(2)} m, traffic moved ${trMv.toFixed(2)} m, resumed ${closed&&moved}`,'open, 0 m / 0 m, resumed',!!open&&frozen&&closed&&moved,sh)}

async function scRace(P){// pause -> QUIT TO TITLE -> 🏁 RACES -> START, then race with ◀ ▶ GAS like a player
 await P.allUp();await P.tapSel('#tP');await P.step(6);let q=await P.tapText(/QUIT TO TITLE/);await P.release?.();
 await P.ev('__GH.release();0');await P.p.waitForTimeout(3000);
 let v=await P.vis();let r=v.btn.some(x=>/START RACE/.test(x.t))?'already on CHOOSE TRACK':await P.tapText(/RACES/);if(!r){await P.p.waitForTimeout(4000);r=await P.tapText(/RACES/)}
 await P.p.waitForTimeout(2500);const menuShot=await P.shot('fra_10_race_menu',false);
 {const tl=await P.p.evaluate(()=>[...document.querySelectorAll('#tracks .trk')].filter(e=>e.offsetParent).map(e=>{const c=e.querySelector('canvas'),b=e.querySelector('b'),fs=b?parseFloat(getComputedStyle(b).fontSize):0;let ink=0,comp=0;if(c){try{const W=c.width,H=c.height,d=c.getContext('2d').getImageData(0,0,W,H).data,w=W>>1,h=H>>1,m=new Uint8Array(w*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*2*W+x*2)*4;if(d[i]+d[i+1]+d[i+2]>180){m[y*w+x]=1;ink++}}/* connected pieces of the neon line (8-neighbour); a track outline is 1-4 pieces, dashes are dozens */for(let k=0;k<m.length;k++)if(m[k]===1){let n=0;const st=[k];m[k]=2;while(st.length){const q=st.pop();n++;const qx=q%w,qy=(q/w)|0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const X=qx+dx,Y=qy+dy;if(X<0||Y<0||X>=w||Y>=h)continue;const j=Y*w+X;if(m[j]===1){m[j]=2;st.push(j)}}}if(n>=4)comp++}}catch(x){}}let hid=false;if(b){const r=b.getBoundingClientRect();if(r.bottom>innerHeight+1){hid=true;for(let a=e.parentElement;a;a=a.parentElement){const oy=getComputedStyle(a).overflowY;if((oy==='auto'||oy==='scroll')&&a.scrollHeight>a.clientHeight+1){hid=false;break}}}}return{n:(b?b.textContent:'').trim(),fs,ink,comp,hid,cut:b?(b.scrollWidth>b.clientWidth+1||b.scrollHeight>b.clientHeight+1||getComputedStyle(b).textOverflow==='ellipsis'&&b.scrollWidth>b.clientWidth):true,img:!!c}}));
  const bad=tl.filter(t=>!t.img||t.ink<150||t.comp>4||t.hid||t.cut||t.fs<12);row('menu/tiles','every race tile has a preview image and its full name at >= 12 px',`${tl.length-bad.length}/${tl.length} tiles ok`+(bad.length?` (bad: ${bad.slice(0,4).map(t=>t.n+(t.img?'':' no preview')+(t.ink<150?' blank':'')+(t.comp>4?' '+t.comp+' pieces':'')+(t.hid?' below the screen, no scroll':'')+(t.cut?' cut':'')+(t.fs<12?' '+t.fs+'px':'')).join(', ')})`:''),'0 tiles blank, cut, < 12 px, drawn as > 4 separate pieces, or with a name below the screen and no scroll container (gui-r30a, REVIEW_2K_27)',tl.length>=8&&bad.length===0,menuShot)}
 const s=await P.tapSel('#startBtn');
 if(!q||!s){row('race/start','pause → QUIT TO TITLE → RACES → START',`quit ${!!q} races ${r} start ${s}`,'all taps land',false,menuShot);return}
 await P.p.waitForTimeout(1500);await P.ev('__GH.capture();0');let st=await P.step(3);
 for(let i=0;i<200&&st.st!=='countdown'&&st.st!=='race';i++){st=await P.step(3);if(i%10===0)await P.ev('__GH.release();0').then(()=>P.p.waitForTimeout(400)).then(()=>P.ev('__GH.capture();0'))}
 row('race/start','pause → QUIT TO TITLE → RACES → START reaches the grid',st.st,'countdown or race',st.st==='countdown'||st.st==='race',menuShot);
 if(st.st!=='countdown'&&st.st!=='race')return;
 st=await P.run(6,x=>x.st==='race'?'stop':['tG']);const startShot=await P.shot('fra_11_race_start');const t0=st.T;let maxLap=0;
 let outT=0;const pol=x=>{if(x.st==='finished'||x.st==='results')return'stop';if(x.st!=='race'){outT+=DT*3;return outT>3?'stop':[]}outT=0;const R=x.race;if(!R)return['tG'];maxLap=Math.max(maxLap,R.lap||0);const want=Math.max(-.35,Math.min(.35,-R.x*.06));const e=want-R.yaw;return['tG',...(e>.04?['tR']:e<-.04?['tL']:[])]};
 pol.any=true;st=await P.run(480,pol,3);await P.allUp();
 let v2=await P.vis();for(let i=0;i<60&&!v2.ids.results;i++){st=await P.step(9);v2=await P.vis()}/* the finish cam runs at 0.2x: results after ~12 s game */
 const finShot=await P.shot('fra_12_race_finish');
 row('race/finish','race finishes with a result screen',v2.ids.results?`results after ${(st.T-t0).toFixed(0)} s game`:`no results (state ${st.st}, lap ${maxLap}, ${(st.T-t0).toFixed(0)} s game)`,'#results visible <= 480 s game',!!v2.ids.results,finShot,(v2.txt.find(t=>/PLACE|ST|ND|RD|TH/.test(t.t))||{t:''}).t)}

// ---------- main ----------
// --report-only: rebuild REPORT.md from rows.json + SEEN.md (after looking at the shots), no browser
if(arg('report-only',false)){for(const r of JSON.parse(fs.readFileSync(path.join(OUT,'rows.json'),'utf8')).filter(r=>!r.id.startsWith('seen/'))){ROWS.push(r)}finish(null,null)}else
(async()=>{let srv=null,base=URL0;if(!base){const[s,port]=await serve(path.join(ROOT,BUILD));srv=s;base=`http://127.0.0.1:${port}/index.html`}
 const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required','--disable-background-timer-throttling','--disable-renderer-backgrounding']});
 console.log(`gauntlet ${VER} · phone profile (iPhone UA, 852x393 touch, dpr 2, ${THR}x CPU for boot) · ${base}`);
 let P=null,errsAll=[],reloads=0,mem=0;
 try{
  const B=await bootPlayer(b,base,{label:'fra'});P=B.P;const R=B.R;
  row('boot/playVisible','page open → PLAY button visible',`${R.tPlayVis.toFixed(1)} s lab`,'INFO (lab, software GL)',null,R.welcome);
  row('boot/toControl','PLAY tap → first control of the car',R.toCtl!=null?`${R.toCtl.toFixed(1)} s lab (${THR}x CPU)`:'never','<= 8 s lab',R.toCtl!=null&&R.toCtl<=8,R.ctlShot);
  row('boot/menu','race menu never shows after PLAY (hr/boot)',`${R.menuN} samples`,'0',R.menuN===0,'');
  row('boot/loader','loader never covers a controllable car (hr/boot)',`${R.ldCtlN} samples`,'0',R.ldCtlN===0,'');
  let v=await P.vis();let hc=hudCheck(v,'first control');
  row('hud/overControls','HUD text over the touch buttons (first control)',`${hc.over.length} overlaps`,'0',hc.over.length===0,R.ctlShot,hc.over.slice(0,2).join('; '));
  row('hud/minText','smallest visible text (first control)',`${hc.small.length} items < 12 px`,'0 (CLAUDE.md: 12 px minimum)',hc.small.length===0,'',hc.small.slice(0,3).join('; '));
  if(on('perf')){// real clock, real render, 6x CPU: frame intervals while GAS is held for 8 s lab
   await P.ev(String.raw`(()=>{const F=window.__gbF=[];let l=performance.now();const g=n=>{F.push(n-l);l=n;if(F.length<4000&&!window.__gbFs)requestAnimationFrame(g)};requestAnimationFrame(g);return 0})()`);
   await P.down('tG');await P.p.waitForTimeout(8000);await P.up('tG');await P.ev('window.__gbFs=1;0');const F=(await P.ev('window.__gbF')).slice(2).sort((a,b)=>a-b);
   const p95=F.length?F[Math.floor(F.length*.95)]:0,long=F.filter(x=>x>50).length;
   row('perf/frame','frame time while driving (real clock, 6x CPU, software GL)',`p95 ${p95.toFixed(0)} ms, ${long}/${F.length} frames > 50 ms`,'INFO (lab GL; iPhone truth = perf/ios-reveal)',null,'')}
  await harness(P);const router=Router(await P.ev('__GH.nodes()'));
  if(on('world'))await scWorld(P,router);   // world-r30b: first, from the spawn (garage 66 m, quests near); its rows do not depend on the later parts
  if(on('steer'))await scSteer(P,router);
  if(on('drive'))await scDrive(P,router);
  if(on('hit'))await scHits(P,router);
  if(on('drift'))await scDrift(P,router);
  if(on('wall'))await scWalls(P,router);
  if(on('pause'))await scPause(P);
  if(on('mission'))await scMission(P,router);
  v=await P.vis();hc=hudCheck(v,'after missions');
  row('hud/overControls2','HUD text over the touch buttons (later in roam)',`${hc.over.length} overlaps`,'0',hc.over.length===0,'',hc.over.slice(0,2).join('; '));
  if(on('race'))await scRace(P);
  mem=Math.max(mem,await P.ev('__GH.mem').catch(()=>0));errsAll.push(...P.errs);reloads+=P.reloads;
  const ge=await P.ev('[__GH.err||"",__GH.serr||""]').catch(()=>['','']);if(ge[0])errsAll.push('frame threw: '+ge[0]);if(ge[1])console.log('WARN sampler: '+ge[1]);
  await P.ctx.close()}catch(e){row('run/fra','Frankfurt run finished without a script error',String(e).split('\n')[0].slice(0,120),'no error',false,'');if(P){errsAll.push(...P.errs);reloads+=P.reloads;await P.shot('fra_script_error',false);await P.ctx.close().catch(()=>{})}}
 if(on('ath')){let A=null;try{const BA=await bootPlayer(b,base,{label:'ath',init:()=>{try{if(!localStorage.getItem('gauntlet_seed')){/* exactly what cityTravel() writes before its reload: the save of a player who flew to Athens */localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({otg:{},studs:[],tut:1}));localStorage.setItem('mho_roam.ath@1',JSON.stringify({otg:{},studs:[],tut:1}));localStorage.setItem('mho_city@1','ath');localStorage.setItem('gauntlet_seed','1')}}catch(e){}}});A=BA.P;
   const city=await A.ev('CID');row('ath/boot','Athens: PLAY → first control',BA.R.toCtl!=null?`${BA.R.toCtl.toFixed(1)} s lab, city ${city}`:'never','control, city ath',BA.R.toCtl!=null&&city==='ath',BA.R.ctlShot);
   await harness(A);const r2=Router(await A.ev('__GH.nodes()'));await A.ev('__GH.resetStats();0');let st=await A.step(1);const t0=st.T;let stuck=0,rev=0,slow=0,n=0;
   st=await A.run(60,s=>{n++;if(s.v<10)slow++;if(rev>0){rev-=DT*3;return['tB','tL']}if(s.v<3){stuck+=DT*3;if(stuck>2){stuck=0;rev=1.5;}}else stuck=0;return r2.drive(s)});await A.allUp();
   const sh=await A.shot('ath_2_drive');const pops=await A.ev('__GH.pullPops()');
   row('ath/drive','Athens: 60 s drive following streets',`${(st.T-t0).toFixed(0)} s game, ${Math.round(100*slow/Math.max(n,1))} % under 10 km/h, ${pops.filter(p=>p.kind==='jump').length} pops`,'>= 55 s, <= 15 % slow, 0 pops',st.T-t0>=55&&slow/Math.max(n,1)<=.15&&!pops.some(p=>p.kind==='jump'),sh);
   await A.allUp();await A.tapSel('#tP');await A.step(6);const q=await A.tapText(/QUIT TO TITLE/);await A.ev('__GH.release();0');await A.p.waitForTimeout(3000);const r=(await A.vis()).btn.some(x=>/START RACE/.test(x.t))?'menu':await A.tapText(/RACES/);await A.p.waitForTimeout(2500);const s=await A.tapSel('#startBtn');
   let ok=false;for(let i=0;i<60&&!ok;i++){await A.p.waitForTimeout(1000);const x=await A.ev('state');ok=x==='countdown'||x==='race'}
   const rs=await A.shot('ath_3_race_start',false);row('ath/race','Athens: pause → QUIT → RACES → START reaches the grid',`quit ${!!q} races ${!!r} start ${s} grid ${ok}`,'grid reached',ok,rs);
   mem=Math.max(mem,await A.ev('__GH.mem').catch(()=>0));errsAll.push(...A.errs.map(e=>'ath '+e));reloads+=A.reloads;await A.ctx.close()}catch(e){row('run/ath','Athens run finished without a script error',String(e).split('\n')[0].slice(0,120),'no error',false,'');if(A){errsAll.push(...A.errs);reloads+=A.reloads;await A.shot('ath_script_error',false);await A.ctx.close().catch(()=>{})}}}
 if(on('portrait')){let Q=null;try{const BQ=await bootPlayer(b,base,{w:390,h:844,label:'portrait',throttle:1});Q=BQ.P;const v=await Q.vis();const hc=hudCheck(v,'portrait');
   row('portrait/boot','portrait 390x844: PLAY → control (1x CPU)',BQ.R.toCtl!=null?`${BQ.R.toCtl.toFixed(1)} s lab`:'never','control reached',BQ.R.toCtl!=null,BQ.R.ctlShot);
   {const f=path.join(ROOT,BQ.R.ctlShot?path.relative(ROOT,BQ.R.ctlShot):'');let lum=-1;try{const cp=require('child_process'),[W,H]=cp.execSync(`identify -format "%w %h" "${f}"`).toString().split(' ').map(Number);lum=+cp.execSync(`convert "${f}" -crop ${W}x${Math.round(H*.04)}+0+${Math.round(H*.84)} -colorspace Gray -resize 1x1! -format "%[fx:mean*255]" info:`).toString()}catch(e){}
    row('portrait/band','portrait: the 3D view reaches the bottom of the screen (no flat pale band under the road)',lum<0?'no shot':`mean brightness of the 84-88 % rows ${lum.toFixed(0)}`,'< 140 (the beta.164 band measures 174: pale blue, no road; gui-r30a near-plane fix)',lum>=0&&lum<140,BQ.R.ctlShot)}
   row('portrait/hud','portrait: HUD text over the touch buttons',`${hc.over.length} overlaps, ${hc.small.length} texts < 12 px`,'0 / 0',hc.over.length===0&&hc.small.length===0,BQ.R.ctlShot,[...hc.over,...hc.small].slice(0,2).join('; '));
   errsAll.push(...Q.errs.map(e=>'portrait '+e));reloads+=Q.reloads;await Q.ctx.close()}catch(e){row('run/portrait','portrait run finished without a script error',String(e).split('\n')[0].slice(0,120),'no error',false,'');if(Q)await Q.ctx.close().catch(()=>{})}}
 row('page/reload','page never reloads',`${reloads} reloads`,'0',reloads===0,'');
 row('page/jsErrors','no JS errors (pageerror + console.error)',`${errsAll.length} errors`,'0',errsAll.length===0,'',errsAll.slice(0,3).join(' ; ').slice(0,200));
 row('page/memory','JS heap high-water (performance.memory)',`${(mem/1048576).toFixed(0)} MB`,'INFO (phone cap 700 MB process, NIGHTRUN_LOG)',null,'');
 await finish(b,srv)})();

async function finish(b,srv){
 // rows from LOOKING at the shots: docs/shots/gauntlet/<ver>/SEEN.md, one '- id | what I saw | shot file' line each (a person or the lane writes it after looking; it stays until the thing is fixed)
 try{for(const l of fs.readFileSync(path.join(OUT,'SEEN.md'),'utf8').split('\n')){const m=/^- ([^|]+)\|([^|]+)\|\s*(\S*)/.exec(l);if(m)row('seen/'+m[1].trim(),m[2].trim(),'seen in the shot','nothing sloppy on screen',false,m[3]?path.join(OUT,m[3]):'')}}catch(e){}
 if(b)await b.close();if(srv)srv.close();
 const fails=ROWS.filter(r=>r.pass==='FAIL').length,MF=path.join(OUT,'meta.json');let meta={when:new Date().toISOString().slice(0,16)+'Z',cmd:'node tools/gauntlet.js '+A.join(' '),wall:wall()};if(b)fs.writeFileSync(MF,JSON.stringify(meta));else try{meta=JSON.parse(fs.readFileSync(MF,'utf8'));meta.cmd+=' (+ SEEN.md via --report-only)'}catch(e){}
 const md=[`# Gauntlet ${VER}`,``,`${meta.when} · \`${meta.cmd}\` · ${meta.wall} s wall · **${fails} FAIL** of ${ROWS.filter(r=>r.pass!=='INFO').length} rows. How to read and extend: [docs/GAUNTLET.md](../../../GAUNTLET.md).`,``,`| row | what the player does | number | bar | result | shot |`,`|---|---|---|---|---|---|`,
  ...ROWS.map(r=>`| ${r.id} | ${r.what.replace(/\|/g,'/')} | ${r.num.replace(/\|/g,'/')}${r.note?'<br><small>'+r.note.replace(/\|/g,'/').slice(0,200)+'</small>':''} | ${r.bar.replace(/\|/g,'/')} | ${r.pass==='FAIL'?'**FAIL**':r.pass} | ${r.shot?`[${path.basename(r.shot)}](${path.basename(r.shot)})`:''} |`)].join('\n')+'\n';
 fs.writeFileSync(path.join(OUT,'REPORT.md'),md);fs.writeFileSync(path.join(OUT,'rows.json'),JSON.stringify(ROWS,null,1));
 console.log(`${fails?'FAIL':'PASS'} gauntlet ${VER} · ${fails} FAIL rows · report ${path.relative(ROOT,path.join(OUT,'REPORT.md'))} · ${wall()} s wall`);process.exit(Math.min(fails,98))}
