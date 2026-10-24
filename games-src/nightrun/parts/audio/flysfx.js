// PURPOSE: flight sound set (player shots by weapon type and level, enemy shot, hits, 3 explosion sizes, boss hit / death, player hit, graze, medal, pick-up, EMP, multiplier break), synthesized, quiet, never touches the song
// FLAG: flysfx (?flysfx=0 = the old flight sounds)
// TEST: qa/flysfx-test.js
/* ---------- FLYSFX (W200, owner 24 Oct 2026: the flight stage has "no sound effects of bullets, explosions").
   Same design as footsfx.js: the song path is never touched (no duck, no filter, no volume change). Every sound is made with Web Audio on its own bus
   (FYS.bus -> limiter -> AU.sfxv), the peak stays well under the song. Each sound has 3 pitch / tone variants (never the same one twice in a row), a minimum gap
   (the player gun fires on the beat grid all run long, so it is short, soft and rate-limited) and a shared cap of 10 voices (the oldest is faded out when an 11th starts).
   One SND row per sound (group fly, default on) so the Lab SOUND page can switch any of them off. While flysfx is on, the old flight AU.sfx names
   (shot hit boom big graze hurt emp pick up) are replaced by this set; events with no old sound (enemy shot, boss hit, multiplier break) call FYS.ev(name, arg) from the game. ---------- */
