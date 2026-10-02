// node net-strip-test.js [games=16]  : netStrip (src/netstrip.js) = whitelist. For many AI games, at every few moves, every seat and a spectator:
//  1. poison test: scramble everything the seat may not know (TB.poison): the stripped copy and the seat's legal moves must be byte identical
//  2. structure: no rng/seed/agenda/stats/unlisted field, other seats' hands/decks/face-down/unrevealed bids are all hidden ids, Kingdom deck order zeroed
//  3. an unknown field added to G (and to a player) never appears
const fs=require('fs');require('./src/data.js');require('./src/engine.js');require('./src/ai.js');(0,eval)(fs.readFileSync(__dirname+'/src/netstrip.js','utf8')+';globalThis.netStrip=netStrip');
const games=+(process.argv[2]||16);const F=TB.DATA.FACTIONS;const own=id=>(id/100)|0;const J=JSON.stringify;
function rngf(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^a>>>15,a|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
let checks=0,poisonDiff=0,moveDiff=0,struct=0,unlisted=0,viewMoveDiff=0,bytes=0,maxBytes=0;const bad=[];
for(let g=0;g<games;g++){const np=2+g%3;const facs=[];for(let i=0;i<np;i++)facs.push(F[(g+i)%4]);const lv=['easy','normal','hard'];
  const G=TB.newGame({players:facs.map((f,i)=>({faction:f,name:'P'+i,ai:lv[(g+i)%3]})),seed:7000+g});let n=0;
  while(G.phase!=='over'&&n<4000){const p=TB.pending(G);if(!p)break;
    if(n%4===0){G.secretField={deck:[1,2,3]};G.pl[0].secretNote='x';
      for(let seat=-1;seat<np;seat++){const S=netStrip(G,seat);const sj=J(S);checks++;bytes+=sj.length;maxBytes=Math.max(maxBytes,sj.length);
        if(sj.includes('secretField')||sj.includes('secretNote')||sj.includes('"rng"')||sj.includes('"stats"')){unlisted++;if(bad.length<5)bad.push('unlisted field leaked')}
        if(seat>=0){const P=TB.poison(G,seat,rngf(g*131+n*7+seat));const S2=netStrip(P,seat);
          if(sj!==J(S2)){poisonDiff++;if(bad.length<5)bad.push('poison differs seat '+seat+' '+G.phase+'/'+G.step)}
          if(J(TB.moves(G,seat))!==J(TB.moves(P,seat))){moveDiff++}}
        // structure
        const e=[];if(S.seed!==0)e.push('seed');if(S.rng!==undefined)e.push('rng');if(S.ag.length)e.push('ag');if(S.stats!==undefined)e.push('stats');if(S.kdeck.some(x=>x!==0))e.push('kdeck order');
        S.pl.forEach((q,i)=>{if(i===seat)return;if(q.hand.some(id=>id>=0))e.push('rival hand');if(q.deck.some(id=>id>=0))e.push('rival deck');if(q.bid!=null&&!G.bidRev&&q.bid>=0)e.push('unrevealed bid');if(q.peek!==undefined)e.push('rival peek');if(q.hand.length!==G.pl[i].hand.length)e.push('hand count')});
        S.reg.forEach(R=>R.down.forEach(id=>{if(id>=0&&own(id)!==seat&&!(G.peek[seat]||[]).includes(id))e.push('rival face-down')}));
        if(S.q){if(Object.keys(S.q.got).length)e.push('got');for(const s in S.q.o)if(+s!==seat)e.push('rival options');if(!S.q.seats.includes(seat)&&Object.keys(S.q.o).length)e.push('options for a seat not asked')}
        if(seat<0&&S.pl.some(q=>q.hand.some(id=>id>=0)||q.deck.some(id=>id>=0)))e.push('spectator sees cards');
        if(e.length){struct++;if(bad.length<5)bad.push('structure '+e.join(',')+' seat '+seat)}
        // the client's own copy answers TB.moves the same way (informational: the page uses the host's list)
        if(seat>=0&&G.q&&G.q.seats.includes(seat)){let a,b;try{a=J(TB.moves(G,seat));b=J(TB.moves(S,seat))}catch(x){b='ERR '+x.message}if(a!==b)viewMoveDiff++}}
      delete G.secretField;delete G.pl[0].secretNote}
    const s=p.seats[0];const m=TB.AI.choose(G,s,G.pl[s].ai,{samples:2,budget:20});const r=TB.apply(G,m);if(!r.ok){console.log('apply failed',r.err);break}n++}}
console.log('net-strip test: '+games+' games, '+checks+' stripped copies (seats + spectator), avg '+Math.round(bytes/checks)+' bytes JSON, max '+maxBytes);
console.log('  poison differences '+poisonDiff+', legal-move differences '+moveDiff+', structural leaks '+struct+', unlisted-field leaks '+unlisted+' (info: TB.moves on the copy differs from the host list in '+viewMoveDiff+' decisions)');
for(const b of bad)console.log('  '+b);const ok=!poisonDiff&&!moveDiff&&!struct&&!unlisted;console.log(ok?'NET-STRIP TEST PASSED':'NET-STRIP TEST FAILED');process.exit(ok?0:1);
