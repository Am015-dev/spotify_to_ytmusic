
// ===================== part 7: phone layout (board first, tap to play, pop-ups) =====================
// Only active when html.ph is set (short side <= 500 px, or a touch screen <= 600 px; ?phone=1 / ?phone=0 force it). Desktop and tablets never touch this code.
const PH={on:false,land:false,pop:null,pd:null,zoom:false,zk:'',cur:null,mphHide:null,ovHide:null,swipeT:0,tmr:0,strip:'',pop_h:'',toast:''};
const PH_REGION=[-4.02,4.02,-4.02,4.02];
const PH_ICO={tile:'<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 4q0 8 8 8M4 14q6 0 6 6"/></svg>',mon:'<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 17c2-6 5-8 9-8 3 0 4-3 7-3-1 2-1 3 0 4-2 1-2 3-3 4 3 0 4 2 5 4-3-1-5-2-7-1-3 1-6 1-11 0zM9 12h.01"/></svg>',zoom:'<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="1.5"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>',rl:'<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12a7 7 0 1 0 2.5-5.4M5 4v4h4"/></svg>',rr:'<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12a7 7 0 1 1-2.5-5.4M19 4v4h-4"/></svg>'};
function phDetect(){try{const P=new URLSearchParams(location.search);if(P.has('phone'))return P.get('phone')!=='0'}catch(e){}
  const s=Math.min(innerWidth,innerHeight);if(s<=500)return true;let c=false;try{c=matchMedia('(pointer:coarse)').matches}catch(e){}return c&&s<=600}
function phInsets(){try{const P=new URLSearchParams(location.search);if(P.has('safe')){const a=P.get('safe').split(',').map(Number);return {t:a[0]||0,r:a[1]||0,b:a[2]||0,l:a[3]||0}}
  let p=document.getElementById('phprobe');if(!p){p=document.createElement('div');p.id='phprobe';p.setAttribute('aria-hidden','true');p.style.cssText='position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)';document.body.appendChild(p)}
  const c=getComputedStyle(p);return {t:parseFloat(c.paddingTop)||0,r:parseFloat(c.paddingRight)||0,b:parseFloat(c.paddingBottom)||0,l:parseFloat(c.paddingLeft)||0}}catch(e){return {t:0,r:0,b:0,l:0}}}
function phApply(){const R=document.documentElement;const was=PH.on;PH.on=phDetect();R.classList.toggle('ph',PH.on);
  if(!PH.on){R.classList.remove('ph-l','ph-p');for(const k of['--bs','--sat','--sar','--sab','--sal'])R.style.removeProperty(k);return was}
  const w=innerWidth,h=innerHeight,I=phInsets(),bar=44;PH.land=w>h;
  const bs=PH.land?Math.min(h-I.t-I.b,w-I.l-I.r-300):Math.max(Math.round((w-I.l-I.r)*.78),Math.min(w-I.l-I.r,h-I.t-I.b-bar-250));
  R.classList.toggle('ph-l',PH.land);R.classList.toggle('ph-p',!PH.land);
  R.style.setProperty('--bs',Math.max(200,Math.floor(bs))+'px');R.style.setProperty('--sat',I.t+'px');R.style.setProperty('--sar',I.r+'px');R.style.setProperty('--sab',I.b+'px');R.style.setProperty('--sal',I.l+'px');return true}
// ---------- camera: flat top-down, the 6x6 board + edge numbers fill the square ----------
function phZoom(){if(!PH.on||!kitOk())return;let c=null,r=null;
  if(PH.zoom&&G&&UI.started){const vs=viewSeat(),sd=sideToAct(),i=vs>=0?vs:sd;let S=i>=0?G.ships[i]:null;let p=S&&shipPos(S);if(!p){S=G.ships.find(x=>shipPos(x));p=S&&shipPos(S)}if(p){c=p.c;r=p.r}}
  const key=c!=null?c+','+r:'';if(key===PH.zk)return;PH.zk=key;try{if(key)TWKit.focus(c,r,1.7);else TWKit.focus(null)}catch(e){}}
// ---------- mini tile with the route highlighted ----------
const PH_P=[[1/3,0],[2/3,0],[1,1/3],[1,2/3],[2/3,1],[1/3,1],[0,2/3],[0,1/3]],PH_N=[[0,1],[0,1],[-1,0],[-1,0],[0,-1],[0,-1],[1,0],[1,0]];
function phD(a,b){const pa=PH_P[a],pb=PH_P[b],na=PH_N[a],nb=PH_N[b],dd=Math.hypot(pa[0]-pb[0],pa[1]-pb[1]),k=Math.min(.5,Math.max(.17,dd*.55));const f=p=>(6+p[0]*88).toFixed(1)+' '+(6+p[1]*88).toFixed(1);
  return 'M'+f(pa)+'C'+f([pa[0]+na[0]*k,pa[1]+na[1]*k])+' '+f([pb[0]+nb[0]*k,pb[1]+nb[1]*k])+' '+f(pb)}
