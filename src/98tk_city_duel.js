/* tracks-1 (2026-10-16): the first rival duel (Rossi) is an open 2K-Drive-style course through the real Frankfurt streets, not the spline-track void.
   Bockenheimer Landstraße -> SPLIT: Anlagenring (wide, fast, turbo bricks) or Neue Mainzer Straße (shorter, a ramp) -> Gutleutstraße finish with a big jump.
   Brick checkpoint arches, "?" item bricks that fire on pickup (no extra button: TURBO / BRICK BLAST / SHIELD), Rossi uses the same bricks and routes.
   Fair rival: rubber band both ways, a blast is announced 0.7 s ahead and can hit you at most once per 8 s. Hands-off: DNF 40 s after Rossi finishes or at 235 s.
   Rides on the city-sprint engine (70_roam_world.js). ?tk1=0 = old spline track. GO: tk1/route-spread, tk1/items, rv2k/race-handsoff. */
const TK={on:(()=>{try{return new URLSearchParams(location.search).get('tk1')!=='0'}catch(e){return true}})(),last:null};
const TK_C={id:'tk_rossi',p:'ROSSI',name:'Westend Split',
  start:[[1900,1005],[1304,862],[760,560]],A:[[760,560],[902,333],[880,170],[660,-33],[573,-310]],B:[[760,560],[700,560],[619,348],[616,125],[608,-105],[573,-310]],fin:[[573,-310],[922,-573],[1338,-792],[1748,-1020],[2200,-1150]],
  ramps:[['start',.5,22,5,16],['B',.45,20,5,14],['fin',.45,26,8,16]],items:[['start',.3],['start',.7],['A',.35],['A',.7],['B',.25],['B',.7],['fin',.25],['fin',.7]],boostA:[.15,.5,.85]};
function tkLeg(a,b){let best=null;for(let si=0;si<CITY_S.length;si++){const S=CITY_S[si];if(S.r.cls==='ped'||S.r.cls==='quay')continue;let ia=-1,da=40,ib=-1,db=40;
    for(let i=0;i<S.pts.length;i++){const p=S.pts[i],d1=Math.hypot(p.x-a[0],p.z-a[1]),d2=Math.hypot(p.x-b[0],p.z-b[1]);if(d1<da){da=d1;ia=i}if(d2<db){db=d2;ib=i}}
    if(ia>=0&&ib>=0&&(!best||da+db<best[0]))best=[da+db,S,ia,ib]}
  if(!best)return[a,b];const[,S,ia,ib]=best,st=ib>ia?3:-3,o=[a];for(let i=ia;st>0?i<ib:i>ib;i+=st)o.push([S.pts[i].x,S.pts[i].z]);o.push(b);return o}
function tkChain(W){const o=[];for(let k=1;k<W.length;k++)for(const p of tkLeg(W[k-1],W[k]))if(!o.length||Math.hypot(p[0]-o[o.length-1][0],p[1]-o[o.length-1][1])>2)o.push(p);return o}
function tkLen(P){let s=0;for(let i=1;i<P.length;i++)s+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);return s}
function tkAt(P,f){const L=tkLen(P)*f;let c=0;for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i],l=Math.hypot(b[0]-a[0],b[1]-a[1]);if(c+l>=L){const t=(L-c)/l;return{x:a[0]+(b[0]-a[0])*t,z:a[1]+(b[1]-a[1])*t,h:Math.atan2(b[0]-a[0],b[1]-a[1])}}c+=l}const b=P[P.length-1],a=P[P.length-2];return{x:b[0],z:b[1],h:Math.atan2(b[0]-a[0],b[1]-a[1])}}
let TK_GEO=null;function tkGeo(){if(TK_GEO)return TK_GEO;const C=TK_C,s=tkChain(C.start),A=tkChain(C.A),B=tkChain(C.B),f=tkChain(C.fin),cat=(...L)=>{const o=[];for(const P of L)for(const p of P)if(!o.length||Math.hypot(p[0]-o[o.length-1][0],p[1]-o[o.length-1][1])>2)o.push(p);return o};
  const pA=cat(s,A,f),pB=cat(s,B,f),Ls=tkLen(s),LA=tkLen(A),LB=tkLen(B);return TK_GEO={seg:{start:s,A,B,fin:f},pA,pB,Ls,LA,LB,Lf:tkLen(f),lenA:tkLen(pA),lenB:tkLen(pB)}}
