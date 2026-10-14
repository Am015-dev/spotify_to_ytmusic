// ===== BV (art-3, 2026-10-14): building / street VARIETY. Alex: "environments are extremely repetitive, boring and flat".
// Every building gets a variant key = facade type + roof type (Athens: kind + facade texture + roof; Frankfurt: Kenney model + roof crown).
// Placement asks BV_pick for the option used LEAST within 100 m (ties broken by a position hash), so no street repeats one look.
// Test (checklist bv1/*, GO parks you on the densest street): same variant within 100 m ≤ 20 %, ≥ 3 facade types per 80 m block. ?bv=0 = off.
const BV={on:!/[?&]bv=0\b/.test(location.search),G:new Map(),C:80,last:null};
const BV_k=(x,z)=>Math.floor(x/BV.C)*100000+Math.floor(z/BV.C);
function BV_reset(){BV.G=new Map();BV.RB=[]}
function BV_add(x,z,key,fac,o){const k=BV_k(x,z);let A=BV.G.get(k);if(!A)BV.G.set(k,A=[]);A.push(Object.assign({x,z,key,fac},o))}
// how many buildings within r m carry each key (or facade, by='fac')
// terr-3 (Athens boot 2.2 s): only the cells the circle touches; r2 > 0 also counts within r2 into n2 (one scan for BV_pick's two radii)
function BV_near(x,z,r,by,r2,n2){const n={},C=BV.C,rr=r*r,q2=r2?r2*r2:-1;for(let i=Math.floor((x-r)/C);i<=Math.floor((x+r)/C);i++)for(let j=Math.floor((z-r)/C);j<=Math.floor((z+r)/C);j++){const A=BV.G.get(i*100000+j);if(!A)continue;
  for(const o of A){const d=(o.x-x)**2+(o.z-z)**2;if(d<rr){const k=by==='fac'?o.fac:o.key;n[k]=(n[k]||0)+1;if(d<q2)n2[k]=(n2[k]||0)+1}}}return n}
const BV_h=(x,z,s)=>{const h=Math.sin(x*12.9898+z*78.233+(s||0)*37.719)*43758.5453;return h-Math.floor(h)};
// least-used option near (x,z); W = optional weights (higher = preferred, e.g. the district's usual kind); 'by' picks facade or full key
// both counts (key and facade, 100 m and 45 m) in one scan: CV_put's two picks per building (Athens boot)
function BV_near2(x,z){const C=BV.C,f=[{},{}],k=[{},{}];for(let i=Math.floor((x-100)/C);i<=Math.floor((x+100)/C);i++)for(let j=Math.floor((z-100)/C);j<=Math.floor((z+100)/C);j++){const A=BV.G.get(i*100000+j);if(!A)continue;
  for(const o of A){const d=(o.x-x)**2+(o.z-z)**2;if(d<1e4){f[0][o.fac]=(f[0][o.fac]||0)+1;k[0][o.key]=(k[0][o.key]||0)+1;if(d<2025){f[1][o.fac]=(f[1][o.fac]||0)+1;k[1][o.key]=(k[1][o.key]||0)+1}}}}return{f,k}}
function BV_pick(opts,x,z,s,by,W,pre){let N={},n;if(pre){n=pre[0];N=pre[1]}else n=BV_near(x,z,100,by,45,N);let best=opts[0],bs=1e9;opts.forEach((o,i)=>{const sc=((n[o]||0)+3*(N[o]||0))/(W?W[i]:1)+BV_h(x,z,s+i)*.9;if(sc<bs){bs=sc;best=o}});return best}
// the placed buildings: [{x,z,key,fac}]
function BV_list(){const L=[];for(const A of BV.G.values())L.push(...A);return L}
// repeat = mean over buildings of (same key within 100 m) / (all others within 100 m); blocks = 80 m cells with ≥ 4 buildings
function BV_measure(cx,cz,R){const L=BV_list().filter(o=>(o.x-cx)**2+(o.z-cz)**2<R*R);let rs=0,rn=0;
  for(const o of L){const n=BV_near(o.x,o.z,100),tot=Object.values(n).reduce((a,b)=>a+b,0)-1;if(tot<1)continue;rs+=(n[o.key]-1)/tot;rn++}
  const B=new Map();for(const o of L){const k=BV_k(o.x,o.z);let s=B.get(k);if(!s)B.set(k,s={n:0,f:new Set()});s.n++;s.f.add(o.fac)}
  let nb=0,ok=0,mn=99;for(const s of B.values()){if(s.n<4)continue;nb++;if(s.f.size>=3)ok++;mn=Math.min(mn,s.f.size)}
  const keys=new Set(L.map(o=>o.key)),facs=new Set(L.map(o=>o.fac));
  return{n:L.length,repeat:+(100*rs/Math.max(1,rn)).toFixed(1),blocks:nb,blk3:+(100*ok/Math.max(1,nb)).toFixed(1),minFac:nb?mn:0,variants:keys.size,facades:facs.size}}
