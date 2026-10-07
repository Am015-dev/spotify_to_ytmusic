/* ============================================================ 6 · world */
const _m=new THREE.Matrix4(),_q=new THREE.Quaternion(),_s=V3(),_v=V3();
function geo(pos,uv,idx,nrm,col){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));if(uv)g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));if(col)g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);if(nrm)g.setAttribute('normal',new THREE.Float32BufferAttribute(nrm,3));else g.computeVertexNormals();return g}
function placeOnTrack(obj,f,x,h=0){obj.position.copy(f.p).addScaledVector(f.r,x).addScaledVector(f.u,h);obj.quaternion.setFromRotationMatrix(_m.makeBasis(f.r,f.u,f.t.clone().negate()))}
function basisM(f,x,h){return new THREE.Matrix4().makeBasis(f.r,f.u,f.t.clone().negate()).setPosition(f.p.clone().addScaledVector(f.r,x).addScaledVector(f.u,h))}
// batches: many small geometries merged per material
class TInst{constructor(geo,mat,tile=1000){this.geo=geo;this.mat=mat;this.t=tile;this.m=new Map()}add(x,y,z,ry=0,s=1,col){const k=Math.floor(x/this.t)+','+Math.floor(z/this.t);if(!this.m.has(k))this.m.set(k,[]);this.m.get(k).push([x,y,z,ry,s,col]);return this}flush(parent){const out=[],q=new THREE.Quaternion(),M=new THREE.Matrix4(),c=new THREE.Color(),up=new THREE.Vector3(0,1,0),P=new THREE.Vector3(),S=new THREE.Vector3();for(const L of this.m.values()){const im=new THREE.InstancedMesh(this.geo,this.mat,L.length);L.forEach((o,i)=>{q.setFromAxisAngle(up,o[3]);M.compose(P.set(o[0],o[1],o[2]),q,S.setScalar(o[4]));im.setMatrixAt(i,M);if(o[5]!=null)im.setColorAt(i,c.set(o[5]))});im.computeBoundingSphere();parent.add(im);out.push(im)}this.m.clear();return out}}
class TBatch{constructor(){this.m=new Map()}add(g,mat,matrix){if(matrix)g.applyMatrix4(matrix);g.computeBoundingBox();const b=g.boundingBox,cx=(b.min.x+b.max.x)/2,cz=(b.min.z+b.max.z)/2,k=mat.uuid+'#'+(b.max.x-b.min.x>1600||b.max.z-b.min.z>1600?'big':hubTile(cx,cz));if(!this.m.has(k))this.m.set(k,{mat,gs:[]});const ng=g.index?g.toNonIndexed():g;for(const n of Object.keys(ng.attributes))if(!['position','normal','uv','color'].includes(n))ng.deleteAttribute(n);this.m.get(k).gs.push(ng)}
  flush(parent){for(const{mat,gs}of this.m.values()){const hasC=gs.some(g=>g.attributes.color);if(hasC)for(const g of gs)if(!g.attributes.color){const n=g.attributes.position.count;g.setAttribute('color',new THREE.Float32BufferAttribute(new Array(n*3).fill(1),3))}const hasUv=gs.every(g=>g.attributes.uv);if(!hasUv)for(const g of gs)g.deleteAttribute('uv');const m=new THREE.Mesh(mergeGeometries(gs),mat);parent.add(m)}this.m.clear()}}
class Batch{constructor(){this.m=new Map()}add(g,mat,matrix){if(matrix)g.applyMatrix4(matrix);const k=mat.uuid;if(!this.m.has(k))this.m.set(k,{mat,gs:[]});const ng=g.index?g.toNonIndexed():g;for(const n of Object.keys(ng.attributes))if(!['position','normal','uv','color'].includes(n))ng.deleteAttribute(n);this.m.get(k).gs.push(ng)}
  flush(parent=ROOT){for(const{mat,gs}of this.m.values()){const hasC=gs.some(g=>g.attributes.color);if(hasC)for(const g of gs)if(!g.attributes.color){const n=g.attributes.position.count;g.setAttribute('color',new THREE.Float32BufferAttribute(new Array(n*3).fill(1),3))}
    const hasUv=gs.every(g=>g.attributes.uv);if(!hasUv)for(const g of gs)g.deleteAttribute('uv');const m=new THREE.Mesh(mergeGeometries(gs),mat);parent.add(m)}this.m.clear()}}
const colorize=(g,c)=>{const n=g.attributes.position.count,a=new Float32Array(n*3);for(let i=0;i<n;i++)a.set([c.r,c.g,c.b],i*3);g.setAttribute('color',new THREE.BufferAttribute(a,3));return g};
const MAT={};let ROOT=null,WORLD=null;
function sweep(td,prof,uvAcross,tileLen,skipGap=true){// prof: [[x,y],[x,y]] lateral/up offsets; returns a strip swept along the whole track
  const N=td.N,pos=[],uv=[],idx=[];const p=V3(),r=V3(),u=V3();
  for(let i=0;i<=N;i++){const k=i%N;p.fromArray(td.P,k*3);r.fromArray(td.R,k*3);u.fromArray(td.U,k*3);const v=i*td.ds/tileLen;
    for(let q=0;q<2;q++){const[x,y]=prof[q];pos.push(p.x+r.x*x+u.x*y,p.y+r.y*x+u.y*y,p.z+r.z*x+u.z*y);uv.push(v,uvAcross[q])}
    if(i<N&&!(skipGap&&(inGapF(i*td.ds)||inGapF((i+1)*td.ds)))){const a=i*2;idx.push(a,a+2,a+1,a+1,a+2,a+3)}}
  return geo(pos,uv,idx)}
// GPU-drawn hex road, used when canvas textures are unavailable (same layout as roadTex: one tile = W × W)
function roadShader(){return new THREE.ShaderMaterial({fog:true,uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog]),
  vertexShader:'varying vec2 vUv;\n#include <fog_pars_vertex>\nvoid main(){vUv=uv;vec4 mvPosition=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mvPosition;\n#include <fog_vertex>\n}',
  fragmentShader:`varying vec2 vUv;
#include <fog_pars_fragment>
float hh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float hexD(vec2 p){p=abs(p);return max(dot(p,normalize(vec2(1.,1.7320508))),p.x);}
vec4 hexC(vec2 p){vec2 s=vec2(1.,1.7320508);vec4 c=floor(vec4(p,p-vec2(.5,1.))/s.xyxy)+.5;vec4 h=vec4(p-c.xy*s,p-(c.zw+.5)*s);return dot(h.xy,h.xy)<dot(h.zw,h.zw)?vec4(h.xy,c.xy):vec4(h.zw,c.zw+.5);}
void main(){vec2 q=vec2(vUv.x,fract(vUv.y));vec4 h=hexC(vec2(vUv.x*${W}.,vUv.y*${W}.)/5.2);float e=.5-hexD(h.xy);float r=hh(h.zw);
  vec3 col=vec3(.03,.035,.1)+vec3(.012,.014,.04)*r;float ln=smoothstep(.035,.006,e);col+=(r<.05?vec3(1.,.24,.78):vec3(.09,.7,1.))*ln*(r<.05?.9:.55);
  float ex=q.x*512.;if(ex<13.||ex>499.){col=mod(floor(q.y*16.),2.)<1.?vec3(1.,.18,.58):vec3(1.);}
  if(abs(ex-26.5)<2.5||abs(ex-485.5)<2.5)col=vec3(.86,.96,1.)*1.3;if(abs(ex-256.)<3.&&fract(q.y*4.)<.5)col=vec3(.9,.96,1.)*1.2;
  gl_FragColor=vec4(col,1.);
#include <tonemapping_fragment>
#include <colorspace_fragment>
#include <fog_fragment>
}`})}
function buildRoad(){const td=TF,N=td.N,ATH=TRK.city==='ath';
  const[rt2,re2]=ATH?athRoadTex(TRK.road):roadTex();rt2.repeat.set(1,1);
  MAT.road=new THREE.MeshStandardMaterial({map:rt2,emissiveMap:re2,emissive:0xffffff,emissiveIntensity:1.25,roughness:.42,metalness:.3,envMapIntensity:1});
  if(TEXVAR.none)MAT.road=roadShader();
  // road surface: uv.x across (0..1), uv.y along. Build directly for correct orientation
  {const pos=[],uv=[],idx=[],nrm=[];const p=V3(),r=V3(),u=V3();for(let i=0;i<=N;i++){const k=i%N;p.fromArray(td.P,k*3);r.fromArray(td.R,k*3);u.fromArray(td.U,k*3);const v=i*td.ds/W;
    for(const sx of[-1,1]){pos.push(p.x+r.x*HALF*sx,p.y+r.y*HALF*sx,p.z+r.z*HALF*sx);uv.push(sx<0?0:1,v);nrm.push(u.x,u.y,u.z)}
    if(i<N&&!(inGapF(i*td.ds)||inGapF((i+1)*td.ds))){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}}
   ROOT.add(new THREE.Mesh(geo(pos,uv,idx,nrm),MAT.road))}
  const[wt,we]=ATH?athWallTex(TRK.wall):wallTex('#22e4ff');
  MAT.wall=new THREE.MeshStandardMaterial({map:wt,emissiveMap:we,emissive:0xffffff,emissiveIntensity:1.4,roughness:.45,metalness:.35,side:THREE.DoubleSide});
  MAT.cap=new THREE.MeshStandardMaterial({color:ATH?0xe9e2d4:0x1d2346,roughness:ATH?.6:.35,metalness:ATH?.05:.7,side:THREE.DoubleSide});
  MAT.under=new THREE.MeshStandardMaterial({color:ATH?0x8a8478:0x0e0f22,roughness:.7,metalness:.3,side:THREE.DoubleSide});
  MAT.stripL=neonMat(ATH?'#1f6fd0':'#ff2d95',ATH?1.1:2.4,{side:THREE.DoubleSide});MAT.stripR=neonMat(ATH?'#ffffff':'#22e4ff',ATH?1.05:2.4,{side:THREE.DoubleSide});
  const fh=ATH?1.05:2.8,sh=ATH?1.35:3.5,lh=ATH?1.75:4.5,ch=ATH?1.95:4.8;for(const s of[-1,1]){const x=s*HALF;const face=sweep(td,[[x,0],[x,fh]],[0,1],25),strip=sweep(td,[[x,fh],[x,sh]],[0,1],25),lean=sweep(td,[[x,sh],[x+s*.6,lh]],[0,1],25),cap=sweep(td,[[x+s*.6,lh],[x+s*2.2,ch]],[0,1],25),outer=sweep(td,[[x+s*2.2,ch],[x+s*2.6,ATH?-2.6:-1.4]],[0,1],25),belly=sweep(td,[[x+s*2.6,-1.4],[0,-1.4]],[0,1],25);
    // face textures read right-way up from inside on both sides
    ROOT.add(new THREE.Mesh(face,MAT.wall));ROOT.add(new THREE.Mesh(strip,s<0?MAT.stripL:MAT.stripR));for(const g of[lean,cap,outer])ROOT.add(new THREE.Mesh(g,MAT.cap));ROOT.add(new THREE.Mesh(belly,MAT.under))}
  // light fence: soft additive curtain above the wall
  if(!ATH){const[c,g]=cv(8,128);const gr=g.createLinearGradient(0,128,0,0);gr.addColorStop(0,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,8,128);const ft=tex(c,false);
   for(const s of[-1,1]){const x=s*(HALF+.6);const gft=sweep(td,[[x,4.6],[x+s*3,16]],[0,1],50);gft.attributes.uv.array.forEach((v,i,a)=>{if(i%2===0)a[i]=.5});ROOT.add(new THREE.Mesh(gft,new THREE.MeshBasicMaterial({map:ft,color:glowCol(s<0?'#ff2d95':'#22e4ff',.6),transparent:true,opacity:.16,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,toneMapped:false})))}}
  const bt=new Batch(),p=V3(),r=V3(),u=V3(),t=V3();
  MAT.pylon=new THREE.MeshStandardMaterial({color:ATH?0xe6dfd0:0x232a4d,roughness:ATH?.7:.4,metalness:ATH?0:.6});MAT.accent=neonMat(ATH?'#0d5eaf':'#4ceaff',ATH?1.2:2);MAT.amber=neonMat('#ffb46a',2.4);MAT.dark=new THREE.MeshStandardMaterial({color:ATH?0x24302a:0x121528,roughness:.6,metalness:ATH?.35:.5});
  for(let i=0;i<N;i+=30){p.fromArray(td.P,i*3);if((ATH&&!/FLYOVER/.test(td.SEC[i]))||p.y<5||inGapF(i*td.ds)||crossAt(p,d=>d<-6))continue;r.fromArray(td.R,i*3);const gy=(p.z>RIVER[0]&&p.z<RIVER[1])?-8:0;const h=p.y-2-gy;if(h<2)continue;
    const g=new THREE.CylinderGeometry(3.6,5.6,h,12);g.translate(p.x,gy+h/2,p.z);bt.add(g,MAT.pylon);const ring=new THREE.CylinderGeometry(3.75,3.75,.6,12);ring.translate(p.x,p.y-3.2,p.z);bt.add(ring,MAT.accent);
    const cb=new THREE.BoxGeometry(W+4,1.8,3);bt.add(cb,MAT.pylon,basisM(frameAt(td,i*td.ds,mkF()),0,-2.6))}
  // tunnel: horseshoe hall with ribs
  const tun=[],tuv=[],tidx=[];let tn=0;const segs=16;
  for(let i=0;i<N;i++){p.fromArray(td.P,i*3);if(p.y>=-12)continue;r.fromArray(td.R,i*3);u.fromArray(td.U,i*3);
    for(let q=0;q<=segs;q++){const a=q/segs*Math.PI,x=-Math.cos(a)*(HALF+6),y=Math.pow(Math.sin(a),.22)*20;tun.push(p.x+r.x*x+u.x*y,p.y+r.y*x+u.y*y,p.z+r.z*x+u.z*y);tuv.push(q/segs,i*td.ds/24)}
    if(i>0&&td.P[(i-1)*3+1]<-12){const a=tn-(segs+1);for(let q=0;q<segs;q++)tidx.push(a+q,a+q+1,tn+q,a+q+1,tn+q+1,tn+q)}tn+=segs+1;
    if(i%6===0){const f=frameAt(td,i*td.ds,mkF());for(let q=0;q<=8;q++){const a=q/8*Math.PI,x=-Math.cos(a)*(HALF+5.4),y=Math.pow(Math.sin(a),.22)*19.4;const rib=new THREE.BoxGeometry(3,1.2,1.2);bt.add(rib,(i/6)%2?MAT.amber:MAT.pylon,basisM(f,x,y))}}}
  if(tun.length){const[c,g]=cv(64,128);g.fillStyle='#161a33';g.fillRect(0,0,64,128);g.fillStyle='#232a52';for(let y=0;y<128;y+=16)g.fillRect(0,y,64,2);{const tm=new THREE.Mesh(geo(tun,tuv,tidx),new THREE.MeshStandardMaterial({map:tex(c),roughness:.5,metalness:.4,side:THREE.DoubleSide}));tm.name='tunTube';ROOT.add(tm)}}
  // trench walls where the road dips below ground
  const tr=[],trIdx=[];let tq=0,wPrev=false;const wDrop=i=>{if(!ATH||td.P[i*3+1]<-1||inGapF(i*td.ds))return false;const px=td.P[i*3],py=td.P[i*3+1],pz=td.P[i*3+2],rx=td.R[i*3],ry=td.R[i*3+1],rz=td.R[i*3+2];for(const sd of[-1,1]){const ex=px+rx*sd*(HALF+2.8),ez=pz+rz*sd*(HALF+2.8);if(athH(ex,ez)<py+ry*sd*(HALF+2.8)-3)return true}return false};for(let i=0;i<N;i++){p.fromArray(td.P,i*3);const wd=p.y>=-1&&wDrop(i);if(p.y>=-1&&!wd){wPrev=false;continue}r.fromArray(td.R,i*3);for(const sd of[-1,1]){const e=p.clone().addScaledVector(r,sd*(HALF+2.8));tr.push(e.x,e.y-1,e.z,e.x,ATH?athH(e.x,e.z)+(wd?-.5:.3):.3,e.z)}if(i>0&&(td.P[(i-1)*3+1]<-1||wPrev)){const a=tq-4;trIdx.push(a,tq,a+1,a+1,tq,tq+1,a+2,tq+2,a+3,a+3,tq+2,tq+3)}tq+=4;wPrev=true}
  if(tr.length){const tm=new THREE.Mesh(geo(tr,null,trIdx),MAT.under);tm.name='tunTrench';ROOT.add(tm)}
  // street lamps and the light pools they cast on the road
  const poolP=[],poolU=[],poolC=[],poolI=[];let pn=0;const cA=new THREE.Color('#ffb46a'),cB=new THREE.Color(ATH?'#ffdcaa':'#22e4ff');
  for(let s=40,k=0;s<td.L;s+=65,k++){const f=frameAt(td,s,mkF());if(f.p.y<-10||inGapF(s)||inGapF(s+30)||inGapF(s-30)||crossAt(f.p,d=>d>4&&d<40))continue;const side=k%2?1:-1,col=k%4<2?cA:cB;lampList.push({p:f.p.clone().addScaledVector(f.r,side*(HALF-4.1)),u:f.u.clone(),c:col.clone()});
    const post=new THREE.CylinderGeometry(.35,.5,17,6);post.translate(0,8.5+4.8,0);bt.add(post,MAT.dark,basisM(f,side*(HALF+1.4),0));
    const arm=new THREE.BoxGeometry(6,.4,.4);arm.translate(-side*3,17+4.8,0);bt.add(arm,MAT.dark,basisM(f,side*(HALF+1.4),0));
    const head=colorize(new THREE.BoxGeometry(3,.5,1.4),col.clone().multiplyScalar(2.2));head.translate(-side*5.5,16.7+4.8,0);bt.add(head,MAT.lampHead||(MAT.lampHead=new THREE.MeshBasicMaterial({vertexColors:true,toneMapped:false})),basisM(f,side*(HALF+1.4),0));
    for(let q=0;q<4;q++){const x=side*(HALF-8)+(q%2?1:-1)*14,dz=(q<2?-1:1)*16;const pp=f.p.clone().addScaledVector(f.r,x).addScaledVector(f.t,dz).addScaledVector(f.u,.08);poolP.push(pp.x,pp.y,pp.z);poolU.push(q%2,q<2?0:1);poolC.push(col.r,col.g,col.b)}
    poolI.push(pn,pn+2,pn+1,pn+1,pn+2,pn+3);pn+=4}
  ROOT.add(new THREE.Mesh(geo(poolP,poolU,poolI,null,poolC),MAT.pool=new THREE.MeshBasicMaterial({map:GLOW,vertexColors:true,transparent:true,opacity:.38,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-2})));
  // gantries with colour light bars
  const gcols=ATH?['#0d5eaf','#ffffff','#0d5eaf','#ffffff','#e2b866']:['#ff2d95','#22e4ff','#ffd12c','#8c55ff','#5dffb0'];let gk=0;MAT.bar=new THREE.MeshBasicMaterial({vertexColors:true,toneMapped:false});
  for(let s=300;s<td.L-100;s+=560){if(inGapF(s)||yAt(td,s)<-8)continue;const f=frameAt(td,s,mkF());if(crossAt(f.p,d=>d>4&&d<45))continue;const M=basisM(f,0,0);
    for(const sd of[-1,1]){const c=new THREE.BoxGeometry(2.2,30,2.2);c.translate(sd*(HALF+4),15,0);bt.add(c,MAT.pylon,M)}
    const bm=new THREE.BoxGeometry(W+10,3,3);bm.translate(0,30,0);bt.add(bm,MAT.pylon,M);
    for(let q=0;q<5;q++){const bar=colorize(new THREE.BoxGeometry(W/6,.9,.6),new THREE.Color(gcols[(gk+q)%5]).multiplyScalar(ATH?1:2.2));bar.translate((q-2)*(W/5.2),28,1.6);bt.add(bar,MAT.bar,M)}gk++}
  // jump edges: hazard stripes, amber beacons, warning gantries
  const hz=new THREE.MeshBasicMaterial({map:hazardTex(),toneMapped:false,polygonOffset:true,polygonOffsetFactor:-2});
  for(const j of td.jumps)for(const[s,dir]of[[j.s0,-1],[j.s1,1]]){const f=frameAt(td,s+dir*5,mkF());const pl2=new THREE.PlaneGeometry(W,8);pl2.rotateX(-Math.PI/2);pl2.translate(0,.09,0);bt.add(pl2,hz,basisM(f,0,0));
    for(const sd of[-1,1]){const b2=new THREE.CylinderGeometry(.9,.9,1.4,10);b2.translate(0,6,0);bt.add(b2,MAT.amber,basisM(f,sd*(HALF+1.2),0))}
    const gf=frameAt(td,s+dir*80,mkF()),gg=new THREE.Group();const sg=new THREE.Mesh(new THREE.PlaneGeometry(W+4,3.6),new THREE.MeshBasicMaterial({map:textTex(ATH?'▲  ΑΛΜΑ · '+j.name+' · JUMP  ▲':'▲  JUMP · '+j.name+' · FULL THROTTLE  ▲','#ffd12c'),side:THREE.DoubleSide,toneMapped:false}));sg.position.y=26;gg.add(sg);placeOnTrack(gg,gf,0);ROOT.add(gg)}
  // start / finish gantry with start lights
  {const f=frameAt(TF,0,mkF());const g=new THREE.Group();placeOnTrack(g,f,0);ROOT.add(g);
   for(const sd of[-1,1]){const c=new THREE.Mesh(new THREE.BoxGeometry(3,34,3),MAT.pylon);c.position.set(sd*(HALF+5),17,0);g.add(c)}
   const bm=new THREE.Mesh(new THREE.BoxGeometry(W+14,7,3),MAT.pylon);bm.position.y=33;g.add(bm);
   const sg=new THREE.Mesh(new THREE.PlaneGeometry(W+10,5.6),new THREE.MeshBasicMaterial({map:textTex((ATH?'ΕΚΚΙΝΗΣΗ · ΤΕΡΜΑ — ':'START · FINISH — ')+TRK.name.toUpperCase(),'#ffd12c',1024,128),side:THREE.DoubleSide,toneMapped:false}));sg.position.set(0,33,1.6);g.add(sg);
   const chk=new THREE.PlaneGeometry(W,4);chk.rotateX(-Math.PI/2);chk.translate(0,.1,0);const[cc,cg]=cv(256,16);for(let x=0;x<32;x++)for(let y=0;y<2;y++){cg.fillStyle=(x+y)%2?'#eee':'#111';cg.fillRect(x*8,y*8,8,8)}g.add(new THREE.Mesh(chk,new THREE.MeshBasicMaterial({map:tex(cc,false),polygonOffset:true,polygonOffsetFactor:-2})));
   startLights=[];for(let i=0;i<5;i++){const l=new THREE.Mesh(new THREE.CircleGeometry(1.3,20),new THREE.MeshBasicMaterial({color:0x220a0e,toneMapped:false,side:THREE.DoubleSide}));l.position.set((i-2)*3.6,27.5,1.7);g.add(l);startLights.push(l)}}
  bt.flush()}
