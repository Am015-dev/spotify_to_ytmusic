// ===================== coach.js: the tutorial is a COACHED FIRST GAME (free play, one non-blocking bubble at a time) =====================
// The staged job (3 players, 15 wires, fuse of 3, Rewind) is played for real: every legal move is allowed, the computer crew plays its real moves.
// Brix (and Quill) speak just-in-time: when a rule first matters, after your move, after a rival's move. No forced taps at all.
// Rules that never came up are listed in "Things you'll meet later" on the end card. Words: story.js STORY.coach. Coverage: ../TUTORIAL-COVERAGE.md
const CO={on:false,done:false};
window.GXCOACH={get running(){return !!(UI.coach&&!CO.done&&G)},get explained(){return UI.coach?Object.keys(UI.coach.seen):(CO.last||[])},get done(){return CO.done}};
const coOn=()=>!!(typeof UI!=='undefined'&&UI.coach&&G);
function tutStart(o){const pro=!!(o&&o.prologue);try{const d=document.getElementById('offer');if(d)d.remove()}catch(e){}
  try{GX.close()}catch(e){}hideStart();try{GXH.hide()}catch(e){}
  UI.coach={seen:{},q:[],cur:null,pro:pro,t:0,turns:0};CO.done=false;coClear();
  if(!MISSIONS[67]){MISSIONS[67]=Object.assign({},MISSIONS[1],{n:67,nm:'Training run',text:'A tiny practice bomb: 15 wires, three crew, one gear card.',pl:[3],blue:3,red:null,yel:null,eq:{n:0},rules:[],info:'std',tok:'num',audio:false,timer:null});BRIEFS[67]='A tiny practice bomb.';TUT.mission=true}
  if(TUT.eqv==null){TUT.eqv=EQUIP.eq6.v;EQUIP.eq6.v=2}
  UI.tut=false;UI.tutTok=(UI.tutTok||0)+1;kitReset();clearTimeout(UI.aiT);UI.aiT=null;UI.rt=false;UI.started=false;UI.sel=null;UI.prev=null;UI.holder=-1;UI.offSeat=null;UI.campDone=0;UI.campShown=0;UI.wwk=null;UI.pause=false;UI.camp=null;UI.brief=null;UI.aiNotBefore=0;UI.lastPrompt=null;UI.ghost={info:0,turn:0};
  UI.started=true;
  newGame({np:3,mission:67,seats:['human','ai','ai'],level:'easy',names:DEFNAMES.slice(0,3),realtime:false,captain:0,seed:7});
  tutRebuild();UI.holder=0;UI.prev=snap();coAddSkip();coPush('goal');coPush('mine');coPush('crew');coPush('fuse');refresh()}
function coAddSkip(){let b=document.getElementById('coachskip');if(!b){b=document.createElement('button');b.id='coachskip';b.type='button';b.setAttribute('data-help','');b.textContent=UI.coach&&UI.coach.pro?'Skip to map':'Skip tutorial';b.addEventListener('click',()=>coExit(false));document.body.appendChild(b)}}
function coClear(){clearTimeout(CO.t);CO.cur=null;for(const id of ['coach','coachskip','coachend']){const e=document.getElementById(id);if(e)e.remove()}}
function coExit(done){const pro=UI.coach&&UI.coach.pro;if(UI.coach){CO.last=Object.keys(UI.coach.seen)}CO.done=true;coClear();if(done||true){try{GXT.markDone(TUT_GAME)}catch(e){}}
  UI.coach=null;tutLeave();showStart();if(pro&&!done&&typeof GXC!=='undefined')GXC.open()}
// ---- the one bubble ----
function coPush(id,front){const c=UI.coach;if(!c||c.seen[id]||c.q.includes(id)||c.curId===id)return;const t=STORY.coach[id];if(!t)return;if(front)c.q.unshift(id);else c.q.push(id);if(!c.curId)coNext()}
function coNext(){const c=UI.coach;if(!c)return;clearTimeout(CO.t);const old=document.getElementById('coach');if(old)old.remove();c.curId=null;
  const id=c.q.shift();if(!id)return;c.curId=id;c.seen[id]=1;const d=STORY.coach[id];const who=d[0]==='quill'?STORY.rival.name:STORY.guide.name;
  const txt=typeof d[2]==='function'?d[2]():d[2];
  const b=document.createElement('div');b.id='coach';b.className='coachcard co-'+d[0];b.setAttribute('data-help','');b.dataset.step=id;
  b.innerHTML='<div class="cop"></div><div class="cob"><div class="cot">'+esc(who+' · '+d[1])+'</div><div class="cox">'+esc(txt)+'</div></div><button type="button" class="coz" aria-label="Got it">Got it</button>';
  document.body.appendChild(b);b.querySelector('.coz').addEventListener('click',()=>coNext());coPlace();
  CO.t=setTimeout(coNext,Math.max(3200,txt.split(/\s+/).length*300)/Math.max(1,UI.speed||1))}
function coPlace(){const b=document.getElementById('coach');const m=document.getElementById('mine');if(!b)return;const r=m?m.getBoundingClientRect():null;const h=b.offsetHeight;
  const top=r?Math.max(96,r.top-h-26):96;b.style.top=top+'px'}
