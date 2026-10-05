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
  M.regsFor=id=>{const o=[];for(const m of mv){if(m.id!==id)continue;if(k==='place'&&m.r!=null)o.push(m.r);else if(k==='tie'&&G.clash)o.push(G.clash.r)}return [...new Set(o)]};
  M.nextRegs=()=>{const o=UI.ord||[];const set=new Set();for(const m of mv)if(m.order&&o.every((r,i)=>m.order[i]===r)&&m.order.length>o.length)set.add(m.order[o.length]);return [...set]};
  return M}
function cardMoves(id){const M=UI.bf;if(!M||!M.mv)return [];const out=[];
  for(const m of M.mv){if(m.id!==id&&!(typeof m.v==='number'&&m.v===id))continue;
    if(M.kind==='bid')out.push({type:'spot',k:m.k});
    else if(M.kind==='place')out.push({type:'region',r:m.r,k:m.k});
    else if(M.kind==='tie')out.push({type:'region',r:G.clash?G.clash.r:null,k:m.k});
    else if(M.kind==='other')out.push({type:'direct',k:m.k})}
  return out}
const cardDriven=M=>!!M&&(M.kind==='bid'||M.kind==='place'||M.kind==='tie');
// tap a card: it lifts and its targets glow; tap it again (or the glowing spot) to play it
function handTap(id){const M=UI.bf;const cm=M&&M.kind?cardMoves(id):[];
  if(!cm.length){UI.hand=null;openPop('card',{id});return}
  if(cardDriven(M)){
    if(UI.hand===id){if(cm.length===1){commitCard(id,cm[0]);return}UI.hand=null;renderAll();return}
    UI.hand=id;if(typeof sfx==='function')sfx('tap');renderAll();return}
  if(cm.length===1){humanMove(cm[0].k);return}
  openPop('card',{id})}
function commitCard(id,c){UI.hand=null;
  try{const el=$('#handw .hc[data-id="'+id+'"]');let dest=null;if(c.type==='spot'){const sp=$('#spots .bspot');dest=sp&&sp.getBoundingClientRect()}else if(c.type==='region'&&c.r!=null&&MAP.m){const R=regionRect(c.r);dest={left:R.left+R.width/2-14,top:R.top+R.height/2-20,width:28,height:40}}
    if(el&&dest)flyEl(el.innerHTML,el.getBoundingClientRect(),dest,{ms:380})}catch(e){}
  humanMove(c.k)}
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
  const S=UI.bs||360;const w=Math.round(Math.max(40,Math.min(60,S*.13))),h=Math.round(w*1.4308);
  const glow=asking&&UI.hand!=null,rec=asking&&M.rec&&M.rec.id!=null;const retk=M&&M.kind==='bidRes'&&M.mv.some(m=>m.t==='return');
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
      chip?{transform:'translate('+(chip.getBoundingClientRect().left+chip.getBoundingClientRect().width/2-(rect.left+rect.width/2)-0)+'px,'+(chip.getBoundingClientRect().top+8-(rect.top+rect.height/2))+'px) scale(.5)',opacity:.15}:{transform:'translate(-50%,-150%) scale(.8)',opacity:0}],{duration:1150/sp,easing:'ease-in-out'});
    a.onfinish=()=>{done();if(chip){chip.classList.remove('bump');void chip.offsetWidth;chip.classList.add('bump')}}}catch(x){}
  setTimeout(done,1400/sp)}
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
function bfSkip(){const c=UI.card;if(!c)return false;if(c.kind==='event'){evDone();return true}if(c.kind==='news'){newsOk();return true}return false}
const spd=()=>Math.max(1,Math.min(UI.speed||1,4));
function bfAuto(c,ms){clearTimeout(UI._evT);UI._evT=setTimeout(()=>{if(UI.card===c)evDone()},ANIM?ms/spd():0)}
function bfEvent(c){const ev=c.ev;if(ev.t==='bids')bfBids(c);else if(ev.t==='clash')bfClash(c);else if(ev.t==='summary')bfSummary(c);else bfAuto(c,300)}
function bfBids(c){const ev=c.ev;c.rank=ev.bids.slice().sort((a,b)=>a.str-b.str||ev.order.indexOf(b.seat)-ev.order.indexOf(a.seat)).map(b=>b.seat);c.revN=0;
  const step=()=>{if(UI.card!==c)return;if(c.revN<c.rank.length){c.revN++;if(typeof sfx==='function')sfx('flip');renderRivals();setTimeout(step,ANIM?420/spd():0)}else bfAuto(c,1100)};
  renderBar();renderRivals();setTimeout(step,ANIM?350/spd():0)}
function clashLine(ev){const me=vs(),w=ev.winner,reg=REG[ev.r];if(w<0)return 'Tie in '+reg;
  const best=Math.max(0,...ev.parts.filter(x=>x!==w).map(x=>ev.tot[x]));return (w===me?'You win ':sideName(w)+' wins ')+reg+', '+ev.tot[w]+' to '+best}
