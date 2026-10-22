// PURPOSE: the Lab SOUND page: one row per sound and music effect, PLAY over the song, ON/OFF saved (gate = puremusic.js SND)
// FLAG: none (needs the Lab and RET.pure; ?pure=0 shows the page but every row plays and nothing is gated)
// TEST: qa/soundlab-test.js
/* ---------- SOUNDLAB: owner, 22 Oct 2026: "the effects are distorting the music, extremely annoying; I need to spot which ones; include them in the Lab so I can select".
   Page rows come from SND.T (puremusic.js), so a new sound id added there shows up here. PLAY forces that one sound for the call (SND.force) or switches that music effect on for 2.5 s (SND.pv)
   so the owner hears it over the song with its ON/OFF unchanged. ON/OFF and the Effects volume are saved in localStorage 'nr_snd'. ---------- */
if(window.SND&&window.LABX){
  const PV_MS=2500,now=()=>AU.a?AU.a.currentTime:0,later=(f,ms)=>setTimeout(()=>{try{f();}catch(e){}},ms);
  const lpBack=()=>{const L=AU.lp&&AU.lp.frequency;if(!L||!AU.a)return;const t=now();L.cancelScheduledValues(t);L.setTargetAtTime(AU.lpHz[AU.lyStep?AU.lyStep():2]||20000,t,.12);};
  // a music effect is made to happen once, and held on for PV_MS so the filters and buses are in the path
  const MU={
    m_duck:()=>{for(let i=0;i<4;i++)later(()=>AU.duckMusic(),i*600);},
    m_duckst:()=>{for(let i=0;i<3;i++)later(()=>AU.duckMusic(now()),i*800);},
    m_dull:()=>{const L=AU.lp&&AU.lp.frequency;if(!L)return;const t=now();L.cancelScheduledValues(t);L.setTargetAtTime(2500,t,.05);later(lpBack,PV_MS);},
    m_hit:()=>{AU.lyHit();later(()=>AU.lyHit(),1200);},
    m_slow:()=>{AU.slowColour(true);later(()=>{if(!(window.PW&&PW.wk<.97))AU.slowColour(false);},PV_MS);},
    m_drop:()=>{const g=AU.cutg&&AU.cutg.gain;if(!g)return;const t=now();g.setTargetAtTime(0,t,.012);g.setTargetAtTime(1,t+.9,.012);},
    m_pause:()=>{if(!window.NRF)return;NRF.apply(true);later(()=>NRF.apply(NRF.want()),PV_MS);},
    m_drum:()=>{SND.pv.tierForce=performance.now()+PV_MS+1500;try{AU.lyHit();}catch(e){}},
    m_tier:()=>{SND.pv.tierForce=performance.now()+PV_MS+1500;},
    m_echo:()=>{const t=now()+.02;for(let i=0;i<3;i++){const g=AU.osc(t+i*.5,'square',AU.f(AU.root+24+[0,3,7][i]),.4,.1,AU.mus,0,3000);if(g&&AU.dly)g.connect(AU.dly);}}};
  const PW_={
    heart:()=>{const t=now()+.02;for(let i=0;i<4;i++)AU.osc(t+i*.5,'sine',58,.2,.5,AU.musv,38);},
    hat:()=>{const t=now()+.02;for(let i=0;i<8;i++)AU.noise(t+i*.25,.04,.16,8500,AU.musv);},
    drums:()=>{const t=now()+.05,s=(BT.spb||.5)/4;SND.force='drums';try{for(let n=0;n<16;n++)PW.hit(n,t+n*s);}finally{SND.force=null;}},
    pwnote:()=>{for(let i=0;i<5;i++)PW2.note([0,2,4,5,7][i],.14,.07,'triangle',now()+.02+i*.08,24);},
    pwthump:()=>{AU.osc(now()+.02,'sine',110,.3,.5,AU.musv,40);AU.osc(now()+.52,'sine',90,.2,.4,AU.musv,45);},
    riser:()=>{const T=now()+.02;AU.osc(T,'sawtooth',110,2,.1,AU.fx,1400,2500);AU.noise(T,2,.12,3000,AU.fx);},
    dropboom:()=>{const T=now()+.02;AU.noise(T,.9,.9,300,AU.fx,'lowpass');AU.osc(T,'sine',150,.7,1,AU.fx,28);AU.noise(T,.25,.5,5000,AU.fx);},
    reward:()=>{const T=now()+.02;AU.noise(T,.7,.35,300,AU.fx,'lowpass');AU.osc(T,'sine',140,.5,.6,AU.fx,30);}};
  SND.play=function(id){AU.unlock();if(!AU.a||AU.a.state!=='running')return false;const r=SND.T.find(x=>x[0]===id);if(!r)return false;
    if(r[1]==='mu'){this.pv[id]=performance.now()+PV_MS;this.apply();later(()=>this.apply(),PV_MS+80);MU[id]();return true;}
    this.force=id;try{if(r[1]==='fx')AU.sfx(id);else if(r[1]==='st')AU.sting(id.slice(2)==='tierup'?'tierup1':id.slice(2));else{PW_[id]();}}finally{this.force=null;}
    return true;};
  // 'tier' is forced to 3 for a moment so the drum layer and the hats / kick / bass can be heard; the game writes AU.tier as before
  {let tv=AU.tier;Object.defineProperty(AU,'tier',{get(){return SND.pv.tierForce>performance.now()?Math.max(3,tv|0):tv;},set(v){tv=v;},configurable:true});
}
  const st=document.createElement('style');st.textContent=`#labP .snr{display:flex;align-items:center;gap:6px;width:100%;margin:2px 0}#labP .snr .sn{flex:1 1 auto;font-size:13px;line-height:1.25;min-width:0}
#labP .snr .lc{flex:0 0 auto;min-width:64px;min-height:36px}#labP .snv{display:flex;align-items:center;gap:8px;width:100%;font-size:13px}#labP .snv input{flex:1 1 auto;min-height:36px}`;document.head.appendChild(st);
  const build=body=>{
    const top=lsec(body,'SOUND LAB: PLAY hears one over the song, ON/OFF is saved');
    const v=lel('div','snv'),lab=lel('span','',''),sl=lel('input');sl.type='range';sl.min=0;sl.max=200;sl.step=5;sl.id='sndVol';sl.setAttribute('aria-label','Effects volume');
    const show=()=>{lab.textContent='Effects volume '+Math.round(SND.cfg.vol*100)+'%';};sl.value=Math.round(SND.cfg.vol*100);show();
    sl.addEventListener('input',()=>{SND.setVol(sl.value/100);show();});v.append(lab,sl);top.append(v);
    lchip(top,'ALL EFFECTS OFF',()=>SND.setOff(!SND.cfg.off),{on:()=>SND.cfg.off,text:on=>on?'ALL EFFECTS OFF: ON':'ALL EFFECTS OFF'});
    lchip(top,'CLEAN MIX',()=>{SND.cfg.on={};SND.cfg.off=false;SND.save();SND.apply();},{aria:'Back to the clean mix: only hurt, pick-up and explosion sounds'});
    for(const g of Object.keys(SND.G)){const host=lsec(body,SND.G[g]);
      for(const r of SND.T.filter(x=>x[1]===g)){const id=r[0],row=lel('div','snr'),nm=lel('span','sn',r[2]);row.dataset.id=id;row.append(nm);host.append(row);
        lchip(row,'PLAY',()=>{SND.play(id);},{aria:'Play: '+r[2]});
        lchip(row,'OFF',()=>SND.set(id,!SND.on(id)),{on:()=>SND.cfg.on[id]===undefined?SND.def(id):!!SND.cfg.on[id],text:on=>on?'ON':'OFF',aria:'Switch: '+r[2]});}}};
  if(typeof LF!=='undefined'&&LF.restore){const r0=LF.restore;LF.restore=function(s){if(s&&s.ls){const v=SNDLS.get.call(localStorage,'nr_snd');if(v===null)delete s.ls.nr_snd;else s.ls.nr_snd=v;}return r0.apply(this,arguments);};}   // leaving the Lab must not undo the choice
  const t0=LABX.tabs;LABX.tabs=()=>(t0?t0():[]).concat([['sound','SOUND']]);LABX.build=Object.assign(LABX.build||{},{sound:build});
  {const ls=labSync;labSync=function(){ls();const b=$('labTab_sound');if(b)b.classList.toggle('on',LAB.tab==='sound');};}
}
