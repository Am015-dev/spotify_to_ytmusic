# CAR25 (coordinator scope for Alex): (1) race tracks at a car's scale: 22-60 m (built for 7 m hover ships) -> 14-20 m (0.38 x,
#        clamped); every lateral offset (grid, lanes, pads, chicanes, tram, wall item, AI hold lines) scales with it; car contact box 2.5 m.
#        (2) double-tap left/right (touch, A/D, arrows) = sideways SMASH lunge (upright, no barrel roll, 1 s cooldown), in races and the city.
#        (3) BOOST is plain boost again; race contact is only a bump; city traffic wrecks on a lunge or an impact above 150 km/h. 3 SMASH hits wreck a rival, 1 wrecks traffic.
#        (4) rival health bars with name + class; (5) form swap under 0.3 s; (6) camera clamped inside the race walls, crash cam rarer.
exec(open('P.py').read())
if 'CR_trackW' in s:
    print('OK');raise SystemExit
assert 'CR_SPDCAM' in s, 'needs pCAR24 (live)'
# (1) width
R("W=def.w||48;HALF=W/2;MARGIN=HALF-3.2;","W=CR_trackW(def.w||48);HALF=W/2;MARGIN=HALF-1.5;CR_LS=W/(def.w||48);")
R("c.lane=Math.floor(R()*4);c.x=c.tx=LANES[c.lane];","c.lane=Math.floor(R()*4);c.x=c.tx=LANES[c.lane]*CR_LS;")
R("c.lane=clamp(c.lane+(R()<.5?-1:1),0,3);c.tx=LANES[c.lane]}","c.lane=clamp(c.lane+(R()<.5?-1:1),0,3);c.tx=LANES[c.lane]*CR_LS}")
R("s.x=col?8:-8;if(n===1)","s.x=(col?8:-8)*CR_LS;if(n===1)")
R("laneBias:rr(-4,4),","laneBias:rr(-4,4)*CR_LS,")
R("for(const x of[-14,0,14])pads.push({s,x,type:'item'})","for(const x of[-14,0,14])pads.push({s,x:x*CR_LS,type:'item'})")
R("pads.push({s,x:[-12,0,12][placed%3],type:'boost'})","pads.push({s,x:[-12,0,12][placed%3]*CR_LS,type:'boost'})")
R("x:sd*(MARGIN-5),type:'boost'","x:sd*(MARGIN-5*CR_LS),type:'boost'")
R("x:side*(MARGIN-1-k*1.6),hw:.9","x:side*(MARGIN-(1+k*1.6)*CR_LS),hw:.9")
R("x:side*(MARGIN-off),hw:1.8","x:side*(MARGIN-off*CR_LS),hw:1.8")
R("x:side*(MARGIN-9+k*1.7),hw:.9","x:side*(MARGIN-(9-k*1.7)*CR_LS),hw:.9")
R("x:(k?1:-1)*(MARGIN-5),hw:1.8","x:(k?1:-1)*(MARGIN-5*CR_LS),hw:1.8")
R("s.holdX=clamp(s.x+s.v*Math.sin(s.beta)*.17,-(MARGIN-3.5),MARGIN-3.5)","s.holdX=clamp(s.x+s.v*Math.sin(s.beta)*.17,-(MARGIN-3.5*CR_LS),MARGIN-3.5*CR_LS)")
R("const edge=Math.abs(s.x)-(MARGIN-5);","const edge=Math.abs(s.x)-(MARGIN-5*CR_LS);")
R("xt=clamp(m.x+(m.x>0?-7:7),-MARGIN+1,MARGIN-1)","xt=clamp(m.x+(m.x>0?-4:4),-MARGIN+1,MARGIN-1)")
R("x:clamp(s.x,-MARGIN+7,MARGIN-7),owner:s,life:25,arm:.3,w:6.5}","x:clamp(s.x,-Math.max(0,MARGIN-3),Math.max(0,MARGIN-3)),owner:s,life:25,arm:.3,w:Math.min(6.5,W*.3)}")
R("if(Math.abs(dd)<6.2&&Math.abs(dx)<3.6){","if(Math.abs(dd)<5.4&&Math.abs(dx)<2.5){")
R("const push=(3.6-Math.abs(dx))*.5","const push=(2.5-Math.abs(dx))*.5")
# (2) lunge: re-enable the double-tap (it was zeroed), upright, short sideways dash, 1 s cooldown, ground only
R("s.rollCd=Math.max(0,s.rollCd-H);pressed.roll=0;","s.rollCd=Math.max(0,s.rollCd-H);")
R("if(pressed.roll&&s.rollCd<=0&&s.rollT<=0){","if(pressed.roll&&s.rollCd<=0&&s.rollT<=0&&!s.air){")
R("s.rollCd=2;s.rollHit=false;AU.sfx('roll');if(s.air){award(s,'BARREL ROLL',20,500,'#ffd12c');AU.sfx('style')}}","s.rollCd=1;s.rollHit=false;AU.sfx('roll');CR_lgFx(s)}")
R("if(s.rollT>ROLL_T-.32&&!s.air&&!s.crSR)s.x+=s.rollDir*18*H}","if(s.rollT>ROLL_T-.32&&!s.air&&!s.crSR)s.x=clamp(s.x+s.rollDir*CR_LGV*H,-MARGIN,MARGIN)}")
R("roll+=s.rollDir*-Math.PI*2*(p<.5?2*p*p:1-(-2*p+2)**2/2)","roll+=s.rollDir*-.1*Math.sin(Math.PI*p)")
R("!(s.rollT>0)&&","")
R("||(s.rollT>0)||","||")
R("(P.rollT>ROLL_T-.32?P.rollDir*18:0)","(P.rollT>ROLL_T-.32?P.rollDir*CR_LGV:0)")
# (3) contact: no takedown on boost/speed; the lunge hit counts (3 = wreck)
R("if(state==='race'&&!P.finished&&((P.nitro||P.turbo>0||P.boost>0||P.v>CR_SMASHV)||rearRam)&&O.dead<=0)takedown(O);\n        else if(state==='race'&&!P.finished&&P.rollT>0&&P.rollDir===toward&&!P.rollHit){P.rollHit=true;O.x+=toward*3;hitShip(O,28,.25,toward*2.5,P);AU.sfx('crash');shake=Math.max(shake,.4)}",
  "if(state==='race'&&!P.finished&&P.rollT>ROLL_T-.4&&P.rollDir===toward&&!P.rollHit&&O.dead<=0){P.rollHit=true;CR_lgHit(P,O,toward)}")
