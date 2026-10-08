// list U-turns (>150°) per route in a tRoute24 dump: kind, route idx, s, position, distance to route ends
const{turns,resample}=require('../tools/d24lib');const j=require(require('path').resolve(process.argv[2]));
for(const[k,L]of Object.entries(j.paths)){(L||[]).forEach((P,i)=>{if(!Array.isArray(P)||P.length<2)return;const{len,turns:T}=turns(P);const R=resample(P);
 for(const t of T)if(Math.abs(t.ang)>150){const q=R[Math.min(R.length-1,Math.round(t.s/5))];console.log(k,i,'s',t.s,'of',Math.round(len),'ang',t.ang,'at',q.map(Math.round).join(','))}})}
