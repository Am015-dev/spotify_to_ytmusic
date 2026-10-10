// Poisoned-state test: the computer captains must decide only from knowledge(seat).
// At many decision points we copy G, scramble everything the deciding seat cannot see (other players' hands, the draw pile order,
// the leviathan-deck order, the elimination-bonus pool when it is not that seat's, the seed), then ask again. The knowledge view
// and the AI decision must be identical. A control chooser that peeks at G must be caught by the same comparison.   node hidden-test.js [games]
const {load}=require('./tools/load');const X=load(['data.js','engine.js','ai.js']);
const games=+process.argv[2]||40;let checks=0,diffK=0,diffM=0,games_=0;const bad=[];
let pr=987654321;const prnd=()=>{pr=(Math.imul(pr,1103515245)+12345)>>>0;return pr/4294967296};const pshuf=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(prnd()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
function poison(G,seat){const P=JSON.parse(JSON.stringify(G));
  // every tile the seat cannot see: other hands + the draw pile (same total, shuffled)
  const hid=[];P.hands.forEach((h,i)=>{if(i!==seat)hid.push(...h)});hid.push(...P.deck);if(P.cur!==seat)hid.push(...P.pool);pshuf(hid);let k=0;
  P.hands=P.hands.map((h,i)=>i===seat?h:h.map(()=>hid[k++]));P.deck=P.deck.map(()=>hid[k++]);if(P.cur!==seat)P.pool=P.pool.map(()=>hid[k++]);
  pshuf(P.mdeck);P.rng=(P.rng^0x9e3779b9)|0;P.seed=(P.seed^0x7f4a7c15)>>>0;
  if(P.q&&P.q.who!==seat&&P.q.ctx&&P.q.ctx.pool)P.q.ctx.pool=P.q.ctx.pool.map(()=>-1);return P}
let cheatChecks=0,cheatCaught=0;
function cheat(seat){const G=X.G;const o=(seat+1)%G.np;const h=G.hands[o];const mv=X.validMoves(seat);if(!mv.length)return null;return JSON.stringify(mv[(h[0]===undefined?0:h[0])%mv.length])}
const CF=[{np:2,e:{}},{np:3,e:{cannon:1,rift:1}},{np:5,e:{wave:1,maelstrom:1,cannon:1}},{np:4,v:'teams',e:{cannon:1,rift:1,wave:1,maelstrom:1}},{np:8,e:{}},{np:1,v:'solo',e:{cannon:1}}];
for(const c of CF)for(let g=0;g<games;g++){const seed=g*131+c.np;X.setSeed(seed);X.ai.setAiSeed(seed);const lv=['easy','normal','hard'][g%3];X.newGame({players:c.np,variant:c.v,exp:c.e,level:lv});let n=0;games_++;
  while(X.G.phase!=='over'&&n++<4000){const s=X.sideToAct();if(s<0)break;
    if(n%3===0){const real=X.G;const k1=JSON.stringify(X.knowledge(s)),m1=JSON.stringify(X.ai.aiMove(s));const ch1=cheat(s);const P=poison(real,s);X.G=P;let k2,m2,ch2;try{k2=JSON.stringify(X.knowledge(s));m2=JSON.stringify(X.ai.aiMove(s));ch2=cheat(s)}finally{X.G=real}
      checks++;if(k1!==k2){diffK++;if(bad.length<3)bad.push('K differs '+c.np)}if(m1!==m2){diffM++;if(bad.length<3)bad.push('move differs '+c.np+' '+m1+' vs '+m2)}
      if(ch1!=null){cheatChecks++;if(ch1!==ch2)cheatCaught++}}
    const st=X.ai.aiStep(true);if(!st)break;if(!X.performMove(st.m,st.seat).success)break}}
console.log(`games ${games_} checks ${checks}  knowledge differences ${diffK}  decision differences ${diffM}  control cheater caught ${cheatCaught}/${cheatChecks}`);
if(bad.length)console.log(bad.join('\n'));
const okc=!diffK&&!diffM&&cheatCaught>cheatChecks*0.2;console.log(okc?'HIDDEN-INFO TEST PASSED':'HIDDEN-INFO TEST FAILED');process.exit(okc?0:1)
