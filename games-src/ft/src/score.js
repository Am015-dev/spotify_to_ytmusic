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
function scBadges(hn){document.querySelectorAll('#grid .gain').forEach(x=>x.remove());document.querySelectorAll('#grid .sc-best').forEach(x=>x.classList.remove('sc-best'));
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
function scTurnEnd(){if(!G||G.over||online())return;
  if(scMine()){if(G.act){SC.pend={e:G.act.tile,c:G.act.color,n:G.act.n,s:G.move?G.move.start:SC.pend&&SC.pend.s,t:G.turn,tot:shownTotal(G.pl[0])}}else if(G.move&&(!SC.pend||SC.pend.t!==G.turn))SC.pend={s:G.move.start,t:G.turn}}
  else if(SC.pend&&SC.pend.e!=null&&G.phase==='turn'||(SC.pend&&G.over)){const d=SC.pend;SC.pend=null;const sx=SC.starts[d.s];let got=null,best=SC.bestTotal;if(sx)for(const x of sx.outs)if(x.o.e===d.e&&x.o.c===d.c&&(!got||x.total>got.total))got=x;
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
