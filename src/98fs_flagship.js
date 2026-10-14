// ============================================================ FS: GRAND TOUR flagship track (trk-5, 2026-10-14)
// Alex on beta.59: "ALL TRACKS ARE BORING ... no lively, no variety ... NOT FUN". trk-4 tracks passed width/route/jump metrics but were plain loops.
// This is ONE hand-designed lap (docs/TRACKS_2K_BEATS.md): 4 biomes (stadium town -> red-rock canyon -> farm + river -> lagoon), something happens
// every few seconds (beats), 2 risk/reward shortcuts (the barn + river jump; the lagoon splash as a boat), set pieces built from LEGO parts.
// Beats are tied to piece indices of the built-in log (FS_BEATS); FS_build dresses them after BX_dress. Flag: OFF by default, ?fs=1 turns it on.
const FS_NAME='GRAND TOUR',FS_ON=/[?&]fs=1/.test(location.search); // coordinator STOP 2026-10-14: default OFF until approved; ?fs=1 turns it on
const FS={g:null,walls:[],studs:[],col:[],spin:[],got:0,beatT:{},on:false};
// biome of a ground point (same regions as BX_WORLDS.gp)
function FS_zone(x,z){return x>40&&z<100?'canyon':z>96?'farm':x<-110&&z>-90?'lagoon':'town'}
const FS_PAL={town:['#4fb33a','#5cc444'],canyon:['#e2a25a','#c9763a'],farm:['#6cc040','#4fa832'],lagoon:['#f0dc9a','#e6cf86']};
// ---------------------------------------------------------------- the lap (tools/bx/plan.js: closed, 104 pieces, 1.57 km, 0 open exits except the splash gap)
// ---------------------------------------------------------------- the lap (tools/bx/plan.js: closed, 152 pieces, 2.0 km; the only open exit is the splash gap)
const FS_LOG=()=>bxCh('gp',[12,5,2,3],[
 'sf','st','st','bo','st','st','st','st','st','st',                                    // 0-9 STADIUM: gantry, grandstands, BOOST, brick wall, studs (no kicker: it landed in the turn)
 'br','st','st','bo','st','st','st','st','kj',...bxRep('st',14),'bl','st','st','bl',  // 10-36 TOWN hairpin north round the windmill: houses, crowd, wall, studs
 ...bxRep('st',6),'bo',...bxRep('st',13),'br',                                         // 37-57 town leg south: wall, crowd, studs
 'wbr','st','su','st','st',                                                             // 58-62 banked turn, climb through the cliff cut into the CANYON
 'bl','st','bo','lp','st','st','br',                                                    // 63-69 canyon: BOOST into the LOOP (a pad before the R20 bend threw cars wide)
 'st','bo',...bxRep('st',10),'br','st','st','st','st','br',                            // 70-87 rim run (crowd, wall), high bridge over the gorge (a kicker here landed in the next turn)
 'st','st','st','bl','st','bl','st','sd','st','st','st',                                // 88-98 switchback, CANYON DROP
 'wbr','bo','st','fk',1,'br','bl','bl','br',                                            // 99-106 FARM; split: the main road bridges the river by the lake
 0,'st','st','st','st','st','kj','st','st','st','st','mg',                              // 107-117 shortcut: through the barn (109-111, clear of the main road), kicker over the river
 'wbr','st','bo','st','fk',1,'br','bl','st','st','st','bl','br',                        // 118-129 LAGOON; split: the main road round the cove
 0,'dn',[8,30,0,2],'up','mg',                                                            // 130-132 shortcut: splash into the cove, 48 m as a boat
 'st','st','kj','st','st','st','bo',...bxRep('st',11),'br'],0);                          // 133-151 beach run: kicker, crate walls, crowd, studs -> stadium
// beats: [piece, type, extra]. A beat is something the player sees or does; the lap test needs >= 8 types and no 6 s without one.
const FS_N=152;
const FS_BEATS=[[0,'start'],[3,'boost'],[5,'smash'],[7,'studs'],[10,'bank'],[13,'boost'],[15,'studs'],[18,'jump'],[21,'crowd','TOWN CUP'],[24,'studs'],[27,'smash'],[30,'landmark'],[33,'hairpin'],
 [38,'studs'],[41,'crowd','GO GO GO'],[43,'boost'],[46,'smash'],[49,'studs'],[52,'crowd','TOWN CUP'],[55,'studs'],[58,'bank'],[60,'climb'],[61,'gate','CANYON'],[64,'studs'],[65,'boost'],
 [66,'loop'],[71,'boost'],[73,'crowd','CANYON CUP'],[76,'smash'],[79,'studs'],[84,'gorge'],[88,'studs'],[95,'drop'],[99,'gate','FARM'],[100,'boost'],[102,'shortcut'],[104,'studs'],[105,'bridge'],
 [109,'barn'],[112,'river'],[114,'studs'],[118,'gate','LAGOON'],[120,'boost'],[122,'shortcut'],[125,'studs'],[130,'splash'],[131,'buoys'],[133,'studs'],[135,'jump'],[139,'boost'],[141,'crowd','BEACH PARTY'],
 [144,'smash'],[146,'studs'],[149,'smash'],[151,'bank']];
// ---------------------------------------------------------------- helpers
const fsStd=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.42,...o});
function FS_pcs(){return BX.pcs.filter(p=>!p.dead)}
function FS_at(k,t=.5,b=0){const pc=FS_pcs()[k];if(!pc)return null;const S=pc.S[Math.min(b,pc.S.length-1)];return S[Math.round(t*(S.length-1))]}
function FS_txt(t,bg,fg,w=512,h=128){return BX_tex(w,h,(c,W,H)=>{c.fillStyle=bg;c.fillRect(0,0,W,H);c.fillStyle='#111';for(let i=0;i<W/16;i++){c.fillRect(i*16,(i%2)*6,16,6);c.fillRect(i*16,H-12+(i%2)*6,16,6)}
 c.font=`italic 900 ${Math.round(H*.56)}px system-ui,Arial`;c.textAlign='center';c.textBaseline='middle';c.lineWidth=H*.08;c.strokeStyle='#1b1b1b';c.strokeText(t,W/2,H/2+2);c.fillStyle=fg;c.fillText(t,W/2,H/2+2)})}
// a box with LEGO studs on top (instanced studs come from the caller)
function FS_box(g,w,h,d,c,x,y,z,ry=0){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),typeof c==='object'?c:fsStd(c));m.position.set(x,y,z);m.rotation.y=ry;m.castShadow=m.receiveShadow=true;g.add(m);return m}
function FS_cyl(g,r,h,c,x,y,z,seg=16,r2){const m=new THREE.Mesh(new THREE.CylinderGeometry(r2==null?r:r2,r,h,seg),typeof c==='object'?c:fsStd(c));m.position.set(x,y,z);m.castShadow=true;g.add(m);return m}
function FS_studTop(g,w,d,y,c,x0=0,z0=0,ry=0){const n=Math.max(1,Math.round(w/1.6)),k=Math.max(1,Math.round(d/1.6)),im=new THREE.InstancedMesh(new THREE.CylinderGeometry(.48,.48,.34,10),fsStd(c),n*k),m=new THREE.Matrix4(),q=new THREE.Matrix4().makeRotationY(ry);let i=0;
 for(let a=0;a<n;a++)for(let b=0;b<k;b++){m.makeTranslation((a+.5)*w/n-w/2,y+.17,(b+.5)*d/k-d/2);m.premultiply(q);m.setPosition(m.elements[12]+x0,m.elements[13],m.elements[14]+z0);im.setMatrixAt(i++,m)}g.add(im);return im}
