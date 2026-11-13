// ===================== turnstrip.js: the turn strip (banner + ONE instruction line + story voice), rival step captions, tutorial story, result line =====================
(function(){
const ST=()=>window.TBSTORY||{};
const cast=id=>{const c=(window.CAMPAIGN&&window.CAMPAIGN.cast&&window.CAMPAIGN.cast[id])||{};return {name:(c.name||id||'').split(/[ ,]/).slice(0,2).join(' ').replace(/^Old /,'Old '),emoji:c.emoji||'',color:c.color||'#8e5bb5'}};
const css=document.createElement('style');css.textContent=`
#tbturn{grid-area:tb;display:flex;align-items:center;gap:10px;height:72px;box-sizing:border-box;overflow:hidden;padding:6px 12px;background:#1a1024;border-bottom:1px solid rgba(232,200,120,.35);z-index:3;cursor:default}
#tbturn[hidden]{display:none!important}
body.in-start #pc,body.in-start #ppop,body.in-start #tbturn{visibility:hidden!important}
#tbturn .tbt-chip{flex:0 0 auto;font:700 14px/1.1 Cinzel,Georgia,serif;letter-spacing:.04em;text-transform:uppercase;padding:7px 10px;border-radius:8px;background:#f0c860;color:#2a1a05;border:2px solid #f0c860;max-width:132px;text-align:center}
#tbturn .tbt-chip.rv{background:#1a1024;color:#fff;border-color:var(--c,#c0392b)}
#tbturn .tbt-chip.wt{background:#2a2036;color:#f6ecd2;border-color:#8a7aa0}
#tbturn .tbt-line{flex:1 1 auto;min-width:0;max-height:60px;overflow:hidden;color:#f8efd6;font:600 16px/1.25 'EB Garamond',Georgia,serif}
#tbturn .tbt-line.sm{font-size:14px;line-height:1.2}
html.bf-w #tbturn{height:auto;min-height:72px}
@media (max-height:620px){html:not(.bf-w) #tbturn{height:54px;padding:4px 10px}#tbturn .tbt-line{max-height:42px;font-size:15px;line-height:1.2}#tbturn .tbt-line.sm{font-size:14px;line-height:1.2}#tbturn .tbt-chip{padding:5px 8px}}
#tbturn .tbt-term{display:inline-block;box-sizing:border-box;min-height:0;min-width:44px;padding:12px 7px;margin:-12px -7px;text-align:center;vertical-align:baseline;line-height:inherit;border:0;background:none;color:inherit;font:inherit;text-decoration:underline dotted #f0c860 2px;text-underline-offset:3px;cursor:help}
#tbturn .tbt-term:focus-visible{outline:2px solid #fff;outline-offset:2px;border-radius:3px}
#tbturn .tbt-info{flex:0 0 auto;width:44px;height:44px;border-radius:50%;border:2px solid #f0c860;background:transparent;color:#f0c860;font:700 italic 18px Georgia,serif}
#tbturn .tbt-goal{flex:0 0 auto;min-height:44px;min-width:56px;padding:0 10px;border-radius:8px;border:2px solid #f0c860;background:transparent;color:#f0c860;font:700 14px Cinzel,Georgia,serif}
#tbgoal{position:fixed;inset:0;z-index:9998;display:grid;place-items:center;background:rgba(10,6,14,.82);padding:16px}
#tbgoal .gc{max-width:420px;width:100%;background:#24152f;border:2px solid #f0c860;border-radius:14px;padding:22px 20px 18px;color:#f8efd6;font:500 17px/1.4 'EB Garamond',Georgia,serif;box-shadow:0 12px 40px rgba(0,0,0,.6)}
#tbgoal .win{margin:0 0 16px;font:700 24px/1.25 'EB Garamond',Georgia,serif;color:#fff;text-wrap:balance}
#tbgoal ul{margin:0 0 18px;padding:0;list-style:none}#tbgoal li{position:relative;padding:0 0 10px 32px}
#tbgoal li b{position:absolute;left:6px;top:8px;width:10px;height:10px;background:#f0c860;transform:rotate(45deg)}
#tbgoal button{width:100%;min-height:52px;border-radius:10px;border:0;background:#f0c860;color:#2a1a05;font:700 18px Cinzel,Georgia,serif;cursor:pointer}
#tbgoal button:focus-visible,#tbturn button:focus-visible{outline:3px solid #fff;outline-offset:2px}
@media (prefers-reduced-motion:no-preference){#tbgoal .gc{animation:tbgin .3s ease-out}@keyframes tbgin{from{transform:translateY(12px);opacity:0}to{transform:none;opacity:1}}}
#tbturn .tbt-face{flex:0 0 auto;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;font-size:22px;background:var(--c,#8e5bb5);border:2px solid #f0c860}
#tbturn .tbt-skip{flex:0 0 auto;min-height:44px;padding:0 10px;border-radius:8px;border:1px solid #8a7aa0;background:transparent;color:#f6ecd2;font:700 14px 'EB Garamond',Georgia,serif}
#tbturn.voice{background:#2a1838}
#tbturn.pulse .tbt-chip{animation:tbtp .45s ease-out}
@keyframes tbtp{0%{transform:scale(.8);opacity:.3}100%{transform:scale(1);opacity:1}}
html:not(.bf-w) .gx-main{grid-template-rows:auto auto minmax(0,1fr) auto!important;grid-template-areas:"rv" "tb" "bd" "dk"!important}
html.bf-w .gx-main{grid-template-rows:auto auto minmax(0,1fr)!important;grid-template-areas:"bd rv" "bd tb" "bd dk"!important}
html:not(.bf-w) #board{margin-bottom:0!important}
body:has(.gxh-bub.on) #tbturn:not(.voice) .tbt-line{display:none}
html.tb-dim .tb-loc:not(.glow){opacity:.45;transition:opacity .25s}
@media (prefers-reduced-motion:reduce){#tbturn.pulse .tbt-chip{animation:none}}
`;document.head.appendChild(css);
let el=null;const strip=()=>{if(el&&el.isConnected)return el;const rv=document.getElementById('rivals');if(!rv)return null;el=document.createElement('div');el.id='tbturn';el.setAttribute('role','status');el.setAttribute('aria-live','polite');rv.parentNode.insertBefore(el,rv.nextSibling);
  el.addEventListener('click',ev=>{const jt=ev.target.closest&&ev.target.closest('.tbt-term');if(jt){showTerm(jt.dataset.tbterm);return}const ib=ev.target.closest&&ev.target.closest('.tbt-info');if(ib){const id=+ib.dataset.tbinfo;UI.hand=null;openPop('card',{id,read:1});return}if(ev.target.closest&&ev.target.closest('.tbt-goal')){showGoal(false,true);return}if(ev.target.closest&&ev.target.closest('.tbt-skip')){skipTut();return}if(vNow){nextVoice();return}if(UI._tbHold){UI._tbHold=0;paint();try{pump()}catch(x){}return}if(UI.card&&UI.card.kind!=='pass'&&!(typeof tutHold==='function'&&tutHold(UI.card))){if(bfSkip())return}speedUp()});return el};
function skipTut(){try{GXT.markDone('thornbound')}catch(e){}const pro=UI.coachPro;UI.coachOn=0;clearVoice();tutLeave();if(pro&&typeof GXC!=='undefined'){showStart();GXC.open()}else{UI.sv='setup';UI.cfgOpen=false;showStart();renderStart()}}
function speedUp(){if(!G||G.over)return;if(window.tbTapAhead)window.tbTapAhead()}
// read time (owner rule, 8 Nov 2026): a message stays at least 4 s plus 1 s per 10 words; a tap skips. Speed > 1 (player's choice) shortens it.
const readMs=t=>{const w=String(t||'').trim().split(/\s+/).filter(Boolean).length;return Math.min(3000,1200+220*w)/Math.max(1,Math.min(UI.speed||1,4))/(UI.cfg&&UI.cfg.tutorial?3:1)};window.tbReadMs=readMs;
const poss=n=>String(n)+(/s$/i.test(n)?'\u2019':'\u2019s');
const esc2=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// ---- voice beats (a character speaks for ~2.4 s; never blocks a tap)
let vq=[],vNow=null,vT=0;
function voice(who,text,ms,tag){if(!text)return;const tx=typeof text==='function'?text():text;vq.push({who,text:tx,ms:Math.max(ms||0,readMs(tx)),tag:tag||''});if(!vNow)nextVoice()}
function nextVoice(){clearTimeout(vT);vNow=vq.shift()||null;paint();if(vNow)vT=setTimeout(nextVoice,window.ANIM?vNow.ms:0)}
function clearVoice(){vq=[];vNow=null;clearTimeout(vT)}
// ---- what the strip says right now
const covered=()=>{try{const st=document.getElementById('start');return !!(st&&!st.hidden)||!!document.querySelector('.gxc-map-on:not([hidden]),.gxc-scene-on:not([hidden]),#tbcend')}catch(x){return false}};
function paint(){const e=strip();if(!e)return;if(!G||!UI.started||UI.card&&UI.card.kind==='over'||covered()){e.hidden=true;return}e.hidden=false;
  let html='',cls='',key='';
  if(vNow){const c=cast(vNow.who);key='v'+vNow.text;cls='voice';e.style.setProperty('--c',c.color);html='<span class="tbt-face" aria-hidden="true">'+esc2(c.emoji)+'</span><span class="tbt-line"><span class="sr">'+esc2(c.name)+': </span>'+esc2(vNow.text)+'</span>'}
  else if(false){const s=UI._tbCap.s;key='c'+UI._tbCap.t;e.style.setProperty('--c',fcol(s));html='<span class="tbt-chip rv">'+esc2(poss(shortName(s)))+' turn</span><span class="tbt-line">'+esc2(UI._tbCap.t)+'</span>'}
  else if(UI.card&&UI.card.kind!=='pass'){const cm=cardMsg(UI.card);key='card'+cm.t;html='<span class="tbt-chip wt">'+(typeof tutHold==='function'&&tutHold(UI.card)?'Look':'Tap: next')+'</span><span class="tbt-line">'+esc2(shortT(cm.t))+'</span>'}
  else if(G.over){key='over';html='<span class="tbt-chip">Game over</span><span class="tbt-line">The last round is done.</span>'}
  else if(G.q){const s=viewSeatForQ();
    if(s!=null){const k=G.q.kind;const ask=(ST().ask||{});const mph=(k==='menu'||G.q.t==='menu')?menuPhase(G.q):'';key='me'+k+(G.q.t||'')+mph+(UI.autCard!=null?'c':'');const line=mph?(UI.autCard!=null&&ask.menuAutumnCard?ask.menuAutumnCard:(ask['menu'+mph]||ask.menu)):ask[k];
      const t=line||(typeof promptText==='function'?promptText(G.q,s)+'.':'Your move.');html='<span class="tbt-chip">Your turn</span><span class="tbt-line">'+jargon(esc2(t))+'</span>';
      if(UI.hand!=null&&typeof cardLine==='function'){try{const ci=cinfo(UI.hand);key+='h'+UI.hand;html='<span class="tbt-chip">'+esc2(ci.strength)+'</span><span class="tbt-line"><b>'+esc2(ci.name)+'</b>: '+esc2(cardLine(UI.hand))+' Tap again or tap a spot.</span><button class="tbt-info" data-tbinfo="'+UI.hand+'" type="button" aria-label="Full text of '+esc2(ci.name)+'">i</button>'}catch(x){}}}
    else{const w=whoActs();const a=w.ai[0];if(a!=null){key='ai'+a;e.style.setProperty('--c',fcol(a));const cp=UI._tbCap&&UI._tbCapT&&Date.now()-UI._tbCapT<5000?UI._tbCap:null;const cs=cp?cp.s:a;key='ai'+a+(cp?cp.t:'');e.style.setProperty('--c',fcol(cs));html='<span class="tbt-chip rv">'+esc2(poss(shortName(cs)))+' turn</span><span class="tbt-line">'+(cp?esc2(shortT(cp.t)):'Thinking\u2026 tap to hurry them.')+'</span>'}
      else{key='w';html='<span class="tbt-chip wt">Wait</span><span class="tbt-line">Waiting for the other players.</span>'}}}
  if(!G.over&&!coachOn()&&UI.hand==null)html+='<button class="tbt-goal" data-tbgoal type="button" aria-label="Show the goal">Goal</button>';
  if(coachOn()&&!G.over)html+='<button class="tbt-skip" data-gxt-skip type="button" aria-label="Skip tutorial">Skip tutorial</button>';
  if(e.dataset.key!==key&&/^me/.test(key)&&UI.pop&&UI._popRival){try{closePop(true)}catch(x){}}   // an info card opened during the rival's turn must not cover your own move
  if(cls==='voice')e.removeAttribute('data-fa-skip');else e.setAttribute('data-fa-skip','');
  if(e.dataset.key!==key)UI._jgKey=key;
  if(e.dataset.key!==key){e.dataset.key=key;e.className=cls+(cls==='voice'?' pulse':'');e.innerHTML=html;try{const ln=e.querySelector('.tbt-line');if(ln&&ln.scrollHeight>ln.clientHeight+1)ln.classList.add('sm')}catch(x){}try{document.documentElement.classList.toggle('tb-dim',!!(UI.bf&&(UI.bf.kind==='herald'||UI.bf.kind==='location')&&!UI.card))}catch(x){}}
  else{try{document.documentElement.classList.toggle('tb-dim',!!(UI.bf&&(UI.bf.kind==='herald'||UI.bf.kind==='location')&&!UI.card))}catch(x){}}}
// the full text of the message on screen (news, clash, bids, round end): shown whole in the strip, timed by its length
function cardMsg(c){try{if(c.kind==='news'&&c.items&&c.items.length){if(c.big&&c.items.every(infK))return {t:newsHead(c.items[0],c.items)+'.',s:null};const s0=c.items[0].s;const it=c.items.filter((x,i)=>i===0||x.s!==s0).slice(0,3).map(x=>plain(x.text)).join(' ');return {t:it,s:c.items[0].s}}
  if(c.kind==='event'){const e=c.ev;if(e.t==='bids')return {t:'Bids flip. The highest bid picks first.',s:null};if(e.t==='clash')return {t:UI._clashLine||('The Clash in '+REG[e.r]),s:null};if(e.t==='summary')return {t:e.last?'The last round is over.':'Round '+e.round+' is over.',s:null}}}catch(x){}
  return {t:'Tap anywhere to go on.',s:null}}
// one line per game word, shown when the word is tapped (the first time it appears in a game)
const JARGON={clash:['Clash','The fight in one region. Highest total Strength wins.'],herald:['Herald','Your envoy. Win its region to score its location, plus 1.'],
  govern:['Govern','An Autumn action: move a card with votes into a Council.'],council:['Council','Three Councils give a lasting bonus for the votes there.'],
  favour:['Favour','A disc from the Meadow. It unlocks your faction\u2019s power.']};
const JRE=/\b(Clash(?:es)?|Heralds?|Govern|Councils?|(?:Kingdom\u2019s |Kingdom's )?Favour)\b/g;
function jkey(w){w=w.toLowerCase();return w.indexOf('clash')===0?'clash':w.indexOf('herald')===0?'herald':w.indexOf('govern')===0?'govern':w.indexOf('council')===0?'council':'favour'}
function jargon(h){UI._jg=UI._jg||{};if(UI._jgG!==G){UI._jgG=G;UI._jg={}}const used={};
  return h.replace(JRE,w=>{const k=jkey(w);if(used[k]||(UI._jg[k]&&UI._jg[k]!==UI._jgKey))return w;used[k]=1;if(!UI._jg[k])UI._jg[k]=UI._jgKey;return '<button type="button" class="tbt-term" data-tbterm="'+k+'">'+w+'</button>'})}
function showTerm(k){const j=JARGON[k],el=document.getElementById('gdef');if(!j||!el)return;el.innerHTML='<p><b>'+esc2(j[0])+'</b>: '+esc2(j[1])+'</p><button class="pp-x" data-a="gclose" aria-label="Close">'+(typeof ico==='function'?ico('x'):'x')+'</button>';el.hidden=false;el.setAttribute('role','dialog');try{sfx('tap')}catch(x){}}
window.tbPaint=paint;
(function(){const o=openPop;openPop=function(){UI._popRival=!!(G&&G.q&&viewSeatForQ()==null);const r=o.apply(this,arguments);
  // the zoomed card face is a picture: its printed words repeat the readable text beside it (name, effect, suit), so the face is decoration
  return r}})();
(function(){const mark=()=>{try{document.querySelectorAll('#ppop .pp-card,#ppop [data-kc]').forEach(e=>{if(!e.hasAttribute('data-fa-skip')){e.setAttribute('data-fa-skip','');e.setAttribute('aria-hidden','true')}})}catch(x){}};
  const go=()=>{const pp=document.getElementById('ppop');if(!pp){setTimeout(go,200);return}new MutationObserver(mark).observe(pp,{childList:true,subtree:true});mark()};go()})();window.tbVoice=voice;
(function(){const o=renderAll;renderAll=function(){const r=o.apply(this,arguments);try{paint()}catch(e){console.error('tbturn '+e.message)}try{if(window.tbCoachCheck)window.tbCoachCheck()}catch(e){}return r}})();
// ---- the rival's step is announced in one plain caption, then held ~1.3 s so it can be read (tap the strip to skip)
(function(){const o=aiStep;aiStep=function(w){const s=w.ai[0],l0=G.logN;const r=o.apply(this,arguments);
  try{let t=null;for(let i=G.log.length-1;i>=0&&G.log[i].i>l0;i--){if(G.log[i].s===s||G.log[i].s==null||G.log[i].s===undefined){t=G.log[i].t;break}}
    if(!t&&UI.nowT&&UI.nowT.at===G.logN)t=UI.nowT.t;if(!t&&G.log.length&&G.logN>l0)t=G.log[G.log.length-1].t;
    if(t){t=plain(t);if(/ bids /.test(t)&&G.q&&(G.q.kind==='bid'||G.q.kind==='bidRes'))t=t.replace(/ bids .*$/,' bids in secret.');const w2=t.split(/\s+/);UI._tbCap={s,t};UI._tbCapT=Date.now();const hm=readMs(t);UI._tbHold=0;
      if(viewSeatForQ()!=null||UI.evq&&UI.evq.some(x=>x.t==='news'||x.t==='event')){UI._tbHold=0}else paint();   // your own decision is open, or a news card follows: no caption hold   // a news card follows: it carries the message (one message at a time)
      if(window.ANIM)setTimeout(()=>{if(UI._tbHold&&UI._tbHold<=Date.now()){UI._tbHold=0;paint()}},hm+50)}}catch(e){}
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
// the result line comes from the ONE source of truth the result panel uses (G.over.winner / G.over.ranking): it can never name a different winner
function resultLine(){const Q=ST().quick||{};const o=G&&G.over;if(!o)return '';const me=vs(),w=o.winner;const top=G.pl[w].inf;
  const tied=G.pl.some((p,s)=>s!==w&&p.inf===top);if(w===me)return tied?Q.tie||Q.win:Q.win;
  return String(Q.lose||'').replace('{W}',(typeof DD!=='undefined'&&DD.FNAME?DD.FNAME[G.pl[w].fac]:shortName(w)))}
window.tbResultLine=resultLine;
// ---- quick game: a one-line flavour intro; the result line in the game's voice on the result card
(function(){const o=newGame;newGame=function(mode,opt){const r=o.apply(this,arguments);
  try{clearVoice();if(mode!=='tutorial'&&!(UI.camp)&&!(UI.cfg&&UI.cfg.tutorial)&&UI.mode==='me'&&window.ANIM&&!NET.on)showGoal()}catch(e){}return r}})();
(function(){const o=renderCard;renderCard=function(){const r=o.apply(this,arguments);
  try{const c=UI.card,pc=document.getElementById('pc');if(c&&c.kind==='over'&&pc&&!pc.querySelector('.tbq')&&!(UI.camp)){const t=resultLine();const sc=pc.querySelector('.cd-sc');if(t&&sc){const p=document.createElement('p');p.className='tbq';p.style.cssText='font:700 16px/1.3 "EB Garamond",Georgia,serif;margin:6px 0 10px;color:inherit';p.textContent=t;sc.insertBefore(p,sc.firstChild)}}}catch(e){}
  return r}})();

// ---- coached first game (replaces the forced tap steps): real game, free moves, the guide speaks when a rule first matters
window.TBCOACH={seen:[]};
const coachOn=()=>!!(UI.cfg&&UI.cfg.tutorial&&UI.coachOn&&G&&UI.started);
function say(id,force){const C=(ST().coach)||{};let t=C[id];if(typeof t==='function')t=t();if(!t)return;if(!force&&TBCOACH.seen.indexOf(id)>=0)return;if(TBCOACH.seen.indexOf(id)<0)TBCOACH.seen.push(id);
  if(vq.length>1)vq.splice(0,vq.length-1);voice(ST().guide||'ysolde',t,0,'coach')}
window.tbCoachSay=say;
let lastSig='';
function coachCheck(){try{if(!coachOn())return;if(G.over){if(!UI._tbEnd)tbEnd();return}
  const c=UI.card;let sig='';
  if(c&&c.kind==='event'){sig='ev'+c.ev.t+(c.ev.r!=null?c.ev.r:'');if(c.ev.t==='bids'&&!(c.rank&&c.revN>=c.rank.length))return}
  else if(c&&c.kind==='news'&&c.big&&c.items&&c.items.some(infK))sig='news'
  else if(!c&&G.q&&viewSeatForQ()!=null){const k=G.q.kind;sig='q'+k+(G.q.t==='menu'?menuPhase(G.q):'')}
  if(!sig||sig===lastSig)return;lastSig=sig;
  if(sig==='qbid'){if(document.getElementById('tbgoal')){lastSig='';return}say('bid')}
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
setInterval(coachCheck,220);
// a menu, the chapter map or a story scene on top: the strip (and any coach line) is hidden, never shown under it
setInterval(()=>{try{const e=el&&el.isConnected?el:null;if(!e)return;const c=covered();if(c&&!e.hidden)e.hidden=true;else if(!c&&e.hidden&&G&&UI.started)paint()}catch(x){}},250);window.tbCoachCheck=coachCheck;
function tbEnd(){UI._tbEnd=1;if(TBCOACH.seen.indexOf('round')<0)TBCOACH.seen.push('round');try{GXT.markDone('thornbound')}catch(e){}
  const C=(ST().coach)||{};let over='';try{over=overHTML()}catch(e){}
  const box=document.createElement('div');box.id='tbcend';box.style.cssText='position:fixed;inset:0;z-index:9999;background:#140c1a;color:#f6ecd2;overflow:auto;padding:16px;font:600 16px/1.35 "EB Garamond",Georgia,serif';
  const first=window.CAMPAIGN&&window.CAMPAIGN.chapters&&window.CAMPAIGN.chapters[0];
  box.innerHTML='<div style="max-width:560px;margin:0 auto"><h2 style="font:700 22px Cinzel,Georgia,serif;color:#f0c860;margin:0 0 8px">'+esc2(cast(ST().guide).name)+': you know the road</h2><p>'+esc2(resultLine())+'</p>'+'<p>'+esc2(C.round||'')+'</p>'+over+
   '<h3 style="color:#f0c860">Things you will meet later</h3><ul>'+(C.later||[]).map(x=>'<li>'+esc2(x)+'</li>').join('')+'</ul><p style="display:flex;gap:10px;flex-wrap:wrap">'+(first?'<button class="btn pri" data-e="chapter" style="min-height:48px;padding:0 18px;font:700 16px inherit">Start chapter 1</button>':'')+'<button class="btn" data-e="menu" style="min-height:48px;padding:0 18px;font:700 16px inherit">Back to the menu</button></p></div>';
  document.body.appendChild(box);
  box.addEventListener('click',e=>{const b=e.target.closest('[data-e]');if(!b)return;box.remove();tutLeave();UI.coachOn=0;if(b.dataset.e==='chapter'&&first&&typeof GXC!=='undefined'){showStart();GXC.play(first.id)}else{UI.sv='setup';UI.cfgOpen=false;showStart();renderStart()}})}
// start of the coached game (called by tutStart in ui12.js)
window.tbCoachStart=function(o){const pro=!!(o&&o.prologue);TBCOACH.seen=[];lastSig='';UI._tbEnd=0;const old=document.getElementById('tbcend');if(old)old.remove();
  try{GX.close()}catch(e){}hideStart();hideGloss();closePop(true);newGame('tutorial');UI.coachOn=1;UI.coachPro=pro;clearVoice();showGoal(true);renderAll()};
// for qa-bot: the coached game's state
window.GXCOACH={get running(){try{return coachOn()&&!G.over&&!UI._tbEnd}catch(e){return false}},get explained(){return TBCOACH.seen.slice()},get done(){try{return !!UI._tbEnd||GXT.isDone('thornbound')}catch(e){return false}}};
// ---- the Goal card: the first screen of Learn to play, the start of a quick game, and the Goal button. One sentence, three bullets; stays until tapped.
const scnOn=()=>{try{return /[?&]scn=/.test(location.search)}catch(e){return false}};
function showGoal(first,asked){if(document.getElementById('tbgoal'))return;if(!asked&&scnOn())return;const g=ST().goalCard||{};const b=document.createElement('div');b.id='tbgoal';
  b.innerHTML='<div class="gc" role="dialog" aria-modal="true" aria-label="'+(first?'Learn to play: the goal':'The goal')+'"><h2 class="win">'+esc2(g.win||'')+'</h2><ul>'+(g.how||[]).map(x=>'<li><b aria-hidden="true"></b>'+esc2(x)+'</li>').join('')+'</ul><button type="button">'+(first?'Let’s play':'Got it')+'</button></div>';
  clearVoice();TBCOACH.seen=TBCOACH.seen.filter(x=>x!=='bid');document.body.appendChild(b);const bt=b.querySelector('button');try{bt.focus({preventScroll:true})}catch(e){}
  const close=()=>{if(!b.isConnected)return;b.remove();document.removeEventListener('keydown',kd,true);lastSig='';try{coachCheck()}catch(e){}try{paint()}catch(e){}};
  const kd=e=>{if(e.key==='Escape'||e.key==='Enter'){e.preventDefault();e.stopPropagation();close()}};document.addEventListener('keydown',kd,true);
  b.addEventListener('click',e=>{if(e.target===b||e.target.closest('button'))close()})}
window.tbShowGoal=showGoal;
// ---- every message the game shows (news cards, clash results, round summary) stays for the read time; a tap still skips
(function(){const o=showNews;showNews=function(first){const r=o.apply(this,arguments);const c=UI.card;
  if(window.ANIM&&c&&c.kind==='news')setTimeout(()=>{if(UI.card!==c)return;const tx=cardMsg(c).t;
    clearTimeout(UI._nt);UI._nt=setTimeout(()=>{if(UI.card===c&&!(typeof tutHold==='function'&&tutHold(c))){UI.card=null;pump()}},readMs(tx))},0);return r}})();
(function(){const o=bfAuto;bfAuto=function(c,ms){if(window.ANIM&&c&&c.ev&&/^(clash|summary|bids)$/.test(c.ev.t)){const tx=cardMsg(c).t;
    ms=Math.max(ms,readMs(tx)*(typeof spd==='function'?spd():1))}return o.call(this,c,ms)}})();
// ---- the rival's next step waits until its caption has been read (tap the strip to go on)
(function(){const o=pump;pump=function(){try{if(document.getElementById('tbgoal')&&G&&UI.started&&viewSeatForQ()==null){clearTimeout(_pumpT);_pumpT=setTimeout(pump,250);return}if(window.ANIM&&G&&UI.started&&!UI.card&&UI._tbHold&&UI._tbHold>Date.now()&&viewSeatForQ()==null&&!(typeof NET!=='undefined'&&NET.on)){clearTimeout(_pumpT);if(UI._tbHeldAt!==UI._tbHold){UI._tbHeldAt=UI._tbHold;try{renderAll()}catch(x){}}_pumpT=setTimeout(pump,Math.max(30,UI._tbHold-Date.now()+30));return}}catch(e){}return o.apply(this,arguments)}})();
// ---- the header status stays steady: it names whose turn it is, never the rival's play-by-play (that is on the board)
(function(){const o=statusText;statusText=function(){const t=o.apply(this,arguments);try{if(G&&!G.over&&innerWidth<700&&UI.started)return {text:'Round '+shownRound()+' of '+G.rounds,seat:-1}}catch(e){}try{const c=UI.card;if(G&&!G.over&&c&&(c.kind==='news'||c.kind==='event'))return {text:'Round '+shownRound()+' of '+G.rounds,seat:-1};if(G&&!G.over&&!c&&G.q&&viewSeatForQ()==null){const w=whoActs();if(w.ai&&w.ai.length)return {text:poss(shortName(w.ai[0]))+' turn',seat:w.ai[0]}}}catch(e){}return t}})();
(function(){const o=renderBar;renderBar=function(){const r=o.apply(this,arguments);try{const b=document.getElementById('barstat');if(b)b.setAttribute('data-fa-skip','')}catch(e){}return r}})();
// ---- Learn to play is the coached free-play game (no spotlight steps): report it to the shared tutor API as a running tutor whose steps are done
(function(){if(typeof GXT==='undefined')return;const run=()=>{try{return coachOn()&&!G.over&&!UI._tbEnd}catch(e){return false}};
  const r=GXT.running,st=GXT.state;GXT.running=function(){return r.apply(GXT,arguments)||run()};
  GXT.state=function(){if(!r.call(GXT)&&run())return {active:false,phase:'end',coach:true};return st.apply(GXT,arguments)}})();
// ---- leaving Learn for the main menu ends the coached game (nothing keeps playing under the title); any real game clears the coach
(function(){const o=showStart;showStart=function(){try{if(coachOn()||UI.coachOn){UI.coachOn=0;clearVoice();const c=document.getElementById('tbcend');if(c)c.remove();if(UI.cfg&&UI.cfg.tutorial){tutLeave();UI.card=null}}}catch(e){}return o.apply(this,arguments)}})();
(function(){const o=newGame;newGame=function(mode){if(mode!=='tutorial'){try{UI.coachOn=0;clearVoice();const c=document.getElementById('tbcend');if(c)c.remove()}catch(e){}}return o.apply(this,arguments)}})();
// ---- a news card carries the round it happened in (the header and the board's round marker show that one round)
(function(){const o=newsItem;newsItem=function(e){const it=o.apply(this,arguments);try{if(it&&e&&e.r)it.round=e.r}catch(x){}return it}})();
// ---- "Watch the board. Tap to go on": one tap goes on at once, also while the tutorial waits between steps (its wait layer eats every tap)
(function(){const go=e=>{try{if(!G||!UI.started)return;const c=UI.card;if(!c||c.kind==='pass'||c.kind==='tip')return;
  if(typeof GXT==='undefined'||!GXT.active())return;const st=GXT.state();if(!st||st.phase==='show')return;   // a shown step has its own Next / spotlight
  if(typeof tutHold==='function'&&tutHold(c))return;if(e.target.closest&&e.target.closest('.gxt-skip,[data-gxt-skip],.tbt-skip'))return;
  if(bfSkip()){e.preventDefault();e.stopPropagation();try{paint()}catch(x){}}}catch(x){}};
  document.addEventListener('pointerdown',go,true)})();
// the tutorial can start holding a message that is already on screen: keep the strip's words true (repaints only when they change)
window.tbStripPaint=()=>{try{paint()}catch(x){}};setInterval(()=>{try{if(G&&UI.started&&UI.card&&typeof GXT!=='undefined'&&GXT.active())paint()}catch(x){}},200);
})();
