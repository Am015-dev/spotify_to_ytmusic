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
function renderBar(){const el=$('#barstat');if(!el)return;if(!G)return;const t=statusText();const r=Math.max(1,G.round);
  el.innerHTML='<span class="st-r" aria-hidden="true">R'+r+'/'+G.rounds+'</span>'+(t.seat>=0&&G.pl[t.seat]?'<i class="st-d" style="background:'+fcol(t.seat)+'"></i>':'')+'<span class="st-t" role="status" aria-label="'+esc(t.text)+'">'+esc(t.text)+'</span>'}
// the one status line (8 words or fewer): what to do now, or what the computer just did
function words8(x){const w=String(x||'').replace(/\s+/g,' ').trim().split(' ').filter(Boolean);return w.length<=8?w.join(' '):w.slice(0,7).join(' ').replace(/[,:;.]$/,'')+'\u2026'}
function statusText(){const o=t=>({text:words8(t),seat:-1});
  if(!G)return o('');if(G.over)return o('The reign is over');
  const c=UI.card;
  if(c&&c.kind==='pass')return o('Pass the device');
  if(c&&c.kind==='over')return o('The reign is over');
  if(c&&c.kind==='news'&&c.items&&c.items[0]){const it=c.items[0];return {text:words8(plain(it.text)),seat:it.s}}
  if(c&&c.kind==='event'){const e=c.ev;if(e.t==='bids')return o('Bids revealed');if(e.t==='clash')return {text:words8(UI._clashLine||'The Clash'),seat:-1};if(e.t==='summary')return o(e.last?'The last round is over':'Round '+e.round+' is over')}
  const s=viewSeatForQ();const q=G.q;
  if(q&&s!=null){const M=UI.bf;const co=UI._coachTitle;if(co)return o(co);
    if(M&&M.kind){switch(M.kind){
      case 'bid':return o(UI.hand!=null?'Tap the bid spot':'Pick a card to bid');
      case 'bidRes':return o('Take a Kingdom Card');
      case 'herald':return o('Place your Herald');
      case 'place':return o(UI.hand!=null?'Tap the glowing region':placeProgress());
      case 'tie':return o('Tie! Add a card or pass');
      case 'location':return o('Claim a location');
      case 'clashOrder':return o((UI.ord||[]).length?'Tap the next region':'Tap the first Clash');
      case 'menu':{const ph=menuPhase(q);if(ph==='Day'){try{const P=preview();if(P&&P.dead.some(d=>ownerOf(d.id)===s))return o('A Deadly card will eliminate yours')}catch(e){}}return o(ph==='Spring'&&M.regs.length?'Tap a region to send Supporters':ph==='Day'?'Use a power, or Done':ph==='Autumn'?'Autumn: use a power, or Done':'Use a power, or Done')}
      default:return o(promptText(q,s))}}
    return o(promptText(q,s))}
  // somebody else is deciding
  const last=G.log[G.log.length-1];const n=UI.nowT&&UI.nowT.at===G.logN?UI.nowT:null;
  if(n)return {text:words8(plain(n.t)),seat:n.s};
  if(q&&q.seats.length){const names=q.seats.map(x=>shortName(x).replace(' (you)',''));return {text:words8(names.join(' and ')+' is deciding'),seat:q.seats[0]}}
  if(last)return {text:words8(plain(last.t)),seat:last.s};
  return o('')}
