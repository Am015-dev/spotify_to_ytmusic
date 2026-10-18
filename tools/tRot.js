// tRot (phone-1): iPhone rotation cost on the BUILT page. iPhone UA, DPR 3, 852x393 -> 393x852 -> 852x393, 3 times; each rotation also
// sends orientationchange + screen.orientation change + 2 late resize events (what iOS Safari does). Counts, during the rotations only:
// framebuffers created (= render-target allocations), shader programs linked, image texture uploads, page reloads, max rAF gap (ms).
// Prints one JSON line; SHOT=<file> saves one 852x393 jpg after rotating back.   node tools/tRot.js <url> [shot.jpg]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [BASE,SHOT]=process.argv.slice(2);
const UA='Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.0 Mobile/15E148 Safari/604.1';
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const c=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:3,isMobile:true,hasTouch:true,userAgent:UA});const p=await c.newPage();p.setDefaultTimeout(600000);
 let navs=0;p.on('framenavigated',f=>{if(f===p.mainFrame())navs++});
 await p.addInitScript(()=>{const S=window.__rot={fb:0,prog:0,up:0,gap:0,on:0};for(const P of[WebGLRenderingContext.prototype,window.WebGL2RenderingContext&&WebGL2RenderingContext.prototype].filter(Boolean)){
   const W=(n,f)=>{const o=P[n];if(o)P[n]=function(){if(S.on)f.apply(this,arguments);return o.apply(this,arguments)}};
   W('createFramebuffer',()=>S.fb++);W('linkProgram',()=>S.prog++);W('texImage2D',function(){const a=arguments,im=a.length===6?a[5]:a[8];if(im&&!ArrayBuffer.isView(im))S.up++})}
  let t0=0;const raf=t=>{if(S.on&&t0)S.gap=Math.max(S.gap,t-t0);t0=t;requestAnimationFrame(raf)};requestAnimationFrame(raf)});
 await p.goto(BASE+'?test=fra');await p.waitForFunction(()=>window.__tk&&window.__tq&&__tq.ready,null,{timeout:600000});
 await p.evaluate(()=>{window.__tq.o.draw=1});await p.waitForTimeout(3000);navs=0;
 const Q=s=>p.evaluate(s=>__tk.q(s),s);await Q(`(()=>{window.__q0=SET.q;SET.q='med';SET.dres='off';DRES.s=1;resize();return window.__q0})()`);await p.waitForTimeout(1000);const pr0=await Q('renderer.getPixelRatio()');
 await Q(`(()=>{const C=window.__rotC={set:0,chg:0,rs:0};const s0=composer.setSize.bind(composer);composer.setSize=function(w,h){C.set++;const t=composer.renderTarget1;if(Math.round(w*composer._pixelRatio)!==t.width||Math.round(h*composer._pixelRatio)!==t.height)C.chg++;return s0(w,h)};
  const W=['setSize','setDrawingBufferSize','setPixelRatio'];for(const k of W){const r0=renderer[k].bind(renderer);renderer[k]=function(){C.rs++;return r0.apply(this,arguments)}};return 1})()`);
 await p.evaluate(()=>{window.__rot.on=1});await p.waitForTimeout(4000);const idle=await p.evaluate(()=>{const r=window.__rot;r.on=0;const g=r.gap;r.gap=0;r.fb=0;return Math.round(g)});
 await p.evaluate(()=>{window.__rot.on=1});const T0=Date.now();
 for(let i=0;i<3;i++)for(const [w,h] of[[393,852],[852,393]]){await p.setViewportSize({width:w,height:h});
  await p.evaluate(()=>{dispatchEvent(new Event('orientationchange'));try{screen.orientation.dispatchEvent(new Event('change'))}catch(e){}setTimeout(()=>dispatchEvent(new Event('resize')),60);setTimeout(()=>dispatchEvent(new Event('resize')),180)});
  await p.waitForTimeout(1500)}
 const r=await p.evaluate(()=>{window.__rot.on=0;return window.__rot});
 const st=await Q(`({pr:renderer.getPixelRatio(),w:composer.renderTarget1.width,h:composer.renderTarget1.height,iw:innerWidth,ih:innerHeight,cam:+camera.aspect.toFixed(3),rz:typeof RZ!=='undefined'?RZ.n:-1,ok:typeof RZ_ok==='function'?RZ_ok():null})`);
 const C=await p.evaluate(()=>window.__rotC);
 console.log(JSON.stringify({composerSetSize:C.set,rtResized:C.chg,rendererSetSize:C.rs,fbAlloc:r.fb,idleMaxGapMs:idle,progLinks:r.prog,texUploads:r.up,reloads:navs,maxGapMs:Math.round(r.gap),secs:(Date.now()-T0)/1000,pr0,end:st}));
 if(SHOT){await p.waitForTimeout(500);await p.screenshot({path:SHOT,type:'jpeg',quality:80})}
 await b.close()})();
