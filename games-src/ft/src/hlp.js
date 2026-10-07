// ===================== help (gx-help kit): coach bubbles the first time, the lightbulb on demand =====================
// Bubbles: once per phase, short, pointing at the board. The bulb: the computer player's own move for you (hlpAdvice, the same one the ghost finger
// uses), a short why, and rules cards. Where the computer has no real answer (flute pulls, cutpurse hauls, aiming a power) the bulb shows rules only.
// ---------------------------------------------------------------- pictures for the rules cards (inline SVG in the game's colours)
const HP={
 meeple:c=>{const f=MCSS[c]||'#999';return '<svg viewBox="0 0 64 64"><ellipse cx="32" cy="57" rx="19" ry="4" fill="rgba(0,0,0,.18)"/><path d="M15 55Q32 20 49 55z" fill="'+f+'" stroke="#2b2418" stroke-width="3" stroke-linejoin="round"/><circle cx="32" cy="22" r="11" fill="'+f+'" stroke="#2b2418" stroke-width="3"/></svg>'},
 tile:(k,t)=>{const d=TILEDEF[k]||{};const b=d.blue?'#2d5f9f':'#b34a2a';return '<svg viewBox="0 0 64 64"><rect x="9" y="7" width="46" height="50" rx="7" fill="#ecc996" stroke="'+b+'" stroke-width="5"/><text x="32" y="40" text-anchor="middle" font-size="26">'+(TICON[k]||'')+'</text>'+(t?'<text x="32" y="53" text-anchor="middle" font-size="11" font-weight="800" fill="'+b+'">'+t+'</text>':'')+'</svg>'},
 coin:n=>'<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="22" fill="#e8c867" stroke="#8a6a1a" stroke-width="3.5"/><circle cx="32" cy="32" r="15" fill="none" stroke="#8a6a1a" stroke-width="2"/><text x="32" y="39" text-anchor="middle" font-size="20" font-weight="800" fill="#6b4a00" font-family="Georgia,serif">'+(n==null?'':n)+'</text></svg>',
 spot:n=>'<svg viewBox="0 0 64 64"><rect x="8" y="14" width="48" height="36" rx="9" fill="#fbf1de" stroke="#93391a" stroke-width="4"/><text x="32" y="38" text-anchor="middle" font-size="18" font-weight="800" fill="#93391a">'+n+'</text></svg>',
 camel:()=>'<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="23" fill="#fbf1de" stroke="#119e98" stroke-width="4"/><text x="32" y="43" text-anchor="middle" font-size="28">🐪</text></svg>',
 tent:()=>'<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="23" fill="#fbf1de" stroke="#d9772b" stroke-width="4"/><text x="32" y="43" text-anchor="middle" font-size="28">⛺</text></svg>',
 icon:(e,c)=>'<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="23" fill="#fbf1de" stroke="'+(c||'#93391a')+'" stroke-width="4"/><text x="32" y="43" text-anchor="middle" font-size="28">'+e+'</text></svg>',
 goods:r=>'<svg viewBox="0 0 64 64"><rect x="13" y="6" width="38" height="52" rx="6" fill="#fbf1d2" stroke="#8a6a1a" stroke-width="3.5"/><text x="32" y="40" text-anchor="middle" font-size="26">'+(RICON[r]||'')+'</text></svg>',
 djinn:()=>'<svg viewBox="0 0 24 24" fill="none" stroke="#93391a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'+ICONS.lamp+'</svg>',
 chip:t=>'<svg viewBox="0 0 64 64"><rect x="6" y="18" width="52" height="28" rx="14" fill="#93391a"/><text x="32" y="38" text-anchor="middle" font-size="14" font-weight="800" fill="#fff6e6">'+t+'</text></svg>',
 pts:n=>'<svg viewBox="0 0 64 64"><path d="M32 6l7.5 17 18.5 1.6-14 12 4.4 18.4L32 45l-16.4 10 4.4-18.4-14-12L24.5 23z" fill="#e8c867" stroke="#8a6a1a" stroke-width="3" stroke-linejoin="round"/><text x="32" y="36" text-anchor="middle" font-size="15" font-weight="800" fill="#6b4a00">'+(n==null?'':n)+'</text></svg>',
 pass:()=>'<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="22" fill="none" stroke="#93391a" stroke-width="5"/><path d="M16 48L48 16" stroke="#93391a" stroke-width="5"/></svg>',
 tap:()=>'<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="18" fill="rgba(147,57,26,.15)" stroke="#93391a" stroke-width="4"/><path d="M30 14v26l-6-5-4 4 14 14h14l4-20-8-2-4-4-4 1-2-4z" fill="#fff" stroke="#231a10" stroke-width="2.5" stroke-linejoin="round"/></svg>'
};
function hpics(items){return '<div class="gxh-pics">'+items.map(it=>it==='>'?'<span class="gxh-ar">&rarr;</span>':'<figure>'+(HP[it[0]]?HP[it[0]](it[1],it[3]):'')+(it[2]?'<figcaption>'+it[2]+'</figcaption>':'')+'</figure>').join('')+'</div>'}
// ---------------------------------------------------------------- where each bubble points
const hq=s=>()=>document.querySelector(s);
const hfirst=(...sels)=>()=>{for(const s of sels){const e=document.querySelector(s);if(e&&e.getBoundingClientRect().width)return e}return null};
const HLP_STEPS={
 bid:{target:hfirst('#acts .sp-b.glow'),title:'Buy turn order',text:'Tap a glowing spot. Dearer spots play earlier; free spots cost nothing.',pic:()=>HP.spot('3🪙')},
 lift:{target:hfirst('#grid .tile.glow'),title:'Lift a group',text:'Tap a glowing tile to pick up everyone standing on it.',pic:()=>hpics([['tile','small'],'>',['meeple','merchant']])},
 drop:{target:hfirst('#grid .tile.glow'),title:'Drop one by one',text:'Tap a glowing neighbour to drop one person there. The last must match a colour.',pic:()=>HP.meeple('builder')},
 collect:{target:hfirst('#acts .ab.go','#acts .ab'),title:'Use your tribe',text:'Tap Collect. The power chips below are optional extras.',pic:()=>HP.meeple('vizier')},
 mason:{target:hfirst('#acts .ab.go','#acts .ab'),title:'Choose your pay',text:'Masons earn coins for blue tiles around you. A Mystic adds one Mason.',pic:()=>HP.coin('+')},
 shadow:{target:hfirst('#grid .tile.glow','#seats .sch.glow','#acts .ab.go'),title:'Remove a person',text:'Tap a glowing tile or rival to remove someone there.',pic:()=>HP.meeple('assassin')},
 hamlet:{target:hfirst('#grid .tile.glow','#acts .ab.go'),title:'Build a palace',text:'Tap the glowing spot to build. A palace scores 5 points for the tile’s holder.',pic:()=>HP.icon('🏰')},
 oasis:{target:hfirst('#grid .tile.glow','#acts .ab.go'),title:'Plant a palm',text:'Tap the glowing spot to plant. A palm scores 3 points for the tile’s holder.',pic:()=>HP.icon('🌴')},
 shrine:{target:hfirst('#mkt .dcard.glow'),title:'Summon a djinn',text:'Tap a glowing djinn. It costs 2 Sages, or 1 Sage and 1 Mystic.',pic:()=>HP.djinn()},
 goods:{target:hfirst('#mkt .mcard.glow'),title:'Buy goods',text:'Tap a glowing goods card to buy it. The Grand Bazaar lets you tap two.',pic:()=>HP.goods('gold')},
 workshop:{target:hfirst('#acts .ab.go','#acts .ab'),title:'Commission an item',text:'Tap a pay button to take the top item, or tap Skip.',pic:()=>HP.icon('🔨')},
 sell:{target:hfirst('#mine .gchip','#acts .ab.go','#acts .ab'),title:'Sell or finish',text:'Tap goods of different kinds, then Sell for coins. Or tap End turn.',pic:()=>HP.coin('+')},
 power:{target:hfirst('#grid .tile.glow'),title:'Aim your power',text:'Tap a glowing tile to use the power there. Tap the chip again to cancel.',pic:()=>HP.djinn()},
 qClaim:{target:hfirst('#acts .ab'),title:'Camel or tent?',text:'Tap a button: a camel, or your tent for extra points from red tiles around.',pic:()=>HP.tent()},
 qItem:{target:hfirst('#acts .ab'),title:'Keep one item',text:'Tap the item you want to keep. The others are discarded.',pic:()=>HP.icon('🪄','#9a5bd0')},
 qDjinn:{target:hfirst('#acts .ab'),title:'Keep one djinn',text:'Tap the djinn you want to keep. The others are discarded.',pic:()=>HP.djinn()},
 qFlute:{target:hfirst('#grid .tile.glow','#acts .ab'),title:'Pull a person',text:'Tap a glowing neighbour to pull a person from it onto your tile.',pic:()=>HP.icon('🎶')},
 qKill:{target:hfirst('#grid .tile.glow','#acts .ab'),title:'Remove a person',text:'Tap a glowing tile to remove one person from it.',pic:()=>HP.meeple('assassin')},
 qThief:{target:hfirst('#acts .ab'),title:'Take your prize',text:'Tap the prize you want. Read each button first.',pic:()=>HP.icon('🦹')}
};
// ---------------------------------------------------------------- the rules cards (<= 20 words each, a picture each)
const HLP_RULES=[
 {title:'The goal',text:'Most points when the game ends wins. Points come from tiles, palaces, palms, djinns, goods, Advisors and coins.',pic:()=>hpics([['tile','oasis'],['djinn'],['coin',1],'>',['pts',null,'Winner']])},
 {title:'A turn in short',text:'Bid for turn order, lift a group, drop it tile by tile, then use your colour and tile.',pic:()=>hpics([['spot','1st'],'>',['meeple','merchant','Lift'],'>',['tile','small','Act']])},
 {phase:'bid',title:'Turn order',text:'Each round starts with a bid. Tap a glowing spot on the track to claim your place in line.',pic:()=>hpics([['spot','1st'],'>',['meeple','vizier','You']])},
 {phase:'bid',title:'Price of a spot',text:'Early spots cost coins, late ones are free. Coins are also worth one point each at the end.',pic:()=>hpics([['coin',8,'Early'],['coin',0,'Late']])},
 {phase:'bid',title:'Why go first?',text:'Playing earlier lets you grab tiles, goods and djinns before your rivals can.',pic:()=>hpics([['meeple','vizier','You'],'>',['tile','sacred','First']])},
 {phase:'lift',title:'Pick up a group',text:'Tap a tile with people on it. You lift all of them at once.',pic:()=>hpics([['tile','small','Tap'],'>',['meeple','merchant'],['meeple','builder']])},
 {phase:'lift',title:'Only some tiles glow',text:'A tile glows only if you can finish a legal move from it. Plan where your last person lands.',pic:()=>hpics([['tile','village','Glows'],['tile','lake','No']])},
 {phase:'lift',title:'The six colours',text:'Yellow and white are kept for points. Green buys goods, blue earns coins, red removes people, purple makes items.',pic:()=>hpics([['meeple','vizier'],['meeple','elder'],['meeple','merchant'],['meeple','builder'],['meeple','assassin']])},
 {phase:'drop',title:'Walk and drop',text:'Drop one person on each tile you pass, moving up, down, left or right. No stepping straight back.',pic:()=>hpics([['tile','oasis','1'],'>',['tile','small','2'],'>',['tile','village','3']])},
 {phase:'drop',title:'The last drop',text:'Your last person must land on a tile that already holds their colour. You then take all of that colour.',pic:()=>hpics([['meeple','merchant'],'>',['tile','large','Same colour']])},
 {phase:'drop',title:'Try another route',text:'Use the undo button to put people back and try again before you finish.',pic:()=>hpics([['meeple','builder'],'>',['tap']])},
 {phase:'collect',title:'Each colour acts',text:'Advisors and Sages are kept. Traders fetch goods. Masons earn coins. Shadows remove people. Crafters make items.',pic:()=>hpics([['meeple','vizier'],['meeple','merchant'],['meeple','builder'],['meeple','assassin']])},
 {phase:'collect',title:'Then the tile',text:'After the tribe, the tile you ended on has its own action: build, plant, summon or buy.',pic:()=>hpics([['meeple','merchant'],'>',['tile','small']])},
 {phase:'collect',title:'Optional powers',text:'Djinn and item chips are optional. Tap one, then a glowing target if it asks for one.',pic:()=>hpics([['chip','✨ Power'],'>',['tap']])},
 {phase:'mason',title:'Blue tiles pay',text:'Coins equal your Masons times the blue tiles in the 3 by 3 square around you.',pic:()=>hpics([['meeple','builder','×'],['tile','sacred','blue'],'>',['coin','+']])},
 {phase:'mason',title:'Mystic Mason',text:'Spending a Mystic card adds one Mason to the count, but the card is gone.',pic:()=>hpics([['goods','fakir'],'>',['meeple','builder','+1']])},
 {phase:'shadow',title:'Reach',text:'A Shadow removes one person up to its count of steps away, or a rival’s Advisor or Sage.',pic:()=>hpics([['meeple','assassin'],'>',['meeple','vizier','Rival']])},
 {phase:'shadow',title:'Empty tiles',text:'If a tile empties, you claim it with a camel, so a removal can win you land.',pic:()=>hpics([['tile','small','Empty'],'>',['camel']])},
 {phase:'shadow',title:'Mystic reach',text:'Each Mystic you spend adds one step of reach.',pic:()=>hpics([['goods','fakir'],'>',['meeple','assassin','+1 step']])},
 {phase:'hamlet',title:'Palace',text:'A palace scores 5 points for whoever holds the tile. Placing it is required.',pic:()=>hpics([['tile','village'],'>',['pts',5]])},
 {phase:'hamlet',title:'Holding a tile',text:'A camel marks who holds a tile. Tile value, palaces and palms all score for the holder.',pic:()=>hpics([['camel',null,'Holder'],'>',['pts','+']])},
 {phase:'hamlet',title:'Next to the lake',text:'Palaces and palms on tiles touching the Great Lake score double.',pic:()=>hpics([['tile','lake'],['tile','village','×2']])},
 {phase:'oasis',title:'Palm',text:'A palm scores 3 points for whoever holds the tile. Planting it is required.',pic:()=>hpics([['tile','oasis'],'>',['pts',3]])},
 {phase:'oasis',title:'Holding a tile',text:'A camel marks who holds a tile. Tile value, palaces and palms all score for the holder.',pic:()=>hpics([['camel',null,'Holder'],'>',['pts','+']])},
 {phase:'oasis',title:'Next to the lake',text:'Palaces and palms on tiles touching the Great Lake score double.',pic:()=>hpics([['tile','lake'],['tile','oasis','×2']])},
 {phase:'shrine',title:'Summon a djinn',text:'Pay 2 Sages, or 1 Sage and 1 Mystic, to take a face-up djinn. Spent Sages stop scoring.',pic:()=>hpics([['meeple','elder','×2'],'>',['djinn']])},
 {phase:'shrine',title:'What a djinn gives',text:'Each djinn is worth points and has a power, either always on or used by paying Sages.',pic:()=>hpics([['djinn'],'>',['pts','+'],['chip','Power']])},
 {phase:'shrine',title:'Not worth it?',text:'You may skip. Tap Skip if no djinn is worth the Sages you would spend.',pic:()=>hpics([['pass',null,'Skip']])},
 {phase:'goods',title:'Goods make sets',text:'Different kinds of goods make sets: 1, 3, 7, 13, 21 points for 1 to 5 kinds, and more beyond.',pic:()=>hpics([['goods','gold'],['goods','silk'],['goods','spice'],'>',['pts',7]])},
 {phase:'goods',title:'What it costs',text:'Stall: 3 coins for one of the first 3. Bazaar: 6 coins for two. Exchange: 4 coins for any.',pic:()=>hpics([['tile','small','3'],['tile','large','6'],['tile','exchange','4']])},
 {phase:'goods',title:'Mystic cards',text:'Mystic cards boost Masons and Shadows and pay for djinns. They never join a set.',pic:()=>hpics([['goods','fakir']])},
 {phase:'workshop',title:'Items',text:'Pay 1 Crafter or 2 Mystics to take the top item. Items give points or one-off powers.',pic:()=>hpics([['meeple','artisan','×1'],'>',['icon','🪄',null,'#9a5bd0']])},
 {phase:'workshop',title:'Using items',text:'Tap an item chip to use it. You may use one item each turn.',pic:()=>hpics([['chip','🪄 Item'],'>',['tap']])},
 {phase:'sell',title:'Sell a set',text:'Tap goods of different kinds to sell them as a set. Bigger sets pay more coins.',pic:()=>hpics([['goods','gold'],['goods','silk'],'>',['coin',3]])},
 {phase:'sell',title:'Why sell?',text:'Coins buy turn order and bazaar goods, and each coin is worth one point at the end.',pic:()=>hpics([['coin','+'],'>',['spot','1st']])},
 {phase:'sell',title:'Or keep them',text:'Unsold goods still score as sets at the end. Tap End turn when you are done.',pic:()=>hpics([['goods','gold'],'>',['pts','+']])},
 {phase:'power',title:'Aiming a power',text:'You tapped a power chip. Now tap a glowing tile to choose where it works.',pic:()=>hpics([['chip','✨ Power'],'>',['tile','village','Aim']])},
 {phase:'power',title:'Changed your mind?',text:'Tap the same chip again to cancel without using the power.',pic:()=>hpics([['chip','✨ Power'],'>',['pass',null,'Cancel']])},
 {phase:'power',title:'What it costs',text:'Some powers cost Sages or Mystics. The chip shows the price.',pic:()=>hpics([['meeple','elder','×1'],['goods','fakir','×1']])},
 {phase:'qClaim',title:'Camel',text:'A camel marks the tile as yours. Its value, palaces and palms score for you.',pic:()=>hpics([['camel'],'>',['pts','+']])},
 {phase:'qClaim',title:'Your tent',text:'The tent scores its tile plus 1 for each red tile around it. You have only one.',pic:()=>hpics([['tent'],'>',['tile','village','+red']])},
 {phase:'qItem',title:'Items',text:'Precious items score points at the end. Magic items give a one-off power.',pic:()=>hpics([['icon','💍'],['icon','🪄',null,'#9a5bd0']])},
 {phase:'qItem',title:'Only one',text:'You keep one item and the rest are discarded, so pick what helps you most.',pic:()=>hpics([['icon','🪄',null,'#9a5bd0'],'>',['pass',null,'Others']])},
 {phase:'qDjinn',title:'Djinn cards',text:'Each djinn is worth points and has a power. Read them before you choose.',pic:()=>hpics([['djinn'],'>',['pts','+']])},
 {phase:'qDjinn',title:'Keep one',text:'You keep one of the djinns shown. The rest are discarded.',pic:()=>hpics([['djinn'],'>',['pass',null,'Others']])},
 {phase:'qFlute',title:'The Reed Pipe',text:'It pulls people from neighbouring tiles onto your tile, one at a time, up to five.',pic:()=>hpics([['tile','small'],'>',['meeple','merchant'],['tile','village']])},
 {phase:'qFlute',title:'Stop early',text:'You may stop pulling at any time. Tap the Done button.',pic:()=>hpics([['pass',null,'Done']])},
 {phase:'qKill',title:'The Ember Blade',text:'It removes any 2 people from the board. You do this one person at a time.',pic:()=>hpics([['meeple','assassin','×2']])},
 {phase:'qKill',title:'Empty tiles',text:'You claim any tile this empties with a camel.',pic:()=>hpics([['tile','small','Empty'],'>',['camel']])},
 {phase:'qThief',title:'Cutpurse haul',text:'Your Cutpurse earned a prize. Tap the one you want to take.',pic:()=>hpics([['icon','🦹'],'>',['pts','+']])},
 {phase:'qThief',title:'Read each button',text:'Each button says what you receive. You get only one.',pic:()=>hpics([['chip','Prize'],'>',['tap']])}
];
// ---------------------------------------------------------------- phases
function hlpBusy(){return !G||G.over||UI.modal||GX.open||UI.chz||UI.autoOn||!me()}
// the phase the player is deciding in (null when there is nothing to decide on the board)
function hlpPhase(){try{if(hlpBusy())return null;const hp=me();
  if(G.q)return {claim:'qClaim',item:'qItem',djinn:'qDjinn',flute:'qFlute',kill:'qKill',thief:'qThief'}[G.q.kind]||null;
  if(UI.pendDj||UI.pendItem)return 'power';
  if(G.phase==='bid')return 'bid';
  switch(G.step){
   case 'move':return G.move?'drop':'lift';
   case 'tribe':{const c=G.act.color;if(c==='assassin')return 'shadow';if(c==='builder'&&validMoves(hp.i).filter(m=>m.act==='tribe').length>1)return 'mason';return 'collect'}
   case 'tile':{if(UI.pickMk.length)return 'goods';if(UI.pickDj.length)return 'shrine';const k=G.board[G.act.tile].k;
    if(k==='village')return 'hamlet';if(k==='oasis')return 'oasis';
    if(k==='workshop'&&validMoves(hp.i).some(m=>m.act==='tile'&&m.work))return 'workshop';return null}
   case 'sell':return 'sell'}
  return null}catch(e){return null}}