const ICO={round:'<path d="M5 20V9l7-5 7 5v11M9 20v-6h6v6"/>',book:'<path d="M4 5c3-1 6-1 8 1 2-2 5-2 8-1v13c-3-1-6-1-8 1-2-2-5-2-8-1zM12 6v13"/>',log:'<path d="M6 3h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6zM6 3v18M10 8h6M10 12h6M10 16h4"/>',users:'<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-4 3-6 6-6s6 2 6 6M15 14c3 0 6 1.5 6 5"/>',crown:'<path d="M3 18h18l-1.5-9-4.5 4-3-7-3 7-4.5-4z"/>',menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',card:'<rect x="6" y="3" width="12" height="18" rx="2"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>',inf:'<circle cx="12" cy="12" r="8"/><path d="M8 14l1-5 3 3 3-3 1 5z"/>',eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',star:'<path d="M12 3l2.6 6 6.4.6-4.9 4.2 1.5 6.3L12 17l-5.6 3.1 1.5-6.3L3 9.6 9.4 9z"/>',road:'<path d="M5 20L9 4M19 20L15 4M12 6v3M12 12v3M12 18v2"/>'};
function ico(n,c){return '<svg class="ico '+(c||'')+'" viewBox="0 0 24 24" aria-hidden="true">'+(ICO[n]||'')+'</svg>'}
// ---------------------------------------------------------------- roadmap
function renderRoad(){}
// ---------------------------------------------------------------- recommended move (+ the guided script may choose a simpler teaching move)
function qKey(s,mv){return G.logN+':'+(G.q?G.q.kind:'')+':'+s+':'+(G.q&&G.q.chosen?G.q.chosen.length:'')+':'+(mv?mv.length:0)+':'+(UI.cfg&&UI.cfg.guided?1:0)}
function getRec(s,mv){const key=qKey(s,mv);if(UI._rk===key)return UI._rec;UI._rk=key;let A=null;try{A=advise(s,mv)}catch(e){console.warn('advise',e.message)}
  UI._adv=A;UI._rec=A?A.m:null;UI._recWhy=A?A.why:'';return UI._rec}
// suggestions are on in the guided game and in rounds 1-2; later only on request (the "Suggest a move" button)
function hintsAuto(){return isGuided()||UI.guide!=='off'&&G.round<=2}
function hintsShown(s,mv){return hintsAuto()||UI.hintQ===qKey(s,mv)}
const recK=()=>UI._recShown&&UI._rec&&UI._rec.k;
function whyFor(s,mv){if(!mv)return '';const q=G.q,k=q.kind;
  if(k==='bid'){const i=cinfo(mv.id);const hand=G.pl[s].hand.map(id=>cinfo(id).strength).sort((a,b)=>b-a);
    const rank=hand.indexOf(i.strength)+1;
    return i.strength>=hand[Math.min(1,hand.length-1)]?'A high bid ('+i.strength+') chooses early, but this card then sits under the Kingdom Card and cannot fight.':
      rank>=hand.length-1?'A cheap bid ('+i.strength+') keeps your strong cards for the Clashes. You may choose late; you can always take your card back.':
      'A middle bid ('+i.strength+') can still win a good Kingdom Card while your strongest cards stay free for the Clashes.'}
  if(k==='herald'){const l=mv.loc,inf=DD.LOCS[l][2];const riv=G.pl.filter(p=>p.seat!==s&&p.herald===l).map(p=>shortName(p.seat));
    return LOCN[l]+' pays +'+inf+' Influence'+(DD.LOCS[l][3]?' and '+lcFirst(DD.LOCS[l][3]):'')+'. '+(riv.length?riv.join(', ')+(riv.length>1?' have':' has')+' a Herald here: win here and you take 1 Influence from each.':'Win this region and claim it, and your Herald earns +1.')}
  if(k==='place'||k==='tie'){if(mv.pass)return 'Passing keeps your cards. If everyone passes, nobody wins this region.';const i=cinfo(mv.id);const r=mv.r!=null?REG[mv.r]:'the tied region';
    const hr=G.pl[s].herald>=0?G.pl[s].herald>>1:-1;return 'Strength '+i.strength+' in '+r+(mv.r===hr?' (your Herald waits here)':'')+(i.strength>=7?': a strong card where the prize is worth it.':i.strength<=2?': a cheap card, a bluff that saves better ones.':': a solid middle card.')}
  if(k==='bidRes'){if(mv.t==='return')return 'Nothing on offer is worth a card: take it back and keep your hand full.';if(mv.t==='steal')return 'Stealing takes a Kingdom Card from a rival; their card under it goes back to their hand.';const kk=TB.kingdomInfo(mv.kc);return 'It works for you every round you keep it: '+lcFirst(kk.text)+'.'}
  if(k==='location'){return LOCN[mv.loc]+' pays +'+DD.LOCS[mv.loc][2]+' Influence'+(DD.LOCS[mv.loc][3]?' and '+lcFirst(DD.LOCS[mv.loc][3]):'')+'.'+(G.pl[s].herald===mv.loc?' Your Herald is here: +1 more, and you take 1 from each rival Herald here.':'')}
  if(k==='clashOrder')return 'Your strongest region fights first.';
  if(G.q.t==='menu')return menuWhy(mv);
  if(G.q.t==='sel'){if(mv.t==='seldone')return 'Nothing more here is worth it right now.';
    if(k==='siteBuy')return 'Site of Power cards are stronger than your basic cards; buying one now makes your deck better for the rest of the game.';
    if(k==='shrine')return 'Cards at the bottom of your deck come back later, after a reshuffle; weak cards there leave room for better draws.';
    if(k==='ossuary')return 'It brings a useful card back from your discard pile.';
    if(k==='rally'||k==='brine')return 'Taking strong cards back to your hand saves them from Winter\'s discard.';
    return 'Of the choices here this one gains you the most.'}
  if(k==='occupier')return 'The card under a Kingdom Card cannot fight.';
  if(k==='slot')return 'The Kingdom Card you replace is the one that helps you least now.';
  if(k==='councilOut')return 'A card back in your hand can fight again next round.';
  if(k==='flank'||k==='journeyDest')return 'Your card does more good there.';
  if(k==='castle'||k==='wilderness')return mv.skip||/^Skip/.test(mv.label||'')?'No card here is worth giving up.':'This card is worth less in your hand than what you gain.';
  if(q.t==='pick'&&mv.yes!=null)return mv.yes?'Using it now gains more than saving it.':'Saving it for a better moment is worth more.';
  return 'Of the choices here this one gains you the most.'}
