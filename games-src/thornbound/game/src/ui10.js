// ===================== part 10: board-first play =====================
// The map is the screen. Pieces sit on it, legal spots glow, you tap or drag the piece itself, and the computer's moves play out on the board.
// Text: one status line (8 words or fewer) in the top bar. Everything else is shown, not written.
// ---------------------------------------------------------------- the decision, as the board sees it
function bfModel(s,mv,rm){const q=G.q,k=q.kind;const M={s,q,mv,rec:rm,kind:'other',use:new Set(),locs:[],regs:[],powers:[]};
  for(const m of mv){if(m.id!=null&&m.id>=0)M.use.add(m.id);if(typeof m.v==='number'&&m.v>=0&&m.v<10000)M.use.add(m.v)}
  if(q.t==='menu'){M.kind='menu';M.use=new Set();M.regs=[...new Set(mv.filter(m=>m.t==='act'&&m.a==='supp'&&m.p&&m.p.n===1).map(m=>m.p.r))];M.powers=visibleActs(mv).filter(m=>m.t==='act'&&m.a!=='supp')}
  else if(k==='bid'||k==='bidRes'||k==='place'||k==='tie'||k==='clashOrder')M.kind=k;
  else if(k==='herald'||k==='location'){M.kind=k;M.locs=mv.filter(m=>m.loc!=null).map(m=>m.loc)}
  if(M.kind!=='bid'&&M.kind!=='place'&&M.kind!=='tie'&&M.kind!=='other')M.use=new Set();
  // Autumn on the table: the hand cards that can Govern or Journey glow; tap one for its choices (UI.cfg.oldAutumn = the Powers list only)
  if(autOn()&&M.kind==='menu'&&menuPhase(q)==='Autumn'){M.aut=true;for(const m of mv)if(m.t==='act'&&(m.a==='govern'||m.a==='journey')&&m.p&&m.p.id!=null)M.use.add(m.p.id);M.powers=M.powers.filter(m=>m.a!=='govern'&&m.a!=='journey')}
  M.regsFor=id=>{const o=[];for(const m of mv){if(m.id!==id)continue;if(k==='place'&&m.r!=null)o.push(m.r);else if(k==='tie'&&G.clash)o.push(G.clash.r)}return [...new Set(o)]};
  M.nextRegs=()=>{const o=UI.ord||[];const set=new Set();for(const m of mv)if(m.order&&o.every((r,i)=>m.order[i]===r)&&m.order.length>o.length)set.add(m.order[o.length]);return [...set]};
  return M}
const autOn=()=>!(UI.cfg&&UI.cfg.oldAutumn);
function autMoves(id){const M=UI.bf;if(!M||!M.aut)return [];return M.mv.filter(m=>m.t==='act'&&(m.a==='govern'||m.a==='journey')&&m.p&&m.p.id===id)}
function autLabel(m){if(m.a==='journey')return 'Journey: +'+cinfo(m.p.id).lore+' Lore';return 'Govern: '+({relics:'Council of Coin',secrets:'Council of Whispers',oaths:'Council of Pledges'}[m.p.c]||m.p.c)}
function cardMoves(id){const M=UI.bf;if(!M||!M.mv)return [];const out=[];
  for(const m of M.mv){if(m.id!==id&&!(typeof m.v==='number'&&m.v===id))continue;
    if(M.kind==='bid')out.push({type:'spot',k:m.k});
    else if(M.kind==='place')out.push({type:'region',r:m.r,k:m.k});
    else if(M.kind==='tie')out.push({type:'region',r:G.clash?G.clash.r:null,k:m.k});
    else if(M.kind==='other')out.push({type:'direct',k:m.k})}
  return out}
const cardDriven=M=>!!M&&(M.kind==='bid'||M.kind==='place'||M.kind==='tie');
// tap a card: it lifts and its targets glow; tap it again (or the glowing spot) to play it
function handTap(id){const M=UI.bf;
  if(M&&M.aut&&autMoves(id).length){if(UI.autCard===id&&Date.now()-(UI._autT||0)<500)return;UI._autT=Date.now();UI.autCard=UI.autCard===id?null:id;if(typeof sfx==='function')sfx('tap');renderAll();return}
  const cm=M&&M.kind?cardMoves(id):[];
  // a card you can't use for the current decision never opens a sheet over the prompt: a short note instead (long-press still reads the card)
  if(!cm.length&&M&&M.kind){UI.hand=null;if(typeof sfx==='function')sfx('tap');const ln=(($('#tbturn .tbt-line')||{}).textContent||'').trim();if(typeof bfMsg==='function')bfMsg('You can\u2019t play this card now.'+(ln?' '+ln:''));return}
  if(!cm.length){UI.hand=null;openPop('card',{id});return}
  if(cardDriven(M)){
    if(UI.hand===id){if(cm.length===1){commitCard(id,cm[0]);return}UI.hand=null;renderAll();return}
    UI.hand=id;if(typeof sfx==='function')sfx('tap');renderAll();return}
  if(cm.length===1){humanMove(cm[0].k);return}
  openPop('card',{id})}
function commitCard(id,c){UI.hand=null;
  try{const el=$('#handw .hc[data-id="'+id+'"]');let dest=null;if(c.type==='spot'){const sp=$('#spots .bspot');dest=sp&&sp.getBoundingClientRect()}else if(c.type==='region'&&c.r!=null&&MAP.m){const R=regionRect(c.r);dest={left:R.left+R.width/2-14,top:R.top+R.height/2-20,width:28,height:40}}
    if(el&&dest){if(c.type==='spot'){UI._bidFly=Date.now();fxFly(el.innerHTML,el.getBoundingClientRect(),dest,{ms:420,lift:30,land:$('#spots .bspot')})}else flyEl(el.innerHTML,el.getBoundingClientRect(),dest,{ms:380})}}catch(e){}
  const ok=humanMove(c.k);
  // not taken (the tutorial asked for something else, or the step is still appearing): the card stays lifted in your hand, never lost
  if(ok===false){try{const s=viewSeatForQ();if(s!=null&&legal(s).some(m=>m.k===c.k)&&G.pl[s].hand.includes(id)){UI.hand=id;renderAll()}}catch(e){}}
  return ok}
