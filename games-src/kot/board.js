// ===== Board-first layer (phones): play on the board, not in menus =====
// Loaded after ui-ph.js. Rules engine and AI untouched; this only changes what the phone shows and how a tap is read.
// - the monster chips become the thin score strip at the top; the header keeps only the menu
// - one short line on the board says what to do now (<= 8 words)
// - big dice in the tray: tap to keep (they lift), Roll tumbles the rest, staggered landings with a clack each
// - before you resolve, the board shows what the dice would do: red claw badges on the monsters they hit, +♥ +⚡ +★ on you
// - when the dice resolve, the dice themselves fly: claws smash into the monsters, hearts into you, energy and stars
//   into your score chip, and the numbers on the chips change when they land (computer turns too, at a watchable pace)
// - the shop is three cards in the tray: tap one to see it, tap it again to buy it (it flies to your chip)
// - first game: a ghost finger shows each new move once; the computer's turn speeds up with a tap on the board
const BF={cap:null,next:0,until:0,snap:null,rel:{},rid:-1,spin:null,sel:-1,fast:false,line:'',tut:{},marks:''};
try{BF.tut=JSON.parse(localStorage.getItem('ccs_bf1')||'{}')||{}}catch(e){BF.tut={}}
const $bf=id=>document.getElementById(id);
function bfOn(){return phOn()&&!!G}
function bfNow(){return performance.now()}
function bfAnim(){return !!ANIM&&!!document.body.animate}
// ---- where things are on screen ----
function bfMonXY(k,up){if(typeof V3!=='undefined'&&V3.on&&V3.cam&&V3.mons&&V3.mons[k]){const st=$bf('stage');if(st&&st.clientWidth){const r=st.getBoundingClientRect();
    const v=V3.mons[k].g.position.clone().add(new THREE.Vector3(0,up==null?2.4:up,0)).project(V3.cam);return {x:r.left+(v.x+1)/2*r.width,y:r.top+(1-v.y)/2*r.height}}}
  const s=document.querySelector(`#map g.seat[data-seat="${k}"]`)||document.querySelector(`.pchip[data-pm="${k}"]`);if(!s)return null;const r=s.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}}
function bfCityXY(){if(typeof V3!=='undefined'&&V3.on&&V3.cam){const st=$bf('stage');if(st&&st.clientWidth){const r=st.getBoundingClientRect();const v=new THREE.Vector3(0,1.4,0).project(V3.cam);return {x:r.left+(v.x+1)/2*r.width,y:r.top+(1-v.y)/2*r.height}}}
  const b=document.querySelector('.gx-board');if(!b)return null;const r=b.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}}
function bfChipXY(k){const c=document.querySelector(`.pchip[data-pm="${k}"]`);if(!c)return null;const r=c.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}}
function bfCenter(el){const r=el.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,w:r.width}}
// ---- layers ----
function bfBuild(){if($bf('bfx'))return;const fx=document.createElement('div');fx.id='bfx';fx.setAttribute('aria-hidden','true');document.body.appendChild(fx);
  const b=document.querySelector('.gx-board');if(b){const ln=document.createElement('div');ln.id='bline';ln.setAttribute('aria-live','polite');b.appendChild(ln);
    const mk=document.createElement('div');mk.id='bmarks';mk.setAttribute('aria-hidden','true');b.appendChild(mk);
    const tp=document.createElement('div');tp.id='btip';tp.setAttribute('aria-live','polite');b.appendChild(tp)}
  const f=document.createElement('div');f.id='bfinger';f.setAttribute('aria-hidden','true');f.innerHTML='<i></i>';document.body.appendChild(f);
  // the score strip lives in the top bar; the menu gets the rows the hidden bar buttons used to open
  const bar=document.querySelector('header.gx-bar'),ch=$bf('pchips');if(bar&&ch&&ch.parentNode!==bar){bar.insertBefore(ch,bar.querySelector('[data-gx="dr-menu"]'))}
  const menu=document.querySelector('#menuwrap .menu');if(menu&&!menu.querySelector('[data-bfm]')){const rows=[['dr-market','🃏 Cards for sale','Every card in the shop, with its full text'],['dr-mine','🎴 Your cards','What you own and what it does'],['dr-mons','👾 Monsters','Every monster’s cards and stats'],['dr-log','📰 What happened','Every event, newest first']];
    menu.insertAdjacentHTML('afterbegin',rows.map(([g,t,s])=>`<button class="btn mrow" data-gx="${g}" data-bfm="1">${t}<small>${s}</small></button>`).join(''))}}
