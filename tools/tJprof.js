const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await (await b.newContext({viewport:{width:852,height:393}})).newPage();
await p.goto(process.argv[2]);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
for(const id of process.argv[3].split(',')){const r=await p.evaluate(([id])=>{const M=__mho;M.setOpt('tab','tt');M.setOpt('cls','rookie');M.setOpt('track',id);M.startRace();const TD=M.TD;
 return TD.jumps.map(j=>{const ys=[];for(let s=j.s0-60;s<=j.s1+60;s+=10){const f=Math.floor(s/TD.ds)%TD.N;ys.push(Math.round(TD.P[f*3+1]))}return{id:j.id,s0:Math.round(j.s0),s1:Math.round(j.s1),gap:Math.round(j.s1-j.s0),g:+j.g.toFixed(2),floor:j.floor,ys:ys.join(' ')}})},[id]);console.log(id,JSON.stringify(r))}
await b.close()})();
