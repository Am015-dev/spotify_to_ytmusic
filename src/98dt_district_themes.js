// ===== DT (art-6, 2026-10-14): DISTRICT THEMES (Frankfurt). Spec + tests: docs/HANDOFF_ART6.md. ?dt=0 = off.
// BV_life (98bv) picks one street-life piece per facade slot; inside these districts it may also pick the district's own kinds:
//   Sachsenhausen  'tavern'  : apple-wine garden on the pavement (long table, 2 benches, post with the green Fichtenkranz wreath + Bembel jug, string lights)
//   Bahnhofsviertel 'neon'   : pavement pylon with a tall glowing blade sign;  'neonroof': glowing sign on legs on a LEGO set's roof
//   Osthafen       'mwall'   : free-standing LEGO brick wall beside a set, painted both sides (4 canvas designs), with a collider
// Opaque parts go into BV's instanced boxes (put); glowing parts into one unlit InstancedMesh, murals into one InstancedMesh per design (per 1.6 km cell).
// Every placed piece is recorded in DT.P for the GO tests (dt/sachs, dt/bahn, dt/ost).
const DT={on:!/[?&]dt=0\b/.test(location.search),P:[],glow:new Map(),mw:new Map(),ms:[]};
const DT_D={Sachsenhausen:'sachs',Bahnhofsviertel:'bahn',Osthafen:'ost'},DT_K={sachs:['tavern'],bahn:['neon','neonroof'],ost:['mwall']},DT_W={sachs:[1.6],bahn:[3,1.4],ost:[1.6]};
const DT_NEON=['#ff3aa8','#33e6ff','#a35cff','#ffb020','#5cff8a'];
function DT_at(x,z){if(!DT.on||CID!=='fra')return null;let n=null;try{n=districtAt(x,z)}catch(e){}return DT_D[n]||null}
const DT_cell=(x,z)=>Math.floor(x/1600)*1000+Math.floor(z/1600);
function DT_glow(px,y,pz,ry,sx,sy,sz,col){const k=DT_cell(px,pz);let A=DT.glow.get(k);if(!A)DT.glow.set(k,A=[]);A.push(px,y,pz,ry,sx,sy,sz,parseInt(col.slice(1),16))}
// clear of the road: every listed local point (lx,lz) is >= m off a drivable surface
const DT_clear=(L,pts,m)=>pts.every(([a,b])=>{const[px,pz]=L(a,b);return OC_roadE(px,pz)>=m&&!inRiver(px,pz,0)});
// c = {put,L,w,D,d,o,y0,ry,pc,x,z,sl,dz}; returns false when the piece does not fit (BV then skips the slot)
function DT_draw(t,c){const{put,L,w,D,d,o,y0,ry}=c,rec={t,dz:c.dz,parts:{},cols:[],minY:9e9,road:0};const P=(lx,ly,lz,sx,sy,sz,col,part)=>{put(lx,ly,lz,sx,sy,sz,col);if(part)rec.parts[part]=(rec.parts[part]||0)+1};
 const G=(lx,ly,lz,sx,sy,sz,col)=>{const[px,pz]=L(lx,lz);DT_glow(px,y0+ly,pz,ry,sx,sy,sz,col);rec.minY=Math.min(rec.minY,ly-sy/2);if(!rec.cols.includes(col))rec.cols.push(col)};
 if(t==='tavern'){if(w<7)return false;const tz=D+1.7,tx=(BV_h(c.x,c.z,70)-.5)*Math.max(0,w-7.5);if(!DT_clear(L,[[tx-1.7,tz-1],[tx+1.7,tz+1],[tx+2.3,tz-.6],[tx-2.2,D+2.7],[tx+2.2,D+2.7]],.4))return false;
  const wood='#8a5a3a',dark='#5a3a24';P(tx,.76,tz,3.2,.12,.86,wood,'table');for(const sd of[-1,1]){P(tx+sd*1.35,.37,tz,.14,.74,.6,dark);P(tx,.46,tz+sd*.8,3,.1,.34,'#7a4a2a','bench');for(const e of[-1,1])P(tx+e*1.3,.22,tz+sd*.8,.12,.44,.3,dark)}
  P(tx-.6,.88,tz,.36,.12,.36,'#c8d8e0');P(tx+.7,.88,tz,.36,.12,.36,'#c8d8e0');// Gerippte glasses
  const px=tx+2.3,pz=D+.7;P(px,1.7,pz,.2,3.4,.2,dark);P(px,3.05,pz+.55,.12,.12,1.1,'#2a2a2e');
  for(const[a,b,sx,sy]of[[0,2.95,.95,.22],[0,2.05,.95,.22],[-.37,2.5,.22,.7],[.37,2.5,.22,.7]])P(px+a,b,pz+1.05,sx,sy,.22,'#2f6a2a','wreath');// Fichtenkranz (green pine wreath = open tavern)
  P(px,3.62,pz,.5,.52,.5,'#9aa8b4','bembel');P(px,3.62,pz,.53,.12,.53,'#2a4a8a');P(px+.32,3.66,pz,.14,.3,.1,'#9aa8b4');P(px,3.92,pz,.3,.1,.3,'#9aa8b4');// Bembel: stoneware grey, cobalt band, handle, neck
  for(const lx of[tx-2.2,tx+1.6])P(lx,1.45,D+2.7,.12,2.9,.12,'#2a2a2e');P(tx-.3,2.9,D+2.7,3.8,.04,.04,'#2a2a2e');for(let i=0;i<6;i++)G(tx-2+i*.68,2.8,D+2.7,.14,.14,.14,'#ffd88a');
  const[hx,hz]=L(tx,tz);hubAddB({x:hx,z:hz,hw:1.7,hd:1.2,h:1,ry});rec.vx=hx;rec.vz=hz}
 else if(t==='neon'){const sd=BV_h(c.x,c.z,71)<.5?-1:1,lx=sd*Math.max(0,w/2-1.2),nz=D+1.3;if(!DT_clear(L,[[lx,nz],[lx,nz+.8]],.5))return false;
  const c0=DT_NEON[Math.floor(BV_h(c.x+c.sl,c.z,72)*DT_NEON.length)],c1=DT_NEON[(DT_NEON.indexOf(c0)+2)%DT_NEON.length];P(lx,3.1,nz,.26,6.2,.26,'#2a2a2e');P(lx,5.1,nz+.7,.3,4.6,1.8,'#16161c','blade');
  for(const e of[-1,1]){G(lx+e*.17,5.1,nz+.7,.04,4.2,1.5,c0);for(let i=0;i<4;i++)G(lx+e*.19,3.45+i*1.1,nz+.7,.04,.18,1.6,c1)}G(lx,7.5,nz+.7,.22,.22,1.8,c1);
  const[hx,hz]=L(lx,nz);hubAddB({x:hx,z:hz,hw:.2,hd:.2,h:5,ry});rec.vx=hx;rec.vz=hz;rec.vh=ry+Math.PI/2+.5;rec.vh2=ry-Math.PI/2-.5/* the blade faces along the street */}
 else if(t==='neonroof'){if(!o.ctb||o.yb==null)return false;const bw=Math.min(w*.6,7),yb=o.h+(o.yb-y0),c0=DT_NEON[Math.floor(BV_h(c.x,c.z,73)*DT_NEON.length)],c1=DT_NEON[(DT_NEON.indexOf(c0)+1)%DT_NEON.length];
  for(const s of[-1,1])P(s*bw*.35,yb+.9,D-1.5,.25,1.8,.25,'#2a2a2e');P(0,yb+2.9,D-1.5,bw+.4,2.4,.2,'#16161c','frame');const n=4;for(let i=0;i<n;i++)G((i-(n-1)/2)*bw/n,yb+3.15,D-1.36,bw/n*.7,1.1,.06,i%2?c1:c0);G(0,yb+2.15,D-1.36,bw*.9,.14,.06,c1)}
 else if(t==='mwall'){if(c.sl)return false;const Lw=Math.min(d*.9,10);if(Lw<6)return false;let ok=null;for(const sd of BV_h(c.x,c.z,74)<.5?[-1,1]:[1,-1]){const mx=sd*(w/2+1);const pts=[];for(let i=0;i<5;i++)pts.push([mx,(i/4-.5)*Lw]);
   if(DT_clear(L,pts,.8)&&pts.every(([a,b])=>{const[px,pz]=L(a,b);return!roamHit(px,pz,.45)})){ok=sd;break}}if(ok==null)return false;
  const mx=ok*(w/2+1);P(mx,1.75,0,.4,3.5,Lw,'#a4532e','wall');P(mx,3.6,0,.5,.22,Lw+.1,'#7a3a20');const k=Math.floor(BV_h(c.x,c.z,75)*4)%4;rec.design=k;
  for(const s of[-1,1]){const[px,pz]=L(mx+s*.215,0),cl=DT_cell(px,pz);let A=DT.mw.get(cl);if(!A)DT.mw.set(cl,A=[[],[],[],[]]);A[k].push(px,y0+1.75,pz,ry+s*Math.PI/2,Lw-.2,3.2)}
  const[hx,hz]=L(mx,0);hubAddB({x:hx,z:hz,hw:.2,hd:Lw/2,h:3.6,ry});rec.wall={x:hx,z:hz,Lw};rec.vh=ry+Math.PI/2+(ok>0?Math.PI:0)+.3;rec.vx=hx;rec.vz=hz}
 else return false;
 const[fx,fz]=L(0,D+2);rec.x=fx;rec.z=fz;if(rec.vh==null)rec.vh=Math.atan2(-Math.sin(ry),-Math.cos(ry))+.45;if(rec.vx==null){rec.vx=fx;rec.vz=fz}DT.P.push(rec);return true}
