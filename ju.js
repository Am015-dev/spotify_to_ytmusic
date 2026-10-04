/* ===== JU · moment-to-moment feel for free roam + missions (module ju.js, inserted before window.__mho; races untouched) =====
   Targets and sources: docs/juice_research.md. Everything wraps existing functions; JU.on=false makes every wrapper pass straight
   through (tJU.js measures before/after on one build). No per-frame allocations: scratch vectors are made once below.
   · camera: lower + tighter at speed, look-ahead into turns, FOV curve, punch on impacts      · hit-stop 65–90 ms on takedowns / big smashes
   · drift tiers paced 0.5/1.1/2.0 s with a tier-up cue, payout grows per tier               · near miss at city speeds
   · landing squash + kick · combo: pulse per link, big pop on cash-out · stud trail when nothing happened for 5 s
   · speed blur / speed lines inside the mission caps · wind + road rumble                      · split-screen: no hit-stop, no camera punch */
const JU={on:true,hold:false,rt:1/60,hs:0,hsCd:0,frz:false,off:0,clk:0,ev:{n:0,m:0,lm:0,last:0,gap:0,k:{}},sm0:0,cr0:0,
  kick:0,la:0,drop:0,fx:0,sq:0,airT0:0,dropT:0,nmF:0,co:new THREE.Vector3(),cf:0,v0:new THREE.Vector3(),v1:new THREE.Vector3(),Y:new THREE.Vector3(0,1,0)};
const JU_C={tierK:.55,tierT:[.5,1.1,2],turbo:[.8,1.6,2.6],bm:[8,18,32],hsTd:.09,hsBig:.075,hsSmall:.065,deadT:5,airMin:.8};
const JU_TC=[new THREE.Color(.6,1.6,2.6),new THREE.Color(2.6,1.2,.3),new THREE.Color(1.8,.6,2.6)];
function JU_ev(k){const E=JU.ev;E.n++;if(JU.clk-E.lm>.3||!E.m)E.m++;E.lm=JU.clk;E.k[k]=(E.k[k]||0)+1;const g=JU.clk-E.last;if(g>E.gap)E.gap=g;E.last=JU.clk}
function JU_roam(){return state==='roam'&&!!pl}
function JU_busy(){return !!(RO.card||RO.mapOpen||RO.story||RO.frozen||RO.wk)}
function JU_split(){try{if(typeof SPLIT!=='undefined'&&SPLIT&&SPLIT.on)return true}catch(e){}return !!window.__splitOn||document.body.classList.contains('split')}
function JU_mis(){return !!(RO.ch&&RO.ch.m&&RO.ch.m.m1)}
const JU_tier=d=>d>JU_C.tierT[2]?3:d>JU_C.tierT[1]?2:d>JU_C.tierT[0]?1:0;
const JU_ss=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
// passive counters (both builds): every visible reward / feedback event
feed=(f=>function(l,p,c){if(JU_roam())JU_ev(/NEAR MISS/.test(l)?'near':/^AIR /.test(l)?'air':'feed');return f(l,p,c)})(feed);
say=(f=>function(a,b,t){if(JU_roam()&&(a||b))JU_ev('say');return f(a,b,t)})(say);
studGain=(f=>function(v,b){if(JU_roam())JU_ev('stud');return f(v,b)})(studGain);
// ---- hit-stop: the frame clock stands still for JU.hs seconds of real time (sim dt = 0, sound already fired on the impact frame)
function JU_hit(s){if(!JU.on||!JU_roam()||JU_busy()||JU_split())return;const k=fxK();JU.kick=Math.max(JU.kick,Math.min(1,s/JU_C.hsTd)*k);if(JU.hsCd>0||!k)return;JU.hs=Math.max(JU.hs,s);JU.hsCd=.35}
function JU_gate(rt){JU.hsCd=Math.max(0,JU.hsCd-rt);if(JU.hs>0){JU.hs-=rt;JU.frz=true}else JU.frz=false;return JU.frz}
frame=(f=>function(now){if(JU.hold){requestAnimationFrame(frame);composer.render();return}const rt=Math.min(.05,Math.max(0,(now-(JU.ln??now))/1000));JU.ln=now;JU.rt=rt;if(JU_gate(rt))JU.off+=rt*1000;f(now-JU.off);if(state!=='roam'&&pl&&pl.mesh.scale.y!==1)pl.mesh.scale.set(1,1,1)})(frame);
AU.sfx=(f=>function(n){if(JU.on&&state==='roam'&&n==='takedown')JU_hit(JU_C.hsTd);return f.call(this,n)})(AU.sfx);
// big brick sprays: traffic smash (18 × 1.1), big props (18 × 1), mission rams (≥ 18)
debris=(f=>function(at,vel,n,cols,size=1,floor){if(JU.on&&state==='roam'&&n>=18&&size>=1)JU_hit(n*size>19?JU_C.hsBig:JU_C.hsSmall);return f(at,vel,n,cols,size,floor)})(debris);
// ---- combo: pulse on every link, big pop on cash-out
let JU_popEl=null;function JU_pop(a,b,col){if(!JU_popEl){const st=document.createElement('style');st.textContent='#juPop{position:fixed;left:50%;top:38%;transform:translate(-50%,-50%);font:900 italic 46px var(--hud,system-ui);color:#ffd12c;text-shadow:0 3px 0 rgba(0,0,0,.55),0 0 16px rgba(0,0,0,.35);opacity:0;pointer-events:none;z-index:6;text-align:center;white-space:nowrap}#juPop small{display:block;font:800 18px system-ui;letter-spacing:.12em;color:#fff}#juPop.on{animation:juPop 1.2s ease-out forwards}@keyframes juPop{0%{opacity:0;scale:.4}12%{opacity:1;scale:1.25}24%{scale:1}78%{opacity:1}100%{opacity:0;scale:1;translate:0 -30px}}#roamCombo.juP{animation:juCb .22s ease-out}@keyframes juCb{0%{scale:1.3}100%{scale:1}}@media (max-height:520px){#juPop{font-size:28px;top:44%}#juPop small{font-size:13px}}';document.head.appendChild(st);JU_popEl=document.createElement('div');JU_popEl.id='juPop';document.body.appendChild(JU_popEl)}
  JU_popEl.style.color=col||'#ffd12c';JU_popEl.innerHTML=a+(b?`<small>${b}</small>`:'');JU_popEl.classList.remove('on');void JU_popEl.offsetWidth;JU_popEl.classList.add('on');JU_ev('pop')}
