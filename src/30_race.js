/* ============================================================ 8 · traffic */
// sedan, Frankfurt ivory taxi, van, container truck: modelled hover cars, instanced per material
const TRT=[{len:5,wid:2.5,h:1.4,kind:'car'},{len:5,wid:2.5,h:1.4,kind:'taxi'},{len:7,wid:2.8,h:2.2,kind:'van'},{len:13,wid:3.3,h:3.3,kind:'truck'}];
const TRPAINT=['#2c3446','#5a2230','#1f4a44','#3a3a48','#6a5226','#20304a','#8a8f99','#b9bec8','#14161f'];
const TRNEON=['#ff2d95','#22e4ff','#ffd12c','#8c55ff','#5dffb0'];
const LANES=[-16,-5.5,5.5,16];
const TMAX=48;let traffic=[],TRM=[],trLights,trShadow,trGlow;
const _tq=new THREE.Quaternion(),_ts=V3(),_te=new THREE.Euler();
const bxg=(w,h,d,x,y,z,rx=0)=>{const g=new THREE.BoxGeometry(w,h,d);if(rx)g.rotateX(rx);g.translate(x,y,z);return g};
const cyg=(r1,r2,h,x,y,z,n=10)=>{const g=new THREE.CylinderGeometry(r1,r2,h,n);g.translate(x,y,z);return g};
const lampG=(g,c)=>colorize(g,new THREE.Color(...c));
function carParts(k){try{const q=CR_trParts(k);if(q)return q}catch(e){console.warn('CR traffic',e)}finally{CR_LO=0;CR_G=null;CR_W=null}const P={body:[],glass:[],lamp:[],neon:[]},pods=(x,z,y=.16)=>{for(const sx of[-1,1])for(const sz of[-1,1]){P.body.push(cyg(.34,.28,.32,sx*x,y,sz*z));P.neon.push(cyg(.27,.27,.03,sx*x,y-.17,sz*z))}};
  if(k<2){P.body.push(loft([[-2.5,.75,.16,.62],[-2.3,1.12,.3,.6],[-1.5,1.24,.36,.62],[1.5,1.24,.36,.64],[2.3,1.14,.3,.64],[2.5,.8,.18,.64]],{seg:20,n:3.2,hb:1}));
    P.glass.push(loft([[-1.3,.86,.04,.98],[-.7,1.0,.32,1.0],[.8,1.0,.3,1.0],[1.5,.85,.04,.98]],{seg:16,n:2.6,hb:.2}));pods(.95,1.6);
    P.lamp.push(lampG(bxg(1.9,.1,.08,0,.66,-2.49),[2.4,2.3,2]),lampG(bxg(2,.12,.08,0,.7,2.49),[2.4,.12,.16]));for(const sx of[-1,1])P.neon.push(bxg(.06,.07,3.8,sx*1.24,.36,0));
    if(k===1){P.lamp.push(lampG(bxg(.95,.3,.42,0,1.44,.15),[2.4,2,.7]));P.body.push(bxg(.08,.16,3.2,1.25,.72,0),bxg(.08,.16,3.2,-1.25,.72,0))}}
  else if(k===2){P.body.push(loft([[-3.5,.95,.3,.75],[-3.3,1.34,.55,.85],[-2.4,1.4,.95,1.2],[3.4,1.4,.95,1.2],[3.5,1.3,.9,1.2]],{seg:20,n:4,hb:1}));
    P.glass.push(bxg(2.5,.75,.06,0,1.62,-2.58,-.38));for(const sx of[-1,1])P.glass.push(bxg(.05,.55,1.1,sx*1.41,1.6,-1.95));pods(1.05,2.6);
    P.lamp.push(lampG(bxg(2.2,.14,.08,0,.9,-3.49),[2.4,2.3,2]),lampG(bxg(2.4,.16,.08,0,1.05,3.49),[2.4,.12,.16]));for(const sx of[-1,1])P.neon.push(bxg(.05,.12,5.4,sx*1.42,1.25,.7))}
  else{P.body.push(loft([[-6.5,1.2,.5,1.2],[-6.25,1.6,1.1,1.7],[-3.3,1.6,1.1,1.7]],{seg:20,n:4,hb:1}),bxg(3.2,3.0,9.4,0,1.85,1.55),bxg(3.3,.25,9.6,0,.42,1.55));
    P.glass.push(bxg(2.9,.85,.06,0,2.25,-6.33,-.3));pods(1.3,4.8);pods(1.3,1.2);
    P.lamp.push(lampG(bxg(2.6,.16,.1,0,1.15,-6.5),[2.4,2.3,2]),lampG(bxg(3,.18,.1,0,.8,6.3),[2.4,.12,.16]));for(let i=-2;i<=2;i++)P.lamp.push(lampG(bxg(.2,.12,.1,i*.6,3.38,-3.12),[2.4,1.3,.2]));
    for(const sx of[-1,1])P.neon.push(bxg(.05,.55,8.2,sx*1.62,2.35,1.6))}
  const out={};for(const key in P){const gs=P[key].map(g=>{g=g.index?g:g;for(const n of Object.keys(g.attributes))if(!['position','normal','uv','color'].includes(n))g.deleteAttribute(n);if(key==='lamp'&&!g.attributes.color)colorize(g,new THREE.Color(1,1,1));if(key!=='lamp'&&g.attributes.color)g.deleteAttribute('color');return g.index?g.toNonIndexed():g});out[key]=mergeGeometries(gs)}return out}
function buildTrafficMeshes(){const mats={body:new THREE.MeshPhysicalMaterial({color:0xffffff,vertexColors:true,roughness:.3,metalness:0,clearcoat:.8,clearcoatRoughness:.1,envMapIntensity:1.3}),glass:new THREE.MeshStandardMaterial({color:0x0b1522,roughness:.06,metalness:.9,envMapIntensity:2.2,emissive:0x0a1a2a}),
    lamp:new THREE.MeshBasicMaterial({vertexColors:true,toneMapped:false}),neon:new THREE.MeshBasicMaterial({color:0xffffff,toneMapped:false})};
  _m.makeScale(0,0,0);for(let k=0;k<TRT.length;k++){const g=carParts(k),o={};for(const key in g){const im=new THREE.InstancedMesh(g[key],mats[key],TMAX);im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);im.frustumCulled=false;for(let i=0;i<TMAX;i++){im.setMatrixAt(i,_m);if(key==='body'||key==='neon')im.setColorAt(i,new THREE.Color(1,1,1))}scene.add(im);o[key]=im}TRM.push(o)}
  const pg=new THREE.PlaneGeometry(1,1);pg.rotateX(-Math.PI/2);
  trShadow=new THREE.InstancedMesh(pg,new THREE.MeshBasicMaterial({map:SHADOW,transparent:true,opacity:.75,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}),TMAX);
  trGlow=new THREE.InstancedMesh(pg,new THREE.MeshBasicMaterial({map:GLOW,transparent:true,opacity:.5,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-3}),TMAX);
  for(const im of[trShadow,trGlow]){im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);im.frustumCulled=false;for(let i=0;i<TMAX;i++){im.setMatrixAt(i,_m);if(im===trGlow)im.setColorAt(i,new THREE.Color(1,1,1))}scene.add(im)}
  const lp=new Float32Array(TMAX*4*3),lc=new Float32Array(TMAX*4*3);for(let i=0;i<TMAX;i++)lc.set([2.5,2.5,2.3,2.5,2.5,2.3,2.5,.2,.25,2.5,.2,.25],i*12);
  const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.BufferAttribute(lp,3));lg.setAttribute('color',new THREE.BufferAttribute(lc,3));
  trLights=new THREE.Points(lg,new THREE.PointsMaterial({size:2.4,vertexColors:true,map:GLOW,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));trLights.frustumCulled=false;scene.add(trLights)}
