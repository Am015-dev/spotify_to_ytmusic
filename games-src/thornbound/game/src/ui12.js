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
const tutBidId=()=>{const h=tutHand();return h.find(id=>/Sailing Hall/.test(cinfo(id).name))||h.slice().sort((a,b)=>cinfo(a).strength-cinfo(b).strength).find(id=>cinfo(id).strength>=3&&cinfo(id).archetype!=='heir')};
const tutPlaced=()=>{try{return UI.V.reg.reduce((a,R)=>a+R.down.filter(id=>id>=0&&ownerOf(id)===0).length,0)}catch(e){return 0}};
// the next hidden card (the engine takes the regions in order: Uplands, Tablelands, Sinks): the strongest ordinary card, then the Heir where both Heralds wait, then the next strongest
function tutPlace(){const n=tutPlaced(),left=tutHand(),heir=tutHeir();
  if(n===1)return heir!=null&&left.includes(heir)?[heir,1]:null;
  const h=left.filter(id=>id!==heir).sort((a,b)=>cinfo(b).strength-cinfo(a).strength);return h.length?[h[0],n]:null}
function tutRec(s,mv){const q=G.q,k=q.kind;
  if(k==='bid'){const id=tutBidId();return mv.find(m=>m.id===id)||undefined}
  if(k==='place'){const p=tutPlace();if(!p)return undefined;return mv.find(m=>m.id===p[0]&&m.r===p[1])||mv.find(m=>m.id===p[0])||undefined}
  if(q.t==='menu'){const ph=menuPhase(q);if(ph==='Spring'){if(G.pl[s].supp.r[1]<2){const m=mv.find(x=>x.a==='supp'&&x.p&&x.p.r===1&&x.p.n===1);if(m)return m}return mv.find(m=>m.t==='done')||undefined}return undefined}
  if(k==='clashOrder'){const m=mv.find(x=>x.order&&x.order.join()==='0,1,2');return m||undefined}
  return undefined}
