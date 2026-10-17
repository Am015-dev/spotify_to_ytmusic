// ---------- board-first layer (interface only, no rules): portrait phones play on the board itself ----------
// html.bf is set on portrait phones with the 3D board. The board fills the screen; every choice is a tap on the board:
// tap your ship -> its maneuvers appear as ghost paths -> tap one; all revealed ships then fly at the same time;
// actions are icons next to the ship; targets glow; shots draw as lines with big dice. The dock only opens for the
// rare question the board can't show (a sheet over the bottom of the board).
var BF={on:false,sel:null,sub:null,wave:null,flyUntil:0,key:'',fkey:'',items:[],aid:null,seenBrief:null,toastT:0,holdT:0,fing:null,taps:0};
(function(){
const R=document.documentElement;
const v3=()=>typeof V3!=='undefined'&&V3.on&&!!V3.camera;
const net=()=>typeof NET!=='undefined'&&NET.on;
const ARROW={T:['↰','↱'],B:['↖','↗'],S:['↑','↑'],K:['⤺','⤺']};
const ACT_ICO={F:'◉',E:'✦',TL:'⌖',BR:'⇆',BO:'⇑',EH:'⇆',DD:'⤺',JK:'✦',MK:'◉',SL:'⌖',SB:'⚡',skip:'✕'};
const ACT_W={F:'Focus',E:'Evade',TL:'Lock',BR:'Roll',BO:'Boost',EH:'Roll',skip:'Skip'};
const off=/[?&]bf=0/.test(location.search||'');// ?bf=0: the older dock interface
function want(){return !off&&!!(window.PHN&&PHN.on&&(!PHN.land||(typeof tutOn==='function'&&tutOn()))&&v3())}   // the lesson keeps the board-first layer in landscape too: every step points at the board
function playing(){return !!G&&!UI.info&&UI.build==null&&!UI.rules&&!UI.stats&&!(G.phase==='plan'&&UI.pass!=null&&UI.pass!==planSide()&&planSide()>=0&&bothHuman())}
const mineS=s=>!!s&&isHuman(s.side)&&(!net()||s.side===NET.mySide);
const me=()=>{const k=soloSide();return k>=0?k:(planSide()>=0?planSide():0)};
// ---- DOM ----
let ov,svg,lay,bar,hint,btns,dice,top,ban,fing;
function build(){if(ov)return;const st=$('stage');if(!st)return;ov=document.createElement('div');ov.id='bf';
  ov.innerHTML='<svg id="bfsvg" aria-hidden="true"></svg><div id="bfl"></div><div id="bftop" aria-live="polite"></div><div id="bfdice" hidden></div><div id="bfban" hidden></div><div id="bffing" hidden aria-hidden="true">👆</div><div id="bfbar"><p id="bfhint" aria-live="polite"></p><div id="bfbtns"></div></div>';
  st.appendChild(ov);svg=$('bfsvg');lay=$('bfl');bar=$('bfbar');hint=$('bfhint');btns=$('bfbtns');dice=$('bfdice');top=$('bftop');ban=$('bfban');fing=$('bffing');
  ov.addEventListener('click',onClick);requestAnimationFrame(loop)}
// ---- projection ----
function px(x,y,h){const v=W(x,y,h||0).project(V3.camera);const c=V3.r.domElement;return [(v.x+1)/2*c.clientWidth,(1-v.y)/2*c.clientHeight,v.z]}
function shipR(s){V3.camera.updateMatrixWorld();const a=px(s.x,s.y),f=fwd(s.h),b=px(s.x+f.x*B(s)/2,s.y+f.y*B(s)/2);return Math.max(14,Math.hypot(a[0]-b[0],a[1]-b[1]))}
// the shown position of a ship (the mesh, so it follows the flight animation)
function shownXY(s){const m=V3.ships[s.id];if(!m)return {x:s.x,y:s.y};return {x:m.position.x*10,y:MAT-m.position.z*10}}
// ---- camera: frame the points that matter, inside the part of the board that is not under the bars ----
function rayGround(sx,sy){const c=V3.r.domElement;const v=new THREE.Vector2(sx/c.clientWidth*2-1,-(sy/c.clientHeight)*2+1);const rc=new THREE.Raycaster();rc.setFromCamera(v,V3.camera);const p=new THREE.Vector3();return rc.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),0),p)?p:null}
function fit(pts,minW,side,topPad){if(!v3()||!pts.length)return;const C=V3.cam,cam=V3.camera,from=Object.assign({},C);const c=V3.r.domElement,Wd=c.clientWidth,Ht=c.clientHeight;
  const tp=topPad||46,bt=(bar?bar.offsetHeight:70)+10,sd=side||12;minW=minW||230;
  let a=1e9,b=-1e9,d=1e9,e=-1e9;for(const p of pts){a=Math.min(a,p.x);b=Math.max(b,p.x);d=Math.min(d,p.y);e=Math.max(e,p.y)}
  if(b-a<minW){const m=(a+b)/2;a=m-minW/2;b=m+minW/2}if(e-d<minW){const m=(d+e)/2;d=m-minW/2;e=m+minW/2}
  const box=[{x:a,y:d},{x:b,y:d},{x:a,y:e},{x:b,y:e}];C.tx=S3((a+b)/2);C.tz=S3(MAT-(d+e)/2);
  for(let i=0;i<14;i++){placeCam();cam.updateMatrixWorld();let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(const p of box){const q=px(p.x,p.y);x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1])}
    const k=Math.max((x1-x0)/(Wd-2*sd),(y1-y0)/(Ht-tp-bt));C.dist=Math.max(34,Math.min((V3.fitDist||122)*1.3,C.dist*Math.pow(k,.85)));
    placeCam();cam.updateMatrixWorld();const g0=rayGround(Wd/2,tp+(Ht-tp-bt)/2);if(g0){C.tx+=S3((a+b)/2)-g0.x;C.tz+=S3(MAT-(d+e)/2)-g0.z}if(Math.abs(k-1)<.015&&i>2)break}
  C.tx=Math.max(-6,Math.min(97.4,C.tx));C.tz=Math.max(-6,Math.min(97.4,C.tz));
  if(ANIM&&!reduceMotion())V3.ez={from,t0:performance.now(),dur:520};else V3.ez=null}
