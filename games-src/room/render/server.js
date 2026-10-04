const http=require('http'),fs=require('fs'),path=require('path');
const ROOT=__dirname,THREE=path.join(__dirname,'../../node_modules/three');
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.gltf':'model/gltf+json','.bin':'application/octet-stream','.jpg':'image/jpeg','.png':'image/png','.hdr':'application/octet-stream'};
module.exports=function serve(port){return new Promise(r=>{const s=http.createServer((q,res)=>{let u=decodeURIComponent(q.url.split('?')[0]);let f=u.startsWith('/three/')?path.join(THREE,u.slice(7)):path.join(ROOT,u);
 fs.readFile(f,(e,d)=>{if(e){res.writeHead(404);res.end();return}res.writeHead(200,{'content-type':types[path.extname(f)]||'application/octet-stream'});res.end(d)})});s.listen(port,()=>r(s))})};
