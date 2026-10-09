/* ============================================================ 13 · HUD */
const mapC=$('#map'),mg=mapC.getContext('2d');let mapBG=null,mapXf=null;
function buildMap(){const Z=300,[c,g]=cv(Z,Z);let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(let i=0;i<TF.N;i++){const x=TF.P[i*3],z=TF.P[i*3+2];x0=Math.min(x0,x);x1=Math.max(x1,x);z0=Math.min(z0,z);z1=Math.max(z1,z)}
  const sc=270/Math.max(x1-x0,z1-z0),ox=Z/2-(x0+x1)/2*sc,oz=Z/2-(z0+z1)/2*sc;mapXf=(x,z)=>[ox+x*sc,oz+z*sc];
  g.lineJoin=g.lineCap='round';for(const[w,col]of[[38,'rgba(0,10,25,.8)'],[24,'rgba(120,230,255,.95)']]){g.lineWidth=w;g.strokeStyle=col;g.beginPath();let pen=false;for(let i=0;i<=TF.N;i+=2){const k=i%TF.N;const[x,y]=mapXf(TF.P[k*3],TF.P[k*3+2]);if(inGapF(k*TF.ds)){pen=false;continue}pen?g.lineTo(x,y):g.moveTo(x,y);pen=true}g.stroke()}
  const[sx,sy]=mapXf(TF.P[0],TF.P[2]);g.fillStyle='#ffd12c';g.fillRect(sx-16,sy-5,32,10);mapBG=c}
function drawMap(){mg.clearRect(0,0,300,300);mg.drawImage(mapBG,0,0);for(const s of ships){if(s.dead>0||s.eliminated||s===pl)continue;const p=s.mesh.position,[x,y]=mapXf(p.x,p.z);mg.fillStyle=s.team.c1;mg.strokeStyle='#021018';mg.lineWidth=5;mg.beginPath();mg.arc(x,y,17,0,7);mg.fill();mg.stroke()}
  if(pl&&!pl.eliminated){const p=pl.mesh.position,[x,y]=mapXf(p.x,p.z);mg.fillStyle='#ffd12c';mg.strokeStyle='#021018';mg.lineWidth=7;mg.beginPath();mg.arc(x,y,27,0,7);mg.fill();mg.stroke()}}
