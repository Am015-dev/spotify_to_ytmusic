// ===================== part 4: the rest of the dock, popups, start screen =====================
function renderBar(){const el=$('#barstat');if(!el||!G)return;const L=G.mons.filter(m=>m.k==='L').length;const solo=G.variant==='solo',es=G.variant==='easysolo';
  const toRise=G.mdeck.filter(x=>x<10).length;const R=UI.lastRoll;
  el.innerHTML=G.phase==='setup'?`<span class="lg">Choose start marks</span>`:`<span class="lg" title="Turns played">Turn <b>${G.turn}</b>${es?` of ${G.opts.goal}`:''}</span><span class="lg" title="Current tiles left in the draw pile">Tiles left <b>${G.deck.length}</b></span><span title="Leviathans (sea monsters) on the board now">Monsters<span class="lg2"> on board</span> <b>${L}</b></span>${solo?`<span title="Leviathans that have not risen yet. You win when they are all gone.">Still to rise <b>${toRise}</b></span>`:''}${R?`<span class="lg" title="Leviathans wake when the two dice total 6, 7 or 8">Wake roll <b>${R[0]}+${R[1]}=${R[0]+R[1]}</b> ${R[0]+R[1]>=6&&R[0]+R[1]<=8?'(stir)':'(calm)'}</span>`:''}`;
  $('#dockt').textContent=G.over?'Game over':UI.busy?'Watch the sea':G.phase==='setup'?'Start marks':'What to do now'}
function renderRoad(){const el=$('#road');if(!el||!G)return;const cur=UI.busy&&UI.curTurn!=null?UI.curTurn:G.q?G.q.who:G.phase==='setup'?G.order[G.sp]:G.cur;
  el.innerHTML=G.order.map(i=>{const s=G.ships[i];const me=viewSeat()===i;return `<span class="rs${i===cur&&!G.over?' cur':''}${s.alive?'':' dead'}${me?' me':''}" title="${esc(G.seats[i].human?'Human':'Computer ('+G.seats[i].lv+')')}">${dot(i)}${esc(nm(i))}${G.team?` <small>${'AB'[G.team[i]]}</small>`:''}${s.alive&&G.phase==='play'?` <small>${G.hands[i].length}t</small>`:''}</span>`}).join('')}
function renderSteps(){const el=$('#stepsw');if(!el||!G)return;if(G.phase==='setup'||G.over){el.innerHTML='';el.hidden=true;return}el.hidden=false;
  const st=UI.busy?(UI.stepNow!=null?UI.stepNow:0):(G.step==='act'?1:0);const names=['1 Roll','2 Place','3 Sail','4 Draw'];
  el.innerHTML=names.map((n,i)=>`<span class="${i===st?'on':i<st?'done':''}">${n}</span>`).join('')+(UI.guide==='full'?`<small class="tiny stephint">You only act in step 2. Roll, Sail and Draw happen by themselves.</small>`:'')}
function renderRes(){const el=$('#res');if(!el)return;let h='';
  if(UI.mph)h+=mphHTML();
  if(UI.res)h+=`<div class="res ${UI.res.cls}">${esc(UI.res.text)}</div>`;el.innerHTML=h;el.hidden=!h}
function lessonHTML(c){const g=UI.guide==='full';return `<div class="coach"><h4>${esc(c.t)}<button class="gsw full" data-a="guidetoggle" title="Turn the guide down" aria-label="Guide is Full: tap to turn it down">Guide: Full &#9662; tap to turn down</button></h4><p>${esc(c.x)}</p><button class="btn small" data-a="coachok">Got it</button></div>`}
function nextLesson(){for(const c of COACH){if(c.id==='start'&&G&&G.phase!=='setup')UI.seen.start=1;if(UI.trig[c.id]&&!UI.seen[c.id])return c}return null}
function coachTriggers(){if(!G||G.over&&false)return;const d=sideToAct();const mine=d>=0&&G.seats[d].human&&!UI.busy&&!mustPass(d);
  if(mine&&G.phase==='setup')UI.trig.start=1;
  if(mine&&G.phase==='play'&&G.step==='act'&&!G.q){UI.trig.cur=1;if(UI.seen.cur){if(UI.A&&UI.A.st==='edge'||G.turn>=3)UI.trig.edge=1;if(UI.seen.edge&&(G.turn>=4||(UI.A&&UI.A.coll)))UI.trig.coll=1}
    const S=G.ships[d];if(S&&S.x!=null&&G.mons.some(m=>m.k==='L'&&Math.abs(m.x-S.x)+Math.abs(m.y-S.y)<=2))UI.trig.lev=1}
  if(G.stats&&G.stats.refill)UI.trig.min3=1;if(G.over)UI.trig.end=1}