// ---- the one line on the board ----
function bfOut(){if(!G||G.winner||G.mode!=='solo')return false;const me=meSeat();return me>=0&&!G.pl[me].alive}
function bfLineText(){if(!G)return '';if(G.winner)return '';const p=cur();if(UI.choice&&!$bf('choice').classList.contains('hidden'))return 'Choose below ↓';if(bfOut())return 'You’re knocked out · watching the end';
  if(UI.intro||UI.choice)return '';
  if(!humanTurn()){if(NET.on&&G.pl[G.active].human)return `${mname(p)}’s turn`;return `${mname(p)}’s turn · tap to speed up`}
  if(G.phase==='roll'){const nk=G.dice.filter(d=>!d.k).length;
    if(G.rolls<=0||!nk)return 'No rolls left: tap Done';
    if(!G.dice.some(d=>d.k))return 'Tap dice to keep them, then Roll';
    return `Roll the other ${nk}, or tap Done`}
  if(G.phase==='buy'&&!G.bug&&p.vp>=20)return '20★ reached: tap Done to win';
  if(G.phase==='buy'){if(BF.sel>=0&&G.market[BF.sel]!==undefined&&!canBuy(p,BF.sel))return whyNot(p,G.market[BF.sel])||'Can’t buy this one';
    const fk=BF.sel>=0?BF.sel:suggestCard(p);return fk>=0&&canBuy(p,fk)?'Tap BUY, or Done to save ⚡':G.market.some((_,k)=>canBuy(p,k))?'Tap a card to see it':'Not enough ⚡: tap Done'}
  return ''}
function bfLine(){const el=$bf('bline');if(!el)return;const t=BF.flash&&BF.flash.until>bfNow()?BF.flash.t:bfLineText();if(el.textContent!==t)el.textContent=t;el.classList.toggle('hid',!t);el.classList.toggle('flash',!!(BF.flash&&BF.flash.until>bfNow()))}
function bfFlash(t,ms){BF.flash={t,until:bfNow()+(ms||2200)};bfLine();clearTimeout(BF.flashT);BF.flashT=setTimeout(bfLine,(ms||2200)+20)}
// ---- what the dice would do, shown on the board ----
function bfMarks(){const el=$bf('bmarks');if(!el)return;
  if(!G||G.winner||G.phase!=='roll'||!G.dice.length||UI.intro||(BF.spin&&bfNow()<BF.spin.end)){if(el.innerHTML){el.innerHTML='';BF.marks=''}return}
  const p=cur();let s;try{s=scoreDice(p,G.dice)}catch(e){return}
  const br=el.getBoundingClientRect();const items=[];const at=(xy,cls,html)=>{if(xy)items.push(`<b class="bm ${cls}" style="left:${Math.round(xy.x-br.left)}px;top:${Math.round(xy.y-br.top)}px">${html}</b>`)};
  if(s.dmg&&s.targets.length)s.targets.forEach(q=>at(bfMonXY(q.i,3.6),'hit',`${faceSVG('C')}<span>−${s.dmg}</span>`));
  const gain=[];if(s.hl)gain.push(`<span class="h">+${s.hl}♥</span>`);if(s.en)gain.push(`<span class="e">+${s.en}⚡</span>`);if(s.vp)gain.push(`<span class="v">+${s.vp}★</span>`);
  // hearts that cannot heal (in Downtown) and pairs that score nothing yet, shown where they would have counted
  if(s.c&&s.c.H&&!s.hl)gain.push(`<span class="no">${canHealDice(p)?'♥ full':'♥ ✕ 👑'}</span>`);
  if(!s.vp&&G.rolls>0)['1','2','3'].forEach(f=>{if((s.c&&s.c[f])===2)gain.push(`<span class="pair">one more ${f} → ★</span>`)});
  if(gain.length)at(bfMonXY(p.i,3.6),'gain',gain.join(''));
  if(G.city<0&&!inCity(p.i)&&(!G.bayOn||G.bay<0))at(bfCityXY(),'city','👑 <span>+1★</span>');
  const h=items.join('');if(h!==BF.marks){el.innerHTML=h;BF.marks=h}}