function phMini(card,rot,A){const ps=TWKit.rotate(BASE_PATHS[CUR_TYPE[card]],rot||0);const st=A&&A.steps&&A.steps[0];const en=st?st.from:-1,ex=st?st.to:-1,bad=A&&A.bad;
  let s=`<svg class="mini" viewBox="0 0 100 100" aria-hidden="true"><rect x="2" y="2" width="96" height="96" rx="11" fill="#1d7c83" stroke="#14232b" stroke-width="3"/>`;
  for(const [a,b] of ps){if(!((a===en&&b===ex)||(a===ex&&b===en)))s+=`<path d="${phD(a,b)}" fill="none" stroke="#c9f2ea" stroke-opacity=".8" stroke-width="3.4" stroke-linecap="round"/>`}
  if(st){const col=bad?'#ff4b36':'#ffd24a',d=phD(en,ex);const q=PH_P[ex],o=PH_N[ex],px=6+q[0]*88,py=6+q[1]*88,tx=px-o[0]*9,ty=py-o[1]*9,nx=-o[1]*7,ny=o[0]*7,bx=px+o[0]*1,by=py+o[1]*1;
    s+=`<path d="${d}" fill="none" stroke="#14232b" stroke-width="11" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="6.5" stroke-linecap="round"/>`;
    s+=`<polygon points="${tx.toFixed(1)},${ty.toFixed(1)} ${(bx+nx).toFixed(1)},${(by+ny).toFixed(1)} ${(bx-nx).toFixed(1)},${(by-ny).toFixed(1)}" fill="${col}" stroke="#14232b" stroke-width="2"/>`;
    const e=PH_P[en];s+=`<circle cx="${6+e[0]*88}" cy="${6+e[1]*88}" r="6.5" fill="#fff" stroke="#14232b" stroke-width="3"/>`}
  return s+'</svg>'}
function phWhy(A){if(!A)return '';if(A.coll)return 'collision';if(A.st==='edge')return 'off the edge';if(A.st==='mon')return 'hits a monster';if(A.st==='gate')return 'Rift Gate';if(A.st==='ok')return (A.n||1)+(A.n>1?' currents':' current')+(A.mons&&A.mons.length?' · monster near':'');return ''}
// ---------- what the player may do right now ----------
function phPlaceCtx(){if(!G||!UI.started||G.over||UI.busy)return null;const d=sideToAct();if(d<0||!G.seats[d].human||mustPass(d))return null;if(NET.on&&d!==NET.mySeat)return null;if(G.q||G.phase!=='play'||G.step!=='act')return null;
  const K=knowledge(d);return {d,K,hand:K.hands[d],sel:UI.sel,pl:(UI.moves||[]).filter(m=>m.a==='place')}}
function phExtras(c){const mv=UI.moves||[];const cm={};for(const x of mv.filter(m=>m.a==='cannon')){const k=x.m+':'+x.s;if(!cm[k])cm[k]=x}let h='';
  for(const x of Object.values(cm))h+=`<button class="pb warn" data-a="cannon" data-t="${x.t}" data-m="${x.m}" data-s="${x.s}">Fire at ${esc(levName(x.m))}</button>`;
  const gs={};for(const g of mv.filter(m=>m.a==='gate')){const k=g.t+':'+g.s;if(gs[k])continue;gs[k]=1;h+=`<button class="pb" data-a="gate" data-t="${g.t}" data-s="${g.s}">Rift Gate${g.s!==c.d?' for '+esc(nm(g.s)):''}</button>`}
  if(mv.find(m=>m.a==='pass'))h+=`<button class="pb" data-a="pass">Pass</button>`;return h}
