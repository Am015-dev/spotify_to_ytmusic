// ---- TR1 (trees-1, 2026-10-16): LEGO-2K-Drive-style trees. Alex: "current trees look like blocks/sticks, not trees". The asset-1 LDraw builds were thin
// 1x1 round-brick trunks with a few flat leaf plates (edge-on from the road = sticks). These are chunky brick-built canopies instead (refs: docs/TREES_REF.md):
// 2-4 stacked round "brick" tiers + satellite clumps (bumpy round silhouette), chamfered edges, darker underside / lighter top in the vertex colours,
// studs on the top faces, tapered trunk with branch stubs, flower / fruit 1x1 plates for the blossom variants. All procedural, no assets (no licence).
// Same variant names as AS_R, so placement, the variant mix, near/mid InstancedMeshes (one draw call per variant and LOD), far impostors (rendered
// from the new mid build), colliders (unchanged trunk props) and smash/revive all keep working. Flag: ?tr1=0 (or TUNE.tr1=0) = the asset-1 LDraw trees.
// Per instance: hashed size (w .85-1.18, h .82-1.22) + hue/lightness jitter (instance colour). Low gfx tier: near = mid build (one LOD + impostors).
const TR1={on:!/[?&]tr1=0\b/.test(location.search)&&!(typeof TUNE!=='undefined'&&TUNE.tr1===0)};
// geometry kit: non-indexed triangles, positions in m, per-vertex colours (multiplied by the instance colour)
function TR1_K(seed,lod){const P=[],C=[],c=new THREE.Color(),n=lod==='n';let s=seed||1,parts=0,studs=0;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;
 const col=(k,m=1)=>{c.set(AS_COL[k]||k);return[Math.min(1,c.r*m),Math.min(1,c.g*m),Math.min(1,c.b*m)]};
 const T=(a,b,d,ca,cb,cd)=>{P.push(...a,...b,...d);C.push(...ca,...(cb||ca),...(cd||ca))};
 // ring of points around axis (a -> b) at t, radius r
 const frame=(a,b)=>{const d=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],L=Math.hypot(...d)||1;d[0]/=L;d[1]/=L;d[2]/=L;let u=Math.abs(d[1])<.9?[0,1,0]:[1,0,0];
  let x=[u[1]*d[2]-u[2]*d[1],u[2]*d[0]-u[0]*d[2],u[0]*d[1]-u[1]*d[0]];const lx=Math.hypot(...x);x=x.map(q=>q/lx);const y=[d[1]*x[2]-d[2]*x[1],d[2]*x[0]-d[0]*x[2],d[0]*x[1]-d[1]*x[0]];return{d,x,y}};
 const K={P,C,rnd,col,get parts(){return parts},get studs(){return studs},
  // tapered cylinder a -> b (trunks, branches, studs, flower plates); cap on top (b); colour per end
  seg(a,b,r0,r1,sides,ca,cb,cap=true,a0=0){parts++;const{x,y}=frame(a,b),R=(o,r,i)=>{const t=a0-i/sides*Math.PI*2,cs=Math.cos(t)*r,sn=Math.sin(t)*r;return[o[0]+x[0]*cs+y[0]*sn,o[1]+x[1]*cs+y[1]*sn,o[2]+x[2]*cs+y[2]*sn]};
   cb=cb||ca;for(let i=0;i<sides;i++){const p0=R(a,r0,i),p1=R(a,r0,i+1),q0=R(b,r1,i),q1=R(b,r1,i+1);T(p0,q1,p1,ca,cb,ca);T(p0,q0,q1,ca,cb,cb)}
   if(cap&&r1>0)for(let i=1;i<sides-1;i++)T(R(b,r1,0),R(b,r1,i+1),R(b,r1,i),cb)},
  stud(x,y,z,r,k){studs++;K.seg([x,y,z],[x,y+r*.75,z],r,r,n?6:4,col(k,1.06),col(k,1.16))},
  // canopy "brick" clump: chamfered round tier, dark underside -> light top, optional studs on the top face
  lump(x,y,z,r,h,k,ns=0,tilt=0){parts++;const sd=n?8:5,a0=rnd()*6.28,jl=.92+rnd()*.16,
   RG=[[r*.66,0,.56],[r,h*.26,.9],[r,h*.72,1.18],[r*.76,h,1.34]],ring=j=>{const[rr,yy]=RG[j];return Array.from({length:sd+1},(_,i)=>{const t=a0+i/sd*6.283;return[x+Math.cos(t)*rr,y+yy+Math.cos(t)*tilt*rr,z+Math.sin(t)*rr]})};
   const Rs=RG.map((_,j)=>ring(j)),Cs=RG.map(g=>col(k,g[2]*jl));for(let j=0;j<3;j++)for(let i=0;i<sd;i++){const A=Rs[j],B=Rs[j+1];T(A[i],B[i+1],A[i+1],Cs[j],Cs[j+1],Cs[j]);T(A[i],B[i],B[i+1],Cs[j],Cs[j+1],Cs[j+1])}
   const bc=col(k,.45*jl);for(let i=1;i<sd-1;i++)T(Rs[0][0],Rs[0][i],Rs[0][i+1],bc);for(let i=1;i<sd-1;i++)T(Rs[3][0],Rs[3][i+1],Rs[3][i],Cs[3]);
   if(n&&ns){const sr=Math.min(.2,r*.1);K.stud(x,y+h,z,sr,k);for(let i=0;i<ns-1;i++){const t=a0+i/(ns-1)*6.283+.3;K.stud(x+Math.cos(t)*r*.42,y+h+Math.cos(t)*tilt*r*.42,z+Math.sin(t)*r*.42,sr,k)}}},
  // stepped cone tier (conifers): short vertical skirt, then a cone; dark underside
  cone(y,r,h,k,top=.18){parts++;const sd=n?8:6,a0=rnd()*6.28,RG=[[r,0,.55],[r,h*.14,.8],[r*top,h,1.12]],Rs=RG.map(([rr,yy])=>Array.from({length:sd+1},(_,i)=>{const t=a0+i/sd*6.283;return[Math.cos(t)*rr,y+yy,Math.sin(t)*rr]})),Cs=RG.map(g=>col(k,g[2]));
   for(let j=0;j<2;j++)for(let i=0;i<sd;i++){const A=Rs[j],B=Rs[j+1];T(A[i],B[i+1],A[i+1],Cs[j],Cs[j+1],Cs[j]);T(A[i],B[i],B[i+1],Cs[j],Cs[j+1],Cs[j+1])}const bc=col(k,.4);for(let i=1;i<sd-1;i++)T(Rs[0][0],Rs[0][i],Rs[0][i+1],bc)},
  // 1x1 plates (flowers / fruit) on the side + top of a lump
  dots(x,y,z,r,h,m,ks){if(!n)m=Math.ceil(m/2);for(let i=0;i<m;i++){const t=rnd()*6.283,top=rnd()<.3,rr=r*(top?.45:.86),o=[x+Math.cos(t)*rr,y+h*(top?1:.84),z+Math.sin(t)*rr],d=top?[0,1,0]:[Math.cos(t)*.8,1,Math.sin(t)*.8],dl=Math.hypot(...d);
   K.seg(o,[o[0]+d[0]/dl*.1,o[1]+d[1]/dl*.1,o[2]+d[2]/dl*.1],Math.min(.27,r*.3),Math.min(.25,r*.28),n?6:4,col(ks[i%ks.length],1.05),col(ks[i%ks.length],1.2))}},// on the chamfered shoulder / top face, facing up-out (reads as a disc, not a stick)
  // palm frond: drooping 3-segment leaf, spine raised, both sides (light top, dark underside)
  frond(top,ang,L,W,k){parts++;const ca=Math.cos(ang),sa=Math.sin(ang),pt=(t,w,up)=>{const hz=t*L,yy=Math.sin(Math.PI*t*.8)*L*.22-t*t*L*.55+up;return[top[0]+ca*hz-sa*w,top[1]+yy,top[2]+sa*hz+ca*w]};
   const ns=n?4:3,lt=col(k,1.08),dk=col(k,.5);for(let i=0;i<ns;i++){const t0=i/ns,t1=(i+1)/ns,w0=W*Math.sin(Math.PI*(t0*.85+.08)),w1=W*Math.sin(Math.PI*(t1*.85+.08));
    const a=pt(t0,0,w0*.25),b=pt(t1,0,w1*.25),l0=pt(t0,-w0,0),l1=pt(t1,-w1,0),r0=pt(t0,w0,0),r1=pt(t1,w1,0);
    T(a,l1,l0,lt);T(a,b,l1,lt);T(a,r0,r1,lt);T(a,r1,b,lt);T(a,l0,l1,dk);T(a,l1,b,dk);T(a,r1,r0,dk);T(a,b,r1,dk)}},
  box(x0,x1,y0,y1,z0,z1,k,m=1){parts++;const v=(i)=>[i&1?x1:x0,i&2?y1:y0,i&4?z1:z0],ct=col(k,1.08*m),cs=col(k,.85*m),cb=col(k,.45*m),q=(a,b,d,e,cc)=>{T(v(a),v(b),v(d),cc);T(v(a),v(d),v(e),cc)};
   q(2,6,7,3,ct);q(0,1,5,4,cb);q(0,4,6,2,cs);q(1,3,7,5,cs);q(0,2,3,1,cs);q(4,5,7,6,cs)}};return K}
