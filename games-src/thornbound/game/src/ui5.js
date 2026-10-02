// ===================== part 5: render loop, clicks, drawers (rules, log, board, menu), start screen =====================
function renderAll(){if(!G||!UI.started)return;
  try{UI.V=TB.stripView(G,isPassing()?-1:vs())}catch(e){console.error('view '+e.message);return}
  if(isPassing()){if(GX.open)GX.close();const bb=$('#boardbody');if(bb)bb.innerHTML='';if(UI.pop)closePop(true)}
  if(!(UI.card&&UI.card.kind==='event'))renderMap();else if(!MAP.m)renderMap();
  renderBar();renderRoad();renderMain();renderHand();renderRivals();renderCard();renderPop();updateLive();
  document.documentElement.dataset.step=String(roadIdx());
  if(typeof phoneRefresh==='function')phoneRefresh();
  const lb=$('#logbody');if(lb&&GX.open==='logd')renderLog()}
function updateLive(){const l=$('#live');if(!l)return;const last=G.log[G.log.length-1];if(last&&UI._liveN!==last.i){UI._liveN=last.i;l.textContent=last.t}}
// ---------------------------------------------------------------- clicks
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-a]');
  if(!t){ // tap on the empty board closes a pop-up
    if(UI.pop&&e.target.closest&&e.target.closest('#mapwrap')&&!e.target.closest('.tb-loc')){closePop();e.stopPropagation()}return}
  const a=t.dataset.a;
  switch(a){
   case 'mv':{if(!humanMove(t.dataset.k)){renderAll()}break}
   case 'hand':{const id=+t.dataset.id;if(UI.pop==='card'&&UI.popArg.id===id&&!t.closest('#ppop')){closePop();break}UI.hand=id;openPop('card',{id});renderHand();break}
   case 'loc':openPop('loc',{l:+t.dataset.l});break;
   case 'rival':openPop('rival',{s:+t.dataset.s});break;
   case 'kc':openPop('kc',{n:+t.dataset.n});break;
   case 'road4':openPop('kingdom');break;
   case 'pclose':closePop();break;
   case 'take':{const s=+t.dataset.s;UI.holder=s;UI.passed=s;UI.card=null;UI._cardKey=null;UI.pop=null;pump();break}
   case 'evok':{UI.card=null;UI._cardKey=null;UI.noAnim=false;if(UI._cp)UI._cp=null;UI.mapReset=false;MAP.slotDirty=true;pump();break}
   case 'tipok':UI.card=null;UI._cardKey=null;pump();break;
   case 'tipoff':UI.guide='light';UI.card=null;UI._cardKey=null;pump();break;
   case 'again':{clearSave();const c=UI.cfg;startFromCfg(c);break}
   case 'menu':showStart();break;
   case 'wpause':UI.watchPaused=!UI.watchPaused;if(!UI.watchPaused)pump();else renderAll();break;
   case 'wstep':{if(UI.mode==='watch'&&G.q){const w=whoActs();if(w.ai.length){aiStep(w)}}pump();break}
   case 'wspeed':UI.speed=UI.speed>=4?1:UI.speed*2;renderAll();break;
   // start screen
   case 'mode':sv.mode=t.dataset.v;renderStart();break;
   case 'np':sv.np=+t.dataset.v;renderStart();break;
   case 'fac':sv.faction=t.dataset.v;renderStart();break;
   case 'len':sv.length=t.dataset.v;renderStart();break;
   case 'gd':sv.guide=t.dataset.v;renderStart();break;
   case 'start':startFromSetup();break;
   case 'guided':newGame('guided');break;
   case 'cont':{const s=loadSave();if(s){hideStart();resumeGame(s);afterStart()}break}
   case 'rules':GX.show('rulesd');break;
   case 'gdset':UI.guide=t.dataset.v;renderMenu();break;
   case 'snd':UI.sound=!UI.sound;try{localStorage.setItem('tb_snd',UI.sound?'1':'0')}catch(x){}if(window.GA)GA.setSfx(UI.sound);renderMenu();break;
   case 'mus':UI.music=!UI.music;try{localStorage.setItem('tb_mus',UI.music?'1':'0')}catch(x){}if(window.GA)GA.setMusic(UI.music);renderMenu();break;
   case 'gfx':UI.lowGfx=!UI.lowGfx;try{localStorage.setItem('tb_gfx',UI.lowGfx?'low':'high')}catch(x){}UI.mapReset=true;renderAll();renderMenu();break;
   case 'savenow':saveGame();toast('Saved. You can continue from the start screen.');break;
   case 'newgame':GX.close();showStart();break;
   case 'spd':UI.speed=+t.dataset.v;renderMenu();break;
   case 'logall':UI.logAll=!UI.logAll;renderLog();break;
  }});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&UI.pop&&!GX.open){closePop();e.preventDefault()}});
