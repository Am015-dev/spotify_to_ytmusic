// node hud.js <tag>  -> shots + HUD inventory at phone/pc of the main screen and each window
const PW=require('/home/user/spotify_to_ytmusic/games-src/node_modules/playwright');const path=require('path'),fs=require('fs');
const {turbo}=require('/home/user/spotify_to_ytmusic/games-src/scripts/turbo.js');
const TAG=process.argv[2]||'before',OUT=process.argv[3]||'/tmp/claude-0/-home-user-spotify-to-ytmusic/dcad2a6d-05f1-5626-8401-f85aceee1c56/scratchpad/shots';fs.mkdirSync(OUT,{recursive:true});
const HTML='/home/user/spotify_to_ytmusic/games-src/carc/game/rampart.html';
(async()=>{const b=await PW.chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const rep={};
for(const [W,H] of [[402,874],[1366,768]]){const tag=W+'x'+H,phone=W<600;
 const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:1,isMobile:phone,hasTouch:true});await turbo(ctx);
 await ctx.addInitScript(()=>{try{localStorage.clear();localStorage.setItem('rv_fast','1')}catch(e){}});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+HTML);await p.waitForFunction(()=>typeof beginGame==='function'&&typeof UI!=='undefined',null,{timeout:20000});
 await p.evaluate(()=>{try{beginGame()}catch(e){}});await p.waitForTimeout(800);
 await p.evaluate(()=>{const g=document.getElementById('goalok');if(g)g.click()});await p.waitForTimeout(400);await p.evaluate(()=>{document.querySelectorAll('.gxh-bub,.gxh-coach,#cbub,.coach').forEach(e=>e.remove())});
 await p.waitForFunction(()=>window.G&&G.cur&&myTurn('place'),null,{timeout:15000}).catch(()=>{});await p.waitForTimeout(400);
 const inv=await p.evaluate(()=>{const out=[];const vis=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>4&&r.height>4&&s.visibility!=='hidden'&&s.display!=='none'&&+s.opacity>0.05&&r.bottom>0&&r.top<innerHeight};
  // leaf HUD items outside #world/#ov: text leaves, buttons, images
  const root=document.getElementById('app');const all=[...document.body.querySelectorAll('button,b,small,span,img,.dot,.pile,#status *,#status,i.fi')];
  for(const e of all){if(e.closest('#world')||e.closest('#modal')||!vis(e))continue;if(e.tagName!=='BUTTON'&&e.closest('button'))continue;
   const t=(e.tagName==='BUTTON'?(e.getAttribute('aria-label')||e.textContent):e.childElementCount?'':e.textContent).trim();
   if(e.tagName==='BUTTON'||t){out.push((e.tagName==='BUTTON'?'[btn] ':'')+(e.id?'#'+e.id+' ':'')+(e.className&&typeof e.className==='string'?'.'+e.className.split(' ')[0]+' ':'')+t.slice(0,40))}}
  return [...new Set(out)]});
 rep[tag]=inv;await p.screenshot({path:path.join(OUT,TAG+'-'+tag+'-main.jpg'),type:'jpeg',quality:70});
 // windows: try every top-bar button that opens something
 const wins=await p.evaluate(()=>[...document.querySelectorAll('#top button,#hudbtns button,[data-win]')].filter(e=>e.getBoundingClientRect().width>4).map(e=>e.id||e.getAttribute('aria-label')));
 for(const id of wins){const sel=await p.evaluate(id=>{const e=document.getElementById(id)||[...document.querySelectorAll('#top button,#hudbtns button,[data-win]')].find(x=>x.getAttribute('aria-label')===id);if(!e)return null;e.click();return 1},id);
  await p.waitForTimeout(500);await p.screenshot({path:path.join(OUT,TAG+'-'+tag+'-win-'+String(id).replace(/\W+/g,'_')+'.jpg'),type:'jpeg',quality:70});
  await p.keyboard.press('Escape');await p.evaluate(()=>{const c=document.querySelector('#modal .x,#modal [aria-label=Close],.gxw-x,[data-close]');if(c)c.click();if(typeof closeMenu==='function')try{closeMenu()}catch(e){}});await p.waitForTimeout(300)}
 rep[tag+'-wins']=wins;rep[tag+'-errs']=errs;await ctx.close()}
fs.writeFileSync(path.join(OUT,TAG+'-inv.json'),JSON.stringify(rep,null,1));console.log(JSON.stringify(rep,null,1));await b.close()})();