// ---------------------------------------------------------------- taps on the map
function regionTap(r){const M=UI.bf;if(!M||!M.kind||(UI.card&&UI.card.kind!=='tip'))return false;
  if(M.kind==='place'||M.kind==='tie'){if(UI.hand!=null){const c=cardMoves(UI.hand).find(x=>x.type==='region'&&x.r===r);if(c){commitCard(UI.hand,c);return true}}return false}
  if(M.kind==='menu'){const m=M.mv.find(x=>x.t==='act'&&x.a==='supp'&&x.p&&x.p.r===r&&x.p.n===1);if(m){bfPopAt(regionRect(r),'+1',fcol(M.s));humanMove(m.k);return true}return false}
  if(M.kind==='clashOrder'){orderTap(r);return true}
  return false}
function locTap(l){const M=UI.bf;if(!M||!M.kind||(UI.card&&UI.card.kind!=='tip'))return false;
  if(M.kind==='herald'||M.kind==='location'){const m=M.mv.find(x=>x.loc===l);if(m){humanMove(m.k);return true}return false}
  return regionTap(l>>1)}
function orderTap(r){const M=UI.bf;if(!M||M.kind!=='clashOrder'||!M.nextRegs().includes(r))return;UI.ord=(UI.ord||[]).concat(r);
  const o=UI.ord;const cand=M.mv.filter(m=>m.order&&o.every((x,i)=>m.order[i]===x));
  if(cand.length===1){humanMove(cand[0].k);return}
  renderAll()}
// ---------------------------------------------------------------- the bid spot (on the table, bottom of the map)
function renderSpots(){const el=$('#spots');if(!el)return;if(!G||!UI.V){el.innerHTML='';return}
  const me=vs(),M=UI.bf,P=me>=0?UI.V.pl[me]:null;const has=P&&P.bid!=null&&P.bid>=0;const asking=!!M&&M.kind==='bid';
  const showBack=has&&!G.bidRev;
  if(!P||isPassing()||(!has&&!asking)){if(el._h!==''){el._h='';el.innerHTML=''}return}
  const S=UI.bs||360;const w=Math.round(Math.max(44,Math.min(60,S*.13))),h=Math.round(w*1.4308);
  const glow=asking&&UI.hand!=null,rec=asking&&M.rec&&M.rec.id!=null;const retk=M&&M.kind==='bidRes'&&M.mv.some(m=>m.t==='return')&&!(UI._recShown&&M.sug&&M.sug.t!=='return');   // hints on: the spot glows only when taking your card back IS the suggestion
  const h2='<button class="bspot'+(glow?' glow hot':'')+(glow&&rec?' rec':'')+(has?' full':'')+(retk?' glow':'')+'" id="bidspot" data-a="spot" style="width:'+w+'px;height:'+h+'px" aria-label="'+(has?'Your bid':'Bid spot')+'">'+(has?'<span class="bs-c" data-owner="'+me+'" data-up="1">'+cardEl(P.bid,w).outerHTML+'</span>':'<span class="bs-l">'+ico('crown')+'</span>')+'</button>';
  if(el._h!==h2){el._h=h2;el.innerHTML=h2}}
function spotTap(){const M=UI.bf;if(!M)return;
  if(M.kind==='bid'&&UI.hand!=null){const c=cardMoves(UI.hand).find(x=>x.type==='spot');if(c){commitCard(UI.hand,c)}return}
  if(M.kind==='bidRes'){const m=M.mv.find(x=>x.t==='return');if(m)humanMove(m.k)}}
// ---------------------------------------------------------------- effects: flights, score pops
function flyEl(html,from,to,o){o=o||{};const fx=$('#fx');if(!fx||!ANIM||!from||!to||UI.reduce)return;const ms=(o.ms||420)/Math.max(1,Math.min(UI.speed||1,4));
  const e=document.createElement('div');e.className='fly '+(o.cls||'');e.innerHTML=html||'';fx.appendChild(e);
  const w=from.width||40,h=from.height||56;e.style.cssText='left:'+from.left+'px;top:'+from.top+'px;width:'+w+'px;height:'+h+'px';
  const dx=to.left+(to.width||0)/2-(from.left+w/2),dy=to.top+(to.height||0)/2-(from.top+h/2),sc=Math.max(.3,(to.width||w)/w);
  const done=()=>{if(e.parentNode)e.remove()};
  try{const a=e.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:'translate('+dx+'px,'+dy+'px) scale('+sc+')',opacity:o.fade?0.2:1}],{duration:ms,easing:'cubic-bezier(.2,.7,.2,1)'});a.onfinish=done}catch(x){}
  setTimeout(done,ms+250)}
const BACK_HTML='<span class="bidc back big"></span>';
function seatEl(s){return document.querySelector('#rivals .rv[data-s="'+s+'"]')}
// a score pop: appears where it was earned, then flies to the seat's score chip
function bfPopAt(rect,txt,col,seat,cb){const fx=$('#fx');if(!fx||!ANIM||!rect)return;
  const e=document.createElement('div');e.className='pop';e.textContent=txt;e.style.cssText='left:'+(rect.left+rect.width/2)+'px;top:'+(rect.top+rect.height/2)+'px;--fc:'+(col||'#e8c867');fx.appendChild(e);
  const sp=Math.max(1,Math.min(UI.speed||1,4));const done=()=>{if(e.parentNode)e.remove()};
  const chip=seat!=null?document.querySelector('#rivals .rv[data-s="'+seat+'"] .rv-n'):null;
  try{const a=e.animate([{transform:'translate(-50%,-50%) scale(.4)',opacity:0},{transform:'translate(-50%,-90%) scale(1.25)',opacity:1,offset:.35},{transform:'translate(-50%,-90%) scale(1.15)',opacity:1,offset:.6},
      chip?{transform:'translate('+(chip.getBoundingClientRect().left+chip.getBoundingClientRect().width/2-(rect.left+rect.width/2)-chip.getBoundingClientRect().width-18)+'px,'+(chip.getBoundingClientRect().top+8-(rect.top+rect.height/2))+'px) scale(.45)',opacity:0}:{transform:'translate(-50%,-150%) scale(.8)',opacity:0}],{duration:600/sp,easing:'ease-in-out'});
    a.onfinish=()=>{done();if(chip){chip.classList.remove('bump');void chip.offsetWidth;chip.classList.add('bump')}}}catch(x){}
  setTimeout(done,700/sp)}
