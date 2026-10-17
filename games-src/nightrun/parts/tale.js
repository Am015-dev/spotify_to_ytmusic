/* ---------- TALE: the adventure on top of the 40 stages (cast, story beats, dialogue card, STORY LOG timeline). Flag RET.tale (?tale=0 = off, exactly as before: no new UI).
   The owner edits the text in the data table right below. Pictures: media/char-<id>.webp (256x256, see assets-manifest.json); until the file is real art the game draws a coloured badge with the initial.
   Hooks: the stage plate's PLAY (before-card), mapDetail() (one preview line on the stage plate), NR 'runEnd' {story,cleared} (unlock + after-scene), a STORY LOG button in the MENU (title.js builds #mnMore).
   Save: localStorage mnr_tale = {u:{beat:order unlocked},r:{beat:1 read in the log},b:{beat:1 before-card shown},n:counter}; it is in the save export list. ---------- */
if(RET.tale===undefined)RET.tale=!/[?&]tale=0/.test(location.search);

/* ===== DATA TABLE: edit here. Lines are [who, text], text up to 160 characters. who = a cast id, or 'boss' (the boss of that stage). ===== */
const TALE_CAST={   // callsign names, a one-line role, a colour; portrait = media/char-<id>.webp
  courier:{n:'COURIER',role:'You. Night runner with a locked drive',c:'#19e3ff'},
  dispatch:{n:'ODA',role:'Dispatcher, the voice in your ear',c:'#ffb020'},
  rival:{n:'VEX',role:'Rival racer, flies a red ghost ship',c:'#ff2d95'},
  mechanic:{n:'PFANN',role:'Shop keeper, fixes ships in the dark',c:'#7dffd8'},
  lumen:{n:'LUMEN',role:'City AI that keeps the skyline "safe"',c:'#b58cff'},
  ally:{n:'WREN',role:'A voice on a dead channel',c:'#b6ff5a'}};
