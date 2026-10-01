// ===================== part 6: board overlay (labels, route, markers), advisor, sunk cards, monster-phase card =====================
// ---------- the overlay: HTML/SVG drawn over the board, positioned from the kit's own camera (3D) or the 2D chart ----------
const OV={items:[],sig:'',descs:[],raf:0,proj:null,pk:''};
const sqW=(c,r)=>[c-2.5,r-2.5];
function ovMakeProj(){try{const bd=$('#board');if(!bd)return null;const B=bd.getBoundingClientRect();if(!B.width)return null;
  const c3=$('#c3');
  if(c3&&!c3.hidden){const K=TWKit._K;if(!K||!K.on||!K.cam)return null;const hr=c3.getBoundingClientRect();if(!hr.width)return null;const v=new THREE.Vector3();
    return (x,y,z)=>{v.set(x,y,z).project(K.cam);if(v.z>1)return null;return [hr.left-B.left+(v.x+1)/2*hr.width,hr.top-B.top+(1-v.y)/2*hr.height]}}
  const fb=$('#fb');const svg=fb&&fb.querySelector('svg');if(!svg||!svg.viewBox||!svg.viewBox.baseVal)return null;
  const sr=svg.getBoundingClientRect(),vb=svg.viewBox.baseVal;if(!sr.width||!vb.width)return null;
  const sc=Math.min(sr.width/vb.width,sr.height/vb.height);const ox=sr.left-B.left+(sr.width-vb.width*sc)/2-vb.x*sc,oy=sr.top-B.top+(sr.height-vb.height*sc)/2-vb.y*sc;
  return (x,y,z)=>[ox+x*sc,oy+z*sc-(y||0)*sc*.25]}catch(e){return null}}
function bez(a,c,b,n){const o=[];for(let i=0;i<=n;i++){const t=i/n,u=1-t;o.push([u*u*a[0]+2*u*t*c[0]+t*t*b[0],u*u*a[1]+2*u*t*c[1]+t*t*b[1]])}return o}
function pw(c,r,p){const w=TWKit.portWorld(c,r,p);return [w[0],w[1]]}
// the actual route of a placement, from the engine's own path (analyse -> traceSteps), as world points on the board plane
function routeDesc(A,S){if(!A||!A.steps||!A.steps.length)return null;let pts=[];
  for(const st of A.steps){const a=pw(st.c,st.r,st.from),b=pw(st.c,st.r,st.to),c=sqW(st.c,st.r);const seg=bez(a,c,b,8);if(pts.length)seg.shift();pts.push(...seg)}
  const last=A.steps[A.steps.length-1],dd=DIR[last.to>>1];let stop,label;
  if(A.st==='ok'&&A.end){stop=pw(A.end[0],A.end[1],MATE[last.to]);label=`Stop: column ${A.end[0]+1}, row ${A.end[1]+1}`}
  else if(A.st==='edge'){const b=pw(last.c,last.r,last.to);stop=[b[0]+dd[0]*.4,b[1]+dd[1]*.4];label='Off the edge'}
  else{stop=sqW(last.c+dd[0],last.r+dd[1]);label=A.st==='mon'?`Hits ${levName(A.mon)}`:'Rift Gate'}
  pts.push(stop);
  if(A.coll)label='Collision';
  return {pts,stop,label,bad:!!A.bad,start:pts[0]}}
// start marks with a readable side: "3 L" / "3 R" on the top and bottom edges, "3 U" / "3 D" on the left and right edges
function startInfo(d){const mv=validMoves(d).filter(m=>m.a==='start');const by={};
  for(const m of mv){const pe=TWKit.portEdge(m.x,m.y,m.e);if(!pe)continue;const w=pw(m.x,m.y,m.e);const k=pe.edge+pe.index;(by[k]=by[k]||[]).push({m,edge:pe.edge,idx:pe.index,w})}
  const out=[];for(const k in by){const l=by[k];const hor=l[0].edge==='top'||l[0].edge==='bottom';l.sort((a,b)=>hor?a.w[0]-b.w[0]:a.w[1]-b.w[1]);
    l.forEach((o,i)=>{o.side=hor?'LR'[i]:'UD'[i];o.sideWord=hor?['left','right'][i]:['upper','lower'][i];o.lab=o.idx+o.side;out.push(o)})}
  return out}
