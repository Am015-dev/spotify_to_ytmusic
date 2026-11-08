// ===================== part 11: the coached first game (W407) =====================
// The owner rejected forced tap-tap tutorials. The tutorial is now ONE real game against Tamsin with free choices from the first tap.
// A stacked start (the last round of a game: 12 tiles already on your wall, five loaded kilns) makes sure the scoring situations can come up.
// Mother Ochre (one small bubble at a time, never blocking input, dismissable) explains each rule the first time it matters, reacts to
// good and poor moves in one line, and walks the final scoring with the player's real numbers. Rules that never came up go on the end card.
// Every rule id below is listed in TUTORIAL-COVERAGE.md and is checked by game/tutor-e2e.js (said in play, or listed on the end card).
const TUT_GAME='sunglaze';
const TUT={at:null,res:null,coach:true,pro:null};
const tutOn=()=>!!UI.tut&&!!UI.cg;
const firstTime=()=>{try{return !localStorage.getItem('sgz_guided')&&!localStorage.getItem('sgz_offer')&&!GXT.status(TUT_GAME).seen}catch(e){return true}};
const tutBtn=(cls,sub)=>typeof GXT==='undefined'?'':GXT.menuHTML({game:TUT_GAME,first:firstTime(),cls:cls,launch:tutLaunch,sub:sub});
const tutWait=(cond,ms)=>new Promise(res=>{const t0=Date.now();(function f(){let ok=false;try{ok=cond()}catch(e){}if(ok||Date.now()-t0>(ms||20000))res();else setTimeout(f,60)})()});

const TUT_K=[[2,2,1,0],[4,4,3,3],[0,0,0,1],[2,2,2,2],[4,4,4,4]];      // the five kilns: Garnet Garnet Saffron Cobalt | Frost Frost Obsidian Obsidian | Cobalt x3 Saffron | Garnet x4 | Frost x4
function tutBuild(){UI.sel=null;UI.tgt=null;UI.adv=null;UI.hover=null;UI.fx.length=0;UI.fxSeen=0;UI.recap=[];UI.modal=null;UI.lastHuman=null;UI.guideNote='';
  const _r=refresh;refresh=function(){};
  try{newGame({np:2,seats:['human','ai'],lv:['normal','easy'],names:['Coral','Tamsin'],mode:'x'})}finally{refresh=_r}
  const take=c=>{const k=G.bag.indexOf(c);if(k<0)throw Error('tutor: the sack has no tile '+c);G.bag.splice(k,1)};
  for(const a of G.fac)G.bag.push(...a);
  G.fac=TUT_K.map(a=>{a.forEach(take);return a.slice()});
  const put=(p,r,c,v)=>{take(v);P(p).wall[r][c]=v};
  for(let c=0;c<4;c++)put(0,0,c,WALLC(0,c));                           // your top row: four of five
  for(let r=1;r<5;r++)put(0,r,4,WALLC(r,4));                           // the last column: four of five
  for(const [r,c] of [[1,0],[2,1],[3,2],[4,3]])put(0,r,c,4);           // four of the five Frost tiles
  for(let r=0;r<3;r++)put(1,r,WALLCOL(0,r),0);                         // Olive: three Cobalt, two Saffron
  for(let r=0;r<2;r++)put(1,r,WALLCOL(1,r),1);
  P(0).score=21;P(1).score=12;G.round=4;G.first=0;G.cur=0;G.markerIn='ctr';G.log=[];G.logN=0;G.turn=0;
  UI.fx.length=0;UI.fxSeen=0;BF.gk='';BF.q.length=0;BF.seen={};
  try{resetScene()}catch(e){}
  TUT.t0=Date.now();refresh()}

