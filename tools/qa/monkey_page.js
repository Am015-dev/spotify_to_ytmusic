// qa-1 monkey bot, in-page part (evaluated in the game's module scope via __qa.ev; see tools/qa/monkey.js). Seeded, plausible REAL keyboard input
// (window keydown/keyup events through the game's own handlers): gas/brake/steer/boost, exit (F), walk/run/jump, enter (E), take another ride (T).
// Time is fixed-step: __qa.step(k,dt). The invariants (window.__bugs) are the oracle; speed < 1 m/s for 3 s with gas held = a "stuck" event.
(function(){
 return function monkey(seed,simSec,dt,opt){
  opt=opt||{};if(opt.lite!==false&&!window.__monkeyLite){window.__monkeyLite=1;for(const n of['miniDraw','roamHud','CR_hud']){try{if(typeof eval(n)==='function')eval(n+'=function(){}')}catch(e){}}}
  let s=seed>>>0;const R=()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296};
  const pick=(a)=>a[Math.floor(R()*a.length)],rng=(a,b)=>a+R()*(b-a);
  const held={};const key=(c,on)=>{if(!!held[c]===on)return;held[c]=on;window.dispatchEvent(new KeyboardEvent(on?'keydown':'keyup',{code:c,key:c,bubbles:true,cancelable:true}))};
  const tap=(c)=>{window.dispatchEvent(new KeyboardEvent('keydown',{code:c,key:c,bubbles:true,cancelable:true}));window.dispatchEvent(new KeyboardEvent('keyup',{code:c,key:c,bubbles:true,cancelable:true}))};
  const release=()=>{for(const c of Object.keys(held))key(c,false)};
  const log={acts:{},stuck:0,exits:0,enters:0,takes:0,warps:0,steps:0};const act=n=>{log.acts[n]=(log.acts[n]||0)+1};
  let steer=0,steerT=0,gas=true,gasT=0,boostT=0,brkT=0,footT=0,mode='drive',actT=0,still=0,stuckT=0,lastX=RO.x,lastZ=RO.z,posT=0,unstick=0,carSpot=null;
  const total=Math.round(simSec/dt),per=Math.round(.5/dt);let done=0;const t0=__qa.t;
  while(done<total){
   // popups / cards / pause that a player would dismiss
   try{if(window.__tq&&__tq.skip)__tq.skip();if(RO.pOpen){roamPauseClose&&roamPauseClose()}if(RO.card){const b=document.getElementById('rcNo');if(b&&b.offsetWidth)b.click();else if(RO.card.close)RO.card.close()}}catch(e){}
   const foot=RO.foot;
   if(foot==='car'){
     // steering: a random walk of held keys, 0.6–3 s each; gas mostly on, some brake, boost bursts; now and then park and get out
     steerT-=.5;if(steerT<=0){steer=pick([-1,-1,0,0,0,1,1]);steerT=rng(.6,3);act('steer')}
     gasT-=.5;if(gasT<=0){gas=R()<.88;gasT=rng(1,6);act(gas?'gas':'coast')}
     brkT-=.5;if(brkT<=0&&R()<.08){brkT=rng(.5,2);act('brake')}
     boostT-=.5;if(boostT<=0&&R()<.1){boostT=rng(1,3);act('boost')}
     key('KeyA',steer<0);key('KeyD',steer>0);key('KeyW',gas&&brkT<=0&&unstick<=0);key('KeyS',brkT>0||unstick>0);key('ShiftLeft',boostT>0);
     // stuck: moved < 3 m in 3 s with gas held
     posT+=.5;if(posT>=3){const d=Math.hypot(RO.x-lastX,RO.z-lastZ);if(gas&&brkT<=0&&unstick<=0&&d<3&&!RO.frozen&&!(pl&&pl.air)&&!(pl&&(pl.boatK||0)>.5)){log.stuck++;const b=__qa.bug('stuck',RO.x,RO.z,RO.y,'speed <1 m/s for 3 s with gas ('+d.toFixed(1)+' m moved)');stuckT++;unstick=1.5;steer=pick([-1,1]);steerT=2;
         if(stuckT>=4){stuckT=0;try{const q=rfSnap(RO.x+rng(-30,30),RO.z+rng(-30,30),120);if(q&&roamWarp(q[0],q[1],RO.h+Math.PI)){log.warps++;act('respawn')}}catch(e){}}}else if(d>=3)stuckT=Math.max(0,stuckT-1);
       posT=0;lastX=RO.x;lastZ=RO.z}
     if(unstick>0)unstick-=.5;
     actT-=.5;if(actT<=0){actT=rng(8,25);const r=R();
       if(r<.12&&Math.abs(RO.v)<8){release();tap('KeyF');log.exits++;act('exit');footT=0;carSpot=[RO.x,RO.z];mode='foot'}
       else if(r<.16){tap('KeyT');log.takes++;act('take')}
       else if(r<.2){tap('KeyC');act('cam')}}
   }else if(foot==='walk'||foot==='sit'){
     footT+=.5;steerT-=.5;if(steerT<=0){steer=pick([-1,0,0,1]);steerT=rng(.4,2);act('walkturn')}
     key('KeyW',true);key('KeyA',steer<0);key('KeyD',steer>0);key('ShiftLeft',R()<.5);
     if(R()<.15){tap('Space');act('jump')}
     if(footT>12){release();
       // back to the parked car: stand beside it and press E (a player walks back; the bot saves the walk)
       try{const o=OF.near||null;if(!o&&carSpot){OF.x=carSpot[0]+1.8;OF.z=carSpot[1];OF.y=groundAt(OF.x,OF.z,OF.y+1)}}catch(e){}
       tap('KeyE');log.enters++;act('enter');footT=6}
   }else{release()} // exit / enter / jack animations: wait
   __qa.step(per,dt);done+=per;log.steps+=per;
   if(opt.stopOnBugs&&__bugs.length>=opt.stopOnBugs)break;
  }
  release();
  return{log,sim:+(__qa.t-t0).toFixed(1),foot:RO.foot};
 }
})()
