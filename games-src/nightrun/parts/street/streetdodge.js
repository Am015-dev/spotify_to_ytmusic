// PURPOSE: Street dash with i-frames: DASH is 8 invincible frames (0.13 s); a dash that makes an attack miss in its first 0.15 s is a CLOSE CALL (caption, 0.5 s slow-down, next knife hit crits)
// FLAG: dodgei (?dodgei=0 = the old longer dash i-frames)
// TEST: qa/streetsim.js (BOTS=gfirst,dash)
/* ---------- STREETDODGE (W197, BENCH-DOES-BETTER task N2). The decision: block and stay (guard) or dash through. Foot.js calls F.dodged(S,n,src) when the dash i-frames absorb an attack.
   I-frames: 0.13 s, or 0.20 s for a dash on the beat; the dash lasts 0.24 s, so no i-frame outlives it. CLOSE CALL = the attack was absorbed within 0.15 s of the dash press (once per dash):
   caption, 0.5 s TIME SLOW (the pickup's own slow; it is set, never added, and a real pickup is left alone) and the next knife hit within 3 s does double damage.
   Telemetry for the sim: S.dg. ---------- */
if(RET.dodgei===undefined)RET.dodgei=!/[?&]dodgei=0/.test(location.search);
(function(){
if(!RET.dodgei||!RET.foot||!window.FOOT)return;
const F=window.FOOT;
const IFR=.13,IFBEAT=.2,DASH=.24,WIN=.15,SLOW=.5,CRIT=3;
const get=S=>S.dg||(S.dg={dashes:0,cc:0,crit:0,ifOut:0,stack:0});
F.dodged=function(S,n,src){const P=S.P,d=get(S);
  if(!(P.dash>0)||d.got||DASH-P.dash>WIN)return;
  d.got=1;d.cc++;P.dgCrit=S.time+CRIT;
  if(!P.pw.slow)P.pw.slow={lv:1,t:SLOW,cc:1};else if(P.pw.slow.cc)P.pw.slow.t=SLOW;
  S.pop.push({x:P.x,y:P.y-100,t:'CLOSE CALL','c':'#9ff8ff',l:1.4,m:1.4,big:true});
  if(!d.said){d.said=1;S.note={teach:1,t:2.6,txt:'CLOSE CALL: TIME SLOWS, YOUR NEXT KNIFE HIT DOES DOUBLE'};}};
const hf0=F.hitFeel;
F.hitFeel=function(e,dm,src){if(hf0)hf0.apply(this,arguments);
  const S=F.S,P=S&&S.P;if(!P||!(P.dgCrit>S.time)||!src||!src.melee||src.cmbL||e.dead)return;
  P.dgCrit=0;e.hp-=dm;get(S).crit++;S.pop.push({x:e.x,y:e.y-e.h-20,t:'CRIT','c':'#ffd23a',l:.9,m:.9,big:true});};
const post0=F.post;
F.post=function(S,dt){if(post0)post0.apply(this,arguments);
  const P=S.P,d=get(S);
  if(P.dash>0&&!d.on){d.on=1;d.dashes++;P.dashIF=P.dashIF>.3?IFBEAT:IFR;}
  else if(!(P.dash>0)){d.on=0;d.got=0;if(P.dashIF>1e-6)d.ifOut++;}
  const sl=P.pw.slow;if(sl&&sl.cc&&sl.t>SLOW+1e-6)d.stack++;};
})();
