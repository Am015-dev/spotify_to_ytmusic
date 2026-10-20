/* ---------- LESSONS: short tactics lessons the first time a feature appears (owner, 20 Oct 2026: "better tutorials teaching tactics when they appear first
   time ... users can practice"). Flag RET.lessons (default ON; ?lessons=0 = the old game: no lesson, no LESSONS button).
   Six lessons: weapons (first WEAPONS sheet / Garage WEAPONS tab), merge (first Garage FORGE tab), slots (next FORGE / first LOAD tab), ship (first Garage
   SHIPS tab), counter (first story stage >= 3, where plated and shielded foes start), timing (first story stage >= 2 when FLIGHT SCHOOL was not finished).
   Each lesson = 2-3 short cards, then a PRACTICE: a tiny sandbox made of shapes (triangles, circles) in its own overlay. Nothing in it touches the run,
   the hull, Neon, the forge save or the stats: a lesson only opens while no run is live, and the only thing it writes is mnr_lessons {id: 1 seen, 2 practised}.
   SKIP is on every card. Replay: MENU > LESSONS. Auto-show is off under a test driver unless ?lessons=1. Test: nightrun/lessons-test.js. */
if(RET.lessons===undefined)RET.lessons=!/[?&]lessons=0/.test(location.search);
const LS={cur:null,i:0,pr:null,done:null,log:[],raf:0,get on(){return!!RET.lessons;},auto:!!RET.lessons&&(!navigator.webdriver||/[?&]lessons=1/.test(location.search))};
LS.seen=()=>load('mnr_lessons',{})||{};
LS.mark=(id,v)=>{const s=LS.seen();if((s[id]|0)<v){s[id]=v;save('mnr_lessons',s);}};
/* shapes (placeholders until painted art exists): tri = a weapon / ship, dot = a foe, ring = a shield, bar = a front plate, dia = a core */
const lsS=(k,c,z)=>{z=z||34;const h=z/2,sv=b=>`<svg width="${z}" height="${z}" viewBox="0 0 ${z} ${z}" aria-hidden="true">${b}</svg>`;
  if(k==='tri')return sv(`<path d="M${z*.12} ${z*.15}L${z*.9} ${h}L${z*.12} ${z*.85}Z" fill="${c}"/>`);
  if(k==='dot')return sv(`<circle cx="${h}" cy="${h}" r="${z*.3}" fill="${c}"/>`);
  if(k==='ring')return sv(`<circle cx="${h}" cy="${h}" r="${z*.24}" fill="${c}"/><circle cx="${h}" cy="${h}" r="${z*.44}" fill="none" stroke="#4ad1ff" stroke-width="3"/>`);
  if(k==='bar')return sv(`<circle cx="${z*.6}" cy="${h}" r="${z*.26}" fill="${c}"/><rect x="${z*.08}" y="${z*.12}" width="${z*.14}" height="${z*.76}" fill="#c9d3e0"/>`);
  if(k==='dia')return sv(`<path d="M${h} ${z*.08}L${z*.92} ${h}L${h} ${z*.92}L${z*.08} ${h}Z" fill="${c}"/>`);
  return '';};
