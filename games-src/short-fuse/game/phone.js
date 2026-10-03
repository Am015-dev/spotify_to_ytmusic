// ===================== phone layout: the table first, tap to play, one pop-up / card at a time =====================
// Only active when html.ph is set (short side <= 500 px, or a touch screen <= 600 px; ?phone=1 / ?phone=0 force it). Desktop and tablets never run this code.
// Plan: the 3D table (compact detonator, racks around it) fills the board; tap a crewmate's rack or wire -> the camera glides to that rack so every wire is
// >= 44 px (slide it with a drag or the arrows); a wire tap opens "Call a value" under (portrait) / beside (landscape) the board; your own rack is a strip of big wires.
const PX={on:false,land:false,zoom:null,pop:null,pd:null,toast:'',strip:'',pops:'',card:null,ackRes:null,ovHide:null,swipeT:0,rack:'',chips:'',msg:'',zb:'',cam:null,mine:null};
const PX_ZEL=42;            // zoomed camera elevation (degrees)
const PX_WIRE=52;           // wanted wire width in px when zoomed (its projected height is ~0.9 of that)
function pxDetect(){try{const P=new URLSearchParams(location.search);if(P.has('phone'))return P.get('phone')!=='0'}catch(e){}
  const s=Math.min(innerWidth,innerHeight);if(s<=500)return true;let c=false;try{c=matchMedia('(pointer:coarse)').matches}catch(e){}return c&&s<=600}
function pxInsets(){try{const P=new URLSearchParams(location.search);if(P.has('safe')){const a=P.get('safe').split(',').map(Number);return {t:a[0]||0,r:a[1]||0,b:a[2]||0,l:a[3]||0}}
  let p=document.getElementById('phprobe');if(!p){p=document.createElement('div');p.id='phprobe';p.setAttribute('aria-hidden','true');p.style.cssText='position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)';document.body.appendChild(p)}
  const c=getComputedStyle(p);return {t:parseFloat(c.paddingTop)||0,r:parseFloat(c.paddingRight)||0,b:parseFloat(c.paddingBottom)||0,l:parseFloat(c.paddingLeft)||0}}catch(e){return {t:0,r:0,b:0,l:0}}}
function pxApply(){const R=document.documentElement;const was=PX.on;PX.on=pxDetect();window.SF_PHONE=PX.on;R.classList.toggle('ph',PX.on);
  if(!PX.on){R.classList.remove('ph-l','ph-p');for(const k of['--zh','--rw','--sat','--sar','--sab','--sal'])R.style.removeProperty(k);return was}
  const w=innerWidth,h=innerHeight,I=pxInsets();PX.land=w>h;
  R.classList.toggle('ph-l',PX.land);R.classList.toggle('ph-p',!PX.land);
  // portrait: the free zone under the board; landscape: the rail on the right (the board is the full height)
  const zh=Math.round(Math.min(Math.max(278,Math.min(310,(h-I.t-I.b)*.35)),Math.max(150,h-I.t-I.b-44-.75*(w-I.l-I.r)))),rw=Math.round(Math.max(232,Math.min(300,(w-I.l-I.r)*.31)));
  R.style.setProperty('--zh',zh+'px');R.style.setProperty('--rw',rw+'px');R.style.setProperty('--sat',I.t+'px');R.style.setProperty('--sar',I.r+'px');R.style.setProperty('--sab',I.b+'px');R.style.setProperty('--sal',I.l+'px');return true}
pxApply();
// ---------- helpers ----------
const PXK=()=>{try{return SFKit._K}catch(e){return null}};
const pxOn3=()=>{const K=PXK();return !!(PX.on&&K&&K.on&&K.cam)};
function pxMyTurn(){const V=UI.V;return !!(PX.on&&G&&V&&V.seat>=0&&!G.over&&decider()===V.seat)}
function pxRows(){const K=PXK();return K&&K.rows?K.rows.filter(r=>r.m>0&&(!r.mine||!(UI.V&&UI.V.seat>=0))):[]}
// the kit row (rack) a wire stands in, and its slot
function pxRowOf(si,k){const K=PXK();if(!K||!K.rows)return null;const own=ownerOf(si);const j=seatStands(own).indexOf(si);const key=posOf(own)+':'+j;return K.rows.find(r=>r.key===key&&k>=r.from&&k<r.to)||null}
function pxRowInfo(row){if(!row)return null;const seat=G.pos.indexOf(+row.key.split(':')[0]);const ss=seatStands(seat);const si=ss[+row.key.split(':')[1]];const st=G.st[si];if(!st)return {seat,si,left:0,total:0,nm:nm(seat),part:''};
  const left=st.w.filter(x=>!x.cut).length;return {seat,si,left,total:st.w.length,nm:nm(seat),part:ss.length>1?' · stand '+(ss.indexOf(si)+1):''}}
// ---------- camera: overview (the kit's fit) and zoom to one rack ----------
function pxPose(row,pan){const K=PXK(),cam=K.cam;const s=row.s,th=row.rot;const c=Math.cos(th),sn=Math.sin(th);
  const loc=(x,y,u)=>{const X=x*s,Z=u*s;return new THREE.Vector3(X*c+Z*sn+row.px,y*s,-X*sn+Z*c+row.pz)};
  const fov=cam.fov*Math.PI/180,m=row.m;const fitP=(K.w-14)/(m+.45);   // pitch (px) that fits the whole rack
  const pitch=Math.max(PX_WIRE*1.13,Math.min(fitP,PX_WIRE*1.13*1.3));
  const ppu=pitch/(1.13*s);                                          // px per world unit at the look point
  const d=K.h/(2*Math.tan(fov/2)*ppu);
  const rackW=(m*1.13+.5)*s,visW=(K.w-10)/ppu,half=Math.max(0,(rackW+1.4*s-visW)/2);   // 0.7 of a wire of slack at each end, so the end wires are fully on screen
  const p=Math.max(-half,Math.min(half,pan||0));
  const ax=new THREE.Vector3(c,0,-sn),ud=new THREE.Vector3(sn,0,c);
  const look=loc(0,.75,.9).addScaledVector(ax,p);
  // the rack sits a little below the middle so the name bar on top never covers it
  const ground=ud.clone().multiplyScalar(-1);look.addScaledVector(ground,(K.h*.07)/ppu*.9);
  const el=PX_ZEL*Math.PI/180;const pos=look.clone().add(new THREE.Vector3(ud.x*Math.cos(el),Math.sin(el),ud.z*Math.cos(el)).multiplyScalar(d));
  return {pos,look,half,ppu,pitch,pan:p}}
