/* ============================================================ AU · adaptive music, richer SFX, feedback polish (tag AU) */
// Extends the existing AU object (no new AudioContext path: AU.init + the iOS unlock stay as they are).
// Music: one 16th-note clock, five themes on their own gain buses → duck → AU.mus. Only audible buses get notes (light CPU).
const AU_M={on:0,cur:'',want:'',bus:{},tg:{},till:{},duck:null,step:0,next:0,live:0,made:0,sb:0,sbF:0,sbAt:null,gear:1,thr0:0,int:0,dlg:false,tk:0,win:0,boostC:null};
const AU_BPM={fra:112,ath:118,race:172,mission:100,cut:76};
const AU_KEYS=Object.keys(AU_BPM);
function AU_build(){const A=AU,a=A.a;if(!a||AU_M.on)return;AU_M.on=1;
  // count live scheduled sources (oscillators + buffer sources); each disconnects itself when it ends
  for(const k of['createOscillator','createBufferSource']){const f=a[k].bind(a);a[k]=function(){const n=f();AU_M.live++;AU_M.made++;n.addEventListener('ended',()=>{AU_M.live--;try{n.disconnect()}catch(e){}});return n}}
  AU_M.duck=a.createGain();AU_M.duck.gain.value=1;AU_M.duck.connect(A.mus);
  for(const k of AU_KEYS){const g=a.createGain();g.gain.value=0;g.connect(AU_M.duck);AU_M.bus[k]=g;AU_M.tg[k]=0;AU_M.till[k]=0}
  // turbo whistle + tyre squeal: two persistent voices, gain-gated
  const tw=a.createOscillator(),twg=a.createGain();tw.type='sine';tw.frequency.value=1800;twg.gain.value=0;tw.connect(twg);twg.connect(A.fx);tw.start();AU_M.tw={o:tw,g:twg};
  const so=a.createOscillator(),sf=a.createBiquadFilter(),sg=a.createGain();so.type='sawtooth';so.frequency.value=1000;sf.type='bandpass';sf.frequency.value=1500;sf.Q.value=7;sg.gain.value=0;so.connect(sf);sf.connect(sg);sg.connect(A.fx);so.start();AU_M.sq={o:so,g:sg};
  AU_M.next=a.currentTime+.08}
function AU_want(){if(typeof M1!=='undefined'&&M1.cs)return'cut';
  if(state==='race'||state==='countdown'||state==='finished')return'race';if(state==='results')return'cut';
  if(state==='roam'&&RO&&RO.ch)return'mission';return CID==='ath'?'ath':'fra'}
function AU_isDlg(){const v=id=>{const e=document.getElementById(id);return!!e&&!e.hidden&&e.offsetWidth>0};return v('npcSay')||v('story')||v('m1Cs')}
function AU_tick(){const a=AU.a,t=a.currentTime,w=AU_want();AU_M.sb=0;
  if(w!==AU_M.cur){const prev=AU_M.cur;AU_M.cur=w;for(const k of AU_KEYS){const on=k===w?1:0;AU_M.tg[k]=on;AU_M.bus[k].gain.cancelScheduledValues(t);AU_M.bus[k].gain.setTargetAtTime(on,t,.45);if(!on&&prev===k)AU_M.till[k]=t+2.6}
    if(w==='cut'&&prev)AU_stinger(t)}
  if(w==='mission'){const ch=RO.ch,ph=ch&&ch.v2?(ch.v2.si|0):(ch&&ch.n|0)||0,en=typeof M1!=='undefined'?M1.goons.filter(g=>!g.dead).length:0;AU_M.int=Math.min(6,ph+en*.6)}
  if((AU_M.tk++&7)===0){const d=AU_isDlg();if(d!==AU_M.dlg){AU_M.dlg=d;AU_M.duck.gain.setTargetAtTime(d?.3:1,t,.12)}}}
// ---- instruments (all short-lived; dest is a theme bus)
const AU_kick=(t,b,v=1)=>AU.osc(t,'sine',150,.28,v,b,40);
const AU_snr=(t,b,v=.5)=>{AU.noise(t,.15,v,1900,b,'bandpass');AU.osc(t,'triangle',190,.08,v*.3,b,120)};
const AU_hat=(t,b,v=.12,l=.03)=>AU.noise(t,l,v,8500,b,'highpass');
function AU_pad(t,f,d,v,b){const a=AU.a,o=a.createOscillator(),g=a.createGain();o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+d*.35);g.gain.linearRampToValueAtTime(0,t+d);o.connect(g);g.connect(b);o.start(t);o.stop(t+d+.05)}
const AU_F=n=>AU.f(n);
// ---- themes: (t, step 0-15, bar, bus, seconds per step)
const AU_PAT={
  // Frankfurt: funk/pop · Em7 A7 Cmaj7 B7, slap bass, offbeat stabs, a little hook
  fra(t,s,bar,b,sp){const r=[40,45,48,47][bar%4],q=[[0,3,7,10],[0,4,7,10],[0,4,7,11],[0,4,7,10]][bar%4];
    if(s===0||s===7||s===10)AU_kick(t,b,.85);if(s===4||s===12)AU_snr(t,b,.45);if(s===15)AU_snr(t,b,.12);AU_hat(t,b,s%2?.05:.11,s===6?.12:.03);
    const BL={0:0,3:12,6:0,8:0,10:7,11:12,14:10};if(BL[s]!=null)AU.osc(t,'sawtooth',AU_F(r+BL[s]),sp*(s===0?1.6:.8),.22,b,0,900);
    if(s===3||s===6||s===11)for(const k of q)AU.osc(t,'square',AU_F(r+24+k),.09,.028,b,0,2600);
    if(bar%2===0){const M=[76,0,79,0,81,79,76,0,74,0,76,0,0,0,0,0][s];if(M){const g=AU.osc(t,'triangle',AU_F(M),sp*1.6,.07,b,0,4000);g.connect(AU.dly)}}},
  // Athens: bouzouki plucks on D Phrygian-dominant (Hijaz), tsifteteli-ish doum/tek
  ath(t,s,bar,b,sp){const SC=[0,1,4,5,7,8,10],deg=d=>74+SC[((d%7)+7)%7]+12*Math.floor(d/7),r=[50,50,55,50][bar%4];
    if(s===0||s===6||s===8)AU.osc(t,'sine',110,.22,.8,b,55);if(s===4||s===10||s===12||s===14)AU.noise(t,.05,.22,3200,b,'bandpass');if(s%2===1)AU_hat(t,b,.04);
    if(s===0||s===8||s===11)AU.osc(t,'triangle',AU_F(r-12),sp*2.5,.3,b,0,700);
    const M=(bar%2?[4,5,6,5,4,3,2,1,2,1,0,1,2,null,0,null]:[0,1,2,1,0,-1,0,null,3,4,3,2,1,2,1,0])[s];
    if(M!=null){const f=AU_F(deg(M)),g=AU.osc(t,'sawtooth',f,.2,.06,b,0,3800);AU.osc(t,'square',f*2,.12,.015,b,0,3000);if(s%4===0)g.connect(AU.dly)}
    else{const p=(bar%2?[4,5,6,5,4,3,2,1,2,1,0,1,2,2,0,0]:[0,1,2,1,0,-1,0,0,3,4,3,2,1,2,1,0])[s];const f=AU_F(deg(p));AU.osc(t,'sawtooth',f,.1,.035,b,0,3000);AU.osc(t+sp/2,'sawtooth',f,.1,.03,b,0,3000)}}, // tremolo pick on held notes
  // races: drum and bass · two-step break, reese bass, hats on every 16th
  race(t,s,bar,b,sp){const r=[38,38,41,36][bar%4],hot=pl&&(pl.nitro||pl.air);
    if(s===0||s===10)AU_kick(t,b,1);if(s===4||s===12)AU_snr(t,b,.6);if(s===7||s===15)AU_snr(t,b,.12);AU_hat(t,b,s%2?.06:.12+(hot?.05:0));
    if(s===0||s===8){const f=AU_F(r);AU.osc(t,'sawtooth',f,sp*7.5,.13,b,0,hot?1100:650);AU.osc(t,'sawtooth',f*1.012,sp*7.5,.13,b,0,hot?1100:650)}
    if(s===0&&bar%2===0)for(const k of[0,3,7,10]){const g=AU.osc(t,'square',AU_F(r+36+k),.22,.022,b,0,3200);g.connect(AU.dly)}},
  // missions: tension layers that stack with phase + live enemies (AU_M.int 0..6)
  mission(t,s,bar,b,sp){const I=AU_M.int,r=bar%4===3?34:33;
    if(s%2===0)AU.osc(t,'sawtooth',AU_F(r+(s%8===6?1:0)),sp*1.6,.16,b,0,380+I*160);
    if(I>=1&&(s===0||s===3))AU_kick(t,b,.7);
    if(I>=2&&s%2===0){const g=AU.osc(t,'square',AU_F([69,72,76,73][(s/2)%4]),sp*1.2,.022,b,0,1800+I*300);if(s%4===0)g.connect(AU.dly)}
    if(I>=3){if(s===8)AU_snr(t,b,.4);if(s===12||s===14||s===15)AU.osc(t,'sine',[0,0,0,0,0,0,0,0,0,0,0,0,140,0,120,100][s],.18,.45,b,60)}
    if(I>=4){AU_hat(t,b,s%2?.05:.09);if(s===0&&bar%4===0)AU.osc(t,'sawtooth',300,sp*16,.03,b,1200,2400)}},
  // cutscenes / results: slow pad under the dialogue
  cut(t,s,bar,b,sp){if(s===0){const r=[57,53,60,55][bar%4],q=bar%4===1||bar%4===3?[0,4,7]:[0,3,7];for(const k of q)AU_pad(t,AU_F(r+k),sp*16,.05,b);AU.osc(t,'sine',AU_F(r-24),sp*15,.12,b)}
    if(s===8&&bar%2)AU.osc(t,'triangle',AU_F([69,65,72,67][bar%4]+12),.6,.04,b).connect(AU.dly)}};
function AU_stinger(t){const a=AU.a,d=AU_M.duck;for(const k of[0,4,7,12])AU.osc(t,'sawtooth',AU_F(60+k),1.3,.06,d,0,3200);AU.osc(t,'sine',AU_F(36),1.2,.25,d,30);AU.noise(t,1.4,.12,6000,d,'highpass',12000)}
function AU_fanfare(){const a=AU.a;if(!a)return;const t=a.currentTime+.05,d=AU_M.duck||AU.mus;[0,4,7,12,7,12].forEach((k,i)=>{AU.osc(t+i*.12,'square',AU_F(72+k),i===5?.9:.18,.06,d,0,4000);AU.osc(t+i*.12,'triangle',AU_F(60+k),i===5?.9:.2,.1,d)})}
AU.sched=function(){const a=this.a;if(!a)return;AU_build();AU_tick();if(paused)return;
  if(AU_M.next<a.currentTime-.25)AU_M.next=a.currentTime+.05; // after a suspend: resync, never burst-catch-up
  while(AU_M.next<a.currentTime+.12){const t=AU_M.next,s=AU_M.step%16,bar=Math.floor(AU_M.step/16),sp=60/AU_BPM[AU_M.cur||'fra']/4;
    for(const k of AU_KEYS)if(AU_M.tg[k]>0||t<AU_M.till[k])AU_PAT[k](t,s,bar,AU_M.bus[k],sp);
    AU_M.next+=sp;AU_M.step++}};
// ---- engine: gears, turbo whistle, blow-off, tyre squeal
{const eng0=AU.engine.bind(AU);AU.engine=function(s,thr,on){eng0(s,thr,on);const a=this.a;if(!a||!s||!AU_M.on)return;const t=a.currentTime,x=clamp(Math.abs(s.v||0)/(s.stats.top||60),0,1.3),G=[0,.12,.27,.44,.63,.84,1.31];
  let g=1;while(g<6&&x>G[g])g++;const r=clamp((x-G[g-1])/(G[g]-G[g-1]),0,1);if(on&&g>AU_M.gear&&thr>.4)this.noise(t,.06,.12,1600,this.fx,'bandpass');AU_M.gear=g;
  if(on){const f=40+r*62+g*7+(s.air?20:0);this.o1.frequency.setTargetAtTime(f,t,.04);this.o2.frequency.setTargetAtTime(f*1.012,t,.04)}
  AU_M.tw.o.frequency.setTargetAtTime(1500+x*3200,t,.08);AU_M.tw.g.gain.setTargetAtTime(on?thr*x*x*.02+(s.nitro?.02:0):0,t,.08);
  if(on&&AU_M.thr0>.5&&thr<.1&&x>.35)this.noise(t,.4,.16,3500,this.fx,'highpass',9000);AU_M.thr0=on?thr:0;
  const dr=on&&!s.air&&((state==='roam'&&RO.dDir&&Math.abs(RO.v)>8)||(s.driftT>0));AU_M.sq.g.gain.setTargetAtTime(dr?.06:0,t,dr?.05:.09);if(dr)AU_M.sq.o.frequency.setTargetAtTime(900+Math.random()*260+x*220,t,.04)}}
// ---- voice cap: every one-shot (SFX and music notes) goes through AU.osc / AU.noise; past AU_VCAP live sources new voices are dropped,
// so bursts (many smashes / pickups / event chimes inside one frame or a fast sim) cannot pile up hundreds of overlapping sources
const AU_VCAP=110;
{const osc0=AU.osc,noise0=AU.noise;AU.osc=function(t,type,fr,dur,vol,dest){if(AU_M.on&&AU_M.live>=AU_VCAP){AU_M.drop=(AU_M.drop|0)+1;return this.a.createGain()}return osc0.apply(this,arguments)};
 AU.noise=function(){if(AU_M.on&&AU_M.live>=AU_VCAP){AU_M.drop=(AU_M.drop|0)+1;return}return noise0.apply(this,arguments)}}
// ---- SFX: size-aware brick clatter, takedown crunch, chime, whoosh, UI click
{const sfx0=AU.sfx.bind(AU);AU.sfx=function(n,x){const a=this.a;if(!a)return;AU_build();const t=a.currentTime,F=this.fx,rnd=Math.random;
  switch(n){
    case'brick':{const sz=Math.max(1,x??AU_M.sb),big=sz>5,k=Math.min(AU_M.live>90?3:14,3+Math.round(sz*1.3));AU_M.sb=0; // voice cap above: thin the clatter when many voices already play
    for(let i=0;i<k;i++)this.noise(t+i*(.018+rnd()*.022),big?.05:.025,(.2+rnd()*.14)*(big?1.15:1),(big?1300:2500)+rnd()*(big?1500:2600),F,'bandpass');
      if(big){this.osc(t,'sine',95,.26,.5,F,42);this.noise(t,.2,.32,650,F)}else this.osc(t+.03,'triangle',AU_F(88+(rnd()*8|0)),.06,.08,F);return}
    case'takedown':sfx0('takedown');this.noise(t,.4,.7,2200,F,'lowpass',180);this.osc(t,'square',62,.3,.25,F,28);for(let i=0;i<5;i++)this.noise(t+.04+i*.03,.03,.25,1800+rnd()*2400,F,'bandpass');AU_pop('TAKEDOWN!','#ff2d55');return;
    case'pick':{const f=AU_F(88+(rnd()<.5?0:3));for(const[m,v,d]of[[1,.14,.5],[2.76,.04,.25],[2,.06,.35]]){const g=this.osc(t,'sine',f*m,d,v,F);if(m===1)g.connect(this.dly)}this.osc(t+.07,'sine',f*1.5,.4,.08,F);return}
    case'nitro':case'boost':sfx0(n);this.noise(t,.75,.35,300,F,'bandpass',5200);return;
    case'ui':this.osc(t,'square',1250,.035,.05,F,0,3000);this.osc(t,'triangle',2500,.025,.04,F);return}
  return sfx0(n)}}
// ---- feedback polish
const AU_CSS=`#auPop{position:fixed;left:50%;top:24%;transform:translate(-50%,-50%);z-index:9998;pointer-events:none;font:italic 900 clamp(34px,9vw,72px) var(--hud,system-ui);color:#ff2d55;-webkit-text-stroke:3px #141413;text-shadow:0 6px 0 #141413,0 0 24px rgba(255,210,0,.6);white-space:nowrap;letter-spacing:.02em}
#auPop.on{animation:auPop .9s cubic-bezier(.2,1.7,.4,1) forwards}@keyframes auPop{0%{transform:translate(-50%,-50%) scale(.2) rotate(-12deg);opacity:0}18%{transform:translate(-50%,-50%) scale(1.25) rotate(-4deg);opacity:1}35%{transform:translate(-50%,-50%) scale(1) rotate(-4deg)}80%{opacity:1}100%{transform:translate(-50%,-70%) scale(1.05) rotate(-4deg);opacity:0}}
#hitPop.au2k{top:28%;font-size:clamp(34px,8vw,60px);-webkit-text-stroke:3px #141413;text-shadow:0 6px 0 #141413,0 0 20px rgba(255,210,0,.5)}
body.auBoost #speedFx{filter:brightness(1.5) contrast(1.2);animation-duration:.18s!important}
#auConf{position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:9999}#auConf i{position:absolute;top:-4vh;width:12px;height:8px;border-radius:2px;animation:auFall linear forwards}
#auConf i:nth-child(3n){width:10px;height:10px;border-radius:50%}@keyframes auFall{to{transform:translate(var(--dx),112vh) rotate(var(--r))}}
@media (orientation:portrait){body.touch:not(.portraitOk) #rotateHint{top:auto!important;bottom:calc(36% + env(safe-area-inset-bottom,0px));animation:hintOut .4s 2.6s forwards}}`;
{const st=document.createElement('style');st.textContent=AU_CSS;document.head.appendChild(st)}
function AU_pop(txt,col){if(state==='roam'){hitPop(txt,col);const e=document.getElementById('hitPop');if(e)e.classList.add('au2k');clearTimeout(AU_pop.t);AU_pop.t=setTimeout(()=>e&&e.classList.remove('au2k'),1150);return}
  let e=document.getElementById('auPop');if(!e){e=document.createElement('div');e.id='auPop';document.body.appendChild(e)}e.textContent=txt;e.style.color=col||'#ff2d55';e.hidden=false;e.classList.remove('on');void e.offsetWidth;e.classList.add('on');clearTimeout(AU_pop.h);AU_pop.h=setTimeout(()=>e.hidden=true,950)}
function AU_confetti(){let c=document.getElementById('auConf');if(c)c.remove();c=document.createElement('div');c.id='auConf';const C=['#ffd400','#ff2d55','#1e90ff','#36d17a','#ff9a3c','#ffffff'];
  for(let i=0;i<70;i++){const e=document.createElement('i');e.style.cssText=`left:${Math.random()*100}%;background:${C[i%6]};animation-duration:${1.8+Math.random()*1.6}s;animation-delay:${Math.random()*.6}s;--dx:${(Math.random()-.5)*30}vw;--r:${(Math.random()-.5)*1440}deg`;c.appendChild(e)}
  document.body.appendChild(c);setTimeout(()=>c.remove(),4200)}
function AU_fountain(at,sz){if(!at||!HUB.studFX)return;for(let k=0;k<Math.min(4,1+(sz/3|0));k++)studBurst(at,V3(0,0,0),0);
  for(const s of HUB.studFX)if(s.alive&&s.t===0){s.vel.y+=7;s.vel.x*=.55;s.vel.z*=.55}}