function pickType(){const t=R()*20;return t<9?0:t<12?1:t<17?2:3}
function placeTraffic(c,from,spread){for(let k=0;k<20;k++){c.dist=from+rr(spread[0],spread[1]);if(!jumpAt(TD,c.dist)&&!jumpAt(TD,c.dist+60))break}
  c.lane=Math.floor(R()*4);c.x=c.tx=LANES[c.lane]*CR_LS;c.v=rr(.3,.48)*BASE_TOP*cls.mul;c.wreck=null;c.laneT=rr(3,9);c.prev=null}
function setupTraffic(n){traffic=[];_m.makeScale(0,0,0);for(const o of TRM)for(const key in o){for(let i=0;i<TMAX;i++)o[key].setMatrixAt(i,_m);o[key].instanceMatrix.needsUpdate=true}for(const im of[trShadow,trGlow]){for(let i=0;i<TMAX;i++)im.setMatrixAt(i,_m);im.instanceMatrix.needsUpdate=true}
  const col=new THREE.Color();for(let i=0;i<Math.min(n,TMAX);i++){const k=pickType(),c={i,k,...TRT[k]};c.paint=TRT[k].kind==='taxi'?'#d9cb9e':TRPAINT[Math.floor(R()*TRPAINT.length)];c.neon=TRNEON[Math.floor(R()*TRNEON.length)];
    TRM[k].body.setColorAt(i,col.set(c.paint));TRM[k].neon.setColorAt(i,col.set(c.neon).multiplyScalar(2.2));trGlow.setColorAt(i,col.set(c.neon));placeTraffic(c,0,[200,TD.L-120]);traffic.push(c)}
  for(const o of TRM){o.body.instanceColor.needsUpdate=true;o.neon.instanceColor.needsUpdate=true}trGlow.instanceColor.needsUpdate=true}
const hit2=(a,b,r)=>{const dx=a.x-b.x,dz=a.z-b.z;return dx*dx+dz*dz<r*r&&Math.abs(a.y-b.y)<6};
function chainHit(c){const w=c.wreck.p;for(const o of traffic){if(o===c||o.wreck||Math.abs(tdd(o.dist,c.dist))>70)continue;frameAt(TD,o.dist,F2);const q=F2.p.addScaledVector(F2.r,o.x);if(hit2(q,w,o.len/2+3))wreckTraffic(o,{v:c.v+20,x:c.x,chain:1},.9)}}
const tdd=(a,b)=>mod(a-b+TD.L/2,TD.L)-TD.L/2;
function stepTraffic(){const ref=pl||ships[0];
  for(const c of traffic){if(c.wreck){if(RC.jn&&c.wreck.t>1.4)chainHit(c);c.wreck.t-=H;if(c.wreck.t<=0&&ref)placeTraffic(c,ref.dist,[500,1500]);continue}
    c.dist+=c.v*H;c.laneT-=H;if(c.laneT<=0){c.laneT=rr(4,10);c.lane=clamp(c.lane+(R()<.5?-1:1),0,3);c.tx=LANES[c.lane]*CR_LS}
    c.x+=clamp(c.tx-c.x,-3*H,3*H);
    if(ref&&(jumpAt(TD,c.dist+40)||tdd(c.dist,ref.dist)<-260))placeTraffic(c,ref.dist,[500,1500])}}
const JVAL=[18000,24000,31000,62000];
function wreckTraffic(c,by,power){if(RC.jn&&state==='race'){const v=JVAL[c.k]*(by&&by.chain?1.25:1);RC.jn.cars++;RC.jn.value+=v;if(by&&by.chain)RC.jn.chain++;feed(by&&by.chain?'CHAIN':c.kind.toUpperCase(),Math.round(v/100),'#ffd12c')}
  else if(by&&by.isPlayer&&by.dead>0&&by.after>0){award(by,'AFTERTOUCH',10,600,'#ffd12c')}const f=frameAt(TD,c.dist,F2);const p=f.p.clone().addScaledVector(f.r,c.x).addScaledVector(f.u,1);
  const push=V3().copy(f.t).multiplyScalar(by.v*.6*power).addScaledVector(f.r,(c.x-by.x>=0?1:-1)*rr(8,18)).addScaledVector(V3(0,1,0),rr(10,22)*power);
  c.wreck={t:3,p,v:push,q:new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(f.r,f.u,f.t.clone().negate())),spin:V3(rr(-4,4),rr(-6,6),rr(-4,4))};
  burst(SPARK,p,28,30,.6,new THREE.Color(2,1.4,.6));burst(FIRE,p,14,14,.6,new THREE.Color(2,.8,.3));debris(p,push.clone().multiplyScalar(.5),c.kind==='truck'?14:8,[new THREE.Color(c.paint||'#555'),new THREE.Color(c.neon||'#22e4ff'),new THREE.Color('#22252f'),new THREE.Color('#0b1522')],c.kind==='truck'?1.3:.9,f.p.y+.2);puff(p,5,new THREE.Color(.1,.1,.12),3,14,1.8,.55,1.5,3)}
