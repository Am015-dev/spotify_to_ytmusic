// hot.js (hot-1, 2026-10-14): HOT RELOAD. One warm headless page per city stays booted; edit a src/ module, re-evaluate it in the live page, run a GO.
// No rebuild, no reboot: edit → check in a few seconds. docs/HOT.md.
//   node tools/hot.js reload src/71_roam_drive.js [more.js] [--all] [--city fra|ath]   re-evaluate module(s) in every warm page
//   node tools/hot.js go v90k/park-sit                                                    __tq.reset() + that checklist GO → PASS/FAIL line
//   node tools/hot.js eval 'RO.v' [--city ath]     node tools/hot.js reset|status|errors|stop     node tools/hot.js reboot [fra|ath]
//   node tools/hot.js shot out.jpg [--city ath]    (one rendered frame, slow in software GL)
//   node tools/hot.js gym drive|foot|cam|park      small-world page (src/test/gym.js, ~3 s); then --city gym for eval/reload/shot
// The first command starts the daemon (detached, log out/hot/hot.log); cities = HOT_CITIES (default fra,ath), port HOT_PORT (8890).
// The page is served as out/hot/hot.html, concatenated from src/ORDER (+ src/test/*.js) on EVERY request, so a reboot or a GO that jumps city
// always loads the current src. Only the hot page gets the hook window.__hot (a direct eval in the game's module scope); nothing ships.
// reload (default): every top-level `function f` / `let f=function|=>` of the module is re-assigned (state and data kept), then every later
// wrapper of those names (`f=(g=>…)(f)` anywhere in ORDER, own module included) is replayed so the live chain stays the same. `const f=()=>`
// can't be re-assigned: it is reported (reboot for those). --all also re-runs the module's other top-level statements (resets its let state).
const fs=require('fs'),path=require('path'),http=require('http'),{spawn,execSync}=require('child_process');
const ROOT=path.resolve(__dirname,'..'),SRC=ROOT+'/src',OUT=ROOT+'/out/hot',PORT=+process.env.HOT_PORT||8890;
const argv=process.argv.slice(2),cmd=argv[0]||'status';
const flag=(f,d)=>{const i=argv.indexOf(f);return i<0?d:(argv[i+1]&&!argv[i+1].startsWith('--')?argv[i+1]:true)};
const pos=argv.slice(1).filter((a,i,A)=>!a.startsWith('--')&&!(i>0&&A[i-1]==='--city'));

