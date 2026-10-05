// ---------- UI: the island stage, the planning table, the camp, cards, questions and reports ----------
const $=s=>document.querySelector(s);const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const PCOL=['#e0625c','#4f8fe6','#57b36a','#e8ad45','#a57ce0','#9a9a9a'];
const RICON={food:'🍖',pfood:'🥫',wood:'🪵',fur:'🧶'};
const PHASES=[['event','Event'],['morale','Morale'],['prod','Production'],['plan','Plan'],['act','Actions'],['weather','Weather'],['night','Night']];
UI.tab='plan';UI.sel=null;UI.tileSel=null;UI.report=null;UI.seenLog=0;UI.fxSeen=0;UI.lastRollId=0;UI.toasts=[];
function refresh(){if(UI.recBusy)return;if(G&&!(typeof NET!=='undefined'&&NET.on)){try{if(!G.over)localStorage.setItem(SAVE,JSON.stringify(G));else localStorage.removeItem(SAVE)}catch(e){}}
  if(!G){return}
  // the last beat always shows the live state; an ending gets its own scene
  const B=UI.beats;if(B.length){B[B.length-1].snap=null;B[B.length-1].obj=null}
  if(G.over&&(!B.length||B[B.length-1].kind!=='over')&&typeof document!=='undefined'){beat('over');UI.overSeen=false}
  playFx();render();try{withView(()=>sync3D())}catch(e){console.error(e)}try{if(typeof audioMood==='function')audioMood()}catch(e){}schedule();if(typeof isHost==='function'&&isHost())netPush()}
function newLogSince(mark){if(mark==null)return[];const n=G.logN-mark;return G.log.slice(0,Math.max(0,n)).reverse()}
function playFx(){for(const f of UI.fx.slice(UI.fxSeen)){const m={skill:'good'}[f.t];if(m&&typeof sfx==='function')sfx(m);
    if(f.t==='explore'||f.t==='build'||f.t==='wound'||f.t==='fight')UI.bump=f}
  UI.fxSeen=UI.fx.length;if(UI.fx.length>30){UI.fx.splice(0,UI.fx.length-10);UI.fxSeen=UI.fx.length}}
// ---------- inline SVG icons for the bar and popups ----------
const ICON={tent:'<path d="M2.5 20h19M12 4 3.5 20M12 4l8.5 16M10 3l2 1 2-1M9.5 20 12 14.5l2.5 5.5"/>',scroll:'<path d="M7 4h11a2 2 0 0 1 2 2v1h-4M7 4a2 2 0 0 0-2 2v11a2 2 0 0 1-2 2h11a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2M9 9h5M9 12.5h5M9 16h3"/>',
 cards:'<rect x="3.5" y="6.5" width="10" height="14" rx="2" transform="rotate(-10 8.5 13.5)"/><rect x="10" y="3.5" width="10" height="14" rx="2"/><path d="M15 7.5l.9 1.9 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.3z"/>',
 book:'<path d="M12 6.5C10 5 7 4.5 3.5 5v13.5c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5zM12 6.5V20"/>',snd:'<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',mute:'<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>',
 wave:'<path d="M2 14c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M2 18.5c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M5 10c1.2-3.5 5-5.5 8.5-4.2-2.2.4-3.4 2.2-2.8 4.2"/>',fast:'<path d="M4 6.5l7 5.5-7 5.5zM12.5 6.5l7 5.5-7 5.5z"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',gfx:'<rect x="3" y="4.5" width="18" height="15" rx="2"/><path d="M3.5 17l5-5.5 4 4 2.8-2.8 5.2 4.8"/><circle cx="16" cy="9" r="1.6"/>'};
function svgi(n){return ICON[n]?`<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${ICON[n]}</svg>`:''}
function paintIcons(){document.querySelectorAll('[data-ico]').forEach(el=>{if(!el.querySelector(':scope>.ic'))el.insertAdjacentHTML('afterbegin',svgi(el.dataset.ico))})}
function setBtn(el,ic,txt){if(!el)return;const h=svgi(ic)+(txt?`<span>${txt}</span>`:'');if(el.dataset.h!==h){el.dataset.h=h;el.innerHTML=h}}
function gfxBtn(){setBtn(document.getElementById('gfxbtn'),'gfx',typeof gfxLabel==='function'?gfxLabel():'Graphics')}
function onGfxChange(){gfxBtn();if(!$('#gfxpop').hidden)renderGfx()}
// the Graphics popover: Auto / High / Medium / Low, plus PerfHUD's Show speed and Test speed
function renderGfx(){const p=$('#gfxpop');const cur=typeof V3!=='undefined'?V3.pref:'auto';const q=(k,n)=>`<button class="gx-ibtn" data-a="gfxq" data-q="${k}" aria-pressed="${cur===k}">${n}</button>`;
  p.innerHTML=`<h3>Graphics</h3><div class="gq">${q('auto','Auto')}${q('high','High')}${q('med','Med')}${q('low','Low')}</div><small>${typeof gfxLabel==='function'?'Now: '+gfxLabel()+'. ':''}Auto steps down on a slow device.</small><h3>Speed</h3>${typeof PerfHUD!=='undefined'?PerfHUD.buttonsHTML('gx-ibtn'):''}`}
function openGfx(){const p=$('#gfxpop'),b=$('#gfxbtn');renderGfx();p.hidden=false;if(b)b.setAttribute('aria-expanded','true');let r=b&&b.getBoundingClientRect();if(!r||!r.width)r={left:innerWidth-8,right:innerWidth-8,bottom:56};
  const w=p.offsetWidth;p.style.left=Math.max(8,Math.min(innerWidth-w-8,r.right-w))+'px';p.style.top=Math.round(r.bottom+6)+'px'}
