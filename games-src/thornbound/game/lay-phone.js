// Phone layout check. node lay-phone.js [WxH,...]  (touch only: a full human round through taps)
const PW=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const fs=require('fs'),path=require('path');const OUT=path.join(__dirname,'shots','ph');fs.mkdirSync(OUT,{recursive:true});
const html=fs.readFileSync(__dirname+'/thornbound.html');
const SIZES=(process.argv[2]||'390x844,844x390,360x740,740x360').split(',').map(s=>s.split('x').map(Number));
(async()=>{const b=await PW.chromium.launch();let bad=0;
for(const [W,H] of SIZES){const t=W+'x'+H;const ctx=await b.newContext({viewport:{width:W,height:H},isMobile:true,hasTouch:true});
 await ctx.route('**/*',r=>new URL(r.request().url()).host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
 const p=await ctx.newPage();p.setDefaultTimeout(30000);const errs=[];p.on('pageerror',e=>errs.push('PE '+e.message+(e.stack||'').split('\n').slice(0,4).join('|')));p.on('console',m=>{if(m.type()==='error'&&!/net::|Failed to load/.test(m.text()))errs.push(m.text())});
 const FAIL=(c,x)=>{bad++;console.log('FAIL',t,c,x||'')};const shot=n=>p.screenshot({path:path.join(OUT,`${t}_${n}.png`)});
 await p.goto('https://gns.test/?phone=1');await p.waitForTimeout(1200);
 await p.evaluate(()=>{try{localStorage.clear()}catch(e){}});
 const scroll=async tag=>{const r=await p.evaluate(()=>({h:document.documentElement.scrollHeight,w:document.documentElement.scrollWidth,vh:innerHeight,vw:innerWidth}));if(r.h>r.vh+1||r.w>r.vw+1)FAIL('scroll '+tag,JSON.stringify(r))};
 const checks=async tag=>{const r=await p.evaluate(()=>{const o={small:[],text:[],pop:null,board:null};const B=document.querySelector('.gx-board').getBoundingClientRect();o.board=[B.left,B.top,B.width,B.height].map(Math.round);o.short=Math.min(innerWidth,innerHeight);
   for(const e of document.querySelectorAll('.gx-bar button,#main button,#ppop button,#pc button,#rivals button,#handw button,#start button')){const R=e.getBoundingClientRect();if(!R.width||!R.height||getComputedStyle(e).visibility==='hidden')continue;if(e.closest('[hidden]'))continue;
     if(R.bottom<=0||R.top>=innerHeight)continue;const vis=e.closest('#main,#ppop,#pc');if(vis){const V=vis.getBoundingClientRect();if(R.bottom<V.top+2||R.top>V.bottom-2)continue}
     if(e.classList.contains('hc')){if(R.height<44||Math.min(R.width,e.dataset.id!=null?(parseFloat(e.style.left)>=0?44:R.width):R.width)<30)o.small.push('hc '+Math.round(R.width)+'x'+Math.round(R.height));continue}
     if(R.width<43.5||R.height<43.5)o.small.push((e.dataset.a||e.className)+':'+Math.round(R.width)+'x'+Math.round(R.height))}
   // hand cards: visible slice >= 44 px
   const hs=[...document.querySelectorAll('#handw .hc')].map(e=>parseFloat(e.style.left));for(let i=1;i<hs.length;i++){if(hs[i]-hs[i-1]<43.5)o.small.push('hand slice '+Math.round(hs[i]-hs[i-1]))}
   for(const e of document.querySelectorAll('#dockbody *,#ppop *,#pc *,.gx-bar *')){if(e.closest('svg')||e.closest('[hidden]'))continue;const has=[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim());if(!has)continue;const R=e.getBoundingClientRect();if(!R.width||R.bottom<0||R.top>innerHeight)continue;const fs=parseFloat(getComputedStyle(e).fontSize);if(fs<12.95)o.text.push(e.tagName+'.'+e.className+':'+fs+':'+e.textContent.trim().slice(0,20))}
   const P=document.querySelector('#ppop'),pc=document.querySelector('#pc');for(const q of [P,pc]){if(q&&!q.hidden){const R=q.getBoundingClientRect();o.pop=[R.left,R.top,R.right,R.bottom].map(Math.round)}}
   return o});
   if(r.small.length)FAIL('tap '+tag,JSON.stringify([...new Set(r.small)].slice(0,6)));if(r.text.length)FAIL('text<13 '+tag,JSON.stringify([...new Set(r.text)].slice(0,6)));
   if(r.pop){const B=r.board;if(r.pop[0]<B[0]+B[2]-2&&r.pop[2]>B[0]+2&&r.pop[1]<B[1]+B[3]-2&&r.pop[3]>B[1]+2)FAIL('popup over board '+tag,JSON.stringify([r.pop,B]))}
   return r};
 const hitLocs=async tag=>{const r=await p.evaluate(()=>{const o=[];const B=document.querySelector('.gx-board').getBoundingClientRect();for(const id of ['castle','wilderness','harvest_field','battlefield','shrine','necropolis','throne']){const g=MAP.m.locEl(id);const pp=id==='throne'?{x:500,y:500}:MAP.m.locPos(id);const svg=MAP.m.el;const M=svg.getScreenCTM();const x=M.a*pp.x+M.e,y=M.d*pp.y+M.f;const R={width:M.a*196,height:M.a*140};const e=document.elementFromPoint(x,y);if(!(x>=B.left&&x<=B.right&&y>=B.top&&y<=B.bottom&&e&&g.contains(e)))o.push(id);if(id!=='throne'&&(Math.min(R.width,R.height)<44))o.push(id+' small')}return o});if(r.length)FAIL('loc hit/size '+tag,JSON.stringify(r))};
 await scroll('start');await shot('0start');await checks('start');
 await p.tap('[data-a=guided]');await p.waitForTimeout(800);await scroll('game');
 const m=await p.evaluate(()=>{const B=document.querySelector('.gx-board').getBoundingClientRect();return {w:B.width,h:B.height,short:Math.min(innerWidth,innerHeight)}});
 console.log(t,'board',Math.round(m.w)+'x'+Math.round(m.h),'ratio',(Math.min(m.w,m.h)/m.short).toFixed(2));if(Math.min(m.w,m.h)<.85*m.short)FAIL('board size',JSON.stringify(m));
 const tapEl=async sel=>{const l=p.locator(sel).first();if(!(await l.count()))return false;await l.scrollIntoViewIfNeeded().catch(()=>{});try{await l.tap({timeout:7000})}catch(e){return false}await p.waitForTimeout(250);return true};
 let shots=new Set(),turns=0,heraldViaMap=false,lastR=0;
 for(let i=0;i<500;i++){await p.waitForTimeout(200);
  const st=await p.evaluate(()=>({over:!!G.over,card:UI.card&&UI.card.kind,k:G.q&&G.q.kind,s:G.q&&viewSeatForQ(),r:G.round,pop:UI.pop,busy:UI.busy}));
  if(st.over||st.r>=2&&st.k==='bid'&&turns>5)break;
  if(process.env.DBG&&i%10==0)console.log('it',i,JSON.stringify(st));
  const key=st.card?'card_'+st.card:'q_'+st.k;if(!shots.has(key)){shots.add(key);await p.waitForTimeout(450);await scroll(key);await checks(key);await hitLocs(key);await shot(key)}
  if(st.card){const sel=({pass:'#pc [data-a=take]',tip:'#pc [data-a=tipok]',event:'#pc [data-a=evok]:visible',over:'#pc [data-a=menu]'})[st.card];await tapEl(sel||'#pc button:visible');continue}
  if(st.s==null){continue}
  turns++;
  if(st.k==='bid'||st.k==='place'||st.k==='tie'){if(st.pop==='card'){await tapEl('#ppop [data-a=mv]');continue}const ok=await tapEl('#handw .hc.pl, #handw .hc');if(!ok){await tapEl('#main [data-a=mv]');continue}
    if(!shots.has('pop_'+st.k)){shots.add('pop_'+st.k);await p.waitForTimeout(300);await checks('pop '+st.k);await shot('pop_'+st.k)}
    const clicked=await tapEl('#ppop [data-a=mv]');if(!clicked){await tapEl('#ppop [data-a=pclose]');await tapEl('#main [data-a=mv]')}}
  else if(st.k==='herald'){ // tap the location on the map by touch, then the pop-up button
    const pos=await p.evaluate(()=>{const M=MAP.m.el.getScreenCTM(),pp=MAP.m.locPos('battlefield');return [M.a*pp.x+M.e,M.d*pp.y+M.f]});await p.touchscreen.tap(pos[0],pos[1]);await p.waitForTimeout(350);
    const open=await p.evaluate(()=>UI.pop);if(open!=='loc')FAIL('location tap did not open pop-up',open);else{heraldViaMap=true;if(!shots.has('pop_loc')){shots.add('pop_loc');await checks('pop loc');await shot('pop_loc')}}
    if(!(await tapEl('#ppop [data-a=mv]')))await tapEl('#main [data-a=mv]')}
  else {await tapEl('#main [data-a=mv].pri, #main [data-a=mv]')}
 }
 if(!heraldViaMap)FAIL('herald by map tap not exercised');
 // popups: rival, throne, region slot, Esc and x and outside tap
 await p.evaluate(()=>{UI.card=null;closePop(true);renderAll()});
 await tapEl('#rivals .rv:nth-child(2)');if(await p.evaluate(()=>UI.pop)!=='rival')FAIL('rival pop');await checks('rival pop');await shot('pop_rival');await p.keyboard.press('Escape');if(await p.evaluate(()=>UI.pop))FAIL('esc did not close');
 const tp=await p.evaluate(()=>{const M=MAP.m.el.getScreenCTM();return [M.a*500+M.e,M.d*500+M.f]});await p.touchscreen.tap(tp[0],tp[1]);await p.waitForTimeout(300);if(await p.evaluate(()=>UI.pop)!=='kingdom')FAIL('throne pop');await checks('kingdom');await shot('pop_kingdom');await tapEl('#ppop [data-a=pclose]');if(await p.evaluate(()=>UI.pop))FAIL('x did not close');
 await tapEl('.gx-bar [data-gx=rulesd]');await scroll('rules');await shot('rules');await p.keyboard.press('Escape');
 await tapEl('.gx-bar [data-gx=setd]');await scroll('menu');await p.keyboard.press('Escape');
 console.log(t,'turns',turns,'errors',JSON.stringify(errs.slice(0,3)));bad+=errs.length;await ctx.close()}
console.log('PROBLEMS',bad);await b.close()})().catch(e=>{console.error('FATAL',e);process.exit(1)});