function phTargets(c){const fr=[...new Set(c.pl.map(m=>m.s))];if(fr.length<2)return '';return `<div class="ps-x">${fr.map(s=>`<button class="pb${c.sel&&c.sel.s===s?' on':''}" data-a="target" data-s="${s}">${dot(s)} ${esc(nm(s))}</button>`).join('')}</div>`}
function phZoomBtn(){const c3=$('#c3');if(!c3||c3.hidden)return '';return `<button class="pb zoom${PH.zoom?' on':''}" data-ph="zoom" aria-pressed="${PH.zoom}" aria-label="Zoom to my ship" title="Zoom to my ship">${PH_ICO.zoom}</button>`}
function phHint(){if(UI.res&&UI.res.text)return esc(UI.res.text);return ''}
// ---------- the control strip ----------
function phStripHTML(){if(!G||!UI.started)return '';const d=sideToAct(),zb=phZoomBtn();
  if(G.over&&!UI.busy)return `<div class="ps-main"><div class="ps-msg"><b>Game over</b></div><div class="ps-ctl">${PH.ovHide===G.over?'<button class="pb pri" data-ph="showover">Result</button>':''}<button class="pb" data-a="again">Play again</button>${zb}</div></div>`;
  if(UI.busy){const now=UI.curTurn!=null&&G.seats[UI.curTurn]?UI.curTurn:d;return `<div class="ps-main"><div class="ps-msg">${now>=0?dot(now)+' '+phWhose(now):'The sea moves'}</div><div class="ps-ctl"><button class="pb" data-a="skip">${humans().length===1&&!NET.on&&now!==youSeat()?'Skip to my turn':'Skip'}</button>${zb}</div></div><div class="ps-hint">${phHint()}</div>`}
  if(d<0)return `<div class="ps-main"><div class="ps-ctl">${zb}</div></div>`;
  const dh=G.seats[d].human;
  if(NET.on&&dh&&d!==NET.mySeat)return `<div class="ps-main"><div class="ps-msg">${dot(d)} <b>${esc(nm(d))}</b> is deciding...</div><div class="ps-ctl">${zb}</div></div>`;
  if(dh&&mustPass(d))return `<div class="ps-main"><div class="ps-msg">Pass the device to <b>${esc(nm(d))}</b></div><div class="ps-ctl">${zb}</div></div>`;
  if(!dh)return `<div class="ps-main"><div class="ps-msg">${dot(d)} ${phWhose(d)} <small>(computer)</small></div><div class="ps-ctl">${UI.pause||!humans().length?`<button class="pb" data-a="pause">${UI.pause?'Resume':'Pause'}</button>`:''}${zb}</div></div><div class="ps-hint">${phHint()}</div>`;
  if(G.q)return `<div class="ps-main"><div class="ps-msg">${dot(d)} <b>Decide</b> in the card</div><div class="ps-ctl">${zb}</div></div>`;
  if(G.phase==='setup'){let best='';try{const info=startInfo(d),adv=startAdvice(knowledge(d),d,info);if(adv)best=`<button class="pb pri" data-a="startmark" data-x="${adv.o.m.x}" data-y="${adv.o.m.y}" data-e="${adv.o.m.e}" title="${esc(adv.why)}">Best start</button>`}catch(e){}
    return `<div class="ps-main"><div class="ps-msg">${hotSeat()?'<b>'+esc(nm(d))+',</b> choose':'You sail the '+dot(d)+' <b>'+esc(colOf(d).name||nm(d))+'</b> junk. <b>Choose</b>'} your start: tap <b>Best start</b>, or an edge square and then a gold mark.</div><div class="ps-ctl">${best}${zb}</div></div>`}
  const c=phPlaceCtx();if(!c)return `<div class="ps-main"><div class="ps-ctl">${zb}</div></div>`;
  const {d:dd,K,hand,sel,pl}=c,can=pl.length>0&&!!sel;let tiles='';
  hand.forEach((card,t)=>{const on=can&&sel.t===t;
    if(isCur(card)){const r=sel?(sel.t===t?sel.r:phRot(t)):0;let bd='',lab='';if(can){const A=analyse(K,dd,{a:'place',t,r,s:sel.s});const rk=!!phRisk(K,A);bd=`<i class="bd ${A.bad?'sink':rk?'risk':'safe'}">${A.bad?'&#10007;':rk?'!':'&#10003;'}</i>`;lab=A.bad?', sinks':rk?', safe now but a leviathan could swim onto your path next roll':', safe'}
      tiles+=`<button class="pt${on?' sel':''}" data-a="card" data-t="${t}" data-owner="${dd}" data-up="1" aria-label="Tile ${t+1}${lab}"><img alt="" src="${TWKit.cardURL(BASE_PATHS[CUR_TYPE[card]],{rot:r,size:80,uid:'s'+t})}">${bd}</button>`}
    else tiles+=`<button class="pt sp${on?' sel':''}" data-a="card" data-t="${t}" data-owner="${dd}" data-up="1" aria-label="${isGate(card)?'Rift Gate':'Deck Cannon'}">${isGate(card)?gateArt():cannonArt()}</button>`});
  let ctl='';if(can&&isCur(hand[sel.t])){const m={a:'place',t:sel.t,r:sel.r,s:sel.s},err=legal(m,dd);
    ctl=`<button class="pb" data-a="rot" data-d="-1" aria-label="Turn left" title="Turn left (Q)">${PH_ICO.rl}<span class="lbl">Turn</span></button><button class="pb" data-a="rot" data-d="1" aria-label="Turn right" title="Turn right (R)">${PH_ICO.rr}<span class="lbl">Turn</span></button><button class="pb pri" data-a="place"${err?' disabled':''}>Place</button>`}
  const hint=PH.pop==='tiles'?'':(can?phTileHint(K,dd,hand,sel):'Nothing can be laid: pick an option.');
  return `<div class="ps-main"><div class="ps-tiles">${tiles}</div><div class="ps-ctl">${ctl}${zb}</div></div>${phTargets(c)}<div class="ps-x">${phExtras(c)}</div><div class="ps-hint">${PH.toast?esc(PH.toast):hint}</div>`}
function phStrip(){const el=$('#ps');if(!el)return;const h=PH.on?phStripHTML()+phGoal()+phFeed():'';if(h!==PH.strip){PH.strip=h;el.innerHTML=h}}
// "safe now, but...": a leviathan whose own arrows can bring it onto the square in front of where you stop, or onto your tile, on its next wake roll
function phRisk(K,A){if(!A||A.bad||!A.end)return null;const sq=[A.end];if(A.on)sq.push(A.on);const out=[];let safe=1;for(const id of A.mons||[]){const m=K.mons.find(x=>x.id===id&&x.k==='L');const f=m?monHits(m,sq):[];if(f.length){out.push({id,f});safe*=1-f.length/6}}
  if(!out.length)return null;out.pct=Math.round(16/36*(1-safe)*100);return out.pct>=14?out:null}
