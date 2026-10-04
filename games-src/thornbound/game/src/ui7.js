// ===================== part 7: plain words (log lines, glossary), the guided first game, title + setup screens =====================
// ---------------------------------------------------------------- plain log lines: "Heathbound Clans gains 2" -> "You gain 2" for the local player
function myName(){if(!G)return null;if(NET.on){const m=NET.mySeat;return m>=0?G.pl[m].name:null}if(hotSeat()||UI.mode==='watch')return null;const h=humans();return h.length===1?G.pl[h[0]].name:null}
const escRe=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
function verbYou(w){const l=w.toLowerCase();if(l==='has')return 'have';if(l==='is')return 'are';if(l==='was')return 'were';if(l==='does')return 'do';
  if(/[^aeiou]ies$/i.test(w))return w.slice(0,-3)+'y';if(/(ss|sh|ch|x|z)es$/i.test(w))return w.slice(0,-2);if(/[^s]s$/i.test(w)&&w.length>3)return w.slice(0,-1);return w}
function plain(t){const n=myName();if(!n||!t)return t;let subj=false;
  let out=t.replace(new RegExp(escRe(n)+"('s)?(?=\\W|$)( [A-Za-z]+)?",'g'),(m,poss,w,off,str)=>{const start=off===0||/[.:!?]\s*$/.test(str.slice(0,off));if(off===0)subj=true;
    const you=start?(poss?'Your':'You'):(poss?'your':'you');if(poss)return you+(w||'');if(!w)return you;if(!start&&off>0)return you+w;return you+' '+verbYou(w.trim())});
  out=out.replace(/\b([Yy])ou \((?:[Tt]he )?you\) wins\b/,'$1ou win');   // "The game ends. X (faction) wins" when X is you
  if(subj)out=out.replace(/\btheir\b/,'your').replace(/^(You [^.]*?) and has /,'$1 and have ').replace(/^(You [^.]*?) and is /,'$1 and are ');return out}
// ---------------------------------------------------------------- "what's happening": the newest public event, in plain words
const PHASEN={spring:'Spring',summer:'Day',autumn:'Autumn'};
function aiFallback(s,q,mv){const N=G.pl[s].name;const k=q.kind;
  if(k==='bid'||k==='place')return null;   // hidden bids and cards show on the board; no card per opponent
  if(q.t==='menu'&&mv.t==='done')return null;   // trivia: not narrated
  if(k==='edict')return mv.yes?N+' plays a Tactic.':null;
  return null}
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
  if(G.logN===l0&&q&&mv){const t=aiFallback(s,q,mv);if(t)UI.nowT={at:G.logN,s,t}}}})();
