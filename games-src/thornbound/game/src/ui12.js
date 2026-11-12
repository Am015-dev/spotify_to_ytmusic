// ===================== part 12: the tutorial (shell/gx-tutor.js): a staged one-round game that teaches every rule by doing it once =====================
// The staged game is the guided deal (seed 23, you lead the Heathbound Clans against the Gilded Court on Easy) cut to ONE round (engine length 'tutorial').
// The computer is scripted by the fixed seed plus the teaching moves below (tutRec): the same cards every time, so each rule appears on cue.
// Each step spotlights one thing; only that thing answers; the step moves on only when the game reports that exact action (GXT.act).
const TUT_GAME='thornbound';
const tutOn=()=>typeof GXT!=='undefined'&&GXT.active()&&!!(UI.cfg&&UI.cfg.tutorial);
const tutBtn=cls=>typeof GXT==='undefined'?'':GXT.menuHTML({game:TUT_GAME,first:firstTime(),cls:cls,launch:tutStart});
// ---------------------------------------------------------------- the script: which card, which region (hand ids are fixed by the seed; names are checked)
const tutHand=()=>G.pl[0].hand.slice();
const tutHeir=()=>tutHand().find(id=>cinfo(id).archetype==='heir');
const tutNamed=re=>tutHand().find(id=>re.test(cinfo(id).name));
const tutVK=()=>tutNamed(/Verse-Keeper/);   // the Site of Power card bought with Lore in Autumn; round 2 bids it to steal
const tutTieId=()=>tutNamed(/Sailing Hall/); // the card taken back in round 1 and added to the tied Clash
const tutBidId=()=>{const h=tutHand();if(G.round>=2&&tutVK()!=null)return tutVK();return h.find(id=>/Sailing Hall/.test(cinfo(id).name))||h.slice().sort((a,b)=>cinfo(a).strength-cinfo(b).strength).find(id=>cinfo(id).strength>=3&&cinfo(id).archetype!=='heir')};
const tutPlaced=()=>{try{return UI.V.reg.reduce((a,R)=>a+R.down.filter(id=>id>=0&&ownerOf(id)===0).length,0)}catch(e){return 0}};
// the next hidden card (the engine takes the regions in order: Uplands, Tablelands, Sinks): the strongest ordinary card, then the Heir where both Heralds wait, then the next strongest
function tutPlace(){const n=tutPlaced(),left=tutHand(),heir=tutHeir();
  if(n===1)return heir!=null&&left.includes(heir)?[heir,1]:null;
  const h=left.filter(id=>id!==heir).sort((a,b)=>cinfo(b).strength-cinfo(a).strength);return h.length?[h[0],n]:null}
function tutRec(s,mv){const q=G.q,k=q.kind;
  if(k==='bid'){const id=tutBidId();return mv.find(m=>m.id===id)||undefined}
  if(k==='bidRes')return mv.find(m=>m.t===(G.round>=2?'steal':'return'))||undefined;
  if(k==='tie'){const id=tutTieId();return mv.find(m=>m.id===id)||undefined}
  if(k==='siteBuy'){const v=G.pl[0].site.find(id=>/Verse-Keeper/.test(cinfo(id).name));return mv.find(m=>m.t==='sel'&&m.v===v)||mv.find(m=>m.t==='seldone')||undefined}
  if(k==='place'){const p=tutPlace();if(!p)return undefined;return mv.find(m=>m.id===p[0]&&m.r===p[1])||mv.find(m=>m.id===p[0])||undefined}
  if(q.t==='menu'){const ph=menuPhase(q);if(ph==='Spring'){if(G.pl[s].supp.r[1]<2){const m=mv.find(x=>x.a==='supp'&&x.p&&x.p.r===1&&x.p.n===1);if(m)return m}return mv.find(m=>m.t==='done')||undefined}return undefined}
  if(k==='clashOrder'){const m=mv.find(x=>x.order&&x.order.join()==='0,1,2');return m||undefined}
  return undefined}
