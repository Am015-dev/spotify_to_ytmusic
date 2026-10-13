// ===== LF (art-2, 2026-10-13): fill the EMPTY GREEN. Alex: "All the game looks extremely poor compared to lively 2K Drive ... way too many empty spaces,
// boring green flat spaces." Reference grid + difference list: docs/research/LIVELY_2K_FILL.md. GO checks look at ONE exact empty spot each
// (spot list LF.SP): % flat uniform green in the frame (tools/tLiveGreen.py), props within 50 m, height range in view.
const LF={on:!/[?&]lf=0\b/.test(location.search),st:{},G:new Map()};
// props + fill pieces within r m of (x,z): HUB.pgrid (16 m cells) + LF.G (the fill's own 16 m grid of [x,z])
function LF_count(x,z,r){let n=0;const c=Math.ceil(r/16),kx=Math.floor(x/16),kz=Math.floor(z/16);for(let a=-c;a<=c;a++)for(let b=-c;b<=c;b++){const k=(kx+a)*10000+kz+b;
  for(const L of[HUB.pgrid&&HUB.pgrid.get(k),LF.G.get(k)]){if(!L)continue;for(const p of L){const px=p.x!=null?p.x:p[0],pz=p.z!=null?p.z:p[1];if((px-x)**2+(pz-z)**2<r*r&&p.alive!==false)n++}}}return n}
// height range of the ground in the view cone (±30°, 15-160 m ahead of the car)
function LF_hrange(x,z,h){let lo=1e9,hi=-1e9;for(let d=15;d<=160;d+=8)for(let a=-30;a<=30;a+=6){const q=h+a*Math.PI/180,px=x+Math.sin(q)*d,pz=z+Math.cos(q)*d;if(inRiver(px,pz))continue;const y=groundY(px,pz)+LF_mound(px,pz);lo=Math.min(lo,y);hi=Math.max(hi,y)}return+(hi-lo).toFixed(2)}
// the emptiest road-side views: from road nodes, look 8 ways; the point 45 m out must be open ground (no building, road or river); score = props near both
function LF_find(n){const N=HUB.nodes,C=[],inB=(x,z)=>!(typeof biomeAt==='function'&&(biomeAt(x,z)||{}).g==='air')&&x>HX0+60&&x<HX1-60&&z>HZS+60&&z<HZN-60;for(let i=0;i<N.length;i+=3){const A=N[i];if(!A||!inB(A.x,A.z))continue;for(let k=0;k<8;k++){const h=k*Math.PI/4,tx=A.x+Math.sin(h)*45,tz=A.z+Math.cos(h)*45;
   if(roamHit(tx,tz,4)||inRiver(tx,tz,-1))continue;const q=cityAt(tx,tz);if(q&&q.d<q.road.w/2+5)continue;C.push({x:+A.x.toFixed(1),z:+A.z.toFixed(1),h:+h.toFixed(3),s:LF_count(tx,tz,50)+LF_count(A.x,A.z,50)})}}
 C.sort((a,b)=>a.s-b.s);const out=[];for(const c of C){if(out.some(o=>Math.hypot(o.x-c.x,o.z-c.z)<400))continue;out.push(c);if(out.length>=n)break}return out}
