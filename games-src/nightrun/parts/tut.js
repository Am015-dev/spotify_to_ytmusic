/* ---------- TUT: FLIGHT SCHOOL, a playable tutorial stage (about 3 minutes) ----------
   A run with G.tut set: no director, no waves, no stillness hunt, no Neon banking, no best / daily score. A scripted spawner runs eight short beats
   (rings, gold shots, a slow fan, the on-beat dash, pickups + tier, EMP + heat, the two weapon slots and their fusion, a leader), then a clear card
   with the Garage and a one-time Neon gift. One coach line at the top, one glowing target at a time, SKIP always on screen. Every beat ends on
   success or after 25 s ("Let's move on"); the hull never runs out ("No worries"). Storage: mnr_tut (1 offered, 2 finished), mnr_tutgift. */
const TUT_ON=true,TUT_GIFT=60,TUT_MAX=25;
const TUT={on:false,i:-1,t:0,ph:0,n:0,next:0,heal:0,said:0,still:0,ax:0,ay:0,eq0:null,eqT:null,auto0:null,ending:false,endShown:false,offerShown:false,objs:[],log:[]};
const tutKB=()=>!touchUI;
const tutEn=(type,o)=>{const e=en(type,o);e.tut=1;return e;};
const tutAlive=()=>G.en.filter(e=>e.tut&&e.hp>0&&G.en.includes(e));
function tutEb(x,y,a,s){const n=G.eb.length;eb(x,y,a,s,BULLET);if(G.eb.length>n)G.eb[G.eb.length-1].tut=1;}
function tutNice(t){floater(P.x,P.y-50,t||'NICE','#ffe14d');G.rings.push({x:P.x,y:P.y,l:.6,m:.6,c:'#ffe14d'});AU.sfx('perfect');}
const TUT_RING=[[.42,.28],[.68,.72],[.5,.5]];
const TUT_S=[
 {id:'move',say:()=>tutKB()?'Fly through the 3 rings (WASD)':'Drag to fly through the 3 rings',
  init(){this.k=0;},
  tgt(){const r=TUT_RING[this.k];return r&&{x:r[0]*W,y:r[1]*H,r:30,ring:1};},
  tick(){const g=this.tgt();if(g&&Math.hypot(P.x-g.x,P.y-g.y)<46){this.k++;G.rings.push({x:g.x,y:g.y,l:.5,m:.5,c:'#19e3ff'});AU.sfx('pick');floater(g.x,g.y-30,'RING '+this.k+'/3','#19e3ff');}return this.k>=3;}},
 {id:'shoot',say:()=>'On-beat shots glow gold, hit harder',
  init(){this.es=[.3,.5,.7].map((f,i)=>tutEn('drone',{x:W+30+i*60,y:f*H,amp:0}));},
  tgt(){const e=this.es.find(e=>e.hp>0&&G.en.includes(e));return e&&{x:e.x,y:e.y,r:e.r+10,foe:1};},
  tick(){return !this.es.some(e=>e.hp>0&&G.en.includes(e));}},
 {id:'dodge',say:()=>'Weave through the slow fan',
  init(){this.f=0;this.tl=0;},
  beat(i){if(i%2||this.f>=4)return;this.f++;const x=W-50,y=clamp(P.y+rnd(-60,60),60,H-80),a=Math.atan2(P.y-y,P.x-x);for(let k=-2;k<=2;k++)tutEb(x,y,a+k*.2,150);AU.sfx('warn');},
  tick(dt){if(this.f>=4){this.tl+=dt;if(!G.eb.some(b=>b.tut)||this.tl>4)return true;}return false;}},
 {id:'dash',say:()=>tutKB()?'Press SHIFT right on the pulse':'Tap DASH right on the pulse',
  init(){this.ok=false;},tgt(){return {x:P.x,y:P.y,r:34,pulse:1};},
  perfect(k){if(k==='dash')this.ok=true;},tick(){return this.ok;}},
 {id:'pick',say:()=>'Grab both pickups',
  init(){this.a={t:'up',x:W*.58,y:H*.32,vx:-14,vy:0,bob:0,tut:1};this.b={t:'pw',k:'drum',x:W*.58,y:H*.68,vx:-14,vy:0,bob:0,tut:1};G.pk.push(this.a,this.b);this.got=0;this.tl=0;},
  tgt(){const p=[this.a,this.b].find(p=>!p.dead);return p&&{x:p.x,y:p.y,r:22};},
  tick(dt){for(const p of[this.a,this.b]){if(p.x<P.x-40&&!p.dead)p.x=W*.6;if(p.dead&&!p.cnt){p.cnt=1;this.got++;
      TUT.line(p.t==='up'?'Pink: your weapon levels up':'Coins: music power-ups');}}
    if(this.got>=2){if(!this.tl){tierSet(C.n+TS,'kill',P.x,P.y);TUT.line('Tier: beat hits raise it, hits drop it');}this.tl+=dt;return this.tl>3.2;}return false;}},
 {id:'emp',say:()=>tutKB()?'Bullets! Press X: EMP wipes them':'Bullets! Tap EMP: it wipes them',
  init(){this.p=0;this.tl=0;P.emp=Math.max(P.emp,1);for(let k=0;k<12;k++)tutEb(W+10,H*(.12+k*.065),Math.PI+rnd(-.08,.08),55);},
  tick(dt){if(this.p===0){if(G.empT>0||!G.eb.some(b=>b.tut)){this.p=1;tutNice();P.heat=100;P.over=true;AU.sfx('heat');floater(P.x,P.y-24,'OVERHEAT','#ff5050');TUT.line('HEAT full: guns cool, then fire again');}return false;}
    this.tl+=dt;return !P.over&&this.tl>2.4;}},
 {id:'weapons',say:()=>'Two slots: two weapons fuse',
  init(){this.p=0;const a=WP.eq[0]||WP.eq[1]||WP_IDS[0];let b=WP.eq.find(x=>x&&x!==a);
    const fuses=y=>{WP.eq=[a,y];WP._fk=null;return !!WP.fu();};
    if(!b||!fuses(b))b=WP_IDS.find(y=>y!==a&&fuses(y))||WP_IDS.find(y=>y!==a);
    WP.eq=[a,b];WP._fk=null;WP.sync();TUT.eqT=JSON.stringify(WP.eq);
    const f=WP.fu();this.nm=f?f.name.toUpperCase():'';G.delayed.push({t:.9,f:()=>{if(TUT.on&&TUT.cur()===this&&!this.p){WP.show('title');WP.msg(f?'Two slots. Two weapons = FUSION: '+this.nm:'Two slots: pick any two');}}});},
  tick(){if(this.p===0){if(WP.open)this.seen=1;if(this.seen&&!WP.open){this.p=1;WP.fuT=4;TUT.line(this.nm?('Fire the fusion: '+this.nm).slice(0,40):'Fire your two weapons');
        this.es=[.25,.4,.55,.7].map((f,i)=>tutEn('drone',{x:W+30+i*40,y:f*H,amp:0}));}return false;}
    return !this.es.some(e=>e.hp>0&&G.en.includes(e));},
  tgt(){const e=this.es&&this.es.find(e=>e.hp>0&&G.en.includes(e));return e&&{x:e.x,y:e.y,r:e.r+10,foe:1};},
  end(){if(WP.open)WP.hide();}},
 {id:'leader',say:()=>'Shoot the gold leader. Dodge its fan',foes:1,
  init(){banner('LEADER','It fans after the red ring',true,2.4);const e=tutEn('drone',{x:W+40,y:H*.5,amp:0});e.ldr=1;e.lc=0;e.r=Math.round(e.r*1.35);e.hp=Math.round(e.hp*3.5);e.max=e.hp;this.e=e;
    this.es=[tutEn('drone',{x:W+90,y:H*.32,amp:0}),tutEn('drone',{x:W+90,y:H*.68,amp:0})];},
  tgt(){const e=this.e;return e.hp>0&&G.en.includes(e)?{x:e.x,y:e.y,r:e.r+12,foe:1}:null;},
  tick(){return !(this.e.hp>0&&G.en.includes(this.e));}}];
