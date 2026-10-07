// ===================== part 9: help (gx-help kit): coach bubbles the first time, the lightbulb on demand =====================
// Bubbles: once per phase, short, pointing at the board or the tiles. The bulb: the game's own advisor (startAdvice / recMove / aiMove, the same ones the
// computer's "best advice" uses) with a short why, plus rules cards. No hint buttons, no advice cards of their own.
const HLP={quiet:false};
// ---------------------------------------------------------------- pictures for the rules cards (inline SVG in the game's colours)
const HP={
 tile:()=>'<svg viewBox="0 0 64 64"><rect x="8" y="8" width="48" height="48" rx="8" fill="#1d7c83" stroke="#14232b" stroke-width="3"/><path d="M24 8Q24 30 8 38M40 8Q40 22 56 26M8 22Q30 24 36 56" fill="none" stroke="#c9f2ea" stroke-width="3.5" stroke-linecap="round"/></svg>',
 rot:()=>'<svg viewBox="0 0 64 64"><rect x="14" y="14" width="36" height="36" rx="7" fill="#1d7c83" stroke="#14232b" stroke-width="3"/><path d="M26 14Q26 30 14 36M38 14Q38 24 50 28" fill="none" stroke="#c9f2ea" stroke-width="3" stroke-linecap="round"/><path d="M52 12a22 22 0 0 1 4 18M52 12l-9 1M52 12l1 9" fill="none" stroke="#e3b24b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 junk:(c)=>'<svg viewBox="0 0 64 64"><path d="M8 42h48l-9 13H17z" fill="#8a5a2a" stroke="#14232b" stroke-width="3" stroke-linejoin="round"/><path d="M32 6v36M32 8l18 25H32z" fill="'+(c||'#e8d9a8')+'" stroke="#14232b" stroke-width="3" stroke-linejoin="round"/></svg>',
 mark:()=>'<svg viewBox="0 0 64 64"><rect x="4" y="44" width="56" height="16" rx="5" fill="#1d7c83" stroke="#14232b" stroke-width="3"/><circle cx="32" cy="36" r="9" fill="#e3b24b" stroke="#14232b" stroke-width="3"/><path d="M32 22V6M32 6l-7 8M32 6l7 8" fill="none" stroke="#e3b24b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 crown:()=>'<svg viewBox="0 0 64 64"><path d="M8 48h48l-4-28-13 12-7-19-7 19-13-12z" fill="#e3b24b" stroke="#8a6a1a" stroke-width="3" stroke-linejoin="round"/><rect x="8" y="48" width="48" height="7" rx="2" fill="#c99a35" stroke="#8a6a1a" stroke-width="2"/></svg>',
 line:()=>'<svg viewBox="0 0 64 64"><rect x="4" y="4" width="56" height="56" rx="8" fill="#1d7c83" stroke="#14232b" stroke-width="3"/><path d="M12 54Q12 32 32 32T52 10" fill="none" stroke="#14232b" stroke-width="10" stroke-linecap="round"/><path d="M12 54Q12 32 32 32T52 10" fill="none" stroke="#ffd24a" stroke-width="5.5" stroke-linecap="round"/><circle cx="12" cy="54" r="6" fill="#fff" stroke="#14232b" stroke-width="3"/></svg>',
 edge:()=>'<svg viewBox="0 0 64 64"><rect x="4" y="30" width="40" height="30" rx="6" fill="#1d7c83" stroke="#14232b" stroke-width="3"/><path d="M14 52Q30 52 30 40T56 20" fill="none" stroke="#ffd24a" stroke-width="5" stroke-linecap="round" stroke-dasharray="1 9"/><path d="M48 8l12 12M60 8L48 20" stroke="#d8432f" stroke-width="5" stroke-linecap="round"/></svg>',
 crash:()=>'<svg viewBox="0 0 64 64"><path d="M6 44h24l-5 10H11z" fill="#8a5a2a" stroke="#14232b" stroke-width="3" stroke-linejoin="round"/><path d="M58 44H34l5 10h14z" fill="#8a5a2a" stroke="#14232b" stroke-width="3" stroke-linejoin="round"/><path d="M32 8l4 10 10-2-7 8 8 6-11-1-2 11-3-10-10 3 6-9-8-6 11 1z" fill="#d8432f" stroke="#14232b" stroke-width="2" stroke-linejoin="round"/></svg>',
 lev:()=>'<svg viewBox="0 0 64 64"><path d="M6 50C10 28 22 40 28 26S44 16 52 24" fill="none" stroke="#14232b" stroke-width="12" stroke-linecap="round"/><path d="M6 50C10 28 22 40 28 26S44 16 52 24" fill="none" stroke="#3a9a6a" stroke-width="7" stroke-linecap="round"/><circle cx="54" cy="22" r="8" fill="#3a9a6a" stroke="#14232b" stroke-width="3"/><circle cx="56" cy="20" r="2.2" fill="#fff"/><path d="M60 26l4 4" stroke="#14232b" stroke-width="3" stroke-linecap="round"/></svg>',
 wave:()=>'<svg viewBox="0 0 64 64"><path d="M4 22q7-8 14 0t14 0 14 0 14 0M4 36q7-8 14 0t14 0 14 0 14 0M4 50q7-8 14 0t14 0 14 0 14 0" fill="none" stroke="#2d9ba5" stroke-width="5" stroke-linecap="round"/><circle cx="32" cy="32" r="13" fill="#fff" stroke="#14232b" stroke-width="3"/><text x="32" y="39" text-anchor="middle" font-size="20" font-weight="800" fill="#14232b" font-family="Georgia,serif">2+</text></svg>',
 dice:()=>'<svg viewBox="0 0 64 64"><rect x="8" y="12" width="32" height="32" rx="7" fill="#fff" stroke="#14232b" stroke-width="3" transform="rotate(-8 24 28)"/><circle cx="18" cy="22" r="3" fill="#14232b"/><circle cx="30" cy="34" r="3" fill="#14232b"/><circle cx="24" cy="28" r="3" fill="#14232b"/><rect x="30" y="26" width="26" height="26" rx="6" fill="#fff" stroke="#14232b" stroke-width="3" transform="rotate(10 43 39)"/><circle cx="38" cy="34" r="3" fill="#14232b"/><circle cx="48" cy="44" r="3" fill="#14232b"/></svg>',
 cannon:()=>'<svg viewBox="0 0 64 64"><rect x="8" y="28" width="38" height="16" rx="7" fill="#4a4f57" stroke="#14232b" stroke-width="3" transform="rotate(-18 27 36)"/><circle cx="20" cy="48" r="8" fill="#8a5a2a" stroke="#14232b" stroke-width="3"/><circle cx="54" cy="16" r="5" fill="#d8432f" stroke="#14232b" stroke-width="2"/></svg>',
 gate:()=>'<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="#3b2a6e" stroke="#14232b" stroke-width="3"/><path d="M32 12a20 20 0 1 1-18 12M32 20a12 12 0 1 1-10 8" fill="none" stroke="#c9a8ff" stroke-width="4" stroke-linecap="round"/></svg>',
 swap:()=>'<svg viewBox="0 0 64 64"><rect x="6" y="10" width="22" height="30" rx="4" fill="#1d7c83" stroke="#14232b" stroke-width="3"/><rect x="36" y="24" width="22" height="30" rx="4" fill="#2d9ba5" stroke="#14232b" stroke-width="3"/><path d="M14 50h18M32 50l-6-5M32 50l-6 5M50 16H32M32 16l6-5M32 16l6 5" fill="none" stroke="#e3b24b" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 pass:()=>'<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="22" fill="none" stroke="#d8432f" stroke-width="5"/><path d="M16 48L48 16" stroke="#d8432f" stroke-width="5"/></svg>',
 tap:()=>'<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="18" fill="rgba(227,178,75,.25)" stroke="#e3b24b" stroke-width="4"/><path d="M30 14v26l-6-5-4 4 14 14h14l4-20-8-2-4-4-4 1-2-4z" fill="#fff" stroke="#14232b" stroke-width="2.5" stroke-linejoin="round"/></svg>'
};
function hpics(items){return '<div class="gxh-pics">'+items.map(it=>it==='>'?'<span class="gxh-ar">&rarr;</span>':'<figure>'+(HP[it[0]]?HP[it[0]](it[2]):'')+(it[1]?'<figcaption>'+it[1]+'</figcaption>':'')+'</figure>').join('')+'</div>'}
// ---------------------------------------------------------------- where things are (the first one on screen that nothing covers)
const hq=(...sels)=>()=>{for(const s of sels){for(const e of document.querySelectorAll(s)){if(e.closest('[hidden]'))continue;const r=e.getBoundingClientRect();if(!r.width||!r.height)continue;
  const x=r.left+r.width/2,y=r.top+r.height/2;if(x<0||y<0||x>innerWidth||y>innerHeight)continue;const h=document.elementFromPoint(x,y);if(h&&(e===h||e.contains(h)))return e}}return null};