// put the car at a spot, looking along h, camera snapped behind
function LF_go(s){roamWarp(s.x,s.z,s.h);RO.v=0;camSnap=true;return true}
function LF_metrics(s){const x=RO.x,z=RO.z,h=RO.h,fx=x+Math.sin(h)*45,fz=z+Math.cos(h)*45;return{x:+x.toFixed(1),z:+z.toFixed(1),h:+h.toFixed(2),props50:LF_count(fx,fz,50),hRange:LF_hrange(x,z,h),fill:LF.st.n||0}}
window.__lvf={HM:()=>HUB.M,THREE,scene:()=>scene,cam:()=>camera,find:LF_find,go:LF_go,metrics:LF_metrics,count:LF_count,LF,dbg:()=>({st:LF.st,props:HUB.props.length,hx:[HX0,HX1,HZS,HZN]})};
// ---------- the fill. Open grass = 40 m cells of the city box that are ≥ 12 m from roads, buildings, water, decks, trails, ramps and existing props.
// Each open cell gets ONE theme from a 160 m noise patch (so areas read as parks / meadows / ponds / wild ground, not confetti):
//   grove (LEGO tree cluster + bushes) · garden (flower beds in a bush hedge + bench + lamp) · pond (water + sand rim + reeds + rocks) · wild (mound + rocks + dirt)
//   · market (stall + parasols + tables on a sand patch) · meadow (grass tufts + a few flowers). Every cell also gets grass tufts and a colour patch.
// Trees, bushes, rocks, benches, lamps, stalls, fences go through buildHubProps' add() (smashable, instanced per 800 m tile, LDS LOD). The low decor
// (flower beds, tufts, patches, ponds, reeds) is our own instanced layer, no collision (≤ 0.5 m high), per 1 km tile, hidden past LF.R[type] m.
// Mounds ("rolling terrain"): smooth domes h·(1-q)² (2-4.5 m, r 14-26 m, max slope ~14°) on wild/grove cells; roamTerr adds them, so the car drives over them.
LF.near=150;LF.cap=6000;// only cells within 150 m of a street (what the player sees), at most 6000 cells per city
LF.R={tuft:260,bed:380,patch:700,pond:900,reed:300,mound:1400};LF.M=[];LF.MG=new Map();
const LF_h=(x,z,s)=>{let h=Math.sin(x*12.9898+z*78.233+(s||0)*37.719)*43758.5453;return h-Math.floor(h)};
const LF_n=(x,z)=>{const a=x/160,b=z/160,i=Math.floor(a),j=Math.floor(b),u=a-i,v=b-j,s=t=>t*t*(3-2*t),q=(p,r)=>LF_h(p,r,7);return q(i,j)*(1-s(u))*(1-s(v))+q(i+1,j)*s(u)*(1-s(v))+q(i,j+1)*(1-s(u))*s(v)+q(i+1,j+1)*s(u)*s(v)};
function LF_mound(x,z){const L=LF.MG.get(Math.floor(x/64)*10000+Math.floor(z/64));if(!L)return 0;let h=0;for(const m of L){const q=((x-m.x)**2+(z-m.z)**2)/(m.r*m.r);if(q<1){const k=1-q;h=Math.max(h,m.h*k*k)}}return h}
roamTerr=(f=>function(x,z,y){const r=f.apply(this,arguments);if(!r.deck&&LF.MG.size){const m=LF_mound(x,z);if(m>0)r.g+=m}return r})(roamTerr);
function LF_open(x,z){if(roamHit(x,z,12)||inRiver(x,z,-12)||onAnyDeck(x,z))return false;const q=cityAt(x,z);if(q&&q.d<q.road.w/2+12)return false;const f=fillAt(x,z);if(f&&f.d<f.r.w/2+12)return false;
 const a=abAt(x,z);if(a&&a.d<a.road.w/2+14)return false;if(trailDist(x,z)<12)return false;if(RO.ramps&&RO.ramps.some(r=>Math.hypot(r.x-x,r.z-z)<30))return false;
 if(typeof biomeAt==='function'&&(biomeAt(x,z)||{}).g==='air')return false;return LF_count(x,z,16)<2}
