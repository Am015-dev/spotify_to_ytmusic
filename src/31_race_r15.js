// ===== R15 (race worker 15, v87q+): strategic routes. Per circuit, a WATER and an OFF-ROAD corridor run along the inside of a big bend:
// the inner wall opens at a signed mouth, an island splits the corridor from the road, and the car auto-transforms there (boat / 4×4).
// The inside line is shorter (progress ds = v/(1−k·x)), but the corridor is rougher: lower top speed and grip, bumps or spray.
// Corridors live in TF coordinates {s0,s1,sd,kind}; queries map through TD (reverse races flip s and side).
let R15C=[],R15_sw=0,R15_why={};const R15_no=k=>{R15_why[k]=(R15_why[k]||0)+1;return true};const R15_ISL=6,R15_CW=22,R15_MOUTH=150,R15_LEN=560,R15_NOSE=40;
const R15_e=(c,u)=>{const m=Math.min(u,c.s1-c.s0-u)/R15_MOUTH;const t=clamp(m,0,1);return t*t*(3-2*t)};
// find the bends: the middle of each corridor bends one way; the road is near the ground, dry, no jumps / tunnels / gaps; nothing else in the way
function R15_find(){R15C=[];R15_why={};try{if(!TF)return;const td=TF,L=td.L,ath=TRK.city==='ath',cand=[];
  const gy=(x,z)=>ath&&typeof athH==='function'?athH(x,z):0,f=mkF();
  const free=(s0,sd,cw)=>{for(let d=R15_MOUTH*.6;d<=R15_LEN-R15_MOUTH*.6;d+=20){frameAt(td,s0+d,f);for(const x of[HALF+R15_ISL+cw/2,HALF+R15_ISL+cw]){const q=f.p.clone().addScaledVector(f.r,sd*x);
      if(q.y<gy(q.x,q.z)-.3&&R15_no('gnd'))return false;if(!ath&&q.z>RIVER[0]-30&&q.z<RIVER[1]+30&&R15_no('river'))return false;if(R15_ntd(q.x,q.z,x+40)<x-6&&R15_no('trk'))return false;
      if(LANDMARKS.some(l=>(l.x-q.x)**2+(l.z-q.z)**2<((l.r||20)+16)**2)&&R15_no('lm'))return false}}return true};
  for(let s0=380;s0<L-R15_LEN-380;s0+=20){let sum=0,n=0,bad=false,kmx=0;
    for(let d=-40;d<=R15_LEN+40&&!bad;d+=10){const s=s0+d;if(jumpAt(td,s)||isWater(td,s)||isDirt(td,s)||inGapF(s)){bad=R15_no('jwdg');break}
      frameAt(td,s,f);if(f.p.y<-3){bad=R15_no('y');break}if(d>0&&d<R15_LEN)kmx=Math.max(kmx,Math.abs(f.k));if(d>=R15_MOUTH&&d<=R15_LEN-R15_MOUTH){sum+=f.k;n++}}
    if(bad||!n)continue;const km=sum/n;
    // inside of the bend when it bends; on a near-straight both sides may work (the corridor then pays off with its boost pad)
    const sides=Math.abs(km)>1/2500?[Math.sign(km)]:[1,-1];const cw=Math.min(R15_CW,.3/Math.max(kmx,1e-4)-HALF-R15_ISL);if(cw<10&&R15_no('tight'))continue;for(const sd of sides)if(free(s0,sd,cw)){cand.push({s0,s1:s0+R15_LEN,sd,cw,score:km*sd});break}}
  cand.sort((a,b)=>b.score-a.score);for(const c of cand){if(R15C.length>=2)break;if(R15C.some(o=>Math.abs(o.s0-c.s0)<R15_LEN+120||Math.abs(o.s0-c.s0)>L-R15_LEN-120))continue;R15C.push(c)}
  R15C.sort((a,b)=>a.s0-b.s0);R15C.forEach((c,i)=>{c.id=i;c.kind=(i===0)!==(TRK.id.length%2===0)?'water':'dirt'});
 }catch(e){console.warn('R15 find',e);R15C=[]}}