const XY=s=>({x:s.x,y:s.y});
function around(s,r){r=r||B(s)*1.2;return [{x:s.x-r,y:s.y-r},{x:s.x+r,y:s.y+r}]}
function framePts(k){const all=alive();const pts=[];const add=a=>{for(const p of a)pts.push(p)};
  if(k==='plan'&&BF.sel){const s=ship(BF.sel);add(around(s,B(s)*.9));dialOf(s).forEach(m=>{const p=finalPose(s,B(s),m);add(around(p,B(s)*.75))});return {pts,min:200,sd:30,tp:104}}
  if(k==='action'||k==='sub'){const s=ship(G.cur);add(around(s,B(s)*1.6));if(k==='sub'&&BF.sub){if(BF.sub.opts)BF.sub.opts.forEach(o=>o.p&&add(around(o.p,B(s)*.8)));if(BF.sub.targets)BF.sub.targets.forEach(id=>add(around(ship(id))))}return {pts,min:400}}
  if(k==='target'){const s=ship(G.cur);add(around(s));for(const w of weaponsFor(s))for(const t of w.targets)add(around(ship(t.id)));return {pts,min:380}}
  if(k==='dice'&&G.atk){add(around(ship(G.atk.a)));add(around(ship(G.atk.d)));all.forEach(s=>add(around(s)));return {pts,min:380}}
  if(k==='setup'&&G.q){G.q.opts.forEach(o=>o.p&&pts.push(XY(o.p)));all.forEach(s=>add(around(s)));return {pts,min:300}}
  all.forEach(s=>add(around(s)));return {pts,min:300}}
// ---- what is going on ----
function ctx(){if(!G)return 'none';if(G.winner)return 'over';
  if(UI.hold)return UI.hold.kind==='res'?'res':'note';
  if(BF.wave||performance.now()<BF.flyUntil)return 'fly';
  const ht=humanTurn();
  if(G.round===0){if(BF.seenBrief!==G.seed&&(isHuman(0)||isHuman(1)))return 'brief';if(G.phase==='ask'&&ht&&G.q&&['rock','deploy'].includes(G.q.key))return 'setup'}
  if(G.phase==='plan'&&planSide()>=0)return 'plan';
  if(G.phase==='action'&&ht)return BF.sub?'sub':'action';
  if(G.phase==='target'&&ht)return 'target';
  if(G.atk&&['amod','dmod','damod'].includes(G.phase))return 'dice';
  if(G.phase==='ask'&&G.q&&ht)return G.atk?'dice':'ask';
  return 'watch'}
// ---- the moves held back so every revealed ship flies at the same time ----
function stepTwo(){return G&&!G.winner&&G.step===2&&['activate','action','ask'].includes(G.phase)}
function capture(){if(!UI.fx.length)return;const keep=[];for(const f of UI.fx){
    if(f.k==='move'&&V3.ships[f.id]){const w=BF.wave||(BF.wave={moves:{},order:[],fx:[],t0:performance.now(),dur:0});
      if(!w.moves[f.id]){w.moves[f.id]={path:f.path.slice(),m:f.m||null,roll:!!f.roll};w.order.push(f.id);const p0=f.path[0];V3.anim[f.id]={path:[p0,p0],t0:performance.now(),dur:1e9}}
      else{const mv=w.moves[f.id];mv.path=mv.path.concat(f.path.slice(1));if(f.m&&!mv.m)mv.m=f.m}
      w.dur=Math.max(w.dur,f.dur||0)}
    else if(BF.wave)BF.wave.fx.push(f);else keep.push(f)}
  UI.fx.length=0;keep.forEach(f=>UI.fx.push(f))}
function speedUp(){if(BF.aid==null){BF.aid=AIDELAY;AIDELAY=Math.min(AIDELAY,90)}}
function slowDown(){if(BF.aid!=null){AIDELAY=BF.aid;BF.aid=null}}
function release(){const w=BF.wave;BF.wave=null;slowDown();if(!w)return;const ids=w.order.filter(id=>V3.ships[id]);
  const reveal=ANIM&&!reduceMotion()?520:0,D=ANIM?Math.max(900,Math.min(1500,w.dur||1000)):0;BF.flyUntil=performance.now()+reveal+D+150;
  chips(ids.map(id=>({id,m:w.moves[id].m,roll:w.moves[id].roll})),reveal+D);
  if(ids.length)sfx('lock');
  const go=()=>{const now=performance.now();for(const id of ids){const p=w.moves[id].path;V3.anim[id]={path:p.length<2?[p[0],p[0]]:p,t0:now,dur:Math.max(1,D)}}if(ids.length)sfx('engine');
    const land=()=>{for(const f of w.fx)UI.fx.push(f);try{drainFx()}catch(e){}BF.flyUntil=0;render()};if(D)setTimeout(land,D+60);else land()};
  if(reveal)setTimeout(go,reveal);else go();
  if(ids.length>1)banner('<b>Ships move!</b>',reveal+D*.6)}