function pxTarget(){const K=PXK();if(!K)return null;if(PX.zoom){const row=pxRows().find(r=>r.key===PX.zoom.key&&PX.zoom.slot>=r.from&&PX.zoom.slot<r.to)||pxRows().find(r=>r.key===PX.zoom.key);
    if(row){const o=pxPose(row,PX.zoom.pan);PX.zoom.half=o.half;PX.zoom.pan=o.pan;PX.zoom.ppu=o.ppu;return o}PX.zoom=null}
  return K.camFit?{pos:K.camFit.pos.clone(),look:K.camFit.look.clone()}:null}
function pxCamApply(instant){const K=PXK();if(!K||!K.camState||!K.on)return;const t=pxTarget();if(!t)return;const C=K.camState;
  if(PX.cam&&PX.cam.raf){cancelAnimationFrame(PX.cam.raf);PX.cam=null}
  if(instant||!ANIM||!C.ready){C.pos.copy(t.pos);C.look.copy(t.look);try{PerfHUD.wake()}catch(e){}pxZB();return}
  const p0=C.pos.clone(),l0=C.look.clone(),t0=performance.now(),dur=520/Math.max(.5,UI.speed||1);PX.cam={raf:0};
  const step=now=>{const k=Math.min(1,(now-t0)/dur),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;const t2=pxTarget();if(!t2){PX.cam=null;return}
    C.pos.lerpVectors(p0,t2.pos,e);C.look.lerpVectors(l0,t2.look,e);try{PerfHUD.wake()}catch(x){}
    if(k<1)PX.cam.raf=requestAnimationFrame(step);else{PX.cam=null;C.pos.copy(t2.pos);C.look.copy(t2.look)}};
  PX.cam.raf=requestAnimationFrame(step);pxZB()}
function pxHook(){const K=PXK();if(K)K.phCam=()=>{if(PX.on)pxCamApply(true);else{const F=K.camFit;if(F){K.camState.pos.copy(F.pos);K.camState.look.copy(F.look)}}}}
pxHook();
function pxZoomTo(row,slot,keepPan){if(!pxOn3()||!row)return;const same=PX.zoom&&PX.zoom.key===row.key;
  // another rack: the wire pointed at on the old rack is dropped (the pop-up would talk about a wire that is no longer on screen)
  if(!same&&UI.sel&&UI.sel.mode==='dual'&&UI.sel.tg&&UI.sel.tg.length){UI.sel=null;try{refresh()}catch(e){}}
  let pan=0;if(slot!=null){const k=slot-row.from;const x=(row.mine?1:-1)*((k)-(row.m-1)/2)*1.13;pan=x*row.s}
  PX.zoom={key:row.key,slot:slot!=null?slot:row.from,pan:keepPan&&same?PX.zoom.pan:pan,half:0};
  pxCamApply(false);pxAfter()}
function pxZoomOut(){if(!PX.zoom)return;PX.zoom=null;pxCamApply(false);pxAfter()}
function pxPan(dx){if(!PX.zoom)return;PX.zoom.pan+=dx;pxCamApply(true)}
// ---------- the zoom bar over the board ----------
function pxZB(){const bar=document.getElementById('zb');if(!bar)return;const row=PX.zoom&&pxRows().find(r=>r.key===PX.zoom.key);
  const bd=document.getElementById('board');if(bd)bd.classList.toggle('pz',!!(PX.on&&row&&G&&UI.started));
  if(!PX.on||!row||!G||!UI.started){if(!bar.hidden){bar.hidden=true;bar.innerHTML=''}for(const id of['zpl','zpr']){const b=document.getElementById(id);if(b)b.hidden=true}PX.zb='';return}
  const I=pxRowInfo(row);const h=`<button class="zbb" data-ph="zprev" aria-label="Previous rack">&#8249;</button><div class="zt"><b>${esc(I.nm)}${esc(I.part)}</b><small>${I.left} of ${I.total} wires left</small></div><button class="zbb" data-ph="znext" aria-label="Next rack">&#8250;</button><span class="zst">${pxStatHTML(UI.V)}</span><button class="zbb zx" data-ph="zexit" aria-label="Back to the whole table">${ico('eye')}</button>`;
  if(h!==PX.zb){PX.zb=h;bar.innerHTML=h}bar.style.borderBottom='4px solid '+SEATC[posOf(I.seat)%5];bar.hidden=false;
  const half=PX.zoom.half||0;for(const [id,sgn] of [['zpl',-1],['zpr',1]]){const b=document.getElementById(id);if(b){b.hidden=half<.3||(sgn<0?PX.zoom.pan<=-half+.05:PX.zoom.pan>=half-.05)}}}
function pxCycle(d){const rs=pxRows();if(!rs.length)return;let i=rs.findIndex(r=>r.key===(PX.zoom&&PX.zoom.key)&&PX.zoom.slot>=r.from&&PX.zoom.slot<r.to);if(i<0)i=0;i=(i+d+rs.length)%rs.length;pxZoomTo(rs[i],null)}
// drag to slide along the zoomed rack
{let d0=null;document.addEventListener('pointerdown',e=>{if(!PX.on||!PX.zoom||e.target.id!=='c3')return;d0={x:e.clientX,y:e.clientY,pan:PX.zoom.pan,moved:false}},true);
 document.addEventListener('pointermove',e=>{if(!d0||!PX.zoom)return;const dx=e.clientX-d0.x;if(!d0.moved&&Math.abs(dx)<8)return;d0.moved=true;
   // screen right = the rack's +x, so dragging right shows wires further left
   PX.zoom.pan=d0.pan-dx/(PX.zoom.ppu||40);pxCamApply(true)},true);
 document.addEventListener('pointerup',()=>{d0=null},true);document.addEventListener('pointercancel',()=>{d0=null},true)}
// ---------- the control strip: status, what to do, my rack, chips ----------
const PX_CLS={b:'b',r:'r',y:'y'};
function pxWireText(x){if(x.v==null)return '?';if(x.c==='y')return 'Y';if(x.c==='r')return '!';return VNm(x.v)}
function pxRackHTML(V){if(!V||V.seat<0)return '';const mine=V.stands.filter(st=>st.mine);if(!mine.length)return '';let h='';
  mine.forEach((st,j)=>{if(mine.length>1)h+=`<i class="pr-sep">${j+1}</i>`;
    st.slots.forEach((x,k)=>{const cls=x.cut?'cut':(PX_CLS[x.c]||'u');const tk=(x.tok||[]).find(q=>q.t!=='x');const lab=`Your wire ${LET(k)}${mine.length>1?' (stand '+(j+1)+')':''}: ${x.cut?'cut':x.v==null?'unknown (flipped)':x.c==='y'?'yellow':x.c==='r'?'red':VNm(x.v)}`;
      h+=`<button class="pw ${cls}${x.flip?' flip':''}" data-ph="own" data-s="${st.i}" data-k="${k}" aria-label="${esc(lab)}"><b>${esc(x.cut?'✓':pxWireText(x))}</b><i>${LET(k)}</i>${tk&&!x.cut?`<u class="tk">${esc(String(tok2kit(tk)||'').replace('yellow','Y').replace(/^!/,'!').slice(0,3))}</u>`:''}</button>`})});
  return h}
