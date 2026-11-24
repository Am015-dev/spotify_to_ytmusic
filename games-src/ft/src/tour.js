// ---------- the floating tour (W655): a labelled map of the real HUD, then one lesson per rule, in play order ----------
// Owner rules: a floating window (drag, minimise to a chip, close); never dims, never blocks a tap; a pulse ring marks the
// suggestion; a lesson ticks when you do it or on Next; the window never sits on what it explains; ? reopens the map.
// Hadiya's commissions (commui.js) stay as optional practice at the end.
const TOUR={on:false,map:false,i:0,done:{},ev:{},evN:0,since:0,min:false,pos:null,mapSel:-1,t:0};
const TQ=s=>{for(const q of s.split(',')){const e=[...document.querySelectorAll(q)].find(e=>{const r=e.getBoundingClientRect();return r.width>2&&r.height>2&&r.bottom>0&&r.top<innerHeight});if(e)return e}return null};   // first visible match, in the order the selectors are listed
const TOUR_MAP=[
  ['#tourbtn','Guide','Opens this map and the lessons again at any time.'],
  ['#hintsbtn','Hints','Turns the short tips on or off, and suggests a good move.'],
  ['.gx-bar [data-gx="djd"]','Djinns','Lists every djinn in this game with its points and power.'],
  ['.gx-bar [data-gx="logd"]','Log','Every move so far, newest first, in plain words.'],
  ['.gx-bar [data-gx="rulesd"]','Rules','The full rules, including player counts and the expansions.'],
  ['.gx-bar [data-gx="plrd"]','Players','The score list: who holds what, point by point.'],
  ['.gx-bar [data-gx="menud"]','Menu','Sound, music, speed, settings, story mode and a new game.'],
  ['#seats .sch[data-seat="0"] .sn','Your chip','Your points, coins and camels left; tap it for the full score list.'],
  ['#seats .sch[data-seat="0"] .ss','Score','Your points right now; coins count as points.'],
  ['#seats .sch[data-seat="0"] .s2 .st:nth-child(2)','Camels left','Each claim uses one; when anyone places their last, the game ends after that round.'],
  ['#seats .sch[data-seat="1"] .sn','Rival chip','The same facts for the computer; the glowing chip is whoever acts now.'],
  ['#line','Prompt','One line that says what to do now, or what the rival just did.'],
  ['#trk','Phase','Bid, Move, Take, Sell: the phase now, with a strip showing how far the turn is.'],
  ['#grid .tile .tn','Tile','A tile: its kind is named here; its effect happens when you end your walk on it.'],
  ['#grid .tile .ms','People','The people standing on a tile, by colour; the number is how many of that colour.'],
  ['#grid .tile .tv','Tile points','What the tile is worth at the end to whoever holds it with a camel.'],
  ['#grid .tile.owned .ob,#cleg','Owner marks','Your camel or the rival\'s camel on a tile shows who holds it; palms and palaces are drawn on tiles too.'],
  ['#mkt .mrow,.gx-bar [data-gx="mktd"]','Goods market','Opens the market: Traders take from its left end; also your goods and what sets sell for.'],
  ['#djrow .drow .dcard','Djinn bar','Three face-up djinns you can summon at a Shrine; tap the i to read one.'],
  ['#bidt .bidt,#acts','Turn order / actions','The turn-order window opens when you bid; later your action buttons appear here.']];