// ---------------------------------------------------------------- the coach: ONE small bubble at a time, never blocks input
// RULE IDS (each said once, in play, the first time it matters; the rest are listed on the end card):
const CG_RULES={goal:'Tile the palace wall; most stars wins',kilns:'Kilns hold four tiles; take from a kiln or the middle',take:'Take EVERY tile of one colour from one place',
  rows:'Pattern row n holds n tiles of ONE colour',slide:'The rest of the kiln slides to the middle',rival:'The rival takes turns too',middle:'Taking from the middle: the first to do so takes the Sun token',
  overflow:'Tiles that do not fit fall to the floor',floor:'Floor spaces cost -1 -1 -2 -2 -2 -3 -3',sun:'The Sun token costs a floor space and you start the next round',
  keep:'A row that is not full keeps its tiles for later',blocked:'A colour already on a wall row cannot go on that row',roundend:'The round ends when every kiln and the middle are empty',
  tiling:'Each full row sends ONE tile to the wall, the rest is discarded',alone:'A tile alone on the wall scores 1',chain:'Touching tiles score row line + column line',
  floorpen:'Floor penalties apply at round end (score never below 0)',gameend:'The game ends after the round in which a wall row is complete',
  bonus:'End bonuses: row +2, column +7, all five of a colour +10',win:'Most points wins; a tie goes to the most full rows',
  players:'3 and 4 players use 7 and 9 kilns',shard:'An empty sack is refilled from the shard box',nofit:'If nothing fits, tap the floor',variants:'Unmarked and prism variants have their own rule cards'};
const CG_LATER=['players','shard','nofit','variants'];       // can never come up in this 2-player staged game: always on the end card unless seen
const CG={said:{},q:[],cur:null,shownAt:0,el:null,timer:null,moves:0,lastPraise:-9,t:0};
window.__cg=CG;
window.GXCOACH={running:false,explained:[],done:false};   // read by scripts/qa-bot.js (coached-game driver)
const cgSync=()=>{const g=window.GXCOACH;g.explained=Object.keys(CG.said).filter(k=>CG.said[k])};
const cgName=c=>TNAME[c]||'tile';
const cgPl=(n,w)=>n+' '+w+(n===1?'':'s');
function cgCss(){if(document.getElementById('cg-css'))return;const s=document.createElement('style');s.id='cg-css';
  s.textContent='.cg-b{position:fixed;z-index:60;box-sizing:border-box;pointer-events:none;display:flex;gap:6px;align-items:flex-start;padding:6px 4px 6px 12px;border-radius:14px;background:#fff1cf;color:#3a1d12;border:2px solid #b98a3e;box-shadow:0 6px 18px rgba(0,0,0,.45);font:600 13.5px/1.28 var(--ff,system-ui,sans-serif);animation:cg-in .2s ease-out both}'
  +'.cg-b b{display:block;font-size:13px;letter-spacing:.04em;text-transform:uppercase;color:#7a1f31;margin-bottom:1px}.cg-b .cg-t{flex:1;min-width:0}'
  +'.cg-x{pointer-events:auto;flex:none;width:44px;height:44px;margin:-8px -2px -8px 0;border:0;background:transparent;color:#7a1f31;font:800 22px/1 var(--ff,system-ui);cursor:pointer}'
  +'.cg-b.pr{background:#e8f6e0;border-color:#5b9a43}.cg-b.po{background:#fff0e0;border-color:#d08a3a}'
  +'@keyframes cg-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}@media (prefers-reduced-motion:reduce){.cg-b{animation:none}}'
  +'@media (min-width:1024px){.cg-b,.cg-b b,.cg-later,.cg-x{font-size:16px}.cg-b{width:420px!important}}.cg-later{text-align:left;font-size:13px;font-weight:600;margin:0;padding-left:18px}.cg-later li{margin:2px 0}';
  document.head.appendChild(s)}
function cgPlace(){const e=CG.el;if(!e)return;
  const ov=document.querySelector('.gxc.gxc-map-on,.gxc.on,.gx-scrim.on,.gx-drawer.on,#modal:not([hidden]) *');e.style.visibility=ov?'hidden':'';if(ov)return;   // never over a menu, drawer or the Story map
const W=innerWidth,H=innerHeight;const me=document.querySelector('.bf-me');const r=me&&me.getBoundingClientRect();
  const w=Math.min(W-16,r&&r.width>200?Math.max(300,Math.min(r.width,400)):360);e.style.width=w+'px';
  let left=r&&r.width>200?Math.min(r.left,W-w-8):(W-w)/2;e.style.left=Math.max(8,left)+'px';
  const h=e.getBoundingClientRect().height;
  const hn=document.querySelector('.bf-line');const hr=hn&&hn.getBoundingClientRect();const anchor=hr&&hr.height>8&&hr.top>100?hr.top:(r&&r.height>60?r.top:0);   // sit above the instruction line, never on it
  if(anchor&&anchor-h-6>44){e.style.top=Math.round(anchor-h-4)+'px'}else e.style.top='40px'}
