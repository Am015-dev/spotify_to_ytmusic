// ===== BC (bigcars): bigger builds + 4 big real-LEGO templates; physics, collider, camera and garage view follow the car's real size =====
// Builder: length grid GB_Z0..GB_Z1 = 46 studs (was 18), width unchanged (18), height cap GB_CAP 72 plates (was 48), build limit GB_MAX 250 (was 120): 92_garage_builder.js.
// Templates (docs/research/BIGCARS.md): Sightseeing Bus (60407), Box Truck (60440 tractor), Stretch Limo (60102), Monster Truck (60180).
// City sets are 6-wide; the game is Speed-Champions 8-wide, so their stud sizes are scaled ×4/3. Stud 8 mm, plate 3.2, brick 9.6 (GB_U .6 / GB_PH .24 = 0.4).
// Size → driving (player only, roam): every number is the default car's when the car is not bigger than the default (×1.12 in L or W, ×1.25 in H).
//  collider: centre radius ∝ width, nose/tail circles move out with length, extra circles fill long bodies (SC_hit); traffic OBB (OB_HW/OB_HL); NPC push (CR_PLH)
//  steering: CR_WB = real wheelbase ratio × 2.7 (bicycle model → wider turning circle); mass m = volume ratio → acc × m^-.3, top × m^-.05
//  camera: chase distances/heights × (size ratio)^.65 (SC_K.cam + SC_rcam), CR_minBack too. Tyre contact: CR_carPose already reads the real wheel meshes.
// ---- parts: glass panes G<w>x<d>[h<plates>] (default 6 plates = 2 bricks) and the monster-truck balloon tyre wMT (Ø 8 studs, orange rims)
CR_WH.wMT={r:2.4,w:1.8,rim:1.25};GB_PC.wMT={n:'Balloon tyre',w:3,d:8,h:20,ic:'◎',cat:'Vehicle'};
GB_PC.G1x4={n:'Window 1×4',w:1,d:4,h:6,ic:'▯',cat:'Vehicle'};GB_PC.G1x2={n:'Window 1×2',w:1,d:2,h:6,ic:'▯',cat:'Vehicle'};
CR_reg=(f=>function(t){if(f(t))return 1;const m=/^G(\d+)x(\d+)(?:h(\d+))?$/.exec(t);if(!m)return 0;GB_PC[t]={n:t,w:+m[1],d:+m[2],h:+(m[3]||6),hide:1,ic:'▯'};return 1})(CR_reg);
GB_piece=(f=>function(t,c,M,L){if(!/^G\d/.test(t))return f(t,c,M,L);CR_reg(t);const P=GB_PC[t],W=P.w*GB_U,D=P.d*GB_U,H=P.h*GB_PH,GL=CR_G||M,tx=P.w===1?.09:W/2-.01,tz=P.d===1?.09:D/2-.01;
 GL.push(CR_bb(-tx,tx,.02,H-.02,-tz,tz,'#4a6a82',.03));M.push(CR_bb(-W/2+.01,W/2-.01,0,.03,-D/2+.01,D/2-.01,CR_K))})(GB_piece);
CR_wheel=(f=>function(t){if(t!=='wMT')return f(t);const k='bcMT'+(CR_LO?'lo':'');if(CR_wgeo[k])return CR_wgeo[k];const g=f(t).clone(),C=g.attributes.color,T=new THREE.Color('#fe8a18');
 for(let i=0;i<C.count;i++){const r=C.getX(i),gg=C.getY(i),b=C.getZ(i);if(r>.35&&Math.abs(r-gg)<.08&&Math.abs(gg-b)<.1)C.setXYZ(i,T.r,T.g,T.b)}C.needsUpdate=true;return CR_wgeo[k]=g})(CR_wheel);
// ---- templates: [type, x, z, rot, colour, y(plates)]; x = min cell (8-wide body = -4..3), z: nose at -z
function BC_kit(){const A=[],add=(t,x,z,r,c,y)=>{CR_reg(t);A.push([t,x,z,r,c,y])},sym=(t,x,z,r,c,y)=>{CR_reg(t);const fw=(r%2?GB_PC[t].d:GB_PC[t].w);add(t,x,z,r,c,y);if(x!==-x-fw)add(t,-x-fw,z,(4-r)%4,c,y)},
 wy=w=>(CR_WH[w].r-.72-GB_PC[w].h*GB_PH/2)/GB_PH;return{A,add,sym,wy}}
