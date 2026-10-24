// PURPOSE: R3, the score multiplier is on screen in HUD Minimal (flight): big x-number next to the score, "CHAIN BROKEN" when a hit halves it
// FLAG: multhud (?mult=1, off by default)
// TEST: qa/ui-audit (games-src/scripts/ui-audit.spec.js), simhunt text-overlap, qa/mult-probe.js
/* HUD Minimal drew only the score; the multiplier and combo lived in HUD Full. This adds ONE number: the multiplier (tier colour), captioned in words for the first 12 s
   of play ("SCORE MULTIPLIER: a hit halves it"). A hit that halves it flashes the number red for 2 s and says what was lost ("CHAIN BROKEN  x2.4 -> x1.2").
   Drawn after the lean HUD, so it never moves the other items. HUD Full already shows the multiplier and is left alone. */
if(RET.multhud===undefined)RET.multhud=!/[?&]mult=0/.test(location.search);
const MH=window.MH={brk:0,from:0,to:0,prev:1,cap:0,capDone:false};
if(RET.multhud){
  NR.on('runStart',()=>{MH.brk=0;MH.prev=1;MH.cap=0;});
  NR.on('tick',dt=>{if(!G)return;if(!MH.capDone){MH.cap+=dt;if(MH.cap>12)MH.capDone=true;}if(MH.brk>0)MH.brk-=dt;});
  NR.on('hurt',()=>{if(G&&MH.prev>G.mult+.04){MH.from=MH.prev;MH.to=G.mult;MH.brk=2;}});
  const mtxt=m=>'×'+m.toFixed(1),col=()=>MH.brk>0&&(SET.reduce||Math.floor(MH.brk*8)%2===0)?'#ff3040':TIERC[tierOf(C.n)-1];
  const wrap=(name,draw)=>{const f=DIET[name];DIET[name]=function(t){f.apply(this,arguments);if(!G||!running)return;try{draw();}finally{MH.prev=G.mult;}};};
  /* ONE caption at a time: the "SCORE MULTIPLIER" line only shows in the free row under the bar, and never while a banner, a hint, a first-seen caption or the boss bar is up.
     "CHAIN BROKEN" is never a second row: it sits in the bar, next to the number that just fell (and is dropped when it would not fit). */
  const busy=()=>G.banner.t>0||(window.HINT&&HINT.on()?!!HINT.cur:G.hint.t>0)||!!(G.boss&&G.boss.x<W)||!!(window.EXP&&EXP.cap)||!!(window.ZH&&ZH.cap);
  wrap('hudL',()=>{const k=HKL;ctx.save();ctx.translate(166*k,0);ctx.scale(k,k);ctx.textAlign='left';ctx.textBaseline='alphabetic';
    ctx.font='700 30px "Chakra Petch",sans-serif';ctx.fillStyle=col();ctx.fillText(mtxt(G.mult),0,38);const nw=ctx.measureText(mtxt(G.mult)).width+12;
    ctx.font='11px "Share Tech Mono",monospace';
    if(MH.brk>0){if(!(G.boss&&G.boss.x<W)){ctx.fillStyle='#ff3040';ctx.fillText('CHAIN BROKEN  '+mtxt(MH.from)+' → '+mtxt(MH.to),nw,36);}}
    else if(!MH.capDone&&!busy()){ctx.fillStyle='#c9c4ec';ctx.fillText('SCORE MULTIPLIER: a hit halves it',0,54);}
    ctx.restore();});
  wrap('hudP',()=>{const k=HK,pad=10*k,sH=34*k;ctx.save();ctx.textAlign='left';ctx.textBaseline='alphabetic';
    ctx.font=`700 ${19*k}px "Chakra Petch",sans-serif`;const x=pad+ctx.measureText(String(G.score).padStart(8,'0')).width+12*k;
    ctx.fillStyle=col();ctx.fillText(mtxt(G.mult),x,23*k);const nx=x+ctx.measureText(mtxt(G.mult)).width+10*k;
    ctx.font=`${11*k}px "Share Tech Mono",monospace`;
    if(MH.brk>0){const hw=Math.min(12*k,90*k/P.max),room=PW_-pad-(P.max*(hw+3*k)-3*k)-8*k-nx,t='CHAIN BROKEN';   // the hull pips are the right edge of the bar
      if(ctx.measureText(t).width<=room){ctx.fillStyle='#ff3040';ctx.fillText(t,nx,21*k);}}
    else if(!MH.capDone&&!busy()){ctx.fillStyle='#c9c4ec';ctx.fillText('SCORE MULTIPLIER: a hit halves it',pad,sH+16*k);}
    ctx.restore();});
}
