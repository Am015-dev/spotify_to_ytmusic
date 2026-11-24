// ---------- Hadiya's commissions: learn by playing (W624). Six short jobs on the real engine, each a strategic puzzle with a goal ----------
// Owner, 24 Nov: no narrative, click-tap nonsense, no strategy -> replaced by commissions. Every tap is a real game move (UI-BAR rule 11).
// Each commission builds ONE state (layout + people + holdings), you play real moves, Farid follows a stated plan, then a debrief.
// Headless: commNew(i) builds the state; commResult() scores it. Tests: ../comm-test.js (naive line fails, strategic line wins).
// Board layout (rows A-E, 6 columns): O oasis, b Bazaar Stall, B Grand Bazaar, H Hamlet, S Shrine. index = row*6 + col.
const COMM_LAYOUT='ObHSbO'+'bSHSBb'+'BSOHSO'+'bBSbOH'+'ObHBSb';
const COMM_KIND={O:'oasis',b:'small',B:'large',H:'village',S:'sacred'};
const COMM_SV={3:6,7:6,9:6,13:15,16:12,20:10,28:6};   // shrine values: four at 6, one each at 10, 12, 15
const CM={a:'vizier',e:'elder',t:'merchant',m:'builder',s:'assassin'};
const COMM_STORY={who:'Hadiya',face:'🧓',premise:'The Sultan is dead and the bazaar of Qamar is up for grabs. Old Hadiya will vouch for you before the council, but only if you prove you can out-think Farid, the water-boy who wants the throne too. Six commissions. Each one is a real turn of the game.'};
// tips: just-in-time one-liners, keyed by the moment they matter (shown next to their target, once each)
const COMMS=[
 {id:'c1',title:'One coin for the oasis',
  story:'An oasis has opened at the heart of the bazaar. Farid has a path to it, and so do you. Whoever walks first takes it.',
  goal:'Claim the Oasis and finish ahead of Farid.',
  lesson:'Same price? The later bidder goes first. One coin can buy the whole turn.',
  rules:['bid-track','bid-pay','bid-zero','bid-tie','move-lift','move-drop','move-last','take','camel','advisors','oasis'],
  turns:'1 bid + 1 turn each',
  people:{26:'ta',2:'ta',14:'aa',4:'t',5:'t',17:'mm',23:'m'},
  bid:true,markers:1,
  rival:{bid:'cheap',plans:[[{act:'start',tile:2},{act:'step',tile:8,c:'merchant'},{act:'step',tile:14,c:'vizier'}]]},
  key:14,
  tips:{bid:'Same price: the later bidder plays first. Farid always takes a free spot.',move:'Lift a tile, drop one person per tile. The last lands on its own colour.'},
  check:R=>R.own(14)===0&&R.me>R.rival,
  why:R=>R.own(14)===0?(R.me>R.rival?`You walked first and took the Oasis: ${R.me} to ${R.rival}.`:`You took the Oasis but paid too much: ${R.me} to ${R.rival}.`)
    :R.own(14)===1?'You took a free spot. Farid took one after you, so he played first and took the Oasis.':'The Oasis is still empty. Walk the Advisor onto it.'},
 {id:'c2',title:'Coins from stone, coins from silk',
  story:'The council wants to see coin. Masons beside the shrines can earn it from stone. Traders by the stall can earn it from silk.',
  goal:'End your turn with 68 coins or more.',
  lesson:'Sets of different goods grow fast: 4 kinds sell for 13, 5 kinds for 21. Sell them together.',
  rules:['masons','mystic-mason','traders','mystic-card','stall','sell-table','sell-end','sell-mystic','goods-set'],
  turns:'1 turn',
  people:{19:'t',25:'ttt',14:'m',20:'mm',4:'e',10:'a'},
  me:{fk:1},market:['fish','wheat','silk','pottery','fakir','spice','jewels','fish','gold'],
  key:25,
  tips:{move:'Masons pay coins for each blue tile around them. Traders bring goods.',tribe:'A Mystic adds one Mason, but it never scores at the end.',tile:'Stall: 3 coins for one of the first 3 goods.',sell:'One set of different kinds: 1, 3, 7, 13, 21 coins for 1 to 5 kinds.'},
  check:R=>R.coins>=68,
  why:R=>R.coins>=68?`You end on ${R.coins} coins. The fifth kind turned 13 into 21.`:R.pl.res.length?`You end on ${R.coins} coins. Selling smaller sets, or keeping cards, paid less.`:`You end on ${R.coins} coins. Masons here see only 4 blue tiles: the Traders' set paid more.`},
 {id:'c3',title:'The price of a djinn',
  story:'A shrine stands empty and three djinns wait for a summons. You hold one Sage and one Mystic, and your oasis already has two palms.',
  goal:'Gain 22 points or more this turn.',
  lesson:'Pay a djinn with a Mystic when you can: a Mystic scores nothing, a Sage scores 2.',
  rules:['sages','shrine','shrine-pay','djinn-row','djinn-vp','djinn-power','djinn-once'],
  turns:'1 turn',
  people:{4:'e',3:'e',10:'t',11:'t',27:'a'},
  me:{el:1,fk:1},hold:{0:{camel:0,palm:2}},djRow:['wahha','nakhla','hikma'],
  key:3,
  tips:{move:'Sages score 2 each and pay for djinns.',tile:'Shrine: summon with 2 Sages, or 1 Sage and 1 Mystic.',djinn:'A djinn scores its own points. Powers work once per turn.'},
  check:R=>R.gain>=22,
  why:R=>R.gain>=22?`You gained ${R.gain} points. Nakhla made both palms worth 5, and the Mystic paid instead of a Sage.`:R.pl.dj.length?`You gained ${R.gain} points. Look at which djinn pays most here, and pay with the Mystic.`:`You gained ${R.gain} points. A djinn on this shrine was worth more.`},
 {id:'c4',title:'A knife in the souk',
  story:'Farid has three Advisors at court and you have two. Every rival you out-number pays you 10. Your Shadows can strike tonight.',
  goal:'Finish ahead of Farid.',
  lesson:'Shadows can remove a rival’s Advisor. Breaking a majority swings 11 points.',
  rules:['shadows','shadow-range','shadow-mystic','shadow-kept','shadow-claim','advisor-major','advisor-tie'],
  turns:'1 turn',
  people:{22:'s',21:'s',15:'e',27:'a',4:'t'},
  me:{vz:2},rivalSet:{vz:3},hold:{10:{camel:1}},
  key:21,
  tips:{move:'Shadows remove one person within as many steps as you have Shadows.',tribe:'Or remove an Advisor or Sage a rival keeps. A tile you empty is yours.'},
  check:R=>R.me>R.rival,
  why:R=>R.me>R.rival?`Farid lost his majority: ${R.me} to ${R.rival}.`:R.rivalPl.vz<3?`Close: ${R.me} to ${R.rival}.`:`You took land, but Farid kept 3 Advisors to your 2 and his +10: ${R.me} to ${R.rival}.`},
 {id:'c5',title:'Whose palace is it?',
  story:'Farid owns a hamlet near the gate. Advisors gather there, and a palace must rise wherever a walk ends on a hamlet.',
  goal:'Finish ahead of Farid.',
  lesson:'A palace or palm scores for whoever holds the tile. Never build one on a rival’s land.',
  rules:['hamlet','palace-owner','camel-forever','no-claim','bazaar'],
  turns:'1 turn',
  people:{1:'a',2:'aa',19:'tt',18:'t',29:'m'},
  rivalSet:{coins:58},hold:{2:{camel:1}},market:['fish','wheat','silk','pottery','spice','jewels','fakir','gold','papyrus'],
  key:2,
  tips:{move:'Ending on a Hamlet means you must build a palace there.',tile:'Grand Bazaar: 6 coins for 2 of the first 6 goods.'},
  check:R=>R.me>R.rival,
  why:R=>R.me>R.rival?`You stayed off Farid’s land: ${R.me} to ${R.rival}.`:(R.board[2].pal?`Your palace went up on Farid’s hamlet: 5 points to him. ${R.me} to ${R.rival}.`:`${R.me} to ${R.rival}.`)},
 {id:'c6',title:'The last camel',
  story:'One camel left in your stable and the council is watching. When a player places their last camel, the round is finished and the game ends.',
  goal:'Finish the game ahead of Farid.',
  lesson:'Your last camel ends the game after this round. End it while you lead.',
  rules:['end-camel','end-round','end-nomove','score-all','score-tie','refill','order-next','two-markers'],
  turns:'up to 2 rounds',
  people:{14:'m',20:'mmt',16:'s',17:'s',4:'t',5:'t',27:'e'},hold:{17:{palm:1}},
  me:{camels:1,coins:60},rivalSet:{camels:2,coins:50},rounds:2,
  rival:{bid:{1:'cheap',2:'first'},plans:{1:[[{act:'start',tile:5},{act:'step',tile:4,c:'merchant'}]],2:[[{act:'start',tile:16},{act:'step',tile:17,c:'assassin'}]]}},
  key:17,
  tips:{move:'Placing your last camel ends the game after this round.',bid:'Next round you bid in the order you played.'},
  check:R=>R.over&&R.me>R.rival,
  why:R=>R.me>R.rival?`You placed your last camel while ahead. The game ended: ${R.me} to ${R.rival}.`:`You waited. Farid got another round and caught you: ${R.me} to ${R.rival}.`}];