studBurst=(f=>function(at,fw,sp){AU_M.sb++;AU_M.sbF++;AU_M.sbAt=at;return f.apply(this,arguments)})(studBurst);
// stud fountain: the studs of a smash shoot up instead of out
smashCheck=(f=>function(dt){const n0=HUB.smashed;AU_M.sbF=0;AU_M.sbAt=null;const r=f.apply(this,arguments);if(HUB.smashed>n0)AU_fountain(AU_M.sbAt,AU_M.sbF);return r})(smashCheck);
comboAdd=(f=>function(k){const m0=comboMult();const r=f.apply(this,arguments);const m1=comboMult();if(m1>m0&&!RO.ch)AU_pop('+COMBO ×'+m1,'#ffd12c');return r})(comboAdd);
roamCam=(f=>function(dt){if(RO.ch)shake=0;else shake=Math.min(shake,.45);if(RO.boosting&&!RO.ch)fovKick=Math.max(fovKick,6*TUNE.fxFov);const b=!!RO.boosting;if(b!==AU_M.boostC){AU_M.boostC=b;document.body.classList.toggle('auBoost',b)}return f.apply(this,arguments)})(roamCam);
showResults=(f=>function(){const r=f.apply(this,arguments);try{if(pl&&pl.finished&&!pl.eliminated&&ships.length>1&&ships.every(o=>o===pl||!o.finished||o.finishTime>=pl.finishTime)){AU_M.win++;AU_confetti();AU_fanfare()}}catch(e){}return r})(showResults);
chEnd=(f=>function(v){let won=false;try{const ch=RO.ch,e=ch.m.ev,g=ch.g||OTG_GOAL[e.kind],HI=ch.hi??OTG_HI[e.kind];won=v!=null&&(ch.cap!==0)&&(HI?v>=g[2]:v<=g[2])}catch(e){}const r=f.apply(this,arguments);if(won){AU_M.win++;AU_confetti();AU_fanfare()}return r})(chEnd);
// UI clicks on any button
document.addEventListener('click',e=>{if(AU.a&&e.target&&e.target.closest&&e.target.closest('button,.seg b,.tab'))AU.sfx('ui')},true);
// ---- "Portrait works too": at most once per device, 3 s, never over the map / NEXT bar / minimap
{const KEY='mho_portok',seen=()=>{try{return!!localStorage.getItem(KEY)}catch(e){return true}},done=()=>{document.body.classList.add('portraitOk');try{localStorage.setItem(KEY,'1')}catch(e){}};
  if(seen())document.body.classList.add('portraitOk');
  const hit=(a,b)=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>0&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>0;
  const iv=setInterval(()=>{if(document.body.classList.contains('portraitOk'))return clearInterval(iv);const h=document.getElementById('rotateHint');if(!h||!h.offsetWidth)return;
    if(!AU_M.rotT){AU_M.rotT=1;try{localStorage.setItem(KEY,'1')}catch(e){}setTimeout(done,3000)}
    const r=h.getBoundingClientRect();for(const id of['m1Next','roamMini','roamMap']){const o=document.getElementById(id);if(o&&!o.hidden&&o.offsetWidth&&hit(r,o.getBoundingClientRect()))return done()}if(RO&&RO.mapOpen)done()},150)}
window.__au={M:AU_M,AU,get SET(){return SET},get RO(){return RO},want:AU_want,scene:D=>M1_scene(D),csEnd:()=>M1_csEnd(),openSettings:()=>openSettings(),pop:AU_pop,confetti:AU_confetti};

// ===== FL (feel): automatic vehicle switch by surface, smash-to-boost with combo, free-roam day/night cycle
// ---------- 1 · surface → vehicle (2K-Drive style auto switch, hysteresis, never mid-air, manual button = override)
const FL={clk:0,s:null,cand:null,cT:0,hold:0,log:[],t:null,acc:0,applied:null,mats:new Map(),scanT:0,chain:0,chainT:0,gain:[],hl:null,saveT:0,lastSurf:null};
const FL_HOLD=.1,FL_MINHOLD=.45;
function FL_road(x,z,m){const q=cityAt(x,z);if(q&&q.d<q.road.w/2+m)return true;const f=fillAt(x,z);if(f&&f.d<(f.r.w||12)/2+m)return true;
  const a=abAt(x,z);if(a&&Math.abs(a.lat)<a.road.w/2+m*.5)return true;if(PLAZAS.some(R=>inR(R,x,z,0)))return true;return false}
// raw surface under the car: deck/street = road, low ground = water, everything else (parks, grass, dirt lots, fields) = dirt
function FL_raw(T0,ground){if(T0.deck)return'road';if(ground<-1.5)return'water';const m=FL.s==='road'?6:2.5;return FL_road(RO.x,RO.z,m)?'road':'dirt'}
function FL_terr(T0,ground,dt=1/60){const raw=FL_raw(T0,ground),air=RO.y>ground+.5;FL.lastSurf=raw;FL.hold=Math.max(0,FL.hold-dt);
  if(FL.s==null){FL.s=raw;FL.cand=raw}
  if(!air&&raw!==FL.s){if(raw!==FL.cand){FL.cand=raw;FL.cT=0}FL.cT+=dt;if(FL.cT>=FL_HOLD&&FL.hold<=0){FL.s=raw;FL.hold=FL_MINHOLD;FL.cT=0}}else if(!air){FL.cand=FL.s;FL.cT=0}
  return raw}
const FL_VEH={road:'ship',dirt:'ship',water:'boat'};  // R1: dirt was 'offroad' = the car turned into the buggy on grass at 100 km/h
function FL_veh(){const v=(RO.vsel||'auto')==='auto'?FL_VEH[FL.s||'road']:RO.vsel;if(v!==FL.v&&!(pl&&pl.air)){if(FL.v){FL.log.push({v,s:FL.s,x:Math.round(RO.x),z:Math.round(RO.z)});if(FL.log.length>60)FL.log.shift();FL_burst(v)}FL.v=v}return FL.v||v}
function FL_burst(v){if(!pl||!RO.on)return;const at=pl.mesh.position.clone();at.y+=1.2;
  CR_noGlow=1;try{debris(at,V3(0,5,0),8,['#e8302a','#2a7ad8','#ffd12c','#3aa04a','#ffffff'].map(c=>new THREE.Color(c)),.45,RO.y);burst(SPARK,at,8,9,.25,new THREE.Color(1.3,1.2,.9))}finally{CR_noGlow=0}AU.sfx('boost');fovKick=Math.max(fovKick,4)}
// ---------- 2 · smashing fills boost (size-scaled, chain combo), goon takedowns refill, slower passive recharge
const FL_RECH=9,FL_CHAIN=1.6;
const FL_mult=n=>Math.min(3,1+.25*Math.max(0,n-1));
function FL_add(b,label){if(!pl)return 0;const b0=pl.bm;pl.bm=Math.min(100,pl.bm+b);const g=pl.bm-b0;FL.gain.push(+b.toFixed(2));if(FL.gain.length>40)FL.gain.shift();FL_pop(label||`+${Math.round(b)} BOOST`);return g}
function FL_smash(def){const now=FL.clk;FL.chain=now-FL.chainT<FL_CHAIN?FL.chain+1:1;FL.chainT=now;const base=2+(def.st||1),m=FL_mult(FL.chain);FL_add(base*m,`+${Math.round(base*m)} BOOST${m>1?' ×'+m:''}`)}
function FL_pop(t){let el=document.getElementById('flPop');const bar=document.getElementById('rgBar');if(!bar)return;
  if(!el){el=document.createElement('div');el.id='flPop';document.getElementById('roamGauge').appendChild(el);const st=document.createElement('style');
    st.textContent='#roamGauge{position:relative}#flPop{position:absolute;right:0;top:-18px;font:900 12px system-ui;color:#ffd12c;text-shadow:0 0 6px #000,0 0 10px #ff9a00;pointer-events:none;opacity:0;white-space:nowrap}#flPop.on{animation:flPop .7s ease-out}@keyframes flPop{0%{opacity:1;transform:translateY(6px) scale(1.25)}70%{opacity:1}100%{opacity:0;transform:translateY(-10px)}}#rgBar.flF{animation:flF .35s}@keyframes flF{0%{filter:brightness(2.6);box-shadow:0 0 14px #ffd12c}100%{filter:none}}';document.head.appendChild(st)}
  el.textContent=t;el.classList.remove('on');void el.offsetWidth;el.classList.add('on');bar.classList.remove('flF');void bar.offsetWidth;bar.classList.add('flF')}
{const _td=M1_takedown;M1_takedown=function(g){const r=_td.apply(this,arguments);if(RO.on&&pl)FL_add(45,'TAKEDOWN +45 BOOST');return r}}
// ---------- 3 · day/night cycle in free roam (24 real minutes per day; lerped moods, emissive windows/lamps/headlights, no extra lights)
const FL_DAY=24*60;if(!SET.tod)SET.tod="cycle";
function FL_mode(){return SET.tod||'cycle'}
function FL_keys(){if(FL.K&&FL.K.cid===CID)return FL.K;const f=id=>MOODS.find(m=>m.id===id)||ATHM.find(m=>m.id===id);const day=f(CCF.mood)||f('brick'),ngt=f('night');
  const night={...ngt,id:'flnight',wet:.2,top:[.012,.016,.05],mid:[.04,.05,.13],hor:[.2,.13,.22],gnd:[.04,.035,.05],fog:'#202238',hemi:['#8a90c8','#3a2c26',1.05],key:['#c8d4ff',.7,[-400,600,-300]],exp:1.12,bloom:[.75,.55],win:1,rain:[0,0,0,0],road:[.42,.3,1],env:.85,lamps:1,star:1,moon:1,band:.6,cloud:0,lightning:false};
  const dawn={...f('dawn'),rain:[0,0,0,0],wet:.1,hemi:['#ecd4bc','#4a3038',1.15],key:['#ffb070',1.7,[700,170,-900]]};
  const dusk={...f('athdusk'),hemi:['#e6c8a8','#3e2c30',1.05],key:['#ffa070',1.4,[-700,170,-500]]};
  const gold={...(CID==='ath'?f('athgold'):f('golden')),key:[CID==='ath'?'#ffcf90':'#ffe2c0',2.4,[-600,430,-300]]};
  // key-light direction is fixed across the cycle: shadow frustum (and its draw calls) stays identical day and night
  for(const m of[night,dawn,dusk,gold])m.key=[m.key[0],m.key[1],day.key[2]];const K=[[0,night],[.2,night],[.25,dawn],[.31,day],[.66,day],[.73,gold],[.79,dusk],[.85,night],[1,night]];K.cid=CID;return FL.K=K}
const FL_c1=new THREE.Color(),FL_c2=new THREE.Color();
function FL_mix(a,b,k){const o={...(k<.5?a:b)};for(const key in a){const x=a[key],y=b[key];if(y===undefined)continue;
    if(typeof x==='number'&&typeof y==='number')o[key]=x+(y-x)*k;
    else if(typeof x==='string'&&x[0]==='#'&&typeof y==='string')o[key]='#'+FL_c1.set(x).lerp(FL_c2.set(y),k).getHexString();
    else if(Array.isArray(x)&&Array.isArray(y))o[key]=x.map((v,i)=>typeof v==='number'?v+(y[i]-v)*k:typeof v==='string'&&v[0]==='#'?'#'+FL_c1.set(v).lerp(FL_c2.set(y[i]),k).getHexString():Array.isArray(v)?v.map((w,j)=>w+(y[i][j]-w)*k):(k<.5?v:y[i]))}
  o.lightning=false;o.rain=[0,0,0,0];return o}
function FL_at(t){const K=FL_keys();let i=0;while(i<K.length-2&&t>=K[i+1][0])i++;const[a0,A]=K[i],[a1,B]=K[i+1],k=a1>a0?Math.min(1,Math.max(0,(t-a0)/(a1-a0))):0,s=k*k*(3-2*k);return FL_mix(A,B,s)}
// night factor 0 (day) … 1 (night): drives windows, lamps, headlights
function FL_night(t){const K=FL_keys(),m=FL_at(t);return Math.min(1,Math.max(0,m.lamps??0))}
function FL_time(){if(FL.t==null){const v=store.get('mho_fl_tod',null);FL.t=typeof v==='number'&&v>=0&&v<1?v:.42}const m=FL_mode();return m==='day'?.45:m==='night'?.02:FL.t}
function FL_clock(t){const h=Math.floor(t*24),mi=Math.floor((t*24-h)*60);return String(h).padStart(2,'0')+':'+String(mi).padStart(2,'0')}
function FL_apply(t,force){const m=FL_at(t);m.id=t<.22||t>=.82?'night':t<.28?'dawn':t>=.69?'golden':CCF.mood;
  const U=SKYU;U.uTop.value.set(...m.top);U.uMid.value.set(...m.mid);U.uHor.value.set(...m.hor);U.uGround.value.set(...m.gnd);U.uSun.value.set(...m.sun);U.uStar.value=m.star;U.uBand.value=m.band;U.uMoon.value=m.moon;U.uCloud.value=m.cloud;
  scene.fog.color.set(m.fog);hemi.color.set(m.hemi[0]);hemi.groundColor.set(m.hemi[1]);hemi.intensity=m.hemi[2];moonL.color.set(m.key[0]);moonL.intensity=m.key[1];if(!RO.shadowOn)moonL.position.set(...m.key[2]);
  renderer.toneMappingExposure=m.exp;bloom.strength=m.bloom[0];bloom.radius=m.bloom[1];scene.environmentIntensity=m.env;
  const idCh=!MOOD||MOOD.id!==m.id;MOOD=m;applyMoodMaterials();if(idCh)ENVD=true;
  const n=Math.min(1,Math.max(0,m.lamps));FL.n=n;FL_emis(n,force);if(cloudsOn&&typeof CLOUDS!=='undefined'&&CLOUDS)CLOUDS.visible=n<.6}
// window/lamp emissives: scan hub materials once in a while (the city streams in lazily), scale from their base
function FL_emis(n,force){if(!HUB.grp)return;FL.scanT-=1;if(FL.scanT<=0||force){FL.scanT=40;HUB.grp.traverse(o=>{if(!o.isMesh)return;const ms=Array.isArray(o.material)?o.material:[o.material];for(const mt of ms)if(mt&&mt.emissiveMap&&!FL.mats.has(mt)&&mt.emissive&&mt.emissive.r>.5)FL.mats.set(mt,mt.emissiveIntensity)})}
  const k=.55+2.1*n;for(const[mt,b]of FL.mats){const v=b*k;if(Math.abs(mt.emissiveIntensity-v)>1e-3)mt.emissiveIntensity=v}
  const g=HUB.lampGlow;if(g){if(!FL.lc)FL.lc=g.color.clone();g.color.setRGB(.55,.52,.45).lerp(FL.lc,n)}
  FL_headlights(n)}
// headlights: one instanced additive mesh for all traffic + the player (always drawn, black by day → same draw calls day and night)
const FL_hm=new THREE.Matrix4(),FL_hq=new THREE.Quaternion(),FL_hv=new THREE.Vector3(),FL_hs=new THREE.Vector3(),FL_hy=new THREE.Vector3(0,1,0);
function FL_headlights(n){if(!HUB.grp||!HUB.cars)return;let H=FL.hl;const N=HUB.cars.length+1;
  if(!H||H.parent!==HUB.grp||H.count<N){if(H&&H.parent)H.parent.remove(H);
    const L=[cbox(.42,.26,.12,-.72,.85,2.25,'#fff6d8'),cbox(.42,.26,.12,.72,.85,2.25,'#fff6d8'),cbox(.36,.2,.1,-.74,.9,-2.25,'#ff2a20'),cbox(.36,.2,.1,.74,.9,-2.25,'#ff2a20')];
    const beam=new THREE.PlaneGeometry(3.4,11).rotateX(-Math.PI/2).translate(0,.12,8);const bc=new Float32Array(beam.attributes.position.count*3);for(let i=0;i<beam.attributes.position.count;i++){const zz=beam.attributes.position.getZ(i),k=zz<5?.32:.04;bc.set([k,k*.92,k*.75],i*3)}beam.setAttribute('color',new THREE.BufferAttribute(bc,3));L.push(beam);
    const mat=new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false,color:0x000000,fog:true});
    H=FL.hl=new THREE.InstancedMesh(mergeG(L),mat,N+8);H.frustumCulled=false;H.renderOrder=2;HUB.grp.add(H);H.userData.keep=1}
  H.material.color.setScalar(2.4*n);let j=0;
  if(pl&&RO.on){FL_hq.setFromAxisAngle(FL_hy,RO.h);FL_hm.compose(FL_hv.set(RO.x,RO.y,RO.z),FL_hq,FL_hs.set(1.2,1.2,1.25));H.setMatrixAt(j++,FL_hm)}
  for(const c of HUB.cars){if(c.dead>0)continue;const im=HUB.cim[c.k];if(!im)continue;im.getMatrixAt(c.j,FL_hm);H.setMatrixAt(j++,FL_hm)}
  H.count=j;H.instanceMatrix.needsUpdate=true}
function FL_step(dt){if(!RO.on||state!=='roam')return;FL.clk+=dt;const mode=FL_mode();FL_time();
  if(mode==='cycle'&&!RO.frozen){FL.t=(FL.t+dt/FL_DAY)%1;FL.saveT+=dt;if(FL.saveT>3){FL.saveT=0;store.set('mho_fl_tod',+FL.t.toFixed(5))}}
  FL.acc+=dt;const t=FL_time();if(FL.acc>=.1||FL.applied==null||FL.am!==mode){FL.acc=0;FL_apply(t,FL.am!==mode);FL.applied=t;FL.am=mode}
  else if(FL.hl&&FL.n>0)FL_headlights(FL.n)}
{const _rs=roamStep;roamStep=function(dt){_rs(dt);try{FL_step(dt)}catch(e){if(!FL.err){FL.err=1;console.warn('FL',e)}}}}
{const _he=hubEnter;hubEnter=function(){const r=_he.apply(this,arguments);FL.applied=null;FL.am=null;return r}}
window.__fl={FL,surf:()=>({raw:FL.lastSurf,s:FL.s,v:FL.v,veh:RO.veh,terr:RO.terr}),log:()=>FL.log.slice(),clr:()=>{FL.log.length=0;FL.gain.length=0},
  road:(x,z,m)=>FL_road(x,z,m??2.5),setT:t=>{FL.t=((t%1)+1)%1;FL.applied=null;FL.acc=1;store.set('mho_fl_tod',FL.t)},t:()=>FL_time(),clock:()=>FL_clock(FL_time()),night:()=>FL.n,apply:()=>{FL_apply(FL_time(),true);FL.applied=FL_time();FL.am=FL_mode()},
  mode:m=>{if(m){SET.tod=m;saveSet();FL.am=null}return FL_mode()},mult:FL_mult,base:def=>2+(def.st||1),RECH:FL_RECH,gainLog:()=>FL.gain.slice(),geo:()=>({parks:PARKS.map(R=>[R.name,Math.round(R.x0),Math.round(R.x1),Math.round(R.z0),Math.round(R.z1)]),riv:WATERS.map(S=>S.pts.filter((p,i)=>i%8==0).map(p=>[Math.round(p.x),Math.round(p.z),Math.round(p.hw)]))}),takedown:g=>M1_takedown(g)};

/* ===================== SP · local 2-player split-screen (race on any circuit, Smash Battle in Frankfurt free roam) =====================
   Everything is gated by SP_S.on: with split-screen off every wrapper calls straight through (single-player unchanged). */
const SP_S={on:false,mode:null,ai:true,trk:null,K2:{},pr2:{},p2:null,cam2:null,c2:null,snap2:true,lt:0,tap:{},res:false,sv:{},
  bt:null,who:1,pads:[null,null],padB:[{},{}]};