function drawTraffic(dt){const lp=trLights.geometry.attributes.position,one=_ts.set(1,1,1),gq=new THREE.Quaternion();
  for(const c of traffic){let pos,q,ground=null;const M=TRM[c.k];
    if(c.wreck){const w=c.wreck;w.v.y-=30*dt;w.p.addScaledVector(w.v,dt);if(w.p.y<-20)w.v.set(0,0,0);_te.set(w.spin.x*dt,w.spin.y*dt,w.spin.z*dt);w.q.multiply(_tq.setFromEuler(_te));pos=w.p;q=w.q}
    else{frameAt(TD,c.dist,F2);ground=F2.p.clone().addScaledVector(F2.r,c.x);pos=ground.clone().addScaledVector(F2.u,.95+Math.sin(c.dist*.05+c.i)*.12);_m.makeBasis(F2.r,F2.u,F2.t.clone().negate());q=new THREE.Quaternion().setFromRotationMatrix(_m);gq.copy(q)}
    _m.compose(pos,q,one);for(const key in M)M[key].setMatrixAt(c.i,_m);
    if(ground){_m.compose(ground.clone().addScaledVector(F2.u,.06),gq,_s2.set(c.wid*1.1,1,c.len*1.05));trShadow.setMatrixAt(c.i,_m);_m.compose(ground.clone().addScaledVector(F2.u,.09),gq,_s2.set(c.wid*2.4,1,c.len*1.5));trGlow.setMatrixAt(c.i,_m);c.gp=ground;c.fw=F2.t.clone()}
    else{_m.makeScale(0,0,0);trShadow.setMatrixAt(c.i,_m);trGlow.setMatrixAt(c.i,_m);c.gp=null}
    const up=V3(0,1,0).applyQuaternion(q),fw=V3(0,0,-1).applyQuaternion(q),rt=V3(1,0,0).applyQuaternion(q);
    for(let k=0;k<4;k++){const front=k<2,sd=k%2?1:-1;const p=pos.clone().addScaledVector(fw,(front?1:-1)*(c.len/2+.05)).addScaledVector(rt,sd*(c.wid/2-.45)).addScaledVector(up,c.kind==='truck'?(front?1.15:.8):c.kind==='van'?(front?.9:1.05):(front?.66:.7));lp.setXYZ(c.i*4+k,p.x,p.y,p.z)}}
  for(let i=traffic.length;i<TMAX;i++)for(let k=0;k<4;k++)lp.setXYZ(i*4+k,0,-999,0);
  for(const o of TRM)for(const key in o)o[key].instanceMatrix.needsUpdate=true;trShadow.instanceMatrix.needsUpdate=trGlow.instanceMatrix.needsUpdate=lp.needsUpdate=true}

/* ============================================================ 9 · particles */
// flying wreckage: instanced shards with gravity, bounce and spin
/* ---- Baustelle: roadworks you can smash (cones, striped barriers with amber lamps) ---- */
let props=[],PROP=null,propFeedT=0;
function arrowTex(){const[c,g]=cv(128,128);g.fillStyle='#111';g.fillRect(0,0,128,128);g.fillStyle='#ffb020';for(const[x,y]of[[20,20],[64,20],[108,20],[20,64],[64,64],[108,64],[20,108],[64,108],[108,108]]){g.beginPath();g.arc(x,y,9,0,7);g.fill()}
  g.strokeStyle='#ffd24a';g.lineWidth=10;g.beginPath();g.moveTo(92,64);g.lineTo(34,64);g.moveTo(54,40);g.lineTo(30,64);g.lineTo(54,88);g.stroke();return tex(c,false)}
function arrowGeo(){const panel=new THREE.PlaneGeometry(3.2,3.2);panel.translate(0,3.6,.14);const post=new THREE.BoxGeometry(3.6,1.6,1.2);post.translate(0,.8,-.4);post.deleteAttribute('uv');post.setAttribute('uv',new THREE.Float32BufferAttribute(new Array(post.attributes.position.count*2).fill(.02),2));
  const back=new THREE.BoxGeometry(3.4,3.4,.2);back.translate(0,3.6,0);back.deleteAttribute('uv');back.setAttribute('uv',new THREE.Float32BufferAttribute(new Array(back.attributes.position.count*2).fill(.02),2));return mergeGeometries([panel,post,back])}
function buildPropMeshes(){const cone=new THREE.ConeGeometry(.75,2,10,3);cone.translate(0,1,0);const cc=[],p=cone.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i);const w=y>.7&&y<1.35;cc.push(w?1.6:1,w?1.6:.32,w?1.6:.05)}cone.setAttribute('color',new THREE.Float32BufferAttribute(cc,3));
  const[c,g]=cv(128,32);g.fillStyle='#fff';g.fillRect(0,0,128,32);g.fillStyle='#e0101a';for(let x=-32;x<160;x+=32){g.beginPath();g.moveTo(x,32);g.lineTo(x+16,32);g.lineTo(x+32,0);g.lineTo(x+16,0);g.fill()}
  const board=new THREE.BoxGeometry(3.4,1.2,.2);board.translate(0,1.7,0);const legs=[-1.4,1.4].map(x=>{const l=new THREE.BoxGeometry(.14,1.6,.14);l.translate(x,.8,0);l.deleteAttribute('uv');l.setAttribute('uv',new THREE.Float32BufferAttribute(new Array(l.attributes.position.count*2).fill(.02),2));return l});
  const bar=mergeGeometries([board,...legs]);const N=160;
  PROP={cone:new THREE.InstancedMesh(cone,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.5,emissive:0x331100}),N),bar:new THREE.InstancedMesh(bar,new THREE.MeshStandardMaterial({map:tex(c),roughness:.45,emissive:0xffffff,emissiveMap:tex(c),emissiveIntensity:.35}),60),
    arrow:new THREE.InstancedMesh(arrowGeo(),new THREE.MeshBasicMaterial({map:arrowTex(),toneMapped:false,color:new THREE.Color(1.8,1.8,1.8)}),12),
    lamp:new THREE.InstancedMesh(new THREE.SphereGeometry(.2,8,6),new THREE.MeshBasicMaterial({color:glowCol('#ffb020',3),toneMapped:false}),60)};
  for(const k in PROP){const im=PROP[k];im.frustumCulled=false;_m.makeScale(0,0,0);for(let i=0;i<im.count;i++)im.setMatrixAt(i,_m);scene.add(im)}}
function propMatrix(o,show){if(!show){_m.makeScale(0,0,0)}else{const f=frameAt(TD,o.s,F2);_m.makeBasis(F2.r,F2.u,F2.t.clone().negate()).setPosition(F2.p.clone().addScaledVector(F2.r,o.x));if(o.kind==='arrow'&&o.flip<0)_m.multiply(new THREE.Matrix4().makeScale(-1,1,1))}PROP[o.kind].setMatrixAt(o.i,_m);PROP[o.kind].instanceMatrix.needsUpdate=true;
  if(o.kind==='bar'){if(show)_m.setPosition(_m.elements[12]+F2.u.x*1.9,_m.elements[13]+F2.u.y*1.9,_m.elements[14]+F2.u.z*1.9);PROP.lamp.setMatrixAt(o.i,_m);PROP.lamp.instanceMatrix.needsUpdate=true}}
