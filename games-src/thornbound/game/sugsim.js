// Suggestion-follower sim (F14): a default game from the title (Play -> Start, nothing changed), then seat 0 always plays the game's own
// suggestion (getRec: the same move the glow and the "Suggested" tag show) and the rival plays at its level. Prints the win rate.
//   node sugsim.js [games=10] [level=default] [size=375x667]      level: default (what Start gives) | easy | normal | hard
//   FOLLOW=0.5 node sugsim.js ...   the newcomer proxy: plays the suggestion half the time, a random legal move otherwise (F15)
const PW=(()=>{try{return require('playwright')}catch(e){return require('/opt/node-tools/node_modules/playwright')}})();
const fs=require('fs');const html=fs.readFileSync(process.env.TB_FILE||__dirname+'/thornbound.html');
const N=+(process.argv[2]||10),LVL=process.argv[3]||'default',[W,H]=(process.argv[4]||'375x667').split('x').map(Number);const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await PW.chromium.launch();let wins=0,games=0,errs=0;const out=[];
  for(let g=0;g<N;g++){const ctx=await b.newContext({viewport:{width:W,height:H},isMobile:true,hasTouch:true});
    await ctx.route('**/*',r=>new URL(r.request().url()).host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
    const p=await ctx.newPage();p.on('pageerror',e=>{errs++;if(errs<4)console.log('pageerror',e.message)});
    await p.goto('https://gns.test/?phone=1');await sleep(700);
    await p.evaluate(()=>{showStart();document.querySelector('#start [data-a=play]').click()});await sleep(300);
    await p.evaluate(()=>document.querySelector('#start [data-a=start]').click());await sleep(600);
    const r=await p.evaluate(([g,LVL,FOL])=>{const info={fac:G.pl.map(x=>x.fac+':'+(x.ai||'you')),rounds:G.rounds};
      if(LVL!=='default')G.pl[1].ai=LVL;let n=0,bad=0,fb=0;
      while(G.phase!=='over'&&n<4000){n++;const q=TB.pending(G);if(!q){break}
        if(q.seats.includes(0)){UI._rk=null;const mv=legal(0);let m=null;if(Math.random()<FOL){try{m=getRec(0,mv)}catch(e){bad++}}else m=mv[Math.floor(Math.random()*mv.length)];if(!m){m=mv[0];fb++}if(G.q.t==='menu'){const kk=G.q.kind+':'+(m.t||'')+':'+String(m.a||'').split(':')[0];(window.__mk=window.__mk||{})[kk]=(window.__mk[kk]||0)+1}const rr=TB.apply(G,m);if(!rr.ok){bad++;TB.apply(G,mv[0])}}
        else TB.AI.step(G,{humans:[0]})}
      return {mk:window.__mk,info,me:G.pl[0].inf,riv:G.pl[1].inf,over:G.phase==='over',win:G.over&&G.over.winner,n,bad,fb}},[g,LVL,+(process.env.FOLLOW||1)]);
    games++;const won=r.over&&(r.win===0||r.me>r.riv);if(won)wins++;out.push(r.me+'-'+r.riv+(won?'W':'L'));
    if(process.env.V)console.log(JSON.stringify(r.mk));if(g===0)console.log('setup',JSON.stringify(r.info),'steps',r.n,'advice errors',r.bad,'no-suggestion',r.fb,'winner field',r.win);
    await ctx.close()}
  await b.close();console.log('SUGSIM follow='+(process.env.FOLLOW||1)+' level='+LVL+' wins '+wins+'/'+games+' ('+Math.round(100*wins/games)+'%) '+out.join(' ')+' pageerrors '+errs)})();
