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
const KIND_NAME={bid:'Choose your bid',bidRes:'Use your bid',herald:'Place your Herald',place:'Hide your cards',clashOrder:'Order the Clashes',location:'Claim a location',tie:'A tie!'};
// ---------------------------------------------------------------- top bar status chip
function renderBar(){const el=$('#barstat');if(!el)return;if(!G)return;
  const ev=UI.card&&UI.card.kind==='event'?UI.card.ev:null;const ri=ev&&ev.t==='summary'?6:ev&&ev.t==='clash'?4:roadIdx();const r=ev&&ev.round?ev.round:Math.max(1,G.round);
  el.innerHTML='<span class="chip" aria-label="Round '+r+' of '+G.rounds+', step '+(ri+1)+' of 7: '+ROAD[ri]+'"><span class="chip-t"><small>Round</small><b>'+r+'</b><small>of '+G.rounds+'</small><span class="chip-s">'+esc(ROAD[ri])+'</span></span><span class="chip-d" aria-hidden="true">'+ROAD.map((_,i)=>'<i class="'+(i<ri?'done':i===ri?'on':'')+'"></i>').join('')+'</span></span>'}
const ICO={round:'<path d="M5 20V9l7-5 7 5v11M9 20v-6h6v6"/>',book:'<path d="M4 5c3-1 6-1 8 1 2-2 5-2 8-1v13c-3-1-6-1-8 1-2-2-5-2-8-1zM12 6v13"/>',log:'<path d="M6 3h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6zM6 3v18M10 8h6M10 12h6M10 16h4"/>',users:'<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-4 3-6 6-6s6 2 6 6M15 14c3 0 6 1.5 6 5"/>',crown:'<path d="M3 18h18l-1.5-9-4.5 4-3-7-3 7-4.5-4z"/>',menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',card:'<rect x="6" y="3" width="12" height="18" rx="2"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>',inf:'<circle cx="12" cy="12" r="8"/><path d="M8 14l1-5 3 3 3-3 1 5z"/>',eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',star:'<path d="M12 3l2.6 6 6.4.6-4.9 4.2 1.5 6.3L12 17l-5.6 3.1 1.5-6.3L3 9.6 9.4 9z"/>',road:'<path d="M5 20L9 4M19 20L15 4M12 6v3M12 12v3M12 18v2"/>'};
function ico(n,c){return '<svg class="ico '+(c||'')+'" viewBox="0 0 24 24" aria-hidden="true">'+(ICO[n]||'')+'</svg>'}
// ---------------------------------------------------------------- roadmap
function renderRoad(){const el=$('#road');if(!el)return;const ri=roadIdx();
  el.innerHTML='<div class="road-h"><b>Round '+Math.max(1,G.round)+' of '+G.rounds+'</b><span class="road-n">step '+(ri+1)+' of 7</span></div><ol class="road-l" aria-label="Round roadmap">'+ROAD.map((n,i)=>'<li class="'+(i<ri?'done':i===ri?'on':'')+'"'+(i===ri?' aria-current="step"':'')+'><i>'+(i+1)+'</i><span>'+n+'</span></li>').join('')+'</ol>'}
// ---------------------------------------------------------------- recommended move (+ the guided script may choose a simpler teaching move)
function getRec(s,mv){const key=G.logN+':'+(G.q?G.q.kind:'')+':'+s+':'+(G.q&&G.q.chosen?G.q.chosen.length:'')+':'+(mv?mv.length:0)+':'+(UI.cfg&&UI.cfg.guided?1:0);
  if(UI._rk===key)return UI._rec;UI._rk=key;let r=null;try{r=(typeof coachRec==='function'&&coachRec(s,mv))||suggest(s)}catch(e){}UI._rec=r;return r}
