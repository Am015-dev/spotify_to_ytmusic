// ===================== part 3: the dock (round roadmap, the one decision to make now) =====================
const ROAD=['Bids','Heralds','Cards','Spring','Clashes','Autumn','Winter'];
function roadIdx(){const st=G.step,ph=G.phase;if(ph==='over')return 6;if(ph==='winter')return 6;
  if(ph==='autumn'||st==='autumnActions')return 5;
  if(ph==='summer'||['clashorder','reveal','day','night','tally'].includes(st))return 4;
  if(st==='springActions')return 3;if(st==='place')return 2;if(st==='herald')return 1;return 0}
const STEP_HELP=[
 'Spring, Bids. Everyone secretly picks one card from their hand as a bid. Highest bid chooses first: take a Kingdom Card, steal a rival\'s, or take your card back. A card you bid under a Kingdom Card stays there while you keep it.',
 'Spring, Heralds. In turn, put your Herald on one of the six locations. Everyone sees it. If you win a clash and claim that location you gain 1 Influence and steal 1 from every rival Herald on it.',
 'Spring, Cards. Secretly play one face-down card next to each of the three regions. The strongest total in a region wins its clash, so decide where your big cards go.',
 'Spring, Actions. In turn order you may use Spring abilities, such as sending Supporters (+1 Strength each) to a region. Skip it if you have nothing to do.',
 'Summer, Clashes. Regions are resolved one by one. Cards are revealed, Day and Night abilities fire, the strongest total wins and claims one of the region\'s two locations.',
 'Autumn. Once each you may Govern (move a hand card with votes into a Council) and Journey (spend a hand card for Lore to buy Site of Power cards), plus any Autumn abilities.',
 'Winter. Heralds go home, Supporters are lost, played cards go to the discard pile, and the next round starts. Running out of deck shrinks your hand size (Attrition).'];
const KIND_NAME={bid:'Choose your bid',bidRes:'Resolve your bid',herald:'Place your Herald',place:'Play a face-down card',menu:'Your actions',clashOrder:'Order the clashes',location:'Claim a location',tie:'Break the tie?'};
// ---------------------------------------------------------------- top bar status chip
function renderBar(){const el=$('#barstat');if(!el)return;if(!G)return;
  const ri=roadIdx();const r=Math.max(1,G.round);
  el.innerHTML='<span class="chip" aria-label="Round '+r+' of '+G.rounds+', step '+ROAD[ri]+'"><span class="chip-r">'+ico('round')+'<b>'+r+'</b><small>/'+G.rounds+'</small></span><span class="chip-s">'+esc(ROAD[ri])+'</span></span>'}
const ICO={round:'<path d="M5 20V9l7-5 7 5v11M9 20v-6h6v6"/>',book:'<path d="M4 5c3-1 6-1 8 1 2-2 5-2 8-1v13c-3-1-6-1-8 1-2-2-5-2-8-1zM12 6v13"/>',log:'<path d="M6 3h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6zM6 3v18M10 8h6M10 12h6M10 16h4"/>',users:'<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-4 3-6 6-6s6 2 6 6M15 14c3 0 6 1.5 6 5"/>',crown:'<path d="M3 18h18l-1.5-9-4.5 4-3-7-3 7-4.5-4z"/>',menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',card:'<rect x="6" y="3" width="12" height="18" rx="2"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>',inf:'<circle cx="12" cy="12" r="8"/><path d="M8 14l1-5 3 3 3-3 1 5z"/>',eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',star:'<path d="M12 3l2.6 6 6.4.6-4.9 4.2 1.5 6.3L12 17l-5.6 3.1 1.5-6.3L3 9.6 9.4 9z"/>',road:'<path d="M5 20L9 4M19 20L15 4M12 6v3M12 12v3M12 18v2"/>'};
function ico(n,c){return '<svg class="ico '+(c||'')+'" viewBox="0 0 24 24" aria-hidden="true">'+(ICO[n]||'')+'</svg>'}
// ---------------------------------------------------------------- roadmap
function renderRoad(){const el=$('#road');if(!el)return;const ri=roadIdx();
  el.innerHTML='<div class="road-h"><b>Round '+Math.max(1,G.round)+' of '+G.rounds+'</b><span class="road-n">step '+(ri+1)+' of 7</span></div><ol class="road-l" aria-label="Round roadmap">'+ROAD.map((n,i)=>'<li class="'+(i<ri?'done':i===ri?'on':'')+'"'+(i===ri?' aria-current="step"':'')+'><i>'+(i+1)+'</i><span>'+n+'</span></li>').join('')+'</ol>'}