// ---------------------------------------------------------------- glossary: every game word can be tapped for its meaning
const GLOSS=[
 ['influence',/\bInfluence\b/,'Influence','The score. Whoever holds the most Influence when the last round ends wins the throne. You gain it by winning Clashes and claiming locations.'],
 ['kingdom card',/\bKingdom Cards?\b/,'Kingdom Card','A shared power card. Win one with your bid: it sits on your board with your bid card tucked under it, and its power works for you as long as you keep it (at most two).'],
 ['great road',/\bGreat Road\b/,'Great Road','The row of four face-up Kingdom Cards you can bid for. Cards nobody takes slide along, and the oldest is thrown away each round.'],
 ['herald',/\bHeralds?\b/,'Herald','Your one public envoy. Put it on a location in Spring. If you then win that region and claim that location, you gain +1 Influence and take 1 from every rival Herald standing there.'],
 ['supporter',/\bSupporters?\b/,'Supporter','Five small helpers on your board. Each one you send to a region adds +1 Strength there in its first Clash. In Winter, Supporters on the map go to the Lost Pile: they are gone unless a Council of Pledges or another power brings them back.'],
 ['clash',/\bClash(es)?\b/,'Clash','The fight in one region. Everyone\'s hidden cards there are flipped, abilities are used, and the highest total Strength (cards + Supporters) wins the region.'],
 ['strength',/\bStrength\b/,'Strength','The big number at the top left of a card. In a Clash you add up the Strength of your cards there, +1 per Supporter.'],
 ['region',/\bregions?\b/i,'Region','One of the three areas of the map: the Uplands, the Tablelands and the Sinks. Each has two locations and one Clash per round.'],
 ['location',/\blocations?\b/i,'Location','One of the six places on the map. The winner of a region\'s Clash claims one of its two locations: its Influence plus its bonus.'],
 ['bid',/\bbids?\b/i,'Bid','A card you choose secretly at the start of a round. Its Strength is the bid: the highest bid picks a Kingdom Card first.'],
 ['tactic',/\bTactics?\b/,'Tactic','Four special powers of your faction. Most work once per game, then they are Exhausted. A Tactic that starts with markers (like Open Waterways) works once a round until its markers are used up.'],
 ['lore',/\bLore\b/,'Lore','A second currency. You gain it with a Journey and spend it on your faction\'s Site of Power cards: stronger cards and permanent powers.'],
 ['site of power',/\bSite of Power\b/,'Site of Power','Your faction\'s five extra cards, bought with Lore. If you buy them all, your leftover Lore turns into Influence at the end.'],
 ['govern',/\bGovern\b/,'Govern','An Autumn action, once a round: move a hand card that shows votes into one of the three Councils.'],
 ['journey',/\bJourney\b/,'Journey','An Autumn action, once a round: send away a hand card that shows Lore, and gain that much Lore.'],
 ['council',/\bCouncils?\b/,'Council','Three Councils (Coin, Whispers, Pledges). Cards with votes placed there give you a lasting benefit every round.'],
 ['attrition',/\bAttrition\b/,'Attrition','When you must draw and your deck is empty, your discard pile becomes a new deck and your hand size drops by one (never below 3).'],
 ['favour',/\b(Kingdom's )?Favour\b/,'Kingdom\'s Favour','A disc you claim at the Gleaning Meadow. While you hold it you may use your faction\'s Favour power (three uses), and if Influence is tied when the game ends, the holder wins (it does not decide Clash ties).'],
 ['order track',/\bOrder Track\b/,'Order Track','The turn order. At the start of each round the player with the most Influence goes first; the last one chooses the Clash order. Ties go to the player higher on it.'],
 ['winter',/\bWinter\b/,'Winter','The end of a round: Heralds go home, Supporters on the map go to the Lost Pile, and played cards go to the discard pile.'],
 ['autumn',/\bAutumn\b/,'Autumn','After the Clashes: once each you may Govern and Journey, and use Autumn abilities such as Rally.'],
 ['ambush',/\bAmbush\b/,'Ambush','A Day ability: add a hidden card from your hand to this Clash.'],
 ['retreat',/\bRetreat\b/,'Retreat','A Day ability: pull your cards, Herald or Supporters out of this region.'],
 ['flank',/\bFlank\b/,'Flank','A Day ability: move this card to a region that has not fought yet.'],
 ['deadly',/\bDeadly\b/,'Deadly','A Night effect: every opposing card in the Clash is Eliminated (to the Lost Pile) unless it is Invulnerable. Two Deadly cards eliminate each other.'],
 ['rally',/\bRally\b/,'Rally','An Autumn ability: take your cards on the map back into your hand before Winter discards them.'],
 ['deploy',/\bDeploy\b/,'Deploy','An Autumn ability: put a card face up next to a region; it stays through the next Winter(s).'],
 ['lost pile',/\bLost Pile\b/,'Lost Pile','Where Eliminated cards and spent Supporters go. They do not come back when your deck is reshuffled.'],
 ['hand size',/\bhand size\b/i,'Hand size','How many cards you draw up to each round (6 at the start). Attrition lowers it.'],
 ['occupier',/\boccup(ier|ying|ies|y)\b/i,'Occupier','The card tucked under a Kingdom Card (your bid card). It cannot fight. A rival can steal the Kingdom Card with a bid stronger than it; then it comes back to your hand.'],
 ['exhausted',/\bExhausted\b/,'Exhausted','A used Tactic. It cannot be used again unless something refreshes it.'],
 ['heir',/\bHeirs?\b/,'Heir','Your strongest basic card (Strength 10), the one you start with. Some cards and Kingdom Cards give Heirs extra powers.'],
 ['captain',/\bCaptains?\b/,'Captain','A card type (Strength 6 to 9). It has no ability of its own; some powers name Captains.'],
 ['follower',/\bFollowers?\b/,'Follower','A card type (Strength 1 to 4). Followers are Invulnerable, and the basic Agent eliminates itself when it meets one.'],
 ['agent',/\bAgents?\b/,'Agent','A card type. The basic Agent is Deadly, but it eliminates itself if an opposing Follower is in the same Clash.'],
 ['cavalry',/\bCavalry\b/,'Cavalry','A card type of riders; the basic one can Flank.'],
 ['war machine',/\bWar [Mm]achines?\b/,'War machine','A card type: a big Invulnerable engine that can Deploy.'],
 ['champion',/\bChampions?\b/,'Champion','A strong Site of Power card (Strength 11).'],
 ['trader',/\bTraders?\b/,'Trader','A card type with votes and Lore but no Strength; it can Rally.'],
 ['ruse',/\bRuse\b/,'Ruse','A Strength 0 bluff card: it can Ambush or Retreat.'],
 ['invulnerable',/\bInvulnerable\b/,'Invulnerable','This card cannot be Eliminated.'],
 ['resilient',/\bResilient\b/,'Resilient','If this card is Eliminated it goes to your Discard Pile (you get it back later), not the Lost Pile.'],
 ['pathfinder',/\bPathfinder\b/,'Pathfinder','If this card is used for a Journey it goes to your Discard Pile instead of the Lost Pile.'],
 ['eliminate',/\b[Ee]liminat(e|es|ed|ion)\b/,'Eliminated','Removed from a Clash before the count: the card goes to the Lost Pile (Resilient cards: to the Discard Pile). Deadly cards eliminate opposing cards at Night.'],
 ['active',/\bActive\b/,'Active','A face-up card next to a region. Only Active cards fight and use their powers.'],
 ['hq',/\bHQ\b/,'HQ','A Site of Power card that is a permanent power: once bought it stays in front of you and never goes to your hand.'],
 ['discard pile',/\bDiscard Pile\b/,'Discard Pile','Your used cards. When your deck runs out, the Discard Pile becomes your new deck (Attrition).'],
 ['vote',/\bvotes?\b/i,'Vote','The gavel number on a card. Votes count in a Council when you Govern with the card.'],
 ['supply',/\bSupply\b/,'Supply','The things in front of you: your Influence, Lore and permanent cards.'],
 ['herald reward',/\bHerald Reward\b/,'Herald Reward','When you claim the location where your Herald stands: +1 Influence, and you take 1 from every rival Herald on it.'],
 ['spring',/\bSpring\b/,'Spring','The first part of a round: bids, Heralds, hidden cards, then optional Spring powers such as sending Supporters.'],
 ['day',/\bDay\b/,'Day','Before each Clash, with the cards face up: players may use Day powers (Ambush, Retreat, Flank, some Tactics).'],
 ['night',/\bNight\b/,'Night','Right after Day, before the count: Night effects happen by themselves. Deadly cards eliminate opposing cards.'],
 ['council of coin',/\bCouncil of Coin\b/,'Council of Coin','When you claim a Herald Reward you may take your cards out of this Council for Influence equal to their votes.'],
 ['council of whispers',/\bCouncil of Whispers\b/,'Council of Whispers','In Autumn, place markers on locations; four on one location claim its bonus.'],
 ['council of pledges',/\bCouncil of Pledges\b/,'Council of Pledges','In Autumn, bring Supporters back to your board: one per vote, one more for the biggest voter.'],
 ['kingdom deck',/\bKingdom Deck\b/,'Kingdom Deck','The face-down pile that refills the Great Road.'],
];
const GL={};GLOSS.forEach(g=>GL[g[0]]=g);
// escape + wrap the first appearance of each term in this text with a tappable chip
// card and Kingdom Card names are never split into glossary words ("Night Ferry Captain" stays a name)
let _nameRe=null;function nameRe(){if(_nameRe)return _nameRe;const D=TB.DATA,n=[];for(const f in D.BASICNAMES)n.push(...D.BASICNAMES[f]);for(const f in D.SITE)for(const c of D.SITE[f])n.push(c.nm);for(const k of D.KC)n.push(k.nm);for(const t in D.TACTICS)for(const x of D.TACTICS[t])n.push(x.nm);for(const f in D.FAVOUR)n.push(D.FAVOUR[f].nm);
  const u=[...new Set(n)].filter(Boolean).sort((a,b)=>b.length-a.length).map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));_nameRe=new RegExp('('+u.join('|')+')','g');return _nameRe}
