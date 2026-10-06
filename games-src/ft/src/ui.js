// ---------- UI: the bazaar IS the screen. Tap a tile, tap where its people go, watch it happen. ----------
// Layout: seat chips (scores) on top, one short line, the bazaar grid + the goods row + the djinn row (the table), then the buttons.
// Everything that changes on screen is drawn from G by render(); ui2.js animates the difference between two renders.
const $=s=>document.querySelector(s);const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const PCOL=['#2b2b33','#119e98','#ff4fa3','#8b5a2b','#6d7b8d'];const MCSS={vizier:'#f2c230',elder:'#f4f1ea',merchant:'#3fa34d',builder:'#2f6fd6',assassin:'#d23a2e',artisan:'#9a5bd0'};
const TSHORT={village:'Hamlet',sacred:'Shrine',oasis:'Oasis',small:'Stall',large:'Bazaar',workshop:'Workshop',exchange:'Exchange',ravine:'Ravine',lake:'Lake',city:'City'};
const TICON={village:'🏘️',sacred:'🕌',oasis:'💧',small:'🧺',large:'🏪',workshop:'🔨',exchange:'🌶️',ravine:'⛰️',lake:'🌊',city:'🏛️'};
Object.assign(UI,{pendDj:null,pendItem:null,chz:null,mkSel:[],sellSel:[],fxSeen:0,hurry:false,pick:[],pickSeat:[],pickMk:[],pickDj:[],pickSpot:[],snap:null,autoMove:null,autoMs:650,modal:null,moveSnap:null,moveSteps:null});
function refresh(){if(G&&!(typeof NET!=='undefined'&&NET.on)){try{if(!G.over&&!G.pl.every(p=>!p.human))localStorage.setItem(SAVE,JSON.stringify(G));else if(G.over)localStorage.removeItem(SAVE)}catch(e){}}
  if(!G)return;playFx();try{render()}catch(e){console.error(e)}schedule();if(typeof NET!=='undefined'&&NET.on){if(isHost())netPush();netTurnCheck()}}
function playFx(){for(const f of UI.fx.slice(UI.fxSeen)){const m={pick:'pick',drop:'drop',take:'take',camel:'camel',coins:'coins',res:'take',kill:'kill',djinn:'djinn',build:'build',bid:'bid',round:'round',win:'win',thief:'kill',item:'djinn'}[f.t];if(m&&typeof sfx==='function')sfx(m)}UI.fxSeen=UI.fx.length;if(UI.fx.length>30){UI.fx.splice(0,20);UI.fxSeen=UI.fx.length}}
const online=()=>typeof NET!=='undefined'&&NET.on;
const me=()=>{if(!G)return null;const s=sideToAct();if(online()&&s!==NET.mySeat)return null;return s>=0&&P(s).human?P(s):null};
const mySeatP=()=>online()?(NET.mySeat>=0?P(NET.mySeat):null):null;
// online, a rival's Crafter items are face down: their points stay hidden until the end
function shownTotal(p){const s=scoreOf(p);return online()&&!G.over&&p.i!==NET.mySeat?s.total-s.items:s.total}
function human(){return G&&G.pl.some(p=>p.human)}
function viewP(){if(!G)return null;return online()?mySeatP():(me()||G.pl.find(p=>p.human)||null)}
function seatName(p){const hs=G.pl.filter(x=>x.human);const you=online()?p.i===NET.mySeat:(p.human&&hs.length===1);return you?'You':p.nm}
const words=s=>String(s).replace(/<[^>]*>/g,' ').split(/\s+/).filter(Boolean);
// ---------- what glows ----------
function qBoardTile(o){const d=o.d||{};if(o.h==='flute')return d.j;if(o.h==='scim')return d.tile;return null}
function computePick(){UI.pick=[];UI.pickSeat=[];UI.pickMk=[];UI.pickDj=[];UI.pickSpot=[];const p=me();if(!p)return;const vm=validMoves(p.i);
  if(G.q){const s=new Set();for(const o of G.q.opts){const t=qBoardTile(o);if(t!=null)s.add(t)}UI.pick=[...s];return}
  if(UI.pendDj){UI.pick=[...new Set(vm.filter(m=>m.act==='djinn'&&m.k===UI.pendDj.k&&same(m.pay,UI.pendDj.pay)&&m.t>=0).map(m=>m.t))];return}
  if(UI.pendItem){const it=UI.pendItem;const ms=vm.filter(m=>m.act==='item'&&m.k===it.k);
    if(it.k==='flute')UI.pick=[...new Set(ms.map(m=>m.t))];else if(it.k==='talisman')UI.pick=[...new Set(it.from==null?ms.map(m=>m.from):ms.filter(m=>m.from===it.from).map(m=>m.to))];return}
  if(G.phase==='bid'){UI.pickSpot=vm.filter(m=>m.act==='bid').map(m=>m.spot);return}
  if(G.step==='move'){if(!G.move)UI.pick=[...new Set(vm.filter(m=>m.act==='start').map(m=>m.tile))];else UI.pick=[...new Set(vm.filter(m=>m.act==='step').map(m=>m.tile))];return}
  if(G.step==='tribe'&&G.act.color==='assassin'){const ks=vm.filter(m=>m.act==='tribe'&&m.kill);UI.pick=[...new Set(ks.filter(m=>m.kill.tile!=null).map(m=>m.kill.tile))];UI.pickSeat=[...new Set(ks.filter(m=>m.kill.pl!=null).map(m=>m.kill.pl))];return}
  if(G.step==='tile'){const tm=vm.filter(m=>m.act==='tile');const pl=[...new Set(tm.filter(m=>m.place!=null).map(m=>m.place))];if(pl.length>1)UI.pick=pl;
    UI.pickDj=[...new Set(tm.filter(m=>m.dj).map(m=>m.dj))].concat([...new Set(tm.filter(m=>m.thief).map(m=>'t:'+m.thief))]);
    const tk=tm.filter(m=>m.take);if(tk.length){const sel=UI.mkSel;const js=new Set();for(const m of tk){if(sel.length===0||m.take.includes(sel[0])){for(const j of m.take)if(!sel.includes(j))js.add(j)}}UI.pickMk=[...js]}}}
