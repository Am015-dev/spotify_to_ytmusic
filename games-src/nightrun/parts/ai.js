/* ---------- smarter enemies (the answer to "too easy with all the perks"), all gated by the level q ----------
   q = story level (2.4 .. 11.5), in endless 2 + district*1.6 + loop*3.
   - predictive aim: from q>=4 every shooter leads the ship, not only on Hard
   - dodging drones: from q>=3.5 almost half of the drones slide out of the lane of a shot that is about to hit them
   - squad leaders: from q>=3 a wave can come with a LEADER (gold crown, 3.5x hull). While it lives, the drones near it are shield-linked (they take under half damage);
     it fires a 5-way fan every fourth beat, with a red warning ring one beat before. Kill it and its squad panics (faster, shoots at once)
   - homing orbs: from q>=5 some gunship shots curve toward the ship for 1.5 s (ringed in white), turning slowly enough to dodge
   - perk pressure: every perk and upgrade you own adds a little hull to the enemies and a little speed to their fire (capped), so a maxed ship is still in a fight */
function AIQ(){return (ST.on?ST.lvl:2+G.pos*1.6+(G.loop||0)*3)+(DF.aq||0);}
const AI={perks(){let n=0;try{for(const k in SH.got)n+=SH.got[k]|0;for(const d of TP_DEF)n+=TP.l(d.id)|0;}catch(e){}return n;},
  hpK(){return Math.min(3,1+.02*this.perks());},fk(){return 1+Math.min(.28,.022*Math.max(0,AIQ()-1))+Math.min(.12,.004*this.perks());},
  ldrs(){return G.en.filter(e=>e.ldr&&e.hp>0);}};
NR.on('spawn',e=>{if(!G.live||G.dead||e.mini)return;const q=AIQ();
  if(e.type==='drone'){if(q>=3.5&&Math.random()<.2+.03*Math.min(q,10))e.dg=1;
    if(q>=3&&G.t-(G.lastSp||-9)>.05&&G.t-(G.ldT||-99)>Math.max(9,22-1.6*q)){G.ldT=G.t;e.ldr=1;e.lc=0;e.r=Math.round(e.r*1.35);e.hp=Math.round(e.hp*3.5);e.max=e.hp;e.score*=3;e.dg=0;}}
  G.lastSp=G.t;});
NR.on('tick',dt=>{if(!G.live||G.dead||G.over)return;const q=AIQ(),L=AI.ldrs();
  for(const e of G.en){if(e.type==='boss'||e.type==='gate'||e.hp<=0)continue;
    e.shl=false;if(!e.ldr&&L.length){for(const l of L)if(Math.abs(l.x-e.x)<250&&Math.abs(l.y-e.y)<200){e.shl=true;e.lk=l;break;}}   // (e.lk: the leader that shields it, drawn as a link)
    if(e.rg)e.x-=90*dt;
    if(e.dg&&e.type==='drone'&&e.x<W-20&&e.flash<=0){for(const b of G.pb){if(b.vx>0&&b.x<e.x&&e.x-b.x<300&&Math.abs(b.y-e.y)<e.r+14){e.by=clamp(e.by+(e.y>=b.y?1:-1)*(120+12*q)*dt,44,H-44);break;}}}}
  for(const b of G.eb){if(b.hm>0){b.hm-=dt;const sp=Math.hypot(b.vx,b.vy),a=Math.atan2(b.vy,b.vx),t=Math.atan2(P.y-b.y,P.x-b.x);let d=t-a;d=Math.atan2(Math.sin(d),Math.cos(d));
      const na=a+clamp(d,-1.1*dt,1.1*dt);b.vx=Math.cos(na)*sp;b.vy=Math.sin(na)*sp;}}});
NR.on('beat',()=>{if(!G.live||G.dead||ST.over)return;
  for(const e of G.en){if(!e.ldr||e.hp<=0||e.x>W-40)continue;
    if(e.lArm){e.lArm=false;if(Math.hypot(e.x-P.x,e.y-P.y)>110){eb.src=e;fan(e,5,.5,175+8*AIQ(),'#ffd23d');eb.src=null;}}
    else if(++e.lc>=4){e.lc=0;e.lArm=true;}}});