function toast(t){UI.toast=t;const l=$('#live');if(l)l.textContent=t}
// ---------------------------------------------------------------- start screen
const sv={mode:'me',np:3,faction:'nobility',length:'standard',guide:'full',levels:['normal','normal','normal','normal']};
function showStart(){$('#start').hidden=false;document.body.classList.add('in-start');renderStart();const f=$('#start [data-a=guided]');if(f)try{f.focus({preventScroll:true})}catch(e){}}
function hideStart(){$('#start').hidden=true;document.body.classList.remove('in-start')}
function renderStart(){const el=$('#start');if(!el||el.hidden)return;const sav=loadSave();
  const lvl=(i)=>'<select class="sel" data-a="lv" data-i="'+i+'" aria-label="Computer level, seat '+(i+1)+'">'+['easy','normal','hard'].map(l=>'<option value="'+l+'"'+(sv.levels[i]===l?' selected':'')+'>'+l[0].toUpperCase()+l.slice(1)+'</option>').join('')+'</select>';
  const nSeats=sv.np;let seats='';
  const fac=FIDS.slice();const mine=sv.faction;const rest=fac.filter(f=>f!==mine);
  for(let i=0;i<nSeats;i++){const f=sv.mode==='me'?(i===0?mine:rest[i-1]):FIDS[i];const k=TBKit.FACTIONS[FK[f]];const human=sv.mode==='hot'||(sv.mode==='me'&&i===0);
    seats+='<div class="seat" style="--fc:'+k.main+'">'+TBKit.token('influence',{faction:FK[f]},30).outerHTML+'<span class="sn"><b>'+esc(k.short)+'</b><small>'+(human?(sv.mode==='hot'?'Player '+(i+1):'You'):'Computer')+'</small></span>'+(human?'':lvl(i))+'</div>'}
  el.innerHTML='<div class="st-box"><h1 class="st-t">The Thornbound Throne</h1><p class="st-s">An area-control card game for 2 to 4. Win clashes in three regions, place your Herald where you will be, and hold the most Influence when the last round ends.</p>'+
   '<div class="st-bt"><button class="btn pri big" data-a="guided">Guided first game</button>'+(sav?'<button class="btn big" data-a="cont">Continue saved game (round '+sav.G.round+')</button>':'')+'</div>'+
   '<h2>Or set up a game</h2><div class="seg" role="radiogroup" aria-label="Mode">'+[['me','Play the computer'],['hot','Hot-seat (pass the device)'],['watch','Watch computers']].map(([v,l])=>'<button role="radio" aria-checked="'+(sv.mode===v)+'" class="'+(sv.mode===v?'on':'')+'" data-a="mode" data-v="'+v+'" data-start="'+v+'">'+l+'</button>').join('')+'</div>'+
   '<div class="row"><span>Players</span><div class="seg">'+[2,3,4].map(n=>'<button class="'+(sv.np===n?'on':'')+'" data-a="np" data-v="'+n+'">'+n+'</button>').join('')+'</div><span>Length</span><div class="seg">'+[['short','4 rounds'],['standard','5 rounds'],['extended','6 rounds']].map(([v,l])=>'<button class="'+(sv.length===v?'on':'')+'" data-a="len" data-v="'+v+'">'+l+'</button>').join('')+'</div></div>'+
   (sv.mode==='me'?'<div class="row"><span>Your side</span><div class="seg fseg">'+FIDS.map(f=>{const k=TBKit.FACTIONS[FK[f]];return '<button class="'+(sv.faction===f?'on':'')+'" data-a="fac" data-v="'+f+'" style="--fc:'+k.main+'">'+esc(k.short)+'</button>'}).join('')+'</div></div>':'')+
   '<div class="seats">'+seats+'</div><div class="row"><span>Guide</span><div class="seg">'+[['full','Full tips'],['light','Light'],['off','Off']].map(([v,l])=>'<button class="'+(sv.guide===v?'on':'')+'" data-a="gd" data-v="'+v+'">'+l+'</button>').join('')+'</div></div>'+
   '<div class="st-bt"><button class="btn pri big" data-a="start" data-start="go">Start game</button><button class="btn big" data-a="rules">How to play</button></div><p class="st-c">Original art drawn in code. Fonts: Cinzel and EB Garamond (SIL OFL). Based on the mechanics of a published game; names and text are our own.</p></div>';
  $$('#start [data-a=lv]').forEach(s=>s.addEventListener('change',()=>{sv.levels[+s.dataset.i]=s.value}))}