// ---------- the one short line ----------
function qLine(q){return {claim:'Camel or tent?',item:'Keep which item?',djinn:'Pick a djinn',flute:'Pull a person over',kill:'Remove a person',thief:'Take your prize'}[q.kind]||words(q.title).slice(0,6).join(' ')}
function lineText(){if(!G)return '';if(G.over)return `${G.winner.split(' & ').slice(0,2).join(' & ')} ${G.over.win.length>1?'share':'wins'}`;
  const s=sideToAct(),p=s>=0?P(s):null;if(!p)return '';const hp=me();
  if(!hp){const nm=seatName(p);if(online()&&p.human)return `Waiting for ${nm}`;if(G.q)return `${nm} is choosing`;if(G.phase==='bid')return `${nm} is bidding`;return `${nm} is ${{move:G.move?'moving':'choosing',tribe:'collecting',tile:'acting',sell:'finishing'}[G.step]||'playing'}`}
  if(G.q)return qLine(G.q);if(UI.pendDj||UI.pendItem)return 'Tap a glowing tile';
  if(G.phase==='bid'){const two=hp.markers>1;return two?`Bid ${Math.min(2,G.bids.filter(b=>b.mk.p===hp.i).length+1)} of 2: pick a spot`:'Pick your turn-order spot'}
  switch(G.step){
  case 'move':return !G.move?'Tap a glowing tile to start':G.move.hand.length===1?'Last one: land on its colour':'Tap a glowing tile to drop one';
  case 'tribe':return {assassin:'Tap who to remove',builder:'Masons earn coins',merchant:'Traders fetch goods',vizier:'Advisors join you',elder:'Sages join you',artisan:'Crafters join you'}[G.act.color]||'';
  case 'tile':{const t=G.board[G.act.tile];return {village:'A palace rises here',oasis:'A palm grows here',sacred:'Tap a djinn to summon',small:'Buy a good for 3🪙',large:'Buy two goods for 6🪙',exchange:'Buy a good for 4🪙',workshop:'Commission an item?'}[t.k]||'Nothing to do here'}
  case 'sell':return 'Sell goods or end turn'}
  return ''}
// ---------- seats (the score race) ----------
function pip(c,n){return n?`<span class="pp" title="${esc(MPLUR[c])}"><i class="mp sm" data-c="${c}"></i>${n}</span>`:''}
function seatHtml(p){const a=sideToAct()===p.i&&!G.over;const kill=UI.pickSeat.includes(p.i);const nm=seatName(p);
  return `<div class="sch ${a?'actnow':''} ${kill?'glow':''}" data-seat="${p.i}" style="--pc:${PCOL[p.i]}" aria-label="${esc(nm)}, score ${shownTotal(p)}">
   <b class="sn">${esc(nm)}${!p.human?'<small>cpu</small>':''}</b><b class="ss">★${shownTotal(p)}</b>
   <span class="s2"><span class="st">🪙${p.coins}</span><span class="st">🐪${p.camels}</span>${p.tent?'<span class="st">⛺</span>':''}</span>
   <span class="s3">${pip('vizier',p.vz)}${pip('elder',p.el)}${G.ex.artisans?pip('artisan',p.art):''}${p.fk?`<span class="pp">🔮${p.fk}</span>`:''}${p.res.length?`<span class="pp">🧺${p.res.length}</span>`:''}${p.dj.length?`<span class="pp">🧞${p.dj.length}</span>`:''}</span></div>`}