TUT.cur=()=>TUT.on?TUT_S[TUT.i]:null;
/* ----- the coach bar (DOM, top of the stage) and the cards ----- */
{const st=document.createElement('style');st.textContent=`
#tutB{position:absolute;z-index:6;top:58px;left:50%;transform:translateX(-50%);width:min(520px,calc(100% - 16px));display:flex;align-items:center;gap:8px;box-sizing:border-box;
 padding:4px 4px 4px 12px;background:#0d0820e8;border:2px solid var(--cyan);border-radius:12px;font:700 clamp(13px,2.2vw,17px) var(--display);color:var(--ink);pointer-events:none}
#tutB .tl{flex:1 1 0;min-width:0;line-height:1.2}#tutB .tn{font:12px var(--mono);color:var(--dim);flex:0 0 auto}
#tutB button{pointer-events:auto;flex:0 0 auto;min-width:64px;min-height:44px;border-radius:9px;border:2px solid var(--pink);background:#1a1033;color:#fff;font:700 14px var(--display);letter-spacing:.08em;cursor:pointer}
#tutB.hid .tl,#tutB.hid .tn{visibility:hidden}#tutB.ok{border-color:#ffe14d}
#tutC{position:fixed;inset:0;z-index:9050;display:flex;align-items:center;justify-content:center;background:rgba(5,3,12,.72);padding:12px;box-sizing:border-box}
#tutC .cc{width:min(420px,100%);background:#0d0820;border:2px solid var(--cyan);border-radius:14px;padding:16px;box-sizing:border-box;color:var(--ink);font:600 15px var(--display);text-align:center;display:flex;flex-direction:column;gap:10px}
#tutC b{font:700 22px var(--display);letter-spacing:.1em;color:var(--cyan)}#tutC .gf{color:#19e3ff;font-weight:700}#tutC .rw{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
#tutC button{min-height:48px;min-width:110px}
@keyframes tutG{0%,100%{box-shadow:0 0 0 0 #ffe14d00}50%{box-shadow:0 0 0 5px #ffe14daa}}.tutGlow{animation:tutG .8s ease-in-out infinite}`;document.head.appendChild(st);}
const tutB=document.createElement('div');tutB.id='tutB';tutB.hidden=true;tutB.innerHTML='<span class="tl" id="tutL"></span><span class="tn" id="tutN"></span><button type="button" id="tutSkip">SKIP</button>';stage.appendChild(tutB);
const tutC=document.createElement('div');tutC.id='tutC';tutC.hidden=true;document.body.appendChild(tutC);
for(const ev of['touchstart','touchmove','touchend','pointerdown','mousedown'])tutC.addEventListener(ev,e=>e.stopPropagation(),{passive:true});
TUT.line=t=>{const el=$('tutL');if(el&&el.textContent!==t)el.textContent=t;};
function tutCard(html,btns){tutC.innerHTML=`<div class="cc">${html}<div class="rw"></div></div>`;const rw=tutC.querySelector('.rw');
  for(const [id,label,cls,fn] of btns){const b=document.createElement('button');b.type='button';b.className='go '+(cls||'');b.id=id;b.textContent=label;b.addEventListener('click',e=>{e.stopPropagation();fn();});rw.appendChild(b);}
  tutC.hidden=false;const f=rw.querySelector('button');if(f)f.focus();}
