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
roamCam=(f=>function(dt){if(RO.ch)shake=0;else shake=Math.min(shake,.45);if(RO.boosting&&!RO.ch)fovKick=Math.max(fovKick,6);const b=!!RO.boosting;if(b!==AU_M.boostC){AU_M.boostC=b;document.body.classList.toggle('auBoost',b)}return f.apply(this,arguments)})(roamCam);
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