function maybeRelease(){if(!BF.wave)return;if(!stepTwo()||humanTurn()||performance.now()-BF.wave.t0>7000)release()}
// ---- one-line text, banners, pops ----
function setHint(t){if(hint&&hint.innerHTML!==t)hint.innerHTML=t}
function banner(h,ms){if(!ban)return;ban.innerHTML=h;ban.hidden=false;ban.classList.remove('go');void ban.offsetWidth;ban.classList.add('go');clearTimeout(BF.banT);BF.banT=setTimeout(()=>{ban.hidden=true},ms||1400)}
function mvLabel(m){if(!m)return '';if(m.s===0)return '■';const a=ARROW[m.t]||['↑','↑'];return (m.d>0?a[1]:a[0])+'<b>'+m.s+'</b>'}
function chips(list,ms){for(const c of list){const s=ship(c.id);if(!s)continue;const col=c.m?(exColor(s,c.m).c):'w';const el=document.createElement('div');el.className='bfchip '+col+' s'+s.side;el.innerHTML=c.roll&&!c.m?'⇆':mvLabel(c.m);lay.appendChild(el);
    const it={el,ship:s.id,dy:-1.25,tmp:true};BF.items.push(it);setTimeout(()=>{el.remove();BF.items=BF.items.filter(x=>x!==it)},ms+400)}}
// ---- render: rebuild the overlay when the situation changes ----
function legend(h){const el=document.createElement('div');el.className='bfleg';el.innerHTML=h;ov.appendChild(el);BF.leg=el}
function clear(){if(BF.leg){BF.leg.remove();BF.leg=null}BF.items=BF.items.filter(it=>{if(it.tmp)return true;it.el.remove();return false});svg.innerHTML='';BF.paths=[];BF.fing=null;if(fing)fing.hidden=true;setBtns('')}
function setBtns(h){if(btns&&btns._h!==h){btns._h=h;btns.innerHTML=h}}
function item(html,cls,o){const el=document.createElement(o&&o.tag||'button');if(el.tagName==='BUTTON')el.type='button';el.className=cls;el.innerHTML=html;for(const k in (o&&o.data)||{})el.dataset[k]=o.data[k];if(o&&o.label)el.setAttribute('aria-label',o.label);el.style.visibility='hidden';lay.appendChild(el);const it=Object.assign({el},o||{});BF.items.push(it);return it}
function pathW(pts,cls,h){const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('class',cls);svg.appendChild(p);BF.paths.push({el:p,pts,h:h||.4});return p}
function sideCol(s){return s.side===me()?'mine':'foe'}
function bfRender(){const on=want();if(on!==BF.on){BF.on=on;R.classList.toggle('bf',on);if(!on){R.classList.remove('bf-play','bf-sheet');if(ov)ov.hidden=true;if(BF.wave)release()}requestAnimationFrame(()=>{try{resize3D()}catch(e){}BF.key='';BF.fkey='';if(BF.on)bfRender()})}
  if(!on)return;build();if(!ov)return;ov.hidden=false;if(G&&G.winner){if(BF.overG!==G){BF.overG=G;BF.wantStats=false}if(UI.stats&&!BF.wantStats){UI.stats=false;setTimeout(render,0)}}const play=playing();R.classList.toggle('bf-play',play);
  if(!play){R.classList.remove('bf-sheet');clear();BF.key='';bar.hidden=true;top.innerHTML='';top._h='';fing.hidden=true;return}bar.hidden=false;
  maybeRelease();
  // my ship had nobody to shoot: say so on the board, with the fix
  {const N=(UI.notes&&UI.notes[G.round])||[];for(const n of N){if(n.kind==='noshot'&&!n.bf){n.bf=1;const s=ship(n.id);if(s&&mineS(s))banner(`<b>No enemy ahead</b><span>${esc(shortName(s))} can only shoot forward. Pick a 🎯 move.</span>`,2600)}}}
  // the round summary between rounds is a board banner here, not a page of text
  if(sumPending()){UI.sumSeen=G.round-1;banner(`<b>Round ${G.round}</b>`,1100)}
  const k=ctx();if(k!=='plan')BF.sel=null;if(k!=='sub'&&k!=='action')BF.sub=null;
  if(k==='res'||k==='note')autoHold(k);
  const s=G.cur&&ship(G.cur);
  const key=[k,G.round,G.phase,G.cur,G.q&&G.q.kid,BF.sel,BF.sub&&BF.sub.a,k==='plan'?JSON.stringify(UI.draft):'',G.atk&&[G.atk.step,(G.atk.dice||[]).join(),(G.atk.def||[]).join(),G.atk.rr&&JSON.stringify(G.atk.rr)].join('/'),UI.hold&&UI.hold.kind,alive().length,PHN.pop&&PHN.pop.kind].join('|');
  const sheet=k==='ask'||(!!PHN.pop&&PHN.pop.kind==='info');R.classList.toggle('bf-sheet',sheet);
  topLine(k);
  const fk=[k,BF.sel,G.cur,G.round,BF.sub&&BF.sub.a,G.atk&&G.atk.a+G.atk.d].join('|');if(fk!==BF.fkey&&k!=='fly'&&k!=='res'&&k!=='note'){BF.fkey=fk;const f=framePts(k==='sub'?'sub':k);requestAnimationFrame(()=>fit(f.pts,f.min,f.sd,f.tp))}
  if(key===BF.key)return;BF.key=key;clear();dice.hidden=true;
  BF.fingT=null;
  if(k==='brief')briefUI();else if(k==='setup')setupUI();else if(k==='plan')planUI();else if(k==='action'||k==='sub')actionUI(s);else if(k==='target')targetUI(s);
  else if(k==='dice')diceUI();else if(k==='res')resUI();else if(k==='note')noteUI();else if(k==='over')overUI();else if(k==='ask')askUI();else if(k==='fly')setHint('');else watchUI(s)}
function topLine(k){if(!G||G.round<1){top.innerHTML='';top._h='';return}const k0=me();const hp=side=>alive().filter(s=>s.side===side).reduce((a,s)=>a+Math.max(0,s.hull-hullDmg(s))+s.sh,0);
  const n=side=>alive().filter(s=>s.side===side).length;const h=`<span class="y">You <b>${n(k0)}</b>✈ ♥${hp(k0)}</span><span class="vs">vs</span><span class="e">Enemy <b>${n(1-k0)}</b>✈ ♥${hp(1-k0)}</span>`;if(top._h!==h){top._h=h;top.innerHTML=h}}
