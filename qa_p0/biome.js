// qa_p0/biome.js: real fastTravel (loading-screen path, no forced lzRun) to every lazy biome centre + shots. usage: node qa_p0/biome.js <url> <out> [q]
const fs=require('fs');const{chromium,INIT}=require('../tools/d24lib');const URL=process.argv[2],OUT=process.argv[3],Q=process.argv[4]||'';fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:1910,height:895},deviceScaleFactor:1});const p=await ctx.newPage();p.setDefaultTimeout(900000);
 const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,200)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,200))});
 await p.addInitScript(INIT(60));await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
 await p.evaluate(q=>{localStorage.clear();localStorage.setItem('mho_slot','1');if(q)localStorage.setItem('mho_set',JSON.stringify({q}))},Q);await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
 await p.click('#hcStory');await p.evaluate(()=>__tick(10));await p.click('#slotList .go');
 for(let i=0;i<150;i++){try{if(await p.evaluate(()=>window.__mho&&__mho.state==='roam'))break}catch(e){}await p.waitForTimeout(2000)}await p.evaluate(()=>{window.__auto=false});
 await p.evaluate(()=>{for(let i=0;i<20;i++){__tick(5);for(const s of['#storyGo','#rcGo','.m1go','#tutSkip','#m1Cs']){const e=document.querySelector(s);if(e&&!e.hidden&&e.offsetWidth)e.click()}}});
 await p.evaluate(()=>__g9ev(`try{if(RO.ch)chEnd(false)}catch(e){}`));
 const L=JSON.parse(await p.evaluate(()=>__g9ev(`JSON.stringify(LAZY.filter(L=>!L.woods).map(L=>[L.id,(L.rect[0]+L.rect[1])/2,(L.rect[2]+L.rect[3])/2]))`)));console.log('biomes',JSON.stringify(L));
 const shot=async n=>{await p.evaluate(()=>{window.__shooting=1;if(window.__fastR){__dbg.composer.render=window.__fastR;window.__fastR=null}__tick(1)});await p.screenshot({path:OUT+'/'+n+'.jpg',type:'jpeg',quality:60});await p.evaluate(()=>{window.__shooting=0})};
 for(const[id,x,z]of L){const r=await p.evaluate(([x,z])=>__g9ev(`(()=>{const q=rfSnap(${x},${z},600);const m={x:q[0]-Math.sin(q[2])*26,z:q[1]-Math.cos(q[2])*26,h:q[2],kind:'garage',name:'T'};RO.ftT=0;RO.ch=null;RO.sp=null;return fastTravel(m)})()`),[x,z]);
  for(let w=0;w<120;w++){await p.evaluate(()=>{window.__auto=true});await p.waitForTimeout(250);if(await p.evaluate(()=>!window.LD_busy&&__mho.state==='roam'))if(w>8)break}
  await p.evaluate(()=>{window.__auto=false;__tick(30)});
  const info=await p.evaluate(()=>__g9ev(`(()=>{const rc=new THREE.Raycaster();rc.camera=camera;const wv=o=>{for(let q=o;q;q=q.parent)if(!q.visible)return false;return true};rc.set(new THREE.Vector3(RO.x,RO.y+60,RO.z),new THREE.Vector3(0,-1,0));const H=rc.intersectObject(HUB.grp,true).filter(h=>wv(h.object));const g=H.find(h=>Math.abs(h.point.y-RO.y)<2.5);let nh=0;for(const c of HUB.cull){if(Math.hypot(c.x-camera.position.x,c.z-camera.position.z)-c.r<60&&!c.o.visible)nh++}return JSON.stringify({x:Math.round(RO.x),z:Math.round(RO.z),y:+RO.y.toFixed(1),gnd:!!g,nh,lv:LK_lvl(),st:state,lzDone:LAZY.filter(L=>L.done).length})})()`));
  console.log(id,r,info);await shot('bio_'+id)}
 console.log('errors',errs.length,JSON.stringify(errs.slice(0,8)));await b.close()})();
