// ---------- board-first play: pick up a card, the legal targets glow, drop it there; the door kick is the big moment ----------
// Rules, engine and AI are untouched. Every drop runs exactly one move from validMoves(), the same move the card pop-up offers.
// Tap a playable card = pick it up (tap it again for its details); drag it = same, with the card under your finger.
const BF={pick:null,drag:null,eat:0,snap:null,rev:null,kicking:false,fing:null,
  motion(){if(typeof ANIM!=='undefined'&&!ANIM)return false;if(/jsdom/i.test(navigator.userAgent||'')||typeof Element==='undefined'||typeof Element.prototype.animate!=='function')return false;try{return !matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return true}}};
// where a move lands on the board: hero / fight sides / one monster / a rival / the door / the discard
function bfZone(m,me){const c=m.card!=null?cd(m.card):null;const cb=G.cb;const inMine=cb&&(cb.who===me||cb.help===me);
  switch(m.act){
    case 'equip':case 'unequip':case 'use':case 'cheat':return 'hero';
    case 'berserk':case 'turn':case 'flight':return cb?'fh':'hero';
    case 'trouble':case 'resurrect':return 'door';
    case 'toss':case 'drop':return 'disc';
    case 'give':return 'p'+m.tgt;
    case 'backstab':case 'steal':return m.tgt===me?'hero':'p'+m.tgt;
    case 'join':return 'ms';
    case 'bribe':return 'm'+m.tgt;
    case 'play':
      if(m.tgt==='p')return 'fh';if(m.tgt==='m')return 'ms';if(c.sp==='wander')return 'ms';
      if(typeof m.tgt==='number'){if(cb&&cb.mons[m.tgt]&&(c.t==='enh'||c.t==='oneshot'||['illusion','mate','garlic'].includes(c.sp)))return 'm'+m.tgt;return m.tgt===me?'hero':'p'+m.tgt}
      return 'hero'}
  return null}
// self-harm moves (curse yourself, boost your own monster) never glow; they stay in the card's details pop-up
const bfHarm=m=>/yourself!|against yourself|helps a rival/.test(moveLabel(m));
const BFSIDE=['berserk','turn','flight','toss','drop'];
function bfMoves(me,id){if(me<0||!G||G.winner)return [];return cardMoves(me,id).filter(m=>m.act!=='sell'&&!bfHarm(m)).map(m=>({m,z:bfZone(m,me)})).filter(x=>x.z).sort((a,b)=>BFSIDE.includes(a.m.act)-BFSIDE.includes(b.m.act))}
function bfEls(z){const q=s=>[...document.querySelectorAll(s)];
  if(z==='hero')return q('.bfbig,.mine .top,.mine .gear');if(z==='fh'){const me=viewSeat();const cb=G.cb;return q('.arena .score.hero'+(cb&&(cb.who===me||cb.help===me)?',.mine .top,.mine .gear':''))}if(z==='ms')return q('.arena .score.mons,.arena .row.mons .mon');
  if(z[0]==='m')return q(`.arena .row.mons .mon:nth-child(${+z.slice(1)+1})`);
  if(z[0]==='p')return q(`#phopps [data-opp="${z.slice(1)}"],#app .opps [data-opp="${z.slice(1)}"]`);
  if(z==='door')return q('.pile.pl,.bfdoor,.arena:not(:has(.vs))');if(z==='disc')return q('.pile.pr');return []}
