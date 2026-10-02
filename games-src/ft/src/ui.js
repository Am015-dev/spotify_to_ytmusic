// ---------- UI: the bazaar fills the screen; the dock says what to do now; everything else is a popup ----------
const $=s=>document.querySelector(s);const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const PCOL=['#2b2b33','#119e98','#ff4fa3','#8b5a2b','#6d7b8d'];const MCSS={vizier:'#f2c230',elder:'#f4f1ea',merchant:'#3fa34d',builder:'#2f6fd6',assassin:'#d23a2e',artisan:'#9a5bd0'};
UI.dropColor=null;UI.pendDj=null;UI.sellSel=[];UI.fxSeen=0;UI.plans=null;UI.planKey='';UI.showPlan=-1;UI.autoPlan=null;UI.adv=null;UI.morePlans=false;
try{UI.coach=localStorage.getItem('soq_coach')!=='0'}catch(e){UI.coach=true}
function refresh(){if(G&&!(typeof NET!=='undefined'&&NET.on)){try{if(!G.over&&!G.pl.every(p=>!p.human))localStorage.setItem(SAVE,JSON.stringify(G));else if(G.over)localStorage.removeItem(SAVE)}catch(e){}}
  if(!G)return;playFx();render();try{computePick();sync3D()}catch(e){console.error(e)}schedule();if(typeof NET!=='undefined'&&NET.on){if(isHost())netPush();netTurnCheck()}}
function playFx(){for(const f of UI.fx.slice(UI.fxSeen)){const m={pick:'pick',drop:'drop',take:'take',camel:'camel',coins:'coins',res:'take',kill:'kill',djinn:'djinn',build:'build',bid:'bid',round:'round',win:'win',thief:'kill',item:'djinn'}[f.t];if(m&&typeof sfx==='function')sfx(m)}UI.fxSeen=UI.fx.length;if(UI.fx.length>30){UI.fx.splice(0,20);UI.fxSeen=UI.fx.length}}
const online=()=>typeof NET!=='undefined'&&NET.on;
const me=()=>{if(!G)return null;const s=sideToAct();if(online()&&s!==NET.mySeat)return null;return s>=0&&P(s).human?P(s):null};
const mySeatP=()=>online()?(NET.mySeat>=0?P(NET.mySeat):null):null;
// online, a rival's Crafter items are face down: their points stay hidden until the end
function shownTotal(p){const s=scoreOf(p);return online()&&!G.over&&p.i!==NET.mySeat?s.total-s.items:s.total}
function human(){return G&&G.pl.some(p=>p.human)}
// which tiles glow for the human now
function computePick(){UI.pick=[];UI.pickFaint=[];UI.badges=null;const p=me();if(!p||G.q)return;const vm=validMoves(p.i);
  if(UI.pendDj){UI.pick=vm.filter(m=>m.act==='djinn'&&m.k===UI.pendDj.k&&same(m.pay,UI.pendDj.pay)).map(m=>m.t);return}
  if(G.step==='move'){if(!G.move){const legal=[...new Set(vm.filter(m=>m.act==='start').map(m=>m.tile))];const top=curPlans(p).slice(0,5);const best={};for(const o of top)if(best[o.s]==null||best[o.s]<o.v)best[o.s]=o.v;
      UI.pick=Object.keys(best).map(Number);UI.pickFaint=legal.filter(i=>!UI.pick.includes(i));UI.badges=UI.pick.map(i=>({i,txt:'+'+Math.max(0,Math.round(best[i]))}));return}
    UI.pick=[...new Set(vm.filter(m=>m.act==='step').map(m=>m.tile))];return}
  if(G.step==='tribe'&&G.act.color==='assassin')UI.pick=[...new Set(vm.filter(m=>m.act==='tribe'&&m.kill&&m.kill.tile!=null).map(m=>m.kill.tile))];
  if(G.step==='tile')UI.pick=[...new Set(vm.filter(m=>m.place!=null).map(m=>m.place))]}
// ---------- top-level render ----------
function render(){if(!G){renderModal();if(typeof phRender==='function')phRender();return}if(G.move&&!UI.autoPlan&&(!UI.path||UI.path.length!==G.move.path.length))showPath(G.move.path.slice());if(G.phase==='bid'&&!UI.modal)showChapter();renderDock();renderPopups();renderModal();renderMap2D();
  const pb=$('#pausebtn');if(pb){pb.hidden=human();pb.innerHTML=ICON(UI.pause?'play':'pause')}const sb=$('#speedbtn');if(sb)sb.innerHTML=ICON('fast')+'<span>'+({0.5:'slow',1:'normal',3:'fast'}[UI.speed]||'normal')+'</span>';
  renderChip();if(typeof phRender==='function')phRender()}
function renderChip(){const ch=$('#chip');if(ch&&G){const s=sideToAct();ch.textContent=(G.over?'Game over':`Round ${G.round} · ${G.phase==='bid'?'bidding':s>=0?(online()&&s===NET.mySeat?'You':P(s).nm)+(G.phase==='turn'?' · '+stepName():''):''}`)+(online()?' · 🌐 '+netStatus().replace(/ players online$/,' online'):'')}}
function stepName(){return {move:'moving',tribe:'tribe action',tile:'tile action',sell:'selling'}[G.step]||''}
function pChip(p){return `<span class="pc" style="--pc:${PCOL[p.i]}"><i></i>${esc(p.nm)}</span>`}
function mdot(c,big){return `<span class="md ${big?'big':''}" style="--mc:${MCSS[c]}" title="${MNAME[c]}"></span>`}
function statusHtml(p){const s=scoreOf(p);const L=(ic,n,lab,t)=>`<span class="st" title="${t||lab}">${ic} <b>${n}</b><small>${lab}</small></span>`;
  return `<div class="stat" style="--pc:${PCOL[p.i]}"><b class="nm">${esc(p.nm)}${online()&&p.i===NET.mySeat?' <small>(you)</small>':''}${p.human?'':p.away?' <small>(left · cpu)</small>':' <small>(cpu)</small>'}</b><span class="tot" title="points so far">★ ${shownTotal(p)}</span>
   <div class="sts">${L('🪙',p.coins,'coins')}${L('🐪',p.camels,'camels')}${p.tent?L('⛺',1,'tent'):''}${L(mdot('vizier'),p.vz,'Advisors')}${L(mdot('elder'),p.el,'Sages')}${G.ex.artisans?L(mdot('artisan'),p.art,'Crafters'):''}${L('🔮',p.fk,'Mystics','Mystic cards: add power to Masons or Shadows, or stand in for a Sage')}${L('🧺',p.res.length,'goods · set '+goodsBest(p),'goods cards; the set is worth '+goodsBest(p)+' points now')}${p.dj.length?L('🧞',p.dj.length,'djinns'):''}</div></div>`}
function standing(){const h=online()?mySeatP():me()||G.pl.find(p=>p.human);if(!h)return '';const sc=G.pl.map(p=>({p,t:shownTotal(p)})).sort((a,b)=>b.t-a.t);const mine=sc.find(x=>x.p===h).t;const lead=sc.find(x=>x.p!==h);if(!lead)return '';
  const d=mine-lead.t;return `<p class="standing">${d>0?`You lead ${esc(lead.p.nm)} by <b>${d}</b>.`:d<0?`You are <b>${-d}</b> behind ${esc(sc[0].p.nm)}.`:`You are level with ${esc(lead.p.nm)}.`} ${G.pl.map(p=>p.camels).some(c=>c<=3)?'⏳ A player is down to their last camels: the end is near.':''}</p>`}
