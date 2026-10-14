// qa-1 MONKEY BOT: seeded random-but-plausible real keyboard input for N simulated minutes per city, the invariants (window.__bugs) as the oracle.
// node tools/qa/monkey.js <out/<ver> dir | url> [--city fra,ath] [--min 30] [--pages 2] [--seed 1] [--dt 0.05] [--out out/qa] [--chunk 120]
//   --pages P: P parallel pages per city, each simulating min/P minutes (different seeds) so 30 min/city fits in a few minutes of wall time
//   --dt: fixed step (default 0.05 = the game's own cap, a 20 fps phone); older builds without the kit get it spliced in by lib.js
// Output: out/qa/monkey_<ver>_<ts>.json (all hits with repro URLs) and FAIL lines grouped by invariant (cells = distinct 5 m cells, n = ticks).
const fs=require('fs'),path=require('path');const L=require('./lib');
const A=process.argv.slice(2),flag=(f,d)=>{const i=A.indexOf(f);return i<0?d:A[i+1]};
const base=A[0]&&!A[0].startsWith('--')?A[0]:undefined,cities=(flag('--city','fra,ath')).split(','),MIN=+flag('--min',30),PAGES=+flag('--pages',2),SEED=+flag('--seed',1),DT=+flag('--dt',.05),OUT=flag('--out','out/qa'),CHUNK=+flag('--chunk',120);
const RB=flag('--repro-base','');   // prefix for the repro links, e.g. the live game URL (default: bare ?repro=…)
const src=fs.readFileSync(path.join(__dirname,'monkey_page.js'),'utf8');
(async()=>{const t0=Date.now();fs.mkdirSync(OUT,{recursive:true});const B=await L.resolveBase(base),br=await L.launch();
 const jobs=[];for(const c of cities)for(let k=0;k<PAGES;k++)jobs.push({c,k,seed:SEED*1000+k*37+(c==='ath'?500:0)});
 const res=await Promise.all(jobs.map(async j=>{const r={city:j.c,page:j.k,seed:j.seed,sim:0,bugs:[],log:{},errs:[]};const tb=Date.now();
  try{const S=await L.open({base:B.url,city:j.c,browser:br});r.boot=(Date.now()-tb)/1000;r.errs=S.errs;r.build=await L.ev(S.p,'__qa.bug&&OD_CHANGELOG[0].v');
   await S.p.evaluate(s=>window.__qa.ev('window.__monkey='+s),src);
   const secs=MIN*60/PAGES;let done=0;const tr=Date.now();
   while(done<secs){const k=Math.min(CHUNK,secs-done);
    const o=await S.p.evaluate(a=>window.__monkey(a[0],a[1],a[2]),[j.seed+done,k,DT]);done+=k;r.sim+=o.sim;for(const q in o.log)if(typeof o.log[q]==='number')r.log[q]=(r.log[q]||0)+o.log[q];else for(const w in o.log[q])(r.log[q]=r.log[q]||{})[w]=(r.log[q][w]||0)+o.log[q][w];
    process.stderr.write(`[${j.c}#${j.k}] sim ${(done/60).toFixed(1)}/${(secs/60).toFixed(1)} min, wall ${((Date.now()-tr)/1000).toFixed(0)} s, bugs ${await L.ev(S.p,'__bugs.length')}\n`)}
   r.wall=(Date.now()-tr)/1000;
   r.bugs=(await S.p.evaluate(()=>__bugs.map(b=>({...b,repro:__qa.reproFor(b)})))).map(b=>({...b,repro:b.repro.replace(/^https?:\/\/[^?]*/,RB)}));
   await S.ctx.close()}catch(e){r.crash=String(e).slice(0,300)}return r}));
 await br.close();if(B.s)B.s.close();
 // group by invariant across pages
 const G={};let simTot=0;for(const r of res){simTot+=r.sim;for(const b of r.bugs){const g=G[b.name]=G[b.name]||{name:b.name,cells:0,n:0,cities:{},ex:[]};g.cells++;g.n+=b.n;g.cities[b.city]=(g.cities[b.city]||0)+1;g.ex.push({city:b.city,x:b.x,z:b.z,n:b.n,d:b.d,repro:b.repro})}}
 const groups=Object.values(G).map(g=>{g.ex.sort((a,b)=>b.n-a.n);g.ex=g.ex.slice(0,5);return g}).sort((a,b)=>b.cells-a.cells||b.n-a.n);
 const ts=new Date().toISOString().replace(/[-:T]/g,'').slice(0,12),ver=(res.find(r=>r.build)||{}).build||'?';
 const file=path.join(OUT,`monkey_${ver}_${ts}.json`);fs.writeFileSync(file,JSON.stringify({ver,min:MIN,pages:PAGES,dt:DT,seed:SEED,wall:(Date.now()-t0)/1000,simMin:simTot/60,groups,runs:res},null,0));
 console.log(`MONKEY ${ver}: ${(simTot/60).toFixed(1)} sim min over ${res.length} pages in ${((Date.now()-t0)/1000).toFixed(0)} s wall · ${file}`);
 for(const r of res)console.log(`  ${r.city}#${r.page} seed ${r.seed}: sim ${(r.sim/60).toFixed(1)} min wall ${(r.wall||0).toFixed(0)} s, ${r.bugs.length} hit cells, stuck ${r.log.stuck||0}, exits ${r.log.exits||0}, enters ${r.log.enters||0}${r.crash?' CRASH '+r.crash:''}${r.errs.length?' pageerrors '+r.errs.length:''}`);
 for(const g of groups)console.log(`FAIL ${g.name}: ${g.cells} cells, n=${g.n} ${JSON.stringify(g.cities)} e.g. ${g.ex[0].d} @${g.ex[0].x},${g.ex[0].z} ${g.ex[0].repro}`);
 if(!groups.length)console.log('PASS no invariant fired');process.exit(groups.length?1:0)})().catch(e=>{console.log('FAIL monkey crashed: '+e);process.exit(2)});