function closeGfx(){const p=$('#gfxpop');if(p&&!p.hidden){p.hidden=true;const b=$('#gfxbtn');if(b)b.setAttribute('aria-expanded','false')}}
// ---------- top-level render ----------
function render(){if(typeof netPill==='function')netPill();if(!G){renderModal();renderStory();renderRoadmap();return}msgCheck();wizSync();renderRoadmap();withView(()=>{renderHud();renderMap2D()});renderStep();renderPanel();renderStory();renderModal();
  const pb=$('#pausebtn');if(pb){pb.hidden=!allAI()||(typeof NET!=='undefined'&&NET.on);pb.textContent=UI.pause?'▶ Resume':'⏸ Pause'}setBtn($('#speedbtn'),'fast',({0.5:'slow',1:'normal',3:'fast'}[UI.speed]||'normal'));gfxBtn()}
{const r0=render;render=function(){r0();if(typeof PHO!=='undefined')PHO.sync()}}
const RLAB={food:'food',pfood:'dry food',wood:'wood',fur:'fur'};
const RTIP={food:'🍖 Food: each castaway eats 1 at night; what is left spoils overnight',pfood:'🥫 Dry food: eaten like food, but it never spoils',wood:'🪵 Wood: pays for building, the roof and palisade, and warmth in snow',fur:'🧶 Fur: can pay for the shelter, roof or palisade instead of wood'};
function renderHud(){const S=SCENARIOS[G.scen];const el=$('#hud');if(!el)return;const wx=S.wx[G.round]||[];const ph=G.phase==='actdone'?'act':G.phase==='start'?'event':G.phase;
  const dieI={rain:'🌧',snow:'❄️',animals:'🐾'};const dieN={rain:'rain die',snow:'winter die',animals:'hungry-animals die'};
  const lives=G.chars.filter(c=>!c.npc||G.scen==='stranded').map(c=>{const C=CHARS[c.k];const left=c.dead?0:C.die-c.w;const warn=!c.dead&&left<=3;return `<span class="lf ${warn?'warn':''} ${c.dead?'dead':''}" style="--pc:${PCOL[c.i%6]}" title="${esc(c.nm)}: ${left} of ${C.die} life left (each wound costs 1; at 0 they die and everyone loses) · ✊ ${c.det} determination (spent on skills)${c.i===G.first?' · ★ first player: pays for low morale and faces the event cards first':''}"><b>${esc(c.nm.split(' ')[0])}${c.i===G.first?' ★':''}${typeof netTag==='function'?netTag(c):''}</b> ❤ ${left}/${C.die}${warn?' ⚠':''}<i class="lbar"><u style="width:${Math.round(left/C.die*100)}%"></u></i><small>✊${c.det}</small></span>`}).join('')+(G.fri?`<span class="lf fri ${G.fri.dead?'dead':''}" title="Friday: ${FRIDAY.die-G.fri.w} of ${FRIDAY.die} life. A helper: if he dies the game goes on."><b>Friday</b> ❤ ${G.fri.dead?0:FRIDAY.die-G.fri.w}/${FRIDAY.die}<i class="lbar"><u style="width:${Math.round((FRIDAY.die-G.fri.w)/FRIDAY.die*100)}%"></u></i></span>`:'');
  el.innerHTML=`<div class="hud-l">
    <div class="rtrack" aria-label="Day ${G.round} of ${G.rounds}" title="Days. Dots under a day are its weather dice: orange = rain die, white = winter die, red = hungry-animals die">${Array.from({length:G.rounds},(_,i)=>`<span class="${i+1<G.round?'past':i+1===G.round?'now':''}" title="Day ${i+1}${(S.wx[i+1]||[]).length?': '+S.wx[i+1].map(d=>dieN[d]).join(', '):': no weather dice'}">${i+1}${(S.wx[i+1]||[]).length?`<i>${S.wx[i+1].map(d=>`<u class="wd ${d}"></u>`).join('')}</i>`:''}</span>`).join('')}</div>
    <div class="rleg"><b>Day ${G.round}/${G.rounds}</b> · dots = weather dice: <u class="wd rain"></u> rain <u class="wd snow"></u> winter <u class="wd animals"></u> animals</div>
    <div class="phases">${PHASES.map(([k,n])=>`<span class="${ph===k?'on':''}">${n}</span>`).join('')}</div></div>
   <div class="hud-r">
    <div class="res">${['food','pfood','wood','fur'].map(r=>`<span class="hk" title="${RTIP[r]}${G.fut[r]?' (+'+G.fut[r]+' arriving)':''}">${RICON[r]} <b>${G.res[r]}</b>${G.fut[r]?`<small>+${G.fut[r]}</small>`:''}<em>${RLAB[r]}</em></span>`).join('')}</div>
    <div class="trk"><span class="hk" title="Shelter: without one everyone takes a wound each night">${hasShelter()?'🏠':'⛺'}<b>${hasShelter()?'✓':'✗'}</b><em>shelter</em></span><span class="hk" title="Roof: each level keeps one weather cloud off your food and wood">☂ <b>${G.camp.roof}</b><em>roof</em></span><span class="hk" title="Palisade: each level soaks up one storm or beast hit on the camp">🧱 <b>${G.camp.pal}</b><em>palisade</em></span><span class="hk" title="Weapon: against beasts; every point a beast is stronger is a wound">🗡 <b>${G.weapon}</b><em>weapon</em></span><span class="hk mor" title="Morale (−3 to +3): below 0 the first player loses that much ✊ determination each morning; above 0 they gain it"><span class="mt">${[-3,-2,-1,0,1,2,3].map(v=>`<i class="${v===G.morale?'on':''} ${v<0?'neg':v>0?'pos':''}">${v>0?'+'+v:v}</i>`).join('')}</span><em>morale</em></span></div>
    <div class="lives" aria-label="Life of each castaway">${lives}</div><div class="rleg">❤ life left · ✊ determination (pays for skills) · ★ first player</div>
    <div class="fc" title="Weather dice rolled tonight, plus clouds added by event cards">${wx.length||G.wx.rain||G.wx.snow||G.wx.storm?`Weather tonight: ${wx.map(d=>dieI[d]+' '+dieN[d]).join(', ')}${G.wx.rain?' +🌧'.repeat(G.wx.rain):''}${G.wx.snow?' +❄️'.repeat(G.wx.snow):''}${G.wx.storm?' +⛈ storm':''}${G.wxEarly?` <b>(${Object.values(G.wxEarly).join(', ')})</b>`:''}`:'Weather tonight: calm'}</div></div>
   <div class="goal">${esc(S.n)}: ${esc(SC().goal?SC().goal():'')}</div>`}
function stepText(){if(G.over)return G.over.win?`🏆 ${G.over.why}`:`☠ ${G.over.why}`;
  if(G.q){const c=P(G.q.who);if(typeof netWaitText==='function'&&netWaitText())return netWaitText();return c&&c.human?`${G.chars.filter(x=>x.human).length>1?c.nm+': ':''}${G.q.title}`:'The castaways are deciding…'}
  if(planOpen()){if(allAI())return UI.pause?'Paused.':'The computer castaways are planning…';const left=allPawns().filter(p=>p.c!=null&&!P(p.c).dead&&P(p.c).human&&!placedIds().has(p.id)).length;const pr=planProblems();
    return left?`Plan the day: ${left} pawn${left>1?'s':''} still to place. Pick a pawn, then an action${V3.on?' or a tile on the island':''}.`:pr.length?`Almost ready: ${pr[0]}`:'Everyone has a job. Start the day when you are happy with the plan.'}
  return 'The day unfolds…'}
function wizSync(){if(planOpen()&&!allAI()){pstep();if(UI.ps.step!==2&&UI.sel&&!UI.tileSel)UI.sel=null}}
function stepFoot(){const st=pstep();const cur=st===2?curPawn():null;const list=st===2?wizPawns():[];const red=st===4?uncoveredRed():[];const pb=planProblems();
  const sug=`<button class="btn ghost" data-a="suggest" title="Give every pawn a job following today’s needs (H). You can change anything.">💡 Plan for me</button>`;
  const back=st>1?`<button class="btn ghost" data-a="pback">◀ Back</button>`:`<button class="btn ghost" data-a="clear" title="Take all your pawns off their jobs">Clear</button>`;
  const txt=st===1?'Planning 1 of 4: read what today needs, then give out jobs.':st===2?(cur?`Planning 2 of 4 · Pawn ${list.findIndex(p=>p.id===cur.id)+1} of ${list.length}: ${pawnNice(cur)}. Take the recommended job or choose another.`:'Planning 2 of 4: every pawn has a job.'):st===3?'Planning 3 of 4: check the risk of each job.':pb.length?`Planning 4 of 4: not ready yet. ${pb[0]}`:red.length?'Planning 4 of 4: something urgent is not covered.':'Planning 4 of 4: all set. Start the day!';
  const next=st===1?`<button class="btn go" data-a="pnext" title="Step 2: give each pawn a job">Next: jobs ▶</button>`:st===2?`<button class="btn go ${cur&&cur.c!=null?'dim':''}" data-a="pnext" title="Step 3: check the risk of each job">Next: check ▶</button>`:st===3?`<button class="btn go ${pb.length?'dim':''}" data-a="pnext" title="Step 4: start the day">Next: start ▶</button>`:
    (typeof netOn==='function'&&netOn()?netStepBtn(pb,red):`<button class="btn go ${pb.length?'dim':''}" data-a="go" ${red.length?'data-force="1"':''} title="Start the day (Enter)">${red.length?'Start anyway ▶':'Start day ▶'}</button>`);
  return `<div class="st-t" id="steptext">${esc(typeof netOn==='function'&&netOn()&&st===4&&!pb.length?netStepText(red):txt)}</div><div class="st-b">${back}${sug}${next}</div>`}
function renderStep(){const el=$('#step');if(!el)return;const st=storyActive();el.hidden=st;if(st)return;
  const cf=UI.confirm&&planOpen()&&!allAI();
  el.innerHTML=cf?`<div class="st-t confirm" id="steptext" role="alert">${esc(UI.confirm)} Start anyway?</div><div class="st-b"><button class="btn ghost" data-a="suggest" title="Fill the priorities for me">💡 Plan it for me</button><button class="btn ghost" data-a="goback">Go back</button><button class="btn go" data-a="go" data-force="1">Start anyway ▶</button></div>`:
  planOpen()&&!allAI()?stepFoot():`<div class="st-t" id="steptext">${esc(stepText())}</div>${G.over?`<div class="st-b"><button class="btn go" data-a="new">New game</button></div>`:''}`}