function startAdvice(K,d,info){let m=null;try{m=aiMove(d,'hard')}catch(e){}if(!m||m.a!=='start')return null;
  const o=info.find(x=>x.m.x===m.x&&x.m.y===m.y&&x.m.e===m.e);if(!o)return null;const dm=distMon(K,[m.x,m.y]);
  return {o,why:`${o.edge[0].toUpperCase()+o.edge.slice(1)} ${o.idx}, ${o.sideWord} mark: ${(m.x===0||m.x===BW-1)&&(m.y===0||m.y===BW-1)?'a corner square, but the best left':'away from the corners, so you have room to turn'}${K.mons.some(q=>q.k==='L')?`; the nearest leviathan is ${dm} square${dm===1?'':'s'} away`:''}.`}}
const levNm=id=>levName(id);
function monHits(mo,sqs){const f=[];if(!mo||mo.k!=='L')return f;for(let die=1;die<=5;die++){const a=LEV[mo.id].arr[die-1];if(a==='R')continue;const dd=DIR[(DIRN[a]+mo.r)%4],tx=mo.x+dd[0],ty=mo.y+dd[1];if(sqs.some(q=>q&&q[0]===tx&&q[1]===ty))f.push(die)}return f}
// ONE line per leviathan that matters (replaces the two duplicate warnings)
function threatHTML(K,seat,m,A){const S=K.ships[m?m.s:seat];if(!S||S.x==null&&!S.on)return '';let ids,sqs;
  if(A&&A.st==='ok'){ids=A.mons;sqs=[A.end];if(A.on)sqs.push(A.on)}else if(A)return '';else{ids=adjMons(K,S);sqs=[[S.x,S.y]];if(S.on)sqs.push(S.on)}
  const when=A?'where you stop':'you';
  return ids.map(id=>{const mo=K.mons.find(q=>q.id===id&&q.k==='L');if(!mo)return '';const f=monHits(mo,sqs);
    const pc=Math.round(16/36*f.length/6*100);
    return `<span class="warn-l thr" data-mon="${id}">${esc(levName(id))} is next to ${when}. `+(f.length?`If the leviathans wake (dice total 6 to 8) and it rolls ${f.join(' or ')}, it moves onto you and you sink (about ${pc}% each turn).`:`It cannot move onto you right now (its arrows point elsewhere).`)+`</span>`}).filter(Boolean).join('<br>')}
// ---------- the Safest-move advisor: the hard computer's own evaluation (ai.js: scoreMove, hypo, safeOpts, drawSafe, mcRisk) plus a 2-turn look-ahead ----------
// chance (over the tile I will draw) that I can still sail safely this coming turn AND the one after, ignoring leviathan moves: the "am I being trapped" look-ahead
function surv2(B,seat,after){const S=B.ships[seat];if(!S||!S.alive||S.x==null)return .5;let tot=0;
  for(let t=0;t<35;t++){const hand=after.concat([t]);let best=0;
    for(let ci=0;ci<hand.length&&best<1;ci++){const c=hand[ci];if(!isCur(c))continue;
      for(let r=0;r<4&&best<1;r++){const sim=simPlace(B,S.x,S.y,c,r);const o=sim.res[seat];if(!o||o.st==='edge'||o.st==='mon'||sim.coll.includes(seat))continue;
        if(o.st==='gate'){best=Math.max(best,.5);continue}
        const h2=hypo(B,S,c,r),S2=h2.B.ships[seat];if(!S2||!S2.alive||S2.x==null)continue;
        const p=safeOpts(h2.B,S2,hand.filter((x,i)=>i!==ci))>0?1:drawSafe(h2.B,S2);if(p>best)best=p}}
    tot+=best}
  return tot/35}
