// ===================== part 8: shared GX kit (settings, reference, undo + bid confirm, recap, results, offline) =====================
const GAME_ID='thornbound';
// ---------------------------------------------------------------- achievements (stored by the shelf; shown in Stats & achievements on the home page)
const ACH=[
 {id:'first',name:'A seat at court',how:'Finish a game.',test:r=>true},
 {id:'guide',name:'Taught by the Herald',how:'Finish the guided first game.',test:r=>r.mode==='guided'},
 {id:'win',name:'The thorns part',how:'Win the throne against the computer.',test:r=>r.won&&(r.mode==='vs'||r.mode==='guided')},
 {id:'hard',name:'Crowned in iron',how:'Win a 3- or 4-player game against hard computers.',test:r=>r.won&&r.mode==='vs'&&r.level==='hard'&&r.np>=3},
 {id:'twenty',name:'The realm listens',how:'End a game with 20 Influence or more.',test:r=>r.score>=20},
 {id:'sweep',name:'Three banners',how:'Win all three Clashes in one round.',test:(r,s,x)=>x.extra&&x.extra.sweep},
 {id:'site',name:'Every stone laid',how:'Buy all five of your Site of Power cards in one game.',test:(r,s,x)=>x.extra&&x.extra.site},
 {id:'four',name:'Four crowns',how:'Win with each of the four factions.',test:(r,s,x)=>x.extra&&x.extra.facWins>=4},
 {id:'hot',name:'Pass the crown',how:'Finish a hot-seat game.',test:r=>r.mode==='hot'},
 {id:'online',name:'Envoys abroad',how:'Finish an online game.',test:r=>r.mode==='online'}];
// ---------------------------------------------------------------- settings: the same sections as every game; Thornbound adds its own rows
const sbtn=(a,txt,dis,extra)=>{const b=document.createElement('button');b.type='button';b.className='gx-sb';b.dataset.a=a;b.textContent=txt;if(dis)b.disabled=true;if(extra)for(const k in extra)b.dataset[k]=extra[k];return b};
function kitSettings(){
  GX.settings({id:'setd',title:'Menu',
    game:S=>{
      if(NET.on)S.appendChild(GX.row('Online',[sbtn('netopen','Lobby'),isHost()?sbtn('newgame','Change setup'):null,sbtn('netleave','Leave the room')]));
      else S.appendChild(GX.row('This game',[sbtn('newgame','New game'),sbtn('savenow','Save now',!G||!UI.started||!!G.over)]));
      S.appendChild(GX.row('Undo',sbtn('undo','Undo my last step',!GX.undo.can()),'Hidden cards and Supporters, until the turn passes or a card is revealed'));
    },
    sound:S=>{S.appendChild(GX.row('Sound effects',GX.onoff(UI.sound,v=>{UI.sound=v;try{localStorage.setItem('tb_snd',v?'1':'0')}catch(x){}if(window.GA)GA.setSfx(v)},'Sound effects')));
      S.appendChild(GX.row('Music',GX.onoff(UI.music,v=>{UI.music=v;try{localStorage.setItem('tb_mus',v?'1':'0')}catch(x){}if(window.GA)GA.setMusic(v);if(v)musicFor()},'Music')))},
    help:S=>{S.appendChild(GX.row('Read',[sbtn('rules','How to play'),sbtn('refopen','Cards & map')]));
      S.appendChild(GX.row('Guide',GX.seg([['full','Full tips'],['light','Light'],['off','Off']],UI.guide,v=>{UI.guide=v;if(G&&UI.started)renderAll()},'Guide level'),'Step tips and the suggested move'))},
    graphics:S=>S.appendChild(GX.row('Graphics',GX.seg([['high','High'],['low','Low (fast)']],UI.lowGfx?'low':'high',v=>{UI.lowGfx=v==='low';try{localStorage.setItem('tb_gfx',v)}catch(x){}UI.mapReset=true;if(G&&UI.started)renderAll()},'Graphics'))),
    about:{name:'The Thornbound Throne',version:'preview',text:'An original game of four factions reaching for an empty throne. Names, card texts and pictures are our own; the pictures are drawn in code. Fonts: Cinzel (Natanael Gama) and EB Garamond (Georg Duffner, Octavio Pardo), SIL Open Font License 1.1. Music: "Dark Forest Theme" by cynicmusic and "Dungeon Ambience" by yd (OpenGameArt, CC0). Sound effects by Kenney (CC0).'}})}
