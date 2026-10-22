// PURPOSE: the picture looks painted, not pasted: no light discs behind enemies, a much lighter black veil over the city
// FLAG: clean (?clean=0 = the old look)
// TEST: qa/loadgate.js (no page errors); look checked on 390x763 and 1440x860 screenshots
/* ---------- CLEAN: owner, 22 Oct 2026: "assets are not smoothly aligned to the background, everything seems so fake".
   The readability layers stacked three effects on every enemy (two glow sprites + a pale disc from legible.js, a light halo from comfort.js):
   each ship sat on a grey coin. They are off; the hull brightening of the recoloured sheets stays. The black veil over the backdrop drops from
   .35 to .12 so the painted city is visible. Enemy bullets keep their dark edge (legible.js halo), so shots stay readable. ---------- */
if(RET.clean===undefined)RET.clean=!/[?&]clean=0/.test(location.search);
if(RET.clean){LGB.enemy=function(de,e,t){return de(e,t);};LGB.DIM=.12;LGB.DIMHC=.2;}
/* the painted backdrop was baked with a 50 % black fill (art.js ART.bgOf dim .5/.52) on top of the veil: the city read as a black wall. With clean it is 15 %. */
if(RET.clean){const b0=ART.bgOf;ART.bgOf=function(di,port,u,w,h,dim){return b0.call(this,di,port,u,w,h,Math.min(dim==null?0:dim,.15));};}
/* phone: the portrait backdrop is a street-level skyline; scrolling it down the screen with every second copy flipped drew the towers upside down
   at the top. With clean it stands still and whole (no flip), and the top-down rooftop strip (a different viewpoint over a street-level picture) is not drawn. */
if(RET.clean){ART.paintP=function(bg,scroll){const di=DISTRICTS.indexOf(bg.D);if(!ART.bm['bg-'+ART.dn[di]+'-phone'])ART.warm(di);const o=ART.bgOf(di,true,VS,PW_,PH_,.5);if(!o)return false;
    ctx.drawImage(o.c,0,0,PW_,PH_);return true;};
  {const d0=drawBGP;drawBGP=function(bg,t,dt,scroll){const k='ly-phone-'+ART.dn[DISTRICTS.indexOf(bg.D)],b=ART.bm[k];if(b)delete ART.bm[k];try{return d0.call(this,bg,t,dt,scroll);}finally{if(b)ART.bm[k]=b;}};}}
/* enemy bullets: the dark halo was 2.1-2.6x the bullet (black holes on a lit city); with clean it is a thin dark edge (1.35x) */
if(RET.clean)LGB.HK={n:1.35,r:1.35,'':1.35,s:1.35};
/* no word pop-ups in play: PERFECT, ON BEAT, CHAIN n, GRAZE, OVERHEAT are dropped (score numbers stay) */
if(RET.clean){const fl=floater;floater=function(x,y,txt){if(running&&typeof txt==='string'&&/PERFECT|ON BEAT|CHAIN|GRAZE|OVERHEAT|COMBO|NICE|GREAT/i.test(txt))return;return fl.apply(this,arguments);};}