// brick arch: two stacked-brick pillars, a checkered beam with studs (2K checkpoint gates are brick-built arches)
let TK_ARCH=null;function tkArchMats(){if(TK_ARCH)return TK_ARCH;const[c,g]=cv(256,64);for(let i=0;i<16;i++)for(let j=0;j<4;j++){g.fillStyle=(i+j)%2?'#111':'#fff';g.fillRect(i*16,j*16,16,16)}g.fillStyle='#ffd12c';g.fillRect(64,14,128,36);g.fillStyle='#1b1c22';g.font='900 26px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillText('CHECK',128,33);const t=tex(c);KEEP_TEX.add(t);
  const M=col=>new THREE.MeshStandardMaterial({color:col,roughness:.35,metalness:0});return TK_ARCH={beam:new THREE.MeshStandardMaterial({map:t,roughness:.4}),red:M(0xd01712),yel:M(0xffcd03),blu:M(0x0a5fbf),wht:M(0xf4f4f4),box:M(0x9b45ff),q:M(0xffffff)}}
function tkArch(x,z,h,fin){const M=tkArchMats(),G=new THREE.Group(),span=30,y0=groundAt(x,z,99);for(const sd of[-1,1])for(let k=0;k<8;k++){const b=new THREE.Mesh(new THREE.BoxGeometry(3.2,1.4,3.2),k%2?M.yel:fin?M.wht:M.red);b.position.set(sd*span/2,.7+k*1.4,0);G.add(b)}
  const beam=new THREE.Mesh(new THREE.BoxGeometry(span+3.2,3.2,3.2),M.beam);beam.position.y=11.2+1.6;G.add(beam);for(let i=-6;i<=6;i++){const s=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,.45,10),fin?M.wht:M.yel);s.position.set(i*2.4,14.6,0);G.add(s)}
  G.position.set(x,y0,z);G.rotation.y=h;return G}
function tkItemMesh(){const M=tkArchMats(),G=new THREE.Group(),b=new THREE.Mesh(new THREE.BoxGeometry(2.6,2.6,2.6),M.box);G.add(b);const[c,g]=cv(64,64);g.fillStyle='#fff';g.font='900 52px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillText('?',32,36);const t=tex(c);
  for(const r of[0,Math.PI/2,Math.PI,-Math.PI/2]){const q=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.MeshBasicMaterial({map:t,transparent:true}));q.position.set(Math.sin(r)*1.32,0,Math.cos(r)*1.32);q.rotation.y=r;G.add(q)}
  for(const sx of[-.65,.65])for(const sz of[-.65,.65]){const s=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,.35,10),M.box);s.position.set(sx,1.47,sz);G.add(s)}return G}