const recK=()=>UI._rec&&UI._rec.k;
function whyFor(s,mv){if(!mv)return '';const q=G.q,k=q.kind;
  if(k==='bid'){const i=cinfo(mv.id);const hand=G.pl[s].hand.map(id=>cinfo(id).strength).sort((a,b)=>b-a);
    const rank=hand.indexOf(i.strength)+1;
    return i.strength>=hand[Math.min(1,hand.length-1)]?'A high bid ('+i.strength+') chooses early, but this card then sits under the Kingdom Card and cannot fight.':
      rank>=hand.length-1?'A cheap bid ('+i.strength+') keeps your strong cards for the Clashes. You may choose late, or simply take it back.':
      'A middle bid ('+i.strength+') can still win a good Kingdom Card while your strongest cards stay free for the Clashes.'}
  if(k==='herald'){const l=mv.loc,inf=DD.LOCS[l][2];const riv=G.pl.filter(p=>p.seat!==s&&p.herald===l).map(p=>shortName(p.seat));
    return LOCN[l]+' pays +'+inf+' Influence'+(DD.LOCS[l][3]?' and '+lcFirst(DD.LOCS[l][3]):'')+'. '+(riv.length?riv.join(', ')+(riv.length>1?' have':' has')+' a Herald here: win here and you take 1 Influence from each.':'Win this region and claim it, and your Herald earns +1.')}
  if(k==='place'||k==='tie'){if(mv.pass)return 'Passing keeps your cards. If everyone passes, nobody wins this region.';const i=cinfo(mv.id);const r=mv.r!=null?REG[mv.r]:'the tied region';
    return 'Strength '+i.strength+' in '+r+(i.strength>=7?': a strong card where the prize is worth it.':i.strength<=2?': a cheap card, a bluff that saves better ones.':': a solid middle card.')}
  if(k==='bidRes'){if(mv.t==='return')return 'Nothing on offer is worth a card: take it back and keep your hand full.';if(mv.t==='steal')return 'Stealing takes a Kingdom Card from a rival; their card under it goes back to their hand.';const kk=TB.kingdomInfo(mv.kc);return 'It works for you every round you keep it: '+lcFirst(kk.text)+'.'}
  if(k==='location'){return LOCN[mv.loc]+' pays +'+DD.LOCS[mv.loc][2]+' Influence'+(DD.LOCS[mv.loc][3]?' and '+lcFirst(DD.LOCS[mv.loc][3]):'')+'.'+(G.pl[s].herald===mv.loc?' Your Herald is here: +1 more, and you take 1 from each rival Herald here.':'')}
  if(k==='clashOrder')return 'Fight first where you are strongest, so your wins come before rivals can react.';
  if(G.q.t==='menu')return menuWhy(mv);
  if(G.q.t==='sel'){if(mv.t==='seldone')return 'Nothing more here is worth it right now.';
    if(k==='siteBuy')return 'Site of Power cards are stronger than your basic cards; buying one now makes your deck better for the rest of the game.';
    if(k==='shrine')return 'Cards at the bottom of your deck come back later, after a reshuffle; weak cards there leave room for better draws.';
    if(k==='ossuary')return 'It brings a useful card back from your discard pile.';
    if(k==='rally'||k==='brine')return 'Taking strong cards back to your hand saves them from Winter\'s discard.';
    return 'Of the choices here this one gains you the most.'}
  if(k==='occupier')return 'The card under a Kingdom Card cannot fight, so tuck your weakest useful card there.';
  if(k==='slot')return 'The Kingdom Card you replace is the one that helps you least now.';
  if(k==='councilOut')return 'A card back in your hand can fight again next round.';
  if(k==='flank'||k==='journeyDest')return 'Your card does more good there.';
  if(k==='castle'||k==='wilderness')return mv.skip||/^Skip/.test(mv.label||'')?'No card here is worth giving up.':'This card is worth less in your hand than what you gain.';
  if(q.t==='pick'&&mv.yes!=null)return mv.yes?'Using it now gains more than saving it.':'Saving it for a better moment is worth more.';
  return 'Of the choices here this one gains you the most.'}
