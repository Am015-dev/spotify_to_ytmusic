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
const FINGER='<u class="rg"></u><span class="fg">👆</span>';
// ---------- one-time DOM: tray, overlay, zoom buttons, ghost finger ----------
function init(){if(BF.ready)return;BF.ready=true;const app=q('.gx-app'),board=q('.gx-board'),view=q('.gx-board .view');if(!app||!board)return;
  const tray=document.createElement('div');tray.id='bf';tray.setAttribute('role','region');tray.setAttribute('aria-label','Your move');app.appendChild(tray);
  const ov=document.createElement('div');ov.id='bfov';ov.innerHTML='<div id="bfglow"></div><div id="bfchips"></div>';(view||board).appendChild(ov);
  const pp=q('#ppop');if(pp)board.appendChild(pp);
  const pv=q('#phview');const bz=document.createElement('div');bz.id='bfzoom';board.appendChild(bz);if(pv)for(const b of [...pv.querySelectorAll('[data-ph=in],[data-ph=out],[data-ph=camp]')])bz.appendChild(b);
  if(pv&&!pv.querySelector('.bf-i')){const i=document.createElement('button');i.className='gx-ibtn bf-i';i.dataset.bf='info';i.setAttribute('aria-label','Details');i.innerHTML='<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.1"/></svg>';pv.appendChild(i)}
  const gh=document.createElement('div');gh.id='bfgh';gh.hidden=true;gh.setAttribute('aria-hidden','true');gh.innerHTML='<div class="f">'+FINGER+'</div>';document.body.appendChild(gh);
  board.addEventListener('pointerdown',e=>BF.autoTap(e),true);
  document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-bf]');if(b&&b.dataset.bf==='info'){BF.info();e.stopPropagation()}},true);
  // the labels loop moves the chips and the finger with the camera
  if(typeof placeLabels==='function'){const pl0=placeLabels;placeLabels=function(){pl0.apply(this,arguments);if(BF.on)BF.place()}}
  // short messages go to the status line, never into the hidden dock
  if(typeof toast==='function'){const t0=toast;toast=function(t,ms,keep){if(BF.on){const s=/^💡 Every pawn/.test(t||'')?'Plan ready. Check it, then start.':brief(t);BF.say(s,Math.min(ms||3200,3800))}else t0.apply(this,arguments)}}}
// ---------- geometry ----------
function tilePt(id){const ov=q('#bfov');if(!ov)return null;const r0=ov.getBoundingClientRect();
  if(typeof V3!=='undefined'&&V3.on&&V3.cam&&V3.r&&typeof MAP!=='undefined'&&MAP[id]){const p=hexPos(MAP[id].q,MAP[id].r);const v=new THREE.Vector3(p.x,HEXH,p.z);V3.cam.updateMatrixWorld();v.project(V3.cam);
    if(v.z<1){const c=V3.r.domElement.getBoundingClientRect();return {x:c.left+(v.x+1)/2*c.width-r0.left,y:c.top+(1-v.y)/2*c.height-r0.top,ox:r0.left,oy:r0.top,w:r0.width,h:r0.height}}}
  const g=q(`#map2d [data-tile="${id}"]`);if(g){const b=g.getBoundingClientRect();return {x:b.left+b.width/2-r0.left,y:b.top+b.height/2-r0.top,ox:r0.left,oy:r0.top,w:r0.width,h:r0.height}}return null}