function locRect(l){try{const p=MAP.m.locPos(LOCID[l]);const c=mapToClient(p.x,p.y);return {left:c.x-10,top:c.y-10,width:20,height:20}}catch(e){return null}}
function regionRect(r){const b=REGBOX[r];const a=mapToClient(b.x,b.y),c=mapToClient(b.x+b.w,b.y+b.h);return {left:a.x,top:a.y,width:c.x-a.x,height:c.y-a.y}}
function mapToClient(x,y){const el=MAP.m.el,M=el.getScreenCTM&&el.getScreenCTM();if(!M)return {x:0,y:0};return {x:M.a*x+M.e,y:M.d*y+M.f}}
function mapPt(cx,cy){try{const M=MAP.m.el.getScreenCTM();return M?{x:(cx-M.e)/M.a,y:(cy-M.f)/M.d}:null}catch(e){return null}}
function locFromText(t){for(let l=0;l<6;l++)if(t.indexOf(LOCN[l])>=0)return l;return -1}
function bfNews(c){if(!ANIM)return;
  for(const it of c.items){const m=it.m;if(!m||(m.k!=='inf'&&m.k!=='steal'))continue;
    const doPop=(seat,n)=>{if(!n)return;let rect=null;const l=locFromText(it.text||'');if(l>=0)rect=locRect(l);else if(G.clash&&G.clash.r!=null)try{const R=regionRect(G.clash.r);rect={left:R.left+R.width/2,top:R.top+R.height/2,width:0,height:0}}catch(e){}
      if(!rect){const ch=seatEl(seat);if(ch)rect=ch.getBoundingClientRect()}
      bfPopAt(rect,(n>0?'+':'−')+Math.abs(n),fcol(seat),seat)};
    if(m.k==='inf')doPop(m.s,m.n);else{doPop(m.s,m.n);doPop(m.v,-m.n)}}
  if(typeof sfx==='function'&&c.items.some(infK))sfx('inf')}
// a computer's card lands on the map: it flies there from its seat
function bfSlot(r,s,old,nw){if(!ANIM||UI.noAnim||!nw||!nw.faceDown||(old&&old.count>=nw.count)||s===vs())return;
  const from=seatEl(s),slot=MAP.m.slotEl(LOCID[2*r],s);if(!from||!slot)return;const f=from.getBoundingClientRect(),t=slot.getBoundingClientRect();
  flyEl(BACK_HTML,{left:f.left+f.width/2-14,top:f.top+f.height/2-20,width:28,height:40},t,{ms:520})}
// ---------------------------------------------------------------- events played on the board (bids, clashes, round end): no panels, a tap skips
function evDone(){const c=UI.card;if(!c||c.kind!=='event')return;clearTimeout(UI._evT);UI.card=null;UI._cardKey=null;UI.noAnim=false;UI._cp=null;UI._clashLine='';UI.mapReset=false;MAP.slotDirty=true;pump()}
function bfSkip(){const c=UI.card;if(!c)return false;if(typeof tutHold==='function'&&tutHold(c))return false;if(c.kind==='event'){evDone();return true}if(c.kind==='news'){newsOk();return true}return false}
const spd=()=>Math.max(1,Math.min(UI.speed||1,4))*(UI.cfg&&UI.cfg.tutorial?3:1);   // Learn to play runs the rival's turns 3x faster: no silent wait over ~3 s
function bfAuto(c,ms){clearTimeout(UI._evT);UI._evT=setTimeout(()=>{if(UI.card===c&&!(typeof tutHold==='function'&&tutHold(c)))evDone()},ANIM?ms/spd():0)}
function bfEvent(c){const ev=c.ev;if(ev.t==='bids')bfBids(c);else if(ev.t==='clash')bfClash(c);else if(ev.t==='summary')bfSummary(c);else bfAuto(c,300)}
function bfBids(c){const ev=c.ev;c.rank=ev.bids.slice().sort((a,b)=>a.str-b.str||ev.order.indexOf(b.seat)-ev.order.indexOf(a.seat)).map(b=>b.seat);c.revN=0;
  const step=()=>{if(UI.card!==c)return;if(c.revN<c.rank.length){c.revN++;if(typeof sfx==='function')sfx('flip');renderRivals();setTimeout(step,ANIM?420/spd():0)}else bfAuto(c,1100)};
  renderBar();renderRivals();setTimeout(step,ANIM?350/spd():0)}
function clashLine(ev){const me=vs(),w=ev.winner,reg=REG[ev.r];if(w<0)return 'Tie in '+reg;
  const best=Math.max(0,...ev.parts.filter(x=>x!==w).map(x=>ev.tot[x]));return (w===me?'You win ':sideName(w)+' wins ')+reg+', '+ev.tot[w]+' to '+best}
function elimLine(ev){const d=ev.dead||{};const me=vs();const o=Object.keys(d).map(Number).filter(s=>d[s]&&d[s].length);if(!o.length)return '';const s=o.sort((a,b)=>(b===me)-(a===me))[0];const n=d[s].length;
  return (s===me?'You lose ':sideName(s)+' loses ')+n+' card'+(n>1?'s':'')}
function bfClash(c){const ev=c.ev;UI.noAnim=true;UI.clashBrk=UI.clashBrk||{};UI.clashBrk[ev.r]={tot:ev.tot,brk:ev.brk,parts:ev.parts};
  const fin=()=>{if(UI.card!==c)return;UI.clashRes[ev.r]={winner:ev.winner,tot:ev.tot};try{drawOverlay()}catch(e){}UI._clashLine=clashLine(ev);renderBar();if(typeof sfx==='function')sfx(ev.winner<0?'tie':'win');try{const me=vs();bfBanner(ev.winner<0?'Tie':ev.winner===me?'You win!':sideName(ev.winner)+' win',REG[ev.r]+' \u00b7 '+ev.parts.map(x=>ev.tot[x]).sort((a,b)=>b-a).join(' to '),ev.winner<0?'#c8c0d8':fcol(ev.winner))}catch(x){}
    try{bfClashHit(ev.r,ev.winner<0?'#c8c0d8':fcol(ev.winner),ev.winner<0)}catch(x){}
    const el=elimLine(ev);const hold=el?1500:1100;
    if(el)setTimeout(()=>{if(UI.card===c){UI._clashLine=el;renderBar()}},900/spd());
    bfAuto(c,hold+300)};
  UI._clashLine='The Clash in '+REG[ev.r];renderBar();
  if(!ANIM){fin();return}
  const p=mapReveal(ev);Promise.resolve(p).then(()=>{if(UI.card===c)setTimeout(fin,150/spd())})}
