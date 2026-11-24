// ---------- djinns: 22 base + 3 promos + 2 Crafters + 1 Cutpurse djinn. Our own names, point values and numbers. ----------
const DJN={wazira:3,hikma:4,nakhla:5,majlis:4,jawhar:4,sana:3};
// cost: null (always on) | 'EF' (1 Sage or 1 Mystic) | 'EEF' (1 Sage + 1 Sage-or-Mystic) | 'F' (1 Mystic) | 'F+' (1+ Mystics, bidding)
const DJINNS=[
 {k:'zarifa',n:'Zarifa',vp:6,cost:null,x:'At the end, every 2 Mystics you hold count as 1 good.'},
 {k:'tamuz',n:'Tamuz',vp:7,cost:'EF',x:'Drop 3 people from the bag onto any bare tile.'},
 {k:'harith',n:'Harith',vp:5,cost:null,x:'Each time a djinn is summoned: you gain 1 coin if it is yours, 2 if it is a rival\'s.'},
 {k:'sadim',n:'Sadim',vp:7,cost:null,x:'Shadows cannot remove your Advisors, Sages or Crafters.'},
 {k:'nuraya',n:'Nuraya',vp:7,cost:'EF',x:'Build a palace on any Hamlet.'},
 {k:'qirsh',n:'Qirsh',vp:5,cost:'EEF',x:'This turn your Masons pay out twice.'},
 {k:'wahha',n:'Wahha',vp:7,cost:'EF',x:'Plant a palm on any Oasis.'},
 {k:'burhan',n:'Burhan',vp:9,cost:'EF',x:'You may build a palace on a tile beside your finish.'},
 {k:'nakhla',n:'Nakhla',vp:10,cost:null,x:`Each palm you hold is worth ${DJN.nakhla} points, not 3.`},
 {k:'ghulam',n:'Ghulam',vp:9,cost:'EF',x:'When your Shadows strike this turn they remove 2 people: both from one tile, or 2 Advisors, Sages or Crafters of one rival.'},
 {k:'wazira',n:'Wazira',vp:4,cost:null,x:`Each Advisor you keep is worth ${DJN.wazira} points, not 1.`},
 {k:'sirra',n:'Sirra',vp:7,cost:null,x:'Whatever your Shadows remove pays you: an Advisor or Sage joins your tribe, a Trader gives you a goods card, a Mason pays 1 coin per nearby blue tile, a Crafter joins you with an item.'},
 {k:'dalil',n:'Dalil',vp:5,cost:'F+',x:'Bidding: each Mystic you spend lets you jump one spot up the track.'},
 {k:'rawda',n:'Rawda',vp:9,cost:'EF',x:'You may plant a palm on a tile beside your finish.'},
 {k:'jamal',n:'Jamal',vp:5,cost:'EEF',x:'Place one of your camels on any bare tile.'},
 {k:'tariq',n:'Tariq',vp:5,cost:null,x:'Whenever someone drops on a tile you hold: 1 coin to you if you drop, 2 if a rival does.'},
 {k:'qasra',n:'Qasra',vp:7,cost:null,x:'Each palace built anywhere: 1 coin to you if it is yours, 2 if a rival\'s.'},
 {k:'khanjar',n:'Khanjar',vp:7,cost:null,x:'Each time Shadows remove a person: 1 coin to you if yours, 2 if a rival\'s.'},
 {k:'hikma',n:'Hikma',vp:4,cost:null,x:`Each Sage you keep is worth ${DJN.hikma} points, not 2.`},
 {k:'ruya',n:'Ru’ya',vp:4,cost:'EEF',x:'Peek at 3 djinns and keep 1.'},
 {k:'suqra',n:'Suqra',vp:7,cost:'F',x:'Take the top goods card from the deck.'},
 {k:'fath',n:'Fath',vp:5,cost:'EEF',x:'Place a camel on a tile that holds only people.'},
 // promos
 {k:'amir',n:'Amir',vp:5,cost:null,set:'promos',x:'Each time Advisors are taken: 1 coin to you if yours, 2 if a rival\'s.'},
 {k:'majlis',n:'Majlis',vp:0,cost:null,set:'promos',x:`At the end, every djinn you own earns ${DJN.majlis} extra points.`,},
 {k:'dukkan',n:'Dukkan',vp:0,cost:null,set:'promos',x:'When a rival finishes on a Bazaar you take a good.'},
 // Crafters expansion
 {k:'jawhar',n:'Jawhar',vp:5,cost:null,set:'artisans',x:`Each precious item you hold earns ${DJN.jawhar} extra points.`,},
 {k:'sana',n:'San’a',vp:5,cost:null,set:'artisans',x:`Each Crafter you keep earns ${DJN.sana} extra points.`,},
 // Cutpurse expansion
 {k:'hafiz',n:'Hafiz',vp:5,cost:null,set:'thieves',x:'Cutpurses cannot touch you.'}];
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
  case 'nuraya':return SUP().pal<1?[]:G.board.filter(t=>t.k==='village').map(t=>t.i);
  case 'wahha':return SUP().palm<1?[]:G.board.filter(t=>t.k==='oasis').map(t=>t.i);
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
