// drivefeel-r25g: GO feel/drive (lazy chunk, phone profile: touch buttons + DRIFT button, stepped dt 1/60, no real clock). Alex: "I want a playable game".
// Ideas (not code) from the Hit & Run web rebuild study, docs/wiki/learn/hit-and-run.md section 2: a slide ends once the car points along its path again; a wall glance keeps the car moving.
// Drives the LIVE roamStep + roamCam from a street spawn (rfSnap heading) and measures: steering build-up, full lock at 100 km/h, DRIFT-button turn and brake+steer turn from 50 km/h,
// drift exit, a 30 deg wall glance and an 80 deg wall hit at 60 km/h, chase camera lag, a hop. Pass line in DF.pass (text in the checklist item).
const DF={};
function DF_measure(){const out={},W=a=>Math.atan2(Math.sin(a),Math.cos(a)),D=a=>Math.round(a*180/Math.PI),save={assist:SET.assist};
 const H0=DF.h0=DF.h0&&DF.h0.c===CID?DF.h0:{c:CID,x:CID==='fra'?(HX0+HX1)/2:RO.x,z:CID==='fra'?(HZS+HZN)/2:RO.z};
 const home=()=>{try{OF_reset()}catch(e){}const q=rfSnap(H0.x,H0.z,120);roamWarp(q?q[0]:RO.x,q?q[1]:RO.z,q?q[2]:RO.h,true);RO.v=0;RO.vy=0;camSnap=true};
 const T=o=>{TOUCH.on=true;TOUCH.used=true;TOUCH.dir=o.dir||0;TOUCH.gas=!!o.gas;TOUCH.brake=!!o.brk;TOUCH.hb=!!o.hb};
 const st=(n,o,f)=>{for(let i=0;i<n;i++){T(o);roamStep(1/60);try{roamCam(1/60)}catch(e){}if(f&&f(i)===false)return i}return n};
 const at=kmh=>{const h=RO.h,x=RO.x,z=RO.z;RO.v=0;RO.gOn=false;RO.crTurn=null;RO.stkT=0;T({gas:1});roamStep(1/60);RO.x=x;RO.z=z;RO.h=h;RO.crTurn=null;RO.v=kmh/3.6;RO.vh=RO.h;RO.yr=0;RO.dl=0;RO.dDir=0;RO.dT=0;RO.dEx=0;TOUCH.steer=0;RO.inv=99;RO.hp=100;RO.turbo=0;if(pl)pl.bm=0};
 const S0=window.SET&&SET.touch;try{SET.touch='buttons';
  // 1 steering: time to 90 % of the steady yaw rate at 50 km/h; let-go: yaw rate under 10 %
  home();at(50);const ys=[];st(90,{gas:1,dir:1},()=>{ys.push(Math.abs(RO.yr));RO.v=50/3.6});const yss=ys.slice(60).reduce((a,b)=>a+b)/30;out.steer90=+(ys.findIndex(y=>y>=.9*yss)/60).toFixed(2);out.yaw50=+yss.toFixed(2);
  out.release=+(st(60,{gas:1},()=>{RO.v=50/3.6;if(Math.abs(RO.yr)<.1*yss)return false})/60).toFixed(2);
  // 2 full lock 1.5 s at 100 km/h with gas: speed kept, max slip
  home();at(100);let sl=0;const hA=RO.h;st(90,{gas:1,dir:1},()=>{sl=Math.max(sl,Math.abs(W(RO.h-RO.vh)))});out.lock100={keep:+(RO.v*3.6/100).toFixed(2),slip:D(sl),turn:D(Math.abs(W(RO.h-hA)))};
  // 3 DRIFT button turn from 50 km/h: time until the path (velocity heading) has turned 90 deg
  const turn=o=>{home();at(50);const h0=RO.vh;let t=-1;st(180,o,i=>{if(Math.abs(W(RO.vh-h0))>=Math.PI/2){t=+((i+1)/60).toFixed(2);return false}});return{t90:t,kmh:Math.round(RO.v*3.6),path:D(Math.abs(W(RO.vh-h0)))}};
  out.hb50=turn({gas:1,dir:1,hb:1});
  // 3b phonedrift-r25i: BRAKE + steer button from 50 km/h (touch path, no DRIFT button, no gas): DRIFT state within .3 s, path turned 90 deg in <= 1.3 s; BRAKE alone slows, never drifts
  {home();at(50);const h0=RO.vh;let en=-1,t=-1;st(180,{brk:1,dir:1},i=>{if(en<0&&RO.dDir)en=+((i+1)/60).toFixed(2);if(Math.abs(W(RO.vh-h0))>=Math.PI/2){t=+((i+1)/60).toFixed(2);return false}});out.bd50={enter:en,t90:t,path:D(Math.abs(W(RO.vh-h0)))};
  home();at(50);let dr=0;st(120,{brk:1},()=>{if(RO.dDir)dr++});out.bk50={drift:dr,kmh:Math.round(Math.abs(RO.v)*3.6)}}
  // 3c drift exit at 70 km/h: DRIFT 1 s, then let go of DRIFT and steering: time until slip < 5 deg
  home();at(70);st(60,{gas:1,dir:1,hb:1});const dd=RO.dDir;let ex=-1;st(120,{gas:1},i=>{if(Math.abs(W(RO.h-RO.vh))<5/57.3&&!RO.dDir){ex=+((i+1)/60).toFixed(2);return false}});out.exit={was:dd,t:ex};
  // 4 walls: from the spawn, find a building face 12-40 m away, aim at it at ang deg to the face, 60 km/h, gas held, no steering. keep = speed 0.5 s after contact / 60
  // walls: a test wall (one 4 x 120 m collider box, 20 m tall, added to HUB.grid for the run and removed after) on a clear flat street spot near the spawn; NPC pushes off.
  // The car starts 16 m before the face at ang deg to it, 60 km/h, gas held, no steering. vin = speed at contact, keep = speed 0.5 s after contact / 60.
  const wall=ang=>{home();const cx=RO.x,cz=RO.z;for(let k=0;k<120;k++){const q=rfSnap(cx+((k%11)-5)*40,cz+(Math.floor(k/11)-5)*40,40);if(!q)continue;const ox=q[0],oz=q[1],g0=groundAt(ox,oz,99),X0=ox+2.4+16*Math.sin(ang),z0=oz-16*Math.cos(ang)*.5;if(g0<-1)continue;let ok=true;
    const P=[];for(let d=0;d<=16;d+=2)P.push([ox+d*Math.sin(ang)-2.4*0,z0+d*Math.cos(ang)]);for(let d=0;d<=24;d+=3)P.push([X0-2.6,z0+16*Math.cos(ang)+d]);
    for(const[x,z]of P){if(roamHit(x,z,2.6,g0+.5)||Math.abs(groundAt(x,z,99)-g0)>.5||(CID==='fra'&&inRiver(x,z,0))){ok=false;break}}if(!ok)continue;
    const box={x:X0+2,z:oz,hw:2,hd:60,h:g0+20,rh:20,y0:g0,dfw:1},keys=[];for(let gx=Math.floor((box.x-7)/40);gx<=Math.floor((box.x+7)/40);gx++)for(let gz=Math.floor((oz-65)/40);gz<=Math.floor((oz+65)/40);gz++){const key=gx*10000+gz;let L=HUB.grid.get(key);if(!L)HUB.grid.set(key,L=[]);L.push(box);keys.push(key)}
    const np0=CR_npcPush,rb0=roamBounce,bl=[];CR_npcPush=()=>{};roamBounce=function(ax,sp,nX){bl.push((RO.tb?'T':'S')+ax+Math.round(sp*3.6));return rb0.apply(this,arguments)};SET.assist='off';
    let r;try{RO.x=ox;RO.z=z0;RO.y=g0;RO.vy=0;RO.h=RO.vh=Math.atan2(Math.sin(ang),Math.cos(ang));at(60);camSnap=true;const h0=RO.h;let hitT=-1,keep=null,vin=0,turned=0;const tr=[];
     st(150,{gas:1},i=>{const dn=X0-RO.x;if(hitT<0&&(bl.length||dn<1.6)){hitT=i;vin=Math.round(RO.v*3.6)}if(hitT>=0&&i===hitT+30){keep=+(RO.v*3.6/60).toFixed(2);turned=D(Math.abs(W(RO.vh-h0)));return false}});
     r={vin,keep,turned,at:+(hitT/60).toFixed(2)};DF.wallAt={x:ox,z:oz,X0,ang}}
    finally{for(const key of keys){const L=HUB.grid.get(key),j=L.indexOf(box);if(j>=0)L.splice(j,1)}CR_npcPush=np0;roamBounce=rb0;SET.assist=save.assist}if(r.at<0){DF.miss=(DF.miss||0)+1;continue}return r}return'no clear spot'};
  out.glance30=wall(30/57.3);{const w0=TUNE.wallInc;TUNE.wallInc=0;try{out.glance30old=wall(30/57.3)}finally{TUNE.wallInc=w0}}out.wall80=wall(80/57.3);
  // 5 chase camera: 1 s full lock at 80 km/h, max angle between car heading and camera->car line; then straight: time until < 3 deg
  home();at(80);let lag=0;const ca=()=>{const c=camera.position;return Math.abs(W(RO.h-Math.atan2(RO.x-c.x,RO.z-c.z)))};st(60,{gas:1,dir:1},()=>{lag=Math.max(lag,ca())});out.camLag=D(lag);
  let cs=-1;st(180,{gas:1},i=>{if(ca()<3/57.3){cs=+((i+1)/60).toFixed(2);return false}});out.camSettle=cs;
  // 6 hop at 60 km/h: air time, speed kept 2 s later
  home();at(60);pressed.fire=true;let air=0;st(120,{gas:1},()=>{if(RO.y>groundAt(RO.x,RO.z,99)+.5)air++});out.hop={air:+(air/60).toFixed(2),keep:+(RO.v*3.6/60).toFixed(2)};
 }catch(e){out.err=String(e).slice(0,160)}finally{T({});SET.assist=save.assist;TOUCH.used=false;if(S0)SET.touch=S0;try{home()}catch(e){}}return out}
