// qa_gx/pin.js <url> <outdir>: pinned checklist strip by real taps: menu, garage, Frankfurt roam (expanded / PASS / collapsed), reload keeps state, quick race. DESK=1 for PC.
const E=require('../bc/enter.js');const fs=require('fs');const OUT=process.argv[3]||'qa_gx/pin';fs.mkdirSync(OUT,{recursive:true});const desk=!!process.env.DESK;
(async()=>{const T=await E(process.argv[2],{gfx:process.env.GFX||'normal',desk,w:+(process.env.VW||(desk?1280:852)),h:+(process.env.VH||(desk?720:393))});const{p,tap,ev,tapXY}=T;const t0=Date.now();const W=t=>p.waitForTimeout(t);const pe=(f,a)=>p.evaluate(f,a);const R=[];
 const ck=(n,ok,x='')=>{R.push([n,!!ok]);console.log(ok?'PASS':'FAIL',n,x)};
 const shot=async n=>{await W(2500);await p.screenshot({path:`${OUT}/${n}.png`,timeout:600000});console.log('shot',n,((Date.now()-t0)/1000|0)+'s')};
 const cov=()=>pe(()=>{const P=document.getElementById('odPin');if(!P||P.hidden)return'hidden';const a=P.getBoundingClientRect();const out=[];
  for(const e of document.querySelectorAll('body *')){if(P.contains(e)||e.contains(P))continue;const s=getComputedStyle(e);if(s.visibility==='hidden'||s.display==='none'||+s.opacity<.05||e.offsetParent===null&&s.position!=='fixed')continue;
   if(!(e.matches('button,#roamArrow,#qTrk,#obj,canvas:not(#c):not(#gbC),[id*=mini i],[id*=Mini],[id*=obj i],[id*=spd i],[id*=Speed],[class*=pill i]')))continue;const r=e.getBoundingClientRect();if(!r.width||r.width>700)continue;
   const ix=Math.min(a.right,r.right)-Math.max(a.left,r.left),iy=Math.min(a.bottom,r.bottom)-Math.max(a.top,r.top);if(ix>2&&iy>2)out.push((e.id||e.className||e.tagName).toString().slice(0,30))}
  return{rect:[a.left|0,a.top|0,a.width|0,a.height|0],over:out}});
 const pin=()=>pe(()=>__chk.pinSt());
 await shot('m0_menu');console.log('menu',JSON.stringify(await cov()));
 await tap('#gbMenuBtn');await W(3000);await shot('g0_garage');const cg=await cov();console.log('garage',JSON.stringify(cg));ck('garage: strip visible, covers nothing',cg!=='hidden'&&!cg.over.length,JSON.stringify(cg));
 await tap('#gbBack');await W(2000);
 await T.roamApi();await W(3000);
 for(let i=0;i<16;i++){let hit=0;for(const l of[p.getByText('SKIP',{exact:false}),p.getByText('TAP TO CONTINUE'),p.locator('#m1Next')]){const e=l.first();if(await e.count()&&await e.isVisible()){await T.tapEl(await e.elementHandle());hit=1;break}}if(!hit&&i>3)break;await W(1500)}
 await W(3000);await shot('r1_roam_expanded');const cr=await cov();console.log('roam',JSON.stringify(cr));ck('roam: strip visible, covers no control/minimap/speed/objective',cr!=='hidden'&&!cr.over.length,JSON.stringify(cr));
 const fs0=await pe(()=>{const P=document.getElementById('odPin'),r=P.getBoundingClientRect();return{fs:Math.min(...[...P.querySelectorAll('p,button,b,small')].map(e=>parseFloat(getComputedStyle(e).fontSize))),pa:P.querySelector('.pa').getBoundingClientRect().height,w:r.width,h:r.height}});
 ck('text ≥12 px, PASS/FAIL ≥44 px, ≤ ~340×70',fs0.fs>=12&&fs0.pa>=44&&fs0.w<=344&&fs0.h<=70,JSON.stringify(fs0));
 const i0=(await pin()).i,st0=await pe(()=>__mho.state);await tap('#odPin .pa');await W(1200);const P1=await pin();const ans=await pe(()=>{const s=JSON.parse(localStorage.getItem('mho_chk')||'{}');return Object.keys(s).filter(k=>!k.startsWith('_')&&s[k].st).length});
 ck('✅ answers the item and moves to the next',ans>=1&&P1.i!==i0,`i ${i0}→${P1.i} answered ${ans}`);ck('answering does not pause or leave roam',await pe(()=>__mho.state)===st0&&await pe(()=>document.getElementById('pause')?document.getElementById('pause').hidden!==false:true),st0);
 await shot('r2_roam_answered');
 await tap('#odPin [data-p="next"]');await W(800);ck('› moves on',(await pin()).i!==P1.i);await tap('#odPin [data-p="prev"]');await W(800);ck('‹ moves back',(await pin()).i===P1.i);
 await tap('#odPin .pn');await W(1000);ck('header folds to a chip',(await pin()).col===1&&await pe(()=>/✓ \d+\/\d+/.test(document.querySelector('#odPin').textContent)));await shot('r3_roam_collapsed');console.log('chip',JSON.stringify(await cov()));
 ck('no ✕ on the chip while items are open',await pe(()=>!document.querySelector('#odPin .px')));
 await p.reload();await p.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});await W(2000);const P2=await pin();
 ck('state kept after reload (answers, item, folded)',P2.col===1&&P2.i===P1.i&&await pe(()=>!document.getElementById('odPin').hidden),JSON.stringify(P2));
 await tap('#odPin .pc');await W(800);ck('chip expands again',(await pin()).col===0);
 await tap('#odPin p');await W(800);ck('tap on the text opens the full panel',await pe(()=>!document.getElementById('odChk').hidden&&document.getElementById('odPin').hidden));await shot('c1_full_panel');await tap('#odChk [data-c="x"]');await W(600);
 if(!desk){await pe(()=>{localStorage.setItem('mho_prof@1',JSON.stringify({xp:40000}))});await tap('[data-a="quick"]');await W(1500);
  const c=await pe(()=>{const e=[...document.querySelectorAll('[data-c]')].find(x=>x.dataset.c==='fra'&&x.offsetParent);if(!e)return null;const r=e.getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2]});if(c)await tapXY(c[0],c[1]);await W(1500);
  const sb=await pe(()=>{const e=document.querySelector('#startBtn');if(!e)return null;e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2]});if(sb)await tapXY(sb[0],sb[1]);
  for(let i=0;i<120;i++){if(await pe(()=>__mho.state)==='race')break;await W(2000)}await W(8000);await shot('x1_race');const cx=await cov();console.log('race',JSON.stringify(cx));ck('race: strip visible, covers nothing',cx!=='hidden'&&!cx.over.length,JSON.stringify(cx))}
 console.log('ERRS',T.errs.length,JSON.stringify(T.errs.slice(0,6)));ck('0 console errors',!T.errs.length);console.log('RESULT',R.filter(r=>!r[1]).length?'FAIL':'PASS',R.filter(r=>r[1]).length+'/'+R.length);await T.b.close()})().catch(e=>{console.log('CRASH',e);process.exit(1)});
