/* ---------- retention parts (RETENTION.md). Each item has a flag in RET; a flag set to false leaves the game exactly as it was. ---------- */
const RET=window.RET=window.RET||{};
if(RET.title===undefined)RET.title=!/[?&]title=0/.test(location.search);   // B25: title diet (PLAY / CONTINUE, 5 buttons, the rest in MENU); parts/title.js
if(RET.type===undefined)RET.type=!/[?&]type=0/.test(location.search);     // B26: text >= 14 px and touch targets >= 44 px on title, menu and map; parts/title.js
if(RET.oneMore===undefined)RET.oneMore=true;   // B5: run-end screens show Neon banked, the next unlock bar and a ONE MORE RUN button
RET.next=function(){   // the cheapest thing still to buy: {n, price, bank, pct, can}; null when everything is owned
  let best=null;const add=(n,p)=>{if(!(p>0))return;if(!best||p<best.price)best={n,price:p};};
  for(const id of WP_IDS){const cur=WP.pl[id]|0;if(cur>=WP_MAX)continue;add(WPD[id].n+' LV'+(cur+1),WP.price(id));}
  for(const s of SHIPS)if(s.id!=='std'&&!GA.own['ship_'+s.id])add(s.n,s.p||0);
  for(const c of CREW)if(!GA.own[c.id])add(c.n,c.p||0);
  for(const h of THEMES)if(h.id!=='neon'&&!GA.own['th_'+h.id])add(h.n,h.p||0);
  if(!best)return null;best.bank=GA.bank;best.pct=Math.min(100,Math.floor(100*GA.bank/best.price));best.can=GA.bank>=best.price;return best;};
{const st=document.createElement('style');st.textContent=`
.retBar{width:100%;max-width:min(92%,420px);margin:.5em auto;text-align:center;font-family:var(--mono);font-size:clamp(12px,min(3.4vw,2.4vh),17px);line-height:1.3;color:var(--dim)}
.retBar b{color:#fff}.retBar .rb{height:.9em;border-radius:99px;background:#ffffff1a;overflow:hidden;margin-top:.3em}
.retBar .rb i{display:block;height:100%;background:linear-gradient(90deg,#19e3ff,#ffb020)}.retBar.can .rb i{background:#ffb020}
`;document.head.appendChild(st);}
function retMake(id,host){let e=$(id);if(!e){e=document.createElement('div');e.id=id;e.className='retBar';host.insertBefore(e,host.querySelector('.row'));}return e;}
function retShow(){
  const on=RET.oneMore,add=($('oNeon')&&/nothing/.test($('oNeon').textContent))?0:(SH.lastBank|0),nx=on?RET.next():null,pay='Failed runs still pay: '+(add?'+'+add+' Neon banked':'nothing banked this time');
  for(const [id,host] of [['retO',$('over').querySelector('.in')],['retR',$('stres').querySelector('.in')]]){
    const e=retMake(id,host);e.hidden=!on;if(!on)continue;
    e.className='retBar'+(nx&&nx.can?' can':'');
    e.innerHTML=(id==='retO'?pay+'<br>':'')+(nx?(nx.can?'Ready in Garage: <b>'+nx.n+'</b> '+nx.price:'Next: <b>'+nx.n+'</b> '+nx.bank+'/'+nx.price)+'<div class="rb"><i style="width:'+nx.pct+'%"></i></div>':'Everything unlocked');}
  $('againBtn').textContent=on?'ONE MORE RUN':'FLY AGAIN';$('srRetry').textContent=on?'ONE MORE RUN':'RETRY';}
NR.on('runEnd',d=>{if(!d||d.quit)return;retShow();});

/* ===== B1 pay, B2 economy, B3 mercy ===== */
Object.assign(RET,{clearPay:true,econ:true,mercy:true},{wk:.36,tk:.12,nk:.045});   // wk: weapon price scale, tk: perk price scale, nk: Neon per kill (see RETENTION.md B2)
/* B1: a stage clear pays 40+12n Neon the first time, +25 per new star, 10% of the base on later clears */
RET.payClear=function(n,sum){const old=sSave.stars[n]||0,first=old<1,base=40+12*n,ns=Math.max(0,sum-old);
  const pay=first?base+25*ns:Math.round(base*.1)+25*ns;GA.bank+=pay;gsave();this.last={n,pay,first,ns};return pay;};
RET.resultRow=function(){const l=this.last;return l&&l.pay?`<div class="sr ok"><span class="sg">◆</span> +${l.pay} Neon${l.first?' · first clear':''}</div>`:'';};
/* B3: failed tries per stage (kept in this browser); 2 fails = +1 hull on the next try, 4 = the stage level also drops by 0.3. A clear resets it. */
RET.fails={};try{const o=JSON.parse(localStorage.getItem('mnr_retfail')||'{}');if(o&&typeof o==='object')for(const k in o)RET.fails[k]=Math.max(0,o[k]|0);}catch(e){}
RET.saveFails=()=>{try{localStorage.setItem('mnr_retfail',JSON.stringify(RET.fails));}catch(e){}};
RET.mercyHull=n=>(RET.fails[n]|0)>=2?1:0;
RET.mercyLvl=n=>(RET.fails[n]|0)>=4?.3:0;
NR.on('runEnd',d=>{if(!RET.mercy||!d||!d.story)return;const n=d.story;
  if(d.cleared)delete RET.fails[n];else RET.fails[n]=(RET.fails[n]|0)+1;RET.saveFails();});
NR.on('runStart',d=>{if(!RET.mercy||!d||!d.story||!RET.mercyHull(d.story))return;
  G.note={t:3,txt:'MERCY: +1 hull'+(RET.mercyLvl(d.story)?', a little easier':'')+' this try'};});
/* B2: what a full garage costs, summed from the live prices (econ-test.js prints it) */
RET.totalCost=function(){let t=0;
  for(const d of TP_DEF)for(let l=0;l<d.max;l++)t+=tpPrice(d,l);
  for(const id of WP_IDS){t+=WPD[id].p?(RET.econ?Math.max(5,Math.round(WPD[id].p*RET.wk)):WPD[id].p):0;for(let L=1;L<WP_MAX;L++)t+=WPX_PRICE(L);}
  for(const a of [SHIPS,CREW,THEMES])for(const x of a)t+=x.p||0;
  return t;};
RET.probe=()=>({w:WPX_PRICE(1),k:tpPrice(TP_BY.dmg,0)});

/* ===== B4 arcade cut ===== */
if(RET.arcade===undefined)RET.arcade=true;
/* ARCADE cut (RET.arcade): a main stage is cut to about 150 s of song (never more than 80 bars; a boss stage has about 45 s of build-up, the boss still comes in the last 32 bars).
   The cut is a whole number of bars. The player picks ARCADE or CLASSIC on the stage plate; the choice is saved. */
