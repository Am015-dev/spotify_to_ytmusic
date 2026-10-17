// smash-2 (lane F, 2026-10-17, Alex: "the whole smash on a light touch is annoying"; refs docs/refs/smash/NOTES.md): ONE gate for every roam smash.
// Light contact (low closing speed or a glancing touch) = a BUMP: a small nudge, 2-4 loose bricks, ≤ 8 % speed loss, the thing stays.
// A full SMASH needs an impact ≥ TUNE.sm2Big (45 km/h head-on) for big props / stalls, ≥ TUNE.sm2Car (45) for traffic, ≥ TUNE.sm2Small (28) for
// small props (cones, bins, crates), or BOOST/turbo held (any speed). impact = speed × (0.3 + 0.7 × how head-on the hit is). ?smash2=0 = old behaviour.
// Callers: smashCheck (city props), DMG_traf + W10_bump (traffic), LV stalls (98l_lively), LIFE_hit (lx code.js).
const SM2={on:!/[?&]smash2=0/.test(location.search),n:{tap:0,smash:0,bricks:0,carTap:0,carSmash:0},last:null};
function SM2_boost(){return RO.turbo>0||!!(pl&&pl.nitro)}
function SM2_imp(sp,tx,tz){const l=Math.hypot(tx,tz)||1,h=RO.vh??RO.h,d=(Math.sin(h)*tx+Math.cos(h)*tz)/l*(RO.v<0?-1:1);return Math.abs(sp)*3.6*(.3+.7*Math.max(0,d))}
// true = a smash; kind 'small' | 'big' | 'car'
function SM2_smash(kind,imp){const T=kind==='small'?TUNE.sm2Small??28:kind==='car'?TUNE.sm2Car??45:TUNE.sm2Big??45,s=SM2_boost()||imp>=T;SM2.n[kind==='car'?(s?'carSmash':'carTap'):(s?'smash':'tap')]++;SM2.last={kind,imp:Math.round(imp),smash:s};return s}
// a bump: once per thing per 0.6 s a tiny speed loss (into-the-thing part only), a few loose bricks, a soft thud
function SM2_bump(o,x,y,z,nx,nz,cols,nb){const t=performance.now();if(t-(o.sm2T||0)<600)return;o.sm2T=t;const h=RO.vh??RO.h,cin=Math.max(0,(Math.sin(h)*nx+Math.cos(h)*nz)*(RO.v<0?-1:1));RO.v*=1-.08*cin;
 const n=nb||3;SM2.n.bricks+=n;try{debris(V3(x,y+1,z),V3(nx*2,4,nz*2),n,cols,.35,y)}catch(e){}try{AU.sfx('bump')}catch(e){}shake=Math.max(shake,.08)}
// city prop (smashCheck): true = handled as a bump (caller skips the smash). Small props get shoved aside, big ones hold the car off.
function SM2_prop(p,def,sp){const tx=p.x-RO.x,tz=p.z-RO.z,small=def.r<=1.3&&def.m>=.94&&p.gi==null;if(SM2_smash(small?'small':'big',SM2_imp(sp,tx,tz)))return false;
 const l=Math.hypot(tx,tz)||1,nx=tx/l,nz=tz/l;
 if(small){for(let i=0;i<12&&OB_touch(p.x,p.z,def.r);i++){p.x+=nx*.15;p.z+=nz*.15}_m.compose(V3(p.x,p.y,p.z),new THREE.Quaternion().setFromAxisAngle(V3(0,1,0),p.ry),_ts.set(1,1,1));p.im.setMatrixAt(p.i,_m);p.im.instanceMatrix.needsUpdate=true}
 else for(let i=0;i<12&&OB_touch(p.x,p.z,def.r);i++){RO.x-=nx*.1;RO.z-=nz*.1}
 SM2_bump(p,p.x,p.y,p.z,nx,nz,[p.col,...def.cols.map(c=>new THREE.Color(c))],small?2:3);return true}
// LIFE small smashables (lx code.js) and LV stalls: true = a bump; the caller holds the car off
function SM2_life(it,sp,r,cols){const tx=it.x-RO.x,tz=it.z-RO.z;if(SM2_smash('small',SM2_imp(sp,tx,tz)))return false;const l=Math.hypot(tx,tz)||1,nx=tx/l,nz=tz/l,o=r-l;if(o>0){RO.x-=nx*o;RO.z-=nz*o}
 SM2_bump(it,it.x,it.y||RO.y||0,it.z,nx,nz,cols.map(c=>new THREE.Color(c)),2);return true}
// traffic: burst only on a real hit (closing speed × head-on) or boost; W10_bump below scales the player's loss on a tap (the player car is "heavy")
function SM2_car(c,x,z,dx,dz){const v=c.cv??c.v??0,vx=Math.sin(RO.vh)*RO.v-dx*v,vz=Math.cos(RO.vh)*RO.v-dz*v,rel=Math.hypot(vx,vz),tx=x-RO.x,tz=z-RO.z,l=Math.hypot(tx,tz)||1,d=rel?(vx*tx+vz*tz)/(rel*l):0;
 return SM2_smash('car',rel*3.6*(.3+.7*Math.max(0,d)))}