// distance to the track ignoring corridors (used while finding them)
function R15_ntd(x,z,r){return R15_ntd0?R15_ntd0(x,z,r):nearestTrackDist(x,z,r)}
let R15_ntd0=null;
// buildings and Athens blocks keep clear of the corridors: they ask the track distance, corridor points count as track
{const _n=nearestTrackDist;R15_ntd0=_n;nearestTrackDist=function(x,z,r){const d=_n(x,z,r);if(!R15C.length||!R15C.pts)return d;let b=d;for(const p of R15C.pts){const e=Math.hypot(p[0]-x,p[1]-z)-p[2];if(e<b)b=Math.max(0,e)}return b}}
function R15_pts(){const f=mkF(),P=[];for(const c of R15C)for(let s=c.s0;s<=c.s1;s+=16){frameAt(TF,s,f);const e=R15_e(c,s-c.s0),x=c.sd*(HALF+(R15_ISL+c.cw)*e*.5);P.push([f.p.x+f.r.x*x,f.p.z+f.r.z*x,Math.max(0,(R15_ISL+c.cw)*e*.5)])}R15C.pts=P}
// TD-space query: the corridor at s (null if none) with u = metres into it (in TF direction) and the side in TD coords
function R15_at(s){if(!R15C.length)return null;const L=TF.L,sf=TD.rev?mod(L-s,L):mod(s,L);for(const c of R15C)if(sf>=c.s0&&sf<=c.s1)return{c,u:sf-c.s0,ud:TD.rev?c.s1-sf:sf-c.s0,sd:TD.rev?-c.sd:c.sd,rev:TD.rev};return null}
// in the opening mouth (before the island nose) of a corridor, travelling in race direction
function R15_mouth(s){const q=R15_at(s.dist);return q&&q.ud<R15_MOUTH+R15_NOSE*.6?q:null}
const R15_div=()=>HALF+R15_ISL/2;
// lateral limits [lo,hi] for a car that was at px: road, mouth (opened wall) or corridor lane behind the island
// island: lane-side face fixed at HALF+ISL; the nose grows toward the road over R15_NOSE m (g 0→1), so nobody in the lane gets scraped
const R15_g=(c,u)=>clamp(Math.min(u-R15_MOUTH,c.s1-c.s0-R15_MOUTH-u)/R15_NOSE,0,1);
const R15_dvq=q=>{const g=R15_g(q.c,q.u);return HALF+R15_ISL-R15_ISL*g/2};
function R15_b(s,px){const q=R15_at(s.dist);if(!q)return[-MARGIN,MARGIN];const{c,u,sd}=q,Lc=c.s1-c.s0,out=HALF+(R15_ISL+c.cw)*R15_e(c,u)-1.5;
  const a0=Math.min(u-R15_MOUTH,Lc-R15_MOUTH-u),g=R15_g(c,u),y=px*sd;let a=-MARGIN,b=MARGIN;
  if(a0<0)b=Math.max(MARGIN,out);else if(y>R15_dvq(q)){a=HALF+R15_ISL+1.5*g;b=Math.max(a+2,out)}else b=Math.max(MARGIN,HALF+R15_ISL-(R15_ISL+1.5)*g);
  return sd>0?[a,b]:[-b,-a]}