// each tile keeps its own turn (Turn used to turn all three previews at once)
function phRot(t){return (UI.rots&&UI.rots[t])||0}
function phSelTile(t){if(!UI.sel)return;UI.rots=UI.rots||[];UI.rots[UI.sel.t]=UI.sel.r;UI.sel.t=t;UI.sel.r=phRot(t)}
// whose turn it is, in plain words
function phWhose(i){const me=youSeat();return i===me&&me>=0&&!hotSeat()?'<b>Your turn</b>'+(UI.busy?': the dice roll first':''):'<b>'+esc(nm(i))+"'s turn</b>"}
// what to do with the tiles: pick, turn, place; and when every tile sinks this way round, say that turning can fix it
function phTileHint(K,d,hand,sel){let safeNow=0,safeTurn=0,risk=null;try{const cs=hand[sel.t];if(isCur(cs))risk=phRisk(K,analyse(K,d,{a:'place',t:sel.t,r:sel.r,s:sel.s}))}catch(e){}
  if(risk){const r=risk[0];let calm=false;try{calm=hand.some((c,t)=>isCur(c)&&[0,1,2,3].some(rr=>{const A=analyse(K,d,{a:'place',t,r:rr,s:sel.s});return !A.bad&&!phRisk(K,A)}))}catch(e){}
    return `<b>!</b> Safe now, but if the dice total 6, 7 or 8, <b>${esc(levName(r.id))}</b> swims onto your path on its roll of ${r.f.join(' or ')}${risk.length>1?' (and '+(risk.length-1)+' more)':''}: about a ${risk.pct}% chance before your next turn. ${calm?'Another tile or turn gives a &#10003;.':'No &#10003; this turn: every route is within a leviathan\'s reach.'}`}
  try{hand.forEach((c,t)=>{if(!isCur(c))return;if(!analyse(K,d,{a:'place',t,r:sel.r,s:sel.s}).bad)safeNow++;else if([0,1,2,3].some(r=>!analyse(K,d,{a:'place',t,r,s:sel.s}).bad))safeTurn++})}catch(e){}
  try{const A=analyse(K,d,{a:'place',t:sel.t,r:sel.r,s:sel.s});const hit=(A.others||[]).filter(o=>o.coll||o.st==='edge'||o.st==='mon');if(!A.bad&&hit.length)return `<b>Good move:</b> this tile also carries ${hit.map(o=>esc(nm(o.i))).join(' and ')} along its line, and ${hit.length>1?'they sink':'it sinks'}!`}catch(e){}
  if(safeNow)return 'Pick a tile, turn it if you like, then press Place. &#10003; safe &middot; <b>!</b> a leviathan could reach you next roll &middot; &#10007; sinks. The gold line is your route.';
  if(safeTurn)return 'Every tile sinks you this way round. Press Turn to find a &#10003;.';
  return 'Every tile sinks you: pick the one that does least harm.'}
// the goal and the race, always on screen: who is still afloat
function phGoal(){if(!G||!UI.started||UI.busy||G.phase==='setup'&&!G.turn)return '';const so=G.variant==='solo',es=G.variant==='easysolo';const me=youSeat();
  if(so||es){const toRise=G.mdeck.filter(x=>x<10).length,L=G.mons.filter(m=>m.k==='L').length;return `<div class="ps-goal">${so?`Goal: outlast every leviathan &middot; ${toRise} still to rise, ${L} on the board`:`Goal: stay afloat until turn ${G.opts.goal} (now ${G.turn})`}</div>`}
  const lab=i=>`<i style="background:${colOf(i).sail}"></i>${i===me&&me>=0&&!hotSeat()?'You':esc(nm(i))}`;const up=G.order.filter(i=>G.ships[i].alive),dn=G.order.filter(i=>!G.ships[i].alive);
  return `<div class="ps-goal">Last junk afloat wins. <b>Afloat:</b>${up.map(lab).join('')}${dn.length?` &middot; <b>Sunk:</b><s>${dn.map(lab).join('')}</s>`:''}</div>`}
// what happened since your last move, in order, so nothing changes off-screen (the replay can be skipped or missed)
function phFeed(){if(!G||!UI.started||UI.busy||G.over||G.phase==='setup'||UI.myLogI==null)return '';
  const L=G.log.filter(l=>l.i>UI.myLogI&&!/^Turn \d+/.test(l.t)&&!/ draws? /.test(l.t)).reverse();if(!L.length)return '';
  const keep=L.slice(-6),more=L.length-keep.length;const me=youSeat(),mn=me>=0&&!hotSeat()?nm(me):null;const you=t=>mn?esc(t).split(esc(mn)).join(esc(mn)+' (you)'):esc(t);
  return `<div class="ps-feed"><h5>Since your last move</h5><ol>${keep.map(l=>`<li class="${l.c==='bad'?'bad':l.c==='big'?'big':''}">${you(l.t)}</li>`).join('')}</ol>${more?`<p class="tiny">${more} earlier line${more>1?'s':''} in the Log.</p>`:''}</div>`}
