// ---------- help (gx-help kit): coach bubbles the first time, the lightbulb on demand, rules cards ----------
// Bubbles: once per phase, short, pointing at the board. The bulb: the normal computer's own pick (aiPlan / bestFigNow) with a short why + rules cards.
// hlpPlan() is the one place that decides the advice; the glow, the finger and the bulb all use it.
const hq=s=>()=>document.querySelector(s);
const hTile=(id,r)=>{const t=TT.findIndex(x=>x.id===id);return t<0?'':`<svg viewBox="0 0 100 100" aria-hidden="true"><g transform="rotate(${(r||0)*90} 50 50)">${tileSVG(t)}</g></svg>`};
const hIco=(n,c)=>`<svg viewBox="0 0 24 24" fill="none" stroke="${c||'#b5532f'}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICP[n]||''}</svg>`;
const HP={
 road:()=>hTile('BA_RFr'),roadT:()=>hTile('BA_RFr',1),town:()=>hTile('BA_Cc_1'),townT:()=>hTile('BA_Cc_1',1),priory:()=>hTile('BA_L'),gate:()=>hTile('BA_CccR'),
 river:()=>hTile('RI_1_IFI'),riverB:()=>hTile('RI_1_II'),riverB2:()=>hTile('RI_1_II',1),
 meeple:()=>hIco('meeple'),champ:()=>hIco('champ','#2d62b8'),mason:()=>hIco('mason','#3b8a45'),hog:()=>hIco('hog','#a064c0'),
 turn:()=>'<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="26" fill="#fff8e8" stroke="#e0a83a" stroke-width="3"/><path d="M44 24a14 14 0 1 0 2 12" fill="none" stroke="#b5532f" stroke-width="5" stroke-linecap="round"/><path d="M46 12v14H32" fill="none" stroke="#b5532f" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 tap:()=>'<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="30" r="20" fill="rgba(255,210,74,.35)" stroke="#e0a83a" stroke-width="4"/><path d="M30 14v24l-6-5-4 4 14 14h14l4-18-8-2-4-4-4 1-2-4z" fill="#fff" stroke="#2d2016" stroke-width="2.5" stroke-linejoin="round"/></svg>',
 pts:(n)=>`<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="26" fill="#ffe9a8" stroke="#e0a83a" stroke-width="3"/><text x="32" y="42" text-anchor="middle" font-size="26" font-weight="800" fill="#b5532f" font-family="Georgia,serif">${n||'+4'}</text></svg>`,
 skip:()=>'<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="6" y="18" width="52" height="28" rx="14" fill="#b5532f"/><path d="M18 32h28M38 24l8 8-8 8" fill="none" stroke="#fff8ec" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 home:()=>'<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M8 30L32 10l24 20" fill="none" stroke="#7a1f31" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/><rect x="16" y="30" width="32" height="24" fill="#ead7b2" stroke="#7a1f31" stroke-width="4"/><rect x="27" y="38" width="10" height="16" fill="#b5532f"/></svg>',
 lock:()=>'<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="24" fill="none" stroke="#b5532f" stroke-width="5"/><path d="M15 49L49 15" stroke="#b5532f" stroke-width="5"/></svg>'
};
function hpics(items){return '<div class="gxh-pics">'+items.map(it=>it==='>'?'<span class="gxh-ar">&rarr;</span>':'<figure>'+(HP[it[0]]?HP[it[0]](it[2]):'')+(it[1]?'<figcaption>'+it[1]+'</figcaption>':'')+'</figure>').join('')+'</div>'}
// ---------------------------------------------------------------- the phase (null when the player has nothing to decide)
function hlpPhase(){try{if(!G||G.over||UI.sim||!G.cur||!myTurn())return null;if(document.querySelector('#modal .scrim,.gxc,#menu'))return null;
  if(G.step==='place')return G.cur.bonus?'bonus':isRiver(G.cur.t)?'river':'place';
  if(G.step==='fig'){const ms=figMoves(G.cur.p).filter(m=>m.act==='fig');if(!ms.length)return 'nofig';return ms.some(m=>m.k==='bld'||m.k==='pig')?'figx':'fig'}}catch(e){}return null}
// ---------------------------------------------------------------- where each bubble points
const hGlow=(x,y)=>{const e=document.querySelector(`#world .glow[data-x="${x}"][data-y="${y}"]`);return e&&e.style.visibility!=='hidden'?e:null};
function hAnyGlow(){const b=boardEl().getBoundingClientRect(),cx=b.left+b.width/2,cy=b.top+b.height/2;let best=null,bd=1e9;
  for(const g of document.querySelectorAll('#world .glow')){if(g.style.visibility==='hidden')continue;const r=g.getBoundingClientRect(),d=Math.hypot(r.left+r.width/2-cx,r.top+r.height/2-cy);if(d<bd){bd=d;best=g}}return best}
