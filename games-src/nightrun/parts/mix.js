// PURPOSE: the music stays on top of the effects: separate buses, an effect compressor, a voice cap, no repeated ticks, a little variation
// FLAG: none (always on)
// TEST: mix-test.js, audio-gates-test.js
/* ---------- MIX: owner 21 Oct 2026: "the music is distorted by annoying repetitive sound effects" (flag RET.mix, default ON; ?mix=0 = the old graph and the old sound calls, nothing is wrapped).
   MEASURED before (mix-test.js, 90 s bot runs, stages 2/10/20, boss, endless wave 15): up to 16 effect voices (53 in endless), 25 explosions in one second, 'hit' 13/s, 'pick' 2 in the same frame, the master
   limiter 9.9 dB into overload (2 blocks at full scale) and the effects bus 2 to 6 dB LOUDER than the music. NO new sound assets: only gain, filter, pitch, scheduling on the sounds that exist.
   GRAPH   music bus (musv > duck > cutg) and effects bus (sfxv) stay separate; sfxv now runs through a DynamicsCompressor (AU.sfxc) before the master, so a pile of effects cannot push the master limiter.
           Both buses get a fixed trim (K.mus, K.sfx) on top of the two sliders, so the defaults sit music over effects. The perfect stinger has its own half-level bus (AU.stbq, made on first use).
   SOUNDS  Every AU.sfx call goes through allow(): a minimum gap per sound id, at most N per rolling second, explosions at most 3 per 200 ms, and a voice cap (CAP): the quietest / oldest voice of an equal or
           lower priority is faded out and stopped, or the new sound is dropped when everything alive matters more. A crowd makes the sound softer and shorter. Round-robin variants per id (5 steps, pitch +-4 %,
           level +-1.5 dB, never the same twice in a row). Settings > Audio > "Reduce repetitive sounds" (SET.mixr, default On) switches the gaps / caps / variants off; the buses stay.
   DUCK    music dips 4 dB for 150 ms only under the big stingers (boss in, clear, fail, unlock, new best), at most once per 2 s; boom / hurt / EMP never dip it. LOW-PASS the combo filter stays open (20 kHz) and a hit does not dip it.
   RATE    quiet effects (priority < 5) at most 4 per rolling second in all; shot and hit at most 2 per second each; pick / boom bursts two per 250 ms. Defaults music 70 / effects 50.
   BEAT    the PERFECT / ON BEAT sound is one soft sine instead of three layers and its stinger has half the level; when they happen is unchanged (timing windows, BT, stinger grid are not touched).
   NOT     timing windows, hitboxes, armour.js, hard.js, the beat clock and the stinger scheduling. ---------- */
