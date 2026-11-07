// ===================== part 10: the tutorial = a COACHED FIRST GAME ("The Lantern Race") =====================
// A real game against Cobalt (the real computer) with every legal move allowed from turn 1; nothing is forced. The deck is only stacked so the
// Rift Gate is in your first hand, a Deck Cannon comes early and the Rogue Wave and Maelstrom rise soon. Grandmother Osk speaks just in time:
// the first time a rule matters, when you make a good or a poor move, and on Cobalt's moves. One bubble at a time, docked in the side panel
// (never over the board), never blocks input, dismissible. At the end: a walk through the result with your real numbers, then
// "Things you'll meet later" for any rule that did not come up. Words: OSK_TEXT / OSK_RIVAL in texts.js. Rule ids: TUTORIAL-COVERAGE.md.
const TUT_GAME='tidewake';
const OSK={on:false,said:{},later:[],q:[],cur:null,t0:0,logI:0,riv:0,rivN:0,myLays:0,walk:null,prologue:false,tmr:0};
window.TW_OSK=OSK;                                                 // tests read .said / .later / .cur
const OSK_RULES=['goal','reloc','roll','lay','sail','chain','collide','levmove','levsink','cannon','wave','gate','mael','swap','end','tie','more'];
function tutOn(){return !!UI.tut&&OSK.on}
function firstTime(){try{return !localStorage.getItem('tw_played')&&!localStorage.getItem('tw_offered')}catch(e){return true}}
function tutBtn(cls){return typeof GXT==='undefined'?'':GXT.menuHTML({game:TUT_GAME,first:firstTime(),cls:cls,launch:tutStart})}
function tutHold(){return false}
// ---------------------------------------------------------------- start / leave
function tutStart(o){if(NET.on)return;OSK.prologue=!!(o&&o.prologue);try{GX.close()}catch(e){}try{localStorage.setItem('tw_offered','1')}catch(e){}
  const s=defaultSetup();s.mode='me';s.np=2;s.variant=null;s.noMon=false;s.exp={rift:1,wave:1,maelstrom:1,cannon:1};
  s.seats[0]={h:true,lv:'normal',col:0};s.seats[1]={h:false,lv:'easy',col:3};
  UI.tut=1;OSK.starting=1;try{startGame(s,{seed:20261107})}finally{OSK.starting=0}oskRig();
  Object.assign(OSK,{on:true,said:{},later:[],q:[],cur:null,t0:0,logI:G.logN,riv:0,rivN:0,myLays:0,walk:null});
  UI.guide='light';UI.confirm=null;try{GXH.hide()}catch(e){}
  clearInterval(OSK.tmr);OSK.tmr=setInterval(oskTick,250);render();oskTick()}
// stack the piles (only order changes; every piece is a real one): Rift Gate in your hand, a cannon 3rd from the top, the wave and the Maelstrom rise early
function oskRig(){try{const h=G.hands[0],gi=G.deck.indexOf(56);if(gi>=0&&h.indexOf(56)<0){G.deck[gi]=h[2];h[2]=56}
  for(let k=0;k<2;k++){const ci=G.deck.findIndex((c,j)=>c>=57&&j>=k);if(ci>k){const c=G.deck.splice(ci,1)[0];G.deck.splice(k,0,c)}}
  for(const [id,at] of [[MAEL_ID,1],[WAVE_ID,3]]){const k=G.mdeck.indexOf(id);if(k>at){G.mdeck.splice(k,1);G.mdeck.splice(at,0,id)}}}catch(e){console.error(e)}}
function tutLeave(){OSK.on=false;clearInterval(OSK.tmr);oskHide();oskWalkClose();UI.tut=0;clearTimeout(UI.tm);UI.gen++;UI.started=false;UI.busy=false;UI.sel=null;UI.sunk=[];UI.mph=null;
  try{GXH.hide()}catch(e){}try{kitReset()}catch(e){}try{PH.pop=null;PH.pd=null;PH.cur=null;phAfter()}catch(e){}}
