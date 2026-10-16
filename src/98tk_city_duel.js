/* tracks-1/2 (2026-10-16): every rival duel, both bosses and the 6 "track" sprints are open 2K-Drive-style courses through the real Frankfurt / Athens streets, not the spline-track void.
   tracks-1: the hand-made first duel (Rossi, "Westend Split"): Bockenheimer Landstraße -> SPLIT: Anlagenring (turbo pads) | Neue Mainzer Straße -> Gutleutstraße jump.
   tracks-2: a course builder. Every other race is built at its marker from the GPS street graph (qvPath): start leg -> SPLIT (signboard) -> 2 routes -> rejoin -> finish leg.
   The builder tries a few headings / widths and keeps the pair of routes with the smallest time spread (rival speed model, turbo pads go on the slower route), ≤ 5 %.
   Courses marked off:1 send route B straight across the nearest park (grass: the car turns into the off-road buggy by itself, 98xf_xform.js).
   Brick checkpoint arches, ≥ 2 ramps on each route, "?" item bricks that fire on pickup (no extra button: TURBO / BRICK BLAST / SHIELD), rivals use the same bricks and routes.
   Fair rivals: rubber band both ways, a blast is announced 0.7 s ahead and can hit you at most once per 8 s. Hands-off: DNF 40 s after the last rival finishes or at 235 s.
   Rides on the city-sprint engine (70_roam_world.js). ?tk1=0 = old spline tracks. GO: tk1/route-spread, tk1/items, tk1/courses(-ath), rv2k/race-handsoff. */
const TK={on:(()=>{try{return new URLSearchParams(location.search).get('tk1')!=='0'}catch(e){return true}})(),last:null,C:null,built:{}};
const TK_C={id:'tk_rossi',key:'rival:ROSSI',kind:'rival',ai:['ROSSI'],p:'ROSSI',name:'Westend Split',nA:'Anlagenring',nB:'Neue Mainzer Str.',
  start:[[1900,1005],[1304,862],[760,560]],A:[[760,560],[902,333],[880,170],[660,-33],[573,-310]],B:[[760,560],[700,560],[619,348],[616,125],[608,-105],[573,-310]],fin:[[573,-310],[922,-573],[1338,-792],[1748,-1020],[2200,-1150]],
  ramps:[['start',.5,22,5,16],['B',.45,20,5,14],['fin',.45,26,8,16]],items:[['start',.3],['start',.7],['A',.35],['A',.7],['B',.25],['B',.7],['fin',.25],['fin',.7]],boost:{r:'A',f:[.15,.5,.85]}};
function tkLeg(a,b){let best=null;for(let si=0;si<CITY_S.length;si++){const S=CITY_S[si];if(S.r.cls==='ped'||S.r.cls==='quay')continue;let ia=-1,da=40,ib=-1,db=40;
    for(let i=0;i<S.pts.length;i++){const p=S.pts[i],d1=Math.hypot(p.x-a[0],p.z-a[1]),d2=Math.hypot(p.x-b[0],p.z-b[1]);if(d1<da){da=d1;ia=i}if(d2<db){db=d2;ib=i}}
    if(ia>=0&&ib>=0&&(!best||da+db<best[0]))best=[da+db,S,ia,ib]}
  if(!best)return[a,b];const[,S,ia,ib]=best,st=ib>ia?3:-3,o=[a];for(let i=ia;st>0?i<ib:i>ib;i+=st)o.push([S.pts[i].x,S.pts[i].z]);o.push(b);return o}
const tkCat=(...L)=>{const o=[];for(const P of L)for(const p of P)if(!o.length||Math.hypot(p[0]-o[o.length-1][0],p[1]-o[o.length-1][1])>2)o.push(p);return o};
function tkChain(W){const o=[];for(let k=1;k<W.length;k++)for(const p of tkLeg(W[k-1],W[k]))if(!o.length||Math.hypot(p[0]-o[o.length-1][0],p[1]-o[o.length-1][1])>2)o.push(p);return o}
function tkLen(P){let s=0;for(let i=1;i<P.length;i++)s+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);return s}
function tkAt(P,f){const L=tkLen(P)*f;let c=0;for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i],l=Math.hypot(b[0]-a[0],b[1]-a[1]);if(c+l>=L){const t=(L-c)/(l||1);return{x:a[0]+(b[0]-a[0])*t,z:a[1]+(b[1]-a[1])*t,h:Math.atan2(b[0]-a[0],b[1]-a[1])}}c+=l}const b=P[P.length-1],a=P[P.length-2];return{x:b[0],z:b[1],h:Math.atan2(b[0]-a[0],b[1]-a[1])}}
function tkGeoOf(C){if(C.geo)return C.geo;const s=C.seg?C.seg.start:tkChain(C.start),A=C.seg?C.seg.A:tkChain(C.A),B=C.seg?C.seg.B:tkChain(C.B),f=C.seg?C.seg.fin:tkChain(C.fin);
  const pA=tkCat(s,A,f),pB=tkCat(s,B,f);return C.geo={seg:{start:s,A,B,fin:f},pA,pB,Ls:tkLen(s),LA:tkLen(A),LB:tkLen(B),Lf:tkLen(f),lenA:tkLen(pA),lenB:tkLen(pB)}}