function cgHide(){clearTimeout(CG.timer);CG.timer=null;if(CG.el){CG.el.remove();CG.el=null}CG.cur=null;clearInterval(CG.pi);CG.pi=null;setTimeout(cgNext,250)}
function cgNext(){if(CG.cur||!UI.cg||!CG.q.length)return;const n=CG.q.shift();cgShow(n.text,n.o,true)}
// say(id, text, opts): a rule lesson is spoken once (said[id]); opts.kind = 'pr' (good move) | 'po' (poor move); opts.hold = the board waits (round-end beats)
function cgSay(id,text,o){o=o||{};if(!UI.cg||!text)return false;if(id&&CG.said[id]&&!o.again)return false;if(id)CG.said[id]=(CG.said[id]||0)+1;cgSync();
  if(CG.cur&&Date.now()-CG.shownAt>3200&&!o.hold){cgShow(text,o,true);return true}   // never two at once: a stale one is replaced, a fresh one makes this wait
  if(CG.cur){if(CG.q.length>=2)CG.q.shift();CG.q.push({text,o});return true}
  cgShow(text,o,true);return true}
function cgShow(text,o,force){o=o||{};text=sgShort(text);cgCss();clearTimeout(CG.timer);if(CG.el)CG.el.remove();
  const e=document.createElement('div');e.className='cg-b cg-coach'+(o.kind?' '+o.kind:'');e.setAttribute('role','status');e.setAttribute('data-help','');e.setAttribute('data-cg','1');
  e.innerHTML='<div class="cg-t"><b>'+(o.who||'Mother Ochre')+'</b>'+text.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</div><button type="button" class="cg-x" aria-label="Dismiss the guide">&times;</button>';
  e.querySelector('.cg-x').addEventListener('click',ev=>{ev.stopPropagation();cgHide()});
  document.body.appendChild(e);CG.el=e;CG.cur=text;CG.shownAt=Date.now();cgPlace();clearInterval(CG.pi);CG.pi=setInterval(cgPlace,400);
  const ms=Math.max(5200,Math.min(11000,2500+text.length*60));CG.timer=setTimeout(cgHide,o.hold?ms+2500:ms)}
// ---------------------------------------------------------------- what a move means (computed before it is applied)
function cgInfo(m,s){const a=m.src<0?G.ctr:G.fac[m.src];const n=a.filter(t=>t===m.c).length;const p=P(s);
  const space=m.line<5?cap(m.line)-p.lines[m.line].length:0;const over=m.line<5?Math.max(0,n-space):n;
  const fl=Math.min(over,Math.max(0,7-p.floor.length));let pen=0;for(let i=0;i<fl;i++)pen+=FLOOR[p.floor.length+i];
  const sun=m.src<0&&G.markerIn==='ctr';return {n,space,over,pen,sun,c:m.c,line:m.line,src:m.src,
    fill:m.line<5&&over===0&&n===space,rest:m.src<0?0:a.length-n,wallFull:m.line<5?p.wall[m.line].filter(v=>v>=0).length:0}}
const cgAfterKey=['open','hint'];
function cgOpen(){CG.said={};CG.q.length=0;CG.moves=0;CG.lastPraise=-9;cgCss();
  setTimeout(()=>{if(!tutOn()||G.turn>0)return;CG.said.goal=1;CG.said.kilns=1;CG.said.take=1;
    cgSay(null,'Goal: have the most stars when a wall row is full.\n• Tap a tile: you take every tile of that colour.\n• Put them on a row. Full rows move to your wall.\n• Touching wall tiles score more. Extras cost points.')},900);
  setTimeout(()=>{if(tutOn()&&G.turn===0&&sideToAct()===0)cgSay(null,'Your turn: any kiln, any row.\nTip: the lone Frost fills your top row.')},9500)}