BF.tilePt=tilePt;
// ---------- legal places for the pawn in hand ----------
function legalRows(id,cur){if(!cur)return [];let rows=[];try{rows=PHO.tileRows(id)}catch(e){}return rows.filter(r=>!r.why&&!placeWhy(cur.id,r.type,r.tgt,r.alt)&&(findAct(r.type,r.tgt)||canPay(r,cur)))}
function canPay(r,cur){try{const a={type:r.type,tgt:r.tgt,alt:r.alt||0,pw:[cur.id]};if(afford(a))return true;if(r.type==='build'&&['shelter','roof','pal'].includes(r.tgt.k)){for(const pay of ['fur','wood']){a.pay=pay;if(afford(a))return true}}return false}catch(e){return true}}
function legalTiles(cur){if(!cur)return [];const k=planSig()+'|'+cur.id+'|'+G.logN+'|'+JSON.stringify(G.res);if(BF._lk===k)return BF._lt;const out=[];for(const m of MAP)if(legalRows(m.id,cur).length)out.push(m.id);BF._lk=k;BF._lt=out;return out}
BF.legal=legalTiles;window.legalRowsDbg=id=>{const c=curPawn();return legalRows(id,c).map(r=>r.title)};
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
BF.say=function(t,ms){BF.msg={t:w8(t),until:Date.now()+(ms||3000)};BF.paint();clearTimeout(BF.msgT);BF.msgT=setTimeout(()=>{BF.msg=null;BF.paint()},(ms||3000)+30)};
BF.paint=function(){const lb=q('#phlabel');if(!lb||!BF.on)return;const s=BF.status();if(lb.textContent!==s)lb.textContent=s};
// ---------- the tray: your pawns and one big button ----------
function badActs(){const o=new Set();try{const pb=planProblems();for(const a of G.plan.acts){const l=actLabel(a);if(pb.some(m=>m.indexOf(l)===0))o.add(a.id)}}catch(e){}return o}
function tokHtml(p,cur,bad){const a=G.plan.acts.find(x=>x.pw.includes(p.id));const nm=pawnLabel(p);
  return `<button class="bfpw ${cur&&cur.id===p.id?'on':''} ${a?'set':''} ${a&&bad&&bad.has(a.id)?'bad':''}" style="--pc:${pcol(p.id)}" data-pawn="${p.id}" aria-label="${E(pawnNice(p))}${a?': '+E(actLabel(a))+' (tap to change)':', no job yet'}"><b>${E(nm.slice(0,2))}</b>${p.id.endsWith('_1')?'<sub>2</sub>':''}${a?`<u>${ACT_ICON[a.type]||'•'}</u>`:''}</button>`}
function trayHtml(st){
  if(st==='story'){const i=storyIdx();if(i<0)return '';const b=UI.beats[i];const last=i>=UI.beats.length-1;const qq=last&&humanQ()?G.q:null;
    if(qq&&posQ())return '';if(qq){const n=qq.opts.length;return `<div class="bf-opts n${n}">${qq.opts.map((o,j)=>`<button class="btn opt" data-ans="${j}">${E(o.l)}</button>`).join('')}</div>`}
    const nextL=b.kind==='daysum'&&!last?`Start day ${b.data.round+1} ▶`:last?(G.over?'See how it ended ▶':'Plan the day ▶'):'Continue ▶';
    return `<div class="bf-main"><button class="gx-ibtn bf-s ${UI.auto?'on':''}" data-a="auto" aria-pressed="${!!UI.auto}" aria-label="Play by itself">⏩</button><button class="btn go" data-a="next">${nextL}</button>${i<UI.beats.length-2?'<button class="gx-ibtn bf-s" data-a="skip" aria-label="Skip ahead">⏭</button>':''}</div>`}
  if(st==='plan'||st==='plan2'){const cur=curPawn();const pb=planProblems();
    if(UI.confirm&&planOpen())return `<div class="bf-main"><button class="gx-ibtn bf-s" data-a="suggest" aria-label="Plan it for me">💡</button><button class="btn ghost" data-a="goback">Go back</button><button class="btn go" data-a="go" data-force="1">Start anyway ▶</button></div>`;
    return `<div class="pawnrow bf-pw" aria-label="Your pawns">${(()=>{const bd=badActs();return wizPawns().map(p=>tokHtml(p,cur,bd)).join('')})()}</div><div class="bf-main"><button class="gx-ibtn bf-s" data-a="suggest" aria-label="Plan it for me">💡</button><button class="btn go ${pb.length?'dim':''}" data-a="go">Start day ▶</button></div>`}
  if(allAI()&&!G.over)return `<div class="bf-main"><button class="gx-ibtn bf-s" data-a="pause" aria-label="Pause">${UI.pause?'▶':'⏸'}</button><button class="gx-ibtn bf-s" data-a="speed" aria-label="Speed">⏩</button></div>`;
  return ''}
