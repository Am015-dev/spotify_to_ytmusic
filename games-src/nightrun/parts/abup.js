/* ---------- ABUP: DASH and EMP upgrades + power-up interaction (flag RET.abup, default ON; ?abup=0 = the abilities exactly as before). Test: nightrun/abup-test.js.
   Owner, 21 Oct 2026: "The power ups should be used by EMP, dash and EMP are useless as they stand; either allow upgrades eg double dash, power ups recharge,
   more power ups on demand or from the screen; game must be more strategic and timing."
   1. Garage tab ABILITY: six permanent upgrades bought with Neon (saved in mnr_abup; placeholder shape icons, painted abup-<id>.webp replace them, ASSETS-NEEDED-3.md):
        DOUBLE DASH  a GOOD or PERFECT dash opens DDW s for a 2nd short hop (it spends the 2nd charge, no off-beat cost)
        BURN TRAIL   a GOOD or PERFECT dash leaves a burning trail (the old burn trail, damage goes in as player shots)
        BEAT REFUND  a PERFECT dash gives its charge back (a parry that already refunded is not paid twice)
        EMP RESERVE  +1 EMP: with 3 held the meter keeps filling one reserve charge that slots in after the next EMP
        WIDE EMP     the x1 / x2 bursts reach ER_K further (timing.js radii; x3 is the whole screen anyway)
        EMP SALVAGE  every bullet an EMP wipes pays score; a wipe of SALN+ bullets drops a power-up (once per SALCD s)
   2. Power-ups and abilities: a power-up pickup puts PKD of a charge into the dash refill (the EMP meter already fills from it through grit.js);
      an EMP that fires (not WASTED) CONSUMES the held power-up: the stored charge (arsenal.js), else a timed power with less than half its time left,
      and adds a blast flavoured by its role: defensive = SHIELD EMP (i-frames), offensive = HOMING EMP (homing shots), the rest = SLOW-FIELD EMP;
      the power-up slot (a touch chip next to EMP, Q on a keyboard): TAP it to trade the held power-up for a full dash refill, or (dash full) a fresh drop from
      the right edge; CD s cooldown.
   3. Mashing stays unrewarded: the double hop, the trail and the refund only follow a dash the beat judge passed; heat (timing.js) still counts every press.
   Nothing here writes e.hp, the DMG / armour caps, hard.js or the grit token bucket: EMP charges still only come through ABIL.gain (the reserve takes the
   bucket's overflow that was thrown away before), damage goes in as player shots (pbRoom, DMG.hit). */
