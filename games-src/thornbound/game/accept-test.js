// Clarity acceptance (CLARITY-PLAN.md): node accept-test.js [games=200]
//  1. the end breakdown (Influence ledger) sums to every final score
//  2. every Influence change has a log event with a reason (k inf / steal, with why), and those events sum to the score
//  3. every eliminated or removed card has a log event that names it
require('./src/data.js');require('./src/engine.js');require('./src/ai.js');
const games=+(process.argv[2]||200);const F=TB.DATA.FACTIONS;let bad=0,checked=0,elims=0;const fails=[];
for(let g=0;g<games;g++){const np=2+g%3;const facs=[];for(let i=0;i<np;i++)facs.push(F[(g+i)%4]);
  const G=TB.newGame({players:facs.map((f,i)=>({faction:f,name:'P'+i,ai:['easy','normal','hard'][(g+i)%3]})),seed:31000+g,length:['short','standard','extended'][g%3]});
  let n=0;while(G.phase!=='over'&&n++<8000){const p=TB.pending(G);if(!p)break;const s=p.seats[0];TB.apply(G,TB.AI.choose(G,s,G.pl[s].ai))}
  if(G.phase!=='over'){bad++;fails.push('game '+g+' did not finish');continue}
  const ev={};for(const e of G.log){const m=e.m||{};if(m.k==='inf'){if(!m.why){bad++;fails.push('g'+g+' inf without reason: '+e.t)}ev[m.s]=(ev[m.s]||0)+m.n}
    if(m.k==='steal'){if(!m.why){bad++;fails.push('g'+g+' steal without reason')}ev[m.s]=(ev[m.s]||0)+m.n;ev[m.v]=(ev[m.v]||0)-m.n}
    if(m.k==='elim'||m.k==='rm'){elims++;if(!(m.ids&&m.ids.length)||!m.ids.every(id=>e.t.includes(TB.cardName(G,id)))){bad++;if(fails.length<20)fails.push('g'+g+' removal without the card named: '+e.t)}}}
  for(const P of G.pl){checked++;let sum=0;for(const k in G.infl[P.seat])sum+=G.infl[P.seat][k];
    if(sum!==P.inf){bad++;fails.push('g'+g+' seat '+P.seat+' breakdown '+sum+' vs score '+P.inf)}
    if((ev[P.seat]||0)!==P.inf){bad++;if(fails.length<20)fails.push('g'+g+' seat '+P.seat+' events '+(ev[P.seat]||0)+' vs score '+P.inf)}}}
console.log(fails.slice(0,20).join('\n'));
console.log('accept: '+games+' games, '+checked+' final scores, '+elims+' removal events, '+bad+' problems');process.exit(bad?1:0)
