// ===================== SEE how you score (BRIEF-PLAYABLE Addendum 5): turn tracker, move preview, gain badges, score breakdown, turn rating =====================
// Reads the game only (G, outcomes() from ai.js, validMoves via stepTargets) and draws small overlays; it never plays or changes a move.
// gain = real points a finished walk adds now (tile number, palace/palm, Sages x2, Advisors x1 +10 per rival passed, Masons' coins, goods sets). The best gain over all walks is the "greedy best".
// ---- three modes (Addendum 7): Learn to play = the coached game (bubbles); Play = clean; Hints = a top-bar toggle, off by default: previews, badges, ratings, What should I do? ----
const HINTS={on:false};try{HINTS.on=localStorage.getItem('soq_hints')==='1'}catch(e){}
function hintsOn(){return !!G&&!!(G.coach||HINTS.on)}
const SC={key:'',starts:{},bestTotal:0,bestLabel:'',pend:null,hov:null,card:null,cardT:0};
const scMine=()=>!!G&&!G.over&&G.phase==='turn'&&G.cur===0&&G.pl[0]&&G.pl[0].human;
function scParts(p,o){const t=G.board[o.e],parts=[];
  const baseM=o.e===o.s?[]:t.m;const visitsE=o.path.slice(1,-1).filter(i=>i===o.e).length;const extraC=o.n-1-baseM.filter(x=>x===o.c).length;const remain=baseM.filter(x=>x!==o.c).length+Math.max(0,visitsE-extraC);
  const claim=owner(t)==null&&remain<=0&&p.camels>0,mine=claim||owner(t)===p.i;
  if(claim&&tileWorth(t)>0)parts.push([tileWorth(t),'tile '+TILEDEF[t.k].n]);
  switch(o.c){
   case 'vizier':{parts.push([o.n*(hasDj(p,'wazira')?3:1),o.n+' Advisor'+(o.n>1?'s':'')]);for(const q of G.pl)if(q.i!==p.i&&q.vz<p.vz+o.n&&!(q.vz<p.vz))parts.push([10,'passing '+plName(q.nm)]);break}
   case 'elder':parts.push([o.n*(hasDj(p,'hikma')?4:2),o.n+' Sage'+(o.n>1?'s':'')]);break;
   case 'merchant':{const cards=G.market.slice(0,o.n);const g=goodsGain(p,cards)-cards.filter(r=>r==='fakir').length*1.2;if(g>0)parts.push([Math.round(g),'goods sets']);break}
   case 'builder':{const blues=AROUND(o.e).filter(i=>G.board[i].blue&&!G.board[i].block).length;if(o.n*blues>0)parts.push([o.n*blues,o.n+' Mason coins']);break}
   case 'assassin':parts.push([0,'Shadows strike']);break}
  if(mine&&t.k==='village')parts.push([5,'palace']);if(mine&&t.k==='oasis')parts.push([hasDj(p,'nakhla')?5:3,'palm']);
  return parts}
const scTotal=ps=>ps.reduce((a,x)=>a+x[0],0);
const scText=ps=>ps.filter(x=>x[0]>0||ps.length===1).map(x=>x[1]+' +'+x[0]).join(', ')||'no points';
function scCompute(){const p=G.pl[0];const key=G.turn+'|'+G.round;if(SC.key===key)return;SC.key=key;SC.starts={};SC.bestTotal=-1;SC.bestLabel='';
  for(const s of legalStarts()){const outs=outcomes(s,4000).map(o=>{const parts=scParts(p,o);return {o,parts,total:scTotal(parts)}});let best=outs[0];for(const x of outs)if(!best||x.total>best.total)best=x;
    SC.starts[s]={outs,best};if(best&&best.total>SC.bestTotal){SC.bestTotal=best.total;SC.bestLabel=scText(best.parts)+' ('+tileName(G.board[best.o.e])+')'}}}