let startLights=[],lampList=[];

function buildGround(){const T=40,pos=[],uv=[],idx=[];let n=0;const X0=-3400*S,X1=2700*S,Z0=-2300*S,Z1=2000*S;
  const pits=TF.jumps.filter(j=>j.kind==='pit');const gapTest=(y,i)=>y<-1||pits.some(gl=>i*TF.ds>=gl.s0-10&&i*TF.ds<=gl.s1+10);
  for(let x=X0;x<X1;x+=T)for(let z=Z0;z<Z1;z+=T){if(z+T>RIVER[0]-6&&z<RIVER[1]+6)continue;if(nearTrack(x+T/2,z+T/2,T*.75+HALF+14,gapTest))continue;
    pos.push(x,0,z,x+T,0,z,x,0,z+T,x+T,0,z+T);uv.push(x/150,z/150,(x+T)/150,z/150,x/150,(z+T)/150,(x+T)/150,(z+T)/150);idx.push(n,n+2,n+1,n+1,n+2,n+3);n+=4}
  const[st,se]=streetTex();ROOT.add(new THREE.Mesh(geo(pos,uv,idx),new THREE.MeshStandardMaterial({map:st,emissiveMap:se,emissive:0xffffff,emissiveIntensity:1.2,roughness:.3,metalness:.45})));
  const deep=new THREE.Mesh(new THREE.PlaneGeometry(9000,9000),new THREE.MeshBasicMaterial({color:0x04030a}));deep.rotation.x=-Math.PI/2;deep.position.y=-40;ROOT.add(deep);
  const emb=new THREE.MeshStandardMaterial({color:0x1a1d38,roughness:.5,metalness:.4});for(const z of RIVER){const w=new THREE.Mesh(new THREE.BoxGeometry(X1-X0,10,3),emb);w.position.set((X0+X1)/2,-5,z+(z===RIVER[0]?-2:2));ROOT.add(w);
    const ln=new THREE.Mesh(new THREE.BoxGeometry(X1-X0,.5,.5),neonMat('#4ceaff',1.8));ln.position.set((X0+X1)/2,.2,z+(z===RIVER[0]?-3.6:3.6));ROOT.add(ln)}
  const wg=new THREE.PlaneGeometry(X1-X0,RIVER[1]-RIVER[0]);
  let water;{water=new Reflector(wg,{clipBias:.003,textureWidth:Math.min(1024,innerWidth/2),textureHeight:Math.min(512,innerHeight/2),color:0x7a78a0});water.rotation.x=-Math.PI/2;water.position.set((X0+X1)/2,-7,(RIVER[0]+RIVER[1])/2);ROOT.add(water);waterRefl=water}
  water=new THREE.Mesh(wg,new THREE.MeshStandardMaterial({color:0x0a1030,roughness:.1,metalness:.9}));water.rotation.x=-Math.PI/2;water.position.set((X0+X1)/2,-7.02,(RIVER[0]+RIVER[1])/2);ROOT.add(water);waterPlain=water;
  const tint=new THREE.Mesh(wg,new THREE.MeshBasicMaterial({color:0x060a22,transparent:true,opacity:.35,depthWrite:false}));tint.rotation.x=-Math.PI/2;tint.position.set(water.position.x,-6.9,water.position.z);ROOT.add(tint);
  trains=[];for(const gl of pits)buildPit(gl,emb)}
function buildPit(gl,emb){const mid=frameAt(TF,(gl.s0+gl.s1)/2,mkF()),pit=new THREE.Group();pit.position.copy(mid.p);pit.position.y=TRK.city?(gl.gy??athH(mid.p.x,mid.p.z)):0;pit.rotation.y=Math.atan2(mid.t.x,mid.t.z);ROOT.add(pit);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(170,260),new THREE.MeshStandardMaterial({color:0x12142a,roughness:.6}));floor.rotation.x=-Math.PI/2;floor.position.y=-14;pit.add(floor);
  for(const sz of[-1,1]){const wl=new THREE.Mesh(new THREE.BoxGeometry(170,14,4),emb);wl.position.set(0,-7,sz*130);pit.add(wl)}
  if(gl.style==='autobahn'){// six lanes crossing under the gap, headlights one way, tail lights the other
    const dash=neonMat('#e8f0ff',1.2),edge=neonMat('#ffb46a',1.4),body=new THREE.MeshStandardMaterial({color:0x2a3048,roughness:.3,metalness:.7}),hl=neonMat('#fff4d8',3),tl=neonMat('#ff2030',3);
    for(const e of[-26,26]){const m=new THREE.Mesh(new THREE.BoxGeometry(170,.2,.5),edge);m.position.set(0,-13.8,e);pit.add(m)}
    for(let k=-2;k<=2;k++)for(let x=-80;x<80;x+=12){const m=new THREE.Mesh(new THREE.BoxGeometry(5,.15,.3),dash);m.position.set(x,-13.85,k*8.5+(k<0?-2:k>0?2:0));if(k!==0)pit.add(m)}
    const med=new THREE.Mesh(new THREE.BoxGeometry(170,1.2,1.2),new THREE.MeshStandardMaterial({color:0x3a3f58,roughness:.5}));med.position.set(0,-13.4,0);pit.add(med);
    for(let l=0;l<6;l++){const z=(l<3?-1:1)*(4+(l%3)*8),dir=l<3?1:-1,g=new THREE.Group();
      for(let c=0;c<3;c++){const car=new THREE.Group();const b=new THREE.Mesh(new THREE.BoxGeometry(4.6,1.5,2.1),body);car.add(b);
        for(const sz of[-.7,.7]){const f=new THREE.Mesh(new THREE.BoxGeometry(.1,.35,.5),hl);f.position.set(dir*2.32,0,sz);car.add(f);const r=new THREE.Mesh(new THREE.BoxGeometry(.1,.35,.5),tl);r.position.set(-dir*2.32,0,sz);car.add(r)}
        car.position.set(c*rr(28,44),-13,z);g.add(car)}
      pit.add(g);trains.push({g,p:rr(-80,80),v:dir*rr(32,46),ax:'x',lim:110})}}
  else{const railM=neonMat('#8a86c8',1.1);for(let k=-3;k<=3;k++)for(const o of[-.75,.75]){const rl=new THREE.Mesh(new THREE.BoxGeometry(.2,.2,260),railM);rl.position.set(k*18+o,-13.8,0);pit.add(rl)}
    const tm=new THREE.MeshStandardMaterial({color:0xd8dcef,roughness:.3,metalness:.6}),tw=neonMat('#ffe6b0',1.6);
    for(let k=0;k<3;k++){const tg=new THREE.Group();for(let c=0;c<6;c++){const car=new THREE.Mesh(new THREE.BoxGeometry(3.4,4.2,24),tm);car.position.set(0,-11.6,c*25.5);tg.add(car);for(const sd of[-1,1]){const w2=new THREE.Mesh(new THREE.BoxGeometry(.1,1,20),tw);w2.position.set(sd*1.72,-11,c*25.5);tg.add(w2)}}
      tg.position.x=(k*2-2)*18;pit.add(tg);trains.push({g:tg,p:rr(-300,300),v:(k%2?1:-1)*rr(30,45),ax:'z',lim:320})}}}
let trains=[],waterRefl=null,waterPlain=null;

const LANDMARKS=[];const searchSpots=[];let beacons,hammerArm,euroSprite;
const FACADE=facadeTex(),WINS=[windowTex(1,['#ffcf7a','#ffb35a','#ffe6b0']),windowTex(2,['#9fe8ff','#c8f4ff','#ffcf7a']),windowTex(3,['#ff8ad0','#b98aff','#9fe8ff','#ffcf7a'])];
// windows show real rooms: a ray from the facade into a 3.4 m room grid picks the wall, floor or ceiling it hits
const INTU={value:1};
const INT_FS=`#ifdef USE_EMISSIVEMAP
  vec4 emT=texture2D(emissiveMap,vEmissiveMapUv);float lit=dot(emT.rgb,vec3(.3,.5,.2));
  vec3 wn=inverseTransformDirection(normal,viewMatrix);
  if(uInt>.5&&abs(wn.y)<.5&&lit>.02){
    vec3 V=normalize(vWP-cameraPosition);vec3 rs=vec3(3.4,3.3,3.4);
    vec3 p=(vWP-wn*.05)/rs;vec3 cell=floor(p);vec3 f=clamp(p-cell,0.001,.999);vec3 d=V/rs;d=mix(vec3(1e-4),d,step(vec3(1e-4),abs(d)));
    vec3 tt=(step(vec3(0.),d)-f)/d;float tm=max(min(min(tt.x,tt.y),tt.z),0.);vec3 h=clamp(f+d*tm,0.,1.);
    float hs=fract(sin(dot(cell,vec3(12.9898,78.233,37.719)))*43758.5453);
    vec3 rc=hs<.55?vec3(1.,.74,.45):hs<.85?vec3(.6,.82,1.):vec3(1.,.5,.85);
    float onY=step(tt.y,min(tt.x,tt.z)+1e-4);
    float wall=(1.-onY)*(.3+.7*h.y);float flr=onY*(d.y<0.?.16:1.25);
    float back=clamp(1.-tm*.85,.35,1.);
    vec3 room=rc*(wall+flr)*back+rc*.9*smoothstep(.86,.97,h.y)*(1.-onY);
    totalEmissiveRadiance*=room*lit*1.55;
  } else totalEmissiveRadiance*=emT.rgb;
#endif`;
function interiorPatch(sh){sh.uniforms.uInt=INTU;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;').replace('#include <begin_vertex>','#include <begin_vertex>\nvWP=(modelMatrix*vec4(transformed,1.)).xyz;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;uniform float uInt;').replace('#include <emissivemap_fragment>',INT_FS)}
const withInterior=m=>{m.onBeforeCompile=interiorPatch;m.customProgramCacheKey=()=>'interior1';return m};
const GLASS=WINS.map(w=>new THREE.MeshStandardMaterial({map:FACADE,color:0x4c4c66,emissive:0xffffff,emissiveMap:w,emissiveIntensity:1.0,roughness:.26,metalness:.6}));GLASS.forEach(withInterior);
function glassMat(v,rx,ry){const m=withInterior(GLASS[v].clone());m.map=FACADE.clone();m.emissiveMap=WINS[v].clone();for(const t of[m.map,m.emissiveMap]){t.repeat.set(rx*.625,ry*.5);t.needsUpdate=true}return m}
let CITY=[];
function buildCity(){CITY=[];const bt=new Batch(),NEON=['#ff2d95','#22e4ff','#8c55ff','#ffd12c','#5dffb0'].map(c=>new THREE.Color(c).multiplyScalar(1.6));MAT.neonV=new THREE.MeshBasicMaterial({vertexColors:true,toneMapped:false});
  const roofs=[],signsBy=new Map(),cbd=V3(-560*S,0,-560*S);MAT.roof=new THREE.MeshStandardMaterial({color:0x0c0e1e,roughness:.6,metalness:.4});
  const boxUV=(g,w,h,d)=>{const uv=g.attributes.uv,pos=g.attributes.position,nm=g.attributes.normal;for(let i=0;i<uv.count;i++){const nx=Math.abs(nm.getX(i)),nz=Math.abs(nm.getZ(i)),ny=Math.abs(nm.getY(i));if(ny>.5){uv.setXY(i,.001,.001);continue}const along=nx>.5?d:w;uv.setXY(i,uv.getX(i)*along/24,uv.getY(i)*h/60)}};
  for(let gx=-3300*S;gx<2650*S;gx+=46)for(let gz=-2250*S;gz<1950*S;gz+=46){
    const x=gx+rr(-9,9),z=gz+rr(-9,9),w=rr(16,32),d=rr(16,32);
    if(z+d>RIVER[0]-14&&z-d<RIVER[1]+14)continue;const dt=nearestTrackDist(x,z,260);if(dt<Math.hypot(w,d)/2+HALF+14)continue;
    if(LANDMARKS.some(l=>(l.x-x)**2+(l.z-z)**2<(l.r+Math.hypot(w,d)/2)**2))continue;
    if(TRK.clear.some(([x0,z0,x1,z1])=>x>x0*S-20&&x<x1*S+20&&z>z0*S-20&&z<z1*S+20))continue;
    const dc=Math.hypot(x-cbd.x,z-cbd.z);let h=z>RIVER[1]?rr(10,30):rr(18,50)+260*Math.exp(-((dc/430)**2))*(.35+.65*R())+(R()<.08?rr(50,140):0);if(dt<120)h*=1.2;
    CITY.push({x,z,hw:w/2,hd:d/2,h});const v=Math.floor(R()*3),cyl=h>70&&R()<.28;
    if(cyl){const rad=Math.min(w,d)/2;const g=new THREE.CylinderGeometry(rad,rad,h,24,1,true);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*2*Math.PI*rad/24,uv.getY(i)*h/60);g.translate(x,h/2,z);bt.add(g,GLASS[v]);
      const cap=new THREE.CircleGeometry(rad,24);cap.rotateX(-Math.PI/2);cap.translate(x,h,z);bt.add(cap,MAT.roof);
      const nc=NEON[Math.floor(R()*5)];for(let y=h*.2;y<h;y+=rr(24,50)){const ring=colorize(new THREE.CylinderGeometry(rad+.35,rad+.35,1.1,24,1,true),nc);ring.translate(x,y,z);bt.add(ring,MAT.neonV)}}
    else{const g=new THREE.BoxGeometry(w,h,d);boxUV(g,w,h,d);g.translate(x,h/2,z);bt.add(g,GLASS[v]);
      if(h>40&&R()<.55){const nc=NEON[Math.floor(R()*5)];for(const[sx,sz]of[[-1,-1],[1,-1],[-1,1],[1,1]]){if(R()<.35)continue;const s2=colorize(new THREE.BoxGeometry(.7,h,.7),nc);s2.translate(x+sx*w/2,h/2,z+sz*d/2);bt.add(s2,MAT.neonV)}
        for(const[bw,bd,ox,oz]of[[w,.6,0,d/2],[w,.6,0,-d/2],[.6,d,w/2,0],[.6,d,-w/2,0]]){const rim=colorize(new THREE.BoxGeometry(bw+.6,.7,bd+.1),nc);rim.translate(x+ox,h,z+oz);bt.add(rim,MAT.neonV)}}}
    if(h>80){const mast=new THREE.CylinderGeometry(.3,.5,h*.12,5);mast.translate(x,h+h*.06,z);bt.add(mast,MAT.roof);roofs.push(x,h+h*.12,z);if(h>150&&searchSpots.length<12&&R()<.35)searchSpots.push([x,h,z])}
    // vertical neon sign on the face that looks at the road
    if(!cyl&&dt<150&&h>35&&R()<.45){const txt=VSIGNS[Math.floor(R()*VSIGNS.length)],col=['#ff2d95','#22e4ff','#ffd12c','#8c55ff','#5dffb0'][Math.floor(R()*5)];const key=txt+col;
      if(!signsBy.has(key))signsBy.set(key,new THREE.MeshBasicMaterial({map:vSignTex(txt,col),toneMapped:false,color:new THREE.Color(1.6,1.6,1.6)}));
      let bi=0,bdx=1e9;const faces=[[0,d/2+.4,0],[0,-d/2-.4,Math.PI],[w/2+.4,0,Math.PI/2],[-w/2-.4,0,-Math.PI/2]];faces.forEach(([fx,fz],k)=>{const dd2=nearestTrackDist(x+fx*4,z+fz*4,300);if(dd2<bdx){bdx=dd2;bi=k}});
      const[fx,fz,ry]=faces[bi];const sw=Math.min(6,(bi<2?w:d)*.3),shh=sw*4;const pg=new THREE.PlaneGeometry(sw,shh);pg.rotateY(ry);pg.translate(x+fx,Math.min(h-shh/2-2,rr(20,50)),z+fz);bt.add(pg,signsBy.get(key))}}
  bt.flush();
  const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(roofs,3));
  beacons=new THREE.Points(rg,new THREE.PointsMaterial({color:glowCol('#ff3030',2.5),size:6,map:GLOW,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));ROOT.add(beacons)}