const TOUR_L=[
  {t:'Goal and points',s:'Coins are points: you start with 50 and the most points at the end wins.',w:'Every coin you spend is a point gone, so each payment must earn more back.',d:'Tap your strip to see your coins.',sel:'#seats .sch[data-seat="0"]',tap:1},
  {t:'Bid for turn order',s:'Pick a spot on the track: 18, 12, 8, 5, 3 or 1 coins, or one of the free spots; you pay at once and never get it back.',w:'Playing first lets you take the best tile before the rival does.',d:'Tap a spot on the track.',sel:'#bidt .bidt button:not([disabled]),#acts [data-gx="bidd"],#acts button',ev:'bid'},
  {t:'Who plays first',s:'The dearer spot plays first; on the same price the later bidder goes first, and next round you bid in this round\'s play order.',w:'A cheap spot after the rival can still beat the rival.',d:'Watch the order fill in, then the first player moves.',sel:'#bidt .bidt,#trk',ev:'phase:play'},
  {t:'Lift a tile',s:'Lift every person from one tile of your choice.',w:'Which tile you start from decides where you can end and what you take.',d:'Tap a glowing tile.',sel:'#grid .tile.glow,#grid .tile',ev:'start'},
  {t:'Walk',s:'Drop one person per tile, up, down, left or right, never straight back; you may pass empty tiles but never end on one.',w:'The walk length is the number of people you lifted, so big tiles reach far.',d:'Tap a glowing neighbour to drop a person.',sel:'#grid .tile.glow,#grid .tile',ev:'step'},
  {t:'The last drop',s:'Your last person must land on a tile that holds its own colour; you take every person of that colour there.',w:'Choosing the drop order lets you pick which colour you take.',d:'End your walk on a matching colour.',sel:'#grid .tile.glow,#grid .tile',ev:'take'},
  {t:'You must move',s:'If you can make a move you must; if nobody can, the game ends.',w:'You cannot pass to wait for a better board.',d:'Read, then tap Next.',sel:'#grid .tile.glow,#line'},
  {t:'Claim with a camel',s:'If your move empties a tile, your camel claims it for good; with no camels left you claim nothing.',w:'Tiles, palms and palaces only score for the camel on them.',d:'Empty a tile to place a camel.',sel:'#seats .sch[data-seat="0"] .s2',ev:'claim'},
  {t:'Advisors (yellow)',s:'Keep them: 1 point each, plus 10 for every rival who has fewer; a tie gives no bonus.',w:'Holding the most Advisors is a 10-point swing.',d:'Take Advisors, or tap Next.',sel:'#acts button',ev:'tribe:vizier'},
  {t:'Sages (white)',s:'Keep them: 2 points each, and spend them to summon djinns.',w:'Sages are points and the key to djinn powers.',d:'Take Sages, or tap Next.',sel:'#acts button',ev:'tribe:elder'},
  {t:'Traders (green)',s:'Take that many goods from the left end of the market row.',w:'Goods become coins when you sell different kinds together.',d:'Look at the market row; take Traders, or tap Next.',sel:'#mkt .mrow,.gx-bar [data-gx="mktd"]',ev:'tribe:merchant'},
  {t:'Masons (blue)',s:'Earn coins: Masons times the blue tiles around the tile you ended on.',w:'Many blue neighbours turn a few Masons into many coins.',d:'Take Masons, or tap Next.',sel:'#acts button',ev:'tribe:builder'},
  {t:'Shadows (red)',s:'Remove one person within as many steps as you took Shadows, or a rival\'s kept Advisor or Sage; a tile you empty is yours.',w:'One removal can win a tile or break a rival\'s Advisor lead.',d:'Take Shadows, or tap Next.',sel:'#acts button,#grid .tile.glow',ev:'tribe:assassin'},
  {t:'Mystics',s:'Mystics are goods cards that add a Mason, add a step of Shadow range, or pay for a Sage at a Shrine; they score nothing and cannot be sold.',w:'They are flexible help, worth spending rather than keeping.',d:'Find a Mystic in the market row.',sel:'#mkt .mrow'},
  {t:'Oasis',s:'Ending on an Oasis means you must plant a palm: 3 points to whoever holds that tile.',w:'Plant on your own tiles; on a rival\'s tile you feed the rival.',d:'End on an Oasis, or tap Next.',sel:'#grid .tile.k-oasis',ev:'tile:oasis'},
  {t:'Hamlet',s:'Ending on a Hamlet means you must build a palace: 5 points to whoever holds the tile, even if you claim nothing; none when the supply runs out.',w:'A palace on a rival\'s Hamlet is 5 points for the rival.',d:'End on a Hamlet, or tap Next.',sel:'#grid .tile.k-village',ev:'tile:village'},
  {t:'Bazaar Stall',s:'You may pay 3 coins for one of the first 3 goods in the market row.',w:'One more kind can lift a set from 13 to 21.',d:'End on a Stall, or tap Next.',sel:'#grid .tile.k-small',ev:'tile:small'},
  {t:'Grand Bazaar',s:'You may pay 6 coins for two of the first 6 goods.',w:'Two new kinds at once can be worth far more than 6.',d:'End on a Bazaar, or tap Next.',sel:'#grid .tile.k-large',ev:'tile:large'},
  {t:'Shrine and djinns',s:'At a Shrine you may pay 2 Sages, or 1 Sage and 1 Mystic, for one of the three face-up djinns.',w:'A djinn scores its own points and gives a power.',d:'End on a Shrine, or tap Next.',sel:'#grid .tile.k-sacred,#mkt .drow',ev:'tile:sacred'},
  {t:'Djinn powers',s:'Each djinn has points and a power you may use once per turn, from the turn you get it.',w:'Picking the djinn that fits your tiles beats the biggest number.',d:'Tap a djinn card, or the Djinns button, to read their powers.',sel:'#mkt .drow .dcard,.gx-bar [data-gx="djd"]',tap:1},
  {t:'Selling goods',s:'At the end of your turn you may sell sets of different kinds: 1, 3, 7, 13, 21, 30, 40, 50 or 60 coins for 1 to 9 kinds; several sets per turn.',w:'Unsold goods also score as sets at the end, so sell only when the coins help now.',d:'Sell, or end your turn.',sel:'#acts button',ev:'end'},
  {t:'Refill',s:'After everyone has played, the market row and the djinns refill and a new round starts with a new bid.',w:'What is gone now may be back next round.',d:'Play until round 2 starts.',sel:'#trk',ev:'round2'},
  {t:'The end',s:'When someone places their last camel, the round is finished and the game ends.',w:'Running out of camels first lets you end it while you lead.',d:'Watch the camels left in both strips.',sel:'#seats'},
  {t:'Final scoring',s:'Score coins, Advisors, Sages, djinns, the tiles you hold, palms 3, palaces 5 and goods as sets; a tie shares the win.',w:'Land, people and goods all count, so a balanced plan wins.',d:'Tap a strip to see the score list.',sel:'#seats .sch[data-seat="1"]',tap:1},
  {t:'Crafters and items',s:'With the Crafters expansion, purple Crafters are kept and draw items; Workshops sell items; precious items score 5, 7 or 9 and magic items give a one-time power.',w:'Items add points and surprise moves.',d:'Tap Rules and open Learn more.',sel:'.gx-bar [data-gx="rulesd"]',tap:1},
  {t:'Cutpurses',s:'With Cutpurses, one face-up Cutpurse per colour can be hired at a Shrine; it takes one thing from every rival.',w:'A well-timed Cutpurse hits everyone at once.',d:'Read it in Rules, Learn more, then tap Next.',sel:'.gx-bar [data-gx="rulesd"]'},
  {t:'Player counts and Wonder Cities',s:'With 2 players each has 11 camels and two bid markers; 3 to 5 players use 8 camels; Wonder Cities score 5, 20, 45, 80 or 125 for 1 to 5 held.',w:'More players means fewer camels each and a faster end.',d:'Tap Next to finish the lessons.',sel:'.gx-bar [data-gx="rulesd"]'}];