let msgTimer=0;function say(a,b,t=1){const m=$('#msg'),sb=$('#sub'),rm=state==='roam';m.classList.toggle('roamMsg',rm);sb.classList.toggle('roamMsg',rm);if(a!==''){m.textContent=a;m.style.opacity=1;m.classList.remove('pop');void m.offsetWidth;m.classList.add('pop')}else m.style.opacity=0;sb.textContent=b||'';sb.style.opacity=b?1:0;msgTimer=t}
let stIndEl=null;function drawStInd(v){stIndEl=stIndEl||document.querySelector('#stInd i');if(stIndEl)stIndEl.style.transform=`translateX(${(v*55).toFixed(1)}px)`}
function buzz(ms){try{if(TOUCH.used&&navigator.vibrate)navigator.vibrate(ms)}catch(e){}}
function flashHud(){buzz(35);const f=$('#flash');f.style.opacity=1;hitFx=1;setTimeout(()=>f.style.opacity=0,160)}
const feedEl=$('#feed');function feed(label,pts,col){const d=document.createElement('div');d.style.color=col;d.innerHTML=label+(pts?`<small>+${pts}</small>`:'');feedEl.prepend(d);const mx=innerHeight<520?2:4;while(feedEl.children.length>mx)feedEl.lastChild.remove();setTimeout(()=>d.remove(),innerHeight<520?1400:2000)}
function feedClear(){feedEl.innerHTML=''}
$('#boostCells').innerHTML='<i></i>'.repeat(10);$('#hullCells').innerHTML='<i></i>'.repeat(8);
const hudEl={pos:$('#pos'),lap:$('#lap'),tLap:$('#tLap'),tBest:$('#tBest'),tRace:$('#tRace'),tGhost:$('#tGhost'),spd:$('#spd'),bar:$('#spdbar i'),chip:$('#itemChip'),sec:$('#sector'),obj:$('#obj'),bc:$('#boostCells'),hc:$('#hullCells')};let lastHud={};
function setT(el,k,v){if(lastHud[k]!==v){lastHud[k]=v;el.innerHTML=v}}
function cells(el,key,n,on,extra){const k=on+'|'+extra;if(lastHud[key]===k)return;lastHud[key]=k;el.className='cells '+extra;[...el.children].forEach((c,i)=>c.className=i<on?'on':'')}
const duelAt=d=>{const f=duelGhost.f;let lo=0,hi=f.length/2-1;while(lo<hi){const m=(lo+hi)>>1;if(f[m*2]<d)lo=m+1;else hi=m}return lo/20};
function updHud(){if(!pl)return;const n=ships.filter(active).length;
  if(RC.type==='zone'){setT(hudEl.pos,'pos',`${pad2(RC.zone.k)}<small> ZONE</small>`);setT(hudEl.lap,'lap',(pl.dist/1000).toFixed(2)+' KM')}
  else if(RC.type==='duel'){const ahead=!duelGhost||pl.dist>=duelGhost.f[Math.min(duelGhost.f.length-2,Math.floor(raceT*20)*2)];setT(hudEl.pos,'pos',duelGhost?`${ahead?'01':'02'}<small> / GHOST</small>`:'SOLO')}
  else setT(hudEl.pos,'pos',RC.type==='tt'?'TT':RC.type==='race'||RC.type==='elim'?`${ord(pl.place)}<small>/${n}</small>`:`${pad2(pl.place)}<small> / ${pad2(n)}</small>`);
  if(RC.type!=='zone')setT(hudEl.lap,'lap',RC.type==='elim'||RC.type==='arena'||lapAttack()?`LAP ${Math.max(1,pl.lap+1)}`:`LAP ${clamp(pl.lap+1,1,RC.laps)} / ${RC.laps}`);
  setT(hudEl.tLap,'tl',fmt(Math.max(0,raceT-pl.lapStart)));setT(hudEl.tBest,'tb',fmt(ghost?Math.min(ghost.t,pl.best):pl.best));setT(hudEl.tRace,'tr',fmt(raceT));
  if(duelGhost&&state==='race'){const d=raceT-duelAt(pl.dist);setT(hudEl.tGhost,'tg',(d>=0?'+':'−')+Math.abs(d).toFixed(2))}
  else if(ghost&&pl.lap>=0){const lt=raceT-pl.lapStart;const my=mod(pl.dist,TD.L);let j=0;while(j<ghost.f.length&&ghost.f[j]<my)j+=2;const d=lt-j/2/20;setT(hudEl.tGhost,'tg',(d>=0?'+':'−')+Math.abs(d).toFixed(2))}
  setT(hudEl.spd,'spd',`${String(Math.round(pl.v*(SET.units==='mph'?2.237:3.6))).padStart(3,'0')}<small>${SET.units==='mph'?'MPH':'KPH'}</small>`);hudEl.bar.style.width=clamp(pl.v/(pl.stats.top*1.3)*100,0,100)+'%';
  cells(hudEl.bc,'bc',10,Math.ceil(pl.bm/10-.05),pl.nitro?'nitro':'');cells(hudEl.hc,'hc',8,Math.ceil(clamp(pl.hull,0,100)/12.5),pl.hull<30?'crit':'');
  {const now=performance.now(),spin=pl.item&&now<itemSpinUntil,k=spin?ITEM_KEYS[Math.floor(now/70)%ITEM_KEYS.length]:pl.item||'',key=k+(spin?'s':'');if(key!==itemShown){itemShown=key;const ib=$('#itemBox');ib.classList.toggle('full',!!k);ib.classList.toggle('spin',!!spin);ib.querySelector('img').src=k?itemIcon(k):'data:,';ib.querySelector('span').textContent=k&&!spin?ITEMS[k].name:'';$('#tF').style.backgroundImage=k&&!spin?`url(${itemIcon(k)})`:'';if(k&&!spin&&pl.item)AU.sfx&&0}}
  const it=pl.item?ITEMS[pl.item]:null;setT(hudEl.chip,'it',pl.shield>0?'SHIELD '+pl.shield.toFixed(1):it?it.name+' · SPACE':'NO WEAPON');hudEl.chip.className=it||pl.shield>0?'full':'';hudEl.chip.style.setProperty('--c',it?it.col:'#31f5c4');
  setT(hudEl.sec,'sec',TD.SEC[frameAt(TD,pl.dist,F2).i]+(pl.wrong>1?' · WRONG WAY':''));
  let obj='';if(RC.type==='elim'&&state==='race')obj=`ELIMINATION IN ${Math.ceil(elimT)}`;
  else if(RC.type==='zone')obj=`NEXT ZONE ${Math.max(0,Math.ceil(RC.zone.next-pl.dist))} M · ${RC.zone.mul.toFixed(2)}×`;
  else if(RC.jn)obj=pl.dead>0&&pl.after>0?`AFTERTOUCH · STEER · ${eur(RC.jn.value)}`:`DAMAGE ${eur(RC.jn.value)} · GOLD ${eur(320000)}${RC.jn.boom?'':' · BOOST = CRASHBREAKER'}`;else if(RC.type==='arena')obj=`LIVES ${'▲'.repeat(Math.max(0,pl.lives))}${'△'.repeat(Math.max(0,3-pl.lives))} · ${n} LEFT · ${Math.floor(RC.time/60)}:${pad2(Math.floor(RC.time%60))}`;else if(RC.ev&&RC.ev.med==='takedowns')obj=`TAKEDOWNS ${pl.takedowns} · GOLD ${RC.ev.m[0]}`;
  else if(RC.ev&&RC.ev.med==='time'){const t=raceT,m=RC.ev.m;obj=t<m[0]?`GOLD −${fmt(m[0]-t)}`:t<m[1]?`SILVER −${fmt(m[1]-t)}`:t<m[2]?`BRONZE −${fmt(m[2]-t)}`:'NO MEDAL TIME'}
  setT(hudEl.obj,'obj',obj);drawMap()}

/* ============================================================ 14 · input, menu, loop */
const K={};let pressed={};const tapT={};
addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)&&(state==='race'||state==='countdown'||state==='finished'))e.preventDefault();AU.init();
  if(e.repeat){K[e.code]=true;return}K[e.code]=true;
  
  if(state==='countdown'&&(e.code==='ArrowUp'||e.code==='KeyW')&&thrPressT==null)thrPressT=cdT;
  if(state==='countdown'||state==='race'||state==='finished'){if(e.code==='Space')pressed.fire=true;if(e.code==='KeyC')cycleCam();if(e.code==='KeyP'||e.code==='Escape')togglePause();if(e.code==='KeyR'&&!paused)startRace();
    const d={ArrowLeft:-1,KeyA:-1,ArrowRight:1,KeyD:1}[e.code];if(d){const now=performance.now();if(tapT[d]&&now-tapT[d]<280){pressed.roll=d;tapT[d]=0}else tapT[d]=now}}
  else if(state==='menu'){if(e.code==='Enter'&&document.activeElement?.tagName!=='BUTTON')startRace()}
  else if(state==='results'&&e.code==='Escape')toMenu()});