window.addEventListener('resize',()=>{try{coPlace()}catch(e){}});
// ---- just-in-time triggers ----
function coWatch(){const c=UI.coach;if(!c||!G||G.over)return;const me=0;
  if(G.q&&G.q.who===me&&G.q.kind==='infoStd')coPush('token');
  if(G.phase==='turn'){coPush('tokens2');
    if(decider()===me&&!G.q&&UI.V&&UI.V.legal){c.turns++;coPush('point');
      const mine=G.st[0].w.filter(x=>!x.cut);if(mine.some(x=>String(x.id)===String(59)))coPush('yellow');if(mine.some(x=>x.id===49))coPush('red');
      if(c.turns>1&&document.querySelector('#mine .chip'))coPush('probe')}
    if(G.eq&&G.eq[0]&&G.eq[0].st!=='locked')coPush('gear')}}
function coAfter(m,seat,L,dc,missed){const c=UI.coach;if(!c||!m)return;const txt=L.map(e=>e.t).join(' ');
  if(seat===0){if(m.a==='solo')coPush('solo',true);else if(m.a==='dual'){if(missed){coPush('miss',true);coPush('poor')}else if(dc>0){coPush('hit',true);coPush('good')}}}
  else{if(m.a==='solo')coPush('crew1');else if(m.a==='dual'&&dc>0)coPush('crew2');else if(m.a==='dual'&&missed)coPush('rmiss',true)}
  if(/validation token/.test(txt))coPush('check');if(/unlocked/.test(txt))coPush('gear')}
function coEnd(){const c=UI.coach;if(!c||document.getElementById('coachend'))return;clearTimeout(CO.t);const b=document.getElementById('coach');if(b)b.remove();
  const w=!!(G.over&&G.over.win),S=G.stats||{};const later=Object.keys(STORY.later).filter(id=>!c.seen[id]);
  const cut=G.st.reduce((a,s)=>a+s.w.filter(x=>x.cut).length,0),tot=G.st.reduce((a,s)=>a+s.w.length,0);
  const rows=[['Guesses that hit',S.dualOk||0,' of '+(S.dual||0)+' (each cut two wires)'],['Solo cuts',S.solo||0,' (cut with no guessing)'],['Misses',S.miss||0,' (each burned a fuse step)'],['Fuse left',Math.max(0,G.dial),' of 3'],['Wires cut',cut,' of '+tot]];
  const d=document.createElement('div');d.id='coachend';d.className='gxt-end';d.setAttribute('data-help','');d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');
  d.innerHTML='<div class="gxt-endc"><div class="gxt-et">'+esc(w?STORY.coach.winTitle:STORY.coach.loseTitle)+'</div><div class="gxt-ex">'+esc(w?STORY.coach.winText:STORY.coach.loseText)+'</div>'+
   '<table class="coscore">'+rows.map(r=>'<tr><th>'+esc(r[0])+'</th><td><b class="cn" data-to="'+r[1]+'">0</b>'+esc(r[2])+'</td></tr>').join('')+'</table>'+
   (later.length?'<div class="colater"><b>Things you\'ll meet later</b><ul>'+later.map(id=>'<li>'+esc(STORY.later[id])+'</li>').join('')+'</ul></div>':'')+
   '<div class="gxt-eb">'+(c.pro?'<button type="button" class="gxt-b pri" data-ce="chapter">Start chapter 1</button>':'<button type="button" class="gxt-b pri" data-ce="play">Play a real game</button>')+'<button type="button" class="gxt-b" data-ce="again">Play it again</button>'+(c.pro?'':'<button type="button" class="gxt-b" data-ce="story">Story mode</button>')+'</div></div>';
  document.body.appendChild(d);try{GXT.markDone(TUT_GAME)}catch(e){}CO.done=true;CO.last=Object.keys(c.seen);coCount(d);
  d.addEventListener('click',e=>{const b=e.target.closest('[data-ce]');if(!b)return;const k=b.dataset.ce,pro=c.pro;if(k==='again'){tutStart(pro?{prologue:true}:null);return}
    coClear();UI.coach=null;tutLeave();showStart();const first=window.CAMPAIGN&&window.CAMPAIGN.chapters&&window.CAMPAIGN.chapters[0];
    if(k==='chapter'&&first)GXC.play(first.id);else if(k==='story'&&typeof GXC!=='undefined')GXC.open()})}
function coCount(d){const ns=[...d.querySelectorAll('.cn')];ns.forEach((e,i)=>{const to=+e.dataset.to;if(!to){return}const t0=performance.now()+i*350,dur=600;const f=t=>{const k=Math.min(1,Math.max(0,(t-t0)/dur));e.textContent=Math.round(to*k);if(k<1)requestAnimationFrame(f);else e.textContent=to};requestAnimationFrame(f)})}
// ---- hooks: the engine/ui functions this file listens to ----
(function(){const o=refresh;refresh=function(){o();if(UI.coach){try{coWatch();if(G&&G.over)coEnd()}catch(e){console.error(e)}}}})();
(function(){const o=applyMove;applyMove=function(m,seat){if(!UI.coach||!G||G.over)return o(m,seat);const n0=G.logN,c0=plCut(),d0=G.dial;const r=o(m,seat);
  try{if(r&&r.success!==false)coAfter(m,seat,plLines(n0),plCut()-c0,G.dial!=null&&d0!=null&&G.dial<d0)}catch(e){console.error(e)}return r}})();