// street life within R: the shopfronts / cafés / kiosks / billboards / murals of BV_life (BV.L = [{x,z,t}])
function BV_lifeAt(cx,cz,R){const n={};for(const o of BV.L||[])if((o.x-cx)**2+(o.z-cz)**2<R*R)n[o.t]=(n[o.t]||0)+1;return{n:Object.values(n).reduce((a,b)=>a+b,0),kinds:Object.keys(n).length,by:n}}
// pass line: same variant within 100 m ≤ 20 % AND ≥ 3 facade types in ≥ 95 % of the blocks (the odd 4-house corner may have 2)
BV.pass=m=>m.n>=40&&m.repeat<=20&&m.blk3>=95;
// street-life line (near the GO spot only): ≥ 10 storefront pieces within 150 m, ≥ 4 kinds (shop, café, kiosk, billboard, mural)
BV.lpass=l=>l.n>=10&&l.kinds>=4;
// GO: the street node with the most buildings within 150 m, car on it facing along the road; measured over 600 m around it
function BV_go(){const N=HUB.nodes||[];let best=null,bn=-1;for(let i=0;i<N.length;i+=2){const A=N[i];if(!A||LF_count(A.x,A.z,10)>0||roamHit(A.x,A.z,4))continue;/* clean spawn: no prop to smash */const n=Object.values(BV_near(A.x,A.z,150)).reduce((a,b)=>a+b,0);if(n>bn){bn=n;best=A}}
  if(!best)return'📍 BV · no street node';const q=cityAt(best.x,best.z),h=q?Math.atan2(q.p.tx,q.p.tz):0;roamWarp(best.x,best.z,h);RO.v=0;camSnap=true;BV.last=null;
  setTimeout(()=>{const m=BV_measure(RO.x,RO.z,600),a=BV_measure(0,0,1e6);m.city=a;m.life=BV_lifeAt(RO.x,RO.z,150);m.pass=BV.pass(m)&&BV.pass(a)&&BV.lpass(m.life);BV.last=m;try{say('',(m.pass?'✅ PASS':'❌ FAIL')+` · same look ≤100 m ${m.repeat}% (city ${a.repeat}%) · blocks with ≥3 facades ${m.blk3}% (city ${a.blk3}%) · ${a.variants} looks · street life ${m.life.n} (${m.life.kinds} kinds)`,5)}catch(e){}},1500);
  return'📍 BUSIEST STREET · measuring building variety'}
