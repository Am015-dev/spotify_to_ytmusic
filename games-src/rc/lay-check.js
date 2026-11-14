// Board layout check by touch on a built page (R42 P5/P6/B1): walks the whole Learn game (taps the ring of every step) and plays default
// games following ✨ pawn by pawn, and on every frame of the plan board measures: job plates overlapping each other, a plate over a glowing
// place, a zoom button over a glowing place, the nearest two glow rings (centre distance; rings are 52 px) and the board height.
//   node lay-check.js <index.html> [WxH=375x553] [learn|game] [games=1]     Exit 1 when a plate or zoom overlap was seen.
const PW=require('playwright');const fs=require('fs'),path=require('path');
const HTML=process.argv[2]||path.join(__dirname,'shipwreck.html');const [W,H]=(process.argv[3]||'375x553').split('x').map(Number);const MODE=process.argv[4]||'learn';const NG=+(process.argv[5]||1);
const LIVE=path.join(__dirname,'../../games/shipwreck-isle');const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const MEASURE=()=>{const vis=e=>{if(!e||e.closest('[hidden]'))return false;const s=getComputedStyle(e);if(s.visibility==='hidden'||s.display==='none'||+s.opacity<.05)return false;const r=e.getBoundingClientRect();return r.width>4&&r.height>4};
  const R=e=>e.getBoundingClientRect();const inter=(a,b)=>Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
  const pl=[...document.querySelectorAll('#bfchips .bfa,#bfchips .bfmore')].filter(vis).map(e=>({e,r:R(e),g:e.parentElement}));
  const gl=[...document.querySelectorAll('#bfglow .bfgl')].filter(vis).map(e=>{const r=R(e);return {t:+e.dataset.t,x:r.left+r.width/2,y:r.top+r.height/2,w:r.width}});
  const out={plate:[],pg:[],zg:[],minRing:null,board:null};
  for(let i=0;i<pl.length;i++)for(let j=i+1;j<pl.length;j++){if(pl[i].g===pl[j].g)continue;const a=inter(pl[i].r,pl[j].r);if(a>4)out.plate.push(pl[i].e.textContent.trim().slice(0,14)+' x '+pl[j].e.textContent.trim().slice(0,14)+' '+Math.round(a))}
  for(const p of pl)for(const g of gl){const c={left:g.x-17,right:g.x+17,top:g.y-17,bottom:g.y+17};if(inter(p.r,c)>4)out.pg.push(p.e.textContent.trim().slice(0,14)+' on '+g.t)}
  for(const z of [...document.querySelectorAll('#bfzoom .gx-ibtn')].filter(vis)){const r=R(z);for(const g of gl){const c={left:g.x-26,right:g.x+26,top:g.y-26,bottom:g.y+26};if(inter(r,c)>4)out.zg.push((z.dataset.ph||'z')+' on '+g.t)}}
  for(let i=0;i<gl.length;i++)for(let j=i+1;j<gl.length;j++){const d=Math.hypot(gl[i].x-gl[j].x,gl[i].y-gl[j].y);if(out.minRing==null||d<out.minRing)out.minRing=Math.round(d);const ov=(gl[i].w+gl[j].w)/2-d;if(ov>0.5)out.ringOv=(out.ringOv||0)+1;out.minRs=Math.min(out.minRs||99,Math.round(gl[i].w),Math.round(gl[j].w))}
  const b=document.querySelector('.gx-board');if(b){const r=R(b);out.board=Math.round(r.height)}{const lb=document.querySelector('#phlabel');if(lb&&vis(lb)){const t=lb.textContent;out.hint=/✨/.test(t);out.cut=out.hint&&(/…/.test(t)||lb.scrollHeight>lb.clientHeight+1)?t:''}}out.n=gl.length;out.np=pl.length;if(out.pg.length)out.dbg=JSON.stringify({pick:UI.pick,gl:gl.map(g=>[g.t,Math.round(g.x),Math.round(g.y)]),pl:pl.map(p=>[p.e.textContent.trim().slice(0,8),Math.round(p.r.left),Math.round(p.r.top),Math.round(p.r.width),Math.round(p.r.height)]),gtr:[...document.querySelectorAll('#bfchips .bfg')].map(g=>g.style.transform+' '+g.className)});return out};