const bfShort=t=>{t=String(t).replace(/<[^>]+>/g,'').replace(/ \(.*\)$/,'');return t.length>26?t.slice(0,25)+'…':t};
function bfMark(){document.querySelectorAll('[data-bfz]').forEach(e=>{e.removeAttribute('data-bfz');e.removeAttribute('data-bfl');e.classList.remove('bf-tgt','bf-over')});
  document.querySelectorAll('.bf-picked').forEach(e=>e.classList.remove('bf-picked'));document.documentElement.classList.remove('bf-holding');
  if(BF.ask){const me=viewSeat();const asks=me>=0&&!G.q?validMoves(me).filter(m=>m.act==='ask'):[];if(!asks.length){BF.ask=null}else{document.documentElement.classList.add('bf-holding');
    const offs=helpOffers(me);BF.askN={};for(const o of offs){const ns=asks.filter(m=>m.tgt===o.i).map(m=>m.opt);BF.askN[o.i]=o.yes!=null?o.yes:Math.max(...ns);
      const lab=o.yes!=null?`+${o.str} ✓ yes`:o.wins?`+${o.str} (will say no)`:`+${o.str} not enough`;
      bfEls('p'+o.i).forEach(e=>{e.dataset.bfz='ask'+o.i;e.classList.add('bf-tgt');e.dataset.bfl=lab})}
    bfSay('Tap a rival to ask for help');return}}
  const id=BF.drag?BF.drag.id:BF.pick;if(id==null)return;const me=viewSeat();const ms=bfMoves(me,id);if(!ms.length){BF.pick=null;return}
  document.documentElement.classList.add('bf-holding');document.querySelectorAll(`.mine [data-card="${id}"]`).forEach(e=>e.classList.add('bf-picked'));
  const seen={};for(const x of ms){if(seen[x.z])continue;seen[x.z]=1;const lab=ms.filter(y=>y.z===x.z).length>1?bfShort(moveLabel(x.m)).replace(/ .*/,'')+'…':bfShort(moveLabel(x.m));
    bfEls(x.z).forEach((e,k)=>{if(e.dataset.bfz)return;e.dataset.bfz=x.z;e.classList.add('bf-tgt');if(!k)e.dataset.bfl=lab})}
  const l0=bfShort(moveLabel(ms[0].m));bfSay(BF.drag?l0+': drop on the glow':l0+': tap the glow')}
function bfSay(t){const l=document.querySelector('#prompt .bfline');if(l)l.textContent=t}
// run the move for a drop on zone z; several moves on one spot (e.g. which item to borrow) open the card's own choice pop-up
function bfDrop(id,z,at){const me=viewSeat();const ms=bfMoves(me,id).filter(x=>x.z===z);BF.pick=null;BF.drag=null;
  if(!ms.length){bfMark();return false}
  bfLearn('drag');if(ms.length>1){UI.menu={card:id};render();return true}
  const from=at||null;const el=bfEls(z)[0];if(from&&el&&BF.motion())bfFly(id,from,el.getBoundingClientRect(),true);
  if(typeof sfx==='function')sfx('whoosh');uiAct(ms[0].m);return true}
// ---- the door kick: shake, crack, burst, then the reveal ----
function bfKick(){const me=viewSeat();if(BF.kicking||!G||me<0||!validMoves(me).some(m=>m.act==='kick'))return;bfLearn('kick');
  if(!BF.motion()){uiAct({act:'kick'});return}
  BF.kicking=true;const d=document.querySelector('.bfdoor')||document.querySelector('.pile.pl');const tb=document.querySelector('.table');
  if(typeof sfx==='function')sfx('smash');try{navigator.vibrate&&navigator.vibrate([25,40,60])}catch(e){}
  if(d)d.classList.add('bf-kicking');if(tb)tb.classList.add('bf-shake');
  setTimeout(()=>{if(typeof sfx==='function')sfx('door');if(tb)tb.classList.remove('bf-shake');BF.kicking=false;BF.mine=1;uiAct({act:'kick'})},520)}
function bfReveal(id,who){const c=cd(id);const me=viewSeat();const mine=who===me&&G.mode!=='ai';const kind=c.t==='monster'?'mon':c.t==='curse'?'curse':'other';
  const ban=kind==='mon'?'A MONSTER!':kind==='curse'?'CURSED!':mine?'Into your hand':'Into '+P(who).nm+'’s hand';
  const sub=kind==='mon'?`Level ${c.lvl}`+(G.cb&&!mine?` · ${P(who).nm} must fight`:G.cb?` · you: ${sideStr(G.cb)}`:''):kind==='curse'?esc(c.x||'').slice(0,60):'No monster this time';
  let o=document.getElementById('bfrev');if(o)o.remove();o=document.createElement('div');o.id='bfrev';o.className=`bfrev k-${kind}${mine?' mine':''}`;o.setAttribute('role','status');
  o.innerHTML=`<div class="bfburst"></div><div class="bfdh l">${cardBack('door')}</div><div class="bfdh r">${cardBack('door')}</div><div class="bfwho">${mine?'You kick':esc(P(who).nm)+' kicks'} the door…</div><div class="bfrc">${cardHTML(id,{attr:'tabindex="-1"',notitle:1})}</div><div class="bfban">${ban}</div><div class="bfsub">${sub}</div>`;
  document.body.appendChild(o);const dur=mine?1900:1050;
  setTimeout(()=>{if(typeof sfx==='function')sfx(kind==='mon'?'roar':kind==='curse'?'curse':'click')},mine?420:300);
  const close=()=>{if(!o.isConnected)return;o.classList.add('out');setTimeout(()=>o.remove(),260)};BF.revClose=close;setTimeout(close,dur);
  if(!mine&&typeof UI!=='undefined')UI.hold=Math.max(UI.hold||0,Date.now()+dur)}
