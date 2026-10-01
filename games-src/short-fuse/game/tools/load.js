// loads the game scripts into a fresh vm context; returns an accessor object
const fs=require('fs'),vm=require('vm');const D=__dirname+'/../src/';
function load(files,extra){files=files||['data.js','engine.js'];const src=files.map(f=>fs.readFileSync(D+f,'utf8')).join('\n')+(extra||'')+
 `;globalThis.__X={get G(){return G},set G(v){G=v},newGame,setSeed,sideToAct,validMoves,performMove,checkInvariants,render_game_to_text,knowledge,legal,MISSIONS,UI,tick,describeMove,
  ai:typeof aiMove==='function'?{aiMove,aiStep,whatWeKnow,setAiSeed,aiAnswer,decide}:null,
  E:{INFO_TOKENS,WIRES,EQUIP,RH,AG,QH,CONSTRAINTS,CHALLENGES,SCRIPTS,BUNKER,CHARS,clone,newSlot,later,now,flow,cv,cutCount,remaining,standsOf,ownerOf,heldVals,advanceClock,insertSlot,hook}};`;
 const errs=[];const ctx={console:{log:(...a)=>console.log(...a),error:(...a)=>errs.push(a.join(' '))},Math,JSON,Date};vm.createContext(ctx);vm.runInContext(src,ctx,{filename:'game.js'});ctx.__X.errs=errs;ctx.__X.UI.sim=1;ctx.__X.ctx=ctx;return ctx.__X}
module.exports={load};