// ---------- source index (acorn, cached by mtime) ----------
let acorn;const IDX={};
const order=()=>fs.readFileSync(SRC+'/ORDER','utf8').split('\n').map(s=>s.trim()).filter(Boolean);
const SKIP=/^(50_kenney_data|52_terrain_data|10b_qt_data)\.js$/; // big data lines: no functions to reload
const srcOf=f=>fs.readFileSync(SRC+'/'+f,'utf8');
function modIndex(f,text){
 const s0=text==null?srcOf(f):text,c=IDX[f];if(c&&c.t===s0)return c;if(text!=null&&c&&c.old&&c.old.t===s0)return c.old;
 acorn=acorn||require('/opt/node-tools/node_modules/acorn');
 const s=s0.replace(/<\/script>[\s\S]*$/,''),a=acorn.parse(s,{ecmaVersion:'latest',sourceType:'module',allowReturnOutsideFunction:true});
 const decl={},asg=[],other=[];const T=n=>s.slice(n.start,n.end);const isF=n=>n&&/^(Function|ArrowFunction)Expression$/.test(n.type);
 const names=n=>{const o=[];const w=e=>{if(!e)return;if(e.type==='AssignmentExpression'){if(e.left.type==='Identifier')o.push(e.left.name);w(e.right)}else if(e.type==='SequenceExpression')e.expressions.forEach(w)};w(n.expression);return o};
 // walk statement lists (top level + if/try/block bodies), keeping the guard text and the earlier declarations of that list
 const walk=(list,guard,top)=>{const vars=[];for(const n of list){
  if(top&&n.type==='FunctionDeclaration'){decl[n.id.name]={kind:'fn',f,pos:n.start,src:T(n).replace(/^(async\s+)?function(\s*\*)?\s*[\w$]+/,(m,a,g)=>(a||'')+'function'+(g||''))};continue}
  if(n.type==='VariableDeclaration'){vars.push(n);if(top)for(const d of n.declarations)if(d.id.type==='Identifier'&&isF(d.init))decl[d.id.name]={kind:n.kind==='const'?'constfn':'letfn',f,pos:n.start,src:T(d.init)};if(top)other.push(n);continue}
  if(n.type==='ExpressionStatement'){const nm=names(n);if(nm.length){const body=T(n),pre=vars.filter(v=>v.declarations.some(d=>d.id.type==='Identifier'&&new RegExp('\\b'+d.id.name.replace(/\$/g,'\\$')+'\\b').test(body))).map(T).join('\n');
    asg.push({names:nm,f,pos:n.start,src:guard[0]+'{'+pre+'\n'+body+'\n}'+guard[1]});continue}}
  if(n.type==='BlockStatement'){walk(n.body,[guard[0]+'{',guard[1]+'}'],false);if(top)other.push(n);continue}
  if(n.type==='IfStatement'&&n.consequent.type==='BlockStatement'&&!n.alternate){walk(n.consequent.body,[guard[0]+'if('+T(n.test)+'){',guard[1]+'}'],false);if(top)other.push(n);continue}
  if(n.type==='TryStatement'&&!n.finalizer){walk(n.block.body,[guard[0]+'try{',guard[1]+'}catch(e){}'],false);if(top)other.push(n);continue}
  if(top)other.push(n)}};
 walk(a.body,['',''],true);
 // names re-assigned inside functions (runtime wrappers): a chain rebuild would drop those
 const inner=new Set();require('/opt/node-tools/node_modules/acorn-walk').ancestor(a,{AssignmentExpression(n,_,anc){if(n.left.type==='Identifier'&&anc.some(x=>/Function/.test(x.type)))inner.add(n.left.name)}});
 const r={t:s0,decl,asg,inner,other:other.map(n=>({pos:n.start,src:s.slice(n.start,n.end),type:n.type,n}))};
 if(text==null){r.old=c&&c.t!==s0?c:c&&c.old;IDX[f]=r}return r;
}
// eval code for reloading modules `fs` (fn mode or --all)
function reloadCode(files,all,snap,full){
 const O=order().filter(f=>f.endsWith('.js')&&!SKIP.test(f)),rank=f=>O.indexOf(f),info={fn:[],replay:0,constfn:[],noBase:[],other:0,inner:[],same:0};
 const I={};for(const f of O)I[f]=modIndex(f);
 const base=n=>{for(const f of O)if(I[f].decl[n])return I[f].decl[n];return null};
 // only names whose declaration or own-module wrapper text changed since this page loaded the module (all of them with --full/--all or no snapshot)
 const want=new Set(),sig=(m,n)=>(m.decl[n]?m.decl[n].src:'')+'\u0000'+m.asg.filter(a=>a.names.includes(n)).map(a=>a.src).join('\u0000');
 for(const f of files){const m=I[f],o=!full&&!all&&snap&&snap[f]!=null?modIndex(f,snap[f]):null;const ns=new Set([...Object.keys(m.decl),...m.asg.flatMap(a=>a.names)]);
  if(o)for(const n of Object.keys(o.decl))ns.add(n);for(const n of ns){if(o&&sig(m,n)===sig(o,n)){info.same++;continue}want.add(n)}}
 let code='';const chunks=[];const seen=new Set();const skipN=new Set();
 for(const n of want){const b=base(n);if(!b){info.noBase.push(n);skipN.add(n);continue}if(b.kind==='constfn'){if(files.includes(b.f))info.constfn.push(n);skipN.add(n);continue}
  code+=n+'=('+b.src+');\n';info.fn.push(n);if(O.some(f=>I[f].inner.has(n)))info.inner.push(n);
  for(const f of O)for(const a of I[f].asg)if(a.names.includes(n)&&(rank(f)>rank(b.f)||a.pos>b.pos)){const k=f+':'+a.pos;if(!seen.has(k)){seen.add(k);chunks.push([rank(f),a.pos,a.src,f+':'+a.names.join(',')])}}}
 if(all)for(const f of files){const m=I[f];for(const o of m.other){if(o.type!=='VariableDeclaration'){if(!/^(BlockStatement|IfStatement|TryStatement)$/.test(o.type)||!m.asg.some(a=>a.pos>=o.pos&&a.pos<o.n.end)){code+=o.src+'\n';info.other++}continue}
   if(o.n.kind==='const'){code+=o.src+'\n';info.other++;continue}
   for(const d of o.n.declarations)if(d.init&&d.id.type==='Identifier'&&!/^(Function|ArrowFunction)Expression$/.test(d.init.type)){code+=d.id.name+'=('+o.src.slice(d.init.start-o.pos,d.init.end-o.pos)+');\n';info.other++}}}
 chunks.sort((x,y)=>x[0]-y[0]||x[1]-y[1]);for(const c of chunks)code+=c[2]+'\n';info.replay=chunks.length;info.rp=chunks.map(c=>c[3]);
 return{code,info};
}
// the hot page: current src concatenated (like build.sh --local) + the eval hook before 99_api.js
let LAST={};
function hotPage(){let s=fs.readFileSync(SRC+'/assets/shell_head.html','utf8');const snap={};for(const f of order()){if(f.endsWith('.js'))snap[f]=srcOf(f);if(f==='99_api.js'){for(const t of fs.readdirSync(SRC+'/test').filter(x=>x.endsWith('.js')).sort())s+=fs.readFileSync(SRC+'/test/'+t,'utf8');s+='\nwindow.__hot=__hs=>eval(__hs);\n'}s+=fs.readFileSync(SRC+'/'+f,'utf8')}LAST=snap;return s+'</body></html>'}