// ---------- chips on the island: the plan, then the day's jobs ----------
function actPos(a){let p=null;try{p=pawnSpot(a)}catch(e){}return p!=null&&MAP[p]?p:G.camp.pos}
function chipsFor(st){const out=[];
  if(st==='plan'||st==='plan2'){for(const a of G.plan.acts){if(!a.pw.length)continue;const n=actNeed(a);const k=a.pw.length;const risk=k<n.need?'warn':(n.roll&&k<n.max)?'dice':'sure';
    out.push({pos:actPos(a),a,risk,badge:risk==='warn'?`+${n.need-k}`:risk==='dice'?'🎲':'✔',rm:a.pw[a.pw.length-1],cur:UI.lastAct===a.id,done:false})}return out}
  if(st==='story'){const i=storyIdx();if(i<0)return out;const b=UI.beats[i];if(!['go','act','finds'].includes(b.kind))return out;const s=beatState(i);if(!s||!s.plan)return out;
    for(const a of s.plan.acts){if(!a.pw.length)continue;const here=b.kind==='act'&&b.data.id===a.id;out.push({pos:(()=>{let p=null;try{p=pawnSpot(a)}catch(e){}return p!=null&&MAP[p]?p:s.camp.pos})(),a,risk:'sure',badge:a.done&&!here?'✓':'',rm:null,cur:here,done:!!a.done&&!here})}return out}
  return out}
function renderChips(st){const host=q('#bfchips');if(!host)return;const cs=chipsFor(st);
  const sig=JSON.stringify(cs.map(c=>[c.pos,c.a.id,c.a.type,c.a.pw,c.risk,c.cur,c.done]))+st;if(host.dataset.s===sig)return;host.dataset.s=sig;
  const g={};cs.forEach((c,j)=>{(g[c.pos]=g[c.pos]||[]).push([c,j])});
  host.innerHTML=Object.keys(g).map(pos=>`<div class="bfg" data-t="${pos}" data-below="${+pos===G.camp.pos?1:0}">${g[pos].map(([c,j])=>{const dots=c.a.pw.map(pid=>`<i style="--pc:${pcol(pid)}"></i>`).join('');const inner=`<s>${ACT_ICON[c.a.type]||'•'}</s><span class="dots">${dots}</span>${c.badge?`<em>${c.badge}</em>`:''}`;
    const cls=`bfa ${c.risk} ${c.cur?'cur':''} ${c.done?'done':''}`;const lab=`${E(actLabel(c.a))}${c.rm?' (tap to take back)':''}`;
    return c.rm?`<button class="${cls}" style="--d:${j*(st==='story'?420:90)}ms" data-rm="${c.rm}" aria-label="${lab}">${inner}</button>`:`<div class="${cls}" style="--d:${j*(st==='story'?420:90)}ms" title="${lab}">${inner}</div>`}).join('')}</div>`).join('');
  BF.place()}
