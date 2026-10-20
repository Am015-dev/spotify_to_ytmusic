// perf-r17i: tBhs.js <outdir> <ver> : boot only; prints the longest buildHubG gaps (window.__bhSt). env: CITY=fra|ath QS=bhs=1
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const http=require('http'),fs=require('fs'),path=require('path');
const OUT=path.resolve(process.argv[2]),V=process.argv[3],CITY=process.env.CITY||'fra';
const mime={'.html':'text/html','.js':'application/javascript','.json':'application/json','.mp3':'audio/mpeg'};
const srv=http.createServer((q,r)=>{const f=path.join(OUT,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':mime[path.extname(f)]||'application/octet-stream'});r.end(d)})}).listen(0,'127.0.0.1',async()=>{
 const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await(await b.newContext({viewport:{width:1280,height:720}})).newPage();p.setDefaultTimeout(600000);
 p.on('console',m=>{const t=m.text();if(/^(RFT|BHX)/.test(t))console.log(t)});await p.addInitScript('window.__dbg=1');
 await p.goto(`http://127.0.0.1:${srv.address().port}/${V}/index.html?test=${CITY}&q=high${process.env.QS?'&'+process.env.QS:''}`);
 await p.waitForFunction(()=>window.__tq&&__tq.ready&&window.__oc,null,{polling:500});
 console.log('BHS '+CITY+' '+JSON.stringify(await p.evaluate(()=>{const S=window.__bhSt;return S?{max:Math.round(S.max),lab:S.lab,top:S.L.slice().sort((a,b)=>b[0]-a[0]).slice(0,+(window.__top||10)).map(x=>[Math.round(x[0]),...x.slice(1)])}:null})));
 await b.close();srv.close()});
