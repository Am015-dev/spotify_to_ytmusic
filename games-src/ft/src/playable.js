// ===================== the readable-turn layer: banner, one-line captions, score pops, the guide's story in the tutorial, result voice =====================
// Everything here only reads the game (G, G.log) and draws small see-through-to-taps overlays (pointer-events:none, data-help so the kit ignores them).
const PL={seed:null,logN:0,tot:null,lastId:null,pops:0,banT:0,reactT:0};
const plEl=(id,cls)=>{let e=document.getElementById(id);if(!e){e=document.createElement('div');e.id=id;e.className=cls||'';e.setAttribute('data-help','');e.setAttribute('aria-hidden','true');document.body.appendChild(e)}return e};
function plName(t){if(!G)return t;const hs=G.pl.filter(x=>x.human);if(hs.length===1){const nm=hs[0].nm;t=t.split(nm+"'s").join('Your').split(nm).join('You')}
  const V={lifts:'lift',bids:'bid',ends:'end',takes:'take',keeps:'keep',claims:'claim',pitches:'pitch',buys:'buy',sells:'sell',summons:'summon',plants:'plant',raises:'raise',hires:'hire',sends:'send',uses:'use',has:'have',finds:'find',brings:'bring',wins:'win'};
  return t.replace(/\bYou (lifts|bids|ends|takes|keeps|claims|pitches|buys|sells|summons|plants|raises|hires|sends|uses|has|finds|brings|wins)\b/g,(m,v)=>'You '+V[v])}
function plBanner(title,sub,cls){return;   // Addendum 7: no toasts in Play; the coach and the tracker say it
  const b=plEl('plban','plban');b.className='plban '+(cls||'');b.innerHTML='<b>'+esc(title)+'</b>'+(sub?'<small>'+esc(sub)+'</small>':'');void b.offsetWidth;b.classList.add('on');clearTimeout(PL.banT);PL.banT=setTimeout(()=>b.classList.remove('on'),ANIM?1300:200)}
const PLQ=[];let PLQB=false;
function plPop(i,d,why){if(G&&G.coach)return;   // in Learn to play the coach explains every change, one message at a time
  PLQ.push([i,d,why]);while(PLQ.length>2)PLQ.shift();plPopNext()}
function plPopNext(){if(PLQB||!PLQ.length)return;const cb=document.getElementById('coach'),to=document.getElementById('turnover');if((cb&&cb.classList.contains('on'))||(to&&to.classList.contains('on'))||document.getElementById('summon')){setTimeout(plPopNext,350);return}if(!G||G.over){PLQ.length=0;return}const [i,d,why]=PLQ.shift();if(G&&!G.over&&me()&&me().i!==i&&G.phase==='turn'){plPopNext();return}   // a rival's pop never lands during your own turn
  const s=typeof seatEl==='function'?seatEl(i):null;if(!s){plPopNext();return}const r=s.getBoundingClientRect();if(!r.width){plPopNext();return}
  const e=document.createElement('div');e.className='plpop '+(d>0?'up':'dn');e.setAttribute('data-help','');e.setAttribute('aria-hidden','true');
  e.innerHTML=why?'<span>'+esc(why)+'</span>':'<b>'+(d>0?'+':'\u2212')+Math.abs(d)+'</b>';document.body.appendChild(e);PLQB=true;
  // R38 row 4: the pop lives IN the score bar (it covers the step tracker, or the scorer's seat chip), never on the tile grid
  const bar=()=>{const t2=document.getElementById('trk');if(t2&&!t2.hidden){const q=t2.getBoundingClientRect();if(q.width>40&&q.height>8)return q}const s2=seatEl(i);return s2?s2.getBoundingClientRect():r};
  const place=()=>{const q=bar();e.style.left=Math.round(q.left)+'px';e.style.top=Math.round(q.top)+'px';e.style.width=Math.round(q.width)+'px';e.style.height=Math.max(22,Math.round(q.height))+'px'};
  e.classList.add('inbar');place();const ms=ANIM?1500+String(why||'').split(' ').length*70:100;
  const keep=setInterval(()=>{if(e.isConnected)place()},120);
  setTimeout(()=>{clearInterval(keep);e.remove();PLQB=false;plPopNext()},ms)}
