// ---- RSZ (size-1, 2026-10-10). Alex: "many of the big vehicles need better size". Two root causes, fixed here for every ride:
// 1. SC_ship (96_scale_qa.js) squeezed EVERY roam ride to 75 % width (SC_K.shipX, made for the old winged ships). Brick rides (garage builds, templates,
//    LDraw sets) now keep their true width; only a ride without bricks (stock ship) is still squeezed.
// 2. Every ride was built at the Speed Champions stud (LD_SW = 0.408 per garage unit = 0.245 m), but City/Town sets are MINIFIG scale: a 6-wide truck
//    came out 1.1 m wide, half a traffic car. Those sets now carry a 'drvM' brick: a true-scale minifig driver behind the set's steering wheel, and the
//    marker that scales the ride by LD_FIG (1.6, the same stud as the world buildings: 0.39 m). Driver = 1.96 m, like the 1.9 m pedestrians.
//    Speed Champions sets, garage builds and the hand-made big templates (bus, box truck, limo, monster) stay at the car stud (they are car-sized).
// Traffic / other code can use SZ_k(bricks) (1 or 1.6) and SZ_add(bricks) to get the same scale.
const RSZ={MS:['30313','30572','3179','3180','3221','4436','4914','60017','60054','60059','60083','7639','7731'],k:LD_FIG,fig:2.36};
GB_PC.drvM={n:'Minifig driver',w:2,d:2,h:9,ic:'🧑',hide:1};
function SZ_k(B){return(B||[]).some(b=>b&&(b.t||b[0])==='drvM')?RSZ.k:1}
// the driver sits behind the steering wheel ('stw', r 2 = facing -z like the LDraw sets, r 0 = +z), 3 plates under it
function SZ_add(B){if(!Array.isArray(B)||!B.length||SZ_k(B)>1)return B;const w=B.find(b=>b&&b.t&&b.t.split('@')[0]==='stw');const A=B.slice();
 if(w){const r=w.r&2?2:0;A.push({t:'drvM',x:w.x,z:r?w.z+1:w.z-2,y:w.y-3,r,m:0,c:'#0055bf'})}else A.push({t:'drvM',x:-1,z:-1,y:-99,r:2,m:0,c:'#0055bf',hide:1});return A}
// figure only (the set has its own seat): true minifig height 5 studs (3.0 units; the 'drv' part is 0.83 of that and has a seat box)
GB_piece=(f=>function(t,c,M,L){if(t!=='drvM')return f.apply(this,arguments);const tm=[],tl=[];GB_figGeo(GB_figGet(),tm,tl,true);
 const s=1.5*(typeof SC_S!=='undefined'&&SC_S&&SC_S.drv?SC_K.drv:1),k=RSZ.fig;
 for(const[A,D]of[[tm,M],[tl,L]])for(const g of A){g.translate(0,-(.74-.42*s),1.55);g.scale(k/s,k/s,k/s);g.translate(0,.1,.25);D.push(g)}})(GB_piece);
// a driver brick with no wheel to sit behind is only the scale marker
GB_brickGeo=(f=>function(b){if(b&&b.t==='drvM'&&b.y<=-90)return;return f.apply(this,arguments)})(GB_brickGeo);
RSZ.mini=S=>!!(S&&S.car&&/^t_v/.test(S.id)&&S.ref&&!LD_SCRE.test(S.ref));// v90f: every LDraw City/Town ride (shared rule LD_SCRE), not a fixed list
for(const S of GAR_SETS)if(RSZ.mini(S)){const c=S.car;S.car=function(){return SZ_add(c.apply(this,arguments))};S.ms=1}
// saved copies of these rides (bricks stored before this fix) get the driver too
G9C_bricks=(f=>function(S,fm){const B=f.apply(this,arguments);return fm==='car'&&S&&S.ms?SZ_add(B):B})(G9C_bricks);
gbTeam=(f=>function(base,b){const t=f.apply(this,arguments);try{if(t&&t.gbB&&b&&b.on){const S=GAR_set(GAR_get().sel);if(S&&S.ms)t.gbB=SZ_add(t.gbB)}}catch(e){}return t})(gbTeam);
// the ride scale: uniform, no width squeeze for brick rides; driver height checks use the same k
GB_attach=(f=>function(g,bricks){const r=f.apply(this,arguments);try{if(g&&g.userData){g.userData.szK=SZ_k(bricks);g.userData.szB=!!(bricks&&bricks.length)}}catch(e){}return r})(GB_attach);
SC_ship=(f=>function(g,isPl){const ud=g&&g.userData;if(!ud||!ud.m||!SC_S.on||!(ud.szB||ud.szK>1))return f.apply(this,arguments);SC_fold(ud);
 const kk=ud.szK||1,k=SHIP_K*SC_K.ship*kk;if(!ud.scOn||ud.m.scale.y!==k||ud.m.scale.x!==k){ud.m.scale.setScalar(k);ud.scOn=1;const r=SC_K.ship*kk;
  ud.under.scale.set(r,r,1);ud.shadow.scale.set(r,r,1);if(isPl&&ud.shield)ud.shield.scale.set(4.2*r,2.4*r,5.4*r)}})(SC_ship);
// BC (98bc_bigcars.js) compares a ride with the Hot Rod: its reference width was measured squeezed (1.93 m); unsqueezed it is 2.57 m
BC.ref.W=2.57;
// the collider is never wider than a lane vehicle (3.2 m): a snowplow blade or wide mirrors overhang it and glancing hits slide (reviewer: 4.7 m snowplow)
RSZ.capW=3.2;BC_dims=(f=>function(ud){const d=f.apply(this,arguments);if(d&&d.W>RSZ.capW)d.W=RSZ.capW;return d})(BC_dims);
window.__sz={S:RSZ,k:SZ_k,add:SZ_add};
