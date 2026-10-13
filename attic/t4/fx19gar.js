// t4/fx19gar.js: open the garage with a real tap (852x393 touch), shot; drag the 3D view once, shot again after 5 s. usage: node t4/fx19gar.js <url> <prefix>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const URL=process.argv[2],PRE=process.argv[3];
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const ctx=await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto(URL);await p.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});const cdp=await ctx.newCDPSession(p);
 const tapXY=async(x,y)=>{const tp=[{x,y,id:1,radiusX:4,radiusY:4,force:1}];await Promise.all([cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:tp}),cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})]);await p.waitForTimeout(700)};
 const bt=await p.$('#gbMenuBtn');const bb=await bt.boundingBox();await tapXY(bb.x+bb.width/2,bb.y+bb.height/2);await p.waitForTimeout(3000);
 await p.screenshot({path:PRE+'_open.png'});
 const hv=()=>p.evaluate(()=>{const h=document.querySelector('#gbx .gbHint');if(!h)return 'none';const r=h.getBoundingClientRect(),cs=getComputedStyle(h);return JSON.stringify({vis:h.offsetParent!==null&&cs.display!=='none'&&+cs.opacity>0.05,op:cs.opacity,r:[r.x,r.y,r.width,r.height].map(Math.round)})});
 console.log('hint open',await hv());
 const c=await (await p.$('#gbC')).boundingBox();const x0=c.x+c.width*.5,y0=c.y+c.height*.6;await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x0,y:y0,id:3}]});
 for(let i=1;i<=8;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x0+i*12,y:y0,id:3}]});await p.waitForTimeout(40)}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await p.waitForTimeout(5000);await p.screenshot({path:PRE+'_after.png'});console.log('hint after drag',await hv());
 console.log('ERR',JSON.stringify(errs.filter(e=>!/GPU stall|GL Driver/.test(e)).slice(0,5)));await b.close()})();
