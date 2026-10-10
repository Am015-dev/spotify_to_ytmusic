// netStrip test: many AI games (every player count, expansion mix, teams, solo, no-leviathan). After EVERY move, for every seat and a watcher:
//  - sideToAct(), validMoves(seat) and knowledge(seat) on the stripped copy equal the real state's; legal() agrees for the moves of the seat
//  - no hidden field is present: other hands/pile/pool/limbo only as -1, no rng/seed, empty agenda, leviathan deck sorted, other seats' question opts/ctx empty
//  - whitelist: a junk field added to G never reaches the copy; the copy only has the listed top-level fields
//  - poison: scramble everything the seat may not see (other hands, pile order, leviathan-deck order, pool, rng, seed, an unknown field) -> the copy is byte-identical
//   node tools/net-strip-test.js [games per config]
const {load}=require('./load');const X=load(['data.js','engine.js','ai.js','netstrip.js'],';globalThis.__NS=netStrip;');const NS=X.ctx.__NS;
const games=+process.argv[2]||12;let moves=0,views=0,bad=0;const msgs=[];const fail=m=>{bad++;if(msgs.length<12)msgs.push(m)};
const ALLOWED=new Set('v np variant exp opts phase step turn cur first order sp team ships seats hands deck gone limbo mdeck mons mgone wave gates bd dice refill arr mq placeElim batch pool bq over q log logN stats gid ag agI'.split(' '));
let pr=424242;const prnd=()=>{pr=(Math.imul(pr,1103515245)+12345)>>>0;return pr/4294967296};
const pshuf=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(prnd()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
function poison(G,seat){const P=JSON.parse(JSON.stringify(G));const hid=[];P.hands.forEach((h,i)=>{if(i!==seat)hid.push(...h)});hid.push(...P.deck);if(P.cur!==seat)hid.push(...P.pool);pshuf(hid);let k=0;
  P.hands=P.hands.map((h,i)=>i===seat?h:h.map(()=>hid[k++]));P.deck=P.deck.map(()=>hid[k++]);if(P.cur!==seat)P.pool=P.pool.map(()=>hid[k++]);
  pshuf(P.mdeck);P.rng=(P.rng^0x9e3779b9)|0;P.seed=(P.seed^0x7f4a7c15)>>>0;P.futureSecret={deck:[1,2,3]};
  if(P.limbo!=null&&!(P.q&&P.q.who===seat))P.limbo=(P.limbo+7)%56;if(P.bq&&P.cur!==seat)P.bq.mine=[9,9];
  if(P.q&&P.q.who!==seat){P.q.opts=[{l:'secret',h:'x',d:{}}];P.q.ctx={secret:1};if(P.q.kind!=='doom')P.q.title='secret '+P.q.title}return P}
function check(s,tag){const real=X.G;const P=NS(real,s);views++;const st=JSON.stringify(P);
  for(const k of Object.keys(P))if(!ALLOWED.has(k))fail(tag+' extra field '+k);if('rng' in P||'seed' in P||'futureSecret' in P||'__junk' in P)fail(tag+' hidden field present');
  if(JSON.stringify(poison(real,s))===JSON.stringify(real)&&false)return;
  const pz=JSON.stringify(NS(poison(real,s),s));if(pz!==st)fail(tag+' strip depends on hidden state');
  P.hands.forEach((h,i)=>{if(i!==s&&h.some(c=>c!==-1))fail(tag+' hand of seat '+i+' visible')});if(P.deck.some(c=>c!==-1))fail(tag+' pile visible');
  if(P.cur!==s&&P.pool.some(c=>c!==-1))fail(tag+' pool visible');if(P.ag.length)fail(tag+' agenda present');
  if(P.mdeck.some((c,i)=>i&&c<P.mdeck[i-1]))fail(tag+' leviathan deck not sorted');if(P.limbo!=null&&P.limbo!==-1&&!(P.q&&P.q.who===s))fail(tag+' limbo visible');
  if(P.q&&P.q.who!==s&&(P.q.opts.length||Object.keys(P.q.ctx).length))fail(tag+' other seat question data');
  if(P.q&&P.q.who!==s&&P.q.kind!=='doom'&&P.q.title)fail(tag+' title of a private question');
  if(P.hands.length!==real.hands.length||P.hands.some((h,i)=>h.length!==real.hands[i].length))fail(tag+' hand size differs');
  if(s>=0&&P.hands[s].join()!==real.hands[s].join())fail(tag+' own hand differs');
  // same answers on the copy
  const KN=sd=>{const k=X.knowledge(sd);if(k.q&&k.q.who!==sd){delete k.q.n;if(k.q.kind!=='doom')delete k.q.title}return JSON.stringify(k)};// q.n (how many options another seat has) and the title of a private question ("You drew a Deck Cannon") are deliberately not sent
  const sa=X.sideToAct(),vm=JSON.stringify(X.validMoves(s)),kn=KN(s);let lg=[];if(s>=0&&s===sa)lg=X.validMoves(s).slice(0,6).map(m=>X.legal(m,s)||'');
  const bogus={a:'place',t:0,r:0,s:0};const lb=s>=0?X.legal(bogus,s):'';
  X.G=P;let sa2,vm2,kn2,lg2=[],lb2;try{sa2=X.sideToAct();vm2=JSON.stringify(X.validMoves(s));kn2=KN(s);if(s>=0&&s===sa2)lg2=X.validMoves(s).slice(0,6).map(m=>X.legal(m,s)||'');lb2=s>=0?X.legal(bogus,s):''}finally{X.G=real}
  if(sa!==sa2)fail(tag+' sideToAct differs');if(vm!==vm2)fail(tag+' validMoves differ');if(kn!==kn2)fail(tag+' knowledge differs');if(lg.join()!==lg2.join()||lb!==lb2)fail(tag+' legal differs')}
const CF=[{np:2,e:{}},{np:3,e:{cannon:1,rift:1}},{np:5,e:{wave:1,maelstrom:1,cannon:1,rift:1}},{np:4,v:'teams',e:{cannon:1,rift:1,wave:1,maelstrom:1}},{np:8,e:{cannon:1}},{np:6,e:{rift:1,cannon:1},noMon:1},{np:1,v:'solo',e:{cannon:1}},{np:7,e:{wave:1,maelstrom:1}}];
let ng=0;for(const c of CF)for(let g=0;g<games;g++){const seed=g*977+c.np;X.setSeed(seed);X.ai.setAiSeed(seed);X.newGame({players:c.np,variant:c.v,exp:c.e,noMon:!!c.noMon,level:['easy','normal','hard'][g%3]});ng++;let n=0;
  while(X.G.phase!=='over'&&n++<4000){X.G.__junk={deck:[1]};
    for(let s=-1;s<X.G.np;s++){if(prnd()<(s===X.sideToAct()||s===-1?1:.5))check(s,`[np${c.np} g${g} m${n} seat${s}]`)}
    const st=X.ai.aiStep(true);if(!st)break;moves++;if(!X.performMove(st.m,st.seat).success)break}
  for(let s=-1;s<X.G.np;s++)check(s,`[np${c.np} g${g} end seat${s}]`)}
console.log(`games ${ng} moves ${moves} stripped views ${views} problems ${bad}`);if(msgs.length)console.log(msgs.join('\n'));console.log(bad?'NET STRIP TEST FAILED':'NET STRIP TEST PASSED');process.exit(bad?1:0)