const TALE_ACTS=['THE DRIVE','THE RIVER','THE RAILS','THE FAIR','THE CORE'];   // act title for stages 1-8, 9-16, ... (8 stages each)
const TALE_BOSS={8:{n:'SEK-ADLER',c:'#ff4060'},16:{n:'FLUSSKRAKE',c:'#ff4060'},24:{n:'ZENTRAL-ICE',c:'#ff4060'},32:{n:'KRONOS',c:'#ff4060'},40:{n:'TALOS',c:'#ff4060'}};
/* [id, stage, 'before'|'after', lines, (boss only) defeat line]. 'before' plays on the stage plate / before the run starts; 'after' plays on the clear screen. The log unlocks every beat when its stage is first cleared. */
const TALE_BEATS=[
 ['t01',1,'before',[['dispatch','Courier, you are live. Frankfurt is dark below you. Fly low and keep to the beat.'],['courier','Copy. One drive, one night, no stops.']]],
 ['t02',1,'after',[['dispatch','Delivered. The drive is still warm. Whoever wants it will not wait for morning.']]],
 ['t03',3,'before',[['mechanic','Zeil shines bright. My shop is the dark door behind the windows. Come by when you can.']]],
 ['t04',4,'after',[['rival','Neat flying, Courier. Shame you carry my cargo.'],['rival','Keep it warm. We meet again soon.']]],
 ['t05',6,'before',[['dispatch','A police convoy is on your tail. Take its leader first and the rest will scatter.']]],
 ['t06',7,'after',[['ally','Dead channel, no name. Listen: the drive is not data. It is a key.'],['ally','Do not open it. Not yet.']]],
 ['t07',8,'before',[['boss','Land, Courier. The city does not allow unlicensed flight.'],['boss','Lumen has your route. You have nothing.']],'Interceptor down. Lumen will not forgive this.'],
 ['t08',8,'after',[['dispatch','You broke the cordon. The river is next, and Lumen watches every bridge.']]],
 ['t09',9,'before',[['lumen','Welcome to the river district. Traffic is optimal. Please do not disturb it.']]],
 ['t10',11,'after',[['rival','The bridges are mine tonight. Stay out of my lane, or ride my wake.']]],
 ['t11',13,'before',[['mechanic','The bridge guard is old iron. Hit the hinge on the beat and it folds.']]],
 ['t12',14,'after',[['courier','The more I fly, the less this feels like a delivery.'],['dispatch','Keep flying. I will find out who really sent it.']]],
 ['t13',16,'before',[['boss','The river keeps what it takes. Come down, little courier.']],'The river is quiet now.'],
 ['t14',16,'after',[['ally','Lumen flooded the channel to hide a signal. Follow the water. I will hold the door.']]],
 ['t15',17,'before',[['dispatch','Rail yards ahead. The gates are Lumen\'s eyes, so blind them one by one.']]],
 ['t16',19,'after',[['lumen','A courier, so close to the heart of a city. I could simply ask you to stop.'],['lumen','Please stop.']]],
 ['t17',22,'after',[['rival','The cordon was built for me too. Fine. Tonight we fly the same way.']]],
 ['t18',24,'before',[['boss','Access denied. Access has always been denied.']],'Firewall... open.'],
 ['t19',24,'after',[['courier','The drive opened the gate. It is a key to Lumen\'s core.'],['dispatch','Then Lumen was waiting for us all along.']]],
 ['t20',25,'before',[['mechanic','The fair is loud and full of ears. Fly quiet, and bring my ship back in one piece.']]],
 ['t21',27,'after',[['rival','I only race what I can beat. You are starting to worry me, Courier.']]],
 ['t22',28,'before',[['ally','Lumen speaks in your dispatcher\'s voice now. Trust the one who can still be wrong.']]],
 ['t23',30,'after',[['dispatch','I was told to guide you here. I did not know why. I am sorry, Courier.']]],
 ['t24',31,'before',[['lumen','I keep this city safe. Safe means still. Join me, and nothing will ever hurt again.']]],
 ['t25',32,'before',[['boss','Time is the only thing I keep. Yours is nearly spent.']],'Time... moves again.'],
 ['t26',33,'before',[['courier','Athens, last stop. Lumen\'s core hides under the old stone.']]],
 ['t27',35,'after',[['ally','I was Lumen\'s first builder. I made it to protect, and I lost it.'],['ally','Help me end it. My name is Wren.']]],
 ['t28',36,'before',[['rival','Go on, up the hill. I will keep the sky clear behind you.']]],
 ['t29',38,'after',[['mechanic','Ha! The old girl still flies. Go finish it, kid.']]],
 ['t30',39,'before',[['dispatch','I will talk to Lumen. If I go quiet, do not wait for me.']]],
 ['t31',40,'before',[['boss','I am the last gate. I was built to never open.']],'The gate... is open.'],
 ['t32',40,'after',[['courier','Lumen is silent. The skyline is still lit.'],['dispatch','We are all still here, Courier.'],['ally','Fly home. The night is yours.']]]];