function renderCoach(){const el=$('#coach');if(!el)return;
  if(UI.confirm){const to=UI.confirm==='light';el.innerHTML=`<div class="coach"><h4>${to?'Turn the guide down?':'Resume the full guide?'}</h4><p>${to?'You will keep warnings and a "safest move" button, and lessons wait for you.':'Lessons you have not seen will continue where they stopped.'}</p><div class="row"><button class="btn small pri" data-a="guideyes">${to?'Yes, Light':'Yes, Full'}</button><button class="btn small" data-a="guideno">Keep ${to?'Full':'Light'}</button></div></div>`;return}
  if(UI.guide==='full'){const c=!UI.busy&&nextLesson();if(c){el.innerHTML=lessonHTML(c);return}el.innerHTML=`<div class="coach light"><button class="gsw full" data-a="guidetoggle" aria-label="Guide is Full: tap to turn it down">Guide: Full &#9662; tap to turn down</button> <span class="tiny">lessons appear as things happen</span></div>`;return}
  el.innerHTML=UI.guided?`<div class="coach light"><button class="gsw" data-a="guidetoggle" aria-label="Guide is Light: tap for full lessons">Guide: Light &#9662; tap for lessons</button></div>`:''}
function kitOverlay(){if(!G||!kitOk())return;let legal=[];const gh=UI.gh;UI.gh=null;
  if(!UI.busy&&!G.over){const d=sideToAct();if(d>=0&&G.seats[d].human&&!mustPass(d)){
    if(G.q){const q=G.q;if(q.kind==='gatePlace'&&q.ctx)legal=[{c:q.ctx.tx,r:q.ctx.ty}];else for(const o of q.opts)if(o.d&&o.d.x!=null&&(o.h==='dGateAt'||o.h==='dReloc'))legal.push({c:o.d.x,r:o.d.y})}
    else if(G.phase==='play'&&G.step==='act'&&UI.canPlace&&UI.fronts)legal=UI.fronts.map(s=>({c:G.ships[s].x,r:G.ships[s].y}))}}
  try{TWKit.setLegal(legal);if(gh&&!UI.busy)TWKit.ghost(gh.x,gh.y,BASE_PATHS[CUR_TYPE[gh.card]],{rot:gh.rot,valid:gh.valid,trace:gh.trace});else TWKit.ghost(null)}catch(e){console.error(e)}}
function musicEval(){if(!G||!G.ships)return;let tense=false;const alive=G.ships.filter(s=>s.alive);if(alive.length<=2&&G.np>2)tense=true;
  for(const s of alive){const p=shipPos(s);if(!p)continue;for(const m of G.mons)if(m.k==='L'&&Math.abs(m.x-p.c)+Math.abs(m.y-p.r)<=2)tense=true}musicMood(tense&&!G.over?'tension':'calm')}
function render(){if(!G||!UI.started)return;try{if(window.PerfHUD)PerfHUD.wake()}catch(e){}
  UI.gh=null;UI.fronts=null;UI.canPlace=false;UI.A=null;UI.pinH='';UI.route=null;
  const d=sideToAct();const key=G.over?'over':d+':'+G.logN+':'+G.phase+(G.q?G.q.kind:'');
  const html=mainHTML();$('#main').innerHTML=html;{const pn=$('#pin');if(pn){pn.innerHTML=UI.pinH||'';pn.hidden=!UI.pinH}}
  if(!UI.busy&&UI.canPlace&&UI.sel){const pl=UI.moves.filter(m=>m.a==='place');UI.fronts=[...new Set(pl.map(m=>m.s))];const c=G.hands[d][UI.sel.t];if(c!=null&&isCur(c)&&UI.A){const S=G.ships[UI.sel.s];UI.gh={x:S.x,y:S.y,card:c,rot:UI.sel.r,valid:!UI.A.bad,trace:UI.A.steps};try{UI.route=routeDesc(UI.A,S)}catch(e){console.error(e)}}}
  if(key!==UI.lastKey){UI.lastKey=key;if(!UI.busy&&d>=0&&G.seats[d].human&&!mustPass(d)&&!G.over)sfx('turn')}
  if(!UI.busy&&d>=0&&G.seats[d].human&&!G.over&&!mustPass(d))GX.showDock();
  recapSync();coachTriggers();renderBar();renderRoad();renderSteps();renderRes();renderCards();renderCoach();kitOverlay();musicEval();ovUpdate();
  const t=$('#chip');if(t)t.textContent=!UI.busy&&G.phase==='setup'&&d>=0&&G.seats[d].human&&!mustPass(d)?'Tap a gold mark on the edge':'';
  if(GX.open)renderOpenDrawer();qTimerSync();netAfter()}