// ---- the guided first game: a ghost finger shows the one thing to tap ----
function finger(el){BF.fing=guided()&&el?el:null}
// ---- screens ----
function briefUI(){const k0=me();const foe=G.ships.filter(s=>s.side!==k0).length;setHint('');banner(`<b>Destroy ${foe===1?'the enemy ship':foe===2?'both enemy ships':'all '+foe+' enemy ships'}</b><span>Your ship${G.ships.filter(s=>s.side===k0).length>1?'s are':' is'} at the bottom</span>`,1e9);
  setBtns(`<button class="btn" data-bf="briefset" aria-label="Place the asteroids and your ship yourself">Set up myself</button><button class="btn primary big" data-bf="brief">Start ▶</button>`);finger(btns.querySelector('.primary'))}
function setupUI(){const q=G.q;const rock=q.key==='rock';setHint(rock?'Tap a square to place a rock':'Tap a spot for your ship');
  const rk=recOpt(q).o.k;q.opts.forEach((o,i)=>{if(!o.p)return;const it=item(rock?'':'✈','bfspot'+(o.k===rk?' rec':''),{x:o.p.x,y:o.p.y,data:{bfq:o.k},label:o.l,relax:true});if(o.k===rk)finger(it.el)});
  setBtns(`<button class="btn big" data-a="autoplace">✨ Auto-place all</button>`)}
function planUI(){const ps=planSide();const my=alive().filter(s=>s.side===ps);const all=my.every(s=>UI.draft[s.id]!=null);
  if(BF.sel&&!my.some(s=>s.id===BF.sel))BF.sel=null;
  for(const s of my){const pk=UI.draft[s.id];if(pk!=null&&s.id!==BF.sel){const m=dialOf(s)[pk];pathW(tplPoints(s,B(s),m,4),'bfp set '+exColor(s,m).c);item(mvLabel(m),'bfm small set '+exColor(s,m).c,{x:finalPose(s,B(s),m).x,y:finalPose(s,B(s),m).y,data:{bfship:s.id},label:s.name+': '+mvWords(m)})}
    if(s.id!==BF.sel){const it=item('','bfring'+(pk==null?' need':' done'),{ship:s.id,data:{bfship:s.id},label:s.name+(pk==null?': plan its move':': change its move'),ring:true});if(pk==null&&!BF.fingT){BF.fingT=it.el}}}
  if(BF.sel){const s=ship(BF.sel);const b=B(s),d=dialOf(s),sug=UI.hints?suggestDial(s):-1,pick=UI.draft[s.id];
    d.forEach((m,i)=>{const c=exColor(s,m).c;if(c==='r'&&s.stress)return;const tp=tplPoints(s,b,m,4);pathW(tp,'bfp '+c+(pick===i?' on':'')+(sug===i&&pick==null?' sug':''));
      const p=finalPose(s,b,m);const rk=rockHits(s,m);let aim=false;try{aim=!rk&&inArcOf(s,p).length>0}catch(e){}const it=item(mvLabel(m)+(sug===i?'<em class="st">★</em>':'')+(rk?'<em class="rk">!</em>':'')+(aim?'<em class="tg">🎯</em>':''),'bfm '+c+(pick===i?' on':'')+(sug===i?' sug':'')+(rk?' danger':''),{x:p.x,y:p.y,data:{bfm:i},label:mvWords(m)+(sug===i?', suggested':'')+(rk?', hits an asteroid':'')+(aim?', ends with an enemy in your sights':''),relax:true});
      if(sug===i&&pick==null)BF.fingT=it.el});
    item('','bfring sel',{ship:s.id,ring:true,tag:'div'});legend('<b class="g">●</b> easy <b class="r">●</b> hard · 🎯 enemy ahead · <b class="rk">!</b> rock');
    setHint(pick==null?`Tap where ${esc(shortName(s))} flies`:all?'Ready? Tap <b>Fly</b>':'Tap your next ship')}
  else setHint(all?'Ready? Tap <b>Fly</b>':my.length>1?'Tap a ship to plan its move':'Tap your ship to plan its move');
  setBtns(`<button class="btn" data-bf="auto" aria-label="Suggested moves for every ship">★ Auto</button><button class="btn primary big" data-bf="fly" ${all?'':'disabled'}>Fly ▶</button>`);
  if(all&&!BF.sel)BF.fingT=btns.querySelector('[data-bf="fly"]');finger(BF.fingT)}
function actionUI(s){if(!s)return;const acts=actionsFor(s);const rec=recAct(s);
  if(BF.sub){const a=BF.sub;setHint(a.a==='TL'?'Tap the enemy to lock on':'Tap where to go');
    if(a.targets)a.targets.forEach(id=>{const t=ship(id);const it=item('<span>⌖</span><i>Lock</i>','bftgt lock',{ship:id,data:{bfarg:id},label:'Lock onto '+t.name});finger(it.el)});
    if(a.opts)a.opts.forEach((o,i)=>{const p=o.p||(o.m?finalPose(s,B(s),o.m):null);if(!p)return;pathW(corners(p,B(s)).concat([corners(p,B(s))[0]]),'bfp ghost');const it=item(a.a==='BR'||a.a==='EH'?(o.dir<0?'⇠':'⇢'):'⇑','bfm w',{x:p.x,y:p.y,data:{bfarg:i},label:actLabel(a,o),relax:true});if(i===0)finger(it.el)});
    setBtns(`<button class="btn" data-bf="back">◀ Back</button>`);return}
  const why={F:'◉ Focus: your next shot hits harder',E:'✦ Evade: dodge one hit',TL:'⌖ Lock: reroll your missed dice'}[rec];setHint(why?`Tap ${why}`:`Pick an action for ${esc(shortName(s))}`);
  const list=acts.slice();list.push({a:'skip',l:'Skip'});const n=list.length;
  list.forEach((a,i)=>{const ic=ACT_ICO[a.a]||(/^RP\d/.test(a.a)?'🔧':'★');const w=ACT_W[a.a]||(/^RP\d/.test(a.a)?'Repair':String(a.l||a.a).split(/[ :]/)[0]);
    const it=item(`<span>${ic}</span><i>${esc(w)}</i>`,'bfact'+(a.a===rec?' rec':'')+(a.a==='skip'?' skip':''),{ship:s.id,ring:false,arc:{i,n},data:{bfa:a.a},label:(a.l||a.a)+(a.d?': '+a.d:'')});
    if(a.a===rec)finger(it.el)});
  if(!rec)finger(null);setBtns('')}
