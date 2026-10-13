// t4/tmtest.js (TEST_MODE): shots of start (⚙), garage (∞ studs, nothing locked), logbook ALL (TEST), ⚙ in a rival race and a side mission;
// save round trip (raw mho_season / mho_gar stay the real save). usage: node t4/tmtest.js <url> <outdir> [W H]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const U=process.argv[2],O=process.argv[3],W=+(process.argv[4]||852),H=+(process.argv[5]||393);fs.mkdirSync(O,{recursive:true});
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({viewport:{width:W,height:H},isMobile:W<1000,hasTouch:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto(U);await p.waitForFunction(()=>window.__mho&&document.querySelector('#topBtns')&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});const cdp=await ctx.newCDPSession(p);
 const ev=(f,a)=>p.evaluate(f,a);const tapXY=async(x,y,w=900)=>{const tp=[{x,y,id:1,radiusX:4,radiusY:4,force:1}];await Promise.all([cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:tp}),cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})]);await p.waitForTimeout(w)};
 const tap=async(s,w)=>{const e=await p.$(s);if(!e){console.log('NO',s);return 0}const bb=await e.boundingBox();if(!bb){console.log('NOBOX',s);return 0}await tapXY(bb.x+bb.width/2,bb.y+bb.height/2,w);return 1};
 const shot=async n=>{await p.waitForTimeout(+(process.env.SW||6000));await p.screenshot({path:`${O}/${n}.png`,timeout:180000});console.log('shot',n)};
 const gear=()=>ev(()=>{const g=document.querySelector('#tuG');if(!g)return'NO ⚙';const r=g.getBoundingClientRect(),s=getComputedStyle(g);const top=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return{vis:s.display!=='none'&&s.visibility!=='hidden'&&r.width>0,box:[r.left|0,r.top|0,r.width|0,r.height|0],onTop:top===g}});
 console.log('TM',JSON.stringify(await ev(()=>({on:__tm.on,cr:__tm.cr(),own:__tm.own(),rawSeason:__tm.raw('mho_season'),rawGar:__tm.raw('mho_gar')}))),'gear',JSON.stringify(await gear()));
 await shot('t0_start');
 await tap('#tuG',1500);console.log('drawer open',await ev(()=>document.querySelector('#tuD').classList.contains('on')));await shot('t0b_drawer_menu');await tap('#tuD [data-a="x"]',800);
 await tap('#gbMenuBtn',3000);console.log('garage gear',JSON.stringify(await gear()));
 console.log('locks rides',await ev(()=>document.querySelectorAll('#gbBody .lock,#gbBody [disabled]').length));await shot('t1_garage_rides');
 // spend: buy something costing studs → the real save must not change, shown studs stay 999,999
 await ev(()=>__tm.spend(1200));console.log('after spend',JSON.stringify(await ev(()=>({cr:__tm.cr(),raw:__tm.raw('mho_season')}))));
 await tap('#r2R [data-r2m="build"]',3000);await tap('#r2R [data-r2m="paint"]',2500);console.log('locks paint',await ev(()=>document.querySelectorAll('#gbBody [disabled]').length));
 await tap('#r2R [data-r2m="perks"]',2500);console.log('locks perks',await ev(()=>document.querySelectorAll('#gbBody [disabled]').length),'slots',await ev(()=>__tm.st().slots));await shot('t2_garage_perks');
 await tap('#r2R [data-r2m="driver"]',2500);console.log('locks driver',await ev(()=>document.querySelectorAll('#gbBody [disabled]').length));
 await tap('#gbBack',3000);
 // roam: open the logbook ALL (TEST) tab
 await ev(()=>{__tm.roam()});await p.waitForFunction(()=>__tm.st().state==='roam'&&__tm.st().roam,null,{timeout:300000});await p.waitForTimeout(4000);
 console.log('ST',JSON.stringify(await ev(()=>__tm.st())));
 for(let k=0;k<6;k++){const sk=await ev(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.offsetParent&&/SKIP/.test(b.textContent));if(!b)return null;const r=b.getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2]});if(!sk)break;await tapXY(sk[0],sk[1],2500)}
 console.log('roam gear',JSON.stringify(await gear()));await shot('t3_roam');
 console.log('HINT in roam',await ev(()=>{const h=document.querySelector('#crSmHint');return !!h&&h.classList.contains('on')}));
 console.log('HINT under story dialog',await ev(()=>{const c=document.querySelector('#m1Cs'),h=document.querySelector('#crSmHint');return{dlg:!!c&&!c.hidden,hint:!!h&&h.classList.contains('on')&&getComputedStyle(h).display!=='none'}}));
 for(let k=0;k<8;k++){const sk=await ev(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.offsetParent&&/SKIP/.test(b.textContent));if(!b)return null;const r=b.getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2]});if(!sk)break;await tapXY(sk[0],sk[1],2500)}
 if(!await tap('#roamLogBtn',1500)||await ev(()=>document.querySelector('#journal').hidden)){console.log('log btn hidden → journalOpen()');await ev(()=>__tm.log())}
 await shot('t4a_logbook');console.log('TODO rows',await ev(()=>[...document.querySelectorAll('#jBody .jrow,#jBody .jempty')].map(e=>e.textContent.slice(0,70)).join(' | ')),'ch',await ev(()=>__tm.st().ch));console.log('HINT logbook todo',await ev(()=>{const h=document.querySelector('#crSmHint');return !!h&&h.classList.contains('on')&&getComputedStyle(h).display!=='none'}));await tap('#journal .jt [data-t="tm"]',1500);console.log('all rows',await ev(()=>document.querySelectorAll('#jBody [data-tmi]').length),await ev(()=>[...document.querySelectorAll('#journal .tmH')].map(e=>e.textContent).join(' | ')));await shot('t4_logbook_all');
 console.log('HINT with logbook open',JSON.stringify(await ev(()=>{const h=document.querySelector('#crSmHint');return{hint:!!h&&h.classList.contains('on')&&getComputedStyle(h).display!=='none',odPanel:document.body.classList.contains('odPanel'),title:document.querySelector('#journal .jh b').textContent}})));
 // go to a rival race through the list (real taps), start it, ⚙ in the race
 const K=process.env.KIND||'rival';await ev(k=>window.__K=k,K);const ri=await ev(()=>{const r=[...document.querySelectorAll('#jBody [data-tmi]')].find(b=>__tm.kind(+b.dataset.tmi)===(window.__K||'rival'));return r?r.dataset.tmi:null});
 if(ri){await ev(i=>__tm.go(+i),ri);await p.waitForTimeout(20000);
  console.log('event',K,JSON.stringify(await ev(()=>__tm.st())),'gear',JSON.stringify(await gear()));await shot('t5_'+K+'_gear');
  await tap('#tuG',1500);console.log('drawer',K,await ev(()=>document.querySelector('#tuD').classList.contains('on')));await shot('t5b_'+K+'_drawer');await tap('#tuD [data-a="x"]',800)}
 console.log('ERR',JSON.stringify(errs.slice(0,8)));await b.close()})();