// the Clash lands: a shock ring and sparks burst from the region in the winner's colour, and the board jolts (a tie: a softer grey ring, no jolt)
function bfClashHit(r,col,tie){if(!ANIM||UI.reduce)return;const fx=$('#fx');if(!fx)return;let R;try{R=regionRect(r)}catch(e){return}const cx=R.left+R.width/2,cy=R.top+R.height/2,sp=spd();
  const ring=document.createElement('div');ring.className='tbhit';ring.style.cssText='left:'+cx+'px;top:'+cy+'px;--hc:'+col;fx.appendChild(ring);
  try{ring.animate([{transform:'translate(-50%,-50%) scale(.2)',opacity:.95},{transform:'translate(-50%,-50%) scale('+(Math.max(R.width,R.height)/60).toFixed(2)+')',opacity:0}],{duration:700/sp,easing:'cubic-bezier(.2,.8,.3,1)'}).onfinish=()=>ring.remove()}catch(e){}setTimeout(()=>ring.remove(),900/sp);
  const n=tie?8:16;for(let i=0;i<n;i++){const k=document.createElement('i');k.className='tbspark';k.style.cssText='left:'+cx+'px;top:'+cy+'px;--hc:'+col;fx.appendChild(k);const a=Math.PI*2*i/n+Math.random()*.4,d=40+Math.random()*Math.max(40,R.width*.45);
    try{k.animate([{transform:'translate(-50%,-50%) scale(1)',opacity:1},{transform:'translate(calc(-50% + '+(Math.cos(a)*d).toFixed(0)+'px),calc(-50% + '+(Math.sin(a)*d).toFixed(0)+'px)) scale(.3)',opacity:0}],{duration:(550+Math.random()*250)/sp,easing:'cubic-bezier(.1,.7,.3,1)'}).onfinish=()=>k.remove()}catch(e){}setTimeout(()=>k.remove(),1000/sp)}
  if(!tie){const bd=$('#board');if(bd)try{bd.animate([{transform:'translate(0,0)'},{transform:'translate(-4px,2px)'},{transform:'translate(4px,-2px)'},{transform:'translate(-2px,1px)'},{transform:'translate(0,0)'}],{duration:260/sp})}catch(e){}}}
(function(){const st=document.createElement('style');st.textContent='.tbhit{position:fixed;width:60px;height:60px;border-radius:50%;border:5px solid var(--hc);box-shadow:0 0 18px var(--hc),inset 0 0 14px var(--hc);pointer-events:none;z-index:59}.tbspark{position:fixed;width:8px;height:8px;border-radius:50%;background:var(--hc);box-shadow:0 0 8px var(--hc),0 0 2px #fff;pointer-events:none;z-index:59}';document.head.appendChild(st)})();
// a big stamp over the board for the moments that matter (a Clash won or lost, a round ending): it lands, holds, fades; never blocks a tap
function bfBanner(t,sub,col){try{if(!ANIM||UI.reduce)return;const bd=$('#board');if(!bd)return;const R=bd.getBoundingClientRect();const fx=$('#fx')||document.body;
  const e=document.createElement('div');e.className='tbban';e.style.cssText='left:'+(R.left+R.width/2)+'px;top:'+(R.top+R.height*0.42)+'px;--bc:'+(col||'#f0c860');
  e.innerHTML='<b>'+esc(t)+'</b>'+(sub?'<small>'+esc(sub)+'</small>':'');fx.appendChild(e);setTimeout(()=>e.remove(),1500/spd())}catch(x){}}
(function(){const st=document.createElement('style');st.textContent='.tbban{position:fixed;transform:translate(-50%,-50%);z-index:60;pointer-events:none;min-width:200px;max-width:88vw;text-align:center;padding:10px 18px;border-radius:12px;background:rgba(20,12,26,.9);border:3px solid var(--bc);box-shadow:0 8px 30px rgba(0,0,0,.6),0 0 24px var(--bc);color:#fff;animation:tbban 1.45s cubic-bezier(.2,1.4,.4,1) forwards}.tbban b{display:block;font:700 22px/1.2 Cinzel,Georgia,serif;color:var(--bc)}.tbban small{display:block;font:600 16px/1.3 "EB Garamond",Georgia,serif;margin-top:2px}@keyframes tbban{0%{transform:translate(-50%,-50%) scale(1.8);opacity:0}14%{transform:translate(-50%,-50%) scale(1);opacity:1}80%{opacity:1}100%{transform:translate(-50%,-62%) scale(.96);opacity:0}}';document.head.appendChild(st)})();
function bfSummary(c){const ev=c.ev;renderBar();
  try{const me=vs(),d=ev.inf1[me]-ev.inf0[me];bfBanner(ev.round>=ev.rounds?'Final round over':'Round '+ev.round+' over',(d>0?'You +'+d+' Influence':'You held '+ev.inf1[me])+' \u00b7 '+ev.inf1.map((v,s)=>shortName(s)+' '+v).filter((x,s)=>s!==me).join(', '),'#f0c860')}catch(x){}
  if(ANIM)ev.inf1.forEach((v,s)=>{const d=v-ev.inf0[s];if(d){const ch=seatEl(s);if(ch)bfPopAt(ch.getBoundingClientRect(),(d>0?'+':'−')+Math.abs(d),fcol(s),s)}});
  bfAuto(c,1400)}
// a tap on the board or the status line skips the narration
// Every tap does something you can see (owner, 8 Nov): a narration card is skipped from anywhere on the table (board, strip, hand, dock),
// a rival's step is played at once, and a tap that cannot act yet leaves a ring where it landed (and the step keeps it, see tutQueue).
function tapRing(x,y){try{if(UI.reduce)return;const fx=$('#fx')||document.body;const r=document.createElement('div');r.className='tapring';r.style.cssText='left:'+(x-22)+'px;top:'+(y-22)+'px';fx.appendChild(r);setTimeout(()=>r.remove(),450)}catch(e){}}
(function(){const st=document.createElement('style');st.textContent='.tapring{position:fixed;width:44px;height:44px;border-radius:50%;border:3px solid #f0c860;pointer-events:none;z-index:2147483000;animation:tapr .42s ease-out forwards}@keyframes tapr{from{transform:scale(.4);opacity:.95}to{transform:scale(1.25);opacity:0}}';document.head.appendChild(st)})();
window.tbTapAhead=function(){if(!G||!UI.started||G.over)return false;if(UI.card&&(UI.card.kind==='event'||UI.card.kind==='news')){return bfSkip()}
  if(!UI.card&&G.q&&viewSeatForQ()==null){try{const w=whoActs();if(w.ai.length){UI._tbHold=0;clearTimeout(_pumpT);aiStep(w);pump();return true}}catch(e){}}return false};