// Story is preceded by the coached game (the prologue) until it has been finished once
function storyOpen(){if(typeof GXC==='undefined')return;if(typeof GXT!=='undefined'&&!NET.on&&!GXT.isDone(TUT_GAME))tutStart({prologue:true});else campOpen()}
// a first-time player tapping Play is offered the coached game once
function tutOffer(go){if(typeof GXT==='undefined'||NET.on||!firstTime()||GXT.status(TUT_GAME).seen)return false;
  try{localStorage.setItem('tw_offered','1')}catch(e){}
  const d=document.createElement('div');d.className='gxt-end';d.setAttribute('data-help','');d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');d.setAttribute('aria-label','New here?');
  d.innerHTML='<div class="gxt-endc"><div class="gxt-et">New here?</div><div class="gxt-ex">Play one real game against Cobalt. Grandmother Osk explains each rule when it matters.</div><div class="gxt-eb"><button type="button" class="gxt-b pri" data-tutoffer="learn">Play with Osk\'s help</button><button type="button" class="gxt-b" data-tutoffer="play">Just play</button></div></div>';
  document.body.appendChild(d);
  d.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-tutoffer]');if(!b)return;e.stopPropagation();d.remove();if(b.dataset.tutoffer==='learn')tutStart();else go()});
  return true}
// ---------------------------------------------------------------- the bubble (one at a time, in the panel flow: it pushes the panel down, never covers the board)
function oskFill(id,v){const t=OSK_TEXT[id]||[id,''];v=v||{};const f=x=>String(x).replace(/\{(\w+)\}/g,(m,k)=>v[k]!=null?v[k]:k==='riv'?nm(1):k==='me'?nm(0):'');return [f(t[0]),f(t[1])]}
// queue a line; rule ids are spoken once. pri: lower goes first
function oskSay(id,v,o){o=o||{};if(!OSK.on||OSK.walk)return;const rule=OSK_RULES.indexOf(id)>=0;if(rule&&(OSK.said[id]||OSK.q.some(x=>x.id===id)))return;
  const [title,line]=o.text||oskFill(id,v);if(rule)OSK.said[id]=OSK.said[id]||'queued';OSK.q.push({id,title,line,also:o.also||[],pri:o.pri||5,rival:!!o.rival});OSK.q.sort((a,b)=>a.pri-b.pri)}
function oskShowNext(){if(!OSK.q.length)return;const n=OSK.q.shift();OSK.cur=n;OSK.t0=Date.now();
  for(const id of [n.id].concat(n.also))if(OSK_RULES.indexOf(id)>=0)OSK.said[id]=G?'turn '+G.turn:'shown';oskPlace()}
function oskHide(){OSK.cur=null;const e=document.getElementById('osk');if(e)e.remove()}
function oskHTML(c){return `<div class="osk-p" aria-hidden="true"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="19" fill="#2c4a5e" stroke="#e3b24b" stroke-width="2"/><path d="M9 33c2-7 6-10 11-10s9 3 11 10" fill="#cfd8dc"/><circle cx="20" cy="16" r="7" fill="#f1c9a5"/><path d="M12 15c1-7 15-7 16 0-3-3-13-3-16 0z" fill="#eceff1"/><circle cx="31" cy="9" r="3.4" fill="#ffcf5a"/></svg><span>Osk</span></div><div class="osk-t"><b>${esc(c.title)}</b><span>${esc(c.line)}</span></div><button type="button" class="osk-x" data-osk="x" aria-label="Dismiss Osk's tip">&times;</button>`}
function oskPlace(){const c=OSK.cur;let e=document.getElementById('osk');if(!c||!OSK.on){if(e)e.remove();return}
  const host=PH.on?document.getElementById('ps'):(document.getElementById('main')||{}).parentNode;if(!host)return;
  if(!e){e=document.createElement('div');e.id='osk';e.setAttribute('role','status');e.setAttribute('data-help','');e.setAttribute('aria-live','polite')}
  if(e.dataset.k!==c.id+c.line){e.innerHTML=oskHTML(c);e.dataset.k=c.id+c.line;e.classList.toggle('riv',c.rival)}
  const ref=PH.on?host.firstChild:document.getElementById('main');if(e.parentNode!==host||(PH.on&&host.firstChild!==e))host.insertBefore(e,ref)}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-osk]');if(!b)return;e.stopPropagation();
  if(b.dataset.osk==='x'){oskHide();oskShowNext()}else oskWalkStep(b.dataset.osk)},true);
{const _r=render;render=function(){const r=_r.apply(this,arguments);if(OSK.on)try{oskPlace()}catch(e){}return r};
 const _pa=phAfter;phAfter=function(){const r=_pa.apply(this,arguments);if(OSK.on)try{oskPlace()}catch(e){}return r}}
