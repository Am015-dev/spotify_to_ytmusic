const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs'),path=require('path'),http=require('http');
const DIR=process.argv[2],OUT=process.argv[3];
const serve=dir=>new Promise(res=>{const T={'.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png'};const s=http.createServer((q,r)=>{let f=path.join(dir,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,b)=>{if(e){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});r.end(b)})}).listen(0,'127.0.0.1',()=>res([s,s.address().port]))});
const SPOT={fra:[-380.31,450.33,4.785],ath:[1883.68,-3170.29,-0.7933]};const TOD={day:.45,dusk:.74,night:.05};
const PROBE=()=>{const L=[];scene.traverse(o=>{if(o.isLight&&o.visible)L.push({t:o.type,i:+o.intensity.toFixed(2),c:o.color.getHexString(),g:o.groundColor?o.groundColor.getHexString():null,sh:!!o.castShadow,ms:o.shadow&&o.castShadow?o.shadow.mapSize.x:0,sc:o.shadow&&o.castShadow?[o.shadow.camera.left,o.shadow.camera.right,o.shadow.camera.far].map(Math.round):0})});
 let tris=renderer.info.render.triangles,calls=renderer.info.render.calls;let clouds=0;try{clouds=CLOUDS?(CLOUDS.children?CLOUDS.children.length:1):0}catch(e){}
 return{L,exp:renderer.toneMappingExposure,tm:renderer.toneMapping,pr:renderer.getPixelRatio(),fog:scene.fog?{c:scene.fog.color.getHexString(),d:scene.fog.density,n:scene.fog.near,f:scene.fog.far}:null,bloom:{s:bloom.strength,r:bloom.radius,t:bloom.threshold,on:bloom.enabled},fov:camera.fov,far:camera.far,mood:MOOD&&MOOD.id,flT:__fl.t(),n:__fl.night(),clouds,tris,calls,bg:scene.background&&scene.background.isColor?scene.background.getHexString():(scene.background?'tex':null)}};
const IMG=async(p,png)=>p.evaluate(async u=>{const im=new Image();im.src=u;await im.decode();const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d');x.drawImage(im,0,0);const d=x.getImageData(0,0,c.width,c.height).data;
 let n=0,sat=0,lum=0,l2=0,blk=0,top=[0,0,0],tn=0,edge=0;const W=c.width,H=c.height;const Lm=i=>.2126*d[i]+.7152*d[i+1]+.0722*d[i+2];
 for(let y=0;y<H;y+=2)for(let X=0;X<W;X+=2){const i=(y*W+X)*4,r=d[i],g=d[i+1],b=d[i+2],mx=Math.max(r,g,b),mn=Math.min(r,g,b);const l=Lm(i);n++;lum+=l;l2+=l*l;sat+=mx?(mx-mn)/mx:0;if(mx<12)blk++;if(y<H*.25){top[0]+=r;top[1]+=g;top[2]+=b;tn++}
  if(X+1<W){const j=i+4;if(Math.abs(l-Lm(j))>60)edge++}}
 const m=lum/n;return{lum:+m.toFixed(1),contrast:+Math.sqrt(l2/n-m*m).toFixed(1),sat:+(sat/n).toFixed(3),black:+(blk/n).toFixed(3),sky:top.map(v=>Math.round(v/tn)),jag:+(edge/n).toFixed(3)}},'data:image/png;base64,'+png.toString('base64'));
(async()=>{const[s,port]=await serve(DIR);const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const R=[];
 for(const city of ['fra','ath'])for(const vp of [[852,393],[402,812]]){const ctx=await b.newContext({viewport:{width:vp[0],height:vp[1]},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await ctx.newPage();await p.addInitScript(()=>{window.__dbg=1});
  await p.goto(`http://127.0.0.1:${port}/index.html?test=${city}`);await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:240000});
  await p.evaluate(()=>{for(const e of document.querySelectorAll('button'))if(e.offsetWidth&&/^\s*OK\s*$/.test(e.textContent))e.click()});
  for(const[tn,t]of Object.entries(TOD)){await p.evaluate(([a,t])=>{__fl.mode('cycle');__fl.setT(t);__fl.apply();__mho.warp(a[0],a[1],a[2],1)},[SPOT[city],t]);await p.waitForTimeout(6000);
   await p.evaluate(t=>{__fl.setT(t);__fl.apply()},t);await p.waitForTimeout(1500);try{await p.evaluate(()=>__tq.draw())}catch(e){}
   const png=await p.screenshot({type:'jpeg',quality:70});const nm=`${city}_${vp[0]}x${vp[1]}_${tn}.jpg`;fs.writeFileSync(path.join(OUT,nm),png);
   const pr=await p.evaluate(f=>__oc.ev('('+f+')()'),PROBE.toString());const im=await IMG(p,await p.screenshot({type:'png'}));R.push({nm,pr,im});console.log(nm,JSON.stringify(im),pr.mood,pr.exp,'n',pr.n)}
  await ctx.close()}
 fs.writeFileSync(path.join(OUT,'probe.json'),JSON.stringify(R,null,1));await b.close();s.close()})();