// ---------------------------------------------------------------- the computer player's advice for the human (the one function the bulb and the ghost finger both use)
const HPL={k:'',m:null,plan:null};
function hlpKey(){return [G.seed,G.logN,G.phase,G.step,G.q?G.q.kind:'',G.move?G.move.path.join('-'):'',G.cur,UI.pendDj?1:0,UI.pendItem?1:0].join('|')}
function hlpAdvice(){if(!G||G.over)return null;const hp=me();if(!hp)return null;const k=hlpKey();if(HPL.k===k)return HPL.m;
  let m=null;const lv=hp.lv,keep=AIPLAN;hp.lv='hard';
  try{
   if(UI.pendDj||UI.pendItem)m=null;
   else if(G.q){if(['claim','item','djinn'].includes(G.q.kind))m=aiMove(hp.i)}
   else if(G.phase==='turn'&&G.step==='move'&&G.move){const pl=HPL.plan;   // follow the plan made at the lift, only while the player is on it
    if(pl&&pl.seed===G.seed&&pl.turn===G.turn&&G.move.path.every((x,i)=>x===pl.o.path[i])){AIPLAN=pl.o;m=aiMove(hp.i)}}
   else{m=aiMove(hp.i);if(G.phase==='turn'&&G.step==='move'&&!G.move&&AIPLAN&&m&&m.act==='start')HPL.plan={o:AIPLAN,seed:G.seed,turn:G.turn}}
  }catch(e){m=null}
  hp.lv=lv;AIPLAN=keep;
  if(m&&!validMoves(hp.i).some(x=>same(x,m)))m=null;
  HPL.k=k;HPL.m=m;return m}
