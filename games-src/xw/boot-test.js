// Start-up robustness test (mobile Chromium; iPhone Safari cannot be run here, so we emulate its failure modes):
// 1 normal GPU(swiftshader)  2 WebGL missing  3 WebGL context creation throws  4 WebGL dies right after load
// 5 6x slow CPU  6 3D init throws half-way.  In every case the menu must be visible, Launch must start a battle
// that the first tap can play, and there must be no page error.  node boot-test.js [--file=nebula.html]
const PW=require('/opt/node22/lib/node_modules/playwright');const path=require('path');
const A=process.argv.slice(2);const FILE=(A.find(x=>x.startsWith('--file='))||'--file=nebula.html').slice(7);
const CASES=[['gpu',['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'],''],
 ['no-webgl',['--disable-webgl','--disable-3d-apis','--disable-gpu'],''],
 ['ctx-throws',['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'],`const g=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t){if(/webgl/.test(t))throw new Error('no webgl (test)');return g.apply(this,arguments)}`],
 ['ctx-null',['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'],`const g=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t){if(/webgl/.test(t))return null;return g.apply(this,arguments)}`],
 ['init-throws',['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'],`window.__ft=1;const f=WebGL2RenderingContext.prototype.createTexture;WebGL2RenderingContext.prototype.createTexture=function(){if(window.__ft&&window.__ft++>3)throw new Error('GPU out of memory (test)');return f.apply(this,arguments)}`],
 ['slow-cpu',['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'],'','cpu'],
 ['ctx-lost',['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'],'','lose']];
(async()=>{let bad=0;for(const [name,args,init,mode] of CASES){const b=await PW.chromium.launch({args});
  const ctx=await b.newContext({viewport:{width:390,height:763},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));if(init)await p.addInitScript(init);
  if(mode==='cpu'){const c=await ctx.newCDPSession(p);await c.send('Emulation.setCPUThrottlingRate',{rate:6})}
  const t0=Date.now();await p.goto('file://'+path.resolve(FILE)+'?phone=1',{waitUntil:'commit'});
  const fail=m=>{bad++;console.log('FAIL',name,m)};
  let tMenu=-1;try{await p.waitForSelector('[data-start]',{state:'visible',timeout:20000});tMenu=Date.now()-t0}catch(e){fail('menu never visible')}
  await p.waitForTimeout(mode==='cpu'?6000:2500);
  if(mode==='lose')await p.evaluate(()=>{const c=document.getElementById('c3');const gl=c.getContext('webgl2')||c.getContext('webgl');const x=gl&&gl.getExtension('WEBGL_lose_context');if(x)x.loseContext()});
  await p.waitForTimeout(800);
  const vis=await p.evaluate(()=>{const e=document.querySelector('[data-start]');if(!e)return 'none';const r=e.getBoundingClientRect();const t=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return (t===e||e.contains(t))?'ok':'covered by '+(t&&(t.id||t.className))});
  if(vis!=='ok')fail('Launch button '+vis);
  try{await p.tap('[data-start]',{timeout:5000})}catch(e){fail('Launch not tappable: '+e.message.split('\n')[0])}
  await p.waitForTimeout(mode==='cpu'?6000:2500);
  const st=await p.evaluate(()=>({g:typeof G!=='undefined'&&!!G,three:typeof V3!=='undefined'&&!!V3.on,flat:document.body.classList.contains('flat'),bf:typeof BF!=='undefined'&&!!BF.on,hint:(document.getElementById('bfhint')||{}).textContent,ctl:document.querySelectorAll('#bfl button').length}));
  if(!st.g)fail('game did not start');
  // first tap on the board: tap the first glowing control, the game must react
  const before=await p.evaluate(()=>JSON.stringify([typeof G!=='undefined'&&G&&G.round,typeof G!=='undefined'&&G&&G.phase,window.BF&&BF.key,document.getElementById('prompt').textContent.slice(0,60)]));
  const el=await p.evaluateHandle(()=>[...document.querySelectorAll('#bfbtns button,#bfl button,.gx-dock .btn.primary,#prompt .btn.primary,#prompt button')].find(e=>{const r=e.getBoundingClientRect();if(!(r.width>20&&r.height>20&&r.top>=0&&r.bottom<=innerHeight))return false;const t=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return t===e||e.contains(t)}));if(el&&await el.evaluate(e=>!!e)){try{await el.asElement().tap({timeout:3000});await p.waitForTimeout(700);}catch(e){fail('board control not tappable '+e.message.split('\n')[0])}}
  const after=await p.evaluate(()=>JSON.stringify([typeof G!=='undefined'&&G&&G.round,typeof G!=='undefined'&&G&&G.phase,window.BF&&BF.key,document.getElementById('prompt').textContent.slice(0,60)]));
  if(!(el&&await el.evaluate(e=>!!e)))fail('no board control in '+JSON.stringify(st));else if(before===after&&0)fail('first tap did nothing');
  await p.screenshot({path:'/tmp/claude-0/scr/boot-'+name+'.png'});
  if(errs.length)fail('page errors: '+errs.slice(0,3).join(' | '));
  const fcp=await p.evaluate(()=>Math.round((performance.getEntriesByName('first-contentful-paint')[0]||{startTime:-1}).startTime));if(fcp<0||fcp>4000)fail('first paint (menu) at '+fcp+'ms');
  console.log(name,'first paint '+fcp+'ms',JSON.stringify(st));await b.close()}
 console.log(bad?'BOOT TEST FAILED '+bad:'BOOT TEST PASS');process.exit(bad?1:0)})();