DEFS.mixr=true;if(SET.mixr===undefined)SET.mixr=true;
if(SET.music===.45&&SET.sfx===.8){SET.music=.7;SET.sfx=.5;}   // review 8 fix 3: the old defaults (music 45 / effects 80) become music 70 / effects 50; a changed slider stays
DEFS.music=.7;DEFS.sfx=.5;
const MIX=window.MIX={K:{mus:1.4,sfx:.5},CAP:6,TOT:4,
  // id: [minimum gap s, most per rolling second, priority, voices it makes, level, length]
  T:{shot:[.5,2,1,1,.7,.9],graze:[.3,2,1,1,.7,.9],hit:[.4,2,2,1,.7,.9],pick:[.25,3,3,2,.7,.85],dash:[.2,3,3,2,.8,1],heat:[.4,2,3,1,.8,1],up:[.12,4,4,4,.8,1],tier:[.14,3,4,5,.75,1],
     perfect:[.14,4,4,1,.7,1],warn:[.5,2,5,6,.8,1],boom:[.07,5,5,2,.6,.75],hurt:[.3,3,6,2,.85,1],emp:[.5,2,6,2,.85,1],big:[.5,2,7,2,.8,1],phase:[.5,2,7,5,.85,1]},
  PP:[1,1.04,.97,1.02,.985],DB:[0,1.2,-1.1,.6,-.7],SEQ:[0,3,1,4,2],
  log:{},rr:{},vox:[],cur:null,lastDuck:-9,stat:{drop:0,steal:0,play:0},
  on(){return true;},red(){return SET.mixr!==false;}};
{
  const M=MIX,isFx=d=>d===AU.fx||d===AU.stb||d===AU.stbq,dbv=x=>Math.pow(10,x/20);
  const oInit=AU.init,oOsc=AU.osc,oNoise=AU.noise,oSfx=AU.sfx,oSting=AU.sting,oDuck=AU.duckMusic,oVol=AU.vol;
  AU.init=function(){const had=this.a;oInit.apply(this,arguments);if(!had&&this.a&&!this.sfxc)M.graph();};
  M.graph=()=>{const a=AU.a;if(!a||!AU.sfxv||!AU.m)return;
    try{const c=a.createDynamicsCompressor();c.threshold.value=-24;c.knee.value=10;c.ratio.value=5;c.attack.value=.003;c.release.value=.14;
      AU.sfxv.disconnect(AU.m);AU.sfxv.connect(c);c.connect(AU.m);AU.sfxc=c;                       // effects: their own compressor before the master
      }catch(e){}
    AU.vol(true);};
  /* review 8 fix 1: the song is never muffled: the combo filter stays open (the drum layer still follows the tier) and a hit no longer dips it to 900 Hz */
  AU.lpHz=[20000,20000,20000,20000];
  AU.lyHit=function(){const a=this.a;if(!a||!this.lp||SET.react===false||!running||paused)return;const now=a.currentTime,spb=BT.spb||.5,t0=BT.t0+BT.off,q=spb/4,D=this.drm.gain;
    const rec=t0+Math.ceil((now+spb*.5-t0)/spb)*spb;this.recT=rec;this.lyKey=this.lyStep()*10+this.lyDrum();
    D.cancelScheduledValues(now);D.setTargetAtTime(0,now,.03);D.setTargetAtTime(this.lyDrum()*.34,rec,q);
    this.lyLog.push({k:'hit',now,at:rec,f:this.lpHz[this.lyStep()],tier:this.tier,t0,spb});if(this.lyLog.length>200)this.lyLog.shift();};
  AU.vol=function(now){if(!this.a)return;const t=this.a.currentTime,k=now?0:.02;
    this.m.gain.setTargetAtTime(SET.mute?0:.55*SET.master,t,k||.001);this.musv.gain.setTargetAtTime(SET.music*M.K.mus,t,k||.001);this.sfxv.gain.setTargetAtTime(SET.sfx*M.K.sfx,t,k||.001);};
  AU.duckMusic=function(at){const a=this.a;if(!a||!this.duck||!SET.duck)return;
    if(at===undefined)return;                                                       // review 8 fix 1: only the big stingers (boss in, clear, fail, unlock, new best) pass a time; boom / hurt / EMP no longer dip the song
    const t=at||a.currentTime;if(t-M.lastDuck<2&&t>=M.lastDuck)return;M.lastDuck=t;
    const g=this.duck.gain;g.cancelScheduledValues(t);g.setTargetAtTime(.63,t,.01);g.setTargetAtTime(1,t+.15,.07);};   // -4 dB, 150 ms, then back
  /* the two synth helpers are copied here only so that a voice can be faded out and stopped; the sound is the same as a.js makes */
  const osc2=(t,type,freq,dur,vol,dest,slide,cut)=>{const a=AU.a,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);
    if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,slide),t+dur);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.005);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    let n=o;if(cut){const f=a.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(cut,t);f.frequency.exponentialRampToValueAtTime(Math.max(80,cut/6),t+dur);o.connect(f);n=f;}
    n.connect(g);g.connect(dest);o.start(t);o.stop(t+dur+.02);M.vox.push({o,g,t0:t,end:t+dur+.02,vol,id:M.cur.id,pr:M.cur.pr});return g;};
  const noise2=(t,dur,vol,freq,dest,type='highpass')=>{const a=AU.a,s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=AU.nb;
    f.type=type;f.frequency.value=freq;g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(f);f.connect(g);g.connect(dest);s.start(t);s.stop(t+dur+.02);
    M.vox.push({o:s,g,t0:t,end:t+dur+.02,vol,id:M.cur.id,pr:M.cur.pr});};
  AU.osc=function(t,type,freq,dur,vol,dest,slide,cut){const C=M.cur;if(!C||!AU.a||!isFx(dest))return oOsc.apply(this,arguments);
    return osc2(t,type,freq*C.p,dur*C.d,vol*C.v,dest,slide?slide*C.p:slide,cut);};
  AU.noise=function(t,dur,vol,freq,dest,type){const C=M.cur;if(!C||!AU.a||!isFx(dest))return oNoise.apply(this,arguments);
    return noise2(t,dur*C.d,vol*C.v,freq*C.p,dest,type);};
  /* make room for `need` voices of priority `pr`: fade out and stop the quietest / oldest voice that matters no more than it; false when that is not possible */
  M.room=(t,need,pr)=>{M.vox=M.vox.filter(v=>v.end>t);let over=M.vox.length+need-M.CAP;if(over<=0)return true;
    const c=M.vox.filter(v=>v.pr<=pr).sort((a,b)=>a.pr-b.pr||a.vol*(a.end-t)-b.vol*(b.end-t)||a.t0-b.t0);if(c.length<over)return false;
    for(const v of c.slice(0,over)){try{v.g.gain.cancelScheduledValues(t);v.g.gain.setTargetAtTime(0,t,.004);v.o.stop(t+.015);}catch(e){}v.end=t+.015;M.stat.steal++;}
    M.vox=M.vox.filter(v=>v.end>t+.015);return true;};
  /* may this sound play now? (fills the variant when it may) */
  const allow=(n,t)=>{const T=M.T[n];if(!T)return{p:1,v:1,d:1,pr:5};
    const L=M.log[n]||(M.log[n]=[]);while(L.length&&L[0]<t-1)L.shift();
    if(L.length&&t-L[L.length-1]<T[0]*(.9+Math.random()*.25))return null;     // minimum gap, a little uneven so a steady stream does not tick like a clock
    if(L.length>=T[1])return null;                                               // most per rolling second
    if(T[2]<5){let c=0;for(const k in M.log)if(M.T[k]&&M.T[k][2]<5)for(const x of M.log[k])if(t-x<1)c++;if(c>=M.TOT)return null;}   // quiet effects: four per rolling second in all (louder alarms are not counted)
    if(n==='pick'||n==='boom'){let c=0;for(const x of M.log[n])if(t-x<.25)c++;if(c>=2)return null;}                          // bursts of pick / boom: two per 250 ms
    if(n==='boom'||n==='big'){let c=0;for(const x of(M.log.boom||[]).concat(M.log.big||[]))if(t-x<.2)c++;if(c>=3)return null;}   // explosions: three per 200 ms
    if(!M.room(t,T[3],T[2]))return null;
    L.push(t);const crowd=Math.max(0,L.length-1),k=n==='boom'||n==='pick'||n==='hit'?1/Math.sqrt(1+.45*crowd):1;   // a crowd of the same sound is softer and shorter
    const i=M.rr[n]=((M.rr[n]|0)+1)%5,s=M.SEQ[i];
    return{p:M.PP[s],v:T[4]*k*dbv(M.DB[s]),d:T[5]*(k<1?.8+.2*k:1),pr:T[2]};};
  AU.sfx=function(n){const a=this.a;if(!a||a.state!=='running'||SET.mute)return oSfx.apply(this,arguments);
    if(SET.mixr===false){M.cur={id:n,p:1,v:1,d:1,pr:(M.T[n]||[0,0,5])[2]};try{return oSfx.apply(this,arguments);}finally{M.cur=null;}}
    const t=a.currentTime,V=allow(n,t);if(!V){M.stat.drop++;return;}M.stat.play++;V.id=n;
    if(n==='perfect'){M.cur=V;try{osc2(t,'sine',this.f(100),.16,.09*V.v,this.fx,0);}finally{M.cur=null;}return;}   // one soft tone (was three layers)
    M.cur=V;try{return oSfx.apply(this,arguments);}finally{M.cur=null;}};
  AU.sting=function(n){const a=this.a;if(!a||!AU.sfxv)return oSting.apply(this,arguments);
    if(n==='perfect'&&!this.stbq){try{const q=a.createGain();q.gain.value=.354;q.connect(this.sfxv);this.stbq=q;}catch(e){}}      // .5 x the stinger bus (.708), made when the first one plays
    M.room(a.currentTime,5,8);                                                                          // a stinger always plays: it takes the room of up to five quieter effect voices
    const real=this.stb;if(n==='perfect'&&this.stbq)this.stb=this.stbq;M.cur={id:'sting:'+n,p:1,v:1,d:1,pr:9};   // stinger voices count against the cap but are never stolen
    const n0=M.vox.length;let r;try{r=oSting.apply(this,arguments);}finally{this.stb=real;M.cur=null;}
    if(r&&M.vox.length===n0)M.vox.push({o:null,g:null,t0:a.currentTime,end:a.currentTime+.8,vol:.3,pr:9});   // a stinger from a file is one voice we cannot stop, but it counts
    return r;};                      // the perfect one at half the level
}
/* owner 22 Oct 06:25: "very annoying sound effects eg on perfect: disable it, it distorts music; alert is also very repetitive:
   it should alert in real danger, not every 5 seconds". Flag RET.calmsfx (default ON, ?calmsfx=0 = old): no PERFECT sound or
   stinger at all; the 'warn' alert plays only for real danger (hull 2 or less, or a boss arriving) and at most once per 20 s. */
if(RET.calmsfx===undefined)RET.calmsfx=!/[?&]calmsfx=0/.test(location.search);
{const s0=AU.sfx,g0=AU.sting;let lastWarn=-99;
  AU.sfx=function(n){if(RET.calmsfx){if(n==='perfect')return;
    if(n==='warn'){const t=(typeof G==='object'&&G&&G.t)||0,real=(typeof P==='object'&&P&&P.hp<=2)||(typeof G==='object'&&G&&G.boss&&!G.boss.dead&&G.boss.bt!=null&&G.boss.bt<4);
      if(!real||t-lastWarn<20)return;lastWarn=t;}}
    return s0.apply(this,arguments);};
  AU.sting=function(n){if(RET.calmsfx&&n==='perfect')return false;return g0.apply(this,arguments);};}