function advise(K,seat,o){o=o||{};const L=Object.assign({},AILV.hard,{look:o.look!=null?o.look:0});const W2=o.w2!=null?o.w2:700;CUR_RNG=mkRng((kHash(K)^0x5bd1e995)>>>0);MCC={};
  const mv=genMoves(K,seat);const out=[];const hand=K.hands[seat];
  for(const m of mv){let sc=scoreMove(K,seat,m,L),info={tier:3};
    if(m.a==='place'){const S=K.ships[m.s],tile=hand[m.t];const hy=hypo(K,S,tile,m.r);info.sinks=hy.dead.includes(seat);info.hurts=hy.dead.some(i=>i!==seat&&sameTeam(K,i,seat));
      if(info.sinks)info.tier=0;
      else{const S2=hy.B.ships[seat];const after=hand.filter((c,i)=>i!==m.t);
        if(S2&&S2.alive&&S2.x!=null){info.n=safeOpts(hy.B,S2,after);info.fd=drawSafe(hy.B,S2);info.pl=info.n>0?0:1-info.fd;info.s2=surv2(hy.B,seat,after);
          sc+=W2*(info.s2-1);info.trap2=info.s2<.35;
          info.tier=info.pl>=.999||info.s2<.02?1:(info.trap2?2:3)}
        else if(S2&&S2.alive)info.tier=2}
      if(info.hurts)sc-=400}
    out.push({m,sc,info})}
  out.sort((a,b)=>b.info.tier-a.info.tier||b.sc-a.sc);return out}
function recMove(d){const key=G.logN+':'+d+':'+(G.q?1:0);if(UI.recKey===key&&UI.recA)return UI.recM;let a=null;try{a=advise(knowledge(d),d)}catch(e){console.error(e)}
  UI.recKey=key;UI.recA=a;UI.recM=a&&a.length?a[0].m:null;return UI.recM}
function recHTML(K,d,pl,full){const m=recMove(d);if(!m)return '';const a=UI.recA||[];const me=a.find(x=>x.m===m)||a[0];let why='',lab='';
  if(m.a==='place'){const A=analyse(K,d,m);const nb=a.filter(x=>x.m.a==='place'&&x.info.tier===0).length,nt=a.filter(x=>x.m.a==='place'&&(x.info.tier===1||x.info.tier===2)).length;
    lab=`tile ${m.t+1} turned ${m.r*90} degrees`;
    why=A.st==='ok'?`Your junk sails ${A.n} current${A.n>1?'s':''} and stops at column ${A.end[0]+1}, row ${A.end[1]+1}`+(K.mons.some(q=>q.k==='L')?`, ${distMon(K,A.end)} square${distMon(K,A.end)===1?'':'s'} from the nearest leviathan`:'')+'.':A.st==='gate'?'It leads into the Rift Gate.':'Every placement is risky; this one is the least bad.';
    const n=me.info.n;why+=n!=null?(n>0?` Next turn you would still have ${n} safe placement${n>1?'s':''}.`:' Next turn you would depend on the tile you draw.'):'';
    why+=` Right now ${nb} of ${pl.length} placements would sink you`+(nt?`, and ${nt} more would leave you trapped within two turns.`:'.')}
  else if(m.a==='cannon'){lab=`fire the Deck Cannon at ${levName(m.m)}`;why='It removes a leviathan that is next to you.'}
  else if(m.a==='gate'){lab='play the Rift Gate';why='It moves you away from danger.'}else{lab='pass';why='You have nothing to play.'}
  return `<div class="rec"><b>Safest move:</b> ${lab}.${full?` <span class="tiny">${why}</span>`:''}${m.a==='place'?` <button class="btn small" data-a="sugg">Show me the safest move</button>`:''}</div>`}
// ---------- why a junk sank ----------
function causeOf(why){const w=String(why||'');let m;
  if(/off the edge|sailing off/.test(w))return {k:'edge',t:'its wake ran off the edge of the chart. A current that points out of the 6 by 6 sea sinks the junk riding it.'};
  if(/collided/.test(w))return {k:'collision',t:'two junks ended on the same wake heading the same way, so both went down together (a head-on collision).'};
  if(/Maelstrom/.test(w))return {k:'maelstrom',t:'the Maelstrom, the whirlpool, moved onto its square and swallowed it.'};
  if(/Rogue Wave|capsized/.test(w)){const ww=G&&G.wave;return {k:'wave',t:`the Rogue Wave caught it: it was in the wave's band and its capsize roll was too low${ww?` (the wave is on ${(ww.r&1)?'column '+(ww.x+1):'row '+(ww.y+1)}, strength ${waveStr()})`:''}.`}}
  if(m=/blocked in by (.+)$/.exec(w))return {k:'block',t:`${m[1]} sat on the square in front of it when its turn began and nothing could save it.`};
  if(m=/ran into (.+)$/.exec(w))return {k:'mon',t:`its wake ended in the square of ${m[1]}.`};
  if(m=/crushed by (.+)$/.exec(w))return {k:'crush',t:`${m[1]} swam onto the square it was on (or its tile) and crushed it.`};
  if(/rift/.test(w))return {k:'rift',t:'the Rift Gate could not find it a safe landing.'};
  return {k:'other',t:w+'.'}}