function tkGeo(){return tkGeoOf(TK.C||TK_C)}
// ---- course builder: start leg -> split -> 2 routes -> rejoin -> finish leg, all on the GPS street graph
function tkSnap(x,z){const i=qvNear(x,z,700),G=qvGraph();return i<0?null:[G.X[i],G.Z[i]]}
function tkRoad(x,z){const c=cityAt(x,z);const r=c&&c.road;return String(r&&(r.name||r.n||r.nm)||'').split(' · ')[0]}
function tkHash(s){let h=7;for(const c of s)h=(h*31+c.charCodeAt(0))>>>0;return h}
// time of a route with the rival speed model (pads only on route C.boost.r), fake clock
function tkSimTime(C,r){const G=tkGeoOf(C),P=r==='A'?G.pA:G.pB,L=tkLen(P),a={base:62,route:r,v:0,s:0},pads=C.boost&&C.boost.r===r?C.boost.f.map(f=>tkAt(G.seg[r],f)):[];let t=0,pad=0;const sv=TK.sp;TK.sp={padT:0};const sC=TK.C;TK.C=C;
  while(a.s<L&&t<600){const dt=1/15;if(pads.length){const q=tkPosOn(P,a.s);if(pads.some(p=>Math.hypot(q.x-p.x,q.z-p.z)<8))pad=1.5}TK.sp.padT=pad;pad=Math.max(0,pad-dt);const tv=tkAiTarget(a,P,a.s);a.v+=(tv-a.v)*Math.min(1,dt*(tv>a.v?1.6:2.5));a.s+=a.v*dt;t+=dt}
  TK.sp=sv;TK.C=sC;return{t:+t.toFixed(1),len:Math.round(L)}}
