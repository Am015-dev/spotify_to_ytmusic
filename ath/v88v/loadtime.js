// ath/v88v/loadtime.js <url> fra|ath : seconds from enterRoam() to roam (loading screen gone), + WBC prep/pix ms
const enter=require('../../bc/enter.js');const URL=process.argv[2],CITY=process.argv[3]||'fra';
(async()=>{const seed=CITY==='ath'?`localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}));localStorage.setItem('mho_city@1','ath');localStorage.setItem('mho_athd@1','A');localStorage.setItem('mho_roam.ath@1','{"otg":{},"tut":1}');localStorage.setItem('mho_story.ath@1','{"seen":1}')`:`localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}))`;
 const E=await enter(URL,{gfx:process.env.GFX||'normal',seed});const {p}=E;p.setDefaultTimeout(900000);
 const t=await p.evaluate(async()=>{const t0=performance.now();__mho.enterRoam();await new Promise(r=>{const w=()=>__mho.state==='roam'&&!(__mho.LD&&__mho.LD.on)?r():setTimeout(w,20);w()});return performance.now()-t0});
 const s=await p.evaluate(()=>window.__wb?{tPrep:__wb.WBC.st.tPrep,tPix:__wb.WBC.st.tPix}:{});console.log(CITY,'LOAD_S',(t/1000).toFixed(2),JSON.stringify(s));await E.b.close()})();