const SP_P1K=new Set(['KeyW','KeyA','KeyS','KeyD','Space','ShiftLeft','KeyQ','KeyE']),SP_P2K=new Set(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Enter','NumpadEnter','ShiftRight','Comma','Period']);
const SP_BATTLE_T=180,SP_RF=['x','y','z','h','vh','v','vy','yr','dDir','dT','landK','camH','camL','camR','hp','inv','turbo'];
const SP_okW=()=>innerWidth>=700;
// ---- gamepads: 1 pad -> player 2 (player 1 keeps the keyboard), 2 pads -> P1 + P2, in index order
function SP_padsPoll(){const L=navigator.getGamepads?[...navigator.getGamepads()].filter(g=>g&&g.connected):[];SP_S.pads=L.length>=2?[L[0],L[1]]:[null,L[0]||null];return L.length}
function SP_ctl(p){const k=p===1?K:SP_S.K2;let steer,thr,brk,abL,abR,boost,hb;
  if(p===1){steer=(k.KeyD?1:0)-(k.KeyA?1:0);thr=k.KeyW?1:0;brk=k.KeyS?1:0;abL=k.KeyQ?1:0;abR=k.KeyE?1:0;boost=k.ShiftLeft?1:0}
  else{steer=(k.ArrowRight?1:0)-(k.ArrowLeft?1:0);thr=k.ArrowUp?1:0;brk=k.ArrowDown?1:0;abL=k.Comma?1:0;abR=k.Period?1:0;boost=k.ShiftRight?1:0}
  const pad=SP_S.pads[p-1],B=SP_S.padB[p-1],pr=p===1?pressed:SP_S.pr2;
  if(pad){const ax=pad.axes[0]||0;if(Math.abs(ax)>.12)steer=clamp(steer+Math.sign(ax)*(Math.abs(ax)-.12)/.88,-1,1);const b=i=>pad.buttons[i]||{};thr=Math.max(thr,b(7).value||0);brk=Math.max(brk,b(6).value||0);
    abL=Math.max(abL,b(4).pressed?1:0);abR=Math.max(abR,b(5).pressed?1:0);boost=Math.max(boost,b(1).pressed?1:0);if(b(0).pressed&&!B.b0)pr.fire=true;if(b(2).pressed&&!B.b2&&Math.abs(ax)>.4)pr.roll=Math.sign(ax);
    if(b(9).pressed&&!B.b9&&state!=='roam')togglePause();B.b0=b(0).pressed;B.b2=b(2).pressed;B.b9=b(9).pressed}
  if(p===1?SP_S.st1>0:SP_S.st2>0)thr=boost=0;
  hb=state==='roam'&&(abL||abR)?1:0;if(mirror){steer=-steer;const t=abL;abL=abR;abR=t}
  return{steer,thr,brk,abL,abR,boost,hb,park:false}}
// ---- input: P2 keys never reach the game's own handlers while split-screen runs
const SP_live=()=>SP_S.on&&['race','countdown','finished','roam','results'].includes(state);
addEventListener('keydown',e=>{if(!SP_live()||!SP_P2K.has(e.code)||SP_S.res)return;e.preventDefault();e.stopImmediatePropagation();
  if(!e.repeat){if(e.code==='Enter'||e.code==='NumpadEnter')SP_S.pr2.fire=true;const d={ArrowLeft:-1,ArrowRight:1}[e.code];if(d){const now=performance.now();if(SP_S.tap[d]&&now-SP_S.tap[d]<280){SP_S.pr2.roll=d;SP_S.tap[d]=0}else SP_S.tap[d]=now}}
  SP_S.K2[e.code]=true},true);
addEventListener('keyup',e=>{if(SP_P2K.has(e.code))SP_S.K2[e.code]=false},true);
// ---- wrap the game: controls, AI step, race setup, traffic, results, menu
{const f0=ctlPlayer;ctlPlayer=(dtR)=>SP_S.on?SP_ctl(1):f0(dtR)}
{const f0=physAI;physAI=s=>{if(!s.SP_p2||s.finished||!SP_S.on)return f0(s);SP_padsPoll();const c=SP_ctl(2);if(s.stall>0){c.thr=0;s.stall-=H}const pr=pressed;pressed=SP_S.pr2;try{physPlayer(s,c)}finally{pressed=pr}
  if(SP_S.pr2.fire){SP_S.pr2.fire=false;if(s.item)useItem(s)}s.aiFire=99;s.bm=Math.min(100,s.bm+3*H);s.SP_c=c}}
{const f0=setupRace;setupRace=cfg=>{const sp=SP_S.on&&SP_S.mode==='race'&&cfg.type==='race';if(sp)cfg=Object.assign({},cfg,{traffic:Math.round((cfg.traffic||0)/2)});f0(cfg);if(sp)SP_addP2()}}
function SP_addP2(){const p1=pl;if(!p1)return;const ti=(TEAMS.indexOf(p1.team)+3+TEAMS.length)%TEAMS.length,team=TEAMS[ti<0?3:ti];
  if(!SP_S.ai)for(let i=ships.length-1;i>=0;i--){const s=ships[i];if(s!==p1){scene.remove(s.mesh);disposeTree(s.mesh,true);ships.splice(i,1)}}
  else{const i=ships.findIndex(s=>s!==p1&&Math.abs(s.dist-(p1.dist-8))<1&&Math.abs(s.x+p1.x)<1);if(i>=0){const s=ships[i];scene.remove(s.mesh);disposeTree(s.mesh,true);ships.splice(i,1)}}
  const s2=makeShip(team,false,'P2',1);s2.SP_p2=true;s2.dist=p1.dist;s2.x=-p1.x||8;s2.lives=1;s2.aiFire=99;ships.push(s2);SP_S.p2=s2;SP_S.snap2=true;SP_tag(p1.mesh,1);SP_tag(s2.mesh,2)}
function SP_tag(mesh,n){const c=document.createElement('canvas');c.width=128;c.height=64;const g=c.getContext('2d');g.fillStyle=n===1?'#2f7bff':'#ff2d55';g.beginPath();g.roundRect(14,6,100,52,26);g.fill();g.fillStyle='#fff';g.font='900 38px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillText('P'+n,64,33);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false,transparent:true}));sp.scale.set(3.2,1.6,1);sp.position.y=5.2;sp.renderOrder=9;sp.name='SP_tag';mesh.add(sp)}
{const f0=showResults;showResults=()=>{if(!SP_S.on||SP_S.mode!=='race')return f0();const p2=SP_S.p2;if(p2&&!p2.finished&&!p2.eliminated&&raceT-(pl.finishTime||raceT)<90){finishT=Math.min(finishT,4.4);return}SP_results()}}
{const f0=startRace;startRace=()=>{if(SP_S.on&&SP_S.mode==='race'){menuTab='quick';menuTrack=SP_S.trk||menuTrack}f0();if(SP_S.on&&SP_S.mode==='race'){SP_enterView();state==='countdown'&&say('2 PLAYERS',(SP_S.ai?'WITH AI':'HEAD TO HEAD'),1.6)}}}
{const f0=toMenu;toMenu=()=>{if(SP_S.on)SP_off();f0()}}
{const f0=buildMenu;buildMenu=()=>{f0();SP_btn()}}
{const f0=resize;resize=()=>{f0();if(SP_S.on)SP_layout()}}addEventListener('resize',()=>{if(SP_S.on)SP_layout()});
{const f0=addXP;addXP=(n,why)=>{if(SP_S.bt&&why==='traffic smash')SP_S.bt.sc[SP_S.who-1].tr++;return f0(n,why)}}
// ---- rendering: one scene, two viewports (scissor), own camera per player
const SP_cr0=composer.render.bind(composer);composer.render=function(d){if(!SP_S.on||!SP_S.cam2||!(SP_S.p2||SP_S.bt))return SP_cr0(d);SP_draw(d)};
function SP_rect(v){const w=innerWidth,h=innerHeight,side=w>=h;return side?[v*w/2,0,w/2,h]:[0,v?0:h/2,w,h/2]}
function SP_layout(){const r=SP_rect(0),pr=renderer.getPixelRatio();composer.setSize(r[2],r[3]);bloom.setSize(r[2]*pr*.5,r[3]*pr*.5);camera.aspect=r[2]/r[3];camera.updateProjectionMatrix();if(SP_S.cam2){SP_S.cam2.aspect=camera.aspect;SP_S.cam2.updateProjectionMatrix()}document.body.classList.toggle('SP_stack',innerWidth<innerHeight)}
function SP_draw(d){const now=performance.now(),gap=now-(SP_S.lt||0),dt=Math.min(.05,Math.max(.001,gap/1000));if(gap>500)SP_S.snap2=true;SP_S.lt=now;try{SP_cam2Update(dt)}catch(e){console.warn(e)}
  const rp=composer.passes[0],au=renderer.shadowMap.autoUpdate;renderer.setScissorTest(true);
  try{for(let v=0;v<2;v++){const r=SP_rect(v);renderer.setViewport(...r);renderer.setScissor(...r);rp.camera=v?SP_S.cam2:camera;if(v)renderer.shadowMap.autoUpdate=false;SP_cr0(d)}}
  finally{renderer.shadowMap.autoUpdate=au;rp.camera=camera;renderer.setScissorTest(false);renderer.setViewport(0,0,innerWidth,innerHeight)}}
function SP_cam2Update(dt){const C=camera,c2=SP_S.cam2;c2.near=C.near;c2.far=C.far;
  const sv={p:C.position.clone(),q:C.quaternion.clone(),up:C.up.clone(),fov:C.fov,fk:fovKick,sh:shake,mp:moonL.position.clone(),kp:shipKey.position.clone(),mt:moonL.target.position.clone(),uS:FX.uniforms.uSpeed.value,uB:FX.uniforms.uBoost.value,slo:speedLines.mesh.material.opacity};
  if(SP_S.bt){const P=SP_S.bt.r2,ro={},p1=pl,cs=camSnap;for(const f of SP_RF)ro[f]=RO[f];for(const f of SP_RF)RO[f]=P[f];pl=SP_S.bt.s2;camSnap=SP_S.snap2;if(SP_S.c2)C.position.copy(SP_S.c2.p);C.fov=SP_S.c2?SP_S.c2.fov:C.fov;shake=SP_S.bt.sh2||0;
    try{roamCam(dt)}finally{for(const f of ['camH','camL','camR'])P[f]=RO[f];for(const f of SP_RF)RO[f]=ro[f];pl=p1;camSnap=cs;SP_S.snap2=false}}
  else{const p1=pl,st=[camPos.clone(),camLat.clone(),camLook.clone(),camUp.clone()];if(SP_S.c2){camPos.copy(SP_S.c2.cp);camLat.copy(SP_S.c2.cl);camLook.copy(SP_S.c2.ck);camUp.copy(SP_S.c2.cu);C.fov=SP_S.c2.fov}pl=SP_S.p2;
    try{updateCam(dt,SP_S.snap2)}finally{pl=p1;SP_S.snap2=false;SP_S.c2={cp:camPos.clone(),cl:camLat.clone(),ck:camLook.clone(),cu:camUp.clone()};camPos.copy(st[0]);camLat.copy(st[1]);camLook.copy(st[2]);camUp.copy(st[3])}}
  SP_S.c2=Object.assign(SP_S.c2||{},{p:C.position.clone(),fov:C.fov});c2.position.copy(C.position);c2.quaternion.copy(C.quaternion);c2.up.copy(C.up);c2.fov=C.fov;c2.aspect=C.aspect;c2.updateProjectionMatrix();c2.updateMatrixWorld();
  C.position.copy(sv.p);C.quaternion.copy(sv.q);C.up.copy(sv.up);C.fov=sv.fov;C.updateProjectionMatrix();C.updateMatrixWorld();fovKick=sv.fk;shake=sv.sh;moonL.position.copy(sv.mp);shipKey.position.copy(sv.kp);moonL.target.position.copy(sv.mt);moonL.target.updateMatrixWorld();
  FX.uniforms.uSpeed.value=sv.uS;FX.uniforms.uBoost.value=sv.uB;speedLines.mesh.material.opacity=sv.slo}
// split mode on: halve the shadow map, force dynamic resolution, own camera
function SP_enterView(){if(!SP_S.cam2)SP_S.cam2=new THREE.PerspectiveCamera(64,1,.4,9000);if(!SP_S.sv.dres){SP_S.sv.dres=SET.dres;SET.dres='on';DRES.s=Math.min(DRES.s,.85)}
  if(!SP_S.sv.sm){SP_S.sv.sm=moonL.shadow.mapSize.x;moonL.shadow.mapSize.set(SP_S.sv.sm/2,SP_S.sv.sm/2);if(moonL.shadow.map){moonL.shadow.map.dispose();moonL.shadow.map=null}}
  SP_S.c2=null;SP_S.snap2=true;SP_S.res=false;SP_S.K2={};SP_S.pr2={};document.body.classList.add('SP_on');$('#SP_res').hidden=true;$('#SP_h').hidden=false;resize()}
function SP_off(){const B=SP_S.bt;if(B){if(B.s2&&B.s2.mesh){scene.remove(B.s2.mesh);disposeTree(B.s2.mesh,true)}for(const c of B.hid)c.dead=.01;if(pl&&pl.mesh)pl.mesh.remove(pl.mesh.getObjectByName('SP_tag'));RO.cool=1.5;RO.popCd=40;RO.frozen=false}
  SP_S.bt=null;SP_S.on=false;SP_S.mode=null;SP_S.p2=null;SP_S.res=false;document.body.classList.remove('SP_on','SP_stack');$('#SP_h').hidden=true;$('#SP_res').hidden=true;
  if(SP_S.sv.dres){SET.dres=SP_S.sv.dres;if(SET.dres!=='on')DRES.s=1}if(SP_S.sv.sm){moonL.shadow.mapSize.set(SP_S.sv.sm,SP_S.sv.sm);if(moonL.shadow.map){moonL.shadow.map.dispose();moonL.shadow.map=null}}SP_S.sv={};resize()}
// ---- Smash Battle: free roam in Frankfurt, most smash points in 3 minutes
async function SP_battle(){SP_S.on=true;SP_S.mode='battle';await enterRoam();await new Promise(r=>{const w=()=>state==='roam'?r():setTimeout(w,50);w()});try{storyClose()}catch(e){}try{window.__m1&&__m1.skip&&__m1.skip()}catch(e){}SP_battleInit()}
function SP_battleInit(){const old=SP_S.bt;if(old&&old.s2){scene.remove(old.s2.mesh);disposeTree(old.s2.mesh,true)}
  const p1=pl,ti=(TEAMS.indexOf(p1.team)+3+TEAMS.length)%TEAMS.length,s2=makeShip(TEAMS[ti<0?3:ti],false,'P2',1);s2.bm=40;
  const fx=Math.sin(RO.h),fz=Math.cos(RO.h);let px=RO.x,pz=RO.z;for(const o of[[6,0],[-6,0],[0,-9],[6,-9],[-6,-9],[0,9]]){const x=RO.x+fz*o[0]+fx*o[1],z=RO.z-fx*o[0]+fz*o[1];if(!roamHit(x,z,2.4,RO.y)&&!roamTerr(x,z,RO.y+.3).low){px=x;pz=z;break}}
  const r2={x:px,z:pz,y:groundAt(px,pz,RO.y+2),h:RO.h,vh:RO.h,v:0,vy:0,yr:0,dDir:0,dT:0,landK:0,camH:null,camL:null,camR:0,hp:100,inv:0,turbo:0};
  const hid=old?old.hid:HUB.cars.filter((c,i)=>i%2&&!(c.dead>0));for(const c of hid)c.dead=1e9;
  SP_S.bt={t:SP_BATTLE_T,s2,r2,sc:[{pr:0,tr:0,td:0},{pr:0,tr:0,td:0}],hid,tdCd:0,sh2:0,end:false};SP_S.st1=SP_S.st2=0;RO.v=0;RO.frozen=false;RO.hp=100;
  if(old)for(const c of HUB.cars)if(c.dead>0&&c.dead<1e8)c.dead=.01;
  if(!p1.mesh.getObjectByName('SP_tag'))SP_tag(p1.mesh,1);SP_tag(s2.mesh,2);SP_enterView();say('SMASH BATTLE','MOST SMASHES & TAKEDOWNS IN 3:00',2.2)}
const SP_pts=s=>s.pr+s.tr*3+s.td*10;
function SP_p2Step(dt){const B=SP_S.bt,P=B.r2,s=B.s2;SP_padsPoll();const c=SP_ctl(2),busy=B.end;SP_S.st2=Math.max(0,SP_S.st2-dt);
  const T0=roamTerr(P.x,P.z,P.y+.3),air=P.y>T0.g+.5,top=(RO.top||60),boost=c.boost&&s.bm>1&&!busy;s.nitro=boost||P.turbo>0;P.turbo=Math.max(0,P.turbo-dt);
  if(boost)s.bm=Math.max(0,s.bm-22*dt);else s.bm=Math.min(100,s.bm+7*dt);
  if(SP_S.pr2.fire){SP_S.pr2.fire=false;if(!air&&P.vy<=0&&!busy){P.vy=12;P.y+=.05;AU.sfx('launch')}}SP_S.pr2.roll=0;
  if(busy)P.v*=Math.max(0,1-dt*4);else if(!air){const tt=top*.66*(boost?1.45:1)*(P.turbo>0?1.2:1);if(c.thr||boost)P.v+=(s.stats.acc*1.15*Math.max(0,1-P.v/tt)+(boost?20:0))*dt;else P.v-=P.v*.4*dt;
    if(c.brk){if(P.v>0)P.v=Math.max(0,P.v-75*dt);else P.v-=22*dt}P.v=Math.max(-18,P.v);if(P.v>tt)P.v-=(P.v-tt)*1.5*dt}
  const sp=Math.abs(P.v),vr=clamp(sp/Math.max(30,top),0,1),maxR=(2.5-1.3*vr)*(air?.45:1)*Math.max(.6,clamp(sp/9,0,1)),hbOk=c.hb&&!air&&sp>22;
  if(hbOk&&!P.dDir&&Math.abs(c.steer)>.2){P.dDir=Math.sign(c.steer);P.dT=0}if(P.dDir&&!hbOk){if(P.dT>.5){P.turbo=Math.max(P.turbo,P.dT>1.1?1.3:.8);s.bm=Math.min(100,s.bm+8)}P.dDir=0;P.dT=0}
  let ytg=-c.steer*maxR*Math.sign(P.v||1);if(P.dDir){ytg=-P.dDir*maxR*(1.5+.6*clamp(c.steer*P.dDir,-1,1));P.dT+=dt}
  P.yr+=(ytg-P.yr)*Math.min(1,dt*(c.steer||P.dDir?14:18));P.h+=P.yr*dt;P.vh+=angDiff(P.h,P.vh)*Math.min(1,dt*(air?.6:P.dDir?2:13));
  let nx=P.x+Math.sin(P.vh)*P.v*dt,nz=P.z+Math.cos(P.vh)*P.v*dt;const N=roamTerr(nx,nz,P.y+.3);
  if(N.low||(N.g>P.y+1.4&&!air&&!RO.ramps.some(r=>Math.hypot(nx-r.x,nz-r.z)<r.len))){nx=P.x;nz=P.z;P.v*=-.25}else if(N.g>P.y+1.4){P.y=N.g}
  const hb=roamHit(nx,nz,2.2,P.y);if(hb){const pp=bldPush(hb,nx,nz,2.2);nx=pp[0];nz=pp[1];if(sp>20){P.v*=.7;burst(SPARK,V3(nx,P.y+1.5,nz),6,14,.3,new THREE.Color(2,1.4,.6))}}
  P.x=clamp(nx,WX0+10,WX1-10);P.z=clamp(nz,WZS+10,WZN-10);const g2=groundAt(P.x,P.z,P.y+.3);
  if(P.y>g2+.05||P.vy>0){P.vy-=30*dt;P.y+=P.vy*dt;if(P.y<=g2){P.landK=Math.min(1,-P.vy/22);P.y=g2;P.vy=0}}else if(g2-P.y<1.6)P.y+=(g2-P.y)*Math.min(1,dt*14);else P.y=g2;
  s.air=P.y>g2+1.2?{vy:P.vy}:null;s.v=sp;s.dist=0;
  // smashes: props through the game's own check (with P2 swapped in), traffic here
  const ro={},p1=pl,ctl=CTL,h0=HUB.smashed,cb=CB.n;for(const f of SP_RF)ro[f]=RO[f];for(const f of SP_RF)RO[f]=P[f];pl=s;CTL=c;SP_S.who=2;
  try{if(!busy)smashCheck(dt);roamPose(s,dt)}finally{for(const f of SP_RF)P[f]=RO[f];for(const f of SP_RF)RO[f]=ro[f];pl=p1;CTL=ctl;SP_S.who=1;CB.n=cb}
  B.sc[1].pr+=HUB.smashed-h0;
  if(!busy&&sp>10)for(const k of HUB.cars){if(k.dead>0||k.x==null)continue;if(Math.abs(k.x-P.x)>5||Math.abs(k.z-P.z)>5||Math.abs((k.y||0)-P.y)>3||Math.hypot(k.x-P.x,k.z-P.z)>=5||!OB_carP(k,P))continue;
    k.dead=25;const at=V3(k.x,(k.y||0)+1.5,k.z),f2=V3(Math.sin(P.vh),0,Math.cos(P.vh));debris(at,V3(0,9,0).addScaledVector(f2,sp*.5),18,[new THREE.Color('#d8302a'),new THREE.Color('#22252f'),new THREE.Color('#d0e8ff')],1.1,k.y||0);
    P.v*=s.nitro?.95:.85;s.bm=Math.min(100,s.bm+12);B.sc[1].tr++;B.sh2=.4;AU.sfx('crash')}
  B.sh2=Math.max(0,(B.sh2||0)-dt*3)}
// player vs player: the faster car (boosting or 15 km/h quicker) scores a takedown; the victim spins out for 1.5 s
function SP_duel(dt){const B=SP_S.bt,P=B.r2;B.tdCd=Math.max(0,B.tdCd-dt);const dx=P.x-RO.x,dz=P.z-RO.z,d=Math.hypot(dx,dz);if(d>=4.6||Math.abs(P.y-RO.y)>3||d<1e-3)return;
  const push=(4.6-d)/2,ux=dx/d,uz=dz/d;P.x+=ux*push;P.z+=uz*push;RO.x-=ux*push;RO.z-=uz*push;if(B.tdCd>0||B.end)return;
  const v1=Math.abs(RO.v),v2=Math.abs(P.v),b1=!!(pl&&pl.nitro),b2=!!B.s2.nitro;let w=0;if(v1>18&&(b1||v1-v2>4)&&v1>=v2)w=1;else if(v2>18&&(b2||v2-v1>4)&&v2>v1)w=2;if(!w)return;
  B.tdCd=1.6;B.sc[w-1].td++;const at=V3((RO.x+P.x)/2,RO.y+1.6,(RO.z+P.z)/2);burst(SPARK,at,40,24,.6,new THREE.Color(2.6,1.4,.4));AU.sfx('takedown');
  if(w===1){P.v=-6;P.yr=7;SP_S.st2=1.5;feed('P1 TAKEDOWN',1000,'#2f7bff')}else{RO.v=-6;RO.yr=7;SP_S.st1=1.5;feed('P2 TAKEDOWN',1000,'#ff2d55');shake=.5}}
{const f0=roamStep;roamStep=dt=>{const B=SP_S.bt;if(!SP_S.on||!B)return f0(dt);RO.cool=999;RO.popCd=999;SP_S.st1=Math.max(0,(SP_S.st1||0)-dt);SP_padsPoll();const h0=HUB.smashed;SP_S.who=1;f0(dt);B.sc[0].pr+=HUB.smashed-h0;
  SP_p2Step(dt);SP_duel(dt);if(!B.end){B.t-=dt;if(B.t<=0){B.t=0;B.end=true;RO.frozen=true;AU.sfx('finish');say('TIME!','',1.6);setTimeout(()=>{if(SP_S.bt===B)SP_results()},1200)}}}}
// ---- HUD per player
function SP_hud(){if(!SP_S.on)return;const B=SP_S.bt,mph=SET.units==='mph',u=mph?'MPH':'KPH',k=mph?2.237:3.6;
  const pp=B?[{v:Math.abs(RO.v),bm:pl?pl.bm:0,n:pl&&pl.nitro},{v:Math.abs(B.r2.v),bm:B.s2.bm,n:B.s2.nitro}]:[pl,SP_S.p2].map(s=>s&&{v:s.v,bm:s.bm,n:s.nitro,s});if(!pp[0]||!pp[1])return;const n=ships.filter(active).length;
  for(let i=0;i<2;i++){const q=pp[i],el=SP_S.hd[i];huT(el.spd,String(Math.round(q.v*k)).padStart(3,'0'));huT(el.u,u);huS(el.bar,'width',Math.round(q.bm)+'%');el.root.classList.toggle('nitro',!!q.n);
    if(B){const sc=B.sc[i];huT(el.a,SP_pts(sc)+' PTS');huT(el.b,`${sc.pr+sc.tr} SMASHES · ${sc.td} TAKEDOWNS`)}
    else{const s=q.s;huT(el.a,s.finished?'FINISHED':`POS ${s.place} / ${n}`);huT(el.b,`LAP ${clamp(s.lap+1,1,RC.laps)} / ${RC.laps}`)}}
  const t=$('#SP_t');if(B){t.hidden=false;huT(t,`${Math.floor(B.t/60)}:${pad2(Math.floor(B.t%60))}`)}else t.hidden=true}
{const f0=frame;frame=now=>{f0(now);if(SP_S.on&&!SP_S.res)try{SP_hud()}catch(e){}}}
// ---- results
function SP_results(){if(SP_S.res)return;SP_S.res=true;const B=SP_S.bt,el=$('#SP_res'),cols=['#2f7bff','#ff2d55'];let rows,win;
  if(B){RO.frozen=true;const P=B.sc.map(SP_pts);win=P[0]===P[1]?0:P[0]>P[1]?1:2;rows=B.sc.map((s,i)=>[[`${P[i]}`,'POINTS'],[s.pr,'PROPS SMASHED'],[s.tr,'TRAFFIC WRECKED'],[s.td,'TAKEDOWNS']])}
  else{state='results';$('#hud').hidden=true;const P=[pl,SP_S.p2];lapLogic();win=P[0].place<P[1].place?1:2;rows=P.map(s=>[[s.finished?ord(s.place):'DNF','PLACE'],[s.finished?fmt(s.finishTime):'—','TIME'],[isFinite(s.best)?fmt(s.best):'—','BEST LAP'],[s.takedowns||0,'TAKEDOWNS']])}
  $('#SP_rt').textContent=win?`PLAYER ${win} WINS`:'DRAW';$('#SP_rt').style.color=win?cols[win-1]:'#fff';$('#SP_rs').textContent=B?'SMASH BATTLE · FRANKFURT':`RACE · ${TRK.name}${SP_S.ai?' · WITH AI':''}`;
  $('#SP_rc').innerHTML=rows.map((r,i)=>`<div class="SP_card${win===i+1?' win':''}" style="--c:${cols[i]}"><h4>PLAYER ${i+1}${win===i+1?' 🏆':''}</h4>${r.map(([v,l])=>`<div><b>${v}</b><span>${l}</span></div>`).join('')}</div>`).join('');
  el.hidden=false;$('#SP_h').hidden=true;$('#SP_again').focus({preventScroll:true})}
function SP_rematch(){$('#SP_res').hidden=true;SP_S.res=false;if(SP_S.mode==='battle')SP_battleInit();else startRace()}
function SP_menu(){const roam=state==='roam'||!!SP_S.bt;SP_off();if(roam)exitRoam();else toMenu()}
// ---- setup screen + menu entry
function SP_btn(){let b=$('#SP_btn');if(!b){b=document.createElement('button');b.id='SP_btn';b.className='ghost';b.textContent='2 PLAYERS';b.title='Local split-screen for two players';b.onclick=()=>SP_open();const st=$('#startBtn');st.after(b)}b.hidden=menuTab!=='quick'}
function SP_open(){if(!SP_okW())return;const el=$('#SP_set');SP_S.trk=menuTrack;SP_S.m=SP_S.m||'race';SP_fill();el.hidden=false}
function SP_fill(){const tr=[...TDF,...(athOpen()?ATH_TRACKS:[])],np=SP_padsPoll();
  $('#SP_mode').innerHTML=[['race','RACE'],['battle','SMASH BATTLE']].map(([k,l])=>`<button data-k="${k}" aria-pressed="${SP_S.m===k}"${k==='battle'&&CID!=='fra'?' disabled title="Frankfurt only"':''}>${l}</button>`).join('');
  $('#SP_mode').querySelectorAll('button').forEach(b=>b.onclick=()=>{SP_S.m=b.dataset.k;SP_fill()});
  $('#SP_trk').innerHTML=tr.map(t=>`<option value="${t.id}"${t.id===SP_S.trk?' selected':''}>${t.short||t.name}</option>`).join('');$('#SP_trk').onchange=e=>SP_S.trk=e.target.value;
  $('#SP_ai').checked=SP_S.ai;$('#SP_ai').onchange=e=>SP_S.ai=e.target.checked;$('#SP_rw').hidden=SP_S.m!=='race';
  $('#SP_desc').textContent=SP_S.m==='race'?'Race on any circuit. First across the line after the last lap wins.':'3 minutes in Frankfurt free roam. Props 1 pt · traffic 3 pts · ramming the other player while boosting = takedown 10 pts.';
  $('#SP_pads').textContent=np?`🎮 ${np} gamepad${np>1?'s':''}: ${np>1?'pad 1 → P1, pad 2 → P2':'pad 1 → P2'}`:'🎮 No gamepad: press a button on a pad to connect (1 pad → P2, 2 pads → P1 + P2)'}
addEventListener('gamepadconnected',()=>{if(!$('#SP_set').hidden)SP_fill()});
function SP_go(){$('#SP_set').hidden=true;SP_S.on=true;SP_S.mode=SP_S.m;SP_S.res=false;if(SP_S.m==='battle'){homeShow&&homeShow(false);return SP_battle()}homeShow&&homeShow(false);startRace()}
{const st=document.createElement('style');st.textContent=`
#SP_btn{margin-left:8px}@media (max-width:699px){#SP_btn{display:none!important}}
#SP_set,#SP_res{position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;background:rgba(8,6,20,.82);font:600 15px system-ui,sans-serif;color:#fff}#SP_set[hidden],#SP_res[hidden],#SP_h[hidden],#SP_t[hidden]{display:none!important}
.SP_box{background:#15122a;border:2px solid #ffd400;border-radius:18px;padding:22px 26px;max-width:860px;width:calc(100% - 32px);box-shadow:0 10px 50px #000a}.SP_box h2{margin:0 0 4px;font:900 32px system-ui;letter-spacing:.04em;color:#ffd400}.SP_box p{opacity:.75;margin:4px 0 14px}
.SP_seg{display:flex;gap:8px;margin:8px 0}.SP_seg button,.SP_box .SP_b{font:800 15px system-ui;padding:10px 18px;border-radius:12px;border:2px solid #fff3;background:#221d40;color:#fff;cursor:pointer}.SP_seg button[aria-pressed=true]{background:#ffd400;color:#111;border-color:#ffd400}.SP_seg button:disabled{opacity:.4}
.SP_box .SP_b.go{background:#ffd400;color:#111;border-color:#ffd400}.SP_row{display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin:10px 0}.SP_row select{font:700 15px system-ui;padding:8px;border-radius:10px;background:#221d40;color:#fff;border:2px solid #fff3}
.SP_keys{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:14px 0}.SP_kc{border-radius:14px;padding:12px 14px;background:#0d0b1c;border:2px solid var(--c)}.SP_kc h4{margin:0 0 8px;color:var(--c);font:900 18px system-ui}
.SP_kc div{display:flex;justify-content:space-between;margin:4px 0;font-size:13px}.SP_kc kbd{font:800 12px ui-monospace,monospace;background:#fff;color:#111;border-radius:5px;padding:2px 6px;margin-left:3px;box-shadow:0 2px 0 #999}
#SP_h{position:fixed;inset:0;pointer-events:none;z-index:20}.SP_v{position:absolute;font:800 14px system-ui;color:#fff;text-shadow:0 2px 4px #000}.SP_v .sp{font:900 40px system-ui;line-height:1}.SP_v .sp small{font-size:13px;margin-left:4px;opacity:.8}
.SP_v .a{font:900 20px system-ui;color:var(--c)}.SP_v .bb{width:180px;height:10px;border-radius:5px;background:#0008;border:2px solid #fff6;margin-top:4px;overflow:hidden}.SP_v .bb i{display:block;height:100%;background:linear-gradient(90deg,#4ceaff,#c46bff);width:0}.SP_v.nitro .bb i{background:#ffd400}
.SP_v .tag{display:inline-block;background:var(--c);border-radius:8px;padding:1px 8px;margin-bottom:4px}
#SP_v1{left:16px;bottom:16px}#SP_v2{left:calc(50% + 16px);bottom:16px}body.SP_stack #SP_v1{left:16px;bottom:calc(50% + 12px)}body.SP_stack #SP_v2{left:16px;bottom:16px}
#SP_div{position:absolute;left:calc(50% - 2px);top:0;bottom:0;width:4px;background:#0b0918}body.SP_stack #SP_div{left:0;right:0;top:calc(50% - 2px);bottom:auto;width:auto;height:4px}
#SP_t{position:absolute;left:50%;top:12px;transform:translateX(-50%);font:900 30px system-ui;background:#0b0918;border:2px solid #ffd400;border-radius:12px;padding:2px 14px;color:#ffd400}
body.SP_on #hud,body.SP_on #touch,body.SP_on #m1Next,body.SP_on #roam>:not(#roamPause):not(#warpFade):not(#roamExit){display:none!important}
.SP_cards{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:14px 0}.SP_card{border:2px solid var(--c);border-radius:14px;padding:12px 16px;background:#0d0b1c}.SP_card.win{box-shadow:0 0 0 3px #ffd400}.SP_card h4{margin:0 0 6px;color:var(--c);font:900 20px system-ui}
.SP_card div{display:flex;justify-content:space-between;align-items:baseline;margin:5px 0}.SP_card b{font:900 24px system-ui}.SP_card span{opacity:.7;font-size:12px;letter-spacing:.06em}`;document.head.appendChild(st);
 const kc=(n,c,rows)=>`<div class="SP_kc" style="--c:${c}"><h4>PLAYER ${n}</h4>${rows.map(([l,k])=>`<div><span>${l}</span><span>${k.map(x=>`<kbd>${x}</kbd>`).join('')}</span></div>`).join('')}</div>`;
 const d=document.createElement('div');d.id='SP_set';d.hidden=true;d.innerHTML=`<div class="SP_box" role="dialog" aria-label="2 players"><h2>2 PLAYERS</h2><p>Split-screen on one keyboard, or with gamepads.</p>
  <div class="SP_seg" id="SP_mode"></div><div class="SP_row" id="SP_rw"><label>Circuit <select id="SP_trk"></select></label><label><input type="checkbox" id="SP_ai"> AI fill (6 rivals)</label></div><p id="SP_desc"></p>
  <div class="SP_keys">${kc(1,'#2f7bff',[['Steer / gas / brake',['W','A','S','D']],['Weapon (race) · hop (battle)',['Space']],['Boost',['L-Shift']],['Airbrake / drift',['Q','E']]])}${kc(2,'#ff2d55',[['Steer / gas / brake',['↑','←','↓','→']],['Weapon (race) · hop (battle)',['Enter']],['Boost',['R-Shift']],['Airbrake / drift',[',','.']]])}</div>
  <p id="SP_pads"></p><div class="SP_row"><button class="SP_b go" id="SP_goB">START</button><button class="SP_b" id="SP_back">BACK</button></div></div>`;document.body.appendChild(d);
 const r=document.createElement('div');r.id='SP_res';r.hidden=true;r.innerHTML=`<div class="SP_box"><h2 id="SP_rt"></h2><p id="SP_rs"></p><div class="SP_cards" id="SP_rc"></div><div class="SP_row"><button class="SP_b go" id="SP_again">REMATCH</button><button class="SP_b" id="SP_menuB">MENU</button></div></div>`;document.body.appendChild(r);
 const h=document.createElement('div');h.id='SP_h';h.hidden=true;h.innerHTML=`<div id="SP_div"></div><div id="SP_t" hidden></div>`+[1,2].map(n=>`<div class="SP_v" id="SP_v${n}" style="--c:${n===1?'#2f7bff':'#ff2d55'}"><span class="tag">P${n}</span><div class="a"></div><div class="b"></div><div class="sp"><span>000</span><small>KPH</small></div><div class="bb"><i></i></div></div>`).join('');document.body.appendChild(h);
 SP_S.hd=[1,2].map(n=>{const v=$('#SP_v'+n);return{root:v,a:v.querySelector('.a'),b:v.querySelector('.b'),spd:v.querySelector('.sp span'),u:v.querySelector('.sp small'),bar:v.querySelector('.bb i')}});
 $('#SP_goB').onclick=SP_go;$('#SP_back').onclick=()=>{$('#SP_set').hidden=true};$('#SP_again').onclick=SP_rematch;$('#SP_menuB').onclick=SP_menu;
 addEventListener('keydown',e=>{if(!$('#SP_set').hidden&&e.code==='Escape'){e.stopImmediatePropagation();$('#SP_set').hidden=true}},true)}
window.__SP={S:SP_S,open:SP_open,go:SP_go,start:(o={})=>{Object.assign(SP_S,{m:o.mode||'race',trk:o.trk||menuTrack,ai:o.ai!==false});return SP_go()},results:SP_results,rematch:SP_rematch,menu:SP_menu,ctl:SP_ctl,pts:SP_pts,
  get p2(){return SP_S.p2},get bt(){return SP_S.bt},get pl(){return pl},hub:()=>HUB,
  // draw calls of one rendered frame: split (both viewports) vs the same frame drawn single-screen
  measure(){const inf=renderer.info,ar=inf.autoReset;inf.autoReset=false;const one=f=>{inf.reset();f();return inf.render.calls};
    try{const on=SP_S.on;SP_S.on=false;resize();const single=one(()=>SP_cr0());SP_S.on=on;resize();const split=one(()=>SP_draw());return{single,split,k:+(split/single).toFixed(3)}}finally{inf.autoReset=ar;inf.reset()}}};

// ---------- TR game side: ground mesh resolution, buildings on the terrain, drivable slopes, slope tilt, camera, summit rewards, minimap relief
// ground cells refine by terrain curvature (bilinear error <= 5 cm, 8 m at most fine) and sit 10 cm low, so the draped streets (+4.5 cm) always show; rivers keep their own refinement in gndBuild
function TR_res(a,b,c,d){const N=6,h00=tH(a,c),h10=tH(b,c),h01=tH(a,d),h11=tH(b,d);let e=0;
  for(let i=1;i<N;i++)for(let j=1;j<N;j++){const u=i/N,v=j/N,l=(h00*(1-u)+h10*u)*(1-v)+(h01*(1-u)+h11*u)*v;e=Math.max(e,Math.abs(tH(a+(b-a)*u,c+(d-c)*v)-l))}
  if(e<.05)return false;const n=Math.min(Math.ceil((b-a)/8),Math.ceil(Math.sqrt(e/.05)));return n<=1?false:(b-a)/n}
{const _g=gndBuild;gndBuild=(grp,x0,x1,z0,z1,o)=>{const out=_g(grp,x0,x1,z0,z1,{...o,hilly:TR_res,y0:(o.y0||0)-.005});for(const m of out)m.userData.trG=1;return out}}
// buildings: most city builders place bodies at y=0. Right after the city merge (first hubGrid) every collider footprint gets its ground
// (min/max over corners, edges, centre). Bodies that start below their ground are lifted to max(lowest corner, highest corner - 0.8 m)
// (vertices of merged meshes and instance origins inside the footprint, + 1.6 m for balconies/eaves); a stone plinth fills down to the
// lowest corner. Colliders move with them. Pieces already placed on the ground keep their height (plinth only if they float).
const TR_PL=[];
function TR_bldFix(){const B=HUB.bld,C=new Map(),CS=8,K=(i,j)=>i*100000+j;
  for(const b of B){const c=b.c??1,s=b.s??0,P=[];for(const u of[-1,0,1])for(const v of[-1,0,1]){const lx=u*b.hw,lz=v*b.hd;P.push(groundY(b.x+lx*c+lz*s,b.z-lx*s+lz*c))}
    b.trMin=Math.min(...P);b.trMax=Math.max(...P);b.trY=1e9;const R=Math.hypot(b.hw,b.hd)+1.8;
    for(let i=Math.floor((b.x-R)/CS);i<=Math.floor((b.x+R)/CS);i++)for(let j=Math.floor((b.z-R)/CS);j<=Math.floor((b.z+R)/CS);j++){const k=K(i,j);let L=C.get(k);if(!L)C.set(k,L=[]);L.push(b)}}
  const find=(x,z,m)=>{const L=C.get(K(Math.floor(x/CS),Math.floor(z/CS)));if(!L)return null;let best=null,bo=1e9;for(const b of L){const dx=x-b.x,dz=z-b.z,lx=b.c==null?dx:dx*b.c-dz*b.s,lz=b.c==null?dz:dx*b.s+dz*b.c,o=Math.max(Math.abs(lx)-b.hw,Math.abs(lz)-b.hd);if(o<=m&&o<bo){bo=o;best=b}}return best};
  const meshes=HUB.grp.children.filter(o=>(o.isMesh||o.isInstancedMesh)&&!o.userData.trG&&o.geometry&&o.geometry.attributes.position),_M=new THREE.Matrix4(),_p=V3();
  for(const o of meshes){if(o.isInstancedMesh){for(let i=0;i<o.count;i++){o.getMatrixAt(i,_M);_p.setFromMatrixPosition(_M);const b=find(_p.x,_p.z,.4);if(b&&_p.y<b.trY)b.trY=_p.y}continue}
    const p=o.geometry.attributes.position.array;for(let i=0;i<p.length;i+=3){const b=find(p[i],p[i+2],.4);if(b&&p[i+1]<b.trY)b.trY=p[i+1]}}
  for(const b of B){b.trBot=b.trMin;if(b.trY===1e9){b.trOff=0;continue}const base=Math.max(b.trMin,b.trMax-.8),lo=b.trY<Math.max(b.trMin-1,.3)&&b.trMin>-1&&base>.05;if(lo){b.trOff=base;
      b.h+=base;b.y0=b.y0!=null?b.y0+base:b.trMin-1;b.trBase=b.trY+base;b.trDoor=base}else{const up=b.trMin>-1?base-b.trY:0;b.trOff=up>.05&&up<6?up:0;if(b.trOff){b.h+=up;if(b.y0!=null)b.y0+=up}b.trBase=b.trY+b.trOff;b.trDoor=b.trBase}
    if(b.trBase>b.trMin+.06){TR_PL.push(b);b.trBot=b.trMin-.4}else b.trBot=Math.min(b.trBase,b.trMin)}
  for(const o of meshes){let ch=false;if(o.isInstancedMesh){for(let i=0;i<o.count;i++){o.getMatrixAt(i,_M);_p.setFromMatrixPosition(_M);const b=find(_p.x,_p.z,1.6);if(b&&b.trOff){_M.elements[13]+=b.trOff;o.setMatrixAt(i,_M);ch=true}}if(ch){o.instanceMatrix.needsUpdate=true;o.computeBoundingSphere&&o.computeBoundingSphere()}continue}
    const A=o.geometry.attributes.position,p=A.array;for(let i=0;i<p.length;i+=3){const b=find(p[i],p[i+2],1.6);if(!b||!b.trOff)continue;
      const core=find(p[i],p[i+2],.4)===b;if(!core){const gv=groundY(p[i],p[i+2]);if(p[i+1]>gv-.15&&p[i+1]<gv+.35)continue}p[i+1]+=b.trOff;ch=true}
    if(ch){A.needsUpdate=true;o.geometry.computeBoundingSphere();o.geometry.computeBoundingBox()}}
  // plinths: 4 stone sides per lifted/floating building, merged per 800 m tile
  const T=new Map();for(const b of TR_PL){const k=hubTile(b.x,b.z);let a=T.get(k);if(!a)T.set(k,a={p:[],n:[]});const c=b.c??1,s=b.s??0,hw=b.hw+.35,hd=b.hd+.35,y0=b.trMin-.4,y1=b.trBase+.05,
      Q=[[-hw,-hd],[hw,-hd],[hw,hd],[-hw,hd]].map(([lx,lz])=>[b.x+lx*c+lz*s,b.z-lx*s+lz*c]);
    for(let e=0;e<4;e++){const A=Q[e],Bq=Q[(e+1)%4],nx=Bq[1]-A[1],nz=-(Bq[0]-A[0]),l=Math.hypot(nx,nz)||1,N=[nx/l,0,nz/l],cx=(A[0]+Bq[0])/2-b.x,cz=(A[1]+Bq[1])/2-b.z,f=cx*N[0]+cz*N[2]<0?-1:1;
      const V=[[A[0],y0,A[1]],[Bq[0],y0,Bq[1]],[Bq[0],y1,Bq[1]],[A[0],y1,A[1]]],I=f>0?[0,2,1,0,3,2]:[0,1,2,0,2,3];for(const t of I){a.p.push(...V[t]);a.n.push(N[0]*f,0,N[2]*f)}}}
  const pm=new THREE.MeshStandardMaterial({color:'#b5a68c',roughness:.92,metalness:0});for(const a of T.values()){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(a.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(a.n,3));const m=new THREE.Mesh(g,pm);m.receiveShadow=true;m.userData.trPl=1;HUB.grp.add(m)}
  HUB.trB={n:B.length,lifted:B.filter(b=>b.trOff).length,plinths:TR_PL.length}}
let TR_bf=0;{const _hg=hubGrid;hubGrid=()=>{if(!TR_bf&&HUB.grp){TR_bf=1;TR_bldFix()}return _hg()}}
// ---------- drivable slopes (2K-Drive style): gravity along the slope, full grip up to ~29°, fading to none at ~38° (the car then slides back
// down the fall line, never stuck); the car stays glued to the terrain (no airborne frames on terrain), never sinks below it
function TR_pre(dt){RO.trSlope=null;const T=roamTerr(RO.x,RO.z,RO.y+.3);if(RO.y>T.g+.5||T.deck||T.g<-1.5){RO.trSl=Math.max(0,(RO.trSl||0)-12*dt);return}
  const[gx,gz]=TR_grad(RO.x,RO.z,2),s=Math.hypot(gx,gz),th=Math.atan(s),fx=Math.sin(RO.vh??RO.h),fz=Math.cos(RO.vh??RO.h),a=gx*fx+gz*fz;RO.trSlope={gx,gz,th,a};
  RO.v-=9.8*.75*a/Math.sqrt(1+a*a)*dt;const grip=clamp((.665-th)/(.665-.5),0,1);RO.trGrip=grip;
  if(grip<1){if(a>0&&RO.v>-2&&CTL&&(CTL.thr||CTL.boost))RO.v-=(1-grip)*58*dt;RO.trSl=Math.min(9,(RO.trSl||0)+(1-grip)*16*dt)}else RO.trSl=Math.max(0,(RO.trSl||0)-12*dt)}
function TR_post(dt){const S=RO.trSlope;if(RO.trSl>.05&&S){const s=Math.hypot(S.gx,S.gz)||1,dx=-S.gx/s*RO.trSl*dt,dz=-S.gz/s*RO.trSl*dt;if(!roamHit(RO.x+dx,RO.z+dz,2.2,RO.y)){RO.x+=dx;RO.z+=dz}}
  TR_snap();TR_summitStep()}
function TR_snap(){const dt=1/60,T=roamTerr(RO.x,RO.z,RO.y+.3),g=T.g;RO.trDeck=!!T.deck;
  if(RO.y<g){RO.y=g;if(RO.vy<0)RO.vy=0}else if(RO.y>g&&RO.vy<=.01&&RO.vy>-8&&!RO.lastRamp&&RO.y-g<Math.abs(RO.v)*dt*1.2+.6){RO.y=g;RO.vy=0;if(pl)pl.air=null}}
function TR_tilt(s,dt){const ud=s.mesh&&s.mesh.userData;if(!ud||!ud.m)return;let nx=0,ny=1,nz=0;if(!s.air&&!RO.trDeck&&RO.y<groundY(RO.x,RO.z)+.6){const[gx,gz]=TR_grad(RO.x,RO.z,2.2),l=Math.hypot(gx,1,gz);nx=-gx/l;ny=1/l;nz=-gz/l}
  const N=RO.trN||(RO.trN=V3(0,1,0)),k=Math.min(1,dt*9);N.x+=(nx-N.x)*k;N.y+=(ny-N.y)*k;N.z+=(nz-N.z)*k;N.normalize();if(N.y>.9999)return;TR_q.setFromUnitVectors(TR_up,N);ud.m.quaternion.premultiply(TR_q)}
const TR_q=new THREE.Quaternion(),TR_up=V3(0,1,0);
const TR_live=()=>!!pl&&!RO.wk&&(RO.on||state==='roam');
{const _rs=roamStep;roamStep=dt=>{const on=TR_live();if(on)TR_pre(dt);_rs(dt);if(on&&TR_live())TR_post(dt)}}
{const _rp=roamPose;roamPose=(s,dt)=>{if(TR_live())TR_snap();_rp(s,dt);if(TR_live())TR_tilt(s,dt)}}
// chase camera: lifted over the hillside between camera and car (fast up, slow down) so it never clips into the slope
{const _rc=roamCam;roamCam=dt=>{_rc(dt);if(!TR_live())return;const c=camera.position;let need=0;for(const t of[1,.7,.4]){const x=RO.x+(c.x-RO.x)*t,z=RO.z+(c.z-RO.z)*t,yl=RO.y+2+(c.y-RO.y-2)*t,gq=groundY(x,z)+1.7;need=Math.max(need,(gq-yl)/t)}
  const L=RO.trCL||0;RO.trCL=L+(need-L)*Math.min(1,dt*(need>L?10:1.8));if(RO.trCL>.02){c.y+=RO.trCL;camera.lookAt(RO.x,RO.y+2,RO.z)}}}
// ---------- summit rewards: Lycabettus (district B) and Filopappou (district A): viewpoint ring + flag + a stud cluster, one-time photo bonus
const TR_SUM=[];function TR_summits(){if(CID==='fra'||TR_SUM.length)return TR_SUM;for(const[id,name]of[['lyka','LYCABETTUS'],['phil','FILOPAPPOU']]){const h=HILL_BY[id];if(!h||h.cx<WX0+40||h.cx>WX1-40||h.cz<WZS+40||h.cz>WZN-40)continue;let bx=h.cx,bz=h.cz,by=-1;
    for(let r=0;r<=260;r+=6)for(let k=0;k<Math.max(1,r/3);k++){const a=k/Math.max(1,r/3)*Math.PI*2,x=h.cx+Math.cos(a)*r,z=h.cz+Math.sin(a)*r,y=TR_G(x,z);if(y>by){by=y;bx=x;bz=z}}TR_SUM.push({id,name,x:bx,z:bz,y:groundY(bx,bz)})}return TR_SUM}
const TR_VPK='mho_trvp@'+SLOT;function TR_vp(){try{return JSON.parse(localStorage.getItem(TR_VPK)||'{}')}catch(e){return{}}}
function TR_summitStep(){for(const S of TR_SUM){if(Math.hypot(RO.x-S.x,RO.z-S.z)>16||RO.y>S.y+4)continue;const V=TR_vp();if(V[S.id])continue;V[S.id]=1;try{localStorage.setItem(TR_VPK,JSON.stringify(V))}catch(e){}
    studGain(250);hitPop('📷 VIEWPOINT · '+S.name+' +250','#5dffb0');AU.sfx('pick');if(S.m)S.m.material=neonMat('#ffd12c',2.4)}}
{const _br=buildRoam;buildRoam=(...a)=>{const r=_br(...a);try{TR_summitBuild()}catch(e){console.warn('TR summit',e)}return r}}
function TR_summitBuild(){const L=TR_summits();if(!L.length||!RO.grp)return;const src=(RO.sim||[])[0],V=TR_vp();
  for(const S of L){const g=new THREE.Group();g.position.set(S.x,S.y,S.z);const ring=new THREE.Mesh(new THREE.TorusGeometry(9,.6,8,40),neonMat(V[S.id]?'#ffd12c':'#5dffb0',2.4));ring.rotation.x=Math.PI/2;ring.position.y=.4;g.add(ring);S.m=ring;
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,14,8).translate(0,7,0),new THREE.MeshStandardMaterial({color:0xeeeeee})));const fl=new THREE.Mesh(new THREE.BoxGeometry(4,2.4,.2),neonMat('#2f9bff',2));fl.position.set(2,12.6,0);g.add(fl);RO.grp.add(g);
    if(src){const n=13,im=new THREE.InstancedMesh(src.geometry,src.material,n);im.frustumCulled=false;RO.grp.add(im);RO.sim.push(im);for(let i=0;i<n;i++){const a=i/12*Math.PI*2,r=i<12?11:0,x=S.x+Math.cos(a)*r,z=S.z+Math.sin(a)*r,y=groundY(x,z)+1.4;
      RO.studs.push({x,y,z,v:i<12?10:40,big:i===12,m:{position:V3(x,y,z),rotation:{z:0},visible:true},alive:true,t:0,im,i})}}}}