// like hq, but scrolls the element into view first when it sits outside the screen (a long question card)
const hqv=(...sels)=>()=>{for(const s of sels){const e=document.querySelector(s);if(!e||e.closest('[hidden]'))continue;let r=e.getBoundingClientRect();if(!r.width||!r.height)continue;
  if(r.top<0||r.bottom>innerHeight){try{e.scrollIntoView({block:'nearest'})}catch(x){}r=e.getBoundingClientRect()}
  const x=r.left+r.width/2,y=r.top+r.height/2;if(x<0||y<0||x>innerWidth||y>innerHeight)continue;const h=document.elementFromPoint(x,y);if(h&&(e===h||e.contains(h)))return e}return null};
// a world point on the board -> screen position (the same projection the gold marks and the route use)
function hproj(wx,wz,wy){try{const P=ovMakeProj();const bd=$('#board');if(!P||!bd)return null;const B=bd.getBoundingClientRect();const p=P(wx,wy==null?.05:wy,wz);return p?{x:B.left+p[0],y:B.top+p[1]}:null}catch(e){return null}}
// the start mark nearest the bottom middle of the screen (an example for the first bubble, not advice)
function hlpPipExample(){try{const d=sideToAct();const info=startInfo(d);let best=null,bd=1e9;
  for(const o of info){const p=hproj(o.w[0],o.w[1]);if(!p)continue;const dd=Math.abs(p.x-innerWidth/2)*.6+Math.abs(p.y-innerHeight*.55);if(dd<bd){bd=dd;best=p}}return best}catch(e){return null}}