function refresh(){if(!G||!UI.started||UI.acting)return;kitSync();render()}
// ---------- interrupt timer ----------
function qTimerSync(){const q=G&&G.q;if(!q||q.kind!=='doom'||(UI.qTime<=0&&!NET.on)||UI.busy||!G.seats[q.who].human||(NET.on?isClient()&&q.who!==NET.mySeat:mustPass(q.who))){UI.qKey=null;return}
  const key=G.logN+':'+q.who;if(UI.qKey!==key){UI.qKey=key;UI.qT0=Date.now()}}
setInterval(()=>{try{if(!G||!UI.qKey||UI.pause)return;const q=G.q;if(!q){UI.qKey=null;return}const QT=UI.qTime>0?UI.qTime:25;const el=(Date.now()-UI.qT0)/1000*(UI.tickRate||1),left=QT-el;const b=$('#qbar');if(b)b.style.width=Math.max(0,left/QT*100)+'%';const tx=$('#qtxt');if(tx)tx.textContent=Math.max(0,Math.ceil(left))+' s left to decide, then the computer\'s best advice is used.';
  if(left<=0){if(isClient())return;UI.qKey=null;const who=q.who;let m=null;try{m=aiMove(who,'hard')}catch(e){}if(!m||m.a!=='q')m={a:'q',i:q.opts.length-1};say('Time is up: the computer chose for '+nm(who)+'.','bad');NET.autoDecl++;actAs(m,who)}}catch(e){console.error(e)}},200);
// ---------- acting ----------
function act(m,seat){if(NET.on){const nr=netAct(m,seat);if(nr!==undefined)return nr}if(!G||UI.busy||G.over)return false;
  const mine=G.seats[seat]&&G.seats[seat].human;if(!NET.on&&mine&&humans().length===1&&m.a!=='q')GX.undo.snap(m.a);if(mine)recapMine(seat);
  if(G.seats[seat]&&G.seats[seat].human){UI.sunk=[];UI.marks=[];UI.mph=null}
  UI.rec=[];UI.acting=1;UI.actor=seat;let r;try{r=performMove(m,seat)}finally{UI.acting=0}const evs=UI.rec;UI.rec=null;
  if(!r.success){if(!NET.on&&mine&&humans().length===1&&m.a!=='q')GX.undo.drop();sfx('error');say(r.error,'bad');return false}
  UI.sel=null;UI.hint=false;if(hotSeat()&&G.seats[seat]&&G.seats[seat].human&&sideToAct()!==seat)UI.holder=-1;
  for(const e of evs){if(e.t==='dice')UI.lastRoll=e.d}
  afterMove(evs);return true}
function afterMove(evs){saveAll();UI.stepNow=0;
  const mp=mphBuild(evs);if(mp)UI.mph=mp;
  if(NET.on&&isHost())netEvents(evs);
  const finish=()=>{UI.busy=false;UI.dice=null;UI.res=null;if(UI.mph){UI.mph.roll=false;UI.mph.shown=UI.mph.lines.length}if(!G.q)KS.hold={};for(const e of evs)if(e.t==='sink')sunkAdd(e);kitSync();render();overCheck();schedule();if(NET.on)netDrain()};
  if(ANIM&&evs.some(e=>e.t!=='log')&&UI.started){const gen=UI.gen;UI.busy=true;render();playEvents(evs,gen).then(()=>{if(UI.gen!==gen)return;finish()})}
  else finish()}
