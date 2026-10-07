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
function tutSteps(){
  let p2=null,p3=null,clashSeen=null;
  return [
 {id:'map',title:'The kingdom',say:'Three regions, two locations each. Every location you claim pays Influence.',target:tq('#mapbox svg'),wait:null,ready:()=>tkind('bid')},
 {id:'goal',title:'Your goal',say:'Influence is your score. After the last round, the most Influence wins.',target:tq('#rivals'),wait:null,ready:()=>tkind('bid')},
 {id:'bid1',title:'Bid in secret',say:()=>'Every round starts with a secret bid. Tap your '+cinfo(tutBidId()).strength+' to pick it.',target:()=>tutHandRect(tutBidId()),
   wait:{type:'tap',match:a=>a.what==='select'&&a.id===tutBidId()},ready:()=>tkind('bid')&&UI.hand==null},
 {id:'bid2',title:'Face down',say:'Tap the spot to bid it face down. Nobody sees it yet.',target:tq('#bidspot'),from:()=>tutHandRect(tutBidId()),
   wait:{type:'tap',match:a=>isMove(a,'bid')},ready:()=>tkind('bid')&&UI.hand===tutBidId()&&!!document.querySelector('#bidspot.glow')},
 {id:'reveal',title:'Highest bid first',say:()=>{const b=G.bstr||[];const m=b[0],t=b[1];return m>t?'Bids flip: your '+m+' beats their '+t+', so you choose first.':m<t?'Bids flip: their '+t+' beats your '+m+', so they choose first.':'Bids flip. A tie goes to the higher on the Order Track.'},
   target:tq('#rivals'),wait:null,hold:c=>c.kind==='event'&&c.ev.t==='bids',onNext:()=>evDone(),
   ready:()=>!!(UI.card&&UI.card.kind==='event'&&UI.card.ev.t==='bids'&&UI.card.rank&&UI.card.revN>=UI.card.rank.length)},
 {id:'kc',title:'A Kingdom Card',say:'Take a Kingdom Card: a power you keep. Your bid card goes under it. Tap the glowing one.',target:tfirst('#handw .kcb.glow.rg','#handw .kcb.glow'),
   wait:{type:'tap',match:a=>isMove(a,'bidRes')&&a.mv&&a.mv.t==='take'},ready:()=>tkind('bidRes')},
 {id:'herald',title:'Place your Herald',say:()=>'Your Herald marks a location. Tap '+(UI.bf&&UI.bf.rec?locOf(UI.bf.rec):'the glowing one')+', where the Court stands too.',target:tutLoc,
   wait:{type:'tap',match:a=>isMove(a,'herald')},ready:()=>tkind('herald')&&!!tutLoc()},
 {id:'place1',title:'Hide a card',say:()=>'Hide one card at every region, face down. Start with your '+cinfo(tutPlace()[0]).strength+'.',target:()=>tutHandRect(tutPlace()&&tutPlace()[0]),
   wait:{type:'tap',match:a=>a.what==='select'&&tutPlace()&&a.id===tutPlace()[0]},ready:()=>tkind('place')&&tutPlaced()===0&&UI.hand==null},
 {id:'place1b',title:'Where it fights',say:'Tap the Uplands. Your card stays hidden until the Clash.',target:tutReg(0),
   wait:{type:'tap',match:a=>isMove(a,'place')&&a.mv&&a.mv.r===0},ready:()=>tkind('place')&&tutPlaced()===0&&tutPlace()&&UI.hand===tutPlace()[0]},
 {id:'place2',title:'Your Heir',say:'Your Heir, your strongest card, goes where both Heralds stand: the Tablelands.',target:tutReg(1),also:()=>tutHandRect(p2||0),
   wait:{type:'tap',match:a=>isMove(a,'place')&&a.mv&&a.mv.r===1},ready:()=>tkind('place')&&tutPlaced()===1&&!!tutPlace()&&(p2=tutPlace()[0],tutSelect(p2))},
 {id:'place3',title:'Last card',say:()=>'Your '+cinfo(p3=tutPlace()[0]).strength+' goes to the Sinks. Tap the region.',target:tutReg(2),also:()=>tutHandRect(p3||0),
   wait:{type:'tap',match:a=>isMove(a,'place')&&a.mv&&a.mv.r===2},ready:()=>tkind('place')&&tutPlaced()===2&&!!tutPlace()&&(p3=tutPlace()[0],tutSelect(p3))},
 {id:'supp',title:'Supporters',say:'Each Supporter adds +1 Strength here this round. Tap the Tablelands twice.',target:tutReg(1),
   wait:{type:'tap',times:2,match:a=>isMove(a,'menu')&&a.mv&&a.mv.a==='supp'&&a.mv.p&&a.mv.p.r===1},ready:()=>tkind('menu')&&G.pl[0].supp.r[1]<2&&/Spring/.test(G.q.title||'')},
 {id:'spring',title:'Spring is over',say:'Supporters are placed. Tap Done to end Spring.',target:tfirst('#act [data-a=mv].pri','#act [data-a=mv]'),
   wait:{type:'tap',match:a=>isMove(a,'menu')&&a.mv&&a.mv.t==='done'},ready:()=>tkind('menu')&&G.pl[0].supp.r[1]>=2&&/Spring/.test(G.q.title||'')},
 {id:'order',title:'Clash order',say:'You choose which region fights first. Tap the Uplands, then the Tablelands.',target:()=>tutReg((UI.ord||[]).length?1:0)(),
   wait:{type:'tap',times:2,match:a=>a.what==='order'},ready:()=>tkind('clashOrder')},
 {id:'clash',title:'The Clash',say:()=>{const ev=UI.card&&UI.card.ev;if(!ev)return '';const t=ev.tot,me=t[0],o=Math.max(...Object.keys(t).filter(s=>+s!==0).map(s=>t[s]));return ev.winner===0?'Cards flip. Highest total wins: your '+me+' beats '+o+'.':ev.winner<0?'Cards flip. Totals are equal: nobody wins here.':'Cards flip. Highest total wins: the Court\'s '+o+' beats your '+me+'.'},
   target:()=>{const ev=UI.card&&UI.card.ev;return ev?tutReg(ev.r)():null},wait:null,hold:c=>c.kind==='event'&&c.ev.t==='clash'&&!clashSeen,onNext:()=>{clashSeen=1;evDone()},
   ready:()=>!!(UI.card&&UI.card.kind==='event'&&UI.card.ev.t==='clash'&&UI.clashRes[UI.card.ev.r])},
 {id:'claim',title:'Claim a location',say:()=>'You won the Tablelands! Tap '+(UI.bf&&UI.bf.rec?locOf(UI.bf.rec):'the glowing location')+': your Herald there earns more.',target:tutLoc,
   wait:{type:'tap',match:a=>isMove(a,'location')},ready:()=>tkind('location')&&!!tutLoc()},
 {id:'score',title:'Scoring',say:()=>'Location +2, your Herald +1, and 1 stolen from the Court. You now have '+myInf()+'.',target:tq('#rivals'),wait:null,
   hold:c=>c.kind==='news'&&c.big&&c.items.some(infK),onNext:()=>newsOk(),pending:'Watch the board',
   ready:()=>!!(UI.card&&UI.card.kind==='news'&&UI.card.big&&UI.card.items.some(infK))},
 {id:'round',title:'Round over',say:()=>'The round ends: Supporters go home and played cards are discarded. You have '+myInf()+', the Court '+rivInf()+'.',target:tq('#rivals'),wait:null,
   hold:c=>c.kind==='event'&&c.ev.t==='summary',onNext:()=>evDone(),pending:'Watch the board',
   ready:()=>!!(UI.card&&UI.card.kind==='event'&&UI.card.ev.t==='summary')},
 {id:'end',title:'The game ends',say:()=>'Real games last 4 to 6 rounds. The most Influence wins: '+(myInf()>rivInf()?'you win, '+myInf()+' to '+rivInf()+'!':myInf()===rivInf()?'a tie goes to the Favour holder.':'the Court wins, '+rivInf()+' to '+myInf()+'.'),
   target:tq('#rivals'),wait:null,ready:()=>!!(G&&G.over&&!UI.card)}
  ]}
