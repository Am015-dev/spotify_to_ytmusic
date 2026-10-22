// PURPOSE: risk pays: graze chain multiplier
// FLAG: reward (?reward=0)
// TEST: reward-test.js
/* ---------- RISK PAYS (flag RET.reward, ?reward=0 = the old play exactly). Moving and taking risks must beat sitting far away. Built after hard.js / armour.js.
   GRAZE CHAIN   grazes within 1.5 s of each other chain a multiplier x1..x5 (a graze on the beat counts double: 2 points, x2 at 2 points, x5 at 8). A hit drops it to x1.
                 It feeds score (+10 pts x combo per tier above 1), the EMP meter (ABIL.gain, hook only) and a damage buff (+10% per tier above 1, cap +40%, 4 s).
   CLOSE RANGE   manual shots that damage an enemy within 140 px of the ship deal up to +35% (full inside 40 px, linear to 0 at 140). Homing / auto shots, weapon
                 chains and ability zaps get nothing (keeps the must-move rule). A non-boss enemy killed by such a hit drops one extra shard.
   NEAR-MISS     the graze already carries pf (judge() on the beat grid): the chain counts it double.
   RISK PICKUPS  a pickup that drifts through a strip with 3+ enemy bullets within 100 px, or is taken with 3+ bullets around the ship, pays double ("BOLD").
   Caps: the damage multiplier of buff x close is clamped per tier (CAPK) and sits inside the DMG.hit chain, so the ordinary-enemy ceiling in hard.js (S3.cap)
   and the boss damage-rate caps in armour.js still bound the total. ebCap / BCAP are not touched. Test: nightrun/reward-test.js. */
