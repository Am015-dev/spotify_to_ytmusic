// merges cover.js outputs and prints the coverage list: node tools/covmerge.js out/cov_a.json out/cov_b.json
const fs=require('fs');const {load}=require('./load');const X=load(['data.js','engine.js']);const C={};let g=0,d=0,mv=0,er=0,vi=0;
for(const f of process.argv.slice(2)){const o=JSON.parse(fs.readFileSync(f,'utf8'));for(const k in o.C)C[k]=(C[k]||0)+o.C[k];g+=o.games;d+=o.done;mv+=o.moves;er+=o.errs;vi+=o.viol}
const want={equipment:Object.keys(X.E.EQUIP).map(i=>'eq:'+i),'crew tools':['dd','sweep','handsets','pt3','pt10'].map(k=>'item:'+k),crew:Object.keys(X.E.CHARS).map(c=>'char:'+c),
  restrictions:'ABCDEFGHIJKL'.split('').map(c=>'con:'+c),challenges:[1,2,3,4,5,6,7,8,9,10].map(i=>'chal:'+i),
  core:['dual hit','dual miss','solo cut','reveal reds','unlock','sweep','sorted insert','probe dd hit','probe eq3 hit','probe pt3 hit','probe eq5 hit','probe eq10 hit','probe pt10 hit'].map(k=>'core:'+k),
  endings:['win','red wire','fuse burnt','other boom'].map(k=>'end:'+k),tokens:['n','y','p','c','f','n:side','side none'].map(k=>'tok:'+k),
  'job rules':[...new Set(Object.values(X.MISSIONS).flatMap(M=>M.rules.map(r=>r.k)))].map(k=>'rule:'+k),jobs:Object.keys(X.MISSIONS).map(n=>'job:'+n)};
const fired=k=>k.startsWith('rule:')?Object.keys(C).filter(x=>x.startsWith(k+':')&&!/:(setup|pub|pre|post|begin)$/.test(x)).reduce((a,x)=>a+C[x],0):(C[k]||(C['forced:'+k]?'forced':0));
console.log(`cover: ${g} games, ${d} finished, ${mv} moves, ${er} errors, ${vi} invariant failures (checkInvariants after every move)`);
let miss=[];for(const grp in want){const items=want[grp].map(k=>[k,fired(k)]);miss=miss.concat(items.filter(x=>!x[1]).map(x=>x[0]));console.log(`${grp}: `+items.map(([k,n])=>`${k.split(':').slice(1).join(':')}=${n}`).join(' '))}
console.log('MISSING',miss.length?miss.join(' '):'none');
