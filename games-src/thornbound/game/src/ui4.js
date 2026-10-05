// ===================== part 4: hand, rivals, pop-ups, one-at-a-time cards =====================
const emb=(s,w)=>TBKit.token('influence',{faction:fk(s)},w||26).outerHTML;
function isPassing(){return !!(UI.card&&UI.card.kind==='pass')}
// ---------------------------------------------------------------- hand: a fanned strip along the bottom (tap = lift, tap again or drag onto the glowing spot = play; hold = read)
function cssPx(n,d){try{const v=parseFloat(getComputedStyle(document.documentElement).getPropertyValue(n));return v>0?v:d}catch(e){return d}}
function renderHand(){const el=$('#handw');if(!el)return;const s=vs();
  if(!G||s<0||isPassing()||G.over){el.innerHTML='';el._h='';el.hidden=true;return}
  if(UI.dragging)return;
  el.hidden=false;const V=UI.V,P=V.pl[s];const M=UI.bf;
  if(M&&M.kind==='bidRes'){const h=roadRowHTML(s,M);el.classList.add('road');if(el._h!==h){el._h=h;el.innerHTML=h}return}
  el.classList.remove('road');
  const ids0=P.hand.filter(id=>id>=0).sort((a,b)=>cinfo(b).strength-cinfo(a).strength||a-b);
  // cards keep their slot while the hand only shrinks (no reflow under the next tap); a new card or a new round lays the hand out again
  const qk=G.q?G.q.kind:'';let HS=UI.handSlots;if(!HS||HS.round!==G.round||HS.seat!==s||HS.kind!==qk||ids0.some(id=>!HS.order.includes(id))||!ids0.length)HS=UI.handSlots={round:G.round,seat:s,kind:qk,order:ids0.slice()};
  const ids=HS.order;const inHand=new Set(ids0);
  const use=M&&M.use?M.use:new Set();const rcId=M&&M.rec&&M.rec.id!=null?M.rec.id:null;
  const PAD=16;const W=Math.max(160,(el.clientWidth||innerWidth)-8-2*PAD);const cw=cssPx('--cw',50),ch=Math.round(cw*1.4308);
  const n=ids.length,step=n>1?Math.min(cw+6,(W-cw)/(n-1)):0;const tot=n>1?cw+step*(n-1):cw;const off=Math.max(0,(W-tot)/2);
  let h='<div class="hand" role="list" aria-label="Your hand" style="height:'+(ch+24)+'px">';
  ids.forEach((id,i)=>{if(!inHand.has(id))return;const on=UI.hand===id,pl=use.has(id);const mid=(n-1)/2,rot=n>1?(i-mid)*Math.min(3.6,22/n):0,ty=n>1?Math.round(Math.pow(Math.abs(i-mid)/Math.max(1,mid),2)*4):0;
    h+='<button class="hc'+(on?' on':'')+(pl?' glow pl':'')+(rcId===id?' rg':'')+(use.size&&!pl?' dim':'')+'" role="listitem" data-a="hand" data-id="'+id+'" data-owner="'+s+'" data-up="1" style="left:'+Math.round(PAD+off+i*step)+'px;width:'+cw+'px;height:'+ch+'px;z-index:'+(on?50:i+1)+';--rot:'+rot.toFixed(1)+'deg;--ty:'+ty+'px" aria-label="'+esc(cinfo(id).name)+', strength '+cinfo(id).strength+'">'+cardEl(id,cw).outerHTML+'</button>'});
  h+='</div>';if(el._h!==h){el._h=h;el.innerHTML=h}}
// bid resolution: the Great Road lies where the hand was; tap a glowing Kingdom Card to take it (a steal asks first)
function roadRowHTML(s,M){const mv=M.mv;const take=mv.filter(m=>m.t==='take'),steal=mv.filter(m=>m.t==='steal');const V=UI.V;const items=[];
  for(let i=0;i<V.road.length;i++){const kc=V.road[i];if(!kc)continue;items.push({kc,m:take.find(x=>x.kc===kc&&x.i===i)||null})}
  for(const m of take)if(m.dk!=null)items.push({kc:m.kc,m,deck:1});
  for(const m of steal)items.push({kc:m.kc,m,steal:1});
  if(!items.length)return '<div class="hand roadrow"></div>';
  const W=Math.max(180,((UI.land?(($('#handw')||{}).clientWidth||innerWidth*.38):innerWidth))-12);const zone=cssPx('--ch',72)+24;const w=Math.max(34,Math.min(60,Math.floor((zone-30)/1.4308),Math.floor(W/items.length)-8));const rk=recK();
  return '<div class="hand roadrow" role="list" aria-label="The Great Road">'+items.map(it=>{const m=it.m;const rec=m&&rk===m.k;const col=it.steal?fcol(m.s2):'';
    const att=m?(it.steal?'data-a="confirm" data-k="'+esc(m.k)+'"':'data-a="mv" data-k="'+esc(m.k)+'"'):'data-a="kc" data-n="'+it.kc+'"';
    return '<button class="kcb'+(m?' glow':' dim')+(rec?' rg':'')+(it.steal?' steal':'')+'" role="listitem" '+att+' data-n="'+it.kc+'" style="width:'+(w+4)+'px'+(col?';--fc:'+col:'')+'"'+' aria-label="'+esc((it.steal?'Steal ':m?'Take ':'')+TB.kingdomInfo(it.kc).name)+'">'+kcEl(it.kc,w).outerHTML+'<span class="kn">'+esc(TB.kingdomInfo(it.kc).name)+'</span>'+(it.steal?'<i class="stl">'+ico('x')+'</i>':'')+'</button>'}).join('')+'</div>'}
