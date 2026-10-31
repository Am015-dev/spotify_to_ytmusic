// ---- XC: lazy code chunks (split-1, 2026-10-14). Modules listed in src/LAZY are NOT in the page: tools/build.sh packs each one to xc/<name>.js
// (window.__XC[name] = the module's source as a string, tools/lazy/pack.js) and the page evals it in THIS module scope once the game is drivable
// (state left 'loading', loader idle, +1.5 s; in ?test= mode when the car is drivable, 98tq_test_quick.js). Same pattern as models/as.js. A chunk that fails to load only loses its feature.
// XCV = chunk name -> content hash, filled by tools/build.sh (empty in a raw src/ page: then nothing is lazy). A chunk may export top-level names
// (module list "name:a,b" in src/LAZY): the page declares `let a,b;` stubs, the chunk's last expression is ({a,b}) and XC.apply[name] copies them over.
// Eager code must not touch a chunk's names at boot; use XC.done / XC_need(name) first. Tests: __tq.ready also waits for XC.done.
const XCV=/*XCV*/{}/*end*/,XC={q:{},apply:{},post:{},done:!Object.keys(XCV).length,t0:0,t1:0,err:[]};
function XC_eval(c){return eval(c)}   // direct eval: sees every module-level binding, like the code in models/as.js
// fair-1: no `let` stubs / XC.apply are generated, so a chunk's exports (src/LAZY "f.js:a,b") go on window, where other chunks (checklist -> tkBot) see them by name
function XC_need(name){
 if(!(name in XCV))return Promise.resolve();   // raw src/ page / hot reload: the module is inline in ORDER
 return XC.q[name]||(XC.q[name]=new Promise(res=>{FST_js('xc/'+name+'.js?'+(XCV[name]||0)).then(ok=>{if(!ok){XC.err.push(name+': 404');return res()}try{const c=window.__XC&&window.__XC[name];if(c){delete window.__XC[name];if(typeof BMK==='function')BMK('xc '+name);const o=XC_eval(c);if(XC.post[name])XC.post[name]();if(XC.apply[name]&&o)XC.apply[name](o);else if(o&&typeof o==='object')for(const k in o)if(typeof o[k]==='function'&&!(k in window))window[k]=o[k]}}catch(e){XC.err.push(name+': '+e);console.warn('XC '+name,e)}res()})}))}
// perf-r16c (REVIEW_2K_16 N3): on a player page (no ?test) only the chunks a player needs load after drivable: the city data and 99c_checklist (the 📋 strip).
// The GO/test chunks (99c<digit>_*, 98tk_go, 98dest_go: 10-90 KB each, GO code only) load on demand: XC_go(true) from the checklist panel / 📍 GO. ?test pages and ?xcall=1 load all.
const XC_TEST=n=>/^99c\d|^98tk_go$|^98dest_go$/.test(n),XC_ALL0=!!TQ||/[?&]xcall=1/.test(location.search);
function XC_go(all){all=all===true||XC_ALL0;if(all)return XC.pA||(XC.pA=(XC.p||Promise.resolve()).then(()=>XC_run(true)));return XC.p||(XC.p=XC_run(false))}
function XC_run(all){XC.t0=XC.t0||performance.now();return(async()=>{/* perf-r14e (bhs only, perf-r14f): desktop chunk evals (1-4 s tasks) wait for the roam-start gate (LKG, 98bp) to end */for(let k=0;k<600&&typeof BHS_EN!=='undefined'&&BHS_EN&&typeof LKG!=='undefined'&&LKG.arm;k++)await new Promise(r=>setTimeout(r,100));for(const n of Object.keys(XCV))if(all||!XC_TEST(n))await XC_need(n);XC.done=true;if(all)XC.all=true;XC.t1=performance.now()})()}
if(!XC.done&&!TQ){const iv=setInterval(()=>{try{if(state==='loading'||LD.on||LD.busy)return}catch(e){return}clearInterval(iv);setTimeout(XC_go,1500)},300)}
// perf-r16c: 99c_checklist is at its 200 KB cap, so its panel hook lives here: opening the 📋 panel on a player page loads the GO chunks, then re-renders (their items + 📍 GO buttons)
XC.post['99c_checklist']=()=>{const o=window.odChkOpen;if(typeof o!=='function'||XC_ALL0)return;window.odChkOpen=function(){const r=o.apply(this,arguments);if(!XC.all)XC_go(true).then(()=>{const v=document.querySelector('.ckOn');if(v)o()});return r}};
XC.post['98b2_builder2']=()=>{try{if(!document.querySelector('.bxTrk'))window.BX_raceMenu()}catch(e){}};   // lazy-split: the race menu may have been built before the builder chunk loaded
window.__xc={XC,need:XC_need,go:XC_go,ev:XC_eval};   // ev = test hook: eval in module scope
// per-city boot data (52_terrain_data.js awaits these): start the downloads NOW, ~40 modules before the await, so they run parallel to the rest of the page's start-up
for(const n of CID==='ath'?['10c_qtc_blob','52a_terr_ath']:['52f_terr_fra'])XC_need(n);
if(OG3)XC_need('40h_hud_kit');   // og3: the HUD kit loads with the city data (it is a chunk, not page weight)