addEventListener('keydown',e=>{if(!$('#gbx').hidden){if(e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();gbClose(false)}return}if(e.code==='KeyH'&&(state==='roam'||state==='race')){hornPlay();return}if(state==='roam'&&CM.on)return;if(state==='roam'){if(RO.story&&(e.code==='Enter'||e.code==='Escape'||e.code==='Space')){e.preventDefault();e.stopImmediatePropagation();storyClose();return}if(e.code==='Enter'&&RO.card){e.preventDefault();roamGo()}else if(e.code==='Enter'&&RO.pm){e.preventDefault();roamPromptOpen()}else if(e.code==='KeyM'){toggleMap()}else if(e.code==='KeyT'){cycleVehicle()}else if(e.code==='KeyC'){roamCamCycle()}else if(e.code==='KeyJ'){RO.jOpen?journalClose():journalOpen()}else if(e.code==='KeyP'){togglePause()}else if(e.code==='KeyR'&&!RO.pOpen&&!RO.card&&!RO.jOpen){if(RO.ch)qvRestart();else if(qvResOpen())qvRetry(0)}else if(e.code==='Space'){e.preventDefault();pressed.fire=true}else if(e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();if(!$('#settings').hidden)closeSettings();else if(!$('#profile').hidden)$('#profile').hidden=true;else if(RO.jOpen)journalClose();else if(RO.mapOpen)toggleMap(false);else if(RO.card){RO.card=null;RO.cool=2;$('#roamCard').hidden=true}else if(RO.sp){sprintEnd();say('','SPRINT CANCELLED',1)}else if(RO.pOpen)roamPauseClose();else if(qvResOpen()){$('#chRes').hidden=true;$('#chRes').classList.remove('qbtn')}else roamPauseOpen()}}},true);
addEventListener('keydown',e=>{if(e.code==='Escape'&&!$('#settings').hidden){e.stopImmediatePropagation();closeSettings()}},true);
addEventListener('keyup',e=>{K[e.code]=false});
addEventListener('blur',()=>{for(const k in K)K[k]=false;if(state==='race'||state==='countdown')togglePause(true)});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&(state==='race'||state==='countdown'))togglePause(true);else if(document.hidden&&state==='roam'&&pl){AU.engine(pl,0,false);AU.scrape(false)}});
const SENS=()=>{const i=clamp((SET.sens|0)-1,0,4);return{lat:[9,11.5,14,17,20.5][i],ramp:[2.3,2.8,3.4,4.3,5.4][i],tilt:[27,22,18,14.5,11.5][i],drag:[1.3,1.15,1,.85,.72][i]}};
const TILT={v:0,deg:0,f:null,zero:0,ok:false,asked:false};
function tiltRead(e){const g=e.accelerationIncludingGravity;if(!g||g.x==null)return;TILT.ok=true;const ang=((screen.orientation&&screen.orientation.angle)??window.orientation??0)%360;
  const sx=ang===90?g.y:(ang===270||ang===-90)?-g.y:-g.x;const deg=Math.asin(clamp(sx/9.81,-1,1))*57.3*(SET.tiltInv==='on'?-1:1);
  TILT.f=TILT.f==null?deg:TILT.f+(deg-TILT.f)*.25;const d=TILT.f-TILT.zero,m=Math.max(0,Math.abs(d)-2.5);TILT.v=Math.sign(d)*Math.min(1,Math.pow(m/SENS().tilt,1.2))}
function tiltZero(){if(TILT.f!=null)TILT.zero=clamp(TILT.f,-25,25)}
function tiltOn(){if(TILT.asked)return;TILT.asked=true;const go=()=>addEventListener('devicemotion',tiltRead);
  if(window.DeviceMotionEvent&&typeof DeviceMotionEvent.requestPermission==='function')DeviceMotionEvent.requestPermission().then(r=>{if(r==='granted')go()}).catch(()=>{});else go()}
