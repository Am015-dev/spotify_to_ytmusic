/* ---------- Nightrun story MAP: a painted, scrollable route through the five districts (replaces the old stage list) ----------
   Every stage is a node on a winding road: locked / open / done (with its stars) / boss (bigger) / challenge (a side branch off the mini-boss).
   The current stage glows and the map scrolls to it. Tap a node: a plate shows the goal, the three stars, your best and PLAY.
   Portrait phones climb the map upwards, wide screens run it left to right. Stage data and rules live in story.js, the shop hints in strategy.js. */
const MAPD={sel:-1,land:false,lastW:0,lastH:0};
const slugOf=n=>String(n||'').toLowerCase().replace(/ü/g,'ue').replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const bgOf=di=>'media/bg-'+slugOf(DISTRICTS[di].name)+(MAPD.land?'':'-phone')+'.webp';
const bossOf=s=>s.goal.k==='boss'?DISTRICTS[s.di].bossName:s.goal.k==='mini'?s.mini.nm:null;
const CHRULE={nohit:'One hit ends the run.',speed:'Reach the kills before time is up.',perfect:'Land PERFECTs all the way.'};
/* the stage you should play next: the first open main stage without a star */
function mapCurrent(){for(let n=1;n<=MAIN;n++)if(unlocked(n)&&!(sSave.stars[n]|0))return n;return MAIN;}
/* place every node: main axis m (the way the route runs), cross axis c (0..1 across it) -> x,y */
function mapLayout(w,h){const land=w>h*1.15,STEP=land?Math.max(92,Math.min(124,w/8.5)):Math.max(74,Math.min(92,h/9)),BAN=land?150:104,PAD=land?70:56,bands=[];let m=PAD;
  const nodes=[];
  for(let ci=0;ci<5;ci++){const m0=m;m+=BAN;
    for(let j=0;j<8;j++){const n=ci*8+j+1,c=.5+.27*Math.sin(j*.9+ci*1.9+.4);nodes.push({n,m,c,ci});m+=STEP;}
    bands.push({ci,m0,m1:m});}
  // challenge nodes branch off the mini-boss (position 5 of its city), to the roomier side
  for(const s of STAGES.filter(x=>x.from)){const f=nodes[s.from-1],side=f.c<.5?1:-1;nodes.push({n:s.n,m:f.m+STEP*.62,c:Math.max(.12,Math.min(.88,f.c+side*.34)),ci:s.act,br:s.from});}
  const total=m+PAD*.6;
  const W=land?total:w,H=land?h:total;
  const at=(mm,c)=>land?{x:mm,y:Math.max(.12,Math.min(.88,c))*h}:{x:Math.max(.1,Math.min(.9,c))*w,y:total-mm};
  for(const nd of nodes)Object.assign(nd,at(nd.m,nd.c));
  const bs=bands.map(b=>land?{ci:b.ci,x:b.m0-PAD*.4,y:0,w:b.m1-b.m0+PAD*.4,h}:{ci:b.ci,x:0,y:total-b.m1,w,h:b.m1-b.m0});
  return{land,W,H,nodes,bands:bs,STEP,BAN,PAD,total,at};}
