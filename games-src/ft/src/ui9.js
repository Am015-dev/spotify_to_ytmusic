// ---------- shared GX kit (menu, card reference, undo, recap, results, offline) and the guided first game ----------
const GAME_ID='sands';
const ACH=[
 {id:'first',name:'First caravan',how:'Finish a game.',test:r=>true},
 {id:'guide',name:'A guided road',how:'Finish the guided first game.',test:r=>r.mode==='guided'},
 {id:'win',name:'Master of the bazaar',how:'Beat the computer.',test:r=>r.won&&(r.mode==='vs'||r.mode==='guided')},
 {id:'hard',name:'The sultan\'s seal',how:'Beat hard computer players in a 3- to 5-player game.',test:r=>r.won&&r.mode==='vs'&&r.level==='hard'&&r.np>=3},
 {id:'two',name:'Two hundred stars',how:'Score 200 points or more.',test:r=>r.score>=200},
 {id:'djinn',name:'Lamp collector',how:'End a game with 3 or more djinns.',test:(r,s,x)=>x.extra&&x.extra.djinns>=3},
 {id:'garden',name:'Green sultanate',how:'Hold 4 or more palm trees at the end.',test:(r,s,x)=>x.extra&&x.extra.palms>=4},
 {id:'court',name:'A crowded court',how:'End with 10 or more Advisors.',test:(r,s,x)=>x.extra&&x.extra.vz>=10},
 {id:'hot',name:'Pass the lamp',how:'Finish a hot-seat game.',test:r=>r.mode==='hot'},
 {id:'online',name:'Caravans abroad',how:'Finish an online game.',test:r=>r.mode==='online'}];
const sbtn=(attrs,txt,dis)=>{const b=document.createElement('button');b.type='button';b.className='gx-sb';for(const k in attrs)b.setAttribute(k,attrs[k]);b.textContent=txt;if(dis)b.disabled=true;return b};
// ---------------------------------------------------------------- the Menu: the same sections as every game
function kitSettings(){
  GX.settings({id:'setd',title:'Menu',
    game:S=>{S.appendChild(GX.row(online()?'Online':'This game',[sbtn({'data-a':'new'},online()?'Lobby':'New game'),online()?null:sbtn({'data-ui':'kitsave'},'Save now',!G||!!G.over)]));
      S.appendChild(GX.row('Undo',sbtn({'data-ui':'kitundo'},'Undo my last step',!GX.undo.can()),'Your own steps, until the turn passes or a card is drawn'))},
    sound:S=>{S.appendChild(GX.row('Sound effects',GX.onoff(typeof SND==='undefined'||SND.on,()=>toggleSound(),'Sound effects')));
      S.appendChild(GX.row('Music',GX.onoff(typeof SND!=='undefined'&&SND.music,()=>toggleMusic(),'Music')))},
    help:S=>{S.appendChild(GX.row('Read',[sbtn({'data-gx':'rulesd'},'How to play'),sbtn({'data-ui':'kitref'},'Cards & tiles'),sbtn({'data-gx':'plrd'},'Players')]));
      S.appendChild(GX.row('Guide',GX.onoff(!!UI.coach,v=>{UI.coach=v;try{localStorage.setItem('soq_coach',v?'1':'0')}catch(e){}if(G)render()},'Guide'),'Suggested moves and tips'))},
    graphics:S=>{const g=typeof GFX!=='undefined'?GFX:{pref:'auto'};const on3d=typeof V3!=='undefined'&&V3.on;
      S.appendChild(GX.row('Graphics',GX.seg([['auto','Auto'],['high','High'],['medium','Medium'],['low','Low']],g.pref,v=>{if(typeof setGfx==='function')setGfx(v)},'Graphics quality'),on3d?'Now drawing at '+gfxLabel()+'. Low turns off shadows and effects.':'3D is not available here, so the flat map is used.'))},
    about:{name:'Sands of Qamar',version:'preview',text:'An original game of tribes, camels and djinns in an imagined sultanate. Names, texts and pictures are our own; the 3D table is drawn in code. Sounds and music are CC0 recordings (Kenney, OpenGameArt). 3D library: three.js (MIT).'}})}