const BC_C={K:CR_K,W:'#f4f4f4',R:'#d01712',Y:'#fac80a',G:'#a0a5a9',B:'#0055bf',O:'#fe8a18',CH:'#d8dde4',DK:'#1b2a34'};
// Sightseeing bus after 60407: open-top double-decker, red with a black window band and a yellow/black stripe, 2 axles. 10 wide × 36 long, ~46 plates tall.
function BC_bus(){const{A,add,sym,wy}=BC_kit(),{K,R,Y,W,G,DK}=BC_C;
 add('T10x36',-5,-18,0,K,0);for(const z of[-15,6]){sym('arch',-5,z,0,R,0);sym('wL',-5,z,0,K,wy('wL'));sym('P1x4',-5,z,0,R,6)}
 // lower deck: skirt (2 bricks) between the arches, yellow stripe, glass band, black belt
 for(const[z,n]of[[-17,2],[-11,17],[10,8]]){sym('B1x'+n,-5,z,0,R,1);sym('B1x'+n,-5,z,0,R,4)}
 add('B10x1',-5,-18,0,R,1);add('B8x1',-4,-18,0,K,4);sym('hl',-5,-18,0,W,4);add('bump',-4,-19,0,K,2);
 sym('T1x35',-5,-17,0,Y,7);add('T10x1',-5,-18,0,Y,7);sym('P1x35',-5,-17,0,R,8);add('P10x1',-5,-18,0,R,8);
 add('G10x1',-5,-18,0,0,9);for(const[z,n]of[[-17,8],[-8,12],[5,12]])sym('G1x'+n,-5,z,0,0,9);sym('B1x1',-5,-9,0,DK,9);sym('B1x1',-5,4,0,DK,9);sym('B1x1',-5,17,0,R,9);
 sym('B1x1',-5,-9,0,DK,12);sym('B1x1',-5,4,0,DK,12);sym('B1x1',-5,17,0,R,12);
 add('B8x1',-4,17,0,R,1);sym('tl',-4,17,2,R,4);add('B6x1',-3,17,0,R,4);add('T8x1',-4,17,0,Y,7);add('P8x1',-4,17,0,R,8);add('G8x1',-4,17,0,0,9);
 add('drvL',-4,-16,0,R,1);
 // deck floor band + yellow/black stripe
 sym('B1x35',-5,-17,0,R,15);add('B10x1',-5,-18,0,R,15);add('B8x1',-4,17,0,R,15);sym('T1x35',-5,-17,0,K,18);add('T10x1',-5,-18,0,K,18);add('T8x1',-4,17,0,K,18);
 add('P8x34',-4,-17,0,G,17);
 // open upper deck: glass sides, red top rail, rear wall, rows of seats, destination board
 add('G10x1h5',-5,-18,0,0,19);for(const[z,n]of[[-17,17],[1,16]])sym('G1x'+n,-5,z,0,0,19);sym('B1x1',-5,0,0,R,19);sym('B1x1',-5,0,0,R,22);sym('B1x1',-5,17,0,R,19);sym('B1x1',-5,17,0,R,22);
 add('B8x1',-4,17,0,R,19);add('B8x1',-4,17,0,R,22);sym('P1x35',-5,-17,0,R,25);add('P10x1',-5,-18,0,R,24);add('P8x1',-4,17,0,R,25);
 for(const z of[-12,-7,-2,3,8,13])sym('seat',-4,z,0,DK,18);add('B6x1',-3,-17,0,K,18);add('T6x1',-3,-17,0,Y,21);sym('mir',-6,-17,0,K,10);
 return A}