// ---- cause and effect: cards fly from the rival who played them, numbers float up where they changed ----
function bfFly(id,fr,to,quick){if(!BF.motion())return;const e=document.createElement('div');e.className='bffly';e.innerHTML=cardHTML(id,{attr:'tabindex="-1"',notitle:1});document.body.appendChild(e);
  const w=64,sx=fr.left+fr.width/2-w/2,sy=fr.top+fr.height/2-45,tx=to.left+to.width/2-w/2,ty=to.top+to.height/2-45;
  const a=e.animate([{transform:`translate(${sx}px,${sy}px) scale(${quick?1:.6}) rotate(-8deg)`,opacity:1},{transform:`translate(${(sx+tx)/2}px,${Math.min(sy,ty)-60}px) scale(1.15) rotate(4deg)`,opacity:1,offset:.55},{transform:`translate(${tx}px,${ty}px) scale(.5)`,opacity:0}],{duration:quick?380:900,easing:'cubic-bezier(.3,.7,.3,1)'});a.onfinish=()=>e.remove()}
function bfFloat(el,txt,cls){if(!el||!BF.motion())return;const r=el.getBoundingClientRect();if(!r.width)return;const f=document.createElement('div');f.className='bffloat '+(cls||'');f.textContent=txt;f.style.left=(r.left+r.width/2)+'px';f.style.top=(r.top+r.height/3)+'px';document.body.appendChild(f);setTimeout(()=>f.remove(),1500)}
function bfBubble(s,txt){const el=document.querySelector(`#phopps [data-opp="${s}"],#app .opps [data-opp="${s}"]`);if(!el||!BF.motion())return;const r=el.getBoundingClientRect();const b=document.createElement('div');b.className='bfbub';b.style.setProperty('--c',PCOL[s]);b.textContent=txt;b.style.left=Math.max(8,Math.min(innerWidth-208,r.left))+'px';b.style.top=(r.bottom+4)+'px';document.body.appendChild(b);setTimeout(()=>b.remove(),2600)}
function bfNote(el,txt,cls){if(!el||!BF.motion())return;const r=el.getBoundingClientRect();if(!r.width)return;const b=document.createElement('div');b.className='bfbub note '+(cls||'');b.style.setProperty('--c',cls==='bad'?'#c0392b':'#2e9e5b');b.textContent=txt;const tb=document.querySelector('.table');const t=tb?tb.getBoundingClientRect():r;b.style.left='50%';b.style.translate='-50% 0';b.style.top=(t.top+6)+'px';document.body.appendChild(b);setTimeout(()=>b.remove(),3600)}
function bfSnap(){if(!G)return null;const cb=G.cb;const me=viewSeat();const mp=me>=0&&G.pl[me]?P(me):null;return {gid:G.gid,turn:G.turn,kick:G.kicked,me,eq:mp?mp.eq.map(e=>e.id+':'+(e.on?1:0)):[],lvl:G.pl.map(p=>p.lvl),str:G.pl.map(p=>pStr(p)),
  cb:cb?{k:G.turn+':'+cb.who,enh:cb.mons.map(m=>m.enh.length),n:cb.mons.length,os:cb.os.length,help:cb.help,a:sideStr(cb),b:monStr(cb)}:null,ln:G.ln}}
