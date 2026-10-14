function makeShip(team,isPlayer,name,skill){const mesh=shipMesh(team);scene.add(mesh);const rk=R15_on()?TUNE.rSpd:1,top=BASE_TOP*cls.mul*team.top*rk;
  return{team,isPlayer,name,skill,mesh,dist:0,x:0,yaw:0,beta:0,yawRate:0,v:0,hull:100,item:null,
    stats:{top,top0:BASE_TOP*cls.mul*rk,acc:8.4*cls.mul*team.acc*(R15_on()?R15_ACC:1),brake:8+cls.mul,han:team.han,hull:team.hull},
    lap:-1,lapStart:0,best:Infinity,laps:[],finished:false,finishTime:0,dead:0,shield:0,turbo:0,boost:0,inv:0,roll:0,rollV:0,laneBias:rr(-4,4)*CR_LS,rubber:1,wall:0,wrong:0,place:1,bob:R()*6,aiFire:0,lastHit:-9,
    bm:20,nitro:false,air:null,lastJump:'',rollT:0,rollDir:0,rollCd:0,driftT:0,style:0,takedowns:0,nearMiss:0,airTime:0,maxSpeed:0,eliminated:false,attackT:0,aggrCd:rr(2,6),stall:0,latV:0}}
function clearRace(){for(const s of ships){scene.remove(s.mesh);disposeTree(s.mesh,true)}ships.length=0;for(const o of projs)wfxDrop(o);for(const o of mines)wfxDrop(o);projs.length=0;mines.length=0;
  for(const m of padMeshes){scene.remove(m);disposeTree(m,true)}padMeshes=[];pads.length=0;if(ghostShip){scene.remove(ghostShip);disposeTree(ghostShip,true);ghostShip=null}}
function setupJunction(){const s0=Math.min(700,TD.L*.25);RC.jn={cars:0,value:0,chain:0,after:0,end:s0+900,endT:null};
  for(const c of traffic){placeTraffic(c,s0,[0,260]);c.v*=.35}pl.bm=100}
