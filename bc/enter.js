// bc/enter.js: shared: open page, tap STORY, skip cutscenes, return {b,ctx,p,cdp,errs,ev}
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const G=require('../tools/lowgfx.js');
module.exports=async(URL,opt={})=>{const gfx=opt.gfx||process.env.GFX||'min';const b=await chromium.launch({args:G.launchArgs(gfx).concat(['--ignore-gpu-blocklist'])});
 const W=opt.w||852,H=opt.h||393,desk=!!opt.desk;const ctx=await b.newContext(desk?{viewport:{width:W,height:H}}:G.contextOpts(gfx,{phone:true,width:W,height:H,dsf:1}));await ctx.addInitScript(G.initScript(gfx)+(opt.seed?`;try{if(!sessionStorage.bcS){sessionStorage.bcS=1;localStorage.clear();${opt.seed}}}catch(e){}`:''));if(opt.tick!==0)await ctx.addInitScript(`(()=>{const q=[];let t=0;window.requestAnimationFrame=cb=>{q.push(cb);return q.length};window.cancelAnimationFrame=()=>{};
  window.__tick=n=>{for(let i=0;i<n;i++){t+=1000/60;const c=q.splice(0);for(const f of c){try{f(t)}catch(e){setTimeout(()=>{throw e})}}}return t};setInterval(()=>window.__tick(1),16)})();`); // tPlay's frame ticker (headless rAF stalls)
 if(gfx==='min')await ctx.addInitScript(`try{const k='mho_set';const o=JSON.parse(localStorage.getItem(k)||'{}');localStorage.setItem(k,JSON.stringify(Object.assign(o,${JSON.stringify(G.MIN_SET)})))}catch(e){}`);
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 if(opt.pre)await p.addInitScript(opt.pre);
 await p.goto(URL);await p.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});const cdp=desk?null:await ctx.newCDPSession(p);
 const tapXY=async(x,y)=>{if(desk)return p.mouse.click(x,y);const tp=[{x,y,id:1,radiusX:4,radiusY:4,force:1}];await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:tp});await p.waitForTimeout(40);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.waitForTimeout(600)};
 const tapEl=async e=>{await e.scrollIntoViewIfNeeded().catch(()=>{});const bb=await e.boundingBox();if(bb)await tapXY(bb.x+bb.width/2,bb.y+bb.height/2)};
 const tap=async s=>{const e=await p.$(s);if(!e){console.log('NO',s);return 0}await tapEl(e);return 1};
 const ev=c=>p.evaluate(c=>__g9ev(c),c);
 const roamApi=async()=>{await p.evaluate(()=>__mho.enterRoam());await p.waitForFunction(()=>__mho.state==='roam'&&!(__mho.LD&&__mho.LD.on),null,{timeout:600000});await p.waitForTimeout(3000)};
 const roam=async()=>{await tap('#hcStory');for(let i=0;i<240;i++){await p.waitForTimeout(3000);const s=await p.evaluate(()=>__mho.state+'|'+!!(__mho.LD&&__mho.LD.on));if(s==='roam|false')break;for(const q of['#slotList .go','#m1Next']){const e=await p.$(q);if(e&&await e.isVisible())await tapEl(e)}}
  for(let i=0;i<14;i++){let hit=0;for(const l of[p.getByText('SKIP',{exact:false}),p.getByText('TAP TO CONTINUE'),p.locator('#m1Next')]){const e=l.first();if(await e.count()&&await e.isVisible()){await tapEl(await e.elementHandle());hit=1;break}}if(!hit&&i>3)break;await p.waitForTimeout(1500)}};
 return {b,ctx,p,cdp,errs,ev,tap,tapEl,tapXY,roam,roamApi}};
