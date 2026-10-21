/* ---------- ANTI-CAMP (flag RET.anticamp, ?anticamp=0 = old play). Review 4, 20 Oct 2026: a ship parked at the left edge that only tracks height cleared more
   than a dodger, and the column strike was a hidden wall for anyone who did not read it. Now camping draws soft, readable, graded pressure instead:
   CAMP LEVEL  0..1 from the last 6 s of x samples: share of time in the left 25% of the field and low x spread (a dodger swings 150-290 px: level 0).
   FLUSH       above level .5, every few seconds a flanker tell (0.8 s, edge marker + dashed line) fires from behind or above at the camp spot, or ground fire
               sweeps the left edge (a wall with a free gap >= 120 px that dies at 32% of the field). Bullets go through eb(), so ebCap / BCAP hold.
   PICKUPS     while camping, pickups and power-ups stop at 45% of the field: leave the edge to collect them (they fade after 10 s).
   PAYOUT      score and EMP meter gain scale down by up to 50% while parked; shots from the left 25% at targets beyond 60% of the field hit up to 40% softer.
   REPAIR      every 10 close-range kills (reward.js, manual shots within 140 px) drop a repair, at most one per 25 s; Easy/Normal/Hard only.
   STRIKE      Easy/Normal: the column strike needs 6 s still (was 3.5-5) unless camping, telegraphs >= 1.2 s on the beat, the first of a stage only scorches, later ones cost 1 hull, never 2, and none
               while collecting or (not camping) shooting at a lined-up target. Hard tiers keep the old strike. Test: nightrun/anticamp-test.js. */