const TK_ITEMS=['TURBO','BRICK BLAST','SHIELD'];
function tkStart(m){const C=TK_C,Gm=tkGeo(),e={id:C.id,name:C.name,len:Gm.lenA,path:Gm.pA,ai:[C.p]};const sp={tk:1,e,m,t:0,cd:3,ai:[],objs:[],ramps0:RO.ramps.length,done:false,gi:0,items:[],pads:[],shieldT:0,hitCd:0,warn:null,fx:[]};
  if(RO.sp)sprintEnd();RO.sp=sp;RO.pop=null;RO.card=null;$('#roamCard').hidden=true;
  // gates: start line, split, rejoin, finish straight, finish (none inside the split: both routes are legal)
  const g0=tkAt(Gm.seg.start,.12),g1=tkAt(Gm.seg.start,.97),g2=tkAt(Gm.seg.fin,.04),g3=tkAt(Gm.seg.fin,.5),g4=tkAt(Gm.seg.fin,.99);
  sp.G=[[g0,Gm.Ls*.12],[g1,Gm.Ls*.97],[g2,Gm.Ls+Gm.LA+Gm.Lf*.04],[g3,Gm.Ls+Gm.LA+Gm.Lf*.5],[g4,Gm.lenA-2]].map(([q,cum],i,a)=>{const fin=i===a.length-1,mesh=tkArch(q.x,q.z,q.h,fin);RO.grp.add(mesh);sp.objs.push(mesh);return{x:q.x,z:q.z,h:q.h,cum,mesh}});
  for(const[sg,f,len,hgt,w]of C.ramps){const q=tkAt(Gm.seg[sg],f);addRamp(q.x,q.z,q.h,len,hgt,w,0xff5a1c)}
  for(const[sg,f]of C.items)for(const o of[-6,0,6]){const q=tkAt(Gm.seg[sg],f),x=q.x+Math.cos(q.h)*o,z=q.z-Math.sin(q.h)*o,g=tkItemMesh();g.position.set(x,groundAt(x,z,99)+2.2,z);RO.grp.add(g);sp.objs.push(g);sp.items.push({x,z,g,cd:0})}
  for(const f of C.boostA){const q=tkAt(Gm.seg.A,f),pad=new THREE.Mesh(new THREE.PlaneGeometry(10,14),neonMat('#4ceaff',2));pad.rotation.order='YXZ';pad.rotation.set(-Math.PI/2,q.h,0);pad.position.set(q.x,groundAt(q.x,q.z,99)+.08,q.z);RO.grp.add(pad);sp.objs.push(pad);sp.pads.push({x:q.x,z:q.z,cd:0})}
  const s0=tkAt(Gm.seg.start,0);RO.x=s0.x+Math.sin(s0.h)*4+Math.cos(s0.h)*4;RO.z=s0.z+Math.cos(s0.h)*4-Math.sin(s0.h)*4;RO.y=groundAt(RO.x,RO.z,1);RO.h=RO.vh=s0.h;RO.v=0;RO.vy=0;RO.yr=0;camSnap=true;
  const p=C.p,pd=PD[p],team=vehOf(p)||(pd?teamOf(pd):TEAMS[0]),g=shipMesh(team);RO.grp.add(g);sp.objs.push(g);
  sp.ai.push({p,name:pd?pd.full:p,g,s:4,lane:-4,v:0,base:62*diffMul(),route:Math.random()<.5?'A':'B',fin:null,item:null,itemCd:0,stun:0});
  say('RIVAL RACE · '+C.name.toUpperCase(),(pd?pd.full.toUpperCase():p)+' · 2 ROUTES · GRAB THE ? BRICKS',2);AU.sfx('pick');return sp}
