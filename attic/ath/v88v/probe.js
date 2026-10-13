// wb/probe.js <url> fra|ath "<js expr evaluated after roam entry (async ok)>"
const enter=require('../../bc/enter.js');const URL=process.argv[2],CITY=process.argv[3]||'fra';
(async()=>{const seed=CITY==='ath'?`localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}));localStorage.setItem('mho_city@1','ath');localStorage.setItem('mho_athd@1','A');localStorage.setItem('mho_roam.ath@1','{"otg":{},"tut":1}');localStorage.setItem('mho_story.ath@1','{"seen":1}')`:`localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}))`;
 const E=await enter(URL,{gfx:'normal',seed});const {p,errs}=E;p.setDefaultTimeout(900000);await E.roamApi();await p.waitForTimeout(3000);
 console.log(await p.evaluate(s=>eval(s),process.argv[4]));console.log('errors',errs.length,errs.slice(0,2).join('|').slice(0,300));await E.b.close()})();