if(RET.reward===undefined)RET.reward=!/[?&]reward=0/.test(location.search);
const RWD=window.RWD={get on(){return!!RET.reward;},
  WIN:1.5,BUFF_T:4,CLOSE_R:140,CLOSE_FULL:40,CLOSE_MAX:.35,
  CAPK:{easy:1.6,normal:1.6,hard:1.4,vhard:1.3,legend:1.25},   // buff x close never above this per tier: the hard tiers keep their DPS ceiling
  stat:{graze:0,beat:0,maxTier:1,close:0,pb:0,bold:0,drop:0},
  s(){return G.rw||(G.rw={n:0,t:-9,tier:1,bf:0,bt:0});},
  tier(){if(!this.on||!G||!G.rw)return 1;const s=G.rw;return G.t-s.t>this.WIN?1:s.tier;},
  buff(){if(!this.on||!G||!G.rw)return 0;const s=G.rw;return s.bt>0?s.bf:0;},
  auto(b){return!b||b.hk||b.au||b.tg||b.ab;},   // a homing, locked, or ability shot is not a positioned shot
  close(b,e){if(this.auto(b)||!e||e.gr)return 0;const d=Math.hypot(P.x-e.x,P.y-e.y);return d>=this.CLOSE_R?0:this.CLOSE_MAX*Math.min(1,(this.CLOSE_R-d)/(this.CLOSE_R-this.CLOSE_FULL));},
  dmK(b,e){const bf=b&&!b.ab?this.buff():0,cl=this.close(b,e);if(cl>.02&&e){e._rwC=G.t;this.stat.close++;}
    const k=(1+bf)*(1+cl);return k<=1?1:Math.min(k,this.CAPK[SET.diff]||1.6);},
  graze(pf){const s=this.s();if(G.t-s.t>this.WIN)s.n=0;s.n+=pf?2:1;s.t=G.t;this.stat.graze++;if(pf)this.stat.beat++;
    const t=Math.min(5,1+(s.n>>1)),x=t-1;if(t>s.tier&&t>=2){floater(P.x,P.y-52,'CHAIN x'+t,pf?'#ffe14d':'#19e3ff');}
    s.tier=t;this.stat.maxTier=Math.max(this.stat.maxTier,t);
    if(x>0){G.score+=Math.round(10*G.mult*x);if(window.ABIL&&ABIL.on)ABIL.gain(.012*x);s.bf=Math.min(.4,.1*x);s.bt=this.BUFF_T;}},
  hurt(){const s=G.rw;if(s){s.n=0;s.tier=1;s.bf=0;s.bt=0;s.t=-9;}},
  nearBul(x,y,r){let n=0;const r2=r*r;for(const b of G.eb)if(!b.dead&&(b.x-x)**2+(b.y-y)**2<r2&&++n>=3)break;return n;},
  tick(dt){const s=G.rw;if(s&&s.bt>0)s.bt-=dt;
    for(const p of G.pk){if(p.x<0||p.x>W)continue;if(this.nearBul(p.x,p.y,100)>=3){p.rk=1;p.rkT=G.t;}}},
  pick(p){if(!this.on||!p||G.dead)return;
    const bold=(p.rk&&G.t-p.rkT<1.2)||this.nearBul(P.x,P.y,120)>=3;if(!bold||p.t==='hp')return;
    this.stat.bold++;floater(P.x,P.y-40,'BOLD x2','#ffe14d');
    if(p.t==='shard'){G.mult=Math.min(9.9,+(G.mult+.1*(SH.smk||1)).toFixed(2));G.score+=Math.round(50*G.mult*(SH.smk||1));}
    else G.score+=Math.round(150*G.mult);
    if(window.ABIL&&ABIL.on)ABIL.gain(.05);},
  draw(t){if(!this.on||!G||G.dead)return;
    for(const p of G.pk){if(!p.rk||G.t-p.rkT>1.2)continue;const y=p.y+Math.sin(p.bob)*3;ctx.save();ctx.strokeStyle='#ffe14d';ctx.globalAlpha=.55+.35*Math.sin(t*10);ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,y,17+Math.sin(t*8)*2,0,7);ctx.stroke();ctx.restore();}
    const s=G.rw;if(!s||s.n<=0)return;const age=G.t-s.t;if(age>this.WIN)return;const tr=s.tier,fr=1-age/this.WIN,col=['#19e3ff','#19e3ff','#7dff7a','#ffe14d','#ff9a3d','#ff2d78'][tr];
    ctx.save();ctx.lineWidth=3;ctx.strokeStyle='rgba(0,0,0,.55)';ctx.beginPath();ctx.arc(P.x,P.y,32,0,7);ctx.stroke();
    ctx.strokeStyle=col;ctx.globalAlpha=.95;ctx.beginPath();ctx.arc(P.x,P.y,32,-Math.PI/2,-Math.PI/2+Math.PI*2*fr);ctx.stroke();
    if(tr>=2){ctx.globalAlpha=1;ctx.textAlign='center';ctx.font='700 16px "Chakra Petch",sans-serif';ctx.lineWidth=4;ctx.strokeStyle='rgba(0,0,0,.8)';
      const txt='x'+tr+(s.bt>0?' +'+Math.round(s.bf*100)+'%':'');
      if(wcv===cv){ctx.strokeText(txt,P.x,P.y-40);ctx.fillStyle=col;ctx.fillText(txt,P.x,P.y-40);}
      else{ctx.translate(P.x+40,P.y);ctx.rotate(Math.PI/2);ctx.strokeText(txt,0,0);ctx.fillStyle=col;ctx.fillText(txt,0,0);}}
    ctx.restore();}};
/* damage: inside the DMG.hit chain (after hard.js's auto/manual split), so every later cap still sees the final number */
HOOK['DMG.hit'](h=>function(d,b,e){const v=h.call(this,d,b,e);if(!RWD.on||!G||!G.live||!b)return v;return v*RWD.dmK(b,e);});
NR.on('graze',d=>{if(RWD.on&&G&&G.live&&!G.dead)RWD.graze(!!(d&&d.pf));});
NR.on('hurt',()=>{if(RWD.on&&G)RWD.hurt();});
NR.on('tick',dt=>{if(RWD.on&&G&&G.live&&!G.dead)RWD.tick(dt);});
NR.on('kill',d=>{const e=d&&d.e;if(!RWD.on||!G||!e||d.boss||e.dummy||e.type==='boss'||!e._rwC||G.t-e._rwC>.35)return;
  let n=0;for(const p of G.pk)if(p.t==='shard')n++;if(n>=30)return;RWD.stat.pb++;RWD.stat.drop++;
  G.pk.push({t:'shard',x:e.x,y:e.y,vx:rnd(-40,10),vy:rnd(-40,40),bob:0});});
HOOK.drawPlayer(dp=>function(t){dp(t);if(running)RWD.draw(t);});