R("if(s.nitro||s.shield>0||s.rollT>0||s.turbo>0||s.boost>0||s.v>CR_SMASHV){wreckTraffic(c,s,1.2);if(s.isPlayer)CR_smashHit();s.v*=.94;if(s.rollT<=0&&!s.air&&s.rollCd<=0){s.rollT=ROLL_T;s.rollDir=Math.sign(dx||1);s.crSR=1;s.rollCd=1.2}award(",
  "if(s.shield>0||s.rollT>0){wreckTraffic(c,s,1.2);if(s.isPlayer)CR_smashHit();s.v*=.97;award(")
R("const rel=Math.max(0,s.v-c.v);if(s.v>CR_SMASHV){wreckTraffic(c,s,.8);","const rel=Math.max(0,s.v-c.v);if(0){wreckTraffic(c,s,.8);")
R("const crSm=!!(pl&&(pl.nitro||RO.boosting||RO.turbo>0));if(!crSm&&Math.abs(RO.v)<=CR_SMASHV){if(Math.abs(RO.v)>4&&(c.crB||0)<=0){c.crB=.5;const rx=RO.x-x,rz=RO.z-z,rl=Math.hypot(rx,rz)||1;RO.x+=rx/rl*.6;RO.z+=rz/rl*.6;RO.v*=.7;",
  "const crLg=(RO.crLg||0)>0,crSm=crLg||Math.abs(RO.v)>CR_SMASHV;if(!crSm){if((c.crB||0)<=0){c.crB=.4;const rx=RO.x-x,rz=RO.z-z,rl=Math.hypot(rx,rz)||1;RO.x+=rx/rl*.9;RO.z+=rz/rl*.9;RO.v=Math.sign(RO.v)*Math.min(Math.abs(RO.v)*.6,(c.cv||8)+4);")