// ---------------------------------------------------------------- the Court is scripted too (the cards are fixed by the seed): it bids its 4 and takes Paper Diadems (stolen in round 2),
// takes Cairn Field, wins the Uplands, leaves the Tablelands (where your Herald and Supporters are) to you, ties the Sinks 7-7 and adds its Heir to the re-Clash.
// Round 2: it bids its weakest card. Everything else it plays by the normal Easy AI.
function tutAI(seat){if(!(UI.cfg&&UI.cfg.tutorial)||!G||!G.q||seat!==1||G.round>2)return null;const k=G.q.kind,mv=legal(seat);
  if(G.round===2){if(k==='bid'){const w=mv.filter(m=>cinfo(m.id).archetype!=='heir').sort((a,b)=>cinfo(a.id).strength-cinfo(b.id).strength)[0];return w||null}
    if(k==='bidRes')return mv.find(m=>m.t==='return')||null;return null}
  if(k==='bid')return mv.find(m=>m.id===105)||null;
  if(k==='bidRes')return mv.find(m=>m.t==='take'&&m.kc===3)||mv.find(m=>m.t==='take')||null;
  if(k==='tie')return mv.find(m=>m.id===113)||null;
  if(k==='herald')return mv.find(m=>m.loc===3)||null;
  if(k==='place'){const n=G.reg.reduce((a,R)=>a+R.down.filter(id=>id>=0&&Math.floor(id/100)===1).length,0);const want=[112,107,110][n];
    return mv.find(m=>m.id===want&&m.r===n)||null}
  if(G.q.t==='menu'&&menuPhase(G.q)==='Spring'){if(G.pl[1].supp.r[1]<2){const m=mv.find(x=>x.a==='supp'&&x.p&&x.p.r===1&&x.p.n===1);if(m)return m}return mv.find(m=>m.t==='done')||null}
  return null}
(function(){const o=aiChoose;aiChoose=function(seat,level){const m=tutAI(seat);return m||o(seat,level)}})();
// ---------------------------------------------------------------- where each step points
const tq=sel=>()=>{const e=document.querySelector(sel);return e&&e.getBoundingClientRect().width?e:null};
const tkind=k=>!!(UI.bf&&UI.bf.kind===k&&!UI.card&&!UI.pop);
const tfirst=(...sels)=>()=>{for(const s of sels){const e=document.querySelector(s);if(e&&e.getBoundingClientRect().width)return e}return null};
// a hand card's visible strip (the next card overlaps its right side), so the tap lands on that card
function tutHandRect(id){const e=document.querySelector('#handw .hc[data-id="'+id+'"]');if(!e)return null;const r=e.getBoundingClientRect();if(!r.width)return null;let right=r.right;
  if(!e.classList.contains('on')){const nx=e.nextElementSibling;if(nx&&nx.classList.contains('hc')){const q=nx.getBoundingClientRect();if(q.left>r.left+8)right=Math.min(right,q.left)}}
  return {left:r.left,top:r.top,width:Math.max(24,right-r.left),height:r.height}}
const tutReg=r=>()=>{try{return MAP.m?regionRect(r):null}catch(e){return null}};
function tutLoc(){const e=document.querySelector('.tb-loc.glow.rec .tb-ring')||document.querySelector('.tb-loc.glow .tb-ring');return e&&e.getBoundingClientRect().width?e:null}
// keep a hand card lifted for the "just tap the region" steps
function tutSelect(id){if(UI.hand===id)return true;if(!UI.bf||UI.bf.kind!=='place'||!UI.bf.use.has(id))return false;UI.hand=id;renderAll();return UI.hand===id}
const mvOf=a=>a.what==='move'?a:null;
const isMove=(a,kind)=>a.what==='move'&&a.kind===kind;
const myInf=()=>G.pl[0].inf, rivInf=()=>G.pl[1].inf;
const locOf=m=>m&&m.loc!=null?LOCN[m.loc]:'';
// one sentence (12 words or fewer) and one glowing thing per step, in the order the table game is learned:
// goal -> your one action each season (bid, Herald, hidden cards, Supporters) -> the Clash and scoring -> Autumn -> round end -> a real game
const tutAutCard=want=>{try{const M=UI.bf;if(!M||!M.aut)return null;const ids=[...M.use].filter(id=>autMoves(id).some(m=>m.a===want)).sort((a,b)=>(cinfo(a).lore-cinfo(b).lore)*(want==='journey'?-1:1));return ids.length?ids[0]:null}catch(e){return null}};
// a watch step that moves on by itself after ms (no Next button): the bubble explains what the board shows, then the game goes on
const tutAuto=(ms,then,cond)=>({wait:{type:'event',match:a=>a.what==='auto'},onEnter:()=>{const st=GXT.current();const t=setInterval(()=>{const s=GXT.state();if(!s.active||GXT.current()!==st){clearInterval(t);return}
  if(s.shown&&Date.now()-(s.shownAt||0)>=ms&&(!cond||cond())){clearInterval(t);const r=GXT.act({type:'event',what:'auto'});if(!r)console.warn('gxt auto rejected');try{if(then)then()}catch(e){console.warn('gxt auto then',e)}}},100)}});
