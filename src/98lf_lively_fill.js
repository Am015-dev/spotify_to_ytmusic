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
window.__lvf={ro:()=>({v:+RO.v.toFixed(1),y:+RO.y.toFixed(2),x:+RO.x.toFixed(1),z:+RO.z.toFixed(1)}),props:t=>HUB.props.filter(q=>q.t===t).length,HM:()=>HUB.M,THREE,scene:()=>scene,cam:()=>camera,find:LF_find,go:LF_go,metrics:LF_metrics,count:LF_count,LF,dbg:()=>({st:LF.st,props:HUB.props.length,regs:(LF.regs||[]).filter(L=>L.done).length+'/'+(LF.regs||[]).length,hx:[HX0,HX1,HZS,HZN]})};
// ---------- the fill. Open grass = 40 m cells of the city box that are ≥ 12 m from roads, buildings, water, decks, trails, ramps and existing props.
// Each open cell gets ONE theme from a 160 m noise patch (so areas read as parks / meadows / ponds / wild ground, not confetti):
//   grove (LEGO tree cluster + bushes) · garden (flower beds in a bush hedge + bench + lamp) · pond (water + sand rim + reeds + rocks) · wild (mound + rocks + dirt)
//   · market (stall + parasols + tables on a sand patch) · meadow (grass tufts + a few flowers). Every cell also gets grass tufts and a colour patch.
// Trees, bushes, rocks, benches, lamps, stalls, fences go through buildHubProps' add() (smashable, instanced per 800 m tile, LDS LOD). The low decor
// (flower beds, tufts, patches, ponds, reeds) is our own instanced layer, no collision (≤ 0.5 m high), per 1 km tile, hidden past LF.R[type] m.
// Mounds ("rolling terrain"): smooth domes h·(1-q)² (2-4.5 m, r 14-26 m, max slope ~14°) on wild/grove cells; roamTerr adds them, so the car drives over them.
LF.vs=CID==='fra'?12:14;LF.near=150;// cells over 150 m from a street (or out of the street grid) get half the density; verge sample every LF.vs m
LF.R={tuft:350,bed:380,patch:700,pond:900,reed:300,mound:1400};LF.M=[];LF.MG=new Map();
const LF_h=(x,z,s)=>{let h=Math.sin(x*12.9898+z*78.233+(s||0)*37.719)*43758.5453;return h-Math.floor(h)};
const LF_n=(x,z)=>{const a=x/160,b=z/160,i=Math.floor(a),j=Math.floor(b),u=a-i,v=b-j,s=t=>t*t*(3-2*t),q=(p,r)=>LF_h(p,r,7);return q(i,j)*(1-s(u))*(1-s(v))+q(i+1,j)*s(u)*(1-s(v))+q(i,j+1)*(1-s(u))*s(v)+q(i+1,j+1)*s(u)*s(v)};
function LF_mound(x,z){const L=LF.MG.get(Math.floor(x/64)*10000+Math.floor(z/64));if(!L)return 0;let h=0;for(const m of L){const q=((x-m.x)**2+(z-m.z)**2)/(m.r*m.r);if(q<1){const k=1-q;h=Math.max(h,m.h*k*k)}}return h}
roamTerr=(f=>function(x,z,y){const r=f.apply(this,arguments);if(!r.deck&&LF.MG.size){const m=LF_mound(x,z);if(m>0)r.g+=m}return r})(roamTerr);
// cheapest checks first (grid lookups), trail distance (a loop over every trail point) last; returns the road-edge distance or -1
function LF_open(x,z){if(roamHit(x,z,12))return -1;const q=cityAt(x,z),f=fillAt(x,z),d=Math.min(q?q.d-q.road.w/2:1e9,f?f.d-f.r.w/2:1e9);if(d<12)return -1;
 if(inRiver(x,z,-12)||onAnyDeck(x,z))return -1;const a=abAt(x,z);if(a&&a.d<a.road.w/2+14)return -1;if(RO.ramps&&RO.ramps.some(r=>Math.abs(r.x-x)<30&&Math.abs(r.z-z)<30))return -1;
 if(CID==='fra'&&typeof biomeAt==='function'&&(biomeAt(x,z)||{}).g==='air')return -1;if(LF_count(x,z,16)>=2||trailDist(x,z)<12)return -1;return d}
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
// ---- streamed: the fill is NOT built at boot (Athens boot was +5-7 s). Each 1 km tile of the city box is a LAZY region (60_city_build4 lzReg):
// lazyStep builds it in ≤1.2 ms slices when you come near (scan, mounds, themes, verge, decor meshes, then lzPropsG = the city's smashable props),
// 98cl_stream frees it when far (STR_lzFree, wrapped below to drop its mounds and grid entries). Only the tiles around the player exist.
LF.keep=CID==='fra'?.95:.6;// share of open cells that get a theme (Athens has 2.5× the open ground)
function LF_ctx(){if(LF.cx)return LF.cx;const fra=CID==='fra';const VS=new Map();let k=0;const put=(x,z,ux,uz,w)=>{if(x<HX0||x>HX1||z<HZS||z>HZN)return;const key=Math.floor(x/1000)+'|'+Math.floor(z/1000);let A=VS.get(key);if(!A)VS.set(key,A=[]);A.push([x,z,ux,uz,w,k++])};
 for(const S of CITY_S){const Pp=S.pts;if(!Pp||S.r.cls==='hill')continue;let acc=0;for(let i=1;i<Pp.length-1;i++){const p=Pp[i],q=Pp[i-1];acc+=Math.hypot(p.x-q.x,p.z-q.z);if(acc<LF.vs)continue;acc=0;put(p.x,p.z,p.tx,p.tz,S.r.w)}}
 for(const r of hubRoads())for(let d=8;d<r.L-8;d+=LF.vs)put(r.x0+r.ux*d,r.z0+r.uz*d,r.ux,r.uz,r.w);
 return LF.cx={VS,TREES:fra?['tree','tree2','tree3','tree']:['CE_olive','CE_pine','CE_cypress','CE_olive','tree2'],ROCK:fra?'rock':'CE_rock',
  GRN:fra?['#4fa83a','#3f8f30','#62b848','#2f7a2a']:['#7a9a48','#8aa858','#6b8a3e','#9aae6a'],DIRT:fra?['#a8865a','#d8c08a','#8a6a44']:['#c8a46a','#d8bc84','#b08a5a']}}
