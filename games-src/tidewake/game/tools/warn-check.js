// Does a player get warned before being boxed in? Seat 0 plays a random non-sinking move each turn (a careless newcomer) vs Easy computers.
// Per seat-0 turn we compute the same signals the strip shows: "Hemmed in soon" (best two-turn survival < 75%, or, on the edge, <= 4 safe ways now or <= 1 next turn)
// and "Tight next turn" (the chosen way leaves <= 1 safe way next turn, or < 60% two-turn survival), plus the leviathan danger line. Then for every turn where seat 0 had NO safe
// placement (all tiles red), we check whether a warning showed on one of its 2 previous turns.
//   node tools/warn-check.js [games=60] [players=3]
const {load}=require('./load');const fs=require('fs');
const ui6=fs.readFileSync(__dirname+'/../ui6.js','utf8');const grab=n=>{const i=ui6.indexOf('function '+n+'(');let d=0,j=ui6.indexOf('{',i);for(let k=j;k<ui6.length;k++){if(ui6[k]==='{')d++;else if(ui6[k]==='}'){d--;if(!d)return ui6.slice(i,k+1)}}};
const X=load(['data.js','engine.js','ai.js'],';'+grab('surv2')+';'+grab('advise')+';'+grab('monHits')+';globalThis.__ADV=advise;globalThis.__MH=monHits;');
const advise=X.ctx.__ADV,monHits=X.ctx.__MH;let dShown=0;const N=+process.argv[2]||60,NP=+process.argv[3]||3;let boxedTurns=0,warned=0,turns=0,bShown=0,tShown=0,losses=0,lossNoSafe=0,lossOther=0,lossWarnedAny=0;
for(let g=0;g<N;g++){X.setSeed(1000+g);X.ai.setAiSeed(77+g);X.newGame({players:NP,level:'easy',first:g%NP});X.G.seats[0].human=false;
  const hist=[],info=[];let k=0;
  while(X.G.phase!=='over'&&k++<4000&&X.G.ships[0].alive){const st=X.ai.aiStep();if(!st)break;let m=st.m;
    if(st.seat===0&&X.G.phase==='play'&&X.G.step==='act'&&!X.G.q&&m.a!=='start'){const K=X.knowledge(0);let a=null;try{a=advise(K,0)}catch(e){}
      if(a){const pl=a.filter(x=>x.m.a==='place');const ok=pl.filter(x=>x.info.tier!==0);turns++;
        if(pl.length&&!ok.length){boxedTurns++;if(hist.slice(-2).some(h=>h))warned++;else if(process.env.DBG)console.log('MISS',JSON.stringify(info.slice(-2)))}
        const S=X.G.ships[0];const ed=S.x==null?9:Math.min(S.x,S.y,6-S.x,6-S.y);const s2=ok.filter(x=>x.info.s2!=null);
        const bestN=Math.max(0,...ok.map(x=>x.info.n||0));const B=s2.length&&(Math.max(...s2.map(x=>x.info.s2))<.75||ed===0&&(ok.length<=+(process.env.NOK||4)||bestN<=+(process.env.BN||1)));
        const pick=ok.length?ok[Math.floor(Math.random()*ok.length)]:null;const i=pick&&pick.info;
        const T=!B&&i&&i.n!=null&&(i.n<=+(process.env.TN||1)&&(i.fd==null||i.fd<+(process.env.FD||1.1))||i.s2!=null&&i.s2<.6);const Dg=S.x!=null&&X.G.mons.some(mo=>mo.k==='L'&&monHits(mo,[[S.x,S.y],S.on]).length);if(Dg)dShown++;if(B)bShown++;if(T)tShown++;hist.push(!!(B||T||Dg&&process.env.WD!=='0'));info.push(i?{n:i.n,fd:i.fd&&+i.fd.toFixed(2),s2:i.s2&&+i.s2.toFixed(2),ed,bs2:s2.length?+Math.max(...s2.map(x=>x.info.s2)).toFixed(2):null,nok:ok.length}:null);
        if(pick)m=pick.m}}
    const r=X.performMove(m,st.seat);if(!r.success){break}}
  if(!X.G.ships[0].alive){losses++;}}
console.log(`games ${N} (${NP}p, careless seat 0 vs Easy): seat-0 turns ${turns}; "hemmed in" shown ${bShown}, "tight next turn" shown ${tShown}, danger shown ${dShown}`);
console.log(`turns with every tile sinking: ${boxedTurns}; warned on one of the 2 turns before: ${warned} (${boxedTurns?Math.round(100*warned/boxedTurns):100}%)`);