function menuWhy(m){if(m.t==='done')return 'Nothing else here helps right now, so finish this step.';const a=m.a||'';
  if(a==='supp')return 'Each Supporter adds +1 Strength in that region\'s first Clash (they are spent in Winter).';
  if(a==='govern')return 'A card in a Council gives a lasting bonus every round.';
  if(a==='journey')return 'Lore buys your faction\'s Site of Power cards: stronger cards for later rounds.';
  if(a.startsWith('t:'))return 'A Tactic is a once-only faction power; now is a good moment to spend it.';
  if(a.startsWith('fav:'))return 'Your Favour power has limited uses; this is a good one.';
  if(a.startsWith('council:'))return 'Your Council cards allow this once a round.';
  if(a==='cmd:rally')return 'Rally brings strong cards back to your hand before Winter discards them.';
  if(a==='cmd:ambush')return 'Ambush adds a hidden card from your hand to this Clash.';
  if(a==='cmd:retreat')return 'Retreat saves your cards from a Clash you cannot win.';
  if(a==='cmd:flank')return 'Flank moves this card to a region where it does more good.';
  if(a==='cmd:deploy')return 'Deploy puts a card on the map that stays through Winter.';
  return 'Worth doing before you finish this step.'}
const lcFirst=t=>t?t.charAt(0).toLowerCase()+t.slice(1).replace(/\.$/,''):''
// ---------------------------------------------------------------- the main prompt: body (#main, scrolls) + the action row (#act, pinned)
function recapHTML(){const c=G.clash;if(!c)return '';const parts=c.parts;
  const rows=parts.map(s=>{const ids=(c.cards[s]||[]);const tot=c.tot&&c.tot[s]!=null?c.tot[s]:null;
    return '<span class="rc-s" style="--fc:'+fcol(s)+'"><b>'+esc(shortName(s))+'</b> '+(ids.map(id=>cinfo(id).strength).join('+')||'0')+(G.pl[s].supp.r[c.r]?' +'+G.pl[s].supp.r[c.r]+' Supporter'+(G.pl[s].supp.r[c.r]>1?'s':''):'')+(tot!=null?' = <b>'+tot+'</b>':'')+'</span>'}).join('');
  return '<div class="recap" aria-label="Current clash"><span class="rc-t">Clash in '+esc(REG[c.r])+(c.n>1?' (replay '+c.n+')':'')+'</span>'+rows+'</div>'}
const shortName=s=>(hotSeat()&&!G.pl[s].ai?G.pl[s].name.replace(/ \(.*$/,'').replace('Player ','P')+' · ':'')+kf(s).short.replace('Gilded Court','Court').replace('Heathbound Clans','Clans').replace('Lantern Rising','Lanterns').replace('Pale Choir','Choir')+(!G.pl[s].ai&&(NET.on?s===vs():humans().length===1)?' (you)':'');
function waitingHTML(){const q=G.q;let who='';
  if(q){const names=q.seats.map(s=>shortName(s).replace(' (you)',''));who=NET.on?decidingLine():names.join(', ')+(q.seats.length>1?' are':' is')+' deciding'}
  const cur=G.log.slice(-4).map(e=>'<li>'+esc(plain(e.t))+'</li>').join('');
  return '<div class="wait"><p class="w-t">'+(UI.mode==='watch'?'Watching the computers play.':NET.on&&vs()<0?'You are watching.':'Waiting for the others.')+' '+esc(who)+'.</p><ul class="w-log">'+cur+'</ul></div>'}
function watchControls(){return '<button class="btn" data-a="wpause" aria-pressed="'+UI.watchPaused+'">'+(UI.watchPaused?'Resume':'Pause')+'</button><button class="btn" data-a="wstep">Step</button><button class="btn" data-a="wspeed">Speed x'+UI.speed+'</button>'}
function optBtn(m,cls,extra){const rec=recK()===m.k;return '<button class="opt'+(cls?' '+cls:'')+(rec?' rec':'')+'" data-a="mv" data-k="'+esc(m.k)+'">'+(extra||'')+'<span class="ot">'+esc(m.label)+'</span>'+(rec?'<span class="rtag">'+ico('star')+'Suggested</span>':'')+'</button>'}
function thumbFor(m){if(m.id!=null&&m.id>=0&&m.t!=='sel')return '<span class="th"'+(ownerOf(m.id)===vs()?' data-owner="'+ownerOf(m.id)+'" data-up="1"':'')+'>'+cardEl(m.id,44).outerHTML+'</span>';
  if(m.kc)return '<span class="th">'+kcEl(m.kc,44).outerHTML+'</span>';return ''}
const pbtn=(m,txt,pulse)=>'<button class="btn pri'+(pulse?' pulse':'')+'" data-a="mv" data-k="'+esc(m.k)+'">'+esc(txt)+'</button>';
function recBtnText(m){const k=G.q.kind;if(!m)return '';
  if(k==='bid')return 'Bid '+cinfo(m.id).name+' ('+cinfo(m.id).strength+')';
  if(k==='herald')return 'Herald to '+LOCN[m.loc];
  if(k==='place')return 'Play '+cinfo(m.id).name+' ('+cinfo(m.id).strength+') at '+REG[m.r].replace('The ','');
  if(k==='tie')return m.pass?'Pass':'Play '+cinfo(m.id).name;
  if(k==='location')return 'Claim '+LOCN[m.loc];
  if(k==='bidRes')return m.t==='return'?'Take my card back':(m.t==='steal'?'Steal ':'Take ')+TB.kingdomInfo(m.kc).name;
  if(m.t==='done'||m.t==='seldone')return m.label.replace(/^End my /,'End ');
  const L=m.label.replace(/\s*\([^)]*\)\s*$/,'');return L.length>48?L.slice(0,46)+'…':L}
