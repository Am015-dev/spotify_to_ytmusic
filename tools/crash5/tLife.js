// crash-5: LIFE memory in Athens (iPhone emulation): geometry bytes per LIFE pool + landmark, map sizes. node tools/crash5/tLife.js <page url> [ath|fra]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [BASE,C0]=process.argv.slice(2);const C=C0||'ath';
const UA='Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
(async()=>{const b=await chromium.launch({args:['--js-flags=--expose-gc','--enable-precise-memory-info','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:3,isMobile:true,hasTouch:true,userAgent:UA});const p=await ctx.newPage();p.setDefaultTimeout(600000);
 await p.goto(BASE+(BASE.includes('?')?'&':'?')+'test='+C+'&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:400000});const ev=s=>p.evaluate(s=>__xc.ev(s),s);
 for(let i=0;i<8;i++){await ev(`{K.ArrowUp=true;for(let k=0;k<30;k++)roamStep(1/30);K.ArrowUp=false}`);await p.waitForTimeout(1000)}
 console.log(JSON.stringify(await ev(`(()=>{const L=window.__life&&__life.LIFE;if(!L)return 'nolife';const by=g=>{let b=0;if(!g)return 0;for(const a of [...Object.values(g.attributes),g.index])if(a&&a.array)b+=a.array.byteLength;return b};const R={};
  for(const k in L.M||{}){const m=L.M[k];let b=by(m.geometry);if(m.instanceMatrix&&m.instanceMatrix.array)b+=m.instanceMatrix.array.byteLength;R[k]=+(b/1048576).toFixed(2)}
  let lm=0;if(L.lm&&L.lm.g)L.lm.g.traverse(o=>{if(o.geometry)lm+=by(o.geometry)});R.lm=+(lm/1048576).toFixed(2);R.maps={C:L.C.size,SC:L.SC.size,SL:L.SL&&L.SL.size,CA:L.CA&&L.CA.size};
  let ld=0;try{for(const k in LD_MODELS)if(/^lx/.test(k))ld+=JSON.stringify(LD_MODELS[k]).length}catch(e){}R.ldModelsKB=Math.round(ld/1024);try{gc()}catch(e){}R.heap=Math.round(performance.memory.usedJSHeapSize/1048576);return R})()`)));await b.close()})();
