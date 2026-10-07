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
let menuTab=(t=>['season','world','career'].includes(t)?'quick':t)(store.get('mho_tab','quick')),evIdx=store.get('mho_ev',0),quickTraffic=store.get('mho_traf',true),menuTrack=store.get('mho_trk','grand'),menuMirror=store.get('mho_mir',false),menuMood=store.get('mho_mood','night'),ttFormat=store.get('mho_ttf','lap'),mirror=false;
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
function makeShip(team,isPlayer,name,skill){const mesh=shipMesh(team);scene.add(mesh);const top=BASE_TOP*cls.mul*team.top;
  return{team,isPlayer,name,skill,mesh,dist:0,x:0,yaw:0,beta:0,yawRate:0,v:0,hull:100,item:null,
    stats:{top,top0:BASE_TOP*cls.mul,acc:8.4*cls.mul*team.acc,brake:8+cls.mul,han:team.han,hull:team.hull},
    lap:-1,lapStart:0,best:Infinity,laps:[],finished:false,finishTime:0,dead:0,shield:0,turbo:0,boost:0,inv:0,roll:0,rollV:0,laneBias:rr(-4,4)*CR_LS,rubber:1,wall:0,wrong:0,place:1,bob:R()*6,aiFire:0,lastHit:-9,
    bm:20,nitro:false,air:null,lastJump:'',rollT:0,rollDir:0,rollCd:0,driftT:0,style:0,takedowns:0,nearMiss:0,airTime:0,maxSpeed:0,eliminated:false,attackT:0,aggrCd:rr(2,6),stall:0,latV:0}}
function clearRace(){for(const s of ships){scene.remove(s.mesh);disposeTree(s.mesh,true)}ships.length=0;for(const o of projs)wfxDrop(o);for(const o of mines)wfxDrop(o);projs.length=0;mines.length=0;
  for(const m of padMeshes){scene.remove(m);disposeTree(m,true)}padMeshes=[];pads.length=0;if(ghostShip){scene.remove(ghostShip);disposeTree(ghostShip,true);ghostShip=null}}
function setupJunction(){const s0=Math.min(700,TD.L*.25);RC.jn={cars:0,value:0,chain:0,after:0,end:s0+900,endT:null};
  for(const c of traffic){placeTraffic(c,s0,[0,260]);c.v*=.35}pl.bm=100}
function setupRace(cfg){if(cfg.type!=='roam')hubLeave();endCrashCam();ccCool=0;clearRace();RC=cfg;document.body.dataset.mode=cfg.type;loadTrack(cfg.track||'grand');applyMood(cfg.mood||'night');mirror=!!cfg.mirror;FX.uniforms.uMirror.value=mirror?1:0;mapC.style.transform=mirror?'scaleX(-1)':'';$('#hTitle span').textContent=TRK.name;$('#hTitle b').textContent=TRK.city?'ATHINA':'MAINHATTAN';const attract=cfg.type==='attract';TD=dir==='rev'?(TRACKS.rev||(TRACKS.rev=reverseTrack(TF))):TF;
  for(const j of TD.jumps){const top0=BASE_TOP*cls.mul;j.g=.4*(.6*top0)**2/(j.s1-j.s0)}
  const n=cfg.rival?2:cfg.boss?6:['tt','zone','duel','junction','roam'].includes(cfg.type)?1:8;const bossP=cfg.boss?(cfg.world&&cfg.world.p)||'KAISER':null,wpil=cfg.rival?[cfg.rival]:cfg.boss?(bossP==='DRAKOS'?['LAMBROU','VLACHOS','ANTONIOU','GALANI','DRAKOS']:['LINDQVIST','ADLER','KAYA','VOSS','KAISER']):null;const pilots=[...PILOTS].sort(()=>R()-.5);
  for(let i=0;i<n;i++){const isP=!attract&&i===n-1;const pn=isP?null:wpil?wpil[i]:cfg.roster?cfg.roster[Math.min(i,cfg.roster.length-1)]:cfg.season?seasonRoster(season().L)[Math.min(i,6)]:pilots[i],pd=pn&&PD[pn];const team=isP?playerTeam():(cfg.season||wpil||cfg.roster)&&pd?((wpil&&vehOf(pn))||teamOf(pd)):TEAMS[(i+teamIdx+1)%6];
    const sk=lerp(cls.ai[0],cls.ai[1],n>1?i/(n-1):1)*diffMul();const s=makeShip(team,isP,isP?'YOU':pn,sk);if(!isP&&RO.launching){const k=carStat();s.stats.top*=1+(k.top-1)*.75;s.stats.acc*=1+(k.acc-1)*.75}
    if(pd&&!attract){s.pid=pn;s.style=pd.style;s.nem=pn===nemesis();s.aggrB=(pd.style==='aggressor'?.15:0)+(s.nem?.35:0);if(wpil){s.skill*=pn===bossP?1.06:cfg.rival?1.04+.015*(chapter()-1):1;if(pn===bossP){s.sig='boss';s.stats.hull*=1.4}else if(cfg.rival)s.sig=cfg.world.sig}}
    if(isP&&RO.launching){const k=carStat();s.stats.top*=k.top;s.stats.acc*=k.acc;s.stats.han*=k.han;s.stats.hull*=k.hull}
    if(isP&&cfg.season){const u=season().up;s.stats.top*=1+.03*u.eng;s.stats.acc*=1+.06*u.thr;s.stats.han*=1+.04*u.han;s.stats.hull*=1+.1*u.arm}
    const row=Math.floor((n-1-i)/2),col=(n-1-i)%2;s.dist=-14-row*16-(col?8:0);s.x=(col?8:-8)*CR_LS;if(n===1){s.dist=-10;s.x=0}
    ships.push(s);if(isP)pl=s}
  if(attract)pl=null;
  for(const s of ships)s.lives=cfg.type==='arena'?3:1;RC.zone={k:1,next:ZLEN,mul:cls.mul};RC.time=cfg.type==='arena'?(cfg.derby?150:180):0;RC.dmgK=cfg.type==='zone'?1.5:cfg.type==='arena'?.7:1;
  const L=TD.L;if(cfg.items){const nk=Math.max(2,Math.round(L/1000*(cfg.type==='arena'?1.7:1)));for(let k=0;k<nk;k++){let s=L*(k+.45)/nk;while(yAt(TD,s)<-10||jumpAt(TD,s)||jumpAt(TD,s+80))s+=60;for(const x of[-14,0,14])pads.push({s,x:x*CR_LS,type:'item'})}}
  let placed=0;for(let s=220;s<L-200&&placed<9;s+=40){let ok=!jumpAt(TD,s);for(let d=-60;d<=120;d+=20)if(Math.abs(kAt(TD,s+d))>1/700)ok=false;if(ok){pads.push({s,x:[-12,0,12][placed%3]*CR_LS,type:'boost'});placed++;s+=520}}
  for(const j of TD.jumps)pads.push({s:j.s0-140,x:0,type:'boost'});if(TRK.id==='akro'){let s0=-1;for(let s=0;s<L;s+=10)if(TD.SEC[Math.floor(s/TD.ds)%TD.N]==='PLAKA'){s0=s;break}if(s0>=0){const sd=Math.sign(kAt(TD,s0+60))||1;for(let q=0;q<4;q++)pads.push({s:s0+20+q*28,x:sd*(MARGIN-5*CR_LS),type:'boost'})}}
  const itemMat=new THREE.MeshBasicMaterial({map:padTex('item'),transparent:true,depthWrite:false,toneMapped:false,color:new THREE.Color(1.6,1.6,1.6)}),boostTex=padTex('boost'),boostMat=new THREE.MeshBasicMaterial({map:boostTex,transparent:true,depthWrite:false,toneMapped:false,blending:THREE.AdditiveBlending,color:new THREE.Color(2,2,2)});boostTex.wrapT=THREE.RepeatWrapping;
  const beamMat=new THREE.MeshBasicMaterial({map:GLOW,color:glowCol('#4ceaff',.8),transparent:true,opacity:.25,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,toneMapped:false});
  for(const p of pads){const f=frameAt(TD,p.s,mkF());const g=new THREE.Group();const m=new THREE.Mesh(p.type==='item'?new THREE.PlaneGeometry(6,10):new THREE.PlaneGeometry(9,16),p.type==='item'?itemMat:boostMat);m.rotation.x=-Math.PI/2;g.add(m);
    if(p.type==='item'){const col=new THREE.Mesh(new THREE.CylinderGeometry(2.6,2.6,16,12,1,true),beamMat);col.position.y=8;g.add(col)}
    placeOnTrack(g,f,p.x,.1);scene.add(g);padMeshes.push(g);p.mesh=g}
  MAT.boostTex=boostTex;
  setupTraffic(cfg.type==='junction'?Math.min(3,cfg.traffic||0):0);setupProps();athHazReset();if(cfg.type==='junction'&&pl)setupJunction();
  ghost=cfg.type==='tt'&&!cfg.ev&&!cfg.daily?store.get(ghostKey(),null):null;ghostRec=[];duelRec=[];duelGhost=cfg.type==='duel'?store.get(duelKey(),null):null;if(duelGhost)ghost=null;
  if(ghost||duelGhost){ghostShip=shipMesh(TEAMS[(ghost||duelGhost).team]||TEAMS[0]);ghostShip.traverse(o=>{if(o.material&&!o.material.isShaderMaterial){o.material=o.material.clone();o.material.transparent=true;o.material.opacity=.35;o.material.depthWrite=false}});scene.add(ghostShip)}
  raceT=0;cdT=attract?0:4.2;finishT=0;elimT=30;thrPressT=null;slowmo=0;lastLit=-1;state=attract?'menu':'countdown';$('#ghRow').hidden=!(ghost||duelGhost);feedClear();
  startLights.forEach(l=>l.material.color.setHex(0x220a0e));
  ships.forEach(s=>posShip(s,1/60,true));updateCam(1,true);
  // compile anything new for this race (ghost, liveries) now, during the countdown, instead of mid-race
  if(booted)renderer.compile(scene,camera)}
const trkTag=()=>TRK.id==='grand'&&!mirror?'':TRK.id+(mirror?'M':'')+'_';
const recKey=()=>RC.ev?`mho_rec_${RC.ev.id}`:`mho_rec_${trkTag()}${cls.id}_${dir}_${RC.type}`;const ghostKey=()=>`mho_ghost_${trkTag()}${cls.id}_${dir}`;

/* ---- physics (fixed step) ---- */
const HZ=120,H=1/HZ,ROLL_T=.55;
const PAD={};
function ctlPlayer(dtR){const pad=navigator.getGamepads?[...navigator.getGamepads()].find(g=>g&&g.connected):null;
  let steer=(K.ArrowRight||K.KeyD?1:0)-(K.ArrowLeft||K.KeyA?1:0),thr=K.ArrowUp||K.KeyW?1:0,brk=K.ArrowDown||K.KeyS?1:0,abL=K.KeyQ?1:0,abR=K.KeyE?1:0,boost=K.ShiftLeft||K.ShiftRight?1:0,hb=K.KeyX||K.ControlLeft||TOUCH.hb?1:0;
  if(pad){const ax=pad.axes[0]||0;if(Math.abs(ax)>.12)steer=clamp(steer+Math.sign(ax)*(Math.abs(ax)-.12)/.88,-1,1);thr=Math.max(thr,pad.buttons[7]?.value||0);brk=Math.max(brk,pad.buttons[6]?.value||0);
    abL=Math.max(abL,pad.buttons[4]?.pressed?1:0);abR=Math.max(abR,pad.buttons[5]?.pressed?1:0);boost=Math.max(boost,pad.buttons[1]?.pressed?1:0);
    if(pad.buttons[0]?.pressed&&!PAD.b0)pressed.fire=true;if(pad.buttons[2]?.pressed&&!PAD.b2&&Math.abs(ax)>.4)pressed.roll=Math.sign(ax);if(pad.buttons[3]?.pressed&&!PAD.b3)cycleCam();if(pad.buttons[9]?.pressed&&!PAD.b9)togglePause();
    PAD.b0=pad.buttons[0]?.pressed;PAD.b2=pad.buttons[2]?.pressed;PAD.b3=pad.buttons[3]?.pressed;PAD.b9=pad.buttons[9]?.pressed}
  if(document.body.dataset.tc!==SET.touch)document.body.dataset.tc=SET.touch;{const te=thrEff();if(document.body.dataset.thr!==te)document.body.dataset.thr=te}
  if(TOUCH.on&&TOUCH.used){if(TOUCH.park&&(state!=='roam'||TOUCH.boost))parkSet(false);thr=TOUCH.brake||TOUCH.park||thrEff()==='pedal'&&!TOUCH.gas?0:1;brk=TOUCH.brake?1:0;if(SET.touch==='buttons'){TOUCH.target=TOUCH.dir;const up=TOUCH.dir&&Math.sign(TOUCH.dir)===Math.sign(TOUCH.steer||TOUCH.dir);const rp=SENS().ramp;if(state==='roam'){const dd=Math.min(dtR||H,.05),r1=rp*.8;TOUCH.kick=0;if(up){if(TOUCH.steer*TOUCH.dir<W14_ST.k0)TOUCH.steer=TOUCH.dir*W14_ST.k0;TOUCH.steer+=clamp(TOUCH.dir-TOUCH.steer,-r1*W14_ST.rk*dd,r1*W14_ST.rk*dd)}else{const rb=TOUCH.dir?14:7;TOUCH.steer+=clamp(TOUCH.dir-TOUCH.steer,-rb*dd,rb*dd)}}else{if(TOUCH.kick){const k0=[.42,.5,.58,.66,.75][clamp((SET.sens|0)-1,0,4)];if(TOUCH.steer*TOUCH.kick<k0)TOUCH.steer=TOUCH.kick*k0;TOUCH.kick=0}TOUCH.steer+=clamp(TOUCH.dir-TOUCH.steer,-(up?rp*1.8:16)*H,(up?rp*1.8:16)*H)}}else if(SET.touch==='tilt'){TOUCH.target=TILT.v;TOUCH.steer+=(TILT.v-TOUCH.steer)*Math.min(1,H*8)}else TOUCH.steer+=((TOUCH.target||0)-TOUCH.steer)*Math.min(1,H*(TOUCH.sid!=null?9:14));if(Math.abs(TOUCH.steer)<.004)TOUCH.steer=0;if(TOUCH.sid!=null||TOUCH.steer||TOUCH.dir)steer=TOUCH.steer;boost=Math.max(boost,TOUCH.boost?1:0);
    // holding full lock opens the airbrake on that side: a drift
    if(SET.touch==='drag'&&Math.abs(TOUCH.steer)>.93){TOUCH.lock+=H;if(TOUCH.lock>.45){if(TOUCH.steer<0)abL=1;else abR=1}}else TOUCH.lock=0}
  if(mirror){steer=-steer;const t=abL;abL=abR;abR=t}
  if(RC.type==='zone'&&!brk)thr=1;
  if(TOUCH.on&&TOUCH.used&&brk&&Math.abs(steer)>.25&&state==='roam'&&RO.v>(RO.inCity?W14_ST.hbCity:24)&&!TOUCH.park){hb=1;brk=0}
  return{steer,thr,brk,abL,abR,boost,hb,park:!!TOUCH.park}}
