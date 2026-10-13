// ============================================================ BX builder-A (alex/od-builder2, 2026-10-13)
// Alex: the STUNT CUP ribbon builder was "boring, flat, no levels". This is a PIECE builder on FULL terrain, in its own scene:
//  - 8 m grid, 2 m height levels, 90° turns; pieces snap port-to-port (exit cursor), elevated pieces get LEGO pillars (bridges).
//  - terrain raise / lower / flatten / smooth / water brushes + world presets; pieces carve/embed the ground under them.
//  - the car follows the real piece meshes (4 wheel rays) and the terrain; loops and wall banks hold the car above 9 m/s;
//    no invisible walls; water turns the car into a boat; respawn ONLY when below the terrain minimum, >40 m from the
//    course for >3 s, or upside down for >2 s; it goes back to the last checkpoint (START counts) passed.
//  - the build is an action log (world, pieces, brushes, deletes): undo = pop + replay, save = the log as JSON.
// Drawn with the main renderer while BX.on (frame() is wrapped; the game loop is idle meanwhile). Probe: window.__bx.
const BX={on:false,ui:0,tab:'track',sel:'st',tool:'raise',world:'valley',log:[],pcs:[],cur:{i:20,j:22,l:2,r:0},hl:-1,mode:'build',
 cam:null,sc:null,v:null,m:null,keys:{},t:0,acc:0,camB:{x:0,z:0,d:72,yaw:3.5,pit:0.52},name:'MY TRACK',fast:/[?&](bx)?fast=1/.test(location.search),tfast:/[?&]bxfast=1/.test(location.search)};
const BXC=8,BXH=2,BXN=40,BXW=BXN*BXC,BXR=4,BXTN=BXW/BXR+1,BXO=-BXW/2,BXG=16,BXRW=6.5; // road 13 m + kerbs = 14 m wide (trk-1: LEGO 2K Drive roads are wide; 8 m with walls = constant scraping)
const BXF=[[0,1],[-1,0],[0,-1],[1,0]];
const bxV=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z),bxSS=t=>t*t*(3-2*t),bxCl=(v,a,b)=>v<a?a:v>b?b:v;
BX.th=new Float32Array(BXTN*BXTN);
// ---------------------------------------------------------------- terrain
function BX_hv(a,b){a=a<0?0:a>BXTN-1?BXTN-1:a;b=b<0?0:b>BXTN-1?BXTN-1:b;return BX.th[b*BXTN+a]}
function BX_h(x,z){const fx=(x-BXO)/BXR,fz=(z-BXO)/BXR,a=Math.floor(fx),b=Math.floor(fz),u=fx-a,v=fz-b;
 return (BX_hv(a,b)*(1-u)+BX_hv(a+1,b)*u)*(1-v)+(BX_hv(a,b+1)*(1-u)+BX_hv(a+1,b+1)*u)*v}
function BX_tn(x,z,o){return (o||bxV()).set(BX_h(x-1,z)-BX_h(x+1,z),2,BX_h(x,z-1)-BX_h(x,z+1)).normalize()}
const bxBowl=(x,z,cx,cz,r,deep)=>{const d=Math.hypot(x-cx,z-cz);return d<r?deep+(2-deep+1)*(d/r)**2:99};
const BX_WORLDS={
 valley:{n:'VALLEY',f:(x,z)=>{let h=3+1.4*Math.sin(x/29)*Math.cos(z/23)+.9*Math.sin((x-z)/41);
  h=Math.max(h,3+44*bxSS(bxCl((z-55)/85,0,1))*(.72+.28*Math.sin(x/37)));const dm=Math.hypot(x-50,z+95);h=Math.max(h,dm<30?26-dm/15:dm<38?26-21*bxSS((dm-30)/8):h);
  const rz=-12+26*Math.sin(x/55),dr=Math.abs(z-rz);if(dr<16)h=Math.min(h,dr<6?-2.6:-2.6+(h+2.6)*bxSS((dr-6)/10));return Math.min(h,bxBowl(x,z,-100,-100,34,-4))}},
 meadow:{n:'MEADOW',f:(x,z)=>Math.min(2+1.3*Math.sin(x/31)*Math.cos(z/27)+.9*Math.sin((x+z)/53)+1.5*bxSS(bxCl((Math.hypot(x-90,z+80)-20)/-60+1,0,1))*3,bxBowl(x,z,-80,70,42,-4))},
 mountain:{n:'MOUNTAIN',f:(x,z)=>{const d=Math.hypot(x-30,z-25);let m=d<38?30+4*(1-d/38):d<46?30-20*bxSS((d-38)/8):10*Math.pow(bxCl(1-(d-46)/70,0,1),1.2);
  return Math.min(Math.max(2+.8*Math.sin(x/23)*Math.cos(z/19),m),bxBowl(x,z,-95,-85,45,-4))}},
 canyon:{n:'CANYON',f:(x,z)=>{const cz=48*Math.sin(x/46),d=Math.abs(z-cz)*Math.cos(Math.atan(48/46*Math.cos(x/46))),pl=18+1.2*Math.sin(x/17)*Math.cos(z/21);
  if(d>32)return pl;if(d>22)return 2+(pl-2)*bxSS((d-22)/10);return d<7?2-5*bxSS(1-d/7):2}},
 city:{n:'CITY',f:(x,z)=>Math.min(2,bxBowl(x,z,70,-75,40,-4))},
 islands:{n:'ISLANDS',f:(x,z)=>{const b=(cx,cz,r,h)=>{const d=Math.hypot(x-cx,z-cz);return d<r?-5+(h+5)*bxSS(1-d/r):-5};return Math.max(b(-10,0,85,4),b(-95,85,45,12),b(100,90,50,7),b(90,-100,40,16))}}
};
const BX_CITY=[[-56,-40,18,18,22,'#c91a09'],[-24,-40,14,18,14,'#f2cd37'],[24,-40,18,14,30,'#0055bf'],[56,-40,14,14,18,'#a0a5a9'],[-56,40,16,16,26,'#237841'],
 [-20,40,18,16,12,'#fe8a18'],[20,40,16,18,34,'#e4cd9e'],[56,40,14,16,16,'#c91a09'],[-110,0,20,20,20,'#0055bf'],[110,10,16,24,24,'#f2cd37']];
function BX_world(w){BX.world=BX_WORLDS[w]?w:'valley';const f=BX_WORLDS[BX.world].f;for(let b=0;b<BXTN;b++)for(let a=0;a<BXTN;a++)BX.th[b*BXTN+a]=f(BXO+a*BXR,BXO+b*BXR);
 BX.bld=BX.world==='city'?BX_CITY.map(([x,z,w,d,h,c])=>({x,z,w,d,h,c,y:BX_h(x,z)})):[]}
function BX_brush(tool,x,z,y){const R=tool==='water'?14:12,a0=Math.max(0,Math.floor((x-R-BXO)/BXR)),a1=Math.min(BXTN-1,Math.ceil((x+R-BXO)/BXR)),b0=Math.max(0,Math.floor((z-R-BXO)/BXR)),b1=Math.min(BXTN-1,Math.ceil((z+R-BXO)/BXR)),T=BX.th,o=T.slice();
 for(let b=b0;b<=b1;b++)for(let a=a0;a<=a1;a++){const d=Math.hypot(BXO+a*BXR-x,BXO+b*BXR-z);if(d>R)continue;const w=bxSS(1-d/R),k=b*BXTN+a;
  if(tool==='raise')T[k]+=4*w;else if(tool==='lower')T[k]-=4*w;else if(tool==='flat')T[k]+=(y-T[k])*Math.min(1,w*1.6);
  else if(tool==='water')T[k]=Math.min(T[k],T[k]+(-3-T[k])*Math.min(1,w*1.8));
  else if(tool==='smooth'){const m=(BX_hv(a-1,b)+BX_hv(a+1,b)+BX_hv(a,b-1)+BX_hv(a,b+1))/4;T[k]=o[k]+(m-o[k])*w}
  T[k]=bxCl(T[k],-8,60)}}
// pieces sit IN the ground: terrain under a piece is cut to just below the deck, and lifted to it where the gap is small (embankment)
// a road below the ground cuts a flat 9 m shoulder, then ~39° walls (dev-2: the old near-vertical 16 m cut walls let the car drive INTO the rock)
function BX_carve(pc){const T=BX.th,R0=9,SL=.8,R=R0+24/SL;for(const S of pc.S)for(const s of S){if(s.U.y<.6)continue;const y=s.p.y-.18-4.2*Math.abs(s.S.y); // banked deck: below its LOW edge
 const a0=Math.floor((s.p.x-R-BXO)/BXR),a1=Math.ceil((s.p.x+R-BXO)/BXR),b0=Math.floor((s.p.z-R-BXO)/BXR),b1=Math.ceil((s.p.z+R-BXO)/BXR);
 for(let b=Math.max(0,b0);b<=Math.min(BXTN-1,b1);b++)for(let a=Math.max(0,a0);a<=Math.min(BXTN-1,a1);a++){const dx=BXO+a*BXR-s.p.x,dz=BXO+b*BXR-s.p.z;
  const dd=Math.hypot(dx,dz);if(dd>R)continue;const k=b*BXTN+a;if(dd<R0){if(T[k]>y||(dd<7&&y-T[k]<2.2))T[k]=y}else{const cap=y+(dd-R0)*SL;if(T[k]>cap)T[k]=cap}}}}
// ---------------------------------------------------------------- pieces (local: x = right, y = up, z = forward; origin = entry edge middle)
const bxRamp=t=>{const b=.25,c=1/(1-b);return t<b?c*t*t/(2*b):t>1-b?1-c*(1-t)*(1-t)/(2*b):c*(t-b/2)};
const bxCurve=(R,s)=>t=>{const a=t*Math.PI/2;return[s*(R-R*Math.cos(a)),0,R*Math.sin(a)]};
const BX_P={
 st:{n:'STRAIGHT',v:'top',p:[t=>[0,0,8*t]],ex:[[0,1,0,0]],k:3},
 cl:{n:'CURVE L',v:'top',p:[bxCurve(12,-1)],ex:[[-2,1,0,-1]],k:12},
 cr:{n:'CURVE R',v:'top',p:[bxCurve(12,1)],ex:[[2,1,0,1]],k:12},
 // ramps (trk-1, Alex: "the car moves backward"): slope eases in/out over 25 % of the length, so the PEAK grade is h/(L*.75); every ramp <= 25 %
 up:{n:'RAMP UP',v:'side',p:[t=>[0,4*bxRamp(t),24*t]],ex:[[0,3,2,0]],k:12},
 dn:{n:'RAMP DOWN',v:'side',p:[t=>[0,-4*bxRamp(t),24*t]],ex:[[0,3,-2,0]],k:12},
 lu:{n:'LONG RAMP UP',v:'side',p:[t=>[0,6*bxRamp(t),40*t]],ex:[[0,5,3,0]],k:16},
 ld:{n:'LONG RAMP DOWN',v:'side',p:[t=>[0,-6*bxRamp(t),40*t]],ex:[[0,5,-3,0]],k:16},
 su:{n:'TALL RAMP UP',v:'side',p:[t=>[0,8*bxRamp(t),48*t]],ex:[[0,6,4,0]],k:18},
 sd:{n:'TALL RAMP DOWN',v:'side',p:[t=>[0,-8*bxRamp(t),48*t]],ex:[[0,6,-4,0]],k:18},
 // the old short ramps (38 % / 75 %) only load old saved tracks (log v<2); not in the palette
 up1:{n:'RAMP UP',v:'side',p:[t=>[0,4*bxSS(t),16*t]],ex:[[0,2,2,0]],k:10},
 dn1:{n:'RAMP DOWN',v:'side',p:[t=>[0,-4*bxSS(t),16*t]],ex:[[0,2,-2,0]],k:10},
 su1:{n:'STEEP UP',v:'side',p:[t=>[0,8*bxSS(t),16*t]],ex:[[0,2,4,0]],k:12},
 sd1:{n:'STEEP DOWN',v:'side',p:[t=>[0,-8*bxSS(t),16*t]],ex:[[0,2,-4,0]],k:12},
 kk:{n:'JUMP',v:'side',p:[t=>[0,2.2*t*t,8*t]],ex:[[0,4,0,0]],k:8,jump:1},
 // kicker: 0.9 m lip at 12.7°, the road goes on flat behind it (land on it): ~0.6 s air at 55 km/h, ~1.1 s at 120 km/h
 kj:{n:'KICKER',v:'side',p:[t=>[0,.9*t*t,8*t]],ex:[[0,1,0,0]],k:8,jump:1},
 bl:{n:'BANK L',v:'top',p:[bxCurve(20,-1)],bank:t=>-.62*Math.sin(Math.PI*t),ex:[[-3,2,0,-1]],k:18},
 br:{n:'BANK R',v:'top',p:[bxCurve(20,1)],bank:t=>.62*Math.sin(Math.PI*t),ex:[[3,2,0,1]],k:18},
 // wide banked corners (radius 36 m: full speed, no braking)
 wbl:{n:'WIDE BANK L',v:'top',p:[bxCurve(36,-1)],bank:t=>-.42*Math.sin(Math.PI*t),ex:[[-5,4,0,-1]],k:30},
 wbr:{n:'WIDE BANK R',v:'top',p:[bxCurve(36,1)],bank:t=>.42*Math.sin(Math.PI*t),ex:[[5,4,0,1]],k:30},
 wl:{n:'WALL L',v:'top',p:[bxCurve(20,-1)],bank:t=>-1.2*Math.sin(Math.PI*t)**.8,ex:[[-3,2,0,-1]],k:22,stick:1},
 wr:{n:'WALL R',v:'top',p:[bxCurve(20,1)],bank:t=>1.2*Math.sin(Math.PI*t)**.8,ex:[[3,2,0,1]],k:22,stick:1},
 lp:{n:'LOOP',v:'side',p:[t=>{const a=2*Math.PI*t;return[8*bxSS(t),7*(1-Math.cos(a)),16*t+7*Math.sin(a)]}],ex:[[1,2,0,0]],k:64,stick:1},
 fk:{n:'SPLIT',v:'top',p:[t=>[-8*bxSS(t),0,16*t],t=>[8*bxSS(t),0,16*t]],ex:[[-1,2,0,0],[1,2,0,0]],k:8},
 // merge: the two SPLIT routes join again (entry = the left route's end; the right route ends 2 cells to the right: in)
 mg:{n:'MERGE',v:'top',p:[t=>[8*bxSS(t),0,16*t],t=>[16-8*bxSS(t),0,16*t]],ex:[[1,2,0,0]],in:[[2,0]],k:8},
 bo:{n:'BOOST',v:'top',p:[t=>[0,0,8*t]],ex:[[0,1,0,0]],k:3,boost:1},
 cp:{n:'CHECKPOINT',v:'top',p:[t=>[0,0,8*t]],ex:[[0,1,0,0]],k:3,cp:1},
 sf:{n:'START',v:'top',p:[t=>[0,0,8*t]],ex:[[0,1,0,0]],k:3,start:1}
};
const BX_PAL=['sf','st','cl','cr','wbl','wbr','up','dn','lu','ld','su','sd','kj','kk','lp','bl','br','wl','wr','fk','mg','bo','cp'];
function BX_fr(c){const f=BXF[c.r&3],rv=BXF[(c.r+1)&3],cx=BXO+(c.i+.5)*BXC,cz=BXO+(c.j+.5)*BXC;
 return{o:bxV(cx-f[0]*BXC/2,c.l*BXH,cz-f[1]*BXC/2),F:bxV(f[0],0,f[1]),R:bxV(rv[0],0,rv[1])}}