function pxStatHTML(V){if(!G)return '';let h='';
  if(G.dial!=null){let pp='';const mx=Math.max(G.dial,G.np,DIAL_MAX>6?6:Math.max(G.dial,G.np));for(let i=1;i<=mx;i++)pp+=`<i class="${i<=G.dial?'':'off'}"></i>`;
    h+=`<span class="pchip fuse${G.dial<=1?' danger':''}" role="status" aria-label="Fuse: ${G.dial} step${G.dial===1?'':'s'} left">${ico('fuse')}<span class="pp">${pp}</span>${G.dial}</span>`}
  else if(V&&V.ms&&V.ms.robotFuse)h+=`<span class="pchip fuse${V.ms.robotFuse.at>=10?' danger':''}">${ico('robot')}${V.ms.robotFuse.at}/12</span>`;
  const tot=G.st.reduce((a,s)=>a+s.w.length,0),cut=G.st.reduce((a,s)=>a+s.w.filter(x=>x.cut).length,0);h+=`<span class="pchip" aria-label="${cut} of ${tot} wires cut">${ico('cut')}${cut}/${tot}</span>`;
  const c=timedJob()&&V&&V.seat!=null?clockLeft(knowledge(Math.max(0,V.seat))):null;if(c)h+=`<span class="pchip timer${c.real<30?' danger':''}" id="pxtimer" aria-label="${esc(c.label)}">${ico('clock')}<span class="tm">${fmt(c.left)}</span></span>`;
  if(V&&V.ms&&V.ms.oxygen){const me=V.seat>=0?V.seats[V.seat].ox:null;h+=`<span class="pchip">${ico('bubble')}${V.ms.oxygen.v==='gift'||V.ms.oxygen.v==='bundle'?(me!=null?me:''):V.ms.oxygen.res}</span>`}
  return h}
function pxCrewHTML(V){if(!G||!V||!V.seats)return '';let h='';
  for(let p=0;p<G.np;p++){const s=G.pos.indexOf(p),q=V.seats[s];if(!q)continue;const me=s===V.seat,now=s===G.actor&&!G.over;const lab=`${q.nm}${me?' (you)':''}: ${q.nUncut} wire${q.nUncut===1?'':'s'} left${now?', its turn':''}`;
    h+=`<button class="pchip btn seat${now?' now':''}${me?' me':''}${q.nUncut?'':' out'}" style="--sc:${SEATC[p%5]}" data-ph="seat" data-p="${p}" data-s="${s}" aria-label="${esc(lab)}"><i class="dot"></i><b>${s===G.captain?'&#9733; ':''}${esc(q.nm)}</b><small>${q.nUncut}</small></button>`}
  return h}
function pxChipsHTML(V){if(!G||!V)return '';let h=`<button class="pchip btn" data-ph="chip" data-k="job" aria-label="Job ${G.mission}: ${esc(MISSIONS[G.mission].nm)}">${ico('target')}<b>Job ${G.mission}</b></button>`;
  if(V.seat>=0){const q=V.seats[V.seat];if(q&&q.ch&&CHARS[q.ch]){h+=`<button class="pchip btn${q.chUsed||q.chDown?' used':''}" data-ph="chip" data-k="crew" aria-label="Your crew card: ${esc(CHARS[q.ch].n)}">${ico('gear')}<b>${esc(CHARS[q.ch].n)}</b></button>`}}
  if(!noGear()&&V.eq)V.eq.forEach((e,i)=>{if(e.down||!e.id){h+=`<button class="pchip btn used" data-ph="chip" data-k="eq" data-i="${i}" aria-label="Face-down gear card"><b>?</b></button>`;return}const E=EQUIP[e.id];if(!E)return;
    h+=`<button class="pchip btn eq ${esc(e.st||'')}" data-ph="chip" data-k="eq" data-i="${i}" aria-label="${esc(E.n)} (${esc(e.st||'')})"><em>${E.v==='Y'?'Y':E.v}</em><b>${esc(E.n)}</b></button>`});
  if(G&&UI.started&&(timedJob()||modeOf()==='watch'))h+=`<button class="pchip btn" data-a="pause" aria-label="${UI.pause?'Resume':'Pause'}">${ico(UI.pause?'play':'pause')}<b>${UI.pause?'Resume':'Pause'}</b></button>`;
  return h}
function pxHandGear(V){let h='';if(!G||!V||V.seat<0||noGear()||modeOf()!=='hot'||G.over)return '';
  if(UI.offSeat===V.seat)return `<button class="pb pri" data-a="offdone">${ico('back')}Done: pass the device back</button>`;
  if(G.q)return '';try{for(const s of humans())if(s!==V.seat&&validMoves(s).some(m=>m.a==='eq'||m.a==='item'))h+=`<button class="pb" data-a="offseat" data-seat="${s}">${ico('gear')}${esc(nm(s))}: gear</button>`}catch(e){}return h}
function pxActsHTML(V){if(!G||!V)return '';let h='';const L=V.legal;
  if(V.seat<0){if(modeOf()==='watch'&&!G.over)h+=`<button class="pb" data-a="xray">${ico('eye')}${UI.xray?'Hide':'Show'} wires</button>`;return h}
  if(G.over)return `<button class="pb" data-ph="showover">Result</button>`;
  if(UI.sel&&UI.sel.off)return '';
  if(L&&decider()===V.seat&&!G.q){const sel=UI.sel;if(sel&&(sel.mode==='choose'||sel.mode==='multi'||sel.mode==='flipown'))return '';
    for(const m of L.solo)h+=`<button class="pb pri" data-a="solo" data-v="${m.v}" data-ep="${m.ep?1:''}" data-fu="${m.fu!=null?m.fu:''}">${ico('cut')}Solo cut ${esc(VNm(m.v))}${m.ep?' (Express Pass)':''}${m.flip?' + flipped':''}</button>`;
    for(const m of L.special)h+=`<button class="pb" data-a="multi" data-kind="${m.kind}" data-n="${m.tg.length}">${esc(multiName(m.kind))}</button>`;
    const others=L.other.filter(m=>m.a!=='eq'&&!(noGear()&&m.a==='item')),groups={};for(const m of others){const k=moveKey(m);(groups[k]=groups[k]||[]).push(m)}
    for(const k in groups)h+=`<button class="pb" data-a="grp" data-k="${esc(k)}">${esc(keyName(groups[k][0]))}${groups[k].length>1&&!stepsOf(k).length?' ('+groups[k].length+')':''}</button>`;
    if(UI.help){const W=wwk(V);if(W&&W.suggestion)h+=`<button class="pb" data-a="sugg">${ico('bulb')}Suggest</button>`}
    const T=noGear()?{}:L.tools;for(const t of ['dd','pt3','eq3','eq5'])if(T[t])h+=`<button class="pb${UI.sel&&UI.sel.tool===t?' on':''}" data-a="tool" data-t="${t}">${esc(toolName(t))}</button>`;
    for(const t of ['pt10','eq10'])if(T[t])h+=`<button class="pb${UI.sel&&UI.sel.two===t?' on':''}" data-a="two" data-t="${t}">${esc(toolName(t))}</button>`;
    if(L.flip.length)h+=`<button class="pb${UI.sel&&UI.sel.fu!=null?' on':''}" data-a="flipmode">Use my flipped wire</button>`;
    if(UI.sel&&UI.sel.mode==='dual'&&(UI.sel.tool||UI.sel.two||UI.sel.fu!=null))h+=`<button class="pb" data-a="cancel">Start again</button>`;
    return h+pxHandGear(V)}
  const off=(V.off||[]).filter(m=>!(noGear()&&(m.a==='eq'||m.a==='item')));
  for(const m of off)h+=`<button class="pb ${m.a==='claim'||m.a==='snip'?'pri':''}" data-a="off" data-i="${(V.off||[]).indexOf(m)}">${esc(keyName(m))}</button>`;
  return h+pxHandGear(V)}
