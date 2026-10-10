// ---------- panel ----------
function humanTurn(){return G&&!G.winner&&isHuman(G.active)&&(!NET.on||G.active===NET.mySeat)}
function uiAct(ds){if(isClient()){netSend(ds);return}gameAct(ds,NET.on?NET.mySeat:undefined)}
const STEPS=['Roll','Resolve','City','Buy','End'];
function stepBar(){const s=G.step||1;return `<div class="steps">${STEPS.map((t,k)=>`<span class="st ${k+1<s?'done':''} ${k+1===s?'on':''}"><b>${k+1}</b>${t}</span>`).join('')}</div>`}
const CHIP={K:'PERMANENT',D:'ONE-SHOT',C:'SAVE FOR LATER',U:'COSTUME'};
function chipOf(C){return `<span class="chip c${C.t}">${CHIP[C.t]||'CARD'}</span>`}
function whyNot(p,id){const b=base(id);if(curseOn('k_library')&&scarab()!==p.i)return 'Only the 🪲 holder can buy';if(b==='m_free'&&p.mb>0)return 'Only with no 🧠 left';if(b==='m_mirac'&&p.hp>3)return 'Only at 3 ♥ or less';if(b==='m_treas'&&!G.disc.some(x=>CARDS[base(x)].t==='C'))return 'Needs a SAVE FOR LATER card in the discard pile';const c=costOf(p,id);return p.en<c?`Need ${c} ⚡`:''}
function buyLabel(p,k){return canBuy(p,k)?'Buy':whyNot(p,G.market[k])}
function suggestCard(p){let best=-1,bv=-0.5;G.market.forEach((id,k)=>{if(!canBuy(p,k))return;const v=cardValue(p,id);if(v>bv){bv=v;best=k}});return best}
function renderPanel(){
  const pt=document.getElementById('ptop'),pa=document.getElementById('pacts'),pm=document.getElementById('pmsg');const di=document.getElementById('dice'),ro=document.getElementById('rolls'),pv=document.getElementById('preview');
  storyScan();checkTips();
  document.getElementById('banner').innerHTML=G?UI.banner:'';renderNews();renderAdvice();renderTour();
  if(!G){pt.innerHTML='';pa.innerHTML='';pm.innerHTML='';di.innerHTML='';ro.innerHTML='';pv.innerHTML='';document.getElementById('buymini').classList.add('hidden');document.getElementById('youbox').classList.add('hidden');document.getElementById('docktitle').textContent='Crown City Smash';return}
  const p=cur();let who=esc(mname(p)),head='',msg='',acts='',topTip='';
  const btn=(a,l,dis,sm,cls)=>`<button class="btn ${cls||''}" data-act="${a}" ${dis?'disabled':''}>${l}${sm?`<small>${sm}</small>`:''}</button>`;
  const me=G.mode==='solo'?G.pl.find(q=>q.human):null;
  if(G.winner){who='Game over';msg=esc(G.winText);acts=btn('again','Play again','','','primary')}
  else if(!humanTurn()){
    head=G.step===1?`Step 1 · ${esc(mname(p))} is rolling`:G.step<=3?`Step 2 · ${esc(mname(p))} resolves its dice`:`Step 4 · ${esc(mname(p))} is shopping`;
    msg=G.step===1?'Watch which dice it keeps (they turn yellow).':G.step===4?'It may buy power cards or play evolutions.':'';if(G.bug&&P(G.bug.by))msg+=`<div class="tip bug">🧠 ${esc(mname(P(G.bug.by)))} stole ${esc(mname(P(G.bug.v)))}'s roll with a Brainjack token. ${esc(mname(P(G.bug.v)))} rolls again afterwards.</div>`;
    if(me){msg+=`<div class="tip">You are <b>${esc(mname(me))}</b>. Nothing to do right now: you will get a pop-up if you can ${mbOn()&&me.mb?'use your <b>Brainjack</b> or ':''}yield the city.</div>`}}
  else if(G.phase==='roll'){const nk=G.dice.filter(d=>!d.k).length;
    head='Step 1 · Roll the dice';
    msg=!(UI.coach>=0)&&((UI.myTurns||0)<=2||!UI.hadTurn)?`<ol class="how"><li>Tap the dice you want to <b>keep</b> (here, or right in the city). They turn yellow.${UI.hints?' A <span class="bdash">blue dashed outline</span> marks our suggestion.':''}</li><li>Press <b>Reroll</b> to throw the others again (${G.rolls} left).</li><li>Happy with the result? Press <b>Resolve</b>.</li></ol>`:'';
    msg+=`<div class="tip">You are in <b>${where(p.i)}</b>. ${inCity(p.i)?'Your claws hit everyone outside. Hearts do nothing here.':G.city===-1?'Downtown is empty, so you will move in after resolving (+1 ★) and claws hit nobody this time.':`Your claws hit whoever is in the city (${esc(mname(P(G.city)))} 👑).`}</div>`;
    acts=btn('reroll',`Reroll ${nk} ${nk===1?'die':'dice'}`,G.rolls<=0||!nk,G.rolls<=0?'no rerolls left':`${G.rolls} left`,G.rolls>0&&nk?'primary':'')+btn('resolve','Resolve dice','','go to step 2',G.rolls<=0||!nk?'primary':'');
  }else if(G.phase==='buy'){const sg=suggestCard(p);
    head=`Step 4 · Buy power cards (optional)${G.bug?' · borrowed turn':''}`;
    topTip=G.bug?`<div class="tip bug">🧠 <b>Borrowed turn:</b> you used ${esc(mname(P(G.bug.v)))}'s dice, now you may shop. Then ${esc(mname(P(G.bug.v)))} rolls again, and your own turn still comes.</div>`:'';msg=`You have <b>${p.en} energy ⚡</b>. Cards you can afford have a yellow <b>Buy</b> button.${sg>=0?`<div class="tip">💡 Suggestion: <b>${esc(CARDS[base(G.market[sg])].n)}</b>.</div>`:'<div class="tip">Nothing great to buy? Save your energy and press <b>End turn</b>.</div>'}`;
    acts=btn('end',G.bug?'Finish borrowed turn':'End turn','',G.bug?`${esc(mname(P(G.bug.v)))} then rolls again`:'next monster goes','primary')+btn('sweep','New cards (2 ⚡)',p.en<2,p.en<2?'you need 2 ⚡':'throw these 3 away, deal 3 fresh').replace('<button ','<button title="Throw these 3 cards away and deal 3 fresh ones (2 ⚡)" ')}
  if(humanTurn()){
    actionsFor(p).forEach(a=>acts+=btn(a.a,esc(a.l),a.dis,esc(a.sm),a.cls))}
  if(NET.on&&!G.winner){const w=isHost()?(UI.choice&&UI.choice.who!==undefined?UI.choice.who:-1):(NET.pw===undefined?-1:NET.pw);
    if(w>=0&&w!==NET.mySeat&&G.pl[w])msg+=`<div class="tip">⏳ Waiting for <b>${esc(pname(G.pl[w])||mname(G.pl[w]))}</b> (${esc(mname(G.pl[w]))}) to decide…</div>`;
    if(!humanTurn()&&G.pl[G.active].human&&G.active!==NET.mySeat)msg+=`<div class="small muted">It's ${esc(pname(G.pl[G.active])||'another player')}'s turn.</div>`;
    acts+=`<div class="emotes">${EMOTES.map(e=>`<button class="btn mini" data-emo="${e}" aria-label="send ${e}">${e}</button>`).join('')}</div>`}
  pt.innerHTML=`${G.winner?'':stepBar()}<div class="who" style="color:${MONS[p.m].c};-webkit-text-stroke:1.2px #1a1320">${who}${humanTurn()?' · your turn':''}</div>${head?`<div class="head">${head}</div>`:''}${topTip}`;
  pa.innerHTML=acts;pm.innerHTML=msg;
  document.getElementById('docktitle').textContent=G.winner?'Game over':`R${G.turn} · ${humanTurn()?'Your turn':mname(p)} · ${STEPS[(G.step||1)-1]} · 20★ wins`;
  document.getElementById('dicewrap').classList.toggle('off',G.phase==='buy'||!G.dice.length&&G.phase!=='roll');
  const canClick=humanTurn()&&G.phase==='roll';
  const spin=UI.rollAnim!==G.rollId&&ANIM;UI.rollAnim=G.rollId;
  const sug=canClick&&UI.hints&&G.rolls>0?suggestMask(p):null;
  di.innerHTML=G.dice.map((d,k)=>`<button class="die ${d.k?'kept':''} ${d.x?'extra':''} ${d.t?'sp-'+d.t:''} ${sug&&sug[k]&&!d.k?'sugg':''} ${spin&&!d.k?'spin':''}" title="${fname(d.f)}${d.t==='b'?' (rampage die)':d.t==='f'?' (Omen Die)':''}" data-die="${k}" ${canClick?'':'disabled'} aria-label="${fname(d.f)}${d.k?' (kept)':''}">${faceSVG(d.f)}</button>`).join('')||'<span class="muted small">No dice rolled yet.</span>';
  ro.innerHTML=G.phase==='roll'?`Rerolls left: ${Array.from({length:Math.max(G.rolls,rerollsOf(p))},(_,k)=>`<span class="pip ${k<G.rolls?'':'used'}"></span>`).join('')}`:'<span class="muted small">Dice resolved.</span>';
  pv.innerHTML=G.phase==='roll'&&G.dice.length?`<b>${humanTurn()?'If you resolve now':'These dice give'}:</b> ${esc(scoreDice(p,G.dice).text)}.${humanTurn()?pairNote(G.dice):''}`:'';
  const buyPh=humanTurn()&&G.phase==="buy";const sg=buyPh?suggestCard(p):-1;
  document.getElementById('market').innerHTML=G.market.map((id,k)=>{const C=CARDS[base(id)];const c=costOf(p,id);return `<div class="pc ${C.t} ${k===sg?'sugg':''}"><div class="hd"><span class="nm">${esc(C.n)}</span><span class="cost" aria-label="costs ${c} energy">${c}</span></div><div class="art" aria-hidden="true">${cardIcon(id)}</div><span class="ty">${chipOf(C)}${C.kw?' · '+C.kw.toUpperCase():''}</span><p>${esc(C.x)}</p>${buyPh?`<button class="btn buy ${canBuy(p,k)?'primary':''}" data-card="${k}" ${canBuy(p,k)?'':'disabled'}>${esc(buyLabel(p,k))}</button>`:''}</div>`}).join('')+`<p class="small muted" style="grid-column:1/-1;margin:.2rem 0 0">${G.deck.length} cards in the deck. <b>ONE-SHOT</b> cards happen at once. <b>PERMANENT</b> cards stay with you. <b>SAVE FOR LATER</b> cards wait until their moment (you get a pop-up).</p>`;
  renderBuyMini(p,buyPh,sg);
  const who2=me||p;
  const tk=who2.tok||{};const list=[...who2.cards.map(id=>{const C=CARDS[base(id)];const b=base(id);return `<div class="mc ${C.t}"><b>${esc(C.n)}</b>${C.t==='C'?` <i>consumable · ${esc(C.kw)}</i>`:''}${b==='smoke'?` (${tk.smoke} puffs)`:''}${b==='cell'?` (${tk.cell} energy on it)`:''}${b==='mimic'&&tk.mim?` (copying ${esc(CN(tk.mim.id))})`:''}${(tk.ufo||[]).includes(id)?' 🐚':''}<br>${esc(C.x)}</div>`}),
    ...who2.evo.map(e=>`<div class="mc E"><b>🧬 ${esc(evoName(e))}</b> <i>${EVO[e].t==='P'?'permanent':'temporary'} evolution in play</i>${e===18&&tk.icy?` (copying ${esc(evoName(tk.icy.e))})`:''}${e===24?` (${tk.adapt} tokens)`:''}<br>${esc(evoText(e))}</div>`),
    ...(who2===me||!me||G.mode==='hot'||G.mode==='ai'?who2.hand.map(e=>`<div class="mc E hand"><b>🧬 ${esc(evoName(e))}</b> <i>in hand (${EVO[e].t==='P'?'permanent':'temporary'}${EVO[e].kw?', '+EVO[e].kw:''})</i><br>${esc(evoText(e))}</div>`):[])];
  if(tk.poison||tk.shrink)list.unshift(`<div class="mc B"><b>${tk.poison?'☠ Poison tokens: '+tk.poison+' ':''}${tk.shrink?'🔻 Shrink tokens: '+tk.shrink:''}</b><br>Poison: lose 1 heart per token at the end of your turn. Shrink: roll 1 die fewer per token. A heart die outside the city can remove one token.</div>`);
  if(G.frz&&G.frz.t===who2.i)list.unshift(`<div class="mc E"><b>❄ ${esc(evoName(11))}</b> from ${esc(mname(P(G.frz.o)))}${G.tf&&G.tf.void&&G.active===who2.i?`: your ${esc(fname(G.tf.void))} faces do nothing this turn`:''}</div>`);
  if(exOn('curse'))list.unshift(`<div class="mc K"><b>𓂀 Curse: ${esc(CURSES[G.curse].n)}</b><br>${esc(CURSES[G.curse].x)}<br><i>Ankh: ${esc(CURSES[G.curse].a)} Snake: ${esc(CURSES[G.curse].s)}</i><br>🪲 Brass Beetle: <b>${scarab()>=0?esc(mname(P(scarab()))):'nobody'}</b></div>`);
  if(exOn('tower'))list.unshift(`<div class="mc T"><b>🗼 Crown Spire levels: ${G.tower.map((o,l)=>`${l+1}: ${o<0?'free':esc(mname(P(o)))}`).join(' · ')}</b><br>Already in the city, resolve four 1s to climb one level. Reaching level 3 wins.</div>`);
  if(exOn('wick'))list.unshift(`<div class="mc W"><b>😈 Menace: ${who2.wk}/10</b> (tiles at 3, 6 and 10)</div>`);
  if(exOn('bers')&&who2.tok.berserk)list.unshift(`<div class="mc B"><b>😡 RAMPAGE!</b><br>You roll the rampage die. Heal with hearts to calm down.</div>`);
  if(exOn('cult'))list.unshift(`<div class="mc M"><b>🕯 Cultists: ${who2.cult}</b><br>Four of a kind gains one (per face). Spend one on your turn for a heart, an energy or a reroll.</div>`);
  if(mbOn())list.unshift(`<div class="mc M"><b>🧠 Brainjack tokens: ${who2.mb}</b><br>When another monster finishes rolling, spend one to resolve its dice as yours and take its Enter and Buy steps; it then rolls again.</div>`);
  document.getElementById('mine').innerHTML=list.length?list.join(''):'<span class="muted small">No cards yet. Buy them with energy after rolling.</span>';
  const dm=document.getElementById('dr-mine');if(dm)dm.querySelector('h2').textContent=me?`Your cards (${mname(me)})`:`${mname(who2)}'s cards`;
  const yb=document.getElementById('youbox');yb.classList.remove('hidden');
  yb.innerHTML=`<b class="t" style="color:${MONS[who2.m].c};-webkit-text-stroke:.8px #1a1320">${esc(mname(who2))}</b> ${me?'(you)':''} <b>♥${who2.hp} ★${who2.vp} ⚡${who2.en}${mbOn()?' 🧠'+who2.mb:''}</b>${exIcons(who2)} · ${who2.cards.length} card${who2.cards.length===1?'':'s'}${who2.evo.length||who2.hand.length?` · 🧬 ${who2.evo.length} in play, ${who2.hand.length} in hand`:''}<button class="btn" data-gx="dr-mine">🎴 Details</button>`;
  const L=document.getElementById('log');L.innerHTML=G.log.slice(0,80).map(l=>{const h=headline(l);return `<li class="${l.s>=0&&G.pl[l.s]&&G.pl[l.s].human&&G.mode==='solo'?'me':''}${h?' news':''}">${h?`<b>${esc(h)}</b><small>${esc(l.t)}</small>`:esc(l.t)}</li>`}).join('');
}
function renderBuyMini(p,buyPh,sg){const el=document.getElementById('buymini');
  if(!G||G.winner||G.phase!=='buy'||!G.market.length){el.classList.add('hidden');el.innerHTML='';return}el.classList.remove('hidden');
  el.innerHTML=`<h3>Cards for sale <button class="btn" data-gx="dr-market">🃏 Full view</button></h3>`+G.market.map((id,k)=>{const C=CARDS[base(id)];const c=costOf(p,id);
    return `<div class="bm ${C.t} ${k===sg?'sugg':''}"><span class="cost">${c}</span><span class="nm">${esc(C.n)} ${chipOf(C)}${C.kw?`<i>${esc(C.kw)}</i>`:''}</span>${buyPh?`<button class="btn ${canBuy(p,k)?'primary':''}" data-card="${k}" ${canBuy(p,k)?'':'disabled'} aria-label="Buy ${esc(C.n)}">${esc(buyLabel(p,k))}</button>`:'<span></span>'}<p>${esc(C.x)}</p></div>`}).join('')}