// world-placed group facing along a sample's forward
// local +z = forward, local +x = LEFT of travel; lat > 0 = right of travel (BX s.S)
function FS_grp(s,lat,up=0){const g=new THREE.Group(),Fh=s.F.clone().setY(0).normalize(),Sh=s.S.clone().setY(0).normalize();g.position.copy(s.p).addScaledVector(Sh,lat);g.position.y=up==null?s.p.y:BX_h(g.position.x,g.position.z)+up;g.rotation.y=Math.atan2(Fh.x,Fh.z);return g}
// the side of a sample that faces away from the course centre (outside of the lap); lat > 0 = right of travel
// the lap turns right, so the OUTSIDE is the left (-1); use the right if the left is water or another road
function FS_side(s){const L=s.S.clone().setY(0).normalize().negate(),o=s.p.clone().addScaledVector(L,30);return BX_h(o.x,o.z)<-.7||BX.samp.some(q=>Math.hypot(q.s.p.x-o.x,q.s.p.z-o.z)<BX_HW+4)?1:-1}
// ---------------------------------------------------------------- set pieces
// GRANDSTAND: 3 stepped tiers packed with minifigs (yellow heads, team colours), a striped roof on posts, a printed banner; 30 m long
function FS_stand(g0,s,side,len=30,ban='GRAND TOUR'){const off=side*(BX_HW+13),g=FS_grp(s,off,0),o=-side,C=['#c91a09','#0055bf','#f2cd37','#237841','#fe8a18','#ffffff'].map(bxCol);
 for(let t=0;t<3;t++)FS_box(g,2.6,1.4*(t+1),len,'#9aa1a8',o*(t*2.6),.7*(t+1),0);
 const n=3*Math.floor(len/1.4),body=new THREE.InstancedMesh(new THREE.BoxGeometry(.9,1,.7),fsStd('#fff'),n),head=new THREE.InstancedMesh(new THREE.CylinderGeometry(.38,.38,.6,10),fsStd('#f2cd37'),n),m=new THREE.Matrix4();let i=0;
 for(let t=0;t<3;t++)for(let k=0;k<Math.floor(len/1.4);k++){const x=o*(t*2.6),y=1.4*(t+1)+.5,z=-len/2+.7+k*1.4,j=(k*7+t*3)%6;m.makeTranslation(x,y+(k%3===0?.15:0),z);body.setMatrixAt(i,m);body.setColorAt(i,C[j]);m.makeTranslation(x,y+.82,z);head.setMatrixAt(i,m);i++}
 body.castShadow=true;g.add(body,head);FS.spin.push({crowd:body,head,base:[...body.instanceMatrix.array]});
 for(const z of[-len/2,len/2,0])FS_cyl(g,.25,7.2,'#d9d9d9',o*7,3.6,z,6);const roof=FS_box(g,9,.5,len+1,FS.roofM||(FS.roofM=new THREE.MeshStandardMaterial({roughness:.5,map:BX_tex(64,64,(c,W,H)=>{for(let k=0;k<4;k++){c.fillStyle=k%2?'#fff':'#c91a09';c.fillRect(k*16,0,16,H)}})})),o*3.4,7.4,0);roof.rotation.z=-o*.12;
 const bm=new THREE.Mesh(new THREE.PlaneGeometry(len*.8,2.2),new THREE.MeshStandardMaterial({map:FS_txt(ban,'#ffd21a','#c91a09',1024,96),roughness:.6}));bm.position.set(-o*1.4,1.4,0);bm.rotation.y=-o*Math.PI/2;g.add(bm);
 g0.add(g);FS.col.push({box:g,w:10,d:len,cx:o*3.4});return g}
// START GANTRY: chunky arch over the deck, checker beam, the track name
function FS_gantry(g0,s){const g=FS_grp(s,0),W=BX_HW+1.5;for(const x of[-W,W]){FS_box(g,2,9,2,'#1b1b1b',x,4.5,0);FS_studTop(g,2,2,9,'#1b1b1b',x,0)}
 const ck=new THREE.MeshStandardMaterial({roughness:.5,map:BX_tex(128,32,(c,w,h)=>{for(let a=0;a<16;a++)for(let b=0;b<4;b++){c.fillStyle=(a+b)%2?'#111':'#fff';c.fillRect(a*8,b*8,8,8)}})});
 FS_box(g,2*W+2,1.4,1.6,ck,0,9.6,0);const t=new THREE.Mesh(new THREE.PlaneGeometry(2*W-2,2.4),new THREE.MeshStandardMaterial({map:FS_txt('GRAND TOUR','#c91a09','#ffd21a'),roughness:.5}));t.position.set(0,11.4,-.81);t.rotation.y=Math.PI;g.add(t);
 const t2=t.clone();t2.position.z=.81;t2.rotation.y=0;g.add(t2);for(const x of[-W,W])FS.col.push({c:[g.position.x+Math.cos(g.rotation.y)*x,g.position.z-Math.sin(g.rotation.y)*x],r:1.6});g0.add(g)}
// BIOME GATE: two LEGO towers in the biome colour with a sign; the road goes under it
function FS_gate(g0,s,txt){const g=FS_grp(s,0),W=BX_HW+2,c={CANYON:['#c4401b','#ffd21a'],FARM:['#237841','#ffffff'],LAGOON:['#0a8fd0','#ffffff']}[txt]||['#0055bf','#fff'];
 for(const x of[-W,W]){for(let k=0;k<4;k++)FS_box(g,2.4,2,2.4,k%2?'#f4f4f4':c[0],x,1+k*2,0);FS_studTop(g,2.4,2.4,8,c[0],x,0)}
 FS_box(g,2*W+2.4,2.2,1.2,c[0],0,9.2,0);for(const z of[-.62,.62]){const t=new THREE.Mesh(new THREE.PlaneGeometry(2*W-2,2),new THREE.MeshStandardMaterial({map:FS_txt(txt,c[0],c[1]),roughness:.5}));t.position.set(0,9.2,z);t.rotation.y=z<0?Math.PI:0;g.add(t)}
 for(const x of[-W,W])FS.col.push({c:[g.position.x+Math.cos(g.rotation.y)*x,g.position.z-Math.sin(g.rotation.y)*x],r:1.8});g0.add(g)}
// BREAKABLE WALL: a full-width wall of LEGO bricks across the road; driving through bursts it into bricks (no slow-down) and fills a third of the boost meter
function FS_wall(g0,s,style){const W=2*BXRW-1,n=Math.round(W/1.6),rows=style==='crates'?2:3,cnt=n*rows,bw=W/n,geo=style==='crates'?new THREE.BoxGeometry(bw*.96,1.5,1.4):new THREE.BoxGeometry(bw*.96,.96,.8),
 im=new THREE.InstancedMesh(geo,fsStd('#fff'),cnt),C=(style==='crates'?['#a0702e','#c58a3e']:['#c91a09','#f2cd37','#0055bf','#f4f4f4']).map(bxCol),F=s.F.clone().setY(0).normalize(),R=bxV(F.z,0,-F.x),B=[],m=new THREE.Matrix4(),q=new THREE.Quaternion().setFromUnitVectors(bxV(0,0,1),F);
 for(let r=0;r<rows;r++)for(let k=0;k<n;k++){const lat=-W/2+bw*(k+.5)+(r%2?bw*.25:0),h=style==='crates'?1.5:.96,p=s.p.clone().addScaledVector(R,-lat);p.y+=h*(r+.5);B.push({p0:p.clone(),p,v:bxV(),r:0});m.compose(p,q,bxV(1,1,1));im.setMatrixAt(B.length-1,m);im.setColorAt(B.length-1,C[(k+r)%C.length])}
 im.castShadow=true;g0.add(im);const st={visible:true};FS.walls.push({s,F,im,st,B,q,broke:-1,W:W/2+.5})}
function FS_wallHit(){const V=BX.v;if(!V)return;for(const w of FS.walls){if(w.broke<0){const d=V.p.clone().sub(w.s.p),a=d.dot(w.F),lat=Math.abs(d.x*w.F.z-d.z*w.F.x);
  if(Math.abs(a)<2.6&&lat<w.W&&Math.abs(d.y)<4){w.broke=0;w.st.visible=false;const sp=Math.max(10,V.v.length());for(const b of w.B){b.v.copy(V.F).multiplyScalar(sp*(.4+Math.random()*.5)).add(bxV((Math.random()-.5)*8,5+Math.random()*7,(Math.random()-.5)*8));b.r=Math.random()*6}
   V.boostE=Math.min(1,(V.boostE||0)+.34);FS.smash=(FS.smash||0)+1;(FS.smashW=FS.smashW||[]).push(FS.walls.indexOf(w));BX_burst(w.s.p.clone().add(bxV(0,1.5,0)),14,0xf2cd37,9);BX_say('SMASH! +BOOST',1)}}}}
function FS_wallAnim(dt){const m=new THREE.Matrix4(),one=bxV(1,1,1);for(const w of FS.walls){if(w.broke>=0&&w.broke<2.2){w.broke+=dt;w.B.forEach((b,i)=>{b.v.y-=BXG*dt;b.p.addScaledVector(b.v,dt);const g=BX_h(b.p.x,b.p.z);if(b.p.y<g+.4){b.p.y=g+.4;b.v.multiplyScalar(.5);b.v.y=Math.abs(b.v.y)*.3}
   m.compose(b.p,new THREE.Quaternion().setFromEuler(new THREE.Euler(b.r*w.broke,b.r*.5*w.broke,0)).premultiply(w.q),w.broke>1.8?one.clone().multiplyScalar(Math.max(.01,(2.2-w.broke)/.4)):one);w.im.setMatrixAt(i,m)});w.im.instanceMatrix.needsUpdate=true}}}
function FS_wallReset(){const m=new THREE.Matrix4(),one=bxV(1,1,1);for(const w of FS.walls){w.broke=-1;w.st.visible=true;w.B.forEach((b,i)=>{b.p.copy(b.p0);b.v.set(0,0,0);m.compose(b.p0,w.q,one);w.im.setMatrixAt(i,m)});w.im.instanceMatrix.needsUpdate=true}}
// STUDS: a weaving line of 8 gold LEGO studs over ~50 m; drive through them (counter on the HUD, each tops up the boost meter)
function FS_studLine(k,lane=0){const L=FS_pcs(),P=[];for(let j=k;j<Math.min(L.length,k+6)&&P.length<60;j++){const S=L[j].S[Math.min(lane,L[j].S.length-1)];for(const s of S)if(!P.length||s.p.distanceTo(P[P.length-1].p)>.5)P.push(s)}
 let d=0,last=null;const out=[];for(const s of P){if(last)d+=s.p.distanceTo(last.p);last=s;if(out.length<8&&d>=out.length*6.5){const lat=4.5*Math.sin(out.length*.8+k),R=s.S;out.push(s.p.clone().addScaledVector(R,lat).addScaledVector(s.U,1.1))}}return out}