if(RET.anticamp===undefined)RET.anticamp=!/[?&]anticamp=0/.test(location.search);
const AC=window.AC={get on(){return!!RET.anticamp;},LEFT:.25,WIN:6,SD:40,TELL:.8,GAP:120,HOLD:.45,
  buf:[],acc:0,lv:0,cd:2,fl:0,tells:[],sw:[],lastFire:-9,sc:null,col:null,hinted:0,
  stat:{flush:0,rear:0,dive:0,sweep:0,held:0,camp:0,live:0,ex:0},
  per(){return{easy:3.4,normal:2.6,hard:2.2,vhard:2,legend:1.8}[SET.diff]||2.6;},
  soft(){return SET.diff==='easy'||SET.diff==='normal';},
  live(){return this.on&&G&&G.live&&!G.dead&&G.transT<0&&!G.lab&&!G.tut&&!SH.active&&!ST.over&&!G.over&&!godMode&&(ST.on?ST.n>=2:G.t>15);},
  level(xs){if(xs.length<30)return 0;let n=0,s=0,s2=0;for(const x of xs){if(x<this.LEFT*W)n++;s+=x;s2+=x*x;}
    const m=s/xs.length,sd=Math.sqrt(Math.max(0,s2/xs.length-m*m)),fr=n/xs.length;
    return clamp((fr-.75)/.2,0,1)*clamp((this.SD*1.6-sd)/(this.SD*.8),0,1);},
  aiming(){if(G.t-this.lastFire>.6)return false;for(const e of G.en){if(e.dead||e.x<=P.x||e.x>W)continue;if(Math.abs((e.type==='gate'?e.gy:e.y)-P.y)<Math.max(40,(e.r||20)+20))return true;}return!!(G.boss&&G.boss.x>P.x&&Math.abs(G.boss.y-P.y)<80);},
  collecting(){for(const k of G.pk)if(Math.hypot(k.x-P.x,k.y-P.y)<70)return true;return false;},
  exempt(){return this.collecting()||(this.lv<=.5&&this.aiming());},   // a camper that aims is still a camper
  payK(){return 1-.5*this.lv;},
  reachK(b,e){if(!this.on||!e||(b&&b.ab)||P.x>=this.LEFT*W||e.x<=.6*W)return 1;return 1-.4*this.lv;},
  room(n){return ebCap()-G.eb.length>=n;},
  shot(x,y,a,s,tag){const n=G.eb.length;eb.src=null;eb(x,y,a,s,'#ff9a3d');if(G.eb.length>n){const b=G.eb[G.eb.length-1];b.ac=tag||1;return b;}return null;},
  flush(){let lo=1e9,hi=-1e9;for(const x of this.buf){if(x<lo)lo=x;if(x>hi)hi=x;}const k=(hi-lo<16?['dive','rear','dive']:['rear','dive','sweep'])[this.fl%3];this.fl++;let kind=k;if(kind==='sweep'&&!this.room(15))kind='rear';
    const t={k:kind,t:this.TELL,x:P.x,y:P.y,n:Math.min(3,1+(this.fl>>1))};
    if(kind==='sweep'){let gy=P.y>H/2?rnd(90,P.y-170):rnd(P.y+170,H-90);if(!isFinite(gy)||gy<90||gy>H-90)gy=rnd(90,H-90);t.gy=gy;}
    this.tells.push(t);this.stat.flush++;AU.sfx('warn');
    if(!this.hinted){this.hinted=1;let seen=0;try{seen=localStorage.getItem('mnr_achint');if(!seen)localStorage.setItem('mnr_achint','1');}catch(e){}
      if(!seen)hintShow('Camping draws flankers: push forward',3.5,'#ff9a3d');else floater(P.x+40,P.y-44,'FLANKED!','#ff9a3d');}},
  fire(t){const S=t.n>1?[0,-this.GAP,this.GAP]:[0];
    if(t.k==='rear'){this.stat.rear++;for(const o of S){const y=t.y+o;if(y<20||y>H-20||!this.room(3))continue;for(let i=0;i<3;i++)this.shot(-8-i*42,y,0,300,1);}}
    else if(t.k==='dive'){this.stat.dive++;for(const o of S){const x=t.x+o;if(x<16||x>W*.4||!this.room(3))continue;for(let i=0;i<3;i++)this.shot(x,-8-i*42,Math.PI/2,300,1);}}
    else{this.stat.sweep++;for(let y=20;y<=H-20;y+=34){if(Math.abs(y-t.gy)<this.GAP/2)continue;const b=this.shot(-8,y,0,170,2);if(b)this.sw.push(b);}}},
  tick(dt){
    if(!this.live()){this.buf=[];this.lv=0;this.tells=[];this.fl=0;this.sc=null;return;}
    this.stat.live+=dt;this.acc+=dt;if(this.acc>=.1){this.acc=0;this.buf.push(P.x);if(this.buf.length>this.WIN*10)this.buf.shift();this.lv=this.level(this.buf);}
    if(this.lv>.5)this.stat.camp+=dt;
    this.hl=this.lv>.5?(this.hl||0)+dt:0;   // a streak of camping before any flush: a dodger's passing dwell at the edge never gets one
    // payout: score gained while parked is scaled down
    if(this.sc!==null&&G.score>this.sc&&this.lv>0)G.score-=Math.floor((G.score-this.sc)*(1-this.payK()));this.sc=G.score;
    // pickups wait in the mid field while the ship camps
    const hx=this.HOLD*W;for(const p of G.pk){if(this.lv>.5&&p.x<hx&&p.x>hx-40&&(p.acH||p.vx<=0)){if(!p.acH){p.acH=1;this.stat.held++;}p.x=hx;p.vx=0;}
      if(p.acH){p.acT=(p.acT||0)+dt;if(this.lv<=.5)p.acH=0;else if(p.acT>10)p.dead=1;}}
    // the ground-fire wall only sweeps the edge
    if(this.sw.length){for(const b of this.sw)if(b.x>.32*W)b.dead=1;this.sw=this.sw.filter(b=>!b.dead&&G.eb.includes(b));}
    for(const t of this.tells){t.t-=dt;if(t.t<=0){t.done=1;this.fire(t);}}this.tells=this.tells.filter(t=>!t.done);
    if(this.lv>.5&&this.hl>=2){this.cd-=dt*this.lv;if(this.cd<=0&&!this.tells.length){this.flush();this.cd=this.per();}}   // flankers.js (RET.flankers) adds real enemies on top of the streams
    else{this.cd=Math.max(this.cd,1.2);if(this.lv<.2)this.fl=0;}
    // strike: Easy/Normal get a long beat-aligned tell, graded damage, and no strike while aiming or collecting
    if(window.MM&&MM.col&&this.soft()){const c=MM.col;
      if(c!==this.col){this.col=c;c.d0=MM.sn<=1?0:Math.min(1,c.dmg);const bp=bpos();if(isFinite(bp)&&BT.spb>0){let tl=(Math.ceil(bp)+(SET.diff==='easy'?3:2)-bp)*BT.spb;while(tl<1.2)tl+=BT.spb;c.t=c.tl=Math.min(tl,2.4);}}
      if(!c.fire){const ex=this.exempt();if(ex&&c.d0>0&&!c.ex){c.ex=1;this.stat.ex++;}c.dmg=ex?0:c.d0;}}
  },
  draw(t){if(!this.on||!G||G.dead||!running)return;
    if(this.tells.length){ctx.save();const pulse=SET.reduce?1:.6+.4*Math.sin(t*14);ctx.strokeStyle='#ff9a3d';ctx.fillStyle='#ff9a3d';
      for(const q of this.tells){const fr=1-q.t/this.TELL,S=q.n>1?[0,-this.GAP,this.GAP]:[0];ctx.globalAlpha=(.45+.5*fr)*pulse;ctx.lineWidth=2;ctx.setLineDash([8,10]);
        if(q.k==='rear')for(const o of S){const y=q.y+o;if(y<20||y>H-20)continue;if(!ART.span('fx-w34-ac-line',this.LEFT*W/2,y,this.LEFT*W,16,0,.9*pulse)){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(this.LEFT*W,y);ctx.stroke();}
          if(!ART.pic('ac-flank-tell',32,13,y)){ctx.beginPath();ctx.moveTo(4,y-12);ctx.lineTo(22,y);ctx.lineTo(4,y+12);ctx.closePath();ctx.fill();}}
        else if(q.k==='dive')for(const o of S){const x=q.x+o;if(x<16||x>W*.4)continue;if(!ART.span('fx-w34-ac-line',x,H/2,H,16,Math.PI/2,.9*pulse)){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
          if(!ART.pic('ac-flank-tell',32,x,13,Math.PI/2)){ctx.beginPath();ctx.moveTo(x-12,4);ctx.lineTo(x,22);ctx.lineTo(x+12,4);ctx.closePath();ctx.fill();}}
        else{ctx.setLineDash([]);ctx.globalAlpha=(.2+.35*fr)*pulse;const fw=10+30*fr,ya=q.gy-this.GAP/2,yb=q.gy+this.GAP/2;if(!ART.span('fx-w34-ac-fire',fw/2,ya/2,fw+14,ya,0,(.55+.4*fr)*pulse))ctx.fillRect(0,0,fw,ya);if(!ART.span('fx-w34-ac-fire',fw/2,(yb+H)/2,fw+14,H-yb,0,(.55+.4*fr)*pulse))ctx.fillRect(0,yb,fw,H-yb);ART.pic('ac-fire-gap',36,fw+22,q.gy,0,.9*pulse);}}
      ctx.setLineDash([]);ctx.restore();}}};
NR.on('runStart',()=>{Object.assign(AC,{fk:0,fkT:-99,buf:[],acc:0,lv:0,cd:2,fl:0,tells:[],sw:[],lastFire:-9,sc:null,col:null});});
NR.on('fire',()=>{AC.lastFire=G?G.t:0;});
NR.on('tick',dt=>{if(AC.on&&G)AC.tick(dt);});
/* FORWARD REPAIR: close-range kills (reward.js marks them e._rwC) build toward a repair drop: every 10, at most one per 25 s; Easy/Normal/Hard only */
NR.on('kill',d=>{const e=d&&d.e;if(!AC.on||!G||!G.live||G.dead||!e||d.boss||e.type==='boss'||!e._rwC||G.t-e._rwC>.35)return;if(!(AC.soft()||SET.diff==='hard'))return;
  AC.fk=(AC.fk||0)+1;if(AC.fk<10||G.t-(AC.fkT||-99)<25||P.hp>=P.max)return;AC.fk=0;AC.fkT=G.t;AC.stat.rep=(AC.stat.rep||0)+1;
  G.pk.push({t:'hp',x:Math.min(e.x,W-80),y:e.y,vx:-60,vy:0,bob:0});floater(e.x,e.y-30,'FORWARD REPAIR','#7dff7a');});
if(window.MM){const w0=MM.win;MM.win=function(){const w=w0.call(this);return AC.on&&AC.soft()&&AC.lv<=.5?Math.max(w,6):w;};}   // Easy/Normal: the strike is a last resort after 6 s still
{const h=DMG.hit;DMG.hit=function(d,b,e){const v=h.apply(this,arguments);if(!AC.on||!G||!G.live)return v;return v*AC.reachK(b,e);};}
if(window.ABIL){const g0=ABIL.gain;ABIL.gain=function(v){return g0.call(this,AC.on?v*AC.payK():v);};}
{const dp=drawPickups;drawPickups=function(t){dp(t);try{AC.draw(t);}catch(err){}};}