// every monster's details (popup); the plates on the board show the short version
function monDetail(p){const k=p.i;const hidden=(G.mode==='solo'||G.mode==='net')&&!(NET.on?k===NET.mySeat:p.human);
  const cards=p.cards.map(id=>{const C=CARDS[base(id)];return `<div class="mc ${C.t}"><b>${esc(C.n)}</b>${C.t==='C'?` <i>consumable · ${esc(C.kw)}</i>`:''}<br>${esc(C.x)}</div>`});
  const evo=p.evo.map(e=>`<div class="mc E"><b>🧬 ${esc(evoName(e))}</b> <i>evolution in play</i><br>${esc(evoText(e))}</div>`);
  const hand=p.hand.length?(hidden?[`<div class="mc E hand"><b>🧬 ${p.hand.length} evolution card${p.hand.length===1?'':'s'} in hand</b> <i>hidden</i></div>`]:p.hand.map(e=>`<div class="mc E hand"><b>🧬 ${esc(evoName(e))}</b> <i>in hand</i><br>${esc(evoText(e))}</div>`)):[];
  const all=[...cards,...evo,...hand];
  return `<div class="mon ${p.i===G.active&&!G.winner?'on':''} ${p.alive?'':'ko'}" id="mon-${k}"><b style="background:${MONS[p.m].c}">${inCity(p.i)?'👑 ':''}${esc(mname(p))}${(G.mode==='solo'&&p.human)||(NET.on&&k===NET.mySeat)?' <i>you</i>':''}${pname(p)?' <i>'+esc(pname(p))+'</i>':''}</b>
    <div class="st2">${p.alive?`♥${p.hp}/${maxhp(p)} ★${p.vp} ⚡${p.en}${mbOn()?' 🧠'+p.mb:''}${exIcons(p)} · ${esc(where(p.i))}`:'Knocked out'}</div>
    <div class="small muted" style="padding:0 .5rem .3rem">${esc(MONS[p.m].d)}</div><div class="mine">${all.length?all.join(''):'<span class="muted small">No cards.</span>'}</div></div>`}