const youSeat=()=>{try{return viewSeat()}catch(e){return -1}};
function sunkAdd(e){if(!G||UI.sunkSeen&&UI.sunkSeen[e.key])return;(UI.sunkSeen=UI.sunkSeen||{})[e.key]=1;const c=causeOf(e.why);
  let card=c.k==='collision'?UI.sunk.find(x=>x.k==='collision'&&x.key0===e.key0):null;
  if(card){if(!card.seats.includes(e.seat))card.seats.push(e.seat)}
  else{card={id:Math.random().toString(36).slice(2),seats:[e.seat],k:c.k,t:c.t,key0:e.key0,cur:e.cur,actor:e.actor};UI.sunk.push(card);if(UI.sunk.length>4)UI.sunk.shift()}
  if(e.at)UI.marks=(UI.marks||[]).filter(x=>x.seat!==e.seat).concat([{seat:e.seat,at:e.at,id:card.id}]);
  if(!humans().length){const id=card.id;setTimeout(()=>{UI.sunk=UI.sunk.filter(x=>x.id!==id);UI.marks=(UI.marks||[]).filter(x=>x.id!==id);renderCards();ovUpdate()},9000/(UI.speed||1))}
  renderCards();ovUpdate()}
function sunkNames(seats){const me=youSeat();const l=seats.map(i=>i===me?'Your junk':nm(i)+"'s junk");return l.length>1?l.slice(0,-1).join(', ')+' and '+l[l.length-1]:l[0]}
function renderCards(){const el=$('#cards');if(!el)return;if(!G||!UI.sunk||!UI.sunk.length){el.innerHTML='';el.hidden=true;return}el.hidden=false;
  const me=youSeat();
  el.innerHTML=UI.sunk.map(c=>{const mine=c.seats.includes(me);const who=sunkNames(c.seats);const dots=c.seats.map(dot).join('');
    return `<div class="prompt sunk${mine?' mine':''}" data-sunk="${c.seats.join(',')}"><h4><span class="x">&#10006;</span> Sunk! ${dots} ${esc(who)}</h4><p><b>Because</b> ${esc(c.t)}</p><p class="tiny">${c.k==='collision'?'Both junks are out.':''} It happened during ${esc(nm(c.cur))}'s turn${c.actor!=null&&c.actor!==c.cur?` (${esc(nm(c.actor))} answered)`:''}. The red mark on the board shows where.${mine?' You are out, but you can watch the rest of the game.':''}</p><button class="btn small" data-a="sunkok" data-id="${c.id}">Got it</button></div>`}).join('')}
function sunkClear(){UI.sunk=[];UI.marks=[];UI.sunkSeen={};renderCards()}
// ---------- the monster-phase card ----------
// builds the card's lines from the recorded events: roll, then one line per leviathan move / rise / swim-off, in the order they happen
function mphBuild(evs){let mp=null;
  for(let i=0;i<evs.length;i++){const e=evs[i];
    if(e.t==='dice'){const t=e.d[0]+e.d[1];mp={d:e.d.slice(),total:t,wake:t>=6&&t<=8,lines:[],seat:e.seat,shown:0}}
    else if(mp&&e.t==='monact'){const pr=evs[i-1];const nmx=levName(e.id);let txt=pr&&pr.t==='log'&&pr.text.indexOf(nmx)===0?pr.text:'';if(txt)pr.skip=true;
      txt=txt?txt.slice(nmx.length+1).replace(/\.$/,''):(e.die===6?'stays put':'moves');
      e.ln=mp.lines.length;mp.lines.push({id:e.id,txt:`rolled ${e.die}: ${txt}`,nm:nmx})}
    else if(mp&&e.t==='arrive'&&(e.spawn||e.k==='M')){const pr=evs[i-1];const txt=pr&&pr.t==='log'?pr.text:(e.k==='M'?'The Maelstrom moves':levName(e.id)+' rises');if(pr&&pr.t==='log')pr.skip=true;
      e.ln=mp.lines.length;mp.lines.push({id:e.id,txt:txt.replace(/\.$/,''),nm:'',plain:1,maelstrom:e.k==='M'})}
    else if(mp&&e.t==='log'&&/^The Maelstrom (churns|drains)/.test(e.text)){e.skip=true;mp.lines.push({id:-1,txt:e.text.replace(/\.$/,''),nm:'',plain:1});e.ln=mp.lines.length-1}}
  return mp}
