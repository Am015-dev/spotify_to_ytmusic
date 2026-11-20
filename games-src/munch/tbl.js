// ---------- the dungeon table: fan the hand, hold a seat for rival details, cards fly from the decks and from the seats ----------
// Rules, engine and AI are untouched. Everything here is looks and touch; the moves still come from validMoves() through uiAct().
const TB={lp:null,lpAt:0,fan:0};
// the hand is a fan: overlap so every card shows a slice and nothing scrolls (scroll only when ~10+ cards would be too thin)
// every hand card shows its name: shrink the type (never below 11 px, the phone floor) until no word is cut and it fits; a name still too long ends in an ellipsis (tbl.css)
function tbFitNames(cs){cs.forEach(c=>{const m=c.querySelector('.cn');if(!m)return;m.style.removeProperty('font-size');let fs=parseFloat(getComputedStyle(m).fontSize)||14;
  const bad=()=>m.scrollWidth>m.clientWidth+.5||m.scrollHeight>m.clientHeight+1;const fl=11;for(let i=0;i<10&&bad()&&fs>fl;i++){fs-=1;m.style.setProperty('font-size',fs+'px','important')}})}
function tbFan(){tbFitNames([...document.querySelectorAll('.arena .card,.bfstage .card')]);const hd=document.querySelector('.mine .hand');if(!hd)return;const cs=[...hd.querySelectorAll(':scope>.card')];hd.style.removeProperty('--hw');if(!cs.length){hd.classList.remove('scrolls');return}
  hd.classList.remove('row');const ph=document.documentElement.classList.contains('ph');if(!ph){hd.classList.remove('scrolls');hd.style.removeProperty('--ov');return}
  const MS=cs.length>=8?30:44,w0=cs[0].offsetWidth||64,avail=hd.clientWidth-18,n=cs.length;if(!avail||!w0){if((tbFan.n=(tbFan.n||0)+1)<25){clearTimeout(tbFan.t);tbFan.t=setTimeout(tbFan,200)}return}tbFan.n=0;   // hand not laid out yet (board hidden behind a screen): fit it again when it shows
  
  // portrait phone, 5+ cards: a fan hides every name, so the hand becomes a row of whole, readable cards that scrolls sideways
  if(document.documentElement.classList.contains('ph-p')){const gap=6;hd.style.setProperty('--ov',gap+'px');hd.style.setProperty('--vis','100%');
    // up to 5 cards always fit; 6+ shrink to 72 px and the row scrolls sideways (every card keeps its art, whole name and bonus)
    const room=hd.clientWidth-8;{const fw=Math.floor((room-gap*(n-1))/n);if(fw<100){const mn=n>5?72:64;let hw=Math.max(mn,fw);if(n>5&&n*mn+(n-1)*gap>room){const g2=14,full=hd.clientWidth,m=Math.max(1,Math.floor((full+g2)/(mn+g2)));hw=Math.floor((full-g2*(m-1))/m);hd.style.setProperty('--ov',g2+'px')}hd.style.setProperty('--hw',hw+'px')}}   // scrolling row: the card width is chosen so a whole number of cards fills the strip (the first view cuts no card in half)
    hd.classList.add('row');const wN=parseFloat(hd.style.getPropertyValue('--hw'))||100;hd.classList.toggle('scrolls',n*wN+(n-1)*gap>room);hd.classList.remove('tight');tbFitNames(cs);return}
  // keep every card's visible slice >= 44 px (a finger): shrink the cards a little when the hand is big, scroll when it still does not fit
  let w=w0;if(n>1){const fit=avail-MS*(n-1);w=Math.max(Math.min(w0,fit),Math.min(w0,56))}
  const need=n>1?(avail-w)/(n-1):w,sc=n>1&&need<MS,step=sc?MS:Math.min(w*.8,need);
  if(w!==w0){hd.style.setProperty('--hw',w.toFixed(1)+'px')}
  hd.style.setProperty('--ov',(step-w).toFixed(1)+'px');hd.style.setProperty('--vis',(step-2).toFixed(1)+'px');
  hd.classList.toggle('scrolls',sc);hd.classList.toggle('tight',step<44);
  // each name sits on the visible strip of its card (the next card covers the rest): shrink the type until no word is cut
  cs.forEach((c,k)=>{const n=c.querySelector('.cn');if(!n)return;n.style.fontSize='';if(k===cs.length-1)return;let fs=parseFloat(getComputedStyle(n).fontSize)||8;for(let i=0;i<10&&n.scrollWidth>n.clientWidth+.5&&fs>11;i++){fs-=.5;n.style.fontSize=fs+'px'}})}
