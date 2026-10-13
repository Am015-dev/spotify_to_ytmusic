// chk-1: every checklist item has a 📍 GO; tap GO on all items (one session), shots of 3 results. node tools/tChkGo.js <url> <outdir>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const {boot}=require('./d24lib.js');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const {p,shot}=await boot(b,{city:'fra',url:process.argv[2],phone:true});
 const errs=[];p.on('pageerror',e=>errs.push(String(e)));const o=process.argv[3];
 const n=await p.evaluate(()=>{const C=window.__chk;return {all:C.items.length,go:C.items.filter(it=>C.GO[it.ver+'/'+it.id]).length}});
 await p.evaluate(()=>odChkOpen());await p.waitForTimeout(800);await p.screenshot({path:o+'/c1_list.png'});await p.evaluate(()=>{document.querySelector('.ci')&&0});
 await p.keyboard.press('Escape').catch(()=>{});await p.evaluate(()=>{const o=document.querySelector('#odChk,.ckOv');if(o)o.hidden=true;document.body.classList.remove('ckOn')});
 const ids=['v90j/fra-props','v90j/fwd5','v90j/facing'];const said=[];
 for(let i=0;i<ids.length;i++){said.push(await p.evaluate(id=>window.__chk.go(id),ids[i]));await p.waitForTimeout(2500);await p.screenshot({path:o+`/c${i+2}_go.png`});if(ids[i].endsWith('facing'))await p.evaluate(()=>{try{gbClose(false)}catch(e){}})}
 const bad=await p.evaluate(()=>window.__chk.items.map(it=>it.ver+'/'+it.id).filter(id=>{try{return !window.__chk.go(id)}catch(e){return true}}));
 console.log(JSON.stringify({...n,said,noMsg:bad.length,errs:errs.slice(0,3)}));await b.close()})();
