// ===================== part 11: help (gx-help kit): coach bubbles the first time, the lightbulb on demand =====================
// Bubbles: once per phase, short, pointing at the board. The bulb: the advisor's own move (UI.bf.sug, the same one the glowing suggestion uses) + a short why + rules cards.
// ---------------------------------------------------------------- pictures for the rules cards (inline SVG in the game's colours)
const HP={
 card:(n)=>'<svg viewBox="0 0 64 64"><rect x="14" y="5" width="36" height="54" rx="5" fill="#fbf1d2" stroke="#7a1f31" stroke-width="3"/><text x="32" y="40" text-anchor="middle" font-size="28" font-weight="800" fill="#7a1f31" font-family="Georgia,serif">'+n+'</text></svg>',
 back:()=>'<svg viewBox="0 0 64 64"><rect x="14" y="5" width="36" height="54" rx="5" fill="#7a1f31" stroke="#c99a35" stroke-width="3"/><path d="M32 16l11 16-11 16-11-16z" fill="none" stroke="#e8c867" stroke-width="3"/></svg>',
 crown:()=>'<svg viewBox="0 0 64 64"><path d="M8 48h48l-4-28-13 12-7-19-7 19-13-12z" fill="#e8c867" stroke="#8a6a1a" stroke-width="3" stroke-linejoin="round"/><rect x="8" y="48" width="48" height="6" rx="2" fill="#c99a35" stroke="#8a6a1a" stroke-width="2"/></svg>',
 kc:()=>'<svg viewBox="0 0 64 64"><rect x="14" y="5" width="36" height="54" rx="5" fill="#fbf1d2" stroke="#c99a35" stroke-width="3"/><path d="M20 38h24l-2-14-7 6-3-10-3 10-7-6z" fill="#e8c867" stroke="#8a6a1a" stroke-width="2" stroke-linejoin="round"/><path d="M22 46h20M22 51h14" stroke="#7a1f31" stroke-width="2.5" stroke-linecap="round"/></svg>',
 herald:()=>'<svg viewBox="0 0 64 64"><circle cx="32" cy="17" r="9" fill="#2f7a9a" stroke="#12384a" stroke-width="3"/><path d="M19 56Q32 18 45 56z" fill="#2f7a9a" stroke="#12384a" stroke-width="3" stroke-linejoin="round"/><path d="M32 8V2l10 3-10 3" fill="#c0392b" stroke="#7a1f31" stroke-width="1.5"/></svg>',
 swords:()=>'<svg viewBox="0 0 64 64"><path d="M12 12l36 36M52 12L16 48" stroke="#55412a" stroke-width="5" stroke-linecap="round"/><path d="M10 52l8-8M54 52l-8-8" stroke="#c99a35" stroke-width="6" stroke-linecap="round"/><path d="M20 38l6 6M44 38l-6 6" stroke="#c99a35" stroke-width="4" stroke-linecap="round"/></svg>',
 supp:()=>'<svg viewBox="0 0 64 64"><circle cx="32" cy="22" r="8" fill="#7a9a2f" stroke="#33430f" stroke-width="3"/><path d="M20 52Q32 24 44 52z" fill="#7a9a2f" stroke="#33430f" stroke-width="3" stroke-linejoin="round"/><text x="52" y="16" text-anchor="middle" font-size="16" font-weight="800" fill="#7a1f31" font-family="Georgia,serif">+1</text></svg>',
 region:()=>'<svg viewBox="0 0 64 64"><rect x="6" y="10" width="52" height="44" rx="10" fill="#8fb77a" stroke="#4b6b3a" stroke-width="3"/><circle cx="21" cy="26" r="8" fill="#e8c867" stroke="#8a6a1a" stroke-width="2.5"/><circle cx="43" cy="38" r="8" fill="#e8c867" stroke="#8a6a1a" stroke-width="2.5"/></svg>',
 loc:(t)=>'<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="22" fill="#e8c867" stroke="#8a6a1a" stroke-width="3"/><text x="32" y="40" text-anchor="middle" font-size="22" font-weight="800" fill="#7a1f31" font-family="Georgia,serif">'+(t||'+1')+'</text></svg>',
 scroll:()=>'<svg viewBox="0 0 64 64"><rect x="14" y="10" width="36" height="44" rx="4" fill="#fbf1d2" stroke="#8a6a1a" stroke-width="3"/><path d="M21 22h22M21 31h22M21 40h14" stroke="#7a1f31" stroke-width="3" stroke-linecap="round"/><circle cx="14" cy="10" r="5" fill="#c99a35"/><circle cx="50" cy="54" r="5" fill="#c99a35"/></svg>',
 gavel:()=>'<svg viewBox="0 0 64 64"><rect x="10" y="16" width="30" height="14" rx="3" transform="rotate(-30 25 23)" fill="#8a5a2a" stroke="#4a2f14" stroke-width="3"/><path d="M30 34l22 22" stroke="#4a2f14" stroke-width="7" stroke-linecap="round"/></svg>',
 star:()=>'<svg viewBox="0 0 64 64"><path d="M32 6l7.5 17 18.5 1.6-14 12 4.4 18.4L32 45l-16.4 10 4.4-18.4-14-12L24.5 23z" fill="#e8c867" stroke="#8a6a1a" stroke-width="3" stroke-linejoin="round"/></svg>',
 tap:()=>'<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="18" fill="rgba(122,31,49,.15)" stroke="#7a1f31" stroke-width="4"/><path d="M30 14v26l-6-5-4 4 14 14h14l4-20-8-2-4-4-4 1-2-4z" fill="#fff" stroke="#231a10" stroke-width="2.5" stroke-linejoin="round"/></svg>',
 pass:()=>'<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="22" fill="none" stroke="#7a1f31" stroke-width="5"/><path d="M16 48L48 16" stroke="#7a1f31" stroke-width="5"/></svg>',
 hand:()=>'<svg viewBox="0 0 64 64"><rect x="8" y="22" width="14" height="30" rx="3" transform="rotate(-18 15 37)" fill="#fbf1d2" stroke="#7a1f31" stroke-width="2.5"/><rect x="25" y="14" width="14" height="34" rx="3" fill="#fbf1d2" stroke="#7a1f31" stroke-width="2.5"/><rect x="42" y="22" width="14" height="30" rx="3" transform="rotate(18 49 37)" fill="#fbf1d2" stroke="#7a1f31" stroke-width="2.5"/></svg>'
};
function hpics(items){return '<div class="gxh-pics">'+items.map(it=>it==='>'?'<span class="gxh-ar">&rarr;</span>':'<figure>'+(HP[it[0]]?HP[it[0]](it[2]):'')+(it[1]?'<figcaption>'+it[1]+'</figcaption>':'')+'</figure>').join('')+'</div>'}
// ---------------------------------------------------------------- where each bubble points
const hq=s=>()=>document.querySelector(s);
const hfirst=(...sels)=>()=>{for(const s of sels){const e=document.querySelector(s);if(e&&e.getBoundingClientRect().width)return e}return null};
const HLP_STEPS={
 bid:{target:hq('#handw'),title:'Make a secret bid',text:'Tap a card, then the glowing spot. Highest bid picks first.',pic:()=>HP.back()},
 bidRes:{target:hq('#handw'),title:'Take a Kingdom Card',text:'Tap a glowing Kingdom Card for a lasting power. Or tap Keep my card.',pic:()=>HP.kc()},
 occupier:{target:hfirst('#handw'),title:'Tuck a card under',text:'Pick the hand card that sits under your new Kingdom Card. It cannot fight.',pic:()=>HP.back()},
 herald:{target:hfirst('.tb-loc.glow.rec .tb-ring','.tb-loc.glow .tb-ring'),title:'Place your Herald',text:'Tap a glowing location. Your Herald pays off only if you win that region.',pic:()=>HP.herald()},
 place:{target:hq('#handw'),title:'Hide a card',text:'Tap a card, then tap a region. It stays hidden until the Clash.',pic:()=>HP.region()},
 tie:{target:hfirst('#act .btn','#handw'),title:'A tie!',text:'Add one more hidden card to break it, or tap Pass.',pic:()=>HP.swords()},
 spring:{target:hfirst('.tbx-pan g.rglow rect','#act .btn'),title:'Send Supporters',text:'Tap a region to send a Supporter. It adds +1 Strength in its first Clash. Then tap Done.',pic:()=>HP.supp()},
 day:{target:hfirst('#act .btn.pri','#act .btn'),title:'The Clash',text:'The cards are face up. Highest total Strength wins. Tap Done to fight.',pic:()=>HP.swords()},
 autumn:{target:hfirst('#act [data-a=powers]','#act .btn.pri','#act .btn'),title:'Autumn options',text:'Optional: Govern or Journey with a card. Tap Powers to look, or Done to skip.',pic:()=>HP.scroll()},
 clashOrder:{target:hfirst('.tbx-pan g.rglow rect'),title:'Order the Clashes',text:'Tap the regions in the order they will fight.',pic:()=>HP.swords()},
 location:{target:hfirst('.tb-loc.glow.rec .tb-ring','.tb-loc.glow .tb-ring'),title:'Claim a location',text:'You won! Tap one of the two locations to claim its Influence.',pic:()=>HP.loc('+1')},
 bonus:{target:hfirst('#main','#handw','#act .btn'),title:'Location bonus',text:'Optional extra from your location. Choose an option, or skip it.',pic:()=>HP.star()},
 siteBuy:{target:hfirst('#main','#handw','#act .btn'),title:'Spend your Lore',text:'Lore buys stronger Site of Power cards. Keep it if nothing fits.',pic:()=>HP.scroll()},
 discardDown:{target:hfirst('#main','#handw','#act .btn'),title:'Too many cards',text:'Your hand is over its limit. Discard cards down to the limit.',pic:()=>HP.hand()}
};
// ---------------------------------------------------------------- the rules cards (<= 20 words each, a picture each)
const HLP_RULES=[
 {title:'The goal',text:'Hold the most Influence when the last round ends. Influence is your score.',pic:()=>hpics([['star','Influence'],'>',['crown','Winner']])},
 {title:'One round',text:'Bid for a Kingdom Card. Place your Herald. Hide cards. Send Supporters. Fight the Clashes.',pic:()=>hpics([['back','Bid'],'>',['herald','Herald'],'>',['swords','Clash']])},
 {phase:'bid',title:'Bid in secret',text:'Pick one hand card as your secret bid. The highest bid chooses a Kingdom Card first.',pic:()=>hpics([['card','Your card',5],'>',['back','Secret bid']])},
 {phase:'bid',title:'The bid goes under',text:'Your bid card is tucked under the Kingdom Card you take. It cannot fight this round.',pic:()=>hpics([['back','Bid'],'>',['kc','Kingdom Card']])},
 {phase:'bid',title:'Cheap or strong?',text:'A cheap bid keeps your strong cards for the Clashes. A high bid picks first.',pic:()=>hpics([['card','Cheap',1],['card','Strong',9]])},
 {phase:'bidRes',title:'A lasting power',text:'A Kingdom Card works for you every round you keep it. Tap a glowing one to read it.',pic:()=>hpics([['kc','Kingdom Card'],'>',['star','Power']])},
 {phase:'bidRes',title:'Nothing good?',text:'Tap Keep my card to take your bid back. Or steal a Kingdom Card from a rival.',pic:()=>hpics([['back','Your bid'],'>',['hand','Back to hand']])},
 {phase:'occupier',title:'Tuck a card under',text:'The card under your Kingdom Card cannot fight. Choose your weakest one.',pic:()=>hpics([['card','Weak',1],'>',['kc','Kingdom Card']])},
 {phase:'occupier',title:'A strong card is safer',text:'A stronger card under it makes your Kingdom Card harder to steal.',pic:()=>hpics([['card','Strong',9],'>',['kc','Harder to steal']])},
 {phase:'herald',title:'Place your Herald',text:'Tap a glowing location. Your Herald pays off only if you win that location\'s region.',pic:()=>hpics([['herald','Herald'],'>',['loc','Location']])},
 {phase:'herald',title:'Win there, earn more',text:'Win the region and claim the location. Gain +1 Influence, and take 1 from each rival Herald there.',pic:()=>hpics([['swords','Win'],'>',['loc','Claim','+1']])},
 {phase:'place',title:'Hide a card',text:'Tap a card, then tap a region (or drag it there). It stays face down until the Clash.',pic:()=>hpics([['card','Pick',5],'>',['region','Region']])},
 {phase:'place',title:'The highest total wins',text:'At the Clash all cards flip. The highest total Strength in a region wins it.',pic:()=>hpics([['back','Flip'],'>',['swords','Compare']])},
 {phase:'place',title:'Or pass',text:'Pass keeps your cards in your hand. If everyone passes, nobody wins that region.',pic:()=>hpics([['pass','Pass'],'>',['hand','Keep cards']])},
 {phase:'tie',title:'A tie!',text:'The totals are equal. Each side may add one more hidden card, or pass.',pic:()=>hpics([['swords','Equal'],'>',['card','One more']])},
 {phase:'tie',title:'No extra card?',text:'If nobody adds a card, nobody wins this region.',pic:()=>hpics([['pass','Nobody wins']])},
 {phase:'spring',title:'Send Supporters',text:'Tap a region to send a Supporter. It adds +1 Strength in its first Clash.',pic:()=>hpics([['supp','Supporter'],'>',['region','Region']])},
 {phase:'spring',title:'They do not last',text:'Supporters on the map are lost in Winter. Tap Done when you are finished.',pic:()=>hpics([['supp','Used'],'>',['pass','Lost in Winter']])},
 {phase:'day',title:'The Clash',text:'The cards are face up. The highest total Strength wins the region. Tap Done to fight it.',pic:()=>hpics([['card','Yours',5],['swords','vs'],['card','Theirs',3]])},
 {phase:'day',title:'Powers first',text:'Some cards and Tactics can act now, before the result. Tap Powers to look.',pic:()=>hpics([['star','Power'],'>',['swords','Clash']])},
 {phase:'autumn',title:'Autumn options',text:'After the Clashes you may Govern or Journey with a card. Tap Done to skip both.',pic:()=>hpics([['scroll','Journey'],['gavel','Govern']])},
 {phase:'autumn',title:'Journey: gain Lore',text:'Send a card on a Journey for Lore. Lore buys stronger Site of Power cards.',pic:()=>hpics([['card','Card',2],'>',['scroll','Lore']])},
 {phase:'autumn',title:'Govern: lasting power',text:'A card with votes goes into a Council for a lasting power.',pic:()=>hpics([['card','Votes',3],'>',['gavel','Council']])},
 {phase:'clashOrder',title:'Order the Clashes',text:'Tap the regions in the order they fight. Your strongest region first is a good start.',pic:()=>hpics([['region','1st'],'>',['region','2nd'],'>',['region','3rd']])},
 {phase:'clashOrder',title:'One Clash per region',text:'Each region fights once per round. The winner claims one of its two locations.',pic:()=>hpics([['swords','Clash'],'>',['loc','Claim']])},
 {phase:'location',title:'Claim a location',text:'You won the region! Tap one of its two locations to claim its Influence.',pic:()=>hpics([['region','Won'],'>',['loc','Claim']])},
 {phase:'location',title:'Herald bonus',text:'If your Herald stands there, gain 1 more. Take 1 from each rival Herald.',pic:()=>hpics([['herald','Herald'],'>',['loc','Bonus','+1']])},
 {phase:'bonus',title:'Location bonus',text:'Some locations give an optional extra. Choose an option, or skip it.',pic:()=>hpics([['loc','Location'],'>',['star','Bonus']])},
 {phase:'bonus',title:'Read before you pick',text:'Tap an option to read it. Skipping is always allowed, and keeps your cards.',pic:()=>hpics([['scroll','Read it'],'>',['pass','Skip']])},
 {phase:'siteBuy',title:'Spend your Lore',text:'Lore buys Site of Power cards. A card with Strength goes to your hand.',pic:()=>hpics([['scroll','Lore'],'>',['card','New card',6]])},
 {phase:'siteBuy',title:'HQ cards',text:'An HQ card is a permanent power in front of you.',pic:()=>hpics([['kc','HQ'],'>',['star','Always on']])},
 {phase:'discardDown',title:'Too many cards',text:'Your hand is over its size limit. Discard cards down to the limit.',pic:()=>hpics([['hand','Too many'],'>',['pass','Discard']])},
 {phase:'discardDown',title:'Pick the weakest',text:'Keep your strong cards for the Clashes. Discard the weakest ones.',pic:()=>hpics([['card','Keep',9],['card','Discard',1]])}
];
// ---------------------------------------------------------------- phases
// the phase the player is deciding in (null when there is nothing to decide on the board)
function hlpPhaseOf(M){if(!M||!M.kind)return null;const q=G&&G.q;if(!q)return null;
  if(M.kind==='menu'){const ph=menuPhase(q);return ph?ph.toLowerCase():null}
  if(M.kind!=='other')return M.kind;
  if(BONUSK.includes(q.kind))return 'bonus';
  return (q.kind==='siteBuy'||q.kind==='occupier'||q.kind==='discardDown')?q.kind:null}