// ---------------------------------------------------------------- recommended move
function getRec(s,mv){const key=G.logN+':'+(G.q?G.q.kind:'')+':'+s+':'+(G.q&&G.q.chosen?G.q.chosen.length:'')+':'+(mv?mv.length:0);
  if(UI._rk===key)return UI._rec;UI._rk=key;let r=null;try{r=suggest(s)}catch(e){}UI._rec=r;return r}
const recK=()=>UI._rec&&UI._rec.k;
function whyFor(s,mv){if(!mv)return '';const q=G.q,k=q.kind;
  if(k==='bid'){const i=cinfo(mv.id);const hand=G.pl[s].hand.map(id=>cinfo(id).strength).sort((a,b)=>b-a);
    const rank=hand.indexOf(i.strength)+1;
    return i.strength>=hand[Math.min(1,hand.length-1)]?'A high bid ('+i.strength+') should be among the first to choose from the Great Road, but the card will sit under whatever you take.':
      rank>=hand.length-1?'A cheap bid ('+i.strength+'): it keeps your strong cards for the clashes. You may be late to choose, or just take the card back.':
      'A middle bid ('+i.strength+'): good enough to pick a Kingdom Card, while your strongest cards stay free for the clashes.'}
  if(k==='herald'){const l=mv.loc,inf=DD.LOCS[l][2];const riv=G.pl.filter(p=>p.seat!==s&&p.herald===l).map(p=>p.name);
    return LOCN[l]+' pays +'+inf+' Influence'+(DD.LOCS[l][3]?' and '+lcFirst(DD.LOCS[l][3]):'')+'. '+(riv.length?riv.join(', ')+(riv.length>1?' have':' has')+' a Herald here: if you win here you take 1 Influence from each.':'No rival Herald is here yet, so your swing is a clean +1.')}
  if(k==='place'||k==='tie'){if(mv.pass)return 'Passing keeps your cards. If everyone passes the tie ends with no winner.';const i=cinfo(mv.id);const r=mv.r!=null?REG[mv.r]:'the tied region';
    return 'Strength '+i.strength+' in '+r+(i.strength>=7?': a strong card for a region you want to win.':i.strength<=2?': a cheap card, useful as a bluff or to save better ones.':': a solid middle card.')}
  if(k==='bidRes'){if(mv.t==='return')return 'Taking the card back keeps your hand full if nothing on offer helps.';if(mv.t==='steal')return 'Stealing takes a Kingdom Card away from a rival and returns their occupying card to their hand.';return 'This Kingdom Card fits your hand: it takes effect while your bid card sits under it.'}
  if(k==='location'){return LOCN[mv.loc]+' pays +'+DD.LOCS[mv.loc][2]+' Influence'+(DD.LOCS[mv.loc][3]?' and '+lcFirst(DD.LOCS[mv.loc][3]):'.')+(G.pl.some(p=>p.seat!==s&&p.herald===mv.loc)?' Rival Heralds there lose 1 each if yours is there too.':'')}
  if(G.q.t==='menu'){return mv.t==='done'?'Nothing else is worth doing right now.':'Worth doing before you finish.'}
  return 'The computer at its strongest would pick this.'}
const lcFirst=t=>t?t.charAt(0).toLowerCase()+t.slice(1).replace(/\.$/,''):''
// ---------------------------------------------------------------- the main prompt
function recapHTML(){const c=G.clash;if(!c)return '';const parts=c.parts,V=UI.V;
  const rows=parts.map(s=>{const ids=(c.cards[s]||[]);const tot=c.tot&&c.tot[s]!=null?c.tot[s]:null;
    return '<span class="rc-s" style="--fc:'+fcol(s)+'"><b>'+esc(shortName(s))+'</b> '+ids.map(id=>cinfo(id).strength).join('+')+(G.pl[s].supp.r[c.r]?' +'+G.pl[s].supp.r[c.r]+' supporter'+(G.pl[s].supp.r[c.r]>1?'s':''):'')+(tot!=null?' = <b>'+tot+'</b>':'')+'</span>'}).join('');
  return '<div class="recap" aria-label="Current clash"><span class="rc-t">Clash in '+esc(REG[c.r])+(c.n>1?' (round '+c.n+')':'')+'</span>'+rows+'</div>'}
