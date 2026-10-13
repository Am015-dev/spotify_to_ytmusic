// tools/split_part.js <src file> <maxKB>: split a src module into parts under maxKB at top-level statement boundaries (each part must compile alone;
// greedy: the farthest valid boundary within maxKB, else the nearest one beyond it). Part 1 keeps the file name, the next ones are <name>2.js, <name>3.js ...
// Concatenation is byte-identical (check the md5 of tools/build.sh output before/after). Prints name + size per part.
const fs=require('fs'),vm=require('vm');const [,,f,kb]=process.argv,max=(+kb||38)*1024;
const L=fs.readFileSync(f,'utf8').split('\n'),ok=t=>{try{new vm.Script(t.replace(/^import .*$/gm,''));return true}catch(e){return false}};
const cand=i=>i<L.length&&/^(function|const|let|var|class|async function|\/\/)/.test(L[i]);
const parts=[];let s=0;
while(s<L.length){let sz=0,best=-1,beyond=-1;
 for(let i=s;i<L.length;i++){sz+=Buffer.byteLength(L[i])+1;
  if(i+1>=L.length){best=i+1;break}
  if(!cand(i+1))continue;
  if(sz<=max){if(ok(L.slice(s,i+1).join('\n')))best=i+1}else{if(best<0&&ok(L.slice(s,i+1).join('\n'))){beyond=i+1}break}}
 const e=best>=0?best:beyond>=0?beyond:L.length;parts.push(L.slice(s,e));s=e}
const base=f.replace(/\.js$/,'');
parts.forEach((p,i)=>fs.writeFileSync(i?base+(i+1)+'.js':f,p.join('\n')+(i<parts.length-1?'\n':'')));
console.log(parts.map((p,i)=>require('path').basename(i?base+(i+1)+'.js':f)+' '+Buffer.byteLength(p.join('\n'))).join('\n'));