// ---------- minimap relief: hillshade (light from the north-west) multiplied over the painted map
{const _mp=miniPaint;miniPaint=(x0,x1,z0,z1,k,wt)=>{const R=_mp(x0,x1,z0,z1,k,wt);try{TR_shade(R.c,x1,z1,k)}catch(e){console.warn('TR shade',e)}return R}}
function TR_shade(c,x1,z1,k){const W=c.width,H=c.height,st=4,sw=Math.ceil(W/st),sh=Math.ceil(H/st),[c2,g2]=cv(sw,sh),im=g2.createImageData(sw,sh),d=im.data,cs=st/k,L=[.55,.64,-.55],ll=Math.hypot(...L);
  for(let j=0;j<sh;j++)for(let i=0;i<sw;i++){const x=x1-(i+.5)*cs,z=z1-(j+.5)*cs,hx=(tH(x-cs,z)-tH(x+cs,z))/(2*cs),hz=(tH(x,z-cs)-tH(x,z+cs))/(2*cs),nl=Math.hypot(hx,1,hz),
      l=(-hx*L[0]+L[1]-hz*L[2])/(nl*ll)-L[1]/ll,o=(j*sw+i)*4;if(l<0){d[o]=d[o+1]=d[o+2]=30;d[o+3]=Math.min(95,-l*300)}else{d[o]=d[o+1]=d[o+2]=255;d[o+3]=Math.min(55,l*180)}}
  g2.putImageData(im,0,0);const g=c.getContext('2d');g.save();g.imageSmoothingEnabled=true;g.drawImage(c2,0,0,W,H);g.restore()}