function renderSeats(){const el=$('#seats');if(!el)return;const h=G.pl.map(seatHtml).join('');el.dataset.n=G.pl.length;el.innerHTML=h}
// ---------- the bazaar ----------
function mpHtml(c,h){return `<i class="mp${h?' h':''}" data-c="${c}"></i>`}
function tileHtml(t){const d=TILEDEF[t.k],i=t.i;
  if(t.block)return `<div class="tile blk k-${t.k}" data-tile="${i}" aria-label="${esc(d.n)}"><i class="ti">${TICON[t.k]}</i><span class="tn">${TSHORT[t.k]}</span></div>`;
  const mv=G.move,cur=!!mv&&mv.at===i,glow=UI.pick.includes(i),own=owner(t);const hand=cur?mv.hand:[];const n=t.m.length+hand.length;
  const cls=['tile',t.blue?'blue':'red','k-'+t.k,glow?'glow':'',cur?'cur':'',own!=null?'owned':''].filter(Boolean).join(' ');
  return `<div class="${cls}" data-tile="${i}" data-n="${n}" role="button" style="${own!=null?'--oc:'+PCOL[own]:''}" aria-label="${esc(tileName(t))}">
   <i class="ti">${TICON[t.k]}</i><span class="tn">${TSHORT[t.k]}</span>${t.v?`<b class="tv">${t.v}</b>`:''}<i class="tc">${tileCoord(i)}</i>
   <div class="ms">${t.m.map(c=>mpHtml(c)).join('')}${hand.map(c=>mpHtml(c,1)).join('')}</div>
   <div class="tk">${own!=null?`<b class="own" style="--pc:${PCOL[own]}">${t.tent!=null?'⛺':'🐪'}</b>`:''}${t.palm?`<span class="tok">🌴${t.palm>1?'<small>×'+t.palm+'</small>':''}</span>`:''}${t.pal?`<span class="tok">🏰${t.pal>1?'<small>×'+t.pal+'</small>':''}</span>`:''}</div></div>`}
function renderGrid(){const g=$('#grid');if(!g)return;g.style.setProperty('--W',G.W);g.style.setProperty('--H',G.H);g.classList.toggle('dim',UI.pick.length>0);g.innerHTML=G.board.map(tileHtml).join('')}
function renderMarket(){const el=$('#mkt');if(!el)return;const tk=G.step==='tribe'&&G.act&&G.act.color==='merchant'&&G.phase==='turn'?G.act.n:0;
  let h='<div class="mrow" aria-label="Goods market">';for(let j=0;j<9;j++){const r=G.market[j];
    h+=r?`<button class="mcard ${UI.pickMk.includes(j)?'glow':''} ${UI.mkSel.includes(j)?'sel':''} ${j<tk?'mtake':''}" data-mk="${j}" aria-label="${esc(RNAME[r])}"><span class="mi">${RICON[r]}</span></button>`:'<span class="mcard empty"></span>'}
  h+='</div><div class="drow" aria-label="Djinns">'+G.djRow.map(k=>`<button class="dcard ${UI.pickDj.includes(k)?'glow':''}" data-dj="${k}" aria-label="${esc(DJ[k].n)}"><b>${esc(DJ[k].n)}</b><span class="dv">${DJ[k].vp}</span></button>`).join('')
   +(G.ex.thieves?G.thRow.map(k=>`<button class="dcard th ${UI.pickDj.includes('t:'+k)?'glow':''}" data-th="${k}" aria-label="${esc(THIEVES[k].n)}"><b>🦹 ${esc(THIEVES[k].n.replace(' Cutpurse',''))}</b></button>`).join(''):'')+'</div>';
  if(el.dataset.h!==h){el.innerHTML=h;el.dataset.h=h}}