const TOUR_KEY='soq_tour';
function tourSave(){try{localStorage.setItem(TOUR_KEY,JSON.stringify({i:TOUR.i,done:TOUR.done}))}catch(e){}}
function tourLoad(){try{const s=JSON.parse(localStorage.getItem(TOUR_KEY)||'null');if(s){TOUR.i=Math.min(s.i|0,TOUR_L.length);TOUR.done=s.done||{}}}catch(e){}}
// what the human did: read from the real move, so a lesson ticks when the action happens
function tourNote(k){TOUR.ev[k]=++TOUR.evN}
if(typeof performMove==='function'){const pm0=performMove;performMove=function(m,s){if(s===undefined)s=sideToAct();
  const mine=s>=0&&G&&G.pl[s]&&G.pl[s].human&&!(UI&&UI.sim);const a=G&&G.act;const col=a&&a.color;const kind=a&&G.board[a.tile]&&G.board[a.tile].k;const cam=mine?P(s).camels:0;const ph=G&&G.phase,rd=G&&G.round;
  const r=pm0(m,s);if(!r||!r.success||!G)return r;
  if(mine){if(m.act==='bid')tourNote('bid');if(m.act==='start')tourNote('start');if(m.act==='step'){tourNote('step');if(G.act&&G.step==='tribe')tourNote('take')}
    if(P(s).camels<cam)tourNote('claim');if(m.act==='tribe'&&col)tourNote('tribe:'+col);if(m.act==='tile'&&kind)tourNote('tile:'+kind);if(m.act==='sell'){tourNote('sell');tourNote('end')}if(m.act==='end')tourNote('end')}
  if(ph==='bid'&&G.phase!=='bid')tourNote('phase:play');if(G.round>rd)tourNote('round2');return r}}