function cgPick(s){if(!UI.sel||UI.sel.src!==s.src||UI.sel.c!==s.c)return;const p=P(0);const nm=cgName(s.c);
  const a=s.src<0?G.ctr:G.fac[s.src];const n=a.filter(t=>t===s.c).length;
  if(s.src<0&&G.markerIn==='ctr')cgSay('middle','The middle: the first player to take from it also takes the Sun token, which costs a floor space. Not always bad, but know it.');
  else if(s.src<0)cgSay('middle','The middle holds what the kilns left over. Take all of one colour, as always.');
  if(!CG.said.take)cgSay('take','You take every '+nm+' tile on a kiln at once ('+n+' here). Now tap a glowing row.');
  const blocked=[0,1,2,3,4].filter(r=>rowHas(p,r,s.c));
  if(blocked.length)cgSay('blocked',nm+' is already on wall row '+(blocked[0]+1)+', so that row is closed to '+nm+': a glaze appears once per wall row.');
  if(!movesFor(s).some(m=>m.line<5))cgSay('nofit','Nothing fits ('+nm+' is on every open row). Tap the floor: those tiles cost stars, but you must take them.')}
function cgBefore(m,s){const I=cgInfo(m,s);CG.moves++;const name=cgName(m.c);const you=s===0;
  if(you){
    if(m.line===5){cgSay('floor','Straight to the floor: each floor space costs stars when the round ends: −1, −1, −2, −2, −2, −3, −3.',{kind:'po'});if(CG.said.floor>1&&CG.moves-CG.lastPraise>1){CG.lastPraise=CG.moves;cgSay(null,'Poor: '+I.n+' tiles straight to the floor is '+I.pen+' stars.',{kind:'po'})}}
    else if(I.over>0){cgSay('overflow','Row '+(m.line+1)+' holds '+cap(m.line)+', so '+cgPl(I.over,'tile')+' crack onto the floor. At round end, floor spaces cost −1, −1, −2, −2, −2, −3, −3.',{kind:'po'});
      CG.said.floor=CG.said.floor||1;
      if(CG.said.overflow>1&&CG.moves-CG.lastPraise>1){CG.lastPraise=CG.moves;cgSay(null,'Poor: '+cgPl(I.over,'tile')+' crack ('+I.pen+'). Look for a row that fits all '+I.n+'.',{kind:'po'})}}
    else if(m.line===0&&I.wallFull===4&&I.fill){cgSay('gameend','This tile completes a wall row. The game ends after this round.',{kind:'pr'})}
    else if(I.fill){if(!CG.said.rows)cgSay('rows','Row '+(m.line+1)+' holds exactly '+(m.line+1)+' tiles of one colour, and you filled it. At round end one tile goes to your wall.',{kind:'pr'});
      else if(CG.moves-CG.lastPraise>2){CG.lastPraise=CG.moves;cgSay(null,'Good: a perfect fit, no cracks.',{kind:'pr'})}}
    else{cgSay('keep','Row '+(m.line+1)+' is not full yet ('+(cap(m.line)-I.space+I.n)+' of '+cap(m.line)+'). It keeps its tiles for the next round; nothing is lost.');
      CG.said.rows=CG.said.rows||1}
    if(I.sun)cgSay('sun','You took from the middle first. The Sun token sits on your floor (−1). But you open the next round.');
  }else{const who='Tamsin';const where=m.src<0?'the middle':'a kiln';
    if(!CG.said.rival)cgSay('rival',who+' takes '+cgPl(I.n,name+' tile')+' from '+where+(I.rest?'. The '+I.rest+' she leaves slide to the middle.':'.'),{who:'Tamsin plays'});
    else if(I.sun&&!CG.said.sun)cgSay('sun',who+' took the Sun token: it costs her a floor space, but she opens the next round.',{who:'Tamsin plays'});
    else if(I.over>1&&!CG.said.overflow)cgSay('overflow',who+' cracked '+cgPl(I.over,'tile')+' onto her floor: tiles that do not fit cost stars at round end.',{who:'Tamsin plays'});
    else if(I.rest>=2&&!CG.said.slide)cgSay('slide',who+' left '+I.rest+' tiles: leftovers always slide to the middle for anyone to claim.',{who:'Tamsin plays'})}}
function cgAfter(m,s){const I=CG.I;if(!I)return;if(s===0&&m.src>=0&&I.rest>0)cgSay('slide','The '+I.rest+' tile'+(I.rest>1?'s':'')+' you left slid to the middle: anyone may take them from there.');
  if(!CG.said.rival&&s===0&&G.phase==='offer'&&G.cur===1)CG.rivalWait=1}
