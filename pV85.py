# pV85 · clean phone HUD, soft speed-scaled steering with road auto-align, drift = brake+steer, lower camera, no fog/bloom, dark asphalt, road spawn (module v85.js)
exec(open('P.py').read())
# fog / bloom / light: cut fog, less env + hemi wash, no bloom
R("{high:.00042,med:.0006,low:.0008,min:.0011}[L]","{high:.00016,med:.00024,low:.00032,min:.00045}[L]")
R("SET.q==='high'?.00042:.0006","SET.q==='high'?.00016:.00024")
R("fog:'#cfe5ff',fogD:.0005,hemi:['#eaf4ff','#6f8a52',1.45],key:['#fff6e6',2.9,[500,800,300]],exp:1.04,bloom:[.14,.4],win:0,rain:[0,0,0,0],road:[.6,.1,.6],env:1.15,lamps:0}",
  "fog:'#d6e6f8',fogD:.0002,hemi:['#fff8ee','#6f8a52',.8],key:['#fff2dc',2.5,[500,800,300]],exp:.98,bloom:[.03,.4],win:0,rain:[0,0,0,0],road:[.6,.1,.6],env:.4,lamps:0}")
R("hemi:['#fff4e0','#9a8a5a',1.45],key:['#fff0d6',3.0,[500,800,300]]","hemi:['#fff4e0','#9a8a5a',.8],key:['#fff0d6',2.6,[500,800,300]]",2)
R("fog:'#c4d8ee',fogD:.0009,hemi:['#d8ecff','#6b6458',1.25],key:['#fff2dc',2.7,[400,700,250]],exp:1.0,bloom:[.28,.45]","fog:'#c4d8ee',fogD:.0003,hemi:['#fff6ea','#6b6458',.8],key:['#fff2dc',2.5,[400,700,250]],exp:.98,bloom:[.04,.45]")
# grade: the old pivot at .5 (HDR linear) crushed dark surfaces to black and the blue lift/tint turned them navy; neutral tint, pivot at mid-grey, more saturation
R("vec3 grade(vec3 c){c=c*vec3(1.04,.98,1.06)+vec3(.004,-.004,.02)*(1.-c);c=max(c,0.);float l=dot(c,vec3(.2126,.7152,.0722));c=mix(vec3(l),c,1.18);c=(c-.5)*1.08+.5;return max(c,0.);}","vec3 grade(vec3 c){c=c*vec3(1.03,1.0,.99);c=max(c,0.);float l=dot(c,vec3(.2126,.7152,.0722));c=mix(vec3(l),c,1.3);c=(c-.18)*1.1+.18;return max(c,0.);}")
# the day-mood override table (LK look) wins over MOODS: lower key/hemi/env so near-white paving stops blowing out to lavender
R("(function(){const day={brick:{key:['#ffe1b8',3.2,[560,680,340]],hemi:['#c4d8ff','#8c7450',1.2],hor:[1.0,.88,.74],mid:[.36,.6,.98],sun:[2.8,2.15,1.4],exp:.97,env:1.05},\n  athens:{key:['#ffdcaa',3.3,[540,660,-320]],hemi:['#d2e0ff','#9a8058',1.2],hor:[1.02,.86,.66],sun:[3,2.3,1.4],exp:.96,env:1.05},\n  athnoon:{key:['#fff1dc',3.3,[260,980,180]],hemi:['#dce8ff','#a49272',1.35],exp:.97},\n  day:{key:['#ffe6c2',3,[560,680,340]],hemi:['#c8dbff','#8a7652',1.2],exp:.98}};",
  "(function(){const day={brick:{key:['#ffe9c8',2.3,[560,680,340]],hemi:['#fff3e4','#8c7450',.7],hor:[1.0,.88,.74],mid:[.36,.6,.98],sun:[2.8,2.15,1.4],exp:.97,env:.3},\n  athens:{key:['#ffe2b4',2.4,[540,660,-320]],hemi:['#fff0dc','#9a8058',.7],hor:[1.02,.86,.66],sun:[3,2.3,1.4],exp:.96,env:.3},\n  athnoon:{key:['#fff1dc',2.4,[260,980,180]],hemi:['#fff3e4','#a49272',.8],exp:.97},\n  day:{key:['#ffe9c8',2.3,[560,680,340]],hemi:['#fff3e4','#8a7652',.7],exp:.98}};")