const HLP_STEPS={
 start:{target:()=>hlpPipExample(),title:'Pick a start mark',text:'Tap a gold mark on the board\'s edge. The middle of an edge is safest; corners are cramped.',pic:()=>HP.mark()},
 lay:{target:hq('#ppop .ph-tiles','#ps .ps-tiles','#pin .hand'),title:'Lay a current',text:'Pick a tile, turn it, then tap Place. Your junk sails along the new line.',pic:()=>HP.tile()},
 nolay:{target:hq('#ps .ps-x .pb','#ps .ps-ctl .pb','#pin .row .btn','#main .row .btn'),title:'Nothing to lay',text:'No tile fits. Tap Pass, or use a Rift Gate or Deck Cannon if you have one.',pic:()=>HP.pass()},
 doom:{target:hq('#pc [data-a=q]','#main [data-qkind] [data-a=q]'),title:'Junk in danger',text:'A leviathan is about to sink you. Pick a rescue below, or Accept.',pic:()=>HP.lev()},
 cannon:{target:hq('#pc [data-a=q]','#main [data-qkind] [data-a=q]'),title:'A Deck Cannon',text:'Keep it to shoot a leviathan later, or discard it and draw a different tile.',pic:()=>HP.cannon()},
 bonus:{target:hq('#pc [data-a=q]','#main [data-qkind] [data-a=q]'),title:'Sunken crews\' tiles',text:'Swap one of your tiles for a sunken crew\'s tile, or keep your hand.',pic:()=>HP.swap()},
 gate:{target:hq('#pc [data-a=q]','#main [data-qkind] [data-a=q]'),title:'Rift Gate landing',text:'Tap an option below to choose where the Rift Gate puts you.',pic:()=>HP.gate()}
};
// ---------------------------------------------------------------- the rules cards (<= 20 words each, a picture each)
const HLP_RULES=[
 {title:'The goal',text:'Steer your junk with current tiles and stay afloat. The last junk afloat wins.',pic:()=>hpics([['junk','Stay afloat'],'>',['crown','Last one wins']])},
 {title:'One turn',text:'Dice may wake leviathans, you lay a tile, your junk sails the new line, then you draw.',pic:()=>hpics([['dice','Dice'],'>',['tile','Lay'],'>',['line','Sail']])},
 {phase:'start',title:'Last junk afloat wins',text:'Every junk starts on a gold mark. Stay afloat longer than every rival.',pic:()=>hpics([['junk','Stay afloat'],'>',['crown','Winner']])},
 {phase:'start',title:'Choose a start mark',text:'Tap a gold mark on the board\'s edge. Your junk will sail inward from it.',pic:()=>hpics([['mark','Start mark'],'>',['junk','Your junk']])},
 {phase:'start',title:'Corners are cramped',text:'A middle mark leaves room to turn. Near a corner you may run out of sea.',pic:()=>hpics([['edge','Edge = sunk'],['mark','Middle = room']])},
 {phase:'lay',title:'Lay and turn a tile',text:'Tap a tile, turn it with the arrows or a swipe, then tap Place. It joins your junk\'s line.',pic:()=>hpics([['tile','Pick'],'>',['rot','Turn'],'>',['tap','Place']])},
 {phase:'lay',title:'Your junk sails',text:'After you place, your junk sails along every connected current until the line ends. Rivals sail the same way.',pic:()=>hpics([['junk','Your junk'],'>',['line','Follows the line']])},
 {phase:'lay',title:'Edges and crashes sink',text:'Sail off the board, into a leviathan, or onto another junk\'s wake, and you sink. Check the red cross.',pic:()=>hpics([['edge','Edge'],['lev','Leviathan'],['crash','Crash']])},
 {phase:'lay',title:'Leviathans and waves',text:'Dice wake leviathans each turn; one that reaches you sinks you. A rogue wave capsizes junks that roll low.',pic:()=>hpics([['lev','Leviathan'],['wave','Rogue wave']])},
 {phase:'nolay',title:'No tile fits',text:'If you cannot lay a tile, you may pass. A Rift Gate or Deck Cannon can still help.',pic:()=>hpics([['tile','No tile'],'>',['pass','Pass']])},
 {phase:'nolay',title:'Rift Gate',text:'A Rift Gate throws a junk to a rolled square. Use it to escape danger.',pic:()=>hpics([['gate','Rift Gate']])},
 {phase:'nolay',title:'Deck Cannon',text:'Fire a Deck Cannon at a leviathan next to your junk. It is removed from the board.',pic:()=>hpics([['cannon','Fire'],'>',['lev','Gone']])},
 {phase:'doom',title:'Sinking soon',text:'A leviathan is about to reach your junk. You get one chance to react before it happens.',pic:()=>hpics([['lev','Leviathan'],'>',['junk','Your junk']])},
 {phase:'doom',title:'Rescue options',text:'Fire a Deck Cannon, jump through a Rift Gate, or move to a safer square. Tap one.',pic:()=>hpics([['cannon','Cannon'],['gate','Gate']])},
 {phase:'doom',title:'Or accept',text:'If nothing helps, tap Accept. Your junk sinks, but a rival must still outlast the others.',pic:()=>hpics([['crash','Accept'],'>',['crown','Others race on']])},
 {phase:'cannon',title:'A Deck Cannon',text:'Hold up to two. Fire one at a leviathan next to your junk, even on a rival\'s turn.',pic:()=>hpics([['cannon','Fire'],'>',['lev','Gone']])},
 {phase:'cannon',title:'Keep or discard',text:'Keep it for later, or show it and discard it to draw a different tile.',pic:()=>hpics([['cannon','Keep'],['swap','Redraw']])},
 {phase:'bonus',title:'Elimination bonus',text:'When a junk sinks, its tiles go to a pool. You may swap yours for better ones.',pic:()=>hpics([['crash','Sunk'],'>',['swap','Swap']])},
 {phase:'bonus',title:'Keep your hand',text:'Tap Keep your hand if your tiles are already good. Swapping is optional.',pic:()=>hpics([['tile','Your tiles'],['pass','No swap']])},
 {phase:'gate',title:'Rift Gate',text:'A rift throws a junk to a rolled square, and it lands on a tile you place.',pic:()=>hpics([['gate','Rift'],'>',['junk','New spot']])},
 {phase:'gate',title:'Choose the landing',text:'Pick a landing far from the edges and from leviathans, so your junk has room to sail.',pic:()=>hpics([['edge','Near edge'],['junk','Open sea']])}
];
// ---------------------------------------------------------------- phases
// who may decide on the board right now (a seat), or null when the sea is moving, a card is up, or it is not your turn
function hlpSeat(){if(!G||!UI.started||G.over||UI.busy)return null;const st=$('#start');if(st&&!st.hidden)return null;if(GX.open)return null;
  const d=sideToAct();if(d<0||!G.seats[d].human||mustPass(d))return null;if(NET.on&&d!==NET.mySeat)return null;
  if(!G.q&&UI.sunk&&UI.sunk.length)return null;if(PH.on&&PH.cur&&PH.cur.block&&PH.cur.kind!=='q')return null;return d}