const hlpPhase=()=>{try{return hlpPhaseOf(UI.bf)}catch(e){return null}};
// why (<= 15 words), from the advisor's own move
function capW(t,n){const w=String(t||'').replace(/\s+/g,' ').trim().split(' ');return w.length<=n?w.join(' '):''}
function whyShort(M,m){const s=M.s,k=M.kind,q=G.q;let t='';
  if(k==='bid'){const i=cinfo(m.id);const hand=G.pl[s].hand.map(id=>cinfo(id).strength).sort((a,b)=>b-a);const rank=hand.indexOf(i.strength)+1;
    t=i.strength>=hand[Math.min(1,hand.length-1)]?'A high bid picks first, but this card then cannot fight.':rank>=hand.length-1?'A cheap bid keeps your strong cards for the Clashes.':'A middle bid can still win a good card. It keeps your best free.'}
  else if(k==='bidRes'){t=m.t==='return'?'Nothing on offer is worth a card: take yours back.':m.t==='steal'?'Steal a Kingdom Card: their bid card returns to their hand.':'This Kingdom Card works for you every round you keep it.'}
  else if(k==='herald'){const l=m.loc,inf=DD.LOCS[l][2];const riv=G.pl.some(p=>p.seat!==s&&p.herald===l);t=LOCN[l]+' pays +'+inf+' Influence. '+(riv?'Win it to take 1 from each rival Herald.':'Win its region for +1 more.')}
  else if(k==='location'){const l=m.loc;t=LOCN[l]+' pays +'+DD.LOCS[l][2]+' Influence.'+(G.pl[s].herald===l?' Your Herald is here: +1 more.':'')}
  else if(k==='place'||k==='tie'){if(m.pass)t='Passing keeps your cards. If all pass, nobody wins.';else{const st=cinfo(m.id).strength;t=st>=7?'Strength '+st+': a strong card where the prize is worth it.':st<=2?'Strength '+st+': a cheap bluff that saves better cards.':'Strength '+st+': a solid middle card for this region.'}}
  else if(k==='clashOrder')t='Your strongest region fights first.';
  else if(k==='menu'){const a=m.a||'';
    if(m.t==='done')t=menuPhase(q)==='Spring'?'Nothing here is worth spending this round.':'Nothing here gains you more than it costs.';
    else if(a==='supp'){const n=m.p.n;t='Send '+n+' Supporter'+(n>1?'s':'')+': +'+n+' Strength in '+REG[m.p.r]+'\'s first Clash.'}
    else if(a==='journey')t='A Journey gains Lore, which buys Site of Power cards.';
    else if(a==='govern')t='Votes into a Council give a lasting power.';
    else if(a==='cmd:rally')t='Rally: the card returns to your hand in Winter.';
    else if(a==='cmd:deploy')t='Deploy: the card stays on the map and fights next round.';
    else if(a==='council:oaths')t='Supporters come back to your board next round.';
    else if(a.startsWith('t:'))t='This Tactic helps you most right now.';
    else if(a.startsWith('fav:'))t='Use your Favour while you hold it.';
    else t='The best option at this step right now.'}
  else{const w=String(UI._recWhy||'').split(/(?<=[.!?:;])\s+/)[0].replace(/[.:;]$/,'.');t=w}
  return capW(t,15)}
