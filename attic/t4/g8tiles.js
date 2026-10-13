// t4/g8tiles.js: 852x393 real touch. Existing car in the builder; for each part in CAT (default Tiles): tap the category, tap the part, tap a spot on the car, tap PLACE.
// Logs per part: held? placed (+n)? Shots of each placement into <outdir>. usage: CAT=Tiles node t4/g8tiles.js <url> <outdir>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const O=process.argv[3];fs.mkdirSync(O,{recursive:true});const CAT=process.env.CAT||'Tiles';const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const ctx=await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto(process.argv[2]);await p.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});const cdp=await ctx.newCDPSession(p);
 const tapXY=async(x,y)=>{const tp=[{x,y,id:1,radiusX:4,radiusY:4,force:1}];await Promise.all([cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:tp}),cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})]);await p.waitForTimeout(700)};
 const tap=async s=>{const e=await p.$(s);const bb=e&&await e.boundingBox();if(!bb)return 0;await tapXY(bb.x+bb.width/2,bb.y+bb.height/2);return 1};
 await p.tap('#gbMenuBtn');await p.waitForTimeout(1500);await p.evaluate(()=>__gb.enter());await p.waitForTimeout(3000);if(process.env.NB){await p.evaluate(()=>__gnb.nw(process.env?0:0));}
 const parts=await p.evaluate(c=>[...document.querySelectorAll('#gbBkPc .gbPc')].filter(b=>b.dataset.ct===c).map(b=>b.dataset.p),CAT);console.log('parts',parts.join(','));
 const L=()=>p.evaluate(()=>__gb.list().length);let k=0,fail=[];
 for(const t of parts){await tap(`#gbBkCt [data-ct="${CAT}"]`);if(!await tap(`#gbBkPc [data-p="${t}"]`)){fail.push(t+':nobtn');continue}const sel=await p.evaluate(()=>__gb.GB_.pc);
  // spots: grid over the middle of the car, the first one that the game says fits
  const s=await p.evaluate(k=>{const c=__gb.cells();const pts=[];for(const[i,j]of c){const q=__gb.scr(i,j);if(q&&q.y>60&&q.y<240)pts.push(q)}pts.sort((a,b)=>Math.hypot(a.x-426,a.y-150)-Math.hypot(b.x-426,b.y-150));for(let n=k*3;n<pts.length;n++){const q=pts[n];if(JSON.parse(__gnb.dbg(q.x,q.y)).c)return q}return null},k);
  if(!s){fail.push(t+':nospot');continue}const n0=await L();let held=0;for(let r=0;r<3&&!held;r++){await tapXY(s.x,s.y);held=await p.evaluate(()=>!!__gs.held())}
  if(held)await tap('#gsBar [data-g="place"]');const d=(await L())-n0;console.log(t,'sel',sel,'held',held,'placed +'+d);if(!d)fail.push(t);await p.screenshot({path:`${O}/${String(k).padStart(2,'0')}_${t}.png`});k++}
 console.log('FAIL',JSON.stringify(fail),'ERR',errs.slice(0,5));await b.close()})();