function tkPath(a){const G=tkGeo();return a.route==='B'?G.pB:G.pA}
function tkPosOn(P,s){let cum=0;for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(s<=cum+L||i===P.length-1){const t=clamp((s-cum)/L,0,1),n=P[i+1],turn=n?Math.abs(angDiff(Math.atan2(n[0]-b[0],n[1]-b[1]),Math.atan2(b[0]-a[0],b[1]-a[1]))):0;return{x:a[0]+(b[0]-a[0])*t,z:a[1]+(b[1]-a[1])*t,h:Math.atan2(b[0]-a[0],b[1]-a[1]),toCorner:cum+L-s,turn}}cum+=L}}
// rival speed model, shared by the race and GO tk1/route-spread: base speed, slow for sharp corners, turbo pads on route A
function tkAiTarget(a,P,s){const q=tkPosOn(P,Math.max(0,s));let tv=a.base;if(q.turn>.5&&q.toCorner<55)tv=Math.min(tv,30);else if(q.turn>.25&&q.toCorner<45)tv=Math.min(tv,44);if(a.route==='A'&&TK.sp&&TK.sp.padT>0)tv*=1.25;return tv}
function tkFire(who,kind,sp){const a=sp.ai[0];
  if(who==='me'){if(kind==='TURBO'){RO.v=Math.max(RO.v,0)+20;RO.turbo=Math.max(RO.turbo||0,1.5);if(pl)pl.bm=100;fovKick=Math.max(fovKick,12);AU.sfx('nitro')}
    else if(kind==='SHIELD'){sp.shieldT=6;AU.sfx('pick')}
    else{if(a.fin==null&&a.s>sp.myS-20&&a.s-sp.myS<220){a.stun=1.2;a.v*=.35;feed('BRICK BLAST · '+a.name,250,'#ff2d95');AU.sfx('crash')}else feed('BRICK BLAST · missed',0,'#9fb0c0')}
    feed(kind,0,'#c46bff');return}
  if(kind==='TURBO'){a.v+=16;return}if(kind==='SHIELD')return;
  // rival blast: telegraphed, needs you ahead, one hit per 8 s, a shield blocks it
  if(sp.myS>a.s&&sp.myS-a.s<160&&sp.hitCd<=0){sp.warn=.7;say('','⚠ '+a.name.toUpperCase()+' · BRICK BLAST',.7)}}