// mural canvases (512 x 160, ~ the wall's 10 x 3.2 m): 0 minifig smile, 1 race car + speed lines, 2 skyline at sunset, 3 studs
function DT_murTex(k){const cv=document.createElement('canvas');cv.width=512;cv.height=160;const g=cv.getContext('2d'),W=512,H=160;
 if(k===0){g.fillStyle='#2a7de1';g.fillRect(0,0,W,H);g.fillStyle='#ffd12c';g.beginPath();g.arc(256,80,62,0,7);g.fill();g.fillStyle='#1b1d22';for(const x of[234,278]){g.beginPath();g.arc(x,66,8,0,7);g.fill()}g.lineWidth=7;g.strokeStyle='#1b1d22';g.beginPath();g.arc(256,84,28,.25,2.9);g.stroke();
  for(let i=0;i<6;i++){g.fillStyle=['#d8302a','#3fb24a','#ffffff'][i%3];g.fillRect(20+i*28,20+(i%2)*90,22,40);g.fillRect(400+i*16,30+(i%3)*36,12,30)}}
 else if(k===1){const gr=g.createLinearGradient(0,0,W,0);gr.addColorStop(0,'#ff3a8a');gr.addColorStop(1,'#7a3aff');g.fillStyle=gr;g.fillRect(0,0,W,H);g.fillStyle='#ffffff';for(let i=0;i<7;i++)g.fillRect(10+i*18,50+i*10,120-i*8,6);
  g.fillStyle='#ffd12c';g.fillRect(200,70,220,44);g.fillRect(250,44,110,30);g.fillStyle='#1b1d22';for(const x of[240,380]){g.beginPath();g.arc(x,116,22,0,7);g.fill()}g.fillStyle='#bfe3ff';g.fillRect(262,50,40,20);g.fillRect(310,50,40,20)}
 else if(k===2){const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#ff8a3a');gr.addColorStop(.6,'#ffd12c');gr.addColorStop(1,'#ff5a7a');g.fillStyle=gr;g.fillRect(0,0,W,H);g.fillStyle='#ffffff';g.beginPath();g.arc(400,60,26,0,7);g.fill();
  g.fillStyle='#2a2140';for(const[x,w,h]of[[20,40,70],[70,30,110],[110,46,90],[170,26,140],[205,40,100],[255,30,125],[300,50,80],[360,36,105],[410,44,70],[465,40,95]])g.fillRect(x,H-h,w,h);g.fillStyle='#ffd88a';for(let i=0;i<40;i++)g.fillRect(25+(i*53)%460,H-10-(i*29)%60,4,5)}
 else{g.fillStyle='#3fb24a';g.fillRect(0,0,W,H);const C=['#d8302a','#ffd12c','#2a7de1','#ffffff','#ff8a3a'];for(let y=0;y<4;y++)for(let x=0;x<13;x++){g.fillStyle=C[(x*3+y*5)%5];g.beginPath();g.arc(20+x*39,22+y*39,15,0,7);g.fill();g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.arc(23+x*39,25+y*39,15,0,1.6);g.fill()}}
 g.font='900 italic 22px system-ui';g.fillStyle='rgba(27,29,34,.85)';g.fillText('OSTHAFEN',W-130,H-10);const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t}
