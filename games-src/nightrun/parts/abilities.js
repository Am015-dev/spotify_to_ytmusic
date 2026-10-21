// PURPOSE: DASH charges and EMP as abilities (beat bonus, refund)
// FLAG: abil (?abil=0)
// TEST: abil-test.js
/* ---------- DASH + EMP abilities (flag RET.abil, ?abil=0 = the old dash and EMP exactly). b.js calls ABIL.dashIn() and ABIL.emp() where it read the keys.
   DASH: charges (3, 4 from LV3) that refill one at a time (1.7 s at LV1 .. 1.2 s at LV5), fires on the press in the move / last stick direction.
     On the beat it pays the old bonus (score, ON BEAT, tier +3) and refunds a fifth of a charge; off the beat it is a plain dash (no tier drop).
     LV1-5 = 1 + the shop's extra-dash upgrade (SH.dmax) + 1 for a running power-up at LV3, +2 at LV5.
     The running timed power-up (G.pw.act) gives the dash a trait:
       NOVA / DRUM / TEMPO       burn trail: the path burns ordinary enemies that cross it
       CHORD / CRATE / LEECH     shield ram: hits what it touches, strips zoo shields (e.sh), elites take double
       SLICE / ECHO / RICOCHET   phase: bullets it passes turn into shards; a kill during the dash refunds a charge
       WINGMATES                 decoy: an afterimage stays behind 1.2 s and newly aimed shots go for it
       MAGNET BASS / SLOW        magnet: pickups near the path fly to the ship
   EMP: P.emp charges (3 max) as before, plus a meter that fills from kills, grazes, on-beat dashes and power-up pickups (x.35 on Legend; the dash refills up to 1.4x slower there).
     Every EMP clears the bullets and hits like the old one (10 / boss 25, booked by the same caps); the running power-up adds:
       NOVA          shockwave: the cleared bullets become shards (8 at most)
       SLICE / SLOW  slow bubble: 2.5 s, bullets inside move at 35%
       WING / ECHO   chain lightning: 4-7 jumps over the nearest enemies, ground units included (bosses take 2)
       DRUM / TEMPO / RICOCHET / CRATE   overdrive: 3 s of extra volleys from the equipped weapons, no heat
       CHORD / BOMB  core breaker: boss shield cores lose 60% of their hull (the boss itself and armour.js caps untouched)
       MAGNET        every pickup on screen flies in
   Nothing here writes e.hp upwards or touches DMG / armour caps: EMP damage is dealt where the old EMP dealt it, dash damage goes in as player shots (zap). Test: nightrun/abil-test.js. */