function mapPath(a,b,land){const mx=(a.x+b.x)/2,my=(a.y+b.y)/2;return land?`M${a.x},${a.y}C${mx},${a.y} ${mx},${b.y} ${b.x},${b.y}`:`M${a.x},${a.y}C${a.x},${my} ${b.x},${my} ${b.x},${b.y}`;}
function stDraw(){const box=$('stRows'),w=box.clientWidth||selEl.clientWidth,h=box.clientHeight||selEl.clientHeight;if(!w||!h)return;
  const keepFrac=box.scrollHeight>box.clientHeight||box.scrollWidth>box.clientWidth?(MAPD.land?box.scrollLeft/Math.max(1,box.scrollWidth):box.scrollTop/Math.max(1,box.scrollHeight)):null;
  const L=mapLayout(w,h);MAPD.land=L.land;MAPD.lastW=w;MAPD.lastH=h;
  $('stStars').textContent='★ '+ST.totalStars()+' / '+STAGES.length*3;box.className='rows mapbox'+(L.land?' land':'');box.innerHTML='';
  const cur=mapCurrent(),root=document.createElement('div');root.className='mp';root.style.width=L.W+'px';root.style.height=L.H+'px';
  // painted district bands (the district's own backdrop, dimmed)
  for(const b of L.bands){const D=DISTRICTS[b.ci],e=document.createElement('div');e.className='band';e.style.cssText=`left:${b.x}px;top:${b.y}px;width:${b.w}px;height:${b.h}px;--c:${D.a};background-image:linear-gradient(${L.land?'90deg':'0deg'},#05030cdd,#05030c88 45%,#05030cdd),url(${bgOf(b.ci)})`;
    const got=STAGES.filter(s=>s.act===b.ci&&!s.ch).reduce((a,s)=>a+(sSave.stars[s.n]|0),0),dn=STAGES.filter(s=>s.act===b.ci&&!s.ch&&(sSave.stars[s.n]|0)>0).length;
    const t=document.createElement('div');t.className='ban';t.style.cssText=L.land?`left:${b.x+L.PAD*.5}px;top:12px`:`left:50%;top:${b.y+b.h-L.BAN+6}px`;
    t.innerHTML=`<small>${ACTN[b.ci]} · ${dn}/8</small><b>${D.name}</b><span>${D.sub.split('·')[0].trim()} · ★ ${got}/24</span>`;
    root.append(e,t);}
  // the road: one lit segment per stage you can reach, dark ones beyond
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('class','rt');svg.setAttribute('width',L.W);svg.setAttribute('height',L.H);
  const by={};for(const nd of L.nodes)by[nd.n]=nd;let sv='';
  for(let n=1;n<MAIN;n++){const a=by[n],b=by[n+1],D=DISTRICTS[STAGES[n].di],lit=unlocked(n+1),d=mapPath(a,b,L.land);
    sv+=`<path d="${d}" class="rb"/><path d="${d}" class="rl${lit?' on':''}" style="stroke:${lit?D.a:'#4a4568'}"/>`;}
  for(const s of STAGES.filter(x=>x.from)){const a=by[s.from],b=by[s.n],lit=unlocked(s.n);sv+=`<path d="${mapPath(a,b,L.land)}" class="rl br${lit?' on':''}" style="stroke:${lit?'#ffe14d':'#4a4568'}"/>`;}
  svg.innerHTML=sv;root.append(svg);
  for(const nd of L.nodes){const s=STAGES[nd.n-1],ok=unlocked(s.n),k=sSave.stars[s.n]|0,D=DISTRICTS[s.di],boss=s.goal.k==='boss',mini=s.goal.k==='mini',b=document.createElement('button');
    b.type='button';b.className='nd'+(boss?' boss':mini?' mini':s.ch?' chl':'')+(s.n===cur?' cur':'')+(s.n===MAPD.sel?' sel':'');
    b.dataset.n=s.n;b.dataset.id='s'+s.n;b.dataset.nd=!ok?'locked':k>0?'done':boss||mini?'boss':'open';b.style.cssText=`left:${nd.x}px;top:${nd.y}px;--c:${D.a}`;
    b.setAttribute('aria-label',`Stage ${s.n} ${s.name}${ok?'':' locked'}`);
    const side=L.land||s.ch||STAGES.some(x=>x.from===s.n)?'v':(nd.x<L.W/2?'r':'l');b.classList.add('s'+side);   // r / l: the label sits beside the medallion, v: under it
    b.innerHTML=`<span class="md"><i class="ring"></i><span class="no">${s.ch?'◆':s.n}</span></span><span class="meta">${ok&&k?`<span class="stars">${'★'.repeat(k)}${'☆'.repeat(3-k)}</span>`:ok?'':lockI}<span class="nm">${s.name}</span></span>`;
    b.addEventListener('click',()=>mapPick(s.n));root.append(b);}
  box.append(root);
  if(!box._edge){box._edge=1;let q=0;box.addEventListener('scroll',()=>{if(q)return;q=requestAnimationFrame(()=>{q=0;mapEdge();});},{passive:true});}
  // scroll: keep the place on a relayout, else bring the current stage into view
  const c=by[MAPD.sel>0?MAPD.sel:cur];
  if(L.land){box.scrollLeft=keepFrac!=null&&MAPD.keep?keepFrac*L.W:Math.max(0,c.x-w*.4);}else{box.scrollTop=keepFrac!=null&&MAPD.keep?keepFrac*L.H:Math.max(0,c.y-h*.55);}
  MAPD.keep=true;mapDetail(MAPD.sel);requestAnimationFrame(mapEdge);}