// ---------------------------------------------------------------- the kit hooks
function tutHold(c){if(typeof GXT==='undefined'||!GXT.active())return false;const st=GXT.current();return !!(st&&st.hold&&st.hold(c))}
// Story is preceded by the tutorial (Chapter 0) until it has been finished once; a finished player goes straight to the chapter map
function storyOpen(){if(typeof GXC==='undefined')return;
  if(typeof GXT!=='undefined'&&!GXT.isDone(TUT_GAME))tutStart({prologue:true});else GXC.open()}
function tutStart(o){if(typeof GXT==='undefined')return;o=o&&o.prologue?o:null;const first=window.CAMPAIGN&&window.CAMPAIGN.chapters&&window.CAMPAIGN.chapters[0];
  GXT.start({game:TUT_GAME,steps:tutSteps(),story:!!(window.CAMPAIGN&&typeof GXC!=='undefined'),
    endTitle:'You know the rules',endText:o?'Bid, Herald, hidden cards, Supporters, Clashes, scoring. Now the Story begins.':'Bid, Herald, hidden cards, Supporters, Clashes, scoring. Round 2 adds Journeys, Tactics and more: the lightbulb explains them.',
    endButtons:o&&first?[{id:'chapter',label:'Start chapter 1'}]:null,
    setup:()=>{try{GX.close()}catch(e){}hideStart();hideGloss();closePop(true);newGame('tutorial')},
    onDone:r=>{tutLeave();const c=r&&r.choice;
      if(c==='chapter'&&first){showStart();GXC.play(first.id)}
      else if(c==='story'&&typeof GXC!=='undefined'){showStart();GXC.open()}
      else{UI.sv='setup';UI.cfgOpen=false;showStart();UI.sv='setup';renderStart()}},
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
