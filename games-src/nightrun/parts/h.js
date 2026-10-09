/* ---------- H: no AFK wins, a dying ship slows the song ----------
   STILL (declared in b.js): a ship that stays within 50 px of one spot for more than 3 s is hunted: enemies fire faster and their bullets are quicker,
   the score of kills and the multiplier decay, and a SNIPER LANE (a beam along the ship's row: it follows the ship for two beats, locks for one, fires on the
   next) comes round every 3 to 5 beats. Moving 50 px away (or dashing) resets everything; the beam is locked for a whole beat, so a ship that moves is never hit by it.
   DYE (declared in b.js): hull 2 -> song x0.92, hull 1 -> x0.85, death -> tape stop to x0.5. The beat clock follows (NR.music.setRate), so the rhythm stays in sync. */
const STILLF=()=>HARD?2:3,STILL_RAMP=6,BEAM_Y=16;
NR.on('runStart',()=>{Object.assign(STILL,{t:0,k:0,fk:1,bk:1,sk:1,ax:P.x,ay:P.y,beam:null,nb:0,said:false});Object.assign(DYE,{cur:1,q:1});});
NR.on('runEnd',()=>{Object.assign(STILL,{t:0,k:0,fk:1,bk:1,sk:1,beam:null});if(DYE.q!==1||NR.music.rate!==1){DYE.cur=DYE.q=1;try{NR.music.setRate(1);}catch(e){}}});
NR.on('tick',dt=>{if(!G.live)return;
  if(dt>0){const k=Math.min(1,dt*8);PV.x+=((P.x-PV.px)/dt-PV.x)*k;PV.y+=((P.y-PV.py)/dt-PV.y)*k;PV.px=P.x;PV.py=P.y;if(P.dashT>0){PV.x*=.3;PV.y*=.3;}}
  /* --- dying slows the beat --- */
  const tgt=1,tau=.2;   // the song never slows down any more (it sounded bad): low hull is shown by a red pulse and a heartbeat instead, see ai.js
  DYE.cur+=(tgt-DYE.cur)*Math.min(1,dt/tau);if(Math.abs(DYE.cur-tgt)<.004)DYE.cur=tgt;
  const q=Math.round(DYE.cur*100)/100;if(q!==DYE.q){DYE.q=q;const rt=PW.st().act.find(a=>PWK[a.k].rate),want=(rt?PWK[rt.k].rate:1)*q;if(Math.abs(NR.music.rate-want)>=.005)NR.music.setRate(want);}
  if(G.dead){STILL.beam=null;return;}
  /* --- stillness --- */
  if(Math.hypot(P.x-STILL.ax,P.y-STILL.ay)>50||P.dashT>0){STILL.ax=P.x;STILL.ay=P.y;STILL.t=Math.max(0,STILL.t-STILL.t*.5);if(STILL.t<.5)STILL.t=0;}
  else if(G.t>6&&G.transT<0)STILL.t+=dt;
  const s=Math.max(0,STILL.t-STILLF()),k=Math.min(1,s/STILL_RAMP);STILL.k=k;
  STILL.fk=1+1.4*k;STILL.bk=1+.22*k;STILL.sk=Math.max(.12,1-.88*k);
  if(s>0&&G.mult>1)G.mult=Math.max(1,G.mult-.4*dt);
  if(STILL.t>STILLF()+.6&&!STILL.said){STILL.said=true;floater(P.x,P.y-44,'KEEP MOVING','#ff6a7a');}
  /* static discharge: staying in one spot for long drains hull that shields and invulnerability cannot stop, however strong the ship is. Moving resets it. */
  if(STILL.t>STILLF()+6&&!godMode&&!ST.over&&!G.over&&G.transT<0&&!SH.active){STILL.dr=(STILL.dr||0)+dt;STILL.dg=1;const IV=STILL.t>STILLF()+20?1.2:2;STILL.iv=IV;if(STILL.dr>=IV){STILL.dr=0;P.hp=Math.max(0,P.hp-1);G.flash=Math.max(G.flash,.2*FX());G.glitch=.3*FX();AU.sfx('hurt');floater(P.x,P.y-30,'STATIC DISCHARGE','#ff3050');burst(P.x,P.y,'#ff3050',16,240);if(P.hp<=0)die();}}
  else{STILL.dr=0;STILL.dg=0;}
  /* --- the sniper lane --- */
  const B=STILL.beam;if(B){if(B.n<(HARD?1:2))B.y+=(P.y-B.y)*Math.min(1,dt*7);if(B.fire>0){B.fire-=dt;if(!G.dead&&Math.abs(P.y-B.y)<BEAM_Y&&!B.hit){B.hit=1;hurt(B.dmg);}if(B.fire<=0)STILL.beam=null;}}});
NR.on('beat',()=>{if(G.dead||!G.live)return;const B=STILL.beam;
  if(B){B.n++;if(B.n===(HARD?2:3)){B.fire=.3;AU.sfx('big');shake(5);}return;}
  if(STILL.t>STILLF()+.6&&G.bc>=STILL.nb&&!G.boss){STILL.beam={y:P.y,n:0,fire:0,hit:0,dmg:1+(STILL.k>=1?1:0)+(STILL.t>STILLF()+14?1:0)};STILL.nb=G.bc+(STILL.k>=1?2:HARD?3:6)-(STILL.k>=.5&&!HARD?1:0);/* standing still: the lane comes more often and hits harder the longer you stay */AU.sfx('warn');}});   // 3 beats of beam + the gap
{const dp=drawPickups;drawPickups=function(t){dp(t);const B=STILL.beam;if(!B||G.dead)return;
  ctx.save();ctx.globalCompositeOperation='lighter';const lock=B.n>=(HARD?1:2),f=B.fire>0;
  if(f){ctx.globalAlpha=.95;ctx.fillStyle='#ffffff';ctx.fillRect(0,B.y-BEAM_Y*.5,W,BEAM_Y);ctx.globalAlpha=.5;ctx.fillStyle='#ff3050';ctx.fillRect(0,B.y-BEAM_Y,W,BEAM_Y*2);}
  else{const pulse=SET.reduce?1:Math.floor(t*(lock?18:8))%2?1:.6;ctx.globalAlpha=(lock?.9:.45)*pulse;ctx.strokeStyle=lock?'#ff3050':'#ff7080';ctx.lineWidth=lock?3:1.5;ctx.setLineDash(lock?[]:[14,10]);
    ctx.beginPath();ctx.moveTo(0,B.y);ctx.lineTo(W,B.y);ctx.stroke();ctx.setLineDash([]);if(lock){ctx.globalAlpha=.18*pulse;ctx.fillStyle='#ff3050';ctx.fillRect(0,B.y-BEAM_Y,W,BEAM_Y*2);}}
  ctx.restore();};}
