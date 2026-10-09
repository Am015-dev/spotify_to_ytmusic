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
  hpK(){return Math.min(1.7,1+.014*this.perks());},fk(){return 1+Math.min(.28,.022*Math.max(0,AIQ()-1))+Math.min(.12,.004*this.perks());},
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
NR.on('kill',({e})=>{if(!e||!e.ldr)return;G.score+=e.score;floater(e.x,e.y-30,'LEADER DOWN','#ffd23d');
  for(const f of G.en){if(f.lk===e&&f.hp>0){f.rg=1;f.shl=false;f.bf=Math.min(f.bf,2);}}});
{const de=drawEnemy;drawEnemy=function(e,t){de(e,t);if(e.type==='boss'||e.hp<=0)return;
  if(e.ldr){ctx.save();ctx.translate(e.x,e.y);if(!ART.have('spr-en-leader')){const g=ART.sil('spr-en-drone',e.r*2.9,'#ffd23d');if(g)ART.put(g,0,0,0,.3);}   // a gold sheen on the drone body until the leader sprite exists
    ctx.strokeStyle='#ffd23d';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(0,0,e.r+7,0,7);ctx.stroke();ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,e.r+12,0,7);ctx.stroke();
    const cy=-e.r-14;if(ART.have('fx-crown')){const o=ART.sp('fx-crown',22);ctx.globalCompositeOperation='lighter';ART.put(o,0,cy+4);ctx.globalCompositeOperation='source-over';}
    else{ctx.fillStyle='#ffd23d';ctx.beginPath();ctx.moveTo(-8,cy+8);ctx.lineTo(-8,cy);ctx.lineTo(-4,cy+4);ctx.lineTo(0,cy-3);ctx.lineTo(4,cy+4);ctx.lineTo(8,cy);ctx.lineTo(8,cy+8);ctx.closePath();ctx.fill();}   // crown (painted when fx-crown is ready)
    if(e.lArm){const k=PHF;ctx.globalCompositeOperation='lighter';G_(0,0,e.r*(1.8+1.2*k),'#ff3050',.25+.5*k);ctx.globalCompositeOperation='source-over';ctx.strokeStyle='#ff7080';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,e.r+16+14*(1-k),0,7);ctx.stroke();}
    hpBar(-18,-e.r-26,36,e.hp/e.max);ctx.restore();}
  else if(e.shl&&e.lk){ctx.save();ctx.strokeStyle='#19e3ff';ctx.globalAlpha=.7;ctx.lineWidth=1.5;ctx.setLineDash([4,4]);ctx.beginPath();ctx.arc(e.x,e.y,e.r+5,0,7);ctx.moveTo(e.x,e.y);ctx.lineTo(e.lk.x,e.lk.y);ctx.stroke();ctx.restore();}   // shield link to the leader
  else if(e.rg){ctx.save();ctx.globalCompositeOperation='lighter';G_(e.x,e.y,e.r*2,'#ff3050',.4);ctx.restore();}};}
{const fb=FXV.bullets;FXV.bullets=function(){fb.call(this);let any=false;for(const b of G.eb)if(b.hm>0){if(ART.have('fx-orb-homing')){const o=ART.bm['fx-orb-homing'],w=b.r*3.6;ctx.save();ctx.globalCompositeOperation='lighter';ctx.drawImage(o,b.x-w/2,b.y-w/2,w,w);ctx.restore();continue;}if(!any){ctx.save();ctx.strokeStyle='#ffffff';ctx.lineWidth=1.6;ctx.globalAlpha=.85;ctx.beginPath();any=true;}ctx.moveTo(b.x+b.r+3.5,b.y);ctx.arc(b.x,b.y,b.r+3.5,0,7);}if(any){ctx.stroke();ctx.restore();}};}
/* low hull: the song keeps its tempo; the screen edges pulse red on the beat and a soft heartbeat thumps under the music */
NR.on('beat',()=>{if(!G.live||G.dead||ST.over||!P||P.hp>1||!AU.a||AU.a.state!=='running')return;try{AU.osc(AU.a.currentTime+.02,'sine',58,.2,.5,AU.musv,38);}catch(e){}});
