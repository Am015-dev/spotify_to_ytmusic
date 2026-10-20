// r17v probe: tR17v.js <outdir> <ver> : drivable start view per city/orientation. env: CITY=fra|ath W=852 H=393 QS=extra query SHOT=path.jpg NF=frames ticked before the sample (90) EVAL=js run before sampling
// Prints R17V city WxH open% ahead cars (cars 40-120 m ahead in the camera frustum) and saves one jpg.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const http=require('http'),fs=require('fs'),path=require('path');
const OUT=path.resolve(process.argv[2]),V=process.argv[3],CITY=process.env.CITY||'fra',W=+(process.env.W||852),H=+(process.env.H||393),NF=+(process.env.NF||90);
const mime={'.html':'text/html','.js':'application/javascript','.json':'application/json','.mp3':'audio/mpeg'};
const INIT=`(()=>{const q=[];let t=0;window.requestAnimationFrame=cb=>{q.push(cb);return q.length};window.cancelAnimationFrame=()=>{};window.__dbg=1;
 window.__tick=n=>{for(let i=0;i<n;i++){t+=1000/60;const c=q.splice(0);for(const f of c){try{f(t)}catch(e){console.log('TICKERR '+e.message)}}}return t};window.__auto=true;setInterval(()=>{if(window.__auto)window.__tick(1)},16);})();`;
const srv=http.createServer((q,r)=>{const f=path.join(OUT,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':mime[path.extname(f)]||'application/octet-stream'});r.end(d)})}).listen(0,async()=>{
 const port=srv.address().port;const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await ctx.newPage();p.setDefaultTimeout(240000);await p.addInitScript(INIT);
 p.on('pageerror',e=>console.log('ERR',e.message.slice(0,150)));
if(process.env.CAND)await p.addInitScript('window.__CAND='+process.env.CAND);
  await p.goto(`http://127.0.0.1:${port}/${V}/index.html?test=${CITY}${process.env.QS?'&'+process.env.QS:''}`);
 await p.waitForFunction(()=>window.__tq&&__tq.ready&&window.__oc,null,{polling:500});
 const r=await p.evaluate(async([NF,EV])=>{window.__auto=false;let n=0;const A=()=>{try{return __oc.ev('typeof LKG!=="undefined"&&LKG.arm')}catch(e){return 0}};while(A()&&n<2000){__tick(1);n++;await new Promise(r=>setTimeout(r,0))}
  for(let i=0;i<NF;i++){__tick(1);await new Promise(r=>setTimeout(r,0))}
  if(window.__CAND){const out=[];const x0=__oc.ev('RO.x'),z0=__oc.ev('RO.z'),h0=__oc.ev('RO.h'),y0=__oc.ev('RO.y');for(const [d,dh,lat] of window.__CAND){const h=h0+dh,x=x0+Math.sin(h0)*d+Math.cos(h0)*lat,z=z0+Math.cos(h0)*d-Math.sin(h0)*lat;__oc.ev(`(()=>{RO.x=${x};RO.z=${z};RO.h=RO.vh=${h};RO.y=groundAt(${x},${z},${y0});const sn=camSnap;camSnap=true;roamCam(1/60);camSnap=sn})()`);for(let i=0;i<12;i++){__tick(1);await new Promise(r=>setTimeout(r,0))}__tick(1);__tq.draw();const o=__oc.ev('R17.fn.open()');out.push([d,dh,lat,Math.round(o.open*100),__oc.ev('R17.fn.ahead()')])}return{cand:out}}
  if(EV)__oc.ev(EV);__tick(2);__tq.draw();const o=__oc.ev('R17.fn.open()');
  // cars in the camera frustum 40-120 m ahead (not just on the road axis)
  const v=__oc.ev('R17.fn.vis()');
  return{open:Math.round(o.open*100),vis:v,ahead:__oc.ev('R17.fn.ahead()'),st:__oc.ev('R17.st'),pose:__oc.ev('[R17.pose0,R17.pose1,RO.x|0,RO.z|0,+RO.h.toFixed(2)]')}},[NF,process.env.EVAL||'']);
 console.log('R17V',CITY,W+'x'+H,JSON.stringify(r));
 if(process.env.SHOT){await p.evaluate(()=>{__tick(1);__tq.draw()});await p.screenshot({path:process.env.SHOT,type:'jpeg',quality:75})}
 await b.close();srv.close()});