// ---------- build the state ----------
function commNew(i){const c=COMMS[i];const keep=DEFSEED;setSeed(6240+i);
  try{newGame({np:2,seats:['human','ai'],lv:['normal','normal'],mode:'x',names:['You','Farid']})}finally{DEFSEED=keep}
  for(const t of G.board){G.bag.push(...t.m);t.m=[]}
  G.board=COMM_LAYOUT.split('').map((ch,i)=>{const k=COMM_KIND[ch];return {k,v:k==='sacred'?(COMM_SV[i]||6):({oasis:8,small:6,large:4,village:5})[k],blue:TILEDEF[k].blue,ex:'base',i,m:[],camel:null,tent:null,palm:0,pal:0,block:0}});
  for(const i in c.people)for(const ch of c.people[i]){const col=CM[ch];const j=G.bag.indexOf(col);G.bag.splice(j,1);G.board[i].m.push(col)}
  for(const i in (c.hold||{}))Object.assign(G.board[i],c.hold[i]);
  for(const t of G.board)if(t.camel!=null)G.pl[t.camel].camels--;
  G.sup.palm-=G.board.reduce((a,t)=>a+t.palm,0);G.sup.pal-=G.board.reduce((a,t)=>a+t.pal,0);
  const pull=(r)=>{let j=G.rdeck.indexOf(r);if(j>=0)return G.rdeck.splice(j,1)[0];j=G.market.indexOf(r);return G.market.splice(j,1)[0]};
  if(c.market){const want=c.market.map(pull);G.rdeck=G.market.concat(G.rdeck);G.market=want}
  const take=(p,o)=>{if(!o)return;if(o.fk){for(let k=0;k<o.fk;k++)pull('fakir');p.fk+=o.fk}if(o.el){p.el+=o.el;for(let k=0;k<o.el;k++)G.bag.splice(G.bag.indexOf('elder'),1)}
    if(o.vz){p.vz+=o.vz;for(let k=0;k<o.vz;k++)G.bag.splice(G.bag.indexOf('vizier'),1)}if(o.coins!=null)p.coins=o.coins;if(o.camels!=null)p.camels=o.camels};
  take(G.pl[0],c.me);take(G.pl[1],c.rivalSet);
  if(c.djRow){G.djDeck=G.djDeck.concat(G.djRow).filter(k=>!c.djRow.includes(k));G.djRow=c.djRow.slice()}
  G.tut=1;G.comm=c.id;G.commI=i;G.commR=c.rounds||1;G.commStart=scoreOf(G.pl[0]).total;
  for(const p of G.pl)p.markers=c.markers||1;
  if(c.bid){G.bidQueue=[{p:0,k:0},{p:1,k:0}];G.bids=[];G.phase='bid'}
  else{G.phase='turn';G.bidQueue=[];G.bids=[];G.order=[{p:0,k:0}].concat(c.rival&&c.rival.plans?[{p:1,k:0}]:[]);G.turnIdx=0;G.nextBid=[];G.turn=0;startTurn()}
  G.log=[];lg(`Commission ${i+1}: ${c.title}.`,'big')}