function gloss(text){if(text==null)return '';text=String(text);const hits=[];const masked=[];{const re=nameRe();re.lastIndex=0;let m;while((m=re.exec(text)))masked.push([m.index,m.index+m[0].length])}
  const inName=(i,n)=>masked.some(([a,b])=>i<b&&i+n>a);
  for(const [k,re] of GLOSS){const g=new RegExp(re.source,re.flags.replace('g','')+'g');let m;while((m=g.exec(text))){if(!inName(m.index,m[0].length)){hits.push({i:m.index,n:m[0].length,k});break}}}
  hits.sort((a,b)=>a.i-b.i||b.n-a.n);let out='',p=0;
  for(const h of hits){if(h.i<p)continue;out+=esc(text.slice(p,h.i));const nw=!(UI.glSeen&&UI.glSeen[h.k]);out+='<button type="button" class="gl'+(nw?' new':'')+'" data-a="gloss" data-t="'+esc(h.k)+'" aria-label="'+esc(text.substr(h.i,h.n))+': what does it mean?">'+esc(text.substr(h.i,h.n))+'</button>';p=h.i+h.n}
  return out+esc(text.slice(p))}
function showGloss(k){const g=GL[k];const el=$('#gdef');if(!g||!el)return;UI.glSeen=UI.glSeen||{};UI.glSeen[k]=1;
  el.innerHTML='<p><b>'+esc(g[2])+'</b>: '+esc(g[3])+'</p><button class="pp-x" data-a="gclose" aria-label="Close">'+ico('x')+'</button>';el.hidden=false;if(typeof sfx==='function')sfx('tap')}
