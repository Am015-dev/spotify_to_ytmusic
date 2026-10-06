# CAR24 (Alex on v86v, 2/10): (1) "shaking cars when running": the race camera added random white noise to its position every
#        frame, growing with speed^3 (+-6 cm at top speed, +-13 cm on nitro) -> the whole picture shook. Only impact shake stays.
#        (2) "seems very slow": the HUD is true (v x 3.6, 4.6 m car) but the race track is 48 m wide (built for 7 m hover ships),
#        so the race camera now comes closer and lower with speed (-2.2 m back, -0.9 m up at top), the FOV opens more (+26 deg),
#        speed lines start at half speed; the city chase camera no longer pulls back with speed (it comes 1.2 m closer, 0.3 m lower).
exec(open('P.py').read())
if 'CR_SPDCAM' in s:
    print('OK');raise SystemExit
R("const jit=(shake*1.6+spd**3*.12)*fxK();","const jit=Math.max(0,shake-.3)*1.6*fxK();")
R("back=10.5*tall*cd-(s.nitro?.5:0)","back=10.5*tall*cd-(s.nitro?.5:0)-CR_SPDCAM.b*clamp(spd,0,1.2)")
R("addScaledVector(up,3.4*tall*cd-(s.nitro?.25:0))","addScaledVector(up,3.4*tall*cd-(s.nitro?.25:0)-CR_SPDCAM.h*clamp(spd,0,1.2))")
R("+20*Math.pow(clamp(spd,0,1.25),1.2)+(s.nitro||s.turbo>0?7:0)+fovKick","+26*Math.pow(clamp(spd,0,1.25),1.2)+(s.nitro||s.turbo>0?7:0)+fovKick")
R("speedLines.mesh.material.opacity=state==='menu'?0:(clamp((spd-.9)*1.4,0,.25)+(s.nitro?.25:0))*fxK()","speedLines.mesh.material.opacity=state==='menu'?0:(clamp((spd-.45)*.7,0,.32)+(s.nitro?.25:0))*fxK()")
R("chase:{b:8.5,bk:3,h:2.8,hk:.6,","chase:{b:8.5,bk:-1.2,h:2.8,hk:-.3,")
# (1b) AI cars wiggled: the dodge target flipped sides every substep while two cars overlapped, and lateral motion was bang-bang
#      (x stair-steps 0.13 m, yaw +-12 deg frame to frame). Now: the dodge side sticks for 1.5 s, the lateral target is low-passed
#      and the lateral speed is acceleration-limited (30 m/s^2), so the yaw follows a smooth slip angle.
R("xt=clamp(o.x+(o.x>s.x?-6:6),-MARGIN+1,MARGIN-1)}","xt=clamp(o.x+CR_dodge(s,o)*6,-MARGIN+1,MARGIN-1)}")
R("const px=s.x,lat=s.attackT>0?14:9;s.x+=clamp(xt-s.x,-lat*H*cls.mul,lat*H*cls.mul);",
  "const px=s.x,lat=(s.attackT>0?14:9)*cls.mul;if(s.crXT==null||Math.abs(s.crXT-s.x)>20){s.crXT=s.x;s.crLV=0}s.crXT+=(xt-s.crXT)*Math.min(1,H*(s.attackT>0?8:3));const dvx=clamp((s.crXT-s.x)*2.5,-lat,lat);s.crLV=(s.crLV||0)+clamp(dvx-(s.crLV||0),-30*H,30*H);s.x=clamp(s.x+s.crLV*H,-MARGIN,MARGIN);")
