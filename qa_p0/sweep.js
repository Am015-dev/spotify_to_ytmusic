// qa_p0/sweep.js: warp to N street nodes across the city; per point: is there VISIBLE ground/road under the car, near cull entries hidden, visible meshes within 60 m.
// usage: node qa_p0/sweep.js <url> <outdir> [n] [quality]
const fs=require('fs');const{chromium,INIT}=require('../tools/d24lib');const URL=process.argv[2],OUT=process.argv[3]||'qa_p0/sw',N=+process.argv[4]||60,Q=process.argv[5]||'';fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:1910,height:895},deviceScaleFactor:1});const p=await ctx.newPage();p.setDefaultTimeout(900000);
 const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,200)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,200))});
 await p.addInitScript(INIT(60));await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
 await p.evaluate(q=>{localStorage.clear();localStorage.setItem('mho_slot','1');if(q)localStorage.setItem('mho_set',JSON.stringify({q}))},Q);await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
 await p.click('#hcStory');await p.evaluate(()=>__tick(10));await p.click('#slotList .go');
 for(let i=0;i<150;i++){try{if(await p.evaluate(()=>window.__mho&&__mho.state==='roam'))break}catch(e){}await p.waitForTimeout(2000)}await p.evaluate(()=>{window.__auto=false});
 await p.evaluate(()=>{for(let i=0;i<20;i++){__tick(5);for(const s of['#storyGo','#rcGo','.m1go','#tutSkip','#m1Cs']){const e=document.querySelector(s);if(e&&!e.hidden&&e.offsetWidth)e.click()}}});
 const res=await p.evaluate(([N])=>__g9ev(`(()=>{try{if(RO.ch)chEnd(false)}catch(e){}const G=qvGraph(),out=[];const rc=new THREE.Raycaster();const wv=o=>{for(let q=o;q;q=q.parent)if(!q.visible)return false;return true};
  const idx=[];for(let k=0;k<${N};k++)idx.push(Math.floor((k+.5)*G.n/${N}));
  for(const i of idx){const x=G.X[i],z=G.Z[i];RO.ftT=0;const need=lzNeed(x,z);for(const L of need)lzRun(L);RO.ch=null;roamWarp(x,z,0);__tick(20);
   rc.set(new THREE.Vector3(RO.x,RO.y+60,RO.z),new THREE.Vector3(0,-1,0));rc.far=200;const H=rc.intersectObject(HUB.grp,true).filter(h=>wv(h.object));
   const top=H[0],gnd=H.find(h=>Math.abs(h.point.y-RO.y)<2.5);let nv=0,nh=0;const cx=camera.position.x,cz=camera.position.z;for(const c of HUB.cull){const d=Math.hypot(c.x-cx,c.z-cz)-c.r;if(d<60){if(c.o.visible)nv++;else nh++}}
   out.push({i,x:Math.round(x),z:Math.round(z),y:+RO.y.toFixed(1),gnd:!!gnd,gy:gnd?+gnd.point.y.toFixed(2):null,top:top?(top.object.name||top.object.type)+'@'+top.point.y.toFixed(1):null,nv,nh,lv:LK_lvl(),q:SET.q,cull:HUB.cull.length})}
  return JSON.stringify(out)})()`),[N]);
 const R=JSON.parse(res);fs.writeFileSync(OUT+'/sweep.json',JSON.stringify(R,null,1));const bad=R.filter(r=>!r.gnd||r.nh>0);console.log('points',R.length,'bad',bad.length);for(const r of bad.slice(0,30))console.log(JSON.stringify(r));
 console.log('sample',JSON.stringify(R.slice(0,3)));console.log('errors',errs.length,JSON.stringify(errs.slice(0,8)));await b.close()})();
