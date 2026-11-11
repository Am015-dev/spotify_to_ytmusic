// random clicker for Doorkick Dungeon: plays human seats only through the page's buttons (modal dialogs, open popups, the dock prompt, playable cards)
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(process.argv[2]||'doorkick.html','utf8');
const modes=(process.argv[3]||'F,hot').split(',');
function run(mode,anim,maxTurn){return new Promise(res=>{const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/'+(process.env.PHONE?'?phone=1':'')});const w=dom.window,d=w.document;
  const errs=[];w.addEventListener('error',e=>errs.push(e.message));w.console.error=(...a)=>errs.push(a.join(' '));
  w.eval(`ANIM=${anim};AIDELAY=0`);  if(mode!=='F'){const b=d.querySelector(`[data-set="mode"][data-v="${mode}"]`);b.dispatchEvent(new w.MouseEvent('click',{bubbles:true}))}
  const st=d.querySelector(`[data-start="${mode}"]`);if(!st){res({mode,errs:['no start']});return}st.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  const seen=new Set();let last='',stall=0;const t0=Date.now();const click=el=>el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));const rnd=a=>a[Math.floor(Math.random()*a.length)];
  const iv=setInterval(()=>{try{const G=w.eval('G');const md=d.getElementById('modal');const dr=d.querySelector('.gx-drawer.on');const m=!md.hidden?md:dr||md;
    if(!md.hidden||dr){const bs=[...m.querySelectorAll('button[data-mv],button[data-a]:not([data-a="new"])')];const h=m.querySelector('h2');if(h)seen.add('modal:'+h.textContent.replace(/\d+/g,'#').slice(0,24));
      const mv=bs.filter(b=>b.dataset.mv);if(mv.length&&Math.random()<.8){const b=rnd(mv);seen.add('mv:'+JSON.parse(b.dataset.mv).act);click(b);return}if(bs.length){click(rnd(bs));return}}
    else{const tg=[...d.querySelectorAll('[data-bfz]')];if(tg.length&&Math.random()<.6){const z=rnd(tg);seen.add('drop:'+z.dataset.bfz.replace(/\d+$/,''));click(z);return}  // board-first: a picked card / ask mode lights targets
      const acts=[...d.querySelectorAll('#prompt [data-mv]:not(:disabled),#prompt [data-a]:not(:disabled)')];const cards=[...d.querySelectorAll('.mine [data-card].play')];
      if(cards.length&&Math.random()<.5){seen.add('card');click(rnd(cards));return}
      if(acts.length){const b=rnd(acts);seen.add('btn:'+(b.dataset.mv?JSON.parse(b.dataset.mv).act:b.dataset.a));click(b);return}}
    const sig=JSON.stringify([G.turn,G.active,G.phase,G.log.length,G.q&&G.q.kind]);if(sig===last)stall++;else{stall=0;last=sig}
    if(stall>800)errs.push('STALL '+G.phase+' toAct '+w.eval('sideToAct()')+' '+w.eval('JSON.stringify(validMoves(sideToAct()).slice(0,4))')+' modal '+(md.hidden&&!dr?'-':m.textContent.slice(0,60)));
    const inv=w.eval('checkInvariants()');if(inv.length&&errs.length<5){errs.push('INV '+inv[0]);if(errs.length===1)console.log('DEBUG',inv[0],w.eval('JSON.stringify({ph:G.phase,q:G.q,cb:G.cb&&{st:G.cb.stage,m:G.cb.mons,k:G.cb.killed,os:G.cb.os},loot:G.loot,take:G.take})'),w.eval('G.log.slice(0,8).map(l=>l.t).join(" / ")'))}
    if(G.winner||G.turn>maxTurn||stall>800||Date.now()-t0>90000){clearInterval(iv);res({mode,anim,turn:G.turn,w:G.winner,rej:w.eval('UI.rej||0'),lastErr:w.eval('UI.lastErr||""'),errs,seen:[...seen]});w.close()}
  }catch(e){errs.push(String(e.stack||e));clearInterval(iv);res({mode,errs});w.close()}},anim?15:2)})}
(async()=>{const all=new Set();let bad=0;for(const m of modes)for(const [a,t] of [[0,60],[1,6]]){const r=await run(m,a,t);(r.seen||[]).forEach(x=>all.add(x));bad+=r.errs.length;console.log(m,'anim',a,'turn',r.turn,'winner',r.w,'rejected',r.rej,r.lastErr,'errors',r.errs.length,JSON.stringify(r.errs.slice(0,3)))}
  console.log('TOTAL errors',bad);console.log('seen:',[...all].sort().join(' | '))})()