const ARC={secs:150,leadSecs:44,maxBars:80,on:load('mnr_arc',1)!==0,
  set(v){this.on=!!v;save('mnr_arc',v?1:0);},
  active(){return !!RET.arcade&&this.on;},
  bars(s,full){if(s.ch||!this.active())return full;const t=TR.by[s.song],m=SONGM[s.song],bpm=(t&&t.bpm)||(m&&m.bpm)||120;
    const spb=240/bpm,lead=s.goal.k==='boss'?Math.max(20,Math.floor(this.leadSecs/spb)):1e9;   // a boss stage: about 45 s of build-up, then the boss (its fight is the long part)
    return Math.max(Math.min(full,BOSS_BARS+20),Math.min(full,this.maxBars,Math.floor(this.secs/spb),lead+BOSS_BARS));},
  label(){return this.active()?'ARCADE · ~3 MIN':'CLASSIC · FULL SONG';}};
window.ARC=ARC;

/* ===== WALLS: difficulty cliffs removed (BALANCE.md "Walls"). Flag off = the old tables. Per-stage data lives here. ===== */
if(RET.walls===undefined)RET.walls=true;
RET.wallKill={all:.75,classic:.45};   // ARCADE: kill goals are x.75 (the bot needed ~100 s more than the cut song to reach them, so a kill stage ran long and ended in a death); CLASSIC (full song) is x.45; a stage number overrides

/* ===== B8 Heat ladder (RET.heat) =====
   Opens when the story is cleared (stage MAIN has a star). On any cleared main stage the plate offers HEAT 1-10 (one above your best on that stage).
   Each Heat step adds one small mutator (a fixed ladder built from the 6 endless mutators) and the stage level +0.12; the run's Neon pays +20% per Heat,
   and the first clear at a new Heat earns its medal (+30 Neon x Heat). Caps kept: bullets at most +12% (endless TURBO), elites at most 0.6, hull at least 2. */
if(RET.heat===undefined)RET.heat=true;
const HEAT={max:10,lvK:.12,nk:.2,medalK:30,pick:{},best:{},run:0,td:0,last:null,
  STEPS:[['turbo','TURBO','Faster shots'],['guard','ELITES','More elites'],['hail','HAIL','Rain from above'],['decay','DECAY','Tier slips sooner'],
    ['noheal','NO HEAL','No hull drops'],['hull','-1 HULL','One hull less'],['turbo2','TURBO+','Even faster shots'],['guard2','ELITES+','Even more elites'],['heavy','HEAVY','Tougher enemies'],['inferno','INFERNO','Everything harder']],
  open(n){const s=STAGES[n-1];return !!RET.heat&&!!s&&!s.ch&&n<=MAIN&&(sSave.stars[MAIN]|0)>=1&&(sSave.stars[n]|0)>=1;},
  top(n){return this.open(n)?Math.min(this.max,(this.best[n]|0)+1):0;},          // highest Heat you may pick on stage n
  lv(n){return this.open(n)?Math.max(0,Math.min(this.top(n),this.pick[n]|0)):0;},   // Heat of the next run on stage n (0 = off)
  muts(h){return this.STEPS.slice(0,h);},
  label(h){return h?'HEAT '+h+': '+this.muts(h).map(m=>m[1]).slice(-3).join(' · '):'';},
  apply(s){const h=this.lv(s.n);this.run=h;this.td=0;if(!h)return;const has=id=>h>=1+this.STEPS.findIndex(m=>m[0]===id);
    s.bs*=1+(has('turbo')?.06:0)+(has('turbo2')?.06:0);
    s.el=Math.min(.6,s.el+(has('guard')?.08:0)+(has('guard2')?.08:0));
    if(has('decay'))this.td=2;
    if(has('noheal'))s.heal=0;
    if(has('hull'))s.hp0=Math.max(2,s.hp0-1);
    if(has('heavy'))s.eh*=1.1;
    if(has('inferno')){s.eh*=1.08;s.d0*=1.06;s.d=s.d0*.8;}},
  save(){try{localStorage.setItem('mnr_heat',JSON.stringify({pick:this.pick,best:this.best}));}catch(e){}},
  medals(){let t=0;for(const k in this.best)t+=this.best[k]|0;return t;}};
try{const o=JSON.parse(localStorage.getItem('mnr_heat')||'{}');if(o&&typeof o==='object'){for(const k in o.pick||{})HEAT.pick[k]=Math.max(0,o.pick[k]|0);for(const k in o.best||{})HEAT.best[k]=Math.max(0,o.best[k]|0);}}catch(e){}
window.HEAT=HEAT;
{const st=document.createElement('style');st.textContent=`
#stDet .heat{display:flex;align-items:center;gap:6px;font-family:var(--mono);font-size:12px;color:#ff9a3c}
#stDet .heat button{min-width:44px;min-height:40px;border:1px solid #7a4a2a;background:#1e0d08;color:#ffc58a;border-radius:8px;font:700 16px/1 inherit}
#stDet .heat button:disabled{opacity:.35}
#stDet .heat b{min-width:5.2em;text-align:center;color:#fff;font-size:13px;white-space:nowrap}
#stDet .heat .hm{flex:1 1 0;min-width:0;white-space:nowrap}
#stDet .hmu{font-family:var(--mono);font-size:11px;line-height:1.25;color:#ffc58a;overflow-wrap:anywhere}
#stDet .heat.off{color:var(--dim)}
#stres .sr.heat .sg{color:#ff9a3c}
`;document.head.appendChild(st);}
/* stage plate row (map.js mapDetail calls HEAT.row and HEAT.bind) */
HEAT.row=function(n){if(!RET.heat)return'';const s=STAGES[n-1];if(!s||s.ch||!(sSave.stars[n]|0))return'';
  if(!this.open(n))return'<div class="heat off">🔒 HEAT · clear the story</div>';
  const h=this.lv(n),b=this.best[n]|0,mu=this.muts(h).map(m=>m[1]).join(' · ');
  return`<div class="heat" role="group" aria-label="Heat"><button type="button" id="htDn"${h?'':' disabled'} aria-label="Less heat">−</button><b id="htLv">${h?'🔥 HEAT '+h:'HEAT OFF'}</b><button type="button" id="htUp"${h<this.top(n)?'':' disabled'} aria-label="More heat">+</button><span class="hm">${h?'+'+Math.round(100*this.nk*h)+'% Neon':'More Neon'}${b?' · best '+b:''}</span></div>${h?'<div class="hmu" id="htMu">'+mu+'</div>':''}`;};
HEAT.bind=function(n){const set=v=>{this.pick[n]=Math.max(0,Math.min(this.top(n),v));this.save();mapDetail(n);};
  if($('htDn'))$('htDn').addEventListener('click',()=>set(this.lv(n)-1));if($('htUp'))$('htUp').addEventListener('click',()=>set(this.lv(n)+1));};
