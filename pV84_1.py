# pV84_1 · "visuals and feel" (Alex played v83: "horrible and uncontrollable"). HUD diet, controls, steering, light, camera, start. Module v84.js.
exec(open('P.py').read())
R('window.__mho={',open('v84.js').read()+'\nwindow.__mho={')
# steering: yaw rate falls hard with speed (was 2.5-1.3*vr: 70 deg/s at top speed), softer ease, stronger road auto-align when no input
R("const sp=Math.abs(RO.v),vr=clamp(sp/Math.max(30,top),0,1),maxR=(2.5-1.3*vr)*","const sp=Math.abs(RO.v),vr=clamp(sp/Math.max(30,top),0,1),maxR=(2.3-1.6*vr)*")
R("RO.yr=(RO.yr||0)+(ytg-(RO.yr||0))*Math.min(1,dt*(c.steer||RO.dDir?14:18));","RO.yr=(RO.yr||0)+(ytg-(RO.yr||0))*Math.min(1,dt*(c.steer||RO.dDir?7:10));")
R("RO.v>15&&Math.abs(c.steer)<.05){","RO.v>10&&Math.abs(c.steer)<.05){")
R("if(Math.abs(e)<.3)ytg+=e*.6*clamp((sp-15)/25,0,1)*(1-Math.abs(e)/.6)}","if(Math.abs(e)<.5)ytg+=e*1.7*clamp((sp-10)/20,0,1)*(1-Math.abs(e)/.8)}")
# drift = brake while steering at speed (touch); drifting does not brake hard
R("const hbOk=c.hb&&!air&&sp>14&&!busy;","const dbk=TOUCH.used&&c.brk&&!c.park&&Math.abs(c.steer)>.25&&RO.v>18,hbOk=(c.hb||dbk)&&!air&&sp>14&&!busy;")
R("else if(c.brk){if(RO.v>0){RO.v=Math.max(0,RO.v-75*dt);","else if(c.brk){if(RO.v>0){RO.v=Math.max(0,RO.v-(TOUCH.used&&Math.abs(c.steer)>.25&&RO.v>18?16:75)*dt);")
# light: v83 was over-exposed (white / lavender ground, haze)
R("fog:'#cfe5ff',fogD:.0005,hemi:['#eaf4ff','#6f8a52',1.45],key:['#fff6e6',2.9,[500,800,300]],exp:1.04,bloom:[.14,.4]",
  "fog:'#b9d8f5',fogD:.00018,hemi:['#d6e8ff','#5a7a40',.95],key:['#fff0d6',2.0,[500,800,300]],exp:.95,bloom:[.04,.3]")
R("fog:'#efe2c8',hemi:['#fff4e0','#9a8a5a',1.45],key:['#fff0d6',3.0,[500,800,300]]}","fog:'#e6d6b0',fogD:.00018,hemi:['#ffefd0','#7a6a3a',.95],key:['#ffe6bc',2.1,[500,800,300]],exp:.95,bloom:[.04,.3]}",2)
R("fog:'#c4d8ee',fogD:.0009,hemi:['#d8ecff','#6b6458',1.25],key:['#fff2dc',2.7,[400,700,250]],exp:1.0,bloom:[.28,.45]","fog:'#b9d4ee',fogD:.0003,hemi:['#d0e4ff','#5a5448',1.0],key:['#fff2dc',2.1,[400,700,250]],exp:.95,bloom:[.06,.3]")
# HUD diet on touch while driving: minimap, speed, one objective line, pause. Everything else lives in the pause menu / shows at mission start+end.
R('</style>','''
/* V84: phone HUD diet + controls (◀ ▶ left; GAS, BRAKE, BOOST right; drift = brake + steer) */
body.touch[data-mode=roam] #roamHorn,body.touch[data-mode=roam] #roamVeh,body.touch[data-mode=roam] #roamMapBtn,body.touch[data-mode=roam] #roamExit,
body.touch[data-mode=roam] #roamPlate,body.touch[data-mode=roam] #roamStuds,body.touch[data-mode=roam] #m1Next,body.touch[data-mode=roam] #tF,body.touch[data-mode=roam] #tD,
body.touch #rgGb,body.touch #rgTip,body.touch #rgBar,body.touch #rgHull{display:none!important}
body.touch #roamGauge{min-width:0!important;padding:4px 12px!important}
</style>''')
R("color:CID==='fra'?0xffffff:0xc6bba6})","color:CID==='fra'?0x9a9284:0x948a76})")
R("roughness:.7,metalness:0,color:0xcdc3b0})","roughness:.7,metalness:0,color:0x9a9080})")
save()
