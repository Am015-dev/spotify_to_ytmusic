/* ---------- STATS + ACHIEVEMENTS + COMPLETION (POLISH.md B29). Flag RET.stats (?stats=0 = exactly the old game: nothing counted, no UI).
   Lifetime counters live in localStorage 'mnr_stats' (also in the save export list). They are fed by NR events only; nothing here changes gameplay, rewards or balance.
   30 achievements (ach-<id>.webp, 128x128, listed in assets-manifest.json; a coloured badge with a glyph is drawn until real art is listed in media/ready.json).
   Assist runs (RET.assistRun) count for the stats but never for the skill-gated achievements (no-hit, Hard, Heat). The title chip shows COMPLETION %, MENU > STATS opens the sheet. ---------- */
if(RET.stats===undefined)RET.stats=!/[?&]stats=0/.test(location.search);
RET.sioKeys.push('mnr_stats');
RET.st=(function(on){
  const KEY='mnr_stats',NUM=['runs','time','kills','bosses','grazes','perfects','dashes','fevers','deaths','bestScore','neon','daily','fuse','clears','arcClears','hardClear','noHit'];
  const blank=()=>({v:1,s:Object.fromEntries(NUM.map(k=>[k,0])),w:{},a:{},arc:{}});
  let D=blank(),fresh=true,dirty=false,cur=null,lastBank=null,gotLoad=false;
  const clampN=v=>typeof v==='number'&&isFinite(v)?Math.max(0,Math.min(1e9,v)):0;
  let lw=null;const rawGet=()=>{try{return localStorage.getItem(KEY);}catch(e){return null;}};
  function parse(raw){D=blank();fresh=true;
    try{if(raw){const o=JSON.parse(raw);if(o&&typeof o==='object'&&o.s&&typeof o.s==='object'){fresh=false;
      for(const k of NUM)D.s[k]=clampN(o.s[k]);
      for(const k in (o.w||{}))if(/^[a-z]{2,12}$/.test(k))D.w[k]=clampN(o.w[k]);
      for(const k in (o.a||{}))if(/^[a-z0-9]{2,20}$/.test(k))D.a[k]=clampN(o.a[k])||1;
      for(const k in (o.arc||{}))if(/^\d{1,3}$/.test(k))D.arc[k]=1;}}}catch(e){D=blank();fresh=true;}}
  lw=rawGet();parse(lw);
  /* an import / undo rewrites the key behind our back: never overwrite it with the numbers in memory */
  const save=()=>{if(!on)return;const c=rawGet();if(c!==lw){lw=c;parse(c);dirty=false;return;}
    if(!dirty)return;dirty=false;try{const t=JSON.stringify(D);localStorage.setItem(KEY,t);lw=t;}catch(e){}};
  const WIDS=()=>typeof WP_IDS!=='undefined'?WP_IDS:[];
  const heatBest=()=>{try{return window.HEAT?HEAT.best:{};}catch(e){return{};}};
  const stars=()=>{let t=0;try{for(const k in sSave.stars)t+=sSave.stars[k]|0;}catch(e){}return t;};
  const cleared=()=>{let t=0;try{for(const k in sSave.stars)if((sSave.stars[k]|0)>0&&+k<=MAIN)t++;}catch(e){}return t;};
  const ownedW=()=>WIDS().filter(id=>(WP.pl[id]|0)>0).length;
  const topLv=()=>{let m=0;for(const id of WIDS())m=Math.max(m,WP.pl[id]|0);return m;};
  const heatMax=()=>{let m=0;const b=heatBest();for(const k in b)m=Math.max(m,b[k]|0);return m;};
  const S=()=>D.s;
  /* name, hint, glyph, tier (b/s/g), colour, skill-gated, test. tests read the counters or the live save, so old saves unlock on the first look (silently). */
  const A=[
    {id:'clear1',n:'First Light',d:'Clear a story stage',g:'★',t:'b',f:()=>cleared()>=1},
    {id:'clear10',n:'Ten Nights',d:'Clear 10 story stages',g:'10',t:'s',f:()=>cleared()>=10},
    {id:'story',n:'Dawn Breaks',d:'Finish the story',g:'☀',t:'g',f:()=>{try{return(sSave.stars[MAIN]|0)>=1;}catch(e){return false;}}},
    {id:'stars60',n:'Star Collector',d:'Earn 60 stars',g:'✦',t:'s',f:()=>stars()>=60},
    {id:'stars120',n:'Full Sky',d:'Earn all 120 stars',g:'✺',t:'g',f:()=>stars()>=MAIN*3},
    {id:'boss1',n:'Giant Slayer',d:'Beat a boss',g:'♛',t:'b',f:()=>S().bosses>=1},
    {id:'boss10',n:'Boss Rush',d:'Beat 10 bosses',g:'♛',t:'s',f:()=>S().bosses>=10},
    {id:'boss50',n:'Night King',d:'Beat 50 bosses',g:'♚',t:'g',f:()=>S().bosses>=50},
    {id:'perf100',n:'Metronome',d:'100 PERFECT hits',g:'♪',t:'b',f:()=>S().perfects>=100},
    {id:'perf1000',n:'Perfect Pitch',d:'1000 PERFECT hits',g:'♫',t:'g',f:()=>S().perfects>=1000},
    {id:'dash50',n:'Dash Dancer',d:'50 PERFECT dashes',g:'»',t:'s',f:()=>S().dashes>=50},
    {id:'graze500',n:'Close Shave',d:'Graze 500 bullets',g:'≈',t:'b',f:()=>S().grazes>=500},
    {id:'graze5000',n:'Needle Thread',d:'Graze 5000 bullets',g:'⌇',t:'s',f:()=>S().grazes>=5000},
    {id:'fever1',n:'Fever Dream',d:'Start a FEVER',g:'♨',t:'b',f:()=>S().fevers>=1},
    {id:'fever25',n:'Burning Up',d:'Start 25 FEVERs',g:'♨',t:'s',f:()=>S().fevers>=25},
    {id:'nohit',n:'Untouched',d:'Clear a stage with no hull lost',g:'◇',t:'s',skill:1,f:()=>S().noHit>=1},
    {id:'hard',n:'Hard Nights',d:'Clear a stage on Hard',g:'H',t:'s',skill:1,f:()=>S().hardClear>=1},
    {id:'heat1',n:'Warm Up',d:'Earn a Heat medal',g:'🔥',t:'b',skill:1,f:()=>heatMax()>=1},
    {id:'heat3',n:'Heat Three',d:'Clear a stage at Heat 3',g:'3',t:'s',skill:1,f:()=>heatMax()>=3},
    {id:'heat10',n:'Inferno',d:'Clear a stage at Heat 10',g:'🔥',t:'g',skill:1,f:()=>heatMax()>=10},
    {id:'arms4',n:'Armed',d:'Own 4 weapons',g:'✚',t:'b',f:()=>ownedW()>=4},
    {id:'arms8',n:'Arsenal',d:'Own all 8 weapons',g:'✠',t:'g',f:()=>WIDS().length>0&&ownedW()>=WIDS().length},
    {id:'wlv10',n:'Maxed Out',d:'Take a weapon to level 10',g:'Ⅹ',t:'s',f:()=>topLv()>=10},
    {id:'fusion',n:'Fusion Spark',d:'Fly 60 s with a fusion',g:'⚯',t:'b',f:()=>S().fuse>=60},
    {id:'daily3',n:'Three in a Row',d:'Daily streak of 3',g:'3',t:'b',f:()=>S().daily>=3},
    {id:'daily10',n:'Habit',d:'Daily streak of 10',g:'⌛',t:'g',f:()=>S().daily>=10},
    {id:'runs100',n:'Regular',d:'Fly 100 runs',g:'∞',t:'s',f:()=>S().runs>=100},
    {id:'neon5000',n:'Neon Saver',d:'Earn 5000 Neon',g:'◆',t:'s',f:()=>S().neon>=5000},
    {id:'kills1000',n:'Demolition',d:'Destroy 1000 enemies',g:'✸',t:'s',f:()=>S().kills>=1000},
    {id:'arcade',n:'Short and Sweet',d:'Clear a stage in Arcade',g:'⚡',t:'b',f:()=>S().arcClears>=1}];
  const BY=Object.fromEntries(A.map(a=>[a.id,a]));
  const TC={b:'#d08a4a',s:'#c9d2e0',g:'#ffd23d'},TN={b:'BRONZE',s:'SILVER',g:'GOLD'};
  /* ---- toast queue: one at a time, each shown 2 s, non-blocking ---- */
  const Q=[];let showing=false;
  function toast(a){Q.push(a);if(!showing)next();}
  function next(){const a=Q.shift();if(!a){showing=false;return;}showing=true;
    let e=document.getElementById('achToast');
    if(!e){e=document.createElement('div');e.id='achToast';e.setAttribute('role','status');e.setAttribute('aria-live','polite');document.body.appendChild(e);}
    e.innerHTML='<span class="ab" style="--c:'+TC[a.t]+'">'+a.g+'</span><span><small>'+TN[a.t]+' ACHIEVEMENT</small><b>'+a.n+'</b></span>';
    e.className='show';try{if(window.AU&&AU.sting)AU.sting('clear');}catch(x){}
    setTimeout(()=>{e.className='';setTimeout(next,0);},2000);}
  /* ---- unlocks ---- */
  function check(silent){if(!on)return[];const got=[];
    for(const a of A){if(D.a[a.id])continue;let ok=false;try{ok=!!a.f();}catch(e){}
      if(ok){D.a[a.id]=Object.keys(D.a).length+1;dirty=true;got.push(a);}}
    if(got.length){if(!silent&&!fresh)for(const a of got)toast(a);save();}
    if(fresh){fresh=false;}
    return got;}
  /* ---- counters ---- */
  const live=()=>cur&&typeof G!=='undefined'&&G&&G.live;
  function poll(){if(!on)return;
    try{const b=GA.bank;if(lastBank!=null&&b>lastBank){S().neon+=b-lastBank;dirty=true;}lastBank=b;}catch(e){}
    try{if(window.DY&&DY.s&&DY.s.streak>S().daily){S().daily=DY.s.streak;dirty=true;}}catch(e){}
    check(false);if(dirty)save();}
  const mark=()=>{dirty=true;};
  NR.on('runStart',d=>{if(!on)return;cur=(d&&(d.tut||d.lab))?null:{story:d&&d.story||0,daily:!!(d&&d.daily)};try{lastBank=GA.bank;}catch(e){}
    if(cur){S().runs++;mark();}});
  NR.on('tick',dt=>{if(!on||!live())return;dt=Math.min(.25,dt||0);const s=S();s.time+=dt;
    try{for(const id of WP.eqIds())D.w[id]=(D.w[id]||0)+dt;if(WP.fu())s.fuse+=dt;}catch(e){}mark();});
  NR.on('kill',d=>{if(!on||!live())return;if(d&&d.boss)S().bosses++;else S().kills++;mark();});
  NR.on('graze',()=>{if(!on||!live())return;S().grazes++;mark();});
  NR.on('perfect',d=>{if(!on||!live())return;S().perfects++;if(d&&d.kind==='dash')S().dashes++;mark();});
  let fvSeen=0;
  NR.on('bar',()=>{if(!on||!live())return;try{const n=RET.fv.starts|0;if(n>fvSeen){S().fevers+=n-fvSeen;mark();}fvSeen=n;}catch(e){}});
  NR.on('stageClear',d=>{if(!on||!cur||!d)return;let assist=false;try{assist=RET.assistRun();}catch(e){}
    if(!assist&&typeof ST!=='undefined'&&ST.on&&!ST.ch&&ST.hits===0){S().noHit++;mark();}});
  NR.on('runEnd',d=>{if(!on||!cur||!d||d.quit){cur=null;if(on){poll();save();}return;}
    const s=S();let assist=false;try{assist=RET.assistRun();}catch(e){}
    if(d.score>s.bestScore)s.bestScore=Math.min(1e9,d.score|0);
    if(d.cleared){s.clears++;
      try{if(!assist&&HARD)s.hardClear++;}catch(e){}
      try{if(d.story&&ARC.active())D.arc[d.story]=1,s.arcClears++;}catch(e){}}
    else s.deaths++;
    cur=null;mark();poll();save();});
  setInterval(()=>{if(on)poll();},1500);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&on){poll();save();}});
  addEventListener('pagehide',()=>{if(on)save();});
  /* ---- completion: weighted, renormalised over the parts that exist ---- */
  function tale(){const t=RET.tale;if(!t||typeof t!=='object')return null;
    const rd=v=>typeof v==='function'?v.call(t):v;let n,m;
    try{n=rd(t.seen!==undefined?t.seen:t.done!==undefined?t.done:t.count);m=rd(t.total!==undefined?t.total:t.max);}catch(e){return null;}
    if(Array.isArray(n))n=n.length;if(Array.isArray(m))m=m.length;
    return typeof n==='number'&&typeof m==='number'&&m>0&&isFinite(n)?Math.max(0,Math.min(1,n/m)):null;}
  function parts(){
    const b=heatBest();let hs=0;for(const k in b)hs+=Math.min(3,b[k]|0);
    let wp=0;const ids=WIDS();for(const id of ids){const l=WP.pl[id]|0;if(l>0)wp+=.4+.6*Math.min(1,(l-1)/9);}
    const p=[
      {k:'story',n:'Story stars',w:35,f:Math.min(1,stars()/(MAIN*3))},
      {k:'arcade',n:'Arcade clears',w:10,f:Math.min(1,Object.keys(D.arc).filter(k=>+k<=MAIN).length/MAIN)},
      {k:'heat',n:'Heat medals',w:15,f:Math.min(1,hs/(MAIN*3))},
      {k:'weapons',n:'Weapons',w:15,f:ids.length?Math.min(1,wp/ids.length):0},
      {k:'ach',n:'Achievements',w:20,f:Object.keys(D.a).filter(k=>BY[k]).length/A.length}];
    const tl=tale();if(tl!=null)p.push({k:'tale',n:'Story log',w:5,f:tl});
    return p;}
  function completion(){const p=parts();let w=0,s=0;for(const x of p){w+=x.w;s+=x.w*x.f;}return w?Math.round(100*s/w):0;}
  /* ---- title chip ---- */
  const dsh=RET.dailyShow;
  if(on&&dsh)RET.dailyShow=function(){const r=dsh.apply(this,arguments);try{const e=document.getElementById('retTt');if(e&&!e.hidden&&on)e.insertAdjacentHTML('beforeend',' · <b id="stPct">'+completion()+'%</b> complete');}catch(x){}return r;};
  if(on&&dsh)try{RET.dailyShow();}catch(e){}
  /* ---- the sheet ---- */
  const fmtT=s=>{s=Math.round(s);const h=Math.floor(s/3600),m=Math.floor(s%3600/60);return h?h+'h '+m+'m':m+'m '+(s%60)+'s';};
  const fmtN=n=>Math.round(n).toLocaleString('de-DE');
  const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
  function badge(a,got){
    const real=window.ART&&ART.rd&&ART.rd.has('ach-'+a.id+'.webp');
    if(real)return '<span class="ab img'+(got?'':' lk')+'" style="--c:'+TC[a.t]+'"><img alt="" src="'+ART.base+'ach-'+a.id+'.webp"></span>';
    return '<span class="ab'+(got?'':' lk')+'" style="--c:'+TC[a.t]+'" aria-hidden="true">'+a.g+'</span>';}
  function html(){
    const s=S(),pc=completion(),p=parts(),R=34,C=2*Math.PI*R,got=Object.keys(D.a).filter(k=>BY[k]).length;
    const wt=Object.keys(D.w).filter(k=>D.w[k]>=1).sort((x,y)=>D.w[y]-D.w[x]),wmax=wt.length?D.w[wt[0]]:1;
    const cell=(l,v)=>'<div class="sc"><small>'+l+'</small><b>'+v+'</b></div>';
    let bestStage=0;try{for(const k in sSave.stars)if((sSave.stars[k]|0)>0&&+k<=MAIN)bestStage=Math.max(bestStage,+k);}catch(e){}
    return '<h2>STATS</h2>'
     +'<div class="stRing"><svg viewBox="0 0 80 80" width="96" height="96" role="img" aria-label="Completion '+pc+' percent"><circle cx="40" cy="40" r="'+R+'" fill="none" stroke="#ffffff22" stroke-width="8"/><circle cx="40" cy="40" r="'+R+'" fill="none" stroke="#19e3ff" stroke-width="8" stroke-linecap="round" stroke-dasharray="'+(C*pc/100).toFixed(1)+' '+C.toFixed(1)+'" transform="rotate(-90 40 40)"/></svg>'
     +'<div class="rt"><b id="stPctBig">'+pc+'%</b><small>COMPLETE</small></div></div>'
     +'<div class="stParts">'+p.map(x=>'<div><span>'+x.n+'</span><i><u style="width:'+Math.round(x.f*100)+'%"></u></i><em>'+Math.round(x.f*100)+'%</em></div>').join('')+'</div>'
     +'<div class="stGrid">'+cell('Runs',fmtN(s.runs))+cell('Play time',fmtT(s.time))+cell('Enemies',fmtN(s.kills))+cell('Bosses beaten',fmtN(s.bosses))+cell('Grazes',fmtN(s.grazes))+cell('PERFECT dashes',fmtN(s.dashes))+cell('PERFECT hits',fmtN(s.perfects))+cell('FEVERs',fmtN(s.fevers))+cell('Deaths',fmtN(s.deaths))+cell('Best score',fmtN(s.bestScore))+cell('Best stage',bestStage||'-')+cell('Neon earned',fmtN(s.neon))+cell('Daily streak best',fmtN(s.daily))+cell('Stage clears',fmtN(s.clears))+'</div>'
     +(wt.length?'<h3>WEAPONS USED</h3><div class="stParts">'+wt.map(id=>'<div><span>'+esc((window.WPD&&WPD[id]&&WPD[id].n)||id)+'</span><i><u style="width:'+Math.round(100*D.w[id]/wmax)+'%"></u></i><em>'+fmtT(D.w[id])+'</em></div>').join('')+'</div>':'')
     +'<h3>ACHIEVEMENTS <span id="stAchN">'+got+'/'+A.length+'</span></h3><div class="stAch">'
     +A.map(a=>{const g=!!D.a[a.id];return '<div class="ac'+(g?' got':'')+'" data-id="'+a.id+'">'+badge(a,g)+'<span><b>'+esc(a.n)+'</b><small>'+(g?'':'🔒 ')+esc(a.d)+(a.skill?' · no Assist':'')+'</small></span></div>';}).join('')+'</div>'
     +'<h3>CREDITS &amp; PRIVACY</h3><div class="stCred"><p><b>Music</b> treblo (the owner\'s own account)</p><p><b>Code and art</b> original, made for this game</p><p><b>Privacy</b> saved only on this device. No data is collected.</p></div>'
     +'<button type="button" class="go dim" id="stReset">RESET STATS</button><button type="button" class="go back" id="stsBack">BACK</button>';}
  let sheet=null,rt=0;
  function shut(){if(sheet)sheet.hidden=true;}
  function open(){if(!on)return false;poll();
    if(!sheet){sheet=document.createElement('div');sheet.id='stSheet';sheet.hidden=true;sheet.setAttribute('role','dialog');sheet.setAttribute('aria-label','Stats');document.body.appendChild(sheet);
      sheet.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('button');if(!b)return;
        if(b.id==='stsBack')shut();
        else if(b.id==='stReset'){const now=Date.now();if(now-rt>4000){rt=now;b.textContent='TAP AGAIN TO RESET';setTimeout(()=>{if(b.isConnected&&rt===now)b.textContent='RESET STATS';},4000);return;}
          rt=0;parse(null);dirty=true;lw=rawGet();save();check(true);sheet.innerHTML=html();try{RET.dailyShow();}catch(x){}}});
      addEventListener('keydown',e=>{if(!sheet.hidden&&e.code==='Escape'){shut();e.stopImmediatePropagation();e.preventDefault();}},true);}
    sheet.innerHTML=html();sheet.hidden=false;sheet.scrollTop=0;const bk=document.getElementById('stsBack');if(bk)bk.focus();return true;}
  /* ---- style + menu button ---- */
  if(on){const st=document.createElement('style');st.textContent=`
#achToast{position:fixed;left:50%;top:max(10px,env(safe-area-inset-top));transform:translate(-50%,-14px);z-index:99998;display:flex;gap:10px;align-items:center;max-width:min(92vw,360px);padding:8px 14px 8px 8px;border-radius:12px;background:#0b0618ee;border:1px solid #ffd23d;color:#fff;font:600 14px/1.25 var(--mono);opacity:0;pointer-events:none;transition:opacity .25s,transform .25s}
#achToast.show{opacity:1;transform:translate(-50%,0)}
@media (prefers-reduced-motion:reduce){#achToast{transition:none;transform:translate(-50%,0)}}
#achToast small{display:block;color:#ffd23d;font-size:14px}#achToast b{font-size:16px}
.ab{flex:none;width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid var(--c);background:radial-gradient(circle at 35% 30%,color-mix(in srgb,var(--c) 55%,#000),#120a22);color:#fff;font:700 20px/1 var(--mono);overflow:hidden}
.ab.img{background:#120a22}.ab img{width:100%;height:100%;object-fit:cover}.ab.lk{filter:grayscale(1);opacity:.5}
#stSheet{position:fixed;inset:0;z-index:99990;overflow-y:auto;overflow-x:hidden;background:#05030c;color:var(--ink,#fff);display:flex;flex-direction:column;align-items:center;gap:10px;padding:14px 5% 24px;font-family:var(--mono)}
#stSheet[hidden]{display:none}#stSheet>*{width:100%;max-width:440px}
#stSheet h2{margin:0;font-family:var(--display);font-size:22px;letter-spacing:.14em;text-align:center}
#stSheet h3{margin:10px 0 0;font-size:14px;letter-spacing:.12em;color:#19e3ff}#stSheet h3 span{color:#ffd23d}
.stRing{position:relative;width:96px!important;height:96px;align-self:center}.stRing .rt{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.stRing b{font-size:22px}.stRing small{font-size:14px;color:var(--dim,#9a93b8);letter-spacing:.06em}
.stParts{display:flex;flex-direction:column;gap:6px}.stParts div{display:grid;grid-template-columns:minmax(0,9.5em) 1fr 4.4em;gap:8px;align-items:center;font-size:14px}
.stParts span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.stParts i{display:block;height:8px;border-radius:9px;background:#ffffff1a;overflow:hidden}.stParts u{display:block;height:100%;background:linear-gradient(90deg,#19e3ff,#ffb020)}.stParts em{font-style:normal;text-align:right;color:var(--dim,#9a93b8)}
.stGrid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.sc{border:1px solid #ffffff22;border-radius:10px;padding:6px 10px;background:#ffffff0a;min-width:0}.sc small{display:block;font-size:14px;color:var(--dim,#9a93b8)}.sc b{font-size:16px;overflow-wrap:anywhere}
.stAch{display:grid;grid-template-columns:1fr;gap:8px}@media (min-width:420px){.stAch{grid-template-columns:1fr 1fr}}
.ac{display:flex;gap:10px;align-items:center;border:1px solid #ffffff22;border-radius:10px;padding:6px;background:#ffffff0a;min-width:0}.ac.got{border-color:#ffd23d88}
.ac:not(.got) b{color:var(--dim,#9a93b8)}.ac span:last-child{min-width:0}.ac b{display:block;font-size:14px}.ac small{display:block;font-size:14px;color:var(--dim,#9a93b8);line-height:1.25}
.stCred p{margin:6px 0;font-size:14px;line-height:1.35}.stCred b{color:#ffd23d;margin-right:.5em}
#stSheet .go{width:100%;min-height:48px}
`;document.head.appendChild(st);
    const addBtn=()=>{const g=document.querySelector('#mnMore .mg');if(!g||document.getElementById('statsBtn'))return !!g;
      const b=document.createElement('button');b.type='button';b.className='go wide';b.id='statsBtn';b.textContent='STATS';b.addEventListener('click',open);g.appendChild(b);return true;};
    if(RET.title){let n=0;const t=setInterval(()=>{if(addBtn()||++n>50)clearInterval(t);},60);}
    try{lastBank=GA.bank;}catch(e){}
    setTimeout(()=>{check(true);if(dirty||fresh)save();},400);}
  return{on,A,BY,D:()=>D,S,parts,completion,check,toast,open,shut,save,poll,toastQ:()=>Q.length,reset:()=>{parse(null);dirty=true;lw=rawGet();save();}};
})(RET.stats);