// round deciduous: trunk + forks, tiers [y, r, h] (bottom tier gets satellite clumps), colours [under, mid, top]
function TR1_round(K,o){const tk=o.bark||'RB',th=o.th;K.seg([0,0,0],[0,th,0],o.tr,o.tr*.7,K.n?7:5,K.col(tk,.8),K.col(tk,1));
 for(const[a,f]of[[.4,.62],[2.6,.75],[4.5,.55]].slice(0,o.br==null?2:o.br)){const y=th*f;K.seg([0,y,0],[Math.cos(a)*o.T[0][1]*.55,y+th*.32,Math.sin(a)*o.T[0][1]*.55],o.tr*.5,o.tr*.3,5,K.col(tk,.9),K.col(tk,1),false)}
 const ks=o.k;o.T.forEach(([y,r,h],i)=>{const k=ks[Math.min(i,ks.length-1)],dx=(K.rnd()-.5)*r*.12,dz=(K.rnd()-.5)*r*.12;K.lump(dx,y,dz,r,h,k,i===o.T.length-1?5:(i?4:0));
  if(i===0)for(let j=0,ns=K.n?o.sat||5:3;j<ns;j++){const t=j/ns*6.283+K.rnd()*.5,rr=r*(.5+K.rnd()*.12);K.lump(Math.cos(t)*r*.78,y+h*(.05+K.rnd()*.3),Math.sin(t)*r*.78,rr,h*.82,ks[(j&1)?0:1],K.rnd()<.5?3:0,.08)}
  if(o.dots)K.dots(dx,y,dz,r,h,o.dots[0]/o.T.length|0,o.dots[1])})}