// test view: car 16 m out from a street-life piece, looking back at it (diagonal, so the wall and pavement show)
function BV_view(o){const a=o.h+.45;roamWarp(o.x-Math.sin(a)*16,o.z-Math.cos(a)*16,a);RO.v=0;camSnap=true;return true}
window.__bv={view:BV_view,BV,measure:BV_measure,go:BV_go,list:BV_list,near:BV_near,ptypes:()=>Object.keys(HUB.ptypes||{}),pcount:()=>{const n={};for(const q of HUB.props||[])n[q.t]=(n[q.t]||0)+1;return n}};
// Athens roofs (called from athBuildG put for poly): garden = green roof plate + planters + pergola; tank = the Greek rooftop solar water
// heaters (tilted dark-blue panel + white tank, 1-3 per roof); pent = penthouse (CE_dec builds it); flat = parapet + antenna only
function BV_roof(E,U,x,z,ry,h,L){const{w,d}=U,r=BV_h(x,z,11);
  if(U.rf==='terr'){const[gx,gz]=L(0,0);E('box',gx,h+.7,gz,ry,w*.6,.14,d*.5,0xf2eee6);for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]]){const[qx,qz]=L(a*w*.28,b*d*.22);E('box',qx,h+.6,qz,ry,.18,2,.18,0xf2eee6)}const[px,pz]=L(w*.3,d*.3);E('box',px,h+.7,pz,ry,1.2,.9,1.2,0x3f8a30)}
  else if(U.rf==='garden'){E('box',x,h+.5,z,ry,w-1.2,.18,d-1.2,0x5a9a3e);for(let i=0;i<3;i++){const[px,pz]=L((i-1)*w*.28,(BV_h(x,z,12+i)-.5)*d*.5);E('box',px,h+.68,pz,ry,1.6,.9,1.6,i%2?0x3f8a30:0x62b848)}
    const[gx,gz]=L(w*.2,-d*.2);E('box',gx,h+2.6,gz,ry,w*.35,.14,d*.3,0xf2eee6);for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]]){const[qx,qz]=L(w*.2+a*w*.16,-d*.2+b*d*.13);E('box',qx,h+.6,qz,ry,.18,2,.18,0xf2eee6)}}
  else if(U.rf==='tank'){const n=1+Math.floor(r*3);for(let i=0;i<n;i++){const[tx,tz]=L((i-(n-1)/2)*3.2,-d*.15);E('box',tx,h+.6,tz,ry,2.2,.12,1.6,0x24406a);E('box',tx,h+.7,tz,ry,.08,1,.08,0x8a8a8a);
    const[cx,cz]=L((i-(n-1)/2)*3.2,-d*.15-1.3);E('box',cx,h+1.4,cz,ry,1.9,.75,.75,0xf4f4f0)}}
  // art-4: rooftop billboard on flat poly roofs ≥ 12 m (the classic Athens skyline): 2 steel legs + framed 2-band poster facing the front, district colours, 1 in 10 flat roofs (5 instanced boxes each; ?bvr=0 = off)
  else if(U.rf==='flat'&&h>=12&&w>=7&&r<.1&&!/[?&]bvr=0\b/.test(location.search)){const bw=Math.min(w*.75,11),P=BV_PAL[BV_sty(x,z)]||BV_PAL.poly||['#d8302a','#ffd12c'],pc=i=>parseInt(P[Math.floor(BV_h(x,z,60+i)*P.length)%P.length].slice(1),16),lz=d*.1;
   for(const a of[-.35,.35]){const[qx,qz]=L(a*bw,lz-.3);E('box',qx,h+.2,qz,ry,.3,2.6,.3,0x5a5e66)}const[fx,fz]=L(0,lz);E('box',fx,h+2.6,fz,ry,bw+.4,3.6,.25,0x2a2a2e);
   const[ax,az]=L(0,lz+.16);E('box',ax,h+4.25,az,ry,bw,1.75,.08,pc(0));E('box',ax,h+2.8,az,ry,bw,1.45,.08,pc(1));
   const[ex,ez]=L(0,d/2+2);(BV.RB||(BV.RB=[])).push({x:ex,z:ez,t:'roofbill',h:ry})}}
// ---------- street life (art-3): every building whose front faces a street (front point ≤ 14 m from the road edge) gets ONE storefront piece,
// the least used within 100 m: shop (dark glass + sign + awning), café (striped awning + 2 tables, 4 chairs against the wall), kiosk (Trinkhalle /
// periptero box), billboard (wall poster 5-8 m up, buildings ≥ 10 m) or mural (side wall, 3 bold shapes) or nothing. Colours = the district's palette.
// Decor only: café and kiosk get a small collider flush with the wall (hubAddB), nothing stands out on the road. Instanced unit boxes per 1.6 km cell (few draws).
const BV_PAL={bank:['#1f4a8a','#0d7a8a','#c0c8d0','#2a7ad8'],old:['#7a2a2a','#2a5a3a','#c8a040','#5a3a24'],grz:['#e8822a','#3f8a4a','#d6337f','#ffcc00'],ware:['#ff3a8a','#3ad0ff','#ffd12c','#7a3aff','#3aff8a'],
  off:['#2a7ad8','#ff7a1c','#3aa04a','#e8302a'],mix:['#e8302a','#2a7ad8','#ffcc00','#3aa04a','#ff7a1c','#d6337f','#1fb5b0'],plaka:['#2f6f9a','#8a2a2a','#3a7a4a','#c8643c'],poly:['#e8302a','#0d5eaf','#ffcc00','#1fb5b0','#ff7a1c','#7a3aa0']};