function BX_exit(c,e){const f=BXF[c.r&3],rv=BXF[(c.r+1)&3];return{i:c.i+e[0]*rv[0]+e[1]*f[0],j:c.j+e[0]*rv[1]+e[1]*f[1],l:c.l+e[2],r:(c.r+e[3]+4)&3}}
// samples along a path: p (centre), F (tangent), S (right, banked), U (surface normal), d (distance)
function BX_samp(def,fn,c){const fr=BX_fr(c),n=def.k,P=[],out=[];for(let k=0;k<=n;k++){const l=fn(k/n);P.push(fr.o.clone().addScaledVector(fr.R,l[0]).add(bxV(0,l[1],0)).addScaledVector(fr.F,l[2]))}
 let d=0;for(let k=0;k<=n;k++){const F=P[Math.min(n,k+1)].clone().sub(P[Math.max(0,k-1)]).normalize();let S=fr.R.clone().addScaledVector(F,-fr.R.dot(F)).normalize(),U=bxV().crossVectors(S,F).normalize();
  const b=def.bank?def.bank(k/n):0;if(b){const U2=U.clone().multiplyScalar(Math.cos(b)).addScaledVector(S,Math.sin(b));S.multiplyScalar(Math.cos(b)).addScaledVector(U,-Math.sin(b));U=U2}
  if(k)d+=P[k].distanceTo(P[k-1]);out.push({p:P[k],F,S,U,d,t:k/n})}return out}
// ---------------------------------------------------------------- materials / textures
function BX_tex(w,h,draw,rep){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
 t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;if(rep)t.repeat.set(rep[0],rep[1]);return t}
function BX_mats(){if(BX.M)return BX.M;const M=BX.M={};
 M.road=new THREE.MeshStandardMaterial({roughness:.85,map:BX_tex(128,256,(g,w,h)=>{g.fillStyle='#55585c';g.fillRect(0,0,w,h);for(let i=0;i<900;i++){g.fillStyle=`rgba(${Math.random()<.5?0:255},${Math.random()<.5?0:255},255,.05)`;g.fillRect(Math.random()*w,Math.random()*h,2,2)}
  g.fillStyle='#f4f4f4';g.fillRect(4,0,5,h);g.fillRect(w-9,0,5,h);g.fillStyle='#f2cd37';g.fillRect(w/2-3,0,6,h*.55)})});
 M.body=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.55});
 M.stud=BX_tex(64,64,(g,w,h)=>{g.fillStyle='#e8e8e8';g.fillRect(0,0,w,h);const r=g.createRadialGradient(w/2-5,h/2-5,2,w/2,h/2,w*.32);r.addColorStop(0,'#ffffff');r.addColorStop(.8,'#f0f0f0');r.addColorStop(1,'#bdbdbd');
  g.fillStyle=r;g.beginPath();g.arc(w/2,h/2,w*.3,0,7);g.fill();g.strokeStyle='rgba(0,0,0,.18)';g.lineWidth=2;g.stroke()});
 M.terr=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.8,map:M.stud});
 M.water=new THREE.MeshStandardMaterial({color:0x1e86e0,roughness:.18,metalness:.05,transparent:true,opacity:.84,map:BX_tex(64,64,(g,w,h)=>{g.fillStyle='#dfeeff';g.fillRect(0,0,w,h);g.strokeStyle='#ffffff';g.lineWidth=3;g.beginPath();g.arc(w/2,h/2,w*.28,0,7);g.stroke()},[220,220])});
 M.pil=new THREE.MeshStandardMaterial({roughness:.5,map:BX_tex(64,64,(g,w,h)=>{g.fillStyle='#d8d8d8';g.fillRect(0,0,w,h);g.fillStyle='#9a9a9a';g.fillRect(0,h-4,w,4);g.fillRect(w/2-1,0,2,h/2)}),color:0xe4cd9e});
 M.ghost=new THREE.MeshBasicMaterial({color:0x54ff7a,transparent:true,opacity:.42,depthWrite:false});
 M.hl=new THREE.MeshBasicMaterial({color:0xffe14d,transparent:true,opacity:.5,depthWrite:false});
 M.end=new THREE.MeshBasicMaterial({color:0xffd400});M.cur=new THREE.MeshBasicMaterial({color:0x22e0ff});
 M.bld=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.5,map:BX_tex(64,64,(g,w,h)=>{g.fillStyle='#ffffff';g.fillRect(0,0,w,h);g.fillStyle='#9fc7e8';g.fillRect(10,12,18,24);g.fillRect(36,12,18,24);g.fillStyle='#8a8a8a';g.fillRect(0,h-3,w,3)})});
 return M}
const bxCol=c=>new THREE.Color(c);
// piece mesh: road top (textured) + body (kerbs, sides, bottom; vertex colours). Collision uses these same meshes.
const BX_PROF=[[-6.5,0,-6.5,.14,1,0,'k'],[-6.5,.14,-7,.14,0,1,'k'],[-7,.14,-7,-.8,-1,0,'s'],[-7,-.8,7,-.8,0,-1,'b'],[7,-.8,7,.14,1,0,'s'],[7,.14,6.5,.14,0,1,'k'],[6.5,.14,6.5,0,-1,0,'k']];
// side barriers (Alex: "frustrated because of the multiple spawning"): a 1 m kerb-coloured wall on both edges keeps the car on the deck; SPLIT/MERGE have none (their lanes cross)
const BX_RAIL=[[-7,.14,-7,1.4,-1,0,'k'],[-7,1.4,-6.55,1.4,0,1,'k'],[-6.55,1.4,-6.55,.14,1,0,'k'],[6.55,.14,6.55,1.4,-1,0,'k'],[6.55,1.4,7,1.4,0,1,'k'],[7,1.4,7,.14,1,0,'k']];
function BX_geo(S,def){const rp=[],rn=[],ru=[],ri=[],bp=[],bc=[],bi=[],tmp=bxV(),cS=bxCol(def.boost?'#ff8a00':def.cp?'#0055bf':def.start?'#202020':'#a0a5a9'),cB=bxCol('#6d7276');
 for(let k=0;k<S.length;k++){const s=S[k];for(const x of[-BXRW,BXRW]){tmp.copy(s.p).addScaledVector(s.S,x);rp.push(tmp.x,tmp.y,tmp.z);rn.push(s.U.x,s.U.y,s.U.z);ru.push(x<0?0:1,s.d/8)}
  if(k){const a=(k-1)*2;ri.push(a,a+2,a+1,a+1,a+2,a+3)}}
 // fix winding of the road so its front face points along U
 {const A=bxV().fromArray(rp,0),B=bxV().fromArray(rp,6),C=bxV().fromArray(rp,3),n=bxV().crossVectors(B.clone().sub(A),C.clone().sub(A));if(n.dot(S[0].U)<0)for(let i=0;i<ri.length;i+=3){const t=ri[i+1];ri[i+1]=ri[i+2];ri[i+2]=t}}
 let vb=0;const kerbC=(k)=>((S[k].d/2|0)%2?bxCol('#c91a09'):bxCol('#f4f4f4'));
 for(const e of def.in||def.p.length>1?BX_PROF:[...BX_PROF,...BX_RAIL]){for(let k=1;k<S.length;k++){const q=[];for(const kk of[k-1,k])for(const[x,y]of[[e[0],e[1]],[e[2],e[3]]]){const s=S[kk];tmp.copy(s.p).addScaledVector(s.S,x).addScaledVector(s.U,y);q.push(tmp.clone())}
   const nE=S[k].S.clone().multiplyScalar(e[4]).addScaledVector(S[k].U,e[5]),n=bxV().crossVectors(q[2].clone().sub(q[0]),q[1].clone().sub(q[0]));
   const c=e[6]==='k'?kerbC(k):e[6]==='s'?cS:cB;for(const v of q){bp.push(v.x,v.y,v.z);bc.push(c.r,c.g,c.b)}
   if(n.dot(nE)>=0)bi.push(vb,vb+2,vb+1,vb+1,vb+2,vb+3);else bi.push(vb,vb+1,vb+2,vb+1,vb+3,vb+2);vb+=4}}
 const g1=new THREE.BufferGeometry();g1.setAttribute('position',new THREE.Float32BufferAttribute(rp,3));g1.setAttribute('normal',new THREE.Float32BufferAttribute(rn,3));g1.setAttribute('uv',new THREE.Float32BufferAttribute(ru,2));g1.setIndex(ri);
 const g2=new THREE.BufferGeometry();g2.setAttribute('position',new THREE.Float32BufferAttribute(bp,3));g2.setAttribute('color',new THREE.Float32BufferAttribute(bc,3));g2.setIndex(bi);g2.computeVertexNormals();
 g1.computeBoundingSphere();g2.computeBoundingSphere();return[g1,g2]}
// ---------------------------------------------------------------- the build (action log -> pieces + terrain)
function BX_mk(type,c,id){const def=BX_P[type];if(!def)return null;const S=def.p.map(fn=>BX_samp(def,fn,c));return{id,type,def,c:{...c},S,ex:def.ex.map(e=>BX_exit(c,e)),dead:false,meshes:[]}}
function BX_apply(a){if(a[0]==='w')BX_world(a[1]);else if(a[0]==='b')BX_brush(a[1],a[2],a[3],a[4]);
 else if(a[0]==='p'){const pc=BX_mk(a[1],{i:a[2],j:a[3],l:a[4],r:a[5]},BX.pcs.length);if(pc){BX.pcs.push(pc);BX_carve(pc)}}
 else if(a[0]==='d'){const pc=BX.pcs[a[1]];if(pc)pc.dead=true}}
function BX_replay(){BX.pcs=[];BX_world('valley');for(const a of BX.log)BX_apply(a);BX_buildAll()}
function BX_do(a){BX.log.push(a);if(a[0]==='p'){BX_apply(a);const pc=BX.pcs[BX.pcs.length-1];if(pc){BX_pcMesh(pc);BX.cur={...pc.ex[0]};BX.camGo=1}BX_terrMesh();BX_after()}
 else if(a[0]==='w'){BX_replay()}else{BX_apply(a);if(a[0]==='d')BX_pcDrop(BX.pcs[a[1]]);BX_terrMesh();BX_after()}}
function BX_undo(){if(!BX.log.length)return;const a=BX.log.pop();if(a[0]==='w'&&!BX.log.some(x=>x[0]==='w'))BX.log.unshift(['w','meadow']);BX_replay();
 const L=BX.pcs.filter(p=>!p.dead);if(a[0]==='p'){const c=a.slice(2);BX.cur={i:c[0],j:c[1],l:c[2],r:c[3]}}else if(L.length&&a[0]!=='b')BX.cur={...L[L.length-1].ex[0]}}
