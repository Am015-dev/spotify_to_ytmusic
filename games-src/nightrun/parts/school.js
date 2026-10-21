// PURPOSE: TRAINING = FLIGHT SCHOOL: one ordered list of drills (basics, loadout lessons, counters, gate, on foot), progress, next drill
// FLAG: school (?school=0)
// TEST: school-test.js
/* ---------- SCHOOL: TRAINING on HOME opens one plain list of drills (owner, 21 Oct 2026: "The training is very bad, it should be like flight school").
   Flag RET.school (default ON, needs RET.hub; ?school=0 = the old TRAINING sheet). A drill is one step of the Flight School engine (tut.js, TUT.D = a
   one-step sequence: coach line, glowing target, SKIP, the hull never runs out), one of the lesson mini stages (lessons.js) or a short on-foot run.
   Practice never touches Neon, stats, best scores or the story: the only thing written is mnr_school {id:{c:clears,t:best seconds}}; the on-foot drill puts
   the Neon bank back. Rows: tick when cleared, one tap starts, a result card (DRILL CLEAR / NOT YET) with NEXT DRILL, AGAIN, LIST; AGAIN is also on the
   coach bar. Lab, stage practice and the controls help sit under MORE on the same screen (2 taps from HOME). Test: nightrun/school-test.js. */