function targetUI(s){if(!s)return;const ws=weaponsFor(s);const opts=[];for(const w of ws)for(const t of w.targets){const d=ship(t.id);const sd=shotDice(s,w,t,d);opts.push({w,t,d,n:sd.atk,m:sd.def,e:expDmg(sd.atk,sd.def,s.focus>0||s.tl===d.id,d.focus>0)})}
  const best=opts.slice().sort((a,b)=>b.e-a.e)[0];const per={};
  for(const o of opts){const j=per[o.d.id]=(per[o.d.id]||0)+1;const p=XY(o.d);const a0=shownXY(s);pathW([a0,p],'bfshot aim');
    const it=item(`<span>${o===best?'★':''}🎯</span><i>${o.n}<small>vs</small>${o.m}</i>${o.w.k!=='P'?`<em>${esc(o.w.n.split(' ')[0])}</em>`:''}`,'bftgt'+(o===best?' rec':''),{ship:o.d.id,dy:j>1?1.1*(j-1):0,data:{bfw:o.w.k,bft:o.d.id},label:`Shoot ${o.d.name}: ${o.n} attack dice against ${o.m} defence`});if(o===best)finger(it.el)}
  setHint(opts.length?'Tap a glowing enemy to shoot':'No enemy in your arc');
  setBtns(`<button class="btn" data-act="fire" data-w="skip">Hold fire</button>`)}
function diceBox(A,res){const a=ship(A.a),d=ship(A.d);const r=res?{hits:0,crits:0}:preview(A);const rolled=!!(A.def&&A.def.length)||A.step!=='amod';
  const dd=(A.def||[]).map(f=>die(f,'def')).join('');
  const nm2=x=>mineS(x)?'You':esc(shortName(x));
  let out='';if(res){const R=res;out=R.dead?`<b class="kill">${nm2(d)==='You'?'YOU ARE':esc(shortName(d))} DESTROYED!</b>`:R.dmg?`<b class="hit">−${R.dmg} ${mineS(d)?'to you':'to '+esc(shortName(d))}</b>`:`<b class="miss">${mineS(d)?'You dodged!':'Missed!'}</b>`}
  else out=`<b class="${r.hits+r.crits?'hit':'miss'}">${r.hits+r.crits} hit${r.hits+r.crits===1?'':'s'}</b><small>${A.step==='amod'?'before the dodge roll':'get through'}</small>`;
  return `<div class="bfd-h"><span class="${mineS(a)?'y':'e'}">${nm2(a)}</span> <i>${mineS(a)?'shoot':'shoots'}</i> ➜ <span class="${mineS(d)?'y':'e'}">${nm2(d)}</span></div><div class="bfd-r atk"><span class="who">ATTACK</span><div class="dice">${(res?res.dice:A.dice).map(f=>die(f,'atk')).join('')}</div></div>
  <div class="bfd-out">${out}</div>
  <div class="bfd-r def"><span class="who">DODGE</span><div class="dice">${res?res.def.map(f=>die(f,'def')).join(''):dd||(rolled?'<i class="muted">no dice</i>':'<i class="muted">rolls next</i>')}</div></div>`}
