// PURPOSE: the Lab in pages: a home screen with big tiles, a calm FLIGHT VIEWER (every sprite state, frame by frame), a FLIGHT PLAY TEST side panel / bottom sheet
// FLAG: lab2 (?lab2=0)
// TEST: qa/lab2-test.js
/* ---------- lab2.js (owner, 22 Oct 2026: "the boss sprites I can not see in the Lab; please make the Lab of flight separate and easy to use both on phone and PC").
   Flag RET.lab2, default ON; ?lab2=0 = the Lab exactly as before (one panel with a strip of small tabs).
   Pages: HOME (5 big tiles) > FLIGHT VIEWER (own canvas, nothing fires, nothing moves unless you press play), FLIGHT PLAY TEST (the old BOSS FOES ITEMS CHEATS DEX CTRL tabs,
   restyled: a right column on PC, a bottom sheet with big buttons on a phone), ON FOOT (footlab.js tab), SOUND (soundlab.js tab), ASSETS (labassets.js tab).
   One header on every page: BACK (to the Lab home) and EXIT. The viewer draws the sheets itself (media/anim/<key>-strip.webp and the pose grid media/anim-boss-<id>.webp),
   so a boss is never hidden by the game (position, alpha, the panel). URL: ?lab=1&l2=viewer|play|foot|sound|assets opens a page; ?boss=<id> and a repro link (lfspawn=) open PLAY TEST as before. */
