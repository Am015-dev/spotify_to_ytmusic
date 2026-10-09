// ath/v88v/hitch.js <url> fra|ath : frame hitches during the in-game background far-cell build (no __wb.fast).
// Reports the build's own work slices (WBC.st slMax/sl50/sl100 = main-thread blocks between yields) and the rAF frame intervals
// while the build runs vs. after it (headless swiftshader frames are slow, so the slice numbers are the build's added hitch).
const enter=require('../../bc/enter.js');const URL=process.argv[2],CITY=process.argv[3]||'fra';
(async()=>{const seed=CITY==='ath'?`localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}));localStorage.setItem('mho_city@1','ath');localStorage.setItem('mho_athd@1','A');localStorage.setItem('mho_roam.ath@1','{"otg":{},"tut":1}');localStorage.setItem('mho_story.ath@1','{"seen":1}')`:`localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}))`;
 const E=await enter(URL,{gfx:process.env.GFX||'normal',seed});const {p,errs}=E;p.setDefaultTimeout(900000);
 await p.evaluate(()=>{window.__hf={d:[],on:[],last:performance.now()};const f=()=>{const t=performance.now();__hf.d.push(t-__hf.last);__hf.on.push(!!(window.__wb&&__wb.WBC.on));__hf.last=t;requestAnimationFrame(f)};requestAnimationFrame(f)});
 await E.roamApi();const t0=Date.now();
 while(Date.now()-t0<600000){const s=await p.evaluate(()=>({on:__wb.WBC.on,err:__wb.WBC.err||null}));if(s.on||s.err)break;await p.waitForTimeout(2000)}
 await p.waitForTimeout(15000);
 const r=await p.evaluate(()=>{const S=__wb.WBC.st,d=__hf.d,on=__hf.on;let i0=on.findIndex(x=>x);const dur=d.slice(0,i0),aft=d.slice(i0);const st=a=>{const s=[...a].sort((x,y)=>x-y);return{n:a.length,worst:Math.round(s[s.length-1]||0),p50:Math.round(s[s.length>>1]||0),over50:a.filter(x=>x>50).length,over100:a.filter(x=>x>100).length}};
   return{build:{ms:S.ms,slices:S.slN,slMax:S.slMax,sl50:S.sl50||0,sl100:S.sl100||0,tPrep:S.tPrep,cells:S.cells,err:__wb.WBC.err||null},framesDuringBuild:st(dur),framesAfter:st(aft)}});
 console.log(CITY,'HITCH',JSON.stringify(r));console.log('errors',errs.length,errs.slice(0,3).join(' | '));await E.b.close()})();
