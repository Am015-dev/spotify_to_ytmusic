// ===== D26 (drive26): arcade grip. Alex after v88f: "the driving is extremely bad, it does not turn smoothly, only drifts".
// Measured (tools/tTurn26.js, flat road, docs/research/REF_DRIVING.md): a plain steer turn slips < 1° (the car goes where it points), but
// (1) a brake tap while gas is held and the car is steering started a full DRIFT at once (B2K GAS+BRAKE rule, keys Up+Down or the touch
// seam between GAS and BRAKE): 44-48° slide; (2) braking in a turn cut rear grip by 38% (C26.kR): up to 8° slide at 80 km/h.
// Fix: a GAS+BRAKE drift (and the touch BRAKE+steer drift above W14_ST.hbCity) only starts after BRAKE is held TUNE.gbHold s with
// |steer| ≥ TUNE.gbSteer; before that it is a normal brake. DRIFT (button, X, Ctrl) drifts at once as before. Rear grip loss on braking
// C26.kR .38 → .12; heading-vs-travel slip outside drift capped at TUNE.slipMax (was .6 rad, inline in 71 roamStep). Free roam only.
// v88f values: gbHold 0, slipMax .6, C26.kR .38.
TUNE.gbHold=.6;TUNE.gbSteer=.5;TUNE.slipMax=.12;C26.kR=.12;
const D26={gbT:0,n:0,blocked:0};
{const f0=ctlPlayer;ctlPlayer=function(){const c=f0.apply(this,arguments);try{if(state==='roam'){const dt=Math.min(arguments[0]||1/60,.05);
  const ex=!!(K.KeyX||K.ControlLeft||TOUCH.hb);   // the DRIFT control itself: drift at once
  if(c.hb&&!ex&&!RO.dDir){D26.gbT+=dt;if(D26.gbT<TUNE.gbHold||Math.abs(c.steer||0)<TUNE.gbSteer){c.hb=0;c.brk=1;c.thr=0;D26.blocked+=dt}else D26.n++}
  else if(!c.hb)D26.gbT=0}}catch(e){}return c}}
window.__d26=()=>({gbT:+D26.gbT.toFixed(2),drifts:D26.n,blocked:+D26.blocked.toFixed(2),slip:+((typeof RO!=='undefined'&&RO.vh!=null?angDiff(RO.h,RO.vh):0)*180/Math.PI).toFixed(2),
  gbHold:TUNE.gbHold,gbSteer:TUNE.gbSteer,slipMax:TUNE.slipMax,kR:C26.kR});