// ---------------------------------------------------------------- the round-end beats (the board waits inside the animation queue)
function cgBeat(name,x){const p=P(0);const R=G.rsum&&G.rsum[0];
  if(name==='tiling'){CG.said.roundend=CG.said.roundend||0;return {id:'roundend',text:'Every kiln and the middle are empty: the round is over. Each full row sends ONE tile to your wall. The rest of that row go to the shard box. Rows that are not full keep their tiles.',also:['tiling']}}
  if(/^wall\d$/.test(name)){if(!x||x.p!==0)return null;const rr=x.run||[1,1];const H=rr[0],V=rr[1];
    if(x.pts===1&&H===1&&V===1)return {id:'alone',text:'This tile touches no other tile, so it scores 1 star. Everyone starts small.',also:['tiling']};
    const parts=[];if(H>1)parts.push(H);if(V>1)parts.push(V);
    return {id:'chain',text:'This tile touches '+(H>1?cgPl(H,'tile')+' across':'')+(H>1&&V>1?' and ':'')+(V>1?cgPl(V,'tile')+' down':'')+': '+parts.join(' + ')+' = '+x.pts+' stars. Touching lines count, so build in clusters.',also:['tiling']}}
  if(name==='floor'){if(!R||!R.nb)return null;const pen=R.pen||0;const note=R.floor!==undefined&&-R.floor!==-pen&&p.score===0?' (a score never drops below 0)':'';
    return {id:'floorpen',text:'Your floor held '+cgPl(R.nb,'space')+(R.sun?', including the Sun token':'')+': '+pen+' stars'+note+'. Floor spaces cost −1, −1, −2, −2, −2, −3, −3.',also:['floor','overflow']}}
  if(name==='bonus'){const o=G.over&&G.over.scores.find(z=>z.p===0);if(!o)return null;const s=o.s;const rows=s.rows/BONUS.row,cols=s.cols/BONUS.col,cl=s.colours/BONUS.colour;
    const t=G.over.scores.find(z=>z.p===1);
    return {id:'bonus',text:'A wall row is complete, so the game ends. Your bonuses: '+cgPl(rows,'full row')+' × 2 = '+s.rows+', '+cgPl(cols,'full column')+' × 7 = '+s.cols+', '+cgPl(cl,'glaze')+' with all five tiles × 10 = '+s.colours+'. Tamsin: +'+(t.s.rows+t.s.cols+t.s.colours)+'.',also:['gameend']}}
  if(name==='final'){const a=P(0).score,b=P(1).score;const w=G.over&&G.over.win.includes(0);
    return {id:'win',text:'Final: you '+a+', Tamsin '+b+'. '+(w?'The Sun King sets his seal on your wall. ':'Tamsin takes the commission this time. ')+'Most points wins; on a tie, the most full rows.',also:[]}}
  return null}
function tutPause(name,x){return new Promise(res=>{if(!UI.tut||!tutOn()){res();return}
  let b=null;try{b=cgBeat(name,x)}catch(e){console.error('tutor beat',e)}
  if(!b){res();return}
  CG.said[b.id]=(CG.said[b.id]||0)+1;for(const k of b.also||[])CG.said[k]=CG.said[k]||1;cgSync();
  CG.q.length=0;cgShow(b.text,{hold:true,kind:'pr'});
  let done=false;const fin=()=>{if(done)return;done=true;clearTimeout(tm);document.removeEventListener('pointerdown',onp,true);TUT.res=null;TUT.at=null;res();if(name==='final')setTimeout(()=>{if(tutOn())cgEnd()},bfD(500))};
  const onp=ev=>{if(ev.target&&ev.target.closest&&ev.target.closest('.cg-b'))return;if(Date.now()-CG.shownAt>900)fin()};
  const tm=setTimeout(fin,bfD(Math.max(2000,Math.min(5200,1400+b.text.length*32))));
  document.addEventListener('pointerdown',onp,true);TUT.at=name;TUT.res=fin})}
