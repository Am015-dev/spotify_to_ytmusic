// W457: plays a Quick game to the result by DRAG at 390x763: every worker move drags a meeple from the top bar onto the place,
// every hand card is dragged up into the city; everything else (choices, meadow cards, Prepare/Pass) is a tap. Mouse pointer, real events.
// Based on play-ui.js (tap version).   node play-drag.js [touch]   (touch = real touch events at 390x844, isMobile)
// Where to tap comes from the game's own hint (UI.rec -> the element the ghost finger points at) and the visible buttons of cards/dialogs;
// no engine calls make moves. Only the AI pause is shortened (Speed: Fast). Prints only PASS/FAIL.   node play-ui.js [quick|story|both]
const PW=require('/home/user/spotify_to_ytmusic/games-src/node_modules/playwright');
const fs=require('fs');const html=fs.readFileSync(__dirname+'/hollowbough.html');
const which='quick',TOUCH=process.argv[2]==='touch';const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function game(b,kind){const probs=[];const t0=Date.now();
  const ctx=await b.newContext(TOUCH?{viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1}:{viewport:{width:390,height:763},deviceScaleFactor:1});
  await ctx.route('**/*',r=>new URL(r.request().url()).host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
  const p=await ctx.newPage();p.setDefaultTimeout(6000);
  p.on('pageerror',e=>probs.push('page error '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/net::|Failed to load|favicon/.test(m.text()))probs.push('console '+m.text().slice(0,140))});
  await p.goto('https://gns.test/');await sleep(600);await p.evaluate(()=>{localStorage.clear();localStorage.setItem('hb_played','1');localStorage.setItem('hb_offer','1');localStorage.setItem('gxt-hollowbough',JSON.stringify({done:1}))});await p.reload();await sleep(900);
  const tapEl=async sel=>{const r=await p.evaluate(sel=>{const e=document.querySelector(sel);if(!e)return null;const b=e.getBoundingClientRect();if(b.width<4)return null;const x=b.left+b.width/2,y=b.top+b.height/2;const t=document.elementFromPoint(x,y);return{x,y,ok:!!t&&(e===t||e.contains(t)||t.contains(e))}},sel);if(!r)return false;if(!r.ok){probs.push('covered: '+sel);return false}await tapAt(r.x,r.y);return true};
  const cdp=TOUCH?await ctx.newCDPSession(p):null;const tch=(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y}]});
  const tapAt=async(x,y)=>TOUCH?p.touchscreen.tap(x,y):p.mouse.click(x,y);
  const down=async(x,y)=>TOUCH?tch('touchStart',x,y):(p.mouse.move(x,y),p.mouse.down());const mv=async(x,y)=>TOUCH?tch('touchMove',x,y):p.mouse.move(x,y);const up=async(x,y)=>TOUCH?tch('touchEnd',x,y):p.mouse.up();
  await p.evaluate(()=>{AIDELAY=120});
  if(kind==='quick'){await tapEl('[data-a="opt"][data-k="mode"][data-v="vs"], .chipb:has-text("vs computer")').catch(()=>{});await tapEl('[data-start="play"], .sbtn.big');}
  else{await p.touchscreen.tap(...(await p.evaluate(()=>{const e=[...document.querySelectorAll('.chipb')].find(x=>/Story/.test(x.textContent));const r=e.getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2]})));await sleep(300);await tapEl('.sbtn.big');await sleep(900);await tapEl('.gxc-node.open');await sleep(600);}
  await sleep(1200);let idle=0,taps=0,drags=0,over=false;
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
    if(s.kind==='btn'||s.kind==='move'){idle=0;if(s.cov===false&&s.kind==='move'){probs.push('target covered '+s.tg)}
      const dg=s.kind==='move'&&/^(w:|p:hand:)/.test(s.tg||'')?await p.evaluate(tg=>{const m=document.querySelector(tg[0]==='w'?'#bd .pv-meeple.can':'#bd .hc[data-t="'+tg+'"]');if(!m)return null;const r=m.getBoundingClientRect();const hs=document.querySelector('#bd .strip.hand').getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2,ty:hs.top-80}},s.tg):null;
      if(dg){const tx=s.tg[0]==='w'?s.q.x:dg.x,ty=s.tg[0]==='w'?s.q.y:dg.ty;
        if(s.tg[0]==='w'){await p.evaluate(()=>pvSetTab('places',true));const q2=await p.evaluate(tg=>{const e=UI.tgEls[tg];if(!e)return null;hscrollTo(e);const r=e.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}},s.tg);if(q2){s.q=q2}}
        await down(dg.x,dg.y);let lx=dg.x,ly=dg.y;for(let k=1;k<=8;k++){lx=dg.x+((s.tg[0]==='w'?s.q.x:tx)-dg.x)*k/8;ly=dg.y+((s.tg[0]==='w'?s.q.y:ty)-dg.y)*k/8;await mv(dg.x+((s.tg[0]==='w'?s.q.x:tx)-dg.x)*k/8,dg.y+((s.tg[0]==='w'?s.q.y:ty)-dg.y)*k/8);await sleep(16)}await up(lx,ly);drags++;}
      else await tapAt(s.q.x,s.q.y);taps++;if(process.env.DBG&&taps%15===0){console.error(taps,JSON.stringify(await p.evaluate(()=>({n:G.logN,t:G.turn,ph:G.phase,q:G.q&&G.q.kind,seat:HB.actor(G),pc:UI.cards[0]&&UI.cards[0].kind,sel:!!UI.sel,res:G.players[0].res,w:G.players[0].workers,dep:G.players[0].dep.length,se:G.players[0].season,rec:UI.rec&&UI.rec.m&&UI.rec.m.label}))))}await sleep(s.kind==='btn'?350:550);}
    else{idle++;await sleep(300);if(idle>60){probs.push('stuck: '+JSON.stringify(s).slice(0,120));break}}
  }
  const fin=await p.evaluate(()=>({over:!!(G&&G.phase==='over'),res:G&&G.over?G.over.scores.map(x=>x.total):null,camp:!!UI.camp}));
  if(!over&&!fin.over)probs.push('no result screen');if(drags<10)probs.push('too few drags '+drags);
  await p.screenshot({path:__dirname+'/../playtest/drag'+(TOUCH?'-touch-':'-')+kind+'-end.png'});
  console.log((probs.length?'FAIL ':'PASS ')+kind+' game by '+(TOUCH?'touch drag 390x844':'mouse drag 390x763')+' drags='+drags+' taps='+taps+' scores='+JSON.stringify(fin.res)+' '+Math.round((Date.now()-t0)/1000)+'s '+probs.slice(0,4).join(' | '));
  await ctx.close();return probs.length}
(async()=>{const b=await PW.chromium.launch();let bad=0;if(which!=='story')bad+=await game(b,'quick');if(which!=='quick')bad+=await game(b,'story');await b.close();process.exit(bad?1:0)})();
