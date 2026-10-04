// ===================== part 8: cause and effect (news events), suggestions you can trust, teaching layers, previews =====================
// ---------------------------------------------------------------- teaching layers (guided game only; normal games show the full rules)
// round 1: cards, bids, Herald, hidden cards, Supporters, clashes, claiming. round 2 adds Lore, Sites of Power, Autumn and card abilities.
// round 3 adds Tactics, the Favour, Councils (Govern) and Kingdom Card powers.
const LAYER={1:{},2:{lore:1,site:1,autumn:1,cmd:1},3:{lore:1,site:1,autumn:1,cmd:1,tactic:1,favour:1,council:1,govern:1,kc:1}};
function layer(){if(!isGuided()||!G)return null;return LAYER[Math.min(3,Math.max(1,G.round))]}
function taught(kind){const L=layer();return !L||kind==='supp'||!!L[kind]}
function actKind(a){a=a||'';if(a==='supp')return 'supp';if(a==='journey')return 'lore';if(a==='govern')return 'govern';const p=a.split(':')[0];
  if(p==='t')return 'tactic';if(p==='fav')return 'favour';if(p==='council')return 'council';if(p==='cmd'||p==='card')return 'cmd';return 'kc'}
// options that cannot do anything useful right now are not shown (they stay legal for the engine)
function uselessAct(m){if(!G||!G.clash)return false;const open=[0,1,2].filter(r=>r!==G.clash.r&&!G.reg[r].done).length;
  if(m.a==='t:cln_t2'&&!open)return true;  // Flank for the Round, but no region is left to move to
  return false}
function visibleActs(mv){return mv.filter(m=>m.t!=='act'||(taught(actKind(m.a))&&!uselessAct(m)))}
// the guided Court plays the same layers: no Tactics, Favour or Kingdom Card powers (all optional) before round 3, so nothing appears that was not taught
(function(){const o=aiChoose;aiChoose=function(seat,level){const m=o(seat,level);try{if(isGuided()&&G.pl[seat].ai&&G.q&&G.round<3){const k=G.q.kind,L=legal(seat);
      if(k==='edict'){const n=L.find(x=>x.yes===0);if(n)return n}
      if(G.q.t==='menu'&&m&&m.t==='act'&&!taught(actKind(m.a))){const ok=L.filter(x=>x.t==='act'&&taught(actKind(x.a)));const d=L.find(x=>x.t==='done');return (m.a==='supp'?m:null)||ok.find(x=>x.a==='supp')||d||m}}}catch(e){}return m}})();
