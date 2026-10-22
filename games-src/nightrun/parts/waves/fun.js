// PURPOSE: set pieces, deck replaces the fixed metronome, rosters
// FLAG: deck (?deck=0), songspread (?songspread=0)
// TEST: fun-test.js
/* ---------- FUN pass: something new every ~8-10 s ----------
   SET PIECES   every 6 bars (~12 s) a signature formation per district that moves on the beat (WEAVE) or a LASER FENCE across the screen on the bar line;
                clear one and a shard shower sweeps across the screen
   DROP         every 16 bars: a bar of countdown, then on the downbeat DASH to blow the screen clear (all bullets, +score, +tier, shard shower);
                miss the dash and you still get a small blast round the ship (never a punishment)
   MINI-BOSS    about every 26 bars (~50 s, see dir.js)
   Never touches the music: only game logic, light and a clean effect sound. */
if(RET.deck===undefined)RET.deck=!/[?&]deck=0/.test(location.search);
if(RET.songspread===undefined)RET.songspread=!/[?&]songspread=0/.test(location.search);   // story.js SONGSEL (V10)
const FUN={n:0,sets:[],fence:null,dw:null,ev:null,deck:[],nextAt:22,lastK:'',dropAt:-1,lastDash:-9,pdash:0,shower:0,stat:{sets:0,fences:0,drops:0,dropsHit:0,rewards:0},
  reset(){this.ev=null;this.deck=[];this.nextAt=20+gr(0,6);this.lastK='';this.n=0;this.sets=[];this.fence=null;this.dw=null;this.dropAt=-1;this.lastDash=-9;this.pdash=0;this.shower=0;},
  ROWS:[30,90,150,210,270,330,390,450,510],
  /* the bot (sweep.js / d-sim.js) asks: is a ship at height y on a firing beam row? */
  cost(y){const l=this.ev;if(l&&l.k==='lane'&&Math.abs(y-l.y)<l.h/2+12)return 3000;const f=this.fence;if(!f||f.phase<1)return 0;for(const r of f.rows)if(Math.abs(y-r)<26)return 3000;return 0;},
  shardShower(n,x0){for(let i=0;i<n;i++)G.pk.push({t:'shard',x:(x0==null?W-40:x0)+gr(-30,30),y:gr(50,H-50),vx:-gr(120,300),vy:gr(-40,40),bob:0});this.shower=.9;},
  track(f){const n0=G.en.length;f();return G.en.slice(n0);},
  setPiece(){const di=G.di,sig=['turretLine','swarm','wedge','turretLine','phalanx'][di%5],k=Math.floor(this.n/6)%3,t=DIR.tierv();
    const kind=k===1?'fence':k===2?'weave':(PATS[sig]&&PATS[sig].t<=t+.01?sig:'weave');
    if(kind==='fence'){if(!this.fence)this.startFence();return;}
    let es;if(kind==='weave')es=this.track(()=>{const y=FY(150,H-190);for(let i=0;i<6;i++)en('drone',{x:W+30+i*56,y,amp:120,ph:(i%2)*Math.PI});});
    else es=this.track(()=>PATS[kind].f());
    if(es.length){this.sets.push({es,n:es.length,kind});this.stat.sets++;hintShow(say(kind==='weave'?'WEAVE: shoot on the beat':'SET PIECE'),2.4);NR.emit('setpiece',{kind});}},
  startFence(){const gy=clamp(P.y+gr(-80,80),110,H-110),rows=this.ROWS.filter(y=>Math.abs(y-gy)>75);
    this.fence={rows,gy,b0:G.bc,phase:0,fire:0,hit:0};this.stat.fences++;AU.sfx('warn');hintShow(say('LASER FENCE: find the gap'),2.6);},
  bar(){const n=this.n=G.rb;if(PW.on('tempo'))DIR.acc+=.4;if(HARD&&!ST.on&&!G.boss)DIR.acc+=.7;   // Hard: the set pieces and the DROP are extra on top, so the waves keep their bite   // TEMPO UP: faster waves (a bigger wave budget every bar)
    if(G.boss||G.dead||SH.active)return;
    if(RET.deck!==false){this.deckBar(n);return;}   // V1: the event deck replaces the 6-bar metronome and the 16-bar DROP
    if(n>=3&&n%6===3&&DIR.nonBoss()<8&&(ST.on||G.dbar<DIR.bossBar-6))this.setPiece();
    if(n%16===15&&n>=15&&!this.dw){this.dropAt=n+1;this.dropB=G.bc+4;hintShow(say('DROP COMING: DASH ON THE DOWNBEAT'),3.4);}
    if(n%16===0&&n>=16&&this.dropAt===n)this.dropStart();},
  dropStart(){this.dropAt=-1;this.dw={t:G.t,hit:false,until:G.t+.28};if(this.pdash>0||G.t-this.lastDash<.22)this.drop(true);},
  drop(hit){const w=this.dw;if(!w||w.done)return;w.done=1;this.stat.drops++;const T=tierOf(C.n);
    if(hit){this.stat.dropsHit++;const R2=HARD?300*300:1e12;G.eb=G.eb.filter(b=>{if((b.x-P.x)**2+(b.y-P.y)**2<R2){G.score+=5;return false;}return true;});   // on Hard the blast reaches 300 px round the ship, not the whole screen
      
      for(const e of G.en)if(e.type!=='boss'&&e.x<W-10){e.hp-=22;e.flash=.2;}
      const pts=800*T*(1+Math.min(3,Math.floor(G.rb/16)));G.score+=pts;tierSet(C.n+3,'drop');
      G.flash=Math.max(G.flash,.55*FX());shake(14);PW.st().wv=.7;banner('DROP!','+'+pts,false,1.5);floater(P.x,P.y-36,'DROP! ×'+T,'#b36bff');
      this.shardShower(14+4*T);AU.sfx('big');try{const a=AU.a;if(a&&a.state==='running'&&sndOn('reward')){AU.noise(a.currentTime,.7,.35,300,AU.fx,'lowpass');AU.osc(a.currentTime,'sine',140,.5,.6,AU.fx,30);}}catch(e){}this.stat.rewards++;}
    else{let k=0;if(!HARD)G.eb=G.eb.filter(b=>{if(Math.hypot(b.x-P.x,b.y-P.y)<170){G.score+=5;return false;}return true;});   // a miss: only the bullets close to the ship vanish
      G.flash=Math.max(G.flash,.2*FX());PW.st().wv=.5;floater(P.x,P.y-36,'DROP','#8c86b8');}
    NR.emit('drop',{hit});},
  tick(dt){if(!G.live||G.dead)return;
    if(P.dashT>0&&!this.pdash)this.lastDash=G.t;this.pdash=P.dashT>0?1:0;
    const w=this.dw;if(w&&!w.done){if(!w.hit&&(this.pdash||G.t-this.lastDash<.3&&this.lastDash>=w.t-.2)){w.hit=true;this.drop(true);}else if(G.t>w.until)this.drop(false);}
    if(w&&w.done&&G.t>w.t+2)this.dw=null;
    for(let i=this.sets.length-1;i>=0;i--){const s=this.sets[i];if(s.es.some(e=>G.en.includes(e)))continue;this.sets.splice(i,1);
      const killed=s.es.filter(e=>e.hp<=0).length;if(killed>=s.n*.5){this.stat.rewards++;G.score+=250*s.n;floater(W*.6,H*.4,'SET CLEARED +'+250*s.n,'#ffe14d');this.shardShower(6+s.n);AU.sfx('up');}}
    const f=this.fence;if(f){const ph=G.bc-f.b0;if(f.phase<1&&ph>=3){f.phase=1;AU.sfx('warn');}
      if(f.fire>0){f.fire-=dt;if(!f.hit&&!G.dead)for(const r of f.rows)if(Math.abs(P.y-r)<13){f.hit=1;hurt(1);break;}if(f.fire<=0)this.endFence();}}
    if(this.ev)this.evTick(dt);
    if(this.shower>0)this.shower-=dt;},
  endFence(){const f=this.fence;if(!f)return;this.fence=null;if(!f.hit){this.stat.rewards++;G.score+=1000;floater(W*.5,H*.45,'FENCE CLEARED +1000','#19e3ff');this.shardShower(10);AU.sfx('up');}},
  beat(){const f=this.fence;if(f&&f.phase>=1&&f.fire<=0&&G.bc-f.b0>=4&&!f.fired){f.fired=1;f.fire=.35;AU.sfx('big');shake(7);}},
  draw(t){if(!G||G.dead)return;
    const T=tierOf(C.n);if(T>=3){ctx.save();ctx.globalCompositeOperation='lighter';G_(P.x,P.y,34+10*T+4*PUL,TIERC[T-1],.14+.06*T);ctx.restore();}   // tier 3+: the ship glows in the tier colour
    const f=this.fence;if(f){ctx.save();const lock=f.phase>=1,fire=f.fire>0,pulse=SET.reduce?1:(Math.floor(t*(lock?18:8))%2?1:.6);ctx.globalCompositeOperation='lighter';
      for(const r of f.rows){if(fire){const tn=window.EXP&&EXP.on;ctx.globalAlpha=tn?.55:.95;ctx.fillStyle=tn?'#ffb0c0':'#fff';ctx.fillRect(0,r-(tn?2:4),W,tn?4:8);ctx.globalAlpha=tn?.4:.5;ctx.fillStyle='#ff3050';ctx.fillRect(0,r-12,W,24);}
        else{ctx.globalAlpha=(lock?.9:.45)*pulse;ctx.strokeStyle=lock?'#ff3050':'#ff7080';ctx.lineWidth=lock?3:1.5;ctx.setLineDash(lock?[]:[14,10]);ctx.beginPath();ctx.moveTo(0,r);ctx.lineTo(W,r);ctx.stroke();ctx.setLineDash([]);
          if(lock){ctx.globalAlpha=.16*pulse;ctx.fillStyle='#ff3050';ctx.fillRect(0,r-10,W,20);}}}
      ctx.globalAlpha=lock?.5:.3;ctx.strokeStyle='#19ffb0';ctx.lineWidth=2;ctx.setLineDash([6,6]);ctx.strokeRect(10,f.gy-70,W-20,140);ctx.setLineDash([]);   // the safe gap
      ctx.restore();}
    if(this.ev)this.evDraw(t);
    if(this.dropAt>0&&!this.dw){const cnt=Math.max(1,Math.min(4,this.dropB-G.bc));ctx.save();ctx.textAlign='center';ctx.font='700 46px "Chakra Petch",sans-serif';ctx.globalAlpha=.55+.4*PUL;ctx.fillStyle='#b36bff';wtxt('DROP '+cnt,W/2,92);ctx.restore();
      ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=Math.min(.5,(4-cnt)*.14+.06);ctx.strokeStyle='#b36bff';ctx.lineWidth=10;ctx.strokeRect(5,5,W-10,H-10);ctx.restore();}}
};