/* runs: show the mutators, add the DIR mutator, keep mercy out of Heat runs, pay +20% per Heat and the medal */
NR.on('runStart',d=>{if(!d||!d.story){HEAT.run=0;HEAT.td=0;return;}if(!HEAT.run)return;
  if(HEAT.run>=3)DIR.mut=['hail'];HEAT.fails0=RET.fails[d.story]|0;G.note={t:5,txt:HEAT.label(HEAT.run)};});
NR.on('banked',add=>{if(!HEAT.run||!(add>0))return;const b=Math.round(add*HEAT.nk*HEAT.run);GA.bank+=b;SH.lastBank+=b;gsave();HEAT.bonus=b;});
NR.on('runEnd',d=>{const h=HEAT.run;HEAT.run=0;HEAT.td=0;if(!h||!d||!d.story||d.quit)return;const n=d.story;
  if(RET.fails[n]!==HEAT.fails0){if(HEAT.fails0)RET.fails[n]=HEAT.fails0;else delete RET.fails[n];RET.saveFails();}   // a Heat run never feeds the mercy count
  if(!d.cleared){HEAT.last={n,h,ok:false,bonus:HEAT.bonus|0};HEAT.bonus=0;return;}
  const first=h>(HEAT.best[n]|0);let medal=0;if(first){HEAT.best[n]=h;medal=HEAT.medalK*h;GA.bank+=medal;gsave();if(HEAT.pick[n]===h&&h<HEAT.max)HEAT.pick[n]=h+1;}
  if(RET.last&&RET.last.n===n&&RET.last.pay){const b=Math.round(RET.last.pay*HEAT.nk*h);GA.bank+=b;gsave();HEAT.bonus=(HEAT.bonus|0)+b;}
  HEAT.save();HEAT.last={n,h,ok:true,first,medal,bonus:HEAT.bonus|0};HEAT.bonus=0;
  setTimeout(()=>{const e=$('srStars');if(e&&!e.querySelector('.heat'))e.insertAdjacentHTML('beforeend',`<div class="sr ok heat"><span class="sg">🔥</span> HEAT ${h}${first?' medal +'+medal:''} · +${HEAT.last.bonus} Neon</div>`);},0);});
/* ===== B11 daily streak and weekly challenge ===== */
if(RET.daily===undefined)RET.daily=true;
RET.clock=null;                                   // test hook: RET.setClock(ms | () => ms | null) replaces the system clock
RET.setClock=f=>{RET.clock=f==null?null:(typeof f==='function'?f:()=>f);RET.dailyShow();};
const DY={max:7,base:50,step:10,weekly:300,
  s:Object.assign({last:0,streak:0,seen:0,wk:0,wkN:0,wkBest:0},load('mnr_streak',{}))};
for(const k in DY.s)if(!isFinite(DY.s[k]))DY.s[k]=0;
DY.persist=()=>save('mnr_streak',DY.s);
DY.ms=()=>{let m=RET.clock?+RET.clock():Date.now();return isFinite(m)&&m>0?m:Date.now();};
DY.dn=ms=>{const d=new Date(ms);return Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5);};   // local calendar day number, so a timezone change moves the date only by what the wall clock shows
/* today: never earlier than the latest day seen, so a clock set back cannot grant twice or cut a streak; a jump back of more than 3 days is taken as a clock fix */
DY.today=()=>{const s=DY.s,ms=DY.ms();let t=DY.dn(ms);
  if(s.seen>0&&s.seen-t>3){s.seen=t;s.last=Math.min(s.last,t-1);DY.persist();}
  else if(t<s.seen)t=s.seen;
  if(t>s.seen){s.seen=t;DY.persist();}
  return t;};
DY.streakNow=t=>DY.s.last&&t-DY.s.last<=2?DY.s.streak:0;      // one missed day keeps it, two reset it
DY.reward=n=>DY.base+DY.step*Math.min(n,DY.max);
DY.status=()=>{const t=DY.today(),done=DY.s.last===t,cur=DY.streakNow(t),next=done?cur:cur+1;
  return{today:t,claimed:done,streak:cur,next,reward:DY.reward(next)};};
DY.pay=n=>{if(!(n>0)||!isFinite(n))return 0;GA.bank+=Math.floor(n);gsave();return Math.floor(n);};
RET.dailyClaim=function(){if(!RET.daily)return 0;const st=DY.status();if(st.claimed)return 0;
  DY.s.streak=st.next;DY.s.last=st.today;DY.persist();return DY.pay(st.reward);};
/* weekly: ISO 8601 week of the local date; the seed and the two mutators depend on the week only */
DY.weekKey=t=>{const wd=(t+3)%7,thu=t-wd+3,y=new Date(thu*864e5).getUTCFullYear(),j1=Math.floor(Date.UTC(y,0,1)/864e5);return y*100+Math.floor((thu-j1)/7)+1;};
RET.week=function(){const k=DY.weekKey(DY.today()),r=mul(k*7919+13),pool=MUTS.map(m=>m.id),m=[];
  while(m.length<2){const i=Math.floor(r()*pool.length);m.push(pool.splice(i,1)[0]);}
  return{key:k,seed:k*31+5,muts:m,names:m.map(id=>MUTS.find(x=>x.id===id).n),cleared:DY.s.wk===k,best:DY.s.wkN===k?DY.s.wkBest:0};};
RET.weeklyBestLine=()=>{const w=RET.week();return'Weekly best <strong>'+(w.best?w.best.toLocaleString('de-DE'):'—')+'</strong>';};
RET.weeklyEnd=function(score){const w=RET.week();let eye='Weekly run over';
  if(DY.s.wkN!==w.key){DY.s.wkN=w.key;DY.s.wkBest=0;}
  if(score>DY.s.wkBest){DY.s.wkBest=score;eye='New weekly best';}DY.persist();return eye;};
RET.weeklyClear=function(){const w=RET.week();if(w.cleared)return 0;DY.s.wk=w.key;DY.persist();return DY.pay(DY.weekly);};
NR.on('runStart',d=>{if(!RET.daily||!d||!d.daily||!RET.wkPending){return;}
  RET.wkPending=false;const w=RET.week();G.weekly=w.key;
  GR=mul(w.seed);GX=mul(w.seed+7919);DIR.mut=w.muts.slice();DIR.bsK=DIR.has('turbo')?1.12:1;
  G.note={t:6,txt:'Weekly: '+w.names.join(' + ')};});
NR.on('districtEnd',()=>{if(!RET.daily||!G.weekly)return;const p=RET.weeklyClear();if(p)G.note={t:5,txt:'Weekly cleared +'+p+' Neon'};});
NR.on('runEnd',d=>{if(!RET.daily||!d||d.quit)return;
  const e=(()=>{let x=$('retDy');if(!x){x=document.createElement('div');x.id='retDy';x.className='retBar';const h=$('over').querySelector('.in');h.insertBefore(x,h.querySelector('.row'));}return x;})();
  if(G.weekly){e.hidden=false;const w=RET.week();e.innerHTML=w.cleared?'Weekly challenge cleared':'Weekly: beat the first boss for <b>'+DY.weekly+'</b> Neon';return;}
  if(!G.daily){e.hidden=true;return;}
  const p=RET.dailyClaim(),st=DY.status();e.hidden=false;
  e.innerHTML=p?'Daily bonus <b>+'+p+'</b> Neon · streak <b>'+st.streak+'</b>':'Daily bonus already claimed today · streak <b>'+st.streak+'</b>';});