function elimLine(ev){const d=ev.dead||{};const me=vs();const o=Object.keys(d).map(Number).filter(s=>d[s]&&d[s].length);if(!o.length)return '';const s=o.sort((a,b)=>(b===me)-(a===me))[0];const n=d[s].length;
  return (s===me?'You lose ':sideName(s)+' loses ')+n+' card'+(n>1?'s':'')}
function bfClash(c){const ev=c.ev;UI.noAnim=true;UI.clashBrk=UI.clashBrk||{};UI.clashBrk[ev.r]={tot:ev.tot,brk:ev.brk,parts:ev.parts};
  const fin=()=>{if(UI.card!==c)return;UI.clashRes[ev.r]={winner:ev.winner,tot:ev.tot};try{drawOverlay()}catch(e){}UI._clashLine=clashLine(ev);renderBar();if(typeof sfx==='function')sfx(ev.winner<0?'tie':'win');
    const el=elimLine(ev);const hold=el?1500:1100;
    if(el)setTimeout(()=>{if(UI.card===c){UI._clashLine=el;renderBar()}},900/spd());
    bfAuto(c,hold+300)};
  UI._clashLine='The Clash in '+REG[ev.r];renderBar();
  if(!ANIM){fin();return}
  const p=mapReveal(ev);Promise.resolve(p).then(()=>{if(UI.card===c)setTimeout(fin,150/spd())})}
function bfSummary(c){const ev=c.ev;renderBar();
  if(ANIM)ev.inf1.forEach((v,s)=>{const d=v-ev.inf0[s];if(d){const ch=seatEl(s);if(ch)bfPopAt(ch.getBoundingClientRect(),(d>0?'+':'−')+Math.abs(d),fcol(s),s)}});
  bfAuto(c,1400)}
// a tap on the board or the status line skips the narration
document.addEventListener('pointerdown',e=>{if(!UI.card||!G)return;if(UI.card.kind!=='event'&&UI.card.kind!=='news')return;
  if(e.target.closest&&e.target.closest('#board,.gx-bar #barstat,#rivals')){if(bfSkip())UI._nc=1}},true);
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
    d.lp=setTimeout(()=>{if(d&&!d.drag){const i=d.id;d=null;UI._nc=1;UI.hand=null;openPop('card',{id:i})}},520)},true);
  document.addEventListener('pointermove',e=>{if(!d||e.pointerId!==d.pid)return;
    if(!d.drag){if(Math.hypot(e.clientX-d.x,e.clientY-d.y)<12)return;clearTimeout(d.lp);
      if(!cardDriven(UI.bf)||!cardMoves(d.id).length){d=null;return}
      d.drag=true;UI.dragging=true;UI.hand=d.id;const g=document.createElement('div');g.className='dragc';const w=cssPx('--cw',50)*1.2;g.innerHTML=cardEl(d.id,w).outerHTML;document.body.appendChild(g);d.g=g;d.b.classList.add('lifted');UI.dragging=false;renderMain();renderSpots();UI.dragging=true}
    if(d.g){d.g.style.transform='translate('+(e.clientX-30)+'px,'+(e.clientY-70)+'px)';const t=dropAt(e.clientX,e.clientY);document.body.classList.toggle('over-t',!!t)}
    e.preventDefault()},true);
  const fin=(e,ok)=>{if(!d)return;clearTimeout(d.lp);const x=d;d=null;if(!x.drag)return;UI.dragging=false;document.body.classList.remove('over-t');if(x.g)x.g.remove();x.b.classList.remove('lifted');UI._ncT=Date.now()+70;
    if(ok){const t=dropAt(e.clientX,e.clientY);const c=t&&cardMoves(x.id).find(m=>m.type===t.type&&(t.type==='spot'||m.r===t.r));if(c){commitCard(x.id,c);return}}
    renderAll()};
  document.addEventListener('pointerup',e=>fin(e,true),true);document.addEventListener('pointercancel',e=>fin(e,false),true)})();
