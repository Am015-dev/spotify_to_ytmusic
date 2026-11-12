// ===================== the readable-turn layer: banner, one-line captions, score pops, the guide's story in the tutorial, result voice =====================
// Everything here only reads the game (G, G.log) and draws small see-through-to-taps overlays (pointer-events:none, data-help so the kit ignores them).
const PL={seed:null,logN:0,tot:null,lastId:null,pops:0,banT:0,reactT:0};
const plEl=(id,cls)=>{let e=document.getElementById(id);if(!e){e=document.createElement('div');e.id=id;e.className=cls||'';e.setAttribute('data-help','');e.setAttribute('aria-hidden','true');document.body.appendChild(e)}return e};
function plName(t){if(!G)return t;const hs=G.pl.filter(x=>x.human);if(hs.length===1){const nm=hs[0].nm;t=t.split(nm+"'s").join('Your').split(nm).join('You')}
  const V={lifts:'lift',bids:'bid',ends:'end',takes:'take',keeps:'keep',claims:'claim',pitches:'pitch',buys:'buy',sells:'sell',summons:'summon',plants:'plant',raises:'raise',hires:'hire',sends:'send',uses:'use',has:'have',finds:'find',brings:'bring',wins:'win'};
  return t.replace(/\bYou (lifts|bids|ends|takes|keeps|claims|pitches|buys|sells|summons|plants|raises|hires|sends|uses|has|finds|brings|wins)\b/g,(m,v)=>'You '+V[v])}
function plBanner(title,sub,cls){return;   // Addendum 7: no toasts in Play; the coach and the tracker say it
  const b=plEl('plban','plban');b.className='plban '+(cls||'');b.innerHTML='<b>'+esc(title)+'</b>'+(sub?'<small>'+esc(sub)+'</small>':'');void b.offsetWidth;b.classList.add('on');clearTimeout(PL.banT);PL.banT=setTimeout(()=>b.classList.remove('on'),ANIM?2200:200)}
const PLQ=[];let PLQB=false;
function plPop(i,d,why){if(G&&G.coach)return;   // in Learn to play the coach explains every change, one message at a time
  PLQ.push([i,d,why]);while(PLQ.length>3)PLQ.shift();plPopNext()}
function plPopNext(){if(PLQB||!PLQ.length)return;const cb=document.getElementById('coach'),to=document.getElementById('turnover');if((cb&&cb.classList.contains('on'))||(to&&to.classList.contains('on'))||document.getElementById('summon')){setTimeout(plPopNext,700);return}if(!G||G.over){PLQ.length=0;return}const [i,d,why]=PLQ.shift();const s=typeof seatEl==='function'?seatEl(i):null;if(!s){plPopNext();return}const r=s.getBoundingClientRect();if(!r.width){plPopNext();return}
  const e=document.createElement('div');e.className='plpop '+(d>0?'up':'dn');e.setAttribute('data-help','');e.setAttribute('aria-hidden','true');
  e.innerHTML='<b>'+(d>0?'+':'\u2212')+Math.abs(d)+'</b>'+(why?'<span>'+esc(why)+'</span>':'');document.body.appendChild(e);PLQB=true;
  const w=e.offsetWidth;const tr=document.getElementById('trk');const tb=tr&&!tr.hidden?tr.getBoundingClientRect().bottom:r.bottom;const land=document.documentElement.classList.contains('land');e.style.left=(land?Math.max(6,Math.min(innerWidth-w-6,r.left)):Math.max(6,Math.min(innerWidth-w-6,r.left+r.width/2-w/2)))+'px';e.style.top=(land?Math.round(innerHeight*.58):tb+4)+'px';const ms=ANIM?4000+String(why||'').split(' ').length*100+400:100;setTimeout(()=>{e.remove();PLQB=false;plPopNext()},ms)}
