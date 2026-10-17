// Clarity test: the result (Victory/Defeat card, "Game over" strip) must never appear before the replay has shown the sinking
// that caused it; the wake-roll card must not appear before its dice are rolled in the replay (it used to pop up
// the moment you tapped Place, before your own junk sailed, so it looked like your roll); and once the replay ends no sunk junk may still be drawn on the board.
// usage: node reveal-order.js [url] [games] [WxH]
const {chromium}=require('playwright');
const url=process.argv[2]||'http://127.0.0.1:8812/tidewake.html';const N=+process.argv[3]||5;const [W,H]=(process.argv[4]||'390x763').split('x').map(Number);
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});let early=0,ghost=0,sinks=0,me=0;
 for(let g=0;g<N;g++){const p=await (await b.newContext({viewport:{width:W,height:H},isMobile:W<600,hasTouch:W<600})).newPage();
  p.on('pageerror',e=>console.log('PAGE ERROR',e.message));
  await p.goto(url);await p.waitForTimeout(1500);
  await p.evaluate(s=>{try{localStorage.clear()}catch(e){}setSeed(s);setAiSeed(s);AIDELAY=30;UI.speed=6;startGuided();
    const _mb=mphBuild;mphBuild=function(){const r=_mb.apply(this,arguments);window.__built=r;window.__dz=0;return r};
    const _pe=playEv;playEv=function(e){if(e.t==='dice')window.__dz=1;return _pe.apply(this,arguments)}},100+g);
  let sawEarly=false,mphEarly=false;
  for(let i=0;i<600;i++){const st=await p.evaluate(()=>{const vis=el=>el&&!el.closest('[hidden]')&&el.getBoundingClientRect().height>0;
      const res=/Victory|Defeat|Game over|last junk afloat/.test(([...document.querySelectorAll('#pc,#main,#ps')].filter(vis).map(e=>e.innerText).join(' ')));
      if(G&&G.over&&UI.busy&&res)return 'early';
      const card=[...document.querySelectorAll('#res .mph,#pc .mph')].some(vis);if(UI.busy&&card&&window.__built&&UI.mph===window.__built&&!window.__dz)return 'mph';if(!G||G.over)return UI.busy?'busy':'over';if(UI.busy)return 'busy';const s=aiStep(true);if(s){act(s.m,s.seat);return 'acted'}return 'idle'});
    if(st==='early')sawEarly=true;if(st==='mph'){mphEarly=true;continue}if(st==='over')break;await p.waitForTimeout(st==='busy'?150:40)}
  await p.waitForTimeout(800);
  const r=await p.evaluate(()=>{const ks=TWKit.getState().ships.map(s=>s.id);const dead=G.ships.filter(s=>!s.alive).map(s=>'s'+s.i);return {over:!!G.over,busy:UI.busy,dead,drawn:ks.filter(id=>dead.includes(id))}});
  sinks+=r.dead.length;if(sawEarly)early++;if(mphEarly)me++;if(r.drawn.length)ghost++;console.log(`game ${g}: roll card before its dice: ${mphEarly}; result shown before replay ended: ${sawEarly}; sunk junk still drawn: ${r.drawn.length}`);await p.close()}
 console.log(`reveal-order ${W}x${H}: roll card early ${me}/${N}, early result ${early}/${N}, ghost ships ${ghost}/${N} (${sinks} sinkings) -> ${early||ghost||me?'FAIL':'PASS'}`);await b.close();process.exit(early||ghost||me?1:0)})();
