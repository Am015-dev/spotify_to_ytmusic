// tShot6.js — pART6 review shots at 852x393 (canvas read back right after a render, HUD composited by the page screenshot)
// usage: node tools/tShot6.js <url-of-local_dbg.html> <outdir>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const URL=process.argv[2],OUT=process.argv[3]||'shots6';fs.mkdirSync(OUT,{recursive:true});
const INIT=`(()=>{const q=[];let t=0;window.requestAnimationFrame=cb=>{q.push(cb);return q.length};window.cancelAnimationFrame=()=>{};
 window.__tick=n=>{for(let i=0;i<n;i++){t+=1000/60;const c=q.splice(0);for(const f of c){try{f(t)}catch(e){setTimeout(()=>{throw e})}}}return t};
 setInterval(()=>{if(window.__auto)window.__tick(1)},16);window.__auto=true})();`;
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true});const p=await ctx.newPage();p.setDefaultTimeout(900000);
const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,200)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,200))});
await p.addInitScript(INIT);const tick=n=>p.evaluate(n=>__tick(n),n);
const shot=async n=>{await p.evaluate(()=>{const c=document.querySelector('canvas#c')||document.querySelector('canvas');__tick(1);const url=c.toDataURL('image/png');let im=document.getElementById('__cs');if(!im){im=document.createElement('img');im.id='__cs';document.body.appendChild(im)}const r=c.getBoundingClientRect();Object.assign(im.style,{position:'fixed',left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',zIndex:getComputedStyle(c).zIndex==='auto'?0:getComputedStyle(c).zIndex,pointerEvents:'none'});c.after(im);return new Promise(res=>{im.onload=res;im.src=url})});await p.screenshot({path:`${OUT}/${n}.png`});await p.evaluate(()=>{const im=document.getElementById('__cs');if(im)im.remove()});console.log('shot',n)};
const camOv=(o)=>p.evaluate(o=>{const D=__dbg;if(!D.__or){D.__or=D.composer.render.bind(D.composer);D.composer.render=function(){const c=window.__cam;if(c){const R=__mho.RO;const P=c.f();D.camera.position.set(P[0],P[1],P[2]);D.camera.lookAt(P[3],P[4],P[5]);D.camera.updateMatrixWorld()}return D.__or.apply(this,arguments)}}window.__cam=o?{f:new Function('return '+o)()}:null},o);
const gap=()=>p.evaluate(()=>{const M=__mho,D=__dbg,T=D.THREE,s=M.pl;const B=new T.Box3();s.mesh.updateMatrixWorld(true);B.makeEmpty();s.mesh.traverse(o=>{if(o.isMesh&&o.visible&&o.geometry&&!(o.material&&o.material.transparent)){o.geometry.computeBoundingBox();const b=o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld);B.union(b)}});const R=M.RO;const x=s.mesh.position.x,z=s.mesh.position.z;return{minY:+B.min.y.toFixed(3),ground:+M.gnd(x,z,B.min.y+1).toFixed(3),gap:+(B.min.y-M.gnd(x,z,B.min.y+1)).toFixed(3)}});
const shadows=()=>p.evaluate(()=>{const D=__dbg;let vis=[];D.scene.traverse(o=>{if(!o.isMesh)return;const m=o.material;if(!m||Array.isArray(m)||!m.map||!m.transparent)return;const g=o.geometry;if(!g||g.type!=='PlaneGeometry')return;let v=true;for(let a=o;a;a=a.parent)if(!a.visible){v=false;break}if(v&&m.color&&m.color.r+m.color.g+m.color.b<.05&&(m.blending===1))vis.push(o.name||o.type)});return vis.length});
// 1 start
await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});await p.evaluate(()=>{window.__auto=false});await tick(30);await shot('1_start');
// city roam
await p.evaluate(()=>__mho.enterRoam());await p.evaluate(()=>{window.__auto=true});for(let i=0;i<300;i++){if(await p.evaluate(()=>__mho.state==='roam'&&!(__mho.LD&&__mho.LD.on)))break;await p.waitForTimeout(2000)}
await p.evaluate(()=>{window.__auto=false});await tick(60);
// open road: the Mainkai straight near the start; hold gas 4 s with the real keyboard
await p.keyboard.down('ArrowUp');await tick(240);await p.keyboard.up('ArrowUp');await tick(4);await shot('2_fra_drive');
await tick(90);console.log('gap_player',JSON.stringify(await gap()),'dark_blob_planes_visible',await shadows());
await camOv(`(()=>{const R=__mho.RO,s=Math.sin(R.h),c=Math.cos(R.h);return[R.x+c*4,R.y+.5,R.z-s*4,R.x,R.y+.45,R.z]})()`);await tick(2);await shot('4_side_player');
// nearest city traffic car, side view at 4 m / 0.5 m
await camOv(`(()=>{const R=__mho.RO;let b=null,bd=1e9;for(const c of __mho.HUB.cars){if(c.dead)continue;const d=Math.hypot(c.x-R.x,c.z-R.z);if(d<bd&&d>6){bd=d;b=c}}window.__tc=b;const h=Math.atan2((b.x-(b.px??b.x))||1e-6,(b.z-(b.pz??b.z))||1);return[b.x+Math.cos(h)*4,b.y+.5,b.z-Math.sin(h)*4,b.x,b.y+.45,b.z]})()`);await tick(2);await shot('5_side_traffic');
await camOv(`(()=>{const R=__mho.RO,s=Math.sin(R.h),c=Math.cos(R.h);return[R.x-s*7+c*3,R.y+3.2,R.z-c*7-s*3,R.x,R.y+.3,R.z]})()`);await tick(2);await shot('7_city_car_no_shadow');await camOv(null);
// race jump mid-air: GLEISFELD on the Grand circuit, Rookie, time trial, hold gas from 900 m before
await p.evaluate(()=>{const M=__mho;M.setOpt('tab','tt');M.setOpt('cls','rookie');M.setOpt('track','grand');M.startRace()});for(let i=0;i<400;i++){await tick(10);if(await p.evaluate(()=>__mho.state==='race'))break}
const J=await p.evaluate(()=>{const j=__mho.TD.jumps.find(j=>j.id==='gleis');const P=__mho.pl;P.dist=j.s0-900;P.v=0;P.x=7;return{s0:j.s0,s1:j.s1}});
await p.keyboard.down('ArrowUp');for(let f=0;f<4000;f+=2){const o=await p.evaluate(()=>{const P=__mho.pl;return{a:!!P.air,t:P.air?P.air.t:0,d:P.dist}});if(o.a&&o.t>1.1)break;await tick(2)}
await shot('6_jump_midair');await p.keyboard.up('ArrowUp');
// Athens drive
await p.evaluate(()=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_city@1','ath');localStorage.setItem('mho_athd@1','A');localStorage.setItem('mho_roam.ath@1','{"otg":{}}');localStorage.setItem('mho_story.ath@1','{"seen":1}')});
await p.evaluate(()=>{window.__auto=true});await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
await p.evaluate(()=>__mho.enterRoam());for(let i=0;i<300;i++){if(await p.evaluate(()=>__mho.state==='roam'&&!(__mho.LD&&__mho.LD.on)))break;await p.waitForTimeout(2000)}
await p.evaluate(()=>{window.__auto=false});await tick(60);await p.keyboard.down('ArrowUp');await tick(240);await p.keyboard.up('ArrowUp');await tick(4);await shot('3_ath_drive');
console.log('gap_player_ath',JSON.stringify(await gap()));
console.log('ERRS',JSON.stringify(errs.slice(0,6)));await b.close()})();