// ---- the reroll: dice tumble and land one by one ----
function bfRollWatch(){if(!G||G.rollId===BF.rid)return;const first=BF.rid<0;BF.rid=G.rollId;if(first||!bfAnim()||G.phase!=='roll')return;
  const idx=G.dice.map((d,k)=>d.k?-1:k).filter(k=>k>=0);if(!idx.length)return;const t0=bfNow();BF.spin={t0,idx,end:t0+520+idx.length*95};
  idx.forEach((k,j)=>setTimeout(()=>{if(typeof sfx==='function'){SND.last.clack=0;sfx('clack')}},520+j*95));setTimeout(()=>{bfDice();bfMarks()},BF.spin.end-t0+30)}
function bfDice(){const sp=BF.spin,now=bfNow();document.querySelectorAll('#dice .die[data-die]').forEach(el=>{const k=+el.dataset.die;el.classList.remove('spin');
  if(sp&&now<sp.end&&sp.idx.includes(k)){const j=sp.idx.indexOf(k);el.classList.add('bfroll');el.style.animationDelay=(-(now-sp.t0)/1000)+'s';el.style.setProperty('--land',(.52+j*.095)+'s')}
  else{el.classList.remove('bfroll');el.style.animationDelay=''}})}
// ---- flights ----
function bfFly(html,from,to,o){o=o||{};const L=$bf('bfx');if(!L||!from||!to||!bfAnim()){if(o.land)o.land();return}
  const el=document.createElement('div');el.className='bfly '+(o.cls||'');el.innerHTML=html;L.appendChild(el);const s=o.size||44;el.style.width=el.style.height=s+'px';
  const dx=to.x-from.x,dy=to.y-from.y,lift=o.arc==null?-Math.min(90,40+Math.hypot(dx,dy)*.25):o.arc,sc=o.end||.7;
  const kf=[{transform:`translate(${from.x-s/2}px,${from.y-s/2}px) scale(1) rotate(0deg)`,opacity:1},
    {transform:`translate(${from.x+dx*.5-s/2}px,${Math.min(from.y,to.y)+lift-s/2}px) scale(1.35) rotate(${o.spin==null?200:o.spin/2}deg)`,opacity:1,offset:.45},
    {transform:`translate(${to.x-s/2}px,${to.y-s/2}px) scale(${sc}) rotate(${o.spin==null?400:o.spin}deg)`,opacity:1}];
  const dur=o.dur||560;const a=el.animate(kf,{duration:dur,delay:o.delay||0,easing:'cubic-bezier(.45,.05,.6,1)',fill:'both'});
  a.onfinish=()=>{el.remove();bfBurst(to,o.burst||'');if(o.land)o.land()}}