// Box truck after 60440's tractor: bonneted US cab (tilting bonnet, grey grille, one grey stack, sleeper) + a white box body on one chassis, 3 axles.
function BC_truck(){const{A,add,sym,wy}=BC_kit(),{K,R,Y,W,G,CH,B}=BC_C;
 add('T8x40',-4,-20,0,K,0);for(const z of[-16,6,11]){sym('arch',-5,z,0,z<0?Y:K,0);sym('wL',-5,z,0,K,wy('wL'))}
 // bonnet + grille + fenders
 add('bump',-4,-21,0,CH,1);for(const y of[1,4])add('B4x1',-2,-20,0,G,y);add('grl',-2,-20,1,G,7);add('grl',0,-20,1,G,7);sym('hl',-3,-20,0,W,4);sym('B1x1',-3,-20,0,Y,1);
 add('B6x7',-3,-19,0,Y,1);add('B6x7',-3,-19,0,Y,4);add('C6x7',-3,-19,0,Y,7);sym('C2x3',-5,-19,0,Y,4);sym('B2x3',-5,-19,0,K,1);sym('P2x4',-5,-16,0,Y,6);sym('B2x4',-5,-12,0,K,1);sym('P2x4',-5,-12,0,Y,4);
 add('B6x1',-3,-12,0,Y,1);add('B6x1',-3,-12,0,Y,4);add('T6x1',-3,-12,0,Y,7);
 // cab: lower body, screen + side glass, driver, roof; sleeper behind
 add('B10x7',-5,-11,0,Y,1);add('B10x7',-5,-11,0,Y,4);add('G10x1',-5,-11,0,0,7);sym('G1x5',-5,-10,0,0,7);add('B10x1',-5,-5,0,Y,7);add('B10x1',-5,-5,0,Y,10);add('drvL',-4,-9,0,Y,7);
 add('P10x7',-5,-11,0,Y,13);add('T10x7',-5,-11,0,Y,14);sym('mir',-6,-10,0,K,8);sym('rt',-5,-11,0,BC_C.O,15);
 for(const y of[1,4,7,10,13,16])add('B10x4',-5,-4,0,Y,y);add('C10x4',-5,-4,0,Y,19);add('stack',-5,-5,0,G,15);
 // box: deck, white walls (8 brick rows) with a red band, roof; skirts, tank, mud flaps, lights
 add('P10x20',-5,0,0,K,6);for(let y=7;y<31;y+=3){const c=y===19?R:W;sym('B1x20',-5,0,0,c,y);add('B8x1',-4,0,0,c,y);add('B8x1',-4,19,0,y===19?R:y%2?W:'#e4e6e8',y)}
 add('P10x20',-5,0,0,W,31);add('T10x20',-5,0,0,W,32);add('T2x20',-1,0,0,G,33);
 sym('rb22',-5,1,0,G,1);sym('B1x2',-5,3,0,K,1);sym('B1x1',-5,10,0,K,1);sym('B1x1',-5,10,0,K,4);sym('P1x4',-5,15,0,K,1);add('B8x1',-4,19,0,K,1);sym('tl',-5,19,2,R,4);add('B8x1',-4,19,0,K,4);add('lp',-1,20,2,W,2);
 return A}
