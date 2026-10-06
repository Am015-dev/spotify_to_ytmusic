# CAR15 (Alex on v86k):
#  1 missions: leaving the route / road costs at most ~13 % top speed, eased in over ~0.5 s (was 65 % at once and stuck)
#  3 speed feel: top speed +12 % (city 168 / boost ~215 km/h, race ×1.12), wider FOV with speed, camera pulls back a little
#  5 barrel roll is no longer a standalone move: it plays only as part of a SMASH (boost-ram through traffic)
#  6 cars only break from a SMASH (boost / nitro / turbo ram) or an impact above 150 km/h; anything slower is a bump
# Needs pCAR14.
exec(open('P.py').read())
if 'CR_SMASHV' in s:
    print('OK');raise SystemExit
assert 'CR_RK' in s, 'apply pCAR14 first'
# ---- 1 off-route / surface slowdown
R("if(!free)target=.35}}catch(e){}","if(!free)target=.87}}catch(e){}")
R("RO.v85o=(RO.v85o==null?1:RO.v85o)+(target-(RO.v85o==null?1:RO.v85o))*Math.min(1,dt*3);","RO.v85o=(RO.v85o==null?1:RO.v85o)+(target-(RO.v85o==null?1:RO.v85o))*Math.min(1,dt*2);")
R("const fit={ship:{road:1,dirt:.72,water:.78},boat:{road:.42,dirt:.38,water:1},offroad:{road:.93,dirt:1,water:.35}}[veh][terr];","const fit=Math.max(.87,{ship:{road:1,dirt:.72,water:.78},boat:{road:.42,dirt:.38,water:1},offroad:{road:.93,dirt:1,water:.35}}[veh][terr]);")
R("if(Math.abs(angDiff(RO.h,RO.vh))>.25&&sp>25&&!air&&(terr!=='road'))RO.v-=RO.v*.25*dt;","if(Math.abs(angDiff(RO.h,RO.vh))>.25&&sp>25&&!air&&(terr!=='road'))RO.v-=RO.v*.08*dt;")
# ---- 3 speed: top speed +12 % (city), race ×1.12
R("const CR_VMAX=155/3.6,CR_VBOOST=200/3.6;","const CR_VMAX=174/3.6,CR_VBOOST=224/3.6;")
R("const CR_RK=.42,","const CR_RK=.47,")
# chase camera pulls back a little with speed (chase preset: +1.2 m more at top speed)
R("chase:{b:8.5,bk:1.8,h:2.8,hk:.5,","chase:{b:8.5,bk:3,h:2.8,hk:.6,")
# wider FOV with speed in free roam (+9 -> +15 deg at top speed)
R("+9*clamp(Math.abs(RO.v)/Math.max(30,RO.top||60),0,1.4)+(pl&&pl.nitro?5:0)","+15*clamp(Math.abs(RO.v)/Math.max(30,RO.top||60),0,1.4)+(pl&&pl.nitro?6:0)")
# ---- 5 barrel roll only as part of a SMASH
R("s.rollCd=Math.max(0,s.rollCd-H);if(pressed.roll&&s.rollCd<=0&&s.rollT<=0){","s.rollCd=Math.max(0,s.rollCd-H);pressed.roll=0;if(s.crSR&&s.rollT<=0)s.crSR=0;if(pressed.roll&&s.rollCd<=0&&s.rollT<=0){")
R("if(s.rollT>0){s.rollT-=H;if(s.rollT>ROLL_T-.32&&!s.air)s.x+=s.rollDir*18*H}","if(s.rollT>0){s.rollT-=H;if(s.rollT>ROLL_T-.32&&!s.air&&!s.crSR)s.x+=s.rollDir*18*H}")
R("if(s.nitro||s.shield>0||s.rollT>0||s.turbo>0){wreckTraffic(c,s,1.2);s.v*=.94;award(s,'SMASH',8,300,'#ffd12c');",
  "if(s.nitro||s.shield>0||s.rollT>0||s.turbo>0){wreckTraffic(c,s,1.2);s.v*=.94;if(s.rollT<=0&&!s.air&&s.rollCd<=0){s.rollT=ROLL_T;s.rollDir=Math.sign(dx||1);s.crSR=1;s.rollCd=1.2}award(s,'SMASH',8,300,'#ffd12c');")