// ---------------------------------------------------------------- component reference
function refCardSpec(f,k){const D=DD,c=k<14?D.BASIC[k]:D.SITE[f][k-14],nm=k<14?(D.BASICNAMES[f]||[])[k]:c.nm;const ar=c.ar||(c.kind==='hq'?'':'ruse');
  const art=(ART[ar]&&(ART[ar][f]||ART[ar]._))||(c.kind==='hq'?'ruin_arch':'banner');const tr=(c.tr||[]).map(t=>TRAIT_N[t]||t);
  const bits=[];if(c.v)bits.push(c.v+' vote'+(c.v>1?'s':''));if(c.l)bits.push(c.l+' lore');
  return {faction:FK[f],title:nm,value:c.kind==='hq'?null:c.s,cost:c.lc>0?c.lc:null,type:c.kind==='hq'?'relic':(ARCH_TYPE[ar]||'unit'),typeLabel:c.kind==='hq'?'HQ':(ARCH_LBL[ar]||'Card'),art,text:(((tr.length?tr.join(', ')+'. ':'')+(c.txt||'')).trim())||'No special ability.',tag:bits.join(' · ')||undefined}}
function refPic(it,big){const p=it.pic||{},w=big?200:52;
  if(p.fac)return TBKit.card(refCardSpec(p.fac,p.k),w);
  if(p.kc)return TBKit.card(kcSpec(p.kc),w);
  const sz=big?72:36;
  if(p.tac)return TBKit.token('influence',{faction:FK[p.tac]},sz);
  if(p.loc!=null){const l=DD.LOCS[p.loc];return '<svg viewBox="-24 -24 48 48" width="'+sz+'" height="'+sz+'"><circle r="21" fill="#2a1c10" stroke="#e8c867" stroke-width="2.5"/><text y="7" text-anchor="middle" font-family="'+TBKit.fonts.display+'" font-weight="700" font-size="19" fill="#fff0b8">+'+l[2]+'</text></svg>'}
  if(p.council)return '<svg viewBox="-24 -24 48 48" width="'+sz+'" height="'+sz+'"><rect x="-19" y="-19" width="38" height="38" rx="8" fill="#3a2414" stroke="#e8c867" stroke-width="2.5"/><text y="7" text-anchor="middle" font-family="'+TBKit.fonts.display+'" font-weight="700" font-size="17" fill="#fff0b8">'+SUIT_N[p.council][0]+'</text></svg>';
  if(p.piece==='herald')return TBKit.token('herald',{faction:'gilded'},sz);
  if(p.piece==='supp')return '<svg viewBox="-24 -24 48 48" width="'+sz+'" height="'+sz+'"><circle r="15" fill="#2a9d8f" stroke="#fff3c4" stroke-width="3"/><text y="6" text-anchor="middle" font-size="17" font-weight="700" fill="#fff">1</text></svg>';
  if(p.piece==='fav')return '<svg viewBox="-24 -24 48 48" width="'+sz+'" height="'+sz+'"><circle r="18" fill="#e8c867" stroke="#fff3c4" stroke-width="3"/><path d="M0 -11 L3.2 -3.2 11 -3.2 4.6 2 7 10 0 5 -7 10 -4.6 2 -11 -3.2 -3.2 -3.2Z" fill="#fff6d0" stroke="#4a3208"/></svg>';
  if(p.piece==='inf')return TBKit.token('influence',{faction:'lantern'},sz);
  return null}
