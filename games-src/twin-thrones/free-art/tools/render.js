// usage: node render.js specs.json outdir   (needs playwright from games-src/node_modules)
const {chromium}=require('/home/user/spotify_to_ytmusic/games-src/node_modules/playwright');
const fs=require('fs'),path=require('path'),http=require('http');
const specs=JSON.parse(fs.readFileSync(process.argv[2])),out=process.argv[3]; fs.mkdirSync(out,{recursive:true});
const root=''+__dirname+'/web';
const srv=http.createServer((q,s)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0])); fs.readFile(f,(e,b)=>{if(e){s.writeHead(404);s.end();return} const t={'.html':'text/html','.js':'text/javascript','.gltf':'application/json','.bin':'application/octet-stream','.png':'image/png'}[path.extname(f)]||'application/octet-stream'; s.writeHead(200,{'content-type':t});s.end(b)})}).listen(0,async()=>{
 const port=srv.address().port; const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const pg=await b.newPage();
 pg.on('pageerror',e=>console.log('ERR',e.message)); await pg.goto(`http://localhost:${port}/r.html`); await pg.waitForFunction('window.ready',null,{timeout:30000});
 let n=0; for(const s of specs){ try{ const u=await pg.evaluate(x=>window.render(x),s); fs.writeFileSync(path.join(out,s.id+'.png'),Buffer.from(u.split(',')[1],'base64')); n++;}catch(e){console.log('FAIL',s.id,e.message.slice(0,100))} }
 console.log('rendered',n,'/',specs.length); await b.close(); srv.close(); });