function overCheck(){if(G&&G.over&&!UI.overSeen){UI.overSeen=1;const w=G.over.win||[];musicStop(.4);sndLoop('sea_loop',false);const mine=w.some(i=>G.seats[i].human)||!humans().length&&w.length;sfx(mine?'win':'lose');GX.buzz(mine?[30,60,30]:[80]);UI.trig.end=1;clearSave();kitResult();render()}}
function schedule(){clearTimeout(UI.tm);if(isClient()||!G||!UI.started||G.over||UI.busy||UI.pause)return;const d=sideToAct();if(d<0||G.seats[d].human)return;UI.tm=setTimeout(aiAct,Math.max(0,(AIDELAY||0)/(UI.speed||1)))}
function aiAct(){if(isClient()||!G||!UI.started||UI.busy||UI.pause||G.over)return;const d=sideToAct();if(d<0||G.seats[d].human)return;const st=aiStep();if(!st)return;act(st.m,st.seat)}
function doPlace(){const d=sideToAct();const s=UI.sel;if(!s)return;const m={a:'place',t:s.t,r:s.r,s:s.s};act(m,d)&&sfx('confirm')}
function pickSquare(c,r){const d=sideToAct();if(d<0||!G.seats[d].human||UI.busy||mustPass(d))return;
  if(G.q){const o=G.q.opts.findIndex(x=>x.d&&x.d.x===c&&x.d.y===r&&(x.h==='dGateAt'||x.h==='dReloc'));if(o>=0)act({a:'q',i:o},d);return}
  if(G.phase==='play'&&G.step==='act'&&UI.fronts){const s=UI.fronts.find(i=>G.ships[i].x===c&&G.ships[i].y===r);if(s==null)return;if(UI.sel&&UI.sel.s===s&&UI.canPlace&&UI.A&&!UI.A.bad)doPlace();else if(UI.sel&&UI.sel.s!==s){UI.sel.s=s;render()}else if(UI.sel&&UI.A&&UI.A.bad){sfx('error')}else doPlace()}}
function onPick(p){if(!p||!G||!UI.started)return;const d=sideToAct();if(d<0||!G.seats[d].human||UI.busy||mustPass(d))return;
  if(p.kind==='start'){if(G.phase==='setup'&&!G.q)act({a:'start',x:p.c,y:p.r,e:p.port},d);return}
  if(p.kind==='ship'){const i=+String(p.id).slice(1);const S=G.ships[i];if(S&&S.x!=null)pickSquare(S.x,S.y);return}
  if(p.kind==='square')pickSquare(p.c,p.r)}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-a]');if(!t||t.disabled)return;const a=t.dataset.a,d=G?sideToAct():-1;const D=t.dataset;
  if(netClick(a,t))return;
  if(['card','rot','sugg','place','startmark'].indexOf(a)<0)sfx('click');
  switch(a){
  case 'card':{if(!UI.sel||UI.busy)break;const ti=+D.t;if(UI.sel.t===ti&&isCur(G.hands[d][ti]))UI.sel.r=(UI.sel.r+1)%4;else{UI.sel.t=ti}sfx('tile_rotate');render();break}
  case 'rot':{if(!UI.sel)break;UI.sel.r=(UI.sel.r+(+D.d)+4)%4;sfx('tile_rotate');render();break}
  case 'place':doPlace();break;
  case 'target':if(UI.sel){UI.sel.s=+D.s;render()}break;
  case 'startmark':act({a:'start',x:+D.x,y:+D.y,e:+D.e},d);break;
  case 'q':sfx('click');act({a:'q',i:+D.i},d);break;
  case 'gate':act({a:'gate',t:+D.t,s:+D.s},d);break;
  case 'cannon':act({a:'cannon',t:+D.t,m:+D.m,s:+D.s},d);break;
  case 'pass':act({a:'pass'},d);break;
  case 'take':sfx('confirm');UI.holder=+D.seat;render();break;
  case 'skip':UI.skip=true;break;
  case 'pause':UI.pause=!UI.pause;if(!UI.pause)schedule();render();break;
  case 'hint':UI.hint=true;{const m=recMove(d);if(m&&m.a==='place'&&UI.sel){UI.sel={t:m.t,r:m.r,s:m.s}}}render();break;
  case 'sugg':{const m=UI.recM||recMove(d);UI.hint=true;if(m&&m.a==='place'&&UI.sel){UI.sel={t:m.t,r:m.r,s:m.s};sfx('tile_rotate')}render();break}
  case 'sunkok':{const id=D.id;UI.sunk=(UI.sunk||[]).filter(c=>c.id!==id);UI.marks=(UI.marks||[]).filter(c=>c.id!==id);renderCards();ovUpdate();break}
  case 'rewind':rewindLast();break;
  case 'coachok':{const c=nextLesson();if(c){UI.seen[c.id]=1;saveAll();render()}break}
  case 'guidetoggle':UI.confirm=UI.guide==='full'?'light':'full';renderCoach();break;
  case 'guideyes':UI.guide=UI.confirm;UI.confirm=null;saveAll();render();break;
  case 'guideno':UI.confirm=null;render();break;
  case 'again':startGame(UI.lastSetup);break;
  case 'newgame':showStart();break;
  case 'snd':toggleSound();break;case 'mus':toggleMusic();break;
  case 'gfx':try{TWKit.setQuality(D.v);if(window.PerfHUD)PerfHUD.hitch()}catch(x){}renderSettings();break;
  case 'guidemenu':UI.guide=UI.guide==='full'?'light':'full';saveSettings();saveAll();renderSettings();if(G)render();break;
  case 'xray':UI.xray=!UI.xray;renderCrew();break;
  case 'restart':if(UI.lastSetup){GX.close();startGame(UI.lastSetup)}break;
  case 'tonew':GX.close();showStart();break;
  default:startAction(a,t)}})