// ---------------------------------------------------------------- the seats: score, hand and the face-down bid, along the top
function renderRivals(){const el=$('#rivals');if(!el)return;if(!G||!UI.V)return;const V=UI.V;
  const act=G.q?new Set(G.q.seats):new Set();const me=vs();const n=G.np;
  const top=Math.max(...V.pl.map(p=>p.inf));const lead=V.pl.filter(p=>p.inf===top).length===1&&top>0;
  const ev=UI.card&&UI.card.kind==='event'&&UI.card.ev.t==='bids'?UI.card:null;
  const bidNow=G.q&&G.q.kind==='bid';UI._bidSeen=UI._bidSeen||{};if(UI._bidRound!==G.round){UI._bidRound=G.round;UI._bidSeen={}}
  const chips=G.pl.map(p=>{const s=p.seat,P=V.pl[s];const kfac=TBKit.FACTIONS[FK[P.fac]];const turn=act.has(s)&&!ev;
    const favs=V.fav.h===s?'<span class="rv-f" title="Holds the Kingdom\'s Favour">'+ico('star')+'</span>':'';
    let bc='';const b=P.bid;
    if(b!=null&&b!==false){let up=b>=0&&G.bidRev;let flip='';
      if(ev){const rk=ev.rank?ev.rank.indexOf(s):-1;up=rk>=0&&rk<(ev.revN||0);flip=up&&rk===(ev.revN||0)-1?' flip':''}
      else if(s===me&&!G.bidRev)up=false;
      const isNew=!UI._bidSeen[s]&&bidNow&&s!==me;UI._bidSeen[s]=1;
      if(s===me&&!G.bidRev&&!ev)bc='';
      else if(up){const v=(G.bstr&&G.bstr[s]!=null&&G.bstr[s]>=0)?G.bstr[s]:(b>=0?cinfo(b).strength:'?');bc='<span class="bidc up'+flip+'" aria-label="Bid '+v+'"><b>'+v+'</b></span>'}
      else bc='<span class="bidc back'+(isNew?' new':'')+'" aria-label="Face-down bid"></span>'}
    const sb=P.supp&&P.supp.b?'<span class="rv-s" title="Supporters at home" aria-label="'+P.supp.b+' Supporters">'+ico('users')+P.supp.b+'</span>':'';
    return '<button class="rv'+(s===me?' me':'')+(turn?' turn':'')+'" data-a="rival" data-s="'+s+'" style="--fc:'+kfac.main+'" aria-label="'+esc(P.name)+': '+P.inf+' influence, '+P.hand.length+' cards in hand. Tap for details">'+
      '<span class="rv-e">'+emb(s,22)+'</span><span class="rv-t"><b>'+(s===me&&(NET.on||humans().length===1)?'You':esc(shortName(s).replace(' (you)','')))+(lead&&P.inf===top?' <span class="rv-l" title="In the lead">'+ico('crown')+'</span>':'')+'</b><small>'+ico('card')+P.hand.length+sb+'</small></span>'+bc+'<span class="rv-n" data-s="'+s+'">'+P.inf+'</span>'+favs+'</button>'}).join('');
  const h='<div class="race-c'+(n>2?' many':'')+(n>3?' four':'')+'">'+chips+'</div>';if(el._h!==h){el._h=h;el.innerHTML=h}}