// low decor pieces, metres, vertex colours (white parts take the instance colour)
function LF_box(G,w,h,d,x,y,z,c,ry){const b=new THREE.BoxGeometry(w,h,d).toNonIndexed();if(ry)b.rotateY(ry);b.translate(x,y,z);G.push(colorize(b,new THREE.Color(c)))}
const LF_FC=['#d8302a','#ffd12c','#ffffff','#f28ac0','#3f7fe0','#ff8a1c'];
function LF_geos(){const g={};
 // flower bed: 4 x 2.4 m plate (2 plates high, reddish brown edge, green top) with 10 LEGO 1x1 flowers (stem + head) in 4 colours
 {const G=[];LF_box(G,4,.24,2.4,0,.12,0,'#7a4a28');LF_box(G,3.7,.06,2.1,0,.27,0,'#3f8a2e');for(let i=0;i<10;i++){const x=-1.5+(i%5)*.75,z=i<5?-.5:.5,c=LF_FC[(i*7+3)%LF_FC.length];LF_box(G,.06,.32,.06,x,.46,z,'#4f9a36');LF_box(G,.26,.12,.26,x,.66,z,c,.6)}g.bed=mergeG(G)}
 // grass tuft: LEGO 6255-style plant, 2 open 5-sided cones (white: the instance colour picks the green)
 {const G=[];for(const[r,h,x,z]of[[.55,.9,0,0],[.4,.6,.5,.3]]){const c=new THREE.ConeGeometry(r,h,5,1,true).toNonIndexed();c.translate(x,h/2,z);G.push(colorize(c,new THREE.Color('#ffffff')))}g.tuft=mergeG(G)}
 // flat patch (dirt / sand / dark grass): an irregular 9-gon 1 m radius, 4 cm up (instance colour + scale)
 {const s=new THREE.Shape(),n=9;for(let i=0;i<n;i++){const a=i/n*Math.PI*2,r=.75+.25*LF_h(i,3,1);s[i?'lineTo':'moveTo'](Math.cos(a)*r,Math.sin(a)*r)}const p=new THREE.ShapeGeometry(s).toNonIndexed();p.rotateX(-Math.PI/2);p.translate(0,.04,0);g.patch=colorize(p,new THREE.Color('#ffffff'))}
 // pond water disc (12 sides) and reeds (3 thin stalks with brown tips)
 {const c=new THREE.CircleGeometry(1,12).toNonIndexed();c.rotateX(-Math.PI/2);c.translate(0,.09,0);g.pond=colorize(c,new THREE.Color('#ffffff'))}
 {const G=[];for(const[x,z,h]of[[0,0,1.6],[.25,.15,1.3],[-.2,.2,1.1]]){LF_box(G,.07,h,.07,x,h/2,z,'#4f8a36');LF_box(G,.14,.35,.14,x,h+.1,z,'#6b4a2a')}g.reed=mergeG(G)}
 // mound: smooth dome h(1-q)², radius/height 1 (scaled per instance), 12 sides, 6 rings
 {const P=[];for(let i=0;i<=6;i++){const r=i/6,k=1-r*r;P.push(new THREE.Vector2(r,k*k))}P.reverse();const d=new THREE.LatheGeometry(P,12).toNonIndexed();d.translate(0,-.02,0);g.mound=colorize(d,new THREE.Color('#ffffff'));g.mound.computeVertexNormals()}
 return g}
