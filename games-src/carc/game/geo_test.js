// checks that every tile drawing splits its fields exactly like the tile data (and touches the right towns)
const fs=require('fs'),vm=require('vm');const D=__dirname+'/src/';const ctx={console,Math,JSON};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(D+'data.js','utf8')+fs.readFileSync(D+'geo.js','utf8')+';globalThis.__X={TT,buildGeo,tileSegs}',ctx);const X=ctx.__X;
let bad=0,warn=0;const t0=Date.now();
X.TT.forEach((d,t)=>{const g=X.buildGeo(t);if(g.err.length){bad++;console.log('ERR',d.id,g.err.join('; '))}if(g.adjWarn.length){warn++;console.log('adj',d.id,g.adjWarn.join('; '))}});
console.log(`tiles ${X.TT.length} drawing errors ${bad} adjacency warnings ${warn} ${Date.now()-t0}ms`);