function tkStep(dt){const sp=RO.sp,e=sp.e,G=tkGeo();RO.cool=2;TK.sp=sp;
  if(sp.cd>0){const c0=Math.ceil(sp.cd);sp.cd-=dt;RO.v=0;if(Math.ceil(sp.cd)!==c0&&sp.cd>0){say(String(Math.ceil(sp.cd)),'',.6);AU.sfx('beep')}if(sp.cd<=0){say('GO!','',.8);AU.sfx('go')}}else if(!sp.done)sp.t+=dt;
  const g=sp.G[sp.gi];if(g&&!sp.done&&sp.cd<=0&&Math.hypot(g.x-RO.x,g.z-RO.z)<19){sp.gi++;AU.sfx('pick');comboAdd(1);if(pl)pl.bm=Math.min(100,pl.bm+10);if(sp.gi>=sp.G.length)return tkFinish(false)}
  const ng=sp.G[sp.gi];if(ng)RO.wp={x:ng.x,z:ng.z,kind:'gate',name:sp.gi===sp.G.length-1?'Finish':'Checkpoint '+(sp.gi+1)+'/'+sp.G.length};
  // my progress: distance along whichever route I am nearer to (both are legal)
  let myS=0;{let bd=1e9;for(const P of[G.pA,G.pB]){let c=0;for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i],L=Math.hypot(b[0]-a[0],b[1]-a[1]),t=clamp(((RO.x-a[0])*(b[0]-a[0])+(RO.z-a[1])*(b[1]-a[1]))/(L*L||1),0,1),d=Math.hypot(a[0]+(b[0]-a[0])*t-RO.x,a[1]+(b[1]-a[1])*t-RO.z);if(d<bd){bd=d;myS=(c+L*t)/tkLen(P)}c+=L}}}
  sp.myS=myS*G.lenA;sp.shieldT=Math.max(0,sp.shieldT-dt);sp.hitCd=Math.max(0,sp.hitCd-dt);sp.padT=Math.max(0,(sp.padT||0)-dt);
  if(sp.warn!=null){sp.warn-=dt;if(sp.warn<=0){sp.warn=null;if(sp.shieldT>0)feed('SHIELD · BLOCKED',150,'#5dffb0');else{RO.v*=.55;shake=.35;sp.hitCd=8;AU.sfx('crash')}}}
  for(const pd of sp.pads){pd.cd=Math.max(0,pd.cd-dt);if(pd.cd<=0&&sp.cd<=0&&Math.hypot(pd.x-RO.x,pd.z-RO.z)<7){pd.cd=1.5;RO.v=Math.max(RO.v,0)+12;fovKick=Math.max(fovKick,8);AU.sfx('nitro')}}
  for(const it of sp.items){it.cd=Math.max(0,it.cd-dt);it.g.visible=it.cd<=0;it.g.rotation.y+=dt*2;if(it.cd>0||sp.cd>0)continue;
    if(Math.hypot(it.x-RO.x,it.z-RO.z)<4.5){it.cd=3;tkFire('me',TK_ITEMS[(sp.items.indexOf(it)+Math.floor(sp.t))%3],sp);sp.fired=(sp.fired||0)+1}}
  for(const a of sp.ai){const P=tkPath(a),Lp=tkLen(P);if(a.fin!=null&&a.s>=Lp+40)continue;a.stun=Math.max(0,a.stun-dt);a.itemCd=Math.max(0,a.itemCd-dt);
    const gap=a.s/Lp*G.lenA-sp.myS,rub=gap>150?.9:gap<-150?1.1:1;let tv=tkAiTarget(a,P,a.s)*rub;if(sp.cd>0||a.stun>0)tv=0;
    if(a.route==='A'){const q=tkPosOn(P,a.s);if(sp.pads.some(p=>Math.hypot(q.x-p.x,q.z-p.z)<8))sp.padT=1.5}
    a.v+=(tv-a.v)*Math.min(1,dt*(tv>a.v?1.6:2.5));a.s+=a.v*dt;if(a.s>=Lp&&a.fin==null){a.fin=sp.t;say('',a.name.toUpperCase()+' FINISHED',1.2)}
    const q=tkPosOn(P,Math.max(0,a.s)),x=q.x+Math.cos(q.h)*a.lane,z=q.z-Math.sin(q.h)*a.lane;
    if(a.itemCd<=0)for(const it of sp.items)if(it.cd<=0&&Math.hypot(it.x-x,it.z-z)<5){it.cd=3;a.itemCd=4;tkFire('ai',TK_ITEMS[(sp.items.indexOf(it)+1)%3],sp);break}
    a.y=groundAt(x,z,(a.y??0)+3);a.h=(a.h??q.h)+angDiff(q.h,a.h??q.h)*Math.min(1,dt*4);a.g.position.set(x,a.y,z);a.g.rotation.y=a.h+Math.PI;const ud=a.g.userData;if(ud.m)ud.m.position.y=1.6+Math.sin(T*6)*.1;if(ud.ribbons)for(const rb of ud.ribbons){rb.scale.z=6+a.v/8;rb.material.uniforms.uT.value=T}
    const d=Math.hypot(x-RO.x,z-RO.z);if(d<5.5&&d>.01&&Math.abs(a.y-RO.y)<3){const k=(5.5-d)/2;RO.x+=(RO.x-x)/d*k;RO.z+=(RO.z-z)/d*k;a.v*=.92;RO.v*=.95;AU.sfx('bump')}}
  const a=sp.ai[0],aDone=a.fin!=null;sp.place=aDone||a.s/tkLen(tkPath(a))*G.lenA>sp.myS?2:1;
  if(!sp.done&&sp.cd<=0&&(sp.t>=235||(aDone&&sp.t-a.fin>=40)))return tkFinish(true);
  sp.hud=`<b>🏁 ${e.name.toUpperCase()}</b><span>POS ${sp.place}/2 · CP ${Math.min(sp.gi,sp.G.length)}/${sp.G.length} · ${fmt(Math.max(0,sp.t))}${sp.shieldT>0?' · 🛡':''}${aDone?' · DNF in '+Math.ceil(40-(sp.t-a.fin))+' s':''}</span>`}