function tutRelease(){const r=TUT.res;TUT.at=null;TUT.res=null;if(r)r()}
function cgRound(){if(!tutOn())return;const p=P(0);
  const part=p.lines.map((L,r)=>[L.length,r]).filter(([n,r])=>n>0&&n<cap(r));
  if(part.length)cgSay('keep','Row '+(part[0][1]+1)+' keeps its '+part[0][0]+' tile'+(part[0][0]>1?'s':'')+' from last round and needs '+(cap(part[0][1])-part[0][0])+' more.');
  if(G.first===0&&G.round>1)cgSay('sun','You hold the Sun token. You take the first turn this round.')}
// ---------------------------------------------------------------- the end card: what was never met, then the choices
function cgEnd(){const d=document.createElement('div');d.className='gxt-end';d.setAttribute('data-help','');d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');d.setAttribute('aria-label','Tutorial finished');
  const later=Object.keys(CG_RULES).filter(k=>!CG.said[k]);const pro=TUT.pro;const first=window.CAMPAIGN&&window.CAMPAIGN.chapters&&window.CAMPAIGN.chapters[0];
  const btn=[];if(pro&&first)btn.push(['chapter','Start chapter 1']);if(pro)btn.push(['map','Story map']);btn.push(['play',pro?'Just play':'Play a real game']);btn.push(['again','Play the guide again']);
  window.__cgEnd={later:later.slice(),said:Object.assign({},CG.said)};cgSync();window.GXCOACH.done=true;
  d.innerHTML='<div class="gxt-endc"><div class="gxt-ek" aria-hidden="true">&#10003;</div><div class="gxt-et">Well fired</div><div class="gxt-ex">Mother Ochre: you read the kilns like a master.'+(later.length?' Things you\'ll meet later:':'')+'</div>'
    +(later.length?'<ul class="cg-later">'+later.map(k=>'<li>'+CG_RULES[k].replace(/([^.!?])$/,'$1.')+'</li>').join('')+'</ul>':'')
    +'<div class="gxt-eb">'+btn.map((b,i)=>'<button type="button" class="gxt-b'+(i?'':' pri')+'" data-cg-end="'+b[0]+'">'+b[1]+'</button>').join('')+'</div></div>';
  d.addEventListener('click',e=>{const b=e.target.closest('[data-cg-end]');if(!b)return;const c=b.dataset.cgEnd;d.remove();
    try{GXT.markDone(TUT_GAME)}catch(er){}tutLeave();
    if(c==='again'){tutStart({prologue:pro});return}
    if(c==='chapter'&&first){openStart();GXC.play(first.id)}else if(c==='map'&&typeof campOpen==='function')campOpen();else openStart()});
  document.body.appendChild(d)}

// ---------------------------------------------------------------- start, leave, story
function tutSetup(){try{GX.close()}catch(e){}try{GXH.hide()}catch(e){}
  clearTimeout(aiTimer);aiTimer=null;TUT.at=null;TUT.res=null;TUT.coach=UI.coach;UI.coach=false;UI.tut=1;UI.cg=1;UI.pause=false;
  const m=document.getElementById('modal');if(m){m.hidden=true;m.innerHTML='';m.dataset.h=''}
  window.__tutPh=1;phApply();bfApply();                                  // the board-first table, on any screen
  tutBuild();cgOpen();Object.assign(window.GXCOACH,{running:true,done:false,explained:[]})}
function tutLeave(){window.GXCOACH.running=false;tutRelease();UI.tut=0;UI.cg=0;UI.coach=TUT.coach;UI.sel=null;UI.tgt=null;UI.adv=null;clearTimeout(aiTimer);aiTimer=null;
  cgHide();CG.q.length=0;document.querySelectorAll('.gxt-top[data-cg],.gxt-end[aria-label="Tutorial finished"]').forEach(e=>e.remove());
  try{bfSpeedUp()}catch(e){}BF.q.length=0;BF.gk='';BF.disp=null;BF.resHide=false;BF.menu=false;BF.peek=null;G=null;
  try{GXH.hide()}catch(e){}window.__tutPh=0;phApply();bfApply();try{resetScene()}catch(e){}}
function cgStrip(){document.querySelectorAll('.gxt-top[data-cg]').forEach(e=>e.remove());const t=document.createElement('div');t.className='gxt-top';t.setAttribute('data-cg','1');t.setAttribute('data-help','');
  t.innerHTML='<span>Coached game: play any move</span><button type="button" class="gxt-skip" data-cg-skip>'+(TUT.pro?'Skip to map':'Leave tutorial')+'</button>';
  t.style.height='34px';t.querySelector('button').addEventListener('click',()=>{try{GXT.markDone(TUT_GAME)}catch(e){}const pro=TUT.pro;tutLeave();if(pro&&typeof campOpen==='function')campOpen();else openStart()});document.body.appendChild(t)}
