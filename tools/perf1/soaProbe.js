// soaProbe.js <built page url with ?lowmem=1> <fra|ath>: counts HUB.bld / HUB.props fields by type and measures their shallow heap (GC, clone, GC). ios-r18d.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--enable-precise-memory-info']});
const ctx=await b.newContext({viewport:{width:852,height:393},hasTouch:true,isMobile:true});const p=await ctx.newPage();
await p.goto(process.argv[2]+'&test='+process.argv[3]+'&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:120000});
const cdp=await ctx.newCDPSession(p);const H=async()=>{await cdp.send('HeapProfiler.collectGarbage');return (await cdp.send('Runtime.getHeapUsage')).usedSize/1e6};
const info=await p.evaluate(()=>__xc.ev("("+(()=>{const ks=a=>{const m={};for(const o of a.slice(0,200000))for(const k in o){const v=o[k],t=v==null?'n':typeof v==='object'?(Array.isArray(v)?'arr':(v.isObject3D||v.isMesh?'o3d':'obj')):typeof v;m[k+':'+t]=(m[k+':'+t]||0)+1}return m};return {nb:HUB.bld.length,np:HUB.props.length,bk:ks(HUB.bld),pk:ks(HUB.props)}}).toString()+")()"));
console.log(JSON.stringify(info));
const h0=await H();await p.evaluate(()=>__xc.ev("window.__cb=HUB.bld.map(b=>Object.assign({},b));0"));const h1=await H();await p.evaluate(()=>__xc.ev("window.__cp=HUB.props.map(b=>Object.assign({},b));0"));const h2=await H();
console.log('heap',h0.toFixed(0),'bldShallow',(h1-h0).toFixed(1),'propsShallow',(h2-h1).toFixed(1));await b.close()})();
