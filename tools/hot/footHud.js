// foot-2: ON FOOT banner (#roamGauge) vs the on-foot controls, landscape 852x393 and portrait 393x852 (touch). node tools/hot/footHud.js [fra|ath]  -> one line per profile, FAIL if the banner overlaps a control or leaves the screen
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const city=process.argv[2]||'fra',b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});let bad=0;
 for(const [name,w,h] of [['landscape',852,393],['portrait',393,852]]){
  const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:1,isMobile:true,hasTouch:true}),p=await ctx.newPage();p.setDefaultTimeout(180000);
  await p.goto(`http://127.0.0.1:${process.env.HOT_PORT||8890}/hot.html?test=${city}&draw=0`);await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{timeout:180000});
  const r=await p.evaluate(()=>{window.__hot('TOUCH.on=true;TOUCH.used=true;document.body.classList.add("touch");OF_go("walk");for(let i=0;i<3;i++)roamHud&&roamHud()');return new Promise(res=>setTimeout(()=>{const R=e=>{if(!e||!e.offsetWidth)return null;const q=e.getBoundingClientRect();return[q.left,q.top,q.right,q.bottom].map(Math.round)};
   const g=document.getElementById('roamGauge');const ids=['tB','tG','tL','tR','tP','tN','ofZone','ofRing','ofKnob','ofJump','ofRun','btnJump'];const out={g:R(g),c:{}};
   const vis=[...document.querySelectorAll('#hud button,#touch *,[id^=t]:not(script),[id^=of]')].filter(e=>e.offsetWidth&&e.id&&e!==g&&!g.contains(e)&&getComputedStyle(e).pointerEvents!=='none'&&e.getBoundingClientRect().width<240&&e.getBoundingClientRect().height<240);
   for(const e of vis)out.c[e.id]=R(e);for(const id of['tB','tG','ofRing','ofKnob','tP']){const e=document.getElementById(id);if(e&&e.offsetWidth)out.c[id]=R(e)}out.all=ids.map(i=>[i,!!document.getElementById(i),!!(document.getElementById(i)&&document.getElementById(i).offsetWidth)]).filter(x=>x[1]);res(out)},900))});
  const g=r.g;const hit=[];if(g)for(const k in r.c){const c=r.c[k];if(c&&!(g[2]<=c[0]||g[0]>=c[2]||g[3]<=c[1]||g[1]>=c[3]))hit.push(k)}
  const off=g&&(g[0]<0||g[2]>w||g[1]<0||g[3]>h);const fail=!g||hit.length||off;if(fail)bad++;
  console.log(JSON.stringify(r.c)+JSON.stringify(r.all));console.log((fail?'FAIL ':'PASS ')+city+' '+name+' banner '+JSON.stringify(g)+' overlaps '+JSON.stringify(hit)+(off?' OFFSCREEN':''));await ctx.close()}
 await b.close();process.exit(bad?1:0)})();
