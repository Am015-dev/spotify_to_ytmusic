// node net-strip-test.js [games]  -> netStrip: whitelist view per seat. Checks on every move of AI games (2-4 players, all levels):
//   actor/moves(seat)/score/AI choice on the copy equal the real state's; poison test (scramble every hidden thing in the real G -> identical copy);
//   leak scan (other hands, deck, rng/seed, agenda, private limbo, tucked cards, other seats' question options, unlisted fields).
const HB=require('./src/engine.js');require('./src/ai.js');global.HB=HB;const netStrip=require('./src/netstrip.js');
const N=+process.argv[2]||20;let views=0,bad=0;const probs=[];const P=m=>{bad++;if(probs.length<10)probs.push(m)};
const mk=m=>JSON.stringify(Object.keys(m).sort().map(k=>[k,m[k]]));
const ALLOWED=new Set(['v','np','solo','deck','discard','meadow','limbo','lpriv','forest','bev','sev','grim','cur','first','turn','phase','logN','over','nolog','players','q','log','used','rng','seed','ag','agI']);
function poison(g,seat){const c=HB.clone(g);let s=12345;const r=n=>{s=(s*1103515245+12345)&0x7fffffff;return s%n};
  const sh=a=>{for(let i=a.length-1;i>0;i--){const j=r(i+1);[a[i],a[j]]=[a[j],a[i]]}};
  c.players.forEach((p,i)=>{if(i!==seat)sh(p.hand)});sh(c.deck);c.rng=999;c.seed=777;c.ag=[{h:'noop',d:{secret:1}}];
  if(c.lpriv>=0&&c.lpriv!==seat)sh(c.limbo);for(const e of c.sev)if(e.hid&&e.o!==seat)sh(e.tuck);
  if(c.q&&c.q.who!==seat){c.q.opts=[{label:'SECRET'}];c.q.title='SECRET'}c.zzz='unlisted';return c}
function check(g){for(let seat=-1;seat<g.np;seat++){const v=netStrip(g,seat);views++;
  if(HB.actor(v)!==HB.actor(g))P('actor differs');
  if(seat>=0){const a=HB.moves(g,seat).map(mk).join('|'),b=HB.moves(v,seat).map(mk).join('|');if(a!==b)P('moves differ seat '+seat);
    const la=HB.moves(g,seat).map(m=>m.label).join('|'),lb=HB.moves(v,seat).map(m=>m.label).join('|');if(la!==lb)P('labels differ')}
  if(seat>=0&&HB.actor(g)===seat&&!g.q){const lv=['easy','normal'][views%2];const a=HB.AI.choose(g,seat,lv),b=HB.AI.choose(v,seat,lv);if(lv==='normal'&&mk(a)!==mk(b)&&seat>=0)P('AI choice differs ('+lv+')')}
  for(let s=0;s<g.np;s++){if(JSON.stringify(HB.score(g,s))!==JSON.stringify(HB.score(v,s)))P('score differs')}
  const p1=JSON.stringify(netStrip(g,seat)),p2=JSON.stringify(netStrip(poison(g,seat),seat));if(p1!==p2)P('poison changed the copy, seat '+seat);
  // leak scan
  for(const k of Object.keys(v))if(!ALLOWED.has(k))P('unlisted field '+k);
  v.players.forEach((p,i)=>{if(i!==seat&&p.hand.some(c=>c!==-1))P('hand of '+i+' visible to '+seat);for(const k of Object.keys(p))if(!['name','ai','seat','hand','city','res','pts','workers','lost','season','passed','dep'].includes(k))P('player field '+k)});
  if(v.deck.some(c=>c!==-1))P('deck visible');if(v.rng||v.seed)P('rng/seed');if(v.ag.length)P('agenda');
  if(v.lpriv>=0&&v.lpriv!==seat&&v.limbo.some(c=>c!==-1))P('private limbo');
  for(const e of v.sev)if(e.hid&&e.o!==seat&&e.tuck.some(c=>c!==-1))P('tuck visible');
  if(v.q&&v.q.who!==seat&&(v.q.opts.length||v.q.title))P('question data of another seat');
  // own hand present
  if(seat>=0&&v.players[seat].hand.some(c=>c<0))P('own hand hidden')}}
for(let gi=0;gi<N;gi++){const np=2+gi%3,lv=['easy','normal','hard'][gi%3];const g=HB.newGame({players:Array.from({length:np},(_,i)=>({name:'P'+i,ai:lv})),seed:1000+gi});let n=0;
  check(g);while(g.phase!=='over'&&n<900){const a=HB.actor(g);const m=HB.AI.choose(g,a);const r=HB.apply(g,m);if(!r.ok)break;n++;if(n%2===0||g.q)check(g)}check(g)}
console.log(N+' games, '+views+' stripped views checked, '+bad+' problems'+(probs.length?'\n'+probs.join('\n'):''));process.exit(bad?1:0);