const lsRow=(...a)=>'<div class="ar">'+a.join('')+'</div>',lsN=(k,c,n,z)=>Array.from({length:n},()=>lsS(k,c,z)).join('');
const lsW=id=>(typeof WPD!=='undefined'&&WPD[id]&&WPD[id].c)||'#ff8ad8',lsWS=id=>(typeof WPD!=='undefined'&&WPD[id]&&WPD[id].s)||id.toUpperCase();
const lsRecipe=(a,b)=>{if(typeof FGR==='undefined')return null;const r=FGR.find(r=>(r[0]===a&&r[1]===b)||(r[0]===b&&r[1]===a));return r?r[3]:null;};
const FOE='#ff5a7a';
const LSN=[
 {id:'weapons',n:'WEAPONS',cards:[
   ['EVERY WEAPON HAS A JOB',lsRow(lsS('tri',lsW('pulse')),lsS('tri',lsW('laser')),lsS('tri',lsW('swarm'))),'PULSE spreads wide, LANCE pierces a line, SWARM hunts the nearest foe.'],
   ['READ THE WAVE',lsRow(lsN('dot',FOE,3,22),'<i>&rarr;</i>',lsS('tri',lsW('laser'))),'Foes in a line: pierce them. A wide crowd: spread. Fast dodgers: homing.'],
   ['YOU HAVE TWO SLOTS',lsRow(lsS('tri',lsW('pulse')),'<b>+</b>',lsS('tri',lsW('laser'))),'Fill both with different jobs so no wave catches you out.']],
  pr:{type:'pick',rounds:[
   {q:'Three foes in a line. Which weapon?',art:lsRow(lsS('tri','#19e3ff'),'<i>&rarr;</i>',lsN('dot',FOE,3,24)),opts:['pulse','laser','swarm'],ok:'laser',why:'LANCE pierces the whole line'},
   {q:'A wide crowd. Which weapon?',art:lsRow(lsS('tri','#19e3ff'),'<span class="cr">'+lsN('dot',FOE,6,18)+'</span>'),opts:['laser','swarm','pulse'],ok:'pulse',why:'PULSE spread covers the crowd'}]}},
 {id:'merge',n:'MERGE',cards:[
   ['TWO WEAPONS, ONE HYBRID',lsRow(lsS('tri',lsW('pulse')),'<b>+</b>',lsS('tri',lsW('swarm')),'<i>&rarr;</i>',lsS('tri','#ffe14d',40)),'Garage FORGE: two weapons you own + 3 scrap + 120 Neon make a hybrid.'],
   ['ONLY SOME PAIRS MERGE',lsRow(lsS('tri',lsW('pulse')),'<b>+</b>',lsS('tri',lsW('swarm')),'<i>= SEED FAN</i>'),'Each pair has one recipe. The hybrid keeps the first weapon\'s shots and adds a trick.'],
   ['WHEN TO MERGE',lsRow(lsS('tri','#ffe14d',40)),'Merge when you know your stage: a hybrid frees a slot for a second job.']],
  pr:{type:'merge',tiles:['pulse','laser','swarm']}},
 {id:'slots',n:'SLOTS',cards:[
   ['YOUR LOADOUT',lsRow(lsS('tri',lsW('pulse')),lsS('tri',lsW('laser')),lsS('dia','#3dffb0'),lsS('dot','#ffe14d')),'2 weapon slots, 1 core, 1 passive. Each slot takes one kind only.'],
   ['CORE AND PASSIVE',lsRow(lsS('dia','#3dffb0'),lsS('dot','#ffe14d')),'A core changes your DASH and EMP. A passive helps all run long.'],
   ['MODS',lsRow(lsS('tri',lsW('laser')),'<b>+</b>',lsS('dot','#c08aff',20),lsS('dot','#c08aff',20)),'A plain weapon takes 2 mods, a hybrid 1. Mods trade damage for an effect.']],
  pr:{type:'equip'}},
 {id:'ship',n:'SHIPS',cards:[
   ['EACH SHIP FIRES ITS WAY',lsRow(lsS('tri','#19e3ff'),lsS('tri','#ffb020'),lsS('tri','#ff3d6a'),lsS('tri','#b6ff5a')),'Courier: steady. Triplet: bursts of 3. Heavy: a piercing blast every 2 beats. Echo: every shot repeats.'],
   ['PICK FOR THE STAGE',lsRow(lsS('tri','#ff3d6a'),'<i>&rarr;</i>',lsS('bar',FOE,40)),'Big tough foes and bosses: Heavy. Many small ones: Triplet or Echo.']],
  pr:{type:'pick',rounds:[
   {q:'A stage of armoured foes and a boss. Which ship?',art:lsRow(lsS('tri','#19e3ff'),'<i>&rarr;</i>',lsS('bar',FOE,40)),opts:['std','hv','tri'],ok:'hv',why:'Heavy\'s piercing blast breaks tough foes',ship:1}]}},
 {id:'counter',n:'COUNTERS',cards:[
   ['PLATED FOES',lsRow(lsS('tri','#19e3ff'),'<i>&rarr;</i>',lsS('bar',FOE,40)),'A front plate takes only a third of your damage. Fly to its side, or EMP.'],
   ['SHIELDED FOES',lsRow(lsS('ring',FOE,40)),'A shield eats damage first. EMP strips it, then any weapon works.'],
   ['SWARMS',lsRow('<span class="cr">'+lsN('dot',FOE,6,18)+'</span>'),'Many small foes: a wide weapon (PULSE, FLAME, WAVE) clears them.']],
  pr:{type:'pick',rounds:[
   {q:'A plated foe faces you. What do you do?',art:lsRow(lsS('tri','#19e3ff'),'<i>&rarr;</i>',lsS('bar',FOE,40)),opts:['front','side','wait'],ok:'side',why:'From the side the plate does not cover it'},
   {q:'A shielded foe. What do you do?',art:lsRow(lsS('ring',FOE,40)),opts:['emp','front','dash'],ok:'emp',why:'EMP strips the shield'},
   {q:'A swarm. Which weapon?',art:lsRow('<span class="cr">'+lsN('dot',FOE,6,18)+'</span>'),opts:['laser','pulse','swarm'],ok:'pulse',why:'A wide spread clears the swarm'}]}},
 {id:'timing',n:'TIMING',cards:[
   ['DASH ON THE BEAT',lsRow(lsS('tri','#19e3ff'),'<i>&harr;</i>'),'A ring closes on your ship each beat. DASH as it touches: a perfect dash goes through bullets.'],
   ['SAVE YOUR EMP',lsRow(lsS('dot','#3dffb0',40)),'EMP clears bullets and strips shields. Keep it for a wall of bullets or a shielded pack.']],
  pr:{type:'beat',need:2}}];