function hideGloss(){const el=$('#gdef');if(el){el.hidden=true;el.innerHTML=''}}
document.addEventListener('toggle',e=>{const d=e.target;if(d&&d.dataset&&d.dataset.more)UI.moreOpen=d.open},true);
// ---------------------------------------------------------------- the guided first game: fixed deal, one thing per step
// Deal: you lead the Heathbound Clans against the Gilded Court (Easy), 4 rounds, seed 23 (picked with the seed search in the clarity pass: round 1 has no elimination, one Clash lost, one won with Supporters on the contested Herald location, so the +1 and the steal happen).
// Cairn Field and win there with your Heir and two Supporters: the +2, the Herald's +1 and the steal all happen in round 1.
const GUIDED={seed:23,lastNormal:0,ai:9,faction:'clans',rival:'nobility'};
const isGuided=()=>!!(UI.cfg&&UI.cfg.guided&&!NET.on);
const COACH_INFO=[
 {id:'goal',when:()=>G.round===1&&G.q&&G.q.kind==='bid',title:'Your goal',text:()=>'Win by having the most Influence when round '+G.rounds+' ends. Influence is the score: the bar at the bottom shows you and the Gilded Court, both at 0.',hl:'#rivals'},
 {id:'map',when:()=>G.round===1&&G.q&&G.q.kind==='bid',title:'The kingdom',text:()=>'The map has three regions with two locations each. Every round each region has one Clash: the strongest side wins it and claims one of its two locations, which pays Influence. The Map button at the top makes the map bigger.',locs:[0,1,2,3,4,5]},
 {id:'round',when:()=>G.round===1&&G.q&&G.q.kind==='bid',title:'One round, six steps',text:()=>'1 Bid a card for a Kingdom Card. 2 Take your Kingdom Card. 3 Place your Herald. 4 Hide one card at each region. 5 Send Supporters. 6 The three Clashes. Round 1 is only this; new powers come in rounds 2 and 3. Tap the glowing button each time.',btn:'Let\'s start'},
 {id:'own',when:()=>G.round===2&&G.q,title:'Round 2: three new things',text:()=>'Card abilities: some cards can Flank (move to another region), Ambush, Retreat or Rally; the card says when. Deadly: at Night, just before the totals, a Deadly card eliminates enemy cards in its Clash. The Clash preview marks a card that "dies at Night": Flank or Retreat can save it. Autumn: after the Clashes you may send a card on a Journey for Lore, and Lore buys stronger cards.',btn:'Play on'},
 {id:'r3',when:()=>G.round===3&&G.q,title:'Round 3: the full game',text:()=>'Now everything is in play: your faction\'s Tactics, the Kingdom\'s Favour, and Govern (a card with votes goes into a Council for a lasting power). Each one is explained the first time you can use it.',btn:'Play on'}];
function coachGate(){if(!G||!G.q||UI.coachInfo)return !!UI.coachInfo;if(!isGuided())return false;UI.coachDone=UI.coachDone||{};
  const st=COACH_INFO.find(c=>!UI.coachDone[c.id]&&c.when());if(st){UI.coachInfo={id:st.id,title:st.title,text:st.text(),btn:st.btn,hl:st.hl,hlLocs:st.locs};return true}
  // the guided game skips a season for you when nothing you have learnt yet can be used in it
  const s=viewSeatForQ();if(s!=null&&G.q.t==='menu'&&G.round<3&&menuPhase(G.q)!=='Day'){const mv=legal(s);if(!visibleActs(mv).some(m=>m.t==='act')){const d=mv.find(m=>m.t==='done');if(d){if(!UI._skipT)UI._skipT=setTimeout(()=>{UI._skipT=0;humanMove(d.k)},0);return true}}}
  return false}
function coachOk(){const c=UI.coachInfo;if(!c)return;UI.coachDone=UI.coachDone||{};UI.coachDone[c.id]=1;UI.coachInfo=null;$$('.coachhl').forEach(e=>e.classList.remove('coachhl'));saveGame();pump()}
function coachInfoHTML(c){setTimeout(()=>{$$('.coachhl').forEach(e=>e.classList.remove('coachhl'));if(c.hl){const e=$(c.hl);if(e)e.classList.add('coachhl')}},0);
  const n=COACH_INFO.findIndex(x=>x.id===c.id);return '<div class="step"><h3 class="st">'+esc(c.title)+'</h3><p class="coach info">'+gloss(c.text)+'</p>'+(n>=0&&n<3?'<p class="hint">'+(n+1)+' of 3 before you play</p>':'')+'</div>'}