document.addEventListener('pointerdown',e=>{if(!G||!UI.started)return;const tg=e.target;if(!tg||!tg.closest)return;
  const cell=tg.closest('.gxt-cell');
  if(cell){const S=(typeof GXT!=='undefined'&&GXT.state)?GXT.state():null;if(S&&S.active&&S.phase!=='show'){
    // the second tap of a two-tap step (fight order, Supporters) lands while the step redraws: keep it and play it on the region once the step is back
    let r=null;if(S.count>0){try{const el=document.elementsFromPoint(e.clientX,e.clientY).find(x=>!x.closest('.gxt-cell,.gxt-ring,.gxt-fin')&&x.closest('[data-reg]'));if(el)r=+el.closest('[data-reg]').getAttribute('data-reg')}catch(x){}}
    if(r!=null&&!isNaN(r)&&typeof tutQueue==='function'){const i0=S.i,c0=S.count;tutQueue(()=>{const T=GXT.state();if(!T.active||T.i!==i0||T.count!==c0)return true;if(T.phase!=='show')return false;regionTap(r);return true})}
    else tbTapAhead();tapRing(e.clientX,e.clientY)}return}   // tutorial between steps: skip ahead, show the tap
  const skipSel='#ppop,.gx-drawer,#start,#netbox,#tbgoal,#tbcend,.gxh-bub,.gxt-top,.gxt-end,.tbt-goal,.tbt-skip,.tbt-term,.gx-bar button:not(#barstat)';
  if(!UI.card&&!G.over&&G.q&&viewSeatForQ()==null&&!UI.pop&&!tg.closest(skipSel)&&tg.closest('#board,.gx-bar #barstat,#rivals,#tbturn,#main,#handw,#cstrip,#spots,#mapbox,.gx-main')){tbTapAhead();tapRing(e.clientX,e.clientY);UI._nc=1;return}   // a rival's turn: a tap hurries it
  if(!UI.card||(UI.card.kind!=='event'&&UI.card.kind!=='news'))return;
  if(tg.closest('#ppop,.gx-drawer,#start,#netbox,#tbgoal,#tbcend,.gxh-bub,.gxt-top,.gxt-end,.tbt-goal,.tbt-skip,.tbt-term,.gx-bar button:not(#barstat)'))return;
  if(tg.closest('#board,.gx-bar #barstat,#rivals,#tbturn,#main,#handw,#cstrip,#spots,#mapbox,.gx-main')){if(bfSkip()){if(!tg.closest('#act [data-a=mv],#main [data-a=mv]'))UI._nc=1}else tapRing(e.clientX,e.clientY)}},true);   // a tap on a choice button skips the narration AND still presses the button (legal() checks it)
// ---------------------------------------------------------------- long-press: a small tooltip near the thing (8 words or fewer)
const LOC_SHORT=['Govern','Journey','Favour','','Deck bottom','Recover cards'];
function tipFor(kind,arg){const V=UI.V;if(!V)return '';
  if(kind==='loc'){const l=arg;const hd=G.pl.filter(p=>p.herald===l).map(p=>'<i class="td" style="background:'+fcol(p.seat)+'"></i>').join('');return '<b>'+esc(LOCN[l])+'</b> <em>+'+DD.LOCS[l][2]+'</em> '+esc(LOC_SHORT[l])+(hd?' '+hd:'')}
  if(kind==='region'){const r=arg;const bk=UI.clashBrk&&UI.clashBrk[r];
    if(bk&&UI.clashRes[r])return '<b>'+esc(REG[r].replace('The ',''))+'</b> '+youFirst(bk.parts).map(s=>esc(s===vs()?'You':sideName(s))+' <b>'+bk.tot[s]+'</b>'+(bk.brk&&bk.brk[s]&&bk.brk[s].length?' = '+bk.brk[s].map(x=>x.n).join('+').replace(/\+-/g,'−'):'')).join(' · ');
    const R=V.reg[r];const parts=youFirst(V.pl.map(p=>p.seat)).map(s=>{let known=0,unk=0;for(const id of R.up)if(ownerOf(id)===s)known+=cinfo(id).strength;for(const id of R.down)if(ownerOf(id)===s){if(id>=0)known+=cinfo(id).strength;else unk++}
      const sp=V.pl[s].supp.r[r];const t=known+sp;return (s===vs()?'You':esc(sideName(s)))+' <b>'+(unk?'?'+(t?'+'+t:''):t)+'</b>'});
    return '<b>'+esc(REG[r].replace('The ',''))+'</b> '+parts.join(' · ')}
  return ''}
