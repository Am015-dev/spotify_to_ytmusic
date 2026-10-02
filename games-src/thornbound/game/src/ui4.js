// ===================== part 4: hand, rivals, pop-ups, one-at-a-time cards =====================
const emb=(s,w)=>TBKit.token('influence',{faction:fk(s)},w||26).outerHTML;
function isPassing(){return !!(UI.card&&UI.card.kind==='pass')}
// ---------------------------------------------------------------- hand strip (compact fan; tap a card -> enlarged pop-up)
function renderHand(){const el=$('#handw');if(!el)return;const s=vs();
  if(!G||s<0||isPassing()||G.over){el.innerHTML='';el.hidden=true;return}
  el.hidden=false;const V=UI.V,P=V.pl[s];const ids=P.hand.filter(id=>id>=0).sort((a,b)=>cinfo(b).strength-cinfo(a).strength||a-b);
  const mv=G.q&&G.q.seats.includes(s)&&!G.pl[s].ai?legal(s):[];const use=new Set();for(const m of mv){if(m.id!=null)use.add(m.id);if(m.v!=null&&typeof m.v==='number')use.add(m.v)}
  const W=Math.max(200,el.clientWidth||$('#dockbody').clientWidth||360)-8;const cw=UI.phone?(UI.land?50:56):66,ch=Math.round(cw*1.4308);
  const n=ids.length,step=n>1?Math.min(cw+6,(W-cw)/(n-1)):0;const tot=n>1?cw+step*(n-1):cw;const off=Math.max(0,(W-tot)/2);
  let h='<div class="hand-h"><span>Hand <b>'+ids.length+'</b>/'+P.hs+'</span><span>Deck '+P.deck.length+'</span><span>Discard '+P.disc.length+'</span>'+(P.lore?'<span>Lore '+P.lore+'</span>':'')+'</div>';
  h+='<div class="hand" role="list" aria-label="Your hand" style="height:'+(ch+14)+'px">';
  ids.forEach((id,i)=>{const on=UI.hand===id,pl=use.has(id);
    h+='<button class="hc'+(on?' on':'')+(pl?' pl':'')+(use.size&&!pl?' dim':'')+'" role="listitem" data-a="hand" data-id="'+id+'" data-owner="'+s+'" data-up="1" style="left:'+Math.round(off+i*step)+'px;width:'+cw+'px;height:'+ch+'px;z-index:'+(on?50:i+1)+'" aria-label="'+esc(cinfo(id).name)+', strength '+cinfo(id).strength+'">'+cardEl(id,cw).outerHTML+'</button>'});
  el.innerHTML=h+'</div>'}
// ---------------------------------------------------------------- rival chips
function renderRivals(){const el=$('#rivals');if(!el)return;const V=UI.V;const hot=UI.card&&UI.card.kind==='pass';
  const act=G.q?new Set(G.q.seats):new Set();const me=vs();
  const ordSeats=G.pl.map(p=>p.seat);
  el.innerHTML=ordSeats.map(s=>{const P=V.pl[s];const kfac=TBKit.FACTIONS[FK[P.fac]];const turn=act.has(s);
    const favs=V.fav.h===s?'<span class="rv-f" title="Holds the Kingdom\'s Favour ('+V.fav.u+' uses left)">'+ico('star')+'</span>':'';
    return '<button class="rv'+(s===me?' me':'')+(turn?' turn':'')+'" data-a="rival" data-s="'+s+'" style="--fc:'+kfac.main+'" aria-label="'+esc(P.name)+': '+P.inf+' influence, '+P.hand.length+' cards in hand. Tap for details">'+
      '<span class="rv-e">'+emb(s,26)+'</span><span class="rv-t"><b>'+esc(shortName(s).replace(' (you)',''))+(s===me&&(NET.on||humans().length===1)?' <u>you</u>':'')+'</b><small><i>'+P.inf+'</i> inf · '+P.hand.length+' cards</small></span>'+favs+'</button>'}).join('')}