const LS_OPT={pulse:['tri','PULSE'],laser:['tri','LANCE'],swarm:['tri','SWARM'],std:['tri','COURIER'],hv:['tri','HEAVY'],tri:['tri','TRIPLET'],
  front:['tri','SHOOT FRONT'],side:['tri','FLY TO SIDE'],wait:['dot','WAIT'],emp:['dot','EMP'],dash:['tri','DASH']};
const LS_OC={std:'#19e3ff',hv:'#ff3d6a',tri:'#ffb020',front:'#19e3ff',side:'#3dffb0',wait:'#8890a8',emp:'#3dffb0',dash:'#ffe14d'};
/* ----- the overlay ----- */
{const st=document.createElement('style');st.textContent=`#lsC{position:fixed;inset:0;z-index:9300;display:flex;align-items:center;justify-content:center;background:rgba(5,3,12,.8);padding:16px;box-sizing:border-box}
#lsC[hidden]{display:none}#lsC .lc{width:min(420px,100%);max-height:100%;overflow:auto;background:#0d0820;border:2px solid var(--cyan);border-radius:14px;padding:16px;box-sizing:border-box;color:var(--ink);font:600 15px var(--display);text-align:center;display:flex;flex-direction:column;gap:12px}
#lsC h3{margin:0;font:700 19px var(--display);letter-spacing:.06em;color:var(--cyan)}#lsC .lk{font-size:14px;color:#c9c2e0;letter-spacing:.1em}#lsC p{margin:0;line-height:1.35}
#lsC .ar{display:flex;align-items:center;justify-content:center;gap:8px;min-height:44px;flex-wrap:wrap}#lsC .ar i{font-style:normal;font-size:22px;color:#c9c2e0}#lsC .ar b{font-size:22px}
#lsC small{font-size:13px;color:#c9c2e0}#lsC .cr{display:inline-grid;grid-template-columns:repeat(3,auto);gap:2px}#lsC .rw{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}#lsC .rw button{min-height:48px;min-width:110px}
#lsC .op{display:grid;grid-template-columns:repeat(auto-fit,minmax(96px,1fr));gap:8px}
#lsC .lo{min-height:56px;background:#1b1236;border:2px solid #4a3c7a;border-radius:10px;color:var(--ink);font:700 14px var(--display);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:6px;cursor:pointer}
#lsC .lo.sel{border-color:#ffe14d;box-shadow:0 0 0 2px #ffe14d66}#lsC .lo.ok{border-color:#3dffb0}#lsC .lo.bad{border-color:#ff5a7a}#lsC .lo:disabled{opacity:1;cursor:default}
#lsC .sl{border-style:dashed;color:#c9c2e0}#lsC .sl.full{border-style:solid;color:var(--ink)}
#lsC .fb{min-height:22px;font-size:15px}#lsC .fb.ok{color:#3dffb0}#lsC .fb.bad{color:#ff8a9a}
#lsC .bt{position:relative;height:120px;display:flex;align-items:center;justify-content:center}#lsC .bt .rg{position:absolute;left:50%;top:50%;width:100px;height:100px;margin:-50px 0 0 -50px;border:3px solid #ffe14d;border-radius:50%;box-sizing:border-box}
#lsC .bt .sh{position:relative;width:34px;height:34px}`;document.head.appendChild(st);}
const lsC=document.createElement('div');lsC.id='lsC';lsC.hidden=true;lsC.setAttribute('role','dialog');lsC.setAttribute('aria-label','Lesson');document.body.appendChild(lsC);
for(const ev of['touchstart','touchmove','touchend','pointerdown','mousedown'])lsC.addEventListener(ev,e=>e.stopPropagation(),{passive:true});
addEventListener('keydown',e=>{if(lsC.hidden)return;
  if(e.code==='Escape'){const b=$('lsSkip')||$('lsBack');if(b)b.click();}
  else if(LS.pr&&LS.pr.type==='beat'&&!LS.pr.won&&(e.code==='Space'||e.code==='ShiftLeft'||e.code==='ShiftRight')){const b=$('lsDash');if(b)b.click();}
  else if(e.code==='Enter'||e.code==='Space'){const b=document.activeElement&&lsC.contains(document.activeElement)?document.activeElement:lsC.querySelector('.rw .go:not(.dim)');if(b)b.click();}
  else return;e.stopImmediatePropagation();e.preventDefault();},true);