function award(s,label,boost,pts,col='#4ceaff'){if(!s.isPlayer)return;s.bm=Math.min(100,s.bm+boost);s.style+=pts;feed(label,pts,col)}
const C26={on:1,muCity:{road:15,dirt:9,water:5.5},muOff:1.18,muRace:30,brkCity:13,thUp:3.2,thDn:8,bkUp:4,bkDn:10,kF:.18,kR:.38,kT:.08,fall:.14,align:2.2,scrub:1.4,pK:.0036,rK:.0034,pMax:.065,rMax:.07,w:11,z:.42,aiMu:.9};
function C26_F(x){const a=Math.abs(x);return a/Math.pow(1+Math.pow(a,6),1/6)*(1-C26.fall*clamp((a-1.1)/1.2,0,1))}
function C26_ramp(o,c,dt){const t=clamp(c.thr||0,0,1),b=clamp(c.brk||0,0,1);o.thA=(o.thA||0)+clamp(t-(o.thA||0),-dt*C26.thDn,dt*C26.thUp);o.bkA=(o.bkA||0)+clamp(b-(o.bkA||0),-dt*C26.bkDn,dt*C26.bkUp);o.c26b=o.bkA*(1-.5*o.thA);o.c26t=o.thA*(1-o.bkA)}
// demanded yaw rate -> what the front tyres can deliver at this speed
function C26_yawCap(o,r,sp,mu){if(!C26.on||sp<3)return r;const muF=mu*(1+C26.kF*(o.c26b||0)-C26.kT*(o.c26t||0)),cap=muF/sp,x=Math.abs(r)/cap;o.c26x=x;return x<.6?r:Math.sign(r)*cap*C26_F(x)}
// velocity heading step limited by rear grip; returns the step (rad) and stores lateral accel for the body lean
function C26_vhStep(o,d,k,dt,sp,mu,free){let st=d*Math.min(1,dt*k);if(C26.on&&!free&&sp>3){const muR=mu*(1-C26.kR*(o.c26b||0)+C26.kT*.5*(o.c26t||0)),cap=muR/sp*dt;st=clamp(st,-cap,cap)}o.c26lat=dt>0?st/dt*sp:0;return st}
// spring-damper body pitch / roll (rad) from longitudinal / lateral accel
function C26_body(o,aL,aY,dt,snap){const tp=clamp(aL*C26.pK,-C26.pMax,C26.pMax*.55),tr=clamp(aY*C26.rK,-C26.rMax,C26.rMax);if(snap||o.c26p==null){o.c26p=tp;o.c26r=tr;o.c26pv=0;o.c26rv=0;return}
 const n=Math.max(1,Math.ceil(dt/.02)),h=dt/n,w2=C26.w*C26.w,c=2*C26.z*C26.w;for(let i=0;i<n;i++){o.c26pv+=(w2*(tp-o.c26p)-c*o.c26pv)*h;o.c26p+=o.c26pv*h;o.c26rv+=(w2*(tr-o.c26r)-c*o.c26rv)*h;o.c26r+=o.c26rv*h}
 o.c26p=clamp(o.c26p,-.09,.06);o.c26r=clamp(o.c26r,-.1,.1)}
// rotate only the body bricks about the car origin; wheels (userData.r) are left where they are
const _c26Q=new THREE.Quaternion(),_c26E=new THREE.Euler();
function C26_lean(ud,p,r){_c26Q.setFromEuler(_c26E.set(p,0,r));ud.m.traverse(o=>{if(!o.isMesh||o.userData.r||!o.userData.gb)return;const u=o.userData;if(!u.crP0){u.crP0=o.position.clone();u.crQ0=o.quaternion.clone()}o.position.copy(u.crP0).applyQuaternion(_c26Q);o.quaternion.copy(_c26Q).multiply(u.crQ0)})}
const C26_muRace=s=>C26.muRace*(s.stats.han||1)*cls.mul*(s.boatMode?.7:s.dirtMode?.8:1);
// race: shared yaw / slip / position step for the player and the AI
function C26_raceYaw(s,target,H){if(s.air||s.hbDir)return target;const sp=Math.max(1,s.v);let t=C26_yawCap(s,target,sp,C26_muRace(s));const b=s.yaw-s.beta;if(C26.on)t-=C26.align*(b-clamp(b,-.1,.1))*Math.min(1,sp/20);return t}
function C26_raceBeta(s,g,H,free){const d=s.yaw-s.beta,st=C26_vhStep(s,d,g,H,Math.max(1,s.v),C26_muRace(s),free||s.air);s.beta+=st}
function physPlayer(s,c){const st=s.stats;frameAt(TD,s.dist,F);const k=F.k;
  s.aab=0;if(SET.assist!=='off'&&TOUCH.used&&!s.air&&state==='race'){let kA=0;for(let d=15;d<=135;d+=20)kA=Math.max(kA,Math.abs(kAt(TD,s.dist+d)));const vr0=Math.min(1,s.v/st.top0),Rm=(1.32-.52*vr0)*st.han*{low:.85,normal:1,high:1.15}[SET.steer],need=kA*s.v,kL=kAt(TD,s.dist+12),cap=Math.min(Rm+(s.v>st.top0*.3?.5*st.han:0),C26.on?C26_muRace(s)*.95/Math.max(1,s.v):9);
    if(Math.abs(kL)*s.v>Rm*.72&&s.v>st.top0*.3&&!c.hb)s.aab=Math.sign(kL);if(need>cap*.8){c.thr=0;c.boost=0}if(need>cap*.98)c.brk=Math.max(c.brk,.7)}
  if(c.boost&&!s.bPrev){if(raceT-(s.bT??-9)<.32&&PK.has('_lock')&&state==='race'){s.spLock=!s.spLock;feed(s.spLock?'BOOST LOCK ON':'BOOST LOCK OFF',0,'#ffd12c');AU.sfx('pick')}s.bT=raceT}s.bPrev=!!c.boost;if(s.spLock){if(c.brk>0||s.dead>0)s.spLock=false;else c.thr=1}
  s.nitro=!!c.boost&&s.bm>.5&&!s.air&&state==='race';if(s.nitro){if(!s.wasNitro){AU.sfx('nitro');fovKick=Math.max(fovKick,8)}s.bm=Math.max(0,s.bm-24*H)}s.wasNitro=s.nitro;
  const top=st.top*(s.turbo>0?1.2:1)*(s.boost>0?1.12:1)*(s.nitro?1.3:1)*(s.spLock?1.06:1);
  const vr=Math.min(1,s.v/st.top0),Rmax=(1.32-.52*vr)*st.han*(s.air?.85:1)*{low:.85,normal:1,high:1.15}[SET.steer];
  if(SET.assist!=='off'&&TOUCH.used&&state==='race'){const u=c.steer,au=Math.abs(u);if(au>=.06||s.holdX==null)s.holdX=clamp(s.x+s.v*Math.sin(s.beta)*.17,-(MARGIN-3.5*CR_LS),MARGIN-3.5*CR_LS);if(s.aab>0)c.abR=Math.max(c.abR,1);else if(s.aab<0)c.abL=Math.max(c.abL,1);
    const yMax=Math.min(.3,SENS().lat/Math.max(40,s.v));let desYaw=au<.06?clamp((s.holdX-s.x)*1.9/Math.max(40,s.v),-.12,.12):u*yMax;
    const edge=Math.abs(s.x)-(MARGIN-5*CR_LS);if(edge>0&&Math.sign(desYaw)===Math.sign(s.x))desYaw*=Math.max(0,1-edge/4);
    c.steer=clamp((k*s.v+(desYaw-s.beta)*6-(c.abR-c.abL)*.62*st.han)/Math.max(.2,Rmax),-1,1);s.asst=1}else s.asst=0
  const hbOk=c.hb&&!s.air&&s.v>st.top0*.3&&state==='race';
  if(hbOk&&!s.hbDir&&Math.abs(c.steer)>.2){s.hbDir=Math.sign(c.steer);s.hbT=0;AU.sfx('roll')}
  if(s.hbDir&&!hbOk){const tr=s.hbT>2.1?3:s.hbT>1.2?2:s.hbT>.55?1:0;if(tr){s.boost=Math.max(s.boost,[0,.7,1.2,1.8][tr]);award(s,['','MINI-TURBO','SUPER TURBO','ULTRA TURBO'][tr],8*tr,250*tr*tr,['','#4ceaff','#ff9a3c','#c46bff'][tr]);AU.sfx('boost');fovKick=Math.max(fovKick,5+3*tr)}s.hbDir=0;s.hbT=0}
  let target=c.steer*Rmax+(s.air?0:(c.abR-c.abL)*.62*st.han);
  if(s.hbDir){const into=clamp(c.steer*s.hbDir,-1,1);target=s.hbDir*Rmax*(.95+.45*into);s.hbT+=H*(1+.8*Math.max(0,into))*(PK.has('drift')?1.35:1);s.bm=Math.min(100,s.bm+6*H);
    const tr=s.hbT>2.1?3:s.hbT>1.2?2:s.hbT>.55?1:0;if(R()<.8){const col=[new THREE.Color(1.4,1.4,1.4),new THREE.Color(.6,1.6,2.6),new THREE.Color(2.6,1.2,.3),new THREE.Color(1.8,.6,2.6)][tr];for(const sd of[-1,1]){const at=V3().copy(F.p).addScaledVector(F.r,s.x+sd*2.2).addScaledVector(F.u,.3).addScaledVector(F.t,-3.2);emit(SPARK,at,V3(rr(-2,2),rr(1,4),rr(-2,2)).addScaledVector(F.t,-s.v*.2),.25,col)}}}target=C26_raceYaw(s,target,H);s.yawRate+=(target-s.yawRate)*Math.min(1,H*(s.hbDir?10:s.asst?(C26.on?18:30):(C26.on?11:20)));
  const ab=c.abL+c.abR;
  C26_ramp(s,C26.on?c:{thr:c.thr,brk:c.brk},C26.on?H:1);let a=0;if(!s.air){if(s.thA>0)a+=st.acc*s.thA*Math.max(0,1-Math.pow(s.v/top,3));if(s.v>top)a-=(s.v-top)*1.2;if(s.bkA>0)a-=st.brake*s.bkA;
    if(s.turbo>0)a+=4.5*cls.mul;if(s.boost>0)a+=6.5*cls.mul;if(s.nitro)a+=9*cls.mul;a-=ab*6*vr*cls.mul+(s.hbDir?2*cls.mul:0);a-=.01*s.v}else a=-.004*s.v;
  s.v=Math.max(0,s.v+a*H);s.maxSpeed=Math.max(s.maxSpeed,s.v);
  s.yaw+=s.yawRate*H;const grip=(s.hbDir||ab>0?8:12)*st.han*(ab>0?1.2:1)*(s.hbDir?.28:1);C26_raceBeta(s,grip*(s.boatMode?.62:s.dirtMode?.75:1),H,!!s.hbDir||ab>0);
  const sl=Math.sin(s.yaw-s.beta);s.v-=s.v*sl*sl*(s.hbDir?.5:3)*H;
  const px=s.x;const ds=s.v*Math.cos(s.beta)*H/Math.max(.35,1-k*s.x);s.x+=s.v*Math.sin(s.beta)*H;s.dist+=ds;s.yaw-=k*ds;s.beta-=k*ds;
  s.yaw=clamp(s.yaw,-1.5,1.5);s.beta=clamp(s.beta,-1.5,1.5);if(s.hbDir){s.yaw=clamp(s.yaw,-.85,.85);if(Math.abs(s.yaw)>=.85&&Math.sign(s.yawRate)===Math.sign(s.yaw))s.yawRate*=.5}
  s.rollCd=Math.max(0,s.rollCd-H);if(s.crSR&&s.rollT<=0)s.crSR=0;if(pressed.roll&&s.rollCd<=0&&s.rollT<=0&&!s.air){s.rollDir=mirror?-pressed.roll:pressed.roll;s.rollT=ROLL_T;s.rollCd=1;s.rollHit=false;AU.sfx('roll');CR_lgFx(s)}pressed.roll=0;
  if(s.rollT>0){s.rollT-=H;if(s.rollT>ROLL_T-.32&&!s.air&&!s.crSR){s.x=clamp(s.x+s.rollDir*CR_LGV*H,-MARGIN,MARGIN);s.holdX=s.x}else s.holdX=s.x}
  const drifting=!s.air&&ab>0&&!s.aab&&Math.abs(c.steer)>.3&&Math.sign(c.steer)===Math.sign(c.abR-c.abL)&&s.v>st.top0*.5;
  if(drifting){s.driftT+=H;s.bm=Math.min(100,s.bm+14*H);if(R()<.6){const at=V3().copy(F.p).addScaledVector(F.r,s.x-Math.sign(c.steer)*2).addScaledVector(F.u,.4).addScaledVector(F.t,-3);emit(SPARK,at,V3(rr(-3,3),rr(1,5),rr(-3,3)).addScaledVector(F.t,-s.v*.3),.3,new THREE.Color(2,1.2,.5))}}
  else if(s.driftT>0){if(s.driftT>.7)award(s,'DRIFT',0,Math.round(s.driftT*300),'#ff7ac0');s.driftT=0}
  s.wall=Math.max(0,s.wall-H);
  if(Math.abs(s.x)>MARGIN){const sg=Math.sign(s.x);s.x=sg*MARGIN;const into=Math.sin(s.beta)*sg;
    if(into>0&&!s.air){const imp=s.v*into;s.beta=-s.beta*.3;if(Math.sign(s.yaw)===sg)s.yaw*=.35;if(Math.sign(s.yawRate)===sg)s.yawRate*=.3;
      if(imp>5){s.v=Math.max(0,s.v-imp*.75-2);damage(s,imp*.35/st.hull);if(imp>11)debris(V3().copy(F.p).addScaledVector(F.r,sg*(HALF-1)).addScaledVector(F.u,1.4),F.t.clone().multiplyScalar(s.v*.5),4,teamCols(s.team),.8,F.p.y+.2);AU.sfx('crash');shake=Math.min(1,imp/30);fovKick=Math.max(fovKick,5);
        const at=V3().copy(F.p).addScaledVector(F.r,sg*HALF).addScaledVector(F.u,1);burst(SPARK,at,24,26,.5,new THREE.Color(2,1.4,.6))}
      else{s.v*=1-.7*H;s.wall=.1;damage(s,1.2*H);if(R()<.5){const at=V3().copy(F.p).addScaledVector(F.r,sg*HALF).addScaledVector(F.u,.8);emit(SPARK,at,V3(rr(-4,4),rr(2,8),rr(-4,4)).addScaledVector(F.t,-s.v*.4),.35,new THREE.Color(2,1.5,.7))}}}}
  s.latV=(s.x-px)/H;
  if(Math.cos(s.yaw)<-.1)s.wrong+=H;else s.wrong=0;
  waterStep(s);airStep(s)}
