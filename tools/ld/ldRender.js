// tools/ld/ldRender.js <url> <outdir> <set id> <form car|off|boat> : 640x400 renders of a RIDES preset from several angles (quick look, not the gate)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const O=process.argv[3];fs.mkdirSync(O,{recursive:true});const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const p=await (await b.newContext({viewport:{width:852,height:393}})).newPage();
 const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errs.push(m.text())});
 await p.goto(process.argv[2]);await p.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});
 const V={front:Math.PI,side_r:-Math.PI/2,side_l:Math.PI/2,rear34:-.7,box34:-2.2,top:2.35};
 for(const k in V){const u=await p.evaluate(async r=>{__g9c.S.ry=r[0];__g9c.S.th.clear();const u=__g9c.render(r[1],r[2],640,400);if(!u)return null;const bl=await (await fetch(u)).blob();return await new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result);f.readAsDataURL(bl)})},[V[k],process.argv[4],process.argv[5]||'car']);if(!u){console.log(k,'NO');continue}fs.writeFileSync(`${O}/${k}.png`,Buffer.from(u.split(',')[1],'base64'));console.log(k,'ok')}
 console.log('ERR',JSON.stringify(errs.slice(0,6)));await b.close()})();
