// reloadprobe.js <city> [builddir] [quests]: phone profile (iPhone UA, 852x393 touch, dpr 2, 6x CPU) on the BUILT page. Starts quests by the card START button
// and counts main-frame navigations, pagehide/unload, WebGL context losses and page errors. Exit code = 1 when the page reloaded or lost its context (reload-r30l).
const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path');
const [CITY='ath',BUILD='out/r30l',NQ='3']=process.argv.slice(2),THR=+(process.env.THR||6);
const serve=dir=>new Promise(res=>{const T={'.html':'text/html','.js':'text/javascript','.json':'application/json','.mp3':'audio/mpeg'};const s=http.createServer((q,r)=>{let f=path.join(dir,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,b)=>{if(e){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});r.end(b)})}).listen(0,'127.0.0.1',()=>res([s,s.address().port]))});
(async()=>{const[srv,port]=await serve(path.resolve(BUILD));const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:2,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'});
 await ctx.addInitScript(()=>{window.addEventListener('pagehide',()=>{try{const a=JSON.parse(sessionStorage.getItem('rp_log')||'[]');a.push('pagehide '+(window.T||0).toFixed?.(1)+' '+new Error().stack.split('\n').slice(1,4).join('|'));sessionStorage.setItem('rp_log',JSON.stringify(a))}catch(e){}});
  const rl=location.reload.bind(location);try{Location.prototype.reload=function(){try{const a=JSON.parse(sessionStorage.getItem('rp_log')||'[]');a.push('reload() '+new Error().stack.split('\n').slice(1,5).join('|'));sessionStorage.setItem('rp_log',JSON.stringify(a))}catch(e){}return rl()}}catch(e){}
  addEventListener('webglcontextlost',e=>{try{const a=JSON.parse(sessionStorage.getItem('rp_log')||'[]');a.push('contextlost');sessionStorage.setItem('rp_log',JSON.stringify(a))}catch(_){}},true)});
 const p=await ctx.newPage(),errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));p.setDefaultTimeout(900000);let nav=0;p.on('framenavigated',fr=>{if(fr===p.mainFrame()){nav++;console.log('NAV '+nav+' '+fr.url().slice(-50))}});
 const E=(fn,a)=>p.evaluate(([src,a])=>{window.__dbg=1;return window.__oc.ev('('+src+')('+JSON.stringify(a)+')')},[fn.toString(),a===undefined?null:a]);
 await p.goto(`http://127.0.0.1:${port}/index.html?test=${CITY}`);await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:500,timeout:240000});
 const nav0=nav;await p.waitForFunction(()=>{window.__dbg=1;return window.__oc.ev("(RO.marks||[]).some(q=>q.kind==='quest')")},null,{polling:500,timeout:240000});
 const ids=(await E(()=>(RO.marks||[]).filter(q=>q.ev&&q.kind==='quest'&&qvUse(q)&&!markLocked(q)).map(q=>q.ev.id))).slice(0,+NQ);console.log('quests '+ids.join(','));
 const cdp=await ctx.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:THR});
 for(const id of ids){const n0=nav;
  await E(id=>{const m=RO.marks.find(q=>q.ev&&q.ev.id===id);try{chAbort()}catch(e){}RO.card=null;RO.x=m.x;RO.z=m.z+3;RO.y=groundY(RO.x,RO.z);RO.v=0;RO.cool=0;roamOpen(m);const go=document.getElementById('rcGo');if(go&&!go.disabled)go.click();return 1},id).catch(e=>console.log('eval '+String(e).slice(0,120)));
  await p.waitForFunction(()=>window.T!==undefined&&(window.__t0=window.__t0||T,T-window.__t0>=0),null,{timeout:60000}).catch(()=>{});await p.waitForTimeout(20000).catch(()=>{});
  console.log('quest '+id+' navs='+(nav-n0))}
 const log=await p.evaluate(()=>sessionStorage.getItem('rp_log')).catch(()=>null);const bad=nav-nav0;
 console.log((bad?'FAIL':'PASS')+' reloadprobe '+CITY+' thr='+THR+' reloads='+bad+' errors='+errs.length+' log='+log);await b.close();srv.close();process.exit(bad?1:0)})();
