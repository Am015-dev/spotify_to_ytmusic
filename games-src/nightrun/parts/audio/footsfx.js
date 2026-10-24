// PURPOSE: on-foot sound set (4 weapon shots, knife, finisher, impact, foe hurt / death, Kai hurt, block, pick-up), synthesized, quiet, never touches the song
// FLAG: footsfx (?footsfx=0 = the old on-foot sounds)
// TEST: qa/footsfx-test.js
/* ---------- FOOTSFX (W193, owner 24 Oct 2026: "no sound effects, e.g. shoot variation, kicks, hits, without distorting the music").
   The song path is never touched: no duck, no filter, no volume change. Every sound is made with Web Audio on its own bus (FTX.bus -> limiter -> AU.sfxv), peak well under the song.
   Each sound has 3 tone / pitch variants (never the same one twice in a row), a minimum gap, and a shared cap of 8 voices (the oldest is faded out when a 9th starts).
   One SND row per sound (group ft, default on) so the Lab SOUND page can switch any of them off. Events come from foot.js / streetmelee.js through FTX.ev(name, arg).
   Named hooks for features that are not in this build yet: FTX.guard() (W192 guard button: block clang), FTX.kick(), FTX.punch() (impact thud). ---------- */
if(RET.footsfx===undefined)RET.footsfx=!/[?&]footsfx=0/.test(location.search);
const FTX=window.FTX=(()=>{
  // id: [Lab row text, minimum gap s, bus level]; every id is also the name used by FTX.ev / FTX.play
  const T={pistol:['Pistol shot',.08,.9],smg:['Machine gun shot',.065,.7],shotgun:['Shotgun blast',.18,1],rocket:['Rocket launch',.3,1],
    swish:['Knife swish',.1,.8],knifehit:['Knife hit (thud)',.05,.9],finisher:['Combo finisher (crack)',.2,1],impact:['Kick and punch hit',.07,.9],
    foehurt:['Foe is hit (grunt noise)',.07,.6],foedeath:['Foe goes down',.09,.8],kaihurt:['Kai is hit',.25,1],block:['Block or guard clang',.12,.8],pickup:['Pick-up chime',.1,.6]};
  const CAP=8,BUSG=.12,vox=[],last={},lastV={},nbs=new WeakMap();
  const noiseBuf=c=>{let b=nbs.get(c);if(!b){b=c.createBuffer(1,c.sampleRate,c.sampleRate);const d=b.getChannelData(0);let s=12345;for(let i=0;i<d.length;i++){s=(s*1664525+1013904223)>>>0;d[i]=s/2147483648-1;}nbs.set(c,b);}return b;};   // fixed noise, so a variant sounds the same each time it is rendered
  // helpers: every source is recorded in rec so a stolen voice can be stopped; dest is the voice gain
  const osc=(c,d,rec,t,type,f0,f1,dur,vol,cut)=>{const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);if(f1)o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+dur);let n=o;
    if(cut){const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=cut;o.connect(f);n=f;}n.connect(g);g.connect(d);o.start(t);o.stop(t+dur+.02);rec.push(o);};
  const noise=(c,d,rec,t,type,f0,f1,dur,vol,q)=>{const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=noiseBuf(c);s.loop=true;f.type=type;f.frequency.setValueAtTime(f0,t);if(q)f.Q.value=q;
    if(f1)f.frequency.exponentialRampToValueAtTime(f1,t+dur);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(f);f.connect(g);g.connect(d);s.start(t);s.stop(t+dur+.02);rec.push(s);};
  // the sounds: S[id](c, d, rec, t, v) with v = 0, 1, 2 (three different tones / pitches)
  const S={
    pistol:(c,d,r,t,v)=>{const p=[1,.84,1.2][v],k=[3200,2300,4600][v];noise(c,d,r,t,'highpass',1800*p,0,.05,.5);osc(c,d,r,t,'triangle',460*p,95*p,.1,.4,k);},
    smg:(c,d,r,t,v)=>{const p=[1,.88,1.25][v];noise(c,d,r,t,'bandpass',2600*p,0,.035,.45,.8);osc(c,d,r,t,'square',320*p,110*p,.05,.22,2200*p);},
    shotgun:(c,d,r,t,v)=>{const p=[1,.8,1.3][v],k=[2200,1500,3200][v];noise(c,d,r,t,'lowpass',k,k/5,.24,.8);osc(c,d,r,t,'sine',140*p,40,.22,.6);noise(c,d,r,t,'highpass',2500,0,.04,.4);},
    rocket:(c,d,r,t,v)=>{const p=[1,.75,1.35][v];noise(c,d,r,t,'bandpass',600*p,2400*p,.5,.5,.9);osc(c,d,r,t,'sawtooth',120*p,50*p,.4,.3,900);},
    swish:(c,d,r,t,v)=>{const p=[1,.8,1.3][v];noise(c,d,r,t,'bandpass',1700*p,5200*p,.12,.4,1.2);},
    knifehit:(c,d,r,t,v)=>{const p=[1,.82,1.22][v];osc(c,d,r,t,'triangle',250*p,90*p,.09,.5);noise(c,d,r,t,'bandpass',3000*p,0,.04,.3,.9);},
    finisher:(c,d,r,t,v)=>{const p=[1,.85,1.2][v];noise(c,d,r,t,'highpass',1500*p,0,.07,.6);osc(c,d,r,t,'sine',190*p,45,.24,.8);osc(c,d,r,t,'square',900*p,300*p,.06,.2,2500);},
    impact:(c,d,r,t,v)=>{const p=[1,.75,1.3][v],k=[1200,700,1800][v];osc(c,d,r,t,'sine',160*p,50,.13,.7);noise(c,d,r,t,'lowpass',k,k/3,.07,.45);},
    foehurt:(c,d,r,t,v)=>{const p=[1,.8,1.3][v];noise(c,d,r,t,'bandpass',700*p,400*p,.12,.45,1.5);osc(c,d,r,t,'sawtooth',270*p,140*p,.12,.22,1200);},
    foedeath:(c,d,r,t,v)=>{const p=[1,.75,1.3][v];noise(c,d,r,t,'bandpass',900*p,250*p,.36,.5,1.1);osc(c,d,r,t,'sawtooth',210*p,50*p,.36,.35,700);},
    kaihurt:(c,d,r,t,v)=>{const p=[1,.8,1.25][v];noise(c,d,r,t,'bandpass',950*p,350*p,.26,.55,1);osc(c,d,r,t,'sawtooth',340*p,90*p,.26,.38,1500);osc(c,d,r,t,'sine',90*p,40,.2,.5);},
    block:(c,d,r,t,v)=>{const p=[1,.8,1.35][v];osc(c,d,r,t,'square',1200*p,0,.18,.16,5000);osc(c,d,r,t,'triangle',1870*p,0,.2,.2);noise(c,d,r,t,'highpass',4000,0,.03,.3);},
    pickup:(c,d,r,t,v)=>{const p=[1,.89,1.26][v];osc(c,d,r,t,'triangle',880*p,0,.1,.22);osc(c,d,r,t+.06,'triangle',1320*p,0,.14,.2);}};
  const F={T,S,CAP,vox,stat:{played:0,gap:0,steal:0,off:0},bus:null,
    has:id=>!!T[id],
    // true while the old on-foot sound of that name is replaced by this set
    owns:n=>!!RET.footsfx&&(n==='shot'||n==='hit'||n==='pick'||n==='hurt'||n==='graze'),
    old:n=>{if(n==='pick')F.play('pickup');else if(n==='hurt')F.play('kaihurt');},
    // the sound bus: gain -> limiter -> dest (live: AU.sfxv; the offline probe uses the same chain)
    chain(c,dest){const lim=c.createDynamicsCompressor();lim.threshold.value=-22;lim.knee.value=6;lim.ratio.value=12;lim.attack.value=.002;lim.release.value=.1;
      const g=c.createGain();g.gain.value=BUSG;const o=c.createGain();o.gain.value=.7;g.connect(lim);lim.connect(o);o.connect(dest);return g;},   // o: trim after the limiter, keeps the transient peaks it lets through under the song
    wire(){const a=typeof AU!=='undefined'&&AU.a;if(!a||!AU.sfxv)return false;if(this.bus&&this.ctx===a)return true;this.ctx=a;this.bus=this.chain(a,AU.sfxv);return true;},
    // renders sound id / variant v on any context at time t into dest (used by play() and by the offline probes)
    synth(c,dest,id,v,t,level){const g=c.createGain(),rec=[];g.gain.value=level==null?1:level;g.connect(dest);S[id](c,g,rec,t,v);return{g,rec};},
    play(id,o){o=o||{};if(!RET.footsfx||!T[id]||!(o.force||(window.sndOn?sndOn('f_'+id):true)))return false;
      if(!this.wire()||AU.a.state!=='running')return false;const a=AU.a,t=a.currentTime+.005;
      if(!o.force&&t-(last[id]||-9)<T[id][1]){this.stat.gap++;return false;}last[id]=t;
      let v=o.v!=null?o.v:(Math.random()*3|0);if(o.v==null&&v===lastV[id])v=(v+1+(Math.random()*2|0))%3;lastV[id]=v;
      for(let i=vox.length-1;i>=0;i--)if(vox[i].end<t)vox.splice(i,1);
      while(vox.length>=CAP){const o2=vox.shift();this.stat.steal++;try{o2.g.gain.cancelScheduledValues(t);o2.g.gain.setTargetAtTime(0,t,.008);for(const s of o2.rec)s.stop(t+.04);}catch(e){}}
      const vol=(window.SND&&SND.cfg?SND.cfg.vol:1)*T[id][2],x=this.synth(a,this.bus,id,v,t,vol);x.end=t+.7;vox.push(x);this.stat.played++;this.last={id,v};return true;},
    // game events -> sounds
    ev(n,arg){if(!RET.footsfx)return;switch(n){
      case'shot':{const k={pistol:'pistol',hmg:'smg',smg:'smg',shot:'shotgun',rocket:'rocket'}[arg];if(k)this.play(k);break;}
      case'foedeath':case'foehurt':case'swish':case'knifehit':case'finisher':case'block':case'kaihurt':case'impact':case'pickup':this.play(n);break;}},
    guard(){this.play('block');},kick(){this.play('impact',{v:1});},punch(){this.play('impact',{v:0});}};
  return F;})();
if(RET.footsfx){
  for(const id of Object.keys(FTX.T))SNDT.push(['f_'+id,'ft',FTX.T[id][0],1]);   // one Lab row each (ON FOOT group), default on
  {const i0=AU.init;AU.init=function(){const r=i0.apply(this,arguments);FTX.wire();return r;};}
}
