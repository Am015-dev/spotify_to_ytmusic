// Plays a Quick game (or Story stage 1) to the result screen by tapping only visible, uncovered UI. node quick-e2e.js [quick|story] [390x763] [shots-dir]
const PW=(()=>{try{return require('playwright')}catch(e){return require('../../node_modules/playwright')}})();
const fs=require('fs');const html=fs.readFileSync(__dirname+'/sunglaze.html');
const mode=process.argv[2]||'quick';const [W,H]=(process.argv[3]||'390x763').split('x').map(Number);const SH=process.argv[4]||'';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let fail=0;const P=(ok,m)=>{console.log((ok?'PASS ':'FAIL ')+m);if(!ok)fail++};
(async()=>{const browser=await PW.chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const desk=W>800;const ctx=await browser.newContext({viewport:{width:W,height:H},isMobile:!desk,hasTouch:!desk});
await ctx.route('**/*',r=>new URL(r.request().url()).host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
const p=await ctx.newPage();p.setDefaultTimeout(15000);const errs=[];
p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/net::|Failed to load|favicon/.test(m.text()))errs.push(m.text())});
const tapXY=async(x,y)=>desk?p.mouse.click(x,y):p.touchscreen.tap(x,y);
// tap an element only if the centre point really hits it (uncovered)
const tapSel=async sel=>{const r=await p.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;const b=e.getBoundingClientRect();if(b.width<2||b.height<2)return null;const x=b.left+b.width/2,y=b.top+b.height/2;const h=document.elementFromPoint(x,y);return h&&(h===e||e.contains(h)||h.contains(e))?{x,y}:{x,y,covered:h&&(h.id||h.className)}},sel);
 if(!r)return false;if(r.covered){return 'covered:'+r.covered}await tapXY(r.x,r.y);return true};
