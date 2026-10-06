exec(open('P.py').read())
# pCAR26: weighty car model shared by the city car, the race player and the race AI.
#  - throttle / brake ramps (no instant full force), softer coast-down (momentum), city brake 75 -> 22 m/s^2
#  - grip-limited yaw: demanded yaw rate vs front-axle grip mu/v through a slip curve (progressive knee, mild fall-off
#    past the peak = understeer when pushed), speed-sensitive yaw inertia
#  - velocity heading follows the body only as fast as rear grip allows (momentum through corners); load transfer:
#    braking moves grip to the front (light drift when braking hard into a turn), throttle to the rear; self-aligning
#    beyond ~6 deg of slip so it never snaps; tyre scrub slows a sliding car
#  - body pitch / roll on a spring-damper (visible suspension), wheels stay planted (city + race, player + AI)

# ---------- shared model (top of the module, before physPlayer) ----------
R("function physPlayer(s,c){const st=s.stats;",
"""const C26={on:1,muCity:{road:15,dirt:9,water:5.5},muOff:1.18,muRace:30,brkCity:13,thUp:3.2,thDn:8,bkUp:4,bkDn:10,kF:.18,kR:.38,kT:.08,fall:.14,align:2.2,scrub:1.4,pK:.0036,rK:.0034,pMax:.065,rMax:.07,w:11,z:.42,aiMu:.9};
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
function physPlayer(s,c){const st=s.stats;""")

# ---------- race player ----------
# the touch assist must know the grip limit, or it drives into corners the tyres cannot take
R("need=kA*s.v,kL=kAt(TD,s.dist+12),cap=Rm+(s.v>st.top0*.3?.5*st.han:0);",
  "need=kA*s.v,kL=kAt(TD,s.dist+12),cap=Math.min(Rm+(s.v>st.top0*.3?.5*st.han:0),C26.on?C26_muRace(s)*.95/Math.max(1,s.v):9);")
R("s.yawRate+=(target-s.yawRate)*Math.min(1,H*(s.hbDir?10:s.asst?30:20));",
  "target=C26_raceYaw(s,target,H);s.yawRate+=(target-s.yawRate)*Math.min(1,H*(s.hbDir?10:s.asst?(C26.on?18:30):(C26.on?11:20)));")
R("let a=0;if(!s.air){if(c.thr>0)a+=st.acc*c.thr*Math.max(0,1-Math.pow(s.v/top,3));if(s.v>top)a-=(s.v-top)*1.2;if(c.brk>0)a-=st.brake*c.brk;",
  "C26_ramp(s,C26.on?c:{thr:c.thr,brk:c.brk},C26.on?H:1);let a=0;if(!s.air){if(s.thA>0)a+=st.acc*s.thA*Math.max(0,1-Math.pow(s.v/top,3));if(s.v>top)a-=(s.v-top)*1.2;if(s.bkA>0)a-=st.brake*s.bkA;")
R("s.beta+=(s.yaw-s.beta)*Math.min(1,grip*(s.boatMode?.62:s.dirtMode?.75:1)*H);",
  "C26_raceBeta(s,grip*(s.boatMode?.62:s.dirtMode?.75:1),H,!!s.hbDir||ab>0);")

# ---------- race AI: same model, driven by a controller (steer / throttle / brake) ----------
R("for(let d=10;d<look;d+=12){const kk=Math.abs(kAt(TD,s.dist+d));const vc=Math.sqrt(AI_LAT*sk*st.han*cls.mul/Math.max(kk,1e-5));",
  "const aiLat=C26.on?C26_muRace(s)*C26.aiMu*(.9+.1*sk):AI_LAT*sk*st.han*cls.mul;for(let d=10;d<look;d+=12){const kk=Math.abs(kAt(TD,s.dist+d));const vc=Math.sqrt(aiLat/Math.max(kk,1e-5));")