function setupProps(){if(!PROP)return;for(const o of props)propMatrix(o,false);props=[];if(RC.type==='attract'&&false)return;const L=TD.L,want=Math.max(2,Math.round(L/2300));let ci=0,bi=0,ai=0,side=1,made=0;
  const clear=s=>{for(let d=-40;d<=200;d+=10){if(Math.abs(kAt(TD,s+d))>1/900||jumpAt(TD,s+d))return false}return !pads.some(p=>Math.abs(tdd(p.s,s+80))<130)&&yAt(TD,s)>-8};
  for(let s=420;s<L-260&&made<want;s+=40){if(!clear(s))continue;const e=side*(MARGIN-1);
    props.push({kind:'arrow',i:ai++,s:s-14,x:side*(MARGIN-2),hw:1.9,flip:side});for(let k=0;k<6;k++)props.push({kind:'cone',i:ci++,s:s+k*10,x:side*(MARGIN-(1+k*1.6)*CR_LS),hw:.9});
    for(let k=0;k<3;k++)for(const off of[2.2,5.4])props.push({kind:'bar',i:bi++,s:s+62+k*22,x:side*(MARGIN-off*CR_LS),hw:1.8});
    for(let k=0;k<5;k++)props.push({kind:'cone',i:ci++,s:s+130+k*11,x:side*(MARGIN-(9-k*1.7)*CR_LS),hw:.9});
    side=-side;made++;s+=Math.max(700,L/want-40)}
  for(const o of props){o.alive=true;propMatrix(o,true)}}
function stepProps(){athHazTick();if(!props.length)return;const ref=pl||ships[0];
  for(const o of props){if(!o.alive){if(ref&&tdd(o.s,ref.dist)<-260&&tdd(o.s,ref.dist)>-900){o.alive=true;propMatrix(o,true)}continue}
    for(const s of ships){if(s.dead>0||s.eliminated||s.air)continue;const dd=tdd(o.s,s.dist);if(dd<-3||dd>3)continue;if(Math.abs(s.x-o.x)>o.hw+2.2)continue;breakProp(o,s);break}}}
function breakProp(o,s){if(RC.jn&&state==='race')RC.jn.value+=4000;o.alive=false;propMatrix(o,false);const f=frameAt(TD,o.s,F2),at=F2.p.clone().addScaledVector(F2.r,o.x).addScaledVector(F2.u,1);
  const vel=F2.t.clone().multiplyScalar(s.v*.8).addScaledVector(F2.r,(o.x-s.x>=0?1:-1)*rr(4,10));const big=o.kind!=='cone';
  debris(at,vel,big?9:4,big?[new THREE.Color('#e0101a'),new THREE.Color('#ffffff'),new THREE.Color('#333'),new THREE.Color('#ffb020')]:[new THREE.Color(1,.32,.05),new THREE.Color(1,1,1)],big?1.5:1,F2.p.y+.1);
  burst(SPARK,at,big?18:6,24,.4,new THREE.Color(2,1.5,.7));if(big)emit(FIRE,at.clone().addScaledVector(F2.u,1),V3(0,4,0),.4,new THREE.Color(2.4,1.4,.2));
  s.v*=o.kind==='arrow'?.9:big?.95:.99;if(s.isPlayer){s.bm=Math.min(100,s.bm+(big?4:1.5));s.style+=big?60:20;if(raceT>propFeedT){feed('ROADWORKS',big?60:20,'#ffb46a');propFeedT=raceT+1.2}AU.sfx(big?'crash':'bump');shake=Math.max(shake,big?.35:.12)}}
// wet road: light sources smear into long reflections that point at the camera
let STK=null;const STKMAX=220;
function buildStreaks(){const W=32,Hh=64,d=new Uint8Array(W*Hh*4);for(let y=0;y<Hh;y++)for(let x=0;x<W;x++){const u=(x+.5)/W-.5,v=(y+.5)/Hh,a=Math.exp(-(u*u)/(2*.028))*Math.pow(1-v,1.4)*(.75+.25*Math.sin(v*40+x));const i=(y*W+x)*4,val=Math.round(255*Math.max(0,Math.min(1,a)));d[i]=d[i+1]=d[i+2]=val;d[i+3]=255}
  const t=new THREE.DataTexture(d,W,Hh);t.needsUpdate=true;t.magFilter=t.minFilter=THREE.LinearFilter;const g=new THREE.PlaneGeometry(1,1);g.rotateX(-Math.PI/2);g.translate(0,0,-.5);
  const im=new THREE.InstancedMesh(g,new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-4}),STKMAX);
  im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);im.frustumCulled=false;const c=new THREE.Color(1,1,1);for(let i=0;i<STKMAX;i++)im.setColorAt(i,c);im.count=0;scene.add(im);STK={im,n:0}}
const _sx=V3(),_sz=V3(),_sc=new THREE.Color();
function streak(g,up,col,k,w){if(STK.n>=STKMAX)return;const cam=camera.position;_sz.set(cam.x-g.x,0,cam.z-g.z);const dist=_sz.length();if(dist<4||dist>420)return;_sz.multiplyScalar(-1/dist);
  _sx.crossVectors(up,_sz).normalize();const len=clamp(dist*.2,5,32);_m.makeBasis(_sx,up,_sz);_m.scale(_s2.set(w,1,len));_m.setPosition(g.x+up.x*.07,g.y+up.y*.07,g.z+up.z*.07);STK.im.setMatrixAt(STK.n,_m);STK.im.setColorAt(STK.n,_sc.copy(col).multiplyScalar(k));STK.n++}
const STK_HEAD=new THREE.Color(1.25,1.18,1.02),STK_TAIL=new THREE.Color(1.4,.07,.1);
function updStreaks(){if(!STK)return;STK.n=0;const wet=MOOD.wet??.5;if(wet>0){const cam=camera.position;
  for(const c of traffic){if(!c.gp||c.gp.distanceToSquared(cam)>420*420)continue;const up=V3(0,1,0);streak(c.gp.clone().addScaledVector(c.fw,c.len/2),up,STK_HEAD,wet*.8,1.8);streak(c.gp.clone().addScaledVector(c.fw,-c.len/2),up,STK_TAIL,wet*.7,1.6)}
  
  for(const L of lampList){if(L.p.distanceToSquared(cam)>360*360)continue;streak(L.p,L.u,L.c,wet*1.1,3.2)}}
  STK.im.count=STK.n;STK.im.instanceMatrix.needsUpdate=true;if(STK.im.instanceColor)STK.im.instanceColor.needsUpdate=true}