// ---------- the pop-up: tiles / info / start marks (lives in the free zone next to the board, never over it) ----------
function phTilesHTML(c){const {d,K,hand,sel,pl}=c;if(!pl.length||!sel)return '';const multi=hotSeat()||humans().length>1;
  const m={a:'place',t:sel.t,r:sel.r,s:sel.s};let selA=null,tiles='';
  hand.forEach((card,t)=>{const on=sel.t===t;
    if(isCur(card)){const rr=on?sel.r:phRot(t);const A=analyse(K,d,{a:'place',t,r:rr,s:sel.s});if(on)selA=A;
      tiles+=`<button class="ph-t${on?' sel':''}" data-ph="pcard" data-t="${t}" data-owner="${d}" data-up="1" aria-label="Tile ${t+1}: ${A.bad?'sinks':'safe'}, ${phWhy(A)}">${phMini(card,rr,A)}<span class="bd ${A.bad?'sink':phRisk(K,A)?'risk':'safe'}">${A.bad?'SINKS':phRisk(K,A)?'RISKY':'SAFE'}</span><small>${esc(phWhy(A))}</small></button>`}
    else tiles+=`<button class="ph-t sp${on?' sel':''}" data-ph="pcard" data-t="${t}" data-owner="${d}" data-up="1" aria-label="${isGate(card)?'Rift Gate':'Deck Cannon'}">${isGate(card)?gateArt():cannonArt()}<span class="bd">${isGate(card)?'GATE':'CANNON'}</span></button>`});
  const cur=isCur(hand[sel.t]);const err=cur?legal(m,d):'';
  return `<div class="ph-head"><b>${multi?esc(nm(d))+': lay':'Lay'} a current</b><button class="ph-x" data-ph="pclose" aria-label="Close">&times;</button></div>
  <div class="ph-tiles" style="touch-action:pan-y">${tiles}</div>
  <div class="ph-ctl"><button class="pb" data-a="rot" data-d="-1" aria-label="Turn left" title="Turn left (Q)">${PH_ICO.rl}</button><span class="ph-rot" style="touch-action:pan-y">turned ${(sel.r||0)*90}&deg; <small>(swipe or tap)</small></span><button class="pb" data-a="rot" data-d="1" aria-label="Turn right" title="Turn right (R)">${PH_ICO.rr}</button>
  ${cur?`<button class="pb pri" data-a="place"${err?' disabled':''}>Place</button>`:(()=>{const g=(UI.moves||[]).find(x=>x.a==='gate'&&x.t===sel.t&&x.s===sel.s);return g?`<button class="pb pri" data-a="gate" data-t="${g.t}" data-s="${g.s}">Play Gate</button>`:''})()}</div>
  ${phTargets(c)}
  <p class="ph-out">${cur&&selA?outcomeHTML(K,d,m,selA):'This tile cannot be laid on a current.'}${err&&selA&&selA.bad?' <span class="warn-l">Not allowed: another tile is safer.</span> <button class="pb small" data-a="sugg">Safest move</button>':''}</p>
  <div class="ps-x">${phExtras(c)}</div>`}
const phFace=['north','north-east','east','south-east','south','south-west','west','north-west'];
function phMonInfo(m){const L=LEV[m.id];const d=sideToAct(),vs=viewSeat();const S=vs>=0?G.ships[vs]:null;
  const faces=L.arr.map((a,i)=>`<li><b>${i+1}</b> ${a==='R'?'quarter turn '+(L.rd>0?'clockwise':'counter-clockwise'):'swims '+DNAME[(DIRN[a]+m.r)%4]}</li>`).join('')+'<li><b>6</b> stays; another leviathan rises</li>';
  let thr='';if(S&&S.alive&&S.x!=null){const f=monHits(m,[[S.x,S.y]]);thr=f.length?`<p class="warn-l">Faces ${f.join(', ')} move it onto the square in front of your junk.</p>`:`<p class="tiny">It cannot reach the square in front of your junk this turn.</p>`}
  return {t:levName(m.id),at:[m.x,m.y],h:`<div class="ph-info"><img alt="" src="${TWKit.leviathanURL(levArrows(m.id),{rot:m.r,uid:'pi',size:104})}"><div><p><b>A leviathan.</b> When the two dice total 6, 7 or 8 it wakes, rolls one die and swims the way that face points. A junk whose wake ends on its square sinks; so does a tile it swims onto. Move order ${L.order}${L.gold?' (gold: wins ties)':''}.</p></div></div><ul class="ph-faces">${faces}</ul>${thr}`}}
