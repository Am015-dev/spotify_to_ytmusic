const PW=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const fs=require('fs');const html=fs.readFileSync(__dirname+'/hollowbough.html');
const [W,H]=[+process.argv[2],+process.argv[3]];const touch=Math.min(W,H)<=600;
(async()=>{const b=await PW.chromium.launch();const ctx=await b.newContext({viewport:{width:W,height:H},isMobile:touch,hasTouch:touch});
await ctx.route('**/*',r=>new URL(r.request().url()).host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
const p=await ctx.newPage();await p.goto('https://gns.test/');await p.evaluate(()=>{ANIM=0;AIDELAY=0;newGame('vs')});await p.waitForTimeout(800);
console.log(JSON.stringify(await p.evaluate(()=>{const o={};for(const s of['#dock','#cityS','#chips','#res','#acts','#handS','#board','#bd','.gx-bar']){const r=document.querySelector(s).getBoundingClientRect();o[s]=[r.left,r.top,r.width,r.height].map(Math.round)}o.cls=document.documentElement.className;return o})));await b.close()})();
