// Screenshots for the rework report: title, setup, every guided step (first time each appears), mid-game of a normal game, the end card.
// node shots-rework.js [WxH,...] [outdir]   (Playwright; real clicks on the pinned action row / cards; falls back to the suggested move if a step stalls)
const PW=require('playwright');const fs=require('fs'),path=require('path');
const html=fs.readFileSync(__dirname+'/thornbound.html');const SIZES=(process.argv[2]||'390x763,375x553,844x390,1366x768').split(',');const OUT=process.argv[3]||path.join(__dirname,'shots','rework');
(async()=>{const b=await PW.chromium.launch({executablePath:'/opt/pw-browsers/chromium'});let errsAll=0;
for(const sz of SIZES){const [W,H]=sz.split('x').map(Number);const ph=Math.min(W,H)<500;const dir=path.join(OUT,sz);fs.mkdirSync(dir,{recursive:true});
 const ctx=await b.newContext({viewport:{width:W,height:H},isMobile:ph,hasTouch:ph});
 await ctx.route('**/*',r=>new URL(r.request().url()).host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto('https://gns.test/'+(ph?'?phone=1':''));await p.waitForTimeout(1500);await p.evaluate(()=>{try{localStorage.clear()}catch(e){}showStart()});
 let n=0;const shot=async t=>{await p.waitForTimeout(250);await p.screenshot(process.env.JPG?{path:path.join(dir,String(n++).padStart(2,'0')+'_'+t+'.jpg'),type:'jpeg',quality:70}:{path:path.join(dir,String(n++).padStart(2,'0')+'_'+t+'.png')})};
 await shot('title');await p.click('#start [data-a=play]');await p.waitForTimeout(300);await shot('setup');
 if(await p.locator('#start [data-a=cfgopen]').count()){await p.click('#start [data-a=cfgopen]');await shot('configure');await p.click('#start .cfgfoot [data-a=cfgclose]')}
 await p.evaluate(()=>{AIDELAY=0;ANIM=0});await p.click('#start [data-a=guided]');await p.waitForTimeout(500);
 const seen={};let last='',same=0;
 for(let i=0;i<900;i++){const st=await p.evaluate(()=>({k:G.q&&G.q.kind,t:G.q&&G.q.t,ti:G.q&&G.q.title,card:UI.card&&UI.card.kind,ev:UI.card&&UI.card.ev&&UI.card.ev.t,co:UI.coachInfo&&UI.coachInfo.id,over:!!G.over,s:viewSeatForQ(),r:G.round,ln:G.logN}));
  const key=st.co?'coach-'+st.co:st.card?(st.card+(st.ev?'-'+st.ev:'')):('q-'+st.k+(st.t==='menu'?'-'+((st.ti||'').match(/Spring|Day|Autumn/)||[''])[0]:''));
  const sk=(st.r<=1||st.co||st.card==='over'?'r'+st.r+'-':'')+key;if(!seen[sk]){seen[sk]=1;await shot('r'+st.r+'_'+key)}
  if(st.card==='over')break;
  const sig=JSON.stringify(st);if(sig===last)same++;else{same=0;last=sig}
  if(same>2){await p.evaluate(()=>{closePop(true);const s=viewSeatForQ();if(s!=null){const mv=legal(s);const r=UI._rec||suggest(s);humanMove(((r&&mv.find(x=>x.k===r.k))||mv[0]).k)}else pump()});continue}
  await p.evaluate(()=>{const b=document.querySelector('#pc:not([hidden]) .cd-ft .btn.pri:not([hidden])')||document.querySelector('#act .btn.pulse')||document.querySelector('#act .btn.pri');if(b)b.click()});
  await p.waitForTimeout(40)}
 // mid-game of a normal 3-player game (round 2, with the hand and a decision)
 await p.evaluate(()=>{newGame('me',{np:3,seed:11,faction:'uprising'})});
 for(let i=0;i<400;i++){const st=await p.evaluate(()=>({r:G.round,k:G.q&&G.q.kind,s:viewSeatForQ(),c:UI.card&&UI.card.kind}));if(st.r>=2&&st.k==='place'&&st.s!=null&&!st.c)break;
  await p.evaluate(()=>{if(UI.coachInfo)return coachOk();if(UI.card){const b=document.querySelector('#pc .cd-ft .btn.pri');if(b)b.click();return}const s=viewSeatForQ();if(s!=null){const mv=legal(s);const r=UI._rec||suggest(s);humanMove(((r&&mv.find(x=>x.k===r.k))||mv[0]).k)}})}
 await shot('midgame-3p');
 console.log(sz,'shots',n,'errors',errs.length,errs.slice(0,3).join(' | '));errsAll+=errs.length;await ctx.close()}
await b.close();console.log('ERRORS',errsAll)})();