// spatial hash of piece meshes + course samples (8 m cells)
function BX_hashAll(){BX.hash=new Map();BX.samp=[];for(const pc of BX.pcs){if(pc.dead)continue;for(const S of pc.S)for(const s of S){BX.samp.push({s,pc});
 const ci=Math.floor(s.p.x/BXC),cj=Math.floor(s.p.z/BXC);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const k=(ci+a)*4096+(cj+b);let L=BX.hash.get(k);if(!L)BX.hash.set(k,L=new Set());L.add(pc)}}}}
function BX_near(x,z){const L=BX.hash&&BX.hash.get(Math.floor(x/BXC)*4096+Math.floor(z/BXC));return L?[...L]:[]}
function BX_pcMesh(pc){const M=BX_mats();for(const S of pc.S){const[g1,g2]=BX_geo(S,pc.def),a=new THREE.Mesh(g1,M.road),b=new THREE.Mesh(g2,M.body);
 for(const o of[a,b]){o.castShadow=o.receiveShadow=true;o.userData.pc=pc;BX.gP.add(o);pc.meshes.push(o)}}
 if(pc.def.cp||pc.def.start)BX_gate(pc);BX_hashAll();}
function BX_pcDrop(pc){if(!pc)return;for(const o of pc.meshes){BX.gP.remove(o);o.geometry&&o.geometry.dispose()}pc.meshes=[];BX_hashAll()}
function BX_gate(pc){const s=pc.S[0][Math.floor(pc.S[0].length/2)],g=new THREE.Group(),c=pc.def.start?0xf4f4f4:0x0055bf,m=new THREE.MeshStandardMaterial({color:c,roughness:.4}),bx=new THREE.BoxGeometry(1,7,1),top=new THREE.BoxGeometry(16,1.4,1);
 for(const x of[-7.6,7.6]){const p=new THREE.Mesh(bx,m);p.position.set(x,3.5,0);g.add(p)}const t=new THREE.Mesh(top,new THREE.MeshStandardMaterial({color:pc.def.start?0x202020:0xf2cd37,roughness:.4}));t.position.y=7.4;g.add(t);
 g.position.copy(s.p);g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(s.S.clone().negate(),s.U,s.F)); // (S,U,F) is left-handed: it rotated the posts onto the road centreg.traverse(o=>{o.castShadow=true});BX.gP.add(g);pc.meshes.push(g);
 g.children.forEach(o=>o.userData.pc=pc);BX.posts=BX.posts||[]}
function BX_buildAll(){if(!BX.sc)return;for(const o of[...BX.gP.children]){BX.gP.remove(o);o.geometry&&o.geometry.dispose()}for(const pc of BX.pcs)if(!pc.dead){pc.meshes=[];BX_pcMesh(pc)}
 BX_hashAll();BX_terrMesh();BX_bld();BX_after()}
// pillars (LEGO brick columns) under every deck that floats > 0.8 m over the ground; colliders = the same circles
function BX_pillars(){const M=BX_mats(),P=[];for(const pc of BX.pcs){if(pc.dead)continue;for(const S of pc.S){let last=-99;for(const s of S){if(s.U.y<.8||s.d-last<9)continue;
  for(const sx of[-2.6,2.6]){const x=s.p.x+s.S.x*sx,z=s.p.z+s.S.z*sx,top=s.p.y-.8,g=BX_h(x,z);
   if(top-g>.8&&!BX.samp.some(q=>q.pc!==pc&&q.s.p.y<top-1&&Math.abs(q.s.p.x-x)<5.5&&Math.abs(q.s.p.z-z)<5.5))P.push([x,z,g,top])}last=s.d}}}
 BX.pil=P;if(BX.pilM){BX.sc.remove(BX.pilM);BX.pilM.dispose()}if(!P.length){BX.pilM=null;return}
 const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1.6,1,1.6),M.pil,P.length),mt=new THREE.Matrix4();
 P.forEach(([x,z,g,t],i)=>{mt.makeScale(1,t-g+.3,1);mt.setPosition(x,(t+g)/2,z);im.setMatrixAt(i,mt)});im.castShadow=im.receiveShadow=true;BX.sc.add(im);BX.pilM=im}
// open ends (exits with no piece starting there) + the cursor
// every cell a piece can be entered from (a MERGE has two)
const BX_ents=p=>[p.c,...(p.def.in||[]).map(e=>BX_exit(p.c,[e[0],e[1],0,0]))];
function BX_ends(){const key=c=>c.i+','+c.j+','+c.l+','+c.r,ent=new Set(BX.pcs.filter(p=>!p.dead).flatMap(p=>BX_ents(p).map(key)));const E=[];
 for(const p of BX.pcs)if(!p.dead)for(const e of p.ex)if(!ent.has(key(e)))E.push(e);return E}
function BX_after(){BX_pillars();BX_marks();BX_ghost();BX_stats()}
function BX_marks(){if(BX.gE){BX.sc.remove(BX.gE)}const g=BX.gE=new THREE.Group();BX.sc.add(g);const M=BX_mats(),ar=new THREE.ConeGeometry(1.6,3.2,4);
 if(BX.mode!=='build')return;for(const e of BX_ends()){const fr=BX_fr(e),m=new THREE.Mesh(ar,M.end);m.position.copy(fr.o).addScaledVector(fr.F,2).add(bxV(0,1.4,0));m.quaternion.setFromUnitVectors(bxV(0,1,0),fr.F);m.userData.end=e;g.add(m)}
 const fr=BX_fr(BX.cur),ring=new THREE.Mesh(new THREE.TorusGeometry(4.6,.35,6,24),M.cur);ring.position.copy(fr.o).addScaledVector(fr.F,4).add(bxV(0,.3,0));ring.rotation.x=Math.PI/2;g.add(ring);
 const gy=BX_h(ring.position.x,ring.position.z);if(ring.position.y-gy>1){const post=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,ring.position.y-gy,6),M.cur);post.position.set(ring.position.x,(ring.position.y+gy)/2,ring.position.z);g.add(post)}}
function BX_ghost(){if(BX.gG){BX.sc.remove(BX.gG);BX.gG.traverse(o=>o.geometry&&o.geometry.dispose())}BX.gG=null;if(BX.mode!=='build'||BX.tab!=='track')return;
 const pc=BX_mk(BX.sel,BX.cur,-1);if(!pc)return;const g=BX.gG=new THREE.Group();for(const S of pc.S){const[g1,g2]=BX_geo(S,pc.def);g.add(new THREE.Mesh(g1,BX_mats().ghost),new THREE.Mesh(g2,BX_mats().ghost))}
 g.children.forEach(o=>o.userData.ghost=1);BX.sc.add(g)}
// ---------------------------------------------------------------- terrain mesh + world dressing
function BX_terrMesh(){const n=BXTN;if(!BX.tg){const g=BX.tg=new THREE.BufferGeometry(),p=new Float32Array(n*n*3),uv=new Float32Array(n*n*2),idx=[];
  for(let b=0;b<n;b++)for(let a=0;a<n;a++){const k=b*n+a;p[k*3]=BXO+a*BXR;p[k*3+2]=BXO+b*BXR;uv[k*2]=(BXO+a*BXR)/.8;uv[k*2+1]=(BXO+b*BXR)/.8;if(a<n-1&&b<n-1)idx.push(k,k+n,k+1,k+1,k+n,k+n+1)}
  g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setAttribute('color',new THREE.BufferAttribute(new Float32Array(n*n*3),3));g.setIndex(idx);
  BX.tm=new THREE.Mesh(g,BX_mats().terr);BX.tm.receiveShadow=true;BX.sc.add(BX.tm)}
 const g=BX.tg,p=g.attributes.position.array,c=g.attributes.color.array;for(let k=0;k<n*n;k++)p[k*3+1]=BX.th[k];g.attributes.position.needsUpdate=true;g.computeVertexNormals();
 const nm=g.attributes.normal.array,G1=bxCol('#4fb33a'),G2=bxCol('#3f9a2e'),RK=bxCol('#8d7b68'),RK2=bxCol('#a89a86'),SA=bxCol('#e0cf93'),tc=new THREE.Color();
 for(let k=0;k<n*n;k++){const h=BX.th[k],ny=nm[k*3+1];if(h<.4)tc.copy(SA);else if(ny<.72)tc.copy(h>20?RK2:RK);else tc.copy(G1).lerp(G2,bxCl((h-2)/30,0,1)*.7+((k*7919)%13)/60);c[k*3]=tc.r;c[k*3+1]=tc.g;c[k*3+2]=tc.b}
 g.attributes.color.needsUpdate=true;g.computeBoundingSphere();BX_trees()}
function BX_trees(){if(BX.trM){BX.sc.remove(BX.trM);BX.trM=null}const T=[],RK=[];let s=7;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;
 for(let i=0;i<60;i++){const x=BXO+16+rnd()*(BXW-32),z=BXO+16+rnd()*(BXW-32),h=BX_h(x,z);if(h<.3)continue;if(BX.samp&&BX.samp.some(({s})=>Math.abs(s.p.x-x)<10&&Math.abs(s.p.z-z)<10))continue;RK.push([x,z,h,1+rnd()*2.2])}
 BX.rk=RK;for(let i=0;i<150;i++){const x=BXO+20+rnd()*(BXW-40),z=BXO+20+rnd()*(BXW-40),h=BX_h(x,z),n=BX_tn(x,z);if(h<.6||n.y<.85)continue;
  if(BX.samp&&BX.samp.some(({s})=>Math.abs(s.p.x-x)<9&&Math.abs(s.p.z-z)<9))continue;if(BX.bld&&BX.bld.some(b=>Math.abs(b.x-x)<b.w/2+4&&Math.abs(b.z-z)<b.d/2+4))continue;T.push([x,z,h])}
 BX.tr=T;const gg=new THREE.Group();BX.sc.add(gg);BX.trM=gg;if(RK.length){const rm=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1,0),new THREE.MeshStandardMaterial({color:0x8f8a82,flatShading:true,roughness:.9}),RK.length),q=new THREE.Matrix4();
 RK.forEach(([x,z,h,r],i)=>{q.compose(bxV(x,h+r*.35,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(i,i*2,0)),bxV(r*1.3,r,r*1.1));rm.setMatrixAt(i,q)});rm.castShadow=rm.receiveShadow=true;gg.add(rm)}if(!T.length)return;const g=new THREE.Group(),tr=new THREE.InstancedMesh(new THREE.CylinderGeometry(.5,.6,3,6),new THREE.MeshStandardMaterial({color:0x7c4a1e}),T.length),
  lf=new THREE.InstancedMesh(new THREE.ConeGeometry(2.6,5,6),new THREE.MeshStandardMaterial({color:0x237841,flatShading:true}),T.length),mt=new THREE.Matrix4();
 const AC=[0x237841,0x2f8f3c,0xe07b16,0xf2b632,0xc4401b].map(c=>new THREE.Color(c));T.forEach(([x,z,h],i)=>{mt.makeTranslation(x,h+1.5,z);tr.setMatrixAt(i,mt);mt.makeTranslation(x,h+5,z);lf.setMatrixAt(i,mt);lf.setColorAt(i,AC[i%7<4?i%2:2+i%3])});
 tr.castShadow=lf.castShadow=true;lf.material.color.set(0xffffff);g.add(tr,lf);BX.trM.add(g)}
function BX_bld(){if(BX.bM){BX.sc.remove(BX.bM);BX.bM=null}if(!BX.bld||!BX.bld.length)return;const g=BX.bM=new THREE.Group();
 for(const b of BX.bld){const geo=new THREE.BoxGeometry(b.w,b.h,b.d),c=bxCol(b.c),col=[];for(let i=0;i<geo.attributes.position.count;i++)col.push(c.r,c.g,c.b);geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  const uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*b.w/6,uv.getY(i)*b.h/6);const m=new THREE.Mesh(geo,BX_mats().bld);m.position.set(b.x,b.y+b.h/2,b.z);m.castShadow=m.receiveShadow=true;g.add(m)}BX.sc.add(g)}
function BX_scene(){if(BX.sc)return;const sc=BX.sc=new THREE.Scene();BX_mats();
 const sky=new THREE.Mesh(new THREE.SphereGeometry(900,24,12),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,vertexShader:'varying vec3 vp;void main(){vp=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'varying vec3 vp;void main(){float h=clamp(normalize(vp).y,0.,1.);gl_FragColor=vec4(mix(vec3(.62,.82,1.),vec3(.08,.36,.86),pow(h,.55)),1.);}'}));sc.add(sky);
 sc.fog=new THREE.Fog(0xa9d3ff,260,700);sc.add(new THREE.HemisphereLight(0xcfe8ff,0x4f8f3a,1.1));
 const sun=BX.sun=new THREE.DirectionalLight(0xfff1d6,2.4);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);const sc2=sun.shadow.camera;sc2.left=sc2.bottom=-70;sc2.right=sc2.top=70;sc2.near=1;sc2.far=400;
 sun.shadow.bias=-.0006;sc.add(sun,sun.target);
 const w=new THREE.Mesh(new THREE.PlaneGeometry(1600,1600),BX_mats().water);w.rotation.x=-Math.PI/2;w.position.y=0;sc.add(w);BX.wM=w;
 const base=new THREE.Mesh(new THREE.PlaneGeometry(1600,1600),new THREE.MeshStandardMaterial({color:0x4fb33a,roughness:.9}));base.rotation.x=-Math.PI/2;base.position.y=-9;sc.add(base);
 // a few brick clouds (sparse: lesson 10, no white ceiling)
 const cm=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.9});for(let i=0;i<9;i++){const g=new THREE.Group();for(let j=0;j<3;j++){const b=new THREE.Mesh(new THREE.BoxGeometry(18-j*4,5,10-j*2),cm);b.position.set(j*7-7,j===1?3:0,0);g.add(b)}
  const a=i/9*Math.PI*2;g.position.set(Math.cos(a)*420,110+(i%3)*25,Math.sin(a)*420);g.lookAt(0,g.position.y,0);sc.add(g)}
 BX.gP=new THREE.Group();sc.add(BX.gP);BX.cam=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,.3,1500);BX.ray=new THREE.Raycaster();
 BX.fx=BX_fxInit()}
