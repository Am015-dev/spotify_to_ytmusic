// PURPOSE: the street drawn with the owner's art only: painted backdrop layers in order, Kai and the foes from their sheets at one scale, owner fx/pickup/prop pictures, a minimal edge HUD
// FLAG: purefoot (?purefoot=0 = the old look)
// FLAG: footmove (W223; ?footmove=1 on, ?footmove=0 off): moves timed by state (wind-up / strike / recovery, aim hold, turn), shot bolts + muzzle / impact frames, backdrop depth, prop shadows
// TEST: qa/purefoot-shot.js (one phone + one PC shot, the same stepped moment on and off)
/* ---------- PUREFOOT (W217, owner 24 Oct 2026: "the owner's art is good, our code overlays made it ugly"). The outermost F.look.draw: with RET.purefoot on, none of the
   overlay wrappers run (street3 lamp pools / grade / wet mirror, streetblend, streetguard meter and OPEN text, streetcombo HITS panel, streetfeel OVERDRIVE panel).
   Drawn: streetlook's painted backdrop and prop sheets, street2 prop pictures, pickup pictures, actors through drawWho (sheets, FA.shadow soft contact shadow), owner shot /
   muzzle / grenade / fx pictures, enemy bullets as a keyed fx-bullet-enemy core (normal blend, pistol-flash size), then streetlook's HUD without the hint line, the BEHIND caption and the progress bar, and the overdrive / guard meters under the hearts panel.
   Not drawn: code shapes (wind-up discs and boxes, shield ring, dash box, shadow ellipses, rings, slashes, squares, checkpoint flags), play-field text, the occlusion fade.
   Telegraphs are poses: a foe winding up shows its melee sheet, a gunner calling a shot its shoot sheet. Gameplay is untouched (the sim never draws). ---------- */
