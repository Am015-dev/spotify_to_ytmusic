const PW=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const fs=require('fs');const html=fs.readFileSync(__dirname+'/hollowbough.html');
(async()=>{const b=await PW.chromium.launch();const ctx=await b.newContext({viewport:{width:740,height:360},isMobile:true,hasTouch:true});
await ctx.route('**/*',r=>new URL(r.request().url()).host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
const p=await ctx.newPage();p.on('console',m=>console.log(m.text()));await p.goto('https://gns.test/');await p.evaluate(()=>{UI.seed=5;AIDELAY=40;UI.opt={np:3,level:'normal',solo:1}});await p.tap('[data-start=vs]');
for(let k=0;k<60;k++){if(await p.evaluate(()=>!G.players[HB.actor(G)].ai&&!UI.tm))break;await p.waitForTimeout(150)}
for(let k=0;k<6;k++){const c=await p.$('#pc:not([hidden]) [data-a=cont]');if(!c)break;await c.tap()}
await p.tap('.tile.ok');await p.waitForTimeout(300);
const r=await p.evaluate(()=>{const e=document.querySelector('.gx-bar').getBoundingClientRect();document.addEventListener('click',ev=>console.log('CLICK',ev.clientX,ev.clientY,ev.target.tagName,ev.target.className&&ev.target.className.baseVal!==undefined?'svg':ev.target.className),true);return [e.left,e.top,e.right,e.bottom,UI.pop&&UI.pop.kind,document.elementFromPoint(e.left+2,22)&&document.elementFromPoint(e.left+2,22).className]});
console.log(r);await p.touchscreen.tap(r[0]+2,22);await p.waitForTimeout(300);console.log(await p.evaluate(()=>[innerWidth,visualViewport.scale,visualViewport.width,document.documentElement.scrollWidth,devicePixelRatio,!!UI.pop,document.querySelector('#ppop').hidden]));await b.close()})();
