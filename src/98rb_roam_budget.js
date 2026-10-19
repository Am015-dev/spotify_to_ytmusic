// perf-r13d: one per-frame budget shared by the deferrable roam subsystems (touch/LOWMEM, TUNE.roamBudget, ?rb=0|1).
// Frame clock starts at roamStep (or at the outer hubTrafficStep when it runs alone). pedStep, hubCullStep (+ its wrappers; already
// resumable: it slices on its own frame counter) and LV_step run only while elapsed + their recent cost fits RB.ms; one of them
// (rotating) always runs, and none waits more than 2 frames (so each runs at least every 3rd frame). Deferred dt is summed (≤ .2 s).
// Never deferred: player car, camera, collisions, HT_cars traffic. Loaded after every wrapper of these (src/ORDER).
{const m=/[?&]rb=([01])/.exec(location.search);if(m)TUNE.roamBudget=+m[1]}
const RB={ms:12,t0:0,dep:0,rot:0,pri:'',fr:0,K:['cull','ped','lv'],S:{}};
for(const k of RB.K)RB.S[k]={skip:0,ema:0,dt:0,run:0,def:0};
const RB_on=()=>!!TUNE.roamBudget&&(TOUCH.on||!!LOWMEM);
function RB_frame(){RB.t0=performance.now();RB.fr++;RB.pri=RB.K[RB.rot++%RB.K.length]}
function RB_gate(k){const s=RB.S[k];if(!RB_on()||!RB.t0)return true;if(s.skip>=2||RB.pri===k||performance.now()-RB.t0+s.ema<=RB.ms)return true;s.skip++;s.def++;return false}
function RB_wrap(k,f,dtArg){return function(dt){if(!RB_on())return f.apply(this,arguments);const s=RB.S[k];if(dtArg)s.dt+=dt||0;if(!RB_gate(k))return;s.skip=0;s.run++;const a=performance.now();try{return dtArg?f.call(this,Math.min(s.dt,.2)):f.apply(this,arguments)}finally{s.dt=0;const d=performance.now()-a;s.ema=s.ema*.7+d*.3;if(d>s.ema)s.ema=d*.6+s.ema*.4}}}
pedStep=RB_wrap('ped',pedStep,1);hubCullStep=RB_wrap('cull',hubCullStep,0);LV_step=RB_wrap('lv',LV_step,1);
roamStep=(f=>function(){RB_frame();RB.dep++;try{return f.apply(this,arguments)}finally{RB.dep--}})(roamStep);
hubTrafficStep=(f=>function(){if(!RB.dep)RB_frame();return f.apply(this,arguments)})(hubTrafficStep);
