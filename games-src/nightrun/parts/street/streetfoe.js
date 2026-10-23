// PURPOSE: Street fourth foe: the shield guard, a foe whose answer no other street foe asks for (get behind it)
// FLAG: shieldfoe (?shieldfoe=1; off by default)
// TEST: qa/streetsim.js with SHIELDFOE=1 (guard time to kill: a bot that gets behind it vs one that shoots its front)
/* ---------- W171 FOURTH FOE (street bar row E4: >= 4 foe types, each readable by silhouette and asking for its own answer).
   The guard (shield sheet: the only street foe carrying a riot shield) walks slowly at Kai behind a shield that stops EVERY shot and blow from the front
   (white sparks). Its back is bare. It turns slowly (TURN s), so the answer is to step or jump past it and shoot its back while it turns; its shield bash
   (CROUCH telegraph, then a short shove, 1 heart) punishes standing in front of it. After TIRED s on screen it lowers the shield (SHIELD DOWN), so a player
   who never gets behind it still finishes it, only much later.
   Player decision: walk past the guard (into the gunner's line and the rushers) to hit its back now, or keep shooting the others and let it come.
   Measured by streetsim (SHIELDFOE=1): guard time to kill for the bots that get behind it (gfirst, dodge) vs the one that does not (nearest).
   Placement: replaces two rushers in waves 5 and 9 of the street3/streethard plan (same threat weight, 2). ---------- */
if(RET.shieldfoe===undefined)RET.shieldfoe=/[?&]shieldfoe=1/.test(location.search);
(function(){
if(!window.FOOT||!FOOT._in||!FOOT.STAGES||!FOOT.STAGES.zeil||!FOOT.STAGES.zeil.s2)return;
const F=FOOT,IN=F._in,ST=F.STAGES.zeil,FL=470,abs=Math.abs,sgn=v=>v<0?-1:1;
const FE=window.FOOT_ENEMIES=window.FOOT_ENEMIES||{};
const G=F.GD={TURN:1,TIRED:4,SPD:60,REACH:100,CROUCH:.8,BASH:.25,REST:.8,CD:8,WAVES:[4,8],log:null};
const age=(e,env)=>e.seenAt2==null?0:env.G.time-e.seenAt2;
function go(e,s){e.state=s;e.sT=0;}
function walk(e,env,v,dt){const g=env.G,lo=g.camX+e.w/2,hi=g.camX+g.viewW-e.w/2,nx=e.x+v*dt;if(!e.seen||(nx>=lo&&nx<=hi))e.x=nx;e.vx=v;}
F.drawX=F.drawX||{};F.drawX.guard=(c,pose,x,y,h,flip,t,col)=>{IN.drawWho(c,'shield',pose,x,y,h,flip,t,col);};
FE.guard={hp:5,w:34,h:66,score:300,c:'#8aa0c0',touch:0,drops:['heal','w_shot'],dropP:.3,
  pose:e=>e.state==='dead'?'die':e.flash>0&&e.open?'hit':e.state==='wind'?'crouch':e.state==='bash'?'melee':abs(e.vx)>5?(Math.floor(e.t*5)%2?'run-a':'run-b'):'idle',
  onHit(e,d,env,hit){if(e.state==='dead'||e.open)return;const front=!hit||hit.x==null||sgn(hit.x-e.x)===e.facing;if(!front)return;
    e.hp+=d;e.flash=0;IN.ftBurst&&IN.ftBurst(e.x+e.facing*e.w*.5,e.y-e.h*.55,'#ffffff',4,200);if(G.log)G.log.blocked++;   // the shield stops it: white sparks, no damage
    if(G.log&&!G.log.toldB){G.log.toldB=1;IN.pop(e.x,e.y-e.h-26,'BLOCKED: GET BEHIND IT','#ffffff');}},
  ai(e,dt,env){const P=env.P,dx=P.x-e.x;
    if(!e._i){e._i=1;e.sT=0;e.state='walk';e.y=FL;e.facing=sgn(dx);e.cd=1.2;}
    e.sT+=dt;e.y=FL;if(e.state==='dead'){e.vx=0;e.tele=0;if(e.sT>.5)e.remove=true;return;}
    if(!e.open&&e.seen&&age(e,env)>G.TIRED){e.open=1;IN.pop(e.x,e.y-e.h-26,'SHIELD DOWN','#ffd23a');}   // a player who never gets behind it still finishes it
    e.cd-=dt;
    if(e.state==='wind'){e.vx=0;e.tele=G.CROUCH-e.sT;if(e.sT>=G.CROUCH){e.tele=0;go(e,'bash');}return;}
    if(e.state==='bash'){walk(e,env,e.facing*300,dt);const r={x:e.x+(e.facing>0?0:-50),y:e.y-e.h,w:50,h:e.h};env.melee(e,r,1);if(e.sT>=G.BASH){go(e,'rest');e.cd=G.CD;}return;}
    if(e.state==='rest'){e.vx=0;if(e.sT>=G.REST)go(e,'walk');return;}
    if(sgn(dx)!==e.facing&&abs(dx)>8){e.vx=0;e.tn=(e.tn||0)+dt;if(e.tn>=G.TURN){e.facing=sgn(dx);e.tn=0;}return;}   // a slow turn: the window to hit its back
    e.tn=0;
    if(abs(dx)<G.REACH&&abs(P.y-e.y)<120&&e.cd<=0&&e.grace<=0&&e.seen){go(e,'wind');return;}
    walk(e,env,abs(dx)>G.REACH*.8?e.facing*G.SPD:0,dt);},
  onDeath(e){e.state='dead';e.sT=0;e.tele=0;if(G.log&&e.seenAt2!=null)G.log.ttk.push(+(F.S.time-e.seenAt2).toFixed(2));
    const L=this.drops||[];e.dropList=L.length&&Math.random()<(this.dropP||0)?[L[Math.floor(Math.random()*L.length)]]:[];}};
if(F.S3&&F.S3.TH)F.S3.TH.guard=2;
/* placement: two rushers of waves 5 and 9 become one guard (flag on only) */
const st0=ST.hook.step;
ST.hook.step=function(S,dt,env){const r=st0.apply(this,arguments);
  if(RET.shieldfoe&&S.s3&&!S.gd){S.gd=G.log={ttk:[],blocked:0,placed:0};
    for(const i of G.WAVES){const w=S.s3.waves[i];if(!w||w.spawned)continue;let n=0;const keep=[];for(const u of w.left){if(u==='rusher'&&n<2){n++;continue;}keep.push(u);}
      if(n){keep.unshift('guard');w.left=keep;w.units=keep.slice();G.log.placed++;}}}
  return r;};
})();
