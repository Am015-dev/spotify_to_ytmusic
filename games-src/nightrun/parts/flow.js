/* ---------- FLOW: the song never stops or stutters. Flag RET.flow (?flow=0 = the old behaviour). ----------
   Screens where the game waits for the player (pit stop, chest, weapon sheet, stage result, story cards, tutorial cards) keep the song on its own beat clock:
   the song is ducked (~40% down), low-passed and loses its drum layer so choices stay readable, and returns to full on the next bar line when play resumes.
   The pit-stop timer counts whole bars of the song. PAUSE (setting "Keep music playing when paused", default on) does the same and resumes with a 3-2-1 count-in on the next bar line. */
if(RET.flow===undefined)RET.flow=!/[?&]flow=0/.test(location.search);
const NRF=window.NRF={on:RET.flow,AU,SH,BT,why:{},ducked:false,cnt:null,log:[],LP:2200,GAIN:.6};
NRF.nodes=function(){const a=AU.a;if(!a||!AU.duck||!AU.cutg)return null;if(this.f)return this.f;
  try{const f=a.createBiquadFilter();f.type='lowpass';f.Q.value=.5;f.frequency.value=20000;const g=a.createGain();g.gain.value=1;
    f.connect(g);g.connect(AU.cutg);AU.duck.connect(f);AU.duck.disconnect(AU.cutg);                               // duck > filter > gain > cut > master (new path first: no gap)
    let dg=null;if(AU.drm){dg=a.createGain();dg.gain.value=1;AU.drm.connect(dg);dg.connect(AU.musv);AU.drm.disconnect(AU.musv);}   // the drum layer gets its own gate
    this.f={f,g,dg};}catch(e){this.f=null;}
  return this.f;};
/* music-clock time (seconds, AudioContext domain) of the first bar line at least `lead` seconds ahead */
NRF.barAt=function(lead){const raw=mnow(),p=(raw+(lead||0)-BT.t0-BT.off)/BT.spb,b=Math.ceil(p/4-1e-6)*4;return BT.t0+BT.off+b*BT.spb;};
NRF.apply=function(duck,at){const a=AU.a,n=this.nodes();if(!n||!a)return;const t=Math.max(a.currentTime,at||0),k=duck?.12:.07;
  for(const [p,v] of [[n.f.frequency,duck?this.LP:20000],[n.g.gain,duck?this.GAIN:1],[n.dg&&n.dg.gain,duck?0:1]]){if(!p)continue;try{p.cancelScheduledValues(t);p.setTargetAtTime(v,t,k);}catch(e){}}
  this.ducked=duck;this.log.push({duck,at:t,beat:bpos()});};
NRF.waiting=function(){const vis=e=>!!e&&!e.hidden&&getComputedStyle(e).display!=='none';
  if(!titleEl.hidden)return false;
  if(SH.active||vis(chestEl)||vis(resEl)||(typeof wpEl!=='undefined'&&vis(wpEl)))return true;
  const t=$('taleCard');if(t&&vis(t))return true;const c=$('tutC');if(c&&vis(c))return true;
  return false;};
NRF.want=function(){return !!(this.why.pause||this.why.screen);};
NRF.sync=function(at){const w=this.want();if(w===this.ducked&&!this.pendUp)return;
  if(w){this.pendUp=0;this.apply(true);}                 // going down: at once (the screen just opened)
  else this.apply(false,at!==undefined?at:this.barAt(.05));};   // coming back: on the next bar line
/* ----- screens: polled, so every part that opens a card is covered without touching it ----- */
setInterval(()=>{if(!RET.flow||!AU.a||AU.hold)return;if(NRF.why.pause&&!paused&&!NRF.cnt){NRF.why.pause=false;NRF.sync();}   // quit / restart from the pause card
  const w=NRF.waiting();if(w!==!!NRF.why.screen){NRF.why.screen=w;NRF.sync();}},50);
