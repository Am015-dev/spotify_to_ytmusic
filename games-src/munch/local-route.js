// Serves the built game on https://gns.test/ (and its media/, music/ files) from disk so tests run the REAL page, painted kit and music included
// (the old file:// and "abort every other request" set-ups made the kit and the music fetch fail). Usage: await localRoute(ctx, htmlBuffer)
const fs=require('fs'),path=require('path');
const DIRS=[__dirname,path.join(__dirname,'../../games/doorkick-dungeon')];
const TYPES={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.mp3':'audio/mpeg','.ogg':'audio/ogg','.m4a':'audio/mp4','.mp4':'video/mp4','.json':'application/json','.glb':'model/gltf-binary','.woff2':'font/woff2'};
module.exports=async function localRoute(ctx,html,dirs){dirs=dirs||DIRS;
  await ctx.route('**/*',r=>{const u=new URL(r.request().url());if(u.host!=='gns.test')return r.abort();
    const rel=decodeURIComponent(u.pathname).replace(/^\/+/,'');
    if(!rel||rel==='index.html'||rel==='doorkick.html'||rel==='sands.html')return r.fulfill({status:200,contentType:'text/html',body:html});
    for(const d of dirs){const f=path.join(d,rel);if(f.startsWith(d)&&fs.existsSync(f)&&fs.statSync(f).isFile())return r.fulfill({status:200,contentType:TYPES[path.extname(f)]||'application/octet-stream',body:fs.readFileSync(f)})}
    return r.fulfill({status:404,body:'nope'})})};