function renderScore(){const el=document.getElementById('score');if(!G){el.innerHTML='<p class="muted">No game yet.</p>';return}
  el.innerHTML=G.pl.map(monDetail).join('')}
function renderLegend(){document.getElementById('legend').innerHTML=[
  ['1','Three 1s score 1 star; each extra 1 adds 1 more.'],['2','Three 2s score 2 stars, +1 per extra.'],['3','Three 3s score 3 stars, +1 per extra.'],
  ['E','Energy: 1 each. Spend it on power cards.'],['C','Claw: 1 damage each. From the city you hit everyone outside; from outside you hit the city.'],['H','Heart: heal 1 each (not while in the city). Three hearts also draw an evolution when evolutions are on.']]
  .map(([f,t])=>faceSVG(f)+`<span>${t}</span>`).join('')}

// ---------- modal ----------
function renderModal(){const m=document.getElementById('modal');
  if(NET.on&&NET.inLobby){m.classList.remove('hidden');m.innerHTML=lobbyHTML();return}
  if(UI.info){m.classList.remove('hidden');m.innerHTML=startScreen();return}
  renderChoice(!(UI.stats&&G&&G.winner));
  if(UI.stats&&G&&G.winner){m.classList.remove('hidden');m.innerHTML=statsHTML();return}
  m.classList.add('hidden');m.innerHTML=''}