function airStep(s){
  if(!s.air){const j=jumpAt(TD,s.dist),key=j?j.id+'_'+Math.floor(s.dist/TD.L):'';
    if(j&&s.lastJump!==key){s.lastJump=key;const need=.6*s.stats.top0;if(!s.isPlayer)s.v=Math.max(s.v,need*1.12);
      frameAt(TD,s.dist,F2);s.air={y:yAt(TD,s.dist)+1.4,vy:Math.min(s.v*.2+s.v*Math.max(0,F2.t.y),j.g*1.25),j,t:0,fall:false,cleared:false};s.air.off=F2.p.y+F2.r.y*s.x-s.air.y;if(s.isPlayer){AU.sfx('launch');fovKick=Math.max(fovKick,10);say('',s.v<need?'TOO SLOW!':'JUMP!',.8)}}
    return}
  const A=s.air;A.t+=H;A.vy-=A.j.g*H;A.y+=A.vy*H;const ty=yAt(TD,s.dist)+1.4,inGap=jumpAt(TD,s.dist)===A.j,off=A.off||0;{let cap=1e9;for(let d=0;d<=40;d+=5){const y=yAt(TD,s.dist+d);if(y<-4)cap=Math.min(cap,y+9+(1-clamp((-y-4)/8,0,1))*40)}if(A.y+off>cap){A.y=cap-off;if(A.vy>0)A.vy=0}}
  if(s.isPlayer){s.bm=Math.min(100,s.bm+9*H);s.airTime+=H}
  if(A.fall){s.v*=1-2*H;if(A.y<A.j.floor||A.t>5)crashJump(s);return}
  if(inGap){if(A.y<A.j.floor)crashJump(s);return}
  if(!A.cleared){if(A.y>=ty-2.6||!s.isPlayer)A.cleared=true;else{A.fall=true;s.v*=.25;if(s.isPlayer){AU.sfx('crash');shake=1}return}}
  frameAt(TD,s.dist,F2);if(A.y+off<=F2.p.y+F2.r.y*s.x){const imp=-A.vy;s.air=null;if(s.isPlayer){AU.sfx('land');shake=Math.min(1,imp/25);fovKick=Math.max(fovKick,6);if(A.t>1.1)award(s,'BIG AIR',6,Math.round(A.t*400),'#5dffb0');
    burst(SPARK,s.mesh.position.clone(),30,18,.5,new THREE.Color(1,1.6,2))}}}
function crashJump(s){const j=s.air.j;const at=s.mesh.position.clone();if(j.kind==='river'){burst(WATER,at,120,34,1.4,new THREE.Color(.8,1.2,2));if(s.isPlayer)AU.sfx('splash')}else{burst(FIRE,at,70,40,1.2,new THREE.Color(2,.9,.3));if(s.isPlayer)AU.sfx('boom')}
  const base=s.dist-mod(s.dist,TD.L);s.dist=base+j.s1+30;s.air=null;s.dead=1.6;s.v=0;s.x=0;s.hull=Math.max(RC.type==='zone'?0:10,s.hull-(RC.type==='zone'?35:20));if(RC.type==='zone'&&s.isPlayer&&s.hull<=0){s.dead=0;explode(s);return}
  if(s.isPlayer){shake=1;flashHud();say('WIPEOUT',(j.msg||'OFF THE TRACK')+' · FULL THROTTLE NEXT TIME',1.6)}}
function zoneUp(){const Z=RC.zone;Z.k++;Z.next+=ZLEN;const m=Math.min(1.55,.72+.055*(Z.k-1));Z.mul=m;const t=pl.team;pl.stats.top=BASE_TOP*m*t.top;pl.stats.top0=BASE_TOP*m;pl.stats.acc=8.4*m*t.acc;pl.stats.brake=8+m;
  pl.hull=Math.min(100,pl.hull+12);AU.sfx('lap');fovKick=Math.max(fovKick,8);say('ZONE '+Z.k,m.toFixed(2)+'× SPEED · +12 HULL',1.3);feed('ZONE '+Z.k,Z.k*500,'#5dffb0');pl.style+=Z.k*500}
const AI_LAT=90,AI_BRK=14;
// AI on the shared model: throttle/brake toward the corner speed, steering toward the line; same ramps, grip and slip
function C26_aiDrive(s,k,vmax,xt,sk){const st=s.stats,px=s.x;if(s.crXT==null||Math.abs(s.crXT-s.x)>20)s.crXT=s.x;s.crXT+=(xt-s.crXT)*Math.min(1,H*(s.attackT>0?8:3));
  const c={thr:s.v<vmax-.4?1:s.v<vmax?.4:0,brk:s.v>vmax+.6?clamp((s.v-vmax)/3,.25,1):0};C26_ramp(s,c,H);
  if(!s.air){const top=st.top*1.05;let a=s.thA*(st.acc*sk*Math.max(.15,1-s.v/top)+(s.boost>0?5:0)+(s.nitro?7.5*cls.mul:0))-s.bkA*Math.max(st.brake,AI_BRK*cls.mul);if(s.v>top)a-=(s.v-top)*1.2;s.v=Math.max(0,s.v+a*H)}else s.v-=.004*s.v*H;
  const sp=Math.max(4,s.v),vr=Math.min(1,s.v/st.top0),Rmax=(1.32-.52*vr)*st.han,desB=clamp(Math.atan2((s.crXT-s.x)*(s.attackT>0?2.2:1.5),sp),-.22,.22);
  let target=clamp(k*s.v+(desB-s.beta)*5.5,-Rmax,Rmax);target=C26_raceYaw(s,target,H);s.yawRate+=(target-s.yawRate)*Math.min(1,H*11);
  s.yaw+=s.yawRate*H;C26_raceBeta(s,12*st.han*(s.boatMode?.62:s.dirtMode?.75:1),H,false);const sl=Math.sin(s.yaw-s.beta);s.v-=s.v*sl*sl*3*H;
  const ds=s.v*Math.cos(s.beta)*H/Math.max(.35,1-k*s.x);s.x+=s.v*Math.sin(s.beta)*H;s.dist+=ds;s.yaw-=k*ds;s.beta-=k*ds;s.yaw=clamp(s.yaw,-1.2,1.2);s.beta=clamp(s.beta,-1.2,1.2);
  if(Math.abs(s.x)>MARGIN){const sg=Math.sign(s.x);s.x=sg*MARGIN;if(Math.sin(s.beta)*sg>0){s.v*=1-Math.min(.5,Math.abs(Math.sin(s.beta))*1.5);s.beta*=.3;s.yaw*=.4;s.yawRate*=.3}}
  s.latV=(s.x-px)/H}
function physAI(s){const st=s.stats,sk=s.skill*s.rubber;frameAt(TD,s.dist,F);const k=F.k;
  s.aiN=(s.aiN||0)-H;s.aiNcd=(s.aiNcd??rr(4,9))-H;if(s.aiNcd<=0&&Math.abs(kAt(TD,s.dist+80))<1/600&&RC.type!=='attract'){s.aiN=rr(1.8,3);s.aiNcd=rr(5,10)*(1.15-sk*.2)}
  s.nitro=s.aiN>0;
  let vmax=st.top*sk*(s.turbo>0?1.2:1)*(s.boost>0?1.12:1)*(s.nitro?1.26:1);const look=Math.max(80,s.v*1.8);
  const aiLat=C26.on?C26_muRace(s)*C26.aiMu*(.9+.1*sk):AI_LAT*sk*st.han*cls.mul;for(let d=10;d<look;d+=12){const kk=Math.abs(kAt(TD,s.dist+d));const vc=Math.sqrt(aiLat/Math.max(kk,1e-5));vmax=Math.min(vmax,Math.sqrt(vc*vc+2*AI_BRK*cls.mul*Math.max(0,d-10)))}
  let ka=0;for(let d=30;d<=150;d+=20)ka+=kAt(TD,s.dist+d);ka/=7;let xt=clamp(ka*3200+s.laneBias,-MARGIN+1.2,MARGIN-1.2);
  for(const o of ships){if(o===s||o.dead||o.eliminated)continue;const dd=o.dist-s.dist;if(dd>0&&dd<26&&Math.abs(o.x-s.x)<4)xt=clamp(o.x+CR_dodge(s,o)*6,-MARGIN+1,MARGIN-1)}
  for(const m of mines){const dd=m.dist-s.dist;if(dd>0&&dd<60&&Math.abs(m.x-s.x)<4)xt=clamp(m.x+(m.x>0?-4:4),-MARGIN+1,MARGIN-1)}
  for(const c of traffic){if(c.wreck)continue;const dd=tdd(c.dist,s.dist);if(dd>0&&dd<(s.v-c.v)*1.6+25&&Math.abs(c.x-xt)<c.wid/2+3){const l=c.x-c.wid/2-3.4,r=c.x+c.wid/2+3.4;xt=((Math.abs(l-s.x)<Math.abs(r-s.x)&&l>-MARGIN)||r>MARGIN)?l:r;xt=clamp(xt,-MARGIN+.5,MARGIN-.5);if(dd<12&&Math.abs(c.x-s.x)<c.wid/2+2.2)vmax=Math.min(vmax,c.v)}}
  const ag=(RC.aggr||0)+(s.aggrB||0);if(ag>0&&pl&&!pl.dead&&!pl.eliminated&&state==='race'){s.aggrCd-=H;const dd=pl.dist-s.dist;if(s.attackT<=0&&s.aggrCd<=0&&Math.abs(dd)<9&&Math.abs(pl.x-s.x)<9&&R()<ag*H*3){s.attackT=1.3;s.aggrCd=rr(5,9)}
    if(s.attackT>0){s.attackT-=H;xt=clamp(pl.x+(pl.x>s.x?1.5:-1.5),-MARGIN,MARGIN)}}
  if(!C26.on){if(s.v<vmax)s.v+=st.acc*sk*Math.max(.15,1-s.v/(st.top*1.05))*H+(s.boost>0?5*H:0)+(s.nitro?7.5*cls.mul*H:0);else s.v=Math.max(vmax,s.v-AI_BRK*cls.mul*H);
  const px=s.x,lat=(s.attackT>0?14:9)*cls.mul;if(s.crXT==null||Math.abs(s.crXT-s.x)>20){s.crXT=s.x;s.crLV=0}s.crXT+=(xt-s.crXT)*Math.min(1,H*(s.attackT>0?8:3));const dvx=clamp((s.crXT-s.x)*2.5,-lat,lat);s.crLV=(s.crLV||0)+clamp(dvx-(s.crLV||0),-30*H,30*H);s.x=clamp(s.x+s.crLV*H,-MARGIN,MARGIN);
  const ds=s.v*H/Math.max(.35,1-k*s.x);s.dist+=ds;s.latV=(s.x-px)/H;s.yaw=Math.atan2(s.latV,Math.max(1,s.v));s.beta=s.yaw}else C26_aiDrive(s,k,vmax,xt,sk);
  waterStep(s);airStep(s)}
function damage(s,d){if(s.shield>0||s.inv>0||s.dead>0||(s.rollT>ROLL_T-.3&&d>3)||(s.finished&&s.isPlayer))return false;if(s.isPlayer)d*=RC.dmgK||1;s.hull-=d;s.lastHit=raceT;if(s.hull<=0)explode(s);return true}
function explode(s,msg,imp){wreckStart(s,imp);s.dead=2.2;s.hull=0;s.v=0;s.item=null;if(s.isPlayer&&PK.has('empwreck')&&state==='race'){itemSpinUntil=0;s.item='emp';useItem(s)}s.air=null;if(RC.type==='arena')s.lives--;
  if(RC.type==='zone'&&s.isPlayer&&state==='race'){state='finished';finishT=2;pl.finishTime=raceT;pl.finished=true;s.dead=99;s.zoneKm=pl.dist/1000;AU.sfx('boom');shake=1;flashHud();say('WRECKED','ZONE '+RC.zone.k+' · '+(pl.dist/1000).toFixed(2)+' KM',2.4);return}const p=s.mesh.position;
  if(s.isPlayer&&s.lastBy&&raceT-s.lastByT<2.5&&state==='race'){rivalHit(s.lastBy,'gloat');s.lastBy=null}
  if(s.isPlayer){s.after=RC.jn?3.2:1.3;AU.sfx('boom');shake=1;flashHud();if(RC.jn){s.dead=99;say('CRASH!','AFTERTOUCH · STEER YOUR WRECK',2.2);crashCam(s,2.6)}else{say(msg||'WRECKED','AFTERTOUCH · STEER THE WRECK',1.6);crashCam(s,1.6)}}else if(pl&&Math.abs(s.dist-pl.dist)<400)AU.sfx('boom')}
// weapon props: 3D tornado, brick wall, oil slick
const _wm=new THREE.Matrix4();let WFXG=null;
function wfxMesh(k){if(!WFXG){const add={transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false,side:THREE.DoubleSide};
    WFXG={cone:new THREE.CylinderGeometry(5,.7,12,20,6,true),tm:new THREE.MeshBasicMaterial(Object.assign({color:new THREE.Color(.7,.4,1.4),opacity:.12},add)),tw:new THREE.MeshBasicMaterial(Object.assign({color:new THREE.Color(1,.6,1.8),opacity:.45,wireframe:true},add)),
      brick:new THREE.BoxGeometry(2,1.15,1.1),bm:new THREE.MeshStandardMaterial({color:'#ff7a2a',emissive:'#ff5a10',emissiveIntensity:.55,roughness:.5}),bm2:new THREE.MeshStandardMaterial({color:'#ffd12c',emissive:'#ffb000',emissiveIntensity:.5,roughness:.5}),
      disc:new THREE.CircleGeometry(1,28),om:new THREE.MeshBasicMaterial({color:'#020604',transparent:true,opacity:.88,depthWrite:false}),ring:new THREE.RingGeometry(.86,1,32),rm:new THREE.MeshBasicMaterial(Object.assign({color:new THREE.Color(.3,1.6,.8),opacity:.7},add))}}
  const g=new THREE.Group(),G=WFXG;
  if(k==='tornado'){const a=new THREE.Mesh(G.cone,G.tm),b=new THREE.Mesh(G.cone,G.tw);a.position.y=b.position.y=6;b.scale.set(.82,1,.82);g.add(a,b);g.userData.spin=[a,b]}
  else if(k==='wall'){for(let r=0;r<3;r++)for(let i=0;i<6;i++){const x=-5.5+i*2.1+(r%2?1.05:0);if(x>6)continue;const o=new THREE.Mesh(G.brick,(i+r)%3?G.bm:G.bm2);o.position.set(x,.6+r*1.17,0);g.add(o)}}
  else{const d=new THREE.Mesh(G.disc,G.om),r=new THREE.Mesh(G.ring,G.rm);for(const o of[d,r]){o.rotation.x=-Math.PI/2;o.scale.setScalar(4.6);o.position.y=.12}r.position.y=.14;g.add(d,r)}
  scene.add(g);return g}
