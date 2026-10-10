// tools/ld/wDoor.js <url> <outdir> <city fra|ath> : build-6 doorway check. Enters roam, lists every LDraw building with its door box (world m),
// stands a 1.85 m game minifig in each door and shoots it at 852×393 from outside (camera on the line building centre → door).
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const [URL,OUT,CITY]=process.argv.slice(2);fs.mkdirSync(OUT,{recursive:true});const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await (await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true})).newPage();p.setDefaultTimeout(600000);const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error'||/LDW|LD prop/.test(m.text()))errs.push(m.text().slice(0,200))});
 await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:300000});
 await p.evaluate(c=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}));if(c==='ath')localStorage.setItem('mho_city@1','ath')},CITY);
 await p.reload({timeout:600000});await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:300000});
 await p.evaluate(()=>{try{__m1.skip()}catch(e){}__mho.enterRoam()});await p.waitForFunction(()=>__mho.state==='roam'&&!(__mho.LD&&__mho.LD.on),null,{timeout:300000});
 await p.evaluate(()=>{__mho.storyClose&&__mho.storyClose();__mho.roamSim(20);try{__ju.autoClose(true)}catch(e){}});
 const L=await p.evaluate(()=>__wdoor.list());
 for(const E of L){console.log('DOOR',CITY,JSON.stringify(E));if(!E.door)continue;const d=E.door,x=(d.min[0]+d.max[0])/2,z=(d.min[2]+d.max[2])/2,y=d.min[1];
  const C=await p.evaluate(id=>{const e=(__ld.w.on.find(q=>q.id===id)||(id==='bank'?__ld.prop:(__ld.props||[]).find(q=>q.id===id)));return e.col?{x:e.col.x,z:e.col.z}:{x:e.x,z:e.z}},E.id);
  let ux=x-C.x,uz=z-C.z;const n=Math.hypot(ux,uz)||1;ux/=n;uz/=n;
  const F=await p.evaluate(a=>__wdoor.fig(...a),[x+ux*.25,y,z+uz*.25,Math.atan2(ux,uz)]);
  const R=+process.env.WD||5.5;await p.evaluate(c=>__gnb.cam(c),[x+ux*R+uz*R*.35,y+1.6,z+uz*R-ux*R*.35,x,y+1.1,z]);await p.waitForTimeout(2500);
  const f=`${OUT}/door_${E.id}_${CITY}.png`;await p.screenshot({path:f});console.log('shot',f,'fig',JSON.stringify(F),'opening≈',d.h,'m')}
 console.log('ERR',JSON.stringify(errs.slice(0,6)));await b.close()})();
