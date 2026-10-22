// speed-boost-feel-r22e4 (BENCH_2K gaps 1+2: "TURBO is invisible", "70 km/h looks like 30"). Default ON, ?sf=0 = off. Roam + races.
// speed: white radial streaks at the screen edges from 90 km/h (one canvas drawn once, CSS opacity/transform only: no post pass), a small eased pull-back
//   and a fine shake above 90 km/h, a boost FOV ease inside the feel-r21a +12° cap and a kick on boost start.
// boost: blue-white exhaust jets (one additive Points draw, world-space trail behind the nozzles), a cyan glow sprite per nozzle, a cyan edge vignette
//   with a flash on boost start, the existing whoosh cue, and the HUD boost bar pulsing while boosting.
// The Points/Sprite programs are created before the loader's warm-up (ldPrewarm) so nothing links on the first boost. GO why/speedfeel (state asserts).
const SF_Q=new URLSearchParams(location.search),SF={on:SF_Q.get('sf')!=='0',jit:SF_Q.get('sfj')==='1',/* per-frame shimmer transform: off (re-composites the layer every other frame; ?sfj=1 on) */vgOn:SF_Q.get('sfv')!=='0',op:0,vg:0,fl:0,bE:0,kmh:0,b:false,wasB:false,t:0,ms:0,msN:0,force:null,el:null,vgEl:null,P:null,glow:[],nAlive:0,pull:0,lastPos:[null,null],starts:0};
const SF_N=40;
function SF_glowTex(){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),r=g.createRadialGradient(32,32,0,32,32,32);
  r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.25,'rgba(200,245,255,.9)');r.addColorStop(.6,'rgba(60,170,255,.35)');r.addColorStop(1,'rgba(0,60,255,0)');g.fillStyle=r;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c)}
function SF_dom(){if(SF.el)return;const st=document.createElement('style');st.textContent=`#sfL,#sfV{position:fixed;inset:-4%;width:108%;height:108%;pointer-events:none;z-index:3;opacity:0;will-change:opacity,transform;display:block}
#sfV{inset:0;width:100%;height:100%;background:radial-gradient(ellipse at 50% 55%,rgba(0,0,0,0) 52%,rgba(40,190,255,.28) 78%,rgba(120,230,255,.6) 100%)}
#b2kM.sfB .b{animation:sfP .32s ease-in-out infinite alternate;border-color:#e8fdff}@keyframes sfP{from{box-shadow:0 0 6px rgba(76,234,255,.7);transform:scaleY(1)}to{box-shadow:0 0 16px 3px rgba(120,240,255,1);transform:scaleY(1.35)}}`;document.head.appendChild(st);
  // radial streaks, drawn once: thin white wedges from an inner ellipse (clear centre, where the car is) out past the edges
  const W=1024,H=512,c=document.createElement('canvas');c.width=W;c.height=H;c.id='sfL';const g=c.getContext('2d'),cx=W/2,cy=H*.56;let s=7;const rn=()=>(s=(s*16807)%2147483647)/2147483647;
  for(let i=0;i<120;i++){const a=rn()*Math.PI*2,r0=.62+rn()*.3,r1=1.6,w=.003+rn()*.009,P=(ang,r)=>[cx+Math.cos(ang)*cx*r,cy+Math.sin(ang)*cy*r*1.15],[x0,y0]=P(a,r0),[xa,ya]=P(a-w,r1),[xb,yb]=P(a+w,r1),[xe,ye]=P(a,r1);
    const gr=g.createLinearGradient(x0,y0,xe,ye);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.3,'rgba(235,250,255,.75)');gr.addColorStop(1,'rgba(255,255,255,.95)');g.fillStyle=gr;g.beginPath();g.moveTo(x0,y0);g.lineTo(xa,ya);g.lineTo(xb,yb);g.closePath();g.fill()}
  const v=document.createElement('div');v.id='sfV';document.body.appendChild(c);document.body.appendChild(v);SF.el=c;SF.vgEl=v}