function refInGame(it){if(!G)return true;const p=it.pic||{};
  if(p.fac||p.tac)return G.pl.some(P=>P.fac===(p.fac||p.tac));
  if(p.kc){const V=UI.V||G;return (V.road||[]).includes(p.kc)||V.pl.some(P=>(P.ks||[]).some(T=>T&&T.kc===p.kc)||(P.sup||[]).includes(p.kc))||V.loc.some(L=>L.kc.some(k=>k.n===p.kc))}
  return true}
function refIdOfCard(id){const s=ownerOf(id);return 'f-'+G.pl[s].fac+'-'+(id%100)}
function kitReference(){GX.reference(TB.refSections(DD),{title:'Cards & map',label:'Cards',picture:refPic,inGame:refInGame,before:'[data-gx="boardd"]'})}
// "Read it big" on the card, Kingdom Card and location pop-ups
(function(){const o=renderPop;renderPop=function(){o();const el=$('#ppop');if(!el||el.hidden||!UI.pop)return;const a=UI.popArg||{};let rid=null;
  if(UI.pop==='card'&&a.id!=null&&a.id>=0)rid=refIdOfCard(a.id);else if(UI.pop==='kc')rid='kc'+a.n;else if(UI.pop==='loc')rid='loc'+a.l;
  const b=el.querySelector('.pp-b');if(rid&&b&&!b.querySelector('[data-a=refcard]')){const x=document.createElement('p');x.className='pp-ref';x.innerHTML='<button class="lk" data-a="refcard" data-r="'+esc(rid)+'">Read it in the card list</button>';b.appendChild(x)}}})();
// ---------------------------------------------------------------- undo: snapshot before a local human step. Sealed when the decision passes to another
// seat (hot-seat included), or when a card, the Kingdom deck, the dice of the shuffle, a clash or a round moved on. Off online.
const humansPending=g=>g&&g.q&&!g.over?g.q.seats.filter(s=>!g.pl[s].ai).join(','):null;
function revealed(a,b){if(!a)return true;if(a.rng!==b.rng||a.round!==b.round||a.phase!==b.phase||!!a.over!==!!b.over||a.bidRev!==b.bidRev)return true;
  if(JSON.stringify(a.clash)!==JSON.stringify(b.clash)||JSON.stringify(a.road)!==JSON.stringify(b.road)||a.kdeck.length!==b.kdeck.length)return true;
  for(let r=0;r<a.reg.length;r++)if(a.reg[r].up.length!==b.reg[r].up.length||a.reg[r].done!==b.reg[r].done)return true;
  for(let s=0;s<a.pl.length;s++){const p=a.pl[s],q=b.pl[s];if(p.deck.length!==q.deck.length||p.disc.length!==q.disc.length)return true}
  return a.lost.length!==b.lost.length}
function kitUndo(){GX.undo.config({get:()=>G,owner:humansPending,online:()=>NET.on,
  set:s=>{G=s;UI.evq=[];UI.sel={};UI.hand=null;UI.pendBid=null;UI._rk=null;closePop(true);hideGloss();MAP.slotDirty=true;saveGame();toast('Step undone.');renderAll();pump()},
  onChange:can=>{if(can!==UI.undoCan){UI.undoCan=can;if(G&&UI.started)renderMain()}}})}
function doUndo(){if(GX.undo.undo())sfx('tap')}
// ---------------------------------------------------------------- the bid is confirmed before it is locked in (one tap used to commit it)
(function(){const o=humanMove;humanMove=function(k){
  if(G&&G.q&&G.q.kind==='bid'&&UI.pendBid!==k){const s=NET.on?NET.mySeat:viewSeatForQ();const m=s!=null&&s>=0?legal(s).find(x=>x.k===k):null;if(m&&m.t==='bid'){UI.pendBid=k;closePop(true);UI.hand=m.id;renderAll();sfx('tap');return true}}
  UI.pendBid=null;const s0=NET.on?NET.mySeat:viewSeatForQ(),l0=G?G.logN:0,local=!NET.on&&s0!=null;
  if(local)GX.undo.snap(k);
  const r=o(k);
  if(local){if(!r)GX.undo.drop();else{GX.undo.check(revealed);GX.recap.mark(s0);GX.recap.push(logSince(l0).map(e=>plain(e.t)),s0)}}
  return r}})();