/* ---------- V1 EVENT DECK (flag RET.deck, ?deck=0 = the old 6-bar WEAVE / FENCE / 16-bar DROP metronome) ----------
   One event at most every 25-31 s (and never with a boss out or about to come): the cards of DECK are shuffled and drawn without repeats until the deck is empty, then it is reshuffled
   (the last card never opens the next deck). A card whose enemies the stage has not unlocked yet goes to the bottom. Every card is dodgeable or harmless and shows its warning for >= 1 s
   (the enemy cards use the markers and entry paths of the pattern library): weave, fence, DROP (dash on the downbeat), supply drop (fly to the beacon), lane closes, gate run (fly through rings),
   mines, rescue capsule (shoot it open), wind gust, blackout strip (shots keep a white rim), crossfire from both edges, swarm, turret line, meteors, wedge. */
FUN.DECK=['weave','fence','drop','supply','lane','gaterun','mines','rescue','gust','blackout','crossfire','swarm','turrets','hail','wedge'];
FUN.NEED={mines:'mines',crossfire:'pincer',swarm:'swarm',turrets:'turretLine',wedge:'wedge'};
Object.assign(FUN,{
  deckBar(n){if(this.dropAt===n&&!this.dw)this.dropStart();
    if(this.ev||this.dw||this.fence||this.dropAt>0||G.t<this.nextAt||n<3||DIR.nonBoss()>=8||!(ST.on||G.dbar<DIR.bossBar-6))return;
    const k=this.draw1();if(k)this.start(k,n);},
  draw1(){const t=DIR.tierv();for(let i=0;i<2;i++){
      if(!this.deck.length){const d=this.DECK.slice();for(let j=d.length-1;j>0;j--){const q=Math.floor(gr(0,j+1));[d[j],d[q]]=[d[q],d[j]];}if(d[d.length-1]===this.lastK)d.unshift(d.pop());this.deck=d;}
      const k=this.deck.pop(),pk=this.NEED[k];if(!pk||(PATS[pk]&&PATS[pk].t<=t+.01))return k;this.deck.unshift(k);}
    return null;},
  start(k,n){this.lastK=k;this.nextAt=G.t+gr(25,31);this.stat.sets++;const T=G.t,hs=(s,d)=>hintShow(say(s),d||3);
    const pat=(id,msg)=>{const es=this.track(()=>PATS[id].f());if(es.length)this.sets.push({es,n:es.length,kind:k});hs(msg);};
    if(k==='weave'){const es=this.track(()=>{const y=FY(150,H-190);for(let i=0;i<6;i++)en('drone',{x:W+30+i*56,y,amp:120,ph:(i%2)*Math.PI});});if(es.length)this.sets.push({es,n:es.length,kind:k});hs('WEAVE: shoot on the beat',2.4);}
    else if(k==='fence')this.startFence();
    else if(k==='drop'){this.dropAt=n+1;this.dropB=G.bc+4;hs('DROP COMING: DASH ON THE DOWNBEAT',3.4);}
    else if(k==='mines')pat('mines','MINEFIELD: SLIP THROUGH');
    else if(k==='crossfire')pat('pincer','CROSSFIRE FROM BOTH EDGES');
    else if(k==='swarm')pat('swarm','SWARM: KEEP MOVING');
    else if(k==='turrets')pat('turretLine','TURRET LINE: FIND THE GAP');
    else if(k==='wedge')pat('wedge','WEDGE: SHOOT THE TIP');
    else if(k==='hail'){DIR.rain(4);this.ev={k,end:T+4};hs('METEORS: LEAVE THE MARKED LANES');}
    else if(k==='supply'){this.ev={k,t0:T,end:T+9,x:gr(520,800),y:gr(100,H-100),gave:0};hs('SUPPLY DROP: FLY TO THE BEACON',3.4);}
    else if(k==='lane'){this.ev={k,t0:T,end:T+5.4,y:clamp(P.y+gr(-70,70),70,H-70),h:84,hit:0};hs('LANE CLOSING: LEAVE IT',3);AU.sfx('warn');}
    else if(k==='gaterun'){const r=[];for(let i=0;i<5;i++)r.push({x:W+80+i*150,y:clamp(H/2+Math.sin(i*1.7+gr(0,1))*150,70,H-70),got:0});this.ev={k,t0:T,end:T+12,rings:r,n:0};hs('GATE RUN: FLY THROUGH THE RINGS',3.4);}
    else if(k==='rescue'){this.ev={k,t0:T,end:T+13,x:W+30,y:gr(110,H-110),hp:6,done:0};hs('SHOOT THE RESCUE CAPSULE',3.4);}
    else if(k==='gust'){this.ev={k,t0:T,end:T+4.6,dir:GR()<.5?-1:1};hs('WIND GUST: STEER AGAINST IT');}
    else if(k==='blackout'){this.ev={k,t0:T,end:T+5.8,x:W+10};hs('BLACKOUT STRIP: WATCH THE RIMS');}
    NR.emit('setpiece',{kind:k});},
  evTick(dt){const e=this.ev;if(!e)return;if(G.boss||G.dead||G.t>e.end){this.ev=null;return;}const age=G.t-e.t0;
    if(e.k==='supply'){if(age>=1&&!e.gave){e.gave=1;AU.sfx('up');for(let i=0;i<9;i++)G.pk.push({t:'shard',x:e.x+gr(-34,34),y:clamp(e.y+gr(-34,34),40,H-40),vx:-45,vy:0,bob:0});}}
    else if(e.k==='lane'){if(age>=1.3&&age<5.3&&!e.hit&&Math.abs(P.y-e.y)<e.h/2){e.hit=1;hurt(1);}
      if(age>=5.3&&!e.done){e.done=1;if(!e.hit){this.stat.rewards++;G.score+=800;floater(W*.5,H*.45,'LANE CLEARED +800','#19e3ff');this.shardShower(6);}}}
    else if(e.k==='gaterun'){let live=0;for(const r of e.rings){r.x-=170*dt;if(r.got)continue;if(r.x>-40)live++;if((r.x-P.x)**2+(r.y-P.y)**2<34*34){r.got=1;e.n++;G.score+=300*e.n;floater(r.x,r.y-20,'+'+300*e.n,'#ffe14d');AU.sfx('up');}}
      if(e.n>=5&&!e.done){e.done=1;this.stat.rewards++;G.score+=1500;floater(W*.5,H*.4,'GATE RUN +1500','#ffe14d');this.shardShower(10);}
      if(!live)this.ev=null;}
    else if(e.k==='rescue'){if(e.x>W*.62)e.x-=48*dt;
      for(const b of G.pb){if(b.dead||e.done)continue;if((b.x-e.x)**2+(b.y-e.y)**2<26*26){b.dead=1;e.hp--;e.fl=.12;AU.sfx('hit');
          if(e.hp<=0){e.done=1;this.stat.rewards++;G.score+=1200;floater(e.x,e.y-26,'RESCUED +1200','#3dffb0');this.shardShower(8,e.x);if(P.hp<P.max&&GR()<.6)G.pk.push({t:'hp',x:e.x,y:e.y,vx:-60,vy:0,bob:0});e.end=G.t+.6;}}}
      if(e.fl>0)e.fl-=dt;}
    else if(e.k==='gust'){if(age>=1&&age<4.2)P.y=clamp(P.y+e.dir*62*dt,22,H-22);}
    else if(e.k==='blackout'){if(age>=1)e.x=W+10-(W+260)*(age-1)/4.5;}},
  evDraw(t){const e=this.ev;if(!e)return;const age=G.t-e.t0,pulse=SET.reduce?1:(BK(t,10)?1:.6);ctx.save();
    if(e.k==='supply'){const k=Math.max(0,1-age);ctx.globalCompositeOperation='lighter';ctx.strokeStyle='#3dffb0';ctx.lineWidth=3;ctx.globalAlpha=.8*pulse;ctx.beginPath();ctx.arc(e.x,e.y,window.DIET&&DIET.on?Math.min(22+90*k,DIET.ringMax()):22+90*k,0,7);ctx.stroke();ctx.beginPath();ctx.moveTo(e.x,0);ctx.lineTo(e.x,e.y-22);ctx.stroke();}
    else if(e.k==='lane'){const live=age>=1.3&&age<5.3,y0=e.y-e.h/2;   // thin telegraph: two edge lines + a light fill (<= 15%) + words; the whole band is the danger
      ctx.globalAlpha=live?.14:.08*pulse;ctx.fillStyle='#ff3050';ctx.fillRect(0,y0,W,e.h);
      ctx.globalAlpha=live?.95:.6*pulse;ctx.strokeStyle=live?'#ff6a7a':'#ff7080';ctx.lineWidth=live?3:2;if(!live)ctx.setLineDash([14,10]);
      ctx.beginPath();ctx.moveTo(0,y0);ctx.lineTo(W,y0);ctx.moveTo(0,y0+e.h);ctx.lineTo(W,y0+e.h);ctx.stroke();ctx.setLineDash([]);
      ctx.globalAlpha=.95;ctx.font='700 14px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=3;ctx.strokeStyle='#05030c';
      const tx=live?'LASER ON: LEAVE THIS BAND':'LASER SOON: LEAVE THIS BAND';ctx.fillStyle='#fff';
      if(wcv===cv){ctx.strokeText(tx,W*.5,e.y);ctx.fillText(tx,W*.5,e.y);}else{ctx.translate(W*.5,e.y);ctx.rotate(Math.PI/2);ctx.strokeText(tx,0,0);ctx.fillText(tx,0,0);}}
    else if(e.k==='gaterun'){ctx.globalCompositeOperation='lighter';for(const r of e.rings){if(r.got||r.x<-40||r.x>W+40)continue;ctx.globalAlpha=.9;ctx.strokeStyle='#ffe14d';ctx.lineWidth=4;ctx.beginPath();ctx.arc(r.x,r.y,26,0,7);ctx.stroke();ctx.globalAlpha=.25;ctx.fillStyle='#ffe14d';ctx.beginPath();ctx.arc(r.x,r.y,26,0,7);ctx.fill();}}
    else if(e.k==='rescue'){const f=e.fl>0;ctx.globalAlpha=1;ctx.fillStyle=f?'#fff':'#0e2a22';ctx.strokeStyle='#3dffb0';ctx.lineWidth=3;ctx.beginPath();ctx.arc(e.x,e.y,22,0,7);ctx.fill();ctx.stroke();
      ctx.fillStyle='#3dffb0';ctx.fillRect(e.x-15,e.y+30,30*Math.max(0,e.hp)/6,4);ctx.strokeRect(e.x-15,e.y+30,30,4);}
    else if(e.k==='gust'){const live=age>=1&&age<4.2,s=e.dir;ctx.strokeStyle='#9ad8ff';ctx.lineWidth=2;ctx.globalAlpha=live?.45:.25*pulse;const o=(t*(live?90:0))%40;
      for(let x=60;x<W;x+=320)for(let j=0;j<2;j++){const y=((s>0?o+j*170:H-o-j*170)+H)%H;ctx.beginPath();ctx.moveTo(x-8,y-s*8);ctx.lineTo(x,y);ctx.lineTo(x+8,y-s*8);ctx.stroke();}}
    else if(e.k==='blackout'){const w=230,x0=e.x;if(age<1){ctx.globalAlpha=.5*pulse;ctx.strokeStyle='#ffffffcc';ctx.setLineDash([10,8]);ctx.strokeRect(W-w,2,w-4,H-4);ctx.setLineDash([]);}
      else{ctx.fillStyle='#000';ctx.globalAlpha=.62;ctx.fillRect(x0,0,w,H);ctx.globalAlpha=1;ctx.strokeStyle='#ffffffcc';ctx.lineWidth=1.5;
        for(const b of G.eb)if(b.x>x0&&b.x<x0+w){ctx.beginPath();ctx.arc(b.x,b.y,b.r+2,0,7);ctx.stroke();}
        for(const q of G.en)if(q.x>x0&&q.x<x0+w&&q.hp>0){ctx.strokeStyle='#ff7080aa';ctx.beginPath();ctx.arc(q.x,q.y,q.r+3,0,7);ctx.stroke();}}}
    ctx.restore();}
});
NR.on('runStart',()=>FUN.reset());NR.on('runEnd',()=>FUN.reset());
NR.on('tick',dt=>FUN.tick(dt));NR.on('beat',()=>FUN.beat());
NR.on('tier',({tier,why})=>{if(why==='drop'||!G.live||tier<2)return;FUN.shardShower(2+tier*2,P.x+260);if(tier>=3){shake(4);G.flash=Math.max(G.flash,.12*FX());}});   // every tier up pays out a few shards
{const bl=DIR.barLine;DIR.barLine=function(i){bl.call(this,i);try{FUN.bar();}catch(e){}};}
DRAW.extra.push(function(t){FUN.draw(t);});
