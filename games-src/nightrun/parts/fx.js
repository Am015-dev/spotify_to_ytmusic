/* ---------- calm visuals + the beat cue: where sparks may appear, the pulse ring round the ship, the pulse on the screen edges, enemy bullets ---------- */
const CUE={off:0,S:.7,M:1,L:1.5};                         // settings > Rhythm > Beat cue size
const EDG={};
const FXV={
  rdy:false,rf:0,
  near(x,y){                                             // calm mode: no sparks next to the ship or in the middle of the screen
    if(P){const dx=x-P.x,dy=y-P.y;if(dx*dx+dy*dy<120*120)return true;}
    return Math.abs(x-W/2)<150&&Math.abs(y-H/2)<110;},
  edges(t){                                              // the beat pulse also lives at the four screen edges (never over the action)
    if(G.dead||SET.cue==='off')return;const K=CUE[SET.cue],T=tierOf(C.n),a=PUL*(.3+.1*T)*K*[.25,.5,1][SET.flash];if(a<.01)return;
    const c=P.hp<=1?'#ff3040':T>1?TIERC[T-1]:DISTRICTS[G.di].a,ew=24+18*K,bar=(w,h,x0,y0,x1,y1,rx,ry)=>{const k=c+'|'+x0+'|'+y0+'|'+x1+'|'+y1;let g=EDG[k];if(!g){g=ctx.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,c);g.addColorStop(1,c+'00');EDG[k]=g;}ctx.fillStyle=g;ctx.fillRect(rx,ry,w,h);};   // gradients are cached: no new object per edge per frame
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=Math.min(1,a);
    bar(ew,H,0,0,ew,0,0,0);bar(ew,H,W,0,W-ew,0,W-ew,0);bar(W,ew*.6,0,0,0,ew*.6,0,0);bar(W,ew*.6,0,H,0,H-ew*.6,0,H-ew*.6);
    ctx.restore();},
  ring(t){                                               // the pulse: a ring closes onto the ship and meets the target ring ON the beat; it turns white inside the on-beat window
    if(SET.cue==='off')return;const K=CUE[SET.cue],T=tierOf(C.n),rdy=P.dashCd<=0,dr=PW.on('drum');
    const col=!rdy?'#8c86b8':T>1?TIERC[T-1]:dr?'#ffe14d':'#19e3ff',r0=22*K+4,r1=r0+50*K*(1-PHF),dtMs=(PHF<.5?PHF:PHF-1)*BT.spb*1000,inWin=SET.all||Math.abs(dtMs)<=winMs();
    if(rdy&&!this.rdy)this.rf=.3;this.rdy=rdy;this.rf=Math.max(0,this.rf-FD);
    ctx.save();ctx.lineCap='round';
    ctx.strokeStyle=col;ctx.globalAlpha=.4+.3*PUL;ctx.lineWidth=2.5*Math.max(.8,K);ctx.beginPath();ctx.arc(P.x,P.y,r0,0,7);ctx.stroke();          // target
    ctx.strokeStyle=inWin&&rdy?'#ffffff':col;ctx.globalAlpha=Math.min(1,.3+.7*PHF+.4*PUL);ctx.lineWidth=(2+4*PHF)*Math.max(.8,K)+(inWin&&rdy?2:0);ctx.beginPath();ctx.arc(P.x,P.y,r1,0,7);ctx.stroke();   // closing ring
    if(PUL>.04||this.rf>0){ctx.globalCompositeOperation='lighter';G_(P.x,P.y,r0*2.4,col,Math.min(1,(.55*PUL+(this.rf>0?.5:0))*[.3,.6,1][SET.flash]));}
    ctx.restore();},
  bullets(){                                             // dark rim + bright body + white core: readable on every backdrop (high contrast: bigger, with a white halo)
    if(!G.eb.length)return;const hc=SET.hc;
    const pb=!hc&&ART.sp('fx-bullet-enemy',5*2*1.5);                         // painted lime orb in place of the flat body (the dark rim and white core stay)
    for(const [col,k] of hc?[['#ffffff',1.7],['#07030f',1.4],[BULLET,1.05],['#ffffff',.45]]:[['#07030f',1.2],[BULLET,.9],['#ffffff',.4]]){
      if(pb&&k===.9){ctx.globalCompositeOperation='lighter';for(const b of G.eb){const w=b.r*3.1;ctx.drawImage(pb.c,b.x-w/2,b.y-w/2,w,w*pb.h/pb.w);}ctx.globalCompositeOperation='source-over';continue;}
      ctx.fillStyle=col;ctx.beginPath();for(const b of G.eb){const r=b.r*k;ctx.moveTo(b.x+r,b.y);ctx.arc(b.x,b.y,r,0,7);}ctx.fill();}}
};