const R15_cx=(s,v)=>{const B=R15_b(s,s.x);return clamp(v,B[0],B[1])};
function R15_inLane(s){const q=R15_at(s.dist);return q&&s.x*q.sd>Math.min(R15_div(),R15_dvq(q))?q:null}
// the line the touch assist and the AI follow: corridor lane centre while in it
function R15_lane(s,q){const C=HALF+R15_ISL+q.c.cw/2;if(q.ud<(q.c.s1-q.c.s0)/2)return q.sd*C;const out=HALF+(R15_ISL+q.c.cw)*R15_e(q.c,q.u);return q.sd*Math.min(C,out-6)}
// next corridor ahead within d metres (TD distance to its entry), for signs, AI and the test driver
function R15_ahead(s,d){if(!R15C.length)return null;const L=TF.L;let best=null;for(const c of R15C){const sE=TD.rev?L-c.s1:c.s0,dd=mod(sE-s.dist,L);if(dd<d&&(!best||dd<best.dd))best={c,dd,sd:TD.rev?-c.sd:c.sd}}return best}
// terrain in a corridor: 'water' / 'dirt' when the car is out past the road edge on the corridor side
function R15_ter(s){const q=R15_at(s.dist);if(!q||s.x*q.sd<HALF+.5){s.r15k=1;s.r15w=false;return null}s.r15w=q.c.kind==='water';s.r15k=q.c.kind==='water'?.93:.9;
  if(q.c.kind==='dirt'&&s.isPlayer&&!s.air&&R()<.05)shake=Math.max(shake,.32);return q.c.kind}
function R15_open(sf,side){for(const c of R15C)if(c.sd===side&&sf>=c.s0-2&&sf<=c.s1+2)return true;return false}
// AI: takes a corridor with a skill-based chance, decided once per lap per corridor
function R15_aiXt(s,xt){const q=R15_inLane(s);if(q)return R15_lane(s,q);const qm=R15_mouth(s);if(qm){const key=qm.c.id+'@'+s.lap;if(s.r15d&&s.r15d[key])return R15_lane(s,qm)}const a=R15_ahead(s,150);if(!a)return xt;const key=a.c.id+'@'+s.lap;s.r15d=s.r15d||{};
  if(s.r15d[key]==null)s.r15d[key]=R()<.45+.25*clamp(s.skill-.9,0,1)*2;if(!s.r15d[key])return xt;return a.sd*(a.dd<70?HALF+R15_ISL+a.c.cw/2:MARGIN-1)}
// test hook (read-only): where a person following the SHORTCUT signs would aim
window.__rt15=s=>{try{const q=R15_inLane(s);if(q)return{want:R15_lane(s,q),in:q.c.kind};const qm=R15_mouth(s);if(qm)return{want:R15_lane(s,qm),mouth:qm.c.kind};const a=R15_ahead(s,170);if(a)return{want:a.sd*(MARGIN-2.5),next:a.c.kind,dd:Math.round(a.dd)};return null}catch(e){return null}};
// boost pads in the middle of each corridor (the reward for taking it)
function R15_pads(){for(const c of R15C){const L=TF.L;for(const fr of[.45]){const sf=c.s0+(c.s1-c.s0)*fr,s=TD.rev?L-sf:sf,sd=TD.rev?-c.sd:c.sd;pads.push({s,x:sd*(HALF+R15_ISL+c.cw/2),type:'boost'})}}}
// ---- meshes: corridor surface (dirt / water), island with kerbs and grass, outer barrier, skirt, entry signs and floor arrows
function R15_tex(kind){const[c,g]=cv(256,256);if(kind==='water'){g.fillStyle='#1d7fd6';g.fillRect(0,0,256,256);for(let i=0;i<70;i++){g.fillStyle=`rgba(255,255,255,${.12+Math.random()*.25})`;const x=Math.random()*256,y=Math.random()*256;g.fillRect(x,y,10+Math.random()*30,3)}
  g.fillStyle='rgba(120,200,255,.35)';for(let y=0;y<256;y+=32)g.fillRect(0,y,256,6)}else{g.fillStyle='#8a5a2e';g.fillRect(0,0,256,256);for(let i=0;i<1800;i++){const v=Math.random();g.fillStyle=v<.5?`rgba(60,34,14,${.2+Math.random()*.3})`:`rgba(200,150,95,${.1+Math.random()*.25})`;g.fillRect(Math.random()*256,Math.random()*256,3+Math.random()*6,3+Math.random()*6)}
  g.fillStyle='rgba(50,28,10,.45)';for(const x of[70,180])g.fillRect(x,0,18,256)}return tex(c)}
