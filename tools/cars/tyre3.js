// tyre.js <url> [city]: player at rest in roam: per wheel, sim bottom (centre - r*scale) vs precise world bbox min.y vs groundAt at the wheel; also AI race cars + city traffic samples
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const [URL,CITY='fra',WX='1920',WZ='-79',WH='3.14159']=process.argv.slice(2);const br=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await (await br.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true})).newPage();p.setDefaultTimeout(600000);
await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
await p.evaluate(c=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_athpre','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}));if(c==='ath')localStorage.setItem('mho_city@1','ath')},CITY);await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
await p.evaluate(()=>{try{__m1.skip()}catch(e){}__mho.enterRoam()});await p.waitForFunction(()=>__mho.state==='roam');await p.evaluate(()=>__mho.storyClose&&__mho.storyClose());await p.waitForTimeout(2500);
await p.evaluate(()=>{window.requestAnimationFrame=()=>0;__ju.autoClose(true)});
await p.evaluate(([WX,WZ,WH])=>{__m1.warp(+WX,+WZ,+WH);__dbg.RO.v=0;__ju.step(90)},[WX,WZ,WH]);
await p.keyboard.down('ArrowUp');const S=[];
for(let k=0;k<150;k++){const q=await p.evaluate(()=>{__ju.step(3);const {THREE}=__dbg,R=__dbg.RO,P=__dbg.PL,B=new THREE.Box3(),c=new THREE.Vector3();P.mesh.updateMatrixWorld(true);const o=[];P.mesh.traverse(w=>{if(!w.isMesh||!w.userData.r)return;let v=true,q=w;while(q){if(!q.visible)v=false;q=q.parent}if(!v)return;B.setFromObject(w,true);w.getWorldPosition(c);const g=__dbg.GA(c.x,c.z,c.y+1);o.push(+(B.min.y-g).toFixed(3))});return{kmh:+(R.v*3.6).toFixed(0),air:!!P.air,o}});if(!q.air)S.push(q)}
const all=S.flatMap(s=>s.o);all.sort((a,b)=>a-b);console.log(JSON.stringify({n:S.length,min:all[0],p05:all[Math.floor(all.length*.05)],p50:all[Math.floor(all.length*.5)],p95:all[Math.floor(all.length*.95)],max:all[all.length-1],below5cm:all.filter(x=>x<-.05).length,above5cm:all.filter(x=>x>.05).length,kmhMax:Math.max(...S.map(s=>s.kmh)),worst:S.filter(s=>Math.min(...s.o)<-.05).slice(0,5)}));
await br.close()})();