function bfDiff(S,N){if(!S||!N||S.gid!==N.gid)return;const me=viewSeat();const actor=G.log[0]?G.log[0].s:-1;const chip=s=>document.querySelector(`#phopps [data-opp="${s}"],#app .opps [data-opp="${s}"]`);
  const fromRect=s=>{const c=s>=0&&s!==me?chip(s):null;return c?c.getBoundingClientRect():null};
  if(N.kick!=null&&(N.kick!==S.kick||N.turn!==S.turn)&&BF.motion()){bfReveal(N.kick,G.active);BF.mine=0}
  N.lvl.forEach((l,i)=>{const d=l-S.lvl[i];if(!d)return;const el=i===me?document.querySelector('.mine .bfhero')||document.querySelector('.mine .lv'):chip(i);bfFloat(el,(d>0?'+':'')+d+' Lv',d>0?'up':'down')});
  if(me>=0&&N.me===S.me){const hero=document.querySelector('.mine .bfhero');const was=new Map(S.eq.map(x=>x.split(':')).map(([i,o])=>[+i,o==='1']));const now=new Map(N.eq.map(x=>x.split(':')).map(([i,o])=>[+i,o==='1']));
    const lost=[...was.keys()].filter(i=>!now.has(i));if(lost.length)bfNote(hero,'Lost: '+lost.map(cname).join(', '),'bad');
    const off=[...now.keys()].filter(i=>!now.get(i)&&(!was.has(i)||was.get(i)));if(off.length){const p=P(me);const w=equipWhy(p,off[0])||bigWhy(p,off[0])||'';bfNote(hero,`Carried, not worn: ${w||'no free slot'}`,'bad')}}
  if(me>=0&&!N.cb&&N.str[me]!==S.str[me]&&N.lvl[me]===S.lvl[me]){const d=N.str[me]-S.str[me];bfFloat(document.querySelector('.mine .bfhero'),(d>0?'+':'')+d+' ⚔',d>0?'up':'down')}
  const a=S.cb,b=N.cb;if(!a||!b||a.k!==b.k)return;const cb=G.cb;
  b.enh.forEach((n,j)=>{if(n>(a.enh[j]||0)&&j<a.n){const id=cb.mons[j].enh[n-1];const to=document.querySelector(`.arena .row.mons .mon:nth-child(${j+1})`);const fr=fromRect(actor);if(fr&&to)bfFly(id,fr,to.getBoundingClientRect());if(actor>=0&&actor!==me)bfBubble(actor,cd(id).b>0?'Boost the monster!':'Weaken it!')}});
  if(b.os>a.os){const o=cb.os[b.os-1];const to=document.querySelector(o.side==='p'?'.arena .score.hero':'.arena .score.mons');const fr=fromRect(actor);if(fr&&to)bfFly(o.id,fr,to.getBoundingClientRect());if(actor>=0&&actor!==me)bfBubble(actor,o.side==='p'?'Here, take this!':'Get them!')}
  if(b.n>a.n){const id=cb.mons[b.n-1].like!=null?cb.mons[b.n-1].like:cb.mons[b.n-1].id;const to=document.querySelector(`.arena .row.mons .mon:nth-child(${b.n})`);const fr=fromRect(actor);if(fr&&to)bfFly(id,fr,to.getBoundingClientRect());if(actor>=0&&actor!==me)bfBubble(actor,'Another monster!')}
  if(b.help!==a.help&&b.help>=0){const fr=fromRect(b.help);const to=document.querySelector('.arena .score.hero');if(fr&&to)bfFly(cb.mons[0].id,fr,to.getBoundingClientRect())}
  if(b.a!==a.a){const d=b.a-a.a;bfFloat(document.querySelector('.arena .score.hero'),(d>0?'+':'')+d,d>0?'up':'down')}
  if(b.b!==a.b){const d=b.b-a.b;bfFloat(document.querySelector('.arena .score.mons'),(d>0?'+':'')+d,d>0?'bad':'up')}}
// ---- the ghost finger: shows one move the first time (teach-me games only), until the player copies it ----
function bfLearned(){try{return new Set(JSON.parse(localStorage.getItem('dkd_bf')||'[]'))}catch(e){return new Set(BF.mem||[])}}
function bfLearn(k){const s=bfLearned();if(s.has(k))return;s.add(k);BF.mem=[...s];try{localStorage.setItem('dkd_bf',JSON.stringify([...s]))}catch(e){}bfFinger(null)}
function bfFinger(spec){const old=document.getElementById('bffing');const key=spec?spec.k+':'+spec.a+':'+spec.b:'';if(old&&old.dataset.key===key)return;if(old)old.remove();BF.fing=null;if(!spec||!BF.motion())return;
  const A=spec.ea&&spec.ea.getBoundingClientRect(),B=spec.eb&&spec.eb.getBoundingClientRect();if(!A||!A.width)return;
  const f=document.createElement('div');f.id='bffing';f.dataset.key=key;f.setAttribute('aria-hidden','true');f.innerHTML='<span>👆</span>';document.body.appendChild(f);
  const ax=A.left+A.width/2,ay=A.top+A.height/2,bx=B&&B.width?B.left+B.width/2:ax,by=B&&B.width?B.top+B.height/2:ay;
  const fr=B&&B.width&&spec.eb!==spec.ea?[{transform:`translate(${ax}px,${ay}px) scale(1)`,opacity:0},{transform:`translate(${ax}px,${ay}px) scale(.85)`,opacity:1,offset:.15},{transform:`translate(${bx}px,${by}px) scale(.85)`,opacity:1,offset:.7},{transform:`translate(${bx}px,${by}px) scale(1)`,opacity:0}]
    :[{transform:`translate(${ax}px,${ay+30}px) scale(1)`,opacity:0},{transform:`translate(${ax}px,${ay}px) scale(1)`,opacity:1,offset:.4},{transform:`translate(${ax}px,${ay}px) scale(.8)`,opacity:1,offset:.55},{transform:`translate(${ax}px,${ay}px) scale(1)`,opacity:0}];
  f.animate(fr,{duration:2200,iterations:Infinity,delay:400})}