window.__tr={B:[HX0,HX1,HZS,HZN],hit:(x,z)=>!!roamHit(x,z,3),real:(e,n)=>TR_real(e,n),G:(x,z)=>TR_G(x,z),Y:(x,z)=>groundY(x,z),datum:TR_DATUM,ex:TR_EX,RW:(x,z)=>RW(x,z),WP:(e,n)=>WP(e,n),grad:(x,z)=>TR_grad(x,z),
  summits:()=>TR_summits().map(S=>({id:S.id,x:S.x,z:S.z,y:S.y})),vp:()=>TR_vp(),bstat:()=>HUB.trB,
  blds:()=>HUB.bld.filter(b=>b.trMin!=null).map(b=>[+b.x.toFixed(1),+b.z.toFixed(1),+b.trMin.toFixed(2),+b.trMax.toFixed(2),+(b.trBase??0).toFixed(2),+(b.trBot??0).toFixed(2),+(b.trDoor??0).toFixed(2),b.trOff?1:0,b.trY<1e9?1:0,+b.hw.toFixed(1),+b.hd.toFixed(1)]),
  slope:()=>RO.trSlope&&{th:+(RO.trSlope.th*57.3).toFixed(1),grip:+(RO.trGrip??1).toFixed(2),sl:+(RO.trSl||0).toFixed(2)}};

// ===== OG "something to do every 150 m" (LEGO 2K Drive Bricklandia density): on-the-go events that start the moment you drive
// through their ring (8 types, bronze/silver/gold, instant retry, stud payout), hidden golden bricks (behind ramps, on hill tops,
// on rooftops via a roof ramp), district Unique Collectibles with a collection screen, per-area completion % (map + pop-up, 100% reward).
// Spots are placed procedurally on the qv street graph (greedy cover, ≤150 m to the nearest unfinished thing), never on district gates,
// garages or mission starts, and markers are hidden near the NEXT story path. Rendering: 3 InstancedMeshes (≤ OG_N markers, alpha fade).
// Self-contained: globals are prefixed OG_ / OG; existing functions are extended by re-binding (roamStep, roamLanded, drawRoamMap).
CK.push('mho_og');CITYK.push('mho_og');
const OG={key:null,S:[],grid:new Map(),ev:null,last:null,cool:0,f:0,area:null,areaT:0,navP:null,navC:new Set(),vis:[],A:{},err:0,ramps:[],log:{start:0,fin:0,tier:[0,0,0,0],gold:0,col:0,retry:0}};
const OG_N=3,OG_R=190,OG_FADE=[110,190];
const OG_T={gate:{n:'Gate Crasher',ic:'⛓',col:'#ff5a2d',d:'Smash every gate before time runs out'},ring:{n:'Boost Rings',ic:'💫',col:'#2f9bff',d:'Fly through every ring'},
 drift:{n:'Drift Zone',ic:'🌀',col:'#c46bff',d:'Hold DRIFT and score points in the zone'},stunt:{n:'Stunt Jump',ic:'🎯',col:'#ff2d95',d:'Hit the ramp and land on the target'},
 rush:{n:'Stud Rush',ic:'🟡',col:'#ffd12c',d:'Grab as many studs as you can'},smash:{n:'Smash Count',ic:'💥',col:'#ff9a3c',d:'Smash the crates before the timer ends'},
 ghost:{n:'Ghost Race',ic:'👻',col:'#9fe8ff',d:'Beat the ghost to the finish flag'},ljump:{n:'Long Jump',ic:'🚀',col:'#5dffb0',d:'Launch off the ramp and fly far'}};