function renderMain(){const el=$('#main'),ft=$('#act');if(!el)return;const q=G.q;let foot='';
  const qk=(q?q.kind+'|'+q.title+'|'+G.logN:'')+'|'+(UI.coachInfo?UI.coachInfo.id:'');const set=(h,f)=>{el.innerHTML=h;if(ft)ft.innerHTML=f||'';if(UI._qk!==qk){UI._qk=qk;el.scrollTop=0}};
  if(G.over){set('<div class="step"><h3 class="st">The reign is over</h3></div>');return}
  if(UI.coachInfo){set(coachInfoHTML(UI.coachInfo),'<button class="btn pri pulse" data-a="coachok">'+esc(UI.coachInfo.btn||'Continue')+'</button>');setHl(UI.coachInfo.hlLocs||[]);return}
  const s=viewSeatForQ();
  if(!q||s==null||UI.card&&UI.card.kind==='pass'){set(waitingHTML(),UI.mode==='watch'?watchControls():'');setHl([]);return}
  const mv=legal(s);const rec=getRec(s,mv);const rm=rec?mv.find(m=>m.k===rec.k):null;
  const co=typeof coachFor==='function'?coachFor(s,mv,rm):null;
  let h='';
  h+='<div class="step" data-q="'+q.kind+'"><h3 class="st">'+esc(co&&co.title||KIND_NAME[q.kind]||titleOf(q))+'</h3>';
  if(co)h+='<p class="coach">'+gloss(co.text)+'</p>';
  else{h+=tipLine(q.kind==='menu'&&menuPhase(q)?'menu:'+menuPhase(q):q.kind)+'<p class="pr">'+gloss(promptText(q))+'</p>'}
  if(NET.on&&q.simul){const oth=q.seats.filter(x=>x!==s);if(oth.length)h+='<p class="hint dec">Everyone decides at the same time. Still to choose: '+esc(oth.map(seatWho).join(', '))+'.</p>'}
  if(G.clash&&['day','night','tally'].includes(G.step)||G.clash&&q.kind==='location'||G.clash&&['castle','wilderness','harvest','shrine','ossuary','tie'].includes(q.kind))h+=recapHTML();
  if(!co||!co.noRec)h+=recLine(s,rm);
  const pulse=!!(co&&co.pulse);const hl=[];
  switch(q.kind){
   case 'bid':{h+='<p class="hint">Or tap any card in your hand to read it first. <button class="lk" data-a="road4">See the Great Road</button></p>';if(rm)foot=pbtn(rm,recBtnText(rm),pulse);break}
   case 'bidRes':{h+=bidResHTML(s,mv);if(rm)foot=pbtn(rm,recBtnText(rm),pulse);break}
   case 'herald':{h+='<div class="locgrid">'+mv.map(m=>'<button class="lbtn'+(recK()===m.k?' rec':'')+'" data-a="loc" data-l="'+m.loc+'"><b>'+esc(LOCN[m.loc])+'</b><small>+'+DD.LOCS[m.loc][2]+' · '+esc(REG[m.loc>>1].replace('The ',''))+'</small>'+heraldDots(m.loc)+'</button>').join('')+'</div>';h+='<p class="hint">Tap a location to read its reward first.</p>';mv.forEach(m=>hl.push(m.loc));if(rm)foot=pbtn(rm,recBtnText(rm),pulse);break}
   case 'place':{const rs=[...new Set(mv.map(m=>m.r))];rs.forEach(r=>{hl.push(2*r,2*r+1)});h+='<p class="hint">Or tap a hand card to choose it yourself'+(rs.length>1?' (then pick the region)':'')+'.</p>';if(rm)foot=pbtn(rm,recBtnText(rm),pulse);break}
   case 'tie':{h+='<p class="hint">Or tap a hand card to play it face-down into the tied Clash.</p>';const ps=mv.find(m=>m.pass);foot=(ps&&!(rm&&rm.pass)?'<button class="btn" data-a="mv" data-k="'+esc(ps.k)+'">Pass</button>':'')+(rm?pbtn(rm,recBtnText(rm),pulse):'');break}
   case 'location':{h+='<div class="locgrid two">'+mv.map(m=>'<button class="lbtn'+(recK()===m.k?' rec':'')+'" data-a="mv" data-k="'+esc(m.k)+'"><b>'+esc(LOCN[m.loc])+'</b><small>+'+DD.LOCS[m.loc][2]+' Influence'+(DD.LOCS[m.loc][3]?', '+esc(lcFirst(DD.LOCS[m.loc][3])):'')+'</small>'+heraldDots(m.loc)+'</button>').join('')+'</div>';mv.forEach(m=>hl.push(m.loc));if(rm)foot=pbtn(rm,recBtnText(rm),pulse);break}
   case 'clashOrder':{h+='<div class="opts">'+mv.map(m=>optBtn(m,'ord',orderChips(m.order))).join('')+'</div>';if(rm)foot=pbtn(rm,'Use the suggested order',pulse);break}
   default:{
     if(q.t==='menu'){const r=menuHTML(s,mv,rm,pulse);h+=r.h;foot=r.f}
     else if(q.t==='sel'){const r=selHTML(s,mv,rm,q,pulse);h+=r.h;foot=r.f}
     else{h+='<div class="opts">'+mv.map(m=>optBtn(m,'',thumbFor(m))).join('')+'</div>';if(rm)foot=pbtn(rm,recBtnText(rm),pulse)}}}
  h+='</div>';set(h,foot);setHl(hl)}