// ---------------------------------------------------------------- pop-ups (live in the dock zone, never over the board)
function openPop(kind,arg){if(!G)return;UI.pop=kind;UI.popArg=arg||{};renderPop();applyHl();if(typeof sfx==='function')sfx('tap')}
function closePop(quiet){if(!UI.pop)return;UI.pop=null;UI.popArg=null;UI.hand=null;const p=$('#ppop');if(p){p.hidden=true;p.innerHTML=''}applyHl();if(!quiet)renderAll()}
function optsFor(s,id){if(s==null||s<0||!G.q||!G.q.seats.includes(s))return [];return legal(s).filter(m=>m.id===id||(typeof m.v==='number'&&m.v===id))}
function actLabel(m){if(m.t==='bid')return 'Bid with this card';if(m.t==='place')return 'Play face-down at '+REG[m.r];if(G.q.kind==='tie'&&m.id!=null)return 'Play face-down into the tied clash';if(m.t==='sel')return 'Choose this card';return m.label}
function popShell(title,body,cls){return '<div class="pp-h"><b>'+title+'</b><button class="pp-x" data-a="pclose" aria-label="Close">'+ico('x')+'</button></div><div class="pp-b '+(cls||'')+'">'+body+'</div>'}
function renderPop(){const el=$('#ppop');if(!el)return;
  if(!UI.pop||!G||(UI.card&&UI.card.kind!=='tip')){el.hidden=true;el.innerHTML='';return}
  const a=UI.popArg||{};let html='';
  try{switch(UI.pop){case 'card':html=popCard(a.id);break;case 'loc':html=popLoc(a.l);break;case 'region':html=popRegion(a.r);break;case 'rival':html=popRival(a.s);break;case 'kingdom':html=popKingdom();break;case 'kc':html=popKC(a.n);break;default:html=''}}catch(e){console.warn('pop',e.message);html=''}
  if(!html){el.hidden=true;return}
  const first=el.hidden;el.hidden=false;el.innerHTML=html;if(first)el.classList.add('in');else el.classList.remove('in');
  el.dataset.kind=UI.pop;
  sizePopCard()}
function sizePopCard(){const el=$('#ppop');const c=el&&el.querySelector('.pp-card');if(!c)return;const W=el.clientWidth,H=el.clientHeight;
  const w=Math.max(96,Math.min(260,W*.42,(H-150)/1.4308));c.innerHTML='';c.appendChild(c.dataset.kc!=null?kcEl(+c.dataset.kc,w):cardEl(+c.dataset.cid,w))}
function popCard(id){const s=vs();const i=cinfo(id);const mine=ownerOf(id)===s;const acts=mine?optsFor(s,id):[];const rec=mine&&UI._rec&&G.q?UI._rec:null;let h='';
  if(acts.length){h+='<div class="pp-act">';for(const m of acts.slice(0,10)){const isRec=rec&&rec.k===m.k;h+='<button class="btn'+(isRec?' pri':'')+'" data-a="mv" data-k="'+esc(m.k)+'">'+esc(actLabel(m))+(isRec?' (recommended)':'')+'</button>'}
    h+='</div>';if(rec&&acts.some(m=>m.k===rec.k))h+='<p class="why">'+ico('star')+'<span><b>Why:</b> '+esc(whyFor(s,rec))+'</span></p>';else if(rec&&G.q.kind==='bid')h+='<p class="why">'+ico('star')+'<span><b>Suggested instead:</b> '+esc(cinfo(rec.id).name)+'.</span></p>'}
  else if(mine)h+='<p class="hint">Nothing to do with this card right now.</p>';
  h+='<div class="pp-row"><div class="pp-card" data-cid="'+id+'" data-owner="'+ownerOf(id)+'"'+(mine?' data-up="1"':'')+'></div><div class="pp-info"><h4>'+esc(i.name)+'</h4>'+cardDetail(id)+'</div></div>';
  return popShell(esc(i.name),h,'pc-b')}
