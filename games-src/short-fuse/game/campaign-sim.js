// Campaign difficulty simulation (no UI): every chapter of ../campaign.json is played by computer crews, with the human seat (0) played by the
// "newcomer" model = AI at `hl` (default easy, plus 12% random legal moves) and the teammates at the chapter level.
// node campaign-sim.js [seeds=60] [hl=easy] [chapterId...]   -> win rate per chapter (normal setup, then the "easier" setup)
const {load}=require('./tools/load');const C=require('../campaign.json');
const A=process.argv.slice(2);const seeds=+A[0]||60,hl=A[1]||"easy";const TL=process.env.TL||null,NZ=+(process.env.NZ||.12);const only=A.slice(2);
const X=load(['data.js','engine.js','ai.js']);
function play(def,easy,g){const s=Object.assign({},def.setup,easy&&def.easier?def.easier.setup:{});const np=s.players;const seed=977*def.setup.mission+g*7919+(easy?13:0);
  X.setSeed(seed);X.ai.setAiSeed(seed^0x5bd1);const lv=[];for(let i=0;i<np;i++)lv[i]=i===0?hl:(TL||s.level||"normal");
  X.newGame({np,mission:s.mission,mode:'ai',level:s.level||'normal',lv,twist:easy?null:def.twist,captain:g%np});
  let k=0,a=seed>>>0;const rnd=()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^a>>>15,a|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296};
  while(!X.G.over&&k++<4000){const seat=X.sideToAct();let st=null;
    if(seat===0&&!X.G.q&&rnd()<NZ){const mv=X.validMoves(0).filter(m=>m.a==='dual'||m.a==='solo');if(mv.length)st={m:mv[Math.floor(rnd()*mv.length)],seat:0}}
    if(!st)st=X.ai.aiStep();if(!st)break;const res=X.performMove(st.m,st.seat);if(!res.success)break}
  return X.G.over&&X.G.over.win?1:0}
for(const def of C.chapters){if(only.length&&!only.includes(def.id))continue;let w=0,e=0;for(let g=0;g<seeds;g++){w+=play(def,false,g);e+=play(def,true,g)}
  console.log(`${def.id} job ${def.setup.mission} ${def.setup.players}p ${def.boss?'BOSS ':''}twist=${def.twist?def.twist.id:'-'}  win ${(100*w/seeds).toFixed(0)}%  easier ${(100*e/seeds).toFixed(0)}%`)}