const HLP_Q={doom:'doom',cannonDraw:'cannon',bonus:'bonus',gateSq:'gate',gatePlace:'gate',gateWake:'gate'};
function hlpPhaseRaw(){const d=hlpSeat();if(d==null)return null;
  if(G.q)return HLP_Q[G.q.kind]||null;
  if(G.phase==='setup')return 'start';
  if(G.phase==='play'&&G.step==='act')return UI.canPlace?'lay':'nolay';
  return null}
const hlpPhase=()=>{try{return hlpPhaseRaw()}catch(e){return null}};
// ---------------------------------------------------------------- the bulb: one plan per move, used for the finger, the glow and the sentence
function capW(t,n){const w=String(t||'').replace(/\s+/g,' ').trim().split(' ');return w.length<=n?w.join(' '):''}
function hlpQWhy(q,o){const h=o&&o.h;
  return h==='dCannon'?'Fire the cannon: it removes the leviathan.':h==='dGate'?'The Rift Gate throws your junk clear.':h==='dReloc'?'This square is the safest place to move to.':h==='dAccept'?'Nothing saves you here, so accept.':
   h==='cKeep'?'A cannon can save your junk later.':h==='cDiscard'?'Discard it and draw a different tile.':h==='bSwap'?'Their tile is more useful than yours.':h==='bDone'?'Your tiles are already good. Keep them.':
   q.kind==='gateSq'?'Far from the edges and from leviathans.':q.kind==='gatePlace'?'The tile that gives your junk the best landing.':q.kind==='gateWake'?'The wake that leaves your junk safest.':'The best choice right now.'}