function bfTeach(me){if(!G||!G.learn||me<0||G.winner||sideToAct()!==me||G.q||BF.pick!=null||BF.drag||UI.menu||UI.pass!=null){bfFinger(null);return}
  const L=bfLearned();const q=s=>document.querySelector(s);
  if(G.phase==='main'&&!L.has('kick')&&!(['setup','post'].includes(G.phase))){const d=q('.bfdoor');if(d){const co=coach(me);if(!autoN(me,co)){bfFinger({k:'kick',a:'d',b:'d',ea:d,eb:d});return}}}
  if(!L.has('drag')){const co=coach(me);const id=co.card;if(id!=null&&!co.disc){const ms=bfMoves(me,id);if(ms.length){const ea=q(`.mine .hand [data-card="${id}"]`),eb=bfEls(ms[0].z)[0];if(ea&&eb){bfFinger({k:'drag',a:id,b:ms[0].z,ea,eb});return}}}}
  if(G.phase==='main'&&!L.has('kick')){const d=q('.bfdoor');if(d){bfFinger({k:'kick',a:'d',b:'d',ea:d,eb:d});return}}
  bfFinger(null)}
// ---- one short line for "what to do now" (≤ 8 words) ----
function bfLine(me){const s=sideToAct();if(!G||G.winner)return '';if(s<0)return '';const p=P(s);const mine=me>=0&&s===me&&P(me).human;
  if(!mine){if(p.human)return 'Waiting for '+p.nm+'…';const cb=G.cb;if(cb&&cb.who!==s&&cb.help!==s)return p.nm+' may meddle in the fight…';return p.nm+'’s turn…'}
  if(G.q)return '';const vm=validMoves(me);const cardy=vm.some(m=>m.card!=null&&m.act!=='sell'&&!bfHarm(m)&&bfZone(m,me));const cb=G.cb;
  switch(G.phase){
    case 'setup':return cardy?'Drag glowing cards onto your hero':'All set? Tap Ready';
    case 'window':return cardy?'Curse '+curPl().nm+'? Drag a card on them':curPl().nm+' is about to kick the door';
    case 'main':return cardy?'Gear up, then kick the door!':'Kick the door!';
    case 'after':return vm.some(m=>m.act==='trouble'&&!bfHarm(m))?'Empty room: loot, or drag a monster in':'Empty room: tap Loot';
    case 'post':return cardy?'Gear up, then end your turn':'End your turn';
    case 'charity':{const t=charityTargets(P(me));return t.length?'Too many cards: drag extras onto '+P(t[0]).nm:'Too many cards: drag extras to discard'}
    case 'combat':if(cb.stage==='act'&&(cb.who===me))return winning(cb)?'You’re winning! Tap Fight':'Losing! Add cards, get help, or run';
      return cardy?(cb.who===me?'Drag a card onto the fight':P(cb.who).nm+'’s fight: drag a card to meddle'):'Let the fight go on'}
  return ''}
