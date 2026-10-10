// tools/ld/tWorld.js <url> <outdir> : the 1490 bank world prop in Frankfurt at 852×393 (phone): where it was placed, street views, the player car
// parked in front for scale (shots only: roam entered directly and the car warped; not a gate test). Prints the prop spot, collider, draw calls.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const [URL,OUT]=process.argv.slice(2);fs.mkdirSync(OUT,{recursive:true});const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await (await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true})).newPage();p.setDefaultTimeout(600000);const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,200))});
 await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:300000});
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}))});
 await p.reload({timeout:600000});await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:300000});
 await p.evaluate(()=>{try{__m1.skip()}catch(e){}__mho.enterRoam()});await p.waitForFunction(()=>__mho.state==='roam'&&!(__mho.LD&&__mho.LD.on),null,{timeout:300000});
 await p.evaluate(()=>{__mho.storyClose&&__mho.storyClose();__mho.roamSim(20);try{__ju.autoClose(true)}catch(e){}});
 const P=await p.evaluate(()=>{const L=__ld.prop;return L.at?{at:L.at,col:L.col}:null});console.log('prop',JSON.stringify(P));console.log('probe',await p.evaluate(()=>{const g=__ld.prop.g[0],T=__ld.THREE;g.updateMatrixWorld(true);const B=new T.Box3().setFromObject(g);let o=g,ch=[];while(o){ch.push((o.name||o.type)+':'+o.visible);o=o.parent}return JSON.stringify({vis:g.visible,tris:__ld.prop.tris,box:[B.min.toArray(),B.max.toArray()].map(v=>v.map(q=>+q.toFixed(1))),chain:ch.slice(0,6),gnd:__mho.gnd(g.position.x,g.position.z,20)})}));if(!P){console.log('NO PROP');await b.close();return}
 const {x,z,yaw}=P.at,y=P.at.y,a=yaw*Math.PI/2,fx=-Math.sin(a),fz=-Math.cos(a);
 const shot=async(n,c)=>{await p.evaluate(c=>__gnb.cam(c),c);await p.waitForTimeout(2500);await p.screenshot({path:`${OUT}/${n}.png`});console.log('shot',n)};
 await shot('w_front',[x+fx*16-fz*6,y+3.2,z+fz*16+fx*6,x,y+1.6,z]);await shot('w_34',[x+fx*12+fz*14,y+6,z+fz*12-fx*14,x,y+1.5,z]);await shot('w_far',[x+fx*45,y+12,z+fz*45,x,y+1,z]);
 // the player car parked on the street side for scale
 await p.evaluate(([X,Z,h])=>{__mho.warp(X,Z,h,1)},[x+fx*(P.col.hd+5),z+fz*(P.col.hd+5),a+Math.PI/2]);await p.evaluate(()=>__mho.roamSim(10));
 await shot('w_car',[x+fx*(P.col.hd+16)-fz*5,y+2.2,z+fz*(P.col.hd+16)+fx*5,x,y+1.2,z]);
 await p.evaluate(()=>__gnb.cam(null));await p.waitForTimeout(1500);await p.screenshot({path:`${OUT}/w_chase.png`});
 const dc=await p.evaluate(()=>({draws:__ld.prop.g.length,tris:Math.round(__ld.prop.tris),vis:__ld.prop.g.map(o=>o.visible)}));console.log('bank draws',JSON.stringify(dc));
 console.log('ERR',errs.length,JSON.stringify(errs.slice(0,5)));await b.close()})();