// ---------------------------------------------------------------- pop-ups (live in the dock zone, never over the board)
function openPop(kind,arg){if(!G)return;if(typeof hideGloss==='function')hideGloss();UI.pop=kind;UI.popArg=arg||{};renderPop();applyHl();if(typeof bfFinger==='function')bfFinger();if(typeof sfx==='function')sfx('tap')}
function closePop(quiet){if(!UI.pop)return;UI.pop=null;UI.popArg=null;UI.hand=null;const p=$('#ppop');if(p){p.hidden=true;p.innerHTML=''}applyHl();if(typeof bfFinger==='function')bfFinger();if(!quiet)renderAll()}
function optsFor(s,id){if(s==null||s<0||!G.q||!G.q.seats.includes(s))return [];return legal(s).filter(m=>m.id===id||(typeof m.v==='number'&&m.v===id))}
function actLabel(m){if(m.t==='bid')return 'Bid with this card';if(m.t==='place')return 'Play face-down at '+REG[m.r];if(G.q.kind==='tie'&&m.id!=null)return 'Play face-down into the tied clash';if(m.t==='sel')return 'Choose this card';return m.label}
function popShell(title,body,cls){return '<div class="pp-h"><b>'+title+'</b><button class="pp-x" data-a="pclose" aria-label="Close">'+ico('x')+'</button></div><div class="pp-b '+(cls||'')+'">'+body+'</div>'}
function renderPop(){const el=$('#ppop');if(!el)return;
  if(!UI.pop||!G||(UI.card&&UI.card.kind!=='tip')){el.hidden=true;el.innerHTML='';return}
  const a=UI.popArg||{};let html='';
  try{switch(UI.pop){case 'confirm':html=confirmHTML(a.k);break;case 'card':html=popCard(a.id);break;case 'loc':html=popLoc(a.l);break;case 'region':html=popRegion(a.r);break;case 'rival':html=popRival(a.s);break;case 'kingdom':html=popKingdom();break;case 'kc':html=popKC(a.n);break;default:html=''}}catch(e){console.warn('pop',e.message);html=''}
  if(!html){el.hidden=true;return}
  const first=el.hidden;el.hidden=false;el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.innerHTML=html;if(first)el.classList.add('in');else el.classList.remove('in');
  el.dataset.kind=UI.pop;
  sizePopCard()}
function sizePopCard(){const el=$('#ppop');const c=el&&el.querySelector('.pp-card');if(!c)return;const W=el.clientWidth,H=el.clientHeight;
  const w=Math.max(96,Math.min(260,W*.42,(H-150)/1.4308));c.innerHTML='';c.appendChild(c.dataset.kc!=null?kcEl(+c.dataset.kc,w):cardEl(+c.dataset.cid,w))}
function popCard(id){const s=vs();const i=cinfo(id);const mine=ownerOf(id)===s;const acts=mine?optsFor(s,id):[];const rec=mine&&UI._rec&&G.q?UI._rec:null;let h='';
  if(acts.length){h+='<div class="pp-act">';for(const m of acts.slice(0,10)){const isRec=UI._recShown&&rec&&rec.k===m.k;h+='<button class="btn'+(isRec?' pri':'')+'" data-a="mv" data-k="'+esc(m.k)+'">'+esc(actLabel(m))+(isRec?' (suggested)':'')+'</button>'}
    h+='</div>'}
  else if(mine)h+='<p class="hint">Nothing to do with this card right now.</p>';
  h+='<div class="pp-row"><div class="pp-card" data-cid="'+id+'" data-owner="'+ownerOf(id)+'"'+(mine?' data-up="1"':'')+'></div><div class="pp-info"><h4>'+esc(i.name)+'</h4>'+cardDetail(id)+'</div></div>';
  if(i.kind==='hq')h+='<p class="hint">'+gloss('An HQ card is not a card for your hand: once bought it stays in front of you as a permanent power.')+'</p>';
  return popShell(esc(i.name),h,'pc-b')}
function popKC(n){const k=TB.kingdomInfo(n);let who='';for(const P of G.pl){P.ks.forEach((T,j)=>{if(T&&T.kc===n)who='Held by '+P.name+(T.occ!=null&&UI.V.pl[P.seat].ks[j].occ>=0&&false?'':'')+'.'});if(P.sup.includes(n))who='In '+P.name+'\'s Supply.'}
  if(G.road.includes(n))who='On the Great Road.';
  return popShell(esc(k.name),'<div class="pp-row"><div class="pp-card" data-kc="'+n+'"></div><div class="pp-info"><h4>'+esc(k.name)+'</h4><p class="cd-tx">'+gloss(k.text)+'</p><p class="cd-stat">'+gloss(SUIT_N[k.suit]+' suit · '+({board:'sits on your board, with a card tucked under it',supply:'goes to your Supply',region:'placed on a region',loc:'placed on a location','none':'one-shot'}[k.place]||k.place))+'</p><p class="hint">'+who+'</p></div></div>')}
