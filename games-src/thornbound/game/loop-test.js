// Loop test (R57): no animation may run forever. Samples document.getAnimations() every 250 ms and fails on ANY running entry with
// iterations === Infinity (CSS or Web Animations, any element), through the staged tutorial (tapped through by touch to its end card)
// and through a quick game followed by the suggested glow for 90 s, with the hint bulb opened once.   node loop-test.js [size=375x553]
const PW=(()=>{try{return require('playwright')}catch(e){return require('/opt/node-tools/node_modules/playwright')}})();
const fs=require('fs');const html=fs.readFileSync(__dirname+'/thornbound.html');
const [W,H]=(process.argv[2]||'375x553').split('x').map(Number);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function probe(){window.__loops=[];window.__loopN=0;setInterval(()=>{try{window.__loopN++;for(const a of document.getAnimations()){const t=a.effect&&a.effect.getTiming();if(a.playState==='running'&&t&&t.iterations===Infinity){const e=a.effect.target;
  const k=(a.animationName||a.id||'anim')+'@'+(e?(e.id?'#'+e.id:String((e.className&&(e.className.baseVal!=null?e.className.baseVal:e.className))||e.tagName)).slice(0,30):'');if(window.__loops.length<200)window.__loops.push(k)}}}catch(x){}},250)}
async function page(b){const ctx=await b.newContext({viewport:{width:W,height:H},isMobile:true,hasTouch:true});
  await ctx.route('**/*',r=>new URL(r.request().url()).host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.addInitScript(probe);
  await p.goto('https://gns.test/?phone=1');await sleep(800);await p.evaluate(()=>{try{localStorage.clear()}catch(e){}});await p.reload();await sleep(900);return {ctx,p,errs}}
const tapSel=async(p,sel)=>{const r=await p.evaluate(s=>{const e=[...document.querySelectorAll(s)].find(x=>x.offsetWidth);if(!e)return null;const q=e.getBoundingClientRect();return [q.left+q.width/2,q.top+q.height/2]},sel);if(!r)return false;await p.touchscreen.tap(...r);return true};
(async()=>{const b=await PW.chromium.launch();let bad=0;const out=[];
  // ---- tutorial
  {const {ctx,p,errs}=await page(b);await p.evaluate(()=>showStart());await tapSel(p,'#start [data-gxt-open]');await sleep(500);await p.evaluate(()=>{UI.speed=4});
    const t0=Date.now();let steps=new Set(),end=false;
    while(Date.now()-t0<150000){const st=await p.evaluate(()=>{const s=GXT.state();return {a:s.active,ph:s.phase,id:s.id,shown:s.shown,hole:s.hole||null,next:!!document.querySelector('.gxt-bub .gxt-next')}});
      if(!st.a||st.ph==='end'){end=st.ph==='end';break}
      if(!st.shown){const go=await p.evaluate(()=>{const b=document.getElementById('board').getBoundingClientRect();return [b.left+b.width/2,b.top+b.height*0.62]});await p.touchscreen.tap(...go);await sleep(250);continue}
      steps.add(st.id);
      if(st.next){await tapSel(p,'.gxt-bub .gxt-next');await sleep(350);continue}
      if(st.hole){await p.touchscreen.tap(st.hole.cx,st.hole.cy);await sleep(450);continue}
      await sleep(200)}
    await sleep(3000);const r=await p.evaluate(()=>({loops:window.__loops,n:window.__loopN}));
    const u=[...new Set(r.loops)];out.push('LOOPS tutorial '+W+'x'+H+': '+steps.size+' steps'+(end?' to the end card':' (no end card)')+', '+r.n+' samples, infinite '+r.loops.length+(u.length?' '+JSON.stringify(u):'')+', page errors '+errs.length);
    if(r.loops.length||errs.length||steps.size<20)bad++;await ctx.close()}
  // ---- a quick game, following the glow; the bulb once
  {const {ctx,p,errs}=await page(b);await p.evaluate(()=>showStart());await tapSel(p,'#start [data-a=play]');await sleep(500);await tapSel(p,'#start [data-a=start]');await sleep(800);
    // the hint finger demos the move 3 times and hides; then the suggested card's glow is back (one helper, never none)
    {for(let i=0;i<9;i++){await tapSel(p,'.gxh-bub.on .gxh-ok');await tapSel(p,'#tbgoal button');await sleep(1000)}
      const g=await p.evaluate(()=>{const f=document.getElementById('finger'),e=document.querySelector('#handw .hc.rg svg');return {finger:!!f&&!f.hidden,bub:!!document.querySelector('.gxh-bub.on'),glow:!!e&&/drop-shadow\(rgb\(255, 2/.test(getComputedStyle(e).filter)}});
      out.push('AFTER FINGER: finger '+(g.finger?'still shown':'hidden')+', suggested-card glow '+(g.glow?'back':'MISSING'));if(g.finger||g.bub||!g.glow)bad++}
    const t0=Date.now();let bulb=false,taps=0;
    while(Date.now()-t0<90000){
      if(!bulb&&Date.now()-t0>30000){bulb=await tapSel(p,'#bulbbtn');if(bulb){await sleep(6000);continue}}
      const c=await p.evaluate(()=>{for(const s of ['.gxh-bub.on .gxh-ok','#tbgoal button','#act .autc [data-aut]','#handw .hc.glow.rg','#spots .bspot.glow','.tb-loc.glow .tb-ring','.tbx-pan g.rglow rect','#handw .hc.glow','#handw .kcb.glow','#main [data-a=mv]','#act [data-a=mv]']){const e=[...document.querySelectorAll(s)].find(x=>{const r=x.getBoundingClientRect();return r.width&&r.height&&r.top<innerHeight&&r.bottom>0});if(e){const r=e.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]}}return null});
      if(c){await p.touchscreen.tap(...c);taps++;await sleep(900)}else await sleep(300)}
    const r=await p.evaluate(()=>({loops:window.__loops,n:window.__loopN}));const u=[...new Set(r.loops)];
    out.push('LOOPS game '+W+'x'+H+': 90 s, '+taps+' taps, bulb '+(bulb?'opened':'not found')+', '+r.n+' samples, infinite '+r.loops.length+(u.length?' '+JSON.stringify(u):'')+', page errors '+errs.length);
    if(r.loops.length||errs.length)bad++;await ctx.close()}
  await b.close();console.log(out.join('\n'));console.log(bad?'loop-test FAIL':'loop-test PASS');process.exit(bad?1:0)})();