// ---- hooks into the existing screens ----
function bfAv(p,cls){const kind=classes(p)[0]||(races(p)[0]==='halfling'?'half':races(p)[0]);return typeof svgArt==='function'?svgArt({t:'race',art:kind,n:''},'hero'+p.i+kind,cls):''}
(function(){
  const _arena=arenaHTML;arenaHTML=function(){const me=viewSeat();
    if(G&&!G.cb&&G.phase==='main'&&me>=0&&sideToAct()===me&&G.active===me&&P(me).human&&validMoves(me).some(m=>m.act==='kick')){UI.arRes=40;
      return `<button class="bfdoor" data-a="bfkick" aria-label="Kick open the door"><span class="bfdi">${typeof cardBack==='function'?cardBack('door'):''}</span><span class="bfkick">KICK!</span><span class="bfboot" aria-hidden="true">🥾</span></button>`}
    if(G&&!G.cb&&G.phase==='setup'&&me>=0&&P(me).human){const p=P(me);UI.arRes=40;return `<div class="bfstage"><div class="bfbig" style="--c:${PCOL[p.i]}">${bfAv(p,'bfbav')}<b class="bfbstr">⚔ ${pStr(p)}</b><span class="bfblv">Lv ${p.lvl}</span></div><div class="bfcap">Gear up your hero!</div></div>`}
    if(G&&!G.cb&&G.kicked!=null&&G.phase!=='main'&&!(G.out&&G.out.turn===G.turn&&['after','post','charity'].includes(G.phase))){const c=cd(G.kicked);const a=curPl();const y=isMe(a.i);UI.arRes=60;
      return `<div class="bfstage"><div class="bfcap">${y?'You':esc(a.nm)} found:</div><div class="row">${cardHTML(G.kicked,{})}</div><div class="bfcap sm">${c.t==='curse'?'A curse! It hit '+(y?'you':esc(a.nm)):'It went into '+(y?'your':esc(a.nm)+'’s')+' hand'}</div></div>${rollHTML()}`}
    if(G&&!G.cb&&(G.phase==='main'||G.phase==='window')&&G.kicked==null){const a=curPl();UI.arRes=40;return `<div class="bfstage"><div class="bfdoor small" aria-hidden="true"><span class="bfdi">${typeof cardBack==='function'?cardBack('door'):''}</span></div><div class="bfcap">${isMe(a.i)?'Your':esc(a.nm)+'’s'} door</div></div>${rollHTML()}`}
    return _arena.apply(this,arguments)};
  const _mine=mineHTML;mineHTML=function(me){const h=_mine(me);if(me<0||!G.pl[me])return h;const p=P(me);const av=bfAv(p,'bfav');
    return h.replace('<div class="top">',`<div class="top"><span class="bfhero" style="--c:${PCOL[p.i]}">${av}<b class="bfstr" aria-label="strength">⚔${pStr(p)}</b></span>`)};
  const _prompt=promptHTML;promptHTML=function(me){let h=_prompt(me);const line=bfLine(me);
    h=h.replace('<div id="prompt">',`<div id="prompt" class="${G&&G.q?'bfq':''}">`+(/autonote/.test(h)?'':autoNoteHTML()));
    h=h.replace(/✨ Play suggested cards? \((\d+)\)/,'✨ Auto ($1)').replace(/🏃 Run away \((?:need \d\+: )?([^)]*)\)/,'🏃 Run ($1)').replace('🏃 Run (this monster can’t be escaped)','🏃 Run (no chance)').replace('🙋 Ask for help','🙋 Get help').replace('🚪 Kick open the door','🚪 Kick!').replace('💰 Sell items','💰 Sell');
    const i=h.indexOf('<p class="say">');const tag=`<p class="bfline">${esc(line)}</p>`;
    if(i>=0)h=h.slice(0,i)+tag+h.slice(i);else h=h.replace(/(<div class="who">.*?<\/div>)/,'$1'+tag);return h};
  const _render=render;render=function(){const S=BF.snap;const r=_render.apply(this,arguments);try{bfAfter(S)}catch(e){UI.lastErr='bf '+e}return r}})();
function bfAfter(S){if(!G){BF.snap=null;BF.pick=null;bfFinger(null);return}
  {const me=viewSeat();const mine=me>=0&&sideToAct()===me&&!G.winner;document.documentElement.classList.toggle('bf-wait',!mine);
    document.querySelectorAll('.mine .hand .card.play').forEach(c=>{const ms=mine?bfMoves(me,+c.dataset.card):[];if(!ms.length){c.classList.remove('play','sug');c.classList.add('bf-no');return}
      const cb=G.cb,myF=cb&&(cb.who===me||cb.help===me);const mean=ms.every(x=>x.z[0]==='p'||(!myF&&(x.z==='ms'||x.z[0]==='m'))||(!myF&&x.z==='fh'&&false));c.classList.toggle('bf-mean',mean)})}
  document.querySelectorAll('.mine .gear .gchip.eqoff').forEach(c=>{if(!c.querySelector('.bfx'))c.insertAdjacentHTML('beforeend','<span class="bfx" aria-hidden="true">✗ not worn</span>')});const N=bfSnap();BF.snap=N;bfMark();bfDiff(S,N);const me=viewSeat();setTimeout(()=>{try{bfTeach(me)}catch(e){}},30)}
