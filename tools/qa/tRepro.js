// qa-1 test 3: the 🐞 button in the roam pause menu builds a repro URL (+ screenshot, shared via navigator.share or clipboard+download);
// opening that URL must land on the same ride / mode / position within 0.5 m. Cases: in the car (other ride), on foot.
// usage: node tools/qa/tRepro.js [base url | out/<ver> dir] [--city fra|ath]
const L=require('./lib');
const base=process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:undefined,ci=process.argv.indexOf('--city'),city=ci>0?process.argv[ci+1]:'fra';
(async()=>{let fail=0;const say=(ok,n,m)=>{console.log((ok?'PASS ':'FAIL ')+n+' '+m);if(!ok)fail++};const t0=Date.now();
 const A=await L.open({base,city,car:'t_rosso'});const p=A.p;
 await L.ev(p,'__qa.step(120)');
 // 1) the button: pause menu → 🐞 → navigator.share gets a png + text with the ?repro= link
 await p.evaluate(()=>{window.__sh=null;navigator.canShare=()=>true;navigator.share=async d=>{window.__sh={n:d.files.length,type:d.files[0]&&d.files[0].type,size:d.files[0]&&d.files[0].size,text:d.text}}});
 await L.ev(p,'roamPauseOpen()');
 const vis=await p.evaluate(()=>{const b=document.querySelector('#qaBugBtn');if(!b)return'missing';const r=b.getBoundingClientRect();return r.width>20&&r.height>20&&b.offsetParent?'ok '+Math.round(r.width)+'x'+Math.round(r.height):'hidden'});
 say(vis.startsWith('ok'),'button','🐞 in the pause menu: '+vis);
 await p.click('#qaBugBtn');await p.waitForFunction(()=>window.__sh,null,{timeout:15000}).catch(()=>{});
 const sh=await p.evaluate(()=>window.__sh);
 say(!!sh&&sh.n===1&&sh.type==='image/png'&&sh.size>2000&&/\?repro=/.test(sh.text),'share','navigator.share got '+JSON.stringify(sh&&{n:sh.n,type:sh.type,size:sh.size,link:/\?repro=/.test(sh.text)}));
 const bundle=await p.evaluate(()=>{const b=__qa.last.bundle;return{keys:Object.keys(b),inputs:b.inputs.length,ctl:b.ctl.length}});
 say(['b','c','ride','x','z','h','m','bugs','inputs','ctl'].every(k=>bundle.keys.includes(k)),'bundle','report holds build/city/pos/heading/ride/mode/bugs/inputs ('+bundle.keys.join(',')+')');
 // clipboard + download fallback
 await p.evaluate(()=>{navigator.canShare=()=>false});await L.ev(p,'roamPauseClose&&roamPauseClose()');
 const fb=await p.evaluate(async()=>await __qa.report());say(/^(copied|clip-failed)(\+png)?$/.test(fb)&&/png/.test(fb),'fallback','no share API → '+fb);
 // 2) repro of the car state
 const rest=async(tag,prep,expectFoot)=>{ if(prep)await L.ev(p,prep);
   const st=JSON.parse(await L.ev(p,'JSON.stringify(__qa.state())')),url=await L.ev(p,'__qa.reproUrl()');const b64=url.split('?repro=')[1];
   const B=await L.open({base,city,repro:b64,browser:A.b});
   await B.p.waitForFunction(()=>window.__qa&&__qa.applied===true,null,{timeout:60000}).catch(()=>{});
   const got=JSON.parse(await L.ev(B.p,'JSON.stringify({s:__qa.state(),applied:__qa.applied,ox:__qa.at[0],oz:__qa.at[1]})'));
   const ex=expectFoot?st.ox:st.x,ez=expectFoot?st.oz:st.z,d=Math.hypot(got.ox-ex,got.oz-ez);
   say(got.applied===true&&d<=.5&&got.s.ride===st.ride&&got.s.foot===st.foot&&got.s.c===st.c,'repro:'+tag,`ride ${st.ride}→${got.s.ride}, mode ${st.foot}→${got.s.foot}, city ${st.c}→${got.s.c}, Δpos ${d.toFixed(2)} m`);
   await B.ctx.close()};
 await rest('car',null,false);
 await L.ev(p,'OF_exit();for(let i=0;i<60&&RO.foot!=="walk";i++)roamStep(1/60);for(let i=0;i<30;i++)roamStep(1/60)');
 await rest('foot',null,true);
 const ue=A.errs.filter(e=>!/qa-hook-/.test(e));say(ue.length===0,'page-errors','no uncaught page error ('+ue.length+') '+(ue[0]||''));
 console.log(`${fail?'FAIL':'PASS'} tRepro ${city} ${((Date.now()-t0)/1000).toFixed(0)} s, ${fail} failed`);await A.close();process.exit(fail?1:0)})().catch(e=>{console.log('FAIL tRepro crashed: '+e);process.exit(2)});
