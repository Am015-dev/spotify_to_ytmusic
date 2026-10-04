// ---------- card text: every effect is written out from its ops, so the text always matches what the game does ----------
const WHO={all:'everyone',first:'the first player',actor:'the acting character',sp:'whoever has that injury',choose:'one castaway'};
const TERRN=t=>({beach:'beach',river:'river',plains:'plains',hills:'hills',mountains:'mountains'}[t]||t);
const TOKN={adv:'a "?" marker (the next time anyone does it, it also triggers an adventure card)',reroll:'a reroll marker (the next success there must be rolled again)',time:'a “slow going” marker (the next time, it needs 1 more pawn)',wood:'a +1 wood marker (the next build that uses wood costs 1 more)',black:'a “wasted effort” marker (the next time, it gives nothing)',beast:'a danger marker (1 wound to whoever goes there without a weapon)'};
function whoN(w){return typeof w==='number'?(G&&G.chars[w]?G.chars[w].nm:'a castaway'):WHO[w]||w}
function opText(op){const [k,a,b,c]=op;const pl=(n,s)=>`${n} ${s}${n===1?'':'s'}`;
  switch(k){
  case 'res':return `gain ${a==='pfood'?pl(b,'dry food').replace('dry foods','dry food'):b+' '+(RNAME[a]||a)}`;case 'resPer':return `gain 1 ${RNAME[a]} per castaway`;
  case 'lose':return `discard ${b} ${RNAME[a]}${c?' if you can':''}`;case 'loseAllRes':return 'discard all your resources';
  case 'wound':return `${whoN(a)} ${a==='all'?'take':'takes'} ${pl(b,'wound')}`;case 'det':return `${whoN(a)} ${a==='all'?'gain':'gains'} ${b} ✊ determination`;
  case 'ldet':return `${whoN(a)} ${a==='all'?'lose':'loses'} ${b} determination`;case 'ldetAll':return `${whoN(a)} ${a==='all'?'lose':'loses'} all determination`;
  case 'heal':return `${whoN(a)} ${a==='all'?'heal':'heals'} ${pl(b,'wound')}`;case 'morale':return `morale ${a>0?'+':''}${a}`;
  case 'roof':return `roof ${a>0?'+':''}${a}${b==='shelter'?' (if you have a shelter)':''}`;case 'pal':return `palisade ${a>0?'+':''}${a}${b==='shelter'?' (if you have a shelter)':''}`;
  case 'weapon':return `weapon ${a>0?'+':''}${a}${b?' if you can':''}`;case 'weaponTo':return `weapon drops to ${a}`;
  case 'roofOrPal':return `roof or palisade ${a>0?'+':''}${a}${b==='shelter'?' (with a shelter)':''}`;case 'halfRoofOrPal':return 'lose half the roof or half the palisade';case 'halfRoof':return 'lose half the roof';
  case 'wx':return {rain:'add a rain cloud to this round’s weather',snow:'add a snow cloud to this round’s weather',storm:'add a storm to this round’s weather',animals:'add the hungry-animals die to this round’s weather'}[a];
  case 'actTok':return `put ${TOKN[b]||b} on the ${TNAME[a].toLowerCase()} action`;case 'actTokOff':return `remove a marker from the ${TNAME[a].toLowerCase()} action`;
  case 'beastStr':return 'the next beast you hunt has +1 strength';case 'nightFood':return 'tonight each castaway needs 1 more food';case 'nightWound':return 'everyone takes 1 wound tonight';
  case 'prod':return {nofood:'no food from production',nowood:'no wood from production',half:'production is halved',plusWoodNoFood:'production gives 1 more wood but no food',minusFood:'production gives 1 less food',skip:'no production this round'}[a]||'production changes';
  case 'noMix':return 'this round no action may mix pawns of different characters';case 'passFirst':return 'the first-player marker passes on';
  case 'onlyActs':return `${whoN(a)} may only ${b.map(x=>TNAME[x].toLowerCase()).join(' or ')} this round`;case 'pawnMinus':return `${whoN(a)} has only 1 pawn this round`;case 'pawnMinusNext':return `${whoN(a)} has only 1 pawn next round`;
  case 'noSkills':return `${whoN(a)} can’t use skills this round`;case 'discardInv':return `discard the top ${pl(a,'invention card')} of the invention deck`;case 'drawInv':return `add ${pl(a,'invention')} from the deck to the board`;
  case 'pickInv':return 'choose an invention from the deck and add it to the board';case 'loseItem':return `lose ${pl(a,'item')}${b?' if you have one':''}`;case 'itemsAway':return 'items can’t be used this round';
  case 'markItems':return 'mark 2 of your items (a later card may take them)';case 'loseMarked':return 'lose the marked items';case 'buildFree':return `make ${a.map(x=>(INVENTIONS[x]||{}).n||x).join(' or ')} for free`;
  case 'mystery':{const p=[];for(const t of ['treasure','trap','creature'])if(a[t])p.push(`${a[t]} ${t}${a[t]>1?'s':''}`);if(a.monOrTrap)p.push(`${a.monOrTrap} trap or creature`);return a.until?'draw mystery cards until you find a treasure':`draw ${a.draw?a.draw+' ':''}mystery card${a.draw===1?'':'s'}${p.length?': only '+p.join(', ')+' take'+(p.length===1&&/^1 /.test(p[0])?'s':'')+' effect (the others go back)':''}`}
  case 'disc':return `draw ${pl(a,'discovery token')}`;case 'startItem':return 'draw a new starting item';
  case 'fight':return `${b==='first'?'the first player fights':'fight'} a beast of strength ${a.str}${a.wl?`, weapon −${a.wl}`:''}${a.pal?`, palisade −${a.pal}`:''}${a.food||a.fur?` (it gives ${[a.food?a.food+' food':'',a.fur?a.fur+' fur':''].filter(Boolean).join(' and ')})`:''}`;
  case 'huntDiscard':return `discard the top ${pl(a,'card')} of the hunting deck`;case 'huntTopBottom':return 'move the top hunting card to the bottom';case 'huntPeek':return 'look at the top hunting card';
  case 'huntStrongest3':return 'the strongest of 3 beast cards goes on top of the hunting deck';case 'huntFightTop':return 'the first player fights the top beast of the hunting deck';case 'huntLootTop':return 'take the food and fur of the top hunting beast without a fight';
  case 'beastWaits':return 'a beast waits by the camp: fight it at the start of next round';case 'beastWaitToHunt':return 'the waiting beast goes into the hunting deck';
  case 'exhaustClosest':return `the ${a==='foodsrc'?'food':a} source closest to camp is used up`;case 'unexhaust':return a==='any'?'remove 1 black marker from the island':`a used-up ${a==='foodsrc'?'food':a} source recovers`;
  case 'exhaustAdj':return `${pl(a,'source')} next to camp ${a===1?'is':'are'} used up`;case 'exhaustTileAdj':return 'every source on one tile next to camp is used up';case 'unexhaustTile':return 'the used-up tile recovers';
  case 'coverTerr':return `one ${TERRN(a)} tile can’t be used (its terrain counts as unexplored)`;case 'uncoverTerr':return `the ${TERRN(a)} is usable again`;
  case 'inaccessAdj':return 'a tile next to camp is cut off';case 'reaccess':return 'the cut-off tile is reachable again';case 'moveCamp':return 'the camp must move to a neighbouring tile';
  case 'restoreMove':return 'win back roof and palisade lost by the move';case 'flushThreats':return 'both threat cards leave: their threat effects happen';case 'again':return 'resolve the effect again';
  case 'book':return 'resolve the scenario’s book effect';case 'pick':return 'choose: '+b.join(' / ');case 'ifItem':return `if you have ${(INVENTIONS[a]||{}).n||a}: ${opsText(b)||'nothing'}; otherwise ${opsText(c)||'nothing'}`;
  case 'ifWeapon':return `with weapon ${a}+: ${opsText(b)||'nothing'}; otherwise ${opsText(c)||'nothing'}`;
  case 'spWound':return `the acting character gets a ${a} injury (it matters later)`;case 'spw':return `anyone with a ${a} injury: ${opsText(b)}`;
  case 'tileTok':return `put a ${{time:'slow-going (+1 pawn)',beast:'danger',food:'+1 food'}[a]} marker on that tile`;case 'inaccessTok':return 'the tile with that marker is cut off';case 'exhaustTok':return 'the tile with that marker is picked clean';
  case 'exhaustHere':return 'that source is used up';case 'exhaustHereAny':return 'a source on that tile is ruined';case 'coverTerrHere':return 'that tile’s terrain can’t be used for now';case 'exhaustCampFood':return 'the camp’s food source is ruined';
  case 'gatherExtra':return 'gain 1 more of what you gathered';case 'extraBuild':return 'you may take one more build action (it rolls the dice)';case 'costTok':return `building ${a==='pal'?'the palisade':a==='weapon'?'the weapon':'the '+a} costs 1 more wood`;
  case 'nightOut':return 'the acting character spends the night away from camp';case 'keep':return `keep this card (${ITEMLIKE[a]&&ITEMLIKE[a].uses>1?ITEMLIKE[a].uses+' uses':'one use'})`;case 'keepPawn':return `gain a helper pawn for ${a==='any'?'any action':TNAME[a].toLowerCase()}${b&&b<99?' ('+b+' use)':''}`;
  case 'coverArrows':return `cover ${a} morale-down points on the life tracks`;case 'peekTiles':return 'look at the top 3 island tiles';case 'campTok':return `the camp tile makes 1 more ${a}`;
  case 'charReroll':return 'the acting character must reroll their next success';case 'charRerollOff':return 'remove the reroll curse';case 'charRerollNext':return 'next round the acting character must reroll a success';
  case 'strangeDisease':return 'a fever: 2 wounds per castaway land tonight';case 'loseDrawnTreasures':return 'treasures drawn now are lost';case 'reshuffleSelf':return 'shuffle this card back';
  case 'pileWood':return `put ${a} wood straight onto the signal pile`;case 'unfog':return `remove up to ${a} fog`;
  default:return k}}
