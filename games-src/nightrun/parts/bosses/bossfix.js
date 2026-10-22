// PURPOSE: boss arena textures tiled at native size (not one 128 px picture stretched over 3/4 of the screen), no placeholder boxes on boss art, boss opaque, ship kept on screen, phone street fills the height
// FLAG: bossfix (?bossfix=0 = the old drawing)
// TEST: qa/assetaudit.js (BLUR flags), qa/loadgate.js, street2-test.js
/* ---------- BOSSFIX (owner, 22 Oct 2026, Lab > BOSS > ADLER at 2000x1240: "horrible assets not sized; why these boxes on the sprites of the boss? why is the boss transparent?").
   BPL.band(id,x0,y0,w,h,rot,off)  a boss-arena strip (blackout / slab / conveyor / gravity) drawn as TILES of the picture at its own aspect inside the rect, never one square
                                   picture as wide as the rect (that was a 128 px texture drawn 1480 px wide at alpha .72). false = the picture is not ready: the caller draws its code shape.
   Visuals only: no hitbox, timing or random number is touched. ---------- */
if(RET.bossfix===undefined)RET.bossfix=!/[?&]bossfix=0/.test(location.search);
BPL.band=function(id,x0,y0,w,h,rot,off){
  if(RET.bossfix===false)return ART.pic(id,w,x0+w/2,y0+h/2,rot);   // old: one square picture, w wide
  const b=ART.img(id);if(!b||w<=0||h<=0)return false;
  const asp=(b.naturalWidth||b.width)/(b.naturalHeight||b.height)||1,rows=Math.max(1,Math.ceil(h/140)),th=h/rows,tw=Math.max(8,Math.round(th*asp)),o=ART.sp(id,tw);if(!o)return false;
  const add=id.startsWith('fx-');ctx.save();if(add)ctx.globalCompositeOperation='lighter';
  ctx.translate(x0+w/2,y0+h/2);ctx.beginPath();ctx.rect(-w/2,-h/2,w,h);ctx.clip();if(rot)ctx.rotate(rot);
  const sh=((off||0)%o.w+o.w)%o.w;
  for(let r=0;r<rows;r++)for(let x=-w/2-sh;x<w/2;x+=o.w)ctx.drawImage(o.c,x,-h/2+r*th,o.w,th);
  ctx.restore();return true;};
/* the street in a narrow portrait window (a phone, or a browser window the shape of one) without touch events was the desktop letterbox: a small field with black bars above and below and a keyboard hint.
   Such a window now gets the phone layout (field fills the height above the pad, pad on screen, 'Tap or hold FIRE'). Pointer events drive the pad, so a mouse works too. */
if(window.FOOT&&!('_bfT' in FOOT)){let ft=false;FOOT._bfT=1;
  Object.defineProperty(FOOT,'forceTouch',{configurable:true,get(){return ft||(RET.bossfix!==false&&innerWidth<=600&&innerHeight>innerWidth*1.05);},set(v){ft=!!v;}});}
