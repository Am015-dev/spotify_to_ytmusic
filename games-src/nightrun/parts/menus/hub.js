// PURPOSE: an organised home: PLAY + status + 4 sections (MISSIONS, HANGAR, TRAINING, PROFILE), one header everywhere, grouped settings
// FLAG: hub (?hub=0)
// TEST: hub-test.js
/* ---------- HUB: an organised home (flag RET.hub, default ON; ?hub=0 = the title + MENU sheet exactly as before). Test: nightrun/hub-test.js.
   Gamer feedback (21 Oct 2026): "messy, very unorganized". HOME = one big PLAY (#playBtn, title.js), a status strip, a one-line next-step hint,
   a Story slot (RET.hubStory, story worker) and four sections: MISSIONS, HANGAR, TRAINING, PROFILE.
   MISSIONS / TRAINING / PROFILE are sheets inside #title (.ov solid pg + the shared .top header: back arrow, title, Neon). HANGAR is the garage
   itself with its tabs in a fixed order (SHIP WEAPONS FORGE PILOT UPGRADES + a MORE row) and a loadout line on top.
   Nothing old is removed: the section buttons click the old buttons (#storyBtn, #wkBtn, #labBtn, .ckB ...) which stay in the hidden #mnMore sheet,
   so every id, hook and RET.menuOpen keep working. Settings get five groups (Gameplay, Display / Comfort, Audio, Controls, Data) by CSS order only:
   no settings node is moved, so the modules that insert next to their own rows keep working. RET.hubComfort = the Comfort slot (comfort worker). ---------- */