// in-game questions live in the dock (never over the arena)
function renderChoice(on){const el=document.getElementById('choice'),dk=document.querySelector('.gx-dock');
  if(on&&UI.intro&&G&&!UI.info&&!NET.on){el.classList.remove('hidden');if(dk)dk.classList.add('choosing');el.setAttribute('aria-label','The story so far');el.innerHTML=introHTML();UI.choiceShown='intro';if(window.GX&&GX.app)GX.showDock();return}
  const c=on&&UI.choice&&!(NET.on&&c0Remote())&&!UI.info&&!(NET.on&&NET.inLobby)?UI.choice:null;
  if(!c){el.classList.add('hidden');el.innerHTML='';if(dk)dk.classList.remove('choosing');UI.choiceShown=null;return}
  const dice=c.dice&&G?`<div class="mdice">${G.dice.map(d=>`<span class="die sm ${d.t?'sp-'+d.t:''}">${faceSVG(d.f)}</span>`).join('')}</div>`:'';
  el.classList.remove('hidden');if(dk)dk.classList.add('choosing');el.setAttribute('aria-label',c.title);
  el.innerHTML=`<h2>${esc(c.title)}</h2>${G&&c.who!==undefined&&G.mode==='hot'?`<p class="pass">📱 Pass the device to <b>${esc(mname(P(c.who)))}</b>: this one is for you.</p>`:''}<p>${esc(c.text)}</p>${dice}<div class="acts">${(()=>{const hp=c.options.some(o=>o.primary);return c.options.map(o=>{const pr=o.primary||!hp&&(o.rec||/Recommended\./.test(o.d||''));return `<button class="btn ${pr?'primary':''} ${o.rec?'rec':''}" data-opt="${esc(o.k)}">${o.rec&&hp?'<span class="recchip">★ Recommended</span>':''}${esc(o.l)}${o.g?`<b class="gist">${esc(o.g)}</b>`:''}${o.d?`<small>${esc(o.d)}</small>`:''}</button>`}).join('')})()}${c.cancel?'<button class="btn" data-opt="x">Close</button>':''}</div>`;
  const key=c.title+'|'+c.text;if(UI.choiceShown!==key){UI.choiceShown=key;if(window.GX&&GX.app){GX.showDock();if(GX.open)GX.close()}const b=document.getElementById('dockbody');if(b)b.scrollTop=0;const f=el.querySelector('button');if(f&&document.activeElement&&!/INPUT|TEXTAREA/.test(document.activeElement.tagName))try{f.focus({preventScroll:true})}catch(e){}}}
