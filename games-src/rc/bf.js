// ===================== board-first phone play =====================
// On a phone (html.ph) the island is the screen: one status line (8 words or fewer), one big button, your pawns, and
// everything else is shown ON the island: glowing places, job chips with pawn dots, floating scores, dice, a ghost finger.
// The old dock (story card, planning wizard, journal) stays in the page but hidden; its text lives in the Details drawer.
// Rules, AI and story player are untouched: this only presents them differently. Online play keeps the older phone layout.
const BF={on:false,msg:null,msgT:0,fxId:null,ghostDone:false,pops:0};
try{BF.ghostDone=localStorage.getItem('swi_ghost')==='1'}catch(e){}
(function(){
const q=s=>document.querySelector(s),R=document.documentElement;
const E=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const w8=s=>{s=String(s==null?'':s).replace(/\s+/g,' ').trim();const w=s.split(' ');return w.length<=8?s:w.slice(0,8).join(' ')+'…'};
// a sentence shortened to a clause of 8 words or fewer
const brief=t=>{let s=String(t==null?'':t).replace(/\s+/g,' ').trim();if(s.split(' ').length>8){const c=s.split(/[:;(—.]/)[0].trim();if(c&&c.split(' ').length>=2)s=c}return w8(s)};
const netOn=()=>typeof NET!=='undefined'&&NET.on;
const pcol=pid=>{const m=/^c(\d+)_/.exec(pid||'');return m?PCOL[(+m[1])%6]:pid==='fri'?'#f3f3f3':pid==='dog'?'#9b6bd6':'#8d8d8d'};
// a choice as a short main line plus one small plain line: "Cutlass (+3, you take 1 wound)" -> Cutlass / +3. You take 1 wound.
// (owner 8 Nov: no brackets, at most 12 words a line)
const cap1=s=>s?s.charAt(0).toUpperCase()+s.slice(1):s;
const w12=s=>{const w=String(s).split(' ');return w.length<=12?s:w.slice(0,12).join(' ')+'…'};
function optHtml(l){l=String(l==null?'':l).replace(/\s+/g,' ').trim();let main=l,sub='';const m=/^(.*?)\s*\(([^()]*)\)(.*)$/.exec(l);
  if(m){main=(m[1]+m[3]).replace(/\s+:/,':').trim();sub=m[2]}
  const c=/^([^:]{2,40}):\s+(.+)$/.exec(main);if(c&&!sub){main=c[1];sub=c[2]}else if(c&&sub){main=c[1];sub=c[2]+'. '+sub}
  sub=sub.split(/;\s*|,\s+(?=[a-z])|\.\s+/).map(x=>cap1(x.trim())).filter(Boolean).join('. ');if(sub&&!/[.!?]$/.test(sub))sub+='.';
  return `<b class="ol">${E(w12(main))}</b>${sub?`<small class="os">${E(w12(sub))}</small>`:''}`}
const FINGER='<u class="rg"></u><span class="fg">👆</span>';
// ---------- one-time DOM: tray, overlay, zoom buttons, ghost finger ----------
function init(){if(BF.ready)return;BF.ready=true;const app=q('.gx-app'),board=q('.gx-board'),view=q('.gx-board .view');if(!app||!board)return;
  const tray=document.createElement('div');tray.id='bf';tray.setAttribute('role','region');tray.setAttribute('aria-label','Your move');app.appendChild(tray);
  const ov=document.createElement('div');ov.id='bfov';ov.innerHTML='<div id="bfglow"></div><div id="bfchips"></div>';(view||board).appendChild(ov);
  const rs=document.createElement('div');rs.id='bfres';rs.setAttribute('role','group');rs.setAttribute('aria-label','Shared supplies');board.appendChild(rs);const pp=q('#ppop');if(pp)board.appendChild(pp);
  const pv=q('#phview');const bz=document.createElement('div');bz.id='bfzoom';board.appendChild(bz);if(pv)for(const b of [...pv.querySelectorAll('[data-ph=in],[data-ph=out],[data-ph=camp]')])bz.appendChild(b);
  if(pv&&!pv.querySelector('.bf-i')){const i=document.createElement('button');i.className='gx-ibtn bf-i';i.dataset.bf='info';i.setAttribute('aria-label','Details');i.innerHTML='<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.1"/></svg>';pv.appendChild(i)}
  const gh=document.createElement('div');gh.id='bfgh';gh.hidden=true;gh.setAttribute('aria-hidden','true');gh.innerHTML='<div class="f">'+FINGER+'</div>';document.body.appendChild(gh);
  board.addEventListener('pointerdown',e=>BF.autoTap(e),true);
  document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-bf]');if(b&&b.dataset.bf==='info'){BF.info();e.stopPropagation()}},true);
  // the labels loop moves the chips and the finger with the camera
  if(typeof placeLabels==='function'){const pl0=placeLabels;placeLabels=function(){pl0.apply(this,arguments);if(BF.on)BF.place()}}
  // short messages go to the status line, never into the hidden dock
  if(typeof toast==='function'){const t0=toast;toast=function(t,ms,keep){if(BF.on){const s=/^✨ Every pawn/.test(t||'')?'Plan ready. Check it, then start.':brief(t);BF.say(s,ms)}else t0.apply(this,arguments)}}}
// ---------- geometry ----------
function tilePt(id){const ov=q('#bfov');if(!ov)return null;const r0=ov.getBoundingClientRect();
  if(typeof V3!=='undefined'&&V3.on&&V3.cam&&V3.r&&typeof MAP!=='undefined'&&MAP[id]){const p=hexPos(MAP[id].q,MAP[id].r);const v=new THREE.Vector3(p.x,HEXH,p.z);V3.cam.updateMatrixWorld();v.project(V3.cam);
    if(v.z<1){const c=V3.r.domElement.getBoundingClientRect();return {x:c.left+(v.x+1)/2*c.width-r0.left,y:c.top+(1-v.y)/2*c.height-r0.top,ox:r0.left,oy:r0.top,w:r0.width,h:r0.height}}}
  const g=q(`#map2d [data-tile="${id}"]`);if(g){const b=g.getBoundingClientRect();return {x:b.left+b.width/2-r0.left,y:b.top+b.height/2-r0.top,ox:r0.left,oy:r0.top,w:r0.width,h:r0.height}}return null}
BF.tilePt=tilePt;
// ---------- legal places for the pawn in hand ----------
function legalRows(id,cur){if(!cur)return [];let rows=[];try{rows=PHO.tileRows(id)}catch(e){}rows=rows.filter(r=>!r.why&&!placeWhy(cur.id,r.type,r.tgt,r.alt)&&(findAct(r.type,r.tgt)||canPay(r,cur)));
  // a helper pawn (not a castaway, not Friday) can only join a job a castaway or Friday already leads
  try{const pi=pawnInfo(cur.id);if(pi&&pi.c==null&&!pi.f)rows=rows.filter(r=>{const a=findActAny(r.type,r.tgt,r.alt);return !!a&&a.pw.some(q=>{const o=pawnInfo(q);return o&&(o.c!=null||o.f)})})}catch(e){}return rows}
function canPay(r,cur){try{const a={type:r.type,tgt:r.tgt,alt:r.alt||0,pw:[cur.id]};if(afford(a))return true;if(r.type==='build'&&['shelter','roof','pal'].includes(r.tgt.k)){for(const pay of ['fur','wood']){a.pay=pay;if(afford(a))return true}}return false}catch(e){return true}}
function legalTiles(cur){if(!cur)return [];const k=planSig()+'|'+cur.id+'|'+G.logN+'|'+JSON.stringify(G.res);if(BF._lk===k)return BF._lt;const out=[];for(const m of MAP)if(legalRows(m.id,cur).length)out.push(m.id);BF._lk=k;BF._lt=out;return out}
BF.legal=legalTiles;BF.recTile=(c)=>recTile(c);window.legalRowsDbg=id=>{const c=curPawn();return legalRows(id,c).map(r=>r.title)};
function recTile(cur){if(!cur)return null;const rec=recPlan().map[cur.id];if(!rec||placeWhy(cur.id,rec.type,rec.tgt,rec.alt))return null;
  const same=r=>r.type===rec.type&&JSON.stringify(r.tgt)===JSON.stringify(rec.tgt)&&(r.alt||0)===(rec.alt||0);for(const m of MAP)if(legalRows(m.id,cur).some(same))return {id:m.id,rec};return null}
// a choice that is a place on the island (where the fog goes): the places glow and you tap one
function posQ(){if(!G||!G.q||!humanQ())return null;const o=G.q.opts;if(!o||!o.length||!o.every(x=>x.pos!=null&&MAP[x.pos]))return null;const i=storyIdx();if(i<0||i<UI.beats.length-1)return null;return o}
BF.posQ=posQ;
// ---------- the status line ----------
function capFor(i){const b=UI.beats[i];if(!b)return '';const d=b.data||{};const S=SCENARIOS[G.scen];const F=typeof FLAVOR!=='undefined'?FLAVOR:{};const fs=((F.scen)||{})[G.scen]||{};const nm=c=>c&&c.nm?c.nm:'Friday';
  switch(b.kind){
  case 'intro':return d.page===0?`Chapter ${SCEN_ORDER.indexOf(G.scen)+1}: ${S.n}`:d.page===d.of-1?'Survive until rescue comes':(fs.title||S.n);
  case 'dawn':return `Day ${d.round} of ${G.rounds} begins`;
  case 'event':{const c=CARD[d.card];return d.late?`It returns: ${c.ev.n}`:`Event: ${c.n}`}
  case 'threat':{const c=CARD[d.card];return `Too late: ${c.th?c.th.n:c.n}`}
  case 'morning':{const m=(beatState(i)||G).morale;return `Morning: morale ${m>0?'+'+m:m}`}
  case 'prod':return 'The camp provides today';
  case 'go':return 'Everyone heads out to work';
  case 'act':{const c=d.actor>=0?P(d.actor):null;return `${nm(c)}: ${d.label}`}
  case 'finds':return 'The day’s haul reaches camp';
  case 'adventure':return `Adventure: ${CARD[d.card].n}`;
  case 'mystery':return `Mystery: ${CARD[d.card].n}`;
  case 'fight':return `${d.hunted?'Hunt':'Fight'}: ${String(d.name||'a beast')}`;
  case 'weather':{const w=(viewState()||G).lastWx;const r=w&&w.rain,s=w&&w.snow;return w&&w.storm?'Weather: a storm':r||s?`Weather: ${(r||0)+(s||0)} cloud${(r||0)+(s||0)>1?'s':''}`:'Weather: calm'}
  case 'night':return 'Night falls on the camp';
  case 'daysum':return `Day ${d.round} is over`;
  case 'over':{const w=G.over&&G.over.win;return w?'Rescued!':'Lost on the island'}
  default:return ''}}
function planCap(st){const cur=curPawn();const pb=planProblems();
  if(UI.confirm&&planOpen())return brief(String(UI.confirm).replace(/^⚠\s*/,''));
  if(cur){const n=pawnLabel(cur).split(' ')[0];const lt=legalTiles(cur);if(!lt.length)return `No job for ${n} now`;return pb.length||cur.c!=null?`${n}: tap a glowing place`:`${n}: tap a place, or start`}
  if(pb.length)return badActs().size?'Tap a pulsing pawn to fix it':brief(pb[0]);return 'All set. Start the day!'}
BF.status=function(){if(BF.msg&&Date.now()<BF.msg.until)return BF.msg.t;BF.msg=null;
  const st=PHO.st;if(st==='story'){const i=storyIdx();if(i<0)return '';const last=i>=UI.beats.length-1;if(last&&humanQ())return posQ()?'Tap a glowing space':brief(G.q.title);return w8(capFor(i))}
  if(st==='plan'||st==='plan2')return w8(planCap(st));if(st==='over')return G.over&&G.over.win?'Rescued!':'Lost on the island';
  if(allAI())return UI.pause?'Paused':'The computer is playing';return 'The castaways are working'};
// owner 8 Nov: a message stays at least 4 s plus 1 s per 10 words, so it can be read before it goes
const readMs=(t,ms)=>Math.max(ms||0,4000+1000*Math.ceil(String(t||'').split(/\s+/).filter(Boolean).length/10));
BF.say=function(t,ms){t=w8(t);ms=readMs(t,ms);BF.msg={t,until:Date.now()+ms};BF.paint();clearTimeout(BF.msgT);BF.msgT=setTimeout(()=>{BF.msg=null;BF.paint()},ms+30)};
// whose turn it is: a small banner above the one instruction line (owner 7 Nov: "if I cannot understand it in a minute it is unplayable")
function turnBanner(){const st=PHO.st;if(st==='plan'||st==='plan2')return ['you','Your turn: plan the day'];if(st==='over')return ['end','Game over'];
  if(st==='story'){const i=storyIdx();if(i<0)return ['isl',''];const last=i>=UI.beats.length-1;if(last&&humanQ())return ['you','Your choice'];const k=UI.beats[i].kind;
    if(['go','act','finds','adventure','mystery','fight'].includes(k))return ['you','Your castaways at work'];
    if(['event','threat','morning','weather','night','daysum'].includes(k))return ['isl','The island’s turn: '+({event:'event card',threat:'threat',morning:'morale',weather:'weather',night:'night',daysum:'day summary'})[k]];
    return ['isl','A new day']}
  return ['isl','The island’s turn']}
function resStrip(){let o=null;try{withView(()=>{o={f:food(),need:eatersNeed(),w:G.res.wood,low:(()=>{let m=99;for(const c of G.chars){if(c.npc&&G.scen!=='stranded'||c.dead)continue;m=Math.min(m,CHARS[c.k].die-c.w)}return m===99?0:m})(),sh:hasShelter(),mo:G.morale,d:G.round,r:G.rounds}})}catch(e){}if(!o)return '';
  // resources as tokens: the owner's icon, a big number, the name under it (owner 8 Nov: "a spreadsheet")
  const tk=(bad,ic,n,nm)=>`<span class="tk ${bad?'bad':''}">${ic.length>2?`<img src="media/icon-res-${ic}.webp" alt="">`:`<i>${ic}</i>`}<b>${n}</b><small>${nm}</small></span>`;
  let pc=null;try{withView(()=>{pc=goalPace()})}catch(e){}
  return tk(false,'📅',o.d,'of '+o.r+' days')+tk(o.f<o.need,'food',o.f,'Food · eat '+o.need)+tk(false,'wood',o.w,'Wood')+tk(o.low<=3,'❤',o.low,'Life')+tk(!o.sh,'shelter',o.sh?'✓':'✗','Shelter')+(pc?tk(pc.behind,'🔥',pc.pile+'/15','Pile'):'')+(pc&&pc.behind?`<span class="pace" role="alert">⚠ ${E(pc.text)}</span>`:'')}
// R3 review: say during play when the rescue goal is behind schedule (Marooned: fire, then a 15-wood pile by day 10-12). Targets come from
// easy-sim.js: winning games average pile 6 by day 6, 10 by day 9; losing games are 2-3 behind that.
function goalPace(day){if(!G||G.scen!=='marooned'||G.over||!G.sc)return null;const d=Math.min(G.rounds,day||G.round),pile=G.sc.pile|0,fire=!!(G.inv&&G.inv.built&&G.inv.built.fire);
  if(!fire&&d>=4)return {pile,behind:true,text:`No fire yet, day ${d}: build the fire first`};
  const t=PACE_T[d];if(t&&pile<t&&pile<15)return {pile,behind:true,text:`Pile ${pile}/15, day ${d}: build faster (aim for ${t})`};
  return {pile,behind:false,text:''}}
BF.paint=function(){if(G&&R.dataset.scen!==G.scen)R.dataset.scen=G.scen;const rs=q('#bfres');if(rs&&G){const h=resStrip();if(rs.dataset.h!==h){rs.dataset.h=h;rs.innerHTML=h}}const lb=q('#phlabel');if(!lb||!BF.on)return;const s=BF.status();const bn=turnBanner();const key=bn[0]+'|'+bn[1]+'|'+s;if(lb.dataset.k===key)return;lb.dataset.k=key;
  lb.innerHTML=(bn[1]?`<small class="bfb ${bn[0]}">${E(bn[1])}</small>`:'')+`<span class="bft">${E(s)}</span>`};
// ---------- the tray: your pawns and one big button ----------
function badActs(){const o=new Set();try{const pb=planProblems();for(const a of G.plan.acts){const l=actLabel(a);if(pb.some(m=>m.indexOf(l)===0))o.add(a.id)}}catch(e){}return o}
// the advisor's pick on a choice (the same aiChoose the bulb uses), worked out on a copy so the game is untouched; cached per question
function recAns(qq){if(n2(qq.opts)<2||allAI())return -1;const key=G.logN+'|'+qq.title+'|'+qq.opts.length;if(BF.recQ&&BF.recQ.k===key)return BF.recQ.v;let v=-1;const save=JSON.stringify(G);UI.recBusy=1;try{v=aiChoose(qq.title,qq.opts,G.chars[qq.who],qq);if(typeof v!=='number')v=-1}catch(e){v=-1}finally{G=JSON.parse(save);UI.recBusy=0}BF.recQ={k:key,v};return v}
const n2=a=>a?a.length:0;
// one plain line that says what the helper pawns do (G6 r2: Hammer and Dog were never explained)
function helpLine(){let xs=[];try{xs=extraPawns()}catch(e){}if(!xs.length)return '';const t=x=>x.id==='dog'?'Dog: helps hunt or explore, no wounds':x.id==='hammer'?'Hammer: an extra pawn for one build':`${x.n.split(' ')[0]}: an extra pawn for ${x.t.map(k=>(TNAME[k]||k).toLowerCase()).join(' or ')}`;return `<div class="bfhelp">${xs.map(x=>`<div>${E(t(x))}</div>`).join('')}</div>`}
function tokHtml(p,cur,bad){const a=G.plan.acts.find(x=>x.pw.includes(p.id));const nm=p.x?pawnLabel(p).split(' ')[0]:pawnLabel(p);
  return `<span class="bfpc">`+`<button class="bfpw ${cur&&cur.id===p.id?'on':''} ${a?'set':''} ${a&&bad&&bad.has(a.id)?'bad':''}" style="--pc:${pcol(p.id)}" data-pawn="${p.id}" title="${E(pawnNice(p))}${p.x&&p.t?E(': a helper pawn, it can only '+p.t.map(t=>(TNAME[t]||t).toLowerCase()).join(' or ')):''}" aria-label="${E(pawnNice(p))}${a?': '+E(actLabel(a))+' (tap to change)':', no job yet'}"">${(()=>{const k=p.c!=null&&P(p.c)?P(p.c).k:p.f?'friday':null;return k?`<img class="bfpic" src="media/camp-${k}.webp" alt="" onerror="this.remove()">`:''})()}<b class="ico">${pawnIcon(p)}</b>${p.id.endsWith('_1')?'<sub>2</sub>':''}${a?`<u>${AI(a.type)}</u>`:''}</button><em class="bfpn">${E(nm)}${a?`<br><i>${E((TNAME[a.type]||a.type).replace('Arrange the camp','Camp').replace('Face a threat','Threat'))}</i>`:p.x&&p.t?`<br><i>helper</i>`:''}</em></span>`}
function trayHtml(st){
  if(st==='story'){const i=storyIdx();if(i<0)return '';const b=UI.beats[i];const last=i>=UI.beats.length-1;const qq=last&&humanQ()?G.q:null;
    if(qq&&posQ())return '';if(qq){const n=qq.opts.length;const rk=recAns(qq);return `<div class="bf-opts n${n}">${qq.opts.map((o,j)=>`<button class="btn opt${j===rk?' rec':''}" data-ans="${j}">${j===rk?'<span class="recb" title="The advisor would pick this">✨</span>':''}${optHtml(o.l)}</button>`).join('')}</div>`}
    const nextL=b.kind==='daysum'&&!last?`Start day ${b.data.round+1} ▶`:last?(G.over?'See how it ended ▶':'Plan the day ▶'):'Continue ▶';
    return `<div class="bf-main"><button class="gx-ibtn bf-s ${UI.auto?'on':''}" data-a="auto" aria-pressed="${!!UI.auto}" aria-label="Play by itself">⏩</button><button class="btn go" data-a="next">${nextL}</button>${i<UI.beats.length-2?'<button class="gx-ibtn bf-s" data-a="skip" aria-label="Skip ahead">⏭</button>':''}</div>`}
  if(st==='plan'||st==='plan2'){const cur=curPawn();const pb=planProblems();
    if(UI.confirm&&planOpen())return `<div class="bf-main"><button class="gx-ibtn bf-s" data-a="suggest" aria-label="Plan it for me" title="Plan it for me">✨</button><button class="btn ghost" data-a="goback">Go back</button><button class="btn go" data-a="go" data-force="1">Start anyway ▶</button></div>`;
    return `<div class="pawnrow bf-pw" aria-label="Your pawns">${(()=>{const bd=badActs();return wizPawns().map(p=>tokHtml(p,cur,bd)).join('')})()}</div>${helpLine()}<div class="bf-main"><button class="gx-ibtn bf-s" data-a="suggest" aria-label="${BF.hintOn()?'Suggest a move':'Plan it for me'}" title="${BF.hintOn()?'Suggest a move: shows where the next pawn could go':'Plan it for me'}">✨</button><button class="btn go ${pb.length?'dim':''}" data-a="go">Start day ▶</button></div>`}
  if(allAI()&&!G.over)return `<div class="bf-main"><button class="gx-ibtn bf-s" data-a="pause" aria-label="Pause">${UI.pause?'▶':'⏸'}</button><button class="gx-ibtn bf-s" data-a="speed" aria-label="Speed">⏩</button></div>`;
  return ''}
// ---------- chips on the island: the plan, then the day's jobs ----------
function actPos(a){let p=null;try{p=pawnSpot(a)}catch(e){}return p!=null&&MAP[p]?p:G.camp.pos}
function chipsFor(st){const out=[];
  if(st==='plan'||st==='plan2'){for(const a of G.plan.acts){if(!a.pw.length)continue;const n=actNeed(a);const k=a.pw.length;const risk=k<n.need?'warn':(n.roll&&k<n.max)?'dice':'sure';
    out.push({pos:actPos(a),a,risk,badge:risk==='warn'?`needs +${n.need-k}`:risk==='dice'?'🎲 risky':'✔ sure',rm:a.pw[a.pw.length-1],cur:UI.lastAct===a.id,done:false})}return out}
  if(st==='story'){const i=storyIdx();if(i<0)return out;const b=UI.beats[i];if(!['go','act','finds'].includes(b.kind))return out;const s=beatState(i);if(!s||!s.plan)return out;
    for(const a of s.plan.acts){if(!a.pw.length)continue;const here=b.kind==='act'&&b.data.id===a.id;out.push({pos:(()=>{let p=null;try{p=pawnSpot(a)}catch(e){}return p!=null&&MAP[p]?p:s.camp.pos})(),a,risk:'sure',badge:a.done&&!here?'✓':'',rm:null,cur:here,done:!!a.done&&!here})}return out}
  return out}
function renderChips(st){const host=q('#bfchips');if(!host)return;const cs=chipsFor(st);
  const sig=JSON.stringify(cs.map(c=>[c.pos,c.a.id,c.a.type,c.a.pw,c.risk,c.cur,c.done]))+st+'|'+BF.exp;if(host.dataset.s===sig)return;host.dataset.s=sig;
  const g={};cs.forEach((c,j)=>{(g[c.pos]=g[c.pos]||[]).push([c,j])});
  // one plate per place: several jobs collapse to the first (or the one playing now) plus a "+N" button that opens the rest (W493 polish)
  for(const pos in g){const L=g[pos];if(L.length<2||BF.exp===+pos)continue;const k=Math.max(0,L.findIndex(([c])=>c.cur));g[pos]=[L[k]];g[pos].more=L.length-1}
  host.innerHTML=Object.keys(g).map(pos=>`<div class="bfg" data-t="${pos}" data-below="${+pos===G.camp.pos?1:0}">${g[pos].map(([c,j])=>{const dots=c.a.pw.map(pid=>`<i style="--pc:${pcol(pid)}"></i>`).join('');const inner=`<s>${AI(c.a.type)}</s><b class="bfw">${E((TNAME[c.a.type]||c.a.type).replace('Arrange the camp','Camp').replace('Face a threat','Threat'))}</b><span class="dots">${dots}</span>${c.badge?`<em>${c.badge}</em>`:''}`;
    const cls=`bfa ${c.risk} ${c.cur?'cur':''} ${c.done?'done':''}`;const lab=`${E(actLabel(c.a))}${c.rm?' (tap to take back)':''}`;
    return c.rm?`<button class="${cls}" style="--d:${j*(st==='story'?420:90)}ms" data-rm="${c.rm}" aria-label="${lab}">${inner}</button>`:`<div class="${cls}" style="--d:${j*(st==='story'?420:90)}ms" title="${lab}">${inner}</div>`}).join('')}${g[pos].more?`<button class="bfmore" data-exp="${pos}" aria-label="${g[pos].more} more job${g[pos].more>1?'s':''} here: show them">+${g[pos].more}</button>`:''}</div>`).join('');
  BF.place()}
// a tap that misses every glowing place (the camera was still easing, or it fell on a neighbour) lands on the nearest glowing place within a thumb's reach
BF.snap=function(x,y,id){if(!BF.on||!UI.pick||!UI.pick.length||(id!=null&&UI.pick.includes(id)))return null;let best=null,bd=46;for(const g of document.querySelectorAll('#bfglow .bfgl')){if(g.style.visibility==='hidden')continue;const r=g.getBoundingClientRect();const d=Math.hypot(r.left+r.width/2-x,r.top+r.height/2-y);if(d<bd){bd=d;best=g}}return best?+best.dataset.t:null};
BF.place=function(){const gl=q('#bfglow');if(gl)for(const g of gl.children){const p=tilePt(+g.dataset.t);if(!p){g.style.visibility='hidden';continue}g.style.visibility='';const tr=Math.round(p.x-26)+','+Math.round(p.y-26);if(g._tr!==tr){g._tr=tr;g.style.left=Math.round(p.x-26)+'px';g.style.top=Math.round(p.y-26)+'px'}}
  const host=q('#bfchips');if(!host)return;const hr=host.getBoundingClientRect();const busy=[];
  for(const l of document.querySelectorAll('.tl:not([hidden])')){const r=l.getBoundingClientRect();if(r.width)busy.push({l:r.left-hr.left,t:r.top-hr.top,r:r.right-hr.left,b:r.bottom-hr.top})}const nl=busy.length;
  const hit=(a,b)=>a.l<b.r+2&&a.r>b.l-2&&a.t<b.b+2&&a.b>b.t-2;const sr=q('#bfres');const top=Math.max(2,sr?Math.round(sr.getBoundingClientRect().bottom-hr.top+4):2);
  const gs=[...host.children].map(g=>({g,p:tilePt(+g.dataset.t)})).filter(o=>{if(!o.p){o.g.style.visibility='hidden';return false}o.g.style.visibility='';return true}).sort((a,b)=>a.p.y-b.p.y);
  for(const {g,p} of gs){const w=g.offsetWidth,h=g.offsetHeight;let x=Math.max(2,Math.min(p.w-w-2,p.x-w/2)),y=Math.max(top,Math.min(p.h-h-58,p.y+8));
    // slide down past whatever it would cover (other plates first, then labels); if it runs off the bottom, go above the place instead
    for(let n=0;n<12;n++){const me={l:x,t:y,r:x+w,b:y+h};const o=busy.find(b=>hit(me,b));if(!o)break;y=o.b+3;if(y+h>p.h-58){y=Math.max(top,p.y-h-30);break}}
    // G6 review: still on top of another plate or a label (top edge, crowded camp)? try going up, then sideways, before giving up
    for(let n=0;n<10;n++){const me={l:x,t:y,r:x+w,b:y+h};const o=busy.find(b=>hit(me,b));if(!o)break;const up=o.t-h-3;if(up>=top&&n<5){y=up;continue}const rx=o.r+3,lx=o.l-w-3;if(rx+w<=p.w-2){x=rx}else if(lx>=2){x=lx}else break}
    busy.push({l:x,t:y,r:x+w,b:y+h});const tr=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;if(g._tr!==tr){g._tr=tr;g.style.transform=tr}}
  // a label still under a plate after all that steps aside (the plate names the job there; the label comes back when the plate moves)
  const plates=busy.slice(nl);for(const l of document.querySelectorAll('#labels .tl:not([hidden])')){const r=l.getBoundingClientRect();const me={l:r.left-hr.left,t:r.top-hr.top,r:r.right-hr.left,b:r.bottom-hr.top};l.classList.toggle('lowc',!!r.width&&plates.some(b=>me.l<b.r&&me.r>b.l&&me.t<b.b&&me.b>b.t))}
  BF.ghostPlace()};
// ---------- floating scores, dice, results ----------
BF.pop=function(id,html,cls,delay,k){const ov=q('#bfov');if(!ov||!BF.on)return;const p=tilePt(id);if(!p)return;const el=document.createElement('div');el.className='bfpop '+(cls||'');el.style.setProperty('--d',(delay||0)+'ms');
  el.innerHTML=html;el.style.left='0px';el.style.top='0px';ov.appendChild(el);const w=el.offsetWidth;el.style.left=Math.round(Math.max(w/2+4,Math.min(p.w-w/2-4,p.x)))+'px';el.style.top=Math.round(Math.max(96,Math.min(p.h-72,p.y-(k||0)*38)))+'px';setTimeout(()=>el.remove(),2400+(delay||0))};
function deltas(A,B){const o=[];if(!A||!B)return o;
  for(const k of ['food','pfood','wood','fur']){const a=A.res[k],z=B.res[k];if(z!==a)o.push({t:`${z>a?'+':''}${z-a}${RICON[k]}`,w:`${{food:'Food',pfood:'Dry food',wood:'Wood',fur:'Fur'}[k]} ${z>a?'+':''}${z-a}`,c:z>a?'good':'bad',fly:RICON[k],up:z>a})}
  B.chars.forEach((c,j)=>{const x=A.chars[j];if(!x||(c.npc&&G.scen!=='stranded'))return;const d=lifeOf(B,c)-lifeOf(A,x);if(d)o.push({t:`<i style="background:${PCOL[c.i%6]}"></i>${d>0?'+':''}${d}♥`,w:`${E(c.nm)} ${d>0?'+':''}${d} life`,c:d>0?'good':'bad'})});
  if(A.fri&&B.fri&&A.fri.w!==B.fri.w){const d=A.fri.w-B.fri.w;o.push({t:`${d>0?'+':''}${d}♥`,c:d>0?'good':'bad'})}
  if(A.morale!==B.morale)o.push({t:`${B.morale>A.morale?'☺ +':'☹ '}${B.morale-A.morale}`,w:`Morale ${B.morale>A.morale?'+':''}${B.morale-A.morale}`,c:B.morale>A.morale?'good':'bad'});
  for(const [k,ic] of [['roof','☂'],['pal','🧱']])if(A.camp[k]!==B.camp[k])o.push({t:`${ic} ${B.camp[k]>A.camp[k]?'+':''}${B.camp[k]-A.camp[k]}`,w:`${k==='roof'?'Roof':'Palisade'} ${B.camp[k]>A.camp[k]?'+':''}${B.camp[k]-A.camp[k]}`,c:B.camp[k]>A.camp[k]?'good':'bad'});
  if(A.weapon!==B.weapon)o.push({t:`🗡 ${B.weapon>A.weapon?'+':''}${B.weapon-A.weapon}`,w:`Weapon ${B.weapon>A.weapon?'+':''}${B.weapon-A.weapon}`,c:B.weapon>A.weapon?'good':'bad'});
  const sa=withState(A,()=>hasShelter()),sz=withState(B,()=>hasShelter());if(sa!==sz)o.push({t:sz?'🏠 built':'🏠 lost',w:sz?'Shelter built':'Shelter lost',c:sz?'good':'bad'});
  if(G.scen==='marooned'&&A.sc&&B.sc&&A.sc.pile!==B.sc.pile)o.push({t:`🔥 +${B.sc.pile-A.sc.pile}`,w:`Pile +${B.sc.pile-A.sc.pile}`,c:'good'});
  if(G.scen==='hexed'&&A.sc&&B.sc&&A.sc.crosses.length!==B.sc.crosses.length)o.push({t:'✝ raised',c:'good'});
  const ea=A.map.filter(m=>m.tile!=null).length,ez=B.map.filter(m=>m.tile!=null).length;if(ez>ea)o.push({t:'🧭 new land',c:'good'});
  return o}
BF.beatFx=function(i){const b=UI.beats[i];if(!b||!G)return;const d=b.data||{};let arr=[],pos=null;
  try{const B=beatState(i);pos=d.pos!=null?d.pos:(B&&B.camp?B.camp.pos:G.camp.pos);
    if(b.kind==='daysum'){const x=daySumData(i);arr=x.A&&x.B?deltas(x.A,x.B).slice(0,6):[]}
    else if(!['intro','plan','dawn','go'].includes(b.kind)&&i>0)arr=deltas(beatState(i-1),B);
    let k=0,t=0;
    if(b.kind==='act'&&d.dice){const dd=d.dice;BF.pop(pos,'🎲','dice',0,k++);BF.pop(pos,dd.s?'✔':'✖',dd.s?'good big':'bad big',380,k++);if(dd.w)BF.pop(pos,'🩸','bad big',700,k++);if(dd.q)BF.pop(pos,'❓','big',1000,k++);t=1100}
    arr.forEach((x,j)=>{BF.pop(pos,x.t,x.c,t+j*240,k+j);if(x.fly)BF.fly(pos,x.fly,x.up,t+j*240+350)})}catch(e){console.error(e)}}
// a pending choice with dice shows the dice on the island too
BF.qFx=function(){const qq=G.q;if(!qq||qq.kind!=='dice'||!qq.dice)return;const dd=qq.dice;const pos=G.camp.pos;BF.pop(pos,'🎲','dice',0,0);BF.pop(pos,dd.s?'✔':'✖',dd.s?'good big':'bad big',380,1);if(dd.w)BF.pop(pos,'🩸','bad big',700,2);if(dd.q)BF.pop(pos,'❓','big',1000,3)};

// ---------- gains fly to the resource row, losses fly away ----------
BF.fly=function(id,icon,up,delay){if(!BF.on||!q('#bfov'))return;const p=tilePt(id),chip=q('#phchip');if(!p||!chip||!chip.getBoundingClientRect().width)return;const cr=chip.getBoundingClientRect();
  const sx=p.ox+p.x,sy=p.oy+p.y,cx=cr.left+cr.width/2,cy=cr.top+cr.height/2;const el=document.createElement('div');el.className='bffly';el.textContent=icon;document.body.appendChild(el);
  const a=up?[[sx,sy,.6,0],[sx,sy-26,1.3,1],[cx,cy,.7,.9]]:[[cx,cy,.7,0],[sx,sy,1.3,1],[sx+(sx<innerWidth/2?-90:90),sy-60,.5,0]];
  try{const an=el.animate(a.map(([x,y,s,o],j)=>({transform:`translate(${x-14}px,${y-14}px) scale(${s})`,opacity:o,offset:j/(a.length-1)})),{duration:1100,delay:delay||0,fill:'both',easing:'ease-in-out'});an.onfinish=()=>el.remove()}catch(e){setTimeout(()=>el.remove(),1500+(delay||0))}};
// ---------- weather on the camp: rain drops, snow, a flash ----------
BF.rain=function(pos,r,s,storm){const ov=q('#bfov');if(!ov||!BF.on)return;const p=tilePt(pos);if(!p)return;const n=Math.min(18,(r||0)*5+(s||0)*5+(storm?8:0));if(!n)return;
  const w=document.createElement('div');w.className='bfrain';w.style.left=Math.round(p.x-60)+'px';w.style.top=Math.round(p.y-120)+'px';
  let h='';for(let i=0;i<n;i++)h+=`<i style="left:${(i*37)%120}px;animation-delay:${(i*83)%600}ms">${s&&!r?'❄':'💧'}</i>`;w.innerHTML=h+(storm?'<b>⚡</b>':'');ov.appendChild(w);setTimeout(()=>w.remove(),2400)};
// ---------- the event / weather card flips onto the board ----------
const CARDICON={event:'🎴',threat:'⏳',adventure:'🧭',mystery:'❓',fight:'⚔️'};const TYICON={book:'📖',build:'🔨',explore:'🧭',gather:'🌿',wreck:'⚓'};
BF.cardClear=function(){const c=q('#bfcard');if(c)c.remove()};
// R8 review: own-plan games died sleeping outside while the summary said "on track": name the dangers for the coming night first
function dangerLines(st){if(!st)return [];return withState(st,()=>{const o=[];if(!hasShelter())o.push('No shelter: everyone takes a wound each night. Build one (2 wood).');
  const need=eatersNeed(),have=food();if(have<need)o.push(`Food ${have} of ${need} for tonight: the hungry take 2 wounds each.`);
  const low=living().filter(c=>!c.npc&&!c.out&&CHARS[c.k].die-c.w<=3);for(const c of low)o.push(`${c.nm} has ${CHARS[c.k].die-c.w} life left: rest heals 1.`);return o.slice(0,2)})}
// R3 review: the day's summary is one card and one tap: what changed, the goal's pace, and tomorrow's event card (already drawn)
BF.sumCard=function(i,ov){const b=UI.beats[i];let ch=[],pc=null,nx='';try{const x=daySumData(i);ch=x.A&&x.B?deltas(x.A,x.B).slice(0,7):[]}catch(e){}
  try{withView(()=>{pc=goalPace(b.data.round+1)})}catch(e){}
  try{for(let k=i+1;k<UI.beats.length;k++){const z=UI.beats[k];if(z.kind==='event'&&z.data&&z.data.card!=null&&CARD[z.data.card]&&!z.data.late){const c=CARD[z.data.card];const t=opsText(c.ev)||'';nx=`<span class="bfnx"><b>Tomorrow:</b> ${E(c.n)}${t?': '+E(w12(t.replace(/;.*$/,'')).replace(/[.\s]+$/,'')):''}${c.th?', then it stays as a threat':''}.</span>`;break}}}catch(e){}
  let dg=[];try{dg=dangerLines(UI.beats[i]&&beatState(i))}catch(e){}
  const el=document.createElement('div');el.id='bfcard';el.className='bfcard daysum';el.setAttribute('role','status');
  el.innerHTML=`<div class="in"><div class="fr"><span class="bftt">Day ${b.data.round} is over</span><span class="bfch">${ch.length?ch.map(x=>`<em class="${x.c}">${x.w||x.t}</em>`).join(' '):'<em>Nothing changed.</em>'}</span>${dg.map(t=>`<span class="bfpace">⚠ ${E(t)}</span>`).join('')}${pc&&pc.behind?`<span class="bfpace">⚠ ${E(pc.text)}</span>`:pc&&!dg.length?`<span class="bfok">🔥 Pile ${pc.pile}/15: on track for the rescue</span>`:pc?`<span class="bfok">🔥 Pile ${pc.pile}/15: on pace</span>`:''}${nx}</div></div>`;ov.appendChild(el)};
BF.card=function(i){BF.cardClear();const b=UI.beats[i];const ov=q('#bfov');if(!b||!ov||!BF.on)return;const k=b.kind;if(k==='daysum'){BF.sumCard(i,ov);return}if(!['event','threat','adventure','mystery','fight','weather'].includes(k))return;const d=b.data||{};
  let ic=CARDICON[k]||'🎴',cls=k,pos=G.camp.pos;
  try{if(k==='weather'){const w=(viewState()||G).lastWx;const r=w&&w.rain||0,s=w&&w.snow||0;ic=w&&w.storm?'⛈️':r?'🌧️'.repeat(Math.min(3,r)):s?'❄️'.repeat(Math.min(3,s)):'☀️';BF.rain(pos,r,s,w&&w.storm);if(w&&w.storm)cls+=' storm'}
    else if(d.card!=null&&CARD[d.card]){const c=CARD[d.card];const ti=c.icon&&TYICON[c.icon];ic=(CARDICON[k]||'🎴')+(ti?ti:'')}}catch(e){}
  const el=document.createElement('div');el.id='bfcard';el.className='bfcard '+cls;el.setAttribute('role','button');el.setAttribute('aria-label',w8(capFor(i))+' (hold for the full text)');
  let scene='';try{if(k==='weather'){const w=(viewState()||G).lastWx||{};scene=w.storm?'gale':w.snow?'winter':w.rain?'rain':'horizon'}
    else if(k==='threat'||k==='fight')scene='prowlers';else if(k==='mystery')scene='altar';
    else{const c=d.card!=null&&CARD[d.card];const t=c&&(c.icon||c.deck||c.type);scene={book:'whisper',build:'log',explore:'shroud',gather:'hunger',wreck:'undertow'}[t]||(k==='adventure'?'shroud':'undertow')}}catch(e){}
  el.innerHTML=`<div class="in">${scene&&!(k==='fight'&&d.beast)?`<img class="bfscene" src="media/camp-${scene}.webp" alt="">`:''}<div class="fr">${(k==='fight'&&d.beast&&artImg('beast',d.beast,'bfart'))||`<span class="bfic">${ic}</span>`}<span class="bftt">${E(w8(capFor(i)))}</span>${(()=>{try{const c=d.card!=null&&CARD[d.card];if(!c)return '';const t=(k==='event'?opsText(c.ev):k==='threat'&&c.th?opsText(c.th.rw||c.th.pen||[]):opsText(c.ops))||'';return t?`<span class="bfeff">${E(w12(t.replace(/;.*$/,'.')))}</span>`:''}catch(e){return ''}})()}</div></div>`;ov.appendChild(el);
  // hold to read the full card text; a quick tap moves on
  let t0=0,tm=null,held=false;const cancel=()=>{clearTimeout(tm);tm=null};
  el.addEventListener('pointerdown',e=>{e.stopPropagation();t0=Date.now();held=false;cancel();tm=setTimeout(()=>{held=true;BF.info()},480)});
  el.addEventListener('pointerup',e=>{e.stopPropagation();cancel();if(!held&&Date.now()-t0<480)BF.skipAuto()});el.addEventListener('pointercancel',cancel);el.addEventListener('contextmenu',e=>e.preventDefault())};
// ---------- the day resolves by itself (about 3 seconds); tap the island to speed up ----------
const AUTOMS={dawn:900,morning:1000,prod:900,go:700,act:1250,finds:1100,weather:1700,night:900,event:2000,threat:2000,adventure:2000,mystery:2000,fight:2000};
BF.autoOk=function(i){const b=UI.beats[i];if(!b||!AUTOMS[b.kind]||!BF.on||!G||G.over)return false;if(UI.auto||allAI())return false;if(i>=UI.beats.length-1&&humanQ())return false;if(typeof tutClaimed==='function'&&tutClaimed(i))return false;return true};
BF.skipAuto=function(){if(BF.autoT==null)return false;clearTimeout(BF.autoT);BF.autoT=null;if(PHO.st==='story'&&BF.autoOk(storyIdx()))storyNext();return true};
BF.autoSet=function(i){clearTimeout(BF.autoT);BF.autoT=null;if(!BF.autoOk(i))return;const b=UI.beats[i];let ms=AUTOMS[b.kind];if(b.kind==='go'){try{ms+=Math.min(6,Math.max(0,((beatState(i)||G).plan.acts||[]).length))*420}catch(e){}}
  const fire=()=>{BF.autoT=null;if(!BF.on||PHO.st!=='story'||storyIdx()!==i)return;if(UI.pause||GX.open||document.hidden||(typeof tutClaimed==='function'&&tutClaimed(i))){BF.autoT=setTimeout(fire,600);return}storyNext()};BF.autoT=setTimeout(fire,ms/(UI.speed||1))};
BF.autoTap=function(e){if(BF.autoT==null||!BF.on||PHO.st!=='story')return;const t=e.target;if(t.closest&&t.closest('#bfzoom,#phview,#bfcard,.gx-bar,.gx-drawer,#modal'))return;BF.skipAuto()};
// ---------- ghost finger: shows the first move, and is gone once you have made it ----------
function ghostSpot(){if(!BF.on||PHO.st!=='plan2')return null;const cur=curPawn();const hint=!!cur&&BF.hintId===cur.id;if(!hint&&(BF.ghostDone||G.round>1||G.plan.acts.length))return null;const rt=recTile(cur);if(!rt)return null;
  const pop=PHO.pop;if(pop){if(pop.k!=='tile'||pop.id!==rt.id)return null;const r=document.querySelector('#ppop [data-rec="1"]');if(!r)return null;const b=r.getBoundingClientRect();return {x:b.left+b.width-28,y:b.top+b.height/2,why:'row'}}
  const p=tilePt(rt.id);if(!p)return null;return {x:p.ox+p.x,y:p.oy+p.y,why:'tile',id:rt.id}}
BF.ghostSpot=ghostSpot;
// R8 review: ✨ is a suggestion, not an autoplay. It puts the planned pile wood on (that uses no pawn), then the finger shows where the
// next pawn would go and the ⭐ row in the pop-up; the player places every pawn.
// the wood ✨ puts on the pile today: what the day's whole plan put there (the advisor's step and the computer's), within today's room
function wantPile(){let n=advPileN();try{const r=UI.rec;if(r&&r.fresh&&r.round===G.round&&r.pileN>0){const room=SCEN.marooned.pileRoom();const free=G.res.wood-committed().wood-shelterReserve();n=Math.max(n,Math.min(r.pileN,room,free))}}catch(e){}return Math.max(0,n)}
// FLAG (off by default, unfinished): ✨ as a per-pawn hint instead of Plan it for me. On with ?hint=1 or localStorage swi_hint=1.
// Touch games that follow the hints still lose more often than the whole plan (piles 7-14 on day 12), see HANDOFF.
BF.hintOn=()=>{try{return /[?&]hint=1/.test(location.search)||localStorage.getItem('swi_hint')==='1'}catch(e){return false}};
BF.wantPile=()=>wantPile();
BF.hint=function(){let pre='';const castFree=()=>humanFree().some(p=>p.c!=null||recTile(p));
  // the pile goes last, like the advisor's own plan: only once every castaway pawn has its job (that wood is then really spare)
  if(!castFree()){try{const n=wantPile();if(n>0&&!pileAdd(n))pre=`🔥 Pile +${n}. `}catch(e){}}
  try{recPlan(true)}catch(e){}
  // the pawn to advise: the one in hand if it has a pick, else the first castaway pawn with one (helpers like the Dog are optional)
  let cur=curPawn();const free=humanFree();const cand=(cur?[cur]:[]).concat(free.filter(p=>p.c!=null),free.filter(p=>p.c==null));let rt=null;
  for(const p of cand){const r=recTile(p);if(r){cur=p;rt=r;break}}
  if(!rt&&cur&&cur.c==null){const f=free.find(p=>p.c!=null);if(f)cur=f}
  if(!cur||!free.some(p=>p.c!=null)&&!rt){BF.hintId=null;BF.say(pre+'Every pawn has a job. Start day');render();return}
  UI.sel=cur.id;const nm=pawnLabel(cur).split(' ')[0];
  if(!rt){BF.hintId=null;BF.say(pre+`No clear pick for ${nm}: any glow`);render();return}
  BF.hintId=cur.id;UI.sel=cur.id;const lb=String(rt.rec.label||TNAME[rt.rec.type]||rt.rec.type).replace(/\s*\(.*\)$/,'');BF.say(`${pre?pre.replace(/\.\s*$/,'')+' · ':''}✨ ${nm} → ${lb.replace(/\s*at place \d+/,'').replace(/^Threat: .*/,'Threat')}`,6000);render()};
BF.ghostPlace=function(){const gh=q('#bfgh');if(!gh)return;let s=null;try{s=ghostSpot()}catch(e){}if(!s){gh.hidden=true;BF.ghostAt=null;return}gh.hidden=false;gh.style.left=Math.round(s.x-14)+'px';gh.style.top=Math.round(s.y-12)+'px';BF.ghostAt=s};
// ---------- details drawer: the story text and the day's needs live here ----------
BF.info=function(){const d=GX.drawer('detd','Details',null);fillInfo();GX.show('detd');return d};
function fillInfo(){const d=document.getElementById('detd');if(!d)return;const b=d.querySelector('.gx-drawer-body');let h='';
  try{const i=storyIdx();if(i>=0){const el=q('#story .scene');if(el){const c=el.cloneNode(true);c.querySelectorAll('.sctl,.opts,.phead,.gtip,.qk,.qmore').forEach(x=>x.remove());h=`<div class="detscene">${c.innerHTML}</div>`}}
    else if(planOpen()){h=`<div class="detscene">${wzNeeds()}</div>`}else h='<p class="muted">Nothing to show right now.</p>'}catch(e){h='<p class="muted">Nothing to show right now.</p>'}
  if(b.dataset.h!==h){b.dataset.h=h;b.innerHTML=h}}
// ---------- the pop-up for a tapped place: only jobs this pawn can do ----------
BF.tilePop=function(id){const cur=curPawn();if(!cur)return null;const rec=recPlan().map[cur.id];const rows=legalRows(id,cur);const camp=id===G.camp.pos;let h='';
  if(camp&&G.scen==='marooned'){let room=0,why=null;try{room=SCEN.marooned.pileRoom();why=pileWhy(1)}catch(e){}if(room>0){const n=Math.max(1,Math.min(room,Math.max(0,G.res.wood-committed().wood)));const eat=Math.max(0,shelterReserve()-(G.res.wood-committed().wood-n));h+=`<button class="bfr pile ${why?'no':''} ${eat?'warn':''}" data-a="pilemax"><img class="ai" src="media/icon-res-wood.webp" alt=""><span class="t">🔥 Add wood to the signal pile (no pawn)${eat?'<br><small>⚠ uses your shelter wood</small>':''}</span><span class="b">+${n} wood</span></button>`}}
  const isRec=r=>rec&&rec.type===r.type&&JSON.stringify(rec.tgt)===JSON.stringify(r.tgt)&&(rec.alt||0)===(r.alt||0);
  // R8 review: the camp pop-up shows ~2 rows at 375; the ✨ pick (⭐) comes first so it is never below the fold
  const rowH=r=>{const key=encodeURIComponent(JSON.stringify({type:r.type,tgt:r.tgt,alt:r.alt}));const a=findActAny(r.type,r.tgt,r.alt);const k=(a?a.pw.length:0)+1;const n=actNeed({type:r.type,tgt:r.tgt,alt:r.alt,pw:[]});
      const badge=k<n.need?`needs ${n.need}`:(n.roll&&k<n.max)?'🎲':'✔';const cost=(()=>{try{const c=actCost({type:r.type,tgt:r.tgt,alt:r.alt,pw:[cur.id]});return Object.entries(c).filter(([x,v])=>v).map(([x,v])=>v+RICON[x]).join(' ')}catch(e){return ''}})();
      return `<button class="bfr ${isRec(r)?'rec':''} ${a?'has':''}" data-place="${key}" ${isRec(r)?'data-rec="1"':''}><img class="ai" src="media/icon-act-${['build','gather','explore','hunt','rest','camp','threat'].includes(r.type)?r.type:'camp'}.webp" alt=""><span class="t">${isRec(r)?'⭐ ':''}${E(r.title)}</span><span class="b">${cost?E(cost)+' · ':''}${badge}</span></button>`};
  h=rows.filter(isRec).map(rowH).join('')+h+rows.filter(r=>!isRec(r)).map(rowH).join('');
  if(!h)return null;const t=tileAt(id);return {title:`${pawnLabel(cur).split(' ')[0]} → place ${id+1} · ${t?t.terr:'not explored yet'}`,html:`<div class="bfrows">${h}</div>`,cls:'tile bf'}};
// a tap on a place while planning (the old tile handler has already selected it)
BF.tile=function(id){if(BF.on&&PHO.st==='story'){const o=posQ();if(o){const j=o.findIndex(x=>x.pos===id);if(j>=0){sfx('click');answer(j);return true}BF.say('Tap a glowing space');return true}return false}if(!BF.on||!(PHO.st==='plan2'||PHO.st==='plan'))return false;const cur=curPawn();
  if(!cur){BF.say('Tap a pawn to change its job');PHO.closePop(true);UI.tileSel=null;return true}
  const rows=legalRows(id,cur);const camp=id===G.camp.pos;const n=pawnLabel(cur).split(' ')[0];
  if(!rows.length&&!camp){const t=tileAt(id);BF.say(!t&&G.map[id].tile==null?(MAP[id].adj.some(p=>tileAt(p))?`${n} can't explore there`:'Too far to explore yet'):`Nothing for ${n} to do there`);PHO.closePop(true);UI.tileSel=null;return true}
  if(rows.length===1&&!camp){PHO.closePop(true);UI.tileSel=null;UI.sel=cur.id;const r=rows[0];doPlace(r.type,r.tgt,r.alt);return true}
  UI.sel=cur.id;PHO.openPop({k:'tile',id});return true};
// ---------- the sync: called at the end of every PHO.sync ----------
BF.pre=function(){const on=!!(PHO.on&&G&&typeof UI!=='undefined'&&UI.modal!=='start'&&!netOn());if(on!==BF.on){BF.on=on;R.classList.toggle('bf',on)}
  if(on){init();if(planOpen()&&!allAI()&&pstep()!==2)setPStep(2)}};
BF.post=function(st){init();const tray=q('#bf');if(!tray)return;try{msgCheck()}catch(e){}
  if(!BF.on){UI.pick=null;return}
  if(BF._st!==st){BF._st=st;BF.msg=null}
  // glowing places: where the pawn in hand can work
  if(st==='plan2'&&!UI.confirm){const cur=curPawn();UI.pick=legalTiles(cur);try{if(BF.pileNag!==G.round+':'+G.logN&&!humanFree().some(p=>p.c!=null||recTile(p))&&wantPile()>0){BF.pileNag=G.round+':'+G.logN;BF.say(`🔥 ✨ adds ${wantPile()} wood to the pile`,6000)}}catch(e){}}else if(st==='story'&&posQ())UI.pick=posQ().map(x=>x.pos);else UI.pick=null;
  { // the glow under each place the pawn in hand can work
    const gl=q('#bfglow');if(gl){const ids=UI.pick||[];const sig=ids.join(',');if(gl.dataset.s!==sig){gl.dataset.s=sig;gl.innerHTML=ids.map(i=>`<i class="bfgl" data-t="${i}"></i>`).join('');BF.place()}}}
  // the tray
  const h=trayHtml(st);if(tray.dataset.h!==h){tray.dataset.h=h;tray.innerHTML=h}
  tray.dataset.st=st;
  // the status line
  BF.paint();
  // chips on the island
  renderChips(st);
  // the first move is done
  if(st==='plan2'&&G.round===1&&G.plan.acts.length&&!BF.ghostDone){BF.ghostDone=true;try{localStorage.setItem('swi_ghost','1')}catch(e){}}
  if(G.round>1&&!BF.ghostDone){BF.ghostDone=true}
  // a new scene: the island shows what happened
  if(st==='story'){const i=storyIdx();if(i>=0){const b=UI.beats[i];const key=b.id+':'+(i>=UI.beats.length-1&&humanQ()?G.q.title:'');if(BF.fxId!==key){BF.fxId=key;BF.cardClear();BF.beatFx(i);BF.card(i);BF.autoSet(i);if(i>=UI.beats.length-1&&humanQ())BF.qFx()}}}else{BF.fxId=null;BF.cardClear();clearTimeout(BF.autoT);BF.autoT=null}
  // a 'tap a glowing space' question: the event card must not sit on top of the places (taps and eyes), so it steps aside
  {const cd=q('#bfcard');if(cd)cd.classList.toggle('bfq',st==='story'&&!!posQ())}
  // the pop-up sits on the half of the island away from the place
  const pp=q('#ppop'),bd=q('.gx-board');if(pp&&!pp.hidden&&PHO.pop&&PHO.pop.k==='tile'&&bd){const p=tilePt(PHO.pop.id);const br=bd.getBoundingClientRect();pp.classList.toggle('top',!!p&&p.y+p.oy-br.top>br.height*.5)}
  // the camp chip flashes when a number changes
  const chip=q('#phchip');if(chip){const v=chip.dataset.h;if(BF._chip!=null&&BF._chip!==v){chip.classList.remove('bump');void chip.offsetWidth;chip.classList.add('bump')}BF._chip=v}
  const bz=q('#bfzoom'),pv=q('#phview');if(bz&&pv)bz.hidden=pv.hidden;
  if(GX.open==='detd')fillInfo();
  // the game-over card sits over the lower part of the screen
  if(st==='over'&&bd){const r=bd.getBoundingClientRect();const top=Math.round(r.top+r.height*.28);R.style.setProperty('--dz-t',top+'px');R.style.setProperty('--dz-l','0px');R.style.setProperty('--dz-w',innerWidth+'px');R.style.setProperty('--dz-h',(innerHeight-top)+'px')}
  BF.ghostPlace()};
})();