function lmAt(x,z,r){x*=S;z*=S;LANDMARKS.push({x,z,r});const g=new THREE.Group();g.position.set(x,0,z);ROOT.add(g);return g}
function beacon(g,x,y,z,s=12){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:glowCol('#ff3030',3),blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));sp.position.set(x,y,z);sp.scale.set(s,s,1);g.add(sp)}
function edges(g,geo2,col,y=0){const l=new THREE.LineSegments(new THREE.EdgesGeometry(geo2),new THREE.LineBasicMaterial({color:glowCol(col,2),toneMapped:false}));l.position.y=y;g.add(l);return l}
function buildLandmarks(){const dark=MAT.roof||(MAT.roof=new THREE.MeshStandardMaterial({color:0x0c0e1e,roughness:.6,metalness:.4}));
  // Main Tower
  let g=lmAt(-760,-470,40);let geo2=new THREE.CylinderGeometry(20,20,200,32,1,true);let m=new THREE.Mesh(geo2,glassMat(1,8,6.6));m.position.y=100;g.add(m);
  m=new THREE.Mesh(new THREE.BoxGeometry(30,165,26),glassMat(0,2,5.5));m.position.set(-20,82,6);g.add(m);
  for(const y of[60,120,197]){const ring=new THREE.Mesh(new THREE.CylinderGeometry(20.6,20.6,1.2,32,1,true),neonMat('#22e4ff',2));ring.position.y=y;g.add(ring)}
  m=new THREE.Mesh(new THREE.CylinderGeometry(.6,.9,52,6),dark);m.position.y=226;g.add(m);beacon(g,0,252,0,20);searchSpots.push([-760*S,200,-470*S]);
  // Commerzbank Tower
  g=lmAt(-440,-720,45);geo2=new THREE.CylinderGeometry(34,36,250,3);m=new THREE.Mesh(geo2,glassMat(0,7,8));m.position.y=125;g.add(m);edges(g,geo2,'#ffd12c',125);
  for(let i=0;i<3;i++){m=new THREE.Mesh(new THREE.CylinderGeometry(30-i*7,33-i*7,10,3),neonMat('#ffd12c',1.8));m.position.y=252+i*11;g.add(m)}
  m=new THREE.Mesh(new THREE.CylinderGeometry(.7,1,48,6),dark);m.position.y=306;g.add(m);beacon(g,0,330,0,20);searchSpots.push([-440*S,285,-720*S]);
  g=lmAt(-820,-760,30);geo2=new THREE.BoxGeometry(34,175,24);m=new THREE.Mesh(geo2,glassMat(1,2.3,5.8));m.position.y=87;g.add(m);edges(g,geo2,'#8c55ff',87);
  // EZB twin towers with the floating euro
  g=lmAt(1920,-140,70);for(const sd of[-1,1]){geo2=new THREE.BoxGeometry(24,185,54);m=new THREE.Mesh(geo2,glassMat(1,3.6,6.2));m.position.set(sd*20,92,0);m.rotation.z=sd*.06;m.rotation.y=sd*.05;g.add(m);const e=edges(g,geo2,'#5dffb0',92);e.position.x=sd*20;e.rotation.copy(m.rotation)}
  for(let i=0;i<4;i++){m=new THREE.Mesh(new THREE.BoxGeometry(18,3,30),neonMat('#5dffb0',1.8));m.position.set(0,40+i*38,0);g.add(m)}
  {const[c,gg]=cv(256,256);gg.font='italic 900 220px system-ui';gg.textAlign='center';gg.textBaseline='middle';gg.shadowColor='#5dffb0';gg.shadowBlur=20;gg.fillStyle='#5dffb0';gg.fillText('€',128,140);
   euroSprite=new THREE.Mesh(new THREE.PlaneGeometry(60,60),new THREE.MeshBasicMaterial({map:tex(c,false),transparent:true,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false,color:new THREE.Color(2,2,2)}));euroSprite.position.y=250;g.add(euroSprite)}searchSpots.push([1920*S,190,-140*S]);
  // Messeturm
  g=lmAt(-1760,-760,40);geo2=new THREE.BoxGeometry(40,215,40);m=new THREE.Mesh(geo2,glassMat(0,2.7,7.2));m.position.y=107;g.add(m);
  geo2=new THREE.ConeGeometry(29,42,4);m=new THREE.Mesh(geo2,new THREE.MeshStandardMaterial({color:0x2a1016,emissive:0x3a0808,roughness:.3,metalness:.6}));m.rotation.y=Math.PI/4;m.position.y=236;g.add(m);const e2=edges(g,geo2,'#ff3b55',236);e2.rotation.y=Math.PI/4;beacon(g,0,262,0,22);searchSpots.push([-1760*S,215,-760*S]);
  // Hammering Man
  g=lmAt(-1470,-600,14);const blk=new THREE.MeshStandardMaterial({color:0x0a0708,roughness:.5,metalness:.3});g.scale.setScalar(1.25);
  m=new THREE.Mesh(new THREE.BoxGeometry(5,20,3),blk);m.position.y=10;m.rotation.z=.08;g.add(m);m=new THREE.Mesh(new THREE.SphereGeometry(2.4,10,8),blk);m.position.set(-.8,22,0);g.add(m);
  hammerArm=new THREE.Group();hammerArm.position.set(1,17,0);g.add(hammerArm);m=new THREE.Mesh(new THREE.BoxGeometry(1.4,1.4,12),blk);m.position.z=6;hammerArm.add(m);m=new THREE.Mesh(new THREE.BoxGeometry(2.6,4,2.6),blk);m.position.set(0,-1.5,12);hammerArm.add(m);hammerArm.rotation.y=-Math.PI/2;
  // Festhalle
  g=lmAt(-2290,120,70);m=new THREE.Mesh(new THREE.SphereGeometry(62,40,16,0,Math.PI*2,0,Math.PI/2),new THREE.MeshStandardMaterial({color:0x1c2044,roughness:.15,metalness:.85}));g.add(m);
  m=new THREE.Mesh(new THREE.SphereGeometry(62.6,24,8,0,Math.PI*2,0,Math.PI/2),new THREE.MeshBasicMaterial({color:glowCol('#22e4ff',1.2),wireframe:true,toneMapped:false}));g.add(m);
  // Europaturm
  g=lmAt(-2500,-1850,24);m=new THREE.Mesh(new THREE.CylinderGeometry(5,8,230,16),new THREE.MeshStandardMaterial({color:0x2a2e4c,roughness:.4,metalness:.5}));m.position.y=115;g.add(m);
  m=new THREE.Mesh(new THREE.CylinderGeometry(22,16,14,24),glassMat(1,6,.5));m.position.y=196;g.add(m);const rr2=new THREE.Mesh(new THREE.CylinderGeometry(22.4,22.4,1,24,1,true),neonMat('#ff2d95',2));rr2.position.y=203;g.add(rr2);
  m=new THREE.Mesh(new THREE.CylinderGeometry(1,1.5,90,6),dark);m.position.y=270;g.add(m);beacon(g,0,316,0,22);
  // Kaiserdom
  g=lmAt(60,330,24);const sand=new THREE.MeshStandardMaterial({color:0x6a3a32,emissive:0x2a100a,roughness:.7});m=new THREE.Mesh(new THREE.BoxGeometry(20,64,20),sand);m.position.y=32;g.add(m);
  m=new THREE.Mesh(new THREE.CylinderGeometry(9,11,16,8),sand);m.position.y=72;g.add(m);m=new THREE.Mesh(new THREE.ConeGeometry(9,30,8),new THREE.MeshStandardMaterial({color:0x2f4a44,roughness:.4,metalness:.5}));m.position.y=95;g.add(m);
  const fl=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:0xffa050,blending:THREE.AdditiveBlending,depthWrite:false,opacity:.4}));fl.scale.set(50,90,1);fl.position.y=40;g.add(fl);
  // Römer
  g=lmAt(-170,275,34);const gable=new THREE.Shape();gable.moveTo(-8,0);gable.lineTo(-8,14);for(let s2=0;s2<4;s2++){gable.lineTo(-8+s2*2,14+s2*3);gable.lineTo(-6+s2*2,14+s2*3)}gable.lineTo(0,27);for(let s2=3;s2>=0;s2--){gable.lineTo(6-s2*2,14+s2*3);gable.lineTo(8-s2*2,14+s2*3)}gable.lineTo(8,0);
  for(let i=-1;i<=1;i++){const eg2=new THREE.ExtrudeGeometry(gable,{depth:14,bevelEnabled:false});m=new THREE.Mesh(eg2,new THREE.MeshStandardMaterial({color:[0x7a4a3a,0x5a3a4a,0x6a5a3a][i+1],emissive:0x301808,roughness:.7}));m.position.set(i*16.5,0,-7);g.add(m);edges(g,eg2,'#ffb46a').position.set(i*16.5,0,-7)}
  // Alte Oper
  g=lmAt(-1000,-900,40);m=new THREE.Mesh(new THREE.BoxGeometry(70,26,40),new THREE.MeshStandardMaterial({color:0x8a7a66,emissive:0x2a1e10,roughness:.7}));m.position.y=13;g.add(m)}

let rain,searchlights=[],billboards=[],traffic3d,speedLines;
function buildDressing(){const bt=new Batch();
  // sponsor billboards on legs beside the track
  let bi=0;for(let s=240;s<TF.L-100;s+=rr(260,420)){const f=frameAt(TF,s,mkF());if(f.p.y<-1||inGapF(s)||(f.p.z>RIVER[0]-30&&f.p.z<RIVER[1]+30))continue;const side=bi%2?1:-1,br=BRANDS[bi%BRANDS.length];bi++;
    const off=HALF+rr(22,40),base=f.p.clone().addScaledVector(f.r,side*off);base.y=Math.max(f.p.y,0);const g=new THREE.Group();g.position.copy(base);const look=f.p.clone().addScaledVector(f.t,60);look.y=base.y;g.lookAt(look);ROOT.add(g);
    const bw=29,bh=14.5,y0=Math.max(18,f.p.y-base.y+14);for(const sx of[-.35,.35]){const leg=new THREE.Mesh(new THREE.BoxGeometry(1,y0,1),MAT.dark);leg.position.set(sx*bw,y0/2,-.8);g.add(leg)}
    const frame=new THREE.Mesh(new THREE.BoxGeometry(bw+1.4,bh+1.4,1),MAT.dark);frame.position.set(0,y0+bh/2,-.7);g.add(frame);
    const face=new THREE.Mesh(new THREE.PlaneGeometry(bw,bh),new THREE.MeshBasicMaterial({map:billboardTex(br),toneMapped:false,color:new THREE.Color(1.25,1.25,1.25)}));face.position.set(0,y0+bh/2,-.15);g.add(face);billboards.push(face);
    const top=new THREE.Mesh(new THREE.BoxGeometry(bw+1.4,.5,.6),neonMat(br[3],2));top.position.set(0,y0+bh+.9,-.2);g.add(top)}
  // U-Bahn portals
  for(let i=1;i<TF.N;i++){const y0=TF.P[(i-1)*3+1],y1=TF.P[i*3+1];if((y0>=-12)!==(y1>=-12)){const fr=frameAt(TF,i*TF.ds,mkF());const g=new THREE.Group();
    const top=new THREE.Mesh(new THREE.BoxGeometry(W+14,5,4),MAT.pylon);top.position.y=21;g.add(top);const trim=new THREE.Mesh(new THREE.BoxGeometry(W+14,.5,4.2),MAT.amber);trim.position.y=18.6;g.add(trim);
    const s2=new THREE.Mesh(new THREE.PlaneGeometry(18,3.6),new THREE.MeshBasicMaterial({map:textTex(TRK.tunnel||'U-BAHN','#4ceaff',512,96),side:THREE.DoubleSide,toneMapped:false}));s2.position.set(0,21,2.1);g.add(s2);placeOnTrack(g,fr,0);ROOT.add(g)}}
  // searchlights sweeping the clouds
  {const[c,g]=cv(8,256);const gr=g.createLinearGradient(0,256,0,0);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,8,256);const ct=tex(c,false);
   for(const[x,y,z]of searchSpots.slice(0,10)){const cm=new THREE.Mesh(new THREE.CylinderGeometry(34,3,1600,20,1,true),new THREE.MeshBasicMaterial({map:ct,color:glowCol(['#bfe8ff','#ff9ad6','#ffffff'][searchlights.length%3],1),transparent:true,opacity:.07,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,toneMapped:false}));
    cm.geometry.translate(0,800,0);const pv=new THREE.Group();pv.position.set(x,y,z);pv.add(cm);ROOT.add(pv);searchlights.push({g:pv,ph:R()*6,sp:rr(.15,.35),tilt:rr(.25,.5)})}}
  bt.flush()}
function buildAmbient(){
  // high sky traffic: instanced hover-cars on straight skyways
  {const n=160,box=new THREE.BoxGeometry(3,1.2,6);const im=new THREE.InstancedMesh(box,new THREE.MeshStandardMaterial({color:0x222844,roughness:.3,metalness:.7}),n);const gl=new THREE.InstancedMesh(new THREE.BoxGeometry(3.1,.3,6.1),new THREE.MeshBasicMaterial({color:0xffffff,toneMapped:false}),n);
   const c=new THREE.Color();traffic3d={n,im,gl,lanes:[]};for(let i=0;i<n;i++){const lane={x:rr(-2000,1600),z:rr(-1400,1200),y:rr(70,190),a:R()*Math.PI*2,v:rr(25,55)*(R()<.5?1:-1),t:R()*3600};traffic3d.lanes.push(lane);gl.setColorAt(i,c.set(['#ff2d95','#22e4ff','#ffd12c','#ffffff'][i%4]).multiplyScalar(2))}
   im.frustumCulled=gl.frustumCulled=false;scene.add(im,gl)}
  // rain: fine falling points around the camera
  {const n=2400,p=new Float32Array(n*6);for(let i=0;i<n;i++){const x=rr(-160,160),y=rr(-60,120),z=rr(-160,160);p.set([x,y,z,x+.3,y+3.2,z],i*6)}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));
   rain=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0x8fa6e8,transparent:true,opacity:.22,depthWrite:false}));rain.frustumCulled=false;scene.add(rain)}
  // speed streaks near the camera
  {const sl=120,slp=new Float32Array(sl*6);speedLines={n:sl,d:[]};for(let i=0;i<sl;i++){const a=R()*Math.PI*2,rad=rr(4,11);speedLines.d.push({x:Math.cos(a)*rad,y:Math.sin(a)*rad*.6,z:-rr(5,90),len:rr(3,9)})}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(slp,3));speedLines.mesh=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0xcfe8ff,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));speedLines.mesh.frustumCulled=false;camera.add(speedLines.mesh)}
}

/* ---- per-track set pieces ---- */
let planes=[],gates=[];
function inClear(kind){return TRK.clear.find(c=>c[4]===kind)}
let WFUN=null;const WAVEJ={id:'wave',g:26,floor:-99,kind:'wave'};
function buildWaterFun(){WFUN=null;const td=TF,L=td.L;let ws=[],dsl=[];for(let s=0;s<L;s+=4){if(isWater(td,s))ws.push(s);else if(isDirt(td,s))dsl.push(s)}if(ws.length<30&&dsl.length<30)return;
  const F=mkF(),grp=new THREE.Group();ROOT.add(grp);const W={waves:[],objs:[],grp};WFUN=W;
  if(dsl.length>=30)buildDirt(W,dsl[0],dsl[dsl.length-1],F);if(ws.length<30)return;const s0=ws[0],s1=ws[ws.length-1];
  const waveMat=new THREE.MeshStandardMaterial({color:0x2a74d8,emissive:new THREE.Color('#4ceaff'),emissiveIntensity:.45,roughness:.15,metalness:.4,transparent:true,opacity:.88});
  const waveGeo=new THREE.CylinderGeometry(1.7,1.7,HALF*2+3,20,1,true,0,Math.PI);waveGeo.rotateZ(Math.PI/2);
  const foam=new THREE.MeshBasicMaterial({color:new THREE.Color(2,2.2,2.4)}),foamGeo=new THREE.BoxGeometry(HALF*2+3,.25,.5);
  const ringMat=neonMat('#ffd12c',2.6),ringGeo=new THREE.TorusGeometry(3.4,.36,8,28);
  const BR=['#e3242b','#ffcd03','#006cb7','#00af4d','#ff7a1c'],brickGeo=new THREE.BoxGeometry(2.6,1.5,2.6),studGeo=new THREE.CylinderGeometry(.42,.42,.4,12),brickMats=BR.map(c=>new THREE.MeshStandardMaterial({color:c,roughness:.28,metalness:.05}));
  const place=(o,s,x,y)=>{frameAt(td,s,F);o.position.copy(F.p).addScaledVector(F.r,x).addScaledVector(F.u,y);o.quaternion.setFromRotationMatrix(_m4.makeBasis(F.r,F.u,F.t.clone().negate()));grp.add(o);return o};
  let k=0;for(let s=s0+70;s<s1-60;s+=58,k++){
    if(k%3===0){const w=new THREE.Group();w.add(new THREE.Mesh(waveGeo,waveMat));const fm=new THREE.Mesh(foamGeo,foam);fm.position.y=1.7;w.add(fm);place(w,s,0,0);W.waves.push(s)}
    else if(k%3===1){for(const x of[-9,0,9]){if(R()<.35)continue;const r=new THREE.Mesh(ringGeo,ringMat);place(r,s,x+rr(-2,2),3.3);W.objs.push({kind:'ring',s,x:r.position?x:0,m:r,alive:true,t:0})}}
    else{for(let i=0;i<4;i++){const x=rr(-12,12),g=new THREE.Group(),mat=brickMats[Math.floor(R()*BR.length)];g.add(new THREE.Mesh(brickGeo,mat));for(const a of[-.6,.6])for(const b of[-.6,.6]){const st=new THREE.Mesh(studGeo,mat);st.position.set(a,.95,b);g.add(st)}place(g,s+rr(-6,6),x,.75);W.objs.push({kind:'brick',s:s,x,m:g,alive:true,t:0,col:mat.color})}}}
  // floating lane buoys
  const by=[];for(let s=s0;s<s1;s+=11)for(const sd of[-1,1])by.push([s,sd*(HALF+.6)]);const bm=new THREE.InstancedMesh(new THREE.CylinderGeometry(.55,.55,1.4,10),new THREE.MeshStandardMaterial({color:0xff5a1c,emissive:new THREE.Color('#ff7a2a'),emissiveIntensity:.8,roughness:.4}),by.length);
  by.forEach(([s,x],i)=>{frameAt(td,s,F);_m4.makeTranslation(F.p.x+F.r.x*x,F.p.y+.3,F.p.z+F.r.z*x);bm.setMatrixAt(i,_m4)});grp.add(bm);
  W.s0=s0;W.s1=s1}
const _m4=new THREE.Matrix4();
function dirtTex(){const Z=256,[c,g]=cv(Z,Z),r=mul(7);g.fillStyle='#6e4a2a';g.fillRect(0,0,Z,Z);for(let i=0;i<2600;i++){const v=r();g.fillStyle=v<.5?`rgba(40,24,12,${.15+r()*.3})`:`rgba(190,140,90,${.08+r()*.2})`;g.fillRect(r()*Z,r()*Z,1+r()*3,1+r()*3)}
  g.strokeStyle='rgba(30,18,8,.45)';g.lineWidth=9;for(const x of[70,96,160,186]){g.beginPath();g.moveTo(x,0);for(let y=0;y<=Z;y+=32)g.lineTo(x+Math.sin(y*.05+x)*5,y);g.stroke()}return tex(c)}