function mphHTML(){const mp=UI.mph;if(!mp||G&&G.over&&!UI.busy)return '';
  const sc=[];for(let n=2;n<=12;n++)sc.push(`<span class="${n>=6&&n<=8?'w':''}${!mp.roll&&n===mp.total?' cur':''}">${n}</span>`);
  const verdict=mp.roll?'Rolling...':mp.wake?'6, 7 or 8: the leviathans stir!':'Not 6, 7 or 8: calm, nothing moves.';
  const shown=mp.lines.slice(0,mp.shown);
  return `<div class="mph ${mp.wake&&!mp.roll?'wake':''}"><div class="mh"><b>Monster wake roll</b> <span class="tiny">two dice added together${G&&G.seats[mp.seat]?' ('+esc(nm(mp.seat))+' rolled)':''}</span></div>
  <div class="dice"><span class="die g${mp.roll?' roll':''}">${mp.roll?'?':mp.d[0]}</span><span class="die b${mp.roll?' roll':''}">${mp.roll?'?':mp.d[1]}</span><span class="tot">${mp.roll?'':'= '+mp.total}</span><span class="verdict">${verdict}</span></div>
  <div class="scale" aria-label="Leviathans wake on a total of 6, 7 or 8">${sc.join('')}</div>
  ${shown.length?`<ol class="mlines">${shown.map((l,i)=>`<li class="${i===shown.length-1&&UI.mphLive?'now':''}">${l.plain?'':`<b data-mon="${l.id}">${esc(l.nm)}</b> `}${esc(l.txt)}</li>`).join('')}</ol>`:''}</div>`}
