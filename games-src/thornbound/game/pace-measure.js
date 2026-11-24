// Pace measure: same bot as newcomer-wait.js, plus a per-round table (seconds, own taps, rival narration cards, seconds with a card up, seconds waiting on rivals).
//   node pace-measure.js [games=1] [size=375x667]   (set MOUSE=1 for a mouse at desktop sizes)
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
    const ctx=await b.newContext({viewport:{width:W,height:H},...(process.env.VIDEO?{recordVideo:{dir:process.env.VIDEO,size:{width:W,height:H}}}:{}),isMobile:!process.env.MOUSE,hasTouch:!process.env.MOUSE});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
    await p.addInitScript(()=>{window.__aud=()=>{const out=[];const vis=e=>{const r=e.getBoundingClientRect();if(!r.width||!r.height||r.bottom<0||r.top>innerHeight||r.right<0||r.left>innerWidth)return false;const cs=getComputedStyle(e);return cs.visibility!=='hidden'&&cs.display!=='none'&&+cs.opacity>0.05};
      const minPx=innerWidth>=900?12:11.5;
      for(const e of document.querySelectorAll('body *')){if(e.closest('svg')||e.closest('#fx')||e.closest('.sr'))continue;if(!vis(e))continue;const cs=getComputedStyle(e);
        const own=[...e.childNodes].some(n=>n.nodeType===3&&/\S/.test(n.nodeValue));
        if(own){const px=parseFloat(cs.fontSize);if(px<minPx)out.push('font '+px+'px: '+(e.textContent||'').trim().slice(0,24));
          if(cs.textOverflow==='ellipsis'&&e.scrollWidth>e.clientWidth+1)out.push('ellipsis cut: '+(e.textContent||'').trim().slice(0,30));
          if((cs.webkitLineClamp&&cs.webkitLineClamp!=='none')&&e.scrollHeight>e.clientHeight+2)out.push('line-clamp cut: '+(e.textContent||'').trim().slice(0,30));
          const t=(e.textContent||'').trim();if(e.children.length===0&&/(\.\.\.|\u2026)$/.test(t)&&t.length>12&&!/thinking/i.test(t))out.push('text ends with ...: '+t.slice(0,40))}}
      const ln=document.querySelector('#tbturn:not([hidden]) .tbt-line');if(ln&&window.tbLineOver&&window.tbLineOver(ln))out.push('strip text is cut: '+ln.textContent.slice(0,40));
      const hc=[...document.querySelectorAll('#handw .hc')].map(e=>e.getBoundingClientRect());for(let i=1;i<hc.length;i++)if(hc[i].left<hc[i-1].right-1&&!document.querySelector('#handw .hc.on'))out.push('hand cards overlap by '+Math.round(hc[i-1].right-hc[i].left)+'px');
      return out}});
    await p.goto(URL);await sleep(1500);
    const tapSel=async sel=>{const r=await p.evaluate(s=>{const e=[...document.querySelectorAll(s)].find(x=>x.offsetWidth);if(!e)return null;const q=e.getBoundingClientRect();return [q.left+q.width/2,q.top+q.height/2]},sel);if(!r)return false;await (process.env.MOUSE?p.mouse.click(...r):p.touchscreen.tap(...r));await sleep(500);return true};
    if(!await tapSel('#start [data-a=play]')){console.log('g'+g+': no Play button');bad++;continue}
    if(!await tapSel('#start [data-a=start]')){console.log('g'+g+': no Start button');bad++;continue}
    let window_lastA='',AUD={},window_last=0,window_lastSt='',shotN=0;const ROUNDS={};const tally={};const t0=Date.now();let still=0,stillT=Date.now(),lastSnap='',worst={ms:0,what:''},taps=0;
    const CAP=+(process.env.CAP||420000);let lastLog=Date.now();
    while(Date.now()-t0<CAP){if(process.env.V&&Date.now()-lastLog>15000){lastLog=Date.now();console.log('  '+Math.round((Date.now()-t0)/1000)+'s taps '+taps+' worst '+(worst.ms/1000).toFixed(1)+' '+worst.what+' round '+(await p.evaluate(()=>G.round+' q='+(G.q&&G.q.kind)+' card='+(UI.card&&UI.card.kind)+' line='+((document.querySelector('#tbturn .tbt-line')||{}).textContent||''))))}
      const s=await p.evaluate(()=>{const vis=e=>{const r=e.getBoundingClientRect();if(!r.width||!r.height||r.bottom<0||r.top>innerHeight)return null;const cx=Math.min(Math.max(r.left+Math.min(r.width/2,22),1),innerWidth-1),cy=r.top+r.height/2;const t=document.elementFromPoint(cx,cy);const hs=e.closest('.tb-loc')||e.closest('g.rglow')||e;if(t&&e.closest('g.rglow')&&t.closest('#mapbox'))return [cx,cy];if(!t||!(t===hs||hs.contains(t)||t.contains(hs)))return null;return [cx,cy]};
        const pick=sels=>{for(const s of sels)for(const e of document.querySelectorAll(s)){const c=vis(e);if(c)return {s,c}}return null};
        const over=!!(G&&G.over);
        const t=pick(['.gxh-bub.on .gxh-ok','#tbgoal button','#pc [data-a=take]','#ppop [data-a=mv]','#act .autc [data-aut]','#handw .hc.glow.rg','#spots .bspot.glow','.tb-loc.glow.rec .tb-ring','.tbx-pan g.rglow rect','#handw .kcb.glow.rg','#handw .hc.glow','.tb-loc.glow .tb-ring','#handw .kcb.glow','#main [data-a=mv]','#act [data-a=mv]']);
        const h=document.body.innerHTML;let k=h.length;for(let i=0;i<h.length;i+=11)k=(k*31+h.charCodeAt(i))|0;
        return {sk:(()=>{const e=document.querySelector('#tbturn:not([hidden]) .tbt-skip2');if(!e||!e.offsetWidth)return null;const q=e.getBoundingClientRect();return [q.left+q.width/2,q.top+q.height/2]})(),rd:G.round,cardId:UI.card?(UI.card.id||UI.card.kind+(UI.card.ev?UI.card.ev.t:'')):null,cardUp:!!(UI.card&&UI.card.kind!=='over'),rivalWait:!UI.card&&!!(G.q&&viewSeatForQ()==null&&!G.over),over,t,snap:k+'|'+(UI.card&&UI.card.kind)+'|'+G.logN,st:(document.querySelector('#tbturn .tbt-line')||{}).textContent||'',card:UI.card&&(UI.card.kind+(UI.card.ev?':'+UI.card.ev.t:'')),q:G.q&&G.q.kind}});
      {const now=Date.now(),dt=now-(window_last||now);window_last=now;const R=(ROUNDS[s.rd]=ROUNDS[s.rd]||{t0:now,taps:0,cards:0,cardMs:0,waitMs:0,last:null});R.t1=now;if(s.cardUp)R.cardMs+=dt;if(s.rivalWait)R.waitMs+=dt;const ck=s.cardUp?(s.cardId+'|'+s.snap.split('|')[2]):null;if(ck&&ck!==R.last){R.cards++}R.last=ck||R.last&&null}
      if(process.env.SHOTS&&s.st!==window_lastSt&&(s.cardUp||s.rivalWait)&&shotN<+process.env.SHOTS){window_lastSt=s.st;shotN++;await p.screenshot({path:process.env.SHOTDIR+'/p'+String(shotN).padStart(2,'0')+'.png'})}
      if(process.env.RUSH&&s.sk&&(s.cardUp||s.rivalWait)){const R=ROUNDS[s.rd];if(R){R.taps++;R.skips=(R.skips||0)+1}await (process.env.MOUSE?p.mouse.click(...s.sk):p.touchscreen.tap(...s.sk));taps++;await sleep(300);continue}
      if(process.env.AUDIT&&s.st!==window_lastA){window_lastA=s.st;const A=await p.evaluate(()=>window.__aud());for(const x of A){AUD[x]=(AUD[x]||0)+1}}
      if(s.over)break;
      if(s.t){const d=Date.now()-stillT;if(d>worst.ms)worst={ms:d,what:worst.what};stillT=Date.now();if(process.env.V>1)console.log('   tap '+s.t.s);{const R=ROUNDS[s.rd];if(R)R.taps++}await (process.env.MOUSE?p.mouse.click(...s.t.c):p.touchscreen.tap(...s.t.c));taps++;await sleep(350);lastSnap='';continue}
      if(s.snap!==lastSnap){lastSnap=s.snap;const d=Date.now()-stillT;if(d>worst.ms)worst={ms:d,what:'still: card='+s.card+' q='+s.q+' line="'+s.st+'"'};stillT=Date.now()}
      else{const d=Date.now()-stillT;if(d>worst.ms)worst={ms:d,what:'still: card='+s.card+' q='+s.q+' line="'+s.st+'"'}}
      await sleep(150)}
    {let tt=0,tc=0;for(const r of Object.keys(ROUNDS)){const R=ROUNDS[r];const sec=(R.t1-R.t0)/1000;tt+=sec;tc+=R.taps;console.log('ROUND '+r+': '+sec.toFixed(0)+' s, '+R.taps+' taps'+(R.skips?' (of which '+R.skips+' Skip taps)':'')+', '+R.cards+' narration cards ('+(R.cardMs/1000).toFixed(0)+' s up), '+(R.waitMs/1000).toFixed(0)+' s waiting on rivals')}console.log('PACE total '+tt.toFixed(0)+' s over '+Object.keys(ROUNDS).length+' rounds, '+tc+' taps')}
    if(process.env.AUDIT){const k=Object.keys(AUD);console.log('AUDIT '+(k.length?k.length+' kinds of problem':'clean'));for(const x of k.slice(0,25))console.log('  '+x+'  x'+AUD[x])}
    const over=await p.evaluate(()=>!!(G&&G.over));
    console.log('g'+g+' '+W+'x'+H+': '+(over?'finished':'NOT finished')+' in '+Math.round((Date.now()-t0)/1000)+' s, '+taps+' taps, longest still dead screen '+(worst.ms/1000).toFixed(1)+' s '+(worst.what||'')+', page errors '+errs.length+(errs.length?' '+errs[0]:''));
    if(!over||worst.ms>4000||errs.length)bad++;await ctx.close()}
  await b.close();console.log(bad?'FAIL':'PASS');process.exit(bad?1:0)})();
