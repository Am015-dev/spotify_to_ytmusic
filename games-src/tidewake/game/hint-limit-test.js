// Hint is limited per game: 3 on Easy, 2 Normal, 1 Hard, shown as "★ Hint (N)"; the guided game is unlimited; asking again on the same turn is free.
// node hint-limit-test.js
const PW=(()=>{try{return require('playwright')}catch(e){return require('/opt/node-tools/node_modules/playwright')}})();
const gx=require('../../scripts/gx-serve.js');const path=require('path');
(async()=>{const url=await gx.url('tidewake',{file:path.join(__dirname,'tidewake.html')});const b=await PW.chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});let fail=0;
  const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fail++};
  const c=await b.newContext({viewport:{width:375,height:667},hasTouch:true,isMobile:true});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto(url);await p.waitForTimeout(1200);await p.evaluate(()=>{localStorage.clear();localStorage.setItem('tw_played','1');localStorage.setItem('tw_offered','1')});await p.reload();await p.waitForTimeout(1200);
  for(const lv of ['easy','normal','hard']){
    const r=await p.evaluate(async lv=>{try{GXH.setEnabled(false)}catch(e){}try{GX.close()}catch(e){}const st=defaultSetup();st.mode='me';st.np=2;st.variant=null;st.seats.forEach((x,i)=>{x.h=i===0;x.lv=lv});startGame(st,{});
      await new Promise(r=>setTimeout(r,800));const d=0;const left0=UI.hintsLeft;const lab=document.querySelector('#bulbbtn span').textContent;
      const spent=[];for(let i=0;i<5;i++){G.logN+=1+i;spent.push(hintSpend(d))}
      const again=hintSpend(d);return {left0,lab,spent,again,left:UI.hintsLeft,lab2:document.querySelector('#bulbbtn span').textContent}},lv);
    const q={easy:3,normal:2,hard:1}[lv];
    ok(r.left0===q&&r.lab==='★ Hint ('+q+')','game vs '+lv+': '+q+' Hints, button reads '+r.lab);
    ok(r.spent.filter(x=>x).length===q&&r.again===false&&r.left===0&&r.lab2==='★ Hint (0)','spends exactly '+q+' then refuses ('+JSON.stringify(r.spent)+')')}
  const g=await p.evaluate(()=>{startGuided();return new Promise(r=>setTimeout(()=>r({left:UI.hintsLeft,lab:document.querySelector('#bulbbtn span').textContent}),1500))});
  ok(g.left==null&&g.lab==='Hint','guided game: Hint unlimited, label "Hint"');
  ok(!errs.length,'0 console errors '+errs.join('|'));await b.close();process.exit(fail?1:0)})();