# landmark set pieces (parliament, zappeion, stoa, megaro ...): tall walls use the textured plaka facade instead of bare plain boxes
R("const box=(w,h,d,x,y,z,c,ry=0)=>bt.add(cbox(w,h,d,x,y+h/2,z,c,ry),BM.plain),col=",
  "const box=(w,h,d,x,y,z,c,ry=0)=>{if(h>=7&&Math.max(w,d)>=8){const g=bxUV(w,h,d,12,13.2);g.rotateY(ry);g.translate(x,y+h/2,z);bt.add(colorize(g,new THREE.Color(c)),BM.plaka)}else bt.add(cbox(w,h,d,x,y+h/2,z,c,ry),BM.plain)},col=")
# pedestrian-street paving / median ribbons took the node elevation p.y unclamped: on hill/stair nodes they became giant beige walls. Clamp to ground + 1.2 m.
R("y1=Math.max(groundY(p.x,p.z),p.y||0)+.075,y2=Math.max(groundY(o.x,o.z),o.y||0)+.075","y1=Math.min(Math.max(groundY(p.x,p.z),p.y||0),groundY(p.x,p.z)+1.2)+.075,y2=Math.min(Math.max(groundY(o.x,o.z),o.y||0),groundY(o.x,o.z)+1.2)+.075")
R("y1=Math.max(groundY(p.x,p.z),p.y||0)+.16,y2=Math.max(groundY(o.x,o.z),o.y||0)+.16","y1=Math.min(Math.max(groundY(p.x,p.z),p.y||0),groundY(p.x,p.z)+1.2)+.16,y2=Math.min(Math.max(groundY(o.x,o.z),o.y||0),groundY(o.x,o.z)+1.2)+.16")
# simplify the Athens street network: drop residential streets (70 % of all road length) except near named places
R("const cmp=false;raw.push({id:q.id,name:q.name,cls:q.cls,one:q.one,","const cmp=false;if(q.cls==='res'&&!(window.__spt||(window.__spt=Object.values(RF.spots).map(sp=>WP(sp[0],sp[1])))).some(([sx,sz])=>pts.some(([x,z])=>(x-sx)**2+(z-sz)**2<4900)))continue;raw.push({id:q.id,name:q.name,cls:q.cls,one:q.one,")
# dark neutral asphalt with white lane markings; plaza paving no longer near-white
R("g.fillStyle='#5b5f68';g.fillRect(0,0,256,512);for(let i=0;i<3000;i++){const v=70+r()*40|0;","g.fillStyle='#2c2e34';g.fillRect(0,0,256,512);for(let i=0;i<3000;i++){const v=36+r()*28|0;")
R("g.fillStyle='#ffc21a';g.fillRect(121,0,5,512);g.fillRect(130,0,5,512);","g.fillStyle='#f4f4f0';for(let y=0;y<512;y+=128)g.fillRect(125,y,6,64);")
R("color:CID==='fra'?0xffffff:0xc6bba6}),cobble","color:CID==='fra'?0x9a948a:0xc6bba6}),cobble")
# camera: lower and closer behind the car
R("chase:{b:14,bk:5,h:4.8,hk:1.4,l:12,lk:8,ly:2,n:'CHASE'}","chase:{b:8.5,bk:1.8,h:2.8,hk:.5,l:14,lk:8,ly:1.5,n:'CHASE'}")
# steering: soft, speed-scaled, slow ramp, gentle yaw response
R("maxR=(2.5-1.3*vr)*({low:.85,high:1.15}[SET.steer]||1)","maxR=(1.35-.75*vr)*({low:.85,high:1.15}[SET.steer]||1)")
R("Math.min(1,dt*(c.steer||RO.dDir?14:18))","Math.min(1,dt*(c.steer||RO.dDir?6.5:4.5))")
R("const dd=Math.min(dtR||H,.05),r1=rp*1.25;","const dd=Math.min(dtR||H,.05),r1=rp*.8;")
R("const rb=TOUCH.dir?24:16;","const rb=TOUCH.dir?14:7;")
# auto-align to the road heading with no input (touch + keyboard), no snapping: eased target yaw rate
R("if(SET.assist!=='off'&&TOUCH.used&&!air&&!busy&&!RO.dDir&&RO.rdT&&RO.v>15&&Math.abs(c.steer)<.05){const a0=Math.atan2(RO.rdT[0],RO.rdT[1]);let e=angDiff(a0,RO.h);if(Math.abs(e)>Math.PI/2)e=angDiff(a0+Math.PI,RO.h);if(Math.abs(e)<.3)ytg+=e*.6*clamp((sp-15)/25,0,1)*(1-Math.abs(e)/.6)}",
  "if(SET.assist!=='off'&&!air&&!busy&&!RO.dDir&&RO.rdT&&RO.v>6&&Math.abs(c.steer)<.05){const a0=Math.atan2(RO.rdT[0],RO.rdT[1]);let e=angDiff(a0,RO.h);if(Math.abs(e)>Math.PI/2)e=angDiff(a0+Math.PI,RO.h);if(Math.abs(e)<.8)ytg+=e*1.5*clamp((sp-6)/14,0,1)*(1-Math.abs(e)/1.1)}")
