// art/lvshots.js <url> <outdir> fra|ath [ids]: liveliness spots: shot (852x393, normal gfx, HUD hidden) + __lvm.measure() per spot
const enter=require('../bc/enter.js');const fs=require('fs');
(async()=>{const [URL,OUT,city,ids]=process.argv.slice(2);fs.mkdirSync(OUT,{recursive:true});
 const seed=`localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}));`+(city==='ath'?`localStorage.setItem('mho_city@1','ath');localStorage.setItem('mho_athd@1','A');localStorage.setItem('mho_roam.ath@1','{"otg":{},"tut":1}');localStorage.setItem('mho_story.ath@1','{"seen":1}')`:'');
 const E=await enter(URL,{gfx:process.env.GFX||'normal',seed});const p=E.p;p.setDefaultTimeout(900000);await E.roamApi();
 await p.evaluate(()=>{try{__mho.storyClose&&__mho.storyClose()}catch(e){}try{__ju.autoClose(true)}catch(e){}});
 const hide=()=>p.evaluate(()=>{const cv=document.querySelector('canvas');for(const e of document.body.querySelectorAll('*'))if(e!==cv&&!e.contains(cv)&&e.tagName!=='CANVAS')e.style.visibility='hidden'});
 const S=await p.evaluate(c=>__lvm.SPOTS[c].map(s=>s[0]),city);const res={};
 for(const id of S){if(ids&&!ids.split(',').includes(id))continue;const g=await p.evaluate(([c,id])=>__lvm.go(c,id),[city,id]);if(!g){console.log('SPOT',id,'no warp');continue}
  await p.waitForTimeout(+(process.env.WAIT||7000));await hide();const m=await p.evaluate(()=>__lvm.measure());const f=await p.evaluate(([id,m])=>__lvm.pass(id,m),[id,m]);
  await p.screenshot({path:`${OUT}/${city}_${id}.png`});res[id]=Object.assign({at:g},m,{fail:f});
  console.log(`LV ${city} ${id.padEnd(9)} green ${String(m.green).padStart(5)}% props ${String(m.props).padStart(4)} life ${String(m.life).padStart(3)} hr ${String(m.hr).padStart(5)} cols ${String(m.cols).padStart(3)} ${f.length?'FAIL '+f.join(', '):'PASS'}`)}
 fs.writeFileSync(`${OUT}/${city}.json`,JSON.stringify(res));console.log('errors',E.errs.length,E.errs.slice(0,3).join(' | ').slice(0,300));await E.b.close()})();