R("""  if(s.v<vmax)s.v+=st.acc*sk*Math.max(.15,1-s.v/(st.top*1.05))*H+(s.boost>0?5*H:0)+(s.nitro?7.5*cls.mul*H:0);else s.v=Math.max(vmax,s.v-AI_BRK*cls.mul*H);
  const px=s.x,lat=(s.attackT>0?14:9)*cls.mul;if(s.crXT==null||Math.abs(s.crXT-s.x)>20){s.crXT=s.x;s.crLV=0}s.crXT+=(xt-s.crXT)*Math.min(1,H*(s.attackT>0?8:3));const dvx=clamp((s.crXT-s.x)*2.5,-lat,lat);s.crLV=(s.crLV||0)+clamp(dvx-(s.crLV||0),-30*H,30*H);s.x=clamp(s.x+s.crLV*H,-MARGIN,MARGIN);
  const ds=s.v*H/Math.max(.35,1-k*s.x);s.dist+=ds;s.latV=(s.x-px)/H;s.yaw=Math.atan2(s.latV,Math.max(1,s.v));s.beta=s.yaw;""",
"""  if(!C26.on){if(s.v<vmax)s.v+=st.acc*sk*Math.max(.15,1-s.v/(st.top*1.05))*H+(s.boost>0?5*H:0)+(s.nitro?7.5*cls.mul*H:0);else s.v=Math.max(vmax,s.v-AI_BRK*cls.mul*H);
  const px=s.x,lat=(s.attackT>0?14:9)*cls.mul;if(s.crXT==null||Math.abs(s.crXT-s.x)>20){s.crXT=s.x;s.crLV=0}s.crXT+=(xt-s.crXT)*Math.min(1,H*(s.attackT>0?8:3));const dvx=clamp((s.crXT-s.x)*2.5,-lat,lat);s.crLV=(s.crLV||0)+clamp(dvx-(s.crLV||0),-30*H,30*H);s.x=clamp(s.x+s.crLV*H,-MARGIN,MARGIN);
  const ds=s.v*H/Math.max(.35,1-k*s.x);s.dist+=ds;s.latV=(s.x-px)/H;s.yaw=Math.atan2(s.latV,Math.max(1,s.v));s.beta=s.yaw}else C26_aiDrive(s,k,vmax,xt,sk);""")
R("function physAI(s){",
"""// AI on the shared model: throttle/brake toward the corner speed, steering toward the line; same ramps, grip and slip
function C26_aiDrive(s,k,vmax,xt,sk){const st=s.stats,px=s.x;if(s.crXT==null||Math.abs(s.crXT-s.x)>20)s.crXT=s.x;s.crXT+=(xt-s.crXT)*Math.min(1,H*(s.attackT>0?8:3));
  const c={thr:s.v<vmax-.4?1:s.v<vmax?.4:0,brk:s.v>vmax+.6?clamp((s.v-vmax)/3,.25,1):0};C26_ramp(s,c,H);
  if(!s.air){const top=st.top*1.05;let a=s.thA*(st.acc*sk*Math.max(.15,1-s.v/top)+(s.boost>0?5:0)+(s.nitro?7.5*cls.mul:0))-s.bkA*Math.max(st.brake,AI_BRK*cls.mul);if(s.v>top)a-=(s.v-top)*1.2;s.v=Math.max(0,s.v+a*H)}else s.v-=.004*s.v*H;
  const sp=Math.max(4,s.v),vr=Math.min(1,s.v/st.top0),Rmax=(1.32-.52*vr)*st.han,desB=clamp(Math.atan2((s.crXT-s.x)*(s.attackT>0?2.2:1.5),sp),-.22,.22);
  let target=clamp(k*s.v+(desB-s.beta)*5.5,-Rmax,Rmax);target=C26_raceYaw(s,target,H);s.yawRate+=(target-s.yawRate)*Math.min(1,H*11);
  s.yaw+=s.yawRate*H;C26_raceBeta(s,12*st.han*(s.boatMode?.62:s.dirtMode?.75:1),H,false);const sl=Math.sin(s.yaw-s.beta);s.v-=s.v*sl*sl*3*H;
  const ds=s.v*Math.cos(s.beta)*H/Math.max(.35,1-k*s.x);s.x+=s.v*Math.sin(s.beta)*H;s.dist+=ds;s.yaw-=k*ds;s.beta-=k*ds;s.yaw=clamp(s.yaw,-1.2,1.2);s.beta=clamp(s.beta,-1.2,1.2);
  if(Math.abs(s.x)>MARGIN){const sg=Math.sign(s.x);s.x=sg*MARGIN;if(Math.sin(s.beta)*sg>0){s.v*=1-Math.min(.5,Math.abs(Math.sin(s.beta))*1.5);s.beta*=.3;s.yaw*=.4;s.yawRate*=.3}}
  s.latV=(s.x-px)/H}
function physAI(s){""")

# race pose: spring-damper lean from the shared model (replaces the small first-order lean)
R("if(dt){const acc=(s.v-(s.crPv??s.v))/dt;s.crPv=s.v;const tp=clamp(acc*.003,-.025,.02);s.crPitch=snap?tp:(s.crPitch||0)+(tp-(s.crPitch||0))*Math.min(1,dt*6)}\n  _crQ.setFromEuler(_crEu.set(s.crPitch||0,0,s.crRoll||0));",
  "if(dt){const acc=(s.v-(s.crPv??s.v))/dt;s.crPv=s.v;s.c26aL=(s.c26aL??acc)+(acc-(s.c26aL??acc))*Math.min(1,dt*20);if(C26.on){C26_body(s,s.c26aL,s.c26lat||0,dt,snap);s.crPitch=s.c26p;s.crRoll=s.c26r}else{const tp=clamp(acc*.003,-.025,.02);s.crPitch=snap?tp:(s.crPitch||0)+(tp-(s.crPitch||0))*Math.min(1,dt*6)}}\n  _crQ.setFromEuler(_crEu.set(s.crPitch||0,0,s.crRoll||0));")