function bfBurst(at,cls){const L=$bf('bfx');if(!L||!bfAnim())return;const b=document.createElement('div');b.className='bburst '+cls;b.style.left=at.x+'px';b.style.top=at.y+'px';L.appendChild(b);setTimeout(()=>b.remove(),650)}
function bfBump(k,f){const c=document.querySelector(`.pchip[data-pm="${k}"]`);if(!c)return;c.classList.remove('bump','bump-h','bump-v','bump-e');void c.offsetWidth;c.classList.add('bump','bump-'+f);setTimeout(()=>c.classList.remove('bump','bump-'+f),600)}
// ---- capture the dice the moment they resolve ----
function bfCapture(){if(!bfOn()||!bfAnim())return;const els=[...document.querySelectorAll('#dice .die[data-die]')];if(!els.length)return;
  const dice=G.dice.map((d,k)=>{const el=els.find(e=>+e.dataset.die===k);return {f:String(d.f),t:d.t||'',xy:el?bfCenter(el):null,html:el?el.innerHTML:faceSVG(d.f)}});
  const c={};dice.forEach(d=>{const f=d.f[0];c[f]=(c[f]||0)+1});
  BF.cap={t:bfNow(),a:G.active,dice,c,used:{},live:true};BF.next=bfNow()+80;BF.snap=G.pl.map(p=>({h:p.hp,v:p.vp,e:p.en}));BF.rel={};BF.until=bfNow()+900;
  clearTimeout(BF.capT);BF.capT=setTimeout(bfEnd,6000)}
function bfEnd(){if(!BF.cap&&!BF.snap)return;BF.cap=null;BF.snap=null;BF.rel={};phChips()}
function bfSlot(gap){const t=Math.max(bfNow(),BF.next);BF.next=t+(gap||140);return t-bfNow()}
function bfFaceSrc(f){const c=BF.cap;return c.dice.map((d,k)=>({d,k})).filter(o=>o.d.f[0]===f&&o.d.xy)}
function bfDieHTML(o){return `<div class="bdie ${o.d.t?'sp-'+o.d.t:''}">${o.d.html}</div>`}
function bfNarrate(k,e){if(!G||humanTurn()||!phOn())return;const m=/^([+-])(\d+)(♥|⚡|★)$/.exec(e.t||'');if(!m)return;const me=meSeat(),a=G.active;if(me<0)return;
  if(k===me&&m[1]==='-'&&m[3]==='♥')bfFlash(`${mname(G.pl[a])} hits you −${m[2]}♥`,1800);
  else if(k===a&&m[1]==='+'&&m[3]==='★')bfFlash(`${mname(G.pl[a])} +${m[2]}★`,1400)}
function bfPlay(k,e,orig){const c=BF.cap,a=c.a,m=/^([+-])(\d+)(♥|⚡|★)$/.exec(e.t||'');const sound=()=>{const was=c.live;c.live=false;try{fxSound(e.t,e.c)}finally{c.live=was}};
  const fld=m?{'♥':'h','★':'v','⚡':'e'}[m[3]]:null;
  const done=()=>{if(fld){BF.rel[k+fld]=1;phChips();bfBump(k,fld)}orig(k,e);sound();bfNarrate(k,e)};
  let flights=[],to=null,burst='',dieTo=null;
  if(m&&m[1]==='-'&&fld==='h'&&k!==a){flights=bfFaceSrc('C');to=bfMonXY(k,2.6);burst='hit';if(!flights.length&&bfMonXY(a))flights=[{src:bfMonXY(a),html:'<div class="btok claw">'+faceSVG('C')+'</div>'}]}
  else if(m&&m[1]==='+'&&fld==='h'&&k===a){flights=bfFaceSrc('H');to=bfMonXY(k,2.6);burst='heal'}
  else if(m&&m[1]==='+'&&fld==='e'&&k===a){flights=bfFaceSrc('E');to=bfChipXY(k);burst='energy'}
  else if(m&&m[1]==='+'&&fld==='v'&&k===a){const nums=['1','2','3'].filter(f=>(c.c[f]||0)>=3&&!c.used[f]);if(nums.length){nums.forEach(f=>c.used[f]=1);flights=nums.flatMap(f=>bfFaceSrc(f))}
    else flights=[{src:G.city===a?bfCityXY():bfMonXY(k,3),html:'<div class="btok star">★</div>'}];to=bfChipXY(k);burst='star'}
  const t=bfSlot(flights.length?120+Math.min(flights.length,6)*70:90);
  if(!flights.length||!to){setTimeout(done,t+(m?120:200));BF.until=Math.max(BF.until,bfNow()+t+500);return}
  const used=c.usedDie||(c.usedDie={});let landed=false;
  flights.slice(0,6).forEach((o,j)=>{const src=o.src||o.d.xy;const html=o.html||bfDieHTML(o);
    // a die that already flew (claws hitting several monsters) flies again from the same spot, a little smaller
    const again=o.k!=null&&used[o.k];if(o.k!=null)used[o.k]=1;
    bfFly(html,src,to,{delay:t+j*70,dur:fld==='h'&&m[1]==='-'?470:560,cls:(again?'again ':'')+(o.k!=null?'die':'tok'),burst:j?'':burst,end:fld==='h'?.55:.45,spin:o.k!=null?540:0,size:o.k!=null?52:40,
      land:()=>{if(!landed){landed=true;done()}else if(burst==='hit'&&typeof sfx==='function'){SND.last.clack=0;sfx('clack')}}})});
  BF.until=Math.max(BF.until,bfNow()+t+flights.length*70+900)}