function lsBtn(row,id,label,cls,fn){const b=document.createElement('button');b.type='button';b.className=cls||'go';b.id=id;b.innerHTML=label;
  b.addEventListener('click',e=>{e.stopPropagation();fn(b);});row.appendChild(b);return b;}
function lsFrame(head,body){cancelAnimationFrame(LS.raf);lsC.innerHTML=`<div class="lc"><div class="lk">${head}</div>${body}<div class="rw"></div></div>`;lsC.hidden=false;return lsC.querySelector('.rw');}
/* ----- flow: cards -> practice -> done ----- */
function lsShow(id,done){const L=LSN.find(l=>l.id===id);if(!L||!LS.on){if(done)done();return false;}
  LS.cur=L;LS.i=0;LS.pr=null;LS.done=done||null;LS.mark(id,1);LS.log.push({id,ev:'show'});lsCard();return true;}
function lsCard(){const L=LS.cur,c=L.cards[LS.i];
  const rw=lsFrame(`LESSON · ${L.n} · ${LS.i+1}/${L.cards.length+1}`,`<h3>${c[0]}</h3>${c[1]}<p>${c[2]}</p>`);
  lsBtn(rw,'lsNext',LS.i<L.cards.length-1?'NEXT':'PRACTICE','go',()=>{LS.i++;if(LS.i<L.cards.length)lsCard();else lsPractice();});
  lsBtn(rw,'lsSkip','SKIP','go dim',()=>lsEnd(false));rw.firstChild.focus();}