// splash / dust bricks (one small pool)
function BX_fxInit(){const n=60,m=new THREE.InstancedMesh(new THREE.BoxGeometry(.5,.35,.5),new THREE.MeshStandardMaterial({color:0xffffff,roughness:.4}),n);m.count=n;m.frustumCulled=false;
 const P=[];for(let i=0;i<n;i++)P.push({p:bxV(0,-99,0),v:bxV(),t:0});BX.sc.add(m);return{m,P,k:0,mt:new THREE.Matrix4()}}
function BX_burst(p,n,col,spd){const F=BX.fx;for(let i=0;i<n;i++){const o=F.P[F.k++%F.P.length];o.p.copy(p);o.v.set((Math.random()-.5)*spd,spd*(.5+Math.random()),(Math.random()-.5)*spd);o.t=1;o.c=col}}
function BX_fxStep(dt){const F=BX.fx,c=new THREE.Color();F.P.forEach((o,i)=>{if(o.t>0){o.t-=dt;o.v.y-=BXG*dt;o.p.addScaledVector(o.v,dt)}F.mt.makeTranslation(o.p.x,o.t>0?o.p.y:-99,o.p.z);F.m.setMatrixAt(i,F.mt);F.m.setColorAt(i,c.set(o.c||0xffffff))});
 F.m.instanceMatrix.needsUpdate=true;if(F.m.instanceColor)F.m.instanceColor.needsUpdate=true}
// ---------------------------------------------------------------- vehicle
function BX_car(){if(BX.car)return BX.car;const root=new THREE.Group();let mesh=null;
 try{mesh=shipMesh(TEAMS[typeof teamIdx!=='undefined'?teamIdx:0]);mesh.updateMatrixWorld(true)}catch(e){mesh=null}
 if(!mesh){mesh=new THREE.Group();const b=new THREE.Mesh(new THREE.BoxGeometry(2,1,4.2),new THREE.MeshStandardMaterial({color:0xc91a09}));b.position.y=.8;mesh.add(b)}
 const vbox=o=>{const B=new THREE.Box3();o.updateMatrixWorld(true);o.traverseVisible(q=>{if(q.isMesh){q.geometry.computeBoundingBox();B.union(q.geometry.boundingBox.clone().applyMatrix4(q.matrixWorld))}});return B};
 const box=vbox(mesh),sz=box.getSize(bxV()),k=4.3/Math.max(sz.x,sz.z,.1);mesh.scale.multiplyScalar(k);
 const b2=vbox(mesh);mesh.position.y-=b2.min.y;mesh.position.x-=(b2.min.x+b2.max.x)/2;mesh.position.z-=(b2.min.z+b2.max.z)/2;
 BX.cyaw=sz.x>sz.z?Math.PI/2:0;const inner=new THREE.Group();inner.add(mesh);inner.rotation.y=BX.cyaw;root.add(inner);
 mesh.traverse(o=>{if(o.isMesh)o.castShadow=true});BX.carM=mesh;
 const sh=new THREE.Mesh(new THREE.CircleGeometry(1.7,20),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.22,depthWrite:false}));sh.rotation.x=-Math.PI/2;BX.shM=sh;
 BX.car=root;return root}
function BX_vmode(v){const ud=BX.carM&&BX.carM.userData;try{if(ud&&ud.gbV)CR_vis({vmode:v},ud)}catch(e){}
 if(!(ud&&ud.gbV&&ud.gbV.boat)&&BX.carM)BX.carM.position.y=v==='boat'?-.4:BX.carM.position.y}
function BX_spawn(){const L=BX.pcs.filter(p=>!p.dead),st=L.find(p=>p.def.start)||L[0];let p,F;
 if(st){const s=st.S[0][1]||st.S[0][0];p=s.p.clone().addScaledVector(s.U,.6);F=s.F.clone()}else{const fr=BX_fr(BX.cur);p=fr.o.clone();p.y=BX_h(p.x,p.z)+.6;F=fr.F.clone()}
 return{p,F}}
function BX_driveStart(){BX.mode='drive';BX_after();const car=BX_car();BX.sc.add(car,BX.shM);const sp=BX_spawn();
 BX.v={p:sp.p.clone(),v:sp.F.clone().multiplyScalar(2),F:sp.F.clone(),U:bxV(0,1,0),g:false,air:0,pk:sp.p.y,on:null,boat:false,steer:0,boost:0,safe:{p:sp.p.clone(),F:sp.F.clone()},lastCp:null,tMin:BX.th.reduce((a,b)=>Math.min(a,b),1e9),fallPk:-1e9,hist:[],sT:0,far:0,stuck:0,cpN:0,lap:0,cps:new Set(),msg:'',msgT:0,lastPc:null};
 BX.m={t:0,dist:0,air:0,airMax:0,jumps:0,yMin:1e9,yMax:-1e9,off:0,resp:0,wall:0,boat:0,boatSp:0,terrT:0,swaps:0,bump:0,pcs:new Set(),seen:BX.seenAll=BX.seenAll||new Set(),loops:0,laps:0,lapT:[],lap0:0,respWhy:[],lastLand:null,backT:null,respAt:null,backs:[]};BX_vmode('car');BX_ui();
 BX.camD={p:sp.p.clone().addScaledVector(sp.F,-9).add(bxV(0,4,0)),up:bxV(0,1,0)}}
function BX_driveStop(){BX.mode='build';if(BX.car)BX.sc.remove(BX.car,BX.shM);BX_after();BX_ui()}
function BX_hud(){const V=BX.v,m=BX.m,H=$('#bxHud'),M=$('#bxMsg');if(!H)return;const cps=BX.pcs.filter(p=>!p.dead&&p.def.cp).length;
 H.textContent=`${Math.round(V.v.length()*3.6)} km/h · ${V.boat?'BOAT':'CAR'}${cps?' · CP '+V.cps.size+'/'+cps:''} · LAP ${m.laps+1}`;M.textContent=V.msgT>0?V.msg:''}
function BX_say(t,s=1.4){const V=BX.v;if(V){V.msg=t;V.msgT=s}}
function BX_respawn(why){const V=BX.v,m=BX.m,s=V.lastCp||V.safe,sp=6;if(why==='far'&&V.fallPk-V.p.y>16)why='cliff';V.fallPk=-1e9;
 V.hist=[];V.p.copy(s.p).add(bxV(0,.8,0));V.F.copy(s.F);V.U.set(0,1,0);V.v.copy(s.F).multiplyScalar(sp);V.g=false;V.air=0;V.pk=V.p.y;V.far=0;V.stuck=0;
 if(V.boat){V.boat=false;BX_vmode('car')}BX.m.resp++;BX.m.respWhy.push(why);(BX.m.respTs=BX.m.respTs||[]).push(BX.m.t);BX.m.respAt=BX.m.t;BX.m.backT=null;BX_say(why==='cliff'?'OFF THE CLIFF!':why==='far'?'TOO FAR FROM THE COURSE':'RESPAWN')}
const _r1=bxV(),_r2=bxV(),_r3=bxV();
// one wheel ray along -U: nearest hit on pieces (real meshes) or analytic terrain
function BX_cast(o,d,len,objs){let best=null;if(objs.length){BX.ray.set(o,d);BX.ray.near=0;BX.ray.far=len;const H=BX.ray.intersectObjects(objs,false);for(const h of H){if(!h.face)continue;best={d:h.distance,p:h.point.clone(),n:h.face.normal.clone(),pc:h.object.userData.pc};break}}
 if(d.y<-.45){let t=(o.y-BX_h(o.x,o.z))/-d.y;for(let i=0;i<3;i++){const x=o.x+d.x*t,z=o.z+d.z*t;t=(o.y-BX_h(x,z))/-d.y}
  if(t>=0&&t<=len&&(!best||t<best.d)){const p=o.clone().addScaledVector(d,t);best={d:t,p,n:BX_tn(p.x,p.z),pc:null}}}return best}