const menuPhase=q=>((q.title||'').match(/(Spring|Day|Autumn)/)||[])[1]||'';
const byLabel=(mv,txt)=>mv.find(m=>(m.label||'').indexOf(txt)>=0);
const BONUSK=['castle','wilderness','harvest','shrine','ossuary'];
// teaching moves for round 1 (falls back to the normal suggestion when the scripted card is not there)
function coachRec(s,mv){if(!isGuided()||!G.q)return null;const q=G.q,k=q.kind;
  if(G.round===1){
    if(k==='bid')return byLabel(mv,'Sailing Hall');
    if(k==='bidRes'){const takes=mv.filter(m=>m.t==='take');const pref=[11,13,17,5,46,51,14,39];for(const n of pref){const m=takes.find(x=>x.kc===n);if(m)return m}
      return takes.find(m=>!/Tactic|Favour|Council|Lore|Govern|Journey|SETUP/.test(TB.kingdomInfo(m.kc).text))||null}
    if(k==='herald'){const riv=G.pl.find(p=>p.seat!==s&&p.herald>=0);return riv?mv.find(m=>m.loc===riv.herald):byLabel(mv,'Cairn Field')}
    if(k==='place'){const P=G.pl[s];const heir=P.hand.find(id=>cinfo(id).archetype==='heir');if(heir!=null)return mv.find(m=>m.id===heir&&m.r===1);const big=P.hand.slice().sort((a,b)=>cinfo(b).strength-cinfo(a).strength);
      if(big.length)return mv.find(m=>m.id===big[0]&&m.r===0)||mv.find(m=>m.id===big[0]);return null}
    if(q.t==='menu'){const ph=menuPhase(q);if(ph==='Spring'&&G.pl[s].supp.r[1]===0){const m=mv.find(x=>x.a==='supp'&&x.p.r===1&&x.p.n===2);if(m)return m}return mv.find(m=>m.t==='done')}
    if(k==='harvest')return mv.find(m=>m.yes)||null;
    if(BONUSK.includes(k))return mv.find(m=>m.skip||m.t==='seldone')||null}
  return null}
const STEPN=(n,t)=>'Step '+n+' of 6 · '+t;
const NEWK={cmd:['Card abilities','Some of your cards have a power printed on them (Flank, Ambush, Retreat, Rally, Deploy). The card says when it works. Why you\'d want it: move a card to where it wins, or save it for later.'],
  lore:['Journey','Send a hand card away to gain its Lore. Why you\'d want it: Lore buys your Site of Power cards, which are stronger than your basic cards.'],
  tactic:['Tactics','Four special powers of your faction. Most work once per game, some once a round. Why you\'d want them: one well-timed Tactic can turn a Clash.'],
  favour:['The Kingdom\'s Favour','A faction power with three uses, from the Gleaning Meadow. Why you\'d want it: an extra push when you need it, and if Influence is tied when the game ends, the holder wins (it does not decide Clash ties).'],
  govern:['Govern and Councils','Put a hand card with votes into a Council. Why you\'d want it: each Council gives a lasting power (Influence, Supporters back, or location bonuses).'],
  council:['Councils','Your cards in a Council give you a power. Why you\'d want it: it works every round while the cards stay there.'],
  kc:['Kingdom Card powers','Some Kingdom Cards and HQ cards have a power you choose when to use. Why you\'d want it: each row says what it costs and what it gives.']};
