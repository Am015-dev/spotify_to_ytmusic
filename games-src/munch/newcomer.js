// Newcomer replay: a full game against the computer through the real page, following the hints (💡 buttons, suggested cards).
// Usage: PW=$(npm root -g)/playwright node newcomer.js <outdir> [W] [H] [seed] [maxShots]
const {chromium}=require(process.env.PW);const fs=require('fs');
const out=process.argv[2]||'shots';const W=+process.argv[3]||1366,H=+process.argv[4]||768,seed=+process.argv[5]||7,MAXS=+process.argv[6]||60;
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const p=await b.newPage({viewport:{width:W,height:H},hasTouch:W<700});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&!/ERR_|Failed to load|net::/.test(m.text())&&errs.push(m.text()));
  await p.goto('file://'+process.cwd()+'/doorkick.html');await p.evaluate(()=>{try{localStorage.clear()}catch(e){}});await p.reload();await p.waitForTimeout(400);
  let n=0;const tag=W<700?'m':'d';const shot=async name=>{if(n>=MAXS)return;n++;await p.screenshot({path:`${out}/${tag}${String(n).padStart(3,'0')}_${name}.png`})};
  await shot('start');await p.evaluate(s=>{setSeed(s);AIDELAY=180},seed);await p.click('#modal [data-start="F"]');await p.waitForTimeout(500);
  const log=[];const seenK={};let clicks=0,followed=0,own=0,last='',stall=0;
  for(let i=0;i<6000;i++){await p.waitForTimeout(120);
    const st=await p.evaluate(()=>{const s=sideToAct();const pr=document.querySelector('#prompt');return {me:s===0&&!G.winner,win:G.winner,turn:G.turn,ph:G.phase,q:G.q&&G.q.kind,stage:G.cb&&G.cb.stage,modal:!document.getElementById('modal').hidden,open:GX.open,
      warn:!!document.querySelector('.winwarn'),toast:!!document.querySelector('.toast'),out:!!document.querySelector('.outcome'),hint:(pr&&pr.querySelector('.hint')||{}).textContent||'',warnT:(document.querySelector('.winwarn')||{}).textContent||'',toastT:(document.querySelector('.toast')||{}).textContent||'',say:(pr&&pr.querySelector('p')||{}).textContent||''}});
    if(st.win){await p.waitForTimeout(700);await shot('end');break}
    const k=[st.ph,st.q,st.stage,st.warn?'W':'',st.toast?'T':'',st.out?'O':''].join('/');
    if(st.warn||st.toast){const kk=(st.warn?'W':'T')+(st.warnT||st.toastT).slice(0,40);if(!seenK[kk]){seenK[kk]=1;log.push(`t${st.turn} ${st.warn?'WARN':'TOAST'}: ${(st.warnT||st.toastT).trim()}`);await shot(st.warn?'warn':'toast')}}
    if(st.out&&!seenK['O'+st.turn]){seenK['O'+st.turn]=1;if((seenK.oc=(seenK.oc||0)+1)<=6)await shot('outcome')}
    if(st.open==='dkCard'){const rec=await p.$('#dkCard .opt.rec');const any=await p.$('#dkCard [data-mv]');if(rec){await rec.click({timeout:3000}).catch(()=>{});followed++}else if(any)await any.click({timeout:3000}).catch(()=>{});else await p.click('#dkCard .gx-x',{timeout:3000}).catch(()=>{});clicks++;continue}
    if(st.open){await p.keyboard.press('Escape');continue}
    if(st.modal)continue;
    if(!st.me)continue;
    const sig=JSON.stringify(st);if(sig===last)stall++;else{stall=0;last=sig}if(stall>40){log.push('STALL '+sig);break}
    if(st.hint&&!seenK['H'+st.hint.slice(0,50)]){seenK['H'+st.hint.slice(0,50)]=1;log.push(`t${st.turn} ${k}: ${st.say.trim()} || HINT: ${st.hint.trim()}`);if((seenK.hc=(seenK.hc||0)+1)%3===1)await shot(st.ph+(st.stage?'-'+st.stage:'')+(st.q?'-'+st.q:''))}
    // follow the advice
    const sel=['#prompt .winwarn .btn.rec','.asks .btn.rec','#prompt .acts .btn.rec'];let el=null;for(const s of sel){el=await p.$(s);if(el)break}
    if(el){await el.click({timeout:3000}).catch(()=>{});followed++;clicks++;continue}
    const card=await p.$('.hand .card.sug, .gear .gchip.sug');if(card){await card.click({timeout:3000}).catch(()=>{});followed++;clicks++;await p.waitForTimeout(250);continue}
    const prim=await p.$('#prompt .acts .btn.primary:not(:disabled)');const any=await p.$('#prompt [data-mv]:not(:disabled)');
    if(prim){await prim.click({timeout:3000}).catch(()=>{});own++;clicks++;continue}if(any){await any.click({timeout:3000}).catch(()=>{});own++;clicks++;continue}
    const pc=await p.$('.hand .card.play');if(pc){await pc.click({timeout:3000}).catch(()=>{});own++;clicks++;continue}}
  const fin=await p.evaluate(()=>({turn:G.turn,winner:G.winner,winText:G.winText,lv:G.pl.map(p=>p.nm+':'+p.lvl).join(' '),rej:UI.rej||0,lastErr:UI.lastErr||''}));
  log.push(`END ${JSON.stringify(fin)} clicks ${clicks} followed ${followed} own ${own} errors ${errs.length} ${JSON.stringify(errs.slice(0,3))}`);
  fs.writeFileSync(`${out}/${tag}_log.txt`,log.join('\n'));console.log(log.slice(-1)[0]);await b.close()})();