const QNAME={flank:'Flank',castle:'Govern',wilderness:'Journey',siteBuy:'Spend Lore',ossuary:'Ossuary bonus',shrine:'Moss Altar bonus',harvest:'The Favour',rally:'Rally',retreat:'Retreat',ambushCard:'Ambush',occupier:'Choose the occupier',slot:'Choose a slot',placeRegion:'Choose a region',placeLoc:'Choose a location',journeyDest:'Journey',brine:'Brine-Hardened',edict:'A Tactic',relics:'Council of Coin',order:'Turn order'};
function titleOf(q){if(q.t==='menu'){const ph=menuPhase(q);return ph?ph+' actions':'Your actions'}if(QNAME[q.kind])return QNAME[q.kind];const t=(q.title||'').replace(/^[^:]*:\s*/,'');return t.length>28?'Your choice':t}
function tipLine(k){if(k==='bid'||k==='place'||UI.guide!=='full'||!TIPS[k]||UI.tip[k]==='x'||G.round>2)return '';UI.tip[k]=UI.tip[k]||1;return '<p class="tipl">'+ico('book')+'<span>'+gloss(TIPS[k][1])+'</span><button class="lk" data-a="tipx" data-k="'+k+'">Hide</button></p>'}
function promptText(q){const t=q.title||'';
  switch(q.kind){case 'bid':return 'Pick one hand card as a secret bid. Its Strength is your bid: the highest bid chooses a Kingdom Card first.';
    case 'herald':return 'Put your Herald on a location. Everyone sees it.';
    case 'place':return t.indexOf('fewer')>=0?t:'Hide one card face-down next to each region ('+placeProgress()+'). The strongest total in a region wins its Clash.';
    case 'bidRes':return 'Your turn to use your bid: take a Kingdom Card, steal one, or take your card back.';
    case 'location':return 'You won the Clash. Claim one of the two locations of '+(G.clash?REG[G.clash.r]:'this region')+'.';
    case 'clashOrder':return 'You have the least Influence, so you choose the order of the three Clashes.';
    default:if(q.t==='menu'){const ph=menuPhase(q);return (ph?ph+': ':'')+'these actions are optional. The suggestion is below; the rest are under the list.'}return plain(t)}}