function LF_reg(){if(!LF.on||LF.regs||!HUB.ptypes)return;LF.regs=[];for(let x=Math.floor(HX0/1000)*1000;x<HX1;x+=1000)for(let z=Math.floor(HZS/1000)*1000;z<HZN;z+=1000)
  LF.regs.push(lzReg('lf_'+x+'_'+z,'',[x,x+1000,z,z+1000],{lf:1,build:LF_tileG}))}
function LF_unreg(L){if(L.lfM&&L.lfM.length){const S=new Set(L.lfM);LF.M=LF.M.filter(m=>!S.has(m));for(const[k,A]of LF.MG){const B=A.filter(m=>!S.has(m));if(B.length)LF.MG.set(k,B);else LF.MG.delete(k)}}
 if(L.lfG)for(const[k,e]of L.lfG){const A=LF.G.get(k);if(A){const i=A.indexOf(e);if(i>=0)A.splice(i,1)}}L.lfM=[];L.lfG=[];if(LF.ms)LF.ms=LF.ms.filter(m=>m.parent&&m.userData.lfR!==L.id)}
STR_lzFree=(f=>function(L){if(L&&L.lf)LF_unreg(L);return f.apply(this,arguments)})(STR_lzFree);
function* LF_tileG(L){LF_unreg(L);L.props=[];const D=HUB.ptypes,C=LF_ctx(),fra=CID==='fra',[X0,X1,Z0,Z1]=L.rect,I={tuft:[],bed:[],patch:[],pond:[],reed:[],mound:[]},st=LF.st;
 const has=t=>!!D[t],pk=a=>{const b=a.filter(has);return b.length?b[Math.floor(LF_h(a.length,b.length,L.props.length)*b.length)]:null},{TREES,ROCK,GRN,DIRT}=C;
 const gy=(x,z)=>groundY(x,z)+LF_mound(x,z),G16=(x,z)=>{const k=Math.floor(x/16)*10000+Math.floor(z/16),e=[x,z];let A=LF.G.get(k);if(!A)LF.G.set(k,A=[]);A.push(e);L.lfG.push([k,e])};
 const P=(t,x,z,ry,y)=>{if(!t||!has(t))return;const m=LF_mound(x,z);L.props.push([t,x,z,ry==null?LF_h(x,z,99)*6.28:ry,m>0?groundY(x,z)+m:y]);G16(x,z);st.props=(st.props||0)+1};
 const di=(t,x,z,ry,sx,sy,sz,c,y)=>{I[t].push({x,y:y==null?gy(x,z):y,z,ry,sx,sy,sz,c});st.n=(st.n||0)+1;if(t!=='tuft'&&t!=='patch'&&t!=='mound')G16(x,z)};
 let t0=performance.now();const slice=()=>performance.now()-t0>1.2;
 // 1 · open cells of this tile
 const cs=40,cells=[];for(let x=X0+cs/2;x<X1;x+=cs){for(let z=Z0+cs/2;z<Z1;z+=cs){if(x<HX0+cs||x>HX1-cs||z<HZS+cs||z>HZN-cs)continue;const jx=x+(LF_h(x,z,1)-.5)*10,jz=z+(LF_h(x,z,2)-.5)*10;
   {const d=LF_h(jx,jz,77)<LF.keep?LF_open(jx,jz):-1;if(d>=0&&(d<=LF.near||LF_h(jx,jz,78)<.5))cells.push([jx,jz])}}if(slice()){yield;t0=performance.now()}}
 // 2 · mounds (props and decor then stand on them)
 for(const[x,z]of cells){const n=LF_n(x,z),wild=n>=.62&&n<.8;const th0=n<.22?'pond':n>=.55&&n<.62?'market':'';if(th0||!(wild&&LF_h(x,z,3)<.85||LF_h(x,z,3)<.4))continue;
  if(Math.abs(groundY(x+20,z)-groundY(x-20,z))+Math.abs(groundY(x,z+20)-groundY(x,z-20))>3)continue;const r=14+LF_h(x,z,4)*12,h=Math.min(r*.17,2+LF_h(x,z,5)*2.5);let ok=true;
  for(let k=0;k<8&&ok;k++){const a=k*Math.PI/4;ok=LF_free(x+Math.sin(a)*r,z+Math.cos(a)*r,4)}if(!ok)continue;if(LF.M.some(o=>Math.hypot(o.x-x,o.z-z)<o.r+r*.6))continue;
  const m={x,z,r,h};LF.M.push(m);L.lfM.push(m);for(let a=Math.floor((x-r)/64);a<=Math.floor((x+r)/64);a++)for(let b=Math.floor((z-r)/64);b<=Math.floor((z+r)/64);b++){const k=a*10000+b;if(!LF.MG.has(k))LF.MG.set(k,[]);LF.MG.get(k).push(m)}
  di('mound',x,z,LF_h(x,z,6)*6.28,r,h,r,GRN[Math.floor(LF_h(x,z,8)*GRN.length)],groundY(x,z));if(slice()){yield;t0=performance.now()}}
 // 3 · one theme per cell
 for(const[x,z]of cells){const n=LF_n(x,z),u=LF_h(x,z,9),th=n<.22?(u<.45?'pond':'meadow'):n<.42?'grove':n<.55?'garden':n<.62?'market':n<.8?'wild':'meadow';st.th=st.th||{};st.th[th]=(st.th[th]||0)+1;
  const R=(s)=>(LF_h(x,z,s)-.5),ring=(r,k,N)=>{const a=k/N*6.28+u*6.28;return[x+Math.sin(a)*r,z+Math.cos(a)*r]};
  for(let k=0;k<9;k++){const tx=x+R(20+k)*36,tz=z+R(40+k)*36,s=1.3+LF_h(tx,tz,1)*1.4;di('tuft',tx,tz,LF_h(tx,tz,2)*6.28,s,s,s,GRN[k%GRN.length])}
  {const s=6+u*7;di('patch',x+R(11)*8,z+R(12)*8,u*6.28,s,1,s*(.6+LF_h(x,z,13)*.5),GRN[(Math.floor(u*9))%GRN.length]);if(!fra)di('patch',x+R(14)*22,z+R(15)*22,u*3,s*.8,1,s*.6,DIRT[Math.floor(u*3)%DIRT.length])}
  if(th==='grove'){const nT=3+Math.floor(LF_h(x,z,14)*3);for(let k=0;k<nT;k++){const[a,b]=ring(3+LF_h(x,z,15+k)*8,k,nT);P(pk(TREES),a,b)}{const[a,b]=ring(10,.5,3);P('bush',a,b)}if(u<.3)P('bench',x+R(17)*6,z+12,Math.PI)}
  else if(th==='garden'){const ry=Math.floor(u*4)*Math.PI/2;for(let k=-1;k<=1;k++){const ox=Math.cos(ry)*k*5,oz=-Math.sin(ry)*k*5;di('bed',x+ox,z+oz,ry,1,1,1,null)}
   for(let k=-2;k<=2;k++)for(const sd of[-1,1]){const ox=Math.cos(ry)*k*3.8+Math.sin(ry)*sd*3.6,oz=-Math.sin(ry)*k*3.8+Math.cos(ry)*sd*3.6;if(LF_h(x+k,z+sd,18)<.4)P('bush',x+ox,z+oz)}
   P('bench',x+Math.sin(ry)*6,z+Math.cos(ry)*6,ry+Math.PI);if(u<.5)P('lamp',x-Math.sin(ry)*6.5,z-Math.cos(ry)*6.5);di('patch',x,z,ry,9,1,4,'#d8c08a')}
  else if(th==='pond'){const r=5+u*5;di('patch',x,z,u*6.28,r+2.2,1,r+2.2,'#d8c08a',groundY(x,z)+.01);di('pond',x,z,0,r,1,r,'#3a8fd8');for(let k=0;k<6;k++){const[a,b]=ring(r+.6,k,6);di('reed',a,b,k,1,1,1,null)}
   for(let k=0;k<2;k++){const[a,b]=ring(r+3,k+.3,2);P(ROCK,a,b)}if(u<.7){const[a,b]=ring(r+6,.75,1);P(pk(TREES),a,b)}}
  else if(th==='market'){const ry=Math.floor(u*4)*Math.PI/2;di('patch',x,z,ry,10,1,7,DIRT[1]);P('stall',x,z,ry);P('parasol',x+Math.cos(ry)*6,z-Math.sin(ry)*6);P('table',x+Math.cos(ry)*6+1.5,z-Math.sin(ry)*6+1.5);P('parasol',x-Math.cos(ry)*6,z+Math.sin(ry)*6);P('bin',x+Math.sin(ry)*5,z+Math.cos(ry)*5)}
  else if(th==='wild'){di('patch',x+R(21)*10,z+R(22)*10,u*6.28,5+u*6,1,4+u*5,DIRT[Math.floor(u*3)]);for(let k=0;k<1+Math.floor(u*2.5);k++)P(ROCK,x+R(23+k)*20,z+R(26+k)*20);P('bush',x+R(29)*16,z+R(30)*16);if(u<.4)P(pk(TREES),x+R(31)*14,z+R(32)*14)}
  else{for(let k=0;k<4;k++){const tx=x+R(50+k)*26,tz=z+R(60+k)*22;di('tuft',tx,tz,k,.7,.7,.7,LF_FC[k%LF_FC.length])}if(u<.25)P(pk(TREES),x+R(33)*10,z+R(34)*10)}
  if(slice()){yield;t0=performance.now()}}
 // 4 · the verge: what you see while driving. Every LF.vs m along every street and filler road, both sides, 5-20 m off the kerb, open ground only:
 // grass clumps always + the zone's theme (grove: a tree, garden: a flower bed + hedge bush, wild: a rock or dirt, meadow: flowers, pond zone: reeds)
 for(const[x,z,ux,uz,w,k]of C.VS.get(Math.floor(X0/1000)+'|'+Math.floor(Z0/1000))||[]){for(const sd of[-1,1]){const nx=uz*sd,nz=-ux*sd,u=LF_h(x+sd,z,k),o=w/2+5+u*15,px=x+nx*o,pz=z+nz*o;
   if(roamHit(px,pz,4)||inRiver(px,pz,-3)||onAnyDeck(px,pz)||LF_count(px,pz,6)>0)continue;const q=cityAt(px,pz);if(q&&q.d<q.road.w/2+4)continue;const f=fillAt(px,pz);if(f&&f.d<f.r.w/2+4)continue;
   const a=abAt(px,pz);if(a&&a.d<a.road.w/2+8)continue;if(fra&&typeof biomeAt==='function'&&(biomeAt(px,pz)||{}).g==='air')continue;st.verge=(st.verge||0)+1;
   const zn=LF_n(px,pz),ry=Math.atan2(ux,uz),s=1.2+LF_h(px,pz,3)*1.6;for(let j=0;j<3;j++){const q2=LF_h(px,pz,40+j);di('tuft',px+ux*(q2-.5)*10+nx*(j-1)*3,pz+uz*(q2-.5)*10+nz*(j-1)*3,q2*6.28,s*(.7+q2*.5),s*(.7+q2*.5),s*(.7+q2*.5),GRN[(k+j)%GRN.length])}
   if(zn<.22){if(u<.5)di('reed',px+ux*2,pz+uz*2,u*6,1,1,1,null)}
   else if(zn<.42){if(o>w/2+8&&u<.6)P(pk(TREES),px,pz);else P('bush',px,pz)}
   else if(zn<.55){if(u<.55){di('bed',px,pz,ry,1,1,1,null);if(u<.3)P('bush',px+ux*3.5,pz+uz*3.5)}else P('bush',px,pz)}
   else if(zn<.62){if(u<.3)P('bench',px,pz,ry+(sd>0?Math.PI/2:-Math.PI/2))}
   else if(zn<.8){if(u<.4)P(ROCK,px,pz);else di('patch',px,pz,u*6.28,3+u*4,1,2+u*3,DIRT[k%DIRT.length])}
   else for(let j=0;j<3;j++)di('tuft',px+(LF_h(px,j,4)-.5)*6,pz+(LF_h(pz,j,5)-.5)*6,j,.8,.8,.8,LF_FC[(k+j)%LF_FC.length])}
  if(slice()){yield;t0=performance.now()}}
 // 5 · decor meshes (one per type for this tile), then the props through the city's own prop builder
 const GE=LF.geo||(LF.geo=LF_geos()),mat=LF.mat||(LF.mat={def:new THREE.MeshStandardMaterial({vertexColors:true,roughness:.6}),tuft:new THREE.MeshStandardMaterial({vertexColors:true,roughness:.7,side:THREE.DoubleSide}),pond:new THREE.MeshStandardMaterial({vertexColors:true,roughness:.12,metalness:.15})});
 const M4=new THREE.Matrix4(),Q=new THREE.Quaternion(),S=new THREE.Vector3(),Pv=new THREE.Vector3(),Y=new THREE.Vector3(0,1,0),Co=new THREE.Color();LF.ms=LF.ms||[];
 for(const t in I){const A=I[t];if(!A.length)continue;const m=new THREE.InstancedMesh(GE[t],t==='tuft'||t==='reed'?mat.tuft:t==='pond'?mat.pond:mat.def,A.length);
  A.forEach((p,i)=>{Q.setFromAxisAngle(Y,p.ry||0);M4.compose(Pv.set(p.x,p.y,p.z),Q,S.set(p.sx,p.sy,p.sz));m.setMatrixAt(i,M4);m.setColorAt(i,Co.set(p.c||'#ffffff'))});
  m.computeBoundingSphere();m.castShadow=t==='mound';m.receiveShadow=true;m.userData.lf=t;m.userData.lfR=L.id;m.userData.nsh=t!=='mound';L.root.add(m);LF.ms.push(m);yield}
 st.regs=(st.regs||0)+1;yield* lzPropsG(L)}