function tkSpread(C){const A=tkSimTime(C,'A'),B=tkSimTime(C,'B');return{A,B,spread:+(Math.abs(A.t-B.t)/Math.min(A.t,B.t)*100).toFixed(1)}}
// share of route B that runs on route A (two routes must really differ)
function tkOverlap(A,B){let n=0;for(const p of B){let d=1e9;for(const q of A){d=Math.min(d,Math.hypot(p[0]-q[0],p[1]-q[1]));if(d<14)break}if(d<14)n++}return n/Math.max(1,B.length)}
function tkBuild(spec){if(TK.built[spec.key])return TK.built[spec.key];const G=qvGraph();if(!G)return null;let cx=0,cz=0;for(let i=0;i<G.X.length;i++){cx+=G.X[i];cz+=G.Z[i]}cx/=G.X.length;cz/=G.X.length;
  if(spec.x==null||spec.auto){spec.auto=1;spec.k=spec.k||0;const h=tkHash(spec.key)+spec.k*97,ang=(h%360)*Math.PI/180+spec.k*1.3,r=Math.max(250,500+(h>>>9)%800-spec.k*120);spec.x=cx+Math.sin(ang)*r;spec.z=cz+Math.cos(ang)*r}
  const S=tkSnap(spec.x,spec.z);if(!S){if(spec.auto&&spec.k<8){spec.k++;return tkBuild(spec)}return null}const base=Math.atan2(cx-S[0],cz-S[1])+((tkHash(spec.key)%7)-3)*.25,path=(a,b)=>{const P=qvPath(a[0],a[1],b[0],b[1]);return P.map(p=>[p[0],p[1]])};let best=null;
  const park=spec.off?PARKS.map(R=>({R,d:Math.hypot((R.x0+R.x1)/2-S[0],(R.z0+R.z1)/2-S[1])})).filter(o=>o.d<2600&&Math.min(o.R.x1-o.R.x0,o.R.z1-o.R.z0)>90).sort((a,b)=>a.d-b.d)[0]:null;
  const tries=[];for(const da of[0,.5,-.5,1,-1,1.6,-1.6,2.4])for(const W of[260,180,360])tries.push([da,W]);
  for(const[da,W]of tries){const h=base+da,dx=Math.sin(h),dz=Math.cos(h),px=Math.cos(h),pz=-Math.sin(h);let X,J,F,A,B,offB=null;
    if(park&&da===0){const R=park.R,mx=(R.x0+R.x1)/2,mz=(R.z0+R.z1)/2,hx=Math.atan2(mx-S[0],mz-S[1]),ex=Math.sin(hx),ez=Math.cos(hx),hw=Math.min(R.x1-R.x0,R.z1-R.z0)/2;
      const pe=[mx-ex*(hw+5),mz-ez*(hw+5)],pq=[mx+ex*(hw+5),mz+ez*(hw+5)],e1=tkSnap(...pe),e2=tkSnap(...pq);if(!e1||!e2)continue;
      X=tkSnap(S[0]+ex*(park.d-hw)*.55,S[1]+ez*(park.d-hw)*.55);J=tkSnap(mx+ex*(hw+220),mz+ez*(hw+220));F=tkSnap(J[0]+ex*480,J[1]+ez*480);if(!X||!J||!F)continue;
      const cross=[];for(let k=0;k<=8;k++)cross.push([e1[0]+(e2[0]-e1[0])*k/8,e1[1]+(e2[1]-e1[1])*k/8]);offB=cross;B=tkCat(path(X,e1),cross,path(e2,J));A=path(X,J)}
    else{X=tkSnap(S[0]+dx*520,S[1]+dz*520);J=tkSnap(S[0]+dx*1300,S[1]+dz*1300);if(!X||!J)continue;F=tkSnap(J[0]+dx*520,J[1]+dz*520);const mx=(X[0]+J[0])/2,mz=(X[1]+J[1])/2,vA=tkSnap(mx+px*W,mz+pz*W),vB=tkSnap(mx-px*W,mz-pz*W);if(!F||!vA||!vB)continue;
      A=tkCat(path(X,vA),path(vA,J));B=tkCat(path(X,vB),path(vB,J))}
    if(!A||!B||A.length<3||B.length<3)continue;const st=path(S,X),fin=path(J,F);if(st.length<2||fin.length<2||tkLen(st)<250||tkLen(fin)<250)continue
    const LA=tkLen(A),LB=tkLen(B);if(LA<400||LB<400||Math.max(LA,LB)/Math.min(LA,LB)>1.35||tkOverlap(A,B)>.4)continue
    const C={key:spec.key,id:'tk_'+spec.key.replace(/\W/g,'_'),name:spec.name,p:spec.p,kind:spec.kind,ev:spec.ev,ai:spec.ai,base:spec.base||62,off:!!offB,
      seg:{start:st,A,B,fin},ramps:[['start',.55,22,5,16],['A',.5,20,5,14],['B',.45,20,5,14],['fin',.45,26,8,16]],items:[['start',.35],['start',.75],['A',.3],['A',.7],['B',.3],['B',.7],['fin',.25],['fin',.7]],boost:null};
    if(offB)C.ramps[2]=['fin',.15,20,5,14];
    let r=tkSpread(C);const slow=r.A.t>r.B.t?'A':'B';for(const f of[[.2,.5,.8],[.12,.3,.5,.7,.88]]){if(r.spread<=2)break;const C2={...C,geo:null,boost:{r:slow,f}},r2=tkSpread(C2);if(r2.spread<r.spread){C.boost=C2.boost;r=r2}C.geo=null}
    C.spread=r;const sc=r.spread+(tkLen(tkGeoOf(C).pA)<1500?20:0);if(!best||sc<best.sc){best={C,sc}}if(r.spread<=3&&(!spec.off||offB))break}
  if(!best){if(spec.auto&&spec.k<8){spec.k++;return tkBuild(spec)}return null}const C=best.C;tkGeoOf(C);const qa=tkAt(C.seg.A,.4),qb=tkAt(C.seg.B,.4);C.nA=tkRoad(qa.x,qa.z)||'Route A';C.nB=C.off?'Park cut':tkRoad(qb.x,qb.z)||'Route B';if(C.nA===C.nB){C.nA+=' (A)';C.nB+=' (B)'}
  if(!C.name){const q=tkAt(C.seg.start,1);const used=new Set(Object.values(TK.built).map(o=>o.name)),qf=tkAt(C.seg.fin,.6),sfx=C.kind==='rival'?' Duel':' Split',pd=PD[C.p];C.name=[tkRoad(q.x,q.z),tkRoad(qf.x,qf.z),C.nA].map(n=>n&&n+sfx).find(n=>n&&!used.has(n))||((pd?pd.full.split(' ').pop():'City')+sfx)}return TK.built[spec.key]=C}
// which course a marker gets (null = old race path)
function tkSpecOf(m){if(!m||!m.ev)return null;const e=m.ev,ath=CID==='ath';
  if(m.kind==='rival'){if(!ath&&e.p===TK_C.p)return null;return{key:'rival:'+e.p,kind:'rival',p:e.p,ev:e,x:m.x,z:m.z,ai:[e.p],off:ath?e.p==='GALANI':e.p==='OKAFOR'}}
  if(m.kind==='boss')return{key:ath?'boss:ath':'boss',kind:'boss',p:e.p,ev:e,x:m.x,z:m.z,ai:[e.p],base:66,name:ath?'Akropolis Cup Final':'Sky Cup Final'};
  if(m.kind==='sprint'&&typeof SPR_TRACK!=='undefined'&&SPR_TRACK[e.id])return{key:'sprint:'+e.id,kind:'sprint',ev:e,x:m.x,z:m.z,ai:(e.ai||['WEBER','KAYA','ADLER']).slice(0,3),name:e.name,off:e.id==='sp_wald'};return null}