/* title screen status: one block under the best line (a few lines, wraps at 390 px) */
{const st=document.createElement('style');st.textContent=`
#retTt{width:100%;max-width:min(94%,440px);margin:.5em auto 0;text-align:center;font-family:var(--mono);font-size:clamp(12px,min(3.3vw,2.3vh),16px);line-height:1.35;color:var(--dim);overflow-wrap:anywhere}
#retTt b{color:#fff;font-weight:400}#retTt .ok{color:#6cf59a}#retTt button{margin-top:.4em;font:inherit;padding:.5em 1em;min-height:40px;border-radius:99px;border:1px solid #ffb020;background:#0000;color:#ffb020;cursor:pointer}
`;document.head.appendChild(st);}
RET.dailyShow=function(){let e=$('retTt');
  if(RET.title&&RET.titleDraw)RET.titleDraw();
  if(!RET.daily){if(e)e.hidden=true;return;}
  if(!e){e=document.createElement('div');e.id='retTt';$('bestT').after(e);
    e.addEventListener('click',ev=>{if(ev.target.id!=='wkBtn')return;RET.wkPending=true;start(true);});}
  e.hidden=false;const d=DY.status(),w=RET.week();
  if(RET.title){e.innerHTML=(d.claimed?'Daily streak <b>'+d.streak+'</b> <span class="ok">· claimed</span>':'Daily streak <b>'+d.streak+'</b> · <b>+'+d.reward+'</b> Neon today')+' · '+(w.cleared?'Weekly <span class="ok">cleared</span>':'Weekly open · <b>+'+DY.weekly+'</b> Neon');return;}
  e.innerHTML=(d.claimed?'Daily streak <b>'+d.streak+'</b> <span class="ok">· today\'s bonus claimed</span>':'Daily streak <b>'+d.streak+'</b> · fly the daily run for <b>+'+d.reward+'</b> Neon')
   +'<br>'+(w.cleared?'Weekly <span class="ok">cleared</span>':'Weekly: <b>'+w.names.join(' + ')+'</b> · boss clear = <b>+'+DY.weekly+'</b>')+(w.best?' · best '+w.best.toLocaleString('de-DE'):'')
   +'<br><button type="button" id="wkBtn">WEEKLY RUN</button>';};
RET.dailyShow();
window.DY=DY;

/* ---------- B18: district song pools + a theme for every boss (POLISH.md). RET.dpool=false: the old picks, byte for byte.
   New song = 3 steps (music-treblo/README.md): 1 the mp3 into games/mainhattan-nightrun/music/, 2 measure it (audio-test.js) and add its tracks.json entry,
   3 one row in DP.rows below. A row whose song is not loaded (no tracks.json entry) is ignored, so a row can be added before the file arrives. ---------- */
if(RET.dpool===undefined)RET.dpool=true;
const DP=RET.DP={
  base:{0:['stage1','stage2','stage3'],1:['stage2','stage3','endless'],2:['stage3','endless','endless2'],3:['endless2','stage1','stage2'],4:['athina','athina2']},   // by district index (4 = Athens); the songs that exist today
  rows:[   // {k:song key, bpm:synth fallback tempo, d:[district indexes]}; the owner's treblo songs (cues-polish.json): d1a,d1b = Bank ... d4a,d4b = Messe
    {k:'d1a',bpm:118,d:[0]},{k:'d1b',bpm:120,d:[0]},{k:'d2a',bpm:124,d:[1]},{k:'d2b',bpm:126,d:[1]},{k:'d3a',bpm:126,d:[2]},{k:'d3b',bpm:128,d:[2]},{k:'d4a',bpm:128,d:[3]},{k:'d4b',bpm:130,d:[3]}],
  bossT:{0:['boss-d1','boss'],1:['boss-d2','boss3'],2:['boss-d3','boss'],3:['boss-d4','boss2'],6:['boss3']},   // boss k -> themes, the first one that is loaded wins (the last is the song we have)
  bossRows:[{k:'boss-d1',bpm:140},{k:'boss-d2',bpm:140},{k:'boss-d3',bpm:140},{k:'boss-d4',bpm:140}]};
for(const r of DP.rows.concat(DP.bossRows))if(!DEF_BPM[r.k])DEF_BPM[r.k]=r.bpm;   // normTrack() needs a tempo for every key it accepts
DP.have=k=>!!(TR.by&&TR.by[k]);
DP.pool=di=>{const o=(DP.base[di]||DP.base[0]).slice();for(const r of DP.rows)if(r.d.includes(di)&&DP.have(r.k)&&!o.includes(r.k))o.push(r.k);return o;};
DP.boss=k=>{const a=DP.bossT[k];if(!a)return null;for(const s of a)if(DP.have(s)||s==='boss'||s==='boss2'||s==='boss3')return s;return null;};
// the pick for step s of a sequence: the next pool song (rotating by how often the district came up) that is not the one before
DP.pick=(dis)=>{const out=[],cnt={};for(let s=0;s<dis.length;s++){const di=dis[s],p=DP.pool(di),c=cnt[di]=(cnt[di]||0)+1,prev=out[s-1];let r=p[(c-1)%p.length];for(let j=0;j<p.length&&r===prev;j++)r=p[(c-1+j+1)%p.length];out.push(r);}return out;};
DP.endless=(di,loop)=>{const n=ORDER.length,pos=posOf(di),dis=[];for(let l=0;l<=loop;l++)for(const d of ORDER)dis.push(d);return DP.pick(dis)[loop*n+pos];};
DP.stage=n=>{const key=TR.list.length;if(DP.sc!==key){const dis=STAGES.map(s=>s.di);DP.sq=DP.pick(dis);DP.sc=key;}return DP.sq[n-1];};
for(const s of STAGES){if(s.ch)continue;const old=s.song;   // challenge stages (fixed rules, tuned to their song) keep their old pick
  Object.defineProperty(s,'song',{configurable:true,enumerable:true,get(){return RET.dpool?DP.stage(this.n):old;},set(v){Object.defineProperty(this,'song',{value:v,writable:true,configurable:true,enumerable:true});}});}