function wfxDrop(o){if(o&&o.mesh){scene.remove(o.mesh);o.mesh=null}}
function wfxPlace(o,f,x,h){if(!o.mesh)o.mesh=wfxMesh(o.type);_wm.makeBasis(f.r,f.u,f.t);o.mesh.quaternion.setFromRotationMatrix(_wm);o.mesh.position.copy(f.p).addScaledVector(f.r,x).addScaledVector(f.u,h)}
function wreckStart(s,imp){const ud=s.mesh.userData,f=frameAt(TD,s.dist,F2),p=s.mesh.position.clone().add(ud.m.position);
  s.wreck={p,v:f.t.clone().multiplyScalar(s.v*.55).addScaledVector(Yup,rr(9,15)).addScaledVector(f.r,rr(-6,6)).add(imp||V3()),q:ud.m.quaternion.clone(),w:V3(rr(-5,5),rr(-4,4),rr(-8,8)),floor:(s.air?yAt(TD,s.dist):f.p.y)+.8};
  const near=!pl||Math.abs(tdd(s.dist,pl.dist))<600;if(!near)return;
  for(const part of ud.parts)if(part.visible){part.visible=false}debris(p,s.wreck.v.clone().multiplyScalar(.5),22,teamCols(s.team),1.1,s.wreck.floor-.6);
  fireball(p,7,4,.7);puff(p,14,new THREE.Color(.04,.04,.05),5,22,3,.9,2.5,6);burst(SPARK,p,60,55,.9,new THREE.Color(2,1.6,.9));burst(FIRE,p,14,20,.5,new THREE.Color(1,.42,.12))}
function wreckStep(s,dt){const w=s.wreck,ud=s.mesh.userData;if(s.isPlayer&&s.after>0&&(state==='race'||state==='finished'))afterTouch(s,w,dt);w.v.y-=30*dt;w.p.addScaledVector(w.v,dt);
  if(w.p.y<w.floor){w.p.y=w.floor;if(w.v.y<-3){burst(SPARK,w.p,14,22,.5,new THREE.Color(2,1.5,.8));if(pl&&Math.abs(tdd(s.dist,pl.dist))<300)AU.sfx('bump')}w.v.y=Math.abs(w.v.y)*.34;w.v.x*=.72;w.v.z*=.72;w.w.multiplyScalar(.6)}
  _e2.set(w.w.x*dt,w.w.y*dt,w.w.z*dt);w.q.multiply(_q2.setFromEuler(_e2));s.mesh.position.copy(w.p);s.mesh.quaternion.identity();ud.m.position.set(0,0,0);ud.m.quaternion.copy(w.q);
  for(const rb of ud.ribbons)rb.scale.z=.001;for(const f of ud.flares)f.scale.set(.01,.01,1);ud.under.visible=ud.shadow.visible=ud.shield.visible=false;
  s.mesh.visible=!s.eliminated&&s.dead>.3;s.fxAcc=(s.fxAcc||0)+dt*26;while(s.fxAcc>1){s.fxAcc--;emitS(SMOKE,w.p,V3(rr(-1,1),rr(2,5),rr(-1,1)),rr(1.4,2.4),new THREE.Color(.05,.05,.07),3,14,.7,true);if(R()<.4)emitS(FIREB,w.p,V3(rr(-2,2),rr(1,4),rr(-2,2)),rr(.25,.5),new THREE.Color(1.3,.5,.12),1.8,3.6,.8,false)}}
function restoreParts(s){for(const p of s.mesh.userData.parts)p.visible=true;s.partsLost=0}
// damage you can see: smoke from 60% hull, parts tear off at 55% and 30%, fire under 30%
function damageFx(s,dt){if(s.dead>0||s.eliminated)return;const h=s.hull,ud=s.mesh.userData,near=!pl||Math.abs(tdd(s.dist,pl.dist))<500;
  if(h>=96&&s.partsLost)restoreParts(s);
  const lose=h<30?2:h<55?1:0;while((s.partsLost||0)<lose&&near){const part=ud.parts[(s.partsLost||0)*2+(s.team.id.length%2)];s.partsLost=(s.partsLost||0)+1;if(!part||!part.visible)continue;part.visible=false;const at=part.getWorldPosition(V3());
    debris(at,(s._fw||V3()).clone().multiplyScalar(s.v*.4),6,teamCols(s.team),1.5,at.y-2);burst(SPARK,at,24,30,.5,new THREE.Color(2,1.5,.8));if(s.isPlayer){feed('PART LOST',0,'#ff7a1c');AU.sfx('hit')}}
  if(h>=60||!near)return;const rear=s.mesh.position.clone().add(ud.m.position).addScaledVector(s._fw||F.t,-3.2);
  s.fxAcc=(s.fxAcc||0)+dt*(1-h/60)*38;while(s.fxAcc>1){s.fxAcc--;emitS(SMOKE,rear,V3(rr(-1,1),rr(1.5,3.5),rr(-1,1)),rr(1,2),h<30?new THREE.Color(.04,.04,.05):new THREE.Color(.16,.16,.19),1.6,9,h<30?.75:.45,true);
    if(h<30&&R()<.7)emitS(FIREB,rear,V3(rr(-1.5,1.5),rr(.5,2.5),rr(-1.5,1.5)),rr(.2,.4),new THREE.Color(1.4,rr(.4,.7),.12),1.1,2.4,.9,false);if(R()<.12)emit(SPARK,rear,V3(rr(-4,4),rr(2,7),rr(-4,4)),.35,new THREE.Color(2,1.5,.8))}}
let CC=null,ccCool=0;
function crashCam(s,dur){if(SET.cc==='off'||state!=='race'||ccCool>0||!s)return;const d=SET.cc==='short'?dur*.55:dur;CC={s,t:0,dur:d,a0:rr(0,6.28),dir:R()<.5?-1:1};ccCool=d+7;slowmo=0;document.body.classList.add('cine')}
function endCrashCam(){CC=null;document.body.classList.remove('cine')}
function afterTouch(s,w,dt){s.after-=dt;const c=ctlPlayer();const J=RC.jn;if(J&&state==='race'){if(!c.boost)J.armed=1;if(!J.boom&&((J.armed&&c.boost)||pressed.fire)){pressed.fire=false;crashBreaker(s,w)}}frameAt(TD,s.dist,F2);w.v.addScaledVector(F2.r,c.steer*46*dt);if(c.thr)w.v.addScaledVector(F2.t,12*dt);
  if(state!=='race')return;for(const o of ships){if(o===s||o.dead>0||o.eliminated)continue;if(o.mesh.position.distanceToSquared(w.p)<30){explode(o,null,w.v.clone().multiplyScalar(.6));s.takedowns++;award(s,'AFTERTOUCH TAKEDOWN',30,2000,'#ff2d95');AU.sfx('takedown')}}
  for(const o of traffic){if(o.wreck||Math.abs(tdd(o.dist,s.dist))>160)continue;frameAt(TD,o.dist,F2);if(hit2(F2.p.addScaledVector(F2.r,o.x),w.p,o.len/2+4))wreckTraffic(o,{v:w.v.length(),x:o.x-Math.sign(o.x-s.x||1),isPlayer:true,dead:1,after:1},1.1)}}
function crashBreaker(s,w){const J=RC.jn;J.boom=1;w.v.y+=16;burst(FIRE,w.p,60,34,.9,new THREE.Color(2.2,1,.3));burst(SPARK,w.p,50,40,.7,new THREE.Color(2,1.5,.8));puff(w.p,8,new THREE.Color(.1,.1,.12),5,24,2.4,.6,2,4);shake=1.2;flash=.4;AU.sfx('boom');say('CRASHBREAKER','',1.2);
  for(const o of traffic){if(o.wreck||Math.abs(tdd(o.dist,s.dist))>90)continue;frameAt(TD,o.dist,F2);if(hit2(F2.p.addScaledVector(F2.r,o.x),w.p,22))wreckTraffic(o,{v:40,x:o.x-Math.sign(o.x||1),chain:1},1.3)}}
function takedown(o){if(state==='race')rivalHit(o,'hurt');const side=Math.sign(o.x-pl.x)||1;frameAt(TD,o.dist,F2);explode(o,null,F2.r.clone().multiplyScalar(side*14).addScaledVector(F2.t,pl.v*.25));crashCam(o,1.9);pl.takedowns++;award(pl,'TAKEDOWN',40,1500,'#ff2d95');AU.sfx('takedown');slowmo=.9;shake=.8;flash=.25;fovKick=12;say('TAKEDOWN',o.name+' · '+o.team.name.toUpperCase(),1.1)}
function hitShip(s,dmg,slow,spin,by){if(s.isPlayer&&by&&!by.isPlayer){s.lastBy=by;s.lastByT=raceT}if(s.dead<=0&&s.shield<=0&&s.rollT<=0){const at=s.mesh.position.clone().add(s.mesh.userData.m.position);debris(at,(s._fw||V3()).clone().multiplyScalar(s.v*.5),5,teamCols(s.team),.8,at.y-2)}if(s.shield>0||s.rollT>ROLL_T-.3){if(s.isPlayer)feed(s.shield>0?'SHIELD HOLDS':'DODGED',0,'#31f5c4');return}if(!damage(s,dmg*(RC.type==='arena'?2.3:1)/s.stats.hull))return;
  if(s.dead>0&&by&&by.isPlayer&&s!==by&&state==='race'){crashCam(s,1.5);by.takedowns++;if(by.isPlayer&&PK.has('heal'))by.hull=Math.min(100,by.hull+30);award(by,'KO · '+s.name,30,1200,'#ff2d95');AU.sfx('takedown');slowmo=.5}s.v*=1-slow;s.yawRate+=spin;
  if(s.isPlayer){AU.sfx('hit');shake=.7;flashHud();fovKick=Math.max(fovKick,8)}else if(by&&by.isPlayer)award(by,'HIT · '+s.name,6,250,'#ff5a2d')}
function useItem(s){const it=s.item;if(!it)return;if(s.isPlayer&&performance.now()<itemSpinUntil)return;s.item=null;
  if(it==='turbo'){s.turbo=3.2;if(s.isPlayer){AU.sfx('turbo');say('','TURBO',.8)}}
  else if(it==='shield'){s.shield=s.isPlayer&&PK.has('shield')?11:6;if(s.isPlayer)AU.sfx('shield')}
  else if(it==='rockets'){const nR=s.isPlayer&&PK.has('rail')?4:3;for(let i=0;i<nR;i++)projs.push({type:'rocket',dist:s.dist+6+i*3,x:s.x+(i-(nR-1)/2)*2,v:s.v+170,owner:s,life:2.4});if(s.isPlayer||near(s))AU.sfx('rocket')}
  else if(it==='missile'){let tgt=null,bd=900;for(const o of ships){if(o===s||o.dead||o.finished||o.eliminated)continue;const dd=o.dist-s.dist;if(dd>0&&dd<bd){bd=dd;tgt=o}}projs.push({type:'missile',dist:s.dist+6,x:s.x,v:Math.max(s.v+60,110),owner:s,target:tgt,life:6});if(s.isPlayer||near(s))AU.sfx('missile')}
  else if(it==='emp'){const at=s.mesh.position.clone().add(s.mesh.userData.m.position);burst(SPARK,at,70,44,.6,new THREE.Color(.6,1.8,2.6));burst(FIRE,at,10,30,.4,new THREE.Color(.4,1.4,2.2));let n=0;
    for(const o of ships){if(o===s||o.dead>0||o.eliminated||o.finished)continue;if(Math.abs(tdd(o.dist,s.dist))<42){hitShip(o,s.isPlayer?12:9,s.isPlayer?.5:.35,(R()-.5)*2,s);n++}}
    if(s.isPlayer){AU.sfx('shield');shake=Math.max(shake,.45);feed('EMP'+(n?' ×'+n:''),n*150,'#4ceaff')}else if(near(s))AU.sfx('shield')}
  else if(it==='rail'){let tgt=null,bd=s.isPlayer&&PK.has('rail')?580:360;for(const o of ships){if(o===s||o.dead>0||o.eliminated||o.finished)continue;const dd=tdd(o.dist,s.dist);if(dd>0&&dd<bd&&Math.abs(o.x-s.x)<4.5+dd*.02){bd=dd;tgt=o}}
    const len=tgt?bd:300;for(let i=0;i<44;i++){const f=i/44,fr=frameAt(TD,s.dist+5+len*f,F2);emit(SPARK,fr.p.clone().addScaledVector(fr.r,lerp(s.x,tgt?tgt.x:s.x,f)).addScaledVector(fr.u,1.3),V3(rr(-1,1),rr(0,1.5),rr(-1,1)),.4,new THREE.Color(1.6,1.9,2.8))}
    if(tgt)hitShip(tgt,tgt.isPlayer&&PK.has('armor')?11:s.isPlayer?28:22,s.isPlayer?.6:.45,(R()-.5)*3,s);if(s.isPlayer){flash=.15;feed(tgt?'RAIL HIT':'RAIL MISS',tgt?250:0,'#e8f3ff')}if(s.isPlayer||near(s))AU.sfx('missile')}
  else if(it==='mines'){for(let i=0;i<3;i++)mines.push({dist:s.dist-6-i*5,x:s.x+(i-1)*3.6,owner:s,life:30,arm:.4});if(s.isPlayer||near(s))AU.sfx('mine')}
  else if(it==='tornado'){projs.push({type:'tornado',dist:s.dist+10,x:s.x,v:Math.max(90,s.v+35),owner:s,life:6,hits:new Set(),ph:R()*6});if(s.isPlayer){feed('TORNADO',0,'#b48cff')}if(s.isPlayer||near(s))AU.sfx('missile')}
  else if(it==='wall'){mines.push({type:'wall',dist:s.dist-10,x:clamp(s.x,-Math.max(0,MARGIN-3),Math.max(0,MARGIN-3)),owner:s,life:25,arm:.3,w:Math.min(6.5,W*.3)});if(s.isPlayer||near(s))AU.sfx('brick')}
  else if(it==='oil'){mines.push({type:'oil',dist:s.dist-8,x:s.x,owner:s,life:25,arm:.3,w:4.5,hits:new Set()});if(s.isPlayer||near(s))AU.sfx('mine')}
  else if(it==='magnet'){s.magnet=3.5;if(s.isPlayer){feed('MAGNET',0,'#ff3b6b')}if(s.isPlayer||near(s))AU.sfx('shield')}
  else if(it==='storm'){let n=0;for(const o of ships){if(o===s||o.dead>0||o.eliminated||o.finished)continue;if(tdd(o.dist,s.dist)>0){hitShip(o,10,.4,(R()-.5)*2,s);o.stormT=2.5;n++;if(o.mesh){const at=o.mesh.position.clone().add(o.mesh.userData.m.position);for(let i=0;i<26;i++)emit(SPARK,at.clone().add(V3(rr(-1,1),i*1.5,rr(-1,1))),V3(rr(-2,2),rr(-2,2),rr(-2,2)),.4,new THREE.Color(2.4,2.4,1.4))}}}
    if(s.isPlayer){flash=.25;feed('STORM'+(n?' ×'+n:''),n*120,'#fff27a')}else if(pl&&pl.stormT>0){flash=.2;feed('STRUCK BY LIGHTNING',0,'#fff27a')}if(s.isPlayer||near(s)||(pl&&pl.stormT>0))AU.sfx('shield')}}