/* a name that would be cut by the edge of the map (or the screen) is hidden until it scrolls fully into view */
function mapEdge(){const box=$('stRows');if(!box||selEl.hidden)return;const br=box.getBoundingClientRect();for(const n of box.querySelectorAll('.nd')){const r=n.querySelector('.meta').getBoundingClientRect();n.classList.toggle('ed',r.left<br.left+1||r.right>br.right-1||r.top<br.top+1||r.bottom>br.bottom-1);}}
function mapPick(n){const ok=unlocked(n);MAPD.sel=n;for(const e of document.querySelectorAll('#stRows .nd'))e.classList.toggle('sel',+e.dataset.n===n);
  if(!ok){const e=document.querySelector(`#stRows .nd[data-n="${n}"]`);if(e){e.classList.remove('shake');void e.offsetWidth;e.classList.add('shake');}}
  mapDetail(n);mapReveal(n);}
function mapReveal(n){const box=$('stRows'),e=box.querySelector(`.nd[data-n="${n}"]`),pl=$('stDet');if(!e||!pl||pl.hidden)return;const x=parseFloat(e.style.left),y=parseFloat(e.style.top);
  if(MAPD.land)box.scrollTo({left:Math.max(0,x-box.clientWidth*.42),behavior:'smooth'});else box.scrollTo({top:Math.max(0,y-(box.clientHeight-pl.offsetHeight)*.5),behavior:'smooth'});}
/* the plate under the map: stage, goal, the three stars, best, PLAY */
function mapDetail(n){const el=$('stDet');if(!el)return;if(!(n>0)){el.hidden=true;return;}
  const s=STAGES[n-1],ok=unlocked(n),k=sSave.stars[n]|0,D=DISTRICTS[s.di],bn=bossOf(s),lines=starTxt(s),rec=typeof stageTip==='function'?stageTip(s):'';
  const need=s.from?STAGES[s.from-1].name:STAGES[n-2]&&STAGES[n-2].name;
  el.hidden=false;el.dataset.n=n;el.style.setProperty('--c',D.a);
  el.innerHTML=`<div class="dh"><span class="ac">${s.ch?'CHALLENGE':ACTN[s.act]+' · '+D.name}</span><span class="bs">${ok?'BEST '+'★'.repeat(k)+'☆'.repeat(3-k):''}</span><button class="x" id="stDx" type="button" aria-label="Close">✕</button></div>`
   +`<div class="dm">${bn?`<img class="bp" src="media/boss-${slugOf(bn)}.webp" alt="" onerror="this.remove()">`:''}<div class="dt"><div class="nm">${s.n<=MAIN?s.n+' · ':''}${s.name}</div><div class="gl">${goalTxt(s)}</div>${s.ch?`<div class="rl">${CHRULE[s.ch]}</div>`:''}</div></div>`
   +`<div class="stl">${lines.map((t,i)=>`<div class="${k>i?'ok':''}"><span>${k>i?'★':'☆'}</span> ${t}</div>`).join('')}</div>`
   +(rec?`<div class="tip">${rec}</div>`:'')
   +(ok?'':`<div class="lkn">Clear ${need||'the stage before'} first</div>`)
   +`<button class="go" id="stPlay" type="button"${ok?'':' disabled'}>${ok?(k?'PLAY AGAIN':'PLAY'):'LOCKED'}</button>`;
  $('stPlay').addEventListener('click',()=>{if(unlocked(n))startStory(n);});
  $('stDx').addEventListener('click',()=>{MAPD.sel=-1;for(const e of document.querySelectorAll('#stRows .nd.sel'))e.classList.remove('sel');el.hidden=true;});}