function phInfoData(pd){if(!G||!pd)return null;
  if(pd.k==='ship'){const S=G.ships[pd.i];if(!S)return null;const p=shipPos(S);const me=viewSeat()===pd.i;const sq=S.x!=null?`front square: column ${S.x+1}, row ${S.y+1}`:S.alive?'on a tile':'sunk';
    return {t:(me?'You: ':'')+nm(pd.i)+"'s junk",at:p?[p.c,p.r]:null,h:`<p>${dot(pd.i)} <b>${esc(nm(pd.i))}</b> ${G.seats[pd.i].human?'(human)':'(computer, '+esc(G.seats[pd.i].lv)+')'}${G.team?' team '+'AB'[G.team[pd.i]]:''}.</p><p>${S.alive?'Afloat; '+sq+'.':'Sunk.'} Holds ${G.hands[pd.i].length} tile${G.hands[pd.i].length===1?'':'s'}${S.alive&&S.x!=null?'. Its wake follows the tile laid in front of it, and it sinks if it sails off the edge, into a leviathan, or onto another junk\'s wake.':'.'}</p>`}}
  const m=G.mons.find(x=>x.x===pd.x&&x.y===pd.y);
  if(pd.k==='mon'){if(!m||m.k!=='L')return null;return phMonInfo(m)}
  if(pd.k==='mael'){if(!m||m.k!=='M')return null;return {t:'Maelstrom',at:[m.x,m.y],h:`<p><b>A whirlpool.</b> On a calm wake roll it moves: 1 east, 2 south, 3 west, 4 north, 5 or 6 stays. It destroys the tile and junk it enters.</p>`}}
  if(pd.k==='gate'){if(!G.gates.some(g=>g.x===pd.x&&g.y===pd.y))return null;return {t:'Rift Gate',at:[pd.x,pd.y],h:`<p><b>A rift in the sea.</b> It stays on its square. A junk or leviathan that touches it is thrown to a rolled square.</p>`}}
  if(pd.k==='wave'){const w=G.wave;if(!w)return null;return {t:'Rogue Wave',at:[w.x,w.y],h:`<p><b>A rogue wave</b> sweeping ${(w.r&1)?'column '+(w.x+1):'row '+(w.y+1)}, heading ${DNAME[w.r]}, strength ${waveStr()}. Any junk in that band rolls a die and capsizes if it does not reach ${waveStr()}.</p>`}}
  return null}
function phInfoHTML(){const I=phInfoData(PH.pd);if(!I)return null;return `<div class="ph-head"><b>${esc(I.t)}</b><button class="ph-x" data-ph="pclose" aria-label="Close">&times;</button></div><div class="ph-body">${I.h}</div>`}
function phStartHTML(){const d=sideToAct();const pd=PH.pd;let info=[];try{info=startInfo(d).filter(o=>o.m.x===pd.x&&o.m.y===pd.y)}catch(e){}if(!info.length)return null;let adv=null;try{adv=startAdvice(knowledge(d),d,startInfo(d))}catch(e){}
  return `<div class="ph-head"><b>Start here?</b><button class="ph-x" data-ph="pclose" aria-label="Close">&times;</button></div><div class="ph-body"><p class="tiny">Pick a gold mark on this square. A mark in the middle of an edge is safest; next to a corner you may run out of room.</p><div class="ph-marks">${info.map(o=>`<button class="pb big${adv&&adv.o===o?' pri':''}" data-a="startmark" data-x="${o.m.x}" data-y="${o.m.y}" data-e="${o.m.e}">${o.edge[0].toUpperCase()+o.edge.slice(1)} ${o.idx}, ${o.sideWord} mark${adv&&adv.o===o?' (best)':''}</button>`).join('')}</div></div>`}
function phPopup(){const el=$('#ppop');if(!el)return;let h=null;
  if(PH.on&&G&&UI.started&&!(PH.cur&&PH.cur.block&&PH.pop!=='info')){
    if(PH.pop==='tiles'){const c=phPlaceCtx();h=c?phTilesHTML(c):null}
    else if(PH.pop==='info')h=phInfoHTML();
    else if(PH.pop==='start'){const d=sideToAct();h=d>=0&&G.seats[d].human&&G.phase==='setup'&&!G.q&&!UI.busy&&!mustPass(d)?phStartHTML():null}}
  if(!h){if(PH.pop){PH.pop=null;PH.pd=null}if(!el.hidden){el.hidden=true;el.innerHTML='';PH.pop_h=''}return}
  if(h!==PH.pop_h){const fresh=el.hidden;PH.pop_h=h;el.innerHTML=h;el.hidden=false;el.classList.toggle('in',fresh)}}
function phClose(){PH.pop=null;PH.pd=null;PH.toast='';phPopup();phStrip();try{ovUpdate()}catch(e){}}
function phOpen(kind,pd){PH.pop=kind;PH.pd=pd||null;PH.toast='';phPopup();phStrip();try{ovUpdate()}catch(e){}}
// ---------- cards: coach tips, wake roll, Sunk!, interrupts, pass screen, end card ----------
function phNeed(){if(!G||!UI.started)return null;const d=sideToAct();
  if(!G.over&&d>=0&&G.seats[d].human&&mustPass(d)&&!(NET.on))return 'pass';
  if(!G.over&&!UI.busy&&G.q&&d>=0&&G.seats[d].human&&!mustPass(d)&&!(NET.on&&d!==NET.mySeat))return 'q';
  if(UI.sunk&&UI.sunk.length)return 'sunk';
  if(G.over&&!UI.busy&&PH.ovHide!==G.over)return 'over';
  if(UI.mph&&PH.mphHide!==UI.mph&&(UI.mph.wake||UI.mph.lines.length)&&!UI.skipAll&&!(G.over&&!UI.busy))return 'mph';
  if(!UI.busy&&!G.over&&(UI.confirm||UI.guide==='full'&&nextLesson()))return 'coach';
  return null}