function hlpEl(m){if(!m)return null;const mv=s=>[...document.querySelectorAll('[data-mv]')].find(b=>b.dataset.mv===s)||null;
  if(m.act==='djinn')return [...document.querySelectorAll('[data-pw]')].find(b=>b.dataset.pw===JSON.stringify({k:m.k,pay:m.pay}))||mv(JSON.stringify(m));
  if(m.act==='item'){if(m.k==='flute'||m.k==='talisman')return document.querySelector('[data-pi="'+m.k+'"]');return mv(JSON.stringify(m))}
  if(m.act==='thief')return mv(JSON.stringify(m));
  return fingerEl(m)}
// why (<= 15 words), from what the move really does
function capW(t,n){const w=String(t||'').replace(/\s+/g,' ').trim().split(' ');return w.length<=n?w.join(' '):''}
const HTAIL={vizier:'Advisors score points.',elder:'Sages summon djinns.',merchant:'Goods score as sets.',builder:'Masons earn coins.',assassin:'Shadows remove rivals.',artisan:'Crafters make items.'};
function hlpWhy(m,hp){let t='';
  switch(m.act){
   case 'bid':{const c=G.track[m.spot].cost;t=m.fk?'A Mystic makes this spot cost '+bidPrice(hp,m.spot,m.fk)+' coins.':c?c+' coins buys an earlier turn.':'A free spot keeps your coins for later.';break}
   case 'start':{const o=HPL.plan&&HPL.plan.o;if(o&&o.s===m.tile){const n=o.n;t='Ends on the '+TSHORT[G.board[o.e].k]+', taking '+n+' '+(n>1?MPLUR[o.c]:MNAME[o.c])+'. '+HTAIL[o.c]}break}
   case 'step':t=G.move.hand.length===1?'Last drop: land on its colour to finish.':'This follows the best route to a good finish.';break;
   case 'tribe':{if(m.none){t='No target in range: carry on.';break}const k=m.kill;
     if(k){t=k.pl!=null?'Removes a '+MNAME[k.c]+' from '+P(k.pl).nm+'.':'Clears people off this tile.';break}
     const c=G.act.color;t=c==='builder'?'Masons earn coins from blue tiles.':'Collect your '+MPLUR[c]+'. '+HTAIL[c];break}
   case 'tile':{const a=G.board[G.act.tile];
     if(m.skip)t='Nothing here is worth the price.';
     else if(m.place!=null)t=a.k==='village'?'A palace scores 5 points for the tile’s holder.':'A palm scores 3 points for the tile’s holder.';
     else if(m.dj)t='Summon '+DJ[m.dj].n+': worth '+DJ[m.dj].vp+' points.';
     else if(m.take)t=m.take.length>1?'These two goods grow your sets.':'This good grows your goods sets.';
     else if(m.work)t='Commission an item for a one-off power.';break}
   case 'djinn':t='Use '+DJ[m.k].n+' now while it helps.';break;
   case 'item':t='Use your '+ITEMS[m.k].n+' now.';break;
   case 'thief':t='Use your Cutpurse now.';break;
   case 'end':t=hp.res.length?'Unsold goods still score as sets at the end.':'Nothing to sell: end your turn.';break;
   case 'q':{const q=G.q;if(q.kind==='claim')t=m.i===1?'The tent adds points for each red tile around.':'A camel is enough here.';
     else if(q.kind==='item')t='Keep the item worth most to you.';
     else if(q.kind==='djinn'&&q.cards&&DJ[q.cards[m.i]])t='Keep '+DJ[q.cards[m.i]].n+': worth '+DJ[q.cards[m.i]].vp+' points.';break}}
  return capW(t,15)}
