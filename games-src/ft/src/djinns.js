// ---------- djinns: 22 base + 3 promos + 2 Crafters + 1 Cutpurse djinn. Original names; effects follow the published cards. ----------
// cost: null (always on) | 'EF' (1 Sage or 1 Mystic) | 'EEF' (1 Sage + 1 Sage-or-Mystic) | 'F' (1 Mystic) | 'F+' (1+ Mystics, bidding)
const DJINNS=[
 {k:'zarifa',n:'Zarifa',vp:5,cost:null,x:'At the end, every 2 Mystics you hold count as 1 goods card of any kind.'},
 {k:'tamuz',n:'Tamuz',vp:8,cost:'EF',x:'Put 3 people from the bag on an empty tile.'},
 {k:'harith',n:'Harith',vp:6,cost:null,x:'Whenever a djinn is summoned: +1 coin if by you, +2 if by a rival.'},
 {k:'sadim',n:'Sadim',vp:6,cost:null,x:'Shadows cannot take your Advisors or Sages (or Crafters).'},
 {k:'nuraya',n:'Nuraya',vp:6,cost:'EF',x:'Place a palace on any Hamlet.'},
 {k:'qirsh',n:'Qirsh',vp:4,cost:'EEF',x:'This turn your Masons earn double.'},
 {k:'wahha',n:'Wahha',vp:8,cost:'EF',x:'Plant a palm tree on any Oasis.'},
 {k:'burhan',n:'Burhan',vp:10,cost:'EF',x:'This turn, a palace you place may go on a neighbouring tile instead.'},
 {k:'nakhla',n:'Nakhla',vp:8,cost:null,x:'Palm trees on your tiles score 5 instead of 3.'},
 {k:'ghulam',n:'Ghulam',vp:8,cost:'EF',x:'This turn your Shadows take 2: two people from one tile, or two Advisors/Sages from one rival.'},
 {k:'wazira',n:'Wazira',vp:6,cost:null,x:'Your Advisors score 3 each instead of 1.'},
 {k:'sirra',n:'Sirra',vp:6,cost:null,x:'When your Shadows take a Trader: draw a goods card; a Mason: earn what it would have; an Advisor or Sage: keep it yourself (a Crafter: keep it and draw an item).'},
 {k:'dalil',n:'Dalil',vp:6,cost:'F+',x:'When bidding, each Mystic you discard lets you pay the price one spot cheaper.'},
 {k:'rawda',n:'Rawda',vp:10,cost:'EF',x:'This turn, a palm tree you plant may go on a neighbouring tile instead.'},
 {k:'jamal',n:'Jamal',vp:4,cost:'EEF',x:'Put one of your camels on an empty tile.'},
 {k:'tariq',n:'Tariq',vp:6,cost:null,x:'Whenever a person is dropped on one of your tiles: +1 coin on your move, +2 on a rival’s.'},
 {k:'qasra',n:'Qasra',vp:6,cost:null,x:'Whenever a palace is placed: +1 coin if by you, +2 if by a rival.'},
 {k:'khanjar',n:'Khanjar',vp:6,cost:null,x:'Whenever Shadows take a person: +1 coin if yours, +2 if a rival’s.'},
 {k:'hikma',n:'Hikma',vp:6,cost:null,x:'Your Sages score 4 each instead of 2.'},
 {k:'ruya',n:'Ru’ya',vp:4,cost:'EEF',x:'Look at the top 3 djinns of the deck: keep 1, discard 2.'},
 {k:'suqra',n:'Suqra',vp:8,cost:'F',x:'Take the top card of the goods deck.'},
 {k:'fath',n:'Fath',vp:4,cost:'EEF',x:'Put one of your camels on a tile holding only people.'},
 // promos
 {k:'amir',n:'Amir',vp:6,cost:null,set:'promos',x:'Whenever Advisors are taken: +1 coin if by you, +2 if by a rival.'},
 {k:'majlis',n:'Majlis',vp:0,cost:null,set:'promos',x:'At the end, +5 points for every djinn you own, this one included.',assumed:'printed VP'},
 {k:'dukkan',n:'Dukkan',vp:0,cost:null,set:'promos',x:'Whenever a rival ends a move on a bazaar tile, take the top goods card.'},
 // Crafters expansion
 {k:'jawhar',n:'Jawhar',vp:6,cost:null,set:'artisans',x:'Each precious item you own scores 3 more.',assumed:'printed VP'},
 {k:'sana',n:'San’a',vp:6,cost:null,set:'artisans',x:'Each Crafter you keep scores 2 more.',assumed:'printed VP'},
 // Cutpurse expansion
 {k:'hafiz',n:'Hafiz',vp:6,cost:null,set:'thieves',x:'Cutpurses cannot touch you.',assumed:'name and printed VP'}];
