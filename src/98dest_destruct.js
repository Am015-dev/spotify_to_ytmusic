// dest-1 (lane dest, 2026-10-17, Alex: "the game crashes a lot on items, we need more destructible items, let the player find shortcuts").
// Measured with tools/dest/stops.js (2-min wander bot, hard stop = speed drop > 50 % in < 0.3 s): the item stops were (1) solid wall hits that rebounded the car to <= 12 m/s,
// (2) LIFE "set" pieces (LIFE_slide took 20 % of the speed per frame) and (3) traffic taps. This module: (a) solids deflect / slide along instead of a dead stop (DEST_wall),
// (b) the small LIFE set pieces (banner, billboard, balloons, sprinkler, swings, seesaw) smash like props under the smash2 gate (DEST_set, called from lx code.js),
// (c) 3-5 checked shortcuts per city (up to 9 candidates, each re-checked and shown only once streamed tiles are in) over open ground (parks, plazas, lawns between streets) marked with yellow brick arrows. ?dest=1 turns it ON (default OFF: dest/shortcut still red in Frankfurt).
const DEST={fr:0,hv:[],on:/[?&]dest=1/.test(location.search),n:{slide:0,setSmash:0,setBump:0},sc:null,scI:0,scBusy:false,scGrp:null};
const DEST_SET={banner:['#e8502a','#ffffff'],billboard:['#2a7ad8','#ffffff','#ffd12c'],balloons:['#e8502a','#ffd12c','#2a7ad8','#3aa04a'],sprinkler:['#2a7ad8','#bfe3ff'],swings:['#d8302a','#ffd12c','#2f3640'],seesaw:['#ffd12c','#2a7ad8']};
// LIFE set piece (lx code.js): true = handled here (smashed or bumped), false = the old solid slide (windmill, turbine, fountain, crane, carousel, teacups stay solid landmarks)
function DEST_set(it,sp,rr){const cols=DEST_SET[it.t];if(!DEST.on||!cols)return false;const tx=it.x-RO.x,tz=it.z-RO.z,LIFE=window.__life.LIFE;/* LIFE lives in the lx chunk's scope */
 if(SM2_smash('small',SM2_imp(sp,tx,tz))){LIFE.dead.set(it.id,1);const at=V3(it.x,it.y+.8,it.z),fw=V3(Math.sin(RO.vh??RO.h),0,Math.cos(RO.vh??RO.h));
  try{debris(at,fw.clone().multiplyScalar(Math.max(4,sp)*.4).add(V3(0,6,0)),11,cols.map(c=>new THREE.Color(c)),.7,it.y);studBurst(at,fw,Math.max(6,sp));AU.sfx('brick')}catch(e){}
  HUB.smashed++;comboAdd(1);RO.v*=.97;LIFE.n.smash++;LIFE.px=1e9;DEST.n.setSmash++;return true}
 DEST.n.setBump++;return SM2_life(it,sp,rr,cols)}
// street-life stalls / kiosks that hold the car (98l_lively): the old code took 30 % of the speed per frame; now only the into-the-thing part (12 %), and a glancing hit turns the car along the rim. n = unit normal pointing at the car.
function DEST_slide(nx,nz){const s=RO.v<0?-1:1,hx=Math.sin(RO.h)*s,hz=Math.cos(RO.h)*s,cin=-(hx*nx+hz*nz);if(cin<=0)return 1;if(s>0&&cin<.95){const side=hx*-nz+hz*nx>=0?1:-1;RO.h+=angDiff(Math.atan2(-nz*side,nx*side),RO.h)*.25}DEST.n.slide++;return 1-.12*cin}
// solids: the rebound (<= 12 m/s, a dead stop) becomes a slide along the wall at >= 60 % of the speed (glancing hits keep more). Damage / sound / shake are the old code's.
roamBounce=(f=>function(ax,sp,nX,nZ){if(!DEST.on||RO.tb)return f.apply(this,arguments);const vx=Math.sin(RO.vh)*RO.v,vz=Math.cos(RO.vh)*RO.v;let X=nX,Z=nZ;if(X==null){if(ax==='x'){X=-(Math.sign(vx)||1);Z=0}else{X=0;Z=-(Math.sign(vz)||1)}}
 const vn=vx*X+vz*Z,s0=Math.abs(RO.v),v0=RO.v;const r=f.apply(this,arguments);
 const hv=DEST.hv,fl=hv.length?Math.max(...hv)*.56:0;/* no solid takes more than 44 % of the speed of the last 0.3 s */
 if(vn>-.05||s0<2||RO.vy>1)return r;
 if(Math.abs(RO.v)>=Math.max(s0*.6,fl))return r;
 const a=Math.min(1,-vn/Math.max(s0,.1));let tx=vx-vn*X,tz=vz-vn*Z,tl=Math.hypot(tx,tz);if(tl<.3*s0){/* head-on: slide to the side the car is steered / pointing to */const sd=Math.sign(Math.sin(RO.h)*-Z+Math.cos(RO.h)*X)||1;tx=-Z*sd;tz=X*sd;tl=1}
 const k=Math.max(.6,1-.4*a*a),tf=Math.atan2(tx/tl,tz/tl);RO.vh=tf;RO.h+=angDiff(tf,RO.h)*.6;RO.v=(v0<0?-1:1)*Math.max(s0*k,fl);RO.stkT=0;DEST.n.slide++;return r})(roamBounce);