function placeProgress(){const me=vs();let n=0;for(const R of UI.V.reg)for(const id of R.down)if(id>=0&&ownerOf(id)===me)n++;
  const mv=me>=0?legal(me):[];const rs=[...new Set(mv.map(m=>m.r))];return 'card '+Math.min(3,n+1)+' of 3'+(rs.length===1?', for '+REG[rs[0]]:'')}
function recLine(s,rm){if(!rm)return '';return '<p class="rec-l">'+ico('star')+'<span><b>Suggested:</b> '+esc(shortRec(rm))+' <span class="why2">'+gloss(whyFor(s,rm))+'</span></span></p>'}
function shortRec(m){const q=G.q;if(q.kind==='bid')return cinfo(m.id).name+' ('+cinfo(m.id).strength+').';if(q.kind==='herald')return LOCN[m.loc]+'.';if(q.kind==='place'||q.kind==='tie')return m.pass?'pass.':cinfo(m.id).name+(m.r!=null?' at '+REG[m.r]:'')+'.';if(q.kind==='location')return LOCN[m.loc]+'.';if(m.t==='done')return 'finish this step.';return m.label.replace(/\.$/,'')+'.'}
function heraldDots(l){const o=G.pl.filter(p=>p.herald===l);return o.length?'<span class="hd">'+o.map(p=>'<i style="background:'+fcol(p.seat)+'" title="'+esc(p.name)+'"></i><b class="gx-cbm" aria-hidden="true">'+GX.mark(p.seat)+'</b>').join('')+'</span>':''}
function orderChips(o){return '<span class="oc">'+o.map((r,i)=>'<i>'+['I','II','III'][i]+'</i>'+esc(REG[r].replace('The ',''))).join('<em>›</em>')+'</span>'}
// Kingdom Card offers (bid resolution)
function bidResHTML(s,mv){let h='<div class="offers">';
  const take=mv.filter(m=>m.t==='take'),steal=mv.filter(m=>m.t==='steal'),ret=mv.filter(m=>m.t==='return');
  for(const m of take.concat(steal)){const k=TB.kingdomInfo(m.kc);const rec=recK()===m.k;
    h+='<div class="offer'+(rec?' rec':'')+'"><button class="kcth" data-a="kc" data-n="'+m.kc+'" aria-label="Read '+esc(k.name)+'">'+kcEl(m.kc,52).outerHTML+'</button><div class="ob"><b>'+esc(k.name)+'</b> <em>'+SUIT_N[k.suit]+'</em>'+(rec?' <span class="rtag">'+ico('star')+'Suggested</span>':'')+'<p>'+esc(k.text)+'</p>'+(m.t==='steal'?'<p class="st-n">Steal it from '+esc(nameOf(m.s2))+'.</p>':'')+(rec?'':'<button class="btn" data-a="mv" data-k="'+esc(m.k)+'">'+(m.t==='steal'?'Steal':'Take')+'</button>')+'</div></div>'}
  for(const m of ret){const rec=recK()===m.k;h+='<div class="offer ret'+(rec?' rec':'')+'"><div class="ob"><b>Keep your card</b><p>Take your bid card back into your hand and take nothing.</p>'+(rec?'':'<button class="btn" data-a="mv" data-k="'+esc(m.k)+'">Take it back</button>')+'</div></div>'}
  return h+'</div>'}
