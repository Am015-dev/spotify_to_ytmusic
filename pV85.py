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
# one objective line: "Deliver → 78 m"
R("${ch?'NEXT':tg.ev||tg.name?markTitle(tg):''} · ${Math.round(Math.hypot(dx,dz))} m","${ch?v85Verb(ch):tg.ev||tg.name?markTitle(tg):''} → ${Math.round(Math.hypot(dx,dz))} m")
R('window.__mho={',open('v85.js').read()+'\nwindow.__mho={')
save()