function marketHtml(hl){return `<div class="mkt" aria-label="Market row">${G.market.map((r,j)=>`<span class="gc ${hl&&j<hl?'hl':''}" title="${RNAME[r]}">${RICON[r]}<small>${j+1}</small></span>`).join('')}</div>`}
function djRowHtml(){return `<p class="small muted" style="margin:0">Summon one at a Shrine with 2 Sages (or 1 Sage + 1 Mystic).</p><div class="djrow">${G.djRow.map(k=>`<button class="djc" data-dj="${k}" title="${esc(DJ[k].x)}"><b>${esc(DJ[k].n)} <small>${DJ[k].vp} pts</small></b><small class="dx">${esc(DJ[k].x)}</small></button>`).join('')}${G.ex.thieves&&G.thRow.length?G.thRow.map(k=>`<button class="djc th" data-th="${k}" title="${esc(THIEVES[k].x)}"><b>${esc(THIEVES[k].n)}</b><small>cutpurse</small></button>`).join(''):''}</div>`}
function btn(m,label,cls){return `<button class="btn ${cls||''}" data-mv='${esc(JSON.stringify(m))}'>${label}</button>`}
function renderDock(){const el=$('#dockbody');if(!el)return;const s=sideToAct();const p=s>=0?P(s):null;const hp=me();let h='';
  const dt=$('#dockt');if(dt)dt.textContent=G.over?'Game over':G.q&&hp?'Your choice':hp?`${online()?'Your turn':hp.nm}: ${G.phase==='bid'?'bid for turn order':stepName()}`:p?(online()&&p.human?`Waiting for ${p.nm}…`:`${p.nm} is thinking…`):'';
  const statsH=`<div class="stats">${G.pl.map(statusHtml).join('')}${standing()}</div>`;
  if(G.over){h+=statsH+scoreTable();h+=`<div class="acts">${btn({ui:'new'},'New game','go')}</div>`;el.innerHTML=h;return}
  if(!hp){h+=statsH+`<div class="recap"><h4>${p?(online()&&p.human?'Waiting for '+esc(p.nm)+(G.phase==='bid'?' to bid…':'…'):esc(p.nm)+(G.phase==='bid'?' is bidding…':' is playing…')):''}</h4>${recapHtml()}</div>${marketHtml()}${djRowHtml()}`;el.innerHTML=h;return}
  if(UI.adv&&UI.adv.key!==G.logN+'_'+G.step+'_'+G.phase+'_'+!!G.q)UI.adv=null;
  if(UI.adv)h+=advHtml();
  if(G.q){h+=`<div class="prompt"><h3>${esc(G.q.title)}</h3><div class="opts">${G.q.opts.map((o,i)=>btn({act:'q',i},esc(o.l),'opt')).join('')}</div></div>`+statsH;el.innerHTML=h;GX.showDock();return}
  const vm=validMoves(hp.i);const by=a=>vm.filter(m=>m.act===a);
  if(G.phase==='bid'){const bk='b'+G.logN+hp.i;if(UI.bidKey!==bk){UI.bidKey=bk;try{const lv=hp.lv;hp.lv='normal';UI.bidRec=aiMove(hp.i);hp.lv=lv}catch(e){UI.bidRec=null}}const bidRec=UI.coach?UI.bidRec:null;h+=`<div class="prompt"><h3>Bid for turn order</h3>${''}<p>Pay coins to choose <b>when</b> you play this round. Dearer spots go first and get the best moves; free spots go last. Coins also count as points at the end, so spend them only when a great move is at stake. ${UI.coach?`<br><span class="coach">💡 Not sure? Press <b>Advise me</b>.</span>`:''}</p>${lastTurnHtml()}${G.pl.filter(q=>q.markers>1).length?`<p class="small">With 2 players each of you has <b>2 markers = 2 turns</b> this round.</p>`:''}${UI.coach&&curPlansSafe(hp)?`<p class="small">Your best move right now is worth about <b>+${curPlansSafe(hp)}</b>.</p>`:''}<div class="track">${G.track.map((t,sp)=>{const b=G.bids.find(x=>x.spot===sp);const mv=by('bid').filter(m=>m.spot===sp);
      const rec=bidRec&&bidRec.spot===sp&&!bidRec.fk;return `<div class="sp ${b?'taken':''} ${rec?'rec':''}">${b?pChip(P(b.mk.p)):''}<small class="ord">${['1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th','11th','12th'][sp]}</small><b>${t.cost}🪙</b>${mv.map(m=>btn(m,m.fk?`−${m.fk}🔮 → ${bidPrice(hp,sp,m.fk)}🪙`:rec?'★ Take':'Take','sm'+(rec?' go':''))).join('')}${rec?'<small>suggested</small>':''}</div>`}).join('')}</div></div>`}
  else if(G.step==='move'){const mv=G.move;
    if(!mv){h+=plansHtml(hp)+lastTurnHtml()}
    else{const cols=[...new Set(mv.hand)];const steps=by('step');const next=[...new Set(steps.map(m=>m.tile))];if(!UI.dropColor||!mv.hand.includes(UI.dropColor))UI.dropColor=cols[0];
      h+=`<div class="prompt"><h3>${mv.hand.length} in hand</h3><p>${UI.autoPlan?'Following your plan…':`Choose which colour to leave behind, then tap a glowing tile next to you.${mv.hand.length===1?' <b>This is the last one:</b> it must land on a tile that already has its colour, and you will take all of that colour there.':' You leave one person on each tile you pass.'}`}</p><div class="hand">${cols.map(c=>`<button class="hc ${UI.dropColor===c?'on':''}" data-dc="${c}" ${steps.some(m=>m.c===c)?'':'disabled'}>${mdot(c,1)}${MNAME[c]} ×${mv.hand.filter(x=>x===c).length}</button>`).join('')}</div>
        <div class="acts">${by('undo').map(m=>btn(m,'↶ Put them back','ghost')).join('')}${!by('undo').length&&UI.moveSnap&&!UI.autoPlan?'<button class="btn ghost" data-ui="undodrop">↶ Undo last drop</button>':''}<span class="muted small">${next.length} tile${next.length===1?'':'s'} possible</span></div></div>`}}
  else if(G.step==='tribe'){const a=G.act;const only=vm.filter(m=>m.act!=='djinn'&&m.act!=='item');if(!ANIM&&only.length===1&&only[0].act==='tribe'&&['vizier','elder','artisan','merchant'].includes(a.color)&&!UI.autoT){UI.autoT=1;const fire=()=>{if(ANIM&&(document.querySelector('#dockbody button:hover')||Date.now()-(UI.dockTouch||0)<900)){setTimeout(fire,500);return}UI.autoT=0;if(G&&G.step==='tribe'&&me()){const v=validMoves(me().i).filter(m=>m.act==='tribe');if(v.length===1)go(v[0])}};setTimeout(fire,ANIM?2400:0)}h+=`<div class="prompt"><h3>${mdot(a.color,1)} ${a.n} ${a.n>1?MPLUR[a.color]:MNAME[a.color]}</h3><p class="flav">${esc(TRIBE_FLAVOUR[a.color])}</p><p>${esc(MHELP[a.color])}</p><div class="opts">${tribeButtons(hp,vm)}</div></div>`}
  else if(G.step==='tile'){const t=G.board[G.act.tile];h+=`<div class="prompt"><h3>${esc(tileName(t))}</h3><p>${esc(TILEDEF[t.k].x)}</p><div class="opts">${tileButtons(hp,vm,t)}</div></div>`}
  else if(G.step==='sell'){const kinds=[...new Set(hp.res)];UI.sellSel=UI.sellSel.filter(k=>kinds.includes(k));
    h+=`<div class="prompt"><h3>End of your turn</h3>${kinds.length?`<p>You may sell a set of different goods for coins (same values as final scoring). Pick kinds:</p><div class="hand">${kinds.map(k=>`<button class="hc ${UI.sellSel.includes(k)?'on':''}" data-sell="${k}">${RICON[k]} ${RNAME[k]} ×${hp.res.filter(x=>x===k).length}</button>`).join('')}</div>`:''}
      <div class="acts">${UI.sellSel.length?btn({act:'sell',kinds:UI.sellSel.slice().sort()},`Sell ${UI.sellSel.length} for ${sellValue(UI.sellSel.length)}🪙`):''}${btn({act:'end'},'End turn ▶','go')}</div></div>`}
  // powers you can use now
  const pw=[...by('djinn'),...by('item')];if(pw.length)h+=`<div class="powers"><h4>Powers you can use now</h4>${powerButtons(hp,pw)}</div>`;
  if(UI.pendDj)h+=`<div class="notice">Tap a glowing tile for ${esc(DJ[UI.pendDj.k].n)} · <button class="btn xs" data-ui="cancelpw">cancel</button></div>`;
  h+=statsH+`<h4>Market</h4>${marketHtml(G.step==='tile'&&G.board[G.act.tile].k==='small'?3:G.step==='tile'&&G.board[G.act.tile].k==='large'?6:0)}<h4>Djinns on offer</h4>${djRowHtml()}${lastLog(3)}`;
  el.innerHTML=h}