if(RET.flysfx===undefined)RET.flysfx=!/[?&]flysfx=0/.test(location.search);
const FYS=window.FYS=(()=>{
  // id: [Lab row text, minimum gap s, bus level]; every id is also the name used by FYS.ev / FYS.play
  const T={pshot_pulse:['Your gun: pulse shot (higher level = fuller)',.075,.5],pshot_beam:['Your gun: beam shot (laser, arc)',.08,.5],pshot_swarm:['Your gun: swarm shot',.07,.45],pshot_mine:['Your gun: heavy shot (mine, disc)',.12,.6],
    eshot:['Enemy shot',.09,.4],ehit:['Your shot hits an enemy (tick)',.05,.35],xsmall:['Small explosion',.06,.8],xmed:['Medium explosion',.1,.9],xbig:['Big explosion',.15,1],
    bosshit:['Your shot hits a boss (heavy tick)',.07,.5],bossdeath:['Boss destroyed (long layered blast)',.5,1],phit:['Your ship is hit',.25,1],graze:['Near-miss tick',.06,.4],
    medal:['Medal or power-up collected',.12,.6],pickup:['Pick-up chime',.08,.5],emp:['EMP or bomb blast',.4,1],multbreak:['Multiplier breaks (falling tone)',.4,.7]};
  const CAP=10,BUSG=.1,vox=[],last={},lastV={},nbs=new WeakMap();
  const noiseBuf=c=>{let b=nbs.get(c);if(!b){b=c.createBuffer(1,c.sampleRate,c.sampleRate);const d=b.getChannelData(0);let s=54321;for(let i=0;i<d.length;i++){s=(s*1664525+1013904223)>>>0;d[i]=s/2147483648-1;}nbs.set(c,b);}return b;};   // fixed noise, so a variant sounds the same each time it is rendered
  const osc=(c,d,rec,t,type,f0,f1,dur,vol,cut)=>{const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);if(f1)o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+dur);let n=o;
    if(cut){const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=cut;o.connect(f);n=f;}n.connect(g);g.connect(d);o.start(t);o.stop(t+dur+.02);rec.push(o);};
  const noise=(c,d,rec,t,type,f0,f1,dur,vol,q)=>{const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=noiseBuf(c);s.loop=true;f.type=type;f.frequency.setValueAtTime(f0,t);if(q)f.Q.value=q;
    if(f1)f.frequency.exponentialRampToValueAtTime(f1,t+dur);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(f);f.connect(g);g.connect(d);s.start(t);s.stop(t+dur+.02);rec.push(s);};
  // layered explosion: crack (short bright noise) + low boom (sine sweep) + debris (long filtered noise); k scales length and weight
  const blast=(c,d,r,t,p,k,hi)=>{noise(c,d,r,t,'highpass',hi*p,0,.05+.03*k,.35+.1*k);osc(c,d,r,t,'sine',(120+20*k)*p,32,.18+.2*k,.5+.25*k);noise(c,d,r,t+.02,'lowpass',(1400+500*k)*p,300,.15+.28*k,.45+.15*k,.7);};
  // the sounds: S[id](c, d, rec, t, v, lv) with v = 0, 1, 2 (three tones / pitches) and lv = weapon level 1..10 (player shots only)
  const S={
    pshot_pulse:(c,d,r,t,v,lv)=>{const p=[1,.86,1.18][v]*(1-.025*(lv-1)),L=lv>=4?.12:0;osc(c,d,r,t,'triangle',900*p,300*p,.05,.3,4000);noise(c,d,r,t,'highpass',3000*p,0,.02,.18);if(L)osc(c,d,r,t,'sine',260*p,110*p,.07,L+(lv>=8?.1:0));},
    pshot_beam:(c,d,r,t,v,lv)=>{const p=[1,.84,1.2][v]*(1-.02*(lv-1));osc(c,d,r,t,'sawtooth',1400*p,500*p,.07,.16,3500);osc(c,d,r,t,'sine',700*p,260*p,.08,.2+.01*lv);},
    pshot_swarm:(c,d,r,t,v,lv)=>{const p=[1,.88,1.25][v]*(1-.02*(lv-1));noise(c,d,r,t,'bandpass',2400*p,1400*p,.04,.3,1.1);osc(c,d,r,t,'square',700*p,380*p,.04,.1,2600);},
    pshot_mine:(c,d,r,t,v,lv)=>{const p=[1,.82,1.25][v]*(1-.02*(lv-1));osc(c,d,r,t,'sine',210*p,60*p,.14,.55);noise(c,d,r,t,'lowpass',1600*p,500,.07,.3);},
    eshot:(c,d,r,t,v)=>{const p=[1,.85,1.2][v];osc(c,d,r,t,'square',520*p,220*p,.07,.14,2000);noise(c,d,r,t,'bandpass',1800*p,900*p,.04,.12,1);},
    ehit:(c,d,r,t,v)=>{const p=[1,.84,1.22][v];noise(c,d,r,t,'bandpass',3200*p,0,.025,.3,1.2);osc(c,d,r,t,'triangle',620*p,300*p,.04,.2);},
    xsmall:(c,d,r,t,v)=>{blast(c,d,r,t,[1,.72,1.4][v],0,2200);},
    xmed:(c,d,r,t,v)=>{blast(c,d,r,t,[1,.8,1.3][v],1,1800);},
    xbig:(c,d,r,t,v)=>{const p=[1,.8,1.3][v];blast(c,d,r,t,p,2,1500);osc(c,d,r,t+.05,'sine',70*p,28,.6,.45);},
    bosshit:(c,d,r,t,v)=>{const p=[1,.82,1.25][v];osc(c,d,r,t,'sine',170*p,80*p,.08,.45);noise(c,d,r,t,'bandpass',2200*p,0,.04,.3,1);osc(c,d,r,t,'square',1100*p,700*p,.03,.08,3000);},
    bossdeath:(c,d,r,t,v)=>{const p=[1,.8,1.3][v];blast(c,d,r,t,p,2,1500);blast(c,d,r,t+.22,p*.9,2,1300);blast(c,d,r,t+.5,p*.8,2,1200);osc(c,d,r,t+.3,'sine',60*p,24,1.1,.5);noise(c,d,r,t+.3,'lowpass',900*p,150,1,.3,.6);},
    phit:(c,d,r,t,v)=>{const p=[1,.8,1.25][v];noise(c,d,r,t,'bandpass',950*p,320*p,.28,.55,1);osc(c,d,r,t,'sawtooth',320*p,85*p,.26,.35,1400);osc(c,d,r,t,'sine',90*p,38,.22,.5);},
    graze:(c,d,r,t,v)=>{const p=[1,.9,1.2][v];osc(c,d,r,t,'triangle',2400*p,3400*p,.035,.14);noise(c,d,r,t,'highpass',5000,0,.02,.1);},
    medal:(c,d,r,t,v)=>{const p=[1,.89,1.26][v];osc(c,d,r,t,'triangle',660*p,0,.1,.2);osc(c,d,r,t+.06,'triangle',880*p,0,.1,.2);osc(c,d,r,t+.12,'triangle',1320*p,0,.18,.2);},
    pickup:(c,d,r,t,v)=>{const p=[1,.89,1.26][v];osc(c,d,r,t,'triangle',880*p,0,.09,.2);osc(c,d,r,t+.06,'triangle',1320*p,0,.13,.18);},
    emp:(c,d,r,t,v)=>{const p=[1,.85,1.2][v];osc(c,d,r,t,'sine',900*p,70,.55,.45);noise(c,d,r,t,'bandpass',1200*p,200,.5,.4,.8);osc(c,d,r,t,'sine',60*p,30,.6,.45);},
    multbreak:(c,d,r,t,v)=>{const p=[1,.85,1.2][v];osc(c,d,r,t,'sawtooth',520*p,150*p,.3,.2,1200);osc(c,d,r,t+.04,'triangle',390*p,110*p,.3,.2);}};
  // old AU.sfx names that this set replaces while flysfx is on and the run is a flight run -> the sound id (size ones are chosen by the game via FYS.next)
  const MAP={shot:'shot',hit:'ehit',boom:'xsmall',big:'xbig',graze:'graze',hurt:'phit',emp:'emp',pick:'pickup',up:'medal'};
  const shotId=()=>{const w=(window.WP&&WP.eq&&WP.eq[0])||'pulse',lv=window.WP&&WP.lvOf?WP.lvOf(w):1;
    return{id:{laser:'pshot_beam',arc:'pshot_beam',swarm:'pshot_swarm',mine:'pshot_mine',disc:'pshot_mine'}[w]||'pshot_pulse',lv};};
  const F={T,S,CAP,vox,MAP,stat:{played:0,gap:0,steal:0},bus:null,nextBoom:null,nextBig:null,nextHit:null,
    has:id=>!!T[id],
    // true while the old flight sound of that name is replaced by this set (not on foot)
    owns:n=>!!RET.flysfx&&!!MAP[n]&&typeof running!=='undefined'&&!!running&&!(window.FOOT&&FOOT.on),
    // the sound bus: gain -> limiter -> trim -> dest (live: AU.sfxv; the offline probe uses the same chain)
    chain(c,dest){const lim=c.createDynamicsCompressor();lim.threshold.value=-22;lim.knee.value=6;lim.ratio.value=12;lim.attack.value=.002;lim.release.value=.1;
      const g=c.createGain();g.gain.value=BUSG;const o=c.createGain();o.gain.value=.7;g.connect(lim);lim.connect(o);o.connect(dest);return g;},
    wire(){const a=typeof AU!=='undefined'&&AU.a;if(!a||!AU.sfxv)return false;if(this.bus&&this.ctx===a)return true;this.ctx=a;this.bus=this.chain(a,AU.sfxv);return true;},
    // renders sound id / variant v (weapon level lv) on any context at time t into dest (used by play() and by the offline probes)
    synth(c,dest,id,v,t,level,lv){const g=c.createGain(),rec=[];g.gain.value=level==null?1:level;g.connect(dest);S[id](c,g,rec,t,v,lv||1);return{g,rec};},
    play(id,o){o=o||{};if(!RET.flysfx||!T[id]||!(o.force||(window.sndOn?sndOn('y_'+id):true)))return false;
      if(!this.wire()||AU.a.state!=='running')return false;const a=AU.a,t=a.currentTime+.005;
      if(!o.force&&t-(last[id]||-9)<T[id][1]){this.stat.gap++;return false;}last[id]=t;
      let v=o.v!=null?o.v:(Math.random()*3|0);if(o.v==null&&v===lastV[id])v=(v+1+(Math.random()*2|0))%3;lastV[id]=v;
      for(let i=vox.length-1;i>=0;i--)if(vox[i].end<t)vox.splice(i,1);
      while(vox.length>=CAP){const o2=vox.shift();this.stat.steal++;try{o2.g.gain.cancelScheduledValues(t);o2.g.gain.setTargetAtTime(0,t,.008);for(const s of o2.rec)s.stop(t+.04);}catch(e){}}
      const vol=(window.SND&&SND.cfg?SND.cfg.vol:1)*T[id][2],x=this.synth(a,this.bus,id,v,t,vol,o.lv);x.end=t+(id==='bossdeath'?2.2:1.2);vox.push(x);this.stat.played++;this.last={id,v};return true;},
    // the old AU.sfx call -> this set. Returns true when the old sound must not play.
    sfx(n){if(!this.owns(n))return false;
      if(n==='shot'){const s=shotId();this.play(s.id,{lv:s.lv});return true;}
      if(n==='boom'){const k=this.nextBoom||'xsmall';this.nextBoom=null;this.play(k);return true;}
      if(n==='hit'){const k=this.nextHit||'ehit';this.nextHit=null;this.play(k);return true;}
      if(n==='big'){const k=this.nextBig||'xbig';this.nextBig=null;this.play(k);return true;}
      this.play(MAP[n]);return true;},
    // game events with no old sound (or that choose a size) -> sounds
    ev(n,arg){if(!RET.flysfx||(window.FOOT&&FOOT.on))return;switch(n){
      case'eshot':this.play('eshot');break;
      case'bosshit':this.nextHit='bosshit';break;                                             // set just before the game's own AU.sfx('hit')
      case'multbreak':this.play('multbreak');break;
      case'kill':this.nextBoom=arg&&(arg.type==='gunship'||arg.r>=24)?'xmed':'xsmall';break;   // set just before the game's own AU.sfx('boom')
      case'bossdown':this.nextBig='bossdeath';break;                                          // set just before AU.sfx('big') of the boss kill
      case'bossboom':this.nextBoom='xmed';break;}}};
  return F;})();
if(RET.flysfx){
  SNDGRP.fly='FLIGHT SOUNDS (new set)';
  for(const id of Object.keys(FYS.T))SNDT.push(['y_'+id,'fly',FYS.T[id][0],1]);   // one Lab row each, default on
  {const i0=AU.init;AU.init=function(){const r=i0.apply(this,arguments);FYS.wire();return r;};}
  {const s0=AU.sfx;AU.sfx=function(n){if(FYS.sfx(n))return;return s0.apply(this,arguments);};}   // outermost wrapper: the old flight names never reach the old mixer
}