// ---- the shop in the tray ----
function bfShop(){const el=$bf('pshop');if(!el||!G)return;if(!phShopOK()||!G.market.length){BF.sel=-1;const tip=$bf('btip');if(tip&&BF.tipHold&&BF.tipHold.until>bfNow()){if(tip.innerHTML!==BF.tipHold.html)tip.innerHTML=BF.tipHold.html}else if(tip&&tip.innerHTML)tip.innerHTML='';return}
  const p=cur(),sg=suggestCard(p);if(BF.sel>=G.market.length)BF.sel=-1;
  el.innerHTML=G.market.map((id,k)=>{const C=CARDS[base(id)],c=costOf(p,id),ok=canBuy(p,k);
    return `<button class="ptile bcard ${C.t} ${k===sg?'sugg':''} ${ok?'ok':'no'} ${k===BF.sel?'sel':''}" data-shop="${k}" aria-label="${esc(C.n)}, costs ${c} energy${ok?'':', not affordable'}. ${esc(C.x)} ${k===BF.sel&&ok?'Tap to buy.':'Tap to see it.'}">
      <span class="cost">${c}</span>${k===sg?'<i class="star">★</i>':''}<span class="art" aria-hidden="true">${cardIcon(id)}</span><b>${esc(C.n)}</b>${ok&&k===(BF.sel>=0?BF.sel:sg)?'<em class="go">BUY</em>':''}</button>`}).join('');
  const tip=$bf('btip');if(tip&&BF.tipHold&&BF.tipHold.until>bfNow()){if(tip.innerHTML!==BF.tipHold.html)tip.innerHTML=BF.tipHold.html}else if(tip){const fk=BF.sel>=0?BF.sel:sg>=0?sg:G.market.findIndex((_,j)=>canBuy(p,j));const id=fk>=0?G.market[fk]:undefined;tip.innerHTML=id===undefined?'':`<b>${esc(CARDS[base(id)].n)}</b> ${chipOf(CARDS[base(id)])}<p>${esc(CARDS[base(id)].x)}</p>`}}
function bfTapCard(k,el){const p=cur();if(!phShopOK())return;
  if(!canBuy(p,k)){BF.sel=k;phRender();const t=document.querySelector(`#pshop [data-shop="${k}"]`);if(t){t.classList.remove('shake');void t.offsetWidth;t.classList.add('shake')}if(typeof sfx==='function')sfx('click');bfFlash(whyNot(p,G.market[k])||'You can’t buy this one',1600);return}
  const fk=BF.sel>=0?BF.sel:suggestCard(p);if(fk!==k){BF.sel=k;phRender();if(typeof sfx==='function')sfx('click');bfFlash('Tap it again to buy',1400);return}
  const from=el?bfCenter(el):null,to=bfChipXY(meSeat()>=0?meSeat():G.active),html=`<div class="bcard-fly">${cardIcon(G.market[k])}</div>`,nm=CARDS[base(G.market[k])].n;
  BF.sel=-1;bfTut('buy',1);BF.tipHold={html:`<b>${esc(nm)}</b> ${chipOf(CARDS[base(G.market[k])])}<p>${esc(CARDS[base(G.market[k])].x)}</p>`,until:bfNow()+3200};setTimeout(()=>{bfShop()},3300);bfFly(html,from,to,{dur:620,end:.4,spin:0,size:64,burst:'star',arc:-70});uiAct({card:String(k)});bfFlash(`Bought ${nm}!`,1400)}
