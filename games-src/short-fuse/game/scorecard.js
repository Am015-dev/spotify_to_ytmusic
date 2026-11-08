// ===================== scorecard.js: always know where you stand, what a move does, and how it went =====================
// (1) #sc: a permanent turn tracker (job, turn, whose turn, the action / card still to play) and the score breakdown (wires cut by you vs the crew, leader starred).
// (2) #pv: ONE strip under it: the "Turn over: why" card (after every turn), else the PREVIEW of the move being built (odds, wires cut, fuse risk),
//     else the best move to make now. Tapping a crew wire or a number shows the odds on every glowing wire (best-value badge).
// (3) after each turn: one line rating the move good / okay / poor against the solver's best pick. The coached game uses the very same code.
if(UI.hints===undefined)UI.hints=lsGet('sf_hints',0)===1;
const hintsOn=()=>!!(UI.coach||UI.hints);
const SC={why:false,lastWhy:'',g:null,by:{},card:null,cardT:0,last:null,tkey:'',pvh:'',schtml:'',ratingFor:null};
function scReset(){SC.g=G;SC.skipI=0;SC.by={};SC.card=null;SC.last=null;SC.tkey='';SC.pvh='';SC.schtml=''}
const scPct=p=>Math.round(p*100)+'%';
const scName=s=>{const me=plSeat();return s===me?'You':nm(s)};
const scCut=()=>G.st.reduce((a,s)=>a+s.w.filter(x=>x.cut).length,0);
// the value of a crew wire that is already known (an info token or a visible value), else null
function scKnown(V,st,k){const S=V.stands.find(s=>s.i===st);const x=S&&S.slots[k];if(!x)return null;if(x.v!=null)return x.v;const t=x.tok&&x.tok.find(t=>t.t==='n');return t?t.v:null}
// chance (0..1) that a dual cut m succeeds, from the solver's view W of seat V.seat; null when it cannot be told
function scP(V,W,m){if(!m)return null;if(m.a==='solo')return 1;if(m.a!=='dual'||!W)return null;let miss=1;
  for(const k of m.ks){const kn=scKnown(V,m.st,k);let p;if(kn!=null)p=(kn===m.v||(m.v2!=null&&kn===m.v2))?1:0;else{const s=W.slots.find(x=>x.st===m.st&&x.k===k);if(!s)return null;p=(s.prob[VN(m.v)]||0)+(m.v2!=null?(s.prob[VN(m.v2)]||0):0)}miss*=1-Math.min(1,p)}
  return 1-miss}
function scMyVals(V){const out=[];for(const S of V.stands)if(S.mine)for(const x of S.slots)if(!x.cut&&x.v!=null&&out.indexOf(x.v)<0)out.push(x.v);return out}
function scOdds(V,W,st,k,v){const kn=scKnown(V,st,k);if(kn!=null)return kn===v?1:0;const s=W&&W.slots.find(x=>x.st===st&&x.k===k);return s?(s.prob[VN(v)]||0):null}
function scMoveText(V,m){if(!m)return '';if(m.a==='solo')return 'Solo cut the '+VN(m.v)+'s';
  if(m.a==='dual'){const ow=ownerOf(m.st);return 'Say '+VN(m.v)+' on '+(ow===V.seat?'your own':nm(ow)+"'s")+' wire'}if(m.a==='eq')return 'Use '+((EQUIP[m.id]||{}).n||'a gear card');return 'Play a card'}
function scFuseLine(){if(G.dial==null)return 'a miss costs the crew';const l=G.dial-1;return l<=0?'a miss blows the fuse!':'a miss: fuse −1 ('+l+' left)'}
// ---------- the move being built -> preview text and badges ----------
function scPreview(V){const sel=UI.sel;if(!sel||sel.mode!=='dual'||sel.tool||sel.two)return null;const W=wwk(V);if(!W)return null;
  const vals=scMyVals(V);
  if(sel.tg.length&&sel.v!=null){const t=sel.tg[0],p=scOdds(V,W,t.st,t.k,sel.v);if(p==null)return null;const ow=ownerOf(t.st);
    return {cls:p>=.6?'good':p>=.3?'mid':'bad',h:`<b>Preview</b> Say ${esc(VN(sel.v))} on ${esc(ow===V.seat?'your own':nm(ow)+"'s")} wire: <b>${scPct(p)} hit</b>: +2 wires cut; ${scFuseLine()}.`}}
  if(sel.tg.length){const t=sel.tg[0];const o=vals.map(v=>({v,p:scOdds(V,W,t.st,t.k,v)})).filter(x=>x.p!=null&&x.p>=.03).sort((a,b)=>b.p-a.p).slice(0,3);if(!o.length)return null;
    const cl=o[0].p>=.6?'good':o[0].p>=.3?'mid':'bad';
    return {cls:cl,h:o[0].p>=.9?`<b>Preview</b> Almost sure it is a <b>${esc(VN(o[0].v))}</b> (${scPct(o[0].p)}). Tap your ${esc(VN(o[0].v))}: +2 wires cut.`:`<b>Preview</b> Best guess ${o.map(x=>`<b>${esc(VN(x.v))}</b> (${scPct(x.p)})`).join(' or ')}. A hit cuts 2 wires; ${scFuseLine()}.`}}
  if(sel.v!=null)return {cls:'mid',h:`<b>Preview</b> Say ${esc(VN(sel.v))}: tap the wire you think matches. The badges show the odds.`};
  return null}
