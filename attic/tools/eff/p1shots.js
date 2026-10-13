// PERF1 before/after shots + context count: node p1shots.js <url> <tag> [fra|ath]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const [URL,TAG,CITY='fra']=process.argv.slice(2);const OUT=process.env.OUT||'.';
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'});
 const p=await ctx.newPage();p.setDefaultTimeout(900000);const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,160)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,160))});
 await p.addInitScript("(()=>{const o=HTMLCanvasElement.prototype.getContext,S=new WeakSet();window.__CTX={n:0};HTMLCanvasElement.prototype.getContext=function(t,...a){const r=o.call(this,t,...a);if(r&&/webgl/.test(t)&&!S.has(this)){S.add(this);__CTX.n++}return r}})()");
 const shot=async n=>{await p.screenshot({path:`${OUT}/${TAG}_${n}.png`});console.log('shot',n)};const R={};
 await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:200});await p.waitForTimeout(2500);await shot('menu');
 // team cards (W13): screenshot the #teams strip wherever it is
 R.teams=await p.evaluate(()=>{const L=[...document.querySelectorAll('#teams canvas')];const d=document.createElement('div');d.id='p1T';d.style.cssText='position:fixed;inset:0;z-index:99999;background:#223;display:flex;flex-wrap:wrap;gap:4px;padding:4px';for(const c of L.slice(0,8)){const e=document.createElement('canvas');e.width=c.width;e.height=c.height;e.style.width='200px';e.getContext('2d').drawImage(c,0,0);d.appendChild(e)}document.body.appendChild(d);return L.length});
 await shot('teams');await p.evaluate(()=>document.getElementById('p1T').remove());
 R.ctx_menu=await p.evaluate(()=>__CTX.n);
 await p.evaluate(c=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}));if(c==='ath'){localStorage.setItem('mho_city@1','ath');localStorage.setItem('mho_athd@1','A');localStorage.setItem('mho_roam.ath@1','{"otg":{}}');localStorage.setItem('mho_story.ath@1','{"seen":1}')}},CITY);
 await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:200});
 await p.evaluate(()=>__mho.enterRoam());await p.waitForFunction(()=>__mho.state==='roam'&&!(__mho.LD&&__mho.LD.on),null,{polling:200});await p.waitForTimeout(3000);await shot('roam_'+CITY);
 await p.keyboard.down('ArrowUp');await p.waitForTimeout(4000);await p.keyboard.up('ArrowUp');await shot('drive_'+CITY);
 await p.evaluate(()=>document.querySelector('#roamPause [data-p=garage]').click());await p.waitForFunction(()=>{const g=document.querySelector('#gbx');return g&&!g.hidden&&g.getBoundingClientRect().width>10},null,{polling:50});
 await p.waitForTimeout(6000);await shot('garage');
 // a parts category with thumbnails
 R.cats=await p.evaluate(()=>[...document.querySelectorAll('#gbx button')].filter(b=>b.offsetParent).map(b=>b.textContent.trim().slice(0,14)).slice(0,40));
 R.th=await p.evaluate(()=>({tiles:document.querySelectorAll('#gbBkPc .gbPc').length,thumbs:document.querySelectorAll('#gbBkPc .gbPc img').length,src:(document.querySelector('#gbBkPc .gbPc img')||{}).src?.slice(0,30)}));
 R.ctx_garage=await p.evaluate(()=>__CTX.n);R.progs=await p.evaluate(()=>__mho.info().progs);
 await p.evaluate(()=>{const b=[...document.querySelectorAll('#gbx button')].find(b=>/close|done|exit|back|✕|×/i.test(b.textContent)&&b.offsetParent);if(b)b.click()});await p.waitForTimeout(3000);await shot('after_garage');
 R.errs=errs.slice(0,8);console.log(JSON.stringify(R));await b.close()})().catch(e=>{console.error(e);process.exit(1)});
