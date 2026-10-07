// ===================== hlp.js: help (gx-help kit): coach bubbles the first time, the lightbulb on demand =====================
// Bubbles: once per phase, short, pointing at the board. The bulb: the advisor's own move (wwk(V).suggestion, the same one the "What we know" box uses;
// an opening token or an answer comes from aiAnswer) with its "why", plus the rules cards. Never advice on its own during play.
// ---------------------------------------------------------------- pictures for the rules cards (inline SVG in the game's colours)
const HP={
 tile:(n,c)=>{const g=c==='y'?['#ffe455','#ffb300','#14163a']:c==='r'?['#ff6048','#c11d1d','#fff']:c==='b'?['#56a6ff','#1c62d9','#fff']:['#4a52a8','#2b2f63','#fff'];
  return '<svg viewBox="0 0 64 64"><defs><linearGradient id="hg'+c+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+g[0]+'"/><stop offset="1" stop-color="'+g[1]+'"/></linearGradient></defs><path d="M32 2v8M32 54v8" stroke="#c57a2a" stroke-width="4" stroke-linecap="round"/><rect x="13" y="9" width="38" height="46" rx="7" fill="url(#hg'+c+')" stroke="#14163a" stroke-width="3"/><text x="32" y="42" text-anchor="middle" font-size="28" font-weight="900" fill="'+g[2]+'" stroke="#14163a" stroke-width="'+(c==='y'?0:1.2)+'" paint-order="stroke" font-family="Arial Black,Arial,sans-serif">'+(n==null?'?':n)+'</text></svg>'},
 cut:()=>'<svg viewBox="0 0 64 64"><path d="M32 2v22M32 40v22" stroke="#c57a2a" stroke-width="5" stroke-linecap="round"/><circle cx="20" cy="46" r="7" fill="none" stroke="#14163a" stroke-width="4"/><circle cx="44" cy="46" r="7" fill="none" stroke="#14163a" stroke-width="4"/><path d="M24 40L46 14M40 40L18 14" stroke="#14163a" stroke-width="4.5" stroke-linecap="round"/></svg>',
 fuse:(n)=>{let s='';const tot=5,left=n==null?3:n;for(let i=0;i<tot;i++)s+='<rect x="'+(6+i*10.4)+'" y="26" width="8.6" height="12" rx="3" fill="'+(i<tot-left?'#555':'#e8a040')+'" stroke="#14163a" stroke-width="2"/>';return '<svg viewBox="0 0 64 64">'+s+'<circle cx="6" cy="20" r="4" fill="#ffc928" stroke="#14163a" stroke-width="2"/><path d="M6 14v-5M1 18H0M11 15l3-3" stroke="#ff8a1f" stroke-width="2.5" stroke-linecap="round"/></svg>'},
 bomb:()=>'<svg viewBox="0 0 24 24" style="overflow:visible"><circle cx="11" cy="14" r="7" fill="#1c1838"/><path d="M15 8l2-2m0 0l1.5 1.5M17 6c1-2 3-2 4-1" stroke="#ffc928" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="8.5" cy="11.5" r="1.6" fill="#fff" opacity=".8"/></svg>',
 boom:()=>'<svg viewBox="0 0 64 64"><path d="M32 4l6 14 14-8-6 15 14 3-13 8 9 12-15-4-3 15-7-13-11 11 1-16-16 2 12-11-12-9 16-1-4-15 12 8z" fill="#ff8a1f" stroke="#b3140c" stroke-width="3" stroke-linejoin="round"/><circle cx="32" cy="32" r="8" fill="#ffe455"/></svg>',
 token:(t)=>'<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="22" fill="#d9ecff" stroke="#14163a" stroke-width="4"/><text x="32" y="42" text-anchor="middle" font-size="26" font-weight="900" fill="#14163a" font-family="Arial Black,Arial,sans-serif">'+(t==null?'5':t)+'</text></svg>',
 gear:()=>'<svg viewBox="0 0 64 64"><rect x="8" y="12" width="48" height="40" rx="8" fill="#fff6e2" stroke="#14163a" stroke-width="3"/><circle cx="32" cy="32" r="9" fill="none" stroke="#e8681c" stroke-width="5"/><path d="M32 17v6M32 41v6M17 32h6M41 32h6" stroke="#e8681c" stroke-width="5" stroke-linecap="round"/></svg>',
 lock:()=>'<svg viewBox="0 0 64 64"><rect x="12" y="28" width="40" height="30" rx="6" fill="#8a8fb8" stroke="#14163a" stroke-width="3"/><path d="M20 28v-8a12 12 0 0 1 24 0v8" fill="none" stroke="#14163a" stroke-width="4"/></svg>',
 check:()=>'<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="22" fill="#52c23a" stroke="#14163a" stroke-width="3"/><path d="M20 33l8 8 17-18" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 tap:()=>'<svg viewBox="0 0 64 64"><circle cx="32" cy="30" r="18" fill="rgba(255,138,31,.2)" stroke="#e8681c" stroke-width="4"/><path d="M30 12v26l-6-5-4 4 14 14h14l4-20-8-2-4-4-4 1-2-4z" fill="#fff" stroke="#14163a" stroke-width="2.5" stroke-linejoin="round"/></svg>',
 stand:()=>'<svg viewBox="0 0 64 64"><rect x="4" y="46" width="56" height="10" rx="4" fill="#2b2f63" stroke="#14163a" stroke-width="3"/><rect x="8" y="14" width="12" height="32" rx="4" fill="#56a6ff" stroke="#14163a" stroke-width="2.5"/><rect x="26" y="14" width="12" height="32" rx="4" fill="#ffe455" stroke="#14163a" stroke-width="2.5"/><rect x="44" y="14" width="12" height="32" rx="4" fill="#56a6ff" stroke="#14163a" stroke-width="2.5"/></svg>',
 star:()=>'<svg viewBox="0 0 64 64"><path d="M32 6l7.5 17 18.5 1.6-14 12 4.4 18.4L32 45l-16.4 10 4.4-18.4-14-12L24.5 23z" fill="#ffc928" stroke="#14163a" stroke-width="3" stroke-linejoin="round"/></svg>',
 order:()=>'<svg viewBox="0 0 64 64"><rect x="6" y="22" width="14" height="22" rx="4" fill="#56a6ff" stroke="#14163a" stroke-width="2.5"/><rect x="25" y="22" width="14" height="22" rx="4" fill="#56a6ff" stroke="#14163a" stroke-width="2.5"/><rect x="44" y="22" width="14" height="22" rx="4" fill="#56a6ff" stroke="#14163a" stroke-width="2.5"/><text x="13" y="38" text-anchor="middle" font-size="13" font-weight="900" fill="#fff" font-family="Arial,sans-serif">1</text><text x="32" y="38" text-anchor="middle" font-size="13" font-weight="900" fill="#fff" font-family="Arial,sans-serif">5</text><text x="51" y="38" text-anchor="middle" font-size="13" font-weight="900" fill="#fff" font-family="Arial,sans-serif">9</text><path d="M10 54h44l-6-5M54 54l-6 5" fill="none" stroke="#14163a" stroke-width="3" stroke-linecap="round"/></svg>',
 turn:()=>'<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="20" fill="#fff6e2" stroke="#14163a" stroke-width="3"/><path d="M32 18v14l9 6" fill="none" stroke="#e8681c" stroke-width="5" stroke-linecap="round"/><path d="M52 12v12H40" fill="none" stroke="#14163a" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};
function hpics(items){return '<div class="gxh-pics">'+items.map(it=>it==='>'?'<span class="gxh-ar">&rarr;</span>':'<figure>'+(HP[it[0]]?HP[it[0]](it[2],it[3]):'')+(it[1]?'<figcaption>'+it[1]+'</figcaption>':'')+'</figure>').join('')+'</div>'}
// ---------------------------------------------------------------- where each bubble points
const hfirst=(...sels)=>()=>{for(const s of sels){for(const e of document.querySelectorAll(s)){const r=e.getBoundingClientRect();if(r.width&&r.height&&!e.closest('[hidden]'))return e}}return null};
const HLP_STEPS={
 open:{target:hfirst('#mine .tile.glow'),title:'Show one wire',text:'Tap one of your wires. A token with its number goes in front of it for the whole crew.',pic:()=>HP.token(5)},
 turn:{target:hfirst('#crew .tile.glow'),title:'Your turn: point',text:'Tap a crewmate\'s glowing wire, then tap one of your own numbers: the one you think it is.',pic:()=>HP.tap()},
 number:{target:hfirst('#mine .tile.glow'),title:'Say a number',text:'Tap a glowing wire of yours: the number you say. It must be one you hold.',pic:()=>HP.tile(7,'b')},
 wire:{target:hfirst('#crew .tile.glow'),title:'Point at a wire',text:'Tap the crewmate\'s wire you think has your number. A match cuts both wires.',pic:()=>HP.cut()},
 solo:{target:hfirst('#mine .tile.glow.g-solo','#mine .tile.glow'),title:'A free cut',text:'You hold every wire left of this number. Tap one: all of them are cut, and it cannot fail.',pic:()=>HP.check()},
 reveal:{target:hfirst('#mine .tile.glow.g-rev','#mine .tile.glow'),title:'Only red wires left',text:'Tap one red wire to show your reds. You are then finished, and nothing blows up.',pic:()=>HP.tile('R','r')},
 tag:{target:hfirst('#tb .tile.glow','#tb .plate.glow','#tray .chip.glow','#mine .chip.glow'),title:'Tag a wire',text:'Tap a glowing wire to put an info token in front of it. Everyone then sees the number.',pic:()=>HP.token(3)},
 answer:{target:hfirst('#tb .tile.glow','#tb .plate.glow','#tray .chip.glow','#mine .chip.glow'),title:'Your choice',text:'Something is asked of you. Tap one of the glowing wires, players or buttons.',pic:()=>HP.tap()},
 gear:{target:hfirst('#tb .tile.glow','#tb .plate.glow','#tray .chip.glow','#mine .chip.glow'),title:'Finish the move',text:'Keep tapping the glowing wires, players or buttons. The cross button cancels.',pic:()=>HP.gear()},
 claim:{target:hfirst('#tray .chip.glow','#tray .chip'),title:'Claim the turn',text:'In this job anyone may take the next turn. Tap the button if you are ready.',pic:()=>HP.turn()}
};
// ---------------------------------------------------------------- the rules cards (<= 20 words each, a picture each)
const HLP_RULES=[
 {title:'The goal',text:'Cut every wire on every stand before the fuse runs out. You win or lose together.',pic:()=>hpics([['cut','Cut all'],'>',['check','Defused']])},
 {title:'The fuse',text:'Each wrong cut burns one fuse step. With no step left the bomb goes off. A red wire ends the job at once.',pic:()=>hpics([['fuse','Fuse'],'>',['boom','Boom']])},
 {title:'Hidden numbers',text:'You see your own wires, not the crew\'s. Every stand is sorted from the lowest number to the highest.',pic:()=>hpics([['order','Sorted'],['tile',null,'?']])},
 {phase:'open',title:'The opening token',text:'Everyone starts by showing one of their wires. A token with its number goes in front of it.',pic:()=>hpics([['tile','Yours',5,'b'],'>',['token','Shown',5]])},
 {phase:'open',title:'Why a token?',text:'The crew can use it as a clue: they now know that wire, and where it sits in the order.',pic:()=>hpics([['token','Clue',5],'>',['order','Order'] ])},
 {phase:'turn',title:'A dual cut',text:'Point at a crewmate\'s wire and say a number you hold. If they have that number, both wires are cut.',pic:()=>hpics([['tile','Yours',7,'b'],'>',['tile','Theirs',null,'back'],'>',['cut','Both cut']])},
 {phase:'turn',title:'A wrong guess',text:'If the wire is not that number, the fuse burns one step. A token then shows the true number.',pic:()=>hpics([['tile',null,4,'b'],['fuse','-1',2]])},
 {phase:'turn',title:'Use the clues',text:'Wires are sorted low to high, and tokens show numbers. A wire beside a low token must be low too.',pic:()=>hpics([['order','Sorted'],['token','Token',3]])},
 {phase:'turn',title:'Never point at red',text:'Red wires must never be cut. Pointing at one blows up the bomb, so only point at wires you trust.',pic:()=>hpics([['tile','Red','R','r'],'>',['boom','Boom']])},
 {phase:'number',title:'Say a number you hold',text:'You can only say a number that you hold yourself. Tap one of your glowing wires.',pic:()=>hpics([['tile','Yours',7,'b'],'>',['tap','Say it']])},
 {phase:'number',title:'A hit cuts two',text:'A match cuts both wires: theirs and yours. When all four of a number are cut, it is finished.',pic:()=>hpics([['cut','Hit'],'>',['check','Finished']])},
 {phase:'wire',title:'Point at a wire',text:'You chose a number. Now tap the crewmate\'s wire you think is that number.',pic:()=>hpics([['tile','Say',7,'b'],'>',['tile','Point',null,'back']])},
 {phase:'wire',title:'Not sure?',text:'The bulb shows the likeliest wire. A miss burns one fuse step and shows a token.',pic:()=>hpics([['fuse','One step',3],['token','Token',7]])},
 {phase:'solo',title:'A solo cut',text:'If you hold every uncut wire of a number, cut them yourself. A solo cut never fails and costs nothing.',pic:()=>hpics([['tile','All yours',6,'b'],'>',['check','Cut']])},
 {phase:'solo',title:'Take free cuts',text:'Solo cuts make progress without risking the fuse, so they are usually a good move.',pic:()=>hpics([['fuse','Safe',3],['check','Free']])},
 {phase:'reveal',title:'Only red wires',text:'You hold nothing but red wires. Show them to the crew. You are done, and nothing blows up.',pic:()=>hpics([['tile','Red','R','r'],'>',['check','Done']])},
 {phase:'reveal',title:'Your crew goes on',text:'The rest of the crew keeps cutting. You still win or lose together.',pic:()=>hpics([['stand','Crew'],'>',['cut','Keep cutting']])},
 {phase:'tag',title:'A token on a wire',text:'A token goes in front of a wire. Everyone sees its number, and the sort order adds clues.',pic:()=>hpics([['tile','Wire',null,'back'],'>',['token','Token',4]])},
 {phase:'tag',title:'After a miss',text:'A wrong cut tags the wire that was pointed at, so the crew learns its true number.',pic:()=>hpics([['fuse','Miss',2],'>',['token','Tagged',4]])},
 {phase:'answer',title:'Your choice',text:'The job asks you something. Tap one of the glowing wires, players or buttons to answer.',pic:()=>hpics([['tap','Tap a glow']])},
 {phase:'answer',title:'Not sure?',text:'The light bulb shows the crew advisor\'s pick, with a reason. You can follow it or choose your own.',pic:()=>hpics([['star','Advisor'],'>',['tap','Your pick']])},
 {phase:'gear',title:'Equipment',text:'Gear cards unlock when the crew cuts certain numbers. Tap a glowing card to use it once.',pic:()=>hpics([['lock','Locked'],'>',['gear','Ready']])},
 {phase:'gear',title:'Finish the move',text:'Keep tapping glowing wires, players or buttons until the move is done. The cross cancels it.',pic:()=>hpics([['tap','Tap'],'>',['check','Done']])},
 {phase:'claim',title:'Claim the turn',text:'In this job there is no fixed order. Tap Claim when you can make progress.',pic:()=>hpics([['turn','Turn'],'>',['tap','Claim']])},
 {phase:'claim',title:'One at a time',text:'If two players claim, the better placed one goes first. Your wires stay your own secret.',pic:()=>hpics([['stand','Crew'],'>',['turn','One turn']])}
];
// ---------------------------------------------------------------- phases
const HLP_TAGQ=['tagPick','lackTag','infoNeg','infoFalse'];
// the moment the player is deciding in (null when it is not their turn or nothing is asked of them)
function hlpPhase(){try{if(!G||!UI.started||G.over||UI.brief||passTo()>=0)return null;const V=UI.V;if(!V||V.seat<0)return null;const me=V.seat,sel=UI.sel;
  if(V.q&&V.q.who===me&&V.q.opts){const k=V.q.kind;return k==='infoStd'?'open':HLP_TAGQ.includes(k)?'tag':'answer'}
  if(sel&&(sel.mode==='choose'||sel.mode==='multi'||sel.mode==='flipown'))return 'gear';
  const L=V.legal;
  if(!L||decider()!==me){const off=(V.off||[]).some(m=>m.a==='claim'||m.a==='snip');return off&&(G.step==='claim'||G.step==='snip')?'claim':null}
  if(sel&&sel.mode==='dual'){if(sel.tool||sel.two)return 'gear';if(sel.tg.length&&sel.v==null)return 'number';if(sel.v!=null&&!sel.tg.length)return 'wire';if(sel.fu!=null)return 'wire'}
  if(L.plain.length)return 'turn';
  if(L.solo.length)return 'solo';
  if(L.other.some(m=>m.a==='reveal'))return 'reveal';
  return null}catch(e){return null}}
// ---------------------------------------------------------------- the advice: where the finger goes and why
function hlpWhy(t,n){const s=String(t||'').replace(/\s+/g,' ').trim();if(!s)return '';const one=s.split(/(?<=[.!?])\s+/)[0].replace(/\.$/,'.');const w=one.split(' ');return w.length<=n?one:w.slice(0,n).join(' ').replace(/[,:;]$/,'')+'.'}
function hlpMine(V,v){for(const st of V.stands)if(st.mine)for(const x of st.slots)if(!x.cut&&!x.flip&&x.v===v)return x;return null}
// one function gives the finger, the glow and the sweep's check: {to:uid|selector-element, from:uid|null, why, kind}
function hlpPlan(){const V=UI.V;if(!V||V.seat<0||!G||G.over||UI.brief||passTo()>=0||UI.paused)return null;const me=V.seat,sel=UI.sel;
  if(V.q&&V.q.who===me&&V.q.opts){if(sel)return null;const q=V.q;let i=-1;try{const K=knowledge(me);i=aiAnswer(K,null,AILV.hard)}catch(e){return null}
    const o=q.opts[i];if(!o||!o.d)return null;
    if(q.kind==='infoStd'&&o.d.u!=null)return {kind:'q',to:{u:o.d.u},why:'Crewmates hold this number too, so a token here helps most.'};
    if(o.d.u!=null)return {kind:'q',to:{u:o.d.u},why:'The crew advisor\'s best pick here.'};
    if(o.d.st!=null&&o.d.k!=null){const sl=G.st[o.d.st]&&G.st[o.d.st].w[o.d.k];return sl?{kind:'q',to:{u:sl.u},why:'The crew advisor\'s best pick here.'}:null}
    if(o.d.seat!=null)return {kind:'q',to:{seat:o.d.seat},why:'The crew advisor\'s best pick here.'};
    const n=TBL.items&&TBL.items.findIndex(it=>it.t==='q'&&it.i===i);if(n>=0)return {kind:'q',to:{chip:n},why:'The crew advisor\'s best pick here.'};return null}
  if(!V.legal||decider()!==me||V.q)return null;
  const W=wwk(V);const sg=W&&W.suggestion,m=sg&&sg.m;if(!m||legal(m,me))return null;const why=hlpWhy(sg.why,15);if(!why)return null;
  const tgt=m.a==='dual'?(G.st[m.st]&&G.st[m.st].w[m.ks[0]]):null;
  if(m.a==='dual'&&!m.tool&&!m.two&&m.ks.length===1&&!m.own&&tgt){const mine=hlpMine(V,m.v);if(!mine)return null;
    if(!sel)return {kind:'dual',from:{u:mine.u},to:{u:tgt.u},why};
    if(sel.mode==='dual'&&!sel.tool&&!sel.two&&sel.fu==null){
      if(sel.tg.length===1&&sel.v==null&&sel.tg[0].st===m.st&&sel.tg[0].k===m.ks[0])return {kind:'dual',to:{u:mine.u},why};
      if(!sel.tg.length&&sel.v===m.v)return {kind:'dual',to:{u:tgt.u},why}}
    return null}
  if(sel)return null;
  if(m.a==='solo'&&!m.flip&&!m.ep){const mine=hlpMine(V,m.v);return mine?{kind:'solo',to:{u:mine.u},why}:null}
  if(m.a==='reveal'){const x=V.stands.filter(s=>s.mine).map(s=>s.slots).flat().find(y=>!y.cut&&y.c==='r');return x?{kind:'reveal',to:{u:x.u},why:'Only red wires are left in your hand: show them.'}:null}
  if(m.a==='eq'&&EQUIP[m.id]&&eqMovesFor(V,m.id).length)return {kind:'eq',to:{eq:m.id},why:hlpWhy(EQUIP[m.id].n+' is worth using now.',15)};
  return null}
function hlpEl(r){if(!r)return null;if(r.u!=null)return document.querySelector('#tb .tile[data-u="'+r.u+'"]');if(r.seat!=null)return document.querySelector('#tb .plate[data-seat="'+r.seat+'"]');if(r.eq!=null)return document.querySelector('#tb .eqk[data-eq="'+r.eq+'"]');if(r.chip!=null)return document.querySelector('#tb .chip[data-chip="'+r.chip+'"]');return null}
function hlpSuggest(){let p=null;try{p=hlpPlan()}catch(e){console.error(e)}if(!p||!hlpEl(p.to))return null;
  return {why:p.why,target:()=>hlpEl(p.to),from:p.from?()=>hlpEl(p.from):null}}
// ---------------------------------------------------------------- wiring
let _hlpInit=false;
function hlpInit(){if(_hlpInit||typeof GXH==='undefined')return;_hlpInit=true;
  GXH.init({game:'short-fuse',defaultOn:true,steps:HLP_STEPS,rules:HLP_RULES,avoid:'.glow,.sel,#tray .chip,#mine .chip,#over .big,#cover .big'});
  GXH.bulb({el:'#bulbbtn',suggest:hlpSuggest,rulesFor:hlpPhase})}
function hlpAfter(){hlpInit();if(typeof GXH==='undefined')return;
  const st=document.getElementById('start');const busy=!G||!UI.started||G.over||(st&&!st.hidden)||UI.brief||UI.pause;
  GXH.phase(busy?null:hlpPhase())}