const near=s=>pl&&Math.abs(s.dist-pl.dist)<250;
const active=s=>!s.eliminated;
function stepSim(){const racing=state==='race'||state==='menu'||state==='finished';
  for(const s of ships){if(s.eliminated)continue;if(s.dead>0){s.dead-=H;if(s.dead<=0&&RC.type==='arena'&&s.lives<=0){eliminate(s,true);continue}if(s.dead<=0){s.dead=0;s.wreck=null;restoreParts(s);s.hull=s.hull<=0?100:Math.max(s.hull,60);s.v=s.stats.top*.35;s.x=0;s.yaw=s.beta=s.yawRate=0;s.inv=2}continue}
    s.turbo=Math.max(0,s.turbo-H);s.boost=Math.max(0,s.boost-H);s.shield=Math.max(0,s.shield-H);s.inv=Math.max(0,s.inv-H);
    if(s.stormT>0){s.stormT-=H;s.v=Math.min(s.v,s.stats.top*.72)}
    if(s.magnet>0){s.magnet-=H;let tgt=null,bd=320;for(const o of ships){if(o===s||o.dead>0||o.eliminated)continue;const dd=tdd(o.dist,s.dist);if(dd>4&&dd<bd){bd=dd;tgt=o}}
      if(tgt){s.v=Math.max(s.v,Math.min(tgt.v+30,s.stats.top*1.25));s.x+=clamp(tgt.x-s.x,-9*H,9*H);if(s.mesh&&R()<.4){const at=s.mesh.position.clone().add(s.mesh.userData.m.position);emit(SPARK,at,V3(rr(-3,3),rr(0,3),rr(-3,3)),.3,new THREE.Color(2.6,.5,1))}
        if(bd<9){s.magnet=0;s.bm=Math.min(100,s.bm+35);tgt.bm=Math.max(0,(tgt.bm||0)-35);hitShip(tgt,8,.2,(R()-.5)*2,s);if(s.isPlayer)award(s,'BOOST STOLEN',0,400,'#ff3b6b')}}}
    if(RC.type!=='zone'&&raceT-s.lastHit>(RC.derby?6:2.5)&&s.hull<100)s.hull=Math.min(100,s.hull+(RC.derby?2:5)*H);
    if(!racing)continue;
    if(s.isPlayer&&!s.finished){const c=ctlPlayer();if(s.stall>0){c.thr=0;s.stall-=H}physPlayer(s,c);CTL=c;if(TOUCH.used)drawStInd(TOUCH.steer);if(pressed.fire){useItem(s);pressed.fire=false}}
    else if(s.isPlayer&&s.finished){s.rubber=1;physAI(s);s.nitro=false}
    else{if(pl&&!pl.finished&&RC.type!=='tt'){const gap=pl.dist-s.dist;s.rubber=1+(gap>0?Math.min(.06,gap/400*.06):-Math.min(.03,Math.max(0,-gap-150)/600*.03))}else s.rubber=1;physAI(s);
      if(s.item){s.aiFire-=H;if(s.aiFire<=0){let use=false;const it=s.item;
        if(it==='turbo')use=Math.abs(kAt(TD,s.dist+100))<1/900;else if(it==='shield')use=raceT-s.lastHit<.5||R()<.002;else if(it==='mines'||it==='wall'||it==='oil')use=ships.some(o=>o!==s&&s.dist-o.dist>10&&s.dist-o.dist<150);else if(it==='magnet')use=ships.some(o=>o!==s&&!o.dead&&o.dist-s.dist>30&&o.dist-s.dist<300);else if(it==='storm')use=ships.some(o=>o!==s&&!o.dead&&o.dist>s.dist+10);
        else use=ships.some(o=>o!==s&&!o.dead&&!o.eliminated&&o.dist-s.dist>15&&o.dist-s.dist<(it==='missile'||it==='tornado'?500:160)&&(it==='missile'||it==='tornado'||Math.abs(o.x-s.x)<5));
        if(use)useItem(s);s.aiFire=.3}}}
    if(!s.air)for(const p of pads){const dd=mod(s.dist-p.s+10,TD.L)-10;if(dd>=0&&dd<s.v*H+.01&&Math.abs(s.x-p.x)<(p.type==='boost'?5:4)){
      if(p.type==='boost'){s.boost=1.3;if(s.isPlayer){AU.sfx('boost');fovKick=Math.max(fovKick,6);award(s,'BOOST PAD',15,50,'#ffd12c')}}
      else if(!s.item){s.item=pickItem(s);s.aiFire=rr(.6,2.5)*(s.style==='gunner'?.6:1);if(s.isPlayer){AU.sfx('pick');itemSpinUntil=performance.now()+950;if(PK.has('refill'))s.bm=Math.min(100,s.bm+35)}}}}}
  if(racing){stepTraffic();stepProps()}
  for(let i=0;i<ships.length;i++)for(let j=i+1;j<ships.length;j++){const a=ships[i],b=ships[j];if(a.dead||b.dead||a.eliminated||b.eliminated||a.air||b.air)continue;const dd=b.dist-a.dist,dx=b.x-a.x;
    if(Math.abs(dd)<5.4&&Math.abs(dx)<2.5){if(a.isPlayer)b.pushT=raceT;if(b.isPlayer)a.pushT=raceT;const push=(2.5-Math.abs(dx))*.5*(dx>=0?1:-1);a.x-=push;b.x+=push;const back=dd>0?a:b,front=dd>0?b:a;if(back.v>front.v){const dv=back.v-front.v;back.v-=dv*.6;front.v+=dv*.3}
      if(RC.derby&&state==='race'&&(a.bumpT2||0)<raceT&&(b.bumpT2||0)<raceT){a.bumpT2=b.bumpT2=raceT+.35;const hard=Math.abs(b.v-a.v)*.35+3;if(!a.isPlayer&&!b.isPlayer){damage(front,hard)}else{const V=a.isPlayer?a:b,O=a.isPlayer?b:a;if(O.aggr!==0&&R()<.6)damage(V,hard*.8)}}
      if(a.isPlayer||b.isPlayer){const P=a.isPlayer?a:b,O=a.isPlayer?b:a;const toward=Math.sign(O.x-P.x)||1;const latV=P.v*Math.sin(P.beta)+(P.rollT>ROLL_T-.32?P.rollDir*CR_LGV:0);
        const pinned=Math.abs(O.x)>=MARGIN-1.2;const rearRam=(O.dist-P.dist)>0&&P.nitro&&(P.v-O.v)>14;
        if(state==='race'&&!P.finished&&P.rollT>ROLL_T-.4&&P.rollDir===toward&&!P.rollHit&&O.dead<=0){P.rollHit=true;CR_lgHit(P,O,toward)}
        else if(RC.derby&&state==='race'&&!P.finished){if((P.bumpT||0)<raceT){P.bumpT=raceT+.3;const imp=Math.abs(latV)*.9+Math.max(0,P.v-O.v)*.5+4;AU.sfx('crash');shake=Math.max(shake,.45);damage(O,imp);if(O.dead>0){P.takedowns++;award(P,'DERBY KO',30,1500,'#ff2d95');crashCam(O,1.6)}else award(P,'HIT',4,Math.round(imp*20),'#ffd12c')}}
        else{if((P.bumpT||0)<raceT){AU.sfx('bump');P.bumpT=raceT+.25;shake=Math.max(shake,.25)}
          if(O.attackT>0&&P.rollT<=0){P.x-=toward*1.2;if(Math.abs(P.x)>=MARGIN-.3){damage(P,14/P.stats.hull);feed('SIDESWIPED',0,'#ff3b55');flashHud();O.attackT=0}}}}
      for(const s of[a,b]){s.x=clamp(s.x,-MARGIN,MARGIN);if(s.isPlayer)s.beta*=.7}}}
  if(racing)for(const s of ships){if(s.dead||s.eliminated||s.air)continue;for(const c of traffic){if(c.wreck)continue;const dd=tdd(c.dist,s.dist),dx=c.x-s.x;
    if(Math.abs(dd)<c.len/2+3.4&&Math.abs(dx)<c.wid/2+2){
      if(s.isPlayer&&RC.jn){if(state==='race'){wreckTraffic(c,s,1.4);explode(s,'CRASH!')}}
      else if(s.isPlayer){if(s.shield>0||s.rollT>0){wreckTraffic(c,s,1.2);if(s.isPlayer)CR_smashHit();s.v*=.97;award(s,'SMASH',8,300,'#ffd12c');AU.sfx('crash');shake=.5}
        else{const rel=Math.max(0,s.v-c.v);if(0){wreckTraffic(c,s,.8);s.v=Math.min(s.v,c.v+8)*.9;damage(s,(6+rel*.25)/s.stats.hull);AU.sfx('crash');shake=.9;flashHud();feed('CRASH',0,'#ff3b55')}else{if((s.crBmp||0)<raceT){s.crBmp=raceT+.4;AU.sfx('bump');shake=Math.max(shake,.25);s.v=Math.min(s.v,c.v+rel*.55)}s.x=clamp(s.x-Math.sign(dx||1)*.9,-MARGIN,MARGIN);c.x=clamp(c.x+Math.sign(dx||1)*.6,-MARGIN,MARGIN)}}}
      else{const rel=Math.max(0,s.v-c.v),pushed=pl&&raceT-(s.pushT||-9)<2.2;
        if(state==='race'&&(rel>CR_SMASHV||pushed&&rel>14)){wreckTraffic(c,s,.8);s.v=Math.min(s.v,c.v*.55);s.x=clamp(s.x-Math.sign(dx||1)*1.6,-MARGIN,MARGIN);if(s.inv<=0&&s.shield<=0)damage(s,(10+rel*.4)/s.stats.hull);if(pushed&&s.dead<=0&&rel>CR_SMASHV)explode(s,null);
          if(pushed){if(s.dead>0){pl.takedowns++;award(pl,'TRAFFIC CHECK',40,1800,'#ff2d95');AU.sfx('takedown');crashCam(s,1.6);rivalHit(s,'hurt')}else{award(pl,'SHOVED INTO TRAFFIC',8,400,'#ffd12c');s.pushT=-9}}}
        else{s.v=Math.min(s.v,c.v*.95);s.x=clamp(s.x-Math.sign(dx||1)*.8,-MARGIN,MARGIN)}}
      c.prev=null;continue}
    if(s.isPlayer){const ahead=dd>0;if(c.prev===true&&!ahead&&Math.abs(dx)<c.wid/2+5.4&&s.v-c.v>12&&state==='race'){s.nearMiss++;award(s,'NEAR MISS',PK.has('slip')?18:9,200+Math.round((s.v-c.v)*4),'#4ceaff');AU.sfx('near')}c.prev=ahead}}}
  for(let i=projs.length-1;i>=0;i--){const p=projs[i];p.life-=H;p.dist+=p.v*H;
    if(p.type==='tornado'){p.ph+=H*2;p.x=clamp(p.x+Math.sin(p.ph)*6*H,-MARGIN+3,MARGIN-3);for(const s of ships){if(s===p.owner||s.dead||s.eliminated||s.air||p.hits.has(s))continue;if(Math.abs(s.dist-p.dist)<6&&Math.abs(s.x-p.x)<5.5){p.hits.add(s);hitShip(s,10,.6,(R()<.5?-1:1)*7,p.owner);if(s.isPlayer)feed('CAUGHT IN THE TORNADO',0,'#b48cff')}}if(p.life<=0){wfxDrop(p);projs.splice(i,1)}continue}
    if(p.type==='missile'&&p.target&&!p.target.dead){p.x+=clamp(p.target.x-p.x,-30*H,30*H);p.v=Math.max(p.v,p.target.v+45)}
    let hit=false;for(const s of ships){if(s===p.owner||s.dead||s.eliminated||s.air)continue;if(Math.abs(s.dist-p.dist)<4.5&&Math.abs(s.x-p.x)<3.4){hitShip(s,(p.type==='missile'?30:16)*(s.isPlayer&&PK.has('armor')?.5:1),p.type==='missile'?.45:.25,(R()-.5)*3,p.owner);hit=true;
      const f=frameAt(TD,p.dist,F2);burst(FIRE,f.p.clone().addScaledVector(f.r,p.x).addScaledVector(f.u,1.2),30,22,.7,new THREE.Color(2,1,.3));break}}
    if(hit||p.life<=0||Math.abs(p.x)>HALF+2)projs.splice(i,1)}
  for(let i=mines.length-1;i>=0;i--){const m=mines[i];m.life-=H;m.arm-=H;let hit=false;
    if(m.arm<=0)for(const s of ships){if(s.dead||s.eliminated||s.air)continue;if(Math.abs(s.dist-m.dist)<3.4&&Math.abs(s.x-m.x)<(m.w||3)){if(s.isPlayer&&PK.has('mines')&&m.type!=='wall')continue;if(m.type==='oil'){if(m.hits.has(s))continue;m.hits.add(s);if(s.shield<=0){s.v*=.75;s.yawRate+=(R()<.5?-1:1)*6;if(s.isPlayer){feed('OIL!',0,'#5dffb0');AU.sfx('hit')}}continue}
      if(m.type==='wall'){hitShip(s,18,.6,(R()-.5)*3,m.owner);hit=true;const f=frameAt(TD,m.dist,F2);const at=f.p.clone().addScaledVector(f.r,m.x).addScaledVector(f.u,1.4);debris(at,(s._fw||V3()).clone().multiplyScalar(s.v*.4).add(V3(0,6,0)),14,[new THREE.Color('#ff8a3c'),new THREE.Color('#c0392b'),new THREE.Color('#ffd12c')],.9,f.p.y);AU.sfx('brick');break}
      hitShip(s,24,.5,(R()-.5)*4,m.owner);hit=true;const f=frameAt(TD,m.dist,F2);burst(FIRE,f.p.clone().addScaledVector(f.r,m.x).addScaledVector(f.u,1),36,26,.8,new THREE.Color(2,.6,.4));break}}
    if(hit||m.life<=0){wfxDrop(m);mines.splice(i,1)}}
  if(RC.type==='zone'&&state==='race'&&pl&&pl.dist>=RC.zone.next)zoneUp();
  if(pl&&RC.type==='duel'&&state==='race'&&Math.floor(raceT*20)*2>=duelRec.length)duelRec.push(Math.round(pl.dist*100)/100,Math.round(pl.x*100)/100);
  if(RC.type==='arena'&&state==='race'){RC.time-=H;if(RC.time<=0&&pl&&!pl.eliminated){RC.time=0;pl.finished=true;pl.finishTime=raceT;state='finished';finishT=1.5;AU.sfx('finish');lapLogic();say('TIME',ord(pl.place)+' PLACE',2.4)}}
  if(state==='race'&&pl&&RC.type!=='attract'){if(prevPlace&&pl.place>prevPlace&&raceT>8&&raceT>radioCd&&R()<.6){const o=ships.find(x=>!x.isPlayer&&x.place===pl.place-1);if(o){radio(o,'pass');radioCd=raceT+14}}prevPlace=pl.place}
  if(RC.jn&&state==='race'&&pl){const J=RC.jn;if(pl.dead>0){J.endT=(J.endT??5.2)-H;if(J.endT<=0)endJunction()}else if(pl.dist>J.end)endJunction()}
  if(RC.type==='elim'&&state==='race'){elimT-=H;if(elimT<=0){elimT=20;const act=ships.filter(active);if(act.length>1)eliminate([...act].sort((a,b)=>a.dist-b.dist)[0])}}}