// ---------- the overlay descriptors ----------
function ovUpdate(){if(!G||!UI.started||!kitOk()){ovApply([]);return}const D=[];const busy=UI.busy;const me=youSeat();const d=sideToAct();const myTurn=!busy&&!G.over&&d>=0&&G.seats[d].human&&!mustPass(d);
  const near=new Set();let dq=null;if(G.q&&G.q.kind==='doom'&&G.q.ctx&&G.q.ctx.cause&&G.q.ctx.cause.id!=null&&G.q.who===me)dq=G.q.ctx.cause.id;if(myTurn&&G.phase==='play'){const S=G.ships[d];if(S&&S.x!=null)for(const id of adjMons(G,S))near.add(id)}
  for(const k in KS.mons){const a=k.split(',').map(Number),id=+KS.mons[k].split(':')[0];D.push({k:'tag',id:'m'+id,wx:a[0]-2.5,wy:.95,wz:a[1]-2.5,t:levName(id),cls:'mon'+(UI.hiMon===id||UI.hov===id||dq===id?' hi':'')+(near.has(id)?' near':''),mon:id})}
  for(const k in KS.mael){const a=k.split(',').map(Number);D.push({k:'tag',id:'ma'+k,wx:a[0]-2.5,wy:.5,wz:a[1]-2.5,t:'Maelstrom',cls:'piece mael'})}
  for(const k in KS.gates){const a=k.split(',').map(Number);D.push({k:'tag',id:'g'+k,wx:a[0]-2.5,wy:.55,wz:a[1]-2.5,t:'Rift Gate',cls:'piece gate'})}
  if(KS.wave&&G.wave){const w=G.wave;D.push({k:'tag',id:'wv',wx:w.x-2.5,wy:.55,wz:w.y-2.5,t:`Rogue Wave: ${(w.r&1)?'column '+(w.x+1):'row '+(w.y+1)}, strength ${waveStr()}`,cls:'piece wave'})}
  if(!busy)for(const s of G.ships){const p=shipPos(s);if(!p)continue;const w=p.port!=null?pw(p.c,p.r,p.port):sqW(p.c,p.r);const mine=s.i===me&&me>=0;
    if(!(mine&&UI.route))D.push({k:'tag',id:'s'+s.i,wx:w[0],wy:.5,wz:w[1],t:mine?'You':nm(s.i),cls:'ship'+(mine?' me':'')+(myTurn&&s.i===d?' act':''),sail:colOf(s.i).sail});
    if(mine&&myTurn&&G.phase==='play')D.push({k:'ring',id:'r'+s.i,wx:w[0],wz:w[1]})}
  if(myTurn&&G.phase==='setup'&&!G.q){const info=startInfo(d);const adv=startAdvice(knowledge(d),d,info);for(const o of info)D.push({k:'pip',id:'p'+o.m.x+o.m.y+o.m.e,wx:o.w[0],wz:o.w[1],t:o.lab,best:!!(adv&&adv.o===o)})}
  if(UI.route&&!busy)D.push({k:'route',id:'rt',pts:UI.route.pts,bad:UI.route.bad,stop:UI.route.stop,label:UI.route.label});
  if(UI.arrow)D.push({k:'arrow',id:'ar',a:UI.arrow.a,b:UI.arrow.b});
  for(const m of UI.marks||[])D.push({k:'mark',id:'mk'+m.id+m.seat,wx:m.at[0],wz:m.at[1],t:nm(m.seat)+' sunk'});
  {const seen={};for(const t of D){if(t.k!=='tag')continue;const k=t.wx.toFixed(1)+','+t.wz.toFixed(1);const n=seen[k]=(seen[k]||0)+1;if(n>1)t.wy+=.28*(n-1)}}
  ovApply(D)}
function ovApply(D){const sig=JSON.stringify(D);if(sig===OV.sig&&OV.items.length===D.length)return;OV.sig=sig;OV.descs=D;const root=$('#ov');if(!root)return;
  root.innerHTML='<svg id="ovsvg" width="100%" height="100%"></svg>';const svg=root.firstChild;OV.items=[];
  for(const ds of D){const it={ds};
    if(ds.k==='route'||ds.k==='arrow'){const ns='http://www.w3.org/2000/svg';const g=document.createElementNS(ns,'g');g.setAttribute('class',ds.k==='route'?'rtg'+(ds.bad?' bad':''):'arg');
      const a=document.createElementNS(ns,'polyline'),b=document.createElementNS(ns,'polyline');a.setAttribute('class','out');b.setAttribute('class','ln');g.append(a,b);svg.appendChild(g);it.poly=[a,b];
      if(ds.k==='route'){const f=document.createElement('div');f.className='ostop'+(ds.bad?' bad':'');f.innerHTML=`<i></i><span>${esc(ds.label)}</span>`;root.appendChild(f);it.el=f;
        const s=document.createElement('div');s.className='ostart';s.innerHTML='<span>start</span>';root.appendChild(s);it.el2=s}
      else{const h=document.createElementNS(ns,'polygon');h.setAttribute('class','head');g.appendChild(h);it.head=h}}
    else{const e=document.createElement('div');
      if(ds.k==='tag'){e.className='otag '+ds.cls;e.textContent=ds.t;if(ds.sail){const i=document.createElement('i');i.style.background=ds.sail;e.prepend(i)}if(ds.mon!=null)e.dataset.mon=ds.mon}
      else if(ds.k==='ring')e.className='oring';
      else if(ds.k==='pip'){e.className='opip'+(ds.best?' best':'');e.innerHTML=`<b>${esc(ds.t)}</b>${ds.best?'<u>best</u>':''}`}
      else if(ds.k==='mark'){e.className='omark';e.innerHTML=`<b>&#10006;</b><span>${esc(ds.t)}</span>`}
      root.appendChild(e);it.el=e}
    OV.items.push(it)}
  ovPos(true)}