addEventListener('keydown',e=>{if(tutC.hidden)return;if(e.code==='Escape'){const b=tutC.querySelector('button:last-child');if(b)b.click();}
  else if(e.code==='Enter'||e.code==='Space'){const b=document.activeElement&&tutC.contains(document.activeElement)?document.activeElement:tutC.querySelector('button');if(b)b.click();}
  else return;e.stopImmediatePropagation();e.preventDefault();},true);
/* ----- flow ----- */
function tutGo(i){const o=TUT.cur();if(o&&o.end)o.end();G.en=G.en.filter(e=>!e.tut);G.eb=G.eb.filter(b=>!b.tut);G.pk=G.pk.filter(p=>!p.tut);
  TUT.i=i;TUT.t=0;TUT.next=0;tutB.classList.remove('ok');if(i>=TUT_S.length){tutFinish();return;}
  const s=TUT_S[i];s.init();TUT.line(s.say());$('tutN').textContent=(i+1)+'/'+(TUT_S.length+1);
  const d=$('bDash'),m=$('bEmp');if(d)d.classList.toggle('tutGlow',s.id==='dash');if(m)m.classList.toggle('tutGlow',s.id==='emp');}
function startTut(){if(!TUT_ON||running)return;AU.unlock();pressed={};for(const el of[titleEl,overEl,pauseEl,setEl,selEl])if(el)el.hidden=true;tutC.hidden=true;ST.on=false;
  if(!load('mnr_tut',0))save('mnr_tut',1);
  newGame(false);G.tut=true;G.live=true;running=true;paused=false;AU.resume();NR.music.rate=1;AU.startStage(stageFor(0,false));NR.emit('runStart',{tut:true});
  SH.live=false;SH.neon=0;FPS.n=0;FPS.t=0;FPS.slow=0;FPS.worst=0;
  TUT.on=true;TUT.log=[];TUT.ending=false;TUT.endShown=false;TUT.eq0=WP.eq.slice();TUT.eqT=null;TUT.auto0=SET.auto;SET.auto=true;TUT.heal=0;TUT.still=0;TUT.said=0;TUT.ax=P.x;TUT.ay=P.y;
  tutB.hidden=false;syncUI();tutGo(0);}