function tribeButtons(p,vm){const tr=vm.filter(m=>m.act==='tribe');const a=G.act;let h='';
  for(const m of vm.filter(m=>m.act==='thief'))h+=btn(m,`🦹 Send the ${esc(THIEVES[m.k].n)} first`,'warn');
  if(a.color==='builder'){const blues=AROUND(a.tile).filter(i=>G.board[i].blue&&!G.board[i].block).length;return h+tr.map(m=>btn(m,`Earn ${(a.n+(m.fk||0))*blues*(G.turnFx.qirsh?2:1)}🪙${m.fk?` (use ${m.fk}🔮)`:''}`,m.fk?'':'go')).join('')}
  if(a.color==='assassin'){if(tr[0]&&tr[0].none)return h+btn(tr[0],'No target: carry on','go');return h+`<p class="muted small">Tap a glowing tile, or choose:</p>`+tr.map(m=>btn(m,killLabel(m.kill))).join('')}
  return h+btn(tr[0],a.color==='merchant'?`Take ${Math.min(a.n,G.market.length)} goods`:a.color==='artisan'?'Keep them and draw items':'Keep them','go')}
function killLabel(k){const two=k.c2?` and a ${MNAME[k.c2]}`:'';if(k.pl!=null)return `🗡 ${esc(P(k.pl).nm)}'s ${MNAME[k.c]}${two}`;return `🗡 ${MNAME[k.c]}${two} on ${esc(tileName(G.board[k.tile]))}${k.fk?` (+${k.fk}🔮 range)`:''}`}
function tileButtons(p,vm,t){let tm=vm.filter(m=>m.act==='tile');let h='';
  // purchases: show the net points, best first, one button per distinct set of goods
  const cost=t.k==='small'?3:t.k==='large'?6:4;const net=m=>Math.round((goodsGain(p,m.take.map(j=>G.market[j]))-cost)*10)/10;
  const buys=tm.filter(m=>m.take);const seenK=new Set();const buys2=buys.map(m=>({m,n:net(m),k:m.take.map(j=>G.market[j]).sort().join()})).sort((a,b)=>b.n-a.n).filter(x=>!seenK.has(x.k)&&seenK.add(x.k));
  const allBad=buys.length&&buys2.every(x=>x.n<=0);
  if(buys.length){tm=tm.filter(m=>!m.take);
    h+=`<p class="small">Goods only pay off in <b>sets of different kinds</b> (1, 3, 7, 13, 21… points), and every coin spent is a point lost.${allBad?' <b>Every purchase here loses points: skip it.</b>':''}</p>`;
    for(const x of buys2.slice(0,8))h+=btn(x.m,`Buy ${x.m.take.map(j=>RICON[G.market[j]]+' '+RNAME[G.market[j]]).join(' + ')} · −${cost}🪙 · net ${x.n>0?'+':''}${x.n} ★`,x.n>0&&x===buys2[0]?'go':'')}
  if(t.k==='sacred'&&!tm.some(m=>m.dj||m.thief))h+=`<p class="small">You can't summon here yet: you need 2 Sages, or 1 Sage and 1 Mystic card. You have ${p.el} Sage${p.el===1?'':'s'} and ${p.fk} Mystic${p.fk===1?'':'s'}.</p>`;
  for(const m of tm){if(m.skip){h+=btn(m,allBad||!tm.some(x=>!x.skip)&&!buys.length?'Skip (best choice)':'Skip',allBad||(!buys.length&&tm.length===1)?'go':'ghost');continue}
    if(m.place!=null)h+=btn(m,`${t.k==='village'?'🏰 Palace':'🌴 Palm'} on ${esc(tileName(G.board[m.place]))}${m.place===t.i?'':' (neighbour)'}`,m.place===t.i?'go':'');
    else if(m.dj)h+=btn(m,`✨ ${esc(DJ[m.dj].n)} (${DJ[m.dj].vp} pts) — pay ${m.pay.el} Sage${m.pay.el>1?'s':''}${m.pay.fk?' + 1 Mystic':''}`,'');
    else if(m.thief)h+=btn(m,`🦹 Hire the ${esc(THIEVES[m.thief].n)} — pay ${m.pay.el} Sage${m.pay.el>1?'s':''}${m.pay.fk?' + 1 Mystic':''}`,'');
    else if(m.take)h+=btn(m,`Buy ${m.take.map(j=>RICON[G.market[j]]+' '+RNAME[G.market[j]]).join(' + ')} (${t.k==='small'?3:t.k==='large'?6:4}🪙)`,'');
    else if(m.work)h+=btn(m,m.work==='art'?'Pay 1 Crafter for an item':'Pay 2 Mystics for an item','')}
  return h}