function openStages(){ST.on=false;titleEl.hidden=true;overEl.hidden=true;resEl.hidden=true;pauseEl.hidden=true;selEl.hidden=false;MAPD.keep=false;MAPD.sel=-1;stDraw();}
function closeStages(){selEl.hidden=true;titleEl.hidden=false;showBest();}
/* one debounced relayout for resize, rotation, visualViewport and ResizeObserver; measured again after 400 ms (iOS reports the old size right after rotating) */
{let t=0;const go=()=>{if(selEl.hidden)return;const b=$('stRows');if(Math.abs(b.clientWidth-MAPD.lastW)>2||Math.abs(b.clientHeight-MAPD.lastH)>2)stDraw();},
  kick=()=>{clearTimeout(t);t=setTimeout(()=>{go();setTimeout(go,400);},120);};
  addEventListener('resize',kick);addEventListener('orientationchange',kick);if(window.visualViewport)visualViewport.addEventListener('resize',kick);
  if(window.ResizeObserver)new ResizeObserver(kick).observe(stage);}
{const st=document.createElement('style');st.textContent=`
#stsel .mapbox{display:block!important;flex:1 1 0;min-height:0;position:relative;overflow:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;border-radius:10px;background:#05030c;touch-action:pan-x pan-y;scrollbar-width:thin}
#stsel .mp{position:relative;overflow:hidden}
#stsel .band{position:absolute;background-size:cover;background-position:center;opacity:1;border-top:2px solid var(--c);border-image:none}
#stsel .band::after{content:"";position:absolute;inset:0;box-shadow:inset 0 0 40px #05030c}
#stsel .ban{position:absolute;transform:translateX(-50%);z-index:2;display:flex;flex-direction:column;align-items:center;gap:1px;padding:6px 18px;text-align:center;white-space:nowrap;color:var(--ink);
  border:14px solid transparent;border-image:url(media/ui-panel.webp) 70 fill/14px stretch;background:#05030c99}
#stsel .mapbox.land .ban{transform:none;align-items:flex-start;text-align:left}
#stsel .ban small{font-family:var(--mono);font-size:11px;letter-spacing:.14em;color:#c9c3ee}
#stsel .ban b{font-size:clamp(15px,4.4vw,22px);letter-spacing:.14em;color:var(--c);line-height:1.1}
#stsel .ban span{font-family:var(--mono);font-size:11px;color:#cfc9f2}
#stsel .rt{position:absolute;left:0;top:0;pointer-events:none;z-index:1;overflow:visible}
#stsel .rt path{fill:none;stroke-linecap:round}
#stsel .rt .rb{stroke:#05030c;stroke-width:15}
#stsel .rt .rl{stroke-width:5;stroke-dasharray:2 11;opacity:.85}
#stsel .rt .rl.on{stroke-width:6;stroke-dasharray:none;filter:none;opacity:.95}
#stsel .rt .rl.br{stroke-width:4;stroke-dasharray:3 9}
#stsel .nd{position:absolute;z-index:3;margin:0;padding:0;border:0;background:none;color:#fff;font-family:var(--display);font-weight:700;font-size:17px;text-shadow:0 0 3px #000,0 0 7px #000;cursor:pointer;touch-action:manipulation;display:flex;align-items:center;gap:6px;-webkit-tap-highlight-color:transparent;--m:54px}
#stsel .nd.boss{--m:84px;font-size:26px}#stsel .nd.mini{--m:68px;font-size:22px}#stsel .nd.chl{--m:48px;font-size:18px}
#stsel .nd .md{position:relative;flex:0 0 auto;width:var(--m);height:var(--m);display:flex;align-items:center;justify-content:center;background:url(media/ui-node-open.webp) center/contain no-repeat}
#stsel .nd[data-nd=done] .md{background-image:url(media/ui-node-done.webp)}
#stsel .nd[data-nd=boss] .md,#stsel .nd.boss .md,#stsel .nd.mini .md{background-image:url(media/ui-node-boss.webp)}
#stsel .nd[data-nd=locked] .md{background-image:url(media/ui-node-locked.webp);color:#e6e2ff}
#stsel .nd.boss[data-nd=done] .md,#stsel .nd.mini[data-nd=done] .md{background-image:url(media/ui-node-done.webp)}
#stsel .nd.chl .md{filter:hue-rotate(160deg) saturate(1.2)}#stsel .nd.chl[data-nd=locked] .md{filter:grayscale(.6)}
/* the button is the whole plate: medallion + stars + name. The anchor is the medallion centre. */
#stsel .nd.sr{transform:translate(calc(var(--m)/-2),-50%)}
#stsel .nd.sl{flex-direction:row-reverse;transform:translate(calc(var(--m)/2 - 100%),-50%)}
#stsel .nd.sv{flex-direction:column;gap:0;transform:translate(-50%,calc(var(--m)/-2))}
#stsel .nd .meta{display:flex;flex-direction:column;gap:0;min-width:0;padding:2px 7px;border-radius:7px;background:#05030cd0;text-align:left;align-items:flex-start}
#stsel .nd.sl .meta{align-items:flex-end;text-align:right}
#stsel .nd.sv .meta{align-items:center;text-align:center;margin-top:1px}
#stsel .nd .ring{position:absolute;inset:-5px;border-radius:50%;border:3px solid var(--c);opacity:0;pointer-events:none}
#stsel .nd.cur .ring{opacity:.9;animation:ndp 1.5s ease-out infinite}
#stsel .nd.ed .meta{visibility:hidden}
#stsel .nd.sel .ring{opacity:1;border-color:#fff;inset:-6px;animation:none;box-shadow:0 0 10px #fff}
@keyframes ndp{0%{transform:scale(.9);opacity:.95}100%{transform:scale(1.5);opacity:0}}
#stsel .nd .stars{font-size:12px;line-height:1.15;letter-spacing:0;color:#ffe14d;white-space:nowrap;text-shadow:none}
#stsel .nd svg.lk{height:13px;width:13px;color:var(--dim)}
#stsel .nd .nm{font-size:12px;line-height:1.2;font-weight:700;letter-spacing:.02em;white-space:nowrap;color:var(--ink);text-shadow:none}
#stsel .nd[data-nd=locked] .nm{color:var(--dim)}
#stsel .nd.shake{animation:pgsh .3s}
#stDet{position:absolute;z-index:6;left:50%;bottom:calc(var(--u)*2);transform:translateX(-50%);width:min(94%,520px);box-sizing:border-box;display:flex;flex-direction:column;gap:5px;padding:2px 4px;
  border:16px solid transparent;border-image:url(media/ui-panel.webp) 70 fill/16px stretch;background:#05030ce8;color:var(--ink);font-family:var(--display)}
#stDet[hidden]{display:none}
#stDet .dh{display:flex;align-items:center;gap:8px;font-family:var(--mono);font-size:11px;letter-spacing:.1em}
#stDet .ac{color:var(--c);font-weight:700;flex:1 1 auto;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#stDet .bs{color:#ffe14d;white-space:nowrap}
#stDet .x{min-width:44px;min-height:44px;margin:-14px -10px -14px 0;border:0;background:none;color:var(--dim);font-size:16px;cursor:pointer}
#stDet .dm{display:flex;gap:10px;align-items:center}
#stDet .bp{width:clamp(44px,12vh,72px);height:clamp(44px,12vh,72px);object-fit:cover;border-radius:50%;border:2px solid var(--c);flex:0 0 auto;background:#05030c}
#stDet .nm{font-weight:700;font-size:clamp(17px,4.6vw,24px);letter-spacing:.06em;line-height:1.1}
#stDet .gl{font-family:var(--mono);font-size:13px;color:var(--cyan)}
#stDet .rl{font-family:var(--mono);font-size:12px;color:var(--amber)}
#stDet .stl{display:flex;flex-direction:column;gap:1px;font-family:var(--mono);font-size:12px;color:var(--dim)}
#stDet .stl .ok{color:var(--ink)}#stDet .stl span{color:#ffe14d;font-size:1.15em}
#stDet .tip{font-family:var(--mono);font-size:12px;color:#7dffd8}
#stDet .lkn{font-family:var(--mono);font-size:12px;color:var(--amber)}
#stDet .go{align-self:stretch;min-height:44px}
#stsel .mapbox.land~#stDet,#stsel.wide #stDet{left:auto;right:calc(var(--u)*2);transform:none;width:min(36%,400px)}
#stDet .go:disabled{filter:grayscale(.8) brightness(.7);cursor:default}
@container (max-height:600px){#stDet .stl{flex-direction:row;flex-wrap:wrap;gap:2px 10px}#stDet .bp{display:none}}
`;document.head.appendChild(st);}