comboAdd=(f=>function(k){if(JU_roam())JU_ev('chain');f(k);if(JU.on&&state==='roam'){const el=huQ('#roamCombo');if(el){el.classList.remove('juP');void el.offsetWidth;el.classList.add('juP')}}})(comboAdd);
comboStep=(f=>function(dt){const n0=CB.n,m0=comboMult();f(dt);if(JU.on&&n0>=5&&CB.n===0&&JU_roam()){const bonus=Math.round(n0*2*m0*streetMul());JU_pop(`CHAIN ${n0} ×${m0}`,`+${bonus} STUDS`,['#ffd12c','#ffd12c','#4ceaff','#ff9a3c','#ff9a3c','#ff2d95'][Math.min(5,m0)]);
  const fw=JU.v0.set(Math.sin(RO.h),0,Math.cos(RO.h)),at=JU.v1.set(RO.x,RO.y+2,RO.z);for(let i=0;i<Math.min(10,2+Math.floor(n0/4));i++)studBurst(at,fw,Math.abs(RO.v));AU.sfx(m0>=3?'finish':'style');fovKick=Math.max(fovKick,5+m0);JU.kick=Math.max(JU.kick,.35*fxK())}})(comboStep);
// ---- roam step: clock, drift tiers, near miss, air + landing, stud trail
roamStep=(f=>function(dt){const busy=JU_busy();if(!busy)JU.clk+=dt;if(!JU.on||!pl||!dt)return f(dt);
  const s=pl,d0=RO.dDir,t0=RO.dT||0,tr0=d0?JU_tier(t0):0,a0=!!s.air;f(dt);if(RO.wk||!pl)return;
  // drift: slower charge (tiers at 0.5 / 1.1 / 2.0 s when steering into it), a cue per tier, payout 8 / 18 / 32 % bar + 0.8 / 1.6 / 2.6 s turbo
  if(d0&&RO.dDir){RO.dT=t0+(RO.dT-t0)*JU_C.tierK;const tr=JU_tier(RO.dT);if(tr>tr0){const fx0=Math.sin(RO.h),fz0=Math.cos(RO.h);burst(SPARK,JU.v1.set(RO.x-fx0*3,RO.y+.6,RO.z-fz0*3),10+tr*6,9+tr*3,.35,JU_TC[tr-1]);AU.sfx('style');JU_ev('tier');JU.kick=Math.max(JU.kick,.12*tr*fxK())}}
  else if(d0&&!RO.dDir&&tr0>0){RO.turbo=Math.max(RO.turbo||0,JU_C.turbo[tr0-1]);s.bm=Math.min(100,s.bm+JU_C.bm[tr0-1]-6*tr0);if(tr0===3)JU_pop('ULTRA TURBO','','#c46bff')}
  const sp=Math.abs(RO.v);
  // near miss: a traffic car passes 5–8 m beside us at ≥ 15 m/s (the base one needs 45 m/s); shares the base cooldown c.nm
  if(sp>=15&&!s.air&&!busy&&(JU.nmF=(JU.nmF+1)&1)===0){const fx=Math.sin(RO.vh??RO.h),fz=Math.cos(RO.vh??RO.h);for(const c of HUB.cars){if(c.dead>0||c.x==null)continue;const dx=c.x-RO.x,dz=c.z-RO.z;if(dx*dx+dz*dz>144){c.jpa=null;continue}const al=dx*fx+dz*fz,lat=Math.abs(dx*fz-dz*fx);
    if(c.jpa!=null&&c.jpa>0&&al<=0&&lat>4.8&&lat<8&&Math.abs((c.y||0)-RO.y)<3&&!(c.nm>0)){c.nm=3;award(s,'NEAR MISS',6,100,'#4ceaff');AU.sfx('near');comboAdd(2)}c.jpa=al}}
  // air: the base already pays an air bonus over 1 s (roamLanded); here: squash on landing, camera kick on big landings, slight stretch in the air
  if(s.air&&!a0)JU.airT0=JU.clk;else if(!s.air&&a0){const at=JU.clk-JU.airT0;JU.sq=Math.min(.24,.14+at*.1);if(at>=JU_C.airMin)JU.kick=Math.max(JU.kick,Math.min(.45,at*.3)*fxK())}
  JU.sq=Math.max(0,JU.sq-dt*1.1);{const q=s.air?-.05:JU.sq*Math.min(1,JU.sq*8),m=s.mesh.scale;if(Math.abs(m.y-(1-q))>1e-4)m.set(1+q*.45,1-q,1+q*.45)}
  // stud trail: nothing rewarding for 5 s while driving → a fountain of studs on the road ahead (pooled stud meshes)
  JU.dropT=Math.max(0,JU.dropT-dt);if(!busy&&sp>3&&JU.dropT<=0&&JU.clk-JU.ev.last>JU_C.deadT){JU.dropT=2.5;const sg=Math.sign(RO.v||1),fx=Math.sin(RO.h)*sg,fz=Math.cos(RO.h)*sg,ahead=Math.min(45,14+sp*.7);JU.v0.set(fx,0,fz);let n=0;
    for(let k=0;k<6;k++){const x=RO.x+fx*(ahead+k*3.5),z=RO.z+fz*(ahead+k*3.5);if(roamHit(x,z,1,RO.y))break;studBurst(JU.v1.set(x,groundAt(x,z,RO.y+3)+.8,z),JU.v0,0);n++}
    // blocked ahead (a wall, a tight turn): pop them in a ring around the car instead, inside the stud magnet
    if(!n){JU.v0.set(0,0,0);for(let k=0;k<6;k++){const a=k*1.047,x=RO.x+Math.sin(a)*6,z=RO.z+Math.cos(a)*6;if(!roamHit(x,z,1,RO.y))studBurst(JU.v1.set(x,groundAt(x,z,RO.y+3)+.8,z),JU.v0,0)}}}})(roamStep);