function R15_signTex(kind){const[c,g]=cv(512,256);const col=kind==='water'?'#1aa3ff':'#e08a1e';g.fillStyle='#ffd12c';g.fillRect(0,0,512,256);g.fillStyle='#111';g.fillRect(10,10,492,236);g.fillStyle=col;g.fillRect(18,18,476,220);
  g.fillStyle='#fff';g.font='900 64px system-ui,sans-serif';g.textAlign='center';g.fillText('SHORTCUT',256,92);g.font='900 52px system-ui,sans-serif';g.fillText(kind==='water'?'≈ BOAT ≈':'▲ OFF-ROAD ▲',256,160);
  g.beginPath();g.moveTo(330,190);g.lineTo(430,190);g.lineTo(430,172);g.lineTo(470,205);g.lineTo(430,238);g.lineTo(430,220);g.lineTo(330,220);g.closePath();g.fill();return tex(c,false)}
function R15_arrowTex(){const[c,g]=cv(128,128);g.clearRect(0,0,128,128);g.fillStyle='rgba(255,209,44,.95)';g.beginPath();g.moveTo(64,6);g.lineTo(118,62);g.lineTo(84,62);g.lineTo(84,122);g.lineTo(44,122);g.lineTo(44,62);g.lineTo(10,62);g.closePath();g.fill();return tex(c,false)}
function R15_mesh(){if(!R15C.length)return;try{const td=TF,f=mkF(),ath=TRK.city==='ath';
  const M={water:new THREE.MeshStandardMaterial({map:R15_tex('water'),color:0xffffff,roughness:.12,metalness:.1,emissive:0x0a3a70,emissiveIntensity:ath?.15:.6,side:THREE.DoubleSide}),
    dirt:new THREE.MeshStandardMaterial({map:R15_tex('dirt'),roughness:.95,metalness:0,emissive:0x2a1608,emissiveIntensity:ath?0:.5,side:THREE.DoubleSide}),
    grass:new THREE.MeshStandardMaterial({color:0x4caf3a,roughness:.7,emissive:0x0c3008,emissiveIntensity:ath?0:.6,side:THREE.DoubleSide}),
    kerb:new THREE.MeshStandardMaterial({vertexColors:true,roughness:.5,emissive:0xffffff,emissiveIntensity:ath?0:.25,side:THREE.DoubleSide}),
    skirt:new THREE.MeshStandardMaterial({color:ath?0xb9ad96:0x1b1f3a,roughness:.8,side:THREE.DoubleSide})};
  for(const c of R15C){const pos=[],uv=[],idx=[],sk=[],ski=[],isl=[],isi=[],islC=[],bar=[],bari=[],barC=[];let n=0,m=0,ni=0,nb=0;const Lc=c.s1-c.s0,st=4;
    const P=(x,y)=>{const q=f.p.clone().addScaledVector(f.r,c.sd*x).addScaledVector(f.u,y);return[q.x,q.y,q.z]};
    for(let u=0;u<=Lc;u+=st){frameAt(td,c.s0+u,f);const e=R15_e(c,u),out=HALF+(R15_ISL+c.cw)*e;
      // surface from the road edge to the outer edge
      pos.push(...P(HALF-.4,.03),...P(Math.max(HALF,out),.03));uv.push(0,u/24,(Math.max(HALF,out)-HALF+.4)/24,u/24);if(u>0){idx.push(n-2,n,n-1,n-1,n,n+1)}n+=2;
      // skirt below the outer edge
      const o=P(Math.max(HALF,out),.03);sk.push(...o,o[0],o[1]-30,o[2]);if(u>0)ski.push(m-2,m,m-1,m-1,m,m+1);m+=2;
      // outer barrier: low LEGO brick wall, red/white blocks
      const bc=(Math.floor(u/8)%2)?[1.6,.18,.15]:[1.7,1.7,1.7];const b0=P(Math.max(HALF,out)+.1,0),b1=P(Math.max(HALF,out)+.1,1.1);bar.push(...b0,...b1);barC.push(...bc,...bc);if(u>0)bari.push(nb-2,nb,nb-1,nb-1,nb,nb+1);nb+=2;
      // island: grass top + kerb sides between road and lane (nose ramps over R15_NOSE m)
      const a0=Math.min(u-R15_MOUTH,Lc-R15_MOUTH-u),g=clamp(a0/R15_NOSE,0,1);if(a0>=-st){const h=a0<0?0:.9,iw=R15_ISL/2*g,d=HALF+R15_ISL-iw;
        const kc=(Math.floor(u/6)%2)?[1.7,.15,.12]:[1.8,1.8,1.8];isl.push(...P(d-iw,0),...P(d-iw,h),...P(d+iw,h),...P(d+iw,0));islC.push(...kc,...kc,...kc,...kc);if(a0>-st+.01&&ni>0)for(let q=0;q<3;q++){const A=ni-4+q,B=ni+q;isi.push(A,B,A+1,A+1,B,B+1)}ni+=4}}
    const surf=new THREE.Mesh(geo(pos,uv,idx),M[c.kind]);surf.receiveShadow=true;ROOT.add(surf);ROOT.add(new THREE.Mesh(geo(sk,null,ski),M.skirt));
    const bg=geo(bar,null,bari,null,barC);ROOT.add(new THREE.Mesh(bg,M.kerb));const ig=geo(isl,null,isi,null,islC);ROOT.add(new THREE.Mesh(ig,M.kerb));
    // grass top of the island (flat strip)
    {const gp=[],gi=[];let k=0;for(let u=R15_MOUTH;u<=Lc-R15_MOUTH;u+=st){frameAt(td,c.s0+u,f);const a0=Math.min(u-R15_MOUTH,Lc-R15_MOUTH-u),g=clamp(a0/R15_NOSE,0,1),iw=R15_ISL/2*g,d=HALF+R15_ISL-iw;gp.push(...P(d-iw+.05,.92),...P(d+iw-.05,.92));if(k>0)gi.push(k-2,k,k-1,k-1,k,k+1);k+=2}ROOT.add(new THREE.Mesh(geo(gp,null,gi),M.grass))}
    // entry signs (forward races) on the road edge before the mouth + floor arrows into the mouth
    const sm=new THREE.MeshBasicMaterial({map:R15_signTex(c.kind),toneMapped:false,side:THREE.DoubleSide}),post=new THREE.MeshStandardMaterial({color:0x2a2e40,roughness:.5});
    for(const d of[-220,-120,-30]){frameAt(td,c.s0+d,f);const g=new THREE.Group();placeOnTrack(g,f,c.sd*(HALF-3),0);const b=new THREE.Mesh(new THREE.PlaneGeometry(16,8),sm);b.position.y=11;g.add(b);
      for(const px of[-6.5,6.5]){const p=new THREE.Mesh(new THREE.BoxGeometry(.7,7.5,.7),post);p.position.set(px,3.75,.1);g.add(p)}ROOT.add(g)}
    const am=new THREE.MeshBasicMaterial({map:R15_arrowTex(),transparent:true,depthWrite:false,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-3});
    for(let k=0;k<4;k++){const u=-50+k*30;frameAt(td,c.s0+u,f);const a=new THREE.Mesh(new THREE.PlaneGeometry(6,6),am);a.rotation.x=-Math.PI/2;a.rotation.z=-c.sd*.55;const g=new THREE.Group();placeOnTrack(g,f,c.sd*(MARGIN-4-k*0)+c.sd*k*3,.06);g.add(a);ROOT.add(g)}}
 }catch(e){console.warn('R15 mesh',e)}}
// race camera limits (99_api keeps the camera off the walls): a corridor side opens up to its outer barrier (island and barrier are low)
function R15_camB(sd0){const q=R15_at(sd0);if(!q)return null;const lim=HALF-.9,out=Math.max(lim,HALF+(R15_ISL+q.c.cw)*R15_e(q.c,q.u)-.9);return q.sd>0?[-lim,out]:[-out,lim]}