function heraldChips(l){const o=G.pl.filter(p=>p.herald===l);return o.length?o.map(p=>'<span class="hchip" style="--fc:'+fcol(p.seat)+'">'+esc(shortName(p.seat))+'</span>').join(' '):'<em>none yet</em>'}
function popLoc(l){const s=vs();const L=DD.LOCS[l],V=UI.V;const q=G.q;let h='';
  h+='<p class="lc-r">'+esc(REG[l>>1])+' · reward <b>+'+L[2]+' Influence</b></p>';
  h+='<p class="lc-x">'+(L[3]?gloss(shortT(L[3])):'Plain Influence only')+'</p>';
  h+='<p class="lc-h"><b>Heralds here:</b> '+heraldChips(l)+'</p>';
  const mk=V.pl.map((p,i)=>p.mk[l]?esc(shortName(i))+' '+p.mk[l]:'').filter(Boolean);if(mk.length)h+='<p class="lc-h"><b>Whisper markers:</b> '+mk.join(', ')+'</p>';
  if(V.loc[l].kc.length)h+='<p class="lc-h"><b>Kingdom Cards here:</b> '+V.loc[l].kc.map(k=>esc(TB.kingdomInfo(k.n).name)+' ('+esc(nameOf(k.o))+')').join(', ')+'</p>';
  if(l===2)h+='<p class="lc-h"><b>Favour:</b> '+(V.fav.h>=0?esc(nameOf(V.fav.h))+' holds it ('+V.fav.u+' uses left)':'on the board')+'</p>';
  const mv=s>=0&&q&&q.seats.includes(s)&&!G.pl[s].ai?legal(s):[];const info=h;h='';
  if(q&&q.kind==='herald'){const m=mv.find(x=>x.loc===l);if(m){const rec=recK()===m.k;h+='<div class="pp-act"><button class="btn pri" data-a="mv" data-k="'+esc(m.k)+'">Place my Herald here'+(rec?' (recommended)':'')+'</button></div>';h+='<p class="why">'+ico('star')+'<span><b>'+(rec?'Why this one':'Think about it')+':</b> '+gloss(whyFor(s,m))+'</span></p>'}}
  else if(q&&q.kind==='location'){const m=mv.find(x=>x.loc===l);if(m){const rec=recK()===m.k;h+='<div class="pp-act"><button class="btn pri" data-a="mv" data-k="'+esc(m.k)+'">Claim '+esc(LOCN[l])+(rec?' (recommended)':'')+'</button></div>'}}
  else if(q&&(q.kind==='place'||q.kind==='tie')&&mv.some(x=>x.r===l>>1)){h+='<p class="lc-h"><b>Play a face-down card in '+esc(REG[l>>1])+':</b></p>'+cardPicker(s,mv.filter(x=>x.r===l>>1||q.kind==='tie'))}
  return popShell(esc(LOCN[l]),h+info,'loc-b')}
function cardPicker(s,mv){const ids=[...new Set(mv.filter(m=>m.id!=null).map(m=>m.id))];return '<div class="picker">'+ids.map(id=>'<button class="hc pk" data-a="hand" data-id="'+id+'" data-owner="'+s+'" data-up="1" aria-label="'+esc(cinfo(id).name)+'">'+cardEl(id,52).outerHTML+'</button>').join('')+'</div>'}
function popRegion(r){const s=vs(),V=UI.V,q=G.q;let h='';
  h+='<p class="lc-r">Locations: <button class="lk" data-a="loc" data-l="'+2*r+'">'+esc(LOCN[2*r])+'</button> and <button class="lk" data-a="loc" data-l="'+(2*r+1)+'">'+esc(LOCN[2*r+1])+'</button></p>';
  const ci=V.cord.indexOf(r);h+='<p class="lc-h">'+(ci>=0?'Clash marker '+['I','II','III'][ci]+(V.reg[r].done?' (resolved)':''):'Clash order not set yet')+'</p>';
  h+='<div class="rg">';for(const p of V.pl){const t=p.seat;const up=V.reg[r].up.filter(id=>ownerOf(id)===t),dn=V.reg[r].down.filter(id=>ownerOf(id)===t);const sp=p.supp.r[r]+p.supp.x[r];
    h+='<div class="rg-r" style="--fc:'+fcol(t)+'"><b>'+esc(shortName(t))+'</b><span class="rg-c">'+up.map(id=>'<span class="th">'+cardEl(id,40).outerHTML+'</span>').join('')+
      dn.map(id=>id>=0?'<span class="th dn"'+(t===s?' data-owner="'+t+'" data-up="1"':'')+' title="A face-down card you may see">'+cardEl(id,40).outerHTML+'</span>':'<span class="th dn" title="Face-down card">'+TBKit.cardBack(FK[p.fac],40).outerHTML+'</span>').join('')+(!up.length&&!dn.length?'<em>no cards</em>':'')+'</span>'+(sp?'<span class="rg-s">'+sp+' supporter'+(sp>1?'s':'')+'</span>':'')+'</div>'}
  h+='</div>';const mv=s>=0&&q&&q.seats.includes(s)&&!G.pl[s].ai?legal(s):[];
  if(q&&(q.kind==='place'||q.kind==='tie')&&mv.some(x=>x.r===r||q.kind==='tie'))h+='<p class="lc-h"><b>Play a face-down card here:</b></p>'+cardPicker(s,mv.filter(x=>x.r===r||q.kind==='tie'));
  return popShell(esc(REG[r]),h,'reg-b')}