const tutClash=()=>UI.card&&UI.card.kind==='event'&&UI.card.ev.t==='clash'?UI.card.ev:null;
const tutSiteOpt=()=>{const v=G.pl[0].site.find(id=>/Verse-Keeper/.test(cinfo(id).name));const m=UI.bf&&UI.bf.mv&&UI.bf.mv.find(x=>x.t==='sel'&&x.v===v);return m?document.querySelector('[data-a=mv][data-k="'+CSS.escape(m.k)+'"]'):null};
const myCouncil=()=>{try{return ['relics','secrets','oaths'].find(c=>UI.V.council[c].some(id=>ownerOf(id)===0))||null}catch(e){return null}};
function tutSteps(){
  let p2=null,p3=null,clashSeen=null,tieSay='',c2Say='',taSay='';
  return [
 {id:'goal',title:'Your goal',say:'Most Influence after the last round wins. This is your score.',target:tq('#rivals'),wait:null,ready:()=>tkind('bid')},
 {id:'map',title:'The kingdom',say:'Win a region’s fight to claim one of its two locations.',target:tq('#mapbox svg'),wait:null,ready:()=>tkind('bid')},
 {id:'tactic',title:'Tactics',say:'Your four Tactics: special powers, most work once per game.',target:tq('#cstrip .cs-t'),wait:null,ready:()=>tkind('bid')},
 {id:'attrition',title:'Hand size',say:'Deck empty? Reshuffle your discards, but your hand size drops by one.',target:tq('#rivals .rv.me'),wait:null,ready:()=>tkind('bid')},
 {id:'bid1',title:'Spring: bid',say:()=>'Each round starts with a secret bid. Tap your '+cinfo(tutBidId()).strength+'.',target:()=>tutHandRect(tutBidId()),
   wait:{type:'tap',match:a=>a.what==='select'&&a.id===tutBidId()},ready:()=>tkind('bid')&&UI.hand==null},
 {id:'bid2',title:'Face down',say:'Tap the crown spot. Nobody sees your bid yet.',target:tq('#bidspot'),from:()=>tutHandRect(tutBidId()),
   wait:{type:'tap',match:a=>isMove(a,'bid')},ready:()=>tkind('bid')&&UI.hand===tutBidId()&&!!document.querySelector('#bidspot.glow')},
 {id:'reveal',title:'Bids flip',say:()=>{const b=G.bstr||[];return b[0]>b[1]?'Your '+b[0]+' beats their '+b[1]+'. You pick first.':b[0]<b[1]?'Their '+b[1]+' beats your '+b[0]+'. They pick first.':'A tie: the higher seat picks first.'},
   target:tq('#rivals'),wait:null,hold:c=>c.kind==='event'&&c.ev.t==='bids',onNext:()=>evDone(),
   ready:()=>!!(UI.card&&UI.card.kind==='event'&&UI.card.ev.t==='bids'&&UI.card.rank&&UI.card.revN>=UI.card.rank.length)},
 {id:'takeback',title:'Keep your card',say:'Bids win Kingdom Cards, or you take your card back. Tap it.',target:tq('#bidspot.glow'),
   wait:{type:'tap',match:a=>isMove(a,'bidRes')&&a.mv&&a.mv.t==='return'},ready:()=>tkind('bidRes')&&!!document.querySelector('#bidspot.glow')},
 {id:'favour',title:'The Favour',say:'Win the Gleaning Meadow to hold the Favour: a power and tiebreaker.',target:tq('#cstrip .cs-f'),wait:null,ready:()=>tkind('herald')},
 {id:'herald',title:'Your Herald',say:()=>'Put your Herald on '+(UI.bf&&UI.bf.rec?locOf(UI.bf.rec):'the glowing location')+'. Win there for a bonus.',target:tutLoc,
   wait:{type:'tap',match:a=>isMove(a,'herald')},ready:()=>tkind('herald')&&!!tutLoc()},
 {id:'cmds',title:'Card powers',say:'Icons are powers: Day ones act before a fight, Night ones after.',target:()=>{const id=tutPlace()&&tutPlace()[0];return id!=null?tutHandRect(id):null},wait:null,ready:()=>tkind('place')&&tutPlaced()===0&&UI.hand==null},
 {id:'place1',title:'Hide a card',say:()=>'Hide one card at each region. Tap your '+cinfo(tutPlace()[0]).strength+'.',target:()=>tutHandRect(tutPlace()&&tutPlace()[0]),
   wait:{type:'tap',match:a=>a.what==='select'&&tutPlace()&&a.id===tutPlace()[0]},ready:()=>tkind('place')&&tutPlaced()===0&&UI.hand==null},
 {id:'place1b',title:'Where it fights',say:'Tap the Uplands. It stays hidden until the fight.',target:tutReg(0),
   wait:{type:'tap',match:a=>isMove(a,'place')&&a.mv&&a.mv.r===0},ready:()=>tkind('place')&&tutPlaced()===0&&tutPlace()&&UI.hand===tutPlace()[0]},
 {id:'place2',title:'Your Heir',say:'Your Heir card is your strongest. Hide it in the Tablelands, where your Herald stands.',target:tutReg(1),also:()=>tutHandRect(p2||0),
   wait:{type:'tap',match:a=>isMove(a,'place')&&a.mv&&a.mv.r===1},ready:()=>tkind('place')&&tutPlaced()===1&&!!tutPlace()&&(p2=tutPlace()[0],tutSelect(p2))},
 {id:'place3',title:'Last card',say:'Last card: tap the Sinks.',target:tutReg(2),also:()=>tutHandRect(p3||0),
   wait:{type:'tap',match:a=>isMove(a,'place')&&a.mv&&a.mv.r===2},ready:()=>tkind('place')&&tutPlaced()===2&&!!tutPlace()&&(p3=tutPlace()[0],tutSelect(p3))},
 {id:'supp',title:'Supporters',say:'Each Supporter adds +1. Tap the Tablelands twice.',target:tutReg(1),
   wait:{type:'tap',times:2,match:a=>isMove(a,'menu')&&a.mv&&a.mv.a==='supp'&&a.mv.p&&a.mv.p.r===1},ready:()=>tkind('menu')&&G.pl[0].supp.r[1]<2&&/Spring/.test(G.q.title||'')},
 {id:'spring',title:'Spring ends',say:'Tap Done to end Spring.',target:tfirst('#act [data-a=mv].pri','#act [data-a=mv]'),
   wait:{type:'tap',match:a=>isMove(a,'menu')&&a.mv&&a.mv.t==='done'},ready:()=>tkind('menu')&&G.pl[0].supp.r[1]>=2&&/Spring/.test(G.q.title||'')},
 {id:'order',title:'Summer: fights',say:'Pick the fight order. Tap the Uplands, then the Tablelands.',target:()=>tutReg((UI.ord||[]).length?1:0)(),
   wait:{type:'tap',times:2,match:a=>a.what==='order'},ready:()=>tkind('clashOrder')},
 {id:'clash',title:'The Clash',say:()=>{const ev=UI.card&&UI.card.ev;if(!ev)return '';const t=ev.tot,me=t[0],o=Math.max(...Object.keys(t).filter(s=>+s!==0).map(s=>t[s]));return ev.winner===0?'Cards flip. Your '+me+' beats '+o+': highest total wins.':ev.winner<0?'Cards flip. A tie: nobody wins here.':'Cards flip. Their '+o+' beats your '+me+'. Highest wins.'},
   target:()=>{const ev=UI.card&&UI.card.ev;return ev?tutReg(ev.r)():null},wait:null,hold:c=>c.kind==='event'&&c.ev.t==='clash'&&!clashSeen,onNext:()=>{clashSeen=1;evDone()},
   ready:()=>!!(UI.card&&UI.card.kind==='event'&&UI.card.ev.t==='clash'&&UI.clashRes[UI.card.ev.r])},
 Object.assign({id:'clash2',title:'Your fight',say:()=>{const ev=tutClash();if(ev&&ev.r===1)c2Say=ev.winner===0?'Your '+ev.tot[0]+' beats their '+ev.tot[1]+'. Supporters count too.':'Their '+ev.tot[1]+' beats your '+ev.tot[0]+'.';return c2Say},
   target:tutReg(1),hold:c=>c.kind==='event'&&c.ev.t==='clash'&&c.ev.r===1,ready:()=>{const ev=tutClash();return !!(ev&&ev.r===1)}},tutAuto(2000,()=>{if(tutClash())evDone()},()=>!!UI.clashRes[1]||!tutClash())),
 {id:'claim',title:'Claim it',say:'You won! Tap the glowing location where your Herald stands.',target:tutLoc,
   wait:{type:'tap',match:a=>isMove(a,'location')},ready:()=>tkind('location')&&!!tutLoc()},
 {id:'score',title:'Scoring',say:()=>'Location, Herald bonus and a steal: you have '+myInf()+' Influence.',target:tq('#rivals'),wait:null,
   hold:c=>c.kind==='news'&&c.big&&c.items.some(infK),onNext:()=>newsOk(),
   ready:()=>!!(UI.card&&UI.card.kind==='news'&&UI.card.big&&UI.card.items.some(infK))},
 Object.assign({id:'tiea',title:'A tie!',say:()=>{const ev=tutClash();if(ev&&ev.r===2)taSay='Cards flip: '+ev.tot[0]+' against '+ev.tot[1]+'. A tie, so nobody wins yet.';return taSay},
   target:tutReg(2),hold:c=>c.kind==='event'&&c.ev.t==='clash'&&c.ev.r===2,ready:()=>{const ev=tutClash();return !!(ev&&ev.r===2&&ev.winner<0)}},tutAuto(2000,()=>{if(tutClash())evDone()},()=>!!UI.clashRes[2]||!tutClash())),
 {id:'tie',title:'Add a card',say:()=>'Each side may add one hidden card, or pass. Tap your '+cinfo(tutTieId()).strength+'.',target:()=>tutHandRect(tutTieId()),
   wait:{type:'tap',match:a=>a.what==='select'&&a.id===tutTieId()},ready:()=>tkind('tie')&&UI.hand==null&&tutTieId()!=null},
 {id:'tieb',title:'Fight again',say:'Tap the Sinks. Only the new cards fight now.',target:tutReg(2),also:()=>tutHandRect(tutTieId()),
   wait:{type:'tap',match:a=>isMove(a,'tie')&&a.mv&&a.mv.id!=null},ready:()=>tkind('tie')&&tutTieId()!=null&&tutSelect(tutTieId())},
 Object.assign({id:'tiec',title:'The new fight',say:()=>{const ev=tutClash();if(!ev)return tieSay||'';const t=ev.tot,me=t[0]||0,o=t[1]||0;return tieSay=ev.winner===0?'Your '+me+' beats their '+o+'. The Sinks are yours.':'Their new '+o+' beats your '+me+'. They take the Sinks.'},
   target:tutReg(2),hold:c=>c.kind==='event'&&c.ev.t==='clash',
   ready:()=>{const ev=tutClash();return !!(ev&&ev.r===2&&!ev.tied&&UI.clashRes[2])}},tutAuto(2400,()=>{if(tutClash())evDone()})),
 {id:'autumn1',title:'Autumn',say:'Autumn: tap the glowing card that has votes.',target:()=>{const id=tutAutCard('govern');return id!=null?tutHandRect(id):null},
   wait:{type:'tap',match:a=>a.what==='select'&&a.id===tutAutCard('govern')},ready:()=>tkind('menu')&&/Autumn/.test(G.q.title||'')&&UI.autCard==null&&tutAutCard('govern')!=null},
 {id:'govern',title:'Govern',say:'Govern: put it in a Council. Its votes earn Council powers.',target:tfirst('#act .autc [data-aut=govern]'),
   wait:{type:'tap',match:a=>isMove(a,'menu')&&a.mv&&a.mv.a==='govern'},ready:()=>tkind('menu')&&/Autumn/.test(G.q.title||'')&&UI.autCard!=null&&!!document.querySelector('#act .autc [data-aut=govern]')},
 {id:'council',title:'Councils',say:'Your card now sits in that Council, shown on the board here.',target:()=>{const c=myCouncil();return c?document.querySelector('#cstrip [data-c='+c+']'):null},wait:null,
   ready:()=>!!myCouncil()&&!UI.card},
 {id:'autumn3',title:'Journey',say:'Now tap your other glowing card.',target:()=>{const id=tutAutCard('journey');return id!=null?tutHandRect(id):null},
   wait:{type:'tap',match:a=>a.what==='select'&&a.id===tutAutCard('journey')},ready:()=>tkind('menu')&&/Autumn/.test(G.q.title||'')&&UI.autCard==null&&tutAutCard('journey')!=null},
 {id:'journey',title:'Journey',say:'Journey trades the card for Lore. Lore buys stronger cards.',target:tfirst('#act .autc [data-aut=journey]'),
   wait:{type:'tap',match:a=>isMove(a,'menu')&&a.mv&&a.mv.a==='journey'},ready:()=>tkind('menu')&&/Autumn/.test(G.q.title||'')&&UI.autCard!=null&&!!document.querySelector('#act .autc [data-aut=journey]')},
 {id:'lore',title:'Spend Lore',say:'Two Lore: buy a Site of Power card. Tap the Verse-Keeper.',target:tutSiteOpt,
   wait:{type:'tap',match:a=>isMove(a,'siteBuy')},ready:()=>!!(G.q&&G.q.kind==='siteBuy'&&!UI.card&&tutSiteOpt())},
 {id:'lore2',title:'Bought',say:'Tap Done. The card joins your hand.',target:()=>{const m=UI.bf&&UI.bf.mv&&UI.bf.mv.find(x=>x.t==='seldone');return m?document.querySelector('#act [data-a=mv][data-k="'+CSS.escape(m.k)+'"]'):null},
   wait:{type:'tap',match:a=>isMove(a,'siteBuy')&&a.mv&&a.mv.t==='seldone'},ready:()=>!!(G.q&&G.q.kind==='siteBuy'&&!UI.card&&(G.q.chosen||[]).length)},
 {id:'round',title:'Winter',say:()=>'Winter: played cards are discarded. You '+myInf()+', the Court '+rivInf()+'.',target:tq('#rivals'),wait:null,
   hold:c=>c.kind==='event'&&c.ev.t==='summary',onNext:()=>evDone(),
   ready:()=>!!(UI.card&&UI.card.kind==='event'&&UI.card.ev.t==='summary')},
 {id:'bid3',title:'Round 2',say:()=>'Round 2. Bid your new Verse-Keeper: Strength '+cinfo(tutVK()).strength+'.',target:()=>tutHandRect(tutVK()),
   wait:{type:'tap',match:a=>a.what==='select'&&a.id===tutVK()},ready:()=>G.round===2&&tkind('bid')&&UI.hand==null&&tutVK()!=null},
 {id:'bid4',title:'Face down',say:'Tap the crown spot.',target:tq('#bidspot'),from:()=>tutHandRect(tutVK()),
   wait:{type:'tap',match:a=>isMove(a,'bid')},ready:()=>G.round===2&&tkind('bid')&&UI.hand===tutVK()&&!!document.querySelector('#bidspot.glow')},
 {id:'kc',title:'Steal it',say:'Your bid beats the card on their Kingdom Card. Steal it!',target:tq('#handw .kcb.steal'),
   wait:{type:'tap',match:a=>isMove(a,'bidRes')&&a.mv&&a.mv.t==='steal'},ready:()=>G.round===2&&tkind('bidRes')&&!!document.querySelector('#handw .kcb.steal')},
 {id:'end',title:'Your game',say:'Its power is yours now. After the last round, most Influence wins.',
   target:tq('#rivals'),wait:null,ready:()=>!!(G&&G.round===2&&G.pl[0].ks.some(x=>x))}
  ]}
