// perf-r18x: tBootHash.js <outdir> <ver> : boot only; prints longest buildHubG gaps + total step time + an FNV hash of the boot output (HUB.bld rows, grid, props, mesh positions). env: CITY=fra|ath, QS=bhc=0 (cursors off must give the same hash)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const http=require('http'),fs=require('fs'),path=require('path');
const OUT=path.resolve(process.argv[2]),V=process.argv[3],CITY=process.env.CITY||'fra';
const mime={'.html':'text/html','.js':'application/javascript','.json':'application/json','.mp3':'audio/mpeg'};
const srv=http.createServer((q,r)=>{const f=path.join(OUT,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':mime[path.extname(f)]||'application/octet-stream'});r.end(d)})}).listen(0,'127.0.0.1',async()=>{
 const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await(await b.newContext({viewport:{width:1280,height:720}})).newPage();p.setDefaultTimeout(600000);
 await p.addInitScript('window.__dbg=1');
 await p.goto(`http://127.0.0.1:${srv.address().port}/${V}/index.html?test=${CITY}&q=high${process.env.QS?'&'+process.env.QS:''}`);
 await p.waitForFunction(()=>window.__tq&&__tq.ready&&window.__oc,null,{polling:500});
 console.log('BOOT '+CITY+' '+JSON.stringify(await p.evaluate(()=>{const S=window.__bhSt;return S?{max:Math.round(S.max),lab:S.lab,end:Math.round(S.L[S.L.length-1][2]),top:S.L.slice().sort((a,b)=>b[0]-a[0]).slice(0,6).map(x=>[Math.round(x[0]),x[1]])}:null})));
 console.log('HASH '+CITY+' '+JSON.stringify(await p.evaluate(b=>window.__oc.ev(b),'('+(()=>{let h=2166136261>>>0;const f=s=>{for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0}};const R=v=>typeof v==='number'?v.toFixed(4):'';const o={};
  let n=0;for(const q of HUB.props){f(q.t+'|'+['x','y','z','ry','rt','sc'].map(k=>R(q[k])).join(',')+';');n++}o.props=[n,h.toString(16)];h=2166136261>>>0;
  n=0;for(const q of HUB.bld){f(['x','z','hw','hd','h','y0','c','s','trMin','trMax','trY','trOff','trBase','trDoor','trBot'].map(k=>R(q[k])).join(',')+';');n++}o.bld=[n,h.toString(16)];h=2166136261>>>0;
  n=0;if(HUB.grid){const K=[...HUB.grid.keys()].sort((a,b)=>a-b);for(const k of K){f(k+':'+HUB.grid.get(k).length+';');n++}}o.grid=[n,h.toString(16)];h=2166136261>>>0;
  n=0;HUB.grp.traverse(m=>{const A=m.geometry&&m.geometry.attributes&&m.geometry.attributes.position;if(A&&A.array&&A.count>300&&!m.isInstancedMesh){let s=0;const a=A.array;for(let i=0;i<a.length;i+=7)s+=a[i];f(m.type+a.length+':'+s.toFixed(2)+';');n++}if(m.isInstancedMesh&&m.count>300&&m.instanceMatrix.array){f("I"+m.count+";")}});o.mesh=[n,h.toString(16)];h=2166136261>>>0;
  for(const k of ['solid','sol','CE_L'])if(HUB[k]&&HUB[k].length!=null){f(k+HUB[k].length)}o.misc=h.toString(16);return o})+')()')));
 await b.close();srv.close()});