function menuWhy(m){if(m.t==='done')return 'Nothing else here helps right now, so finish this step.';const a=m.a||'';
  if(a==='supp')return 'Each Supporter adds +1 Strength in that region\'s first Clash. Supporters on the map go to the Lost Pile in Winter.';
  if(a==='govern')return 'A card in a Council gives a lasting bonus every round.';
  if(a==='journey')return 'Lore buys your faction\'s Site of Power cards: stronger cards for later rounds.';
  if(a.startsWith('t:'))return 'A Tactic of your faction ('+tacUses(vs(),a.slice(2))+').';
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
function optBtn(m,cls,extra){const rec=recK()===m.k;return '<button class="opt'+(cls?' '+cls:'')+(rec?' rec':'')+'" data-a="mv" data-k="'+esc(m.k)+'">'+(extra||'')+'<span class="ot">'+esc(plain(m.label))+'</span>'+(rec?'<span class="rtag">'+ico('star')+'Suggested</span>':'')+'</button>'}
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
  if(m.t==='done')return doneText();if(m.t==='seldone')return m.label;
  if(G.q.t==='menu'&&m.a==='supp')return 'Send '+m.p.n+' to '+REG[m.p.r].replace('The ','');
  if(G.q.t==='menu'&&m.a==='journey')return 'Journey with '+cinfo(m.p.id).name;
  if(G.q.t==='menu'&&m.a==='govern')return 'Govern: '+cinfo(m.p.id).name+' into the '+DD.COUNCIL_NAMES[m.p.c];
  // the same power offered several ways: the button says which one (it matches the Suggested row)
  const t=m.label.replace(/:.*$/,''),vq=viewSeatForQ();if(G.q.t==='menu'&&vq!=null&&legal(vq).filter(x=>x.t==='act'&&(x.label||'').replace(/:.*$/,'')===t).length>1)return m.label.replace(/\.$/,'');
  return m.label.replace(/\s*\([^)]*\)\s*$/,'').replace(/:.*$/,'')}