// bring an element into view inside its OWN sideways scroller (the hand, the gear row) and nothing else: scrollIntoView also scrolls the clipped
// (overflow:hidden) table board sideways, which pushed the hand, the rival chips and the glow targets off the screen
function dkReveal(e){for(let p=e&&e.parentElement;p&&p!==document.body;p=p.parentElement){const o=getComputedStyle(p).overflowX;if((o==='auto'||o==='scroll')&&p.scrollWidth>p.clientWidth+1){const r=e.getBoundingClientRect(),q=p.getBoundingClientRect();p.scrollLeft+=(r.left+r.width/2)-(q.left+q.width/2);return}}}
// press and hold a rival seat: their gear and cards (tap is for dropping a card on them)
function tbSeatDown(e){const s=e.target.closest&&e.target.closest('.opps .opp[data-opp]');if(!s||e.button>0)return;clearTimeout(TB.lp);const i=+s.dataset.opp,x=e.clientX,y=e.clientY;
  TB.lp={i,x,y,t:setTimeout(()=>{TB.lp=null;TB.lpAt=Date.now();try{navigator.vibrate&&navigator.vibrate(15)}catch(_){}UI.oppView=i;render();GX.show('dkOpp');const d=document.querySelector('#dkOpp .gx-drawer-body');if(d)d.scrollTop=0},480)}}
function tbSeatCancel(e){if(!TB.lp)return;if(e&&e.type==='pointermove'&&Math.hypot(e.clientX-TB.lp.x,e.clientY-TB.lp.y)<12)return;clearTimeout(TB.lp.t);TB.lp=null}
document.addEventListener('pointerdown',tbSeatDown,{passive:true});document.addEventListener('pointermove',tbSeatCancel,{passive:true});document.addEventListener('pointerup',tbSeatCancel,{passive:true});document.addEventListener('pointercancel',tbSeatCancel,{passive:true});
// a long press must not also count as a tap on the seat
document.addEventListener('click',e=>{if(Date.now()-TB.lpAt<700&&e.target.closest&&e.target.closest('.opps .opp')){e.stopPropagation();e.preventDefault()}},true);
document.addEventListener('contextmenu',e=>{if(e.target.closest&&e.target.closest('.opps .opp'))e.preventDefault()});
function tbFly(html,fr,to,ms,delay){if(!BF.motion()||!fr||!to)return;const e=document.createElement('div');e.className='tbfly';e.innerHTML=html;document.body.appendChild(e);
  const w=e.firstElementChild?e.firstElementChild.getBoundingClientRect().width||54:54,h=e.firstElementChild?e.firstElementChild.getBoundingClientRect().height||54:54;
  const sx=fr.left+fr.width/2-w/2,sy=fr.top+fr.height/2-h/2,tx=to.left+to.width/2-w/2,ty=to.top+to.height/2-h/2;
  const a=e.animate([{transform:`translate(${sx}px,${sy}px) scale(.8) rotate(-10deg)`,opacity:0},{transform:`translate(${sx}px,${sy}px) scale(1) rotate(-6deg)`,opacity:1,offset:.12},{transform:`translate(${(sx+tx)/2}px,${Math.min(sy,ty)-34}px) scale(1.12) rotate(4deg)`,opacity:1,offset:.55},{transform:`translate(${tx}px,${ty}px) scale(.55)`,opacity:0}],{duration:ms||620,delay:delay||0,easing:'cubic-bezier(.3,.7,.3,1)',fill:'both'});a.onfinish=()=>e.remove()}