function BX_objs(p){const out=[];for(const pc of BX_near(p.x,p.z))for(const o of pc.meshes)if(o.isMesh)out.push(o);return out}
function BX_step(dt,inp){const V=BX.v,m=BX.m,F=V.F,U=V.U,S=bxV().crossVectors(F,U).normalize(); // S = right
 const objs=BX_objs(V.p),onStick=V.on&&V.on.def.stick,reach=V.g?1.0+.55+.7:1.0+.55+.15,H=[];let nh=0;
 for(const[fx,sx]of[[1.3,-.8],[1.3,.8],[-1.3,-.8],[-1.3,.8]]){const o=_r1.copy(V.p).addScaledVector(U,1).addScaledVector(F,fx).addScaledVector(S,sx);const h=BX_cast(o.clone(),U.clone().negate(),reach,objs);H.push(h);if(h)nh++}
 const wasG=V.g;let grounded=nh>=2,n=null,pc=null;
 if(grounded){const P=H.map(h=>h&&h.p);if(nh===4){n=bxV().crossVectors(_r2.copy(P[1]).sub(P[2]),_r3.copy(P[0]).sub(P[3])).normalize();if(n.dot(U)<0)n.negate()}
  else{n=bxV();for(const h of H)if(h)n.add(h.n);n.normalize()}
  for(const h of H)if(h&&h.pc){pc=h.pc;break}
  // a sudden normal change > 50° that is not part of a piece = a terrain wall: slide along it (no invisible walls; this is the visible slope)
  if(wasG&&n.dot(U)<Math.cos(.87)&&!pc){const nh2=bxV(n.x,0,n.z).normalize(),vn=V.v.dot(nh2);if(vn<0){V.v.addScaledVector(nh2,-vn*1.3);m.wall++}V.p.addScaledVector(nh2,.15);grounded=wasG;n=U.clone()}
  else if(!pc&&n.y<.42&&!V.boat){grounded=false}}
 // water: boat when the ground under the car is deep enough and the car is at the surface
 const gy=BX_h(V.p.x,V.p.z),wantBoat=gy<-.7&&V.p.y<.9&&!(grounded&&pc);
 if(wantBoat!==V.boat&&(wantBoat||grounded)){V.boat=wantBoat;BX_vmode(V.boat?'boat':'car');m.swaps++;BX_burst(V.p.clone().add(bxV(0,.3,0)),18,V.boat?0xbfe4ff:0x8d7b68,7);BX_say(V.boat?'SPLASH! BOAT':'BACK ON WHEELS',1)}
 const top=(V.boat?20:pc?34:27)+(V.boost>0?14:0),grip=V.boat?3.6:pc?11:6.5,acc=(V.boat?13:22)+(V.boost>0?18:0);
 V.steer+=(inp.s-V.steer)*Math.min(1,dt*7);
 if(V.boat){grounded=false;const wave=.12*Math.sin(BX.t*2.1+V.p.x*.2);V.p.y+=(.05+wave-V.p.y)*Math.min(1,dt*6);V.v.y*=.8;
  U.lerp(bxV(.06*Math.sin(BX.t*1.7),1,.06*Math.sin(BX.t*1.3)),Math.min(1,dt*4)).normalize();m.boat+=dt;
  if(Math.random()<dt*20*Math.min(1,V.v.length()/10))BX_burst(V.p.clone().addScaledVector(F,-2.4),1,0xffffff,2)}
 if(grounded){let dsum=0,c=0;for(const h of H)if(h){dsum+=h.d;c++}const err=(dsum/c)-(1+.5);if(wasG&&V.v.dot(n)>2.5&&err>.05&&!(pc&&pc.def.stick))grounded=false}
 if(grounded){U.lerp(n,Math.min(1,dt*(V.air>.2?12:20))).normalize();
  let dsum=0,c=0;for(const h of H)if(h){dsum+=h.d;c++}const err=(dsum/c)-(1+.5);V.p.addScaledVector(U,-err*Math.min(1,dt*25));
  const vn=V.v.dot(U);if(vn<0||!V.g||vn<3)V.v.addScaledVector(U,-vn);
  if(!wasG&&V.air>.25){if(V.air>.5){m.jumps++;m.air+=V.air;m.airMax=Math.max(m.airMax,V.air);m.lastLand={air:V.air,Uy:0,t:m.t};(m.lands=m.lands||[]).push({air:+V.air.toFixed(2),t:m.t,Uy:+n.y.toFixed(2)});BX_say('AIR '+V.air.toFixed(1)+' s!',1.1)}
   BX_burst(V.p.clone(),6,0xd8d8d8,4);if(!pc)V.fallPk=Math.max(V.fallPk,V.pk)}
  V.air=0;V.pk=V.p.y;
  const g=bxV(0,-BXG,0),gn=g.dot(U),stick=pc&&pc.def.stick&&V.v.length()>9;
  if(gn>BXG*.25&&!stick){grounded=false}else V.v.addScaledVector(g,dt).addScaledVector(U,-gn*dt)}
 if(grounded||V.boat){F.addScaledVector(U,-F.dot(U)).normalize();const sp=V.v.dot(F),yaw=-V.steer*2.1*Math.min(1,Math.abs(sp)/6)*(1-.38*Math.min(1,Math.abs(sp)/34))*Math.sign(sp||1);
  F.applyAxisAngle(U,yaw*dt).normalize();const S2=bxV().crossVectors(F,U).normalize();
  let a=inp.g*acc*Math.max(0,1-sp/top);if(inp.b){a=sp>.5?-24:sp>-9?-9:0}if(!inp.g&&!inp.b)a=-Math.sign(sp)*Math.min(Math.abs(sp)/dt,2.5);
  V.v.addScaledVector(F,a*dt);const vs=V.v.dot(S2);V.v.addScaledVector(S2,-vs*Math.min(1,grip*dt));if(V.v.dot(F)>top+2)V.v.addScaledVector(F,-(V.v.dot(F)-top)*Math.min(1,dt*2));
  if(m.lastLand&&m.t-m.lastLand.t<.4)m.lastLand.Uy=U.y;if(!pc&&!V.boat)m.terrT+=dt;if(V.boat)m.boatSp=Math.max(m.boatSp,V.v.length());
  if(pc){V.on=pc;V.fallPk=-1e9;m.pcs.add(pc.id);m.seen.add(pc.id);if(m.respAt!=null&&m.backT==null){m.backT=m.t-m.respAt;m.backs.push(+m.backT.toFixed(2))}if(pc.def.boost&&V.boost<=0){V.boost=1.6;BX_say('BOOST!',.8)}
   if(U.y>.94&&!pc.def.jump&&V.v.length()>2&&m.t-(V.sT||0)>.25){V.sT=m.t;V.hist.push({p:V.p.clone(),F:F.clone(),sp:V.v.length(),t:m.t});if(V.hist.length>40)V.hist.shift()}BX_course(pc)}else V.on=null}
 else{V.air+=dt;V.v.y-=BXG*dt;V.pk=Math.max(V.pk,V.p.y);U.lerp(bxV(0,1,0),Math.min(1,dt*1.6)).normalize();F.addScaledVector(U,-F.dot(U)).normalize();const ya=-inp.s*1.1*dt;F.applyAxisAngle(U,ya);
  {const vy=V.v.y;V.v.y=0;V.v.applyAxisAngle(bxV(0,1,0),ya*.8);V.v.y=vy}if(V.air>.1)V.on=null}
 V.g=grounded;if(V.boost>0)V.boost-=dt;
 // obstacles you can SEE: pillars, trees, buildings (circle/box push-out, glancing hits slide)
 const push=(nx,nz,d)=>{V.p.x+=nx*d;V.p.z+=nz*d;const vn=V.v.x*nx+V.v.z*nz;if(vn<0){V.v.x-=nx*vn*1.25;V.v.z-=nz*vn*1.25;if(vn<-6)m.bump++}};
 for(const[x,z,g,t]of BX.pil||[]){if(V.p.y>t-.4||V.p.y<g-1)continue;const dx=V.p.x-x,dz=V.p.z-z,d=Math.hypot(dx,dz);if(d<2&&d>.01)push(dx/d,dz/d,2-d)}
 for(const[x,z,h,r]of BX.rk||[]){if(V.p.y>h+r*1.2)continue;const dx=V.p.x-x,dz=V.p.z-z,d=Math.hypot(dx,dz),R=r*1.2+1;if(d<R&&d>.01)push(dx/d,dz/d,R-d)}
 for(const[x,z,h]of BX.tr||[]){if(V.p.y>h+8)continue;const dx=V.p.x-x,dz=V.p.z-z,d=Math.hypot(dx,dz);if(d<1.8&&d>.01)push(dx/d,dz/d,1.8-d)}
 for(const b of BX.bld||[]){if(V.p.y>b.y+b.h)continue;const dx=V.p.x-b.x,dz=V.p.z-b.z,ox=b.w/2+1.2-Math.abs(dx),oz=b.d/2+1.2-Math.abs(dz);if(ox>0&&oz>0){if(ox<oz)push(Math.sign(dx),0,ox);else push(0,Math.sign(dz),oz)}}
 // deck sides: a forward ray at bumper height against the piece meshes (walls = faces whose normal is far from our up)
 if(objs.length&&!V.boat){const sp=V.v.length();if(sp>1){const d=V.v.clone().normalize();BX.ray.set(V.p.clone().addScaledVector(U,.55),d);BX.ray.far=2.4+sp*dt;const h=BX.ray.intersectObjects(objs,false)[0];
  const hp=h&&h.object.userData.pc;if(h&&h.face&&h.face.normal.dot(U)<.5&&!(hp&&!hp.def.in&&hp.def.p.length===1&&hp===V.on)){const nw=h.face.normal,vn=V.v.dot(nw);if(vn<0){V.v.addScaledVector(nw,-vn*1.3);m.wall++;V.p.addScaledVector(nw,.2)}}}}
 // barriers: on a railed piece the car's centre stays within 2.5 m of the deck centre line; the outward speed is taken away (it slides along the wall)
 {const q=V.on&&!V.on.def.in&&V.on.S.length===1&&!H.some(h=>h&&h.pc&&h.pc!==V.on)?V.on:null;if(q&&!V.boat){let b=null,bd=1e9;for(const s of q.S[0]){const d=s.p.distanceToSquared(V.p);if(d<bd){bd=d;b=s}}
  const lat=_r1.copy(V.p).sub(b.p).dot(b.S),lim=5.4;if(Math.abs(lat)>lim&&Math.abs(lat)<8){const sg=Math.sign(lat);V.p.addScaledVector(b.S,(lim-Math.abs(lat))*sg);const vo=V.v.dot(b.S)*sg;if(vo>0){V.v.addScaledVector(b.S,-vo*sg);if(vo>4&&!V.rub)m.wall++;V.rub=.3}}}}if(V.rub>0)V.rub-=dt
 V.p.addScaledVector(V.v,dt);
 // respawn rules (the ONLY ones): below the terrain minimum, upside down >2 s (not in a loop), >40 m from the course >3 s (BX_farCheck)
 if(V.p.y<V.tMin-3)return BX_respawn('fall');
 if(U.y<0&&!(V.on&&V.on.def.stick)){V.stuck+=dt;if(V.stuck>2)return BX_respawn('stuck')}else V.stuck=0;
 m.t+=dt;m.dist+=V.v.length()*dt;{const vf=V.v.dot(F);if(vf<-1){m.backT=(m.backT||0)+dt;if(m.t<4)m.back0=(m.back0||0)+dt}}if(m.fwd3==null&&m.t>=3){const s0=BX.v.safe;m.fwd3=+V.p.clone().sub(s0.p).dot(s0.F).toFixed(1)}m.yMin=Math.min(m.yMin,V.p.y);m.yMax=Math.max(m.yMax,V.p.y);if(!grounded&&!V.boat||U.y<Math.cos(.07))m.off+=dt}
function BX_farCheck(dt){const V=BX.v;if(!BX.samp.length)return;let best=1e9;for(const{s}of BX.samp){const dx=s.p.x-V.p.x,dz=s.p.z-V.p.z,d=dx*dx+dz*dz;if(d<best)best=d}best=Math.sqrt(best);V.dCourse=+best.toFixed(1);
 if(best>40){V.far+=dt;if(V.far>3)BX_respawn('far')}else V.far=0}
// checkpoints and laps: START then every CHECKPOINT (any order), back over START = lap
function BX_course(pc){const V=BX.v,m=BX.m,cps=BX.pcs.filter(p=>!p.dead&&p.def.cp);if((pc.def.cp||pc.def.start)&&V.lastPc!==pc.id)V.lastCp={p:V.p.clone(),F:V.F.clone()};if(pc.def.cp&&!V.cps.has(pc.id)){V.cps.add(pc.id);BX_say('CHECKPOINT '+V.cps.size+'/'+cps.length,1)}
 if(pc.def.start&&V.lastPc!==pc.id){if(V.cps.size>=cps.length&&m.t-m.lap0>8){m.laps++;m.lapT.push(+(m.t-m.lap0).toFixed(2));m.lap0=m.t;V.cps=new Set();BX_say('LAP '+m.laps+' · '+m.lapT[m.lapT.length-1].toFixed(1)+' s',2)}}
 V.lastPc=pc.id;if(pc.def.stick&&pc.type==='lp'&&V.U.y<-.8&&!V.loopTop){V.loopTop=1;m.loops++;BX_say('LOOP!',1)}if(V.U.y>.5)V.loopTop=0}
// ---------------------------------------------------------------- cameras
function BX_camBuild(){const c=BX.camB;if(BX.camGo){const fr=BX_fr(BX.cur),k=.12;c.x+=(fr.o.x-c.x)*k;c.z+=(fr.o.z-c.z)*k;if(Math.hypot(fr.o.x-c.x,fr.o.z-c.z)<1)BX.camGo=0}const cam=BX.cam,t=bxV(c.x,BX_h(c.x,c.z)*.5,c.z);cam.position.set(t.x+Math.sin(c.yaw)*Math.cos(c.pit)*c.d,t.y+Math.sin(c.pit)*c.d,t.z+Math.cos(c.yaw)*Math.cos(c.pit)*c.d);cam.up.set(0,1,0);cam.lookAt(t);BX_sunAt(t)}
function BX_camDrive(dt){const V=BX.v,cam=BX.cam,D=BX.camD,air=!V.g&&!V.boat&&V.air>.3,stick=V.on&&V.on.def.stick;
 const up=stick?V.U.clone():bxV(0,1,0).lerp(V.U,.35).normalize(),Fh=V.F.clone();if(!stick){Fh.y*=.4;Fh.normalize()}
 const want=V.p.clone().addScaledVector(Fh,air?-10:-6.4).addScaledVector(up,air?4.2:2.3),k=1-Math.exp(-dt*(stick?14:6));D.p.lerp(want,k);D.up.lerp(up,1-Math.exp(-dt*5)).normalize();
 const gy=BX_h(D.p.x,D.p.z)+1;if(D.p.y<gy&&!stick)D.p.y=gy;cam.position.copy(D.p);cam.up.copy(D.up);cam.lookAt(V.p.clone().addScaledVector(Fh,4).addScaledVector(up,1.1));BX_sunAt(V.p)}
function BX_sunAt(t){const s=BX.sun;s.position.set(t.x+60,t.y+120,t.z+40);s.target.position.copy(t);s.target.updateMatrixWorld()}
// ---------------------------------------------------------------- frame
function BX_tick(now){const dt=BX.fast?1/60:Math.min(.05,(now-(BX.last||now))/1000);BX.last=now;BX.t+=dt;const cam=BX.cam;cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();
 if(BX.mode==='drive'&&BX.hold){BX_camDrive(0)}else if(BX.mode==='drive'){const inp=BX_input(dt);BX.acc+=dt;let n=0;while(BX.acc>=1/120&&n<10){BX_step(1/120,inp);BX.acc-=1/120;n++}BX_farCheck(dt);
  const V=BX.v;BX.car.position.copy(V.p);const S=bxV().crossVectors(V.F,V.U).normalize();BX.car.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(S.negate(),V.U,V.F));
  const gy=BX_h(V.p.x,V.p.z);BX.shM.visible=V.p.y-gy<14&&!V.boat;BX.shM.position.set(V.p.x,Math.max(gy,V.boat?0:gy)+.08,V.p.z);
  if(V.msgT>0)V.msgT-=dt;BX_camDrive(dt);BX_hud()}else BX_camBuild();
 BX_fxStep(dt);if(BX.wM)BX.wM.material.map.offset.set(BX.t*.01,BX.t*.006);
 BX.rf=(BX.rf||0)+1;if(BX.tfast&&BX.rf%6&&!BX.shotNow)return;BX.shotNow=0;const R=renderer;R.setRenderTarget(null);R.render(BX.sc,cam)}
// ---------------------------------------------------------------- input (keys + touch buttons; gas is on by default on touch)
addEventListener('keydown',e=>{if(!BX.on)return;BX.keys[e.code]=1;if(BX.mode==='drive'&&e.code==='KeyR')BX_respawn('key');if(e.code==='Escape')BX.mode==='drive'?BX_driveStop():BX_close();e.stopImmediatePropagation()},true);
addEventListener('keyup',e=>{if(!BX.on)return;BX.keys[e.code]=0;e.stopImmediatePropagation()},true);
function BX_input(){const K=BX.keys,T=BX.tc||{};const l=K.ArrowLeft||K.KeyA||T.l,r=K.ArrowRight||K.KeyD||T.r,kb=K.ArrowUp||K.KeyW,brk=K.ArrowDown||K.KeyS||K.Space||T.b;
 return{s:(r?1:0)-(l?1:0),g:(kb||BX.touch)&&!brk?1:0,b:brk?1:0}}