function doneText(){const ph=menuPhase(G.q);return ph==='Spring'?'Done with Spring':ph==='Day'?'Done: fight the Clash':ph==='Autumn'?'Done with Autumn':'Done'}
function renderMain(){const el=$('#main'),ft=$('#act');if(!el||!ft)return;const q=G.q;
  const qk=(q?q.kind+'|'+q.title+'|'+G.logN:'')+'|'+(UI.card?UI.card.kind:'');
  const set=(h,f,sheet)=>{if(el.innerHTML!==h)el.innerHTML=h;el.classList.toggle('on',!!sheet&&!!h);f=f||'';if(ft._h!==f){ft._h=f;ft.innerHTML=f}ft.classList.toggle('has',!!f);if(UI._qk!==qk){UI._qk=qk;el.scrollTop=0;UI.sheetOpen=false;UI.ord=[]}moreCue()};
  UI._recShown=false;UI.bf=null;UI._coachTitle='';
  if(G.over){set('','');setHl([]);return}
  if(UI.card&&UI.card.kind!=='tip'){set('','');setHl([]);return}
  const s=viewSeatForQ();
  if(!q||s==null){set('',UI.mode==='watch'?watchControls():'');setHl([]);return}
  const mv=legal(s);const rec=getRec(s,mv);const shown=!!rec&&hintsShown(s,mv);UI._recShown=shown;const rm=shown?mv.find(m=>m.k===rec.k):null;
  const co=typeof coachFor==='function'?coachFor(s,mv,rm):null;UI._coachOn=!!co;UI._coachTitle=co&&/^New/.test(co.title||'')?co.title:'';
  const M=bfModel(s,mv,rm);UI.bf=M;const pulse=!!(co&&co.pulse);
  const hintBtn=!shown&&rec&&UI.guide!=='off'?'<button class="btn chipb hintb" data-a="hint" aria-label="Show a hint">'+ico('star')+'<span>Hint</span></button>':'';
  let h='',f='',sheet=false;const hl=[],hr=[],recT={};
  const pass=mv.find(m=>m.pass);
  switch(M.kind){
   case 'bid':if(rm&&rm.id!=null)recT.spot=1;break;
   case 'bidRes':{const ret=mv.find(m=>m.t==='return');if(ret)f+='<button class="btn'+(rm&&rm.k===ret.k?' pri'+(pulse?' pulse':''):'')+'" data-a="mv" data-k="'+esc(ret.k)+'">'+ico('card')+'<span>Keep my card</span></button>';break}
   case 'herald':case 'location':M.locs.forEach(l=>hl.push(l));if(rm)recT.loc=rm.loc;break;
   case 'place':case 'tie':{if(UI.hand!=null)M.regsFor(UI.hand).forEach(r=>hr.push(r));if(rm&&rm.r!=null)recT.reg=rm.r;else if(rm&&q.kind==='tie'&&G.clash)recT.reg=G.clash.r;
     if(pass)f+='<button class="btn'+(rm&&rm.pass?' pri'+(pulse?' pulse':''):'')+'" data-a="mv" data-k="'+esc(pass.k)+'">Pass</button>';break}
   case 'clashOrder':{M.nextRegs().forEach(r=>hr.push(r));if(rm&&rm.order){const nx=rm.order[(UI.ord||[]).length];if(nx!=null)recT.reg=nx}
     if((UI.ord||[]).length)f+='<button class="btn" data-a="ordundo">'+ico('x')+'<span>Undo</span></button>';break}
   case 'menu':{const done=mv.find(m=>m.t==='done');M.regs.forEach(r=>hr.push(r));if(rm&&rm.a==='supp'&&rm.p)recT.reg=rm.p.r;
     if(done)f+='<button class="btn'+(rm&&rm.k===done.k?' pri'+(pulse?' pulse':''):'')+'" data-a="mv" data-k="'+esc(done.k)+'">'+esc(doneText())+'</button>';
     if(M.powers.length){const rp=rm&&rm.t==='act'&&rm.a!=='supp';f+='<button class="btn'+(rp?' pri'+(pulse?' pulse':''):'')+'" data-a="powers" aria-pressed="'+!!UI.sheetOpen+'">Powers <b>'+M.powers.length+'</b></button>';
       if(UI.sheetOpen||(rp&&UI.guide==='full'&&G.round>1&&false)){const r=menuHTML(s,mv,rm,pulse);h+='<div class="step" data-q="menu"><h3 class="st">'+esc(menuTitle(q))+'</h3>'+r.h+'</div>';sheet=true}}
     break}
   default:{ // anything else: a compact list above the tray
     h+='<div class="step" data-q="'+q.kind+'"><h3 class="st">'+esc(co&&co.title&&/^New/.test(co.title)?co.title:(KIND_NAME[q.kind]||titleOf(q)))+'</h3>';
     h+='<p class="pr">'+gloss(promptText(q,s))+'</p>';
     if(NET.on&&q.simul){const oth=q.seats.filter(x=>x!==s);if(oth.length)h+='<p class="hint dec">Waiting: '+esc(shortT(oth.map(seatWho).join(', ')))+'</p>'}
     if(q.t==='sel'){const r=selHTML(s,mv,rm,q,pulse);h+=r.h;f+=r.f}
     else{h+='<div class="opts">'+mv.map(m=>optBtn(m,'',thumbFor(m))).join('')+'</div>';if(rm)f+=pbtn(rm,recBtnText(rm),pulse)}
     h+='</div>';sheet=true}}
  set(h,hintBtn+f,sheet);setHl(hl,hr,recT)}