function BV_sty(x,z){if(CID==='fra')return typeof CV_fsty==='function'?CV_fsty(x,z):'mix';const s=typeof athStyleAt==='function'?athStyleAt(x,z):'poly';return s==='plaka'||s==='old'?'plaka':s==='town'||s==='villa'?'grz':'poly'}
function BV_life(){if(!BV.on||BV.L||/[?&]bvl=0\b/.test(location.search))return;const nb0=(HUB.bld||[]).length;/* art-6: the kiosk / café / theme colliders below never reached HUB.grid (623 fra kiosks had no collision); added at the end */BV.L=(BV.RB||[]).concat(HUB.ceS||[]);/* art-5: + Athens CE_dec shopfronts */const fra=CID==='fra',T=fra?['shop','cafe','kiosk','bill','mural','none']:['cafe','kiosk','bill','mural','none'],W=fra?[3,2,1,1.2,1.2,.6]:[2,1,1.2,1.2,3];
  const BI=new Map();for(const b of HUB.bld||[])BI.set(Math.round(b.x)+'|'+Math.round(b.z),b);const LG=new Map(),I=new Map(),hx=c=>parseInt(c.slice(1),16);
  const near=(x,z)=>{const n={},kx=Math.floor(x/100),kz=Math.floor(z/100);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)for(const o of LG.get((kx+a)*100000+kz+b)||[])if((o.x-x)**2+(o.z-z)**2<1e4)n[o.t]=(n[o.t]||0)+1;return n};
  const box=(x,y,z,ry,sx,sy,sz,c)=>{const k=Math.floor(x/1600)*1000+Math.floor(z/1600);let A=I.get(k);if(!A)I.set(k,A=[]);A.push(x,y,z,ry,sx,sy,sz,typeof c==='string'?hx(c):c)};
  for(const o of BV_list()){if(o.ry==null||!o.w||(o.fr===0))continue;const{x,z,ry,w,d}=o,c=Math.cos(ry),s=Math.sin(ry),L0=(lx,lz)=>[x+lx*c+lz*s,z-lx*s+lz*c],D0=d/2,[fx,fz]=L0(0,d/2+2);let L=L0;
    const q=cityAt(fx,fz),f=fillAt(fx,fz);/* art-4: filler-grid streets count too (21 of 30 buildings at the bv1/fra spot faced one and got nothing) */if(!(q&&q.d<=q.road.w/2+16||f&&f.d<=f.r.w/2+16)||w<6)continue;const NS=fra&&w>=18?2:1;for(let sl=0;sl<NS;sl++){const ox=(sl-(NS-1)/2)*w/NS,w0=w;{const w=w0/NS,[fx,fz]=L(ox,D0+2);
    const n=near(fx,fz),dz=typeof DT_at==='function'?DT_at(fx,fz):null/* art-6 district themes (98dt) */,TT=dz?T.concat(DT_K[dz]):T,WW=dz?W.concat(DT_W[dz]):W;let t='none',bs=1e9;if(o.ctb&&!sl){/* art-5: a LEGO set is a shopfront itself */const e={x:fx,z:fz,t:'shop',h:Math.atan2(-s,-c)},k=Math.floor(fx/100)*100000+Math.floor(fz/100);let A=LG.get(k);if(!A)LG.set(k,A=[]);A.push(e);BV.L.push(e)}TT.forEach((k,i)=>{if(k==='mural'&&NS>1)return;if(o.ctb&&k!=='cafe'&&k!=='kiosk'&&k!=='bill'&&k!=='none'&&!(dz&&DT_K[dz].includes(k)))return;/* sets: sidewalk extras only, nothing hung on the bricks */const sc=(n[k]||0)/WW[i]+BV_h(x+sl,z,40+i)*.8;if(sc<bs){bs=sc;t=k}});if(t==='bill'&&o.h<10&&!o.ctb)t='mural';if(t==='none')continue;
    const b=BI.get(Math.round(x)+'|'+Math.round(z)),y0=b&&b.trBase!=null?b.trBase:groundY(x,z),P=BV_PAL[BV_sty(x,z)],pc=i=>P[Math.floor(BV_h(x+sl*7,z,50+i)*P.length)%P.length],D=d/2;L=(lx,lz)=>L0(lx+ox,lz);
    const put=(lx,ly,lz,sx,sy,sz,col,dry)=>{const[px,pz]=L(lx,lz);box(px,y0+ly,pz,ry+(dry||0),sx,sy,sz,col)};
    if(t==='shop'){const gw=Math.min(w*.7,12);put(0,1.4,D+.07,gw,2.6,.12,'#2c3e48');put(0,1.4,D+.1,gw*.08,2.6,.1,'#e8e4dc');put(0,3.3,D+.18,gw*.9,.85,.3,pc(0));put(0,2.9,D+.8,gw,.12,1.6,pc(1))}
    else if(t==='cafe'){const aw=Math.min(w*.6,10),c1=pc(2);for(let i=0;i<5;i++)put((i-2)*aw/5,2.85,D+1.1,aw/5,.14,2.1,i%2?'#f4f4f0':c1);put(0,1.4,D+.07,aw,2.6,.12,'#34474f');
      for(const lx of[-aw*.25,aw*.25]){put(lx,.72,D+1.2,.8,.06,.8,'#f4f4f0');put(lx,.36,D+1.2,.12,.72,.12,'#555d63');for(const sd of[-1,1])put(lx+sd*.75,.25,D+1.2,.42,.5,.42,c1)}
      put(-aw/2-.5,.35,D+.5,.6,.7,.6,'#8a5a3a');put(-aw/2-.5,.9,D+.5,.7,.6,.7,'#3f8a30');if(b||true)hubAddB({x:L(0,D+.9)[0],z:L(0,D+.9)[1],hw:aw/2,hd:.8,h:1.2,ry})}
    else if(t==='kiosk'){const kc=pc(3),lx=(BV_h(x,z,60)-.5)*Math.max(0,w-4);put(lx,1.1,D+1.4,2.6,2.2,2.6,kc);put(lx,1.3,D+2.72,1.8,1,.06,'#bfe3ff');put(lx,2.35,D+1.4,2.9,.3,2.9,'#f4f4f0');put(lx,2.75,D+2.6,2.2,.5,.12,pc(0));
      const[kx,kz]=L(lx,D+1.4);hubAddB({x:kx,z:kz,hw:1.3,hd:1.3,h:2.5,ry})}
    else if(dz&&DT_K[dz].includes(t)){if(!DT_draw(t,{put,L,w,D,d,o,y0,ry,pc,x,z,sl,dz}))continue}
    else if(t==='bill'&&o.ctb){/* art-5: on a LEGO set's roof, 2 legs, set back 1.5 m from the facade */const bw=Math.min(w*.6,7),yb=o.h+(o.yb-y0);for(const sd of[-1,1])put(sd*bw*.35,yb+.9,D-1.5,.25,1.8,.25,'#2a2a2e');put(0,yb+2.9,D-1.5,bw+.4,2.4,.2,'#2a2a2e');put(0,yb+3.3,D-1.37,bw,1.1,.08,pc(0));put(0,yb+2.4,D-1.37,bw,.9,.08,pc(1))}
    else if(t==='bill'){const bw=Math.min(w*.6,9);put(0,6.5,D+.12,bw+.4,3.4,.2,'#2a2a2e');put(0,6.5,D+.25,bw,1.5,.08,pc(0));put(0,5.6,D+.25,bw,1.2,.08,pc(1));put(-bw*.25,7.4,D+.28,bw*.3,.6,.06,'#ffffff')}
    else{const sd=BV_h(x,z,61)<.5?-1:1,mh=Math.min(o.h*.6,9),mx=sd*(w/2+.06);put(mx,mh/2+.4,0,.1,mh,d*.7,pc(0));put(mx+sd*.03,mh*.35+.4,-d*.15,.1,mh*.5,d*.25,pc(1));put(mx+sd*.04,mh*.7,d*.15,.1,mh*.35,d*.3,pc(2));put(mx+sd*.05,mh*.55,0,.1,mh*.12,d*.6,'#ffffff')}
    const e={x:fx,z:fz,t,h:Math.atan2(-s,-c)};const k=Math.floor(fx/100)*100000+Math.floor(fz/100);let A=LG.get(k);if(!A)LG.set(k,A=[]);A.push(e);BV.L.push(e)}}}
  const g=BV.geo||(BV.geo=new THREE.BoxGeometry(1,1,1)),m=BV.mat||(BV.mat=new THREE.MeshStandardMaterial({roughness:.55,metalness:.05})),M4=new THREE.Matrix4(),Q=new THREE.Quaternion(),Y=new THREE.Vector3(0,1,0),Pv=new THREE.Vector3(),S=new THREE.Vector3(),Co=new THREE.Color();
  for(const[,a]of I){const n=a.length/8,im=new THREE.InstancedMesh(g,m,n);for(let i=0;i<n;i++){const o=i*8;Q.setFromAxisAngle(Y,a[o+3]);M4.compose(Pv.set(a[o],a[o+1],a[o+2]),Q,S.set(a[o+4],a[o+5],a[o+6]));im.setMatrixAt(i,M4);im.setColorAt(i,Co.setHex(a[o+7]))}
    im.computeBoundingSphere();im.userData.bvL=1;im.userData.cd=500;HUB.grp.add(im)}hubGridAdd(HUB.bld.slice(nb0));BV.st={life:BV.L.length,meshes:I.size,cols:HUB.bld.length-nb0}}
buildHubProps=(f=>function(){const r=f.apply(this,arguments);try{BV_life()}catch(e){console.warn('BV life',e)}return r})(buildHubProps);