function LF_free(x,z,m){if(roamHit(x,z,m)||inRiver(x,z,-m))return false;const q=cityAt(x,z);if(q&&q.d<q.road.w/2+m)return false;const f=fillAt(x,z);if(f&&f.d<f.r.w/2+m)return false;const a=abAt(x,z);return !(a&&a.d<a.road.w/2+m)&&trailDist(x,z)>=m}
function LF_scatter(add,rnd,D){if(!LF.on)return;const T0=performance.now(),I=LF.I={tuft:[],bed:[],patch:[],pond:[],reed:[],mound:[]},st=LF.st={cells:0,n:0,th:{},props:0},fra=CID==='fra';
 const has=t=>!!D[t],pk=a=>{const b=a.filter(has);return b.length?b[Math.floor(rnd()*b.length)]:null};
 const TREES=fra?['tree','tree2','tree3','tree']:['CE_olive','CE_pine','CE_cypress','CE_olive','tree2'],ROCK=fra?'rock':'CE_rock';
 const gy=(x,z)=>groundY(x,z)+LF_mound(x,z),P=(t,x,z,ry,y)=>{if(!t||!has(t))return;const n0=HUB.CE_L?HUB.CE_L.length:0;add(t,x,z,ry==null?rnd()*6.28:ry,y==null?gy(x,z):y);st.props++};
 const di=(t,x,z,ry,sx,sy,sz,c,y)=>{I[t].push({x,y:y==null?gy(x,z):y,z,ry,sx,sy,sz,c});st.n++;const k=Math.floor(x/16)*10000+Math.floor(z/16);let L=LF.G.get(k);if(!L)LF.G.set(k,L=[]);if(t!=='tuft'&&t!=='patch'&&t!=='mound')L.push([x,z])};
 const GRN=fra?['#4fa83a','#3f8f30','#62b848','#2f7a2a']:['#7a9a48','#8aa858','#6b8a3e','#9aae6a'],DIRT=fra?['#a8865a','#d8c08a','#8a6a44']:['#c8a46a','#d8bc84','#b08a5a'];
 const cs=40,cells=[];for(let x=HX0+cs;x<HX1-cs;x+=cs)for(let z=HZS+cs;z<HZN-cs;z+=cs){const jx=x+(LF_h(x,z,1)-.5)*10,jz=z+(LF_h(x,z,2)-.5)*10;if(!LF_open(jx,jz))continue;const q=cityAt(jx,jz),f=fillAt(jx,jz),d=Math.min(q?q.d-q.road.w/2:1e9,f?f.d-f.r.w/2:1e9);if(d<LF.near)cells.push([jx,jz])}
 st.open=cells.length;if(cells.length>LF.cap){const k=LF.cap/cells.length;for(let i=cells.length-1;i>=0;i--)if(LF_h(cells[i][0],cells[i][1],77)>k)cells.splice(i,1)}st.cells=cells.length;
 // mounds first (props and decor then stand on them)
 for(const[x,z]of cells){const n=LF_n(x,z),wild=n>=.62&&n<.8,grove=n>=.22&&n<.42;const th0=n<.22?'pond':n>=.55&&n<.62?'market':'';if(th0||!(wild&&LF_h(x,z,3)<.85||LF_h(x,z,3)<.4))continue;
  if(Math.abs(groundY(x+20,z)-groundY(x-20,z))+Math.abs(groundY(x,z+20)-groundY(x,z-20))>3)continue;const r=14+LF_h(x,z,4)*12,h=Math.min(r*.17,2+LF_h(x,z,5)*2.5);let ok=true;for(let k=0;k<8&&ok;k++){const a=k*Math.PI/4;ok=LF_free(x+Math.sin(a)*r,z+Math.cos(a)*r,4)}if(!ok)continue;
  if(LF.M.some(o=>Math.hypot(o.x-x,o.z-z)<o.r+r*.6))continue;const m={x,z,r,h};LF.M.push(m);for(let a=Math.floor((x-r)/64);a<=Math.floor((x+r)/64);a++)for(let b=Math.floor((z-r)/64);b<=Math.floor((z+r)/64);b++){const k=a*10000+b;if(!LF.MG.has(k))LF.MG.set(k,[]);LF.MG.get(k).push(m)}
  di('mound',x,z,LF_h(x,z,6)*6.28,r,h,r,GRN[Math.floor(LF_h(x,z,8)*GRN.length)],groundY(x,z))}
 for(const[x,z]of cells){const n=LF_n(x,z),u=LF_h(x,z,9),th=n<.22?(u<.45?'pond':'meadow'):n<.42?'grove':n<.55?'garden':n<.62?'market':n<.8?'wild':'meadow';st.th[th]=(st.th[th]||0)+1;
  const R=(s)=>(LF_h(x,z,s)-.5),ring=(r,k,N)=>{const a=k/N*6.28+u*6.28;return[x+Math.sin(a)*r,z+Math.cos(a)*r]};
  // every cell: grass tufts + one colour patch (darker / lighter green) to break the flat green
  for(let k=0;k<4;k++){const tx=x+R(20+k)*34,tz=z+R(40+k)*34,s=1.3+LF_h(tx,tz,1)*1.4;di('tuft',tx,tz,LF_h(tx,tz,2)*6.28,s,s,s,GRN[k%GRN.length])}
  {const s=6+u*7;di('patch',x+R(11)*8,z+R(12)*8,u*6.28,s,1,s*(.6+LF_h(x,z,13)*.5),GRN[(Math.floor(u*9))%GRN.length])}
  if(th==='grove'){const nT=3+Math.floor(LF_h(x,z,14)*3);for(let k=0;k<nT;k++){const[a,b]=ring(3+LF_h(x,z,15+k)*8,k,nT);P(pk(TREES),a,b)}{const[a,b]=ring(10,.5,3);P('bush',a,b)}if(u<.3)P('bench',x+R(17)*6,z+12,Math.PI)}
  else if(th==='garden'){const ry=Math.floor(u*4)*Math.PI/2;for(let k=-1;k<=1;k++){const ox=Math.cos(ry)*k*5,oz=-Math.sin(ry)*k*5;di('bed',x+ox,z+oz,ry,1,1,1,null)}
   for(let k=-2;k<=2;k++)for(const sd of[-1,1]){const ox=Math.cos(ry)*k*3.8+Math.sin(ry)*sd*3.6,oz=-Math.sin(ry)*k*3.8+Math.cos(ry)*sd*3.6;if(LF_h(x+k,z+sd,18)<.4)P('bush',x+ox,z+oz)}
   P('bench',x+Math.sin(ry)*6,z+Math.cos(ry)*6,ry+Math.PI);if(u<.5)P('lamp',x-Math.sin(ry)*6.5,z-Math.cos(ry)*6.5);di('patch',x,z,ry,9,1,4,'#d8c08a')}
  else if(th==='pond'){const r=5+u*5;di('patch',x,z,u*6.28,r+2.2,1,r+2.2,'#d8c08a',groundY(x,z)+.01);di('pond',x,z,0,r,1,r,'#3a8fd8');for(let k=0;k<6;k++){const[a,b]=ring(r+.6,k,6);di('reed',a,b,k,1,1,1,null)}
   for(let k=0;k<2;k++){const[a,b]=ring(r+3,k+.3,2);P(ROCK,a,b)}if(u<.7){const[a,b]=ring(r+6,.75,1);P(pk(TREES),a,b)}}
  else if(th==='market'){const ry=Math.floor(u*4)*Math.PI/2;di('patch',x,z,ry,10,1,7,DIRT[1]);P('stall',x,z,ry);P('parasol',x+Math.cos(ry)*6,z-Math.sin(ry)*6);P('table',x+Math.cos(ry)*6+1.5,z-Math.sin(ry)*6+1.5);P('parasol',x-Math.cos(ry)*6,z+Math.sin(ry)*6);P('bin',x+Math.sin(ry)*5,z+Math.cos(ry)*5)}
  else if(th==='wild'){di('patch',x+R(21)*10,z+R(22)*10,u*6.28,5+u*6,1,4+u*5,DIRT[Math.floor(u*3)]);for(let k=0;k<1+Math.floor(u*2.5);k++)P(ROCK,x+R(23+k)*20,z+R(26+k)*20);P('bush',x+R(29)*16,z+R(30)*16);if(u<.4)P(pk(TREES),x+R(31)*14,z+R(32)*14)}
  else{for(let k=0;k<4;k++){const tx=x+R(50+k)*26,tz=z+R(60+k)*22;di('tuft',tx,tz,k,.7,.7,.7,LF_FC[k%LF_FC.length])}if(u<.25)P(pk(TREES),x+R(33)*10,z+R(34)*10)}}
 LF_verge(P,di,pk,TREES,ROCK,GRN,DIRT,st);st.ms=Math.round(performance.now()-T0);st.mounds=LF.M.length}
