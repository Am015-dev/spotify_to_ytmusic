// PURPOSE: Street combo counter ("N HITS", breaks on a hurt or after 2 s without a hit) and a one-bounce knockdown for finisher / blast kills (W188)
// FLAG: combocount (?combocount=1, off by default)
// TEST: qa/streetcombo-test.js
/* ---------- STREETCOMBO (W188, STREET-REVIEW task 5). Every landed hit adds 1 (burn ticks and flamer streams do not); a hurt or 2 s without a hit ends the streak.
   F.COMBO = {n, best, last, hurts}. Drawn under the score, right edge; its box joins L.hud so the hud-cover checks see it. A kill by the third melee swing or by a blast
   (grenade, shockwave) throws the foe up for 0.4 s: its own die frame, tilted, lifted on a sine (no new art). Foes that vanish at death (no die pose) do not bounce. ---------- */
if(RET.combocount===undefined)RET.combocount=!/[?&]combocount=0/.test(location.search);
(function(){
if(!RET.combocount||!window.FOOT||!FOOT._in||!FOOT.look||typeof ART==='undefined')return;
const F=window.FOOT,IN=F._in,SL=F.look,C=F.COMBO={n:0,best:0,last:-9,hurts:0,pop:-9,bounces:0,drawn:0,want:0},WIN=2,BNC=.4;
const tick=S=>{if(S.hurts!==C.hurts||S.time<C.last||S.time-C.last>WIN)C.n=0;C.hurts=S.hurts;};   // S.time < last: a new run
const h0=F.hitFeel;
F.hitFeel=function(e,d,src){if(h0)h0.apply(this,arguments);const S=F.S;if(!S||!src||src.kind==='fire')return;
  if(src.pierce&&!src.melee&&src.vx==null&&d<1)return;   // burn tick
  tick(S);C.n++;C.last=S.time;C.pop=S.time;if(C.n>C.best)C.best=C.n;
  if(e.hp<=0&&e.ext&&!e.boss&&((src.melee&&S.P._cb===3)||(src.pierce&&!src.melee&&src.vx==null))){e._bnc=1;C.bounces++;}};   // third swing, or a blast (no bullet velocity)
const fd0=ART.footDraw;
ART.footDraw=function(c,who,pose,x,y,h,flip,t){const e=ART.fE;
  if(e&&e._bnc&&e.dead&&pose==='die'&&(e.dt_||0)<BNC){const k=(e.dt_||0)/BNC;
    c.save();c.translate(x,y-Math.sin(k*Math.PI)*h*.55);c.rotate((flip?1:-1)*.9*Math.min(1,k*2.2));   // lifts, tilts away from Kai, comes down
    const r=fd0.call(this,c,who,pose,0,0,h,flip,.2);c.restore();return r;}
  return fd0.apply(this,arguments);};
const d0=SL.draw;
SL.draw=function(c){const r=d0.apply(this,arguments);const S=F.S,L=IN.L();if(!r||!S||!L)return r;
  tick(S);if(C.n<2)return r;C.want++;
  const u=1/L.sc,vw=L.vw,t0=SL.t0,age=S.time-C.pop,pk=Math.max(0,1-age/.18),hb=L.hud&&L.hud.hud||[],sb=hb[1];   // hb[1] = the score box
  const top=(sb?sb.y+sb.h:60*u)+4*u,w=124*u,hh=42*u,x=vw-10*u-w;
  c.save();c.textAlign='right';c.textBaseline='top';SL.tag='hud';
  c.fillStyle='rgba(5,3,12,.62)';c.fillRect(x,t0+top,w,hh);
  c.fillStyle='#ffd23a';c.font='bold '+Math.round((22+8*pk)*u)+'px monospace';c.fillText(C.n+' HITS',vw-16*u,t0+top+3*u);   // grows a little on every hit
  c.fillStyle='#c9c3e6';c.font='bold '+Math.round(10*u)+'px monospace';c.fillText('in a row, keep hitting',vw-16*u,t0+top+27*u);
  c.fillStyle='#ffffff26';c.fillRect(x,t0+top+hh-3*u,w,3*u);c.fillStyle='#ffd23a';c.fillRect(x,t0+top+hh-3*u,w*Math.max(0,1-(S.time-C.last)/WIN),3*u);   // the 2 s left before the streak ends
  SL.tag='';c.restore();if(L.hud&&L.hud.hud)L.hud.hud.push({x,y:top,w,h:hh});C.drawn++;return r;};
})();