const PH_SRC={pass:'#main .passbox',over:'#main [data-over]',q:'#main [data-qkind]',sunk:'#cards > *',mph:'#res .mph',coach:'#coach .coach:not(.light)'};
function phCards(){const pc=$('#pc');if(!pc)return;const kind=PH.on?phNeed():null;
  if(!kind){PH.cur=null;if(!pc.hidden){pc.hidden=true;pc.innerHTML=''}clearTimeout(PH.tmr);PH.tmr=0;try{phPopup()}catch(e){}return}
  const src=document.querySelector(PH_SRC[kind]);let html=null;
  if(src){if(kind==='q'){const w=document.createElement('div');w.className='pc-in';w.appendChild(src);pc.replaceChildren(w);PH.cur={kind,html:'q'+G.logN}}
    else{const w=document.createElement('div');w.className='pc-in';const cl=src.cloneNode(true);w.appendChild(cl);
      for(const b of cl.querySelectorAll('[data-a=sunkok],[data-a=coachok]'))b.textContent='Continue';
      if(kind==='over'){const rw=cl.querySelector('.row');if(rw){const sb=document.createElement('button');sb.className='btn';sb.dataset.ph='dismiss';sb.textContent='See the board';rw.appendChild(sb)}}
      if(kind==='mph'){const r=document.createElement('div');r.className='row';r.innerHTML=`<button class="btn pri" data-ph="dismiss">Continue</button>`;w.appendChild(r)}
      html=w.innerHTML;if(!PH.cur||PH.cur.kind!==kind||PH.cur.html!==html){const fresh=pc.hidden||!PH.cur||PH.cur.kind!==kind;pc.replaceChildren(w);PH.cur={kind,html};if(fresh){pc.classList.remove('in');void pc.offsetWidth;pc.classList.add('in')}}}}
  else if(!PH.cur||PH.cur.kind!==kind){pc.hidden=true;pc.innerHTML='';PH.cur=null;return}
  pc.hidden=false;PH.cur.block=true;
  if(PH.pop&&(PH.pop!=='info'||kind==='pass'||kind==='over'||kind==='q')){PH.pop=null;PH.pd=null;phPopup()}
  // the wake roll card goes away by itself a few seconds after the animation ends
  if(kind==='mph'&&!UI.busy&&!PH.tmr){const mp=UI.mph;PH.tmr=setTimeout(()=>{PH.tmr=0;if(UI.mph===mp&&!UI.busy){PH.mphHide=mp;phAfter()}},3500/(UI.tickRate||1))}
  if(kind!=='mph'){clearTimeout(PH.tmr);PH.tmr=0}}
// ---------- one pass after every render ----------
function phAfter(){if(!PH.on)return;try{phCards();phPopup();phStrip();phZoom()}catch(e){console.error(e)}}
// ---------- wiring (wrappers around the page's own functions) ----------
{const _render=render;render=function(){_render.apply(this,arguments);phAfter()};
 const _rr=renderRes;renderRes=function(){_rr.apply(this,arguments);if(PH.on)phCards()};
 const _rc=renderCards;renderCards=function(){_rc.apply(this,arguments);if(PH.on)phCards()};
 const _rco=renderCoach;renderCoach=function(){_rco.apply(this,arguments);if(PH.on)phCards()};
 const _rb=renderBar;renderBar=function(){_rb.apply(this,arguments);if(!PH.on||!G)return;const el=$('#barstat');if(!el)return;
   if(G.phase==='setup'){el.innerHTML='<span class="chip" aria-label="Choose start marks"><b>Pick a start</b></span>';return}
   const L=G.mons.filter(m=>m.k==='L').length,toRise=G.mdeck.filter(x=>x<10).length,es=G.variant==='easysolo',so=G.variant==='solo';
   const T=UI.busy&&UI.curTurnN!=null?UI.curTurnN:G.turn;
   el.innerHTML=`<span class="chip" role="status" aria-label="Turn ${T}${es?' of '+G.opts.goal:''}, ${G.deck.length} tiles left, ${L} monsters on the board${so?', '+toRise+' still to rise':''}"><span class="c2"><b>Turn ${T}${es?'/'+G.opts.goal:''}</b><small>${L} monster${L===1?'':'s'}${so?' (+'+toRise+')':''} &middot; ${G.deck.length} tiles</small></span></span>`};
 const _act=act;act=function(m,s){if(G&&G.seats[s]&&G.seats[s].human&&m&&m.a!=='q')UI.myLogI=G.logN;const p=PH.pop,pd=PH.pd;PH.pop=null;PH.pd=null;PH.toast='';const r=_act.apply(this,arguments);if(r===false&&PH.on&&G&&!G.over){PH.pop=p;PH.pd=pd;phAfter()}return r};
 const _onPick=onPick;PH.orig=_onPick;onPick=function(p){if(!PH.on)return _onPick(p);phPick(p)}}