BF.place=function(){const gl=q('#bfglow');if(gl)for(const g of gl.children){const p=tilePt(+g.dataset.t);if(!p){g.style.visibility='hidden';continue}g.style.visibility='';const tr=Math.round(p.x-26)+','+Math.round(p.y-26);if(g._tr!==tr){g._tr=tr;g.style.left=Math.round(p.x-26)+'px';g.style.top=Math.round(p.y-26)+'px'}}
  const host=q('#bfchips');if(!host)return;for(const g of host.children){const p=tilePt(+g.dataset.t);if(!p){g.style.visibility='hidden';continue}g.style.visibility='';const w=g.offsetWidth,h=g.offsetHeight;
    const below=+g.dataset.t===(G&&G.camp?G.camp.pos:-1)&&g.children.length>0&&g.dataset.below==='1';let x=Math.max(2,Math.min(p.w-w-2,p.x-w/2)),y=below?Math.min(p.h-h-2,p.y+16):Math.max(2,Math.min(p.h-h-2,p.y-h-4));const tr=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;if(g._tr!==tr){g._tr=tr;g.style.transform=tr}}
  BF.ghostPlace()};
// ---------- floating scores, dice, results ----------
BF.pop=function(id,html,cls,delay,k){const ov=q('#bfov');if(!ov||!BF.on)return;const p=tilePt(id);if(!p)return;const el=document.createElement('div');el.className='bfpop '+(cls||'');el.style.setProperty('--d',(delay||0)+'ms');
  el.innerHTML=html;el.style.left='0px';el.style.top='0px';ov.appendChild(el);const w=el.offsetWidth;el.style.left=Math.round(Math.max(w/2+4,Math.min(p.w-w/2-4,p.x)))+'px';el.style.top=Math.round(Math.max(60,Math.min(p.h-12,p.y-(k||0)*38)))+'px';setTimeout(()=>el.remove(),2400+(delay||0))};