const scPrefix=(x,path,nx)=>{const q=x.o.path;if(q.length<=path.length)return false;for(let i=0;i<path.length;i++)if(q[i]!==path[i])return false;return q[path.length]===nx};
function scEl(id,cls,before){let e=document.getElementById(id);if(!e){e=document.createElement('div');e.id=id;e.className=cls;e.setAttribute('data-help','');if(before)before.parentNode.insertBefore(e,before);else document.body.appendChild(e)}return e}
const SC_PH=['Bid','Move','Take','Sell'];
function scPhase(){if(G.phase==='bid')return 0;return G.step==='move'?1:(G.step==='sell'?3:2)}
function scTracker(){const ln=document.getElementById('line');if(!ln)return;const t=scEl('trk','trk',ln.nextSibling);
  if(!G||G.over||online()){t.hidden=true;return}t.hidden=false;
  const s=sideToAct();const who=s<0?'':P(s);const mine=who&&who.human&&G.pl.filter(x=>x.human).length===1;const ph=scPhase();
  const nm=mine?'Your turn':who?plName(who.nm)+"'s turn":'';
  t.innerHTML='<span class="trk-p">'+SC_PH.map((l,i)=>'<i class="'+(i===ph?'on':i<ph?'done':'')+'">'+l+'</i>').join('')+'</span><b class="trk-w '+(mine?'me':'')+'">'+esc(nm)+'</b><b class="trk-r">Round '+G.round+'</b>'}
function scPreview(){const ln=document.getElementById('line');if(!ln)return;const e=scEl('trk2','trk2',(document.getElementById('trk')||ln).nextSibling);if(!G||G.over||online()||G.coach||!G.pl[0].human){e.hidden=true;return}
  let txt='';const p=G.pl[0];
  if(scMine()&&G.step==='move'){scCompute();
    if(!G.move){if(SC.bestTotal>=0)txt='★ Best start: +'+SC.bestTotal+' ('+SC.bestLabel+')'}
    else{const k=G.move.path.length;let best=null;const tg=SC.hov!=null&&stepTargets().includes(SC.hov)?[SC.hov]:stepTargets();const sx=SC.starts[G.move.start];
      if(sx)for(const nx of tg)for(const x of sx.outs)if(scPrefix(x,G.move.path,nx)&&(!best||x.total>best.total))best=x;
      txt=best?(SC.hov!=null?'Here: ':'Best from here: ')+'+'+best.total+': '+scText(best.parts):'Keep walking. The last one must match its colour.'}}
  else if(G.phase==='bid'&&G.bidQueue[0]&&G.bidQueue[0].p===0)txt='Dearer spots play first. Each coin spent is a point lost.';
  else if(scMine()&&G.act&&(G.step==='tribe'||G.step==='tile'||G.step==='sell')){const a=G.act;txt='You took '+a.n+' '+(a.n>1?MPLUR[a.color]:MNAME[a.color])+' on '+tileName(G.board[a.tile])+'. Finish the tile action to end your turn.'}
  e.hidden=!txt;e.textContent=txt}
function scKey(){let k=document.getElementById('gainkey');const n=document.querySelectorAll('#grid .gain').length;if(!n){if(k)k.hidden=true;return}if(!k){k=document.createElement('div');k.id='gainkey';k.setAttribute('aria-hidden','true');k.setAttribute('data-help','');document.body.appendChild(k)}k.textContent='+N on a tile = points that walk can score · ★ = best';const g=document.getElementById('grid');if(g){const r=g.getBoundingClientRect();k.style.top=Math.round(r.bottom+2)+'px'}k.hidden=false}
function scBadges(hn){try{scBadgesIn(hn)}finally{scKey()}}
function scBadgesIn(hn){document.querySelectorAll('#grid .gain').forEach(x=>x.remove());document.querySelectorAll('#grid .sc-best').forEach(x=>x.classList.remove('sc-best'));
  if(!hn||!scMine()||G.step!=='move'||online())return;scCompute();const add=(i,v,star)=>{const el=tileEl(i);if(!el)return;const b=document.createElement('i');b.className='gain'+(star?' star':'');b.textContent=(star?'★':'')+'+'+v;b.setAttribute('data-help','');b.setAttribute('aria-hidden','true');el.appendChild(b)};
  if(!G.move){const top=SC.bestTotal;for(const s in SC.starts){const x=SC.starts[s].best;if(x)add(+s,x.total,x.total>=top&&top>0)}}
  else{const sx=SC.starts[G.move.start];if(!sx)return;let top=-1;const res={};for(const nx of stepTargets()){let b=null;for(const x of sx.outs)if(scPrefix(x,G.move.path,nx)&&(!b||x.total>b.total))b=x;if(b){res[nx]=b;top=Math.max(top,b.total)}}
    for(const nx in res)add(+nx,res[nx].total,res[nx].total>=top&&top>0)}}