// the best target (and number) now, for the idle line and the ★ badge
function scBest(V){if(V.seat<0||!V.legal||decider()!==V.seat||G.q)return null;const W=wwk(V);if(!W||!W.suggestion||!W.suggestion.m)return null;const m=W.suggestion.m;return {m,p:scP(V,W,m),W}}
function scBadges(V){document.querySelectorAll('#tb .pvb').forEach(e=>e.remove());if(!hintsOn()||!G||(typeof GX!=='undefined'&&GX.open)||G.over||UI.brief||UI.tut||V.seat<0||decider()!==V.seat||!V.legal||G.q)return;
  const sel=UI.sel;if(sel&&(sel.mode!=='dual'||sel.tool||sel.two||sel.tg.length))return;const W=wwk(V);if(!W)return;const vals=sel&&sel.v!=null?[sel.v]:scMyVals(V);if(!vals.length)return;
  const rows=[];document.querySelectorAll('#crew .tile.glow').forEach(el=>{const st=+el.dataset.s,k=+el.dataset.k;let best=null;for(const v of vals){const p=scOdds(V,W,st,k,v);if(p!=null&&(!best||p>best.p))best={p,v}}if(best&&best.p>0)rows.push({el,p:best.p,v:best.v})});
  if(!rows.length)return;rows.sort((a,b)=>b.p-a.p);const top=rows[0].p;
  rows.forEach((r,i)=>{if(i>2||r.p<.2)return;const b=document.createElement('b');b.className='pvb'+(r.p>=top-.001&&r.p>=.3?' best':'');b.setAttribute('aria-hidden','true');b.textContent=(b.className.indexOf('best')>0?'★':'')+scPct(r.p);r.el.appendChild(b)})}
// ---------- rating: after the move, compared with the best one ----------
function scRate(seat,m,pre){if(!pre||!pre.W)return null;const V=pre.V,W=pre.W;const sug=W.suggestion&&W.suggestion.m;if(!sug)return null;
  const pb=scP(V,W,sug),pm=scP(V,W,m);let cls,why;
  const same=m.a===sug.a&&m.st===sug.st&&m.v===sug.v&&JSON.stringify(m.ks)===JSON.stringify(sug.ks);
  if(same){cls='good';why=pm!=null&&pm<1?scPct(pm)+' odds: the best pick':'the best pick'}
  else if(pm!=null&&pb!=null){const d=pb-pm;cls=d<=.07?'good':d<=.25?'okay':'poor';why=scPct(pm)+' odds'+(d>.03?', best was '+scPct(pb)+' ('+scMoveText(V,sug).toLowerCase()+')':', as good as the best')}
  else if(m.a==='eq'||m.a==='item'||m.a==='multi'){cls='okay';why='a card play; the solver preferred: '+scMoveText(V,sug).toLowerCase()}
  else return null;
  return {cls,word:({good:'Good',okay:'Okay',poor:'Poor'})[cls],why}}