// ---------- side panel ----------
function renderPanel(){const el=$('#panel');if(!el)return;el.innerHTML=`<div class="pbody">${planHtml()}</div>`;if(UI.toTop&&!storyActive()){UI.toTop=0;const bd=document.querySelector('.gx-dock-body');if(bd)bd.scrollTop=0}
  // popups render only while open
  if(GX.open==='campd')keepScroll('#campbody',()=>campHtml());if(GX.open==='logd')keepScroll('#logbody',()=>logHtml());
  if(GX.open==='cardsd'&&$('#cardsbody').dataset.v!==(UI.ctab||'')+'|'+(UI.cq||''))renderCards();
  const st=storyActive(),q=humanQ();const dt=$('#dockt');if(dt){const f=flowNow();const ph=f&&PHI(f.k)>=0?PH7[PHI(f.k)].n:'';dt.textContent=G.over&&!st?'Game over':st?(q&&storyIdx()===UI.beats.length-1?'Your decision':f.k==='done'?`Day ${f.round} is over`:f.k==null?'The shipwreck':`Day ${f.round} · ${ph}`):planOpen()&&!allAI()?`Plan day ${G.round} · step ${pstep()} of 4`:'The day unfolds'}
  const ch=$('#chip');if(ch)withView(()=>{ch.textContent=`Day ${G.round}/${G.rounds} · ${({start:'dawn',event:'event',morale:'morning',prod:'morning',plan:'planning',act:'actions',actdone:'actions',weather:'weather',night:'night'})[G.phase]||G.phase}`});
  // a new decision or a new story always brings the panel back
  const need=(q?'q'+G.q.title+G.logN:'')+(st?'s'+UI.beats.length:'');if(need&&need!==UI.lastNeed){UI.lastNeed=need;GX.showDock()}}
function keepScroll(sel,f){const b=$(sel);if(!b)return;const t=b.scrollTop;b.innerHTML=f();b.scrollTop=t}
function renderCards(){const b=$('#cardsbody');if(!b)return;b.dataset.v=(UI.ctab||'')+'|'+(UI.cq||'');const t=b.scrollTop;b.innerHTML=cardsHtml();b.scrollTop=t}
function pawnLabel(p){if(p.c!=null){const c=P(p.c);return c.nm}if(p.f)return 'Friday';return p.n||'Helper'}
function chip(p,opt){opt=opt||{};const col=p.c!=null?PCOL[p.c%6]:p.f?'#f3f3f3':'#8d8d8d';const sel=UI.sel===p.id;const rm=opt.rm&&(typeof netPawnMine!=='function'||netPawnMine(p));
  return `<button class="chip ${sel?'sel':''} ${p.c==null?'aux':''} ${opt.placed?'placed':''}" style="--pc:${col}" data-pawn="${p.id}" ${rm?`data-rm="${p.id}"`:''} title="${esc(pawnLabel(p))}${p.x?' (helper: '+p.t.map(t=>TNAME[t]).join(' / ')+')':''}${rm?' — click to take back':''}"><i></i>${esc(pawnLabel(p).split(' ')[0])}${rm?' ×':''}</button>`}
function section(t,body){return `<section class="sec"><h3>${t}</h3>${body}</section>`}
function row(type,tgt,title,sub,o){o=o||{};const a=findActAny(type,tgt,o.alt);const why=targetWhy(type,tgt,o.alt||0,null);const blocked=why&&why!=='already planned';
  const sel=UI.sel;const pwhy=sel?placeWhy(sel,type,tgt,o.alt):null;const n=a?actNeed(a):null;
  const planned=a?a.pw.map(pid=>{const p=pawnInfo(pid);return p?chip(p,{rm:1,placed:1}):''}).join(''):'';
  const status=a?(()=>{if(!n)return '';const k=a.pw.length;return n.roll?(k>=n.max?'<b class="sure">sure</b>':k>=n.need?'<b class="roll">rolls dice</b>':`<b class="warn">needs ${n.need}</b>`):k>=n.need?'<b class="sure">ready</b>':`<b class="warn">needs ${n.need}</b>`})():'';
  const key=encodeURIComponent(JSON.stringify({type,tgt,alt:o.alt||0}));
  const payT=a&&type==='build'&&['shelter','roof','pal'].includes(tgt.k)?`<button class="btn xs" data-pay="${a.id}" title="Pay with wood or fur">pay: ${a.pay}</button>`:'';
  return `<div class="row ${blocked?'blocked':''} ${a?'has':''}" ${o.card?`data-card="${o.card}"`:''}><div class="rt"><div class="rn">${title}</div><div class="rs">${sub||''}${blocked?` <span class="why">(${esc(why)})</span>`:''}</div>${a?`<div class="rp">${planned} ${status} ${payT}</div>`:''}</div>
    <button class="btn add" data-place="${key}" ${blocked||(sel&&pwhy)?'disabled':''} title="${esc(blocked?why:sel&&pwhy?pwhy:'Place '+(sel?pawnLabel(pawnInfo(sel)):'a pawn')+' here')}">+</button></div>`}
function findActAny(type,tgt,alt){const key=JSON.stringify(tgt);if(MULTI.includes(type))return G.plan.acts.find(a=>a.type===type&&JSON.stringify(a.tgt)===key&&a.pw.length<actNeed(a).max)||null;return G.plan.acts.find(a=>a.type===type&&JSON.stringify(a.tgt)===key&&(type!=='threat'||a.alt===(alt||0)))||null}
function invNeedText(k){const I=invReq(k);const ex=explored();const p=[];if(I.t)p.push(`<span class="${ex.has(I.t)?'okc':'noc'}">${I.t}</span>`);for(const it of I.it||[])p.push(`<span class="${has(it)?'okc':'noc'}">${esc((INVENTIONS[it]||{}).n||it)}</span>`);
  const r=I.alt?I.alt.map(o=>Object.entries(o).map(([k2,n])=>n+' '+RNAME[k2]).join('+')).join(' or '):Object.entries(I.r||{}).map(([k2,n])=>n+' '+RNAME[k2]).join(' + ');if(r)p.push(r);return p.join(' · ')||'free'}
function crossRows(){return G.map.filter(m=>tileAt(m.id)).map(m=>row('build',{k:'cross',cross:m.id},`✝ Cross at place ${m.id+1} <small>(${tileAt(m.id).terr})</small>`,`2 wood${m.fog?' · fog: +1 pawn':''} · ${G.sc.crosses.includes(m.id)?'already has a cross':'counts toward the five'}`)).filter((r,i)=>!G.sc.crosses.includes(G.map.filter(m=>tileAt(m.id))[i].id)).join('')}
function gatherRows(){let h='';for(const m of G.map){const t=tileAt(m.id);if(!t||m.id===G.camp.pos)continue;const d=dist(G.camp.pos,m.id);if(d>2)continue;for(const s of srcs(m.id)){if(s.ex)continue;const n=actNeed({type:'gather',tgt:{pos:m.id,i:s.i}});
  h+=row('gather',{pos:m.id,i:s.i},`${s.s==='wood'?'🪵 Wood':s.s==='fish'?'🐟 Fish':'🦜 Birds'} at place ${m.id+1} <small>(${t.terr})</small>`,`${n.need} pawn${n.need>1?'s':''} rolls, ${n.max} sure${d>=2?' · far from camp':''}${m.tok.time?' · slow':''}${m.fog?' · fog':''}${m.tok.beast?' · danger':''}`)}}return h}