function hFig(f){return()=>{const l=(UI.figs||[]).filter(b=>b.isConnected&&f(b._m));return l[0]||null}}
const HLP_STEPS={
 place:{target:hAnyGlow,title:'Place your tile',text:'Tap a glowing square to lay it there. Tap the tile below to turn it.',pic:()=>HP.tap()},
 river:{target:hAnyGlow,title:'Follow the river',text:'Lay this tile so the river carries on. Tap a glowing square.',pic:()=>HP.river()},
 bonus:{target:hAnyGlow,title:'Extra turn!',text:'Your mason earned another tile. Tap a glowing square to place it.',pic:()=>HP.mason()},
 fig:{target:hFig(m=>true),title:'Claim with a follower',text:'Tap a glowing circle to claim that road, town or field. Or tap Skip.',pic:()=>HP.meeple()},
 figx:{target:hFig(m=>m.k==='bld'||m.k==='pig'),title:'Mason or hog',text:'Your mason or hog can join a feature you already hold. Tap its circle.',pic:()=>HP.mason()},
 nofig:{target:hq('#hskip'),title:'Nothing to claim',text:'Every road, town and field here is taken. Tap Skip to go on.',pic:()=>HP.skip()}
};
// ---------------------------------------------------------------- the rules cards (<= 20 words each, a picture each)
const HLP_RULES=[
 {title:'The goal',text:'Build a valley tile by tile. Finished roads and towns score points. Most points wins.',pic:()=>hpics([['road'],['town'],'>',['pts','Winner','+9']])},
 {title:'Every turn',text:'Place a tile so its edges match. Then claim a road, town or field with a follower, or skip.',pic:()=>hpics([['town','Tile'],'>',['meeple','Follower']])},
 {phase:'place',title:'Match the edges',text:'Lay the tile so touching edges match: road to road, town to town, field to field.',pic:()=>hpics([['road','Road'],['road','Road'],'>',['town','Town'],['townT','Town']])},
 {phase:'place',title:'Turn it first',text:'Tap your tile at the bottom to turn it. Glowing squares show where it fits.',pic:()=>hpics([['town'],['turn'],['townT']])},
 {phase:'place',title:'Closed means points',text:'A road or town scores when nothing is left open. Longer ones are worth more.',pic:()=>hpics([['gate','Closed town'],'>',['pts','Scores','+8']])},
 {phase:'bonus',title:'Extra turn',text:'Your mason’s road or town just grew, so you draw and place another tile.',pic:()=>hpics([['mason','Mason'],'>',['town','Tile']])},
 {phase:'bonus',title:'Place it as usual',text:'Tap a glowing square. Then you may claim with a follower, as always.',pic:()=>hpics([['tap'],'>',['meeple']])},
 {phase:'river',title:'Follow the river',text:'River tiles come first. Each one must carry the river on from the last tile.',pic:()=>hpics([['river'],['river'],['riverB']])},
 {phase:'river',title:'No double turns',text:'The river may not turn the same way twice in a row.',pic:()=>hpics([['riverB','Turn'],['riverB2','Other way']])},
 {phase:'river',title:'Then the valley',text:'After the last river tile, normal tiles begin and you build outward.',pic:()=>hpics([['river'],'>',['town']])},
 {phase:'fig',title:'Claim with a follower',text:'Tap a glowing circle to put a follower on that road, town, priory or field.',pic:()=>hpics([['meeple','Follower'],'>',['road','Road']])},
 {phase:'fig',title:'One owner only',text:'You cannot claim a road, town or field that already has a follower anywhere along it.',pic:()=>hpics([['meeple','Taken'],['lock']])},
 {phase:'fig',title:'Scored followers go home',text:'When it closes, the owner scores and the follower returns, ready to use again.',pic:()=>hpics([['pts','Score','+6'],'>',['home','Home']])},
 {phase:'fig',title:'Farmers wait',text:'A farmer in a field stays until the end. It scores 3 for each finished town beside it.',pic:()=>hpics([['meeple','Farmer'],'>',['pts','Per town','+3']])},
 {phase:'figx',title:'The mason',text:'Place a mason on a road or town you already hold. Each tile that grows it gives an extra turn.',pic:()=>hpics([['mason','Mason'],'>',['road']])},
 {phase:'figx',title:'The hog',text:'Place a hog in a field where your farmer stands. Each finished town beside it scores 4, not 3.',pic:()=>hpics([['hog','Hog'],'>',['pts','Per town','+4']])},
 {phase:'figx',title:'Only with your own',text:'Both need your own follower on that same road, town or field first.',pic:()=>hpics([['meeple','Yours'],['mason','Mason']])},
 {phase:'nofig',title:'Nothing free',text:'Every road, town and field on this tile already has a follower. Tap Skip.',pic:()=>hpics([['lock'],'>',['skip','Skip']])},
 {phase:'nofig',title:'Followers come back',text:'Close a feature and its followers return. You start with seven.',pic:()=>hpics([['meeple','Waiting'],'>',['home','Home']])}
];
// ---------------------------------------------------------------- the advice: the normal computer's own pick
const HLPS={key:'',plan:null};
function hlpPlan(){if(!G||G.over||!G.cur||UI.sim||!myTurn())return null;const s=G.cur.p;
  if(G.step==='place'){const k=G.turn+':'+G.order.length+':'+G.cur.t;if(HLPS.key!==k){HLPS.key=k;HLPS.plan=null;try{HLPS.plan=aiPlan(s,'normal')}catch(e){}}
    const pl=HLPS.plan;if(!pl||!isLegal(pl.place,s))return null;return {kind:'place',move:pl.place,why:hlpWhyPlace(pl,s)}}
  if(G.step==='fig'){let m=null;try{m=bestFigNow(s,'normal')}catch(e){}if(!m||!isLegal(m,s))return null;return {kind:'fig',move:m,why:hlpWhyFig(m,s)}}
  return null}