if(RET.lab2===undefined)RET.lab2=!/[?&]lab2=0/.test(location.search);
(()=>{if(!RET.lab2||typeof startLab!=='function'||typeof labShow!=='function')return;
const L2=window.L2={page:'home',starting:false,busy:false,kind:'boss',item:0,state:0,phase:1,play:true,fi:0,speed:1,hit:false,di:0,box:null,raf:0,last:0,img:{},
  /* page id per Lab tab: the tabs that became their own page */
  PG:{foot:'foot',sound:'sound',assets:'assets'}};
const PAGES=[['viewer','FLIGHT VIEWER','Look at every boss, enemy ship, player ship, pickup and shot, one state at a time. Nothing moves or fires unless you press play.'],
  ['play','FLIGHT PLAY TEST','The live flight stage with test controls: spawn a boss, lock its phase, force an attack, spawn foes and items, cheats.'],
  ['foot','ON FOOT','The street stage in a sandbox: rooms, spawns, god mode, slow motion, hit boxes.'],
  ['sound','SOUND','Hear every sound effect and switch each one on or off.'],
  ['assets','ASSETS','Browse every picture in the game.']];
const TITLE={home:'LAB',viewer:'FLIGHT VIEWER',play:'FLIGHT PLAY TEST',foot:'ON FOOT',sound:'SOUND',assets:'ASSETS'};
const has=t=>t==='home'||t==='play'||t==='viewer'||!!(window.LABX&&LABX.build&&LABX.build[t]);
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;};
const btn=(host,label,fn,cls)=>{const b=el('button','l2b'+(cls?' '+cls:''),label);b.type='button';b.addEventListener('click',()=>fn(b));host.append(b);return b;};
const img=u=>{let i=L2.img[u];if(!i){i=new Image();i.decoding='async';i.src=u;L2.img[u]=i;}return i;};
const ok=i=>i&&i.complete&&i.naturalWidth>0;
const AM=k=>typeof ART!=='undefined'&&ART.ANIM&&ART.ANIM.s&&ART.ANIM.s[k];                      // [frames, fps, frame w, frame h] of a strip
const SU=k=>'media/anim/'+k+'-strip.webp';
{const st=document.createElement('style');st.textContent=`
#l2h{position:fixed;left:0;right:0;top:0;height:56px;z-index:7;display:flex;align-items:center;gap:10px;padding:6px 10px;background:#07040f;border-bottom:1px solid #3a2b5c;font-family:var(--mono);color:var(--ink);box-sizing:border-box}
#l2h .l2t{flex:1 1 auto;min-width:0;font:700 18px var(--mono);letter-spacing:.1em;color:var(--amber);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:center}
.l2b{min-height:44px;min-width:44px;padding:0 14px;font:700 16px var(--mono);letter-spacing:.04em;color:var(--ink);background:#140c26;border:1px solid #3a2b5c;border-radius:8px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;white-space:nowrap}
.l2b.on{background:var(--cyan);color:var(--void);border-color:var(--cyan)}
.l2b.x{border-color:var(--pink);color:var(--pink)}
.l2b:disabled{opacity:.4;cursor:default}
.l2pg{position:fixed;left:0;right:0;top:56px;bottom:0;z-index:6;background:#0a0614;color:var(--ink);font:16px var(--mono);overflow-y:auto;overflow-x:hidden;box-sizing:border-box}
#l2home{padding:16px;display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr));gap:14px;align-content:start}
#l2home .l2tile{display:flex;align-items:center;gap:14px;text-align:left;min-height:120px;padding:12px 16px;background:#140c26;border:1px solid #3a2b5c;border-radius:12px;color:var(--ink);cursor:pointer;font:16px var(--mono)}
#l2home .l2tile:hover{border-color:var(--cyan)}
#l2home .l2tile i{flex:0 0 88px;height:88px;border-radius:8px;background:#07040f center/contain no-repeat}
#l2home .l2tile b{display:block;font-size:20px;letter-spacing:.08em;color:var(--amber);margin-bottom:4px}
#l2home .l2tile span{display:block;font-size:15px;line-height:1.35;color:var(--ink);opacity:.85}
#l2home .l2tile:disabled{opacity:.4}
#l2home .l2help{grid-column:1/-1;font-size:16px;line-height:1.4;color:var(--dim);margin:0}
#l2v{display:grid;grid-template-columns:330px minmax(0,1fr) 340px;grid-template-rows:minmax(0,1fr);overflow:hidden}
#l2v .l2col{overflow-y:auto;overflow-x:hidden;padding:10px;min-height:0;box-sizing:border-box}
#l2v h3{font:700 15px var(--mono);letter-spacing:.12em;color:var(--dim);margin:10px 0 6px}
#l2v h3:first-child{margin-top:0}
#l2v .l2row{display:flex;flex-wrap:wrap;gap:6px}
#l2v .l2k{flex-direction:column;min-height:92px;min-width:96px;padding:6px;font-size:14px}
#l2v .l2k i,#l2v .l2it i{display:block;width:56px;height:56px;background:#07040f center/contain no-repeat;border-radius:6px}
#l2v .l2it{flex-direction:column;min-height:84px;min-width:84px;max-width:110px;padding:5px;font-size:14px;white-space:normal;text-align:center;line-height:1.1}
#l2v .l2mid{display:flex;flex-direction:column;min-height:0;padding:10px;gap:8px}
#l2v .l2cv{position:relative;flex:1 1 auto;min-height:260px;border:1px solid #3a2b5c;border-radius:8px;overflow:hidden;background:#000}
#l2v .l2cv canvas{position:absolute;inset:0;width:100%;height:100%}
#l2v .l2zw{position:absolute;right:8px;top:8px;width:31%;max-width:220px;aspect-ratio:1;border:2px solid var(--amber);border-radius:6px;background:#000;overflow:hidden}
#l2v .l2zw canvas{position:absolute;inset:0;width:100%;height:100%}
#l2v .l2zw span{position:absolute;left:0;right:0;bottom:0;font:700 14px var(--mono);color:var(--void);background:var(--amber);text-align:center}
#l2v .l2info{font:16px var(--mono);line-height:1.45;color:var(--ink);background:#07040f;border:1px solid #3a2b5c;border-radius:8px;padding:8px 10px;white-space:pre-wrap;word-break:break-word}
#l2v .l2info b{color:var(--amber)}
#l2v .l2miss{color:var(--pink)}
@media (max-width:900px){#l2v{display:flex;flex-direction:column;overflow-y:auto}#l2v .l2col{overflow:visible;flex:0 0 auto}#l2v .l2mid{order:-1;position:sticky;top:0;z-index:2;background:#0a0614;flex:0 0 auto;padding:8px 10px;border-bottom:2px solid #3a2b5c}#l2v .l2cv{flex:0 0 auto;height:min(240px,34vh);min-height:0}#l2v .l2info{font-size:14px;line-height:1.35;padding:6px 8px}}   /* phone: the picture stays on top while the buttons scroll under it */
html.l2h #labP{display:none!important}
html.l2 #labP .lbar>.lc{display:none}
html.l2 #labP .lbar>.ltabs .lc{display:inline-flex}
html.l2 #labP *{font-size:max(15px,1em)!important}
html.l2 #labP input{font-size:16px!important}
html.l2 #labP .lc{min-height:44px;min-width:44px;padding:0 12px;font-size:15px}
html.l2 #labP .lt{font-size:14px;margin:6px 0 4px}
html.l2 #labP .lr.sc{flex-wrap:wrap;overflow-x:hidden;touch-action:pan-y}
html.l2 #labP .lc.lb,html.l2 #labP .lc.ps{min-height:76px}
html.l2 #labP .lc.lb img{width:44px;height:44px}
html.l2p #labTab_foot,html.l2p #labTab_sound,html.l2p #labTab_assets{display:none!important}
html.l2s #labP .ltabs{display:none!important}
html.l2s #labP .linfo{display:none!important}
html.l2 #labP #laSecs,html.l2 #labP #laFilt{flex-wrap:wrap!important;overflow-x:visible!important}
html.l2 #labP{position:fixed;top:auto;height:46vh;max-height:none;border-top:2px solid #3a2b5c}
html.l2 #stage{top:56px}
html.l2p #stage{bottom:46vh}
html.l2 #labP .ltabs,html.l2 #labP .dx .dg{flex-wrap:wrap;overflow-x:visible;touch-action:pan-y}
html.l2 #labP .ltabs{flex-wrap:wrap}
html.l2 #labP .lbar{flex-wrap:wrap}
html.l2s #labP{top:56px;height:auto;max-height:none;bottom:0}
@media (min-width:901px){html.l2 #labP *{font-size:max(16px,1em)!important}
  html.l2p #labP{left:auto;right:0;top:56px;bottom:0;width:400px;height:auto;max-height:none;border-top:0;border-left:2px solid #3a2b5c}
  html.l2p #stage{bottom:0;right:400px}
  html.l2p #labP .lbody{grid-template-columns:1fr;gap:4px}
  html.l2p #labP .lt{font-size:16px;color:var(--amber);border-bottom:1px solid #3a2b5c;padding-bottom:2px;margin-top:10px}}
`;document.head.appendChild(st);}
/* ----- header + pages ----- */
const hd=el('div');hd.id='l2h';hd.hidden=true;
const back=btn(hd,'‹ LAB HOME',()=>go('home'));back.id='l2back';back.setAttribute('aria-label','Back to the Lab home');
const ttl=el('div','l2t','LAB');ttl.id='l2title';hd.append(ttl);
const ex=btn(hd,'EXIT',()=>{labExit();},'x');ex.id='l2exit';ex.setAttribute('aria-label','Leave the Lab');
const home=el('div','l2pg');home.id='l2home';home.hidden=true;
const view=el('div','l2pg');view.id='l2v';view.hidden=true;
document.body.append(hd,home,view,labEl);   // fixed to the screen, outside the stage: the stage shrinks to the space the panels leave, so nothing covers the boss
const TH={viewer:'url(media/boss-sek-adler.webp)',play:`url(${SU('ship-std/flame')})`,foot:`url(${SU('kai/run')})`,sound:'',assets:'url(media/pk-shard.webp)'};
function buildHome(){home.textContent='';const p=el('p','l2help','Pick what you want to test. Every page has LAB HOME (top left) to come back here and EXIT (top right) to leave the Lab.');home.append(p);
  for(const [id,n,d] of PAGES){const b=el('button','l2tile');b.type='button';b.id='l2tile_'+id;const i=el('i');
    const m=id==='play'?AM('ship-std/flame'):id==='foot'?AM('kai/run'):null;
    if(TH[id]){i.style.backgroundImage=TH[id];if(m){i.style.backgroundSize=`${m[0]*100}% 100%`;i.style.backgroundPosition='0 0';}}else{i.textContent='♪';i.style.cssText+=';display:flex;align-items:center;justify-content:center;font-size:48px;color:var(--cyan)';}
    const t=el('div');t.append(el('b','',n),el('span','',has(id)?d:'Not available in this build.'));b.append(i,t);b.disabled=!has(id);b.addEventListener('click',()=>go(id));home.append(b);}}
/* which Lab tab a page opens in the old panel */
const TAB={play:'boss',foot:'foot',sound:'sound',assets:'assets'};
function apply(){const pg=L2.page,on=!!(running&&G&&G.lab),H=document.documentElement;if(on&&!home.firstChild)buildHome();   // built on the first Lab visit: no picture is fetched outside the Lab
  hd.hidden=!on;home.hidden=!on||pg!=='home';view.hidden=!on||pg!=='viewer';back.hidden=pg==='home';ttl.textContent=TITLE[pg]||'LAB';
  H.classList.toggle('l2',on);H.classList.toggle('l2h',on&&(pg==='home'||pg==='viewer'));H.classList.toggle('l2p',on&&pg==='play');H.classList.toggle('l2s',on&&!!L2.PG[pg]);
  if(on&&pg==='viewer')vStart();else vStop();}
function calm(){if(!G||!G.lab)return;G.en=[];G.eb=[];G.pb=[];G.pk=[];G.boss=null;G.bossDone=false;G.delayed=[];}
function go(pg){if(!running||!G||!G.lab||!has(pg))return;L2.page=pg;
  if(pg==='home'||pg==='viewer')calm();
  else{L2.busy=true;try{let t=TAB[pg];if(pg==='play'&&L2.played&&L2.PG[LAB.tab]==null)t=LAB.tab;L2.played=1;labShow(t);}finally{L2.busy=false;}
    if(pg==='play'&&!G.boss)labSpawn();}
  apply();}
L2.go=go;L2.draw=()=>{if(VL)vDraw();};L2.cur=()=>VL&&VL.it&&VL.it.states[L2.state];
/* the old functions, page-aware */
{const sp=labSpawn;labSpawn=function(){if(L2.page==='home'||L2.page==='viewer')return;return sp.apply(this,arguments);};}           // home and viewer stay calm: no boss, no waves, no shots
{const ls=labShow;labShow=function(tab){const r=ls.apply(this,arguments);
  if(!L2.busy&&!L2.starting&&running&&G&&G.lab){const pg=L2.PG[tab]||'play';if(L2.page!==pg){L2.page=pg;if(pg==='play'&&!G.boss)labSpawn();apply();}}   // a tab opened by code (old tests, footlab) shows its page
  return r;};}
{const sl=startLab;startLab=function(bi){if(running)return;const q=location.search,m=(q.match(/[?&]l2=([a-z]+)/)||[])[1];
  L2.page=/[?&](boss|lfspawn)=/.test(q)||bi!=null?'play':(m&&TITLE[m]&&has(m)?m:'home');
  L2.starting=true;let r;try{r=sl.apply(this,arguments);}finally{L2.starting=false;}
  if(L2.PG[L2.page]||L2.page==='play'){const pg=L2.page;L2.page='home';go(pg);}else{calm();apply();}
  return r;};}
NR.on('runEnd',()=>{L2.page='home';setTimeout(apply,0);});
NR.on('tick',()=>{if(G&&G.lab&&(L2.page==='home'||L2.page==='viewer')&&(G.en.length||G.eb.length||G.boss))calm();});   // the run behind home and viewer stays empty
{const su=syncUI;syncUI=function(){su();apply();};}
/* ===== FLIGHT VIEWER ===== */
const BOSSPATS=[['fan5','summon','fan7','ring'],['spiral','ring','fan5','spiral','summon'],['laser','ring','laser','fan7','spiral'],['spiral','laser','ring','fan9','summon','laser','fan7']];
const PNAME=p=>(window.BV&&BV.NAMES&&BV.NAMES[p])||String(p).toUpperCase();
const KINDS=[['boss','BOSS'],['enemy','ENEMY SHIP'],['player','PLAYER SHIP'],['pickup','PICKUP'],['shot','PROJECTILE']];
/* items per kind: {n name, th thumbnail css, states:[{n, src:'strip'|'grid'|'still'|'none', key/url, row, col, slot, fx}]} */
function items(kind){const S=typeof ART!=='undefined'&&ART.ANIM&&ART.ANIM.s||{},keys=Object.keys(S),o=[];
  if(kind==='boss')for(const B of LAB_B){const A=typeof UIK!=='undefined'&&UIK.boss&&UIK.boss[B.art],b='boss-'+B.art+'/',k=B.o.k,pats=B.o.pats||BOSSPATS[k]||(typeof ATAB!=='undefined'&&ATAB[k])||['fan5','ring'],st=[];
    const strip=(n,a)=>st.push(S[b+a]?{n,src:'strip',key:b+a}:{n,src:'none',slot:'anim/'+b+a});
    strip('IDLE','idle');
    for(let c=0;c<4;c++)st.push(A&&c<(A.idle||4)?{n:'IDLE POSE '+(c+1),src:'grid',art:B.art,row:0,col:c}:{n:'IDLE POSE '+(c+1),src:'none',slot:'anim-boss-'+B.art+' row 1 frame '+(c+1)});
    [['WIND-UP',0],['CHARGE',1],['FIRE',2],['RECOVER',3]].forEach(([n,c])=>st.push(A&&A.atk?{n,src:'grid',art:B.art,row:1,col:c}:{n,src:'none',slot:'anim-boss-'+B.art+' row 2 frame '+(c+1)}));
    strip('ATTACK','attack');
    for(const p of [...new Set(pats)])st.push(S[b+'attack']?{n:'ATTACK: '+PNAME(p),src:'strip',key:b+'attack',pat:p}:{n:'ATTACK: '+PNAME(p),src:'none',slot:'anim/'+b+'attack'});
    strip('HIT','hit');strip('DEATH','defeat');
    o.push({n:B.n,id:B.art,th:`url(media/boss-${B.art}.webp)`,r:B.o.r||(k===3?54:46),A,states:st,boss:1});}
  if(kind==='enemy')for(const kk of keys.filter(x=>/^ship-e[a-z]+\/flame$/.test(x))){const id=kk.slice(0,kk.indexOf('/')),st=[{n:'IDLE',src:'none',slot:'anim/'+id+'/idle (in the game FLAME is the idle loop)'}];
    for(const [n,a] of [['FLAME','flame'],['VOLLEY','volley'],['DEATH','death']])st.push(S[id+'/'+a]?{n,src:'strip',key:id+'/'+a}:{n,src:'none',slot:'anim/'+id+'/'+a});
    o.push({n:id.slice(6).toUpperCase(),id,th:kk,states:st});}
  if(kind==='player')for(const sh of (ART.shipN||[])){const id='ship-'+sh;if(!S[id+'/flame'])continue;const bk=ART.ANIM.sm&&ART.ANIM.sm.ship_bank||{tilt_deg:14,squash_y:.9};
    o.push({n:sh.toUpperCase(),id,th:id+'/flame',states:[{n:'IDLE',src:'strip',key:id+'/flame'},{n:'BANK LEFT',src:'strip',key:id+'/flame',rot:-bk.tilt_deg,sq:bk.squash_y},{n:'BANK RIGHT',src:'strip',key:id+'/flame',rot:bk.tilt_deg,sq:bk.squash_y},
      {n:'DAMAGED',src:'none',slot:'anim/'+id+'/damaged'},{n:'DASH',src:'none',slot:'anim/'+id+'/dash'},S[id+'/death']?{n:'DEATH',src:'strip',key:id+'/death'}:{n:'DEATH',src:'none',slot:'anim/'+id+'/death'}]});}
  if(kind==='pickup'){for(const n of (ART.pkN||[]))o.push({n:n.toUpperCase(),id:'pk-'+n,th:`url(media/pk-${n}.webp)`,states:[{n:'STILL',src:'still',url:`media/pk-${n}.webp`,key:'pk-'+n},{n:'SPIN',src:'none',slot:'anim/pk-'+n+'/spin'}]});
    for(const kk of keys.filter(x=>/^pk-[a-z]+\/spin$/.test(x))){const id=kk.slice(0,kk.indexOf('/'));o.push({n:id.slice(3).toUpperCase()+' (street)',id,th:kk,states:[{n:'SPIN',src:'strip',key:kk}]});}}
  if(kind==='shot')for(const kk of keys.filter(x=>/^wpn-[a-z]+\/muzzle$/.test(x))){const id=kk.slice(0,kk.indexOf('/')),st=[];
    for(const [n,a] of [['MUZZLE','muzzle'],['BEAM','beam'],['IMPACT','impact']])st.push(S[id+'/'+a]?{n,src:'strip',key:id+'/'+a}:{n,src:'none',slot:'anim/'+id+'/'+a});
    o.push({n:id.slice(4).toUpperCase(),id,th:kk,states:st});}
  return o;}
const thumb=(i,th)=>{if(/^url\(/.test(th)){i.style.backgroundImage=th;return;}const m=AM(th);i.style.backgroundImage=`url(${SU(th)})`;if(m){i.style.backgroundSize=`${m[0]*100}% 100%`;i.style.backgroundPosition='0 0';i.style.width=Math.round(56*Math.min(1.6,m[2]/m[3]))+'px';}};
let VL=null;   // the viewer's elements
function vBuild(){view.textContent='';const L=el('div','l2col'),M=el('div','l2mid'),R=el('div','l2col');view.append(L,M,R);
  L.append(el('h3','','1. WHAT TO LOOK AT'));const kr=el('div','l2row');L.append(kr);
  for(const [k,n] of KINDS){const b=btn(kr,'',()=>{L2.kind=k;L2.item=0;L2.state=0;L2.fi=0;vBuild();},'l2k'+(L2.kind===k?' on':''));b.id='l2k_'+k;const i=el('i');const it=items(k)[0];if(it)thumb(i,it.th);b.append(i,el('span','',n));}
  const list=items(L2.kind);L.append(el('h3','','2. PICK ONE ('+list.length+')'));const ir=el('div','l2row');L.append(ir);
  list.forEach((it,j)=>{const b=btn(ir,'',()=>{L2.item=j;L2.state=0;L2.fi=0;vBuild();},'l2it'+(L2.item===j?' on':''));b.dataset.i=j;const i=el('i');thumb(i,it.th);b.append(i,el('span','',it.n));});
  const cv=el('div','l2cv'),c=el('canvas');c.id='l2canvas';cv.append(c);const zw=el('div','l2zw'),zc=el('canvas');zc.id='l2zoom';zw.append(zc,el('span','','ZOOM 2x'));cv.append(zw);
  const info=el('div','l2info');info.id='l2info';M.append(cv,info);
  const it=list[L2.item]||list[0];
  R.append(el('h3','','3. STATE (each button shows that art)'));const sr=el('div','l2row');sr.id='l2states';R.append(sr);
  if(it)it.states.forEach((s,j)=>{const b=btn(sr,s.n,()=>{L2.state=j;L2.fi=s.hold!=null?s.hold:0;L2.pt=.6;vSync();},'l2st');b.dataset.i=j;if(s.src==='none')b.title='no art yet: '+s.slot;});
  if(it&&it.boss){R.append(el('h3','','PHASE LOOK (red tint + ring, as in the fight)'));const pr=el('div','l2row');R.append(pr);[1,2,3].forEach(n=>{const b=btn(pr,'PHASE '+n,()=>{L2.phase=n;vSync();},'l2ph');b.dataset.n=n;});}
  R.append(el('h3','','PLAYBACK'));const pb=el('div','l2row');R.append(pb);
  const pl=btn(pb,'❚❚ PAUSE',()=>{L2.play=!L2.play;vSync();});pl.id='l2play';
  btn(pb,'◀ FRAME',()=>{L2.play=false;L2.fi=Math.floor(L2.fi)-1;vSync();}).id='l2prev';
  btn(pb,'FRAME ▶',()=>{L2.play=false;L2.fi=Math.floor(L2.fi)+1;vSync();}).id='l2step';
  R.append(el('h3','','SPEED'));const sp=el('div','l2row');R.append(sp);[.25,.5,1].forEach(v=>{const b=btn(sp,v+'x',()=>{L2.speed=v;vSync();},'l2sp');b.dataset.v=v;});
  R.append(el('h3','','SHOW'));const sh=el('div','l2row');R.append(sh);btn(sh,'HIT CIRCLE',()=>{L2.hit=!L2.hit;vSync();}).id='l2hit';
  R.append(el('h3','','BACKDROP (district)'));const dr=el('div','l2row');R.append(dr);['BANK','MAIN','OSTEND','MESSE','ATHEN'].forEach((n,j)=>{const b=btn(dr,n,()=>{L2.di=j;vSync();},'l2di');b.dataset.i=j;});
  VL={c,zc,info,it};vSync();}
function vSync(){if(!VL)return;const it=VL.it;
  for(const b of view.querySelectorAll('.l2st'))b.classList.toggle('on',+b.dataset.i===L2.state);
  for(const b of view.querySelectorAll('.l2ph'))b.classList.toggle('on',+b.dataset.n===L2.phase);
  for(const b of view.querySelectorAll('.l2sp'))b.classList.toggle('on',+b.dataset.v===L2.speed);
  for(const b of view.querySelectorAll('.l2di'))b.classList.toggle('on',+b.dataset.i===L2.di);
  const pl=$('l2play');if(pl)pl.textContent=L2.play?'❚❚ PAUSE':'▶ PLAY';const h=$('l2hit');if(h)h.classList.toggle('on',L2.hit);
  if(it)vDraw();}
/* the frame source of a state: {im, sx, sy, sw, sh, n, fps, name} or null while loading */
function src(s){if(s.src==='strip'){const m=AM(s.key),im=img(SU(s.key));if(!m)return null;const n=m[0],i=((Math.floor(L2.fi)%n)+n)%n;return{im,sx:i*m[2],sy:0,sw:m[2],sh:m[3],n,i,fps:m[1],name:'anim/'+s.key+'-strip.webp'};}
  if(s.src==='grid'){const A=UIK.boss[s.art],im=img('media/anim-boss-'+s.art+'.webp');return{im,sx:s.col*A.cw,sy:s.row*A.ch,sw:A.cw,sh:A.ch,n:1,i:0,fps:0,name:'anim-boss-'+s.art+'.webp (row '+(s.row+1)+', frame '+(s.col+1)+')'};}
  if(s.src==='still'){const im=img(s.url);return{im,sx:0,sy:0,sw:im.naturalWidth||1,sh:im.naturalHeight||1,n:1,i:0,fps:0,name:s.url.replace('media/','')};}
  return null;}
const tc=document.createElement('canvas');
function vDraw(){const it=VL.it,s=it&&it.states[L2.state],c=VL.c,g=c.getContext('2d'),dpr=Math.min(2,window.devicePixelRatio||1,Math.sqrt(2.2e6/Math.max(1,c.clientWidth*c.clientHeight))),w=Math.max(2,Math.round(c.clientWidth*dpr)),h=Math.max(2,Math.round(c.clientHeight*dpr));
  if(c.width!==w||c.height!==h){c.width=w;c.height=h;}g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,w,h);
  const bg=img('media/bg-'+((ART.dn&&ART.dn[L2.di])||'bankenviertel')+'.webp');
  if(ok(bg)){const k=Math.max(w/bg.naturalWidth,h/bg.naturalHeight);g.drawImage(bg,(w-bg.naturalWidth*k)/2,(h-bg.naturalHeight*k)/2,bg.naturalWidth*k,bg.naturalHeight*k);g.fillStyle='rgba(7,4,15,.45)';g.fillRect(0,0,w,h);}
  else{g.fillStyle='#0a0614';g.fillRect(0,0,w,h);}
  let lines=[];const S=s&&src(s);L2.box=null;
  if(!s){lines.push('nothing to show');}
  else if(s.src==='none'){g.fillStyle='#ff4fa3';g.font=`700 ${Math.round(28*dpr)}px monospace`;g.textAlign='center';g.fillText('NO ART',w/2,h/2-10*dpr);g.font=`${Math.round(15*dpr)}px monospace`;g.fillText(s.slot,w/2,h/2+18*dpr);
    lines.push(`<b>${it.n}</b> · ${s.n}`,`<span class="l2miss">no art: this state has no sheet yet (slot ${s.slot})</span>`);}
  else if(!S||!ok(S.im)){g.fillStyle='#ffd23d';g.font=`${Math.round(16*dpr)}px monospace`;g.textAlign='center';g.fillText('loading…',w/2,h/2);lines.push(`<b>${it.n}</b> · ${s.n} · loading ${S?S.name:''}`);}
  else{const fit=Math.min(w*.62/S.sw,h*.7/S.sh),dw=S.sw*fit*(s.sq&&s.rot?1:1),dh=S.sh*fit*(s.sq||1),cx=w/2,cy=h/2;
    let src0=S.im,sx=S.sx,sy=S.sy,sw=S.sw,sh=S.sh;
    if(it.boss&&L2.phase>1){const col=(window.BV&&BV.TINT&&BV.TINT[L2.phase-1])||'#ff3a3a',a=(window.BV&&BV.TA&&BV.TA[L2.phase-1])||.3;tc.width=sw;tc.height=sh;const q=tc.getContext('2d');q.clearRect(0,0,sw,sh);q.globalCompositeOperation='source-over';q.drawImage(S.im,sx,sy,sw,sh,0,0,sw,sh);
      q.globalCompositeOperation='source-atop';q.globalAlpha=a;q.fillStyle=col;q.fillRect(0,0,sw,sh);q.globalAlpha=1;q.globalCompositeOperation='source-over';src0=tc;sx=0;sy=0;}
    if(!L2.bare){g.save();g.translate(cx,cy);if(s.rot)g.rotate(s.rot*Math.PI/180);g.imageSmoothingEnabled=true;g.drawImage(src0,sx,sy,sw,sh,-dw/2,-dh/2,dw,dh);g.restore();}   // L2.bare (tests): the backdrop alone, to prove the sprite adds pixels
    L2.box={x:Math.round(cx-dw/2),y:Math.round(cy-dh/2),w:Math.round(dw),h:Math.round(dh)};
    if(it.boss){const R=(window.BV&&BV.RING&&BV.RING[L2.phase-1])||['#19e3ff',1.25,2];g.save();g.globalCompositeOperation='lighter';g.strokeStyle=R[0];g.lineWidth=R[2]*dpr;g.globalAlpha=.55;g.beginPath();g.arc(cx,cy,Math.max(dw,dh)*.5*R[1]*.85,0,7);g.stroke();g.restore();}
    if(s.pat)pattern(g,s.pat,cx-dw*.35,cy,fit,dpr);
    const gpx=it.boss?it.r*3.4:Math.max(S.sw,S.sh)/2.2,rr=it.boss?it.r:Math.min(S.sw,S.sh)*.3;   // game px across the drawn width (approx.) for the hit circle
    if(L2.hit){const k=dw/gpx;g.strokeStyle='#ff4a5e';g.lineWidth=2*dpr;g.setLineDash([6*dpr,4*dpr]);g.beginPath();g.arc(cx,cy,rr*k,0,7);g.stroke();g.setLineDash([]);}
    lines.push(`<b>${it.n}</b> · ${s.n}${it.boss&&L2.phase>1?' · phase '+L2.phase+' look':''}`,
      `frame ${S.i+1} of ${S.n}${S.fps?' · '+S.fps+' fps':''} · speed ${L2.speed}x · ${L2.play?'playing':'paused'}`,
      `sheet: ${S.name}`,`frame size: ${S.sw} x ${S.sh} px`+(L2.hit?` · hit circle (red, dashed): radius ${Math.round(rr)} game px${it.boss?'':' (approx.)'}`:''),
      s.rot?'bank: the flight sheet tilted as the game does when the ship moves up or down':'',s.pat?`attack preview: the yellow dots show the ${PNAME(s.pat)} shot pattern (drawn here, not the real bullets)`:'');}
  const html=lines.filter(Boolean).join('\n');if(VL.info.innerHTML!==html)VL.info.innerHTML=html;
  const z=VL.zc,zw=Math.max(2,Math.round(z.clientWidth*dpr));if(z.width!==zw){z.width=zw;z.height=zw;}const zg=z.getContext('2d');zg.imageSmoothingEnabled=false;zg.clearRect(0,0,zw,zw);
  const b=L2.box,zx=b?b.x+b.w/2:w/2,zy=b?b.y+b.h/2:h/2,half=zw/4;zg.drawImage(c,zx-half,zy-half,half*2,half*2,0,0,zw,zw);}
/* a drawn preview of a boss shot pattern: dots leave the boss to the left */
function pattern(g,p,x,y,k,dpr){const t=(L2.pt||0)%1.6,d=30*dpr+t/1.6*Math.max(0,x*.8-30*dpr),dots=[];   // the dots fly from the boss to near the left edge, never off the picture
  const fan=n=>{for(let i=0;i<n;i++){const a=Math.PI+(i-(n-1)/2)*.16;dots.push([x+Math.cos(a)*d,y+Math.sin(a)*d]);}};
  if(p==='fan5')fan(5);else if(p==='fan7')fan(7);else if(p==='fan9')fan(9);
  else if(p==='ring'){for(let i=0;i<16;i++){const a=i/16*Math.PI*2;dots.push([x+Math.cos(a)*d,y+Math.sin(a)*d]);}}
  else if(p==='spiral'){for(let j=0;j<4;j++)for(let i=0;i<5;i++){const a=j*Math.PI/2+t*3+i*.25,r=(40+i*45)*dpr;dots.push([x+Math.cos(a)*r,y+Math.sin(a)*r]);}}
  else if(p==='laser'){g.save();g.strokeStyle='#ff4fa3';g.globalAlpha=.75;g.lineWidth=10*dpr;g.beginPath();g.moveTo(x,y);g.lineTo(x-2000,y+Math.sin(t*2)*120*dpr);g.stroke();g.restore();}
  else if(p==='summon'){for(let i=0;i<3;i++)dots.push([x-d*.6,y+(i-1)*60*dpr]);}
  g.save();g.fillStyle='#ffd23d';g.shadowColor='#ffd23d';g.shadowBlur=8*dpr;for(const [a,b] of dots){g.beginPath();g.arc(a,b,(p==='summon'?10:6)*dpr,0,7);g.fill();}g.restore();}
function vTick(now){L2.raf=0;if(L2.page!=='viewer'||view.hidden)return;if(document.hidden||(L2.last&&now-L2.last<32)){L2.raf=requestAnimationFrame(vTick);return;}const dt=Math.min(.1,(now-(L2.last||now))/1000);L2.last=now;
  const s=VL&&VL.it&&VL.it.states[L2.state],m=s&&s.src==='strip'&&s.hold==null&&AM(s.key);if(L2.play&&m)L2.fi+=dt*m[1]*L2.speed;if(L2.play)L2.pt=(L2.pt||0)+dt*L2.speed;
  if(VL)vDraw();L2.raf=requestAnimationFrame(vTick);}
function vStart(){if(!VL||!view.firstChild)vBuild();if(!L2.raf){L2.last=0;L2.raf=requestAnimationFrame(vTick);}}
function vStop(){if(L2.raf){cancelAnimationFrame(L2.raf);L2.raf=0;}}
})();
