// PURPOSE: the street drawn with the owner's art only: painted backdrop layers in order, Kai and the foes from their sheets at one scale, owner fx/pickup/prop pictures, a minimal edge HUD
// FLAG: purefoot (?purefoot=0 = the old look)
// TEST: qa/purefoot-shot.js (one phone + one PC shot, the same stepped moment on and off)
/* ---------- PUREFOOT (W217, owner 24 Oct 2026: "the owner's art is good, our code overlays made it ugly"). The outermost F.look.draw: with RET.purefoot on, none of the
   overlay wrappers run (street3 lamp pools / grade / wet mirror, streetblend, streetguard meter and OPEN text, streetcombo HITS panel, streetfeel OVERDRIVE panel).
   Drawn: streetlook's painted backdrop and prop sheets, street2 prop pictures, pickup pictures, actors through drawWho (sheets, FA.shadow soft contact shadow), owner shot /
   muzzle / grenade / fx pictures, enemy bullets as fx-bullet-enemy, then streetlook's HUD without the hint line, the BEHIND caption and the progress bar.
   Not drawn: code shapes (wind-up discs and boxes, shield ring, dash box, shadow ellipses, rings, slashes, squares, checkpoint flags), play-field text, the occlusion fade.
   Telegraphs are poses: a foe winding up shows its melee sheet, a gunner calling a shot its shoot sheet. Gameplay is untouched (the sim never draws). ---------- */
