// PURPOSE: flanker enemies that punish a parked ship (default OFF)
// FLAG: flankers (?flankers=0)
// TEST: flankers-test.js
/* ---------- FLANKERS (flag RET.flankers, default OFF, ?flankers=1 = on; off = W29 anti-camp bullet streams). 20 Oct 2026
   The anti-camp "flush" used to be bullet streams with edge markers. With this flag it spawns real enemies you can see, shoot and be hurt by:
   DIVER   shielded triangle: enters from above the camp column after a 0.8 s tell (dashed line + chevron), dives down that column and leaves.
   CRAWLER half-dome ground unit that sweeps the left wall from the side far from the ship; fires a slow shot at the ship now and then.
   BAIT    circle drone that hovers in the camp lane (>= 110 px off the ship's row) and drops a mine, then flies away.
   Rules: only while camp level > .5 for 3 s with >= 75% of the last 6 s in the left 22% of the field; 12 s cool-down; max 2 alive; tell >= 0.8 s;
   hp from the stage curve (en()); kill drops shards; shots go through eb() so ebCap/BCAP hold. Shapes are code placeholders (ids flanker-diver / -crawler / -bait). */
if(RET.flankers===undefined)RET.flankers=!/[?&]flankers=0/.test(location.search);
const FLK=window.FLK={get on(){return!!RET.flankers&&!!RET.anticamp;},HOLD:2,SHARE:.22,CD:8,MAX:3,LV:.4,TELL:.8,
  hold:0,cd:6,n:0,tells:[],stat:{spawn:0,diver:0,crawler:0,bait:0,kill:0,mine:0,dodgerFlag:0},
  K:{diver:{id:'flanker-diver',r:15,hp:5,score:260,col:'#ff9a3d',sh:3},crawler:{id:'flanker-crawler',r:14,hp:6,score:240,col:'#c8ff3d'},bait:{id:'flanker-bait',r:13,hp:3,score:200,col:'#ff5acf'}},
  alive(){let n=0;for(const e of G.en)if(e.fk&&!e.dead&&e.hp>0)n++;return n+this.tells.length;},
  share(){const b=AC.buf;if(b.length<30)return 1;let n=0;for(const x of b)if(x<this.SHARE*W)n++;return n/b.length;},
  reset(){this.hold=0;this.cd=6;this.tells=[];},
  /* called by AC when it would have fired a bullet stream; true = handled here */
  ask(){if(!this.on)return false;if(this.hold<this.HOLD||this.share()<.75||this.cd>0||this.alive()>=this.MAX||!ebRoom())return true;
    const ks=['diver','crawler','bait'],k=ks[this.n%3];this.n++;this.cd=this.CD;this.stat.spawn++;
    const t={k,t:this.TELL,x:P.x,y:P.y};
    if(k==='crawler')t.up=P.y>H/2?1:0;               // the wall unit starts at the far side so it crosses the ship's row
    if(k==='bait'){t.bx=Math.min(W*.5,P.x+170);t.by=P.y>H/2?rnd(90,P.y-110):rnd(P.y+110,H-90);if(!isFinite(t.by)||t.by<80||t.by>H-80)t.by=P.y>H/2?90:H-90;}
    this.tells.push(t);AU.sfx('warn');
    if(!AC.hinted){AC.hinted=1;let seen=0;try{seen=localStorage.getItem('mnr_achint');if(!seen)localStorage.setItem('mnr_achint','1');}catch(e){}
      if(!seen)hintShow('Camping draws flankers: shoot them, push forward',3.5,'#ff9a3d');else floater(P.x+40,P.y-44,'FLANKED!','#ff9a3d');}
    return true;},
  mk(t){const K=this.K[t.k];const e=en('fk_'+t.k,{r:K.r,hp:K.hp,score:K.score,fk:t.k,sd:1,bf:99});
    e.hull=e.hp;if(K.sh)e.hp+=Math.round(e.hull*.7);e.max=e.hp;e.mini=1;this.stat[t.k]++;
    if(t.k==='diver'){e.x=clamp(t.x,40,W*.4);e.y=-24;e.tx=e.x;e.py=t.y;e.ph=0;}
    else if(t.k==='crawler'){e.x=30;e.y=t.up?H+20:-20;e.dy=t.up?-1:1;e.sf=1.6;e.bn=0;}
    else{e.x=t.bx;e.y=t.by;e.ty=t.by;e.dropT=2.2;e.leave=0;}
    e.score=K.score;return e;},
  shoot(e,gap,sp){e.sf=(e.sf===undefined?gap:e.sf)-this._dt;if(e.sf<=0&&e.y>20&&e.y<H-20&&e.x>0&&G.eb.length<ebCap()-2){e.sf=gap;eb.src=null;eb(e.x,e.y,Math.atan2(P.y-e.y,P.x-e.x),sp,this.K[e.fk].col);}},
  move(e,dt){const k=e.fk;this._dt=dt;
    if(k==='diver'){   // phase 0: dive down the locked column; 1: hover 110 px off the ship's row and shoot; 2: leave upward
      if(!e.ph){e.y+=300*dt;e.x=e.tx+Math.sin(e.t*2)*6;if(e.y>=clamp(e.py,70,H-70)||e.y>H-60){e.ph=1;e.hv=5.5;e.sf=.6;}}
      else if(e.ph===1){e.hv-=dt;const ty=clamp(P.y+(P.y>H/2?-110:110),60,H-60);e.x+=(Math.max(P.x+120,150)-e.x)*Math.min(1,dt*1.6);e.y+=(ty-e.y)*Math.min(1,dt*1.6);this.shoot(e,1.3,230);if(e.hv<=0)e.ph=2;}
      else{e.y-=300*dt;if(e.y<-40)e.dead=1;}}
    else if(k==='crawler'){e.y+=e.dy*150*dt;if(e.y>H-30){e.dy=-1;e.bn=(e.bn||0)+1;}else if(e.y<30&&e.t>1){e.dy=1;e.bn=(e.bn||0)+1;}
      this.shoot(e,1.5,210);if(e.bn>=3||e.t>16)e.leave=1;if(e.leave){e.x-=60*dt;if(e.x<-30)e.dead=1;}}
    else{e.dropT-=dt;e.y=e.ty+Math.sin(e.t*3)*10;if(!e.leave)this.shoot(e,1.8,200);
      if(e.dropT<=0&&!e.leave){e.leave=1;if(G.en.length<40){en('mine',{x:e.x,y:e.y,fkm:1});this.stat.mine++;}}
      if(e.leave){e.x+=170*dt;e.y-=40*dt;if(e.x>W+30||e.y<-30)e.dead=1;}}},
  tick(dt){
    if(!this.on||!AC.live()){this.reset();return;}
    this.cd-=dt;if(AC.lv>this.LV)this.hold+=dt;else this.hold=0;
    if(AC.lv>this.LV)this.ask();
    for(const t of this.tells){t.t-=dt;if(t.t<=0){t.done=1;try{this.mk(t);}catch(err){}}}this.tells=this.tells.filter(t=>!t.done);
    for(const e of G.en)if(e.fk&&!e.dead&&e.hp>0)this.move(e,dt);},
  draw(e,t){const K=this.K[e.fk],fl=e.flash>0,line=fl?'#fff':K.col,fill=fl?'#fff':'#12081f',s=e.sd||1;
    ctx.save();ctx.translate(e.x,e.y);ctx.scale(s,1);if(FOEART.body(e,t,fl,1)){ctx.restore();return;}ctx.lineWidth=2;ctx.strokeStyle=line;ctx.fillStyle=fill;
    if(e.fk==='diver'){if(ART.pic('ac-flanker',e.r*3.2,0,0,-Math.PI/2)){if(fl){ctx.globalAlpha=.6;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,0,e.r,0,7);ctx.fill();ctx.globalAlpha=1;}}else{ctx.rotate(Math.PI/2);ctx.beginPath();ctx.moveTo(e.r+4,0);ctx.lineTo(-e.r,-e.r*.9);ctx.lineTo(-e.r*.4,0);ctx.lineTo(-e.r,e.r*.9);ctx.closePath();ctx.fill();ctx.stroke();ctx.rotate(-Math.PI/2);}
      if(e.hp>e.hull){ctx.globalAlpha=.55+.3*Math.sin(t*10);ctx.strokeStyle='#4ad1ff';ctx.beginPath();ctx.arc(0,0,e.r+7,0,7);ctx.stroke();}}
    else if(e.fk==='crawler'){ctx.beginPath();ctx.arc(0,e.r*.5,e.r,Math.PI,0);ctx.closePath();ctx.fill();ctx.stroke();
      for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(i*7,e.r*.5);ctx.lineTo(i*7+(Math.sin(t*14+i)>0?3:-3),e.r*.5+7);ctx.stroke();}
      ctx.fillStyle=line;ctx.beginPath();ctx.arc(e.r*.3,0,3,0,7);ctx.fill();}
    else{ctx.beginPath();ctx.arc(0,0,e.r,0,7);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(-e.r*.6,-e.r*.5);ctx.lineTo(0,-e.r*1.5);ctx.lineTo(e.r*.6,-e.r*.5);ctx.stroke();
      ctx.fillStyle=line;ctx.globalAlpha=.4+.5*(e.dropT>0&&!e.leave&&e.dropT<1?Math.sin(t*24)>0:1);ctx.beginPath();ctx.arc(0,e.r*.2,4,0,7);ctx.fill();}
    ctx.restore();},
  drawTells(t){if(!this.tells.length)return;ctx.save();const pulse=SET.reduce?1:.6+.4*Math.sin(t*14);
    for(const q of this.tells){const fr=1-q.t/this.TELL,K=this.K[q.k];ctx.strokeStyle=K.col;ctx.fillStyle=K.col;ctx.globalAlpha=(.45+.5*fr)*pulse;ctx.lineWidth=2;ctx.setLineDash([8,10]);
      if(q.k==='diver'){const x=clamp(q.x,40,W*.4);ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.moveTo(x-14,4);ctx.lineTo(x,26);ctx.lineTo(x+14,4);ctx.closePath();ctx.fill();}
      else if(q.k==='crawler'){ctx.setLineDash([]);ctx.globalAlpha=(.2+.35*fr)*pulse;ctx.fillRect(0,0,6+10*fr,H);ctx.globalAlpha=(.45+.5*fr)*pulse;const y=q.up?H-26:26;ctx.beginPath();ctx.moveTo(4,y);ctx.lineTo(24,y+(q.up?16:-16));ctx.lineTo(24,y-(q.up?16:-16));ctx.closePath();ctx.fill();}
      else{ctx.setLineDash([]);ctx.beginPath();ctx.arc(q.bx,q.by,12+22*(1-fr),0,7);ctx.stroke();ctx.beginPath();ctx.arc(q.bx,q.by,5,0,7);ctx.fill();}}
    ctx.setLineDash([]);ctx.restore();}};
function ebRoom(){return ebCap()-G.eb.length>=3;}
NR.on('runStart',()=>{FLK.reset();FLK.n=0;});
NR.on('stageClear',()=>{FLK.tells=[];});
NR.on('tick',dt=>{try{if(G)FLK.tick(dt);}catch(err){}});
NR.on('kill',d=>{const e=d&&d.e;if(!e||!e.fk)return;FLK.stat.kill++;if(GX()<.7)G.pk.push({t:'shard',x:e.x,y:e.y,vx:rnd(-40,20),vy:rnd(-60,60),bob:rnd(0,7)});});
{const de=drawEnemy;drawEnemy=function(e,t){if(e.fk&&FLK.K[e.fk]){FLK.draw(e,t);return;}de(e,t);};}
{const dp=drawPickups;drawPickups=function(t){dp(t);try{if(FLK.on)FLK.drawTells(t);}catch(err){}};}
