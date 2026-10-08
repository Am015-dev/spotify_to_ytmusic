// ===================== part 10: help (shell/gx-help.js): coach bubbles the first time, the lightbulb on demand =====================
// Bubbles: once per phase (pick a colour / choose a row / choose a wall space), short, pointing at the board. The bulb: the game's own advice function
// (adviceFor -> bestNetTake / bestWallCell, through bfAdvice) as a ghost finger plus a short why, and rules cards. No safe advice -> rules cards only.
// Help lives on the board-first table (phone layout, also used by the tutorial on any screen); the old 3D desktop dock keeps its guide panel.
const hT=(c,x,y,s)=>`<svg x="${x}" y="${y}" width="${s}" height="${s}" viewBox="0 0 100 100"><use href="#gz${c}"/></svg>`;
const hSVG=b=>`<svg viewBox="0 0 64 64" role="img" aria-hidden="true">${b}</svg>`;
const hRing=(x,y,w,h,r)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r||4}" fill="none" stroke="#ffd24a" stroke-width="2.4"/>`;
const HPIC={
  kiln:()=>hSVG(`<circle cx="32" cy="32" r="29" fill="#b44a2c" stroke="#e7b660" stroke-width="3"/>${hT(2,12,12,19)}${hT(2,33,12,19)}${hT(1,12,33,19)}${hT(0,33,33,19)}${hRing(10,10,23,23,5)}${hRing(31,10,23,23,5)}`),
  middle:()=>hSVG(`<ellipse cx="32" cy="38" rx="29" ry="22" fill="#e0c08e" stroke="#a0703e" stroke-width="3"/>${hT(1,8,31,15)}${hT(0,24,38,15)}${hT(4,40,31,15)}${hT('sun',22,2,20)}`),
  racks:()=>hSVG([0,1,2,3,4].map(r=>Array.from({length:r+1},(_,k)=>`<rect x="${52-(k+1)*10}" y="${4+r*12}" width="9" height="9" rx="2" fill="#d6c29a" stroke="#9a7a4e" stroke-width="1"/>`).join('')).join('')+hT(4,42,4,9)+hT(2,32,16,9)+hT(2,42,16,9)+hT(0,22,28,9)),
  oneColour:()=>hSVG(`<rect x="6" y="8" width="52" height="14" rx="3" fill="#d6c29a" stroke="#9a7a4e" stroke-width="1.5"/>${hT(1,20,9,12)}${hT(1,33,9,12)}${hT(1,46,9,12)}<rect x="6" y="28" width="52" height="14" rx="3" fill="#d6c29a" stroke="#9a7a4e" stroke-width="1.5"/>${hT(0,33,29,12)}${hT(3,46,29,12)}<path d="M22 31l8 8m0-8l-8 8" stroke="#c0392b" stroke-width="3" stroke-linecap="round"/>`),
  blocked:()=>hSVG(`<rect x="4" y="10" width="26" height="14" rx="3" fill="#d6c29a" stroke="#9a7a4e" stroke-width="1.5"/><path d="M34 17h6" stroke="#a07040" stroke-width="3" stroke-linecap="round"/>${[0,1,2,3,4].map(i=>`<rect x="${4+i*12}" y="34" width="11" height="11" rx="2" fill="#fffaf0" stroke="#cdb995"/>`).join('')}${hT(2,4+24,35,9)}${hT(2,6,11,12)}<path d="M8 12l16 10m0-10L8 22" stroke="#c0392b" stroke-width="3" stroke-linecap="round"/>`),
  floor:()=>hSVG(`${[0,1,2,3,4,5,6].map(i=>`<rect x="${3+i*8.6}" y="12" width="7.6" height="14" rx="2" fill="#ecd3c7" stroke="#a8493a" stroke-width="1"/><text x="${6.8+i*8.6}" y="22.5" font-size="6.5" font-weight="800" text-anchor="middle" fill="#a8302a" font-family="sans-serif">${['−1','−1','−2','−2','−2','−3','−3'][i]}</text>`).join('')}${hT(0,6,34,13)}${hT(0,22,40,13)}<path d="M13 49v7M29 55v7" stroke="#c0392b" stroke-width="2" stroke-linecap="round"/>`),
  wall:()=>hSVG(`${[0,1,2,3,4].map(r=>[0,1,2,3,4].map(c=>`<rect x="${4+c*11.4}" y="${4+r*11.4}" width="10.4" height="10.4" rx="2" fill="#fffaf0" stroke="#cdb995"/>`).join('')).join('')}${hT(1,4+11.4*1,4+11.4*2,10.4)}${hT(2,4+11.4*2,4+11.4*2,10.4)}${hT(0,4+11.4*2,4+11.4*1,10.4)}${hT(4,4+11.4*2,4+11.4*3,10.4)}${hRing(4+11.4*2-1,4+11.4*2-1,12.4,12.4,3)}`),
  bonus:()=>hSVG(`${[0,1,2,3,4].map(c=>hT(c,3+c*11.6,3,10.4)).join('')}<text x="32" y="26" text-anchor="middle" font-size="9" font-weight="800" fill="#2f8a4a" font-family="sans-serif">row +2</text>${[0,1,2].map(r=>hT(r+1,6,31+r*11.4,10.4)).join('')}<text x="22" y="44" font-size="9" font-weight="800" fill="#2f8a4a" font-family="sans-serif">column +7</text><text x="22" y="58" font-size="9" font-weight="800" fill="#2f8a4a" font-family="sans-serif">colour +10</text>`),
  goal:()=>hSVG(`${[0,1,2,3,4].map(r=>[0,1,2,3,4].map(c=>`<rect x="${4+c*11.4}" y="${4+r*11.4}" width="10.4" height="10.4" rx="2" fill="#fffaf0" stroke="#cdb995"/>`).join('')).join('')}${[0,1,2,3,4].map(r=>[0,1,2,3,4].filter(c=>c<=r).map(c=>hT(((c-r)%5+5)%5,4+c*11.4,4+r*11.4,10.4)).join('')).join('')}`)
};
const HLP_STEPS={
  pick:{target:()=>bfQ('.bf-k.can')||bfQ('.bf-pool.can'),title:'Take one colour',text:'Tap any tile. You take every tile of that colour from its kiln.',pic:HPIC.kiln},
  rack:{target:()=>bfQ('.bf-row.ok .bf-rack')||bfQ('.bf-floor.ok .bf-fl'),title:'Choose a row',text:'Tap a glowing row. Tiles that do not fit fall to the floor.',pic:HPIC.racks},
  wall:{target:()=>bfQ('.bf-c.pick'),title:'Set a tile',text:'Tap a glowing wall space. It scores for the tiles it touches.',pic:HPIC.wall}
};
const HLP_RULES=[
  {phase:'pick',title:'Take one colour',text:'Pick a kiln and a colour. You take every tile of that colour. The rest slide to the middle.',pic:HPIC.kiln},
  {phase:'pick',title:'The middle',text:'Taking from the middle first also takes the Sun token. It costs floor points, but you start next round.',pic:HPIC.middle},
  {phase:'pick',title:'Round end',text:'When every kiln and the middle are empty, each full row sends one tile to your wall.',pic:HPIC.racks},
  {phase:'pick',title:'Game end',text:'A full wall row ends the game. Bonuses: row +2, column +7, all five of a colour +10.',pic:HPIC.bonus},
  {phase:'rack',title:'One colour per row',text:'Row 3 holds three tiles of a single colour. You cannot mix colours in a row.',pic:HPIC.oneColour},
  {phase:'rack',title:'Blocked rows',text:'A row is blocked if its wall row already has that colour. Blocked and full rows do not glow.',pic:HPIC.blocked},
  {phase:'rack',title:'The floor',text:'Extra tiles fall to the floor: −1, −1, −2, −2, −2, −3, −3 points. You can also drop tiles there.',pic:HPIC.floor},
  {phase:'rack',title:'Touching scores',text:'A set tile scores 1 alone, or its row line plus its column line when it touches others.',pic:HPIC.wall},
  {phase:'wall',title:'Pick the space',text:'On the grey wall choose any empty space in the row. No colour may repeat in a row or column.',pic:HPIC.wall},
  {phase:'wall',title:'Touching scores',text:'A tile scores 1 alone, or the length of its row line plus its column line if it touches others.',pic:HPIC.wall},
  {title:'The goal',text:'Fill your wall with tiles. Touching tiles score more. Most points wins.',pic:HPIC.goal}
];
// ---------------------------------------------------------------- which phase is the player in?
function hlpPhase(){try{if(!BF.on||BF.busy||UI.tut||UI.modal||BF.menu||BF.peek!=null||BF.boss||!G||G.over||isClient())return null;
  const hp=me();if(!hp)return null;
  if(G.phase==='wall')return G.wt&&G.wt.q&&G.wt.q.p===hp.i?'wall':null;
  if(G.phase==='offer')return UI.sel?'rack':'pick';return null}catch(e){return null}}