// ---- the computer's turn: a tap on the board speeds it up until your next turn ----
function bfSpeed(){if(BF.fast||!G||humanTurn())return;BF.fast=true;BF.saveDelay=AIDELAY;AIDELAY=Math.min(AIDELAY,140);bfFlash('Fast forward ⏩',900)}
function bfSlowAgain(){if(BF.fast&&(!G||humanTurn()||G.winner)){BF.fast=false;if(BF.saveDelay)AIDELAY=BF.saveDelay}}
// ---- the ghost finger: the first game shows each new move once ----
function bfTut(k,done){if(done){if(!BF.tut[k]){BF.tut[k]=1;try{localStorage.setItem('ccs_bf1',JSON.stringify(BF.tut))}catch(e){}}return}return !BF.tut[k]}
function bfFinger(){const f=$bf('bfinger');if(!f)return;let el=null;
  if(G&&!G.winner&&humanTurn()&&!UI.intro&&!UI.choice&&!PHN.pop&&!(BF.spin&&bfNow()<BF.spin.end)&&!(GX&&GX.open)){
    if(G.phase==='roll'){const nk=G.dice.filter(d=>!d.k).length,kept=G.dice.some(d=>d.k);
      if(bfTut('keep')&&!kept&&G.rolls>0){let m=null;try{m=suggestMask(cur())}catch(e){}const k=m?m.findIndex(x=>x):-1;el=document.querySelector(`#dice .die[data-die="${k>=0?k:0}"]`)}
      else if(bfTut('roll')&&kept&&G.rolls>0&&nk)el=document.querySelector('#pacts [data-act="reroll"]');
      else if(bfTut('done')&&(G.rolls<=0||!nk||!bfTut('roll')))el=document.querySelector('#pacts [data-act="resolve"]')}
    else if(G.phase==='buy'&&bfTut('buy')){const p=cur();const k=G.market.findIndex((_,j)=>canBuy(p,j));if(k>=0&&BF.sel!==k)el=document.querySelector(`#pshop [data-shop="${k}"]`)}}
  if(!el||!el.getClientRects().length){f.classList.remove('on');return}
  const r=el.getBoundingClientRect();f.style.left=(r.left+r.width*.55)+'px';f.style.top=(r.top+r.height*.55)+'px';f.classList.add('on')}
// ---- the opening card on a portrait phone: who you are, the goal, one button ----
{const _ih=introHTML;introHTML=function(){if(!(phOn()&&!PHONE.land))return _ih.apply(this,arguments);const me=meSeat(),q=me>=0?G.pl[me]:null;if(!q)return _ih.apply(this,arguments);
  return `<div class="intro bfintro"><p class="you" style="--mc:${MONS[q.m].c}"><svg viewBox="-66 -70 132 136" aria-hidden="true">${monArt(q.m)}</svg><span>You are <b>${esc(UP(mname(q)))}</b></span></p>
   <p class="goal">First to <b>20 ★</b> wins.<br>Or be the last monster standing.</p>
   <div class="acts"><button class="btn primary" data-a="story">▶ Let's smash${G.evoOn?'<small>First you pick a secret power</small>':''}</button></div></div>`}}