// ---------- daemon ----------
async function daemon(){
 if(!fs.existsSync(OUT+'/models.js')){console.log('first start: tools/build.sh hot (assets)');execSync('tools/build.sh hot',{cwd:ROOT,stdio:'inherit'})}
 const MT={'.js':'text/javascript','.json':'application/json','.html':'text/html','.mp3':'audio/mpeg','.png':'image/png','.jpg':'image/jpeg'};
 const {chromium}=require('/opt/node22/lib/node_modules/playwright');
 const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-accelerated-2d-canvas']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 const P={};const BAD=/❌|can't|no .* nearby|loading a test drive|first|get back|works while/i;
 const boot=(c,q)=>{const o=P[c]||(P[c]={c,errs:[],nav:0});o.up=0;if(q!==undefined)o.q=q;o.ready=(async()=>{if(o.p)await o.p.close().catch(()=>{});const p=o.p=await ctx.newPage();p.setDefaultTimeout(120000);
   p.on('pageerror',e=>o.errs.push(String(e).slice(0,240)));p.on('console',m=>{if(m.type()==='error')o.errs.push('console: '+m.text().slice(0,240))});p.on('framenavigated',f=>{if(f===p.mainFrame()){o.nav++;o.snap={...LAST}}});
   const t=Date.now();await p.goto(`http://127.0.0.1:${PORT}/hot.html?test=${c==='gym'?'fra':c}&draw=0${o.q?'&'+o.q:''}`);await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:120000});
   o.boot=(Date.now()-t)/1000;o.nav=0;o.up=1;console.log(`BOOT ${c} ${o.boot.toFixed(1)} s`);return p})();o.ready.catch(e=>console.log('BOOT FAIL '+c+' '+e));return o.ready};
 const page=async c=>{if(!P[c])boot(c);const p=await P[c].ready;if(P[c].nav){await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:120000});P[c].nav=0}return p};
 const errsSince=(o,n)=>o.errs.slice(n);
 const H={
  async status(){return Object.values(P).map(o=>`${o.c}: ${o.up?'up':'booting'} boot ${o.boot?o.boot.toFixed(1)+' s':'…'} errors ${o.errs.length}`).join('\n')||'no pages'},
  async reload({files,all,full,city}){const t=Date.now();const fsn=files.map(f=>path.basename(f));const out=[];let info;
   for(const c of city?[city]:Object.keys(P)){const o=P[c];if(!o.up&&!city){o.ready.then(()=>H.reload({files,all,full,city:c})).then(r=>console.log(r));out.push(`${c}: still booting, reloads when up (see out/hot/hot.log)`);continue}
    const p=await page(c),e0=o.errs.length;const R=reloadCode(fsn,all,o.snap,full);info=R.info;
    if(!R.code.trim()){out.push(`OK ${c} ${fsn.join(' ')}: nothing changed since this page loaded it`);continue}
    const r=await p.evaluate(s=>{try{window.__hot(s);return'ok'}catch(e){return'ERR '+(e&&e.stack||e).toString().split('\n').slice(0,2).join(' | ')}},R.code).catch(e=>'EVAL '+e);
    if(r==='ok'&&o.snap)for(const f of fsn)o.snap[f]=srcOf(f);
    await p.waitForTimeout(200);const ne=errsSince(o,e0);out.push(`${r==='ok'&&!ne.length?'OK':'FAIL'} ${c} ${fsn.join(' ')}: ${info.fn.length} fn [${info.fn.slice(0,8).join(' ')}${info.fn.length>8?' …':''}], ${info.replay} wrappers replayed${all?', '+info.other+' statements re-run':''}${r!=='ok'?' · '+r:''}${ne.length?' · ERR '+ne[0]:''}`)}
   if(info&&info.constfn.length)out.push('NOT reloaded (const, reboot needed): '+info.constfn.join(' '));
   if(info&&info.inner.length)out.push('WARN also re-assigned inside a function (runtime wrapper, now dropped; reboot if it matters): '+info.inner.join(' '));
   out.push(`${((Date.now()-t)/1000).toFixed(1)} s`);return out.join('\n')},
  async go({id}){const t=Date.now();const p0=await page(P.fra?'fra':Object.keys(P)[0]);let c=await p0.evaluate(id=>window.__chk&&__chk.city(id),id);if(!c)return'FAIL no GO '+id;if(c==='bx')c='fra';
   const p=await page(c),o=P[c],e0=o.errs.length,n0=o.nav;await p.evaluate(()=>__tq.reset()).catch(()=>{});
   let said='';try{said=await p.evaluate(id=>window.__chk.go(id)||'',id);if(/…$/.test(said)){await p.waitForFunction(()=>!/…$/.test(window.__chk.said()||''),null,{timeout:20000,polling:100}).catch(()=>{});said=await p.evaluate(()=>window.__chk.said()||'')}}catch(e){said='EVAL '+String(e).slice(0,120)}
   const ne=errsSince(o,e0),nav=P[c].nav>n0;const ok=!!said&&!BAD.test(said)&&!ne.length&&!nav;
   return `${ok?'PASS':'FAIL'} ${c} ${id} ${((Date.now()-t)/1000).toFixed(1)}s · ${said||'(no message)'}${nav?' · NAVIGATED (page reloaded from current src)':''}${ne.length?' · ERR '+ne[0]:''}`},
  async eval({js,city}){const out=[];for(const c of city?[city]:Object.keys(P).slice(0,1)){const p=await page(c),o=P[c],e0=o.errs.length;
    const r=await p.evaluate(async s=>{try{const v=await window.__hot(s);return JSON.stringify(v,(k,x)=>typeof x==='number'?Math.round(x*1000)/1000:x)?.slice(0,2000)??String(v)}catch(e){return'ERR '+e}},js).catch(e=>'EVAL '+e);
    out.push(`${c}: ${r}${o.errs.length>e0?' · ERR '+o.errs[e0]:''}`)}return out.join('\n')},
  async reset({city}){const out=[];for(const c of city?[city]:Object.keys(P)){const p=await page(c);out.push(c+': '+JSON.stringify(await p.evaluate(()=>__tq.reset())))}return out.join('\n')},
  async errors({city}){return Object.values(P).filter(o=>!city||o.c===city).map(o=>`${o.c}: ${o.errs.length} errors${o.errs.length?'\n  '+o.errs.slice(-5).join('\n  '):''}`).join('\n')},
  async reboot({city}){const cs=city?[city]:Object.keys(P);await Promise.all(cs.map(c=>{if(P[c])P[c].errs=[];return boot(c)}));return cs.map(c=>`${c} booted ${P[c].boot.toFixed(1)} s`).join('\n')},
  async shot({file,city}){const c=city||'fra',p=await page(c);await p.evaluate(()=>__tq.draw()).catch(()=>{});await p.screenshot({path:path.resolve(file),type:/png$/.test(file)?'png':'jpeg',quality:/png$/.test(file)?undefined:75});return 'wrote '+file},
  async gym({kind}){const k=kind||'drive',t=Date.now();await boot('gym','gym='+k);const p=P.gym.p;await p.waitForFunction(()=>window.__gym&&__gym.ok,null,{timeout:8000,polling:50}).catch(()=>{});P.gym.boot=(Date.now()-t)/1000;const r=await p.evaluate(()=>window.__hot('JSON.stringify({x:RO.x,z:RO.z,foot:RO.foot,tReady:__tq.tReady})')).catch(e=>String(e));
   return `gym ${k} ready in ${P.gym.boot.toFixed(1)} s (page) · ${r} · errors ${P.gym.errs.length}${P.gym.errs.length?' · '+P.gym.errs[0]:''}\nuse --city gym with eval/reload/shot/reset`},
  async stop(){setTimeout(()=>{b.close().finally(()=>process.exit(0))},50);return'stopped'}};
 http.createServer(async(q,r)=>{
  if(q.method==='POST'&&q.url==='/cmd'){let d='';q.on('data',x=>d+=x);q.on('end',async()=>{let o;try{const j=JSON.parse(d);o=H[j.cmd]?await H[j.cmd](j):'unknown command '+j.cmd}catch(e){o='DAEMON ERR '+(e&&e.stack||e)}r.writeHead(200,{'content-type':'text/plain; charset=utf-8'});r.end(o)});return}
  const u=decodeURIComponent(q.url.split('?')[0]);
  if(u==='/hot.html'){try{const s=hotPage();r.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});r.end(s)}catch(e){r.writeHead(500);r.end(String(e))}return}
  const f=path.join(OUT,path.normalize(u).replace(/^(\.\.[\/\\])+/,''));fs.readFile(f,(e,s)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':(MT[path.extname(f)]||'application/octet-stream')+(/js|json|html/.test(path.extname(f))?'; charset=utf-8':'')});r.end(s)})
 }).listen(PORT,'127.0.0.1',()=>{console.log('hot daemon on '+PORT);setTimeout(()=>{try{reloadCode([],false)}catch(e){console.log('index: '+e)}},100);for(const c of(process.env.HOT_CITIES??'fra,ath').split(',').filter(c=>c==='fra'||c==='ath'))boot(c)});
}