function popKC(n){const k=TB.kingdomInfo(n);let who='';for(const P of G.pl){P.ks.forEach((T,j)=>{if(T&&T.kc===n)who='Held by '+P.name+(T.occ!=null&&UI.V.pl[P.seat].ks[j].occ>=0&&false?'':'')+'.'});if(P.sup.includes(n))who='In '+P.name+'\'s Supply.'}
  if(G.road.includes(n))who='On the Great Road.';
  return popShell(esc(k.name),'<div class="pp-row"><div class="pp-card" data-kc="'+n+'"></div><div class="pp-info"><h4>'+esc(k.name)+'</h4><p class="cd-stat"><b>'+SUIT_N[k.suit]+' suit</b> · '+({board:'sits on your board',supply:'goes to your Supply',region:'placed on a region',loc:'placed on a location','none':'one-shot'}[k.place]||k.place)+'</p><p class="cd-tx">'+esc(k.text)+'</p><p class="hint">'+who+'</p></div></div>')}
function heraldChips(l){const o=G.pl.filter(p=>p.herald===l);return o.length?o.map(p=>'<span class="hchip" style="--fc:'+fcol(p.seat)+'">'+esc(shortName(p.seat))+'</span>').join(' '):'<em>none yet</em>'}
function popLoc(l){const s=vs();const L=DD.LOCS[l],V=UI.V;const q=G.q;let h='';
  h+='<p class="lc-r">'+esc(REG[l>>1])+' · reward <b>+'+L[2]+' Influence</b></p>';
  h+='<p class="lc-x">'+(L[3]?esc(L[3]):'Nothing else: this is the best plain Influence on the map.')+'</p>';
  h+='<p class="lc-h"><b>Heralds here:</b> '+heraldChips(l)+'</p>';
  const mk=V.pl.map((p,i)=>p.mk[l]?esc(shortName(i))+' '+p.mk[l]:'').filter(Boolean);if(mk.length)h+='<p class="lc-h"><b>Whisper markers:</b> '+mk.join(', ')+'</p>';
  if(V.loc[l].kc.length)h+='<p class="lc-h"><b>Kingdom Cards here:</b> '+V.loc[l].kc.map(k=>esc(TB.kingdomInfo(k.n).name)+' ('+esc(nameOf(k.o))+')').join(', ')+'</p>';
  if(l===2)h+='<p class="lc-h"><b>Favour:</b> '+(V.fav.h>=0?esc(nameOf(V.fav.h))+' holds it ('+V.fav.u+' uses left)':'on the board')+'</p>';
  const mv=s>=0&&q&&q.seats.includes(s)&&!G.pl[s].ai?legal(s):[];
  if(q&&q.kind==='herald'){const m=mv.find(x=>x.loc===l);if(m){const rec=recK()===m.k;h+='<div class="pp-act"><button class="btn pri" data-a="mv" data-k="'+esc(m.k)+'">Place my Herald here'+(rec?' (recommended)':'')+'</button></div>';h+='<p class="why">'+ico('star')+'<span><b>'+(rec?'Why this one':'Think about it')+':</b> '+esc(whyFor(s,m))+'</span></p>'}}
  else if(q&&q.kind==='location'){const m=mv.find(x=>x.loc===l);if(m){const rec=recK()===m.k;h+='<div class="pp-act"><button class="btn pri" data-a="mv" data-k="'+esc(m.k)+'">Claim '+esc(LOCN[l])+(rec?' (recommended)':'')+'</button></div>'}}
  else if(q&&(q.kind==='place'||q.kind==='tie')&&mv.some(x=>x.r===l>>1)){h+='<p class="lc-h"><b>Play a face-down card in '+esc(REG[l>>1])+':</b></p>'+cardPicker(s,mv.filter(x=>x.r===l>>1||q.kind==='tie'))}
  return popShell(esc(LOCN[l]),h,'loc-b')}
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
  h+='<p class="lc-h"><b>Tactics:</b> '+DD.TACTICS[P.fac].map((t,i)=>'<span class="tac'+(P.tac[i].burn?' burn':P.tac[i].ex?' ex':'')+'" title="'+esc(t.txt)+'">'+esc(t.nm)+(P.tac[i].burn?' (burned)':P.tac[i].ex?' (used)':'')+'</span>').join(' ')+'</p>';
  h+='<p class="lc-h"><b>Site of Power:</b> '+(P.site.length?P.site.map(id=>esc(TB.cardName(G,id))+' ('+cinfo(id).cost+')').join(', '):'<em>empty</em>')+(P.hq.length?'. HQ: '+P.hq.map(id=>esc(TB.cardName(G,id))).join(', '):'')+'</p>';
  h+='<p class="lc-h"><b>Favour action:</b> '+esc(DD.FAVOUR[P.fac].nm)+': '+esc(DD.FAVOUR[P.fac].txt)+'</p>';
  return popShell(esc(P.name),h,'rv-b')}