(function(){
if(!window.FOOT||!FOOT._in||!FOOT.look||!FOOT.look._p)return;
const F=FOOT,IN=F._in,SL=F.look,X=SL._p,FL=470,old=SL.draw;
if(RET.footmove===undefined)RET.footmove=/[?&]footmove=1/.test(location.search);   // W223 footmove (?footmove=1 on, ?footmove=0 off)
const pic=(c,id,x,y,w,a,al)=>{if(window.AH&&AH.ftDraw(c,id,x,y,w,a,al))return true;const o=typeof ART!=='undefined'&&ART.img&&ART.img(id)&&ART.sp(id,w);if(!o)return false;   // owner fx pictures are painted on black: added with 'lighter'
  c.save();c.globalCompositeOperation='lighter';c.globalAlpha=al==null?1:Math.max(0,Math.min(1,al));c.translate(x,y);if(a)c.rotate(a);c.drawImage(o.c,-o.w/2,-o.h/2,o.w,o.h);c.restore();return true;};
/* foe shots: the owner's orb is painted on black (no alpha). One keyed copy: alpha from brightness, the faint outer glow cut, cropped to the core, drawn with the normal blend */
const KEY={};function keyed(id){if(id in KEY)return KEY[id];const im=typeof ART!=='undefined'&&ART.img&&ART.img(id);if(!im||!im.width)return null;
  const w=im.width,h=im.height,cv=document.createElement('canvas');cv.width=w;cv.height=h;const g=cv.getContext('2d');g.drawImage(im,0,0);const D=g.getImageData(0,0,w,h),d=D.data;let x0=w,y0=h,x1=0,y1=0;
  for(let i=0;i<d.length;i+=4){const m=Math.max(d[i],d[i+1],d[i+2]),a=m<70?0:Math.min(255,(m-70)*255/120);if(a>0){for(let j=0;j<3;j++)d[i+j]=Math.min(255,d[i+j]*255/m);const q=i/4,x=q%w,y=(q-x)/w;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}d[i+3]=a;}
  if(x1<x0)return KEY[id]=null;g.putImageData(D,0,0);const o=document.createElement('canvas');o.width=x1-x0+1;o.height=y1-y0+1;o.getContext('2d').drawImage(cv,-x0,-y0);return KEY[id]=o;}
/* FOOTMOVE (W223, owner 24 Oct 2026 20:20: "the moves by the enemies and player are shit, the bullets are ugly, props and background are not blending"). Draw-only (the sim never draws, balance is
   the accel line in foot.js stepPlayer). Frame events in the manner of the open-source OpenBOR engine: an attack is anticipation -> strike -> recovery frames of one sheet, the strike frame lines up
   with the moment the hit lands; a shooter holds its aim pose between shots and restarts the recoil frames on each shot; a turn plays a short squash; shots get a muzzle frame, a bolt and an impact. */
const MV=F.mv={log:{strike:0,turn:0,muz:0,imp:0}},EB=new WeakSet(),EFX=[];let ebLast=[],efT=null;
function mvE(e,who,pose,t){const S=F.S,now=S.time,d=Math.max(0,Math.min(.1,now-(e._at==null?now:e._at)));e._at=now;let r=1;
  if(!e.dead){const mp=ART.FM&&ART.FM[who],o=mp&&mp.melee&&ART.aS(who+'/'+mp.melee),tot=o?o.tot:.4;
    const ant=e.wind>0||e.state==='crouch'&&e.tele>0;   // wind-up: the generic melee foe's wind, the rusher's crouch (its telegraph; it holds a knife, not a gun)
    if(ant){if(!e._an){e._an=1;e._w0=Math.max(.1,e.wind>0?e.wind:e.tele);}pose='melee';r=.42*tot/e._w0;}   // anticipation: the first ~40% of the attack sheet spread over the wind-up
    else{if(e._an){e._an=0;e._rc=e.state==='lunge'?.66:.36;e._mt=0;MV.log.strike++;}if(e._rc>0&&!(e.flash>0)){e._rc-=d;e._mt+=d;pose='melee';r=e._mt<.1?.58*tot/.1:.15;}else e._rc=0;}}   // strike frames in 0.1 s as the hit lands (the lunge starts), then a slow recovery
  e._ac=(e._ac==null?t:e._ac)+d*r;return [pose,e._ac];}
function turn(c,e,x){const now=F.S.time,sn=now-(e._td==null?-9:e._td)<=.1;e._td=now;if(e._fc!==e.facing){if(e._fc!=null&&sn){e._tt=now;MV.log.turn++;}e._fc=e.facing;}   // W232: squash only a turn seen within the last 0.1 s; one made while the actor was not drawn (stepped sim, off screen) is over, so it no longer pins the width at .35
  const k=(now-(e._tt==null?-9:e._tt))/.1;if(k>=0&&k<1){const s=.35+.65*k;c.translate(x,0);c.scale(s,1);c.translate(-x,0);}}
/* W234 bullets, the ENGINE-LESSONS 1 recipe (normal blend): 1 px dark rim, tinted edge, small white core; 'lighter' only for a small halo. Foe shots are round and warm (their own colour unless it is cyan-ish), player shots are long cyan streaks */
const hueOf=h=>{h=/^#[0-9a-f]{6}$/i.test(h)?h:'#ff4a6a';const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),bl=parseInt(h.slice(5,7),16),mx=Math.max(r,g,bl),mn=Math.min(r,g,bl);if(mx-mn<40)return 350;const d=mx-mn,q=mx===r?((g-bl)/d+6)%6:mx===g?(bl-r)/d+2:(r-g)/d+4;return q*60;};
function halo(c,x,y,r,col,al){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=al;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(x-r,y-r,2*r,2*r);c.restore();}
function eShot(c,b){const a=Math.atan2(b.vy,b.vx),sp=Math.hypot(b.vx,b.vy),h=hueOf(b.c),ed=h>140&&h<230?350:h,tl=Math.max(6,Math.min(13,sp*.035)),E='hsl('+Math.round(ed)+',100%,66%)',R=3.6;c.save();c.translate(b.x,b.y);c.rotate(a);
  halo(c,0,0,R*2.1,'hsl('+Math.round(ed)+',100%,55%)',.35);
  c.fillStyle='#120818';c.beginPath();c.moveTo(0,-R-1);c.lineTo(-tl,0);c.lineTo(0,R+1);c.arc(0,0,R+1,Math.PI/2,-Math.PI/2,true);c.fill();   // rim: the orb and its short tail, 1 px bigger
  c.fillStyle='hsl('+Math.round(ed)+',100%,40%)';c.beginPath();c.moveTo(0,-R*.8);c.lineTo(-tl*.85,0);c.lineTo(0,R*.8);c.fill();
  c.fillStyle=E;c.beginPath();c.arc(0,0,R,0,6.283);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(0,0,R*.6,0,6.283);c.fill();c.restore();}
function pShot(c,b){if(b.kind!=='bul'&&b.kind!=='pel')return AH.ftBul(c,b);const a=Math.atan2(b.vy,b.vx),pel=b.kind==='pel',L=pel?5:9,R=pel?1.8:2;c.save();c.translate(b.x,b.y);c.rotate(a);
  halo(c,0,0,L*1.1,'hsl(188,100%,55%)',.3);
  c.fillStyle='#061418';c.beginPath();c.moveTo(-L-1,0);c.lineTo(-L*.2,-R-1);c.lineTo(L*.35,-R-1);c.lineTo(L*.7+1,0);c.lineTo(L*.35,R+1);c.lineTo(-L*.2,R+1);c.fill();
  c.fillStyle='hsl(188,100%,62%)';c.beginPath();c.moveTo(-L,0);c.lineTo(-L*.2,-R);c.lineTo(L*.35,-R);c.lineTo(L*.7,0);c.lineTo(L*.35,R);c.lineTo(-L*.2,R);c.fill();
  c.fillStyle='#fff';c.fillRect(-L*.3,-R*.38,L*.8,R*.76);c.restore();}   // a streak, longer than wide, under the foe shots (drawn first)
function efx(c,K,at,ko){const S=F.S,now=S.time,d=efT==null?0:Math.max(0,Math.min(.1,now-efT));efT=now;
  for(const b of S.eb)if(!EB.has(b)){EB.add(b);EFX.push({x:b.x,y:b.y,z:b.z,t:0,m:.08,k:'m'});MV.log.muz++;}
  const cur=new Set(S.eb);for(const b of ebLast)if(!cur.has(b)&&b.life>.05){EFX.push({x:b.x,y:b.y,z:b.z,t:0,m:.18,k:'i'});MV.log.imp++;}ebLast=S.eb.slice();
  for(let i=EFX.length-1;i>=0;i--){const f=EFX[i];f.t+=d;if(f.t>=f.m||EFX.length>40){EFX.splice(i,1);continue;}if(!ko)continue;const k=f.t/f.m,w=f.k==='m'?10*(1-.4*k):6+9*k;SL.z=f.z;at(c,f.x,f.y,K);
    halo(c,f.x,f.y,w*.8,f.k==='m'?'#ffd9a0':'#ffffff',(1-k)*.7);c.restore();}   /* W234: a small white-hot flash in the shot's own spot (the owner's green orb tinted every foe shot green) */SL.z=null;}   // enemy muzzle frame at the shot's start, impact where it stopped (cover, Kai, the knife)
/* edge HUD tells under the hearts panel (no play-field drawing): overdrive meter / READY, guard meter while it is used or refilling */
function tells(c,L,S,u,fs){const b=L.hud&&L.hud.hud&&L.hud.hud[0];if(!b)return;const rows=[],OD=F.OD,g=S.gd;
  if(RET.overdrive&&OD&&OD.v>0){const full=OD.v>=OD.max;rows.push([full?'OVERDRIVE READY: BOMB':'OVERDRIVE',OD.v/OD.max,full?(Math.floor(S.time*4)%2?'#ffffff':'#19e3ff'):'#19a8c8']);}
  if(g&&(g.on||g.m<1))rows.push([g.cd>0?'GUARD BROKEN':'GUARD',g.m,g.m<.3?'#ff4060':'#5ad1ff']);if(!rows.length)return;
  const t0=SL.t0,pd=8*u,rh=26*u,x=b.x,y=t0+b.y+b.h+6*u,w=b.w,h=2*pd+rows.length*rh-6*u;
  c.save();c.fillStyle='rgba(5,3,12,.62)';X.slRR(c,x,y,w,h,8*u);c.fill();c.strokeStyle='rgba(255,255,255,.12)';c.lineWidth=u;c.stroke();
  c.textAlign='left';c.textBaseline='top';c.font='bold '+fs(12)+'px monospace';rows.forEach(([t,v,col],i)=>{const ry=y+pd+i*rh;c.fillStyle=col;c.fillText(t,x+pd,ry,w-2*pd);
    c.fillStyle='#ffffff1c';c.fillRect(x+pd,ry+15*u,w-2*pd,5*u);c.fillStyle=col;c.fillRect(x+pd,ry+15*u,(w-2*pd)*Math.max(0,Math.min(1,v)),5*u);});c.restore();
  L.hud.hud.push({x,y:y-t0,w,h});SL.hudB=Math.max(SL.hudB||0,y-t0+h+8*u);}
function pure(c){const L=IN.L(),S=F.S;if(!L||!S)return false;X.slFrame(L,1.7);   // actors 1.7x (benchmark-size); slFrame(L) at the end puts the base scale back for gameplay readers (tidy.js flyer band)
  const K=SL.k,t0=SL.t0,dpr=L.dpr||1,sc=L.sc*dpr,vw=L.vw,exl=L.exl||0,exr=L.exr||0,P=S.P,u=1/L.sc,at=X.at;
  c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
  c.setTransform(1,0,0,1,0,0);c.fillStyle='#05030c';c.fillRect(0,0,L.cv.width,L.cv.height);
  c.setTransform(sc,0,0,sc,(L.box.x-L.ox)*dpr,(L.box.y-L.oy)*dpr-t0*sc);
  const sh=S.shake?IN.ftRnd(-S.shake,S.shake)*.5:0;SL.road=L.box.y+(FL+sh*.5-t0)*L.sc;SL.cam=S.camX;
  c.save();c.translate(sh,sh*.5);X.slBackdrop(c,S,vw,exl,exr,t0,Math.min(3,sc));if(RET.footmove){const FR=FL-(SL.band||0),g=c.createLinearGradient(0,t0,0,FR);const bx=-exl-20,bw=vw+exl+exr+40;c.save();c.globalCompositeOperation='saturation';c.fillStyle='rgba(128,128,128,.45)';c.fillRect(bx,t0-10,bw,FR-t0+10);c.restore();   // W228: backdrop saturation down
    g.addColorStop(0,'rgba(9,5,26,.55)');g.addColorStop(1,'rgba(9,5,26,.42)');c.fillStyle=g;c.fillRect(bx,t0-10,bw,FR-t0+10);   // W228: backdrop value down (actors are the loudest plane)
    const hz=(FR-t0)*.4,hg=c.createLinearGradient(0,FR-hz,0,FR);hg.addColorStop(0,'rgba(70,58,96,0)');hg.addColorStop(.7,'rgba(70,58,96,.26)');hg.addColorStop(1,'rgba(70,58,96,.14)');c.fillStyle=hg;c.fillRect(bx,FR-hz,bw,hz);
    const fg=c.createLinearGradient(0,FR,0,FR+36);fg.addColorStop(0,'rgba(70,58,96,.14)');fg.addColorStop(1,'rgba(70,58,96,0)');c.fillStyle=fg;c.fillRect(bx,FR,bw,36);
    c.fillStyle='rgba(5,3,12,.38)';c.fillRect(bx,FR,bw,L.cv.height/(L.sc*dpr)+t0-FR+40);
    const fd=c.createLinearGradient(0,FR,0,FL+30);fd.addColorStop(0,'rgba(5,3,12,0)');fd.addColorStop(.45,'rgba(5,3,12,.3)');fd.addColorStop(1,'rgba(5,3,12,.55)');c.fillStyle=fd;c.fillRect(bx,FR,bw,L.cv.height/(L.sc*dpr)+t0-FR+40);}   // W232: the front lanes settle darker, so the road reflections under Kai and the foes stay below their value   // W228: the floor a value step down too, so the lit fighters lead   // W228: a haze band behind the play line   // footmove: the backdrop a step darker than the play plane (aerial depth), the floor untouched
  c.translate(-S.camX,0);const lo=S.camX-exl,hi=S.camX+vw+exr,PK=F.PICKUPS;
  for(const p of S.pk){const d=PK[p.k],q=d&&X.slPic(X.pkPic(p.k)),am=p.k==='ammo'&&RET.sprites&&ART.ANIM.c['pk-ammo/spin']&&ART.anim('pk-ammo/spin');if(!am&&(!q||!q.width))continue;const bob=Math.sin(p.t*5)*3,r=17*K,edge=Math.min(p.x-r-lo,hi-p.x-r),fa=Math.max(0,Math.min(1,(edge-6)/24));if(fa<=0)continue;
    const y=p.y+bob,Y=Math.max(SL.my(y),t0+4+r),pz=p.z!=null&&SL.band?p.z:1,k=K*(.9+.1*pz),h=40,w=q&&q.width?h*q.width/q.height:h;
    c.save();c.translate(p.x,Y-(1-pz)*SL.band);c.scale(k,k);c.translate(-p.x,-y);c.globalAlpha=(p.t>13?.5+.5*Math.sin(p.t*20):1)*fa;SL.tag='pk';if(RET.footmove){const D=18,gy=y+16-bob,cy=gy-D/2-1+bob*.4,hk='pk-health/spin',hl=p.k==='heal'&&RET.sprites&&ART.ANIM.c[hk]&&ART.anim(hk);c.save();c.translate(p.x,gy);FA.shadow(c,D*1.1,.9);c.restore();if(am||hl)ART.drawAnim(c,am?'pk-ammo/spin':hk,p.t,p.x,cy,D/ART.ANIM.c[am?'pk-ammo/spin':hk].bw,false);else{c.save();c.beginPath();c.arc(p.x,cy,D/2,0,6.283);c.clip();c.drawImage(q,q.width*.25,q.height*.25,q.width*.5,q.height*.5,p.x-D/2,cy-D/2,D,D);c.restore();}}   /* W232 footmove: a small token on the floor with a contact shadow (the emblem from the middle of the owner's picture, no hex frame), not a 40 px icon in mid-fight */
    else if(am)ART.drawAnim(c,'pk-ammo/spin',p.t,p.x,y,32/ART.ANIM.c['pk-ammo/spin'].bw,false);else c.drawImage(q,p.x-w/2,y-h/2-4,w,h);SL.tag='';c.restore();}
  const dP=p=>{if(p.hp<=0&&!p.fl)return;SL.z=p.z;let ok=false;if(RET.footmove&&window.FA&&FA.shadow){at(c,p.x,p.y,K);c.translate(p.x,p.y);FA.shadow(c,p.w*1.5,1);c.restore();}   // footmove: props stand on the floor like the actors (same soft contact shadow)
   const gk=RET.footmove;if(gk)c.filter=p.k==='kiosk'?'brightness(.6) saturate(.7)':p.k==='car'?'brightness(.36) saturate(.6)':'brightness(.8) saturate(.75)';if(p.draw){try{ok=p.draw(c,K,at);}catch(x){}}if(gk)c.filter='none';   // W225: the lit vending kiosk a value step under the fighters; W232: the hover-car cover (pale thrusters right behind the fight) two steps
    if(!ok){const hd=Math.min(p.h,1.25*64);at(c,p.x,p.y,K);c.fillStyle=p.c;c.fillRect(p.x-p.w/2,p.y-hd,p.w,hd);c.restore();}SL.z=null;};   // a prop with no picture yet keeps its flat box (it blocks shots)
  const dE=e=>{const sx=RET.footmove&&e._sx||0;e.x+=sx;try{dE0(e);}finally{e.x-=sx;}};   // W225 footmove: the drawn personal-space offset
  const dE0=e=>{if(e.dead&&!(e.ext&&!e.remove))return;const ex=e.h*K*.7;if(e.x-ex>hi||e.x+ex<lo)return;SL.z=e.z;
    let pose=e.dead?'die':(()=>{try{return e.def.pose?e.def.pose(e):'idle';}catch(x){return'idle';}})();if(!e.dead){if(e.wind>0)pose='melee';else if(e.tele>0)pose='shoot';}   // telegraph = the attack pose
    let et=e.dead?e.dt_||0:e.t;if(RET.footmove&&!e.dead)[pose,et]=mvE(e,e.id,pose,et);
    const ey=e.ext&&e.fly?e.y+e.h/2:e.y;at(c,e.x,ey,K);if(RET.footmove&&!e.dead)turn(c,e,e.x);ART.fE=e;IN.drawWho(c,e.id,pose,e.x,ey,e.h,e.facing<0,et,e.flash>0?'#ffffff':(e.def.c||'#d04'));ART.fE=null;c.restore();SL.z=null;};
  const dK=()=>{if(P.inv>0&&Math.floor(S.time*16)%2&&P.hp>0)return;SL.z=P.z;at(c,P.x,P.y,K);
    P._xa=IN.kaiX(P);let kp=IN.ppose(P);if(RET.footmove){if(P.shotT>(P._pst||0)+1e-4){P._lst=S.time;if(P.onGround&&!P.crouch)P._fa=null;}P._pst=P.shotT;   // each shot restarts the shoot sheet (recoil frames)
      if(S.time-(P._lst==null?-9:P._lst)<.45&&P.onGround&&!P.crouch&&/^(idle|run-a|run-b)$/.test(kp)&&!P._xa){kp='shoot';P._xa=Math.abs(P.vx)>5?'runshoot':'';}turn(c,P,P.x);}   // auto-fire keeps the aim pose between shots instead of popping to idle
    ART.fE=P;IN.drawWho(c,'kai',kp,P.x,P.y,P.crouch?44:P.h,P.facing<0,S.time,'#19e3ff',P.crouch);ART.fE=null;
    if(P.shotT>0&&window.AH){const a=P.aim,mq=F.mzAt&&F.mzAt(P);AH.ftMuz(c,P.w,mq?mq[0]:P.x+Math.cos(a)*28,mq?mq[1]:P.y-(P.crouch?26:44)+Math.sin(a)*20,a);}c.restore();SL.z=null;};
  const A=S.E.filter(e=>!(e.dead&&!(e.ext&&!e.remove)));A.push(P);const PS=new Set(S.pr);for(const p of S.pr)A.push(p);
  const zk=a=>PS.has(a)?-1:a.z==null?1:a.z;   // W228: props stand against the wall, behind every lane (their hit depth is unchanged)
  if(SL.band)A.sort(RET.footmove?(a,b)=>Math.round(200*zk(a))-Math.round(200*zk(b)):(a,b)=>(a.z==null?1:a.z)-(b.z==null?1:b.z));   // footmove: depth in 1/200 steps, ties keep the list order (stable sort): no front/behind flickerelse A.sort((a,b)=>PS.has(b)-PS.has(a));   // belt: back to front; flat road: props first
  for(const a of A){if(PS.has(a))dP(a);else if(a===P)dK();else dE(a);}
  for(const e of S.E){if(e.dead)continue;SL.z=e.z;   // fire hazards as the owner's flame picture (the stage hook's lanes, marks, beams and OPEN text are code drawings: not drawn)
    if(e.fl)for(let x=e.fl.x+18;x<e.fl.x+e.fl.w;x+=30){at(c,x,FL-40,K);pic(c,'fx-ft-flame',x,FL-40,72,e.facing<0?Math.PI:0,.9);c.restore();}
    if(e.patch)for(let x=e.patch.x0+12;x<e.patch.x1;x+=24){at(c,x,FL-10,K);pic(c,'fx-ft-flame',x,FL-10,30,-Math.PI/2,.8);c.restore();}}SL.z=null;
  for(const b of S.pb){SL.z=b.z;at(c,b.x,b.y,K);window.AH&&(RET.footmove?pShot(c,b):AH.ftBul(c,b));c.restore();}
  for(const g of S.bombsL){SL.z=g.z;at(c,g.x,g.y,K);pic(c,'fx-ft-grenade',g.x,g.y,22,S.time*7);c.restore();}
  for(const b of S.eb){SL.z=b.z;at(c,b.x,b.y,K);const ko=keyed('fx-bullet-enemy');if(RET.footmove)eShot(c,b);else if(ko){const w=11,h=w*ko.height/ko.width;c.drawImage(ko,b.x-w/2,b.y-h/2,w,h);}else{c.fillStyle=b.c;c.beginPath();c.arc(b.x,b.y,b.r,0,6.283);c.fill();}c.restore();}   // no picture yet: the plain shot
  if(RET.footmove)efx(c,K,at,keyed('fx-bullet-enemy'));SL.z=null;for(const f of S.fx){if(!window.AH)break;if(f.pic){if(SL.band)SL.z=f.z==null?null:f.z;at(c,f.x,f.y,K);AH.ftFx(c,f);c.restore();}else if(f.arc)AH.ftArc(c,Object.assign({},f,{arc:f.arc.map(([x,y])=>[x,SL.my(y)])}));}SL.z=null;
  c.restore();const fs=n=>Math.max(14,n)*u;SL.hudB=0;X.slHud(c,L,S,vw,u,fs);tells(c,L,S,u,fs);const hb=SL.hudB,hf=SL.hudFull;X.slFrame(L);SL.hudB=hb;SL.hudFull=hf;return true;}
SL.draw=function(c){return RET.purefoot?pure(c):old.apply(this,arguments);};
})();