// a gentle cue when the decision list continues below the visible part
function moreCue(){const el=$('#main');if(!el)return;const on=el.scrollHeight>el.clientHeight+8&&el.scrollTop+el.clientHeight<el.scrollHeight-8;el.classList.toggle('more-below',on)}
document.addEventListener('scroll',e=>{if(e.target&&e.target.id==='main')moreCue()},true);
function menuTitle(q){const ph=menuPhase(q);if(ph==='Day')return G.clash?'Before the Clash in '+REG[G.clash.r]:'Day';return ph?'Your options this '+ph:'Your options'}
const QNAME={discardPick:'Discard a card',discardDown:'Too many cards',applause:'Set the turn order',flank:'Flank',castle:'Govern',wilderness:'Journey',siteBuy:'Spend Lore',ossuary:'Ossuary bonus',shrine:'Moss Altar bonus',harvest:'The Favour',rally:'Rally',retreat:'Retreat',ambushCard:'Ambush',occupier:'Choose the occupier',slot:'Choose a slot',placeRegion:'Choose a region',placeLoc:'Choose a location',journeyDest:'Journey',brine:'Brine-Hardened',edict:'A Tactic',relics:'Council of Coin',order:'Turn order'};
function titleOf(q){if(q.t==='menu'){const ph=menuPhase(q);return ph?ph+' actions':'Your actions'}if(QNAME[q.kind])return QNAME[q.kind];const t=(q.title||'').replace(/^[^:]*:\s*/,'');return t.length>28?'Your choice':t}
function promptText(q,s){const t=q.title||'';
  switch(q.kind){case 'bid':return 'Pick a secret bid';
    case 'herald':return 'Place your Herald';
    case 'place':return t.indexOf('fewer')>=0&&t.split(' ').length<=8?t:'Hide a card: '+placeProgress();
    case 'bidRes':return 'Take a Kingdom Card';
    case 'location':return 'Claim a location';
    case 'discardPick':return 'Discard a card';
    case 'applause':return 'Set the turn order';
    case 'clashOrder':return 'Choose the Clash order';
    default:if(q.t==='menu'){const ph=menuPhase(q);return ph==='Day'?'Use a power, or tap Done':'Use a power, or tap Done'}return shortT(plain(t))}}
function shortT(x){const w=String(x||'').split(/\s+/).filter(Boolean);return w.length<=8?w.join(' '):w.slice(0,7).join(' ').replace(/[,:;.]$/,'')+'...'}
function placeProgress(){const me=vs();let n=0;for(const R of UI.V.reg)for(const id of R.down)if(id>=0&&ownerOf(id)===me)n++;
  const mv=me>=0?legal(me):[];const rs=[...new Set(mv.map(m=>m.r))];return 'card '+Math.min(3,n+1)+' of 3'+(rs.length===1?', for '+REG[rs[0]]:'')}