// the fight must fit inside the table: shrink the cards (never the buttons) until nothing pokes out of it. Cards never go under 56 px:
// below that (3+ monsters, a short table) the fight turns compact: a "YOU 6 vs 8 MONSTERS" readout and a list of named monster tiles.
// Every box is judged where it LANDS (its layout box), not mid-animation, so a card still sliding in is fitted at once, never skipped.
function tbBox(e){const r=e.getBoundingClientRect();if(!e.getAnimations().length)return r;const h=e.offsetHeight,w=e.offsetWidth;   // layout box: the offset chain is untouched by transforms
  let p=e.offsetParent;if(!p)return r;const q=p.getBoundingClientRect();const top=q.top+p.clientTop+e.offsetTop-p.scrollTop,left=q.left+p.clientLeft+e.offsetLeft-p.scrollLeft;return {top,bottom:top+h,left,right:left+w,width:w,height:h}}
// ROOT CAUSE (R47-R53 clips): the fight was sized from guessed heights (--res), the ladder's last step (compact) could still be taller than
// the table, and the fit ran only on a render or a table resize, so a roll box, an image or a font arriving later went unchecked.
// Now: every visible box is MEASURED; the ladder tries normal > tight > tight2 > compact > compact without tiles; if the measured content is still
// taller (or wider) than the table, the whole fight is scaled into the table box (a final transform from measured sizes, so it cannot poke out);
// and the arena and its children are watched, so any later size change re-fits before the next paint.
function tbFit(){const ar=document.querySelector('.arena'),tb=document.querySelector('.table');if(!ar||!tb||!document.documentElement.classList.contains('ph'))return;
  if(TB.fitting)return;TB.fitting=1;if(TB.mo)TB.mo.disconnect();   // the fit's own edits (a shortened name) must not wake the watcher: that refit for ever
  try{tbFit0(ar,tb)}finally{TB.fitting=0;if(TB.mo&&TB.roA&&TB.roA.isConnected)TB.mo.observe(TB.roA,{childList:true,subtree:true})}
  try{tbWatch(ar,tb)}catch(e){}}
// one observer for the table, the arena and every child of the arena: fit again at once (observer callbacks run before paint), at most 8 times a frame
function tbWatch(ar,tb){if(typeof ResizeObserver!=='function')return;
  if(!TB.ro){TB.ro=new ResizeObserver(()=>{const f=performance.now()|0;if(TB.roF!==f>>4){TB.roF=f>>4;TB.roN=0}if(++TB.roN>8){cancelAnimationFrame(TB.raf);TB.raf=requestAnimationFrame(()=>{try{tbFit()}catch(e){}});return}try{tbFit()}catch(e){}});
    TB.mo=typeof MutationObserver==='function'?new MutationObserver(()=>{try{tbFit()}catch(e){}}):null}
  const kids=[...ar.children,...ar.querySelectorAll('.vs>*,.row.mons>.mon,img')];const key=kids.length;if(TB.roT===tb&&TB.roA===ar&&TB.roK===key)return;
  TB.ro.disconnect();TB.ro.observe(tb);TB.ro.observe(ar);for(const k of kids)TB.ro.observe(k);TB.roT=tb;TB.roA=ar;TB.roK=key;
  if(TB.mo){TB.mo.disconnect();TB.mo.observe(ar,{childList:true,subtree:true})}}
