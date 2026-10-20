/* ---------- TIMING: DASH and EMP as beat-and-window decisions (flag RET.timing, default ON, ?timing=0 = off; off = the abilities.js / counter.js behaviour). Test: nightrun/timing-test.js.
   Owner, 20 Oct 2026: dash and EMP "still useless, the game needs to be more strategic and timing". Strict review 3: a reflex dash (bullet within 30 px) won, the beat paid nothing.
   DASH (hooks in ABIL.dashIn):
     dead on the beat (inner 60% of the judge window) = PARRY: every marked shot due within .45 s and every bullet within 110 px flies back as a player shot (marked 40, plain 5),
       i-frames grow to .5 s and, if it caught anything, the charge comes back in full. A beat dash into empty air costs its one charge.
     in the outer part of the window = GOOD: the same short hop for one charge.
     off the beat = emergency escape: a short unshielded hop (.09 s instead of .2 s; it still crosses laser walls), costs 2 charges (the 2nd as refill debt if there is none) and locks the dash for .45 s; no parry beyond counter.js' last-moment window.
     late twice in a row breaks the chain (combo tier drop, CHAIN BROKEN).
   EMP (hook in ABIL.emp): one press spends ALL held charges; the burst grows with them:
     1 = bullets within 160 px turn to shards, 2 = 320 px + slow bubble, 3 = the whole screen + elite / warden / boss-core shield strip and a screen-wide chain.
     With < 4 bullets inside the burst (and no curtain or shield) the charges are WASTED. Meter: grazes, parries, kills (abilities.js gain, x.35 on Legend).
     The EMP button shows the held tier (data-t) and a hint (hintShow, so the hint diet applies) says when holding 3 is worth it.
   Beat cue: a closing ring on the DASH button that turns solid inside the window (reduced motion: no growth, only the colour); the ship ring in fx.js already pulses to the beat.
   Damage goes in as player shots (DMG / armour caps book it); bullets only ever leave G.eb (ebCap, BCAP untouched). */