// GO / tests: build the fill tiles around (x,z) now (a GO lands you there before lazyStep would reach them)
function LF_ensure(x,z,r){if(typeof LAZY==='undefined')return 0;let n=0;for(const L of LAZY)if(L.lf&&!L.done&&lzD(L,x,z)<r){lzRun(L);n++}return n}
buildHubProps=(f=>function(){const r=f.apply(this,arguments);try{LF_reg()}catch(e){console.warn('LF reg',e)}return r})(buildHubProps);
// distance cull: each decor type hides past LF.R[type] m (checked every 15 frames)
hubCullStep=(f=>function(){f.apply(this,arguments);if(!LF.ms||(LF.fr=(LF.fr|0)+1)%15)return;const cp=camera.position;for(const m of LF.ms){const s=m.boundingSphere;if(!s)continue;m.visible=Math.hypot(s.center.x-cp.x,s.center.z-cp.z)-s.radius<LF.R[m.userData.lf]}})(hubCullStep);
// flat uniform green % of the frame = visible GROUND that is one flat green: 4×4 blocks (1/2-res) that are green (G > R+12, G > B+12), flat (luma
// stdev < 9) AND unoccluded ground: a second render with only the ground meshes (userData.trG) must match the normal frame there (mean |Δ| < 6),
// so tree crowns, cars, HUD-free canvas only. Bottom 22% (the car) left out.
function LF_px(){try{composer.render()}catch(e){}const c=renderer.domElement,W=Math.floor(c.width/2),H=Math.floor(c.height/2),cv=LF.cv||(LF.cv=document.createElement('canvas'));cv.width=W;cv.height=H;
 const x=cv.getContext('2d',{willReadFrequently:true});x.drawImage(c,0,0,W,H);return{W,H,D:x.getImageData(0,0,W,H).data}}