function bidConfirmHTML(){const m=legal(viewSeatForQ()).find(x=>x.k===UI.pendBid);if(!m)return null;const i=cinfo(m.id);
  return {h:'<div class="step" data-q="bidok"><h3 class="st">Confirm your bid</h3><div class="bidok"><span class="th" data-owner="'+ownerOf(m.id)+'" data-up="1">'+cardEl(m.id,UI.phone?52:64).outerHTML+'</span><p>'+gloss('You bid '+i.name+' (Strength '+i.strength+'). Once everyone has bid, the bids are revealed and the highest bid picks a Kingdom Card first.')+'</p></div><p class="hint">Changed your mind? Choose another card first.</p></div>',
    f:'<button class="btn" data-a="bidx">Choose another</button><button class="btn pri pulse" data-a="mv" data-k="'+esc(m.k)+'">Confirm bid</button>'}}
(function(){const o=renderMain;renderMain=function(){
  if(UI.pendBid&&!(G&&G.q&&G.q.kind==='bid'&&viewSeatForQ()!=null&&!UI.coachInfo&&!(UI.card&&UI.card.kind==='pass')))UI.pendBid=null;
  if(UI.pendBid){const r=bidConfirmHTML();if(r){const el=$('#main'),ft=$('#act');el.innerHTML=r.h;ft.innerHTML=r.f;setHl([]);return}UI.pendBid=null}
  o();const ft=$('#act');
  if(ft&&GX.undo.can()&&!G.over&&viewSeatForQ()!=null&&!UI.coachInfo&&!(UI.card&&UI.card.kind==='pass')){const b=document.createElement('button');b.className='btn undo';b.dataset.a='undo';b.setAttribute('aria-label','Undo my last step');b.textContent='↶ Undo';ft.insertBefore(b,ft.firstChild)}}})();
// ---------------------------------------------------------------- "since your last turn" strip in the dock
function kitRecap(){GX.recap.attach('#dockbody',{before:true,title:'Since your turn'})}
function recapSeats(){GX.recap.clear();const hs=G?humans():[];GX.recap.seats(hs.length?hs:[0])}
(function(){const o=aiStep;aiStep=function(w){const s=w.ai[0],l0=G.logN;o(w);if(G&&!NET.on)GX.recap.push(logSince(l0).map(e=>plain(e.t)),s)}})();
// ---------------------------------------------------------------- results, statistics, achievements
function kitTrackClash(ev){if(G&&ev.t==='summary'&&ev.inf1){UI.hist=UI.hist||[];UI.hist[ev.round-1]=ev.inf1.slice()}
  if(!G||ev.t!=='clash'||ev.winner==null||ev.winner<0)return;UI.cw=UI.cw||{};const k=ev.round||G.round;const a=UI.cw[k]=UI.cw[k]||{};a[ev.r]=ev.winner}
function swept(seat){const W=UI.cw||{};for(const k in W){const a=W[k];if([0,1,2].every(r=>a[r]===seat))return true}return false}
function kitResult(){
  if(!G||!G.over||UI.resultDone)return;UI.resultDone=true;GX.undo.clear();GX.recap.clear();
  const hs=humans();if(!hs.length||(NET.on&&NET.mySeat<0))return;  // watching computers: not your game
  const me=NET.on?NET.mySeat:hs.length===1?hs[0]:-1;
  const mode=NET.on?'online':isGuided()?'guided':UI.mode==='hot'||hs.length>1?'hot':'vs';
  const seats=G.pl.map((p,i)=>({name:p.name,ai:p.ai||null,me:i===me}));
  let extra=null;
  if(me>=0){const P=G.pl[me];let fw={};try{fw=JSON.parse(localStorage.getItem('tb_facwins')||'{}')||{}}catch(e){}
    if(G.over.winner===me&&mode!=='hot'){fw[P.fac]=1;try{localStorage.setItem('tb_facwins',JSON.stringify(fw))}catch(e){}}
    extra={fac:P.fac,sweep:swept(me),site:!!(P.site&&P.site.length===0),facWins:Object.keys(fw).length}}
  const lv=G.pl.filter(p=>p.ai).map(p=>p.ai);const level=lv.length&&lv.every(l=>l===lv[0])?lv[0]:(lv.includes('hard')?'mixed':null);
  try{const r=GNS.result({game:GAME_ID,mode,seats,winner:G.over.winner,scores:G.pl.map(p=>p.inf),turns:G.round,ms:UI.t0?Date.now()-UI.t0:0,level,extra});
    if(r&&r.earned.length){UI.earned=r.earned.map(a=>a.name);GX.buzz([30,60,30])}}catch(e){}}