# ---- 6 breakage: race traffic / AI only break from a SMASH or > 150 km/h
JS0=r'''
const CR_SMASHV=150/3.6;
'''
R("else{const rel=Math.max(0,s.v-c.v);wreckTraffic(c,s,.8);s.v=Math.min(s.v,c.v+8)*.9;damage(s,(6+rel*.25)/s.stats.hull);AU.sfx('crash');shake=.9;flashHud();feed('CRASH',0,'#ff3b55')}}",
  "else{const rel=Math.max(0,s.v-c.v);if(rel>CR_SMASHV){wreckTraffic(c,s,.8);s.v=Math.min(s.v,c.v+8)*.9;damage(s,(6+rel*.25)/s.stats.hull);AU.sfx('crash');shake=.9;flashHud();feed('CRASH',0,'#ff3b55')}else{if((s.crBmp||0)<raceT){s.crBmp=raceT+.4;AU.sfx('bump');shake=Math.max(shake,.25);s.v=Math.min(s.v,c.v+rel*.55)}s.x=clamp(s.x-Math.sign(dx||1)*.9,-MARGIN,MARGIN);c.x=clamp(c.x+Math.sign(dx||1)*.6,-MARGIN,MARGIN)}}}")
R("if(state==='race'&&(rel>14||pushed)){","if(state==='race'&&(rel>CR_SMASHV||pushed&&rel>14)){")
R("if(pushed&&s.dead<=0&&rel>28)explode(s,null);","if(pushed&&s.dead<=0&&rel>CR_SMASHV)explode(s,null);")
R("if(state==='race'&&!P.finished&&((latV*toward>4.5&&pinned)||rearRam))takedown(O);",
  "if(state==='race'&&!P.finished&&(((latV*toward>4.5&&pinned)&&(P.nitro||P.turbo>0||P.boost>0||Math.abs(P.v-O.v)>CR_SMASHV))||rearRam))takedown(O);")
# ---- 6 breakage: city traffic: SMASH (boost / nitro / turbo) or > 150 km/h; slower is a bump that shoves both apart
R("if(d<5&&Math.abs(c.y-RO.y)<3&&OB_car(x,z,dx,dz,c)){if(Math.abs(RO.v)>10){c.dead=25;",
  "if(d<5&&Math.abs(c.y-RO.y)<3&&OB_car(x,z,dx,dz,c)){const crSm=!!(pl&&(pl.nitro||RO.boosting||RO.turbo>0));if(!crSm&&Math.abs(RO.v)<=CR_SMASHV){if(Math.abs(RO.v)>4&&(c.crB||0)<=0){c.crB=.5;const rx=RO.x-x,rz=RO.z-z,rl=Math.hypot(rx,rz)||1;RO.x+=rx/rl*.6;RO.z+=rz/rl*.6;RO.v*=.7;c.t=Math.max(0,c.t-.01);AU.sfx('bump');shake=Math.max(shake,.2)}}else if(Math.abs(RO.v)>10){c.dead=25;")
R("else{c.t=Math.max(0,c.t-.02)}}","else{c.t=Math.max(0,c.t-.02)}}if(c.crB>0)c.crB-=dt;")
JS=r'''
'''
import re
m=re.search(r'<script type="module">(.*?)</script>',s,re.S)
s=s[:m.start(1)]+JS0+s[m.start(1):]
m=re.search(r'<script type="module">(.*?)</script>',s,re.S)
s=s[:m.end(1)]+JS+s[m.end(1):]
save()
print('OK')
