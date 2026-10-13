// height map of a world preset -> qa_bx/map_<w>.png (cell grid every 8 m, labels every 5 cells)  node tools/bx/map.js valley
const L=require('./lib.js');const fs=require('fs');(async()=>{const w=process.argv[2]||'valley';const {b,p}=await L.launch();await p.evaluate(()=>__bx.open());
 const th=await p.evaluate(w=>{__bx.load({log:[['w',w]]},'MAP');return Array.from(__bx.BX.th)},w);fs.writeFileSync('/tmp/claude-0/th.json',JSON.stringify(th));await b.close()})();