let DEB=null;const _e2=new THREE.Euler(),_q2=new THREE.Quaternion(),_s2=V3();
function brickGeo(){const L=[new THREE.BoxGeometry(1.6,1,1.6)];for(const x of[-.4,.4])for(const z of[-.4,.4]){const c=new THREE.CylinderGeometry(.24,.24,.3,10);c.translate(x,.65,z);L.push(c)}const g=mergeGeometries(L.map(g=>{const n=g.toNonIndexed();n.deleteAttribute('uv');return n}));g.computeVertexNormals();return g}
function buildDebris(){const n=320,im=new THREE.InstancedMesh(brickGeo(),new THREE.MeshStandardMaterial({color:0xffffff,roughness:.32,metalness:.05}),n);im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);im.frustumCulled=false;
  _m.makeScale(0,0,0);const c=new THREE.Color(1,1,1);for(let i=0;i<n;i++){im.setMatrixAt(i,_m);im.setColorAt(i,c)}scene.add(im);DEB={im,n,list:[],next:0}}
function debris(at,vel,n,cols,size=1,floor){if(!DEB)return;for(let k=0;k<n;k++){const i=DEB.next;DEB.next=(DEB.next+1)%DEB.n;const j=DEB.list.findIndex(o=>o.i===i);if(j>=0)DEB.list.splice(j,1);
    DEB.list.push({i,p:at.clone().add(V3(rr(-1.2,1.2),rr(0,1),rr(-1.2,1.2))),v:vel.clone().add(V3(rr(-11,11),rr(5,17),rr(-11,11))),q:new THREE.Quaternion().setFromEuler(new THREE.Euler(rr(0,6),rr(0,6),rr(0,6))),w:V3(rr(-10,10),rr(-10,10),rr(-10,10)),
      s:V3(rr(.45,.9),rr(.35,.65),rr(.45,.9)).multiplyScalar(size),life:rr(2.4,4),floor:floor??at.y-1.2});DEB.im.setColorAt(i,cols[k%cols.length])}DEB.im.instanceColor.needsUpdate=true}
function updDebris(dt){if(!DEB)return;const L=DEB.list;for(let j=L.length-1;j>=0;j--){const d=L[j];d.life-=dt;if(d.life<=0){_m.makeScale(0,0,0);DEB.im.setMatrixAt(d.i,_m);L.splice(j,1);DEB.dirty=true;continue}
    d.v.y-=32*dt;d.p.addScaledVector(d.v,dt);if(d.p.y<d.floor){d.p.y=d.floor;if(d.v.y<0)d.v.y*=-.32;d.v.x*=.72;d.v.z*=.72;d.w.multiplyScalar(.65)}
    _e2.set(d.w.x*dt,d.w.y*dt,d.w.z*dt);d.q.multiply(_q2.setFromEuler(_e2));_m.compose(d.p,d.q,_s2.copy(d.s).multiplyScalar(d.life<.6?d.life/.6:1));DEB.im.setMatrixAt(d.i,_m)}
  if(L.length||DEB.dirty){DEB.im.instanceMatrix.needsUpdate=true;DEB.dirty=false}}
const teamCols=t=>[new THREE.Color(t.a),new THREE.Color(t.b),new THREE.Color('#2a2e40'),new THREE.Color(t.a).multiplyScalar(.6)];
function pointPool(n,size){const pos=new Float32Array(n*3),col=new Float32Array(n*3);const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));
  const pts=new THREE.Points(g,new THREE.PointsMaterial({size,vertexColors:true,map:GLOW,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));pts.frustumCulled=false;scene.add(pts);
  return{n,pos,col,g,pts,list:[]}}
let SPARK,FIRE,GLOWP,WATER,SMOKE,FIREB;
const SPR_VS='attribute vec3 pc;attribute vec2 sa;uniform float uScale;varying float vA;varying vec3 vC;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=clamp(sa.x*uScale/max(1.,-mv.z),1.,300.);gl_Position=projectionMatrix*mv;vA=sa.y;vC=pc;}';
const SPR_FS='varying float vA;varying vec3 vC;void main(){vec2 q=gl_PointCoord-.5;float d=clamp(length(q)*2.,0.,1.);float m=1.-d;m=m*m*(3.-2.*m);gl_FragColor=vec4(vC,m*vA);}';
function spritePool(n,add){const pos=new Float32Array(n*3),col=new Float32Array(n*3),sa=new Float32Array(n*2);const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('pc',new THREE.BufferAttribute(col,3));g.setAttribute('sa',new THREE.BufferAttribute(sa,2));
  const pts=new THREE.Points(g,new THREE.ShaderMaterial({vertexShader:SPR_VS,fragmentShader:SPR_FS,uniforms:{uScale:SPRSCALE},transparent:true,depthWrite:false,blending:add?THREE.AdditiveBlending:THREE.NormalBlending,toneMapped:false}));pts.frustumCulled=false;pts.renderOrder=add?4:3;scene.add(pts);return{n,pos,col,sa,g,pts,list:[],spr:true}}
function linePool(n){const pos=new Float32Array(n*6),col=new Float32Array(n*6);const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));
  const ls=new THREE.LineSegments(g,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));ls.frustumCulled=false;scene.add(ls);return{n,pos,col,g,pts:ls,list:[],lines:true}}
