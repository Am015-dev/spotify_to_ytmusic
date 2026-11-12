// Newcomer wait check: a default game from the title (Play -> Start, no settings touched) played by touch on a phone, through the real UI only.
// Each poll it taps what a newcomer would tap (a coach bubble's button, the suggested glowing thing, any glowing thing, the main button), never a forced move.
// Measures the longest stretch where NOTHING is tappable and NOTHING moves on screen (a still, dead screen). Fails if any such stretch is over 4 s, or on a page error.
//   node newcomer-wait.js [games=2] [size=390x844]
const PW=(()=>{try{return require('playwright')}catch(e){return require('/opt/node-tools/node_modules/playwright')}})();
const gx=require('../../scripts/gx-serve.js');
const GAMES=+(process.argv[2]||2);const [W,H]=(process.argv[3]||'390x844').split('x').map(Number);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const URL=process.env.GX_URL?process.env.GX_URL+'thornbound/':await gx.url('thornbound',{file:process.env.TB_FILE||__dirname+'/thornbound.html'});
  const b=await PW.chromium.launch();let bad=0;
  for(let g=0;g<GAMES;g++){
    const ctx=await b.newContext({viewport:{width:W,height:H},isMobile:true,hasTouch:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
    await p.goto(URL);await sleep(1500);
    const tapSel=async sel=>{const r=await p.evaluate(s=>{const e=[...document.querySelectorAll(s)].find(x=>x.offsetWidth);if(!e)return null;const q=e.getBoundingClientRect();return [q.left+q.width/2,q.top+q.height/2]},sel);if(!r)return false;await p.touchscreen.tap(...r);await sleep(500);return true};
    if(!await tapSel('#start [data-a=play]')){console.log('g'+g+': no Play button');bad++;continue}
    if(!await tapSel('#start [data-a=start]')){console.log('g'+g+': no Start button');bad++;continue}
    const t0=Date.now();let still=0,stillT=Date.now(),lastSnap='',worst={ms:0,what:''},taps=0;
    const CAP=+(process.env.CAP||420000);let lastLog=Date.now();
    while(Date.now()-t0<CAP){if(process.env.V&&Date.now()-lastLog>15000){lastLog=Date.now();console.log('  '+Math.round((Date.now()-t0)/1000)+'s taps '+taps+' worst '+(worst.ms/1000).toFixed(1)+' '+worst.what+' round '+(await p.evaluate(()=>G.round+' q='+(G.q&&G.q.kind)+' card='+(UI.card&&UI.card.kind)+' line='+((document.querySelector('#tbturn .tbt-line')||{}).textContent||''))))}
      const s=await p.evaluate(()=>{const vis=e=>{const r=e.getBoundingClientRect();if(!r.width||!r.height||r.bottom<0||r.top>innerHeight)return null;const cx=Math.min(Math.max(r.left+Math.min(r.width/2,22),1),innerWidth-1),cy=r.top+r.height/2;const t=document.elementFromPoint(cx,cy);const hs=e.closest('.tb-loc')||e.closest('g.rglow')||e;if(!t||!(t===hs||hs.contains(t)||t.contains(hs)))return null;return [cx,cy]};
        const pick=sels=>{for(const s of sels)for(const e of document.querySelectorAll(s)){const c=vis(e);if(c)return {s,c}}return null};
        const over=!!(G&&G.over);
        const t=pick(['.gxh-bub.on .gxh-ok','#tbgoal button','#pc [data-a=take]','#ppop [data-a=mv]','#handw .hc.glow.rg','#spots .bspot.glow','.tb-loc.glow.rec .tb-ring','.tbx-pan g.rglow rect','#handw .kcb.glow.rg','#handw .hc.glow','.tb-loc.glow .tb-ring','#handw .kcb.glow','#main [data-a=mv]','#act [data-a=mv]']);
        const h=document.body.innerHTML;let k=h.length;for(let i=0;i<h.length;i+=11)k=(k*31+h.charCodeAt(i))|0;
        return {over,t,snap:k+'|'+(UI.card&&UI.card.kind)+'|'+G.logN,st:(document.querySelector('#tbturn .tbt-line')||{}).textContent||'',card:UI.card&&(UI.card.kind+(UI.card.ev?':'+UI.card.ev.t:'')),q:G.q&&G.q.kind}});
      if(s.over)break;
      if(s.t){const d=Date.now()-stillT;if(d>worst.ms)worst={ms:d,what:worst.what};stillT=Date.now();if(process.env.V>1)console.log('   tap '+s.t.s);await p.touchscreen.tap(...s.t.c);taps++;await sleep(350);lastSnap='';continue}
      if(s.snap!==lastSnap){lastSnap=s.snap;const d=Date.now()-stillT;if(d>worst.ms)worst={ms:d,what:'still: card='+s.card+' q='+s.q+' line="'+s.st+'"'};stillT=Date.now()}
      else{const d=Date.now()-stillT;if(d>worst.ms)worst={ms:d,what:'still: card='+s.card+' q='+s.q+' line="'+s.st+'"'}}
      await sleep(150)}
    const over=await p.evaluate(()=>!!(G&&G.over));
    console.log('g'+g+' '+W+'x'+H+': '+(over?'finished':'NOT finished')+' in '+Math.round((Date.now()-t0)/1000)+' s, '+taps+' taps, longest still dead screen '+(worst.ms/1000).toFixed(1)+' s '+(worst.what||'')+', page errors '+errs.length+(errs.length?' '+errs[0]:''));
    if(!over||worst.ms>4000||errs.length)bad++;await ctx.close()}
  await b.close();console.log(bad?'FAIL':'PASS');process.exit(bad?1:0)})();
