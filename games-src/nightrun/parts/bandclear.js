// PURPOSE: no enemy rests under the HUD band on a phone: flyers cross it fast, strays are moved out
// FLAG: bandclear (?bandclear=0)
// TEST: hudband-test.js
/* ---------- bandclear.js: nothing shows under the score strip (strict review 10 F01: enemies entered through the band and stayed 1-3.5 s under the score on 40-50% of frames). Flag RET.bandclear; ?bandclear=0 = as before.
   Portrait phones only (rotMode): the band is the top 92 x HK units of the field (score strip, chips, boss bar).
   WARP-IN: in the frame a flyer would show with its top edge inside the band (it comes in from the top, is created there, or its AI would rest there) it is put on the band's lower edge instead, before the frame is drawn: a unit on a formation path skips along its own path to the first point below the band (the path and the spacing of the line are kept, a follower arrives later and does the same), any other flyer is placed. Nothing is ever seen in the band.
   A boss's body (1.8 x r) is kept out of the band once it has taken its place (its entrance from above is left alone). Ground enemies are untouched. Test: hudband-test.js. ---------- */
if(RET.bandclear===undefined)RET.bandclear=!/[?&]bandclear=0/.test(location.search);
const BCL=window.BCL={st:{warp:0,shift:0},band(){return rotMode?92*HK:0;}};
const bclPlace=e=>{const B=BCL.band(),edge=W-B-e.r-1;
  if(e.fp&&e.pth){let t=Math.max(0,e.pt||0),p=e.pth(t,e),i=0;while(p[0]+(e.ox||0)>edge&&i++<400){t+=.02;p=e.pth(t,e);}
    if(i<400){e.pt=t;e.x=p[0]+(e.ox||0);e.y=p[1];}else{e.ox=(e.ox||0)+edge-(p[0]+(e.ox||0));e.x=edge;BCL.st.shift++;}}   // a path that never leaves the band: the whole path is moved down
  else e.x=edge;
  if(e.stop!=null&&e.stop>edge)e.stop=edge;BCL.st.warp++;};                                      // a turret's rest line too
NR.on('tick',dt=>{if(!RET.bandclear||!rotMode||!G||!G.live||G.dead)return;const B=BCL.band();
  for(const e of G.en){if(e.hp<=0||e.dead)continue;
    if(e.type==='boss'){if(e.t>2){const mx=W-B-1.8*e.r-2;if(e.x>mx&&e.x<=bossX()+120)e.x=mx;}continue;}   // a boss's move may carry its body up into the band: clamp it (it arrives from above and is left alone until it has taken its place)
    if(!e.gnd&&e.x<W&&W-e.x-e.r<B)bclPlace(e);}});
