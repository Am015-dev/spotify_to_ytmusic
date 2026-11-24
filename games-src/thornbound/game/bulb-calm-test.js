// Bulb calm test (R64): with the hint bulb's bubble open there is ONE helper on screen (the bubble and its own pointer), sampled 1/s for 15 s.
// Plays a quick game by following the glow, taps the bulb at the first Spring menu and at later decisions.  node bulb-calm-test.js [size=375x667] [bulbs=3]
const PW=(()=>{try{return require('playwright')}catch(e){return require('/opt/node-tools/node_modules/playwright')}})();
const fs=require('fs');const HS=require('./helper-sample.js');const html=fs.readFileSync(process.env.TB_FILE||__dirname+'/thornbound.html');
const [W,H]=(process.argv[2]||'375x667').split('x').map(Number);const BULBS=+(process.argv[3]||3);const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await PW.chromium.launch();let bad=0;
  const ctx=await b.newContext({viewport:{width:W,height:H},isMobile:true,hasTouch:true});
  await ctx.route('**/*',r=>new URL(r.request().url()).host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.addInitScript(HS.inPage);
  await p.goto('https://gns.test/?phone=1');await sleep(800);await p.evaluate(()=>{try{localStorage.clear()}catch(e){}});await p.reload();await sleep(900);
  const tapSel=async sel=>{const r=await p.evaluate(s=>{const e=[...document.querySelectorAll(s)].find(x=>x.offsetWidth);if(!e)return null;const q=e.getBoundingClientRect();return [q.left+q.width/2,q.top+q.height/2]},sel);if(!r)return false;await p.touchscreen.tap(...r);await sleep(500);return true};
  if(process.env.TACTIC!=='0'&&process.env.MODE!=='tutorial')await p.evaluate(()=>{const o=getRec;window.getRec=getRec=function(s,mv){const t=(mv||[]).find(m=>/^t:/.test(m.a||''));return t?{k:t.k}:o.apply(this,arguments)}});
  await p.evaluate(()=>showStart());await tapSel('#start [data-a=play]');await tapSel('#start [data-a=start]');await sleep(800);
  if(process.env.MODE==='tutorial'){   // the staged tutorial tapped through by touch to its end card, sampled 1/s, then 16 s idle
    await p.evaluate(()=>{const g=document.getElementById('tbgoal');if(g)g.remove();showStart()});await sleep(300);await tapSel('#start [data-gxt-open]');await p.evaluate(()=>{UI.speed=4});
    const t1=Date.now();let steps=new Set(),end=false,bulbs=0;
    while(Date.now()-t1<170000){const st=await p.evaluate(()=>{const s=GXT.state();return {a:s.active,ph:s.phase,id:s.id,shown:s.shown,hole:s.hole||null,next:!!document.querySelector('.gxt-bub .gxt-next')}});
      if(!st.a||st.ph==='end'){end=st.ph==='end';break}
      if(!st.shown){const go=await p.evaluate(()=>{const b=document.getElementById('board').getBoundingClientRect();return [b.left+b.width/2,b.top+b.height*0.62]});await p.touchscreen.tap(...go);await sleep(250);continue}
      steps.add(st.id);if(st.next){await tapSel('.gxt-bub .gxt-next');continue}
      if(st.hole){await p.touchscreen.tap(st.hole.cx,st.hole.cy);await sleep(450);continue}await sleep(200)}
    await sleep(16000);const S=await p.evaluate(()=>window.__tbHS);const sm=HS.summary(S);const ok=sm.max<=1&&!sm.loops&&end;if(!ok)bad++;
    console.log((ok?'ok   ':'FAIL ')+'tutorial '+W+'x'+H+': '+steps.size+' steps'+(end?' to the end card':' (no end card)')+' '+HS.line('tutorial',sm));
    if(errs.length){bad++;console.log('FAIL page errors',errs[0])}await b.close();console.log(bad?'bulb-calm-test FAIL '+bad:'bulb-calm-test PASS (tutorial '+W+'x'+H+')');process.exit(bad?1:0)}
  let done=0,springDone=false;const t0=Date.now();const res=[];
  while(done<BULBS&&Date.now()-t0<240000){
    const st=await p.evaluate(()=>{const b=document.getElementById('bulbbtn');const ok=b&&b.offsetWidth&&!(G.q&&G.q.seats&&!G.q.seats.includes(0))&&!UI.card&&!document.getElementById('tbgoal')&&!document.querySelector('.gxh-bub.on');
      let ph=null;try{ph=hlpPhase()}catch(e){}const r=b&&b.getBoundingClientRect();return {ok:!!ok,ph,over:!!G.over,bb:r?[r.left+r.width/2,r.top+r.height/2]:null,sug:!!(UI.bf&&UI.bf.sug)}});
    if(st.over)break;
    if(st.ok&&st.sug&&(springDone||st.ph==='spring')){
      await p.evaluate(()=>{window.__tbHSmark=1});await p.touchscreen.tap(...st.bb);await sleep(400);
      const info=await p.evaluate(()=>{const bb=document.querySelector('.gxh-bulbb');return bb?bb.innerText.replace(/\s+/g,' '):''});if(process.env.SHOT)await p.screenshot({path:process.env.SHOT+'-'+done+'.png'});
      const extra=await p.evaluate(()=>{const ring=document.querySelector('.gxh-ring:not(.from)');if(!ring)return [];const q=ring.getBoundingClientRect(),cx=q.left+q.width/2,cy=q.top+q.height/2;
        return [...document.querySelectorAll('.tbx-pan g.rglow,.tb-loc.glow,.bspot.glow')].filter(e=>{const r=e.getBoundingClientRect();return !(cx>=r.left-10&&cx<=r.right+10&&cy>=r.top-10&&cy<=r.bottom+10)}).map(e=>e.getAttribute('class')+(e.dataset.reg||e.dataset.id||''))});
      if(extra.length){bad++;res.push('FAIL bulb '+(done+1)+': other target glows still on while the bulb bubble is open: '+extra.join(', '))}
      await sleep(15600);await p.evaluate(()=>{window.__tbHSmark=0});
      const S=await p.evaluate(()=>window.__tbHS.filter(r=>r.mark===1));await p.evaluate(()=>{window.__tbHS.forEach(r=>{if(r.mark===1)r.mark=2})});
      const s=HS.summary(S);const okb=s.max<=1&&!s.loops&&s.n>=14;if(!okb)bad++;
      res.push((okb?'ok   ':'FAIL ')+'bulb '+(done+1)+' at '+st.ph+': "'+info.slice(0,70)+'" '+HS.line('after-bulb',s));done++;if(st.ph==='spring')springDone=true;continue}
    // follow the game: tap what a newcomer taps
    const t=await p.evaluate(()=>{const vis=e=>{const r=e.getBoundingClientRect();if(!r.width||!r.height||r.bottom<0||r.top>innerHeight)return null;const cx=r.left+r.width/2,cy=r.top+r.height/2;const t=document.elementFromPoint(cx,cy);const hs=e.closest('.tb-loc')||e.closest('g.rglow')||e;if(t&&e.closest('g.rglow')&&t.closest('#mapbox'))return [cx,cy];if(!t||!(t===hs||hs.contains(t)||t.contains(hs)))return null;return [cx,cy]};
      for(const s of ['#tbgoal button','.gxh-bub.on .gxh-ok','#pc [data-a=take]','#ppop [data-a=mv]','#act .autc [data-aut]','#handw .hc.glow.rg','#spots .bspot.glow','.tb-loc.glow.rec .tb-ring','.tbx-pan g.rglow rect','#handw .kcb.glow.rg','#handw .hc.glow','.tb-loc.glow .tb-ring','#handw .kcb.glow','#main [data-a=mv]','#act [data-a=mv]'])for(const e of document.querySelectorAll(s)){const c=vis(e);if(c)return c}return null});
    if(t){await p.touchscreen.tap(...t);await sleep(900)}else await sleep(250)}
  for(const l of res)console.log(l);if(done<1){bad++;console.log('FAIL no bulb tap happened')}if(!springDone){bad++;console.log('FAIL the Spring bulb was never tapped')}
  if(errs.length){bad++;console.log('FAIL page errors',errs[0])}
  await b.close();console.log(bad?'bulb-calm-test FAIL '+bad:'bulb-calm-test PASS ('+W+'x'+H+', '+done+' bulbs)');process.exit(bad?1:0)})();