function plSay(who,text){const e=plEl('plreact','plreact');e.innerHTML='<i>'+who.face+'</i><span><b>'+esc(who.name)+'</b> '+esc(text)+'</span>';void e.offsetWidth;e.classList.add('on');clearTimeout(PL.reactT);PL.reactT=setTimeout(()=>e.classList.remove('on'),ANIM?1600:200)}
// R25: every score pop's number is the sum of the reasons it names. One part changed: "You lose 3 pts: spent 3 coins" /
// "Teal scores 5 pts from palaces". Several parts: "You score 2 pts: palaces +5, coins \u22123" (the listed numbers add up to the headline).
const PL_LAB={coins:'coins',advisors:'Advisors',sages:'Sages',crafters:'Crafters',djinns:'djinns',palms:'palms',palaces:'palaces',goods:'goods sets',items:'treasures',cities:'cities',tiles:'tiles held'};
function plParts(a,b,hideItems){return Object.keys(PL_LAB).filter(k=>!(hideItems&&k==='items')&&a&&b&&(b[k]||0)!==(a[k]||0)).map(k=>[k,(b[k]||0)-(a[k]||0)]).sort((x,y)=>Math.abs(y[1])-Math.abs(x[1]))}
function plWhy(i,d,a,b){const p=G.pl[i];const you=seatName(p)==='You';const n=Math.abs(d);
  const head=(you?(d>0?'You score ':'You lose '):(p.nm+(d>0?' scores ':' loses ')))+n+' pt'+(n===1?'':'s');
  const ps=plParts(a,b,online()&&p.i!==NET.mySeat&&!G.over);const sum=ps.reduce((t,x)=>t+x[1],0);if(!ps.length||sum!==d)return head;
  if(ps.length===1){const [k,c]=ps[0];const m=Math.abs(c);
    if(k==='coins')return head+(c<0?': spent ':': earned ')+m+' coin'+(m===1?'':'s');
    if(k==='sages'&&c<0)return head+': used Sages';
    if(k==='goods'&&c<0)return head+': goods sold';
    if(k==='advisors'&&c<0)return head+(c<=-10?': lost the Advisor lead':': fewer Advisors');
    return head+' from '+PL_LAB[k]}
  return head+': '+ps.map(([k,c])=>PL_LAB[k]+' '+(c>0?'+':'\u2212')+Math.abs(c)).join(', ')}
function plShort(t){return plName(String(t||'')).replace(/^[^\w—]+/,'').replace(/\.$/,'')}
function plAfter(){if(!G){return}
  if(PL.seed!==G.seed){PL.seed=G.seed;PL.logN=G.logN;PL.tot=null;if(!G.tut&&!G.coach&&!G.over&&!(UI.camp))plBanner('Bid for turn order',LORE.quickIntro,'')}
  else if(G.logN>PL.logN){const fresh=G.log.filter(e=>e.i>PL.logN).reverse();PL.logN=G.logN;if(!G.tut&&!G.coach&&!G.over)for(const e of fresh){
    if(e.c==='turn'){const m=/— (.+)'s turn —/.exec(e.t);const nm=m?m[1]:'';const mine=G.pl.some(p=>p.nm===nm&&p.human)&&G.pl.filter(p=>p.human).length===1;plBanner(mine?LORE.turn.you:nm+"'s turn",mine?'Tap a glowing tile to start':'Watch each step. Tap the board to speed up.',mine?'mine':'rival')}
    else if(e.c==='round'&&G.round>1)plBanner(LORE.turn.bid,'Dearer spots play earlier','')}}
  const tot=G.pl.map(p=>shownTotal(p)),parts=G.pl.map(p=>scoreOf(p));if(PL.tot&&PL.tot.length===tot.length&&PL.parts&&!G.over)tot.forEach((v,i)=>{const d=v-PL.tot[i];if(d&&G.phase!=='bid'&&!(G.log[0]&&/ bids? /.test(G.log[0].t)))plPop(i,d,plWhy(i,d,PL.parts[i],parts[i]))});PL.tot=tot;PL.parts=parts;
  PL.lastId=null}
(function(){const o=render;render=function(){o.apply(this,arguments);try{plAfter()}catch(e){console.error(e)}}})();
// the instruction line: the rival's turn is told step by step in plain words (the engine's own log line), the pick-who-stays popup says so
// the rival's caption stays one short line: no bracketed detail, 8 words at most
function plCap(t){const w=String(t).replace(/\s*\([^)]*\)/g,'').trim().split(/\s+/);return w.length>8?w.slice(0,8).join(' ').replace(/[,;:]$/,''):w.join(' ')}
(function(){const o=lineText;lineText=function(){const t=o();if(!G||G.over||online())return t;
  if(me()&&UI.chz&&G.step==='move')return 'Pick who stays on this tile';
  if(!me()&&!G.q&&!G.tut){const e=G.log[0];if(e&&e.c!=='turn'&&e.c!=='round'&&!/opens for/.test(e.t))return plCap(plShort(e.t))}
  if(!me()&&G.tut){const e=G.log[0];if(e&&e.c!=='turn'&&e.c!=='round'&&!/opens for|tutorial/.test(e.t))return plCap(plShort(e.t))}
  return t}})();
