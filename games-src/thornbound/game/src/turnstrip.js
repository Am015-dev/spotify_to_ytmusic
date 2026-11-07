// ===================== turnstrip.js: the turn strip (banner + ONE instruction line + story voice), rival step captions, tutorial story, result line =====================
(function(){
const ST=()=>window.TBSTORY||{};
const cast=id=>{const c=(window.CAMPAIGN&&window.CAMPAIGN.cast&&window.CAMPAIGN.cast[id])||{};return {name:(c.name||id||'').split(/[ ,]/).slice(0,2).join(' ').replace(/^Old /,'Old '),emoji:c.emoji||'',color:c.color||'#8e5bb5'}};
const css=document.createElement('style');css.textContent=`
#tbturn{grid-area:tb;display:flex;align-items:center;gap:10px;min-height:54px;padding:6px 12px;background:#1a1024;border-bottom:1px solid rgba(232,200,120,.35);z-index:3;cursor:default}
#tbturn .tbt-chip{flex:0 0 auto;font:700 14px/1.1 Cinzel,Georgia,serif;letter-spacing:.04em;text-transform:uppercase;padding:7px 10px;border-radius:8px;background:#f0c860;color:#2a1a05;border:2px solid #f0c860;max-width:132px;text-align:center}
#tbturn .tbt-chip.rv{background:#1a1024;color:#fff;border-color:var(--c,#c0392b)}
#tbturn .tbt-chip.wt{background:#2a2036;color:#f6ecd2;border-color:#8a7aa0}
#tbturn .tbt-line{flex:1 1 auto;min-width:0;color:#f8efd6;font:600 15px/1.25 'EB Garamond',Georgia,serif;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
#tbturn .tbt-face{flex:0 0 auto;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;font-size:22px;background:var(--c,#8e5bb5);border:2px solid #f0c860}
#tbturn .tbt-skip{flex:0 0 auto;min-height:44px;padding:0 10px;border-radius:8px;border:1px solid #8a7aa0;background:transparent;color:#f6ecd2;font:700 14px 'EB Garamond',Georgia,serif}
#tbturn.voice{background:#2a1838}
#tbturn.pulse .tbt-chip{animation:tbtp .45s ease-out}
@keyframes tbtp{0%{transform:scale(.8);opacity:.3}100%{transform:scale(1);opacity:1}}
html:not(.bf-w) .gx-main{grid-template-rows:auto auto minmax(0,1fr) auto!important;grid-template-areas:"rv" "tb" "bd" "dk"!important}
html.bf-w .gx-main{grid-template-rows:auto auto minmax(0,1fr)!important;grid-template-areas:"bd rv" "bd tb" "bd dk"!important}
html:not(.bf-w) #board{margin-bottom:40px!important}
body:has(.gxh-bub.on) #tbturn:not(.voice) .tbt-line{display:none}
html.tb-dim .tb-loc:not(.glow){opacity:.45;transition:opacity .25s}
@media (prefers-reduced-motion:reduce){#tbturn.pulse .tbt-chip{animation:none}}
`;document.head.appendChild(css);
let el=null;const strip=()=>{if(el&&el.isConnected)return el;const rv=document.getElementById('rivals');if(!rv)return null;el=document.createElement('div');el.id='tbturn';el.setAttribute('role','status');el.setAttribute('aria-live','polite');rv.parentNode.insertBefore(el,rv.nextSibling);
  el.addEventListener('click',ev=>{if(ev.target.closest&&ev.target.closest('.tbt-skip')){skipTut();return}if(vNow){nextVoice();return}if(UI._tbHold){UI._tbHold=0;paint();return}speedUp()});return el};
function skipTut(){try{GXT.markDone('thornbound')}catch(e){}const pro=UI.coachPro;UI.coachOn=0;clearVoice();tutLeave();if(pro&&typeof GXC!=='undefined'){showStart();GXC.open()}else{UI.sv='setup';UI.cfgOpen=false;showStart();renderStart()}}
function speedUp(){if(!G||UI.card||G.over)return;const w=whoActs();if(w.ai.length&&viewSeatForQ()==null){clearTimeout(_pumpT);aiStep(w);pump()}}
const poss=n=>String(n)+(/s$/i.test(n)?'\u2019':'\u2019s');
const esc2=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// ---- voice beats (a character speaks for ~2.4 s; never blocks a tap)
let vq=[],vNow=null,vT=0;
function voice(who,text,ms,tag){if(!text)return;vq.push({who,text:typeof text==='function'?text():text,ms:ms||2600,tag:tag||''});if(!vNow)nextVoice()}
function nextVoice(){clearTimeout(vT);vNow=vq.shift()||null;paint();if(vNow)vT=setTimeout(nextVoice,(window.ANIM?vNow.ms:0)/Math.max(1,Math.min(UI.speed||1,4)))}
function clearVoice(){vq=[];vNow=null;clearTimeout(vT)}
// ---- what the strip says right now
function paint(){const e=strip();if(!e)return;if(!G||!UI.started||UI.card&&UI.card.kind==='over'){e.hidden=true;return}e.hidden=false;
  let html='',cls='',key='';
  if(vNow){const c=cast(vNow.who);key='v'+vNow.text;cls='voice';e.style.setProperty('--c',c.color);html='<span class="tbt-face" aria-hidden="true">'+esc2(c.emoji)+'</span><span class="tbt-line"><b>'+esc2(c.name)+':</b> '+esc2(vNow.text)+'</span>'}
  else if(UI._tbHold&&UI._tbHold>Date.now()&&UI._tbCap){const s=UI._tbCap.s;key='c'+UI._tbCap.t;e.style.setProperty('--c',fcol(s));html='<span class="tbt-chip rv">'+esc2(poss(shortName(s)))+' turn</span><span class="tbt-line">'+esc2(UI._tbCap.t)+'</span>'}
  else if(UI.card&&UI.card.kind!=='pass'){key='card';html='<span class="tbt-chip wt">Watch</span><span class="tbt-line">Watch what happens, then tap Continue.</span>'}
  else if(G.over){key='over';html='<span class="tbt-chip">Game over</span><span class="tbt-line">The last round is done.</span>'}
  else if(G.q){const s=viewSeatForQ();
    if(s!=null){const k=G.q.kind;const ask=(ST().ask||{});key='me'+k+(G.q.t||'');const line=(k==='menu'||G.q.t==='menu')?(ask.menu):ask[k];
      const t=line||(typeof promptText==='function'?promptText(G.q,s)+'.':'Your move.');html='<span class="tbt-chip">Your turn</span><span class="tbt-line">'+esc2(t)+'</span>'}
    else{const w=whoActs();const a=w.ai[0];if(a!=null){key='ai'+a;e.style.setProperty('--c',fcol(a));html='<span class="tbt-chip rv">'+esc2(poss(shortName(a)))+' turn</span><span class="tbt-line">'+esc2(ST().wait?ST().wait.replace('{n}',shortName(a)):'Waiting for '+shortName(a)+'...')+'</span>'}
      else{key='w';html='<span class="tbt-chip wt">Wait</span><span class="tbt-line">Waiting for the other players.</span>'}}}
  if(coachOn()&&!G.over)html+='<button class="tbt-skip" data-gxt-skip type="button" aria-label="Skip tutorial">Skip tutorial</button>';
  if(e.dataset.key!==key){e.dataset.key=key;e.className=cls+' pulse';e.innerHTML=html;try{document.documentElement.classList.toggle('tb-dim',!!(UI.bf&&(UI.bf.kind==='herald'||UI.bf.kind==='location')&&!UI.card))}catch(x){}}
  else{try{document.documentElement.classList.toggle('tb-dim',!!(UI.bf&&(UI.bf.kind==='herald'||UI.bf.kind==='location')&&!UI.card))}catch(x){}}}
window.tbPaint=paint;window.tbVoice=voice;
(function(){const o=renderAll;renderAll=function(){const r=o.apply(this,arguments);try{paint()}catch(e){console.error('tbturn '+e.message)}try{if(window.tbCoachCheck)window.tbCoachCheck()}catch(e){}return r}})();
// ---- the rival's step is announced in one plain caption, then held ~1.3 s so it can be read (tap the strip to skip)
(function(){const o=aiStep;aiStep=function(w){const s=w.ai[0],l0=G.logN;const r=o.apply(this,arguments);
  try{let t=null;for(let i=G.log.length-1;i>=0&&G.log[i].i>l0;i--){if(G.log[i].s===s||G.log[i].s==null||G.log[i].s===undefined){t=G.log[i].t;break}}
    if(!t&&UI.nowT&&UI.nowT.at===G.logN)t=UI.nowT.t;if(!t&&G.log.length&&G.logN>l0)t=G.log[G.log.length-1].t;
    if(t){t=plain(t);const w2=t.split(/\s+/);if(w2.length>16)t=w2.slice(0,15).join(' ')+'...';UI._tbCap={s,t};UI._tbHold=Date.now()+(window.ANIM?1300/Math.max(1,Math.min(UI.speed||1,4)):0);
      if(window.ANIM)setTimeout(()=>{if(UI._tbHold&&UI._tbHold<=Date.now()){UI._tbHold=0;paint()}},1350/Math.max(1,Math.min(UI.speed||1,4)))}}catch(e){}
  return r}})();
// ---- tutorial: story text replaces the plain lines; a chapter beat opens each chapter; the guide reacts after each action
(function(){const o=tutSteps;tutSteps=function(){const L=o.apply(this,arguments);const T=(ST().tut)||{};
  for(const s of L){const t=T[s.id];if(t&&t.say)s.say=t.say}return L}})();
let lastId=null;
setInterval(()=>{try{if(typeof GXT==='undefined')return;const st=GXT.active()?GXT.state():null;
  if(!st||!st.active){if(lastId!==null){lastId=null;clearVoice();paint()}return}
  const id=st.id;if(id===lastId)return;const prev=lastId;lastId=id;
  const S=ST(),g=S.guide||'ysolde',T=(S.tut||{}),chs=S.chapters||[];
  if(prev&&T[prev]&&T[prev].react)voice(g,T[prev].react,2200,'react');
  const ci=chs.findIndex(c=>c.at===id);
  if(ci>0&&chs[ci-1].pay)voice(g,chs[ci-1].pay,2200,'pay');
  if(ci>=0)voice(g,'Chapter '+(ci+1)+', '+chs[ci].title+'. '+chs[ci].open,3200,'open');
  if(id==='end'&&T.end&&T.end.react)voice(g,typeof T.end.react==='function'?T.end.react():T.end.react,4200,'end');
}catch(e){}},120);
// ---- quick game: a one-line flavour intro; the result line in the game's voice on the result card
(function(){const o=newGame;newGame=function(mode,opt){const r=o.apply(this,arguments);
  try{clearVoice();if(mode!=='tutorial'&&!(UI.camp)&&!(UI.cfg&&UI.cfg.tutorial)&&ST().quick&&ST().quick.intro)voice(ST().guide||'ysolde',ST().quick.intro,2600,'intro')}catch(e){}return r}})();
(function(){const o=renderCard;renderCard=function(){const r=o.apply(this,arguments);
  try{const c=UI.card,pc=document.getElementById('pc');if(c&&c.kind==='over'&&pc&&!pc.querySelector('.tbq')&&!(UI.camp)){const inf=G.pl.map(p=>p.inf),me=inf[0],ot=Math.max.apply(null,inf.slice(1));const Q=ST().quick||{};
    const t=me>ot?Q.win:me<ot?Q.lose:Q.tie;const sc=pc.querySelector('.cd-sc');if(t&&sc){const p=document.createElement('p');p.className='tbq';p.style.cssText='font:700 16px/1.3 "EB Garamond",Georgia,serif;margin:6px 0 10px;color:inherit';p.textContent=t;sc.insertBefore(p,sc.firstChild)}}}catch(e){}
  return r}})();

// ---- coached first game (replaces the forced tap steps): real game, free moves, the guide speaks when a rule first matters
window.TBCOACH={seen:[]};
const coachOn=()=>!!(UI.cfg&&UI.cfg.tutorial&&UI.coachOn&&G&&UI.started);
function say(id,force){const C=(ST().coach)||{};let t=C[id];if(typeof t==='function')t=t();if(!t)return;if(!force&&TBCOACH.seen.indexOf(id)>=0)return;if(TBCOACH.seen.indexOf(id)<0)TBCOACH.seen.push(id);
  vq.length=0;voice(ST().guide||'ysolde',t,5200,'coach')}
window.tbCoachSay=say;
let lastSig='';
function coachCheck(){try{if(!coachOn())return;if(G.over){if(!UI._tbEnd)tbEnd();return}
  const c=UI.card;let sig='';
  if(c&&c.kind==='event'){sig='ev'+c.ev.t+(c.ev.r!=null?c.ev.r:'');if(c.ev.t==='bids'&&!(c.rank&&c.revN>=c.rank.length))return}
  else if(c&&c.kind==='news'&&c.big&&c.items&&c.items.some(infK))sig='news'
  else if(!c&&G.q&&viewSeatForQ()!=null){const k=G.q.kind;sig='q'+k+(G.q.t==='menu'?menuPhase(G.q):'')}
  if(!sig||sig===lastSig)return;lastSig=sig;
  if(sig==='qbid'){say('welcome');say('goal');say('bid')}
  else if(sig==='evbids')say('bids',true);
  else if(sig==='qbidRes')say('kc');
  else if(sig==='qherald')say('herald');
  else if(sig==='qplace')say('place');
  else if(/^qmenu/.test(sig)&&/Spring/.test(sig))say('supp');
  else if(sig==='qclashOrder')say('order');
  else if(/^evclash/.test(sig))say('clash',true);
  else if(sig==='qlocation')say('claim');
  else if(sig==='news')say('score',true);
  else if(sig==='evsummary')say('round');
}catch(e){}}
setInterval(coachCheck,220);window.tbCoachCheck=coachCheck;
function tbEnd(){UI._tbEnd=1;if(TBCOACH.seen.indexOf('round')<0)TBCOACH.seen.push('round');try{GXT.markDone('thornbound')}catch(e){}
  const C=(ST().coach)||{};let over='';try{over=overHTML()}catch(e){}
  const box=document.createElement('div');box.id='tbcend';box.style.cssText='position:fixed;inset:0;z-index:9999;background:#140c1a;color:#f6ecd2;overflow:auto;padding:16px;font:600 16px/1.35 "EB Garamond",Georgia,serif';
  const first=window.CAMPAIGN&&window.CAMPAIGN.chapters&&window.CAMPAIGN.chapters[0];
  box.innerHTML='<div style="max-width:560px;margin:0 auto"><h2 style="font:700 22px Cinzel,Georgia,serif;color:#f0c860;margin:0 0 8px">'+esc2(cast(ST().guide).name)+': you know the road</h2><p>'+esc2((ST().quick||{})[G.pl[0].inf>G.pl[1].inf?'win':G.pl[0].inf<G.pl[1].inf?'lose':'tie'])+'</p>'+'<p>'+esc2(C.round||'')+'</p>'+over+
   '<h3 style="color:#f0c860">Things you will meet later</h3><ul>'+(C.later||[]).map(x=>'<li>'+esc2(x)+'</li>').join('')+'</ul><p style="display:flex;gap:10px;flex-wrap:wrap">'+(first?'<button class="btn pri" data-e="chapter" style="min-height:48px;padding:0 18px;font:700 16px inherit">Start chapter 1</button>':'')+'<button class="btn" data-e="menu" style="min-height:48px;padding:0 18px;font:700 16px inherit">Back to the menu</button></p></div>';
  document.body.appendChild(box);
  box.addEventListener('click',e=>{const b=e.target.closest('[data-e]');if(!b)return;box.remove();tutLeave();UI.coachOn=0;if(b.dataset.e==='chapter'&&first&&typeof GXC!=='undefined'){showStart();GXC.play(first.id)}else{UI.sv='setup';UI.cfgOpen=false;showStart();renderStart()}})}
// start of the coached game (called by tutStart in ui12.js)
window.tbCoachStart=function(o){const pro=!!(o&&o.prologue);TBCOACH.seen=[];lastSig='';UI._tbEnd=0;const old=document.getElementById('tbcend');if(old)old.remove();
  try{GX.close()}catch(e){}hideStart();hideGloss();closePop(true);newGame('tutorial');UI.coachOn=1;UI.coachPro=pro;clearVoice();renderAll()};
// for qa-bot: the coached game's state
window.GXCOACH={get running(){try{return coachOn()&&!G.over&&!UI._tbEnd}catch(e){return false}},get explained(){return TBCOACH.seen.slice()},get done(){try{return !!UI._tbEnd||GXT.isDone('thornbound')}catch(e){return false}}};
})();
