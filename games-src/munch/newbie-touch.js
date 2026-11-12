// Newcomer touch run (real page, phone size): taps a glowing hand card, then a glowing spot; half the time the game's marked move
// (★/pulsing button or the suggested card); otherwise a random visible button. Prints final levels, winner, minutes, decisions.
//   NODE_PATH=/opt/node-tools/node_modules node newbie-touch.js [games=4] [WxH=390x844] [seed=1] [fast=1]
const { chromium } = require('playwright');const gx = require('../scripts/gx-serve.js');const sleep = ms => new Promise(r => setTimeout(r, ms));
const MAXM=+process.env.NBMIN||0;const N=+process.argv[2]||4,[W,H]=(process.argv[3]||'390x844').split('x').map(Number),S0=+process.argv[4]||1,FAST=process.argv[5]!=='0';
(async()=>{const URL=await gx.url('doorkick-dungeon',{file:__dirname+'/doorkick.html'});const b=await chromium.launch();let rr=S0*977;const rand=n=>{rr=(rr*1103515245+12345)%2147483648;return (rr>>>16)%n};// high bits: the low bits of this generator repeat every few calls, which locked the driver into wear/take-off loops in 'post'
 const res=[];for(let g=0;g<N;g++){const ctx=await b.newContext({viewport:{width:W,height:H},isMobile:true,hasTouch:true});const page=await ctx.newPage();const errs=[];
  page.on('pageerror',e=>errs.push(e.message));page.on('console',m=>m.type()==='error'&&!/ERR_|Failed to load|net::/.test(m.text())&&errs.push(m.text()));
  await page.goto(URL);await page.evaluate(()=>{localStorage.clear()});await page.reload();await sleep(600);
  await page.evaluate(([s,f,fa])=>{setSeed(s);UI.fast=fa;if(f){AIDELAY=60;UI.speed=4}},[S0*100+g,FAST,process.env.NBFAST!=='0']);
  let myTref={v:0};const tapSel=async sel=>{myTref.v=Date.now();const r=await page.evaluate(sel=>{const e=document.querySelector(sel);if(!e)return null;{const b0=e.getBoundingClientRect();if((b0.right>innerWidth||b0.left<0)&&typeof dkReveal==='function')dkReveal(e)}const b=e.getBoundingClientRect();return {x:b.x+b.width/2,y:b.y+b.height/2}},sel);if(!r)return false;await page.touchscreen.tap(r.x,r.y);return true};
  await page.evaluate(()=>{if(!document.querySelector('#modal [data-start="F"]')){UI.quick=true;render()}});await tapSel('#modal [data-start="F"]');await sleep(800);if(await tapSel('#tutoffer [data-tutoffer=play]'))await sleep(800);
  for(let k=0;k<6;k++){const sel=await page.evaluate(()=>{if(document.getElementById('modal').hidden)return null;const bs=[...document.querySelectorAll('#modal button')];const e=bs.find(b=>/just play/i.test(b.textContent))||bs.find(b=>/^(start|play|got it|ok|let)/i.test(b.textContent.trim()));if(e){e.setAttribute('data-nb0','1');return '[data-nb0]'}return null});if(!sel)break;await tapSel(sel);await page.evaluate(()=>document.querySelectorAll('[data-nb0]').forEach(e=>e.removeAttribute('data-nb0')));await sleep(400)}
  if(process.env.NBSHOT)await page.screenshot({path:process.env.NBSHOT+'/start-'+g+'.png'});
  const t0=Date.now();let dec=0,fol=0,stuck=0,lastSig='';let rvA=-1,rvT=0,rvMax=0,myT=0,waitMax=0;const FOL=process.env.NBFOL!=null?+process.env.NBFOL:0.5;
  while(Date.now()-t0<(MAXM||(FAST?6:25))*60000){await sleep(FAST?60:150);
   const st=await page.evaluate(()=>{if(typeof G==='undefined'||!G||!G.pl)return {none:1};if(G.winner)return {win:G.winner};const s=sideToAct();
     const vis=e=>{const b=e.getBoundingClientRect();if(b.width<2||b.height<2||b.bottom<0||b.top>innerHeight||b.right<0||b.left>innerWidth)return false;const t=document.elementFromPoint(Math.min(innerWidth-1,Math.max(0,b.x+b.width/2)),Math.min(innerHeight-1,Math.max(0,b.y+b.height/2)));return !!t&&(e===t||e.contains(t)||t.contains(e))};
     const mark=(e,i)=>{e.setAttribute('data-nb',i);if(e.dataset.card&&e.closest('.mine'))return '.mine '+(e.classList.contains('gchip')?'.gchip':'.card')+'[data-card="'+e.dataset.card+'"]';if(e.dataset.bfz){const all=[...document.querySelectorAll('[data-bfz="'+e.dataset.bfz+'"]')];return '[data-bfz="'+e.dataset.bfz+'"]'+(all.length>1?'':'')}if(e.dataset.mv)return '[data-mv=\''+e.dataset.mv+'\']';return '[data-nb="'+i+'"]'};let i=0;document.querySelectorAll('[data-nb]').forEach(e=>e.removeAttribute('data-nb'));
     const modal=[...document.querySelectorAll('#dkgoal button,#tutoffer [data-tutoffer=play]')].filter(vis).map(e=>mark(e,i++)).concat(!document.getElementById('modal').hidden?[...document.querySelectorAll('#modal button')].filter(vis).map(e=>mark(e,i++)):[]);
     const pop=GX.open?[...document.querySelectorAll('#'+GX.open+' [data-mv],#'+GX.open+' .opt')].filter(vis).map(e=>mark(e,i++)):[];
     const rec=[...document.querySelectorAll('.bf-best,.opt.rec')].filter(vis).map(e=>mark(e,i++));
     const glow=[...document.querySelectorAll('.mine .hand .card.play:not(.bf-no),.mine .gear .gchip.play')].map(e=>mark(e,i++));
     const btn=[...document.querySelectorAll('#prompt button:not(:disabled),.gx-dock button[data-mv]:not(:disabled),.gx-dock button[data-a]:not(:disabled),.arena button:not(:disabled)')].filter(vis).filter(e=>!/menu|rules|help|bulb|sound|music|skip|quit|speed|sell/i.test((e.id||'')+e.className+(e.dataset.a||'')+(e.dataset.mv||''))).map(e=>mark(e,i++));
     const tgt=[...document.querySelectorAll('[data-bfz]')].filter(vis).map(e=>mark(e,i++));
     return {s,act:G.active,open:GX.open,me:s===0,modal,pop,rec,glow,btn,tgt,sig:G.ln+'|'+G.phase+'|'+(G.q&&G.q.kind)+'|'+(G.cb&&G.cb.stage),lv:P(0).lvl}});
   if(st.none)continue;if(st.win)break;{const now=Date.now();if(st.act!==rvA){if(rvA>0)rvMax=Math.max(rvMax,now-rvT);rvA=st.act;rvT=now;myT=now}if(myTref.v>myT)myT=myTref.v;if(st.act===0){if(st.me&&!st.open&&(st.glow.length||st.btn.length||st.tgt.length||st.rec.length)){waitMax=Math.max(waitMax,now-myT)}}}if(process.env.NBLOG&&stuck>150&&stuck%50===1)console.log(await page.evaluate(()=>{const e=document.querySelector('.bf-best');return [...document.querySelectorAll('.bf-best,.opt.rec')].map(x=>x.className.slice(0,40)).join('|')+' line='+document.querySelector('#prompt .bfline').textContent+' rec='+JSON.stringify(coach(0).rec)+' '+(e?e.outerHTML.slice(0,60):'')+' pick='+BF.pick+' open='+GX.open+' hand='+P(0).hand.length+' vm='+JSON.stringify(validMoves(0).slice(0,6))}));if(process.env.NBLOG&&dec%25===0&&st.me)console.log('t',((Date.now()-t0)/1000|0),st.sig,'lv',st.lv,'glow',st.glow.length,'btn',st.btn.length,'rec',st.rec.length,'tgt',st.tgt.length);
   if(st.modal.length){await tapSel(st.modal[st.modal.length-1]);continue}
   if(st.pop.length){await tapSel(st.pop[0]);continue}
   if(st.open){await tapSel('#'+st.open+' .gx-x')||await page.keyboard.press('Escape');await sleep(200);continue}
   if(!st.me){continue}
   if(st.sig===lastSig){stuck++;if(stuck>400){errs.push('stuck '+st.sig);break}}else{stuck=0;lastSig=st.sig}
   if(st.tgt.length){await tapSel(st.tgt[rand(st.tgt.length)]);await sleep(150);continue}
   dec++;if(st.rec.length&&rand(1000)<FOL*1000){fol++;await tapSel(st.rec[0]);await sleep(150);continue}
   const pool=st.glow.length+st.btn.length;if(!pool)continue;const k=rand(pool);
   if(k<st.glow.length){await tapSel(st.glow[k]);await sleep(200)}else{await tapSel(st.btn[k-st.glow.length]);await sleep(150)}}
  const fin=await page.evaluate(()=>typeof G==='undefined'||!G?{}:({w:G.winner,co:G.cowin,turn:G.turn,lv:G.pl.map(p=>p.lvl),cur:P(0).st.cursed,kills:P(0).st.kills,str:pStr(P(0)),lvs:G.pl.map(p=>p.lv).join(',')}));
  fin.min=((Date.now()-t0)/60000).toFixed(1);fin.rivalMaxS=(rvMax/1000).toFixed(1);fin.waitMaxS=(waitMax/1000).toFixed(1);fin.dec=dec;fin.fol=fol;fin.err=errs.slice(0,2);res.push(fin);console.log(JSON.stringify(fin));await ctx.close()}
 const wins=res.filter(r=>r.w==='P1'||r.co===0).length;console.log(`${W}x${H} games ${res.length} newcomer wins ${wins} avg lv ${(res.reduce((a,r)=>a+r.lv[0],0)/res.length).toFixed(1)}`);await b.close();gx.close&&gx.close();process.exit(0)})();