function endJunction(){state='finished';finishT=1.5;pl.finished=true;pl.finishTime=raceT;AU.sfx('finish');say('DAMAGE',eur(RC.jn.value),2.4)}
function eliminate(s,quiet){s.elimPlace=ships.filter(active).length;s.eliminated=true;s.elimAt=raceT;if(!quiet)explode(s);s.dead=0;s.mesh.visible=false;AU.sfx('elim');
  if(s.isPlayer){say('ELIMINATED','',2);state='finished';finishT=1.5}else{feed('OUT · '+s.name,0,'#ff3b55');if(ships.filter(active).length===1&&pl&&!pl.eliminated){pl.finished=true;pl.finishTime=raceT;state='finished';finishT=0;AU.sfx('finish');say('LAST ONE FLYING','',2.4)}}}
let CTL={steer:0,thr:0,brk:0,abL:0,abR:0,boost:0};

/* ---- race flow ---- */
function lapLogic(){const laps=RC.laps;for(const s of ships){if(s.eliminated)continue;const lap=Math.floor(s.dist/TD.L);
  if(lap>s.lap&&s.dist>0){const lt=raceT-s.lapStart;if(lap>=1){s.laps.push(lt);if(lt<s.best)s.best=lt}s.lapStart=raceT;s.lap=lap;
    if(s.isPlayer&&lap>=1&&state==='race'){if(TRK.fire)athFire(lap>=laps);if(lapAttack())saveGhost(lt);
      else if(lap>=laps)finishPlayer();else{AU.sfx('lap');if(lap===laps-1){AU.sfx('final');say('FINAL LAP',fmt2(lt),1.4)}else say('LAP '+(lap+1),fmt2(lt),1.2)}}
    if(!s.isPlayer&&RC.type!=='elim'&&lap>=laps&&!s.finished){s.finished=true;s.finishTime=raceT}}
  else if(lap<s.lap)s.lap=lap}
  const order=RC.type==='arena'?ships.filter(active).sort((a,b)=>(b.lives-a.lives)||(b.takedowns-a.takedowns)||(b.hull-a.hull)):ships.filter(active).sort((a,b)=>(b.finished&&a.finished)?a.finishTime-b.finishTime:(b.finished-a.finished)||(b.dist-a.dist));order.forEach((s,i)=>s.place=i+1)}
function saveGhost(lt){const prev=ghost?ghost.t:Infinity;
  if(lt<prev&&ghostRec.length){ghost={t:lt,team:teamIdx,f:ghostRec.map(v=>Math.round(v*100)/100)};store.set(ghostKey(),ghost);say('NEW BEST LAP',fmt2(lt),1.6);AU.sfx('finish')}
  else{AU.sfx('lap');say('LAP',fmt2(lt)+(isFinite(prev)?'  ('+(lt-prev>=0?'+':'')+(lt-prev).toFixed(2)+')':''),1.4)}
  const rec=store.get(recKey(),{});if(!rec.lap||lt<rec.lap){rec.lap=lt;rec.team=TEAMS[teamIdx].name;store.set(recKey(),rec)}ghostRec=[]}
function finishPlayer(){pl.finished=true;pl.finishTime=raceT;state='finished';finishT=0;AU.sfx('finish');lapLogic();say(RC.type==='tt'?fmt2(raceT):ord(pl.place),'FINISH',2.5)}
const speedTxt=v=>(typeof SET!=='undefined'&&SET.units==='mph'?Math.round(v*2.237)+' mph':Math.round(v*3.6)+' kph');
const eur=v=>Math.round(v).toLocaleString('de-DE')+' €';
const modeName=()=>RC.daily?'Daily '+RC.daily:RC.derby?'Derby':RC.boss?'Grand Arena':RC.rival?'Rival race':{junction:'Crash Junction',race:'Race',tt:'Time trial',zone:'Zone',arena:'Arena',duel:'Ghost duel',elim:'Eliminator'}[RC.type]||'Race';
const setLabel=()=>`${modeName()} · ${TRK.short}${mirror?' (mirror)':''} · ${MOOD.name} · ${cls.name}`;
function statRow(rows){$('#resStats').innerHTML=rows.map(([a,b])=>`<div><b>${b}</b><span>${a}</span></div>`).join('')}
function modeResults(){const T=RC.type;$('#medal').hidden=true;$('#resEy').textContent=setLabel();let note='';
  if(T==='zone'){const Z=RC.zone,km=pl.zoneKm??pl.dist/1000,key=zoneKey(),best=store.get(key,{zone:0,km:0});const nb=Z.k>best.zone||(Z.k===best.zone&&km>best.km);if(nb)store.set(key,{zone:Z.k,km});
    RC._st=Z.k>=6?3:Z.k>=4?2:Z.k>=2?1:0;$('#resTitle').textContent='ZONE '+Z.k;statRow([['Distance',km.toFixed(2)+' km'],['Top speed',speedTxt(pl.maxSpeed)],['Near misses',pl.nearMiss],['Style',pl.style.toLocaleString('de-DE')]]);
    $('#resTable').innerHTML=`<tr><th>Record on ${TRK.short}</th><th class="n">Zone</th><th class="n">Distance</th></tr><tr class="me"><td>This run</td><td class="n">${Z.k}</td><td class="n">${km.toFixed(2)} km</td></tr><tr><td>Best</td><td class="n">${Math.max(best.zone,Z.k)}</td><td class="n">${(nb?km:best.km).toFixed(2)} km</td></tr>`;note=nb?'New zone record.':'';}
  else if(T==='duel'){const g=duelGhost,t=pl.finishTime,fin=pl.finished;let title,nb=false;
    if(!fin)title='DNF';else if(!g){title='GHOST SET';nb=true}else if(t<g.t){title='BEAT THE GHOST';nb=true}else title='+'+(t-g.t).toFixed(2)+' BEHIND';
    if(nb&&fin&&duelRec.length)store.set(duelKey(),{t,team:teamIdx,f:duelRec});RC._st=!fin?0:g&&t<g.t?3:1;$('#resTitle').textContent=title;
    statRow([['Race',fin?fmt2(t):'—'],['Ghost',g?fmt2(g.t):'—'],['Best lap',fmt2(pl.best)],['Top speed',speedTxt(pl.maxSpeed)]]);
    $('#resTable').innerHTML=`<tr><th>Lap</th><th class="n">Time</th></tr>`+pl.laps.map((x,i)=>`<tr><td>${i+1}</td><td class="n">${fmt2(x)}</td></tr>`).join('');note=nb&&g?'New ghost saved: '+fmt2(t)+'.':nb?'Race again to duel this ghost.':'';}
  else if(T==='arena'){lapLogic();const alive=ships.filter(active),out=ships.filter(s=>s.eliminated).sort((a,b)=>b.elimAt-a.elimAt),order=[...alive.sort((a,b)=>a.place-b.place),...out];const me=order.indexOf(pl)+1;
    RC._st=me===1?3:me<=3?2:me<=5?1:0;$('#resTitle').textContent=me===1?'1ST · LAST ONE FLYING':ord(me)+' PLACE';statRow([['KOs',pl.takedowns],['Lives left',Math.max(0,pl.lives)],['Survived',fmt(pl.eliminated?pl.elimAt:raceT)],['Style',pl.style.toLocaleString('de-DE')]]);
    $('#resTable').innerHTML='<tr><th>Pos</th><th>Pilot</th><th>Team</th><th class="n">Lives</th><th class="n">KOs</th></tr>'+order.map((s,i)=>`<tr class="${s===pl?'me':''} ${s.eliminated?'out':''}"><td>${i+1}</td><td>${avImg(s)}${s.name}</td><td>${s.team.name}</td><td class="n">${s.eliminated?'OUT':'▲'.repeat(Math.max(0,s.lives))}</td><td class="n">${s.takedowns||0}</td></tr>`).join('');
    const key=`mho_${RC.derby?'derby':'arena'}_${TRK.id}`,best=store.get(key,99);if(me<best){store.set(key,me);note='New arena best: '+ord(me)+'.'}}
  else if(T==='junction'){const J=RC.jn,v=J.value,md=v>=320000?'GOLD':v>=200000?'SILVER':v>=100000?'BRONZE':'';RC._st=md==='GOLD'?3:md==='SILVER'?2:md?1:0;$('#resTitle').textContent=eur(v);
    statRow([['Vehicles wrecked',J.cars],['Chain reactions',J.chain],['Aftertouch KOs',pl.takedowns],['Medal',md||'—']]);note=md?md+' · next: '+(md==='GOLD'?'beat your best':eur(md==='SILVER'?320000:200000)):'Bronze at '+eur(100000)+'. Crash into the biggest trucks, then steer the wreck.';
    const key=`mho_jn_${TRK.id}`,best=store.get(key,0);if(v>best){store.set(key,v);note+=' · New best.'}}
  else return false;
  if(RC.daily){const k='mho_daily_'+RC.daily,prev=store.get(k,null);let score,txt;
    if(T==='zone'){score=RC.zone.k*1e5+pl.dist;txt='zone '+RC.zone.k}else if(T==='tt'){score=pl.finished?-pl.finishTime:-1e9;txt=pl.finished?fmt2(pl.finishTime):'DNF'}else{score=pl.finished?-pl.place*1e4-pl.finishTime:-1e9;txt=pl.finished?ord(pl.place)+' · '+fmt2(pl.finishTime):'DNF'}
    if(!prev||score>prev.score){store.set(k,{score,txt});note+=' Best today: '+txt+'.'}else note+=' Best today: '+prev.txt+'.'}
  starAward(RC._st||0);RC._st=0;$('#resNote').textContent=note.trim();$('#againBtn').focus({preventScroll:true});return true}
function medalFor(){const ev=RC.ev;if(!ev)return 0;const m=ev.m;let v;
  if(ev.med==='place'){v=RC.type==='elim'?(pl.eliminated?pl.elimPlace:1):pl.place;if(RC.type!=='elim'&&!pl.finished)return 0;return v<=m[0]?3:v<=m[1]?2:v<=m[2]?1:0}
  if(ev.med==='time'){if(!pl.finished)return 0;v=pl.finishTime;return v<=m[0]?3:v<=m[1]?2:v<=m[2]?1:0}
  if(ev.med==='takedowns'){if(!pl.finished)return 0;v=pl.takedowns;return v>=m[0]?3:v>=m[1]?2:v>=m[2]?1:0}return 0}
function worldResults(order){$('#roamBack').hidden=false;$('#nextBtn').hidden=true;const ev=RC.world,me=order.indexOf(pl)+1,F=flags(),won=me===1;let note;if(ev===ATH_BOSS_EV||ATH_TRK_EV.includes(ev))return athWorldRes(ev,me,F,won);
  if(RC.boss){if(won){F.SKYCUP=1;note='YOU BEAT VEX KAISER! The Mainhattan Sky Cup is yours. Unlocked: the Kaiserkrone and Kaiser’s Crown perk.';$('#resTitle').textContent='SKY CUP CHAMPION'}else note=`Kaiser wins again. ${ord(me)} place. Upgrade, then come back.`}
  else{if(won){const nw=!F[ev.p];F[ev.p]=1;const rv=TEAMS.find(t=>t.own===ev.p),rp=PERKS.find(p=>p.flag===ev.p);note=(nw?`FLAG WON: ${PD[ev.p].full}! New vehicle: ${rv?rv.name:''}. New perk: ${rp?rp.name:''}. `:'Rematch won. ')+`${RIVAL_EV.filter(e=>F[e.p]).length}/8 flags.`;$('#resTitle').textContent=nw?'FLAG WON':'1ST · WINNER'}else note=`${PD[ev.p].full} keeps the flag. Beat them one-on-one.`}
  const nf=RIVAL_EV.filter(e=>F[e.p]).length;if(!RC.boss&&nf>=BOSS_EV.need&&!F.SKYCUP)note+=' The GRAND ARENA is open: Vex Kaiser awaits.';
  store.set('mho_flags',F);$('#resEy').textContent=(RC.boss?'Grand Arena · ':'Rival race · ')+PD[ev.p].full+' · '+TRK.short;$('#resNote').textContent=note}
function athWorldRes(ev,me,F,won){let note;
  if(RC.boss){if(won){F.AKROCUP=1;note='YOU BEAT THANOS DRAKOS! The Akropolis Cup stays in Athens.';$('#resTitle').textContent='AKROPOLIS CUP CHAMPION'}else note=`Drakos keeps the cup. ${ord(me)} place. Upgrade, then come back.`}
  else{if(won){const nw=!F[ev.p];F[ev.p]=1;note=(nw?`FLAG WON: ${PD[ev.p].full}! `:'Rematch won. ')+`${athNF(F)}/6 Athens flags.`;$('#resTitle').textContent=nw?'FLAG WON':'1ST · WINNER'}else note=`${PD[ev.p].full} keeps the flag. Beat them one-on-one.`}
  if(!RC.boss&&athNF(F)>=ATH_BOSS_EV.need&&!F.AKROCUP)note+=' The AKROPOLIS CUP FINAL is open: Thanos Drakos awaits in the Kallimarmaro.';
  store.set('mho_flags',F);$('#resEy').textContent=(RC.boss?'Akropolis Cup Final · ':'Rival race · ')+PD[ev.p].full+' · '+TRK.short;$('#resNote').textContent=note}
