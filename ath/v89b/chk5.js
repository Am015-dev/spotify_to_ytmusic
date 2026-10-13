// ath/v89b/chk5.js <url> fra|ath <outdir> : garage round trip after streaming has run (pause → GARAGE tap → shot → save & back to roam → shot),
// stream state before/after, Athens kiosks (ad_kiosk instances drawn around the player), console errors.
const enter=require('../../bc/enter.js');const fs=require('fs');const URL=process.argv[2],CITY=process.argv[3]||'fra',OUT=process.argv[4]||'ath/v89b/chk';fs.mkdirSync(OUT,{recursive:true});
(async()=>{const seed=CITY==='ath'?`localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}));localStorage.setItem('mho_city@1','ath');localStorage.setItem('mho_athd@1','A');localStorage.setItem('mho_roam.ath@1','{"otg":{},"tut":1}');localStorage.setItem('mho_story.ath@1','{"seen":1}')`:`localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}))`;
 const E=await enter(URL,{gfx:'normal',seed});const {p,errs}=E;p.setDefaultTimeout(900000);await E.roamApi();
 const st=()=>p.evaluate(()=>({state:__mho.state,str:window.__str?__str.sup():null,b:window.__str?__str.st.b:0,f:window.__str?__str.st.f:0,kiosk:(()=>{let n=0;__g9ev('scene').traverse(o=>{if(o.name==='ad_kiosk')n+=o.count});return n})()}));
 // streaming churn: 6 stops across the city
 await p.evaluate(()=>{const N=__mho.HUB.nodes.filter(a=>a&&a.nb&&a.nb.length);window.__pts=[0,1,2,3,4,5].map(i=>N[Math.floor((i*7919+101)%N.length)])});
 for(let i=0;i<6;i++){await p.evaluate(i=>{const a=__pts[i];__mho.warp(a.x,a.z,0,performance.now())},i);await p.waitForTimeout(2500)}
 const s0=await st();console.log('before',JSON.stringify(s0));
 await p.evaluate(()=>document.querySelector('#roamExit').click());await p.waitForTimeout(800);
 const g=await p.evaluate(()=>{const b=document.querySelector('#roamPause [data-p="garage"]');return !!b&&!b.hidden&&b.offsetWidth>0});console.log('garage button visible',g);
 if(g){await p.evaluate(()=>document.querySelector('#roamPause [data-p="garage"]').click());await p.waitForTimeout(4000);await p.screenshot({path:`${OUT}/${CITY}_garage.png`});
   const open=await p.evaluate(()=>({gbx:!document.querySelector('#gbx').hidden}));console.log('garage open',JSON.stringify(open));
   await p.evaluate(()=>__g9ev('gbClose(true)'));await p.waitForFunction(()=>__mho.state==='roam'&&!(__mho.LD&&__mho.LD.on),null,{timeout:600000});await p.waitForTimeout(8000)}
 const s1=await st();console.log('after',JSON.stringify(s1));await p.screenshot({path:`${OUT}/${CITY}_after_garage.png`});
 console.log('errors',errs.length,errs.slice(0,3).join(' | '));await E.b.close()})();