const OG_KS=Object.keys(OG_T),OG_PAY=[0,250,500,900];
// unique collectible themes: Frankfurt cycles per area, Athens one theme per district
const OG_TH={fra:[['Bembel jugs','🫖',0x4a6fd0,['Grey Bembel','Blue-glaze Bembel','Rippchen Bembel','Festival Bembel',"Oma's Bembel"]],
  ['Pretzels','🥨',0xc68a3a,['Laugenbrezel','Butterbrezel','Kümmelbrezel','Käsebrezel','Riesenbrezel']],
  ['Apple-wine glasses','🍎',0x5dd16a,['Geripptes','Schoppen','Sauergespritzter','Süßgespritzter','Fassbrause glass']],
  ['Green-sauce herbs','🌿',0x36b04a,['Borage','Chervil','Cress','Parsley','Sorrel']],
  ['Skyline bricks','🏙',0x9fb0c0,['Main Tower brick','Messeturm brick','Commerzbank brick','Opernturm brick','Westend brick']]],
 ath:{A:['Greek amphora set','🏺',0xd07a3a,['Black-figure amphora','Red-figure amphora','Panathenaic amphora','Wine amphora','Oil amphora']],
  B:['Owl coins','🦉',0xc0c8d0,['Silver tetradrachm','Bronze obol','Gold stater','Drachma','Didrachm']],
  C:['Komboloi beads','📿',0xd0a040,['Amber komboloi','Coral komboloi','Olive-wood komboloi','Bone komboloi','Glass komboloi']],
  D:['Olive branches','🫒',0x6a9a3a,['Kalamata branch','Koroneiki branch','Ancient olive branch','Silver-leaf branch','Victory wreath']]}};
function OG_sv(){if(OG.slot!==SLOT||!OG.s){OG.slot=SLOT;OG.s=store.get('mho_og',null)||{};for(const k of['e','g','c','rw','sum'])OG.s[k]=OG.s[k]||{}}return OG.s}
function OG_save(){store.set('mho_og',OG.s)}
const OG_snd=n=>{try{AU.sfx(n)}catch(e){}};
const OG_gk=(x,z)=>Math.floor(x/100)*100000+Math.floor(z/100);
function OG_rng(seed){let a=seed>>>0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function OG_SM(){try{return CID!=='fra'&&!!SM_ON}catch(e){return false}}
function OG_dOf(x,z){for(const d of Object.keys(ATH_DIST))if(athIn(d,...RW(x,z)))return d;return ATHD}
function OG_inD(x,z){return CID==='fra'||OG_SM()||athIn(ATHD,...RW(x,z))}
function OG_areaAt(x,z){let a=null;try{a=districtAt(x,z)}catch(e){}return a&&a!=='Am Main'?a:(CID==='fra'?'Frankfurt':ATH_DIST[ATHD].name)}
function OG_distName(){return CID==='fra'?'Frankfurt':ATH_DIST[ATHD].name}
// walk the street graph from node i in direction (dx,dz) for L metres, always taking the straightest continuation
function OG_walk(i,dx,dz,L){const G=qvGraph(),P=[[G.X[i],G.Z[i]]],C=[0];const d0x=dx,d0z=dz;let len=0,turn=0;const seen=new Set([i]);
  while(len<L){let b=-1,bs=-2;for(let k=G.off[i];k<G.off[i+1];k++){const j=G.nb[k];if(seen.has(j))continue;const ex=G.X[j]-G.X[i],ez=G.Z[j]-G.Z[i],l=Math.hypot(ex,ez)||1,c=(ex*dx+ez*dz)/l;if(c>bs){bs=c;b=j}}
    if(b<0||bs<.4)break;const ex=G.X[b]-G.X[i],ez=G.Z[b]-G.Z[i],l=Math.hypot(ex,ez)||1;dx=ex/l;dz=ez/l;turn=Math.max(turn,Math.acos(clamp(dx*d0x+dz*d0z,-1,1)));len+=l;P.push([G.X[b],G.Z[b]]);C.push(len);seen.add(b);i=b}
  return{P,C,len,turn}}
// flat ground along a walk: every 8 m within ±2.5 m of its start height (v81 terrain: no jump ramps onto hillsides)
function OG_flat(W){const y0=groundY(W.P[0][0],W.P[0][1]);for(let d=8;d<=W.len;d+=8){const q=OG_at(W,d);if(Math.abs(groundY(q.x,q.z)-y0)>2.5)return false}return true}
function OG_at(W,s){const P=W.P,C=W.C;let k=1;while(k<P.length-1&&C[k]<s)k++;const a=P[k-1],b=P[k]||a,l=(C[k]-C[k-1])||1,u=clamp((s-C[k-1])/l,0,1),hx=(b[0]-a[0])/l,hz=(b[1]-a[1])/l;return{x:a[0]+(b[0]-a[0])*u,z:a[1]+(b[1]-a[1])*u,hx,hz,h:Math.atan2(hx,hz)}}
function OG_excl(){const ex=[];for(const g of HUB.gates||[])ex.push([g.x,g.z,55]);for(const m of RO.marks||[])if(Number.isFinite(m.x))ex.push([m.x,m.z,45]);for(const g of GARAGES)if(g.x!=null)ex.push([g.x,g.z,45]);return ex}
const OG_near=(ex,x,z,f=1)=>ex.some(([a,b,r])=>(a-x)**2+(b-z)**2<r*r*f);
// ---------- procedural placement
function OG_build(){const G=qvGraph();if(!G||!RO.grp)return false;const t0=performance.now();OG_clear();OG_sv();
  const rn=OG_rng((CID==='fra'?7:OG_SM()?65*977:ATHD.charCodeAt(0)*977)+G.n),ex=OG_excl(),S=[],grid=new Map(),A={};
  const put=sp=>{sp.id=sp.k[0]+Math.round(sp.x/4)+'_'+Math.round(sp.z/4);sp.a=OG_areaAt(sp.x,sp.z);sp.y=sp.y??groundY(sp.x,sp.z);S.push(sp);const k=OG_gk(sp.x,sp.z);(grid.get(k)||grid.set(k,[]).get(k)).push(sp);return sp};
  const nearest=(x,z,R)=>{let b=null,bd=R*R;const r=Math.ceil(R/100),kx=Math.floor(x/100),kz=Math.floor(z/100);for(let a=-r;a<=r;a++)for(let c=-r;c<=r;c++){const L=grid.get((kx+a)*100000+kz+c);if(L)for(const s of L){const d=(s.x-x)**2+(s.z-z)**2;if(d<bd){bd=d;b=s}}}return b};
  const ok=(x,z)=>OG_inD(x,z)&&!inRiver(x,z)&&!OG_near(ex,x,z);
  // road samples every 20 m on the main component (inside the loaded district)
  const smp=[];for(const i of G.list)for(let k=G.off[i];k<G.off[i+1];k++){const j=G.nb[k];if(j<=i)continue;const L=Math.hypot(G.X[j]-G.X[i],G.Z[j]-G.Z[i]),n=Math.max(1,Math.ceil(L/20));for(let q=0;q<n;q++){const u=q/n,x=G.X[i]+(G.X[j]-G.X[i])*u,z=G.Z[i]+(G.Z[j]-G.Z[i])*u;if(OG_inD(x,z)&&!inRiver(x,z))smp.push([x,z,u<.5?i:j])}}
  OG.smp=smp;const deg=i=>G.off[i+1]-G.off[i];
  // golden bricks 1: in the air behind the city's jump ramps
  for(const r of RO.ramps||[]){if(r.dk||r.og)continue;const fx=Math.sin(r.h),fz=Math.cos(r.h),x=r.x+fx*(r.len/2+11),z=r.z+fz*(r.len/2+11);if(!ok(x,z)||nearest(x,z,120))continue;put({k:'gold',t:'ramp',x,z,y:r.y0+r.hgt+2.6})}
  // golden bricks 2: hill tops (highest road node of its 300 m cell, ≥ 12 m above the cell's lowest)
  {const C=new Map();for(const s of smp){const k=Math.floor(s[0]/300)*100000+Math.floor(s[1]/300),y=groundY(s[0],s[1]);let c=C.get(k);if(!c)C.set(k,c={hi:-1e9,lo:1e9,p:null,kx:Math.floor(s[0]/300),kz:Math.floor(s[1]/300)});if(y>c.hi){c.hi=y;c.p=s}c.lo=Math.min(c.lo,y)}
    for(const[k,c]of C){if(c.hi-c.lo<8)continue;const kx=c.kx,kz=c.kz;let top=true;for(let a=-1;a<=1&&top;a++)for(let b=-1;b<=1;b++){const o=C.get((kx+a)*100000+kz+b);if(o&&o!==c&&o.hi>c.hi){top=false;break}}
      if(top&&ok(c.p[0],c.p[1])&&!nearest(c.p[0],c.p[1],120))put({k:'gold',t:'hill',x:c.p[0],z:c.p[1],y:c.hi+2.4})}}
  // golden bricks 3: rooftops (low axis-aligned building beside a road; a yellow roof ramp leads up, the roof becomes drivable)
  {const seenB=new Set(),byA={};for(const L of HUB.grid?HUB.grid.values():[])for(const b of L){if(seenB.has(b))continue;seenB.add(b);if(b.c!=null||b.y0!=null||!b.h)continue;const gy=groundY(b.x,b.z),hh=b.h-gy;if(hh<3.5||hh>14||b.hw<6||b.hd<6||b.hw>22||b.hd>22)continue;
      const a=OG_areaAt(b.x,b.z);if((byA[a]||0)>=1||!ok(b.x,b.z)||nearest(b.x,b.z,150))continue;const R=OG_roof(b,gy,hh);if(!R)continue;byA[a]=1;put({k:'gold',t:'roof',x:b.x,z:b.z,y:b.h+1.6,roof:R})}}
  // unique collectibles: up to 5 per area, preferring dead ends / side streets, spread out (farthest-point)
  {const byA={};for(const s of smp){const a=OG_areaAt(s[0],s[1]);(byA[a]=byA[a]||[]).push(s)}
    let ti=0;for(const a of Object.keys(byA).sort()){const L=byA[a];const th=CID==='fra'?OG_TH.fra[ti++%OG_TH.fra.length]:OG_TH.ath[OG_SM()?OG_dOf(L[0][0],L[0][1]):ATHD];A[a]={th,n:0};const want=Math.min(5,Math.floor(L.length/25));const pick=[];
      for(let it=0;it<want;it++){let b=null,bv=-1;for(let q=0;q<L.length;q+=3){const s=L[q];if(!ok(s[0],s[1]))continue;let dm=400;for(const p of pick)dm=Math.min(dm,Math.hypot(p[0]-s[0],p[1]-s[1]));const sp=nearest(s[0],s[1],60);if(sp)continue;const v=dm+(deg(s[2])===1?120:0)+rn()*40;if(v>bv){bv=v;b=s}}
        if(!b)break;pick.push(b);put({k:'col',t:a,x:b[0],z:b[1],ci:it,y:groundY(b[0],b[1])+1.6})}A[a].n=pick.length}}
  // on-the-go events: greedy cover of the road samples (no two rings closer than 60 m), then a fix-up pass for any sample > 125 m (headroom for spots pruned under later mission marks)
  const ord=smp.map((s,i)=>i);for(let i=ord.length-1;i>0;i--){const j=Math.floor(rn()*(i+1));[ord[i],ord[j]]=[ord[j],ord[i]]}
  const addEv=s=>{const sp=put({k:'ev',t:null,x:s[0],z:s[1],i:s[2]});return sp};
  for(const oi of ord){const s=smp[oi];if(nearest(s[0],s[1],OG_R))continue;if(ok(s[0],s[1]))addEv(s)}
  for(let pass=0;pass<2;pass++)for(const s of smp){if(nearest(s[0],s[1],240))continue;let b=null,bd=1e9;for(const q of smp){const d=(q[0]-s[0])**2+(q[1]-s[1])**2;if(d<bd&&d<250*250&&ok(q[0],q[1])&&!nearest(q[0],q[1],110)){bd=d;b=q}}if(b)addEv(b)}
  // event types: balanced per area; jumps only where the road runs straight ≥ 110 m both ways over flat ground (hills cut long jumps short / launch into slopes)
  const cnt={};let ti2=0;for(const sp of S){if(sp.k!=='ev')continue;const i=sp.i,nb=[];for(let k=G.off[i];k<G.off[i+1];k++)nb.push(G.nb[k]);let st=false,dir=null;
    if(nb.length===2){const a=nb[0],ax=G.X[a]-G.X[i],az=G.Z[a]-G.Z[i],la=Math.hypot(ax,az)||1,w1=OG_walk(i,ax/la,az/la,110),w2=OG_walk(i,-ax/la,-az/la,110);st=w1.len>=105&&w2.len>=105&&w1.turn<.22&&w2.turn<.22&&OG_flat(w1)&&OG_flat(w2);dir=[ax/la,az/la]}
    const c=cnt[sp.a]=cnt[sp.a]||{};const pool=OG_KS.filter(k=>st||(k!=='stunt'&&k!=='ljump'));pool.sort((p,q)=>(c[p]||0)-(c[q]||0)||((OG_KS.indexOf(p)+ti2)%8)-((OG_KS.indexOf(q)+ti2)%8));ti2++;
    const t=pool[0];c[t]=(c[t]||0)+1;sp.t=t;sp.dir=dir;if(sp.i!=null){sp.x=G.X[i];sp.z=G.Z[i];sp.y=groundY(sp.x,sp.z)}}
  OG.S=S;OG.grid=grid;OG.A=A;OG.key=OG_key();OG.ms=Math.round(performance.now()-t0);OG_meshes();OG_sum();return true}
function OG_key(){const G=QV.g;return CID+'|'+(CID==='fra'||OG_SM()?'':ATHD)+'|'+(G?G.n:0)+'|'+(RO.grp?RO.grp.uuid:'')}
function OG_clear(){if(OG.ev)OG_end(null,1);for(const r of OG.ramps){for(const m of r.meshes)m.parent&&m.parent.remove(m);for(const q of r.rr){const i=RO.ramps.indexOf(q);if(i>=0)RO.ramps.splice(i,1)}}OG.ramps=[];if(OG.grp&&OG.grp.parent)OG.grp.parent.remove(OG.grp);OG.grp=null;OG.S=[];OG.grid=new Map()}
// a ramp from the road up onto a low roof + a flat drivable deck on the roof (as a hgt-0 ramp, which roamTerr treats as ground)
function OG_roof(b,gy,hh){const G=qvGraph();for(const[ax,sg]of[[0,1],[0,-1],[1,1],[1,-1]]){const fx=ax?sg:0,fz=ax?0:sg,face=ax?b.hw:b.hd,len=hh*3,cx=b.x+fx*(face+len/2),cz=b.z+fz*(face+len/2),sx=b.x+fx*(face+len+3),sz=b.z+fz*(face+len+3);
    const i=qvNear(sx,sz,14);if(i<0)continue;let clear=true;for(let d=2.5;d<len+2&&clear;d+=1.5)for(const o of[-3,0,3]){const px=b.x+fx*(face+d)+(ax?0:o),pz=b.z+fz*(face+d)+(ax?o:0);if(roamHit(px,pz,1.2,0)){clear=false;break}}if(!clear)continue;
    return{x:cx,z:cz,h:Math.atan2(-fx,-fz),len,hgt:hh+.15,w:7,gy,sx,sz,deck:{x:b.x,z:b.z,h:0,len:2*b.hd-.4,w:2*b.hw-.4,hgt:0,y0:b.h+.15,og:1}}}return null}
function OG_roofOn(sp){if(sp.roofOn)return;sp.roofOn=1;const R=sp.roof,n0=RO.grp.children.length;addRamp(R.x,R.z,R.h,R.len,R.hgt,R.w,0xffd12c);const rr=[RO.ramps[RO.ramps.length-1],R.deck];rr[0].og=1;RO.ramps.push(R.deck);OG.ramps.push({sp,meshes:RO.grp.children.slice(n0),rr})}
// ---------- rendering: 3 instanced meshes, per-instance alpha fade
function OG_fadeMat(col){const m=new THREE.MeshBasicMaterial({color:col,transparent:true,depthWrite:false,toneMapped:false});m.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aF;varying float vF;').replace('#include <begin_vertex>','#include <begin_vertex>\nvF=aF;');sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vF;').replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.a*=vF;')};return m}
function OG_meshes(){const grp=OG.grp=new THREE.Group();grp.name='OG';RO.grp.add(grp);const mk=(geo,col)=>{const im=new THREE.InstancedMesh(geo,OG_fadeMat(col),OG_N);im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);im.setColorAt(0,new THREE.Color(1,1,1));const f=new THREE.InstancedBufferAttribute(new Float32Array(OG_N),1);f.setUsage(THREE.DynamicDrawUsage);geo.setAttribute('aF',f);im.count=0;im.frustumCulled=false;grp.add(im);return im};
  OG.imE=mk(new THREE.TorusGeometry(5.6,.55,8,28),0xffffff);const bg=new THREE.BoxGeometry(2.4,1.1,1.2);OG.imG=mk(bg,0xffc21a);
  OG.imC=mk(new THREE.LatheGeometry([[0,0],[.55,.05],[.8,.6],[.75,1.2],[.4,1.6],[.45,2],[.6,2.15]].map(([x,y])=>new THREE.Vector2(x,y)),12),0xffffff)}
const _om=new THREE.Matrix4(),_oq=new THREE.Quaternion(),_oe=new THREE.Euler(),_ov=new THREE.Vector3(),_os=new THREE.Vector3(),_oc=new THREE.Color();
function OG_navCells(){const N=QV.nav,P=N&&N.P,wp=RO.wp;const key=P||wp?(P?P.length+':'+(P[0]&&P[0][0]):'')+'|'+(wp?Math.round(wp.x)+','+Math.round(wp.z):''):'';if(key===OG.navK)return OG.navC;OG.navK=key;const C=new Set();
  const add=(x,z)=>{for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)C.add((Math.floor(x/30)+a)*100000+Math.floor(z/30)+b)};
  if(P)for(let k=1;k<P.length;k++){const a=P[k-1],b=P[k],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.ceil(L/15));for(let q=0;q<=n;q++)add(a[0]+(b[0]-a[0])*q/n,a[1]+(b[1]-a[1])*q/n)}
  if(wp&&Number.isFinite(wp.x))add(wp.x,wp.z);return OG.navC=C}
const OG_onPath=sp=>OG.navC.has(Math.floor(sp.x/30)*100000+Math.floor(sp.z/30));
function OG_done(sp){const s=OG_sv();return sp.k==='ev'?(s.e[sp.id]||0):sp.k==='gold'?(s.g[sp.id]?3:0):(s.c[sp.id]?3:0)}
function OG_blocked(sp){if(OG_onPath(sp))return true;for(const m of RO.marks||[])if(Number.isFinite(m.x)&&(m.x-sp.x)**2+(m.z-sp.z)**2<40*40)return true;for(const g of HUB.gates||[])if((g.x-sp.x)**2+(g.z-sp.z)**2<50*50)return true;return false}
function OG_pickVis(){const x=RO.x,z=RO.z,kx=Math.floor(x/100),kz=Math.floor(z/100),L=[];OG_navCells();
  for(let a=-3;a<=3;a++)for(let c=-3;c<=3;c++){const Q=OG.grid.get((kx+a)*100000+kz+c);if(!Q)continue;for(const sp of Q){const t=OG_done(sp);if(t>=3)continue;const d=Math.hypot(sp.x-x,sp.z-z);if(d>OG_FADE[1])continue;if(OG_blocked(sp))continue;L.push([d+(t?60:0),sp,d])}}
  L.sort((p,q)=>p[0]-q[0]);OG.vis=L.slice(0,OG_N).map(q=>q[1]);for(const sp of OG.vis)if(sp.roof&&!sp.roofOn)OG_roofOn(sp);
  for(const r of OG.ramps){const v=Math.hypot(r.sp.x-x,r.sp.z-z)<400;for(const m of r.meshes)m.visible=v}}
