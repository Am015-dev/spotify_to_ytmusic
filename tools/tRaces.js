// tRaces: scripted human-like bot (tkBot, 150 ms lag) on the BUILT page; N runs per race on one warm page. Prints one line per run.
//   node tools/tRaces.js <base url, .../index.html> [runs=3] [river,gp,westend,akro]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const [BASE,N0,WHICH]=process.argv.slice(2),N=+N0||3,W=(WHICH||'river,gp,westend,akro').split(',');
const SPEC={river:{c:'fra',js:`tkBuild({key:'rival:water-rv2',kind:'quick',name:'Main River Run',ai:['WEBER'],water:true})`,route:'pB',roam:0},
 gp:{c:'fra',js:`(()=>{const sv=menuTrack;menuTrack='grand';const C=tkBuild(tkQuickSpec());menuTrack=sv;return C})()`,route:'pA',roam:0},
 westend:{c:'fra',js:`TK_C`,route:'pA',roam:0},
 akro:{c:'ath',js:`tkCourseOf(tkMarkOf(ATH_BOSS_EV))`,route:'pA',roam:30}};
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});let bad=0;
 for(const city of ['fra','ath']){const ks=W.filter(k=>SPEC[k].c===city);if(!ks.length)continue;
  const p=await(await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true})).newPage();p.setDefaultTimeout(900000);
  await p.goto(BASE+'?test='+city+'&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready&&window.__chk,null,{polling:250,timeout:600000});
  for(const k of ks)for(let i=0;i<N;i++){const S=SPEC[k];
   await p.evaluate(()=>{try{__tq.reset()}catch(e){}});const r=await p.evaluate(s=>__tk.q(s),`(()=>{const C=${S.js};if(!C)return{none:1};return RV3A_race(C,'${S.route}',${S.roam})})()`);
   const ok=r.fin&&r.t<=420&&(r.place<=2||k==='gp'&&r.place<=4);if(!ok)bad++;
   console.log((ok?'PASS ':'FAIL ')+k+' run'+(i+1)+' '+(r.none?'no course':(r.fin?r.place+'. '+r.t+'s':'DNF')+' lc'+r.lc+' med'+r.med+' stuck'+r.stuck)+(ok?'':' '+String(r.dg||'').slice(0,700)))}
  await p.close()}
 console.log('TRACES '+(bad?'FAIL':'OK')+' '+bad+' bad');await b.close();process.exit(bad?1:0)})();