function standings(S){const keys=['YOU',...seasonRoster(S.L)];return keys.map(k=>({k,p:S.pts[k]||0})).sort((a,b)=>b.p-a.p)}
function seasonResults(order){const S=season(),L=S.L,r0=S.r,rd=seasonRound(L,r0),mult=rd.dbl?2:1;const gain={};
  order.forEach((s,i)=>{const k=s.isPlayer?'YOU':s.pid;if(!k)return;gain[k]=SPTS[i]*mult;S.pts[k]=(S.pts[k]||0)+gain[k]});
  const me=order.indexOf(pl)+1,cr=Math.round(SCRED[me-1]*(1+.5*L)/10)*10+pl.takedowns*400;S.cr+=cr;
  let note=`+${cr.toLocaleString('de-DE')} credits${pl.takedowns?` (incl. ${pl.takedowns} takedown bonus)`:''}. `,title=null;const st=standings(S),pos=st.findIndex(e=>e.k==='YOU')+1;
  if(r0===4){if(pos<=3){const prize=[20000,12000,8000][pos-1]*(1+.5*L);S.cr+=prize;title=pos===1?'CHAMPION':ord(pos)+' IN THE CHAMPIONSHIP';const up=L<4;S.max=Math.max(S.max,Math.min(4,L+1));
      note+=`${LEAGUES[L].name}: ${ord(pos)} overall. Prize ${prize.toLocaleString('de-DE')} credits. `+(up?`Promoted to the ${LEAGUES[L+1].name}!`:'You are the Mainhattan champion!');if(up)S.L=L+1}
    else{title=ord(pos)+' IN THE CHAMPIONSHIP';note+=`${LEAGUES[L].name}: ${ord(pos)} overall. Top 3 to promote. Upgrade in the Garage and go again.`}
    S.champ.push({L,pos});S.r=0;S.pts={}}
  else{S.r=r0+1;note+=`Championship: ${ord(pos)} with ${S.pts.YOU||0} pts after round ${r0+1}/5.`}
  saveSeason(S);$('#resEy').textContent=`Season · ${LEAGUES[L].name} · Round ${r0+1}/5 · ${rd.name}${rd.dbl?' · double points':''}`;if(title)$('#resTitle').textContent=title;$('#resNote').textContent=note;
  $('#resTable').innerHTML='<tr><th>Pos</th><th>Pilot</th><th>Team</th><th class="n">+Pts</th><th class="n">Total</th></tr>'+order.map((s,i)=>{const k=s.isPlayer?'YOU':s.pid;return`<tr class="${s===pl?'me':''} ${s.eliminated?'out':''}"><td>${i+1}</td><td>${avImg(s)}${s.name}${s.nem?' <span class="nem">NEMESIS</span>':''}</td><td>${s.team.name}</td><td class="n">+${gain[k]||0}</td><td class="n">${r0===4?'—':S.pts[k]||0}</td></tr>`}).join('');
  $('#nextBtn').textContent=r0===4?'NEW SEASON':'NEXT ROUND';$('#nextBtn').hidden=false}
const STAR_PAY={boss:[4500,250],rival:[2200,150],challenge:[1700,120],mode:[1300,100],sprint:[1700,130],season:[800,80],quick:[300,40]};
// reward parts: the first 3-star finish of an event unlocks a random garage item you have not bought yet
function logDone(key,name,kind,stars,detail){if(!stars)return;const L=store.get('mho_log',{}),o=L[key]||{n:name,k:kind,s:0,first:Date.now()};o.n=name;o.k=kind;o.s=Math.max(o.s,stars);o.last=Date.now();if(detail)o.d=detail;L[key]=o;store.set('mho_log',L)}
function rewardItem(){const own=gbOwn(),pool=[];for(const c in GB_PARTS)for(const q of GB_PARTS[c])if(q[2]&&q[2].cost&&!own.includes(q[0]))pool.push([q[0],q[1]]);for(const q of GB_PATS)if(q[2]&&q[2].cost&&!own.includes('pat_'+q[0]))pool.push(['pat_'+q[0],q[1]+' livery']);for(const q of GB_HORNS)if(q[2]&&q[2].cost&&!own.includes('horn_'+q[0]))pool.push(['horn_'+q[0],q[1]+' horn']);if(!pool.length)return'';const p=pool[Math.floor(R()*pool.length)];own.push(p[0]);store.set('mho_gbown',own);return p[1]}
function starAward(stars){stars=clamp(stars|0,0,3);const ctx=RC.boss?'boss':RC.world?'rival':RC.season?'season':RC.ev?'challenge':RO.sprId?'sprint':RO.fromRoam?'mode':'quick';
  const key=ctx+':'+(RO.sprId&&ctx==='sprint'?RO.sprId:RC.world?RC.world.p:RC.ev?RC.ev.id:RC.type+(RC.derby?'D':'')+'_'+TRK.id),all=store.get('mho_stars',{}),best=all[key]||0,[pay,xp]=STAR_PAY[ctx];
  const fresh=Math.max(0,stars-best),rep=Math.min(stars,best),cr=Math.round(pay*fresh+pay*(best>=3?.2:.3)*rep)+(pl?pl.takedowns*100:0),x=Math.round(xp*(fresh+(best>=3?.1:.25)*rep));
  if(stars>best){all[key]=stars;store.set('mho_stars',all)}if(cr){const S=season();S.cr+=cr;saveSeason(S)}if(x)addXP(x);const gift=stars===3&&best<3&&ctx!=='quick'?rewardItem():'';if(ctx!=='quick')logDone(key,RC.world?(PD[RC.world.p]||{}).full||'Rival':RC.ev?RC.ev.name:RC.boss?'Grand Arena':(TRK.name||'Event'),ctx,stars);
  const el=$('#resStars');el.hidden=false;el.innerHTML=`<span class="st">${'★'.repeat(stars)}<i>${'★'.repeat(3-stars)}</i></span><span>+<b>${cr.toLocaleString('de-DE')}</b> studs · +<b>${x}</b> XP${fresh?` · ${fresh} new ★`:best>=3&&stars?' · mastered ★★★ · studs only':stars?' · replay (30%)':''}${pl&&pl.takedowns?` · incl. ${pl.takedowns} KO bonus`:''}${gift?`<br>🎁 <b>NEW GARAGE PART: ${gift}</b>`:''}</span>`;if(stars===3)AU.sfx('finish')}
function showResults(){$('#roamBack').hidden=!RO.fromRoam;$('#resStars').hidden=true;state='results';$('#results').hidden=false;$('#hud').hidden=true;$('#touch').hidden=true;$('#nextBtn').hidden=true;
  if(RC.type==='zone'||RC.type==='duel'||RC.type==='arena'||RC.type==='junction'){if(modeResults())return}
  const est=s=>s.eliminated?1e6-s.elimAt:s.finished?s.finishTime:raceT+Math.max(0,(RC.laps*TD.L-s.dist))/Math.max(40,s.v||60);
  const order=[...ships].sort((a,b)=>est(a)-est(b));const me=RC.type==='elim'&&pl.eliminated?pl.elimPlace:order.indexOf(pl)+1;
  if(RC.type!=='tt'&&RC.type!=='attract'&&order.length>1){const o2=order[me===1?1:0];RC.adapt=adaptAfter(me,order.length,me===1?est(o2)-est(pl):0)}
  const ev=RC.ev;$('#resEy').textContent=ev?`Career · Event ${EVENTS.indexOf(ev)+1} · ${ev.name}`:`${cls.name} · ${dir==='rev'?'Reverse':'Normal'} · ${TEAMS[teamIdx].name}`;
  $('#resTitle').textContent=RC.type==='tt'?(pl.finished?fmt2(pl.finishTime):'DNF'):me===1?'1ST · WINNER':ord(me)+' PLACE';
  const md=medalFor(),md0=ev?(career()[ev.id]||0):0;
  if(ev){const names=['NO MEDAL','BRONZE','SILVER','GOLD'],cols=['#4a6a80','var(--bronze)','var(--silver)','var(--gold)'];$('#medal').innerHTML=`<i style="color:${cols[md]}"></i><span>${names[md]}${md>md0?' · NEW BEST':''}</span>`;$('#medal').hidden=false;
    if(md>md0){const c=career();c[ev.id]=md;store.set('mho_career',c)}}else $('#medal').hidden=true;
  $('#resStats').innerHTML=[['Style',pl.style.toLocaleString('de-DE')],['Near misses',pl.nearMiss],['Takedowns',pl.takedowns],['Top speed',speedTxt(pl.maxSpeed)]].map(([a,b])=>`<div><b>${b}</b><span>${a}</span></div>`).join('');
  $('#resTable').innerHTML=RC.type==='tt'?`<tr><th>Lap</th><th class="n">Time</th></tr>`+pl.laps.map((t,i)=>`<tr><td>${i+1}</td><td class="n">${fmt2(t)}</td></tr>`).join(''):
    '<tr><th>Pos</th><th>Pilot</th><th>Team</th><th class="n">Time</th><th class="n">Best lap</th></tr>'+order.map((s,i)=>`<tr class="${s===pl?'me':''} ${s.eliminated?'out':''}"><td>${i+1}</td><td>${avImg(s)}${s.name}</td><td>${s.team.name}</td><td class="n">${s.eliminated?'OUT':s.finished?fmt2(s.finishTime):'~'+fmt2(est(s))}</td><td class="n">${fmt2(s.best)}</td></tr>`).join('');
  const rec=store.get(recKey(),{});let note='';if(pl.finished&&(!rec.race||pl.finishTime<rec.race)){rec.race=pl.finishTime;note='New record for this event. '}if(isFinite(pl.best)&&(!rec.lap||pl.best<rec.lap)){rec.lap=pl.best;note+='New lap record. '}
  if(!rec.style||pl.style>rec.style)rec.style=pl.style;store.set(recKey(),rec);
  const seen=store.get('mho_seen_unlock',[]);const unl=TEAMS.filter(t=>t.unlock>0&&t.unlock<=medalPts()&&!seen.includes(t.id));if(unl.length){note+=`Unlocked: ${unl.map(t=>t.name).join(', ')}.`;store.set('mho_seen_unlock',[...seen,...unl.map(t=>t.id)])}
  $('#resNote').textContent=note||(rec.race?`Record: ${fmt2(rec.race)}`:'');if(!RC.ev)$('#resEy').textContent=setLabel();
  if(RC.daily){const k='mho_daily_'+RC.daily,prev=store.get(k,null),score=RC.type==='tt'?(pl.finished?-pl.finishTime:-1e9):(pl.finished?-pl.place*1e4-pl.finishTime:-1e9),txt=pl.finished?(RC.type==='tt'?fmt2(pl.finishTime):ord(me)+' · '+fmt2(pl.finishTime)):'DNF';if(!prev||score>prev.score)store.set(k,{score,txt});$('#resNote').textContent+=' Best today: '+(prev&&prev.score>=score?prev.txt:txt)+'.'}
  if(!RC.cup){let st;const n=ships.length;if(ev)st=md;else if(RC.type==='tt')st=pl.finished?(note.includes('lap record')?2:1):0;else if(RC.world&&!RC.boss)st=me===1?3:pl.finished?1:0;else st=me===1?3:me<=3?2:me<=Math.max(5,Math.ceil(n*.6))?1:0;starAward(st)}
  const nx=ev&&EVENTS[EVENTS.indexOf(ev)+1];$('#nextBtn').hidden=!(nx&&(career()[ev.id]||0)>0);$('#nextBtn').textContent='NEXT EVENT';if(RC.season)seasonResults(order);if(RC.world)worldResults(order);if(RC.cup)cupResults(order);($('#nextBtn').hidden?$('#againBtn'):$('#nextBtn')).focus({preventScroll:true})}

/* ============================================================ 12 · visuals per frame */
const fw=V3(),rs=V3(),us=V3(),Yup=V3(0,1,0);
function posShip(s,dt,snap){if(s.wreck&&s.dead>0){wreckStep(s,dt);return}vehMode(s,dt);frameAt(TD,s.dist,F);s.bob+=dt*7;const bk=s.boatK=(s.boatK||0)+((s.boatMode?1:0)-(s.boatK||0))*Math.min(1,dt*14),hover=1.6-1.05*bk-.25*(s.dirtK||0)+Math.sin(s.dist*.31)*.18*(s.dirtK||0)+Math.sin(s.bob)*.14*SHIP_K+Math.sin(s.bob*.55+s.dist*.05)*.32*bk;
  {const wk=s.dirtK=(s.dirtK||0)+((s.dirtMode?1:0)-(s.dirtK||0))*Math.min(1,dt*6),wg=s.mesh.userData.wheels;if(wg&&wg.visible)for(const w of wg.children)if(w.geometry===WHEEL)w.rotation.x-=s.v*dt/1.05;
    if(wk>.5&&s.v>15&&!s.air&&(s.isPlayer||near(s))&&R()<.5)puff(s.mesh.position.clone().addScaledVector(F.t,-4),1,_tipC.setRGB(.42,.3,.18),2,7,1.1,.5,1.6,2)}
  {if(bk>.5&&s.v>15&&!s.air&&(s.isPlayer||near(s))&&R()<.35){const at=s.mesh.position.clone().addScaledVector(F.t,-3.5);at.y-=.6;emit(WATER,at.clone().addScaledVector(F.r,rr(-2.6,2.6)),V3(rr(-3,3),rr(4,9),rr(-3,3)).addScaledVector(F.t,-s.v*.15),.6,_tipC.setRGB(.3,.5,.85))}}
  // damped roll spring from lateral motion + steering, like a craft leaning into the air
  const target=clamp(-(s.latV||0)*.035-(s.isPlayer?CTL.steer*.18+(CTL.abR-CTL.abL)*.12:0),-.55,.55);
  if(snap){s.roll=target;s.rollV=0}else{const w=13,z=.62;s.rollV+=(-2*z*w*s.rollV-w*w*(s.roll-target))*dt;s.roll+=s.rollV*dt}
  const cy=Math.cos(s.yaw),sy=Math.sin(s.yaw);fw.copy(F.t).multiplyScalar(cy).addScaledVector(F.r,sy);rs.copy(F.r).multiplyScalar(cy).addScaledVector(F.t,-sy);us.copy(F.u);
  let roll=s.roll;if(s.rollT>0){const p=1-s.rollT/ROLL_T;roll+=s.rollDir*-.1*Math.sin(Math.PI*p)}
  const cr=Math.cos(roll),sr=Math.sin(roll);let r2=rs.clone().multiplyScalar(cr).addScaledVector(us,sr),u2=us.clone().multiplyScalar(cr).addScaledVector(rs,-sr),f2=fw.clone();
  if(s.air){const pa=clamp(Math.atan2(s.air.vy,Math.max(10,s.v))*.7,-.45,.45);const f3=f2.clone().multiplyScalar(Math.cos(pa)).addScaledVector(u2,Math.sin(pa));u2=u2.multiplyScalar(Math.cos(pa)).addScaledVector(f2,-Math.sin(pa));f2=f3}
  const ud=s.mesh.userData;ud.m.quaternion.setFromRotationMatrix(_m.makeBasis(r2,u2,f2.clone().negate()));
  s.mesh.position.copy(F.p).addScaledVector(F.r,s.x);if(s.air)s.mesh.position.y=s.air.y+(s.air.off||0);
  s.mesh.quaternion.identity();ud.m.position.copy(F.u).multiplyScalar(s.air?0:hover);
  // decals lie flat on the road under the craft
  const gq=new THREE.Quaternion().setFromRotationMatrix(_m.makeBasis(rs,us,fw.clone().negate()));ud.under.quaternion.copy(gq).multiply(new THREE.Quaternion().setFromAxisAngle(V3(1,0,0),-Math.PI/2));ud.shadow.quaternion.copy(ud.under.quaternion);
  ud.under.position.copy(F.u).multiplyScalar(.12);ud.shadow.position.copy(F.u).multiplyScalar(.1);ud.under.visible=ud.shadow.visible=!s.air;
  s.mesh.visible=!s.eliminated&&!(s.dead>0)&&!(s.inv>0&&Math.floor(s.inv*12)%2)&&!(s.isPlayer&&camMode===1&&state!=='menu');
  ud.shield.visible=s.shield>0;ud.shield.position.copy(ud.m.position);
  const thr=s.isPlayer?Math.max(.25,CTL.thr):(s.v>5?.9:.3),spd=s.v/s.stats.top0,hot=s.nitro||s.turbo>0||s.boost>0;
  const len=Math.min(19,(3+thr*6+spd*9)*(hot?1.3:1));for(const rb of ud.ribbons){rb.scale.z=len;rb.material.uniforms.uT.value=T;rb.material.uniforms.uCol.value.set(s.nitro?'#7fe8ff':s.team.trail);rb.material.uniforms.uA.value=.55+thr*.45}
  for(const f of ud.flares){const k=(1.7+thr*.5+(hot?.8:0))*(1+Math.random()*.08);f.scale.set(k,k,1)}
  ud.under.material.opacity=.22+.26*thr;s._fw=fw.clone();if(dt>0)damageFx(s,dt)}