function powerButtons(p,pw){const seen=new Set();let h='';for(const m of pw){if(m.act==='djinn'){const key=m.k+JSON.stringify(m.pay);if(seen.has(key))continue;seen.add(key);const needsTile=m.t>=0;
      h+=needsTile?`<button class="btn sm" data-pw='${esc(JSON.stringify({k:m.k,pay:m.pay}))}' title="${esc(DJ[m.k].x)}">✨ ${esc(DJ[m.k].n)} (${m.pay.el?m.pay.el+' Sage':''}${m.pay.el&&m.pay.fk?' + ':''}${m.pay.fk?m.pay.fk+' Mystic':''})</button>`:btn(m,`✨ ${esc(DJ[m.k].n)} (${m.pay.el?m.pay.el+' Sage':''}${m.pay.el&&m.pay.fk?' + ':''}${m.pay.fk?m.pay.fk+' Mystic':''})`,'sm')}
    else{const key='i'+m.k+(m.dj||'');if(seen.has(key))continue;seen.add(key);if(m.k==='talisman'||m.k==='flute'){if(seen.has('i'+m.k+'x'))continue;seen.add('i'+m.k+'x');h+=btn(m,`🪄 ${esc(ITEMS[m.k].n)}${m.k==='flute'?' onto '+esc(tileName(G.board[m.t])):''}`,'sm')}else h+=btn(m,`🪄 ${esc(ITEMS[m.k].n)}${m.dj?' → '+esc(DJ[m.dj].n):''}`,'sm')}}return h}
function lastLog(n){return `<ol class="mini">${G.log.slice(0,n).map(l=>`<li class="${l.c}">${esc(l.t)}</li>`).join('')}</ol>`}
function scoreTable(){const rows=G.over.scores;const keys=['coins','advisors','sages','crafters','djinns','tiles','palms','palaces','goods','items','cities','total'];const nm={coins:'🪙 Coins',advisors:'Advisors',sages:'Sages',crafters:'Crafters',djinns:'Djinns',tiles:'Tiles',palms:'Palms',palaces:'Palaces',goods:'Goods',items:'Items',cities:'Cities',total:'★ Total'};
  const epi=rows.map(r=>{const best=keys.filter(k=>k!=='total').sort((a,b)=>r.s[b]-r.s[a])[0];return `<li>${pChip(P(r.p))}: most of the points came from <b>${nm[best]}</b> (${r.s[best]}).</li>`}).join('');
  return `<div class="prompt"><h3>🏆 ${esc(G.winText)}</h3><ul class="story">${epi}</ul><div class="tw"><table><tr><th></th>${rows.map(r=>`<th>${pChip(P(r.p))}</th>`).join('')}</tr>${keys.filter(k=>k==='total'||rows.some(r=>r.s[k])).map(k=>`<tr class="${k==='total'?'tot':''}"><td>${nm[k]}</td>${rows.map(r=>`<td>${r.s[k]}</td>`).join('')}</tr>`).join('')}</table></div></div>`}

function curPlansSafe(p){const k=G.logN+'_'+p.i;if(UI.cpsK===k)return UI.cpsV;let v=0;try{const o=allPlans(p,1)[0];v=o?Math.round(o.v):0}catch(e){}UI.cpsK=k;UI.cpsV=v;return v}
// ---- why did my score change? ----
function scoreNote(p,before){const a=scoreOf(p);const d=a.total-before.total;if(!d)return;const nm={coins:'coins',advisors:'Advisors',sages:'Sages',crafters:'Crafters',djinns:'djinns',tiles:'land',palms:'palms',palaces:'palaces',goods:'goods',items:'items',cities:'cities'};
  const parts=Object.keys(nm).filter(k=>a[k]!==before[k]).map(k=>`${nm[k]} ${a[k]-before[k]>0?'+':''}${a[k]-before[k]}`);
  let why='';if(G.phase==='bid'||(G.phase==='turn'&&G.step==='move'&&!G.move&&d<0&&parts.length===1&&parts[0].startsWith('coins')))why=' (paid for turn order)';if(a.advisors-before.advisors>=10)why=' (you now have more Advisors than a rival: +10 each)';
  toast(`${d>0?'+':''}${d} ★ · ${parts.join(', ')}${why}`)}
// ---- guidance widgets ----
function curPlans(p){const key=G.turn+'_'+G.logN+'_'+p.i;if(UI.planKey!==key){UI.planKey=key;UI.plans=allPlans(p);UI.showPlan=-1;showPath(null)}return UI.plans}
function plansHtml(p){const all=curPlans(p);const n=UI.morePlans?12:5;const list=all.slice(0,n);
  return `<div class="prompt"><h3>Your move: pick a plan</h3><p class="muted small">The glowing tiles on the board are where the best plans start; the badge shows the points.</p>
    ${UI.coach&&G.turn<=6?'<p>Each plan is a complete move. You lift everyone off the first tile, lead them across the land leaving one person per tile, and the last one lands where its own tribe already stands. You collect that whole tribe and put it to work.</p>':''}
    <div class="plans">${list.map((o,i)=>planHtml(p,o,i)).join('')}</div>
    <div class="acts">${all.length>n?`<button class="btn sm ghost" data-ui="moreplans">Show more plans (${all.length})</button>`:UI.morePlans?`<button class="btn sm ghost" data-ui="moreplans">Show fewer</button>`:''}<span class="muted small">…or tap a glowing tile to move by hand.</span></div></div>`}
function recapHtml(){const gs=recapGroups();if(!gs.length)return '<p class="muted small">…</p>';return gs.map(g=>`<div class="rg"><b>${esc(g.head)}</b><ul class="story">${g.items.map(l=>`<li class="${l.c}">${esc(narrate(l))}</li>`).join('')}</ul></div>`).join('')}
function lastTurnHtml(){if(!recapGroups().length)return '';return `<details class="recap" ${UI.coach&&innerWidth>700?'open':''}><summary>While you waited…</summary>${recapHtml()}</details>`}
function advHtml(){const a=UI.adv;return `<div class="adv"><b>💡 Advisor</b><p>${esc(a.text)}</p><div class="acts">${a.move?btn(a.move,'Do it','go sm'):''}${a.plan?`<button class="btn go sm" data-advplan="1">Do this plan ▶</button><button class="btn sm" data-advshow="1">👁 Show path</button>`:''}<button class="btn sm ghost" data-ui="advx">Close</button></div></div>`}
function askAdvisor(){if(!G||G.over)return;const a=advice();if(!a){toast(me()?'Nothing to advise right now.':'Wait for your turn.');return}a.key=G.logN+'_'+G.step+'_'+G.phase+'_'+!!G.q;UI.adv=a;if(a.plan)showPath(a.plan.path);GX.showDock();render()}
function showPath(path){UI.path=path;if(typeof showPath3D==='function')try{showPath3D(path)}catch(e){}renderMap2D()}
// ---------- popups ----------
function renderPopups(){if(GX.open==='logd'){const lb=$('#logbody');lb.innerHTML=`<ol class="log">${G.log.slice(0,300).reverse().map(l=>`<li class="${l.c}"><small>R${l.r}</small> ${esc(l.t)}</li>`).join('')}</ol>`;lb.scrollTop=lb.scrollHeight}
  if(GX.open==='plrd')$('#plrbody').innerHTML=G.pl.map(p=>playerSheet(p)).join('');
  if(GX.open==='djd'&&$('#djbody').dataset.v!==String(G.logN))renderDjPop()}