// ---------------------------------------------------------------- news: every engine log line becomes a short narrated event (computer moves) or an
// event card (anything that touches you: Influence, eliminations, steals, rivals' Tactics). The sentence is the log sentence, so the log matches.
function wantNews(){return !!ANIM&&!UI.noNews}
function touchesMe(e,me){if(me<0)return false;const m=e.m;if(!m)return e.s===me;if(m.s===me||m.v===me)return true;if(m.ids&&m.ids.some(id=>ownerOf(id)===me))return true;return false}
const BIGK=['inf','steal','elim','kcsteal','rm','inv','tac','fav'];
function newsItem(e,human,me){const t=e.t,m=e.m||{};
  if(/^(Strength in |Clash [IV]+: |The Thornbound Throne begins|Round \d+ of \d+ begins)/.test(t)||/ reveals /.test(t)||/ bids .*\(Strength/.test(t))return null;
  if(m.k==='rm'&&m.why==='Winter'||m.k==='supp')return null;            // listed on the end-of-round card
  if(m.k==='tally')return null;
  const mine=touchesMe(e,me);
  if(human&&e.s===me&&!['inf','steal','elim','kcsteal','inv'].includes(m.k))return null;   // your own plain choices are not narrated back to you
  const big=me>=0&&(mine&&BIGK.includes(m.k)||(m.k==='tac'||m.k==='fav'||m.k==='kcsteal')&&e.s!==me)||m.k==='elim'&&UI.mode==='watch';
  return {t:'news',at:e.i,s:e.s,text:t,k:m.k||'',big:!!big,mine,m:e.m||null}}
function newsSince(l0,seat){const me=vs();const human=seat!=null&&G.pl[seat]&&!G.pl[seat].ai;const out=[];for(const e of G.log){if(e.i<=l0)continue;const it=newsItem(e,human,me);if(it)out.push(it)}return out}
(function(){const o=doMove;doMove=function(mv){const q=G&&G.q?{kind:G.q.kind,t:G.q.t,title:G.q.title}:null;const l0=G?G.logN:0,e0=UI.evq.length,seat=mv&&mv.seat;
  const ok=o(mv);if(!ok||!G)return ok;
  const added=UI.evq.splice(e0);let news=[];
  if(wantNews()){news=newsSince(l0,seat);if(G.logN===l0&&q&&G.pl[seat]&&G.pl[seat].ai){const t=aiFallback(seat,q,mv);if(t)news.push({t:'news',at:l0+.1,s:seat,text:t,k:'narr',big:false})}}
  // eliminations inside a Clash are told on the Clash card itself (with the breakdown), not twice
  const cl=added.filter(e=>e.t==='clash').map(e=>e.r);news=news.filter(n=>!((n.k==='elim'||n.k==='inv')&&n.m&&cl.includes(n.m.r)));
  const all=added.concat(news).sort((a,b)=>(a.at||0)-(b.at||0));UI.evq.push(...all);return ok}})();
// news on an online client: the host sends only state, so the client narrates the new log lines it receives
function netNews(l0){if(!wantNews()||!G)return;const me=vs();for(const e of G.log){if(e.i<=l0)continue;const it=newsItem(e,false,me);if(it&&!(it.s===me&&!it.big))UI.evq.push(it)}}
function infK(it){return it.m&&(it.m.k==='inf'||it.m.k==='steal')}
function showNews(first){const items=[first];if(first.big&&infK(first)){while(UI.evq.length&&items.length<4){const n=UI.evq[0];if(n.t!=='news'||!n.big||!infK(n))break;items.push(UI.evq.shift())}}
  if(!first.big){while(UI.evq.length&&items.length<3){const n=UI.evq[0];if(n.t!=='news'||n.big||n.s!==first.s)break;items.push(UI.evq.shift())}}
  const c={kind:'news',items,big:first.big,id:(UI._nid=(UI._nid||0)+1)};UI.card=c;
  const dur=(first.big?3400:900+450*(items.length-1))/Math.max(1,Math.min(UI.speed||1,4));
  clearTimeout(UI._nt);UI._nt=setTimeout(()=>{if(UI.card===c){UI.card=null;pump()}},dur)}
function newsOk(){const c=UI.card;if(!c||c.kind!=='news')return;clearTimeout(UI._nt);UI.card=null;
  if(!c.big){UI.evq=UI.evq.filter(e=>!(e.t==='news'&&!e.big))}   // a tap skips the rest of the narration (cards that touch you still come)
  pump()}
const NEWSHEAD={inf:'Influence',steal:'Influence stolen',elim:'Eliminated',kcsteal:'Kingdom Card stolen',rm:'A card leaves play',inv:'Saved by Invulnerable',tac:'A Tactic',fav:'The Kingdom\'s Favour'};
function newsHead(it,items){const me=vs();if(items&&items.length>1&&items.every(infK)){const d={};for(const x of items){const m=x.m;if(m.k==='inf')d[m.s]=(d[m.s]||0)+m.n;else{d[m.s]=(d[m.s]||0)+m.n;d[m.v]=(d[m.v]||0)-m.n}}
    return Object.keys(d).filter(s=>d[s]).sort((a,b)=>(b==me)-(a==me)).map(s=>(+s===me?'You':sideName(+s))+' '+(d[s]>0?'+':'\u2212')+Math.abs(d[s])).join(' \u00b7 ')+' Influence'}
  const m=it.m||{};if(m.k==='inf')return (m.n>0?'+':'−')+Math.abs(m.n)+' Influence';if(m.k==='steal')return m.v===me?'−'+m.n+' Influence: stolen':'+'+m.n+' Influence: stolen';return NEWSHEAD[m.k]||'What happened'}
function renderNews(){const el=$('#news');if(!el)return;const c=UI.card;if(!c||c.kind!=='news'){if(!el.hidden){el.hidden=true;el.innerHTML=''}return}
  if(el.dataset.id===String(c.id)&&!el.hidden)return;el.dataset.id=c.id;el.hidden=false;const first=c.items[0];const col=first.s>=0&&G.pl[first.s]?fcol(first.s):'#e8c867';
  el.className='news'+(c.big?' big':'')+(first.mine?' mine':'');el.style.setProperty('--fc',col);
  el.innerHTML='<div class="nw" data-a="newsok" role="button" tabindex="0" aria-label="Continue">'+(c.big?'<b class="nw-h">'+esc(newsHead(first,c.items))+'</b>':'')+c.items.map(it=>'<p><i style="background:'+(it.s>=0&&G.pl[it.s]?fcol(it.s):'#777')+'"></i>'+gloss(plain(it.text))+'</p>').join('')+'<small class="nw-t">'+(c.big?'tap to continue':'tap to skip')+'</small><span class="nw-bar" style="animation-duration:'+((c.big?3400:900+450*(c.items.length-1))/Math.max(1,Math.min(UI.speed||1,4)))+'ms"></span></div>'}
// ---------------------------------------------------------------- previews: what the Night step and the tally give if nobody else acts
function preview(V){try{return TB.clashPreview(V||UI.V)}catch(e){return null}}
function sideName(s){return shortName(s).replace(' (you)','')}
function youFirst(parts){const me=vs();return parts.slice().sort((a,b)=>(b===me)-(a===me))}
function scoreLine(P){if(!P)return '';return youFirst(Object.keys(P.tot).map(Number)).map(s=>esc(s===vs()?'You':sideName(s))+' <b>'+P.tot[s]+'</b>').join(' · ')}
function previewHTML(P,title){if(!P)return '';const me=vs();let h='<div class="pv" aria-label="Clash preview">'+(title===''?'':'<p class="pv-t">'+esc(title||('Clash in '+REG[P.r]))+(P.skip?' (no Day or Night steps here)':'')+'</p>');
  h+='<div class="pv-g'+(Object.keys(P.tot).length>2?' stack':'')+'">'+youFirst(Object.keys(P.tot).map(Number)).map(s=>'<div class="pv-s'+(P.win.length===1&&P.win[0]===s?' win':'')+'" style="--fc:'+fcol(s)+'"><b>'+esc(s===me?'You':sideName(s))+'</b><ul>'+(P.brk[s]||[]).map(x=>'<li><span>'+gloss(x.l)+'</span><i>'+(x.n<0?'−'+(-x.n):(x.n>0?'+':'')+x.n)+'</i></li>').join('')+
    P.dead.filter(d=>ownerOf(d.id)===s).map(d=>'<li class="dead"><span>'+esc(TB.cardName(G,d.id))+'</span><i>'+TB.cardInfo(G,d.id).strength+'</i></li>').join('')+'</ul><p class="pv-tot">= '+P.tot[s]+'</p></div>').join('')+'</div>';
  for(const d of P.dead)h+='<p class="pv-n warn">'+ico('eye')+'<span>At Night: '+gloss(plain(d.t))+'.</span></p>';
  for(const d of P.saved)h+='<p class="pv-n">'+ico('eye')+'<span>'+gloss(plain(TB.cardName(G,d.id)+' is Invulnerable: it survives the Night'))+'.</span></p>';
  if(P.hidden)h+='<p class="pv-n">'+P.hidden+' face-down card'+(P.hidden>1?'s':'')+' added by Ambush will be revealed before the Night.</p>';
  if(P.watcher)h+='<p class="pv-n">'+gloss('A Rite of the Watcher is in this Clash: the lowest Strength above 0 wins.')+'</p>';
  const w=P.win;h+='<p class="pv-r">'+(w.length>1?'As it stands: a tie.':w[0]===me?'As it stands: <b>you win</b> this Clash.':'As it stands: <b>'+esc(sideName(w[0]))+'</b> wins this Clash.')+(G.q&&G.q.t==='menu'?' Rivals may still act.':'')+'</p>';
  return h+'</div>'}
function outcome(P,me){if(!P)return 0;return P.win.length===1?(P.win[0]===me?2:0):(P.win.includes(me)?1:0)}
// try one Day move on a copy of my own view: the resulting preview (sub-questions are tried option by option, one level deep)
function simDay(m){const me=vs();const tryOne=(V,mv)=>{const r=TB.apply(V,Object.assign({},mv,{seat:me}));if(!r.ok)return null;return V};
  let V=JSON.parse(JSON.stringify(UI.V));if(!tryOne(V,m))return null;
  if(V.q&&V.q.seats.includes(me)&&V.q.t!=='menu'){const subs=(V.q.o[me]||[]);let best=null;
    for(const sm of subs){if(sm.skip||sm.pass)continue;const W=JSON.parse(JSON.stringify(V));if(!tryOne(W,sm))continue;if(W.clash&&W.clash.added&&W.clash.added.length){for(const id of W.clash.added)if(id>=0&&ownerOf(id)===me){(W.clash.cards[me]=W.clash.cards[me]||[]).push(id)}}
      const P=preview(W);if(!P)continue;const sc=outcome(P,me)*100+(P.tot[me]-Math.max(0,...Object.keys(P.tot).filter(s=>+s!==me).map(s=>P.tot[s])));if(!best||sc>best.sc)best={sc,P,sub:sm}}return best}
  const P=preview(V);if(!P)return null;return {sc:outcome(P,me)*100+(P.tot[me]-Math.max(0,...Object.keys(P.tot).filter(s=>+s!==me).map(s=>P.tot[s]))),P}}
// ---------------------------------------------------------------- the advisor: a suggestion always comes with the reason that produced it
function advise(s,mv){if(!G||!G.q||!mv||!mv.length)return null;const q=G.q,k=q.kind;
  const coach=typeof coachRec==='function'?coachRec(s,mv):null;if(coach)return {m:coach,why:whyFor(s,coach)};
  if(q.t==='menu'){const ph=menuPhase(q);return ph==='Day'?adviseDay(s,mv):adviseMenu(s,mv,ph)}
  if(k==='occupier'){const ids=mv.filter(m=>m.id!=null).map(m=>m.id);if(!ids.length)return null;const sc=id=>{const i=cinfo(id);return i.strength*10+i.votes+i.lore};const w=ids.slice().sort((a,b)=>sc(a)-sc(b))[0];const m=mv.find(x=>x.id===w);
    return {m,why:cinfo(w).name+' ('+cinfo(w).strength+') is your weakest card: a card under a Kingdom Card cannot fight. (A stronger one would make the Kingdom Card harder to steal.)'}}
  if(k==='slot'||k==='order'||k==='applause'||k==='discardDown'||k==='discardPick')return null;
  if(k==='clashOrder')return adviseOrder(s,mv);
  const m=suggest(s);if(!m)return null;const why=reasonFor(s,m);return why?{m,why}:null}
function reasonFor(s,m){const q=G.q,k=q.kind;
  if(['bid','herald','place','tie','bidRes','location'].includes(k))return whyFor(s,m);
  if(k==='siteBuy'){if(m.t==='seldone')return 'Keep your Lore: '+(q.chosen&&q.chosen.length?'you have bought enough for now.':'nothing here is worth it yet.');const i=cinfo(m.v);return i.kind==='hq'?i.name+' is an HQ: a permanent power that stays in front of you (it never goes to your hand). '+lcFirst(i.text)+'.':i.name+' goes to your hand: Strength '+i.strength+(i.text?', and '+lcFirst(i.text):'')+'.'}
  if(k==='castle'||k==='wilderness'){if(m.skip)return 'Keep the card: it is worth more in your hand than this bonus.';return whyFor(s,m)}
  if(k==='harvest')return m.yes?'The Favour lets you use '+DD.FAVOUR[G.pl[s].fac].nm+' up to three times, and it breaks a tie at the end.':'';
  if(k==='helm')return m.yes?'Your eliminated card comes back to your hand instead of staying lost.':'';
  if(k==='placeLoc')return 'Whenever anyone claims '+LOCN[m.loc]+', you gain 1 Influence.';
  if(k==='flank'){const r=m.r;return 'The card moves to '+REG[r]+', which has not fought yet; it adds its Strength there.'}
  if(q.t==='sel'&&(k==='rally'||k==='brine')){if(m.t==='seldone')return 'That is enough cards back in your hand.';return cinfo(m.v).name+' ('+cinfo(m.v).strength+') comes back to your hand instead of going to the discard pile in Winter.'}
  if(q.t==='sel'&&(k==='shrine'||k==='ossuary')&&m.t==='seldone')return 'Keep your cards: nothing here needs to go.';
  if(k==='councilOut')return m.to==='hand'?'Back in your hand, the card can fight again next round.':'';
  return ''}   // not sure: no suggestion
function adviseOrder(s,mv){const me=s,V=UI.V;const known=r=>{let t=0;for(const id of V.reg[r].down)if(id>=0&&ownerOf(id)===me)t+=cinfo(id).strength;for(const id of V.reg[r].up)if(ownerOf(id)===me)t+=cinfo(id).strength;return t+V.pl[me].supp.r[r]};
  const rs=[0,1,2].sort((a,b)=>known(b)-known(a));const m=mv.find(x=>x.order&&x.order.join()===rs.join());if(!m)return null;
  return {m,why:'Your strongest region fights first ('+rs.map(r=>REG[r].replace('The ','')+' '+known(r)).join(', then ')+'), so a win there comes before rivals can move cards.'}}
function tacUses(seat,id){const i=DD.TACTICS[G.pl[seat].fac].findIndex(t=>t.id===id);if(i<0)return '';const def=DD.TACTICS[G.pl[seat].fac][i],t=G.pl[seat].tac[i];return def.mk>0?t.mk+' use'+(t.mk===1?'':'s')+' left, once a round':'once per game'}
const CPLAIN={relics:'when you claim your Herald Reward you may cash in your cards here for Influence equal to their votes.',secrets:'in Autumn you place markers on locations; four on one location claim its bonus.',oaths:'in Autumn you bring Supporters back to your board, one per vote (one more if you have the most votes there).'};
function adviseMenu(s,mv,ph){const m=suggest(s);if(!m)return null;if(m.t==='act'&&!taught(actKind(m.a)))return null;const a=m.a||'';
  // the last Autumn: only Influence still counts
  if(ph==='Autumn'&&G.round>=G.rounds&&m.t==='act'&&!/Influence/.test(m.label||'')&&!(a==='journey'&&!G.pl[s].site.length)){const d=mv.find(x=>x.t==='done');const inf=mv.find(x=>x.t==='act'&&/Influence/.test(x.label||'')&&taught(actKind(x.a)));
    if(inf)return {m:inf,why:'This is the last round: only Influence counts now. '+actWhy(s,inf)};return d?{m:d,why:'This is the last round: only Influence counts now, and nothing here gives Influence.'}:null}
  if(m.t==='done')return {m,why:ph==='Spring'?'Nothing here is worth spending this round.':'Nothing here gains you more than it costs.'};
  if(a==='supp'){const r=m.p.r,n=m.p.n;const mine=UI.V.reg[r].down.filter(id=>id>=0&&ownerOf(id)===s).map(id=>cinfo(id).strength);
    return {m,why:'Send '+n+' Supporter'+(n>1?'s':'')+' to '+REG[r]+': +'+n+' Strength in its first Clash'+(mine.length?' (your hidden card there has Strength '+mine.join('+')+')':'')+'. Supporters on the map go to the Lost Pile in Winter.'}}
  return {m,why:actWhy(s,m)}}
function actWhy(s,m){const a=m.a||'',L=(m.label||'').replace(/^[^:]*:\s*/,'');
  if(a.startsWith('t:'))return 'A Tactic ('+tacUses(s,a.slice(2))+'): '+lcFirst(L)+'.';
  if(a.startsWith('fav:'))return 'Your Favour ('+(G.fav.h===s?G.fav.u+' uses left':'')+'): '+lcFirst(L)+'.';
  if(a==='journey'){const id=m.p.id,l=cinfo(id).lore,P=G.pl[s];const mn=P.site.length?Math.min(...P.site.map(x=>cinfo(x).cost)):0;return '+'+l+' Lore (you would have '+(P.lore+l)+')'+(P.site.length?'; your cheapest Site of Power card costs '+mn+'.':'.')}
  if(a==='govern'){const c=m.p.c;return cinfo(m.p.id).votes+' vote'+(cinfo(m.p.id).votes>1?'s':'')+' into the '+DD.COUNCIL_NAMES[c]+': '+CPLAIN[c]}
  if(a==='cmd:rally')return 'Rally: the card goes back to your hand instead of the discard pile in Winter.';
  if(a==='cmd:deploy')return 'Deploy: the card stays on the map through Winter and fights there next round.';
  if(a==='council:oaths')return 'Council of Pledges: Supporters come back to your board for next round.';
  return lcFirst(L)?L.replace(/^./,c=>c.toUpperCase()).replace(/\.?$/,'.'):''}
function adviseDay(s,mv){const me=s;const P0=preview();if(!P0)return null;const o0=outcome(P0,me);const done=mv.find(m=>m.t==='done');
  const vsTxt=P=>youFirst(Object.keys(P.tot).map(Number)).map(x=>(x===me?'you ':sideName(x)+' ')+P.tot[x]).join(' vs ');
  if(o0===2)return done?{m:done,why:'You win this Clash as it stands ('+vsTxt(P0)+'), so keep your powers for later.'}:null;
  const acts=visibleActs(mv).filter(m=>m.t==='act');let best=null;
  for(const m of acts){if(/^fav:/.test(m.a)&&G.pl[me].fac==='clans')continue;const r=simDay(m);if(!r)continue;const o=outcome(r.P,me);if(o<=o0)continue;
    const cost=/discard|Discard/.test(m.label)?1:0;const sc=o*100-cost*5+(r.P.tot[me]||0)/100;if(!best||sc>best.sc)best={sc,m,P:r.P,sub:r.sub}}
  if(best){const name=(best.m.label||'').replace(/:.*$/,'');return {m:best.m,why:name+' changes this Clash: '+vsTxt(P0)+' now, '+vsTxt(best.P)+' after it'+(outcome(best.P,me)===2?' (you would win)':' (a tie)')+(best.sub&&best.sub.label?' ('+best.sub.label.replace(/^Move to /,'move to ')+')':'')+'.',P:best.P}}
  const dead=P0.dead.filter(d=>ownerOf(d.id)===me);
  const ret=acts.find(m=>m.a==='cmd:retreat');if(ret&&dead.length)return {m:ret,why:'You lose this Clash as it stands ('+vsTxt(P0)+') and '+TB.cardName(G,dead[0].id)+' would be eliminated: Retreat takes cards back to your hand.'};
  const fl=acts.find(m=>m.a==='cmd:flank'||m.a==='t:cln_t2');if(fl&&o0===0&&[0,1,2].some(r=>r!==G.clash.r&&!G.reg[r].done))return {m:fl,why:'You cannot win here ('+vsTxt(P0)+'): Flank moves the card to a region that has not fought yet, where it still counts.'};
  return done?{m:done,why:'Nothing you can do here changes the result ('+vsTxt(P0)+').',P:P0}:null}
// ---------------------------------------------------------------- confirm sheet: anything that resolves at once and can hurt shows "your N vs their M" first
function stealPreview(s,m){const P=G.pl[s],V=G.pl[m.s2],T=V.ks[m.j];if(!T)return '';const bid=G.bstr[s],crew=G.pl[s].ks.some(x=>x&&x.kc===9)?3:0;const theirs=cinfo(T.occ).strength+(V.ks.some(x=>x&&x.kc===5)?5:0);
  const zero=P.bid!=null&&cinfo(P.bid).text&&/treat the Occupying card's Strength as 0/.test(cinfo(P.bid).text);
  return 'Your bid '+bid+(crew?' + 3 (Cutthroat Crew) = '+(bid+crew):'')+' vs their '+esc(cinfo(T.occ).name)+' '+(zero?'0 (your card ignores it)':theirs)+': you take '+esc(TB.kingdomInfo(T.kc).name)+'. Their '+esc(cinfo(T.occ).name)+' goes back to their hand, and your bid card is tucked under it.'}
function confirmHTML(k){const s=viewSeatForQ();if(s==null)return '';const m=legal(s).find(x=>x.k===k);if(!m)return '';let body='';
  if(m.t==='steal')body='<p class="cf-p">'+stealPreview(s,m)+'</p>';
  else if(m.a==='t:cln_t3'){const T=G.pl[m.p.s2].ks[m.p.j];body='<p class="cf-p">'+gloss('Riverbank Raiders (a Tactic, once per game): take '+TB.kingdomInfo(T.kc).name+' from '+sideName(m.p.s2)+' with no Strength check. Their '+cinfo(T.occ).name+' goes back to their hand; you tuck a card from your hand under it.')+'</p>'}
  else body='<p class="cf-p">'+esc(m.label)+'</p>';
  return popShell('Before you do it','<div class="cf">'+body+'<div class="pp-act"><button class="btn pri" data-a="mv" data-k="'+esc(k)+'">'+esc(m.t==='steal'?'Steal it':'Do it')+'</button><button class="btn" data-a="pclose">Not now</button></div></div>','cf-b')}