// ---------------------------------------------------------------- when each rule first matters (polled; reads the game, never changes it)
function oskTick(){if(!OSK.on||!G||!UI.started){return}
  const me=0,riv=1,S=G.ships[me],R=G.ships[riv];
  if(G.phase==='setup'&&sideToAct()===me)oskSay('goal',null,{pri:0});
  if(S.x!=null)oskSay('reloc',null,{pri:1});
  // new log lines since the last look
  const fresh=G.log.filter(l=>l.i>OSK.logI).reverse();OSK.logI=G.logN;
  for(const l of fresh){const t=l.t;let m;
    if((m=t.match(/rolls (\d)\+(\d)=(\d+)/))){const n=+m[3];oskSay('roll',{n:m[1]+'+'+m[2]+'='+n,wake:n>=6&&n<=8?'6, 7 or 8 wakes the leviathans: each swims a square or turns.':'calm, the leviathans sleep. Only a 6, 7 or 8 wakes them.'},{pri:2})}
    if(/ moves | turns |swims/.test(t)&&/^(?!The Maelstrom)/.test(t)&&!/Rogue Wave/.test(t)&&G.mons.some(x=>t.indexOf(levName(x.id))===0))oskSay('levmove',null,{pri:3});
    if(/torn from the sea|ran into|crushed|blocked by/.test(t))oskSay('levsink',null,{pri:2});
    if(/Rogue Wave rises/.test(t))oskSay('wave',null,{pri:1});
    if(/Maelstrom/.test(t))oskSay('mael',null,{pri:1});
    if(/Rift Gate/.test(t))oskSay('gate',null,{pri:2});
    if(/Deck Cannon/.test(t)&&t.indexOf(nm(me))===0)oskSay('cannon',null,{pri:1});
    if(/meet on one wake/.test(t))oskSay('collide',null,{pri:1});
    if(/swaps a tile/.test(t))oskSay('swap',null,{pri:1});
    if(/relocates the start/.test(t))oskSay('reloc',null,{pri:1});
    if(t.indexOf(nm(me)+' lays a current')===0||t.indexOf(nm(me)+' opens a Rift Gate')===0){OSK.myLays++;if(OSK.myLays===1)oskSay('sail',null,{pri:2});else oskJudge()}
    if(t.indexOf(nm(riv)+' lays a current')===0||t.indexOf(nm(riv)+' opens')===0){OSK.rivN++;
      if(!OSK.said.chain)oskSay('chain',null,{pri:3,rival:true,also:[]});else if(!OSK.said.collide)oskSay('collide',null,{pri:3,rival:true});
      else if(OSK.rivN%2===0){const k=OSK.riv++%OSK_RIVAL.length;const steps=(G.log.find(x=>x.i>l.i-1&&/sails? (\d+)/.test(x.t))||{}).t;const n=R.x!=null?'a few':'0';
        oskSay('rival'+OSK.rivN,null,{pri:8,rival:true,text:['Cobalt\'s move',OSK_RIVAL[k].replace(/\{riv\}/g,nm(riv)).replace('{n}',n)]})}}}
  // state that matters now
  if(G.q&&G.q.who===me){if(G.q.kind==='cannonDraw')oskSay('cannon',null,{pri:0});if(G.q.kind==='bonus')oskSay('swap',null,{pri:0});
    if(G.q.opts.some(o=>o.h==='dReloc'))oskSay('reloc',null,{pri:0});if(/^gate/.test(G.q.kind))oskSay('gate',null,{pri:0})}
  if(G.phase==='play'&&sideToAct()===me&&!UI.busy){try{if(hlpPhase()==='lay')oskSay('lay',null,{pri:1})}catch(e){}
    const h=G.hands[me]||[];if(h.indexOf(56)>=0&&OSK.said.lay)oskSay('gate',null,{pri:3});if(h.some(c=>c>=57))oskSay('cannon',null,{pri:2})}
  if(G.wave)oskSay('wave',null,{pri:1});if(G.mons.some(m=>m.k==='M'))oskSay('mael',null,{pri:1});
  if(S.alive&&R.alive&&OSK.myLays>=2)oskSay('swap',null,{pri:4});
  try{if(S.alive&&S.x!=null&&!UI.busy&&adjMons(G,S).length)oskSay('levsink',null,{pri:3})}catch(e){}
  if(G.over&&!UI.busy){oskSay('end',{why:oskEndWhy()},{pri:0})}
  // show: nothing up -> next; a tip up for 6 s (rival lines 4 s) gives way to a waiting rule
  const age=Date.now()-OSK.t0;
  if(!OSK.cur)oskShowNext();else if(OSK.q.length&&age>3000&&(OSK.q[0].pri<=OSK.cur.pri||age>5000))oskShowNext();
  else oskPlace();
  if(G.over&&!UI.busy&&!OSK.walk&&OSK.said.end&&OSK.cur&&OSK.cur.id==='end'&&age>2500)oskWalkOpen()}
