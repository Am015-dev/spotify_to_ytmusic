// human-path coverage: every pilot / upgrade is forced into a hot-seat game (both seats human) that is played by random legal moves
// through validMoves()/performMove(). Reports errors, rejected moves, invariant violations, stalls and the questions (G.q keys) asked.
// Usage: node coverh.js pilots|ups [reps=2]   (env SH/NS shard the card list)
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync('nebula.html','utf8');
const probe=new JSDOM(html,{runScripts:'dangerously',url:'http://localhost/'}).window;const P=probe.eval('PILOTS'),U=probe.eval('UPGRADES'),S=probe.eval('SHIPS');
const which=process.argv[2]||'pilots';const reps=+(process.argv[3]||2);const fac=k=>S[P[k].ship].fac;
function run(sq0,seed){const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/'});const w=dom.window;const errs=[];
  w.addEventListener('error',e=>errs.push((e.error&&e.error.stack||e.message).slice(0,400)));w.console.error=(...a)=>errs.push(a.join(' ').slice(0,300));
  w.eval('ANIM=0;AIDELAY=0;setSeed('+seed+')');const f=fac(sq0[0].p);w.__sq0=sq0;
  w.eval(`(function(){let z=${seed};const R=n=>{z=(z*1103515245+12345)%2147483648;return z%n};const ex={w1:true,w2:true,w3:true};const mine=window.__sq0.concat(randomSquad(${f},60,ex,R));const foe=randomSquad(${1-f},100,ex,R);
     newGame({fac:${f}===0?[0,1]:[1,0],players:[{human:true},{human:true}],squads:[mine,foe],ex})})()`);
  let fails=0,steps=0,last='',same=0;const t0=Date.now();
  while(true){const G=w.eval('G');if(G.winner||steps>6000||Date.now()-t0>(+process.env.TLIM||30000))break;
    const inv=steps%5?[]:w.eval('checkInvariants()');if(inv.length&&errs.length<3)errs.push('INV r'+G.round+' '+inv[0]);
    const side=w.eval('sideToAct()');if(side<0){errs.push('STALL phase '+G.phase);break}
    if(G.phase==='plan'){w.eval(`(()=>{const k=${side};const save=G.players[k].human;aiPlan(k);const ids=alive().filter(s=>s.side===k).map(s=>[s.id,s.dial]);ids.forEach(([id])=>ship(id).dial=null);
        for(const [id,m] of ids){const r=performMove({act:'dial',ship:id,m},k);if(!r.success)throw new Error(r.error)}})()`);steps++;continue}
    const mv=w.eval(`(()=>{const v=validMoves(${side});if(!v.length)return null;const good=v.filter(m=>!(m.act==='fire'&&m.w==='skip')&&!(m.act==='action'&&m.a==='skip')&&!(m.k==='x')&&!(m.k==='-'));
      if(good.length&&rnd(4))return good[rnd(good.length)];return v[rnd(v.length)]})()`);if(!mv){errs.push('no moves in '+G.phase);break}
    const r=w.eval(`performMove(${JSON.stringify(mv)},${side})`);if(!r.success){fails++;if(errs.length<3)errs.push('REJECT '+r.error.slice(0,200))}steps++;
    const sig=JSON.stringify([G.round,G.phase,G.oi,G.log.length,G.q&&G.q.key]);if(sig===last)same++;else{same=0;last=sig}if(same>400){errs.push('LOOP '+sig);break}}
  const G=w.eval('G');const out={w:G.winner,round:G.round,errs,fails,fired:G.fired||{},log:G.log.map(l=>l.t).join('\n')};w.close();return out}
const keys=(which==='pilots'?Object.keys(P).filter(k=>P[k].ab):Object.keys(U)).filter((k,i)=>i%(+process.env.NS||1)===(+process.env.SH||0));let bad=0;const allAsk={};
for(const k of keys){let pk=k,uk=null;if(which!=='pilots'){uk=k;const u=U[k];pk=Object.keys(P).find(p=>P[p].u.includes(u.slot)&&(!u.ship||u.ship===P[p].ship)&&(u.fac==null||u.fac===fac(p))&&(!u.small||S[P[p].ship].base!=='L')&&(!u.large||S[P[p].ship].base==='L')); if(!pk){console.log(k+': NO CARRIER');continue}}
  const sq=[{p:pk,u:uk?(uk==='t_warden'?['t_warden','u_hplasma']:[uk]):[]}];
  let errs=[],fails=0,done=0;const fired={};for(let r=0;r<reps;r++){const x=run(sq,1000+r*7919+keys.indexOf(k));errs=errs.concat(x.errs);fails+=x.fails;if(x.w)done++;for(const q in x.fired){fired[q]=(fired[q]||0)+x.fired[q];if(q.startsWith('ask:'))allAsk[q]=(allAsk[q]||0)+x.fired[q]}}
  if(errs.length||fails)bad++;const asks=Object.entries(fired).filter(([q])=>q.startsWith('ask:')).map(([q,n])=>q.slice(4)+' '+n).join(', ');
  console.log(`${k.padEnd(11)} games ${done}/${reps} asks: ${asks}${errs.length?' ERR '+errs[0].replace(/\n\s+at /g,' @ ').slice(0,300):''}${fails?' REJECTED '+fails:''}`)}
console.log('with errors:',bad);console.log('question keys seen:',JSON.stringify(allAsk))