document.addEventListener('keydown',e=>{if(!G||!UI.started||GX.open||!$('#start').hidden||e.ctrlKey||e.metaKey||e.altKey)return;const tg=e.target&&e.target.tagName;if(tg==='INPUT'||tg==='SELECT'||tg==='TEXTAREA')return;
  if(!UI.canPlace||UI.busy||!UI.sel)return;const d=sideToAct();if(d<0||mustPass(d))return;const k=e.key.toLowerCase();
  if(k>='1'&&k<='3'){const t=+k-1;if(G.hands[d][t]!=null){UI.sel.t=t;render()}}else if(k==='r'){UI.sel.r=(UI.sel.r+1)%4;sfx('tile_rotate');render()}else if(k==='q'){UI.sel.r=(UI.sel.r+3)%4;sfx('tile_rotate');render()}
  else if(k==='enter'&&!(tg==='BUTTON')){doPlace()}});
// ---------- popups ----------
function renderOpenDrawer(){const id=GX.open;if(id==='crewd')renderCrew();else if(id==='logd')renderLog();}
function rewindLast(){if(NET.on)return;if(GX.undo.undo()){GX.close();sfx('click')}}
function renderLog(){const b=$('#logbody');if(!G){b.innerHTML='<p>Start a game first.</p>';return}const L=G.log.slice(0,200),grp=[];for(const l of L){const g=grp[grp.length-1];if(g&&g.turn===l.turn)g.ls.push(l);else grp.push({turn:l.turn,ls:[l]})}
  b.innerHTML=grp.map(g=>g.ls.reverse().map(l=>`<div class="logl ${l.c}">${esc(l.t)}</div>`).join('')).join('')} // newest turn first, each turn read top to bottom
function crewCards(h,own){return h.map(c=>isCur(c)?`<img alt="" width="54" height="54" src="${TWKit.cardURL(BASE_PATHS[CUR_TYPE[c]],{uid:'x'+Math.random().toString(36).slice(2,6),size:54})}">`:`<b>${isGate(c)?'Rift Gate':'Cannon'}</b> `).join('')}
function renderCrew(){const b=$('#crewbody');if(!G){b.innerHTML='<p>Start a game first.</p>';return}const watch=!humans().length;const L=G.mons.filter(m=>m.k==='L').length;
  let h=`<table class="lg2"><tr><th>Captain</th><th>Status</th><th>Tiles</th></tr>`+G.order.map(i=>{const s=G.ships[i];const see=watch&&UI.xray;
    return `<tr><td>${dot(i)} <b>${esc(nm(i))}</b>${G.team?' (team '+'AB'[G.team[i]]+')':''}<br><small>${G.seats[i].human?'Human':'Computer, '+G.seats[i].lv}</small></td><td>${s.alive?'afloat':'sunk: '+esc(s.out)}</td><td data-crewhand="${i}" data-up="${see?1:0}">${s.alive?(see?crewCards(G.hands[i]):'<span class="tiny">'+G.hands[i].length+' hidden</span>'):'-'}</td></tr>`}).join('')+`</table>`;
  if(watch)h+=`<p><button class="swt${UI.xray?' on':''}" data-a="xray"><i></i>Show every hand (watch mode)</button></p>`;
  h+=`<h3>Piles</h3><table class="lg2"><tr><td>Current pile</td><td>${G.deck.length} of ${NCUR} tiles left</td></tr><tr><td>Leviathans on the board</td><td>${L}${G.mons.some(m=>m.k==='M')?' + Maelstrom':''}</td></tr><tr><td>Leviathan pile</td><td>${G.mdeck.length}</td></tr><tr><td>Gone for good</td><td>${G.mgone.length} leviathans, ${G.gone.length} tiles</td></tr>${G.gates.length?'<tr><td>Rift Gate</td><td>on column '+(G.gates[0].x+1)+', row '+(G.gates[0].y+1)+'</td></tr>':''}${G.wave?'<tr><td>Rogue Wave</td><td>column '+(G.wave.x+1)+', row '+(G.wave.y+1)+', strength '+waveStr()+'</td></tr>':''}</table><h3>Expansion pieces now</h3>${piecesNowHTML()}<p><button class="btn small" data-gx="gx-refd">Every tile and piece</button></p>`;b.innerHTML=h}