function buildDirt(W,s0,s1,F){const td=TF,grp=W.grp;
  const pos=[],uv=[],idx=[],nrm=[];let n=0;for(let s=s0-6;s<=s1+6;s+=2,n++){frameAt(td,s,F);for(const sx of[-1,1]){pos.push(F.p.x+F.r.x*(HALF+1.5)*sx,F.p.y+.02,F.p.z+F.r.z*(HALF+1.5)*sx);uv.push(sx<0?0:2,s/12);nrm.push(0,1,0)}if(n>0){const a=(n-1)*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}}
  const dm=new THREE.MeshStandardMaterial({map:dirtTex(),roughness:.95,metalness:0,color:0xf0c89a,emissive:new THREE.Color('#5a3418'),emissiveIntensity:.35});grp.add(new THREE.Mesh(geo(pos,uv,idx,nrm),dm));
  const pst=[];for(let s=s0;s<s1;s+=7)for(const sd of[-1,1])pst.push([s,sd*(HALF+1.2)]);const pm=new THREE.InstancedMesh(new THREE.BoxGeometry(.35,1.6,.35),new THREE.MeshStandardMaterial({color:0xffcd03,emissive:new THREE.Color('#ff9a1c'),emissiveIntensity:.35,roughness:.6}),pst.length);
  pst.forEach(([s,x],i)=>{frameAt(td,s,F);_m4.makeTranslation(F.p.x+F.r.x*x,F.p.y+.8,F.p.z+F.r.z*x);pm.setMatrixAt(i,_m4)});grp.add(pm);
  const tape=new THREE.MeshBasicMaterial({color:new THREE.Color(2,.4,.3)});for(const sd of[-1,1]){const tp=sweep(td,[[sd*(HALF+1.2),1.3],[sd*(HALF+1.2),1.45]],[0,1],8,false);const ii=tp.index.array,keep=[];for(let q=0;q<ii.length;q+=6){const s=Math.floor(ii[q]/2)*td.ds;if(isDirt(td,s))keep.push(...ii.slice(q,q+6))}tp.setIndex(keep);grp.add(new THREE.Mesh(tp,tape))}
  const humpGeo=new THREE.CylinderGeometry(1.5,1.5,HALF*2+3,16,1,true,0,Math.PI).rotateZ(Math.PI/2),humpMat=new THREE.MeshStandardMaterial({map:dirtTex(),color:0xb08460,roughness:.95});
  const mudGeo=new THREE.CircleGeometry(1,20).rotateX(-Math.PI/2),mudMat=new THREE.MeshStandardMaterial({color:0x2a1a0e,roughness:.15,metalness:.2});
  const rockGeo=new THREE.DodecahedronGeometry(1.2),rockMat=new THREE.MeshStandardMaterial({color:0x8a7a6a,roughness:.9});
  let k=0;for(let s=s0+40;s<s1-30;s+=46,k++){const place=(o,ss,x,y)=>{frameAt(td,ss,F);o.position.copy(F.p).addScaledVector(F.r,x);o.position.y+=y;o.quaternion.setFromRotationMatrix(_m4.makeBasis(F.r,F.u,F.t.clone().negate()));grp.add(o);return o};
    if(k%2===0){place(new THREE.Mesh(humpGeo,humpMat),s,0,0);W.waves.push(s)}
    else{const mx=rr(-9,9),mr=rr(3.5,5.5),md=new THREE.Mesh(mudGeo,mudMat);md.scale.set(mr,1,mr*1.6);place(md,s,mx,.05);W.objs.push({kind:'mud',s,x:mx,r:mr,m:md,alive:true,t:0});
      for(let i=0;i<2;i++){const x=rr(-12,12);if(Math.abs(x-mx)<mr+2)continue;const rk=new THREE.Mesh(rockGeo,rockMat);rk.rotation.set(R()*3,R()*3,0);place(rk,s+rr(-12,12),x,.7);W.objs.push({kind:'brick',s:s,x,m:rk,alive:true,t:0,col:new THREE.Color('#8a7a6a')})}}}}
function wPos(s){return TD.rev?TD.L-s:s}
function waterStep(s){if(!s.isPlayer)sigTick(s);athHazStep(s);if(!WFUN||s.dead>0)return;const ter=isWater(TD,s.dist)?'water':isDirt(TD,s.dist)?'dirt':'road';
  if(ter!==(s.terrain||'road')){s.terrain=ter;s.boatMode=ter==='water';s.dirtMode=ter==='dirt';const at=s.mesh.position.clone();if(s.isPlayer||near(s)){if(ter==='water')burst(WATER,at,70,22,.9,new THREE.Color(.8,1.3,2.2));else burst(SPARK,at,40,16,.5,new THREE.Color(2,1.6,.8));if(s.isPlayer){AU.sfx(ter==='water'?'splash':'land');say('',ter==='water'?'BOAT MODE':ter==='dirt'?'OFF-ROAD MODE':'HOVER MODE',.8);award(s,'TRANSFORM',6,150,'#4ceaff')}}}
  if(ter==='road')return;const m=mod(s.dist,TD.L),pm=s.wPrev??m;s.wPrev=m;
  if(!s.air)for(const w0 of WFUN.waves){const w=wPos(w0);if(pm<w&&m>=w&&s.v>20){s.air={y:yAt(TD,s.dist)+1.4,vy:4+s.v*.085,j:WAVEJ,t:0,fall:false,cleared:true};frameAt(TD,s.dist,F2);s.air.off=F2.p.y+F2.r.y*s.x-s.air.y;if(s.isPlayer){burst(WATER,s.mesh.position.clone(),40,20,.8,new THREE.Color(.9,1.4,2.3));award(s,s.dirtMode?'BUMP JUMP':'WAVE JUMP',8,250,'#4ceaff');AU.sfx('launch')}break}}
  for(const o of WFUN.objs){if(!o.alive){continue}const os=wPos(o.s),ox=TD.rev?-o.x:o.x;
    if(o.kind==='mud'){if(!s.air&&Math.abs(tdd(os,s.dist))<o.r*1.6&&Math.abs(ox-s.x)<o.r){s.v*=1-1.1*H;if(s.isPlayer&&!s.mudT){s.mudT=1;feed('MUD!',0,'#c08040')}if(s.isPlayer&&R()<.5)puff(s.mesh.position,1,new THREE.Color(.25,.16,.08),1.6,4,.8,.6,1.5,3)}continue}if(Math.abs(tdd(os,s.dist))>3.2||Math.abs(ox-s.x)>(o.kind==='ring'?3.2:2.6))continue;if(o.kind==='ring'&&s.air&&s.air.y>yAt(TD,s.dist)+7)continue;
    o.alive=false;o.m.visible=false;o.t=o.kind==='ring'?6:18;
    if(o.kind==='ring'){s.turbo=Math.max(s.turbo,1.3);if(s.isPlayer){award(s,'BOOST RING',14,300,'#ffd12c');AU.sfx('turbo')}}
    else{const at=o.m.getWorldPosition(new THREE.Vector3());debris(at,V3(0,8,0).addScaledVector(s._fw||V3(),s.v*.4),10,[o.col.clone(),o.col.clone().multiplyScalar(.6),new THREE.Color('#ffffff')],.8,at.y-1.5);s.v*=.98;if(s.isPlayer){award(s,'BRICK SMASH',6,200,'#ff7a1c');AU.sfx('crash')}}}}
function waterTick(dt){if(!WFUN)return;for(const o of WFUN.objs){if(o.kind==='ring'&&o.alive)o.m.rotation.z+=dt*1.5;if(!o.alive){o.t-=dt;if(o.t<=0){o.alive=true;o.m.visible=true}}}}
function buildTrackProps(){const bt=new Batch();planes=[];gates=[];
  const hz=inClear('harbour');
  if(hz){const[x0,z0,x1,z1]=hz.map((v,i)=>i<4?v*S:v);const cols=['#b8322a','#1f5fa8','#e0a020','#2c8a5a','#8a3aa0','#d85a1a','#3a4a6a'].map(c=>new THREE.Color(c));
    const cm=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.55,metalness:.35});
    // container stacks: 12 m boxes in rows, never on the road
    for(let x=x0+8;x<x1-8;x+=13)for(let z=z0+6;z<z1-4;z+=5.2){if(nearTrack(x,z,HALF+9)||R()<.18)continue;const n=1+Math.floor(R()*4);CITY.push({x,z,hw:6,hd:1.22,h:n*2.62});for(let k=0;k<n;k++){const g=colorize(new THREE.BoxGeometry(12,2.6,2.44),cols[Math.floor(R()*cols.length)].clone().multiplyScalar(.7+R()*.3));g.translate(x,1.3+k*2.62,z);bt.add(g,cm)}}
    // gantry cranes on the quay, booms reaching over the Main
    const steel=new THREE.MeshStandardMaterial({color:0xc8462e,roughness:.45,metalness:.6}),rim=neonMat('#ffd12c',2);
    for(let x=x0+40;x<x1-20;x+=95){const z=RIVER[0]-10;if(nearTrack(x,z,HALF+14))continue;const g=new THREE.Group();g.position.set(x,0,z);ROOT.add(g);
      for(const lx of[-9,9])for(const lz of[-9,9]){const leg=new THREE.Mesh(new THREE.BoxGeometry(1.4,46,1.4),steel);leg.position.set(lx,23,lz);g.add(leg)}
      const beam=new THREE.Mesh(new THREE.BoxGeometry(22,3,22),steel);beam.position.y=46;g.add(beam);
      const boom=new THREE.Mesh(new THREE.BoxGeometry(3,2.4,86),steel);boom.position.set(0,50,26);g.add(boom);
      const cab=new THREE.Mesh(new THREE.BoxGeometry(5,4,5),neonMat('#9fe8ff',1.4));cab.position.set(0,45,6);g.add(cab);
      const strip=new THREE.Mesh(new THREE.BoxGeometry(3.2,.4,86),rim);strip.position.set(0,51.4,26);g.add(strip);beacon(g,0,55,68,9);beacon(g,0,49,-9,7);
      const cable=new THREE.Mesh(new THREE.BoxGeometry(.2,30,.2),neonMat('#8a86c8',1));cable.position.set(0,34,40);g.add(cable);searchSpots.push([x,50,z])}}
  const rw=inClear('runway');
  if(rw){const x0=-2900*S,x1=-1760*S,zc=1470*S,w=60,len=x1-x0;const[c,g]=cv(1024,64);g.fillStyle='#10121e';g.fillRect(0,0,1024,64);g.fillStyle='rgba(255,255,255,.85)';for(let x=40;x<1000;x+=46)g.fillRect(x,30,24,4);
    for(const y of[4,56])g.fillRect(0,y,1024,3);for(let k=0;k<8;k++){g.fillRect(8,6+k*7,22,4);g.fillRect(994,6+k*7,22,4)}
    const rg=new THREE.PlaneGeometry(len,w);rg.rotateX(-Math.PI/2);rg.translate((x0+x1)/2,.06,zc);ROOT.add(new THREE.Mesh(rg,new THREE.MeshStandardMaterial({map:tex(c,false),roughness:.35,metalness:.4,polygonOffset:true,polygonOffsetFactor:-1})));
    const lp=[],lc=[],wc=new THREE.Color(2.2,2.2,2),ac=new THREE.Color(2.4,1.3,.3),gc=new THREE.Color(.4,2.4,.8),rc=new THREE.Color(2.4,.3,.3);
    for(let x=x0;x<=x1;x+=18)for(const sz of[-1,1]){lp.push(x,.8,zc+sz*(w/2+1));lc.push(wc.r,wc.g,wc.b)}
    for(let d=18;d<420;d+=18){for(let k=-3;k<=3;k++){lp.push(x1+d,1+d*.02,zc+k*3.5);lc.push(ac.r,ac.g,ac.b)}}
    for(let k=-6;k<=6;k++){lp.push(x1+2,.8,zc+k*4.5);lc.push(gc.r,gc.g,gc.b);lp.push(x0-2,.8,zc+k*4.5);lc.push(rc.r,rc.g,rc.b)}
    const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute(lp,3));lg.setAttribute('color',new THREE.Float32BufferAttribute(lc,3));
    ROOT.add(new THREE.Points(lg,new THREE.PointsMaterial({size:5,vertexColors:true,map:GLOW,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false})));
    // control tower
    {const g2=new THREE.Group();g2.position.set(-2250*S,0,1230*S);ROOT.add(g2);const sh=new THREE.Mesh(new THREE.CylinderGeometry(4,5,64,12),new THREE.MeshStandardMaterial({color:0x2a2e4c,roughness:.4,metalness:.5}));sh.position.y=32;g2.add(sh);
     const cab2=new THREE.Mesh(new THREE.CylinderGeometry(11,8,9,16),glassMat(1,3,.3));cab2.position.y=68;g2.add(cab2);const rr3=new THREE.Mesh(new THREE.CylinderGeometry(11.3,11.3,.8,16,1,true),neonMat('#22e4ff',2));rr3.position.y=72;g2.add(rr3);beacon(g2,0,78,0,14)}
    // airliners on approach: in over Gateway Gardens, flare over the track, roll out west
    const skin=new THREE.MeshStandardMaterial({color:0xd8dce8,roughness:.3,metalness:.5}),tailM=new THREE.MeshStandardMaterial({color:0x10307a,roughness:.4});
    for(let k=0;k<2;k++){const p=new THREE.Group();const fus=new THREE.Mesh(new THREE.CylinderGeometry(2.4,2.1,40,14),skin);fus.rotation.z=Math.PI/2;p.add(fus);
      const nose=new THREE.Mesh(new THREE.SphereGeometry(2.4,12,8),skin);nose.position.x=-20;nose.scale.x=1.6;p.add(nose);
      const wing=new THREE.Mesh(new THREE.BoxGeometry(9,.5,38),skin);wing.position.set(1,-.8,0);p.add(wing);const hs=new THREE.Mesh(new THREE.BoxGeometry(4,.3,13),skin);hs.position.set(18,0,0);p.add(hs);
      const fin=new THREE.Mesh(new THREE.BoxGeometry(6,8,.4),tailM);fin.position.set(18,4.5,0);p.add(fin);
      for(const[x,y,z,col,sz]of[[0,-.8,19,'#ff2030',5],[0,-.8,-19,'#30ff70',5],[20,8,0,'#ffffff',4],[-22,-1,0,'#fff6e0',16]]){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:FLARE,color:glowCol(col,3),blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));sp.position.set(x,y,z);sp.scale.set(sz,sz,1);p.add(sp)}
      ROOT.add(p);planes.push({g:p,t:k*14,x0:-400*S,xt:x1-40,x1:x0+120,zc})}}
  if(TRK.gates){const cols=['#22e4ff','#ff2d95','#ffd12c','#8c55ff'];let k=0;
    for(let s=180;s<TF.L-60;s+=230){if(inGapF(s)||inGapF(s+40)||inGapF(s-40))continue;const f=frameAt(TF,s,mkF());const g=new THREE.Group();
      const arch=new THREE.Mesh(new THREE.TorusGeometry(HALF+7,.9,8,48,Math.PI),neonMat(cols[k%4],2.4));g.add(arch);
      const arch2=new THREE.Mesh(new THREE.TorusGeometry(HALF+9,.35,6,48,Math.PI),neonMat(cols[(k+1)%4],1.6));g.add(arch2);placeOnTrack(g,f,0,0);ROOT.add(g);gates.push({g,k});k++}}
  bt.flush()}
function updPlanes(dt){for(const p of planes){p.t=(p.t+dt)%28;const u=p.t/28;let x,y;
  if(u<.55){const a=u/.55;x=lerp(p.x0,p.xt,a);y=lerp(120,2.5,Math.pow(a,1.35))}else{const a=(u-.55)/.45;x=lerp(p.xt,p.x1,1-(1-a)*(1-a));y=2.5}
  p.g.position.set(x,y+1.6,p.zc);p.g.rotation.z=u<.55?-.05:0;p.g.visible=u<.97}}
/* ---- load a circuit: swap the whole world group ---- */
// free GPU memory of a removed subtree; shared textures (glows, facades, windows) stay resident
const KEEP_TEX=new Set();function disposeTree(root,keepMats){root.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.isReflector){try{o.dispose()}catch(e){}return}
  const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[];for(const m of ms){for(const k of['map','emissiveMap','alphaMap'])if(m[k]&&!KEEP_TEX.has(m[k])&&!KEEP_TEX.has(m[k].source))m[k].dispose();if(!keepMats&&!GLASS.includes(m)&&m!==MAT.roof)m.dispose()}})}
// upload every texture of a subtree now, so nothing stalls the first time it comes into view
function warmTextures(root){const seen=new Set();root.traverse(o=>{const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[];for(const m of ms)for(const k of['map','emissiveMap','alphaMap']){const t=m[k];if(t&&!seen.has(t)){seen.add(t);try{renderer.initTexture(t)}catch(e){}}}})}
function disposeWorld(){if(!WORLD)return;scene.remove(WORLD);disposeTree(WORLD);WORLD=null;waterRefl=waterPlain=null}
// R15 (race worker 15): 2K-style wide tracks: 38 m (was 14–20 m via CR_trackW); a track may set w15
function R15_trackW(def){return def.w15||38}
function loadTrack(id){if(!KEEP_TEX.size)for(const t of[GLOW,FLARE,SHADOW,FACADE,...WINS])KEEP_TEX.add(t),KEEP_TEX.add(t.source);const def=TRACK_DEFS.find(t=>t.id===id)||TRACK_DEFS[0];if(WORLD&&TRK===def)return false;disposeWorld();TRK=def;CP=def.cp;const ath=def.city==='ath';W=R15_trackW(def);HALF=W/2;MARGIN=HALF-1.5;CR_LS=W/(def.w||48);RIVER[0]=ath?1e9:450*S;RIVER[1]=ath?1e9:750*S;if(typeof traffic3d!=='undefined'&&traffic3d)traffic3d.im.visible=traffic3d.gl.visible=!ath;
  TF=buildTrackData();TD=TF;TRACKS={fwd:TF,rev:null};indexTrack();lampList=[];LANDMARKS.length=0;searchSpots.length=0;searchlights=[];billboards=[];trains=[];beacons=null;
  WORLD=new THREE.Group();ROOT=WORLD;scene.add(WORLD);
  if(ath){athPrep();athLandmarks();buildRoad();athGround();athCity();athDressing()}else{buildLandmarks();buildRoad();buildGround();buildCity();buildDressing()}buildTrackProps();buildWaterFun();buildMap();applyMoodMaterials();applyQuality();warmTextures(WORLD);return true}
function applyQuality(){const q=SET.q;INTU.value=q==='low'?0:1;const tp=lowGfx||q==='low'?5:9;if(FX.material.defines.TAPS!==tp){FX.material.defines.TAPS=tp;FX.material.needsUpdate=true}resize();bloom.enabled=q!=='low';const ns=q==='high'?4:0;for(const t of[composer.renderTarget1,composer.renderTarget2])if(t.samples!==ns){t.samples=ns;t.dispose()}
  if(waterRefl)waterRefl.visible=q==='high';if(waterPlain)waterPlain.visible=!(waterRefl&&q==='high');rainScale={low:.3,med:.6,high:1}[q];applyMoodMaterials()}