function DF_go(){const m=DF_measure(),R=[],P=DF.pass;window.__chk.df=m;
 for(const k in P){const r=P[k](m);if(r)R.push(k+' '+r)}
 return'📍 DRIVE FEEL · '+JSON.stringify(m)+(R.length?' ❌ FAIL '+R.join(', '):' ✅ PASS')}
// pass line (phone buttons): 30 deg wall glance at 60 km/h reaches the wall at >= 45 km/h and keeps >= 60 % of 60 km/h 0.5 s later; an 80 deg hit is still eased to <= 32 km/h (walls-1 bumper);
// steering 90 % in <= .25 s; DRIFT turn 90 deg at 50 km/h in <= 1.2 s; a released drift is straight (< 5 deg slip) within .35 s (never sticks)
const DF_o=v=>v&&typeof v==='object';
// shot helper (tools only): BRAKE+steer touch drift (phonedrift-r25i) from 50 km/h on the street spawn, stopped 0.6 s in (car sideways, skid marks); the caller draws and saves the frame
function DF_shot(){const H0=DF.h0||{x:CID==='fra'?(HX0+HX1)/2:RO.x,z:CID==='fra'?(HZS+HZN)/2:RO.z};const q=rfSnap(H0.x,H0.z,120);roamWarp(q[0],q[1],q[2],true);
 RO.v=0;RO.gOn=false;Object.assign(TOUCH,{on:true,used:true,gas:true,dir:0,hb:false});roamStep(1/60);RO.v=50/3.6;RO.vh=RO.h;RO.inv=99;
 for(let i=0;i<36;i++){Object.assign(TOUCH,{dir:1,brake:true,hb:false,gas:false});roamStep(1/60);roamCam(1/60);try{roamPose(pl,1/60)}catch(e){}}Object.assign(TOUCH,{dir:0,hb:false,gas:false,used:false});RO.frozen=true;
 return{slip:Math.round(Math.abs(angDiff(RO.h,RO.vh))*57.3),kmh:Math.round(RO.v*3.6),dDir:RO.dDir}}
