// t4/g9iter.js: boot once, then render template variants on demand. Write JS to <dir>/req.js: an expression giving {name:bricksArrayExpr-as-string}
// (evaluated in module scope via __g9ev); PNGs go to <dir>/<name>.png, then <dir>/done.txt. usage: node t4/g9iter.js <url> <dir>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const O=process.argv[3];fs.mkdirSync(O,{recursive:true});const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const p=await (await b.newContext({viewport:{width:852,height:393}})).newPage();
 const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errs.push(m.text())});
 await p.goto(process.argv[2]);await p.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});fs.writeFileSync(O+'/ready.txt','1');
 let last=0,n=0;for(;;){const f=O+'/req.js';if(fs.existsSync(O+'/quit'))break;if(fs.existsSync(f)&&fs.statSync(f).mtimeMs!==last){last=fs.statSync(f).mtimeMs;const src=fs.readFileSync(f,'utf8');n++;const log=[];
   try{const R=await p.evaluate(([src,n])=>{const V=__g9ev('('+src+')'),o={};for(const k in V){const [ry,f]=(V[k].ry!=null)?[V[k].ry,V[k].f]:[2.35,'car'];__g9c.S.ry=ry;
      const A=V[k].A;o[k]=__g9ev('G9C_render')({id:'it'+n+k,car:()=>A,off:()=>A,boat:()=>A},'car',640,400)}return o},[src,n]);
    for(const k in R){if(R[k])fs.writeFileSync(`${O}/${k}.png`,Buffer.from(R[k].split(',')[1],'base64'));log.push(k+(R[k]?' ok':' NO'))}}catch(e){log.push('ERR '+e)}
   log.push('ERRS '+JSON.stringify(errs.splice(0)));fs.writeFileSync(O+'/done.txt',n+'\n'+log.join('\n'))}await new Promise(r=>setTimeout(r,1000))}
 await b.close()})();