// ---------- the window ----------
function tourEl(){let w=document.getElementById('tourw');if(w)return w;w=document.createElement('section');w.id='tourw';w.className='tourw';w.setAttribute('role','dialog');w.setAttribute('aria-label','Guide');
  w.innerHTML='<header class="tw-h"><b class="tw-ti">Guide</b><span class="tw-sp"></span><button type="button" class="tw-b" data-tw="map" aria-label="HUD map">Map</button><button type="button" class="tw-b" data-tw="min" aria-label="Minimise">&#8211;</button><button type="button" class="tw-b" data-tw="x" aria-label="Close">&#215;</button></header><div class="tw-body"></div>';
  document.body.appendChild(w);
  const h=w.querySelector('.tw-h');let dr=null;
  h.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;const r=w.getBoundingClientRect();dr={dx:e.clientX-r.left,dy:e.clientY-r.top};h.setPointerCapture(e.pointerId)});
  h.addEventListener('pointermove',e=>{if(!dr)return;const x=Math.max(0,Math.min(innerWidth-w.offsetWidth,e.clientX-dr.dx)),y=Math.max(0,Math.min(innerHeight-40,e.clientY-dr.dy));w.style.left=x+'px';w.style.top=y+'px';TOUR.pos={x,y}});
  h.addEventListener('pointerup',()=>{dr=null});
  w.addEventListener('click',e=>{const b=e.target.closest('[data-tw]');if(!b)return;const a=b.dataset.tw;
    if(a==='x')return tourClose();if(a==='min'){TOUR.min=true;return tourDraw()}if(a==='map'){TOUR.map=!TOUR.map;TOUR.mapSel=-1;return tourDraw()}
    if(a==='next')return tourNext();if(a==='back'){TOUR.i=Math.max(0,TOUR.i-1);TOUR.since=TOUR.evN;tourSave();return tourDraw()}
    if(a==='go'){TOUR.i=+b.dataset.i;TOUR.since=TOUR.evN;TOUR.map=false;tourSave();return tourDraw()}
    if(a==='lessons'){TOUR.map=false;return tourDraw()}if(a==='list'){w.classList.toggle('tw-open');return tourPlace()}
    if(a==='comm'){tourClose();if(typeof commStart==='function')commStart(+b.dataset.i)}});
  return w}