DF.pass={glance:m=>!DF_o(m.glance30)?'no spot':m.glance30.vin>=45&&m.glance30.keep>=.6?'':m.glance30.vin+' km/h in, keep '+m.glance30.keep,
 wall80:m=>!DF_o(m.wall80)?'no spot':m.wall80.vin<=32?'':m.wall80.vin+' km/h in',steer:m=>m.steer90<=.25?'':m.steer90+' s',
 drift:m=>m.hb50.t90>0&&m.hb50.t90<=1.2?'':m.hb50.t90+' s',
 bdrift:m=>m.bd50.enter>0&&m.bd50.enter<=.3&&m.bd50.t90>0&&m.bd50.t90<=1.3?'':'enter '+m.bd50.enter+' t90 '+m.bd50.t90,brake:m=>m.bk50.drift===0&&m.bk50.kmh<=25?'':'brake alone drift '+m.bk50.drift+' f / '+m.bk50.kmh+' km/h',
 exit:m=>m.exit.t>=0&&m.exit.t<=.35?'':'stuck '+m.exit.t};
(function DF_reg(i){const C=window.__chk;if(C&&C.GO&&C.items){if(!C.items.some(q=>q.ver==='feel'&&q.id==='drive'))C.items.push({ver:'feel',id:'drive',area:'drive',text:'drivefeel-r25g · feel/drive: phone buttons, stepped: a 30° wall glance at 60 km/h meets the wall at ≥ 45 km/h and keeps ≥ 60 % (no invisible brake), an 80° hit is still eased to ≤ 32 km/h, steering 90 % ≤ .25 s, DRIFT 90° turn at 50 km/h ≤ 1.2 s, drift exit ≤ .35 s, BRAKE+steer button at 50 km/h enters DRIFT ≤ .3 s and turns 90° ≤ 1.3 s, BRAKE alone at 50 km/h slows to ≤ 25 km/h in 2 s without drifting'});
  C.GO['feel/drive']=['fra','ath'].map(c=>({c,n:'drive feel',secs:60,fn:()=>DF_go()}));return}
 if(i<600)setTimeout(()=>DF_reg(i+1),100)})(0);
({DF_go,DF_measure,DF_shot})
