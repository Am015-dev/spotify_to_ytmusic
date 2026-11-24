// Screenshots of the written Rules panel (title screen "How to play"), every scroll page, at phone and desktop size. Usage: node rules-panel.js
const {chromium}=require('/opt/node-tools/node_modules/playwright'); const path=require('path'); const dir=path.resolve(__dirname,'..')+'/';
(async()=>{const b=await chromium.launch(); let bad=0;
for(const [w,h,n] of [[402,874,'402'],[1366,768,'1366']]){
 const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:w<500,deviceScaleFactor:w<500?2:1}); const p=await ctx.newPage(); const errs=[];
 p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
 await p.goto('file://'+dir+'via-tessera.html'); await p.waitForTimeout(500); await p.tap('#trules'); await p.waitForTimeout(300);
 const info=await p.evaluate(()=>{const d=document.querySelector('#drawer'); let s=null; d.querySelectorAll('*').forEach(e=>{if(e.scrollHeight>e.clientHeight+4&&/auto|scroll/.test(getComputedStyle(e).overflowY))s=s||e}); if(s)s.setAttribute('data-sc','1'); return s?{sh:s.scrollHeight,ch:s.clientHeight}:null});
 const pages=info?Math.ceil(info.sh/(info.ch-40)):1; console.log(n,JSON.stringify(info),'pages',pages);
 for(let k=0;k<pages;k++){await p.evaluate(k=>{const s=document.querySelector('[data-sc]'); if(s)s.scrollTop=k*(s.clientHeight-40)},k); await p.waitForTimeout(100); await p.screenshot({path:`${__dirname}/${n}-rules-${k+1}.png`});}
 const over=await p.evaluate(()=>[...document.querySelectorAll('#drawer .rules *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).length); if(over){console.log('horizontal overflow',over);bad++}
 if(errs.length){console.log(n,'JS ERRORS',errs);bad++}
 await ctx.close();}
await b.close(); console.log(bad?'FAIL':'OK'); process.exit(bad?1:0)})();