// Stretch limo after 60102 (two car chassis end to end, 4 doors, two roof sections, red brake light, orange indicators), built 8-wide × 30.
function BC_limo(){const{A,add,sym,wy}=BC_kit(),{K,W,CH,O,R}=BC_C;
 add('T8x30',-4,-15,0,K,0);for(const z of[-12,8]){sym('arch',-4,z,0,W,0);sym('wL',-4,z,0,K,wy('wL'));sym('P1x4',-4,z,0,W,6)}
 // nose
 sym('hl',-4,-15,0,W,1);sym('B1x1',-3,-15,0,K,1);add('grl',-2,-15,1,K,1);add('grl',0,-15,1,K,1);add('C8x1',-4,-15,0,W,4);add('B8x2',-4,-14,0,W,1);add('C8x2',-4,-14,0,W,4);sym('rt',-4,-15,0,O,6);add('bump',-4,-16,0,CH,1);
 // flanks between/after the arches, sills, interior
 sym('B1x16',-4,-8,0,W,1);sym('B1x16',-4,-8,0,W,4);add('T6x26',-3,-12,0,K,1);add('drvL',-3,-9,0,W,2);
 for(const z of[-3,3])sym('seat',-3,z,0,K,2);
 // glasshouse: screens front/back, side glass with door pillars, two roof sections
 add('ws6',-3,-12,0,W,7);sym('B1x3',-4,-12,0,W,7);sym('B1x1',-4,-9,0,W,7);sym('P1x1',-4,-9,0,W,10);
 for(const[z,n]of[[-8,5],[-2,6],[5,3]])sym('G1x'+n+'h4',-4,z,0,0,7);for(const z of[-3,4])sym('B1x1',-4,z,0,W,7),sym('P1x1',-4,z,0,W,10);sym('B1x1',-4,8,0,W,7);sym('P1x1',-4,8,0,W,10);
 add('ws6',-3,9,2,W,7);sym('B1x3',-4,9,0,W,7);sym('P1x3',-4,9,0,W,10);
 add('P8x10',-4,-10,0,W,11);add('T8x10',-4,-10,0,W,12);add('P8x10',-4,0,0,W,11);add('T8x10',-4,0,0,W,12);add('P8x2',-4,10,0,W,11);add('T2x1',-1,10,0,R,12);
 // rear deck + tail lights + bumper, mirrors
 add('B8x3',-4,12,0,W,1);add('B6x1',-3,14,0,W,4);sym('tl',-4,14,2,W,4);add('B8x2',-4,12,0,W,4);add('T8x3',-4,12,0,W,7);add('bump',-4,15,0,CH,1);sym('mir',-5,-10,0,W,7);
 return A}
// Monster truck after 60180: short blue/white pickup high on Ø 8-stud balloon tyres with orange rims; tyres outside the 8-wide body (14 wide × 24 long).
function BC_monster(){const{A,add,sym,wy}=BC_kit(),{K,W,B,O,G,Y}=BC_C,b=10;
 for(const z of[-11,3])sym('wMT',-7,z,0,K,wy('wMT'));add('T6x20',-3,-10,0,K,b-1);sym('B1x2',-4,-8,0,G,6);sym('B1x2',-4,5,0,G,6);add('P2x16',-1,-8,0,G,8);
 // front: bumper, grille, lamps, bonnet; fenders just above the tyres
 add('P8x1',-4,-12,0,K,b);add('P8x1',-4,-12,0,K,b+1);add('B4x1',-2,-11,0,G,b+1);sym('hl',-4,-11,0,Y,b+1);sym('B1x1',-3,-11,0,K,b+1);
 add('B8x5',-4,-10,0,B,b+1);add('C8x5',-4,-10,0,B,b+4);sym('P3x10',-7,-12,0,B,17);sym('P3x10',-7,2,0,B,17);add('scoop',-1,-8,0,G,b+6);
 // cab: blue lower body, white band, screen + side glass, driver, white roof, roll bar with a light bar
 add('B8x6',-4,-5,0,B,b+1);add('B8x6',-4,-5,0,W,b+4);add('ws6',-3,-5,0,W,b+7);sym('G1x6h5',-4,-5,0,0,b+7);add('B6x1',-3,0,0,B,b+7);add('B6x1',-3,0,0,B,b+10);
 add('P8x6',-4,-5,0,W,b+12);add('T8x6',-4,-5,0,W,b+13);add('drvL',-1,-2,0,B,b+7);add('roll',-3,1,0,K,b+7);add('bar',-2,1,0,Y,b+14);
 // bed: walls with a white top stripe, floor, tailgate, tail lights, bumper
 sym('B1x9',-4,1,0,B,b+1);sym('B1x9',-4,1,0,B,b+4);sym('T1x9',-4,1,0,W,b+7);add('T6x8',-3,1,0,K,b+1);add('B6x1',-3,9,0,B,b+1);add('B6x1',-3,9,0,B,b+4);
 sym('tl',-4,10,2,B,b+1);add('B6x1',-3,10,0,K,b+1);add('P8x1',-4,11,0,K,b);add('nitro',-1,4,0,G,b+2);
 return A}