function tkFinish(dnf){const sp=RO.sp,a=sp.ai[0];sp.done=true;const place=dnf?2:(a.fin!=null&&a.fin<sp.t?2:1),won=place===1,stars=won?(sp.t<120?3:2):0;
  TK.last={place,t:+sp.t.toFixed(1),dnf,stars,rival:a.fin,route:a.route,fired:sp.fired||0};
  if(won){const F=flags();const nw=!F[TK_C.p];F[TK_C.p]=1;store.set('mho_flags',F);const all=store.get('mho_stars',{}),key='rival:'+TK_C.p;if((all[key]||0)<stars){all[key]=stars;store.set('mho_stars',all)}if(nw)addXP(200);logDone(key,TK_C.name,'rival',stars,fmt2(sp.t))}
  const rows=[{n:'YOU',t:dnf?null:sp.t,me:1},{n:a.name,t:a.fin}].sort((x,y)=>(x.t??1e9)-(y.t??1e9));
  const el=$('#spRes');el.hidden=false;el.innerHTML=`<h3>${won?'1ST · FLAG WON!':dnf?'DNF · '+a.name.toUpperCase()+' WINS':'2ND PLACE'}</h3><div class="st">${'★'.repeat(stars)}<i>${'★'.repeat(3-stars)}</i></div><p>${TK_C.name} · ${dnf?'did not finish':fmt2(sp.t)}</p><table>${rows.map((r,i)=>`<tr class="${r.me?'me':''}"><td>${i+1}</td><td>${r.n}</td><td>${r.t!=null?fmt2(r.t):'—'}</td></tr>`).join('')}</table><div class="rcb"><button class="go" id="spAgain">RACE AGAIN</button><button class="go alt" id="spOk">CONTINUE</button></div>`;
  AU.sfx(won?'finish':'crash');const m=sp.m;$('#spOk').onclick=()=>{el.hidden=true};$('#spAgain').onclick=()=>{el.hidden=true;tkStart(m)};sprintEnd()}
{const _st=sprintStep,_end=sprintEnd;sprintStep=function(dt){if(RO.sp&&RO.sp.tk)return tkStep(dt);return _st(dt)};
 sprintEnd=function(){const sp=RO.sp;if(sp&&sp.tk){const R=RO.ramps.splice(sp.ramps0);for(const o of RO.grp.children.slice())if(o.userData.ramp&&R.some(r=>Math.hypot(o.position.x-r.x,o.position.z-r.z)<20))RO.grp.remove(o);TK.sp=null}return _end()}}
// the first rival marker starts this course instead of the spline track
function tkWants(m){return TK.on&&CID==='fra'&&m&&m.kind==='rival'&&m.ev&&m.ev.p===TK_C.p}
{const _go=roamGo;roamGo=function(){const m=RO.card;if(tkWants(m)&&!$('#rcGo').disabled){pickAdd(m);tkStart(m);return}return _go()};$('#rcGo').onclick=roamGo}
// GO helpers (99c_checklist.js): AI time on each route with the race's own speed model, fake clock
function tkRouteTimes(){const G=tkGeo(),o={};for(const r of['A','B']){const a={base:62,route:r,v:0,s:0},P=r==='A'?G.pA:G.pB,L=tkLen(P);let t=0,pad=0;TK.sp={padT:0};const pads=TK_C.boostA.map(f=>tkAt(G.seg.A,f));
  while(a.s<L&&t<600){const dt=1/30;if(r==='A'){const q=tkPosOn(P,a.s);if(pads.some(p=>Math.hypot(q.x-p.x,q.z-p.z)<8))pad=1.5}TK.sp.padT=pad;pad=Math.max(0,pad-dt);const tv=tkAiTarget(a,P,a.s);a.v+=(tv-a.v)*Math.min(1,dt*(tv>a.v?1.6:2.5));a.s+=a.v*dt;t+=dt}
  o[r]={t:+t.toFixed(1),len:Math.round(L)}}TK.sp=null;o.spread=+(Math.abs(o.A.t-o.B.t)/Math.min(o.A.t,o.B.t)*100).toFixed(1);return o}
function tkRun(secs,drive){const sp=RO.sp;if(!sp||!sp.tk)return null;const dt=1/30;for(let i=0;i<secs*30&&RO.sp===sp;i++){if(drive)drive(sp);roamStep(dt)}return TK.last}
