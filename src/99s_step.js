// ===== TK: test kit, fixed steps (qa-1 2026-10-13, Alex: "fast implementations and fast testing through checklists"). Test-only: nothing here runs
// unless a test calls it. ?seed=N / __odSeed(N) (end of 00_page.html) make Math.random deterministic.
//   __odHold(on)        holds the real rAF loop: frames keep coming but the game does not advance (time stands still between test steps)
//   __odStep(n,dt=1/60) runs n game frames of exactly dt with no real time: performance.now/Date.now follow a virtual clock (+dt per frame, never
//                       going back afterwards), nothing is drawn except the last frame, the garage loop (gbLoop → SB_frame/GS_step) steps
//                       with the same clock (the split-screen 2nd camera, SP_draw, moves on drawn frames only: it is drawing, not game state). Returns {n,t} (virtual seconds stepped so far).
// Inputs between steps are real key/touch events (dispatched by the test); their handlers only set flags the next step reads.
const TK={hold:0,in:0,off:0,vt:0,steps:0};
{const pn=performance.now.bind(performance),dn=Date.now.bind(Date),d0=dn()-pn();
 performance.now=()=>TK.in?TK.vt:pn()+TK.off;Date.now=()=>Math.round(d0+performance.now());
 frame=(f=>function(now){if(TK.hold&&!TK.in){requestAnimationFrame(frame);last=now;return}return f(now)})(frame);
 gbLoop=(f=>function(){if(TK.hold&&!TK.in){if(!$('#gbx').hidden)GB.raf=requestAnimationFrame(gbLoop);return}return f.apply(this,arguments)})(gbLoop);
 window.__odHold=on=>{TK.hold=on?1:0;last=pn();return TK.hold};
 window.__odStep=(n=1,dt=1/60,o={})=>{n=Math.max(0,n|0);dt=Math.min(.05,Math.max(.001,+dt||1/60));
  const raf=window.requestAnimationFrame,cr=composer.render,draw=o.draw!==false;let gb=false;try{gb=!$('#gbx').hidden}catch(e){}
  TK.vt=pn()+TK.off;TK.in=1;window.requestAnimationFrame=()=>0;composer.render=()=>{};
  try{for(let i=0;i<n;i++){last=TK.vt;TK.vt+=dt*1000;if(draw&&i===n-1)composer.render=cr;frame(TK.vt);if(gb)try{gbLoop()}catch(e){console.warn(e)}TK.steps++}}
  finally{window.requestAnimationFrame=raf;composer.render=cr;TK.in=0;TK.off=Math.max(TK.off,TK.vt-pn());last=pn()}
  return{n,t:+(TK.steps*dt).toFixed(3)}};
 window.__odClock=()=>({hold:TK.hold,steps:TK.steps,off:Math.round(TK.off)})}
