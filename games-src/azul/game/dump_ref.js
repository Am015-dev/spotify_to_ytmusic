// dump the Sunglaze tile and scoring list for the shared reference page -> SP/ref_azul.json
const fs=require('fs'),vm=require('vm');const D=__dirname+'/src/';const ctx={console};vm.createContext(ctx);
vm.runInContext(['data.js','art.js'].map(f=>fs.readFileSync(D+f,'utf8')).join('\n')+';const esc=s=>s;function tileChip(){return ""};'+fs.readFileSync(D+'rules-html.js','utf8')+';globalThis.__R=REF',ctx);
const E=ctx.__R.map(e=>({s:e.s,n:e.n,tags:e.tags,t:e.t,c:e.c==null?null:e.c,sub:e.sub||[]}));
fs.writeFileSync(__dirname+'/../../ref_azul.json',JSON.stringify(E));console.log(E.length,'entries ->',require('path').resolve(__dirname+'/../../ref_azul.json'))