function popKingdom(){const V=UI.V;let h='';
  h+='<h5>The Great Road</h5><div class="road4">'+V.road.map(n=>n?'<button class="kcth" data-a="kc" data-n="'+n+'" aria-label="'+esc(TB.kingdomInfo(n).name)+'">'+kcEl(n,52).outerHTML+'</button>':'<span class="kcth empty"></span>').join('')+'</div><p class="hint">Kingdom Card deck: '+V.kdeck.length+' left. Tap a card to read it.</p>';
  h+='<h5>Councils</h5>';for(const c of DD.COUNCILS){const ids=V.council[c];h+='<p class="lc-h"><b>'+esc(DD.COUNCIL_NAMES[c])+'</b>: '+(ids.length?ids.map(id=>esc(TB.cardName(G,id))+' ('+esc(shortName(ownerOf(id)))+', '+cinfo(id).votes+')').join(', '):'<em>empty</em>')+'</p><p class="small">'+esc(DD.COUNCIL_TXT[c])+'</p>'}
  h+='<h5>Favour and order</h5><p class="lc-h">Favour: '+(V.fav.h>=0?esc(nameOf(V.fav.h))+' ('+V.fav.u+' uses left)':'on the Gleaning Meadow')+'</p><p class="lc-h">Order this round: '+V.order.map((s,i)=>(i+1)+'. '+esc(shortName(s))).join(', ')+'</p><p class="lc-h">Lost Pile: '+V.lost.length+' card'+(V.lost.length===1?'':'s')+'.</p>';
  return popShell('The Kingdom',h,'kg-b')}
// ---------------------------------------------------------------- the one card (events, pass the device, coach tips, game over)
function shouldShowEvent(ev){if(ev.t==='clash')return true;if(ev.t==='bids')return true;if(ev.t==='summary')return true;return false}
function showEvent(ev){UI.card={kind:'event',ev};if(ev.t==='clash'){UI.noAnim=true}}
function showOver(){if(UI.card&&UI.card.kind==='over')return;UI.card={kind:'over'};clearSave()}
const TIPS={bid:['Bids','Each round starts with a secret bid. Tap a hand card for its details, or use the suggested button. The strongest bid chooses first. Whatever Kingdom Card you take sits on your board with your bid card tucked under it.'],
  herald:['Heralds','Your Herald is public. Tap a location on the map to read its reward. Winning there pays you and steals from every rival Herald standing on it. A bluff is fine: place it where you do NOT plan to win, or where you do.'],
  place:['Face-down cards','Place one card next to each of the three regions. Nobody sees them until the clash. Put big cards where the prize matters and spare cards elsewhere.'],
  menu:['Actions','This list shows what your cards and Kingdom Cards allow right now. Sending Supporters adds +1 Strength each in a region (only the first clash there). Finish with the last button.'],
  clashOrder:['Clash order','The player furthest behind sets the order of the three clashes. Think about which region your rivals are weakest in.'],
  location:['Winning','The winner claims one of the region\'s two locations: its Influence plus a bonus effect. A Herald there is a swing of +1 for you and -1 for each rival Herald.'],
  bidRes:['Your bid','Take a Kingdom Card from the Great Road, steal one a rival holds (you need a strictly higher bid than their occupying card) or take your card back.']};