function tbFit0(ar,tb){ar.style.removeProperty('--cw');ar.style.removeProperty('transform');ar.style.removeProperty('transform-origin');
  ar.classList.remove('tight','tight2','tight3','cmp','cmp2','squash');if(!ar.querySelector(':scope>.vs'))return;
  // the score pill never outgrows the table (a long rival name next to its portrait): shrink it to fit
  // F16: never by shrinking the type under 11 px: first the portrait goes, then a long name is shortened with …, and only then a last small zoom (>= .79)
  {const sl=ar.querySelector(':scope>.sline .sl1');if(sl){sl.style.removeProperty('zoom');sl.classList.remove('nosav');const W=()=>sl.getBoundingClientRect().width,aw=ar.clientWidth-6;
    const nm=sl.querySelector('.sy i');if(nm){if(nm.dataset.full==null)nm.dataset.full=nm.textContent;nm.textContent=nm.dataset.full}
    if(W()>aw)sl.classList.add('nosav');
    if(nm&&W()>aw){let t=nm.dataset.full;while(W()>aw&&t.length>4){t=t.slice(0,-1);nm.textContent=t.trim()+'…'}}
    const w=W();if(w>aw&&aw>100)sl.style.zoom=Math.max(.79,aw/w).toFixed(3)}}
  const shown=e=>{const cs=getComputedStyle(e);return cs.display!=='none'&&cs.visibility!=='hidden'&&e.getClientRects().length>0};
  // every visible box of the fight (decoration aside: the spinning-die sprite, the crossed swords), judged where it lands
  // F16: a card hidden for a moment (visibility:hidden while the big reveal plays) still takes its room: judge it too, or it is grown into space it does not have
  const laid=e=>getComputedStyle(e).display!=='none'&&e.getClientRects().length>0;
  const boxes=()=>{const o=[],moving=[];for(const e of ar.querySelectorAll('*')){if(e.closest('.die3sp,.vsx,svg,.die3'))continue;if(moving.some(m=>m.contains(e)))continue;if(!laid(e))continue;const r=tbBox(e);if(!r.width||!r.height)continue;if(e.getAnimations().length)moving.push(e);o.push([e,r])}return o};   // a card still flying in is judged by its landing box; its insides fly with it
  // out: anything of the fight above or below the table, or a monster card under the score line
  const out=()=>{const t=tb.getBoundingClientRect();const sl=ar.querySelector(':scope>.sline');const s=sl&&shown(sl)?sl.getBoundingClientRect():null;
    for(const [e,r] of boxes()){if(r.top<t.top-0.5||r.bottom>t.bottom+0.5||r.left<t.left-0.5||r.right>t.right+0.5)return true;const x=r;if(s&&e.matches('.row.mons .card')&&r.top<s.bottom+2){const x=e.getBoundingClientRect();if(x.right>s.left&&x.left<s.right)return true}}return false};
  const n=ar.querySelectorAll('.row.mons .mon').length;let cw=0;const c=ar.querySelector('.row.mons .card');if(c)cw=c.offsetWidth;
  const shrink=(min,steps)=>{for(let k=0;k<steps&&out()&&cw>min;k++){cw=Math.max(min,cw*.9);ar.style.setProperty('--cw',cw.toFixed(1)+'px')}};
  const compact=()=>{ar.style.removeProperty('--cw');ar.classList.remove('tight','tight2');ar.classList.add('cmp');ar.querySelectorAll('.cn').forEach(m=>m.style.removeProperty('font-size'))};
  if(n>=3||(c&&cw<56))compact();
  else{shrink(56,3);if(out()){ar.classList.add('tight');shrink(56,8)}if(out()){ar.classList.add('tight2');shrink(56,8)}if(out())compact()}
  // F16: the card size guesses room for a roll box and chips even when a tight step hid them: grow the cards into the free table height
  // (measured, a step at a time, back one step as soon as anything pokes out), then fit the names again at the bigger size (11 px floor)
  const gk=typeof G!=='undefined'&&G&&G.cb?G.turn+':'+G.cb.who+':'+G.cb.mons.length+':'+Math.round(tb.getBoundingClientRect().height):'';
  const grew=c&&!TB.noGrow&&TB.noGrowK!==gk&&!ar.classList.contains('cmp')&&!out();
  if(grew){let good=c.offsetWidth;for(let k=0;k<12;k++){const nx=Math.min(230,good*1.1);ar.style.setProperty('--cw',nx.toFixed(1)+'px');const w=c.offsetWidth;
      if(w<good+1||out()){ar.style.setProperty('--cw',good.toFixed(1)+'px');break}good=w}
    tbFitNames([...ar.querySelectorAll('.row.mons .card')]);if(out()){tbFitNames([...ar.querySelectorAll('.row.mons .card')])}}
  // a big pick in the dock leaves a sliver of table: keep the readout; the monster tiles go while the question is open (nothing can be dropped on them then)
  if(ar.classList.contains('cmp')&&out()&&!ar.querySelector('.fbtns')&&typeof G!=='undefined'&&G.q)ar.classList.add('cmp2');
  // last step, from measured sizes: scale the whole fight into the table box (it can only shrink, never poke out)
  if(out()){const t=tb.getBoundingClientRect(),a=ar.getBoundingClientRect();let T=1e9,B=-1e9,L=1e9,R=-1e9;
    for(const [e,r] of boxes()){T=Math.min(T,r.top);B=Math.max(B,r.bottom);L=Math.min(L,r.left);R=Math.max(R,r.right)}
    if(B>T){const k=Math.min(1,(t.height-4)/(B-T),(t.width-4)/Math.max(1,R-L));const dy=t.top+2+((t.height-4)-k*(B-T))/2-a.top-k*(T-a.top),dx=(t.left+t.right)/2-a.left-k*((L+R)/2-a.left);
      ar.classList.add('squash');ar.style.transformOrigin='0 0';ar.style.transform=`translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px) scale(${k.toFixed(4)})`}}
  // F16: a grown fight is checked again after it paints (next frame, and 300 ms on); if anything is out by then, fit again without growing,
  // and this fight stays ungrown for the rest of the turn (no grow/shrink flicker)
  if(grew){const verify=()=>{if(!ar.isConnected||TB.fitting||TB.noGrowK===gk)return;if(out()){TB.noGrowK=gk;try{tbFit()}catch(e){}}};requestAnimationFrame(verify);setTimeout(verify,300)}
  clearTimeout(TB.fitT);if(ar.querySelector('.row.mons .card')&&[...ar.querySelectorAll('*')].some(e=>e.getAnimations().length))TB.fitT=setTimeout(()=>{try{tbFit()}catch(e){}},700)}