function phPick(p){if(!G||!UI.started)return;if(PH.cur&&PH.cur.block&&PH.cur.kind!=='coach'&&PH.cur.kind!=='mph'&&PH.cur.kind!=='sunk'&&PH.cur.kind!=='q')return;
  const d=sideToAct(),mine=!UI.busy&&!G.over&&d>=0&&G.seats[d].human&&!mustPass(d)&&!(NET.on&&d!==NET.mySeat);
  let sq=null,ship=null;if(p){if(p.kind==='ship')ship=+String(p.id).slice(1);else if(p.kind==='square'||p.kind==='start')sq=[p.c,p.r]}
  if(mine&&G.q){if(sq||ship!=null)PH.orig(p);return}
  if(mine&&G.phase==='setup'){const S=ship!=null?G.ships[ship]:null;if(!sq&&S&&S.x!=null)sq=[S.x,S.y];
    if(sq){let n=0;try{n=startInfo(d).filter(o=>o.m.x===sq[0]&&o.m.y===sq[1]).length}catch(e){}
      if(n){sfx('click');phOpen('start',{x:sq[0],y:sq[1]});return}
      if(!(G.mons.some(x=>x.x===sq[0]&&x.y===sq[1])||G.gates.some(g=>g.x===sq[0]&&g.y===sq[1]))){PH.toast='Tap a square on the edge of the board to pick a start mark.';phClose();return}}
    else{phClose();return}}
  if(mine&&G.phase==='play'&&G.step==='act'&&UI.fronts){let s=null;if(ship!=null&&UI.fronts.includes(ship))s=ship;else if(sq)s=UI.fronts.find(i=>G.ships[i].x===sq[0]&&G.ships[i].y===sq[1]);
    if(s!=null){if(UI.sel)UI.sel.s=s;sfx('click');PH.pop='tiles';PH.pd=null;PH.toast='';render();return}}
  // anything else: what is that piece?
  let pd=null;
  if(ship!=null&&G.ships[ship])pd={k:'ship',i:ship};
  else if(sq){const m=G.mons.find(x=>x.x===sq[0]&&x.y===sq[1]);const sh=G.ships.find(x=>x.alive&&x.x===sq[0]&&x.y===sq[1]);if(m)pd={k:m.k==='L'?'mon':'mael',x:sq[0],y:sq[1]};else if(sh)pd={k:'ship',i:sh.i};
    else if(G.gates.some(g=>g.x===sq[0]&&g.y===sq[1]))pd={k:'gate',x:sq[0],y:sq[1]};
    else if(G.wave&&G.wave.x===sq[0]&&G.wave.y===sq[1])pd={k:'wave'}}
  if(pd&&phInfoData(pd)){sfx('click');phOpen('info',pd)}else if(PH.pop)phClose()}
// taps inside the strip / pop-up / cards
document.addEventListener('click',e=>{if(!PH.on)return;
  if(Date.now()-PH.swipeT<350&&e.target.closest&&e.target.closest('#ppop')){e.stopPropagation();e.preventDefault();return}
  const t=e.target.closest&&e.target.closest('[data-ph]');
  if(t){const a=t.dataset.ph;e.stopPropagation();
    if(a==='pclose')phClose();
    else if(a==='pcard'){if(UI.sel&&!UI.busy){phSelTile(+t.dataset.t);sfx('tile_rotate');render()}}
    else if(a==='zoom'){PH.zoom=!PH.zoom;PH.zk='?';sfx('click');phAfter()}
    else if(a==='dismiss'){const k=PH.cur&&PH.cur.kind;if(k==='mph')PH.mphHide=UI.mph;else if(k==='over')PH.ovHide=G.over;sfx('click');phAfter();phStrip()}
    else if(a==='showover'){PH.ovHide=null;phAfter()}
    return}
  // a tap on the board (or anywhere that is not a control) while the tile pop-up is open closes it
  if(PH.pop==='tiles'&&!e.target.closest('#ppop,#ps,#pc,.gx-bar,.gx-drawer,.gx-scrim,#start,#netbox,.gx-dock')){e.stopPropagation();e.preventDefault();phClose()}},true);
document.addEventListener('keydown',e=>{if(!PH.on||e.key!=='Escape'||GX.open)return;if(PH.pop){phClose();e.stopPropagation()}},true);
// swipe inside the tile pop-up turns the selected tile
{let sx=0,sy=0,st=0,down=false;
 document.addEventListener('pointerdown',e=>{if(!PH.on||PH.pop!=='tiles'||!e.target.closest('#ppop'))return;down=true;sx=e.clientX;sy=e.clientY;st=Date.now()});
 document.addEventListener('pointerup',e=>{if(!down)return;down=false;if(!PH.on||PH.pop!=='tiles'||!UI.sel||UI.busy)return;const dx=e.clientX-sx,dy=e.clientY-sy;
   if(Math.abs(dx)>=36&&Math.abs(dx)>Math.abs(dy)*1.5&&Date.now()-st<900){PH.swipeT=Date.now();UI.sel.r=(UI.sel.r+(dx>0?1:3))%4;sfx('tile_rotate');render()}})}
window.addEventListener('resize',()=>{if(!G&&!PH.on&&!phDetect())return;const was=PH.on;phApply();if(PH.on||was){PH.zk='?';PH.strip='';PH.pop_h='';try{if(G&&UI.started)render();else phAfter()}catch(e){}}});
