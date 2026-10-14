// ---- XC: lazy code chunks (split-1, 2026-10-14). Modules listed in src/LAZY are NOT in the page: tools/build.sh packs each one to xc/<name>.js
// (window.__XC[name] = the module's source as a string, tools/lazy/pack.js) and the page evals it in THIS module scope once the game is drivable
// (state left 'loading', loader idle, +1.5 s; in ?test= mode when the car is drivable, 98tq_test_quick.js). Same pattern as models/as.js. A chunk that fails to load only loses its feature.
// XCV = chunk name -> content hash, filled by tools/build.sh (empty in a raw src/ page: then nothing is lazy). A chunk may export top-level names
// (module list "name:a,b" in src/LAZY): the page declares `let a,b;` stubs, the chunk's last expression is ({a,b}) and XC.apply[name] copies them over.
// Eager code must not touch a chunk's names at boot; use XC.done / XC_need(name) first. Tests: __tq.ready also waits for XC.done.
const XCV=/*XCV*/{}/*end*/,XC={q:{},apply:{},done:!Object.keys(XCV).length,t0:0,t1:0,err:[]};
function XC_eval(c){return eval(c)}   // direct eval: sees every module-level binding, like the code in models/as.js
function XC_need(name){
 return XC.q[name]||(XC.q[name]=new Promise(res=>{const s=document.createElement('script');s.src='xc/'+name+'.js?'+(XCV[name]||0);
  s.onload=()=>{try{const c=window.__XC&&window.__XC[name];if(c){delete window.__XC[name];const o=XC_eval(c);if(XC.apply[name]&&o)XC.apply[name](o)}}catch(e){XC.err.push(name+': '+e);console.warn('XC '+name,e)}res()};
  s.onerror=()=>{XC.err.push(name+': 404');res()};document.head.appendChild(s)}))}
function XC_go(){if(XC.p)return XC.p;XC.t0=performance.now();return XC.p=(async()=>{for(const n of Object.keys(XCV))await XC_need(n);XC.done=true;XC.t1=performance.now()})()}
if(!XC.done&&!TQ){const iv=setInterval(()=>{try{if(state==='loading'||LD.on||LD.busy)return}catch(e){return}clearInterval(iv);setTimeout(XC_go,1500)},300)}
window.__xc={XC,need:XC_need,go:XC_go};