// ---------------------------------------------------------------- UI
function BX_css(){if($('#bxCss'))return;const s=document.createElement('style');s.id='bxCss';s.textContent=`
body.bxOn>*:not(#c):not(#bx){visibility:hidden!important}
#bx{position:fixed;inset:0;z-index:60;pointer-events:none;font:700 13px system-ui,-apple-system,sans-serif;color:#fff;user-select:none;-webkit-user-select:none}
#bx button{pointer-events:auto;font:800 12px system-ui,-apple-system,sans-serif;color:#fff;background:rgba(14,42,104,.86);border:2px solid rgba(255,255,255,.55);border-radius:10px;touch-action:manipulation;min-height:38px;padding:2px 6px;letter-spacing:.02em}
#bx button.on{background:#f2cd37;color:#14243f;border-color:#fff}
#bxTap{position:absolute;inset:0;pointer-events:auto;touch-action:none}
#bxTop{position:absolute;left:0;right:0;top:0;display:flex;gap:5px;align-items:center;padding:4px max(8px,env(safe-area-inset-right)) 0 max(8px,env(safe-area-inset-left))}
#bxTop button{min-height:32px}#bxInfo{flex:1;text-align:center;font-size:12px;text-shadow:0 1px 3px #000;white-space:nowrap;overflow:hidden}
#bxPal{position:absolute;left:0;top:42px;bottom:0;width:164px;padding:2px 6px 8px max(6px,env(safe-area-inset-left));overflow-y:auto;pointer-events:auto;display:grid;grid-template-columns:1fr 1fr;gap:5px;align-content:start;background:linear-gradient(90deg,rgba(8,24,60,.6),rgba(8,24,60,.25))}
#bxPal button{display:flex;flex-direction:column;align-items:center;justify-content:center;height:66px;padding:2px}#bxPal canvas{width:52px;height:36px}
#bxPal h4{grid-column:1/3;margin:6px 0 0;font-size:12px;color:#f2cd37}
#bxAct{position:absolute;right:0;top:42px;bottom:0;width:92px;display:flex;flex-direction:column;gap:5px;padding:0 max(6px,env(safe-area-inset-right)) 6px 4px}
#bxAct button{flex:1;min-height:36px;font-size:13px}#bxAct .go{background:#1f9e3a}
#bxD .st{position:absolute;bottom:max(10px,env(safe-area-inset-bottom));width:88px;height:88px;border-radius:50%;font-size:26px;background:rgba(14,42,104,.55)}
#bxHud{position:absolute;top:6px;left:50%;transform:translateX(-50%);text-align:center;font-size:14px;text-shadow:0 1px 3px #000;white-space:nowrap}
#bxMsg{position:absolute;top:30%;left:50%;transform:translateX(-50%);font:900 24px system-ui,sans-serif;color:#f2cd37;text-shadow:0 2px 0 #14243f,0 0 8px #000;white-space:nowrap}
#bxLoad{position:absolute;inset:44px 110px 10px 172px;background:rgba(8,24,60,.94);border-radius:12px;padding:8px;overflow-y:auto;pointer-events:auto;display:flex;flex-direction:column;gap:6px}
`;document.head.appendChild(s)}
function BX_icon(type){const c=document.createElement('canvas');c.width=104;c.height=72;const g=c.getContext('2d'),def=BX_P[type];g.lineCap='round';
 const P=def.p.map(fn=>{const a=[];for(let k=0;k<=24;k++)a.push(fn(k/24));return a}),xs=[],ys=[];for(const A of P)for(const l of A){xs.push(def.v==='side'?l[2]:l[0]);ys.push(def.v==='side'?l[1]:l[2])}
 const x0=Math.min(...xs,-4),x1=Math.max(...xs,4),y0=Math.min(...ys,0),y1=Math.max(...ys,def.v==='side'?4:8),k=Math.min(88/(x1-x0),56/(y1-y0));
 const X=v=>8+(v-x0)*k+(88-(x1-x0)*k)/2,Y=v=>66-(v-y0)*k-(56-(y1-y0)*k)/2;
 g.strokeStyle=def.boost?'#ff8a00':def.cp?'#4da3ff':def.start?'#fff':def.stick?'#ff5a4d':'#d6dbe0';g.lineWidth=def.v==='side'?7:Math.max(6,8*k);
 for(const A of P){g.beginPath();A.forEach((l,i)=>{const x=X(def.v==='side'?l[2]:l[0]),y=Y(def.v==='side'?l[1]:l[2]);i?g.lineTo(x,y):g.moveTo(x,y)});g.stroke()}
 if(def.v==='side'){g.strokeStyle='#4fb33a';g.lineWidth=3;g.beginPath();g.moveTo(0,Y(0)+5);g.lineTo(104,Y(0)+5);g.stroke()}return c}
const BX_TOOLS=[['raise','⬆ RAISE'],['lower','⬇ LOWER'],['flat','▬ FLATTEN'],['smooth','〰 SMOOTH'],['water','🌊 WATER']];
function BX_ui(){BX_css();let R=$('#bx');if(!R){R=document.createElement('div');R.id='bx';document.body.appendChild(R)}const d=BX.mode==='drive';
 R.innerHTML=d?`<div id="bxD"><button id="bxBack" style="position:absolute;top:6px;left:max(8px,env(safe-area-inset-left))">◀ BUILD</button><button id="bxRsp" style="position:absolute;top:6px;right:max(8px,env(safe-area-inset-right))">↺ RESPAWN</button>
  <div id="bxHud"></div><div id="bxMsg"></div><button class="st" id="bxL" style="left:max(14px,env(safe-area-inset-left))">◀</button><button class="st" id="bxR" style="left:calc(max(14px,env(safe-area-inset-left)) + 100px)">▶</button>
  <button class="st" id="bxB" style="right:max(14px,env(safe-area-inset-right));font-size:14px">BRAKE</button></div>`
 :`<div id="bxTap"></div><div id="bxTop"><button id="bxExit">◀ EXIT</button><button id="bxT1" class="${BX.tab==='track'?'on':''}">TRACK</button><button id="bxT2" class="${BX.tab==='land'?'on':''}">LAND</button>
  <div id="bxInfo"></div><button id="bxSave">💾 SAVE</button><button id="bxOpen">📂 LOAD</button></div><div id="bxPal"></div>
  <div id="bxAct">${BX.tab==='track'?'<button id="bxPlace">✔ PLACE</button><button id="bxTurn">↻ TURN</button><button id="bxUp">▲ UP</button><button id="bxDn">▼ DOWN</button><button id="bxDel">✖ DEL</button>':'<button id="bxView">⟲ VIEW</button>'}<button id="bxUndo">↶ UNDO</button><button id="bxGo" class="go">▶ DRIVE</button></div>`;
 const on=(id,f)=>{const b=$('#'+id);if(b)b.onclick=e=>{e.stopPropagation();try{AU.sfx&&AU.sfx('pick')}catch(_){}f()}};
 if(d){on('bxBack',BX_driveStop);on('bxRsp',()=>BX_respawn('button'));BX.tc={};for(const[id,k]of[['bxL','l'],['bxR','r'],['bxB','b']]){const b=$('#'+id),set=v=>e=>{e.preventDefault();BX.tc[k]=v;BX.touch=BX.touch||e.type.startsWith('touch')};
   b.addEventListener('touchstart',set(1),{passive:false});b.addEventListener('touchend',set(0));b.addEventListener('touchcancel',set(0));b.addEventListener('mousedown',set(1));b.addEventListener('mouseup',set(0));b.addEventListener('mouseleave',set(0))}
  BX.touch=matchMedia('(pointer:coarse)').matches;return}
 const P=$('#bxPal');if(BX.tab==='track'){for(const t of BX_PAL){const b=document.createElement('button');b.dataset.p=t;if(t===BX.sel)b.className='on';b.appendChild(BX_icon(t));b.append(BX_P[t].n);b.onclick=()=>{BX.sel=t;BX_ghost();P.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b))};P.appendChild(b)}}
 else{P.insertAdjacentHTML('beforeend','<h4>BRUSH · tap the ground</h4>');for(const[t,n]of BX_TOOLS){const b=document.createElement('button');b.dataset.t=t;b.textContent=n;b.style.height='44px';if(t===BX.tool)b.className='on';b.onclick=()=>{BX.tool=t;P.querySelectorAll('[data-t]').forEach(x=>x.classList.toggle('on',x===b))};P.appendChild(b)}
  P.insertAdjacentHTML('beforeend','<h4>WORLD · resets the ground</h4>');for(const w in BX_WORLDS){const b=document.createElement('button');b.dataset.w=w;b.textContent=BX_WORLDS[w].n;b.style.height='44px';if(w===BX.world)b.className='on';b.onclick=()=>{BX_do(['w',w]);BX_ui()};P.appendChild(b)}}
 on('bxExit',BX_close);on('bxT1',()=>{BX.tab='track';BX_ui();BX_ghost()});on('bxT2',()=>{BX.tab='land';BX_ui();BX_ghost()});on('bxPlace',BX_place);on('bxTurn',()=>{BX.cur.r=(BX.cur.r+1)&3;BX_after()});
 on('bxUp',()=>{BX.cur.l=Math.min(BX.cur.l+1,30);BX_after()});on('bxDn',()=>{BX.cur.l=Math.max(BX.cur.l-1,-3);BX_after()});on('bxDel',BX_del);on('bxUndo',()=>{BX_undo()});on('bxGo',BX_driveStart);on('bxView',()=>{BX.camB.yaw+=Math.PI/4});
 on('bxSave',BX_save);on('bxOpen',BX_loadUI);BX_stats();BX_tapInit()}
function BX_place(){const c=BX.cur;if(c.i<-2||c.j<-2||c.i>BXN+1||c.j>BXN+1)return;BX_do(['p',BX.sel,c.i,c.j,c.l,c.r])}
function BX_del(){const L=BX.pcs.filter(p=>!p.dead),pc=BX.hl>=0?BX.pcs[BX.hl]:L[L.length-1];if(!pc||pc.dead)return;BX.hl=-1;BX_do(['d',pc.id]);BX.cur={...pc.c};BX_after()}
function BX_stats(){const I=$('#bxInfo');if(!I)return;const L=BX.pcs.filter(p=>!p.dead);let lo=1e9,hi=-1e9;for(const p of L)for(const S of p.S)for(const s of S){lo=Math.min(lo,s.p.y);hi=Math.max(hi,s.p.y)}
 I.textContent=`${BX.name} · ${L.length} pieces${L.length?' · height '+Math.round(hi-lo)+' m':''} · level ${BX.cur.l}`}
// tap = place on the ghost / pick an open end / select a piece / move the cursor (TRACK) or paint the brush (LAND); drag = pan, pinch = zoom
function BX_tapInit(){const el=$('#bxTap');if(!el)return;const P=new Map();let moved=0,d0=0,z0=0;
 el.onpointerdown=e=>{el.setPointerCapture(e.pointerId);P.set(e.pointerId,{x:e.clientX,y:e.clientY,x0:e.clientX,y0:e.clientY});moved=0;if(P.size===2){const[a,b]=[...P.values()];d0=Math.hypot(a.x-b.x,a.y-b.y);z0=BX.camB.d}};
 el.onpointermove=e=>{const p=P.get(e.pointerId);if(!p)return;const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;if(Math.hypot(p.x-p.x0,p.y-p.y0)>9)moved=1;
  if(P.size===2){const[a,b]=[...P.values()];BX.camB.d=bxCl(z0*d0/Math.max(20,Math.hypot(a.x-b.x,a.y-b.y)),30,320);return}
  if(moved){const c=BX.camB,k=c.d/innerHeight*1.4,cs=Math.cos(c.yaw),sn=Math.sin(c.yaw);c.x=bxCl(c.x-(dx*cs+dy*sn)*k,-BXW/2,BXW/2);c.z=bxCl(c.z-(-dx*sn+dy*cs)*k,-BXW/2,BXW/2)}};
 el.onpointerup=el.onpointercancel=e=>{const p=P.get(e.pointerId);P.delete(e.pointerId);if(!p||moved||e.type==='pointercancel')return;BX_tap(e.clientX,e.clientY)};
 el.onwheel=e=>{BX.camB.d=bxCl(BX.camB.d*(e.deltaY>0?1.12:.89),30,320)}}
function BX_tap(x,y){const R=BX.ray,nd=new THREE.Vector2(x/innerWidth*2-1,-y/innerHeight*2+1);R.setFromCamera(nd,BX.cam);R.far=2000;R.near=0;
 if(BX.tab==='track'){const hm=R.intersectObjects(BX.gE?BX.gE.children:[],false).find(h=>h.object.userData.end);if(hm){BX.cur={...hm.object.userData.end};BX.hl=-1;BX_hlShow();return BX_after()}
  const hg=BX.gG?R.intersectObjects(BX.gG.children,false)[0]:null,hp=R.intersectObjects(BX.gP.children,true)[0];
  if(hg&&(!hp||hg.distance<hp.distance+2))return BX_place();
  if(hp&&hp.object.userData.pc){const pc=hp.object.userData.pc;BX.hl=BX.hl===pc.id?-1:pc.id;BX_hlShow();return}}
 const ht=R.intersectObject(BX.tm,false)[0];let pt=ht&&ht.point;if(!pt){const t=-R.ray.origin.y/R.ray.direction.y;if(t>0)pt=R.ray.origin.clone().addScaledVector(R.ray.direction,t)}if(!pt)return;
 if(BX.tab==='land'){BX_do(['b',BX.tool,+pt.x.toFixed(1),+pt.z.toFixed(1),BX.cur.l*BXH-.2]);return}
 const i=Math.floor((pt.x-BXO)/BXC),j=Math.floor((pt.z-BXO)/BXC),cy=BX_h(BXO+(i+.5)*BXC,BXO+(j+.5)*BXC);BX.cur={i,j,l:Math.max(0,Math.round(cy/BXH)),r:BX.cur.r};BX.hl=-1;BX_hlShow();BX_after()}