/* ---- Athens race world (Stage E): a sunlit marble city on rolling ground replaces the neon Frankfurt for the Athens circuits */
let ATHG=null;
const ATH_NEON=[['ΚΑΦΕ','#ff2d95'],['BAR','#22e4ff'],['ΓΥΡΟΣ','#ffd12c'],['ΦΑΡΜΑΚΕΙΟ','#5dffb0'],['SOUVLAKI','#ff7a1c'],['CINEMA','#c46bff']];
const ATH_BRANDS=[['ΦΡΑΠΕ ΟΠΑ','ICED COFFEE · SINCE 1957','#f5d000','#0d5eaf'],['AEGEAN BLUE','FLY THE MELTEMI','#0d5eaf','#ffffff'],['KOULOURI 24/7','SESAME POWER','#d89a3a','#c8643c'],['PERIPTERO','EVERYTHING · EVERY CORNER','#3f8a4a','#ffd12c'],['ΜΕΛΤΕΜΙ','ENERGY DRINK','#2f7fd0','#ff9a1a'],['ACROPOLIS BANK','SINCE 432 BC','#8a6a3a','#efe3c8']];
function athPrep(){const td=TF;let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(let i=0;i<td.N;i++){const x=td.P[i*3],z=td.P[i*3+2];x0=Math.min(x0,x);x1=Math.max(x1,x);z0=Math.min(z0,z);z1=Math.max(z1,z)}
  const M=760,c=20;x0=Math.floor((x0-M)/c)*c;z0=Math.floor((z0-M)/c)*c;x1=Math.ceil((x1+M)/c)*c;z1=Math.ceil((z1+M)/c)*c;const nx=(x1-x0)/c+1,nz=(z1-z0)/c+1,H=new Float32Array(nx*nz),S2=[];
  const P=td.P,RV=td.R,fly=new Uint8Array(td.N);for(let q=0;q<td.N;q++)fly[q]=/FLYOVER/.test(td.SEC[q])?1:0;
  for(let q=0;q<td.L;q+=16){const i=Math.floor(q/td.ds)%td.N;S2.push(P[i*3],P[i*3+2],fly[i]?0:Math.max(0,P[i*3+1]))}const sg=2*140*140;
  for(const jp of td.jumps)if(jp.kind==='pit'){const i=Math.floor((jp.s0+jp.s1)/2/td.ds)%td.N;jp.gy=P[i*3+1]-1.3;jp.floor=jp.gy-13}
  const nIdx=(x,z,r)=>{let b=r*r,bi=-1;const c0=Math.floor((x-r)/HCELL),c1=Math.floor((x+r)/HCELL),d0=Math.floor((z-r)/HCELL),d1=Math.floor((z+r)/HCELL);for(let a=c0;a<=c1;a++)for(let q=d0;q<=d1;q++){const A=hash.get(a+','+q);if(!A)continue;for(let k=0;k<A.length;k+=4){const d=(A[k]-x)**2+(A[k+1]-z)**2;if(d<b){b=d;bi=A[k+3]}}}return bi};
  const nIdxS=(x,z,r)=>{let b=r*r,bi=-1;const c0=Math.floor((x-r)/HCELL),c1=Math.floor((x+r)/HCELL),d0=Math.floor((z-r)/HCELL),d1=Math.floor((z+r)/HCELL);for(let a=c0;a<=c1;a++)for(let q=d0;q<=d1;q++){const A=hash.get(a+','+q);if(!A)continue;for(let k=0;k<A.length;k+=4){if(A[k+2]>=-3||fly[A[k+3]])continue;const d=(A[k]-x)**2+(A[k+1]-z)**2;if(d<b){b=d;bi=A[k+3]}}}return bi};
  const cutH=(q,x,z)=>{const px=P[q*3],py=P[q*3+1],pz=P[q*3+2],rx=RV[q*3],ry=RV[q*3+1],rz=RV[q*3+2],hr=Math.hypot(rx,rz)||1,l=((x-px)*rx+(z-pz)*rz)/hr,t=ry/hr,al=Math.abs(l),dq=clamp((-py-3)/7,0,1),sh=HALF+6+dq*(c*1.42+4);return al<sh?py+l*t-1-4*Math.abs(t):py+Math.sign(l)*(HALF+2.6)*t-.12+(al-sh)*(.55+2.5*dq)};
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=x0+i*c,z=z0+j*c;let sw=.18,sy=0,dm=1e18;for(let k=0;k<S2.length;k+=3){const dx=S2[k]-x,dz=S2[k+1]-z,d2=dx*dx+dz*dz;if(d2<dm)dm=d2;if(d2>360000)continue;const w=Math.exp(-d2/sg);sw+=w;sy+=w*S2[k+2]}
    let h=Math.max(0,sy/sw);
    if(dm<220*220){const q=nIdx(x,z,200);if(q>=0){const px=P[q*3],py=P[q*3+1],pz=P[q*3+2],rx=RV[q*3],ry=RV[q*3+1],rz=RV[q*3+2],hr=Math.hypot(rx,rz)||1,l=((x-px)*rx+(z-pz)*rz)/hr,t=ry/hr,al=Math.abs(l),sd=q*td.ds,pit=td.jumps.find(jp=>jp.kind==='pit'&&sd>=jp.s0+3&&sd<=jp.s1-3);
      if(pit&&al<84)h=pit.gy-14.2;
      else if(!fly[q]){const under=py+l*t-1-4*Math.abs(t);
        if(py<-1)h=Math.min(h,cutH(q,x,z));
        else if(al<=HALF+1)h=under;
        else{const se=py+Math.sign(l)*(HALF+2.6)*t-.12,w0=clamp((al-HALF-10)/80,0,1),w=w0*w0*(3-2*w0);h=Math.min(se*(1-w)+h*w,se+Math.max(0,al-HALF-6)*.14)}}}}
    {const q2=dm<260*260?nIdxS(x,z,HALF+50):-1,q1=q2>=0?nIdx(x,z,200):-1;if(q2>=0&&q2!==q1&&(q1<0||P[q2*3+1]<P[q1*3+1]-8)&&!td.jumps.some(jp=>jp.kind==='pit'&&q2*td.ds>=jp.s0-20&&q2*td.ds<=jp.s1+20))h=Math.min(h,cutH(q2,x,z))}
    H[j*nx+i]=h}
  ATHG={x0,z0,x1,z1,c,nx,nz,H,S2};
  MAT.athP=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.78,metalness:0});
  MAT.athM=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.55,metalness:0,side:THREE.DoubleSide,emissive:new THREE.Color('#ffc27a'),emissiveIntensity:MOOD.win*.42});
  MAT.athG=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.2,metalness:.6});
  MAT.athB=new THREE.MeshStandardMaterial({map:athFacadeTex(),emissiveMap:athWinTex(),emissive:0xffffff,emissiveIntensity:MOOD.win*.9,vertexColors:true,roughness:.88,metalness:0})}
function athH(x,z){const G=ATHG;if(!G)return 0;const fx=clamp((x-G.x0)/G.c,0,G.nx-1.001),fz=clamp((z-G.z0)/G.c,0,G.nz-1.001),i=Math.floor(fx),j=Math.floor(fz),a=fx-i,b=fz-j,H=G.H,n=G.nx;
  return(H[j*n+i]*(1-a)+H[j*n+i+1]*a)*(1-b)+(H[(j+1)*n+i]*(1-a)+H[(j+1)*n+i+1]*a)*b}
function athTD(x,z){const S2=ATHG.S2;let b=1e18,bi=0;for(let k=0;k<S2.length;k+=3){const d=(S2[k]-x)**2+(S2[k+1]-z)**2;if(d<b){b=d;bi=k}}return{d:Math.sqrt(b),x:S2[bi],z:S2[bi+1]}}
function athUV(g,w,h,d){const uv=g.attributes.uv,nm=g.attributes.normal;for(let i=0;i<uv.count;i++){if(Math.abs(nm.getY(i))>.5){uv.setXY(i,.01,.01);continue}const al=Math.abs(nm.getX(i))>.5?d:w;uv.setXY(i,uv.getX(i)*al/16,uv.getY(i)*h/19.2)}return g}
const athBox=(w,h,d,x,y,z)=>{const g=new THREE.BoxGeometry(w,h,d);g.translate(x,y,z);return g};
function athNoise(g,base,n,r){for(let i=0;i<n;i++){g.fillStyle=`rgba(${base},${r()*.07})`;g.fillRect(r()*512,r()*512,2+r()*3,2+r()*3)}}
// asphalt with red-white kerbs and white lines (one tile = W × W), lines glow faintly at night
function athRoadTex(kind){const Z=512,[c,g]=cv(Z,Z),[e,ge]=cv(Z,Z),r=mul(41),mb=kind==='marble';g.fillStyle=mb?'#b9b0a0':kind==='asph'?'#3e3f44':'#5d5e62';g.fillRect(0,0,Z,Z);ge.fillStyle='#000';ge.fillRect(0,0,Z,Z);
  for(let i=0;i<5000;i++){const v=r();g.fillStyle=v<.5?`rgba(30,30,34,${r()*.25})`:`rgba(160,158,150,${r()*.18})`;g.fillRect(r()*Z,r()*Z,1+r()*2,1+r()*2)}
  if(mb){for(let y=0;y<Z;y+=64)for(let x=0;x<Z;x+=96){g.fillStyle=`rgba(${180+r()*40|0},${170+r()*40|0},${150+r()*30|0},.5)`;g.fillRect(x+((y/64)%2)*48+2,y+2,92,60)}g.fillStyle='rgba(110,100,85,.45)';for(let y=0;y<Z;y+=64)g.fillRect(0,y,Z,2)}else for(let i=0;i<5;i++){g.fillStyle='rgba(40,40,44,.25)';g.fillRect(60+r()*380,0,8+r()*20,Z)}
  if(kind==='tram')for(const x0 of[70,442])for(const o of[-9,9]){g.fillStyle='#8a8c90';g.fillRect(x0+o-2,0,4,Z);g.fillStyle='#2a2a2c';g.fillRect(x0+o+2,0,2,Z);ge.fillStyle='rgba(200,210,230,.18)';ge.fillRect(x0+o-2,0,4,Z)}
  for(let y=0;y<Z;y+=32){const a=(y/32)%2?'#d8302a':'#f4f2ec';for(const x of[0,Z-13]){g.fillStyle=a;g.fillRect(x,y,13,32);ge.fillStyle=a;ge.globalAlpha=.12;ge.fillRect(x,y,13,32);ge.globalAlpha=1}}
  for(const x of[24,Z-29]){g.fillStyle=mb?'#0d5eaf':'#f2f2ee';g.fillRect(x,0,5,Z);ge.fillStyle='rgba(255,250,235,.22)';ge.fillRect(x,0,5,Z)}
  for(let y=0;y<Z;y+=128)for(const x of[Z/3,Z*2/3]){g.fillStyle=mb?'#8a8070':kind==='asph'?'#f5d000':'#ecece6';g.fillRect(x-3,y,6,64);ge.fillStyle='rgba(255,250,235,.16)';ge.fillRect(x-3,y,6,64)}
  return[tex(c),tex(e)]}
// marble barrier with a blue meander band (one tile = 25 m)
function athWallTex(C=['#f6f2ea','#0d5eaf']){const[c,g]=cv(1024,128),[e,ge]=cv(1024,128);const gr=g.createLinearGradient(0,0,0,128);gr.addColorStop(0,C[0]);gr.addColorStop(1,'#d9d1c2');g.fillStyle=gr;g.fillRect(0,0,1024,128);ge.fillStyle='#000';ge.fillRect(0,0,1024,128);
  for(let x=0;x<1024;x+=128){g.fillStyle='rgba(120,110,90,.35)';g.fillRect(x,0,3,128)}g.fillStyle=C[1];g.fillRect(0,40,1024,48);ge.fillStyle=C[1];ge.globalAlpha=.4;ge.fillRect(0,40,1024,48);ge.globalAlpha=1;ge.fillStyle='rgba(0,0,0,0)';ge.fillRect(0,40,1024,48);
  g.strokeStyle='#ffffff';g.lineWidth=5;for(let x=0;x<1024;x+=48){g.beginPath();g.moveTo(x+4,80);g.lineTo(x+4,48);g.lineTo(x+40,48);g.lineTo(x+40,72);g.lineTo(x+16,72);g.lineTo(x+16,58);g.lineTo(x+28,58);g.stroke();g.beginPath();g.moveTo(x+40,80);g.lineTo(x+52,80);g.stroke()}
  return[tex(c),tex(e)]}
// paving with street bands (one tile = 150 m) and warm lamp dots for the night
function athGroundTex(){const[c,g]=cv(512,512),[e,ge]=cv(512,512),r=mul(43);g.fillStyle='#b8ad97';g.fillRect(0,0,512,512);ge.fillStyle='#000';ge.fillRect(0,0,512,512);athNoise(g,'90,80,60',4000,r);
  for(let i=0;i<14;i++){g.fillStyle=`rgba(${120+r()*40|0},${130+r()*30|0},80,.35)`;g.beginPath();g.arc(r()*512,r()*512,6+r()*14,0,7);g.fill()}
  for(const p of[96,352]){g.fillStyle='#d6cdbb';g.fillRect(p-30,0,60,512);g.fillRect(0,p-30,512,60);g.fillStyle='#6a6a6c';g.fillRect(p-22,0,44,512);g.fillRect(0,p-22,512,44);g.fillStyle='#e9e9e4';for(let k=0;k<512;k+=40){g.fillRect(p-1,k,2,20);g.fillRect(k,p-1,20,2)}
    for(let k=0;k<512;k+=48){ge.fillStyle='rgba(255,196,120,.85)';ge.fillRect(p-27,k,4,4);ge.fillRect(p+23,k+24,4,4);ge.fillRect(k,p-27,4,4);ge.fillRect(k+24,p+23,4,4)}}
  return[tex(c),tex(e)]}
// polykatoikia facade: 4 bays × 6 floors of balconies, shutters and awnings (one tile = 16 m × 19.2 m); the roof corner is plain concrete
function athFacadeTex(){const[c,g]=cv(256,256),r=mul(47),fh=256/6;g.fillStyle='#f6f3ec';g.fillRect(0,0,256,256);
  for(let f=0;f<6;f++){const y=f*fh;g.fillStyle='rgba(0,0,0,.18)';g.fillRect(0,y+fh-3,256,3);g.fillStyle='#dcd7cd';g.fillRect(0,y+fh-8,256,5);g.fillStyle='rgba(60,60,60,.55)';g.fillRect(0,y+fh-20,256,1.5);
    for(let b=0;b<4;b++){const x=b*64;g.fillStyle='#3d4854';g.fillRect(x+12,y+9,40,fh-20);g.fillStyle='rgba(160,190,210,.35)';g.fillRect(x+14,y+11,16,8);const sh=r();if(sh<.45){g.fillStyle=sh<.25?'#5b7d4f':'#8a6a48';g.fillRect(x+6,y+9,7,fh-20);g.fillRect(x+51,y+9,7,fh-20)}
      if(r()<.3){const ac=['#3f8a4a','#e8822a','#2f7fd0','#c8643c'][Math.floor(r()*4)];for(let k=0;k<5;k++){g.fillStyle=k%2?'#ffffff':ac;g.fillRect(x+8+k*9.6,y+4,9.6,8)}}}}
  g.fillStyle='#cfc8bb';g.fillRect(0,232,24,24);return tex(c)}
function athWinTex(){const[c,g]=cv(256,256),r=mul(53),fh=256/6;g.fillStyle='#000';g.fillRect(0,0,256,256);for(let f=0;f<6;f++)for(let b=0;b<4;b++){if(r()<.42)continue;g.fillStyle=['#ffcf8a','#ffe2b0','#ffb86a','#fff0d0'][Math.floor(r()*4)];g.globalAlpha=.55+r()*.45;g.fillRect(b*64+12,f*fh+9,40,fh-20);g.globalAlpha=1}g.fillStyle='#000';g.fillRect(0,232,24,24);return tex(c)}
function athFlagTex(){const[c,g]=cv(96,64);for(let i=0;i<9;i++){g.fillStyle=i%2?'#ffffff':'#0d5eaf';g.fillRect(0,i*64/9,96,64/9+.5)}g.fillStyle='#0d5eaf';g.fillRect(0,0,36,36);g.fillStyle='#fff';g.fillRect(14,0,8,36);g.fillRect(0,14,36,8);return tex(c,false)}
// merged, vertex-coloured props for instancing
function athMerge(parts){return mergeGeometries(parts.map(([g,col])=>{const q=g.index?g.toNonIndexed():g;return colorize(q,new THREE.Color(col))}))}
const athTreeGeo=()=>ART_athTree();const athTreeGeo0=()=>{const P=[[athBox(.5,2.6,.5,0,1.3,0),'#6a4a32']],cr=new THREE.IcosahedronGeometry(2.3,1);cr.scale(1,.85,1);cr.translate(0,3.9,0);P.push([cr,'#3c6a2c']);const r=mul(5);for(let i=0;i<7;i++){const a=r()*6.28,h=r()*1.6-.6;P.push([athBox(.42,.42,.42,Math.cos(a)*2.1,3.9+h,Math.sin(a)*2.1),'#ff9a1a'])}return athMerge(P)};
const athTreeBy=k=>ART_athTreeBy(k)||athTreeBy0(k);const athTreeBy0=k=>{if(k==='cypress')return athCypGeo();if(k==='olive'){const a=new THREE.IcosahedronGeometry(2,1);a.scale(1.3,.7,1.1);a.translate(.5,3.4,0);const b2=new THREE.IcosahedronGeometry(1.6,1);b2.scale(1.2,.7,1);b2.translate(-.9,3,.4);return athMerge([[athBox(.6,2.6,.6,0,1.3,0),'#6f6250'],[a,'#7d8a5a'],[b2,'#8a9668']])}
  if(k==='palm'){const P=[[new THREE.CylinderGeometry(.3,.45,9.5,6).translate(0,4.75,0),'#a08060']];for(let i=0;i<7;i++){const f=athBox(.7,.12,5,0,0,2.4);f.rotateX(.42);f.rotateY(i/7*6.28);f.translate(0,9.5,0);P.push([f,'#3f7a34'])}return athMerge(P)}
  if(k==='plane'){const c=new THREE.IcosahedronGeometry(3.4,1);c.scale(1,.9,1);c.translate(0,6,0);return athMerge([[athBox(.7,4.2,.7,0,2.1,0),'#7a6a58'],[c,'#4f7a3a']])}
  return athTreeGeo()};