function exploreRows(){let h='';for(const m of MAP){if(G.map[m.id].tile!=null)continue;if(!m.adj.some(p=>tileAt(p)))continue;const d=dist(G.camp.pos,m.id);if(d>2)continue;const n=actNeed({type:'explore',tgt:m.id});h+=row('explore',m.id,`Explore place ${m.id+1}`,`${n.need} pawn${n.need>1?'s':''} rolls, ${n.max} sure${d>=2?' · far from camp':''}${G.map[m.id].fog?' · fog':''}`)}return h}
function specialSub(k){const s=SPEC(k);if(!s.dice)return `${s.need||2} pawns, no dice`;const n=actNeed({type:'special',tgt:k});return `explore dice · ${n.need} pawn${n.need>1?'s':''} rolls, ${n.max} sure${s.advWound?' · a "?" means a wound':''}`}
function tileFocusHtml(pos){const t=tileAt(pos);const m=G.map[pos];let body='';
  if(t){body+=`<div class="tf-h">Place ${pos+1}: ${t.terr}${pos===G.camp.pos?' · 🏕 camp':''}${t.shelter?' · natural shelter':''}${t.totem?' · <span title="A totem: the scenario has a special effect when this place is found">🗿 totem (scenario effect)</span>':''}${m.fog?' · 🌫 fog':''}</div><div class="rs">${t.src.length?'Sources: '+t.src.map((s,i)=>s+(m.exh[i]?' (used up)':'')).join(', '):'No sources'}</div>`;
    if(pos!==G.camp.pos)for(const s of srcs(pos))if(!s.ex)body+=row('gather',{pos,i:s.i},`Gather ${s.s==='wood'?'wood':'food'} here`,'');
    if(G.scen==='hexed'&&!G.sc.crosses.includes(pos))body+=row('build',{k:'cross',cross:pos},'Raise a cross here','2 wood');
    if(G.scen==='hexed'&&G.sc.temple===pos&&!G.sc.templeDone)body+=row('special','temple','Search the dark temple','explore dice');}
  else if(m.down)body=`<div class="tf-h">A cut-off tile</div>`;else{body=`<div class="tf-h">Unexplored place ${pos+1}${m.fog?' · 🌫 fog':''}</div>`;body+=row('explore',pos,'Explore this space','')}
  return `<div class="tfocus">${body}<button class="btn xs" data-a="untile">close</button></div>`}
// ---------- camp tab ----------
function campHtml(){let h='';
  for(const c of G.chars){const C=CHARS[c.k];const hearts=Array.from({length:C.die},(_,i)=>`<i class="${i<c.w?'hurt':''} ${C.arrows.includes(i+1)&&!c.cov.includes(i+1)?'arrow':''}" title="${i+1===C.die?'death':C.arrows.includes(i+1)?'morale drops when this fills':''}">${i+1===C.die?'☠':''}</i>`).join('');
    const sp=Object.entries(c.sp).filter(([k,v])=>v).map(([k,v])=>`${k}×${v}`).join(', ');
    h+=`<div class="ch" style="--pc:${PCOL[c.i%6]}"><div class="ch-h"><b>${esc(c.nm)}</b> ${c.dead?'☠':''}${c.i===G.first?' <span class="fp" title="First player: pays for low morale each morning and faces event cards first. The role passes on every day.">★ first player</span>':''} <span class="det" title="Determination: earned by arranging the camp and failed rolls, spent on skills">✊ ${c.det} determination</span>${typeof netOn==='function'&&netOn()?netTagLong(c):c.human?'':' <small>(computer)</small>'}${c.out?' <small>(out for the night)</small>':''}</div>
      <div class="life" aria-label="${c.w} of ${C.die} wounds">${hearts}</div>${sp?`<div class="rs">Injuries: ${sp}</div>`:''}
      <div class="skills">${C.skills.map(s=>{const w=skillWhy(c.i,s.k)||(typeof netNotMine==='function'?netNotMine(c.i):null);return `<button class="btn sk" data-skill="${c.i}:${s.k}" ${w?'disabled':''} title="${esc(s.x)}${w?' — '+w:''}"><b>${esc(s.n)}</b> <small>${s.c}✊</small><span>${esc(s.x)}</span></button>`}).join('')}</div></div>`}
  if(G.fri)h+=`<div class="ch" style="--pc:#f3f3f3"><div class="ch-h"><b>Friday</b> ${G.fri.dead?'☠':''} <span class="det">✊ ${G.fri.det}</span></div><div class="life">${Array.from({length:FRIDAY.die},(_,i)=>`<i class="${i<G.fri.w?'hurt':''}">${i+1===FRIDAY.die?'☠':''}</i>`).join('')}</div><div class="rs">Acts alone or helps. Spends 2 of his determination to reroll a die. Ignores weather, food and shelter.</div></div>`;
  if(G.dog)h+=`<div class="rs">🐕 The dog helps with hunting and exploring every round.</div>`;
  if(G.scen==='stranded')h+=`<div class="ch" style="--pc:#ff9fb2"><div class="ch-h"><b>Ada</b> ${G.sc.rescued?'(in camp)':'(on the rock)'}</div><div class="life">${Array.from({length:CHARS.ada.die},(_,i)=>`<i class="${i<(G.sc.rescued?(G.chars.find(c=>c.k==='ada')||{}).w:G.sc.ada)?'hurt':''}">${i+1===CHARS.ada.die?'☠':''}</i>`).join('')}</div><div class="rs">${G.sc.rescued?'She can only rest, and eats like everyone.':'She takes 2 wounds every night until rescued.'}</div></div>`;
  h+=section('Starting items',G.items.length?G.items.map(it=>{const w=itemWhy(it.k)||(typeof netShared==='function'?netShared():null);return `<div class="row"><div class="rt"><div class="rn">${esc(ITEMS[it.k].n)} <small>${it.uses} use${it.uses>1?'s':''} left</small></div><div class="rs">${esc(ITEMS[it.k].x)}</div></div>${PLANITEMS.includes(it.k)?`<button class="btn sm" data-item="${it.k}" ${w?'disabled':''} title="${esc(w||'Use it')}">Use</button>`:`<small class="muted">${esc(w)}</small>`}</div>`}).join(''):'<div class="row empty">None left.</div>');
  h+=section('Discovery tokens',G.own.length?G.own.map((o,i)=>{const w=discWhy(i)||(typeof netShared==='function'?netShared():null);return `<div class="row"><div class="rt"><div class="rn">${esc(discName(o.k))}</div><div class="rs">${esc(discText(o.k))}</div></div><button class="btn sm" data-disc="${i}" ${w?'disabled':''} title="${esc(w||'Use it')}">Use</button></div>`}).join(''):'<div class="row empty">Explore to find some.</div>');
  const kept=Object.keys(G.kept);if(kept.length)h+=section('Kept cards',kept.map(k=>`<div class="row"><div class="rt"><div class="rn">${esc(cname(k))}</div><div class="rs">${CARD[k]?cardText(CARD[k]):''}</div></div></div>`).join(''));
  const built=Object.keys(G.inv.built);h+=section('Items made',built.length?built.map(k=>`<div class="row"><div class="rt"><div class="rn">${esc(invReq(k).n)}</div><div class="rs">${esc(invReq(k).x)}</div></div></div>`).join(''):'<div class="row empty">Nothing yet.</div>');
  if(G.scen==='settlers')h+=section('Settlement goals',G.sc.goals.map(k=>`<div class="row"><div class="rt"><div class="rn">${has(k)?'✓':'○'} ${esc(INVENTIONS[k].n)}</div></div></div>`).join(''));
  h+=section('Decks',`<div class="rs">Events left: ${G.ev.deck.length} · island tiles left: ${G.tileDeck.length} · hunting grounds: ${G.hunt.length} beasts · beast deck: ${G.beast.length} · invention deck: ${G.inv.deck.length} · discovery tokens: ${G.discs.length}</div>`);
  return h}