function hlpSuggest(){const M=UI.bf;if(!M||!M.kind||UI.card||UI.dragging||!M.sug)return null;
  const plan=()=>planFor(UI.bf,UI.bf.sug,{full:1});const p=planFor(M,M.sug,{full:1});if(!p||!p.toR)return null;
  const why=whyShort(M,M.sug);if(!why)return null;
  return {why,key:M.sug.k,target:()=>{const q=plan();return (q&&q.toR)||p.toR},from:p.fromR?()=>{const q=plan();return (q&&q.fromR)||p.fromR}:null}}
// ---------------------------------------------------------------- wiring
let _hlpInit=false;
function hlpInit(){if(_hlpInit||typeof GXH==='undefined')return;_hlpInit=true;
  GXH.init({game:'thornbound',defaultOn:true,steps:HLP_STEPS,rules:HLP_RULES,avoid:'.kcb,.gx-board svg text,.glow,.rglow,.rec,.rrec,#act .btn,#main .opt,#main [data-a=mv],#spots .bspot'});
  GXH.bulb({el:'#bulbbtn',suggest:hlpSuggest,rulesFor:hlpPhase})}
// hints On (the first game's default): every decision shows the suggestion and its finger; the bulb still explains the suggestion
// (finger, why, How does this work?). Menu > Hints turns them off.
function bulbState(){const b=$('#bulbbtn');if(!b)return;const on=UI.guide==='full'&&G&&UI.started;b.classList.toggle('on',!!on);b.setAttribute('aria-pressed',on?'true':'false');b.setAttribute('aria-label',on?'Hints are on. Tap to see why':'Hint: what should I do?')}
// the note sits just above the pile chips / action row, over the lower map: never on the turn prompt, the score bar or the hand
function bfMsgPlace(el){try{const vis=e=>{if(!e)return null;const r=e.getBoundingClientRect();return r.width&&r.height&&r.top>0&&r.top<innerHeight?r:null};
  const a=vis($('#cstrip'))||vis($('#act'))||vis($('#handw'));const tt=vis($('#tbturn'));const top=tt?tt.bottom:0;const h=el.offsetHeight||48;
  let y=a?a.top-h-8:innerHeight*.6;if(y<top+6)y=top+6;el.style.top=Math.round(y)+'px';el.style.bottom='auto'}catch(e){}}