function SF_init(){if(!SF.on||SF.P||typeof THREE==='undefined'||typeof scene==='undefined')return;SF_dom();const tex=SF_glowTex(),g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(SF_N*3),3));g.setAttribute('color',new THREE.BufferAttribute(new Float32Array(SF_N*3),3));g.setDrawRange(0,0);
  const m=new THREE.Points(g,new THREE.PointsMaterial({size:.32,map:tex,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true,toneMapped:false}));
  m.frustumCulled=false;m.name='sfJet';m.userData.gbG=1;m.renderOrder=5;SF.P={m,g,p:[]};for(let i=0;i<SF_N;i++)SF.P.p.push({l:0,L:1,x:0,y:0,z:0,vx:0,vy:0,vz:0});
  const sm=new THREE.SpriteMaterial({map:tex,color:new THREE.Color(.55,.9,1.3),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false});
  for(let i=0;i<2;i++){const sp=new THREE.Sprite(sm);sp.scale.setScalar(.001);sp.frustumCulled=false;sp.userData.gbG=1;sp.renderOrder=5;SF.glow.push(sp)}scene.add(m,...SF.glow)}
{const _lp=ldPrewarm;ldPrewarm=async function(...a){try{SF_init()}catch(e){console.warn('sf init',e)}return _lp.apply(this,a)}}
// speed + boost of the player, km/h
function SF_state(){if(SF.force)return SF.force;if(!pl)return{kmh:0,b:false};if(state==='roam')return{kmh:Math.abs(RO.v||0)*3.6,b:!!(RO.boosting||(typeof B2K!=='undefined'&&B2K.bash))};
  return{kmh:Math.abs(pl.v||0)*3.6,b:!!(pl.nitro||pl.turbo>0||pl.boost>0)}}
// camera feel, after the game camera (roamCam / updateCam) placed it this frame
function SF_cam(dt){if(!SF.on||!SF.el)return;const t0=performance.now();dt=Math.min(.1,dt||.016);SF.t+=dt;const S=SF_state(),hi=clamp((S.kmh-90)/60,0,1),b=S.b&&S.kmh>20;SF.kmh=S.kmh;SF.b=b;
  if(b&&!SF.wasB){SF.fl=1;SF.starts++;fovKick=Math.max(fovKick||0,10);shake=Math.max(shake||0,.12);try{AU.sfx('whoosh')}catch(e){}}SF.wasB=b;
  SF.bE+=((b?1:0)-SF.bE)*(1-Math.exp(-dt*(b?7:3)));SF.fl*=Math.exp(-dt*5);
  const K=typeof fxK==='function'?fxK():1,tgt=(S.kmh<90?0:.3+.4*hi)+(b?.25:0);SF.op+=(Math.min(.75,tgt*K*TUNE.fxLines)-SF.op)*(1-Math.exp(-dt*8));if(SF.op<.004)SF.op=0;
  SF.vg=Math.min(1,(.55*SF.bE+.6*SF.fl)*K);const on=(state==='roam'||state==='race')&&!!pl;
  SF.el.style.opacity=on?SF.op.toFixed(3):'0';SF.vgEl.style.opacity=on&&SF.vgOn?SF.vg.toFixed(3):'0';
  if(SF.jit&&on&&SF.op>0&&(SF.msN&1)===0)SF.el.style.transform=`rotate(${((Math.random()-.5)*1.2).toFixed(2)}deg) scale(${(1+Math.random()*.035+.03*SF.bE).toFixed(3)})`;
  // pull-back (eased, ≤ 0.9 m) and a fine shake at speed; the game camera sets camera.position from scratch every frame, so nothing accumulates
  if(on){SF.pull+=((.45*hi+.45*SF.bE)-SF.pull)*(1-Math.exp(-dt*3));const sh=(.025*hi+.03*SF.bE)*TUNE.fxShake;camera.translateZ(SF.pull);
    if(sh>0){camera.position.y+=Math.sin(SF.t*53)*sh;camera.position.x+=Math.sin(SF.t*41+1.3)*sh*.7}
    // boost FOV ease (roam: stays inside the feel-r21a cap, which runs before this)
    if(SF.bE>.01){const cap=state==='roam'&&typeof F21!=='undefined'&&F21.on&&F21.rest?F21.rest+F21.max:1e9;camera.fov=Math.min(cap,camera.fov+3*SF.bE);camera.updateProjectionMatrix()}}
  {const m=typeof B2K!=='undefined'&&B2K.el;if(m)m.classList.toggle('sfB',b)}
  SF.lastT=performance.now();SF.ms+=SF.lastT-t0;SF.msN++}