function tutStart(o){if(typeof GXT==='undefined')return;TUT.pro=o&&o.prologue?o:null;tutSetup();cgStrip()}
function tutLaunch(){tutStart()}
// Story is preceded by the tutorial (Chapter 0) until it has been finished once; a finished player goes straight to the chapter map
function storyOpen(){if(typeof GXC==='undefined')return;if(typeof GXT!=='undefined'&&!GXT.isDone(TUT_GAME))tutStart({prologue:true});else campOpen()}
// first-time players tapping Begin are offered the tutorial once
function tutOffer(){if(typeof GXT==='undefined'||UI.tut||NET.on||!firstTime())return false;
  try{localStorage.setItem('sgz_offer','1')}catch(e){}
  const d=document.createElement('div');d.className='gxt-end';d.setAttribute('data-help','');d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');d.setAttribute('aria-label','New here?');
  d.innerHTML='<div class="gxt-endc"><div class="gxt-et">New here?</div><div class="gxt-ex">A guide plays one game with you. Each rule, right when it matters.</div><div class="gxt-eb"><button type="button" class="gxt-b pri" data-offer="learn" data-a="learn">Learn to play</button><button type="button" class="gxt-b sg-link" data-offer="play" data-a="play">Play now</button></div></div>';
  d.addEventListener('click',e=>{const b=e.target.closest('[data-offer]');if(!b)return;d.remove();if(b.dataset.offer==='learn')tutStart();else beginGame()});
  document.body.appendChild(d);return true}
// ---------------------------------------------------------------- the coach watches every move (before it is applied); input is never blocked
(function(){const o=pickSel;pickSel=function(s){const r=o.apply(this,arguments);if(tutOn()){try{cgPick(s)}catch(e){console.error('tutor',e)}}return r}})();
(function(){const o=go;go=function(m){let I=null;if(tutOn()){const s=sideToAct();if(s>=0&&P(s)&&m&&m.act==='take'){try{I=cgInfo(m,s);CG.I=I;cgBefore(m,s)}catch(e){console.error('tutor',e)}}}
  const s0=sideToAct();const r=o.apply(this,arguments);if(tutOn()&&I){try{cgAfter(m,s0)}catch(e){}}return r}})();
// W466: the coached game is our own (not a GXT step list); report it through the shared tutor API so test drivers
// (feel-audit, qa-bot) can follow it: the highlighted target is the ghost-finger move, or else any glowing piece.
if(typeof GXT!=='undefined'){const _run=GXT.running,_st=GXT.state;
  const cgOn=()=>!!(UI.tut&&G&&BF&&BF.on);
  const cgHole=()=>{let el=null;try{const hp=me();if(hp&&!BF.busy&&!BF.q.length)el=bfFingerTarget(hp)}catch(e){}
    if(!el&&BF.root&&!BF.busy){const q=s=>BF.root.querySelector(s);el=G.phase==='wall'?q('.bf-c.pick'):UI.sel?(q('.bf-row.ok .bf-rack')||q('.bf-floor.ok .bf-fl')||q('.bf-floor .bf-fl')):(q('.bf-table .bf-t[role=button]:not(.nofit)')||q('.bf-table .bf-t[role=button]'))}
    const r=el&&el.getBoundingClientRect();return r&&r.width?{left:r.left,top:r.top,width:r.width,height:r.height,cx:r.left+r.width/2,cy:r.top+r.height/2}:null};
  GXT.running=function(){return _run.apply(this,arguments)||cgOn()||!!(UI.tut&&G&&G.over)};
  GXT.state=function(){if(_run.call(GXT)||!(UI.tut&&G))return _st.apply(this,arguments);
    if(G.over)return {active:false,phase:'end',i:G.logN,count:0,shown:false,wait:null};
    const h=cgHole();return {active:true,phase:'show',i:G.logN,id:'coached',count:UI.sel?1:0,shown:!!h,wait:'tap',hole:h,holes:h?[h]:[]}}}