function OG_draw(){if(!OG.imE)return;const on=!OG.ev&&state==='roam';const n={E:0,G:0,C:0},t=performance.now()/1000;
  if(on)for(const sp of OG.vis){const d=Math.hypot(sp.x-RO.x,sp.z-RO.z),f=clamp((OG_FADE[1]-d)/(OG_FADE[1]-OG_FADE[0]),0,1)*(OG_done(sp)?.45:1);if(f<=0)continue;let im,k;
    if(sp.k==='ev'){im=OG.imE;k='E';_oe.set(0,sp.dir?Math.atan2(sp.dir[0],sp.dir[1]):t*.6,0);_ov.set(sp.x,sp.y+5.6,sp.z);_os.setScalar(1);_oc.set(OG_T[sp.t].col)}
    else if(sp.k==='gold'){im=OG.imG;k='G';_oe.set(0,t*1.6,0);_ov.set(sp.x,sp.y+Math.sin(t*2+sp.x)*.3,sp.z);_os.setScalar(1);_oc.setRGB(1,1,1)}
    else{im=OG.imC;k='C';_oe.set(0,t*1.2,0);_ov.set(sp.x,sp.y-1+Math.sin(t*2+sp.z)*.25,sp.z);_os.setScalar(1.3);_oc.set(OG.A[sp.t]?OG.A[sp.t].th[2]:0xffffff)}
    const i=n[k]++;_oq.setFromEuler(_oe);_om.compose(_ov,_oq,_os);im.setMatrixAt(i,_om);im.setColorAt(i,_oc);im.geometry.attributes.aF.array[i]=f}
  for(const[im,k]of[[OG.imE,'E'],[OG.imG,'G'],[OG.imC,'C']]){im.count=n[k];im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.geometry.attributes.aF.needsUpdate=true}}
// ---------- area completion
function OG_stats(a){const s=OG_sv(),o={ev:[0,0],g:[0,0],c:[0,0],st:[0,0]};for(const sp of OG.S){if(sp.a!==a)continue;const q=sp.k==='ev'?o.ev:sp.k==='gold'?o.g:o.c;q[1]++;if(OG_done(sp))q[0]++}
  for(const g of RO.gbs||[]){if(OG_areaAt(g.x,g.z)!==a)continue;o.g[1]++;if(g.m&&!g.m.visible)o.g[0]++}
  for(const m of RO.marks||[]){if(!m.ev||m.dyn||!['rival','boss','quest','otg','challenge','sprint','mode'].includes(m.kind)||!Number.isFinite(m.x)||OG_areaAt(m.x,m.z)!==a)continue;o.st[1]++;try{if(markDone(m))o.st[0]++}catch(e){}}
  const D=o.ev[0]+o.g[0]+o.c[0]+o.st[0],T=o.ev[1]+o.g[1]+o.c[1]+o.st[1];o.pct=T?Math.floor(100*D/T):100;o.D=D;o.T=T;return o}
function OG_areas(){const L=[...new Set(OG.S.map(s=>s.a))];return L.sort()}
function OG_sum(){const s=OG_sv();for(const a of OG_areas())s.sum[a]=OG_stats(a).pct;if(CID!=='fra'){let D=0,T=0;for(const a of OG_areas()){const o=OG_stats(a);D+=o.D;T+=o.T}s.sum['§'+ATHD]=T?Math.floor(100*D/T):0}OG_save()}
function OG_reward(a){const s=OG_sv();if(s.rw[a])return;const o=OG_stats(a);if(o.pct<100)return;s.rw[a]=1;let gift='';try{const own=gbOwn(),q=GB_PATS.find(p=>!own.includes('pat_'+p[0])&&p[2]);if(q){own.push('pat_'+q[0]);store.set('mho_gbown',own);gift=q[1]+' livery'}}catch(e){}
  const S2=season();S2.cr+=5000;saveSeason(S2);OG_save();say('🏆 '+a.toUpperCase()+' 100%',(gift?'Reward: '+gift+' · ':'')+'+5.000 studs',3);OG_snd('finish');OG.log.reward=(OG.log.reward||0)+1}
function OG_pop(a,first){const o=OG_stats(a),el=OG_el('ogArea');const th=OG.A[a]&&OG.A[a].th;el.innerHTML=`<b>📍 ${a.toUpperCase()}</b><div class="ogBar"><i style="width:${o.pct}%"></i></div><em>${o.pct}% COMPLETE</em><span>⚡ ${o.ev[0]}/${o.ev[1]} events · 🧱 ${o.g[0]}/${o.g[1]} golden · ${th?th[1]:'🏺'} ${o.c[0]}/${o.c[1]} · 📖 ${o.st[0]}/${o.st[1]}</span>`;
  el.hidden=false;el.classList.remove('on');void el.offsetWidth;el.classList.add('on');OG.popT=first?2.5:4;OG.lastPop=a}
// ---------- DOM
function OG_el(id){let e=document.getElementById(id);if(e)return e;e=document.createElement('div');e.id=id;e.hidden=true;(document.getElementById('roamHud')||document.body).appendChild(e);return e}
function OG_css(){if(document.getElementById('ogCss'))return;const st=document.createElement('style');st.id='ogCss';st.textContent=`
#ogHud{position:fixed;left:50%;top:calc(142px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:40;background:rgba(12,14,30,.84);border:2px solid #ffd12c;border-radius:14px;color:#fff;font:700 13px system-ui,sans-serif;padding:7px 12px;text-align:center;min-width:220px;max-width:92vw;pointer-events:auto}
#ogHud b{display:block;font:italic 900 15px system-ui,sans-serif;letter-spacing:.08em}#ogHud .ogT{display:flex;gap:8px;justify-content:center;font-size:12px;color:#cfe6f5;margin-top:2px}#ogHud .ogT i{font-style:normal;opacity:.45}#ogHud .ogT i.on{opacity:1}
#ogHud .ogP{font-size:20px;font-weight:900;color:#ffd12c}#ogHud button,#ogRes button{margin-left:8px;background:#ffd12c;color:#111;border:0;border-radius:9px;font:900 12px system-ui;padding:5px 9px;cursor:pointer}
#ogRes{position:fixed;left:50%;top:32%;transform:translate(-50%,-50%);z-index:41;background:radial-gradient(circle,#2a2f5a,#121428);border:3px solid #ffd12c;border-radius:18px;color:#fff;font:800 14px system-ui;padding:14px 22px;text-align:center;pointer-events:auto}
#ogRes .md{font-size:52px;line-height:1}#ogRes.on{animation:ogPop .45s cubic-bezier(.2,1.6,.4,1)}@keyframes ogPop{0%{transform:translate(-50%,-50%) scale(.3)}100%{transform:translate(-50%,-50%) scale(1)}}
#ogArea{position:fixed;left:50%;top:calc(142px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:39;background:rgba(12,14,30,.86);border-left:5px solid #5dffb0;border-radius:12px;color:#fff;font:700 12px system-ui;padding:8px 14px;text-align:center;pointer-events:none;max-width:92vw}
#ogArea b{font:italic 900 16px system-ui;letter-spacing:.1em}#ogArea em{display:block;font-style:normal;color:#5dffb0;font-weight:900}#ogArea.on{animation:ogIn .4s ease-out}@keyframes ogIn{0%{opacity:0;transform:translate(-50%,-14px)}100%{opacity:1}}
.ogBar{height:7px;background:#333a;border-radius:4px;margin:4px 0;overflow:hidden}.ogBar i{display:block;height:100%;background:linear-gradient(90deg,#5dffb0,#ffd12c)}
#ogMapP{position:absolute;right:10px;top:calc(56px + env(safe-area-inset-top,0px));z-index:5;background:rgba(12,14,30,.86);color:#fff;border-radius:12px;padding:8px 10px;font:700 12px system-ui;max-width:min(260px,44vw);max-height:46vh;overflow:auto}
#ogMapP>b.h{display:block;cursor:pointer}#ogMapP>b.h i{font-style:normal;color:#ffd12c}
@media (max-aspect-ratio:1/1){#ogMapP{max-height:40vh;padding:6px 10px}#ogMapP>b.h::after{content:' ▾'}#ogMapP.open>b.h::after{content:' ▴'}#ogMapP:not(.open)>:not(.h){display:none}}
#ogMapP .r{display:flex;justify-content:space-between;gap:8px}#ogMapP .r.cur{color:#ffd12c}#ogMapP button{width:100%;margin-top:6px;background:#ffd12c;border:0;border-radius:8px;font:900 12px system-ui;padding:6px;cursor:pointer}
#ogCol{position:fixed;inset:0;z-index:60;background:rgba(8,10,22,.94);color:#fff;font:700 13px system-ui;overflow:auto;padding:calc(16px + env(safe-area-inset-top,0px)) 16px 16px}
#ogCol h2{margin:0 0 10px;font:italic 900 20px system-ui;letter-spacing:.08em}#ogCol .set{background:#1b1f3a;border-radius:12px;padding:8px 12px;margin:0 0 8px}#ogCol .it{display:inline-block;margin:4px 6px 0 0;padding:3px 7px;border-radius:8px;background:#2a3058;font-size:12px}#ogCol .it.no{opacity:.35}
#ogCol .x{position:sticky;top:0;float:right;background:#ffd12c;border:0;border-radius:9px;font:900 14px system-ui;padding:6px 12px;cursor:pointer}
@media (max-height:500px){#ogHud,#ogArea{top:calc(96px + env(safe-area-inset-top,0px));font-size:11px;padding:5px 10px}#ogHud .ogP{font-size:15px}#ogRes{top:40%;padding:8px 14px}#ogRes .md{font-size:34px}}
body.og-map #ogHud,body.og-map #ogArea{display:none}body:has(#ogHud:not([hidden])) #m1Next,body:has(#ogHud:not([hidden])) #roamPlate,body:has(#ogRes:not([hidden])) #m1Next,body:has(#ogRes:not([hidden])) #roamPlate{visibility:hidden}@media (orientation:portrait){#ogHud,#ogRes{left:auto;right:calc(10px + env(safe-area-inset-right,0px));transform:none;min-width:0;max-width:calc(100vw - 140px)}}`;document.head.appendChild(st)}
function OG_hud(){const e=OG.ev,el=OG_el('ogHud');if(!e){el.hidden=true;return}const T=OG_T[e.kind],g=e.goal,u=e.u,lab=[`🥉 ${g[0]}${u}`,`🥈 ${g[1]}${u}`,`🥇 ${g[2]}${u}`],cur=OG_tier(e,OG_val(e,1));
  const html=`<b>${T.ic} ${T.n.toUpperCase()}</b><span class="ogP">${OG_prog(e)}</span> · ${Math.max(0,e.lim-e.tm).toFixed(1)} s<button id="ogRetryB">↻ RETRY (Y)</button><div class="ogT">${lab.map((l,i)=>`<i class="${cur>i?'on':''}">${l}</i>`).join('')}</div>`;
  if(el._h!==html){el._h=html;el.innerHTML=html;const b=el.querySelector('#ogRetryB');b.onclick=()=>OG_retry();b.addEventListener('touchstart',ev=>{ev.preventDefault();ev.stopPropagation();OG_retry()},{passive:false})}el.hidden=false}
function OG_prog(e){const k=e.kind;return k==='gate'?`${e.n}/${e.objs.length} gates`:k==='ring'?`${e.n}/${e.objs.length} rings`:k==='rush'?`${e.n} studs`:k==='smash'?`${e.n} smashed`:k==='drift'?`${Math.round(e.n)} pts`:k==='ghost'?`${Math.round(e.d)} m · ghost ${Math.round(e.gd)} m`:k==='stunt'?(e.land!=null?`${e.land.toFixed(1)} m off`:'hit the ramp'):e.land!=null?`${Math.round(e.land)} m`:'hit the ramp'}
// ---------- events
const OG_mat={};const OG_m=(c,e=1.6)=>OG_mat[c+e]||(OG_mat[c+e]=neonMat(c,e));
function OG_obj(e,m,x,y,z){m.position.set(x,y,z);RO.grp.add(m);e.meshes.push(m);return m}
function OG_start(sp,re){if(OG.ev)return;const G=qvGraph();let i=sp.i??qvNear(sp.x,sp.z,40);if(i<0)return;let dx=Math.sin(RO.h),dz=Math.cos(RO.h);if(re){dx=re.dx;dz=re.dz}
  const t=sp.t,L={gate:560,ring:600,rush:520,smash:420,ghost:650,drift:0,stunt:150,ljump:160}[t];let W=OG_walk(i,dx,dz,L);if(L&&W.len<L*.6){const W2=OG_walk(i,-dx,-dz,L);if(W2.len>W.len){W=W2;dx=-dx;dz=-dz}}
  const e={sp,kind:t,W,t0:performance.now(),tm:0,n:0,lim:30,objs:[],meshes:[],ramps:[],start:{x:RO.x,z:RO.z,h:RO.h,y:RO.y,dx,dz},hi:1,u:'',done:0};OG.ev=e;OG.log.start++;
  const len=W.len||200,tm=(v)=>+(len/v).toFixed(1);const y=(x,z)=>groundY(x,z);
  if(t==='gate'){const n=5;for(let k=1;k<=n;k++){const q=OG_at(W,len*k/(n+.3)),g=new THREE.Group();const w=11;for(const sd of[-1,1]){const p=new THREE.Mesh(OG.gP||(OG.gP=new THREE.BoxGeometry(1,5,1)),OG_m('#ff5a2d',1.2));p.position.set(sd*w/2,2.5,0);g.add(p)}for(let c=0;c<5;c++){const l=new THREE.Mesh(OG.gL||(OG.gL=new THREE.BoxGeometry(2,.45,.45)),OG_m('#ffd12c',1.4));l.position.set(-w/2+1.1+c*2.2,2.6+(c%2)*.4,0);g.add(l)}g.rotation.y=q.h;OG_obj(e,g,q.x,y(q.x,q.z),q.z);e.objs.push({x:q.x,z:q.z,m:g})}
    e.goal=[tm(13),tm(19),tm(25)];e.lim=Math.min(60,Math.max(20,tm(9)));e.hi=0;e.u=' s'}
  else if(t==='ring'){const n=6;for(let k=1;k<=n;k++){const q=OG_at(W,len*k/(n+.3)),r=new THREE.Mesh(OG.rG||(OG.rG=new THREE.TorusGeometry(5.2,.5,8,28)),OG_m('#2f9bff',2.6));r.rotation.y=q.h;OG_obj(e,r,q.x,y(q.x,q.z)+5.4,q.z);e.objs.push({x:q.x,z:q.z,m:r})}
    e.goal=[tm(13),tm(19),tm(25)];e.lim=Math.min(60,Math.max(20,tm(9)));e.hi=0;e.u=' s'}
  else if(t==='rush'){const n=26,im=new THREE.InstancedMesh(OG.sG||(OG.sG=new THREE.CylinderGeometry(.75,.75,.3,12).rotateX(Math.PI/2)),OG_m('#ffd12c',1.8),n);for(let k=0;k<n;k++){const q=OG_at(W,len*(k+1)/(n+1)),o=(k%3-1)*2.2,x=q.x+q.hz*o,z=q.z-q.hx*o;_om.makeTranslation(x,y(x,z)+1.3,z);im.setMatrixAt(k,_om);e.objs.push({x,z,k})}OG_obj(e,im,0,0,0);e.im=im;
    e.goal=[9,14,22];e.lim=Math.min(60,Math.max(12,Math.round(len/17)));e.u=''}
  else if(t==='smash'){const n=14,im=new THREE.InstancedMesh(OG.cG||(OG.cG=new THREE.BoxGeometry(2.2,2.2,2.2)),new THREE.MeshStandardMaterial({color:0xc8862a,roughness:.7}),n);for(let k=0;k<n;k++){const q=OG_at(W,len*(k+1)/(n+1)),o=(k%2?1:-1)*1.6,x=q.x+q.hz*o,z=q.z-q.hx*o;_om.makeTranslation(x,y(x,z)+1.1,z);im.setMatrixAt(k,_om);e.objs.push({x,z,k})}OG_obj(e,im,0,0,0);e.im=im;
    e.goal=[6,10,13];e.lim=Math.min(60,Math.max(20,Math.round(len/21)));e.u=''}
  else if(t==='ghost'){const g=new THREE.Group();const gm=new THREE.MeshBasicMaterial({color:0x9fe8ff,transparent:true,opacity:.45,depthWrite:false});box(g,gm,2.4,1.2,4.4,0,1,0);box(g,gm,2,1,2.2,0,2,-.3);OG_obj(e,g,W.P[0][0],y(W.P[0][0],W.P[0][1]),W.P[0][1]);e.gh=g;
    const f=OG_at(W,len),fl=new THREE.Mesh(OG.fG||(OG.fG=new THREE.TorusGeometry(6,.5,8,28)),OG_m('#ffffff',2.4));fl.rotation.y=f.h;OG_obj(e,fl,f.x,y(f.x,f.z)+6,f.z);e.d=0;e.gd=0;e.gv=len/(len/21);e.fin=f;
    e.goal=[tm(15),tm(21),tm(26)];e.lim=Math.min(60,Math.max(20,tm(10)));e.hi=0;e.u=' s'}
  else if(t==='drift'){const r=new THREE.Mesh(OG.dG||(OG.dG=new THREE.TorusGeometry(70,.6,6,64).rotateX(Math.PI/2)),OG_m('#c46bff',2));OG_obj(e,r,sp.x,y(sp.x,sp.z)+.4,sp.z);e.goal=[180,450,1100];e.lim=30;e.u=' pts'}
  else if(t==='stunt'||t==='ljump'){const q=OG_at(W,32),big=t==='ljump',len2=big?12:10,hg=big?5:3.2,n0=RO.grp.children.length,r0=RO.ramps.length;addRamp(q.x,q.z,q.h,len2,hg,8,big?0x5dffb0:0xff2d95);e.rampMeshes=RO.grp.children.slice(n0);e.rampR=RO.ramps.slice(r0);e.rampR.forEach(r=>r.og=1);e.ramp=e.rampR[0];
    e.rx=q.x+q.hx*len2/2;e.rz=q.z+q.hz*len2/2;e.rh=q.h;
    if(t==='stunt'){const v=28,rv=v*hg/len2,vy=rv*1.15+3,ft=(vy+Math.sqrt(vy*vy+60*hg))/30,d=v*ft,tx=e.rx+q.hx*d,tz=e.rz+q.hz*d;e.tx=tx;e.tz=tz;for(const[r,c]of[[18,'#ff2d95'],[10,'#ffffff'],[5,'#ffd12c']]){const m=new THREE.Mesh(new THREE.RingGeometry(r-1.2,r,40).rotateX(-Math.PI/2),OG_m(c,1.6));OG_obj(e,m,tx,y(tx,tz)+.15+r*.002,tz)}
      e.goal=[18,10,5];e.lim=25;e.hi=0;e.u=' m'}
    else{e.goal=[30,42,54];e.lim=25;e.u=' m'}}
  OG_snd('go');say(OG_T[t].ic+' '+OG_T[t].n.toUpperCase(),OG_T[t].d,1.4);OG.cool=0;OG_draw();OG_hud()}