function startFromSetup(){hideStart();const lv=sv.levels.slice();
  const o={np:sv.np,length:sv.length,faction:sv.faction,levels:lv,guide:sv.guide};
  // seat i (i>0) uses level[i]; the human seat 0 ignores its slot
  newGame(sv.mode==='watch'?'ai':sv.mode,o)}
function startFromCfg(c){hideStart();const o={np:c.np,length:c.length,faction:c.faction,levels:c.levels,guide:c.guide,seatFactions:c.seats.map(s=>s.faction),humanSeats:c.humanSeats};
  if(c.guided)newGame('guided',o);else newGame(c.mode==='watch'?'ai':c.mode,o)}
function afterStart(){closePop(true);GX.close();UI.mapReset=true;renderAll();pump()}
// ---------------------------------------------------------------- drawers
function renderLog(){const el=$('#logbody');if(!el||!G)return;const L=G.log.slice().reverse();let h='<p class="small"><button class="btn" data-a="logall">'+(UI.logAll?'Show key events only':'Show everything')+'</button></p><ol class="log">';
  let r=-1;for(const e of L){if(!UI.logAll&&e.c!=='big'&&e.c!=='warn')continue;h+='<li class="'+(e.c||'')+'"><i style="background:'+(e.s>=0?fcol(e.s):'#777')+'"></i>'+esc(e.t)+'</li>'}
  el.innerHTML=h+'</ol>'}
function renderMenu(){const el=$('#setbody');if(!el)return;
  const seg=(a,cur,opts)=>'<div class="seg">'+opts.map(([v,l])=>'<button class="'+(String(cur)===String(v)?'on':'')+'" data-a="'+a+'" data-v="'+v+'">'+l+'</button>').join('')+'</div>';
  el.innerHTML='<div class="mrow"><button class="btn pri" data-a="newgame">New game / main menu</button><button class="btn" data-a="savenow">Save now</button></div>'+
   '<div class="mrow"><span>Guide</span>'+seg('gdset',UI.guide,[['full','Full tips'],['light','Light'],['off','Off']])+'</div>'+
   '<div class="mrow"><span>Computer speed</span>'+seg('spd',UI.speed,[[1,'x1'],[2,'x2'],[4,'x4']])+'</div>'+
   '<div class="mrow"><span>Sound</span><button class="btn" data-a="snd" aria-pressed="'+UI.sound+'">'+(UI.sound?'On':'Off')+'</button><span>Music</span><button class="btn" data-a="mus" aria-pressed="'+UI.music+'">'+(UI.music?'On':'Off')+'</button></div>'+
   '<div class="mrow"><span>Graphics</span><button class="btn" data-a="gfx" aria-pressed="'+!!UI.lowGfx+'">'+(UI.lowGfx?'Low (fast)':'High')+'</button>'+(window.PerfHUD?PerfHUD.buttonsHTML('btn'):'')+'</div>'+
   '<h4>Credits</h4><p class="small">Art, map, cards and icons are original and drawn procedurally. Fonts: Cinzel (Natanael Gama) and EB Garamond (Georg Duffner, Octavio Pardo), SIL Open Font License 1.1. The game rules follow a published game family; every name and text here is our own wording. Sound: placeholder synthesised tones.</p>'}
function renderBoardDrawer(){const el=$('#boardbody');if(!el||!G)return;const s=vs()>=0?vs():0;UI.V=UI.V||TB.stripView(G,vs());
  const P=UI.V.pl[s];let h=popRival(s).replace(/^<div class="pp-h">.*?<\/div><div class="pp-b[^"]*">/,'<div>');h=h.replace(/<\/div>$/,'');
  h+='<h5>Site of Power</h5><div class="piles">'+P.site.map(id=>'<div class="sitec"><button class="hc pk" data-a="hand" data-id="'+id+'" data-owner="'+s+'" data-up="1">'+cardEl(id,64).outerHTML+'</button><small>cost '+cinfo(id).cost+'</small></div>').join('')+'</div>';
  h+='<h5>Discard pile ('+P.disc.length+')</h5><div class="piles">'+P.disc.map(id=>'<span class="th" data-owner="'+s+'" data-up="1">'+cardEl(id,48).outerHTML+'</span>').join('')+'</div>';
  const lost=UI.V.lost;h+='<h5>Lost Pile ('+lost.length+', shared)</h5><div class="piles">'+lost.map(id=>'<span class="th">'+cardEl(id,48).outerHTML+'</span>').join('')+'</div>';
  el.innerHTML=h}