function FS_studs(g0,pts){const im=FS.studIm;for(const p of pts)FS.studs.push({p,got:false})}
function FS_studMesh(g0){const n=FS.studs.length;if(!n)return;const im=FS.studIm=new THREE.InstancedMesh(new THREE.CylinderGeometry(.62,.62,.42,16),fsStd('#ffcf1a',{metalness:.35,roughness:.25,emissive:0x6a4a00,emissiveIntensity:.35}),n);im.castShadow=true;g0.add(im);FS_studDraw()}
function FS_studDraw(){const im=FS.studIm;if(!im)return;const m=new THREE.Matrix4(),q=new THREE.Quaternion(),t=BX.t||0;FS.studs.forEach((s,i)=>{q.setFromEuler(new THREE.Euler(Math.PI/2,0,t*3+i));m.compose(s.p,q,s.got?bxV(.001,.001,.001):bxV(1,1,1));im.setMatrixAt(i,m)});im.instanceMatrix.needsUpdate=true}
function FS_studStep(){const V=BX.v;if(!V)return;let hit=0;for(const s of FS.studs)if(!s.got&&s.p.distanceToSquared(V.p)<2.6*2.6){s.got=true;FS.got++;hit++;V.boostE=Math.min(1,(V.boostE||0)+.04)}if(hit){BX_burst(V.p.clone().add(bxV(0,1.2,0)),4,0xffcf1a,4)}}
// CHEVRON boards on the outside of every bend (2K: chevrons outside each corner), 2.6 m boards on posts, arrows point into the turn
function FS_chev(g0){const L=FS_pcs(),T={cl:-1,bl:-1,wbl:-1,cr:1,br:1,wbr:1},A=[];for(const pc of L){const sg=T[pc.type];if(!sg||pc.S.length>1)continue;const S=pc.S[0];for(let k=1;k<S.length;k+=Math.max(2,Math.round(S.length/5))){const s=S[k],o=-sg*(BX_HW+5.5);
 const x=s.p.x+s.S.x*o,z=s.p.z+s.S.z*o,y=BX_h(x,z);if(y<-.6||BX.samp.some(q=>q.pc!==pc&&Math.hypot(q.s.p.x-x,q.s.p.z-z)<BX_HW+2))continue;A.push([x,Math.max(y,s.p.y-3),z,s,sg])}}
 const mt=sg=>new THREE.MeshStandardMaterial({roughness:.5,map:BX_tex(128,64,(c,w,h)=>{c.fillStyle='#c91a09';c.fillRect(0,0,w,h);c.fillStyle='#fff';for(let k=0;k<3;k++){const x=18+k*36;c.beginPath();if(sg>0){c.moveTo(x,6);c.lineTo(x+22,h/2);c.lineTo(x,h-6);c.lineTo(x+10,h-6);c.lineTo(x+32,h/2);c.lineTo(x+10,6)}else{c.moveTo(x+32,6);c.lineTo(x+10,h/2);c.lineTo(x+32,h-6);c.lineTo(x+22,h-6);c.lineTo(x,h/2);c.lineTo(x+22,6)}c.fill()}})});
 const M={1:mt(1),'-1':mt(-1)};for(const[x,y,z,s,sg]of A){const b=new THREE.Mesh(new THREE.BoxGeometry(3.2,1.6,.3),[fsStd('#fff'),fsStd('#fff'),fsStd('#fff'),fsStd('#fff'),M[-sg],M[sg]]);b.position.set(x,y+1.9,z);b.rotation.y=Math.atan2(s.F.x,s.F.z)+Math.PI;b.castShadow=true;g0.add(b);
  for(const e of[-1.1,1.1]){const p=FS_cyl(g0,.12,1.3,'#d9d9d9',x+Math.cos(b.rotation.y)*e,y+.6,z-Math.sin(b.rotation.y)*e,6)}}return A.length}
// BEND BARRIERS (2K: a low wall with chevrons on the outside of every bend; straights stay open): a 1 m red/white LEGO brick wall 4 m outside the deck edge,
// from 8 m before to 8 m after each bend; it is solid (glancing hits slide). Without it an overshoot fell off the plateau cliffs or onto the canyon drop.
function FS_barrier(g0){const L=FS_pcs(),T={cl:-1,bl:-1,wbl:-1,cr:1,br:1,wbr:1},seg=[];for(const pc of L){const sg=T[pc.type];if(!sg||pc.S.length>1)continue;const S=pc.S[0],o=-sg*(BX_HW+4),P=[];
 const f0=S[0],f1=S[S.length-1];P.push(f0.p.clone().addScaledVector(f0.F,-8).addScaledVector(f0.S,o));for(const s of S)P.push(s.p.clone().addScaledVector(s.S,o));P.push(f1.p.clone().addScaledVector(f1.F,8).addScaledVector(f1.S,o));
 for(let k=1;k<P.length;k++){const a=P[k-1],b=P[k],m=a.clone().lerp(b,.5);if(BX.samp.some(q=>q.pc!==pc&&Math.hypot(q.s.p.x-m.x,q.s.p.z-m.z)<BX_HW+2&&Math.abs(q.s.p.y-m.y)<5))continue;
  const gy=BX_h(m.x,m.z);if(gy<-.6)continue;seg.push([a.x,a.z,b.x,b.z,Math.max(gy,m.y-.4)])}}
 FS.rail=seg;if(!seg.length)return 0;const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,.7),fsStd('#fff'),seg.length),M=new THREE.Matrix4(),q=new THREE.Quaternion(),C=[bxCol('#c91a09'),bxCol('#f4f4f4')];
 seg.forEach(([x1,z1,x2,z2,y],i)=>{const L2=Math.hypot(x2-x1,z2-z1);q.setFromAxisAngle(bxV(0,1,0),Math.atan2(z1-z2,x2-x1));M.compose(bxV((x1+x2)/2,y+.5,(z1+z2)/2),q,bxV(L2+.1,1,1));im.setMatrixAt(i,M);im.setColorAt(i,C[i%2])});im.castShadow=im.receiveShadow=true;g0.add(im);return seg.length}
function FS_railPush(){const V=BX.v,R=FS.rail;if(!R||!V)return;for(const[x1,z1,x2,z2,y]of R){if(V.p.y>y+3.2||V.p.y<y-2)continue;const dx=x2-x1,dz=z2-z1,l2=dx*dx+dz*dz||1,t=bxCl(((V.p.x-x1)*dx+(V.p.z-z1)*dz)/l2,0,1),cx=x1+dx*t,cz=z1+dz*t,ex=V.p.x-cx,ez=V.p.z-cz,d=Math.hypot(ex,ez);
 if(d<1.5&&d>.001){const nx=ex/d,nz=ez/d;V.p.x+=nx*(1.5-d);V.p.z+=nz*(1.5-d);const vn=V.v.x*nx+V.v.z*nz;if(vn<0){V.v.x-=nx*vn*1.15;V.v.z-=nz*vn*1.15;if(vn<-6)BX.m.wall++}}}}
// GIANT ARROWS painted on the road before every kicker (2K: ramps are marked with giant ground arrows)
function FS_arrows(g0){const L=FS_pcs(),mat=FS.arM||(FS.arM=new THREE.MeshStandardMaterial({transparent:true,roughness:.6,polygonOffset:true,polygonOffsetFactor:-3,map:BX_tex(128,128,(c,w,h)=>{c.clearRect(0,0,w,h);c.fillStyle='#ffd21a';c.strokeStyle='#1b1b1b';c.lineWidth=5;for(const y of[8,58]){c.beginPath();c.moveTo(14,y+52);c.lineTo(64,y);c.lineTo(114,y+52);c.lineTo(114,y+66);c.lineTo(64,y+20);c.lineTo(14,y+66);c.closePath();c.fill();c.stroke()}})}));
 L.forEach((pc,i)=>{if(!pc.def.jump||i<2)return;for(const k of[i-1,i-2]){const s=FS_at(k,.5);if(!s||FS_pcs()[k].S.length>1)continue;const p=new THREE.Mesh(new THREE.PlaneGeometry(9,8),mat),M4=new THREE.Matrix4().makeBasis(s.S,s.F,s.U);p.quaternion.setFromRotationMatrix(M4);p.position.copy(s.p).addScaledVector(s.U,.06);g0.add(p)}})}