function startScreen(){let saved=load();if(saved&&!saveOK(saved)){saved=null;try{localStorage.removeItem(SAVE)}catch(e){}}const xp=UI.xp;
  const pool=MONS.map((M,k)=>k).filter(k=>xp!=='base'||k<6);if(!pool.includes(UI.mon))UI.mon=0;
  const xpn={base:'classic rules',trial:'Brainjack Taster',exp:'Brainjack Full Set'}[xp];const lv={easy:'Easy',normal:'Normal',hard:'Hard'}[UI.lvl]||'Normal';
  return `<div class="dlg start" role="dialog" aria-modal="true"><h2>Crown City Smash</h2>
   <p class="lede">Giant monsters brawl for Crown City. Roll dice, smash your rivals and hold Downtown. First to <b>20 ★</b>, or the <b>last monster standing</b>, is crowned.</p>
   <div class="acts" style="margin:.5rem 0">
    ${typeof tutBtn==='function'&&tutFirst()?tutBtn('btn big'):''}
    <button class="btn primary big" data-start="solo">▶ Play now (recommended)<small>You are ${esc(MONS[UI.mon].n)} against ${UI.n-1} computer monster${UI.n>2?'s':''} · ${lv} · ${xpn}${UI.evo?' + evolutions':''}. Short tips guide your first game.</small></button>
    ${typeof campStartBtn==='function'?campStartBtn():''}
    ${typeof tutBtn==='function'&&!tutFirst()?tutBtn('btn'):''}
    ${saved&&!saved.winner&&saved.pl?`<button class="btn" data-start="load">Continue saved game<small>Round ${saved.turn}, ${saved.pl.length} monsters</small></button>`:''}
   </div>
   <p style="margin:.3rem 0 .2rem"><b>Your monster</b> <span class="small muted">(tap to choose)</span></p>
   <div class="monpick">${pool.map(k=>`<button class="${UI.mon===k?'on':''}" data-mon="${k}" title="${esc(MONS[k].d)}">${monPic(k)}<span>${esc(MONS[k].n)}${MONS[k].x?' 🧠':''}</span></button>`).join('')}</div>
   <p class="small muted" style="margin:.2rem 0">${esc(MONS[UI.mon].n)}: ${esc(MONS[UI.mon].d)}.</p>
   <details class="custom" ${UI.custOpen?'open':''}><summary>Customise ▸ <span class="small muted">rules, expansions, players, other ways to play</span></summary>
   <div class="row"><b>Game:</b>${[['base','Classic'],['trial','Brainjack Taster'],['exp','Brainjack Full Set']].map(([k,l])=>`<button class="btn ${xp===k?'on':''}" data-xp="${k}">${l}</button>`).join('')}</div>
   <p class="small muted" style="margin:.1rem 0 .3rem">${xp==='base'?'The classic game: best for a first game.':xp==='trial'?'Adds Brainjack tokens (steal another monster\'s roll), 3 new monsters and 24 new cards shuffled into the classic deck.':'Brainjack tokens and 3 new monsters, playing with only the 24 new cards.'}</p>
   <p style="margin:.35rem 0 .15rem"><b>Expansions</b> <span class="small muted">(tap to switch on or off)</span> <button class="btn mini" data-preset="none">None</button><button class="btn mini" data-preset="all">All</button></p>
   <div class="exps">${EXPS.map(e=>{const on=e.k==='evo'?UI.evo:!!UI.ex[e.k];return `<button class="ex ${on?'on':''}" data-exk="${e.k}"><b>${on?'✔':'＋'} ${esc(e.n)}</b><small>${esc(e.d)}</small></button>`}).join('')}</div>
   <div class="row"><b>Computer skill:</b>${[['easy','Easy'],['normal','Normal'],['hard','Hard']].map(([k,l])=>`<button class="btn ${UI.lvl===k?'on':''}" data-lvl="${k}">${l}</button>`).join('')}<span class="small muted">${UI.lvl==='hard'?'Thinks ahead about every reroll.':UI.lvl==='easy'?'Makes mistakes. Good for learning.':'A solid, fair opponent.'}</span></div>
   <div class="row"><b>Monsters:</b>${[2,3,4,5,6].map(k=>`<button class="btn ${UI.n===k?'on':''}" data-n="${k}">${k}</button>`).join('')}<span class="small muted">The Harbor (a second city space) opens with 5–6.</span></div>
   <div class="acts" style="margin-top:.6rem">
    <button class="btn" data-start="hot">Everyone on one screen<small>${UI.n} players take turns on this device.</small></button>
    <button class="btn" data-start="ai">Watch the computer play<small>A quick way to see the rules in action.</small></button>
   </div>${onlineBlock()}</details>
   <p class="small muted">The names, card text and art are original, for copyright reasons. The rules follow the published rulebook.</p></div>`}
function rulesHTML(){return `<div>
  <h3>Your turn in 5 steps</h3><ol><li><b>Roll</b> all dice. Keep any dice you like and reroll the rest, up to twice. You can reroll dice you kept earlier.</li>
  <li><b>Resolve</b>: three of a kind of 1, 2 or 3 scores that many stars, and each extra matching die adds 1. Energy gives 1 each. Hearts heal 1 each, but only outside the city (max 10). Claws smash.</li>
  <li><b>City</b>: from the city (Downtown or the Harbor) your claws hit every monster outside. From outside, they hit every monster in the city. When smashed by dice, a city monster may <b>yield</b>. It still takes the damage, and the smasher moves in. If Downtown is empty, you must move in (+1 star). With 5–6 monsters, if Downtown is taken and the Harbor is empty, you move into the Harbor.</li>
  <li><b>Buy</b> power cards with energy. <b>New cards (2 ⚡)</b> throws the three cards for sale away and deals three fresh ones. <b>ONE-SHOT</b> cards happen at once, <b>PERMANENT</b> cards stay with you, <b>SAVE FOR LATER</b> cards wait for their moment.</li>
  <li><b>End of turn</b> effects happen, then the next monster goes.</li></ol>
  <h3>The city</h3><p><b>👑</b> marks the monster in Downtown. Starting your turn in the city scores 2 stars. You cannot heal with hearts there, and everyone outside is hitting you. When only four monsters remain, the Harbor closes.</p>
  <h3>Brainjack expansion</h3><ul><li><b>Brainjack tokens</b>: every monster starts with 1. When another monster finishes rolling, you may spend one to resolve its dice as if they were yours. You then do your own Enter and Buy steps, and the Brainjacked monster rolls again from scratch.</li>
  <li><b>Consumable</b> cards: you keep them until the moment their keyword applies, use them once, then discard them. You are asked automatically when you can use one.</li>
  <li><b>Keywords</b>: ${Object.entries(KWHELP).map(([k,v])=>`<b>${KWN[k].toUpperCase()}</b>: ${esc(v)}`).join(' ')}</li>
  <li><b>Evolutions</b> (optional): each monster has 8. Start with one of two; whenever you resolve three or more hearts (even in the city), look at two more and keep one. <b>Permanent</b> ones stay in play; <b>temporary</b> ones are used once. Some are played from your hand at a special moment: you get a pop-up when you can.</li>
  <li><b>Taster</b> mixes the 24 new cards into the classic deck. <b>Full Set</b> uses only the new cards.</li></ul>
  <h3>More expansions (switch them on at the start)</h3><ul>${EXPS.filter(e=>e.k!=='evo').map(e=>`<li><b>${esc(e.n)}</b>: ${esc(e.d)}</li>`).join('')}</ul>
  <h3>Online play</h3><p class="small">On the start screen press <b>Host a game</b> and share the invite code. Friends open this same page (share it with them as Contributors or Editors first), type the code and press <b>Join a game</b>. The host's page runs the game. If the host leaves, the player in the lowest seat takes over automatically from the last calm moment (at worst, the current roll is replayed). Empty seats are filled with computer monsters, and if someone drops out the computer takes over their monster until they come back.</p>
  <h3>Keyboard shortcuts</h3><p class="small"><b>R</b> reroll · <b>Space</b> resolve / end turn · <b>1–8</b> keep a die · <b>H</b> suggest dice · <b>P</b> pause the computer</p>
  <h3>Winning</h3><p>Reach <b>20 stars</b> and survive your turn, or be the last monster standing. If everyone falls at once, nobody wins.</p>
  <h3>About this version</h3><p class="small">All 66 classic cards, the 24 Brainjack cards, 72 evolutions, 12 costumes, 24 curses and 10 menace tiles follow the published cards, with new names and wording.</p>
  <h3>Credits</h3><p class="small">Names, card text and art are original.</p><section class="credits-audio"><h4>Audio</h4><ul class="small"><li>Art and music by Am015-dev</li></ul><p class="small"><small>All sounds were trimmed, loudness-normalised and converted to MP3 for this game.</small></p></section>
  <div class="acts"><button class="btn primary" data-gx="close">Got it</button></div></div>`}