function tourChip(){let c=document.getElementById('tourchip');if(!c){c=document.createElement('button');c.type='button';c.id='tourchip';c.className='tourchip';c.addEventListener('click',()=>{TOUR.min=false;tourDraw()});document.body.appendChild(c)}return c}
function tourRing(){let r=document.getElementById('tourring');if(!r){r=document.createElement('i');r.id='tourring';r.className='tourring';r.setAttribute('aria-hidden','true');document.body.appendChild(r)}return r}
function tourMapEl(){let m=document.getElementById('tourmap');if(!m){m=document.createElement('div');m.id='tourmap';m.className='tourmap';document.body.appendChild(m);
  m.addEventListener('click',e=>{const b=e.target.closest('[data-tm]');if(!b)return;TOUR.mapSel=+b.dataset.tm;tourDraw()})}return m}
const tourEsc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function tourLessonHtml(){const n=TOUR_L.length;const nd=Object.keys(TOUR.done).length;
  const list=`<ol class="tw-list">${TOUR_L.map((l,i)=>`<li class="${TOUR.done[i]?'ok':''}${i===TOUR.i?' cur':''}"><button type="button" data-tw="go" data-i="${i}"><i class="tw-tick" aria-hidden="true"></i>${tourEsc(l.t)}</button></li>`).join('')}</ol>`;
  const head=`<button type="button" class="tw-prog" data-tw="list" aria-label="Checklist">${nd} of ${n} done <s></s></button>`;
  if(TOUR.i>=n)return head+list+`<p class="tw-s">All the rules are covered. Practise with Hadiya's six commissions, or keep playing.</p><div class="tw-comm">${(typeof COMMS!=='undefined'?COMMS:[]).map((c,i)=>`<button type="button" class="tw-b2" data-tw="comm" data-i="${i}">${i+1}. ${tourEsc(c.title)}</button>`).join('')}</div>`;
  const l=TOUR_L[TOUR.i];
  return head+list+`<h3 class="tw-t">${TOUR.i+1}. ${tourEsc(l.t)}</h3><p class="tw-s">${tourEsc(l.s)}</p><p class="tw-w"><b>Why:</b> ${tourEsc(l.w)}</p><p class="tw-d"><b>Do:</b> ${tourEsc(l.d)}</p><div class="tw-acts">${TOUR.i?'<button type="button" class="tw-b2" data-tw="back">Back</button>':''}<button type="button" class="tw-b2 go" data-tw="next">Next</button></div>`}
function tourMapHtml(){const s=TOUR.mapSel>=0?TOUR_MAP[TOUR.mapSel]:null;
  return `<h3 class="tw-t">${s?tourEsc(s[1]):'Map of the screen'}</h3><p class="tw-s">${s?tourEsc(s[2]):'Every label points at a real part of the screen. Tap a label to hear what it does; the game still works underneath.'}</p><div class="tw-acts"><button type="button" class="tw-b2 go" data-tw="lessons">${TOUR.i?'Back to the lessons':'Start the lessons'}</button></div>`}
function tourDraw(){if(!TOUR.on)return;const w=tourEl(),c=tourChip();w.hidden=TOUR.min;c.hidden=!TOUR.min;
  c.innerHTML=`<img class="pic" src="media/icon-djinn.webp" alt=""><span>Guide ${Math.min(TOUR.i+1,TOUR_L.length)}/${TOUR_L.length}</span>`;
  w.querySelector('.tw-ti').textContent=TOUR.map?'Map of the screen':'Learn the rules';w.querySelector('[data-tw="map"]').setAttribute('aria-pressed',TOUR.map?'true':'false');
  w.querySelector('.tw-body').innerHTML=TOUR.map?tourMapHtml():tourLessonHtml();w.classList.toggle('tw-mapmode',TOUR.map);
  tourMapDraw();tourPlace()}