W10_bump=(f=>function(c,x,z,dx,dz,W){const V=RO.v,r=f.apply(this,arguments);if(SM2.on&&Math.abs(RO.v)<Math.abs(V))RO.v=V-(V-RO.v)*(TUNE.sm2CarK??.15);return r})(W10_bump);
// 📍 GO smash2/tap + smash2/hit: scripted contacts on the street you stand on (state asserts, no real-time play)
function SM2_go(kind){if(state!=='roam'||!RO.on)return'📍 Start free roam first';if(!SM2.on)return'📍 smash2 is OFF (?smash2=0) ❌';try{OF_reset()}catch(e){}const q=typeof CAM_road==='function'&&CAM_road(40);if(q)roamWarp(q.x,q.z,q.h,true);
 const ok=b=>b?' ✅':' ❌',kmh=kind==='tap'?20:70,fx=Math.sin(RO.h),fz=Math.cos(RO.h);RO.vh=RO.h;const tb=RO.turbo,ni=pl&&pl.nitro;RO.turbo=0;if(pl)pl.nitro=false;
 // prop: a fake bin (small) and a fake tree (big) put just touching the bumper, 25° off the nose; one smashCheck frame each
 const P=HUB.props.find(p=>p.alive&&HUB.ptypes[p.t].r<=1&&p.gi==null)||HUB.props[0],T=HUB.props.find(p=>p.alive&&p.t==='tree')||P,res=[];
 for(const p of[P,T]){const d=HUB.ptypes[p.t],a=RO.h+.44,s={x:p.x,z:p.z,y:p.y,alive:p.alive},D=Math.min(OB_HL+d.r*.6,d.r+2);p.x=RO.x+Math.sin(a)*D;p.z=RO.z+Math.cos(a)*D;p.y=RO.y;p.alive=true;p.sm2T=0;
  const kx=Math.floor(p.x/16)*10000+Math.floor(p.z/16),L=HUB.pgrid.get(kx)||(HUB.pgrid.set(kx,[]),HUB.pgrid.get(kx)),add=!L.includes(p);if(add)L.push(p);
  RO.v=kmh/3.6;const n0=HUB.smashed,b0=SM2.n.bricks,v0=RO.v;smashCheck(1/60);const r={t:p.t,smash:HUB.smashed>n0,bricks:SM2.n.bricks-b0,loss:1-RO.v/v0,imp:SM2.last&&SM2.last.imp};res.push(r);
  if(add)L.splice(L.indexOf(p),1);if(!p.alive)propRevive(p);Object.assign(p,s);if(s.alive)propRevive(p);else{p.alive=false}}
 // car: a parked traffic car 25° off the nose, the same gate DMG_traf calls, then the tap physics (W10_bump)
 const c={cv:0,j:0,k:0,y:RO.y,v:0},a=RO.h+.44,cx=RO.x+Math.sin(a)*3.4,cz=RO.z+Math.cos(a)*3.4;RO.v=kmh/3.6;const v0=RO.v,b0=SM2.n.bricks,burst=DMG_traf(c,cx,cz,fx,fz,false,false);if(!burst)W10_bump(c,cx,cz,fx,fz,0);
 const cr={burst,loss:1-RO.v/v0};RO.v=0;RO.turbo=tb;if(pl)pl.nitro=ni;window.__chk=window.__chk||{};window.__chk.smash2={kind,res,cr};const f=x=>Math.round(x*100)+' %';
 if(kind==='tap'){const pass=res.every(r=>!r.smash&&r.bricks<=6&&r.loss<=.1)&&!cr.burst&&cr.loss<=.1;
  return `📍 20 km/h TAP: ${res.map(r=>`${r.t} ${r.smash?'SMASHED':'bump'} (${r.bricks} bricks, −${f(r.loss)})`).join(', ')}, car ${cr.burst?'BURST':'bump'} (−${f(cr.loss)})`+ok(pass)}
 const pass=res.every(r=>r.smash)&&cr.burst;return `📍 70 km/h HIT: ${res.map(r=>`${r.t} ${r.smash?'smashed':'NOT smashed'} (impact ${r.imp})`).join(', ')}, car ${cr.burst?'burst into bricks':'NOT burst'}`+ok(pass)}
// GO registration (99c_checklist.js is at its 200 KB cap): its items stay there, the GO entries join window.__chk.GO once the checklist is up
(function SM2_reg(i){const C=window.__chk;if(C&&C.GO){for(const k of['tap','hit'])C.GO['smash2/'+k]=[{c:'fra',n:k,fn:()=>SM2_go(k)}];return}if(i<600)setTimeout(()=>SM2_reg(i+1),100)})(0);
