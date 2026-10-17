const {chromium}=require(process.env.PW);const path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:1300,height:900}});const errs=[];
 p.on('pageerror',e=>errs.push((e.stack||e.message).split('\n').slice(0,4).join(' | ')));p.on('console',m=>{if(m.type()==='error'&&!/ERR_CERT|Failed to load/.test(m.text()))errs.push(m.text())});
 await p.addInitScript(()=>{localStorage.clear();localStorage.setItem('na_tour','1')});await p.goto('file://'+path.resolve('nebula.html'));await p.waitForTimeout(700);
 for(const k of ['w1','w2','w3'])await p.click(`[data-exk="${k}"]`);await p.click('[data-size="custom"]');await p.screenshot({path:'b_start.png'});
 await p.click('[data-a="build"][data-k="0"]');await p.click('[data-badd="jax"]');await p.click('[data-badd="tamsin"]');
 await p.selectOption('[data-bslot="0:1"]',{index:1}).catch(()=>{});await p.waitForTimeout(200);await p.screenshot({path:'b_builder.png'});
 await p.click('[data-a="bdone"]');await p.click('[data-a="build"][data-k="1"]');await p.click('[data-a="brand"]');await p.click('[data-a="bdone"]');
 await p.evaluate(()=>{AIDELAY=150;document.querySelector('[data-start]').click()});await p.waitForTimeout(1500);await p.screenshot({path:'b_battle.png'});
 const t0=Date.now();let shot=0;while(Date.now()-t0<150000){await p.waitForTimeout(250);const st=await p.evaluate(()=>{if(!G)return 'nog';if(G.winner)return 'win';
    if(G.phase==='plan'&&planSide()>=0){document.querySelector('[data-a="autodial"]').click();const l=document.querySelector('[data-a="lock"]:not([disabled])');if(l)l.click();return 'plan'}
    if(!humanTurn())return G.phase;const bs=[...document.querySelectorAll('#prompt button:not([disabled])')].filter(b=>!/^(new|rules|stats)$/.test(b.dataset.a||''));const pr=bs.find(b=>b.dataset.act==='fire'&&b.dataset.w!=='skip')||bs.find(b=>b.classList.contains('primary'))||bs[0];if(pr){pr.click();return 'c'+G.phase}return 'w'});
   if(st==='win')break;if(!shot&&(await p.evaluate(()=>G&&G.round))>=3){await p.screenshot({path:'b_round3.png'});shot=1}}
 console.log('round',await p.evaluate(()=>G&&G.round),'winner',await p.evaluate(()=>G&&G.winner),'ships',await p.evaluate(()=>G.ships.map(s=>s.name+(s.alive?'':'†')).join(', ')),'errors',JSON.stringify(errs.slice(0,5)));await b.close()})();