function hlpWhyPlace(pl,s){for(const w of pl.why||[]){
    if(w.k==='close'&&w.win.includes(s))return `Finishes your ${FEAT[w.ty]}: +${Math.round(w.pts)} points.`;
    if(w.k==='grow')return `Grows the ${FEAT[w.ty]} you already hold.`;
    if(w.k==='hurt')return `Makes a rival’s ${FEAT[w.ty]} harder to finish.`;
    if(w.k==='priory')return 'Surrounds your priory: +9 points.'}
  if(pl.bonus)return 'Your mason earns an extra turn here.';
  if(pl.figOpt)return `A good spot to claim a ${FEAT[pl.figOpt.g.ty]}.`;
  return 'The safest spot: it keeps your options open.'}
function hlpWhyFig(m,s){if(m.act==='skip')return 'Nothing here is worth a follower. Skip.';
  const ty=TSEG[G.tiles[G.cur.k].t][m.l].ty;
  if(m.k==='bld')return 'Mason here: each tile that grows it gives an extra turn.';
  if(m.k==='pig')return 'Hog here: each finished town beside it scores 4, not 3.';
  if(m.k==='big')return `Your champion counts as two on this ${FEAT[ty]}.`;
  return ty==='F'?'Send a farmer into this field. It pays at the end.':ty==='M'?'Put a follower on this priory.':`Claim this ${FEAT[ty]} with a follower.`}
// bring the suggested square into view (turn the tile, pan the map) so the glow, finger and bulb all land on it
function hlpTurnTo(r){UI.deg+=((r-UI.rot+4)%4||4)*90;UI.rot=r;renderGlows();updateGhost();placeOverlay();const b=$('#htile');if(b)b.querySelector('.spin').style.transform=`rotate(${UI.deg}deg)`}
function hlpSuggest(){const h=hlpPlan();if(!h)return null;const m=h.move;
  if(h.kind==='place'){if(UI.tw){if(!UI.user)refit(false);else{cancelAnimationFrame(UI.tween);UI.tw=false}}
    if(UI.rot!==m.r)hlpTurnTo(m.r);
    if(!hGlow(m.x,m.y)){cancelAnimationFrame(UI.tween);UI.tw=false;setView(viewFor({c:Math.max(MINC,UI.view.s*100),cx:m.x+.5,cy:m.y+.5},measure()));UI.user=true}
    if(!hGlow(m.x,m.y))return null;return {target:()=>hGlow(m.x,m.y),why:h.why}}
  if(UI.tw)zoomTile(G.cur.k,false);
  if(m.act==='skip')return {target:()=>$('#hskip'),why:h.why};
  if(!(UI.figs||[]).some(b=>b._m.k===m.k&&b._m.l===m.l))return null;
  return {target:()=>(UI.figs||[]).find(b=>b.isConnected&&b._m.k===m.k&&b._m.l===m.l)||null,why:h.why}}
// ---------------------------------------------------------------- wiring
let _hlpInit=false;
function hlpInit(){if(_hlpInit||typeof GXH==='undefined')return;_hlpInit=true;
  GXH.init({game:'rampart-and-vine',defaultOn:true,steps:HLP_STEPS,rules:HLP_RULES,top:()=>{const t=$('#top');return t?Math.ceil(t.getBoundingClientRect().bottom)+4:6},
    avoid:'.glow,.fglow,#htile.mine,#hskip,#status'});
  GXH.bulb({el:'#bulbbtn',suggest:hlpSuggest,rulesFor:hlpPhase});
  setInterval(()=>{try{GXH.phase(hlpPhase())}catch(e){}},500)}
function hlpAfter(){hlpInit();if(typeof GXH==='undefined')return;try{GXH.phase(hlpPhase())}catch(e){}}
hlpInit();