function hlpSuggest(){if(hlpBusy())return null;const hp=me();const m=hlpAdvice();if(!m)return null;
  const why=hlpWhy(m,hp);if(!why||!hlpEl(m))return null;
  return {why,key:JSON.stringify(m),target:()=>hlpEl(m),from:null}}
// ---------------------------------------------------------------- wiring
let _hlpInit=false;
function hlpInit(){if(_hlpInit||typeof GXH==='undefined')return;_hlpInit=true;
  GXH.init({game:'sands-of-qamar',defaultOn:true,steps:HLP_STEPS,rules:HLP_RULES,avoid:'.glow,#acts .ab,#acts .sp-b,#mine .gchip,#finger'});
  GXH.bulb({el:'#bulbbtn',suggest:hlpSuggest,rulesFor:hlpPhase});
  const hm=document.getElementById('gxhmenu');if(hm)hm.innerHTML=GXH.settingsHTML({rowClass:'',btnClass:'btn sm'});
  // a tap that lands on a bubble only dismisses it (the board under it must not act)
  let sw=0;document.addEventListener('pointerdown',e=>{sw=0;const b=document.querySelector('.gxh-bub.on');if(!b||(e.target.closest&&e.target.closest('.gxh-link')))return;const r=b.getBoundingClientRect();if(e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom)sw=Date.now()},true);
  document.addEventListener('click',e=>{if(sw&&Date.now()-sw<800){sw=0;e.stopImmediatePropagation();e.preventDefault()}},true);
  // the ghost finger comes back after a bubble or the bulb is dismissed
  document.addEventListener('pointerup',()=>setTimeout(()=>{if(typeof placeFinger==='function'&&G)placeFinger()},80),true)}
function hlpAfter(){hlpInit();if(typeof GXH==='undefined')return;const ph=hlpPhase();if(ph==='lift')hlpAdvice();   // the plan made at the lift is what the drops follow
  GXH.phase(ph)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hlpInit);else hlpInit();