function logHtml(){return `<ol class="log">${G.log.slice(0,200).map(l=>`<li class="${l.c}"><small>R${l.r}</small> ${esc(l.t)}</li>`).join('')}</ol>`}
function recentHtml(){return `<h3>Latest</h3><ol class="log">${G.log.slice(0,12).map(l=>`<li class="${l.c}">${esc(l.t)}</li>`).join('')}</ol>`}
// ---------- modal: questions, reports, start, cards, rules, game over ----------
function renderModal(){const m=$('#modal');if(!m)return;let h='';
  if(typeof NET!=='undefined'&&NET.gone)h=goneHTML();else if(typeof NET!=='undefined'&&NET.on&&NET.inLobby&&UI.modal!=='start')h=lobbyHTML();else if(UI.modal==='start')h=startHtml();else if(false)h=`<div class="mbox wide"><button class="x" data-a="close" aria-label="Close">×</button>${RULES_HTML}</div>`;
  else if(!G)h='';else if(G.over&&!UI.overSeen&&!storyActive()){if(typeof campOver==='function'&&campOver())h='';else h=overHtml()}
  m.hidden=!h;if(m.dataset.h!==h){m.innerHTML=h;m.dataset.h=h;const f=m.querySelector('[autofocus]')||m.querySelector('button.opt');if(f)f.focus()}}
function questionHtml(){const q=G.q;let ctx='';
  if(q.kind==='dice'){const d=q.dice;ctx=`<div class="dice">${die('wound',d.w)}${die('success',d.s)}${die('adventure',d.q)}</div>`}
  if(q.kind==='adv'&&q.card)ctx=`<div class="card adv"><h4>${esc(cname(q.card))}</h4><p>${cardText(CARD[q.card])}</p></div>`;
  if(q.kind==='boost'||q.kind==='track'){ctx=''}
  const recent=G.log.slice(0,4).reverse().map(l=>`<li class="${l.c}">${esc(l.t)}</li>`).join('');
  return `<div class="mbox"><h2>${esc(q.title)}</h2>${ctx}<ol class="rep small">${recent}</ol><div class="opts">${q.opts.map((o,i)=>`<button class="btn opt" data-ans="${i}">${esc(o.l)}</button>`).join('')}</div></div>`}
function die(kind,v){const face={wound:v?'🩸 wound':'no wound',success:v?'✔ success':'✖ failure',adventure:v?'❓ adventure':'no adventure'}[kind];return `<div class="die ${v===(kind==='success')?'good':'bad'} ${kind}"><span>${face}</span></div>`}
// what went wrong: every wound of the game by cause, the cause of the end, and one tip per big cause
function lossCauses(){const by={};let dies=null;for(const l of G.log){let m=/takes (\d+) wounds? \(([^)]*)\)/.exec(l.t);if(m){const k=m[2];by[k]=(by[k]||0)+(+m[1])}m=/☠ (.+) dies(?: \(([^)]*)\))?/.exec(l.t);if(m){dies={who:m[1],why:m[2]||''};by[m[2]||'?']=(by[m[2]||'?']||0)+1}}
  return {by:Object.entries(by).sort((a,b)=>b[1]-a[1]),dies}}
const LOSS_TIP={hunger:'Plan food every day: the 🍖 priority says how much you need. Threat rewards like the crates count too.','sleeping in the open':'Build a shelter on day 1 or 2 (2 wood).','soaked and cold':'Raise the roof before the rain dice start (look at the dots on the day track).','no palisade left':'Build a palisade before storms; each level soaks up one hit.','the cold':'Keep 1 wood per snow cloud for warmth.','low morale':'Arrange the camp to lift morale when it drops below 0.','not enough determination':'Arrange the camp for determination; low morale drains it every morning.','a mishap':'Add 1 more pawn to a job to make it sure: then no dice, no wounds.','hungry animals':'A weapon and dry food help against the hungry-animals die.'};
function overHtml(){const w=G.over.win;const st=G.stats;const lc=w?null:lossCauses();const top=lc?lc.by.filter(([k])=>k!=='?').slice(0,4):[];
  const tips=[...new Set(top.map(([k])=>LOSS_TIP[k]).filter(Boolean))].slice(0,2);
  const why=lc?`<div class="over-why"><b>What went wrong</b><ul>${lc.dies?`<li>${esc(lc.dies.who)} died${lc.dies.why?' from '+esc(lc.dies.why):''} on day ${G.round}.</li>`:''}${top.length?`<li>Wounds this game: ${top.map(([k,n])=>`${esc(k)} ${n}`).join(' · ')}.</li>`:''}${tips.map(t=>`<li>💡 ${esc(t)}</li>`).join('')}${G.diff!=='easy'?'<li>💡 The Easier setting adds the dog and 4 starting items.</li>':''}</ul></div>`:'';
  return `<div class="mbox"><h2>${w?'🏆 Rescued!':'☠ Lost on the island'}</h2><p class="big">${esc(G.over.why)}</p><p class="story">${esc(endLine())}</p>${why}<p class="small">Day ${G.round} of ${G.rounds} · places explored ${st.explored} · things made ${st.built} · fights ${st.fights} · wounds taken ${st.wounds}</p><div class="mb">${typeof netOn==='function'&&netOn()?netOverBtns():`${w?'':'<button class="btn go" data-a="retry">↻ Try again (same island)</button><button class="btn" data-a="retry" data-easy="1">Try it on Easier</button>'}<button class="btn ${w?'go':''}" data-a="new">New game</button><button class="btn" data-a="overok">Look at the island</button>`}</div></div>`}
function retryGame(easy){const o=G;const s=UI.setup;s.scen=o.scen;s.chars=o.chars.filter(c=>!c.npc).map(c=>c.k);s.ai={};o.chars.forEach(c=>{if(!c.human)s.ai[c.k]=true});if(easy){s.diff='easy';s.items=4;s.dog=true;s.friday=true}
  const old=DEFSEED;DEFSEED=o.seed;try{beginGame()}finally{DEFSEED=old}}
function toggleMenu(){const m=$('#moremenu'),b=$('.menub');if(!m)return;const on=!m.classList.contains('open');m.classList.toggle('open',on);if(b)b.setAttribute('aria-expanded',on)}
function closeMenu(){const m=$('#moremenu');if(m&&m.classList.contains('open')){m.classList.remove('open');const b=$('.menub');if(b)b.setAttribute('aria-expanded','false')}}
const SCEN_ORDER=['marooned','hexed','stranded','settlers'];
function startHtml(){const o=UI.setup;let saved=null;try{saved=localStorage.getItem(SAVE)}catch(e){}
  return `<div class="mbox wide start"><h2>Shipwreck Isle</h2><p class="lede">A co-operative survival game for 1–4 castaways. Plan every day together, build a camp, explore the island and hold out against the weather until your goal is done.</p>
   <div class="mb guided"><button class="btn go big" data-a="story">📖 Story: learn the island chapter by chapter ▶</button><small>New here? Start with chapter 1: survive three days. Each chapter adds one new idea. ${typeof campLine==='function'?campLine():''}</small></div>
   <h3 class="orfull">Or set up a full game</h3>
   ${saved?`<div class="mb"><button class="btn go" data-a="continue">Continue the saved game</button></div>`:''}
   ${typeof onlineBlock==='function'?onlineBlock():''}
   <h3>Scenario</h3><div class="scens">${SCEN_ORDER.map((k,ix)=>{const S=SCENARIOS[k];return `<button class="scen ${o.scen===k?'on':''}" data-scen="${k}"><b>${ix+1}. ${esc(S.n)}</b><small>${S.rounds} rounds</small><span>${esc(S.x)}</span></button>`}).join('')}</div>
   <h3>Castaways <small>(pick 1–4)</small></h3><div class="chars">${Object.keys(CHARS).filter(k=>!CHARS[k].npc).map(k=>{const on=o.chars.includes(k);const C=CHARS[k];return `<div class="cpick ${on?'on':''}"><button class="cp" data-char="${k}" aria-pressed="${on}"><b>${C.n}</b><small>❤ ${C.die} life · own invention: ${INVENTIONS[C.inv].n} (only they can make it)</small><span class="sks">${C.skills.map(s=>`<span title="${esc(s.x)}"><i>${esc(s.n)}</i> (${s.c}✊): ${esc(s.x)}</span>`).join('')}</span></button>${on?`<div class="ctl2" role="group" aria-label="Who plays the ${C.n}"><button data-ctl="${k}" data-v="h" class="${o.ai[k]?'':'on'}" aria-pressed="${!o.ai[k]}">🙂 You</button><button data-ctl="${k}" data-v="ai" class="${o.ai[k]?'on':''}" aria-pressed="${!!o.ai[k]}">🤖 Computer</button></div>`:''}</div>`}).join('')}</div>
   <p class="muted small">✊ determination is earned by arranging the camp and failing rolls, and spent on skills.</p>
   <div class="opts2"><label class="chk"><input type="checkbox" data-opt="friday" ${o.friday?'checked':''}> Friday helps (standard with 1–2 castaways)</label><label class="chk"><input type="checkbox" data-opt="dog" ${o.dog?'checked':''}> The dog helps (standard solo)</label>
   <p class="muted small">Friday is a friendly islander who finds you on the beach: an extra pawn that works alone or helps, and never needs food or shelter (if he dies, the game goes on). The ship’s dog adds a pawn for hunting and exploring.</p>
   <div class="diff" role="radiogroup" aria-label="Difficulty">${[['easy','Easier','the dog joins, 4 starting items, fewer book events'],['standard','Standard','2 starting items'],['hard','Harder','1 starting item, more book events']].map(([k,n,x])=>`<button class="dpick ${o.diff===k?'on':''}" role="radio" aria-checked="${o.diff===k}" data-diff="${k}"><b>${n}</b><small>${x}</small></button>`).join('')}</div></div>
   <p class="muted small">${o.chars.length===1?'Solo: morale rises by 1 at the start of each morale phase.':o.chars.length===4?'Four castaways: arranging the camp gives 2 determination or morale +1, not both.':''} ${o.chars.length&&o.chars.every(k=>o.ai[k])?'Every castaway is a computer: you watch them play.':''}</p>
   <div class="mb sticky"><button class="btn go" data-a="start" ${o.chars.length?'':'disabled'}>Wash ashore ▶</button><button class="btn" data-a="rulesstart">How to play</button></div></div>`}