// ---------------------------------------------------------------- component reference (every tribe, tile, goods card, djinn, item, Cutpurse and piece)
const REFD=()=>({MNAME,MPLUR,MHELP,MEEPLE_COUNT,TILEDEF,TILESET,TILESET_ART,TILESET_WHIM,RNAME,RICON,RESOURCE_COUNT,SETVP,DJINNS,ITEMS,THIEVES,CAMELS});
// one picture per djinn: its lamp, coloured by its name, with a sign for what it does
function djGlyph(d){const x=(d.x||'').toLowerCase();
  return /palm/.test(x)?'🌴':/palace/.test(x)?'🏰':/camel/.test(x)?'🐪':/shadow/.test(x)?'🗡️':/advisor/.test(x)?'📜':/sage/.test(x)?'📿':/mason/.test(x)?'🧱':/mystic/.test(x)?'🔮':/goods|market/.test(x)?'🧺':/coin/.test(x)?'🪙':/djinn/.test(x)?'🧞':/people|person/.test(x)?'👥':'✨'}
const ITEM_GLYPH={gem5:'💍',gem7:'🧰',gem9:'👑',carpet:'🧶',lamp:'🪔',flute:'🎶',scimitar:'⚔️',talisman:'🧿',horn:'📯'};
function refPic(it,big){const r=refPic0(it,big);return big&&typeof r==='string'?r.replace(/\bid="(ca[^"]+)"/g,'id="$1big"').replace(/url\(#(ca[^)]+)\)/g,'url(#$1big)'):r}
function refPic0(it,big){const p=it.pic||{};
  if(p.tribe)return cardArt('tribe',p.tribe,{col:MCSS[p.tribe]||'#888',hue:35});
  if(p.tile){const d=TILEDEF[p.tile];return cardArt('tile',d.n+p.v,{blue:p.blue,v:p.v,hue:30})}
  if(p.good)return cardArt('good',p.good,{glyph:RICON[p.good]});
  if(p.djinn){const d=DJ[p.djinn];return cardArt('djinn',d.n,{glyph:djGlyph(d)})}
  if(p.item)return cardArt('good','item'+p.item,{glyph:ITEM_GLYPH[p.item]||'✨',hue:ITEMS[p.item].kind==='precious'?45:265});
  if(p.thief)return cardArt('tribe','th'+p.thief,{col:MCSS[p.thief]||'#888',hue:20,mask:1});
  if(p.piece)return cardArt('good','piece'+p.piece,{glyph:{camel:'🐪',palm:'🌴',palace:'🏰',coin:'🪙',tent:'⛺',mount:'⛰️',track:'🔢'}[p.piece]||'',hue:32});
  return null}
function refInGame(it){if(!G)return true;const p=it.pic||{};
  if(p.djinn)return DJINNS_FOR(G.ex).some(d=>d.k===p.djinn);
  if(p.item||p.tribe==='artisan'||(p.piece==='tent')||(p.piece==='mount'))return !!G.ex.artisans;
  if(p.thief)return !!G.ex.thieves&&(p.thief!=='artisan'||!!G.ex.artisans);
  if(p.tile)return G.board.some(t=>t.k===p.tile&&(!t.v||t.v===p.v));
  return true}
function kitReference(){GX.reference(SOQ_REF(REFD()),{title:'Cards, tiles & tokens',label:'Cards',picture:refPic,inGame:refInGame,before:'[data-gx="logd"]'})}
// ---------------------------------------------------------------- undo: a snapshot of the game before each of your steps; sealed when the turn passes or a card,
// djinn, item or person is drawn (the drop-by-drop "Undo last drop" inside a move stays as it was). Off online.
const humanSeat=()=>{if(!G||G.over)return null;const s=sideToAct();return s>=0&&P(s).human?s:null};
function revealed(a,b){if(!a)return true;return a.rng!==b.rng||a.round!==b.round||a.phase!==b.phase||!!a.over!==!!b.over||
  ['rdeck','djDeck','items','bag','thDeck'].some(k=>(a[k]||[]).length!==(b[k]||[]).length)}