// ---------- buttons under the table ----------
const mvAttr=m=>esc(JSON.stringify(m));
function abtn(m,label,cls){return `<button class="ab ${cls||''}" data-mv='${mvAttr(m)}'>${label}</button>`}
function shortOpt(l){let t=String(l).replace(/\s*\(.*?\)/g,'').replace(/:.*$/,'').trim();const w=t.split(/\s+/);return w.length>6?w.slice(0,6).join(' '):t}
function trackHtml(hp,vm){const bm=vm.filter(m=>m.act==='bid');const done=new Set(G.bids.map(b=>b.spot));
  const ord=['1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th','11th','12th'];
  return `<div class="bidt" aria-label="Turn order">${G.track.map((t,s)=>{const b=G.bids.find(x=>x.spot===s);const mine=bm.filter(m=>m.spot===s);
    return `<div class="spot ${b?'taken':''}" style="${b?'--pc:'+PCOL[b.mk.p]:''}"><small class="ord">${ord[s]}</small>${mine.map(m=>`<button class="sp-b glow ${m.fk?'fkv':''}" data-mv='${mvAttr(m)}' aria-label="${t.cost} coins${m.fk?' with '+m.fk+' Mystic':''}">${m.fk?`<i>−${m.fk}🔮</i>${bidPrice(hp,s,m.fk)}🪙`:`${t.cost}🪙`}</button>`).join('')||`<span class="sp-c">${t.cost}🪙</span>`}${b?'<i class="mk"></i>':''}</div>`}).join('')}</div>`}
function powerChips(hp,vm){const pw=[...vm.filter(m=>m.act==='djinn'),...vm.filter(m=>m.act==='item')];if(!pw.length)return '';const seen=new Set();let h='';
  for(const m of pw){if(m.act==='djinn'){const key=m.k+JSON.stringify(m.pay);if(seen.has(key))continue;seen.add(key);const pay=(m.pay.el?m.pay.el+'●':'')+(m.pay.fk?m.pay.fk+'🔮':'');
      h+=m.t>=0?`<button class="ab pw${UI.pendDj&&same(UI.pendDj,{k:m.k,pay:m.pay})?' on':''}" data-pw='${mvAttr({k:m.k,pay:m.pay})}'>✨ ${esc(DJ[m.k].n)} <small>${pay}</small></button>`:abtn(m,`✨ ${esc(DJ[m.k].n)} <small>${pay}</small>`,'pw')}
    else{const key='i'+m.k+(m.dj||'');if(seen.has(key))continue;seen.add(key);
      if(m.k==='flute'||m.k==='talisman')h+=`<button class="ab pw${UI.pendItem&&UI.pendItem.k===m.k?' on':''}" data-pi="${m.k}">🪄 ${esc(ITEMS[m.k].n)}</button>`;else h+=abtn(m,`🪄 ${esc(ITEMS[m.k].n)}${m.dj?' → '+esc(DJ[m.dj].n):''}`,'pw')}}
  return `<div class="arow pws">${h}</div>`}