function hlpPlan(){const d=hlpSeat();if(d==null)return null;const ph=hlpPhaseRaw();if(!ph)return null;let K;try{K=knowledge(d)}catch(e){return null}
  if(ph==='start'){const info=startInfo(d),adv=startAdvice(K,d,info);if(!adv)return null;const m=adv.o.m;const corner=(m.x===0||m.x===BW-1)&&(m.y===0||m.y===BW-1);
    const dm=distMon(K,[m.x,m.y]);const hasL=K.mons.some(q=>q.k==='L');
    let why=capW((corner?'A corner, but the best left.':'Away from the corners, so you have room to turn.')+(hasL?' Nearest leviathan: '+dm+' away.':''),15)||capW(corner?'A corner, but the best left.':'Away from the corners, so you have room to turn.',15);
    return {ph,why,key:'start:'+m.x+','+m.y+','+m.e,to:()=>hproj(adv.o.w[0],adv.o.w[1]),from:null}}
  if(G.q){const q=G.q;let r=null;try{r=aiMove(d,'hard')}catch(e){}if(!r||r.a!=='q'||!q.opts[r.i])return null;const i=r.i;
    const why=capW(hlpQWhy(q,q.opts[i]),15);if(!why)return null;
    return {ph,why,key:'q:'+q.kind+':'+i,to:hqv('[data-a=q][data-i="'+i+'"]'),from:null}}
  const m=recMove(d);if(!m)return null;
  if(m.a==='place'){const A=analyse(K,d,m);
    const why=capW(A.st==='ok'?'Safest tile: sails '+A.n+' current'+(A.n>1?'s':'')+', stops at column '+(A.end[0]+1)+', row '+(A.end[1]+1)+'.':A.st==='gate'?'It leads into the Rift Gate.':'Every tile is risky; this one is the least bad.',15);if(!why)return null;
    const apply=()=>{const s=UI.sel;if(!s||s.t!==m.t||s.r!==m.r||s.s!==m.s){UI.sel={t:m.t,r:m.r,s:m.s};HLP.quiet=true;try{render()}finally{HLP.quiet=false}}};
    return {ph,why,key:'place:'+m.t+':'+m.r+':'+m.s,apply,from:hq('#ppop .ph-t[data-t="'+m.t+'"]','#ps .pt[data-t="'+m.t+'"]','#pin .hc[data-t="'+m.t+'"]'),to:hq('#ppop [data-a=place]','#ps [data-a=place]','#pin [data-a=place]')}}
  if(m.a==='cannon')return {ph,why:'It removes a leviathan that is next to you.',key:'cannon:'+m.m,from:null,to:hq('[data-a=cannon][data-m="'+m.m+'"][data-s="'+m.s+'"]')};
  if(m.a==='gate')return {ph,why:'It moves you away from danger.',key:'gate:'+m.t,from:null,to:hq('[data-a=gate][data-t="'+m.t+'"][data-s="'+m.s+'"]','[data-a=gate][data-t="'+m.t+'"]')};
  if(m.a==='pass')return {ph,why:'You have nothing to play.',key:'pass',from:null,to:hq('[data-a=pass]')};
  return null}