// ---- the score breakdown in the seat chips, the leader marked ----
function scSeats(){if(!G||G.over||online()){return}const tot=G.pl.map(p=>shownTotal(p));const top=Math.max(...tot);const lead=tot.filter(v=>v===top).length===1?tot.indexOf(top):-1;
  document.querySelectorAll('#seats .sch').forEach(el=>{const i=+el.dataset.seat,p=G.pl[i];if(!p)return;const s=scoreOf(p);el.classList.toggle('lead',i===lead);
    const sn=el.querySelector('.sn');if(sn&&i===lead&&!sn.querySelector('.crown'))sn.insertAdjacentHTML('afterbegin','<i class="crown" title="Leader" aria-label="leader">👑</i>');
    if(!el.querySelector('.s4'))el.insertAdjacentHTML('beforeend','<span class="s4" title="Where the points come from">People '+(s.advisors+s.sages)+' · Goods '+s.goods+(s.djinns?' · Djinns '+s.djinns:'')+'</span>')})}
// ---- after your turn: why it ended and a one-line rating against the greedy best ----
function scCard(text,face,name,tries){const cb=document.getElementById('coach');if(((cb&&cb.classList.contains('on'))||(typeof PLQB!=='undefined'&&PLQB))&&(tries||0)<12){setTimeout(()=>scCard(text,face,name,(tries||0)+1),700);return}const e=scEl('turnover','turnover');e.innerHTML='<i>'+face+'</i><span><b>'+esc(name)+'</b>'+esc(text)+'</span><button type="button" aria-label="Got it">Got it</button>';e.querySelector('button').onclick=()=>{e.classList.remove('on');try{fit()}catch(x){}};
  const tb=document.getElementById('table');if(tb&&tb.parentNode&&e.parentNode!==tb.parentNode)tb.parentNode.insertBefore(e,tb);e.classList.add('on');try{fit()}catch(x){}clearTimeout(SC.cardT);SC.cardT=setTimeout(()=>{e.classList.remove('on');try{fit()}catch(x){}},ANIM?5000+text.split(' ').length*100:400)}
function scTurnEnd(){if(!G||G.over||online())return;if(G.tut||(typeof GD!=='undefined'&&GD.on)){SC.pend=null;return}   // the guided game scripts every move: never grade it, and never a second bubble beside the guide's
  if(scMine()){if(G.act){SC.pend={e:G.act.tile,c:G.act.color,n:G.act.n,s:G.move?G.move.start:SC.pend&&SC.pend.s,t:G.turn,tot:shownTotal(G.pl[0])}}else if(G.move&&(!SC.pend||SC.pend.t!==G.turn))SC.pend={s:G.move.start,t:G.turn}}
  else if(SC.pend&&SC.pend.e!=null&&G.phase==='turn'||(SC.pend&&G.over)){const d=SC.pend;SC.pend=null;const sx=SC.starts[d.s];let got=null,best=SC.bestTotal;if(sx)for(const x of sx.outs)if(x.o.e===d.e&&x.o.c===d.c&&(!got||x.total>got.total))got=x;
    let nOut=0;for(const k in SC.starts)nOut+=((SC.starts[k]||{}).outs||[]).length;if(nOut<=1)return;   // a forced walk (one way to go) gets no praise or blame
    const a=got?got.total:Math.max(0,shownTotal(G.pl[0])-d.tot);const bt=Math.max(best,a);const r=bt<=0||a>=bt-1||a>=bt*.85?'Good':a>=bt*.5?'Okay':'Poor';
    const why=r==='Good'?'that was the best or close to it.':'the best walk was +'+bt+' ('+SC.bestLabel+').';
    const g=LORE.guide;scCard(r+': '+d.n+' '+(d.n>1?MPLUR[d.c]:MNAME[d.c])+', +'+a+'. '+(r==='Good'?'Best or close.':'Best was +'+bt+'.'),typeof COACH!=='undefined'&&G.coach?g.face:'📋',typeof COACH!=='undefined'&&G.coach?g.name:'Your turn')}
}
(function(){const o=render;render=function(){o.apply(this,arguments);try{if(G){const hn=hintsOn();const hh=document.documentElement.classList;hh.toggle('m-play',!G.coach);hh.toggle('m-hints',hn);hh.toggle('m-bid',G.phase==='bid');scModeUI(hn);scTracker();if(hn){scTurnEnd();scPreview()}else{const t2=document.getElementById('trk2');if(t2)t2.hidden=true;SC.pend=null}scBadges(hn);scSeats();if(typeof fit==='function')fit()}else{const t=document.getElementById('trk');if(t)t.hidden=true;const t2=document.getElementById('trk2');if(t2)t2.hidden=true}}catch(e){console.error(e)}}})();
document.addEventListener('pointerover',e=>{const t=e.target.closest&&e.target.closest('#grid [data-tile]');const i=t?+t.dataset.tile:null;if(i!==SC.hov){SC.hov=i;if(G&&scMine()&&G.move)try{scPreview()}catch(x){}}});