// size s0 -> s1 over the life, alpha a (smoke fades in then out, fire fades out)
function emitS(pool,p,v,life,c,s0,s1,a,soft){pool.list.push({p:p.clone(),v,life,max:life,c,s0,s1,a,soft});if(pool.list.length>pool.n)pool.list.shift()}
function puff(at,n,col,s0,s1,life,a,spread=2,rise=4){for(let i=0;i<n;i++)emitS(SMOKE,V3(at.x+rr(-spread,spread),at.y+rr(0,spread),at.z+rr(-spread,spread)),V3(rr(-2,2),rise*rr(.5,1.2),rr(-2,2)),rr(life*.6,life),col,s0*rr(.7,1.2),s1*rr(.8,1.2),a,true)}
function fireball(at,n,sz,life){for(let i=0;i<n;i++)emitS(FIREB,V3(at.x+rr(-1.5,1.5),at.y+rr(-.5,1.5),at.z+rr(-1.5,1.5)),V3(rr(-7,7),rr(2,9),rr(-7,7)),rr(life*.5,life),new THREE.Color(1.2,rr(.36,.55),.1),sz*rr(.5,.8),sz*rr(1.1,1.6),.42,false)}
function emit(pool,p,v,life,c){pool.list.push({p:p.clone(),v,life,max:life,c});if(pool.list.length>pool.n)pool.list.shift()}
function burst(pool,at,n,spd,life,c,up=V3(0,1,0)){for(let i=0;i<n;i++){const v=V3(rr(-1,1),rr(-.2,1),rr(-1,1)).normalize().multiplyScalar(rr(.2,1)*spd).addScaledVector(up,spd*.3);emit(pool,at,v,rr(life*.5,life),c)}}
function updPool(pool,dt,grav=0){let k=0;const L=pool.list;for(let i=L.length-1;i>=0;i--){const o=L[i];o.life-=dt;if(o.life<=0){L.splice(i,1);continue}if(o.v){o.v.y-=grav*dt;o.p.addScaledVector(o.v,dt);o.v.multiplyScalar(1-dt*1.5)}}
  if(pool.spr){for(const o of L){if(k>=pool.n)break;const f=o.life/o.max;pool.pos.set([o.p.x,o.p.y,o.p.z],k*3);pool.col.set([o.c.r,o.c.g,o.c.b],k*3);pool.sa[k*2]=lerp(o.s1,o.s0,f);pool.sa[k*2+1]=o.a*(o.soft?Math.min(1,(1-f)*5)*f:f);k++}
    for(let i=k;i<pool.n;i++)pool.pos[i*3+1]=-9999;pool.g.attributes.position.needsUpdate=pool.g.attributes.pc.needsUpdate=pool.g.attributes.sa.needsUpdate=true;pool.g.setDrawRange(0,Math.max(1,k));return}
  if(pool.lines){for(const o of L){if(k>=pool.n)break;const f=o.life/o.max,v=o.v||V3();pool.pos.set([o.p.x,o.p.y,o.p.z,o.p.x-v.x*.035,o.p.y-v.y*.035,o.p.z-v.z*.035],k*6);pool.col.set([o.c.r*f,o.c.g*f,o.c.b*f,o.c.r*f*.15,o.c.g*f*.12,o.c.b*f*.1],k*6);k++}
    for(let i=k;i<pool.n;i++){pool.pos[i*6+1]=-9999;pool.pos[i*6+4]=-9999}pool.g.attributes.position.needsUpdate=pool.g.attributes.color.needsUpdate=true;pool.g.setDrawRange(0,Math.max(2,k*2));return}
  for(const o of L){if(k>=pool.n)break;const f=o.life/o.max;pool.pos.set([o.p.x,o.p.y,o.p.z],k*3);pool.col.set([o.c.r*f,o.c.g*f,o.c.b*f],k*3);k++}
  for(let i=k;i<pool.n;i++)pool.pos[i*3+1]=-9999;pool.g.attributes.position.needsUpdate=pool.g.attributes.color.needsUpdate=true;pool.g.setDrawRange(0,Math.max(1,k))}