// the verge: what you see while driving. Every 12 m along every street and filler road, both sides, 5-20 m off the kerb, on open ground only:
// grass clumps always + the zone's theme (grove: a tree, garden: a flower bed + hedge bush, wild: a rock or dirt, meadow: flowers, pond zone: reeds)
function LF_verge(P,di,pk,TREES,ROCK,GRN,DIRT,st){let n=0;const one=(x,z,ux,uz,w,k)=>{for(const sd of[-1,1]){const nx=uz*sd,nz=-ux*sd,u=LF_h(x+sd,z,k),o=w/2+5+u*15,px=x+nx*o,pz=z+nz*o;
   if(roamHit(px,pz,4)||inRiver(px,pz,-3)||onAnyDeck(px,pz)||LF_count(px,pz,6)>0)continue;const q=cityAt(px,pz);if(q&&q.d<q.road.w/2+4)continue;const f=fillAt(px,pz);if(f&&f.d<f.r.w/2+4)continue;
   const a=abAt(px,pz);if(a&&a.d<a.road.w/2+8)continue;if(typeof biomeAt==='function'&&(biomeAt(px,pz)||{}).g==='air')continue;n++;
   const zn=LF_n(px,pz),ry=Math.atan2(ux,uz),s=1.2+LF_h(px,pz,3)*1.6;di('tuft',px,pz,u*6.28,s,s,s,GRN[k%GRN.length]);
   if(zn<.22){if(u<.5)di('reed',px+ux*2,pz+uz*2,u*6,1,1,1,null)}
   else if(zn<.42){if(o>w/2+8&&u<.6)P(pk(TREES),px,pz);else P('bush',px,pz)}
   else if(zn<.55){if(u<.55){di('bed',px,pz,ry,1,1,1,null);if(u<.3)P('bush',px+ux*3.5,pz+uz*3.5)}else P('bush',px,pz)}
   else if(zn<.62){if(u<.3)P('bench',px,pz,ry+(sd>0?Math.PI/2:-Math.PI/2))}
   else if(zn<.8){if(u<.4)P(ROCK,px,pz);else di('patch',px,pz,u*6.28,3+u*4,1,2+u*3,DIRT[k%DIRT.length])}
   else for(let j=0;j<3;j++)di('tuft',px+(LF_h(px,j,4)-.5)*6,pz+(LF_h(pz,j,5)-.5)*6,j,.8,.8,.8,LF_FC[(k+j)%LF_FC.length])}};
 let k=0;for(const S of CITY_S){const Pp=S.pts;if(!Pp||S.r.cls==='hill')continue;let acc=0;for(let i=1;i<Pp.length-1;i++){const p=Pp[i],q=Pp[i-1];acc+=Math.hypot(p.x-q.x,p.z-q.z);if(acc<12)continue;acc=0;if(p.x<HX0||p.x>HX1||p.z<HZS||p.z>HZN)continue;one(p.x,p.z,p.tx,p.tz,S.r.w,k++)}}
 for(const r of hubRoads())for(let d=8;d<r.L-8;d+=12)one(r.x0+r.ux*d,r.z0+r.uz*d,r.ux,r.uz,r.w,k++);st.verge=n}