NR.on('kill',({e})=>{if(!e||!e.ldr)return;if(!G.over&&!ST.over)G.score+=e.score;floater(e.x,e.y-30,'LEADER DOWN','#ffd23d');
  for(const f of G.en){if(f.lk===e&&f.hp>0){f.rg=1;f.shl=false;f.bf=Math.min(f.bf,2);}}});
{const de=drawEnemy;drawEnemy=function(e,t){de(e,t);if(e.type==='boss'||e.hp<=0)return;
  if(e.ldr){ctx.save();ctx.translate(e.x,e.y);if(!ART.have('spr-en-leader')){const g=ART.sil('spr-en-drone',e.r*2.9,'#ffd23d');if(g)ART.put(g,0,0,0,.3);}   // a gold sheen on the drone body until the leader sprite exists
    ctx.strokeStyle='#ffd23d';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(0,0,e.r+7,0,7);ctx.stroke();ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,e.r+12,0,7);ctx.stroke();
    const cy=-e.r-14;if(ART.have('fx-crown')){const o=ART.sp('fx-crown',22);ctx.globalCompositeOperation='lighter';ART.put(o,0,cy+4);ctx.globalCompositeOperation='source-over';}
    else{ctx.fillStyle='#ffd23d';ctx.beginPath();ctx.moveTo(-8,cy+8);ctx.lineTo(-8,cy);ctx.lineTo(-4,cy+4);ctx.lineTo(0,cy-3);ctx.lineTo(4,cy+4);ctx.lineTo(8,cy);ctx.lineTo(8,cy+8);ctx.closePath();ctx.fill();}   // crown (painted when fx-crown is ready)
    if(e.lArm){const k=PHF;ctx.globalCompositeOperation='lighter';G_(0,0,e.r*(1.8+1.2*k),'#ff3050',.25+.5*k);ctx.globalCompositeOperation='source-over';ctx.strokeStyle='#ff7080';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,e.r+16+14*(1-k),0,7);ctx.stroke();}
    hpBar(-18,-e.r-26,36,e.hp/e.max);ctx.restore();}
  else if(e.shl&&e.lk){ctx.save();ctx.strokeStyle='#19e3ff';ctx.globalAlpha=.7;ctx.lineWidth=1.5;ctx.setLineDash([4,4]);ctx.beginPath();ctx.arc(e.x,e.y,e.r+5,0,7);if(!ART.have('fx-shield-link')){ctx.moveTo(e.x,e.y);ctx.lineTo(e.lk.x,e.lk.y);}ctx.stroke();ctx.restore();
    const sl=ART.bm['fx-shield-link'];if(sl){const dx=e.lk.x-e.x,dy=e.lk.y-e.y,d=Math.hypot(dx,dy);ctx.save();ctx.translate(e.x,e.y);ctx.rotate(Math.atan2(dy,dx));ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.75;ctx.drawImage(sl,0,-7,d,14);ctx.restore();}}   // shield link to the leader
  else if(e.rg){ctx.save();ctx.globalCompositeOperation='lighter';G_(e.x,e.y,e.r*2,'#ff3050',.4);ctx.restore();}};}
{const fb=FXV.bullets;FXV.bullets=function(){fb.call(this);let any=false;for(const b of G.eb)if(b.hm>0){if(ART.have('fx-orb-homing')){const o=ART.bm['fx-orb-homing'],w=b.r*3.6;ctx.save();ctx.globalCompositeOperation='lighter';ctx.drawImage(o,b.x-w/2,b.y-w/2,w,w);ctx.restore();continue;}if(!any){ctx.save();ctx.strokeStyle='#ffffff';ctx.lineWidth=1.6;ctx.globalAlpha=.85;ctx.beginPath();any=true;}ctx.moveTo(b.x+b.r+3.5,b.y);ctx.arc(b.x,b.y,b.r+3.5,0,7);}if(any){ctx.stroke();ctx.restore();}};}
/* low hull: the song keeps its tempo; the screen edges pulse red on the beat and a soft heartbeat thumps under the music */
NR.on('beat',()=>{if(!G.live||G.dead||ST.over||!P||P.hp>1||!AU.a||AU.a.state!=='running')return;try{AU.osc(AU.a.currentTime+.02,'sine',58,.2,.5,AU.musv,38);}catch(e){}});

/* ---------- bullet kinds: size, speed, look and impact differ now ----------
   orb    r5  lime, 1 hull (the default: turret fans, gunship rings)
   needle r3  thin and fast, 1 hull (drones, flankers, squad leaders)
   shell  r11 big and slow, orange, takes 2 hull (gunship rings, elite turrets, bosses)
   rocket r7  a missile that homes for 1.3 s, can be shot down (2 hits) and bursts into 5 pellets */
AI.n=0;
AI.kind=function(o,src){const q=AIQ(),n=++AI.n,sp=Math.hypot(o.vx,o.vy);const scale=f=>{const t=Math.min(f*sp,BCAP)/Math.max(1,sp);o.vx*=t;o.vy*=t;};
  if(!src)return o;const ty=src.type;
  if((ty==='drone'||ty==='flank')&&q>=2){o.k='n';o.r=3.2;o.dmg=1;o.gc='#e8ffb0';scale(1.3);if(src.ldr){o.r=3.6;scale(1.1);}}
  else if(ty==='gunship'){if(q>=4&&n%5===0){o.k='r';o.r=7;o.dmg=1;o.hp=2;o.hm=1.3;o.gc='#9fb0ff';scale(.8);}
    else if(q>=2.5&&n%4===0){o.k='s';o.r=11;o.dmg=2;o.gc='#ff8a2d';scale(.62);}}
  else if(ty==='turret'){if(q>=5&&n%5===0){o.k='s';o.r=10;o.dmg=2;o.gc='#ff8a2d';scale(.62);}}
  else if(ty==='boss'){if(n%7===0){o.k='s';o.r=12;o.dmg=2;o.gc='#ff8a2d';scale(.6);}else if(q>=6&&n%11===0){o.k='r';o.r=7;o.dmg=1;o.hp=2;o.hm=1.3;o.gc='#9fb0ff';scale(.8);}}
  else if(src.el&&q>=3&&n%6===0){o.k='s';o.r=9;o.dmg=2;o.gc='#ff8a2d';scale(.66);}
  return o;};