function OG_val(e,live){const k=e.kind;if(k==='gate'||k==='ring'||k==='ghost')return e.fin_t??(live?null:null);if(k==='stunt'||k==='ljump')return e.land??null;return e.n}
function OG_tier(e,v){if(v==null)return 0;const g=e.goal;if(e.hi)return v>=g[2]?3:v>=g[1]?2:v>=g[0]?1:0;return v<=g[2]?3:v<=g[1]?2:v<=g[0]?1:0}
function OG_step(dt){const e=OG.ev;e.tm+=dt;const x=RO.x,z=RO.z;const sp=Math.abs(RO.v);
  if(e.tm>e.lim){if((e.kind==='stunt'||e.kind==='ljump')&&RO.takeoff&&e.tm<e.lim+4)return;return OG_end(e.kind==='drift'||e.kind==='rush'||e.kind==='smash'?e.n:null)}
  if(e.kind==='gate'){const o=e.objs.find(o=>!o.done);if(o&&Math.hypot(o.x-x,o.z-z)<7.5){o.done=1;o.m.visible=false;e.n++;OG_boom(o.x,o.z,'#ff5a2d');OG_snd('crash');hitPop('⛓ GATE '+e.n+'/'+e.objs.length);if(e.n===e.objs.length){e.fin_t=e.tm;return OG_end(e.tm)}}}
  else if(e.kind==='ring'){const o=e.objs.find(o=>!o.done);if(o&&Math.hypot(o.x-x,o.z-z)<6.8){o.done=1;o.m.visible=false;e.n++;RO.v=Math.sign(RO.v||1)*Math.min(Math.abs(RO.v)+4,48);if(pl)pl.bm=Math.min(100,pl.bm+8);OG_snd('pick');hitPop('💫 RING '+e.n+'/'+e.objs.length);if(e.n===e.objs.length){e.fin_t=e.tm;return OG_end(e.tm)}}}
  else if(e.kind==='rush'||e.kind==='smash'){for(const o of e.objs){if(o.done)continue;if(Math.hypot(o.x-x,o.z-z)<(e.kind==='rush'?3.6:3.4)&&(e.kind==='rush'||sp>5)){o.done=1;e.n++;_om.makeScale(0,0,0);e.im.setMatrixAt(o.k,_om);e.im.instanceMatrix.needsUpdate=true;if(e.kind==='rush'){OG_snd('pick')}else{OG_boom(o.x,o.z,'#c8862a');OG_snd('crash');RO.v*=.93}}}
    if(e.n===e.objs.length)return OG_end(e.n)}
  else if(e.kind==='ghost'){e.gd=Math.min(e.W.len,e.gd+dt*e.gv);const q=OG_at(e.W,e.gd);e.gh.position.set(q.x,groundY(q.x,q.z),q.z);e.gh.rotation.y=q.h;let bd=1e9,bs=0;const P=e.W.P;for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i],ex=b[0]-a[0],ez=b[1]-a[1],l2=ex*ex+ez*ez||1,u=clamp(((x-a[0])*ex+(z-a[1])*ez)/l2,0,1),d=Math.hypot(a[0]+ex*u-x,a[1]+ez*u-z);if(d<bd){bd=d;bs=e.W.C[i-1]+u*Math.sqrt(l2)}}e.d=Math.max(e.d,bd<25?bs:e.d);
    if(Math.hypot(e.fin.x-x,e.fin.z-z)<8&&e.d>e.W.len*.8){e.fin_t=e.tm;return OG_end(e.tm)}}
  else if(e.kind==='ljump'){const T=RO.takeoff;if(e.off==null)e.off=RO.y-groundY(x,z);if(T&&!T.og)T.og=RO.y>groundY(T.x,T.z)+e.off+1;if(T&&T.og&&T.r===e.ramp&&e.cross==null&&RO.y<=groundY(T.x,T.z)+(e.off??0)+.5)e.cross=Math.hypot(x-T.x,z-T.z)}  // back down at road height: flying off onto lower ground doesn't add distance
else if(e.kind==='drift'){if(RO.dDir&&Math.hypot(e.sp.x-x,e.sp.z-z)<75){const tr=RO.dT>2?3:RO.dT>1.1?2:RO.dT>.5?1:0;e.n+=dt*sp*1.2*(1+.5*tr)}}
  OG_hud()}
function OG_landed(t){const e=OG.ev;if(!e||!t||(e.kind!=='stunt'&&e.kind!=='ljump')||t.r!==e.ramp)return;if(e.kind==='stunt'){e.land=Math.hypot(RO.x-e.tx,RO.z-e.tz);if(e.land>40)e.land=null}else e.land=Math.min(Math.hypot(RO.x-t.x,RO.z-t.z),e.cross??1e9);OG_end(e.land)}
function OG_boom(x,z,c){try{const p=V3(x,groundY(x,z)+1.5,z);burst(SPARK,p,22,16,.5,new THREE.Color(c));debris(p,V3(Math.sin(RO.h)*12,6,Math.cos(RO.h)*12),6,[new THREE.Color(c),new THREE.Color('#ffd12c')],.8)}catch(err){}}
function OG_end(v,silent){const e=OG.ev;if(!e)return;OG.ev=null;for(const m of e.meshes)m.parent&&m.parent.remove(m);for(const m of e.rampMeshes||[])m.parent&&m.parent.remove(m);for(const r of e.rampR||[]){const i=RO.ramps.indexOf(r);if(i>=0)RO.ramps.splice(i,1)}
  OG_el('ogHud').hidden=true;OG.cool=2.5;if(silent)return;const md=OG_tier(e,v),s=OG_sv(),prev=s.e[e.sp.id]||0;OG.log.fin++;OG.log.tier[md]++;
  let pay=0;if(md>prev){for(let q=prev+1;q<=md;q++)pay+=OG_PAY[q];s.e[e.sp.id]=md;OG_save()}else if(md)pay=Math.round(OG_PAY[md]*.15);if(pay){const S2=season();S2.cr+=pay;saveSeason(S2)}
  OG.last={sp:e.sp,start:e.start,t:performance.now(),md,v,pay};OG.lastRes=OG.last;OG_res(e,md,v,pay,md>prev);if(md){OG_snd('finish');try{for(let q=0;q<md*3;q++)studBurst(V3(RO.x,RO.y+1.5,RO.z),V3(Math.sin(RO.h),0,Math.cos(RO.h)),10);burst(SPARK,V3(RO.x,RO.y+3,RO.z),40,22,.8,new THREE.Color(['#cd7f32','#cd7f32','#d8dde4','#ffd12c'][md]));fovKick=Math.max(fovKick,6)}catch(err){}}else OG_snd('crash');
  if(md>prev){OG_sum();OG_reward(e.sp.a)}}
function OG_res(e,md,v,pay,fresh){const el=OG_el('ogRes'),T=OG_T[e.kind],nm=['NO MEDAL','BRONZE','SILVER','GOLD'][md],val=v==null?'TIME UP':(e.u===' s'?v.toFixed(1)+' s':Math.round(v)+e.u);
  el.innerHTML=`<div class="md">${['💨','🥉','🥈','🥇'][md]}</div><b>${T.n.toUpperCase()} · ${nm}!</b><div>${val}</div><small>${pay?'+'+pay.toLocaleString('de-DE')+' studs':'no studs this time'}${fresh&&md?' · NEW BEST':''}</small><div><button id="ogRetryR">↻ RETRY (Y)</button></div>`;
  const b=el.querySelector('#ogRetryR');b.onclick=()=>OG_retry();b.addEventListener('touchstart',ev=>{ev.preventDefault();ev.stopPropagation();OG_retry()},{passive:false});
  el.hidden=false;el.classList.remove('on');void el.offsetWidth;el.classList.add('on');clearTimeout(OG_res.t);OG_res.t=setTimeout(()=>el.hidden=true,4500)}
function OG_retry(){const L=OG.ev?{sp:OG.ev.sp,start:OG.ev.start}:OG.last;if(!L||state!=='roam')return false;if(OG.ev)OG_end(null,1);else if(performance.now()-L.t>12000)return false;OG.log.retry++;
  const s=L.start;RO.x=s.x;RO.z=s.z;RO.h=RO.vh=s.h;RO.y=groundAt(s.x,s.z,s.y+2);RO.v=8;RO.vy=0;RO.dDir=0;RO.takeoff=null;RO.lastRamp=null;camSnap=true;OG_el('ogRes').hidden=true;OG_start(L.sp,{dx:s.dx,dz:s.dz});return true}
// ---------- pickups
function OG_pick(sp){const s=OG_sv();if(sp.k==='gold'){s.g[sp.id]=1;OG.log.gold++;const S2=season();S2.cr+=500;saveSeason(S2);OG_snd('brick');say('🧱 GOLDEN BRICK',{ramp:'Found behind the ramp',hill:'Found on the hill top',roof:'Found on the rooftop'}[sp.t]+' · +500 studs',1.6)}
  else{s.c[sp.id]=1;OG.log.col++;const th=OG.A[sp.t].th,got=OG.S.filter(q=>q.k==='col'&&q.t===sp.t&&s.c[q.id]).length,tot=OG.A[sp.t].n;const S2=season();S2.cr+=300;saveSeason(S2);OG_snd('pick');say(th[1]+' '+th[3][sp.ci%5].toUpperCase(),`${th[0]} · ${sp.t} ${got}/${tot}${got===tot?' · SET COMPLETE!':''}`,1.8)}
  try{burst(SPARK,V3(sp.x,sp.y,sp.z),26,14,.6,new THREE.Color('#ffd12c'));studBurst(V3(sp.x,sp.y,sp.z),V3(0,1,0),8)}catch(e){}OG_save();OG_sum();OG_reward(sp.a)}
// mission marks can appear after placement (story steps, encounters): drop spots that now sit on one
function OG_prune(){const sig=(RO.marks||[]).length+':'+(HUB.gates||[]).length;if(sig===OG.mkSig)return;OG.mkSig=sig;const ex=OG_excl(),keep=OG.S.filter(sp=>!OG_near(ex,sp.x,sp.z));if(keep.length===OG.S.length)return;OG.S=keep;const g=new Map();for(const sp of keep){const k=OG_gk(sp.x,sp.z);(g.get(k)||g.set(k,[]).get(k)).push(sp)}OG.grid=g;OG.vis=OG.vis.filter(sp=>keep.includes(sp))}
// ---------- per-frame
function OG_tick(dt){if(state!=='roam'||!RO.on||!RO.built)return;if(!OG.grp||OG.key!==OG_key()){if(!QV.g&&(OG.f++%30))return;if(!OG_build())return}
  OG.cool=Math.max(0,OG.cool-dt);if(OG.ev){if(RO.ch||RO.sp)OG_end(null,1);else if(!RO.wk)OG_step(dt)}  // a wreck (2 s rebuild) pauses the event instead of silently cancelling it
  if(OG.f%120===0)OG_prune();if(++OG.f%8===0)OG_pickVis();
  const busy=RO.ch||RO.sp||RO.wk||RO.card||RO.mapOpen||RO.story||RO.frozen||(window.__m1&&__m1.cs&&__m1.cs());
  if(!OG.ev&&!busy&&OG.cool<=0)for(const sp of OG.vis){const d2=(sp.x-RO.x)**2+(sp.z-RO.z)**2;if(sp.k==='ev'){if(d2<7.2*7.2&&Math.abs(RO.y-sp.y)<6&&Math.abs(RO.v)>3&&!OG_blocked(sp)){OG_start(sp);break}}
    else if(!OG_done(sp)&&d2<4.6*4.6&&Math.abs(RO.y+.8-sp.y)<4.2){OG_pick(sp);OG_pickVis();break}}
  OG_draw();document.body.classList.toggle('og-map',!!RO.mapOpen);
  if(OG.f%30===0){const a=OG_areaAt(RO.x,RO.z);if(a!==OG.area){const first=OG.area==null;OG.area=a;if(!first||OG.f>60)OG_pop(a,first)}}
  if(OG.popT>0){OG.popT-=dt;if(OG.popT<=0)OG_el('ogArea').hidden=true}}
// ---------- map overlay + panel, collection screen
function OG_map(){const cvs=$('#roamMapC');if(!cvs||!RO.mapP||!OG.S.length)return;const g=cvs.getContext('2d'),P=RO.mapP,sc=RO.mapSc||1,W=cvs.width,H=cvs.height,s=OG_sv(),dpr=DPR2();
  const r=Math.max(2.6,Math.min(6,sc*6))*dpr;for(const sp of OG.S){const[px,py]=P(sp.x,sp.z);if(px<-8||py<-8||px>W+8||py>H+8)continue;const d=OG_done(sp);if(d>=3&&sp.k!=='ev')continue;
    g.globalAlpha=d?.45:1;if(sp.k==='ev'){g.fillStyle=OG_T[sp.t].col;g.beginPath();g.arc(px,py,r,0,7);g.fill();if(d>=1){g.strokeStyle='#fff';g.lineWidth=1;g.stroke()}}
    else if(sp.k==='gold'){g.fillStyle='#ffc21a';g.fillRect(px-r,py-r*.6,r*2,r*1.2)}else{g.fillStyle='#fff';g.beginPath();g.moveTo(px,py-r*1.3);g.lineTo(px+r,py+r);g.lineTo(px-r,py+r);g.fill()}}
  g.globalAlpha=1;const C={};for(const sp of OG.S){const c=C[sp.a]||(C[sp.a]={x:0,z:0,n:0});c.x+=sp.x;c.z+=sp.z;c.n++}g.font=`900 ${Math.round(12*dpr)}px system-ui`;g.textAlign='center';
  for(const a in C){const c=C[a];if(c.n<8)continue;const[px,py]=P(c.x/c.n,c.z/c.n);if(px<0||py<0||px>W||py>H)continue;const t=`${a} ${s.sum[a]??OG_stats(a).pct}%`;g.lineWidth=4*dpr;g.strokeStyle='rgba(10,12,30,.85)';g.strokeText(t,px,py);g.fillStyle=s.rw[a]?'#ffd12c':'#5dffb0';g.fillText(t,px,py)}
  OG_mapPanel()}
function OG_mapPanel(){const host=$('#roamMap');if(!host)return;let el=document.getElementById('ogMapP');if(!el){el=document.createElement('div');el.id='ogMapP';host.appendChild(el)}const s=OG_sv(),cur=OG_areaAt(RO.x,RO.z);
  const rows=OG_areas().map(a=>`<div class="r${a===cur?' cur':''}"><span>${a}</span><span>${s.sum[a]??0}%${s.rw[a]?' 🏆':''}</span></div>`).join('');
  const dist=CID!=='fra'?Object.keys(ATH_DIST).map(d=>`<div class="r${d===ATHD?' cur':''}"><span>${d} · ${ATH_DIST[d].name}</span><span>${s.sum['§'+d]!=null?s.sum['§'+d]+'%':'—'}</span></div>`).join('')+'<hr>':'';
  const html=`<b class="h">AREA COMPLETION <i>${cur?(s.sum[cur]??0)+'%':''}</i></b>${dist}${rows}<button id="ogColB">🏺 COLLECTION (U)</button>`;if(el._h!==html){el._h=html;el.innerHTML=html;el.querySelector('#ogColB').onclick=e=>{e.stopPropagation();OG_col(true)};el.querySelector('b.h').onclick=e=>{e.stopPropagation();el.classList.toggle('open')}}}
function OG_col(on){const el=OG_el('ogCol');if(!on){el.hidden=true;return}const s=OG_sv();let h=`<button class="x" id="ogColX">✕ CLOSE</button><h2>🏺 UNIQUE COLLECTIBLES · ${OG_distName().toUpperCase()}</h2>`;
  for(const a of Object.keys(OG.A).sort()){const A=OG.A[a];if(!A.n)continue;const L=OG.S.filter(q=>q.k==='col'&&q.t===a).sort((p,q)=>p.ci-q.ci),got=L.filter(q=>s.c[q.id]).length,o=OG_stats(a);
    h+=`<div class="set"><b>${A.th[1]} ${a} · ${A.th[0]}</b> <span>${got}/${L.length}${got===L.length?' ✔ SET COMPLETE':''}</span><div class="ogBar"><i style="width:${o.pct}%"></i></div><small>${o.pct}% area · 🧱 ${o.g[0]}/${o.g[1]} golden · ⚡ ${o.ev[0]}/${o.ev[1]} events${s.rw[a]?' · 🏆 reward claimed':''}</small><div>${L.map(q=>`<span class="it${s.c[q.id]?'':' no'}">${s.c[q.id]?A.th[1]+' '+A.th[3][q.ci%5]:'❔ ???'}</span>`).join('')}</div></div>`}
  el.innerHTML=h;el.querySelector('#ogColX').onclick=()=>OG_col(false);el.hidden=false}
// ---------- hooks (re-binding; non-OG callers fall straight through)
roamStep=(f=>function(dt){f(dt);try{OG_tick(dt)}catch(e){if(OG.err++<3)console.warn('OG',e)}})(roamStep);
roamLanded=(f=>function(){const t=RO.takeoff;f.apply(this,arguments);try{OG_landed(t)}catch(e){}})(roamLanded);
drawRoamMap=(f=>function(){f.apply(this,arguments);try{OG_map()}catch(e){if(OG.err++<3)console.warn('OG map',e)}})(drawRoamMap);
addEventListener('keydown',e=>{if(state!=='roam'||e.repeat)return;if(e.code==='KeyY'){if(OG_retry())e.preventDefault()}else if(e.code==='KeyU'){const el=document.getElementById('ogCol');OG_col(!el||el.hidden)}else if(e.code==='Escape'){const el=document.getElementById('ogCol');if(el&&!el.hidden){OG_col(false);e.stopImmediatePropagation()}}});
OG_css();
window.__og={OG,T:OG_T,build:()=>OG_build(),sv:()=>OG_sv(),stats:a=>OG_stats(a),areas:()=>OG_areas(),areaAt:(x,z)=>OG_areaAt(x,z),start:id=>{const sp=OG.S.find(q=>q.id===id);if(sp)OG_start(sp);return !!OG.ev},retry:()=>OG_retry(),
  end:()=>OG_end(null,1),ev:()=>OG.ev&&{t:OG.ev.kind,n:OG.ev.n,time:OG.ev.tm,lim:OG.ev.lim,goal:OG.ev.goal,hi:OG.ev.hi,P:OG.ev.W.P,len:OG.ev.W.len,objs:OG.ev.objs.map(o=>[o.x,o.z,!!o.done]),ramp:OG.ev.ramp&&{x:OG.ev.ramp.x,z:OG.ev.ramp.z,h:OG.ev.ramp.h,len:OG.ev.ramp.len},tx:OG.ev.tx,tz:OG.ev.tz,d:OG.ev.d,gd:OG.ev.gd},
  appr:(id,back=55)=>{const sp=OG.S.find(q=>q.id===id);if(!sp)return null;const G=qvGraph(),i=sp.i??qvNear(sp.x,sp.z,40);let d=sp.dir;if(!d){const j=G.nb[G.off[i]],l=Math.hypot(G.X[j]-G.X[i],G.Z[j]-G.Z[i])||1;d=[(G.X[i]-G.X[j])/l,(G.Z[i]-G.Z[j])/l]}const W=OG_walk(i,-d[0],-d[1],back),F=OG_walk(i,d[0],d[1],60);return{P:W.P.slice().reverse().concat(F.P.slice(1)),d}},
  spots:()=>OG.S.map(s=>({id:s.id,k:s.k,t:s.t,x:s.x,z:s.z,y:s.y,a:s.a,done:OG_done(s),dir:s.dir})),vis:()=>OG.vis.map(s=>s.id),drawn:()=>OG.imE?OG.imE.count+OG.imG.count+OG.imC.count:0,samples:()=>OG.smp,
  excl:()=>OG_excl(),nav:()=>[...OG.navC].length,col:on=>OG_col(on),pop:a=>OG_pop(a||OG_areaAt(RO.x,RO.z)),tick:()=>{OG_prune();OG_pickVis()},blocked:id=>{const sp=OG.S.find(q=>q.id===id);return sp&&OG_blocked(sp)},roofOn:id=>{const sp=OG.S.find(q=>q.id===id);if(sp)OG_roofOn(sp);return sp&&sp.roof&&{...sp.roof,deck:undefined}}};