// hide the overlay when the drive camera stops (menu, pause, garage): it would keep its last opacity
setInterval(()=>{try{if(SF.el&&(state!=='roam'&&state!=='race'||performance.now()-(SF.lastT||0)>1000)){SF.el.style.opacity='0';SF.vgEl.style.opacity='0';SF.op=SF.vg=0;const m=typeof B2K!=='undefined'&&B2K.el;if(m)m.classList.remove('sfB')}}catch(e){}},250);
roamCam=(f=>function(dt){f.apply(this,arguments);try{if(state==='roam')SF_cam(dt)}catch(e){SF.err=String(e)}})(roamCam);
updateCam=(f=>function(dt){const r=f.apply(this,arguments);try{if(state==='race')SF_cam(dt)}catch(e){SF.err=String(e)}return r})(updateCam);
// B2K_box clamps the half length to 4 car-local units, but the bigger LEGO cars reach 5.4: the thrusters (and these jets) sat inside the rear bodywork,
// so a boost showed nothing. Shift them to the real rear bumper (raw box), +0.15.
function SF_ext(){const bx=B2K.tbox,mesh=B2K.tCar;if(!bx||!bx.raw||!mesh)return 0;const rs=B2K_rear(mesh),e=rs>0?bx.raw[1][2]-(bx.cz+bx.hl):(bx.cz-bx.hl)-bx.raw[0][2];return Math.max(0,e)+.15}
function SF_rearFix(){if(!B2K.turb||!B2K.turb.visible)return;const e=SF_ext();if(e<=0)return;const rs=B2K_rear(B2K.tCar),T=new THREE.Matrix4().makeTranslation(0,0,rs*e);const S=new THREE.Matrix4().makeScale(1.25,1.25,2.4),fg=B2K.turbG.flame;for(const u of B2K.turb.units)for(const m of u.parts){m.userData.L.premultiply(T);if(m.geometry===fg)m.userData.L.multiply(S)}
  B2K.turbG.mF.blending=THREE.AdditiveBlending}/* the flame cone: 2.4x longer, additive blue-white = a jet, not a small orange cone */
// boost jets: emitted at the B2K thruster nozzles, world-space trail (the car drives away from them)
function SF_jets(s,on,dt){const t0=performance.now();if(!SF.P){SF_init();if(!SF.P)return}const P=SF.P,par=s&&s.mesh&&s.mesh.parent;if(!par)return;dt=Math.min(.05,dt||.016);
  if(P.m.parent!==par){par.add(P.m,...SF.glow)}const mesh=B2K.tCar,bx=B2K.tbox,k=B2K.turbS;
  const em=on&&k>.3&&mesh&&bx&&s.mesh.visible&&!(SF.force&&SF.force.off);let n=0;const pos=P.g.attributes.position.array,col=P.g.attributes.color.array,pt=new THREE.Vector3(),bk=new THREE.Vector3();
  if(em){mesh.updateMatrixWorld();const fz=bx.hl/2.2,rs=B2K_rear(mesh),tz=bx.cz+rs*(bx.hl+SF_ext()+.24*fz+.3*k*fz),ty=bx.y0+Math.min(bx.hh*.4,.5*fz);bk.set(0,0,rs).transformDirection(mesh.matrixWorld);
    const rate=(B2K.bash?150:110)*(1+SF.fl),inv=new THREE.Matrix4().copy(par.matrixWorld).invert();
    for(let u=0;u<2;u++){const sd=u?1:-1;pt.set(sd*bx.hw*.4,ty,tz).applyMatrix4(mesh.matrixWorld).applyMatrix4(inv);const g=SF.glow[u];g.position.copy(pt);g.scale.setScalar((1+.6*SF.fl+(B2K.bash?.4:0))*k*fz*(.9+.2*Math.random()));
      const lp=SF.lastPos[u];let cnt=rate*dt+Math.random();for(const q of P.p){if(cnt<1)break;if(q.l>0)continue;cnt--;const f=Math.random();q.L=.12+Math.random()*.1;q.l=q.L;
        q.x=lp?lp.x+(pt.x-lp.x)*f:pt.x;q.y=lp?lp.y+(pt.y-lp.y)*f:pt.y;q.z=lp?lp.z+(pt.z-lp.z)*f:pt.z;const sp=4+Math.random()*4;q.vx=bk.x*sp+(Math.random()-.5);q.vy=bk.y*sp+Math.random()*.6;q.vz=bk.z*sp+(Math.random()-.5)}
      SF.lastPos[u]=(lp||new THREE.Vector3()).copy(pt);g.visible=true}}
  else{SF.lastPos[0]=SF.lastPos[1]=null;for(const g of SF.glow){g.visible=false;g.scale.setScalar(.001)}}
  for(const q of P.p){if(q.l<=0)continue;q.l-=dt;if(q.l<=0)continue;q.x+=q.vx*dt;q.y+=q.vy*dt;q.z+=q.vz*dt;const a=q.l/q.L,i=n*3;pos[i]=q.x;pos[i+1]=q.y;pos[i+2]=q.z;
    // white-hot core → cyan → deep blue, fading out (additive: dimmer = more transparent)
    const a2=a*a;col[i]=(.25+.75*a2)*a2*1.4;col[i+1]=(.55+.45*a)*a2*1.4;col[i+2]=a2*1.6;n++}
  P.g.setDrawRange(0,n);if(n){P.g.attributes.position.needsUpdate=true;P.g.attributes.color.needsUpdate=true}SF.nAlive=n;SF.ms+=performance.now()-t0}
