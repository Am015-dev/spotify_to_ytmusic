/* ---------- retention parts (RETENTION.md). Each item has a flag in RET; a flag set to false leaves the game exactly as it was. ---------- */
const RET=window.RET=window.RET||{};
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
  if(!RET.daily){if(e)e.hidden=true;return;}
  if(!e){e=document.createElement('div');e.id='retTt';$('bestT').after(e);
    e.addEventListener('click',ev=>{if(ev.target.id!=='wkBtn')return;RET.wkPending=true;start(true);});}
  e.hidden=false;const d=DY.status(),w=RET.week();
  e.innerHTML=(d.claimed?'Daily streak <b>'+d.streak+'</b> <span class="ok">· today\'s bonus claimed</span>':'Daily streak <b>'+d.streak+'</b> · fly the daily run for <b>+'+d.reward+'</b> Neon')
   +'<br>'+(w.cleared?'Weekly <span class="ok">cleared</span>':'Weekly: <b>'+w.names.join(' + ')+'</b> · boss clear = <b>+'+DY.weekly+'</b>')+(w.best?' · best '+w.best.toLocaleString('de-DE'):'')
   +'<br><button type="button" id="wkBtn">WEEKLY RUN</button>';};
RET.dailyShow();
window.DY=DY;