# drift = BRAKE while steering at speed (no DRIFT button): the drift replaces the braking
R("return{steer,thr,brk,abL,abR,boost,hb,park:!!TOUCH.park}}","if(TOUCH.on&&TOUCH.used&&brk&&Math.abs(steer)>.25&&state==='roam'&&RO.v>24&&!TOUCH.park){hb=1;brk=0}\n  return{steer,thr,brk,abL,abR,boost,hb,park:!!TOUCH.park}}")
# controls: Pointer Events (+capture) next to the touch events, de-duplicated; same for the ◀ ▶ zone (WKWebView / iframe robustness)
R("function tb(id,down,up){const el=$(id);el.addEventListener('touchstart',e=>{e.preventDefault();AU.init();TOUCH.on=TOUCH.used=true;el.classList.add('down');down(e)},{passive:false});const u=e=>{e.preventDefault();el.classList.remove('down');up()};el.addEventListener('touchend',u,{passive:false});el.addEventListener('touchcancel',u)}",
 "function tb(id,down,up){const el=$(id);let on=false;const dn=e=>{AU.init();TOUCH.on=TOUCH.used=true;el.classList.add('down');if(!on){on=true;down(e)}},uf=e=>{el.classList.remove('down');if(on){on=false;up()}};el.addEventListener('touchstart',e=>{e.preventDefault();dn(e)},{passive:false});el.addEventListener('touchend',e=>{e.preventDefault();uf(e)},{passive:false});el.addEventListener('touchcancel',uf);el.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')return;try{el.setPointerCapture(e.pointerId)}catch(_){}dn(e)});el.addEventListener('pointerup',uf);el.addEventListener('pointercancel',uf);el.addEventListener('lostpointercapture',uf)}")
R("const bzEnd=e=>{for(const t of e.changedTouches)if(t.identifier===TOUCH.bz){TOUCH.bz=null;bzSet(0)}};BZ.addEventListener('touchend',bzEnd);BZ.addEventListener('touchcancel',bzEnd);",
 "const bzEnd=e=>{for(const t of e.changedTouches)if(t.identifier===TOUCH.bz){TOUCH.bz=null;bzSet(0)}};BZ.addEventListener('touchend',bzEnd);BZ.addEventListener('touchcancel',bzEnd);\n{let bp=null;const pe=e=>{if(bp===e.pointerId){bp=null;if(TOUCH.bz==null)bzSet(0)}};BZ.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'||bp!=null)return;bp=e.pointerId;try{BZ.setPointerCapture(e.pointerId)}catch(_){}AU.init();TOUCH.on=TOUCH.used=true;bzSet(bzSide(e))});BZ.addEventListener('pointermove',e=>{if(e.pointerId===bp)bzSet(bzSide(e))});BZ.addEventListener('pointerup',pe);BZ.addEventListener('pointercancel',pe);BZ.addEventListener('lostpointercapture',pe)}")