function pxMsgHTML(V){if(!G||!V)return '';if(PX.toast)return `<span class="warn">${esc(PX.toast)}</span>`;
  const s=decider();let h='';
  if(G.over)return `<b>${G.over.win?'Defused!':'BOOM!'}</b> ${esc(G.over.why||'')}`;
  if(UI.brief)return '<b>Read the job</b>, then Continue.';
  if(V.seat<0){if(passTo()>=0)return `Pass the device to <b>${esc(nm(passTo()))}</b>.`;return s>=0?`<b>${esc(nm(s))}</b> ${G.q?'is '+esc(doing(G.q)):'is thinking…'}`:'Watching the computer crew.'}
  if(pxMyTurn()){const sel=UI.sel;
    if(V.q&&V.q.who===V.seat)return 'Answer in the card.';
    if(sel&&sel.mode==='dual'&&!sel.tg.length&&(sel.tool||sel.two||sel.fu!=null))h=`<b>${esc(sel.tool?toolName(sel.tool):sel.two?toolName(sel.two):'Flipped wire')}</b>: `;
    return h+(PX.zoom?"Tap a glowing wire of this rack.":"<b>Your turn.</b> Tap a crewmate's wire.")}
  if(G.step==='claim'&&!G.q)return 'Who goes next? Claim it!';
  if(s>=0)return `<b>${esc(nm(s))}</b> ${isHuman(s)&&!G.q?'decides…':G.q&&G.q.who===s?'is '+esc(doing(G.q)):'is thinking…'}`;
  return 'Waiting…'}
function pxNarHTML(){return G&&G.prompt&&UI.rt&&G.clock-G.prompt.t<40?`<span class="last lg-prompt">Narrator: ${esc(G.prompt.say)}</span>`:''}
function pxLastHTML(V){if(!G||G.over||!UI.res||UI.res.turn<G.turn-1)return '';if(pxMyTurn()&&UI.myRes===UI.res)return '';
  const l=UI.res.lines.filter(x=>!/^Narrator/.test(x.t)).slice(-1)[0];if(!l)return '';return `<span class="last lg-${esc(l.c||'n')}">${esc(nice(l.t,V))}</span>`}
function pxStrip(){const ps=document.getElementById('ps');if(!ps||!PX.on)return;const V=UI.V;
  if(!G||!UI.started||!V){if(ps.innerHTML){ps.innerHTML='';PX.strip=''}return}
  if(!ps.firstChild||!ps.querySelector('.ps-rack')){ps.innerHTML='<div class="ps-top"><div class="ps-msg" role="status"></div></div><div class="ps-acts"></div><div class="ps-crew"></div><div class="ps-rack" data-owner=""></div><div class="ps-chips"></div>';PX.msg=PX.rack=PX.chips=PX.stat=PX.acts=PX.crew='';PX.mine=null}
  const set=(sel,key,html)=>{if(PX[key]!==html){const el=ps.querySelector(sel);const sl=el.scrollLeft;el.innerHTML=html;el.scrollLeft=sl;PX[key]=html}};
  const msg=pxMsgHTML(V)+(PX.toast?'':pxNarHTML()+pxLastHTML(V));set('.ps-msg','msg',msg);
  set('.ps-acts','acts',passTo()>=0||UI.brief?'':pxActsHTML(V));
  const rk=passTo()>=0?'':pxRackHTML(V);const el=ps.querySelector('.ps-rack');const own=V.seat>=0&&passTo()<0?String(V.seat):'';if(el.dataset.owner!==own)el.dataset.owner=own;set('.ps-rack','rack',rk);el.hidden=!rk;
  set('.ps-crew','crew',pxCrewHTML(V));
  set('.ps-chips','chips',passTo()>=0?'':pxChipsHTML(V));
  for(const sel of['.ps-rack','.ps-chips','.ps-crew','.ps-acts']){const e=ps.querySelector(sel);if(e)e.classList.toggle('of',e.scrollWidth>e.clientWidth+3)}
  const sh=pxStatHTML(V);for(const id of['barstat','hud']){const bs=document.getElementById(id);if(bs&&bs._h!==sh){bs._h=sh;bs.innerHTML=sh}}pxZB()}
