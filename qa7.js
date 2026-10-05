/* ===== QA7 · rotation-proof touch controls (iPhone: "after portrait→landscape the buttons are very unresponsive") =====
   iOS Safari does not always send touchcancel for fingers that were down while the phone rotates. The steering pad and the ◀ ▶ zone
   then keep a stale touch id (TOUCH.sid / TOUCH.bz) and ignore every new touch ("if(TOUCH.bz!=null)return"), and GAS / BRAKE / BOOST
   can stay latched. iOS also reports the old innerWidth/innerHeight for a few hundred ms after orientationchange, so the renderer and
   the steer pad were sized for the old orientation. Fix: (1) every touchstart first drops any stored touch id that is no longer among
   the active touches; (2) on orientationchange / a portrait↔landscape resize all touch state is released and the layout is re-run at
   0, 120, 350 and 800 ms. */
const QA7={o:null,resets:0};
function QA7_release(){TOUCH.sid=null;TOUCH.bz=null;TOUCH.target=0;TOUCH.steer=0;TOUCH.lock=0;TOUCH.gas=false;TOUCH.brake=false;TOUCH.boost=false;TOUCH.hb=false;
  try{bzSet(0)}catch(e){}document.querySelectorAll('#touch .down').forEach(e=>e.classList.remove('down'));try{SZ.classList.remove('on')}catch(e){}QA7.resets++}
function QA7_relayout(){try{resize()}catch(e){}try{if(TOUCH.sid==null)steerHome()}catch(e){}}
addEventListener('touchstart',e=>{const act=new Set([...e.touches].map(t=>t.identifier));if(TOUCH.sid!=null&&!act.has(TOUCH.sid)){TOUCH.sid=null;TOUCH.target=0;try{SZ.classList.remove('on')}catch(_){}}
  if(TOUCH.bz!=null&&!act.has(TOUCH.bz)){TOUCH.bz=null;try{bzSet(0)}catch(_){}}},{capture:true,passive:true});
function QA7_rot(){QA7_release();for(const t of[0,120,350,800])setTimeout(QA7_relayout,t)}
addEventListener('orientationchange',QA7_rot);
addEventListener('resize',()=>{const o=innerWidth>innerHeight;if(QA7.o!==null&&o!==QA7.o)QA7_rot();QA7.o=o});
if(screen.orientation&&screen.orientation.addEventListener)screen.orientation.addEventListener('change',QA7_rot);