const athCypGeo=()=>{const t=new THREE.ConeGeometry(1.3,10,7);t.translate(0,6,0);return athMerge([[athBox(.4,1.4,.4,0,.7,0),'#5a4030'],[t,'#2f5a32']])};
const athPineGeo=()=>{const c=new THREE.IcosahedronGeometry(4.4,1);c.scale(1,.42,1);c.translate(0,7.2,0);return athMerge([[athBox(.7,6.4,.7,0,3.2,0),'#6a5040'],[c,'#4a6a34']])};
const athKioskGeo=()=>athMerge([[athBox(3.2,2.5,2.2,0,1.25,0),'#2f6a3a'],[athBox(4,.35,3,0,2.7,0),'#f5d000'],[athBox(3.6,.9,.12,0,2.2,1.16),'#0d5eaf'],[athBox(.7,1.4,.5,-1.2,.7,1.4),'#f4f4f4'],[athBox(1.6,1.1,.3,.5,.9,1.3),'#e8822a'],[athBox(.12,1.6,.12,1.9,2.5,1.3),'#9aa0a6'],[athBox(.9,.6,.05,2.3,3.1,1.3),'#ff4a6a']]);
const athTaxiGeo=()=>athMerge([[athBox(1.9,1.05,4.4,0,.78,0),'#f5d000'],[athBox(1.72,.75,2.3,0,1.66,-.2),'#f5d000'],[athBox(1.76,.5,2.1,0,1.68,-.2),'#2a3440'],[athBox(.8,.32,.28,0,2.2,-.2),'#ffffff'],[athBox(.6,.12,.3,0,2.4,-.2),'#1a1a1a'],[athBox(2,.55,.7,0,.35,1.3),'#1c1c1e'],[athBox(2,.55,.7,0,.35,-1.3),'#1c1c1e']]);
const athUmbGeo=()=>{const cn=new THREE.ConeGeometry(1.7,.7,8);cn.translate(0,2.65,0);return athMerge([[athBox(.1,2.6,.1,0,1.3,0),'#f0f0f0'],[cn,'#ffffff'],[athBox(.9,.08,.9,.9,.76,0),'#f0f0f0'],[athBox(.5,.9,.5,1.8,.45,0),'#f0f0f0'],[athBox(.5,.9,.5,0,.45,0),'#f0f0f0']])};
// stepped marble seats: a profile revolved (sphendone, odeon) or extruded (straight stands)
function athSeatPts(hw,nT,st,ri){const p=[[hw,-7],[hw,1.4]];for(let k=0;k<nT;k++){p.push([hw+(k+1)*st,1.4+k*ri],[hw+(k+1)*st,1.4+(k+1)*ri])}p.push([hw+nT*st+2,1.4+nT*ri],[hw+nT*st+2,-7]);return p}
function athLathe(hw,nT,st,ri,phi0,phiL){return new THREE.LatheGeometry(athSeatPts(hw,nT,st,ri).map(([x,y])=>new THREE.Vector2(x,y)),28,phi0,phiL)}
function athStands(hw,nT,st,ri,len,sd){const sh=new THREE.Shape(athSeatPts(hw,nT,st,ri).map(([x,y])=>new THREE.Vector2(x*sd,y)));const g=new THREE.ExtrudeGeometry(sh,{depth:len,bevelEnabled:false});return g}
function athLandmarks(){const t=TRK,k=t.map[0],sc=clamp(k,1,1.6),lb=new Batch(),M4=new THREE.Matrix4(),rnd=mul(99),parks=[];ATHG.parks=parks;
  const P_=(g,col,mat)=>{if(g.index)g=g.toNonIndexed();g.applyMatrix4(M4);lb.add(colorize(g,new THREE.Color(col)),mat||MAT.athP)};
  const B_=(w,h,d,x,y,z,col,mat,ry)=>{const g=new THREE.BoxGeometry(w,h,d);if(ry)g.rotateY(ry);g.translate(x,y,z);P_(g,col,mat)};
  const C_=(r1,r2,h,x,y,z,col,mat,seg=8)=>{const g=new THREE.CylinderGeometry(r1,r2,h,seg);g.translate(x,y,z);P_(g,col,mat)};
  const D_=(r,x,y,z,col,mat)=>{const g=new THREE.SphereGeometry(r,12,6,0,Math.PI*2,0,Math.PI/2);g.translate(x,y,z);P_(g,col,mat)};
  // place a landmark at real e,n; small ones step back from the road, far ones (> 2.6 km) are skipped
  const at=(e,n,r,ry=0)=>{let[x,z]=athW(t,e,n);const q=athTD(x,z);if(q.d>2600)return null;if(q.d<r+HALF+8){if(r>45)return null;const dx=x-q.x,dz=z-q.z,l=Math.hypot(dx,dz)||1;x=q.x+dx/l*(r+HALF+10);z=q.z+dz/l*(r+HALF+10)}
    if(LANDMARKS.some(L=>(L.x-x)**2+(L.z-z)**2<(L.r+r*.5)**2))return null;LANDMARKS.push({x,z,r});const y=athH(x,z);M4.makeRotationY(ry).setPosition(x,y,z);return{x,y,z}};
  const temple=(W,D,nw,nd,H,ruin,y0=0)=>{const m=MAT.athM,cm='#efe9dc';for(let s=0;s<3;s++)B_(W+5-s*1.6,1,D+5-s*1.6,0,y0+.5+s,0,'#e2dac9',m);const yb=y0+3;
    for(let i=0;i<nw;i++)for(let j=0;j<nd;j++){if(i>0&&i<nw-1&&j>0&&j<nd-1)continue;if(ruin&&rnd()<ruin)continue;C_(H*.06,H*.07,H,-W/2+i*W/(nw-1),yb+H/2,-D/2+j*D/(nd-1),cm,m)}
    if(ruin)return;B_(W+1.2,H*.2,D+1.2,0,yb+H+H*.1,0,cm,m);B_(W*.62,H*.92,D*.72,0,yb+H*.46,0,'#e4dac6',m);
    const ph=H*.26,pg=new THREE.CylinderGeometry(1,1,1,3);pg.rotateX(-Math.PI/2);pg.rotateY(Math.PI/2);pg.scale(W+1.2,ph/1.5,(D+1.2)/1.732);pg.translate(0,yb+H*1.2+ph/3,0);P_(pg,cm,m)};
  // Acropolis rock with the Parthenon, Erechtheion and Propylaea
  {const rx=150*k,rz=78*k,A=at(100,-478,rx*.92);if(A){const H=64,g=new THREE.CylinderGeometry(1,1.14,1,24,3).toNonIndexed(),p=g.attributes.position,col=new Float32Array(p.count*3),c=new THREE.Color();
    for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),a=Math.atan2(z,x),j=1+.1*Math.sin(3*a+1)+.06*Math.sin(7*a+2)+(y<.49?.05*Math.sin(11*a+y*9):0);p.setXYZ(i,x*j*rx,(y+.5)*H-6,z*j*rz);c.set(y>.45?'#cdb78e':y>-.3?'#a68c66':'#6f7a48');col.set([c.r,c.g,c.b],i*3)}
    g.setAttribute('color',new THREE.BufferAttribute(col,3));g.computeVertexNormals();g.applyMatrix4(M4);lb.add(g,MAT.athP);const top=H-6;{const q=athTD(A.x,A.z),rp=Math.min(260*k,q.d+30);if(rp>rx)LANDMARKS.push({x:A.x,z:A.z,r:rp,park:1});parks.push([100,-478,Math.min(200,rp/k)])}
    M4.makeTranslation(A.x-2*k,A.y+top,A.z+30*k);temple(70*sc,31*sc,17,8,12*sc,0);M4.makeTranslation(A.x-14*k,A.y+top,A.z-28*k);temple(24*sc,13*sc,6,4,7.5*sc,0);
    M4.makeTranslation(A.x-122*k,A.y+top-3,A.z+6*k);for(let i=0;i<6;i++)C_(1.1*sc,1.25*sc,10*sc,0,5*sc,(i-2.5)*4.2*sc,'#efe9dc',MAT.athM);B_(4*sc,2*sc,26*sc,0,10.5*sc,0,'#efe9dc',MAT.athM);B_(14*sc,9*sc,10*sc,-6*sc,4.5*sc,-18*sc,'#e4dac6',MAT.athM);B_(14*sc,9*sc,10*sc,-6*sc,4.5*sc,18*sc,'#e4dac6',MAT.athM);
    M4.makeTranslation(A.x+110*k,A.y+top,A.z-8*k);C_(.25,.25,22,0,11,0,'#dddddd');B_(.1,3.4,5,0,20,2.6,'#0d5eaf')}}
  if(at(-84,-586,40*sc)){const g=athLathe(14*sc,9,2.6*sc,1.5*sc,Math.PI/2,Math.PI);P_(g,'#e9e0cf',MAT.athM);B_(80*sc,26,5,0,13,12*sc,'#e0d2b6',MAT.athM);for(let i=0;i<9;i++)B_(4.5*sc,9,5.6,(i-4)*8*sc,9,12*sc,'#3a3026')}
  {const L=at(1552,643,1);if(L){LANDMARKS.pop();const q=athTD(L.x,L.z),r=Math.min(330*k,q.d-HALF-30);if(r>120){LANDMARKS.push({x:L.x,z:L.z,r:r*.82});const H=Math.max(130,r*.62),g=new THREE.CylinderGeometry(r*.05,r,H,24,5).toNonIndexed(),p=g.attributes.position,col=new Float32Array(p.count*3),c=new THREE.Color();
    for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),a=Math.atan2(z,x),f=(y+H/2)/H,j=f>.98?1:1+.12*Math.sin(3*a+.5)+.07*Math.sin(8*a+f*6);p.setXYZ(i,x*j,y+H/2-4,z*j);c.set(f>.72?'#b8ad96':f>.4?'#5f7a42':'#6f8a4a');col.set([c.r,c.g,c.b],i*3)}
    g.setAttribute('color',new THREE.BufferAttribute(col,3));g.computeVertexNormals();M4.makeTranslation(L.x,L.y,L.z);g.applyMatrix4(M4);lb.add(g,MAT.athP);M4.makeTranslation(L.x,L.y+H-4,L.z);B_(8,6,13,0,3,0,'#ffffff',MAT.athM);D_(3,0,6,-3,'#ffffff',MAT.athM);B_(3,9,3,0,4.5,6,'#ffffff',MAT.athM)}}}
  // the Panathenaic Stadium (Kallimarmaro): built around the in-stadium hairpin of the finale, elsewhere at its real place
  const stadium=(hw,len,nT,crowd)=>{const st=3,ri=1.6;P_(athLathe(hw,nT,st,ri,-Math.PI/2,Math.PI).translate(0,0,len),'#f1ece0',MAT.athM);for(const sd of[-1,1])P_(athStands(hw,nT,st,ri,len,sd),'#f1ece0',MAT.athM);
    const top=1.4+nT*ri;for(let i=0;i<10;i++){const a=-Math.PI/2+i/9*Math.PI,R2=hw+nT*st+1;C_(.18,.18,9,Math.sin(a)*R2,top+4.5,len+Math.cos(a)*R2,'#dddddd')}
    if(crowd){const n=900,im=new THREE.InstancedMesh(new THREE.BoxGeometry(.9,1.3,.8),new THREE.MeshStandardMaterial({roughness:.8}),n),q=new THREE.Matrix4(),cc=new THREE.Color(),CL=['#0d5eaf','#ffffff','#e8822a','#d8302a','#f5d000','#3f8a4a','#2a2a2a'];
      for(let i=0;i<n;i++){const kk=Math.floor(rnd()*nT),rr2=hw+kk*st+st*.5,y=1.4+kk*ri+.65,u=rnd()*(len*2+Math.PI*rr2);let x,z;if(u<len){x=-rr2;z=u}else if(u<len*2){x=rr2;z=u-len}else{const a=-Math.PI/2+(u-len*2)/rr2;x=Math.sin(a)*rr2;z=len+Math.cos(a)*rr2}
        q.makeTranslation(x,y,z).premultiply(M4);im.setMatrixAt(i,q);im.setColorAt(i,cc.set(CL[Math.floor(rnd()*CL.length)]))}im.computeBoundingSphere();ROOT.add(im)}};
  if(t.stadium){const[cx,cz]=athW(t,...t.stadium),len=112,y=Math.max(athH(cx-88,cz-len/2),athH(cx+88,cz-len/2),athH(cx,cz+90))-.4;LANDMARKS.push({x:cx,z:cz-50,r:138},{x:cx,z:cz+40,r:138});M4.makeTranslation(cx,y,cz-len);stadium(86,len,13,1);
    
    B_(4,14,4,-96,7,-14,'#efe9dc',MAT.athM);B_(4,14,4,96,7,-14,'#efe9dc',MAT.athM)}
  else if(at(1355,-850,105,.36)){stadium(32,150,12,0);}
  // ancient Athens and downtown
  if(at(572,-656,14*sc)){for(const sd of[-1,1])B_(4*sc,12*sc,3.4*sc,sd*6*sc,6*sc,0,'#e8dcc4',MAT.athM);B_(16*sc,3*sc,3.6*sc,0,13.5*sc,0,'#e8dcc4',MAT.athM);for(let i=0;i<4;i++)C_(.4*sc,.45*sc,6*sc,(i-1.5)*3.6*sc,18*sc,0,'#e8dcc4',MAT.athM);B_(15*sc,1.2*sc,3.6*sc,0,21.6*sc,0,'#e8dcc4',MAT.athM)}
  if(at(667,-739,52*sc)){B_(96*sc,2,40*sc,0,1,0,'#ddd3bf',MAT.athM);for(let i=0;i<13;i++)C_(1.1*sc,1.25*sc,19*sc,(i%5-2)*7*sc+16*sc,2+9.5*sc,(Math.floor(i/5)-1)*7*sc,'#efe5d0',MAT.athM);C_(1.1*sc,1.25*sc,19*sc,-30*sc,2+9.5*sc,-12*sc,'#efe5d0',MAT.athM);C_(1.1*sc,1.25*sc,19*sc,-37*sc,2+9.5*sc,-12*sc,'#efe5d0',MAT.athM);parks.push([667,-739,90])}
  if(at(1007,-91,68*sc)){B_(62*sc,22,108*sc,0,11,0,'#f0dfb6',MAT.athM);B_(64*sc,2,110*sc,0,23,0,'#e6d2a2',MAT.athM);for(let i=0;i<10;i++)C_(1,1.1,15,-33*sc,8.5,(i-4.5)*5,'#f3ead6',MAT.athM);B_(4,2.4,54,-33*sc,17,0,'#f3ead6',MAT.athM);B_(3,4,34,-46*sc,2,0,'#e8dcc4',MAT.athM)}
  if(at(947,-508,42*sc)){B_(72*sc,14,46*sc,0,7,0,'#efe6d2',MAT.athM);for(let i=0;i<8;i++)C_(.8,.9,12,(i-3.5)*4.4,7,-23*sc-3,'#f6f0e2',MAT.athM);B_(36,2,6,0,14,-23*sc-3,'#f6f0e2',MAT.athM)}
  if(at(46,-15,11*sc)){B_(14*sc,12*sc,14*sc,0,6*sc,0,'#e9dcc0');C_(6.5*sc,6.5*sc,2*sc,0,13*sc,0,'#e9dcc0',null,12);D_(6.5*sc,0,14*sc,0,'#8a9096');B_(14*sc,5*sc,5*sc,0,2.5*sc,9*sc,'#e0d0b0')}
  if(at(401,-88,16*sc)){B_(18*sc,13*sc,26*sc,0,6.5*sc,0,'#e9d9b8');C_(5*sc,5*sc,5*sc,0,15.5*sc,0,'#e9d9b8',null,12);D_(5*sc,0,18*sc,0,'#b07a4a');for(const sd of[-1,1]){B_(4*sc,20*sc,4*sc,sd*7*sc,10*sc,-12*sc,'#e9d9b8');D_(2.2*sc,sd*7*sc,20*sc,-12*sc,'#b07a4a')}}
  if(at(-359,-55,30*sc)){C_(34*sc,46*sc,7,0,3,0,'#8a9a5a',null,16);M4.multiply(new THREE.Matrix4().makeTranslation(0,6,0));temple(30*sc,13*sc,13,6,8*sc,0);parks.push([-300,-150,140])}
  if(at(-114,-111,48*sc)){B_(94*sc,12,17*sc,0,6,0,'#efe6d2',MAT.athM);for(let i=0;i<22;i++)C_(.55,.6,6,(i-10.5)*4.2*sc,3,9*sc,'#f6f0e2',MAT.athM);B_(94*sc,1,3,0,6.5,9*sc,'#f6f0e2',MAT.athM)}
  if(at(94,-78,22*sc)){B_(40*sc,9,3,0,4.5,-6,'#d9cdb4',MAT.athM);for(let i=0;i<7;i++)C_(.7*sc,.75*sc,10*sc,(i-3)*5*sc,5*sc,0,'#efe6d2',MAT.athM)}
  if(at(261,-840,36*sc)){for(let i=0;i<9;i++)C_(.6,.6,6,(i%3-1)*16*sc,3,(Math.floor(i/3)-1)*14*sc,'#bfbab0');B_(66*sc,9,48*sc,0,10.5,0,'#d8d4cc');B_(46*sc,9,30*sc,0,19.5,0,'#7d93a6',MAT.athG,.3)}
  if(at(389,-557,5))C_(2.4,2.6,10,0,5,0,'#efe6d2',MAT.athM,12);
  if(at(-363,-969,60*k)){C_(30*k,62*k,30,0,13,0,'#8a9a5a',null,14);B_(10,9,3,0,32,0,'#efe6d2',MAT.athM);parks.push([-363,-969,110])}
  if(at(649,470,6))for(const sd of[-1,1]){C_(.9,1,26,sd*8,13,0,'#f4efe4',MAT.athM);B_(1.8,3.2,1.2,sd*8,27.6,0,'#d8b86a',MAT.athM)}
  if(at(192,877,16)){C_(14,14,1.2,0,.6,0,'#e8e0d0',MAT.athM,20);C_(10,10,1,0,1.3,0,'#4a90c8',null,20);for(let i=0;i<8;i++){const a=i/8*6.28;C_(.12,.5,6,Math.cos(a)*6,4,Math.sin(a)*6,'#e8f4ff')}C_(.3,1.2,10,0,6,0,'#e8f4ff')}
  if(at(2348,-42,56)){const g=athUV(new THREE.BoxGeometry(100,46,20),100,46,20);g.translate(0,23,0);P_(g,'#ffffff',MAT.athB);B_(102,2,22,0,47,0,'#eeeeee')}
  if(at(3099,943,20)){B_(28,112,28,0,56,0,'#36506c',MAT.athG);B_(30,3,30,0,113,0,'#202830');B_(22,60,22,40,30,30,'#4a6480',MAT.athG)}
  if(at(2512,553,45)){B_(80,14,50,0,7,0,'#efe9dc',MAT.athM);B_(40,4,30,0,16,0,'#d8d0c0')}
  if(at(6380,5010,14)){B_(14,11,24,0,5.5,0,'#efe3c8');D_(5,0,11,0,'#b07a4a');B_(4,18,4,0,9,-14,'#efe3c8')}
  if(at(5175,2561,5)){C_(.2,.2,6,0,3,0,'#dddddd');B_(2.6,2.6,.3,0,6.4,0,'#0d5eaf')}
  if(at(4388,3111,9)){C_(4,5,16,0,8,0,'#f4f4f4',null,12);C_(4.2,4.2,3,0,17.5,0,'#d8302a',null,12);C_(2,4.2,3,0,20.5,0,'#2a2a2a',null,12)}
  parks.push([1079,-250,190],[1079,-60,120],[1552,643,0]);
  lb.flush(ROOT);athMountains()}
function athMountains(){const G=ATHG,cx=(G.x0+G.x1)/2,cz=(G.z0+G.z1)/2,Rr=Math.max(G.x1-G.x0,G.z1-G.z0)/2+3200,n=160,pos=[],idx=[];
  const B=[[-15,38,330],[62,16,300],[105,32,400],[150,20,170],[190,26,210],[20,10,180]],ad=(a,b)=>{let d=(a-b)%360;if(d<-180)d+=360;if(d>180)d-=360;return d};
  for(let i=0;i<=n;i++){const a=i/n*Math.PI*2,deg=a*180/Math.PI;let h=26+18*Math.sin(a*9)+10*Math.sin(a*23);for(const[c,w,hh]of B)h+=hh*Math.exp(-((ad(deg,c)/w)**2));const x=cx+Math.cos(a)*Rr,z=cz-Math.sin(a)*Rr;pos.push(x,-60,z,x,h,z);if(i<n){const q=i*2;idx.push(q,q+1,q+2,q+1,q+3,q+2)}}
  MAT.athMtn=new THREE.MeshBasicMaterial({color:0x8a96a8,fog:false,side:THREE.DoubleSide});const m=new THREE.Mesh(geo(pos,null,idx),MAT.athMtn);m.frustumCulled=false;m.renderOrder=-.5;ROOT.add(m);applyMoodMaterials()}
function athGround(){const G=ATHG,pos=[],uv=[],idx=[],c=G.c,nx=G.nx,nz=G.nz;
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=G.x0+i*c,z=G.z0+j*c;pos.push(x,G.H[j*nx+i],z);uv.push(x/150,-z/150)}
  const pits=TF.jumps.filter(j=>j.kind==='pit'),gapTest=(y,i)=>y<-1||pits.some(gl=>i*TF.ds>=gl.s0-10&&i*TF.ds<=gl.s1+10);
  for(let j=0;j<nz-1;j++)for(let i=0;i<nx-1;i++){const a=j*nx+i;idx.push(a,a+nx,a+1,a+1,a+nx,a+nx+1)}
  // flat skirt out to the horizon
  const E=9000,b=pos.length/3;for(const[x,z]of[[G.x0-E,G.z0-E],[G.x1+E,G.z0-E],[G.x1+E,G.z1+E],[G.x0-E,G.z1+E],[G.x0,G.z0],[G.x1,G.z0],[G.x1,G.z1],[G.x0,G.z1]]){pos.push(x,0,z);uv.push(x/150,-z/150)}
  for(const[o0,o1,i0,i1]of[[0,1,4,5],[1,2,5,6],[2,3,6,7],[3,0,7,4]])idx.push(b+o0,b+i0,b+o1,b+o1,b+i0,b+i1);
  const[t,e]=athGroundTex();{const gm=new THREE.Mesh(geo(pos,uv,idx),new THREE.MeshStandardMaterial({map:t,emissiveMap:e,emissive:0xffffff,emissiveIntensity:.9,roughness:.92,metalness:0}));gm.name='athGround';ROOT.add(gm)}
  const deep=new THREE.Mesh(new THREE.PlaneGeometry(9000,9000),new THREE.MeshBasicMaterial({color:0x2a241c}));deep.rotation.x=-Math.PI/2;deep.position.set((G.x0+G.x1)/2,-40,(G.z0+G.z1)/2);ROOT.add(deep);
  trains=[];const pm=new THREE.MeshStandardMaterial({color:0x9a9284,roughness:.8});for(const gl of pits)buildPit(gl,pm)}