// ---- input: tap to pick up / tap a glowing spot; or drag with a finger or mouse ----
document.addEventListener('click',e=>{if(Date.now()<BF.eat){e.stopPropagation();e.preventDefault();return}
  const t=e.target;if(!G)return;const k=t.closest('[data-a="bfkick"]')||(()=>{const b=t.closest('[data-mv]');try{return b&&JSON.parse(b.dataset.mv).act==='kick'?b:null}catch(x){return null}})();
  if(k){e.stopPropagation();e.preventDefault();BF.pick=null;bfKick();return}
  if(BF.ask){const z=t.closest('[data-bfz^="ask"]');e.stopPropagation();e.preventDefault();BF.ask=null;
    if(z){const i=+z.dataset.bfz.slice(3);const n=BF.askN&&BF.askN[i];if(n!=null){uiAct({act:'ask',tgt:i,opt:n});return}}bfMark();return}
  const am=t.closest('[data-a="askmenu"]');if(am){const me=viewSeat();const asks=me>=0?validMoves(me).filter(m=>m.act==='ask'):[];
    if(asks.length&&!asks.some(m=>P(m.tgt).human)){e.stopPropagation();e.preventDefault();BF.pick=null;BF.ask=true;bfFinger(null);bfMark();return}}
  if(BF.pick!=null){const z=t.closest('[data-bfz]');if(z){e.stopPropagation();e.preventDefault();bfDrop(BF.pick,z.dataset.bfz,null);return}
    const c=t.closest('.mine [data-card]');if(c&&+c.dataset.card===BF.pick){BF.pick=null;bfMark();return}  // second tap: details / choices pop-up (ui.js)
    if(!c){BF.pick=null;bfMark();if(!t.closest('button,[data-a],[data-mv],[data-opp]')){e.stopPropagation();return}}}
  const c=t.closest('.mine .hand [data-card],.mine .gear [data-card]');if(!c||UI.sell||t.closest('.dlg'))return;const id=+c.dataset.card;const me=viewSeat();
  const ms=bfMoves(me,id);if(!ms.length)return;if(c.closest('.gear')&&!ms.some(x=>x.m.act==='equip'))return;
  e.stopPropagation();e.preventDefault();BF.pick=id;if(typeof sfx==='function')sfx('click');bfFinger(null);bfMark()},true);
document.addEventListener('pointerdown',e=>{if(BF.revClose){BF.revClose();BF.revClose=null}if(!G||e.button>0)return;const c=e.target.closest('.mine .hand [data-card],.mine .gear [data-card]');if(!c||UI.sell)return;const id=+c.dataset.card;
  if(!bfMoves(viewSeat(),id).length)return;BF.down={id,x:e.clientX,y:e.clientY,el:c,pid:e.pointerId}},{passive:true});
document.addEventListener('pointermove',e=>{const d=BF.down;if(!d||d.pid!==e.pointerId)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;
  if(!BF.drag){if(Math.hypot(dx,dy)<10)return;if(e.pointerType==='touch'&&Math.abs(dx)>Math.abs(dy)*1.2&&d.el.closest('.hand,.gear')){BF.down=null;return}
    const r=d.el.getBoundingClientRect();const g=d.el.cloneNode(true);g.className+=' bfghost';g.removeAttribute('data-card');g.style.width=r.width+'px';document.body.appendChild(g);
    BF.drag={id:d.id,g,ox:d.x-r.left,oy:d.y-r.top,w:r.width,h:r.height};BF.pick=null;bfFinger(null);bfMark();d.el.classList.add('bf-lift')}
  const D=BF.drag;D.g.style.transform=`translate(${e.clientX-D.w/2}px,${e.clientY-D.h*.75}px) scale(1.12) rotate(${Math.max(-10,Math.min(10,dx/12))}deg)`;
  D.g.style.visibility='hidden';const u=document.elementFromPoint(e.clientX,e.clientY);D.g.style.visibility='';const z=u&&u.closest('[data-bfz]');
  document.querySelectorAll('.bf-over').forEach(x=>{if(x!==z)x.classList.remove('bf-over')});if(z)z.classList.add('bf-over');D.over=z;if(e.cancelable)e.preventDefault()},{passive:false});