function shotLine(aId,dId){const a=ship(aId),d=ship(dId);if(!a||!d)return;pathW([shownXY(a),shownXY(d)],'bfshot fire',2.5)}
function diceUI(){const A=G.atk;if(!A)return watchUI();const a=ship(A.a),d=ship(A.d);shotLine(A.a,A.d);dice.innerHTML=diceBox(A);dice.hidden=false;dice.className='';
  if(G.phase==='ask'){const q=G.q;setHint(esc(q.title));
    // picking dice to reroll: tap the dice themselves
    if(q.key==='dice'){const row=dice.querySelector(/Defen/.test(q.opts[0]&&q.opts[0].l)?'.def .dice':'.atk .dice');const els=row?row.querySelectorAll('.die'):[];
      q.opts.forEach(o=>{const m=/^[td](\d+)$/.exec(o.k);if(!m||!els[+m[1]])return;const el=els[+m[1]];el.dataset.bfq=o.k;el.setAttribute('role','button');el.setAttribute('aria-label',o.l);el.classList.add('pick');if(/^☑/.test(o.l))el.classList.add('on')});
      if(els.length)setHint(q.opts.some(o=>o.k==='ok')?'Tap dice to reroll, then Reroll':'Tap the die');
      setBtns(q.opts.filter(o=>!/^[td]\d+$/.test(o.k)).map(o=>`<button class="btn${o.k==='ok'?' primary':''}" data-bfq="${esc(o.k)}">${o.k==='ok'?'⌖ Reroll':o.k==='x'?'Cancel':esc(o.l)}</button>`).join(''));finger(dice.querySelector('.die.pick:not(.on)')||btns.querySelector('.primary'));return}
    setBtns(q.opts.map((o,i)=>`<button class="btn${(q.opts.some(x=>x.pri)?o.pri:i===0)?' primary':''}" data-bfq="${esc(o.k)}">${esc(o.l)}</button>`).join(''));return}
  if(!humanTurn()){setHint(G.phase==='amod'?`⏳ ${esc(shortName(a))} aims at ${mineS(d)?'you':esc(shortName(d))}`:`⏳ ${esc(shortName(d))} tries to dodge`);setBtns('');return}
  if(G.phase==='damod'){setHint('Tamper with the attack dice?');setBtns(exDAMods().map(m=>`<button class="btn" data-act="damod" data-k="${m.k}">${esc(m.l)}</button>`).join('')+`<button class="btn primary" data-act="damod" data-k="done">Done</button>`);return}
  const mods=G.phase==='amod'?atkMods():defMods();const rk=recMod();
  const pv=preview(A);setHint(G.phase==='amod'?(mods.length?'Improve your dice, then Roll':'Your shot. Tap Roll'):(mods.length?'Defend: use a token, or Done':pv.hits+pv.crits?'Hit! Tap Done':'Dodged! Tap Done'));
  // nothing to decide while defending: carry on by itself after a beat
  if(G.phase==='dmod'&&!mods.length){const kk=BF.key;setTimeout(()=>{if(BF.key===kk&&G&&G.phase==='dmod'&&humanTurn())uiAct({act:'dmod',k:'done'})},ANIM?1400:0)}
  setBtns(mods.map(m=>`<button class="btn${m.k===rk?' primary rec':''}" data-act="${G.phase}" data-k="${m.k}">${modIco(m.k)} ${esc(shortMod(m))}</button>`).join('')+`<button class="btn${rk==='done'||!rk||!mods.length?' primary':''}" data-act="${G.phase}" data-k="done">${G.phase==='amod'?'Roll ▶':'Done'}</button>`);
  finger(btns.querySelector('.rec')||btns.querySelector('.primary'))}
const modIco=k=>/focus/i.test(k)?'◉':/tl|lock|rr|reroll/i.test(k)?'⌖':/evade/i.test(k)?'✦':'★';
function shortMod(m){const l=String(m.l);if(/^Spend focus/i.test(l))return 'Use focus';if(/target lock|reroll/i.test(l))return 'Reroll';if(/evade/i.test(l))return 'Use evade';return l.length>18?l.slice(0,17)+'…':l}
function resUI(){const R=UI.hold.R;{const el=document.createElement('div');el.className='bfdmg '+(R.dmg?'hit':'miss');el.textContent=R.dead?'💥':R.dmg?'−'+R.dmg:'MISS';lay.appendChild(el);const it={el,ship:R.d,dy:-.6,tmp:true};BF.items.push(it);setTimeout(()=>{el.remove();BF.items=BF.items.filter(x=>x!==it)},2600)}shotLine(R.a,R.d);dice.innerHTML=diceBox({a:R.a,d:R.d,dice:R.dice,def:R.def,step:'done'},R);dice.hidden=false;dice.className='res';setHint('Tap to continue');setBtns('');
  const d=ship(R.d);if(d&&R.dmg)sfx(R.dead?'boom':'hull')}
function noteUI(){const n=UI.hold.n;const s=n&&ship(n.id);setHint(s?`${esc(shortName(s))}: ${n.kind==='noshot'?'no enemy to shoot':'…'}`:'');setBtns('')}
function autoHold(k){if(BF.holdT)return;const ms=k==='res'?3200:1500;BF.holdT=setTimeout(()=>{BF.holdT=0;if(typeof tutHold==='function'&&tutHold(k))return;if(UI.hold&&BF.on)releaseHold()},ANIM?ms*(UI.speed==='slow'?1.5:UI.speed==='fast'?.6:1):0)}
function overUI(){const w=winLine();const k0=me();const won=G.winner==='P'+(k0+1);banner(`<b>${won?'VICTORY!':G.winner==='draw'?'DRAW':'DEFEAT'}</b><span>${esc(w)}</span>`,1e9);setHint('');
  setBtns(`<button class="btn" data-bf="stats">Debrief</button><button class="btn primary big" data-a="new">Play again</button>`)}
function askUI(){const q=G.q;setHint(esc(q.title));let any=false;q.opts.forEach((o,i)=>{if(!o.p)return;any=true;item('◎','bfm w',{x:o.p.x,y:o.p.y,data:{bfq:o.k},label:o.l,relax:true})});setBtns('')}
function watchUI(s){const st=G.step;let t='';if(G.phase==='plan')t='Waiting for the other player…';else if(s&&!mineS(s))t=st===3?`⏳ Enemy turn: ${esc(shortName(s))} aims`:`⏳ Enemy turn: ${esc(shortName(s))} moves`;else if(st===3)t='Combat!';
  setHint(t);setBtns(UI.paused?`<button class="btn primary" data-a="pause">▶ Resume</button>`:'')}
