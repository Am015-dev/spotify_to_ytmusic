// ===== Play on the board (every screen) =====
// Loaded after board.js, before tutor.js. Rules, AI and the phone strip are untouched. This only MOVES the real controls
// out of the side panel onto the city, so every selector (#dice, #pacts, #pshop, #choice) and every handler keeps working:
//   - the dice, Roll, and End turn sit along the bottom of the board
//   - SMASH! (the real resolve button) hangs over Downtown: tap the city to use your dice
//   - the cards for sale are painted cards on the board: hold (400 ms, or hover) to read, tap to buy (touch: tap twice)
//   - your power cards sit in a row at the top of the board: hold or tap to read
//   - Stay / Yield and the other questions open in the middle of the board
// The panel keeps only the status, the result line and the advice. It stays one tap away (☰ Panel).
const OB={t:0,shown:'',suppress:0,toastT:0};
const $ob=id=>document.getElementById(id);
const obCoarse=()=>{try{return matchMedia('(pointer:coarse)').matches||!matchMedia('(hover:hover)').matches}catch(e){return true}};
const obTwo=()=>phOn()||obCoarse();   // touch: tap a card to pick it, tap again to buy. Mouse: one click.
function obBuild(){if($ob('ob'))return true;const bd=document.querySelector('.gx-board');if(!bd||!$ob('dicewrap')||!$ob('pacts'))return false;
  if(!$ob('pshop')){const e=document.createElement('div');e.id='pshop';document.body.appendChild(e)}
  const ob=document.createElement('div');ob.id='ob';
  ob.innerHTML='<div id="obown" aria-label="Your power cards"></div><div id="obmid"></div><div id="obtoast" aria-live="polite"></div><div id="obact"></div><div id="obmkt"></div><div id="obcard" aria-hidden="true"></div>';
  bd.appendChild(ob);
  $ob('obmid').appendChild($ob('choice'));$ob('obact').appendChild($ob('pacts'));$ob('obmkt').appendChild($ob('pshop'));
  ob.insertBefore($ob('dicewrap'),$ob('obmkt'));ob.appendChild($ob('obact'));
  document.documentElement.classList.add('ob');
  return true}
// ---- one line of feedback on the board (the phone has its own line; desktop uses this toast) ----
function obFlash(t,ms){if(phOn()&&typeof bfFlash==='function'){bfFlash(t,ms);return}const el=$ob('obtoast');if(!el)return;el.textContent=t;el.classList.add('on');clearTimeout(OB.toastT);OB.toastT=setTimeout(()=>el.classList.remove('on'),ms||1500)}
// ---- Downtown: where SMASH! hangs (a point above the monster in the city, in board pixels) ----
function obPlace(){const ob=$ob('ob');if(!ob||!G)return;const bd=ob.getBoundingClientRect();if(!bd.width)return;
  let x=bd.width/2,y=bd.height*.42;
  try{if(typeof V3!=='undefined'&&V3.on&&V3.cam){const st=$ob('stage');const r=st.getBoundingClientRect();const v=new THREE.Vector3(0,6.2,0).project(V3.cam);x=r.left-bd.left+(v.x+1)/2*r.width;y=r.top-bd.top+(1-v.y)/2*r.height}}catch(e){}
  ob.style.setProperty('--obw',Math.round(bd.width)+'px');const tip=$ob('btip');if(tip&&tip.parentNode!==ob)ob.insertBefore(tip,$ob('dicewrap'));
  const pad=64;x=Math.max(pad,Math.min(bd.width-pad,x));y=Math.max(pad+36,Math.min(bd.height-pad-120,y));
  // the button is position:fixed, so these are screen pixels
  ob.style.setProperty('--cx',Math.round(bd.left+x)+'px');ob.style.setProperty('--cy',Math.round(bd.top+y)+'px')}
// ---- the painted card on the board ----
function obCardHTML(id,k,o){const C=CARDS[base(id)],p=o.p,c=costOf(p,id);
  return `<button class="ptile bcard obc ${C.t} ${o.sg?'sugg':''} ${o.ok?'ok':'no'} ${o.arm?'sel':''}" data-shop="${k}" aria-label="${esc(C.n)}, costs ${c} energy${o.ok?'':', not affordable'}. ${esc(C.x)} ${o.ok?(obTwo()?(o.arm?'Tap to buy.':'Tap to pick it.'):'Click to buy.'):''}">
    <span class="cost">${c}</span>${o.sg?'<i class="star">★</i>':''}<span class="oart" aria-hidden="true">${cardIcon(id)}</span><b>${esc(C.n)}</b>${o.ok&&(!obTwo()||o.arm)?`<em class="go">BUY ${c}⚡</em>`:''}</button>`}