// LANDMARKS --------------------------------------------------------
// windmill on a brick base, sails turn
function FS_windmill(g0,x,z){const g=new THREE.Group(),y=BX_h(x,z);g.position.set(x,y,z);FS_box(g,9,3,9,'#a0a5a9',0,1.5,0);FS_studTop(g,9,9,3,'#a0a5a9');FS_cyl(g,3.6,12,'#f4f4f4',0,9,0,8,2.6);FS_cyl(g,3.2,3.6,'#c91a09',0,16.8,0,8,.4);
 const hub=new THREE.Group();hub.position.set(0,14.4,3.4);for(let k=0;k<4;k++){const a=new THREE.Group();a.rotation.z=k*Math.PI/2;FS_box(a,1.2,9,.3,'#7c4a1e',0,5,0);FS_box(a,2.6,7,.2,'#f4f4f4',1.6,5.6,.1);hub.add(a)}g.add(hub);FS.spin.push({o:hub,ax:'z',sp:.9});
 g.rotation.y=Math.atan2(-x,-z-120);g0.add(g);FS.col.push({c:[x,z],r:5.2})}
// lighthouse on the lagoon islet (red/white rings, glowing lamp)
function FS_lighthouse(g0,x,z){const g=new THREE.Group(),y=Math.max(.4,BX_h(x,z));g.position.set(x,y,z);for(let k=0;k<7;k++)FS_cyl(g,2.8-k*.18,3,k%2?'#f4f4f4':'#c91a09',0,1.5+k*3,0,18);FS_cyl(g,2.2,2.4,new THREE.MeshStandardMaterial({color:0xffe27a,emissive:0xffc400,emissiveIntensity:.9}),0,23.2,0,14);
 FS_cyl(g,2.6,1.2,'#1b1b1b',0,25,0,14,.6);const b=new THREE.Group();b.position.y=23.2;FS_box(b,9,.5,.5,new THREE.MeshBasicMaterial({color:0xfff2a8,transparent:true,opacity:.55}),4.5,0,0);b.add(b.children[0]);g.add(b);FS.spin.push({o:b,ax:'y',sp:1.4});g0.add(g);FS.col.push({c:[x,z],r:3.2})}
// barn the shortcut drives THROUGH: red walls beside the deck, a white-trimmed gable roof over it, hay bales outside
function FS_barn(g0,k0,k1){const a=FS_at(k0,0,0),b=FS_at(k1,1,0);if(!a||!b)return;const mid=a.p.clone().lerp(b.p,.5),F=b.p.clone().sub(a.p).setY(0),len=F.length()+2;F.normalize();const g=new THREE.Group();g.position.copy(mid);g.rotation.y=Math.atan2(F.x,F.z);
 const W=BX_HW+1.8,red=fsStd('#b3261e'),wh=fsStd('#f4f4f4');for(const x of[-W,W]){FS_box(g,1.2,8,len,red,x,4,0);for(let z=-len/2+2;z<len/2;z+=6)FS_box(g,1.4,8.2,.6,wh,x,4.1,z)}
 for(const sx of[-1,1]){const r=FS_box(g,W+1.6,.6,len+2,'#5a3a22',sx*(W+1.6)/2,10.2,0);r.rotation.z=-sx*.42}FS_box(g,.8,1,len+2,wh,0,12.4,0);
 for(const z of[-len/2-.4,len/2+.4]){const tri=new THREE.Shape();tri.moveTo(-W-.6,8);tri.lineTo(W+.6,8);tri.lineTo(0,12.6);const m=new THREE.Mesh(new THREE.ShapeGeometry(tri),new THREE.MeshStandardMaterial({color:0xb3261e,side:THREE.DoubleSide}));m.position.z=z;g.add(m);
  const sg=new THREE.Mesh(new THREE.PlaneGeometry(9,1.6),new THREE.MeshStandardMaterial({map:FS_txt('BARN','#f4f4f4','#b3261e',256,64)}));sg.position.set(0,9.4,z+(z<0?-.05:.05));sg.rotation.y=z<0?Math.PI:0;g.add(sg)}
 g0.add(g);for(let t=0;t<=1;t+=.2){const p=a.p.clone().lerp(b.p,t),R=bxV(F.z,0,-F.x);for(const sx of[-1,1])FS.col.push({c:[p.x+R.x*sx*W,p.z+R.z*sx*W],r:1.6})}
 // hay bales + a silo beside the barn
 const R=bxV(F.z,0,-F.x);for(let i=0;i<6;i++){const p=mid.clone().addScaledVector(R,(i%2?1:-1)*(W+6+(i>>1)*3.2)).addScaledVector(F,(i-3)*3);const h=FS_cyl(g0,1.3,2,'#e8c25a',p.x,BX_h(p.x,p.z)+1.3,p.z,14);h.rotation.z=Math.PI/2;h.rotation.y=i}
 const sp=mid.clone().addScaledVector(R,W+16);const sy=BX_h(sp.x,sp.z);FS_cyl(g0,3.4,16,'#d9d9d9',sp.x,sy+8,sp.z,18);FS_cyl(g0,3.6,3,'#0055bf',sp.x,sy+17,sp.z,18,.4);FS.col.push({c:[sp.x,sp.z],r:3.6})}
// BUOY GATES in the splash gap (2K Vessel Run: foam-noodle arches mark the water line): two arches between the end of the ramp down and the ramp up
function FS_buoys(g0,kd,ku){const a=FS_at(kd,1),b=FS_at(ku,0);if(!a||!b)return;const F=b.p.clone().sub(a.p).setY(0).normalize(),R=bxV(F.z,0,-F.x);
 for(const t of[.3,.65]){const c=a.p.clone().lerp(b.p,t);c.y=0;const g=new THREE.Group();g.position.copy(c);g.rotation.y=Math.atan2(F.x,F.z);
  const arc=new THREE.Mesh(new THREE.TorusGeometry(BXRW,.55,8,24,Math.PI),fsStd(t<.5?'#fe8a18':'#ffd21a'));g.add(arc);for(const x of[-BXRW,BXRW])FS_cyl(g,1.1,1.2,'#f4f4f4',x,.2,0,12);g0.add(g)}}
// mesa tops: a few big brick slabs + a giant cactus on the canyon floor
function FS_cactus(g0,x,z,s=1){const y=BX_h(x,z),c=fsStd('#3a8f3a');const g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(s);FS_cyl(g,1,10,c,0,5,0,10);for(const[sx,h]of[[-1,5],[1,7]]){FS_box(g,2,1.6,1.6,c,sx*1.6,h,0);FS_cyl(g,.75,3.4,c,sx*2.6,h+1.7,0,10)}g0.add(g);FS.col.push({c:[x,z],r:1.3*s})}
function FS_palm(g0,x,z){const y=BX_h(x,z);if(y<.2)return;const g=new THREE.Group();g.position.set(x,y,z);for(let k=0;k<6;k++){const s=FS_cyl(g,.42-k*.03,1.6,'#9c6b3a',k*.18,.8+k*1.5,0,8);s.rotation.z=-.08}
 for(let k=0;k<6;k++){const l=FS_box(g,.5,.25,4.6,'#2f9e3c',1.1,9.6,0);l.geometry.translate(0,0,2.1);l.rotation.y=k*Math.PI/3;l.rotation.x=.42;l.position.set(1.1,9.6,0)}g0.add(g);FS.col.push({c:[x,z],r:.8})}
// hot-air balloon / blimp drifting over the map (life in the sky)
function FS_balloon(g0,x,y,z,c1,c2){const g=new THREE.Group();g.position.set(x,y,z);const b=new THREE.Mesh(new THREE.SphereGeometry(6,16,12),new THREE.MeshStandardMaterial({roughness:.5,map:BX_tex(64,32,(c,w,h)=>{for(let k=0;k<8;k++){c.fillStyle=k%2?c1:c2;c.fillRect(k*8,0,8,h)}})}));b.scale.y=1.18;g.add(b);
 FS_box(g,2.4,1.6,2.4,'#7c4a1e',0,-9.6,0);for(const[a,c]of[[1,1],[1,-1],[-1,1],[-1,-1]])FS_cyl(g,.06,4,'#333',a*1,-7.4,c*1,4);g0.add(g);FS.spin.push({o:g,drift:[x,y,z,Math.random()*6]})}
// a real LEGO set (LDraw OMR, CCAL 2.0) at minifig scale, loaded on demand (98ld_run.js); boats sit in the water
function FS_ld(g0,id,x,z,yaw,water){try{if(typeof LD_load!=='function')return;LD_load(id).then(()=>{if(!FS.g||FS.g!==g0||!LD_MODELS[id])return;const B=LD_br(id),near=LDW_geo(B),box=new THREE.Box3();for(const[g]of near){g.computeBoundingBox();box.union(g.boundingBox)}
  const c=box.getCenter(bxV()),SW=LD_SW*(water?1:LD_FIG),y=water?-.35*SW*3:BX_h(x,z)-.05,X=new THREE.Matrix4().makeTranslation(x,y,z).multiply(new THREE.Matrix4().makeRotationY(yaw)).multiply(new THREE.Matrix4().makeScale(SW,SW,SW)).multiply(new THREE.Matrix4().makeTranslation(-c.x,-box.min.y,-c.z));
  for(const[g,mat]of near){g.applyMatrix4(X);const o=new THREE.Mesh(g,mat);o.castShadow=o.receiveShadow=true;g0.add(o)}const sz=box.getSize(bxV());FS.col.push({c:[x,z],r:Math.max(sz.x,sz.z)*SW/2*.8});FS.ld=(FS.ld||0)+1}).catch(()=>{})}catch(e){}}