function BX_hlShow(){if(BX.hlM){BX.sc.remove(BX.hlM);BX.hlM=null}const pc=BX.pcs[BX.hl];if(!pc||pc.dead)return;const g=BX.hlM=new THREE.Group();for(const o of pc.meshes)if(o.isMesh){const m=new THREE.Mesh(o.geometry,BX_mats().hl);g.add(m)}BX.sc.add(g)}
// ---------------------------------------------------------------- save / load (the action log)
// tracks saved before v2 used the short steep ramps: keep their shape (legacy pieces up1/dn1/su1/sd1)
const BX_mig=o=>o.v>=2?o:{v:2,log:o.log.map(a=>a[0]==='p'&&{up:1,dn:1,su:1,sd:1}[a[1]]?[a[0],a[1]+'1',...a.slice(2)]:a)};
function BX_saved(){try{return JSON.parse(localStorage.getItem('bx_tracks')||'{}')}catch(e){return{}}}
function BX_save(){const S=BX_saved();if(BX.name==='MY TRACK'||BX_DEMOS[BX.name])BX.name='TRACK '+(Object.keys(S).length+1);S[BX.name]={v:2,log:BX.log};try{localStorage.setItem('bx_tracks',JSON.stringify(S))}catch(e){}BX_stats()}
function BX_load(o,name){BX.log=JSON.parse(JSON.stringify(o.log));BX.name=name||'TRACK';BX_replay();const L=BX.pcs.filter(p=>!p.dead);if(L.length){BX.cur={...L[L.length-1].ex[0]};const s=L[0].S[0][0].p;BX.camB.x=s.x;BX.camB.z=s.z}BX_after()}
function BX_loadUI(){const old=$('#bxLoad');if(old){old.remove();return}const D=document.createElement('div');D.id='bxLoad';const add=(t,f)=>{const b=document.createElement('button');b.textContent=t;b.onclick=()=>{D.remove();f()};D.appendChild(b)};
 D.insertAdjacentHTML('beforeend','<b style="font-size:13px">DEMO TRACKS</b>');if(BX_DEMOS_SHOW)for(const k in BX_DEMOS)add('★ '+k,()=>BX_load(BX_DEMOS[k],k));
 const S=BX_saved();D.insertAdjacentHTML('beforeend','<b style="font-size:13px">MY TRACKS</b>');for(const k in S)add(k,()=>BX_load(BX_mig(S[k]),k));
 add('✚ NEW EMPTY TRACK',()=>BX_load({log:[['w','valley']]},'MY TRACK'));add('✖ CLOSE',()=>{});$('#bx').appendChild(D)}
const BX_DEMOS={};
// ---------------------------------------------------------------- open / close
function BX_open(){BX_scene();try{if(!BX.sc.environment&&scene.environment)BX.sc.environment=scene.environment}catch(e){}BX.on=true;renderer.shadowMap.enabled=true;document.body.classList.add('bxOn');if(BX.tfast){renderer.setPixelRatio(.5);BX.sun.shadow.mapSize.set(1024,1024)}BX.mode='build';BX.last=0;for(const id of['#menu','#topBtns','#hud','#touch'])if($(id))$(id).hidden=true;
 if(!BX.log.length){BX.log=[['w','valley']];BX_replay()}else BX_buildAll();BX.camGo=1;BX_ui()}
function BX_close(){BX.on=false;document.body.classList.remove('bxOn');if(BX.mode==='drive')BX_driveStop();const R=$('#bx');if(R)R.remove();$('#menu').hidden=false;$('#topBtns').hidden=false;try{resize()}catch(e){}}
frame=(f=>function(now){if(!BX.on)return f(now);requestAnimationFrame(frame);try{BX_tick(now)}catch(e){console.error(e);BX.on=false}})(frame);
{const f=$('#home .hfoot');if(f){const b=document.createElement('button');b.id='bxMenuBtn';b.textContent='🏗 TRACK BUILDER';b.onclick=e=>{e.stopPropagation();BX_open()};f.appendChild(b)}}

// Race menu: the built-in builder tracks are listed after the city tracks (tap = open the builder on that track and drive it)
const BX_DEMOS_SHOW=false; // dev-2: hidden until the drivable/fun GO lines pass (Alex: "horrible"); the data stays (builder ★ list + GO tests)
function BX_raceMenu(){const tw=$('#tracks');if(!BX_DEMOS_SHOW||!tw||$('#pSetup').hidden)return;for(const k in BX_DEMOS){const b=document.createElement('button');b.className='trk bxTrk';
 b.insertAdjacentHTML('beforeend',`<b>🏗 ${k}</b><em>builder track · 1 lap</em>`);b.title='Built with the TRACK BUILDER. Open it in the builder to edit.';
 b.onclick=e=>{e.stopPropagation();BX_open();BX_load(BX_DEMOS[k],k);BX.camGo=1;BX.seenAll=new Set();BX_driveStart()};tw.appendChild(b)}}
buildMenu=(f=>function(){const r=f.apply(this,arguments);try{BX_raceMenu()}catch(e){console.warn(e)}return r})(buildMenu);

// ---------------------------------------------------------------- acceptance tests (checklist items 'bx-*', 📍 GO = BX_test(id); the automated run uses the same spawn)
function bxCh(w,c,L){const log=w?[['w',w]]:[];let cur={i:c[0],j:c[1],l:c[2],r:c[3]},sp=null;for(const t of L){if(Array.isArray(t)){cur={i:t[0],j:t[1],l:t[2],r:t[3]};continue}
 if(typeof t==='number'){cur={...sp[t]};continue}log.push(['p',t,cur.i,cur.j,cur.l,cur.r]);const ex=BX_P[t].ex.map(e=>BX_exit(cur,e));if(ex.length>1)sp=ex;cur=ex[0]}return log}
const bxRep=(t,n)=>Array(n).fill(t);
const bxCross=ids=>{const L=BX.pcs.filter(p=>ids.has(p.id));for(const A of L)for(const B of L){if(A===B)continue;for(const a of A.S[0])for(const b of B.S[0])if(Math.hypot(a.p.x-b.p.x,a.p.z-b.p.z)<4&&a.p.y-b.p.y>5)return true}return false};
// built-in tracks (dev-2, Alex: "I see no tracks made with the builder yet!!!"): plain builder logs, so ★ load + edit + save works like any track
// trk-1 rebuild (Alex on the first versions: "horrible! not fun, not easy to drive, the car moves backward"): every ramp <= 22 %, corners are the
// 36 m WIDE BANKs (full speed), one KICKER each (0.6-1.5 s air, flat landing), closed loops (the SPLIT joins again at a MERGE), laps ~1.4-1.7 km
Object.assign(BX_DEMOS,{
 // mountain: low start -> climb in two hairpins -> across the mesa top (kicker) -> elevated 30 m hairpin -> long descent -> home
 'CLIFF RUN':{log:bxCh('mountain',[8,4,1,3],['sf','st','st','kj',...bxRep('st',3),'cp',...bxRep('st',6),'kj',...bxRep('st',10),'wbr','st','wbr',
  'su','st','su','st','cp',...bxRep('st',8),'wbl','st','wbl','lu','su','bo',...bxRep('st',5),'kj',...bxRep('st',6),'wbr',...bxRep('st',5),'wbr',
  'st','st','sd','sd','cp','sd','ld','wbr','bo','fk',1,'wbr','st','wbl','st','wbl','st','wbr',0,...bxRep('st',7),'kj',...bxRep('st',11),'mg','st','wbr'])},
 // city figure-8: boat ramp across the lake -> up onto the 14 m bridge -> down -> between the blocks (kicker) -> under the bridge -> back to the lake
 'TWO-LEVEL CITY':{log:bxCh('city',[29,6,1,0],['fk',1,'dn',[28,13,-1,0],'up',0,...bxRep('st',8),'mg','su','up',...bxRep('st',4),'cp',...bxRep('st',2),'wbr','sf','st','st','sd','dn',...bxRep('st',6),'wbr',
  'bo',...bxRep('st',5),'kj',...bxRep('st',8),'kj',...bxRep('st',8),'wbr',...bxRep('st',9),'wbr',...bxRep('st',7),'kj',...bxRep('st',8),'wbl',...bxRep('st',4),'cp',...bxRep('st',4),'wbl',
  'bo',...bxRep('st',8),'kj',...bxRep('st',10),'wbl','wbl'])},
 // canyon snail on the 18 m plateau: SPLIT over the canyon (bridge, or down to the floor and up) -> MERGE -> viaduct along the canyon -> 26 m bridge over itself
 'CANYON SPLIT':{log:bxCh('canyon',[13,2,13,3],['sd','sf','st','bo',...bxRep('st',10),'wbr','fk',1,'wbr','st','wbl','st','st','st','wbl','st','wbr',0,...bxRep('st',21),'mg',
  'st','wbr',...bxRep('st',10),'kj',...bxRep('st',12),'cp','wbr','bo',...bxRep('st',6),'kj',...bxRep('st',8),'wbr',...bxRep('st',5),'kj',...bxRep('st',6),'wbr',...bxRep('st',8),'cp','wbr',...bxRep('st',7),'wbr','su',...bxRep('st',13),'wbr'])}});
// "drivable and fun" pass lines (coordinator 2026-10-13, after Alex: "horrible! not fun, not easy to drive, the car moves backward"):
// 0 backward start, <=1 respawn per lap, <=2 wall hits/min, average speed >=60 % of top, a 0.6-1.5 s jump with a clean landing, lap 45-90 s, no grade >25 %
function BX_grade(){let g=0,at='';for(const p of BX.pcs){if(p.dead||p.def.jump)continue;for(const S of p.S)for(let k=1;k<S.length;k++){const a=S[k-1].p,b=S[k].p,h=Math.hypot(b.x-a.x,b.z-a.z);if(h>.05){const q=Math.abs(b.y-a.y)/h;if(q>g){g=q;at=p.type}}}}return{g,at}}
function BX_fun(){const m=BX.m,laps=m.laps,hpm=(m.wall+m.bump)/Math.max(m.t/60,1e-3),avg=m.dist/Math.max(m.t,1e-3),TOP=34,G=BX_grade(),lap=m.lapT[0]||0,
 rs=m.respTs||[],J=(m.lands||[]).filter(l=>l.air>=.6&&l.air<=1.5&&l.Uy>.8&&!rs.some(t=>t>=l.t-l.air&&t<l.t+2)),
 L=[['0 backward start',!(m.back0>0),`backward ${(m.back0||0).toFixed(1)} s`],['>=15 m forward in 3 s',m.fwd3>=15,`forward ${(m.fwd3||0).toFixed(0)} m in 3 s`],['0 respawns',laps>=1&&m.resp===0,`respawns ${m.resp}/${laps} laps`],
  ['<=2 hits/min',hpm<=2,`hits ${hpm.toFixed(1)}/min`],['avg >=60 % top',avg>=.6*TOP,`avg ${Math.round(avg*3.6)} km/h (${Math.round(avg/TOP*100)} %)`],
  ['jump 0.6-1.5 s clean',J.length>0,`jumps ${(m.lands||[]).map(l=>l.air).join('/')||'none'}`],['lap 45-90 s',lap>=45&&lap<=90,`lap ${lap.toFixed(1)} s`],['grade <=25 %',G.g<=.25,`max grade ${Math.round(G.g*100)} % (${G.at})`]];
 return{ok:L.every(x=>x[1]),fails:L.filter(x=>!x[1]).map(x=>x[0]),msg:L.map(x=>(x[1]?'✔ ':'✘ ')+x[2]).join(', ')}}