// the result speaks in the game's voice
(function(){const o=overHtml;overHtml=function(){let h=o();try{const mp=viewP();const won=mp&&G.over.win.includes(mp.i);const tops=G.pl.map(x=>shownTotal(x)),gap=mp?Math.max(...tops)-shownTotal(mp):0,rel=gap/Math.max(1,Math.max(...tops));const a=won?LORE.win:(gap<=10||rel<=0.08)?LORE.loseClose:(rel>=0.35?LORE.loseFar:LORE.lose);const t=a[Math.abs(parseInt(G.seed,10)||G.logN||0)%a.length];h=h.replace('</h2>','</h2><p class="voice">'+esc(t)+'</p>');if(mp&&G.pl.filter(x=>x.human).length===1)h=h.split(mp.nm).join('You')}catch(e){}return h}})();

// ---- W497: a visible Skip button while the computer plays (a tap on the table still works too) ----
(function(){const r=render;render=function(){r.apply(this,arguments);try{let b=document.getElementById('skipai');
  const on=!!(G&&!G.over&&!UI.modal&&G.pl.some(p=>p.human)&&sideToAct()>=0&&!P(sideToAct()).human&&!online()&&!tutHeld()&&!UI.hurry);
  if(!b&&on){b=document.createElement('button');b.id='skipai';b.type='button';b.textContent='Skip \u25B6\u25B6';b.setAttribute('aria-label','Skip the rival turn');
    b.addEventListener('click',e=>{e.stopPropagation();UI.hurry=true;b.hidden=true;if(aiTimer){clearTimeout(aiTimer);aiTimer=null;schedule()}});document.body.appendChild(b)}
  if(b){b.hidden=!on;const l=document.getElementById('line');if(on&&l){const q=l.getBoundingClientRect();if(q.height)b.style.top=Math.round(q.top+q.height/2-22)+'px'}}}catch(e){}}})();

// ---- R25: nothing under an open sheet (drawer, menu, result) keeps its glow: it could not be tapped there, so it must not look tappable ----
function plCover(){try{const cov=!!((typeof GX!=='undefined'&&GX.open)||document.querySelector('.gx-drawer.on')||(G&&UI.modal));const IN='.gx-drawer,#modal,.mbox,#chz';
  if(cov){for(const e of document.querySelectorAll('.glow'))if(!e.closest(IN)){e.classList.remove('glow');e.classList.add('litoff')}}
  else for(const e of document.querySelectorAll('.litoff')){e.classList.remove('litoff');e.classList.add('glow')}}catch(e){}}
(function(){const r=render;render=function(){r.apply(this,arguments);plCover()}})();setInterval(plCover,150);
