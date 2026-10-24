// PURPOSE: Street GUARD: hold to block hits from the front (no damage, Kai is pushed back, the guard meter drops); pressed within 0.15 s before a hit it is a PARRY (no damage, the attacker is OPEN for 1 s and takes double damage; a parried slug flies back)
// FLAG: guard2 (?guard2=0 old)
// TEST: qa/streetsim.js (BOTS=dodge,parry)
/* ---------- STREETGUARD (W192, owner 24 Oct 2026: "no defense parry button"). The decision: shoot, close in, or wait for the attack and parry it.
   The guard is a stance, not a shell: it lasts at most 0.6 s per press (then 0.3 s before the next), only covers Kai's front, stops his gun and knife and plants his feet;
   each block costs a share of the meter (melee 30%, shots 15%), a heavy blow (2 damage) empties it, and an empty meter breaks the guard (the hit lands). Pose: the kai crouchshoot frame + a cyan arc.
   Keys: I or ; (J/K/L are fire/jump/knife); phone: GUARD button next to KNIFE. Engine hooks: F.guardHit (called by foot.js ftHurt), F.post, F.hitFeel, F.look.draw.
   Telemetry for the sim: S.gd {blocks, parries, refl, breaks, maxOn}. ---------- */
if(RET.guard2===undefined)RET.guard2=!/[?&]guard2=0/.test(location.search);
(function(){
if(!RET.guard2||!RET.foot||!window.FOOT||!FOOT._in||!FOOT._in.I)return;
const F=window.FOOT,IN=F._in,I=IN.I,abs=Math.abs;
const HOLD=.4,REST=.5,PARRY=.15,OPEN=1,REGEN=.15,CM=.5,CB=.2;
const G=S=>S.gd||(S.gd={on:0,t0:-9,cd:0,m:1,x:0,bt:-9,pf:0,blocks:0,parries:0,refl:0,breaks:0,maxOn:0,flash:0,cap:0});
let seen=0;try{seen=+localStorage.getItem('mnr_parry')||0;}catch(e){}
/* input -> stance; called from guardHit (a hit can land in the step the key went down) and from post */
function sync(S){const g=G(S),P=S.P;
  if(I.guardP&&!g.pf){g.pf=1;if(!g.on&&g.cd<=0&&g.m>.05&&P.hp>0){g.on=1;g.pd=0;g.t0=g.last=S.time;g.x=P.x;}}
  if(g.on&&(!I.guard&&!I.guardP||S.time-g.t0>=HOLD)){g.maxOn=Math.max(g.maxOn,g.last-g.t0);g.on=0;g.cd=REST;}
  return g;}
F.guardHit=function(n,fromX,src,b){const S=F.S;if(!S||!RET.guard2)return 0;const g=sync(S),P=S.P;src=src||'';
  if(!g.on||src==='blast'||(fromX!=null&&(fromX-P.x)*P.facing<-8))return 0;   // only the front, never a blast
  const shot=/^bul:/.test(src);
  if(S.time-g.t0<=PARRY&&!g.pd){g.pd=1;g.parries++;g.bt=S.time;g.flash=.25;IN.hitstop(70);IN.sfx('big');IN.pop(P.x+P.facing*20,P.y-84,'PARRY','#ffd23a',true);
    S.fx.push({slash:1,x:P.x+P.facing*26,y:P.y-40,w:90,l:.2,c:'#ffffff'});
    if(seen<1){seen=1;S.note={t:3,txt:'PARRY: guard just before the hit'};try{localStorage.setItem('mnr_parry','1');}catch(e){}}
    if(shot&&b){g.refl++;S.pb.push({z:P.z,x:b.x,y:b.y,vx:-b.vx*1.3,vy:-(b.vy||0),wid:'pistol',dmg:3,kind:'b',life:1.5,c:'#ffd23a',r:Math.max(5,b.r||6),pierce:0,hit:[],t:0});}
    else{const id=src.split(':')[1];let e=null;for(const o of S.E)if(!o.dead&&o.id===id&&(!e||abs(o.x-P.x)<abs(e.x-P.x)))e=o;
      if(e&&!e.boss&&abs(e.x-P.x)<220){e._opn=S.time+OPEN;e._ox=e.x+(e.x>P.x?1:-1)*Math.max(0,70-abs(e.x-P.x));}}   // knocked out of reach, frozen
    return shot?2:1;}
  if(g.pd&&S.time-g.bt<.3){g.bt=S.time;return shot?2:1;}   // the rest of a parried attack (contact frames) is absorbed
  if(n>=2&&!shot){g.m=0;g.bt=S.time;}   // a heavy blow (2 damage) breaks any guard: parry it, step out of line or jump
  else if(S.time-g.bt>.3){g.m-=shot?CB:CM;g.blocks++;}g.bt=S.time;
  if(g.m<=0){g.m=0;g.on=0;g.cd=1;g.breaks++;IN.pop(P.x,P.y-84,'GUARD BROKEN','#ff4060');return 0;}
  P.x-=P.facing*(shot?6:22);g.x=P.x;IN.sfx('graze');IN.pop(P.x,P.y-84,'BLOCK','#5ad1ff');IN.ftBurst(P.x+P.facing*22,P.y-40,'#5ad1ff',6);
  return shot?2:1;};
const post0=F.post;
F.post=function(S,dt){if(post0)post0.apply(this,arguments);const g=sync(S),P=S.P;g.pf=0;I.guardP=0;
  if(g.cd>0)g.cd-=dt;if(g.flash>0)g.flash-=dt;
  if(g.on){g.last=S.time;P.x=g.x;P.cd=Math.max(P.cd,.05);P.melCd=Math.max(P.melCd,.05);P._gd=1;}else{P._gd=0;if(S.time-g.bt>.5)g.m=Math.min(1,g.m+REGEN*dt);}
  for(const e of S.E)if(e._opn>S.time&&!e.dead){e.x=e._ox;e.tele=0;e.wind=0;e.cd=Math.max(e.cd||0,.3);if(e.vx)e.vx=0;}
  if(!S.sim)btn();};
/* OPEN foes take double damage */
const hf0=F.hitFeel;
F.hitFeel=function(e,d,src){if(hf0)hf0.apply(this,arguments);const S=F.S;if(!S||!(e._opn>S.time)||e.dead||(src&&src.gb))return;IN.dmgE(e,d,{gb:1,x:src&&src.x});};
/* pose: the braced crouchshoot frame while the guard is up */
const kx0=IN.kaiX;IN.kaiX=function(P){const r=kx0.apply(this,arguments);return P._gd&&!P.hurtT&&P.hp>0?'crouchshoot':r;};
/* the phone button, next to KNIFE (same size and style); keys I and ; */
let B=null,bk='';
function btn(){const L=IN.L();if(!L||!L.btn||!L.btn.melee)return;
  if(!B){B=document.createElement('button');B.type='button';B.className='fb';B.id='fGuard';B.textContent='GUARD';L.root.appendChild(B);
    const dn=e=>{e.preventDefault();if(!I.guard)I.guardP=1;I.guard=1;B.classList.add('on');try{B.setPointerCapture(e.pointerId);}catch(x){}},up=()=>{I.guard=0;B.classList.remove('on');};
    B.addEventListener('pointerdown',dn);B.addEventListener('pointerup',up);B.addEventListener('pointercancel',up);B.addEventListener('lostpointercapture',up);}
  const m=L.btn.melee,key=()=>Object.values(L.btn).map(b=>b.style.left+b.style.top+b.style.width+b.style.display+b.hidden).join('|'),k=key();if(k===bk)return;bk=k;   // every button counts: a relayout puts the one we moved back, and the key must notice
  if(m.hidden||m.style.display==='none'){B.hidden=true;B.style.display='none';return;}
  const z=parseFloat(m.style.width)||56,top=parseFloat(m.style.top),row=Object.values(L.btn).filter(b=>!b.hidden&&b.style.display!=='none'&&abs(parseFloat(b.style.top)+parseFloat(b.style.width)/2-top-z/2)<z/2);
  const x0=Math.min(...row.map(b=>parseFloat(b.style.left)));
  const ml=parseFloat(m.style.left),nb=row.filter(b=>parseFloat(b.style.left)<ml).sort((a,b)=>parseFloat(b.style.left)-parseFloat(a.style.left))[0];   // the button left of KNIFE moves out one slot, GUARD takes its place
  let gx=x0-z-8;if(nb){gx=parseFloat(nb.style.left);nb.style.left=Math.round(x0-parseFloat(nb.style.width)-8)+'px';bk=key();}
  B.hidden=false;B.style.display='';B.style.width=B.style.height=z+'px';B.style.left=Math.round(gx)+'px';B.style.top=Math.round(top)+'px';}
addEventListener('keydown',e=>{if(!F.on||!F.S||(e.code!=='KeyI'&&e.code!=='Semicolon'))return;e.preventDefault();e.stopImmediatePropagation();if(!e.repeat&&!I.guard)I.guardP=1;I.guard=1;},true);
addEventListener('keyup',e=>{if(e.code==='KeyI'||e.code==='Semicolon'){I.guard=0;}},true);
addEventListener('blur',()=>{I.guard=0;});
/* draw: a cyan arc in front of a guarding Kai, the meter under it, OPEN over a staggered foe, a white flash on a parry */
const SL=F.look;
if(SL&&SL.draw){const d0=SL.draw;
  SL.draw=function(c){const r=d0.apply(this,arguments);const S=F.S,L=IN.L();if(!r||!S||!L||!S.gd&&!S.E.some(e=>e._opn))return r;
    const g=G(S),P=S.P,K=SL.k,wy=(y,z)=>SL.my(y)-(z!=null&&SL.band?(1-z)*SL.band:0);
    c.save();c.translate(-S.camX,0);
    if(g.on){const y=wy(P.y-26,P.z),cx=P.x+P.facing*4*K;c.strokeStyle='#5ad1ff';c.lineWidth=5*K;c.globalAlpha=.85;c.beginPath();
      c.arc(cx,y,28*K,P.facing>0?-1:Math.PI-1,P.facing>0?1:Math.PI+1);c.stroke();c.globalAlpha=1;}
    if(g.on||g.m<1){const y=wy(P.y+6,P.z),w=40*K;c.fillStyle='rgba(5,3,12,.7)';c.fillRect(P.x-w/2-1,y-1,w+2,7);c.fillStyle=g.m<.3?'#ff4060':'#5ad1ff';c.fillRect(P.x-w/2,y,w*g.m,5);
      c.font='bold 9px monospace';c.textAlign='center';c.textBaseline='top';c.fillText('GUARD',P.x,y+7);}
    for(const e of S.E)if(e._opn>S.time&&!e.dead){const y=wy(e.y-e.h-14,e.z);c.font='bold 14px monospace';c.textAlign='center';c.textBaseline='bottom';c.fillStyle='#05030c';c.fillText('OPEN',e.x+1,y+1);c.fillStyle='#ffd23a';c.fillText('OPEN',e.x,y);}
    c.restore();
    if(g.flash>0){c.save();c.setTransform(1,0,0,1,0,0);c.globalAlpha=g.flash*1.2;c.fillStyle='#ffffff';c.fillRect(0,0,L.cv.width,L.cv.height);c.restore();}
    if(!g.cap&&S.time>3&&!S.end){g.cap=1;let n=0;try{n=+localStorage.getItem('mnr_guard')||0;}catch(e){}
      if(n<1){S.note={t:3.5,txt:L.touch?'GUARD: hold to block hits from the front':'GUARD: hold I to block hits from the front'};try{localStorage.setItem('mnr_guard','1');}catch(e){}}}
    return r;};}
})();