const BX_TESTS={
 'bx-snap':{n:'SNAP TEST',log:()=>[['w','meadow']],drive:0,chk:()=>{const L=BX.pcs.filter(p=>!p.dead),key=c=>c.i+','+c.j+','+c.l+','+c.r,ex=new Set();let con=0;
  for(const p of L){if(ex.has(key(p.c)))con++;for(const e of p.ex)ex.add(key(e))}const step=new Set(L.map(p=>p.c.l)).size>1||L.some(p=>p.ex[0].l!==p.c.l);
  return{ok:L.length>=3&&con>=2&&step,msg:`${L.length} pieces, ${con} snapped, height step ${step?'yes':'no'}`}}},
 'bx-jump':{n:'CLIFF JUMP',log:()=>bxCh('mountain',[20,23,16,3],['sf',...bxRep('st',6),'kk',[30,23,14,3],...bxRep('st',4),'sd','sd','sd']),drive:1,
  chk:()=>{const m=BX.m,L=m.lastLand||{};return{ok:(L.air||0)>=1.5&&L.Uy>.7&&!m.respWhy.includes('cliff'),msg:`air ${(L.air||0).toFixed(2)} s, landed up ${(L.Uy||0).toFixed(2)}, respawns ${m.resp}`}}},
 'bx-offroad':{n:'OFF-ROAD',log:()=>bxCh('valley',[20,24,2,3],['sf','st']),drive:1,off:[[30,45],[38,58],[20,66],[0,62],[-10,48],[5,40],[25,40],[30,45],[38,58],[20,66],[0,62],[-10,48],[5,40],[25,40]],
  chk:()=>{const m=BX.m;return{ok:m.terrT>=10&&m.resp===0&&m.wall===0,msg:`terrain ${m.terrT.toFixed(1)} s, respawns ${m.resp}, invisible-wall hits ${m.wall}, tree/pillar bumps ${m.bump}`}}},
 'bx-cliff':{n:'CLIFF FALL',log:()=>bxCh('mountain',[23,23,16,2],['sf',...bxRep('st',5)]),drive:1,off:[[28,-40]],
  chk:()=>{const m=BX.m,i=m.respWhy.indexOf('cliff'),b=m.backs[i];return{ok:i>=0&&b!=null&&b<=2,msg:`respawn ${m.respWhy.join(',')||'none'}, back on course after ${b==null?'-':b} s`}}},
 'bx-water':{n:'WATER',log:()=>bxCh('valley',[20,13,1,0],['sf','st','st']),drive:1,off:[[4,-12],[22,-8],[30,-20],[14,-24],[4,-12],[22,-8],[30,-20],[14,-24]],
  chk:()=>{const m=BX.m;return{ok:m.boat>=3&&m.boatSp>8,msg:`boat ${m.boat.toFixed(1)} s, boat speed ${m.boatSp.toFixed(1)} m/s`}}},
 'bx-bridge':{n:'BRIDGE',log:()=>[...bxCh('city',[13,20,1,3],['sf',...bxRep('st',12)]),...bxCh(null,[20,6,1,0],['st','up','up',...bxRep('st',8),'dn','dn','st'])],drive:1,
  chk:()=>{const ok=bxCross(BX.m.seen||new Set());return{ok,msg:ok?'drove under and over the bridge':'not both levels yet'}}},
 'bx-split':{n:'SPLIT',log:()=>bxCh('valley',[14,24,2,3],['sf','st','fk','st','st','cl',1,'st','st','cr']),drive:1,
  chk:()=>{const S=BX.m.seen||new Set(),fk=BX.pcs.find(p=>p.type==='fk'),key=c=>c.i+','+c.j+','+c.l+','+c.r,br=fk?fk.ex.map(e=>BX.pcs.find(p=>key(p.c)===key(e))):[];
   const n=br.filter(p=>p&&S.has(p.id)).length;return{ok:n===2,msg:`split branches driven: ${n}/2`}}},
 'bx-world':{n:'NEW TRACK',log:()=>[['w','valley']],drive:0,chk:()=>{let lo=1e9,hi=-1e9;for(const h of BX.th){lo=Math.min(lo,h);hi=Math.max(hi,h)}let vis=0;const v=bxV();BX.cam.updateMatrixWorld();
  for(let k=0;k<BX.th.length;k+=3){if(BX.th[k]<20)continue;v.set(BXO+(k%BXTN)*BXR,BX.th[k],BXO+Math.floor(k/BXTN)*BXR).project(BX.cam);if(Math.abs(v.x)<1&&Math.abs(v.y)<1&&v.z<1)vis++}
  return{ok:hi-lo>=30&&vis>20,msg:`terrain range ${(hi-lo).toFixed(1)} m, ${vis} hill points (>20 m) on screen`}}},
 // dev-2 built-in tracks (Alex: "I see no tracks made with the builder yet!!!"): lap completes, >=15 m elevation, + each track's feature
 'bx-t-cliff':{n:'CLIFF RUN',log:()=>(BX_DEMOS['CLIFF RUN']||{log:[['w','mountain']]}).log,drive:1,
  chk0:()=>{const m=BX.m,r=m.yMax-m.yMin;return{ok:m.laps>=1&&r>=15&&BX.pcs.some(p=>p.def.bank&&m.seen.has(p.id)),msg:`laps ${m.laps}, elevation ${r.toFixed(1)} m, banked turn ${BX.pcs.some(p=>p.def.bank&&m.seen.has(p.id))?'yes':'no'}`}}},
 'bx-t-city':{n:'TWO-LEVEL CITY',log:()=>(BX_DEMOS['TWO-LEVEL CITY']||{log:[['w','city']]}).log,drive:1,
  chk0:()=>{const m=BX.m,r=m.yMax-m.yMin,cr=bxCross(m.seen||new Set());return{ok:m.laps>=1&&r>=15&&cr&&m.boat>=2,msg:`laps ${m.laps}, elevation ${r.toFixed(1)} m, over+under ${cr?'yes':'no'}, boat ${m.boat.toFixed(1)} s`}}},
 'bx-t-canyon':{n:'CANYON SPLIT',log:()=>(BX_DEMOS['CANYON SPLIT']||{log:[['w','canyon']]}).log,drive:1,
  chk0:()=>{const m=BX.m,r=m.yMax-m.yMin,S=m.seen||new Set(),key=c=>c.i+','+c.j+','+c.l+','+c.r,fk=BX.pcs.find(p=>p.type==='fk'),br=fk?fk.ex.map(e=>BX.pcs.find(p=>key(p.c)===key(e))):[],n=br.filter(p=>p&&S.has(p.id)).length;
   return{ok:m.laps>=1&&r>=15&&n===2,msg:`laps ${m.laps}, elevation ${r.toFixed(1)} m, routes driven ${n}/2`}}},
 'bx-elev':{n:'ELEVATION',log:()=>BX_DEMOS['CLIFF RUN']?BX_DEMOS['CLIFF RUN'].log:BX_TESTS['bx-jump'].log(),drive:1,
  chk:()=>{const m=BX.m;return{ok:m.yMax-m.yMin>=15,msg:`elevation range ${(m.yMax-m.yMin).toFixed(1)} m`}}}
};
// trk-1 data checks (coordinator 2026-10-13: "no laps as tests, assert the track data"): read from the built pieces, no driving
function BX_routeLen(ch){const W=window.__bx.route(ch);let d=0;for(let i=1;i<W.length;i++)d+=Math.hypot(W[i][0]-W[i-1][0],W[i][1]-W[i-1][1],W[i][2]-W[i-1][2]);
 const T=[...new Set(W.map(w=>w[3]+'#'+w[4]))].map(x=>x.split('#')[0]);return{d,kick:T.filter(t=>t==='kj'||t==='kk').length,boost:T.filter(t=>t==='bo').length}}
function BX_data(){const L=BX.pcs.filter(p=>!p.dead),key=c=>c.i+','+c.j+','+c.l+','+c.r,NS=new Set(L.flatMap(p=>BX_ents(p).map(key)));
 const gaps=L.flatMap(p=>p.ex.filter(e=>{if(NS.has(key(e)))return false;const o=BX_fr(e).o;return BX_h(o.x,o.z)>-.7}).map(()=>p.type));
 const noRail=L.filter(p=>!(p.def.in||p.def.p.length>1)&&!BX_RAIL.length).length,width=2*BXRW+1,G=BX_grade(),fk=L.some(p=>p.type==='fk')&&L.some(p=>p.type==='mg');
 const R=[BX_routeLen([0]),BX_routeLen([1])],short=fk?Math.abs(R[0].d-R[1].d):0,lo=Math.min(R[0].d,R[1].d),hi=Math.max(R[0].d,R[1].d);
 const C=[['rails on every piece',noRail===0,`${noRail} pieces without rails`],['width >=14 m',width>=14,`width ${width} m`],['0 gaps',gaps.length===0,`open ends ${gaps.length}${gaps.length?' ('+gaps.join(',')+')':''}`],
  ['>=3 jumps',Math.min(R[0].kick,R[1].kick)>=3,`jumps ${R[0].kick}/${R[1].kick}`],['>=2 boosts',Math.min(R[0].boost,R[1].boost)>=2,`boosts ${R[0].boost}/${R[1].boost}`],
  ['shortcut',fk&&short>=50,`shortcut ${fk?'saves '+short.toFixed(0)+' m':'none'}`],['grade <=25 %',G.g<=.25,`max grade ${Math.round(G.g*100)} %`],
  ['lap 1.5-2.7 km',lo>=1500&&hi<=2700,`lap ${(lo/1000).toFixed(2)}-${(hi/1000).toFixed(2)} km`]];
 return{ok:C.every(c=>c[1]),fails:C.filter(c=>!c[1]).map(c=>c[0]),msg:C.map(c=>(c[1]?'✔ ':'✘ ')+c[2]).join(', ')}}
// the bxT check: track data + the 3 s input check (GO -> GAS 3 s -> >=15 m forward, never backward)
for(const k of['bx-t-cliff','bx-t-city','bx-t-canyon']){const T=BX_TESTS[k];T.chk=()=>{const m=BX.m,D=BX_data(),i=[['>=15 m forward in 3 s',m.fwd3>=15,`forward ${(m.fwd3||0).toFixed(0)} m in 3 s`],['0 backward',!(m.back0>0),`backward ${(m.back0||0).toFixed(1)} s`]];
 const ok=D.ok&&i.every(x=>x[1]);return{ok,fails:[...D.fails,...i.filter(x=>!x[1]).map(x=>x[0])],msg:D.msg+' | '+i.map(x=>(x[1]?'✔ ':'✘ ')+x[2]).join(', ')}}}
function BX_test(id){const T=BX_TESTS[id];if(!T)return;const ck=$('#odChk');if(ck)ck.hidden=true;if(!BX.on)BX_open();if(BX.mode==='drive')BX_driveStop();
 BX_load({log:T.log()},T.n);BX.testId=id;BX.camGo=1;BX.seenAll=new Set();if(T.drive)BX_driveStart();return T.n}
window.__bx={BX,open:BX_open,close:BX_close,test:BX_test,check:id=>BX_TESTS[id||BX.testId].chk(),tests:()=>Object.keys(BX_TESTS),off:id=>BX_TESTS[id||BX.testId].off||null,
 proj:(x,y,z)=>{const v=bxV(x,y,z).project(BX.cam);return[(v.x+1)/2*innerWidth,(1-v.y)/2*innerHeight,v.z<1?1:0]},
 cell:(i,j,l)=>{const p=bxV(BXO+(i+.5)*BXC,l==null?BX_h(BXO+(i+.5)*BXC,BXO+(j+.5)*BXC):l*BXH,BXO+(j+.5)*BXC).project(BX.cam);return[(p.x+1)/2*innerWidth,(1-p.y)/2*innerHeight]},
 ghostXY:()=>{const pc=BX_mk(BX.sel,BX.cur,-1);if(!pc)return null;const s=pc.S[0][Math.floor(pc.S[0].length/2)],v=s.p.clone().project(BX.cam);return[(v.x+1)/2*innerWidth,(1-v.y)/2*innerHeight]},
 look:(x,z,d,yaw,pit)=>{Object.assign(BX.camB,{x,z,d:d||BX.camB.d,yaw:yaw==null?BX.camB.yaw:yaw,pit:pit||BX.camB.pit})},
 st:()=>{const V=BX.v;return{mode:BX.mode,cur:BX.cur,n:BX.pcs.filter(p=>!p.dead).length,log:BX.log.length,v:V&&{p:V.p.toArray().map(x=>+x.toFixed(2)),F:V.F.toArray().map(x=>+x.toFixed(3)),sp:+V.v.length().toFixed(2),g:V.g,boat:V.boat,air:+V.air.toFixed(2),Uy:+V.U.y.toFixed(2),on:V.on&&V.on.type,dC:V.dCourse},m:BX.m&&{...BX.m,pcs:BX.m.pcs.size}}},
 // the course as waypoints (for the test driver): follow exits from START, choosing branch ch[k] at the k-th SPLIT
 route:(ch=[])=>{const L=BX.pcs.filter(p=>!p.dead),key=c=>c.i+','+c.j+','+c.l+','+c.r,by=new Map(L.flatMap(p=>BX_ents(p).map(c=>[key(c),p])));let pc=L.find(p=>p.def.start)||L[0],k=0,out=[],seen=new Set();
  while(pc&&!seen.has(pc.id)){seen.add(pc.id);const b=pc.def.in?(out.length?pc.S.map((S,i)=>[i,Math.hypot(S[0].p.x-out[out.length-1][0],S[0].p.z-out[out.length-1][2])]).sort((a,c)=>a[1]-c[1])[0][0]:0):pc.S.length>1?(ch[k++]||0)%pc.S.length:0;for(const s of pc.S[b])out.push([+s.p.x.toFixed(2),+s.p.y.toFixed(2),+s.p.z.toFixed(2),pc.type,pc.id]);
   const e=pc.ex[Math.min(b,pc.ex.length-1)];pc=by.get(key(e))||L.filter(p=>!seen.has(p.id)).sort((a,c)=>{const A=a.S[0][0].p,C=c.S[0][0].p,E=BX_fr(e).o;return A.distanceTo(E)-C.distanceTo(E)})[0]}return out},
 h:(x,z)=>BX_h(x,z),log:()=>JSON.stringify({v:2,log:BX.log}),load:(o,n)=>BX_load(typeof o==='string'?JSON.parse(o):o,n)};