function bfMsg(t){toast(t);let el=$('#tbhmsg');if(!el){el=document.createElement('div');el.id='tbhmsg';el.setAttribute('role','status');document.body.appendChild(el)}el.textContent=t;el.hidden=false;bfMsgPlace(el);clearTimeout(bfMsg._t);bfMsg._t=setTimeout(()=>{el.hidden=true},2200)}
function hlpAfter(){hlpInit();if(typeof GXH==='undefined')return;
  const st=$('#start');const busy=!G||!UI.started||G.over||UI.card||UI.pop||UI.dragging||!!$('#tbgoal')||(typeof tutOn==='function'&&tutOn())||(st&&!st.hidden)||isPassing();
  GXH.phase(busy?null:hlpPhase())}
(function(){const o=renderAll;renderAll=function(){const r=o.apply(this,arguments);try{bulbState()}catch(e){}return r}})();
// a help bubble never covers a glowing tap spot: on a crowded phone the kit's spot search can settle on one (it also avoids all text);
// then the bubble moves to the nearest spot clear of every glowing core and of its own rings (text under it is fine)
function hlpUnblock(){if(typeof tutOn==='function'&&tutOn())return;const b=document.querySelector('.gxh-bub.on');if(!b||b.closest('.gxt-root')||b.classList.contains('gxt-bub'))return;const W=innerWidth,H=innerHeight;
  const core=q=>{let w=q.width,h=q.height;const cx=q.left+w/2,cy=q.top+h/2;if(w>56)w=32;if(h>56)h=32;return {left:cx-w/2-3,top:cy-h/2-3,right:cx+w/2+3,bottom:cy+h/2+3}};
  const cores=[...document.querySelectorAll('.glow,.rglow,.rec,.rrec,#act .btn,#main .opt,#main [data-a=mv],#spots .bspot')].filter(e=>!e.closest('[data-help]')&&!e.closest('[hidden]')).map(e=>e.getBoundingClientRect()).filter(q=>q.width&&q.height&&q.right>0&&q.bottom>0&&q.left<W&&q.top<H).map(core);
  const rings=[...document.querySelectorAll('.gxh-ring')].map(e=>{const q=e.getBoundingClientRect();return {left:q.left-4,top:q.top-4,right:q.right+4,bottom:q.bottom+4,main:!e.classList.contains('from')}});
  const hit=(a,c)=>a.left<c.right&&a.right>c.left&&a.top<c.bottom&&a.bottom>c.top;
  const r=b.getBoundingClientRect();
  const T=rings.find(x=>x.main)||rings[0]||{left:W/2,top:H/2,right:W/2,bottom:H/2};const tcx=(T.left+T.right)/2,tcy=(T.top+T.bottom)/2;
  const bar=document.querySelector('.gx-bar');const top=bar?Math.ceil(bar.getBoundingClientRect().bottom)+4:6;
  // labels (score track, round, region names, chips) stay readable: find the spot that covers the fewest of them (none if it can),
  // trying the slim one-line bubble when the full one covers any
  const txt=[];try{const rg=document.createRange(),tw=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,null);let n;while((n=tw.nextNode())&&txt.length<400){if(!/\S/.test(n.nodeValue))continue;const e=n.parentElement;if(!e||e.closest('[data-help],[hidden],.gxh-bub,#tbturn,script,style'))continue;rg.selectNodeContents(n);const q=rg.getBoundingClientRect();if(q.width&&q.height&&q.right>0&&q.bottom>0&&q.left<W&&q.top<H)txt.push(q)}}catch(e){}
  const curT=txt.filter(k=>hit(r,k)).length;if(!cores.some(c=>hit(r,c))&&!curT)return;
  const search=(w,h)=>{let bb=null,bs=1e9;for(const x of [Math.max(6,Math.min(W-w-6,tcx-w/2)),6,Math.max(6,W-w-6)])for(let y=top;y<=H-h-6;y+=4){const c={left:x,top:y,right:x+w,bottom:y+h};
    if(cores.some(k=>hit(c,k))||rings.some(k=>hit(c,k)))continue;const nt=txt.filter(k=>hit(c,k)).length;const d=nt*1000+Math.abs(x+w/2-tcx)*.5+Math.abs(y+h/2-tcy);if(d<bs){bs=d;bb=c}}return bb?{c:bb,s:bs}:null};
  let w=r.width,h=r.height,res=search(w,h);
  if((!res||res.s>=1000)&&!b.classList.contains('gxh-compact')){b.classList.add('gxh-compact');const r2=b.getBoundingClientRect();const res2=search(r2.width,r2.height);if(res2&&(!res||res2.s<res.s)){res=res2;w=r2.width;h=r2.height}else b.classList.remove('gxh-compact')}
  if(res&&!cores.some(c=>hit(r,c))&&res.s>=curT*1000)return;
  const best=res&&res.c;
  if(!best)return;b.style.left=Math.round(best.left)+'px';b.style.top=Math.round(best.top)+'px';
  const side=best.bottom<=T.top+2?'bottom':best.top>=T.bottom-2?'top':best.right<=T.left+2?'right':'left';
  b.className=b.className.replace(/\bgxh-a-\w+/g,'').trim()+' gxh-a-'+side;const a=b.querySelector('.gxh-arr');
  if(a){a.style.left=a.style.top='';if(side==='top'||side==='bottom')a.style.left=Math.round(Math.max(14,Math.min(w-26,tcx-best.left-6)))+'px';else a.style.top=Math.round(Math.max(14,Math.min(h-26,tcy-best.top-6)))+'px'}}