function maybeTip(){if(UI.guide!=='full'||!G.q)return false;const k=G.q.kind;if(UI.tip[k]||!TIPS[k])return false;UI.tip[k]=1;UI.card={kind:'tip',k};return true}
function renderCard(){const el=$('#pc');if(!el)return;const c=UI.card;
  if(!c){el.hidden=true;el.innerHTML='';UI._cardKey=null;return}
  const key=JSON.stringify(c.kind==='event'?[c.ev.t,c.ev.r,c.ev.n,c.ev.round]:[c.kind,c.seat,c.k]);
  if(UI._cardKey===key&&!el.hidden)return;UI._cardKey=key;
  el.hidden=false;el.classList.remove('in');void el.offsetWidth;el.classList.add('in');el.dataset.kind=c.kind==='event'?c.ev.t:c.kind;
  let h='';
  if(c.kind==='pass'){const s=c.seat;h='<div class="cd cd-pass" style="--fc:'+fcol(s)+'"><div class="cd-e">'+emb(s,56)+'</div><h3>Pass the device to '+esc(nameOf(s))+'</h3><p>Everyone else look away. Your hand and face-down cards appear when you tap the button.</p><button class="btn pri big" data-a="take" data-s="'+s+'">I am '+esc(shortName(s))+'. Show my cards</button></div>'}
  else if(c.kind==='tip'){const t=TIPS[c.k];h='<div class="cd cd-tip"><h3>'+esc(t[0])+'</h3><p>'+esc(t[1])+'</p><div class="btnrow"><button class="btn pri" data-a="tipok">Got it</button><button class="btn" data-a="tipoff">Hide tips</button></div></div>'}
  else if(c.kind==='over'){h=overHTML()}
  else if(c.kind==='event')h=eventHTML(c.ev);
  el.innerHTML=h;
  if(c.kind==='event'&&c.ev.t==='clash')playClash(c.ev,el);
  const b=el.querySelector('.btn.pri');if(b)try{b.focus({preventScroll:true})}catch(e){}}