window.__dp={STAGES,songFor,bossSong,bossStage,ORDER,DISTRICTS,songBars};   // test hook (ret-dpool-test.js)
/* ===== B19 combo-driven music, B20 stingers (POLISH.md). The engine is in a.js (AU.lyTick / AU.lyHit / AU.sting); this only wires the events. ===== */
if(RET.layers===undefined)RET.layers=true;   // lowpass opens with the combo tier, drum layer from tier 3, a hit muffles the song for a beat
if(RET.sting===undefined)RET.sting=true;     // short stingers on the beat grid
RET.lastTier=1;
NR.on('runStart',()=>{RET.lastTier=1;});
NR.on('hurt',()=>{if(RET.layers)AU.lyHit();});
NR.on('tier',d=>{if(!d)return;const up=d.tier>RET.lastTier;RET.lastTier=d.tier;if(RET.sting&&up)AU.sting('tierup'+Math.min(3,d.tier-1));});
NR.on('perfect',()=>{if(RET.sting)AU.sting('perfect');});
NR.on('bossIn',d=>{if(RET.sting&&!(d&&d.mini))AU.sting('boss-in');});
NR.on('bossPhase',()=>{if(RET.sting)AU.sting('phase');});
NR.on('stageClear',()=>{if(RET.sting)AU.sting('clear');});
NR.on('runEnd',d=>{if(RET.sting&&d&&!d.quit&&!d.cleared)AU.sting('fail');});

/* ===== B27 screen transitions + bank chip + score count-up (RET.trans), B36 grade pops per 16 bars (RET.grade) ===== */
if(RET.trans===undefined)RET.trans=true;
if(RET.grade===undefined)RET.grade=true;
{const st=document.createElement('style');st.textContent=`
@keyframes retIn{from{opacity:0}to{opacity:1}}
html.rtr .ov:not([hidden]){animation:retIn .18s ease-out}
.retChip{position:absolute;top:8px;right:10px;z-index:6;pointer-events:none;font-family:var(--mono);font-size:clamp(12px,min(3.4vw,2.4vh),16px);color:#19e3ff;background:#05030cc0;border:1px solid #19e3ff55;border-radius:99px;padding:.15em .7em}
.retChip b{color:#fff;font-weight:700}
.retGr{font-family:var(--mono);font-size:clamp(12px,min(3.4vw,2.4vh),17px);color:var(--dim)}.retGr b{margin-left:.5em;color:#fff}.retGr b.S{color:#ffe14d}.retGr b.A{color:#3dffb0}
#retPop{position:absolute;left:50%;top:max(11%,64px);z-index:4;pointer-events:none;font:700 clamp(30px,9vw,54px) var(--display);color:#fff;text-shadow:0 0 14px currentColor;opacity:0;transform:translate(-50%,0)}
#retPop.on{animation:retPop .75s ease-out forwards}
html.rtn #retPop.on{animation:none;opacity:1}
@keyframes retPop{0%{opacity:0;transform:translate(-50%,10px) scale(.7)}18%{opacity:1;transform:translate(-50%,0) scale(1.1)}70%{opacity:1;transform:translate(-50%,-4px) scale(1)}100%{opacity:0;transform:translate(-50%,-14px) scale(1)}}
`;document.head.appendChild(st);}
RET.motion=()=>!(SET.rm||RM);   // reduced motion (setting or OS) turns the fades and count-ups off
RET.syncMotion=()=>{const h=document.documentElement;h.classList.toggle('rtr',!!RET.trans&&RET.motion());h.classList.toggle('rtn',!RET.motion());};
RET.syncMotion();
document.addEventListener('pointerdown',()=>{if(!RET.trans)return;RET.syncMotion();RET.skip();},true);   // a tap finishes any fade or count-up
const retCnt=[];   // running count-ups: {el,to,fmt,t0,dur}
let retRaf=0;
function retStep(now){retRaf=0;for(let i=retCnt.length-1;i>=0;i--){const c=retCnt[i],k=Math.min(1,(now-c.t0)/c.dur);c.set(k>=1?c.to:Math.round(c.from+(c.to-c.from)*(1-(1-k)*(1-k))));if(k>=1)retCnt.splice(i,1);}if(retCnt.length)retRaf=requestAnimationFrame(retStep);}
RET.countUp=function(set,from,to,dur){if(!RET.motion()||from===to||dur<=0){set(to);return;}   // set(n) writes the text; ends exactly on `to`
  for(let i=retCnt.length-1;i>=0;i--)if(retCnt[i].set===set)retCnt.splice(i,1);
  retCnt.push({set,from,to,t0:performance.now(),dur});set(from);if(!retRaf)retRaf=requestAnimationFrame(retStep);};
RET.skip=function(){for(const c of retCnt)c.set(c.to);retCnt.length=0;try{for(const a of document.getAnimations())if(a.animationName==='retIn')a.finish();}catch(e){}};
/* bank chip: pinned top-right on the game-over, stage-clear and stage-select screens; counts up when the bank grows */
RET.chipV=GA.bank;RET.chips=[];
function retChipSet(n){const t=n.toLocaleString('de-DE');for(const c of RET.chips)c.firstElementChild.textContent=t;}
RET.chipSync=function(){if(!RET.trans)return;for(const el of [$('over'),$('stres'),$('stsel')]){if(!el||el.querySelector('.retChip'))continue;
    const c=document.createElement('div');c.className='retChip';c.innerHTML='◆ <b></b> Neon';el.appendChild(c);RET.chips.push(c);}
  if(RET.chipV!==GA.bank||!RET.chips[0].firstElementChild.textContent){RET.countUp(retChipSet,RET.chipV,GA.bank,800);RET.chipV=GA.bank;}};
for(const id of ['over','stres','stsel']){const el=$(id);if(el)new MutationObserver(()=>{if(!el.hidden&&RET.trans&&!retCnt.length)RET.chipSync();}).observe(el,{attributes:true,attributeFilter:['hidden']});}
/* grades: every 16 bars a letter from the PERFECTs and hull lost in those bars */
RET.gr={bar:0,perf:0,hits:0,hp:0,list:[]};
RET.gradeOf=(dp,hits)=>{const r=dp/64;return r>=.35&&hits===0?'S':r>=.2&&hits<=1?'A':r>=.08&&hits<=2?'B':'C';};   // PERFECTs per beat in 16 bars (64 beats), hull lost
NR.on('runStart',()=>{const g=RET.gr;g.bar=0;g.perf=G.perf|0;g.hits=0;g.hp=P.hp;g.list=[];RET.chipV=GA.bank;});
NR.on('tick',()=>{const g=RET.gr;if(P.hp<g.hp)g.hits+=g.hp-P.hp;g.hp=P.hp;});
NR.on('bar',()=>{if(!RET.grade||!G.live||G.dead)return;const g=RET.gr;if(++g.bar%16)return;
  const L=RET.gradeOf((G.perf|0)-g.perf,g.hits);g.list.push(L);g.perf=G.perf|0;g.hits=0;RET.pop(L);});
RET.pop=function(L){let e=$('retPop');if(!e){e=document.createElement('div');e.id='retPop';e.setAttribute('aria-hidden','true');($('stage')||document.body).appendChild(e);
    e.addEventListener('animationend',()=>e.classList.remove('on'));}
  e.textContent=L;e.style.color=L==='S'?'#ffe14d':L==='A'?'#3dffb0':L==='B'?'#19e3ff':'#c9c4ec';e.classList.remove('on');void e.offsetWidth;e.classList.add('on');
  if(!RET.motion())setTimeout(()=>e.classList.remove('on'),800);
  if(L==='S')try{AU.sfx('up');}catch(x){}};
