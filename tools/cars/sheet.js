// sheet.js out.png img1 img2 ... : 4-column contact sheet
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const [out,...f]=process.argv.slice(2);const br=await chromium.launch();const p=await br.newPage({viewport:{width:1704,height:200}});
const h='<body style="margin:0;background:#000;display:grid;grid-template-columns:repeat(4,426px);gap:0">'+f.map(x=>`<div style="position:relative"><img style="width:426px;display:block" src="data:image/png;base64,${fs.readFileSync(x).toString('base64')}"><b style="position:absolute;left:4px;top:2px;color:#ff0;font:12px monospace">${x.split('/').pop()}</b></div>`).join('')+'</body>';
await p.setContent(h);await p.waitForTimeout(300);await p.screenshot({path:out,fullPage:true});await br.close()})();
