// ===================== part 7: plain words (log lines, glossary), the guided first game, title + setup screens =====================
// ---------------------------------------------------------------- plain log lines: "Heathbound Clans gains 2" -> "You gain 2" for the local player
function myName(){if(!G)return null;if(NET.on){const m=NET.mySeat;return m>=0?G.pl[m].name:null}if(hotSeat()||UI.mode==='watch')return null;const h=humans();return h.length===1?G.pl[h[0]].name:null}
const escRe=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
function verbYou(w){const l=w.toLowerCase();if(l==='has')return 'have';if(l==='is')return 'are';if(l==='was')return 'were';if(l==='does')return 'do';
  if(/[^aeiou]ies$/i.test(w))return w.slice(0,-3)+'y';if(/(ss|sh|ch|x|z)es$/i.test(w))return w.slice(0,-2);if(/[^s]s$/i.test(w)&&w.length>3)return w.slice(0,-1);return w}
function plain(t){const n=myName();if(!n||!t)return t;let subj=false;
  let out=t.replace(new RegExp(escRe(n)+"('s)?(?=\\W|$)( [A-Za-z]+)?",'g'),(m,poss,w,off,str)=>{const start=off===0||/[.:!?]\s*$/.test(str.slice(0,off));if(off===0)subj=true;
    const you=start?(poss?'Your':'You'):(poss?'your':'you');if(poss)return you+(w||'');if(!w)return you;if(!start&&off>0)return you+w;return you+' '+verbYou(w.trim())});
  if(subj)out=out.replace(/\btheir\b/,'your');return out}
// ---------------------------------------------------------------- "what's happening": the newest public event, in plain words
const PHASEN={spring:'Spring',summer:'Day',autumn:'Autumn'};
function aiFallback(s,q,mv){const N=G.pl[s].name;const k=q.kind;
  if(k==='bid')return N+' chooses a secret bid.';if(k==='place'&&mv.r!=null)return N+' hides a card next to '+REG[mv.r]+'.';
  if(q.t==='menu'&&mv.t==='done'){const ph=(q.title.match(/(Spring|Day|Autumn)/)||[])[1];return N+' is done with '+(ph?ph+' ':'')+'actions.'}
  if(k==='edict'||k==='statue'||k==='harvest')return N+' decides about '+(k==='edict'?'a Tactic':'a card')+'.';
  return N+' makes a choice.'}
function renderNow(){const el=$('#now');if(!el||!G)return;if(UI.coachInfo){el.innerHTML='';return}
  let t=null,s=-1;const f=UI.nowT;const last=G.log[G.log.length-1];
  if(f&&f.at===G.logN){t=f.t;s=f.s}else if(last){t=last.t;s=last.s}
  if(!t){el.innerHTML='';return}
  // an Influence change that touches you since your last decision is never lost behind later lines
  const n=myName();let mine=null;if(n){const from=UI.nowMark||0;for(let i=G.log.length-1;i>=0&&G.log[i].i>from;i--){const e=G.log[i];if(/Influence/.test(e.t)&&e.t.indexOf(n)>=0&&/steals|loses|gains/.test(e.t)){mine=e;break}}}
  const row=(tx,ss,cls)=>'<span class="nr'+(cls?' '+cls:'')+'"><i style="background:'+(ss>=0&&G.pl[ss]?fcol(ss):'#777')+'" aria-hidden="true"></i>'+esc(plain(tx))+'</span>';
  el.innerHTML=(mine&&mine.t!==t?row(mine.t,mine.s,'me'):'')+row(t,s)}
// wrap the computer step: a move that writes no log line still gets a line
(function(){const o=aiStep;aiStep=function(w){const s=w.ai[0],q=G.q,l0=G.logN;let mv=null;const oc=aiChoose;
  aiChoose=function(a,b){mv=oc(a,b);return mv};try{o(w)}finally{aiChoose=oc}
  if(G.logN===l0&&q&&mv)UI.nowT={at:G.logN,s,t:aiFallback(s,q,mv)}}})();
