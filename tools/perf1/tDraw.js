// r17s: draw-call / triangle / program census per scene group, touch profile. tDraw.js <outdir> <ver>   env: CITY=fra|ath QS=extra SECS=30 SHOT=path.png
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const http=require('http'),fs=require('fs'),path=require('path');
const OUT=path.resolve(process.argv[2]),V=process.argv[3],CITY=process.env.CITY||'ath',SECS=+(process.env.SECS||30);
const mime={'.html':'text/html','.js':'application/javascript','.json':'application/json','.mp3':'audio/mpeg'};
const INIT=`(()=>{const q=[];let t=0;window.requestAnimationFrame=cb=>{q.push(cb);return q.length};window.cancelAnimationFrame=()=>{};window.__dbg=1;
 window.__tick=n=>{for(let i=0;i<n;i++){t+=1000/60;const c=q.splice(0);for(const f of c){try{f(t)}catch(e){}}}return t};window.__auto=true;setInterval(()=>{if(window.__auto)window.__tick(1)},16);})();`;
const CEN=`(()=>{window.__DEPTH=3;window.__TOP=40;const R=renderer,gl=R.info;gl.autoReset=false;gl.reset();window.__real=1;composer.render();window.__real=0;const o={calls:gl.render.calls,tris:gl.render.triangles,progs:gl.programs.length,shadowOn:!!(renderer.shadowMap&&renderer.shadowMap.enabled),gov:GOV_lvl()};
 const fr=new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));const g={};
 const own=m=>{let a=m,n=[];while(a&&a!==scene){n.push(a.name||a.type);a=a.parent}return n.reverse().slice(0,+(window.__DEPTH||2)).join('/')||'root'};
 scene.traverse(m=>{if(!(m.isMesh||m.isLine||m.isPoints||m.isSprite))return;let v=true,a=m;while(a){if(!a.visible){v=false;break}a=a.parent}if(!v)return;
  if(m.frustumCulled!==false&&m.geometry){if(!m.geometry.boundingSphere)m.geometry.computeBoundingSphere();const s=m.geometry.boundingSphere.clone().applyMatrix4(m.matrixWorld);if(!fr.intersectsSphere(s))return}
  const k=own(m)+(m.isInstancedMesh?'#'+m.count:'')+(m.isInstancedMesh?' [inst]':'');const x=g[k]||(g[k]={n:0,tri:0});x.n++;const ge=m.geometry;const idx=ge&&(ge.index?ge.index.count:ge.attributes.position?ge.attributes.position.count:0);x.tri+=(idx/3)*(m.isInstancedMesh?m.count:1)|0});
 o.groups=Object.entries(g).sort((a,b)=>b[1].tri-a[1].tri).slice(0,+(window.__TOP||14)).map(([k,v])=>k+' n'+v.n+' tri'+v.tri);return o})()`;
const srv=http.createServer((q,r)=>{fs.readFile(path.join(OUT,decodeURIComponent(q.url.split('?')[0])),(e,d)=>{if(e){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':mime[path.extname(q.url.split('?')[0])]||'application/octet-stream'});r.end(d)})}).listen(0,async()=>{
 const port=srv.address().port;const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:3,isMobile:true,hasTouch:true});const p=await ctx.newPage();p.setDefaultTimeout(1800000);await p.addInitScript(INIT);
 p.on('pageerror',e=>console.log('ERR',e.message.slice(0,150)));
 await p.goto(`http://127.0.0.1:${port}/${V}/index.html?test=${CITY}&gov=1&warm=1${process.env.QS?'&'+process.env.QS:''}`);
 await p.waitForFunction(()=>window.__tq&&__tq.drv&&window.__oc,null,{polling:100});
 await p.evaluate(()=>{window.__auto=false;__oc.ev('{const R=composer.render.bind(composer);composer.render=function(){if(!window.__real)return;R()}}')});
 const ev=s=>p.evaluate(`__oc.ev(${JSON.stringify(s)})`);

 for(let i=0;i<SECS;i++){await p.evaluate(()=>{__tick(60)})}
 console.log('T+'+SECS,JSON.stringify(await ev(CEN)));
 if(process.env.SHOT){await p.evaluate(()=>{__tick(2)});await p.screenshot({path:process.env.SHOT})}
 await b.close();srv.close()});