// ---------------------------------------------------------------- the kit hooks
function tutHold(c){if(typeof GXT==='undefined'||!GXT.active())return false;const st=GXT.current();return !!(st&&st.hold&&st.hold(c))}
// Story is preceded by the tutorial (Chapter 0) until it has been finished once; a finished player goes straight to the chapter map
function storyOpen(){if(typeof GXC==='undefined')return;
  if(typeof GXT!=='undefined'&&!GXT.isDone(TUT_GAME))tutStart({prologue:true});else GXC.open()}
// Learn to play = the spotlight steps above on a staged one-round game; it ends by handing over a real (guided, 5-round) game. UI.cfg.coachTut=true brings back the old coached game.
function tutStart(o){if(typeof GXT==='undefined'||window.TB_COACH_TUT){if(window.tbCoachStart)window.tbCoachStart(o);return}
  const pro=!!(o&&o.prologue);
  GXT.start({game:TUT_GAME,steps:tutSteps().map(st=>{const oe=st.onEnter;st.onEnter=function(){if(oe)oe.apply(this,arguments);try{if(window.tbStripPaint)window.tbStripPaint()}catch(e){}};return st}),endTitle:'You know the rules',endText:'Bid, steal, Herald, hide, fight, ties, Autumn, Lore. Now play for real.',
    endButtons:pro&&window.CAMPAIGN?[{id:'chapter',label:'Start chapter 1'}]:null,story:!!(window.CAMPAIGN&&typeof GXC!=='undefined'),
    setup:()=>{try{GX.close()}catch(e){}try{GXC.close()}catch(e){}try{hideStart()}catch(e){}try{hideGloss()}catch(e){}closePop(true);newGame('tutorial');tutStage();UI.coachOn=0;try{clearVoice()}catch(e){}renderAll()},
    onDone:r=>{const c=r&&r.choice;tutLeave();
      if(c==='chapter'&&window.CAMPAIGN&&typeof GXC!=='undefined'){showStart();GXC.play(window.CAMPAIGN.chapters[0].id);return}
      if(c==='story'&&typeof GXC!=='undefined'){showStart();GXC.open();return}
      showStart();UI.sv='setup';UI.cfgOpen=false;renderStart()},   // Play a real game: the setup screen, one tap from a real game
    onExit:()=>{tutLeave();showStart()}})}