// BIOME DRESSING along the whole lap (2K: a near wall of scenery on one side, a landmark in the distance): every ~16 m on both sides, 12-24 m off the deck edge,
// TOWN = LEGO houses with windows and roofs, CANYON = red-rock hoodoos (stacked slabs) and cacti, FARM = white fences, hay, orchard trees, LAGOON = beach umbrellas and palms.
// All instanced; houses and hoodoos are solid (circle colliders).
function FS_biomeDress(g0){const L=FS_pcs(),pts=[],near=(x,z,r)=>BX.samp.some(q=>Math.hypot(q.s.p.x-x,q.s.p.z-z)<r),busy=(x,z,r)=>FS.col.some(c=>c.c?Math.hypot(c.c[0]-x,c.c[1]-z)<c.r+r:Math.hypot(c.box.position.x-x,c.box.position.z-z)<c.d/2+r);
 let seed=11;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
 for(const pc of L)for(const S of pc.S){let run=0;for(let k=1;k<S.length;k++){run+=S[k].p.distanceTo(S[k-1].p);if(run<10)continue;run=0;const s=S[k];for(const sg of[-1,1]){const off=BX_HW+11+rnd()*20,x=s.p.x+s.S.x*sg*off,z=s.p.z+s.S.z*sg*off;
  if(Math.abs(x)>BXW/2-6||Math.abs(z)>BXW/2-6)continue;const h=BX_h(x,z);if(h<.3||BX_tn(x,z).y<.86||near(x,z,BX_HW+9)||busy(x,z,7))continue;pts.push([x,h,z,FS_zone(x,z),Math.atan2(s.F.x,s.F.z),rnd()])}}}
 const by={town:[],canyon:[],farm:[],lagoon:[]};for(const q of pts)if(!by[q[3]].some(o=>Math.hypot(o[0]-q[0],o[2]-q[2])<9.5))by[q[3]].push(q);
 const M=new THREE.Matrix4(),Q=new THREE.Quaternion(),UP=bxV(0,1,0),one=bxV(1,1,1),inst=(geo,mat,arr,fn,shadow=true)=>{if(!arr.length)return null;const im=new THREE.InstancedMesh(geo,mat,arr.length);arr.forEach((a,i)=>fn(a,i,im));im.castShadow=shadow;im.receiveShadow=true;g0.add(im);return im};
 // TOWN houses: body (window texture, wall colour per instance) + pitched roof + door; 8-11 m wide, 7-12 m tall, facing the road
 const winT=FS.winT||(FS.winT=BX_tex(64,64,(c,w,h)=>{c.fillStyle='#fff';c.fillRect(0,0,w,h);c.fillStyle='#29425e';for(const x of[10,38])for(const y of[10,38]){c.fillRect(x,y,16,18)}c.fillStyle='#fff';for(const x of[10,38])for(const y of[10,38]){c.fillRect(x+7,y,2,18);c.fillRect(x,y+8,16,2)}}));
 winT.wrapS=winT.wrapT=THREE.RepeatWrapping;const HC=['#f2cd37','#c91a09','#0a8fd0','#f4f4f4','#fe8a18','#a0bcac','#e4cd9e'].map(bxCol),RC=['#c91a09','#1b1b1b','#0055bf','#237841'].map(bxCol);
 const T=by.town.map(([x,h,z,,a,r])=>({x,h,z,a,w:8+r*3,d:8,ht:7+Math.round(r*5)*1.2,c:Math.floor(r*97)}));
 inst(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({map:winT,roughness:.6}),T,(t,i,im)=>{Q.setFromAxisAngle(UP,t.a);M.compose(bxV(t.x,t.h+t.ht/2,t.z),Q,bxV(t.w,t.ht,t.d));im.setMatrixAt(i,M);im.setColorAt(i,HC[t.c%HC.length])});
 const roof=new THREE.CylinderGeometry(.5,.5,1,3);roof.rotateZ(Math.PI/2);roof.scale(1,.9,1.2);
 inst(roof,fsStd('#fff'),T,(t,i,im)=>{Q.setFromAxisAngle(UP,t.a);M.compose(bxV(t.x,t.h+t.ht+1.6,t.z),Q,bxV(t.w+.8,4.2,t.d+.6));im.setMatrixAt(i,M);im.setColorAt(i,RC[t.c%RC.length])});
 for(const t of T)FS.col.push({c:[t.x,t.z],r:Math.max(t.w,t.d)/2+.5});
 // CANYON hoodoos: 2-4 stacked slabs, red/orange/tan, 4-8 m wide, 6-16 m tall (solid)
 const RK=['#b5532a','#d9773a','#c4662b','#e2a25a'].map(bxCol),H=[];for(const[x,h,z,,a,r]of by.canyon){if(r<.25){H.push({cac:1,x,h,z});continue}const n=2+Math.floor(r*3);let y=h,w=5+r*4;for(let k=0;k<n;k++){const hh=2.4+((r*7+k)%1)*3;H.push({x,z,y:y+hh/2,w:w,hh,a:a+k*.4,c:k});y+=hh;w*=.78}FS.col.push({c:[x,z],r:3+r*2})}
 inst(new THREE.BoxGeometry(1,1,1),fsStd('#fff',{roughness:.85}),H.filter(o=>!o.cac),(o,i,im)=>{Q.setFromAxisAngle(UP,o.a);M.compose(bxV(o.x,o.y,o.z),Q,bxV(o.w,o.hh,o.w*.8));im.setMatrixAt(i,M);im.setColorAt(i,RK[o.c%RK.length])});
 for(const o of H)if(o.cac)FS_cactus(g0,o.x,o.z,.8+((o.x*13)%5)/10);
 // FARM: white fence runs parallel to the road, round hay bales, orchard trees (trunk + chunky canopy)
 const fence=[],hay=[],tree=[];for(const[x,h,z,,a,r]of by.farm){if(r<.4)fence.push([x,h,z,a]);else if(r<.6)hay.push([x,h,z,a]);else tree.push([x,h,z,r])}
 inst(new THREE.BoxGeometry(14,.35,.3),fsStd('#f4f4f4'),fence.flatMap(f=>[[...f,.7],[...f,1.4]]),([x,h,z,a,y],i,im)=>{Q.setFromAxisAngle(UP,a+Math.PI/2);M.compose(bxV(x,h+y,z),Q,one);im.setMatrixAt(i,M)});
 inst(new THREE.BoxGeometry(.4,1.8,.4),fsStd('#f4f4f4'),fence.flatMap(f=>[-6.6,0,6.6].map(o=>[f[0]+Math.cos(-f[3])*0+Math.sin(f[3]+Math.PI/2)*o,f[1],f[2]+Math.cos(f[3]+Math.PI/2)*o])),([x,h,z],i,im)=>{M.makeTranslation(x,h+.9,z);im.setMatrixAt(i,M)});
 const hg=new THREE.CylinderGeometry(1.3,1.3,2,14);hg.rotateZ(Math.PI/2);inst(hg,fsStd('#e8c25a'),hay,([x,h,z,a],i,im)=>{Q.setFromAxisAngle(UP,a);M.compose(bxV(x,h+1.3,z),Q,one);im.setMatrixAt(i,M)});
 inst(new THREE.CylinderGeometry(.5,.6,3,8),fsStd('#7c4a1e'),tree,([x,h,z],i,im)=>{M.makeTranslation(x,h+1.5,z);im.setMatrixAt(i,M)});
 const TC=['#2f8f3c','#4b9f4a','#237841','#7fc241'].map(bxCol);inst(new THREE.DodecahedronGeometry(3,0),fsStd('#fff',{flatShading:true}),tree,([x,h,z,r],i,im)=>{M.compose(bxV(x,h+5,z),Q.setFromAxisAngle(UP,r*6),bxV(1,.85,1));im.setMatrixAt(i,M);im.setColorAt(i,TC[i%4])});
 for(const t of tree)FS.col.push({c:[t[0],t[2]],r:1});
 // LAGOON: beach umbrellas (striped cone on a pole) and palms
 const umb=[];for(const[x,h,z,,a,r]of by.lagoon){if(r<.55)umb.push([x,h,z,r]);else FS_palm(g0,x,z)}
 inst(new THREE.CylinderGeometry(.08,.08,3,6),fsStd('#d9d9d9'),umb,([x,h,z],i,im)=>{M.makeTranslation(x,h+1.5,z);im.setMatrixAt(i,M)});
 const UC=['#c91a09','#0a8fd0','#f2cd37','#fe8a18'].map(bxCol);inst(new THREE.ConeGeometry(2.2,1,10),fsStd('#fff'),umb,([x,h,z],i,im)=>{M.makeTranslation(x,h+3.2,z);im.setMatrixAt(i,M);im.setColorAt(i,UC[i%4])});
 return {town:T.length,canyon:by.canyon.length,farm:by.farm.length,lagoon:by.lagoon.length}}
