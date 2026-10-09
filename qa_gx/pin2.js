// qa_gx/pin2.js: v88o2 shots: garage RIDES (strip folded to the chip) and race countdown (folded), then expanded after 3 s. Real taps.
const E=require('../bc/enter.js');const fs=require('fs');const OUT=process.argv[3]||'qa_gx/pin2';fs.mkdirSync(OUT,{recursive:true});
(async()=>{const T=await E(process.argv[2],{gfx:'normal'});const{p,tap,tapXY}=T;const W=t=>p.waitForTimeout(t);const pe=(f,a)=>p.evaluate(f,a);const R=[];const ck=(n,ok,x='')=>{R.push(!!ok);console.log(ok?'PASS':'FAIL',n,x)};
 const shot=async n=>{await p.screenshot({path:`${OUT}/${n}.png`,timeout:600000});console.log('shot',n)};const col=()=>pe(()=>document.getElementById('odPin').classList.contains('col'));
 await tap('#gbMenuBtn');await W(3000);ck('RIDES: folded chip',await col());await shot('g1_rides_chip');await tap('#odPin .pc');await W(1000);ck('chip tap opens it in the garage',!await col());await tap('#gbBack');await W(2000);
 await pe(()=>{localStorage.setItem('mho_prof@1',JSON.stringify({xp:40000}))});await tap('[data-a="quick"]');await W(1500);
 const c=await pe(()=>{const e=[...document.querySelectorAll('[data-c]')].find(x=>x.dataset.c==='fra'&&x.offsetParent);if(!e)return null;const r=e.getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2]});if(c)await tapXY(c[0],c[1]);await W(1500);
 const sb=await pe(()=>{const e=document.querySelector('#startBtn');if(!e)return null;e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2]});if(sb)await tapXY(sb[0],sb[1]);
 for(let i=0;i<120;i++){const s=await pe(()=>__mho.state);if(s==='countdown'||s==='race')break;await W(1000)}await W(1500);ck('countdown: folded',await col(),await pe(()=>__mho.state));await shot('x1_countdown_chip');
 for(let i=0;i<60;i++){if(!await col())break;await W(2000)}ck('opens again after the start',!await col());await shot('x2_race_open');
 console.log('ERRS',T.errs.length,JSON.stringify(T.errs.slice(0,5)));ck('0 console errors',!T.errs.length);console.log('RESULT',R.every(x=>x)?'PASS':'FAIL');await T.b.close()})().catch(e=>{console.log('CRASH',e);process.exit(1)});