function scShowCard(html,cls,ms){SC.card={h:html,cls:cls||''};clearTimeout(SC.cardT);SC.cardT=setTimeout(()=>{SC.card=null;scPaint()},Math.max(1800,ms/(UI.speed||1)));scPaint()}
(function(){const o=applyMove;applyMove=function(m,seat){if(!G||G.over||UI.tut)return o(m,seat);if(SC.g!==G)scReset();
  const c0=scCut(),d0=G.dial,turn0=G.turn;let pre=null;
  try{if(hintsOn()&&m&&(m.a==='dual'||m.a==='solo'||m.a==='eq'||m.a==='multi')&&!isClient()){const me=plSeat();let V=UI.V,W=null;
    if(seat===me&&V)W=wwk(V);else{W=whatWeKnow(seat,24);V=null;try{V=knowledge(seat)}catch(e){}}
    if(W&&(V||seat===me))pre={V:V||UI.V,W}}}catch(e){pre=null}
  const r=o(m,seat);
  try{if(r&&r.success!==false&&G&&(m.a==='dual'||m.a==='solo'||m.a==='eq'||m.a==='multi')){const dc=scCut()-c0,missed=G.dial!=null&&d0!=null&&G.dial<d0;SC.by[seat]=(SC.by[seat]||0)+dc;
      const who=scName(seat);let what;
      if(m.a==='solo')what=`cut ${dc} wire${dc===1?'':'s'} alone, no risk`;
      else if(dc>0)what=`guessed right, ${dc} wires cut`;
      else if(missed)what=`guessed wrong, fuse −${d0-G.dial}`;
      else what=m.a==='eq'?'used a gear card':'made a move';
      const rate=pre&&hintsOn()?scRate(seat,m,pre):null;
      const nextS=(()=>{try{return G.over?-1:decider()}catch(e){return -1}})();
      const nx=nextS>=0&&nextS!==seat?` Next: ${nextS===plSeat()?'you':nm(nextS)}.`:'';
      SC.last={seat,rate};SC.lastWhy=`${who.toLowerCase()==='you'?'You':who} ${what}.${nx}`;SC.why=false;
      const rh=rate?`<div class="ln"><span class="rt ${rate.cls}">${rate.word}</span> ${esc(rate.why)}.</div>`:'';
      if(hintsOn())scShowCard(`<div class="ln"><b>Turn over:</b> ${esc(who.toLowerCase()==='you'?'you':who)} ${esc(what)}.${esc(nx)}</div>${rh}`,rate?rate.cls:(dc>0?'good':missed?'poor':''),3600)}}catch(e){console.error(e)}
  return r}})();
// ---------- the panel ----------
function scEnsure(){const tb=document.getElementById('tb');if(!tb)return null;let sc=document.getElementById('sc');if(!sc){const say=document.getElementById('say');sc=document.createElement('div');sc.id='sc';sc.setAttribute('data-help','');
  const pv=document.createElement('div');pv.id='pv';pv.setAttribute('role','status');pv.setAttribute('data-help','');tb.insertBefore(sc,say);tb.insertBefore(pv,say)}return sc}
function scTrackerHTML(V){const M=MISSIONS[G.mission];const me=V.seat;const s=decider();
  if(G.phase!=='turn'){return `<div class="tr"><b>Job ${G.mission}</b><span>Setup</span><span class="who">${me>=0&&G.q&&G.q.who===me?'Your pick':'Everyone shows a wire'}</span></div>`}
  const mine=me>=0&&s===me,acted=!!(G.tfx&&G.tfx.acted);const gear=!!(V.legal&&(V.legal.eq&&V.legal.eq.length||V.legal.tools&&Object.keys(V.legal.tools).length));
  const who=G.over?'Job over':mine?'Your turn':(s>=0?nm(s)+"'s turn":'…');const col=s>=0?SEATC[posOf(s)%5]:'#fff';
  const toks=G.over?'':`<i class="tk${acted?' spent':' on'}" title="Your action: cut wires">${acted?'Action used':'1 action'}</i>`+(gear&&mine?`<i class="tk gear" title="A gear card can be played instead">or a card</i>`:'');
  return `<div class="tr"><b>Job ${G.mission}</b><span>Turn ${Math.max(1,G.turn||1)}</span><span class="who${mine?' me':''}" style="--wc:${col}">${esc(who)}</span>${toks}</div>`}
function scScoreHTML(V){const seats=G.seats.map(q=>q.i).filter(i=>hasWires(i)||SC.by[i]);if(!seats.length)return '';const me=V.seat;
  const n=seats.map(i=>({i,n:SC.by[i]||0}));const top=Math.max(...n.map(x=>x.n)),lead=n.filter(x=>x.n===top).length===1&&top>0?n.find(x=>x.n===top).i:-1;
  const crew=n.filter(x=>x.i!==me).reduce((a,x)=>a+x.n,0);const mineN=me>=0?(SC.by[me]||0):0;
  const chip=(i,label,v)=>`<i class="sch${i===lead?' lead':''}${i===me?' me':''}" style="--wc:${i>=0?SEATC[posOf(i)%5]:'#fff'}">${i===lead?'★ ':''}${esc(label)} <b>${v}</b></i>`;
  const others=n.filter(x=>x.i!==me).slice(0,4).map(x=>chip(x.i,nm(x.i).slice(0,6),x.n)).join('');
  return me>=0?`<div class="scr" aria-label="Wires cut by each player">${chip(me,'You',mineN)}${others}</div>`:`<div class="scr">${n.map(x=>chip(x.i,nm(x.i).slice(0,6),x.n)).join('')}</div>`}