// after BV_life: the glow and mural meshes; DT.st = counts per district for the tests
function DT_flush(){for(const m of DT.ms)if(m.parent)m.parent.remove(m);DT.ms=[];const M4=new THREE.Matrix4(),Q=new THREE.Quaternion(),Y=new THREE.Vector3(0,1,0),Pv=new THREE.Vector3(),S=new THREE.Vector3(),Co=new THREE.Color();
 const gg=DT.gg||(DT.gg=new THREE.BoxGeometry(1,1,1)),gm=DT.gm||(DT.gm=new THREE.MeshBasicMaterial({toneMapped:false}));
 for(const[,a]of DT.glow){const n=a.length/8,im=new THREE.InstancedMesh(gg,gm,n);for(let i=0;i<n;i++){const o=i*8;Q.setFromAxisAngle(Y,a[o+3]);M4.compose(Pv.set(a[o],a[o+1],a[o+2]),Q,S.set(a[o+4],a[o+5],a[o+6]));im.setMatrixAt(i,M4);im.setColorAt(i,Co.setHex(a[o+7]))}
  im.computeBoundingSphere();im.userData.bvL=1;im.userData.cd=600;im.userData.dt='glow';HUB.grp.add(im);DT.ms.push(im)}
 const pg=DT.pg||(DT.pg=new THREE.PlaneGeometry(1,1));DT.mm=DT.mm||[0,1,2,3].map(k=>new THREE.MeshStandardMaterial({map:DT_murTex(k),roughness:.8,polygonOffset:true,polygonOffsetFactor:-1}));
 for(const[,A]of DT.mw)A.forEach((a,k)=>{const n=a.length/6;if(!n)return;const im=new THREE.InstancedMesh(pg,DT.mm[k],n);for(let i=0;i<n;i++){const o=i*6;Q.setFromAxisAngle(Y,a[o+3]);M4.compose(Pv.set(a[o],a[o+1],a[o+2]),Q,S.set(a[o+4],a[o+5],1));im.setMatrixAt(i,M4)}
  im.computeBoundingSphere();im.receiveShadow=true;im.userData.bvL=1;im.userData.cd=500;im.userData.dt='mural';HUB.grp.add(im);DT.ms.push(im)});
 const st={};for(const r of DT.P)st[r.t]=(st[r.t]||0)+1;DT.st={by:st,meshes:DT.ms.length};DT.glow=new Map();DT.mw=new Map()}
