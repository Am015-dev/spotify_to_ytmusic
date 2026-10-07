// t4/g8sweep.js: 852x393 phone builder (existing car, or NEW BUILD sc8 with NB=1). (a) tap grid over the screen: what element is on top
// (blocked = not the canvas and not a control), and on canvas points over the car: pick + candidate for the held part. (b) every palette part:
// how many grid points give a valid candidate. usage: node t4/g8sweep.js <url> [iframe]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const ctx=await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto(process.argv[2]);const IF=process.argv[3]==='iframe';let F=p;if(IF){await p.waitForTimeout(3000);F=p.frames().find(f=>f!==p.mainFrame())}const pp=p;{const p=F;await p.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});
 await p.evaluate(()=>document.querySelector('#gbMenuBtn').click());await p.waitForTimeout(1500);await p.evaluate(nb=>{__gb.enter();if(nb)__gnb.nw('sc8')},!!process.env.NB);await p.waitForTimeout(4000);
 const r=await p.evaluate(()=>{const cv=document.querySelector('#gbC'),out={blocked:{},carPts:0,dead:[],parts:{}};const pts=[];
  for(let y=50;y<260;y+=12)for(let x=12;x<846;x+=14){const e=document.elementFromPoint(x,y);if(e!==cv){if(!e.closest('button'))out.blocked[(e.id||e.className||e.tagName)]=(out.blocked[(e.id||e.className||e.tagName)]||0)+1;continue}
   const d=JSON.parse(__gnb.dbg(x,y));if(d.h)pts.push([x,y])}
  out.carPts=pts.length;const G=__gb.GB_,pc0=G.pc;
  for(const t of Object.keys(__gb.PC)){const btn=document.querySelector(`#gbBkPc [data-p="${t}"]`);if(!btn)continue;G.pc=t;let ok=0,bad=0;for(const[x,y]of pts){const d=JSON.parse(__gnb.dbg(x,y));if(d.c)ok++;else bad++}out.parts[t]=ok}
  G.pc='t11';for(const[x,y]of pts){const d=JSON.parse(__gnb.dbg(x,y));if(!d.c)out.dead.push([x,y,d.h&&d.h.b,d.h&&d.h.i,d.h&&d.h.j])}G.pc=pc0;out.inner=[innerWidth,innerHeight];return out});
 console.log('inner',r.inner,JSON.stringify(r.blocked),'carPts',r.carPts,'t11 dead',r.dead.length,JSON.stringify(r.dead.slice(0,40)));const z=Object.entries(r.parts).filter(([k,v])=>v<r.carPts*.25);console.log('LOW',JSON.stringify(z));console.log('ALL',JSON.stringify(r.parts));console.log('ERR',errs.slice(0,5))}await b.close()})();
