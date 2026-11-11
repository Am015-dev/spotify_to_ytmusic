/* ===================== SP · local 2-player split-screen (race on any circuit, Smash Battle in Frankfurt free roam) =====================
   Everything is gated by SP_S.on: with split-screen off every wrapper calls straight through (single-player unchanged). */
const SP_S={on:false,mode:null,ai:true,trk:null,K2:{},pr2:{},p2:null,cam2:null,c2:null,snap2:true,lt:0,tap:{},res:false,sv:{},
  bt:null,who:1,pads:[null,null],padB:[{},{}]};
const SP_P1K=new Set(['KeyW','KeyA','KeyS','KeyD','Space','ShiftLeft','KeyQ','KeyE']),SP_P2K=new Set(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Enter','NumpadEnter','ShiftRight','Comma','Period']);
const SP_BATTLE_T=180,SP_RF=['x','y','z','h','vh','v','vy','yr','dDir','dT','landK','camH','camL','camR','hp','inv','turbo'];
const SP_okW=()=>innerWidth>=700;
// ---- gamepads: 1 pad -> player 2 (player 1 keeps the keyboard), 2 pads -> P1 + P2, in index order
function SP_padsPoll(){const L=navigator.getGamepads?[...navigator.getGamepads()].filter(g=>g&&g.connected):[];SP_S.pads=L.length>=2?[L[0],L[1]]:[null,L[0]||null];return L.length}
function SP_ctl(p){const k=p===1?K:SP_S.K2;let steer,thr,brk,abL,abR,boost,hb;
  if(p===1){steer=(k.KeyD?1:0)-(k.KeyA?1:0);thr=k.KeyW?1:0;brk=k.KeyS?1:0;abL=k.KeyQ?1:0;abR=k.KeyE?1:0;boost=k.ShiftLeft?1:0}
  else{steer=(k.ArrowRight?1:0)-(k.ArrowLeft?1:0);thr=k.ArrowUp?1:0;brk=k.ArrowDown?1:0;abL=k.Comma?1:0;abR=k.Period?1:0;boost=k.ShiftRight?1:0}
  const pad=SP_S.pads[p-1],B=SP_S.padB[p-1],pr=p===1?pressed:SP_S.pr2;
  if(pad){const ax=pad.axes[0]||0;if(Math.abs(ax)>.12)steer=clamp(steer+Math.sign(ax)*(Math.abs(ax)-.12)/.88,-1,1);const b=i=>pad.buttons[i]||{};thr=Math.max(thr,b(7).value||0);brk=Math.max(brk,b(6).value||0);
    abL=Math.max(abL,b(4).pressed?1:0);abR=Math.max(abR,b(5).pressed?1:0);boost=Math.max(boost,b(1).pressed?1:0);if(b(0).pressed&&!B.b0)pr.fire=true;if(b(2).pressed&&!B.b2&&Math.abs(ax)>.4)pr.roll=Math.sign(ax);
    if(b(9).pressed&&!B.b9&&state!=='roam')togglePause();B.b0=b(0).pressed;B.b2=b(2).pressed;B.b9=b(9).pressed}
  if(p===1?SP_S.st1>0:SP_S.st2>0)thr=boost=0;
  hb=state==='roam'&&(abL||abR)?1:0;if(mirror){steer=-steer;const t=abL;abL=abR;abR=t}
  return{steer,thr,brk,abL,abR,boost,hb,park:false}}
// ---- input: P2 keys never reach the game's own handlers while split-screen runs
const SP_live=()=>SP_S.on&&['race','countdown','finished','roam','results'].includes(state);
addEventListener('keydown',e=>{if(!SP_live()||!SP_P2K.has(e.code)||SP_S.res)return;e.preventDefault();e.stopImmediatePropagation();
  if(!e.repeat){if(e.code==='Enter'||e.code==='NumpadEnter')SP_S.pr2.fire=true;const d={ArrowLeft:-1,ArrowRight:1}[e.code];if(d){const now=performance.now();if(SP_S.tap[d]&&now-SP_S.tap[d]<280){SP_S.pr2.roll=d;SP_S.tap[d]=0}else SP_S.tap[d]=now}}
  SP_S.K2[e.code]=true},true);
addEventListener('keyup',e=>{if(SP_P2K.has(e.code))SP_S.K2[e.code]=false},true);
// ---- wrap the game: controls, AI step, race setup, traffic, results, menu
{const f0=ctlPlayer;ctlPlayer=(dtR)=>SP_S.on?SP_ctl(1):f0(dtR)}
{const f0=physAI;physAI=s=>{if(!s.SP_p2||s.finished||!SP_S.on)return f0(s);SP_padsPoll();const c=SP_ctl(2);if(s.stall>0){c.thr=0;s.stall-=H}const pr=pressed;pressed=SP_S.pr2;try{physPlayer(s,c)}finally{pressed=pr}
  if(SP_S.pr2.fire){SP_S.pr2.fire=false;if(s.item)useItem(s)}s.aiFire=99;s.bm=Math.min(100,s.bm+3*H);s.SP_c=c}}
{const f0=setupRace;setupRace=cfg=>{const sp=SP_S.on&&SP_S.mode==='race'&&cfg.type==='race';if(sp)cfg=Object.assign({},cfg,{traffic:Math.round((cfg.traffic||0)/2)});f0(cfg);if(sp)SP_addP2()}}
function SP_addP2(){const p1=pl;if(!p1)return;const ti=(TEAMS.indexOf(p1.team)+3+TEAMS.length)%TEAMS.length,team=TEAMS[ti<0?3:ti];
  if(!SP_S.ai)for(let i=ships.length-1;i>=0;i--){const s=ships[i];if(s!==p1){scene.remove(s.mesh);disposeTree(s.mesh,true);ships.splice(i,1)}}
  else{const i=ships.findIndex(s=>s!==p1&&Math.abs(s.dist-(p1.dist-8))<1&&Math.abs(s.x+p1.x)<1);if(i>=0){const s=ships[i];scene.remove(s.mesh);disposeTree(s.mesh,true);ships.splice(i,1)}}
  const s2=makeShip(team,false,'P2',1);s2.SP_p2=true;s2.dist=p1.dist;s2.x=-p1.x||8;s2.lives=1;s2.aiFire=99;ships.push(s2);SP_S.p2=s2;SP_S.snap2=true;SP_tag(p1.mesh,1);SP_tag(s2.mesh,2)}
function SP_tag(mesh,n){const c=document.createElement('canvas');c.width=128;c.height=64;const g=c.getContext('2d');g.fillStyle=n===1?'#2f7bff':'#ff2d55';g.beginPath();g.roundRect(14,6,100,52,26);g.fill();g.fillStyle='#fff';g.font='900 38px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillText('P'+n,64,33);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false,transparent:true}));sp.scale.set(3.2,1.6,1);sp.position.y=5.2;sp.renderOrder=9;sp.name='SP_tag';mesh.add(sp)}
{const f0=showResults;showResults=()=>{if(!SP_S.on||SP_S.mode!=='race')return f0();const p2=SP_S.p2;if(p2&&!p2.finished&&!p2.eliminated&&raceT-(pl.finishTime||raceT)<90){finishT=Math.min(finishT,4.4);return}SP_results()}}
{const f0=startRace;startRace=()=>{if(SP_S.on&&SP_S.mode==='race'){menuTab='quick';menuTrack=SP_S.trk||menuTrack}f0();if(SP_S.on&&SP_S.mode==='race'){SP_enterView();state==='countdown'&&say('2 PLAYERS',(SP_S.ai?'WITH AI':'HEAD TO HEAD'),1.6)}}}
{const f0=toMenu;toMenu=()=>{if(SP_S.on)SP_off();f0()}}
{const f0=buildMenu;buildMenu=()=>{f0();SP_btn()}}
{const f0=resize;resize=()=>{f0();if(SP_S.on)SP_layout()}}addEventListener('resize',()=>{if(SP_S.on)SP_layout()});
{const f0=addXP;addXP=(n,why)=>{if(SP_S.bt&&why==='traffic smash')SP_S.bt.sc[SP_S.who-1].tr++;return f0(n,why)}}
// ---- rendering: one scene, two viewports (scissor), own camera per player
const SP_cr0=composer.render.bind(composer);composer.render=function(d){if(!SP_S.on||!SP_S.cam2||!(SP_S.p2||SP_S.bt))return SP_cr0(d);SP_draw(d)};
function SP_rect(v){const w=innerWidth,h=innerHeight,side=w>=h;return side?[v*w/2,0,w/2,h]:[0,v?0:h/2,w,h/2]}
function SP_layout(){const r=SP_rect(0),pr=renderer.getPixelRatio();composer.setSize(r[2],r[3]);bloom.setSize(r[2]*pr*.5,r[3]*pr*.5);camera.aspect=r[2]/r[3];camera.updateProjectionMatrix();if(SP_S.cam2){SP_S.cam2.aspect=camera.aspect;SP_S.cam2.updateProjectionMatrix()}document.body.classList.toggle('SP_stack',innerWidth<innerHeight)}
function SP_draw(d){const now=performance.now(),gap=now-(SP_S.lt||0),dt=Math.min(.05,Math.max(.001,gap/1000));if(gap>500)SP_S.snap2=true;SP_S.lt=now;try{SP_cam2Update(dt)}catch(e){console.warn(e)}
  const rp=composer.passes[0],au=renderer.shadowMap.autoUpdate;renderer.setScissorTest(true);
  try{for(let v=0;v<2;v++){const r=SP_rect(v);renderer.setViewport(...r);renderer.setScissor(...r);rp.camera=v?SP_S.cam2:camera;if(v)renderer.shadowMap.autoUpdate=false;SP_cr0(d)}}
  finally{renderer.shadowMap.autoUpdate=au;rp.camera=camera;renderer.setScissorTest(false);renderer.setViewport(0,0,innerWidth,innerHeight)}}
function SP_cam2Update(dt){const C=camera,c2=SP_S.cam2;c2.near=C.near;c2.far=C.far;
  const sv={p:C.position.clone(),q:C.quaternion.clone(),up:C.up.clone(),fov:C.fov,fk:fovKick,sh:shake,mp:moonL.position.clone(),kp:shipKey.position.clone(),mt:moonL.target.position.clone(),uS:FX.uniforms.uSpeed.value,uB:FX.uniforms.uBoost.value,slo:speedLines.mesh.material.opacity};
  if(SP_S.bt){const P=SP_S.bt.r2,ro={},p1=pl,cs=camSnap;for(const f of SP_RF)ro[f]=RO[f];for(const f of SP_RF)RO[f]=P[f];pl=SP_S.bt.s2;camSnap=SP_S.snap2;if(SP_S.c2)C.position.copy(SP_S.c2.p);C.fov=SP_S.c2?SP_S.c2.fov:C.fov;shake=SP_S.bt.sh2||0;
    try{roamCam(dt)}finally{for(const f of ['camH','camL','camR'])P[f]=RO[f];for(const f of SP_RF)RO[f]=ro[f];pl=p1;camSnap=cs;SP_S.snap2=false}}
  else{const p1=pl,st=[camPos.clone(),camLat.clone(),camLook.clone(),camUp.clone()];if(SP_S.c2){camPos.copy(SP_S.c2.cp);camLat.copy(SP_S.c2.cl);camLook.copy(SP_S.c2.ck);camUp.copy(SP_S.c2.cu);C.fov=SP_S.c2.fov}pl=SP_S.p2;
    try{updateCam(dt,SP_S.snap2)}finally{pl=p1;SP_S.snap2=false;SP_S.c2={cp:camPos.clone(),cl:camLat.clone(),ck:camLook.clone(),cu:camUp.clone()};camPos.copy(st[0]);camLat.copy(st[1]);camLook.copy(st[2]);camUp.copy(st[3])}}
  SP_S.c2=Object.assign(SP_S.c2||{},{p:C.position.clone(),fov:C.fov});c2.position.copy(C.position);c2.quaternion.copy(C.quaternion);c2.up.copy(C.up);c2.fov=C.fov;c2.aspect=C.aspect;c2.updateProjectionMatrix();c2.updateMatrixWorld();
  C.position.copy(sv.p);C.quaternion.copy(sv.q);C.up.copy(sv.up);C.fov=sv.fov;C.updateProjectionMatrix();C.updateMatrixWorld();fovKick=sv.fk;shake=sv.sh;moonL.position.copy(sv.mp);shipKey.position.copy(sv.kp);moonL.target.position.copy(sv.mt);moonL.target.updateMatrixWorld();
  FX.uniforms.uSpeed.value=sv.uS;FX.uniforms.uBoost.value=sv.uB;speedLines.mesh.material.opacity=sv.slo}
// split mode on: halve the shadow map, force dynamic resolution, own camera
function SP_enterView(){if(!SP_S.cam2)SP_S.cam2=new THREE.PerspectiveCamera(64,1,.4,9000);if(!SP_S.sv.dres){SP_S.sv.dres=SET.dres;SET.dres='on';DRES.s=Math.min(DRES.s,.85)}
  if(!SP_S.sv.sm){SP_S.sv.sm=moonL.shadow.mapSize.x;moonL.shadow.mapSize.set(SP_S.sv.sm/2,SP_S.sv.sm/2);if(moonL.shadow.map){moonL.shadow.map.dispose();moonL.shadow.map=null}}
  SP_S.c2=null;SP_S.snap2=true;SP_S.res=false;SP_S.K2={};SP_S.pr2={};document.body.classList.add('SP_on');$('#SP_res').hidden=true;$('#SP_h').hidden=false;resize()}
function SP_off(){const B=SP_S.bt;if(B){if(B.s2&&B.s2.mesh){scene.remove(B.s2.mesh);disposeTree(B.s2.mesh,true)}for(const c of B.hid)c.dead=.01;if(pl&&pl.mesh)pl.mesh.remove(pl.mesh.getObjectByName('SP_tag'));RO.cool=1.5;RO.popCd=40;RO.frozen=false}
  SP_S.bt=null;SP_S.on=false;SP_S.mode=null;SP_S.p2=null;SP_S.res=false;document.body.classList.remove('SP_on','SP_stack');$('#SP_h').hidden=true;$('#SP_res').hidden=true;
  if(SP_S.sv.dres){SET.dres=SP_S.sv.dres;if(SET.dres!=='on')DRES.s=1}if(SP_S.sv.sm){moonL.shadow.mapSize.set(SP_S.sv.sm,SP_S.sv.sm);if(moonL.shadow.map){moonL.shadow.map.dispose();moonL.shadow.map=null}}SP_S.sv={};resize()}
// ---- Smash Battle: free roam in Frankfurt, most smash points in 3 minutes
async function SP_battle(){SP_S.on=true;SP_S.mode='battle';await enterRoam();await new Promise(r=>{const w=()=>state==='roam'?r():setTimeout(w,50);w()});try{storyClose()}catch(e){}try{window.__m1&&__m1.skip&&__m1.skip()}catch(e){}SP_battleInit()}
function SP_battleInit(){const old=SP_S.bt;if(old&&old.s2){scene.remove(old.s2.mesh);disposeTree(old.s2.mesh,true)}
  const p1=pl,ti=(TEAMS.indexOf(p1.team)+3+TEAMS.length)%TEAMS.length,s2=makeShip(TEAMS[ti<0?3:ti],false,'P2',1);s2.bm=40;
  const fx=Math.sin(RO.h),fz=Math.cos(RO.h);let px=RO.x,pz=RO.z;for(const o of[[6,0],[-6,0],[0,-9],[6,-9],[-6,-9],[0,9]]){const x=RO.x+fz*o[0]+fx*o[1],z=RO.z-fx*o[0]+fz*o[1];if(!roamHit(x,z,2.4,RO.y)&&!roamTerr(x,z,RO.y+.3).low){px=x;pz=z;break}}
  const r2={x:px,z:pz,y:groundAt(px,pz,RO.y+2),h:RO.h,vh:RO.h,v:0,vy:0,yr:0,dDir:0,dT:0,landK:0,camH:null,camL:null,camR:0,hp:100,inv:0,turbo:0};
  const hid=old?old.hid:HUB.cars.filter((c,i)=>i%2&&!(c.dead>0));for(const c of hid)c.dead=1e9;
  SP_S.bt={t:SP_BATTLE_T,s2,r2,sc:[{pr:0,tr:0,td:0},{pr:0,tr:0,td:0}],hid,tdCd:0,sh2:0,end:false};SP_S.st1=SP_S.st2=0;RO.v=0;RO.frozen=false;RO.hp=100;
  if(old)for(const c of HUB.cars)if(c.dead>0&&c.dead<1e8)c.dead=.01;
  if(!p1.mesh.getObjectByName('SP_tag'))SP_tag(p1.mesh,1);SP_tag(s2.mesh,2);SP_enterView();say('SMASH BATTLE','MOST SMASHES & TAKEDOWNS IN 3:00',2.2)}
const SP_pts=s=>s.pr+s.tr*3+s.td*10;
function SP_p2Step(dt){const B=SP_S.bt,P=B.r2,s=B.s2;SP_padsPoll();const c=SP_ctl(2),busy=B.end;SP_S.st2=Math.max(0,SP_S.st2-dt);
  const T0=roamTerr(P.x,P.z,P.y+.3),air=P.y>T0.g+.5,top=(RO.top||60),boost=c.boost&&s.bm>1&&!busy;s.nitro=boost||P.turbo>0;P.turbo=Math.max(0,P.turbo-dt);
  if(boost)s.bm=Math.max(0,s.bm-22*dt);else s.bm=Math.min(100,s.bm+7*dt);
  if(SP_S.pr2.fire){SP_S.pr2.fire=false;if(!air&&P.vy<=0&&!busy){P.vy=12;P.y+=.05;AU.sfx('launch')}}SP_S.pr2.roll=0;
  if(busy)P.v*=Math.max(0,1-dt*4);else if(!air){const tt=top*.66*(boost?1.45:1)*(P.turbo>0?1.2:1);if(c.thr||boost)P.v+=(s.stats.acc*1.15*Math.max(0,1-P.v/tt)+(boost?20:0))*dt;else P.v-=P.v*.4*dt;
    if(c.brk){if(P.v>0)P.v=Math.max(0,P.v-75*dt);else P.v-=22*dt}P.v=Math.max(-18,P.v);if(P.v>tt)P.v-=(P.v-tt)*1.5*dt}
  const sp=Math.abs(P.v),vr=clamp(sp/Math.max(30,top),0,1),maxR=(2.5-1.3*vr)*(air?.45:1)*Math.max(.6,clamp(sp/9,0,1)),hbOk=c.hb&&!air&&sp>22;
  if(hbOk&&!P.dDir&&Math.abs(c.steer)>.2){P.dDir=Math.sign(c.steer);P.dT=0}if(P.dDir&&!hbOk){if(P.dT>.5){P.turbo=Math.max(P.turbo,P.dT>1.1?1.3:.8);s.bm=Math.min(100,s.bm+8)}P.dDir=0;P.dT=0}
  let ytg=-c.steer*maxR*Math.sign(P.v||1);if(P.dDir){ytg=-P.dDir*maxR*(1.5+.6*clamp(c.steer*P.dDir,-1,1));P.dT+=dt}
  P.yr+=(ytg-P.yr)*Math.min(1,dt*(c.steer||P.dDir?14:18));P.h+=P.yr*dt;P.vh+=angDiff(P.h,P.vh)*Math.min(1,dt*(air?.6:P.dDir?2:13));
  let nx=P.x+Math.sin(P.vh)*P.v*dt,nz=P.z+Math.cos(P.vh)*P.v*dt;const N=roamTerr(nx,nz,P.y+.3);
  if(N.low||(N.g>P.y+1.4&&!air&&!RO.ramps.some(r=>Math.hypot(nx-r.x,nz-r.z)<r.len))){nx=P.x;nz=P.z;P.v*=-.25}else if(N.g>P.y+1.4){P.y=N.g}
  const hb=roamHit(nx,nz,2.2,P.y);if(hb){const pp=bldPush(hb,nx,nz,2.2);nx=pp[0];nz=pp[1];if(sp>20){P.v*=.7;burst(SPARK,V3(nx,P.y+1.5,nz),6,14,.3,new THREE.Color(2,1.4,.6))}}
  P.x=clamp(nx,WX0+10,WX1-10);P.z=clamp(nz,WZS+10,WZN-10);const g2=groundAt(P.x,P.z,P.y+.3);
  if(P.y>g2+.05||P.vy>0){P.vy-=30*dt;P.y+=P.vy*dt;if(P.y<=g2){P.landK=Math.min(1,-P.vy/22);P.y=g2;P.vy=0}}else if(g2-P.y<1.6)P.y+=(g2-P.y)*Math.min(1,dt*14);else P.y=g2;
  s.air=P.y>g2+1.2?{vy:P.vy}:null;s.v=sp;s.dist=0;
  // smashes: props through the game's own check (with P2 swapped in), traffic here
  const ro={},p1=pl,ctl=CTL,h0=HUB.smashed,cb=CB.n;for(const f of SP_RF)ro[f]=RO[f];for(const f of SP_RF)RO[f]=P[f];pl=s;CTL=c;SP_S.who=2;
  try{if(!busy)smashCheck(dt);roamPose(s,dt)}finally{for(const f of SP_RF)P[f]=RO[f];for(const f of SP_RF)RO[f]=ro[f];pl=p1;CTL=ctl;SP_S.who=1;CB.n=cb}
  B.sc[1].pr+=HUB.smashed-h0;
  if(!busy&&sp>10)for(const k of HUB.cars){if(k.dead>0||k.x==null)continue;if(Math.abs(k.x-P.x)>5||Math.abs(k.z-P.z)>5||Math.abs((k.y||0)-P.y)>3||Math.hypot(k.x-P.x,k.z-P.z)>=5)continue;
    k.dead=25;const at=V3(k.x,(k.y||0)+1.5,k.z),f2=V3(Math.sin(P.vh),0,Math.cos(P.vh));debris(at,V3(0,9,0).addScaledVector(f2,sp*.5),18,[new THREE.Color('#d8302a'),new THREE.Color('#22252f'),new THREE.Color('#d0e8ff')],1.1,k.y||0);
    P.v*=s.nitro?.95:.85;s.bm=Math.min(100,s.bm+12);B.sc[1].tr++;B.sh2=.4;AU.sfx('crash')}
  B.sh2=Math.max(0,(B.sh2||0)-dt*3)}
// player vs player: the faster car (boosting or 15 km/h quicker) scores a takedown; the victim spins out for 1.5 s
function SP_duel(dt){const B=SP_S.bt,P=B.r2;B.tdCd=Math.max(0,B.tdCd-dt);const dx=P.x-RO.x,dz=P.z-RO.z,d=Math.hypot(dx,dz);if(d>=4.6||Math.abs(P.y-RO.y)>3||d<1e-3)return;
  const push=(4.6-d)/2,ux=dx/d,uz=dz/d;P.x+=ux*push;P.z+=uz*push;RO.x-=ux*push;RO.z-=uz*push;if(B.tdCd>0||B.end)return;
  const v1=Math.abs(RO.v),v2=Math.abs(P.v),b1=!!(pl&&pl.nitro),b2=!!B.s2.nitro;let w=0;if(v1>18&&(b1||v1-v2>4)&&v1>=v2)w=1;else if(v2>18&&(b2||v2-v1>4)&&v2>v1)w=2;if(!w)return;
  B.tdCd=1.6;B.sc[w-1].td++;const at=V3((RO.x+P.x)/2,RO.y+1.6,(RO.z+P.z)/2);burst(SPARK,at,40,24,.6,new THREE.Color(2.6,1.4,.4));AU.sfx('takedown');
  if(w===1){P.v=-6;P.yr=7;SP_S.st2=1.5;feed('P1 TAKEDOWN',1000,'#2f7bff')}else{RO.v=-6;RO.yr=7;SP_S.st1=1.5;feed('P2 TAKEDOWN',1000,'#ff2d55');shake=.5}}
{const f0=roamStep;roamStep=dt=>{const B=SP_S.bt;if(!SP_S.on||!B)return f0(dt);RO.cool=999;RO.popCd=999;SP_S.st1=Math.max(0,(SP_S.st1||0)-dt);SP_padsPoll();const h0=HUB.smashed;SP_S.who=1;f0(dt);B.sc[0].pr+=HUB.smashed-h0;
  SP_p2Step(dt);SP_duel(dt);if(!B.end){B.t-=dt;if(B.t<=0){B.t=0;B.end=true;RO.frozen=true;AU.sfx('finish');say('TIME!','',1.6);setTimeout(()=>{if(SP_S.bt===B)SP_results()},1200)}}}}
// ---- HUD per player
function SP_hud(){if(!SP_S.on)return;const B=SP_S.bt,mph=SET.units==='mph',u=mph?'MPH':'KPH',k=mph?2.237:3.6;
  const pp=B?[{v:Math.abs(RO.v),bm:pl?pl.bm:0,n:pl&&pl.nitro},{v:Math.abs(B.r2.v),bm:B.s2.bm,n:B.s2.nitro}]:[pl,SP_S.p2].map(s=>s&&{v:s.v,bm:s.bm,n:s.nitro,s});if(!pp[0]||!pp[1])return;const n=ships.filter(active).length;
  for(let i=0;i<2;i++){const q=pp[i],el=SP_S.hd[i];huT(el.spd,String(Math.round(q.v*k)).padStart(3,'0'));huT(el.u,u);huS(el.bar,'width',Math.round(q.bm)+'%');el.root.classList.toggle('nitro',!!q.n);
    if(B){const sc=B.sc[i];huT(el.a,SP_pts(sc)+' PTS');huT(el.b,`${sc.pr+sc.tr} SMASHES · ${sc.td} TAKEDOWNS`)}
    else{const s=q.s;huT(el.a,s.finished?'FINISHED':`POS ${s.place} / ${n}`);huT(el.b,`LAP ${clamp(s.lap+1,1,RC.laps)} / ${RC.laps}`)}}
  const t=$('#SP_t');if(B){t.hidden=false;huT(t,`${Math.floor(B.t/60)}:${pad2(Math.floor(B.t%60))}`)}else t.hidden=true}
{const f0=frame;frame=now=>{f0(now);if(SP_S.on&&!SP_S.res)try{SP_hud()}catch(e){}}}
// ---- results
function SP_results(){if(SP_S.res)return;SP_S.res=true;const B=SP_S.bt,el=$('#SP_res'),cols=['#2f7bff','#ff2d55'];let rows,win;
  if(B){RO.frozen=true;const P=B.sc.map(SP_pts);win=P[0]===P[1]?0:P[0]>P[1]?1:2;rows=B.sc.map((s,i)=>[[`${P[i]}`,'POINTS'],[s.pr,'PROPS SMASHED'],[s.tr,'TRAFFIC WRECKED'],[s.td,'TAKEDOWNS']])}
  else{state='results';$('#hud').hidden=true;const P=[pl,SP_S.p2];lapLogic();win=P[0].place<P[1].place?1:2;rows=P.map(s=>[[s.finished?ord(s.place):'DNF','PLACE'],[s.finished?fmt(s.finishTime):'—','TIME'],[isFinite(s.best)?fmt(s.best):'—','BEST LAP'],[s.takedowns||0,'TAKEDOWNS']])}
  $('#SP_rt').textContent=win?`PLAYER ${win} WINS`:'DRAW';$('#SP_rt').style.color=win?cols[win-1]:'#fff';$('#SP_rs').textContent=B?'SMASH BATTLE · FRANKFURT':`RACE · ${TRK.name}${SP_S.ai?' · WITH AI':''}`;
  $('#SP_rc').innerHTML=rows.map((r,i)=>`<div class="SP_card${win===i+1?' win':''}" style="--c:${cols[i]}"><h4>PLAYER ${i+1}${win===i+1?' 🏆':''}</h4>${r.map(([v,l])=>`<div><b>${v}</b><span>${l}</span></div>`).join('')}</div>`).join('');
  el.hidden=false;$('#SP_h').hidden=true;$('#SP_again').focus({preventScroll:true})}
function SP_rematch(){$('#SP_res').hidden=true;SP_S.res=false;if(SP_S.mode==='battle')SP_battleInit();else startRace()}
function SP_menu(){const roam=state==='roam'||!!SP_S.bt;SP_off();if(roam)exitRoam();else toMenu()}
// ---- setup screen + menu entry
function SP_btn(){let b=$('#SP_btn');if(!b){b=document.createElement('button');b.id='SP_btn';b.className='ghost';b.textContent='2 PLAYERS';b.title='Local split-screen for two players';b.onclick=()=>SP_open();const st=$('#startBtn');st.after(b)}b.hidden=menuTab!=='quick'}
function SP_open(){if(!SP_okW())return;const el=$('#SP_set');SP_S.trk=menuTrack;SP_S.m=SP_S.m||'race';SP_fill();el.hidden=false}
function SP_fill(){const tr=[...TDF,...(athOpen()?ATH_TRACKS:[])],np=SP_padsPoll();
  $('#SP_mode').innerHTML=[['race','RACE'],['battle','SMASH BATTLE']].map(([k,l])=>`<button data-k="${k}" aria-pressed="${SP_S.m===k}"${k==='battle'&&CID!=='fra'?' disabled title="Frankfurt only"':''}>${l}</button>`).join('');
  $('#SP_mode').querySelectorAll('button').forEach(b=>b.onclick=()=>{SP_S.m=b.dataset.k;SP_fill()});
  $('#SP_trk').innerHTML=tr.map(t=>`<option value="${t.id}"${t.id===SP_S.trk?' selected':''}>${t.short||t.name}</option>`).join('');$('#SP_trk').onchange=e=>SP_S.trk=e.target.value;
  $('#SP_ai').checked=SP_S.ai;$('#SP_ai').onchange=e=>SP_S.ai=e.target.checked;$('#SP_rw').hidden=SP_S.m!=='race';
  $('#SP_desc').textContent=SP_S.m==='race'?'Race on any circuit. First across the line after the last lap wins.':'3 minutes in Frankfurt free roam. Props 1 pt · traffic 3 pts · ramming the other player while boosting = takedown 10 pts.';
  $('#SP_pads').textContent=np?`🎮 ${np} gamepad${np>1?'s':''}: ${np>1?'pad 1 → P1, pad 2 → P2':'pad 1 → P2'}`:'🎮 No gamepad: press a button on a pad to connect (1 pad → P2, 2 pads → P1 + P2)'}
addEventListener('gamepadconnected',()=>{if(!$('#SP_set').hidden)SP_fill()});
function SP_go(){$('#SP_set').hidden=true;SP_S.on=true;SP_S.mode=SP_S.m;SP_S.res=false;if(SP_S.m==='battle'){homeShow&&homeShow(false);return SP_battle()}homeShow&&homeShow(false);startRace()}
{const st=document.createElement('style');st.textContent=`
#SP_btn{margin-left:8px}@media (max-width:699px){#SP_btn{display:none!important}}
#SP_set,#SP_res{position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;background:rgba(8,6,20,.82);font:600 15px system-ui,sans-serif;color:#fff}#SP_set[hidden],#SP_res[hidden],#SP_h[hidden],#SP_t[hidden]{display:none!important}
.SP_box{background:#15122a;border:2px solid #ffd400;border-radius:18px;padding:22px 26px;max-width:860px;width:calc(100% - 32px);box-shadow:0 10px 50px #000a}.SP_box h2{margin:0 0 4px;font:900 32px system-ui;letter-spacing:.04em;color:#ffd400}.SP_box p{opacity:.75;margin:4px 0 14px}
.SP_seg{display:flex;gap:8px;margin:8px 0}.SP_seg button,.SP_box .SP_b{font:800 15px system-ui;padding:10px 18px;border-radius:12px;border:2px solid #fff3;background:#221d40;color:#fff;cursor:pointer}.SP_seg button[aria-pressed=true]{background:#ffd400;color:#111;border-color:#ffd400}.SP_seg button:disabled{opacity:.4}
.SP_box .SP_b.go{background:#ffd400;color:#111;border-color:#ffd400}.SP_row{display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin:10px 0}.SP_row select{font:700 15px system-ui;padding:8px;border-radius:10px;background:#221d40;color:#fff;border:2px solid #fff3}
.SP_keys{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:14px 0}.SP_kc{border-radius:14px;padding:12px 14px;background:#0d0b1c;border:2px solid var(--c)}.SP_kc h4{margin:0 0 8px;color:var(--c);font:900 18px system-ui}
.SP_kc div{display:flex;justify-content:space-between;margin:4px 0;font-size:13px}.SP_kc kbd{font:800 12px ui-monospace,monospace;background:#fff;color:#111;border-radius:5px;padding:2px 6px;margin-left:3px;box-shadow:0 2px 0 #999}
#SP_h{position:fixed;inset:0;pointer-events:none;z-index:20}.SP_v{position:absolute;font:800 14px system-ui;color:#fff;text-shadow:0 2px 4px #000}.SP_v .sp{font:900 40px system-ui;line-height:1}.SP_v .sp small{font-size:13px;margin-left:4px;opacity:.8}
.SP_v .a{font:900 20px system-ui;color:var(--c)}.SP_v .bb{width:180px;height:10px;border-radius:5px;background:#0008;border:2px solid #fff6;margin-top:4px;overflow:hidden}.SP_v .bb i{display:block;height:100%;background:linear-gradient(90deg,#4ceaff,#c46bff);width:0}.SP_v.nitro .bb i{background:#ffd400}
.SP_v .tag{display:inline-block;background:var(--c);border-radius:8px;padding:1px 8px;margin-bottom:4px}
#SP_v1{left:16px;bottom:16px}#SP_v2{left:calc(50% + 16px);bottom:16px}body.SP_stack #SP_v1{left:16px;bottom:calc(50% + 12px)}body.SP_stack #SP_v2{left:16px;bottom:16px}
#SP_div{position:absolute;left:calc(50% - 2px);top:0;bottom:0;width:4px;background:#0b0918}body.SP_stack #SP_div{left:0;right:0;top:calc(50% - 2px);bottom:auto;width:auto;height:4px}
#SP_t{position:absolute;left:50%;top:12px;transform:translateX(-50%);font:900 30px system-ui;background:#0b0918;border:2px solid #ffd400;border-radius:12px;padding:2px 14px;color:#ffd400}
body.SP_on #hud,body.SP_on #touch,body.SP_on #m1Next,body.SP_on #roam>:not(#roamPause):not(#warpFade):not(#roamExit){display:none!important}
.SP_cards{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:14px 0}.SP_card{border:2px solid var(--c);border-radius:14px;padding:12px 16px;background:#0d0b1c}.SP_card.win{box-shadow:0 0 0 3px #ffd400}.SP_card h4{margin:0 0 6px;color:var(--c);font:900 20px system-ui}
.SP_card div{display:flex;justify-content:space-between;align-items:baseline;margin:5px 0}.SP_card b{font:900 24px system-ui}.SP_card span{opacity:.7;font-size:12px;letter-spacing:.06em}`;document.head.appendChild(st);
 const kc=(n,c,rows)=>`<div class="SP_kc" style="--c:${c}"><h4>PLAYER ${n}</h4>${rows.map(([l,k])=>`<div><span>${l}</span><span>${k.map(x=>`<kbd>${x}</kbd>`).join('')}</span></div>`).join('')}</div>`;
 const d=document.createElement('div');d.id='SP_set';d.hidden=true;d.innerHTML=`<div class="SP_box" role="dialog" aria-label="2 players"><h2>2 PLAYERS</h2><p>Split-screen on one keyboard, or with gamepads.</p>
  <div class="SP_seg" id="SP_mode"></div><div class="SP_row" id="SP_rw"><label>Circuit <select id="SP_trk"></select></label><label><input type="checkbox" id="SP_ai"> AI fill (6 rivals)</label></div><p id="SP_desc"></p>
  <div class="SP_keys">${kc(1,'#2f7bff',[['Steer / gas / brake',['W','A','S','D']],['Weapon (race) · hop (battle)',['Space']],['Boost',['L-Shift']],['Airbrake / drift',['Q','E']]])}${kc(2,'#ff2d55',[['Steer / gas / brake',['↑','←','↓','→']],['Weapon (race) · hop (battle)',['Enter']],['Boost',['R-Shift']],['Airbrake / drift',[',','.']]])}</div>
  <p id="SP_pads"></p><div class="SP_row"><button class="SP_b go" id="SP_goB">START</button><button class="SP_b" id="SP_back">BACK</button></div></div>`;document.body.appendChild(d);
 const r=document.createElement('div');r.id='SP_res';r.hidden=true;r.innerHTML=`<div class="SP_box"><h2 id="SP_rt"></h2><p id="SP_rs"></p><div class="SP_cards" id="SP_rc"></div><div class="SP_row"><button class="SP_b go" id="SP_again">REMATCH</button><button class="SP_b" id="SP_menuB">MENU</button></div></div>`;document.body.appendChild(r);
 const h=document.createElement('div');h.id='SP_h';h.hidden=true;h.innerHTML=`<div id="SP_div"></div><div id="SP_t" hidden></div>`+[1,2].map(n=>`<div class="SP_v" id="SP_v${n}" style="--c:${n===1?'#2f7bff':'#ff2d55'}"><span class="tag">P${n}</span><div class="a"></div><div class="b"></div><div class="sp"><span>000</span><small>KPH</small></div><div class="bb"><i></i></div></div>`).join('');document.body.appendChild(h);
 SP_S.hd=[1,2].map(n=>{const v=$('#SP_v'+n);return{root:v,a:v.querySelector('.a'),b:v.querySelector('.b'),spd:v.querySelector('.sp span'),u:v.querySelector('.sp small'),bar:v.querySelector('.bb i')}});
 $('#SP_goB').onclick=SP_go;$('#SP_back').onclick=()=>{$('#SP_set').hidden=true};$('#SP_again').onclick=SP_rematch;$('#SP_menuB').onclick=SP_menu;
 addEventListener('keydown',e=>{if(!$('#SP_set').hidden&&e.code==='Escape'){e.stopImmediatePropagation();$('#SP_set').hidden=true}},true)}
window.__SP={S:SP_S,open:SP_open,go:SP_go,start:(o={})=>{Object.assign(SP_S,{m:o.mode||'race',trk:o.trk||menuTrack,ai:o.ai!==false});return SP_go()},results:SP_results,rematch:SP_rematch,menu:SP_menu,ctl:SP_ctl,pts:SP_pts,
  get p2(){return SP_S.p2},get bt(){return SP_S.bt},get pl(){return pl},hub:()=>HUB,
  // draw calls of one rendered frame: split (both viewports) vs the same frame drawn single-screen
  measure(){const inf=renderer.info,ar=inf.autoReset;inf.autoReset=false;const one=f=>{inf.reset();f();return inf.render.calls};
    try{const on=SP_S.on;SP_S.on=false;resize();const single=one(()=>SP_cr0());SP_S.on=on;resize();const split=one(()=>SP_draw());return{single,split,k:+(split/single).toFixed(3)}}finally{inf.autoReset=ar;inf.reset()}}};