function cardsHtml(){const t=UI.ctab||'events';const q=(UI.cq||'').toLowerCase();const tabs=[['events','Events'],['adv','Adventures'],['mys','Mysteries'],['beasts','Beasts'],['inv','Inventions'],['items','Items'],['tokens','Discovery tokens'],['tiles','Island tiles'],['scen','Scenarios']];
  let list=[];
  if(t==='events')list=EVENTS.concat(WRECKS).map(c=>({n:c.n,tag:c.k==='crates'||WRECKS.includes(c)?'wreckage':c.icon==='book'?'book event':c.icon+' event',cp:c.cp||1,x:cardText(c)}));
  if(t==='adv')list=ADVENTURES.map(c=>({n:c.n,tag:c.deck+' adventure',cp:c.cp||1,x:cardText(c)}));
  if(t==='mys')list=MYSTERIES.map(c=>({n:c.n,tag:c.type,cp:c.cp||1,x:cardText(c)}));
  if(t==='beasts')list=BEASTS.map(b=>({n:b.n,tag:'beast',cp:1,x:`Strength ${b.str} · weapon −${b.wl} · gives ${b.food} food${b.fur?' and '+b.fur+' fur':''}${BEAST_SP[b.k]?' · '+({disc:'draw a discovery token after the fight',wound1:'1 extra wound whatever your weapon',nomed2:'2 more wounds unless you have Medicine'}[BEAST_SP[b.k]]):''}`}));
  if(t==='inv')list=Object.entries(INVENTIONS).map(([k,I])=>({n:I.n,tag:I.kind==='start'?'starting invention':I.kind==='personal'?'own invention of the '+CHARS[I.owner].n+' (only they can make it)':'invention',cp:1,x:`Needs: ${invNeedPlain(I)}. ${I.x}`})).concat(SCEN_ORDER.flatMap(s=>Object.values(SCENARIOS[s].invs).map(I=>({n:I.n,tag:'scenario: '+SCENARIOS[s].n,cp:1,x:`Needs: ${invNeedPlain(I)}. ${I.x}`}))));
  if(t==='items')list=Object.values(ITEMS).map(I=>({n:I.n,tag:'starting item (2 uses)',cp:1,x:I.x}));
  if(t==='tokens')list=Object.entries(DISCS).filter(([k,d])=>d.sc==null).map(([k,d])=>({n:d.n,tag:'discovery token',cp:d.cp,x:d.x+(d.pot?' (only with the Pot)':'')})).concat(SCEN_ORDER.flatMap(s=>SCENARIOS[s].finds.map(f=>({n:f.n,tag:'scenario find: '+SCENARIOS[s].n,cp:1,x:f.x}))));
  if(t==='tiles')list=TILES.map(ti=>({n:`Tile ${ti.no}: ${ti.terr}`,tag:'island tile',cp:1,x:`Sources: ${ti.src.join(', ')||'none'}${ti.beast?' · animal tracks (a beast joins the hunt)':''}${ti.disc?' · '+ti.disc+' discovery token'+(ti.disc>1?'s':''):''}${ti.totem?' · totem':''}${ti.shelter?' · natural shelter':''}${ti.no===START_TILE?' · the starting beach':''}`}));
  if(t==='scen')list=SCEN_ORDER.map(k=>{const S=SCENARIOS[k];return {n:`${S.no}. ${S.n}`,tag:`${S.rounds} rounds`,cp:1,x:`${esc(S.x)}<br><b>Weather:</b> ${Object.keys(S.wx).length?Object.entries(S.wx).map(([r,d])=>`R${r} ${d.join('+')}`).join(', '):'none'}`}});
  const total=list.reduce((a,c)=>a+c.cp,0);list=list.filter(c=>!q||(c.n+' '+c.tag+' '+c.x).toLowerCase().includes(q));
  return `<div class="mbox wide cards"><button class="x" data-a="close" aria-label="Close">×</button><h2>Card list</h2><div class="ctabs">${tabs.map(([k,n])=>`<button class="${t===k?'on':''}" data-ctab="${k}">${n}</button>`).join('')}</div>
   <input class="cq" type="search" placeholder="Search cards…" value="${esc(UI.cq||'')}" data-cq><p class="muted small">${list.length} shown · ${total} physical cards/tokens in this group</p>
   <div class="cgrid">${list.map(c=>`<div class="card"><h4>${esc(c.n)}${c.cp>1?` <small>×${c.cp}</small>`:''}</h4><div class="tag">${esc(c.tag)}</div><p>${c.x}</p></div>`).join('')}</div></div>`}
function invNeedPlain(I){const p=[];if(I.t)p.push(I.t);for(const it of I.it||[])p.push((INVENTIONS[it]||{}).n||it);const r=I.alt?I.alt.map(o=>Object.entries(o).map(([k,n])=>n+' '+RNAME[k]).join('+')).join(' or '):Object.entries(I.r||{}).map(([k,n])=>n+' '+RNAME[k]).join(' + ');if(r)p.push(r);return p.join(', ')||'nothing'}
// ---------- 2D map (used when WebGL is not available) ----------
function renderMap2D(){const el=$('#map2d');if(!el||V3.on){if(el)el.hidden=true;return}el.hidden=false;const R=34,W=R*Math.sqrt(3);
  const col={beach:'#e8d29a',river:'#6dbf7a',plains:'#9ccf62',hills:'#7fae55',mountains:'#9a9486'};
  el.innerHTML=`<svg viewBox="-10 -10 ${W*5+20} ${R*1.5*4+R+20}" role="img" aria-label="Island map">${MAP.map(m=>{const x=m.q*W+W/2,y=m.r*R*1.5+R;const t=tileAt(m.id);const g=G.map[m.id];
    const pts=Array.from({length:6},(_,i)=>{const a=Math.PI/3*i+Math.PI/6;return (x+Math.cos(a)*R*.98).toFixed(1)+','+(y+Math.sin(a)*R*.98).toFixed(1)}).join(' ');
    return `<g data-tile="${m.id}" class="hx ${UI.tileSel===m.id?'sel':''} ${UI.hoverPos===m.id?'pulse':''} ${UI.pick&&UI.pick.includes(m.id)?'pick':''}"><polygon points="${pts}" fill="${t?col[t.terr]:g.down?'#333':'#24364a'}" stroke="#0b1520" stroke-width="2"/><text x="${x}" y="${y-6}" text-anchor="middle">${t?(m.id+1)+' '+t.terr.slice(0,5):'❔'+(m.id+1)}</text><text x="${x}" y="${y+12}" text-anchor="middle">${m.id===G.camp.pos?'🏕':''}${g.fog?'🌫':''}${G.sc.crosses&&G.sc.crosses.includes(m.id)?'✝':''}${t?t.src.map((s,i)=>g.exh[i]?'▪':s==='wood'?'🪵':'🐟').join(''):''}</text></g>`}).join('')}</svg>`}