function recLine(s,rm){if(!rm)return '';return '<p class="rec-l">'+ico('star')+'<span><b>Suggested:</b> '+esc(shortRec(rm))+' <span class="why2">'+gloss(UI._recWhy||'')+'</span></span></p>'}
function shortRec(m){const q=G.q;if(q.kind==='bid')return cinfo(m.id).name+' ('+cinfo(m.id).strength+').';if(q.kind==='herald')return LOCN[m.loc]+'.';if(q.kind==='place'||q.kind==='tie')return m.pass?'pass.':cinfo(m.id).name+(m.r!=null?' at '+REG[m.r]:'')+'.';if(q.kind==='location')return LOCN[m.loc]+'.';if(m.t==='done')return 'finish this step.';if(m.t==='act'&&m.a!=='supp')return m.label.replace(/:.*$/,'')+'.';if(m.t==='act')return m.label+'.';return m.label.replace(/\.$/,'')+'.'}
function heraldDots(l){const o=G.pl.filter(p=>p.herald===l);return o.length?'<span class="hd">'+o.map(p=>'<i style="background:'+fcol(p.seat)+'" title="'+esc(p.name)+'"></i>').join('')+'</span>':''}
function orderChips(o){return '<span class="oc">'+o.map((r,i)=>'<i>'+['I','II','III'][i]+'</i>'+esc(REG[r].replace('The ',''))).join('<em>›</em>')+'</span>'}
// Kingdom Card offers (bid resolution)
function bidResHTML(s,mv){let h='<div class="offers">';
  const take=mv.filter(m=>m.t==='take'),steal=mv.filter(m=>m.t==='steal'),ret=mv.filter(m=>m.t==='return');
  for(const m of take.concat(steal).sort((a,b)=>(recK()===b.k)-(recK()===a.k))){const k=TB.kingdomInfo(m.kc);const rec=recK()===m.k;
    h+='<div class="offer'+(rec?' rec':'')+'"><button class="kcth" data-a="kc" data-n="'+m.kc+'" aria-label="Read '+esc(k.name)+'">'+kcEl(m.kc,52).outerHTML+'</button><div class="ob"><b>'+esc(k.name)+'</b> <em>'+SUIT_N[k.suit]+'</em>'+(rec?' <span class="rtag">'+ico('star')+'Suggested</span>':'')+(m.t==='steal'?'<p class="st-n">'+shortT(stealPreview(s,m).replace(/<[^>]*>/g,''))+'</p>':'')+'<button class="btn" data-a="'+(m.t==='steal'?'confirm':'mv')+'" data-k="'+esc(m.k)+'">'+(m.t==='steal'?'Steal':'Take')+'</button></div></div>'}
  for(const m of ret){const rec=recK()===m.k;h+='<div class="offer ret'+(rec?' rec':'')+'"><div class="ob"><b>Keep your card</b><p>Take nothing</p><button class="btn" data-a="mv" data-k="'+esc(m.k)+'">Take it back</button></div></div>'}
  return h+'</div>'}
// Action menus (Spring / Day / Autumn): one screen per season. Every option is a row (what it costs, what it does, what you gain), all visible,
// the list scrolls above the pinned action row, and one Done button ends the season.
const MGROUP=[['supp','Supporters',''],['cmd','Card abilities','Powers printed on your cards in play.'],['t','Tactics','Your faction\'s Tactics.'],['fav','Kingdom\'s Favour',''],['kc','Kingdom Cards and HQ','Powers of what you hold.'],['council','Councils',''],['govern','Govern','Once a round: a hand card with votes goes into a Council.'],['journey','Journey','Once a round: a hand card goes away for Lore.'],['other','Other','']];
function mgroup(a){if(a==='supp'||a==='govern'||a==='journey')return a;const p=a.split(':')[0];if(p==='cmd'||p==='card')return 'cmd';if(p==='t'||p==='fav'||p==='council')return p;if(/^kc\d/.test(a)||p==='hq')return 'kc';return 'other'}
function rowInfo(s,m){const a=m.a||'',lab=m.label||'';const i=lab.indexOf(':');let title=i>0?lab.slice(0,i):lab,eff=i>0?lab.slice(i+1).trim():'',cost='',gain='';
  if(a.startsWith('t:'))cost='Tactic: '+tacUses(s,a.slice(2));
  else if(a.startsWith('fav:'))cost='Favour: '+(G.fav.h===s?G.fav.u+' use'+(G.fav.u>1?'s':'')+' left':'used without the disc');
  else if(a==='journey'){title='Journey with '+cinfo(m.p.id).name;eff='The card goes '+(cinfo(m.p.id).traits.includes('path')?'to your Discard Pile (Pathfinder)':'to the Lost Pile')+'.';cost='the card leaves your hand';gain='+'+cinfo(m.p.id).lore+' Lore'}
  else if(a==='govern'){title='Govern with '+cinfo(m.p.id).name;eff='Into the '+DD.COUNCIL_NAMES[m.p.c]+': '+CPLAIN[m.p.c];cost='the card leaves your hand';gain=cinfo(m.p.id).votes+' vote'+(cinfo(m.p.id).votes>1?'s':'')}
  else if(/then discard this card|discard it\b|discard it and|discard this card/i.test(lab))cost='the Kingdom Card is used up';
  return {title,eff:eff.replace(/^./,c=>c.toUpperCase()),cost,gain}}