// Farid follows the commission's stated plan when it is legal, else plays as the computer does
function tutAIMove(s){if(!G||!G.comm||s!==1)return null;const c=COMMS[G.commI];const r=c.rival||{};const vm=validMoves(s);
  const how=r.bid&&typeof r.bid==='object'?r.bid[G.round]:r.bid;
  if(G.phase==='bid'&&how){const b=vm.filter(m=>m.act==='bid'&&!m.fk);const pr=m=>bidPrice(P(1),m.spot);b.sort((x,y)=>pr(x)-pr(y)||x.spot-y.spot);
    if(how==='first'){const top=Math.max(-1,...G.bids.map(x=>G.track[x.spot].cost));const w=b.find(m=>pr(m)>top);if(w)return w}return b[0]||null}
  if(G.phase!=='turn')return null;
  if(G.commQT!==G.turn){G.commQT=G.turn;G.commQ=null;for(const pl of (Array.isArray(r.plans)?r.plans:(r.plans&&r.plans[G.round])||[]))if(vm.some(m=>same(m,pl[0]))){G.commQ=pl.slice();break}}
  if(G.commQ&&G.commQ.length&&vm.some(m=>same(m,G.commQ[0])))return G.commQ.shift();return null}
// ---------- the result ----------
function commResult(){const c=COMMS[G.commI];const s0=scoreOf(G.pl[0]),s1=scoreOf(G.pl[1]);
  const R={me:s0.total,rival:s1.total,coins:G.pl[0].coins,gain:s0.total-G.commStart,pl:G.pl[0],rivalPl:G.pl[1],board:G.board,over:!!G.over,
    winner:!!G.over&&s0.total>=s1.total,own:i=>G.board[i].camel};
  const won=!!c.check(R);return {won,why:c.why(R),lesson:c.lesson,R}}
// patch: a commission ends after its rounds (engine endRound ends a G.tut game at once)