buildHubProps=(f=>function(){DT.P=[];DT.glow=new Map();DT.mw=new Map();const r=f.apply(this,arguments);try{if(DT.on&&CID==='fra')DT_flush()}catch(e){console.warn('DT',e)}return r})(buildHubProps);
// ---- GO tests (src/99c_checklist.js dt/*): car parked on the road at the densest spot of the district's pieces, looking at one; verdict after 600 ms
function DT_go(dz,say){if(state!=='roam'||!RO.on)return'📍 Start free roam first';if(!DT.on)return'📍 PENDING · district themes are OFF (?dt=0)';if(CID!=='fra')return'📍 Frankfurt only';
 const kinds=DT_K[dz],R=dz==='ost'?300:150,mine=DT.P.filter(r=>kinds.includes(r.t));if(!mine.length)return`📍 No ${dz} theme pieces built ❌`;
 let best=null,bn=-1;for(const r of dz==='bahn'?mine.filter(r=>r.t==='neon'):mine){/* view a pavement pylon (roof signs are above the chase camera) */let n=0;for(const q of mine)if((q.x-r.x)**2+(q.z-r.z)**2<R*R)n++;if(n>bn){bn=n;best=r}}
 // view (like BV_view): the car stands 14-20 m out, looking at the piece (the mural face-on); else on the nearest road facing it
 let put=false;for(const vh of[best.vh,best.vh2])for(const Dd of dz==='bahn'?[13,10,16]:[14,18,11,22]){if(put||vh==null)break;const x=best.vx-Math.sin(vh)*Dd,z=best.vz-Math.cos(vh)*Dd;if(roamHit(x,z,2.5)||inRiver(x,z,0))continue;if(roamWarp(x,z,vh))put=true}
 if(!put){const s=rfSnap(best.x,best.z,200);if(s){const h=Math.atan2(best.x-s[0],best.z-s[1]);roamWarp(s[0],s[1],h)}}RO.v=0;camSnap=true;
 setTimeout(()=>{const near=mine.filter(r=>(r.x-best.x)**2+(r.z-best.z)**2<R*R),out=DT.P.filter(r=>kinds.includes(r.t)&&DT_at(r.x,r.z)!==dz).length,dc=DT.ms.length;let ok,txt;
  if(dz==='sachs'){const full=near.filter(r=>r.parts.table&&r.parts.bench>=2&&r.parts.wreath&&r.parts.bembel).length,road=near.filter(r=>OC_roadE(r.x,r.z)<0).length;ok=full>=3&&out===0;txt=`📍 APPLE-WINE TAVERNS: ${full} complete within ${R} m (≥ 3: table, 2 benches, wreath, Bembel), ${out} outside Sachsenhausen (0)`}
  else if(dz==='bahn'){const cols=new Set(near.flatMap(r=>r.cols)).size,low=near.filter(r=>r.t==='neon'&&r.minY<2.4).length;ok=near.length>=5&&cols>=3&&low===0&&out===0;txt=`📍 BAHNHOF NEON: ${near.length} glowing signs within ${R} m (≥ 5), ${cols} colours (≥ 3), ${low} pylon signs under 2.4 m (0), ${out} outside the Bahnhofsviertel (0)`}
  else{const des=new Set(near.map(r=>r.design)).size,bad=near.filter(r=>!r.wall||OC_roadE(r.wall.x,r.wall.z)<.8||!roamHit(r.wall.x,r.wall.z,.1)).length;ok=near.length>=3&&des>=2&&bad===0&&out===0;txt=`📍 OSTHAFEN MURALS: ${near.length} mural walls within ${R} m (≥ 3), ${des} designs (≥ 2), ${bad} on a road / without a collider (0), ${out} outside Osthafen (0)`}
  ok=ok&&dc<=12;say(txt+`, ${dc} extra draw calls (≤ 12) `+(ok?'✅':'❌'))},600);return'📍 DISTRICT THEME · measuring…'}
window.__dt={DT,go:(dz,s)=>DT_go(dz,s),at:(x,z)=>DT_at(x,z)};
