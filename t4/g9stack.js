// t4/g9stack.js: 852x393 real touch. Existing car in the builder, MIRROR off. For brick 2x2, plate 2x2, tile 2x2: tap the part in the palette,
// then 12 times tap the top of one stack twice (1st tap = hold, 2nd tap on the same spot = place). Logs layers placed; shots into <outdir>.
// usage: node t4/g9stack.js <url> <outdir>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const O=process.argv[3];fs.mkdirSync(O,{recursive:true});const N=+(process.env.N||12);const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto(process.argv[2]);await p.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});const cdp=await ctx.newCDPSession(p);
 const tapXY=async(x,y)=>{const tp=[{x,y,id:1,radiusX:4,radiusY:4,force:1}];await Promise.all([cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:tp}),cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})]);await p.waitForTimeout(600)};
 const tap=async s=>{const e=await p.$(s);const bb=e&&await e.boundingBox();if(!bb)return 0;await tapXY(bb.x+bb.width/2,bb.y+bb.height/2);return 1};
 await p.tap('#gbMenuBtn');await p.waitForTimeout(1500);await p.evaluate(()=>__gb.enter());await p.waitForTimeout(3000);
 if(process.env.BASE)await tap('#gbBkT [data-a="clr"]');if(await p.evaluate(()=>__gb.GB_.mir))await tap('#gbBkT [data-a="mir"]');
 const n0=await p.evaluate(()=>__gb.list().length);console.log('start parts',n0,'cap',await p.evaluate(()=>window.__g9?__g9.cap:15),'mir',await p.evaluate(()=>__gb.GB_.mir));
 const cells=process.env.BASE?[[-4,-1],[-1,-1],[2,-1]]:[[-3,-1],[0,-1],[2,-1]];const res={};
 for(const[k,[t,ct]]of[['b22','Bricks'],['p22','Plates'],['t22','Tiles']].entries()){await tap(`#gbBkCt [data-ct="${ct}"]`);await tap(`#gbBkPc [data-p="${t}"]`);await tap(`#gbBkCl .gbCl[data-c="${[0,2,6][k]}"]`);
  const[i,j]=cells[k];let ok=0,why='';
  for(let n=0;n<N;n++){const s=await p.evaluate(([i,j])=>__gb.scr(i,j),[i,j]);if(!s||s.y<30||s.y>390){why='offscreen '+JSON.stringify(s);break}
   const c0=await p.evaluate(()=>__gb.list().length);await tapXY(s.x,s.y);const h=await p.evaluate(()=>__gs.held());
   if(!h){why='no hold: '+await p.evaluate(()=>document.querySelector('#gsTip')?.textContent||'');break}await tapXY(s.x,s.y);
   const c1=await p.evaluate(()=>__gb.list().length);if(c1<=c0){why='no place';break}ok++}
  res[t]={layers:ok,why,top:await p.evaluate(()=>window.__g9?__g9.top():-1)};console.log(t,JSON.stringify(res[t]));await p.screenshot({path:`${O}/stack_${t}.png`})}
 const L=await p.evaluate(()=>__gb.list().slice(-36).map(b=>b.t+'@'+b.x+','+b.z+',y'+b.y).join(' '));console.log(L);
 console.log('RESULT',JSON.stringify(res),'ERR',errs.slice(0,5));await b.close()})();