function kitUndo(){GX.undo.config({get:()=>G,owner:g=>g===G?humanSeat():null,online:()=>online(),
  set:s=>{G=s;UI.moveSnap=null;UI.moveSteps=null;UI.pendDj=null;UI.adv=null;UI.autoPlan=null;UI.sellSel=[];if(typeof PHONE!=='undefined'){PHONE.pop=null;PHONE.hideAuto=''}showPath(null);resetScene();toast('Step undone.');refresh()},
  onChange:()=>{}})}
(function(){const o=go;go=function(m){const s=G?sideToAct():-1,local=G&&!online()&&s>=0&&P(s).human,n0=G?G.logN:0;
  if(local&&!(UI.autoPlan&&m.act==='step'))GX.undo.snap(m.act);
  const r=o(m);
  if(G&&!G.over){if(local){GX.undo.check(revealed);GX.recap.mark(s)}else if(s>=0&&!online())GX.recap.push(newLines(n0),s)}
  return r}})();
function newLines(n0){const k=Math.max(0,Math.min(G.logN-n0,G.log.length));return G.log.slice(0,k).reverse().filter(l=>!/^\s*—/.test(l.t)&&l.c!=='turn').map(l=>{try{return narrate(l)}catch(e){return l.t}})}
function undoRow(){return GX.undo.can()&&me()&&!UI.autoPlan?`<div class="acts kitundo"><button class="btn ghost sm" data-ui="kitundo">↶ Undo: ${esc(undoLabel())}</button></div>`:''}
function undoLabel(){const l=GX.undo.label();return {bid:'my bid',start:'my move',step:'my last drop',tribe:'the tribe action',tile:'the tile action',sell:'the sale',q:'my choice',djinn:'the djinn power',item:'the item'}[l]||'my last step'}
// ---------------------------------------------------------------- "since your last turn" strip: on the desktop above the dock, on phones at the top of the strip
function kitRecap(){const host=document.getElementById('recapbox');if(host)GX.recap.attach(host,{title:'Since your turn'})}
function recapSeats(){GX.recap.clear();const hs=G?G.pl.filter(p=>p.human).map(p=>p.i):[];GX.recap.seats(hs.length?hs:[0])}
function placeRecap(){const box=document.querySelector('.gx-recap');if(!box)return;const tgt=PHONE&&PHONE.on?document.querySelector('#ps .ps-recap'):document.getElementById('recapbox');if(tgt&&box.parentNode!==tgt)tgt.appendChild(box)}
// ---------------------------------------------------------------- results, statistics, achievements
function kitResult(){if(!G||!G.over||UI.resultDone)return;UI.resultDone=true;GX.undo.clear();GX.recap.clear();
  const hs=G.pl.filter(p=>p.human);if(!hs.length)return;if(online()&&!(NET.mySeat>=0))return;
  const me_=online()?NET.mySeat:hs.length===1?hs[0].i:-1;
  const mode=online()?'online':G.guided?'guided':hs.length>1?'hot':'vs';
  const seats=G.pl.map(p=>({name:p.nm,ai:p.human?null:p.lv,me:p.i===me_}));
  const byP={};G.over.scores.forEach(r=>byP[r.p]=r.s.total);const lv=G.pl.filter(p=>!p.human).map(p=>p.lv);
  let extra=null;if(me_>=0){const q=P(me_);extra={djinns:q.dj.length,vz:q.vz,palms:G.board.filter(t=>owner(t)===me_).reduce((a,t)=>a+(t.palm||0),0)}}
  try{const r=GNS.result({game:GAME_ID,mode,seats,winner:G.over.win.length===1?G.over.win[0]:G.over.win,scores:G.pl.map(p=>byP[p.i]),turns:G.round,ms:UI.t0?Date.now()-UI.t0:0,
      level:lv.length&&lv.every(l=>l===lv[0])?lv[0]:null,extra});
    if(r&&r.earned.length){UI.earned=r.earned.map(a=>a.name);GX.buzz([30,60,30])}}catch(e){}}
