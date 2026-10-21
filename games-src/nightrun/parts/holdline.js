// PURPOSE: hold the line: letting enemies pass costs
// FLAG: holdline (?holdline=0)
// TEST: holdline-test.js
/* ---------- holdline.js: hold the line (owner, 20 Oct 2026: "gamer should not be leaving so many enemies passing through defense"). Flag RET.holdline; ?holdline=0 = leak.js as it was.
   The BREACH meter of leak.js becomes a visible defence line on the left edge of the playfield: it empties with every leak, an empty line costs one hull (leak.js pay(), same caps).
   1. VISIBLE LINE: a thin bar on the left edge, full = safe, amber / red as it drains, flashes on a leak. The stat strip label reads LINE with the leak count of the stage.
   2. A LEAK COSTS: score (120 x weight, never below 0) and 0.2 x weight of the multiplier; a shielded or elite foe costs one weight more (score and multiplier only; the line's hull rule is unchanged).
   3. RECOVERY: killing a foe that is inside the last 140 px refunds half its weight to the line (at most 1 notch per bar).
   Never touches damage rules (visible.js: nothing is hurt offscreen), armour.js or hard.js. Test: nightrun/holdline-test.js. ---------- */
if(RET.holdline===undefined)RET.holdline=!/[?&]holdline=0/.test(location.search);
const HOLD=window.HOLD={
  zone:140,pen:120,multPen:.2,refund:.5,perBar:1,
  n:0,pen$:0,back:0,barRef:0,inited:false,
  on(){return !!RET.holdline&&!!RET.leak;},
  live(){return this.on()&&running&&!G.dead&&!G.lab&&!G.tut&&!ST.over;},
  reset(){this.n=0;this.pen$=0;this.back=0;this.barRef=0;},
  stat(){return{n:this.n,pen:this.pen$,back:this.back};},
  extra(e){return e.el||e.ldr||e.shl||e.ctw||e.type==='shielder'?1:0;},
  frac(){return Math.max(0,Math.min(1,1-LEAK.M/LEAK.cap()));},
  leaked(w,e){this.n++;const p=Math.min(G.score,Math.round(this.pen*w));G.score-=p;this.pen$+=p;G.mult=Math.max(1,+(G.mult-this.multPen*w).toFixed(2));LEAK.lab='LINE '+this.n;},
  killed(e){if(!this.live()||e.type==='boss'||e.x>this.zone||e.x<0||this.barRef>=this.perBar)return;
    const w=LEAK.weight(e);if(!(w>0)||LEAK.M<=0)return;this.barRef+=1;this.back++;
    LEAK.M=Math.max(0,LEAK.M-this.refund*Math.min(w,2));floater(Math.max(e.x,40),clamp(e.y,60,H-90),'LINE +','#19e3ff');},
  draw(){if(!this.live())return;const f=this.frac(),x=2,y0=34,h=H-68,hot=f<.35,col=f<.35?'#ff5060':f<.65?'#ffb020':'#19e3ff';
    ctx.save();ctx.globalAlpha=.55;ctx.fillStyle='#05030c';ctx.fillRect(x,y0,5,h);
    ctx.globalAlpha=1;ctx.fillStyle=col;ctx.fillRect(x+1,y0+h*(1-f),3,h*f);
    if(LEAK.flashT>0||(hot&&!SET.reduce&&BK(G.t,6))){ctx.globalAlpha=Math.min(1,.4+LEAK.flashT);ctx.strokeStyle='#ff3040';ctx.lineWidth=1.5;ctx.strokeRect(x-.5,y0-.5,6,h+1);}
    ctx.restore();},
  init(){if(this.inited)return;this.inited=true;
    { const lk=LEAK.leak;LEAK.leak=function(w,e){if(!HOLD.on())return lk.call(this,w,e);lk.call(this,w,e);HOLD.leaked(w+HOLD.extra(e),e);}; }
    { const dr=HUDX.drones;HUDX.drones=function(t){dr.call(this,t);try{HOLD.draw();}catch(err){}}; }
  }};
NR.on('runStart',()=>{HOLD.init();HOLD.reset();LEAK.lab='LINE';});
NR.on('kill',o=>{if(o&&o.e)HOLD.killed(o.e);});
NR.on('bar',()=>{HOLD.barRef=0;});
