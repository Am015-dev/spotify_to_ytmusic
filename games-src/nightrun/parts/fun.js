/* ---------- FUN pass: something new every ~8-10 s ----------
   SET PIECES   every 6 bars (~12 s) a signature formation per district that moves on the beat (WEAVE) or a LASER FENCE across the screen on the bar line;
                clear one and a shard shower sweeps across the screen
   DROP         every 16 bars: a bar of countdown, then on the downbeat DASH to blow the screen clear (all bullets, +score, +tier, shard shower);
                miss the dash and you still get a small blast round the ship (never a punishment)
   MINI-BOSS    about every 26 bars (~50 s, see dir.js)
   Never touches the music: only game logic, light and a clean effect sound. */
const FUN={n:0,sets:[],fence:null,dw:null,dropAt:-1,lastDash:-9,pdash:0,shower:0,stat:{sets:0,fences:0,drops:0,dropsHit:0,rewards:0},
  reset(){this.n=0;this.sets=[];this.fence=null;this.dw=null;this.dropAt=-1;this.lastDash=-9;this.pdash=0;this.shower=0;},
  ROWS:[30,90,150,210,270,330,390,450,510],
  /* the bot (sweep.js / d-sim.js) asks: is a ship at height y on a firing beam row? */
  cost(y){const f=this.fence;if(!f||f.phase<1)return 0;for(const r of f.rows)if(Math.abs(y-r)<26)return 3000;return 0;},
  shardShower(n,x0){for(let i=0;i<n;i++)G.pk.push({t:'shard',x:(x0==null?W-40:x0)+gr(-30,30),y:gr(50,H-50),vx:-gr(120,300),vy:gr(-40,40),bob:0});this.shower=.9;},
  track(f){const n0=G.en.length;f();return G.en.slice(n0);},
  setPiece(){const di=G.di,sig=['turretLine','swarm','wedge','turretLine','phalanx'][di%5],k=Math.floor(this.n/6)%3,t=DIR.tierv();
    const kind=k===1?'fence':k===2?'weave':(PATS[sig]&&PATS[sig].t<=t+.01?sig:'weave');
    if(kind==='fence'){if(!this.fence)this.startFence();return;}
    let es;if(kind==='weave')es=this.track(()=>{const y=FY(150,H-190);for(let i=0;i<6;i++)en('drone',{x:W+30+i*56,y,amp:120,ph:(i%2)*Math.PI});});
    else es=this.track(()=>PATS[kind].f());
    if(es.length){this.sets.push({es,n:es.length,kind});this.stat.sets++;G.hint={t:2.4,txt:say(kind==='weave'?'WEAVE: shoot on the beat':'SET PIECE')};NR.emit('setpiece',{kind});}},
  startFence(){const gy=clamp(P.y+gr(-80,80),110,H-110),rows=this.ROWS.filter(y=>Math.abs(y-gy)>75);
    this.fence={rows,gy,b0:G.bc,phase:0,fire:0,hit:0};this.stat.fences++;AU.sfx('warn');G.hint={t:2.6,txt:say('LASER FENCE: find the gap')};},
  bar(){const n=this.n=G.rb;if(G.boss||G.dead||SH.active)return;
    if(n>=3&&n%6===3&&DIR.nonBoss()<8&&(ST.on||G.dbar<DIR.bossBar-6))this.setPiece();
    if(n%16===15&&n>=15&&!this.dw){this.dropAt=n+1;this.dropB=G.bc+4;G.hint={t:3.4,txt:say('DROP COMING: DASH ON THE DOWNBEAT')};}
    if(n%16===0&&n>=16&&this.dropAt===n)this.dropStart();},
  dropStart(){this.dropAt=-1;this.dw={t:G.t,hit:false,until:G.t+.28};if(this.pdash>0||G.t-this.lastDash<.22)this.drop(true);},
  drop(hit){const w=this.dw;if(!w||w.done)return;w.done=1;this.stat.drops++;const T=tierOf(C.n);
    if(hit){this.stat.dropsHit++;let k=0;for(const b of G.eb){G.score+=5;k++;}G.eb=[];
      for(const e of G.en)if(e.type!=='boss'&&e.x<W-10){e.hp-=22;e.flash=.2;}
      const pts=800*T*(1+Math.min(3,Math.floor(G.rb/16)));G.score+=pts;tierSet(C.n+3,'drop');
      G.flash=Math.max(G.flash,.55*FX());shake(14);PW.st().wv=.8;banner('DROP!','+'+pts,false,1.5);floater(P.x,P.y-36,'DROP! ×'+T,'#b36bff');
      this.shardShower(14+4*T);AU.sfx('big');try{const a=AU.a;if(a&&a.state==='running'){AU.noise(a.currentTime,.7,.35,300,AU.fx,'lowpass');AU.osc(a.currentTime,'sine',140,.5,.6,AU.fx,30);}}catch(e){}this.stat.rewards++;}
    else{let k=0;G.eb=G.eb.filter(b=>{if(Math.hypot(b.x-P.x,b.y-P.y)<230){G.score+=5;return false;}return true;});   // a miss: only the bullets close to the ship vanish
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
    if(this.shower>0)this.shower-=dt;},
  endFence(){const f=this.fence;if(!f)return;this.fence=null;if(!f.hit){this.stat.rewards++;G.score+=1000;floater(W*.5,H*.45,'FENCE CLEARED +1000','#19e3ff');this.shardShower(10);AU.sfx('up');}},
  beat(){const f=this.fence;if(f&&f.phase>=1&&f.fire<=0&&G.bc-f.b0>=4&&!f.fired){f.fired=1;f.fire=.35;AU.sfx('big');shake(7);}},
  draw(t){if(!G||G.dead)return;
    const T=tierOf(C.n);if(T>=3){ctx.save();ctx.globalCompositeOperation='lighter';G_(P.x,P.y,34+10*T+4*PUL,TIERC[T-1],.14+.06*T);ctx.restore();}   // tier 3+: the ship glows in the tier colour
    const f=this.fence;if(f){ctx.save();const lock=f.phase>=1,fire=f.fire>0,pulse=SET.reduce?1:(Math.floor(t*(lock?18:8))%2?1:.6);ctx.globalCompositeOperation='lighter';
      for(const r of f.rows){if(fire){ctx.globalAlpha=.95;ctx.fillStyle='#fff';ctx.fillRect(0,r-4,W,8);ctx.globalAlpha=.5;ctx.fillStyle='#ff3050';ctx.fillRect(0,r-12,W,24);}
        else{ctx.globalAlpha=(lock?.9:.45)*pulse;ctx.strokeStyle=lock?'#ff3050':'#ff7080';ctx.lineWidth=lock?3:1.5;ctx.setLineDash(lock?[]:[14,10]);ctx.beginPath();ctx.moveTo(0,r);ctx.lineTo(W,r);ctx.stroke();ctx.setLineDash([]);
          if(lock){ctx.globalAlpha=.16*pulse;ctx.fillStyle='#ff3050';ctx.fillRect(0,r-10,W,20);}}}
      ctx.globalAlpha=lock?.5:.3;ctx.strokeStyle='#19ffb0';ctx.lineWidth=2;ctx.setLineDash([6,6]);ctx.strokeRect(10,f.gy-70,W-20,140);ctx.setLineDash([]);   // the safe gap
      ctx.restore();}
    if(this.dropAt>0&&!this.dw){const cnt=Math.max(1,Math.min(4,this.dropB-G.bc));ctx.save();ctx.textAlign='center';ctx.font='700 46px "Chakra Petch",sans-serif';ctx.globalAlpha=.55+.4*PUL;ctx.fillStyle='#b36bff';wtxt('DROP '+cnt,W/2,92);ctx.restore();
      ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=Math.min(.5,(4-cnt)*.14+.06);ctx.strokeStyle='#b36bff';ctx.lineWidth=10;ctx.strokeRect(5,5,W-10,H-10);ctx.restore();}}
};
NR.on('runStart',()=>FUN.reset());NR.on('runEnd',()=>FUN.reset());
NR.on('tick',dt=>FUN.tick(dt));NR.on('beat',()=>FUN.beat());
NR.on('tier',({tier,why})=>{if(why==='drop'||!G.live||tier<2)return;FUN.shardShower(2+tier*2,P.x+260);if(tier>=3){shake(4);G.flash=Math.max(G.flash,.12*FX());}});   // every tier up pays out a few shards
{const bl=DIR.barLine;DIR.barLine=function(i){bl.call(this,i);try{FUN.bar();}catch(e){}};}
{const dp=drawPickups;drawPickups=function(t){dp(t);FUN.draw(t);};}