function hlpSuggest(){let p=null;try{p=hlpPlan()}catch(e){console.error(e)}if(!p)return null;
  if(p.apply)p.apply();
  const to=p.to();if(!to)return null;
  return {why:p.why,key:p.key,target:p.to,from:p.from&&p.from()?p.from:null}}
// ---------------------------------------------------------------- wiring
let _hlpInit=false;
function hlpInit(){if(_hlpInit||typeof GXH==='undefined')return;_hlpInit=true;
  GXH.init({game:'tidewake',defaultOn:true,steps:HLP_STEPS,rules:HLP_RULES,avoid:'.opip,.oring,#ps .pt,#ps .pb,#ppop .pb,#ppop .ph-t,#pc .btn,#pin .hc,#pin .btn,#dockbody .btn'});
  GXH.bulb({el:'#bulbbtn',suggest:hlpSuggest,rulesFor:hlpPhase});
  const b=$('#bulbbtn');if(b)b.addEventListener('click',()=>{try{const c=GXH.state().cur;if(c&&c.kind==='bulb'&&G&&UI.started)UI.campHints=(UI.campHints||0)+1}catch(e){}})}
function hlpAfter(){hlpInit();if(typeof GXH==='undefined'||HLP.quiet)return;GXH.phase(hlpPhase())}
{const _r=render;render=function(){const r=_r.apply(this,arguments);try{hlpAfter()}catch(e){console.error(e)}return r};
 const _pa=phAfter;phAfter=function(){const r=_pa.apply(this,arguments);try{hlpAfter()}catch(e){console.error(e)}return r}}
hlpInit();