/* ----- the pit-stop clock counts bars of the song ----- */
{const pit=SH.pit;SH.pit=function(cb){pit.call(this,cb);
    if(RET.flow&&this.active&&AU.a&&!AU.hold&&BT.mode!=='none'&&BT.spb>0){const bar=4*BT.spb,bars=Math.max(2,Math.ceil(PIT_SECS/bar));                  // ends on a bar line, between bars-1 and bars bars from now
      NRF.pit={bar,end:NRF.barAt(0)+(bars-1)*bar,tot:bars*bar,wait:0,spb:BT.spb};}else NRF.pit=null;};
  const tk=SH.tick;SH.tick=function(dt){const P=NRF.pit;
    if(!RET.flow||!P||!this.active||AU.hold||BT.spb!==P.spb){NRF.pit=null;return tk.call(this,dt);}
    if(typeof WP!=='undefined'&&WP.open){P.wait+=dt;tk.call(this,dt);return;}
    if(P.wait>0){P.end+=Math.ceil(P.wait/P.bar-1e-6)*P.bar;P.wait=0;}                    // the weapon sheet held the clock: add whole bars
    const rem=P.end-mnow();this.left=Math.max(0,rem)*PIT_SECS/P.tot+dt;                   // shown as the usual 10..0
    return tk.call(this,dt);};}
/* ----- PAUSE keeps the song; RESUME counts 3-2-1 on the beat and starts on a bar line ----- */
SET.keepmus=SET.keepmus!==false;
NRF.keepOn=function(){return RET.flow&&SET.keepmus!==false&&!!AU.a&&AU.a.state==='running'&&!document.hidden&&BT.mode!=='none'&&!SIM;};
const cntEl=document.createElement('div');cntEl.id='flowCnt';cntEl.hidden=true;cntEl.setAttribute('aria-live','polite');document.body.appendChild(cntEl);
{const st=document.createElement('style');st.textContent='#flowCnt{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:60;pointer-events:none;font-family:var(--mono);font-weight:900;font-size:min(34vw,34vh);color:#fff;text-shadow:0 0 .3em #19e3ff,0 0 .8em #19e3ff88}#flowCnt[hidden]{display:none}#flowCnt b{animation:fcn .5s ease-out both}@keyframes fcn{from{transform:scale(1.5);opacity:0}to{transform:scale(1);opacity:1}}';document.head.appendChild(st);}
NRF.pauseChanged=function(on){
  if(!RET.flow||!AU.a)return;
  if(on){if(AU.hold)return;this.why.pause=true;this.sync();}    // AU.hold set = the context was suspended (the old pause): nothing to duck
  else{this.why.pause=false;this.sync();}};
/* resume request: true = a count-in is running (setPause waits for it) */
NRF.holdResume=function(){if(this.go){this.go=0;return false;}
  if(!RET.flow||!this.why.pause||AU.hold||!AU.a||BT.mode==='none'||this.cnt)return !!this.cnt;
  const spb=BT.spb,B=this.barAt(3*spb),t0=B-3*spb;this.cnt={B,t0,n:4};pauseEl.hidden=true;
  this.apply(false,B);           // the song comes back to full exactly on the bar line
  const iv=setInterval(()=>{const now=mnow();
    if(!paused||!this.cnt){clearInterval(iv);this.cnt=null;cntEl.hidden=true;return;}
    const k=Math.floor((now-t0)/spb);                          // 0,1,2 = 3,2,1
    if(k>=0&&k<3&&this.cnt.n!==k){this.cnt.n=k;cntEl.hidden=false;cntEl.innerHTML='<b>'+(3-k)+'</b>';}
    if(now>=B-.012){clearInterval(iv);this.cnt=null;cntEl.hidden=true;this.go=1;setPause(false);}},15);
  return true;};
/* a hidden tab always stops the song (as before); coming back resumes the context and the paused game keeps its place */
document.addEventListener('visibilitychange',()=>{if(!RET.flow)return;
  if(document.hidden){if(NRF.cnt){NRF.cnt=null;cntEl.hidden=true;}if(paused&&!AU.hold){AU.suspend();}}
  else if(paused&&AU.hold){AU.resume();if(NRF.why.pause)NRF.apply(true);}});
