// PURPOSE: campaign story: opening, briefings, comms, chapter ends, STORY tile and log
// FLAG: story (?story=0)
// TEST: story-test.js
/* ---------- SAGA: plays the campaign through-line written in parts/storydata.js (flag RET.story, default ON; ?story=0 = the game exactly as before).
   Where it shows: the OPENING (first story start, ~25 s, auto-advancing, tap / SKIP), a one-card BRIEFING before each story stage (first time only),
   in-stage COMMS lines (one line, 3 s, never blocks, moves away from the ship: start, mid-point, boss in, boss down), the chapter's closing scene and a
   'story so far' line on the result screen, the EPILOGUE + credits after stage 40, the STREET RUN's before/after (through foot.js and TALE.show).
   HOME: a STORY tile (current chapter, 'Chapter 3/10'; in the hub-story-slot hook when the menu has one). MENU: STORY LOG = the chapter list with replays.
   Automated pages (?sim=1, ?scn=, webdriver) never meet a scene unless ?story=2. Save: localStorage mnr_saga = {s:{key:1}} (in the save export list).
   Test: NODE_PATH=$(npm root -g) node games-src/nightrun/story-test.js ---------- */
if(RET.story){
 RET.sioKeys&&RET.sioKeys.push('mnr_saga');
 const SG_AUTO=/[?&]story=2/.test(location.search)||!(SIM||navigator.webdriver||/[?&]scn=/.test(location.search));
 const CHN=STORY_CH.length;
 const ROWS=STORY_LINES.map(r=>({id:r[0],ch:r[1],trig:r[2],who:r[3],l:[r[4],r[5]].filter(Boolean)}));
 const BYT={};for(const r of ROWS)(BYT[r.trig]=BYT[r.trig]||[]).push(r);
 const SV=(()=>{const o=load('mnr_saga',null);return{s:(o&&o.s&&typeof o.s==='object')?o.s:{}};})();
 const sv=()=>save('mnr_saga',SV);
 const seen=k=>!!SV.s[k],mark=k=>{if(!SV.s[k]){SV.s[k]=1;sv();}};
 const chOf=n=>{for(let i=0;i<CHN;i++)if(n>=STORY_CH[i][1]&&n<=STORY_CH[i][2])return i+1;return 0;};
 const chDone=c=>(sSave.stars[STORY_CH[c-1][2]]|0)>=1;
 const chOpen=c=>unlocked(STORY_CH[c-1][1]);
 const curCh=()=>{const n=typeof mapCurrent==='function'?mapCurrent():1;return Math.max(1,Math.min(CHN,chOf(n)||CHN));};
 /* speaker: name, role, colour, picture (cast still or boss still; a flat labelled box when the file is missing) */
 const whoOf=w=>{if(/^b:\d+$/.test(w)){const n=+w.slice(2),s=STAGES[n-1],nm=(s&&bossOf(s))||'BOSS';return{n:nm,role:s&&s.goal.k==='mini'?'Mini-boss':'District boss',c:'#ff4060',pic:'boss-'+slugOf(nm),boss:1};}
   if(w==='brief')return{n:'BRIEFING',role:'',c:'#ffb020'};const c=STORY_CAST[w]||{n:String(w).toUpperCase(),role:'',c:'#fff'};return c;};
 function pic(wo,cls){const ph=()=>{const s=document.createElement('span');s.className='sgP ph '+(cls||'');s.style.setProperty('--c',wo.c);s.textContent=(wo.pic||'?').replace(/^char-|^boss-/,'').toUpperCase().slice(0,5);s.setAttribute('aria-hidden','true');return s;};
   if(!wo.pic)return null;if(!wo.boss&&!(ART.isReal&&ART.isReal(wo.pic)))return ph();
   const im=document.createElement('img');im.className='sgP '+(cls||'');im.alt='';im.style.setProperty('--c',wo.c);im.src='media/'+wo.pic+'.webp';im.onerror=()=>{if(im.parentNode)im.replaceWith(ph());};return im;}
 const bgFor=di=>{try{return 'media/bg-'+slugOf(DISTRICTS[Math.min(di,DISTRICTS.length-1)].name)+(innerWidth>innerHeight?'':'-phone')+'.webp';}catch(e){return '';}};
 const diOfCh=c=>{const s=STAGES[STORY_CH[c-1][1]-1];return s?s.di:0;};
 const athens=di=>di>=DISTRICTS.length?{name:'ATHINA',sub:'Plaka · 02:10'}:DISTRICTS[di];
 /* ----- styles ----- */
 {const st=document.createElement('style');st.textContent=`
#sgCard{position:absolute;inset:0;z-index:75;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;padding:14px;box-sizing:border-box;background:#05030c center/cover no-repeat;cursor:pointer;outline:0}
#sgCard[hidden]{display:none}
#sgCard::before{content:"";position:absolute;inset:0;background:linear-gradient(#05030c55,#05030ccc 60%,#05030c)}
#sgCard .sgc{position:relative;width:min(100%,560px);box-sizing:border-box;padding:12px 14px;border:2px solid var(--c,#19e3ff);border-radius:14px;background:#0d0720ee;color:var(--ink);display:grid;grid-template-columns:auto 1fr;gap:6px 12px;align-items:center}
#sgCard .sgch{grid-column:1/-1;font:700 14px var(--mono);letter-spacing:.14em;color:var(--dim)}
#sgCard .sgn{font:700 18px var(--display);letter-spacing:.08em;color:var(--c)}
#sgCard .sgn small{display:block;font:14px var(--mono);letter-spacing:.02em;color:var(--dim);font-weight:400}
#sgCard .sgt{grid-column:1/-1;font:16px/1.4 var(--display);min-height:2.9em}
#sgCard .sgt div+div{margin-top:4px}
#sgCard .sgf{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;gap:10px;font:14px var(--mono);color:var(--dim)}
#sgCard .sgf button{min-height:44px;min-width:64px;padding:0 14px;border:1px solid #5a4a7a;border-radius:8px;background:#120a24;color:var(--ink);font:700 14px var(--mono);letter-spacing:.08em;cursor:pointer}
#sgCard .sgdots{letter-spacing:.2em}
#sgCard .sgbar{grid-column:1/-1;height:3px;background:#ffffff18;border-radius:2px;overflow:hidden}#sgCard .sgbar i{display:block;height:100%;width:0;background:var(--c)}
#sgCard.brief .sgh{grid-column:1/-1;font:700 22px var(--display);letter-spacing:.1em;color:var(--ink);line-height:1.15}
#sgCard.brief .sgh small{display:block;font:14px var(--mono);letter-spacing:.04em;color:var(--dim);font-weight:400;margin-top:2px}
#sgCard.brief .sgg{grid-column:1/-1;font:700 14px var(--mono);letter-spacing:.08em;color:#ffe14d}
#sgCard.brief .sgnew{color:var(--amber,#ffb020)}
.sgP{width:64px;height:64px;border-radius:50%;border:3px solid var(--c,#19e3ff);box-sizing:border-box;object-fit:cover;background:#05030c;flex:0 0 auto}
.sgP.ph{display:flex;align-items:center;justify-content:center;border-radius:6px;border:2px dashed var(--c);background:#120a24;color:var(--c);font:700 14px var(--mono);letter-spacing:0;text-align:center;overflow:hidden;word-break:break-all}
.sgP.sm{width:40px;height:40px;border-width:2px}
#sgComms{position:absolute;z-index:26;left:0;top:0;max-width:min(92%,520px);box-sizing:border-box;padding:6px 10px;border-left:3px solid var(--c,#19e3ff);border-radius:0 8px 8px 0;background:#05030ca8;color:#fff;font:14px/1.3 var(--display);pointer-events:none;text-shadow:0 1px 2px #000;transition:opacity .25s}
#sgComms[hidden]{display:none}
#sgComms b{color:var(--c);font:700 14px var(--mono);letter-spacing:.08em;margin-right:6px}
#sgTile{display:flex;flex-direction:column;align-items:flex-start;gap:2px;width:100%;max-width:440px;min-height:52px;margin:8px auto 0;padding:6px 14px;box-sizing:border-box;border:1px solid #5a4a7a;border-left:4px solid #ffb020;border-radius:10px;background:#0d0720cc;color:var(--ink);font:700 14px var(--mono);letter-spacing:.08em;text-align:left;cursor:pointer}
#sgTile small{font:14px var(--mono);color:var(--dim);letter-spacing:.02em;font-weight:400}
#sgTile b{color:#ffb020}
#sgLog{position:absolute;inset:0;z-index:62;display:flex;flex-direction:column;align-items:center;gap:8px;padding:12px 4%;box-sizing:border-box;background:#05030c}
#sgLog[hidden]{display:none}
#sgLog h2{margin:0;font:700 22px var(--display);letter-spacing:.14em}
#sgLog .sgsum{font:14px var(--mono);color:var(--dim)}
#sgList{flex:1 1 auto;min-height:0;width:100%;max-width:560px;overflow-y:auto;list-style:none;margin:0;padding:0 0 8px}
#sgList li{margin:0 0 8px;padding:10px 12px;border-left:3px solid var(--c,#5a4a7a);border-radius:0 10px 10px 0;background:#0d0720}
#sgList li.lock{opacity:.6}
#sgList .ct{display:flex;justify-content:space-between;gap:8px;font:700 15px var(--display);letter-spacing:.06em;color:var(--c,#fff)}
#sgList .ct small{font:14px var(--mono);color:var(--dim);font-weight:400}
#sgList .cl{font:14px/1.4 var(--display);color:var(--ink);margin-top:4px}
#sgList .cr{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
#sgList .cr button{min-height:44px;padding:0 12px;border:1px solid #5a4a7a;border-radius:8px;background:#120a24;color:var(--ink);font:700 14px var(--mono);letter-spacing:.06em;cursor:pointer}
#sgLog .back{width:100%;max-width:560px;min-height:48px;flex:0 0 auto}
#stres .sr.sgso{color:var(--ink);font-size:14px;line-height:1.35;margin-top:6px;max-width:34em}
#stres .sr.sgso b{color:#ffb020;font-weight:700}
`;document.head.appendChild(st);}
 const reduceMo=()=>{try{return !!(RM||SET.rm||matchMedia('(prefers-reduced-motion: reduce)').matches);}catch(e){return false;}};
 /* ----- the scene card: a list of cards, tap / Space = next, SKIP / Escape = end ----- */
 const card=document.createElement('div');card.id='sgCard';card.hidden=true;card.tabIndex=0;card.setAttribute('role','dialog');card.setAttribute('aria-modal','true');card.setAttribute('aria-label','Story');
 card.innerHTML='<div class="sgc" id="sgC" aria-live="polite"></div>';stage.appendChild(card);
 const K={on:false,cards:[],i:0,done:null,auto:0,tm:0,back:null,kind:''};
 function paint(){const c=K.cards[K.i],box=$('sgC');clearTimeout(K.tm);box.textContent='';
   card.classList.toggle('brief',!!c.brief);card.style.backgroundImage=c.bg?'url('+c.bg+')':'none';
   const wo=c.brief?{c:'#ffb020'}:whoOf(c.who);box.style.setProperty('--c',wo.c);
   const add=(cls,html,txt)=>{const d=document.createElement('div');d.className=cls;if(html!=null)d.innerHTML=html;if(txt!=null)d.textContent=txt;box.appendChild(d);return d;};
   if(c.head)add('sgch',null,c.head);
   if(c.brief){const h=add('sgh',null,c.brief.name);const sm=document.createElement('small');sm.textContent=c.brief.where;h.appendChild(sm);add('sgg',null,'GOAL · '+c.brief.goal);
     const t=add('sgt');const a=document.createElement('div');a.textContent=c.l[0]||'';t.appendChild(a);if(c.l[1]){const b=document.createElement('div');b.className='sgnew';b.textContent=c.l[1];t.appendChild(b);}}
   else{const p=pic(wo);if(p)box.appendChild(p);if(wo.n){const n=add('sgn',null,wo.n);if(wo.role){const sm=document.createElement('small');sm.textContent=wo.role;n.appendChild(sm);}if(!p)n.style.gridColumn='1/-1';}
     const t=add('sgt');for(const l of c.l){const d=document.createElement('div');d.textContent=l;t.appendChild(d);}}
   if(K.auto&&!reduceMo()){const bar=add('sgbar');const i=document.createElement('i');bar.appendChild(i);i.style.transition='width '+K.auto+'ms linear';requestAnimationFrame(()=>requestAnimationFrame(()=>{i.style.width='100%';}));}
   const f=add('sgf');const sk=document.createElement('button');sk.type='button';sk.id='sgSkip';sk.textContent='SKIP';sk.setAttribute('aria-label','Skip story');
   const last=K.i===K.cards.length-1,dots=document.createElement('span');dots.className='sgdots';dots.textContent=K.cards.length>1?K.cards.map((x,j)=>j===K.i?'●':'○').join(''):'';
   const nx=document.createElement('span');nx.innerHTML='<b style="color:var(--ink);font-weight:400">'+(c.brief?'tap to start':last?'tap to close':'tap to continue')+'</b> ▸';
   f.append(sk,dots,nx);sk.addEventListener('click',e=>{e.stopPropagation();close();});
   if(K.auto)K.tm=setTimeout(adv,K.auto);}
 function adv(){if(!K.on)return;if(K.i<K.cards.length-1){K.i++;paint();return;}close();}
 function close(){if(!K.on)return;clearTimeout(K.tm);K.on=false;card.hidden=true;const d=K.done;K.done=null;
   if(K.back&&K.back.focus&&document.contains(K.back)){try{K.back.focus();}catch(e){}}NR.emit('sagaClose',{kind:K.kind});if(d)d();}
 /* play(cards, done, {auto:ms, kind}): false when it cannot open (a run is on or a card is open) */
 function play(cards,done,o){o=o||{};if(running||K.on||!cards||!cards.length)return false;
   K.on=true;K.cards=cards;K.i=0;K.done=done||null;K.auto=o.auto||0;K.kind=o.kind||'';K.back=document.activeElement;card.hidden=false;paint();
   setTimeout(()=>{if(K.on)card.focus();},0);NR.emit('sagaOpen',{kind:K.kind,n:cards.length});return true;}
 card.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('#sgSkip'))return;adv();});
 addEventListener('keydown',e=>{if(!K.on)return;
   if(e.code==='Space'||e.code==='Enter'||e.code==='NumpadEnter'){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)adv();}
   else if(e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();}},true);
 /* ----- scenes from the data ----- */
 const rowsOf=t=>BYT[t]||[];
 const chHead=c=>'CHAPTER '+c+'/'+CHN+' · '+STORY_CH[c-1][0];
 const cardsOf=(t,bg,head)=>rowsOf(t).map(r=>({who:r.who,l:r.l,bg,head}));
 function briefCard(n){const r=rowsOf('brief:'+n)[0],s=STAGES[n-1];if(!r||!s)return null;const D=athens(s.di);
   return{brief:{name:'STAGE '+n+' · '+s.name,where:D.name+' · '+D.sub,goal:goalTxt(s)},l:r.l,bg:bgFor(s.di),head:chHead(r.ch)};}
 const openingCards=()=>cardsOf('open',bgFor(0),'FRANKFURT · 2099');
 const endCards=c=>{const out=cardsOf('end:'+c,bgFor(diOfCh(c)),chHead(c)+' · END');if(c===CHN)out.push(...cardsOf('epi',bgFor(DISTRICTS.length-1),'EPILOGUE'),...cardsOf('credits',bgFor(0),'CREDITS'));return out;};
 /* ----- before a story stage: the opening (once) and the stage briefing (first time) ----- */
 {const ss=startStory;startStory=function(n){if(running||!SG_AUTO||K.on)return ss.apply(this,arguments);const a=arguments,go=()=>{if(!running)ss.apply(this,a);};
   const q=[];let auto=0,kind='';
   if(!seen('open')&&n<=STORY_CH[0][2]){q.push(...openingCards());mark('open');auto=4200;kind='open';}
   if(n<=MAIN&&!seen('brief:'+n)){const b=briefCard(n);if(b){if(auto){/* the opening auto-advances; the briefing waits for a tap */}q.push(b);mark('brief:'+n);kind=kind||'brief';}}
   if(!q.length)return ss.apply(this,a);
   if(auto){const op=q.filter(c=>!c.brief),br=q.filter(c=>c.brief);if(play(op,()=>{if(!br.length||!play(br,go,{kind:'brief'}))go();},{auto,kind:'open'}))return;}
   else if(play(q,go,{kind}))return;
   return ss.apply(this,a);};}
 /* ----- in-stage comms: one line, 3 s, at the bottom of the playfield unless the ship is there (then near the top, below the HUD) ----- */
 const cm=document.createElement('div');cm.id='sgComms';cm.hidden=true;cm.setAttribute('role','status');cm.setAttribute('aria-live','polite');stage.appendChild(cm);
 const CM={q:[],t:0,raf:0,n:0,bars:0,mid:false};
 function shipRect(){const fr=frame.getBoundingClientRect(),k=fr.width/(rotMode?H:W);let x,y;
   if(rotMode){x=fr.left+P.y/H*fr.width;y=fr.bottom-P.x/W*fr.height;}else{x=fr.left+P.x/W*fr.width;y=fr.top+P.y/H*fr.height;}
   const r=Math.max(34,64*k);return{l:x-r,r:x+r,t:y-r,b:y+r,fr};}
 function place(){if(cm.hidden){CM.raf=0;return;}const sr=stage.getBoundingClientRect(),s=shipRect(),fr=s.fr,h=cm.offsetHeight,w=cm.offsetWidth;
   const left=Math.max(fr.left,sr.left)+8,c=[Math.min(fr.bottom,sr.bottom)-h-10,fr.top+fr.height*.24,fr.top+fr.height*.42,fr.top+fr.height*.6,fr.top+fr.height*.14];
   const obs=[s];for(const id of['bDash','bEmp','bPause']){const e=$(id);if(!e)continue;const q=e.getBoundingClientRect();if(q.width>0)obs.push({l:q.left,r:q.right,t:q.top,b:q.bottom});}   // the ship and the touch buttons
   const free=y=>obs.every(o=>y+h<o.t-4||y>o.b+4||left+w<o.l||left>o.r);
   let top=c[0];for(const y of c)if(free(y)){top=y;break;}
   cm.style.left=(left-sr.left)+'px';cm.style.top=(top-sr.top)+'px';CM.raf=requestAnimationFrame(place);}
 function comm(t){const r=rowsOf(t)[0];if(!r||seen('c:'+r.id))return;CM.q.push(r);if(!CM.t)nextComm();}
 function nextComm(){const r=CM.q.shift();if(!r||!running||G.dead){cm.hidden=true;CM.t=0;CM.q.length=0;return;}
   mark('c:'+r.id);const wo=whoOf(r.who);cm.style.setProperty('--c',wo.c);cm.textContent='';const b=document.createElement('b');b.textContent=wo.n;cm.append(b,document.createTextNode(r.l[0]));
   cm.hidden=false;if(!CM.raf)CM.raf=requestAnimationFrame(place);NR.emit('sagaComm',{id:r.id});
   CM.t=setTimeout(()=>{CM.t=0;cm.hidden=true;if(CM.q.length)CM.t=setTimeout(nextComm,400);},3000);}
 function commOff(){clearTimeout(CM.t);CM.t=0;CM.q.length=0;cm.hidden=true;}
 NR.on('runStart',d=>{commOff();CM.n=0;CM.bars=0;CM.mid=false;if(!SG_AUTO||!d||!d.story||d.story>MAIN)return;CM.n=d.story;setTimeout(()=>{if(running&&CM.n===d.story)comm('go:'+d.story);},1200);});
 NR.on('bar',()=>{if(!CM.n||!running)return;CM.bars++;if(!CM.mid&&CM.bars>=Math.floor((ST.len||46)/2)){CM.mid=true;comm('mid:'+CM.n);}});
 NR.on('bossIn',()=>{if(CM.n&&running)comm('boss:'+CM.n);});
 NR.on('stageClear',d=>{if(CM.n&&d&&d.n===CM.n){const s=STAGES[CM.n-1];if(s&&(s.goal.k==='boss'||s.goal.k==='mini'))comm('down:'+CM.n);}});
 NR.on('runEnd',d=>{const n=CM.n;CM.n=0;setTimeout(commOff,d&&d.cleared?2600:0);
   if(!d||!d.story||d.story>MAIN||!d.cleared)return;
   setTimeout(()=>sofar(d.story),0);
   const c=chOf(d.story);if(c&&d.story===STORY_CH[c-1][2]&&!seen('end:'+c)&&SG_AUTO){setTimeout(()=>{if(running||resEl.hidden||K.on)return;mark('end:'+c);play(endCards(c),null,{kind:'end'});},900);}});
 /* ----- result screen: the story so far ----- */
 function sofarText(n){const c=chOf(n);if(!c)return null;const done=chDone(c),r=rowsOf('sofar:'+(done?c:c-1))[0];
   return{c,txt:r?r.l[0]:rowsOf('brief:'+n)[0].l[0]};}
 function sofar(n){const box=$('srStars');if(!box||$('sgSofar'))return;const o=sofarText(n);if(!o)return;
   const d=document.createElement('div');d.className='sr sgso';d.id='sgSofar';const b=document.createElement('b');b.textContent='STORY · CHAPTER '+o.c+'/'+CHN+' ';d.append(b,document.createTextNode(o.txt));box.appendChild(d);}
 /* ----- the street run: its own arc, told through foot.js's before/after cards ----- */
 try{const FS=window.FOOT&&FOOT.STAGES&&FOOT.STAGES.street1;
   if(FS&&FS.tale&&window.TALE_CAST){const map={oda:'dispatch',lumen:'mechanic',wren:'ally',vex:'rival',courier:'courier'};
     for(const id in map)if(STORY_CAST[id]&&TALE_CAST[map[id]]){TALE_CAST[map[id]].n=STORY_CAST[id].n;TALE_CAST[map[id]].role=STORY_CAST[id].role;}
     FS.tale.before=rowsOf('foot:before').map(r=>[map[r.who]||r.who,r.l.join(' ')]);FS.tale.after=rowsOf('foot:after').map(r=>[map[r.who]||r.who,r.l.join(' ')]);}}catch(e){}
 NR.on('footStart',()=>mark('foot:before'));NR.on('footEnd',d=>{if(d&&d.cleared)mark('foot:after');});
 /* ----- the chapter list (STORY LOG) ----- */
 const log=document.createElement('div');log.id='sgLog';log.hidden=true;log.setAttribute('role','dialog');log.setAttribute('aria-label','Story');
 log.innerHTML='<h2>STORY</h2><div class="sgsum" id="sgSum"></div><ul id="sgList"></ul><button type="button" class="go back" id="sgBack">BACK</button>';stage.appendChild(log);
 function rb(lab,fn){const b=document.createElement('button');b.type='button';b.textContent=lab;b.addEventListener('click',e=>{e.stopPropagation();fn();});return b;}
 const replay=cards=>{if(!cards.length)return;log.hidden=true;play(cards,()=>{log.hidden=false;drawLog();},{kind:'replay'});};
 function drawLog(){const ul=$('sgList');ul.textContent='';const cur=curCh();let open=0;
   for(let c=1;c<=CHN;c++){const [t,a,b]=STORY_CH[c-1],on=chOpen(c),done=chDone(c),li=document.createElement('li');if(on)open++;
     li.className=on?'':'lock';li.dataset.ch=c;li.style.setProperty('--c',c===cur?'#ffb020':done?'#19e3ff':'#5a4a7a');
     const ct=document.createElement('div');ct.className='ct';const sp=document.createElement('span');sp.textContent=on?t:'???';const sm=document.createElement('small');sm.textContent='Chapter '+c+'/'+CHN+' · stages '+a+'-'+b;ct.append(sp,sm);li.appendChild(ct);
     const cl=document.createElement('div');cl.className='cl';const sf=rowsOf('sofar:'+c)[0];
     cl.textContent=!on?'Clear stage '+(a-1)+' to unlock':done&&sf?sf.l[0]:'In progress · '+rowsOf('brief:'+(b>=a?Math.min(b,Math.max(a,typeof mapCurrent==='function'?mapCurrent():a)):a))[0].l[0];li.appendChild(cl);
     if(on){const cr=document.createElement('div');cr.className='cr';
       if(c===1&&seen('open'))cr.appendChild(rb('OPENING',()=>replay(openingCards())));
       const bs=[];for(let n=a;n<=b;n++)if(seen('brief:'+n)){const k=briefCard(n);if(k)bs.push(k);}
       if(bs.length)cr.appendChild(rb('BRIEFINGS',()=>replay(bs)));
       if(done)cr.appendChild(rb(c===CHN?'ENDING + EPILOGUE':'CHAPTER END',()=>replay(endCards(c))));
       if(cr.children.length)li.appendChild(cr);}
     ul.appendChild(li);}
   {const li=document.createElement('li'),on=seen('foot:before');li.className=on?'':'lock';li.dataset.ch='foot';li.style.setProperty('--c',on?'#b6ff5a':'#5a4a7a');
     const ct=document.createElement('div');ct.className='ct';const sp=document.createElement('span');sp.textContent='STREET RUN · THE KEY';const sm=document.createElement('small');sm.textContent='on foot · Zeil';ct.append(sp,sm);li.appendChild(ct);
     const cl=document.createElement('div');cl.className='cl';cl.textContent=seen('foot:after')?rowsOf('sofar:foot')[0].l[0]:on?'In progress · '+rowsOf('foot:before')[0].l[0]:'Play the street run (MENU) to unlock';li.appendChild(cl);
     if(on){const cr=document.createElement('div');cr.className='cr';cr.appendChild(rb('BEFORE',()=>replay(cardsOf('foot:before',bgFor(0),'STREET RUN'))));if(seen('foot:after'))cr.appendChild(rb('AFTER',()=>replay(cardsOf('foot:after',bgFor(0),'STREET RUN'))));li.appendChild(cr);}
     ul.appendChild(li);}
   $('sgSum').textContent=chHead(cur)+' · '+open+' of '+CHN+' chapters open';
   const cu=ul.querySelector('li[data-ch="'+cur+'"]');if(cu&&cu.scrollIntoView)cu.scrollIntoView({block:'center'});}
 let logBack=null;
 function openLog(){if(running||K.on)return false;logBack=document.activeElement;drawLog();log.hidden=false;$('sgBack').focus();return true;}
 function closeLog(){if(log.hidden)return;log.hidden=true;if(logBack&&logBack.focus&&document.contains(logBack)){try{logBack.focus();}catch(e){}}}
 $('sgBack').addEventListener('click',closeLog);
 addEventListener('keydown',e=>{if(!log.hidden&&!K.on&&e.code==='Escape'){closeLog();e.stopImmediatePropagation();e.preventDefault();}},true);
 /* ----- HOME tile + MENU button ----- */
 function tileDraw(){const t=$('sgTile');if(!t)return;const c=curCh();t.innerHTML='<span>STORY · <b>CHAPTER '+c+'/'+CHN+'</b></span><small></small>';t.querySelector('small').textContent=STORY_CH[c-1][0]+(chDone(CHN)?' · complete':'');}
 function install(k){const slot=document.querySelector('[data-hook="hub-story-slot"],#hub-story-slot'),main=$('ttMain');
   if(!slot&&!main){if(k<40)setTimeout(()=>install(k+1),50);return;}
   if(!$('sgTile')){const t=document.createElement('button');t.type='button';t.id='sgTile';t.className='hub-story';t.addEventListener('click',()=>{if(!running)openLog();});
     if(slot)slot.appendChild(t);else main.after(t);tileDraw();}
   const g=document.querySelector('#mnMore .mg');if(g&&!$('sgBtn')){const b=document.createElement('button');b.type='button';b.className='go alt';b.id='sgBtn';b.textContent='STORY LOG';b.addEventListener('click',()=>{if(!running)openLog();});g.append(b);}
   if(RET.titleDraw&&!RET.titleDraw.sg){const o=RET.titleDraw;RET.titleDraw=function(){const r=o.apply(this,arguments);tileDraw();return r;};RET.titleDraw.sg=1;}}
 setTimeout(()=>install(0),0);
 NR.on('runEnd',()=>setTimeout(tileDraw,0));
 window.SAGA={rows:ROWS,ch:STORY_CH,cast:STORY_CAST,save:SV,play,close,openLog,closeLog,seen,comm,chOf,curCh,briefCard,endCards,openingCards,get open(){return K.on;},get kind(){return K.kind;},auto:SG_AUTO,
   t:{run:()=>running,ship:shipRect,finish:()=>ST.finish(),start:n=>startStory(n),fail:()=>ST.fail(),boss:()=>NR.emit('bossIn',{}),bar:k=>{for(let i=0;i<k;i++)NR.emit('bar',{});},stageLen:()=>ST.len}};
}