setInterval(()=>{try{if(!PX.on||!G||!UI.started||!timedJob()||G.over||!UI.V)return;const c=clockLeft(knowledge(Math.max(0,UI.V.seat)));if(!c)return;for(const t of document.querySelectorAll('#pxtimer .tm'))t.textContent=fmt(c.left)}catch(e){}},500);
// ---------- pop-ups (live in the free zone: under the board in portrait, in the rail in landscape) ----------
function pxClone(html){const d=document.createElement('div');d.innerHTML=html;return d}
function pxCallHTML(V){const sel=UI.sel,L=V.legal;if(!sel||sel.mode!=='dual'||!sel.tg.length||!L)return null;const t=sel.tg[0];const step=sel.v==null?2:3;
  const many=sel.tg.length>1;const tgt=many?nm(ownerOf(t.st))+"'s wires "+sel.tg.map(x=>LET(x.k)).join(', '):wireName(t.st,t.k,V);
  const vs=dualVals(sel);let W=null,sl=null,best=null;if(UI.help){try{W=wwk(V)}catch(e){}if(W&&!many)sl=W.slots.find(x=>x.st===t.st&&x.k===t.k)||null}
  if(W&&W.suggestion&&W.suggestion.m&&W.suggestion.m.a==='dual'&&W.suggestion.m.st===t.st&&W.suggestion.m.ks&&W.suggestion.m.ks.includes(t.k)&&W.suggestion.m.v!=null)best=W.suggestion.m.v;
  if(best==null&&sl&&sl.prob){let bp=-1;for(const v of vs){const p=sl.prob[String(v==='Y'?'yellow':v)]||0;if(p>bp){bp=p;best=v}}if(bp<=0)best=null}
  const pct=v=>{if(!sl||!sl.prob)return '';const p=sl.prob[String(v==='Y'?'yellow':v)]||0;return Math.round(p*100)+'%'};
  let hint='';
  if(UI.help&&sl){const pr=Object.entries(sl.prob||{}).filter(x=>x[0]!=='red').sort((a,b)=>b[1]-a[1]).slice(0,4).filter(x=>x[1]>0);const tk=(G.st[t.st].w[t.k].tok||[]).map(q=>tok2kit(q)).filter(Boolean);
    hint=`<p class="ph-why">${sl.certain!=null?`<b>It must be ${esc(VNm(sl.certain==='yellow'?'Y':sl.certain))}</b>.`:pr.length?'It could be '+pr.map(([v,p])=>`<b>${esc(v==='yellow'?'Y':v)}</b> ${Math.round(p*100)}%`).join(', ')+'.':'No favourite yet.'}${sl.prob&&sl.prob.red>0?` Red: <b>${Math.round(sl.prob.red*100)}%</b>.`:''}${tk.length?' Token: '+esc(tk.join(', '))+'.':''}</p>`}
  else if(!UI.help)hint=`<button class="pb small ph-hintbtn" data-a="help">${ico('bulb')}Show hints</button>`;
  let vals=vs.map(v=>`<button class="vb ph-v${v==='Y'?' y':''}${sel.v===v?' sel':''}${best===v?' best':''}" data-a="v" data-v="${v}" aria-label="Say ${esc(VNm(v))}, you hold ${heldCount(V,v)}${best===v?', recommended':''}"><b>${v==='Y'?'Y':v}</b><small>you hold ${heldCount(V,v)}${pct(v)?' · '+pct(v):''}</small>${best===v?'<s>&#9733;</s>':''}</button>`).join('');
  if(!vs.length)vals='<p class="ph-why">You hold no wire that could match. Pick another wire or another action.</p>';
  let two='';if(sel.two&&sel.v!=null){two=`<p class="ph-sub">Second value (${esc(toolName(sel.two))}):</p><div class="ph-vals">${vs.filter(v=>v!==sel.v).map(v=>`<button class="vb ph-v${v==='Y'?' y':''}${sel.v2===v?' sel':''}" data-a="v2" data-v="${v}"><b>${v==='Y'?'Y':v}</b></button>`).join('')}</div>`}
  let go='';if(sel.v!=null){const m=buildDual(sel);const err=legal(m,V.seat);go=`<button class="pb pri big" data-a="dual"${err?' disabled':''}>${ico('cut')}Snip: say ${esc(VNm(sel.v))}${sel.v2!=null?' / '+esc(VNm(sel.v2)):''}</button>${err?`<p class="ph-why warn">${esc(err)}</p>`:''}`}
  else go=`<p class="ph-sub">Tap one of your wires, then Snip.</p>`;
  const T=noGear()?{}:L.tools;let tools='';for(const k of ['dd','pt3','eq3','eq5'])if(T[k])tools+=`<button class="pb${sel.tool===k?' on':''}" data-a="tool" data-t="${k}">${esc(toolName(k))}</button>`;
  for(const k of ['pt10','eq10'])if(T[k])tools+=`<button class="pb${sel.two===k?' on':''}" data-a="two" data-t="${k}">${esc(toolName(k))}</button>`;
  if(L.flip.length)tools+=`<button class="pb${sel.fu!=null?' on':''}" data-a="flipmode">Use my flipped wire</button>`;
  let other='';for(const m of L.solo)other+=`<button class="pb" data-a="solo" data-v="${m.v}" data-ep="${m.ep?1:''}" data-fu="${m.fu!=null?m.fu:''}">Solo cut ${esc(VNm(m.v))}</button>`;
  const groups={};for(const m of L.other.filter(m=>m.a!=='eq'&&!(noGear()&&m.a==='item')).concat(noGear()?[]:L.eq)){const k=moveKey(m);(groups[k]=groups[k]||[]).push(m)}
  for(const k in groups)other+=`<button class="pb" data-a="grp" data-k="${esc(k)}">${esc(keyName(groups[k][0]))}</button>`;
  return `<div class="ph-head"><b>Call a value</b><button class="ph-x" data-ph="pclose" aria-label="Close">&times;</button></div>
  <p class="ph-tgt">At <b>${esc(tgt)}</b>${sel.tool?' with the <b>'+esc(toolName(sel.tool))+'</b>':''}</p>${hint}
  <div class="ph-vals" data-owner="${V.seat}" data-up="1">${vals}</div>${two}<div class="ph-go">${go}</div>
  ${tools?`<div class="ph-row">${tools}</div>`:''}${other?`<p class="ph-sub">Or instead:</p><div class="ph-row">${other}</div>`:''}`}
function pxOwnHTML(){const pd=PX.pd;const V=UI.V;if(!pd||!V||V.seat<0)return null;const st=V.stands[pd.s];if(!st||!st.mine)return null;const x=st.slots[pd.k];if(!x)return null;
  const f=G.st[pd.s].w[pd.k];const nmw=wireName(pd.s,pd.k,V);const col=x.c==='y'?'yellow':x.c==='r'?'red':'blue';let body='';
  if(x.cut)body=`<p>This wire is already <b>cut</b>${x.v!=null?' ('+esc(VNm(x.v))+')':''}.</p>`;
  else if(x.v==null)body=`<p>This wire was <b>flipped</b>: you cannot see it. Your crew can see it, but you must say a value you hold when you cut it.</p>`;
  else if(x.c==='r')body=`<p>A <b>red</b> wire. Cutting it blows the bomb unless the job says otherwise. Keep it for the end.</p>`;
  else if(x.c==='y')body=`<p>A <b>yellow</b> wire. Yellow wires are cut with the yellow rules of this job.</p>`;
  else{const n=heldCount(V,x.v);body=`<p>A <b>blue ${esc(VNm(x.v))}</b>. You hold ${n} uncut wire${n===1?'':'s'} of this number${n>=2?': you can offer it as a call':''}.</p>`}
  const tk=(x.tok||[]).filter(q=>q.t!=='x').map(q=>tok2kit(q)).filter(Boolean);
  if(tk.length)body+=`<p>An <b>info token</b> sits in front of it: everyone knows it is ${esc(tk.join(', '))}.</p>`;
  if(x.not&&x.not.length&&!x.cut)body+=`<p class="tiny">Failed probes: it is not ${esc(x.not.map(VNm).join(', '))}.</p>`;
  const wcls=x.cut?'cut':(PX_CLS[x.c]||'u');
  return `<div class="ph-head"><b>${esc(nmw[0].toUpperCase()+nmw.slice(1))}</b><button class="ph-x" data-ph="pclose" aria-label="Close">&times;</button></div><div class="ph-info"><span class="pw big ${wcls}"><b>${esc(x.cut?'✓':pxWireText(x))}</b><i>${LET(pd.k)}</i></span><div class="ph-body">${body}</div></div>`}
