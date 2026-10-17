// contact sheet of every tile drawing (with follower spots) -> shots/sheet.png
const fs=require('fs'),vm=require('vm');const D=__dirname+'/src/';const ctx={console,Math,JSON};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(D+'data.js','utf8')+fs.readFileSync(D+'geo.js','utf8')+';globalThis.__X={TT,tileSVG}',ctx);const X=ctx.__X;
const html='<html><body style="margin:0;background:#333;display:flex;flex-wrap:wrap;gap:4px;width:1400px;font:10px sans-serif;color:#fff">'+X.TT.map((d,t)=>`<div style="width:130px"><svg viewBox="0 0 100 100" width="130" height="130">${X.tileSVG(t,{spots:true})}</svg><br>${d.id}</div>`).join('')+'</body></html>';
fs.writeFileSync(__dirname+'/shots/sheet.html',html);
const {chromium}=require(process.env.PW);(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:900}});await p.goto('file://'+__dirname+'/shots/sheet.html');await p.screenshot({path:__dirname+'/shots/sheet.png',fullPage:true});await b.close()})();