function popRival(s){const V=UI.V,P=V.pl[s],f=TBKit.FACTIONS[FK[P.fac]];let h='';
  h+='<div class="rv-top" style="--fc:'+f.main+'"><span>'+emb(s,40)+'</span><div><b>'+esc(f.name)+'</b><br><small>'+esc(DD.FBLURB[P.fac])+'</small></div></div>';
  h+='<ul class="kv"><li><b>Influence</b> '+P.inf+'</li><li><b>Cards in hand</b> '+P.hand.length+' (limit '+P.hs+')</li><li><b>Deck / Discard / Lost</b> '+P.deck.length+' / '+P.disc.length+' / '+V.lost.filter(id=>ownerOf(id)===s).length+'</li><li><b>Lore</b> '+P.lore+'</li><li><b>Supporters</b> '+P.supp.b+' at home, '+(P.supp.r.reduce((a,b)=>a+b,0)+P.supp.x.reduce((a,b)=>a+b,0))+' on the map, '+P.supp.l+' lost</li>'+(V.fav.h===s?'<li><b>Kingdom\'s Favour</b> '+V.fav.u+' uses left</li>':'')+'</ul>';
  const ks=P.ks.map((T,j)=>T?'<button class="lk" data-a="kc" data-n="'+T.kc+'">'+esc(TB.kingdomInfo(T.kc).name)+'</button>':'').filter(Boolean).concat(P.sup.map(n=>'<button class="lk" data-a="kc" data-n="'+n+'">'+esc(TB.kingdomInfo(n).name)+' (Supply)</button>'));
  h+='<p class="lc-h"><b>Kingdom Cards:</b> '+(ks.join(', ')||'<em>none</em>')+'</p>';
  h+='<p class="lc-h"><b>Councils (votes):</b> '+DD.COUNCILS.map(c=>SUIT_N[c]+' '+TB.votes(G,s,c)).join(' · ')+'</p>';
  h+='<p class="lc-h"><b>'+gloss('Tactics')+':</b></p><ul class="tacl">'+DD.TACTICS[P.fac].map((t,i)=>'<li class="tac'+(P.tac[i].burn?' burn':P.tac[i].ex?' ex':'')+'"><b>'+esc(t.nm)+'</b> <small>'+(P.tac[i].burn?'burned':P.tac[i].ex?'used up':t.mk>0?P.tac[i].mk+' use'+(P.tac[i].mk===1?'':'s')+' left, once a round':'once per game')+'</small><br>'+gloss(t.txt.replace(/^SETUP[^.]*\.\s*/,''))+'</li>').join('')+'</ul>';
  h+='<p class="lc-h"><b>Site of Power:</b> '+(P.site.length?P.site.map(id=>esc(TB.cardName(G,id))+' ('+cinfo(id).cost+')').join(', '):'<em>empty</em>')+(P.hq.length?'. HQ: '+P.hq.map(id=>esc(TB.cardName(G,id))).join(', '):'')+'</p>';
  h+='<p class="lc-h"><b>'+gloss('Favour')+' power:</b> '+esc(DD.FAVOUR[P.fac].nm)+': '+gloss(DD.FAVOUR[P.fac].txt)+'</p>';
  return popShell(esc(P.name),h,'rv-b')}
function popKingdom(){const V=UI.V;let h='';
  h+='<h5>The Great Road</h5><div class="road4">'+V.road.map(n=>n?'<button class="kcth" data-a="kc" data-n="'+n+'" aria-label="'+esc(TB.kingdomInfo(n).name)+'">'+kcEl(n,52).outerHTML+'</button>':'<span class="kcth empty"></span>').join('')+'</div><p class="hint">Kingdom Card deck: '+V.kdeck.length+' left. Tap a card to read it.</p>';
  h+='<h5>Councils</h5>';for(const c of DD.COUNCILS){const ids=V.council[c];h+='<p class="lc-h"><b>'+esc(DD.COUNCIL_NAMES[c])+'</b>: '+(ids.length?ids.map(id=>esc(TB.cardName(G,id))+' ('+esc(shortName(ownerOf(id)))+', '+cinfo(id).votes+')').join(', '):'<em>empty</em>')+'</p><p class="small">'+esc(DD.COUNCIL_TXT[c])+'</p>'}
  h+='<h5>Favour and order</h5><p class="lc-h">Favour: '+(V.fav.h>=0?esc(nameOf(V.fav.h))+' ('+V.fav.u+' uses left)':'on the Gleaning Meadow')+'</p><p class="lc-h">Order this round: '+V.order.map((s,i)=>(i+1)+'. '+esc(shortName(s))).join(', ')+'</p><p class="lc-h">Lost Pile: '+V.lost.length+' card'+(V.lost.length===1?'':'s')+'.</p>';
  return popShell('The Kingdom',h,'kg-b')}