const shortName=s=>kf(s).short.replace('Gilded Court','Gilded').replace('Heathbound Clans','Heath').replace('Lantern Rising','Lantern').replace('Pale Choir','Choir')+(!G.pl[s].ai&&(humans().length===1)?' (you)':'');
function waitingHTML(){const q=G.q;let who='';
  if(q){const names=q.seats.map(s=>shortName(s));who=names.join(', ')+(q.seats.length>1?' are':' is')+' deciding'}
  const cur=G.log.slice(-3).map(e=>'<li>'+esc(e.t)+'</li>').join('');
  return '<div class="wait"><p class="w-t">'+(UI.mode==='watch'?'Watching the computers play.':'Waiting for the others.')+' '+esc(who)+'.</p><ul class="w-log">'+cur+'</ul>'+(UI.mode==='watch'?watchControls():'')+'</div>'}
function watchControls(){return '<div class="btnrow"><button class="btn" data-a="wpause" aria-pressed="'+UI.watchPaused+'">'+(UI.watchPaused?'Resume':'Pause')+'</button><button class="btn" data-a="wstep">Step</button><button class="btn" data-a="wspeed">Speed x'+UI.speed+'</button></div>'}
function optBtn(m,cls,extra){const rec=recK()===m.k;return '<button class="opt'+(cls?' '+cls:'')+(rec?' rec':'')+'" data-a="mv" data-k="'+esc(m.k)+'">'+(extra||'')+'<span class="ot">'+esc(m.label)+'</span>'+(rec?'<span class="rtag">'+ico('star')+'Recommended</span>':'')+'</button>'}
function thumbFor(m){if(m.id!=null&&m.id>=0&&m.t!=='sel')return '<span class="th"'+(ownerOf(m.id)===vs()?' data-owner="'+ownerOf(m.id)+'" data-up="1"':'')+'>'+cardEl(m.id,44).outerHTML+'</span>';
  if(m.kc)return '<span class="th">'+kcEl(m.kc,44).outerHTML+'</span>';return ''}
function renderMain(){const el=$('#main');if(!el)return;const q=G.q;
  if(G.over){el.innerHTML='<div class="step"><h3>The reign is over</h3></div>';return}
  const s=viewSeatForQ();
  if(!q||s==null||UI.card&&UI.card.kind==='pass'){el.innerHTML=waitingHTML();setHl([]);return}
  const mv=legal(s);const rec=getRec(s,mv);const rm=rec?mv.find(m=>m.k===rec.k):null;
  let h='';const help=tipLine(q.kind);
  h+='<div class="step"><h3 class="st">'+esc(KIND_NAME[q.kind]||q.title.replace(/^[^:]*:\s*/,''))+'</h3>';
  h+='<p class="pr">'+esc(promptText(q))+'</p>';
  if(G.clash&&['day','night','tally'].includes(G.step)||G.clash&&q.kind==='location'||G.clash&&['castle','wilderness','harvest','shrine','ossuary','tie'].includes(q.kind))h+=recapHTML();
  const hl=[];
  switch(q.kind){
   case 'bid':{h+=recLine(s,rm);h+='<div class="btnrow">'+(rm?'<button class="btn pri" data-a="mv" data-k="'+esc(rm.k)+'">Bid '+esc(cinfo(rm.id).name)+' ('+cinfo(rm.id).strength+')</button>':'')+'<button class="btn" data-a="road4">Great Road</button></div>';h+='<p class="hint">Or tap any card in your hand.</p>';break}
   case 'bidRes':{h+=recLine(s,rm);h+=bidResHTML(s,mv);break}
   case 'herald':{h+=recLine(s,rm);h+='<div class="locgrid">'+mv.map(m=>'<button class="lbtn'+(recK()===m.k?' rec':'')+'" data-a="loc" data-l="'+m.loc+'"><b>'+esc(LOCN[m.loc])+'</b><small>+'+DD.LOCS[m.loc][2]+' '+esc(REG[m.loc>>1])+'</small>'+heraldDots(m.loc)+'</button>').join('')+'</div>';h+='<p class="hint">Tap a location on the map, or here, to see its reward and place your Herald.</p>';mv.forEach(m=>hl.push(m.loc));break}
   case 'place':{h+=placeInfo(s,mv);const rs=[...new Set(mv.map(m=>m.r))];rs.forEach(r=>{hl.push(2*r,2*r+1)});h+=recLine(s,rm);if(rm)h+='<div class="btnrow"><button class="btn pri" data-a="mv" data-k="'+esc(rm.k)+'">Play '+esc(cinfo(rm.id).name)+' ('+cinfo(rm.id).strength+') at '+esc(REG[rm.r])+'</button></div>';h+='<p class="hint">Tap a card in your hand to play it face-down'+(rs.length>1?' (choose the region)':' next to '+esc(REG[rs[0]]))+'.</p>';break}
   case 'tie':{h+=recLine(s,rm);h+='<div class="btnrow">'+mv.filter(m=>m.pass).map(m=>'<button class="btn" data-a="mv" data-k="'+esc(m.k)+'">Pass</button>').join('')+(rm&&!rm.pass?'<button class="btn pri" data-a="mv" data-k="'+esc(rm.k)+'">Play '+esc(cinfo(rm.id).name)+'</button>':'')+'</div><p class="hint">Or tap a hand card to play it face-down into the tied clash.</p>';break}
   case 'location':{h+=recLine(s,rm);h+='<div class="locgrid two">'+mv.map(m=>'<button class="lbtn'+(recK()===m.k?' rec':'')+'" data-a="mv" data-k="'+esc(m.k)+'"><b>'+esc(LOCN[m.loc])+'</b><small>+'+DD.LOCS[m.loc][2]+(DD.LOCS[m.loc][3]?' and '+esc(lcFirst(DD.LOCS[m.loc][3])):'')+'</small>'+heraldDots(m.loc)+(recK()===m.k?'<span class="rtag">'+ico('star')+'Recommended</span>':'')+'</button>').join('')+'</div>';mv.forEach(m=>hl.push(m.loc));break}
   case 'clashOrder':{h+=recLine(s,rm);h+='<div class="opts">'+mv.map(m=>optBtn(m,'ord',orderChips(m.order))).join('')+'</div>';break}
   default:{ // generic pick / sel / menu
     if(q.t==='menu')h+=menuHTML(s,mv,rm);
     else if(q.t==='sel')h+=selHTML(s,mv,rm,q);
     else{h+=recLine(s,rm);h+='<div class="opts">'+mv.map(m=>optBtn(m,'',thumbFor(m))).join('')+'</div>'}}}
  h+='</div>';el.innerHTML=h;setHl(hl)}