function tourTarget(){if(TOUR.map)return TOUR.mapSel>=0?TQ(TOUR_MAP[TOUR.mapSel][0]):null;const l=TOUR_L[TOUR.i];return l?TQ(l.sel):null}
const tOv=(a,b)=>Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
const tRect=(x,y,w,h)=>({left:x,top:y,right:x+w,bottom:y+h,width:w,height:h});
// place the window where it covers the least of what it explains (and of the map labels); a dragged window stays put if it is clear
function tourPlace(){const w=document.getElementById('tourw');const ring=tourRing();const t=TOUR.on&&!TOUR.min?tourTarget():null;
  if(t){const r=t.getBoundingClientRect();ring.hidden=false;Object.assign(ring.style,{left:r.left-4+'px',top:r.top-4+'px',width:r.width+8+'px',height:r.height+8+'px'})}else ring.hidden=true;
  if(!w||w.hidden)return;const W=innerWidth,H=innerHeight;const ww=Math.min(330,W-24);w.style.width=ww+'px';const wh=w.offsetHeight;
  const avoid=[];if(t)avoid.push([t.getBoundingClientRect(),1000]);for(const b of document.querySelectorAll('#tourmap .tm-l'))avoid.push([b.getBoundingClientRect(),50]);
  for(const [q,k] of [['#chz',1000],['#modal .mbox',1000],['#acts button',4],['#grid .tile.glow',3]])for(const e of document.querySelectorAll(q))if(!e.closest('[hidden]')&&e.getBoundingClientRect().width)avoid.push([e.getBoundingClientRect(),k]);   // never hide a choice the player must make
  const hb=document.querySelector('.gx-bar');const top0=hb?hb.getBoundingClientRect().bottom+4:8;
  const cost=(x,y)=>{const R=tRect(x,y,ww,wh);let c=0;for(const [a,k] of avoid)c+=tOv(R,a)*k;return c};
  if(TOUR.pos&&cost(TOUR.pos.x,TOUR.pos.y)===0){w.style.left=TOUR.pos.x+'px';w.style.top=TOUR.pos.y+'px';return}
  let best=null;for(let y=top0;y<=H-wh-8;y+=12)for(const x of [12,(W-ww)/2,W-ww-12]){const c=cost(x,y)+Math.abs(y-(H-wh-8))*.01;if(!best||c<best.c)best={c,x,y}}
  if(!best)best={x:12,y:top0};w.style.left=Math.round(best.x)+'px';w.style.top=Math.round(best.y)+'px';TOUR.pos=null}
// ---------- the HUD map: a label + leader line for every visible part, placed so labels never overlap ----------
function tourMapDraw(){const m=tourMapEl();if(!TOUR.on||!TOUR.map||TOUR.min){m.hidden=true;m.innerHTML='';return}m.hidden=false;
  const W=innerWidth,H=innerHeight;const items=TOUR_MAP.map((x,i)=>({i,el:TQ(x[0]),lb:x[1]})).filter(x=>x.el);
  m.innerHTML=items.map(x=>`<button type="button" class="tm-l${x.i===TOUR.mapSel?' on':''}" data-tm="${x.i}">${tourEsc(x.lb)}</button>`).join('')+'<svg class="tm-svg" width="'+W+'" height="'+H+'"></svg>';
  const placed=[];const tr=items.map(x=>x.el.getBoundingClientRect());let svg='';
  m.querySelectorAll('.tm-l').forEach((b,k)=>{const r=tr[k];const bw=b.offsetWidth,bh=b.offsetHeight;const cx=(r.left+r.right)/2,cy=(r.top+r.bottom)/2;let best=null;
    for(let y=4;y<=H-bh-4;y+=6)for(let x=4;x<=W-bw-4;x+=6){const R=tRect(x,y,bw,bh);let c=Math.hypot(x+bw/2-cx,y+bh/2-cy);
      if(placed.some(p=>tOv(R,tRect(p.left-3,p.top-3,p.width+6,p.height+6))>0))continue;
      c+=tOv(R,r)/(bw*bh)*2000;for(let j=0;j<tr.length;j++)if(j!==k&&tOv(R,tr[j])>0&&tr[j].width*tr[j].height<20000)c+=60;
      if(!best||c<best.c)best={c,x,y}}
    if(!best)best={x:4,y:4};b.style.left=best.x+'px';b.style.top=best.y+'px';const R=tRect(best.x,best.y,bw,bh);placed.push(R);
    const px=Math.max(r.left+4,Math.min(r.right-4,(R.left+R.right)/2)),py=Math.max(r.top+4,Math.min(r.bottom-4,(R.top+R.bottom)/2));
    const lx=Math.max(R.left,Math.min(R.right,px)),ly=Math.max(R.top,Math.min(R.bottom,py));
    svg+=`<line x1="${lx}" y1="${ly}" x2="${px}" y2="${py}"/><circle cx="${px}" cy="${py}" r="3.5"/>`});
  m.querySelector('svg').innerHTML=svg}