function kitNewGame(){GX.undo.clear();recapSeats();UI.t0=Date.now();UI.resultDone=false;UI.earned=null;UI.savedFlag=0}
(function(){const o=beginGame;beginGame=function(){const r=o.apply(this,arguments);kitNewGame();return r}})();
(function(){const o=loadSaved;loadSaved=function(){const r=o.apply(this,arguments);if(G&&!UI.modal)kitNewGame();return r}})();
// saves: the shelf's Continue row; a save from an older or broken build is not loaded (the start screen opens instead)
(function(){const o=refresh;refresh=function(){o();try{if(!G||online())return;if(G.over){kitResult();if(UI.savedFlag!==-1){UI.savedFlag=-1;GNS.saved(GAME_ID,false)}}
    else if(!UI.savedFlag&&G.pl.some(p=>p.human)){UI.savedFlag=1;GNS.saved(GAME_ID,true)}}catch(e){}
  if(G&&G.over&&online())kitResult()}})();
function saveOk(g){return !!(g&&g.v===1&&Array.isArray(g.pl)&&g.pl.length>=2&&Array.isArray(g.board)&&g.board.length&&Array.isArray(g.log)&&g.W&&g.H)}
(function(){const o=loadSaved;loadSaved=function(){let g=null;try{g=JSON.parse(localStorage.getItem(SAVE))}catch(e){}if(!saveOk(g)){try{localStorage.removeItem(SAVE)}catch(e){}UI.badSave=true;openStart();return}return o.apply(this,arguments)}})();
// ---------------------------------------------------------------- the guided first game: you against an easy computer, a fixed sultanate, round 1 explained
// one step at a time, each with a "why", and one glowing button (the suggested move). From round 2 the suggestions stay, the steps stop.
const GUIDED={seed:2024,lv:'easy'};
function startGuided(){UI.setup={np:2,seats:['human','ai','ai','ai','ai'],lv:['normal',GUIDED.lv,'normal','normal','normal'],ex:{artisans:false,sultan:false,thieves:false,promos:false}};
  setSeed(GUIDED.seed);UI.coach=true;if(typeof PHONE!=='undefined')PHONE.tips=Object.assign({},PHONE.tips,{bid:1,move:1,hand:1});beginGame();G.guided=true;G.gstep={};DEFSEED=null;refresh()}
const TRIBE_WHY={vizier:'Advisors are 1 point each, and 10 more for every rival who ends with fewer. A big lead in Advisors is worth a lot.',
  elder:'Sages are 2 points each, and two of them summon a djinn at a Shrine: djinns are worth points and give powers.',
  merchant:'Goods score in sets of different kinds (1, 3, 7, 13… points), so new kinds are worth the most.',
  builder:'Masons earn coins for each blue tile around the tile, and every coin is a point at the end.',
  assassin:'A Shadow removes one person: empty a tile to claim it with a camel, or take a rival\'s Advisor or Sage.',
  artisan:'Crafters draw items and score for the player with the most of them.'};
const TILE_WHY={village:'A palace is 5 points for whoever holds this tile at the end, so it helps the holder: you, if your camel is here.',
  oasis:'A palm tree is 3 points for whoever holds this tile at the end.',
  sacred:'A djinn costs 2 Sages (or 1 Sage and 1 Mystic). If you cannot pay yet, skipping is fine.',
  small:'Buying costs coins, and coins are points: buy only when the goods add more to your sets than they cost.',
  large:'Two goods for 6 coins: worth it only when they add more than 6 points to your sets.',
  exchange:'Buy only when the card adds more to your sets than the 4 coins it costs.'};
