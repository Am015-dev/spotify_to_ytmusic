// writes SP/ref_shortfuse.json (every wire, token, card and job) for the shared reference page
const fs=require('fs'),vm=require('vm');const D=__dirname;const ctx={console};vm.createContext(ctx);
vm.runInContext(['src/data.js','texts.js'].map(f=>fs.readFileSync(D+'/'+f,'utf8')).join('\n')+';globalThis.__E=refEntries()',ctx);
fs.writeFileSync(D+'/../../ref_shortfuse.json',JSON.stringify(ctx.__E));console.log(ctx.__E.length,'entries')