// one line on your move: good (it sinks Cobalt) or poor (your bow now faces a leviathan's arrow)
function oskJudge(){try{const S=G.ships[0],R=G.ships[1];
  if(!R.alive&&S.alive){oskSay('good'+G.turn,null,{pri:2,text:oskFill('good',{why:'Your current sank '+nm(1)+'. A tile that ends a rival is the strongest move there is.'})});return}
  if(S.alive&&S.x!=null&&adjMons(G,S).length)oskSay('poor'+G.turn,null,{pri:4,text:oskFill('poor',{why:'Your junk now sits next to a leviathan. If its arrow points at you, a 6, 7 or 8 can sink you.'})})}catch(e){}}
function oskEndWhy(){const w=(G.over&&G.over.win)||[];if(!w.length)return 'Both junks went down together, so nobody keeps the lantern.';
  return w.indexOf(0)>=0?'Yours is the last junk afloat: the lantern is yours, child.':nm(1)+' is the last junk afloat, so he keeps the lantern. Tomorrow we race again.'}
// ---------------------------------------------------------------- the end: walk through the result with the real numbers, then "Things you'll meet later"
function oskWalkData(){const W=(G.over&&G.over.win)||[],out=s=>s.alive?'still afloat':String(s.out||'sank');const L=G.log.slice().reverse();
  const lays=i=>L.filter(l=>l.t.indexOf(nm(i)+' lays a current')===0||l.t.indexOf(nm(i)+' opens a Rift Gate')===0).length;
  const steps=[
    ['How it ended',`You: ${out(G.ships[0])}. ${nm(1)}: ${out(G.ships[1])}.`],
    ['Currents laid',`You laid ${lays(0)} tile${lays(0)===1?'':'s'}, ${nm(1)} laid ${lays(1)}. The race lasted ${G.turn} turns.`],
    ['The one rule that scores',`Last junk afloat wins. ${W.length?(W.indexOf(0)>=0?'That is you!':nm(1)+' outlasted you this time.'):'Nobody was left, so it is a draw.'}`]];
  OSK.later=OSK_RULES.filter(id=>!OSK.said[id]||OSK.said[id]==='queued');if(OSK.later.indexOf('more')<0)OSK.later.push('more');
  steps.push(['Things you\'ll meet later',OSK.later.map(id=>OSK_TEXT[id]?oskFill(id,{n:'6+2=8',wake:'a 6, 7 or 8 wakes the leviathans.',why:''})[0]+': '+oskFill(id,{n:'A roll',wake:'a 6, 7 or 8 wakes the leviathans.',why:''})[1]:'').filter(Boolean).join(' | ')]);
  for(const id of OSK.later)OSK.said[id]=OSK.said[id]&&OSK.said[id]!=='queued'?OSK.said[id]:'later card';
  return steps}