function tutRestore(){if(!TUT.on)return;TUT.on=false;tutB.hidden=true;if(TUT.auto0!=null){SET.auto=TUT.auto0;TUT.auto0=null;}
  if(TUT.eqT&&JSON.stringify(WP.eq)===TUT.eqT&&TUT.eq0){WP.eq=TUT.eq0.slice();WP._fk=null;WP.sync();}      // the player did not change the slots: their own loadout comes back
  if(WP.open)WP.hide();for(const id of['bDash','bEmp']){const b=$(id);if(b)b.classList.remove('tutGlow');}}
function tutSkip(){if(!TUT.on)return;TUT.ending=true;if(running)quitToTitle();tutRestore();}
function tutFinish(){TUT.ending=true;save('mnr_tut',2);let gift=0;if(!load('mnr_tutgift',0)){gift=TUT_GIFT;GA.bank+=gift;gsave();save('mnr_tutgift',1);if(typeof garageDirty!=='undefined')garageDirty=true;}
  if(running)quitToTitle();tutRestore();TUT.endShown=true;
  tutCard(`<b>FLIGHT SCHOOL CLEAR</b><span>Garage: spend Neon on weapon levels</span>${gift?`<span class="gf">Gift: +${gift} Neon</span>`:''}`,
   [['tutGa','GARAGE','tutGlow',()=>{tutC.hidden=true;openGarage('title');}],['tutMenu','MENU','dim',()=>{tutC.hidden=true;const g=$('gaBtn');if(g){g.classList.add('tutGlow');setTimeout(()=>g.classList.remove('tutGlow'),6000);}}]]);}