function athCity(){CITY=[];const bt=new Batch(),G=ATHG,rnd=mul(TRK.id.charCodeAt(0)*977+TRK.id.length),r2=(a,b)=>a+rnd()*(b-a),P=MAT.athP,kifi=TRK.id==='kifi';
  const TN=['#f6f3ec','#f6f3ec','#f3ede0','#efe3c8','#f1e6cf','#ece4d4','#e9d7b0','#f2dcc4','#e5e9ea'].map(c=>new THREE.Color(c)),NEO=['#e2b866','#e8c88a','#f0c8b0','#d9a77a','#efe3c8','#f2d4a0'].map(c=>new THREE.Color(c)),AW=['#3f8a4a','#e8822a','#2f7fd0','#c8643c','#d6337f'].map(c=>new THREE.Color(c)),
    ROOF=new THREE.Color('#c8643c'),POOL=new THREE.Color('#3aa8e0'),SGN={},WH=new THREE.Color('#f0f0f0'),PV=new THREE.Color('#2a3a5a'),CO=new THREE.Color('#f4efe4'),GL=new THREE.Color('#a8bccd');
  for(let gx=G.x0+24;gx<G.x1-24;gx+=36)for(let gz=G.z0+24;gz<G.z1-24;gz+=36){const x=gx+r2(-6,6),z=gz+r2(-6,6),w=r2(14,26),d=r2(14,26),rad=Math.hypot(w,d)/2,dt=nearestTrackDist(x,z,320);
    if(dt<rad+HALF+10||rnd()<.05)continue;if(Math.min(athH(x,z),athH(x-w/2,z-d/2),athH(x+w/2,z-d/2),athH(x-w/2,z+d/2),athH(x+w/2,z+d/2))<-1.5)continue;if(LANDMARKS.some(l=>(l.x-x)**2+(l.z-z)**2<(l.r+rad)**2))continue;
    const TH=TRK,neo=rnd()<(TH.neo??.18),office=!!TH.office&&dt<260&&rnd()<TH.office,villa=!!TH.villa&&dt>230&&!office,fl=office?8+Math.floor(rnd()*9):villa?2:neo?(TH.id==='synt'?3+Math.floor(rnd()*2):2+Math.floor(rnd()*2)):dt<170?5+Math.floor(rnd()*3):3+Math.floor(rnd()*4),h=fl*3.2+(neo?2.2:.8),y0=athH(x,z)-1.2;
    CITY.push({x,z,hw:w/2,hd:d/2,h});const g=athUV(new THREE.BoxGeometry(w,h,d),w,h,d);g.translate(x,y0+h/2,z);bt.add(colorize(g,office?GL:(neo?NEO:TN)[Math.floor(rnd()*(neo?NEO:TN).length)]),MAT.athB);
    if(neo){bt.add(colorize(athBox(w+1.2,.9,d+1.2,x,y0+h+.45,z),CO),P);const pg=new THREE.CylinderGeometry(.12,1,1,4);pg.rotateY(Math.PI/4);pg.scale(w*.72,3.4,d*.72);pg.translate(x,y0+h+2.6,z);bt.add(colorize(pg,ROOF),P)}
    else if(rnd()<.6){const a=r2(-w/4,w/4),b=r2(-d/4,d/4);bt.add(colorize(athBox(2.2,1.2,1.4,x+a,y0+h+.6,z+b),WH),P);bt.add(colorize(athBox(2.4,.15,1.7,x+a,y0+h+1.3,z+b+1.6),PV),P)}
    if(dt<160&&!office&&rnd()<.75){let bi=0,bd=1e9;const F4=[[0,d/2,w],[0,-d/2,w],[w/2,0,d],[-w/2,0,d]];F4.forEach(([fx,fz],q)=>{const dd=nearestTrackDist(x+fx*1.6,z+fz*1.6,330);if(dd<bd){bd=dd;bi=q}});const[fx,fz,L]=F4[bi],ox=Math.sign(fx)*1.3,oz=Math.sign(fz)*1.3;
      bt.add(colorize(athBox(fx?2.6:L*.86,.4,fx?L*.86:2.6,x+fx+ox,y0+4.6,z+fz+oz),AW[Math.floor(rnd()*AW.length)]),P);
      if(TH.neon&&h>12&&rnd()<.6){const key=Math.floor(rnd()*ATH_NEON.length),m=SGN[key]||(SGN[key]=new THREE.MeshBasicMaterial({map:vSignTex(...ATH_NEON[key]),toneMapped:false,color:new THREE.Color(1.6,1.6,1.6)})),pg=new THREE.PlaneGeometry(3.6,11);pg.rotateY(fz>0?0:fz<0?Math.PI:fx>0?Math.PI/2:-Math.PI/2);pg.translate(x+fx+ox*.4+(fz?(rnd()-.5)*L*.5:0),y0+Math.min(h-6,11),z+fz+oz*.4+(fx?(rnd()-.5)*L*.5:0));bt.add(pg,m)}}
    if(villa&&rnd()<.45)bt.add(colorize(athBox(w*.5,.3,d*.35,x,y0+1.3,z+d*.7),POOL),P)}
  bt.flush()}
function athDressing(){const td=TF,F=mkF(),rnd=mul(TRK.id.length*71+3),r2=(a,b)=>a+rnd()*(b-a),P=MAT.athP,G=ATHG;
  const tree=new TInst(athTreeBy(TRK.tree),P,700),cyp=new TInst(athCypGeo(),P,900),pine=new TInst(athPineGeo(),P,900),kio=new TInst(athKioskGeo(),P,900),taxi=new TInst(athTaxiGeo(),P,900),umb=new TInst(athUmbGeo(),P,900);
  const ok=(x,z,r)=>athH(x,z)>=-1.5&&nearestTrackDist(x,z,HALF+r+4)>=HALF+r&&!LANDMARKS.some(l=>!l.park&&(l.x-x)**2+(l.z-z)**2<(l.r+r)**2)&&!CITY.some(b=>Math.abs(b.x-x)<b.hw+r&&Math.abs(b.z-z)<b.hd+r);
  for(let s=10,k=0;s<td.L;s+=22,k++){if(inGapF(s)||inGapF(s+25)||inGapF(s-25))continue;frameAt(td,s,F);if(F.p.y<-1)continue;const ry=Math.atan2(F.t.x,F.t.z),sec=td.SEC[F.i]||'';
    for(const sd of[-1,1]){const o=HALF+r2(6,10),x=F.p.x+F.r.x*sd*o,z=F.p.z+F.r.z*sd*o;if(rnd()<.82&&ok(x,z,3))tree.add(x,athH(x,z)-.2,z,rnd()*6.28,r2(.85,1.2))}
    if(k%9===4){const sd=k%18<9?1:-1,o=HALF+15,x=F.p.x+F.r.x*sd*o,z=F.p.z+F.r.z*sd*o;if(ok(x,z,3))kio.add(x,athH(x,z),z,ry+(sd>0?-Math.PI/2:Math.PI/2),1)}
    if(k%4===2){const sd=k%8<4?-1:1,o=HALF+20,x=F.p.x+F.r.x*sd*o,z=F.p.z+F.r.z*sd*o;if(ok(x,z,3))taxi.add(x,athH(x,z),z,ry+(rnd()<.5?0:Math.PI),1)}
    if(k%3===0&&/PLAKA|MONASTIRAKI|THISEIO|KOLONAKI|ERMOU|LYSICRATES|SYNTAGMA|CHALANDRI|OMONIA|MITROPOL|SKOUFA/.test(sec)){const sd=k%6<3?1:-1;for(let q=0;q<3;q++){const o=HALF+r2(12,22),x=F.p.x+F.r.x*sd*o+F.t.x*r2(-9,9),z=F.p.z+F.r.z*sd*o+F.t.z*r2(-9,9);if(ok(x,z,2))umb.add(x,athH(x,z),z,rnd()*6,1,['#ffffff','#2f7fd0','#e8822a','#3f8a4a','#ffffff'][Math.floor(rnd()*5)])}}
    if(k%14===7){const sd=k%28<14?1:-1;for(let q=0;q<2;q++){const o=HALF+r2(26,40),x=F.p.x+F.r.x*sd*o+F.t.x*r2(-10,10),z=F.p.z+F.r.z*sd*o+F.t.z*r2(-10,10);if(ok(x,z,2))cyp.add(x,athH(x,z),z,0,r2(.8,1.2))}}}
  // parks: umbrella pines and cypresses in the National Garden, the Agora, Philopappou and around the landmarks
  for(const[e,n,R0]of G.parks){if(!R0)continue;const[cx,cz]=athW(TRK,e,n),Rr=R0*TRK.map[0];for(let i=0;i<Rr*Rr/260&&i<220;i++){const a=rnd()*6.28,rr2=Math.sqrt(rnd())*Rr,x=cx+Math.cos(a)*rr2,z=cz+Math.sin(a)*rr2;if(!ok(x,z,4))continue;(rnd()<.7?pine:cyp).add(x,athH(x,z)-.3,z,rnd()*6.28,r2(.8,1.25))}}
  athThemeDress(ok);for(const T of[tree,cyp,pine,kio,taxi,umb])T.flush(ROOT);
  // billboards with Athenian brands
  let bi=0;for(let s=380;s<td.L-150;s+=r2(420,620)){frameAt(td,s,F);if(F.p.y<-1||inGapF(s))continue;const side=bi%2?1:-1,br=ATH_BRANDS[bi%ATH_BRANDS.length];bi++;const off=HALF+r2(14,22),x=F.p.x+F.r.x*side*off,z=F.p.z+F.r.z*side*off;if(!ok(x,z,8))continue;
    const g=new THREE.Group();g.position.set(x,athH(x,z),z);const look=F.p.clone().addScaledVector(F.t,60);look.y=g.position.y;g.lookAt(look);ROOT.add(g);const bw=18,bh=9,y0=Math.max(8,F.p.y-g.position.y+6);
    for(const sx of[-.35,.35]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.7,y0,.7),MAT.dark);leg.position.set(sx*bw,y0/2,-.6);g.add(leg)}const face=new THREE.Mesh(new THREE.PlaneGeometry(bw,bh),new THREE.MeshBasicMaterial({map:billboardTex(br),toneMapped:false}));face.position.set(0,y0+bh/2,-.15);g.add(face);billboards.push(face);
    const fr=new THREE.Mesh(new THREE.BoxGeometry(bw+1,bh+1,.8),MAT.dark);fr.position.set(0,y0+bh/2,-.6);g.add(fr)}
  // underpass portals
  for(let i=1;i<td.N;i++){const y0=td.P[(i-1)*3+1],y1=td.P[i*3+1];if((y0>=-12)!==(y1>=-12)){const fr=frameAt(td,i*td.ds,mkF()),g=new THREE.Group();const top=new THREE.Mesh(new THREE.BoxGeometry(W+14,5,4),MAT.cap);top.position.y=21;g.add(top);for(const sd of[-1,1]){const pc=new THREE.Mesh(new THREE.BoxGeometry(2.6,24,3.4),MAT.cap);pc.position.set(sd*(HALF+7.6),9,0);g.add(pc)}
    const s2=new THREE.Mesh(new THREE.PlaneGeometry(22,3.6),new THREE.MeshBasicMaterial({map:textTex(TRK.tunnel||'ΥΠΟΓΕΙΑ','#ffd12c',512,96),side:THREE.DoubleSide,toneMapped:false}));s2.position.set(0,21,2.1);g.add(s2);placeOnTrack(g,fr,0);ROOT.add(g)}}
  // Greek flags at the start
  {const fm=new THREE.MeshStandardMaterial({map:athFlagTex(),side:THREE.DoubleSide,roughness:.8});for(const[s,sd]of[[26,-1],[26,1],[60,-1],[60,1]]){frameAt(td,s,F);if(F.p.y<-6)frameAt(td,-s,F);const x=F.p.x+F.r.x*sd*(HALF+5),z=F.p.z+F.r.z*sd*(HALF+5),y=Math.min(athH(x,z),F.p.y);const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=Math.atan2(F.t.x,F.t.z)+Math.PI/2;
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(.14,.18,16,6),MAT.cap);pole.position.y=8;g.add(pole);const fl=new THREE.Mesh(new THREE.PlaneGeometry(4.5,3),fm);fl.position.set(2.3,14.4,0);g.add(fl);ROOT.add(g)}}}

function athThemeDress(ok){const td=TF,F=mkF(),t=TRK,rnd=mul(t.id.length*13+5),r2=(a,b)=>a+rnd()*(b-a),P=MAT.athP;
  const sAt=(re,last)=>{let r=-1;for(let i=0;i<td.N;i+=3)if(re.test(td.SEC[i])){r=i*td.ds;if(!last)return r}return r};
  const arch=(s,txt,col)=>{if(s<0)return;frameAt(td,s,F);const g=new THREE.Group();for(const sd of[-1,1]){const c=new THREE.Mesh(new THREE.BoxGeometry(3.2,22,3.2),MAT.pylon);c.position.set(sd*(HALF+3),11,0);g.add(c);const fl=new THREE.Mesh(new THREE.ConeGeometry(1.3,3.6,8),neonMat('#ff8a2a',2.6));fl.position.set(sd*(HALF+3),24,0);g.add(fl)}
    const bm=new THREE.Mesh(new THREE.BoxGeometry(W+10,4,3),MAT.pylon);bm.position.y=21;g.add(bm);const sg=new THREE.Mesh(new THREE.PlaneGeometry(W+6,3.4),new THREE.MeshBasicMaterial({map:textTex(txt,col,1024,96),side:THREE.DoubleSide,toneMapped:false}));sg.position.set(0,21,1.6);g.add(sg);placeOnTrack(g,F,0);ROOT.add(g)};
  if(t.id==='akro'){const col=new TInst(athMerge([[new THREE.CylinderGeometry(1,1.15,11,8).translate(0,5.5,0),'#efe6d2'],[athBox(2.8,.9,2.8,0,11.4,0),'#e8dcc4']]),P,900),dr=new TInst(athMerge([[new THREE.CylinderGeometry(1.1,1.1,1.6,8).rotateZ(Math.PI/2).translate(0,1.1,0),'#e4dac6'],[athBox(2.4,.8,1.6,1.8,.4,1),'#ddd2bd']]),P,900);
    for(let s=0;s<td.L;s+=24){frameAt(td,s,F);if(inGapF(s)||!/AREOPAG|ODEON|DIONYSIOU|PROPYLAEA|THEORIAS|LYSICRATES|ACROPOLIS|PLAKA/.test(td.SEC[F.i]||''))continue;for(const sd of[-1,1]){if(rnd()<.3)continue;const o=HALF+r2(4.5,9),x=F.p.x+F.r.x*sd*o,z=F.p.z+F.r.z*sd*o;if(ok(x,z,2))(rnd()<.5?col:dr).add(x,athH(x,z)-.2,z,rnd()*6.28,r2(.8,1.15))}}
    col.flush(ROOT);dr.flush(ROOT);arch(sAt(/^PLAKA$/),'ΣΥΝΤΟΜΕΥΣΗ · PLAKA SHORTCUT ▶','#ffd12c')}
  if(t.id==='synt'){const[px,pz]=athW(t,936,-91),y=athH(px,pz),E=new TInst(athMerge([[new THREE.ConeGeometry(.75,1.1,8).translate(0,1.25,0),'#ffffff'],[athBox(.7,.9,.45,0,2.2,0),'#c8a050'],[athBox(.5,.5,.5,0,2.95,0),'#e8c0a0'],[athBox(.56,.26,.56,0,3.32,0),'#c82020'],[athBox(.18,1.1,.18,-.15,.55,0),'#ffffff'],[athBox(.18,1.1,.18,.15,.55,0),'#ffffff']]),P,900),Gb=new TInst(athMerge([[athBox(2,4,2,0,2,0),'#0d5eaf'],[new THREE.ConeGeometry(1.6,1.4,4).rotateY(Math.PI/4).translate(0,4.7,0),'#f4f1ea']]),P,900);
    for(const sd of[-1,1]){E.add(px,y,pz+sd*8,-Math.PI/2,2.2);Gb.add(px+2.5,y,pz+sd*12,0,1.6)}E.flush(ROOT);Gb.flush(ROOT)}
  if(t.id==='pana'){const ban=new TInst(athMerge([[athBox(.25,12,.25,0,6,0),'#d8d8d8'],[athBox(.1,6,2.4,0,8.4,1.25),'#ffffff']]),P,900),crowd=new TInst(athBox(.9,1.4,.8,0,.7,0),new THREE.MeshStandardMaterial({roughness:.8}),700),BC=['#0d5eaf','#ffffff','#d8b86a','#d8302a','#0d5eaf'],CC=['#0d5eaf','#ffffff','#e8822a','#d8302a','#f5d000','#2a2a2a'];
    for(let s=0,k=0;s<td.L;s+=30,k++){frameAt(td,s,F);if(inGapF(s)||F.p.y<-1)continue;const sec=td.SEC[F.i]||'',ry=Math.atan2(F.t.x,F.t.z);for(const sd of[-1,1]){const o=HALF+3.5,x=F.p.x+F.r.x*sd*o,z=F.p.z+F.r.z*sd*o;ban.add(x,athH(x,z),z,ry,1,BC[(k+(sd>0?2:0))%5]);
      if(/KALLIMARMARO|KONSTANTINOU|OLGAS|SYNTAGMA/.test(sec))for(let q=0;q<5;q++){const oo=HALF+r2(5,9),xx=F.p.x+F.r.x*sd*oo+F.t.x*r2(-12,12),zz=F.p.z+F.r.z*sd*oo+F.t.z*r2(-12,12);if(ok(xx,zz,1))crowd.add(xx,athH(xx,zz),zz,rnd()*6,1,CC[Math.floor(rnd()*6)])}}}
    ban.flush(ROOT);crowd.flush(ROOT);arch(sAt(/KALLIMARMARO/,1),'ΠΑΝΑΘΗΝΑΪΚΟ ΣΤΑΔΙΟ · KALLIMARMARO','#ffd12c')}}
// track hazards: marble drums in the old town, trams on the boulevards
let AHZ=[];
function athHazPlace(o){frameAt(TD,o.s,F2);o.m.position.copy(F2.p).addScaledVector(F2.r,o.x).addScaledVector(F2.u,o.kind==='drum'?1.7:2);o.m.quaternion.setFromRotationMatrix(_m.makeBasis(F2.r,F2.u,F2.t.clone().negate()))}
function athHazReset(){for(const o of AHZ){scene.remove(o.m);disposeTree(o.m)}AHZ=[];if(!TRK.city||!TRK.haz)return;const L=TD.L;
  if(TRK.haz==='drum'){const geo=new THREE.CylinderGeometry(1.7,1.7,2.4,12).rotateZ(Math.PI/2),mat=new THREE.MeshStandardMaterial({color:0xece4d2,roughness:.6});let n=0;
    for(let s=650;s<L-300&&n<8;s+=260){if(jumpAt(TD,s)||jumpAt(TD,s+60)||jumpAt(TD,s-80)||yAt(TD,s)<-2)continue;const x=rr(-MARGIN+3,MARGIN-3);for(let q=0;q<2;q++){const m=new THREE.Mesh(geo,mat);scene.add(m);const o={kind:'drum',s:s+q*8,x:clamp(x+rr(-4,4),-MARGIN+2,MARGIN-2),hw:2,hl:1.8,m,alive:true,t:0};AHZ.push(o);athHazPlace(o)}n++}}
  if(TRK.haz==='tram')for(let k=0;k<2;k++){const g=new THREE.Group(),bm=new THREE.MeshStandardMaterial({color:0xf2c200,roughness:.4}),wm=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.4}),gm=new THREE.MeshStandardMaterial({color:0x2a3440,roughness:.2,metalness:.5});
    const b=new THREE.Mesh(new THREE.BoxGeometry(3.2,2.4,26),bm);b.position.y=1.2;g.add(b);const u=new THREE.Mesh(new THREE.BoxGeometry(3.25,1.3,25),gm);u.position.y=3;g.add(u);const r=new THREE.Mesh(new THREE.BoxGeometry(3.2,.5,26),wm);r.position.y=3.9;g.add(r);const pa=new THREE.Mesh(new THREE.BoxGeometry(.2,2.6,2),gm);pa.position.y=5.4;pa.rotation.x=.5;g.add(pa);
    scene.add(g);const o={kind:'tram',s:L*(.3+.45*k),x:(k?1:-1)*(MARGIN-5*CR_LS),hw:1.8,hl:13,v:16,m:g,alive:true};AHZ.push(o);athHazPlace(o)}}