if(RET.abup===undefined)RET.abup=!/[?&]abup=0/.test(location.search);
const ABUP=window.ABUP={get on(){return!!RET.abup&&!!(window.ABIL&&ABIL.on);},
  U:[{id:'dd',n:'DOUBLE DASH',t:'A beat dash opens a quick 2nd hop',p:90,c:'#19e3ff',ic:'M2 12l6-6v4h4V6l6 6-6 6v-4H8v4z',tip:'DOUBLE DASH: dash on the beat, press again fast for a 2nd hop'},
     {id:'trail',n:'BURN TRAIL',t:'Beat dashes leave a burning trail',p:110,c:'#ff8a3d',ic:'M3 16c4-1 6-6 9-6s5 4 9 2v4c-4 2-6-2-9-2s-5 4-9 4z',tip:'BURN TRAIL: dash on the beat through foes to burn them'},
     {id:'pref',n:'BEAT REFUND',t:'A PERFECT dash gives its charge back',p:120,c:'#ffffff',ic:'M12 3a9 9 0 109 9h-3a6 6 0 11-6-6v3l5-4.5L12 0z',tip:'BEAT REFUND: PERFECT dashes are free'},
     {id:'ecap',n:'EMP RESERVE',t:'+1 EMP held in reserve',p:140,c:'#ffb020',ic:'M4 4h16v6H4zM4 14h16v6H4z',tip:'EMP RESERVE: a 4th charge waits until you fire'},
     {id:'erad',n:'WIDE EMP',t:'EMP x1 and x2 reach 35% further',p:120,c:'#ffb020',ic:'M12 2a10 10 0 110 20 10 10 0 010-20zm0 4a6 6 0 100 12 6 6 0 000-12z',tip:'WIDE EMP: small bursts cover more'},
     {id:'econv',n:'EMP SALVAGE',t:'Wiped bullets pay; a big wipe drops a power-up',p:130,c:'#3dffb0',ic:'M12 2l9 5v10l-9 5-9-5V7zm0 5l-4 2.5v5L12 17l4-2.5v-5z',tip:'EMP SALVAGE: EMP a full screen for a power-up'}],
  DDW:.35,DDH:.12,TRW:.25,PKD:.35,ER_K:1.35,SALS:20,SALN:12,SALCD:30,CD:20,HOLD:.45,HALF:.5,HOMN:6,HOMD:8,SHI:1.6,SLR:240,SLT:3,
  ROLE:{nova:'off',drum:'off',tempo:'off',ric:'off',slice:'off',echo:'off',bomb:'off',chord:'def',crate:'def',leech:'def',wing:'def',magb:'utl',slow:'utl'},
  stat:{buy:0,dd:0,trail:0,pref:0,res:0,resIn:0,sal:0,salPk:0,cons:0,shield:0,homing:0,slow:0,trade:0,tRef:0,tSpawn:0,pkDash:0},
  own:(()=>{try{const o=load('mnr_abup',{});return o&&typeof o==='object'&&!Array.isArray(o)?o:{};}catch(e){return{};}})(),
  has(id){return this.on&&this.own[id]===1;},
  def(id){return this.U.find(u=>u.id===id);},
  buy(id){const u=this.def(id);if(!u||this.own[id]===1||GA.bank<u.p)return false;GA.bank-=u.p;this.own[id]=1;save('mnr_abup',this.own);gsave();this.stat.buy++;return true;},
  r(){return G.abx||(G.abx={dd:0,trT:0,res:0,rm:0,sal:-99,cd:0,shT:0});},
  tip(id){const u=this.def(id);if(u&&window.ABIL)ABIL.tip(u.tip);},
  /* the held power-up: the stored charge first, else the timed power with the least time left (any = also one with more than half left) */
  held(any){if(!G)return null;const S=G.px;if(S&&S.chg&&window.PWX&&PWX.K[S.chg.k])return{k:S.chg.k,st:1};const s=G.pw;if(!s||!s.act||!s.act.length)return null;
    const cur=PW.cur();let best=null,bf=9;for(const a of s.act){const f=clamp(1-(cur-a.s)/a.d,0,1);if(!any&&f>this.HALF)continue;if(f<bf){bf=f;best=a;}}return best?{k:best.k,a:best}:null;},
  take(h){if(h.st){G.px.chg=null;return;}const s=G.pw,i=s.act.indexOf(h.a);if(i>=0){s.act.splice(i,1);if(PW.stat)PW.stat.ended=(PW.stat.ended|0)+1;}},
  role(k){return(window.PWX&&PWX.K[k]&&PWX.K[k].r)||this.ROLE[k]||'utl';},
  col(k){return(window.PWK&&PWK[k]&&PWK[k].c)||'#ffe14d';},
  /* after an EMP that fired: salvage, then the flavoured blast from the held power-up */
  after(wiped){const R=this.r();
    if(this.has('econv')&&wiped>0){G.score+=Math.round(this.SALS*wiped*G.mult);this.stat.sal+=wiped;this.tip('econv');
      if(wiped>=this.SALN&&G.t-R.sal>=this.SALCD){R.sal=G.t;G.pk.push({t:'pw',k:PW.pick(),x:clamp(P.x+70,40,W-40),y:P.y,vx:-30,vy:0,bob:0});this.stat.salPk++;floater(P.x,P.y-56,'SALVAGE','#3dffb0');}}
    if(this.has('erad'))this.tip('erad');
    const h=this.held(false);if(!h)return;this.take(h);this.stat.cons++;const ro=this.role(h.k),c=this.col(h.k);
    if(ro==='def'){P.inv=Math.max(P.inv,this.SHI);R.shT=this.SHI;R.shC=c;this.stat.shield++;floater(P.x,P.y-44,'SHIELD EMP',c);}
    else if(ro==='off'){const tg=G.en.filter(e=>!e.dead&&e.hp>0&&!e.dying&&e.x>0&&e.x<W).sort((a,b)=>Math.hypot(a.x-P.x,a.y-P.y)-Math.hypot(b.x-P.x,b.y-P.y)).slice(0,this.HOMN);
      for(let i=0;i<this.HOMN;i++){if(typeof pbRoom==='function'&&!pbRoom(1))break;const e=tg[i%Math.max(1,tg.length)],a=e?Math.atan2(e.y-P.y,e.x-P.x):(i-this.HOMN/2)*.3;
        G.pb.push({x:P.x,y:P.y,vx:Math.cos(a)*760,vy:Math.sin(a)*760,dm:this.HOMD,pf:1,hk:3,ab:1});}
      this.stat.homing++;floater(P.x,P.y-44,'HOMING EMP',c);}
    else{ABIL.st().bub={x:P.x,y:P.y,r:this.SLR,t:this.SLT};this.stat.slow++;floater(P.x,P.y-44,'SLOW-FIELD EMP',c);}
    ABIL.tip('EMP used your power-up: '+(ro==='def'?'SHIELD':ro==='off'?'HOMING':'SLOW-FIELD')+' blast');},
  /* the power-up slot: trade the held power-up for a dash refill, or (dash full) a fresh drop from the right edge */
  trade(){if(!this.on||!running||paused||!G||G.dead||G.tut||!P)return false;const R=this.r();
    if(G.t<R.cd){floater(P.x,P.y-30,'SLOT '+Math.ceil(R.cd-G.t)+'s','#8c86b8');return false;}
    const h=this.held(true);if(!h){ABIL.tip('Pick up a power-up to trade it');return false;}
    this.take(h);R.cd=G.t+this.CD;this.stat.trade++;const S=ABIL.st(),mx=ABIL.max();AU.sfx('up');
    if(S.n<mx){S.n=mx;S.r=0;P.dashCd=0;this.stat.tRef++;floater(P.x,P.y-30,'DASH REFILL','#19e3ff');}
    else{G.pk.push({t:'pw',k:PW.pick(),x:W-12,y:clamp(P.y+rnd(-120,120),60,H-60),vx:-170,vy:0,bob:0});this.stat.tSpawn++;floater(P.x,P.y-30,'NEW DROP',this.col(h.k));}
    ABIL.tip('Power-up slot: trade a power-up for dash or a new drop');return true;},
  tick(dt){if(!this.on||!G||!P||!running)return;const R=this.r(),S=ABIL.st();
    if(R.trT>G.t&&!G.dead){S.trail.push({x:P.x,y:P.y,t:.7});this.stat.trail++;}
    if(R.res&&P.emp<=0&&!G.dead){R.res=0;P.emp=1;this.stat.resIn++;floater(P.x,P.y-24,'RESERVE EMP','#ffb020');}
    if(R.shT>0)R.shT-=dt;this.chip();},
  /* the touch chip: shown while a power-up is held */
  chip(){const b=$('bPwr');if(!b)return;const h=G&&!G.dead&&touchUI?this.held(true):null,R=G?this.r():null,show=!!h;
    if(b.hidden===show)b.hidden=!show;if(!h)return;const c=this.col(h.k),k=h.k+'|'+(G.t<R.cd?1:0);if(b._k!==k){b._k=k;b.style.setProperty('--pc',c);b.classList.toggle('cd',G.t<R.cd);}},
  draw(){if(!this.on||!G||!G.abx||!P)return;const R=G.abx;if(R.shT>0){ctx.save();ctx.globalAlpha=.3+.4*Math.min(1,R.shT);ctx.strokeStyle=R.shC||'#7fd8ff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(P.x,P.y,34,0,7);ctx.stroke();ctx.restore();}
    if(R.res){ctx.save();ctx.globalAlpha=.8;ctx.fillStyle='#ffb020';ctx.beginPath();ctx.arc(P.x-18,P.y+22,3.5,0,7);ctx.fill();ctx.restore();}}
};
if(ABUP.on){
  RET.sioKeys&&RET.sioKeys.push('mnr_abup');
  const ER0=window.TIM?Object.assign({},TIM.ER):null;
  /* DASH: the double hop, the trail window and the PERFECT refund */
  {const d0=ABIL.dashIn;ABIL.dashIn=function(ts,mx,my,dt){if(!ABUP.on||!G)return d0.apply(this,arguments);const X=ABUP,R=X.r(),S=this.st(),TM=window.TIM&&TIM.on;
    if(ts&&X.has('dd')&&R.dd>G.t&&P.dashT<=0){R.dd=0;
      if(S.n>=1&&(!TM||TIM.heat('d',true))){S.n--;P.dashT=X.DDH;P.dashSh=9;if(!(mx||my)){const d=dashSafeDir();P.dx=d[0];P.dy=d[1];}AU.sfx('dash');X.stat.dd++;floater(P.x,P.y-30,'DOUBLE','#19e3ff');X.tip('dd');}
      return d0.call(this,0,mx,my,dt);}
    const n0=this.stat.dash,pf0=TM?TIM.stat.pf:0,pa0=TM?TIM.stat.parry:0;d0.apply(this,arguments);if(this.stat.dash===n0)return;
    const j=J.last;if(!j||j.kind!=='dash'||!j.ok)return;
    if(X.has('dd'))R.dd=G.t+X.DDW;
    if(X.has('trail')){R.trT=G.t+X.TRW;X.tip('trail');}
    const pf=TM?TIM.stat.pf>pf0:Math.abs(j.dt)<=winMs()*.6;
    if(pf&&X.has('pref')&&!(TM&&TIM.stat.parry>pa0)){const m=this.max();if(S.n<m){S.n++;X.stat.pref++;floater(P.x,P.y-44,'REFUND','#ffffff');X.tip('pref');}}};}
  /* EMP: the reserve charge takes the meter's overflow (the grit bucket already paid for it) */
  {const g0=ABIL.gain;ABIL.gain=function(v,src,e){if(!ABUP.has('ecap')||!G||P.emp<3)return g0.apply(this,arguments);const R=ABUP.r();if(R.res)return g0.apply(this,arguments);
    const S=this.st(),m0=S.m;P.emp=2;S.m=R.rm;g0.apply(this,arguments);if(P.emp>=3){R.res=1;R.rm=0;ABUP.stat.res++;ABUP.tip('ecap');}else R.rm=S.m;P.emp=3;S.m=Math.max(m0,1);};}
  {const e0=ABIL.emp;ABIL.emp=function(){if(!ABUP.on||!G)return e0.apply(this,arguments);const n0=this.stat.emp,b0=G.eb.length,w0=window.TIM?TIM.stat.waste:0;
    e0.apply(this,arguments);if(this.stat.emp===n0||(window.TIM&&TIM.on&&TIM.stat.waste>w0))return;ABUP.after(Math.max(0,b0-G.eb.length));};}
  {const a0=ABIL.draw;ABIL.draw=function(){a0.apply(this,arguments);ABUP.draw();};}
  NR.on('tick',dt=>ABUP.tick(dt));
  NR.on('pickup',()=>{if(!ABUP.on||!G||G.dead)return;const S=ABIL.st(),m=ABIL.max();if(S.n>=m)return;S.r+=ABUP.PKD;ABUP.stat.pkDash++;if(S.r>=1){S.r-=1;S.n++;}});
  NR.on('runStart',()=>{if(G)G.abx=null;if(window.TIM&&ER0)TIM.ER=ABUP.has('erad')?{1:Math.round(ER0[1]*ABUP.ER_K),2:Math.round(ER0[2]*ABUP.ER_K),3:ER0[3]}:Object.assign({},ER0);});
  /* the power-up slot: a touch chip before EMP (hold = trade), Q on a keyboard */
  {const t=$('touch'),e=$('bEmp');if(t&&e){const b=document.createElement('button');b.id='bPwr';b.type='button';b.hidden=true;b.setAttribute('aria-label','Power-up slot: tap to trade');
      b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l3 7h7l-5.5 4.5 2 7.5L12 16.5 5.5 21l2-7.5L2 9h7z" fill="currentColor"/></svg>';t.insertBefore(b,e);
      let dn=0;const pop=()=>{b.classList.remove('pop');void b.offsetWidth;b.classList.add('pop');};
      b.addEventListener('pointerdown',ev=>{ev.preventDefault();ev.stopPropagation();dn=1;pop();});   // tap = trade (the 20 s slot cooldown guards a slip); feedback on press
      b.addEventListener('pointerup',ev=>{ev.preventDefault();ev.stopPropagation();if(dn){dn=0;ABUP.trade();}});
      b.addEventListener('click',ev=>{ev.stopPropagation();if(ev.detail===0)ABUP.trade();});   // keyboard / assistive click
      for(const k of['pointercancel','pointerleave'])b.addEventListener(k,()=>{dn=0;});}}
  addEventListener('keydown',e=>{if(e.code==='KeyQ'&&!e.repeat&&running&&!(e.target&&e.target.tagName==='INPUT'))ABUP.trade();});
  {const st=document.createElement('style');st.textContent=`#touch button#bPwr{min-width:44px;min-height:44px;width:min(var(--bs),48px);height:min(var(--bs),48px);border-radius:50%;border:2px solid var(--pc,#ffe14d);background:#05030cb0;color:var(--pc,#ffe14d);font-size:0;padding:9px;display:flex;align-items:center;justify-content:center}
#touch button#bPwr[hidden]{display:none}#touch button#bPwr svg{width:100%;height:100%}#touch button#bPwr.cd{opacity:.45}#touch button#bPwr.pop{animation:pwPop .22s ease-out}@keyframes pwPop{0%{transform:scale(1)}40%{transform:scale(1.28)}100%{transform:scale(1)}}
#gaCards .card .abI{width:34px;height:34px;flex:0 0 34px}`;document.head.appendChild(st);}
  /* Garage tab ABILITY */
  {const tb=garageEl.querySelector('.tabs'),b=document.createElement('button');b.className='go dim';b.dataset.t='abil';b.type='button';b.textContent='ABILITY';tb.appendChild(b);b.addEventListener('click',()=>{GA.tab='abil';gaDraw();});}
  {const gd=gaDraw;gaDraw=function(){if(GA.tab!=='abil')return gd.apply(this,arguments);if(garageEl.hidden&&window.labEl&&!labEl.hidden)return gd.apply(this,arguments);
    $('gaBank').innerHTML=neonI+' <b id="gaBankN">'+GA.bank+'</b>';for(const t of garageEl.querySelectorAll('.tabs button'))t.classList.toggle('on',t.dataset.t==='abil');
    const gp=$('gaPic');if(gp)gp.style.display='none';const box=$('gaCards');box.innerHTML='';box.classList.remove('fgbox','wpt');box.classList.add('tune');
    for(const u of ABUP.U){const own=ABUP.own[u.id]===1,c=document.createElement('button');c.type='button';c.className='card'+(own?' max':GA.bank<u.p?' no':'');c.style.setProperty('--c',own?'#8c86b8':u.c);c.dataset.id='ab_'+u.id;c.dataset.kind='abup';
      const pic=window.ART&&ART.rd&&ART.rd.has('abup-'+u.id+'.webp')?`<img class="abI" src="${ART.base}abup-${u.id}.webp" alt="" decoding="async">`:svgI(u.ic,u.c);
      c.innerHTML=pic+`<div class="tx"><div class="n">${u.n}</div><div class="t">${u.t}</div></div><div class="pr">${own?'OWNED':neonI+' '+u.p}</div>`;
      c.addEventListener('click',()=>{if(own){gaMsg(u.n+' is yours');return;}if(GA.bank<u.p){c.classList.remove('shake');void c.offsetWidth;c.classList.add('shake');gaMsg('Need '+(u.p-GA.bank)+' more Neon');return;}
        if(ABUP.buy(u.id)){AU.sfx('up');gaMsg(u.n+' unlocked');gaDraw();}});box.appendChild(c);}
    try{$('gaBtn').innerHTML='GARAGE '+neonI.replace('class="nI"','class="nI" style="color:#fff"')+' '+GA.bank;}catch(e){}};}
}
ABUP.T={get GA(){return GA;},gsave:()=>gsave(),open:f=>openGarage(f),close:()=>closeGarage(),emit:(n,d)=>NR.emit(n,d)};   // test handle
window.__abup=ABUP;