function rowHTML(s,m,day){const I=rowInfo(s,m);const rec=recK()===m.k;let g=I.gain;
  if(day){const r=simCached(m);if(r&&r.P)g='then: '+youFirst(Object.keys(r.P.tot).map(Number)).map(x=>(x===s?'you ':sideName(x)+' ')+r.P.tot[x]).join(' vs ')}
  const conf=m.a==='t:cln_t3';
  return '<div class="orow'+(rec?' rec':'')+'"><div class="ob"><b>'+gloss(I.title)+'</b>'+(rec?' <span class="rtag">'+ico('star')+'Suggested</span>':'')+(I.eff&&I.eff.split(/\s+/).length<=8?'<span class="oe">'+gloss(I.eff)+'</span>':'')+((I.cost||g)?'<small class="oc2">'+(I.cost?'<em>Cost:</em> '+esc(shortT(I.cost)):'')+(I.cost&&g?' · ':'')+(g?'<em>Gain:</em> '+esc(shortT(g)):'')+'</small>':'')+'</div><button class="btn sm" data-a="'+(conf?'confirm':'mv')+'" data-k="'+esc(m.k)+'">Use</button></div>'}
function simCached(m){const key=G.logN+'|'+m.k;UI._simc=UI._simc||{};if(UI._simc.n!==G.logN)UI._simc={n:G.logN};if(!(key in UI._simc)){let r=null;try{r=simDay(m)}catch(e){}UI._simc[key]=r}return UI._simc[key]}
function menuHTML(s,mv,rm,pulse){let h='';const ph=menuPhase(G.q),day=ph==='Day';const acts=visibleActs(mv).filter(m=>m.t==='act'&&m.a!=='supp');
  const byG={};for(const m of acts){(byG[mgroup(m.a)]=byG[mgroup(m.a)]||[]).push(m)}
  const rk=recK();for(const g in byG)byG[g].sort((x,y)=>(y.k===rk)-(x.k===rk));
  const rg=acts.find(m=>m.k===rk);const GORD=rg?MGROUP.slice().sort((x,y)=>(y[0]===mgroup(rg.a))-(x[0]===mgroup(rg.a))):MGROUP;
  for(const [g,nmG] of GORD){const L=byG[g];if(!L)continue;h+='<p class="grp-h">'+gloss(nmG)+'</p>'+L.map(m=>rowHTML(s,m,day)).join('')}
  return {h,f:''}}
function selHTML(s,mv,rm,q,pulse){const items=mv.filter(m=>m.t==='sel'),dn=mv.find(m=>m.t==='seldone');let h='',f='';
  const ch=(q.chosen||[]).map(v=>chipFor(v));h+=(ch.length?'<p class="chosen">Chosen: '+ch.join(' ')+'</p>':'')+(q.max!=null&&q.max<items.length+ch.length?'<p class="hint">Choose up to '+q.max+(q.min?' (at least '+q.min+')':'')+'.</p>':'');
  h+='<div class="opts">'+items.map(m=>optBtn(m,'',typeof m.v==='number'&&m.v<10000&&ownerOf(m.v)===s?'<span class="th" data-owner="'+s+'" data-up="1">'+cardEl(m.v,44).outerHTML+'</span>':'')).join('')+'</div>';
  if(dn)f+='<button class="btn'+(rm&&rm.k===dn.k?' pri'+(pulse?' pulse':''):'')+'" data-a="mv" data-k="'+esc(dn.k)+'">'+esc(dn.label)+'</button>';
  if(rm&&rm.t==='sel')f+=pbtn(rm,recBtnText(rm),pulse);
  return {h,f}}
function cardOwnerOK(id){const o=ownerOf(id);return o===vs()||G.pl[o]&&(G.reg.some(R=>R.up.includes(id)))}
function chipFor(v){try{if(typeof v==='number'&&v<10000)return '<span class="chp">'+esc(TB.cardName(G,v))+'</span>'}catch(e){}return '<span class="chp">'+esc(v)+'</span>'}