function tkCourseOf(m){if(!m||!m.ev)return null;if(!TK.on)return null;if(CID==='fra'&&m.kind==='rival'&&m.ev.p===TK_C.p)return TK_C;const s=tkSpecOf(m);return s?tkBuild(s):null}
// brick arch: two stacked-brick pillars, a checkered beam with studs (2K checkpoint gates are brick-built arches)
let TK_ARCH=null;function tkArchMats(){if(TK_ARCH)return TK_ARCH;const[c,g]=cv(256,64);for(let i=0;i<16;i++)for(let j=0;j<4;j++){g.fillStyle=(i+j)%2?'#111':'#fff';g.fillRect(i*16,j*16,16,16)}g.fillStyle='#ffd12c';g.fillRect(64,14,128,36);g.fillStyle='#1b1c22';g.font='900 26px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillText('CHECK',128,33);const t=tex(c);KEEP_TEX.add(t);
  const M=col=>new THREE.MeshStandardMaterial({color:col,roughness:.35,metalness:0});return TK_ARCH={beam:new THREE.MeshStandardMaterial({map:t,roughness:.4}),red:M(0xd01712),yel:M(0xffcd03),blu:M(0x0a5fbf),wht:M(0xf4f4f4),box:M(0x9b45ff),q:M(0xffffff),grn:M(0x237841)}}
function tkArch(x,z,h,fin){const M=tkArchMats(),G=new THREE.Group(),span=30,y0=groundAt(x,z,99);for(const sd of[-1,1])for(let k=0;k<8;k++){const b=new THREE.Mesh(new THREE.BoxGeometry(3.2,1.4,3.2),k%2?M.yel:fin?M.wht:M.red);b.position.set(sd*span/2,.7+k*1.4,0);G.add(b)}
  const beam=new THREE.Mesh(new THREE.BoxGeometry(span+3.2,3.2,3.2),M.beam);beam.position.y=11.2+1.6;G.add(beam);for(let i=-6;i<=6;i++){const s=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,.45,10),fin?M.wht:M.yel);s.position.set(i*2.4,14.6,0);G.add(s)}
  G.position.set(x,y0,z);G.rotation.y=h;return G}
// split signboard: a brick-built green road sign before the fork, "◀ left route | right route ▶"
function tkSign(C){const G0=tkGeoOf(C),q=tkAt(G0.seg.start,.93),a=tkAt(G0.seg.A,.08),b=tkAt(G0.seg.B,.08),sx=Math.cos(q.h),sz=-Math.sin(q.h),aLeft=((a.x-q.x)*sx+(a.z-q.z)*sz)<((b.x-q.x)*sx+(b.z-q.z)*sz);
  const L=aLeft?C.nA:C.nB,R=aLeft?C.nB:C.nA,[c,g]=cv(512,128);g.fillStyle='#237841';g.fillRect(0,0,512,128);g.strokeStyle='#fff';g.lineWidth=6;g.strokeRect(6,6,500,116);g.fillStyle='#fff';g.font='900 30px system-ui';g.textBaseline='middle';
  g.textAlign='left';g.fillText('◀ '+String(L).slice(0,14).toUpperCase(),18,44);g.textAlign='right';g.fillText(String(R).slice(0,14).toUpperCase()+' ▶',494,84);g.fillStyle='#ffd12c';g.fillRect(250,20,12,88);const t=tex(c);KEEP_TEX.add(t);
  const M=tkArchMats(),Gr=new THREE.Group(),bd=new THREE.Mesh(new THREE.BoxGeometry(16,4,.6),[M.grn,M.grn,M.grn,M.grn,new THREE.MeshStandardMaterial({map:t,roughness:.5}),M.grn]);bd.position.y=7.5;Gr.add(bd);
  for(const sd of[-6,6])for(let k=0;k<4;k++){const p=new THREE.Mesh(new THREE.BoxGeometry(1.2,1.4,1.2),k%2?M.yel:M.blu);p.position.set(sd,.7+k*1.4,0);Gr.add(p)}
  const off=13,x=q.x+sx*off,z=q.z+sz*off;Gr.position.set(x,groundAt(x,z,99),z);Gr.rotation.y=q.h+Math.PI;Gr.userData.tkSign={L,R};return Gr}
function tkItemMesh(){const M=tkArchMats(),G=new THREE.Group(),b=new THREE.Mesh(new THREE.BoxGeometry(2.6,2.6,2.6),M.box);G.add(b);const[c,g]=cv(64,64);g.fillStyle='#fff';g.font='900 52px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillText('?',32,36);const t=tex(c);
  for(const r of[0,Math.PI/2,Math.PI,-Math.PI/2]){const q=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.MeshBasicMaterial({map:t,transparent:true}));q.position.set(Math.sin(r)*1.32,0,Math.cos(r)*1.32);q.rotation.y=r;G.add(q)}
  for(const sx of[-.65,.65])for(const sz of[-.65,.65]){const s=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,.35,10),M.box);s.position.set(sx,1.47,sz);G.add(s)}return G}