// variant recipes (names = AS_R); H stays AS_R[name].H (scaled to it, like asset-1)
const TR1_R={
 oak:K=>TR1_round(K,{th:3.6,tr:.36,T:[[2.9,3.2,2.2],[4.8,2.6,1.9],[6.4,1.6,1.5]],k:['DG','G','BG']}),
 linden:K=>TR1_round(K,{th:3.8,tr:.34,T:[[3.2,2.5,2],[4.9,2.8,2],[6.6,2.3,1.9],[8.2,1.4,1.4]],k:['G','BG','BG','LI'],sat:6}),
 chestnut:K=>TR1_round(K,{th:3.4,tr:.4,T:[[2.8,3.3,2.2],[4.7,2.7,1.9],[6.3,1.7,1.5]],k:['DG','G','G'],dots:[30,['W','W','PK']]}),
 oakAut:K=>TR1_round(K,{th:3.6,tr:.36,T:[[2.9,3.2,2.2],[4.8,2.6,1.9],[6.4,1.6,1.5]],k:['DO','O','BLO'],dots:[12,['Y','R']]}),
 maple:K=>TR1_round(K,{th:3.8,tr:.34,T:[[3.2,2.6,2],[4.9,2.8,2],[6.6,2.1,1.8],[8.1,1.2,1.3]],k:['DR','R','R','O'],sat:6}),
 plane:K=>TR1_round(K,{th:4.4,tr:.42,bark:'T',br:3,T:[[3.8,3.5,2.1],[5.7,2.9,1.9],[7.3,1.8,1.5]],k:['G','BG','LI'],sat:6}),
 birch:K=>{for(let i=0;i<6;i++)K.seg([0,i*.9,0],[0,(i+1)*.9,0],.24-i*.015,.24-(i+1)*.015,K.n?6:5,K.col(i%2?'K':'W',i%2?1:.95),K.col(i%2?'K':'W'),i===5);
  [[3.6,1.5,1.7],[5,1.75,1.7],[6.5,1.5,1.6],[7.9,1,1.3]].forEach(([y,r,h],i)=>K.lump((K.rnd()-.5)*.3,y,(K.rnd()-.5)*.3,r,h,['BG','LI','LI','LI'][i],i===3?4:3))},
 fir:K=>{K.seg([0,0,0],[0,1.6,0],.32,.26,K.n?6:5,K.col('RB',.8),K.col('RB'));[[1.1,3,2.7],[3,2.45,2.5],[4.8,1.85,2.3],[6.5,1.25,2.1]].forEach(([y,r,h],i)=>K.cone(y,r,h,i&1?'BG':'#2E8B47'));
  K.cone(8.2,.6,1.6,'G',.05);K.stud(0,1.1+2.7*.14,0,.18,'DG')},
 stonepine:K=>{K.seg([0,0,0],[.5,4,.1],.36,.3,K.n?7:5,K.col('RB',.8),K.col('RB'));K.seg([.5,4,.1],[.2,7.2,-.1],.3,.24,5,K.col('RB'),K.col('RB'));K.seg([.4,5.6,0],[-1.6,7.1,.6],.18,.12,5,K.col('RB'),K.col('RB'),false);
  K.lump(0,6.9,0,3.7,1.2,'DG',0);for(let j=0;j<5;j++){const t=j/5*6.283;K.lump(Math.cos(t)*2.9,6.8+K.rnd()*.3,Math.sin(t)*2.9,1.5,1.05,j&1?'G':'DG',0)}K.lump(.2,7.9,.1,2.5,.9,'G',5)},
 aleppo:K=>{K.seg([0,0,0],[.6,3.2,0],.34,.26,K.n?7:5,K.col('MN',.8),K.col('MN'));K.seg([.6,3.2,0],[-.3,6,.4],.26,.18,5,K.col('MN'),K.col('MN'));K.seg([.6,3.2,0],[1.8,5.2,-.5],.18,.12,5,K.col('MN'),K.col('MN'),false);
  K.lump(1.8,4.6,-.5,1.7,1.4,'OG',3);K.lump(-.3,5.5,.4,2.2,1.6,'G',0);K.lump(0,6.9,.1,1.5,1.3,'OG',4);K.lump(-1.3,4.2,-.6,1.2,1.1,'SG',3)},
 olive:K=>{const b=K.col('DT',.85),t=K.col('DT');K.seg([0,0,0],[.2,1.3,0],.36,.3,K.n?7:5,b,t);K.seg([.2,1.3,0],[1.2,2.5,.3],.24,.16,5,t,t);K.seg([.2,1.3,0],[-.9,2.6,-.4],.24,.16,5,t,t);K.seg([.2,1.3,0],[0,2.8,.9],.2,.14,5,t,t,false);
  K.lump(1.2,2.3,.3,1.6,.9,'OG',3);K.lump(-.9,2.4,-.4,1.6,.95,'SG',3);K.lump(.1,2.6,.9,1.4,.85,'OG',0);K.lump(.1,3.1,0,1.7,.95,'SG',5);K.dots(.1,3.1,0,1.7,.95,8,['K'])},
 cypress:K=>{K.seg([0,0,0],[0,.8,0],.26,.22,K.n?6:5,K.col('RB',.8),K.col('RB'));for(let i=0;i<9;i++){const y=.45+i*.92,r=1.12-i*.06-(i>5?(i-5)*.13:0);K.lump(0,y,0,r,1.4,i&1?'BG':'G',i===8?3:0)}K.cone(8.7,.42,1,'G',.1)},
 palm:K=>{let p=[0,0,0];const L=8;for(let i=0;i<L;i++){const t=(i+1)/L,q=[Math.sin(t*1.7)*1.1,t*8.4,0];K.seg(p,q,.44-i*.02,.36-i*.02,K.n?7:5,K.col(i&1?'DT':'MN',.8),K.col(i&1?'DT':'MN',1.1),i===L-1);p=q}
  K.stud(p[0],p[1],p[2],.2,'BG');for(let j=0;j<9;j++)K.frond(p,j/9*6.283+K.rnd()*.3,3.4+K.rnd()*.7,.68,j%3?'BG':'G');for(let j=0;j<3;j++){const t=j/3*6.283+.5;K.lump(p[0]+Math.cos(t)*.32,p[1]-.55,p[2]+Math.sin(t)*.32,.24,.36,'MN',0)}},
 orange:K=>{K.seg([0,0,0],[0,1.5,0],.2,.16,K.n?6:5,K.col('RB',.8),K.col('RB'));K.lump(0,1.3,0,1.7,1.5,'G',0);K.lump(0,2.6,0,1.3,1.2,'BG',4);K.dots(0,1.3,0,1.7,1.5,10,['O']);K.dots(0,2.6,0,1.3,1.2,5,['O'])},
 almond:K=>TR1_round(K,{th:2.6,tr:.26,bark:'DT',T:[[2.2,2.1,1.6],[3.5,1.8,1.4],[4.6,1.1,1]],k:['BG','G','BG'],dots:[40,['W','PK','W','#FFC8DC']],sat:4}),
 bush:K=>{K.lump(0,0,0,.95,1.05,'G',3);K.lump(.7,0,.3,.6,.85,'DG',0);K.lump(-.6,0,-.35,.62,.9,'BG',3);K.lump(0,.85,0,.55,.55,'BG',3)},
 bushFl:K=>{K.lump(0,0,0,.95,1.05,'G',0);K.lump(.7,0,.3,.6,.85,'BG',0);K.lump(-.6,0,-.35,.62,.9,'G',0);K.lump(0,.85,0,.55,.5,'BG',3);K.dots(0,0,0,.95,1.05,12,['Y','PK','W','LV'])},
 oleander:K=>{K.lump(0,0,0,.8,1.1,'G',0);K.lump(.2,.9,.1,.75,1,'BG',0);K.lump(-.1,1.7,0,.5,.6,'G',3);K.dots(0,0,0,.8,1.1,6,['PK','W']);K.dots(.2,.9,.1,.75,1,8,['PK','PK','W'])},
 // street props (fit to the city's mesh like asset-1): hedge = brick box with lumpy top + flowers; planter = brick box, soil, two clumps, flower plates
 p_hedge:K=>{K.box(-1.2,1.2,0,.12,-.45,.45,'DBG');K.box(-1.15,1.15,.12,.95,-.4,.4,'BG',.92);for(let i=0;i<4;i++)K.lump(-.86+i*.57,.82,(K.rnd()-.5)*.1,.42,.42,i&1?'BG':'G',3,0)},
 p_planter:K=>{K.box(-1,1,0,.55,-.45,.45,'T');K.box(-.9,.9,.55,.6,-.36,.36,'RB',.8);K.lump(-.42,.55,0,.42,.5,'G',3);K.lump(.42,.55,0,.42,.5,'BG',0);K.dots(-.42,.55,0,.42,.5,6,['R','Y','PK']);K.dots(.42,.55,0,.42,.5,6,['W','LV','Y'])}};