# ---------- city car ----------
R("if(c.thr||boost||RO.turbo>0)RO.v+=(s.stats.acc*1.15*lvl.acc*Math.max(0,1-RO.v/tt)+20*RO.bRamp+(RO.turbo>0?16:0))*dt;else RO.v-=RO.v*.4*dt;",
  "C26_ramp(RO,c,C26.on?dt:1);if(c.thr||boost||RO.turbo>0)RO.v+=(s.stats.acc*1.15*lvl.acc*Math.max(0,1-RO.v/tt)*(boost||RO.turbo>0||!C26.on?1:Math.max(.05,RO.thA))+20*RO.bRamp+(RO.turbo>0?16:0))*dt;else if(C26.on){const cd=(Math.abs(RO.v)*.08+.9)*dt;RO.v=Math.abs(RO.v)<=cd?0:RO.v-Math.sign(RO.v)*cd}else RO.v-=RO.v*.4*dt;")
R("if(RO.v>0){RO.v=Math.max(0,RO.v-75*dt);RO.bz=0}",
  "if(RO.v>0){RO.v=Math.max(0,RO.v-(C26.on?C26.brkCity*(.1+.9*RO.bkA):75)*dt);RO.bz=0}")
R("RO.yr=CR_yaw(c,dt,ytg,maxR,air);RO.h+=RO.yr*dt;",
  "{const y0=RO.yr||0;RO.yr=CR_yaw(c,dt,ytg,maxR,air);if(C26.on&&!air&&!RO.dDir&&!busy&&sp>3){let t=C26_yawCap(RO,RO.yr,sp,C26_cityMu(terr,veh));const b=angDiff(RO.h,RO.vh??RO.h)*Math.sign(RO.v||1);t-=C26.align*(b-clamp(b,-.1,.1))*Math.min(1,sp/20);RO.yr=y0+(t-y0)*Math.min(1,dt*(11-4*Math.min(1,sp/40)))}}RO.h+=RO.yr*dt;")
R("RO.vh=(RO.vh??RO.h)+angDiff(RO.h,RO.vh??RO.h)*Math.min(1,dt*grip);s.latV=Math.sin(angDiff(RO.h,RO.vh))*sp;",
  "RO.vh=(RO.vh??RO.h)+(C26.on?C26_vhStep(RO,angDiff(RO.h,RO.vh??RO.h),grip,dt,sp,C26_cityMu(terr,veh),air||!!RO.dDir||busy):angDiff(RO.h,RO.vh??RO.h)*Math.min(1,dt*grip));if(C26.on&&!RO.dDir){const b=angDiff(RO.h,RO.vh);if(Math.abs(b)>.6)RO.vh=RO.h-Math.sign(b)*.6;if(!air)RO.v-=RO.v*Math.sin(b)**2*C26.scrub*dt}s.latV=Math.sin(angDiff(RO.h,RO.vh))*sp;")
R("const CR_WB=2.7,CR_CAMK=1/.15;",
  "const CR_WB=2.7,CR_CAMK=1/.15;\nconst C26_cityMu=(terr,veh)=>(C26.muCity[terr]||C26.muCity.road)*(veh==='offroad'&&terr!=='road'?C26.muOff:1)*((carStat().han)||1);")
# city pose: the old whole-car pitch / roll lifted the tyres; the body alone leans now (spring-damper), wheels planted
R("s.pitch=(s.pitch||0)+(clamp(acc*.0045,-.06,.045)+wP-(s.pitch||0))*Math.min(1,dt*5);",
  "s.pitch=(s.pitch||0)+((C26.on&&bk<.5?0:clamp(acc*.0045,-.06,.045))+wP-(s.pitch||0))*Math.min(1,dt*5);RO.c26aL=(RO.c26aL??acc)+(clamp(acc,-60,60)-(RO.c26aL??acc))*Math.min(1,dt*20);")
R("+(1-bk)*CR_roll()+wR,-.6,.6);",
  "+(1-bk)*(C26.on?0:CR_roll())+wR,-.6,.6);")

# city body lean + test accessors (end of the module)
R("window.__mho={",
"""roamPose=(f=>function(s,dt){f(s,dt);try{if(!C26.on||s!==pl||state!=='roam')return;const ud=s.mesh&&s.mesh.userData;if(!ud||!ud.m||!ud.gbM)return;
  if(s.air||(s.boatK||0)>.5||RO.wk){RO.c26p=null;C26_lean(ud,0,0);return}C26_body(RO,RO.c26aL||0,-(RO.c26lat||0),Math.min(dt||0,.1),false);C26_lean(ud,RO.c26p,RO.c26r)}catch(e){}})(roamPose);
window.__cr26={C26,get TD(){return TD},kAt:d=>kAt(TD,d),get ships(){return ships},get traffic(){return traffic},get MARGIN(){return MARGIN}};
window.__mho={""")
save()