// brick clouds (2K: a deep blue sky with chunky brick clouds), lower and nearer than the builder's 9
function FS_clouds(g0){const cm=fsStd('#ffffff',{roughness:.9});let s=5;const r=()=>(s=(s*16807)%2147483647)/2147483647;for(let i=0;i<18;i++){const g=new THREE.Group(),n=3+Math.floor(r()*3);for(let j=0;j<n;j++){const b=new THREE.Mesh(new THREE.BoxGeometry(10+r()*14,4+r()*3,8+r()*6),cm);b.position.set(j*8-n*4,(j%2)*3,(r()-.5)*6);g.add(b)}
 const a=i/18*Math.PI*2+r()*.3,R=240+r()*160;g.position.set(Math.cos(a)*R,70+r()*55,Math.sin(a)*R);g.lookAt(0,g.position.y,0);g0.add(g)}}
// ---------------------------------------------------------------- biome ground colours (after BX_terrMesh)
function FS_paint(){const g=BX.tg;if(!g)return;const n=BXTN,c=g.attributes.color.array,nm=g.attributes.normal.array,tc=new THREE.Color(),P={};for(const k in FS_PAL)P[k]=FS_PAL[k].map(bxCol);
 const RR=bxCol('#b5532a'),RO=bxCol('#d9773a'),GR=bxCol('#8d7b68'),WH=bxCol('#f2cd37'),PL=bxCol('#a0702e'),YG=bxCol('#a6d13a'),SA=bxCol('#f0dc9a');
 for(let k=0;k<n*n;k++){const x=BXO+(k%n)*BXR,z=BXO+Math.floor(k/n)*BXR,h=BX.th[k],ny=nm[k*3+1],Z=FS_zone(x,z),C=P[Z],v=((k*7919)%13)/13;tc.copy(C[0]).lerp(C[1],v*.6);
  if(Z==='canyon'){if(ny<.8)tc.copy(Math.floor(h/2.4)%2?RR:RO);else if(h>9)tc.lerp(RO,.25)}
  else if(ny<.72)tc.copy(GR);else if(h<1.1)tc.copy(SA);
  else if(Z==='farm'&&x<20){const st=Math.floor((x+400)/14)%4;if(st===1)tc.lerp(WH,.8);else if(st===3)tc.lerp(PL,.7);else if(st===2)tc.lerp(YG,.5)}
  c[k*3]=tc.r;c[k*3+1]=tc.g;c[k*3+2]=tc.b}g.attributes.color.needsUpdate=true}
// ---------------------------------------------------------------- build all set pieces for the GRAND TOUR
// the loaded track is the GRAND TOUR (its world and its exact piece count; an edited copy keeps the dressing until pieces change)
function FS_is(){const L=FS_pcs();return BX.world==='gp'&&L.length===FS_N&&L[0].type==='sf'}
function FS_clear(){if(FS.g){BX.sc.remove(FS.g);FS.g.traverse(o=>{if(o.geometry)o.geometry.dispose()})}Object.assign(FS,{g:null,walls:[],studs:[],col:[],spin:[],studIm:null,on:false,rail:null})}
function FS_build(){FS_clear();if(!FS_ON||!FS_is())return;const g=FS.g=new THREE.Group();BX.sc.add(g);FS.on=true;const L=FS_pcs();
 for(const[k,t,x]of FS_BEATS){const s=FS_at(k,.5);if(!s)continue;const side=FS_side(s);
  if(t==='start'){FS_gantry(g,FS_at(k,.6));FS_stand(g,FS_at(k+2,.5),1,34);FS_stand(g,FS_at(k+2,.5),-1,34,'MADE WITH ❤ BY ALEX')}
  else if(t==='smash')FS_wall(g,s,k===144?'crates':'brick');
  else if(t==='studs')FS.studs.push(...FS_studLine(k,0).map(p=>({p,got:false})));
  else if(t==='gate')FS_gate(g,FS_at(k,k===99||k===118?.92:.5),x);
  else if(t==='crowd')FS_stand(g,s,side,30,x);
  else if(t==='buoys')FS_buoys(g,k-1,k)}
 FS_studMesh(g);
 FS_barn(g,109,111);
 // the loop is a bright LEGO blue tube with orange edges (its default dark body read as a black blob from the chase cam)
 for(const pc of L)if(pc.type==='lp'&&pc.meshes[1]){pc.meshes[1].material=FS.loopM||(FS.loopM=fsStd('#0a8fd0',{emissive:0x0a3f70,emissiveIntensity:.35,side:THREE.DoubleSide}))}FS.chevN=FS_chev(g);FS.railN=FS_barrier(g);FS_arrows(g);
 FS_windmill(g,0,-64);FS_lighthouse(g,-205,52);
 for(const[x,z,s]of[[100,-150,1.3],[150,-110,1],[210,-10,1.2],[90,40,1],[190,90,1.4],[60,-60,.9],[230,-140,1.1],[120,-70,.8]])if(!BX.samp.some(q=>Math.hypot(q.s.p.x-x,q.s.p.z-z)<BX_HW+6))FS_cactus(g,x,z,s);
 for(const[x,z]of[[-178,-20],[-195,-5],[-172,104],[-212,96],[-128,-40],[-212,20],[-190,-40],[-176,-62],[-120,130]])if(!BX.samp.some(q=>Math.hypot(q.s.p.x-x,q.s.p.z-z)<BX_HW+4))FS_palm(g,x,z);
 FS.biomeN=FS_biomeDress(g);FS_clouds(g);
 FS_balloon(g,-40,70,-60,'#c91a09','#ffd21a');FS_balloon(g,120,85,60,'#0055bf','#f4f4f4');FS_balloon(g,-130,78,150,'#237841','#ffd21a');
 // real LEGO sets: town houses behind the stadium, a farmhouse + cottage at the farm, a hamburger stand + cafe on the beach, boats in the cove
 for(const[id,x,z,a,w]of[['w6372',-96,-128,Math.PI],['w6365',-60,-126,Math.PI],['w4956',6,128,0],['w6374',12,96,Math.PI/2],['w6683',-188,-74,Math.PI/2],['w6402',-196,-100,Math.PI/2],['w6349',-70,-40,Math.PI/2],['w4010',-206,26,.6,1],['w1632',-196,82,2.2,1]])
  if(!BX.samp.some(q=>Math.hypot(q.s.p.x-x,q.s.p.z-z)<BX_HW+12))FS_ld(g,id,x,z,a,w);
 FS.dressN=g.children.length}
// per frame (drive): walls, studs, spinning things, crowd bounce
function FS_tick(dt){if(!FS.on)return;const t=BX.t||0;for(const s of FS.spin){if(s.o&&s.ax)s.o.rotation[s.ax]+=s.sp*dt;if(s.drift){const[x,y,z,ph]=s.drift;s.o.position.set(x+Math.sin(t*.05+ph)*30,y+Math.sin(t*.4+ph)*2,z+Math.cos(t*.04+ph)*30)}}
 FS_wallAnim(dt);if((BX.rf||0)%2===0)FS_studDraw()}
// ---------------------------------------------------------------- hooks into the builder
BX_dress=(f=>function(){const r=f.apply(this,arguments);try{FS_build()}catch(e){console.error('FS_build',e)}return r})(BX_dress);
BX_terrMesh=(f=>function(){const r=f.apply(this,arguments);try{if(BX.world==='gp')FS_paint()}catch(e){console.error(e)}return r})(BX_terrMesh);
BX_fxStep=(f=>function(dt){const r=f.apply(this,arguments);try{FS_tick(dt)}catch(e){console.error(e)}return r})(BX_fxStep);
// set-piece colliders (stands, gantry legs, windmill, barn walls, cacti, palms, LEGO sets): circle / box push-out, glancing hits slide
// LOOP RIDE (2K loops hold you on): once on the loop the car rides its centre line at >= 18 m/s and leaves it straight; the free physics threw a slightly
// crooked car 40 m off the top (noisy-bot races: 2 of 6 lost the race there)
function FS_loopRide(dt){const V=BX.v,L=FS.loop,S=L.pc.S[0];L.d+=L.sp*dt;let k=1;while(k<S.length-1&&S[k].d<L.d)k++;const a=S[k-1],b=S[k],t=bxCl((L.d-a.d)/Math.max(.01,b.d-a.d),0,1);
 V.p.copy(a.p).lerp(b.p,t);V.U.copy(a.U).lerp(b.U,t).normalize();V.F.copy(a.F).lerp(b.F,t).normalize();V.p.addScaledVector(V.U,.55);V.v.copy(V.F).multiplyScalar(L.sp);V.g=true;V.air=0;V.on=L.pc;BX.m.t+=dt;BX.m.dist+=L.sp*dt;
 BX_course(L.pc);{const i=FS_pcs().indexOf(L.pc);if(i>=0&&FS.lapT[i]==null)FS.lapT[i]=BX.m.t-(BX.m.lap0||0)}if(L.d>=S[S.length-1].d){V.U.set(0,1,0);V.F.setY(0).normalize();V.v.copy(V.F).multiplyScalar(L.sp);FS.loop=null;FS.loopOff=.5}}