if(RET.hub===undefined)RET.hub=!/[?&]hub=0/.test(location.search)&&RET.title!==false;
if(RET.hub)setTimeout(()=>{
  const T=titleEl,main=$('ttMain');if(!main)return;
  document.documentElement.classList.add('hub');
  const st=document.createElement('style');st.textContent=`
.hub #ttMain>.row{display:none}
.hub #retTt{display:none}
.hub #title #titleRow2{display:none}
#hubStat{display:flex;flex-wrap:wrap;gap:4px 10px;justify-content:center;width:100%;box-sizing:border-box;background:#05030ce6;border:1px solid #3a2b5c;border-radius:8px;padding:6px 10px;font:600 14px/1.3 var(--mono);color:#d6d2f5}
#hubStat b{color:#fff;font-weight:700}#hubStat .ok{color:#6cf59a}#hubStat .nI{width:1em;height:1em;vertical-align:-.12em}
#playBtn small{display:block;white-space:nowrap;max-width:100%;font-size:12px;letter-spacing:.02em}
#hubStat #hubHint{flex:0 0 100%;background:none;padding:0;border:0}
#hubHint{width:100%;box-sizing:border-box;text-align:center;font:600 14px/1.3 var(--mono);color:#ffe14d;background:#05030ce6;border-radius:8px;padding:5px 10px}
#hubHint:empty,#hubStory:empty{display:none}
#hubStory:has(>button){background:none;border:0;padding:0}
#hubStory{width:100%;box-sizing:border-box;background:#05030ce6;border:1px solid #3a2b5c;border-radius:8px;padding:6px 10px;font:600 14px/1.3 var(--mono);color:#d6d2f5}
#hubGrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%}
#hubGrid .go{position:relative;width:100%;min-height:56px;padding:.4em .4em;font-size:15px;letter-spacing:.08em;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px}
#hubGrid .go small{font:600 13px/1.15 var(--mono);letter-spacing:0;opacity:.9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
.hubDot{position:absolute;top:8px;right:14%;width:12px;height:12px;border-radius:50%;background:#ff3b5c;box-shadow:0 0 0 2px #05030c}
.hubDot[hidden]{display:none}
.hubScr,.hubScr.ov.solid{position:absolute;inset:0;z-index:32;text-align:left;background:#05030c}
.hub #bestT,.hub #setLastSave{display:none}
.hubScr[hidden]{display:none}
.hubScr .hubBody{flex:1 1 auto;overflow-y:auto;display:flex;flex-direction:column;align-items:center;gap:10px;padding:12px 4px calc(16px + env(safe-area-inset-bottom,0px))}
.hubScr .hubAct{width:100%;max-width:440px;min-height:58px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-size:16px;letter-spacing:.08em;position:relative}
.hubScr .hubAct small{font:600 13px/1.2 var(--mono);letter-spacing:0;opacity:.9;max-width:92%;white-space:normal;text-align:center}
.hubScr .hubMore{width:100%;max-width:440px;display:flex;flex-direction:column;gap:6px;margin-top:4px;border-top:1px solid #3a2b5c;padding-top:8px}
.hubScr .hubMore>span{font:700 13px var(--display);letter-spacing:.16em;color:var(--dim)}
.hubScr .hubMore>div{display:flex;gap:8px}.hubScr .hubMore .go{flex:1 1 0;min-height:48px;font-size:14px;letter-spacing:.06em;padding:.3em .4em}
.hubScr .hubNote{width:100%;max-width:440px;font:600 13px/1.4 var(--mono);color:var(--dim);text-align:center}
.hubScr .keys{width:100%;max-width:440px}
.hub .hubBk,.hub .pg .top .hubBk,.hub #stSheet .hubHd .hubBk{order:-1;flex:0 0 48px;width:48px!important;min-width:48px;height:44px;min-height:44px;padding:0!important;margin:0;font:700 26px/1 var(--display)!important;letter-spacing:0;background:#0d0820!important;background-image:none!important;border:2px solid var(--cyan)!important;border-radius:12px!important;color:var(--cyan)!important;text-shadow:none!important;box-shadow:none!important;clip-path:none!important;filter:none!important}
.hub #setm h2:not(.hubSG){display:none}.hub #setBody h3.hubDup{display:none}
.hub #stSheet>.hubHd{margin-bottom:8px}
.hub .pg .top .ttl{flex:1 1 auto}.hub .pg .top .sp{display:none}
.hub .pg .top .hubN,.hubHd .hubN{color:#ffe14d;font:700 15px var(--mono);white-space:nowrap}
.hubHd{display:flex;align-items:center;gap:10px;min-height:48px;flex:0 0 auto;box-sizing:border-box;width:100%;background:linear-gradient(#05030c99,#05030c99),url(media/ui-topbar.webp) center/100% 100% no-repeat;padding:0 12px;border-radius:6px;position:sticky;top:0;z-index:2}
.hubHd .ttl{flex:1 1 auto;font:700 18px var(--display);letter-spacing:.14em;color:var(--cyan)}
.hub #taleLog>h2,.hub #sgLog>h2{display:none}
.hub #garage .tabs{flex-wrap:wrap;row-gap:6px}.hub #garage .tabs .hubMoreL{flex:1 0 100%;font:700 13px var(--display);letter-spacing:.16em;color:var(--dim);border-top:1px solid #3a2b5c;padding-top:4px}
.hub #garage .tabs button.hubSec{min-height:44px;font-size:13px;padding:0 .7em;flex:0 0 auto}
.hub #wpm .top .ttl{flex:0 1 auto}.hub #wpm .top #wpSl{flex:1 1 auto;min-width:0;overflow:hidden;display:flex;gap:4px}
#hubLoad{font:600 13px/1.35 var(--mono);color:#d6d2f5;background:#05030ce6;border:1px solid #3a2b5c;border-radius:8px;padding:5px 10px;margin:4px 0;flex:0 0 auto}
#hubLoad b{color:#fff}
.hub #setBody{display:flex;flex-direction:column}
.hubSG{font:700 16px var(--display);letter-spacing:.16em;color:var(--cyan);border-bottom:2px solid var(--cyan);padding:14px 0 4px;margin:0}
#hubJump{display:flex;gap:6px;overflow-x:auto;padding:4px 0 6px;flex:0 0 auto}#hubJump button{flex:1 0 auto;min-height:44px;font:700 13px var(--display);letter-spacing:.02em;padding:0 .45em;border-radius:99px;border:1px solid var(--cyan);background:#0d0820;color:var(--ink)}
@media (max-height:600px){#hubGrid .go{min-height:50px}#hubGrid .go small{display:none}#hubStat{font-size:13px;padding:4px 8px}#hubHint{padding:3px 8px}}
@media (min-width:900px){#hubStat,#hubHint,#hubStory,.hubScr .hubNote{font-size:16px}#hubGrid .go small{font-size:14px}}
`;document.head.appendChild(st);
  const neon=()=>neonI+' '+window.fmtN(GA.bank);
  const B=(cls,html,fn,id)=>{const b=document.createElement('button');b.type='button';b.className=cls;b.innerHTML=html;if(id)b.id=id;b.addEventListener('click',fn);return b;};
  const old=sel=>sel.includes('|')?sel.split('|').map(x=>old(x)).find(Boolean):sel.startsWith('.')?document.querySelector('#mnMore '+sel)||document.querySelector(sel):$(sel.replace(/^#/,''));
  const press=sel=>{const b=old(sel);if(b&&!b.disabled)b.click();};
  /* ---- HOME ---- */
  const stat=document.createElement('div');stat.id='hubStat';stat.setAttribute('role','status');
  const hint=document.createElement('div');hint.id='hubHint';
  const story=document.createElement('div');story.id='hubStory';story.dataset.hook='hub-story-slot';   // data slot for the story worker: RET.hubStory('<b>...</b>')
  RET.hubStory=h=>{story.innerHTML=h||'';};
  const grid=document.createElement('div');grid.id='hubGrid';
  const TILES=[['missions','MISSIONS','go alt'],['hangar','HANGAR','go'],['training','TRAINING','go dim'],['profile','PROFILE','go dim']],tile={};
  for(const [k,l,c] of TILES){const b=B(c,l+'<small></small><i class="hubDot" hidden></i>',()=>k==='hangar'?openHangar():openSec(k),'hub_'+k);tile[k]=b;grid.append(b);}
  $('playBtn').after(stat,story,grid);
  const sgIn=()=>{const t=$('sgTile');if(t&&t.parentNode!==story)story.append(t);};sgIn();setTimeout(sgIn,120);setTimeout(sgIn,1500);   // saga.js puts its STORY tile after #ttMain when it runs first
  /* ---- section sheets (inside #title, like the old MENU sheet) ---- */
  const SECS={
    missions:{t:'MISSIONS',a:[
      ['STAGE MAP',()=>'every story stage, stars and Heat','#storyBtn'],
      ['STREET RUN',()=>{const b=$('footBtn');return b&&b.querySelector('small')?b.querySelector('small').textContent:'on foot through the streets';},'#footBtn',1],
      ['ENDLESS',()=>'fly until the hull breaks','#startBtn',1],
      ['DAILY RUN',()=>{const d=window.DY&&RET.daily?DY.status():null;return d?(d.claimed?'done today · streak '+d.streak:'+'+d.reward+' Neon today'):'one seed a day';},'#dailyBtn',1],
      ['WEEKLY RUN',()=>{const w=RET.week?RET.week():null;return w?(w.cleared?'cleared this week':'boss clear = +'+DY.weekly+' Neon'):'one seed a week';},'#wkBtn',1]],
      more:[['DIFFICULTY: ',()=>{const b=$('diffBtn');return b?b.textContent.trim():'';},'#diffBtn',0,1]]},
    training:{t:'TRAINING',a:[
      ['FLIGHT SCHOOL',()=>'the 3-minute playable tutorial','#tutBtn',1],
      ['LESSONS',()=>'mini stages: one tactic each','#lsBtn'],
      ['PRACTICE',()=>'replay any cleared stage on the map','#storyBtn'],
      ['LAB',()=>'try any enemy, boss or weapon','#labBtn',1]],keys:1},
    profile:{t:'PROFILE',a:[
      ['STATS',()=>'records and achievements','#statsBtn'],
      ['STORY LOG',()=>'everything that happened so far','#sgBtn|#taleBtn'],
      ['SETTINGS',()=>'gameplay, display, audio, controls','#setBtn'],
      ['SAVES',()=>'save slots, export and import','#setBtn',0,0,'da']],
      more:[['FULL SCREEN: ',()=>{const b=$('fsBtn');return b?b.textContent.replace(/^FULL SCREEN:?\s*/i,''):'';},'#fsBtn',0,1],['UPDATE',()=>'','#setBtn',0,1,'da',1]],stamp:1}};
  const sec={};
  for(const k in SECS){const D=SECS[k],el=document.createElement('div');el.id='hub_'+k+'Scr';el.className='ov solid pg hubScr';el.hidden=true;el.setAttribute('role','dialog');el.setAttribute('aria-label',D.t);
    const top=document.createElement('div');top.className='top';const bk=B('go alt hubBk','‹',()=>shutSec(),'hub_'+k+'Back');bk.setAttribute('aria-label','Back');
    const ttl=document.createElement('span');ttl.className='ttl';ttl.textContent=D.t;const n=document.createElement('span');n.className='hubN';top.append(bk,ttl,n);
    const body=document.createElement('div');body.className='hubBody';el.append(top,body);
    const acts=[];
    const mk=(row,cls,a)=>{const [l,sub,sel,run,inl,grp]=a;const b=B(cls,'',()=>{if(run)shutSec();press(sel);if(grp)setTimeout(()=>{jump(grp,1);if(a[6]){const u=$('stampBtn');if(u)u.click();}},250);if(!run)setTimeout(drawSec,80);});
      b.dataset.door=sel;acts.push([b,l,sub,inl,sel]);row.append(b);};
    D.a.forEach((a,i)=>mk(body,i?'go dim hubAct':'go hubAct',a));
    if(D.more){const m=document.createElement('div');m.className='hubMore';m.innerHTML='<span>MORE</span>';const r=document.createElement('div');m.append(r);for(const a of D.more)mk(r,'go dim',a);body.append(m);}
    if(D.keys){const kk=document.querySelector('#mnMore .keys');if(kk){const c=kk.cloneNode(true);c.removeAttribute('id');for(const x of c.querySelectorAll('[id]'))x.removeAttribute('id');body.append(c);}}
    if(D.stamp){const s=document.createElement('div');s.className='hubNote';s.id='hubStamp';body.append(s);}
    T.appendChild(el);sec[k]={el,acts,n,body};}
  let cur=null;
  function drawSec(){if(!cur)return;const S=sec[cur];S.n.innerHTML=neon();
    for(const [b,l,sub,inl,sel] of S.acts){const o=old(sel);b.hidden=!o;const s=sub();b.innerHTML=inl?l+s:l+(s?'<small>'+s+'</small>':'');}
    const sp=$('hubStamp');if(sp&&RET.stampX)sp.textContent=RET.stampX.stampText();}
  function openSec(k){cur=k;for(const x in sec)sec[x].el.hidden=x!==k;drawSec();const f=sec[k].acts[0];if(f)f[0].focus();}
  function shutSec(){if(!cur)return;const k=cur;sec[k].el.hidden=true;cur=null;tile[k]&&tile[k].focus&&tile[k].focus();draw();}
  addEventListener('keydown',e=>{if(cur&&e.code==='Escape'&&!T.hidden&&$('setm').hidden){shutSec();e.stopImmediatePropagation();e.preventDefault();}},true);
  $('playBtn').addEventListener('click',()=>{if(cur)shutSec();},true);
  /* ---- HANGAR = the garage, tabs in a fixed order, a MORE row, a loadout line ---- */
  const tabs=garageEl.querySelector('.tabs'),ORDER=[['ships','SHIP'],['weapons','WEAPONS'],['forge','FORGE'],['pilot','PILOT'],['tune','UPGRADES']],MORE=['abil','crew','looks','load','mkt'];
  const ml=document.createElement('span');ml.className='hubMoreL';ml.textContent='MORE';
  const wpb=B('go dim','PICK',()=>{closeGarage();press('#wpBtn');},'hubWpPick');wpb.dataset.t='hubwp';wpb.setAttribute('aria-label','Pick weapons');
  function tabsDraw(){const by={};for(const b of tabs.querySelectorAll('button[data-t]'))by[b.dataset.t]=b;
    for(const [t,l] of ORDER)if(by[t]){by[t].textContent=l;by[t].classList.remove('hubSec');tabs.append(by[t]);}
    tabs.append(ml);for(const t of MORE)if(by[t]){by[t].classList.add('hubSec');tabs.append(by[t]);}wpb.classList.add('hubSec');tabs.append(wpb);
    for(const t in by)if(!ORDER.some(o=>o[0]===t)&&!MORE.includes(t)&&t!=='hubwp'){by[t].classList.add('hubSec');tabs.append(by[t]);}}
  const gaTop=garageEl.querySelector('.top'),gb=$('gaBack');gb.textContent='‹';gb.classList.add('hubBk');gb.setAttribute('aria-label','Back');gaTop.querySelector('.ttl').textContent='HANGAR';
  const load=document.createElement('div');load.id='hubLoad';tabs.before(load);
  function loadDraw(){const sh=shipDef(),c=typeof CLS!=='undefined'&&CLS.on?CLS.cur():null,w=typeof WP!=='undefined'&&WP.eqIds?WP.eqIds().map(i=>WPD[i]?WPD[i].n:i):[];
    load.innerHTML='LOADOUT · <b>'+sh.n+'</b>'+(w.length?' · '+w.map(x=>'<b>'+x+'</b>').join(' + '):'')+(c?' · pilot <b>'+c.n+'</b>':'');}
  {const g0=gaDraw;gaDraw=function(){const r=g0.apply(this,arguments);if(RET.hub){tabsDraw();loadDraw();}return r;};}
  function openHangar(){if(running)return;if(!['ships','weapons','forge','pilot','tune','abil','crew','looks','load','mkt'].includes(GA.tab))GA.tab='tune';openGarage('title');}
  /* the stage map shows Neon too, with the same back arrow */
  {const wt=$('wpm')&&$('wpm').querySelector('.top');if(wt){const bk=B('go alt hubBk','‹',()=>press('#wpGo'),'hubWpBack');bk.setAttribute('aria-label','Back');wt.prepend(bk);const n=document.createElement('span');n.className='hubN';wt.append(n);new MutationObserver(()=>{n.innerHTML=neon();}).observe($('wpm'),{attributes:true,attributeFilter:['hidden']});}}
  for(const id of ['stBack']){const b=$(id);const top=b&&b.closest('.top');if(top){b.textContent='‹';b.classList.add('hubBk');b.setAttribute('aria-label','Back');if(!top.querySelector('.hubN')){const n=document.createElement('span');n.className='hubN';top.append(n);const ov=top.closest('.ov');new MutationObserver(()=>{n.innerHTML=neon();}).observe(ov,{attributes:true,attributeFilter:['hidden']});}}}
  /* screens without a .top bar get the same header: back arrow, title, Neon */
  function hdr(el,title,back){if(!el||el.querySelector(':scope>.hubHd'))return;const h=document.createElement('div');h.className='hubHd';
    const bk=B('go alt hubBk','‹',back);bk.setAttribute('aria-label','Back');const t=document.createElement('span');t.className='ttl';t.textContent=title;const n=document.createElement('span');n.className='hubN';
    h.append(bk,t,n);el.prepend(h);new MutationObserver(()=>{n.innerHTML=neon();}).observe(el,{attributes:true,attributeFilter:['hidden']});n.innerHTML=neon();}
  hdr($('setm'),'SETTINGS',()=>closeSettings());
  {const tl=$('taleLog');if(tl)hdr(tl,'STORY LOG',()=>{const b=$('taleBack');if(b)b.click();});const sl=$('sgLog');if(sl)hdr(sl,'STORY LOG',()=>{const b=$('sgBack');if(b)b.click();});}
  {const ob=document.body;new MutationObserver(()=>{const s=$('stSheet');if(s&&!s.querySelector('.hubHd')){hdr(s,'STATS',()=>{const b=$('stsBack');if(b)b.click();else s.hidden=true;});}}).observe(ob,{childList:true});}
  /* ---- settings: five groups by CSS order (no node moves) + a jump row ---- */
  const GRP=[['gp','GAMEPLAY'],['dc','DISPLAY / COMFORT'],['au','AUDIO'],['ct','CONTROLS'],['da','DATA']],H3G={Gameplay:'gp',Controls:'ct',Rhythm:'ct',Audio:'au',Visuals:'dc',Accessibility:'dc',Assist:'dc','Save / Load':'da',Save:'da',BUILD:'da'};
  const sb=$('setBody'),gh={};
  const comfort=document.createElement('div');comfort.id='hubComfort';   // data slot for the comfort worker: RET.hubComfort(node)
  RET.hubComfort=n=>{comfort.innerHTML='';if(n)comfort.append(n);regroup();};
  function regroup(){if(!sb)return;for(const [g,l] of GRP)if(!gh[g]){const h=document.createElement('h2');h.className='hubSG';h.id='hubSG_'+g;h.textContent=l;gh[g]=h;sb.append(h);}
    if(!comfort.isConnected)sb.append(comfort);
    let g='gp',i=0;const gi=Object.fromEntries(GRP.map(([k],j)=>[k,j]));
    for(const e of sb.children){if(e.classList.contains('hubSG')){e.style.order=gi[e.id.slice(6)]*1000;continue;}
      if(e===comfort){e.style.order=gi.dc*1000+1;continue;}
      if(e.tagName==='H3'){const t=e.textContent.trim();g=H3G[t]||g;e.classList.toggle('hubDup',/^(gameplay|audio|controls)$/i.test(t));}
      let x=g;if(e.id==='stampRow'||e.id==='labBtnS'||e.id==='setLastSave'||e.id==='svBox'||e.id==='svH'||e.id==='sioH'||e.id==='sioBox'||e.querySelector&&e.querySelector('.ckB,#tutBtnS,#labBtnS'))x='da';
      e.style.order=gi[x]*1000+2+(++i);}}
  const jumpRow=document.createElement('div');jumpRow.id='hubJump';
  for(const [g,l] of GRP)jumpRow.append(B('',l.split(' ')[0].replace('GAMEPLAY','GAME'),()=>jump(g)));
  function jump(g,door){if(door&&RET.tidyJump&&RET.tidyJump(g))return;regroup();const h=gh[g];if(h)h.scrollIntoView({block:'start'});}
  if(sb){sb.before(jumpRow);regroup();new MutationObserver(()=>{if(!sb._hubR){sb._hubR=1;requestAnimationFrame(()=>{sb._hubR=0;regroup();});}}).observe(sb,{childList:true});}
  /* ---- HOME strip, hint and red dots (only for things you can act on) ---- */
  function draw(){if(!RET.hub)return;const n=mapCurrent(),s=STAGES[n-1],d=window.DY&&RET.daily?DY.status():null,w=RET.week?RET.week():null,aff=typeof affordCount==='function'?affordCount():0;
    stat.innerHTML='<span>Stage <b>'+n+'</b>/'+STAGES.length+'</span><span>'+neon()+'</span>'+(d?'<span>Daily '+(d.claimed?'<span class="ok">✓ streak '+d.streak+'</span>':'<b>+'+d.reward+'</b>')+'</span>':'')+(w?'<span>Weekly '+(w.cleared?'<span class="ok">✓</span>':'<b>open</b>')+'</span>':'');
    const tut=!load_('mnr_tut'),fresh=!Object.keys(sSave.stars).some(k=>(sSave.stars[k]|0)>0);
    hint.textContent=tut&&fresh?'Next: learn the controls in TRAINING':aff?'Next: buy '+(aff>1?'an upgrade':'the upgrade')+' in HANGAR ('+aff+' ready)':d&&!d.claimed&&!fresh?'Next: fly the DAILY RUN in MISSIONS for +'+d.reward+' Neon':'';
    stat.append(hint);hint.hidden=!hint.textContent;const td=$('taleDot');
    const dots={missions:!!(d&&!d.claimed&&!fresh),hangar:aff>0,training:tut,profile:!!(td&&!td.hidden)};
    const sub={missions:'map · daily',hangar:aff?aff+' to buy':'ship · weapons',training:'school · lab',profile:'stats · settings'};
    for(const k in tile){tile[k].querySelector('.hubDot').hidden=!dots[k];tile[k].querySelector('small').textContent=sub[k];}
    if(cur)drawSec();}
  const load_=k=>{try{return localStorage.getItem(k);}catch(e){return null;}};
  RET.hubDraw=draw;
  {const td=RET.titleDraw;RET.titleDraw=function(){const r=td&&td.apply(this,arguments);draw();return r;};}
  new MutationObserver(()=>{if(!T.hidden)draw();}).observe(T,{attributes:true,attributeFilter:['hidden']});
  {const a=affUpd;affUpd=function(){const r=a.apply(this,arguments);if(!T.hidden)draw();return r;};}
  draw();
  window.__hub={open:openSec,shut:shutSec,hangar:openHangar,jump,draw,SECS,cur:()=>cur};   // test hook
/* ---- garagefix (flag RET.garagefix, default ON, ?garagefix=0 = old Garage; needs the hub; test garagefix-test.js) ---- */
/* ---------- garagefix.js: the Garage on a phone (flag RET.garagefix, default ON; ?garagefix=0 = the Garage exactly as before). Test: nightrun/garagefix-test.js.
   Owner (21 Oct 2026): "on garage when I buy something I need to scroll up and down if the item is below the 5th item."
   1. Buying never moves the list: a TUNE purchase re-renders only the cards that changed (tuneDraw(detached box) + replaceWith); every other redraw puts the scroll back.
   2. Each tab keeps its own scroll (also when you leave the Garage and come back).
   3. Phone layout: 2-column compact cards (level, price, buy pill inside), one-row tab bar, sticky bar with the AFFORDABLE chip and section jump chips,
      a RECOMMENDED NEXT row at the top, a "Need N more" reason on every card you cannot buy. Header stays put (the cards are the only scroller). No new art. */
if(RET.garagefix===undefined)RET.garagefix=!/[?&]garagefix=0/.test(location.search);
const GF=window.GF={on:!!RET.garagefix,mem:{},aff:false,keep:null,busy:0,tabs:['tune','ships','crew','looks','abil','mkt']};
if(GF.on){
{const st=document.createElement('style');st.textContent=`
#garage.gfx{gap:6px!important;padding-bottom:8px!important}
#garage.gfx .top{min-height:44px}
#garage.gfx #hubLoad{font-size:12px!important;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-height:0!important;padding:2px 8px!important;margin:0!important;flex:0 0 auto}
@media (max-height:640px){#garage.gfx #hubLoad{display:none}}
#garage.gfx .tabs{flex-wrap:nowrap!important;overflow-x:auto!important;overflow-y:hidden;gap:6px!important;padding:0 0 2px;align-items:center}
#garage.gfx .tabs button{flex:0 0 auto!important;min-width:44px;min-height:44px;padding:0 14px!important;font-size:13px!important;letter-spacing:.04em;width:auto!important;margin:0!important}
#garage.gfx .tabs .hubMoreL{flex:0 0 auto;font-size:12px;color:var(--dim);padding:0 2px}
#garage.gfx #gaPic{display:none!important}
#garage .msg{font-size:12px}
#garage.gfx .msg{font-size:12px;min-height:16px}
#garage.gfx #gaCards{flex:1 1 0;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;position:relative;scroll-behavior:auto}
#gaCards.gfg{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;grid-auto-rows:min-content;align-content:start;gap:8px!important;padding:0 2px 12px!important}
#gaCards.gfg .gfBar{position:sticky;top:0;z-index:4;grid-column:1/-1;display:flex;gap:6px;align-items:center;overflow-x:auto;scrollbar-width:none;padding:3px 0;margin:0 -2px;background:linear-gradient(#0b0820 82%,#0b082000);touch-action:pan-x}
#gaCards.gfg .gfBar::-webkit-scrollbar{display:none}
#gaCards .gfChip{flex:0 0 auto;min-height:44px;min-width:44px;padding:0 12px;border-radius:22px;border:1.5px solid #5a4d8a;background:#1a1240;color:#efeaff;font:700 12.5px var(--mono,monospace);letter-spacing:.04em;white-space:nowrap;cursor:pointer;touch-action:manipulation}
#gaCards .gfChip.on{background:var(--cyan,#19e3ff);color:#0b0820;border-color:var(--cyan,#19e3ff)}
#gaCards .gfChip.sec{border-color:var(--c,#5a4d8a);color:var(--c,#efeaff)}
#gaCards .gfSec{grid-column:1/-1;margin:4px 0 0;font:700 13px var(--mono,monospace);letter-spacing:.1em;color:var(--c,#19e3ff);display:flex;align-items:center;gap:6px}
#gaCards .gfSec::after{content:'';flex:1;height:1px;background:var(--c,#5a4d8a);opacity:.6}
#gaCards .gfRec{grid-column:1/-1;display:flex;align-items:center;gap:8px;min-height:56px;padding:6px 10px;border-radius:12px;border:2px solid var(--amber,#ffb020);background:#241a0a;color:#fff;text-align:left;font-family:var(--display);cursor:pointer;touch-action:manipulation}
#gaCards .gfRec .rt{font:700 12px var(--mono,monospace);letter-spacing:.08em;color:var(--amber,#ffb020);flex:0 0 auto}
#gaCards .gfRec .rn{flex:1 1 0;min-width:0;font-weight:700;font-size:14px;line-height:1.1;overflow-wrap:anywhere}
#gaCards .gfRec .gfBuy{flex:0 0 auto}
#garage #gaCards.gfg .card{flex-direction:column!important;align-items:stretch;justify-content:flex-start;text-align:left;gap:4px;padding:8px!important;min-height:44px;opacity:1}
#garage #gaCards.gfg .card>svg,#garage #gaCards.gfg .card>img,#garage #gaCards.gfg .card>.sw{align-self:flex-start;height:32px!important;width:32px!important;flex:0 0 auto}
#garage #gaCards.gfg .card>img.shp{width:auto!important;height:46px!important;max-width:100%}
#garage #gaCards.gfg .card .tx{flex:1 1 auto;gap:2px}
#garage #gaCards.gfg .card .n{font-size:14px;line-height:1.1}
#garage #gaCards.gfg .card .t,#garage #gaCards.gfg .card .pv{font-size:12px;line-height:1.2;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
#garage #gaCards.gfg .card .lv{font-size:12px;margin-left:4px}
#garage #gaCards.gfg .card .lv::before{content:'Lv '}
#garage #gaCards.gfg .card .chips,#garage #gaCards.gfg .card .chips b{font-size:12px}
#garage #gaCards.gfg .card .rec{font-size:12px;top:-9px;right:6px}
#garage #gaCards.gfg .card .pr{margin:0!important;align-self:stretch;min-height:44px;display:flex;align-items:center;justify-content:center;gap:5px;border-radius:10px;border:1.5px solid var(--amber,#ffb020);background:#2a1d08;font-size:14px;box-sizing:border-box;text-align:center;white-space:normal;line-height:1.1}
#garage #gaCards.gfg .card.no .pr{border-style:dashed;border-color:#8c86b8;background:#150f2c;color:#ffd0da;font-size:12.5px}
#garage #gaCards.gfg .card.no .n,#garage #gaCards.gfg .card.no .t{opacity:.85}
#garage #gaCards.gfg .card.max .pr,#garage #gaCards.gfg .card.sold .pr{border-color:#8c86b8;color:#c9c3e6;background:none}
#garage #gaCards.gfg .card.sel .pr{border-color:var(--cyan);color:var(--cyan);background:#0c2330}
#gaCards .gfBuy{display:inline-flex;align-items:center;gap:5px;min-height:44px;padding:0 12px;border-radius:10px;border:1.5px solid var(--amber,#ffb020);background:#2a1d08;color:var(--amber,#ffb020);font:700 14px var(--mono,monospace);white-space:nowrap}
#gaCards .gfhide{display:none!important}
#gaCards #mkRe,#gaCards .mkbar button,#gaCards .presets button{min-height:44px}
#gaCards.gfg .card.d{grid-column:1/-1}
#gaCards.gfg .fullrow,#gaCards.gfg .slots{grid-column:1/-1}
`;document.head.appendChild(st);}
garageEl.classList.add('gfx');
const box0=()=>$('gaCards');
const nnum=s=>{const m=/([\d.]+)\s*$/.exec((s||'').trim());return m?+m[1].replace(/\./g,''):0;};
const gfSecOf=c=>{const id=c.dataset.id||'';return c.dataset.kind==='tune'?pathOf(id.replace(/^tp_/,'')):c.dataset.kind==='crew'?pathOf(id.replace(/^up_|^pu_/,'')):null;};
const SECORD=()=>Object.keys(PATHS).concat(['_']);
/* one card: a BUY pill with the price (or the reason you cannot buy), once per node */
function gfCard(c){if(c.dataset.gf)return;c.dataset.gf=1;const pr=c.querySelector('.pr');if(!pr||!/^(tune|ship|crew|theme|abil|market)/.test(c.dataset.kind||''))return;
  const t=pr.textContent.trim(),price=pr.querySelector('.nI')?nnum(t):0;c._raw=c.outerHTML;
  if(c.classList.contains('sold')||c.classList.contains('max')||!price)return;
  if(GA.bank<price){pr.innerHTML='Need '+window.fmtN(price-GA.bank)+' more '+neonI;c.setAttribute('aria-disabled','true');c.title='Not enough Neon: need '+(price-GA.bank)+' more';}
  else pr.innerHTML='BUY '+pr.innerHTML;}
function gfRecWho(box){if(GA.tab==='tune'){let r=null;try{r=recTune();}catch(e){}const d=r&&TP_DEF.find(x=>x.id===r);if(d){const pr=tuneNext(d);return pr?{id:'tp_'+d.id,n:d.n,lv:TP.raw(d.id)+1,p:pr}:null;}return null;}
  let best=null;for(const c of box.querySelectorAll('.card'))if(!c.classList.contains('no')&&!c.classList.contains('sold')&&!c.classList.contains('max')&&c.querySelector('.pr .nI')){const p=nnum(c.querySelector('.pr').textContent);if(p&&(!best||p<best.p))best={id:c.dataset.id,n:(c.querySelector('.n')||c).textContent.replace(/\d+\/\d+$/,'').trim(),lv:0,p};}
  return best;}
function gfBar(box){let bar=box.querySelector('.gfBar');const cards=[...box.querySelectorAll('.card')];
  const aff=cards.filter(c=>!c.classList.contains('no')&&!c.classList.contains('sold')&&!c.classList.contains('max')&&c.querySelector('.pr .nI')).length;
  const secs=GA.tab==='tune'||GA.tab==='crew'?SECORD().filter(k=>box.querySelector('.gfSec[data-k="'+k+'"]')):[];
  const sig=aff+'|'+GF.aff+'|'+secs.join();if(bar&&bar._sig===sig)return;
  if(!bar){bar=document.createElement('div');bar.className='gfBar';box.prepend(bar);}
  bar._sig=sig;bar.innerHTML='<button type="button" class="gfChip aff'+(GF.aff?' on':'')+'" aria-pressed="'+GF.aff+'">AFFORDABLE '+aff+'</button>'
    +secs.map(k=>`<button type="button" class="gfChip sec" data-k="${k}" style="--c:${k==='_'?'#8c86b8':PATHS[k].c}">${k==='_'?'OTHER':PATHS[k].n.toUpperCase()}</button>`).join('');}
function gfRec(box){let r=box.querySelector('.gfRec');const w=gfRecWho(box);if(!w){if(r)r.remove();return;}
  if(!r){r=document.createElement('button');r.type='button';r.className='gfRec';box.querySelector('.gfBar').after(r);}
  r.dataset.for=w.id;r.innerHTML='<span class="rt">RECOMMENDED NEXT</span><span class="rn">'+w.n+(w.lv?' · Lv '+w.lv:'')+'</span><span class="gfBuy">BUY '+neonI+' '+window.fmtN(w.p)+'</span>';}
function gfFilter(box){const cards=[...box.querySelectorAll('.card')];
  for(const c of cards){const off=GF.aff&&(c.classList.contains('no')||c.classList.contains('sold')||c.classList.contains('max'))&&c.dataset.id!==GF.keep;c.classList.toggle('gfhide',off);}
  for(const h of box.querySelectorAll('.gfSec')){let n=h.nextElementSibling,any=false;while(n&&!n.classList.contains('gfSec')){if(n.classList.contains('card')&&!n.classList.contains('gfhide'))any=true;n=n.nextElementSibling;}h.classList.toggle('gfhide',!any);}}
/* sections: cards grouped by build path with a heading each (tune and crew) */
function gfSections(box){if(GA.tab!=='tune'&&GA.tab!=='crew')return;const cards=[...box.querySelectorAll('.card')];if(!cards.length)return;
  const ord=SECORD(),key=c=>gfSecOf(c)||'_',rank=c=>ord.indexOf(key(c));
  cards.sort((a,b)=>rank(a)-rank(b));let last=null;for(const h of box.querySelectorAll('.gfSec'))h.remove();
  for(const c of cards){const k=key(c);if(k!==last){const h=document.createElement('div');h.className='gfSec';h.dataset.k=k;h.style.setProperty('--c',k==='_'?'#8c86b8':PATHS[k].c);h.textContent=k==='_'?'OTHER':PATHS[k].n.toUpperCase();box.append(h);last=k;}box.append(c);}}
function gfDecorate(box){box.classList.toggle('gfg',GF.tabs.includes(GA.tab));if(!box.classList.contains('gfg')){for(const x of box.querySelectorAll('.gfBar,.gfRec,.gfSec'))x.remove();return;}
  const had=box.querySelector('.gfBar');if(had)had.remove();const rec0=box.querySelector('.gfRec');if(rec0)rec0.remove();
  for(const c of box.querySelectorAll('.card'))gfCard(c);gfSections(box);gfBar(box);gfRec(box);gfFilter(box);}
/* ---- scroll memory: per tab, kept while the Garage is closed ---- */
const SKEY=()=>GA.tab;
box0().addEventListener('scroll',()=>{if(!GF.busy&&!garageEl.hidden)GF.mem[SKEY()]=box0().scrollTop;},{passive:true});
function gfRestore(box,top){GF.busy++;box.scrollTop=top;const again=()=>{if(box.scrollTop!==top&&box.scrollHeight-box.clientHeight>=top-1)box.scrollTop=top;};
  requestAnimationFrame(()=>{again();requestAnimationFrame(()=>{again();GF.busy=Math.max(0,GF.busy-1);});});}
let g0=gaDraw,inp=null;
{gaDraw=function(){const box=box0(),hidden=garageEl.hidden;if(!hidden&&GF.last===GA.tab)GF.mem[GA.tab]=box.scrollTop;
  const patch=inp&&GA.tab==='tune'&&!hidden&&box.querySelector('.card[data-kind=tune]')&&box.classList.contains('gfg');
  if(patch){const top=box.scrollTop;GF.busy++;GF.keep=inp;
    $('gaBank').innerHTML=neonI+' <b id="gaBankN">'+window.fmtN(GA.bank)+'</b>';
    const tmp=document.createElement('div');tuneDraw(tmp);
    for(const c of box.querySelectorAll('.card'))if(c._raw===undefined&&c.dataset.gf)c._raw=c.outerHTML;
    // a purchase can change the price text of every card (the "Need N more" reason): compare the raw markup of the fresh card with the live card before decoration
    const ok=gfPatchAll(box,tmp);
    if(ok){affUpd();gfBar(box);gfRec(box);gfFilter(box);box.scrollTop=top;requestAnimationFrame(()=>{box.scrollTop=top;GF.busy=Math.max(0,GF.busy-1);});GF.mem[GA.tab]=top;GF.last=GA.tab;return;}
    GF.busy=Math.max(0,GF.busy-1);}
  const want=GF.mem[GA.tab]||0,foc=document.activeElement&&box.contains(document.activeElement)?document.activeElement.dataset.id:null;
  GF.busy++;const r=g0.apply(this,arguments);
  if(garageEl.hidden||(window.labEl&&!labEl.hidden)){GF.busy=Math.max(0,GF.busy-1);return r;}
  gfDecorate(box);gfRestore(box,want);GF.busy=Math.max(0,GF.busy-1);GF.last=GA.tab;GF.keep=null;
  if(foc){const f=box.querySelector('[data-id="'+foc+'"]');if(f)try{f.focus({preventScroll:true});}catch(e){}}
  return r;};}
/* patch helper: decorate each fresh card, compare the decorated markup with the live one, replace only the differences */
function gfPatchAll(box,fresh){const live=new Map([...box.querySelectorAll('.card[data-id]')].map(c=>[c.dataset.id,c])),foc=document.activeElement&&document.activeElement.dataset?document.activeElement.dataset.id:null;
  const nf=[...fresh.querySelectorAll('.card[data-id]')];if(nf.length!==live.size)return false;
  for(const nc of nf)if(!live.has(nc.dataset.id))return false;
  for(const nc of nf){const oc=live.get(nc.dataset.id);gfCard(nc);const same=oc.outerHTML.replace(/ class="[^"]*"/,'')===nc.outerHTML.replace(/ class="[^"]*"/,'')&&oc.className.replace(/\bgfhide\b|\s+/g,' ').trim()===nc.className.replace(/\bgfhide\b|\s+/g,' ').trim();
    if(same)continue;oc.replaceWith(nc);if(foc&&foc===nc.dataset.id)try{nc.focus({preventScroll:true});}catch(e){}}
  return true;}
{const tb0=tuneBuy;tuneBuy=function(d,b){inp='tp_'+d.id;try{return tb0.apply(this,arguments);}finally{inp=null;}};}
/* chip taps */
box0().addEventListener('click',e=>{const box=box0(),ch=e.target.closest&&e.target.closest('.gfChip'),rc=e.target.closest&&e.target.closest('.gfRec');
  if(ch){e.stopPropagation();if(ch.classList.contains('aff')){GF.aff=!GF.aff;GF.keep=null;const bar=box.querySelector('.gfBar');if(bar)bar._sig='';gfBar(box);gfFilter(box);return;}
    const h=box.querySelector('.gfSec[data-k="'+ch.dataset.k+'"]');if(h){const bar=box.querySelector('.gfBar'),top=h.getBoundingClientRect().top-box.getBoundingClientRect().top+box.scrollTop-(bar?bar.offsetHeight:0);box.scrollTo({top:Math.max(0,top)});}return;}
  if(rc){e.stopPropagation();const c=box.querySelector('.card[data-id="'+rc.dataset.for+'"]');if(c)c.click();}},true);
}
},0);