// ---- taps ----
function onClick(e){if(e.target.closest('#bfdice')&&!e.target.closest('[data-bfq]')){if(typeof tutOn==='function'&&tutOn()&&!tutGate({what:'dicebox'}))return;const b=btns.querySelector('.btn.primary')||btns.querySelector('.btn');if(b&&!b.disabled){e.preventDefault();b.click();return}if(UI.hold){if(BF.holdT){clearTimeout(BF.holdT);BF.holdT=0}releaseHold();return}}const t=e.target.closest('[data-bf],[data-bfm],[data-bfship],[data-bfa],[data-bfarg],[data-bfw],[data-bfq]');if(!t||t.disabled)return;const ds=t.dataset;if(typeof tutOn==='function'&&tutOn()){const ta=ds.bf?{what:ds.bf}:ds.bfship!=null?{what:'ship',id:ds.bfship}:ds.bfm!=null?{what:'dial',i:+ds.bfm}:ds.bfa!=null?{what:'action',a:ds.bfa}:ds.bfarg!=null?{what:'arg',v:ds.bfarg}:ds.bfw!=null?{what:'fire',w:ds.bfw,t:ds.bft}:{what:'ask',k:ds.bfq};if(!tutGate(ta)){e.preventDefault();e.stopPropagation();return}}e.preventDefault();e.stopPropagation();BF.taps++;sfx('click');
  if(ds.bf==='brief'||ds.bf==='briefset'){BF.seenBrief=G.seed;PHN.briefSeen=G.seed;ban.hidden=true;if(ds.bf==='brief'&&G.round===0&&G.phase==='ask'&&humanTurn()){autoPlaceAll();banner('<b>Asteroids placed</b>',900)}else bfRender();return}
  if(ds.bf==='auto'){alive().filter(s=>s.side===planSide()).forEach(s=>UI.draft[s.id]=suggestDial(s));BF.sel=null;render();return}
  if(ds.bf==='fly'){const ps=planSide();if(ps<0)return;const my=alive().filter(s=>s.side===ps);if(!my.every(s=>UI.draft[s.id]!=null))return;BF.sel=null;speedUp();banner('<b>Dials revealed…</b>',900);const b=document.querySelector('[data-a="lock"]');lockIn();return}
  if(ds.bf==='stats'){BF.wantStats=true;UI.stats=true;render();return}
  if(ds.bf==='back'){BF.sub=null;render();return}
  if(ds.bfship!=null){selShip(ds.bfship);return}
  if(ds.bfm!=null){const s=ship(BF.sel);if(!s)return;UI.draft[s.id]=+ds.bfm;UI.sel=s.id;BF.selAt=performance.now();sfx('token');const my=alive().filter(x=>x.side===s.side);const nx=my.find(x=>UI.draft[x.id]==null);BF.sel=nx?nx.id:null;render();return}
  if(ds.bfa!=null){const s=ship(G.cur);if(!s)return;if(ds.bfa==='skip'){uiAct({act:'action',a2:'skip'});return}const a=actionsFor(s).find(x=>x.a===ds.bfa);if(!a)return;
    if(a.targets&&a.targets.length===1){uiAct({act:'action',a2:a.a,arg:a.targets[0]});return}
    if(a.targets||a.opts){BF.sub={a:a.a,targets:a.targets,opts:a.opts};BF.key='';render();return}
    uiAct({act:'action',a2:a.a});return}
  if(ds.bfarg!=null){const a=BF.sub;if(!a)return;BF.sub=null;uiAct({act:'action',a2:a.a,arg:a.targets?ds.bfarg:+ds.bfarg});return}
  if(ds.bfw!=null){uiAct({act:'fire',w:ds.bfw,t:ds.bft});return}
  if(ds.bfq!=null){uiAct({act:'ask',k:ds.bfq});return}}
function lockIn(){const ps=planSide();const dials={};alive().filter(s=>s.side===ps).forEach(s=>dials[s.id]=UI.draft[s.id]);UI.pass=null;sfx('token');uiAct({act:'dials',dials});if(G&&G.phase==='plan'&&planSide()>=0)UI.pass=ps;render()}
function selShip(id){const s=ship(id);if(!s||!s.alive||G.phase!=='plan'||planSide()<0||s.side!==planSide())return;BF.selAt=performance.now();BF.sel=BF.sel===id&&UI.draft[id]!=null?null:id;UI.sel=id;sfx('click');render()}
// a tap on the board itself (a ship, or empty space)
PHN.tapBF=function(e){if(!BF.on||!G)return false;if(typeof tutOn==='function'&&tutOn())return true;const r=V3.r.domElement.getBoundingClientRect();const x=e.clientX-r.left,y=e.clientY-r.top;
  if(UI.hold){if(BF.holdT){clearTimeout(BF.holdT);BF.holdT=0}releaseHold();return true}
  let best=null,bd=1e9;for(const s of alive()){const p=px(s.x,s.y,1.2);const dd=Math.hypot(p[0]-x,p[1]-y);if(dd<Math.max(30,shipR(s)*1.4)&&dd<bd){bd=dd;best=s}}
  const k=ctx();
  if(best){if(k==='plan'&&best.side===planSide()){selShip(best.id);return true}
    if(k==='target'){const w=weaponsFor(ship(G.cur)).find(w=>w.k==='P'&&w.targets.some(t=>t.id===best.id))||weaponsFor(ship(G.cur)).find(w=>w.targets.some(t=>t.id===best.id));if(w){uiAct({act:'fire',w:w.k,t:best.id});return true}}
    if(k==='sub'&&BF.sub&&BF.sub.targets&&BF.sub.targets.includes(best.id)){const a=BF.sub;BF.sub=null;uiAct({act:'action',a2:a.a,arg:best.id});return true}
    PHN.openPop('info',best.id);return true}
  if(PHN.pop){PHN.closePop();return true}
  if(k==='plan'&&BF.sel){/* the camera eases after a pick: markers move, so a tap that just missed one must not drop the pick */if((typeof V3!=='undefined'&&V3.ez)||performance.now()-(BF.selAt||0)<650)return true;BF.sel=null;render();return true}
  return false};