function deltas(A,B){const o=[];if(!A||!B)return o;
  for(const k of ['food','pfood','wood','fur']){const a=A.res[k],z=B.res[k];if(z!==a)o.push({t:`${z>a?'+':''}${z-a}${RICON[k]}`,c:z>a?'good':'bad',fly:RICON[k],up:z>a})}
  B.chars.forEach((c,j)=>{const x=A.chars[j];if(!x||(c.npc&&G.scen!=='stranded'))return;const d=lifeOf(B,c)-lifeOf(A,x);if(d)o.push({t:`<i style="background:${PCOL[c.i%6]}"></i>${d>0?'+':''}${d}♥`,c:d>0?'good':'bad'})});
  if(A.fri&&B.fri&&A.fri.w!==B.fri.w){const d=A.fri.w-B.fri.w;o.push({t:`${d>0?'+':''}${d}♥`,c:d>0?'good':'bad'})}
  if(A.morale!==B.morale)o.push({t:`${B.morale>A.morale?'☺ +':'☹ '}${B.morale-A.morale}`,c:B.morale>A.morale?'good':'bad'});
  for(const [k,ic] of [['roof','☂'],['pal','🧱']])if(A.camp[k]!==B.camp[k])o.push({t:`${ic} ${B.camp[k]>A.camp[k]?'+':''}${B.camp[k]-A.camp[k]}`,c:B.camp[k]>A.camp[k]?'good':'bad'});
  if(A.weapon!==B.weapon)o.push({t:`🗡 ${B.weapon>A.weapon?'+':''}${B.weapon-A.weapon}`,c:B.weapon>A.weapon?'good':'bad'});
  const sa=withState(A,()=>hasShelter()),sz=withState(B,()=>hasShelter());if(sa!==sz)o.push({t:sz?'🏠 built':'🏠 lost',c:sz?'good':'bad'});
  if(G.scen==='marooned'&&A.sc&&B.sc&&A.sc.pile!==B.sc.pile)o.push({t:`🔥 +${B.sc.pile-A.sc.pile}`,c:'good'});
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
BF.card=function(i){BF.cardClear();const b=UI.beats[i];const ov=q('#bfov');if(!b||!ov||!BF.on)return;const k=b.kind;if(!['event','threat','adventure','mystery','fight','weather'].includes(k))return;const d=b.data||{};
  let ic=CARDICON[k]||'🎴',cls=k,pos=G.camp.pos;
  try{if(k==='weather'){const w=(viewState()||G).lastWx;const r=w&&w.rain||0,s=w&&w.snow||0;ic=w&&w.storm?'⛈️':r?'🌧️'.repeat(Math.min(3,r)):s?'❄️'.repeat(Math.min(3,s)):'☀️';BF.rain(pos,r,s,w&&w.storm);if(w&&w.storm)cls+=' storm'}
    else if(d.card!=null&&CARD[d.card]){const c=CARD[d.card];const ti=c.icon&&TYICON[c.icon];ic=(CARDICON[k]||'🎴')+(ti?ti:'')}}catch(e){}
  const el=document.createElement('div');el.id='bfcard';el.className='bfcard '+cls;el.setAttribute('role','button');el.setAttribute('aria-label',w8(capFor(i))+' (hold for the full text)');
  el.innerHTML=`<div class="in"><div class="fr"><span class="bfic">${ic}</span><span class="bftt">${E(w8(capFor(i)))}</span></div></div>`;ov.appendChild(el);
  // hold to read the full card text; a quick tap moves on
  let t0=0,tm=null,held=false;const cancel=()=>{clearTimeout(tm);tm=null};
  el.addEventListener('pointerdown',e=>{e.stopPropagation();t0=Date.now();held=false;cancel();tm=setTimeout(()=>{held=true;BF.info()},480)});
  el.addEventListener('pointerup',e=>{e.stopPropagation();cancel();if(!held&&Date.now()-t0<480)BF.skipAuto()});el.addEventListener('pointercancel',cancel);el.addEventListener('contextmenu',e=>e.preventDefault())};
// ---------- the day resolves by itself (about 3 seconds); tap the island to speed up ----------
const AUTOMS={dawn:900,morning:1000,prod:900,go:700,act:1250,finds:1100,weather:1700,night:900,event:2000,threat:2000,adventure:2000,mystery:2000,fight:2000};
BF.autoOk=function(i){const b=UI.beats[i];if(!b||!AUTOMS[b.kind]||!BF.on||!G||G.over)return false;if(UI.auto||allAI())return false;if(i>=UI.beats.length-1&&humanQ())return false;return true};
BF.skipAuto=function(){if(BF.autoT==null)return false;clearTimeout(BF.autoT);BF.autoT=null;if(PHO.st==='story'&&BF.autoOk(storyIdx()))storyNext();return true};
BF.autoSet=function(i){clearTimeout(BF.autoT);BF.autoT=null;if(!BF.autoOk(i))return;const b=UI.beats[i];let ms=AUTOMS[b.kind];if(b.kind==='go'){try{ms+=Math.min(6,Math.max(0,((beatState(i)||G).plan.acts||[]).length))*420}catch(e){}}
  const fire=()=>{BF.autoT=null;if(!BF.on||PHO.st!=='story'||storyIdx()!==i)return;if(UI.pause||GX.open||document.hidden){BF.autoT=setTimeout(fire,600);return}storyNext()};BF.autoT=setTimeout(fire,ms/(UI.speed||1))};
BF.autoTap=function(e){if(BF.autoT==null||!BF.on||PHO.st!=='story')return;const t=e.target;if(t.closest&&t.closest('#bfzoom,#phview,#bfcard,.gx-bar,.gx-drawer,#modal'))return;BF.skipAuto()};
// ---------- ghost finger: shows the first move, and is gone once you have made it ----------
function ghostSpot(){if(BF.ghostDone||!BF.on||PHO.st!=='plan2'||G.round>1||G.plan.acts.length)return null;const cur=curPawn();const rt=recTile(cur);if(!rt)return null;
  const pop=PHO.pop;if(pop){if(pop.k!=='tile'||pop.id!==rt.id)return null;const r=document.querySelector('#ppop [data-rec="1"]');if(!r)return null;const b=r.getBoundingClientRect();return {x:b.left+b.width-28,y:b.top+b.height/2,why:'row'}}
  const p=tilePt(rt.id);if(!p)return null;return {x:p.ox+p.x,y:p.oy+p.y,why:'tile',id:rt.id}}
BF.ghostSpot=ghostSpot;
BF.ghostPlace=function(){const gh=q('#bfgh');if(!gh)return;let s=null;try{s=ghostSpot()}catch(e){}if(!s){gh.hidden=true;BF.ghostAt=null;return}gh.hidden=false;gh.style.left=Math.round(s.x-14)+'px';gh.style.top=Math.round(s.y-12)+'px';BF.ghostAt=s};
// ---------- details drawer: the story text and the day's needs live here ----------
BF.info=function(){const d=GX.drawer('detd','Details',null);fillInfo();GX.show('detd');return d};
function fillInfo(){const d=document.getElementById('detd');if(!d)return;const b=d.querySelector('.gx-drawer-body');let h='';
  try{const i=storyIdx();if(i>=0){const el=q('#story .scene');if(el){const c=el.cloneNode(true);c.querySelectorAll('.sctl,.opts,.phead,.gtip,.qk,.qmore').forEach(x=>x.remove());h=`<div class="detscene">${c.innerHTML}</div>`}}
    else if(planOpen()){h=`<div class="detscene">${goalCard()}${wzNeeds()}</div>`}else h='<p class="muted">Nothing to show right now.</p>'}catch(e){h='<p class="muted">Nothing to show right now.</p>'}
  if(b.dataset.h!==h){b.dataset.h=h;b.innerHTML=h}}
// ---------- the pop-up for a tapped place: only jobs this pawn can do ----------
BF.tilePop=function(id){const cur=curPawn();if(!cur)return null;const rec=recPlan().map[cur.id];const rows=legalRows(id,cur);const camp=id===G.camp.pos;let h='';
  if(camp&&G.scen==='marooned'){let room=0,why=null;try{room=SCEN.marooned.pileRoom();why=pileWhy(1)}catch(e){}if(room>0)h+=`<button class="bfr pile ${why?'no':''}" data-a="pilemax"><span class="t">🔥 Add wood to the signal pile</span><span class="b">+${Math.max(1,Math.min(room,Math.max(0,G.res.wood-committed().wood)))}</span></button>`}
  const isRec=r=>rec&&rec.type===r.type&&JSON.stringify(rec.tgt)===JSON.stringify(r.tgt)&&(rec.alt||0)===(r.alt||0);
  h+=rows.map(r=>{const key=encodeURIComponent(JSON.stringify({type:r.type,tgt:r.tgt,alt:r.alt}));const a=findActAny(r.type,r.tgt,r.alt);const k=(a?a.pw.length:0)+1;const n=actNeed({type:r.type,tgt:r.tgt,alt:r.alt,pw:[]});
      const badge=k<n.need?`needs ${n.need}`:(n.roll&&k<n.max)?'🎲':'✔';const cost=(()=>{try{const c=actCost({type:r.type,tgt:r.tgt,alt:r.alt,pw:[cur.id]});return Object.entries(c).filter(([x,v])=>v).map(([x,v])=>v+RICON[x]).join(' ')}catch(e){return ''}})();
      return `<button class="bfr ${isRec(r)?'rec':''} ${a?'has':''}" data-place="${key}" ${isRec(r)?'data-rec="1"':''}><span class="t">${isRec(r)?'⭐ ':''}${E(r.title)}</span><span class="b">${cost?E(cost)+' · ':''}${badge}</span></button>`}).join('');
  if(!h)return null;const t=tileAt(id);return {title:`${pawnLabel(cur).split(' ')[0]} → place ${id+1}${t?' · '+t.terr:''}`,html:`<div class="bfrows">${h}</div>`,cls:'tile bf'}};
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
  if(st==='plan2'&&!UI.confirm){const cur=curPawn();UI.pick=legalTiles(cur)}else if(st==='story'&&posQ())UI.pick=posQ().map(x=>x.pos);else UI.pick=null;
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