// instanced decor, one mesh per type per 1 km tile
function LF_build(){if(!LF.I||!HUB.grp)return;const G=LF.geo||(LF.geo=LF_geos()),mat=LF.mat||(LF.mat={def:new THREE.MeshStandardMaterial({vertexColors:true,roughness:.6}),tuft:new THREE.MeshStandardMaterial({vertexColors:true,roughness:.7,side:THREE.DoubleSide}),pond:new THREE.MeshStandardMaterial({vertexColors:true,roughness:.12,metalness:.15})});
 LF.ms=[];const M=new THREE.Matrix4(),Q=new THREE.Quaternion(),S=new THREE.Vector3(),Pv=new THREE.Vector3(),Y=new THREE.Vector3(0,1,0),C=new THREE.Color();
 for(const t in LF.I){const by=new Map();for(const p of LF.I[t]){const k=Math.floor(p.x/1000)+'|'+Math.floor(p.z/1000);if(!by.has(k))by.set(k,[]);by.get(k).push(p)}
  for(const L of by.values()){const m=new THREE.InstancedMesh(G[t],t==='tuft'||t==='reed'?mat.tuft:t==='pond'?mat.pond:mat.def,L.length);L.forEach((p,i)=>{Q.setFromAxisAngle(Y,p.ry||0);M.compose(Pv.set(p.x,p.y,p.z),Q,S.set(p.sx,p.sy,p.sz));m.setMatrixAt(i,M);m.setColorAt(i,C.set(p.c||'#ffffff'))});
   m.computeBoundingSphere();m.castShadow=t==='mound';m.receiveShadow=true;m.userData.lf=t;HUB.grp.add(m);LF.ms.push(m)}}LF.st.draws=LF.ms.length}