// the Hints button in the top bar, the "What should I do?" button, the goal card, and a tap on a score chip opens the score drawer
function scModeUI(hn){const b=document.getElementById('hintsbtn');if(b){b.setAttribute('aria-pressed',String(!!HINTS.on));b.classList.toggle('on',!!HINTS.on);b.hidden=!!G.coach}
  const w=document.getElementById('whatbtn');if(w)w.hidden=!hn||G.coach||!G.pl[0].human||online()||G.over}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#hintsbtn');if(b){HINTS.on=!HINTS.on;try{localStorage.setItem('soq_hints',HINTS.on?'1':'0')}catch(x){}if(!HINTS.on){try{GXH.hide()}catch(x){}}render();return}
  const c=e.target.closest&&e.target.closest('#seats .sch');if(c&&!c.classList.contains('glow')&&G&&!G.over&&!UI.modal){try{GX.show('plrd');renderPopups()}catch(x){}}});
(function(){const o=beginGame;beginGame=function(){const r=o.apply(this,arguments);try{if(G&&!G.coach&&!G.tut&&!UI.camp&&!online()&&!G.over){UI.modal='goal';render()}}catch(e){console.error(e)}return r}})();

// a short vibrate tick when a piece is picked up or dropped (phones that support it)
(function(){const o=go;go=function(m){try{if(navigator.vibrate&&m&&(m.act==='step'||m.act==='start'||m.act==='tile'))navigator.vibrate(12)}catch(e){}return o.apply(this,arguments)}})();
// only walks worth taking glow at the start of a turn (at least about half the best walk's points); the others stay tappable but quiet
(function(){const oc=computePick;computePick=function(){oc.apply(this,arguments);try{
  if(!G||G.over||G.tut||online()||(typeof gdStep==='function'&&gdStep())||G.phase!=='turn'||G.step!=='move'||G.move||G.q||UI.pendDj||UI.pendItem||!scMine()||UI.pick.length<4)return;
  scCompute();const top=SC.bestTotal;if(!(top>0))return;const keep=UI.pick.filter(i=>{const x=SC.starts[i];return x&&x.best&&x.best.total>=Math.max(3,top*.45)});if(keep.length)UI.pick=keep}catch(e){}}})();
// R20: once a group is lifted, only drops that still lead to a good ending glow (at least 70% of the best ending still open from here)
function scWalkOuts(){if(!G||!G.move||SC.key!==G.turn+'|'+G.round)return null;const sx=SC.starts[G.move.start];if(!sx)return null;const path=G.move.path;
  const ok=sx.outs.filter(x=>{const q=x.o.path;if(q.length<=path.length)return false;for(let i=0;i<path.length;i++)if(q[i]!==path[i])return false;return true});
  if(!ok.length)return null;let top=-1e9;for(const x of ok)top=Math.max(top,x.total);return ok.filter(x=>x.total>=top-1||x.total>=top*.7)}
(function(){const oc=computePick;computePick=function(){oc.apply(this,arguments);try{
  if(!G||G.over||G.tut||online()||(typeof gdStep==='function'&&gdStep())||G.phase!=='turn'||G.step!=='move'||G.q||UI.pendDj||UI.pendItem||!scMine())return;
  if(!G.move){scCompute();return}
  const good=scWalkOuts();if(!good)return;const n=G.move.path.length;const keep=UI.pick.filter(t=>good.some(x=>x.o.path[n]===t));if(keep.length)UI.pick=keep}catch(e){}}})();
