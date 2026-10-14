globalThis.require=require;
// rv daemon: warm pages per city of a given base URL; POST /eval?city=fra body=js → JSON; /shot?city=&path=&w=&h=
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const http=require('http');
const BASE=process.argv[2],PORT=+process.argv[3]||8897;const P={};let B;
async function boot(c){const ctx=await B.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true,deviceScaleFactor:1});const p=await ctx.newPage();p.setDefaultTimeout(600000);
 const E=[];p.on('pageerror',e=>E.push(String(e).slice(0,200)));p.on('console',m=>{if(m.type()==='error')E.push('console: '+m.text().slice(0,200))});
 await p.goto(BASE+'?test='+c+'&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:300000});P[c]={p,E};return p}
http.createServer(async(q,r)=>{const u=new URL(q.url,'http://x');const c=u.searchParams.get('city')||'fra';let body='';q.on('data',d=>body+=d);await new Promise(x=>q.on('end',x));
 try{if(!P[c])await boot(c);const {p,E}=P[c];let out;
  if(u.pathname==='/eval')out=await p.evaluate(async s=>{try{const v=await window.__hot(s);return JSON.stringify(v,(k,x)=>typeof x==='number'?Math.round(x*100)/100:x)}catch(e){return'ERR '+(e.stack||e).toString().slice(0,400)}},body);
  else if(u.pathname==='/shot'){const w=+u.searchParams.get('w')||852,h=+u.searchParams.get('h')||393;await p.setViewportSize({width:w,height:h});await p.evaluate(()=>{__tq.o.draw=1});await p.waitForTimeout(+u.searchParams.get('ms')||1200);await p.screenshot({path:u.searchParams.get('path'),type:'jpeg',quality:70});await p.evaluate(()=>{__tq.o.draw=0});out='ok'}
  else if(u.pathname==='/run'){out=await (new Function('p','E','return (async()=>{'+body+'})()'))(p,E);out=JSON.stringify(out)}
  else if(u.pathname==='/errors'){out=JSON.stringify(E.splice(0))}
  r.end(String(out))}catch(e){r.end('DERR '+String(e).slice(0,300))}}).listen(PORT,async()=>{B=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});console.log('up')});
