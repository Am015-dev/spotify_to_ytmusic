// UI-only player: plays a Quick game (or Story chapter 1) to the result by tapping only visible, uncovered UI. No engine shortcuts.
//   node playbot.js [quick|story] [WxH]   env: URL (served page, ends with /), CHROME, SHOTS=dir to save screens, FRESH=1,
//   SUG=1: a newcomer who always takes the ★ suggested move (the dial opens on it) and the recommended action/target
const PW=(()=>{try{return require('/opt/node22/lib/node_modules/playwright')}catch(e){return require('../node_modules/playwright')}})();
const fs=require('fs');
const MODE=process.argv[2]||'quick',[W,H]=(process.argv[3]||'390x763').split('x').map(Number);
const URL=process.env.URL,SHOTS=process.env.SHOTS;if(SHOTS)fs.mkdirSync(SHOTS,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const SEL=['[data-ph=x]','[data-bf=brief]','.bfring.need',...(process.env.SUG?['.bfm.sug:not(.danger):not(.set)','.bffing-target']:[]),'.bfm:not(.danger):not(.set)','[data-bf=fly]:not([disabled])','.bfact.rec','.bfact:not(.skip)','.bftgt','.bfm.w','#bfbtns [data-bfq=ok]','#bfbtns .btn.primary:not([disabled])','.bfspot.rec','[data-a=autoplace]'];
(async()=>{const b=await PW.chromium.launch({executablePath:process.env.CHROME||undefined,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const mob=W<700;const ctx=await b.newContext({viewport:{width:W,height:H},hasTouch:mob,isMobile:mob});const p=await ctx.newPage();p.setDefaultTimeout(20000);
 const errs=[];p.on('pageerror',e=>errs.push('PAGE '+e.message));p.on('console',m=>{const t=m.text();if(m.type()==='error'&&!/net::|Failed to load|favicon|fonts\.g/.test(t))errs.push('console '+t.slice(0,150))});
 await p.goto(URL+(mob?'?phone=1':''));await p.waitForSelector('[data-start]',{timeout:30000});
 await p.evaluate(()=>{try{localStorage.clear();localStorage.setItem('na_played','1');localStorage.setItem('gxt-nebula-aces',JSON.stringify({done:true,seen:true}))}catch(e){}});
 await p.reload();await p.waitForSelector('[data-start]',{timeout:30000});await sleep(800);
 const tap=async(x,y)=>mob?p.touchscreen.tap(x,y):p.mouse.click(x,y);
 // returns the centre of the first visible element of a selector, only if elementFromPoint there is that element (uncovered)
 const find=(sel)=>p.evaluate(sel=>{for(const e of document.querySelectorAll(sel)){const r=e.getBoundingClientRect();if(r.width<4||r.height<4||getComputedStyle(e).visibility==='hidden')continue;const x=r.left+r.width/2,y=r.top+r.height/2;if(x<0||y<0||x>innerWidth||y>innerHeight)continue;const t=document.elementFromPoint(x,y);if(t&&(t===e||e.contains(t)))return [x,y,sel]}return null},sel);
 const shot=async n=>{if(SHOTS)await p.screenshot({path:SHOTS+'/'+n+'-'+W+'.png'})};
 await shot('title');
 let startSel=MODE==='story'?'[data-a=story]':'[data-start=solo]';
 let c=await find(startSel);if(!c){console.log('FAIL no start button');process.exit(1)}await tap(c[0],c[1]);await sleep(1200);
 const seen=new Set();const named={};let last0='';let last='',lastT=Date.now(),taps=0,over=false,uncovered=0;
 for(let i=0;i<4000&&!over;i++){
  const st=await p.evaluate(()=>({over:!!(typeof G!=='undefined'&&G&&G.winner),ph:G&&G.phase,r:G&&G.round,hint:(document.getElementById('bfhint')||{}).textContent||'',ban:(document.getElementById('bfban')||{}).hidden===false?document.getElementById('bfban').textContent:'',sc:!!document.querySelector('.gxc:not([hidden])')&&!(typeof G!=='undefined'&&G&&G.phase&&!G.winner&&!document.querySelector('.gxc-scene-on,.gxc-sheet,.gxc-screen,.gxc-road')),key:typeof BF!=='undefined'?BF.key:''}));
  if(st.over){await sleep(1500);await shot('result');over=true;break}
  const sig=JSON.stringify([st.ph,st.r,st.hint,st.ban,st.key,taps]);if(sig!==last){last=sig;lastT=Date.now();for(const k of [st.hint.replace(/\d+/g,'#').slice(0,40)]){if(!seen.has(k)){seen.add(k);if(SHOTS&&seen.size<=24)await shot('s'+String(seen.size).padStart(2,'0'))}}}
  if(SHOTS&&sig!==last0){last0=sig;for(const [n,re] of [['first-turn',/Tap your ship/],['rival-turn',/Rival/]])if(!named[n]&&re.test(st.hint)){named[n]=1;await sleep(500);await shot(n)}}
  else if(Date.now()-lastT>15000){console.log('FAIL stuck',JSON.stringify(st));await shot('stuck');break}
  let done=false;
  if(st.sc){let g=null;for(const q of ['.gxc-btn.go','.gxc-node.open.next']){g=await find(q);if(g)break}if(g){await tap(g[0],g[1]);taps++;done=true}}
  if(!done)for(const sel of SEL){const q=await find(sel);if(q){await tap(q[0],q[1]);taps++;done=true;await sleep(120);break}}
  if(!done)await sleep(250)}
 const res=await p.evaluate(()=>({w:G&&G.winner,round:G&&G.round,tut:G&&G.tut}));
 console.log(over?'PASS':'FAIL',MODE,W+'x'+H,'taps',taps,JSON.stringify(res),'errors',errs.length,errs.slice(0,3).join(' | '));
 await b.close();process.exit(over&&!errs.length?0:1)})();