const TOUCH={dir:0,bz:null,lastTap:{t:-9,d:0},on:false,used:false,brake:false,boost:false,steer:0,target:0,sid:null,lock:0,x0:0,cx:0,cy:0,t0:0,flick:false};
function tb(id,down,up){const el=$(id);let on=false;const dn=e=>{AU.init();TOUCH.on=TOUCH.used=true;el.classList.add('down');if(!on){on=true;down(e)}},uf=e=>{el.classList.remove('down');if(on){on=false;up()}};el.addEventListener('touchstart',e=>{e.preventDefault();dn(e)},{passive:false});el.addEventListener('touchend',e=>{e.preventDefault();uf(e)},{passive:false});el.addEventListener('touchcancel',uf);el.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')return;try{el.setPointerCapture(e.pointerId)}catch(_){}dn(e)});el.addEventListener('pointerup',uf);el.addEventListener('pointercancel',uf);el.addEventListener('lostpointercapture',uf)}
if(matchMedia('(pointer:coarse)').matches){TOUCH.on=true;document.body.classList.add('touch')}
// analog steering pad: the rail appears under the thumb, the knob follows the drag; a quick flick rolls
const SZ=$('#steerZone'),SR=$('#steerRail'),SK=$('#steerKnob'),SH=$('#steerHint');const steerW=()=>({low:165,normal:130,high:100})[SET.steer]*SENS().drag;
function steerDraw(dx){SR.style.left=SH.style.left=TOUCH.cx+'px';SR.style.top=SH.style.top=SK.style.top=TOUCH.cy+'px';SK.style.left=(TOUCH.cx+clamp(dx,-steerW(),steerW()))+'px'}
function steerHome(){const r=SZ.getBoundingClientRect();if(!r.width)return;TOUCH.cx=Math.min(150,r.width*.42);TOUCH.cy=r.height-Math.min(64,r.height*.3);steerDraw(0)}
SZ.addEventListener('touchstart',e=>{e.preventDefault();AU.init();TOUCH.on=TOUCH.used=true;if(TOUCH.sid!=null)return;const t=e.changedTouches[0],r=SZ.getBoundingClientRect();
  TOUCH.sid=t.identifier;TOUCH.target=0;TOUCH.x0=t.clientX;TOUCH.cx=clamp(t.clientX-r.left,80,r.width-30);TOUCH.cy=clamp(t.clientY-r.top,28,r.height-28);TOUCH.t0=e.timeStamp;TOUCH.flick=false;TOUCH.steer=0;SZ.classList.add('on','used');steerDraw(0)},{passive:false});
SZ.addEventListener('touchmove',e=>{e.preventDefault();for(const t of e.changedTouches){if(t.identifier!==TOUCH.sid)continue;const dx=t.clientX-TOUCH.x0;const a=Math.min(1,Math.max(0,Math.abs(dx)-8)/steerW());TOUCH.target=Math.sign(dx)*Math.pow(a,1.6);steerDraw(dx);
  if(!TOUCH.flick&&Math.abs(dx)>110&&e.timeStamp-TOUCH.t0<150){TOUCH.flick=true;pressed.roll=Math.sign(dx)}}},{passive:false});
const steerEnd=e=>{for(const t of e.changedTouches)if(t.identifier===TOUCH.sid){TOUCH.sid=null;TOUCH.target=0;TOUCH.lock=0;SZ.classList.remove('on');steerHome()}};
SZ.addEventListener('touchend',steerEnd);SZ.addEventListener('touchcancel',steerEnd);addEventListener('resize',()=>{if(TOUCH.sid==null)steerHome()});
const BZ=$('#btnZone'),TL=$('#tL'),TR=$('#tR');
function bzSide(t){const r=TR.getBoundingClientRect(),l=TL.getBoundingClientRect();return t.clientX<(l.right+r.left)/2?-1:1}
function bzSet(d){if(d&&d!==TOUCH.dir&&SET.touch==='buttons')TOUCH.kick=d;TOUCH.dir=d;TL.classList.toggle('down',d<0);TR.classList.toggle('down',d>0)}
BZ.addEventListener('touchstart',e=>{e.preventDefault();AU.init();TOUCH.on=TOUCH.used=true;const t=e.changedTouches[0];if(TOUCH.bz!=null)return;TOUCH.bz=t.identifier;const d=bzSide(t);
  TOUCH.lastTap={t:e.timeStamp,d};bzSet(d)},{passive:false});
BZ.addEventListener('touchmove',e=>{e.preventDefault();for(const t of e.changedTouches)if(t.identifier===TOUCH.bz)bzSet(bzSide(t))},{passive:false});
const bzEnd=e=>{for(const t of e.changedTouches)if(t.identifier===TOUCH.bz){TOUCH.bz=null;bzSet(0)}};BZ.addEventListener('touchend',bzEnd);BZ.addEventListener('touchcancel',bzEnd);
{let bp=null;const pe=e=>{if(bp===e.pointerId){bp=null;if(TOUCH.bz==null)bzSet(0)}};BZ.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'||bp!=null)return;bp=e.pointerId;try{BZ.setPointerCapture(e.pointerId)}catch(_){}AU.init();TOUCH.on=TOUCH.used=true;bzSet(bzSide(e))});BZ.addEventListener('pointermove',e=>{if(e.pointerId===bp)bzSet(bzSide(e))});BZ.addEventListener('pointerup',pe);BZ.addEventListener('pointercancel',pe);BZ.addEventListener('lostpointercapture',pe)}
addEventListener('touchstart',()=>{if(SET.touch==='tilt')tiltOn()},{passive:true});
tb('#tP',()=>togglePause(),()=>{});
tb('#tB',e=>{const n=e&&e.timeStamp||performance.now();if(TOUCH.park){parkSet(false);TOUCH.bT=n;return}if(state==='roam'&&n-(TOUCH.bT||-1e9)<320&&Math.abs(RO.v)<4.2){parkSet(true);TOUCH.bT=-1e9;return}TOUCH.bT=n;TOUCH.brake=true},()=>TOUCH.brake=false);tb('#tG',()=>{TOUCH.gas=true;if(TOUCH.park)parkSet(false)},()=>TOUCH.gas=false);tb('#tD',()=>TOUCH.hb=true,()=>TOUCH.hb=false);tb('#tF',()=>pressed.fire=true,()=>{});tb('#tN',()=>TOUCH.boost=true,()=>TOUCH.boost=false);
addEventListener('touchstart',()=>{TOUCH.on=true;document.body.classList.add('touch')},{passive:true});
{const unlock=()=>{try{if(navigator.audioSession)navigator.audioSession.type='playback'}catch(e){}AU.init();const a=AU.a;if(!a)return;if(a.state!=='running')a.resume();try{const b=a.createBuffer(1,1,22050),s=a.createBufferSource();s.buffer=b;s.connect(a.destination);s.start(0)}catch(e){}if(!AU.tag){try{const t=AU.tag=new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=');t.setAttribute('playsinline','');t.play().catch(()=>{})}catch(e){}}if(a.state==='running'){removeEventListener('touchend',unlock,true);removeEventListener('click',unlock,true)}};addEventListener('touchend',unlock,true);addEventListener('click',unlock,true);document.addEventListener('visibilitychange',()=>{if(!document.hidden&&AU.a&&AU.a.state!=='running'){addEventListener('touchend',unlock,true);addEventListener('click',unlock,true)}})}
function parkSet(on){TOUCH.park=!!on;TOUCH.brake=false;document.body.classList.toggle('parked',TOUCH.park);const b=$('#tB');if(b)b.textContent=TOUCH.park?'GO ▶':'BRAKE';const c=$('#roamPark');if(c)c.hidden=!TOUCH.park;if(on)AU.sfx&&AU.sfx('pick')}
function togglePause(force){if(state==='roam'){if(!$('#settings').hidden){closeSettings();return}if($('#roamPause')){if($('#roamPause').hidden)roamPauseOpen();else roamPauseClose();return}RO.frozen=true;openSettings();return}if(!(state==='race'||state==='countdown'||state==='finished'))return;paused=force===true?true:!paused;$('#pause').hidden=!paused;if(paused){AU.engine(pl,0,false);AU.scrape(false);$('#resBtn').focus()}}
$('#resBtn').onclick=()=>togglePause(false);$('#rstBtn').onclick=()=>{paused=false;$('#pause').hidden=true;startRace()};$('#quitBtn').onclick=()=>{paused=false;$('#pause').hidden=true;if(RO.fromRoam)enterRoam(RO.lastMark);else toMenu()};
$('#rcGo').onclick=roamGo;$('#careerBtn').onclick=showSlots;$('#slotX').onclick=()=>$('#slots').hidden=true;$('#storyGo').onclick=storyClose;$('#roamVeh').onclick=cycleVehicle;$('#roamMapBtn').onclick=()=>toggleMap();$('#roamFT').onclick=e=>{e.stopPropagation();fastTravel(RO.ftSel)};$('#roamMapX').onclick=()=>toggleMap(false);
{const C=$('#roamMapC'),pts=new Map();let moved=0,pinch0=0,z0=0,t0=0,mt=0;const pos=e=>{const r=C.getBoundingClientRect();return[(e.clientX-r.left)*DPR2(),(e.clientY-r.top)*DPR2()]};
  C.addEventListener('pointerdown',e=>{try{C.setPointerCapture(e.pointerId)}catch(_){}PIN_menuClose();pts.set(e.pointerId,[e.clientX,e.clientY]);moved=0;if(pts.size===1){t0=e.timeStamp;mt=0}else mt=1;if(pts.size===2){const[a,b]=[...pts.values()];pinch0=Math.hypot(a[0]-b[0],a[1]-b[1]);z0=RO.mapZ}});
  C.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;const p0=pts.get(e.pointerId),dx=e.clientX-p0[0],dy=e.clientY-p0[1];pts.set(e.pointerId,[e.clientX,e.clientY]);
    if(pts.size===2){const[a,b]=[...pts.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(pinch0){RO.mapZ=clamp(z0*d/pinch0,RO.mapZmin||.4,10);moved=99;mapRedraw()}return}
    moved+=Math.abs(dx)+Math.abs(dy);if(moved>(e.pointerType==='mouse'?6:12)&&RO.mapC){const sc=SM_ON&&RO.mapSc?RO.mapSc/DPR2():Math.min(C.width/(HX1-HX0),C.height/(HZN-HZT))*RO.mapZ/DPR2();RO.mapC.x+=dx/sc;RO.mapC.z+=dy/sc;mapRedraw()}});
  const up=e=>{const was=pts.size;pts.delete(e.pointerId);if(pts.size<2)pinch0=0;const tch=e.pointerType!=='mouse';if(was===1&&!mt&&e.type!=='pointercancel'&&e.button!==2&&moved<=(tch?12:6)&&RO.mapP){const[x,y]=pos(e);if(PIN_S.menu)return;if(tch&&e.timeStamp-t0>=550){PIN_menu(x,y,e.clientX,e.clientY);return}if(PIN_hit(x,y)){PIN_clear();ftShow(null);return}let best=null,bd=28*DPR2();for(const m of RO.marks){if(!markKnown(m))continue;const[px,pz]=RO.mapP(m.x,m.z),d=Math.hypot(px-x,pz-y);if(d<bd){bd=d;best=m}}if(best){PIN_clear(1);RO.wp=best;pickAdd(best);drawRoamMap();say('',('WAYPOINT · '+markTitle(best)).toUpperCase(),1.2)}ftShow(best);if(!best)PIN_tap(x,y)}};
  C.addEventListener('contextmenu',e=>{e.preventDefault();if(pts.size>1||moved>12)return;const[x,y]=pos(e);PIN_menu(x,y,e.clientX,e.clientY)});
  C.addEventListener('pointerup',up);C.addEventListener('pointercancel',up);C.addEventListener('wheel',e=>{e.preventDefault();RO.mapZ=clamp((RO.mapZ||3)*(e.deltaY<0?1.2:1/1.2),RO.mapZmin||.4,10);mapRedraw()},{passive:false});
  document.querySelectorAll('#roamMapZ button').forEach(b=>b.onclick=()=>{const z=+b.dataset.z;if(z)RO.mapZ=clamp((RO.mapZ||3)*z,RO.mapZmin||.4,10);else{RO.mapC={x:RO.x,z:RO.z};RO.mapZ=3}drawRoamMap()})}$('#rcNo').onclick=()=>{RO.card=null;RO.cool=2;$('#roamCard').hidden=true};$('#roamExit').onclick=roamPauseOpen;$('#gbSave').onclick=()=>gbClose(true);$('#gbMenuBtn').onclick=()=>gbOpen();$('#gbBack').onclick=()=>gbClose(false);$('#gbStock').onclick=()=>{store.set('mho_build',null);GB.d=null;gbClose(false);if(state==='roam'){roamSavePos();enterRoam()}};document.querySelectorAll('#gbx .gbTabs button').forEach(b=>b.onclick=()=>{GB.tab=b.dataset.t;gbRender()});$('#roamHorn').onclick=()=>hornPlay();$('#roamCamBtn').onclick=()=>roamCamCycle();$('#roamLogBtn').onclick=()=>journalOpen();$('#roamSetBtn').onclick=()=>{if(state==='roam'&&$('#settings').hidden){RO.frozen=true;openSettings()}};$('#journalX').onclick=()=>journalClose();document.querySelectorAll('#journal .jt button').forEach(b=>b.onclick=()=>{RO.jTab=b.dataset.t;journalRender()});$('#tutSkip').onclick=e=>{e.stopPropagation();tutDone(false)};$('#roamPrompt').onclick=()=>roamPromptOpen();$('#roamTut').onclick=()=>{RO.tutMin=false;RO.tutShow=0};$('#roamEv').onclick=()=>{RO.jTab='todo';journalOpen()};$('#roamBack').onclick=()=>enterRoam(RO.lastMark);
$('#againBtn').onclick=startRace;$('#menuBtn').onclick=toMenu;$('#nextBtn').onclick=()=>{if(RC.season||RC.cup){startRace();return}evIdx=Math.min(EVENTS.length-1,evIdx+1);store.set('mho_ev',evIdx);startRace()};
$('#muteBtn').onclick=()=>{AU.init();AU.toggle()};
function credShow(on){$('#credBox').hidden=!on;$('#setBody').hidden=on;$('#setKeys').hidden=on;$('#setCred').textContent=on?'SETTINGS':'CREDITS'}
function openSettings(){$('#settings').hidden=false;credShow(false);buildSettings();$('#setDone').focus()}
function closeSettings(){$('#settings').hidden=true;RO.frozen=!!(RO.jOpen||RO.pOpen);camSnap=true;if(paused)$('#resBtn').focus()}
function buildSettings(){const B=$('#setBody');B.innerHTML='';
  const seg=(label,key,opts,after)=>{const el=document.createElement('div');el.className='seg';el.innerHTML=`<span>${label}</span>`;for(const[v,l]of opts){const b=document.createElement('button');b.textContent=l;b.setAttribute('aria-pressed',SET[key]===v);b.onclick=()=>{SET[key]=v;saveSet();if(after)after();buildSettings()};el.appendChild(b)}B.appendChild(el)};
  const sl=(label,key)=>{const el=document.createElement('label');el.className='sl';el.innerHTML=`<span>${label}</span><input type="range" min="0" max="1" step="0.05" value="${SET[key]}"><output>${Math.round(SET[key]*100)}</output>`;const i=el.querySelector('input'),o=el.querySelector('output');i.oninput=()=>{SET[key]=+i.value;o.textContent=Math.round(SET[key]*100);saveSet();AU.setVol()};B.appendChild(el)};
  seg('Graphics','q',[['low','Low'],['med','Medium'],['high','High']],applyQuality);
  seg('Resolution','res',[['auto','By graphics'],['std','Standard'],['sharp','Sharp'],['max','Max']],()=>{DRES.s=1;resize()});
  seg('Auto resolution','dres',[['on','On'],['off','Off']],()=>{DRES.s=1;DRES.t=DRES.n=DRES.sum=0;resize()});
  seg('Motion FX','fx',[['full','Full'],['reduced','Reduced'],['off','Off']]);
  seg('Field of view','fov',[['narrow','Narrow'],['normal','Normal'],['wide','Wide']]);
  seg('Camera','camd',[['close','Close'],['normal','Normal'],['far','Far']]);seg('Free-roam camera','rcam',[['chase','Chase'],['close','Close'],['far','Far'],['high','High'],['low','Low']]);
  seg('Difficulty','diff',[['relaxed','Relaxed'],['normal','Normal'],['hard','Hard']]);seg('Adaptive rivals','adapt',[['on','On'],['off','Off']]);
  seg('Steering','steer',[['low','Gentle'],['normal','Normal'],['high','Sharp']]);
  /* seg('Touch controls','touch',[['buttons','◀ ▶ Buttons'],['drag','Drag'],['tilt','Tilt']]); — tilt/drag parked for now */seg('Throttle (touch)','thr',[['city','Pedal in city'],['pedal','Gas pedal'],['auto','Auto']]);
  seg('Touch sensitivity','sens',[[1,'1'],[2,'2'],[3,'3'],[4,'4'],[5,'5']]);
  seg('Steering assist','assist',[['on','On'],['off','Off']]);seg('Time of day (free roam)','tod',[['cycle','Cycle'],['day','Always day'],['night','Always night']],()=>{FL.am=null});
  seg('Invert tilt','tiltInv',[['off','Off'],['on','On']]);
  {const el=document.createElement('div');el.className='seg';el.innerHTML='<span>Saved game</span>';const ex=document.createElement('button'),im=document.createElement('button');ex.textContent='Copy save code';im.textContent='Load save code';
   ex.onclick=async()=>{const d={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.startsWith('mho_'))d[k]=localStorage.getItem(k)}const code='MHO1:'+btoa(unescape(encodeURIComponent(JSON.stringify(d))));let ok=false;try{await navigator.clipboard.writeText(code);ok=true}catch(e){}if(!ok)prompt('Copy this save code:',code);else ex.textContent='Copied ✓'};
   im.onclick=()=>{const code=(prompt('Paste a save code (MHO1:…)')||'').trim();if(!code.startsWith('MHO1:'))return;try{const d=JSON.parse(decodeURIComponent(escape(atob(code.slice(5)))));for(const k in d)if(k.startsWith('mho_'))localStorage.setItem(k,d[k]);location.reload()}catch(e){alert('That save code is not valid.')}};
   el.append(ex,im);B.appendChild(el)}
  seg('Speed in','units',[['kph','km/h'],['mph','mph']]);
  seg('Crash cam','cc',[['full','Full'],['short','Short'],['off','Off']]);
  seg('FPS counter','perf',[[false,'Off'],[true,'On']]);
  sl('Master','vol');sl('Music','mus');sl('Effects','sfx');
  $('#setKeys').innerHTML='<b class="ck">CONTROLS</b><table class="ctl"><tr><th></th><th>Keyboard</th><th>Touch</th></tr><tr><td>Steer / throttle / brake</td><td><kbd>←</kbd><kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd></td><td>◀ ▶ (or drag / tilt) · GAS pedal in the city, auto-throttle in races (Settings → Throttle) · hold BRAKE to stop (keep holding to reverse) · double-tap BRAKE to park</td></tr><tr><td>Boost</td><td><kbd>Shift</kbd> · double-tap = boost lock (Class B)</td><td>BOOST</td></tr><tr><td>Handbrake drift → mini-turbo</td><td><kbd>X</kbd> + steer</td><td>DRIFT + steer</td></tr><tr><td>Weapon (race) / hop (free roam)</td><td><kbd>Space</kbd></td><td>FIRE / HOP</td></tr><tr><td>Barrel roll (dodge)</td><td>double-tap <kbd>←</kbd>/<kbd>→</kbd></td><td>double-tap ◀/▶</td></tr><tr><td>Airbrakes</td><td><kbd>Q</kbd>/<kbd>E</kbd></td><td>hold full lock (drag)</td></tr><tr><td>Free roam: vehicle · map · events</td><td><kbd>T</kbd> · <kbd>M</kbd> · EVENTS</td><td>buttons on screen</td></tr><tr><td>Camera · pause · mute</td><td><kbd>C</kbd> · <kbd>P</kbd>/<kbd>Esc</kbd> · <kbd>M</kbd></td><td>❚❚</td></tr></table><small>Gamepad: RT thrust · LT brake · LB/RB airbrakes · B boost · A weapon · X + stick roll · Y camera. Graphics: Low turns off glow and anti-aliasing · Medium drops reflections and shadows · Difficulty sets rival pace.</small>'}
$('#setBtn').onclick=openSettings;$('#pSet').onclick=openSettings;$('#setDone').onclick=closeSettings;$('#setCred').onclick=()=>credShow($('#credBox').hidden);$('#setReset').onclick=()=>{Object.assign(SET,SET_DEF);saveSet();applyQuality();AU.setVol();buildSettings()};$('#pMute').onclick=()=>{AU.init();AU.toggle()};

// small livery preview for the team cards
// W13: TEAM SELECT shows each team's real LEGO race car (the same shipMesh the race spawns), rendered once per team and cached.
// The old 2D plane silhouette (pre-LEGO ship era) stays only as the fallback if WebGL fails.
const W13_TC={};let W13_TR=null,W13_TT=0;
function W13_visBox(g){const B=new THREE.Box3(),b=new THREE.Box3();g.updateMatrixWorld(true);g.traverse(o=>{if(!o.isMesh||!o.geometry)return;for(let a=o;a;a=a.parent)if(!a.visible)return;if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();b.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld);B.union(b)});return B}
function W13_carImg(t){const W=240,H=120,K=2;if(W13_TC[t.id])return W13_TC[t.id];
 if(!W13_TR){const c=null,r=P1_off(W*K,H*K);r.outputColorSpace=THREE.SRGBColorSpace;r.toneMapping=renderer.toneMapping;r.toneMappingExposure=renderer.toneMappingExposure;r.setClearColor(0,0);
  const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0xffffff,0x5a6470,1.7));const d=new THREE.DirectionalLight(0xffffff,2.3);d.position.set(5,9,-7);sc.add(d);W13_TR={r,sc,c,cam:new THREE.PerspectiveCamera(24,W/H,.1,300)}}
 const{r,sc,c,cam}=W13_TR,g=shipMesh(t),U=g.userData;for(const k of['boat','wheels','shield','under','shadow','flares'])if(U[k])U[k].visible=false;for(const rb of U.ribbons||[])rb.visible=false;
 sc.add(g);const B=W13_visBox(g),m=B.getCenter(new THREE.Vector3()),s=B.getSize(new THREE.Vector3()),R=Math.hypot(s.x,s.y,s.z)*1.55;
 cam.position.set(m.x-R*.55,m.y+R*.36,m.z-R*.76);cam.lookAt(m.x,m.y-s.y*.08,m.z);r.clear();r.render(sc,cam);
 const o=r.canvas();sc.remove(g);
 clearTimeout(W13_TT);W13_TT=setTimeout(()=>{if(W13_TR){P1_free('o'+W*K+'x'+H*K);W13_TR=null}},4000);return W13_TC[t.id]=o}
function teamCard(t){try{const[c,g]=cv(480,240),im=W13_carImg(t);
  g.save();g.translate(240,178);g.scale(1,.24);const gl=g.createRadialGradient(0,0,0,0,0,200);gl.addColorStop(0,'rgba(20,40,70,.38)');gl.addColorStop(1,'rgba(20,40,70,0)');g.fillStyle=gl;g.beginPath();g.arc(0,0,200,0,7);g.fill();g.restore();g.drawImage(im,0,0);c.className='w13car';return c}catch(e){console.warn('W13 team card',e);return W13_teamCard0(t)}}
function W13_teamCard0(t){const[c,g]=cv(240,120);g.fillStyle='#030c18';g.fillRect(0,0,240,120);g.translate(120,64);
  const gl=g.createRadialGradient(0,20,0,0,20,110);gl.addColorStop(0,t.glow+'66');gl.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gl;g.fillRect(-120,-64,240,120);
  g.fillStyle=t.a;g.beginPath();g.moveTo(-100,26);g.lineTo(-18,-10);g.lineTo(0,-40);g.lineTo(18,-10);g.lineTo(100,26);g.lineTo(96,34);g.lineTo(-96,34);g.closePath();g.fill();
  g.fillStyle=t.b;g.beginPath();g.moveTo(-6,-34);g.lineTo(6,-34);g.lineTo(10,32);g.lineTo(-10,32);g.fill();g.fillStyle=t.c;g.fillRect(-1,-30,2,60);
  g.fillStyle='#0b2a44';g.beginPath();g.ellipse(0,-6,8,16,0,0,7);g.fill();
  for(const x of[-40,0,40]){g.fillStyle=t.glow;g.shadowColor=t.glow;g.shadowBlur=14;g.beginPath();g.arc(x,34,5,0,7);g.fill()}g.shadowBlur=0;return c}
const unlocked=i=>i<=0||(store.peek('mho_career',{})[EVENTS[i-1].id]||0)>0;
const thumbs={};function trackThumb(def){if(thumbs[def.id])return thumbs[def.id];const[c,g]=cv(320,200);g.fillStyle='#030c18';g.fillRect(0,0,320,200);
  const cur=new THREE.CatmullRomCurve3(def.cp.map(p=>V3(p[0],p[1],p[2])),true,'centripetal',.5),pts=cur.getSpacedPoints(240);let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9,y0=1e9,y1=-1e9;
  for(const p of pts){x0=Math.min(x0,p.x);x1=Math.max(x1,p.x);z0=Math.min(z0,p.z);z1=Math.max(z1,p.z);y0=Math.min(y0,p.y);y1=Math.max(y1,p.y)}
  const sc=Math.min(280/(x1-x0),160/(z1-z0)),ox=160-(x0+x1)/2*sc,oz=100-(z0+z1)/2*sc;
  g.strokeStyle='rgba(76,234,255,.12)';g.lineWidth=1;for(let x=0;x<320;x+=20){g.beginPath();g.moveTo(x,0);g.lineTo(x,200);g.stroke()}for(let y=0;y<200;y+=20){g.beginPath();g.moveTo(0,y);g.lineTo(320,y);g.stroke()}
  g.lineJoin=g.lineCap='round';g.lineWidth=12;g.strokeStyle='rgba(0,10,25,.9)';g.beginPath();pts.forEach((p,i)=>{const X=ox+p.x*sc,Y=oz+p.z*sc;i?g.lineTo(X,Y):g.moveTo(X,Y)});g.closePath();g.stroke();
  for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length],h=(a.y-y0)/Math.max(1,y1-y0);g.strokeStyle=`hsl(${190-h*140},100%,${58+h*10}%)`;g.lineWidth=5;g.shadowColor=g.strokeStyle;g.shadowBlur=8;g.beginPath();g.moveTo(ox+a.x*sc,oz+a.z*sc);g.lineTo(ox+b.x*sc,oz+b.z*sc);g.stroke()}
  g.shadowBlur=0;g.fillStyle='#ffd12c';g.fillRect(ox+pts[0].x*sc-7,oz+pts[0].z*sc-3,14,6);def.km=(cur.getLength()*S/1000).toFixed(1);return thumbs[def.id]=c}