// ---------------------------------------------------------------- glossary: every game word can be tapped for its meaning
const GLOSS=[
 ['influence',/\bInfluence\b/,'Influence','The score. Whoever holds the most Influence when the last round ends wins the throne. You gain it by winning Clashes and claiming locations.'],
 ['kingdom card',/\bKingdom Cards?\b/,'Kingdom Card','A shared power card. Win one with your bid: it sits on your board with your bid card tucked under it, and its power works for you as long as you keep it (at most two).'],
 ['great road',/\bGreat Road\b/,'Great Road','The row of four face-up Kingdom Cards you can bid for. Cards nobody takes slide along, and the oldest is thrown away each round.'],
 ['herald',/\bHeralds?\b/,'Herald','Your one public envoy. Put it on a location in Spring. If you then win that region and claim that location, you gain +1 Influence and take 1 from every rival Herald standing there.'],
 ['supporter',/\bSupporters?\b/,'Supporter','Small followers waiting on your board. Each one you send to a region adds +1 Strength there for its first Clash. All Supporters on the map are spent in Winter.'],
 ['clash',/\bClash(es)?\b/,'Clash','The fight in one region. Everyone\'s hidden cards there are flipped, abilities are used, and the highest total Strength (cards + Supporters) wins the region.'],
 ['strength',/\bStrength\b/,'Strength','The big number at the top left of a card. In a Clash you add up the Strength of your cards there, +1 per Supporter.'],
 ['region',/\bregions?\b/i,'Region','One of the three areas of the map: the Uplands, the Tablelands and the Sinks. Each has two locations and one Clash per round.'],
 ['location',/\blocations?\b/i,'Location','One of the six places on the map. The winner of a region\'s Clash claims one of its two locations: its Influence plus its bonus.'],
 ['bid',/\bbids?\b/i,'Bid','A card you choose secretly at the start of a round. Its Strength is the bid: the highest bid picks a Kingdom Card first.'],
 ['tactic',/\bTactics?\b/,'Tactic','Four special powers of your faction. Each can be used once; then it is Exhausted (some cards can refresh them).'],
 ['lore',/\bLore\b/,'Lore','A second currency. You gain it by a Journey and spend it on your faction\'s Site of Power cards.'],
 ['site of power',/\bSite of Power\b/,'Site of Power','Your faction\'s five extra cards, bought with Lore. If you buy them all, your leftover Lore turns into Influence at the end.'],
 ['govern',/\bGovern\b/,'Govern','An Autumn action, once a round: move a hand card that shows votes into one of the three Councils.'],
 ['journey',/\bJourney\b/,'Journey','An Autumn action, once a round: send away a hand card that shows Lore, and gain that much Lore.'],
 ['council',/\bCouncils?\b/,'Council','Three Councils (Coin, Whispers, Pledges). Cards with votes placed there give you a lasting benefit every round.'],
 ['attrition',/\bAttrition\b/,'Attrition','When you must draw and your deck is empty, your discard pile becomes a new deck and your hand size drops by one (never below 3).'],
 ['favour',/\b(Kingdom's )?Favour\b/,'Kingdom\'s Favour','A disc you claim at the Gleaning Meadow. While you hold it you may use your faction\'s Favour power (three uses), and it breaks ties at the end.'],
 ['order track',/\bOrder Track\b/,'Order Track','The turn order. At the start of each round the player with the most Influence goes first.'],
 ['winter',/\bWinter\b/,'Winter','The end of a round: Heralds go home, Supporters on the map are spent, and played cards go to the discard pile.'],
 ['autumn',/\bAutumn\b/,'Autumn','After the Clashes: once each you may Govern and Journey, and use Autumn abilities.'],
 ['ambush',/\bAmbush\b/,'Ambush','A Day ability: add a hidden card from your hand to this Clash.'],
 ['retreat',/\bRetreat\b/,'Retreat','A Day ability: pull your cards, Herald or Supporters out of this region.'],
 ['flank',/\bFlank\b/,'Flank','A Day ability: move this card to a region that has not fought yet.'],
 ['deadly',/\bDeadly\b/,'Deadly','A Night effect: every opposing card in the Clash is Eliminated (sent to the Lost Pile) unless it is protected.'],
 ['rally',/\bRally\b/,'Rally','An Autumn ability: take your cards on the map back into your hand before Winter discards them.'],
 ['deploy',/\bDeploy\b/,'Deploy','An Autumn ability: put a card face up next to a region; it stays through the next Winter(s).'],
 ['lost pile',/\bLost Pile\b/,'Lost Pile','Where Eliminated cards and spent Supporters go. They do not come back when your deck is reshuffled.'],
 ['hand size',/\bhand size\b/i,'Hand size','How many cards you draw up to each round (6 at the start). Attrition lowers it.'],
 ['occupier',/\boccup(ier|ying)\b/i,'Occupier','The faction card tucked under a Kingdom Card. A rival can steal the Kingdom Card with a bid stronger than its occupier.'],
 ['exhausted',/\bExhausted\b/,'Exhausted','A used Tactic. It cannot be used again unless something refreshes it.'],
];
const GL={};GLOSS.forEach(g=>GL[g[0]]=g);
// escape + wrap the first appearance of each term in this text with a tappable chip
function gloss(text){if(text==null)return '';text=String(text);const hits=[];
  for(const [k,re] of GLOSS){const m=re.exec(text);if(m)hits.push({i:m.index,n:m[0].length,k})}
  hits.sort((a,b)=>a.i-b.i||b.n-a.n);let out='',p=0;
  for(const h of hits){if(h.i<p)continue;out+=esc(text.slice(p,h.i));const nw=!(UI.glSeen&&UI.glSeen[h.k]);out+='<button type="button" class="gl'+(nw?' new':'')+'" data-a="gloss" data-t="'+esc(h.k)+'" aria-label="'+esc(text.substr(h.i,h.n))+': what does it mean?">'+esc(text.substr(h.i,h.n))+'</button>';p=h.i+h.n}
  return out+esc(text.slice(p))}
function showGloss(k){const g=GL[k];const el=$('#gdef');if(!g||!el)return;UI.glSeen=UI.glSeen||{};UI.glSeen[k]=1;
  el.innerHTML='<p><b>'+esc(g[2])+'</b>: '+esc(g[3])+'</p><button class="pp-x" data-a="gclose" aria-label="Close">'+ico('x')+'</button>';el.hidden=false;if(typeof sfx==='function')sfx('tap')}
function hideGloss(){const el=$('#gdef');if(el){el.hidden=true;el.innerHTML=''}}
document.addEventListener('toggle',e=>{const d=e.target;if(d&&d.dataset&&d.dataset.more)UI.moreOpen=d.open},true);
// ---------------------------------------------------------------- the guided first game: fixed deal, one thing per step
// Deal: you lead the Heathbound Clans against the Gilded Court (easy), 4 rounds, seed 98 (found by a node search over seeds with the in-game names). With the suggested moves you meet the Court's Herald on
// Cairn Field and win there with your Heir and two Supporters: the +2, the Herald's +1 and the steal all happen in round 1.
const GUIDED={seed:98,ai:9,faction:'clans',rival:'nobility'};
const isGuided=()=>!!(UI.cfg&&UI.cfg.guided&&!NET.on);
const COACH_INFO=[
 {id:'goal',when:()=>G.round===1&&G.q&&G.q.kind==='bid',title:'Your goal',text:()=>'Hold the most Influence when round '+G.rounds+' ends. Influence is the score: you and the Gilded Court both start at 0 (the chips at the bottom).',hl:'#rivals'},
 {id:'map',when:()=>G.round===1&&G.q&&G.q.kind==='bid',title:'The kingdom',text:()=>'The map has three regions with two locations each. Every round each region has one Clash: the strongest side wins it and claims one of its two locations, which pays Influence. The numbers round the edge are the Influence track.',locs:[0,1,2,3,4,5]},
 {id:'round',when:()=>G.round===1&&G.q&&G.q.kind==='bid',title:'One round, five steps',text:()=>'Bid for a Kingdom Card, place your Herald, hide one card at each region, fight the three Clashes, then count Influence. Let\'s play round 1 together: tap the glowing button each time.',btn:'Let\'s start'},
 {id:'own',when:()=>G.round===2&&G.q,title:'Now you lead',text:()=>'You have seen a whole round. From now on the ★ suggestion shows a good move and why, but every choice is yours. Tap any underlined word to read what it means.',btn:'Play on'}];
function coachGate(){if(!G||!G.q||UI.coachInfo)return !!UI.coachInfo;if(!isGuided())return false;UI.coachDone=UI.coachDone||{};
  const st=COACH_INFO.find(c=>!UI.coachDone[c.id]&&c.when());if(!st)return false;UI.coachInfo={id:st.id,title:st.title,text:st.text(),btn:st.btn,hl:st.hl,hlLocs:st.locs};return true}
function coachOk(){const c=UI.coachInfo;if(!c)return;UI.coachDone=UI.coachDone||{};UI.coachDone[c.id]=1;UI.coachInfo=null;$$('.coachhl').forEach(e=>e.classList.remove('coachhl'));saveGame();pump()}
function coachInfoHTML(c){setTimeout(()=>{$$('.coachhl').forEach(e=>e.classList.remove('coachhl'));if(c.hl){const e=$(c.hl);if(e)e.classList.add('coachhl')}},0);
  const n=COACH_INFO.findIndex(x=>x.id===c.id);return '<div class="step"><h3 class="st">'+esc(c.title)+'</h3><p class="coach info">'+gloss(c.text)+'</p>'+(n>=0&&n<3?'<p class="hint">'+(n+1)+' of 3 before you play</p>':'')+'</div>'}
const menuPhase=q=>((q.title||'').match(/(Spring|Day|Autumn)/)||[])[1]||'';
const byLabel=(mv,txt)=>mv.find(m=>(m.label||'').indexOf(txt)>=0);
// teaching moves for round 1 (falls back to the normal suggestion when the scripted card is not there)
function coachRec(s,mv){if(!isGuided()||!G.q)return null;const q=G.q,k=q.kind;
  if(G.round===1){
    if(k==='bid')return byLabel(mv,'Sailing Hall');
    if(k==='bidRes')return byLabel(mv,'Knives\' Fellowship')||null;
    if(k==='herald'){const riv=G.pl.find(p=>p.seat!==s&&p.herald>=0);return riv?mv.find(m=>m.loc===riv.herald):byLabel(mv,'Cairn Field')}
    if(k==='place'){const P=G.pl[s];const heir=P.hand.find(id=>cinfo(id).archetype==='heir');if(heir!=null)return mv.find(m=>m.id===heir&&m.r===1);const big=P.hand.slice().sort((a,b)=>cinfo(b).strength-cinfo(a).strength);
      if(big.length)return mv.find(m=>m.id===big[0]&&m.r===0)||mv.find(m=>m.id===big[0]);return null}
    if(k==='clashOrder')return mv.find(m=>m.order&&m.order.join()==='2,1,0')||null;
    if(q.t==='menu'){const ph=menuPhase(q);if(ph==='Spring'&&G.pl[s].supp.r[1]===0){const m=mv.find(x=>x.a==='supp'&&x.p.r===1&&x.p.n===2);if(m)return m}return mv.find(m=>m.t==='done')}}
  if(G.round===2&&q.t==='menu'&&menuPhase(q)==='Autumn'&&!UI.coachDone.au2){return mv.find(m=>m.a==='journey')||null}
  return null}
// guided round 1: the easy Court keeps its Tactics and skips optional actions, so the newcomer's first bid and Herald work as taught
(function(){const o=aiChoose;aiChoose=function(seat,level){if(isGuided()&&G&&G.round===1&&G.q&&G.pl[seat].ai){const mv=legal(seat);
  if(G.q.kind==='edict'){const k=mv.find(m=>m.k==='no'||m.yes===0);if(k)return k}
  if(G.q.t==='menu'){const d=mv.find(m=>m.t==='done');if(d)return d}}return o(seat,level)}})();
const STEPN=(n,t)=>'Step '+n+' of 6 · '+t;
// the coach line that replaces the prompt in round 1 (and the first time a few things appear later)
function coachFor(s,mv,rm){if(!isGuided()||!G.q)return null;const q=G.q,k=q.kind,R=G.round;UI.coachDone=UI.coachDone||{};
  const nm=id=>cinfo(id).name+' ('+cinfo(id).strength+')';
  if(R===1){
    if(k==='bid')return {title:STEPN(1,'Bid'),pulse:1,noRec:1,text:'Pick a hand card as a secret bid: the higher bid picks a Kingdom Card first.'+(rm?' '+nm(rm.id)+' is fair and keeps your big cards for the Clashes.':'')};
    if(k==='bidRes')return {title:STEPN(2,'Take a Kingdom Card'),pulse:1,noRec:1,text:'Your bid was higher, so you choose first. A Kingdom Card is a lasting power; your bid card stays tucked under it.'+(rm&&rm.kc?(/Knives/.test(TB.kingdomInfo(rm.kc).name)?' Take '+TB.kingdomInfo(rm.kc).name+': your Heir becomes Deadly, so it wipes out the cards it fights. Its price: keep your Heir away from rival Followers.':' Take '+TB.kingdomInfo(rm.kc).name+' (tap it to read it).'):'')};
    if(k==='herald'){const riv=G.pl.find(p=>p.seat!==s&&p.herald>=0);return {title:STEPN(3,'Place your Herald'),pulse:1,noRec:1,text:'Win the region where your Herald stands and claim its location: +1 Influence, and you take 1 from each rival Herald there.'+(riv&&rm?' The Court is on '+LOCN[riv.herald]+': join it.':'')}}
    if(k==='place'){const n=UI.V.reg.reduce((a,R2)=>a+R2.down.filter(id=>id>=0&&ownerOf(id)===s).length,0);
      return {title:STEPN(4,'Hide a card at each region'),pulse:1,noRec:1,text:'Card '+Math.min(3,n+1)+' of 3, hidden until the Clash. '+(rm?nm(rm.id)+' to '+REG[rm.r]+(cinfo(rm.id).archetype==='heir'?': your strongest card where both Heralds wait.':'.'):'Choose a card for each region.')}}
    if(q.t==='menu'&&menuPhase(q)==='Spring'){const sent=G.pl[s].supp.r[1]>0;return {title:STEPN(5,'Send Supporters'),pulse:1,noRec:1,text:sent?'Two Supporters stand with your Heir. Now finish Spring.':'Each Supporter you send adds +1 Strength in a region\'s first Clash. Send 2 to the Tablelands to back your Heir.'}}
    if(k==='clashOrder')return {title:'Choose the Clash order',pulse:1,noRec:1,text:'The player with the least Influence decides which region fights first. Any order works: take the suggested one.'};
    if(q.t==='menu'&&menuPhase(q)==='Day')return {title:'Day actions',pulse:1,noRec:1,text:'Cards are face up. Some have Day abilities like Ambush or Flank; you need none now.'};
    if(k==='location')return {title:STEPN(6,'Claim a location'),pulse:1,noRec:1,text:'You won this Clash! Pick one of the region\'s two locations.'+(rm?' '+whyFor(s,rm):'')};
    if(k==='tie')return {title:'A tie!',pulse:1,text:'Both sides have the same total. Each of you may add one more hidden card, or pass. If nobody adds one, nobody wins here.'};
    if(q.t==='menu'&&menuPhase(q)==='Autumn')return {title:'Autumn',pulse:1,noRec:1,text:'In Autumn you may Govern and Journey. We try that next round; finish Autumn for now.'};
    if(q.t==='sel'||q.t==='pick')return {title:'A location bonus',pulse:1,text:'The location you claimed gives a bonus. '+(rm?'The suggestion is fine: '+recBtnText(rm)+'.':'Choose one.')}}
  if(R===2&&q.t==='menu'&&menuPhase(q)==='Autumn'&&!UI.coachDone.au2){if(rm&&rm.a==='journey')return {title:'Autumn: Journey and Govern',pulse:1,text:'Journey sends a hand card away for Lore, which buys your faction\'s Site of Power cards. Govern puts a card with votes into a Council for a lasting bonus. Try a Journey now.'};UI.coachDone.au2=1}
  if(R===2&&k==='siteBuy'&&!UI.coachDone.sb){return {title:'Spend Lore?',pulse:1,text:'Lore buys your Site of Power cards: strong extra cards for your deck. Keep it if nothing is affordable yet.'}}
  return null}
function coachEvent(ev){if(!isGuided())return '';UI.coachDone=UI.coachDone||{};const k='ev_'+ev.t;
  if(ev.t==='bids'&&G.round===1){const me=humans()[0];const b=ev.bids.find(x=>x.seat===me);const tac=G.log.filter(e=>e.r===1&&e.s!==me&&/ plays /.test(e.t)).map(e=>e.t)[0];
    if(b&&tac&&b.str<cinfo(b.id).strength)return 'The Court played a Tactic (a once-only power): '+tac.replace(/^.*? plays /,'').replace(/\.$/,'')+'. So your bid counts as '+b.str+' and the Court chooses first. Tactics come back later; for now just watch.';
    return 'Both bids are revealed. The higher bid chooses first; a tie goes to whoever is higher on the Order Track.'}
  if(ev.t==='clash'&&G.round===1&&!UI.coachDone[k+ev.r]){return ev.idx===0?'The hidden cards are flipped. Each side adds the Strength of its cards, +1 per Supporter. The higher total wins the region.':''}
  if(ev.t==='summary'&&ev.round===1){const me=humans()[0];const a=ev.inf1[me],b=Math.max(...ev.inf1.filter((_,i)=>i!==me));return 'Scoring: you have '+a+' Influence, the Court has '+b+'. '+(a>b?'You lead!':'Keep going.')+' The leader acts first next round. '+(G.rounds-1)+' rounds to go.'}
  return ''}
// guided: mark the Autumn coach as done once the player acts in round 2 Autumn
(function(){const o=humanMove;humanMove=function(k){if(G)UI.nowMark=G.logN;const was=G&&G.q&&G.q.t==='menu'&&menuPhase(G.q)==='Autumn'&&G.round===2;if(G&&G.q&&G.q.kind==='siteBuy'&&UI.coachDone)UI.coachDone.sb=1;const r=o(k);if(was&&r&&UI.coachDone)UI.coachDone.au2=1;return r}})();
// end screen: where the Influence came from (from the engine's own counters; a client without them shows nothing)
function overBreakdown(){const st=G.stats&&Object.keys(G.stats).some(k=>/^src:/.test(k))?G.stats:(G.over&&G.over.src)||null;if(!st)return '';
  const rows=G.pl.map(p=>{const parts=[];let sum=0;for(const k in st){const m=k.match(/^src:([a-z]+):(.*)$/);if(m&&m[1]===p.fac){parts.push([m[2],st[k]]);sum+=st[k]}}
    parts.sort((a,b)=>b[1]-a[1]);const bonus=G.over.bonus&&G.over.bonus[p.seat]||0,rest=p.inf-sum-bonus;
    if(bonus)parts.push(['Leftover Lore (Site of Power emptied)',bonus]);if(rest)parts.push([rest>0?'Taken by your Herald from rivals':'Taken by rival Heralds',rest]);
    return '<li style="--fc:'+fcol(p.seat)+'"><b>'+esc(shortName(p.seat))+'</b><span class="bd-t">'+p.inf+' Influence</span><span class="bd-l">'+(parts.length?parts.map(x=>'<i>'+esc(x[0])+' <b>'+sgn(x[1])+'</b></i>').join(''):'none')+'</span></li>'}).join('');
  return '<h4 class="bdh">Where the Influence came from</h4><ul class="rank bd2">'+rows+'</ul>'+histHTML()}
// Influence after each round (recorded from the end-of-round summaries, kept in the save)
function histHTML(){const H=UI.hist;if(!H||!H.length)return '';const mx=Math.max(1,...H.flat(),...G.pl.map(p=>p.inf));const n=H.length;
  const W=280,Ht=96,x=i=>Math.round(14+(W-28)*(n>1?i/(n-1):.5)),y=v=>Math.round(Ht-10-(Ht-22)*v/mx);
  let svg='<svg class="hist" viewBox="0 0 '+W+' '+Ht+'" role="img" aria-label="Influence after each round">';
  for(let i=0;i<n;i++)svg+='<text x="'+x(i)+'" y="'+(Ht-1)+'" text-anchor="middle" font-size="9" fill="#d8c69a">R'+(i+1)+'</text>';
  G.pl.forEach((p,s)=>{const pts=H.map((r,i)=>x(i)+','+y(r[s]||0)).join(' ');svg+='<polyline points="'+pts+'" fill="none" stroke="'+fcol(s)+'" stroke-width="2.5"/>'+H.map((r,i)=>'<circle cx="'+x(i)+'" cy="'+y(r[s]||0)+'" r="3" fill="'+fcol(s)+'"/>').join('')+'<text class="tbx-cb" x="'+(x(n-1)+6)+'" y="'+(y(H[n-1][s]||0)+4)+'" font-size="10" fill="#fff">'+GX.mark(s)+'</text>'});
  return '<h4 class="bdh">Influence round by round</h4>'+svg+'</svg>'}
// ---------------------------------------------------------------- title + setup
const STORY={
 nobility:{story:'The old court still dresses for dinner in a palace with no king. Its stewards count every coin and every vote, and they mean to crown one of their own before the frost.',enjoy:'Choose the Gilded Court if you enjoy steady income, sturdy cards and winning the Councils.',tag:'Defence and votes · easy to learn'},
 clans:{story:'From the cold coasts the clans ride in with the tide. They move fast, bring many hands, and strike where the valley folk least expect them.',enjoy:'Choose the Heathbound Clans if you enjoy big swings, riders that switch regions and crowds of Supporters.',tag:'Speed and numbers · easy to learn'},
 uprising:{story:'In the dockside alleys, printers and ferrymen pass notes by lantern-light. They cannot win a fair fight, so they never fight fair.',enjoy:'Choose the Lantern Rising if you enjoy bluffs, ambushes and knocking your rivals\' cards out of the game.',tag:'Tricks and ambushes · medium'},
 gathering:{story:'Under the moon the Choir sings to what others threw away. Lost cards return to them, small cards win their fights, and patience is their weapon.',enjoy:'Choose the Pale Choir if you enjoy clever combinations and playing the long game.',tag:'Combos and patience · harder'}};
const sv={mode:'me',np:3,faction:'clans',length:'standard',guide:'full',levels:['normal','normal','normal','normal']};
function titleArt(){return '<svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>'+
 '<linearGradient id="tsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#140a1c"/><stop offset=".45" stop-color="#3a1a30"/><stop offset=".72" stop-color="#8a3c3a"/><stop offset=".86" stop-color="#d98a52"/><stop offset="1" stop-color="#f2c27a"/></linearGradient>'+
 '<radialGradient id="tmoon" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff6d6"/><stop offset=".55" stop-color="#f6e2a8" stop-opacity=".9"/><stop offset="1" stop-color="#f6e2a8" stop-opacity="0"/></radialGradient>'+
 '<linearGradient id="tgold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe7a0"/><stop offset="1" stop-color="#9a6a1c"/></linearGradient>'+
 '<filter id="tblur" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>'+
 '<filter id="tpaint"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .35  0 0 0 0 .25  0 0 0 .22 0"/><feComposite in2="SourceGraphic" operator="in"/></filter></defs>'+
 '<rect width="1200" height="800" fill="url(#tsky)"/>'+
 [[120,80],[260,150],[410,60],[530,120],[700,40],[860,110],[1010,70],[1120,160],[330,230],[960,220],[620,190],[80,260]].map(([x,y],i)=>'<circle cx="'+x+'" cy="'+y+'" r="'+(i%3?1.6:2.4)+'" fill="#fff3d0" opacity="'+(.5+(i%4)*.12)+'"/>').join('')+
 '<circle cx="860" cy="210" r="170" fill="url(#tmoon)" opacity=".55"/><circle cx="860" cy="210" r="62" fill="#fbecc0"/><circle cx="842" cy="196" r="12" fill="#e9d29a" opacity=".6"/><circle cx="880" cy="228" r="8" fill="#e9d29a" opacity=".5"/>'+
 '<path d="M0 470 L120 400 L210 430 L320 360 L430 420 L520 380 L640 440 L760 370 L880 430 L1000 380 L1110 420 L1200 390 L1200 800 L0 800Z" fill="#4a2338" opacity=".85"/>'+
 '<path d="M0 520 C150 470 260 500 380 480 C520 455 600 520 760 500 C900 482 1020 450 1200 490 L1200 800 L0 800Z" fill="#2c1424"/>'+
 '<g fill="#1d0d18"><path d="M930 470 L930 400 L945 385 L960 400 L960 430 L985 430 L985 380 L1003 360 L1021 380 L1021 430 L1045 430 L1045 405 L1060 390 L1075 405 L1075 470Z"/><rect x="999" y="395" width="8" height="12" fill="#ffcf7a" opacity=".8"/><rect x="941" y="412" width="7" height="10" fill="#ffcf7a" opacity=".6"/></g>'+
 '<ellipse cx="600" cy="560" rx="700" ry="60" fill="#f2c27a" opacity=".16" filter="url(#tblur)"/>'+
 '<path d="M0 620 C200 570 380 600 600 585 C820 570 1000 600 1200 575 L1200 800 L0 800Z" fill="#170a12"/>'+
 // the throne, wrapped in thorns
 '<g transform="translate(600 640)"><path d="M-110 0 L-110 -210 L-128 -240 L-92 -265 L-70 -330 L-40 -300 L0 -380 L40 -300 L70 -330 L92 -265 L128 -240 L110 -210 L110 0Z" fill="#120810" stroke="url(#tgold)" stroke-width="5" stroke-linejoin="round"/>'+
 '<path d="M-150 0 L-150 -80 L-118 -96 L118 -96 L150 -80 L150 0Z" fill="#1a0c14" stroke="url(#tgold)" stroke-width="5"/><path d="M-118 -96 L-110 -130 L110 -130 L118 -96Z" fill="#2a1420" stroke="url(#tgold)" stroke-width="4"/>'+
 '<circle cx="0" cy="-300" r="14" fill="#c23a48" stroke="#ffe7a0" stroke-width="3"/>'+
 '<g fill="none" stroke="#3d7a3a" stroke-width="7" stroke-linecap="round"><path d="M-160 -10 C-60 -60 -170 -140 -90 -190 C-20 -235 -120 -290 -40 -330"/><path d="M160 -20 C70 -70 175 -150 95 -200 C30 -240 120 -300 30 -350"/><path d="M-140 -60 C-40 -120 60 -40 140 -110"/></g>'+
 '<g fill="#5aa04f">'+[[-150,-28],[-102,-70],[-128,-140],[-82,-200],[-74,-262],[-44,-318],[150,-40],[110,-90],[128,-160],[88,-215],[86,-276],[44,-336],[-80,-96],[20,-78],[110,-104]].map(([x,y],i)=>'<path d="M'+x+' '+y+' l'+(i%2?9:-9)+' -7 l2 11Z"/>').join('')+'</g>'+
 '<g fill="#c23a48"><circle cx="-96" cy="-192" r="9"/><circle cx="98" cy="-202" r="8"/><circle cx="-40" cy="-108" r="7"/></g></g>'+
 '<g fill="#2a1a10" opacity=".9"><path d="M0 800 L0 700 C60 690 120 720 180 705 L240 800Z"/><path d="M1200 800 L1200 690 C1140 684 1080 716 1010 700 L960 800Z"/></g>'+
 '<rect width="1200" height="800" filter="url(#tpaint)" fill="#fff" opacity="'+(UI.lowGfx?0:1)+'"/></svg>'}
function hasSave(){const s=loadSave();return s&&s.G&&!s.G.over?s:null}
function showStart(){try{GX.close()}catch(e){}closePop(true);hideGloss();const el=$('#start');el.hidden=false;document.body.classList.add('in-start');if(!NET.on){if(UI.joinCode&&!UI.linkShown){UI.linkShown=1;UI.sv='online'}else UI.sv=UI.onl&&UI.sv==='online'?'online':'title'}UI.cfgOpen=false;renderStart();
  const f=$('#start .tbtn.go,#start .sbtn.big');if(f)try{f.focus({preventScroll:true})}catch(e){}}
function hideStart(){$('#start').hidden=true;document.body.classList.remove('in-start')}
function renderStart(){const el=$('#start');if(!el||el.hidden)return;const top=el.scrollTop;
  const view=NET.on?'online':(UI.sv||'title');el.dataset.v=view;
  if(view==='title'){const sav=hasSave();
    el.innerHTML='<div class="ttl"><div class="ttl-art">'+titleArt()+'</div><div class="ttl-in"><h1 class="logo"><small>THE</small>Thornbound Throne</h1><p class="tag">The king is dead. Four factions reach for his crown.</p><div class="tmid"></div><div class="tbtns">'+
      '<button class="tbtn go" data-a="play"><b>Play</b><span>'+(firstTime()?'new here? a guided first game is ready':'against the computer')+'</span></button>'+
      '<button class="tbtn" data-a="online"><b>Online</b><span>with friends, free, no sign-up</span></button>'+
      (sav?'<button class="tbtn" data-a="cont"><b>Resume</b><span>your game, round '+Math.max(1,sav.G.round)+' of '+sav.G.rounds+'</span></button>':'')+
      '</div><div class="tlinks"><button class="tlink" data-a="rules">How to play</button><button class="tlink" data-a="refopen">Cards</button><button class="tlink" data-a="setopen">Settings</button></div></div><p class="st-c">Original art and words. Fonts: Cinzel and EB Garamond (SIL OFL).</p></div>';return}
  const ONL=view==='online';
  el.innerHTML='<div class="setup"><div class="bgart">'+titleArt()+'</div>'+(ONL?onlineSetupHTML():setupHTML())+'</div>'+(UI.phone&&UI.cfgOpen&&!ONL?cfgDialogHTML():'');
  el.scrollTop=top}
function firstTime(){try{return !localStorage.getItem('tb_played')}catch(e){return true}}
function facCard(f,on){const k=TBKit.FACTIONS[FK[f]],S=STORY[f];return '<button class="fcard'+(on?' on':'')+'" data-a="fac" data-v="'+f+'" style="--fc:'+k.main+'" aria-pressed="'+on+'"><span class="ft"><span class="fe">'+TBKit.token('influence',{faction:FK[f]},44).outerHTML+'</span><span><b>'+esc(DD.FNAME[f])+'</b><small>'+esc(S.tag)+'</small></span></span><p>'+esc(S.story)+'</p><p class="enj">'+esc(S.enjoy)+'</p>'+(sv.np===2&&BAL2[f]?'<p class="bal">'+esc(BAL2[f])+'</p>':'')+(on?'<span class="fpick">Your faction ✓</span>':'')+'</button>'}
// honest 2-player balance, from 500 computer games per pairing (ENGINE-REPORT.md)
const BAL2={nobility:'Strongest at 2 players: wins about 6 games in 10.',clans:'Hardest at 2 players: wins about 4 games in 10.'};
function seatRows(ONL,plan){const n=ONL?plan.np:sv.np;const rest=FIDS.filter(f=>f!==sv.faction);let h='';
  for(let i=0;i<n;i++){const f=i===0?sv.faction:rest[i-1];const k=TBKit.FACTIONS[FK[f]];const human=ONL?i<plan.hum.length:i===0;
    h+='<div class="seat" style="--fc:'+k.main+'">'+TBKit.token('influence',{faction:FK[f]},30).outerHTML+'<span class="sn"><b>'+esc(k.short)+'</b><small>'+(human?(ONL?'Online: '+esc(plan.hum[i].nm)+(i===0?' (you)':''):'You'):'Computer')+'</small></span>'+(human?'':levelSeg(i))+'</div>'}
  return '<div class="seats">'+h+'</div>'}
function levelSeg(i){return '<div class="seg" role="radiogroup" aria-label="Computer level">'+['easy','normal','hard'].map(l=>'<button class="'+(sv.levels[i]===l?'on':'')+'" data-a="lv" data-i="'+i+'" data-v="'+l+'" aria-pressed="'+(sv.levels[i]===l)+'">'+l[0].toUpperCase()+l.slice(1)+'</button>').join('')+'</div>'}
function optionsHTML(ONL,plan){return '<div class="opts2">'+(ONL?'':'<div class="row"><span>Players</span><div class="seg">'+[2,3,4].map(n=>'<button class="'+(sv.np===n?'on':'')+'" data-a="np" data-v="'+n+'">'+n+'</button>').join('')+'</div></div>')+
  '<div class="row"><span>Length</span><div class="seg">'+[['short','4 rounds'],['standard','5 rounds'],['extended','6 rounds']].map(([v,l])=>'<button class="'+(sv.length===v?'on':'')+'" data-a="len" data-v="'+v+'">'+l+'</button>').join('')+'</div></div>'+
  '<div class="row"><span>Tips</span><div class="seg">'+[['full','Full'],['light','Light'],['off','Off']].map(([v,l])=>'<button class="'+(sv.guide===v?'on':'')+'" data-a="gd" data-v="'+v+'">'+l+'</button>').join('')+'</div></div>'+seatRows(ONL,plan)+'</div>'}
function sumLine(){const n=sv.np-1;return 'You lead <b>'+esc(DD.FSHORT[sv.faction])+'</b> against '+n+' computer'+(n>1?'s':'')+' · '+({short:4,standard:5,extended:6}[sv.length])+' rounds'}
function setupHTML(){const ph=UI.phone;const k=TBKit.FACTIONS[FK[sv.faction]];
  const guide='<div class="guidebox"><p><b>First time?</b> The guided game teaches one step at a time: you lead the Heathbound Clans against an easy Gilded Court for 4 rounds (about 15 minutes).</p></div>';
  const ft=firstTime();const gbtn='<button class="sbtn'+(ft?' big':'')+'" data-a="guided" data-start="guided"><b>'+(ft?'Guided first game':'Guided game')+'</b><span>'+(ft?'recommended: learn one step at a time':'learn step by step')+'</span></button>';
  const go='<div class="sgo">'+(ft?gbtn:'')+'<button class="sbtn'+(ft?'':' big')+'" data-a="start" data-start="go"><b>Start the game</b><span>'+sumLine().replace(/<[^>]+>/g,'')+'</span></button><div class="sgrid3">'+(ft?'<button class="sbtn" data-a="rules"><b>How to play</b><span>the rules in short</span></button>':gbtn)+
    '<button class="sbtn" data-a="mode" data-v="hot" data-go="1" data-start="hot"><b>Hot-seat</b><span>'+sv.np+' people, one device</span></button>'+
    '<button class="sbtn" data-a="mode" data-v="watch" data-go="1" data-start="watch"><b>Watch</b><span>the computers play</span></button></div></div>';
  const head='<div class="shead"><button class="sback" data-a="title" aria-label="Back to the title">‹</button><h2>Choose your faction</h2></div>';
  if(ph)return head+(firstTime()?guide:'')+'<div class="ssum" style="--fc:'+k.main+'"><span class="fe">'+TBKit.token('influence',{faction:FK[sv.faction]},40).outerHTML+'</span><span class="sline">'+sumLine()+'</span><button class="btn" data-a="cfgopen">Configure</button></div><p class="ssub">'+esc(STORY[sv.faction].enjoy)+'</p>'+go;
  return head+'<p class="ssub">Each faction plays the same rules with its own cards and powers. Pick the story you like.</p>'+(firstTime()?guide:'')+'<div class="fgrid">'+FIDS.map(f=>facCard(f,f===sv.faction)).join('')+'</div>'+optionsHTML(false)+go}
function cfgDialogHTML(){return '<div class="cfgdlg" role="dialog" aria-label="Configure the game"><div class="cfghead"><b>Configure</b><button class="btn" data-a="cfgclose">Done</button></div><div class="cfgbody"><div class="fgrid">'+FIDS.map(f=>facCard(f,f===sv.faction)).join('')+'</div>'+optionsHTML(false)+'</div><div class="cfgfoot"><button class="btn pri big" data-a="cfgclose">Done</button></div></div>'}
function onlineSetupHTML(){const host=NET.on&&isHost(),plan=host?netPlan():null;
  return '<div class="shead"><button class="sback" data-a="title" aria-label="Back to the title">‹</button><h2>Play online</h2></div><p class="ssub">Host a room and send friends the code or link. Every browser connects directly, nobody sees another hand, and empty seats go to the computer.</p>'+onlineBlock()+
   (host?'<h2 class="sh2">Your faction</h2><div class="fgrid">'+FIDS.map(f=>facCard(f,f===sv.faction)).join('')+'</div>'+optionsHTML(true,plan)+'<div class="sgo"><button class="sbtn big" data-a="start" data-start="go"><b>Start online game</b></button>'+(G&&UI.started?'<button class="sbtn" data-a="netback"><b>Back to the game</b></button>':'')+'</div>':'')}
function startFromSetup(){hideStart();try{localStorage.setItem('tb_played','1')}catch(e){}const lv=sv.levels.slice();
  const o={np:sv.np,length:sv.length,faction:sv.faction,levels:lv.map((l,i)=>i===0?l:sv.levels[i]),guide:sv.guide};
  newGame(sv.mode==='watch'?'ai':sv.mode,o)}