function renderSettings(){GX.renderSettings()}
function saveSettings(){lsSet('tw_set',{guide:UI.guide,turbo:!!UI.turbo,wakeTap:!!UI.wakeTap})}
function saveAll(){try{if(!NET.on&&G&&!G.over){saveGame();if(!UI.savedFlag){UI.savedFlag=1;GNS.saved(GAME_ID,true)}lsSet('tw_ui1',{cols:UI.cols,guide:UI.guide,seen:UI.seen,trig:UI.trig,guided:UI.guided,setup:UI.lastSetup})}}catch(e){}}
function clearSave(){if(NET.on)return;try{localStorage.removeItem(SAVE)}catch(e){}UI.savedFlag=0;GNS.saved(GAME_ID,false)}
function savedGame(){try{const s=localStorage.getItem(SAVE);if(!s)return null;const g=JSON.parse(s);if(!g||g.phase==='over'||!g.seats)return null;return g}catch(e){return null}}
// ---------- start screen ----------
function teamN(s){const n=s.np;if(s.variant!=='teams')return n;return [4,6,8].includes(n)?n:n<4?4:n%2?n-1:n}
function defaultSetup(){const s=lsGet('tw_setup',null);const seats=[];for(let i=0;i<8;i++)seats.push({h:i===0,lv:'normal',col:[0,3,2,1,4,5,6,7][i]});
  return Object.assign({mode:'me',np:3,seats,exp:{rift:0,wave:0,maelstrom:0,cannon:0},variant:null,noMon:false},s&&s.seats&&s.seats.length===8?s:{})}