function hlpTurnCover(){const b=document.querySelector('.gxh-bub.on'),t=document.getElementById('tbturn');let on=false;if(b&&t&&!(typeof tutOn==='function'&&tutOn())){const r=b.getBoundingClientRect(),q=t.getBoundingClientRect();on=r.left<q.right&&r.right>q.left&&r.top<q.bottom&&r.bottom>q.top}document.body.classList.toggle('tb-bubturn',on)}
setInterval(()=>{hlpUnblock();hlpTurnCover()},60);
try{new MutationObserver(()=>{if(document.querySelector('.gxh-bub.on'))hlpUnblock()}).observe(document.body,{childList:true,attributes:true,attributeFilter:['class','style'],subtree:false})}catch(e){}
// the Goal card closes without a re-render: look again for a first-time bubble a moment later
setInterval(()=>{if(G&&UI.started&&!G.over)try{hlpAfter()}catch(e){}},300);
// a repaint after the bubble was placed (a card lifts, a region starts to glow) can put a glowing target under it: place it again once the screen has settled
(function(){const o=renderAll;const AV='.glow,.rglow,.rec,.rrec,#act .btn,#main .opt,#main [data-a=mv],#spots .bspot';
  const core=q=>{let w=q.width,h=q.height;const cx=q.left+w/2,cy=q.top+h/2;if(w>56)w=32;if(h>56)h=32;return {l:cx-w/2,t:cy-h/2,r:cx+w/2,b:cy+h/2}};
  const check=()=>{try{const b=document.querySelector('.gxh-bub.on');if(!b)return;const r=b.getBoundingClientRect();
    for(const e of document.querySelectorAll(AV)){if(e.closest('[data-help]')||e.closest('[hidden]'))continue;const q=e.getBoundingClientRect();if(!q.width||!q.height)continue;const c=core(q);
      if(r.left<c.r&&r.right>c.l&&r.top<c.b&&r.bottom>c.t){GXH.relayout();return}}}catch(e){}};
  renderAll=function(){const x=o.apply(this,arguments);if(typeof GXH!=='undefined'&&document.querySelector('.gxh-bub.on')){requestAnimationFrame(check);setTimeout(check,260)}return x}})();