CE_streets=(f=>function(add,rnd,D){const r=f.apply(this,arguments);try{LF_scatter(add,rnd,D)}catch(e){console.warn('LF scatter',e)}return r})(CE_streets);
buildHubProps=(f=>function(){const r=f.apply(this,arguments);try{LF_build()}catch(e){console.warn('LF build',e)}return r})(buildHubProps);
// distance cull: each type hides past LF.R[type] m (checked every 15 frames)
hubCullStep=(f=>function(){f.apply(this,arguments);if(!LF.ms||(LF.fr=(LF.fr|0)+1)%15)return;const cp=camera.position;for(const m of LF.ms){const s=m.boundingSphere;if(!s)continue;m.visible=Math.hypot(s.center.x-cp.x,s.center.z-cp.z)-s.radius<LF.R[m.userData.lf]}})(hubCullStep);
// flat uniform green % of the frame (same rule as tools/tLiveGreen.py, on a 1/2-res copy: 4×4 blocks, green hue, luma stdev < 9; bottom 22% = car/HUD left out)
function LF_green(){try{composer.render()}catch(e){}const c=renderer.domElement,W=Math.floor(c.width/2),H=Math.floor(c.height/2),cv=LF.cv||(LF.cv=document.createElement('canvas'));cv.width=W;cv.height=H;
 const x=cv.getContext('2d',{willReadFrequently:true});x.drawImage(c,0,0,W,H);const D=x.getImageData(0,0,W,H).data,H2=Math.floor(H*.78);let n=0,g=0;
 for(let by=0;by+4<=H2;by+=4)for(let bx=0;bx+4<=W;bx+=4){let r=0,gg=0,b=0,l=0,l2=0;for(let j=0;j<4;j++)for(let i=0;i<4;i++){const o=((by+j)*W+bx+i)*4,R=D[o],G=D[o+1],B=D[o+2],L=.299*R+.587*G+.114*B;r+=R;gg+=G;b+=B;l+=L;l2+=L*L}
  r/=16;gg/=16;b/=16;l/=16;const sd=Math.sqrt(Math.max(0,l2/16-l*l));n++;if(gg>r+12&&gg>b+12&&sd<9)g++}return+(100*g/Math.max(1,n)).toFixed(1)}
// GO spots: the exact empty spots of the reference grid (docs/research/ref/fill/side_by_side.jpg), car parked looking at the empty ground
LF.SP={'fra-1':{c:'fra',x:-2093.3,z:-547.9,h:2.356,n:'Frankfurt west meadow'},'fra-2':{c:'fra',x:-1753,z:-240.3,h:2.356,n:'Frankfurt west field'},'fra-3':{c:'fra',x:960,z:-308,h:4.712,n:'Frankfurt east lawn'},
 'fra-4':{c:'fra',x:-1680,z:-1680,h:1.571,n:'Frankfurt south-west field'},'ath-1':{c:'ath',x:-1917.3,z:2338.4,h:2.356,n:'Athens north slope'},'ath-2':{c:'ath',x:1221.4,z:-1029.8,h:3.142,n:'Athens south lawn'}};
// pass line: flat green ≤ 8% of the frame AND ≥ 6 props within 50 m of the looked-at point AND land height range ≥ 4 m
LF.pass=m=>m.green<=8&&m.props50>=6&&m.hRange>=4;
function LF_goSpot(id){const s=LF.SP[id];if(!s)return'no spot '+id;if(s.c!==CID)return'wrong city';LF_go(s);LF.last=null;
 setTimeout(()=>{const m=LF_metrics(s);m.green=LF_green();m.id=id;m.pass=LF.pass(m);LF.last=m;try{say('',(m.pass?'✅ PASS':'❌ FAIL')+` · flat green ${m.green}% · ${m.props50} props ≤50 m · hills ${m.hRange} m`,4)}catch(e){}},2500);
 return'📍 '+s.n.toUpperCase()+' · measuring in 2.5 s'}