const DJ={};for(const d of DJINNS)DJ[d.k]=d;
function DJINNS_FOR(ex){return DJINNS.filter(d=>!d.set||ex[d.set])}
function hasDj(p,k){return p.dj.includes(k)}
// ---------- activation ----------
function costOpts(p,cost){const o=[];if(cost==='EF'){if(p.el>=1)o.push({el:1,fk:0});if(p.fk>=1)o.push({el:0,fk:1})}
  if(cost==='EEF'){if(p.el>=2)o.push({el:2,fk:0});if(p.el>=1&&p.fk>=1)o.push({el:1,fk:1})}if(cost==='F'&&p.fk>=1)o.push({el:0,fk:1});return o}
function payCost(p,c){p.el-=c.el;p.fk-=c.fk;G.bag.push(...Array(c.el).fill('elder'));G.rdisc.push(...Array(c.fk).fill('fakir'))}
function emptyTile(t){return !t.block&&t.camel==null&&t.tent==null&&!t.m.length&&!t.palm&&!t.pal}
function djinnTargets(p,k){switch(k){
  case 'tamuz':return G.board.filter(emptyTile).map(t=>t.i);
  case 'nuraya':return G.board.filter(t=>t.k==='village').map(t=>t.i);
  case 'wahha':return G.board.filter(t=>t.k==='oasis').map(t=>t.i);
  case 'jamal':return p.camels>0?G.board.filter(emptyTile).map(t=>t.i):[];
  case 'fath':return p.camels>0?G.board.filter(t=>!t.block&&t.camel==null&&t.tent==null&&t.m.length&&!t.palm&&!t.pal).map(t=>t.i):[];
  case 'suqra':return G.rdeck.length?[-1]:[];
  case 'ruya':return G.djDeck.length+G.djDisc.length?[-1]:[];
  case 'qirsh':return G.act&&!G.act.tribeDone&&G.act.color==='builder'&&!G.turnFx.qirsh?[-1]:[];
  case 'ghulam':return G.act&&!G.act.tribeDone&&G.act.color==='assassin'&&!G.turnFx.ghulam?[-1]:[];
  case 'burhan':return !G.turnFx.burhan?[-1]:[];case 'rawda':return !G.turnFx.rawda?[-1]:[];
  default:return[]}}
function djinnMoves(p){const o=[];if(G.phase!=='turn'||G.q)return o;
  for(const k of p.dj){const d=DJ[k];if(!d.cost||d.cost==='F+'||p.used[k])continue;const tg=djinnTargets(p,k);if(!tg.length)continue;for(const c of costOpts(p,d.cost))for(const t of tg)o.push({act:'djinn',k,t,pay:c})}return o}
function runDjinn(p,m){const d=DJ[m.k];payCost(p,m.pay);lg(`✨ ${p.nm} calls on ${d.n}.`,'step');fx('djinn',m.k);
  switch(m.k){
  case 'tamuz':{const t=G.board[m.t];for(let i=0;i<3&&G.bag.length;i++)t.m.push(G.bag.splice(rnd(G.bag.length),1)[0]);lg(`Three people appear on ${tileName(t)}.`);break}
  case 'nuraya':placePalace(p,m.t,true);break;
  case 'wahha':placePalm(p,m.t,true);break;
  case 'jamal':case 'fath':claimTile(p,m.t,'camel');break;
  case 'suqra':gainCard(p,G.rdeck.shift());break;
  case 'ruya':{if(!G.djDeck.length){G.djDeck=shuffle(G.djDisc);G.djDisc=[]}const top=G.djDeck.splice(0,3);ask(p.i,`${d.n}: keep one djinn`,top.map(k=>({l:`${DJ[k].n} (${DJ[k].vp} pts): ${DJ[k].x}`,h:'ruya',d:{p:p.i,k,top}})),{kind:'djinn',cards:top});break}
  case 'qirsh':G.turnFx.qirsh=1;lg('This turn the Masons earn double.','good');break;
  case 'ghulam':G.turnFx.ghulam=1;lg('This turn the Shadows take two.','good');break;
  case 'burhan':G.turnFx.burhan=1;break;case 'rawda':G.turnFx.rawda=1;break}}
// ---------- passive triggers ----------
function trig(kind,actor,data){for(const q of G.pl){const gainC=n=>{q.coins+=n;lg(`${q.nm} gains ${n} coin${n>1?'s':''} (${DJ[trigDj(kind)].n}).`,'good')};const own=q.i===actor;
  if(kind==='djinn'&&hasDj(q,'harith')&&!(own&&data&&data.k==='harith'))gainC(own?1:2);
  if(kind==='palace'&&hasDj(q,'qasra'))gainC(own?1:2);
  if(kind==='kill'&&hasDj(q,'khanjar'))gainC(own?1:2);
  if(kind==='vizier'&&hasDj(q,'amir'))gainC(own?1:2);
  if(kind==='drop'&&hasDj(q,'tariq')&&data&&(G.board[data.i].camel===q.i||G.board[data.i].tent===q.i))gainC(own?1:2);
  if(kind==='market'&&hasDj(q,'dukkan')&&!own&&G.rdeck.length){lg(`${q.nm}'s ${DJ.dukkan.n} slips a card from the deck.`,'good');gainCard(q,G.rdeck.shift())}}}
function trigDj(kind){return {djinn:'harith',palace:'qasra',kill:'khanjar',vizier:'amir',drop:'tariq',market:'dukkan'}[kind]}