function render(){if(isHost())netPush();if(G&&G.winner&&UI.wonSnd!==G.gid){UI.wonSnd=G.gid;snd('win');if(ANIM){UI.statsT=setTimeout(()=>{UI.stats=true;render()},2600)}}if(V3.on)sync3D();else renderMap();renderScore();renderPanel();renderModal();
  if(window.GX&&GX.app&&G&&!G.winner&&!UI.info&&humanTurn()&&UI.dockTurn!==G.tid+':'+G.active){UI.dockTurn=G.tid+':'+G.active;GX.showDock()}}
const SPEEDS=[['slow',1300],['normal',650],['fast',260]];
function setSpeed(k){UI.speed=k;AIDELAY=SPEEDS[k][1];const b=document.getElementById('speedbtn');if(b)b.innerHTML='⏩ Speed: '+SPEEDS[k][0][0].toUpperCase()+SPEEDS[k][0].slice(1)+'<small>How fast the computer plays (tap to change)</small>';try{localStorage.setItem('ccs_speed',k)}catch(e){}}

// ---------- events ----------
document.addEventListener('click',e=>{
  if(e.target.closest('[data-help]'))return;   // help-kit buttons (the rules overlay carries data-card) never act on the game
  const t=e.target.closest('[data-emo],[data-a],[data-act],[data-die],[data-card],[data-opt],[data-start],[data-tour],[data-n],[data-mon],[data-xp],[data-evo],[data-exk],[data-lvl],[data-preset],g.seat');if(!t)return;
  const ds=t.dataset;if(t.tagName==='BUTTON'&&!t.disabled&&!ds.a)snd('click');
  if(ds.n){UI.n=+ds.n;saveSetup();render();return}
  if(ds.mon!==undefined){UI.mon=+ds.mon;saveSetup();if(NET.on&&NET.room)NET.room.presence({mon:UI.mon}).catch(()=>{});render();return}
  if(ds.xp){UI.xp=ds.xp;saveSetup();render();return}
  if(ds.evo!==undefined){UI.evo=ds.evo==='1';render();return}
  if(ds.exk){if(ds.exk==='evo')UI.evo=!UI.evo;else UI.ex[ds.exk]=!UI.ex[ds.exk];saveSetup();render();return}
  if(ds.preset){const on=ds.preset==='all';UI.evo=on;EXPS.forEach(x=>{if(x.k!=='evo')UI.ex[x.k]=on});saveSetup();render();return}
  if(ds.lvl){UI.lvl=ds.lvl;saveSetup();render();return}
  if(ds.start){const k=ds.start;UI.info=false;
    if(k==='load'){G=load();if(!saveOK(G)){G=null;try{localStorage.removeItem(SAVE)}catch(e){}render();return}if(!G.gid)G.gid=Math.random();G.xq=G.xq||[];G.log=G.log||[];G.tf=Object.assign(tfBase(),G.tf||{});G.disc=G.disc||[];G.curseDeck=G.curseDeck||[];G.curseDisc=G.curseDisc||[];G.tower=G.tower||[-1,-1,-1];G.pl.forEach(q=>{q.tok=q.tok||{};q.hand=q.hand||[];q.edeck=q.edeck||[];q.edisc=q.edisc||[];q.mb=q.mb||0;q.cult=q.cult||0;q.wk=q.wk||0;q.dmod=q.dmod||0;q.stats=q.stats||{dmg:0,stars:0,cards:0,city:0,kos:0}});G.revealed=G.revealed||[];UI.choice=null;UI.busy=false;UI.pending=null;UI.fx={};if(G.phase==='start')G.dice=[];if(G.phase==='end'){G.phase='buy';G.step=4}if(G.phase==='resolve'||G.phase==='start'){G.phase='roll';G.step=1}fixRoll();refresh()}
    else{let toured=false;try{toured=!!localStorage.getItem(TOUR);localStorage.setItem(TOUR,'1')}catch(x){}UI.firstGame=!toured&&k==='solo';UI.intro=true;UI.adv=false;UI.coach=-1;UI.freeze=false;UI.tour=false;UI.tipSeen={};newGame(k)}return}
  if(ds.tour){tourClick(ds.tour);return}
  if(ds.emo){sendEmote(ds.emo);return}
  if(ds.a==='story'){UI.intro=false;render();if(typeof schedule==='function')schedule();return}
  if(ds.a==='advise'){UI.adv=!UI.adv;renderAdvice();return}
  if(ds.a){if(ds.a==='nethost'){netJoin('host',newCode());return}if(ds.a==='netjoin'){const v=(document.getElementById('joincode')||{}).value;netJoin('client',v);return}if(ds.a==='netstart'){netStart();return}if(ds.a==='netleave'){netLeave();return}if(ds.a==='netcopy'){netCopy();return}
    if(ds.a==='new'&&NET.on){UI.stats=false;if(isHost()){G=null;NET.inLobby=true;netPush(true)}else NET.inLobby=true;render();return}
    if(ds.a==='new'){UI.info=true;UI.choice=null;UI.intro=false;UI.coach=-1;UI.adv=false;if(GX.open)GX.close();render()}else if(ds.a==='rules'){GX.show('dr-rules')}else if(ds.a==='speed')setSpeed((UI.speed+1)%3);else if(ds.a==='snd')toggleSound();else if(ds.a==='pause'){UI.paused=!UI.paused;const b=document.getElementById('pausebtn');if(b)b.innerHTML=UI.paused?'<span>▶ Resume</span>':PAUSEHTML;render();schedule()}else if(ds.a==='closestats'){UI.stats=false;render()}else if(ds.a==='hints'){UI.hints=!UI.hints;const b=document.getElementById('hintbtn');if(b)b.innerHTML='Dice outlines: '+(UI.hints?'on':'off')+'<small>Blue dashed outlines on the dice worth keeping</small>';render()}else if(ds.a==='mus')toggleMusic();else if(ds.a==='gfx'&&typeof cycleGfx==='function')cycleGfx();return}
  if(t.classList.contains('seat')&&G){seatInfo(+ds.seat);return}
  if(ds.act==='again'&&NET.on){t.dataset.a='new';document.querySelector('[data-a="new"]')&&0;UI.stats=false;if(isHost()){G=null;NET.inLobby=true;netPush(true)}else NET.inLobby=true;render();return}
  uiAct({act:ds.act,die:ds.die,card:ds.card,opt:ds.opt,cid:ds.opt!==undefined&&UI.choice&&UI.choice.cid!==undefined?UI.choice.cid:undefined});});