function tipLine(k){return ''}
function promptText(q){const t=q.title||'';
  switch(q.kind){case 'bid':return 'Pick one card from your hand as a secret bid. Its Strength is your bid.';
    case 'herald':return 'Choose the location where your Herald waits. Everyone sees it.';
    case 'place':return t.indexOf('fewer')>=0?t:'Place one face-down card next to each region: '+placeProgress();
    case 'location':return t;case 'clashOrder':return 'You place the Clash Markers. Choose which region is resolved first.';
    default:return t}}
function placeProgress(){const me=vs();let n=0;for(const R of UI.V.reg)for(const id of R.down)if(id>=0&&ownerOf(id)===me)n++;
  const mv=me>=0?legal(me):[];const rs=[...new Set(mv.map(m=>m.r))];return 'card '+Math.min(3,n+1)+' of 3'+(rs.length===1?', for '+REG[rs[0]]:'')}
function recLine(s,rm){if(!rm)return '';return '<p class="rec-l">'+ico('star')+'<span><b>Suggestion:</b> '+esc(shortRec(rm))+'</span></p>'}
function shortRec(m){const q=G.q;if(q.kind==='bid')return cinfo(m.id).name+' (strength '+cinfo(m.id).strength+').';if(q.kind==='herald')return LOCN[m.loc]+'.';if(q.kind==='place'||q.kind==='tie')return m.pass?'pass.':cinfo(m.id).name+(m.r!=null?' at '+REG[m.r]:'')+'.';if(q.kind==='location')return LOCN[m.loc]+'.';return m.label}
function heraldDots(l){const o=G.pl.filter(p=>p.herald===l);return o.length?'<span class="hd">'+o.map(p=>'<i style="background:'+fcol(p.seat)+'" title="'+esc(p.name)+'"></i>').join('')+'</span>':''}
function orderChips(o){return '<span class="oc">'+o.map((r,i)=>'<i>'+['I','II','III'][i]+'</i>'+esc(REG[r].replace('The ',''))).join('<em>›</em>')+'</span>'}
function placeInfo(s,mv){return ''}
// Kingdom Card offers (bid resolution)
function bidResHTML(s,mv){let h='<div class="offers">';
  const take=mv.filter(m=>m.t==='take'),steal=mv.filter(m=>m.t==='steal'),ret=mv.filter(m=>m.t==='return');
  for(const m of take.concat(steal)){const k=TB.kingdomInfo(m.kc);const rec=recK()===m.k;
    h+='<div class="offer'+(rec?' rec':'')+'"><button class="kcth" data-a="kc" data-n="'+m.kc+'" aria-label="Read '+esc(k.name)+'">'+kcEl(m.kc,52).outerHTML+'</button><div class="ob"><b>'+esc(k.name)+'</b> <em>'+SUIT_N[k.suit]+'</em><p>'+esc(k.text)+'</p>'+(m.t==='steal'?'<p class="st-n">Steal it from '+esc(nameOf(m.s2))+'.</p>':'')+'<button class="btn'+(rec?' pri':'')+'" data-a="mv" data-k="'+esc(m.k)+'">'+(m.t==='steal'?'Steal':'Take')+(rec?' (recommended)':'')+'</button></div></div>'}
  for(const m of ret){h+='<div class="offer ret'+(recK()===m.k?' rec':'')+'"><div class="ob"><b>Keep your card</b><p>Take your bidding card back into your hand and take nothing.</p><button class="btn'+(recK()===m.k?' pri':'')+'" data-a="mv" data-k="'+esc(m.k)+'">Take it back'+(recK()===m.k?' (recommended)':'')+'</button></div></div>'}
  return h+'</div>'}