// the coach line that replaces the prompt in round 1 (and the first time something new appears later)
function coachFor(s,mv,rm){UI._coachShown=null;if(!isGuided()||!G.q)return null;const q=G.q,k=q.kind,R=G.round;UI.coachDone=UI.coachDone||{};
  const nm=id=>cinfo(id).name+' ('+cinfo(id).strength+')';
  if(R===1){
    if(k==='bid')return {title:STEPN(1,'Bid'),pulse:1,noRec:1,text:'Pick a hand card as a secret bid: the higher bid picks a Kingdom Card first, and your bid card is tucked under it.'+(rm?' '+nm(rm.id)+' is a fair bid that keeps your big cards for the Clashes.':'')};
    if(k==='bidRes')return {title:STEPN(2,'Take a Kingdom Card'),pulse:1,noRec:1,text:'A Kingdom Card is a lasting power; your bid card stays tucked under it.'+(rm&&rm.kc?' Take '+TB.kingdomInfo(rm.kc).name+' (tap it to read it).':'')};
    if(k==='herald'){const riv=G.pl.find(p=>p.seat!==s&&p.herald>=0);return {title:STEPN(3,'Place your Herald'),pulse:1,noRec:1,text:'Win the region where your Herald stands and claim its location: +1 Influence, and you take 1 from each rival Herald there.'+(riv&&rm?' The Court is on '+LOCN[riv.herald]+': join it.':'')}}
    if(k==='place'){const n=UI.V.reg.reduce((a,R2)=>a+R2.down.filter(id=>id>=0&&ownerOf(id)===s).length,0);
      return {title:STEPN(4,'Hide a card at each region'),pulse:1,noRec:1,text:'Card '+Math.min(3,n+1)+' of 3, hidden until the Clash. '+(rm?nm(rm.id)+' to '+REG[rm.r]+(cinfo(rm.id).archetype==='heir'?': your strongest card where both Heralds wait.':'.'):'Choose a card for each region.')}}
    if(q.t==='menu'&&menuPhase(q)==='Spring'){const sent=G.pl[s].supp.r[1]>0;return {title:STEPN(5,'Send Supporters'),pulse:1,noRec:1,text:sent?'Two Supporters stand with your Heir. Now tap Done with Spring.':'Each Supporter you send adds +1 Strength in a region\'s first Clash, but it is gone after this round. Send 2 to the Tablelands to back your Heir.'}}
    if(k==='clashOrder')return {title:STEPN(6,'The Clashes'),pulse:1,noRec:1,text:'You are last in turn order, so you choose which region fights first. Any order works: take the suggested one.'};
    if(q.t==='menu'&&menuPhase(q)==='Day')return {title:STEPN(6,'The Clash in '+(G.clash?REG[G.clash.r]:'a region')),pulse:1,noRec:1,text:'The cards are face up: the box shows each side\'s Strength. Later you can use Day powers here; for now tap Done and the Clash is fought.'};
    if(k==='location')return {title:'You won: claim a location',pulse:1,noRec:1,text:'Pick one of the region\'s two locations.'+(rm?' '+whyFor(s,rm):'')};
    if(k==='tie')return {title:'A tie!',pulse:1,text:'Both sides have the same total. Each of you may add one more hidden card, or pass. If nobody adds one, nobody wins here.'};
    if(BONUSK.includes(k))return {title:'Location bonus: '+(QNAME[k]||'a bonus'),pulse:1,noRec:1,text:({castle:'The Spire Court lets you put a card into a Council. Councils come in round 3: skip it for now.',wilderness:'Thornwild lets you send a card on a Journey for Lore. Lore comes in round 2: skip it for now.',harvest:'The Gleaning Meadow gives you the Kingdom\'s Favour: a power for later, and it wins ties. Claim it.',shrine:'Moss Altar lets you put cards at the bottom of your deck. Choose none for now.',ossuary:'You drew cards back from your Discard Pile. You may also discard some: choose none for now.'})[k]}}
  if(q.t==='menu'){const L=visibleActs(mv).filter(m=>m.t==='act');for(const K of ['cmd','lore','tactic','favour','govern','council','kc']){if(UI.coachDone['new_'+K])continue;if(L.some(m=>actKind(m.a)===K)){UI._coachShown='new_'+K;return {title:'New: '+NEWK[K][0],text:NEWK[K][1]}}}}
  if(k==='siteBuy'&&!UI.coachDone.new_site){UI._coachShown='new_site';return {title:'New: spend Lore',text:'Lore buys your Site of Power cards. A card with a Strength goes to your hand; an HQ card is a permanent power that stays in front of you. Keep the Lore if nothing fits yet.'}}
  return null}
function coachEvent(ev){if(!isGuided())return '';UI.coachDone=UI.coachDone||{};const k='ev_'+ev.t;
  if(ev.t==='bids'&&G.round===1)return 'Both bids are revealed. The higher bid chooses first; a tie goes to whoever is higher on the Order Track.';
  if(ev.t==='clash'&&G.round===1&&!UI.coachDone[k+ev.r]){return ev.idx===0?'The hidden cards are flipped. Each side adds the Strength of its cards and +1 per Supporter (the list under the cards). The higher total wins the region.':''}
  if(ev.t==='summary'&&ev.round===1){const me=humans()[0];const a=ev.inf1[me],b=Math.max(...ev.inf1.filter((_,i)=>i!==me));return 'Scoring: you have '+a+' Influence, the Court has '+b+'. '+(a>b?'You lead!':a===b?'Level.':'Keep going.')+' The leader acts first next round. '+(G.rounds-1)+' rounds to go.'}
  return ''}