(function(){
  const _snap=bfSnap;bfSnap=function(){const r=_snap();if(r){r.hc=G.pl.map(p=>p.hand.length);r.trn=G.tr.length;r.drn=G.door.length;r.lvlMe=r.me>=0&&G.pl[r.me]?G.pl[r.me].lvl:0}return r};
  const _diff=bfDiff;bfDiff=function(S,N){_diff(S,N);try{tbDiff(S,N)}catch(e){UI.lastErr='tb '+e}};
  const _r=render;render=function(){const x=_r.apply(this,arguments);try{tbFan();tbFit()}catch(e){UI.lastErr='tbfan '+e}return x}})();
function tbDiff(S,N){if(!S||!N||S.gid!==N.gid||!S.hc||!N.hc||!BF.motion())return;const me=viewSeat();
  const seat=s=>s===me?document.querySelector('.mine .hand .card:last-child')||document.querySelector('.mine .hand'):document.querySelector(`#app .opps [data-opp="${s}"]`);
  const deck=(S.trn>N.trn)?'.pile.pr .stack':(S.drn>N.drn)?'.pile.pl .stack':'';
  const dk=deck?document.querySelector(deck):null,dr0=dk?dk.getBoundingClientRect():null,dr=dr0&&dr0.width?dr0:null;   // a hidden deck (a 3-monster fight takes the table) flies nothing
  const back=deck&&deck.includes('pr')?'tr':'door';
  N.hc.forEach((h,i)=>{const d=h-S.hc[i];if(d<=0||!dr)return;const to=seat(i);if(!to)return;const r=to.getBoundingClientRect();
    for(let k=0;k<Math.min(d,4);k++)tbFly(`<div style="width:44px;height:62px;border-radius:5px;overflow:hidden;box-shadow:0 4px 10px rgba(0,0,0,.6)">${cardBack(back)}</div>`,dr,r,560,k*130)});
  // level-up: a gold medal flies from the fight to the hero
  if(me>=0&&N.me===S.me&&N.lvl[me]>S.lvl[me]){const from=document.querySelector('.arena .score.hero')||document.querySelector('.arena');const to=document.querySelector('.mine .bfhero')||document.querySelector('.mine .lv');
    if(from&&to){tbFly(`<div class="tbbadge">+${N.lvl[me]-S.lvl[me]}</div>`,from.getBoundingClientRect(),to.getBoundingClientRect(),700)}}}