function lsEnd(ok){cancelAnimationFrame(LS.raf);const L=LS.cur;if(L){if(ok)LS.mark(L.id,2);LS.log.push({id:L.id,ev:ok?'done':'skip'});}
  LS.cur=null;LS.pr=null;lsC.hidden=true;lsC.innerHTML='';const d=LS.done;LS.done=null;if(d)d();}
function lsWin(why){const P=LS.pr;P.won=true;const fb=lsC.querySelector('.fb');if(fb){fb.className='fb ok';fb.textContent='WELL DONE: '+why;}
  const rw=lsC.querySelector('.rw');rw.innerHTML='';lsBtn(rw,'lsDone','GOT IT','go',()=>lsEnd(true)).focus();}
function lsTry(t){const fb=lsC.querySelector('.fb');if(fb){fb.className='fb bad';fb.textContent='TRY AGAIN: '+t;}LS.log.push({id:LS.cur.id,ev:'miss'});}
function lsPractice(r){const L=LS.cur,P=LS.pr={type:L.pr.type,won:false,r:r|0,hits:0};let rw;
  const head=`PRACTICE · ${L.n} · ${L.cards.length+1}/${L.cards.length+1}`;
  if(P.type==='pick'){const RS=L.pr.rounds,R=RS[P.r];rw=lsFrame(head,`<h3>${R.q}</h3>${R.art}<div class="op"></div><div class="fb">Tap your answer${RS.length>1?' ('+(P.r+1)+'/'+RS.length+')':''}</div>`);
    const op=lsC.querySelector('.op');P.want=R.ok;
    for(const o of R.opts){const d=LS_OPT[o]||['tri',o.toUpperCase()],c=LS_OC[o]||lsW(o),lb=R.ship&&typeof SHIPS!=='undefined'?((SHIPS.find(s=>s.id===o)||{}).n||d[1]).toUpperCase():d[1];
      lsBtn(op,'lsO_'+o,lsS(d[0],c,26)+'<span>'+lb+'</span>','lo',b=>{if(P.won||P.step)return;
        if(o===R.ok){b.classList.add('ok');P.step=1;if(P.r<RS.length-1){const fb=lsC.querySelector('.fb');fb.className='fb ok';fb.textContent='YES: '+R.why;
            setTimeout(()=>{if(LS.pr===P)lsPractice(P.r+1);},900);}else lsWin(R.why);}
        else{b.classList.add('bad');setTimeout(()=>b.classList.remove('bad'),600);lsTry('think about what the foes need');}}).dataset.v=o;}
    lsBtn(rw,'lsSkip','SKIP','go dim',()=>lsEnd(false));}
  else if(P.type==='merge'){const T=L.pr.tiles;rw=lsFrame(head,`<h3>Merge two weapons into a hybrid</h3><div class="op" id="lsTiles"></div><div class="ar" id="lsForge"></div><div class="fb">Tap two weapons, then FORGE</div>`);
    P.pick=[];P.want=T.flatMap((a,i)=>T.slice(i+1).filter(b=>lsRecipe(a,b)).map(b=>[a,b]));if(!P.want.length)P.want=[[T[0],T[1]]];
    const fz=$('lsForge'),draw=()=>{fz.innerHTML=[0,1].map(i=>`<span class="lo sl${P.pick[i]?' full':''}">${P.pick[i]?lsS('tri',lsW(P.pick[i]),26)+lsWS(P.pick[i]):'EMPTY'}</span>`).join('<b>+</b>');
      for(const b of lsC.querySelectorAll('#lsTiles .lo'))b.classList.toggle('sel',P.pick.includes(b.dataset.v));};
    for(const w of T)lsBtn($('lsTiles'),'lsT_'+w,lsS('tri',lsW(w),26)+'<span>'+lsWS(w)+'</span>','lo',()=>{if(P.won)return;const k=P.pick.indexOf(w);
      if(k>=0)P.pick.splice(k,1);else{if(P.pick.length>=2)P.pick.shift();P.pick.push(w);}draw();}).dataset.v=w;
    lsBtn(rw,'lsForgeGo','FORGE','go',()=>{if(P.won)return;if(P.pick.length<2){lsTry('pick two weapons first');return;}
      const nm=lsRecipe(P.pick[0],P.pick[1])||(P.want.some(p=>p.includes(P.pick[0])&&p.includes(P.pick[1]))?'HYBRID':null);
      if(nm){fz.innerHTML=lsS('tri','#ffe14d',40)+'<span>'+nm.toUpperCase()+'</span>';lsWin(lsWS(P.pick[0])+' + '+lsWS(P.pick[1])+' = '+nm.toUpperCase());}
      else{lsTry('no recipe for '+lsWS(P.pick[0])+' + '+lsWS(P.pick[1]));P.pick=[];draw();}});
    lsBtn(rw,'lsSkip','SKIP','go dim',()=>lsEnd(false));draw();}
  else if(P.type==='equip'){const IT=[['w1','tri',lsW('pulse'),'PULSE','weapon'],['w2','tri',lsW('laser'),'LANCE','weapon'],['c','dia','#3dffb0','CORE','core'],['p','dot','#ffe14d','PASSIVE','passive']],
      SL=[['weapon','WEAPON'],['weapon','WEAPON'],['core','CORE'],['passive','PASSIVE']];
    rw=lsFrame(head,`<h3>Equip your loadout</h3><div class="op" id="lsItems"></div><div class="op" id="lsSlots"></div><div class="fb">Tap an item, then a slot that fits it</div>`);
    P.sel=null;P.fill=[null,null,null,null];P.want=IT.map(i=>i[0]);
    for(const it of IT)lsBtn($('lsItems'),'lsI_'+it[0],lsS(it[1],it[2],24)+'<span>'+it[3]+'</span>','lo',b=>{if(P.won||b.disabled)return;P.sel=it;
      for(const q of lsC.querySelectorAll('#lsItems .lo'))q.classList.toggle('sel',q===b);}).dataset.v=it[0];
    SL.forEach(([k,lb],i)=>lsBtn($('lsSlots'),'lsSl_'+i,'<span>'+lb+'</span>','lo sl',b=>{if(P.won)return;const it=P.sel;if(!it){lsTry('tap an item first');return;}
      if(P.fill[i]){lsTry('that slot is full');return;}
      if(it[4]!==k){lsTry(lb+' slot takes a '+k+' only');return;}
      P.fill[i]=it[0];P.sel=null;b.classList.add('full');b.innerHTML=lsS(it[1],it[2],24)+'<span>'+it[3]+'</span>';const ib=$('lsI_'+it[0]);ib.disabled=true;ib.classList.remove('sel');ib.classList.add('ok');
      if(P.fill.every(Boolean))lsWin('2 weapons, a core and a passive');else{const fb=lsC.querySelector('.fb');fb.className='fb ok';fb.textContent='FITS: '+(P.fill.filter(Boolean).length)+'/4';}}).dataset.v=k);
    lsBtn(rw,'lsSkip','SKIP','go dim',()=>lsEnd(false));}
  else if(P.type==='beat'){const need=L.pr.need;rw=lsFrame(head,`<h3>DASH when the ring touches your ship</h3><div class="bt"><div class="rg" id="lsRing"></div><div class="sh">${lsS('tri','#19e3ff',34)}</div></div><div class="fb">On beat: 0/${need}</div>`);
    P.per=1000;P.t0=performance.now();P.need=need;P.ph=0;const ring=$('lsRing');
    const tick=()=>{if(LS.pr!==P)return;P.ph=((performance.now()-P.t0)%P.per)/P.per;ring.style.transform=`scale(${(1-.66*P.ph).toFixed(3)})`;ring.style.opacity=(.4+.6*P.ph).toFixed(2);LS.raf=requestAnimationFrame(tick);};tick();
    lsBtn(rw,'lsDash','DASH','go',()=>{if(P.won)return;const ph=((performance.now()-P.t0)%P.per)/P.per;
      if(ph>.84||ph<.06){P.hits++;const fb=lsC.querySelector('.fb');fb.className='fb ok';fb.textContent='ON BEAT: '+P.hits+'/'+need;if(P.hits>=need){cancelAnimationFrame(LS.raf);lsWin('dash as the ring touches');}}
      else lsTry(ph<.5?'too late, wait for the ring':'too early, let the ring close');});
    lsBtn(rw,'lsSkip','SKIP','go dim',()=>lsEnd(false));}
  const f=rw&&rw.parentNode.querySelector('.lo, .rw .go');if(f)f.focus();}
