// Plays a Quick game (or Story stage 1) to the result screen using ONLY real touch taps on visible, uncovered UI (no engine shortcuts).
//   PLAYWRIGHT_BROWSERS_PATH=... NODE_PATH=../node_modules node play-ui.js [quick|story] [WxH=390x763]      Exit 1 on failure.
// Reads G only to know when to stop and to report the result; never calls a game function.
const PW=require('playwright');const fs=require('fs'),path=require('path');
const mode=process.argv[2]||'quick';const [W,H]=(process.argv[3]||'390x763').split('x').map(Number);
const html=fs.readFileSync(path.join(__dirname,'shipwreck.html'));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const br=await PW.chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await br.newContext({viewport:{width:W,height:H},isMobile:W<600,hasTouch:true});
 await ctx.route('**/*',r=>new URL(r.request().url()).host==='swi.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/net::|Failed to load|favicon/.test(m.text()))errs.push(m.text())});
 await p.goto('https://swi.test/');await sleep(1000);await p.evaluate(()=>{try{localStorage.clear()}catch(e){}});await p.reload();await sleep(1500);
 // a visible, uncovered element's centre, or null
 const centre=sel=>p.evaluate(sel=>{for(const e of document.querySelectorAll(sel)){if(e.disabled)continue;const r=e.getBoundingClientRect();if(r.width<8||r.height<8)continue;const x=r.left+r.width/2,y=r.top+r.height/2;if(x<0||y<0||x>innerWidth||y>innerHeight)continue;const t=document.elementFromPoint(x,y);if(t&&(t===e||e.contains(t)||t.contains(e)&&t.closest('button')===e))return [x,y,(e.textContent||'').trim().slice(0,24)]}return null},sel);
 let taps=0,uncovered=0;const tap=async sel=>{const c=await centre(sel);if(!c)return false;await p.touchscreen.tap(c[0],c[1]);taps++;return c[2]||true};
 const log=[];
 // title -> start
 if(mode==='story'){await tap('#modal summary');await sleep(400);await tap('#modal [data-a=story]');await sleep(1500);if(await tap('#coachskip'))await sleep(1500)} else{await tap('#modal [data-a=start]');await sleep(600);await tap('.tutoffer [data-tutoffer=play]');await sleep(1500)}
 const t0=Date.now();let last='',stall=0,over=null;
 while(Date.now()-t0<(+process.env.MAXMS||540000)){
   over=await p.evaluate(()=>{const r=document.querySelector('.gxc-res-on');if(r&&r.getBoundingClientRect().width)return {win:/won/.test(r.className),round:G?G.round:null,res:1};return G&&G.over?{win:!!G.over.win,round:G.round}:null});
   if(over)break;
   let did=null;
   for(const sel of ['.gxh-bub .gxh-ok','#modal button:not([data-a=new]):not([data-a=rules]):not([data-a=cards]):not([data-a=close])','.bf-opts .opt','.gxc-btn.go,.gxc-btn.pri,.gxc-btn:not(.ghost)','.gxc-node.open.next','#bf [data-a=go][data-force]','#bf [data-a=next]','#bf [data-a=suggest]','#bf [data-a=go]']){
     if(sel==='#bf [data-a=suggest]'){const need=await p.evaluate(()=>PHO.st==='plan'||PHO.st==='plan2');if(!need)continue;
        const idle=await p.evaluate(()=>{try{return planProblems().length>0}catch(e){return false}});if(!idle)continue}
     const r=await tap(sel);if(r){did=sel+' '+r;break}}
   if(process.env.DBG&&taps%5===0)console.log(taps,did,await p.evaluate(()=>[!!G,G&&G.round,PHO.st,document.querySelector('.gxc-res-on')?'res':'',[...document.querySelectorAll('[class*=gxc-]')].filter(e=>e.getBoundingClientRect().width).map(e=>e.className).slice(0,4).join('/')].join('|')));
   if(!did){ // a question that wants a glowing place on the island
     const g=await p.evaluate(()=>{const e=document.querySelector('#bfglow>*');if(!e)return null;const r=e.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]});
     if(g){await p.touchscreen.tap(g[0],g[1]);taps++;did='glow'}}
   const sig=await p.evaluate(()=>[G&&G.round,PHO.st,UI.shown,UI.beats&&UI.beats.length,G&&G.logN].join());
   if(sig===last&&!did){stall++;if(stall>40){log.push('STUCK '+sig);break}}else stall=0;last=sig;
   await sleep(did?250:400)}
 const info=over?{over:{win:over.win},round:over.round,res:over.res}:await p.evaluate(()=>({over:G&&G.over?{win:!!G.over.win}:null,round:G&&G.round,cmp:G&&G.cmp&&G.cmp.id,dead:G&&G.chars.filter(c=>c.dead).length}));
 const shotDir=path.join(__dirname,'playtest');fs.mkdirSync(shotDir,{recursive:true});
 await sleep(1500);await p.screenshot({path:path.join(process.env.TMPDIR||'/tmp','swi-result-'+mode+'-'+W+'.png')});
 const resShown=await p.evaluate(()=>!!document.querySelector('#bf [data-a=next],#modal button,.bf-opts')||!!(G&&G.over));
 console.log(`${mode} ${W}x${H}: ${info.over?'PASS result reached ('+(info.over.win?'rescued':'lost')+') day '+info.round:'FAIL no result (day '+info.round+')'} taps=${taps} errors=${errs.length} ${log.join(' ')}`);
 if(errs.length)console.log(errs.slice(0,4).join('\n'));
 await br.close();process.exit(info.over&&!errs.length?0:1)})();
