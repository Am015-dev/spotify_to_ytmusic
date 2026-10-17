// Hidden-information tests.   node hidden-test.js [games=24]
//  1. stripView(G,seat): structural checks (no rival hand/deck/face-down/unrevealed-bid/deck-order/seed/rng in the view, no secrets in the question).
//  2. Poison test: take the real game, scramble EVERYTHING the seat may not know (TB.poison), and require that the seat's view, its list of legal moves
//     (every label!) and the computer decision (easy / normal / hard) are byte-identical. A control "cheater" chooser that peeks must be caught.
//  3. Simultaneous secrets: while seats are still choosing bids / face-down cards, nobody else's choice is visible anywhere (view, moves, question).
require('./src/data.js');require('./src/engine.js');require('./src/ai.js');
const games=+(process.argv[2]||24);const F=TB.DATA.FACTIONS;
const own=id=>(id/100)|0;
let checks=0,viewDiff=0,moveDiff=0,aiDiff=0,struct=0,secretLeak=0,cheatChecks=0,cheatCaught=0;const bad=[];
function rngf(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^a>>>15,a|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
const J=JSON.stringify;
function structural(G,seat,V){const errs=[];
  if(V.rng!==undefined)errs.push('rng present');if(V.seed!==0)errs.push('seed present');if(V.ag.length)errs.push('agenda present');
  V.pl.forEach((p,i)=>{if(i===seat)return;if(p.hand.some(id=>id>=0))errs.push('rival hand visible');if(p.deck.some(id=>id>=0))errs.push('rival deck visible');if(p.bid!=null&&!G.bidRev&&p.bid>=0)errs.push('unrevealed bid visible');if(p.peek!==undefined)errs.push('rival peek list');
    if(p.hand.length!==G.pl[i].hand.length)errs.push('hand size must stay public')});
  const mine=V.pl[seat].deck;for(let i=1;i<mine.length;i++)if(mine[i]<mine[i-1])errs.push('own deck order leaked');
  if(V.kdeck.some(x=>x!==0))errs.push('kingdom deck order visible');
  const seen=new Set(G.peek[seat]||[]);V.reg.forEach(R=>R.down.forEach(id=>{if(id>=0&&own(id)!==seat&&!seen.has(id))errs.push('face-down card of a rival visible')}));
  if(V.q){const q=V.q;for(const s in q.o)if(+s!==seat)errs.push('rival options in question');if(q.got&&Object.keys(q.got).length)errs.push('answers collected in question');
    if(!q.seats.includes(seat)&&(Object.keys(q.o).length||(q.items&&q.items.length)))errs.push('question content visible to a seat that is not asked')}
  return errs}
function poisonCheck(G,seat,level,k,cheater){const P=TB.poison(G,seat,rngf(k*7919+seat));
  const v1=J(TB.stripView(G,seat)),v2=J(TB.stripView(P,seat));checks++;if(v1!==v2){viewDiff++;if(bad.length<4)bad.push('view differs: seat '+seat+' phase '+G.phase+' '+G.step)}
  const m1=J(TB.moves(G,seat)),m2=J(TB.moves(P,seat));if(m1!==m2){moveDiff++;if(bad.length<4)bad.push('moves/labels differ: seat '+seat+' '+(G.q&&G.q.kind))}
  if(TB.pending(G)&&TB.pending(G).seats.includes(seat)&&m1!=='[]'){
    for(const lv of level){const a=TB.AI.choose(G,seat,lv,{samples:3,budget:30}),b=TB.AI.choose(P,seat,lv,{samples:3,budget:30});if(J(a)!==J(b)){aiDiff++;if(bad.length<4)bad.push('AI('+lv+') decision differs: seat '+seat+' '+G.q.kind)}}
    // control: a chooser that peeks at a rival's hidden hand must be caught by the same comparison
    const ch=(X)=>{const mv=TB.moves(X,seat);const o=(seat+1)%X.np;const h=X.pl[o].hand;return mv.length?J(mv[(h.length?h[0]:0)%mv.length]):''};
    cheatChecks++;if(ch(G)!==ch(P))cheatCaught++}}
for(let g=0;g<games;g++){const np=2+g%3;const facs=[];for(let i=0;i<np;i++)facs.push(F[(g+i)%4]);
  const lv=['easy','normal','hard'];const G=TB.newGame({players:facs.map((f,i)=>({faction:f,name:'P'+i,ai:lv[(g+i)%3]})),seed:5000+g});let n=0;
  while(G.phase!=='over'&&n<4000){const p=TB.pending(G);if(!p)break;
    if(n%5===0){for(let seat=0;seat<np;seat++){const V=TB.stripView(G,seat);const e=structural(G,seat,V);if(e.length){struct++;if(bad.length<4)bad.push('structure: '+e[0]+' (seat '+seat+', '+G.phase+'/'+G.step+')')}
        poisonCheck(G,seat,n%15===0?['easy','normal','hard']:['normal'],g*131+n,true)}}
    // simultaneous secrets: once one seat answered, others must not be able to see it
    if(p.simul&&p.seats.length<np&&G.q&&(G.q.kind==='bid'||G.q.kind==='place')){for(let seat=0;seat<np;seat++){if(p.seats.includes(seat)||true){const V=TB.stripView(G,seat);const done=[...Array(np).keys()].filter(s=>!p.seats.includes(s)&&s!==seat);
          for(const d of done){if(G.q.kind==='bid'&&!G.bidRev&&V.pl[d].bid>=0)secretLeak++;if(G.q.kind==='place'){for(const R of V.reg)for(const id of R.down)if(id>=0&&own(id)===d&&seat!==d)secretLeak++}}}}}
    const s=p.seats[0];const m=TB.AI.choose(G,s,G.pl[s].ai,{samples:2,budget:20});const r=TB.apply(G,m);if(!r.ok){console.log('apply failed',r.err);break}n++}}
console.log('hidden-info test: '+games+' games, '+checks+' poison checks');
console.log('  view differences      '+viewDiff);console.log('  legal-move/label diffs '+moveDiff);console.log('  AI decision diffs     '+aiDiff+' (easy/normal/hard, same decision in every consistent hidden world)');
console.log('  structural leaks      '+struct);console.log('  simultaneous-secret leaks '+secretLeak);console.log('  control cheater caught  '+cheatCaught+'/'+cheatChecks);
for(const b of bad)console.log('  '+b);
const okc=!viewDiff&&!moveDiff&&!aiDiff&&!struct&&!secretLeak&&cheatCaught>cheatChecks*0.2;console.log(okc?'HIDDEN-INFO TEST PASSED':'HIDDEN-INFO TEST FAILED');process.exit(okc?0:1);
