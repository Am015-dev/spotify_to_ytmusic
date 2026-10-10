// PERF-3: which scene geometry grows while driving. Enter roam (CITY), drive DRIVE s with keyboard, sample scene geometry by owner every STEP s,
// print per-owner MB (gpu-equivalent and cpu) first → last and the biggest growers. usage: CITY=fra DRIVE=180 node tools/eff/geodiff.js <url local_dbg.html>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const URL=process.argv[2],CITY=process.env.CITY||'fra',DRIVE=+(process.env.DRIVE||180),STEP=+(process.env.STEP||30);
const SAMP=()=>{const seen=new Set(),own={};let tot=0,cpu=0;const key=o=>{let a=o,path=[];while(a&&a.parent&&path.length<12){const u=a.userData||{};path.push(a.name||Object.keys(u).slice(0,2).join('+')||a.type);a=a.parent}path.reverse();return path.slice(0,3).join('/')+'|'+o.type+(o.visible?'':'(h)')};
 __dbg.scene.traverse(o=>{const g=o.geometry;if(!g)return;const k=key(o),e=own[k]||(own[k]={n:0,g:0,c:0});e.n++;if(seen.has(g))return;seen.add(g);const at=Object.values(g.attributes);if(g.index)at.push(g.index);if(o.isInstancedMesh){at.push(o.instanceMatrix);if(o.instanceColor)at.push(o.instanceColor)}
  for(const a of at){const d=a.isInterleavedBufferAttribute?a.data:a,arr=d.array,id=arr?arr.buffer:d;if(seen.has(id))continue;seen.add(id);const by=arr?arr.byteLength:0;e.c+=by;e.g+=by||d.count*(a.itemSize||1)*4;tot+=by||d.count*(a.itemSize||1)*4;cpu+=by}});
 return{tot:tot/1048576,cpu:cpu/1048576,geoms:__dbg.renderer.info.memory.geometries,own}};
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--js-flags=--expose-gc']});
const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await ctx.newPage();p.setDefaultTimeout(1800000);
await p.addInitScript("Object.defineProperty(window,'devicePixelRatio',{get:()=>0.35,configurable:true})");const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,160)));
await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:200});
await p.evaluate(c=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}));if(c==='ath'){localStorage.setItem('mho_city@1','ath');localStorage.setItem('mho_athd@1','A');localStorage.setItem('mho_roam.ath@1','{"otg":{}}');localStorage.setItem('mho_story.ath@1','{"seen":1}')}},CITY);
await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:200});
await p.evaluate(()=>__mho.enterRoam());await p.waitForFunction(()=>__mho.state==='roam'&&!(__mho.LD&&__mho.LD.on),null,{polling:200});
const S=[];const smp=async t=>{const s=await p.evaluate(SAMP);s.t=t;s.pos=await p.evaluate(()=>[Math.round(__mho.RO?__mho.RO.x:0),Math.round(__mho.RO?__mho.RO.z:0)]).catch(()=>null);S.push(s);console.log(`t=${t}s tot ${s.tot.toFixed(1)} MB cpu ${s.cpu.toFixed(1)} geoms ${s.geoms} pos ${s.pos}`)};
await smp(0);await p.keyboard.down('ArrowUp');for(let i=1;i<=DRIVE;i++){await p.waitForTimeout(1000);if(i%6===3){await p.keyboard.down(i%12===3?'ArrowLeft':'ArrowRight');await p.waitForTimeout(500);await p.keyboard.up('ArrowLeft');await p.keyboard.up('ArrowRight')}if(i%STEP===0)await smp(i)}await p.keyboard.up('ArrowUp');
const A=S[1]||S[0],B=S[S.length-1],ks=new Set([...Object.keys(A.own),...Object.keys(B.own)]),d=[];for(const k of ks){const a=A.own[k]||{n:0,g:0,c:0},z=B.own[k]||{n:0,g:0,c:0};d.push([k,a.n,z.n,(a.g/1048576).toFixed(1),(z.g/1048576).toFixed(1),((z.g-a.g)/1048576).toFixed(2),((z.c-a.c)/1048576).toFixed(2)])}
d.sort((x,y)=>Math.abs(y[5])-Math.abs(x[5]));console.log('owner | n '+A.t+'s→'+B.t+'s | gpuMB | Δgpu | Δcpu');for(const r of d.slice(0,+(process.env.TOP||20)))console.log(' ',r.join(' | '));
console.log('errs',errs.slice(0,3));await b.close()})().catch(e=>{console.error(e);process.exit(1)});
