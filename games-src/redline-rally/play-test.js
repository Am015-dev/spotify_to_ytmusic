/* A Quick game and Story chapter 1 played to the end by real mouse taps on visible, uncovered UI only (centre point must hit the element), phone 390x763.
   No engine calls, no ?fast: only the AIDELAY timing knob shortens waits. Usage: PW=../node_modules/playwright node play-test.js */
const path=require('path'),{chromium}=require(process.env.PW||'playwright'),gx=require('../scripts/gx-serve.js');
(async()=>{const url=await gx.url('redline-rally',{file:path.join(__dirname,'redline-rally.html')});const b=await chromium.launch({args:['--no-sandbox']});let fails=0;
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
const c=await b.newContext({viewport:{width:390,height:763},hasTouch:true,isMobile:true}),p=await c.newPage(),errs=[];
p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.addInitScript(()=>{window.AIDELAY=.06;if(!sessionStorage.getItem('init')){sessionStorage.setItem('init','1');localStorage.setItem('gxt-redline-rally',JSON.stringify({done:1}));localStorage.setItem('rr_seen','1')}});
await p.goto(url,{waitUntil:'load'});await p.waitForTimeout(300);
let covered=0;
const tapSel=async(sel)=>{const r=await p.evaluate(sel=>{const e=document.querySelector(sel);if(!e||!e.getClientRects().length||e.disabled)return null;const q=e.getBoundingClientRect(),x=q.left+q.width/2,y=q.top+q.height/2,h=document.elementFromPoint(x,y);return{x,y,hit:!!(h&&(h===e||e.contains(h)))}},sel);if(!r)return false;if(!r.hit){covered++;return false}await p.mouse.click(r.x,r.y);return true};
const tapText=async(re)=>{const r=await p.evaluate(src=>{const re=new RegExp(src,'i');const over=[...document.querySelectorAll('.gxc')].filter(e=>e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden');const bs=[...document.querySelectorAll('.gxc button')].filter(e=>e.getClientRects().length&&!e.disabled&&re.test(e.textContent));const e=bs[0];if(!e)return null;const q=e.getBoundingClientRect(),x=q.left+q.width/2,y=q.top+q.height/2,h=document.elementFromPoint(x,y);return{x,y,hit:!!(h&&(h===e||e.contains(h))),t:e.textContent.trim().slice(0,14)}},re.source);if(!r)return null;if(!r.hit){covered++;return null}await p.mouse.click(r.x,r.y);return r.t};
// ---- Quick game
await tapSel('#playB');await p.waitForSelector('#goalB');ok(await tapSel('#goalB'),'Goal card before turn 1');await p.waitForSelector('#goB');
ok(await tapSel('#swapB'),'Swap cards button is on the board');await tapSel('#hand .cd:not(.dead)');const sw=await p.evaluate(()=>document.querySelector('#goB').textContent);ok(/Swap 1/.test(sw),'swap mode: Go becomes '+sw);await tapSel('#goB');await p.waitForTimeout(200);
ok(await p.evaluate(()=>G.cars[0].hand.length===7&&G.cars[0].dsc===G.round&&!document.querySelector('#swapB')),'swap done: hand back to 7, once per round');
let done=false,turns=0;
for(let i=0;i<2500&&!done;i++){
 done=await p.evaluate(()=>!!document.querySelector('#modal .podium'));if(done)break;
 if(await tapSel('#slipN')){}
 else if(await tapSel('#goB')){turns++}
 else if(await tapSel('#sugB')){}
 else if(await tapSel('#hand .cd.glow')){}
 else if(await p.evaluate(()=>UI.busy)){await p.mouse.click(195,100)}
 await p.waitForTimeout(60)}
ok(done&&turns>3,'quick game played to the result screen by taps ('+turns+' turns)');
const res=await p.evaluate(()=>({rows:document.querySelectorAll('#modal .stand').length,line:(document.querySelector('#modal .rl')||{}).textContent}));
ok(res.rows>=2&&!!res.line,'result shows standings and a story line: '+res.line);
await tapSel('#home');await p.waitForTimeout(400);
// ---- Story chapter 1
await tapSel('#storyB');await p.waitForTimeout(500);
const node=await p.evaluate(()=>{const n=[...document.querySelectorAll('.gxc-node:not(.locked)')][0];if(!n)return null;const q=n.getBoundingClientRect(),x=q.left+q.width/2,y=q.top+q.height/2,h=document.elementFromPoint(x,y);return{x,y,hit:!!(h&&(n===h||n.contains(h)))}});
ok(!!node&&node.hit,'chapter 1 node is on the map and tappable');if(node)await p.mouse.click(node.x,node.y);
let beaten=false;
for(let i=0;i<2500&&!beaten;i++){
 const g=await p.evaluate(()=>{const over=[...document.querySelectorAll('.gxc')].some(e=>e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden'&&+getComputedStyle(e).opacity>0.5);return over});
 if(g){const t=await tapText(/start|race|let|go\b|continue|next|ok|begin|got|play/);if(!t)await tapText(/skip|try again/)}
 else if(await tapSel('#slipN')){}
 else if(await tapSel('#goB')){}
 else if(await tapSel('#sugB')){}
 else if(await tapSel('#hand .cd.glow')){}
 else if(await p.evaluate(()=>UI.busy)){await p.mouse.click(195,100)}
 if(i%8===0)beaten=await p.evaluate(()=>Object.keys(GXC.progress().ch).some(k=>GXC.progress().ch[k].beaten));
 await p.waitForTimeout(60)}
ok(beaten,'story chapter 1 played to the end by taps and saved as beaten');
ok(covered===0,'no tapped target was covered ('+covered+' covered)');
ok(errs.length===0,'0 console errors '+errs.join('|'));
await b.close();process.exit(fails?1:0)})();