// builds the button area and sets UI.autoMove when the turn needs no decision from the player
function buildActs(){UI.autoMove=null;const hp=me();if(!G||G.over||!hp||UI.modal)return '';const vm=validMoves(hp.i);const by=a=>vm.filter(m=>m.act===a);let h='',main='';
  if(G.q){const q=G.q;main=q.opts.map((o,i)=>qBoardTile(o)!=null?(o.h==='noop'?'':''):abtn({act:'q',i},esc(shortOpt(o.l)),'')).join('');
    const done=q.opts.findIndex(o=>o.h==='noop');if(done>=0)main+=abtn({act:'q',i:done},'Done','go');return `<div class="arow">${main}</div>`}
  if(G.phase==='bid')return trackHtml(hp,vm);
  const pw=powerChips(hp,vm);
  switch(G.step){
  case 'move':if(G.move){const u=by('undo')[0];main=u?abtn(u,'↶ Put them back','ghost'):(UI.moveSnap&&G.move.drops.length?'<button class="ab ghost" data-ui="undodrop">↶ Undo last drop</button>':'')}break;
  case 'tribe':{const tr=by('tribe');const th=by('thief');const a=G.act;main=th.map(m=>abtn(m,`🦹 ${esc(THIEVES[m.k].n.replace(' Cutpurse',''))}`,'pw')).join('');
    if(a.color==='assassin'){if(tr[0]&&tr[0].none)main+=abtn(tr[0],'No target: carry on','go')}
    else if(a.color==='builder'&&tr.length>1){const blues=AROUND(a.tile).filter(i=>G.board[i].blue&&!G.board[i].block).length;main+=tr.map(m=>abtn(m,`Earn ${(a.n+(m.fk||0))*blues*(G.turnFx.qirsh?2:1)}🪙${m.fk?` +${m.fk}🔮`:''}`,m.fk?'':'go')).join('')}
    else if(tr[0]){const extras=vm.filter(m=>m.act!=='tribe').length;if(extras)main+=abtn(tr[0],'Collect ▶','go');else UI.autoMove=tr[0]}
    break}
  case 'tile':{const tm=by('tile');const t=G.board[G.act.tile];const pl=tm.filter(m=>m.place!=null);const skip=tm.find(m=>m.skip);const extras=vm.filter(m=>m.act!=='tile').length;
    if(pl.length===1&&!extras)UI.autoMove=pl[0];
    else if(pl.length>1||pl.length===1){/* choose by tapping a glowing tile */ if(pl.length===1)main+=abtn(pl[0],t.k==='village'?'🏰 Build here':'🌴 Plant here','go')}
    for(const m of tm.filter(m=>m.work))main+=abtn(m,m.work==='art'?'Pay 1 Crafter':'Pay 2 🔮','');
    if(skip&&!pl.length){if(tm.length===1&&!extras)UI.autoMove=skip;else main+=abtn(skip,'Skip','ghost')}
    break}
  case 'sell':{const kinds=[...new Set(hp.res)];UI.sellSel=UI.sellSel.filter(k=>kinds.includes(k));const end=by('end')[0];
    if(!kinds.length&&!vm.filter(m=>m.act!=='end').length&&end){UI.autoMove=end;break}
    if(UI.sellSel.length)main+=abtn({act:'sell',kinds:UI.sellSel.slice().sort()},`Sell +${sellValue(UI.sellSel.length)}🪙`,'');
    main+=abtn(end,'End turn ▶','go');break}}
  if(main)h+=`<div class="arow">${main}</div>`;return h+pw}
function renderActs(){const el=$('#acts');if(!el)return;const h=buildActs();if(el.dataset.h!==h){el.innerHTML=h;el.dataset.h=h}el.classList.toggle('empty',!h)}
function renderMine(){const el=$('#mine');if(!el)return;const hp=me();let h='';
  if(G&&!G.over&&hp&&!UI.modal&&!G.q&&G.phase==='turn'&&G.step==='sell'){const kinds=[...new Set(hp.res)];UI.sellSel=UI.sellSel.filter(k=>kinds.includes(k));
    h=kinds.map(k=>`<button class="gchip ${UI.sellSel.includes(k)?'on':''}" data-sell="${k}" aria-label="${esc(RNAME[k])}">${RICON[k]}${hp.res.filter(x=>x===k).length>1?'<small>×'+hp.res.filter(x=>x===k).length+'</small>':''}</button>`).join('')}
  if(el.dataset.h!==h){el.innerHTML=h;el.dataset.h=h}el.hidden=!h}
function renderLine(){const el=$('#line');if(!el)return;const t=lineText();if(el.textContent!==t)el.textContent=t;const hp=me();el.classList.toggle('mine',!!hp&&!G.over)}
function renderChrome(){const c=$('#pchip');if(c&&G){const s=sideToAct();const t=G.over?'Game over':`Round ${G.round}`+(online()?' · online':'');if(c.textContent!==t)c.textContent=t}
  const sb=$('#speedbtn');if(sb)sb.innerHTML=ICON('fast')+'<span>'+({0.5:'slow',1:'normal',3:'fast'}[UI.speed]||'normal')+'</span>'}
function render(){if(!G){renderModal();return}
  const prev=UI.snap&&UI.snap.seed===G.seed?UI.snap:null;if(me())UI.hurry=false;
  computePick();renderSeats();renderGrid();renderMarket();renderMine();renderActs();renderLine();renderChrome();renderPopups();renderModal();
  if(typeof fit==='function')fit();if(typeof animate==='function')animate(prev);UI.snap=snapState();
  autoStep();if(typeof placeChz==='function')placeChz();if(typeof placeFinger==='function')placeFinger();overCheck()}
function snapState(){return {seed:G.seed,tiles:G.board.map(t=>({m:t.m.slice(),hand:G.move&&G.move.at===t.i?G.move.hand.slice():[],camel:t.camel,tent:t.tent,palm:t.palm,pal:t.pal})),market:G.market.slice(),djRow:G.djRow.slice(),thRow:(G.thRow||[]).slice(),
  tot:G.pl.map(p=>shownTotal(p)),coins:G.pl.map(p=>p.coins),cur:G.cur,act:G.act?{color:G.act.color,tile:G.act.tile}:null,step:G.step,logN:G.logN}}
