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
#hubHint{width:100%;box-sizing:border-box;text-align:center;font:600 14px/1.3 var(--mono);color:#ffe14d;background:#05030ce6;border-radius:8px;padding:5px 10px}
#hubHint:empty,#hubStory:empty{display:none}
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
.hub #taleLog>h2{display:none}
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
  const neon=()=>neonI+' '+GA.bank;
  const B=(cls,html,fn,id)=>{const b=document.createElement('button');b.type='button';b.className=cls;b.innerHTML=html;if(id)b.id=id;b.addEventListener('click',fn);return b;};
  const old=sel=>sel.startsWith('.')?document.querySelector('#mnMore '+sel)||document.querySelector(sel):$(sel.replace(/^#/,''));
  const press=sel=>{const b=old(sel);if(b&&!b.disabled)b.click();};
  /* ---- HOME ---- */
  const stat=document.createElement('div');stat.id='hubStat';stat.setAttribute('role','status');
  const hint=document.createElement('div');hint.id='hubHint';
  const story=document.createElement('div');story.id='hubStory';   // data slot for the story worker: RET.hubStory('<b>...</b>')
  RET.hubStory=h=>{story.innerHTML=h||'';};
  const grid=document.createElement('div');grid.id='hubGrid';
  const TILES=[['missions','MISSIONS','go alt'],['hangar','HANGAR','go'],['training','TRAINING','go dim'],['profile','PROFILE','go dim']],tile={};
  for(const [k,l,c] of TILES){const b=B(c,l+'<small></small><i class="hubDot" hidden></i>',()=>k==='hangar'?openHangar():openSec(k),'hub_'+k);tile[k]=b;grid.append(b);}
  $('playBtn').after(stat,hint,story,grid);
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
      ['CHECKLIST',()=>{const b=old('.ckB');const m=b&&/\((\d+)\)/.exec(b.textContent);return m?m[1]+' items to check':'owner test list';},'.ckB'],
      ['STORY LOG',()=>'everything that happened so far','#taleBtn'],
      ['SETTINGS',()=>'gameplay, display, audio, controls','#setBtn'],
      ['SAVES',()=>'save slots, export and import','#setBtn',0,0,'da']],
      more:[['FULL SCREEN: ',()=>{const b=$('fsBtn');return b?b.textContent.replace(/^FULL SCREEN:?\s*/i,''):'';},'#fsBtn',0,1],['UPDATE',()=>'','#setBtn',0,1,'da',1]],stamp:1}};
  const sec={};
  for(const k in SECS){const D=SECS[k],el=document.createElement('div');el.id='hub_'+k+'Scr';el.className='ov solid pg hubScr';el.hidden=true;el.setAttribute('role','dialog');el.setAttribute('aria-label',D.t);
    const top=document.createElement('div');top.className='top';const bk=B('go alt hubBk','‹',()=>shutSec(),'hub_'+k+'Back');bk.setAttribute('aria-label','Back');
    const ttl=document.createElement('span');ttl.className='ttl';ttl.textContent=D.t;const n=document.createElement('span');n.className='hubN';top.append(bk,ttl,n);
    const body=document.createElement('div');body.className='hubBody';el.append(top,body);
    const acts=[];
    const mk=(row,cls,a)=>{const [l,sub,sel,run,inl,grp]=a;const b=B(cls,'',()=>{if(run)shutSec();press(sel);if(grp)setTimeout(()=>{jump(grp);if(a[6]){const u=$('stampBtn');if(u)u.click();}},250);if(!run)setTimeout(drawSec,80);});
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
  {const tl=$('taleLog');if(tl)hdr(tl,'STORY LOG',()=>{const b=$('taleBack');if(b)b.click();});}
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
  function jump(g){regroup();const h=gh[g];if(h)h.scrollIntoView({block:'start'});}
  if(sb){sb.before(jumpRow);regroup();new MutationObserver(()=>{if(!sb._hubR){sb._hubR=1;requestAnimationFrame(()=>{sb._hubR=0;regroup();});}}).observe(sb,{childList:true});}
  /* ---- HOME strip, hint and red dots (only for things you can act on) ---- */
  function draw(){if(!RET.hub)return;const n=mapCurrent(),s=STAGES[n-1],d=window.DY&&RET.daily?DY.status():null,w=RET.week?RET.week():null,aff=typeof affordCount==='function'?affordCount():0;
    stat.innerHTML='<span>Stage <b>'+n+'</b>/'+STAGES.length+'</span><span>'+neon()+'</span>'+(d?'<span>Daily '+(d.claimed?'<span class="ok">✓ streak '+d.streak+'</span>':'<b>+'+d.reward+'</b>')+'</span>':'')+(w?'<span>Weekly '+(w.cleared?'<span class="ok">✓</span>':'<b>open</b>')+'</span>':'');
    const tut=!load_('mnr_tut'),fresh=!Object.keys(sSave.stars).some(k=>(sSave.stars[k]|0)>0);
    hint.textContent=tut&&fresh?'Next: learn the controls in TRAINING':aff?'Next: buy '+(aff>1?'an upgrade':'the upgrade')+' in HANGAR ('+aff+' ready)':d&&!d.claimed&&!fresh?'Next: fly the DAILY RUN in MISSIONS for +'+d.reward+' Neon':'';
    const td=$('taleDot');
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
},0);