// ---------- client ----------
const send=j=>new Promise((res,rej)=>{const q=http.request({host:'127.0.0.1',port:PORT,path:'/cmd',method:'POST'},r=>{const d=[];r.on('data',x=>d.push(x));r.on('end',()=>res(Buffer.concat(d).toString('utf8')))});q.on('error',rej);q.end(JSON.stringify(j))});
async function client(){
 const city=flag('--city');const j={cmd,city:typeof city==='string'?city:undefined};
 if(cmd==='reload'){j.files=pos;j.all=!!flag('--all');j.full=!!flag('--full');if(!pos.length)return console.log('usage: hot.js reload src/<mod>.js')}
 else if(cmd==='go')j.id=pos[0];else if(cmd==='eval')j.js=pos.join(' ');else if(cmd==='shot')j.file=pos[0]||'hot.jpg';else if(cmd==='reboot'&&pos[0])j.city=pos[0];else if(cmd==='gym')j.kind=pos[0];
 try{console.log(await send(j))}catch(e){
  if(cmd==='stop')return console.log('not running');
  fs.mkdirSync(OUT,{recursive:true});const log=fs.openSync(OUT+'/hot.log','a');spawn(process.execPath,[__filename,'daemon'],{detached:true,stdio:['ignore',log,log],cwd:ROOT}).unref();
  console.log('started hot daemon (log out/hot/hot.log); first boot ~20-50 s');for(let i=0;i<120;i++){await new Promise(r=>setTimeout(r,500));try{console.log(await send(j));return}catch(e2){}}console.log('daemon did not start, see out/hot/hot.log')}}
if(cmd==='daemon')daemon();else if(cmd==='code'){const r=reloadCode(pos.map(f=>path.basename(f)),!!flag('--all'));console.log(r.code.slice(0,+process.env.N||3000));console.error(JSON.stringify(r.info))}else client();
