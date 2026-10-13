/* ---------- painted UI kit (media/ui-*.webp): canvas HUD plates + the hint bubble. The DOM side (buttons, panels, rows, touch buttons) is CSS in head.html.
   Every image is decoded once (ART.load -> ImageBitmap) and drawn as a 9-slice with plain drawImage: no per-frame filters. Until it has decoded the old flat look is drawn. */
const UIK={names:['ui-hud-bars','ui-hud-mult','ui-bubble','ui-bubble-tail'],
  init(){for(const n of this.names)ART.load(n);},
  // 9-slice: cap = source corner size in px, cd = the same corner on screen
  slice(c,n,x,y,w,h,cap,cd,sx=0,sy=0,sw,sh){const b=ART.bm[n];if(!b)return false;sw=sw||b.width-sx;sh=sh||b.height-sy;cd=Math.min(cd,w/2,h/2);const mw=sw-2*cap,mh=sh-2*cap;
    const X=[sx,sx+cap,sx+sw-cap],Y=[sy,sy+cap,sy+sh-cap],SW=[cap,mw,cap],SH_=[cap,mh,cap],DX=[x,x+cd,x+w-cd],DY=[y,y+cd,y+h-cd],DW=[cd,w-2*cd,cd],DH=[cd,h-2*cd,cd];
    for(let j=0;j<3;j++)for(let i=0;i<3;i++)c.drawImage(b,X[i],Y[j],SW[i],SH_[j],DX[i],DY[j],DW[i],DH[j]);return true;},
  // (the paintings have transparent margins, so sx/sw crop to the frame itself)
  // a dark plate behind HUD text: the painted frame over a solid dark fill, so the numbers stay readable
  plate(c,n,x,y,w,h,cap,cd,sx,sw){c.save();c.fillStyle='#05030ccc';c.fillRect(x+3,y+3,w-6,h-6);const ok=this.slice(c,n,x,y,w,h,cap,cd,sx,0,sw);if(!ok){c.strokeStyle='#ffffff22';c.strokeRect(x+.5,y+.5,w-1,h-1);}c.restore();},
  // the hint line sits in the painted speech bubble (cropped to the bubble itself, 3 slices wide)
  bubble(c,x,y,w,h){const b=ART.bm['ui-bubble','ui-bubble-tail'];if(!b)return false;const sx=72,sy=40,sw=116,sh=88,cap=30,cd=Math.min(h*.7,w/3);
    c.drawImage(b,sx,sy,cap,sh,x,y,cd,h);c.drawImage(b,sx+cap,sy,sw-2*cap,sh,x+cd,y,w-2*cd,h);c.drawImage(b,sx+sw-cap,sy,cap,sh,x+w-cd,y,cd,h);
    const t=ART.bm['ui-bubble-tail'];if(t){c.save();c.translate(x+w*.62,y+h-2);c.rotate(Math.PI/2);c.drawImage(t,0,-9,22,18);c.restore();}return true;}};
// the CSS-side paintings are decoded once up front too (the touch buttons sit in a hidden element, so the browser would otherwise fetch them on the first run)
UIK.keep=['ui-btn-pink','ui-btn-cyan','ui-btn-violet','ui-button-go','ui-button-cream','ui-button-power','ui-topbar','ui-drawer-head','ui-panel','ui-row','ui-iconbtn','ui-node-open','ui-node-done','ui-node-boss','ui-node-locked','ui-touch-dash','ui-touch-emp','ui-touch-pause'].map(n=>{const im=new Image();im.decoding='async';im.src=ART.base+n+'.webp';if(im.decode)im.decode().catch(()=>{});return im;});
UIK.init();
