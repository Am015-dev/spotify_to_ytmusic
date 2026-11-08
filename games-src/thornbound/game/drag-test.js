// Drag test: drag real hand cards onto the glowing spot (bid) and onto regions (place), by touch on a 390x844 phone (CDP touch events)
// and by mouse on 1440x900. Passes when every drag lands the card (engine state changes) and the snap calls navigator.vibrate.
//   node drag-test.js
const PW=(()=>{try{return require('playwright')}catch(e){return require('/opt/node-tools/node_modules/playwright')}})();
const fs=require('fs');const html=fs.readFileSync(__dirname+'/thornbound.html');
async function run(b,W,H,touch){const ctx=await b.newContext({viewport:{width:W,height:H},isMobile:touch,hasTouch:touch});
  await ctx.route('**/*',r=>new URL(r.request().url()).host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('https://gns.test/'+(touch?'?phone=1':''));await p.waitForTimeout(1000);
  await p.evaluate(()=>{window.__vib=0;navigator.vibrate=()=>{window.__vib++;return true};AIDELAY=0;ANIM=0;newGame('me',{np:3,seed:5});const g=document.getElementById('tbgoal');g&&g.remove()});
  const cdp=touch?await ctx.newCDPSession(p):null;
  const drag=async(a,z)=>{const n=10;if(touch){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:a.x,y:a.y}]});for(let i=1;i<=n;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:a.x+(z.x-a.x)*i/n,y:a.y+(z.y-a.y)*i/n}]});await p.waitForTimeout(16)}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})}
    else{await p.mouse.move(a.x,a.y);await p.mouse.down();for(let i=1;i<=n;i++){await p.mouse.move(a.x+(z.x-a.x)*i/n,a.y+(z.y-a.y)*i/n);await p.waitForTimeout(16)}await p.mouse.up()}};
  let ok=0,tried=0,fails=[];
  for(let i=0;i<400&&tried<8;i++){const st=await p.evaluate(()=>{if(G.over)return {over:1};if(UI.card){try{evDone()}catch(e){}try{newsOk()}catch(e){}return {}}const s=viewSeatForQ();if(s==null)return {};const k=G.q.kind;
      if(k==='bid'||k==='place'){const c=[...document.querySelectorAll('#handw .hc')].find(e=>cardMoves(+e.dataset.id).length);if(!c)return {};const r=c.getBoundingClientRect();let t=null;
        if(k==='bid'){const sp=document.querySelector('#spots .bspot');if(sp){const q=sp.getBoundingClientRect();t={x:q.left+q.width/2,y:q.top+q.height/2}}}
        else{const m=cardMoves(+c.dataset.id)[0];const R=regionRect(m.r);t={x:R.left+R.width/2,y:R.top+R.height/2}}
        return {k,a:{x:r.left+r.width/2,y:r.top+Math.min(30,r.height/2)},t,sig:G.logN+':'+JSON.stringify(G.pl[s].hand.length)}}
      const mv=legal(s);humanMove(mv[0].k);return {}});
    if(st.over)break;if(!st.k||!st.t){await p.waitForTimeout(20);continue}
    tried++;const v0=await p.evaluate(()=>window.__vib);await drag(st.a,st.t);await p.waitForTimeout(250);
    const after=await p.evaluate(()=>({sig:G.logN+':'+JSON.stringify(G.pl[viewSeatForQ()!=null?viewSeatForQ():0].hand.length),v:window.__vib}));
    if(after.sig!==st.sig&&after.v>v0)ok++;else fails.push(st.k+(after.sig===st.sig?' did not land':' no vibrate'))}
  await ctx.close();return {W,H,touch,tried,ok,fails,errs}}
(async()=>{const b=await PW.chromium.launch();const r=[await run(b,390,844,true),await run(b,1440,900,false)];await b.close();
  let bad=0;for(const x of r){console.log((x.ok===x.tried&&x.tried>0&&!x.errs.length?'PASS':'FAIL'),x.W+'x'+x.H,x.touch?'touch':'mouse','drags',x.ok+'/'+x.tried,x.fails.slice(0,4).join('; '),x.errs.slice(0,2).join('; '));if(!(x.ok===x.tried&&x.tried>0&&!x.errs.length))bad++}
  process.exit(bad?1:0)})();