R("}}else if(crSm||Math.abs(RO.v)>10){c.dead=25;","}}else if(1){c.dead=25;")
R("if(pl&&pl.nitro)roamHeal(3);else roamDamage(ho?12:5);","if(pl&&pl.nitro)roamHeal(3);else if(!crLg)roamDamage(ho?12:5);")
# BOOST button: plain BOOST label again
R("""if(!b.querySelector('.crSm')){const t=b.textContent.trim();if(t==='BOOST'){b.innerHTML='BOOST<span class="crSm">SMASH</span>'}}""","""if(b.querySelector('.crSm'))b.textContent='BOOST';""")
# empty-BOOST tip goes LEFT of the button (the zone plate / toasts live top-right), and the BOOST button is solid
R("d.style.left=Math.max(8,Math.min(innerWidth-d.offsetWidth-8,r.left+r.width/2-d.offsetWidth/2))+'px';d.style.top=Math.max(8,r.top-d.offsetHeight-10)+'px';",
  "d.style.left=Math.max(8,r.left-d.offsetWidth-12)+'px';d.style.top=Math.max(8,Math.min(innerHeight-d.offsetHeight-8,r.top+r.height/2-d.offsetHeight/2))+'px';")
# (5) form swap: surface hold 0.35 -> 0.1 s, morph 0.38 -> 0.15 s, hover/float blend 3x faster
R("FL_HOLD=.35","FL_HOLD=.1")
R("const rt=dt*2.6;s.bt=","const rt=dt*6.5;s.bt=")
R("const bk=s.boatK=(s.boatK||0)+((s.boatMode?1:0)-(s.boatK||0))*Math.min(1,dt*5),hover","const bk=s.boatK=(s.boatK||0)+((s.boatMode?1:0)-(s.boatK||0))*Math.min(1,dt*14),hover")
R("const bk=s.boatK=(s.boatK||0)+((s.boatMode?1:0)-(s.boatK||0))*Math.min(1,dt*5),dk=s.dirtK=(s.dirtK||0)+((s.dirtMode?1:0)-(s.dirtK||0))*Math.min(1,dt*6);",
  "const bk=s.boatK=(s.boatK||0)+((s.boatMode?1:0)-(s.boatK||0))*Math.min(1,dt*14),dk=s.dirtK=(s.dirtK||0)+((s.dirtMode?1:0)-(s.dirtK||0))*Math.min(1,dt*14);")