// the staged deal: the seed's opening hand with the Dockside Broker (2 Lore, for the Lore buy) in place of the Hearth Priestesses; the computer plays at x6 (animations cap at x4) so no wait is long
function tutStage(){const P=G.pl[0],a=P.hand.indexOf(4),b=P.deck.indexOf(1);if(a>=0&&b>=0){P.hand[a]=1;P.deck[b]=4;const o=G.q&&G.q.o&&G.q.o[0];if(o)o.forEach(m=>{if(m.id===4){m.id=1;m.k='b:1';m.label='Bid with '+cinfo(1).name}})}
  if(UI._tutSpd==null)UI._tutSpd=UI.speed;UI.speed=6}
// leave the staged game: nothing of it is saved, and the board goes quiet behind the menu
function tutLeave(){if(UI._tutSpd!=null){UI.speed=UI._tutSpd;UI._tutSpd=null}clearTimeout(_pumpT);clearTimeout(UI._evT);clearTimeout(UI._nt);UI.started=false;UI.card=null;UI.evq=[];UI.hand=null;try{GXH.hide()}catch(e){}try{const f=$('#finger');if(f)f.hidden=true}catch(e){}}
// ---------------------------------------------------------------- the game tells the kit what the player does (before it is applied)
// a fast tap (the right one, but while the step is still appearing) is never lost: it is kept and replayed once the step can take it (no input race can wedge the tutorial)
function tutEarly(a){try{const st=GXT.current(),S=GXT.state();if(!st||!st.wait||!S.active)return false;if(S.phase!=='show'&&S.phase!=='pend'&&S.phase!=='gap')return false;return !st.wait.match||!!st.wait.match(a)}catch(e){return false}}
document.addEventListener('pointerdown',e=>{UI._lastPt=[e.clientX,e.clientY]},true);
function tutQueue(fn){clearTimeout(UI._tutQT);try{if(UI._lastPt&&typeof tapRing==='function')tapRing(UI._lastPt[0],UI._lastPt[1])}catch(e){}const t0=Date.now();const go=()=>{if(!tutOn())return;if(Date.now()-t0>2500)return;if(fn()===false)UI._tutQT=setTimeout(go,120)};UI._tutQT=setTimeout(go,120)}
(function(){const o=humanMove;humanMove=function(k){
  if(tutOn()&&!UI._tutIn){const s=viewSeatForQ();const mv=s!=null?legal(s).find(m=>m.k===k):null;const a={type:'tap',what:'move',k,kind:G.q&&G.q.kind,mv};
    if(!GXT.act(a)){if(mv&&tutEarly(a))tutQueue(()=>{const s2=viewSeatForQ();if(s2==null||!legal(s2).some(m=>m.k===k))return true;return humanMove(k)!==false});return false}}
  return o(k)}})();
