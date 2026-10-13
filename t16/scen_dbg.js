module.exports=({p,tick,down,up,center,shot,st,res})=>{global.SCEN=async()=>{const g=await center('#tG');await down('gas',g);
 for(let i=0;i<6;i++){await tick(30);res['t'+i]=await p.evaluate(()=>{const R=__mho.RO;return{v:R.v,card:!!R.card,story:!!R.story,fr:R.frozen,map:R.mapOpen,ctl:JSON.stringify(__mho.CTL||null),touch:JSON.stringify({g:__mho.touch&&__mho.touch.gas,on:__mho.touch&&__mho.touch.on,used:__mho.touch&&__mho.touch.used,park:__mho.touch&&__mho.touch.park}),msg:(document.querySelector('#msg')||{}).textContent}})}
 await shot('dbg')}};