// ---- camera: offsets are removed before the base camera runs and re-applied after, so they never feed back into its smoothing
roamCam=(f=>function(dt){const c=camera;c.position.sub(JU.co);c.fov-=JU.cf;JU.co.set(0,0,0);JU.cf=0;f(dt);
  if(!JU.on||!JU_roam()||(typeof M1!=='undefined'&&(M1.cs||M1.tdc&&M1.tdc.t>0))){c.updateProjectionMatrix();return}
  const rt=JU.rt,sp=Math.abs(RO.v),k=clamp(sp/Math.max(30,RO.top||60),0,1.3),e=1-Math.exp(-rt*4),boost=!!pl.nitro;
  JU.drop+=(2.2*JU_ss(.3,1.05,k)*(pl.air?.3:1)-JU.drop)*e;JU.fx+=((2*JU_ss(.6,1,k)+(boost?2.5:0))-JU.fx)*e;
  JU.la+=(clamp((RO.yr||0)*.07*Math.min(1,sp/20)+(RO.dDir?RO.dDir*.05:0),-.15,.15)-JU.la)*(1-Math.exp(-rt*5));
  if(!JU.frz)JU.kick*=Math.exp(-rt*9);if(JU.kick<.002)JU.kick=0;
  // tighter chase at speed: the base lag lets the camera drift ~30 m back at top speed; keep it within 24 m (boost may stretch to 27)
  const dx=RO.x-c.position.x,dz=RO.z-c.position.z,dh=Math.hypot(dx,dz)||1,lim=boost?27:24,pull=Math.max(0,dh-lim)*.9+JU.kick*1.6;
  JU.co.set(dx/dh*pull,-JU.drop+JU.kick*.5,dz/dh*pull);if(c.position.y+JU.co.y<RO.y+2.2)JU.co.y=RO.y+2.2-c.position.y;c.position.add(JU.co);
  if(JU.la)c.rotateOnWorldAxis(JU.Y,JU.la);
  JU.cf=JU.fx+JU.kick*5;c.fov+=JU.cf;c.updateProjectionMatrix();
  // speed blur + speed lines: capped at the mission limits everywhere (uSpeed ≤ .25, uBoost ≤ .15, lines ≤ .3 in missions)
  const U=FX.uniforms,K=fxK();U.uSpeed.value+=(Math.min(.25,.25*JU_ss(.55,1.1,k))*K-U.uSpeed.value)*e;U.uBoost.value+=((boost?.15:RO.turbo>0?.1:0)*K-U.uBoost.value)*e;
  {const el=huQ('#speedFx');if(el){let w=Math.max(boost?clamp(sp/40,0,1)*.85:0,.32*JU_ss(.7,1.05,k));if(JU_mis())w=Math.min(w,.3);w*=K;const o=+el.style.opacity||0,n=Math.abs(w-o)<.004?w:Math.round((o+(w-o)*.15)*1000)/1000;if(n!==o)el.style.opacity=n}}})(roamCam);