function oskWalkOpen(){oskHide();OSK.q=[];const steps=oskWalkData();OSK.walk={i:0,steps};
  const d=document.createElement('div');d.id='oskwalk';d.className='gxt-end';d.setAttribute('data-help','');d.setAttribute('role','dialog');d.setAttribute('aria-label','The race, counted');document.body.appendChild(d);oskWalkDraw()}
function oskWalkDraw(){const d=document.getElementById('oskwalk'),w=OSK.walk;if(!d||!w)return;const s=w.steps[w.i],last=w.i===w.steps.length-1;const first=window.CAMPAIGN&&window.CAMPAIGN.chapters&&window.CAMPAIGN.chapters[0];
  const later=last?'<ul class="osk-later">'+s[1].split(' | ').map(x=>{const k=x.indexOf(': ');return `<li><b>${esc(x.slice(0,k))}</b> ${esc(x.slice(k+2))}</li>`}).join('')+'</ul>':`<div class="gxt-ex">${esc(s[1])}</div>`;
  d.innerHTML=`<div class="gxt-endc osk-walk"><div class="osk-step">${w.i+1} / ${w.steps.length}</div><div class="gxt-et">${esc(s[0])}</div>${later}<div class="gxt-eb">${last?(OSK.prologue&&first?'<button type="button" class="gxt-b pri" data-osk="chapter">Start chapter 1</button>':'<button type="button" class="gxt-b pri" data-osk="again">Play a real game</button>')+'<button type="button" class="gxt-b" data-osk="menu">Menu</button>':'<button type="button" class="gxt-b pri" data-osk="next">Next</button>'}</div></div>`}
function oskWalkClose(){const d=document.getElementById('oskwalk');if(d)d.remove();OSK.walk=null}
function oskWalkStep(a){const w=OSK.walk;if(!w)return;if(a==='next'){w.i=Math.min(w.i+1,w.steps.length-1);oskWalkDraw();return}
  OSK.done=Object.assign({},OSK.said);try{GXT.markDone(TUT_GAME)}catch(e){}const first=window.CAMPAIGN&&window.CAMPAIGN.chapters&&window.CAMPAIGN.chapters[0];
  tutLeave();showStart();if(a==='chapter'&&first)GXC.play(first.id);else if(a==='again'){try{localStorage.setItem('tw_played','1')}catch(e){}}}
// leaving the coached game any other way (Menu > New game, Story, the title) switches Osk off
{const _sg=startGame;startGame=function(s,o){if(OSK.on&&!OSK.starting){OSK.on=false;clearInterval(OSK.tmr);oskHide();oskWalkClose();UI.tut=0}return _sg.apply(this,arguments)}
 const _ss=showStart;showStart=function(){if(OSK.on){OSK.on=false;clearInterval(OSK.tmr);oskHide();oskWalkClose();UI.tut=0}return _ss.apply(this,arguments)}}