/* run end: count the score up (the texts are written after the event, so wait one tick), show the grade strip */
NR.on('runEnd',d=>{if(!d||d.quit||!RET.trans&&!RET.grade)return;setTimeout(()=>{
  if(RET.trans){for(const [id,sc] of [['oScore','over'],['srScore','stres']]){const el=$(id);if(!el||$(sc).hidden)continue;const to=G.score|0;
      RET.countUp(n=>{el.textContent=n.toLocaleString('de-DE');},0,to,800);}
    RET.chipSync();}
  if(RET.grade)for(const [id,host] of [['grO',$('over')],['grR',$('stres')]]){let e=$(id);const L=RET.gr.list;
    if(!e){e=document.createElement('div');e.id=id;e.className='retGr';host.querySelector('.in').insertBefore(e,host.querySelector('.row'));}
    e.hidden=!L.length;e.innerHTML=L.length?'Grades'+L.map(x=>'<b class="'+x+'">'+x+'</b>').join(''):'';}},0);});

/* ---------- B24 save export / import (POLISH.md). Flag RET.saveio; off = Settings exactly as before. Hooks: click listeners on the Settings buttons and NR 'runEnd'. Nothing is executed: a file or code is parsed as data only. ---------- */
if(RET.saveio===undefined)RET.saveio=true;
RET.sioKeys=['arc','bank','best','chest','chk','daily','eq','hard','heat','mkt','mute','own','q','retfail','runs','set','ship','story','streak','theme','tipdone','tune','tut','tutgift','wp','wplv','wpseen'].map(k=>'mnr_'+k);   // other parts append their save keys here
RET.sio=(()=>{const L=window.localStorage,BAK='mnr_bak',INFO='mnr_bakinfo',MAXTXT=262144,MAXVAL=65536,BAD=/^(__proto__|constructor|prototype)$/;
  const S={sess:false,pending:null,msg:'',err:false};
  const get=k=>{try{return L.getItem(k);}catch(e){return null;}},set=(k,v)=>{try{L.setItem(k,v);return true;}catch(e){return false;}},del=k=>{try{L.removeItem(k);}catch(e){}};
  const info=()=>{try{const o=JSON.parse(get(INFO)||'{}');return o&&typeof o==='object'?o:{};}catch(e){return{};}};
  const setInfo=p=>set(INFO,JSON.stringify(Object.assign(info(),p)));
  const sum=m=>{let h=2166136261>>>0;const s=Object.keys(m).sort().map(k=>k+'='+m[k]).join('\n');for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}return h.toString(16);};
  const b64e=s=>btoa(unescape(encodeURIComponent(s))),b64d=s=>decodeURIComponent(escape(atob(s)));
  const snapshot=()=>{const m={};for(const k of RET.sioKeys){const v=get(k);if(v!=null)m[k]=v;}return m;};
  const pack=()=>JSON.stringify({app:'mnr',v:1,t:Date.now(),sum:sum(snapshot()),keys:snapshot()});
  const num=(v,lo,hi)=>typeof v==='number'&&isFinite(v)&&v>=lo&&v<=hi;
  function walk(x,d){if(d>8)return false;if(typeof x==='number')return isFinite(x)&&Math.abs(x)<=1e9;if(typeof x==='string')return x.length<=300;if(x===null||typeof x==='boolean')return true;
    if(typeof x!=='object')return false;if(Array.isArray(x))return x.length<=500&&x.every(e=>walk(e,d+1));const ks=Object.keys(x);return ks.length<=500&&ks.every(k=>!BAD.test(k)&&k.length<=60&&walk(x[k],d+1));}
  const SHAPE={mnr_bank:v=>num(v,0,1e9),mnr_runs:v=>num(v,0,1e9),mnr_tut:v=>num(v,0,2),mnr_tutgift:v=>num(v,0,1),mnr_chest:v=>num(v,0,1),mnr_arc:v=>num(v,0,1),
    mnr_hard:v=>typeof v==='boolean',mnr_mute:v=>typeof v==='boolean',mnr_tipdone:v=>typeof v==='boolean',mnr_wpseen:v=>typeof v==='boolean',
    mnr_ship:v=>typeof v==='string',mnr_theme:v=>typeof v==='string',mnr_best:v=>v&&typeof v==='object'&&num(v.score,0,1e9),mnr_daily:v=>v&&typeof v==='object'&&num(v.score,0,1e9),
    mnr_wplv:v=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).every(k=>num(v[k],0,99)),mnr_set:v=>v&&typeof v==='object'&&!Array.isArray(v),mnr_story:v=>v&&typeof v==='object'&&!Array.isArray(v)};
  function parse(txt){   // -> {ok,keys,t,reason}; never changes anything
    const no=r=>({ok:false,reason:r});
    if(typeof txt!=='string')return no('Not a save.');txt=txt.trim();if(!txt)return no('Nothing to import.');if(txt.length>MAXTXT)return no('Too big to be a save.');
    let raw=txt;try{if(txt[0]!=='{'){const t=txt.replace(/^MNR1\./,'').replace(/\s+/g,'').replace(/-/g,'+').replace(/_/g,'/');raw=b64d(t);}}catch(e){return no('That code is damaged.');}
    let o;try{o=JSON.parse(raw);}catch(e){return no('That is not a Nightrun save.');}
    if(!o||typeof o!=='object'||Array.isArray(o)||o.app!=='mnr')return no('That is not a Nightrun save.');
    if(o.v!==1)return no('Save version '+String(o.v).slice(0,8)+' is not supported.');
    const ks=o.keys;if(!ks||typeof ks!=='object'||Array.isArray(ks))return no('That save has no data.');
    const names=Object.keys(ks);if(!names.length)return no('That save is empty.');
    for(const k of names){if(BAD.test(k)||RET.sioKeys.indexOf(k)<0)return no('Unknown data in the save.');
      const s=ks[k];if(typeof s!=='string'||s.length>MAXVAL)return no('Damaged data in the save.');
      let v;try{v=JSON.parse(s);}catch(e){return no('Damaged data in the save.');}
      if(!walk(v,0)||(SHAPE[k]&&!SHAPE[k](v)))return no('A value in the save is out of range.');}
    if(typeof o.sum!=='string'||o.sum!==sum(ks))return no('The checksum does not match.');
    return{ok:true,keys:ks,t:+o.t||0};}
  function applyKeys(m){for(const k of RET.sioKeys)del(k);for(const k in m)set(k,m[k]);}
  function backup(){const m=snapshot();return set(BAK,JSON.stringify({t:Date.now(),keys:m}));}
  function hasUndo(){try{const o=JSON.parse(get(BAK)||'null');return !!(o&&o.keys&&typeof o.keys==='object');}catch(e){return false;}}
  function doImport(p){if(!p||!p.ok)return false;if(!backup())return false;applyKeys(p.keys);setInfo({imp:Date.now()});return true;}
  function undo(){try{const o=JSON.parse(get(BAK)||'null');if(!o||!o.keys)return false;const p=parse(JSON.stringify({app:'mnr',v:1,t:0,sum:sum(o.keys),keys:o.keys}));
      if(!p.ok&&Object.keys(o.keys).length)return false;applyKeys(o.keys);del(BAK);setInfo({imp:Date.now()});return true;}catch(e){return false;}}
  function persist(){if(S.sess)return;S.sess=true;try{const st=navigator.storage;if(st&&st.persist)Promise.resolve(st.persisted&&st.persisted()).then(p=>{if(!p)return st.persist();}).catch(()=>{});}catch(e){}}
  function lsOk(){try{const k='mnr_probe';L.setItem(k,'1');L.removeItem(k);return true;}catch(e){return false;}}
  return{parse,pack,snapshot,doImport,undo,hasUndo,persist,lsOk,info,setInfo,S,sum,BAK,INFO};})();
