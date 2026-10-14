// tGfx (gfx-1): one browser, boots ?test=<city>&q=<tier>, dumps renderer/light/material state, frame time, one 852x393 shot per city.
//   node tools/tGfx.js <base url> <outdir> [q=high] [extra query, e.g. gfx=1]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const BASE=process.argv[2],OUT=process.argv[3]||'qa_gfx',Q=process.argv[4]||'high',EX=process.argv[5]||'';fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1});const p=await ctx.newPage();p.setDefaultTimeout(420000);const errs=[];
 p.on('pageerror',e=>errs.push(String(e).slice(0,200)));
 const R={};for(const c of(process.env.CITIES||'fra,ath').split(',')){const t=Date.now();
  await p.goto(BASE+'?test='+c+'&q='+Q+'&draw=0'+(EX?'&'+EX:''));await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250});
  await p.evaluate(()=>{__tq.o.draw=1});await p.waitForTimeout(4000);
  R[c]=await p.evaluate(()=>{const A=window.__art,r=A.renderer,T=A.THREE,sc=A.scene;const tm={};for(const k in T)if(/ToneMapping$/.test(k))tm[T[k]]=k;
   const lights=[];sc.traverse(o=>{if(o.isLight)lights.push([o.type,'#'+o.color.getHexString(),+o.intensity.toFixed(2),!!o.castShadow,o.castShadow?o.shadow.mapSize.x:0])});
   const mats={},seen=new Set();let casters=0,recv=0,meshes=0;sc.traverse(o=>{if(!o.isMesh||!o.visible)return;meshes++;if(o.castShadow)casters++;if(o.receiveShadow)recv++;for(const m of[].concat(o.material)){if(!m||seen.has(m))continue;seen.add(m);const k=m.type;const e=mats[k]||(mats[k]={n:0,rough:0,metal:0,env:0});e.n++;if(m.roughness!=null){e.rough+=m.roughness;e.metal+=m.metalness}}});
   for(const k in mats){const e=mats[k];e.rough=+(e.rough/e.n).toFixed(2);e.metal=+(e.metal/e.n).toFixed(2)}
   return{tone:tm[r.toneMapping],exp:r.toneMappingExposure,cs:r.outputColorSpace,shadowMap:r.shadowMap.enabled,shType:r.shadowMap.type,lights,envI:sc.environmentIntensity,hasEnv:!!sc.environment,
    fog:sc.fog&&[sc.fog.type,'#'+sc.fog.color.getHexString(),sc.fog.density],bloom:A.bloom&&[A.bloom.strength,A.bloom.radius,A.bloom.threshold,A.bloom.enabled],meshes,casters,recv,mats,mood:A.MOOD&&A.MOOD.id,gfx:window.__gfx&&__gfx.state()}});
  // frame time: 60 rAF frames
  R[c].ms=await p.evaluate(()=>new Promise(res=>{let n=0,t0=0;const f=t=>{if(n===2)t0=t;if(++n<12)requestAnimationFrame(f);else res(+((t-t0)/10).toFixed(1))};requestAnimationFrame(f)}));
  if(process.env.NOMS)R[c].ms=null;
  if(process.env.EVAL)R[c].ev=await p.evaluate(process.env.EVAL);
  R[c].info=await p.evaluate(()=>{const r=__art.renderer,i=r.info;i.autoReset=false;i.reset();const composer_render=window.__gfx&&__gfx.render;if(composer_render)composer_render();const o={calls:i.render.calls,tris:i.render.triangles};i.autoReset=true;return o});
  R[c].shChk=await p.evaluate(()=>window.__gfx&&__gfx.shChk());
  await p.screenshot({path:OUT+'/'+c+'.png'});R[c].boot=((Date.now()-t)/1000).toFixed(1);}
 // checklist auto-checks (src/99c_checklist.js v90n/gfx-*): one PASS/FAIL line per city and test
 for(const c of Object.keys(R)){const g=R[c].gfx,h=R[c].shChk;if(!g)continue;const cc=parseInt(g.carCast)||0;
  const T={'gfx-sun':g.tone==='ACES'&&g.sunEl>=20&&g.sunEl<=40&&g.hemi<=.7,'gfx-shadow':g.shadowMap&&g.sunCast&&g.map===(Q==='high'?2048:1024)&&cc>0&&h&&h.car<h.road-.05,
   'gfx-plastic':g.plRough>=.2&&g.plRough<=.45&&g.plMetal<.2&&g.plEnv>=.8};for(const k in T)console.log((T[k]?'PASS ':'FAIL ')+Q+' '+c+' v90n/'+k);console.log('info',Q,c,JSON.stringify(R[c].info))}
 R.errs=errs.slice(0,5);fs.writeFileSync(OUT+'/state.json',JSON.stringify(R,null,1));if(process.env.JSONOUT)console.log(JSON.stringify(R));console.log('errors',errs.length);await b.close()})().catch(e=>{console.log('FAIL',e.message.slice(0,300));console.log('pageerrs',JSON.stringify(errs.slice(0,5)));process.exit(1)});