function setupRace(cfg){if(cfg.type!=='roam')hubLeave();endCrashCam();ccCool=0;clearRace();RC=cfg;document.body.dataset.mode=cfg.type;loadTrack(cfg.track||'grand');applyMood(cfg.mood||'brick');mirror=!!cfg.mirror;FX.uniforms.uMirror.value=mirror?1:0;mapC.style.transform=mirror?'scaleX(-1)':'';$('#hTitle span').textContent=TRK.name;$('#hTitle b').textContent=TRK.city?'ATHINA':'MAINHATTAN';const attract=cfg.type==='attract';TD=dir==='rev'?(TRACKS.rev||(TRACKS.rev=reverseTrack(TF))):TF;
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
  const L=TD.L;if(cfg.items){const nk=Math.max(2,Math.round(L/(R15_on()&&cfg.type!=='arena'?650:1000)*(cfg.type==='arena'?1.7:1)));for(let k=0;k<nk;k++){let s=L*(k+.45)/nk;while(yAt(TD,s)<-10||jumpAt(TD,s)||jumpAt(TD,s+80)||R15_at(s))s+=60;for(const x of(R15_on()?[-.6,-.2,.2,.6].map(f=>f*MARGIN/CR_LS):[-14,0,14]))pads.push({s,x:x*CR_LS,type:'item'})}}
  let placed=0;for(let s=220;s<L-200&&placed<9;s+=40){let ok=!jumpAt(TD,s);for(let d=-60;d<=120;d+=20)if(Math.abs(kAt(TD,s+d))>1/700)ok=false;if(ok){pads.push({s,x:[-12,0,12][placed%3]*CR_LS,type:'boost'});placed++;s+=520}}
  for(const j of TD.jumps)pads.push({s:j.s0-140,x:0,type:'boost'});if(TRK.id==='akro'){let s0=-1;for(let s=0;s<L;s+=10)if(TD.SEC[Math.floor(s/TD.ds)%TD.N]==='PLAKA'){s0=s;break}if(s0>=0){const sd=Math.sign(kAt(TD,s0+60))||1;for(let q=0;q<4;q++)pads.push({s:s0+20+q*28,x:sd*(MARGIN-5*CR_LS),type:'boost'})}}
  R15_pads();
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
  if(booted)P2_compile(scene,camera)}
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
  if(TOUCH.on&&TOUCH.used){if(TOUCH.park&&(state!=='roam'||TOUCH.boost))parkSet(false);{const kT=thr,kB=brk;thr=Math.max(TOUCH.brake||TOUCH.park||thrEff()==='pedal'&&!TOUCH.gas?0:1,kT);brk=Math.max(TOUCH.brake?1:0,kB)}if(SET.touch==='buttons'){TOUCH.target=TOUCH.dir;const up=TOUCH.dir&&Math.sign(TOUCH.dir)===Math.sign(TOUCH.steer||TOUCH.dir);const rp=SENS().ramp;if(state==='roam'){const dd=Math.min(dtR||H,.05),r1=rp*.8;TOUCH.kick=0;if(up){if(TOUCH.steer*TOUCH.dir<W14_ST.k0)TOUCH.steer=TOUCH.dir*W14_ST.k0;TOUCH.steer+=clamp(TOUCH.dir-TOUCH.steer,-r1*W14_ST.rk*dd,r1*W14_ST.rk*dd)}else{const rb=TOUCH.dir?TUNE.tRet:7;TOUCH.steer+=clamp(TOUCH.dir-TOUCH.steer,-rb*dd,rb*dd)}}else{if(TOUCH.kick){const k0=[.42,.5,.58,.66,.75][clamp((SET.sens|0)-1,0,4)];if(TOUCH.steer*TOUCH.kick<k0)TOUCH.steer=TOUCH.kick*k0;TOUCH.kick=0}TOUCH.steer+=clamp(TOUCH.dir-TOUCH.steer,-(up?rp*1.8:16)*H,(up?rp*1.8:16)*H)}}else if(SET.touch==='tilt'){TOUCH.target=TILT.v;TOUCH.steer+=(TILT.v-TOUCH.steer)*Math.min(1,H*8)}else TOUCH.steer+=((TOUCH.target||0)-TOUCH.steer)*Math.min(1,H*(TOUCH.sid!=null?9:14));if(Math.abs(TOUCH.steer)<.004)TOUCH.steer=0;if(TOUCH.sid!=null||TOUCH.steer||TOUCH.dir)steer=TOUCH.steer;boost=Math.max(boost,TOUCH.boost?1:0);
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
  s.aab=0;if(SET.assist!=='off'&&TOUCH.used&&!s.air&&state==='race'){let kA=0;for(let d=15;d<=135;d+=20){const kd=kAt(TD,s.dist+d);kA=Math.max(kA,Math.abs(kd)/Math.max(.35,1-kd*s.x))}const vr0=Math.min(1,s.v/st.top0),Rm=(1.32-.52*vr0)*st.han*{low:.85,normal:1,high:1.15}[SET.steer],need=kA*s.v,kL=kAt(TD,s.dist+12),cap=Math.min(Rm+(s.v>st.top0*.3?.5*st.han:0),C26.on?C26_muRace(s)*.95/Math.max(1,s.v):9);
    if(Math.abs(kL)*s.v>Rm*.72&&s.v>st.top0*.3&&!c.hb)s.aab=Math.sign(kL);if(need>cap*.8){c.thr=0;c.boost=0}if(need>cap*.98)c.brk=Math.max(c.brk,.7)}
  if(c.boost&&!s.bPrev){if(raceT-(s.bT??-9)<.32&&PK.has('_lock')&&state==='race'){s.spLock=!s.spLock;feed(s.spLock?'BOOST LOCK ON':'BOOST LOCK OFF',0,'#ffd12c');AU.sfx('pick')}s.bT=raceT}s.bPrev=!!c.boost;if(s.spLock){if(c.brk>0||s.dead>0)s.spLock=false;else c.thr=1}
  s.nitro=!!c.boost&&s.bm>.5&&!s.air&&state==='race';if(s.nitro){if(!s.wasNitro){AU.sfx('nitro');fovKick=Math.max(fovKick,(R15_on()?10:8)*TUNE.fxFov);if(R15_on())R15_boostFx(s)}s.bm=Math.max(0,s.bm-24*H)}s.wasNitro=s.nitro;
  const top=st.top*(s.turbo>0?1.2:1)*(s.boost>0?1.12:1)*(s.nitro?1.3:1)*(s.spLock?1.06:1)*(s.r15k||1);
  const vr=Math.min(1,s.v/st.top0),Rmax=(1.32-.52*vr)*st.han*(s.air?.85:1)*{low:.85,normal:1,high:1.15}[SET.steer];
  if(SET.assist!=='off'&&TOUCH.used&&state==='race'){const u=c.steer,au=Math.abs(u);const R15B=R15_b(s,s.x),R15m=3.5*CR_LS;if(au>=.06||s.holdX==null)s.holdX=clamp(s.x+s.v*Math.sin(s.beta)*.17,R15B[0]+R15m,R15B[1]-R15m);else if(R15_on())s.holdX+=(R15_line(s)-s.holdX)*Math.min(1,H*.6);s.holdX=R15_hold(s,clamp(s.holdX,Math.min(R15B[0]+R15m,R15B[1]),Math.max(R15B[1]-R15m,R15B[0])));if(s.aab>0)c.abR=Math.max(c.abR,1);else if(s.aab<0)c.abL=Math.max(c.abL,1);
    const yMax=Math.min(.3,SENS().lat/Math.max(40,s.v));let desYaw=au<.06?clamp((s.holdX-s.x)*1.9/Math.max(40,s.v),-.12,.12):u*yMax;
    const edge=desYaw>0?s.x-(R15B[1]-5*CR_LS):(R15B[0]+5*CR_LS)-s.x;if(edge>0)desYaw*=Math.max(0,1-edge/4);
    c.steer=clamp((k*s.v/Math.max(.35,1-k*s.x)+(desYaw-s.beta)*6-(c.abR-c.abL)*.62*st.han)/Math.max(.2,Rmax),-1,1);s.asst=1}else s.asst=0
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
  s.yaw+=s.yawRate*H;const grip=(s.hbDir||ab>0?8:12)*st.han*(ab>0?1.2:1)*(s.hbDir?.28:1);C26_raceBeta(s,grip*(s.boatMode?(s.r15w?.9:.62):s.dirtMode?.75:1),H,!!s.hbDir||ab>0);
  const sl=Math.sin(s.yaw-s.beta);s.v-=s.v*sl*sl*(s.hbDir?.5:3)*H;
  const px=s.x;const ds=s.v*Math.cos(s.beta)*H/Math.max(.35,1-k*s.x);s.x+=s.v*Math.sin(s.beta)*H;s.dist+=ds;s.yaw-=k*ds;s.beta-=k*ds;
  s.yaw=clamp(s.yaw,-1.5,1.5);s.beta=clamp(s.beta,-1.5,1.5);if(s.hbDir){s.yaw=clamp(s.yaw,-.85,.85);if(Math.abs(s.yaw)>=.85&&Math.sign(s.yawRate)===Math.sign(s.yaw))s.yawRate*=.5}
  s.rollCd=Math.max(0,s.rollCd-H);if(s.crSR&&s.rollT<=0)s.crSR=0;if(pressed.roll&&s.rollCd<=0&&s.rollT<=0&&!s.air){s.rollDir=mirror?-pressed.roll:pressed.roll;s.rollT=ROLL_T;s.rollCd=1;s.rollHit=false;AU.sfx('roll');CR_lgFx(s)}pressed.roll=0;
  if(s.rollT>0){s.rollT-=H;if(s.rollT>ROLL_T-.32&&!s.air&&!s.crSR){s.x=R15_cx(s,s.x+s.rollDir*CR_LGV*H);s.holdX=s.x}else s.holdX=s.x}
  const drifting=!s.air&&ab>0&&!s.aab&&Math.abs(c.steer)>.3&&Math.sign(c.steer)===Math.sign(c.abR-c.abL)&&s.v>st.top0*.5;
  if(drifting){s.driftT+=H;s.bm=Math.min(100,s.bm+14*H);if(R()<.6){const at=V3().copy(F.p).addScaledVector(F.r,s.x-Math.sign(c.steer)*2).addScaledVector(F.u,.4).addScaledVector(F.t,-3);emit(SPARK,at,V3(rr(-3,3),rr(1,5),rr(-3,3)).addScaledVector(F.t,-s.v*.3),.3,new THREE.Color(2,1.2,.5))}}
  else if(s.driftT>0){if(s.driftT>.7)award(s,'DRIFT',0,Math.round(s.driftT*300),'#ff7ac0');s.driftT=0}
  s.wall=Math.max(0,s.wall-H);
  // R17 rail cushion (races): within ~1.5–4.5 m of a wall or island and still sliding toward it, the slip and heading ease parallel,
  // so a fast car on the 38 m tracks slides along instead of scraping (Westhafen 1.5 walls/min vs live 0.63). Never pushes away; no effect when moving inward.
  if(R15_on()&&!s.air&&s.v>12){const B=R15_b(s,s.x),sg=Math.sin(s.beta)>0?1:-1,room=sg>0?B[1]-s.x:s.x-B[0],D=clamp(s.v*.07,1.5,4.5);if(room<D){const q=clamp(1-room/D,0,1);s.beta*=1-Math.min(.9,q*10*H);if(Math.sign(s.yaw)===sg)s.yaw*=1-Math.min(.9,q*7*H);if(Math.sign(s.yawRate)===sg)s.yawRate*=1-Math.min(.9,q*7*H);if(Math.abs(Math.sin(s.beta))>.02)s.v*=1-Math.min(.3,q*q*1.4*H)}}
  const R15W=R15_b(s,px);if(s.x>R15W[1]||s.x<R15W[0]){const sg=s.x>R15W[1]?1:-1;s.x=sg>0?R15W[1]:R15W[0];const into=Math.sin(s.beta)*sg;
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
  let target=clamp(k*s.v/Math.max(.35,1-k*s.x)+(desB-s.beta)*5.5,-Rmax,Rmax);target=C26_raceYaw(s,target,H);s.yawRate+=(target-s.yawRate)*Math.min(1,H*11);
  s.yaw+=s.yawRate*H;C26_raceBeta(s,12*st.han*(s.boatMode?(s.r15w?.9:.62):s.dirtMode?.75:1),H,false);const sl=Math.sin(s.yaw-s.beta);s.v-=s.v*sl*sl*3*H;
  const ds=s.v*Math.cos(s.beta)*H/Math.max(.35,1-k*s.x);s.x+=s.v*Math.sin(s.beta)*H;s.dist+=ds;s.yaw-=k*ds;s.beta-=k*ds;s.yaw=clamp(s.yaw,-1.2,1.2);s.beta=clamp(s.beta,-1.2,1.2);
  {const B=R15_b(s,px);if(s.x>B[1]||s.x<B[0]){const sg=s.x>B[1]?1:-1;s.x=sg>0?B[1]:B[0];if(Math.sin(s.beta)*sg>0){s.v*=1-Math.min(.5,Math.abs(Math.sin(s.beta))*1.5);s.beta*=.3;s.yaw*=.4;s.yawRate*=.3}}}
  s.latV=(s.x-px)/H}
function physAI(s){const st=s.stats,sk=s.skill*(TUNE.rub===1?s.rubber:1+(s.rubber-1)*TUNE.rub);frameAt(TD,s.dist,F);const k=F.k;
  s.aiN=(s.aiN||0)-H;s.aiNcd=(s.aiNcd??rr(4,9))-H;if(s.aiNcd<=0&&Math.abs(kAt(TD,s.dist+80))<1/600&&RC.type!=='attract'){s.aiN=rr(1.8,3);s.aiNcd=rr(5,10)*(1.15-sk*.2)}
  s.nitro=s.aiN>0;
  let vmax=st.top*sk*(s.turbo>0?1.2:1)*(s.boost>0?1.12:1)*(s.nitro?1.26:1)*(s.r15k||1);const look=Math.max(80,s.v*1.8);
  const aiLat=(C26.on?C26_muRace(s)*C26.aiMu*(.9+.1*sk):AI_LAT*sk*st.han*cls.mul)*RF_lat(s);for(let d=10;d<look;d+=12){const kd=kAt(TD,s.dist+d),kk=Math.abs(kd)/Math.max(.35,1-kd*s.x);const vc=Math.sqrt(aiLat/Math.max(kk,1e-5));vmax=Math.min(vmax,Math.sqrt(vc*vc+2*AI_BRK*cls.mul*Math.max(0,d-10)))}
  let ka=0;for(let d=30;d<=150;d+=20)ka+=kAt(TD,s.dist+d);ka/=7;let xt=clamp(ka*3200+s.laneBias,-MARGIN+1.2,MARGIN-1.2);
  for(const o of ships){if(o===s||o.dead||o.eliminated)continue;const dd=o.dist-s.dist;if(dd>0&&dd<26&&Math.abs(o.x-s.x)<4)xt=clamp(o.x+CR_dodge(s,o)*6,-MARGIN+1,MARGIN-1)}
  for(const m of mines){const dd=m.dist-s.dist;if(dd>0&&dd<60&&Math.abs(m.x-s.x)<4)xt=clamp(m.x+(m.x>0?-4:4),-MARGIN+1,MARGIN-1)}
  for(const c of traffic){if(c.wreck)continue;const dd=tdd(c.dist,s.dist);if(dd>0&&dd<(s.v-c.v)*1.6+25&&Math.abs(c.x-xt)<c.wid/2+3){const l=c.x-c.wid/2-3.4,r=c.x+c.wid/2+3.4;xt=((Math.abs(l-s.x)<Math.abs(r-s.x)&&l>-MARGIN)||r>MARGIN)?l:r;xt=clamp(xt,-MARGIN+.5,MARGIN-.5);if(dd<12&&Math.abs(c.x-s.x)<c.wid/2+2.2)vmax=Math.min(vmax,c.v)}}
  xt=R15_aiXt(s,xt);
  const ag=(RC.aggr||0)+(s.aggrB||0);if(ag>0&&pl&&!pl.dead&&!pl.eliminated&&state==='race'){s.aggrCd-=H;const dd=pl.dist-s.dist;if(s.attackT<=0&&s.aggrCd<=0&&Math.abs(dd)<9&&Math.abs(pl.x-s.x)<9&&R()<ag*H*3){s.attackT=1.3;s.aggrCd=rr(5,9)}
    if(s.attackT>0){s.attackT-=H;xt=clamp(pl.x+(pl.x>s.x?1.5:-1.5),-MARGIN,MARGIN)}}
  if(!C26.on){if(s.v<vmax)s.v+=st.acc*sk*Math.max(.15,1-s.v/(st.top*1.05))*H+(s.boost>0?5*H:0)+(s.nitro?7.5*cls.mul*H:0);else s.v=Math.max(vmax,s.v-AI_BRK*cls.mul*H);
  const px=s.x,lat=(s.attackT>0?14:9)*cls.mul;if(s.crXT==null||Math.abs(s.crXT-s.x)>20){s.crXT=s.x;s.crLV=0}s.crXT+=(xt-s.crXT)*Math.min(1,H*(s.attackT>0?8:3));const dvx=clamp((s.crXT-s.x)*2.5,-lat,lat);s.crLV=(s.crLV||0)+clamp(dvx-(s.crLV||0),-30*H,30*H);{const B=R15_b(s,px);s.x=clamp(s.x+s.crLV*H,B[0],B[1])}
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