function plSay(who,text){const e=plEl('plreact','plreact');e.innerHTML='<i>'+who.face+'</i><span><b>'+esc(who.name)+'</b> '+esc(text)+'</span>';void e.offsetWidth;e.classList.add('on');clearTimeout(PL.reactT);PL.reactT=setTimeout(()=>e.classList.remove('on'),ANIM?2600:200)}
function plShort(t){return plName(String(t||'')).replace(/^[^\w—]+/,'').replace(/\.$/,'')}
function plAfter(){if(!G){return}
  if(PL.seed!==G.seed){PL.seed=G.seed;PL.logN=G.logN;PL.tot=null;if(!G.tut&&!G.coach&&!G.over&&!(UI.camp))plBanner('Bid for turn order',LORE.quickIntro,'')}
  else if(G.logN>PL.logN){const fresh=G.log.filter(e=>e.i>PL.logN).reverse();PL.logN=G.logN;if(!G.tut&&!G.coach&&!G.over)for(const e of fresh){
    if(e.c==='turn'){const m=/— (.+)'s turn —/.exec(e.t);const nm=m?m[1]:'';const mine=G.pl.some(p=>p.nm===nm&&p.human)&&G.pl.filter(p=>p.human).length===1;plBanner(mine?LORE.turn.you:nm+"'s turn",mine?'Tap a glowing tile to start':'Watch each step. Tap the board to speed up.',mine?'mine':'rival')}
    else if(e.c==='round'&&G.round>1)plBanner(LORE.turn.bid,'Dearer spots play earlier','')}}
  const tot=G.pl.map(p=>shownTotal(p));if(PL.tot&&PL.tot.length===tot.length&&!G.over)tot.forEach((v,i)=>{const d=v-PL.tot[i];if(d&&G.phase!=='bid'&&!(G.log[0]&&/ bids? /.test(G.log[0].t))){const e=G.log[0];plPop(i,d,(e&&e.c!=='turn'?plShort(e.t):'')||(plName(G.pl[i].nm)+(d>0?' scores':' loses')+' points'))}});PL.tot=tot;
  if(typeof tutOn==='function'&&tutOn()){const st=GXT.state();if(st&&st.shown&&st.id!==PL.lastId){const prev=PL.lastId;PL.lastId=st.id;const L=LORE.tut[prev];if(L&&L.react){const t=typeof L.react==='function'?L.react():L.react;const who=['sages','advisors'].includes(prev)?LORE.rival:LORE.guide;plSay(prev==='tribes'||prev==='sages'||prev==='advisors'?LORE.rival:LORE.guide,t)}}}
  else PL.lastId=null}
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
// the tutorial as the prologue: the guide's and the rival's words replace the plain lessons (same ids, same targets, same waits)
function tutStory(steps){return steps.map(s=>{const L=LORE.tut[s.id];if(!L)return s;const ch=LORE.chapters[s.id];const rival=['order','sages','advisors'].includes(s.id);const who=rival?LORE.rival:LORE.guide;
  const say=()=>{const v=L.say;if(typeof v!=='function')return v;
    if(s.id==='drop'||s.id==='dropC')return v(dropsDone());
    if(s.id==='masons')return v(bluesAround(TUT_ME.t2.path[2][0]).length);
    if(s.id==='score'){const sc=G.over?G.over.scores:[];const a=sc.find(x=>x.p===0),b=sc.find(x=>x.p===1);return v(a?a.s.total:0,b?b.s.total:0)}return ''};
  return Object.assign({},s,{title:()=>ch?'Ch.'+ch.n+' '+ch.t:who.face+' '+who.name,say})})}

// ---- W497: a visible Skip button while the computer plays (a tap on the table still works too) ----
(function(){const r=render;render=function(){r.apply(this,arguments);try{let b=document.getElementById('skipai');
  const on=!!(G&&!G.over&&!UI.modal&&G.pl.some(p=>p.human)&&sideToAct()>=0&&!P(sideToAct()).human&&!online()&&!tutHeld()&&!UI.hurry);
  if(!b&&on){b=document.createElement('button');b.id='skipai';b.type='button';b.textContent='Skip \u25B6\u25B6';b.setAttribute('aria-label','Skip the rival turn');
    b.addEventListener('click',e=>{e.stopPropagation();UI.hurry=true;b.hidden=true;if(aiTimer){clearTimeout(aiTimer);aiTimer=null;schedule()}});document.body.appendChild(b)}
  if(b){b.hidden=!on;const l=document.getElementById('line');if(on&&l){const q=l.getBoundingClientRect();if(q.height)b.style.top=Math.round(q.top+q.height/2-22)+'px'}}}catch(e){}}})();