// asset-1 hook: build a variant from TR1_R (same output shape as AS_build: userData.as {parts,studs,tris,ids,H,rx})
function TR1_build(name,lod,fit){const R=AS_R[name],K=TR1_K(name.length*7919+13,lod);K.n=lod==='n';TR1_R[name](K);let ymax=0;for(let i=1;i<K.P.length;i+=3)if(K.P[i]>ymax)ymax=K.P[i];
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(K.P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(K.C,3));
 let k=R.H/ymax;if(fit){g.computeBoundingBox();const b=g.boundingBox;k=fit[1]/(fit[0]==='x'?b.max.x-b.min.x:ymax)}g.scale(k,k,k);g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();const bb=g.boundingBox;
 g.userData.as={name,lod,tr1:1,parts:K.parts,studs:K.studs,tris:K.P.length/9,ids:['tr1'],H:bb.max.y,rx:Math.max(-bb.min.x,bb.max.x,-bb.min.z,bb.max.z)};return g}
const TR1_low=()=>{try{return typeof GFX_tier==='function'&&GFX_tier()==='off'}catch(e){return false}};
// per instance: hashed size + colour jitter (only for TR1 trees/bushes; respects the city-var p.cvs when that is on)
const TR1_h=(x,z,s)=>{const h=Math.sin(x*12.9898+z*78.233+s*37.719)*43758.5453;return h-Math.floor(h)};
function TR1_s(p){if(!TR1.on||p.cvs||!p.av||!TR1_R[p.av]||AS_R[p.av].prop)return;const a=TR1_h(p.x,p.z,1),b=TR1_h(p.x,p.z,2);p.cvs=[.85+.33*a,.82+.4*(.5*a+.5*b)]}
const TR1_c=new THREE.Color();
function TR1_col(p){const l=.84+.16*TR1_h(p.x,p.z,5),w=(TR1_h(p.x,p.z,3)-.5)*.16;return TR1_c.setRGB(Math.min(1,l*(1+w)),l,Math.min(1,l*(1-w)))}// warm / cool, light / dark
window.__tr1={TR1,R:TR1_R,build:TR1_build};
// test: render variants (old asset-1 build with old=1) into a grid image (dataURL), sky-blue background, 22° above, for docs/shots/trees1
window.__tr1.gallery=(names,old,lod='n',cw=284,ch=262,cols=6)=>{const on=TR1.on;TR1.on=!old;const rows=Math.ceil(names.length/cols),cv=document.createElement('canvas');cv.width=cw*cols;cv.height=ch*rows;const x2=cv.getContext('2d');
 const sc=new THREE.Scene();sc.background=new THREE.Color('#5d9cf0');sc.add(new THREE.HemisphereLight(0xdfefff,0x55603a,1.5));const sun=new THREE.DirectionalLight(0xfff2dd,2.6);sun.position.set(.6,1,.8);sc.add(sun);
 const mat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.32,metalness:0}),ms=new THREE.Mesh(undefined,mat),gr=new THREE.Mesh(new THREE.CylinderGeometry(1,1,.05,24),new THREE.MeshStandardMaterial({color:'#6cc24a',roughness:.8}));sc.add(ms,gr);
 const cam=new THREE.PerspectiveCamera(30,cw/ch,.1,500),rt=new THREE.WebGLRenderTarget(cw,ch),px=new Uint8Array(cw*ch*4),id=x2.createImageData(cw,ch);let tris={};
 names.forEach((n,i)=>{const pr=AS_R[n].prop,g=AS_build(n,lod,pr?['x',2.4]:null);tris[n]=g.userData.as.tris;ms.geometry=g;const b=g.boundingBox,r=Math.max(b.max.x-b.min.x,b.max.z-b.min.z)/2,h=b.max.y,D=Math.max(h,r*2)*2.1+1;
  gr.scale.set(r*1.4,1,r*1.4);cam.position.set(D*.82,h*.5+D*Math.sin(.38),D*.55);cam.lookAt(0,h*.45,0);renderer.setRenderTarget(rt);renderer.render(sc,cam);renderer.readRenderTargetPixels(rt,0,0,cw,ch,px);
  for(let y=0;y<ch;y++)id.data.set(px.subarray((ch-1-y)*cw*4,(ch-y)*cw*4),y*cw*4);x2.putImageData(id,(i%cols)*cw,Math.floor(i/cols)*ch);x2.fillStyle='#fff';x2.font='bold 16px sans-serif';x2.fillText(n+(old?' (old)':'')+' '+tris[n]+' tris',(i%cols)*cw+8,Math.floor(i/cols)*ch+20)});
 renderer.setRenderTarget(null);TR1.on=on;return{url:cv.toDataURL('image/jpeg',.88),tris}};
// checklist GO tr1/models (src/99c_checklist.js): every tree/bush variant of this city is a TR1 build, ≥ 6 tree kinds, near ≤ 1500 tris with studs, mid ≤ 900
window.__tr1.go=()=>{if(!TR1.on)return'📍 PENDING · old trees (?tr1=0)';const V=AS_variants(),L=Object.keys(V).filter(n=>TR1_R[n]&&!AS_R[n].prop),T=L.filter(n=>AS_R[n].far!=='bush'),u=n=>V[n].gn.userData.as,m=n=>V[n].gm.userData.as;
 const bad=L.filter(n=>!u(n).tr1||u(n).tris>1500||m(n).tris>900||(V[n].gn!==V[n].gm&&u(n).studs<1)),ok=!bad.length&&T.length>=6;
 return`📍 TR1 MODELS: ${L.length} LEGO tree/bush builds (${T.length} trees: ${T.join(' ')}) · near ${Math.min(...L.map(n=>u(n).tris))}-${Math.max(...L.map(n=>u(n).tris))} tris, mid ${Math.min(...L.map(n=>m(n).tris))}-${Math.max(...L.map(n=>m(n).tris))}${bad.length?' · BAD '+bad.join(' '):''} ${ok?'✅':'❌'}`};