const TK_ITEMS=['TURBO','BRICK BLAST','SHIELD'];
function tkStart(m,C0){const C=C0||tkCourseOf(m)||TK_C;TK.C=C;const Gm=tkGeoOf(C),e={id:C.id,name:C.name,len:Gm.lenA,path:Gm.pA,ai:C.ai||[C.p]};const sp={tk:1,C,e,m,t:0,cd:3,ai:[],objs:[],ramps0:RO.ramps.length,done:false,gi:0,items:[],pads:[],shieldT:0,hitCd:0,warn:null,fx:[],jumps:{A:0,B:0}};
  if(RO.sp)sprintEnd();TK.C=C;RO.sp=sp;RO.pop=null;RO.card=null;$('#roamCard').hidden=true;
  // gates: start line, split, rejoin, finish straight, finish (none inside the split: both routes are legal)
  const g0=tkAt(Gm.seg.start,.12),g1=tkAt(Gm.seg.start,.97),g2=tkAt(Gm.seg.fin,.04),g3=tkAt(Gm.seg.fin,.5),g4=tkAt(Gm.seg.fin,.99);
  sp.G=[[g0,Gm.Ls*.12],[g1,Gm.Ls*.97],[g2,Gm.Ls+Gm.LA+Gm.Lf*.04],[g3,Gm.Ls+Gm.LA+Gm.Lf*.5],[g4,Gm.lenA-2]].map(([q,cum],i,a)=>{const fin=i===a.length-1,mesh=tkArch(q.x,q.z,q.h,fin);RO.grp.add(mesh);sp.objs.push(mesh);return{x:q.x,z:q.z,h:q.h,cum,mesh}});
  const sign=tkSign(C);RO.grp.add(sign);sp.objs.push(sign);sp.sign=sign.userData.tkSign;
  for(const[sg,f,len,hgt,w]of C.ramps){const q=tkAt(Gm.seg[sg],f);addRamp(q.x,q.z,q.h,len,hgt,w,0xff5a1c);for(const r of['A','B'])if(sg===r||sg==='start'||sg==='fin')sp.jumps[r]++}
  for(const[sg,f]of C.items)for(const o of[-6,0,6]){const q=tkAt(Gm.seg[sg],f),x=q.x+Math.cos(q.h)*o,z=q.z-Math.sin(q.h)*o,g=tkItemMesh();g.position.set(x,groundAt(x,z,99)+2.2,z);RO.grp.add(g);sp.objs.push(g);sp.items.push({x,z,g,cd:0})}
  if(C.boost)for(const f of C.boost.f){const q=tkAt(Gm.seg[C.boost.r],f),pad=new THREE.Mesh(new THREE.PlaneGeometry(10,14),neonMat('#4ceaff',2));pad.rotation.order='YXZ';pad.rotation.set(-Math.PI/2,q.h,0);pad.position.set(q.x,groundAt(q.x,q.z,99)+.08,q.z);RO.grp.add(pad);sp.objs.push(pad);sp.pads.push({x:q.x,z:q.z,cd:0})}
  const s0=tkAt(Gm.seg.start,0);RO.x=s0.x+Math.sin(s0.h)*4+Math.cos(s0.h)*4;RO.z=s0.z+Math.cos(s0.h)*4-Math.sin(s0.h)*4;RO.y=groundAt(RO.x,RO.z,1);RO.h=RO.vh=s0.h;RO.v=0;RO.vy=0;RO.yr=0;camSnap=true;
  (C.ai||[C.p]).forEach((p,i)=>{const pd=PD[p],team=vehOf(p)||(pd?teamOf(pd):TEAMS[i%TEAMS.length]),g=shipMesh(team);RO.grp.add(g);sp.objs.push(g);
    sp.ai.push({p,name:pd?pd.full:p,g,s:4-i*7,lane:[-4,4,0][i%3],v:0,base:(C.base||62)*diffMul()*(1-i*.03),route:(i+(Math.random()<.5?0:1))%2?'B':'A',fin:null,item:null,itemCd:0,stun:0})});
  const who=sp.ai.length>1?sp.ai.length+' RIVALS':(sp.ai[0].name||'').toUpperCase();
  say((C.kind==='boss'?'FINAL · ':C.kind==='sprint'?'CITY SPRINT · ':'RIVAL RACE · ')+C.name.toUpperCase(),who+' · 2 ROUTES'+(C.off?' · PARK CUT':'')+' · GRAB THE ? BRICKS',2);AU.sfx('pick');return sp}
