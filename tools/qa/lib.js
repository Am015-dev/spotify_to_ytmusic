// qa-1 helpers: boot one page (headless, software GL, draw=0) at a game URL and talk to window.__qa. Used by tInv/tHooks/tRepro/monkey.
// usage in a script: const L=require('./lib'); const {b,p}=await L.open({base,city:'fra'}); await L.ev(p,'…'); await b.close()
const path=require('path'),fs=require('fs'),http=require('http');
const PW='/opt/node22/lib/node_modules/playwright';
const ROOT=path.resolve(__dirname,'../..');
// base: a URL (http://127.0.0.1:8890/hot.html = the warm hot server) or an out/<ver> directory (served here on a free port)
// older builds (no 98qa_loader stub): splice the kit into the served page right before the module script's end, so the kit can run on any out/<ver>
function inject(html){if(html.includes('models/qa.js'))return html;const code=fs.readFileSync(path.join(ROOT,'src/assets/qa/code.js'),'utf8'),i=html.lastIndexOf('</script>');
  return html.slice(0,i)+'\n;try{eval('+JSON.stringify(code)+')}catch(e){console.warn("QA inject",e)}\n'+html.slice(i)}
async function serve(dir){const MT={'.js':'text/javascript','.json':'application/json','.html':'text/html','.mp3':'audio/mpeg','.png':'image/png','.jpg':'image/jpeg'};
  const s=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]),f=path.join(dir,path.normalize(u==='/'?'/index.html':u));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':MT[path.extname(f)]||'application/octet-stream'});r.end(/index\.html$/.test(f)?inject(d.toString('utf8')):d)})});
  await new Promise(res=>s.listen(0,'127.0.0.1',res));return{s,url:`http://127.0.0.1:${s.address().port}/index.html`}}
async function hotUp(){return new Promise(res=>{const q=http.get('http://127.0.0.1:8890/hot.html',r=>{r.destroy();res(r.statusCode===200)});q.on('error',()=>res(false));q.setTimeout(1500,()=>{q.destroy();res(false)})})}
async function resolveBase(base){if(base&&/^https?:/.test(base))return{url:base};if(base&&fs.existsSync(base))return serve(path.resolve(base));if(await hotUp())return{url:'http://127.0.0.1:8890/hot.html'};throw new Error('no base: pass a URL or an out/<ver> dir')}
async function launch(){const {chromium}=require(PW);return chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-accelerated-2d-canvas']})}
async function open(o){const B=await resolveBase(o.base),b=o.browser||await launch();
  const ctx=await b.newContext({viewport:{width:o.w||852,height:o.h||393},deviceScaleFactor:1,isMobile:true,hasTouch:true,permissions:['clipboard-read','clipboard-write']});
  const p=await ctx.newPage();p.setDefaultTimeout(150000);const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,240)));
  const q=new URLSearchParams({test:o.city||'fra',draw:'0'});if(o.car)q.set('car',o.car);if(o.at)q.set('at',o.at);if(o.extra)for(const k in o.extra)q.set(k,o.extra[k]);
  const url=o.repro?B.url+'?draw=0&repro='+o.repro:B.url+'?'+q;await p.goto(url);await p.waitForFunction(()=>window.__tq&&__tq.ready&&window.__qa,null,{polling:250,timeout:170000});
  return{b,p,ctx,errs,url,srv:B.s,close:async()=>{await b.close().catch(()=>{});if(B.s)B.s.close()}}}
// evaluate JS in the game's module scope (needs the hot hook; the built page has window.__qa.ev for the same purpose, see code.js) → value
async function ev(p,js){return p.evaluate(async s=>{try{return await window.__qa.ev(s)}catch(e){return'ERR '+e}},js)}
module.exports={open,ev,launch,resolveBase,ROOT};
