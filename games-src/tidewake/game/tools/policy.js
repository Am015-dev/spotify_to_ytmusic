// policy check: seat 0 plays by a fixed policy vs N-1 computers (rulebook start, 6 leviathans); prints win %, turns, placements.
// node tools/policy.js <policy: best|first|rand> [rivalLevel=easy] [games=300] [players=3]
//   best  = the hint's ★ move (what a careful newcomer who follows the tile labels plays)
//   first = the first tile in hand that is not a sinking tile at its shown turn (what "tap the first ✓, Place" plays)
//   rand  = any legal tile that does not sink you now
const {load}=require('./load');const U6=require('fs').readFileSync(__dirname+'/../ui6.js','utf8');const ADV=U6.slice(U6.indexOf('function surv2'),U6.indexOf('function recMove'));
const X=load(['data.js','engine.js','ai.js'],ADV+';globalThis.__ADV=(K,s)=>advise(K,s);');
if(process.env.RK)X.ai.AILV.hard.rk=+process.env.RK;if(process.env.MC)X.ai.AILV.hard.mc=+process.env.MC;
const pol=process.argv[2]||'best',lv=process.argv[3]||'easy',n=+process.argv[4]||300,np=+process.argv[5]||3;
let wins=0,turns=0,pls=0,lt3=0;
for(let g=0;g<n;g++){X.setSeed(g*7919+11);X.ai.setAiSeed(g+5);X.newGame({players:np,seats:['human'].concat(Array(np-1).fill('ai')),lv:['hard'].concat(Array(np-1).fill(lv)),first:g%np});
  let k=0,pl=0;const rng=(()=>{let a=g*99+7;return()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff}})();
  while(X.G.phase!=='over'&&k++<5000){const s=X.sideToAct();if(s<0)break;let m;
    if(s===0&&!X.G.q&&X.G.phase==='play'&&X.G.step==='act'&&pol!=='best'){if(pol==='adv'){const a=X.ctx.__ADV(X.knowledge(0),0);m=a&&a.length?a[0].m:null}else{const K=X.knowledge(0);const mv=X.genMoves(K,0).filter(m=>m.a==='place');
      const ok=m=>{const S=K.ships[m.s];const sim=X.E.simPlace(K,S.x,S.y,K.hands[0][m.t],m.r);const o=sim.res[m.s];return o&&o.st==='ok'&&!sim.coll.includes(m.s)};
      if(pol==='first'){m=mv.filter(m=>m.r===0).find(ok)||mv.find(ok)||mv[0]}else{const p=mv.filter(ok);m=(p.length?p:mv)[Math.floor(rng()*(p.length?p:mv).length)]}
      }if(!m)m=X.ai.aiMove(0,'hard');pl++}
    else{if(s===0&&!X.G.q&&X.G.phase==='play')pl++;m=X.ai.aiMove(s,s===0?'hard':lv)}
    if(!m)break;X.performMove(m,s)}
  turns+=X.G.turn;pls+=pl;if(pl<3)lt3++;if(X.G.over&&X.G.over.win.includes(0))wins++}
console.log(`${pol.padEnd(5)} vs ${np-1}x${lv}: win ${(100*wins/n).toFixed(0)}% (fair share ${(100/np).toFixed(0)}%), avg turns ${(turns/n).toFixed(1)}, my placements ${(pls/n).toFixed(1)}, <3 placements ${(100*lt3/n).toFixed(0)}%`)