function showTip(html,rect){const t=$('#tip');if(!t||!html)return;t.innerHTML=html;t.hidden=false;t.style.left='0px';t.style.top='0px';
  const tw=t.offsetWidth,th=t.offsetHeight;let x=rect.left+rect.width/2-tw/2,y=rect.top-th-8;if(y<(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--barh'))||44)+4)y=rect.top+rect.height+8;
  x=Math.max(6,Math.min(innerWidth-tw-6,x));t.style.left=Math.round(x)+'px';t.style.top=Math.round(y)+'px';clearTimeout(UI._tipT);UI._tipT=setTimeout(hideTip,3600)}
function hideTip(){const t=$('#tip');if(t&&!t.hidden){t.hidden=true;t.innerHTML=''}}
// map: hold a location or a region
(function(){let d=null;
  document.addEventListener('pointerdown',e=>{hideTip();const mb=e.target.closest&&e.target.closest('#mapbox');if(!mb||!G||!UI.started||UI.card)return;if(e.target.closest('#spots'))return;
    d={x:e.clientX,y:e.clientY,pid:e.pointerId,t:setTimeout(()=>{if(!d)return;const p=mapPt(d.x,d.y);if(!p)return;let kind=null,arg=null,rect=null;
      for(let l=0;l<6;l++)if(Math.hypot(p.x-LOCPOS[l][0],p.y-LOCPOS[l][1])<70){kind='loc';arg=l;rect=locRect(l);break}
      if(!kind)for(let r=0;r<3;r++){const b=REGBOX[r];if(p.x>=b.x&&p.x<=b.x+b.w&&p.y>=b.y&&p.y<=b.y+b.h){kind='region';arg=r;const R=regionRect(r);rect={left:R.left+R.width/2-10,top:R.top+30,width:20,height:20};break}}
      if(kind){UI._nc=1;showTip(tipFor(kind,arg),rect)}d=null},480)}},true);
  const end=()=>{if(d){clearTimeout(d.t);d=null}};
  document.addEventListener('pointerup',end,true);document.addEventListener('pointercancel',end,true);
  document.addEventListener('pointermove',e=>{if(d&&Math.hypot(e.clientX-d.x,e.clientY-d.y)>12)end()},true)})();
// hand: hold a card to read it, drag a usable card onto the glowing spot
(function(){let d=null;
  const dropAt=(x,y)=>{const sp=$('#spots .bspot');if(sp){const r=sp.getBoundingClientRect();if(x>=r.left-18&&x<=r.right+18&&y>=r.top-18&&y<=r.bottom+18)return {type:'spot'}}
    const p=mapPt(x,y);if(p)for(let r=0;r<3;r++){const b=REGBOX[r];if(p.x>=b.x-20&&p.x<=b.x+b.w+20&&p.y>=b.y-20&&p.y<=b.y+b.h+20)return {type:'region',r}}return null};
  document.addEventListener('pointerdown',e=>{const b=e.target.closest&&e.target.closest('#handw .hc');if(!b||(e.button&&e.button>0))return;
    const id=+b.dataset.id;d={id,b,x:e.clientX,y:e.clientY,drag:false,pid:e.pointerId,g:null};
    d.lp=setTimeout(()=>{if(d&&!d.drag){const i=d.id;d=null;UI._nc=1;UI.hand=null;openPop('card',{id:i,read:1})}},520)},true);
  document.addEventListener('pointermove',e=>{if(!d||e.pointerId!==d.pid)return;
    if(!d.drag){if(Math.hypot(e.clientX-d.x,e.clientY-d.y)<12)return;clearTimeout(d.lp);
      if(!cardDriven(UI.bf)||!cardMoves(d.id).length){d=null;return}
      d.drag=true;UI.dragging=true;UI.hand=d.id;const g=document.createElement('div');g.className='dragc';const w=cssPx('--cw',50)*1.2;g.innerHTML=cardEl(d.id,w).outerHTML;document.body.appendChild(g);d.g=g;d.b.classList.add('lifted');UI.dragging=false;renderMain();renderSpots();UI.dragging=true}
    if(d.g){d.g.style.transform='translate('+(e.clientX-30)+'px,'+(e.clientY-70)+'px)';const t=dropAt(e.clientX,e.clientY);document.body.classList.toggle('over-t',!!t)}
    e.preventDefault()},true);
  const fin=(e,ok)=>{if(!d)return;clearTimeout(d.lp);const x=d;d=null;if(!x.drag){if(ok&&!x.b.isConnected&&G&&UI.started&&!UI.pop&&!UI.card&&Math.hypot(e.clientX-x.x,e.clientY-x.y)<12&&document.querySelector('#handw .hc[data-id="'+x.id+'"]')){UI._ncT=Date.now()+350;handTap(x.id)}return}UI.dragging=false;document.body.classList.remove('over-t');if(x.g)x.g.remove();x.b.classList.remove('lifted');UI._ncT=Date.now()+70;
    if(ok){const t=dropAt(e.clientX,e.clientY);const c=t&&cardMoves(x.id).find(m=>m.type===t.type&&(t.type==='spot'||m.r===t.r));if(c){commitCard(x.id,c);return}}
    renderAll()};
  document.addEventListener('pointerup',e=>fin(e,true),true);document.addEventListener('pointercancel',e=>fin(e,false),true)})();
// ---------------------------------------------------------------- the ghost finger: shows the first move of each kind (and every move while hints are on in the guided game and in Story)
// a tap that ended a hold, a drag or a skip must not also act
document.addEventListener('pointerup',()=>{if(UI._nc){UI._nc=0;UI._ncT=Date.now()+70}},true);
document.addEventListener('click',e=>{if(UI._ncT&&Date.now()<UI._ncT){UI._ncT=0;e.stopPropagation();e.preventDefault()}},true);
const learnKey=()=>G&&G.q?(G.q.t==='menu'?'menu':G.q.kind):'';
function lsGetJ(k){try{return JSON.parse(localStorage.getItem(k)||'{}')||{}}catch(e){return {}}}
function fingerWanted(kind){if(isGuided()||UI.camp||UI.guide==='full')return true;return !(lsGetJ('tb_fl')[kind]>=1)}
(function(){const o=humanMove;humanMove=function(k){const kind=learnKey();const r=o(k);if(r&&kind){try{const L=lsGetJ('tb_fl');L[kind]=(L[kind]||0)+1;localStorage.setItem('tb_fl',JSON.stringify(L))}catch(e){}}return r}})();
function ctr(r){return r?{x:r.left+r.width/2,y:r.top+r.height/2}:null}
// planFor(M,rm): where the move rm is made on the board: {from,to} points (from = the card to pick up first), fromR/toR rects, key. Used by the ghost finger and by the lightbulb.
function planFor(M,rm,o){o=o||{};if(!M||!M.kind||!rm)return null;
  let from=null,to=null,fromR=null,toR=null;const el=sel=>{const e=document.querySelector(sel);if(!e)return null;let r=e.getBoundingClientRect();
    const hid=()=>{if(!r.width)return false;if(r.bottom>innerHeight-2||r.top<0)return true;const sc0=e.closest('#main');if(sc0){const a=sc0.getBoundingClientRect();return r.top<a.top-1||r.bottom>a.bottom+1}   /* in the sheet: scroll only when the button is outside it (a bubble over it is not a reason to scroll, or the sheet runs away) */
      const t=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return !(t&&(t===e||e.contains(t)||t.closest('#finger,.tapring,.fly')))};
    if(hid()){try{const sc=e.closest('#main');if(sc){const a=sc.getBoundingClientRect(),q=e.getBoundingClientRect();sc.scrollTop+=q.top+q.height/2-(a.top+a.height/2)}}catch(x){}r=e.getBoundingClientRect()}   /* only the sheet scrolls: scrollIntoView also moved the clipped page */   // a suggested button scrolled out of the dock is brought into view first
    return r};const K=rm.k;
  const T=r=>{toR=r;return ctr(r)},F=r=>{fromR=r;return ctr(r)};
  try{
    if(UI.pop){if(UI.pop==='confirm')to=T(el('#ppop [data-a=mv]'));else return null}
    else switch(M.kind){
    case 'bid':{to=T(el('#spots .bspot'));if(UI.hand==null||o.full)from=F(el('#handw .hc[data-id="'+rm.id+'"]'));break}
    case 'place':case 'tie':{if(rm.pass){to=T(el('#act [data-k="'+K+'"]'));break}const r=rm.r!=null?rm.r:(G.clash?G.clash.r:null);if(r!=null)to=T(regionRect(r));if(UI.hand==null||o.full)from=F(el('#handw .hc[data-id="'+rm.id+'"]'));break}
    case 'herald':case 'location':{to=T(locRect(rm.loc));break}
    case 'bidRes':{to=T(el('#handw [data-k="'+K+'"]')||el('#act [data-k="'+K+'"]'));break}
    case 'clashOrder':{const nx=rm.order&&rm.order[(UI.ord||[]).length];if(nx!=null)to=T(regionRect(nx));break}
    case 'menu':{if(rm.a==='supp'&&rm.p)to=T(regionRect(rm.p.r));else if(UI.sheetOpen)to=T(el('#main [data-k="'+K+'"]'));else to=T(el('#act [data-k="'+K+'"]')||(rm.t==='act'&&rm.a!=='supp'?el('#act [data-a=powers]'):el('#act .btn.pri')));break}
    default:{{const b=el('#act [data-k="'+K+'"]')||el('#main [data-k="'+K+'"]');const w=b&&b.height>90?(el('#act [data-k="'+K+'"] .ot')||el('#main [data-k="'+K+'"] .ot')):null;to=T(w||b)}break}   // a big option button: point at its words, not at a picture inside it
  }}catch(e){return null}
  return to?{from,to,fromR,toR,key:M.kind+'|'+(K||'')+'|'+(UI.hand==null?0:1)+'|'+(UI.pop||'')+'|'+(UI.sheetOpen?1:0)+'|'+Math.round(to.x)+','+Math.round(to.y)}:null}
function fingerPlan(){const M=UI.bf,rm=M&&M.rec;if(!M||!M.kind||!rm||UI.card||UI.dragging||!fingerWanted(learnKey())||(typeof tutOn==='function'&&tutOn()))return null;return planFor(M,rm)}
function bfFinger(){const f=$('#finger');if(!f)return;const p=ANIM&&!UI.reduce?fingerPlan():null;
  if(!p){if(!f.hidden){f.hidden=true;try{f._a&&f._a.cancel()}catch(e){}f._k=''}return}
  if(f._k===p.key&&!f.hidden)return;f._k=p.key;f.hidden=false;try{f._a&&f._a.cancel()}catch(e){}
  const a=p.from||p.to,b=p.to;const kf=p.from?[{transform:'translate('+a.x+'px,'+a.y+'px) scale(1.25)',opacity:0},{transform:'translate('+a.x+'px,'+a.y+'px) scale(1)',opacity:1,offset:.14},{transform:'translate('+a.x+'px,'+a.y+'px) scale(.9)',opacity:1,offset:.28},{transform:'translate('+b.x+'px,'+b.y+'px) scale(.9)',opacity:1,offset:.72},{transform:'translate('+b.x+'px,'+b.y+'px) scale(1.2)',opacity:.9,offset:.86},{transform:'translate('+b.x+'px,'+b.y+'px) scale(1.4)',opacity:0}]
    :[{transform:'translate('+b.x+'px,'+b.y+'px) scale(1.3)',opacity:0},{transform:'translate('+b.x+'px,'+b.y+'px) scale(1)',opacity:1,offset:.3},{transform:'translate('+b.x+'px,'+b.y+'px) scale(.85)',opacity:1,offset:.55},{transform:'translate('+b.x+'px,'+b.y+'px) scale(1.35)',opacity:0}];
  try{f._a=f.animate(kf,{duration:p.from?2300:1500,iterations:Infinity,easing:'ease-in-out'})}catch(e){f.style.transform='translate('+b.x+'px,'+b.y+'px)'}}
function bfAfter(){bfFinger();if(typeof hlpAfter==='function')hlpAfter()}
// the computer acts at a watchable pace (about 0.6 s per move; tap to skip narration)
// Crown's Edict asks only when it changes who picks first (your bid already first: using it would only waste it)
function edictPointless(){try{if(!G.q||G.q.kind!=='edict')return false;const s=G.q.seats[0],b=G.bstr||[];return G.order.filter(x=>G.pl[x].bid!=null).sort((a,c)=>b[c]-b[a]||G.order.indexOf(a)-G.order.indexOf(c))[0]===s}catch(e){return false}}
function autoSkip(h){if(!NET.on&&!hotSeat()&&G&&G.q&&G.q.kind==='edict'&&edictPointless()){const no=legal(h).find(m=>m.yes===0);if(no)return humanMoveAuto(no.k)}
  if(NET.on||hotSeat()||!G||!G.q||G.q.t!=='menu')return false;
  const mv=legal(h);const acts=visibleActs(mv).filter(m=>m.t==='act');const d=mv.find(m=>m.t==='done');if(!d||acts.length)return false;
  return humanMoveAuto(d.k)}
// a move the game makes for you (a season with nothing to use): not a tap, so the tutorial does not gate it
function humanMoveAuto(k){UI._tutIn=1;try{return humanMove(k)}finally{UI._tutIn=0}}
// ---------------------------------------------------------------- motion for the moves a newcomer watches: a bid slides to its spot, a stolen Kingdom Card flies
// from the rival to the thief, Influence pulses on the score. Each effect is <= 0.6 s, lives in #fx (pointer-events none) and is skipped under reduced motion.
try{const mq=matchMedia('(prefers-reduced-motion: reduce)');UI.reduce=mq.matches;mq.addEventListener&&mq.addEventListener('change',e=>{UI.reduce=e.matches})}catch(e){}
const FX_MS=560;
function fxOn(){return !!ANIM&&!UI.reduce&&!!$('#fx')}
function fxRect(e){if(!e)return null;const r=e.getBoundingClientRect();return r.width&&r.height&&r.bottom>0&&r.top<innerHeight?r:null}
function fxSeatRect(s){const c=seatEl(s);return fxRect(c&&(c.querySelector('.rv-e')||c))}
// a flight with a small lift in the middle (reads as a card being carried, not a slide)
function fxFly(html,from,to,o){o=o||{};const fx=$('#fx');if(!fxOn()||!fx||!from||!to)return;const ms=Math.min(FX_MS,(o.ms||480)/Math.max(1,Math.min(UI.speed||1,4)));
  const w=o.w||from.width||40,h=o.h||from.height||56;const x0=from.left+from.width/2-w/2,y0=from.top+from.height/2-h/2;
  const e=document.createElement('div');e.className='fly fxfly';e.innerHTML=html||'';e.style.cssText='left:'+x0+'px;top:'+y0+'px;width:'+w+'px;height:'+h+'px';fx.appendChild(e);
  const dx=to.left+to.width/2-(x0+w/2),dy=to.top+to.height/2-(y0+h/2),s1=o.s1||1.25,s2=Math.max(.3,Math.min(1.4,o.s2||(to.width/w)));
  const done=()=>{if(e.parentNode)e.remove()};
  try{e.animate([{transform:'translate(0,0) scale(1) rotate(0deg)',opacity:.4},{transform:'translate('+(dx*.5)+'px,'+(dy*.5-(o.lift||26))+'px) scale('+s1+') rotate('+(o.rot||-6)+'deg)',opacity:1,offset:.5},{transform:'translate('+dx+'px,'+dy+'px) scale('+s2+') rotate(0deg)',opacity:1}],{duration:ms,easing:'cubic-bezier(.3,.7,.3,1)'}).onfinish=()=>{done();if(o.land)fxLand(o.land)}}catch(x){}
  setTimeout(done,ms+120)}
// the place a card or Influence lands gives a short pulse
function fxLand(el){if(!el||!fxOn())return;const sp=el===$('#spots .bspot');   // a glow, not a size change: a grown seat chip would lie over its neighbour
  try{el.animate(sp?[{transform:'translate(-50%,-50%) scale(1)'},{transform:'translate(-50%,-50%) scale(1.12)',filter:'brightness(1.5)'},{transform:'translate(-50%,-50%) scale(1)'}]:[{filter:'brightness(1)'},{filter:'brightness(1.7)'},{filter:'brightness(1)'}],{duration:300,easing:'ease-out'})}catch(e){}}
function fxInf(s,n){if(!fxOn()||!n)return;const c=seatEl(s);const chip=c&&c.querySelector('.rv-n');if(!chip)return;chip.classList.remove('bump');void chip.offsetWidth;chip.classList.add('bump');
  try{c.animate([{boxShadow:'0 0 0 0 '+(n>0?'rgba(255,214,90,.9)':'rgba(220,60,60,.9)')},{boxShadow:'0 0 0 9px rgba(255,214,90,0)'}],{duration:FX_MS,easing:'ease-out'})}catch(x){}}
function fxSnap(){try{if(!G||!UI.V)return null;return {g:G,round:G.round,bid:UI.V.pl.map(p=>p.bid!=null&&p.bid!==false),ks:G.pl.map(p=>(p.ks||[]).map(t=>t&&t.kc).filter(Boolean)),inf:G.pl.map(p=>p.inf)}}catch(e){return null}}
function fxDiff(a,b){if(!a||!b||a.g!==b.g||!fxOn())return;const me=vs();
  // bids: a rival's face-down card drops into its seat; your own card slides from your hand to the bid spot (unless your tap already flew it)
  if(a.round===b.round)b.bid.forEach((on,s)=>{if(!on||a.bid[s])return;
    if(s===me){if(Date.now()-(UI._bidFly||0)<900)return;const sp=$('#spots .bspot');const to=fxRect(sp);const hr=fxRect($('#handw'));if(to&&hr)fxFly(BACK_HTML,{left:hr.left+hr.width/2-20,top:hr.top+8,width:40,height:56},to,{land:sp})}
    else{const c=seatEl(s),bc=c&&c.querySelector('.bidc');const to=fxRect(bc)||fxSeatRect(s);const fr=fxSeatRect(s);if(fr&&to)fxFly(BACK_HTML,{left:fr.left,top:fr.bottom+30,width:fr.width,height:fr.height},to,{w:30,h:42,lift:10,land:bc||c})}});
  // Kingdom Cards that changed hands (a steal): the card flies from the rival who lost it to the one who took it
  b.ks.forEach((list,s)=>{for(const kc of list){if(a.ks[s].includes(kc))continue;const v=a.ks.findIndex((l,i)=>i!==s&&l.includes(kc));if(v<0)continue;
    const fr=fxSeatRect(v),to=fxSeatRect(s);let html='';try{html=kcEl(kc,44).outerHTML}catch(e){html=BACK_HTML}
    if(fr&&to)fxFly(html,fr,to,{w:44,h:63,s1:1.6,s2:.7,lift:-60,rot:8,land:seatEl(s)})}});
  // Influence: the score number pulses and a small +n / -n rises from it (the track token moves on the map at the same time)
  b.inf.forEach((v,s)=>{const d=v-a.inf[s];if(d)fxInf(s,d)})}
(function(){const o=renderAll;renderAll=function(){const r=o.apply(this,arguments);try{const b=fxSnap();fxDiff(UI._fxS,b);UI._fxS=b;mapTextFit()}catch(e){}return r}})();
(function(){const o=drawOverlay;drawOverlay=function(){const r=o.apply(this,arguments);try{mapTextFit()}catch(e){}return r}})();
// map words at phone size: any label that would draw under 14 px grows to 14 px; a small coin or marker grows with its number
function mapTextFit(){const s=MAP.m&&MAP.m.el;if(!s||!s.viewBox||!s.viewBox.baseVal)return;const R=s.getBoundingClientRect();const vb=s.viewBox.baseVal.width||1000;if(!R.width)return;const k=R.width/vb;
  for(const t of s.querySelectorAll('text')){if(t._k===k||t.getAttribute('opacity')==='0')continue;t._k=k;let f=t._f0;if(f==null){f=t._f0=parseFloat(t.getAttribute('font-size')||getComputedStyle(t).fontSize)||0}if(!f)continue;
    const need=14.2/k;if(f>=need){if(t._fit){t.style.fontSize='';t._fit=0}const g=t.parentNode;if(g&&g._t0!=null){g.setAttribute('transform',g._t0);g._t0=null}continue}
    const g=t.parentNode,kids=g&&g.tagName==='g'?[...g.children]:[];let small=false;try{small=kids.length>1&&g.getBBox().width<140}catch(e){}
    if(small&&kids.length<=3&&kids.filter(x=>x.tagName==='text').length===1&&kids.every(x=>/^(circle|rect|path|text)$/.test(x.tagName))){if(g._t0==null)g._t0=g.getAttribute('transform')||'';g.setAttribute('transform',g._t0+' scale('+(need/f).toFixed(3)+')')}
    else{t.style.fontSize=need.toFixed(1)+'px';t._fit=1;
      if(t._tl0==null)t._tl0=t.getAttribute('textLength')||'';if(t._tl0)t.setAttribute('textLength',(parseFloat(t._tl0)*need/f).toFixed(1));
      // a grown label stays inside the board: nudge it in from the edge it would cross
      try{const bb=t.getBoundingClientRect(),pad=3;let dx=0;if(bb.left<R.left+pad)dx=R.left+pad-bb.left;else if(bb.right>R.right-pad)dx=R.right-pad-bb.right;if(t._tr0==null)t._tr0=t.getAttribute('transform')||'';if(dx)t.setAttribute('transform',(t._tr0+' translate('+(dx/k).toFixed(1)+' 0)').trim())}catch(e){}}}}