if(RET.school===undefined)RET.school=!/[?&]school=0/.test(location.search)&&RET.hub!==false&&RET.title!==false;
const SCH={D:null,list:[],cur:null,foot:null,onList:false};
setTimeout(()=>{if(!RET.school||!RET.hub||!$('hubGrid'))return;
const T=titleEl,sget=()=>load('mnr_school',{})||{};
const live=a=>a.filter(e=>e.hp>0&&G.en.includes(e));
const foe=e=>{const l=live(e)[0];return l&&{x:l.x,y:l.y,r:l.r+10,foe:1};};
const schKill=(id,ty,n,o,fn)=>({id,say:()=>'',init(){this.es=[];for(let i=0;i<n;i++){const oo=Object.assign({x:W+30+i*50,y:(i+1)/(n+1)*H},o||{});if(window.ZOO&&ZOO.T&&ZOO.T[ty]){const e=ZOO.mk(ty,oo);e.tut=1;this.es.push(e);}else this.es.push(tutEn(ty,oo));};if(fn)fn(this);},tgt(){return foe(this.es);},tick(){return !live(this.es).length;}});
const step=(o,say)=>{o.say=()=>(typeof say==='function'?say():say);return o;};
const SCH_S={
 shield:step(Object.assign(schKill('shield','shielder',3,null,()=>{P.emp=Math.max(P.emp,1);}),{}),()=>tutKB()?'Shields eat shots: press X, then shoot':'Shields eat shots: tap EMP, then shoot'),
 swarm:step(Object.assign(schKill('swarm','swarm',8,null),{free:1,tick(){const l=live(this.es);return !l.length&&this.es.filter(e=>e.hp<=0).length>=5;},tgt(){return foe(this.es);}}),'Swarm: many small foes, spray and sweep'),
 charger:step(Object.assign(schKill('charger','charger',3,null),{free:1,tick(){return !live(this.es).length&&this.es.filter(e=>e.hp<=0).length>=2;}}),'Chargers lock on, then rush: shoot, then sidestep'),
 bomber:step(schKill('bomber','bomber',2),'Bombers drop mines: kill them first'),
 carrier:step(schKill('carrier','carrier',1,null,s=>{for(const e of s.es){e.hp=Math.min(e.hp,18);e.max=e.hp;}}),'Carrier launches drones: break the hull'),
 gate:step({id:'gate',free:1,init(){this.e=tutEn('gate',{x:W+30,gy:H*.5,gap:170});},tgt(){const e=this.e;return live([e]).length?{x:e.x,y:e.gy,r:34,ring:1}:null;},
  tick(){const e=this.e;return !G.en.includes(e)||e.hp<=0||e.x<P.x-30;}},'Laser gate: fly through the gap when it is off'),
 fan:step({id:'fan',init(){this.f=0;this.tl=0;},
  beat(i){if(i%2||this.f>=8)return;this.f++;const x=W-60,y=H*.5;if(this.f%2){const a=Math.atan2(P.y-y,P.x-x);for(let k=-2;k<=2;k++)tutEb(x,y,a+k*.22,150);}
    else for(let k=0;k<14;k++)tutEb(x,y,k/14*6.283,110);AU.sfx('warn');},
  tick(dt){if(this.f>=8){this.tl+=dt;if(!G.eb.some(b=>b.tut)||this.tl>4)return true;}return false;}},'Boss pattern: weave the fan, slip the ring')};
const byId=id=>TUT_S.find(s=>s.id===id);
const GRP=[['BASICS','move, shoot, dash, EMP'],['LOADOUT','weapons, forge, slots, ships'],['COUNTERS','one tactic per enemy'],['BOSS AND GATES','patterns and laser gates'],['ON FOOT','street run basics']];
const DR=[
 [0,'move','MOVE','fly through 3 rings',()=>byId('move')],
 [0,'shoot','SHOOT','on-beat shots hit harder',()=>byId('shoot')],
 [0,'dodge','DODGE','weave through a slow fan',()=>byId('dodge')],
 [0,'dash','DASH ON THE BEAT','dash right on the pulse',()=>byId('dash')],
 [0,'pick','PICKUPS','weapon level and music power',()=>byId('pick')],
 [0,'emp','EMP AND HEAT','wipe bullets, cool the guns',()=>byId('emp')],
 [0,'timing','DASH TIMING','mini stage: dash through a wall','lesson:timing'],
 [1,'weapons','TWO SLOTS','two weapons fuse',()=>byId('weapons')],
 [1,'l-weapons','PICK A WEAPON','mini stage: lance or spread','lesson:weapons'],
 [1,'l-merge','FORGE','mini stage: merge two weapons','lesson:merge'],
 [1,'l-slots','LOADOUT SLOTS','mini stage: fill the four slots','lesson:slots'],
 [1,'l-ship','PICK A SHIP','mini stage: heavy or triplet','lesson:ship'],
 [2,'shield','SHIELDED','EMP strips shields',()=>SCH_S.shield],
 [2,'swarm','SWARM','spray and sweep',()=>SCH_S.swarm],
 [2,'charger','CHARGER','shoot, then sidestep',()=>SCH_S.charger],
 [2,'bomber','BOMBER','kill it before the mines',()=>SCH_S.bomber],
 [2,'carrier','CARRIER','break the hull, drones follow',()=>SCH_S.carrier],
 [2,'leader','LEADER','gold leader and its fan',()=>byId('leader')],
 [2,'l-counter','EMP COUNTERS','mini stage: shields and walls','lesson:counter'],
 [3,'gate','LASER GATE','fly through the gap',()=>SCH_S.gate],
 [3,'fan','BOSS PATTERN','fan and ring volleys',()=>SCH_S.fan],
 [4,'foot','ON FOOT','run, shoot 3 foes','foot']].map(([g,id,n,sub,k])=>({g,id,n,sub,k}));
SCH.list=DR;
const lsId=d=>typeof d.k==='string'&&d.k.startsWith('lesson:')?d.k.slice(7):null;
const avail=d=>lsId(d)?!!(RET.lessons&&typeof LS!=='undefined'&&LS.on&&LSN.some(l=>l.id===lsId(d))):d.k==='foot'?!!(RET.foot&&window.FOOT&&FOOT.STAGES&&FOOT.STAGES.street1):true;
const rows=()=>DR.filter(avail);
const done=d=>lsId(d)?LS.seen()[lsId(d)]===2:!!(sget()[d.id]&&sget()[d.id].c>0);
const nextD=()=>rows().find(d=>!done(d))||null;
/* ---------- the list screen (hub sheet look: back arrow, title, Neon) ---------- */
{const st=document.createElement('style');st.textContent=`
#schS .schProg{width:100%;max-width:440px;display:flex;align-items:center;gap:10px;font:700 15px var(--mono);color:#fff}
#schS .schProg i{flex:1 1 auto;height:8px;border-radius:4px;background:#2a2050;overflow:hidden}#schS .schProg i b{display:block;height:100%;background:#3dffb0}
#schS .schG{width:100%;max-width:440px;font:700 13px var(--display);letter-spacing:.16em;color:var(--cyan);border-bottom:1px solid #3a2b5c;padding:6px 0 2px;margin-top:4px}
#schS .schRow{width:100%;max-width:440px;min-height:48px;display:flex;align-items:center;gap:10px;text-align:left;font-size:15px;letter-spacing:.06em;padding:.3em .7em}
#schS .schRow .sk{flex:0 0 24px;font:700 18px var(--mono);color:#3dffb0;text-align:center}#schS .schRow.nx{border-color:#ffe14d}
#schS .schRow .sn{flex:1 1 auto;min-width:0;display:flex;flex-direction:column}#schS .schRow small{font:600 13px/1.2 var(--mono);letter-spacing:0;opacity:.85;white-space:normal}
#schS .schRow .sr{flex:0 0 auto;font:600 13px var(--mono);letter-spacing:0;opacity:.85}
#schS .hubBody{gap:6px}#tutB .schRe{display:none}#tutB.drl .schRe{display:block}
#tutB.drl .tn{display:none}`;document.head.appendChild(st);}
const el=document.createElement('div');el.id='schS';el.className='ov solid pg hubScr';el.hidden=true;el.setAttribute('role','dialog');el.setAttribute('aria-label','FLIGHT SCHOOL');
const top=document.createElement('div');top.className='top';
const bk=document.createElement('button');bk.type='button';bk.className='go alt hubBk';bk.id='schBack';bk.textContent='‹';bk.setAttribute('aria-label','Back');
const ttl=document.createElement('span');ttl.className='ttl';ttl.textContent='FLIGHT SCHOOL';const nn=document.createElement('span');nn.className='hubN';top.append(bk,ttl,nn);
const body=document.createElement('div');body.className='hubBody';el.append(top,body);T.appendChild(el);
const schBtn=(cls,html,fn,id)=>{const b=document.createElement('button');b.type='button';b.className=cls;b.innerHTML=html;if(id)b.id=id;b.addEventListener('click',fn);return b;};
function schDraw(){nn.innerHTML=neonI+' '+GA.bank;body.innerHTML='';const R=rows(),n=R.filter(done).length,nx=nextD(),sv=sget();
  const pr=document.createElement('div');pr.className='schProg';pr.id='schProg';pr.innerHTML='<span>'+n+'/'+R.length+' drills</span><i><b style="width:'+Math.round(100*n/Math.max(1,R.length))+'%"></b></i>';body.append(pr);
  body.append(schBtn('go hubAct',nx?'NEXT DRILL<small>'+nx.n+'</small>':'ALL DRILLS DONE<small>tap any drill to repeat it</small>',()=>run(nx||R[0]),'schNext'));
  let g=-1;for(const d of R){if(d.g!==g){g=d.g;const h=document.createElement('div');h.className='schG';h.textContent=GRP[g][0];body.append(h);}
    const ok=done(d),b=schBtn('go dim schRow'+(d===nx?' nx':''),'<span class="sk">'+(ok?'✓':'')+'</span><span class="sn">'+d.n+'<small>'+d.sub+'</small></span><span class="sr">'+(sv[d.id]&&sv[d.id].t?sv[d.id].t+'s':'')+'</span>',()=>run(d),'schD_'+d.id);
    b.dataset.drill=d.id;b.dataset.done=ok?1:0;body.append(b);}
  const mo=document.createElement('div');mo.className='hubMore';mo.innerHTML='<span>MORE</span>';const r=document.createElement('div');mo.append(r);
  const door=(l,sel,id)=>{if(!$(sel.slice(1)))return;r.append(schBtn('go dim',l,()=>{shut();const o=$(sel.slice(1));if(o)o.click();},id));};
  door('LAB','#labBtn','schLab');door('STAGE PRACTICE','#storyBtn','schPrac');door('LESSONS','#lsBtn','schLessons');body.append(mo);
  const kk=document.querySelector('#mnMore .keys');if(kk){const c=kk.cloneNode(true);c.removeAttribute('id');for(const x of c.querySelectorAll('[id]'))x.removeAttribute('id');body.append(c);}}
function open(){if(running||TUT.on)return;for(const x of T.querySelectorAll('.hubScr'))x.hidden=x!==el;T.hidden=false;el.hidden=false;SCH.onList=true;schDraw();const f=$('schNext');if(f)f.focus();}
function live_(){return !!(SCH.foot||(TUT.on&&TUT.D)||(typeof LS!=='undefined'&&LS.m));}
function stopDrill(){if(SCH.foot)footEnd(false,1);if(TUT.on&&TUT.D){SCH.noList=1;try{tutSkip();}catch(e){}SCH.noList=0;}   // leaving a drill (LIST, back, another drill, shut) fully stops it: no card, no list
  if(typeof LS!=='undefined'&&LS.m){LS.done=null;try{lsEnd(false);}catch(e){}}tutC.hidden=true;}
function shut(){stopDrill();el.hidden=true;SCH.onList=false;const t=$('hub_training');if(t&&t.focus)t.focus();if(RET.hubDraw)RET.hubDraw();}
bk.addEventListener('click',shut);
addEventListener('keydown',e=>{if(SCH.onList&&e.code==='Escape'&&!T.hidden&&$('setm').hidden&&lsC.hidden&&tutC.hidden){shut();e.stopImmediatePropagation();e.preventDefault();}},true);
$('hubGrid').addEventListener('click',e=>{if(e.target.closest&&e.target.closest('#hub_training')){e.stopPropagation();e.preventDefault();open();}},true);   // TRAINING = this list, one tap
$('playBtn').addEventListener('click',()=>{if(SCH.onList)shut();},true);
{const tl=$('hub_training');if(tl){const f=()=>{const s=tl.querySelector('small');if(s&&s.textContent!=='drills · lab')s.textContent='drills · lab';};f();new MutationObserver(f).observe(tl,{childList:true,subtree:true,characterData:true});}}
/* ---------- running a drill ---------- */
function mark(d,pass,t){if(!pass)return;const s=sget(),o=s[d.id]||{c:0,t:0};o.c++;if(t&&(!o.t||t<o.t))o.t=Math.round(t);s[d.id]=o;save('mnr_school',s);}
function card(d,pass,why){const nx=nextD();SCH.res={id:d.id,pass};
  const btns=[];if(pass&&nx&&nx!==d)btns.push(['schCardNext','NEXT DRILL','',()=>{tutC.hidden=true;run(nx);}]);
  btns.push(['schCardAgain',pass?'AGAIN':'TRY AGAIN',pass?'dim':'',()=>{tutC.hidden=true;run(d);}],['schCardList','LIST','dim',()=>{tutC.hidden=true;open();}]);
  tutCard('<b>'+(pass?'DRILL CLEAR':'NOT YET')+'</b><span>'+d.n+'</span><span>'+(why||(pass?'':'Try again, or skip ahead'))+'</span>',btns);}
function run(d){if(!d)return;if(live_())stopDrill();if(running||TUT.on)return;SCH.cur=d;SCH.res=null;el.hidden=true;SCH.onList=false;tutC.hidden=true;const ls=lsId(d);
  if(ls){lsShow(ls,()=>{if(T.hidden)return;open();});return;}
  if(d.k==='foot'){return runFoot(d);}
  let s=d.k();if(!s)return;if(SCH.wrap)s=SCH.wrap(s,d);TUT.D=[s];SCH.t0=performance.now();startTut();tutB.classList.add('drl');}
function runFoot(d){const bank=GA.bank,rt=RET.tale;RET.tale=false;let ok=false;window.__schFoot=true;try{ok=FOOT.start('street1');}catch(e){}RET.tale=rt;
  if(!ok){window.__schFoot=false;open();return;}SCH.foot={d,bank,kills:0,t0:performance.now(),end:0};if(SCH.sf)SCH.sf.footStart(SCH.foot);T.hidden=true;}
function footEnd(pass,quiet){const f=SCH.foot;if(!f||f.end)return;f.end=1;if(FOOT.S)FOOT.S.hintT=0;try{FOOT.stop();}catch(e){}
  GA.bank=f.bank;gsave();SCH.foot=null;window.__schFoot=false;if(quiet){T.hidden=false;return;}T.hidden=false;mark(f.d,pass,f.F&&f.F.t?f.F.t:(performance.now()-f.t0)/1000);card(f.d,pass,pass?(f.F&&f.F.t?Math.round(f.F.t)+' s · 3/3 rounds':'Run, shoot, repeat'):'Down: nothing is lost in practice');}
SCH.footEndNow=footEnd;SCH.was=id=>{const d=DR.find(x=>x.id===id||lsId(x)===id);return !!d&&done(d);};
NR.on('footKill',()=>{const f=SCH.foot;if(f&&!f.end&&f.F&&SCH.sf){SCH.sf.footKill(f,footEnd);return;}if(f&&!f.end&&++f.kills>=3)setTimeout(()=>footEnd(true),400);});
NR.on('footEnd',e=>{const f=SCH.foot;if(f&&!f.end&&!(e&&e.quit)&&SCH.sf&&SCH.sf.footDown(f))return;if(f&&!f.end&&!(f.F&&f.F.restart))setTimeout(()=>footEnd(false),0);});
{const f0=tutFinish;tutFinish=function(){if(!TUT.D)return f0.apply(this,arguments);const d=SCH.cur,l=TUT.log[TUT.log.length-1],pass=!!(l&&l.ok);
  TUT.ending=true;SCH.noList=1;if(running)quitToTitle();tutRestore();SCH.noList=0;T.hidden=false;mark(d,pass,l&&l.t);card(d,pass,pass?(SCH.wrap&&l&&l.t>0?Math.round(l.t)+' s · 3/3 rounds':''):"Time's up");};}
{const r0=tutRestore;tutRestore=function(){const was=TUT.on&&TUT.D;r0.apply(this,arguments);if(was){tutB.classList.remove('drl');TUT.D=null;if(!SCH.noList&&!SCH.again)setTimeout(()=>{if(!running&&!TUT.on)open();},60);}};}
{const b=document.createElement('button');b.type='button';b.className='schRe';b.id='schRe';b.textContent='AGAIN';tutB.insertBefore(b,$('tutSkip'));
  for(const ev of['touchstart','touchend','pointerdown','mousedown'])b.addEventListener(ev,e=>e.stopPropagation(),{passive:true});
  b.addEventListener('click',e=>{e.stopPropagation();const d=SCH.cur;if(!TUT.on||!d)return;SCH.again=1;tutSkip();SCH.again=0;run(d);});}
/* a drill is a step of the engine: starting one from the list must not look like the first-launch tutorial */
window.__school={get ids(){return rows().map(d=>d.id);},get all(){return DR.map(d=>d.id);},open,shut,run:id=>run(DR.find(d=>d.id===id)),get open_(){return !el.hidden;},
  get cur(){return SCH.cur&&SCH.cur.id;},get res(){return SCH.res||null;},done:()=>rows().filter(done).map(d=>d.id),next:()=>{const n=nextD();return n&&n.id;},
  pass(){const s=TUT.cur();if(!s)return;const t=s.tick;s.tick=function(){s.tick=t;return true;};},late(){TUT.t=TUT_MAX+1;},kinds:()=>Object.fromEntries(DR.map(d=>[d.id,lsId(d)?'lesson':d.k==='foot'?'foot':'tut'])),get foot(){return SCH.foot;}};
},0);