/* shooting a rocket down: two hits, then it bursts into five pellets */
NR.on('tick',()=>{if(!G.live||G.dead)return;let any=false;for(const b of G.eb)if(b.k==='r'){any=true;break;}if(!any)return;
  for(const r of G.eb){if(r.k!=='r'||r.dead)continue;for(const b of G.pb){if(b.dead)continue;if((b.x-r.x)**2+(b.y-r.y)**2<(r.r+5+(b.rad||0))**2){if(!b.px)b.dead=1;r.hp-=1;burst(r.x,r.y,'#9fb0ff',3,100,.25);
        if(r.hp<=0){r.dead=1;G.score+=60;for(let i=0;i<5;i++){const a=i*Math.PI*2/5+Math.random();G.eb.push({x:r.x,y:r.y,vx:Math.cos(a)*130,vy:Math.sin(a)*130,r:3.5,c:BULLET,g:true,sl:false,hm:0,dmg:1});}ART.boom('explosion-small',r.x,r.y,44,.3);AU.sfx('hit');}break;}}}});
/* drawing the three kinds that are not orbs (the base pass draws the orbs; c.js draws a glow under every bullet) */
{const fb2=FXV.bullets;FXV.bullets=function(){const all=G.eb;let sp=false;for(const b of all)if(b.k){sp=true;break;}
  if(!sp){fb2.call(this);return;}G.eb=all.filter(b=>!b.k);fb2.call(this);G.eb=all;
  ctx.save();for(const b of all){if(!b.k)continue;const a=Math.atan2(b.vy,b.vx);
    if(b.k==='n'){ctx.strokeStyle='#07030f';ctx.lineWidth=b.r*2.1;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(b.x-Math.cos(a)*9,b.y-Math.sin(a)*9);ctx.lineTo(b.x+Math.cos(a)*5,b.y+Math.sin(a)*5);ctx.stroke();
      ctx.strokeStyle='#d8ff7a';ctx.lineWidth=b.r*1.1;ctx.beginPath();ctx.moveTo(b.x-Math.cos(a)*8,b.y-Math.sin(a)*8);ctx.lineTo(b.x+Math.cos(a)*4,b.y+Math.sin(a)*4);ctx.stroke();}
    else if(b.k==='s'){const pu=.5+.5*Math.sin(G.t*9+b.x*.05);ctx.fillStyle='#07030f';ctx.beginPath();ctx.arc(b.x,b.y,b.r+3,0,7);ctx.fill();ctx.fillStyle='#ff8a2d';ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,7);ctx.fill();
      ctx.fillStyle='#ffd9a0';ctx.beginPath();ctx.arc(b.x,b.y,b.r*(.45+.15*pu),0,7);ctx.fill();ctx.strokeStyle='#fff';ctx.globalAlpha=.7;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(b.x,b.y,b.r+5,0,7);ctx.stroke();ctx.globalAlpha=1;}
    else if(b.k==='r'){ctx.save();ctx.translate(b.x,b.y);ctx.rotate(a);ctx.fillStyle='#07030f';ctx.fillRect(-12,-b.r-2,22,b.r*2+4);ctx.fillStyle='#c9d2ff';ctx.fillRect(-10,-b.r+1,17,b.r*2-2);ctx.fillStyle='#ff3050';ctx.beginPath();ctx.moveTo(7,-b.r+1);ctx.lineTo(13,0);ctx.lineTo(7,b.r-1);ctx.fill();
      ctx.globalCompositeOperation='lighter';G_(-14,0,7+Math.random()*3,'#ffa02d',.9);ctx.restore();}}
  ctx.restore();};}

/* the discharge warning: a red ring that tightens around the ship as the next tick nears */
{const dp=drawPlayer;drawPlayer=function(t){dp(t);if(!STILL.dg||G.dead)return;const k=(STILL.dr||0)/(STILL.iv||2);ctx.save();ctx.strokeStyle='#ff3050';ctx.globalAlpha=.4+.5*k;ctx.lineWidth=2+3*k;ctx.setLineDash([6,5]);ctx.lineDashOffset=-t*40;ctx.beginPath();ctx.arc(P.x,P.y,46-24*k,0,7);ctx.stroke();ctx.restore();};}
