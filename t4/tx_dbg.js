const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const ctx=await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errs.push(m.text())});const W=ms=>p.waitForTimeout(ms);
await p.goto(process.argv[2]);await p.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});
const tap=async s=>{const e=await p.$(s);if(!e)return console.log("NO",s);await e.scrollIntoViewIfNeeded().catch(()=>{});const bb=await e.boundingBox();await p.touchscreen.tap(bb.x+bb.width/2,bb.y+bb.height/2);await W(900)};
await tap('#gbMenuBtn');await W(1500);await tap('#r2R [data-r2m="rides"]');await W(1200);
for(const id of (process.argv[3]||'t_taxi').split(',')){await tap(`[data-gc="${id}"]`);await W(1500);
console.log(id,await p.evaluate(()=>{const m=__gb.mesh();let n=0,tri=0;m.traverse(o=>{if(o.isMesh&&o.userData.gb&&o.visible){n++;tri+=o.geometry.attributes.position.count/3}});return JSON.stringify({n,tri,sel:__g9c.eq('car'),bricks:__gb.list().length})}))}
await p.screenshot({path:'/tmp/claude-0/-home-user-spotify-to-ytmusic/42373c9d-9ad1-532f-9d0c-cd1937d69cf8/scratchpad/dbg.png'});
console.log('ERR',JSON.stringify(errs.filter(e=>!/GPU stall|GL Driver/.test(e)).slice(0,8)));await b.close()})();