BX_step=(f=>function(dt,inp){if(FS.on&&FS.loop&&BX.v)return FS_loopRide(dt);if(FS.loopOff>0)FS.loopOff-=dt;const r=f.apply(this,arguments);
 if(FS.on&&BX.v&&!FS.loop&&!(FS.loopOff>0)){const V=BX.v;for(const pc of FS.lps||(FS.lps=FS_pcs().filter(p=>p.type==='lp'))){const S=pc.S[0],e=S[0],dx=V.p.x-e.p.x,dz=V.p.z-e.p.z,fw=dx*e.F.x+dz*e.F.z,lat=Math.abs(dx*e.F.z-dz*e.F.x),vf=(V.v.x*e.F.x+V.v.z*e.F.z)/Math.max(1,V.v.length());
  // on the loop, or arriving at its mouth from the side (cutting the bend before it) moving roughly its way: ride it (its side walls trapped corner-cutters)
  if((V.on===pc&&fw<S[S.length-1].d*.3)||(fw>-3&&fw<10&&lat<16&&vf>.3&&Math.abs(V.p.y-e.p.y)<3)){FS.loop={pc,d:Math.max(0,V.on===pc?fw:0),sp:Math.max(18,V.v.length())};FS.loops=(FS.loops||0)+1;break}}}if(!FS.on||!BX.v)return r;const V=BX.v,push=(nx,nz,d)=>{V.p.x+=nx*d;V.p.z+=nz*d;const vn=V.v.x*nx+V.v.z*nz;if(vn<0){V.v.x-=nx*vn*1.2;V.v.z-=nz*vn*1.2;if(vn<-6)BX.m.bump++}};
 for(const c of FS.col){if(c.c){const dx=V.p.x-c.c[0],dz=V.p.z-c.c[1],d=Math.hypot(dx,dz),R=c.r+1;if(d<R&&d>.01&&V.p.y<BX_h(c.c[0],c.c[1])+14)push(dx/d,dz/d,R-d)}
  else if(c.box){const g=c.box,dx=V.p.x-g.position.x,dz=V.p.z-g.position.z,ca=Math.cos(g.rotation.y),sa=Math.sin(g.rotation.y),lx=dx*ca-dz*sa-c.cx,lz=dx*sa+dz*ca,ox=c.w/2+1.1-Math.abs(lx),oz=c.d/2+1.1-Math.abs(lz);
   if(ox>0&&oz>0&&V.p.y<g.position.y+8){if(ox<oz){const s=Math.sign(lx);push(s*ca,-s*sa,ox)}else{const s=Math.sign(lz);push(s*sa,s*ca,oz)}}}}
 FS_wallHit();FS_studStep();FS_railPush();
 // no progress for 2 s with the gas on (pinned against a loop side, a rock or a stand) = respawn on the road (fair respawn below): the old rules only caught
 // speed < 2 m/s, but a car pushing into a wall keeps its speed and never moves
 {const g=FS.prog||(FS.prog={p:V.p.clone(),t:0,c:null}),rc=BX.race&&BX.race.prog!=null?BX.race.prog:null;g.t+=dt;if(g.c==null)g.c=rc; /* in a race: progress along the course (sliding along a wall is not progress) */
  if((rc!=null?rc-(g.c==null?rc:g.c)>3:V.p.distanceTo(g.p)>2.5)||!(inp&&inp.g)||(BX.race&&BX.race.cd>0)){g.p.copy(V.p);g.c=rc;g.t=0}else if(g.t>(rc!=null?2.5:2)){g.t=0;g.c=null;FS.stuckN=(FS.stuckN||0)+1;BX_respawn('stuck')}}
 // the beat timeline: first time on each piece this lap (for the lap tests)
 if(V.on){const i=FS_pcs().indexOf(V.on);if(i>=0&&FS.lapT[i]==null)FS.lapT[i]=BX.m.t-(BX.m.lap0||0)}return r})(BX_step);
FS.lapT={};
// laps: walls and studs come back each lap; the timeline restarts
BX_course=(f=>function(pc){const l=BX.m&&BX.m.laps,r=f.apply(this,arguments);if(FS.on&&BX.m&&BX.m.laps!==l){FS_wallReset();FS.studs.forEach(s=>s.got=false);FS.lapTs=(FS.lapTs||[]).concat([FS.lapT]);FS.lapT={0:0}}return r})(BX_course);
BX_driveStart=(f=>function(){const r=f.apply(this,arguments);if(FS.on){FS_wallReset();FS.studs.forEach(s=>s.got=false);FS.got=0;FS.smash=0;FS.smashW=[];FS.good=null;FS.loop=null;FS.prog=null;FS.lps=null;FS.respT=null;FS.mainPts=null;FS.lapT={};FS.lapTs=[]}return r})(BX_driveStart);
// respawn (fair): back on the road where you were ~1.5 s ago at 60 % of that speed, not at the last checkpoint (a whole sector back)
BX_respawn=(f=>function(why){const V=BX.v;if(FS.on&&V&&(V.hist&&V.hist.length||FS.good)){const t=BX.m.t;let h=V.hist&&V.hist.length?[...V.hist].reverse().find(q=>t-q.t>=1.2)||V.hist[0]:FS.good;
  // a second respawn within 6 s (the spot itself is blocked): 25 m further along the main road instead
  if(FS.respT!=null&&t-FS.respT<6&&h){const P=FS.mainPts||(FS.mainPts=BX_lap([1,1]).map(o=>o.s));let bi=0,bd=1e9;P.forEach((q,i)=>{const d=q.p.distanceToSquared(h.p);if(d<bd){bd=d;bi=i}});let d=0,j=bi;while(d<25){const n=(j+1)%P.length;d+=P[j].p.distanceTo(P[n].p);j=n}h={p:P[j].p.clone().addScaledVector(P[j].U,.4),F:P[j].F.clone(),sp:h.sp}}
  FS.respT=t;FS.good=h;FS.loop=null;V.lastCp={p:h.p.clone(),F:h.F.clone()};const r=f.apply(this,arguments);V.v.copy(h.F).multiplyScalar(Math.max(8,h.sp*.6));V.lastCp=null;FS.resp=(FS.resp||0)+1;return r}return f.apply(this,arguments)})(BX_respawn);
// HUD: stud count next to the speed line
BX_hud=(f=>function(){const r=f.apply(this,arguments);if(FS.on){const H=$('#bxHud');if(H)H.textContent+=` · ● ${FS.got}`}return r})(BX_hud);
// the GRAND TOUR is the first built-in track (race menu + ★ list); rivals race fair on it
if(FS_ON){const old={...BX_DEMOS};for(const k in old)delete BX_DEMOS[k];BX_DEMOS[FS_NAME]={log:FS_LOG()};Object.assign(BX_DEMOS,old)}
BX_raceSetup=(f=>function(){const r=f.apply(this,arguments);if(BX.race&&FS.on){BX.race.fair=1;BX.race.rv.forEach((q,k)=>q.base=FS_RIVAL[k])}return r})(BX_raceSetup);
const FS_RIVAL=[41.6,39.5,37.3,35.6,33.9]; // m/s cruise of the 5 rivals on the main road (tuned with FS_raceSim: an average bot finishes 1st-3rd)
// ---------------------------------------------------------------- acceptance tests (checklist ver 'trk5', 📍 GO = BX_test(id) opens GRAND TOUR; the check runs the same spawn in fast time)
// lap timeline: the AI drives one lap with the real physics (BX_sim); each beat gets the time the car first reached its piece
function FS_timeline(ch){const r=BX_sim(ch),T=(FS.lapTs&&FS.lapTs[0])||FS.lapT,lap=r.lap||r.t,B=[];for(const[k,t]of FS_BEATS)if(T[k]!=null)B.push([T[k],t,k]);B.sort((a,b)=>a[0]-b[0]);
 let gap=0,at='';for(let i=0;i<B.length;i++){const a=B[i][0],b=i+1<B.length?B[i+1][0]:lap+B[0][0],g=b-a;if(g>gap){gap=g;at=B[i][1]+'#'+B[i][2]+'→'+(B[i+1]||B[0])[1]}}
 return{r,lap:+lap.toFixed(1),beats:B,types:new Set(B.map(b=>b[1])),gap:+gap.toFixed(1),at,smash:FS.smash||0,studs:FS.got||0}}