function tutOffer(){TUT.offerShown=true;save('mnr_tut',1);
  tutCard('<b>NEW HERE?</b><span>3 minute flight school</span>',[['tutPlay','PLAY','',()=>{tutC.hidden=true;startTut();}],['tutNo','SKIP','dim',()=>{tutC.hidden=true;}]]);}
$('tutSkip').addEventListener('click',e=>{e.stopPropagation();tutSkip();});
for(const ev of['touchstart','touchend','pointerdown','mousedown'])$('tutSkip').addEventListener(ev,e=>e.stopPropagation(),{passive:true});
NR.on('runEnd',()=>{if(TUT.on&&!TUT.ending)tutRestore();});
NR.on('beat',d=>{const s=TUT.cur();if(s&&s.beat&&!G.dead)s.beat(d.i);});
NR.on('perfect',d=>{const s=TUT.cur();if(s&&s.perfect)s.perfect(d.kind);});
NR.on('tick',dt=>{if(!TUT.on||!G.tut||!running)return;const s=TUT.cur();if(!s)return;TUT.t+=dt;
  if(!s.foes)G.eb=G.eb.filter(b=>b.tut);else if(G.eb.length>8)G.eb.length=8;                     // only the tutorial's own bullets fly, the leader fires gently
  for(const e of G.en)if(e.tut&&e.hp>0)e.x=Math.max(e.x,W*(e.ldr?.66:.6));                        // targets fly in and wait in reach
  if(P.hp<P.max){TUT.heal+=dt;if(TUT.heal>.6){P.hp=P.max;TUT.heal=0;floater(P.x,P.y-40,'No worries','#3dffb0');}}else TUT.heal=0;
  if(s.id==='dodge'){if(Math.hypot(P.x-TUT.ax,P.y-TUT.ay)>40){TUT.ax=P.x;TUT.ay=P.y;TUT.still=0;}else TUT.still+=dt;
    if(TUT.still>2&&!TUT.said){TUT.said=1;floater(P.x,P.y-44,'KEEP MOVING','#ff6a7a');TUT.line('Standing still is dangerous!');}}
  if(TUT.next){TUT.next-=dt;if(TUT.next<=0){TUT.next=0;tutGo(TUT.i+1);}return;}
  if(WP.open&&s.id!=='weapons')WP.hide();
  if(s.tick(dt)){TUT.log.push({id:s.id,ok:1,t:+TUT.t.toFixed(1)});tutNice();tutB.classList.add('ok');TUT.line('NICE!');TUT.next=1.1;}
  else if(TUT.t>TUT_MAX){TUT.log.push({id:s.id,ok:0,t:+TUT.t.toFixed(1)});if(WP.open)WP.hide();TUT.line("Let's move on");TUT.next=1.1;}});