function LF_green(){const A=LF_px(),hid=[];scene.traverse(o=>{if((o.isMesh||o.isPoints||o.isSprite||o.isLine)&&o.visible&&!o.userData.trG){o.visible=false;hid.push(o)}});const bg=scene.background;scene.background=null;
 let B;try{B=LF_px()}finally{for(const o of hid)o.visible=true;scene.background=bg}try{composer.render()}catch(e){}
 const{W,H,D}=A,E=B.D,H2=Math.floor(H*.78);let n=0,g=0;
 for(let by=0;by+4<=H2;by+=4)for(let bx=0;bx+4<=W;bx+=4){let r=0,gg=0,b=0,l=0,l2=0,dd=0;for(let j=0;j<4;j++)for(let i=0;i<4;i++){const o=((by+j)*W+bx+i)*4,R=D[o],G=D[o+1],Bb=D[o+2],L=.299*R+.587*G+.114*Bb;r+=R;gg+=G;b+=Bb;l+=L;l2+=L*L;dd+=Math.abs(R-E[o])+Math.abs(G-E[o+1])+Math.abs(Bb-E[o+2])}
  r/=16;gg/=16;b/=16;l/=16;const sd=Math.sqrt(Math.max(0,l2/16-l*l));n++;if(gg>r+12&&gg>b+12&&sd<9&&dd/48<6)g++}return+(100*g/Math.max(1,n)).toFixed(1)}