# (6) crash cam: at most one every ~9 s
R("ccCool=d+3.5;","ccCool=d+7;")
JS0=r'''
function CR_trackW(w){return Math.min(20,Math.max(14,w*.38))}
var CR_LS=1;const CR_LGV=12;
'''
JS=r'''
// ---- CAR25: SMASH lunge (double-tap left/right) -------------------------------------------------------------------
function CR_lgFx(s){try{fovKick=Math.max(fovKick,5);const at=s.mesh.position.clone();at.y+=.6;burst(SPARK,at,10,8,.25,new THREE.Color(1.6,1.4,1))}catch(e){}}
function CR_lgHit(P,O,tw){O.x=clamp(O.x+tw*2.2,-MARGIN,MARGIN);O.v*=.88;O.yawRate+=tw*1.4;O.lastHit=raceT;O.hull-=34;CR_smashHit();
 if(O.hull<=0){O.hull=0;takedown(O)}else{const n=Math.round((100-O.hull)/34);award(P,'SMASH '+n+'/3 · '+O.name,10,300,'#ffd12c');AU.sfx('crash');try{rivalHit(O,'hurt')}catch(e){}}}
const CR_LG={d:0,t:0};
function CR_lgTap(d){const n=performance.now();if(CR_LG.d===d&&n-CR_LG.t<300){CR_LG.t=0;CR_lgGo(d)}else{CR_LG.d=d;CR_LG.t=n}}
function CR_lgGo(d){if(state!=='roam'||!pl||RO.wk||RO.frozen||RO.card||RO.mapOpen||RO.story||pl.air||(RO.crLgCd||0)>0||(RO.crLg||0)>0)return;
 RO.crLg=.3;RO.crLgD=d;RO.crLgCd=1;RO.crLgN=(RO.crLgN||0)+1;AU.sfx('roll');CR_lgFx(pl)}
addEventListener('keydown',e=>{if(e.repeat||state!=='roam')return;const d={ArrowLeft:-1,KeyA:-1,ArrowRight:1,KeyD:1}[e.code];if(d)CR_lgTap(d)});
BZ.addEventListener('touchstart',e=>{if(state!=='roam')return;const t=e.changedTouches[0];if(t)CR_lgTap(bzSide(t))},{passive:true});
// the lunge moves the car sideways (screen left/right) for 0.3 s; it stops at walls
roamStep=(f=>function(dt){if(state==='roam')pressed.roll=0;const r=f(dt);try{if(state==='roam'&&pl&&!RO.wk){RO.crLgCd=Math.max(0,(RO.crLgCd||0)-dt);
 if(RO.crLg>0){RO.crLg-=dt;const k=CR_LGV*dt*RO.crLgD,nx=RO.x-Math.cos(RO.h)*k,nz=RO.z+Math.sin(RO.h)*k;if(!roamHit(nx,nz,1.2,RO.y)){RO.x=nx;RO.z=nz}else RO.crLg=0}}}catch(e){}return r})(roamStep);
// ---- CAR25: solid BOOST button (dark when empty, filled cyan when there is boost to use)
(()=>{const st=document.createElement('style');st.textContent=`html body #tN{background:#08324a!important;opacity:1!important;color:#7ff3ff!important;font-weight:900}html body #tN.crOn{background:radial-gradient(circle at 50% 35%,#8ff7ff,#16b4d6 70%)!important;color:#022331!important;border-color:#d6fbff!important;box-shadow:0 0 14px rgba(76,234,255,.6)}`;document.head.appendChild(st)})();
setInterval(()=>{try{const b=document.getElementById('tN');if(b&&pl)b.classList.toggle('crOn',(pl.bm||0)>(state==='race'?.5:1))}catch(e){}},120);
// ---- CAR25: rival health bars (name + class) over the nearest rivals ----------------------------------------------------
(()=>{const st=document.createElement('style');st.textContent=`#crHB{position:fixed;inset:0;pointer-events:none;z-index:6}#crHB .hb{position:absolute;transform:translate(-50%,-100%);text-align:center;white-space:nowrap;font:800 12px/1.1 system-ui;color:#fff;text-shadow:0 1px 2px #000}#crHB .hb small{display:block;font-weight:700;font-size:12px;color:#ffd12c}#crHB .hb i{display:block;width:64px;height:6px;margin:3px auto 0;border-radius:3px;background:rgba(0,0,0,.55);box-shadow:0 0 0 1px rgba(255,255,255,.5);overflow:hidden}#crHB .hb i b{display:block;height:100%;background:#4cff7a}#crHB .hb i b.md{background:#ffd12c}#crHB .hb i b.lo{background:#ff3b55}body.cine #crHB{display:none}`;document.head.appendChild(st)})();
const CR_HB={el:null,pool:[],v:V3()};
function CR_hbStep(){let E=CR_HB.el;if(!E){E=CR_HB.el=document.createElement('div');E.id='crHB';document.body.appendChild(E)}
 const on=state==='race'&&pl&&!CC&&!paused;if(!on){if(E.childElementCount)for(const d of CR_HB.pool)d.style.display='none';return}
 const L=[];for(const s of ships){if(s===pl||s.dead>0||s.eliminated||s.finished)continue;const dd=s.dist-pl.dist;if(dd<-12||dd>90)continue;L.push([Math.abs(dd),s])}L.sort((a,b)=>a[0]-b[0]);
 let k=0;for(const[,s]of L.slice(0,4)){const v=CR_HB.v.copy(s.mesh.position).add(s.mesh.userData.m.position);v.y+=2.4;v.project(camera);if(v.z>1||Math.abs(v.x)>1.05||Math.abs(v.y)>1.05)continue;
  let d=CR_HB.pool[k];if(!d){d=document.createElement('div');d.className='hb';d.innerHTML='<span></span><small></small><i><b></b></i>';E.appendChild(d);CR_HB.pool.push(d)}k++;
  const h=clamp(s.hull,0,100),b=d.lastChild.firstChild,cl=(CR_LOAD[s.vmode||'car']||CR_LOAD.car).k;if(d._n!==s.name+cl){d._n=s.name+cl;d.firstChild.textContent=s.name;d.children[1].textContent=cl}
  b.style.width=h+'%';b.className=h>66?'':h>33?'md':'lo';d.style.display='';d.style.left=((v.x+1)/2*innerWidth).toFixed(0)+'px';d.style.top=((1-v.y)/2*innerHeight).toFixed(0)+'px'}
 for(let i=k;i<CR_HB.pool.length;i++)CR_HB.pool[i].style.display='none'}
// ---- CAR25: race camera never leaves the track box (walls at +-HALF)
const _cr25F=mkF(),CR_CAMX={pre:0,n:0};
window.__cr25={get cars(){return HUB.cars},get ships(){return ships},get traffic(){return traffic},get W(){return W},get HALF(){return HALF},get MARGIN(){return MARGIN},get CC(){return !!CC},cam:CR_CAMX,get LS(){return CR_LS}};
updateCam=(f=>function(dt,snap){f(dt,snap);try{CR_hbStep()}catch(e){}try{if((state!=='race'&&state!=='countdown'&&state!=='finished')||!TD)return;const s=CC&&CC.s?CC.s:pl;if(!s)return;
 frameAt(TD,s.dist,F2);const c=camera.position,al=(c.x-F2.p.x)*F2.t.x+(c.y-F2.p.y)*F2.t.y+(c.z-F2.p.z)*F2.t.z;frameAt(TD,s.dist+al,_cr25F);const F=_cr25F;
 const rx=c.x-F.p.x,ry=c.y-F.p.y,rz=c.z-F.p.z,l=rx*F.r.x+ry*F.r.y+rz*F.r.z,lim=HALF-.9;CR_CAMX.pre=Math.max(CR_CAMX.pre,Math.abs(l)/HALF);if(Math.abs(l)<=lim)return;CR_CAMX.n++;const dl=Math.sign(l)*lim-l;c.addScaledVector(F.r,dl);
 if(CC&&CC.s){const w=CC.s;camera.lookAt(w.mesh.position.clone().add(w.mesh.userData.m.position))}else camera.lookAt(camLook)}catch(e){}})(updateCam);
'''
import re
m=re.search(r'<script type="module">(.*?)</script>',s,re.S)
s=s[:m.end(1)]+JS+s[m.end(1):]
m=re.search(r'<script type="module">(.*?)</script>',s,re.S)
s=s[:m.start(1)]+JS0+s[m.start(1):]
save()
print('OK')