RET.sioUI=(()=>{const X=RET.sio,$$=id=>document.getElementById(id);let box=null,toastT=0;
  const css='#sioBox{display:flex;flex-direction:column;gap:8px;margin-top:2px}#sioBox .sioRow{display:flex;gap:8px;flex-wrap:wrap}#sioBox button{all:unset;box-sizing:border-box;cursor:pointer;font:italic 800 12px var(--display,sans-serif);letter-spacing:.08em;text-transform:uppercase;padding:0 14px;min-height:44px;min-width:44px;display:inline-flex;align-items:center;justify-content:center;border-radius:8px;border:1px solid rgba(76,234,255,.45);background:rgba(8,20,32,.7);color:#e6f6ff;text-align:center}#sioBox button.hot{background:linear-gradient(90deg,#ff6a6a,#ff9a3c);border-color:transparent;color:#1a0505}#sioBox button:focus-visible{outline:2px solid var(--yel,#ff0)}#sioBox textarea{box-sizing:border-box;width:100%;min-height:64px;max-height:120px;resize:vertical;font:12px monospace;color:#e6f6ff;background:rgba(0,0,0,.4);border:1px solid rgba(76,234,255,.35);border-radius:8px;padding:6px}#sioBox .sioNote{font:12px/1.35 var(--body,sans-serif);color:#b4d2e2;overflow-wrap:anywhere}#sioBox .sioNote.err{color:#ff8a8a}#sioBox .sioNote.ok{color:#8affb0}#sioBox .sioAsk{border:1px solid rgba(255,154,60,.7);border-radius:8px;padding:8px;display:flex;flex-direction:column;gap:8px;color:#fff;font:700 13px var(--body,sans-serif)}';
  const when=t=>t?new Date(t).toLocaleString():'never';
  function say(t,err,ok){X.S.msg=t;X.S.err=!!err;const n=$$('sioMsg');if(n){n.textContent=t;n.className='sioNote'+(err?' err':ok?' ok':'');}}
  function toast(t){let e=$$('sioToast');if(!e){e=document.createElement('div');e.id='sioToast';e.style.cssText='position:fixed;left:50%;bottom:14px;transform:translateX(-50%);max-width:92vw;background:#220;color:#ffd24a;border:1px solid #ffd24a;border-radius:8px;padding:8px 12px;font:700 12px sans-serif;z-index:99999;pointer-events:none';document.body.appendChild(e);}e.textContent=t;e.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>{e.hidden=true;},5000);}
  function refresh(){const n=$$('sioLast');if(!n)return;const i=X.info();let t='Last backup: '+when(i.exp);if(i.imp)t+=' · Last import: '+when(i.imp);
    n.textContent=t+(navigator.storage&&navigator.storage.persisted?'':'');const u=$$('sioUndo');if(u)u.hidden=!X.hasUndo();
    if(!X.lsOk()){say('Storage is blocked in this browser: progress cannot be saved.',true);}}
  function download(){const txt=X.pack(),b=new Blob([txt],{type:'application/json'}),a=document.createElement('a'),d=new Date(),p=n=>String(n).padStart(2,'0');
    a.href=URL.createObjectURL(b);a.download='nightrun-save-'+d.getFullYear()+p(d.getMonth()+1)+p(d.getDate())+'.json';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},800);
    X.setInfo({exp:Date.now()});say('Save file created.',false,true);refresh();}
  function code(){return 'MNR1.'+btoa(unescape(encodeURIComponent(X.pack()))).replace(/\+/g,'-').replace(/\//g,'_');}
  function copy(){const c=code(),ta=$$('sioTxt');X.setInfo({exp:Date.now()});refresh();
    const done=()=>say('Code copied. Paste it on your other device.',false,true),shown=()=>{ta.value=c;ta.focus();ta.select();say('Copy the code from the box below.',false,true);};
    try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(c).then(done,shown);return;}}catch(e){}shown();}
  function ask(p){X.S.pending=p;const a=$$('sioAsk'),n=Object.keys(p.keys).length;a.hidden=false;
    a.firstChild.textContent='Replace progress on this device? '+n+' saved items'+(p.t?', backed up '+when(p.t):'')+'. Your current save is kept for UNDO.';}
  function tryText(t){const p=X.parse(t);if(!p.ok){X.S.pending=null;$$('sioAsk').hidden=true;say('Import failed: '+p.reason+' Nothing was changed.',true);return;}say('',false);ask(p);}
  function build(){if(box&&box.isConnected)return box;const body=$$('setBody');if(!body)return null;
    if(!$$('sioCss')){const s=document.createElement('style');s.id='sioCss';s.textContent=css;document.head.appendChild(s);}
    const h=document.createElement('h3');h.id='sioH';h.textContent='Save';box=document.createElement('div');box.id='sioBox';
    box.innerHTML='<div class="sioNote" id="sioLast"></div><div class="sioRow"><button type="button" id="sioFile">EXPORT FILE</button><button type="button" id="sioCopy">COPY CODE</button></div>'
      +'<textarea id="sioTxt" rows="3" placeholder="Paste a save code here" aria-label="Save code" spellcheck="false" autocomplete="off"></textarea>'
      +'<div class="sioRow"><button type="button" id="sioPaste">IMPORT CODE</button><button type="button" id="sioLoad">IMPORT FILE</button><button type="button" id="sioUndo" hidden>UNDO LAST IMPORT</button></div>'
      +'<input type="file" id="sioPick" accept=".json,.txt,application/json,text/plain" hidden>'
      +'<div class="sioAsk" id="sioAsk" hidden><span></span><div class="sioRow"><button type="button" id="sioYes" class="hot">REPLACE</button><button type="button" id="sioNo">CANCEL</button></div></div><div class="sioNote" id="sioMsg" role="status"></div>';
    body.appendChild(h);body.appendChild(box);
    $$('sioFile').addEventListener('click',download);$$('sioCopy').addEventListener('click',copy);
    $$('sioPaste').addEventListener('click',()=>tryText($$('sioTxt').value));
    $$('sioLoad').addEventListener('click',()=>$$('sioPick').click());
    $$('sioPick').addEventListener('change',e=>{const f=e.target.files&&e.target.files[0];e.target.value='';if(!f)return;if(f.size>262144){say('Import failed: Too big to be a save. Nothing was changed.',true);return;}
      const r=new FileReader();r.onload=()=>tryText(String(r.result));r.onerror=()=>say('Import failed: could not read the file.',true);r.readAsText(f);});
    $$('sioNo').addEventListener('click',()=>{X.S.pending=null;$$('sioAsk').hidden=true;say('Cancelled. Nothing was changed.');});
    $$('sioYes').addEventListener('click',()=>{const p=X.S.pending;X.S.pending=null;$$('sioAsk').hidden=true;
      if(p&&X.doImport(p)){say('Progress replaced. Reloading…',false,true);setTimeout(()=>location.reload(),RET.sioNoReload?1e9:600);}else say('Import failed. Nothing was changed.',true);});
    $$('sioUndo').addEventListener('click',()=>{if(X.undo()){say('Previous progress restored. Reloading…',false,true);setTimeout(()=>location.reload(),RET.sioNoReload?1e9:600);}else say('Nothing to undo.',true);});
    return box;}
  function onOpen(){const has=!!$$('sioBox');if(!RET.saveio){if(has){$$('sioBox').remove();const h=$$('sioH');if(h)h.remove();box=null;}return;}
    setTimeout(()=>{if(!RET.saveio)return;if(!build())return;refresh();X.persist();if(!X.lsOk()&&!X.S.warned){X.S.warned=true;toast('Storage is blocked: progress will not be saved.');}},0);}
  for(const id of['setBtn','pSetBtn']){const b=$$(id);if(b)b.addEventListener('click',onOpen);}
  NR.on('runEnd',()=>{if(RET.saveio)X.persist();});
  return{build,refresh,onOpen,code,toast};})();

