// PURPOSE: tidy Settings (<= 20 controls on the main page, one Assist page, the rest under More) + a street run that keeps Kai in the left third and drones off the HUD
// FLAG: none (always on)
// TEST: tidy-test.js
/* ---------- TIDY (flag RET.tidy, default ON; ?tidy=0 = Settings and the street run exactly as before). Owner, 21 Oct 2026: "messy, unorganized, the game is shit on foot".
   Review 8: Settings had 41 controls (hc and rm twice, Music twice, DATA tab clipped). Now the main page has 19: Gameplay (HUD, Difficulty, Auto-fire, Aim assist, ASSIST >),
   Display / Comfort (Quality, Particles, Colour theme, Flashing, Screen shake, Text size), Audio (Master, Music, Effects, Music mix), Controls (Touch layout, Sensitivity, Button size),
   Data (MORE >). ASSIST = one page (world speed, bullets, hull, beat window, timing, hitbox, big bullets, high contrast, colour-blind, reduced motion, Calm mode, Everything counts).
   MORE = everything else that was there (glow, scan lines, FPS, ducking, latency test, beat cue, save / load / backup, update, lab, tutorial). No node is removed or moved: rows are shown /
   hidden by a data-pg attribute (main | assist | more | dup), so every id, hook and test that looks a row up keeps working. The Comfort copies of hc / rm are 'dup' (the Assist rows stay).
   Street run (phones, portrait): during an arena lock or the boss arena the camera is parked, so Kai used to run to the right edge and fight clipped (median 82% of the view);
   now he may not pass 37% of the view while the camera is parked (F.post, after every step), the camera still keeps him at 25% otherwise (streetlook camK) and the walk-back rule
   (<= 35% back, W90) is untouched. Flyers (drones) are kept below the HUD band: their drawn top is never above the HUD band (SL.hudFull = panel + score + the hint line). The HUD panel uses the fly HUD's own plate (streetlook.js slHud). ---------- */

/* ===== street run: player cap + flyers under the HUD ===== */
(function(){
if(!window.FOOT||!FOOT._in)return;
const F=FOOT,IN=F._in,FL=470,CAP=.37;
F.post=(S,dt)=>{const SL=F.look;if(!SL||!S||S.end)return;const L=IN.L&&IN.L();if(!L||!L.vw)return;const P=S.P,vw=L.vw;
  if(SL.port&&(S.lock||S.bossOn)){const hi=S.camX+vw*CAP;if(P.x>hi){P.x=hi;if(P.vx>0)P.vx=0;}}
  if(SL.hudFull!=null&&SL.k>0&&L.sc){const K=SL.k,d0=SL.d0,s=SL.s,top=SL.t0+SL.hudFull+6/L.sc;
    for(const e of S.E){if(e.dead||!(e.fly||(e.def&&(e.def.fly||e.def.flyer))))continue;
      const off=e.ext&&e.fly?e.h/2:0,dd=FL-(top+e.h*K);if(dd<=0)continue;   // dd: how far above the road the drone's feet may be drawn
      const d=dd<=d0*K?dd/K:d0+(dd-d0*K)/s,ymin=FL-d-off;if(e.y<ymin)e.y=ymin;}}};
})();