const shot=async n=>{if(SH){fs.mkdirSync(SH,{recursive:true});await p.screenshot({path:SH+'/'+n+'.png'})}};
await p.goto('https://gns.test/'+(desk?'':'?phone=1'));await sleep(800);await p.evaluate(m=>{try{localStorage.clear();localStorage.setItem('sgz_offer','1');if(m==='story')localStorage.setItem('gxt-sunglaze','{"done":1}')}catch(e){}},mode);await p.reload();await sleep(1500);
await p.evaluate(()=>{window.bfD=ms=>ms*.3});
await shot('01-title');
const clickText=async(sel,re)=>{const i=await p.evaluate(([s,r])=>{const re=new RegExp(r,'i');const l=[...document.querySelectorAll(s)].filter(e=>{const b=e.getBoundingClientRect();return b.width>2&&re.test(e.textContent)});if(!l.length)return -1;l[0].setAttribute('data-e2e','1');return 1},[sel,re]);if(i<0)return false;const r=await tapSel('[data-e2e="1"]');await p.evaluate(()=>document.querySelectorAll('[data-e2e]').forEach(e=>e.removeAttribute('data-e2e')));return r===true};
if(mode==='story'){P(await clickText('#modal button, #modal .btn, button','Story'),'tap Story');await sleep(1200);}
else{P(await clickText('#modal button','^Begin'),'tap Begin');await sleep(800)}
// dismiss anything: story intro "Play"/"Enter", chapter map -> first stage
let t0=Date.now(),turns=0,stuckSince=Date.now(),lastSig='',shots={};
for(let it=0;it<900;it++){
 const s=await p.evaluate(()=>({over:!!((typeof G!=='undefined'&&G&&G.over)),has:!!(typeof G!=='undefined'&&G),phase:(typeof G!=='undefined'&&G)&&G.phase,cur:(typeof G!=='undefined'&&G)?sideToAct():null,modal:!!(document.getElementById('modal')&&!document.getElementById('modal').hidden&&document.getElementById('modal').innerHTML.length>50)}));
 if(s.over){await sleep(2500);break}
 if(s.phase==='wall'&&!shots.w){shots.w=1;for(let k=0;k<4;k++){await sleep(500);await shot('07-tiling-'+k)}}
 const sig=JSON.stringify(s)+await p.evaluate(()=>(typeof G!=='undefined'&&G)?G.turn+'/'+G.round:'');if(sig!==lastSig){lastSig=sig;stuckSince=Date.now()}
 if(Date.now()-stuckSince>45000){P(false,'stuck '+sig);await shot('stuck');break}
 // try dialogs first (visible buttons in modal/overlays)
 if(!s.has||s.modal){
  if(await clickText('#modal button, .gxt-end button, .gxc button, button','^(Just play|Next|Play(?!ers)|Enter the courtyard|Start|Begin|Continue|Stage|Chapter|Go|OK|Got it|Start chapter|Fight)')){await sleep(700);continue}
  // story chapter map: first available node
  const n=await p.evaluate(()=>{const e=document.querySelector('.gxc-node:not(.locked), [data-gxc-play], .gxc-stage:not(.locked)');if(e){e.setAttribute('data-e2e','1');return 1}return 0});if(n){await tapSel('[data-e2e="1"]');await p.evaluate(()=>document.querySelectorAll('[data-e2e]').forEach(e=>e.removeAttribute('data-e2e')));await sleep(700);continue}
 }
 if(s.has&&s.cur===0&&!s.modal){
  // human turn: dismiss coach, then tile, then rack
  if(await clickText('.gxh-ok, .gxh-bub button','Got it|OK')){await sleep(200);continue}
  if(s.phase==='offer'&&desk){
   const pk=await p.evaluate(()=>{const e=document.querySelector('#dockbody .pk');if(e)e.setAttribute('data-e2e','1');return !!e});
   if(pk){if(await tapSel('[data-e2e="1"]')===true){await sleep(400)}}
   else{const ln=await p.evaluate(()=>{const l=[...document.querySelectorAll('#dockbody button[data-line]')];const e=l.find(x=>+x.dataset.line<5)||l[0];if(e)e.setAttribute('data-e2e','1');return !!e});if(ln&&await tapSel('[data-e2e="1"]')===true){turns++;await sleep(600)}else await sleep(300)}
   await p.evaluate(()=>document.querySelectorAll('[data-e2e]').forEach(e=>e.removeAttribute('data-e2e')));
  }else if(s.phase==='offer'){
   const sel=await p.evaluate(()=>!!UI.sel);
   if(!sel){const k=await p.evaluate(()=>{const els=[...document.querySelectorAll('.bf-t[data-k]')].filter(e=>{const b=e.getBoundingClientRect();return b.width>4&&/^(f\d+|c)_/.test(e.dataset.k)&&!e.classList.contains('hid')&&!e.closest('.bf-me')});return els.map(e=>e.dataset.k)});
    let done=false;for(const key of k){const r=await tapSel(`[data-k="${key}"]`);if(r===true){await sleep(350);if(await p.evaluate(()=>!!UI.sel)){done=true;break}}}
    if(!done){await sleep(300)}
    if(done&&!shots.sel){shots.sel=1;await shot('03-selected')}
   }else{
    const rows=await p.evaluate(()=>[...document.querySelectorAll('.bf-row.ok [data-bfrow], [data-bfrow].ok, .bf-row.ok')].map((e,i)=>{e.setAttribute('data-e2e','r'+i);return 'r'+i}));
    let done=false;for(const r of rows){const ok=await tapSel(`[data-e2e="${r}"] .bf-rack, [data-e2e="${r}"]`);if(ok===true){await sleep(500);turns++;done=true;break}}
    await p.evaluate(()=>document.querySelectorAll('[data-e2e]').forEach(e=>e.removeAttribute('data-e2e')));
    if(!done){const f=await tapSel('.bf-fl');if(f===true){turns++;await sleep(500)}else await sleep(300)}
    if(turns===1&&!shots.t1){shots.t1=1;await sleep(500);await shot('02-first-turn-placed')}
   }
 }
 }else if(s.has&&s.cur===1){if(!shots.rv){shots.rv=1;for(let k=0;k<5;k++){await sleep(450);await shot('04-rival-turn-'+k)}}await sleep(300)}
 else await sleep(300);
 // wall-phase prompts for the human (variants)
}
const fin=await p.evaluate(()=>({over:!!((typeof G!=='undefined'&&G&&G.over)),sc:(typeof G!=='undefined'&&G&&G.pl)?G.pl.map(x=>x.score):null,txt:(document.querySelector('.bf-ov')||{}).innerText||''}));
P(fin.over,mode+' game played to the result by taps ('+turns+' of my placements, '+Math.round((Date.now()-t0)/1000)+'s) scores '+JSON.stringify(fin.sc));
await shot('05-result');await sleep(4000);await shot('06-result-b');
P(errs.length===0,'0 console errors'+(errs.length?' '+errs.slice(0,2).join(' | '):''));
await browser.close();process.exit(fail?1:0)})();