function pxUseBtn(V,id,label){if(!V||V.seat<0)return '';try{const L=V.legal;if(L&&decider()===V.seat&&!G.q){if(!noGear()&&L.tools&&L.tools[id])return `<button class="pb pri big" data-a="tool" data-t="${id}">Use ${esc(label)}</button>`;
    if(L.eq.concat(L.other).some(m=>moveKey(m)===id))return `<button class="pb pri big" data-a="grp" data-k="${esc(id)}">Use ${esc(label)}</button>`}
  if(validMoves(V.seat).some(m=>moveKey(m)===id))return `<button class="pb pri big" data-a="offgrp" data-k="${esc(id)}">Use ${esc(label)}</button>`}catch(e){}return ''}
function pxChipHTML(){const pd=PX.pd,V=UI.V;if(!pd||!G||!V)return null;
  if(pd.k==='job'){const n=G.mission,M=MISSIONS[n];const chips=ruleChips(n);return `<div class="ph-head"><b>Job ${n}: ${esc(M.nm)}</b><button class="ph-x" data-ph="pclose" aria-label="Close">&times;</button></div><div class="ph-body"><p>${esc(BRIEFS[n]||'')}</p><p><b>The job:</b> ${esc(M.text)}</p>${chips.length?`<ul class="ph-ul">${chips.map(c=>`<li><b>${esc(c[1])}:</b> ${esc(c[2])}</li>`).join('')}</ul>`:''}<div class="ph-row"><button class="pb" data-gx="missiond">Full job card</button></div></div>`}
  if(pd.k==='crew'&&V.seat>=0){const q=V.seats[V.seat],C=q&&q.ch&&CHARS[q.ch];if(!C)return null;const IT=ITEMS[C.item];const mv=pxUseBtn(V,V.legal&&V.legal.tools&&V.legal.tools[C.item]?C.item:'item:'+C.item,IT?IT.n:'tool');
    return `<div class="ph-head"><b>${esc(C.n)}</b><button class="ph-x" data-ph="pclose" aria-label="Close">&times;</button></div><div class="ph-body"><p>${esc(C.text||C.t||'')}</p>${IT?`<p><b>${esc(IT.n)}:</b> ${esc(IT.text||IT.t||'')}</p>`:''}<p class="tiny">${q.chUsed?'Already used.':q.chDown?'Face down.':'Ready.'}</p><div class="ph-row">${mv}</div></div>`}
  if(pd.k==='eq'){const e=(V.eq||[])[pd.i];if(!e)return null;if(e.down||!e.id)return `<div class="ph-head"><b>Face-down gear</b><button class="ph-x" data-ph="pclose" aria-label="Close">&times;</button></div><div class="ph-body"><p>This card is face down. It turns up during the job.</p></div>`;
    const E=EQUIP[e.id];const mv=pxUseBtn(V,e.id,E.n);const tm={any:'Any time',turn:'On your turn',start:'Start of your turn',instant:'Instant'}[E.timing]||'';
    return `<div class="ph-head"><b>${esc(E.n)}</b><button class="ph-x" data-ph="pclose" aria-label="Close">&times;</button></div><div class="ph-info"><span class="eqb ${esc(e.st||'')}"><b>${E.v==='Y'?'Y':E.v}</b><small>${E.need} cut${E.need===1?'':'s'}</small></span><div class="ph-body"><p>${esc(E.text)}</p><p class="tiny">${esc(tm)} · unlocks after ${E.need} cut${E.need===1?'':'s'} of ${E.v==='Y'?'yellow':E.v} · <b>${e.st==='ready'?'ready':e.st==='used'?'used':'locked'}</b></p></div></div><div class="ph-row">${mv}</div>`}
  return null}
function pxSelPopHTML(V){const sel=UI.sel;if(!sel||!V||V.seat<0)return null;
  if(sel.mode==='multi'||sel.mode==='choose'||sel.mode==='flipown'||(sel.off&&sel.mode==='choose')){const src=pxClone(turnHTMLForSel(V)).firstElementChild;if(!src)return null;return `<div class="ph-head"><b>${sel.mode==='multi'?'Point at wires':sel.mode==='flipown'?'Flipped wire':'Choose'}</b><button class="ph-x" data-ph="pclose" aria-label="Close">&times;</button></div><div class="ph-card">${src.innerHTML.replace(/<h3[\s\S]*?<\/h3>/,'')}</div>`}
  return null}
function turnHTMLForSel(V){const sel=UI.sel;if(sel.mode==='choose')return chooseHTML(V);return turnHTML(V)}
function pxPopup(){const el=document.getElementById('ppop');if(!el)return;let h=null;const V=UI.V;
  if(PX.on&&G&&UI.started&&V&&!PX.card&&passTo()<0&&!UI.brief&&!G.over){
    const sel=UI.sel;
    if(sel&&sel.mode==='dual'&&sel.tg.length)h=pxCallHTML(V);
    else if(sel&&(sel.mode==='multi'||sel.mode==='choose'||sel.mode==='flipown'))h=pxSelPopHTML(V);
    else if(PX.pop==='own')h=pxOwnHTML();
    else if(PX.pop==='chip')h=pxChipHTML()}
  if(!h){if(!el.hidden){el.hidden=true;el.innerHTML='';PX.pops=''}if(PX.pop&&PX.on&&G&&!PX.card&&UI.V&&!UI.sel){PX.pop=null;PX.pd=null}return}
  if(h!==PX.pops){const fresh=el.hidden;const sc=el.scrollTop;PX.pops=h;el.innerHTML=h;el.hidden=false;el.classList.toggle('in',fresh);if(!fresh)el.scrollTop=sc}}
