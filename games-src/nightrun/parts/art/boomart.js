// PURPOSE: every kill plays the explosion sheet matching the enemy's size and kind (+ debris from medium up, boss-a/b for bosses), drawn with normal blending
// FLAG: boomart (?boomart=0)
// TEST: boomart-test.js
/* ---------- boomart.js (W209, owner 24 Oct 2026: "everything looks so ugly and unrealistic"). The sheets media/anim/fx-boom-{small,medium,large}-{fire,electric,plasma},
   fx-boom-boss-a/b and fx-boom-debris carry their own smoke, so they are drawn normally (art.js fxDraw, key boom-*), not additively.
   Size class from the hull radius (small < 18, medium < 30, large), look from the enemy kind; a boss uses boss-a / boss-b in turn for all five blasts.
   Spark and hit-confirm sheets stay as art.js draws them. ?boomart=0 = the old pick (size from the caller, look from the weapon). ---------- */
if(RET.boomart===undefined)RET.boomart=!/[?&]boomart=0/.test(location.search);
const BOOMA=window.BOOMA={
  LOOK:{turret:'electric',sniper:'electric',shielder:'electric',healer:'electric',gate:'electric',gunship:'plasma',carrier:'plasma'},   // every other kind burns (fire)
  cls:e=>{const r=e.r||14;return r<18?'small':r<30?'medium':'large';}};
{const bk=FXW.bk;
FXW.bk=function(base,e,sz){
  if(RET.boomart&&RET.sprites&&e){let k;
    if(e.type==='boss')k=FXW.bs%2?'boom-boss-b':'boom-boss-a';
    else if(base!=='explosion-boss')k='boom-'+BOOMA.cls(e)+'-'+(BOOMA.LOOK[e.type]||'fire');
    if(k&&FXW.has(k)){if(e.type==='boss')FXW.bs++;FXW.stat.boom++;return k;}}
  return bk.apply(this,arguments);};}
NR.on('kill',({e,boss})=>{if(!RET.boomart||!RET.sprites||boss||!e||BOOMA.cls(e)==='small')return;
  if((e.type==='gunship'||e.type==='mine')&&AH.ok('fx-boom-debris'))return;   // art.js already draws it for these two
  if(FXW.has('boom-debris'))ART.boom('boom-debris',e.x,e.y,Math.max(54,(e.r||14)*3.6)*1.2,.55);});
