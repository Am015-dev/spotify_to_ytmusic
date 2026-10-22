// tGloss2 (glossy-cars-r22e10): node tools/tGloss2.js <base url> <out prefix> [city] [phone=1]   852x393 default chase cam, day + dusk, gloss off/on in ONE page
// (same camera, toggled in-page), plus a body mask shot (player paint swapped to unlit magenta) for tools/glossStats.py. phone=1: iPhone UA + touch (lowGfx path).
// env P='{"ei":1}' overrides GL.P before the shots (live sweep, no rebuild).
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [BASE,OUT,CITY='fra',PH='1']=process.argv.slice(2);
const Q=(p,f,a)=>p.evaluate(src=>__tk.q(src),'('+f.toString()+')('+JSON.stringify(a===undefined?null:a)+')');
const UA='Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const mood=k=>{if(k==='day'){SET.tod='day';FL_time=()=>.45}else{SET.tod='cycle';FL.t=.74;FL_time=()=>.74}FL_apply(FL_time(),true);if(ENVD)buildEnv();ART10_cars();return MOOD.id+' env#'+__gl.GL.n+' key '+moonL.intensity.toFixed(2)};
const gl=on=>{const G=__gl.GL;if(on){G.on=true;__gl.apply()}else{G.on=false;__gl.off()}return 'gloss '+on+' lowGfx '+lowGfx+' P '+JSON.stringify(G.P)};
const mask=on=>{window.__gm=window.__gm||new Map();if(on){const B=new THREE.MeshBasicMaterial({color:0xff00ff,toneMapped:false,fog:false});pl.mesh.traverse(o=>{if(o.isMesh){const a=[].concat(o.material);if(a.some(m=>__gl.GL&&m.isMeshStandardMaterial&&!m.transparent&&m.roughness>=.1&&m.envMap&&(m.isMeshPhysicalMaterial||m.userData.a10e!==undefined||m.envMapIntensity>1))){__gm.set(o,o.material);o.material=Array.isArray(o.material)?o.material.map(m=>m.roughness>=.1&&!m.transparent?B:m):B}}});return 'mask '+__gm.size}
 for(const[o,m]of __gm)o.material=m;__gm.clear();return 'unmask'};
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const ph=PH==='1';
 const c=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:ph,hasTouch:ph,userAgent:ph?UA:undefined});const p=await c.newPage();p.setDefaultTimeout(400000);
 await p.goto(BASE+'?test='+CITY+'&gloss=1');await p.waitForFunction(()=>window.__chk&&window.__tq&&__tq.ready,null,{timeout:400000});await p.waitForTimeout(3000);
 if(process.env.P)console.log(await Q(p,P=>{Object.assign(__gl.GL.P,P);__gl.GL.id='';__gl.GL.C&&__gl.GL.C.clear();return 'P set'},JSON.parse(process.env.P)));
 for(const m of['day','dusk']){console.log(m,await Q(p,mood,m));await p.waitForTimeout(800);
  for(const on of[0,1]){console.log(await Q(p,gl,!!on));await p.waitForTimeout(900);await p.screenshot({path:`${OUT}_${m}_${on?'on':'off'}.png`})}
  console.log(await Q(p,mask,true));await p.waitForTimeout(700);await p.screenshot({path:`${OUT}_${m}_mask.png`});console.log(await Q(p,mask,false))}
 console.log('env builds',await Q(p,()=>__gl.GL.n));await b.close()})();
