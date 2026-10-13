// t4/r3perks.js (R3): real taps through PERKS / DRIVER / SHOWROOM / level-up card / profile; shots + audit (tap targets < 44 px, text < 12 px).
// usage: node t4/r3perks.js <url> <outdir> [W H]; LVL=<driver level to set first> (default 12); IFRAME=1; SW=<ms before each shot>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const U=process.argv[2],O=process.argv[3],W=+(process.argv[4]||852),H=+(process.argv[5]||393);fs.mkdirSync(O,{recursive:true});
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({viewport:{width:W,height:H},isMobile:W<1000,hasTouch:true});const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(String(e)));pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await pg.goto(U);let p=pg;if(process.env.IFRAME){await pg.setContent(`<html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#000"><iframe id="f" src="${U}" style="border:0;width:${W}px;height:${H}px"></iframe></body></html>`);await pg.waitForTimeout(500);p=pg.frames()[1]}
 await p.waitForFunction(()=>window.__mho&&document.querySelector('#topBtns')&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});const cdp=await ctx.newCDPSession(pg);
 const ev=(f,a)=>p.evaluate(f,a);const fo=process.env.IFRAME?await (await p.frameElement()).boundingBox():{x:0,y:0};
 const tapXY=async(x,y,w=900)=>{const tp=[{x:x+fo.x,y:y+fo.y,id:1,radiusX:4,radiusY:4,force:1}];await Promise.all([cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:tp}),cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})]);await pg.waitForTimeout(w)};
 const tap=async(s,w)=>{const e=await p.$(s);if(!e){console.log('NO',s);return 0}const bb=await e.boundingBox();if(!bb){console.log('NOBOX',s);return 0}await tapXY(bb.x-fo.x+bb.width/2,bb.y-fo.y+bb.height/2,w);return 1};
 const shot=async n=>{await pg.waitForTimeout(+(process.env.SW||6000));await pg.screenshot({path:`${O}/${n}.png`,timeout:180000});console.log('shot',n)};
 const audit=n=>ev(root=>{const R=document.querySelector(root)||document.body;const vis=e=>{const r=e.getBoundingClientRect();if(!(r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth))return 0;for(let q=e;q;q=q.parentElement){const s=getComputedStyle(q);if(s.display==='none'||s.visibility==='hidden'||+s.opacity===0)return 0}return 1};
  const small=[],tiny=[];for(const e of R.querySelectorAll('button,[data-r3c],[data-r3t]')){if(!vis(e))continue;const r=e.getBoundingClientRect();const sc=e.closest('.r3Car,#gbBody,#r2C');if(sc){const s=sc.getBoundingClientRect();if(r.right<s.left+2||r.left>s.right-2||r.bottom<s.top+2||r.top>s.bottom-2)continue}if(r.width<43.5||r.height<43.5)small.push((e.textContent||'').trim().slice(0,14)+' '+Math.round(r.width)+'x'+Math.round(r.height))}
  for(const e of R.querySelectorAll('*')){if(!vis(e))continue;if(![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))continue;const f=parseFloat(getComputedStyle(e).fontSize);if(f<12)tiny.push(e.textContent.trim().slice(0,16)+' '+f)}return{small:small.slice(0,10),tiny:tiny.slice(0,8)}},n).then(r=>console.log('AUDIT',n,JSON.stringify(r)));
 const L=+(process.env.LVL||12);console.log('lvl',await ev(L=>__r3.setLvl(L),L),'slots',await ev(()=>__r3.slots()));
 await ev(()=>{const s=JSON.parse(localStorage.getItem('mho_perks')||'[]');});await shot('r0_start');
 await tap('#gbMenuBtn',2500);await tap('#r2R [data-r2m="perks"]',2500);await audit('#gbx');await shot('r1_perks');
 await tap('#gbBody .r3S[data-r3sl="0"]',1500);await ev(()=>{const e=document.querySelector('#gbBody [data-gpk="hanb"]');if(e)e.scrollIntoView({block:'center'})});await p.waitForTimeout(800);await tap('#gbBody [data-gpk="hanb"]',2500);console.log('eq',JSON.stringify(await ev(()=>__r3.eq())));
 await ev(()=>{const B=document.querySelector('#gbBody');B.scrollTop=0});await shot('r1b_perks_equipped');console.log('stats',JSON.stringify(await ev(()=>__r3.stats())));
 await tap('#r2R [data-r2m="driver"]',2500);await audit('#gbx');await shot('r2_driver');
 await tap('#r2R [data-r2m="rides"]',2500);await shot('r3_rides');await tap('#r2C [data-r3show]',3000);await p.waitForTimeout(+(process.env.SHW||25000));console.log('show imgs',await ev(()=>{const a=[...document.querySelectorAll('#r3Sh img')];return a.filter(i=>i.src).length+'/'+a.length}));await audit('#r3Sh');await shot('r4_showroom');
 await tap('#r3Sh [data-r3t="off"]',2500);await shot('r4b_showroom_offroad');await tap('#r3Sh [data-r3x]',2000);
 await tap('#gbBack',3000);await ev(()=>__r3.up(9,10,false));await audit('#r3Up');await shot('r5_levelup');await tap('#r3Up [data-r3u="ok"]',1500);console.log('card hidden',await ev(()=>document.querySelector('#r3Up').hidden));
 await tap('#gpfBtn',2500);await audit('#profile');await shot('r6_profile');
 console.log('ERR',JSON.stringify(errs.slice(0,8)));await b.close()})();
