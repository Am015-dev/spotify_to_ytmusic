// shots.js <builddir> <city> <outprefix>: phone profile 852x393, START shot + car close-up after 60 s of envs (GL_apply).
const {chromium}=require('/opt/node22/lib/node_modules/playwright'),http=require('http'),fs=require('fs'),path=require('path');
const [DIR,C,OUT]=process.argv.slice(2);
const s=http.createServer((q,r)=>{let f=path.join(path.resolve(DIR),decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,b)=>{if(e){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':f.endsWith('.html')?'text/html':'application/octet-stream'});r.end(b)})}).listen(0,'127.0.0.1',async()=>{
 const b=await chromium.launch({proxy:{server:process.env.HTTPS_PROXY,bypass:'127.0.0.1,localhost'},args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:2,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'});
 await ctx.addInitScript(()=>{const st0=window.setTimeout;window.setTimeout=function(f,d,...a){if(d===120000&&typeof f==='function'&&/clearInterval\(iv\)/.test(String(f)))d=1800000;return st0.call(window,f,d,...a)}});const p=await ctx.newPage();p.setDefaultTimeout(1200000);const EV=fn=>p.evaluate(c=>__xc.ev(c),'('+fn.toString()+')()');
 await p.goto('http://127.0.0.1:'+s.address().port+'/index.html?test='+C+'&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:500,timeout:900000});
 await EV(()=>{for(let i=0;i<20;i++)roamStep(1/30);try{ART10_cars()}catch(e){}try{GL_apply()}catch(e){}__tq.draw();__tq.draw()});await new Promise(r=>setTimeout(r,1500));await EV(()=>{__tq.draw()});
 await p.screenshot({path:OUT+'_start.jpg',type:'jpeg',quality:85,scale:'css'});
 const info=await EV(()=>{const m=pl.mesh;m.updateMatrixWorld(true);const bx=new THREE.Box3().setFromObject(m),c=bx.getCenter(new THREE.Vector3()),sz=bx.getSize(new THREE.Vector3()).length();
  const h=RO.h||0,fx=Math.sin(h),fz=Math.cos(h);camera.position.set(c.x+fx*sz*.9+fz*sz*.55,c.y+sz*.35,c.z+fz*sz*.9-fx*sz*.55);camera.lookAt(c);camera.updateMatrixWorld();__tq.draw();__tq.draw();
  return{gl:typeof GL!=='undefined'?{n:GL.n,id:GL.id,ry:GL.ry}:null,lowmem:LOWMEM,mts:renderer.capabilities.maxTextureSize}});
 await p.screenshot({path:OUT+'_car.jpg',type:'jpeg',quality:85,scale:'css'});console.log(C,JSON.stringify(info));await b.close();s.close()});
