// perf-r18p: tPropHash.js <outdir> <ver> : boot only; prints n + FNV hash of HUB.props (type, x,y,z,ry,rt,sc in order). env CITY, QS (e.g. bhp=0 vs default must match)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const http=require('http'),fs=require('fs'),path=require('path');
const OUT=path.resolve(process.argv[2]),V=process.argv[3],CITY=process.env.CITY||'fra';
const mime={'.html':'text/html','.js':'application/javascript','.json':'application/json','.mp3':'audio/mpeg'};
const srv=http.createServer((q,r)=>{const f=path.join(OUT,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':mime[path.extname(f)]||'application/octet-stream'});r.end(d)})}).listen(0,'127.0.0.1',async()=>{
 const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await(await b.newContext({viewport:{width:1280,height:720}})).newPage();p.setDefaultTimeout(600000);
 p.on('console',m=>{const t=m.text();if(/^(RFT|BHX)/.test(t))console.log(t)});await p.addInitScript('window.__dbg=1');
 await p.goto(`http://127.0.0.1:${srv.address().port}/${V}/index.html?test=${CITY}&q=high${process.env.QS?'&'+process.env.QS:''}`);
 await p.waitForFunction(()=>window.__tq&&__tq.ready&&window.__oc,null,{polling:500});
 console.log('PROPHASH '+CITY+' '+JSON.stringify(await p.evaluate(b=>window.__oc.ev(b),'('+(()=>{let h=2166136261>>>0,n=0;for(const q of HUB.props){const s=q.t+'|'+['x','y','z','ry','rt','sc'].map(k=>typeof q[k]==='number'?q[k].toFixed(4):'').join(',')+';';for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0}n++}return{n,h:h.toString(16)}})+')()')));
 await b.close();srv.close()});
