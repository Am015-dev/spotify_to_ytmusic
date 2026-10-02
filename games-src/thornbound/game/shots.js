const PW=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');const fs=require('fs');
const html=fs.readFileSync(__dirname+'/thornbound.html');const [W,H]=(process.argv[2]||'390x844').split('x').map(Number);const tag=process.argv[3]||'a';
(async()=>{const b=await PW.chromium.launch();const ctx=await b.newContext({viewport:{width:W,height:H},isMobile:W<700,hasTouch:W<700});
await ctx.route('**/*',r=>new URL(r.request().url()).host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(['error','warning'].includes(m.type()))errs.push(m.type()+' '+m.text())});
await p.goto('https://gns.test/'+(W<700?'?phone=1':''));await p.waitForTimeout(1200);
await p.evaluate(()=>{AIDELAY=0;ANIM=0;newGame("me",{np:3,seed:5});UI.guide='off'});await p.waitForTimeout(500);
const seen=new Set();let n=0;
for(let i=0;i<400&&n<12;i++){const st=await p.evaluate(()=>({k:G.q&&G.q.kind,card:UI.card&&UI.card.kind,ev:UI.card&&UI.card.ev&&UI.card.ev.t,over:!!G.over,s:viewSeatForQ()}));
 if(st.over)break;
 const key=st.card?('card:'+st.card+':'+st.ev):('q:'+st.k);
 if(!seen.has(key)){seen.add(key);await p.waitForTimeout(300);await p.screenshot({path:`/tmp/${tag}_${n++}_${key.replace(/[^a-z0-9]/gi,'_')}.png`});console.log('shot',n-1,key)}
 if(st.card){await p.evaluate(()=>{const b=document.querySelector('#pc [data-a=evok],#pc [data-a=tipok],#pc [data-a=take]');b&&b.click()})}
 else if(st.s!=null){await p.evaluate(()=>{const r=UI._rec||suggest(viewSeatForQ());const mv=legal(viewSeatForQ());const m=(r&&mv.find(x=>x.k===r.k))||mv[0];humanMove(m.k)})}
 await p.waitForTimeout(40)}
console.log(errs.slice(0,10).join('\n'));await b.close()})();
