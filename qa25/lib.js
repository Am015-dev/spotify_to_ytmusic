// qa25/lib.js: shared real-touch harness (852x393 by default). VW/VH/IFRAME/DESK env.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
module.exports=async function(U,O,opt={}){fs.mkdirSync(O,{recursive:true});const W=+(process.env.VW||852),H=+(process.env.VH||393),desk=!!process.env.DESK;
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const ctx=await b.newContext(desk?{viewport:{width:W,height:H}}:{viewport:{width:W,height:H},isMobile:true,hasTouch:true});const pg=await ctx.newPage();const errs=[];
 pg.on('pageerror',e=>errs.push(String(e)));pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 let p=pg;if(process.env.IFRAME){await pg.setContent(`<html><body style="margin:0;background:#000"><iframe id="f" src="${U}" style="border:0;width:${W}px;height:${H}px" allow="fullscreen"></iframe></body></html>`);await pg.waitForTimeout(3000);p=pg.frames().find(f=>f.url().startsWith(U.split('?')[0]))}else await pg.goto(U);
 await p.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});const cdp=desk?null:await ctx.newCDPSession(pg);
 let ox=0,oy=0;
 const tapXY=async(x,y,ms=600)=>{if(desk){await pg.mouse.click(x,y)}else{const tp=[{x,y,id:1,radiusX:4,radiusY:4,force:1}];await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:tp});await pg.waitForTimeout(40);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})}await pg.waitForTimeout(ms)};
 const drag=async(x0,y0,x1,y1,n=12)=>{if(desk){await pg.mouse.move(x0,y0);await pg.mouse.down();for(let i=1;i<=n;i++)await pg.mouse.move(x0+(x1-x0)*i/n,y0+(y1-y0)*i/n);await pg.mouse.up();return}
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x0,y:y0,id:1}]});for(let i=1;i<=n;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x0+(x1-x0)*i/n,y:y0+(y1-y0)*i/n,id:1}]});await pg.waitForTimeout(16)}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await pg.waitForTimeout(300)};
 const box=async s=>{const e=await p.$(s);if(!e)return null;const bb=await e.boundingBox();return bb};
 const tap=async(s,ms)=>{const e=await p.$(s);if(!e){console.log('NO',s);return 0}const bb=await e.boundingBox();if(!bb||!bb.width){console.log('NOBOX',s);return 0}
  // hit test: is the centre covered?
  const cov=await p.evaluate(([s,x,y])=>{const t=document.elementFromPoint(x,y),e=document.querySelector(s);return t&&(e===t||e.contains(t))?'':(t?(t.id||t.className||t.tagName):'none')},[s,bb.x+bb.width/2,bb.y+bb.height/2]);if(cov)console.log('COVERED',s,'by',cov);
  await tapXY(bb.x+bb.width/2,bb.y+bb.height/2,ms);return 1};
 const ev=(f,a)=>p.evaluate(f,a);const shot=async n=>{await pg.waitForTimeout(500);await pg.screenshot({path:`${O}/${n}.png`});console.log('shot',`${O}/${n}.png`)};
 // swipe a horizontal strip (real touch drag) until the element sits fully inside it
 const swipeTo=async(strip,sel)=>{for(let k=0;k<8;k++){const r=await ev(([a,b])=>{const s=document.querySelector(a).getBoundingClientRect(),e=document.querySelector(b).getBoundingClientRect();return{sl:s.left,sr:s.right,el:e.left,er:e.right,y:s.top+s.height/2}},[strip,sel]);if(r.el>=r.sl-1&&r.er<=r.sr+1)return 1;const d=r.er>r.sr?-Math.min(220,r.er-r.sr+40):Math.min(220,r.sl-r.el+40),x0=(r.sl+r.sr)/2;await drag(x0,r.y,x0+d,r.y,10);await pg.waitForTimeout(250)}return 0};
 return{swipeTo,b,pg,p,ctx,errs,tapXY,tap,drag,ev,shot,box,W,H,close:async()=>{console.log('ERR',JSON.stringify(errs.slice(0,8)));await b.close()}}};