/* ============================================================ 10 · audio */
const AU={a:null,muted:store.get('mho_mute',false),
  init(){if(this.a){if(this.a.state==='suspended')this.a.resume();return}try{const a=this.a=new (window.AudioContext||window.webkitAudioContext)();
    this.m=a.createGain();this.m.gain.value=this.muted?0:.6*SET.vol;this.m.connect(a.destination);this.fx=a.createGain();this.fx.gain.value=.55*SET.sfx;this.fx.connect(this.m);this.mus=a.createGain();this.mus.gain.value=.26*SET.mus;this.mus.connect(this.m);
    const d=a.createDelay();d.delayTime.value=.36;const fb=a.createGain();fb.gain.value=.32;const lp=a.createBiquadFilter();lp.frequency.value=2400;d.connect(lp);lp.connect(fb);fb.connect(d);lp.connect(this.mus);this.dly=d;
    const len=a.sampleRate*2,b=a.createBuffer(1,len,a.sampleRate),dd=b.getChannelData(0);for(let i=0;i<len;i++)dd[i]=Math.random()*2-1;this.nb=b;
    this.eg=a.createGain();this.eg.gain.value=0;this.ef=a.createBiquadFilter();this.ef.type='lowpass';this.ef.frequency.value=400;this.ef.Q.value=4;this.ef.connect(this.eg);this.eg.connect(this.fx);
    this.o1=a.createOscillator();this.o1.type='sawtooth';this.o2=a.createOscillator();this.o2.type='square';this.o1.connect(this.ef);this.o2.connect(this.ef);this.o1.start();this.o2.start();
    const loop=(type,fr,q)=>{const s=a.createBufferSource();s.buffer=b;s.loop=true;const f=a.createBiquadFilter();f.type=type;f.frequency.value=fr;if(q)f.Q.value=q;const g=a.createGain();g.gain.value=0;s.connect(f);f.connect(g);g.connect(this.fx);s.start();return{f,g}};
    this.wind=loop('bandpass',900);this.scr=loop('highpass',2500);this.nit=loop('bandpass',1400,1.2);
    this.step=0;this.next=a.currentTime+.1;setInterval(()=>this.sched(),25)}catch(e){this.a=null}},
  setVol(){if(!this.a)return;const t=this.a.currentTime;this.m.gain.setTargetAtTime(this.muted?0:.6*SET.vol,t,.03);this.fx.gain.setTargetAtTime(.55*SET.sfx,t,.03);this.mus.gain.setTargetAtTime(.26*SET.mus,t,.03)},
  toggle(){this.muted=!this.muted;store.set('mho_mute',this.muted);if(this.m)this.m.gain.setTargetAtTime(this.muted?0:.6*SET.vol,this.a.currentTime,.03);$('#muteBtn').textContent=$('#pMute').textContent=this.muted?'SOUND OFF':'SOUND ON'},
  f:n=>440*Math.pow(2,(n-69)/12),
  osc(t,type,fr,dur,vol,dest,slide,cut){const a=this.a,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(fr,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,slide),t+dur);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+dur);let n=o;if(cut){const f=a.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(cut,t);f.frequency.exponentialRampToValueAtTime(Math.max(90,cut/5),t+dur);o.connect(f);n=f}
    n.connect(g);g.connect(dest);o.start(t);o.stop(t+dur+.03);return g},
  noise(t,dur,vol,fr,dest,type='lowpass',sweep){const a=this.a,s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=this.nb;f.type=type;f.frequency.setValueAtTime(fr,t);if(sweep)f.frequency.exponentialRampToValueAtTime(sweep,t+dur);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(f);f.connect(g);g.connect(dest);s.start(t,Math.random());s.stop(t+dur+.03)},
  sched(){const a=this.a;if(!a||paused)return;const ev=state==='roam'&&RO&&(RO.ch||RO.sp),cdn=ev&&((RO.ch&&RO.ch.cd>0)||(RO.sp&&RO.sp.cd>0)),spb=60/(ev?150:128)/4;
    while(this.next<a.currentTime+.12){const t=this.next,s=this.step%16,bar=Math.floor(this.step/16)%4,r=ev?[50,46,48,45][bar]:[45,41,48,43][bar],on=state!=='menu',hot=on&&pl&&(pl.nitro||pl.air);
      if(ev){if(cdn){if(s%2===0)this.osc(t,'sawtooth',this.f(57+(this.step%32)/2),spb*1.8,.05,this.mus,0,1200+(this.step%32)*90);this.next+=spb;this.step++;continue}if(s%4===0||s===14)this.osc(t,'sine',150,.28,1,this.mus,38);if(s===4||s===12){this.noise(t,.16,.5,2000,this.mus,'bandpass');this.noise(t+.012,.12,.3,1200,this.mus,'bandpass')}this.noise(t,.03,.14,9000,this.mus,'highpass');this.osc(t,'sawtooth',this.f(r-12+(s%2?12:0)),spb*.85,.24,this.mus,0,hot?3200:2000);if(s%2===0){const ar=[0,3,7,10,12,10,7,3][(s/2)%8];const g=this.osc(t,'square',this.f(r+12+ar),spb*1.3,.045,this.mus,0,3600);g.connect(this.dly)}this.next+=spb;this.step++;continue}
      if(s%4===0)this.osc(t,'sine',140,.3,.9,this.mus,40);
      if(on&&(s===4||s===12))this.noise(t,.18,.45,1800,this.mus,'bandpass');
      if(s%2===1||hot)this.noise(t,.035,.16,8000,this.mus,'highpass');
      this.osc(t,'sawtooth',this.f(r-12+(s%4===2?12:0)),spb*.9,.2,this.mus,0,on?(hot?2600:1500):800);
      if(s%2===0){const ar=[0,7,12,15,19,15,12,7][(s/2)%8];const g=this.osc(t,'square',this.f(r+12+ar),spb*1.5,.035,this.mus,0,3200);g.connect(this.dly)}
      this.next+=spb;this.step++}},
  engine(s,thr,on){if(!this.a||!s)return;const t=this.a.currentTime,x=s.v/s.stats.top,air=s.air?25:0;this.o1.frequency.setTargetAtTime(38+x*95+air,t,.05);this.o2.frequency.setTargetAtTime(38.6+x*95.5+air,t,.05);this.ef.frequency.setTargetAtTime(250+x*2200+thr*500+(s.nitro?1500:0),t,.05);
    const mv=Math.min(1,(Math.abs(s.v||0)+thr*10)/7);this.eg.gain.setTargetAtTime(on?(.05+thr*.05+x*.04)*mv:0,t,mv<.3?.25:.08);this.wind.g.gain.setTargetAtTime(on?x*x*.22+(s.air?.1:0):0,t,.1);this.wind.f.frequency.setTargetAtTime(500+x*1600,t,.1);
    this.nit.g.gain.setTargetAtTime(on&&s.nitro?.22:0,t,.05);this.nit.f.frequency.setTargetAtTime(900+x*2600,t,.1)},
  scrape(on){if(this.a)this.scr.g.gain.setTargetAtTime(on?.18:0,this.a.currentTime,.03)},
  sfx(n){const a=this.a;if(!a)return;const t=a.currentTime,F=this.fx;switch(n){
    case'beep':this.osc(t,'square',660,.18,.16,F);break;case'go':this.osc(t,'square',990,.5,.18,F);this.osc(t,'square',1485,.5,.08,F);break;
    case'brick':for(let i=0;i<6;i++)this.noise(t+i*.032+Math.random()*.01,.028,.32,2600+Math.random()*2200,F,'bandpass');this.osc(t+.2,'triangle',this.f(96),.08,.12,F);break;
    case'pick':this.osc(t,'triangle',this.f(84),.1,.2,F);this.osc(t+.05,'triangle',this.f(91),.14,.18,F);break;
    case'rocket':for(let i=0;i<3;i++)this.osc(t+i*.08,'sawtooth',700,.18,.12,F,120);break;
    case'missile':this.osc(t,'sawtooth',160,.5,.2,F,60,1200);this.noise(t,.4,.2,1400,F);break;
    case'mine':this.osc(t,'square',180,.12,.16,F,90);break;
    case'boom':this.noise(t,.7,.9,500,F);this.osc(t,'sine',110,.6,.6,F,30);break;
    case'hit':this.noise(t,.25,.6,1200,F,'bandpass');this.osc(t,'sawtooth',200,.25,.25,F,70);break;
    case'crash':this.noise(t,.3,.7,900,F);this.osc(t,'square',90,.2,.2,F,40);break;
    case'boost':this.osc(t,'sawtooth',260,.45,.16,F,1400);this.noise(t,.3,.1,3000,F,'highpass');break;
    case'nitro':this.noise(t,.5,.5,300,F,'bandpass',4000);this.osc(t,'sawtooth',120,.5,.2,F,600);break;
    case'near':this.noise(t,.28,.45,600,F,'bandpass',4200);this.osc(t,'triangle',this.f(88),.1,.1,F);break;
    case'style':this.osc(t,'triangle',this.f(91),.12,.12,F);this.osc(t+.06,'triangle',this.f(96),.16,.12,F);break;
    case'takedown':this.noise(t,.5,.9,700,F);this.osc(t,'sawtooth',70,.5,.4,F,30);[0,4,7,12].forEach((k,i)=>this.osc(t+.1+i*.06,'square',this.f(79+k),.14,.09,F));break;
    case'launch':this.noise(t,.6,.3,400,F,'bandpass',2400);break;
    case'land':this.osc(t,'sine',90,.3,.7,F,35);this.noise(t,.2,.4,500,F);break;
    case'splash':this.noise(t,1.2,.8,900,F,'lowpass',200);break;
    case'roll':this.noise(t,.4,.35,500,F,'bandpass',3000);break;
    case'turbo':this.osc(t,'sawtooth',150,.9,.2,F,900);break;
    case'shield':[0,4,7].forEach(k=>this.osc(t,'sine',this.f(72+k),.6,.1,F));break;
    case'lap':[0,7,12].forEach((k,i)=>this.osc(t+i*.08,'triangle',this.f(79+k),.2,.14,F));break;
    case'final':[0,4,7,12,16].forEach((k,i)=>this.osc(t+i*.07,'square',this.f(76+k),.16,.08,F));break;
    case'finish':[0,4,7,12].forEach((k,i)=>{this.osc(t+i*.14,'square',this.f(72+k),.4,.1,F);this.osc(t+i*.14,'triangle',this.f(60+k),.4,.14,F)});break;
    case'elim':this.osc(t,'square',440,.3,.14,F,110);this.osc(t+.3,'square',330,.4,.14,F,80);break;
    case'thunder':this.noise(t,2.6,.9,260,F,'lowpass',60);this.noise(t+.05,.5,.5,900,F,'lowpass',200);this.osc(t,'sine',48,2,.4,F,30);break;
    case'bump':this.osc(t,'sine',120,.12,.35,F,60);break;}}};

