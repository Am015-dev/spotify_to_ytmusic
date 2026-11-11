const {chromium}=require(process.env.PW);const path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const vp=process.env.PHONE?{viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2}:{viewport:{width:1300,height:900}};
 const ctx=await b.newContext(vp);const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_CERT|Failed to load/.test(m.text()))errs.push(m.text())});
 await p.addInitScript(x=>{localStorage.setItem('na_tour','1');localStorage.setItem('pwex',x)},process.env.EX||'{}');await p.goto('file://'+path.resolve('nebula.html'));await p.waitForTimeout(800);
 await p.evaluate(s=>{if(window.PWEX)0;UI.ex=JSON.parse(localStorage.getItem('pwex')||'{}');UI.size=s;AIDELAY=180;document.querySelector('[data-start]').click()},process.env.SIZE||'core');let shots=0,last='',same=0;const t0=Date.now();
 while(Date.now()-t0<240000){await p.waitForTimeout(250);const st=await p.evaluate(()=>{if(!G)return 'nog';if(G.winner)return 'win:'+G.winner;
     const nr=document.querySelector('#prompt [data-a="nextround"],#prompt [data-a="hold"]');if(nr){nr.click();return 'continue'+G.round}
     if(G.phase==='plan'&&planSide()>=0){document.querySelector('[data-a="autodial"]').click();const l=document.querySelector('[data-a="lock"]:not([disabled])');if(l)l.click();return 'plan'+G.round}
     if(!humanTurn())return G.phase+G.round+':'+G.oi;const bs=[...document.querySelectorAll('#prompt button:not([disabled])')].filter(b=>!/^(new|rules|stats)$/.test(b.dataset.a||''));
     const pr=bs.find(b=>b.dataset.act==='fire'&&b.dataset.w!=='skip')||bs.find(b=>b.classList.contains('primary'))||bs[0];if(pr){pr.click();return 'click '+G.phase+G.round}return 'wait'+G.phase});
   if(st.startsWith('win')){console.log(st);break}if(st===last)same++;else same=0;last=st;if(same===40){console.log('STUCK at',st,await p.evaluate(()=>JSON.stringify({phase:G.phase,cur:G.cur,oi:G.oi,pending:UI.pending,anim:Object.keys(V3.anim||{}).length})))}
   if(!shots&&st.startsWith('click amod')){await p.waitForTimeout(500);await p.screenshot({path:'play_combat.png'});shots=1}}
 await p.waitForTimeout(3000);await p.screenshot({path:'play_end.png'});console.log('round',await p.evaluate(()=>G&&G.round),'errors',JSON.stringify(errs.slice(0,5)),'time',((Date.now()-t0)/1000).toFixed(0)+'s');await b.close()})();
