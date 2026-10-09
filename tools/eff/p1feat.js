// garage feature check after PERF1 (search, tray, part rotation, paint -> thumbnails, phone rotation, close): node p1feat.js <url> <tag> [iframe]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [URL,TAG,IFR]=process.argv.slice(2);const OUT=process.env.OUT||'.';
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const ctx=await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true});
 const p=await ctx.newPage();p.setDefaultTimeout(300000);const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,200)));p.on('console',m=>{if(m.type()==='error'&&!/404/.test(m.text()))errs.push(m.text().slice(0,200))});
 await p.goto(URL);const F=IFR?p.frameLocator('#f'):null;const fr=IFR?(await (await p.waitForSelector('#f')).contentFrame()):p.mainFrame();
 const ev=(f,a)=>fr.evaluate(f,a);const R={};const shot=async n=>{await p.screenshot({path:`${OUT}/${TAG}_${n}.png`})};const W=ms=>p.waitForTimeout(ms);
 await fr.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:200});await W(800);
 await ev(()=>document.querySelector('#gbMenuBtn').click());await fr.waitForFunction(()=>{const g=document.querySelector('#gbx');return g&&!g.hidden&&g.getBoundingClientRect().width>10},null,{polling:50});await W(2500);await shot('g_rides');
 R.build=await ev(()=>{const b=[...document.querySelectorAll('#gbx button')].find(b=>b.offsetParent&&/^\W*BUILD$/.test(b.textContent.trim()));if(b)b.click();return !!b});await W(6000);
 const th=()=>ev(()=>{const T=[...document.querySelectorAll('#gbBkPc .gbPc')].filter(b=>b.style.display!=='none'&&b.offsetParent);return{vis:T.length,img:T.filter(b=>b.querySelector('img')).length,tc:[...new Set(T.map(b=>b.dataset.tc))].join('/'),src0:(T[0]&&T[0].querySelector('img')||{}).src?.slice(0,40)}});
 R.th0=await th();await shot('g_build');
 // paint: pick another colour -> thumbnails redraw in it
 R.col=await ev(()=>{const c=[...document.querySelectorAll('#gbx button[data-c]')].filter(b=>b.offsetParent);const x=c.find(b=>!b.classList.contains('on')&&b.dataset.c!=='0')||c[3];if(x)x.click();return x&&x.dataset.c});await W(4000);R.th1=await th();await shot('g_paint');
 // search
 R.search=await ev(()=>{const i=document.querySelector('#g13Qi');if(!i)return 'no input';i.focus();i.value='slope';i.dispatchEvent(new Event('input',{bubbles:true}));return 'ok'});await W(4000);R.th2=await th();await shot('g_search');
 await ev(()=>{const i=document.querySelector('#g13Qi');if(i){i.value='';i.dispatchEvent(new Event('input',{bubbles:true}));i.blur()}});await W(1500);
 // tray
 R.tray=await ev(()=>{const b=[...document.querySelectorAll('#gbx button')].find(b=>b.offsetParent&&/TRAY/.test(b.textContent));if(b)b.click();return !!b});await W(2000);await shot('g_tray');
 await ev(()=>{const b=[...document.querySelectorAll('#gbx button')].find(b=>b.offsetParent&&/TRAY/.test(b.textContent));if(b)b.click()});await W(1000);
 // part rotation pad
 R.turn=await ev(()=>{const b=[...document.querySelectorAll('#gbx [data-g13],#gbx button')].find(b=>b.offsetParent&&/TURN|ROTATE/i.test(b.textContent));if(b)b.click();const y=document.querySelector('#g13Pad [data-g13a=y]');if(y&&y.offsetParent)y.click();return (b?b.textContent.trim().slice(0,12):'-')+'|pad:'+!!(y&&y.offsetParent)});await W(1500);await shot('g_turn');
 // phone rotation while the garage is open
 await p.setViewportSize({width:393,height:852});await W(3000);await shot('g_portrait');await p.setViewportSize({width:852,height:393});await W(3000);await shot('g_landscape');
 R.canvas=await ev(()=>{const c=document.querySelector('#c');return{par:c.parentElement.className||c.parentElement.tagName,w:c.width,h:c.height}});
 // close
 R.close=await ev(()=>{const b=[...document.querySelectorAll('#gbx button')].find(b=>b.offsetParent&&/BACK/.test(b.textContent));if(b)b.click();return !!b});await W(2500);
 R.after=await ev(()=>{const c=document.querySelector('#c'),r=c.getBoundingClientRect();return{par:c.parentElement.tagName,style:c.getAttribute('style')||'',w:c.width,h:c.height,rect:[r.width,r.height],gbx:document.querySelector('#gbx').hidden,state:__mho.state}});await shot('g_closed');
 R.errs=errs.slice(0,8);console.log(JSON.stringify(R));await b.close()})().catch(e=>{console.error(e);process.exit(1)});