// toggles are real switches: role=switch + aria-checked follow the state, and every tap leaves a visible trace (Reset tips says so)
(function(){const sw=()=>{try{const m=document.getElementById('musbtn'),s=document.getElementById('speedbtn'),n=document.getElementById('sndbtn');
  const set=(e,v)=>{if(!e)return;if(e.getAttribute('role')!=='switch')e.setAttribute('role','switch');if(e.getAttribute('aria-checked')!==String(v))e.setAttribute('aria-checked',String(v))};
  set(m,typeof musicOn==='function'?!!musicOn():false);set(s,!!(typeof UI!=='undefined'&&UI.quick));set(n,!(typeof UI!=='undefined'&&UI.mute));
  for(const t of document.querySelectorAll('.gxh-set [data-gxh=tips]')){if(t.getAttribute('role')!=='radio')t.setAttribute('role','radio');if(t.getAttribute('aria-checked')!==String(t.getAttribute('aria-pressed')==='true'))t.setAttribute('aria-checked',String(t.getAttribute('aria-pressed')==='true'))}}catch(e){}};
  setInterval(sw,500);
  document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('#musbtn,#speedbtn,#sndbtn,.gxh-set button');if(!t)return;
    t.setAttribute('data-tapn',String((+t.getAttribute('data-tapn')||0)+1));setTimeout(sw,80);
    if(t.dataset.gxh==='reset'&&!t.dataset.rs){t.dataset.rs=1;const o=t.textContent;t.textContent='Tips reset ✓';setTimeout(()=>{t.textContent=o;delete t.dataset.rs},1800)}},true)})();