let shake=0;const attractCam={t:0,ship:0,kind:0,side:1};
const camPos=V3(),camLook=V3(),camUp=V3(0,1,0),camLat=V3();
function updateCam(dt,snap){let s=pl;
  if(CC&&CC.s&&!snap){const w=CC.s,c=w.mesh.position.clone().add(w.mesh.userData.m.position),k=CC.t/CC.dur,a=CC.a0+CC.dir*k*1.9,r=11+k*9;
    camera.position.set(c.x+Math.cos(a)*r,c.y+3+k*5,c.z+Math.sin(a)*r);camera.up.set(0,1,0);camera.lookAt(c);camera.fov+=(48-camera.fov)*.25;camera.updateProjectionMatrix();camPos.copy(camera.position);camLook.copy(c);
    speedLines.mesh.material.opacity=0;FX.uniforms.uSpeed.value*=.9;return}
  if(state==='menu'||!pl){attractCam.t-=dt;if(attractCam.t<=0||snap){attractCam.t=rr(5,8);attractCam.ship=Math.floor(R()*ships.length);attractCam.kind=(attractCam.kind+1)%3;attractCam.side=R()<.5?-1:1}s=ships[attractCam.ship]||ships[0]}
  if(!s)return;frameAt(TD,s.dist,F2);const sp=s.mesh.position.clone().add(s.mesh.userData.m.position),top=s.stats.top0,spd=clamp(s.v/top,0,1.4);shipKey.position.copy(sp).addScaledVector(F2.u,11).addScaledVector(F2.t,4);
  const kind=state==='menu'?attractCam.kind:(camMode===1?3:0);const up=V3().copy(s.air?Yup:F2.u).lerp(Yup,.35).normalize();let want,look;
  if(kind===0){const tall=camera.aspect<1?1.3:1;const cd={close:.85,normal:1,far:1.2}[SET.camd],back=10.5*tall*cd-(s.nitro?.5:0)-CR_SPDCAM.b*clamp(spd,0,1.2),ahead=50*(1+.35*spd);const lead=clamp((s.latV||0)*.06,-3,3),leadL=clamp((s.latV||0)*.14,-8,8);
    want=sp.clone().addScaledVector(F2.t,-back).addScaledVector(up,3.4*tall*cd-(s.nitro?.25:0)-CR_SPDCAM.h*clamp(spd,0,1.2)).addScaledVector(F2.r,-lead*.8);look=sp.clone().addScaledVector(F2.t,ahead).addScaledVector(up,2).addScaledVector(F2.r,leadL);look.lerp(sp.clone().addScaledVector(up,1.2),.42)}
  else if(kind===1){want=sp.clone().addScaledVector(F2.t,18).addScaledVector(F2.r,attractCam.side*11).addScaledVector(F2.u,2.6);look=sp.clone().addScaledVector(F2.u,1)}
  else if(kind===2){want=sp.clone().addScaledVector(F2.t,-30).addScaledVector(F2.u,16).addScaledVector(F2.r,attractCam.side*8);look=sp.clone().addScaledVector(F2.t,24)}
  else{want=sp.clone().addScaledVector(s._fw||F2.t,.5).addScaledVector(F2.u,1.25);look=sp.clone().addScaledVector(s._fw||F2.t,60).addScaledVector(F2.u,1)}
  // lock along-track position to the craft; smooth only the lateral/vertical offset
  const kf=snap?1:1-Math.exp(-dt*(kind===3?40:kind===0?6:5));
  if(kind===0){const rel=want.clone().sub(sp);camLat.lerp(rel,kf);if(snap)camLat.copy(rel);camPos.copy(sp).add(camLat)}else camPos.lerp(want,kf);
  camLook.lerp(look,snap?1:1-Math.exp(-dt*16));camUp.lerp(up,snap?1:1-Math.exp(-dt*5)).normalize();if(snap){camPos.copy(want);camLook.copy(look)}
  {const al=camPos.clone().sub(F2.p).dot(F2.t),CF=updateCam.f||(updateCam.f=mkF());frameAt(TD,s.dist+al,CF);if(CF.p.y<-12){const rel=camPos.clone().sub(CF.p),l=rel.dot(CF.r),u=rel.dot(CF.u),R0=HALF+6,lc=clamp(l,-(R0-3),R0-3),ce=Math.pow(Math.max(.02,Math.sqrt(1-(lc/R0)**2)),.22)*20-3;if(u>ce||l!==lc)camPos.copy(CF.p).addScaledVector(CF.t,rel.dot(CF.t)).addScaledVector(CF.r,lc).addScaledVector(CF.u,Math.min(u,ce))}}const jit=Math.max(0,shake-.3)*1.6*fxK();camera.position.copy(camPos);if(jit>0){camera.position.x+=rr(-.5,.5)*jit;camera.position.y+=rr(-.5,.5)*jit}camera.up.copy(camUp);camera.lookAt(camLook);
  if(kind===0&&state!=='menu')camera.rotateZ(-(s.roll||0)*.16);
  fovKick*=Math.exp(-9*dt);const fov=(kind===3?74:{narrow:56,normal:62,wide:70}[SET.fov])+26*Math.pow(clamp(spd,0,1.25),1.2)+(s.nitro||s.turbo>0?7:0)+fovKick;camera.fov+=(pFov(fov)-camera.fov)*Math.min(1,(dt||.016)*3);camera.updateProjectionMatrix();
  FX.uniforms.uSpeed.value=lerp(FX.uniforms.uSpeed.value,(state==='menu'?.2:0)*fxK(),Math.min(1,dt*4));FX.uniforms.uBoost.value=lerp(FX.uniforms.uBoost.value,(s.nitro&&state!=='menu'?.6:(s.turbo>0?.4:0))*fxK(),Math.min(1,dt*6));
  speedLines.mesh.material.opacity=state==='menu'?0:(clamp((spd-.45)*.7,0,.32)+(s.nitro?.25:0))*fxK()}
function cycleCam(){camMode=(camMode+1)%2}

let winT=0;
function updWorld(dt,t){skyMat.uniforms.uT.value=t;
  if(hammerArm)hammerArm.rotation.x=-.9+Math.max(0,Math.sin(t*1.1))*1.2;
  if(euroSprite)euroSprite.rotation.y=t*.6;
  if(beacons)beacons.visible=Math.floor(t*1.3)%2===0;if(PROP){PROP.lamp.visible=Math.floor(t*2.2)%2===0;PROP.arrow.material.color.setScalar(Math.floor(t*2.2)%2?1.9:.8)}
  for(const sl of searchlights)sl.g.rotation.set(Math.sin(t*sl.sp+sl.ph)*sl.tilt,t*sl.sp*.7+sl.ph,Math.cos(t*sl.sp*.8+sl.ph)*sl.tilt*.8);
  if(MOOD.lightning&&state!=='loading'){lightningT-=dt;if(lightningT<=0){lightningT=rr(4,11);litV=1;flash=Math.max(flash,.22);setTimeout(()=>AU.sfx('thunder'),rr(350,1300))}}
  if(litV>0){litV=Math.max(0,litV-dt*2.6);const fl=litV*(.6+.4*Math.sin(t*60));SKYU.uLit.value=fl;hemi.intensity=MOOD.hemi[2]+fl*1.6}else SKYU.uLit.value=0;
  updPlanes(dt);for(const g of gates)g.g.children[0].material.color.set(['#22e4ff','#ff2d95','#ffd12c','#8c55ff'][g.k%4]).multiplyScalar(2+Math.max(0,Math.sin(t*4-g.k*.7))*1.6);
  for(const tr of trains){tr.p+=tr.v*dt;if(tr.p>tr.lim)tr.p=-tr.lim;if(tr.p<-tr.lim)tr.p=tr.lim;tr.g.position[tr.ax]=tr.p}
  if(MAT.road){const fl=1+.03*Math.sin(t*3.1)+.02*Math.sin(t*7.3)+.015*Math.sin(t*13.7);MAT.road.emissiveIntensity=1.25*fl*(MOOD.id==='dawn'?.75:1);MAT.wall.emissiveIntensity=1.4*fl}
  if(MAT.boostTex)MAT.boostTex.offset.y=-(t*1.6)%1;
  // offices switching lights on and off
  winT-=dt;if(winT<=0){winT=.2;for(const w of WIN_CELLS){for(let i=0;i<5;i++){const c=w.cells[Math.floor(w.r()*w.cells.length)];if(w.r()<.5){w.g.fillStyle='#000';w.g.fillRect(...c)}else{w.g.fillStyle=w.pal[Math.floor(w.r()*w.pal.length)];w.g.globalAlpha=.6+w.r()*.4;w.g.fillRect(...c);w.g.globalAlpha=1}}refreshTex(w.t)}}
  flash=Math.max(0,flash-dt*2.2);FX.uniforms.uFlash.value=flash;hitFx=Math.max(0,hitFx-dt*2.5);FX.uniforms.uHit.value=hitFx;FX.uniforms.uCA.value=hitFx*.035+flash*.02;FX.uniforms.uTime.value=t%100;
  {const T3=traffic3d;T3.lanes.forEach((l,i)=>{l.t+=l.v*dt;const d=mod(l.t,3600)-1800;_v.set(l.x+Math.cos(l.a)*d,l.y,l.z+Math.sin(l.a)*d);_q.setFromAxisAngle(Yup,-l.a+(l.v<0?Math.PI:0)+Math.PI/2);_m.compose(_v,_q,_s.set(1,1,1));T3.im.setMatrixAt(i,_m);_v.y-=.5;_m.compose(_v,_q,_s);T3.gl.setMatrixAt(i,_m)});T3.im.instanceMatrix.needsUpdate=T3.gl.instanceMatrix.needsUpdate=true}
  {const p=rain.geometry.attributes.position,c=camera.position;rain.position.set(0,0,0);const rs=MOOD.rain[2],sl=MOOD.rain[3],ln=3.2+rs*.012;for(let i=0;i<p.count;i+=2){let y=p.getY(i)-dt*rs;if(y<-60)y+=180;p.setY(i,y);p.setY(i+1,y+ln);p.setX(i+1,p.getX(i)+sl)}p.needsUpdate=true;rain.position.copy(c)}
  const ref=pl||ships[0];const sp=speedLines.mesh.geometry.attributes.position,sv=ref?ref.v:0;speedLines.d.forEach((l,i)=>{l.z+=sv*dt*1.4;if(l.z>2){l.z=-rr(40,90);const a=R()*Math.PI*2,rad=rr(4,11);l.x=Math.cos(a)*rad;l.y=Math.sin(a)*rad*.6}sp.setXYZ(i*2,l.x,l.y,l.z);sp.setXYZ(i*2+1,l.x,l.y,l.z-l.len*(1+sv/60))});sp.needsUpdate=true;
  GLOWP.list.length=0;for(const p of projs){const f=frameAt(TD,p.dist,F2);const at=f.p.clone().addScaledVector(f.r,p.x).addScaledVector(f.u,1.5);if(p.type==='tornado'){wfxPlace(p,f,p.x,0);for(const o of p.mesh.userData.spin)o.rotation.y=t*(o.material.wireframe?-11:7);for(let k=0;k<2;k++){const a=t*9+k*1.6,r=.8+k*.9;emit(SPARK,at.clone().add(V3(Math.cos(a)*r,k*2.2,Math.sin(a)*r)),V3(-Math.sin(a)*7,5,Math.cos(a)*7),.45,new THREE.Color(1.1,.7,2.2))}GLOWP.list.push({p:at.clone().addScaledVector(f.u,2.5),life:1,max:1,c:new THREE.Color(1.2,.7,2.2)});continue}GLOWP.list.push({p:at,life:1,max:1,c:p.type==='missile'?new THREE.Color(1.6,.8,2):new THREE.Color(2,.9,.4)});emit(FIRE,at,V3(rr(-1,1),rr(0,2),rr(-1,1)),.35,new THREE.Color(1.6,.6,.2))}
  for(const m of mines){const f=frameAt(TD,m.dist,F2);if(m.type){wfxPlace(m,f,m.x,0);if(m.type==='oil')m.mesh.scale.set(m.w/4.6,1,1);const n=m.type==='wall'?7:4;for(let i=0;i<n;i++){const x=m.x+(i/(n-1)-.5)*2*m.w*.9;for(const h of(m.type==='wall'?[.8,2.2]:[.25]))GLOWP.list.push({p:f.p.clone().addScaledVector(f.r,x).addScaledVector(f.u,h),life:1,max:1,c:m.type==='wall'?new THREE.Color(2.4,.9,.3):new THREE.Color(.3,1.4,.6)})}continue}const at=f.p.clone().addScaledVector(f.r,m.x).addScaledVector(f.u,.9);GLOWP.list.push({p:at,life:(Math.floor(t*6)%2)?1:.4,max:1,c:new THREE.Color(2,.3,.4)})}
  if(duelGhost&&ghostShip&&pl&&state!=='menu'){const f=duelGhost.f,i=Math.min(f.length-2,Math.floor(raceT*20)*2);if(state!=='countdown'&&i>=0){frameAt(TD,f[i],F2);ghostShip.position.copy(F2.p).addScaledVector(F2.r,f[i+1]).addScaledVector(F2.u,1.6);ghostShip.userData.m.quaternion.setFromRotationMatrix(_m.makeBasis(F2.r,F2.u,F2.t.clone().negate()));ghostShip.visible=true}else ghostShip.visible=false}
  else if(ghost&&ghostShip&&pl&&state!=='menu'){const lt=raceT-pl.lapStart,i=Math.floor(lt*20)*2;if(pl.lap>=0&&ghost.f[i]!=null&&lt>0){const gd=pl.lap*TD.L+ghost.f[i],gx=ghost.f[i+1];frameAt(TD,gd,F2);ghostShip.position.copy(F2.p).addScaledVector(F2.r,gx).addScaledVector(F2.u,1.6);ghostShip.userData.m.quaternion.setFromRotationMatrix(_m.makeBasis(F2.r,F2.u,F2.t.clone().negate()));ghostShip.visible=true}else ghostShip.visible=false}}