function tkPath(a){const G=tkGeo();return a.route==='B'?G.pB:G.pA}
function tkPosOn(P,s){let cum=0;for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(s<=cum+L||i===P.length-1){const t=clamp((s-cum)/(L||1),0,1),n=P[i+1],turn=n?Math.abs(angDiff(Math.atan2(n[0]-b[0],n[1]-b[1]),Math.atan2(b[0]-a[0],b[1]-a[1]))):0;return{x:a[0]+(b[0]-a[0])*t,z:a[1]+(b[1]-a[1])*t,h:Math.atan2(b[0]-a[0],b[1]-a[1]),toCorner:cum+L-s,turn}}cum+=L}}
// rival speed model, shared by the race and GO tk1/route-spread: base speed, slow for sharp corners, turbo pads on the pad route
function tkAiTarget(a,P,s){const q=tkPosOn(P,Math.max(0,s));let tv=a.base;if(q.turn>.5&&q.toCorner<55)tv=Math.min(tv,30);else if(q.turn>.25&&q.toCorner<45)tv=Math.min(tv,44);const C=TK.C||TK_C;if(C.boost&&a.route===C.boost.r&&TK.sp&&TK.sp.padT>0)tv*=1.25;return tv}
function tkFire(who,kind,sp,ai){const lead=sp.ai.filter(b=>b.fin==null&&b.s>sp.myS-20&&b.s-sp.myS<220).sort((x,y)=>x.s-y.s)[0];
  if(who==='me'){if(kind==='TURBO'){RO.v=Math.max(RO.v,0)+20;RO.turbo=Math.max(RO.turbo||0,1.5);if(pl)pl.bm=100;fovKick=Math.max(fovKick,12);AU.sfx('nitro')}
    else if(kind==='SHIELD'){sp.shieldT=6;AU.sfx('pick')}
    else{if(lead){lead.stun=1.2;lead.v*=.35;feed('BRICK BLAST · '+lead.name,250,'#ff2d95');AU.sfx('crash')}else feed('BRICK BLAST · missed',0,'#9fb0c0')}
    feed(kind,0,'#c46bff');return}
  const a=ai||sp.ai[0];if(kind==='TURBO'){a.v+=16;return}if(kind==='SHIELD')return;
  // rival blast: telegraphed, needs you ahead, one hit per 8 s, a shield blocks it
  if(sp.myS>a.s&&sp.myS-a.s<160&&sp.hitCd<=0&&sp.warn==null){sp.warn=.7;say('','⚠ '+a.name.toUpperCase()+' · BRICK BLAST',.7)}}
function tkStep(dt){const sp=RO.sp,e=sp.e;TK.C=sp.C;const G=tkGeo();RO.cool=2;TK.sp=sp;
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
  const C=sp.C;for(const a of sp.ai){const P=tkPath(a),Lp=tkLen(P);if(a.fin!=null&&a.s>=Lp+40)continue;a.stun=Math.max(0,a.stun-dt);a.itemCd=Math.max(0,a.itemCd-dt);
    const gap=a.s/Lp*G.lenA-sp.myS,rub=gap>150?.9:gap<-150?1.1:1;let tv=tkAiTarget(a,P,a.s)*rub;if(sp.cd>0||a.stun>0)tv=0;
    if(C.boost&&a.route===C.boost.r){const q=tkPosOn(P,a.s);if(sp.pads.some(p=>Math.hypot(q.x-p.x,q.z-p.z)<8))sp.padT=1.5}
    a.v+=(tv-a.v)*Math.min(1,dt*(tv>a.v?1.6:2.5));a.s+=a.v*dt;if(a.s>=Lp&&a.fin==null){a.fin=sp.t;say('',a.name.toUpperCase()+' FINISHED',1.2)}
    const q=tkPosOn(P,Math.max(0,a.s)),x=q.x+Math.cos(q.h)*a.lane,z=q.z-Math.sin(q.h)*a.lane;
    if(a.itemCd<=0)for(const it of sp.items)if(it.cd<=0&&Math.hypot(it.x-x,it.z-z)<5){it.cd=3;a.itemCd=4;tkFire('ai',TK_ITEMS[(sp.items.indexOf(it)+1)%3],sp,a);break}
    a.y=groundAt(x,z,(a.y??0)+3);a.h=(a.h??q.h)+angDiff(q.h,a.h??q.h)*Math.min(1,dt*4);a.g.position.set(x,a.y,z);a.g.rotation.y=a.h+Math.PI;const ud=a.g.userData;if(ud.m)ud.m.position.y=1.6+Math.sin(T*6)*.1;if(ud.ribbons)for(const rb of ud.ribbons){rb.scale.z=6+a.v/8;rb.material.uniforms.uT.value=T}
    const d=Math.hypot(x-RO.x,z-RO.z);if(d<5.5&&d>.01&&Math.abs(a.y-RO.y)<3){const k=(5.5-d)/2;RO.x+=(RO.x-x)/d*k;RO.z+=(RO.z-z)/d*k;a.v*=.92;RO.v*=.95;AU.sfx('bump')}}
  const n=sp.ai.length,ahead=sp.ai.filter(a=>a.fin!=null||a.s/tkLen(tkPath(a))*G.lenA>sp.myS).length,lastFin=sp.ai.every(a=>a.fin!=null)?Math.max(...sp.ai.map(a=>a.fin)):null;sp.place=1+ahead;
  if(!sp.done&&sp.cd<=0&&(sp.t>=235||(lastFin!=null&&sp.t-lastFin>=40)))return tkFinish(true);
  sp.hud=`<b>🏁 ${e.name.toUpperCase()}</b><span>POS ${sp.place}/${n+1} · CP ${Math.min(sp.gi,sp.G.length)}/${sp.G.length} · ${fmt(Math.max(0,sp.t))}${sp.shieldT>0?' · 🛡':''}${lastFin!=null?' · DNF in '+Math.ceil(40-(sp.t-lastFin))+' s':''}</span>`}
