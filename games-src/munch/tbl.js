// ---------- the dungeon table: fan the hand, hold a seat for rival details, cards fly from the decks and from the seats ----------
// Rules, engine and AI are untouched. Everything here is looks and touch; the moves still come from validMoves() through uiAct().
const TB={lp:null,lpAt:0,fan:0};
// the hand is a fan: overlap so every card shows a slice and nothing scrolls (scroll only when ~10+ cards would be too thin)
function tbFan(){const hd=document.querySelector('.mine .hand');if(!hd)return;const cs=[...hd.querySelectorAll(':scope>.card')];hd.style.removeProperty('--hw');if(!cs.length){hd.classList.remove('scrolls');return}
  const ph=document.documentElement.classList.contains('ph');if(!ph){hd.classList.remove('scrolls');hd.style.removeProperty('--ov');return}
  const w0=cs[0].offsetWidth||64,avail=hd.clientWidth-18,n=cs.length;if(!avail||!w0)return;
  // keep every card's visible slice >= 44 px (a finger): shrink the cards a little when the hand is big, scroll when it still does not fit
  let w=w0;if(n>1){const fit=avail-44*(n-1);w=Math.max(Math.min(w0,fit),Math.min(w0,56))}
  const need=n>1?(avail-w)/(n-1):w,sc=n>1&&need<44,step=sc?44:Math.min(w*.8,need);
  if(w!==w0){hd.style.setProperty('--hw',w.toFixed(1)+'px')}
  hd.style.setProperty('--ov',(step-w).toFixed(1)+'px');
  hd.classList.toggle('scrolls',sc)}
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
// the fight must fit inside the table: shrink the cards (never the buttons) until nothing pokes out of it
function tbFit(){const ar=document.querySelector('.arena'),tb=document.querySelector('.table');if(!ar||!tb||!document.documentElement.classList.contains('ph'))return;ar.style.removeProperty('--cw');
  if(!ar.querySelector(':scope>.vs'))return;const out=()=>{const t=tb.getBoundingClientRect();for(const e of ar.querySelectorAll('.fbtns,.score .num,.row.mons .card,.hsav,.rollbox,.row.small')){const r=e.getBoundingClientRect();if(r.width&&(r.top<t.top-0.5||r.bottom>t.bottom+0.5))return true}return false};
  let cw=0;const c=ar.querySelector('.row.mons .card');if(c)cw=c.getBoundingClientRect().width;
  ar.classList.remove('tight');for(let k=0;k<8&&out()&&cw>44;k++){cw*=.9;ar.style.setProperty('--cw',cw.toFixed(1)+'px');if(k===2&&out())ar.classList.add('tight')}
  if(out()){ar.classList.add('tight');for(let k=0;k<6&&out()&&cw>36;k++){cw*=.9;ar.style.setProperty('--cw',cw.toFixed(1)+'px')}}}
(function(){
  const _snap=bfSnap;bfSnap=function(){const r=_snap();if(r){r.hc=G.pl.map(p=>p.hand.length);r.trn=G.tr.length;r.drn=G.door.length;r.lvlMe=r.me>=0&&G.pl[r.me]?G.pl[r.me].lvl:0}return r};
  const _diff=bfDiff;bfDiff=function(S,N){_diff(S,N);try{tbDiff(S,N)}catch(e){UI.lastErr='tb '+e}};
  const _r=render;render=function(){const x=_r.apply(this,arguments);try{tbFan();tbFit()}catch(e){UI.lastErr='tbfan '+e}return x}})();
function tbDiff(S,N){if(!S||!N||S.gid!==N.gid||!S.hc||!N.hc||!BF.motion())return;const me=viewSeat();
  const seat=s=>s===me?document.querySelector('.mine .hand .card:last-child')||document.querySelector('.mine .hand'):document.querySelector(`#app .opps [data-opp="${s}"]`);
  const deck=(S.trn>N.trn)?'.pile.pr .stack':(S.drn>N.drn)?'.pile.pl .stack':'';
  const dk=deck?document.querySelector(deck):null,dr=dk?dk.getBoundingClientRect():null;
  const back=deck&&deck.includes('pr')?'tr':'door';
  N.hc.forEach((h,i)=>{const d=h-S.hc[i];if(d<=0||!dr)return;const to=seat(i);if(!to)return;const r=to.getBoundingClientRect();
    for(let k=0;k<Math.min(d,4);k++)tbFly(`<div style="width:44px;height:62px;border-radius:5px;overflow:hidden;box-shadow:0 4px 10px rgba(0,0,0,.6)">${cardBack(back)}</div>`,dr,r,560,k*130)});
  // level-up: a gold medal flies from the fight to the hero
  if(me>=0&&N.me===S.me&&N.lvl[me]>S.lvl[me]){const from=document.querySelector('.arena .score.hero')||document.querySelector('.arena');const to=document.querySelector('.mine .bfhero')||document.querySelector('.mine .lv');
    if(from&&to){tbFly(`<div class="tbbadge">+${N.lvl[me]-S.lvl[me]}</div>`,from.getBoundingClientRect(),to.getBoundingClientRect(),700)}}}
let _tbR=0;addEventListener('resize',()=>{clearTimeout(_tbR);_tbR=setTimeout(()=>{try{tbFan();tbFit()}catch(e){}},120);setTimeout(()=>{try{tbFan();tbFit()}catch(e){}},460)});
try{if(window.visualViewport)visualViewport.addEventListener('resize',()=>{clearTimeout(_tbR);_tbR=setTimeout(()=>{try{tbFan()}catch(e){}},120)})}catch(e){}

// ---- short words on the phone: the toast, questions and the dock keep to a few words ----
const tbPh=()=>document.documentElement.classList.contains('ph');
(function(){
  const _t=toastHTML;toastHTML=function(){if(!tbPh())return _t();const t=UI.toast;if(!t||t.until<Date.now())return '';const fresh=UI.toastSeen!==t;UI.toastSeen=t;
    const first=String(t.t).replace(/\([^)]*\)/g,'').split(/(?<=[.!?:;])\s|:\s|\.\s/)[0].replace(/[.:;]+$/,'');
    return `<div class="toast${fresh?' fresh':''}" role="alert" title="${esc(t.t)}"><b>💥 Ouch!</b> ${esc(bfCap(first,6))}</div>`};
  const _p=promptHTML;promptHTML=function(me){let h=_p(me);if(!tbPh()||!G||!G.q||me<0||sideToAct()!==me||!P(me).human)return h;const q=G.q;let s='';
    if(q.kind==='help')s=`${P(q.from).nm.split(/[ ,]/)[0]} offers ${q.n} treasure${q.n===1?'':'s'}. Help?`;
    else if(q.kind==='rescue')s='Caught! Escape, or take Bad Stuff?';
    else if(q.kind==='pick')s=bfCap(String(q.text||'Choose one.').replace(/<[^>]+>/g,''),8);
    else if(q.kind==='ward')s='A curse is coming! Cancel it?';
    else if(q.kind==='glue')s='Make them roll again?';
    else if(q.kind==='lawyer')s='Swap 2 treasures for 2 new?';
    else if(q.kind==='fetch')s='Throw it to escape?';
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
  const _av=bfAv;bfAv=function(p,cls){return dkPortrait(p.nm,cls)||_av(p,cls)};
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
  tableApply();
})();