// Action menus (Spring / Day / Autumn): the suggestion and "End" are always visible; everything else is folded into groups
const MGROUP=[['supp','Send Supporters','Each adds +1 Strength in a region\'s first Clash; all are spent in Winter.'],['govern','Govern','Put a hand card with votes into a Council (once a round).'],['journey','Journey','Send a hand card away for Lore (once a round).'],['cmd','Card abilities','Commands printed on your cards.'],['t','Tactics','Your faction\'s once-only powers.'],['fav','Kingdom\'s Favour','Your faction\'s Favour power.'],['council','Councils','What your Council cards allow.'],['kc','Kingdom Cards','Powers of the Kingdom Cards you hold.'],['other','Other','']];
function mgroup(a){if(a==='supp'||a==='govern'||a==='journey')return a;const p=a.split(':')[0];if(p==='cmd'||p==='t'||p==='fav'||p==='council')return p;if(/^kc\d/.test(a))return 'kc';return 'other'}
function menuHTML(s,mv,rm,pulse){let h='';const acts=mv.filter(m=>m.t==='act'),done=mv.find(m=>m.t==='done');let f='';
  const byG={};for(const m of acts){(byG[mgroup(m.a)]=byG[mgroup(m.a)]||[]).push(m)}
  if(!acts.length)h+='<p class="hint">Nothing to do in this step: finish it.</p>';
  if(acts.length){h+='<details class="more"'+(UI.moreOpen?' open':'')+' data-more="1"><summary>'+(rm&&rm.t==='act'?'Other actions':'Actions')+' ('+acts.length+')</summary>';
    for(const [g,nmG,dsc] of MGROUP){const L=byG[g];if(!L)continue;h+='<p class="grp-h">'+gloss(nmG)+'</p>'+(dsc?'<p class="grp-n">'+gloss(dsc)+'</p>':'');
      if(g==='supp'){const byR={};for(const m of L){(byR[m.p.r]=byR[m.p.r]||[]).push(m)}
        for(const r in byR){h+='<div class="sup-r"><span>'+esc(REG[r])+'</span>'+byR[r].map(m=>'<button class="nb'+(recK()===m.k?' rec':'')+'" data-a="mv" data-k="'+esc(m.k)+'" aria-label="Send '+m.p.n+' to '+esc(REG[r])+'">'+m.p.n+'</button>').join('')+'</div>'}continue}
      h+='<div class="opts">'+L.map(m=>optBtn(m,'act','')).join('')+'</div>'}
    h+='</details>'}
  if(done)f+='<button class="btn'+(rm&&rm.k===done.k?' pri'+(pulse?' pulse':''):'')+'" data-a="mv" data-k="'+esc(done.k)+'">'+esc(recBtnText(done))+'</button>';
  if(rm&&rm.t==='act')f+=pbtn(rm,recBtnText(rm),pulse);
  return {h,f}}
function selHTML(s,mv,rm,q,pulse){const items=mv.filter(m=>m.t==='sel'),dn=mv.find(m=>m.t==='seldone');let h='',f='';
  const ch=(q.chosen||[]).map(v=>chipFor(v));h+=(ch.length?'<p class="chosen">Chosen: '+ch.join(' ')+'</p>':'')+(q.max!=null&&q.max<items.length+ch.length?'<p class="hint">Choose up to '+q.max+(q.min?' (at least '+q.min+')':'')+'.</p>':'');
  h+='<div class="opts">'+items.map(m=>optBtn(m,'',typeof m.v==='number'&&m.v<10000&&ownerOf(m.v)===s?'<span class="th" data-owner="'+s+'" data-up="1">'+cardEl(m.v,44).outerHTML+'</span>':'')).join('')+'</div>';
  if(dn)f+='<button class="btn'+(rm&&rm.k===dn.k?' pri'+(pulse?' pulse':''):'')+'" data-a="mv" data-k="'+esc(dn.k)+'">'+esc(dn.label)+'</button>';
  if(rm&&rm.t==='sel')f+=pbtn(rm,recBtnText(rm),pulse);
  return {h,f}}
function cardOwnerOK(id){const o=ownerOf(id);return o===vs()||G.pl[o]&&(G.reg.some(R=>R.up.includes(id)))}
function chipFor(v){try{if(typeof v==='number'&&v<10000)return '<span class="chp">'+esc(TB.cardName(G,v))+'</span>'}catch(e){}return '<span class="chp">'+esc(v)+'</span>'}