if(RET.abil===undefined)RET.abil=!/[?&]abil=0/.test(location.search);
const ABIL=window.ABIL={get on(){return!!RET.abil;},
  stat:{dash:0,onb:0,burn:0,ram:0,phase:0,refund:0,decoy:0,mag:0,emp:0,conv:0,slow:0,chain:0,od:0,core:0,fill:0},
  MOD:{nova:'burn',drum:'burn',tempo:'burn',chord:'ram',crate:'ram',leech:'ram',slice:'phase',echo:'phase',ric:'phase',wing:'decoy',magb:'mag',slow:'mag'},
  EMOD:{nova:'wave',slice:'bubble',slow:'bubble',wing:'chain',echo:'chain',drum:'od',tempo:'od',ric:'od',crate:'od',chord:'core',bomb:'core',magb:'pull',leech:'chain'},
  FILL:{easy:1.2,normal:1,hard:.7,vhard:.5,legend:.35},RK:{hard:1.15,vhard:1.3,legend:1.4},   // hard tiers: slower EMP meter and dash refill, so Legend does not get easier
  st(){return G.ab||(G.ab={n:3,r:0,trail:[],dec:null,rings:[],bub:null,arcs:[],od:0,odT:0,hit:null,ref:0,ph:0,m:0,tip:0});},
  keys(){return G.pw?G.pw.act.map(a=>a.k):[];},
  pwLv(){let m=0;if(G.pw)for(const a of G.pw.act)m=Math.max(m,a.l3||1);return m;},
  lv(){const m=this.pwLv();return Math.max(1,Math.min(5,1+(SH.dmax|0)+(m>=5?2:m>=3?1:0)));},
  max(){return this.lv()>=3?4:3;},
  refill(){return(1.7-.12*(this.lv()-1))*(this.RK[SET.diff]||1)*(window.TIM&&TIM.on?TIM.RF:1);},   // timing.js: charges refill slower, a parry refunds its charge
  mods(map){const o={};for(const k of this.keys())if(map[k])o[map[k]]=1;return o;},
  dashMod(){const k=this.keys();for(let i=k.length-1;i>=0;i--)if(this.MOD[k[i]])return this.MOD[k[i]];return'';},
  /* b.js: replaces the beat-snapped dash. ts = the press stamp (or undefined), mx/my = the keys this frame */
  dashIn(ts,mx,my,dt){const S=this.st(),mx0=this.max();S.n=Math.min(S.n,mx0);
    if(S.n<mx0){S.r+=dt/this.refill();if(S.r>=1){S.r=0;S.n++;}}else S.r=0;
    const TM=window.TIM&&TIM.on;if(ts&&TM&&P.dashT<=0&&!TIM.heat('d',TIM.pk(judge(ts))))ts=0;   // W49: every press heats; overheat locks both buttons
    if(ts&&S.n>=1&&P.dashT<=0&&(!TM||TIM.ready())){S.n=Math.max(0,S.n-1);const j=judge(ts);P.dashT=.2;if(!(mx||my)&&G.t-P.mvT>.3){const d=dashSafeDir();P.dx=d[0];P.dy=d[1];}AU.sfx('dash');P.dashPf=j.ok;this.stat.dash++;J.n++;
      J.last={kind:'dash',ok:j.ok,dt:Math.round(j.dt),beat:j.beat,at:performance.now()};
      if(j.ok){this.stat.onb++;G.score+=Math.round(200*G.mult*comboK());onPerfect('dash',j,P.x,P.y);if(!TM){S.r+=.2;if(S.r>=1&&S.n<mx0){S.r-=1;S.n++;}}this.gain(.04);if(!TIP.done){TIP.done=true;save('mnr_tipdone',true);}}
      if(TM)TIM.dash(j,S);S.hit=new Set();S.ref=0;S.ph=0;const m=this.dashMod();S.mod=m;
      if(m==='decoy'){S.dec={x:P.x,y:P.y,t:1.2};this.stat.decoy++;}
      if(m)floater(P.x,P.y-30,{burn:'BURN',ram:'RAM',phase:'PHASE',decoy:'DECOY',mag:'MAGNET'}[m],'#19e3ff');}
    P.dashCd=S.n>=1?0:(1-S.r)*this.refill();},   // the old field still tells bots and the HUD when the next dash is ready
  gain(v,src,e){if(!this.on||!G||G.dead)return;if(window.TIM&&TIM.blocked())return;if(window.GRIT&&GRIT.on){v=GRIT.emp(v,src,e);if(!(v>0))return;}const S=this.st();if(P.emp>=3){S.m=1;return;}S.m+=v*(this.FILL[SET.diff]||1)*(window.TIM&&TIM.on?TIM.EF:1);this.stat.fill+=v;
    if(S.m>=1){S.m-=1;P.emp=Math.min(3,P.emp+1);floater(P.x,P.y-24,'EMP +1','#ffb020');AU.sfx('up');S.ping=.6;
      if(!this.tipE){this.tipE=1;this.tip('EMP charged: tap EMP');}}},
  tip(t){try{const o=load('mnr_abiltip',{})||{};if(o[t]||G.tut||G.lab)return;o[t]=1;save('mnr_abiltip',o);hintShow(t,4);}catch(e){}},
  /* b.js: the EMP key or button */
  emp(){if(window.TIM&&TIM.on&&!TIM.heat('e')){return;}if(P.emp<=0){AU.sfx('heat');return;}const S=this.st(),M=this.mods(this.EMOD),lv=this.lv();let TT=null;
    if(window.TIM&&TIM.on){TT=TIM.emp(M);if(!TT){AU.sfx('heat');return;}}else P.emp--;this.stat.emp++;   // timing.js: one press spends every held charge, the burst grows with them
    G.empT=.6;if(!SET.reduce)G.flash=Math.max(G.flash,.3*FX());shake(SET.reduce?3:9);AU.sfx('emp');
    S.rings.push({x:P.x,y:P.y,r:0,R:TT?Math.min(TT.R||900,900):M.wave?520:360,t:0,c:M.wave?'#ff5fd2':'#ffb020'});
    let sh=0;const shM=TT?4+4*TT.n:8,TR=TT?TT.R:0,out=TR?(b=>Math.hypot(b.x-P.x,b.y-P.y)>TR):(()=>false);for(const b of G.eb){if(out(b))continue;if(M.wave&&sh<shM&&b.x>0&&b.x<W){G.pk.push({t:'shard',x:b.x,y:b.y,vx:rnd(-60,0),vy:rnd(-40,40),bob:0});sh++;this.stat.conv++;}else burst(b.x,b.y,'#19e3ff',2,80,.4);G.score+=M.wave?10:5;}G.eb=TR?G.eb.filter(out):[];
    G.en.forEach(e=>{if(e.type!=='boss')e.hp-=10;else e.hp-=25;e.flash=.2;});if(G.boss)G.boss.lasers=[];
    if(M.bubble){S.bub={x:P.x,y:P.y,r:180,t:2.5};this.stat.slow++;}
    if(M.chain){let x=P.x,y=P.y;const done=new Set(),N=M.wide?99:3+lv,RR=M.wide?2000:520;S.arcs=[];for(let i=0;i<N;i++){let best=null,bd=1e9;
        for(const e of G.en){if(done.has(e)||e.dead||e.hp<=0||e.dying)continue;const d=Math.hypot(e.x-x,e.y-y);if(d<bd&&d<RR){bd=d;best=e;}}
        if(!best)break;done.add(best);best.hp-=best.type==='boss'?2:8;best.flash=.2;S.arcs.push({x0:x,y0:y,x1:best.x,y1:best.y,t:.35});x=best.x;y=best.y;this.stat.chain++;}}
    if(M.od){S.od=3;this.stat.od++;}
    if(M.core&&G.boss&&G.boss.cores)for(const c of G.boss.cores){if(c.dead||c.hp<=0)continue;c.hp-=Math.ceil((c.max||c.hp)*.6);c.flash=.3;this.stat.core++;}
    if(M.pull)for(const p of G.pk){p.x=P.x;p.y=P.y;this.stat.mag++;}},
  tick(dt){if(!this.on||!G||!P||!running)return;const S=this.st(),k=.8+.1*this.lv();if(S.ping>0)S.ping-=dt;if(touchUI&&typeof setRing==='function')this.rings();
    if(P.dashT>0&&S.mod){
      if(S.mod==='burn'){S.trail.push({x:P.x,y:P.y,t:.7});}
      for(const e of G.en){if(e.dead||e.hp<=0||e.dying||e.gr||S.hit.has(e))continue;if(Math.hypot(e.x-P.x,e.y-P.y)>(e.r||14)+20)continue;
        if(S.mod==='ram'){S.hit.add(e);const d=(e.type==='boss'?2:6*k)*(e.el?2:1);this.zap(e,d);e.flash=.15;if(e.sh)e.sh=0;if(e.shl)e.shl=0;burst(e.x,e.y,'#a98bff',6,180,.3);this.stat.ram++;if(e.hp<=d)this.kref(S);}
        else if(S.mod==='phase'&&e.hp<=3&&e.type!=='boss'){S.hit.add(e);this.zap(e,3);this.kref(S);}}
      if(S.mod==='phase')for(const b of G.eb){if(b.dead||Math.hypot(b.x-P.x,b.y-P.y)>40)continue;b.dead=1;if(S.ph<4){G.pk.push({t:'shard',x:b.x,y:b.y,vx:-40,vy:0,bob:0});S.ph++;}G.score+=Math.round(30*G.mult);this.stat.phase++;}
      if(S.mod==='mag')for(const p of G.pk){if(Math.hypot(p.x-P.x,p.y-P.y)<180&&!p.ab){p.ab=1;p.x=P.x;p.y=P.y;this.stat.mag++;}}}
    for(const t of S.trail){t.t-=dt;for(const e of G.en){if(e.dead||e.hp<=0||e.gr||e.type==='gate')continue;if(Math.hypot(e.x-t.x,e.y-t.y)<(e.r||14)+14){e._bn=(e._bn||0)+(e.type==='boss'?.5:4)*k*dt;if(e._bn>=1){this.zap(e,e._bn);e._bn=0;}e.flash=.05;this.stat.burn++;}}}
    S.trail=S.trail.filter(t=>t.t>0);if(S.trail.length>40)S.trail.splice(0,S.trail.length-40);
    if(S.dec){S.dec.t-=dt;if(S.dec.t<=0)S.dec=null;else for(const b of G.eb){if(b._ab)continue;b._ab=1;const sp=Math.hypot(b.vx,b.vy);if(sp<1)continue;
        const ax=P.x-b.x,ay=P.y-b.y,al=Math.hypot(ax,ay)||1;if((b.vx*ax+b.vy*ay)/(sp*al)>.97){const dx=S.dec.x-b.x,dy=S.dec.y-b.y,dl=Math.hypot(dx,dy)||1;b.vx=dx/dl*sp;b.vy=dy/dl*sp;this.stat.decoy++;}}}
    else for(const b of G.eb)b._ab=1;
    if(S.bub){S.bub.t-=dt;if(S.bub.t<=0)S.bub=null;else for(const b of G.eb)if(Math.hypot(b.x-S.bub.x,b.y-S.bub.y)<S.bub.r){b.x-=b.vx*dt*.65;b.y-=b.vy*dt*.65;}}
    if(S.od>0){S.od-=dt;S.odT-=dt;P.heat=Math.max(0,P.heat-60*dt);P.over=false;const firing=SET.auto||K.Space||K.KeyJ||touchFire;
      if(firing&&S.odT<=0&&!G.dead){S.odT=.12;SH.volley(P.x+22,P.y+2,0);}}
    for(const r of S.rings){r.t+=dt;r.r=r.R*Math.min(1,r.t/.35);}S.rings=S.rings.filter(r=>r.t<.5);
    for(const a of S.arcs)a.t-=dt;S.arcs=S.arcs.filter(a=>a.t>0);},
  zap(e,d){if(typeof pbRoom==='function'&&!pbRoom(1))return;G.pb.push({x:e.x,y:e.y,vx:1,vy:0,dm:d,pf:0,ab:1});},   // damage from tick() goes in as a player shot, so DMG.hit, DMG.pass and the armour cap book it like any other
  kref(S){if(S.ref)return;S.ref=1;S.n=Math.min(this.max(),S.n+1);this.stat.refund++;floater(P.x,P.y-40,'DASH +1','#19e3ff');},
  /* c.js: the two touch button rings (charge ring + count) */
  rings(){const S=this.st(),mx=this.max();setRing($('bDash'),Math.min(1,(S.n+(S.n<mx?S.r:0))/mx),S.n?'#19e3ff':'#5a6b7a',S.n);
    setRing($('bEmp'),P.emp>=3?1:Math.min(1,(P.emp+S.m)/3),P.emp?'#ffb020':'#7a6a4a',P.emp);
    const e=$('bEmp'),d=$('bDash');if(e)e.classList.toggle('abRdy',P.emp>0);if(d)d.classList.toggle('abRdy',S.n>0);},
  draw(){if(!this.on||!G||!G.ab)return;const S=G.ab;ctx.save();ctx.lineCap='round';
    if(S.trail.length>1){ctx.strokeStyle='#ff8a3d';ctx.globalAlpha=.55;ctx.lineWidth=10;ctx.beginPath();S.trail.forEach((t,i)=>i?ctx.lineTo(t.x,t.y):ctx.moveTo(t.x,t.y));ctx.stroke();}
    if(S.dec){ctx.globalAlpha=.35+.3*Math.sin(G.t*30);ctx.strokeStyle='#ffd23d';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(S.dec.x+18,S.dec.y);ctx.lineTo(S.dec.x-14,S.dec.y-11);ctx.lineTo(S.dec.x-8,S.dec.y);ctx.lineTo(S.dec.x-14,S.dec.y+11);ctx.closePath();ctx.stroke();}
    for(const r of S.rings){ctx.globalAlpha=Math.max(0,1-r.t/.5);ctx.strokeStyle=r.c;ctx.lineWidth=6;ctx.beginPath();ctx.arc(r.x,r.y,r.r,0,7);ctx.stroke();}
    if(S.bub){ctx.globalAlpha=.18+.1*Math.min(1,S.bub.t);ctx.fillStyle='#00e5c3';ctx.beginPath();ctx.arc(S.bub.x,S.bub.y,S.bub.r,0,7);ctx.fill();ctx.globalAlpha=.6;ctx.strokeStyle='#00e5c3';ctx.lineWidth=2;ctx.stroke();}
    for(const a of S.arcs){ctx.globalAlpha=a.t/.35;ctx.strokeStyle='#7df9ff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(a.x0,a.y0);const mx=(a.x0+a.x1)/2+rnd(-14,14),my=(a.y0+a.y1)/2+rnd(-14,14);ctx.lineTo(mx,my);ctx.lineTo(a.x1,a.y1);ctx.stroke();}
    if(S.od>0&&P){ctx.globalAlpha=.5;ctx.strokeStyle='#ffe14d';ctx.lineWidth=3;ctx.beginPath();ctx.arc(P.x,P.y,26+3*Math.sin(G.t*20),0,7);ctx.stroke();}
    ctx.restore();}
};
{const st=document.createElement('style');st.textContent=`#touch button#bDash,#touch button#bEmp{min-width:48px;min-height:48px}
#touch button#bDash::after,#touch button#bEmp::after{font-size:15px}
#touch button.abRdy#bEmp{filter:drop-shadow(0 0 6px #ffb020)}#touch button.abRdy#bDash{filter:drop-shadow(0 0 5px #19e3ff)}`;document.head.appendChild(st);}
ART.uiIcons=()=>{const q=[['dash','Dash'],['emp','Emp']].filter(k=>ART.rd&&ART.rd.has('ui-'+k[0]+'-icon.webp')),rg=[['R','ready'],['E','empty'],['C','charge']].filter(k=>ART.rd&&ART.rd.has('fx-w34-ui-ring-'+k[1]+'.webp'));if(!q.length&&!rg.length||ART.uiDone)return;ART.uiDone=1;const st=document.createElement('style');
  st.textContent=rg.map(k=>'#touch button.rg'+k[0]+'::after{background:center/100% 100% no-repeat url('+ART.base+'fx-w34-ui-ring-'+k[1]+'.webp);-webkit-mask:none;mask:none;mix-blend-mode:screen}').join('')+q.map(k=>'#touch button#b'+k[1]+'{background:center/62% no-repeat url('+ART.base+'ui-'+k[0]+'-icon.webp)}').join('');document.head.appendChild(st);};   // W34: real DASH / EMP icons, only when listed in ready.json
if(ART.rd)ART.uiIcons();
NR.on('tick',dt=>ABIL.tick(dt));
NR.on('kill',d=>{if(!ABIL.on||!d||d.boss)return;const e=d.e||{};ABIL.gain(e.el||e.type==='gunship'?.08:.035,'kill',e);});
NR.on('graze',d=>ABIL.gain(d&&d.pf?.07:.04,'graze'));
NR.on('pickup',()=>ABIL.gain(.34,'pickup'));
NR.on('runStart',()=>{if(ABIL.on)setTimeout(()=>{if(running&&G&&!G.dead)ABIL.tip('DASH has charges, EMP fills from kills');},4000);});
