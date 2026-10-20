// tAcct.js <built page url ?lowmem=1[&tstream=1]> <fra|ath> [rounds=2] [sec=30]: scene geometry CPU bytes (MB) by class + MEMF zip state at ready and after each simulated roam. ios-r18m
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--enable-precise-memory-info']});
const ctx=await b.newContext({viewport:{width:852,height:393},hasTouch:true,isMobile:true});const p=await ctx.newPage();const cdp=await ctx.newCDPSession(p);
await p.addInitScript('window.__dbg=1');await p.goto(process.argv[2]+'&test='+process.argv[3]+'&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready&&window.__oc,null,{polling:250,timeout:150000});
const R=+(process.argv[4]||2),sec=+(process.argv[5]||30);
const acct=()=>p.evaluate(()=>__oc.ev(`(()=>{const seen=new Set(),o={hid:0,vis:0,inst:0,n:0};let zz=0,zk=0,zkab=0,cz=0;
scene.traverse(m=>{const g=m.geometry;if(!g||seen.has(g))return;seen.add(g);let bt=0;for(const a of [...Object.values(g.attributes),g.index])if(a&&a.array)bt+=a.array.byteLength;if(m.isInstancedMesh){o.inst+=bt;if(m.instanceMatrix&&m.instanceMatrix.array)o.inst+=m.instanceMatrix.array.byteLength}else if(m.layers.mask===0||!m.visible)o.hid+=bt;else o.vis+=bt;o.n++});
const C={};if(typeof MEMF!=='undefined'){const by=(m)=>{let bt=0;const g=m.geometry;for(const a of [...Object.values(g.attributes),g.index])if(a&&a.array)bt+=a.array.byteLength;return bt};for(const e of MEMF.S.concat(MEMF.G||[])){const k=(e.g?'G':'S')+(e.cz?'z':e.on?'on':'off');const c=C[k]||(C[k]=[0,0]);c[0]++;c[1]+=by(e.m)/1048576;if(e.cz){cz++;zz+=e.cz.z.length}}for(const k in C)C[k][1]=+C[k][1].toFixed(1);const sz=MEMF.S.concat(MEMF.G||[]).map(e=>by(e.m)/1048576).sort((a,b)=>b-a);C.top=sz.slice(0,6).map(x=>+x.toFixed(1)).join(',');C.busy=[MEMF.zbusy,MEMF.ubusy]}
const f=x=>+(x/1048576).toFixed(1);return JSON.stringify({heapNoGC:f(performance.memory.usedJSHeapSize),hid:f(o.hid),vis:f(o.vis),inst:f(o.inst),meshes:o.n,czN:cz,C,gst:typeof MEMF!=='undefined'&&MEMF.gst,czMB:f(zz),zst:typeof MEMF!=='undefined'?{n:MEMF.zst.n,back:MEMF.zst.back,rz:MEMF.zst.rz}:0})})()`));
const gc=()=>cdp.send('HeapProfiler.collectGarbage');const pr=async t=>{await gc();const a=JSON.parse(await acct());await p.waitForTimeout(2500);await gc();const z=JSON.parse(await acct());console.log(t,'heap',a.heapNoGC,'busy',a.C.busy,'| settled',z.heapNoGC,'busy',z.C.busy,'vis',z.vis,'hid',z.hid,'Soff',z.C.Soff,'czN',z.czN)};
await pr('ready');
for(let r=1;r<=R;r++){await p.evaluate(s=>__oc.ev('K.ArrowUp=true;for(let i=0;i<'+s+'*30;i++){K.ArrowLeft=((i/90|0)%3===0);roamStep(1/30);if(i%300===299)try{__tq.draw()}catch(e){}}K.ArrowUp=K.ArrowLeft=false;'),sec);await pr('roam'+r)}
await b.close()})();
