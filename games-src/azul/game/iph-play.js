// one-shot: play a full game on an iPhone-size touch viewport, screenshot each turn, report small/covered targets
const {chromium,devices}=require('../../node_modules/playwright');
const http=require('http'),fs=require('fs');
const dev=process.argv[2]||'15';const out=process.argv[3]||'/tmp/sg/'+dev;fs.mkdirSync(out,{recursive:true});
const srv=http.createServer((q,r)=>{r.setHeader('content-type','text/html');r.end(fs.readFileSync('/tmp/x/sunglaze/index.html'))}).listen(0);
(async()=>{const port=srv.address().port;const b=await chromium.launch();
 const ctx=await b.newContext(dev==='15'?{...devices['iPhone 15 Pro']}:{viewport:{width:402,height:874},deviceScaleFactor:3,hasTouch:true,isMobile:true,userAgent:devices['iPhone 15 Pro'].userAgent});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto(`http://localhost:${port}/`);await p.waitForTimeout(1500);await p.screenshot({path:out+'/00-menu.png'});
 const small=new Map();
 async function audit(tag){const r=await p.evaluate(()=>{const o=[];document.querySelectorAll('button,[data-bf],[data-bfrow],[data-bfcell],[data-k],[data-ui],[data-a],[data-gx]').forEach(e=>{const b=e.getBoundingClientRect(),cs=getComputedStyle(e);if(!b.width||cs.visibility==='hidden'||cs.display==='none'||e.closest('[hidden]'))return;if(b.right<0||b.bottom<0||b.left>innerWidth||b.top>innerHeight)return;if(b.width<44||b.height<44)o.push((e.tagName+'.'+(e.className+'').slice(0,30)+'['+(e.dataset.bf||e.dataset.ui||e.dataset.a||e.dataset.gx||e.dataset.k||'')+'] '+Math.round(b.width)+'x'+Math.round(b.height)))});return o});r.forEach(x=>{if(!small.has(x))small.set(x,tag)})}
 console.log(await p.evaluate(()=>[...document.querySelectorAll('button,[data-ui]')].filter(e=>e.offsetWidth).map(e=>(e.dataset.ui||e.dataset.a||e.dataset.np||e.textContent.trim().slice(0,20))).join(' | ')));
 await audit('menu');
 const st=await p.$('[data-ui=start]');if(!st){console.log('NO START');process.exit(1)}
 await st.tap();await p.waitForTimeout(800);await p.screenshot({path:out+'/01-start.png'});
 const ok=await p.$('[data-ui=story-ok]');if(ok){await ok.tap();await p.waitForTimeout(500)}
 let turn=0,stall=0,last='';const t0=Date.now();
 while(Date.now()-t0<22*60e3){
  const s=await p.evaluate(()=>({over:!!(G&&G.over),me:!!me(),ph:G&&G.phase,r:G&&G.round,n:G&&G.logN,sel:!!UI.sel,busy:!!BF.busy,res:!!document.querySelector('#bf .bf-res'),ovs:[...document.querySelectorAll('#bf .bf-ov:not([hidden])')].length}));
  if(s.over||s.res){await p.waitForTimeout(1500);await p.screenshot({path:out+'/99-end.png'});await audit('end');break}
  const sig=JSON.stringify(s);if(sig===last)stall++;else{stall=0;last=sig}
  if(stall>60){await p.screenshot({path:out+'/STALL.png'});console.log('STALL',sig);break}
  if(s.busy||!s.me){await p.waitForTimeout(150);continue}
  await audit('r'+s.r+s.ph);
  const tap=async sel=>{const els=await p.$$(sel);for(const e of els){const bb=await e.boundingBox();if(!bb)continue;const cx=bb.x+bb.width/2,cy=bb.y+bb.height/2;const top=await p.evaluate(([x,y,el])=>{const t=document.elementFromPoint(x,y);return !!t&&(t===el||el.contains(t)||t.contains(el))},[cx,cy,e]).catch(()=>true);if(!top){console.log('COVERED',sel,'turn',turn,JSON.stringify(bb));await p.screenshot({path:out+`/covered-${turn}.png`});}await e.tap({timeout:3000}).catch(x=>console.log('TAPFAIL',sel,x.message.slice(0,80)));return true}return false};
  if(s.ph==='wall'){turn++;await p.screenshot({path:out+`/t${String(turn).padStart(3,'0')}-wall.png`});if(!await tap('#bf [data-bfcell]'))console.log('no wall cell');await p.waitForTimeout(250);continue}
  if(!s.sel){turn++;await p.screenshot({path:out+`/t${String(turn).padStart(3,'0')}-pick.png`});if(!await tap('#bf .bf-table [data-k^="f"],#bf .bf-table [data-k^="c_"]')){console.log('no tile to tap',s.ph)}await p.waitForTimeout(250);continue}
  await p.screenshot({path:out+`/t${String(turn).padStart(3,'0')}-place.png`});
  if(!await tap('#bf .bf-row.ok')){await tap('#bf .bf-floor.ok')}
  await p.waitForTimeout(250);
 }
 console.log('turns',turn,'errs',errs.slice(0,5));console.log('SMALL TARGETS:\n'+[...small].map(([k,v])=>v+': '+k).join('\n'));
 await b.close();srv.close()})();