function applyMode(s,mode){s.mode=mode;s.seats.forEach((x,i)=>{x.h=mode==='hot'?true:mode==='me'?i===0:false})}
function modeOf(s){const n=s.variant==='solo'||s.variant==='easysolo'?1:s.np;const h=s.seats.slice(0,n).filter(x=>x.h).length;return h===0?'watch':h===1?'me':'hot'}
function renderStart(){const el=$('#start');if(!UI.cfgOpen&&!NET.on){el.innerHTML=titleHTML();return}const s=UI.setup=UI.setup||defaultSetup();const solo=s.variant==='solo'||s.variant==='easysolo';const n=solo?1:teamN(s);const mode=modeOf(s);const onl=isHost(),nOnl=onl?Math.min(8,NET.peers.length||1):0,onPlan=onl?netPlan(s):null;
  const seg=(act,cur,list,extra)=>`<span class="seg">${list.map(([v,l])=>`<button data-a="${act}" data-v="${v}"${extra||''} class="${String(cur)===String(v)?'on':''}">${l}</button>`).join('')}</span>`;
  const sv=(i)=>{const x=s.seats[i];if(onl&&i<nOnl)return `<div class="seat" data-seat="${i}"><span class="sw" style="background:${COL[x.col].sail}"></span><select data-a="col" data-i="${i}" aria-label="Colour of seat ${i+1}">${COL.map((c,k)=>`<option value="${k}"${k===x.col?' selected':''}>${c.name}</option>`).join('')}</select><span class="tag">Online: <b>${esc((onPlan&&onPlan.hum&&onPlan.hum[i]&&onPlan.hum[i].nm)||'Player')}</b></span></div>`;return `<div class="seat" data-seat="${i}"><span class="sw" style="background:${COL[x.col].sail}"></span><select data-a="col" data-i="${i}" aria-label="Colour of seat ${i+1}">${COL.map((c,k)=>`<option value="${k}"${k===x.col?' selected':''}>${c.name}</option>`).join('')}</select>
    <span class="seg">${[['1','Human'],['0','Computer']].map(([v,l])=>`<button data-a="seath" data-i="${i}" data-v="${v}" class="${(x.h?'1':'0')===v?'on':''}">${l}</button>`).join('')}</span>
    ${x.h?'<span></span>':`<select data-a="lv" data-i="${i}" aria-label="Level of seat ${i+1}">${['easy','normal','hard'].map(l=>`<option value="${l}"${x.lv===l?' selected':''}>${l}</option>`).join('')}</select>`}</div>`};
  const ex=[['rift','Rift Gate','A portal tile that rescues a junk or flings pieces across the sea.'],['wave','Rogue Wave','A wave that sweeps a row or column and can capsize junks.'],['maelstrom','Maelstrom','A whirlpool that moves on calm turns and destroys what it enters.'],['cannon','Deck Cannon','Five cannons in the tile pile: shoot a leviathan about to sink you.']];
  const cont=savedGame();
  el.innerHTML=`<div class="stin">${NET.on?'':'<button class="btn small back" data-a="cfgback">‹ Back</button>'}<h1><svg class="ico" viewBox="0 0 24 24" style="width:44px;height:44px;stroke:#e3b24b"><path d="M3 17c3 2 6 2 9 0s6-2 9 0M12 3v11M12 4l6 7h-6M12 6l-5 6h5"/></svg>Tidewake</h1><p class="tag">Lay currents, steer your junk, outlast the leviathans. 1 to 8 captains, computers and hot-seat.</p>
  <div class="stcard"><h2>Quick start</h2><div class="row">${NET.on?'':'<button class="btn pri" data-a="guided">Guided first game (you vs an easy computer)</button>'}${cont&&!NET.on?`<button class="btn" data-a="cont">Continue saved game</button>`:''}<button class="btn" data-a="start" id="quickgo">Start with these settings</button></div><p class="tiny">${NET.on?'':'New here? The guided game explains currents, edges, collisions and leviathans one step at a time.'}</p></div>
  <div class="stcard"><h2>Play with friends</h2>${onlineBlock()}</div>
  <div class="stcols"><div class="stcard"><h2>How to play</h2><div class="row">${onl?'<span class="tiny">Online game: captains take seats in join order.</span>':seg('mode',mode,[['me','Me vs computers'],['hot','Hot-seat'],['watch','Watch']])}</div><p class="tiny">${onl?'Seats without an online captain are computers.':mode==='me'?'You are the first captain; the others are computers.':mode==='hot'?'Everyone shares this screen. Hands are hidden between players behind a pass screen.':'The computers play each other. Sit back.'}</p>
   <h2 style="margin-top:8px">Variant</h2><div class="row">${seg('var',s.variant||'std',[['std','Standard'],['solo','Solo'],['easysolo','Easy solo'],['teams','Teams']])}</div><p class="tiny">${s.variant==='solo'?'One junk, six leviathans. Goal: survive until all ten leviathans have risen and are gone. The top bar counts how many are still to rise. This is the hardest way to play: our best computer captain wins about 1 game in 20, so try Easy solo first.':s.variant==='easysolo'?'Easy solo (our variant): one junk, 4 leviathans to start, 24 turns. Survive 24 turns or play out the whole pile. Destroyed tiles are discarded. A careful captain wins about 1 game in 3.':s.variant==='teams'?'Two equal teams (every other seat); you may lay a tile for a teammate. 4, 6 or 8 captains.':'Last junk afloat wins.'}</p>
   <label class="opt"><input type="checkbox" data-a="nomon" ${s.noMon?'checked':''}><span>No leviathans (calm seas)<small>The official "no monsters" option.</small></span></label></div>
  <div class="stcard"><h2>Expansions: Deepwater Perils</h2><p class="tiny">Four optional extra pieces that make the sea nastier. <b>Recommended for a first game: none.</b> Add them one at a time later.</p>${ex.map(([k,l,d])=>`<label class="opt"><input type="checkbox" data-a="exp" data-k="${k}" ${s.exp[k]?'checked':''}><span><b>${l}</b><small>${d}</small></span></label>`).join('')}</div></div>
  <div class="stcard"><h2>Captains ${solo?'(solo: one junk)':''}</h2>${solo?'':`<div class="row" style="margin-bottom:6px"><span>Players:</span>${seg('np',n,(s.variant==='teams'?[4,6,8]:[2,3,4,5,6,7,8]).map(k=>[k,k]))}</div>`}${Array.from({length:Math.max(n,nOnl)},(_,i)=>sv(i)).join('')}<p class="tiny">Computer levels: <b>easy</b> often takes risky lines, <b>normal</b> plays safe, <b>hard</b> also weighs the leviathans' next rolls. The dice decide many games, so even a hard captain can sink to one bad roll.</p></div>
  <div class="row"><button class="btn pri" data-a="start" id="startbtn">Set sail</button><button class="btn" data-gx="rulesd">Rules</button><button class="btn" data-gx="gx-refd">Pieces</button><button class="btn" data-gx="credd">Credits</button></div></div>`}