// guided: a "New: ..." line counts as read once you act on that screen
(function(){const o=humanMove;humanMove=function(k){if(G)UI.nowMark=G.logN;const sh=UI._coachShown;const r=o(k);if(r&&sh&&UI.coachDone)UI.coachDone[sh]=1;return r}})();
// end screen: where the Influence came from (from the engine's own counters; a client without them shows nothing)
function overBreakdown(){if(!G.infl)return '';const rows=youFirst(G.pl.map(p=>p.seat)).map(s=>{const L=G.infl[s]||{};const parts=Object.keys(L).map(k=>[k,L[k]]).filter(x=>x[1]).sort((a,b)=>b[1]-a[1]);
  return '<li style="--fc:'+fcol(s)+'"><b>'+esc(s===vs()?'You':sideName(s))+'</b><span>'+(parts.length?parts.map(x=>gloss(x[0])+' '+(x[1]>0?'+':'−')+Math.abs(x[1])).join(', '):'nothing')+'</span><em>= '+G.pl[s].inf+'</em></li>'}).join('');
  return '<h4 class="bdh">Where the Influence came from</h4><ul class="rank bd2">'+rows+'</ul>'}
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
    el.innerHTML='<div class="ttl"><div class="ttl-art">'+titleArt()+'</div><div class="ttl-in"><h1 class="logo"><small>THE</small>Thornbound Throne</h1><p class="tag">The king is dead. Four factions reach for his crown.</p><p class="tag goal">Win by holding the most Influence when the last round ends.</p><div class="tmid"></div><div class="tbtns">'+
      '<button class="tbtn go" data-a="play"><b>Play</b><span>'+(firstTime()?'new here? a guided first game is ready':'against the computer')+'</span></button>'+
      '<button class="tbtn" data-a="online"><b>Online</b><span>with friends, free, no sign-up</span></button>'+
      (sav?'<button class="tbtn" data-a="cont"><b>Resume</b><span>your game, round '+Math.max(1,sav.G.round)+' of '+sav.G.rounds+'</span></button>':'')+
      '</div><button class="tlink" data-a="rules">How to play</button></div><p class="st-c">Original art and words. Fonts: Cinzel and EB Garamond (SIL OFL).</p></div>';return}
  const ONL=view==='online';
  el.innerHTML='<div class="setup"><div class="bgart">'+titleArt()+'</div>'+(ONL?onlineSetupHTML():setupHTML())+'</div>'+(UI.phone&&UI.cfgOpen&&!ONL?cfgDialogHTML():'');
  el.scrollTop=top}
function firstTime(){try{return !localStorage.getItem('tb_played')}catch(e){return true}}
function facCard(f,on){const k=TBKit.FACTIONS[FK[f]],S=STORY[f];return '<button class="fcard'+(on?' on':'')+'" data-a="fac" data-v="'+f+'" style="--fc:'+k.main+'" aria-pressed="'+on+'"><span class="ft"><span class="fe">'+TBKit.token('influence',{faction:FK[f]},44).outerHTML+'</span><span><b>'+esc(DD.FNAME[f])+'</b><small>'+esc(S.tag)+'</small></span></span><p>'+esc(S.story)+'</p><p class="enj">'+esc(S.enjoy)+'</p>'+(on?'<span class="fpick">Your faction ✓</span>':'')+'</button>'}
function seatRows(ONL,plan){const n=ONL?plan.np:sv.np;const rest=FIDS.filter(f=>f!==sv.faction);let h='';
  for(let i=0;i<n;i++){const f=i===0?sv.faction:rest[i-1];const k=TBKit.FACTIONS[FK[f]];const human=ONL?i<plan.hum.length:i===0;
    h+='<div class="seat" style="--fc:'+k.main+'">'+TBKit.token('influence',{faction:FK[f]},30).outerHTML+'<span class="sn"><b>'+esc(k.short)+'</b><small>'+(human?(ONL?'Online: '+esc(plan.hum[i].nm)+(i===0?' (you)':''):'You'):'Computer')+'</small></span>'+(human?'':levelSeg(i))+'</div>'}
  return '<div class="seats">'+h+'</div>'}
function levelSeg(i){return '<div class="seg" role="radiogroup" aria-label="Computer level">'+['easy','normal','hard'].map(l=>'<button class="'+(sv.levels[i]===l?'on':'')+'" data-a="lv" data-i="'+i+'" data-v="'+l+'" aria-pressed="'+(sv.levels[i]===l)+'">'+(l==='easy'?'Easy (for learning)':l[0].toUpperCase()+l.slice(1))+'</button>').join('')+'</div>'}
function optionsHTML(ONL,plan){return '<div class="opts2">'+(ONL?'':'<div class="row"><span>Players</span><div class="seg">'+[2,3,4].map(n=>'<button class="'+(sv.np===n?'on':'')+'" data-a="np" data-v="'+n+'">'+n+'</button>').join('')+'</div></div>')+
  '<div class="row"><span>Length</span><div class="seg">'+[['short','4 rounds'],['standard','5 rounds'],['extended','6 rounds']].map(([v,l])=>'<button class="'+(sv.length===v?'on':'')+'" data-a="len" data-v="'+v+'">'+l+'</button>').join('')+'</div></div>'+
  '<div class="row"><span>Tips</span><div class="seg">'+[['full','Full'],['light','Light'],['off','Off']].map(([v,l])=>'<button class="'+(sv.guide===v?'on':'')+'" data-a="gd" data-v="'+v+'">'+l+'</button>').join('')+'</div></div>'+seatRows(ONL,plan)+'</div>'}
