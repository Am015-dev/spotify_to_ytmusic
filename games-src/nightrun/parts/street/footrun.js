// PURPOSE: street foes that move always show a run/walk sheet with planted feet, and a hit is a short white flash, never a pose swap or blink
// FLAG: footrun (?footrun=0 = the street exactly as before)
// TEST: qa/footrun-test.js
/* ---------- FOOTRUN (owner, 24 Oct 2026: "the enemies slide to me, they do not run ... low opacity with blinking enemies"). Measured by qa/footrun-test.js:
   1. SLIDE: streetfeel.js already ties run frames to ground distance, but only when the act is run/walk. Foes whose pose resolved to idle (a crouch or hit pose with no sheet of its own,
      heavy / guard / rusher while pushed or walking) were dragged across the road with the idle sheet. Now any foe moving > 20 units/s whose pose would draw idle (or hit, or crouch) draws 'run'
      (the sheet's own run or walk). The stride (foot spread at contact, sheet px) of the sheets streetfeel did not list is added to FEEL.ST so the frames match the ground for every foe.
      A foe backing away from Kai plays its cycle backwards (streetfeel.js reads RET.footrun), so the planted foot still moves with the road.
   2. BLINK: a hit swapped a moving foe to its hit / idle sheet for its whole flash (0.08-0.3 s), and the next hit swapped it back: that is the blink. A hit now keeps the foe's own act and draws
      a white flash over it for <= 0.1 s, at most once every 0.25 s (hold the fire button and the foe does not strobe). A stunned heavy and an open guard keep their hit pose: it is a game tell.
      Every foe is drawn at alpha 1 (streetlook sets it); only the death fade of a corpse (art.js, 'die' act) is not solid.
   3. WIND-UP GLOW (streetlook.js): the red disc on a foe that is about to strike pulsed 0 - 0.7 alpha at 4.8 Hz (the blink seen on every wind-up); now one steady glow. A foe pushing against the screen edge stands still instead of running in place.
   Not covered: flyers (drone, jetpack: one hover sheet), the frame cross-fade of idle (streetfeel / W194 blending). ---------- */
if(RET.footrun===undefined)RET.footrun=/[?&]footrun=1/.test(location.search);
(function(){
if(!window.FOOT||typeof ART==='undefined'||!ART.footDraw||!FOOT.FEEL)return;
const F=window.FOOT,ST=FOOT.FEEL.ST,abs=Math.abs;
/* foot spread at contact in sheet px, 2x = one run cycle (two steps); measured with qa/footstride.py from the strips (lowest 10% of the body, widest frame) */
Object.assign(ST,{'grunt/run':164,'shield/run':160,'sniper/run':171,'warden/run':196,'hound/run':330,'flamer/walk':156,'medic/walk':123});
const NOMOVE=/^(kai|drone|turret|mech|jetpack)/,FLASH=.09,GAP=.25,V=20;
const fd0=ART.footDraw;
ART.footDraw=function(c,who,pose,x,y,h,flip,t){const e=ART.fE,S=F.S;if(!RET.footrun||!e||!S||e===S.P||NOMOVE.test(who)||e.dead||pose==='die')return fd0.apply(this,arguments);
  const now=S.time,dt=now-(e._rt==null?now:e._rt);
  let mv=false,v=-1;
  if(e._rx!=null&&dt>0&&dt<.2){v=abs(x-e._rx)/dt;if(v>V)e._rm=now;mv=v>V||(now-(e._rm||-9)<.08&&v>5);}   // a short hold, so a stop does not flick to idle for one frame
  e._rx=x;e._rt=now;
  const keep=e.state==='stun'||!!e.open;   // game tells: the stunned heavy, the guard with its shield open
  if(e.flash>0){if(!e._rf){e._rf=1;if(now-(e._rfT||-9)>=GAP)e._rfT=now;}}else e._rf=0;
  if(pose==='hit'&&!keep)pose=(mv?'run':'idle');
  else if((pose==='idle'||pose==='crouch')&&mv&&!keep)pose='run';
  else if(/^run/.test(pose)&&v>=0&&v<=5&&now-(e._rm||-9)>=.08)pose='idle';   // pushing against the screen edge or a wall: stands, does not run in place
  if(mv&&/^run/.test(pose))e._p3=null;   // street3 waits up to 1/12 s to switch idle <-> walk: a foe that is moving runs at once
  const r=fd0.call(this,c,who,pose,x,y,h,flip,t);
  if(r&&e._rfT!=null&&now-e._rfT<FLASH&&now>=e._rfT){const ga=c.globalAlpha,go=c.globalCompositeOperation;c.globalCompositeOperation='lighter';e._rfd=now;c.globalAlpha=ga*.85;fd0.call(this,c,who,pose,x,y,h,flip,t);c.globalAlpha=ga;c.globalCompositeOperation=go;}
  return r;};
})();
