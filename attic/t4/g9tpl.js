// t4/g9tpl.js: big 3D renders (640x400) of every collection template + the stock sets, saved as PNGs into <outdir>. usage: RY=-2.35 node t4/g9tpl.js <url> <outdir>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const O=process.argv[3];fs.mkdirSync(O,{recursive:true});const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const p=await (await b.newContext({viewport:{width:852,height:393}})).newPage();
 const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errs.push(m.text())});
 await p.goto(process.argv[2]);await p.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});
 if(process.env.RY)await p.evaluate(r=>{__g9c.S.ry=+r},process.env.RY);
 const ids=await p.evaluate(()=>__g9c.T.map(t=>t.id).concat(['t_beast']));
 for(const id of ids){const f=id==='t_beast'?'off':'car';const u=await p.evaluate(([id,f])=>__g9c.render(id,f,640,400),[id,f]);if(!u){console.log(id,'NO RENDER');continue}fs.writeFileSync(`${O}/${id}.png`,Buffer.from(u.split(',')[1],'base64'));console.log(id,'ok')}
 console.log('ERR',errs.slice(0,6));await b.close()})();