// steps that need no decision run by themselves after a short beat, so the player sees what happened
function autoStep(){clearTimeout(UI.autoT);UI.autoT=0;const m=UI.autoMove;UI.autoMove=null;UI.autoOn=!!m;if(!m||UI.pause)return;const key=G.logN+'|'+G.step+'|'+JSON.stringify(m);
  UI.autoT=setTimeout(()=>{UI.autoT=0;const hp=G&&!G.over&&!UI.modal?me():null;if(!hp||G.logN+'|'+G.step+'|'+JSON.stringify(m)!==key)return;if(!validMoves(hp.i).some(x=>same(x,m)))return;go(m)},ANIM?UI.autoMs/(UI.speed>1?UI.speed:1):0)}
function overCheck(){if(!G||!G.over||UI.overFor===G.seed)return;UI.overFor=G.seed;
  if(UI.camp&&typeof GXC!=='undefined'&&GXC.active&&GXC.active()){setTimeout(()=>{try{GXC.finish(G)}catch(e){console.error(e)}},ANIM?1600:0);return}
  setTimeout(()=>{if(G&&G.over&&!UI.modal){UI.modal='over';render()}},ANIM?1800:0)}
// ---------- input ----------
function pickChoose(anchor,opts){UI.chz={anchor,opts};render()}
function chzBtn(html,m,i){return {html,m}}
function onTile(i){const p=me();if(!p)return;if(UI.chz){const same=UI.chz.anchor&&UI.chz.anchor.tile===i;UI.chz=null;if(same)return render()}const vm=validMoves(p.i);const nope=()=>{const e=document.querySelector(`[data-tile="${i}"]`);if(e){e.classList.remove('nope');void e.offsetWidth;e.classList.add('nope')}render()};
  if(G.q){const os=G.q.opts.map((o,k)=>({o,k})).filter(x=>qBoardTile(x.o)===i);if(!os.length)return nope();
    if(os.length===1)return go({act:'q',i:os[0].k});
    return pickChoose({tile:i},os.map(x=>({html:mdotHtml((x.o.d||{}).c),m:{act:'q',i:x.k}})))}
  if(UI.pendDj){const m=vm.find(m=>m.act==='djinn'&&m.k===UI.pendDj.k&&same(m.pay,UI.pendDj.pay)&&m.t===i);UI.pendDj=null;if(m)return go(m);return render()}
  if(UI.pendItem){const it=UI.pendItem;const ms=vm.filter(m=>m.act==='item'&&m.k===it.k);
    if(it.k==='flute'){const m=ms.find(m=>m.t===i);UI.pendItem=null;if(m)return go(m);return render()}
    if(it.k==='talisman'){if(it.from==null){if(ms.some(m=>m.from===i)){it.from=i;return render()}UI.pendItem=null;return render()}const m=ms.find(m=>m.from===it.from&&m.to===i);UI.pendItem=null;if(m)return go(m);return render()}}
  if(G.step==='move'){if(!G.move){const m=vm.find(m=>m.act==='start'&&m.tile===i);if(m){UI.hurry=false;return go(m)}return nope()}
    const ok=vm.filter(m=>m.act==='step'&&m.tile===i);if(!ok.length)return nope();if(ok.length===1)return go(ok[0]);
    return pickChoose({tile:i},ok.map(m=>({html:mdotHtml(m.c),m})))}
  if(G.step==='tribe'&&G.act.color==='assassin'){const ks=vm.filter(m=>m.act==='tribe'&&m.kill&&m.kill.tile===i);if(!ks.length)return nope();if(ks.length===1)return go(ks[0]);
    return pickChoose({tile:i},ks.map(m=>({html:killChip(m.kill),m})))}
  if(G.step==='tile'){const m=vm.find(m=>m.act==='tile'&&m.place===i);if(m)return go(m)}
  nope()}
function mdotHtml(c){return `<i class="mp lg" data-c="${c}"></i>`}
function killChip(k){return mdotHtml(k.c)+(k.c2?mdotHtml(k.c2):'')+(k.fk?`<small>+${k.fk}🔮</small>`:'')}
function onSeat(i){const p=me();if(UI.chz&&UI.chz.anchor.seat===i){UI.chz=null;return render()}if(p&&UI.pickSeat.includes(i)){const ks=validMoves(p.i).filter(m=>m.act==='tribe'&&m.kill&&m.kill.pl===i);if(ks.length===1)return go(ks[0]);if(ks.length)return pickChoose({seat:i},ks.map(m=>({html:killChip(m.kill),m})))}
  UI.chz=null;GX.show('plrd');renderPopups()}
