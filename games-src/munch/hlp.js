// ===================== help (gx-help kit): coach bubbles the first time, the lightbulb on demand =====================
// Bubbles: once per phase, short, pointing at the board. The bulb: the advisor's own move (coach(me).rec, the move the old glowing suggestion used)
// + a short why + the rules cards. Nothing here ever plays a card or changes the game.
// ---------------------------------------------------------------- pictures (inline SVG in the game's colours)
const HP={
 card:(n,c)=>'<svg viewBox="0 0 64 64"><rect x="14" y="5" width="36" height="54" rx="5" fill="#fbf1d2" stroke="'+(c||'#7a1f31')+'" stroke-width="3"/><text x="32" y="40" text-anchor="middle" font-size="26" font-weight="800" fill="'+(c||'#7a1f31')+'" font-family="Georgia,serif">'+(n==null?'':n)+'</text></svg>',
 back:()=>'<svg viewBox="0 0 64 64"><rect x="14" y="5" width="36" height="54" rx="5" fill="#7a1f31" stroke="#c99a35" stroke-width="3"/><path d="M32 16l11 16-11 16-11-16z" fill="none" stroke="#e8c867" stroke-width="3"/></svg>',
 door:()=>'<svg viewBox="0 0 64 64"><path d="M14 58V22Q14 6 32 6t18 16v36z" fill="#8a5a2a" stroke="#4a2f14" stroke-width="3" stroke-linejoin="round"/><path d="M32 8v50M14 32h36" stroke="#4a2f14" stroke-width="2"/><circle cx="42" cy="38" r="3.2" fill="#e8c867" stroke="#8a6a1a" stroke-width="1.5"/></svg>',
 boot:()=>'<svg viewBox="0 0 64 64"><path d="M20 8h16v22l16 8q6 3 6 10v8H16V8z" fill="#6b4a2a" stroke="#33220f" stroke-width="3" stroke-linejoin="round"/><path d="M16 50h42" stroke="#33220f" stroke-width="3"/></svg>',
 swords:()=>'<svg viewBox="0 0 64 64"><path d="M12 12l36 36M52 12L16 48" stroke="#55412a" stroke-width="5" stroke-linecap="round"/><path d="M10 52l8-8M54 52l-8-8" stroke="#c99a35" stroke-width="6" stroke-linecap="round"/><path d="M20 38l6 6M44 38l-6 6" stroke="#c99a35" stroke-width="4" stroke-linecap="round"/></svg>',
 monster:(n)=>'<svg viewBox="0 0 64 64"><path d="M10 54V30Q10 10 32 10t22 20v24l-8-6-7 6-7-6-7 6-7-6z" fill="#5fa04a" stroke="#27471c" stroke-width="3" stroke-linejoin="round"/><circle cx="24" cy="30" r="5" fill="#fff" stroke="#27471c" stroke-width="2"/><circle cx="40" cy="30" r="5" fill="#fff" stroke="#27471c" stroke-width="2"/><circle cx="25" cy="31" r="2" fill="#27471c"/><circle cx="41" cy="31" r="2" fill="#27471c"/><path d="M22 42h20" stroke="#27471c" stroke-width="3"/><path d="M14 14l5 8M50 14l-5 8" stroke="#27471c" stroke-width="3" stroke-linecap="round"/>'+(n!=null?'<text x="32" y="60" text-anchor="middle" font-size="14" font-weight="800" fill="#7a1f31" font-family="Georgia,serif">'+n+'</text>':'')+'</svg>',
 hero:(n)=>'<svg viewBox="0 0 64 64"><circle cx="32" cy="18" r="10" fill="#f0c9a0" stroke="#7a1f31" stroke-width="3"/><path d="M12 58Q14 32 32 32t20 26z" fill="#2f7a9a" stroke="#12384a" stroke-width="3" stroke-linejoin="round"/>'+(n!=null?'<text x="32" y="54" text-anchor="middle" font-size="16" font-weight="800" fill="#fff" font-family="Georgia,serif">'+n+'</text>':'')+'</svg>',
 level:()=>'<svg viewBox="0 0 64 64"><path d="M32 6l7.5 17 18.5 1.6-14 12 4.4 18.4L32 45l-16.4 10 4.4-18.4-14-12L24.5 23z" fill="#e8c867" stroke="#8a6a1a" stroke-width="3" stroke-linejoin="round"/><text x="32" y="36" text-anchor="middle" font-size="16" font-weight="800" fill="#7a1f31" font-family="Georgia,serif">+1</text></svg>',
 coin:(t)=>'<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="22" fill="#e8c867" stroke="#8a6a1a" stroke-width="3"/>'+(t?'<text x="32" y="38" text-anchor="middle" font-size="16" font-weight="800" fill="#7a1f31" font-family="Georgia,serif">'+t+'</text>':'<circle cx="32" cy="32" r="13" fill="none" stroke="#8a6a1a" stroke-width="2.5"/>')+'</svg>',
 chest:()=>'<svg viewBox="0 0 64 64"><rect x="8" y="26" width="48" height="28" rx="4" fill="#8a5a2a" stroke="#4a2f14" stroke-width="3"/><path d="M8 34Q8 14 32 14t24 20z" fill="#a8742f" stroke="#4a2f14" stroke-width="3"/><rect x="28" y="30" width="8" height="10" rx="2" fill="#e8c867" stroke="#8a6a1a" stroke-width="2"/></svg>',
 curse:()=>'<svg viewBox="0 0 64 64"><path d="M18 44Q6 44 8 33t14-8Q24 12 38 14t14 14q10 2 6 12t-14 4z" fill="#8e6bbf" stroke="#3d2466" stroke-width="3" stroke-linejoin="round"/><path d="M26 30q6 4 12 0M28 38q4 3 8 0" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/></svg>',
 ward:()=>'<svg viewBox="0 0 64 64"><path d="M32 6l20 8v16q0 18-20 26Q12 48 12 30V14z" fill="#9fc5e8" stroke="#1f4e79" stroke-width="3" stroke-linejoin="round"/><path d="M22 30l8 8 14-16" stroke="#1f4e79" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 help:()=>'<svg viewBox="0 0 64 64"><circle cx="20" cy="20" r="8" fill="#f0c9a0" stroke="#7a1f31" stroke-width="3"/><circle cx="44" cy="20" r="8" fill="#f0c9a0" stroke="#7a1f31" stroke-width="3"/><path d="M6 56Q8 32 20 32t14 24zM30 56Q32 32 44 32t14 24z" fill="#2f9e44" stroke="#14501f" stroke-width="3" stroke-linejoin="round"/></svg>',
 run:()=>'<svg viewBox="0 0 64 64"><circle cx="38" cy="12" r="7" fill="#f0c9a0" stroke="#7a1f31" stroke-width="3"/><path d="M36 22l-10 14 10 6-4 14M26 36l-12-4M38 24l12 8" stroke="#7a1f31" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M4 22h10M2 32h8M6 42h8" stroke="#aaa" stroke-width="3" stroke-linecap="round"/></svg>',
 die:(n)=>'<svg viewBox="0 0 64 64"><rect x="10" y="10" width="44" height="44" rx="9" fill="#fff" stroke="#7a1f31" stroke-width="3"/><text x="32" y="43" text-anchor="middle" font-size="30" font-weight="800" fill="#7a1f31" font-family="Georgia,serif">'+(n||5)+'</text></svg>',
 pass:()=>'<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="22" fill="none" stroke="#7a1f31" stroke-width="5"/><path d="M16 48L48 16" stroke="#7a1f31" stroke-width="5"/></svg>',
 hand:()=>'<svg viewBox="0 0 64 64"><rect x="8" y="22" width="14" height="30" rx="3" transform="rotate(-18 15 37)" fill="#fbf1d2" stroke="#7a1f31" stroke-width="2.5"/><rect x="25" y="14" width="14" height="34" rx="3" fill="#fbf1d2" stroke="#7a1f31" stroke-width="2.5"/><rect x="42" y="22" width="14" height="30" rx="3" transform="rotate(18 49 37)" fill="#fbf1d2" stroke="#7a1f31" stroke-width="2.5"/></svg>',
 gift:()=>'<svg viewBox="0 0 64 64"><rect x="10" y="26" width="44" height="30" rx="3" fill="#d6336c" stroke="#7a1f31" stroke-width="3"/><rect x="6" y="18" width="52" height="10" rx="3" fill="#f06595" stroke="#7a1f31" stroke-width="3"/><path d="M32 18v38" stroke="#fff" stroke-width="5"/><path d="M32 18q-12-12-14-2t14 2q12-12 14-2t-14 2" fill="none" stroke="#7a1f31" stroke-width="3"/></svg>',
 tap:()=>'<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="18" fill="rgba(122,31,49,.15)" stroke="#7a1f31" stroke-width="4"/><path d="M30 14v26l-6-5-4 4 14 14h14l4-20-8-2-4-4-4 1-2-4z" fill="#fff" stroke="#231a10" stroke-width="2.5" stroke-linejoin="round"/></svg>',
 glow:()=>'<svg viewBox="0 0 64 64"><rect x="12" y="10" width="40" height="44" rx="8" fill="rgba(255,224,138,.35)" stroke="#e0a800" stroke-width="4" stroke-dasharray="6 4"/><path d="M32 22v20M24 34l8 8 8-8" stroke="#7a1f31" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};
function hpics(items){return '<div class="gxh-pics">'+items.map(it=>it==='>'?'<span class="gxh-ar">&rarr;</span>':'<figure>'+(HP[it[0]]?HP[it[0]](it[2],it[3]):'')+(it[1]?'<figcaption>'+it[1]+'</figcaption>':'')+'</figure>').join('')+'</div>'}
// ---------------------------------------------------------------- where each bubble points
const hvis=e=>{if(!e||e.closest('[hidden]'))return false;const r=e.getBoundingClientRect();return r.width>3&&r.height>3};
const hfirst=(...sels)=>()=>{for(const s of sels){for(const e of document.querySelectorAll(s)){if(hvis(e))return e}}return null};
const hmv=act=>`#prompt [data-mv*='"act":"${act}"'],.fbtns [data-mv*='"act":"${act}"']`;
const HLP_STEPS={
 setup:{target:hfirst('.mine .hand .card.play','#prompt [data-mv*=\'"act":"ready"\']','.mine .hand'),title:'Gear up your hero',text:'Tap a glowing card, then the glowing spot. Tap Ready when you are done.',pic:()=>HP.hero()},
 main:{target:hfirst('.bfdoor','.pile.pl'),title:'Kick the door',text:'Play cards to gear up, then tap the door.',pic:()=>HP.door()},
 after:{target:hfirst(hmv('loot'),'#prompt .acts button'),title:'An empty room',text:'No monster this time. Tap Loot for a free card, or fight a monster from your hand.',pic:()=>HP.back()},
 post:{target:hfirst(hmv('end'),'#prompt .acts button'),title:'Tidy up',text:'Wear new items and sell spares for a level. Then tap End turn.',pic:()=>HP.coin('+1')},
 charity:{target:hfirst('.mine .hand .card.play','.mine .hand'),title:'Too many cards',text:'You hold more cards than the limit. Tap a glowing card and give it away.',pic:()=>HP.hand()},
 window:{target:hfirst('#prompt .acts button','.arena'),title:'A rival’s door',text:'They are about to kick. Curse them with a glowing card, or let them go on.',pic:()=>HP.curse()},
 fight:{target:hfirst('.fbtns .fightb','.fbtns button','.arena .vs'),title:'The fight',text:'The bigger number wins. Tap Fight if you lead. Otherwise add cards, get help or run.',pic:()=>HP.swords()},
 meddle:{target:hfirst('.arena .vs','#prompt .acts button'),title:'A rival fights',text:'You may play a glowing card to change their fight, or tap Let it be.',pic:()=>HP.monster()},
 qHelp:{target:hfirst('#prompt .acts button'),title:'Asked for help',text:'A rival offers treasure to team up. Tap Help to join, or Refuse.',pic:()=>HP.help()},
 qWard:{target:hfirst('#prompt .acts button'),title:'A curse is coming',text:'Your ring can cancel it. Tap Cancel the curse, or let it happen.',pic:()=>HP.ward()},
 qRescue:{target:hfirst('#prompt .acts button'),title:'Caught!',text:'Use an escape card to dodge the Bad Stuff, or take it.',pic:()=>HP.run()},
 qPick:{target:hfirst('#prompt .acts button','#prompt .opt'),title:'Make a choice',text:'Tap one of the options to choose it.',pic:()=>HP.tap()},
 qOffer:{target:hfirst('#prompt .acts button'),title:'A special power',text:'Read the buttons: one uses the power, the other skips it.',pic:()=>HP.tap()},
 drop:{target:hfirst('[data-bfz]'),title:'Pick a spot',text:'Tap a glowing spot to play it there.',pic:()=>HP.glow()},
 ask:{target:hfirst('[data-bfz]'),title:'Who helps?',text:'Tap a rival to ask for help.',pic:()=>HP.help()},
 sell:{target:hfirst('.sellbar .btn.primary','.sellbar .btn'),title:'Sell for a level',text:'Tap items to sell. Every 1,000 gold buys a level. Then tap the green button.',pic:()=>HP.coin('1000')}
};
// ---------------------------------------------------------------- the rules cards (<= 20 words each, a picture each)
const HLP_RULES=[
 {title:'The goal',text:'Be first to reach level 10. The last level can only come from killing a monster.',pic:()=>hpics([['hero','You'],'>',['level','Level 10']])},
 {title:'Your turn',text:'Gear up, kick open a door, fight or loot, tidy up, then end your turn.',pic:()=>hpics([['door','Kick'],'>',['swords','Fight'],'>',['chest','Loot']])},
 {phase:'setup',title:'Set up your hero',text:'Play race, class and item cards from your hand. Items go on if you can use them.',pic:()=>hpics([['card','Race'],['card','Item'],'>',['hero','Hero']])},
 {phase:'setup',title:'Strength is your power',text:'Your strength is your level plus your items. Bigger strength beats bigger monsters.',pic:()=>hpics([['hero','Level 1',1],['coin','+ items','+3'],'>',['swords','Strength 4']])},
 {phase:'main',title:'Kick open the door',text:'Draw a door card face up. A monster starts a fight. A curse hits you at once.',pic:()=>hpics([['door','Kick'],'>',['monster','Fight'],['curse','Curse']])},
 {phase:'main',title:'Gear up first',text:'Before kicking, play items, races and classes, or sell spares: 1,000 gold buys a level.',pic:()=>hpics([['card','Gear'],'>',['coin','1000'],'>',['level','Level']])},
 {phase:'main',title:'Nothing behind it?',text:'Any other card goes to your hand. Then you may loot the room or fight from your hand.',pic:()=>hpics([['door','Door'],'>',['hand','Your hand']])},
 {phase:'after',title:'Loot the room',text:'With no monster to fight, draw a free face-down door card into your hand.',pic:()=>hpics([['back','Draw'],'>',['hand','Hand']])},
 {phase:'after',title:'Look for trouble',text:'Or play a monster from your hand and fight it. Only do this if you can win.',pic:()=>hpics([['hand','Hand'],'>',['monster','Fight']])},
 {phase:'post',title:'Tidy up',text:'Wear new items, sell spares, then tap End turn. Your turn passes to the next hero.',pic:()=>hpics([['card','Wear'],['coin','Sell'],'>',['pass','End']])},
 {phase:'post',title:'Selling for levels',text:'Items worth 1,000 gold sell for one level. You can never sell your way to level 10.',pic:()=>hpics([['coin','1000'],'>',['level','Level']])},
 {phase:'charity',title:'The hand limit',text:'You may keep only five cards at the end of your turn. Dwarves keep six.',pic:()=>hpics([['hand','Max 5'],'>',['pass','Extras go']])},
 {phase:'charity',title:'Charity',text:'Give extra cards to the lowest-level hero. If that is you, discard them.',pic:()=>hpics([['card','Extra'],'>',['gift','Lowest level']])},
 {phase:'window',title:'Before a rival kicks',text:'Everyone may play curses or level-ups, on anyone, before the door opens.',pic:()=>hpics([['door','Their door'],['curse','Curse']])},
 {phase:'window',title:'Why curse them?',text:'Curses cost a rival levels or gear. Hit the hero who is ahead of you.',pic:()=>hpics([['curse','Curse'],'>',['hero','Leader']])},
 {phase:'fight',title:'The bigger number wins',text:'Your strength against the monster. If you are higher, or tie as a Warrior, you win.',pic:()=>hpics([['hero','You',7],['swords','vs'],['monster','Monster',5]])},
 {phase:'fight',title:'Win the fight',text:'You gain levels and draw the monster’s treasure. Rivals get one last chance to boost it.',pic:()=>hpics([['monster','Beaten'],'>',['level','Level'],['chest','Treasure']])},
 {phase:'fight',title:'Losing? Three ways out',text:'Play a one-shot card, ask a rival for help, or run away.',pic:()=>hpics([['card','Card'],['help','Help'],['run','Run']])},
 {phase:'fight',title:'Running away',text:'Roll a die for each monster: 5 or more escapes. Fail and the Bad Stuff happens.',pic:()=>hpics([['run','Run'],'>',['die','5+',5]])},
 {phase:'meddle',title:'Meddle in a fight',text:'Any hero may add a monster boost, a one-shot or a curse while a fight is on.',pic:()=>hpics([['card','Card'],'>',['monster','Monster']])},
 {phase:'meddle',title:'Stop a winner',text:'If this fight would win the game, spend anything to stop it. Otherwise let it be.',pic:()=>hpics([['hero','Winning'],'>',['pass','Stop it']])},
 {phase:'qHelp',title:'Help a rival?',text:'Join the fight and your strengths add up. If you win together, you share the treasure.',pic:()=>hpics([['hero','Rival'],['help','+'],['hero','You']])},
 {phase:'qHelp',title:'Careful',text:'Only the fighter gains levels. Never help a rival who is one level from winning.',pic:()=>hpics([['level','Level 9'],'>',['pass','Refuse']])},
 {phase:'qWard',title:'Cancel the curse',text:'Your ring is used up when it cancels a curse. Save it for a nasty one.',pic:()=>hpics([['curse','Curse'],'>',['ward','Cancelled']])},
 {phase:'qWard',title:'Or take it',text:'A mild curse may be cheaper than losing your ring. The choice is yours.',pic:()=>hpics([['curse','Mild curse'],'>',['ward','Keep ring']])},
 {phase:'qRescue',title:'Caught by the monster',text:'You failed to run. Its Bad Stuff happens, such as losing a level or gear.',pic:()=>hpics([['monster','Caught'],'>',['curse','Bad Stuff']])},
 {phase:'qRescue',title:'An escape card',text:'Some cards let you slip away. Use one if the Bad Stuff is worse than losing the card.',pic:()=>hpics([['card','Escape'],'>',['run','Free']])},
 {phase:'qPick',title:'Choose one',text:'The effect needs a choice. Tap the card or button you want.',pic:()=>hpics([['card','A'],['card','B'],'>',['tap','Tap']])},
 {phase:'qPick',title:'You decide',text:'No other player or hint decides this for you. Read each option before you tap.',pic:()=>hpics([['hero','You'],'>',['tap','Choose']])},
 {phase:'qOffer',title:'A special power',text:'Some cards trigger a power at a set moment. Read the question, then pick a button.',pic:()=>hpics([['card','Power'],'>',['tap','Choose']])},
 {phase:'qOffer',title:'Skipping is fine',text:'You can always decline. Declining keeps your cards just as they are.',pic:()=>hpics([['pass','Skip'],'>',['hand','Keep cards']])},
 {phase:'drop',title:'Play the card',text:'Tap a glowing spot to play the held card there. Dragging a card works too.',pic:()=>hpics([['card','Held'],'>',['glow','Spot']])},
 {phase:'drop',title:'Changed your mind?',text:'Tap the held card again, or tap empty space. Nothing is played until you tap a spot.',pic:()=>hpics([['card','Held'],'>',['hand','Back']])},
 {phase:'ask',title:'Ask for help',text:'A helper adds their strength to yours. They usually want treasure in return.',pic:()=>hpics([['hero','You'],['help','+'],['hero','Helper']])},
 {phase:'ask',title:'Read the numbers',text:'Each rival shows what they add, and whether they will say yes.',pic:()=>hpics([['hero','Rival'],'>',['swords','+4']])},
 {phase:'sell',title:'Sell items',text:'Tap the items you want to sell. Their gold values add up on screen.',pic:()=>hpics([['card','Items'],'>',['coin','1000']])},
 {phase:'sell',title:'1,000 gold, one level',text:'Every full 1,000 gold buys a level, up to level 9. The cards are then discarded.',pic:()=>hpics([['coin','1000'],'>',['level','+1']])}
];
// ---------------------------------------------------------------- phases
const QPHASE={help:'qHelp',ward:'qWard',rescue:'qRescue',pick:'qPick'};
// the phase the player is deciding in (null when it is somebody else's move, or something else is on screen)
function hlpPhase(){try{
  if(!G||G.winner||UI.pass!=null)return null;const me=viewSeat();if(me<0||!P(me)||!P(me).human||G.mode==='ai')return null;
  if(sideToAct()!==me)return null;if(BF.kicking||BF.clip||document.getElementById('bfrev')||BF.drag)return null;
  if(UI.menu||UI.zoom!=null||GX.open)return null;const md=document.getElementById('modal');if(md&&!md.hidden)return null;
  if(BF.ask)return 'ask';if(BF.pick!=null)return 'drop';if(UI.sell)return 'sell';
  if(G.q)return QPHASE[G.q.kind]||'qOffer';
  const cb=G.cb;
  switch(G.phase){case 'setup':return 'setup';case 'window':return 'window';case 'main':return 'main';case 'after':return 'after';case 'post':return 'post';case 'charity':return 'charity';
    case 'combat':return cb&&cb.stage==='act'&&cb.who===me?'fight':cb&&cb.stage==='others'?'meddle':null}
  return null}catch(e){return null}}
// ---------------------------------------------------------------- the bulb: the advisor's move -> the board elements
const strip=s=>String(s||'').replace(/<[^>]+>/g,'').replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
const capW=(t,n)=>{const w=strip(t).split(' ').filter(Boolean);return w.length&&w.length<=n&&!/…|\.\.\./.test(w.join(' '))?w.join(' '):''};
const sentences=t=>strip(t).split(/(?<=[.!?:;])\s+/).map(x=>x.replace(/[:;]$/,'.'));
function hlpBtn(m){const k=mvKey(m);for(const b of document.querySelectorAll('#prompt [data-mv],.fbtns [data-mv]')){if(!hvis(b))continue;try{if(mvKey(JSON.parse(b.dataset.mv))===k)return b}catch(e){}}return null}
function hlpCardEl(id){return document.querySelector(`.mine .hand [data-card="${id}"]`)||document.querySelector(`.mine .gear [data-card="${id}"]`)}
// where the finger goes for a move: {toE, fromE} (elements on the board) or null when the move has no clear place on screen
const hrect=e=>{const r=e.getBoundingClientRect();return {left:r.left,top:r.top,width:r.width,height:r.height}};
// the part of a fanned hand card that is not under its neighbour: that is where a finger can touch it
function hslice(e){const r=e.getBoundingClientRect();let right=r.right;
  if(e.closest('.mine .hand')){for(const o of e.closest('.mine .hand').querySelectorAll('.card')){if(o===e)continue;const q=o.getBoundingClientRect();if(q.left>r.left+4&&q.left<right)right=q.left}}
  return {left:r.left,top:r.top,width:Math.max(24,right-r.left),height:r.height}}
function hlpPlan(m,me){const p=hlpPlan0(m,me);if(!p)return null;p.toR=hrect(p.toE);if(p.fromE)p.fromR=hslice(p.fromE);return p}
function hlpPlan0(m,me){if(!m||me<0)return null;
  if(m.act==='kick'){const d=document.querySelector('.bfdoor')||hlpBtn(m);return hvis(d)?{toE:d}:null}
  if(m.act==='ask'){const am=document.querySelector('.fbtns [data-a="askmenu"]');if(!hvis(am))return null;
    const asks=validMoves(me).filter(x=>x.act==='ask');if(asks.some(x=>P(x.tgt).human))return {toE:am};
    const o=document.querySelector(`#phopps [data-opp="${m.tgt}"],#app .opps [data-opp="${m.tgt}"]`);return hvis(o)?{toE:o,fromE:am}:{toE:am}}
  if(m.act==='sell'){const b=document.querySelector('#prompt [data-a="sellmode"]');return hvis(b)?{toE:b}:null}
  const b=hlpBtn(m);if(b)return {toE:b};
  if(m.card!=null){const f=hlpCardEl(m.card);if(!hvis(f))return null;const mv=bfMoves(me,m.card).find(x=>mvKey(x.m)===mvKey(m));if(!mv)return null;
    const to=bfEls(mv.z).find(hvis);if(!to)return null;
    const r=f.getBoundingClientRect();if(r.left<0||r.right>innerWidth){try{f.scrollIntoView({inline:'center',block:'nearest'})}catch(e){}}
    return {toE:to,fromE:f}}
  return null}
// a short reason (<= 15 words) from the advisor's own text; '' when there is no honest short reason
function hlpWhy(m,co,me){const cb=G.cb;let c=[];const tail=(co.why?sentences(co.why):[]);
  const nm=i=>strip(P(i).nm);
  switch(m.act){
    case 'kick':c.push('Nothing more to play: kick open the door.');break;
    case 'loot':c.push('No monster to fight: loot the room for a free card.');break;
    case 'end':c.push('Nothing useful left to play: end your turn.');break;
    case 'ready':c.push('Your hero is set: tap Ready.');break;
    case 'fight':if(cb)c.push(winning(cb)?`You lead ${sideStr(cb)} to ${monStr(cb)}: fight now.`:'');break;
    case 'run':if(cb)c.push(`You lose ${sideStr(cb)} to ${monStr(cb)} and no card wins it: run.`);break;
    case 'ask':c.push(`Ask ${nm(m.tgt)}: they would help, and together you win.`);break;
    case 'give':case 'toss':{const w=strip(discardWhy(m.card,me));c.push(`Your weakest card: ${w}.`);break}
    case 'pass':if(G.phase==='window')c.push(`Nothing worth playing now: let ${nm(G.active)} go on.`);else c.push('Nothing worth a card: let it be.');break;
    case 'opt':case 'use':c.push(capW(tail[0],15),capW(tail[1],15));break;
    case 'play':case 'equip':case 'unequip':{const cc=m.card!=null?cd(m.card):null;const x=co.plan&&co.plan[0];const mine=x&&x.m&&mvKey(x.m)===mvKey(m);const w=mine?strip(x.why):'';
      if(m.act==='unequip')c.push('Take it off: it makes room for something better.');
      else if(cc&&(cc.t==='race'||cc.t==='class'))c.push(`Playing ${cname(m.card)} gives your hero its powers.`);
      else if(cc&&(cc.t==='item'||m.act==='equip')&&/^\+\d+ strength$/.test(w))c.push(`${cname(m.card)}: ${w} for your hero.`);
      else if(cc&&cc.t==='item'&&/^carried/.test(w))c.push('No free slot: carry it now and sell it later.');
      else if(cc&&cc.t==='level'&&m.tgt===me)c.push('A free level for you: play it.');
      else if(cc&&cc.t==='curse'&&/^hurts/.test(w))c.push(`Curse ${nm(m.tgt)}, who leads: it slows them down.`);
      else if(mine)c.push(capW(strip(x.label)+(w?': '+w:''),15));
      else c.push(capW(tail[1],15),capW(tail[0],15));
      break}
    default:break}
  return c.map(x=>capW(x,15)).find(Boolean)||''}
// the bulb's suggestion: the move the advisor would make now, legal, with a place on the board and a short honest reason; else null (rules cards only)
function hlpSuggest(){try{
  const me=viewSeat();if(!G||G.winner||me<0||sideToAct()!==me||!P(me).human||UI.sell||BF.ask||BF.pick!=null||BF.drag||UI.menu||UI.zoom!=null)return null;
  if(G.q&&['pick','glue','lawyer','fetch'].includes(G.q.kind))return null;   // no reason that is surely right: show the rules instead
  const co=coach(me);const m=co&&co.rec;if(!m||!validMoves(me).some(x=>mvKey(x)===mvKey(m)))return null;
  const p0=hlpPlan(m,me);if(!p0)return null;const why=hlpWhy(m,co,me);if(!why)return null;
  return {why,key:mvKey(m),target:()=>{const q=hlpPlan(m,me);return (q&&q.toR)||p0.toR},from:p0.fromR?()=>{const q=hlpPlan(m,me);const e=q&&q.fromE;if(e){document.querySelectorAll('[data-gxh-avoid]').forEach(x=>{if(x!==e)x.removeAttribute('data-gxh-avoid')});e.setAttribute('data-gxh-avoid','')}return (q&&q.fromR)||p0.fromR}:null}}catch(e){console.warn('hlpSuggest '+e);return null}}
// ---------------------------------------------------------------- wiring
let _hlpInit=false;
function hlpInit(){if(_hlpInit||typeof GXH==='undefined')return;_hlpInit=true;
  GXH.init({game:'doorkick-dungeon',defaultOn:true,steps:HLP_STEPS,rules:HLP_RULES,avoid:'.mine .hand .card.play,[data-bfz],.bfdoor,.fbtns button,#prompt .acts button,.rec,.pulse,.bf-tgt'});
  GXH.bulb({el:'#bulbbtn',suggest:hlpSuggest,rulesFor:hlpPhase});if(typeof syncMenu==='function')syncMenu()}
function hlpClean(){try{const c=GXH.state().cur;if(!(c&&c.kind==='bulb'))document.querySelectorAll('[data-gxh-avoid]').forEach(x=>x.removeAttribute('data-gxh-avoid'))}catch(e){}}
function hlpAfter(){hlpInit();if(typeof GXH==='undefined')return;hlpClean();
  // a guided game ("Teach me as I play", or a story chapter with hints): every bubble shows again
  if(G&&G.learn&&UI.hlpLearn!==G.gid){UI.hlpLearn=G.gid;GXH.reset();GXH.setEnabled(true)}
  GXH.phase(hlpPhase())}
(function(){const _r=render;render=function(){const r=_r.apply(this,arguments);try{hlpAfter()}catch(e){UI.lastErr='hlp '+e}return r}})();
// pick-ups, asks and overlays change the phase without a render: look again now and then (cheap, idempotent)
(function(){const _m=bfMark;bfMark=function(){const r=_m.apply(this,arguments);try{if(typeof GXH!=='undefined'&&_hlpInit)GXH.phase(hlpPhase())}catch(e){}return r}})();
setInterval(()=>{try{if(_hlpInit&&G){hlpClean();GXH.phase(hlpPhase())}}catch(e){}},400);
hlpAfter();
