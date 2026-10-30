// driftshot.js <url> <city> <outprefix>: phone profile; drive ~150 s game along streets (zip/stream running), then a 4 s handbrake drift, shot mid + end
const {chromium}=require('playwright');
const [U,CITY,OUT]=process.argv.slice(2);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:2,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'});
 const p=await ctx.newPage();const E=(fn,a)=>p.evaluate(([src,a])=>{window.__dbg=1;return window.__oc.ev('('+src+')('+JSON.stringify(a)+')')},[fn.toString(),a===undefined?null:a]);p.setDefaultTimeout(900000);const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));
 await p.goto(U+'?test='+CITY+'&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:500,timeout:180000});
 const drive=(secs,drift)=>E(async([secs,drift])=>{const W=a=>Math.atan2(Math.sin(a),Math.cos(a));let n=0,dr=0;
  for(let t=0;t<secs;t+=1/30){const la=12+RO.v*.9,q=rfSnap(RO.x+Math.sin(RO.h)*la,RO.z+Math.cos(RO.h)*la,60),e=q?W(Math.atan2(q[0]-RO.x,q[1]-RO.z)-RO.h):0;
   K.KeyW=K.ArrowUp=true;K.KeyX=drift&&RO.v>8;K.ArrowLeft=drift?true:e>.06;K.ArrowRight=drift?false:e<-.06;if(RO.dDir)dr+=1/30;roamStep(1/30);try{MEMF_gstep();MEMF_Gstep()}catch(x){}
   if(++n%30===0)await new Promise(r=>setTimeout(r,0))}
  const t=B2K.trail,e=t&&MEMF.S.find(q=>q.m===t.m);return {dr:+dr.toFixed(1),v:RO.v|0,trailVis:t&&t.m.visible,pts:t?t.pts[0].length+t.pts[1].length:0,usage:t&&t.g.attributes.position.usage,managed:!!e,arr:!!(t&&t.g.attributes.color.array),ctype:t&&t.g.attributes.color.array&&t.g.attributes.color.array.constructor.name}},[secs,drift]);
 const a=await drive(+(process.argv[5]||150),false);console.log('after drive',JSON.stringify(a));
 const m=await drive(1.5,true);await E(()=>{K.KeyX=K.KeyW=K.ArrowUp=K.ArrowLeft=false;__tq.draw()});await p.screenshot({path:OUT+'_mid.png'});console.log('mid',JSON.stringify(m));
 const e=await drive(2.0,true);await E(()=>{K.KeyX=K.KeyW=K.ArrowUp=K.ArrowLeft=false;__tq.draw()});await p.screenshot({path:OUT+'_end.png'});console.log('end',JSON.stringify(e));
 console.log('errs',errs.length,errs.slice(0,2).join(' | '));await b.close()})();