// drag the real pawn onto a glowing place (owner 8 Nov: "drag the real piece, legal spots glow, it snaps with a vibrate tick").
// A plain tap still works as before; a drag picks the pawn up, the nearest glowing place lights up, and the drop opens that place.
(function(){let d=null,swallow=0;const buzz=()=>{try{navigator.vibrate&&navigator.vibrate(12)}catch(e){}};
  const near=(x,y)=>{let best=null,bd=60;for(const g of document.querySelectorAll('#bfglow .bfgl')){if(g.style.visibility==='hidden')continue;const r=g.getBoundingClientRect();const dx=r.left+r.width/2-x,dy=r.top+r.height/2-y,dd=Math.hypot(dx,dy);if(dd<bd){bd=dd;best=g}}return best};
  document.addEventListener('pointerdown',e=>{const b=e.target.closest&&e.target.closest('#bf .bfpw');if(!b||!BF.on||PHO.st!=='plan2')return;d={b,x:e.clientX,y:e.clientY,id:e.pointerId,on:false,el:null,hot:null}},true);
  document.addEventListener('pointermove',e=>{if(!d||e.pointerId!==d.id)return;if(!d.on){if(Math.hypot(e.clientX-d.x,e.clientY-d.y)<14)return;d.on=true;
      if(!d.b.classList.contains('on'))d.b.click();const el=d.b.cloneNode(true);el.removeAttribute('data-pawn');el.className+=' bfdrag';el.setAttribute('aria-hidden','true');document.body.appendChild(el);d.el=el;buzz()}
    d.el.style.transform=`translate(${e.clientX-28}px,${e.clientY-60}px) scale(1.15)`;const h=near(e.clientX,e.clientY);if(h!==d.hot){if(d.hot)d.hot.classList.remove('hot');if(h){h.classList.add('hot');buzz()}d.hot=h}},true);
  const up=e=>{if(!d||e.pointerId!==d.id)return;const dd=d;d=null;if(!dd.on)return;if(dd.el)dd.el.remove();swallow=Date.now()+400;const g=near(e.clientX,e.clientY);if(dd.hot)dd.hot.classList.remove('hot');
    if(g&&e.type==='pointerup'){const id=+g.dataset.t;buzz();g.classList.add('snap');setTimeout(()=>g.classList.remove('snap'),400);if(typeof on3DTile==='function')on3DTile(id);else PHO.tile(id)}};
  document.addEventListener('pointerup',up,true);document.addEventListener('pointercancel',up,true);
  document.addEventListener('click',e=>{if(Date.now()<swallow){swallow=0;e.stopPropagation();e.preventDefault()}},true);
  // a small tick when a job lands in the plan, however it was placed
  let n=-1;setInterval(()=>{try{if(!BF.on||!G||!G.plan)return;const k=G.plan.acts.reduce((s,a)=>s+a.pw.length,0);if(n>=0&&k>n)buzz();n=k}catch(e){}},200)})();

document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#bfchips .bfmore');if(!b)return;e.stopPropagation();const k=+b.dataset.exp;BF.exp=BF.exp===k?null:k;try{renderChips(PHO.st)}catch(err){}},true);
