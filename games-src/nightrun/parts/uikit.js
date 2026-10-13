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

/* ---------- animated bosses: one frame sheet per boss (media/anim-boss-<name>.webp, made by games-src/nightrun/make-boss-anim.py from the pose stills):
   row 1 = four idle frames, row 2 (when the boss has them) = wind-up, charge, fire, recover. cw/ch = frame size, kw/kh = frame size / body size of the idle frame. */
UIK.boss=__BOSSANIM__;
UIK.bossDraw=(e,nm,wd,by,tl,fl)=>{const A=UIK.boss[nm],sh=A&&ART.bm['anim-boss-'+nm];if(!sh){if(A)ART.load('anim-boss-'+nm);return false;}
  e._at=(e._at||0)+FD;if(e.fireT>0)e.fireT=Math.max(0,e.fireT-FD);
  let col,row=0;const T=e._at;
  if(A.atk&&e.ph!==undefined&&(e.arm||e.fireT>0)){row=1;col=e.fireT>0?(e.fireT>.22?2:3):(PHF<.5?0:1);}      // wind-up on the beat before it fires, then the shot, then the recovery
  else col=[0,1,2,3,2,1][Math.floor(T*(A.atk?5:3.2))%6];
  if(e.labPose&&A.atk>=0){row=e.labPose[0];col=e.labPose[1];if(!A.atk)row=0;}                // LAB: a pose picked by hand
  let dw=wd*A.kw,dh=dw*A.ch/A.cw;if(e.k===6){dh=e.r*3.6*A.kh;dw=dh*A.cw/A.ch;}
  const ctx_=ctx;ctx_.save();ctx_.translate(0,by);if(tl)ctx_.rotate(tl);ctx_.drawImage(sh,col*A.cw,row*A.ch,A.cw,A.ch,-dw/2,-dh/2,dw,dh);
  if(fl){ctx_.globalCompositeOperation='lighter';ctx_.globalAlpha=.4;ctx_.drawImage(sh,col*A.cw,row*A.ch,A.cw,A.ch,-dw/2,-dh/2,dw,dh);}
  ctx_.restore();return true;};
// the sheet of a district's boss is fetched a few seconds after the district starts (never at the moment the boss arrives, never all ten at once)
NR.on('tick',()=>{if(!G.live||G.di===UIK._di)return;UIK._di=G.di;const nm=ART.bossN[DISTRICTS[G.di].boss];if(nm)setTimeout(()=>ART.load('anim-boss-'+nm),3000);});