function showStart(){if(isClient()){hideStart();return}UI.started=false;clearTimeout(UI.tm);UI.gen++;UI.busy=false;try{sndLoop('sea_loop',false);musicStop(.4);TWKit.setLegal([]);TWKit.ghost(null)}catch(e){}$('#start').hidden=false;GX.close();renderStart()}
function hideStart(){$('#start').hidden=true}
function startAction(a,t){const s=UI.setup=UI.setup||defaultSetup();const D=t.dataset;
  switch(a){
  case 'mode':applyMode(s,D.v);if(D.v==='hot'&&s.np<2)s.np=2;break;
  case 'np':s.np=+D.v;break;
  case 'var':s.variant=D.v==='std'?null:D.v;if(s.variant==='teams')s.np=teamN(s);break;
  case 'seath':s.seats[+D.i].h=D.v==='1';break;
  case 'start':if(!$('#start').hidden){lsSet('tw_setup',s);startGame(JSON.parse(JSON.stringify(s)));return}return;
  case 'guided':if(NET.on)return;startGuided();return;
  case 'cont':if(NET.on)return;resumeSaved();return;
  default:return}
  renderStart()}
document.addEventListener('change',e=>{const t=e.target;if(!t.dataset||!t.dataset.a)return;const s=UI.setup=UI.setup||defaultSetup();
  if(t.dataset.a==='col'){const i=+t.dataset.i,v=+t.value;const j=s.seats.findIndex((x,k)=>k!==i&&x.col===v);if(j>=0)s.seats[j].col=s.seats[i].col;s.seats[i].col=v;renderStart()}
  else if(t.dataset.a==='lv'){s.seats[+t.dataset.i].lv=t.value}
  else if(t.dataset.a==='exp'){s.exp[t.dataset.k]=t.checked?1:0}
  else if(t.dataset.a==='nomon'){s.noMon=t.checked}});
function startGuided(){const s=defaultSetup();s.mode='me';s.np=2;s.variant=null;s.noMon=false;s.exp={rift:0,wave:0,maelstrom:0,cannon:0};s.seats[0]={h:true,lv:'normal',col:0};s.seats[1]={h:false,lv:'easy',col:3};startGame(JSON.parse(JSON.stringify(s)),{guided:true})} // the player's own setup (UI.setup) is left as it was
function startGame(s,o){o=o||{};if(isClient())return;let plan=null;if(isHost()){plan=netPlan(s);if(plan.err){NET.err=plan.err;UI.netOpen=true;netRender();return}NET.err='';s.np=plan.np;s.seats.forEach((x,i)=>{x.h=i<plan.hum.length});o.guided=false}
  UI.gen++;clearTimeout(UI.tm);kitReset();
  const solo=s.variant==='solo'||s.variant==='easysolo';let np=solo?1:teamN(s);const seats=s.seats.slice(0,np);
  seats.forEach((x,i)=>{SHIP_NAMES[i]=COL[x.col].name});UI.cols=seats.map(x=>x.col);
  newGame({players:np,seats:seats.map(x=>x.h?'human':'ai'),lv:seats.map(x=>x.lv),exp:Object.assign({},s.exp),variant:s.variant||null,noMon:!!s.noMon});if(plan)netBound(plan);
  UI.lastSetup=s;UI.guided=!!o.guided;UI.guide=o.guided?'full':(lsGet('tw_set',{}).guide||'light');UI.seen=o.guided?{}:UI.seen;if(o.guided)UI.trig={};else UI.trig={};
  UI.sel=null;UI.hint=false;UI.busy=false;UI.pause=false;UI.dice=null;UI.res=null;UI.lastRoll=null;UI.sunk=[];UI.marks=[];UI.sunkSeen={};UI.mph=null;UI.hiMon=null;UI.arrow=null;UI.overSeen=0;UI.confirm=null;UI.lastKey='';UI.qKey=null;UI.curTurn=null;
  const h=humans();UI.holder=h.length===1?h[0]:-1;UI.started=true;hideStart();GX.close();kitNewGame();
  try{if(window.PerfHUD)PerfHUD.hitch()}catch(e){}
  kitSync();SND.mood='calm';sndLoop('sea_loop',true);if(SND.gesture)musicStart();else SND.wantMusic=1;
  saveAll();render();schedule()}
function resumeSaved(){const g=savedGame();if(!g)return;const u=lsGet('tw_ui1',{});kitReset();G=g;UI.cols=u.cols||G.seats.map((_,i)=>i);G.seats.forEach((x,i)=>{SHIP_NAMES[i]=x.nm});
  UI.guide=u.guide||'light';UI.seen=u.seen||{};UI.trig=u.trig||{};UI.guided=!!u.guided;UI.lastSetup=u.setup||UI.setup;UI.sel=null;UI.busy=false;UI.pause=false;UI.overSeen=0;UI.confirm=null;UI.lastKey='';UI.holder=humans().length===1?humans()[0]:-1;UI.started=true;UI.gen++;hideStart();GX.close();kitNewGame();
  kitSync();sndLoop('sea_loop',true);if(SND.gesture)musicStart();else SND.wantMusic=1;render();schedule()}