function c0Remote(){const c=UI.choice;return c&&!c.net&&c.who!==undefined&&c.who!==NET.mySeat}
function gameAct(ds,seat){
  if(ds.opt!==undefined){const c=UI.choice;if(!c)return;if(ds.cid!==undefined&&c.cid!==undefined&&String(c.cid)!==String(ds.cid))return;if(NET.on&&c.who!==undefined&&c.who!==seat)return;if(ds.opt==='x'&&!c.cancel)return;UI.choice=null;if(ds.opt==='x'){refresh();return}c.cb(ds.opt);if(!UI.choice)refresh();return}
  if(false){const p=null,hidden=0;
    UI.choice={title:mname(p),text:`${MONS[p.m].d}. ${p.alive?`${p.hp}/${maxhp(p)} hearts, ${p.vp} stars, ${p.en} energy${mbOn()?`, ${p.mb} Brainjack token${p.mb===1?'':'s'}`:''}, in ${where(p.i)}.`:'Knocked out.'} Cards: ${p.cards.length?p.cards.map(c=>CARDS[base(c)].n+' ('+CARDS[base(c)].x+')').join(' · '):'none'}.${p.evo.length?' Evolutions in play: '+p.evo.map(e=>evoName(e)+' ('+evoText(e)+')').join(' · ')+'.':''}${p.hand.length?` ${p.hand.length} evolution card${p.hand.length===1?'':'s'} in hand${hidden?' (hidden)':': '+p.hand.map(evoName).join(', ')}.`:''}`,options:[],cancel:true};render();return}
  if(!G||G.winner&&ds.act!=='again')return;
  if(ds.act==='again'){UI.info=true;render();return}
  if(!(isHuman(G.active)&&(!NET.on||G.active===seat))||UI.choice||UI.busy)return;
  if(ds.die!==undefined&&G.phase==='roll'){const d=G.dice[+ds.die];d.k=!d.k;render();return}
  const p=cur();
  if(ds.card!==undefined&&G.phase==='buy'){buy(+ds.card);return}
  const act=ds.act||'';
  switch(act){
    case 'reroll':if(G.rolls>0)doReroll('roll');break;
    case 'resolve':if(G.phase==='roll')resolve();break;
    case 'hint':{const m=suggestMask(p);G.dice.forEach((d,k)=>d.k=!!m[k]);const nk=m.filter(x=>x).length;UI.banner=nk?`💡 Kept the ${nk} outlined ${nk===1?'die':'dice'} (now yellow). Reroll the rest, or tap any die to change it.`:'💡 Nothing here is worth keeping: reroll all the dice.';render();break}
    case 'sweep':if(G.phase==='buy')sweep();break;
    case 'end':if(G.phase==='buy')endTurn();break;
    default:if(act&&actionsFor(p).some(a=>a.a===act&&!a.dis))doAct(p,act);
  }}
document.addEventListener('keydown',e=>{
  if(e.target&&/INPUT|TEXTAREA/.test(e.target.tagName))return;
  if(e.key==='p'||e.key==='P'){document.querySelector('[data-a="pause"]')?.click();return}
  if(!G||G.winner||UI.choice||UI.info||UI.rules||UI.intro||!humanTurn())return;const click=sel=>{const b=document.querySelector(sel);if(b&&!b.disabled){b.click();e.preventDefault()}};
  if(G.phase==='roll'){if(e.key==='r'||e.key==='R')click('[data-act="reroll"]');else if(e.key===' '||e.key==='Enter')click('[data-act="resolve"]');else if(e.key==='h'||e.key==='H')click('[data-act="hint"]');else if(/^[1-9]$/.test(e.key))click(`[data-die="${+e.key-1}"]`)}
  else if(G.phase==='buy'&&(e.key===' '||e.key==='Enter'||e.key==='e'||e.key==='E'))click('[data-act="end"]')});