// ---------- shortcuts: pairs of street nodes 60-130 m apart (longer cut-throughs kept hitting streamed or moving obstacles) (as the crow flies) whose road route is >= 1.45x longer (>= 31 % saved) and whose straight corridor is open ground
// (no collider within 2.6 m, no river, flat, mostly off the road network). Found incrementally (DEST_step, <= 4 ms per roam frame), marked with chevron decals.
function DEST_dij(N,a,maxD){const D=new Map([[a,0]]),Q=[[0,a]];while(Q.length){let m=0;for(let i=1;i<Q.length;i++)if(Q[i][0]<Q[m][0])m=i;const[d,i]=Q.splice(m,1)[0];if(d>D.get(i))continue;const A=N[i];for(const j of A.nb||[]){const B=N[j];if(!B)continue;const nd=d+Math.hypot(B.x-A.x,B.z-A.z);if(nd<maxD&&nd<(D.get(j)??1e9)){D.set(j,nd);Q.push([nd,j])}}}return D}
function DEST_open(ax,az,bx,bz){const L=Math.hypot(bx-ax,bz-az),dx=(bx-ax)/L,dz=(bz-az)/L;let off=0,n=0,g0=groundAt(ax,az,99);for(let s=3;s<=L-3;s+=1.5){const x=ax+dx*s,z=az+dz*s,g=groundAt(x,z,99);n++;if(roamHit(x,z,3.8,g+.6)||inRiver(x,z,2)||roamTerr(x,z,g+.3).low||Math.abs(g-g0)>.5||g<-1||Math.abs(groundAt(x+dz*1.6,z-dx*1.6,99)-g)>.6||Math.abs(groundAt(x-dz*1.6,z+dx*1.6,99)-g)>.6)return 0;g0=g;if(!LF_onRoad(x,z))off++;const PL=HUB.pgrid&&HUB.pgrid.get(Math.floor(x/16)*10000+Math.floor(z/16));if(PL)for(const p of PL){const d=HUB.ptypes[p.t];if(d&&d.r>=1.1&&Math.hypot(p.x-x,p.z-z)<d.r+2)return 0}}if(n<6||off/n<.6)return 0;
 const LF=window.__life;if(LF&&LF.cell&&LF.CELL){/* solid LIFE set pieces (crane, carousel, fountain...) near the line; the small ones smash and do not count */try{const C=LF.CELL,seen=new Set();for(let s=0;s<=L;s+=C/2){const x=ax+dx*s,z=az+dz*s,ca=Math.floor(x/C),cb=Math.floor(z/C);for(let da=-1;da<=1;da++)for(let db=-1;db<=1;db++){const k=(ca+da)*100000+cb+db;if(seen.has(k))continue;seen.add(k);for(const it of LF.cell(ca+da,cb+db)){if(it.c!=='set'||DEST_SET[it.t])continue;const t=clamp(((it.x-ax)*dx+(it.z-az)*dz),0,L);if(Math.hypot(ax+dx*t-it.x,az+dz*t-it.z)<it.r+4)return 0}}}}catch(e){}}
 return off/n}
