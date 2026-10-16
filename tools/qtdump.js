// qtdump: boots Athens with window.__qtdump=1 and writes the ground-quadtree split/leaf bits of every top-level cell to src/10b_qt_data.js.
// usage: node tools/qtdump.js <page url, e.g. http://127.0.0.1:8890/hot.html (hot daemon)> ; then tools/build.sh. Re-run whenever roads/terrain change.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage();
 await p.addInitScript(()=>{window.__qtdump=1});
 {let u=process.argv[2]||'http://127.0.0.1:8890/hot.html';if(process.env.T6M==='1')u+=(u.includes('?')?'&':'?')+'t6m=1';await p.goto(u+(u.includes('?')?'&':'?')+'test=ath&draw=0')}await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:150000});
 const D=await p.evaluate(()=>window.__qtD);const bits=D.join('');
 const A='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';let o='';
 for(let i=0;i<bits.length;i+=6){let v=0;for(let j=0;j<6;j++)v=v*2+(bits.charCodeAt(i+j)===49?1:0);o+=A[v]}
 // split-1 layout: 10b holds the QTC header (n), 10c the bit-blob (lazy chunk); keep both files' comment lines
 const hb=fs.readFileSync('src/10b_qt_data.js','utf8').split('\n')[0],hc=fs.readFileSync('src/10c_qtc_blob.js','utf8').split('\n')[0];
 fs.writeFileSync('src/10b_qt_data.js',hb+'\nconst QTC={ok:true,v:'+(process.env.T6M==='1'?6:5)+',cnt:0,smp:[],pos:0,n:'+bits.length+',b:null};\n');
 fs.writeFileSync('src/10c_qtc_blob.js',hc+'\n{const A=\''+A+'\',S="'+o+'",B=new Uint8Array(S.length*6);for(let i=0;i<S.length;i++){const v=A.indexOf(S[i]);for(let j=0;j<6;j++)B[i*6+j]=v>>(5-j)&1}QTC.b=B}\n');
 console.log('cells',D.length,'bits',bits.length,'chars',o.length);await b.close()})()