/* ----- the list (MENU > LESSONS, Settings) ----- */
function lsList(){const rw=lsFrame('HELP','<h3>LESSONS</h3><p>Replay any lesson and its practice.</p><div class="op" id="lsL"></div>');const sv=LS.seen();
  for(const L of LSN)lsBtn($('lsL'),'lsL_'+L.id,'<span>'+L.n+'</span><small>'+(sv[L.id]===2?'practised':sv[L.id]?'seen':'new')+'</small>','lo',()=>lsShow(L.id,lsList));
  lsBtn(rw,'lsBack','BACK','go',()=>{lsC.hidden=true;lsC.innerHTML='';});rw.firstChild.focus();}
/* ----- triggers: first time each feature appears, never while a run is live ----- */
LS.want=id=>LS.auto&&!running&&lsC.hidden&&!(LS.seen()[id]);
LS.tryShow=(id,done)=>{if(!LS.want(id))return false;return lsShow(id,done);};
if(LS.on){
  {const s0=WP.show;WP.show=function(mode){const r=s0.apply(this,arguments);LS.tryShow('weapons');return r;};}
  const gaChk=()=>{if(garageEl.hidden)return;const t=GA.tab;
    if(t==='weapons')LS.tryShow('weapons');else if(t==='ships')LS.tryShow('ship');else if(t==='load')LS.tryShow('slots');
    else if(t==='forge'){if(!LS.tryShow('merge'))LS.tryShow('slots');}};
  garageEl.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.tabs button');if(b)setTimeout(gaChk,0);});
  {const o0=openGarage;openGarage=function(){const r=o0.apply(this,arguments);setTimeout(gaChk,0);return r;};}
  {const ss=startStory;startStory=function(n){if(running)return ss.apply(this,arguments);const a=arguments,go=()=>{if(!running)ss.apply(this,a);};
    if(n>=3&&LS.tryShow('counter',go))return;
    if(n>=2&&load('mnr_tut',0)!==2&&window.TIM&&TIM.on&&LS.tryShow('timing',go))return;
    return ss.apply(this,a);};}
  setTimeout(function add(){const g=document.querySelector('#mnMore .mg');if(!g){if((add.n=(add.n|0)+1)<40)setTimeout(add,50);return;}
    const b=document.createElement('button');b.type='button';b.className='go dim';b.id='lsBtn';b.textContent='LESSONS';b.addEventListener('click',()=>{if(!running)lsList();});
    const t=$('tutBtn');if(t&&t.parentNode===g)t.after(b);else g.appendChild(b);},0);}
window.__lessons={ids:LSN.map(l=>l.id),seen:()=>LS.seen(),show:(id,d)=>lsShow(id,d),list:()=>lsList(),get open(){return!lsC.hidden},get id(){return LS.cur?LS.cur.id:null},
  get step(){return LS.pr?'practice':LS.cur?'card':null},get pr(){return LS.pr},get log(){return LS.log},get auto(){return LS.auto},get on(){return LS.on},
  start:n=>startStory(n),quit:()=>{if(running)quitToTitle();},get running(){return running},
  phase:()=>LS.pr&&LS.pr.type==='beat'?((performance.now()-LS.pr.t0)%LS.pr.per)/LS.pr.per:null};