// Action menus (Spring / Day / Autumn): grouped; "done" always last
function menuHTML(s,mv,rm){let h=recLine(s,rm);const acts=mv.filter(m=>m.t==='act'),done=mv.find(m=>m.t==='done');
  const groups={};const order=[];for(const m of acts){const g=m.a;if(!groups[g]){groups[g]=[];order.push(g)}groups[g].push(m)}
  h+='<div class="opts">';
  for(const g of order){const L=groups[g];
    if(g==='supp'){const byR={};for(const m of L){(byR[m.p.r]=byR[m.p.r]||[]).push(m)}
      h+='<div class="grp"><b>Send Supporters</b> <small>(+1 Strength each in a region; lost in Winter)</small>';
      for(const r in byR){h+='<div class="sup-r"><span>'+esc(REG[r])+'</span>'+byR[r].map(m=>'<button class="nb" data-a="mv" data-k="'+esc(m.k)+'" aria-label="Place '+m.p.n+' in '+esc(REG[r])+'">'+m.p.n+'</button>').join('')+'</div>'}
      h+='</div>';continue}
    for(const m of L)h+=optBtn(m,'act',actIcon(m))}
  h+='</div>';
  if(done)h+='<div class="btnrow"><button class="btn'+(acts.length?'':' pri')+(recK()===done.k?' rec':'')+'" data-a="mv" data-k="'+esc(done.k)+'">'+esc(done.label)+'</button></div>';
  return h}
const actIcon=m=>''
function selHTML(s,mv,rm,q){const items=mv.filter(m=>m.t==='sel'),dn=mv.find(m=>m.t==='seldone');let h='';
  const ch=(q.chosen||[]).map(v=>chipFor(v));h+=(ch.length?'<p class="chosen">Chosen: '+ch.join(' ')+'</p>':'')+(q.max!=null&&q.max<items.length+ch.length?'<p class="hint">Choose up to '+q.max+(q.min?' (at least '+q.min+')':'')+'.</p>':'');
  h+='<div class="opts">'+items.map(m=>optBtn(m,'',typeof m.v==='number'&&m.v<10000&&ownerOf(m.v)===s?'<span class="th" data-owner="'+s+'" data-up="1">'+cardEl(m.v,44).outerHTML+'</span>':'')).join('')+'</div>';
  if(dn)h+='<div class="btnrow"><button class="btn pri" data-a="mv" data-k="'+esc(dn.k)+'">'+esc(dn.label)+'</button></div>';return h}
function cardOwnerOK(id){const o=ownerOf(id);return o===vs()||G.pl[o]&&(G.reg.some(R=>R.up.includes(id)))}
function chipFor(v){try{if(typeof v==='number'&&v<10000)return '<span class="chp">'+esc(TB.cardName(G,v))+'</span>'}catch(e){}return '<span class="chp">'+esc(v)+'</span>'}
