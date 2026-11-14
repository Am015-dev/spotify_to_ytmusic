// Plays a Quick game and Story stage 1 to the result by REAL touch taps at 390x763 only on visible, uncovered UI.
// Where to tap comes from the game's own hint (UI.rec -> the element the ghost finger points at) and the visible buttons of cards/dialogs;
// no engine calls make moves. Only the AI pause is shortened (Speed: Fast). Prints only PASS/FAIL.   node play-ui.js [quick|story|both] [390x844,375x667]
// Every 6 taps (and on each new dialog) textcheck.js checks every visible text: contrast >= 4.5:1 and no cut words. Real media are served from games/hollowbough.
const PW=(()=>{try{return require('playwright')}catch(e){return require('/opt/node-tools/node_modules/playwright')}})();const textcheck=require('./textcheck.js');
const fs=require('fs');const html=fs.readFileSync(__dirname+'/hollowbough.html');
const which=process.argv[2]||'both';const SIZES=(process.argv[3]||'390x844,375x667').split(',').map(z=>z.split('x').map(Number));const GD=__dirname+'/../../../games/hollowbough/';const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function game(b,kind,W,H){const probs=[];const t0=Date.now();
  const ctx=await b.newContext({viewport:{width:W,height:H},isMobile:true,hasTouch:true,deviceScaleFactor:1});
  await ctx.route('**/*',r=>{const u=new URL(r.request().url());if(u.host!=='gns.test')return r.abort();if(u.pathname==='/')return r.fulfill({status:200,contentType:'text/html',body:html});const f=GD+decodeURIComponent(u.pathname.slice(1));return fs.existsSync(f)?r.fulfill({status:200,path:f}):r.fulfill({status:404,body:''})});
  const p=await ctx.newPage();p.setDefaultTimeout(6000);
  p.on('pageerror',e=>probs.push('page error '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/net::|Failed to load|favicon/.test(m.text()))probs.push('console '+m.text().slice(0,140))});
  await p.goto('https://gns.test/');await sleep(600);await p.evaluate(()=>{localStorage.clear();localStorage.setItem('hb_played','1');localStorage.setItem('hb_offer','1');localStorage.setItem('gxt-hollowbough',JSON.stringify({done:1}))});await p.reload();await sleep(900);
  const tapEl=async sel=>{const r=await p.evaluate(sel=>{const e=document.querySelector(sel);if(!e)return null;const b=e.getBoundingClientRect();if(b.width<4)return null;const x=b.left+b.width/2,y=b.top+b.height/2;const t=document.elementFromPoint(x,y);return{x,y,ok:!!t&&(e===t||e.contains(t)||t.contains(e))}},sel);if(!r)return false;if(!r.ok){probs.push('covered: '+sel);return false}await p.touchscreen.tap(r.x,r.y);return true};
  const tapAt=async(x,y)=>p.touchscreen.tap(x,y);
  if(!process.env.REAL)await p.evaluate(()=>{AIDELAY=120});let w0=0,wmax=0,wseason='';
  if(kind==='quick'){await tapEl('[data-a="opt"][data-k="mode"][data-v="vs"], .chipb:has-text("vs computer")').catch(()=>{});await tapEl('[data-start="play"], .sbtn.big');}
  else{await p.touchscreen.tap(...(await p.evaluate(()=>{const e=[...document.querySelectorAll('.chipb')].find(x=>/Story/.test(x.textContent));const r=e.getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2]})));await sleep(300);await tapEl('.sbtn.big');await sleep(900);await tapEl('.gxc-node.open');await sleep(600);}
  await sleep(1200);let idle=0,taps=0,over=false;const seenT=new Set();
  while(Date.now()-t0<280000){
    const s=await p.evaluate(()=>{
      const vis=e=>{if(!e)return false;const r=e.getBoundingClientRect();return r.width>4&&r.height>4&&!e.closest('[hidden]')&&getComputedStyle(e).visibility!=='hidden'};
      const pt=e=>{const r=e.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}};
      const cover=(e,q)=>{const t=document.elementFromPoint(q.x,q.y);return !!t&&(e===t||e.contains(t)||t.contains(e))};
      const out={over:!!(G&&G.phase==='over'),busy:!!(UI.animBusy)};
      // 1) open dialogs/cards/overlays: press their first visible button
      const pcs=[...document.querySelectorAll('#pc:not([hidden]) .cbtns .btn, .gxc-btn.go')].filter(vis);
      if(UI.cards[0]&&UI.cards[0].kind==='over'&&document.querySelector('#pc:not([hidden])'))return Object.assign(out,{kind:'done'});
      if(pcs.length){const e=pcs[0];const q=pt(e);return Object.assign(out,{kind:'btn',q,cov:cover(e,q),txt:e.textContent.trim().slice(0,24),pc:!!document.querySelector('#pc:not([hidden])')})}
      if(!G||!UI.started)return Object.assign(out,{kind:'none'});
      if(UI.animBusy||G.phase==='over')return Object.assign(out,{kind:'wait'});
      const a=HB.actor(G);if(G.players[a].ai)return Object.assign(out,{kind:'wait'});
      try{computeRec(true)}catch(e){}
      if(!UI.rec||!UI.rec.m)return Object.assign(out,{kind:'norec'});
      let tg=tgOf(UI.rec.m);if(UI.sel){const i=UI.sel.ms.findIndex(x=>sameM(x,UI.rec.m));tg=i>=0?'o:'+i:'x';}
      let el=UI.tgEls&&UI.tgEls[tg];if(!el&&G.q){el=UI.tgEls['q:'+UI.rec.m.i]}
      if(!el)return Object.assign(out,{kind:'noel',tg});
      hscrollTo(el);const b0=el.getBoundingClientRect();let q=null;
      for(const fy of [.5,.35,.65,.2,.8])for(const fx of [.5,.2,.8,.35,.65,.1,.9]){const x=b0.left+b0.width*fx,y=b0.top+b0.height*fy;if(x<0||y<0||x>innerWidth||y>innerHeight)continue;const t=document.elementFromPoint(x,y);if(t&&(el===t||el.contains(t))){q={x,y};break}if(q)break}
      if(!q)return Object.assign(out,{kind:'move',q:{x:b0.left+b0.width/2,y:b0.top+b0.height/2},cov:false,tg});
      return Object.assign(out,{kind:'move',q,cov:true,tg});
    }).catch(e=>({kind:'err',e:e.message}));
    if(s.kind==='done'||(s.over&&s.kind==='wait')){over=true;break}
    if(s.kind==='btn'&&s.cov===false)probs.push('button covered: '+s.txt);
    if(s.kind==='wait'){if(!w0)w0=Date.now()}else if(w0&&(s.kind==='btn'||s.kind==='move')){const w=Date.now()-w0;if(w>wmax){wmax=w;wseason=await p.evaluate(()=>['Winter','Spring','Summer','Autumn'][G.players[0].season]||'').catch(()=>'')}w0=0}
    if(s.kind==='btn'||s.kind==='move'){idle=0;if(s.cov===false&&s.kind==='move'){probs.push('target covered '+s.tg)}if(taps%6===0||s.kind==='btn'){const tp=await p.evaluate(textcheck).catch(()=>[]);for(const x of tp)if(!seenT.has(x)){seenT.add(x);probs.push('text: '+x)}}if(process.env.QSHOT){const qk=await p.evaluate(()=>G.q?G.q.kind:'').catch(()=>'');if(qk&&!seenT.has('q'+qk)){seenT.add('q'+qk);await p.screenshot({path:(process.env.SHOTDIR||'/tmp')+'/q-'+W+'-'+qk+'.png'})}}if(process.env.SHOT&&process.env.SHOT.split(',').includes(String(taps)))await p.screenshot({path:(process.env.SHOTDIR||'/tmp')+'/pu-'+kind+'-'+W+'-'+taps+'.png'});await tapAt(s.q.x,s.q.y);taps++;if(process.env.DBG&&taps%15===0){console.error(taps,JSON.stringify(await p.evaluate(()=>({n:G.logN,t:G.turn,ph:G.phase,q:G.q&&G.q.kind,seat:HB.actor(G),pc:UI.cards[0]&&UI.cards[0].kind,sel:!!UI.sel,res:G.players[0].res,w:G.players[0].workers,dep:G.players[0].dep.length,se:G.players[0].season,rec:UI.rec&&UI.rec.m&&UI.rec.m.label}))))}await sleep(s.kind==='btn'?350:550);}
    else{idle++;await sleep(300);if(idle>60){probs.push('stuck: '+JSON.stringify(s).slice(0,120));break}}
  }
  {const tp=await p.evaluate(textcheck).catch(()=>[]);for(const x of tp)if(!seenT.has(x)){seenT.add(x);probs.push('text(result): '+x)}}
  const fin=await p.evaluate(()=>({over:!!(G&&G.phase==='over'),res:G&&G.over?G.over.scores.map(x=>x.total):null,camp:!!UI.camp}));
  if(!over&&!fin.over)probs.push('no result screen');
  await p.screenshot({path:__dirname+'/../playtest/play-'+kind+'-'+W+'-end.png'});
  const minFz=await p.evaluate(()=>window.__minFz||0).catch(()=>0);if(process.env.REAL&&wmax>4000)probs.push('rival wait '+(wmax/1000).toFixed(1)+'s');
  console.log((probs.length?'FAIL ':'PASS ')+kind+' minText='+minFz+'px maxWait='+(wmax/1000).toFixed(1)+'s('+wseason+')'+' game by taps '+W+'x'+H+' taps='+taps+' scores='+JSON.stringify(fin.res)+' '+Math.round((Date.now()-t0)/1000)+'s '+probs.slice(0,process.env.ALL?200:12).join(' | '));
  await ctx.close();return probs.length}
(async()=>{const b=await PW.chromium.launch();let bad=0;for(const [W,H] of SIZES){if(which!=='story')bad+=await game(b,'quick',W,H);if(which!=='quick')bad+=await game(b,'story',W,H);}await b.close();process.exit(bad?1:0)})();
