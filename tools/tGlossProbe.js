// tGlossProbe (glossy-cars-r22e5): node tools/tGlossProbe.js <base url> [city] [phone=1]  prints player + traffic car materials (type, rough, clearcoat, env, intensity)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [BASE,CITY='fra',PH='1']=process.argv.slice(2);
const Q=(p,f)=>p.evaluate(src=>__tk.q(src),'('+f.toString()+')()');
const probe=()=>{const d=m=>`${m.type.replace('Mesh','').replace('Material','')} c${m.color?m.color.getHexString():''} r${(+m.roughness).toFixed(2)} m${(+m.metalness).toFixed(2)} cc${m.clearcoat??'-'} env${m.envMap?1:0}/${(+m.envMapIntensity).toFixed(2)} vc${m.vertexColors?1:0}`;
 const P=new Map();if(pl&&pl.mesh)pl.mesh.traverse(o=>{if(o.isMesh&&o.visible)for(const m of[].concat(o.material)){const k=d(m);P.set(k,(P.get(k)||0)+1)}});
 const T=new Map();for(const k in HUB.cim){const im=HUB.cim[k];if(!im)continue;for(const x of[im,im.userData.w,im.userData.g])if(x)for(const m of[].concat(x.material)){const s=d(m);T.set(s,(T.get(s)||0)+1)}}
 return 'PLAYER\n'+[...P].map(a=>a[1]+'× '+a[0]).join('\n')+'\nTRAFFIC\n'+[...T].map(a=>a[1]+'× '+a[0]).join('\n')+`\nscene.env ${!!scene.environment} envInt ${scene.environmentIntensity} progs ${renderer.info.programs.length} lights ${(()=>{let s='';scene.traverse(o=>{if(o.isLight)s+=o.type+':'+o.intensity.toFixed(2)+' '});return s})()} tone ${renderer.toneMapping} exp ${renderer.toneMappingExposure}`};
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const c=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:PH==='1',hasTouch:PH==='1'});const p=await c.newPage();p.setDefaultTimeout(400000);
 await p.goto(BASE+'?test='+CITY);await p.waitForFunction(()=>window.__chk&&window.__tq&&__tq.ready,null,{timeout:400000});await p.waitForTimeout(3000);
 console.log(await Q(p,probe));await b.close()})();
