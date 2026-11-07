// UI-only playthrough gate: plays a Quick game and Story stage 1 to the result screen at 390x763, tapping ONLY visible, uncovered UI (every tap is
// checked with elementFromPoint; no engine calls except reading state). Speed is the player's own setting (localStorage), set before load.
//   node play-ui.js [quick|story|both] [WxH]      exit 1 on a stuck game, a console error or a missing result screen.
const PW=(()=>{try{return require('playwright')}catch(e){return require('/opt/node-tools/node_modules/playwright')}})();
const fs=require('fs');const html=fs.readFileSync(__dirname+'/doorkick.html');const localRoute=require('./local-route.js');
const which=process.argv[2]||'both';const [W,H]=(process.argv[3]||'390x763').split('x').map(Number);const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const SHOT=process.env.SHOTS||'/tmp/claude-0/s';const probs=[];const note=m=>{if(probs.length<30)probs.push(m)};
async function tapSel(p,sels,why){return p.evaluate(sels=>{const vis=e=>{const r=e.getBoundingClientRect();return r.width>8&&r.height>8&&r.left>=0&&r.right<=innerWidth+1&&r.top>=0&&r.bottom<=innerHeight+1};
    for(const s of sels){for(const e of document.querySelectorAll(s)){if(!vis(e)||e.disabled)continue;const r=e.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,hit=document.elementFromPoint(x,y);
      if(hit&&(hit===e||e.contains(hit)||hit.contains(e)))return {x,y,s,t:(e.textContent||'').trim().slice(0,30)}}}return null},sels).then(async r=>{if(r){await p.touchscreen.tap(r.x,r.y)}return r})}
async function game(p,tag,maxMs){const t0=Date.now();let last='',lastT=Date.now(),taps=0,shots=0;
  while(Date.now()-t0<maxMs){
    const st=await p.evaluate(()=>({w:!!(G&&G.winner),ph:G&&G.phase,turn:G&&G.turn,act:G&&G.active,sig:G?JSON.stringify([G.phase,G.turn,G.active,G.ln,G.cb&&G.cb.stage,G.q&&G.q.kind]):''}));
    if(st.w){await sleep(1200);return {ok:true,turns:st.turn,taps}}
    if(st.sig!==last){last=st.sig;lastT=Date.now()}
    if(Date.now()-lastT>30000){note(tag+': stuck 30 s in phase '+st.ph+' turn '+st.turn);await p.screenshot({path:SHOT+'/stuck-'+tag+'.png'});return {ok:false}}
    // one thing at a time: the order a newcomer would try
    const r=await tapSel(p,['.gxh-ok','.gx-drawer.open [data-a="close"]','#dkCard [data-a="close"]','#modal .btn.primary:not([data-start])','[data-a="autocharity"]','.fbtns .fightb','[data-a="autoplay"]','.fbtns .runb','[data-a="bfkick"]','#prompt .btn.primary','#prompt .acts button','#prompt .opt','#prompt button']);
    if(r){taps++;if(taps%40===1&&shots<3){shots++;await p.screenshot({path:SHOT+'/play-'+tag+'-'+shots+'.png'})}}
    await sleep(r?350:250)}
  note(tag+': no result within '+Math.round(maxMs/1000)+' s');return {ok:false}}
async function fresh(b){const ctx=await b.newContext({viewport:{width:W,height:H},isMobile:true,hasTouch:true});await localRoute(ctx,html);const p=await ctx.newPage();p.setDefaultTimeout(15000);
  p.on('pageerror',e=>note('PAGE ERROR '+e.message));p.on('console',m=>{const t=m.text();if(m.type()==='error'&&!/net::|Failed to load|favicon/.test(t))note('console error '+t.slice(0,160))});
  await p.goto('https://gns.test/?phone=1');await sleep(800);await p.evaluate(()=>{try{localStorage.clear();localStorage.setItem('dkd_speed4','4')}catch(e){}});await p.reload();await sleep(1200);return {ctx,p}}
(async()=>{const b=await PW.chromium.launch({args:['--no-sandbox']});
  if(which==='quick'||which==='both'){const {ctx,p}=await fresh(b);
    let r=await tapSel(p,['[data-a="quick"]']);if(!r)note('quick: no Quick game button');await sleep(500);
    r=await tapSel(p,['[data-start="F"]']);if(!r)note('quick: Start button not visible/tappable without scrolling');await sleep(1200);
    // the first-time offer, if any: "Just play"
    await tapSel(p,['#tutoffer [data-tutoffer=play]']);await sleep(500);
    const g=await game(p,'quick',420000);console.log('quick',g.ok?'PASS':'FAIL',JSON.stringify(g));
    if(g.ok){const e=await p.evaluate(()=>{const m=document.getElementById('modal');return !m.hidden&&/Victory|wins|reaches level|Level/.test(m.innerText)});if(!e)note('quick: no result screen');await p.screenshot({path:SHOT+'/result-quick.png'})}
    await ctx.close()}
  if(which==='story'||which==='both'){const {ctx,p}=await fresh(b);
    let r=await tapSel(p,['[data-a="story"]']);if(!r)note('story: no Story button');await sleep(900);
    // the prologue (the tutorial) may start first: Skip it with the visible Skip button
    for(let k=0;k<6;k++){const sk=await tapSel(p,['.gxt-skip','.gxt-end [data-gxt-dlg=exit]']);if(sk){await sleep(600);continue}break}
    await sleep(600);
    let started=false;for(let k=0;k<14&&!started;k++){started=await p.evaluate(()=>!!G&&!G.tut&&G.phase==='setup'&&!!UI.cmp);if(started)break;
      const t=await tapSel(p,['.gxc-node.open.next','.gxc-btn.go','.gxc-chap-go','.gxc-card:not(.locked) .gxc-btn','[data-gxc-play]','.gxc-btn.ghost','.gxc-btn']);await sleep(700)}
    if(!started){note('story: could not start stage 1 by taps');await p.screenshot({path:SHOT+'/story-start-fail.png'})}
    else{const g=await game(p,'story',420000);console.log('story',g.ok?'PASS':'FAIL',JSON.stringify(g));if(g.ok)await p.screenshot({path:SHOT+'/result-story.png'})}
    await ctx.close()}
  await b.close();console.log(probs.length?'PROBLEMS '+probs.length+'\n  '+probs.join('\n  '):'PROBLEMS 0');process.exit(probs.length?1:0)})();
