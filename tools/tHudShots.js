// tHudShots: speed/boost HUD vs player car + controls at 4 sizes x 2 cities (own static server, foreground). node tools/tHudShots.js <outdir/page dir> <outprefix>
const {chromium}=require('/opt/node22/lib/node_modules/playwright'),http=require('http'),fs=require('fs'),path=require('path');
const [DIR,OUT]=process.argv.slice(2);fs.mkdirSync(OUT,{recursive:true});
const MT={'.html':'text/html','.js':'text/javascript','.json':'application/json'};
const srv=http.createServer((q,r)=>{let f=path.join(DIR,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':MT[path.extname(f)]||'application/octet-stream'});r.end(d)})});
const SZ=[[852,393,1],[393,852,1],[1366,1024,1],[1920,1080,0]];
srv.listen(0,async()=>{const BASE='http://localhost:'+srv.address().port+'/index.html';
 const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const city of (process.env.CITIES||'fra,ath').split(','))for(const [w,h,t] of SZ){const c=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:1,isMobile:!!t,hasTouch:!!t});const p=await c.newPage();p.setDefaultTimeout(400000);
  await p.goto(BASE+'?test='+city);await p.waitForFunction(()=>window.__chk&&window.__tq&&__tq.ready,null,{timeout:400000});await p.waitForTimeout(3000);
  const m=await p.evaluate(()=>window.__hudClear?JSON.stringify(window.__hudClear()):'nofn');console.log(city,w+'x'+h,m);
  await p.screenshot({path:OUT+'/'+city+'_'+w+'x'+h+'.png'});await c.close()}
 await b.close();srv.close()});