// ---------------------------------------------------------------- the one card (events, pass the device, coach tips, game over)
function shouldShowEvent(ev){if(ev.t==='clash')return true;if(ev.t==='bids')return true;if(ev.t==='summary')return true;if(ev.t==='news')return wantNews();return false}
function showEvent(ev){if(ev.t==='news'){showNews(ev);return}UI.card={kind:'event',ev};if(ev.t==='clash'){UI.noAnim=true}}
function showOver(){if(UI.card&&UI.card.kind==='over')return;UI.card={kind:'over'};clearSave();if(typeof campOver==='function')campOver()}
const TIPS={bid:['Bids','Every round starts with a secret bid. The highest bid picks a Kingdom Card first; the card you bid then sits under it and cannot fight.'],
  herald:['Heralds','Your Herald is public. If you win a region and claim the location where your Herald stands, you gain +1 Influence and take 1 from every rival Herald there.'],
  place:['Hidden cards','You hide one card at each of the three regions. Put big cards where the prize matters and cheap ones elsewhere.'],
  menu:['Actions','Supporters add +1 Strength each in a region\'s first Clash. Open the list for other actions, or finish the step.'],
  clashOrder:['Clash order','The player with the least Influence chooses the order of the three Clashes.'],
  location:['Winning','The winner claims one of the region\'s two locations: its Influence and its bonus.'],
  bidRes:['Your bid','Take a Kingdom Card from the Great Road, steal one a rival holds (your bid must beat the card under it), or take your card back.']};
function maybeTip(){return typeof coachGate==='function'&&coachGate()}
function renderCard(){const el=$('#pc');if(!el)return;const c=UI.card;
  // events, news and bids are played on the board itself (see bfEvent); only the pass screen and the final result use the card layer
  if(c&&(c.kind==='event'||c.kind==='news')){el.hidden=true;el.innerHTML='';UI._cardKey=null;if(!c._st){c._st=1;if(c.kind==='event')bfEvent(c);else bfNews(c)}return}
  if(!c){el.hidden=true;el.innerHTML='';UI._cardKey=null;return}
  const key=JSON.stringify([c.kind,c.seat,c.k]);
  if(UI._cardKey===key&&!el.hidden)return;UI._cardKey=key;
  el.hidden=false;el.classList.remove('in');void el.offsetWidth;el.classList.add('in');el.dataset.kind=c.kind;
  let h='';
  if(c.kind==='pass'){const s=c.seat;h='<div class="cd cd-pass" style="--fc:'+fcol(s)+'"><div class="cd-sc"><div class="cd-e">'+emb(s,56)+'</div><h3>Pass the device to '+esc(nameOf(s))+'</h3><p>Everyone else look away.</p></div><div class="cd-ft"><button class="btn pri big" data-a="take" data-s="'+s+'">I am '+esc(shortName(s))+': show my cards</button></div></div>'}
  else if(c.kind==='over'){h=overHTML()}
  el.innerHTML=h;
  const b=el.querySelector('.btn.pri');if(b)try{b.focus({preventScroll:true})}catch(e){}}
