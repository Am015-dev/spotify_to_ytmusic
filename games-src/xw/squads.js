const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync('nebula.html','utf8');const N=+process.argv[2]||20;const out=[];
function one(){return new Promise(res=>{const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/'});const w=dom.window;w.eval('ANIM=0;AIDELAY=0;DEFSIZE="std";'+(process.env.PRE||''));w.eval("newGame('ai')");
  const t0=Date.now();const iv=setInterval(()=>{const G=w.eval('G');if(G.winner||Date.now()-t0>40000){clearInterval(iv);const c=[0,1].map(k=>G.ships.filter(s=>s.side===k));
    res({w:G.winner,pts:G.pts,n:c.map(x=>x.length),ups:c.map(x=>x.reduce((a,s)=>a+s.ups.length,0)),bump:[0,1].map(k=>G.log.filter(l=>l.s===k&&/bumps into/.test(l.t)).length),left:c.map(x=>x.filter(s=>s.alive).length),init:G.init});w.close()}},5)})}
(async()=>{for(let i=0;i<N;i++)out.push(await one());const a={P1:0,P2:0,draw:0};out.forEach(r=>a[r.w]=(a[r.w]||0)+1);console.log(JSON.stringify(a));
 const avg=(f)=>[0,1].map(k=>(out.reduce((s,r)=>s+f(r)[k],0)/out.length).toFixed(1));console.log('pts',avg(r=>r.pts),'ships',avg(r=>r.n),'ups',avg(r=>r.ups),'bumps',avg(r=>r.bump),'init P2 share',(out.filter(r=>r.init===1).length/out.length).toFixed(2));
 console.log('wins when Armada has more ships than 2x Compact:',out.filter(r=>r.n[1]>=2*r.n[0]).map(r=>r.w).join(','))})();