// ---- render hook ----
function bfRender(){if(!phOn())return;bfBuild();bfRollWatch();bfSlowAgain();if(BF.sel>=0&&!phShopOK())BF.sel=-1;
  const dk=document.querySelector('.gx-dock');const hold=!!(BF.cap&&bfNow()<BF.until);
  if(hold){clearTimeout(BF.holdT);BF.holdT=setTimeout(phRender,BF.until-bfNow()+40)}
  if(dk)dk.dataset.bf=G&&!G.winner?(hold?'resolving':humanTurn()?G.phase:'watch'):'';
  // knocked out in a solo game: the rest plays fast, and a new game is one tap away
  const out=bfOut();if(out&&!BF.fast){BF.fast=true;BF.saveDelay=AIDELAY;AIDELAY=Math.min(AIDELAY,140)}
  let ko=$bf('bko');if(out&&!ko&&dk){dk.insertAdjacentHTML('beforeend','<div id="bko"><button class="btn primary" data-a="new">🆕 New game</button></div>');ko=$bf('bko')}if(ko)ko.hidden=!out;
  bfDice();bfShop();bfLine();bfMarks();bfFinger();
  if(G&&BF.cap&&G.phase!=='resolve'&&bfNow()>BF.until)bfEnd()}
// ---- wiring ----
{const _pr=phRender;phRender=function(){_pr.apply(this,arguments);try{bfRender()}catch(e){console.error(e)}};
 // the chips hold the old numbers until the dice that change them land
 const _pc=phChips;phChips=function(){_pc.apply(this,arguments);const el=$bf('pchips');if(el&&G&&el.parentNode&&el.parentNode.matches&&el.parentNode.matches('header.gx-bar'))el.style.setProperty('--cc',G.pl.length);if(G&&!G.winner){const me=meSeat();G.pl.forEach(q=>{const c=document.querySelector(`#pchips .pchip[data-pm="${q.i}"]`);const hot=q.alive&&q.vp>=15&&q.i!==me;if(c)c.classList.toggle('hot',hot);
     if(hot&&me>=0&&!(BF.warned||(BF.warned={}))[q.i+':'+G.gid]){BF.warned[q.i+':'+G.gid]=1;setTimeout(()=>bfFlash(`${mname(q)} is close to 20★!`,2200),50)}})}
   // names that do not fit are trimmed (never clipped)
   document.querySelectorAll('header.gx-bar .pchip b').forEach(b=>{if(b.scrollWidth<=b.clientWidth+1)return;const full=b.textContent;let n=full.length;while(n>2&&b.scrollWidth>b.clientWidth+1){n--;b.textContent=full.slice(0,n)+'…'}});
   if(!BF.snap)return;
   document.querySelectorAll('#pchips .pchip').forEach(c=>{const k=+c.dataset.pm,s=BF.snap[k];if(!s)return;[['h','♥'],['v','★'],['e','⚡']].forEach(([f,sym])=>{if(BF.rel[k+f])return;const em=c.querySelector('em.'+f);if(em)em.textContent=sym+s[f]})})};
 // the tray labels: big words, pips for the rolls left
 const _pa=phActs;phActs=function(){_pa.apply(this,arguments);const pa=$bf('pacts');if(!pa||!G||!humanTurn())return;
   const r=pa.querySelector('[data-act="reroll"]');if(r&&G.phase==='roll'){const nk=G.dice.filter(d=>!d.k).length;r.innerHTML=`<span class="bl">🎲 Roll</span><small class="pips">${Array.from({length:Math.max(G.rolls,rerollsOf(cur()))},(_,k)=>`<i class="${k<G.rolls?'':'used'}"></i>`).join('')}</small>`;r.setAttribute('aria-label',`Roll the ${nk} unkept dice, ${G.rolls} rolls left`)}
   const d=pa.querySelector('[data-act="resolve"]');if(d)d.innerHTML='<span class="bl">✔ Done</span><small>use these dice</small>';
   const e=pa.querySelector('[data-act="end"]');if(e&&G.phase==='buy'){const win=!G.bug&&cur().vp>=20;e.innerHTML=`<span class="bl">✔ ${G.bug?'Finish turn':'Done'}</span><small>${win?'end your turn to win':'end your turn'}</small>`}
   const s=pa.querySelector('[data-act="sweep"]');if(s&&G.phase==='buy'){s.innerHTML='<span class="bl">♻</span><small>new · 2⚡</small>';s.setAttribute('aria-label','Throw these 3 cards away and deal 3 new ones, 2 energy')}};
 const _res=resolve;resolve=function(){if(G&&G.phase==='roll')try{bfCapture()}catch(e){}return _res.apply(this,arguments)};
 const _f3=fx3D;fx3D=function(k,e){if(BF.cap&&BF.cap.live&&bfNow()-BF.cap.t<5000)return bfPlay(k,e,_f3);_f3(k,e);bfNarrate(k,e);
   const m=/^\+(\d+)(★|⚡|♥)$/.exec(e.t||'');if(m&&phOn()&&bfAnim()){const f={'♥':'h','★':'v','⚡':'e'}[m[2]];const tok={'★':'<div class="btok star">★</div>','⚡':'<div class="btok en">⚡</div>','♥':'<div class="btok hp">♥</div>'}[m[2]];
     bfFly(tok,bfMonXY(k,3),bfChipXY(k),{dur:650,delay:250,size:34,spin:0,end:.6,burst:{'h':'heal','v':'star','e':'energy'}[f],land:()=>bfBump(k,f)})}};
 const _fs=fxSound;fxSound=function(t,c){if(BF.cap&&BF.cap.live&&bfNow()-BF.cap.t<5000)return;return _fs(t,c)};
 // the computer waits for the flights to land before its next step
 const _ai=aiStep;aiStep=function(){const w=BF.until-bfNow();if(phOn()&&ANIM&&w>0&&!(NET.on&&NET.role==='client')){UI.pending=true;setTimeout(()=>{UI.pending=false;aiStep()},w+60);return}return _ai.apply(this,arguments)};
 // the old text tips stay off on phones: the finger and the line teach instead
 const _ct=checkTips;checkTips=function(){if(phOn())return;return _ct.apply(this,arguments)}}