// GO spots: the exact empty spots of the reference grid (docs/research/ref/fill/side_by_side.jpg), car parked looking at the empty ground
LF.SP={'fra-1':{c:'fra',x:-2093.3,z:-547.9,h:2.356,n:'Frankfurt west meadow'},'fra-2':{c:'fra',x:-1753,z:-240.3,h:2.356,n:'Frankfurt west field'},'fra-3':{c:'fra',x:960,z:-308,h:4.712,n:'Frankfurt east lawn'},
 'fra-4':{c:'fra',x:-1680,z:-1680,h:1.571,n:'Frankfurt south-west field'},'ath-1':{c:'ath',x:-1917.3,z:2338.4,h:2.356,n:'Athens north slope'},'ath-2':{c:'ath',x:1221.4,z:-1029.8,h:3.142,n:'Athens south lawn'}};
// pass line: visible flat-green ground ≤ 8% of the frame AND ≥ 6 props within 50 m of the looked-at point
LF.pass=m=>m.green<=8&&m.props50>=6;// hRange (hills in view) is reported, not gated: terrain relief is art-1's lane (coordinator 2026-10-13)
function LF_goSpot(id){const s=LF.SP[id];if(!s)return'no spot '+id;if(s.c!==CID)return'wrong city';LF_go(s);LF_ensure(s.x,s.z,600);LF.last=null;
 setTimeout(()=>{const m=LF_metrics(s);m.green=LF_green();m.id=id;m.pass=LF.pass(m);LF.last=m;try{say('',(m.pass?'✅ PASS':'❌ FAIL')+` · flat green ${m.green}% · ${m.props50} props ≤50 m · hills ${m.hRange} m`,4)}catch(e){}},2500);
 return'📍 '+s.n.toUpperCase()+' · measuring in 2.5 s'}