function tkFinish(dnf){const sp=RO.sp,C=sp.C,n=sp.ai.length;sp.done=true;const place=dnf?n+1:1+sp.ai.filter(a=>a.fin!=null&&a.fin<sp.t).length,won=place===1;
  const stars=C.kind==='sprint'?(place===1?3:place===2?2:place===3?1:0):won?(sp.t<120?3:2):0,a=sp.ai[0];
  TK.last={key:C.key,place,t:+sp.t.toFixed(1),dnf,stars,rival:a.fin,route:a.route,fired:sp.fired||0};
  const all=store.get('mho_stars',{}),F=flags();
  if(C.kind==='sprint'){const e=C.ev,o=roamSave();o.sp=o.sp||{};const prev=o.sp[e.id]||{st:0,best:0};o.sp[e.id]={st:Math.max(prev.st,stars),best:!dnf&&(!prev.best||sp.t<prev.best)?sp.t:prev.best};roamStore(o);const key='sprint:'+e.id;if((all[key]||0)<stars){all[key]=stars;store.set('mho_stars',all);addXP(130)}logDone(key,C.name,'sprint',stars,fmt2(sp.t))}
  else if(won){const fl=C.kind==='boss'?(CID==='ath'?'AKROCUP':'SKYCUP'):C.p,nw=!F[fl];F[fl]=1;store.set('mho_flags',F);const key=C.kind==='boss'?'boss':'rival:'+C.p;if((all[key]||0)<stars){all[key]=stars;store.set('mho_stars',all)}if(nw)addXP(C.kind==='boss'?600:200);logDone(key,C.name,C.kind,stars,fmt2(sp.t))}
  const rows=[{n:'YOU',t:dnf?null:sp.t,me:1},...sp.ai.map(b=>({n:b.name,t:b.fin}))].sort((x,y)=>(x.t??1e9)-(y.t??1e9));
  const head=won?(C.kind==='boss'?(CID==='ath'?'AKROPOLIS CUP CHAMPION':'SKY CUP CHAMPION'):C.kind==='sprint'?'1ST · YOU WIN!':'1ST · FLAG WON!'):dnf?'DNF · '+(rows[0].n||'').toUpperCase()+' WINS':ord(place)+' PLACE';
  const el=$('#spRes');el.hidden=false;el.innerHTML=`<h3>${head}</h3><div class="st">${'★'.repeat(stars)}<i>${'★'.repeat(3-stars)}</i></div><p>${C.name} · ${dnf?'did not finish':fmt2(sp.t)}</p><table>${rows.map((r,i)=>`<tr class="${r.me?'me':''}"><td>${i+1}</td><td>${r.n}</td><td>${r.t!=null?fmt2(r.t):'—'}</td></tr>`).join('')}</table><div class="rcb"><button class="go" id="spAgain">RACE AGAIN</button><button class="go alt" id="spOk">CONTINUE</button></div>`;
  AU.sfx(won?'finish':'crash');const m=sp.m;$('#spOk').onclick=()=>{el.hidden=true};$('#spAgain').onclick=()=>{el.hidden=true;tkStart(m,C)};sprintEnd()}
{const _st=sprintStep,_end=sprintEnd;sprintStep=function(dt){if(RO.sp&&RO.sp.tk)return tkStep(dt);return _st(dt)};
 sprintEnd=function(){const sp=RO.sp;if(sp&&sp.tk){const R=RO.ramps.splice(sp.ramps0);for(const o of RO.grp.children.slice())if(o.userData.ramp&&R.some(r=>Math.hypot(o.position.x-r.x,o.position.z-r.z)<20))RO.grp.remove(o);TK.sp=null}return _end()}}