function sumLine(){const n=sv.np-1,R=({short:4,standard:5,extended:6}[sv.length]);return 'You lead <b>'+esc(DD.FSHORT[sv.faction])+'</b> against '+n+' computer'+(n>1?'s':'')+' · most Influence after round '+R+' wins'}
function setupHTML(){const ph=UI.phone;const k=TBKit.FACTIONS[FK[sv.faction]];
  const guide='<div class="guidebox"><p><b>First time?</b> The <b>Guided first game</b> teaches one step at a time: Heathbound Clans against one computer (Easy, for learning), 4 rounds, about 15 minutes. <b>Start the game</b> is a normal game with the settings below.</p></div>';
  const ft=firstTime();const gbtn='<button class="sbtn'+(ft?' big':'')+'" data-a="guided" data-start="guided"><b>'+(ft?'Guided first game':'Guided game')+'</b><span>'+(ft?'recommended: learn one step at a time':'learn step by step')+'</span></button>';
  const go='<div class="sgo">'+(ft?gbtn:'')+'<button class="sbtn'+(ft?'':' big')+'" data-a="start" data-start="go"><b>Start the game</b><span>'+esc(DD.FSHORT[sv.faction])+' vs '+(sv.np-1)+' computer'+(sv.np>2?'s':'')+' ('+sv.levels.slice(1,sv.np).map(l=>l==='easy'?'Easy':l==='hard'?'Hard':'Normal').filter((x,i,a)=>a.indexOf(x)===i).join('/')+') · '+({short:4,standard:5,extended:6}[sv.length])+' rounds</span></button><div class="sgrid3">'+(ft?'<button class="sbtn" data-a="rules"><b>How to play</b><span>the rules in short</span></button>':gbtn)+
    '<button class="sbtn" data-a="mode" data-v="hot" data-go="1" data-start="hot"><b>Hot-seat</b><span>'+sv.np+' people, one device</span></button>'+
    '<button class="sbtn" data-a="mode" data-v="watch" data-go="1" data-start="watch"><b>Watch</b><span>the computers play</span></button></div></div>';
  const head='<div class="shead"><button class="sback" data-a="title" aria-label="Back to the title">‹</button><h2>'+(ph?'New game':'Choose your faction')+'</h2></div>';
  if(ph)return head+(firstTime()?guide:'')+'<div class="ssum" style="--fc:'+k.main+'"><span class="fe">'+TBKit.token('influence',{faction:FK[sv.faction]},40).outerHTML+'</span><span class="sline">'+sumLine()+'</span><button class="btn" data-a="cfgopen" aria-label="Change faction, players, length and levels">Change</button></div>'+'<div class="opts2 qnp"><div class="row"><span>Computers</span><div class="seg">'+[2,3,4].map(n=>'<button class="'+(sv.np===n?'on':'')+'" data-a="np" data-v="'+n+'" aria-label="'+(n-1)+' computer opponent'+(n>2?'s':'')+'">'+(n-1)+'</button>').join('')+'</div></div></div><p class="ssub">'+esc(STORY[sv.faction].enjoy)+'</p>'+go;
  return head+'<p class="ssub">Each faction plays the same rules with its own cards and powers. Pick the story you like.</p>'+(firstTime()?guide:'')+'<div class="fgrid">'+FIDS.map(f=>facCard(f,f===sv.faction)).join('')+'</div>'+optionsHTML(false)+go}
function cfgDialogHTML(){return '<div class="cfgdlg" role="dialog" aria-label="Configure the game"><div class="cfghead"><b>Configure</b><button class="btn" data-a="cfgclose">Done</button></div><div class="cfgbody"><div class="fgrid">'+FIDS.map(f=>facCard(f,f===sv.faction)).join('')+'</div>'+optionsHTML(false)+'</div><div class="cfgfoot"><button class="btn pri big" data-a="cfgclose">Done</button></div></div>'}
function onlineSetupHTML(){const host=NET.on&&isHost(),plan=host?netPlan():null;
  return '<div class="shead"><button class="sback" data-a="title" aria-label="Back to the title">‹</button><h2>Play online</h2></div><p class="ssub">Host a room and send friends the code or link. Every browser connects directly, nobody sees another hand, and empty seats go to the computer.</p>'+onlineBlock()+
   (host?'<h2 class="sh2">Your faction</h2><div class="fgrid">'+FIDS.map(f=>facCard(f,f===sv.faction)).join('')+'</div>'+optionsHTML(true,plan)+'<div class="sgo"><button class="sbtn big" data-a="start" data-start="go"><b>Start online game</b></button>'+(G&&UI.started?'<button class="sbtn" data-a="netback"><b>Back to the game</b></button>':'')+'</div>':'')}
function startFromSetup(){hideStart();try{localStorage.setItem('tb_played','1')}catch(e){}const lv=sv.levels.slice();
  const o={np:sv.np,length:sv.length,faction:sv.faction,levels:lv.map((l,i)=>i===0?l:sv.levels[i]),guide:sv.guide};
  newGame(sv.mode==='watch'?'ai':sv.mode,o)}
