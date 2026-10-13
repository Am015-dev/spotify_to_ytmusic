JSON.stringify({SM:typeof SM_ON!=='undefined'?SM_ON:null,ATHD,D:Object.fromEntries(Object.entries(ATH_DIST).map(([k,v])=>[k,{r:v.r,st:v.st,name:v.name}])),cfg:athDistCfg(),
 sp:[[380,-260],[760,-40],[40,40],[260,-650],[380,-1500],[1750,-950]].map(([e,n])=>{const [x,z]=WP(e,n);return [Math.round(x),Math.round(z),districtAt(x,z),RW(x,z).map(Math.round)]}),nodes:HUB.nodes.length})