function DEST_find(budgetMs){const N=HUB.nodes;if(!N||!DEST.on)return;const t0=performance.now(),S=DEST;S.found=S.found||[];
 for(;S.scI<N.length&&performance.now()-t0<budgetMs;S.scI++){const A=N[S.scI];if(!A||A.ab||!A.nb||!A.nb.length)continue;let D=null;
  for(let j=S.scI+1;j<N.length;j++){const B=N[j];if(!B||B.ab||!B.nb||!B.nb.length)continue;const dx=B.x-A.x,dz=B.z-A.z;if(Math.abs(dx)>130||Math.abs(dz)>130)continue;const L=Math.hypot(dx,dz);if(L<60||L>130)continue;
   D=D||DEST_dij(N,S.scI,L*2.2);const R=D.get(j);if(R==null||R<L*1.45)continue;const o=DEST_open(A.x,A.z,B.x,B.z);if(!o)continue;
   S.found.push({a:{x:A.x,z:A.z},b:{x:B.x,z:B.z},len:Math.round(L),road:Math.round(R),save:+(1-L/R).toFixed(2)})}}
 if(S.scI>=N.length&&!S.sc){S.found.sort((p,q)=>q.save*Math.min(q.len,140)-p.save*Math.min(p.len,140));const pick=[];for(const c of S.found){if(pick.length>=9)break;if(pick.every(p=>Math.hypot(p.a.x-c.a.x,p.a.z-c.a.z)>250&&Math.hypot(p.b.x-c.b.x,p.b.z-c.b.z)>250))pick.push(c)}S.sc=pick;DEST_mark(pick)}}
let DEST_texM=null;
function DEST_mark(list){if(!list.length)return;if(!DEST_texM){const[pc,pg]=cv(64,128);pg.strokeStyle='#ffd12c';pg.lineWidth=11;pg.lineCap='round';pg.lineJoin='round';for(let k=0;k<2;k++){pg.beginPath();pg.moveTo(10,104-k*44);pg.lineTo(32,66-k*44);pg.lineTo(54,104-k*44);pg.stroke()}
  const t=tex(pc);KEEP_TEX.add(t);DEST_texM=new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,toneMapped:false,color:new THREE.Color(1.6,1.3,.5)})}
 const grp=DEST.scGrp=new THREE.Group(),geo=new THREE.PlaneGeometry(4.2,7.4);
 for(const c of list){c.mk=[];const L=Math.hypot(c.b.x-c.a.x,c.b.z-c.a.z),ux=(c.b.x-c.a.x)/L,uz=(c.b.z-c.a.z)/L,h=Math.atan2(ux,uz);
  for(const[o,dir]of[[c.a,1],[c.b,-1]])for(let k=0;k<3;k++){const x=o.x+ux*dir*(5+k*6),z=o.z+uz*dir*(5+k*6),m=new THREE.Mesh(geo,DEST_texM);m.rotation.order='YXZ';m.rotation.set(-Math.PI/2,h+(dir>0?0:Math.PI)+Math.PI,0);m.position.set(x,groundAt(x,z,99)+.18,z);m.renderOrder=3;m.visible=false;grp.add(m);c.mk.push(m)}
  for(let s=14;s<L-12;s+=9){const x=c.a.x+ux*s,z=c.a.z+uz*s,m=new THREE.Mesh(new THREE.BoxGeometry(.8,.28,.8),DEST_texM);m.position.set(x,groundAt(x,z,99)+.2,z);m.visible=false;grp.add(m);c.mk.push(m)}}
 HUB.grp.add(grp)}
// streamed city tiles add colliders near the player: a shortcut is re-checked once the car is within 350 m, and dropped (markers hidden) if something now blocks it
function DEST_check(c){if(c.ok!=null)return c.ok;c.ok=!!DEST_open(c.a.x,c.a.z,c.b.x,c.b.z);for(const m of c.mk||[])m.visible=c.ok;return c.ok}
function DEST_reset(){if(DEST.scGrp&&DEST.scGrp.parent)DEST.scGrp.parent.remove(DEST.scGrp);DEST.scGrp=null;DEST.sc=null;DEST.found=null;DEST.scI=0;DEST.N=HUB.nodes}
const DEST_step=dt=>{DEST.fr++;DEST.hv.push(Math.abs(RO.v));if(DEST.hv.length>9)DEST.hv.shift();if(state!=='roam'||!RO.on||!HUB.nodes||!DEST.on)return;if(DEST.N!==HUB.nodes)DEST_reset();if(!DEST.sc){try{DEST_find(4)}catch(e){DEST.sc=[];console.warn('DEST',e)}}else if(DEST.fr%20===0)for(const c of DEST.sc)if(c.ok==null&&Math.hypot(c.a.x-RO.x,c.a.z-RO.z)<350)DEST_check(c)};
smashCheck=(f=>function(dt){DEST_step(dt);return f.apply(this,arguments)})(smashCheck);