const capW=(t,n)=>{const w=String(t||'').replace(/\s+/g,' ').trim().split(' ');return w.length<=n?w.join(' '):''};
// the "why" (<= 15 words), from the same move the advice function picked
function hlpWhy(m,hp){try{
  if(m.act==='wall')return capW(`Column ${m.c+1} touches the most tiles: +${adjPts2(hp.wall,m.r,m.c)} now.`,15);
  const pv=preview(m,hp.i);let t;
  if(m.line===5)t='No better choice: every other move scores less this round.';
  else if(pv.full&&pv.pts!=null)t=`Fills row ${m.line+1}: about +${pv.pts} when the round ends${pv.pen?`, minus ${-pv.pen} breakage`:''}.`;
  else t=`Row ${m.line+1} grows to ${pv.cnt} of ${cap(m.line)}${pv.pen?`, costing ${-pv.pen} breakage`:' with nothing broken'}.`;
  return capW(t,15)}catch(e){return ''}}
const hlpTile=m=>{const a=m.src<0?G.ctr:G.fac[m.src];if(!a)return null;const k=a.findIndex(t=>t===m.c);return k<0?null:bfEl((m.src<0?'c':'f'+m.src)+'_'+k)};
// the plan for the bulb (and for the sweep): where the ghost finger goes
function hlpPlan(){if(!BF.on||BF.busy||UI.tut||UI.modal||!G||G.over||isClient())return null;const hp=me();if(!hp)return null;const m=bfAdvice(hp);if(!m)return null;
  if(m.act==='wall'){const q=G.wt&&G.wt.q;if(!q||m.r!==q.r)return null;return {m,hp,target:()=>bfSlot(`w${hp.i}_${q.r}_${m.c}`),from:null}}
  if(m.act!=='take'||G.phase!=='offer')return null;
  const sel=UI.sel;
  if(sel&&sel.src===m.src&&sel.c===m.c){if(!!sel.j!==!!m.j||!movesFor(sel).some(x=>x.line===m.line))return null;
    return {m,hp,target:()=>m.line<5?bfQ(`[data-bfrow="${m.line}"] .bf-rack`):bfQ('.bf-fl'),from:()=>hlpTile(m)}}
  return {m,hp,target:()=>hlpTile(m),from:null}}
function hlpSuggest(){const pl=hlpPlan();if(!pl)return null;const why=hlpWhy(pl.m,pl.hp);if(!why)return null;
  const e=pl.target();if(!e||!e.getBoundingClientRect().width)return null;return {why,key:JSON.stringify(pl.m),target:pl.target,from:pl.from}}
// ---------------------------------------------------------------- wiring
let _hlpInit=false;
function hlpInit(){if(_hlpInit||typeof GXH==='undefined')return;_hlpInit=true;
  GXH.init({game:'sunglaze',defaultOn:true,steps:HLP_STEPS,rules:HLP_RULES,avoid:'.bf-row.ok .bf-rack,.bf-floor.ok .bf-fl,.bf-c.pick,.bf-k.can,.bf-pool.can,.bf-t.adv'})}
function hlpAfter(){if(typeof GXH==='undefined')return;hlpInit();
  const b=document.getElementById('bulbbtn');if(b&&b!==hlpAfter._b){hlpAfter._b=b}
  if(b)GXH.bulb({el:b,suggest:hlpSuggest,rulesFor:hlpPhase});
  GXH.phase(hlpPhase())}
