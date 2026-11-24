// Proof video (F15): the first 3 minutes of a brand-new player at 375x667, by finger taps only, recorded to proof/first-3-min-375x667.webm.
// From the title: "New here? Learn in 5 minutes", then whatever the screen asks (the glowing thing, Next, or "Tap to go on"), one tap every ~1.5 s,
// plus one deliberate wrong tap early on to show the shake and hint.   node proof-video.js [seconds=180]
const PW=(()=>{try{return require('playwright')}catch(e){return require('/opt/node-tools/node_modules/playwright')}})();
const fs=require('fs'),path=require('path');const html=fs.readFileSync(__dirname+'/thornbound.html');
const SEC=+(process.argv[2]||180),OUT=path.join(__dirname,'..','proof');const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{fs.mkdirSync(OUT,{recursive:true});const b=await PW.chromium.launch();
  // warm-up context (no video) to clear storage, so the recorded one is a true first visit
  const ctx=await b.newContext({viewport:{width:375,height:667},isMobile:true,hasTouch:true,recordVideo:{dir:OUT,size:{width:375,height:667}}});
  await ctx.route('**/*',r=>new URL(r.request().url()).host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('https://gns.test/?phone=1');await sleep(1500);
  const t0=Date.now();let taps=0,wrong=0,steps=new Set();
  const at=sel=>p.evaluate(sel=>{const e=[...document.querySelectorAll(sel)].find(x=>x.offsetWidth&&x.getBoundingClientRect().height);if(!e)return null;const q=e.getBoundingClientRect();return [q.left+q.width/2,q.top+q.height/2]},sel);
  // the real game: tap the suggested move, as the repo's glow-follow.js does
  const followPick=()=>p.evaluate(()=>{      const vis=e=>{const r=e.getBoundingClientRect();if(!r.width||!r.height||r.bottom<0||r.top>innerHeight)return null;const cx=Math.min(Math.max(r.left+Math.min(r.width/2,22),1),innerWidth-1),cy=r.top+r.height/2;const t=document.elementFromPoint(cx,cy);const hs=e.closest('.tb-loc')||e.closest('g.rglow')||e;if(t&&e.closest('g.rglow')&&t.closest('#mapbox'))return [cx,cy];if(!t||!(t===hs||hs.contains(t)||t.contains(hs)))return null;return [cx,cy]};
        const pick=sels=>{for(const s of sels)for(const e of document.querySelectorAll(s)){const c=vis(e);if(c)return {s,c}}return null};
        const over=!!(G&&G.over);
        const rk=UI._rec&&UI._recShown!==false?UI._rec.k:null;const esc=v=>String(v).replace(/["\\]/g,'\\$&');
        const t=pick(['.gxh-bub.on .gxh-ok','#tbgoal button','#pc [data-a=take]'].concat(rk!=null?['#ppop [data-a=mv][data-k="'+esc(rk)+'"]','#act [data-a=mv][data-k="'+esc(rk)+'"]','#main [data-a=mv][data-k="'+esc(rk)+'"]']:[]).concat(['#ppop .rec[data-a=mv]','#ppop .rec [data-a=mv]','#ppop [data-a=mv]','#act .autc [data-aut]','#handw .hc.glow.rg','#handw .kcb.glow.rg','#spots .bspot.rec','.tb-loc.glow.rec .tb-ring','.tbx-pan g.rrec rect','#main .rec[data-a=mv]','#main .rec [data-a=mv]','#act .rec[data-a=mv]','#spots .bspot.glow','.tb-loc.glow.rec .tb-ring','.tbx-pan g.rglow rect','#handw .kcb.glow.rg','#handw .hc.glow','.tb-loc.glow .tb-ring','#handw .kcb.glow','#main [data-a=mv]','#act [data-a=mv]']));
        return t&&t.c});
  const tap=async xy=>{if(!xy)return false;await p.touchscreen.tap(xy[0],xy[1]);taps++;return true};
  await sleep(800);await tap(await at('#start [data-gxt-open]'));await sleep(1500);
  while(Date.now()-t0<SEC*1000){
    const s=await p.evaluate(()=>{try{return GXT.state()}catch(e){return {active:false}}});
    if(s.active&&s.shown){steps.add(s.id);
      if(!wrong&&s.wait&&steps.size>=4&&s.hole){wrong=1;await sleep(900);await tap([375*0.5,667*0.08>40?667*0.08:60]);await sleep(1800)}
      if(s.wait&&s.hole){await sleep(1400);await tap([s.hole.cx,s.hole.cy])}
      else{await sleep(1900);await tap(await at('.gxt-bub .gxt-next'))}}
    else{const go=await p.evaluate(()=>{const l=document.querySelector('#tbturn:not([hidden]) .tbt-line');if(l&&/Tap to go on/.test(l.textContent)){const b=document.getElementById('board').getBoundingClientRect();return [b.left+b.width/2,b.top+b.height*0.62]}return null});
      if(go){await sleep(1200);await tap(go)}
      else{const play=await p.evaluate(()=>{const e=[...document.querySelectorAll('button')].find(x=>x.offsetWidth&&/Play a real game|Start the game/i.test(x.textContent));if(!e)return null;const q=e.getBoundingClientRect();return [q.left+q.width/2,q.top+q.height/2]});
        if(play){await sleep(1500);await tap(play);await sleep(1200);continue}
        const xy=(s.active?null:await followPick())||await at('.gx-goal button,#tbgoal button,.tbtn.primary');if(xy&&!(s.active&&s.shown)){await sleep(1500);await tap(xy)}else await sleep(400)}}}
  const v=p.video();await ctx.close();const src=await v.path();const dst=path.join(OUT,'first-3-min-375x667.webm');fs.renameSync(src,dst);
  await b.close();console.log('PROOF video',dst,(fs.statSync(dst).size/1e6).toFixed(1)+' MB',SEC+' s, taps '+taps+', wrong taps '+wrong+', tutorial steps seen '+steps.size+' ('+[...steps].join(',')+'), page errors '+errs.length)})();