/* ===== Settings ===== */
if(RET.hub)setTimeout(()=>{
  const sb=document.getElementById('setBody'),setm=document.getElementById('setm');if(!sb||!setm)return;
  document.documentElement.classList.add('td');
  const MAIN='hud diff auto aim part q pal flash shake txt master music sfx mus layout sens dsize'.split(' ');
  const ASSIST='asNote asSpd asBul asHull asWin win all asBig hc hbox rm cbp calmm'.split(' ');
  const MORE='tdH_d fps fpsc glow scan tdH_a duck keepmus react mute tdH_r cue sync calBox tdH_s ck stampRow labBtnS tut setLastSave svH svBox sioH sioBox'.split(' ');
  const css=document.createElement('style');let r='';
  for(const pg of ['main','assist','more'])r+=`.td #setBody[data-pg="${pg}"]>:not([data-pg="${pg}"]){display:none!important}`;
  for(let i=0;i<60;i++)r+=`.td #setBody[data-pg="assist"]>[data-oa="${i}"]{order:${i}!important}.td #setBody[data-pg="more"]>[data-om="${i}"]{order:${i}!important}`;
  css.textContent=r+`
.td #setBody>.tdBar,.td #setBody>.tdNav{display:flex}
.td #setBody>.tdNav{order:100!important}.td #setBody>#tdMoreW{order:4001!important}
.td #setBody>.tdBar{order:-1!important;align-items:center;gap:10px;padding:8px 0 4px;color:var(--yel);font:italic 900 14px var(--display);letter-spacing:.12em;text-transform:uppercase}
.td #setBody .tdBar button,.td #setBody .tdNav button{all:unset;box-sizing:border-box;cursor:pointer;min-height:48px;padding:0 14px;display:flex;align-items:center;justify-content:space-between;gap:8px;border-radius:8px;background:#0a2437;border:1px solid #2f9cbc;color:#e6f6ff;font:italic 800 13px var(--display);letter-spacing:.1em;text-transform:uppercase}
.td #setBody .tdNav button{width:100%}.td #setBody .tdNav small{font:600 11px var(--mono);letter-spacing:.02em;text-transform:none;color:#9cc3d6;white-space:normal;text-align:right}
.td #setBody .tdBar button:focus-visible,.td #setBody .tdNav button:focus-visible{outline:2px solid var(--yel);outline-offset:2px}
.td #setBody>.tdH{margin:12px 0 4px;font:italic 900 14px var(--display);letter-spacing:.12em;color:var(--yel);border-bottom:1px solid rgba(47,156,188,.35);padding-bottom:5px;text-transform:uppercase}
.td #setBody[data-pg="assist"]>h3,.td #setBody[data-pg="more"]>h3:not(#svH):not(#sioH){display:none!important}
.td #hubJump{flex-wrap:wrap;overflow:visible;gap:4px}.td #hubJump button{flex:1 1 auto;min-width:0;font-size:11px;padding:0 6px;letter-spacing:0}
.td #setm[data-pg="assist"] #hubJump,.td #setm[data-pg="more"] #hubJump{display:none}
.td #setm .seg>span{overflow-wrap:anywhere}.td #setm .sl>span{width:auto;min-width:84px;max-width:42%;overflow-wrap:anywhere}
@media (max-width:400px){.td #hubJump button{font-size:10px;letter-spacing:-.02em}}`;
  document.head.appendChild(css);
  const key=e=>{if(e.dataset&&e.dataset.k)return e.dataset.k;const i=e.querySelector&&e.querySelector('input[type=range]');if(i)return i.id.slice(1).toLowerCase();return e.id||'';};
  const B=(id,label,sub,fn)=>{const w=document.createElement('div');w.className='tdNav';w.id=id+'W';w.innerHTML='<button type="button" id="'+id+'"><span>'+label+'</span><small>'+sub+'</small></button>';w.firstChild.addEventListener('click',fn);return w;};
  const bar=document.createElement('div');bar.className='tdBar';bar.innerHTML='<button type="button" id="tdBack" aria-label="Back to settings">‹ Settings</button><span id="tdTitle"></span>';
  const nA=B('tdAssist','Assist','speed · bullets · hull · timing ›',()=>go('assist')),nM=B('tdMore','More','save · backup · lab · tutorial · extras ›',()=>go('more'));
  const lab=[['tdH_d','Display'],['tdH_a','Audio'],['tdH_r','Rhythm'],['tdH_s','Data']].map(([id,t])=>{const h=document.createElement('div');h.className='tdH';h.id=id;h.textContent=t;h.dataset.pg='more';h.dataset.om=MORE.indexOf(id)*2;return h;});
  let cur='main';
  function classify(){const kids=[...sb.children],lastOf={};
    for(const e of kids){const k=key(e);if(k&&!/^td/.test(e.id))lastOf[k]=e;}
    let prevPg='main',prevIdx=0;
    for(const e of kids){
      if(e.classList.contains('hubSG')){e.dataset.pg='main';continue;}
      if(e.classList.contains('tdNav')||e.classList.contains('tdBar')||e.classList.contains('tdH'))continue;
      const k=key(e),isP=e.tagName==='P'&&!e.id;let pg,idx=0;
      if(e.tagName==='H3'){pg=e.id==='svH'||e.id==='sioH'?'more':'dup';idx=MORE.indexOf(e.id);}
      else if(isP){pg=prevPg;idx=prevIdx+.5;}   // an explanation under a row: same page, right after it
      else if(e.id==='hubComfort')pg='dup';
      else if(k&&lastOf[k]!==e)pg='dup';   // the Comfort copies of hc / rm: the Assist rows stay
      else if(MAIN.includes(k))pg='main';
      else if(ASSIST.includes(k)){pg='assist';idx=ASSIST.indexOf(k);}
      else{pg='more';const mk=MORE.includes(k)?k:MORE.includes(e.id)?e.id:e.querySelector('.ckB')?'ck':e.querySelector('#tutBtnS')?'tut':'';idx=mk?MORE.indexOf(mk):MORE.length;}
      e.dataset.pg=pg;if(!isP&&pg!=='dup'&&e.tagName!=='H3'){prevPg=pg;prevIdx=idx;}
      if(pg==='assist')e.dataset.oa=Math.min(59,Math.round(idx*2));
      if(pg==='more')e.dataset.om=Math.min(59,Math.round(idx*2));}}
  function place(){if(!bar.isConnected){sb.append(bar,nA,nM,...lab);nA.dataset.pg='main';nM.dataset.pg='main';}}
  function go(pg){cur=pg;sb.dataset.pg=pg;bar.dataset.pg=pg==='main'?'none':pg;setm.dataset.pg=pg;sb.scrollTop=0;const t=document.getElementById('tdTitle');if(t)t.textContent=pg==='assist'?'Assist':pg==='more'?'More':'';
    const h=setm.querySelector('.hubHd .ttl');if(h)h.textContent=pg==='main'?'SETTINGS':pg==='assist'?'ASSIST':'MORE';}
  /* the music choice shares its name with the volume slider */
  const fix=()=>{const m=sb.querySelector('.seg[data-k="mus"]>span');if(m&&m.textContent!=='Music mix')m.textContent='Music mix';};
  // nav buttons live inside their page: Assist under Gameplay, More under Data
  let busy=0;const run=()=>{if(busy)return;busy=1;try{place();classify();fix();}finally{busy=0;}};
  run();go('main');
  new MutationObserver(()=>{if(!sb._tdR){sb._tdR=1;requestAnimationFrame(()=>{sb._tdR=0;run();});}}).observe(sb,{childList:true});
  document.getElementById('tdBack').addEventListener('click',()=>go('main'));
  setm.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.hubHd .hubBk');if(b&&cur!=='main'){e.stopImmediatePropagation();e.preventDefault();go('main');}},true);
  new MutationObserver(()=>{if(setm.hidden)go('main');else run();}).observe(setm,{attributes:true,attributeFilter:['hidden']});
  RET.tidyJump=g=>{if(g!=='da')return false;go('more');return true;};   // the hub doors for saves / export / update check land on the MORE page, where those controls live
  window.__tidy={go,run,page:()=>cur,MAIN,ASSIST,MORE};   // test hook
},0);
