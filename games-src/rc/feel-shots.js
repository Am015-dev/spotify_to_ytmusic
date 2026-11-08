// Feel-pass shots (BRIEF-GAMEFEEL): title, learn first screen, goal card, first turn, mid-game, rival (island) turn, result.
//   node feel-shots.js [WxH=390x844] [outdir=playable-shots/feel]   Touch taps only on a phone size; reads G only to decide when to shoot.
const PW=require('playwright');const fs=require('fs'),path=require('path');
const [W,H]=(process.argv[2]||'390x844').split('x').map(Number);const OUT=path.join(__dirname,process.argv[3]||'playable-shots/feel');fs.mkdirSync(OUT,{recursive:true});
const html=fs.readFileSync(path.join(__dirname,'shipwreck.html'));const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const br=await PW.chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ph=W<600;const ctx=await br.newContext({viewport:{width:W,height:H},isMobile:ph,hasTouch:true});
 await ctx.route('**/*',r=>{const u=new URL(r.request().url());if(u.host==='swi.test'){if(u.pathname==='/'||u.pathname.endsWith('.html'))return r.fulfill({status:200,contentType:'text/html',body:html});const f=path.join(__dirname,decodeURIComponent(u.pathname));return fs.existsSync(f)?r.fulfill({path:f}):r.fulfill({status:404,body:''})}return r.abort()});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('https://swi.test/');await sleep(800);await p.evaluate(()=>{try{localStorage.clear()}catch(e){}});await p.reload();await sleep(2500);
 const cdp=await ctx.newCDPSession(p);const shot=async n=>{const r=await cdp.send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(OUT,n+'-'+W+'.png'),Buffer.from(r.data,'base64'));console.log('shot',n)};
 const tapSel=async sel=>{const c=await p.evaluate(sel=>{for(const e of document.querySelectorAll(sel)){const r=e.getBoundingClientRect();if(r.width<8||r.height<8||e.disabled)continue;const x=r.left+r.width/2,y=r.top+r.height/2;if(x<0||y<0||x>innerWidth||y>innerHeight)continue;return [x,y]}return null},sel);if(!c)return false;if(ph)await p.touchscreen.tap(c[0],c[1]);else await p.mouse.click(c[0],c[1]);return true};
 await shot('1-title');
 await tapSel('#modal [data-a=start]');await sleep(900);await shot('2-learn');
 await tapSel('.tutoffer [data-tutoffer=play]');await sleep(2500);
 // story intro beats until planning
 for(let i=0;i<40;i++){const st=await p.evaluate(()=>PHO.st);if(st==='plan'||st==='plan2')break;if(!(await tapSel('.gxh-bub .gxh-ok'))&&!(await tapSel('#bf [data-a=next]'))&&!(await tapSel('#bf .btn.go')))await sleep(400);await sleep(400)}
 await sleep(800);await shot('4-first-turn');
 await tapSel('[data-bf=info]');await sleep(900);await shot('3-goal');await tapSel('.gx-drawer .gx-x, .drawer .x, [data-a=close]');await p.keyboard.press('Escape');await sleep(500);
 let rival=false,mid=false,overN=0;const t0=Date.now();
 while(Date.now()-t0<300000){const s=await p.evaluate(()=>({st:PHO.st,r:G.round,over:!!G.over,k:(UI.beats&&UI.beats[Math.max(0,UI.shown|0)]||{}).kind}));
   if(s.over&&(s.st==='over'||++overN>60)){await sleep(2500);await shot('7-result');break}
   if(!rival&&s.st==='story'&&/event|threat|weather|night/.test(s.k||'')){await sleep(300);await shot('6-rival-turn');rival=true}
   if(!mid&&s.r>=4&&(s.st==='plan'||s.st==='plan2')){await sleep(600);await shot('5-mid-game');mid=true}
   let did=false;for(const sel of ['.gxh-bub .gxh-ok','#modal button:not([data-a=new]):not([data-a=rules]):not([data-a=cards]):not([data-a=close])','.bf-opts .opt','#bf [data-a=go][data-force]','#bf [data-a=next]','#bf [data-a=suggest]','#bf .btn.go']){
     if(sel==='#bf [data-a=suggest]'){const need=await p.evaluate(()=>(PHO.st==='plan'||PHO.st==='plan2')&&planProblems().length>0);if(!need)continue}
     if(await tapSel(sel)){did=true;break}}
   if(!did){const g=await p.evaluate(()=>{const e=document.querySelector('#bfglow>*');if(!e)return null;const r=e.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]});if(g){if(ph)await p.touchscreen.tap(g[0],g[1]);else await p.mouse.click(g[0],g[1])}}
   await sleep(did?300:500)}
 console.log('errors',errs.length,errs.slice(0,3).join(' | '));await br.close()})();