(function(){
if(!window.FOOT||!FOOT._in||!FOOT.look||!FOOT.look._p)return;
const F=FOOT,IN=F._in,SL=F.look,X=SL._p,FL=470,old=SL.draw;
const pic=(c,id,x,y,w,a,al)=>{if(window.AH&&AH.ftDraw(c,id,x,y,w,a,al))return true;const o=typeof ART!=='undefined'&&ART.img&&ART.img(id)&&ART.sp(id,w);if(!o)return false;   // owner fx pictures are painted on black: added with 'lighter'
  c.save();c.globalCompositeOperation='lighter';c.globalAlpha=al==null?1:Math.max(0,Math.min(1,al));c.translate(x,y);if(a)c.rotate(a);c.drawImage(o.c,-o.w/2,-o.h/2,o.w,o.h);c.restore();return true;};
function pure(c){const L=IN.L(),S=F.S;if(!L||!S)return false;X.slFrame(L);
  const K=SL.k,t0=SL.t0,dpr=L.dpr||1,sc=L.sc*dpr,vw=L.vw,exl=L.exl||0,exr=L.exr||0,P=S.P,u=1/L.sc,at=X.at;
  c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
  c.setTransform(1,0,0,1,0,0);c.fillStyle='#05030c';c.fillRect(0,0,L.cv.width,L.cv.height);
  c.setTransform(sc,0,0,sc,(L.box.x-L.ox)*dpr,(L.box.y-L.oy)*dpr-t0*sc);
  const sh=S.shake?IN.ftRnd(-S.shake,S.shake)*.5:0;SL.road=L.box.y+(FL+sh*.5-t0)*L.sc;SL.cam=S.camX;
  c.save();c.translate(sh,sh*.5);X.slBackdrop(c,S,vw,exl,exr,t0,Math.min(3,sc));
  c.translate(-S.camX,0);const lo=S.camX-exl,hi=S.camX+vw+exr,PK=F.PICKUPS;
  for(const p of S.pk){const d=PK[p.k],q=d&&X.slPic(X.pkPic(p.k)),am=p.k==='ammo'&&RET.sprites&&ART.ANIM.c['pk-ammo/spin']&&ART.anim('pk-ammo/spin');if(!am&&(!q||!q.width))continue;const bob=Math.sin(p.t*5)*3,r=17*K,edge=Math.min(p.x-r-lo,hi-p.x-r),fa=Math.max(0,Math.min(1,(edge-6)/24));if(fa<=0)continue;
    const y=p.y+bob,Y=Math.max(SL.my(y),t0+4+r),pz=p.z!=null&&SL.band?p.z:1,k=K*(.9+.1*pz),h=40,w=q&&q.width?h*q.width/q.height:h;
    c.save();c.translate(p.x,Y-(1-pz)*SL.band);c.scale(k,k);c.translate(-p.x,-y);c.globalAlpha=(p.t>13?.5+.5*Math.sin(p.t*20):1)*fa;SL.tag='pk';if(am)ART.drawAnim(c,'pk-ammo/spin',p.t,p.x,y,32/ART.ANIM.c['pk-ammo/spin'].bw,false);else c.drawImage(q,p.x-w/2,y-h/2-4,w,h);SL.tag='';c.restore();}
  const dP=p=>{if(p.hp<=0&&!p.fl)return;SL.z=p.z;let ok=false;if(p.draw){try{ok=p.draw(c,K,at);}catch(x){}}
    if(!ok){const hd=Math.min(p.h,1.25*64);at(c,p.x,p.y,K);c.fillStyle=p.c;c.fillRect(p.x-p.w/2,p.y-hd,p.w,hd);c.restore();}SL.z=null;};   // a prop with no picture yet keeps its flat box (it blocks shots)
  const dE=e=>{if(e.dead&&!(e.ext&&!e.remove))return;const ex=e.h*K*.7;if(e.x-ex>hi||e.x+ex<lo)return;SL.z=e.z;
    let pose=e.dead?'die':(()=>{try{return e.def.pose?e.def.pose(e):'idle';}catch(x){return'idle';}})();if(!e.dead){if(e.wind>0)pose='melee';else if(e.tele>0)pose='shoot';}   // telegraph = the attack pose
    const ey=e.ext&&e.fly?e.y+e.h/2:e.y;at(c,e.x,ey,K);ART.fE=e;IN.drawWho(c,e.id,pose,e.x,ey,e.h,e.facing<0,e.dead?e.dt_||0:e.t,e.flash>0?'#ffffff':(e.def.c||'#d04'));ART.fE=null;c.restore();SL.z=null;};
  const dK=()=>{if(P.inv>0&&Math.floor(S.time*16)%2&&P.hp>0)return;SL.z=P.z;at(c,P.x,P.y,K);
    P._xa=IN.kaiX(P);ART.fE=P;IN.drawWho(c,'kai',IN.ppose(P),P.x,P.y,P.crouch?44:P.h,P.facing<0,S.time,'#19e3ff',P.crouch);ART.fE=null;
    if(P.shotT>0&&window.AH){const a=P.aim,mq=F.mzAt&&F.mzAt(P);AH.ftMuz(c,P.w,mq?mq[0]:P.x+Math.cos(a)*28,mq?mq[1]:P.y-(P.crouch?26:44)+Math.sin(a)*20,a);}c.restore();SL.z=null;};
  const A=S.E.filter(e=>!(e.dead&&!(e.ext&&!e.remove)));A.push(P);const PS=new Set(S.pr);for(const p of S.pr)A.push(p);
  if(SL.band)A.sort((a,b)=>(a.z==null?1:a.z)-(b.z==null?1:b.z));else A.sort((a,b)=>PS.has(b)-PS.has(a));   // belt: back to front; flat road: props first
  for(const a of A){if(PS.has(a))dP(a);else if(a===P)dK();else dE(a);}
  for(const e of S.E){if(e.dead)continue;SL.z=e.z;   // fire hazards as the owner's flame picture (the stage hook's lanes, marks, beams and OPEN text are code drawings: not drawn)
    if(e.fl)for(let x=e.fl.x+18;x<e.fl.x+e.fl.w;x+=30){at(c,x,FL-40,K);pic(c,'fx-ft-flame',x,FL-40,72,e.facing<0?Math.PI:0,.9);c.restore();}
    if(e.patch)for(let x=e.patch.x0+12;x<e.patch.x1;x+=24){at(c,x,FL-10,K);pic(c,'fx-ft-flame',x,FL-10,30,-Math.PI/2,.8);c.restore();}}SL.z=null;
  for(const b of S.pb){SL.z=b.z;at(c,b.x,b.y,K);window.AH&&AH.ftBul(c,b);c.restore();}
  for(const g of S.bombsL){SL.z=g.z;at(c,g.x,g.y,K);pic(c,'fx-ft-grenade',g.x,g.y,22,S.time*7);c.restore();}
  for(const b of S.eb){SL.z=b.z;at(c,b.x,b.y,K);if(!pic(c,'fx-bullet-enemy',b.x,b.y,Math.max(16,b.r*2.4),Math.atan2(b.vy||0,b.vx||1))){c.fillStyle=b.c;c.beginPath();c.arc(b.x,b.y,b.r,0,6.283);c.fill();}c.restore();}   // no picture yet: the plain shot
  SL.z=null;for(const f of S.fx){if(!window.AH)break;if(f.pic){if(SL.band)SL.z=f.z==null?null:f.z;at(c,f.x,f.y,K);AH.ftFx(c,f);c.restore();}else if(f.arc)AH.ftArc(c,Object.assign({},f,{arc:f.arc.map(([x,y])=>[x,SL.my(y)])}));}SL.z=null;
  c.restore();const fs=n=>Math.max(14,n)*u;SL.hudB=0;X.slHud(c,L,S,vw,u,fs);return true;}
SL.draw=function(c){return RET.purefoot?pure(c):old.apply(this,arguments);};
})();