const BC_T=[
 {id:'t_bus',n:'Sightseeing Bus',tier:'e',ref:'60407',k:'Double-decker bus',car:BC_bus,st:{top:1,acc:1,han:.97,hull:1.3}},
 {id:'t_truck',n:'Box Truck',tier:'r',ref:'60440',k:'Delivery truck',car:BC_truck,st:{top:1,acc:1,han:.97,hull:1.35}},
 {id:'t_limo',n:'Stretch Limo',tier:'l',ref:'60102',k:'Stretch limousine',car:BC_limo,st:{top:1.04,acc:1,han:.99,hull:1.05}},
 {id:'t_mt',n:'Monster Truck',tier:'e',ref:'60180',k:'Monster truck',car:BC_monster,st:{top:1,acc:1.02,han:1,hull:1.25}}];
{const R=GAR_set('rod'),L=n=>JSON.parse(JSON.stringify(R.load[n]));
 for(const T of BC_T)GAR_SETS.push({id:T.id,n:T.n,tier:T.tier,req:null,car:T.car,off:R.off,boat:R.boat,tpl:1,ref:T.ref,forms:['car'],big:1,
  load:{car:{name:T.n.toUpperCase(),k:'Street',st:T.st,w:'Super Heavy',perk:'armor'},'4x4':L('4x4'),boat:L('boat')}})}
// ---- size → driving
const BC={k:'',due:0,f:0,big:0,acc:1,top:1,cam:1,d:null,on:1,ref:null,
 D0:{rad:SC_K.rad,off:SC_K.off,cam:SC_K.cam,wb:CR_WB,hw:OB_HW,hl:OB_HL,pl:{...CR_PLH}}};
const _bcS=new THREE.Vector3(),_bcP=new THREE.Vector3();
function BC_dims(ud){CR_bodyPts(ud);const B=CR_PS.b;if(!B)return null;ud.m.updateMatrixWorld(true);ud.m.getWorldScale(_bcS);let x0=B.min.x,x1=B.max.x,z0=1e9,z1=-1e9;
 ud.m.traverse(w=>{if(!w.isMesh||!w.userData.r)return;for(let q=w;q&&q!==ud.m;q=q.parent)if(!q.visible)return;w.getWorldPosition(_bcP);ud.m.worldToLocal(_bcP);if(!w.geometry.boundingBox)w.geometry.computeBoundingBox();const hw=(w.geometry.boundingBox.max.x-w.geometry.boundingBox.min.x)*w.scale.x;
  x0=Math.min(x0,_bcP.x-hw/2);x1=Math.max(x1,_bcP.x+hw/2);z0=Math.min(z0,_bcP.z);z1=Math.max(z1,_bcP.z)});
 return{W:(x1-x0)*_bcS.x,L:(B.max.z-B.min.z)*_bcS.z,H:(B.max.y-B.min.y)*_bcS.y,WB:z1>z0?(z1-z0)*_bcS.z:0}}
function BC_apply(d){const R=BC.ref||d,D0=BC.D0,rW=Math.max(1,d.W/R.W),rL=Math.max(1,d.L/R.L),rH=Math.max(1,d.H/R.H),big=d.L>R.L*1.12||d.W>R.W*1.12||d.H>R.H*1.25;BC.big=big;BC.d=d;
 if(!big){Object.assign(SC_K,{rad:D0.rad,off:D0.off,cam:D0.cam});CR_WB=D0.wb;OB_HW=D0.hw;OB_HL=D0.hl;Object.assign(CR_PLH,D0.pl);BC.acc=BC.top=BC.cam=1}
 else{const rad=D0.rad*rW,ext=(d.L-R.L)/2;SC_K.rad=+rad.toFixed(3);SC_K.off=+Math.max(D0.off,D0.off+ext-(rad-D0.rad)).toFixed(3);
  CR_WB=+(D0.wb*Math.max(1,R.WB?d.WB/R.WB:rL)).toFixed(3);OB_HW=D0.hw*rW;OB_HL=D0.hl+Math.max(0,ext);CR_PLH.l=D0.pl.l+Math.max(0,ext);CR_PLH.w=D0.pl.w*rW;
  const m=Math.max(1,rW*rL*rH);BC.m=m;BC.acc=Math.pow(m,-.3);BC.top=Math.pow(m,-.05);BC.cam=Math.pow(Math.max(rL,rH*1.1),.65);SC_K.cam=+(D0.cam*BC.cam).toFixed(3)}
 SC_rcam()}