function athHazTick(){for(const o of AHZ){if(o.kind==='tram'){o.s+=o.v*H;athHazPlace(o)}else if(!o.alive&&(o.t-=H)<=0){o.alive=true;o.m.visible=true}}}
function athHazStep(s){if(s.tramCd>0)s.tramCd-=H;if(!AHZ.length||s.dead>0||s.air)return;for(const o of AHZ){if(!o.alive)continue;const dd=tdd(o.s,s.dist);if(Math.abs(dd)>o.hl+2||Math.abs(s.x-o.x)>o.hw+2.2)continue;
  if(o.kind==='drum'){o.alive=false;o.m.visible=false;o.t=14;s.v*=.84;if(s.isPlayer||near(s))debris(o.m.position.clone(),V3(0,6,0),8,[new THREE.Color('#efe9dc'),new THREE.Color('#d8cfbc')],.9,o.m.position.y-1.5);if(s.isPlayer){award(s,'MARBLE SMASH',4,150,'#efe9dc');AU.sfx('crash')}}
  else if(!(s.tramCd>0)){s.tramCd=.8;s.v=Math.min(s.v,o.v+8);s.x=clamp(o.x+Math.sign(s.x-o.x||1)*(o.hw+3),-MARGIN,MARGIN);damage(s,8/s.stats.hull);if(s.isPlayer){feed('TRAM!',0,'#f2c200');AU.sfx('crash');shake=Math.max(shake,.5)}}}}
// fireworks over the Kallimarmaro on every lap of the finale, a big show at the finish
function athFire(big){let at;if(TRK.stadium){const[x,z]=athW(TRK,...TRK.stadium);at=V3(x,athH(x,z)+55,z)}else{frameAt(TF,0,F2);at=F2.p.clone();at.y+=50}const C=['#ff3050','#ffd12c','#5dffb0','#22a0ff','#ffffff','#ff7ac0'],n=big?8:3;
  for(let k=0;k<n;k++)setTimeout(()=>{if(!TRK.fire)return;const p=at.clone().add(V3(rr(-70,70),rr(-10,30),rr(-70,70)));burst(SPARK,p,60,34,1.4,new THREE.Color(C[Math.floor(R()*C.length)]).multiplyScalar(3));burst(SPARK,p,24,16,1,new THREE.Color(3,3,2.6))},k*330)}

/* ============================================================ 7 · ships (lofted superellipse hull) */
function loft(secs,{seg=24,n=2.4,hb=.5}={}){const pos=[],uv=[],idx=[];const z0=secs[0][0],z1=secs[secs.length-1][0];
  secs.forEach(([z,w,h,y=0])=>{for(let k=0;k<=seg;k++){const a=k/seg*Math.PI*2,c=Math.cos(a),s=Math.sin(a);const px=w*Math.sign(c)*Math.abs(c)**(2/n);let py=h*Math.sign(s)*Math.abs(s)**(2/n);if(py<0)py*=hb;pos.push(px,py+y,z);uv.push(k/seg,(z-z0)/(z1-z0))}});
  for(let i=0;i<secs.length-1;i++)for(let k=0;k<seg;k++){const a=i*(seg+1)+k,b=a+seg+1;idx.push(a,a+1,b,a+1,b+1,b)}
  return geo(pos,uv,idx)}
const HULL=[[-7,.03,.03],[-6.2,.3,.22],[-4.6,.7,.42],[-2.6,1.05,.6,.08],[-.2,1.3,.72,.12],[2.2,1.35,.68],[4,1.05,.55],[4.9,.7,.4]];
const POD=[[0,.05,.05],[.6,.36,.3],[2.5,.46,.38],[4.6,.42,.36],[5.2,.38,.32]];
const SHIP_K=.6;
const RIBBON_VS='attribute float l;attribute float e;varying float vL;varying float vE;void main(){vL=l;vE=e;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}';
const RIBBON_FS='uniform vec3 uCore;uniform vec3 uCol;uniform float uT;uniform float uA;varying float vL;varying float vE;void main(){float e=clamp(vE,0.,1.),l=clamp(vL,0.,1.);float a=pow(e,1.5)*pow(1.-l,1.35)*(.82+.18*sin(uT*70.+vL*18.))*uA;vec3 c=mix(uCore,uCol,smoothstep(0.,.35,l));gl_FragColor=vec4(c*a*2.2,a);}';
function ribbonGeo(){const pos=[],l=[],e=[],idx=[];const segs=12;for(const plane of[0,1])for(let i=0;i<=segs;i++){const t=i/segs,w=.5*(1+t*.5);for(const s of[-1,0,1]){pos.push(plane?0:s*w,plane?s*w:0,t);l.push(t);e.push(1-Math.abs(s))}}
  for(let p2=0;p2<2;p2++){const base=p2*(segs+1)*3;for(let i=0;i<segs;i++)for(let k=0;k<2;k++){const a=base+i*3+k,b=a+3;idx.push(a,b,a+1,a+1,b,b+1)}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('l',new THREE.Float32BufferAttribute(l,1));g.setAttribute('e',new THREE.Float32BufferAttribute(e,1));g.setIndex(idx);return g}
const RIB_GEO=ribbonGeo();
const LIVERY={};
const WHEEL=new THREE.CylinderGeometry(1.45,1.45,1.05,16).rotateZ(Math.PI/2),RIM=new THREE.CylinderGeometry(.55,.55,.1,12).rotateZ(Math.PI/2),WHEELMAT=new THREE.MeshStandardMaterial({color:0x15161c,roughness:.85}),PONTOON=new THREE.CylinderGeometry(.62,.5,6.2,12).rotateX(Math.PI/2),FIN=new THREE.BoxGeometry(.25,.7,1.2),_tipV=new THREE.Vector3(),_tipC=new THREE.Color(),WINGMAT={},WINGGEO=new THREE.BoxGeometry(4.6,.14,1.9),WINGTIP=new THREE.BoxGeometry(.5,.5,2.6),GLOWTIP=new THREE.MeshBasicMaterial({color:new THREE.Color(2.4,2.4,2.6)});
// brick-built alternates: the craft rebuilds itself as a speedboat on water and a fly-ship in the air (LEGO 2K style)
const VMAT={};function vmat(team){return VMAT[team.id]||(VMAT[team.id]={a:new THREE.MeshStandardMaterial({color:team.a,roughness:.32,metalness:.15}),b:new THREE.MeshStandardMaterial({color:team.b,roughness:.4,metalness:.2}),
  c:new THREE.MeshStandardMaterial({color:team.c,roughness:.35}),gl:new THREE.MeshStandardMaterial({color:team.glow,emissive:new THREE.Color(team.glow),emissiveIntensity:.5,transparent:true,opacity:.6,roughness:.1}),dk:new THREE.MeshStandardMaterial({color:0x14161e,roughness:.6}),ne:neonMat(team.glow,1.2)})}
const STUD=new THREE.CylinderGeometry(.42,.42,.36,12);
function studs(g,mat,pts,y){for(const[x,z]of pts){const s=new THREE.Mesh(STUD,mat);s.position.set(x,y,z);g.add(s)}}
function box(g,mat,w,h,d,x,y,z,rx=0,ry=0,rz=0){const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);b.position.set(x,y,z);b.rotation.set(rx,ry,rz);g.add(b);return b}
function buildBoat(team,carG){const g=new THREE.Group(),M=vmat(team);let body=null;carG.traverse(o=>{if(!body&&o.isMesh&&o.material&&o.material.map)body=o.material});body=body||M.a;
  // V-hull in the ship's own livery under the craft, neon waterline, twin water-jet nozzles: the same craft, rebuilt to float
  const hull=new THREE.Mesh(new THREE.CylinderGeometry(4.4,4.4,13,3,1).rotateX(Math.PI/2).rotateZ(Math.PI),body);hull.scale.set(1,.55,1);hull.position.set(0,-2.2,1.2);g.add(hull);
  const bow=new THREE.Mesh(new THREE.ConeGeometry(3.8,4.2,3).rotateX(-Math.PI/2).rotateZ(Math.PI),body);bow.scale.set(1,.55,1);bow.position.set(0,-2.2,-7.4);g.add(bow);
  for(const sd of[-1,1]){box(g,M.ne,.16,.2,12.4,sd*3.75,-1.15,1.2);const jet=new THREE.Mesh(new THREE.CylinderGeometry(.55,.75,1.6,12).rotateX(Math.PI/2),M.dk);jet.position.set(sd*1.6,-2.2,8);g.add(jet);const ring=new THREE.Mesh(new THREE.TorusGeometry(.6,.14,6,14),M.ne);ring.position.set(sd*1.6,-2.2,8.8);g.add(ring)}
  g.name='boat';return g}
// transformation: hull panels and wheel arms fold out of the ship one after another (easeOutBack), with a brick burst + build sound
const easeBack=k=>{const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(k-1,3)+c1*Math.pow(k-1,2)};
function poseInit(grp,fold){grp.children.forEach((c,i)=>{c.userData.p1=c.position.clone();c.userData.s1=c.scale.clone();c.userData.p0=fold(c.position.clone());c.userData.ix=i/Math.max(1,grp.children.length-1)})}
function poseApply(grp,v){grp.visible=v>.001;if(!grp.visible)return;for(const c of grp.children){const u=c.userData;if(!u.p1)continue;const k=clamp(v*1.7-u.ix*.7,0,1),f=k<=0?0:easeBack(k);c.position.lerpVectors(u.p0,u.p1,f);c.scale.copy(u.s1).multiplyScalar(Math.max(.04,f))}}
function vehMode(s,dt){const ud=s.mesh.userData;if(!ud.carG)return;if(!ud.posed){poseInit(ud.boat,p=>p.set(p.x*.25,p.y+1.8,p.z*.5));poseInit(ud.wheels,p=>p.set(p.x*.3,p.y+1.3,p.z*.6));ud.posed=true}
  const want=s.boatMode?'boat':s.dirtMode?'4x4':'car';
  if(want!==(s.vmode||'car')){s.vmode=want;if(s.isPlayer||near(s)){const at=s.mesh.position.clone();at.y+=1.4;debris(at,V3(0,6,0),10,teamCols(s.team),.4,at.y-4);burst(SPARK,at,24,14,.35,new THREE.Color(2,1.8,1));if(s.isPlayer){AU.sfx('brick');say('',want==='boat'?'BOAT':want==='4x4'?'4×4':'CAR',.6)}}}
  const rt=dt*6.5;s.bt=clamp((s.bt||0)+(s.vmode==='boat'?rt:-rt),0,1);s.wt=clamp((s.wt||0)+(s.vmode==='4x4'?rt:-rt),0,1);
  poseApply(ud.boat,s.bt);poseApply(ud.wheels,s.wt);ud.carG.position.y=.6*s.bt+.35*s.wt;ud.under.visible=s.bt<.5&&!(ud.gbHid&&ud.gbHid.length);for(const rb of ud.ribbons)rb.visible=s.bt<.5&&!(ud.gbHid&&ud.gbHid.length);if(ud.gbV)CR_vis(s,ud)}
function shipMesh(team){const g=new THREE.Group(),m=new THREE.Group();g.add(m);m.scale.setScalar(SHIP_K);
  // night paint: the livery glows faintly so team colours read against the dark city, clearcoat picks up the neon
  const TT=LIVERY[team.id]||(LIVERY[team.id]=(()=>{const o={l:liveryTex(team),w:wingTex(team)};KEEP_TEX.add(o.l);KEEP_TEX.add(o.w);KEEP_TEX.add(o.l.source);KEEP_TEX.add(o.w.source);try{renderer.initTexture(o.l);renderer.initTexture(o.w)}catch(e){}return o})()),lv=TT.l,wt=TT.w;
  const paint=new THREE.MeshPhysicalMaterial({map:lv,emissiveMap:lv,emissive:0xffffff,emissiveIntensity:.42,metalness:.12,roughness:.34,clearcoat:1,clearcoatRoughness:.08,envMapIntensity:2.2});
  const wingM=new THREE.MeshPhysicalMaterial({map:wt,emissiveMap:wt,emissive:0xffffff,emissiveIntensity:.36,metalness:.12,roughness:.34,clearcoat:1,clearcoatRoughness:.08,envMapIntensity:2.2,side:THREE.DoubleSide});
  const trim=new THREE.MeshStandardMaterial({color:team.b,emissive:new THREE.Color(team.b).multiplyScalar(.28),metalness:.4,roughness:.35,envMapIntensity:2});const dark=new THREE.MeshStandardMaterial({color:0x1a1d30,emissive:0x07080f,metalness:.6,roughness:.4,envMapIntensity:2});
  m.add(new THREE.Mesh(loft(HULL,{n:2.4,hb:.5}),paint));
  const wing=new THREE.Shape();wing.moveTo(.9,-1.6);wing.lineTo(5.9,2.9);wing.lineTo(5.9,4.1);wing.lineTo(1.1,4.3);wing.lineTo(-1.1,4.3);wing.lineTo(-5.9,4.1);wing.lineTo(-5.9,2.9);wing.lineTo(-.9,-1.6);wing.closePath();
  const wg=new THREE.ExtrudeGeometry(wing,{depth:.16,bevelEnabled:true,bevelThickness:.05,bevelSize:.06,bevelSegments:1});wg.rotateX(Math.PI/2);wg.translate(0,.02,0);const uv=wg.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/12+.5,uv.getY(i)/6);m.add(new THREE.Mesh(wg,wingM));
  const can=new THREE.Shape();can.moveTo(.7,-4.2);can.lineTo(2.1,-3.1);can.lineTo(2.1,-2.7);can.lineTo(.7,-2.8);const cg=new THREE.ExtrudeGeometry(can,{depth:.1,bevelEnabled:false});cg.rotateX(Math.PI/2);cg.translate(0,.2,0);const cm2=new THREE.Mesh(cg,trim);m.add(cm2);const cm3=cm2.clone();cm3.scale.x=-1;m.add(cm3);
  const parts=[];for(const sd of[-1,1]){const pod=new THREE.Mesh(loft(POD,{n:2.2,hb:.8,seg:16}),trim);pod.position.set(sd*3.05,-.36,-.3);m.add(pod);
    const fin=new THREE.Mesh(new THREE.BoxGeometry(.14,1.9,1.9),paint);fin.position.set(sd*5.8,.9,3.4);fin.rotation.x=-.25;m.add(fin);parts.push(fin,pod);
    const nav=new THREE.Mesh(new THREE.SphereGeometry(.16,8,6),neonMat(sd<0?'#ff3b55':'#5dffb0',3));nav.position.set(sd*5.95,.05,3);m.add(nav)}
  const ck=new THREE.Mesh(new THREE.SphereGeometry(1,20,14),new THREE.MeshPhysicalMaterial({color:0x0b2a44,metalness:.9,roughness:.04,clearcoat:1,envMapIntensity:1.6}));ck.scale.set(.62,.4,1.6);ck.position.set(0,.74,-1.7);m.add(ck);
  const sp=new THREE.Mesh(new THREE.BoxGeometry(.5,.35,3.2),dark);sp.position.set(0,.7,1.4);m.add(sp);
  // nozzles: two pods + the hull tail, each with a hot core, a flare sprite and a crossed thrust ribbon
  const noz=[[-3.05,-.36,4.95,.36],[3.05,-.36,4.95,.36],[0,.02,4.95,.5]],ribbons=[],flares=[];
  for(const[x,y,z,r]of noz){const cyl=new THREE.Mesh(new THREE.CylinderGeometry(r*1.15,r*1.2,.6,14,1,true),dark);cyl.rotation.x=Math.PI/2;cyl.position.set(x,y,z);m.add(cyl);
    const core=new THREE.Mesh(new THREE.CircleGeometry(r,14),neonMat(team.glow,3));core.position.set(x,y,z+.25);m.add(core);
    const fl=new THREE.Sprite(new THREE.SpriteMaterial({map:FLARE,color:glowCol(team.glow,2.5),blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));fl.position.set(x,y,z+.5);fl.scale.set(2,2,1);m.add(fl);flares.push(fl);
    const rb=new THREE.Mesh(RIB_GEO,new THREE.ShaderMaterial({vertexShader:RIBBON_VS,fragmentShader:RIBBON_FS,uniforms:{uCore:{value:new THREE.Color('#ffffff')},uCol:{value:new THREE.Color(team.trail)},uT:{value:0},uA:{value:1}},transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,toneMapped:false}));
    rb.position.set(x,y,z+.3);rb.scale.set(r*2,r*2,4);rb.frustumCulled=false;m.add(rb);ribbons.push(rb)}
  const under=new THREE.Mesh(new THREE.PlaneGeometry(9,12),new THREE.MeshBasicMaterial({map:GLOW,color:glowCol(team.glow,.8),transparent:true,opacity:.3,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));under.rotation.x=-Math.PI/2;under.position.y=-.1;g.add(under);
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(8,10),new THREE.MeshBasicMaterial({map:SHADOW,transparent:true,depthWrite:false,opacity:.8}));shadow.rotation.x=-Math.PI/2;g.add(shadow);
  const shield=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),new THREE.MeshBasicMaterial({color:glowCol('#31f5c4',1.2),transparent:true,opacity:.14,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));shield.scale.set(4.2,2.4,5.4);shield.position.y=.3;shield.visible=false;g.add(shield);
  for(const k of (team.kits||(team.kit?[team.kit]:[])))kitParts(k,m,paint,trim,dark,team);const carG=new THREE.Group();while(m.children.length)carG.add(m.children[0]);m.add(carG);
  const boat=buildBoat(team,carG);boat.visible=false;m.add(boat);
  const wheels=new THREE.Group();for(const[wx,wz]of[[-3.3,2.4],[3.3,2.4],[-3.3,-2.6],[3.3,-2.6]]){const wh=new THREE.Mesh(WHEEL,WHEELMAT);wh.position.set(wx,-.55,wz);const rim=new THREE.Mesh(RIM,GLOWTIP);rim.position.x=wx>0?.36:-.36;wh.add(rim);wheels.add(wh)}{const M=vmat(team);for(const z of[-.6,1.6]){const bar=new THREE.Mesh(new THREE.TorusGeometry(2.6,.18,6,16,Math.PI),M.c);bar.position.set(0,1.4,z);wheels.add(bar)}for(const sd of[-1,1]){const lamp=new THREE.Mesh(new THREE.BoxGeometry(.6,.4,.3),GLOWTIP);lamp.position.set(sd*1.2,3.9,-.6);wheels.add(lamp)}}wheels.scale.setScalar(.001);wheels.visible=false;m.add(wheels);
  g.userData={m,ribbons,flares,under,shadow,shield,parts,carG,boat,wheels};return g}