/* ============================================================ 11 · race state */
let state='loading',paused=false,cls=CLASSES[1],dir='fwd',teamIdx=store.get('mho_team',0),camMode=0,raceT=0,cdT=0,finishT=0,slowmo=0;
let userCls=CLASSES.find(c=>c.id===store.get('mho_cls','pro'))||CLASSES[1],userDir=store.get('mho_dir','fwd');
let menuTab=(t=>['season','world','career'].includes(t)?'quick':t)(store.get('mho_tab','quick')),evIdx=store.get('mho_ev',0),quickTraffic=store.get('mho_traf',true),menuTrack=store.get('mho_trk','grand'),menuMirror=store.get('mho_mir',false),menuMood=(store.get('r1_mood',0)?store.get('mho_mood','brick'):(store.set('r1_mood',1),store.set('mho_mood','brick'),'brick')),ttFormat=store.get('mho_ttf','lap'),mirror=false;
if(!TRACK_DEFS.some(t=>t.id===menuTrack))menuTrack='grand';if(CID==='ath'&&!isAthT(menuTrack)){menuTrack=isAthT(store.get('mho_trk_ath','akro'))?store.get('mho_trk_ath','akro'):'akro';menuMood=TRACK_DEFS.find(t=>t.id===menuTrack).mood}if(isAthT(menuTrack)&&!athOpen())menuTrack='grand';let trkCity=null;
let RC={type:'race',laps:3,traffic:18,items:true,aggr:0,ev:null};
const ships=[];let pl=null;const F=mkF(),F2=mkF();
const pads=[],projs=[],mines=[];let padMeshes=[];
let ghost=null,ghostRec=[],ghostShip=null,elimT=0,thrPressT=null,flash=0,hitFx=0,lastLit=-1,fovKick=0;
const career=()=>store.get('mho_career',{});
const season=()=>Object.assign({L:0,r:0,pts:{},cr:0,up:{eng:0,thr:0,han:0,arm:0},max:0,champ:[]},store.get('mho_season',{}));
const saveSeason=S=>store.set('mho_season',S);
const rivals=()=>store.get('mho_riv',{});
function nemesis(){const rv=rivals();let b=null,bv=2;for(const k in rv)if(rv[k]>bv){bv=rv[k];b=k}return b}
const seasonRoster=L=>PDL.slice([0,1,2,4,5][L],[0,1,2,4,5][L]+7).map(p=>p.n);
function seasonRound(L,r){const ath=CID==='ath',TR=ath?ATH_IDS:['grand','hafen','fraport','sky'],track=TR[(L*2+r)%4],td=TRACK_DEFS.find(t=>t.id===track);
  return{name:RND_NAMES[r],track,mood:(ath?['athgold','athnoon','athnight','athdusk','athnight']:['night','dawn','fog','storm','night'])[(r+L)%5],type:r===2?'elim':'race',laps:r===2?99:td.laps,items:r!==1,traffic:12+L*4,aggr:Math.min(.6,.08+L*.08+(r===3?.25:0)),dbl:r===4,short:td.short}}
const AVC={},AVCC={};function avatar(n){return AVC[n]||(AVC[n]=avatarCv(n).toDataURL())}function avatarCv(n){if(AVCC[n])return AVCC[n];const p=PD[n],t=p?teamOf(p):TEAMS[0];const[c,g]=cv(64,64);
  let gr=g.createRadialGradient(32,26,4,32,32,34);gr.addColorStop(0,t.b);gr.addColorStop(1,'#020812');g.fillStyle=gr;g.fillRect(0,0,64,64);
  g.fillStyle=t.a;g.beginPath();g.arc(32,36,22,Math.PI*1.02,Math.PI*1.98);g.lineTo(54,50);g.quadraticCurveTo(32,60,10,50);g.closePath();g.fill();
  g.fillStyle=t.c;g.fillRect(29,14,6,22);g.fillStyle='#0a1222';g.beginPath();g.ellipse(32,40,17,7,0,0,7);g.fill();
  g.strokeStyle=t.glow;g.lineWidth=2;g.beginPath();g.ellipse(32,40,17,7,0,Math.PI*1.1,Math.PI*1.9);g.stroke();
  g.fillStyle='#fff';g.font='bold 10px sans-serif';g.textAlign='center';g.fillText((p?p.n:'??').slice(0,3),32,60);return AVCC[n]=c}
const avImg=s=>s&&s.pid?`<img class="av" src="${avatar(s.pid)}" alt="">`:'';
let radioT=0,radioCd=0,prevPlace=0;
function radio(s,kind){if(!s||!s.pid||!PD[s.pid])return;const p=PD[s.pid];const L=kind==='intro'||(s.nem&&R()<.4)?NEM_LINES:TAUNT[p.style][kind];const line=L[Math.floor(R()*L.length)];
  const el=$('#radio');if(!el)return;el.querySelector('img').src=avatar(p.n);el.querySelector('b').textContent=`${p.flag} ${p.n}${s.nem?' · NEMESIS':''}`;el.querySelector('span').textContent=line;el.classList.add('on');clearTimeout(radioT);radioT=setTimeout(()=>el.classList.remove('on'),2600)}
function rivalHit(o,kind){if(!o||!o.pid)return;const rv=rivals();rv[o.pid]=(rv[o.pid]||0)+1;store.set('mho_riv',rv);radio(o,kind)}
const lapAttack=()=>RC.type==='tt'&&!RC.ev&&!RC.daily;
const ZLEN=1200;let duelGhost=null,duelRec=[];
const duelKey=()=>`mho_duel_${TRK.id}${mirror?'M':''}_${cls.id}_${dir}`,zoneKey=()=>`mho_zone_${TRK.id}${mirror?'M':''}`;
function dayKey(){const d=new Date();return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate())}
function dailyCfg(){const key=dayKey();let h=2166136261;for(const c of key)h=Math.imul(h^c.charCodeAt(0),16777619);const r=mul(h>>>0),pick=a=>a[Math.floor(r()*a.length)];
  const trk=pick(CID==='ath'?ATH_TRACKS:TDF),mood=pick(MOODS),clsId=pick(['pro','pro','elite']),rev=r()<.3,mir=r()<.3,type=pick(['race','race','tt','zone']);
  const c={type,daily:key,track:trk.id,mood:mood.id,mirror:mir,dir:rev?'rev':'fwd',cls:type==='zone'?'rookie':clsId,items:type==='race',aggr:type==='race'?.25:0,
    laps:type==='race'?trk.laps:type==='tt'?2:999,traffic:type==='tt'?0:pick([12,20,30])};return c}
const dailyLabel=c=>{const t=TRACK_DEFS.find(x=>x.id===c.track),m=MOODS.find(x=>x.id===c.mood);return{t,m,mode:{race:'Race · '+c.laps+' laps',tt:'Time attack · 2 laps',zone:'Zone survival'}[c.type]}};
const medalPts=()=>Object.values(career()).reduce((a,m)=>a+m,0);
// R15: races are faster for everyone (top +20 %, acceleration +35 %); free roam keeps its own physics
const R15_SPD=1.2,R15_ACC=1.35;const R15_on=()=>RC&&RC.type!=='roam';