// which colour to drop on a step: keep the ending colour for the last drop, so the planned ending still works
function scStepBest(ms){const good=scWalkOuts();if(!good||!G.move)return -1;const n=G.move.path.length;const hand=G.move.hand;
  let best=null;for(const x of good)if(x.o.path[n]===ms[0].tile&&(!best||x.total>best.total))best=x;if(!best)return -1;const c=best.o.c;
  const left=hand.length;if(left===1)return ms.findIndex(m=>m.c===c);
  const nc=hand.filter(h=>h===c).length;let j=ms.findIndex(m=>m.c!==c);if(j<0||(nc<1))j=ms.findIndex(m=>m.c===c&&nc>1);return j}
// R38 row 6: the glow IS the hint. A newcomer who taps only what glows should win about half of the games on defaults.
// Bid: only the suggested spot glows (the others stay tappable). Start: the suggested start plus the 2 best other starts glow.
// Walk: on the suggested start the glow follows the suggested route (the planner's, not the points-now greedy one).
function scGlowHint(){if(!G||G.over||G.tut||G.coach||online()||(typeof gdStep==='function'&&gdStep())||G.q||UI.pendDj||UI.pendItem||typeof hlpAdvice!=='function')return;const hp=me();if(!hp||G.pl.filter(x=>x.human).length!==1)return;
  if(G.phase==='bid'){if(!UI.pickSpot.length)return;const m=hlpAdvice();if(m&&m.act==='bid'&&UI.pickSpot.includes(m.spot))UI.pickSpot=[m.spot];return}
  if(G.phase!=='turn'||G.step!=='move'||G.cur!==hp.i)return;
  if(!G.move){const m=hlpAdvice();scCompute();const rk=Object.keys(SC.starts).map(Number).filter(s=>UI.pick.includes(s)&&SC.starts[s].best).sort((a,b)=>SC.starts[b].best.total-SC.starts[a].best.total);
    const keep=[];if(m&&m.act==='start'&&UI.pick.includes(m.tile))keep.push(m.tile);for(const s of rk){if(keep.length>=3)break;if(!keep.includes(s))keep.push(s)}if(keep.length)UI.pick=keep;return}
  const pl=typeof HPL!=='undefined'?HPL.plan:null;if(!pl||pl.seed!==G.seed||pl.turn!==G.turn)return;const path=G.move.path,q=pl.o.path;if(q.length<=path.length||!path.every((x,i)=>x===q[i]))return;
  const nx=q[path.length];if(UI.pick.includes(nx)||validMoves(hp.i).some(m=>m.act==='step'&&m.tile===nx))UI.pick=[nx]}
(function(){const oc=computePick;computePick=function(){oc.apply(this,arguments);try{scGlowHint()}catch(e){}}})();
// on a step with several colours the chooser lists the planned colour first, so the first glowing chip is the planned one
// R38 row 5: on the steps where the market cannot be touched (Earn, Shadows, selling) a phone hides it, so the tiles keep >= 44 px
(function(){const o=renderMarket;renderMarket=function(){o.apply(this,arguments);try{const hp=me(),a=G&&G.act;
  const off=!!(G&&!G.over&&hp&&G.phase==='turn'&&G.cur===hp.i&&!G.q&&(G.step==='sell'||(G.step==='tribe'&&a&&(a.color==='builder'||a.color==='assassin'))));
  document.documentElement.classList.toggle('mk-off',off)}catch(e){}}})();
// R38 row 5: after the move the djinn row stays only while a djinn can be taken, and the market only while goods can be taken (or are being collected)
(function(){const o=renderMarket;renderMarket=function(){o.apply(this,arguments);try{const hp=me(),R=document.documentElement;const after=!!(G&&!G.over&&hp&&G.phase==='turn'&&G.cur===hp.i&&!G.q&&G.step!=='move');
  R.classList.toggle('dj-off',after&&!UI.pickDj.length);R.classList.toggle('mr-off',after&&!UI.pickMk.length&&!(G.step==='tribe'&&G.act&&G.act.color==='merchant'))}catch(e){}}})();
// R38 (375x553): a short phone hides the market while bidding, and the djinn row while djinn powers fill the button row
(function(){const o=renderMarket;renderMarket=function(){o.apply(this,arguments);try{const hp=me(),R=document.documentElement;
  R.classList.toggle('bid-mk',!!(G&&!G.over&&G.phase==='bid'));
  const pw=!!(G&&!G.over&&hp&&G.phase==='turn'&&!G.q&&!UI.pickDj.length&&validMoves(hp.i).some(m=>m.act==='djinn'||m.act==='item'));R.classList.toggle('pw-on',pw)}catch(e){}}})();