function obShop(){const el=$ob('pshop');if(!el||!G)return;
  if(!phShopOK()||!G.market.length){BF.sel=-1;if(el.innerHTML)el.innerHTML='';return}
  const p=cur(),sg=suggestCard(p);if(BF.sel>=G.market.length)BF.sel=-1;
  const arm=BF.sel>=0?BF.sel:sg;
  el.innerHTML=G.market.map((id,k)=>obCardHTML(id,k,{p,sg:k===sg,ok:canBuy(p,k),arm:k===arm})).join('')}
bfShop=obShop;
function obTapCard(k,el){const p=cur();if(!phShopOK())return;
  if(!canBuy(p,k)){BF.sel=k;obShop();const t=document.querySelector(`#pshop [data-shop="${k}"]`);if(t){t.classList.remove('shake');void t.offsetWidth;t.classList.add('shake')}if(typeof sfx==='function')sfx('click');obFlash(whyNot(p,G.market[k])||'You can’t buy this one',1600);return}
  if(obTwo()){const fk=BF.sel>=0?BF.sel:suggestCard(p);if(fk!==k){BF.sel=k;obShop();if(phOn())phRender();if(typeof sfx==='function')sfx('click');obFlash('Tap it again to buy',1400);return}}
  const nm=CARDS[base(G.market[k])].n;let from=null,to=null;try{if(phOn()){from=bfCenter(el);to=bfChipXY(meSeat()>=0?meSeat():G.active)}}catch(e){}
  BF.sel=-1;if(typeof bfTut==='function')bfTut('buy',1);
  if(from&&to&&typeof bfFly==='function')bfFly(`<div class="bcard-fly">${cardIcon(G.market[k])}</div>`,from,to,{dur:620,end:.4,spin:0,size:64,burst:'star',arc:-70});
  uiAct({card:String(k)});obFlash(`Bought ${nm}!`,1400)}
bfTapCard=obTapCard;
// ---- hold to read: the big card ----
function obShowCard(id,extra){const C=CARDS[base(id)];if(!C)return;const v=$ob('obcard');if(!v)return;const p=cur(),c=costOf(p,id);
  v.innerHTML=`<div class="obbig ${C.t}"><span class="cost">${c}</span><div class="bart">${cardIcon(id)}</div><h3>${esc(C.n)}</h3><p class="ty">${chipOf(C)}${C.kw?' · '+esc(C.kw.toUpperCase()):''}</p><p>${esc(C.x)}</p>${extra?`<p class="ex">${esc(extra)}</p>`:''}</div>`;
  v.classList.add('on');v.setAttribute('aria-hidden','false');OB.shown=String(id)}
function obHideCard(){const v=$ob('obcard');if(v){v.classList.remove('on');v.setAttribute('aria-hidden','true')}OB.shown=''}
function obCardOf(t){const s=t.closest&&t.closest('#ob [data-shop]');if(s&&G&&G.market[+s.dataset.shop]!==undefined){const id=G.market[+s.dataset.shop];const p=cur();return {id,extra:canBuy(p,+s.dataset.shop)?'':(whyNot(p,id)||'')}}
  const o=t.closest&&t.closest('#ob [data-own]');if(o)return {id:o.dataset.own,extra:''};return null}
