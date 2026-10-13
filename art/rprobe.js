// art/rprobe.js <url> <code-file> [fra|ath]: enter roam, eval the code file in module scope (__g9ev), print the result
const enter=require('../bc/enter.js');const fs=require('fs');
(async()=>{const [URL,CF,city]=process.argv.slice(2);const seed=`localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}));`+(city==='ath'?`localStorage.setItem('mho_city@1','ath');localStorage.setItem('mho_athd@1','A');localStorage.setItem('mho_roam.ath@1','{"otg":{},"tut":1}');localStorage.setItem('mho_story.ath@1','{"seen":1}')`:'');
 const E=await enter(URL,{gfx:process.env.GFX||'normal',seed});const p=E.p;p.setDefaultTimeout(1800000);await E.roamApi();
 for(const part of fs.readFileSync(CF,'utf8').split('\n//---\n')){if(part.startsWith('//WAIT ')){await p.waitForTimeout(+part.slice(7));continue}if(part.startsWith('//SHOT ')){const f=part.slice(7).trim();await p.waitForTimeout(5000);await p.screenshot({path:f});console.log('shot',f);continue}
  const r=await p.evaluate(c=>{try{return String(__g9ev(c))}catch(e){return 'ERR '+e.stack}},part);if(r.startsWith('td ')){const d=await p.evaluate(()=>window.__td);fs.writeFileSync(process.env.TD||'/tmp/claude-0/td.png',Buffer.from(d.split(',')[1],'base64'))}console.log(r)}
 console.log('errors',E.errs.length,E.errs.slice(0,3).join(' | ').slice(0,300));await E.b.close()})();