window.addEventListener('click',e=>{if(!bfOn())return;const t=e.target;
  const sh=t.closest&&t.closest('#pshop [data-shop]');if(sh){e.stopPropagation();e.preventDefault();bfTapCard(+sh.dataset.shop,sh);return}
  if(t.closest&&t.closest('.gx-board')&&(UI.choice||UI.intro)&&!$bf('choice').classList.contains('hidden')){const c=$bf('choice');c.classList.remove('bfpoke');void c.offsetWidth;c.classList.add('bfpoke');bfFlash('Choose below ↓',1500);return}
  if(t.closest&&t.closest('.gx-board')&&!humanTurn()&&!G.winner&&!UI.choice&&!UI.intro){bfSpeed()}
  else if(t.closest&&t.closest('.gx-board')&&humanTurn()&&!UI.choice&&!UI.intro&&!t.closest('#bline')){bfFlash(G.phase==='roll'?'Tap the dice below ↓':'Tap a card below ↓',1300)}
  if(t.closest&&t.closest('[data-die]')&&humanTurn()&&G.phase==='roll'){bfTut('keep',1);setTimeout(()=>{const d=t.closest('[data-die]');if(d&&typeof sfx==='function'){SND.last.clack=0;sfx('clack')}},0)}
  if(t.closest&&t.closest('[data-act="reroll"]')&&humanTurn()&&G.phase==='roll'&&G.dice.some(d=>d.k))bfTut('roll',1);
  if(t.closest&&t.closest('[data-act="resolve"]')&&humanTurn()&&G.phase==='roll')bfTut('done',1);
  if(t.closest&&t.closest('[data-act="end"]'))BF.sel=-1;
  // tapping the board outside the shop drops the picked card
  if(BF.sel>=0&&!(t.closest&&t.closest('#pshop'))){BF.sel=-1;setTimeout(phRender,0)}},true);
try{if(phOn()&&localStorage.getItem('ccs_speed')===null&&ANIM)AIDELAY=320}catch(e){}
setInterval(()=>{if(!bfOn())return;bfMarks();bfFinger();bfLine()},400);
phLayout();