/* ===== B21 FEVER: grazes and PERFECTs fill a thin meter at the top edge; when it is full the next bar starts 8 bars of FEVER (score x1.5, music fully open,
   gold edge glow). No extra damage or fire rate: it only pays in score. Needs movement (a still ship fills nothing), once per 32 bars, never with a boss
   on screen. Flag off = the old game. The music reads AU.fever (a.js lyStep/lyDrum), the score reads RET.fv.k (b.js comboK). ===== */
if(RET.fever===undefined)RET.fever=!/[?&]fever=0/.test(location.search);
const FV=RET.fv={m:0,on:false,armed:false,bars:0,tb:0,last:-99,k:1.5,len:8,gap:32,gz:.025*100,pf:6,dash:8,starts:0,still:1.5};
RET.fvEl=null;
RET.fvDom=function(){let e=RET.fvEl;if(e&&e.isConnected)return e;e=document.createElement('div');e.id='retFv';e.setAttribute('aria-hidden','true');
  e.style.cssText='position:absolute;inset:0;pointer-events:none;z-index:6;opacity:1;';
  e.innerHTML='<div class="fvGl" style="position:absolute;inset:0;opacity:0;box-shadow:inset 0 0 26px 5px rgba(255,210,61,.55)"></div>'+
    '<div class="fvTr" style="position:absolute;left:12%;right:12%;top:1px;height:4px;border-radius:2px;background:rgba(255,255,255,.14)"><div class="fvBar" style="height:100%;width:0;border-radius:2px;background:#19e3ff"></div></div>';
  ($('stage')||document.body).appendChild(e);RET.fvEl=e;return e;};
RET.fvDraw=function(){if(!RET.fever){if(RET.fvEl)RET.fvEl.style.display='none';return;}
  const e=RET.fvDom(),bar=e.querySelector('.fvBar'),gl=e.querySelector('.fvGl'),mo=RET.motion();e.style.display='';
  const w=FV.on?100*(FV.len-FV.bars)/FV.len:FV.m;
  bar.style.transition=mo?'width .2s linear':'none';bar.style.width=Math.max(0,Math.min(100,w))+'%';
  bar.style.background=FV.on?'#ffd23d':(FV.m>=100||FV.armed?'#ffe9a0':'#19e3ff');
  gl.style.transition=mo?'opacity .4s':'none';gl.style.opacity=FV.on?'1':'0';};
RET.fvReset=function(){const was=FV.on||FV.armed;FV.m=0;FV.on=false;FV.armed=false;FV.bars=0;FV.last=-99;FV.tb=0;AU.fever=false;if(was)try{AU.lyTick(AU.a);}catch(x){}RET.fvDraw();};
RET.fvStop=function(){const was=FV.on;FV.on=false;FV.armed=false;FV.bars=0;AU.fever=false;if(was&&running)floater(W*.5,H*.3,'FEVER OVER','#ffd23d');RET.fvDraw();};
RET.fvGain=function(v){if(!RET.fever||!running||G.dead||G.over||FV.on||FV.armed||G.boss||STILL.t>FV.still)return false;
  FV.m=Math.min(100,FV.m+v);RET.fvDraw();return true;};
RET.fvReady=()=>RET.fever&&running&&!G.dead&&!G.boss&&FV.m>=100&&FV.tb-FV.last>=FV.gap;
NR.on('runStart',()=>{RET.fvReset();});
NR.on('runEnd',()=>{RET.fvReset();});
NR.on('stageClear',()=>{RET.fvReset();});
NR.on('districtEnd',()=>{RET.fvStop();FV.m=0;RET.fvDraw();});
NR.on('bossIn',d=>{if(FV.on||FV.armed)RET.fvStop();});
NR.on('graze',()=>{RET.fvGain(FV.gz);});
NR.on('perfect',d=>{RET.fvGain(d&&d.kind==='dash'?FV.dash:FV.pf);});
NR.on('beat',d=>{if(!RET.fever){if(RET.fvEl&&RET.fvEl.style.display!=='none')RET.fvEl.style.display='none';return;}if(!d||d.i%4!==3)return;   // the beat before a bar line: arm / disarm the music so its layers change on that line
  if(FV.on){if(FV.bars>=FV.len-1)AU.fever=false;}
  else if(!FV.armed&&RET.fvReady()){FV.armed=true;AU.fever=true;}});
NR.on('bar',()=>{if(!RET.fever)return;FV.tb++;
  if(FV.on){if(++FV.bars>=FV.len)RET.fvStop();else RET.fvDraw();return;}
  if(FV.armed){FV.armed=false;
    if(!RET.fvReady()){AU.fever=false;return;}
    FV.on=true;FV.bars=0;FV.m=0;FV.last=FV.tb;FV.starts++;AU.fever=true;
    floater(W*.5,H*.3,'FEVER ×'+FV.k,'#ffd23d');G.flash=Math.max(G.flash,.25*FX());if(RET.sting)AU.sting('fever');RET.fvDraw();}});
