/* ---------- calm visuals: where sparks may appear, beat pulse on the screen edges and the ship ring, enemy bullets ---------- */
const FXV={
  near(x,y){                                             // calm mode: no sparks next to the ship or in the middle of the screen
    if(P){const dx=x-P.x,dy=y-P.y;if(dx*dx+dy*dy<120*120)return true;}
    return Math.abs(x-W/2)<150&&Math.abs(y-H/2)<110;},
  edges(t){                                              // the beat pulse lives here, at the four screen edges (never over the action)
    if(G.dead)return;const a=PUL*(SET.calm?.3:.4)*FX();if(a<.01)return;
    const c=DISTRICTS[G.di].a,bar=(w,h,x0,y0,x1,y1,rx,ry)=>{const g=ctx.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,c);g.addColorStop(1,c+'00');ctx.fillStyle=g;ctx.fillRect(rx,ry,w,h);};
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a;
    bar(30,H,0,0,30,0,0,0);bar(30,H,W,0,W-30,0,W-30,0);bar(W,18,0,0,0,18,0,0);bar(W,18,0,H,0,H-18,0,H-18);
    ctx.restore();},
  ring(t){                                               // beat ring around the ship: shrinks onto the beat, flashes on it
    if(!SET.guide)return;const dr=PW.on('drum'),r=18+(1-PHF)*36;
    ctx.strokeStyle=dr?'#ffe14d':P.dashCd<=0?'#19e3ff':'#8c86b8';ctx.globalAlpha=Math.min(1,.12+.4*PHF+.3*PUL*FX());ctx.lineWidth=1.5+(dr?1:0)+2*PUL*FX();
    ctx.beginPath();ctx.arc(P.x,P.y,r,0,7);ctx.stroke();ctx.globalAlpha=1;},
  bullets(){                                             // dark rim + bright body + white core: readable on every backdrop
    if(!G.eb.length)return;
    for(const [col,k] of [['#07030f',1.2],[BULLET,.9],['#ffffff',.4]]){ctx.fillStyle=col;ctx.beginPath();for(const b of G.eb){const r=b.r*k;ctx.moveTo(b.x+r,b.y);ctx.arc(b.x,b.y,r,0,7);}ctx.fill();}}
};