if(RET.timing===undefined)RET.timing=!/[?&]timing=0/.test(location.search);   // ON by default (review 4: beat 100%, reflex 67%, no dash 17%); ?timing=0 = old abilities
const TIM=window.TIM={get on(){return!!(RET.timing&&window.ABIL&&ABIL.on);},
  stat:{hot:0,lock:0,ew:0,ewe:0,good:0,pfx:0,pf:0,parry:0,refl:0,mark:0,off:0,panic:0,late:0,brk:0,emp:0,e1:0,e2:0,e3:0,waste:0,used:0},
  R:110,PEN:.45,HOP:.04,PK:.4,ER:{1:160,2:320,3:0},PANIC:60,NEED:[4,99,12,5],PLOCK:2,WLOCK:15,GREF:.2,RF:2.4,EF:.5,CH:6,CHCD:20,   // W39: CH/CHCD = CH parries in a row (an off-beat press resets the run) repair 1 hull, once per CHCD s; RF = dash refill x2.4 (a parry still refunds its charge, so beat play stays full and spam runs dry), EF = EMP meter x.5 (owner: EMP charged too fast)
     // PK: the parry window is the inner 60% of the beat window; HOP: length of an off-beat / GOOD dash in s (a full dash is .2 s), unshielded (b.js hurt() and the bullet loop read P.dashSh); ER: EMP clear radius by charges spent (0 = whole screen)
  /* W49 (owner: "emp and dash useless... more strategic and timing"): mashing costs, EMP gets decision moments, the beat is taught.
     HEAT: every DASH / EMP press adds heat (HD dash, HP for a dead-on-beat dash, HE EMP), it cools HC per s; above HX both buttons lock HL s (button flashes, OVERHEAT).
     ASSIST: story stages 1-3 below Hard (and SET.tassist) widen the parry part of the window (PKA instead of PK).
     EMP WINDOW: every EWI s of stage time (not bosses / tutorial / Lab) an OVERLOAD: an EWT s prompt ring round the ship + the EMP button,
       a charge if none is held (below Hard), then a ring of EWN slow bullets closes in with one gap: EMP it (shards + score), parry it on the beat, or find the gap.
     OFFC: charges an off-beat hop with a bullet near costs (W39: 2). */
  HD:1,HP:.5,HE:1.5,HC:.8,HX:3.5,HL:2,PKA:.6,EWI:90,EW0:35,OHC:40,EWT:1.4,EWN:14,EWR:250,EWV:105,OFFC:1,
  easyT(){return typeof HARDS==='undefined'||!HARDS.includes(SET.diff);},   // Hard+ get no assist and no free OVERLOAD charge (Legend must not get easier)
  pkW(){return(SET.tassist||(window.ST&&ST.on&&ST.n<=3&&this.easyT()))?this.PKA:this.PK;},
  pk(j){return SET.all||Math.abs(j.dt)<=winMs()*this.pkW()&&j.ok;},
  /* a DASH / EMP press: k 'd' | 'e', on = dead on the beat; false = locked by heat (the press does nothing) */
  heat(k,on){if(!this.on)return true;const T=this.st();if(T.hl>0){if(k==='d')this.stat.hot++;return false;}
    T.h=(T.h||0)+(k==='e'?this.HE:on?this.HP:this.HD);if(T.h>this.HX){T.h=0;T.hl=this.HL;this.stat.lock++;P.emp=0;if(P.hp>1&&G.t-(T.oh||-99)>=this.OHC){T.oh=G.t;P.hp--;this.stat.burn=(this.stat.burn||0)+1;}floater(P.x,P.y-30,say('OVERHEAT'),'#ff5050');AU.sfx('heat');return false;}return true;},
  
  st(){return G.tm||(G.tm={pen:0,late:0,ch:0,hint:0,em:0});},
  near(){let tg=null,bd=1e9;for(const e of G.en){if(e.dead||e.hp<=0||e.gr||e.dying)continue;const d=Math.hypot(e.x-P.x,e.y-P.y);if(d<bd){bd=d;tg=e;}}return tg;},
  blocked(){return this.on&&G.tm&&G.tm.em>0;},
  ready(){return!this.on||!G.tm||G.tm.pen<=0;},
  /* ABIL.dashIn, after the charge is taken: j = judge(ts), S = ABIL.st() */
  dash(j,S){const T=this.st(),mx=ABIL.max(),pk=this.pk(j);P.dashSh=pk?0:9;   // only a dead-on-beat dash is shielded
    if(!pk){P.dashT=this.HOP;if(window.CTR)CTR.dash();}   // the rest is a short hop (b.js only calls CTR.dash for a full .2 s dash): it still vents and catches a last-moment seeker
    if(j.ok&&!pk){T.late=0;this.stat.good++;floater(P.x,P.y-30,say('GOOD'),'#19e3ff');return;}   // GOOD: in the window but not dead on it = a short hop for one charge
    if(j.ok){this.stat.pf++;T.late=0;let n=0,mk=0;const tg=this.near();
      for(const b of G.eb){if(b.dead)continue;const d=Math.hypot(b.x-P.x,b.y-P.y),sp=Math.hypot(b.vx,b.vy)||1,tt=(d-(b.r+3))/sp;
        if(!(b.cxM&&tt<=.45)&&d>this.R)continue;if(n>=14)break;b.dead=1;n++;if(b.cxM)mk++;
        if(typeof pbRoom==='function'&&!pbRoom(1))continue;const t=b.cxM?tg:(this.near()||tg),a=t?Math.atan2(t.y-b.y,t.x-b.x):0;
        G.pb.push({x:b.x,y:b.y,vx:Math.cos(a)*720,vy:Math.sin(a)*720,dm:b.cxM?40:5,pf:1,big:b.cxM?1:0,ab:1,tm:1});
        if(!SET.calm)burst(b.x,b.y,'#ffffff',b.cxM?10:3,200,.3);}
      if(n){G.eb=G.eb.filter(b=>!b.dead);S.n=Math.min(mx,S.n+1);P.inv=Math.max(P.inv,.5);T.ch++;this.stat.parry++;if(T.ch>=this.CH&&G.t-(T.rp||-99)>=this.CHCD&&P.hp<P.max){T.rp=G.t;T.ch=0;P.hp++;this.stat.rep=(this.stat.rep||0)+1;floater(P.x,P.y-62,say('RHYTHM')+' +1','#7dff9a');}this.stat.refl+=n;this.stat.mark+=mk;
        G.score+=Math.round((150*n+(mk?600:0))*G.mult);ABIL.gain(.1+.02*n);floater(P.x,P.y-30,(mk?'PERFECT PARRY!':'PERFECT x'+n),'#ffffff');AU.sfx('up');if(!SET.reduce)shake(3);}
      else{this.stat.pfx++;floater(P.x,P.y-30,say('PERFECT'),'#ffffff');}
      return;}
    this.stat.off++;T.ch=0;T.pen=this.PEN;if(this.OFFC>=2){if(S.n>=1)S.n--;else S.r=Math.min(S.r,0)-.5;}
    const th=G.eb.some(b=>!b.dead&&Math.hypot(b.x-P.x,b.y-P.y)<this.PANIC);   // PANIC: off the beat with no bullet within PANIC px = a wasted button press, locks the dash longer
    if(!th){this.stat.panic++;T.pen=this.PLOCK;S.n=0;S.r=Math.min(S.r,0)-.3;}
    floater(P.x,P.y-30,say(th?'OFF BEAT':'PANIC')+(th&&this.OFFC<2?'':' -2'),'#8c86b8');
    if(j.dt>0){this.stat.late++;if(++T.late>=2){T.late=0;this.stat.brk++;if(typeof tierDrop==='function')tierDrop('late');G.mult=Math.max(1,G.mult*.8);floater(P.x,P.y-48,say('CHAIN BROKEN'),'#ff2d78');}}else T.late=0;},
  /* the burst size an EMP press would have now (all held charges) and whether it would be worth it */
  tier(){return Math.max(0,Math.min(3,P.emp|0));},
  worth(){const t=this.tier(),R=this.ER[t]||9999,nr=o=>t>=2||Math.hypot(o.x-P.x,o.y-P.y)<=R;   // tier 1 only counts what is inside its radius; the shield / wall reasons need a bigger burst or a close target
    return G.eb.filter(b=>Math.hypot(b.x-P.x,b.y-P.y)<=R).length>=this.NEED[t]||(window.CTR&&CTR.on&&(CTR.goodAt===G.t||(t>=2&&CTR.walls.some(w=>w.cur&&w.x<W+10))||G.en.some(e=>e.ctw&&e.wsh&&e.x<W&&nr(e))))||G.en.some(e=>e.el&&(e.sh||e.shl)&&e.x<W&&nr(e))||(G.boss&&G.boss.cores&&G.boss.cores.some(c=>!c.dead&&c.hp>0)&&P.emp>=3);},
  /* ABIL.emp: spends every held charge, returns {n, M} (extra mods for the burst), or null = wasted */
  emp(M){const n=this.tier(),ok=this.worth();P.emp=0;this.stat.emp++;this.stat.used+=n;
    if(!ok){this.stat.waste++;const S=ABIL.st();S.m=0;this.st().em=this.WLOCK;floater(P.x,P.y-30,say('WASTED')+' x'+n,'#8c86b8');return null;}
    this.stat['e'+n]++;{const S=ABIL.st();S.m=Math.min(.6,S.m+this.GREF*n);}   // a good EMP gives part of the meter back
    M.wave=1;if(n>=2)M.bubble=1;if(n>=3){M.chain=1;M.core=1;M.wide=1;
      for(const e of G.en){if(e.dead)continue;if(e.el||e.ctw){if(e.sh)e.sh=0;if(e.shl)e.shl=0;e.flash=.3;}}}
    floater(P.x,P.y-30,'EMP x'+n,n>=3?'#ff5fd2':'#ffb020');return{n,M,R:this.ER[n]||0};},
  /* OVERLOAD window: T.ew = {t: telegraph left, x, y} while the prompt shows; T.en = stage time of the next one */
  ewTick(dt,T){if(G.tut||G.lab||G.dead)return;if(T.en===undefined)T.en=G.t+this.EW0;const busy=G.boss||G.pit||(window.SH&&SH.active);
    if(!T.ew){if(G.t>=T.en){if(busy){T.en=G.t+8;return;}T.ew={t:this.EWT};this.stat.ew++;T.en=G.t+this.EWI*(.85+.3*Math.random());if(P.emp<1&&this.easyT()){P.emp=1;floater(P.x,P.y-44,'EMP +1','#ffb020');}
        this.tip2('OVERLOAD incoming: EMP when the ring closes');}return;}
    T.ew.t-=dt;if(T.ew.t>0)return;T.ew=null;const room=Math.max(0,ebCap()-G.eb.length),n=Math.min(this.EWN,room);if(n<6)return;
    const gap=Math.random()*n|0;for(let i=0;i<n;i++){if(i===gap)continue;const a=i/n*6.283,x=P.x+Math.cos(a)*this.EWR,y=P.y+Math.sin(a)*this.EWR;
      G.eb.push({x,y,vx:-Math.cos(a)*this.EWV,vy:-Math.sin(a)*this.EWV,r:6,c:'#ffb020',g:false,sl:false,hm:0,ew:1});}
    T.ewo=G.t;},
  tip2(t){if(window.ABIL)ABIL.tip(t);},
  draw(){if(!this.on||!G||!G.tm||!P)return;const T=G.tm;ctx.save();
    if(T.ew){const k=Math.max(0,T.ew.t/this.EWT);ctx.strokeStyle='#ffb020';ctx.globalAlpha=.85;ctx.lineWidth=3;ctx.setLineDash([10,8]);ctx.beginPath();ctx.arc(P.x,P.y,40+(this.EWR-40)*k,0,7);ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle='#ffb020';ctx.font='bold 14px sans-serif';ctx.textAlign='center';ctx.fillText(say('OVERLOAD: EMP'),P.x,P.y-52);}
    if(T.hl>0){ctx.strokeStyle='#ff5050';ctx.globalAlpha=SET.reduce?.6:.4+.4*Math.abs(Math.sin(G.t*12));ctx.lineWidth=2;ctx.beginPath();ctx.arc(P.x,P.y,30,0,7);ctx.stroke();}
    ctx.restore();},
  tick(dt){if(!this.on||!G||!P||!running)return;const T=this.st();if(T.pen>0)T.pen-=dt;if(T.em>0)T.em-=dt;
    T.h=Math.max(0,(T.h||0)-this.HC*dt);if(T.hl>0)T.hl-=dt;this.ewTick(dt,T);
    if(!T.coach&&window.ST&&ST.on&&ST.n<=2&&G.t>6&&!G.tut&&!G.lab){T.coach=1;this.tip2('Dash as the ring closes: PERFECT = parry');}
    const d=$('bDash'),e=$('bEmp');
    if(d&&touchUI){const ph=typeof PHF==='number'?PHF:0,ms=(ph<.5?ph:ph-1)*BT.spb*1000,win=SET.all||Math.abs(ms)<=winMs()*this.PK,k=SET.reduce?0:Math.max(0,Math.min(1,(1-ph)));
      d.style.setProperty('--tb',(win?2:3+9*k).toFixed(1)+'px');d.classList.toggle('tmWin',!!win);d.classList.toggle('tmPen',T.pen>0);}
    if(d)d.classList.toggle('tmHot',T.hl>0);if(e)e.classList.toggle('tmHot',T.hl>0);if(e)e.classList.toggle('tmCall',!!T.ew||(T.ewo&&G.t-T.ewo<1.6&&P.emp>0));
    if(e){const t=this.tier();if(e.dataset.t!==String(t))e.dataset.t=t;e.classList.toggle('tmBig',t>=3);}
    if(!T.hint&&P.emp>=2&&!G.tut&&!G.lab){T.hint=1;if(window.ABIL)ABIL.tip('EMP spends all charges: hold 3 for the big burst');}
    if(T.hint===1&&P.emp>=3&&this.worth()&&!G.tut&&!G.lab){T.hint=2;if(window.ABIL)ABIL.tip('Crowded screen: EMP x3 now');}}
};
{const st=document.createElement('style');st.textContent=`#touch button#bDash{box-shadow:0 0 0 var(--tb,0px) rgba(25,227,255,.35)}
#touch button.tmWin#bDash{box-shadow:0 0 0 3px #ffffff}#touch button.tmPen#bDash{opacity:.55}
#touch button#bEmp[data-t]::before{content:'x' attr(data-t);position:absolute;left:50%;top:-16px;transform:translateX(-50%);font:bold 12px sans-serif;color:#ffb020}
#touch button#bEmp[data-t="0"]::before{content:''}#touch button.tmHot{filter:drop-shadow(0 0 8px #ff5050)!important;opacity:.5}#touch button.tmCall#bEmp{box-shadow:0 0 0 4px #ffb020}#touch button.tmBig#bEmp::before{color:#ff5fd2}`;document.head.appendChild(st);}
NR.on('tick',dt=>TIM.tick(dt));
NR.on('runStart',()=>{if(G)G.tm=null;});