function onMarket(j){const p=me();const el=document.querySelector(`[data-mk="${j}"]`);const tm=p&&G.step==='tile'&&!G.q?validMoves(p.i).filter(m=>m.act==='tile'&&m.take):[];if(!tm.length){const r=G.market[j];return showTip(el,`<b>${RICON[r]} ${esc(RNAME[r])}</b>${r==='fakir'?'<br>Mystic: extra power':'<br>Different goods make sets'}`)}
  const one=tm.filter(m=>m.take.length===1&&m.take[0]===j);if(one.length)return go(one[0]);
  if(UI.mkSel.includes(j)){UI.mkSel=[];return render()}
  if(!UI.mkSel.length){if(tm.some(m=>m.take.includes(j))){UI.mkSel=[j];return render()}return}
  const a=UI.mkSel[0];const m=tm.find(m=>m.take.length===2&&m.take.includes(a)&&m.take.includes(j));UI.mkSel=[];if(m)return go(m);render()}
function onDjinn(k,th){const p=me();const ak=th?'t:'+k:k;if(UI.chz&&UI.chz.anchor.dj===ak){UI.chz=null;return render()}if(p&&G.step==='tile'&&!G.q){const tm=validMoves(p.i).filter(m=>m.act==='tile'&&(th?m.thief===k:m.dj===k));
    if(tm.length===1)return go(tm[0]);if(tm.length>1){UI.chz={anchor:{dj:ak},opts:tm.map(m=>({html:`<span class="paychip">${m.pay.el}● ${m.pay.fk?'+ 🔮':''}</span>`,m}))};return render()}}
  const d=DJ[k];showTip(document.querySelector(th?`[data-th="${k}"]`:`[data-dj="${k}"]`),th?`<b>${esc(THIEVES[k].n)}</b><br>${esc(THIEVES[k].x)}`:`<b>${esc(d.n)}</b> · ${d.vp} points<br>${esc(d.x)}`)}
function go(m){UI.chz=null;UI.mkSel=[];UI.pendDj=null;UI.pendItem=null;clearTimeout(UI.autoT);if(online()&&isClient()){netSend(m);return}const s=sideToAct();const hu=s>=0&&P(s).human;const mine=!online()||s===NET.mySeat;
  if(hu&&m.act==='start'){UI.moveSnap=JSON.stringify(G);UI.moveSteps=[m]}else if(hu&&m.act==='step'&&UI.moveSteps)UI.moveSteps.push(m);else if(m.act!=='djinn'&&m.act!=='item')UI.moveSnap=null;
  if(hu&&mine&&typeof fingerUsed==='function')fingerUsed(m);
  const r=performMove(m,s);if(G&&!G.move)UI.moveSnap=G.step==='move'?UI.moveSnap:null;
  if(!r.success&&mine){toast('Not allowed now');console.error(r.error)}}
function toast(t){const el=$('#line');if(!el)return;el.textContent=t;clearTimeout(UI.tt);UI.tt=setTimeout(()=>{if(G)renderLine()},1800)}
document.addEventListener('click',e=>{const b=e.target.closest('button,[data-tile],[data-seat],input[type=checkbox]');if(!b)return;const d=b.dataset;
  if(d.chz!=null){const c=UI.chz;if(c&&c.opts[+d.chz])go(c.opts[+d.chz].m);return}
  if(d.mv){const m=JSON.parse(d.mv);if(m.ui)return uiAct(m.ui);if(m.act==='sell')UI.sellSel=[];if(typeof sfx==='function')sfx('click');return go(m)}
  if(d.tile!=null)return onTile(+d.tile);
  if(d.seat!=null)return onSeat(+d.seat);
  if(d.mk!=null)return onMarket(+d.mk);
  if(d.dj)return onDjinn(d.dj,false);if(d.th)return onDjinn(d.th,true);
  if(d.sell){const i=UI.sellSel.indexOf(d.sell);if(i>=0)UI.sellSel.splice(i,1);else UI.sellSel.push(d.sell);render();return}
  if(d.pw){const w=JSON.parse(d.pw);UI.pendDj=UI.pendDj&&same(UI.pendDj,w)?null:w;UI.pendItem=null;render();return}
  if(d.pi){UI.pendItem=UI.pendItem&&UI.pendItem.k===d.pi?null:{k:d.pi};UI.pendDj=null;render();return}
  if(d.np){UI.setup.np=+d.np;render();return}if(d.seatset!=null){const i=+d.seatset;UI.setup.seats[i]=UI.setup.seats[i]==='human'?'ai':'human';render();return}
  if(d.lv!=null){const i=+d.lv;const L=['easy','normal','hard'];UI.setup.lv[i]=L[(L.indexOf(UI.setup.lv[i])+1)%3];render();return}
  if(d.ex&&b.type==='checkbox'){UI.setup.ex[d.ex]=b.checked;return}
  if(d.ui)return uiAct(d.ui);
  switch(d.a){case 'snd':toggleSound();return;case 'mus':toggleMusic();return;case 'speed':UI.speed=UI.speed===1?3:UI.speed===3?.5:1;render();return;case 'pause':UI.pause=!UI.pause;render();schedule();return;case 'new':if(online()){UI.modal='lobby';render();return}openStart();return}});
