// tPerfLF (art-2): perf GO for the empty-green fill. Same route with the fill ON vs OFF (?lf=0) in one build, both cities:
// boot time (__tq.tReady) + frame time at 3 fixed views (2 lf1 spots, 30 frames each), no driving. Frame time = mean rAF delta (software GL here, so the absolute ms are slow; compare ON vs OFF).
//   node tools/tPerfLF.js <base url> [fra|ath]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const [BASE,ONLY]=process.argv.slice(2);
async function run(c,off){const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const p=await (await b.newContext({viewport:{width:852,height:393}})).newPage();p.setDefaultTimeout(150000);
 await p.goto(BASE+'?test='+c+(off?'&lf=0':''));await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:150000});
 const boot=await p.evaluate(()=>__tq.tReady);
 await p.evaluate(()=>{window.__ft=[];let t0=0;const f=t=>{if(t0)__ft.push(t-t0);t0=t;requestAnimationFrame(f)};requestAnimationFrame(f)});
 const ids=await p.evaluate(c=>Object.keys(__lvf.SP).filter(k=>__lvf.SP[k].c===c),c);const ft=[];
 // 3 fixed views (spot 1 ahead, spot 1 turned 180°, spot 2 ahead), 30 frames each, no driving
 for(const[id,turn]of[[ids[0],0],[ids[0],Math.PI],[ids[1],0]]){await p.evaluate(([id,t])=>{__lvf.go(__lvf.SP[id]);__lvf.ensure(__lvf.SP[id].x,__lvf.SP[id].z,600);__lvf.turn(t)},[id,turn]);await p.waitForTimeout(800);
  await p.evaluate(()=>{__ft.length=0});await p.waitForFunction(()=>__ft.length>=30,null,{polling:100});ft.push(...await p.evaluate(()=>__ft.slice(3)))}
 const info=await p.evaluate(()=>__lvf.rinfo());await b.close();
 const m=a=>a.reduce((s,v)=>s+v,0)/Math.max(1,a.length),p95=a=>{const s=[...a].sort((x,y)=>x-y);return s[Math.floor(s.length*.95)]||0};
 return{c,fill:off?'OFF':'ON',boot,spotMs:+m(ft).toFixed(1),spotP95:+p95(ft).toFixed(1),...info}}
(async()=>{for(const c of ONLY?[ONLY]:['fra','ath']){const A=await run(c,true),B=await run(c,false);console.log(JSON.stringify(A));console.log(JSON.stringify(B));
 const d=(B.spotMs/A.spotMs-1)*100,db=(B.boot-A.boot)/1000;
 console.log(`${d<=5&&db<=2?'PASS':'FAIL'} perf ${c}: frame time at 3 fixed views ${d>=0?'+':''}${d.toFixed(1)}% · boot ${db>=0?'+':''}${db.toFixed(1)} s (line: ≤ +5%, ≤ +2 s)`)}})();