function cdWrap(cls,body,foot){return '<div class="cd '+cls+'"><div class="cd-sc">'+body+'</div><div class="cd-ft">'+foot+'</div></div>'}
function bidWhy(b){const pr=cinfo(b.id).strength;if(b.str===pr)return '';const ed=G.log.filter(e=>e.r===G.round&&/Crown's Edict/.test(e.t)&&/plays/.test(e.t));
  if(b.str===0&&pr>0&&ed.length)return 'printed '+pr+', set to 0 by '+plain(ed[ed.length-1].t.replace(/ plays .*$/,''))+'\'s Crown\'s Edict';if(b.str===pr+5)return 'printed '+pr+', +5 from Sentinel Towers';return 'printed '+pr}
// the strength breakdown of one side of a Clash: every part is labelled and the parts add up to the total
function brkHTML(ev,s){const B=(ev.brk&&ev.brk[s])||null;const dead=(ev.dead&&ev.dead[s])||[];let h='<ul class="bk">';
  if(B){for(const x of B)h+='<li><span>'+gloss(x.l)+'</span><i>'+(x.n<0?'−'+(-x.n):'+'+x.n)+'</i></li>';if(!B.length)h+='<li><span>no cards, no Supporters</span><i>0</i></li>'}
  else{for(const id of (ev.cardsF&&ev.cardsF[s])||[])h+='<li><span>'+esc(TB.cardName(G,id))+'</span><i>+'+cinfo(id).strength+'</i></li>';if(ev.supp&&ev.supp[s])h+='<li><span>'+ev.supp[s]+' Supporters</span><i>+'+ev.supp[s]+'</i></li>'}
  for(const id of dead)h+='<li class="dead"><span>'+esc(TB.cardName(G,id))+' (eliminated)</span><i>0</i></li>';
  return h+'<li class="tot"><span>Total</span><i>'+ev.tot[s]+'</i></li></ul>'}
function eventHTML(ev){const note=typeof coachEvent==='function'?coachEvent(ev):'';const cn=note?'<p class="coach">'+gloss(note)+'</p>':'';const me=vs();
  if(ev.t==='bids'){const rows=ev.bids.slice().sort((a,b)=>b.str-a.str||ev.order.indexOf(a.seat)-ev.order.indexOf(b.seat));
    return cdWrap('cd-bids','<h3>Bids revealed</h3>'+(cn?'':'<p class="sub">'+gloss('Highest bid chooses first')+'</p>')+'<div class="bidrow">'+rows.map((b,i)=>{const w=bidWhy(b);return '<div class="bd" style="--fc:'+fcol(b.seat)+'"><span class="bd-n">'+(i+1)+'</span><span class="bd-c">'+TBKit.card(cardSpec(b.id),UI.phone?(UI.short?40:52):64).outerHTML+'</span><span class="bd-t"><b>'+esc(b.seat===me?'You':shortName(b.seat))+'</b><small>'+esc(TB.cardName(G,b.id))+'</small><i>'+b.str+'</i>'+(w?'<small class="bd-w">'+gloss(w)+'</small>':'')+'</span></div>'}).join('')+'</div>'+cn,'<button class="btn pri" data-a="evok">Continue</button>')}
  if(ev.t==='clash'){const w=ev.winner,tie=w<0;const parts=youFirst(ev.parts);
    const names=parts.map(s=>'<b>'+esc(s===me?'You':sideName(s))+'</b> '+ev.tot[s]).join(' · ');
    const res=tie?'A tie: '+names+'. Nobody wins here yet.':(w===me?'<b>You win</b> '+esc(REG[ev.r])+': '+names+'.':'<b>'+esc(sideName(w))+'</b> wins '+esc(REG[ev.r])+': '+names+'.');
    const night=(ev.logs||[]).filter(t=>!/^(.* reveals |Strength in |Clash [IV]+: |.* wins the Clash|Tie in |Added cards are revealed)/.test(t)).slice(0,10).map(t=>'<li class="'+(/[Ee]liminat/.test(t)&&!/Invulnerable/.test(t)?'warn':'')+'">'+gloss(plain(t))+'</li>').join('');
    return cdWrap('cd-clash','<h3>Clash '+(ev.idx>=0?['I','II','III'][ev.idx]:'')+': '+esc(REG[ev.r])+(ev.n>1?' (replay)':'')+'</h3><div class="cl-panel" id="clp"></div><p class="cl-res" id="clres" hidden>'+res+'</p>'+
      '<div class="bkg'+(parts.length>2?' stack':'')+'" id="clbk" hidden>'+parts.map(s=>'<div class="bks'+(w===s?' win':'')+'" style="--fc:'+fcol(s)+'"><b>'+esc(s===me?'You':sideName(s))+'</b>'+brkHTML(ev,s)+'</div>').join('')+'</div>'+
      (night?'<ul class="cl-log" id="cllog" hidden><li class="cl-h">In this Clash</li>'+night+'</ul>':'<ul id="cllog" hidden></ul>')+cn+'<div class="cl-inf" id="clinf" hidden>'+infChips(ev.inf0,ev.inf1)+'</div>','<button class="btn pri" data-a="evok" id="clok" hidden>Continue</button>')}
  if(ev.t==='summary'){const why=ev.why||[];const order=youFirst(ev.inf1.map((_,s)=>s));
    return cdWrap('cd-sum','<h3>End of round '+ev.round+' of '+ev.rounds+'</h3><table class="sumt"><thead><tr><th></th><th>This round</th><th>Total</th></tr></thead><tbody>'+order.map(s=>{const v=ev.inf1[s];const L=why[s]||[];return '<tr style="--fc:'+fcol(s)+'"><td><b>'+esc(s===me?'You':sideName(s))+'</b></td><td>'+sgn(v-ev.inf0[s])+'</td><td><b>'+v+'</b></td></tr>'+(L.length?'<tr class="sw"><td colspan="3">'+L.map(x=>gloss(x[0])+' '+(x[1]>0?'+':'−')+Math.abs(x[1])).join(', ')+'</td></tr>':'')}).join('')+'</tbody></table>'+cn+
      ((ev.winter&&ev.winter.length)||ev.warns.length?'<ul class="cl-log warn">'+ev.warns.concat(ev.winter||[]).filter(t=>!/Winter: .* played cards/.test(t)||true).map(t=>'<li>'+gloss(plain(t))+'</li>').join('')+'</ul>':'')+
      '<p class="sub">'+(ev.last?'That was the last round: the final count follows.':gloss('Next round everyone refills their hand. The leader on the Order Track acts first. '+(ev.rounds-ev.round)+' round'+(ev.rounds-ev.round>1?'s':'')+' left.'))+'</p>','<button class="btn pri" data-a="evok">'+(ev.last?'See the result':'Start round '+(ev.round+1))+'</button>')}
  return ''}
function infChips(a,b){return a.map((v,s)=>b[s]!==v?'<span style="--fc:'+fcol(s)+'">'+esc(shortName(s))+' '+sgn(b[s]-v)+'</span>':'').join('')}
function playClash(ev,root){const panel=root.querySelector('#clp');if(!panel)return;const w=ev.winner;
  const items=youFirst(ev.parts).map(s=>{const ids=(ev.cardsF&&ev.cardsF[s])||ev.cards[s]||[];const best=ids.slice().sort((a,b)=>cinfo(b).strength-cinfo(a).strength)[0];
    const spec=best!=null?cardSpec(best):{faction:FK[G.pl[s].fac],title:'No card',value:0,type:'ploy',art:'banner',text:'No card fights here: only Supporters count.'};
    const dead=(ev.dead&&ev.dead[s])||[];const spec2=best==null&&dead.length?Object.assign(cardSpec(dead[0]),{text:'Eliminated at Night.'}):spec;
    return {faction:FK[G.pl[s].fac],name:(s===vs()?'You':sideName(s))+(ids.length>1?' · '+ids.length+' cards':'')+(best==null&&!dead.length?' · no card':best==null?' · card eliminated':''),card:best==null&&dead.length?spec2:spec,strength:ev.tot[s],winner:w===s}});
  const sc=root.querySelector('.cd-sc')||root;const hid=[...sc.children].filter(c=>c.hidden&&c.id!=='clok');hid.forEach(c=>c.hidden=false);let rest=0;for(const c of sc.children)if(c!==panel)rest+=c.offsetHeight+8;hid.forEach(c=>c.hidden=true);const sz=Math.max(62,Math.min(110,Math.floor((root.clientWidth-30)/Math.max(2,items.length))-14,Math.floor((sc.clientHeight-rest-30-50)/1.43/1.08)));
  const cp=TBKit.clashPanel(panel,items,{size:sz,tie:w<0});UI._cp=cp;
  const fin=()=>{['#clres','#clbk','#cllog','#clinf','#clok'].forEach(q=>{const e=root.querySelector(q);if(e)e.hidden=false});UI.clashRes[ev.r]={winner:w,tot:ev.tot};
    const b=root.querySelector('#clok');if(b)try{b.focus({preventScroll:true})}catch(e){}if(typeof sfx==='function')sfx(w<0?'tie':'win')};
  if(!ANIM){cp.el.querySelectorAll('.tb-flipcard').forEach(f=>f.classList.add('tb-up'));cp.el.querySelectorAll('.tb-clash-col').forEach(c=>c.classList.add('tb-shown'));fin();return}
  mapReveal(ev);
  setTimeout(()=>{const key=UI._cardKey;cp.play().then(()=>{if(UI._cardKey===key)fin()})},350)}
function overHTML(){const o=G.over;const rk=o.ranking;const win=o.winner;const me=vs();const iWon=(NET.on||humans().length===1)&&win===me;
  const head=iWon?'You win the throne!':esc(nameOf(win).replace(/^You$/,'You'))+' takes the throne';const nmS=s=>(s===me&&(NET.on||humans().length===1))?'You ('+sideName(s)+')':shortName(s);
  const body='<h3>'+head+'</h3><p class="sub">'+esc(DD.FNAME[G.pl[win].fac])+' ends with <b>'+G.pl[win].inf+'</b> Influence'+(o.tieBreak?' (tie broken by '+(o.tieBreak==='favour'?'the Kingdom\'s Favour':'turn order')+')':'')+'.</p><ol class="rank">'+rk.map((s,i)=>'<li style="--fc:'+fcol(s)+'"><b>'+(i+1)+'. '+esc(nmS(s))+'</b><span>'+G.pl[s].inf+' Influence'+(o.bonus&&o.bonus[s]?' <small>(+'+o.bonus[s]+' from the emptied Site of Power)</small>':'')+'</span></li>').join('')+'</ol>'+(typeof overBreakdown==='function'?overBreakdown():'');
  const foot=NET.on?(isHost()?'<button class="btn pri" data-a="again">Play again</button><button class="btn" data-a="netopen">Lobby</button>':'<button class="btn" data-a="netleave">Leave</button>'):'<button class="btn pri" data-a="again">Play again</button><button class="btn" data-a="menu">Main menu</button>';
  const gnote=typeof isGuided==='function'&&isGuided()?'<p class="coach">'+gloss('You have played a whole game. Next time try a full game from Play: choose the faction whose story you like, 3 players, 5 rounds. Suggestions show in rounds 1 and 2; after that tap Suggest a move when you want one.')+'</p>':'';
  return cdWrap('cd-over',body+gnote+(NET.on&&!isHost()?'<p class="sub">The host can start another game.</p>':''),foot)}