// ---- every frame: keep the overlay glued to the board as the camera and ships move ----
function relaxItems(list,Wd,Ht){const top=document.querySelector('.bfleg')?104:70;for(let it=0;it<30;it++){for(const a of list){const m=a.hw||24;a.sx=Math.max(m,Math.min(Wd-m,a.sx));a.sy=Math.max(top,Math.min(Ht-(bar?bar.offsetHeight:90)-22,a.sy))}for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++){const a=list[i],b=list[j];let dx=b.sx-a.sx,dy=b.sy-a.sy;if(Math.hypot(dx,dy)<.5){dx=Math.cos(j*2.4);dy=Math.sin(j*2.4)}const d=Math.hypot(dx,dy);const min=(a.r+b.r)*.95;if(d<min){const p=(min-d)/2,ux=dx/d,uy=dy/d;a.sx-=ux*p;a.sy-=uy*p;b.sx+=ux*p;b.sy+=uy*p}}}}
function loop(){requestAnimationFrame(loop);if(!BF.on||!ov||ov.hidden||!v3()||!G)return;V3.camera.updateMatrixWorld();const c=V3.r.domElement,Wd=c.clientWidth,Ht=c.clientHeight;
  const rel=[];for(const it of BF.items){let x,y,r=0;if(it.ship){const s=ship(it.ship);if(!s||!s.alive){it.el.style.display='none';continue}const p=shownXY(s);const q=px(p.x,p.y,1);r=shipR(s);x=q[0];y=q[1];
      if(it.ring){const d=Math.round(r*2.6);it.el.style.width=it.el.style.height=d+'px'}
      if(it.arc){const n=it.arc.n,i=it.arc.i;const R0=Math.max(r*1.5+40,86);const base=y<Ht-230?Math.PI/2:-Math.PI/2;const span=Math.min(Math.PI*1.1,(n-1)*74/R0);const ang=base+(n>1?(i/(n-1)-.5)*span:0);x+=Math.cos(ang)*R0;y+=Math.sin(ang)*R0}
      if(it.dy)y+=it.dy*(r*1.3+26)}
    else{const q=px(it.x,it.y,.5);x=q[0];y=q[1]}
    it.sx=x;it.sy=y;const cl=it.el.className;it.r=it.relax?23:/bftgt/.test(cl)?32:/bfact/.test(cl)?(/skip/.test(cl)?24:37):0;it.hw=/bfact/.test(cl)?(/skip/.test(cl)?22:34):/bftgt/.test(cl)?32:0;if(it.relax||it.r)rel.push(it)}
  relaxItems(rel,Wd,Ht);
  for(const it of BF.items){if(it.sx==null)continue;const hw=it.hw||22,x=Math.max(hw,Math.min(Wd-hw,it.sx)),y=Math.max(22,Math.min(/bfm/.test(it.el.className)?Ht-(bar?bar.offsetHeight:90)-20:Ht-22,it.sy));it.el.style.display='';it.el.style.visibility='';it.el.style.transform=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-50%)`}
  svg.setAttribute('viewBox',`0 0 ${Wd} ${Ht}`);for(const p of BF.paths){const d=p.pts.map((q,i)=>{const v=px(q.x,q.y,p.h);return (i?'L':'M')+v[0].toFixed(1)+' '+v[1].toFixed(1)}).join('');if(p.el._d!==d){p.el._d=d;p.el.setAttribute('d',d)}}
  // the dice sit in the half of the board away from the two ships
  if(!dice.hidden&&G.atk||!dice.hidden&&UI.hold&&UI.hold.R){const A=G.atk||UI.hold.R;const a=ship(A.a),d=ship(A.d);if(a&&d){const ya=px(a.x,a.y)[1],yd=px(d.x,d.y)[1];const m=(ya+yd)/2;const want=m<Ht*.48?Math.min(Ht-dice.offsetHeight/2-110,Math.max(ya,yd)+dice.offsetHeight/2+40):Math.max(dice.offsetHeight/2+46,Math.min(ya,yd)-dice.offsetHeight/2-40);dice.style.top=Math.round(Math.max(dice.offsetHeight/2+40,Math.min(Ht-dice.offsetHeight/2-100,want)))+'px'}}
  if(BF.fing&&document.body.contains(BF.fing)&&BF.fing.offsetParent&&!(window.GXH&&GXH.state().cur&&GXH.state().cur.kind==='bulb')){const b=BF.fing.getBoundingClientRect(),o=ov.getBoundingClientRect();fing.hidden=false;const low=b.top-o.top+b.height*.55>o.height-48;fing.textContent='👆';fing.style.transform=`translate(${(b.left-o.left+b.width*(low?.62:.5)-6).toFixed(0)}px,${(low?b.top-o.top+2:b.top-o.top+b.height*.55).toFixed(0)}px)`}else fing.hidden=true}
// ---- hooks ----
const _sync=sync3D;sync3D=function(){try{if(BF.on&&ANIM&&G&&stepTwo())capture();}catch(e){console.error(e)}const r=_sync.apply(this,arguments);try{maybeRelease()}catch(e){console.error(e)}return r};
const _render=render;render=function(){_render();try{bfRender()}catch(e){console.error(e)}};
const _tap=PHN.tap;PHN.tap=function(e){if(BF.on)return PHN.tapBF(e)||(G&&G.phase==='ask'&&G.q&&humanTurn()?false:_tap(e));return _tap(e)};
// tap anywhere on a result to move on at once
document.addEventListener('pointerdown',e=>{if(!BF.on||!UI.hold||!G)return;if(typeof tutOn==='function'&&tutOn())return;if(e.target.closest('.gx-bar,#more,#modal,.gx-dock'))return;if(BF.holdT){clearTimeout(BF.holdT);BF.holdT=0}setTimeout(()=>{if(UI.hold)releaseHold()},0)},true);
const _rs=resize3D;resize3D=function(){const w=V3.w,h=V3.h;const r=_rs.apply(this,arguments);if(BF.on&&(V3.w!==w||V3.h!==h)){BF.fkey='';BF.key='';requestAnimationFrame(()=>{try{bfRender()}catch(e){}})}return r};
const _cv=camView;camView=function(){const r=_cv.apply(this,arguments);if(BF.on){BF.fkey='';requestAnimationFrame(()=>{try{bfRender()}catch(e){}})}return r};
BF.render=bfRender;BF.fit=fit;BF.release=release;BF.hideBan=()=>{if(ban)ban.hidden=true};BF.px=px;BF.shipR=shipR;BF.shownXY=shownXY;
})();
