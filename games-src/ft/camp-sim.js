// Headless story-mode calibration: plays every chapter's setup (twists included) many times with the computer in the player's seat.
//   node camp-sim.js [games=40] [playerLevel=easy,normal] [chapters=c1,c2,...]
// "easy" stands in for a newcomer, "normal" for a regular player. Prints the win rate per chapter and level.
const fs=require('fs'),vm=require('vm');const D=__dirname+'/src/';
const src=['data.js','djinns.js','engine.js','ai.js'].map(f=>fs.readFileSync(D+f,'utf8')).join('\n')+';globalThis.__X={get G(){return G},newGame,setSeed,sideToAct,validMoves,performMove,aiMove,scoreOf,applyTwist,UI,P};';
const camp=JSON.parse(fs.readFileSync(__dirname+'/campaign.json','utf8'));
const N=+process.argv[2]||40,levels=(process.argv[3]||'easy,normal').split(','),only=(process.argv[4]||'').split(',').filter(Boolean);
const mk=()=>{const ctx={console:{log(){},error(){}},Math,JSON,Date};vm.createContext(ctx);vm.runInContext(src,ctx);return ctx.__X};
function run(def,plv,seed){const X=mk(),s=def.setup,np=s.np||s.players||s.seats.length,op=def.opponent;
  X.setSeed(seed);X.UI.sim=0;const lv=s.seats.slice(0,np).map((x,i)=>i===0?plv:op.aiLevel);
  X.newGame({np,seats:s.seats.slice(0,np).map(()=>'ai'),lv,names:s.names,ex:Object.assign({artisans:false,sultan:false,thieves:false,promos:false},s.ex||{}),mode:'ai'});X.applyTwist(def);
  let n=0;while(!X.G.over&&n++<6000){const side=X.sideToAct();if(side<0)break;const m=X.aiMove(side);if(!m)break;const r=X.performMove(m,side);if(!r.success)break}
  const G=X.G;if(!G.over)return null;const sc=[];for(const r of G.over.scores)sc[r.p]=r.s.total;return {won:G.over.win.includes(0)&&G.over.win.length===1,score:sc[0],opp:Math.max(...sc.slice(1)),round:G.round}}
for(const def of camp.chapters){if(only.length&&!only.includes(def.id))continue;
  for(const plv of levels){let w=0,t=0,sc=0,rd=0;for(let g=0;g<N;g++){const r=run(def,plv,7000+g*13+def.id.length);if(!r)continue;t++;if(r.won)w++;sc+=r.score;rd+=r.round}
    console.log(`${def.id} ${def.boss?'BOSS':'    '} ${def.opponent.name.padEnd(10)} opp ${def.opponent.aiLevel.padEnd(6)} you ${plv.padEnd(6)} win ${(100*w/t).toFixed(0).padStart(3)}% of ${t}  avg score ${(sc/t).toFixed(0)}  rounds ${(rd/t).toFixed(1)}  [${def.goal.text}]`)}}