function eventHTML(ev){
  if(ev.t==='bids'){const rows=ev.bids.slice().sort((a,b)=>b.str-a.str||ev.order.indexOf(a.seat)-ev.order.indexOf(b.seat));
    return '<div class="cd cd-bids"><h3>Bids revealed</h3><p class="sub">Highest bid chooses first.</p><div class="bidrow">'+rows.map((b,i)=>'<div class="bd" style="--fc:'+fcol(b.seat)+'"><span class="bd-n">'+(i+1)+'</span><span class="bd-c">'+TBKit.card(cardSpec(b.id),UI.phone?52:64).outerHTML+'</span><span class="bd-t"><b>'+esc(shortName(b.seat))+'</b><small>'+esc(TB.cardName(G,b.id))+'</small><i>'+b.str+'</i></span></div>').join('')+'</div><button class="btn pri" data-a="evok">Continue</button></div>'}
  if(ev.t==='clash'){const w=ev.winner,tie=w<0;const names=ev.parts.map(s=>'<b>'+esc(shortName(s))+'</b> '+ev.tot[s]).join(' · ');
    return '<div class="cd cd-clash"><h3>Clash '+(ev.idx>=0?['I','II','III'][ev.idx]:'')+': '+esc(REG[ev.r])+(ev.n>1?' (new clash)':'')+'</h3><div class="cl-panel" id="clp"></div><p class="cl-res" id="clres" hidden>'+(tie?'Tied: '+names:'<b>'+esc(shortName(w))+'</b> wins, '+names)+'</p><ul class="cl-log" id="cllog" hidden>'+ev.logs.filter(t=>!/^(.* reveals |Strength in |Clash )/.test(t)).slice(0,9).map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul><div class="cl-inf" id="clinf" hidden>'+infChips(ev.inf0,ev.inf1)+'</div><button class="btn pri" data-a="evok" id="clok" hidden>Continue</button></div>'}
  if(ev.t==='summary'){return '<div class="cd cd-sum"><h3>End of round '+ev.round+(ev.last?' (the last)':'')+'</h3><table class="sumt"><thead><tr><th></th><th>This round</th><th>Total</th></tr></thead><tbody>'+ev.inf1.map((v,s)=>'<tr style="--fc:'+fcol(s)+'"><td><b>'+esc(shortName(s))+'</b></td><td>'+sgn(v-ev.inf0[s])+'</td><td><b>'+v+'</b></td></tr>').join('')+'</tbody></table>'+(ev.warns.length?'<ul class="cl-log warn">'+ev.warns.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul>':'')+'<p class="sub">'+(ev.last?'The final count follows.':'Next round the player with the most Influence picks first; Heralds go home and Supporters are lost.')+'</p><button class="btn pri" data-a="evok">'+(ev.last?'See the result':'Next round')+'</button></div>'}
  return ''}
function infChips(a,b){return a.map((v,s)=>b[s]!==v?'<span style="--fc:'+fcol(s)+'">'+esc(shortName(s))+' '+sgn(b[s]-v)+'</span>':'').join('')}
function playClash(ev,root){const panel=root.querySelector('#clp');if(!panel)return;const w=ev.winner;
  const items=ev.parts.map(s=>{const ids=(ev.cardsF&&ev.cardsF[s])||ev.cards[s]||[];const best=ids.slice().sort((a,b)=>cinfo(b).strength-cinfo(a).strength)[0];
    const spec=best!=null?cardSpec(best):{faction:FK[G.pl[s].fac],title:'Supporters only',value:0,type:'ploy',art:'banner',text:'No cards here: only Supporters count.'};
    return {faction:FK[G.pl[s].fac],name:shortName(s)+(ids.length>1?' (+'+(ids.length-1)+')':'')+(ev.supp[s]?' +'+ev.supp[s]+' sup.':''),card:spec,strength:ev.tot[s],winner:w===s}});
  const sz=Math.max(70,Math.min(110,Math.floor((root.clientWidth-30)/Math.max(2,items.length))-14,UI.land?84:110));
  const cp=TBKit.clashPanel(panel,items,{size:sz,tie:w<0});UI._cp=cp;
  const fin=()=>{['#clres','#cllog','#clinf','#clok'].forEach(q=>{const e=root.querySelector(q);if(e)e.hidden=false});UI.clashRes[ev.r]={winner:w,tot:ev.tot};
    const b=root.querySelector('#clok');if(b)try{b.focus({preventScroll:true})}catch(e){}if(typeof sfx==='function')sfx(w<0?'tie':'win')};
  if(!ANIM){cp.el.querySelectorAll('.tb-flipcard').forEach(f=>f.classList.add('tb-up'));cp.el.querySelectorAll('.tb-clash-col').forEach(c=>c.classList.add('tb-shown'));fin();return}
  mapReveal(ev);
  setTimeout(()=>{const key=UI._cardKey;cp.play().then(()=>{if(UI._cardKey===key)fin()})},350)}
function overHTML(){const o=G.over,sc=TB.scores(G);const rk=o.ranking;const win=o.winner;
  return '<div class="cd cd-over"><h3>'+(NET.on?(win===vs()?'You win the throne!':esc(nameOf(win))+' takes the throne'):humans().length&&!G.pl[win].ai&&humans().length===1?'You win the throne!':esc(nameOf(win))+' takes the throne')+'</h3><p class="sub">'+esc(DD.FNAME[G.pl[win].fac])+' ends with <b>'+G.pl[win].inf+'</b> Influence'+(o.tieBreak?' (tie broken by '+(o.tieBreak==='favour'?'the Kingdom\'s Favour':'turn order')+')':'')+'.</p><ol class="rank">'+rk.map((s,i)=>'<li style="--fc:'+fcol(s)+'"><b>'+esc(nameOf(s))+'</b><span>'+G.pl[s].inf+(o.bonus&&o.bonus[s]?' <small>(includes +'+o.bonus[s]+' from emptying the Site of Power)</small>':'')+'</span></li>').join('')+'</ol>'+(NET.on?(isHost()?'<div class="btnrow"><button class="btn pri" data-a="again">Play again</button><button class="btn" data-a="netopen">Lobby</button></div>':'<p class="sub">The host can start another game.</p><div class="btnrow"><button class="btn" data-a="netleave">Leave</button></div>'):'<div class="btnrow"><button class="btn pri" data-a="again">Play again</button><button class="btn" data-a="menu">Main menu</button></div>')+'</div>'}
