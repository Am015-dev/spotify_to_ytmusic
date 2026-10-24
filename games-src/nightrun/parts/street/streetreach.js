// PURPOSE: Street melee reach: a melee hit lands only when the attacker's limb or blade, on an ACTIVE strike frame, reaches the target's visible body
// FLAG: reach (?reach=0 old)
// TEST: qa/reach-probe.js (gap per landed hit, read from the sheets), qa/streetsim.js (BOTS=melee)
/* ---------- STREETREACH (W191). Tip table = the farthest opaque column ahead of the anchor on each of the 4 frames of the strike sheet (kai melee / combo2 / combo3,
   knife melee = rusher, bruiser melee = heavy and boss), in sheet px; a sheet px is h/256 units (ART.bsc, body px 256). A frame is ACTIVE when its tip is >= 80% of the
   sheet's farthest tip (windup and recovery frames are not). Body edge of a target = its idle sheet's front column x scale, never wider than its box.
   Kai: the knife hit is no longer instant: it lands on the active frames of the swing (12 fps in the street, 10 fps otherwise) when the tip reaches the body edge.
   Foes: env.melee for rusher / heavy / bigheavy lands only on an active frame and when the tip reaches Kai's body edge; the heavy's charge counts as active
   from frame 1 on (the whole shoulder is the weapon while the one-shot sheet holds its last frame). Telemetry: S.rch = {log:[{k,who,fr,gap}], hits}. ---------- */
if(RET.reach===undefined)RET.reach=!/[?&]reach=0/.test(location.search);
(function(){
if(!RET.reach||!RET.foot||!window.FOOT||!FOOT._in)return;
const F=window.FOOT,IN=F._in,abs=Math.abs,max=Math.max;
const TIP={kai:[[62,89,84,55],[57,84,87,58],[63,59,95,66]],knife:[[72,93,103,65]],bruiser:[[95,112,131,78]]};
const IDLE={kai:48,knife:39,bruiser:59,gunman:42},SHEET={rusher:'knife',gunner:'gunman',heavy:'bruiser',bigheavy:'bruiser'};
const fps=()=>RET.street3?12:10,frame=a=>Math.min(3,Math.floor(a*fps()+1e-6)),on=S=>!!S&&S.st&&S.st.fs;
const live=(t,i)=>t[i]>=.8*max.apply(0,t);
const half=e=>{const s=SHEET[e.id];return s?Math.min(e.w/2,IDLE[s]*e.h/256):e.w/2;};
const KAI=P=>IDLE.kai*P.h/256;
F.reachD=e=>max.apply(0,TIP.kai[0])*F.S.P.h/256+half(e);   // how close a player must stand to hit this foe with the first swing (qa bots)
const log=(S,o)=>{const R=S.rch||(S.rch={sw:null,pm:0,hits:0,log:[]});R.hits++;if(R.log.length<6000)R.log.push(o);};
/* ----- Kai ----- */
const post0=F.post;
F.post=function(S,dt){if(post0)post0.apply(this,arguments);if(!RET.reach||!on(S))return;
  const P=S.P,R=S.rch||(S.rch={sw:null,pm:0,hits:0,log:[]}),cb=S.cmb;
  if(P.mel>R.pm+1e-9)R.sw={t0:S.time,f:P.facing<0?-1:1,k:RET.combo&&cb&&cb.n>0?Math.min(2,cb.n-1):0,done:[]};   // P.mel rises on every press
  R.pm=P.mel;const sw=R.sw;if(!sw)return;
  const a=S.time-sw.t0;if(a>=4/fps()){R.sw=null;return;}
  const fr=frame(a),t=TIP.kai[sw.k];if(!live(t,fr))return;
  const tip=P.x+sw.f*t[fr]*P.h/256,y=P.y-(P.crouch?44:64),h=P.crouch?44:64;let hit=0;
  for(const e of S.E){if(sw.done.indexOf(e)>=0||!IN.hittable(e)||!IN.zok(e.z,P.z))continue;
    const b=IN.ebox(e);if(!(y<b.y+b.h&&y+h>b.y)||sw.f*(e.x-P.x)<-4)continue;
    const gap=sw.f*((e.x-sw.f*half(e))-tip);if(gap>0)continue;
    sw.done.push(e);const m=P.mel;P.mel=max(m,.02);   // streetmelee still sees a swing in progress on a late active frame
    IN.dmgE(e,3,{pierce:1,melee:true,x:P.x});P.mel=m;hit++;log(S,{k:'kai',who:e.id,fr:fr,act:sw.k,gap:gap,f:sw.f,ax:P.x,ah:P.h,tx:e.x,tw:e.w,thh:e.h,tsh:SHEET[e.id]||null});}
  if(hit)IN.hitstop(25);};
/* ----- foes ----- */
const env=F.env,m0=env&&env.melee;
if(m0)env.melee=function(e,r,dmg,o){const S=F.S,sh=SHEET[e.id],T=sh&&TIP[sh];
  if(!RET.reach||!T||!on(S)||(o&&o.beam))return m0.apply(this,arguments);
  const P=S.P,fr=frame(e.sT||0),t=T[0],f=e.facing<0?-1:1;
  if(!(live(t,fr)||(e.heavy&&e.state==='charge'&&fr>=1)))return false;
  const gap=f*((P.x-f*KAI(P))-(e.x+f*t[fr]*e.h/256));if(f*(P.x-e.x)<-4||gap>0)return false;
  const hit=m0.call(this,e,{x:P.x-1,y:r.y,w:2,h:r.h},dmg,o);
  if(hit)log(S,{k:'foe',who:e.id,fr:fr,act:0,gap:gap,f:f,ax:e.x,ah:e.h,tx:P.x,tw:28,thh:P.h,tsh:'kai'});return hit;};
})();