function playerSheet(p){const s=scoreOf(p);const hid=online()&&!G.over&&p.i!==NET.mySeat;return `<section class="sheet" style="--pc:${PCOL[p.i]}"><h3>${pChip(p)} ${online()&&p.i===NET.mySeat?'<small>(you)</small>':''}${p.human?'':'<small>(computer)</small>'} <span class="tot">★ ${shownTotal(p)}</span></h3>${statusHtml(p)}
  <div><b>Goods:</b> ${p.res.length?p.res.slice().sort().map(r=>RICON[r]).join(' '):'none'} ${p.fk?`· ${p.fk} Mystic${p.fk>1?'s':''}`:''}</div>
  <div><b>Djinns:</b> ${p.dj.length?p.dj.map(k=>`<span class="tag" title="${esc(DJ[k].x)}">${esc(DJ[k].n)} ${DJ[k].vp}</span>`).join(' '):'none'}</div>
  ${G.ex.artisans?`<div><b>Items:</b> ${hid&&p.items.length?`${p.items.length} face down`:p.items.length?p.items.map(k=>`<span class="tag" title="${esc(ITEMS[k].x)}">${esc(ITEMS[k].n)}</span>`).join(' '):'none'}</div>`:''}
  ${G.ex.thieves?`<div><b>Cutpurses:</b> ${p.thieves.length?p.thieves.map(t=>esc(THIEVES[t.k].n)).join(', '):'none'}</div>`:''}
  <div><b>Tiles held:</b> ${G.board.filter(t=>owner(t)===p.i).map(t=>`${esc(tileName(t))}${t.palm?' 🌴'+t.palm:''}${t.pal?' 🏰'+t.pal:''}`).join(', ')||'none'}</div>
  <div class="small muted">So far: ${Object.entries(s).filter(([k,v])=>v&&k!=='total'&&!(hid&&k==='items')).map(([k,v])=>k+' '+v).join(' · ')}</div></section>`}
function renderDjPop(){const b=$('#djbody');b.dataset.v=String(G.logN);const inGame=DJINNS_FOR(G.ex);const where=k=>{if(G.djRow.includes(k))return 'on offer';for(const p of G.pl)if(p.dj.includes(k))return 'owned by '+p.nm;if(G.djDisc.includes(k))return 'discarded';return 'in the deck'};
  b.innerHTML=`<p class="muted small">Summon djinns at a Shrine: 2 Sages, or 1 Sage and 1 Mystic. Powers with a cost can be used once per turn, paying each time.</p><div class="cgrid">${inGame.map(d=>`<div class="card dj"><h4>${esc(d.n)} <small>${d.vp} pts</small></h4>${cardArt('djinn',d.n)}<div class="tag">${d.cost?{EF:'power: 1 Sage or 1 Mystic',EEF:'power: 1 Sage + 1 Sage-or-Mystic',F:'power: 1 Mystic','F+':'power: Mystics when bidding'}[d.cost]:'always on'} · ${where(d.k)}</div><p>${esc(d.x)}</p></div>`).join('')}</div>`}
// ---------- the start screen, rules and card list ----------
function renderModal(){const m=$('#modal');if(!m)return;const h=UI.modal==='start'?startHtml():UI.modal==='opening'?openingHtml():UI.modal==='lobby'&&online()?lobbyHtml():'';m.hidden=!h;if(m.dataset.h!==h){
  const a=document.activeElement,id=a&&m.contains(a)&&a.id,sel=id&&a.selectionStart!=null?[a.selectionStart,a.selectionEnd]:null;const det=[...m.querySelectorAll('details')].map(d=>d.open);
  m.innerHTML=h;m.dataset.h=h;if(UI.modal==='opening')paintOpening();[...m.querySelectorAll('details')].forEach((d,i)=>{if(det[i]!=null)d.open=det[i]});if(id){const e=document.getElementById(id);if(e){e.focus({preventScroll:true});if(sel)try{e.setSelectionRange(sel[0],sel[1])}catch(x){}}}}}
UI.setup={np:2,seats:['human','ai','ai','ai','ai'],lv:['normal','normal','normal','normal','normal'],ex:{artisans:false,sultan:false,thieves:false,promos:false}};
function startHtml(){const o=UI.setup;let saved=null;try{saved=localStorage.getItem(SAVE)}catch(e){}
  return `<div class="mbox"><h2>Sands of Qamar</h2><p class="lede">Move the five tribes across the sultanate, claim tiles with your camels, summon djinns and trade in the bazaar. Most points wins.</p>
   ${saved&&!online()?`<div class="acts"><button class="btn go" data-ui="continue">Continue the saved game</button></div>`:''}
   <h3>Players</h3><div class="seg">${[2,3,4,5].map(n=>`<button class="${o.np===n?'on':''}" data-np="${n}">${n}</button>`).join('')}</div>
   <div class="seats">${Array.from({length:o.np},(_,i)=>`<div class="seat" style="--pc:${PCOL[i]}"><i></i><b>${PNAMES[i]}</b><button class="btn sm" data-seat="${i}">${o.seats[i]==='human'?'🙂 you / a friend':'🤖 computer'}</button>${o.seats[i]==='ai'?`<button class="btn sm ghost" data-lv="${i}">${o.lv[i]}</button>`:''}</div>`).join('')}</div>
   <details class="exd"><summary><b>Expansions</b> <small>(optional: try the base game first)</small></summary><div class="exs">${[['artisans','The Crafters','purple Crafters, Workshops, items, mountains, a tent each'],['sultan','Wonder Cities','Wonder Cities, the Great Lake and a 5th player'],['thieves','Cutpurses','hire a cutpurse at a Shrine to rob every rival'],['promos','Promo djinns','three extra djinns']].map(([k,n,x])=>`<label class="chk"><input type="checkbox" data-ex="${k}" ${o.ex[k]||(k==='sultan'&&o.np===5)?'checked':''} ${k==='sultan'&&o.np===5?'disabled':''}> <b>${n}</b> <small>${x}</small></label>`).join('')}</div></details>
   <div class="acts">${online()?'':'<button class="btn go" data-ui="start">Begin ▶</button>'}<button class="btn" data-gx="rulesd">How to play</button><button class="btn" data-gx="refd">Card list</button></div>${typeof onlineBlock==='function'?onlineBlock():''}</div>`}