// ---------- input ----------
function on3DTile(id){if(storyActive())return;if(planOpen()&&!allAI()&&pstep()!==2){setPStep(2);UI.ps.pick=true}UI.tileSel=id;UI.tab='plan';tutAdvance(3);const t=tileAt(id);if(!t&&G.map[id].tile==null)UI.cat=null;render();const f=document.querySelector('.tfocus');if(f&&f.scrollIntoView)f.scrollIntoView({block:'nearest',behavior:'smooth'})}
{const t0=on3DTile;on3DTile=function(id){t0(id);if(typeof PHO!=='undefined'&&PHO.on)PHO.tile(id)}}
function autoPawn(type,tgt,alt){const humans=new Set(G.chars.filter(c=>c.human).map(c=>c.i));const free=allPawns().filter(p=>!placedIds().has(p.id)&&(p.c==null||humans.has(p.c)));const a=findActAny(type,tgt,alt);const hasLead=a&&a.pw.some(q=>{const p=pawnInfo(q);return p&&(p.c!=null||p.f)});
  const order=hasLead?free.filter(p=>p.x).concat(free.filter(p=>p.c!=null),free.filter(p=>p.f)):free.filter(p=>p.c!=null).concat(free.filter(p=>p.f),free.filter(p=>p.x));return order.find(p=>!placeWhy(p.id,type,tgt,alt))}
function doPlace(type,tgt,alt){let pid=UI.sel;if(!pid){const p=autoPawn(type,tgt,alt);if(!p){toast('No free pawn can do that.');return}pid=p.id}
  const e=place(pid,type,tgt,alt);if(e){toast(e);return}sfx('place');UI.sel=null;tutAdvance(2);wizPlaced();
  // keep the same character selected for their second pawn
  refresh()}
// the dock message: stays until the plan changes (or a few seconds for plain notes)
function toast(t,ms,keep){const el=$('#dockmsg');if(!el)return;el.textContent=t;el.hidden=false;UI.msgSig=G?planSig():'';UI.msgKeep=!!keep;GX.showDock();clearTimeout(UI.tt);UI.tt=setTimeout(()=>{el.hidden=true},ms||3600);const lv=$('#live');if(lv)lv.textContent=t}
function msgCheck(){const el=$('#dockmsg');if(!el||el.hidden||!G)return;if(UI.msgSig!==planSig()&&!UI.msgKeep)el.hidden=true;if(UI.confirmSig&&UI.confirmSig!==planSig())UI.confirm=null}
// Start the day: first ask when a red priority is still open
function wizPlaced(){if(planOpen()&&!allAI()&&pstep()===2&&!curPawn())setPStep(3)}
function tryStart(force){if(!planOpen())return;if(!force){const red=uncoveredRed();if(red.length){UI.confirm=red.map(p=>p.confirm||('⚠ '+p.title+' is not covered.')).join(' ');UI.confirmSig=planSig();render();GX.showDock();return}}
  UI.confirm=null;const r=startActions();if(r)toast(r);else{sfx('click');if(UI.tut<99)tutDone()}}
function pulsePos(p){if(UI.hoverPos===p)return;UI.hoverPos=p;try{if(V3.lab)for(const id in V3.lab)V3.lab[id].classList.toggle('pulse',+id===p);if(!V3.on)withView(()=>renderMap2D())}catch(e){}}
document.addEventListener('click',e=>{const pr=e.target.closest&&e.target.closest('.gx-dock [data-pos]');if(pr){pulsePos(+pr.dataset.pos);clearTimeout(UI.pt);UI.pt=setTimeout(()=>pulsePos(null),2500)}
  if(!e.target.closest('#moremenu,[data-a=menu]'))closeMenu();
  if(!e.target.closest('#gfxpop,[data-a=gfx]'))closeGfx();
  const b=e.target.closest('button,[data-tile],input[type=checkbox],summary');if(!b)return;const d=b.dataset;if(typeof netClick==='function'&&netClick(b,d,e))return;
  if(d.tab){UI.tab=d.tab;render();return}
  if(d.ans!=null){sfx('click');answer(+d.ans);return}
  if(d.do!=null){const p=priorities()[+d.do];if(p&&p.act){const before=placedIds();const r=p.can?doJob(p.act.type,p.act.tgt,p.act.alt,p.lead):p.move?applyMove(p):(p.cant||'Not possible now.');
      if(r)toast(r);else{sfx('place');tutAdvance(2);const who=[];for(const a of G.plan.acts){const ids=a.pw.filter(id=>!before.has(id));if(ids.length)who.push(`${pawnGroup(ids)} → ${actLabel(a)}`)}refresh();toast('Planned: '+who.join(' · ')+(p.move?` (${p.move.nm} left “${p.move.label}”)`:''),4000);return}}refresh();return}
  if(d.cat){UI.cat=UI.cat===d.cat?null:d.cat;render();if(UI.cat){const c=document.querySelector('#ppop .catbody')||document.querySelector('#panel .catbody');if(c&&c.scrollIntoView)c.scrollIntoView({block:'nearest',behavior:'smooth'})}return}
  if(d.phx){UI.phx=UI.phx===d.phx?null:d.phx;renderRoadmap();return}
  if(d.pgo){setPStep(+d.pgo);render();return}
  if(d.pq!=null){const p=priorities()[+d.pq];const cur=curPawn();if(p&&p.act&&cur){const e=place(cur.id,p.act.type,p.act.tgt,p.act.alt);if(e)toast(e);else{sfx('place');UI.sugWhy[JSON.stringify([p.act.type,p.act.tgt])]=p.title;UI.sel=null;wizPlaced();refresh()}}return}
  if(d.tut){if(d.tut==='off')tutDone();else UI.tut++;render();return}
  if(d.gtip){if(d.gtip==='off'){UI.guide.on=false;UI.guideOff=true}else UI.guide.seen[d.gtip]=1;sfx('click');refresh();return}
  if(d.place){const o=JSON.parse(decodeURIComponent(d.place));doPlace(o.type,o.tgt,o.alt);return}
  if(d.rm){unplace(d.rm);UI.sel=null;refresh();return}
  if(d.pawn&&b.closest('.pawnrow')&&placedIds().has(d.pawn)&&planOpen()){unplace(d.pawn);UI.sel=d.pawn;UI.ps.pick=true;refresh();return}
  if(d.pawn){UI.sel=UI.sel===d.pawn?null:d.pawn;sfx('click');render();return}
  if(d.pay){const a=G.plan.acts.find(x=>x.id===+d.pay);setPay(a.id,a.pay==='wood'?'fur':'wood');refresh();return}
  if(d.skill){const [ci,k]=d.skill.split(':');const r=useSkill(+ci,k);if(r)toast(r);return}
  if(d.item){const r=useItem(d.item);if(r)toast(r);return}
  if(d.disc!=null){const r=discUse(+d.disc);if(r)toast(r);return}
  if(d.tile!=null){on3DTile(+d.tile);return}
  if(d.scen){UI.setup.scen=d.scen;render();return}
  if(d.char){const s=UI.setup;const i=s.chars.indexOf(d.char);if(i>=0)s.chars.splice(i,1);else if(s.chars.length<4)s.chars.push(d.char);s.friday=s.chars.length<=2;s.dog=s.chars.length===1||s.diff==='easy';render();return}
  if(d.ctl){UI.setup.ai[d.ctl]=d.v?d.v==='ai':!UI.setup.ai[d.ctl];render();return}
  if(d.ctab){UI.ctab=d.ctab;renderCards();return}
  if(d.diff){const s=UI.setup;s.diff=d.diff;s.items={easy:4,standard:2,hard:1}[d.diff];if(d.diff==='easy'){s.dog=true;s.friday=true}render();return}
  if(d.opt&&b.type==='checkbox'){UI.setup[d.opt]=b.checked;return}
  switch(d.a){
  case 'go':tryStart(!!d.force);return;
  case 'goback':UI.confirm=null;render();return;
  case 'next':storyNext();return;case 'skip':storySkip();return;
  case 'auto':UI.auto=!UI.auto;try{localStorage.setItem('swi_auto',UI.auto?'1':'0')}catch(e){}render();return;
  case 'suggest':{const m=suggestPlan();setPStep(3);toast(m?'💡 Every pawn has a job now. Check the risk of each one below, and change anything you like.':'💡 Nothing to add.',6000);render();return}
  case 'pnext':setPStep(pstep()+1);render();return;case 'pback':setPStep(pstep()-1);render();return;
  case 'pick':UI.ps.pick=!UI.ps.pick;render();return;
  case 'pskip':{const c=curPawn();if(c&&c.c==null)UI.ps.skip.push(c.id);UI.sel=null;wizPlaced();render();return}
  case 'rec':{const c=curPawn();const r=c&&recPlan().map[c.id];if(!r){toast('No job to recommend: choose one below.');UI.ps.pick=true;render();return}const e=place(c.id,r.type,r.tgt,r.alt);if(e){toast(e);UI.ps.pick=true;render();return}
    sfx('place');if(r.why)UI.sugWhy[JSON.stringify([r.type,r.tgt])]=r.why;UI.sel=null;wizPlaced();refresh();return}
  case 'quick':setQuick(b.checked);render();return;
  case 'sofar':e.preventDefault();UI.ps.sofar=!UI.ps.sofar;render();return;
  case 'retry':retryGame(d.easy==='1');return;case 'menu':toggleMenu();return;
  case 'clear':clearPlan(G.chars.filter(c=>c.human).map(c=>c.i));refresh();return;
  case 'pile':{const r=pileAdd(1);if(r)toast(r);return}case 'pilemax':{const r=pileAdd(SCEN.marooned.pileRoom());if(r)toast('Can’t add wood now: '+r+'.');else{sfx('place');refresh()}return}
  case 'untile':UI.tileSel=null;render();return;
  case 'later':UI.openLater=!UI.openLater;e.preventDefault();render();return;
  case 'moveask':G.moveAsk=b.checked?1:0;return;
  case 'okreport':UI.report=null;render();return;
  case 'overok':UI.overSeen=true;render();return;
  case 'new':openStart();return;case 'start':UI.guide.on=false;UI.cmpDef=null;beginGame();return;case 'story':campOpen();return;case 'guided':Object.assign(UI.setup,{scen:'marooned',chars:['carpenter','cook'],ai:{},friday:true,dog:true,items:4,diff:'easy'});UI.guide={on:true,seen:{}};UI.cmpDef=null;beginGame();return;case 'continue':loadSaved();return;
  case 'rulesstart':UI.modal=null;$('#modal').hidden=true;$('#modal').dataset.h='';GX.show('rulesd');UI.backToStart=!G;return;
  case 'cards':GX.show('cardsd');renderCards();return;case 'rules':GX.show('rulesd');return;case 'close':UI.modal=G?null:'start';if(!G)$('#modal').dataset.h='';render();return;
  case 'snd':toggleSound();return;case 'mus':toggleMusic();return;
  case 'gfx':if($('#gfxpop').hidden)openGfx();else closeGfx();return;
  case 'gfxq':setGfx(d.q);gfxBtn();renderGfx();return;
  case 'speed':UI.speed=UI.speed===1?3:UI.speed===3?0.5:1;render();return;case 'pause':UI.pause=!UI.pause;render();schedule();return}});
