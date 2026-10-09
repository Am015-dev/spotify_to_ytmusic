// node tools/w8boat.js <url> <outdir> [sets] → per garage set: boat waterline gap (hull bottom - water surface, m) + side/3-4 shots
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const [URL,OUT,SETS='rod,ebbel,posei,gold']=process.argv.slice(2);fs.mkdirSync(OUT,{recursive:true});const SPOT=JSON.parse(process.env.SPOT||'[-417.9,-226.9]');
 const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const p=await b.newPage({viewport:{width:852,height:393}});p.setDefaultTimeout(600000);
 const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,200))});
 await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:300000});
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_athpre','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}))});
 await p.reload({timeout:600000});await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:300000});
 await p.evaluate(()=>{try{__m1.skip()}catch(e){}__mho.enterRoam()});await p.waitForFunction(()=>__mho.state==='roam',null,{timeout:300000});
 await p.evaluate(()=>{__mho.storyClose&&__mho.storyClose();__mho.roamSim(20);__ju.autoClose(true)});
 const save=(n,r)=>{if(r&&r.png)fs.writeFileSync(`${OUT}/${n}.png`,Buffer.from(r.png.split(',')[1],'base64'))};
 for(const id of SETS.split(',')){const sel=await p.evaluate(id=>__w8.sel(id),id);const r=await p.evaluate(s=>__w8.boatRun(s),SPOT);console.log(id,sel,JSON.stringify(r));
  save(`${id}_side`,await p.evaluate(()=>__w8.cam(1.5708,7,.8)));save(`${id}_34`,await p.evaluate(()=>__w8.cam(.9,8,1.6)))}
 console.log('ERRORS',errs.length,errs.slice(0,5).join(' | '));await b.close()})();