function refHtml(){const sec=(t,items)=>`<h3>${t}</h3><div class="cgrid">${items.map(i=>`<div class="card"><h4>${i.n}${i.c>1?` <small>×${i.c}</small>`:''}</h4>${i.art||(/^[^\x00-\x7f]/.test(i.n)?cardArt('good',i.n,{glyph:i.n.split(' ')[0],hue:30}):'')}${i.tag?`<div class="tag">${esc(i.tag)}</div>`:''}<p>${esc(i.x)}</p></div>`).join('')}</div>`;
  const tiles=[];for(const [k,v,n,col] of TILESET.concat(TILESET_ART,TILESET_WHIM)){const d=TILEDEF[k];tiles.push({art:cardArt('tile',d.n+v,{blue:col?col==='blue':d.blue,v,hue:30}),n:d.n,c:n,tag:`${v?v+' points · ':''}${(col?col==='blue':d.blue)?'blue':'red'}${TILESET_ART.some(x=>x[0]===k)?' · Crafters':TILESET_WHIM.some(x=>x[0]===k)?' · Wonder Cities':''}`,x:d.x})}
  return sec('The five tribes (and the Crafters)',Object.keys(MNAME).map(c=>({art:cardArt('tribe',c,{col:MCSS[c]||'#888',hue:35}),n:`${MNAME[c]} (${c==='vizier'?'yellow':c==='elder'?'white':c==='merchant'?'green':c==='builder'?'blue':c==='assassin'?'red':'purple'})`,c:c==='artisan'?15:MEEPLE_COUNT[c],tag:c==='artisan'?'Crafters expansion':'meeples',x:MHELP[c]})))+
   sec('Tiles',tiles)+sec('Goods cards',Object.keys(RESOURCE_COUNT).map(r=>({art:cardArt('good',r,{glyph:RICON[r]}),n:`${RICON[r]} ${RNAME[r]}`,c:RESOURCE_COUNT[r],tag:r==='fakir'?'special':'goods',x:r==='fakir'?'Adds 1 Mason or 1 Shadow range, pays for a Sage when summoning, pays djinn powers. Never part of a set.':'Collect sets of different kinds: 1, 3, 7, 13, 21, 30, 40, 50 or 60 points for 1–9 different kinds.'})))+
   sec('Djinns',DJINNS.map(d=>({n:d.n,tag:`${d.vp} points · ${d.cost?'power':'always on'}${d.set?' · '+{promos:'promo',artisans:'Crafters',thieves:'Cutpurses'}[d.set]:''}${d.assumed?' · '+d.assumed+' assumed':''}`,x:d.x})))+
   sec('Items (Crafters)',Object.values(ITEMS).map(i=>({n:i.n,c:i.cp,tag:i.kind,x:i.x})))+sec('Cutpurses',Object.values(THIEVES).map(t=>({n:t.n,tag:'Cutpurses expansion',x:t.x})))+
   sec('Tokens and pieces',[{n:'🐪 Camels',tag:'11 each with 2 players, 8 with 3–5',x:'Mark the tiles you control. Placing your last camel ends the game at the end of the round.'},{n:'⛺ Tent',tag:'Crafters · 1 each',x:'Claim a tile with it instead of a camel: it scores the tile plus 1 for each red tile around it.'},{n:'🌴 Palm tree',x:'3 points to whoever holds the tile (5 with Nakhla; doubled next to the Great Lake).'},{n:'🏰 Palace',x:'5 points to whoever holds the tile (doubled next to the Great Lake).'},{n:'⛰ Mountains',tag:'Crafters',x:'Block moving between two tiles (not Shadow range).'},{n:'🪙 Coins',x:'1 point each at the end; pay for turn order and bazaar goods.'},{n:'Turn-order track',x:'Costs 0, 0, 0, 1, 3, 5, 8, 12, 18 (5 players: 0, 0, 0, 1, 1, 3, 3, 5, 5, 8, 12, 18).'}])}
function renderMap2D(){const el=$('#map2d');if(!el)return;if(V3.on){el.hidden=true;return}el.hidden=false;const W=G.W,H=G.H,S=64;
  el.innerHTML=`<svg viewBox="0 0 ${W*S} ${H*S}" role="img" aria-label="The board">${G.board.map(t=>{const x=(t.i%W)*S,y=Math.floor(t.i/W)*S;const glow=UI.pick.includes(t.i);
    return `<g data-tile="${t.i}" class="t2 ${glow?'glow':''}"><rect x="${x+2}" y="${y+2}" width="${S-4}" height="${S-4}" rx="6" fill="${t.block?'#8a7a66':t.blue?'#8fb6d8':'#e0b27a'}" stroke="${glow?'#ffcf5a':'#6b4b2a'}" stroke-width="${glow?4:1.5}"/><text x="${x+6}" y="${y+14}">${esc(TILEDEF[t.k].n.slice(0,9))} ${t.v||''}</text>${t.m.map((c,k)=>`<circle cx="${x+10+(k%5)*11}" cy="${y+30+Math.floor(k/5)*11}" r="4.5" fill="${MCSS[c]}" stroke="#333" stroke-width=".6"/>`).join('')}${owner(t)!=null?`<rect x="${x+S-18}" y="${y+S-18}" width="12" height="12" fill="${PCOL[owner(t)]}"/>`:''}<text x="${x+6}" y="${y+S-6}">${t.palm?'🌴'+t.palm:''}${t.pal?'🏰'+t.pal:''}</text></g>`}).join('')}${UI.path?`<polyline points="${UI.path.map(i=>((i%W)*S+S/2)+','+(Math.floor(i/W)*S+S/2)).join(' ')}" fill="none" stroke="#fff3b0" stroke-width="5" stroke-linejoin="round" opacity=".9"/>`:''}</svg>`}
// ---------- input ----------
function on3DTile(i){const p=me();if(!p||G.q)return;const vm=validMoves(p.i);
  if(UI.pendDj){const m=vm.find(m=>m.act==='djinn'&&m.k===UI.pendDj.k&&same(m.pay,UI.pendDj.pay)&&m.t===i);UI.pendDj=null;if(m)return go(m);return render()}
  if(G.step==='move'){if(!G.move){const m=vm.find(m=>m.act==='start'&&m.tile===i);if(m)return go(m);return toast('No legal move starts there.')}
    const ok=vm.filter(m=>m.act==='step'&&m.tile===i);if(!ok.length)return toast('You can’t drop there.');const m=ok.find(m=>m.c===UI.dropColor)||ok[0];if(m.c!==UI.dropColor&&UI.dropColor)toast(`Dropped a ${MNAME[m.c]} (the ${MNAME[UI.dropColor]} can’t go there).`);return go(m)}
  if(G.step==='tribe'&&G.act.color==='assassin'){const ks=vm.filter(m=>m.act==='tribe'&&m.kill&&m.kill.tile===i);if(ks.length===1)return go(ks[0]);if(ks.length)return toast('Choose which meeple in the panel.');}
  if(G.step==='tile'){const m=vm.find(m=>m.act==='tile'&&m.place===i);if(m)return go(m)}}
function go(m){UI.adv=null;if(online()&&isClient()){netSend(m);return}const s=sideToAct();const human=s>=0&&P(s).human;const mine=!online()||s===NET.mySeat;
  // remember the move so a human can take back drops one at a time (nothing hidden is revealed while moving)
  if(human&&m.act==='start'){UI.moveSnap=JSON.stringify(G);UI.moveSteps=[m]}
  else if(human&&m.act==='step'&&UI.moveSteps)UI.moveSteps.push(m);else if(m.act!=='djinn'&&m.act!=='item')UI.moveSnap=null;
  const before=human?scoreOf(P(s)):null;
  const r=performMove(m,s);if(r.success&&human&&mine&&G&&!G.over)scoreNote(P(s),before);
  if(G&&!G.move){UI.moveSnap=G.step==='move'?UI.moveSnap:null}if(G&&G.step!=='move'&&UI.path)showPath(null);if(!r.success&&mine){toast('That move isn’t allowed now.');console.error(r.error)}}
