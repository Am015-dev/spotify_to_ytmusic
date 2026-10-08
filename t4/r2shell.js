// t4/r2shell.js (R2 garage shell): real touch through the 5 modes + builder pop-ups + kits/horn + paint finishes; shots + audit
// (visible tap targets < 44 px, text < 12 px, header/rail/panel/context overlaps, car box vs UI). usage: node t4/r2shell.js <url> <outdir> [W H]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const U=process.argv[2],O=process.argv[3],W=+(process.argv[4]||852),H=+(process.argv[5]||393);fs.mkdirSync(O,{recursive:true});
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({viewport:{width:W,height:H},isMobile:W<1000,hasTouch:true});const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(String(e)));pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 let p=pg;if(process.env.IFRAME){await pg.setContent(`<html><body style="margin:0;background:#000"><iframe id="f" src="${U}" style="border:0;width:${W}px;height:${H}px"></iframe></body></html>`);await pg.waitForTimeout(3000);p=pg.frames().find(f=>f.url().startsWith(U.split('?')[0]))}else await pg.goto(U);
 await p.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});const cdp=await ctx.newCDPSession(pg);
 const tapXY=async(x,y,w=650)=>{const tp=[{x,y,id:1,radiusX:4,radiusY:4,force:1}];await Promise.all([cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:tp}),cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})]);await pg.waitForTimeout(w)};
 const tap=async(s,w)=>{const e=await p.$(s);if(!e){console.log('NO',s);return 0}const bb=await e.boundingBox();if(!bb){console.log('NOBOX',s);return 0}await tapXY(bb.x+bb.width/2,bb.y+bb.height/2,w);return 1};
 const ev=(f,a)=>p.evaluate(f,a);const shot=async n=>{await pg.waitForTimeout(+(process.env.SW||8000));await pg.screenshot({path:`${O}/${n}.png`,timeout:180000});console.log('shot',n)};
 const audit=n=>ev(()=>{const vis=e=>{const r=e.getBoundingClientRect();if(!(r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth))return 0;for(let q=e;q;q=q.parentElement){const s=getComputedStyle(q);if(s.display==='none'||s.visibility==='hidden'||+s.opacity===0)return 0}return 1};
  const X=document.querySelector('#gbx'),small=[],tiny=[];const sc=document.querySelector('#gbBody');const sr=sc&&sc.getBoundingClientRect(),inScroll=e=>{const r=e.getBoundingClientRect();return!sr||!(sc.offsetParent)||(r.top>=sr.top-1&&r.bottom<=sr.bottom+1)||!sc.contains(e)};
  let nb=0;for(const e of X.querySelectorAll('button')){if(!vis(e)||!inScroll(e))continue;const r=e.getBoundingClientRect();const pc=e.closest('#gbBkPc,#r2C');if(pc){const pr=pc.getBoundingClientRect();if(r.right<pr.left||r.left>pr.right)continue}nb++;if(r.width<43.5||r.height<43.5)small.push((e.dataset.r2m||e.dataset.p||e.className||e.textContent).toString().slice(0,18)+' '+Math.round(r.width)+'x'+Math.round(r.height))}
  for(const e of X.querySelectorAll('*')){if(!vis(e))continue;if(![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))continue;const f=parseFloat(getComputedStyle(e).fontSize);if(f<12)tiny.push(e.textContent.trim().slice(0,16)+' '+f)}
  const R=s=>{const e=document.querySelector(s);if(!e||!vis(e))return null;const r=e.getBoundingClientRect();return[Math.round(r.left),Math.round(r.top),Math.round(r.right),Math.round(r.bottom)]};
  const box={H:R('#r2H'),R:R('#r2R'),P:R('#gbx .gbp'),C:R('#r2C')||R('#gbBkP'),area:window.__r2.area()};const ov=(a,b)=>a&&b&&a[0]<b[2]&&a[2]>b[0]&&a[1]<b[3]&&a[3]>b[1];
  return{mode:__r2.mode().join('/'),buttons:nb,small:small.slice(0,12),tiny:tiny.slice(0,8),ovPC:ov(box.P,box.C),ovPR:ov(box.P,box.R),ovHP:ov(box.H,box.P),box}});
 const A=async n=>console.log('AUDIT',n,JSON.stringify(await audit()));
 await tap('#gbMenuBtn',2500);await A('open');await shot('m1_rides');
 await tap('#r2C [data-r2px="1"]',1500);await shot('m1b_rides_offroad');await tap('#r2C [data-r2px="0"]',1200);
 await tap('#r2R [data-r2m="build"]',2500);await A('build');await shot('m2_build');
 await tap('#gbBkP [data-r2b="cat"]');await shot('m2b_build_cat');await tap('#gbBkCt [data-ct="Slopes"]');await shot('m2c_build_slopes');
 await tap('#gbBkP [data-r2b="col"]');await shot('m2d_build_col');await tap('#gbBkCl .gbCl[data-c="4"]');
 await tap('#gbBkP [data-r2b="more"]');await shot('m2e_build_more');await tap('#gbBkP [data-r2b="more"]');
 // place one part by real taps (part from the strip, tap the car twice = hold + place)
 const n0=await ev(()=>__gb.list().length);await tap('#gbBkPc .gbPc:not([style*="none"])');let placed=0;
 for(const[i,j]of[[-1,-1],[0,0],[-1,1],[0,-2],[1,1]]){const s=await ev(([i,j])=>__gb.scr(i,j),[i,j]);if(!s||s.y<60||s.y>330)continue;await tapXY(s.x,s.y);if(!await ev(()=>__gs.held()))continue;await shot('m2f_build_held');await tapXY(s.x,s.y);if(await ev(()=>__gb.list().length)>n0){placed=1;break}}
 console.log('PLACED',placed,n0,'→',await ev(()=>__gb.list().length));await shot('m2g_build_placed');await tap('#r2H [data-r2h="undo"]');console.log('after undo',await ev(()=>__gb.list().length));
 await tap('#gbBkP [data-r2b="sel"]');await A('select');
 await tap('#gbBkP [data-r2b="cat"]');await tap('#gbBkCt [data-r2s="kits"]',2000);await A('kits');await pg.waitForTimeout(25000);console.log('KITPICS',await ev(()=>{const a=[...document.querySelectorAll('#gbBody img[data-r2kit]')];return a.filter(i=>i.src&&i.src.length>500).length+'/'+a.length}));await shot('m3_kits');await tap('#r2C [data-r2bs="horn"]',1500);await shot('m3b_horn');
 await tap('#r2R [data-r2m="paint"]',2000);await A('paint');await shot('m4_paint');
 for(const f of['matte','metal','chrome','pearl','gloss']){await tap(`#r2C [data-r2fn="${f}"]`,1200);console.log('fin',f,await ev(()=>__r2.gbFin()));if(f==='chrome'||f==='pearl')await shot('m4_fin_'+f)}
 await tap('#r2C [data-r2fn="chrome"]',800);
 await ev(()=>{const B=document.querySelector('#gbBody'),e=B.querySelector('.gbP[data-pat]');if(e)B.scrollTop=e.offsetTop-B.offsetTop-40});await shot('m4b_paint_livery');
 await tap('#r2R [data-r2m="perks"]',2000);await A('perks');await shot('m5_perks');
 await tap('#r2R [data-r2m="driver"]',2500);await A('driver');await shot('m6_driver');await tap('#r2C [data-r2h5="3"]',1500);await shot('m6b_driver_torso');
 await tap('#r2R [data-r2m="rides"]',2000);await tap('#r2R [data-r2m="build"]',2500);await tap('#r2R [data-r2m="rides"]',2000);console.log('back to rides',await ev(()=>__r2.mode().join('/')));
 await tap('#gbSave',4000);console.log('closed',await ev(()=>document.querySelector('#gbx').hidden),'fin saved',await ev(()=>__r2.fin()));
 console.log('ERR',JSON.stringify(errs.slice(0,6)));await b.close()})();