document.addEventListener('input',e=>{const t=e.target;if(t.dataset.cq!=null){UI.cq=t.value;const pos=t.selectionStart;renderCards();const i=$('#cardsbody [data-cq]');if(i){i.focus();i.setSelectionRange(pos,pos)}}if(t.dataset.opt==='items')UI.setup.items=+t.value});
document.addEventListener('change',e=>{const t=e.target;if(t.dataset.opt==='items')UI.setup.items=+t.value});
document.addEventListener('keydown',e=>{if(typeof netKey==='function'&&netKey(e))return;if(e.target.tagName==='INPUT'||e.target.tagName==='SELECT')return;if(e.key==='Escape'){if(!$('#gfxpop').hidden){closeGfx();return}if(UI.modal&&G){UI.modal=null;render()}else if(UI.report){UI.report=null;render()}else{UI.sel=null;UI.tileSel=null;render()}}
  if(!G||UI.modal)return;if(storyActive()){if((e.key==='Enter'||e.key===' '||e.key==='ArrowRight')&&!humanQ()){e.preventDefault();storyNext()}return}if(e.key==='Enter'&&planOpen()&&!G.q&&!allAI()){if(e.target.closest&&e.target.closest('button'))return;if(pstep()<4){setPStep(pstep()+1);render()}else tryStart(!!UI.confirm||uncoveredRed().length>0)}if((e.key==='h'||e.key==='H')&&planOpen()){suggestPlan();setPStep(3);render()}});
// hovering or tapping a job pulses its place on the map
document.addEventListener('mouseover',e=>{const t=e.target.closest&&e.target.closest('.gx-dock [data-pos]');pulsePos(t?+t.dataset.pos:null)});
document.addEventListener('focusin',e=>{const t=e.target.closest&&e.target.closest('.gx-dock [data-pos]');if(t)pulsePos(+t.dataset.pos)});
// ---------- game start ----------
UI.setup={scen:'marooned',chars:['carpenter','cook'],ai:{},friday:true,dog:false,items:2,diff:'standard'};
function openStart(){UI.modal='start';UI.overSeen=false;render();const m=$('#modal');m.hidden=false;m.innerHTML=startHtml();m.dataset.h=''}
function beginGame(){const s=UI.setup;resetPlanSteps();UI.modal=null;UI.report=null;UI.overSeen=false;UI.sel=null;UI.tileSel=null;UI.fx.length=0;UI.fxSeen=0;
  const all=s.chars.every(k=>s.ai[k]);UI.cmpDone=false;newGame({scen:s.scen,chars:s.chars.slice(),humans:s.chars.map(k=>!s.ai[k]),mode:all?'ai':'solo',friday:s.friday,dog:s.dog,items:s.items,diff:s.diff,cmp:UI.cmpDef?{id:UI.cmpDef.id,goal:UI.cmpDef.goal,twist:UI.cmpDef.twist}:null,noIntro:!!UI.cmpDef});UI.reportMark=G.logN;V3.layout=null;
  for(const k in V3.tiles){V3.scene&&V3.scene.remove(V3.tiles[k].g)}V3.tiles={};refresh()}
function loadSaved(){try{const g=JSON.parse(localStorage.getItem(SAVE));if(!g||!g.v)throw 0;G=g;resetPlanSteps();UI.beats.length=0;UI.shown=-1;beat('dawn',{round:G.round});UI.modal=null;UI.reportMark=G.logN;V3.layout=null;for(const k in V3.tiles){V3.scene&&V3.scene.remove(V3.tiles[k].g)}V3.tiles={};if(G.scen==='stranded'&&!CHARS.ada)CHARS.ada={n:'Ada',die:11,arrows:[],skills:[],npc:1};refresh()}catch(e){toast('No saved game found.');openStart()}}
function boot(){GX.init({key:'swi'});if(typeof PHO!=='undefined')PHO.boot();GX.onClose=id=>{if(id==='rulesd'&&UI.backToStart){UI.backToStart=false;openStart()}};GX.onShow=id=>{if(!G&&id!=='rulesd'&&id!=='cardsd'){GX.close();return}if(id==='cardsd')renderCards();if(id==='rulesd')$('#rulesbody').innerHTML=RULES_HTML;if(G)render()};paintIcons();try{init3D()}catch(e){console.error(e)}gfxBtn();soundBtns&&soundBtns();openStart()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