// a World-menu event (Athens has no rival markers) -> its map marker, or a markerless stand-in placed by the builder
function tkMarkOf(ev){if(!ev)return null;const boss=ev===BOSS_EV||(typeof ATH_BOSS_EV!=='undefined'&&ev===ATH_BOSS_EV)||ev.sig==='boss',kind=boss?'boss':'rival';return RO.marks&&RO.marks.find(m=>m.kind===kind&&m.ev&&m.ev.p===ev.p)||{kind,ev,x:null,z:null}}
function tkWorldEvs(){return CID==='ath'?[...ATH_TRK_EV,ATH_BOSS_EV]:[...RIVAL_EV,BOSS_EV]}
{const f0=startRace;startRace=function(){const ev=worldPick;if(TK.on&&menuTab==='world'&&ev&&!RO.launching&&!(typeof SP_S!=='undefined'&&SP_S.on)){
   const go=()=>{const m=tkMarkOf(ev),C=tkCourseOf(m);if(C){$('#menu').hidden=true;tkStart(m,C)}else say('','NO CITY COURSE HERE',1.6)};const r=enterRoam();if(r&&r.then)r.then(()=>setTimeout(go,60));else go();return}return f0()}}
// rival / boss / track-sprint markers start a city course instead of the spline track
function tkWants(m){return TK.on&&m&&(m.kind==='rival'||m.kind==='boss'||m.kind==='sprint')&&!!tkCourseOf(m)}
{const _go=roamGo;roamGo=function(){const m=RO.card;if(m&&!$('#rcGo').disabled&&!(CM.on&&!['garage','cruise'].includes(m.kind))&&tkWants(m)){pickAdd(m);tkStart(m);return}return _go()};$('#rcGo').onclick=roamGo}
// GO helpers (99c_checklist.js): AI time on each route with the race's own speed model, fake clock
function tkRouteTimes(C){C=C||TK_C;const r=tkSpread(C);return{A:r.A,B:r.B,spread:r.spread}}
function tkRun(secs,drive){const sp=RO.sp;if(!sp||!sp.tk)return null;const dt=1/30;for(let i=0;i<secs*30&&RO.sp===sp;i++){if(drive)drive(sp);roamStep(dt)}return TK.last}
// tk1/courses: build every course of this city, check spread / jumps / items / sign, then cross all gates (teleport) to check the finish + reward
function tkGoCourses(){const L=[...tkWorldEvs().map(tkMarkOf),...RO.marks.filter(m=>m.kind==='sprint'&&m.ev&&SPR_TRACK[m.ev.id])],out=[];let bad=0,off=0,nC=0;const F0=JSON.stringify(store.get('mho_flags',{})),S0=JSON.stringify(store.get('mho_stars',{})),R0=JSON.stringify(store.get('mho_roam',{}));
  for(const m of L){const C=tkCourseOf(m);if(!C){bad++;out.push((m.ev.p||m.ev.id)+' none ❌');continue}nC++;const r=tkSpread(C);tkStart(m,C);const sp=RO.sp;sp.cd=0;
    const ok1=r.spread<=5&&sp.jumps.A>=2&&sp.jumps.B>=2&&sp.items.length>=18&&!!sp.sign&&tkGeoOf(C).lenA>1500;
    for(const g of sp.G){RO.x=g.x;RO.z=g.z;tkStep(1/30);if(sp.done)break}const ok2=sp.done&&TK.last&&TK.last.key===C.key&&TK.last.place===1;if(C.off)off++;
    try{$('#spRes').hidden=true}catch(e){}if(RO.sp===sp)sprintEnd();if(!(ok1&&ok2))bad++;out.push(`${C.name} ${r.spread}%${C.off?' 🌳':''}${ok1&&ok2?'':' ❌'}`)}
  store.set('mho_flags',JSON.parse(F0));store.set('mho_stars',JSON.parse(S0));store.set('mho_roam',JSON.parse(R0));
  const spreads=L.map(m=>tkCourseOf(m)).filter(Boolean).map(C=>(C.spread||tkSpread(C)).spread),mx=spreads.length?Math.max(...spreads):0;window.__chk&&(window.__chk.tk=out);
  return'📍 CITY COURSES · '+nC+'/'+L.length+' built · max spread '+mx+' % · off-road '+off+' · '+out.join(' · ')+(!bad&&nC&&(CID!=='fra'||off)?' ✅':' ❌')}
window.__tk={mark:tkMarkOf,view:(f)=>{const G=tkGeo(),q=tkAt(G.seg.start,f);RO.x=q.x;RO.z=q.z;RO.y=groundAt(q.x,q.z,99);RO.h=RO.vh=q.h;camSnap=true;for(let i=0;i<40;i++)roamCam(1/60)},evs:()=>tkWorldEvs(),courses:()=>{try{return tkGoCourses()}catch(e){return String(e.stack).slice(0,700)}},of:tkCourseOf,start:tkStart,TK,marks:()=>RO.marks.filter(m=>m.ev).map(m=>m.kind+':'+(m.ev.p||m.ev.id))};