// ---------- lessons tick when done (events since the lesson opened) or on Next ----------
function tourCheck(){if(!TOUR.on||TOUR.map)return;const l=TOUR_L[TOUR.i];if(!l)return;if(l.ev&&TOUR.ev[l.ev]>TOUR.since)tourNext()}
function tourNext(){if(TOUR.i<TOUR_L.length){TOUR.done[TOUR.i]=1;TOUR.i++}TOUR.since=TOUR.evN;tourSave();tourDraw()}
document.addEventListener('click',e=>{if(!TOUR.on||TOUR.map)return;const l=TOUR_L[TOUR.i];if(!l||!l.tap)return;const t=TQ(l.sel);if(t&&t.contains(e.target))setTimeout(tourNext,0)},true);
function tourOpen(map){tourLoad();TOUR.on=true;TOUR.min=false;TOUR.map=map!==false;TOUR.mapSel=-1;TOUR.since=TOUR.evN;document.body.classList.add('touring');
  if(!TOUR.t)TOUR.t=setInterval(()=>{if(!TOUR.on)return;tourCheck();tourPlace()},300);tourDraw()}
function tourClose(){TOUR.on=false;document.body.classList.remove('touring');for(const id of ['tourw','tourchip','tourring','tourmap']){const e=document.getElementById(id);if(e)e.hidden=true}const m=document.getElementById('tourmap');if(m)m.innerHTML=''}
// Learn by playing: a real 2-player game against the computer with the guide open on the map
function tourStart(){try{GX.close()}catch(e){}if(typeof commLeave==='function')commLeave();try{localStorage.removeItem(TOUR_KEY)}catch(e){}TOUR.i=0;TOUR.done={};TOUR.pos=null;
  UI.setup.seats=['human','ai'];beginGame();UI.modal=null;render();schedule();tourOpen(true)}
// the ? button in the top bar (always there in a game)
(function(){const bar=document.querySelector('.gx-bar');if(!bar||document.getElementById('tourbtn'))return;const b=document.createElement('button');b.type='button';b.id='tourbtn';b.className='gx-ibtn';b.setAttribute('aria-label','Guide: map of the screen and lessons');
  b.innerHTML='<b class="tq" aria-hidden="true">?</b><span>Guide</span>';const h=document.getElementById('hintsbtn');
  // phones keep the top bar at 5 buttons (UI-BAR): there the ? floats in the empty left end of the bar instead
  const put=()=>{const narrow=innerWidth<700;b.classList.toggle('tq-fl',narrow);if(narrow&&b.parentNode!==document.body)document.body.appendChild(b);else if(!narrow&&b.parentNode!==bar)bar.insertBefore(b,h||null)};put();addEventListener('resize',put);setInterval(()=>{const off=!G||!!G.comm;if(b.hidden!==off)b.hidden=off},500);
  b.addEventListener('click',()=>{if(!G)return;if(TOUR.on&&TOUR.map&&!TOUR.min)return tourClose();tourOpen(true)})})();
addEventListener('resize',()=>{if(TOUR.on)tourDraw()});
