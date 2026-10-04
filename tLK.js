// tLK.js — LK perf/looks bench: renderer.info draw calls + triangles at 6 fixed spots in Frankfurt and in Athens (district A),
// one full composer frame per spot (all passes counted), plus screenshots of spots 0 and 3.
// usage: node tLK.js <dir> [q=high|med|low] [tag]   → <dir>/lk/<tag>.json + <tag>_<city><i>.jpg
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const path=require('path');const F=require('./fast.js');
const DIR=process.argv[2]||'.',Q=process.argv[3]||'high',TAG=process.argv[4]||Q;const U=`http://127.0.0.1:8766/${DIR}/local_dbg.html`;
const OUT=path.join(__dirname,DIR,'lk');fs.mkdirSync(OUT,{recursive:true});
const seed=(p,c,d)=>p.evaluate(([c,d,q])=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_city@1',c);if(d)localStorage.setItem('mho_athd@1',d);
 localStorage.setItem('mho_set',JSON.stringify({q,dres:'off',res:'std'}));const k=c==='ath'?'.ath':'';localStorage.setItem('mho_roam'+k+'@1','{"tut":1,"otg":{}}');if(c==='ath')localStorage.setItem('mho_story.ath@1','{"seen":1}')},[c,d,Q]).then(()=>p.reload()).then(()=>p.waitForFunction(()=>window.__mho&&__mho.state==='menu'));
const measure=p=>p.evaluate(()=>{const r=__dbg.renderer,i=r.info;i.autoReset=false;i.reset();const t=performance.now();window.__fastR.call(__dbg.composer);const ms=performance.now()-t;
 const o={calls:i.render.calls,tris:i.render.triangles,ms:Math.round(ms),geo:i.memory.geometries,tex:i.memory.textures,prog:i.programs.length};i.autoReset=true;return o});
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const res={q:Q,spots:{}};const errs=[];
 for(const [city,d] of [['fra',null],['ath','A']]){const ctx=await b.newContext({viewport:{width:960,height:540}});const p=await ctx.newPage();p.setDefaultTimeout(900000);await p.addInitScript(()=>{let s=12345;Math.random=()=>(s=(s*16807)%2147483647)/2147483647});
  p.on('pageerror',e=>errs.push(e.message.slice(0,160)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,160))});
  const t0=Date.now();await p.goto(U);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu');await seed(p,city,d);const boot=Date.now()-t0;
  const t1=Date.now();await p.evaluate(()=>__mho.enterRoam());await p.waitForFunction(()=>__mho.state==='roam',null,{polling:200});const enter=Date.now()-t1;
  await F.on(p);await p.evaluate(()=>{try{__mho.storyClose()}catch(e){}try{window.__m1&&__m1.skip&&__m1.skip()}catch(e){}__mho.roamSim(30)});
  const S=await p.evaluate(()=>{const M=__mho,R=M.RO,x0=R.x,z0=R.z,o=[];for(let i=0;i<6;i++){const D=i*260,a=i*1.05;const q=M.rsnap(x0+Math.sin(a)*D,z0+Math.cos(a)*D,500)||[x0,z0];o.push([+q[0].toFixed(1),+q[1].toFixed(1),+(a+.6).toFixed(2)])}return o});
  res.spots[city]={boot,enter,pts:[]};
  for(let i=0;i<S.length;i++){const [x,z,h]=S[i];await p.evaluate(([x,z,h])=>{const M=__mho;M.warp(x,z,h);M.roamSim(90)},[x,z,h]);
   await measure(p);const m=await measure(p);res.spots[city].pts.push({i,x,z,...m});console.log(city,i,JSON.stringify(m));
   if(i===0||i===3)await F.shot(p,path.join(OUT,`${TAG}_${city}${i}.jpg`),{type:'jpeg',quality:72})}
  // auto quality: feed 40 ms frames (a struggling phone) → the ladder steps down; measure each level at the last spot; the saved setting stays the player's
  if(Q==='high'&&city==='fra'&&await p.evaluate(()=>!!window.__lk)){res.tiers=[];for(let k=0;k<4;k++){const lv=await p.evaluate(()=>__lk.lvl());await p.evaluate(()=>__mho.roamSim(20));const m=await measure(p);
    const sh=await p.evaluate(()=>__dbg.renderer.shadowMap.enabled);res.tiers.push({lv,shadow:sh,...m});console.log('tier',lv,sh,JSON.stringify(m));if(k===2)await F.shot(p,path.join(OUT,`${TAG}_fra_min.jpg`),{type:'jpeg',quality:72});
    await p.evaluate(()=>{__lk.LK.since=9e9;__lk.feed(40,80)})}
   res.saved=await p.evaluate(()=>{__lk.save();return JSON.parse(localStorage.getItem('mho_set')||'{}').q});
   res.recover=await p.evaluate(()=>{const o=[];for(let k=0;k<3;k++){__lk.LK.since=9e9;__lk.feed(8,400);o.push(__lk.lvl())}return o});
   res.fx=await p.evaluate(()=>{const M=__mho,b=__lk.pools();M.RO.turbo=2;M.roamSim(4);const n=__lk.pools();__lk.boom();const c=__lk.pools();return{before:b,boost:n,crash:c}});
   console.log('tiers saved',res.saved,'recover',res.recover,'fx',JSON.stringify(res.fx))}
  await ctx.close()}
 for(const c in res.spots){const P=res.spots[c].pts;res.spots[c].avgCalls=Math.round(P.reduce((a,o)=>a+o.calls,0)/P.length);res.spots[c].avgTris=Math.round(P.reduce((a,o)=>a+o.tris,0)/P.length)}
 res.errs=errs;fs.writeFileSync(path.join(OUT,TAG+'.json'),JSON.stringify(res,null,1));console.log('LK_BENCH',TAG,JSON.stringify(Object.fromEntries(Object.entries(res.spots).map(([k,v])=>[k,{calls:v.avgCalls,tris:v.avgTris,boot:v.boot,enter:v.enter}]))),'errs',errs.length);await b.close()})();