function guideStep(){if(!G||!G.guided||online()||!UI.coach||G.over)return null;const p=me();if(!p)return null;
  if(G.round>=2){if(G.gdone)return null;return {k:'lead',title:'Now you lead',text:'That was a whole round. From now on every choice is yours. The glowing tiles still show the best moves, and Advise me (the bulb at the top) explains any decision.',why:'Coins, Advisors, Sages, djinns, the tiles you hold, palms, palaces and goods sets all score at the end. The game ends in the round someone places their last camel.',ok:'Play on'}}
  if(G.q)return {n:4,title:'A choice',text:G.q.title,why:'The glowing choice is what a good player would pick here.'};
  if(G.phase==='bid'){const r=UI.bidRec,v=curPlansSafe(p),pr=r?bidPrice(p,r.spot,r.fk):0;
    return {n:1,title:'Bid for turn order',text:'Each round starts with a bid. Put your marker on a free spot of the track and pay its price: dearer spots play earlier this round.',
      why:'Every coin is a point at the end, so pay only to protect a good move. '+(pr?'Your best move is worth about +'+v+' points, so the glowing spot ('+pr+' coin'+(pr>1?'s':'')+') lets you play before a rival can take it.':'Nothing big is at stake right now, so the glowing free spot is the smart choice.')}}
  if(G.step==='move'&&!G.move){const pl=curPlansSafe(p);const top=(curPlans(p)||[])[0];
    return {n:2,title:'Make your move',text:'Lift everyone off one tile and walk them across the land, leaving one person on each tile you pass. The last one must land where its own colour already stands: you take that whole colour, and if the tile empties your camel claims it.',
      why:top?'The glowing plan is the best one now (about +'+pl+' points: '+planGains(p,top).join(', ')+'). Tap it and watch the path.':'Tap a glowing tile to start.'}}
  if(G.step==='move'&&G.move)return {n:2,title:'Walking the path',text:'One person stays on each tile you pass. The plan does it for you; the last one lands on its own colour.',why:'Leaving people behind changes the board for everyone, so plans look a few tiles ahead.'};
  if(G.step==='tribe'){const c=G.act.color;return {n:3,title:'The '+MPLUR[c]+' go to work',text:MHELP[c],why:TRIBE_WHY[c]||''}}
  if(G.step==='tile'){const t=G.board[G.act.tile];const sum=t.k==='sacred'&&validMoves(p.i).some(m=>m.act==='tile'&&m.dj);
    return {n:4,title:'The tile: '+tileName(t),text:TILEDEF[t.k].x,why:sum?'You have the Sages to pay. A djinn is worth points and gives a power; the glowing one is worth the most to you now (its power counts too, not only its printed points).':TILE_WHY[t.k]||'The glowing choice is the best one here.'}}
  if(G.step==='sell')return {n:5,title:'End your turn',text:'You may sell a set of different goods for coins now, then end your turn.',why:'Goods are worth more as a set at the end than they sell for now, so keep them and end your turn.'};
  return null}
function guideHTML(){const g=guideStep();if(!g)return '';
  return `<div id="gcoach" class="gcoach" role="note"><b>${g.n?'Step '+g.n+' of 5 · ':''}${esc(g.title)}</b><p class="small">${esc(g.text)}</p>${g.why?`<p class="small gwhy"><b>Why:</b> ${esc(g.why)}</p>`:''}${g.ok?`<div class="acts"><button class="btn go gglow" data-ui="gok">${esc(g.ok)}</button></div>`:''}</div>`}
// the suggested button glows (only one)
function glowTarget(root){if(!root)return null;const g=guideStep();if(!g||g.ok)return null;
  if(G.phase==='bid')return root.querySelector('.bidrec')||root.querySelector('.sp.rec .btn');
  if(G.step==='move'&&!G.move)return root.querySelector('[data-plando="0"]');
  const a=advice();if(!a||!a.move)return root.querySelector('.btn.go');const want=JSON.stringify(a.move);
  for(const b of root.querySelectorAll('[data-mv]')){try{if(JSON.stringify(JSON.parse(b.dataset.mv))===want)return b}catch(e){}}
  return root.querySelector('.btn.go')}