document.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')return;const c=obCardOf(e.target);if(!c)return;OB.sx=e.clientX;OB.sy=e.clientY;clearTimeout(OB.t);OB.t=setTimeout(()=>{OB.suppress=1;obShowCard(c.id,c.extra)},400)},true);
document.addEventListener('pointermove',e=>{if(OB.t&&Math.hypot(e.clientX-OB.sx,e.clientY-OB.sy)>12){clearTimeout(OB.t);OB.t=0}},true);
const obUp=()=>{clearTimeout(OB.t);OB.t=0;if(OB.shown)obHideCard()};
document.addEventListener('pointerup',obUp,true);document.addEventListener('pointercancel',obUp,true);
document.addEventListener('contextmenu',e=>{if(e.target.closest&&e.target.closest('#ob [data-shop],#ob [data-own]'))e.preventDefault()},true);
// mouse: hover for a moment
document.addEventListener('pointerover',e=>{if(e.pointerType!=='mouse')return;const c=obCardOf(e.target);if(!c)return;clearTimeout(OB.ht);OB.ht=setTimeout(()=>obShowCard(c.id,c.extra),350)},true);
document.addEventListener('pointerout',e=>{if(e.pointerType!=='mouse')return;if(!obCardOf(e.target))return;clearTimeout(OB.ht);obHideCard()},true);
// the tap after a hold must not buy; a tap on a card of ours is handled here for every screen
window.addEventListener('click',e=>{if(!G)return;
  if(OB.suppress){OB.suppress=0;if(e.target.closest&&e.target.closest('#ob [data-shop],#ob [data-own]')){e.stopPropagation();e.preventDefault();return}}
  const t=e.target,sh=t.closest&&t.closest('#pshop [data-shop]');if(sh){e.stopPropagation();e.preventDefault();obHideCard();bfTapCard(+sh.dataset.shop,sh);return}
  const ow=t.closest&&t.closest('#ob [data-own]');if(ow){e.stopPropagation();e.preventDefault();OB.shown===ow.dataset.own?obHideCard():obShowCard(ow.dataset.own,'');clearTimeout(OB.ownT);OB.ownT=setTimeout(obHideCard,4000);return}
  if(OB.shown)obHideCard();
  if(BF.sel>=0&&!(t.closest&&t.closest('#pshop'))){BF.sel=-1;setTimeout(()=>{obShop();if(phOn())phRender()},0)}},true);
// ---- your power cards, along the top of the board ----
function obOwn(){const el=$ob('obown');if(!el)return;if(!G){el.innerHTML='';return}
  const me=G.mode==='solo'?G.pl.find(q=>q.human):null,w=me||cur();
  const cards=w.cards,key=w.i+':'+cards.join(',');if(el.dataset.k===key)return;el.dataset.k=key;
  el.innerHTML=cards.map(id=>{const C=CARDS[base(id)];return `<button class="obo ${C.t}" data-own="${esc(String(id))}" aria-label="${esc(C.n)}: ${esc(C.x)}">${cardIcon(id)}<i>${esc(C.n)}</i></button>`}).join('')}
// ---- labels: the words on the board say what the button does ----
function obSync(){const ob=$ob('ob'),dk=document.querySelector('.gx-dock');if(!ob)return;const v=dk&&dk.dataset.bf;if(v)ob.dataset.bf=v;else delete ob.dataset.bf}
function obLabels(){const pa=$ob('pacts');if(!pa||!G||!humanTurn())return;
  const d=pa.querySelector('[data-act="resolve"]');if(d){d.innerHTML='<span class="bl">💥 SMASH!</span>';d.setAttribute('aria-label','Smash: use these dice');d.classList.toggle('pulse',G.rolls<=0||!G.dice.some(x=>!x.k))}
  const e=pa.querySelector('[data-act="end"]');if(e&&G.phase==='buy'){const win=!G.bug&&cur().vp>=20;e.innerHTML=`<span class="bl">✔ ${G.bug?'Finish turn':'End turn'}</span><small>${win?'end your turn to win':'save your ⚡'}</small>`}
}
function obRender(){if(!obBuild())return;const ob=$ob('ob');
  ob.dataset.ph=G&&!G.winner?(humanTurn()?G.phase:'watch'):'';
  if(!phOn()){obShop();try{if(typeof bfRollWatch==='function'){bfRollWatch();bfDice()}}catch(e){}}
  obSync();obLabels();obOwn();obPlace()}
{const _rp=renderPanel;renderPanel=function(){_rp.apply(this,arguments);try{obRender()}catch(e){console.error(e)}}}
{const _pr=phRender;phRender=function(){_pr.apply(this,arguments);try{if(obBuild()){obSync();obLabels();obOwn();obPlace()}}catch(e){console.error(e)}}}
setInterval(()=>{try{if(G&&$ob('ob'))obPlace()}catch(e){}},500);
addEventListener('resize',()=>setTimeout(()=>{try{obPlace()}catch(e){}},200));
if(window.ResizeObserver){try{new ResizeObserver(()=>{try{obPlace()}catch(e){}}).observe(document.querySelector('.gx-board'))}catch(e){}}
// desktop: the 3D dice tray is replaced by the dice on the board (the real buttons), so the table stays clear for the monsters
{const _fc=fitCamera;fitCamera=function(asp){const r=_fc.apply(this,arguments);try{if(V3.tray)V3.tray.visible=false}catch(e){}return r}}
if(obBuild())obRender();