const RULES_HTML=`<div class="rules">
<h3>The goal</h3><p>You lead one of four factions competing for the throne. The game lasts a fixed number of rounds (4, 5 or 6). When the last round ends, the player with the most <b>Influence</b> wins. Ties go to whoever holds the Kingdom's Favour, then to the better place on the Order Track.</p>
<h3>How a round goes</h3><ol class="rl">
<li><b>Start of the year.</b> Everyone refills their hand to their hand size. Players are ranked by Influence: the leader acts first.</li>
<li><b>Bids.</b> Everyone secretly picks one card as a bid. Its printed Strength is the bid. Highest first, each player may take a Kingdom Card from the Great Road, steal one from a rival whose occupying card is strictly weaker than their bid, or take their bid card back. A Kingdom Card you take sits on your board (at most two) with your bid card tucked under it.</li>
<li><b>Heralds.</b> In turn order each player puts their one Herald on any location. It is public, so it can be a bluff.</li>
<li><b>Face-down cards.</b> Everyone secretly plays one card next to each of the three regions. With fewer than three cards you place them all before the others.</li>
<li><b>Spring actions.</b> In turn order you may use Spring abilities. The universal one is sending Supporters from your board to a region: each adds 1 Strength in the first clash you fight there.</li>
<li><b>Summer: the clashes.</b> The player in last place sets the order of the three regions. For each region: flip the cards, use Day abilities in turn order (Ambush adds a face-down card from your hand, Retreat pulls cards back, Flank moves a card to another unresolved region), then Night effects (Deadly eliminates every opposing active card; an eliminated card goes to the shared Lost Pile unless it is Resilient or Invulnerable). Add up Strength: cards plus Supporters plus bonuses. Highest total wins. A tie lets the tied players each play one more card face-down or pass; if nobody plays, nobody wins.</li>
<li><b>Winning a clash.</b> The winner picks one of the region's two locations and gains its Influence and its bonus effect. If their Herald is on that location they also gain 1 Influence and steal 1 from every rival Herald standing there.</li>
<li><b>Autumn.</b> Once each you may <b>Govern</b> (move a hand card that has votes into one of three Councils) and <b>Journey</b> (send a hand card that shows Lore away, gain that much Lore, and spend Lore on your faction's Site of Power cards). Other Autumn abilities such as Rally and Deploy also work now.</li>
<li><b>Winter.</b> Heralds go home. Supporters on the map go to the Lost Pile. Every active card goes to its owner's discard pile, except cards that carry Influence tokens, which lose one token and stay.</li>
</ol>
<h3>Locations</h3><ul><li><b>Spire Court</b> +1 and Govern with a card from hand or the table (every other card in that Council is discarded).</li><li><b>Thornwild</b> +1 and Journey.</li><li><b>Gleaning Meadow</b> +1 and claim the Kingdom's Favour.</li><li><b>Cairn Field</b> +2, nothing else.</li><li><b>Moss Altar</b> +1 and put up to three cards at the bottom of your deck.</li><li><b>Ossuary</b> +1, reshuffle your discard pile and draw up to three from it.</li></ul>
<h3>Councils</h3><p>Cards with votes go into Councils. <b>Coin</b>: when you claim a Herald reward you may remove your cards there for extra Influence equal to their votes. <b>Whispers</b>: in Autumn spread markers on locations; four on one location claims its bonus effect. <b>Pledges</b>: in Autumn bring Supporters back from the map or the Lost Pile, one per vote, and one more for the strictly largest voter.</p>
<h3>Attrition</h3><p>If you must draw and your deck is empty, your discard pile becomes your new deck and your hand size drops by one (never below 3, never above 8). A short game of 4 or 5 rounds usually hits this around round 3.</p>
<h3>The Kingdom's Favour</h3><p>A disc with three uses. Claim it at the Gleaning Meadow. While you hold it you may use your faction's Favour action; each use spends one of three charges.</p>
<h3>Reading your cards</h3><p>Top left: Strength. Top right: the Lore cost (Site of Power cards only). Bottom line: votes and lore. Invulnerable cards cannot be eliminated, Resilient cards go to the discard instead of the Lost Pile, Pathfinder cards go to the discard when used for a Journey.</p>
<h3>On this screen</h3><p>The map is the game. Tap a location or a region's card slots for details; tap the throne for the Great Road and Councils. Tap a card in your hand for a large view and its actions. The step list under the map always shows where you are in the round, and the highlighted button is the recommendation of a strong computer player.</p>
</div>`;
function setupDrawers(){
  GX.drawer('rulesd','How to play',(()=>{const d=document.createElement('div');d.innerHTML=RULES_HTML;return d})(),true);
  GX.drawer('logd','Log',(()=>{const d=document.createElement('div');d.id='logbody';return d})());
  GX.drawer('boardd','My board and piles',(()=>{const d=document.createElement('div');d.id='boardbody';return d})());
  GX.drawer('setd','Menu',(()=>{const d=document.createElement('div');d.id='setbody';return d})());
  GX.onShow=id=>{if(id==='logd')renderLog();if(id==='setd')renderMenu();if(id==='boardd')renderBoardDrawer()}}