// ---------------------------------------------------------------- the ghost finger: shows the first move of each kind (and every move while hints are on in the guided game and in Story)
// a tap that ended a hold, a drag or a skip must not also act
document.addEventListener('pointerup',()=>{if(UI._nc){UI._nc=0;UI._ncT=Date.now()+70}},true);
document.addEventListener('click',e=>{if(UI._ncT&&Date.now()<UI._ncT){UI._ncT=0;e.stopPropagation();e.preventDefault()}},true);
const learnKey=()=>G&&G.q?(G.q.t==='menu'?'menu':G.q.kind):'';
function lsGetJ(k){try{return JSON.parse(localStorage.getItem(k)||'{}')||{}}catch(e){return {}}}
function fingerWanted(kind){if(isGuided()||UI.camp)return true;return !(lsGetJ('tb_fl')[kind]>=1)}
(function(){const o=humanMove;humanMove=function(k){const kind=learnKey();const r=o(k);if(r&&kind){try{const L=lsGetJ('tb_fl');L[kind]=(L[kind]||0)+1;localStorage.setItem('tb_fl',JSON.stringify(L))}catch(e){}}return r}})();
function ctr(r){return r?{x:r.left+r.width/2,y:r.top+r.height/2}:null}
function fingerPlan(){const M=UI.bf,rm=M&&M.rec;if(!M||!M.kind||!rm||UI.card||UI.dragging||!fingerWanted(learnKey()))return null;
  let from=null,to=null;const el=sel=>{const e=document.querySelector(sel);return e?e.getBoundingClientRect():null};const K=rm.k;
  try{
    if(UI.pop){if(UI.pop==='confirm')to=ctr(el('#ppop [data-a=mv]'));else return null}
    else switch(M.kind){
    case 'bid':{to=ctr(el('#spots .bspot'));if(UI.hand==null)from=ctr(el('#handw .hc[data-id="'+rm.id+'"]'));break}
    case 'place':case 'tie':{if(rm.pass){to=ctr(el('#act [data-k="'+K+'"]'));break}const r=rm.r!=null?rm.r:(G.clash?G.clash.r:null);if(r!=null)to=ctr(regionRect(r));if(UI.hand==null)from=ctr(el('#handw .hc[data-id="'+rm.id+'"]'));break}
    case 'herald':case 'location':{const R=locRect(rm.loc);to=ctr(R);break}
    case 'bidRes':{to=ctr(el('#handw [data-k="'+K+'"]')||el('#act [data-k="'+K+'"]'));break}
    case 'clashOrder':{const nx=rm.order&&rm.order[(UI.ord||[]).length];if(nx!=null)to=ctr(regionRect(nx));break}
    case 'menu':{if(rm.a==='supp'&&rm.p)to=ctr(regionRect(rm.p.r));else if(UI.sheetOpen)to=ctr(el('#main [data-k="'+K+'"]'));else to=ctr(el('#act [data-k="'+K+'"]')||el('#act .btn.pri'));break}
    default:{to=ctr(el('#act [data-k="'+K+'"]')||el('#main [data-k="'+K+'"]'));break}
  }}catch(e){return null}
  return to?{from,to,key:M.kind+'|'+(K||'')+'|'+(UI.hand==null?0:1)+'|'+(UI.pop||'')+'|'+(UI.sheetOpen?1:0)+'|'+Math.round(to.x)+','+Math.round(to.y)}:null}
function bfFinger(){const f=$('#finger');if(!f)return;const p=ANIM&&!UI.reduce?fingerPlan():null;
  if(!p){if(!f.hidden){f.hidden=true;try{f._a&&f._a.cancel()}catch(e){}f._k=''}return}
  if(f._k===p.key&&!f.hidden)return;f._k=p.key;f.hidden=false;try{f._a&&f._a.cancel()}catch(e){}
  const a=p.from||p.to,b=p.to;const kf=p.from?[{transform:'translate('+a.x+'px,'+a.y+'px) scale(1.25)',opacity:0},{transform:'translate('+a.x+'px,'+a.y+'px) scale(1)',opacity:1,offset:.14},{transform:'translate('+a.x+'px,'+a.y+'px) scale(.9)',opacity:1,offset:.28},{transform:'translate('+b.x+'px,'+b.y+'px) scale(.9)',opacity:1,offset:.72},{transform:'translate('+b.x+'px,'+b.y+'px) scale(1.2)',opacity:.9,offset:.86},{transform:'translate('+b.x+'px,'+b.y+'px) scale(1.4)',opacity:0}]
    :[{transform:'translate('+b.x+'px,'+b.y+'px) scale(1.3)',opacity:0},{transform:'translate('+b.x+'px,'+b.y+'px) scale(1)',opacity:1,offset:.3},{transform:'translate('+b.x+'px,'+b.y+'px) scale(.85)',opacity:1,offset:.55},{transform:'translate('+b.x+'px,'+b.y+'px) scale(1.35)',opacity:0}];
  try{f._a=f.animate(kf,{duration:p.from?2300:1500,iterations:Infinity,easing:'ease-in-out'})}catch(e){f.style.transform='translate('+b.x+'px,'+b.y+'px)'}}
function bfAfter(){bfFinger()}
// the computer acts at a watchable pace (about 0.6 s per move; tap to skip narration)
function autoSkip(h){if(NET.on||hotSeat()||!G||!G.q||G.q.t!=='menu')return false;
  const mv=legal(h);const acts=visibleActs(mv).filter(m=>m.t==='act');const d=mv.find(m=>m.t==='done');if(!d||acts.length)return false;
  return humanMove(d.k)}