(async()=>{const br=await PW.chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const tot={hints:0,cuts:0,frames:0,plate:0,pg:0,zg:0,minRing:999,ringsUnder52:0,board:999,wins:0,games:0,errs:[],ex:new Set()};
 for(let gi=0;gi<(MODE==='learn'?1:NG);gi++){
 const ctx=await br.newContext({viewport:{width:W,height:H},isMobile:true,hasTouch:true});
 await ctx.route('**/*',r=>{const u=new URL(r.request().url());if(u.host!=='swi.test')return r.abort();const p=decodeURIComponent(u.pathname);
  if(p==='/')return r.fulfill({status:200,contentType:'text/html',body:fs.readFileSync(HTML)});const f=path.join(LIVE,p);
  if(fs.existsSync(f)&&fs.statSync(f).isFile())return r.fulfill({status:200,body:fs.readFileSync(f)});return r.fulfill({status:404,body:''})});
 const p=await ctx.newPage();p.on('pageerror',e=>tot.errs.push(e.message));
 await p.goto('https://swi.test/');await sleep(900);await p.evaluate(()=>{try{localStorage.clear()}catch(e){}});await p.reload();await sleep(1500);
 if(process.env.SEED)await p.evaluate(s=>{try{const o=beginGame;beginGame=function(){setSeed(+s);return o.apply(this,arguments)}}catch(e){}},+process.env.SEED+gi);
 const centre=sel=>p.evaluate(sel=>{for(const e of document.querySelectorAll(sel)){if(e.disabled)continue;const r=e.getBoundingClientRect();if(r.width<6||r.height<6)continue;const x=r.left+r.width/2,y=r.top+r.height/2;if(x<0||y<0||x>innerWidth||y>innerHeight)continue;const t=document.elementFromPoint(x,y);if(t&&(t===e||e.contains(t)))return [x,y]}return null},sel);
 const tap=async sel=>{const c=await centre(sel);if(!c)return false;await p.touchscreen.tap(c[0],c[1]);return true};
 const meas=async tag=>{await sleep(120);let m=await p.evaluate(MEASURE);
   // an overlap must still be there 0.25 s later (a camera frame between a move and the plates' re-place is not a visible overlap)
   if(m.plate.length||m.pg.length||m.zg.length){await sleep(250);m=await p.evaluate(MEASURE)}if(m.hint){tot.hints++;if(m.cut){tot.cuts++;if(tot.ex.size<12)tot.ex.add(tag+': cut ✨ '+m.cut)}}if(!m.n&&!m.np)return;tot.frames++;if(m.dbg&&process.env.DBG){console.log(tag,m.dbg);const dd=await p.evaluate(()=>{const host=document.querySelector('#bfchips');const hr=host.getBoundingClientRect();return [...host.children].map(g=>{const p=BF.tilePt(+g.dataset.t);return {w:g.offsetWidth,h:g.offsetHeight,p:p&&[Math.round(p.x),Math.round(p.y),p.w,p.h],top:Math.round(document.querySelector('#bfres').getBoundingClientRect().bottom-hr.top+4),cur:!!g.querySelector('.cur')}})});console.log('  groups',JSON.stringify(dd));const m2=await p.evaluate(M=>{BF.place();return eval('('+M+')')()},MEASURE.toString());console.log('  after place:',m2.pg.length,m2.dbg)}tot.plate+=m.plate.length;tot.pg+=m.pg.length;tot.zg+=m.zg.length;
   if(m.minRing!=null){tot.minRing=Math.min(tot.minRing,m.minRing);if(m.ringOv)tot.ringsUnder52++;if(m.minRs)tot.minRs=Math.min(tot.minRs||99,m.minRs)}if(m.board)tot.board=Math.min(tot.board,m.board);
   for(const x of [...m.plate.map(s=>'plate '+s),...m.pg.map(s=>'plate-glow '+s),...m.zg.map(s=>'zoom '+s)])if(tot.ex.size<12){tot.ex.add(tag+': '+x);if(process.env.SHOTS)await p.screenshot({path:path.join(process.env.SHOTS,`${MODE}-${W}x${H}-${tot.ex.size}.png`)})}};
 await tap('#modal [data-a=start]');await sleep(600);
 const t0=Date.now();let stall=0,last='';
 if(MODE==='learn'){await tap('.tutoffer [data-tutoffer=learn]');await sleep(1500);
  while(Date.now()-t0<600000){
   const s=await p.evaluate(()=>{const b=document.querySelector('#coachb.guide:not([hidden])');const r=document.querySelector('#tutring:not([hidden])');const rr=r&&r.getBoundingClientRect();
     return {fin:!!document.querySelector('#coachb.guide[data-kind=final]:not([hidden])'),step:b&&b.dataset.step,ring:rr&&[rr.left+rr.width/2,rr.top+rr.height/2],st:PHO.st,over:!!(G&&G.over),sh:UI.shown}});
   if(s.fin||s.over)break;await meas('learn '+s.step);
   if(s.step&&s.ring){await p.touchscreen.tap(s.ring[0],s.ring[1]);await sleep(500)}
   else{let did=false;for(const sel of ['.bf-opts .opt','#bf [data-a=next]','#modal button:not([data-a=new]):not([data-a=rules]):not([data-a=cards]):not([data-a=close])']){if(await tap(sel)){did=true;break}}await sleep(did?500:300)}
   const sig=s.step+'|'+s.st+'|'+s.sh;if(sig===last){if(++stall>60){tot.errs.push('stuck '+sig);break}}else stall=0;last=sig}
  tot.games=1}
 else{await tap('.tutoffer [data-tutoffer=play]');await sleep(1500);let pileDay=-1;
  while(Date.now()-t0<900000){
   const st=await p.evaluate(()=>({confirm:!!UI.confirm,st:PHO.st,day:G?G.round:0,res:!!(G&&G.over)&&!!document.querySelector('#modal:not([hidden]) .mbox.over')}));
   if(st.res)break;{const sg=await p.evaluate(()=>[G.round,G.logN,UI.shown,PHO.st,!!G.q,G.q&&G.q.title,UI.confirm?1:0,G.plan&&G.plan.acts.map(a=>a.pw.length).join('')].join('|'));if(sg===last){if(++stall===80){const dump=await p.evaluate(()=>JSON.stringify({q:G.q&&{t:G.q.title,who:G.q.who,opts:G.q.opts.length},hq:typeof humanQ==='function'&&humanQ(),opts:[...document.querySelectorAll('.bf-opts .opt')].map(e=>{const r=e.getBoundingClientRect();const t=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return [e.textContent.trim().slice(0,20),Math.round(r.top),Math.round(r.height),t&&(t.id||t.className)]}),bf:document.querySelector('#bf').innerHTML.slice(0,400),coach:!!document.querySelector('#coachb:not([hidden])'),modal:UI.modal}));tot.errs.push('stuck '+sg+' '+dump);if(process.env.SHOTS)await p.screenshot({path:path.join(process.env.SHOTS,'stuck-'+W+'.png')});break}}else stall=0;last=sg}
   if(st.st==='plan'||st.st==='plan2'||st.st==='story')await meas('day '+st.day+' '+st.st);
   if(await tap('.gxh-bub .gxh-ok')){await sleep(350);continue}
   if(await tap('#coachb [data-coach=x]')){await sleep(350);continue}
   if(st.st==='plan'||st.st==='plan2'){
     if(await p.evaluate(()=>!!(PHO.pop&&PHO.pop.k==='status'))&&await tap('#ppop .pp-x')){await sleep(350);continue}
     if(await centre('#ppop .bfr')){const ok=await centre('#ppop .bfr[data-rec="1"]')||await centre('#ppop .bfr[data-place]');if(ok){await p.touchscreen.tap(ok[0],ok[1]);await sleep(450);continue}}
     const fr=await p.evaluate(()=>{const f=humanFree().filter(q=>q.c!=null||BF.recTile(q));const c=curPawn();return {n:f.length,swap:f.length&&(!c||!f.some(q=>q.id===c.id))?f[0].id:null}});
     if(fr.swap&&await tap('#bf [data-pawn="'+fr.swap+'"]')){await sleep(400);continue}
     if(fr.n===0&&!st.confirm&&pileDay!==st.day&&await p.evaluate(()=>BF.hintMore?BF.hintMore():BF.wantPile()>0)){pileDay=st.day;await tap('#bf [data-a=suggest]');await sleep(450);continue}
     if(fr.n>0&&!st.confirm){await tap('#bf [data-a=suggest]');await sleep(500);await meas('day '+st.day+' hint');const gh=await p.evaluate(()=>BF.ghostAt&&BF.ghostAt.why==='tile'?[BF.ghostAt.x,BF.ghostAt.y]:null);
       if(gh){const hitZoom=await p.evaluate(([x,y])=>{const t=document.elementFromPoint(x,y);return !!(t&&t.closest('#bfzoom'))},gh);if(hitZoom){tot.zg++;tot.ex.add('day '+st.day+': finger under zoom')}await p.touchscreen.tap(gh[0],gh[1]);await sleep(500);continue}}}
   if(await tap('.bf-opts .opt.rec, .bf-opts .opt')){await sleep(450);continue}
   if(await tap('#bfglow .bfgl')){await sleep(450);continue}
   if(await tap('#bf [data-a=go][data-force]')||await tap('#bf [data-a=go]')){await sleep(450);continue}
   if(await tap('#bf [data-a=next]')){await sleep(450);continue}
   if(await tap('#modal button.go, #modal [data-a=close]')){await sleep(450);continue}
   await sleep(300)}
  const r=await p.evaluate(()=>({win:!!(G&&G.over&&G.over.win),day:G&&G.round,pile:G&&G.sc&&G.sc.pile}));tot.games++;if(r.win)tot.wins++;console.log(`  game ${gi+1}: ${r.win?'RESCUED':'lost'} day ${r.day} pile ${r.pile}`)}
 await ctx.close()}
 const bad=tot.plate+tot.pg+tot.zg+tot.cuts+tot.ringsUnder52;
 console.log(`lay ${MODE} ${W}x${H}: ${bad?'FAIL':'PASS'} frames ${tot.frames} · plate overlaps ${tot.plate} · plate on glow ${tot.pg} · zoom on glow ${tot.zg} · min ring gap ${tot.minRing} px · rings overlapping on ${tot.ringsUnder52} frames · smallest ring ${tot.minRs||52} px · min board ${tot.board} px · ✨ lines ${tot.hints} cut ${tot.cuts}${MODE==='game'?` · wins ${tot.wins}/${tot.games}`:''} · errors ${tot.errs.length?tot.errs.slice(0,3).join(' | '):0}`);
 for(const x of tot.ex)console.log('   ',x);
 await br.close();process.exit(bad||tot.errs.length?1:0)})();