// a tap anywhere that is not a button, while the computer plays, hurries it along
document.addEventListener('pointerdown',e=>{if(G&&!G.over&&!me()&&!UI.modal&&e.target.closest&&e.target.closest('#bd'))UI.hurry=true},true);
document.addEventListener('pointerdown',e=>{const tp=document.getElementById('tip');if(tp&&!tp.hidden&&!(e.target.closest&&e.target.closest('#tip')))tp.hidden=true},true);
document.addEventListener('pointerdown',e=>{if(UI.chz&&!(e.target.closest&&e.target.closest('#chz,[data-tile],[data-seat],[data-dj],[data-th]'))){UI.chz=null;if(G)render()}},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&(UI.pendDj||UI.pendItem||UI.chz)){UI.pendDj=UI.pendItem=UI.chz=null;render()}});
function uiAct(a){if(online()){if(a==='new'||a==='start'){UI.modal='lobby';render();return}if(a==='undodrop'&&isClient()){netSend({act:'undodrop'});return}if(a==='continue')return}
  switch(a){case 'start':beginGame();return;case 'quick':UI.setup.np=2;UI.setup.seats=['human','ai','ai','ai','ai'];beginGame();return;case 'continue':loadSaved();return;case 'new':openStart();return;case 'story':if(typeof GXC!=='undefined'&&window.CAMPAIGN){UI.modal=null;GX.close();render();GXC.open()}return;
  case 'again':UI.modal=null;beginGame();return;case 'closeover':UI.modal=null;render();return;
  case 'undodrop':{if(!UI.moveSnap||!UI.moveSteps)return;const steps=UI.moveSteps.slice(0,-1);G=JSON.parse(UI.moveSnap);UI.moveSteps=[];for(const m of steps){performMove(m,G.cur);UI.moveSteps.push(m)}if(!steps.length)UI.moveSnap=null;refresh();return}}}
function openStart(){UI.modal='start';render()}
function resetScene(){UI.camp=null;UI.snap=null;UI.chz=null;UI.pendDj=UI.pendItem=null;UI.mkSel=[];UI.sellSel=[];UI.moveSnap=null;UI.hurry=false}
function beginGame(o){o=o||{};const s=UI.setup;UI.modal=null;UI.fx.length=0;UI.fxSeen=0;resetScene();const seats=s.seats.slice(0,s.np);
  newGame({np:s.np,seats,lv:s.lv.slice(0,s.np),ex:Object.assign({},s.ex,s.np===5?{sultan:true}:{}),mode:seats.every(x=>x==='ai')?'ai':'x'});UI.modal=null;refresh()}
function loadSaved(){try{const g=JSON.parse(localStorage.getItem(SAVE));if(!g||!g.v)throw 0;G=g;UI.modal=null;resetScene();refresh()}catch(e){openStart()}}
// ---------- the computer: one step at a time, about 0.6 s a drop; tap the table to hurry ----------
const modalStops=()=>UI.modal&&UI.modal!=='lobby';
let aiTimer=null;function schedule(){if(online()&&isClient())return;if(aiTimer||!G||G.over||UI.pause||modalStops())return;const s=sideToAct();if(s<0||P(s).human)return;
  const drop=G.step==='move'&&G.move;const base=drop?600:420;const d=ANIM?Math.max(0,base/(UI.speed||1)*(UI.hurry?.12:1)):0;
  aiTimer=setTimeout(()=>{aiTimer=null;if(!G||G.over||modalStops()||(online()&&isClient()))return;const s2=sideToAct();if(s2<0||P(s2).human)return;const m=aiMove(s2);if(!m){console.error('AI has no move in '+G.phase+'/'+G.step);return}go(m)},d)}
