// carsign.js <builddir> <city> <outprefix>: phone profile; car close-up at 3 headings (sun follows the view), grabbed from the canvas in the same task as the draw. Compare base vs patch per heading: the envMapRotation sign is right when the highlights sit on the same side.
const {chromium}=require('/opt/node22/lib/node_modules/playwright'),http=require('http'),fs=require('fs'),path=require('path');
const [DIR,C,OUT]=process.argv.slice(2);
const s=http.createServer((q,r)=>{let f=path.join(path.resolve(DIR),decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,b)=>{if(e){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':f.endsWith('.html')?'text/html':'application/octet-stream'});r.end(b)})}).listen(0,'127.0.0.1',async()=>{
 const b=await chromium.launch({proxy:{server:process.env.HTTPS_PROXY,bypass:'127.0.0.1,localhost'},args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:2,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'});
 const p=await ctx.newPage();p.setDefaultTimeout(1200000);const EV=(fn,a)=>p.evaluate(([c,a])=>__xc.ev('('+c+')('+JSON.stringify(a)+')'),[fn.toString(),a]);
 await p.goto('http://127.0.0.1:'+s.address().port+'/index.html?test='+C+'&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:500,timeout:900000});
 for(const h of[0,2.1,4.2]){const r=await EV(h=>{RO.h=h;RO.v=0;for(let i=0;i<10;i++)roamStep(1/30);try{GL_apply()}catch(e){}const m=pl.mesh;m.updateMatrixWorld(true);const bx=new THREE.Box3().setFromObject(m),c=bx.getCenter(new THREE.Vector3()),sz=bx.getSize(new THREE.Vector3()).length();
   const fx=Math.sin(h),fz=Math.cos(h);camera.position.set(c.x+fx*sz*.8+fz*sz*.5,c.y+sz*.3,c.z+fz*sz*.8-fx*sz*.5);camera.lookAt(c);camera.updateMatrixWorld();__tq.draw();
   return{url:renderer.domElement.toDataURL('image/jpeg',.85),gl:{n:GL.n,id:GL.id,ry:GL.ry}}},h);
  fs.writeFileSync(OUT+'_h'+h+'.jpg',Buffer.from(r.url.split(',')[1],'base64'));console.log(C,h,JSON.stringify(r.gl))}
 await b.close();s.close()});