function toast(t){const el=$('#dockmsg');if(!el)return;el.textContent=t;el.hidden=false;GX.showDock();clearTimeout(UI.tt);UI.tt=setTimeout(()=>el.hidden=true,3000)}
document.addEventListener('click',e=>{const b=e.target.closest('button,[data-tile],input[type=checkbox]');if(!b)return;const d=b.dataset;
  if(d.mv){const m=JSON.parse(d.mv);if(m.ui)return uiAct(m.ui);UI.adv=null;if(m.act==='sell')UI.sellSel=[];sfx&&sfx('click');return go(m)}
  if(d.tile!=null&&b.tagName!=='BUTTON'){return on3DTile(+d.tile)}
  if(d.planshow!=null){const i=+d.planshow;UI.showPlan=UI.showPlan===i?-1:i;showPath(UI.showPlan>=0?UI.plans[i].path:null);render();return}
  if(d.plando!=null){const pl=UI.plans&&UI.plans[+d.plando];if(pl){UI.adv=null;showPath(pl.path);UI.autoPlan=pl;sfx&&sfx('click');runPlan()}return}
  if(d.advplan){const pl=UI.adv&&UI.adv.plan;UI.adv=null;if(pl){showPath(pl.path);UI.autoPlan=pl;runPlan()}return}
  if(d.advshow){if(UI.adv&&UI.adv.plan)showPath(UI.adv.plan.path);return}
  if(b.dataset.coach!==undefined&&b.type==='checkbox'){UI.coach=b.checked;try{localStorage.setItem('soq_coach',UI.coach?'1':'0')}catch(e){}return}
  if(d.dc){UI.dropColor=d.dc;render();return}
  if(d.sell){const i=UI.sellSel.indexOf(d.sell);if(i>=0)UI.sellSel.splice(i,1);else UI.sellSel.push(d.sell);render();return}
  if(d.pw){UI.pendDj=JSON.parse(d.pw);computePick();sync3D();render();return}
  if(d.dj||d.th){const k=d.dj,t=d.th;GX.show('djd');renderDjPop();return}
  if(d.np){UI.setup.np=+d.np;render();return}if(d.seat!=null){const i=+d.seat;UI.setup.seats[i]=UI.setup.seats[i]==='human'?'ai':'human';render();return}
  if(d.lv!=null){const i=+d.lv;const L=['easy','normal','hard'];UI.setup.lv[i]=L[(L.indexOf(UI.setup.lv[i])+1)%3];render();return}
  if(d.ex&&b.type==='checkbox'){UI.setup.ex[d.ex]=b.checked;return}
  if(d.ui)return uiAct(d.ui);
  switch(d.a){case 'snd':toggleSound();return;case 'mus':toggleMusic();return;case 'speed':UI.speed=UI.speed===1?3:UI.speed===3?.5:1;render();return;case 'pause':UI.pause=!UI.pause;render();schedule();return;case 'new':if(online()){UI.modal='lobby';render();return}openStart();return;case 'advise':askAdvisor();return}});
function uiAct(a){if(online()){if(a==='new'||a==='start'){UI.modal='lobby';render();return}if(a==='undodrop'&&isClient()){netSend({act:'undodrop'});return}if(a==='continue')return}switch(a){case 'start':beginGame();return;case 'continue':loadSaved();return;case 'new':openStart();return;case 'cancelpw':UI.pendDj=null;computePick();sync3D();render();return;case 'undodrop':{if(!UI.moveSnap||!UI.moveSteps)return;const steps=UI.moveSteps.slice(0,-1);G=JSON.parse(UI.moveSnap);UI.moveSteps=[];for(const m of steps){performMove(m,G.cur);UI.moveSteps.push(m)}if(!steps.length)UI.moveSnap=null;resetScene();refresh();return}
  case 'moreplans':UI.morePlans=!UI.morePlans;render();return;case 'advx':UI.adv=null;showPath(null);render();return;case 'play':UI.modal=G?null:'start';render();schedule();return}}
document.addEventListener('mouseover',e=>{const c=e.target.closest&&e.target.closest('.plan[data-plani]');if(!c||!UI.plans||UI.autoPlan)return;const i=+c.dataset.plani;if(UI.hoverPlan===i)return;UI.hoverPlan=i;showPath(UI.plans[i].path)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&UI.pendDj){UI.pendDj=null;render()}});
function openStart(){UI.modal='start';render()}
function beginGame(){const o=UI.setup;UI.modal=null;UI.fx.length=0;UI.fxSeen=0;const seats=o.seats.slice(0,o.np);newGame({np:o.np,seats,lv:o.lv.slice(0,o.np),ex:Object.assign({},o.ex,o.np===5?{sultan:true}:{}),mode:seats.every(s=>s==='ai')?'ai':'x'});resetScene();UI.modal=null;UI.chapterShown='';refresh()}
function loadSaved(){try{const g=JSON.parse(localStorage.getItem(SAVE));if(!g||!g.v)throw 0;G=g;UI.modal=null;resetScene();refresh()}catch(e){openStart()}}
function resetScene(){if(!V3.on)return;for(const k in V3.tiles)V3.scene.remove(V3.tiles[k].g);V3.tiles={};for(const k in V3.stacks)V3.scene.remove(V3.stacks[k].g);V3.stacks={};buildPlinth();fitDist()}
// the player is reaching for a button in the panel: automatic steps wait for them
document.addEventListener('pointerdown',e=>{if(e.target.closest&&e.target.closest('#dockbody'))UI.dockTouch=Date.now()},true);document.addEventListener('pointermove',e=>{if(e.target.closest&&e.target.closest('#dockbody'))UI.dockTouch=Date.now()},true);
// ---------- inline SVG icons (consistent line icons instead of emoji in the chrome) ----------
const ICONS={bulb:'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.6 1 2.5h6c0-.9.2-1.7 1-2.5A6 6 0 0 0 12 3z"/>',
 camel:'<path d="M3 19v-5.5C3 11.6 4 10.6 5.6 10.6 6.6 7.8 7.6 7 9 7s2.3 1.6 3.2 3.6h1.6l1.3-3.2c.4-1 1.1-1.4 2-1.4h1.4l1.5 1.7-1.6.6-1 3.9v3.3M6.5 14v5M16.5 14v5M10.5 14.4V19"/>',
 lamp:'<path d="M2.5 14c2 2.2 5 3.3 9 3.3 3.6 0 5.7-1.3 6.8-3l3.2-2.1h-3.2C17.2 10.3 14.8 9.5 12 9.5c-3.3 0-6.9 1.3-9.5 4.5zM12 9.5V7.8M9 20.5h7M12.5 17.3v3.2"/><path d="M12 7.8c-1.3-1 0-2 .8-2.8s.2-2-.8-2.5"/>',
 scroll:'<path d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 0-2-2h3M4 4a2 2 0 0 0-2 2v2h4M10 9h6M10 13h6M10 17h3"/>',
 cards:'<rect x="3" y="6" width="11" height="15" rx="2"/><path d="M9.5 3.4l8.7 2.3a2 2 0 0 1 1.4 2.5L17 18"/><path d="M8.5 11l1.2 2.3 2.3.3-1.7 1.6.4 2.3-2.2-1.1-2.2 1.1.4-2.3-1.7-1.6 2.3-.3z"/>',
 book:'<path d="M12 6c-2-1.5-5-2-8-1.5v14c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5v-14c-3-.5-6 0-8 1.5zM12 6v14"/>',
 snd:'<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 9a4 4 0 0 1 0 6M19 6.5a7.5 7.5 0 0 1 0 11"/>',sndoff:'<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9.5l5 5M22 9.5l-5 5"/>',
 mus:'<path d="M9 18V5.5l11-2v12.5"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',musoff:'<path d="M9 18V5.5l11-2v12.5"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/><path d="M3 3l18 18"/>',
 fast:'<path d="M3.5 6.5l7.5 5.5-7.5 5.5zM12 6.5l7.5 5.5L12 17.5z"/>',pause:'<path d="M8 5v14M16 5v14"/>',play:'<path d="M7 5l12 7-12 7z"/>',menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',plus:'<path d="M12 5v14M5 12h14"/>',
 gear:'<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
 gem:'<path d="M6 3h12l3 6-9 12L3 9zM3 9h18M9 3l-1 6 4 12 4-12-1-6"/>'};
