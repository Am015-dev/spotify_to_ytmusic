// dump the Crown City Smash card, tile and token tables for the shared reference page -> SP/ref_kot.json. Usage: node dump_ref.js [kot2.html]
const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||__dirname+'/kot2.html','utf8');
const w=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/'}).window;
const E=w.eval('JSON.stringify({CARDS,KWHELP,KWN,BASEDECK,MBDECK,COSTUMES,WTILES,CURSES,EVO,MEVO,EXPS,BFACES,FFACES,MONS})');
fs.writeFileSync(__dirname+'/../ref_kot.json',E);console.log(E.length,'bytes');setTimeout(()=>process.exit(0),50);