(function(){const o=handTap;handTap=function(id){
  if(tutOn()){const M=UI.bf;const commit=!!(M&&cardDriven(M)&&UI.hand===id&&cardMoves(id).length===1);
    if(!commit){const a={type:'tap',what:'select',id};if(!GXT.act(a)){if(tutEarly(a)){tutQueue(()=>{if(UI.hand===id)return true;const S=GXT.state();if(S.phase!=='show')return false;if(!GXT.act(a))return false;o(id);return true})}return}}}
  return o(id)}})();
(function(){const o=orderTap;orderTap=function(r){
  if(tutOn()){const M=UI.bf;if(!M||M.kind!=='clashOrder'||!M.nextRegs().includes(r))return;const a={type:'tap',what:'order',r};if(!GXT.act(a)){if(tutEarly(a)){const i0=GXT.index(),c0=GXT.state().count;tutQueue(()=>{const T=GXT.state();if(!T.active||T.i!==i0||T.count!==c0)return true;if(T.phase!=='show')return false;if(!GXT.act(a))return false;UI._tutIn=1;try{o(r)}finally{UI._tutIn=0}return true})}return}
    UI._tutIn=1;try{return o(r)}finally{UI._tutIn=0}}
  return o(r)}})();
// Learn to play: the first Clash plays out slowly (its step explains it); the later Clashes of the staged round resolve at once, so no silent wait passes ~3 s
(function(){const o=bfEvent;bfEvent=function(c){if(UI.cfg&&UI.cfg.tutorial&&c&&c.ev&&c.ev.t==='clash'&&Object.keys(UI.clashRes||{}).length>0&&!tutHold(c)){const a=ANIM;ANIM=0;try{return o.apply(this,arguments)}finally{ANIM=a}}return o.apply(this,arguments)}})();
// watch steps (a Next button) move on by themselves 2.5 s after they appear; a tap on Next still skips at once
(function(){let id=null,t0=0;setInterval(()=>{try{if(typeof GXT==='undefined'||!tutOn()){id=null;return}const S=GXT.state();if(!S||!S.active||S.phase!=='show'||!S.shown||S.wait){id=null;return}
  const k=S.i+':'+S.id;if(k!==id){id=k;t0=Date.now();return}if(Date.now()-t0>=2500/Math.max(1,Math.min(UI.speed||1,4))){id=null;GXT.next()}}catch(e){}},100)})();