function BC_upd(){const s=pl,ud=s&&s.mesh&&s.mesh.userData;if(!ud||!ud.m||!BC.on||(s.boatK||0)>.5)return;CR_bodyPts(ud);const key=CR_PS.k+'|'+(RO.vsel||''),now=++BC.f;
 // measure 36 sim steps (~0.6 s) after the car changes (the first frames still show the stock ship parts CR_fx hides, and CR_PS caches that box), then every 180 steps
 if(key!==BC.k){BC.k=key;BC.due=now+36;return}if(now<BC.due)return;BC.due=now+180;CR_PS.k='';
 const d=BC_dims(ud);if(!d)return;BC_apply(d)}
// reference = the Hot Rod (and every 8-wide template) as measured in roam with BC_dims (bc/probe.js, v88f): world metres
BC.ref={W:1.93,L:4.43,H:1.44,WB:2.45};
// collider with extra circles along long bodies (default size = the original 3-circle SC_hit, unchanged)
SC_hit=(f=>function(x,z,y){if(!BC.big||!SC_S.on)return f(x,z,y);const fx=Math.sin(RO.h),fz=Math.cos(RO.h),r=SC_K.rad,o=SC_K.off,n=Math.max(1,Math.ceil(o/(r*1.1)));
 for(let i=0;i<=n;i++)for(const sg of i?[1,-1]:[0]){const k=sg*o*i/n,px=x+fx*k,pz=z+fz*k,b=roamHit(px,pz,r,y);if(b){SC_S.dx=px-x;SC_S.dz=pz-z;return b}}return null})(SC_hit);
roamStep=(f=>function(dt){try{BC_upd()}catch(e){}const s=pl;if(!BC.big||!s||!s.stats)return f(dt);const a=s.stats.acc,t=s.stats.top;s.stats.acc=a*BC.acc;s.stats.top=t*BC.top;try{return f(dt)}finally{s.stats.acc=a;s.stats.top=t}})(roamStep);
CR_minBack=(f=>function(){return f()*(BC.big?BC.cam:1)})(CR_minBack);
// garage: the camera backs off for long / tall builds so the whole car stays framed
function BC_gk(){let L=[];try{L=GB.d?GB_list():[]}catch(e){}const key=L.length+'|'+(GB.mesh&&GB.mesh.uuid);if(BC.gkK===key)return BC.gk;let z0=0,z1=0,y1=0;
 for(const b of L){const P=GB_PC[b.t];if(!P)continue;const[fw,fd]=GB_dims(b);z0=Math.min(z0,b.z);z1=Math.max(z1,b.z+fd);y1=Math.max(y1,b.y+P.h)}BC.gkK=key;return BC.gk=Math.max(1,(z1-z0)/20,y1/34)}
GB_cam=(f=>function(){const k=BC_gk(),d=GB_.dist;GB_.dist=d*k;try{return f()}finally{GB_.dist=d}})(GB_cam);
// RIDES / garage view (not BUILD): R2_frame zooms the orbit camera to the free screen area; zoom out by the same build extent so a bus or truck stays in frame
R2_frame=(f=>function(C,bk){const r=f.apply(this,arguments);if(!bk&&C&&C.view&&C.view.enabled){const k=BC_gk();if(k>1){C.zoom/=k;C.updateProjectionMatrix();C.updateMatrixWorld()}}return r})(R2_frame);
window.__bc={S:BC,measure:()=>{const ud=pl&&pl.mesh.userData;if(!ud)return null;CR_PS.k='';const d=BC_dims(ud);if(d)BC_apply(d);return window.__bc.hull()},dims:()=>{const ud=pl&&pl.mesh.userData;return ud?BC_dims(ud):null},T:BC_T.map(t=>t.id),n:id=>{const S=GAR_set(id);return S&&S.car?S.car().length:0},
 hull:()=>({rad:SC_K.rad,off:SC_K.off,cam:SC_K.cam,wb:CR_WB,hw:OB_HW,hl:OB_HL,acc:BC.acc,top:BC.top,big:BC.big,m:BC.m||1})};
