const fs=require('fs');const tag=process.argv[2];const jobs=process.argv.slice(3);let tw=0,tg=0;const o=[];
for(const j of jobs){try{const r=require('./out2/'+tag+'_'+j+'.json');let w=0,g=0;for(const x of r.rows){w+=x.w;g+=x.g}o.push(j+':'+w+'/'+g);tw+=w;tg+=g}catch(e){o.push(j+':?')}}
console.log(tag,o.join(' '),'TOTAL',tw+'/'+tg)