let _tbR=0;addEventListener('resize',()=>{clearTimeout(_tbR);_tbR=setTimeout(()=>{try{tbFan();tbFit()}catch(e){}},120);setTimeout(()=>{try{tbFan();tbFit()}catch(e){}},460)});
try{if(window.visualViewport)visualViewport.addEventListener('resize',()=>{clearTimeout(_tbR);_tbR=setTimeout(()=>{try{tbFan()}catch(e){}},120)})}catch(e){}

// the option a Bad Stuff card pick would cost you least (the computer's own choice for you), or null
function tbWeakest(me){try{const q=G.q;if(!q||q.kind!=='pick'||!['lose','slug','taxpay'].includes(q.why))return null;const v=aiPick(P(me),q.why,q.opts,q.cont);return typeof v==='number'?v:null}catch(e){return null}}
// ---- short words on the phone: the toast, questions and the dock keep to a few words ----
const tbPh=()=>document.documentElement.classList.contains('ph');
(function(){
  const _t=toastHTML;toastHTML=function(){if(!tbPh())return _t();const t=UI.toast;if(!t||t.until<Date.now())return '';const fresh=UI.toastSeen!==t;UI.toastSeen=t;
    const first=String(t.t).replace(/\([^)]*\)/g,'').split(/(?<=[.!?:;])\s|:\s|\.\s/)[0].replace(/[.:;]+$/,'');
    return `<div class="toast${fresh?' fresh':''}" role="alert" title="${esc(t.t)}"><b>💥 Ouch!</b> ${esc(bfCap(first,6))}</div>`};
  const _p=promptHTML;promptHTML=function(me){let h=_p(me);if(!tbPh()||!G||!G.q||me<0||sideToAct()!==me||!P(me).human)return h;const q=G.q;let s='';
    if(q.kind==='help')s=`${P(q.from).nm.split(/[ ,]/)[0]} offers ${q.n} treasure${q.n===1?'':'s'}. Help?`;
    else if(q.kind==='rescue'){const vm=validMoves(me);s=vm.some(m=>m.act==='use')?'Caught! Tap a glowing card to escape.':vm.some(m=>m.act==='reroll')?'Caught! Discard a card to roll again?':'Caught! Take the Bad Stuff.'}
    else if(q.kind==='pick'&&['lose','slug','taxpay'].includes(q.why)){const w=tbWeakest(me);s=bfCap(`${q.why==='taxpay'?'Pay the tax.':'Lose a card.'}${w!=null?` Weakest: ${cname(w)}`:''}`,8)}
    else if(q.kind==='pick')s=q.why==='loot'&&G.loot?`Loot a card from ${P(G.loot.v).nm.split(/[ ,]/)[0]}:`:bfCap(String(q.text||'Choose one.').replace(/<[^>]+>/g,''),8);
    else if(q.kind==='ward')s='A curse is coming! Cancel it?';
    else if(q.kind==='glue')s='Make them roll again?';
    else if(q.kind==='lawyer')s='Swap 2 treasures for 2 new?';
    else if(q.kind==='fetch')s='Throw it to escape?';
    // Cleric Second Chance: the whole question, the treasure it brings back on show, and its answers in a 3-wide grid of 44 px buttons (4-wide past 9 answers)
    if(q.kind==='pick'&&q.why==='resTr'&&G.td.length){const top=G.td[G.td.length-1];const face=cardHTML(top,{size:'xs',attr:'tabindex="-1"',notitle:1}).replace('<button','<span').replace(' data-card=',' data-zcard=').replace(/<\/button>$/,'</span>');
      return h.replace(/<p class="say">.*?<\/p>/,`<div class="restq"><span class="restr" data-rescard="${top}">${face}</span><div class="resw"><div class="resnm">${esc(cname(top))}${cd(top).b?` +${cd(top).b}`:''}</div><p class="say">Resurrect it? Pay a card, or draw.</p></div></div>`).replace('<div class="acts main">',`<div class="acts main resg${q.opts.length>9?' resg4':''}">`)}
    return s?h.replace(/<p class="say">.*?<\/p>/,`<p class="say">${esc(s)}</p>`):h}})();