// TURBO pickups and race turbo/nitro set RO.turbo / s.nitro but B2K only popped the thrusters for the BOOST button: the "TURBO shows no visible effect" of BENCH_2K
B2K_turbines=(f=>function(s,on,dt){if(SF.force&&SF.force.b&&s===pl)on=true;else if(SF.on&&!on&&s===pl)try{on=SF_state().b}catch(e){}f.call(this,s,on,dt);if(!SF.on)return;try{SF_rearFix()}catch(e){}try{if(B2K.turbG&&B2K.turbS>.02){B2K.turbG.mF.color.setRGB(.55,.88,1).multiplyScalar(1.6*Math.max(.2,TUNE.fxFlI))}SF_jets(s,on,dt)}catch(e){SF.err=String(e)}})(B2K_turbines);
window.__sf={st:()=>({on:SF.on,op:+SF.op.toFixed(3),vg:+SF.vg.toFixed(3),kmh:Math.round(SF.kmh),b:SF.b,jets:SF.nAlive,glow:SF.glow.filter(g=>g.visible).length,fov:+camera.fov.toFixed(1),pull:+SF.pull.toFixed(2),starts:SF.starts,err:SF.err||null}),
  hold:(kmh,b)=>{SF.force=kmh==null?null:{kmh,b:!!b}}};/* shot helper: __sf.hold(130,true) holds the speed/boost look; __sf.hold() releases */