// ---- wind rises with speed relative to the roam top speed, a low road rumble under it (one extra noise loop, made once)
AU.engine=(f=>function(s,thr,on){f.call(this,s,thr,on);if(!JU.on||!this.a||state!=='roam'||!this.wind)return;const t=this.a.currentTime,x=clamp(Math.abs(RO.v)/Math.max(30,RO.top||60),0,1.3);
  if(!this.juR){try{const a=this.a,src=a.createBufferSource();src.buffer=this.nb;src.loop=true;const lp=a.createBiquadFilter();lp.type='lowpass';lp.frequency.value=110;const g=a.createGain();g.gain.value=0;src.connect(lp);lp.connect(g);g.connect(this.fx);src.start();this.juR=g}catch(e){this.juR={gain:{setTargetAtTime(){}}}}}
  this.wind.g.gain.setTargetAtTime(on?x*x*.3+(s.nitro?.1:0)+(s.air?.1:0):0,t,.1);this.wind.f.frequency.setTargetAtTime(500+x*2200,t,.1);this.juR.gain.setTargetAtTime(on&&!s.air?Math.min(.35,x*.3+JU.sq):0,t,.08)})(AU.engine);
// one deterministic roam frame at 1/60 s (tests), the same order as frame(): hit-stop gate, sim, camera, particles, decays
function JU_step1(){const h=1/60;JU.rt=h;let dt=(paused||JU_gate(h))?0:h;if(dt&&slowmo>0){slowmo-=dt;dt*=.35}T+=dt;if(!RO.frozen)roamStep(dt);roamCam(dt);updPool(SPARK,dt,20);updPool(FIRE,dt,-2);updPool(SMOKE,dt,-1.5);updPool(FIREB,dt,-3);updDebris(dt);updPool(WATER,dt,24);updPool(GLOWP,0);shake=Math.max(0,shake-dt*3);flash=Math.max(0,flash-dt*2.2);hitFx=Math.max(0,hitFx-dt*2.5);FX.uniforms.uCA.value=hitFx*.035+flash*.02}
window.__ju={get JU(){return JU},C:JU_C,on:b=>{JU.on=!!b;if(!JU.on&&pl)pl.mesh.scale.set(1,1,1)},hold:b=>{JU.hold=!!b;JU.ln=null},
  tier:()=>{const d=RO.dDir?RO.dT||0:0;return JU.on?JU_tier(d):d>2?3:d>1.1?2:d>.5?1:0},setBm:v=>{if(pl)pl.bm=v},
  // tests drive like a player: a popped-up card / story panel is dismissed with its own close control
  step:n=>{for(let i=0;i<n;i++){if(JU.autoClose&&(RO.card||RO.story||RO.mapOpen)){if(RO.card){const b=document.querySelector('#rcNo');if(b)b.click();else RO.card=null}if(RO.story)try{storyClose()}catch(e){}if(RO.mapOpen)toggleMap(false);JU.closed=(JU.closed||0)+1}JU_step1()}},autoClose:b=>{JU.autoClose=!!b},debugPop:()=>JU_pop('CHAIN 31 ×3','+186 STUDS','#ff9a3c'),
  reset:()=>{JU.clk=0;JU.ev={n:0,m:0,lm:0,last:0,gap:0,k:{}};JU.sm0=HUB.smashed||0;JU.cr0=season().cr;JU.dropT=0},
  stats:()=>({t:+JU.clk.toFixed(2),ev:JU.ev.n,moments:JU.ev.m,k:{...JU.ev.k},gap:+Math.max(JU.ev.gap,JU.clk-JU.ev.last).toFixed(2),smash:(HUB.smashed||0)-JU.sm0,studs:season().cr-JU.cr0}),
  cam:()=>{const c=camera.position,dx=c.x-RO.x,dz=c.z-RO.z,fw=new THREE.Vector3();camera.getWorldDirection(fw);const ya=Math.atan2(fw.x,fw.z);return{fov:+camera.fov.toFixed(2),h:+(c.y-RO.y).toFixed(2),back:+Math.hypot(dx,dz).toFixed(2),yaw:+(Math.atan2(Math.sin(ya-RO.h),Math.cos(ya-RO.h))*57.3).toFixed(1)}},
  car:()=>({x:RO.x,z:RO.z,y:RO.y,v:RO.v,h:RO.h,top:RO.top,bm:pl?pl.bm:0,boosting:!!RO.boosting,nitro:!!(pl&&pl.nitro),turbo:RO.turbo||0,dDir:RO.dDir||0,dT:RO.dT||0,air:!!(pl&&pl.air),inCity:!!RO.inCity,hp:RO.hp,shake,fovKick,paused:paused||JU.frz,sq:pl?pl.mesh.scale.y:1}),
  fx:()=>({uBoost:FX.uniforms.uBoost.value,uSpeed:FX.uniforms.uSpeed.value,uCA:FX.uniforms.uCA.value,hitFx,flash,shake,speedFx:+(document.querySelector('#speedFx').style.opacity||0)}),
  // test helpers: live traffic cars nearest first (with heading), and freeze one in place (index into HUB.cars, -1 = release)
  cars:()=>{const N=HUB.nodes;return HUB.cars.map((c,i)=>({c,i})).filter(o=>!(o.c.dead>0)&&o.c.x!=null&&N[o.c.a]&&N[o.c.b]).map(({c,i})=>{const A=N[c.a],B=N[c.b];return{i,x:c.x,z:c.z,y:c.y||0,h:Math.atan2(B.x-A.x,B.z-A.z),d:Math.hypot(c.x-RO.x,c.z-RO.z)}}).filter(o=>o.d>40).sort((a,b)=>a.d-b.d).slice(0,40)},
  freezeCar:i=>{if(JU.fzc){const c=JU.fzc;c.v=c.fv0;c.hv=c.fh0;JU.fzc=null}if(i>=0){const c=HUB.cars[i];c.fv0=c.v;c.fh0=c.hv;c.v=0;c.hv=1e-6;c.cv=0;JU.fzc=c}},
  // put the car 26 m behind the nearest live traffic car, on its lane, heading the same way at v m/s
  aimTraffic:(v=38)=>{let b=null,bd=1e9;for(const c of HUB.cars){if(c.dead>0||c.x==null)continue;const d=Math.hypot(c.x-RO.x,c.z-RO.z);if(d<bd&&d>30){bd=d;b=c}}if(!b)return null;const N=HUB.nodes,A=N[b.a],B=N[b.b],L=Math.hypot(B.x-A.x,B.z-A.z)||1,dx=(B.x-A.x)/L,dz=(B.z-A.z)/L;
    RO.x=b.x-dx*26;RO.z=b.z-dz*26;RO.y=groundAt(RO.x,RO.z,b.y+3);RO.vy=0;RO.h=RO.vh=Math.atan2(dx,dz);RO.yr=0;RO.v=v;camSnap=true;return{x:b.x,z:b.z}}};