function refreshAttract(){if(state!=='menu')return;const ev=EVENTS[evIdx];const sea=menuTab==='season'?seasonRound(season().L,season().r):menuTab==='world'?(worldPick||(CID==='ath'?ATH_TRK_EV[0]:RIVAL_EV[0])):null,car=menuTab==='career',dl=menuTab==='daily'?dailyCfg():null;
  const at=sea?sea.track:car?(ev.track||'grand'):dl?dl.track:menuTrack;setupRace({type:'attract',laps:99,traffic:22,items:true,aggr:0,track:at,mood:isAthT(at)?TRACK_DEFS.find(t=>t.id===at).mood:'brick'})}
const GOALS={quick:'Eight pilots, weapons on. Pick a circuit and the weather, then win it.',
  zone:'<b>Survival.</b> Thrust is automatic and every 1.2 km the speed rises one zone. Walls hurt more and the hull does not repair itself: only clearing a zone patches it. How far can you go?',
  arena:'<b>Knockout combat.</b> Weapon pads everywhere, weapons hit more than twice as hard and every pilot has three lives. Last ship flying wins, or the most lives after three minutes.',
  derby:'<b>Demolition derby.</b> No weapons: your car is the weapon. Every hit does damage, harder the faster you ram. Three lives each and two and a half minutes. Most takedowns wins.',
  junction:'<b>Crash Junction.</b> A jam of hover-traffic waits ahead. Boost in and crash. Then steer your wreck into more cars (<b>Aftertouch</b>) and hit BOOST or FIRE to blow it up (<b>Crashbreaker</b>). Wrecks set off chain reactions.',
  ttlap:'Solo hot laps with no traffic. Your best lap becomes a ghost to chase.',ttduel:'<b>Ghost duel.</b> Three laps against the ghost of your best full race on this circuit, class and direction. The first run sets the ghost.'};
let seaView='table',worldPick=null;