Object.assign(window.__lvf,{goSpot:LF_goSpot,green:LF_green,SP:LF.SP});
// mound GO: the nearest grass hill with a clear 50 m run-up (no building, road edge or water on the line); the car is parked 40 m before its centre
// facing it. You (or the test) drive at it: PASS = the car climbs ≥ 60% of the hill's height, passes within r/3 of the top and never stalls (< 2 m/s after 1.5 s of gas).
function LF_goMound(){LF_ensure(RO.x,RO.z,900);let best=null,bd=1e18;for(const m of LF.M){const d=(m.x-RO.x)**2+(m.z-RO.z)**2;if(d>=bd)continue;for(let k=0;k<8;k++){const a=k*Math.PI/4,sx=m.x-Math.sin(a)*(m.r+40),sz=m.z-Math.cos(a)*(m.r+40);let ok=true;
   ok=Math.abs(groundY(sx,sz)-groundY(m.x,m.z))<1;for(let t=0;t<=1&&ok;t+=.1){const px=sx+(m.x-sx)*t,pz=sz+(m.z-sz)*t;ok=!roamHit(px,pz,3)&&!inRiver(px,pz,-2)&&!onAnyDeck(px,pz)}if(ok){best={m,sx,sz,h:a};bd=d;break}}}
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
{float n=lfN(vLfW/58.)*.5+lfN(vLfW/21.+7.3)*.28+lfN(vLfW/7.5+3.1)*.14+lfN(vLfW/2.6+1.7)*.08;n=smoothstep(.2,.8,n);diffuseColor.rgb*=mix(vec3(${LF.MOT.dk.join(',')}),vec3(${LF.MOT.lt.join(',')}),n);}`);(LF.motDbg=LF.motDbg||[]).push([m.name||'',sh.fragmentShader.includes('lfN(vLfW'),sh.vertexShader.includes('vLfW=')])};
 m.customProgramCacheKey=()=>'lfMot';m.needsUpdate=true}
ART_hub=(f=>function(){const r=f.apply(this,arguments);if(LF.on&&HUB&&HUB.M)try{for(const k of['walk','yard','grass'])LF_mottle(HUB.M[k])}catch(e){console.warn('LF mottle',e)}return r})(ART_hub);
// test probe: why a point gets no fill (first failing rule)
LF.why=(x,z)=>{if(roamHit(x,z,12))return'building';const q=cityAt(x,z),f=fillAt(x,z),d=Math.min(q?q.d-q.road.w/2:1e9,f?f.d-f.r.w/2:1e9);if(d<12)return'road '+d.toFixed(0);if(d>LF.near)return'far '+d.toFixed(0);
 if(inRiver(x,z,-12))return'river';if(onAnyDeck(x,z))return'deck';const a=abAt(x,z);if(a&&a.d<a.road.w/2+14)return'autobahn';if(RO.ramps&&RO.ramps.some(r=>Math.abs(r.x-x)<30&&Math.abs(r.z-z)<30))return'ramp';
 if(CID==='fra'&&typeof biomeAt==='function'&&(biomeAt(x,z)||{}).g==='air')return'airport';if(LF_count(x,z,16)>=2)return'props '+LF_count(x,z,16);if(trailDist(x,z)<12)return'trail';return'open'};
window.__lvf.why=(x,z)=>LF.why(x,z);window.__lvf.ensure=(x,z,r)=>LF_ensure(x,z,r);window.__lvf.turn=a=>{RO.h=RO.vh=RO.h+a;camSnap=true};window.__lvf.rinfo=()=>({calls:renderer.info.render.calls,tris:renderer.info.render.triangles,fill:LF.st.n||0});