# (3b) SMASH = BOOST: any contact while boosting, or above 150 km/h, always wrecks (city traffic, race traffic, AI rivals),
#      with a tumble on city victims and a big one-shot hit; the meter refills faster (city 9/s after 0.5 s, races 7/s)
R("if(s.nitro||s.shield>0||s.rollT>0||s.turbo>0){wreckTraffic(c,s,1.2);","if(s.nitro||s.shield>0||s.rollT>0||s.turbo>0||s.boost>0||s.v>CR_SMASHV){wreckTraffic(c,s,1.2);if(s.isPlayer)CR_smashHit();")
R("const rel=Math.max(0,s.v-c.v);if(rel>CR_SMASHV){","const rel=Math.max(0,s.v-c.v);if(s.v>CR_SMASHV){")
R("(((latV*toward>4.5&&pinned)&&(P.nitro||P.turbo>0||P.boost>0||Math.abs(P.v-O.v)>CR_SMASHV))||rearRam))takedown(O);","((P.nitro||P.turbo>0||P.boost>0||P.v>CR_SMASHV)||rearRam)&&O.dead<=0)takedown(O);")
R("}}else if(Math.abs(RO.v)>10){c.dead=25;","}}else if(crSm||Math.abs(RO.v)>10){c.dead=25;CR_tumbleStart(c,x,z,dx,dz);")
R("AU.sfx('crash');if(pl&&pl.nitro)roamHeal(3);","AU.sfx('crash');if(crSm)CR_smashHit();if(pl&&pl.nitro)roamHeal(3);")
R("if(c.dead>0){c.dead-=dt;_m.makeScale(0,0,0);","if(c.dead>0){c.dead-=dt;if(CR_tumble(c,im,dt))continue;_m.makeScale(0,0,0);")
R("const FL_RECH=4.5,","const FL_RECH=9,")
R("if(RO.bIdle>.8)s.bm","if(RO.bIdle>.5)s.bm")
JS0=r'''
const CR_SPDCAM={b:2.2,h:.9};
// SMASH feedback: one-shot big hit (no continuous shake)
function CR_smashHit(){const t=performance.now();if(t-(CR_smashHit.t||0)<250)return;CR_smashHit.t=t;shake=Math.max(shake,.75);fovKick=Math.max(fovKick,10);slowmo=Math.max(slowmo,.18);try{AU.sfx('takedown')}catch(e){}try{hitPop('💥 SMASH!','#ffd12c')}catch(e){}}
// city victims tumble for 0.9 s (barrel roll + flight) before they burst into bricks
const _crTQ=new THREE.Quaternion(),_crTE=new THREE.Euler(),_crTS=new THREE.Vector3(1,1,1),_crTP=new THREE.Vector3(),_crTM=new THREE.Matrix4();
function CR_tumbleStart(c,x,z,dx,dz){const f=Math.hypot(dx,dz)||1,rx=x-RO.x,rz=z-RO.z,rl=Math.hypot(rx,rz)||1,v=Math.max(12,Math.abs(RO.v));c.crW={t:0,x,y:c.y,z,h:Math.atan2(dx,dz),vx:Math.sin(RO.vh)*v*.55+rx/rl*6,vz:Math.cos(RO.vh)*v*.55+rz/rl*6,vy:7+v*.08,r:0,p:0,sr:(Math.random()<.5?-1:1)*9,sp:(Math.random()-.5)*5}}
function CR_tumble(c,im,dt){const W=c.crW;if(!W)return false;if(W.t>=.9){c.crW=null;return false}W.t+=dt;W.vy-=22*dt;W.x+=W.vx*dt;W.y=Math.max(c.y-.5,W.y+W.vy*dt);W.z+=W.vz*dt;W.r+=W.sr*dt;W.p+=W.sp*dt;
 _crTQ.setFromEuler(_crTE.set(W.p,W.h,W.r,'YXZ'));_crTM.compose(_crTP.set(W.x,W.y,W.z),_crTQ,_crTS);im.setMatrixAt(c.j,_crTM);if(im.userData.w)im.userData.w.setMatrixAt(c.j,_crTM);if(im.userData.g)im.userData.g.setMatrixAt(c.j,_crTM);return true}
function CR_dodge(s,o){const m=s.crDg||(s.crDg=new Map()),t=typeof raceT!=='undefined'?raceT:performance.now()/1000,e=m.get(o);if(e&&t-e.t<1.5)return e.d;const d=o.x>s.x?-1:1;m.set(o,{d,t});return d}
'''
JS=r'''
// ---- (3) BOOST (the SMASH button) never looks dead: a meter ring on the button, and pressing it empty flashes NEED BOOST + a red shake
(()=>{const st=document.createElement('style');st.id='crBoostRing';st.textContent=`html body #tN::after{content:'';position:absolute;inset:-6px;border-radius:50%;pointer-events:none;background:conic-gradient(#4ceaff calc(var(--crbm,0)*1%),rgba(255,255,255,.12) 0);-webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 5px),#000 calc(100% - 4px));mask:radial-gradient(farthest-side,transparent calc(100% - 5px),#000 calc(100% - 4px))}html body #tN.crDeny{animation:crDeny .45s linear;border-color:#ff3b55!important;color:#ff3b55!important}@keyframes crDeny{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}`;document.head.appendChild(st)})();
const CR_BD={on:false,t:0};
function CR_needTip(b){let d=document.getElementById('crNeed');if(!d){d=document.createElement('div');d.id='crNeed';d.style.cssText='position:fixed;z-index:30;pointer-events:none;font:800 13px system-ui;color:#fff;background:rgba(255,59,85,.92);padding:5px 9px;border-radius:9px;text-align:center;line-height:1.2;white-space:nowrap;transition:opacity .25s';document.body.appendChild(d)}
 d.innerHTML='NEED BOOST<br><span style="font-weight:600;font-size:12px">smash things to fill it</span>';const r=b.getBoundingClientRect();d.style.opacity='1';d.style.left=Math.max(8,Math.min(innerWidth-d.offsetWidth-8,r.left+r.width/2-d.offsetWidth/2))+'px';d.style.top=Math.max(8,r.top-d.offsetHeight-10)+'px';clearTimeout(d._t);d._t=setTimeout(()=>d.style.opacity='0',1200)}
physPlayer=(f=>function(s,c){f(s,c);try{if(state==='race'&&s.isPlayer&&!s.nitro)s.bm=Math.min(100,s.bm+7*H)}catch(e){}})(physPlayer);
// the BOOST button carries the SMASH name
(()=>{const st=document.createElement('style');st.id='crSmashLbl';st.textContent=`html body #tN .crSm{display:block;font-size:12px;letter-spacing:.06em;opacity:.85;margin-top:1px}`;document.head.appendChild(st)})();
setInterval(()=>{try{const b=document.getElementById('tN');if(!b||!pl)return;if(!b.querySelector('.crSm')){const t=b.textContent.trim();if(t==='BOOST'){b.innerHTML='BOOST<span class="crSm">SMASH</span>'}}const bm=clamp(pl.bm||0,0,100);b.style.setProperty('--crbm',bm.toFixed(0));
 const on=!!(CTL&&CTL.boost)&&(state==='roam'||state==='race');if(on&&!CR_BD.on){const need=state==='race'?.5:1;if(bm<=need&&performance.now()-CR_BD.t>900){CR_BD.t=performance.now();b.classList.remove('crDeny');void b.offsetWidth;b.classList.add('crDeny');setTimeout(()=>b.classList.remove('crDeny'),500);CR_needTip(b);try{AU.sfx('bump')}catch(e){}}}CR_BD.on=on}catch(e){}},60);
'''
import re
m=re.search(r'<script type="module">(.*?)</script>',s,re.S)
s=s[:m.end(1)]+JS+s[m.end(1):]
m=re.search(r'<script type="module">(.*?)</script>',s,re.S)
s=s[:m.start(1)]+JS0+s[m.start(1):]
save()
print('OK')
