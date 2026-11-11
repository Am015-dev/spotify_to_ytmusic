// clarity checks on the phone UI (jsdom, 2D fallback): things blind playtesters could not explain.
// node clarity-test.js [games]   -> prints each failed check and "clarity: N passed, M failed"
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(__dirname+'/rampart.html','utf8');
const NG=+process.argv[2]||4;const fails=[];let pass=0;const ok=(c,msg)=>{if(c)pass++;else if(fails.length<40)fails.push(msg)};
function run(seed,ex){return new Promise(res=>{const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/?phone=1'});const w=dom.window,d=w.document;
  w.console.warn=()=>{};const errs=[];w.console.error=(...a)=>errs.push(a.join(' '));
  w.addEventListener('load',()=>{w.eval(`AIDELAY=0;ANIM=0;setSeed(${seed});try{localStorage.clear()}catch(e){}`);
    const click=el=>el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));const q=s=>d.querySelector(s);
    for(const k of ['river','ic','tb']){const cb=q(`[data-ex=${k}]`);if(cb&&cb.checked!==!!ex[k])click(cb)}
    click(q('[data-ui=start]'));const so=q('[data-ui=storyok]');if(so)click(so);
    // who made the move that is being resolved
    let mover=-1;const pm=w.performMove;w.performMove=function(m,s){mover=s;return pm.apply(this,arguments)};
    const seenCard=new Set();let nofTips=0;const t0=Date.now();
    const iv=setInterval(()=>{try{const G=w.eval('G');if(!G)return;
      const cards=w.eval('PHN.cards');
      if(cards.length){const c=cards[0];if(!seenCard.has(c.id)){seenCard.add(c.id);
          if(c.id[0]==='s'){// a feature scored during play
            const head=(q('#pc .pc-h')||{}).textContent||'';const bar=(q('#pbar')||{}).textContent||'';const nm=w.eval(`P(${mover}).nm`);
            ok(head.includes(nm)||(mover===0&&/\byour?\b/i.test(head)),`seed ${seed} turn ${G.turn}: score card does not say whose tile finished it (mover ${nm}): "${head.trim()}"`);
            ok(bar.includes(nm),`seed ${seed} turn ${G.turn}: bar shows "${bar.trim()}" while ${nm}'s scoring card is up`)}
          if(/No followers left/.test(c.h))nofTips++}
        click(q('#pc [data-ph=cont]'));return}
      if(G.over){clearInterval(iv);ok(nofTips<=1,`seed ${seed}: "No followers left" tip shown ${nofTips} times`);ok(!errs.length,`seed ${seed}: console errors ${errs.slice(0,2)}`);res();w.close();return}
      if(Date.now()-t0>200000){clearInterval(iv);fails.push('seed '+seed+' timeout');res();w.close();return}
      if(!w.eval('me()'))return;
      if(G.step==='place'){const st=(q('#ps')||{}).textContent||'';if(w.eval('tilesLeft()')===0)ok(!/\b0 left/.test(st),`seed ${seed}: strip says "0 left" while I hold a tile`);
        w.eval('go(aiMove(0))');return}
      if(G.step==='fig'){w.eval('advise()');const a=w.eval('UI.advice');
        if(a&&a.fig&&a.fig.act==='fig'&&a.fig.k==='f'){const ty=w.eval(`TSEG[G.tiles[G.cur.k].t][${a.fig.l}].ty`);
          if(ty==='F'){const b=[...d.querySelectorAll('#ppop [data-mv]')].find(b=>{const m=JSON.parse(b.dataset.mv);return m.l===a.fig.l&&m.k==='f'});
            if(b){const shown=(b.textContent.match(/\+(\d+)/)||[])[1];const nums=(a.text.match(/\d+/g)||[]);ok(nums.includes(shown),`seed ${seed} turn ${G.turn}: farm advice "${a.text}" vs option "${b.textContent.trim()}"`)}}}
        w.eval('applyAdvice()');return}
    }catch(e){fails.push(String(e.stack).slice(0,300));clearInterval(iv);res();w.close()}},1)})})}
(async()=>{const exs=[{},{river:1},{ic:1,tb:1},{river:1,ic:1,tb:1}];for(let i=0;i<NG;i++)await run(500+i,exs[i%exs.length]);
  fails.forEach(f=>console.log('FAIL',f));console.log(`clarity: ${pass} passed, ${fails.length} failed`);process.exit(fails.length?1:0)})();