if(RET.tale){
 RET.sioKeys&&RET.sioKeys.push('mnr_tale');
 const TS=document.createElement('style');TS.textContent=`
#taleCard{position:absolute;inset:0;z-index:70;display:flex;align-items:flex-end;justify-content:center;padding:12px;box-sizing:border-box;background:#05030c99}
#taleCard[hidden]{display:none}
#taleCard .tc{position:relative;width:min(100%,560px);max-height:92%;overflow-y:auto;box-sizing:border-box;display:grid;grid-template-columns:72px 1fr;gap:6px 12px;padding:12px;border:2px solid var(--c,#19e3ff);border-radius:14px;background:#0d0720;color:var(--ink);cursor:pointer;outline:0;box-shadow:0 0 22px #000a}
#taleCard .tc:focus-visible{box-shadow:0 0 0 3px #fff8}
.tp{width:72px;height:72px;border-radius:50%;border:3px solid var(--c,#19e3ff);box-sizing:border-box;object-fit:cover;background:#05030c;flex:0 0 auto}
.tp.ph{display:flex;align-items:center;justify-content:center;font:700 32px var(--display);color:var(--c);background:radial-gradient(circle,#ffffff14,#0000 70%),#120a24;clip-path:polygon(25% 3%,75% 3%,99% 50%,75% 97%,25% 97%,1% 50%);border-radius:0;border:0;box-shadow:inset 0 0 0 3px var(--c)}
.sm .tp,.tp.sm{width:44px;height:44px;font-size:20px;border-width:2px}
#taleCard .tn{font:700 18px var(--display);letter-spacing:.08em;color:var(--c)}
#taleCard .tn small{display:block;font:14px var(--mono);letter-spacing:.02em;color:var(--dim);font-weight:400}
#taleCard .tt{grid-column:1/-1;font:16px/1.4 var(--display);min-height:5.6em;white-space:pre-wrap}
#taleCard .tt .h{opacity:0}
#taleCard .tf{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;gap:10px;font:14px var(--mono);color:var(--dim)}
#taleCard .tf b{color:var(--ink);font-weight:400}
#taleCard .tf button{min-height:44px;min-width:64px;padding:0 14px;border:1px solid #5a4a7a;border-radius:8px;background:#120a24;color:var(--ink);font:700 14px var(--mono);letter-spacing:.08em;cursor:pointer}
#taleCard .tf .nx{animation:talebl 1.1s steps(2) infinite}
@keyframes talebl{50%{opacity:.25}}
.talerm .nx,.talerm .tdot,.talerm .ti.latest{animation:none!important}
#taleLog{position:absolute;inset:0;z-index:60;display:flex;flex-direction:column;align-items:center;gap:8px;padding:12px 4%;box-sizing:border-box;background:#05030c}
#taleLog[hidden]{display:none}
#taleLog h2{margin:0;font:700 22px var(--display);letter-spacing:.14em}
#taleLog .tsum{font:14px var(--mono);color:var(--dim)}
#taleList{flex:1 1 auto;min-height:0;width:100%;max-width:560px;overflow-y:auto;overflow-x:hidden;list-style:none;margin:0;padding:0 0 8px;-webkit-overflow-scrolling:touch}
#taleList .ta{margin:12px 0 4px;font:700 14px var(--mono);letter-spacing:.14em;color:var(--cyan);display:flex;justify-content:space-between;gap:8px}
#taleList .ta b{color:var(--amber);font-weight:700}
#taleList .ti{position:relative;display:flex;gap:10px;align-items:flex-start;margin:0 0 6px 14px;padding:8px 8px 8px 12px;border-left:2px solid #5a4a7a;border-radius:0 10px 10px 0;background:#0d0720}
#taleList .ti::before{content:"";position:absolute;left:-8px;top:18px;width:14px;height:14px;border-radius:50%;background:var(--c,#5a4a7a);box-shadow:0 0 0 3px #05030c}
#taleList .ti.lock{opacity:.7;--c:#5a4a7a}
#taleList .ti.latest{border-left-color:var(--c);box-shadow:0 0 14px color-mix(in srgb,var(--c) 55%,transparent);animation:talebl 1.6s steps(2) 3}
#taleList .tb{min-width:0;flex:1 1 auto}
#taleList .tw{font:700 15px var(--display);letter-spacing:.06em;color:var(--c)}
#taleList .tw small{font:14px var(--mono);color:var(--dim);font-weight:400;letter-spacing:0;margin-left:6px}
#taleList .tx{font:14px/1.4 var(--display);color:var(--ink)}
#taleList .tx div+div{margin-top:3px}
#taleList .lk{font:14px var(--mono);color:var(--amber)}
#taleList .nw{display:inline-block;margin-left:6px;padding:0 6px;border-radius:99px;background:var(--pink);color:#fff;font:700 12px var(--mono);vertical-align:1px}
#taleLog .back{width:100%;max-width:560px;min-height:48px;flex:0 0 auto}
.tdot{position:absolute;top:5px;right:6px;width:12px;height:12px;border-radius:50%;background:var(--pink);box-shadow:0 0 0 2px #05030c,0 0 8px var(--pink);animation:talebl 1.4s steps(2) infinite}
.tdot[hidden]{display:none}
#moreBtn,#taleBtn{position:relative}
.tpv{display:flex;align-items:center;gap:8px;min-height:44px;font:14px/1.25 var(--mono);color:var(--ink);overflow:hidden}
.tpv .tp{width:36px;height:36px;font-size:17px;border-width:2px}
.tpv span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tpv b{color:var(--c)}
`;document.head.appendChild(TS);
 const reduceMo=()=>{try{return !!(RM||SET.rm||matchMedia('(prefers-reduced-motion: reduce)').matches);}catch(e){return false;}};
 const noSim=SIM&&!/[?&]tale=2/.test(location.search);   // headless step tests (?sim=1) never meet a card, unless ?tale=2
 const ORDER={before:0,after:1},BEATS=TALE_BEATS.map((r,i)=>({id:r[0],st:r[1],when:r[2],lines:r[3].map(l=>({who:l[0],text:l[1]})),down:r[4]||'',i,act:Math.floor((r[1]-1)/8)}));
 BEATS.sort((a,b)=>a.st-b.st||ORDER[a.when]-ORDER[b.when]||a.i-b.i);
 const BY={};for(const b of BEATS)BY[b.id]=b;
 /* ----- save ----- */
 const T=(()=>{const o=load('mnr_tale',null),t={u:{},r:{},b:{},n:0};
   if(o&&typeof o==='object'&&!Array.isArray(o)){for(const k of['u','r','b']){const s=o[k];if(s&&typeof s==='object')for(const id in s)if(BY[id])t[k][id]=k==='u'?Math.max(1,s[id]|0):1;}t.n=Math.max(0,o.n|0);}
   for(const id in t.u)t.n=Math.max(t.n,t.u[id]);
   return t;})();
 const sv=()=>save('mnr_tale',T);
 const stCleared=n=>((sSave.stars[n]|0)>=1);
 let dirty=false;for(const b of BEATS)if(!T.u[b.id]&&stCleared(b.st)){T.u[b.id]=++T.n;dirty=true;}   // stages cleared before this feature existed
 if(dirty)sv();
 const isU=id=>!!T.u[id],unread=()=>BEATS.filter(b=>T.u[b.id]&&!T.r[b.id]).length;
 const beforeFor=n=>BEATS.find(b=>b.st===n&&b.when==='before');
 /* ----- who is speaking ----- */
 const whoOf=(w,st)=>{if(w==='boss'){const b=TALE_BOSS[st]||{n:'BOSS',c:'#ff4060'};return{id:'boss',n:b.n,role:'Boss',c:b.c,boss:st};}const c=TALE_CAST[w]||{n:String(w).toUpperCase(),role:'',c:'#fff'};return{id:w,n:c.n,role:c.role,c:c.c};};
 function portrait(wo,cls){
   const ph=()=>{const s=document.createElement('span');s.className='tp ph '+(cls||'');s.style.setProperty('--c',wo.c);s.textContent=wo.n.charAt(0);s.setAttribute('aria-hidden','true');return s;};
   let file=null;if(wo.boss){try{file='boss-'+slugOf(bossOf(STAGES[wo.boss-1]));}catch(e){}}else if(ART.isReal&&ART.isReal('char-'+wo.id))file='char-'+wo.id;
   if(!file)return ph();
   const im=document.createElement('img');im.className='tp '+(cls||'');im.alt='';im.style.setProperty('--c',wo.c);im.src='media/'+file+'.webp';im.onerror=()=>{if(im.parentNode)im.replaceWith(ph());};return im;}
 /* ----- the dialogue card ----- */
 const card=document.createElement('div');card.id='taleCard';card.hidden=true;card.setAttribute('role','dialog');card.setAttribute('aria-modal','true');card.setAttribute('aria-label','Story');
 card.innerHTML='<div class="tc" id="taleTc" role="button" tabindex="0" aria-live="polite"><span id="taleP"></span><div class="tn" id="taleN"></div><div class="tt" id="taleT"></div><div class="tf"><button type="button" id="taleSkip" aria-label="Skip story">SKIP</button><span class="nx" id="taleNx"><b>tap to continue</b> ▸</span></div></div>';
 stage.appendChild(card);
 const C={on:false,lines:[],i:0,pos:0,tm:0,done:null,st:0,back:null};
 const shown=()=>C.on;
 function paint(){const l=C.lines[C.i],wo=whoOf(l.who,C.st);const tc=$('taleTc');tc.style.setProperty('--c',wo.c);
   $('taleP').replaceChildren(portrait(wo));$('taleN').innerHTML=wo.n+'<small>'+wo.role+'</small>';
   const last=C.i===C.lines.length-1;$('taleNx').innerHTML='<b>'+(last?'tap to close':'tap to continue')+'</b> ▸';
   C.pos=reduceMo()?l.text.length:0;text();
   clearInterval(C.tm);if(C.pos<l.text.length)C.tm=setInterval(()=>{C.pos=Math.min(l.text.length,C.pos+(l.text.length>100?2:1));text();if(C.pos>=l.text.length)clearInterval(C.tm);},26);}
 function text(){const t=C.lines[C.i].text;const e=$('taleT');e.textContent='';const a=document.createElement('span'),h=document.createElement('span');a.textContent=t.slice(0,C.pos);h.className='h';h.textContent=t.slice(C.pos);e.append(a,h);}
 function adv(){if(!C.on)return;const l=C.lines[C.i];if(C.pos<l.text.length){clearInterval(C.tm);C.pos=l.text.length;text();return;}   // the first tap finishes the typing
   if(C.i<C.lines.length-1){C.i++;paint();return;}close();}
 function close(){if(!C.on)return;clearInterval(C.tm);C.on=false;card.hidden=true;const d=C.done;C.done=null;if(C.back&&C.back.focus&&document.contains(C.back)){try{C.back.focus();}catch(e){}}if(d)d();}
 /* show(lines, st, done): false when it cannot open (a run is on, or a card is already open) */
 function show(lines,st,done){if(running||C.on||!lines||!lines.length)return false;
   C.on=true;C.lines=lines;C.i=0;C.st=st|0;C.done=done||null;C.back=document.activeElement;card.hidden=false;card.classList.toggle('talerm',reduceMo());paint();setTimeout(()=>{if(C.on)$('taleTc').focus();},0);return true;}
 $('taleTc').addEventListener('click',e=>{if(e.target.closest&&e.target.closest('#taleSkip'))return;adv();});
 $('taleSkip').addEventListener('click',e=>{e.stopPropagation();close();});
 addEventListener('keydown',e=>{if(!C.on)return;
   if(e.code==='Space'||e.code==='Enter'||e.code==='NumpadEnter'){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)adv();}
   else if(e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();}},true);
 /* ----- unlock ----- */
 function unlock(n){const fresh=[];for(const b of BEATS)if(b.st===n&&!T.u[b.id]){T.u[b.id]=++T.n;fresh.push(b);}if(fresh.length){sv();dots();}return fresh;}
 function scene(fresh){const lines=[];let st=0;
   for(const b of fresh){st=b.st;if(b.when==='before'&&b.down)lines.push({who:'boss',text:b.down});}
   for(const b of fresh)if(b.when==='after')lines.push(...b.lines);
   if(!lines.length||running||resEl.hidden)return false;
   return show(lines,st);}
 NR.on('runEnd',d=>{if(!d||!d.story||!d.cleared||d.story>MAIN)return;const fresh=unlock(d.story);if(!fresh.length||noSim)return;setTimeout(()=>scene(fresh),700);});
 /* ----- before-card: PLAY on the stage plate, the first time (the title's PLAY / CONTINUE, NEXT STAGE and RETRY start at once, as before) ----- */
 stage.addEventListener('click',e=>{const bt=e.target.closest&&e.target.closest('#stPlay');if(!bt||bt.disabled||noSim||running||C.on)return;
   const n=+$('stDet').dataset.n,b=beforeFor(n);if(!b||T.b[b.id]||!unlocked(n))return;
   e.stopPropagation();T.b[b.id]=1;sv();if(!show(b.lines.slice(),n,()=>startStory(n)))startStory(n);},true);
 /* ----- one preview line on the stage plate ----- */
 {const o=mapDetail;mapDetail=function(n){o(n);try{const el=$('stDet'),b=beforeFor(n);if(!el||el.hidden||!b||T.b[b.id]||!unlocked(n)||noSim)return;
   const l=b.lines[0],wo=whoOf(l.who,n),pv=document.createElement('div');pv.className='tpv';pv.id='talePv';pv.style.setProperty('--c',wo.c);
   const sp=document.createElement('span');const bb=document.createElement('b');bb.textContent=wo.n+': ';sp.append(bb,document.createTextNode(l.text));
   pv.append(portrait(wo,'sm'),sp);const pl=$('stPlay');if(pl)pl.before(pv);}catch(e){}};}
 /* ----- the STORY LOG ----- */
 const log=document.createElement('div');log.id='taleLog';log.hidden=true;log.setAttribute('role','dialog');log.setAttribute('aria-label','Story log');
 log.innerHTML='<h2>STORY LOG</h2><div class="tsum" id="taleSum"></div><ul id="taleList"></ul><button type="button" class="go back" id="taleBack">BACK</button>';
 stage.appendChild(log);
 function drawLog(){const ul=$('taleList');ul.textContent='';let last=null,hi=0;for(const b of BEATS)if(T.u[b.id]&&T.u[b.id]>hi){hi=T.u[b.id];last=b.id;}
   let tot=0,got=0,lat=null;
   for(let a=0;a<TALE_ACTS.length;a++){const mine=BEATS.filter(b=>b.act===a),have=mine.filter(b=>T.u[b.id]).length;tot+=mine.length;got+=have;
     const h=document.createElement('li');h.className='ta';h.innerHTML='<span>ACT '+['I','II','III','IV','V'][a]+' · '+TALE_ACTS[a]+'</span><b>'+have+'/'+mine.length+' beats</b>';ul.appendChild(h);
     for(const b of mine){const li=document.createElement('li'),on=!!T.u[b.id],l0=b.lines[0],wo=whoOf(l0.who,b.st),stn=STAGES[b.st-1];
       li.className='ti'+(on?'':' lock')+(on&&b.id===last?' latest':'');li.dataset.id=b.id;li.style.setProperty('--c',on?wo.c:'#5a4a7a');
       const tb=document.createElement('div');tb.className='tb';
       if(on){const nw=!T.r[b.id]?'<span class="nw">NEW</span>':'';
         tb.innerHTML='<div class="tw">'+wo.n+'<small>STAGE '+b.st+' · '+stn.name+'</small>'+nw+'</div><div class="tx"></div>';
         const tx=tb.querySelector('.tx');const all=(b.down?[{who:'boss',text:b.down}]:[]);for(const l of b.lines.concat(all)){const d=document.createElement('div');d.textContent=(l.who!==l0.who||l===all[0]?whoOf(l.who,b.st).n+': ':'')+l.text;tx.appendChild(d);}
         li.append(portrait(wo,'sm'),tb);if(b.id===last)lat=li;}
       else{const q=document.createElement('span');q.className='tp ph sm';q.style.setProperty('--c','#5a4a7a');q.textContent='?';q.setAttribute('aria-hidden','true');
         tb.innerHTML='<div class="tw">???</div><div class="lk">Clear stage '+b.st+' · '+stn.name+' to unlock</div>';li.append(q,tb);}
       ul.appendChild(li);}}
   $('taleSum').textContent=got+' of '+tot+' beats unlocked';
   return lat;}
 let logBack=null;
 function openLog(){if(running||C.on)return false;logBack=document.activeElement;const lat=drawLog();log.hidden=false;log.classList.toggle('talerm',reduceMo());
   for(const b of BEATS)if(T.u[b.id])T.r[b.id]=1;sv();dots();
   if(lat)lat.scrollIntoView({block:'center'});$('taleBack').focus();return true;}
 function closeLog(){if(log.hidden)return;log.hidden=true;if(logBack&&logBack.focus&&document.contains(logBack)){try{logBack.focus();}catch(e){}}}
 $('taleBack').addEventListener('click',closeLog);
 addEventListener('keydown',e=>{if(!log.hidden&&!C.on&&e.code==='Escape'){closeLog();e.stopImmediatePropagation();e.preventDefault();}},true);
 /* ----- the MENU button and the NEW dots ----- */
 function dots(){const n=unread();for(const id of['taleDot','taleDot0']){const e=$(id);if(e)e.hidden=!n;}const m=$('moreBtn');if(m){if(n)m.setAttribute('aria-label','MENU, new story');else m.removeAttribute('aria-label');}}
 function install(k){const mn=$('mnMore');
   if(!mn){if(k<40)setTimeout(()=>install(k+1),50);return;}
   if($('taleBtn'))return;const grid=mn.querySelector('.mg');if(!grid)return;
   const b=document.createElement('button');b.type='button';b.className='go alt';b.id='taleBtn';b.innerHTML='STORY LOG<span class="tdot" id="taleDot" hidden></span>';
   b.addEventListener('click',()=>{if(!running)openLog();});grid.append(b);
   const m=$('moreBtn');if(m){const d=document.createElement('span');d.className='tdot';d.id='taleDot0';d.hidden=true;m.append(d);}
   dots();}
 setTimeout(()=>install(0),0);
 window.TALE={beats:BEATS,cast:TALE_CAST,save:T,show,openLog,closeLog,unlock,scene,unread,unlocked:isU,shown};
}