// ---------------------------------------------------------------- the Court is scripted too (the cards are fixed by the seed): it takes Cairn Field, wins the Uplands and the Sinks, and
// leaves the Tablelands (where your Herald and Supporters are) to you. Everything else it plays by the normal Easy AI.
function tutAI(seat){if(!(UI.cfg&&UI.cfg.tutorial)||!G||!G.q||seat!==1||G.round!==1)return null;const k=G.q.kind,mv=legal(seat);
  if(k==='herald')return mv.find(m=>m.loc===3)||null;
  if(k==='place'){const n=G.reg.reduce((a,R)=>a+R.down.filter(id=>id>=0&&Math.floor(id/100)===1).length,0);const want=[112,110,113][n];
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
const tutAutCard=()=>{try{const M=UI.bf;if(!M||!M.aut)return null;const ids=[...M.use];const j=ids.find(id=>autMoves(id).some(m=>m.a==='journey'));return j!=null?j:ids[0]}catch(e){return null}};
function tutSteps(){
  let p2=null,p3=null,clashSeen=null;
  return [
 {id:'goal',title:'Your goal',say:'Most Influence after the last round wins. This is your score.',target:tq('#rivals'),wait:null,ready:()=>tkind('bid')},
 {id:'map',title:'The kingdom',say:'Win a region’s fight to claim one of its two locations.',target:tq('#mapbox svg'),wait:null,ready:()=>tkind('bid')},
 {id:'bid1',title:'Spring: bid',say:()=>'Each round starts with a secret bid. Tap your '+cinfo(tutBidId()).strength+'.',target:()=>tutHandRect(tutBidId()),
   wait:{type:'tap',match:a=>a.what==='select'&&a.id===tutBidId()},ready:()=>tkind('bid')&&UI.hand==null},
 {id:'bid2',title:'Face down',say:'Tap the crown spot. Nobody sees your bid yet.',target:tq('#bidspot'),from:()=>tutHandRect(tutBidId()),
   wait:{type:'tap',match:a=>isMove(a,'bid')},ready:()=>tkind('bid')&&UI.hand===tutBidId()&&!!document.querySelector('#bidspot.glow')},
 {id:'reveal',title:'Bids flip',say:()=>{const b=G.bstr||[];return b[0]>b[1]?'Your '+b[0]+' beats their '+b[1]+'. You pick first.':b[0]<b[1]?'Their '+b[1]+' beats your '+b[0]+'. They pick first.':'A tie: the higher seat picks first.'},
   target:tq('#rivals'),wait:null,hold:c=>c.kind==='event'&&c.ev.t==='bids',onNext:()=>evDone(),
   ready:()=>!!(UI.card&&UI.card.kind==='event'&&UI.card.ev.t==='bids'&&UI.card.rank&&UI.card.revN>=UI.card.rank.length)},
 {id:'kc',title:'A Kingdom Card',say:'Take the glowing Kingdom Card. You keep its power.',target:tfirst('#handw .kcb.glow.rg','#handw .kcb.glow'),
   wait:{type:'tap',match:a=>isMove(a,'bidRes')&&a.mv&&a.mv.t==='take'},ready:()=>tkind('bidRes')},
 {id:'herald',title:'Your Herald',say:()=>'Put your Herald on '+(UI.bf&&UI.bf.rec?locOf(UI.bf.rec):'the glowing location')+'. Win there for a bonus.',target:tutLoc,
   wait:{type:'tap',match:a=>isMove(a,'herald')},ready:()=>tkind('herald')&&!!tutLoc()},
 {id:'place1',title:'Hide a card',say:()=>'Hide one card at each region. Tap your '+cinfo(tutPlace()[0]).strength+'.',target:()=>tutHandRect(tutPlace()&&tutPlace()[0]),
   wait:{type:'tap',match:a=>a.what==='select'&&tutPlace()&&a.id===tutPlace()[0]},ready:()=>tkind('place')&&tutPlaced()===0&&UI.hand==null},
 {id:'place1b',title:'Where it fights',say:'Tap the Uplands. It stays hidden until the fight.',target:tutReg(0),
   wait:{type:'tap',match:a=>isMove(a,'place')&&a.mv&&a.mv.r===0},ready:()=>tkind('place')&&tutPlaced()===0&&tutPlace()&&UI.hand===tutPlace()[0]},
 {id:'place2',title:'Your Heir',say:'Your Heir is strongest. Tap the Tablelands, where your Herald is.',target:tutReg(1),also:()=>tutHandRect(p2||0),
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
 {id:'claim',title:'Claim it',say:'You won! Tap the glowing location where your Herald stands.',target:tutLoc,
   wait:{type:'tap',match:a=>isMove(a,'location')},ready:()=>tkind('location')&&!!tutLoc()},
 {id:'score',title:'Scoring',say:()=>'Location, Herald bonus and a steal: you have '+myInf()+' Influence.',target:tq('#rivals'),wait:null,
   hold:c=>c.kind==='news'&&c.big&&c.items.some(infK),onNext:()=>newsOk(),
   ready:()=>!!(UI.card&&UI.card.kind==='news'&&UI.card.big&&UI.card.items.some(infK))},
 {id:'autumn1',title:'Autumn',say:'Autumn: tap a glowing card in your hand.',target:()=>{const id=tutAutCard();return id!=null?tutHandRect(id):null},
   wait:{type:'tap',match:a=>a.what==='select'&&a.id===tutAutCard()},ready:()=>tkind('menu')&&/Autumn/.test(G.q.title||'')&&UI.autCard==null&&tutAutCard()!=null},
 {id:'autumn2',title:'Journey',say:'Journey trades the card for Lore. Lore buys stronger cards.',target:tfirst('#act .autc [data-aut=journey]','#act .autc .btn'),
   wait:{type:'tap',match:a=>isMove(a,'menu')&&a.mv&&(a.mv.a==='journey'||a.mv.a==='govern')},ready:()=>tkind('menu')&&/Autumn/.test(G.q.title||'')&&UI.autCard!=null&&!!document.querySelector('#act .autc .btn')},
 {id:'round',title:'Winter',say:()=>'Winter: played cards are discarded. You '+myInf()+', the Court '+rivInf()+'.',target:tq('#rivals'),wait:null,
   hold:c=>c.kind==='event'&&c.ev.t==='summary',onNext:()=>evDone(),
   ready:()=>!!(UI.card&&UI.card.kind==='event'&&UI.card.ev.t==='summary')||!!(G&&G.over&&!UI.card)},
 {id:'end',title:'Your game',say:'A real game plays four to six of these rounds. Your turn!',
   target:tq('#rivals'),wait:null,ready:()=>!!(G&&G.over&&!UI.card)}
  ]}
// ---------------------------------------------------------------- the kit hooks
function tutHold(c){if(typeof GXT==='undefined'||!GXT.active())return false;const st=GXT.current();return !!(st&&st.hold&&st.hold(c))}
// Story is preceded by the tutorial (Chapter 0) until it has been finished once; a finished player goes straight to the chapter map
function storyOpen(){if(typeof GXC==='undefined')return;
  if(typeof GXT!=='undefined'&&!GXT.isDone(TUT_GAME))tutStart({prologue:true});else GXC.open()}
// Learn to play = the spotlight steps above on a staged one-round game; it ends by handing over a real (guided, 5-round) game. UI.cfg.coachTut=true brings back the old coached game.
function tutStart(o){if(typeof GXT==='undefined'||window.TB_COACH_TUT){if(window.tbCoachStart)window.tbCoachStart(o);return}
  const pro=!!(o&&o.prologue);
  GXT.start({game:TUT_GAME,steps:tutSteps(),story:false,endTitle:'You know the round',endText:'Bid, Herald, hide, fight, claim, Autumn. Now play for real.',
    endButtons:pro&&window.CAMPAIGN?[{id:'chapter',label:'Start chapter 1'},{id:'play',label:'Play a real game'}]:[{id:'play',label:'Play a real game'},{id:'menu',label:'Menu'}],
    setup:()=>{try{GX.close()}catch(e){}try{GXC.close()}catch(e){}try{hideStart()}catch(e){}try{hideGloss()}catch(e){}closePop(true);newGame('tutorial');UI.coachOn=0;try{clearVoice()}catch(e){}renderAll()},
    onDone:r=>{const c=r&&r.choice;tutLeave();
      if(c==='chapter'&&window.CAMPAIGN&&typeof GXC!=='undefined'){showStart();GXC.play(window.CAMPAIGN.chapters[0].id);return}
      if(c==='menu'){UI.sv='setup';UI.cfgOpen=false;showStart();renderStart();return}
      newGame('guided')},
    onExit:()=>{tutLeave();showStart()}})}
// leave the staged game: nothing of it is saved, and the board goes quiet behind the menu
function tutLeave(){clearTimeout(_pumpT);clearTimeout(UI._evT);clearTimeout(UI._nt);UI.started=false;UI.card=null;UI.evq=[];UI.hand=null;try{GXH.hide()}catch(e){}try{const f=$('#finger');if(f)f.hidden=true}catch(e){}}
// ---------------------------------------------------------------- the game tells the kit what the player does (before it is applied)
(function(){const o=humanMove;humanMove=function(k){
  if(tutOn()&&!UI._tutIn){const s=viewSeatForQ();const mv=s!=null?legal(s).find(m=>m.k===k):null;if(!GXT.act({type:'tap',what:'move',k,kind:G.q&&G.q.kind,mv}))return false}
  return o(k)}})();
(function(){const o=handTap;handTap=function(id){
  if(tutOn()){const M=UI.bf;const commit=!!(M&&cardDriven(M)&&UI.hand===id&&cardMoves(id).length===1);
    if(!commit&&!GXT.act({type:'tap',what:'select',id}))return}
  return o(id)}})();
(function(){const o=orderTap;orderTap=function(r){
  if(tutOn()){const M=UI.bf;if(!M||M.kind!=='clashOrder'||!M.nextRegs().includes(r))return;if(!GXT.act({type:'tap',what:'order',r}))return;
    UI._tutIn=1;try{return o(r)}finally{UI._tutIn=0}}
  return o(r)}})();