function bfEnd(e,cancel){const D=BF.drag;BF.down=null;if(!D)return;BF.drag=null;BF.eat=Date.now()+350;
  // the board may have re-rendered during the drag (a computer move): find the target again under the finger
  let z=null;if(!cancel){g0:{D.g.style.visibility='hidden';const u=e&&e.clientX!=null?document.elementFromPoint(e.clientX,e.clientY):null;D.g.style.visibility='';const t=u&&u.closest('[data-bfz]');if(t){z=t.dataset.bfz;break g0}if(D.over&&D.over.isConnected)z=D.over.dataset.bfz}}const g=D.g;
  if(z){const r=g.getBoundingClientRect();g.remove();document.querySelectorAll('.bf-lift').forEach(x=>x.classList.remove('bf-lift'));bfDrop(D.id,z,r)}
  else{const src=document.querySelector(`.mine [data-card="${D.id}"]`);const r=src&&src.getBoundingClientRect();
    if(r&&BF.motion()){const a=g.animate([{transform:g.style.transform},{transform:`translate(${r.left}px,${r.top}px) scale(1)`}],{duration:220,easing:'ease-out'});a.onfinish=()=>g.remove()}else g.remove();
    document.querySelectorAll('.bf-lift').forEach(x=>x.classList.remove('bf-lift'));bfMark();if(!cancel){bfSay('Not there: drop it on a glow');const l=document.querySelector('#prompt .bfline');if(l&&BF.motion())l.animate([{transform:'translateX(-6px)'},{transform:'translateX(6px)'},{transform:'none'}],{duration:240,iterations:2})}}}
document.addEventListener('pointerup',e=>bfEnd(e,false));document.addEventListener('pointercancel',e=>bfEnd(e,true));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&(BF.pick!=null||BF.ask)){BF.pick=null;BF.ask=null;bfMark()}});

// a rival's door or fight: if none of your cards could change anything, don't ask (the card-less "Let it be" was a chore)
(function(){const _ap=autoPass;autoPass=function(){_ap();if(!G||G.mode==='net')return;
  for(let k=0;k<12&&G&&!G.winner;k++){const s=sideToAct();if(s<0||!P(s).human||G.q)return;if(!(G.phase==='window'||(G.phase==='combat'&&G.cb&&G.cb.stage==='others')))return;if(G.cb&&winThreat(G.cb))return;
    const vm=validMoves(s);const pass=vm.find(m=>m.act==='pass');if(!pass)return;
    // before a trailing rival's door (lower level than you, not near the win) don't stop for curses either
    const calm=G.phase==='window'&&P(G.active).lvl<P(s).lvl&&P(G.active).lvl<8;if(!calm&&vm.some(m=>m!==pass&&(m.card==null||(!bfHarm(m)&&bfZone(m,s)))))return;
    const r=performMove(pass,s);if(!r||!r.success)return}}})();
// the "You gave away…" note stays for a few seconds even when skipped prompts move the game on at once
autoNoteHTML=function(){const a=UI.autoNote;if(!a||!G)return '';if(!a.at)a.at=Date.now();return a.ln===G.ln||Date.now()-a.at<8000?`<div class="since autonote" role="status">${a.t}</div>`:''};

// the status chip: during a rival's fight it is their fight, not "your move"
(function(){const _dt=dockTitle;dockTitle=function(me){const cb=G&&G.cb;const s=G?sideToAct():-1;if(cb&&!G.winner&&s===me&&me>=0&&cb.who!==me&&cb.help!==me)return P(cb.who).nm+'’s fight: meddle?';if(G&&!G.winner&&G.phase==='window'&&s===me&&G.active!==me)return curPl().nm+'’s door: curse?';return _dt(me)}})();
// the first game with "teach me" starts against Easy computers (still changeable on the start screen)
(function(){if(UI.lvl||/jsdom/i.test(navigator.userAgent||''))return;let first=true;try{first=!localStorage.getItem('dkd_learned')&&!localStorage.getItem('dkd_bf')}catch(e){}if(first){UI.lvl='easy';if(!G)render()}})();