function saveSetup(){try{localStorage.setItem('ccs_setup',JSON.stringify({ex:UI.ex,evo:UI.evo,lvl:UI.lvl,xp:UI.xp,n:UI.n,mon:UI.mon}))}catch(e){}}
try{const st=JSON.parse(localStorage.getItem('ccs_setup')||'null');if(st){Object.assign(UI.ex,st.ex||{});if(st.evo!==undefined)UI.evo=st.evo;if(st.lvl)UI.lvl=st.lvl;if(st.xp)UI.xp=st.xp;if(st.n)UI.n=st.n;if(Number.isInteger(st.mon))UI.mon=st.mon}}catch(e){}
function suggestMask(p){const key=G.rollId+':'+G.rolls+':'+G.dice.map(d=>d.f).join('');if(UI.sugKey===key)return UI.sugMask;const saved=G.dice.map(d=>d.k);aiMarkHard0(p);const m=G.dice.map(d=>d.k);G.dice.forEach((d,k)=>d.k=saved[k]);UI.sugKey=key;UI.sugMask=m;return m}
// a pair of numbers scores nothing: say so while there is still a reroll to chase the third
function pairNote(dice){if(G.rolls<=0)return '';const c=countsOf(dice.filter(d=>!d.t));const pr=['1','2','3'].filter(f=>c[f]===2);if(!pr.length||['1','2','3'].some(f=>c[f]>=3))return '';return ` <span class="pairnote">A pair of ${pr.join('s or ')}s scores nothing: numbers need three of a kind.</span>`}
function exIcons(p){let s='';if(p.tok&&p.tok.poison)s+=' ☠'+p.tok.poison;if(p.tok&&p.tok.shrink)s+=' 🔻'+p.tok.shrink;if(exOn('curse')&&scarab()===p.i)s+=' 🪲';if(exOn('cult')&&p.cult)s+=' 🕯'+p.cult;if(exOn('wick'))s+=' 😈'+p.wk;if(exOn('tower')){const t=G.tower.filter(o=>o===p.i).length;if(t)s+=' 🗼'+t}if(p.tok&&p.tok.berserk)s+=' 😡';return s}
try{const sp=localStorage.getItem('ccs_speed');if(sp!==null)setSpeed(+sp)}catch(e){}
function seatInfo(k){if(!G||UI.info)return;renderScore();GX.show('dr-mons');const el=document.getElementById('mon-'+k);if(el){el.scrollIntoView({block:'nearest'});el.classList.remove('flash');void el.offsetWidth;el.classList.add('flash')}}
// ---------- board-first shell: popups for everything that is not "what to do now" ----------
GX.init({key:'ccs'});
GX.drawer('dr-market','Power cards for sale',document.getElementById('marketwrap'),true);
GX.drawer('dr-mine','Your cards',document.getElementById('minewrap'));
GX.drawer('dr-mons','Monsters',document.getElementById('monswrap'));
GX.drawer('dr-log','The Crown City Clarion',document.getElementById('logwrap'));
GX.drawer('dr-rules','How to play',document.getElementById('ruleswrap'),true);
GX.drawer('dr-menu','Menu',document.getElementById('menuwrap'));
const PAUSEHTML=(document.getElementById('pausebtn')||{}).innerHTML||'Pause';
document.getElementById('rulesbody').innerHTML=rulesHTML();
// reading the rules pauses the computer, as the old rules dialog did
GX.onShow=id=>{const was=UI.rules;UI.rules=id==='dr-rules';if(was&&!UI.rules&&typeof schedule==='function')schedule()};
GX.onClose=id=>{if(id==='dr-rules'){UI.rules=false;if(typeof schedule==='function')schedule()}};
// ---- 3D start-up that can never block the menu (iPhone: a slow or failing GPU must not stop the game) ----
// The menu is drawn first; 3D starts after the first paint (or at once when a game starts). If it throws, is missing or the
// GPU is lost later, the game drops to the flat 2D board and goes on.
const BOOT3={done:false};
function flat3(why){try{if(V3.r){try{V3.r.dispose()}catch(_){}try{V3.r.forceContextLoss()}catch(_){}}}catch(_){}V3.on=false;document.body.classList.remove('three');document.body.classList.add('flat3');console.warn('3D off, flat board:',why);try{gfxLabel()}catch(_){}try{render()}catch(e){console.error(e)}}
function boot3D(){if(BOOT3.done)return;BOOT3.done=true;let ok=false;
  try{ok=init3D()}catch(e){console.warn('3D init failed',e);flat3('init failed');return}
  if(ok){const cv3=document.getElementById('c3');if(cv3)cv3.addEventListener('webglcontextlost',e=>{e.preventDefault();flat3('context lost')},false)}
  try{if(typeof gfxLabel==='function')gfxLabel()}catch(_){}try{render()}catch(e){console.error(e)}}
{const _ng=newGame;newGame=function(){try{boot3D()}catch(e){}return _ng.apply(this,arguments)}}
if(typeof soundBtns==='function')soundBtns();if(typeof gfxLabel==='function')gfxLabel();
{const b=document.getElementById('speedbtn');if(b&&!/Speed/.test(b.textContent))b.innerHTML='⏩ Speed: '+SPEEDS[UI.speed][0][0].toUpperCase()+SPEEDS[UI.speed][0].slice(1)+'<small>How fast the computer plays (tap to change)</small>';const h=document.getElementById('hintbtn');if(h)h.innerHTML='Dice outlines: '+(UI.hints?'on':'off')+'<small>Blue dashed outlines on the dice worth keeping</small>'}
renderLegend();render();
{const go=()=>setTimeout(boot3D,40);if(window.requestAnimationFrame)requestAnimationFrame(go);else go();setTimeout(boot3D,2500);window.addEventListener('load',()=>boot3D())}