function placeGuide(){for(const e of document.querySelectorAll('.gglow:not([data-ui=gok])'))e.classList.remove('gglow');
  const old=document.getElementById('gcoach');const h=guideHTML();
  let host=null;if(PHONE&&PHONE.on){const pc=document.getElementById('pc'),pp=document.getElementById('ppop');const intro=pc&&!pc.hidden&&/^(chapter|tip-|over)/.test(pc.dataset.k||'');
    host=intro?null:pc&&!pc.hidden?pc.querySelector('.pp-b'):pp&&!pp.hidden?pp.querySelector('.pp-b'):document.getElementById('ps')}
  else host=document.getElementById('dockbody');
  if(!h||!host){if(old)old.remove();return}
  if(!old||old.parentNode!==host||old.outerHTML!==h){if(old)old.remove();const after=host.id==='ps'?host.querySelector('.ps-main'):null;if(after)after.insertAdjacentHTML('afterend',h);else host.insertAdjacentHTML('afterbegin',h)}
  const t=glowTarget(PHONE&&PHONE.on?document.querySelector('#pc:not([hidden]),#ppop:not([hidden])')||document.getElementById('ps'):document.getElementById('dockbody'));if(t){t.classList.add('gglow');if(PHONE&&PHONE.on&&UI.glowAt!==guideKey()){UI.glowAt=guideKey();try{t.scrollIntoView({block:'nearest'})}catch(e){}}}}
const guideKey=()=>G?[G.round,G.phase,G.step,G.logN,!!G.q].join():'';
// ---------------------------------------------------------------- render hooks
(function(){const o=renderDock;renderDock=function(){o();const pr=document.querySelector('#dockbody .prompt');if(pr&&!G.over)pr.insertAdjacentHTML('beforeend',undoRow());
  // the guided coach box says it once: drop the prompt's own long intro while a guided step is shown
  if(pr&&G.over&&!online()&&!pr.querySelector('[data-ui=again]')){const a=document.querySelector('#dockbody .acts');if(a)a.insertAdjacentHTML('afterbegin','<button class="btn go" data-ui="again">Play again</button>')}
  const g=guideStep();if(pr&&g&&g.n)for(const e of pr.querySelectorAll(':scope>p:not(.small):not(.flav)'))e.remove()}})();
(function(){const o=phRender;phRender=function(){o();try{if(G){placeRecap();placeGuide()}}catch(e){console.error(e)}}})();
(function(){const o=phStrip;phStrip=function(hp,pop,card){return '<div class="ps-recap"></div>'+o(hp,pop,card)}})();
(function(){const o=render;render=function(){o();try{if(G){const h=G.pl.filter(p=>p.human);const s=sideToAct();if(s>=0&&P(s).human)GX.recap.view(s);else if(h.length===1)GX.recap.view(h[0].i)}placeRecap();placeGuide()}catch(e){console.error(e)}}})();
// ---------------------------------------------------------------- boot
function kitBoot(){kitSettings();kitReference();kitUndo();kitRecap();
  GNS.achievements(GAME_ID,ACH);UI.speed=1;AIDELAY=GX.aiDelay(450);applyAnim();
  GX.onPref(k=>{if(k==='ai'||typeof k==='object')AIDELAY=GX.aiDelay(450);if(k==='anim'||k==='reduce'||typeof k==='object')applyAnim();if((k==='cb'||k==='text')&&G)render()});
  GX.applyPrefs();GX.offline({sw:'../sw.js',scope:'../'})}
function applyAnim(){ANIM=GX.animMs(1000)>0?1:0}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-ui]');if(!b)return;const a=b.dataset.ui;
  if(a==='kitundo'){if(GX.undo.undo()&&typeof sfx==='function')sfx('click')}
  else if(a==='kitref'){GX.close();GX.show('gx-refd')}
  else if(a==='kitsave'){refresh();toast('Game saved. Continue it from the start screen.')}
  else if(a==='guided'){GX.close();startGuided()}
  else if(a==='again'){if(G&&G.guided)startGuided();else{UI.modal=null;beginGame()}}
  else if(a==='gok'){if(G){G.gdone=1;refresh()}}});
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='z'&&!GX.open&&GX.undo.can()){e.preventDefault();GX.undo.undo()}});
if(UI.kitLate)kitBoot();
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('.gx-drawer [data-a=new],.gx-drawer [data-ui=guided]'))GX.close()},true);