# --- v85b: bare beige blocks get a procedural window grid; sunset/dawn pink-purple tint toned down; SPEED DEMON sensible + one small line
R("dawn={...f('dawn'),rain:[0,0,0,0],wet:.1,hemi:['#d8b0c8','#4a3038',1.15]","dawn={...f('dawn'),rain:[0,0,0,0],wet:.1,hemi:['#ecd4bc','#4a3038',1.15]")
R("dusk={...f('athdusk'),hemi:['#d0a4bc','#3e2c30',1.05]","dusk={...f('athdusk'),hemi:['#e6c8a8','#3e2c30',1.05]")
R("mid:[.2,.13,.32],hor:[1.0,.46,.26],gnd:[.07,.05,.06],sun:[1.5,.62,.24],star:.4,band:.12,moon:.6,fog:'#4a3046',fogD:.00036,hemi:['#c49cba','#3a2830',.9]","mid:[.32,.26,.42],hor:[1.0,.5,.28],gnd:[.07,.05,.06],sun:[1.5,.62,.24],star:.4,band:.12,moon:.6,fog:'#7a5a4a',fogD:.00036,hemi:['#e0c0a0','#3a2830',.9]")
R("fog:'#5a3a52',fogD:.00030,hemi:['#c8a0c8','#3a2030',1.05]","fog:'#8a6450',fogD:.00030,hemi:['#e8c8b0','#3a2030',1.05]")
R("mid:[.30,.17,.34],hor:[1.15,.46,.26]","mid:[.38,.28,.4],hor:[1.15,.5,.28]")
R("{k:'speed',name:'SPEED DEMON',goal:3,lim:30,u:'s above 400 km/h'}","{k:'speed',name:'SPEED DEMON',goal:3,lim:30,u:'s above 160 km/h'}")
R("Math.abs(RO.v)*3.6>400","Math.abs(RO.v)*3.6>160")
# --- v85e (Alex's race / city feedback)
# unstick: brake counts as input, and candidate exits must be clear of traffic bodies (a bus in an alley)
R("if((c.thr||boost)&&!busy&&!air&&mv<dt*5)RO.stkT","if((c.thr||boost||c.brk)&&!busy&&!air&&mv<dt*5)RO.stkT")
R("roamHit(px,pz,2.4,RO.y))continue;const d=Math.abs(angDiff(ang,RO.h));","roamHit(px,pz,2.4,RO.y)||(HUB.cars||[]).some(q=>!q.dead&&q.x!=null&&Math.hypot(q.x-px,q.z-pz)<5.5))continue;const d=Math.abs(angDiff(ang,RO.h));")
# studs: about 1 in 12 left (demolition pays out); rings: far fewer markers, spaced wider
R("const put=(x,z,y,v0)=>{if(roamHit(x,z,1,y))return;","const put=(x,z,y,v0)=>{if(((RO._pc=(RO._pc||0)+1)%12)!==0||roamHit(x,z,1,y))return;")
R("const OG_N=10,OG_R=105,OG_FADE=[150,270];","const OG_N=3,OG_R=190,OG_FADE=[110,190];")
R("for(let pass=0;pass<2;pass++)for(const s of smp){if(nearest(s[0],s[1],125))continue;let b=null,bd=1e9;for(const q of smp){const d=(q[0]-s[0])**2+(q[1]-s[1])**2;if(d<bd&&d<130*130&&ok(q[0],q[1])&&!nearest(q[0],q[1],45)){bd=d;b=q}}if(b)addEv(b)}",
  "for(let pass=0;pass<2;pass++)for(const s of smp){if(nearest(s[0],s[1],240))continue;let b=null,bd=1e9;for(const q of smp){const d=(q[0]-s[0])**2+(q[1]-s[1])**2;if(d<bd&&d<250*250&&ok(q[0],q[1])&&!nearest(q[0],q[1],110)){bd=d;b=q}}if(b)addEv(b)}")
# race steering: faster ramp + bigger initial kick, quicker yaw response
R("-(up?rp:10)*H,(up?rp:10)*H","-(up?rp*1.8:16)*H,(up?rp*1.8:16)*H")
R("[.3,.36,.42,.48,.55]","[.42,.5,.58,.66,.75]")
R("H*(s.hbDir?8:s.asst?22:14)","H*(s.hbDir?10:s.asst?30:20)")
# one objective line: "Deliver → 78 m"
R("${ch?'NEXT':tg.ev||tg.name?markTitle(tg):''} · ${Math.round(Math.hypot(dx,dz))} m","${ch?v85Verb(ch):tg.ev||tg.name?markTitle(tg):''} → ${Math.round(Math.hypot(dx,dz))} m")
R('window.__mho={',open('v85.js').read()+'\nwindow.__mho={')
save()