function pxPopClose(){PX.pop=null;PX.pd=null;PX.toast='';if(UI.sel&&!UI.sel.off){UI.sel=null;refresh();return}if(UI.sel&&UI.sel.off){UI.sel=null;refresh();return}pxAfter()}
// ---------- cards: briefing, pass, game over, question, coach tip, my result: ONE at a time, each with its button ----------
function pxResCard(V){if(!G||G.over||!V||V.seat<0)return null;const r=modeOf()==='solo'&&UI.myRes&&UI.myRes.turn>=G.turn-3?UI.myRes:null;
  if(r&&r!==PX.ackRes){const b=resBox(r,V);return {kind:'res',key:'res'+r.t,html:`<div class="res ${b.cls}" role="status"><p class="who">You played:</p>${b.big?`<big>${b.big}</big>`:''}${b.html}</div>${G.dial===1?'<div class="lastlife">&#9888; Last step on the fuse: the next miss is a BOOM!</div>':''}<div class="row"><button class="pb pri" data-ph="resok">Continue</button></div>`,r}}
  const r2=modeOf()==='hot'&&UI.res&&UI.res.turn>=G.turn-1&&UI.res.actor!==V.seat?UI.res:null;
  if(r2&&r2!==PX.ackRes){const b=resBox(r2,V);return {kind:'res',key:'res'+r2.t,html:`<div class="res ${b.cls}" role="status"><p class="who">${esc(nm(r2.actor))} played:</p>${b.big?`<big>${b.big}</big>`:''}${b.html}</div><div class="row"><button class="pb pri" data-ph="resok">Continue</button></div>`,r:r2}}
  return null}
function pxNeed(){if(!PX.on||!G||!UI.started)return null;const V=UI.V;if(!V)return null;
  if(G.over)return PX.ovHide!==G.over?{kind:'over',sel:'#main .card.over'}:null;
  if(UI.brief)return {kind:'brief',sel:'#main .card.brief'};
  if(passTo()>=0)return {kind:'pass',sel:'#main .card.pass'};
  if(V.seat>=0&&V.q&&V.q.who===V.seat&&V.q.opts)return {kind:'q',sel:'#main .card.q'};
  if(UI.tut&&UI.coach&&V.seat>=0&&!UI.brief){const c=document.querySelector('#coach .card.coach');if(c)return {kind:'coach',sel:'#coach .card.coach'}}
  const rc=pxResCard(V);if(rc)return rc;return null}
function pxCards(){const pc=document.getElementById('pc');if(!pc)return;const need=PX.on?pxNeed():null;
  if(!need){PX.card=null;if(!pc.hidden){pc.hidden=true;pc.innerHTML=''}return}
  let html=null;
  if(need.html)html=need.html;
  else{const all=document.querySelectorAll(need.sel);const src=all[all.length-1];if(src){const cl=src.cloneNode(true);for(const b of cl.querySelectorAll('[data-a=coach]'))b.textContent='Got it';
      if(need.kind==='over'){const r=cl.querySelector('.row')||(()=>{const x=document.createElement('div');x.className='row';cl.appendChild(x);return x})();const bt=document.createElement('button');bt.className='btn';bt.setAttribute('data-ph','dismiss');bt.textContent='See the table';r.appendChild(bt)}
      html=cl.outerHTML}}
  if(html==null){PX.card=null;pc.hidden=true;pc.innerHTML='';return}
  const key=need.kind+':'+(need.key||'')+':'+html.length;
  if(!PX.card||PX.card.kind!==need.kind||PX.card.html!==html){const fresh=pc.hidden||!PX.card||PX.card.kind!==need.kind;PX.card={kind:need.kind,html,r:need.r};pc.innerHTML='<div class="pc-in">'+html+'</div>';if(fresh){pc.classList.remove('in');void pc.offsetWidth;pc.classList.add('in');pc.scrollTop=0}}
  pc.hidden=false;
  if(PX.pop){PX.pop=null;PX.pd=null}}
// ---------- one pass after every refresh ----------
function pxAutoZoom(){if(!pxOn3()||!G||!UI.started||!pxMyTurn()||PX.zoom)return;const sel=UI.sel;
  // a gear card that needs one wire on the table: if the glowing wires all stand in one rack, glide there
  if(!sel||sel.mode!=='choose')return;const step=nextStep(sel);if(!step||!step.board)return;const rows=new Set();let one=null;
  for(const m of selRemaining(sel)){const si=m[step.board[0]],k=m[step.board[1]];if(ownerOf(si)===UI.V.seat)continue;const r=pxRowOf(si,k);if(r){rows.add(r.key);one={r,k}}}
  if(rows.size===1)pxZoomTo(one.r,one.r.from+one.k-0*one.k)}
function pxAfter(){if(!PX.on)return;try{pxCards();pxPopup();pxStrip();pxZB();pxAutoZoom()}catch(e){console.error(e)}}
// ---------- wiring (wrappers around the page's own functions) ----------
{const _refresh=refresh;refresh=function(){_refresh.apply(this,arguments);if(PX.on){if(PX.holder!==UI.holder){PX.holder=UI.holder;PX.pop=null;PX.pd=null;PX.toast='';if(PX.zoom){PX.zoom=null;pxCamApply(false)}}if(PX.zoom&&G&&(!UI.started||G.over)){PX.zoom=null;pxCamApply(false)}pxAfter()}};
 const _toast=toast;toast=function(t){if(!PX.on)return _toast(t);PX.toast=t;try{$('#live').textContent=t}catch(e){}pxStrip();clearTimeout(PX.tt);PX.tt=setTimeout(()=>{PX.toast='';pxStrip()},4000)};
 const _act=act;act=function(m,s){PX.toast='';PX.pop=null;PX.pd=null;const r=_act.apply(this,arguments);if(PX.on&&PX.zoom&&modeOf()==='hot'){PX.zoom=null;pxCamApply(false)}return r};
 const _aiHeld=aiHeld;aiHeld=function(){if(PX.on&&ANIM&&G&&!G.over&&!timedJob()&&!NET.on){const V=UI.V;if(V&&V.seat>=0&&modeOf()==='solo'&&pxResCard(V))return true}return _aiHeld.apply(this,arguments)};
 const _rs=renderSettings;renderSettings=function(){_rs.apply(this,arguments);if(!PX.on)return;const b=document.getElementById('setbody');if(b&&!b.querySelector('.ph-links'))b.insertAdjacentHTML('afterbegin',`<div class="ph-links row"><button class="btn" data-gx="logd">${ico('scroll')}Log</button><button class="btn" data-gx="rulesd">${ico('book')}How to play</button><button class="btn" data-gx="refd">${ico('cards')}Cards</button></div>`)};
 const _onPick=onPick;PX.orig=_onPick;onPick=function(p){if(!PX.on)return _onPick(p);pxPick(p)};
 const _startJob=startJob;startJob=function(){PX.zoom=null;PX.pop=null;PX.pd=null;PX.ackRes=null;PX.ovHide=null;PX.toast='';PX.card=null;const r=_startJob.apply(this,arguments);if(PX.on){pxCamApply(true);pxAfter()}return r}}
