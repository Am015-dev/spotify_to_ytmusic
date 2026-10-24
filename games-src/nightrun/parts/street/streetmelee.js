// PURPOSE: Street knife combo: KNIFE again within 0.35 s of a swing chains three swings; the third is a finisher that launches the foe into the foes behind it
// FLAG: combo (?combo=1, off by default)
// TEST: qa/streetsim.js (BOTS=melee, Q=&combo=1)
/* ---------- STREETMELEE (W184, STREET-REVIEW-AND-ASSETS-2026-10-24.md task 1). Swings 1 and 2 are the old knife hit with a shorter recovery (0.2 s, was 0.35 s);
   swing 3 (pressed within 0.35 s after swing 2 ended) is the finisher: 8-frame freeze, shake 6, the foe flies 160 units along the road. A flying foe that touches another
   foe in its depth line deals 1 damage to it and makes it flinch (a committed attack is cancelled). The finisher's recovery is 0.5 s, so every string has a price.
   The player pose follows the chain (kai/melee, combo2, combo3 already exist). Telemetry for the sim: S.cmb. ---------- */
if(RET.combo===undefined)RET.combo=!/[?&]combo=0/.test(location.search);
(function(){
if(!RET.combo||!RET.foot||!window.FOOT||!FOOT._in)return;
const F=window.FOOT,IN=F._in,abs=Math.abs,sgn=v=>v<0?-1:1,clamp=(v,a,b)=>v<a?a:v>b?b:v;
const WIN=.35,FAR=160,FLY=.3;
const zin=(a,b)=>!RET.belt||a.z==null||b.z==null||abs(a.z-b.z)<=.15;
const get=S=>S.cmb||(S.cmb={n:0,t0:-9,pm:0,strings:0,c3:0,fin:0,fin2:0});
function flinch(o){o.flash=.3;o.tele=0;o.wind=0;o.tw=0;o.ctw=0;
  if(/^(crouch|lunge|wind|charge|pop)$/.test(o.state)){o.state=o.id==='rusher'?'rest':o.id==='gunner'?'hide':'walk';o.sT=0;}
  o.cd=(o.cd||0)+.4;}
/* a swing has begun this step: which one of the chain is it */
const fresh=(S,cb)=>S.P.mel>cb.pm+1e-9;   // P.mel is set to 0.2 by every press, so a rise means a new swing
function begin(S,cb){const P=S.P;
  cb.n=cb.n>0&&cb.n<3&&S.time-(cb.t0+.2)<=WIN?cb.n+1:1;cb.t0=S.time;cb.pm=P.mel;
  if(cb.n===1)cb.strings++;if(cb.n===3)cb.c3++;
  P.melCd=cb.n<3?.2:.5;   // the chain is only possible because swings 1 and 2 recover faster than the old 0.35 s
  P._cb=cb.n-1;P._me=cb.n>1?S.time-.1:-9;}   // kaiX picks melee / combo2 / combo3 from these
const hf0=F.hitFeel;
F.hitFeel=function(e,d,src){if(hf0)hf0.apply(this,arguments);
  const S=F.S,cb=S&&get(S);if(!cb||!src||!src.melee||src.cmbL||e.boss||e.fly||S.P.mel<=0)return;
  if(fresh(S,cb))begin(S,cb);
  if(cb.n!==3)return;
  const x=e.x;e._lch={dir:sgn(e.x-S.P.x),left:FAR,hit:[]};cb.fin++;if(window.FTX)FTX.ev('finisher');
  S.hf=Math.max(S.hf||0,8/60);if(!S.sim)IN.hitstop(8/60*1000);S.shake=Math.max(S.shake||0,window.COM&&COM.sk?COM.sk(6):6);   // headless sim() only records the freeze, as hitfeel does
  S.fx.push({slash:1,x:x,y:e.y-e.h/2,w:130,l:.2,c:'#ffd23a'});
  if(!e.dead)flinch(e);};
const post0=F.post;
F.post=function(S,dt){if(post0)post0.apply(this,arguments);
  const P=S.P,cb=get(S);
  if(fresh(S,cb))begin(S,cb);
  cb.pm=P.mel;
  const vw=(IN.L()||{}).vw||960;
  for(const e of S.E){const l=e._lch;if(!l)continue;
    if(e.gone||e.remove){e._lch=null;continue;}
    const st=Math.min(l.left,FAR*dt/FLY);l.left-=st;e.x=clamp(e.x+l.dir*st,S.camX+e.w/2,S.camX+vw-e.w/2);
    for(const o of S.E){if(o===e||o.dead||o.boss||o.fly||o.hid||l.hit.indexOf(o)>=0||!zin(e,o)||abs(o.x-e.x)>(e.w+o.w)/2+32)continue;
      l.hit.push(o);if(l.hit.length===1)cb.fin2++;IN.dmgE(o,1,{pierce:1,cmbL:1,x:e.x,vx:l.dir*300});flinch(o);}
    if(l.left<=0)e._lch=null;}};
})();
