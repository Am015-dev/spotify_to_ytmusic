// TR probe: renderer.info (whole composed frame) + chase and aerial screenshots at 6 fixed spots. node trshots.js <tag>  -> shots/tr_<tag>_*.jpg, shots/tr_<tag>.json
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const TAG=process.argv[2]||'after',U='http://127.0.0.1:8766/local_dbg.html';fs.mkdirSync('shots',{recursive:true});
// [name, city, district, e, n, heading(deg, 0 = north), aerial offset]
const SPOTS=[['fra_roemer','fra','',-60,-90,0],['fra_sachs','fra','',700,-1150,180],['fra_hbf','fra','',-1300,-300,90],
 ['athA_plaka','ath','A',150,-330,250],['athA_filo','ath','A',-250,-700,200],['athB_lyka','ath','B',1300,500,70]];
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const out={};
 for(const key of [...new Set(SPOTS.map(s=>s[1]+s[2]))]){const p=await (await b.newContext({viewport:{width:960,height:540}})).newPage();p.setDefaultTimeout(900000);const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto(U);await p.waitForFunction(()=>window.__mho&&window.__mho.state==='menu');const city=key.slice(0,3),d=key.slice(3);
  await p.evaluate(([city,d])=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_city@1',city);if(d)localStorage.setItem('mho_athd@1',d);for(const k of['mho_roam@1','mho_roam.ath@1'])localStorage.setItem(k,'{"tut":1,"otg":{}}');localStorage.setItem('mho_story.ath@1','{"seen":1}');localStorage.setItem('mho_story@1','{"ath":1,"seen":1}')},[city,d]);
  await p.reload();await p.waitForFunction(()=>window.__mho&&window.__mho.state==='menu');await p.evaluate(()=>__mho.enterRoam());await p.waitForFunction(()=>__mho.state==='roam');await p.evaluate(()=>{try{__mho.storyClose()}catch(e){}});
  await p.evaluate(()=>{window.__fastR=__dbg.composer.render;__dbg.composer.render=()=>{}});
  for(const S of SPOTS.filter(s=>s[1]+s[2]===key)){const[name,,, e,n,hd]=S;
   await p.evaluate(([e,n,hd])=>{const M=__mho,[x,z]=M.W(e,n),q=M.rsnap(x,z,150)||[x,z];M.warp(q[0],q[1],hd*Math.PI/180);M.roamSim(90)},[e,n,hd]);
   for(const mode of['chase','aerial']){const info=await p.evaluate(mode=>{const D=__dbg,R=D.renderer,C=D.camera,M=__mho,RO=M.RO;R.info.autoReset=false;R.info.reset();
      window.__tw=mode==='aerial'?()=>{C.position.set(RO.x-Math.sin(RO.h)*180,RO.y+160,RO.z-Math.cos(RO.h)*180);C.lookAt(RO.x,RO.y,RO.z)}:null;return 1},mode);
    await p.evaluate(()=>{__dbg.composer.render=(...a)=>{if(window.__tw)window.__tw();__dbg.renderer.info.reset();window.__fastR.apply(__dbg.composer,a);window.__inf={calls:__dbg.renderer.info.render.calls,tris:__dbg.renderer.info.render.triangles}}});
    await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await p.screenshot({path:`shots/tr_${TAG}_${name}_${mode}.jpg`,quality:70,timeout:600000});
    const inf=await p.evaluate(()=>{__dbg.composer.render=()=>{};const RO=__mho.RO;return{...window.__inf,x:+RO.x.toFixed(0),z:+RO.z.toFixed(0),y:+RO.y.toFixed(1)}});out[name+'_'+mode]=inf;console.log(name,mode,JSON.stringify(inf))}}
  if(errs.length)console.log('ERRS',key,errs.slice(0,3));await p.context().close()}
 fs.writeFileSync(`shots/tr_${TAG}.json`,JSON.stringify(out,null,1));await b.close()})();