function FS_biomes(ch){const S=BX_lap(ch),D={};let tot=0;for(let i=1;i<S.length;i++){const a=S[i].s.p,d=a.distanceTo(S[i-1].s.p);if(d>30)continue;const z=FS_zone(a.x,a.z);D[z]=(D[z]||0)+d;tot+=d}for(const k in D)D[k]=+(D[k]/tot).toFixed(2);return D}
// an AVERAGE player bot races 2 laps against the 5 rivals in fast time: it steers late and noisily, lifts off now and then, boosts only half the time it could,
// takes a shortcut only on some laps; rivals run the real race code (BX_raceTick) on the main road
function FS_raceSim(seed=1,maxT=420,clean=0){let s=seed*9301+49297;const rnd=()=>((s=(s*16807)%2147483647)/2147483647);try{BX_raceClear()}catch(e){}BX_driveStart();BX_raceSetup();const r=BX.race,V=BX.v,m=BX.m,dt=1/120;
 const routes=[[1,1],[0,1],[1,0],[0,0]],W0=BX_lap(routes[seed%4]).map(o=>o.s.p),st={i:0},K=clean?{nz:0,lift:0,brk:0,bst:0}:FS.botK||{nz:.5,lift:.45,brk:.14,bst:.12};let nz=0,lift=0,brk=0,slow=0,slowMax=0,pos2=null,resT=null;
 for(let i=0;i<maxT*120&&!r.fin;i++){const a=BX_autoInp(W0,st);nz+=(rnd()-.5)*.6-nz*.02;if(lift>0)lift-=dt;else if(rnd()<dt*K.lift)lift=.3+rnd()*.4;if(brk>0)brk-=dt;else if(rnd()<dt*K.brk)brk=.25;
  const n=W0.length,off=W0[st.i].distanceTo(V.p)>14;if(off){const tw=W0[(st.i+3)%n],dx=tw.x-V.p.x,dz=tw.z-V.p.z,S=bxV().crossVectors(V.F,V.U),an=Math.atan2(S.x*dx+S.z*dz,V.F.x*dx+V.F.z*dz);a.s=bxCl(an*3,-1,1)} // off the road: head back to the nearest road point (a person does), not at a point behind a wall
  const inp={s:bxCl(a.s+nz*K.nz,-1,1),g:lift>0||brk>0?0:1,b:a.b||brk>0?1:0};if((V.boostE||0)>=.34&&rnd()<dt*K.bst)BX_boostGo();BX.inp=inp;BX_step(dt,inp);if(i%4===0)BX_farCheck(dt*4);
  if(FS.dbg&&i%(FS.dbg>1?30:240)===0)(FS.tr=FS.tr||[]).push([+m.t.toFixed(0),Math.round(V.p.x),Math.round(V.p.y),Math.round(V.p.z),st.i,V.on?FS_pcs().indexOf(V.on):-1,r.pos]);const sp=V.v.length();slow=sp<2&&r.cd<=0?slow+dt:0;slowMax=Math.max(slowMax,slow);if(m.laps>=1&&pos2==null)pos2=r.pos}
 const res={place:r.place||null,pos2,t:+(r.fin||r.t).toFixed(1),laps:m.laps,lapT:m.lapT,resp:m.resp,slowMax:+slowMax.toFixed(2),route:routes[seed%4].join('')};const e=$('#bxRes');if(e)e.remove();BX_driveStop();return res}
// respawn fairness: mid-race the car is thrown off the course; back on the road within 2 s, at most 1 place lost
function FS_respSim(){try{BX_raceClear()}catch(e){}BX_driveStart();BX_raceSetup();const r=BX.race,V=BX.v,m=BX.m,dt=1/120,W=BX_lap([1,1]).map(o=>o.s.p),st={i:0};let p0=null,t0=null,back=null,pMax=0;
 for(let i=0;i<120*80&&back==null;i++){const inp=BX_autoInp(W,st);BX.inp=inp;BX_step(dt,inp);if(i%4===0)BX_farCheck(dt*4);
  if(t0==null&&r.cd<=0&&m.t>28){p0=r.pos;t0=m.t;BX_respawn('test')}if(t0!=null){pMax=Math.max(pMax,r.pos);if(V.g&&V.on&&m.t-t0>.05&&back==null)back=m.t-t0;}}
 for(let i=0;i<120*3;i++){const inp=BX_autoInp(W,st);BX_step(dt,inp);if(i%4===0)BX_farCheck(dt*4);pMax=Math.max(pMax,r.pos)}const res={back:back==null?99:+back.toFixed(2),p0,pMax,lost:pMax-p0};BX_driveStop();return res}
const fsLog=()=>BX_DEMOS[FS_NAME]?BX_DEMOS[FS_NAME].log:[['w','gp']];
Object.assign(BX_TESTS,{
 'fs-beats':{n:'GRAND TOUR: BEATS',log:fsLog,drive:1,auto:1,chk:()=>{const A=FS_timeline([0,0]),B=FS_timeline([1,1]);
  return bxRes([['beat types',A.types.size>=8&&B.types.size>=8,`${A.types.size} / ${B.types.size} different beats per lap (shortcuts / main road): ${[...A.types].join(' ')}`],
   ['lap time',A.lap>=45&&B.lap<=95,`AI lap ${A.lap} s / ${B.lap} s`],['smash + studs',A.smash>=3&&A.studs>=20,`${A.smash} walls smashed, ${A.studs} studs on the shortcut lap`]])}},
 'fs-gap':{n:'GRAND TOUR: NO DULL STRETCH',log:fsLog,drive:1,auto:1,chk:()=>{const R=[[0,0],[1,1],[0,1],[1,0]].map(c=>[c,FS_timeline(c)]);
  return bxRes(R.map(([c,A])=>[c.join(''),A.gap<=6,`route ${c.join('')}: longest stretch without a beat ${A.gap} s (${A.at})`]))}},
 'fs-biomes':{n:'GRAND TOUR: BIOMES',log:fsLog,chk:()=>{const D=FS_biomes([1,1]),z=Object.keys(D).filter(k=>D[k]>=.1);
  return bxRes([['zones',z.length>=3,`${z.length} biome zones over 10 % of the lap: ${Object.entries(D).map(([k,v])=>k+' '+Math.round(v*100)+'%').join(', ')}`]])}},
 'fs-bot':{n:'GRAND TOUR: FAIR RACE',log:fsLog,drive:1,race:1,chk:()=>{const R=[1,2,3,4,5,6].map(s=>FS_raceSim(s)),avg=R.reduce((a,r)=>a+(r.place||6),0)/R.length,C=FS_raceSim(4,420,1);
  return bxRes([['average bot',avg<=3&&R.filter(r=>r.place&&r.place<=3).length>=4,`average bot places ${R.map(r=>r.place+(r.route?'('+r.route+')':'')).join(' ')} · mean ${avg.toFixed(1)} · after lap 1: ${R.map(r=>r.pos2).join(' ')}`],
   ['clean driver',C.place===1&&C.resp===0,`a clean driver (full gas, never lifts) wins: place ${C.place}, respawns ${C.resp}, laps ${C.lapT.join('/')} s`],['no stuck',R.every(r=>r.slowMax<=2&&r.resp<=1),`stuck max ${Math.max(...R.map(r=>r.slowMax))} s, respawns ${R.map(r=>r.resp).join('/')} (≤ 1 per race), race ${R.map(r=>r.t+' s').join('/')}`]])}},
 'fs-ai':{n:'GRAND TOUR: AI LAP',log:fsLog,drive:1,auto:1,chk:()=>{const R=[[0,0],[1,1]].map(c=>BX_sim(c));
  return bxRes(R.map((r,i)=>['route '+i,r.laps>=1&&r.slowMax<=2&&r.resp===0,`lap ${r.laps?r.lap.toFixed(1)+' s':'NOT done'}, stuck max ${r.slowMax} s, respawns ${r.resp}${r.why?' '+r.why:''}, ${r.air1} jumps ≥ 1 s`]))}},
 'fs-resp':{n:'GRAND TOUR: RESPAWN',log:fsLog,drive:1,race:1,chk:()=>{const r=FS_respSim();return bxRes([['respawn',r.back<=2&&r.lost<=1,`back on the road in ${r.back} s, place ${r.p0} → worst ${r.pMax} (lost ${r.lost})`]])}},
 'fs-btn':{n:'GRAND TOUR: RACE BUTTONS',log:fsLog,drive:1,race:1,chk:()=>{const c=BX_btnChk(BX_DRIVE_BTNS);return bxRes([['race buttons',BX.mode==='drive'&&!c.bad.length,c.msg]])}},
 'fs-life':{n:'GRAND TOUR: LIVELY',log:fsLog,chk:()=>{const st=FS.g?FS.g.children.length:0,stands=FS.col.filter(c=>c.box).length;
  return bxRes([['set pieces',FS.on&&FS.walls.length>=5&&FS.studs.length>=80&&stands>=4&&(FS.chevN||0)>=20,`${FS.walls.length} breakable walls, ${FS.studs.length} studs, ${stands} grandstands, ${FS.chevN||0} chevron boards, ${FS.ld||0} LEGO sets loaded, ${st} set-piece objects`]])}}});
Object.assign(window.__bx,{fs:FS,fsTimeline:FS_timeline,fsRace:FS_raceSim,fsResp:FS_respSim,fsBiomes:FS_biomes});
Object.assign(window.__bx,{fsPcs:FS_pcs,autoInp:(W,st)=>BX_autoInp(W,st),step:(dt,inp)=>BX_step(dt,inp),far:dt=>BX_farCheck(dt),cam:dt=>{BX.hold=0;const V=BX.v;if(BX.car&&V){BX.car.position.copy(V.p);const S=bxV().crossVectors(V.F,V.U).normalize();BX.car.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(S.negate(),V.U,V.F));BX.shM.visible=false}BX_camDrive(dt);BX.hold=1}}); // shot pass (tools/fs/tShots.js): pose the car like BX_tick, settle the chase camera