// a rival one fight from winning: one short banner; the best counter is a button in the dock
(function(){
  const _ww=winWarnHTML;winWarnHTML=function(me){if(!tbPh())return _ww(me);const cb=G.cb;const th=cb&&winThreat(cb);if(!th)return '';const f=P(th.who);const nm=esc(f.nm.split(/[ ,]/)[0]);
    return isMe(th.who)?`<div class="winwarn me" role="status"><b>🏆 Win this fight, win the game!</b></div>`:`<div class="winwarn" role="alert"><b>⚠ ${nm} wins the game with this fight!</b></div>`};
  const _p2=promptHTML;promptHTML=function(me){let h=_p2(me);if(!tbPh()||!G||!G.cb||me<0||!P(me).human)return h;const cb=G.cb;
    // short labels on the ability buttons (charm, shoo, bribe ...)
    h=h.replace(/(<button class="btn[^"]*" data-mv='[^']*'>)([^<]*)(<\/button>)/g,(m,a,x,z)=>a+bfCap(x.replace(/\s+/g,' ').trim(),6)+z);
    const th=winThreat(cb);if(th&&!isMe(th.who)&&sideToAct()===me&&cb.stage==='others'&&!G.q){const c=coach(me).counter;const m=c&&(c.one||(c.two&&c.two[0]));
      if(m&&m.card!=null)h=h.replace('<div class="acts main">',`<div class="acts main"><button class="btn primary rec" data-mv='${esc(JSON.stringify(m))}'>${esc(bfCap('Stop: '+moveLabel(m).replace(/<[^>]+>/g,''),6))}</button>`)}
    return h}})();

// ---- painted extras (media/*.webp, deployed beside the page): portraits, card backs, tables ----
(function(){
  if(typeof IS_JSDOM!=='undefined'&&IS_JSDOM)return;
  const R=document.documentElement;
  // seat and fight avatars: the hero's painted portrait (class art stays for unnamed heroes)
  const _av=bfAv;bfAv=function(p,cls){return dkPortrait(p.nm,cls)||dkPortrait([...DK_PORT][p.i%DK_PORT.size],cls)||_av(p,cls)};
  function unl(t){try{const u=GXC.unlocked().filter(x=>x.type===t);return u.length?u[u.length-1].id:null}catch(e){return null}}
  // card backs: painted door/treasure backs; a campaign card-back unlock replaces the door back
  const _cb=cardBack;
  cardBack=function(kind){const door=kind!=='tr';const id=door?(unl('cardback')||'door'):'treasure';
    return `<span class="pbk">${_cb(kind)}<i style="background-image:url(media/back-${id}.webp)"></i></span>`};
  // tables: painted tavern (or an unlocked vault) over the CSS wood; the wood stays while loading and on Low graphics
  const seen={};let cur='';
  function tableApply(){const id=unl('table')||'tavern';const ph=id==='tavern'&&matchMedia('(orientation:portrait)').matches;const f=id==='tavern'&&ph?'table-tavern-phone':'table-'+id;
    if(f===cur)return;
    const go=()=>{cur=f;R.style.setProperty('--tbl-img',`url(media/${f}.webp)`);R.dataset.timg='1'};
    if(seen[f])return go();const im=new Image();im.onload=()=>{seen[f]=1;go()};im.src='media/'+f+'.webp'}
  const _r=render;render=function(){const r=_r.apply(this,arguments);tableApply();return r};
  addEventListener('resize',tableApply);addEventListener('orientationchange',tableApply);
  ['door','treasure','cellar-oak','corridor-brass','crypt-bone'].forEach(n=>{new Image().src='media/back-'+n+'.webp'});
  window.handIc=()=>document.documentElement.classList.contains('dk-hand')?'<img class="pic" src="media/icon-hand.webp" alt="">':'✋';
  tableApply();
  // painted HUD pieces: each class goes on <html> once its file has loaded (the CSS fallback stays until then)
  [['dk-slot','ui-slot-head'],['dk-chip','ui-rival-chip'],['dk-gi','icon-gear'],['dk-clash','ui-clash-hero'],['dk-med','ui-medallion'],['dk-par','ui-parchment'],['dk-pile','pile-door'],['dk-curse','token-curse'],['dk-hand','icon-hand'],['dk-lv','icon-level'],['dk-bt','ui-bubble-tail']].forEach(([c,f])=>{const im=new Image();im.onload=()=>R.classList.add(c);im.src='media/'+f+'.webp'});
})();
// F16: a toast or a note ("Not worn: no free slot", "Ouch!") never sits on the fight's readout (the YOU vs MONSTERS pill, the score pills):
// while a fight shows, each one is moved off the readout: first onto the rivals' strip above the table, else just under the table
function tbToastPlace(){try{if(!tbPh())return;const ms=[...document.querySelectorAll('#prompt .toast,#prompt .winwarn,.bfbub.note')];if(!ms.length)return;
  const ar=document.querySelector('.arena'),tb=document.querySelector('.table');if(!ar||!tb||!ar.querySelector(':scope>.sline,:scope>.vs'))return;
  const rs=[...ar.querySelectorAll('.sline .sl1,.sline .sd,.vs .score')].map(e=>e.getBoundingClientRect()).filter(r=>r.width>2&&r.height>2);if(!rs.length)return;
  const hit=r=>rs.some(q=>Math.min(r.right,q.right)-Math.max(r.left,q.left)>1&&Math.min(r.bottom,q.bottom)-Math.max(r.top,q.top)>1);
  const bar=document.querySelector('.gx-bar'),b0=bar?bar.getBoundingClientRect().bottom:0,t=tb.getBoundingClientRect();let used=[];
  for(const m of ms){const r=m.getBoundingClientRect();if(!r.width)continue;if(!hit(r)&&!used.some(u=>Math.min(r.bottom,u.bottom)-Math.max(r.top,u.top)>1)){used.push(r);continue}
    const h=r.height,tryAt=[t.top-h-3,t.bottom+3,t.top-2*h-6];
    for(const y of tryAt){if(y<b0+1&&y<t.top)continue;const q={left:r.left,right:r.right,top:y,bottom:y+h};if(hit(q)||used.some(u=>Math.min(q.bottom,u.bottom)-Math.max(q.top,u.top)>1))continue;
      m.style.setProperty('position','fixed','important');m.style.setProperty('top',y.toFixed(0)+'px','important');m.style.setProperty('bottom','auto','important');m.style.setProperty('translate','none');m.style.setProperty('left',r.left.toFixed(0)+'px','important');m.style.setProperty('right','auto','important');m.style.setProperty('width',r.width.toFixed(0)+'px');m.style.setProperty('margin','0','important');used.push(q);break}}}catch(e){}}
(function(){const _r=render;render=function(){const x=_r.apply(this,arguments);tbToastPlace();return x}})();
setInterval(tbToastPlace,200);
(function(){const _n=bfNote;bfNote=function(){const x=_n.apply(this,arguments);tbToastPlace();return x}})();
// the ★ / suggested card is never left off-screen in a scrolling hand: when it changes, the hand scrolls it into view (once, so a manual swipe is never fought)
let dkStarLast=null;function dkStar(){try{const hd=document.querySelector('.mine .hand.scrolls');
  const e=hd&&hd.querySelector('.card.bf-best,.card.sug');const k=e?e.dataset.card:null;
  if(k!==dkStarLast){dkStarLast=k;if(e){const go=()=>{const a=e.getBoundingClientRect(),b=hd.getBoundingClientRect();if(a.right>b.right-4||a.left<b.left+4)dkReveal(e)};go();setTimeout(go,350)}}}catch(_){}}
(function(){const r0=render;render=function(){const x=r0.apply(this,arguments);dkStar();return x}})();
