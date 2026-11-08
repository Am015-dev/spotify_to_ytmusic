// ===================== SEE how you score (BRIEF-PLAYABLE Addendum 5): turn tracker, move preview, gain badges, score breakdown, turn rating =====================
// Reads the game only (G, outcomes() from ai.js, validMoves via stepTargets) and draws small overlays; it never plays or changes a move.
// gain = real points a finished walk adds now (tile number, palace/palm, Sages x2, Advisors x1 +10 per rival passed, Masons' coins, goods sets). The best gain over all walks is the "greedy best".
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
function scPreview(){const ln=document.getElementById('line');if(!ln)return;const e=scEl('trk2','trk2',(document.getElementById('trk')||ln).nextSibling);if(!G||G.over||online()||!G.pl[0].human){e.hidden=true;return}
  let txt='';const p=G.pl[0];
  if(scMine()&&G.step==='move'){scCompute();
    if(!G.move){if(SC.bestTotal>=0)txt='★ Best start: up to +'+SC.bestTotal+': '+SC.bestLabel}
    else{const k=G.move.path.length;let best=null;const tg=SC.hov!=null&&stepTargets().includes(SC.hov)?[SC.hov]:stepTargets();const sx=SC.starts[G.move.start];
      if(sx)for(const nx of tg)for(const x of sx.outs)if(scPrefix(x,G.move.path,nx)&&(!best||x.total>best.total))best=x;
      txt=best?(SC.hov!=null?'Here: ':'Best from here: ')+'+'+best.total+': '+scText(best.parts):'Keep walking: the last person must land on its own colour'}}
  else if(G.phase==='bid'&&G.bidQueue[0]&&G.bidQueue[0].p===0)txt='Dearer spots play first. Each coin spent is a point lost.';
  else if(scMine()&&G.act&&(G.step==='tribe'||G.step==='tile'||G.step==='sell')){const a=G.act;txt='You took '+a.n+' '+(a.n>1?MPLUR[a.color]:MNAME[a.color])+' on '+tileName(G.board[a.tile])+'. Finish the tile action, then your turn ends.'}
  e.hidden=!txt;e.textContent=txt}
function scBadges(){document.querySelectorAll('#grid .gain').forEach(x=>x.remove());document.querySelectorAll('#grid .sc-best').forEach(x=>x.classList.remove('sc-best'));
  if(!scMine()||G.step!=='move'||online())return;scCompute();const add=(i,v,star)=>{const el=tileEl(i);if(!el)return;const b=document.createElement('i');b.className='gain'+(star?' star':'');b.textContent=(star?'★':'')+'+'+v;b.setAttribute('data-help','');b.setAttribute('aria-hidden','true');el.appendChild(b)};
  if(!G.move){const top=SC.bestTotal;for(const s in SC.starts){const x=SC.starts[s].best;if(x)add(+s,x.total,x.total>=top&&top>0)}}
  else{const sx=SC.starts[G.move.start];if(!sx)return;let top=-1;const res={};for(const nx of stepTargets()){let b=null;for(const x of sx.outs)if(scPrefix(x,G.move.path,nx)&&(!b||x.total>b.total))b=x;if(b){res[nx]=b;top=Math.max(top,b.total)}}
    for(const nx in res)add(+nx,res[nx].total,res[nx].total>=top&&top>0)}}
// ---- the score breakdown in the seat chips, the leader marked ----
function scSeats(){if(!G||G.over||online()){return}const tot=G.pl.map(p=>shownTotal(p));const top=Math.max(...tot);const lead=tot.filter(v=>v===top).length===1?tot.indexOf(top):-1;
  document.querySelectorAll('#seats .sch').forEach(el=>{const i=+el.dataset.seat,p=G.pl[i];if(!p)return;const s=scoreOf(p);el.classList.toggle('lead',i===lead);
    const sn=el.querySelector('.sn');if(sn&&i===lead&&!sn.querySelector('.crown'))sn.insertAdjacentHTML('afterbegin','<i class="crown" title="Leader" aria-label="leader">👑</i>');
    if(!el.querySelector('.s4'))el.insertAdjacentHTML('beforeend','<span class="s4" title="Where the points come from">🪙'+s.coins+' 🏜'+(s.tiles+s.palms+s.palaces)+' 👥'+(s.advisors+s.sages)+' 🧺'+s.goods+(s.djinns?' 🧞'+s.djinns:'')+'</span>')})}
// ---- after your turn: why it ended and a one-line rating against the greedy best ----
function scCard(text,face,name){const e=scEl('turnover','turnover');e.innerHTML='<i>'+face+'</i><span><b>'+esc(name)+'</b> '+esc(text)+'</span><button type="button" aria-label="Dismiss">✕</button>';e.querySelector('button').onclick=()=>e.classList.remove('on');
  let bot=0;for(const id of ['line','trk','trk2']){const x=document.getElementById(id);if(x&&!x.hidden){const r=x.getBoundingClientRect();if(r.bottom>bot)bot=r.bottom}}e.style.top=(bot?bot+4:110)+'px';void e.offsetWidth;e.classList.add('on');clearTimeout(SC.cardT);SC.cardT=setTimeout(()=>e.classList.remove('on'),ANIM?9000:400)}
function scTurnEnd(){if(!G||G.over||online())return;
  if(scMine()){if(G.act){SC.pend={e:G.act.tile,c:G.act.color,n:G.act.n,s:G.move?G.move.start:SC.pend&&SC.pend.s,t:G.turn,tot:shownTotal(G.pl[0])}}else if(G.move&&(!SC.pend||SC.pend.t!==G.turn))SC.pend={s:G.move.start,t:G.turn}}
  else if(SC.pend&&SC.pend.e!=null&&G.phase==='turn'||(SC.pend&&G.over)){const d=SC.pend;SC.pend=null;const sx=SC.starts[d.s];let got=null,best=SC.bestTotal;if(sx)for(const x of sx.outs)if(x.o.e===d.e&&x.o.c===d.c&&(!got||x.total>got.total))got=x;
    const a=got?got.total:Math.max(0,shownTotal(G.pl[0])-d.tot);const bt=Math.max(best,a);const r=bt<=0||a>=bt-1||a>=bt*.85?'Good':a>=bt*.5?'Okay':'Poor';
    const why=r==='Good'?'that was the best or close to it.':'the best walk was +'+bt+' ('+SC.bestLabel+').';
    const g=LORE.guide;scCard('Turn over: you took '+d.n+' '+(d.n>1?MPLUR[d.c]:MNAME[d.c])+' (+'+a+'). '+r+': '+why,typeof COACH!=='undefined'&&G.coach?g.face:'📋',typeof COACH!=='undefined'&&G.coach?g.name:'Your turn')}
}
(function(){const o=render;render=function(){o.apply(this,arguments);try{if(G){scTurnEnd();scTracker();scPreview();scBadges();scSeats();if(typeof fit==='function')fit()}else{const t=document.getElementById('trk');if(t)t.hidden=true;const t2=document.getElementById('trk2');if(t2)t2.hidden=true}}catch(e){console.error(e)}}})();
document.addEventListener('pointerover',e=>{const t=e.target.closest&&e.target.closest('#grid [data-tile]');const i=t?+t.dataset.tile:null;if(i!==SC.hov){SC.hov=i;if(G&&scMine()&&G.move)try{scPreview()}catch(x){}}});