function pxPick(p){if(!G||!UI.started)return PX.orig(p);const V=UI.V;
  if(PX.card)return;                                                // a card is up: answer it first
  if(!p){if(PX.pop||(UI.sel&&UI.sel.mode==='dual'&&UI.sel.tg&&UI.sel.tg.length))pxPopClose();return}   // a tap on the empty table closes the pop-up
  const qMine=V&&V.seat>=0&&V.q&&V.q.who===V.seat&&V.q.opts;
  if(p.kind==='tile'&&p.id){const u=uOf(p.id);const f=u!=null&&findU(u);if(!f)return;
    const own=V&&V.seat>=0&&ownerOf(f.s)===V.seat;const sel=UI.sel;
    if(qMine)return PX.orig(p);
    if(sel&&(sel.mode==='choose'||sel.mode==='multi')){const row0=!own&&pxOn3()?pxRowOf(f.s,f.k):null;
      // a gear card / group action that needs wires: the first tap only glides to that rack (the wires are small in the overview), the next tap picks
      if(row0&&(!PX.zoom||PX.zoom.key!==row0.key)){PX.pop=null;PX.pd=null;sfx('click');pxZoomTo(row0,f.k);return}
      return PX.orig(p)}
    if(own){if(V.seat>=0){PX.pop='own';PX.pd={s:f.s,k:f.k};sfx('click');if(UI.sel&&UI.sel.mode==='dual'){UI.sel=null;refresh()}else pxAfter()}return}
    const row=pxRowOf(f.s,f.k);
    if(V&&V.seat<0){if(row&&pxOn3()){sfx('click');pxZoomTo(row,f.k)}return}   // watching: nothing to point at, but the zoom helps
    if(!pxOn3()||!row)return PX.orig(p);                             // 2D fallback board: the page's own tap
    PX.pop=null;PX.pd=null;
    if(!PX.zoom||PX.zoom.key!==row.key)pxZoomTo(row,f.k);
    // the tapped wire is selected at once when it may be pointed at (the pop-up opens); the camera is already on its way
    PX.orig(p);pxAfter();return}
  if(p.kind==='stand'||p.kind==='seat'){const rows=pxRows().filter(r=>+r.key.split(':')[0]===p.seat);
    const r=rows.find(r=>p.stand==null||+r.key.split(':')[1]===p.stand)||rows[0];if(r&&pxOn3()){sfx('click');PX.pop=null;PX.pd=null;pxZoomTo(r,null)}return}
  if(p.kind==='character'){const V2=UI.V;const q=V2&&V2.seat>=0?V2.seats.find(s=>s.pos===p.seat):null;if(q&&q.i===V2.seat){PX.pop='chip';PX.pd={k:'crew'};sfx('click');pxAfter()}else GX.show('geard');return}
  if(p.kind==='equipment'){const i=V&&V.eq?V.eq.findIndex((e,j)=>j===p.index):-1;if(i>=0){PX.pop='chip';PX.pd={k:'eq',i};pxAfter();return}}
  if(p.kind==='mission'){PX.pop='chip';PX.pd={k:'job'};pxAfter();return}
  return PX.orig(p)}
// taps on phone controls
document.addEventListener('click',e=>{if(!PX.on)return;const t=e.target.closest&&e.target.closest('[data-ph]');if(!t)return;const a=t.dataset.ph;e.stopPropagation();
  if(a==='pclose')pxPopClose();
  else if(a==='own'){PX.pop='own';PX.pd={s:+t.dataset.s,k:+t.dataset.k};PX.toast='';sfx('click');if(UI.sel&&UI.sel.mode==='dual'&&UI.sel.tg.length){UI.sel=null;refresh()}else pxAfter()}
  else if(a==='chip'){const k=t.dataset.k;if(PX.pop==='chip'&&PX.pd&&PX.pd.k===k&&String(PX.pd.i)===String(t.dataset.i)){PX.pop=null;PX.pd=null;pxAfter()}else{PX.pop='chip';PX.pd={k,i:t.dataset.i!=null?+t.dataset.i:null};if(UI.sel&&UI.sel.mode==='dual'&&UI.sel.tg.length)UI.sel=null;sfx('click');if(UI.sel&&UI.sel.off){}refresh()}}
  else if(a==='seat'){const pp=+t.dataset.p;const row=pxRows().find(r=>+r.key.split(':')[0]===pp);sfx('click');if(!row||!pxOn3()){PX.toast=row?'':(+t.dataset.s===(UI.V&&UI.V.seat)?'That is your own rack: the wires under the table.':'');pxStrip();return}
    if(PX.zoom&&+PX.zoom.key.split(':')[0]===pp){pxZoomOut()}else{PX.pop=null;PX.pd=null;pxZoomTo(row,null)}}
  else if(a==='zprev')pxCycle(-1);else if(a==='znext')pxCycle(1);else if(a==='zexit'){sfx('click');pxZoomOut()}
  else if(a==='zpanl'){pxPan(-(((PXK()&&PXK().w)||360)*.5)/(PX.zoom&&PX.zoom.ppu||40))}
  else if(a==='zpanr'){pxPan((((PXK()&&PXK().w)||360)*.5)/(PX.zoom&&PX.zoom.ppu||40))}
  else if(a==='resok'){const c=PX.card;if(c&&c.r)PX.ackRes=c.r;UI.myAck=true;UI.aiNotBefore=0;sfx('click');PX.zoom=null;pxCamApply(false);refresh()}
  else if(a==='dismiss'){if(PX.card&&PX.card.kind==='over')PX.ovHide=G.over;sfx('click');pxAfter()}
  else if(a==='showover'){PX.ovHide=null;pxAfter()}},true);
// the page's own Continue buttons for the briefing / pass / tips also go through data-a: nothing to add. Esc closes a pop-up before anything else.
document.addEventListener('keydown',e=>{if(!PX.on||e.key!=='Escape'||GX.open)return;if(document.getElementById('ppop')&&!document.getElementById('ppop').hidden){pxPopClose();e.stopPropagation();return}if(PX.zoom){pxZoomOut();e.stopPropagation()}},true);
// a tap on the empty table (not a wire, rack or sign) while zoomed: back to the whole table is the x button; a tap outside pop-up closes nothing else
window.addEventListener('resize',()=>{const was=PX.on;pxApply();if(PX.on||was){PX.strip='';PX.msg=PX.rack=PX.chips='';PX.pops='';try{if(G&&UI.started)refresh()}catch(e){}}});
document.addEventListener('DOMContentLoaded',()=>{try{if(PX.on){const K=PXK();pxHook();for(const b of document.querySelectorAll('.gx-bar .gx-ibtn')){if(!b.getAttribute('aria-label')){const t=(b.textContent||'').trim()||b.title;if(t)b.setAttribute('aria-label',t)}}GX.onResize(()=>{if(PX.on){try{pxCamApply(true);pxZB()}catch(e){}}});}}catch(e){}});