Object.assign(window.__lvf,{goSpot:LF_goSpot,green:LF_green,SP:LF.SP});
// mound GO: the nearest grass hill with a clear 50 m run-up (no building, road edge or water on the line); the car is parked 40 m before its centre
// facing it. You (or the test) drive at it: PASS = the car climbs ≥ 60% of the hill's height, passes within r/3 of the top and never stalls (< 2 m/s after 1.5 s of gas).
function LF_goMound(){let best=null,bd=1e18;for(const m of LF.M){const d=(m.x-RO.x)**2+(m.z-RO.z)**2;if(d>=bd)continue;for(let k=0;k<8;k++){const a=k*Math.PI/4,sx=m.x-Math.sin(a)*(m.r+40),sz=m.z-Math.cos(a)*(m.r+40);let ok=true;
   for(let t=0;t<=1&&ok;t+=.1)ok=!roamHit(sx+(m.x-sx)*t,sz+(m.z-sz)*t,3)&&!inRiver(sx+(m.x-sx)*t,sz+(m.z-sz)*t,-2);if(ok){best={m,sx,sz,h:a};bd=d;break}}}
 if(!best)return'no hill nearby';const{m,sx,sz,h}=best;roamWarp(sx,sz,h);RO.v=0;camSnap=true;const y0=RO.y;const L={m,y0,top:0,near:1e9,stall:false,t:0,go:0};LF.lastM=null;
 const iv=setInterval(()=>{L.t+=.1;L.top=Math.max(L.top,RO.y-y0);L.near=Math.min(L.near,Math.hypot(RO.x-m.x,RO.z-m.z));if(Math.abs(RO.v)>3)L.go=L.go||L.t;if(L.go&&L.t-L.go>1.5&&L.near>m.r*.34&&Math.abs(RO.v)<2)L.stall=true;
  if(L.t>12||L.go&&Math.hypot(RO.x-m.x,RO.z-m.z)>m.r+12&&L.near<m.r/3){clearInterval(iv);const r={h:+m.h.toFixed(2),climb:+L.top.toFixed(2),near:+L.near.toFixed(1),stall:L.stall,pass:L.top>=m.h*.6&&L.near<m.r/3&&!L.stall};LF.lastM=r;
   try{say('',(r.pass?'✅ PASS':'❌ FAIL')+` · hill ${r.h} m · climbed ${r.climb} m · stalled: ${r.stall?'yes':'no'}`,4)}catch(e){}}},100);
 return`📍 GRASS HILL ${m.h.toFixed(1)} m high, 40 m ahead · drive over it`}
Object.assign(window.__lvf,{goMound:LF_goMound});
// grass mottle: the stud-plate grass (97_art ART_hub, one 10 m tile repeated) averages to ONE flat lime at driving distance, the "boring flat green".
// The grass materials get world-space value noise (blotches 12-60 m) in the fragment shader: darker cool green ↔ lighter warm/yellow green, like the
// mown and dry patches of 2K's lawns. One mix per pixel, no textures, no extra draws. ?lf=0 turns it off with the rest of LF.
LF.MOT={dk:[.74,.86,.74],lt:[1.12,1.06,.86]};
function LF_mottle(m){if(!m||m.userData.lfMot)return;m.userData.lfMot=1;const o=m.onBeforeCompile;m.onBeforeCompile=function(sh,r){if(o)o.call(this,sh,r);
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 vLfW;').replace('#include <project_vertex>','#include <project_vertex>\nvLfW=(modelMatrix*vec4(transformed,1.)).xz;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>',`#include <common>
varying vec2 vLfW;float lfH(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
float lfN(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(lfH(i),lfH(i+vec2(1,0)),f.x),mix(lfH(i+vec2(0,1)),lfH(i+vec2(1,1)),f.x),f.y);}`)
   .replace('#include <map_fragment>',`#include <map_fragment>
{float n=lfN(vLfW/58.)*.55+lfN(vLfW/21.+7.3)*.3+lfN(vLfW/7.5+3.1)*.15;n=smoothstep(.22,.78,n);diffuseColor.rgb*=mix(vec3(${LF.MOT.dk.join(',')}),vec3(${LF.MOT.lt.join(',')}),n);}`)};
 m.customProgramCacheKey=()=>'lfMot';m.needsUpdate=true}
ART_hub=(f=>function(){const r=f.apply(this,arguments);if(LF.on&&HUB&&HUB.M)try{for(const k of['walk','yard','grass'])LF_mottle(HUB.M[k])}catch(e){console.warn('LF mottle',e)}return r})(ART_hub);