function ovPos(force){const root=$('#ov');if(!root||!OV.items.length)return;const k=document.getElementById('board').clientWidth+'x'+document.getElementById('board').clientHeight;
  const P=ovMakeProj();if(!P)return;
  const tfm=(el,p)=>{if(!p){el.style.display='none';return}el.style.display='';el.style.transform=`translate(${p[0].toFixed(1)}px,${p[1].toFixed(1)}px)`};
  for(const it of OV.items){const ds=it.ds;
    if(it.poly){const pts=ds.k==='route'?ds.pts:[ds.a,ds.b];const pp=pts.map(q=>P(q[0],.06,q[1]));if(pp.some(x=>!x))continue;const s=pp.map(x=>x[0].toFixed(1)+','+x[1].toFixed(1)).join(' ');it.poly[0].setAttribute('points',s);it.poly[1].setAttribute('points',s);
      if(ds.k==='route'){const e=pp[pp.length-1];tfm(it.el,e);tfm(it.el2,pp[0]);const sp=it.el.lastChild,Bw=document.getElementById('board').clientWidth;if(sp){sp.style.left='0px';const w=sp.offsetWidth;const dx=Math.min(0,Bw-6-(e[0]+w/2))+Math.max(0,6-(e[0]-w/2));sp.style.left=dx.toFixed(0)+'px'}}
      else{const a=pp[pp.length-2]||pp[0],b=pp[pp.length-1];const ang=Math.atan2(b[1]-a[1],b[0]-a[0]);const L=14,W=8;const h=[[b[0],b[1]],[b[0]-L*Math.cos(ang)+W*Math.sin(ang),b[1]-L*Math.sin(ang)-W*Math.cos(ang)],[b[0]-L*Math.cos(ang)-W*Math.sin(ang),b[1]-L*Math.sin(ang)+W*Math.cos(ang)]];it.head.setAttribute('points',h.map(x=>x.join(',')).join(' '))}}
    else tfm(it.el,P(ds.wx,ds.wy||.05,ds.wz))}}
function ovLoop(){try{if(!document.hidden&&OV.items.length)ovPos()}catch(e){}OV.raf=requestAnimationFrame(ovLoop)}
document.addEventListener('mouseover',e=>{const t=e.target.closest&&e.target.closest('[data-mon]');const id=t&&t.dataset.mon!=null&&t.dataset.mon!==''?+t.dataset.mon:null;if(t&&t.classList.contains('otag'))return;if(id!==UI.hov){UI.hov=id;ovUpdate()}});
// ---------- the Pieces drawer: what is on the board right now ----------
function piecesNowHTML(){if(!G||!UI.started)return '<p class="tiny">Start a game to see where the expansion pieces are.</p>';const o=[];
  for(const g of G.gates)o.push(`<li><b>Rift Gate</b> on column ${g.x+1}, row ${g.y+1}: junks and leviathans that touch it are thrown to a rolled square.</li>`);
  if(G.wave){const w=G.wave;o.push(`<li><b>Rogue Wave</b> sweeping ${(w.r&1)?'column '+(w.x+1):'row '+(w.y+1)}, heading ${DNAME[w.r]}, strength ${waveStr()}: any junk in that band rolls a die and must reach ${waveStr()} or capsize.</li>`)}
  for(const m of G.mons)if(m.k==='M')o.push(`<li><b>Maelstrom</b> on column ${m.x+1}, row ${m.y+1}: moves on calm rolls (1 east, 2 south, 3 west, 4 north) and destroys what it enters.</li>`);
  if(!o.length)o.push('<li class="tiny">No expansion piece is on the board right now'+(G.exp&&(G.exp.rift||G.exp.wave||G.exp.maelstrom||G.exp.cannon)?' (they may still be in the piles)':' (the expansions are off in this game)')+'.</li>');
  const hd=viewSeat()>=0&&G.hands[viewSeat()]?G.hands[viewSeat()].filter(isCannon).length:0;
  return `<h3>On the board now</h3><ul>${o.join('')}</ul>${G.exp&&G.exp.cannon?`<p class="tiny">Deck Cannons: ${hd?'you hold '+hd+' (two is the most you may keep)':'you hold none'}.</p>`:''}`}