function scPaint(){const sc=document.getElementById('sc'),pv=document.getElementById('pv');if(!sc||!pv||!G||!UI.V)return;const V=UI.V;
  const show=UI.started&&!UI.brief&&!UI.tut&&!G.over;sc.hidden=!show;
  if(show){const h=scTrackerHTML(V)+scScoreHTML(V);if(h!==SC.schtml){SC.schtml=h;sc.innerHTML=h}}
  let ph='',cls='';
  if(show&&SC.why){ph=`<div class="ln"><b>Why:</b> ${esc(SC.lastWhy||'No move yet.')}</div><div class="ln">A match cuts 2 wires; a miss burns the fuse. Tap here to close.</div>`;cls='card'}
  else if(show&&hintsOn()&&!document.getElementById('coach')){if(SC.card){ph=SC.card.h;cls='card '+SC.card.cls}
    else{const pr=scPreview(V);if(pr){ph=pr.h;cls='pre '+pr.cls}
      else{const b=scBest(V);if(b&&b.m&&b.p!=null&&(!UI.sel)){ph=`<b>Best now</b> ${esc(scMoveText(V,b.m))}: ${b.m.a==='solo'?'cannot miss':scPct(b.p)+' hit'}. <button type="button" class="wsd" data-wsd>What should I do?</button>`;cls='pre mid'}
      else if(!UI.sel&&V.legal&&decider()===V.seat&&!G.q){ph='<button type="button" class="wsd" data-wsd>What should I do?</button>';cls='pre mid'}}}}
  const hh=()=>(pv.hidden?0:pv.offsetHeight)+(sc.hidden?0:sc.offsetHeight);const h0=SC.h0==null?-1:SC.h0;pv.hidden=!ph;const sig=cls+'|'+ph;if(sig!==SC.pvh){SC.pvh=sig;pv.className=cls;pv.innerHTML=ph}
  const h1=hh();SC.h0=h1;if(h1!==h0&&!SC.relay){SC.relay=1;try{layoutTable()}catch(e){}SC.relay=0}}   // a strip (score or preview) took or gave back table height: size the stands again
function scEndCard(){if(!G||!G.over||UI.tut||SC.endShown===G.over)return;SC.endShown=G.over}
(function(){const o=refresh;refresh=function(){o();try{if(!G||!UI.started)return;scEnsure();if(SC.g!==G)scReset();
  // a skipped turn has no move: say why the turn is over
  const sk=G.log.find(e=>e.i>(SC.skipI||0)&&/ skips: /.test(e.t));if(sk){SC.skipI=G.logN;scShowCard(`<div class="ln"><b>Turn over:</b> ${esc(plain(sk.t))}</div>`,'',2800)}else SC.skipI=G.logN;
  scPaint();if(UI.V)scBadges(UI.V)}catch(e){console.error(e)}}})();

// ---------- modes: HINTS is the bulb in the top bar (off by default); every "why" opens on tap only ----------
(function(){const o=plBanner;plBanner=function(t,c){if(hintsOn())o(t,c)}})();
function scBulb(){const b=document.getElementById('bulbbtn');if(!b)return;b.classList.toggle('hon',!!UI.hints);b.setAttribute('aria-pressed',UI.hints?'true':'false');const t=UI.hints?'Hints are on (tap to turn off)':'Hints are off (tap to turn on)';b.title=t;b.setAttribute('aria-label',t)}
document.addEventListener('click',e=>{const w=e.target.closest&&e.target.closest('[data-wsd]');if(w){e.preventDefault();e.stopPropagation();SC.adv=true;const b=document.getElementById('bulbbtn');if(b)b.click();return}
  const bb=e.target.closest&&e.target.closest('#bulbbtn');if(bb){if(SC.adv){SC.adv=false;return}e.stopImmediatePropagation();e.preventDefault();UI.hints=!UI.hints;lsSet('sf_hints',UI.hints?1:0);SC.card=null;SC.pvh='';scBulb();try{refresh()}catch(x){}return}
  const sc=e.target.closest&&e.target.closest('#sc,#pv');if(sc&&G&&UI.started&&!UI.coach){SC.why=!SC.why;SC.pvh='';scPaint()}},true);
setTimeout(scBulb,0);setInterval(scBulb,1500);