(function(){const o=showOver;showOver=function(){kitResult();return o()}})();
(function(){const o=pushEv;pushEv=function(e){try{kitTrackClash(e)}catch(x){}return o(e)}})();
function kitNewGame(){GX.undo.clear();recapSeats();UI.t0=Date.now();UI.resultDone=false;UI.earned=null;UI.pendBid=null;UI.cw={};}
(function(){const o=newGame;newGame=function(m,op){UI.cw={};UI.hist=null;const r=o(m,op);kitNewGame();renderAll();return r}})();
(function(){const o=resumeGame;resumeGame=function(sv){const r=o(sv);kitNewGame();UI.cw=sv.cw||{};UI.hist=sv.hist||null;return r}})();
// save: report to the shelf's Continue row; keep the round-by-round history and clash wins in the save
(function(){const o=saveGame;saveGame=function(){o();try{if(NET.on||!G||G.over||!UI.cfg)return;const raw=localStorage.getItem('tb_save');if(raw&&(UI.cw||UI.hist)){const s=JSON.parse(raw);s.cw=UI.cw||{};s.hist=UI.hist||null;localStorage.setItem('tb_save',JSON.stringify(s))}if(!UI.savedFlag){UI.savedFlag=1;GNS.saved(GAME_ID,true)}}catch(e){}}})();
(function(){const o=clearSave;clearSave=function(){o();UI.savedFlag=0;try{GNS.saved(GAME_ID,false)}catch(e){}}})();
// a save from an older or broken build is not resumed (it would crash): the title offers a new game instead
const SAVE_V=1;
function saveOk(s){try{const g=s&&s.G;return !!(g&&(s.v||1)===SAVE_V&&(g.v||1)===1&&Array.isArray(g.pl)&&g.pl.length>=2&&Array.isArray(g.reg)&&g.reg.length===3&&s.cfg&&Array.isArray(g.log))}catch(e){return false}}
(function(){const o=loadSave;loadSave=function(){const s=o();if(s&&!saveOk(s)){UI.badSave=true;return null}return s}})();
// ---------------------------------------------------------------- boot (called at the end of boot() in part 6)
function kitBoot(){
  kitSettings();kitReference();kitUndo();kitRecap();
  GNS.achievements(GAME_ID,ACH);
  AIDELAY=GX.aiDelay(650);applyAnim();
  GX.onPref(k=>{if(k==='ai'||typeof k==='object')AIDELAY=GX.aiDelay(650);if(k==='anim'||k==='reduce'||typeof k==='object')applyAnim();if((k==='cb'||k==='text')&&G&&UI.started){MAP.slotSig='';renderAll()}});
  GX.offline({sw:'../sw.js',scope:'../'})}
function applyAnim(){ANIM=GX.animMs(1000)>0?1:0}
document.addEventListener('click',ev=>{const t=ev.target.closest&&ev.target.closest('[data-a]');if(!t)return;const a=t.dataset.a;
  if(a==='undo')doUndo();
  else if(a==='bidx'){UI.pendBid=null;UI.hand=null;renderAll()}
  else if(a==='refopen'){GX.close();GX.show('gx-refd')}
  else if(a==='setopen'){GX.close();GX.show('setd')}
  else if(a==='refcard'){closePop(true);GX.refOpen(t.dataset.r)}});
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='z'&&!GX.open&&GX.undo.can()){e.preventDefault();doUndo()}});
