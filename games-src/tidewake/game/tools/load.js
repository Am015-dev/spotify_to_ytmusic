// loads the game scripts into a fresh vm context; returns an accessor object
const fs=require('fs'),vm=require('vm');const D=__dirname+'/../src/';
function load(files,extra){files=files||['data.js','engine.js'];const src=files.map(f=>fs.readFileSync(D+f,'utf8')).join('\n')+(extra||'')+
 `;globalThis.__X={get G(){return G},set G(v){G=v},newGame,setSeed,sideToAct,validMoves,performMove,checkInvariants,render_game_to_text,knowledge,legal,describeMove,genMoves,UI,
  ai:typeof aiMove==='function'?{AILV,aiMove,aiStep,setAiSeed,aiAnswer:typeof aiAnswer==='function'?aiAnswer:null}:null,
  E:{AG,QH,LEV,CUR_TYPE,PAIR,ROTP,BASE_PATHS,GATE_ID,CANNON_IDS,WAVE_ID,MAEL_ID,follow,simPlace,now,later,flow,eliminate,monById,levCount,clone,cellAt,monAt,startMarks,waveStr,inRow,NCUR,MATE,DIR}};`;
 const ctx={console,Math,JSON,Date};vm.createContext(ctx);vm.runInContext(src,ctx,{filename:'game.js'});ctx.__X.UI.sim=1;ctx.__X.ctx=ctx;return ctx.__X}
module.exports={load};