function opsText(list){if(!list||!list.length)return '';const t=list.map(opText).join('; ');return t.charAt(0).toUpperCase()+t.slice(1)+'.'}
function reqText(r){if(!r)return '';const one=o=>[...(o.items||[]).map(x=>(INVENTIONS[x]||{}).n||x),o.weapon?`weapon ${o.weapon}`:'',...Object.entries(o.res||{}).map(([k,n])=>`${n} ${RNAME[k]}`)].filter(Boolean).join(' + ');return r.alt?r.alt.map(one).join(' or '):one(r)}
// full text of any card, for the card list and tooltips
function cardText(c){const o=[];
  if(c.th){o.push(`<b>Event:</b> ${opsText(c.ev)||'no immediate effect.'}`);const th=c.th;o.push(`<b>Threat action — ${th.n}</b> (${th.pw==='1-2'?'1 or 2 pawns':th.pw+' pawn'+(th.pw>1?'s':'')}${th.req&&reqText(th.req)?', needs '+reqText(th.req):''}): ${th.rw1?`1 pawn: ${opsText(th.rw1)} 2 pawns: ${opsText(th.rw2)}`:opsText(th.rw)||'discard the card.'}`);o.push(`<b>If ignored:</b> ${opsText(c.te)||'nothing happens.'}`);return o.join('<br>')}
  if(c.deck){if(c.decide)o.push(`<b>Choose:</b> ${opsText(c.decide[0])||'leave it'} <i>or</i> ${opsText(c.decide[1])||'keep it'} and shuffle the card into the event deck.`);else o.push(opsText(c.ops)||'No effect now.');if(c.shuffle&&!c.decide)o.push('Shuffle this card into the event deck.');if(c.ev)o.push(`<b>Later, as an event — ${c.ev.n}:</b> ${opsText(c.ev.ops)}`);return o.join('<br>')}
  if(c.type){o.push(opsText(c.ops)||'No effect.');if(c.keep)o.push('Keep this card.');if(c.stop)o.push('Stop drawing mystery cards.');if(c.shuffle)o.push('Shuffle it into the event deck.');if(c.ev)o.push(`<b>Later, as an event — ${c.ev.n}:</b> ${opsText(c.ev.ops)}`);return o.join('<br>')}
  return ''}