setInterval(()=>{const show=TUT.on&&running&&!paused;if(tutB.hidden===show)tutB.hidden=!show;tutB.classList.toggle('hid',!!WP.open);},150);
{const d0=die;die=function(){if(G&&G.tut){P.hp=P.max;floater(P.x,P.y-40,'No worries','#3dffb0');return;}return d0.apply(this,arguments);};}
/* ----- the glowing target, the ghost finger and the tame static warning (world layer) ----- */
{const dp=drawPickups;drawPickups=function(t){dp(t);const s=TUT.cur();if(!s||!G.tut||!s.tgt||TUT.next)return;const g=s.tgt();if(!g)return;
  ctx.save();ctx.globalCompositeOperation='lighter';const pu=.5+.5*Math.sin(t*6);
  if(g.ring){ctx.strokeStyle='#19e3ff';ctx.lineWidth=5;ctx.globalAlpha=.9;ctx.beginPath();ctx.arc(g.x,g.y,g.r+4*pu,0,7);ctx.stroke();ctx.globalAlpha=.25;ctx.lineWidth=14;ctx.stroke();
    if(s.id==='move'&&s.k===0){const f=(t*.7)%1,x=P.x+(g.x-P.x)*f,y=P.y+(g.y-P.y)*f;ctx.globalAlpha=.8*(1-f);ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(x,y,11,0,7);ctx.fill();   // the ghost finger slides to the first ring
      ctx.globalAlpha=.35;ctx.setLineDash([8,8]);ctx.lineWidth=2;ctx.strokeStyle='#ffffff';ctx.beginPath();ctx.moveTo(P.x,P.y);ctx.lineTo(g.x,g.y);ctx.stroke();ctx.setLineDash([]);}}
  else if(g.pulse){const ph=typeof PHF==='number'?PHF:0;ctx.strokeStyle='#ffe14d';ctx.lineWidth=3;ctx.globalAlpha=.9;ctx.beginPath();ctx.arc(g.x,g.y,g.r+40*ph,0,7);ctx.stroke();}   // the ring meets the ship on the beat
  else{ctx.strokeStyle=g.foe?'#ffe14d':'#3dffb0';ctx.lineWidth=3;ctx.globalAlpha=.6+.4*pu;ctx.setLineDash([10,7]);ctx.lineDashOffset=-t*30;ctx.beginPath();ctx.arc(g.x,g.y,g.r+3*pu,0,7);ctx.stroke();ctx.setLineDash([]);}
  if(s.id==='dodge'&&TUT.still>1.2){ctx.globalCompositeOperation='source-over';ctx.strokeStyle='#ff3050';ctx.globalAlpha=.7;ctx.lineWidth=2;ctx.setLineDash([6,6]);ctx.beginPath();ctx.arc(P.x,P.y,Math.max(20,60-TUT.still*10),0,7);ctx.stroke();ctx.setLineDash([]);}
  ctx.restore();};}
/* ----- entries: title (help row), Settings, first launch ----- */
setTimeout(()=>{if(!TUT_ON)return;
  const t2=document.getElementById('titleRow2'),b=document.createElement('button');b.type='button';b.className='go dim';b.id='tutBtn';b.textContent='FLIGHT SCHOOL';b.addEventListener('click',()=>startTut());
  if(t2)t2.appendChild(b);
  const sb=document.createElement('button');sb.type='button';sb.className='go dim';sb.id='tutBtnS';sb.textContent='REPLAY TUTORIAL';sb.addEventListener('click',()=>{if(running)return;closeSettings();startTut();});
  const body=$('setBody');if(body){const w=document.createElement('div');w.style.cssText='margin:6px 0 4px';w.appendChild(sb);body.appendChild(w);}
  const _os=openSettings;openSettings=function(from){_os(from);sb.hidden=from==='pause'||running;};
  const q=location.search,force=/[?&]tut=offer/.test(q);
  if(/[?&]tut=1/.test(q)){setTimeout(()=>startTut(),300);return;}
  const seen=load('mnr_tut',0),veteran=(best&&best.score>0)||(GA&&GA.runs>0);
  if(!seen&&veteran){save('mnr_tut',1);return;}                                    // a returning player is never asked
  if(!seen&&(force||!navigator.webdriver)&&!/[?&](lab|boss)=/.test(q))setTimeout(()=>{if(!running&&titleEl&&!titleEl.hidden)tutOffer();},900);},0);
window.__tut={get on(){return TUT.on},get i(){return TUT.i},get id(){const s=TUT.cur();return s?s.id:null},get t(){return TUT.t},get n(){return TUT_S.length},ids:TUT_S.map(s=>s.id),
  get endShown(){return TUT.endShown&&!tutC.hidden},get offerShown(){return TUT.offerShown&&!tutC.hidden},get next(){return TUT.next},
  target(){const s=TUT.cur();return s&&s.tgt?s.tgt():null;},start:()=>startTut(),go:i=>{if(TUT.on)tutGo(i);},get log(){return TUT.log},skip:()=>tutSkip(),bpos:()=>bpos(),get wpOpen(){return WP.open}};
