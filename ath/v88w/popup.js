// ath/v88w/popup.js <url> <out.png> : Athens, real keyboard GAS + light steering taps on streets until a roadside pop-up ring spawns, then a 852x393 shot (+ ring distance)
const enter=require('../../bc/enter.js');const URL=process.argv[2],OUT=process.argv[3];
(async()=>{const seed=`localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}));localStorage.setItem('mho_city@1','ath');localStorage.setItem('mho_athd@1','A');localStorage.setItem('mho_roam.ath@1','{"otg":{},"tut":1}');localStorage.setItem('mho_story.ath@1','{"seen":1}')`;
 const E=await enter(URL,{gfx:'normal',seed});const {p,errs}=E;p.setDefaultTimeout(900000);await E.roamApi();await p.evaluate(()=>window.__wb&&window.__wb.fast&&window.__wb.fast());
 await p.evaluate(()=>__g9ev('LVP.cd=0'));await p.keyboard.down('ArrowUp');let got=null;
 for(let t=0;t<240&&!got;t++){await p.waitForTimeout(500);got=await p.evaluate(()=>__g9ev('LVP.c&&LVP.c.st===0?[Math.round(Math.hypot(RO.x-LVP.c.gx,RO.z-LVP.c.gz)),LVP.c.K.name]:null'));
  if(!got&&t%12===11){const k=t%24===11?'ArrowLeft':'ArrowRight';await p.keyboard.down(k);await p.waitForTimeout(250);await p.keyboard.up(k)}
  if(!got&&t%40===39)await p.evaluate(()=>__g9ev('LVP.cd=0'))}
 console.log('popup',JSON.stringify(got));if(got){await p.waitForTimeout(400);await p.screenshot({path:OUT})}
 console.log('errors',errs.length,errs.slice(0,2).join('|').slice(0,300));await E.b.close()})();