// ---- GO why/speedfeel: the roam camera and the boost path stepped by hand at fixed speeds (no real-time play), then a 6x CPU frame budget A/B
async function SF_go(){const R2=[],ck=(m,b)=>{R2.push((b?'✓ ':'✗ ')+m);return b},W=ms=>new Promise(r=>setTimeout(r,ms));if(state!=='roam'||!RO.on||!pl)return'📍 SPEEDFEEL · start free roam first ❌ FAIL';if(!SF.on||!SF.el)return'📍 SPEEDFEEL · module off ❌ FAIL';
  const o={v:RO.v,bo:RO.boosting,ni:pl.nitro,sn:camSnap,fr:RO.frozen,tu:RO.turbo},rs=()=>{RO.v=o.v;RO.boosting=o.bo;pl.nitro=o.ni;camSnap=o.sn;RO.turbo=o.tu;SF.force=null},
    run=(kmh,b,n)=>{SF.force={kmh,b};RO.v=kmh/3.6;RO.boosting=b;pl.nitro=b;RO.turbo=b?.5:0;for(let k=0;k<n;k++){roamCam(1/60);B2K_turbines(pl,b,1/60)}};let ok=true;
  try{camSnap=true;run(0,false,90);const f0=camera.fov,op0=SF.op;run(50,false,120);const f50=camera.fov,op50=SF.op;run(130,false,180);const f130=camera.fov,op130=SF.op,pu=SF.pull;
    run(130,true,4);const j4=SF.nAlive,fl=SF.vg;run(130,true,90);const fB=camera.fov,opB=SF.op,jB=SF.nAlive,gB=SF.glow.filter(g=>g.visible).length,pulse=B2K.el&&B2K.el.classList.contains('sfB');
    ok&=ck(`FOV rest ${f0.toFixed(1)}° → 130 km/h +${(f130-f0).toFixed(1)}° (≥ 4) → boost +${(fB-f0).toFixed(1)}° (≥ f130 + 1 or at the +12 cap, ≤ 12.05)`,f130-f0>=4&&(fB-f130>=1||fB-f0>=11.9)&&fB-f0<=12.05);
    ok&=ck(`streaks 0/50/130/boost = ${op0.toFixed(2)}/${op50.toFixed(2)}/${op130.toFixed(2)}/${opB.toFixed(2)} (0, 0, ≥ 0.3, ≥ 0.5)`,op0===0&&op50===0&&op130>=.3&&opB>=.5);
    ok&=ck(`pull-back at 130 km/h ${pu.toFixed(2)} m (≥ 0.25)`,pu>=.25);
    ok&=ck(`boost jets ${j4} after 4 frames, ${jB} held (≥ 20), glow sprites ${gB} (2), start flash ${fl.toFixed(2)} (≥ 0.4), bar pulse ${pulse?'on':'off'}`,jB>=20&&gB===2&&fl>=.4&&pulse);
    run(130,false,120);ok&=ck(`after boost: jets ${SF.nAlive} (0), glow ${SF.glow.filter(g=>g.visible).length} (0)`,SF.nAlive===0&&SF.glow.every(g=>!g.visible));
  }catch(e){rs();return'📍 SPEEDFEEL · error '+e+' ❌ FAIL'}rs();
  // frame budget at 6x CPU: whole-frame A/B (boost look held vs module off), alternating, plus the module's own CPU time per frame
  if(window.__cdp){const fr=async n=>{const d=[];let t=performance.now();for(let i=0;i<n;i++){await new Promise(r=>requestAnimationFrame(r));const q=performance.now();d.push(q-t);t=q}d.sort((a,b)=>a-b);return d[d.length>>1]},
    set=on=>{SF.on=on;SF.force={kmh:130,b:true};/* both sides boost the B2K thrusters: the A/B isolates this module */if(!on){SF.el.style.opacity='0';SF.vgEl.style.opacity='0';SF.P.g.setDrawRange(0,0);for(const g of SF.glow)g.visible=false}};
    await window.__cdp('Emulation.setCPUThrottlingRate',{rate:6});try{let okA=0,msg='';for(let at=0;at<3&&!okA;at++){/* flake-kill: up to 3 attempts of the whole-frame A/B (a real module cost fails all three; a neighbour process stealing the CPU in one half of a pair fails one) */const A=[],B=[];let m0=0,n0=0;await fr(20);for(let r=0;r<3;r++){set(false);await fr(10);A.push(await fr(40));set(true);await fr(10);m0-=SF.ms;n0-=SF.msN;B.push(await fr(40));m0+=SF.ms;n0+=SF.msN}
      set(true);SF.force=null;const md=x=>x.slice().sort((p,q)=>p-q)[1],a=md(A),b=md(B),self=n0?m0/n0:0,noise=(Math.max(...A)-Math.min(...A))/a,dP=(b-a)/a;
      okA=self/a<=.05&&dP<=.05+noise;msg=`6x CPU frame median off ${a.toFixed(1)} ms / on ${b.toFixed(1)} ms (${(dP*100).toFixed(1)}%, A/A noise ${(noise*100).toFixed(1)}%), module self ${self.toFixed(2)} ms/frame = ${(self/a*100).toFixed(1)}% (≤ 5)`+(at?' [attempt '+(at+1)+']':'')}ok&=ck(msg,okA)}
    finally{await window.__cdp('Emulation.setCPUThrottlingRate',{rate:1});SF.on=true;SF.force=null}}else R2.push('· 6x CPU A/B skipped (no __cdp: run through tChkGo)');
  return'📍 SPEEDFEEL · '+R2.join(' · ')+' → '+(ok?'✅ PASS':'❌ FAIL')}
{const R=()=>{const C=window.__chk;if(!C||!C.GO||!C.items)return false;if(C.GO['why/speedfeel'])return true;
  C.items.push({ver:'why',id:'speedfeel',area:'phone',text:'speed-boost-feel-r22e4 · speed feel + boost VFX (BENCH_2K gaps 1+2): 📍 GO steps the roam camera at 0/50/130 km/h and on boost (no play). Pass line: FOV +4° at 130 and +1° more on boost (≤ +12), edge streaks 0 below 90 km/h and ≥ 0.3/0.5 at 130/boost, pull-back, ≥ 20 jet particles + 2 glows + flash + bar pulse on boost, all gone after it, and ≤ 5% frame time at 6x CPU.'});
  C.GO['why/speedfeel']=['fra','ath'].map(c=>({c,n:'speed feel + boost '+(c==='fra'?'Frankfurt':'Athens'),secs:70,fn:()=>{SF_go().then(m=>goSay(m),e=>goSay('📍 SPEEDFEEL · error '+e+' ❌ FAIL'));return'📍 SPEEDFEEL · checking…'}}));return true};
  if(!R()){const t=setInterval(()=>{if(R())clearInterval(t)},250)}}