function ICON(k){return `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[k]||''}</svg>`}
function paintIcons(root){for(const e of (root||document).querySelectorAll('[data-ic]'))if(!e.firstChild)e.innerHTML=ICON(e.dataset.ic)}
function soundBtns(){const a=document.getElementById('sndbtn'),b=document.getElementById('musbtn');const on=typeof SND==='undefined'||SND.on,mu=typeof SND!=='undefined'&&SND.music;
  if(a){a.innerHTML=ICON(on?'snd':'sndoff');a.setAttribute('aria-pressed',on?'true':'false')}if(b){b.innerHTML=ICON(mu?'mus':'musoff');b.setAttribute('aria-pressed',mu?'true':'false')}if(GX.open==='setd')renderSettings()}
// ---------- settings popup: graphics quality, sound, music, computer speed ----------
function renderSettings(){const el=$('#setbody');if(!el)return;const g=typeof GFX!=='undefined'?GFX:{pref:'auto',q:'high'};const on3d=typeof V3!=='undefined'&&V3.on;
  const seg=(attr,cur,opts)=>`<div class="seg">${opts.map(([v,l])=>`<button ${attr}="${v}" class="${String(cur)===String(v)?'on':''}">${l}</button>`).join('')}</div>`;
  el.innerHTML=`<div class="setrow"><h4>Graphics quality</h4>${seg('data-gfx',g.pref,[['auto','Auto'],['high','High'],['medium','Medium'],['low','Low']])}
   <p class="small muted">${on3d?`Now drawing at <b>${gfxLabel()}</b>. `:'3D is not available here, so the flat map is used. '}High adds bloom, a colour grade and sharper shadows; Low turns off shadows and effects. Auto picks for your screen and steps down if the game stutters.</p>${typeof PerfHUD!=='undefined'&&on3d?`<div class="seg perfbtns">${PerfHUD.buttonsHTML('btn')}</div>`:''}</div>
   <div class="setrow"><h4>Sound</h4><div class="seg"><button data-a="snd" class="${typeof SND==='undefined'||SND.on?'on':''}">${ICON('snd')} Effects</button><button data-a="mus" class="${typeof SND!=='undefined'&&SND.music?'on':''}">${ICON('mus')} Music</button></div></div>
   <div class="setrow"><h4>Computer speed</h4>${seg('data-spd',UI.speed||1,[[.5,'Slow'],[1,'Normal'],[3,'Fast']])}</div>`}
document.addEventListener('click',e=>{const b=e.target.closest('[data-gfx],[data-spd]');if(!b)return;if(b.dataset.gfx){if(typeof setGfx==='function')setGfx(b.dataset.gfx)}else{UI.speed=+b.dataset.spd;if(G)render()}renderSettings()});
// ---------- card art windows for the card list and the djinn popup ----------
function hueOf(s){let h=0;for(const c of String(s))h=(h*31+c.charCodeAt(0))%360;return h}
function cardArt(kind,name,o){o=o||{};const h=o.hue!=null?o.hue:hueOf(name);const id='ca'+Math.abs(hueOf(name+kind))+kind.length;let fg='';
  if(kind==='djinn')fg=`<path d="M22 58c6 5 16 7 28 7 11 0 17-4 20-9l9-6h-9c-3-6-10-8-19-8-9 0-20 3-29 16z" fill="#e9b24a" stroke="#6b3d10" stroke-width="1.5"/><path d="M50 42c-6-5 3-9 0-15-3-6 6-10 3-16" fill="none" stroke="hsl(${h},70%,85%)" stroke-width="4" stroke-linecap="round" opacity=".9"/><circle cx="53" cy="12" r="6" fill="hsl(${h},70%,80%)"/>`;
  else if(kind==='tribe')fg=`<path d="M40 70h20l-2-4c-3-2-4-8-4-16l4-2-3-2c4-2 6-6 6-10a11 11 0 0 0-22 0c0 4 2 8 6 10l-3 2 4 2c0 8-1 14-4 16z" fill="${o.col}" stroke="rgba(0,0,0,.45)" stroke-width="1.5"/><ellipse cx="46" cy="30" rx="3" ry="4" fill="rgba(255,255,255,.4)"/>`;
  else if(kind==='tile')fg=`<rect x="26" y="22" width="48" height="48" rx="6" fill="${o.blue?'#2d5f9f':'#b34a2a'}"/><rect x="31" y="27" width="38" height="38" rx="4" fill="#ecc996"/><rect x="33" y="54" width="34" height="8" rx="4" fill="#f6e7c6"/>${o.v?`<circle cx="36" cy="58" r="6" fill="${o.blue?'#1b3a66':'#7a2d17'}"/>`:''}`;
  else fg=`<text x="50" y="58" font-size="30" text-anchor="middle">${o.glyph||''}</text>`;
  return `<svg class="ca" viewBox="0 0 100 76" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${h},55%,${kind==='djinn'?30:62}%)"/><stop offset="1" stop-color="hsl(${(h+30)%360},60%,${kind==='djinn'?14:40}%)"/></linearGradient></defs><rect width="100" height="76" fill="url(#${id})"/><path d="M0 76V40q50-30 100 0v36z" fill="rgba(255,255,255,.08)"/>${fg}</svg>`}
// ---------- the computer ----------
const modalStops=()=>UI.modal&&UI.modal!=='lobby';
let aiTimer=null;function schedule(){if(online()&&isClient())return;if(aiTimer||!G||G.over||UI.pause||modalStops())return;const s=sideToAct();if(s<0||P(s).human)return;aiTimer=setTimeout(()=>{aiTimer=null;if(!G||G.over||modalStops()||(online()&&isClient()))return;const s2=sideToAct();if(s2<0||P(s2).human)return;const m=aiMove(s2);if(!m){console.error('AI has no move in '+G.phase+'/'+G.step);return}go(m)},Math.max(0,AIDELAY/(UI.speed||1)*(G.step==='move'&&G.move?.5:1)))}
function showOpeningFirst(){UI.modal=UI.netOpen&&UI.joinCode?'start':'opening';render()}
function boot(){GX.init({key:'soq'});paintIcons();GX.onShow=id=>{if(id==='setd')renderSettings();if(id==='rulesd')$('#rulesbody').innerHTML=RULES_HTML;if(id==='refd')$('#refbody').innerHTML=refHtml();if(G)render()};try{init3D()}catch(e){console.error(e)}soundBtns();showOpeningFirst()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
