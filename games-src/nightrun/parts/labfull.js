// PURPOSE: LAB, complete: every test menu entry
// FLAG: labfull (?labfull=0)
// TEST: labfull-test.js
/* ---------- LAB, COMPLETE (flag RET.labfull, default ON; ?labfull=0 = the Lab exactly as before). Test: nightrun/labfull-test.js.
   Owner, 21 Oct 2026: "make sure everything can be shown in the lab so I can evaluate any bug."
   ONE REGISTRY: LAB.register(group, id, {name, spawn(ctx), reset, info:{role,hp,tele,flags,tip}}). Every content layer goes through it, and labfullScan() walks the
   tables the game itself uses (ZOO.T, FLEET.K, FLK.K, FOOT_ENEMIES, PWK, PWX.K, CLS.L, ABUP.U, SHIPS, FGR, FGM, WPD, RU.ORDER, NOV, ENDR.SIG, LSN, TUT_S, ART.ANIM ...) on
   every open of the DEX tab, so a new id in any of them shows up with no edit here. A later module may also call LAB.register itself.
   DEX tab: search box, group chips, tap an item = it spawns + an info card (id, role, hull budget, telegraph, flags, counter). CTRL tab: god mode, invulnerable, slow-mo,
   pause / frame step, hitboxes, spawn-at-cursor, clear / kill all, stage / wave / difficulty, seed lock, COPY REPRO, FPS and entity counter.
   SANDBOX: on entering the Lab the localStorage keys and the in-memory saves (garage, forge, weapons, story, settings, class, dash/EMP upgrades) are copied; leaving puts
   them back (the CHEATS tab is the one exception: it exists to change saves). Nothing here writes a stat, Neon or progression. armour.js and hard.js are not touched.
   Repro URL: &lab=1&lfseed=N&lfstage=N&lfwave=N&lfdiff=<key>&lfspawn=group:id,group:id replays the same spawns. ---------- */
if(RET.labfull===undefined)RET.labfull=!/[?&]labfull=0/.test(location.search);
const LF={on:()=>!!RET.labfull,R:new Map(),G:[],sel:null,q:'',grp:'enemy',add:false,place:false,cur:null,seed:null,lock:false,stage:0,wave:0,hb:false,inv:false,hold:false,step:0,slow:1,log:[],keep:false,snapD:null,held:null,fr:0,fps:0,fpsT:0,last:null,live:null,meter:{},sp:null,sh:{},shadow:false};
if(RET.labfull)window.LABFULL=LF;
LAB.register=(group,id,def)=>{def=def||{};let g=LF.R.get(group);if(!g){g={id:group,items:new Map()};LF.R.set(group,g);}
  const o=g.items.get(id);if(o&&!def.force){Object.assign(o,def);return o;}const it=Object.assign({group,id,name:id,info:{}},def);g.items.set(id,it);return it;};
LAB.registry=()=>LF.R;
const LF_G=[['enemy','ENEMY'],['fleet','FLEET'],['flank','FLANKER'],['variant','VARIANT'],['foot','ON FOOT'],['boss','BOSS'],['phase','PHASE'],['ship','SHIP'],['hybrid','HYBRID'],['mod','MOD'],['weapon','WEAPON'],['preset','PRESET'],['power','POWER'],['pickup','PICKUP'],
  ['dash','DASH/EMP'],['class','CLASS'],['skill','SKILL'],['rule','RULE'],['twist','TWIST'],['event','EVENT'],['form','FORMATION'],['wave','WAVE'],['meter','METER'],['lesson','LESSON'],['screen','SCREEN'],['tut','TUTORIAL'],['sprite','SPRITE']];
const lfFlag=k=>k+' '+(RET[k]?'on':'off')+' (?'+k+'=0 turns it off)';
const lfPos=()=>{const c=LF.place&&LF.cur;return c?{x:c[0],y:c[1]}:{x:W-90,y:H/2};};
const lfClear=()=>{if(!LF.add){G.en=G.en.filter(e=>e.type==='boss');G.eb=[];}};
function lfWithStage(f){const n=LF.stage;if(!n)return f();const a=ST.on,b=ST.n,c=ST.def;ST.on=true;ST.n=n;ST.def=null;try{return f();}finally{ST.on=a;ST.n=b;ST.def=c;}}
function lfSeed(){if(LF.seed==null)return;GR=mul(LF.seed);GX=mul(LF.seed+7919);try{VAR.st.seq=0;NOV.s=(LF.seed>>>0)||1;}catch(e){}}
function lfDo(it,extra){if(!running||!G||!G.lab||!it||!it.spawn)return false;const ctx=Object.assign(lfPos(),{W,H},extra||{});
  if(LF.lock||extra&&extra.reseed)lfSeed();LF.sel=it;LF.last=null;const n0=G.en.length;
  try{lfWithStage(()=>it.spawn(ctx));}catch(e){labNote('error: '+e.message);console.error(e);return false;}
  if(!extra||!extra.replay)LF.log.push(it.group+':'+it.id);
  LF.last=G.en.length>n0?G.en[G.en.length-1]:null;labNote('spawned '+it.name);return true;}
/* ===== registrations: each walks the table the game uses ===== */
function lfScan(){const R=LAB.register;
  // --- enemies: the old FOES chips, the zoo, the fleet, the flankers
  const core=[['drone','DRONE','fodder: straight, then hovers and fires','step aside, shoot',y=>en('drone',{x:lfPos().x,y,amp:0})],['sinedrone','SINE DRONE','drone on a sine path','lead the shot',y=>en('drone',{x:lfPos().x,y,amp:70,ph:0})],
    ['turret','TURRET','stops and fires aimed bursts','dash through the burst or kill it first',y=>en('turret',{x:lfPos().x,y,stop:W-250})],['charger','CHARGER','charges on a flash','dash sideways on the flash',y=>en('charger',{x:lfPos().x,y})],
    ['gunship','GUNSHIP','tough, fans of bullets','focus fire, weave the fan',y=>en('gunship',{x:lfPos().x,y})],['gate','GATE','wall with a gap','fly through the gap',y=>en('gate',{x:lfPos().x,gy:y,gap:130})],
    ['flank','FLANK','enters from the edge','watch the edge tell',y=>en('flank',{x:W-260,y:-22,ty:y,side:-1,t:0})],
    ['swarm','SWARM','eight small drones on a wave','spread weapon or EMP',y=>{for(let i=0;i<8;i++)en('swarm',{x:W-60+i*34,y,by:y,amp:50,ph:i*.55});}],['mine','MINE','sits and pulses','shoot it from range',y=>en('mine',{x:lfPos().x,y,by:y,ph:0})],
    ['leader','LEADER','gold leader, 3.5x hull, fans','kill it, dodge its fan',y=>{const e=en('drone',{x:lfPos().x,y,amp:0});e.ldr=1;e.lc=0;e.r=Math.round(e.r*1.35);e.hp=Math.round(e.hp*3.5);e.max=e.hp;}]];
  for(const [id,nm,role,tip,f] of core)R('enemy',id,{name:nm,info:{role,hp:'en() table x stage curve (see the card after it spawns)',tele:'wave entry shown by the formation',flags:'none (core)',tip},spawn:c=>{lfClear();f(c.y);}});
  if(window.ZOO)for(const id in ZOO.T){const T=ZOO.T[id];R('enemy',id,{name:id.toUpperCase(),info:{role:T.hint||'zoo helper',hp:T.hp+' hull base, scale.js x power',tele:'>= 0.5 s',flags:lfFlag('zoo'),tip:T.hint||''},spawn:c=>{lfClear();ZOO.mk(id,{x:c.x,y:c.y});}});}
  if(window.FLEET)for(const id in FLEET.K){const T=FLEET.K[id],te=T.k==='int'?FLEET.TELE.dive:T.k==='bom'?FLEET.TELE.bomb:T.k==='cru'?FLEET.TELE.beam:0;
    R('fleet',id,{name:id.replace(/^e/,'').toUpperCase(),info:{role:T.hint||'fleet drone',hp:T.lo+'-'+T.hi+' hits ('+T.hp+' base)',tele:te?te+' s':'none (escort)',flags:lfFlag('fleet'),tip:T.hint||''},spawn:c=>{lfClear();FLEET.mk(id,{x:c.x,y:c.y});}});}
  if(window.FLK)for(const id in FLK.K){const T=FLK.K[id];R('flank',id,{name:id.toUpperCase(),info:{role:'edge flanker, only vs a parked ship',hp:T.hp+' hull',tele:FLK.TELL+' s',flags:lfFlag('flankers')+' + anticamp',tip:'keep moving; kill it at the edge'},
    spawn:c=>{lfClear();FLK.mk({k:id,side:1,t:0,y:c.y});}});}
  // --- variants (size / mirror / rotation / tint / elite) on a drone
  if(window.VAR){const mk=(id,nm,f,role)=>R('variant',id,{name:nm,info:{role,hp:'size changes hull: mini .5, large 2.5, giant 2.5 x',tele:'as the base drone',flags:lfFlag('variants'),tip:'shape shows the variant, colour is extra'},spawn:c=>{lfClear();const a=VAR.force,on=VAR.on;VAR.force=f;VAR.on=()=>true;try{en('drone',{x:c.x,y:c.y,amp:0});}finally{VAR.force=a;VAR.on=on;}}});
    for(const [k,n] of [['M','MINI'],['L','LARGE'],['G','GIANT']])mk('size-'+k,'SIZE '+n,{c:k,o:'N',t:0,x:''},'size class '+n.toLowerCase());
    for(const [k,n] of [['V','MIRROR'],['T','TOP'],['B','BOTTOM'],['L','LOW ROT']])mk('mirror-'+k,n,{c:'N',o:k,t:0,x:''},'entry orientation '+n.toLowerCase());
    for(const t of [1,2,3])mk('tint-'+t,'TINT '+t,{c:'N',o:'N',t,x:''},'hue shift '+t);
    for(const [x,n] of [['sh','ELITE SHIELD'],['sp','ELITE SPEED'],['md','ELITE MEDIC']])mk('elite-'+x,n,{c:'N',o:'N',t:0,x},'elite behaviour '+x);}
  // --- on-foot enemies (separate engine: leaves the Lab, opens the sandbox stage, restores saves on exit)
  if(window.FOOT_ENEMIES){const TL={grunt:.5,gunman:.6,shield:.5,bruiser:.8,knife:.4,sniper:.5,drone:.4,turret:.8,mech:.7,jetpack:.7,hound:.6,flamer:.6,ninja:.55,medic:1};
    const ids=Object.keys(FOOT_ENEMIES).concat(Object.keys(window.FOOT_BOSS||{}).filter(k=>!FOOT_ENEMIES[k]));
    for(const id of ids){const D=FOOT_ENEMIES[id]||FOOT_BOSS[id]||{};R('foot',id,{name:id.toUpperCase(),info:{role:D.name||D.n||'on-foot enemy',hp:(D.hp!=null?D.hp:'?')+' (Normal; the engine scales it)',tele:(TL[id]?TL[id]+' s':'see FOOT-ENEMIES.md'),flags:lfFlag('foot')+', '+lfFlag('footstage'),tip:'FOOT-ENEMIES.md has the counter'},spawn:()=>lfFoot({e:id})});}
    const FS=window.FOOT&&FOOT.STAGES&&FOOT.STAGES.zeil;if(FS&&FS.cps)['START'].concat(FS.cps.map((x,i)=>'SECTION '+(i+2))).forEach((n,i)=>R('foot','sec'+(i+1),{name:n,info:{role:'jump the on-foot stage to section '+(i+1),hp:'-',tele:'-',flags:lfFlag('footstage'),tip:'checkpoint x='+(i?FS.cps[i-1]:0)},spawn:()=>lfFoot({x:i?FS.cps[i-1]:0})}));}
  // --- bosses: 10 + the phase jump + the live meters
  LAB_B.forEach((B,i)=>R('boss',B.art,{name:B.n,info:{role:(B.o.mini?'mini-boss':'boss')+', home district '+LAB_D[B.home],hp:'armour.js cap + phase floors (live on the card)',tele:'wind-up pose before every attack',flags:lfFlag('boss2')+', bossplay '+(RET.bossplay?'on':'off (?bossplay=1)'),tip:'phase 2 and 3 add patterns; HP LOCK keeps it alive'},spawn:()=>{LAB.bi=i;LAB.di=B.home;LAB.phase=0;LAB.pat=null;LAB.pose=null;labSpawn();}}));
  for(const n of [0,1,2,3])R('phase',String(n),{name:n?'PHASE '+n:'AUTO',info:{role:n?'lock the boss in phase '+n:'let the boss progress itself',hp:'phase floors from armour.js',tele:'-',flags:'boss2',tip:'spawn a boss first'},spawn:()=>{if(!labBoss())labSpawn();labPhase(n);}});
  // --- ships, forge, weapons, presets
  if(window.SHIPS||true)for(const s of SHIPS)R('ship',s.id,{name:(s.n||s.id).toUpperCase(),info:{role:s.t||'ship',hp:'hull from the ship table',tele:'-',flags:'sprites '+(RET.sprites?'on':'off'),tip:'equips for this Lab session only'},spawn:()=>{GA.ship=s.id;SH.ship=s.id;SH.recalc();P.max=Math.max(P.max,3);P.hp=P.max;}});
  if(typeof FGR!=='undefined')for(const r of FGR)R('hybrid',r[2],{name:r[3].toUpperCase(),info:{role:r[5],hp:'-',tele:'-',flags:lfFlag('forge'),tip:'recipe '+r[0]+' + '+r[1]},spawn:()=>lfHybrid(r)});
  if(typeof FGM!=='undefined')for(const m of FGM)R('mod',m[0],{name:m[1],info:{role:m[4],hp:'damage x'+m[3],tele:'-',flags:lfFlag('forge'),tip:'one mod on the first weapon slot'},spawn:()=>lfMod(m)});
  for(const id in WPD)R('weapon',id,{name:WPD[id].s||id.toUpperCase(),info:{role:WPD[id].tx,hp:'-',tele:'-',flags:'none',tip:'equips slot A'},spawn:()=>{WP.pl[id]=WP.pl[id]||1;WP.eq[0]=id;WP._fk=null;try{WP.sync();}catch(e){}}});
  [['A','pulse','laser',[]],['B','swarm','disc',['homing']],['C','arc','beat',['pierce']]].forEach(([n,a,b,m])=>R('preset',n,{name:'PRESET '+n+': '+a+' + '+b,info:{role:'a lab loadout of two weapons'+(m.length?' with '+m[0]:''),hp:'-',tele:'-',flags:lfFlag('forge'),tip:'compare how each pair handles the same foe'},spawn:()=>{for(const w of [a,b])WP.pl[w]=WP.pl[w]||1;WP.eq[0]=a;WP.eq[1]=b;WP._fk=null;try{WP.sync();}catch(e){}if(window.FG&&FG.on&&m.length){const s=FG.st();s.mods[m[0]]=1;s.lo.w[0]=a;s.lo.m[0]=m.slice();FG.ver++;}}}));
  // --- power-ups: every PWK key (old, arsenal, star) and the four pickups
  for(const k in PWK){const P_=PWK[k],X=window.PWX&&PWX.K&&PWX.K[k];R('power',k,{name:P_.n,info:{role:P_.tip||(X&&X.tip)||'power-up',hp:'-',tele:'-',flags:X?lfFlag('powers'):'power.js',tip:(P_.bars?P_.bars+' bars':'charge')+(X?' ('+X.r+')':'')},spawn:()=>{PW.give(k,true);}});}
  for(const [id,nm,t] of [['shard','SHARD','shard'],['hp','HULL','hp'],['up','UPGRADE','up'],['emp','EMP','emp']])R('pickup',id,{name:nm,info:{role:'pickup drifting to the ship',hp:'-',tele:'-',flags:'none',tip:'fly into it'},spawn:c=>{G.pk=[];G.pk.push({t,x:c.x-130,y:c.y,vx:-60,vy:0,bob:0});}});
  // --- dash / EMP upgrades, signatures, classes, skills
  if(window.ABUP)for(const u of ABUP.U)R('dash',u.id,{name:u.n,info:{role:u.t,hp:'-',tele:'-',flags:lfFlag('abup'),tip:u.tip+' (tap again to revoke)'},spawn:()=>{if(ABUP.own[u.id])delete ABUP.own[u.id];else ABUP.own[u.id]=1;labNote(u.n+(ABUP.own[u.id]?' granted':' revoked'));}});
  if(window.ABIL){const em=ABIL.EMOD||{};for(const k in em)R('dash','emp-'+k,{name:'EMP SIG '+k.toUpperCase()+' ('+em[k]+')',info:{role:'EMP signature "'+em[k]+'" when '+k+' is held',hp:'-',tele:'-',flags:lfFlag('abil'),tip:'holds the power-up, then fires an EMP'},spawn:()=>{PW.give(k,true);P.emp=Math.max(P.emp,2);try{ABIL.emp();}catch(e){}}});}
  if(window.CLS){for(const c of CLS.L){R('class',c.id,{name:c.n,info:{role:c.p,hp:'passive: '+c.pd,tele:'signature '+c.sig+': '+c.sd,flags:lfFlag('classes'),tip:'class for this Lab session only'},spawn:()=>lfClass(c.id)});
      c.T.forEach((n,i)=>R('skill',n.id,{name:c.n.slice(0,3)+' '+n.n,info:{role:CLS.kTxt?CLS.kTxt(n.k):JSON.stringify(n.k),hp:'knobs clamped by CLS.KC',tele:'-',flags:lfFlag('classes'),tip:'row '+((i>>1)+1)+' of '+c.n+' (tap again to revoke)'},spawn:()=>lfSkill(c,n)}));}}
  // --- rules, twists, events, formations, endless waves
  if(window.RU)for(const id of RU.ORDER){const D=RU.T[id];for(const tw of [0,1])R('rule',id+(tw?'~tw':''),{name:(D.n||id).toUpperCase()+(tw?' (TWIST)':''),info:{role:tw?D.tt:D.t,hp:'no hull damage by design',tele:RU.TEL+' s',flags:lfFlag('rules'),tip:'dash and EMP change it ('+(D.dash?'dash ':'')+(D.emp?'emp':'')+')'},spawn:()=>lfRule(id,tw)});}
  if(window.NOV){const tws=new Set(NOV.tw.concat(NOV.UN.filter(u=>u.tw).map(u=>u.tw),NOV.EPTW)),evs=new Set(NOV.ev.concat(NOV.UN.filter(u=>u.ev).map(u=>u.ev)));
    for(const t of tws)R('twist',t,{name:t.toUpperCase(),info:{role:'wave twist "'+t+'"',hp:'by twist',tele:'tag on the wave',flags:lfFlag('novelty'),tip:'applied to a drone pack'},spawn:c=>{lfClear();for(let i=0;i<4;i++){const e=en('drone',{x:c.x+i*30,y:c.y+(i-1.5)*40,amp:0});try{NOV.twist(e,t);}catch(x){}}}});
    for(const v of evs)R('event',v,{name:v.toUpperCase(),info:{role:'mini-event "'+v+'"',hp:'-',tele:'banner',flags:lfFlag('novelty'),tip:'runs once'},spawn:()=>lfEvent(v)});}
  if(window.ENDR)for(const s of ENDR.SIG)R('form',s.id,{name:s.nm.toUpperCase(),info:{role:'endless signature, tier from '+s.t,hp:'-',tele:'formation entry',flags:lfFlag('endramp'),tip:'DIR pattern '+s.id},spawn:()=>{lfClear();if(s.run)s.run();else if(PATS[s.id])PATS[s.id].f();}});
  if(window.ENDR)for(const n of [1,2,3,5,8,12,16,20,30,40,60,90])R('wave','w'+n,{name:'WAVE '+n,info:lfWaveInfo(n),spawn:()=>lfWave(n)});
  // --- meters
  for(const [id,nm,role] of [['fps','FPS + ENTITIES','frames per second and what is on screen'],['pacing','PACING','PAC crowd cap, alive, dph (pacing.js)'],['hold','HOLDLINE','HOLD zone, penalty, leaks (holdline.js)'],['boss','BOSS GATE / ENRAGE / CAP','gate state, enrage meter, last stand and damage-cap timers'],['ramp','ENDLESS RAMP','knobs of the wave you set']])
    R('meter',id,{name:nm,info:{role,hp:'-',tele:'-',flags:'-',tip:'a line above the panel; tap again to hide'},spawn:()=>{LF.meter[id]=!LF.meter[id];lfMeter();}});
  // --- lessons, screens, tutorial steps, sprite strips
  if(typeof LSN!=='undefined')for(const L of LSN){const ph=(L.ph||[]).map(p=>p.id).join(', ');R('lesson',L.id,{name:(L.n||L.id).toUpperCase(),info:{role:'mini stage "'+L.id+'"',hp:'-',tele:'-',flags:lfFlag('lessons'),tip:ph?'phases: '+ph:'replays the lesson'},spawn:()=>lfLesson(L.id)});}
  for(const [id,nm,eye,txt] of [['over','GAME OVER','Signal lost','run ends, score and best'],['best','NEW BEST','New best run','record screen'],['daily','DAILY OVER','Daily run over','daily result'],['stf','STAGE FAILED','Stage 7 failed','story fail'],['nohit','NO-HIT FAIL','Hit. No-hit run over','challenge fail'],['time','OUT OF TIME','Out of time','speed challenge fail'],['perf','PERFECT SHORT','Short of the PERFECT target','perfect challenge fail'],['clear','STAGE CLEAR','','stage clear banner']])
    R('screen',id,{name:nm,info:{role:txt,hp:'-',tele:'-',flags:'none',tip:'preview only: no save, no stat'},spawn:()=>lfScreen(eye||'Stage clear',id==='clear')});
  if(typeof TUT_S!=='undefined')TUT_S.forEach((s,i)=>R('tut',s.id,{name:(i+1)+' '+s.id.toUpperCase(),info:{role:'tutorial step '+(i+1)+': '+(typeof s.say==='function'?s.say():s.say),hp:'-',tele:'-',flags:'tutorial',tip:'leaves the Lab; the tutorial flag is put back'},spawn:()=>lfTut(i)}));
  if(ART.ANIM&&ART.ANIM.s)for(const k in ART.ANIM.s){const m=ART.ANIM.s[k];R('sprite',k,{name:k.replace('/',' · '),info:{role:'strip sheet '+k,hp:'-',tele:'-',flags:'sprites '+(RET.sprites?'on':'off'),tip:m[0]+' frames at '+m[1]+' fps, '+m[2]+'x'+m[3]},spawn:()=>lfSprite(k)});}
  else R('sprite','none',{name:'NO STRIP LOADER',info:{role:'ART.ANIM absent: strips are probed by file name',hp:'-',tele:'-',flags:'-',tip:'-'},spawn:()=>labNote('no strips here')});
}
/* ===== the spawn helpers ===== */
function lfHybrid(r){if(!window.FG)return;const s=FG.st();for(const w of [r[0],r[1]])WP.pl[w]=WP.pl[w]||1;s.hy[r[2]]=Math.max(1,s.hy[r[2]]|0);WP.eq[0]=r[0];WP._fk=null;try{WP.sync();}catch(e){}s.lo.w[0]='h:'+r[2];s.lo.m[0]=[];FG.ver++;}
function lfMod(m){if(!window.FG)return;const s=FG.st();s.mods[m[0]]=1;if(!s.lo.w[0])s.lo.w[0]=WP.eq[0];s.lo.m[0]=[m[0]];FG.ver++;}
function lfClass(id){const C=window.CLS;if(!C)return;C.force=id;LF.cls=id;C.begin({});if(C.R)C.R.live=true;labNote('class '+id);}
function lfSkill(c,n){const s=LF.mem.cls;if(s.own[n.id])delete s.own[n.id];else s.own[n.id]=1;if(CLS.force!==c.id){CLS.force=c.id;}CLS.begin({});labNote(n.n+(s.own[n.id]?' granted':' revoked'));}
function lfRule(id,tw){if(!window.RU)return;RU.st={i:RU.idx(),list:[{id,tw,age:-.2,o:{},on:0}],card:0};LF.ru=true;labNote('rule '+id);}
function lfEvent(v){if(!window.NOV)return;const on=NOV.on;NOV.on=()=>true;try{NOV.run(v,'');}catch(e){labNote('event '+e.message);}finally{setTimeout(()=>{NOV.on=on;},0);}}
function lfWaveInfo(n){if(!window.ENDR||!window.SET)return{role:'endless wave '+n};const r=ENDR.at(ENDR.KEYS.includes(SET.diff)?SET.diff:'normal',n);
  return{role:'endless wave '+n+': key '+r.key+', climb '+(r.k*100|0)+'%, late '+(r.e*100|0)+'%',hp:'hull x'+(r.knobs.hp||1).toFixed(2),tele:'-',flags:lfFlag('endramp'),tip:'formation tier floor '+ENDR.tier(n).toFixed(1)};}
function lfWave(n){if(!window.ENDR)return;LF.wave=n;const base=ENDR.KEYS.includes(LF.dKey||SET.diff)?(LF.dKey||SET.diff):'normal';ENDR.real=base;const r=ENDR.at(base,n);DF=r.knobs;SET.diff=r.key;HARD=HARDS.includes(r.key);ENDR.w=n;ENDR.eff=r.key;LF.meter.ramp=true;lfMeter();labNote('wave '+n+' -> '+r.key);}
function lfLesson(id){if(!window.__lessons)return;try{__lessons.show(id,()=>labNote('lesson done'));}catch(e){labNote('lesson '+e.message);}}
function lfScreen(eye,clear){if(clear){banner('STAGE CLEAR','LAB PREVIEW',false,2.6);return;}$('overEyebrow').textContent=eye;$('oScore').textContent=window.fmtN(123456);$('oDist').textContent='MAIN +1';$('oPerf').textContent=42;$('oBest').innerHTML='Best <strong>999.999</strong> · LAB';
  overEl.hidden=false;overEl.style.pointerEvents='none';LF.scr=true;lfBar();}
function lfBar(){let b=$('lfBar');if(!b){b=lel('button','lc x','CLOSE PREVIEW');b.id='lfBar';b.type='button';b.style.cssText='position:absolute;right:8px;top:8px;z-index:9;min-height:44px';b.addEventListener('click',()=>{overEl.hidden=true;overEl.style.pointerEvents='';b.hidden=true;LF.scr=false;});stage.appendChild(b);}b.hidden=!LF.scr;}
function lfFoot(o){LF.keep=false;LF.defer=true;LF.shadow=true;quitToTitle();setTimeout(()=>{try{const m=$('fMenu');if(m)m.hidden=true;const tl=RET.tale;RET.tale=false;let ok;try{ok=FOOT.start('zeil');}finally{RET.tale=tl;}if(!ok)return;const S=FOOT.S;S.waves.forEach(w=>w.done=true);S.E.length=0;
    if(o.x!=null){S.P.x=o.x+60;S.camX=Math.max(0,S.P.x-200);S.cpN=Math.max(0,FOOT.STAGES.zeil.cps.findIndex(x=>x>=o.x));}
    if(o.e)FOOT.env.spawn(o.e,S.camX+FOOT.hudInfo().vw-140,null);}catch(e){console.error(e);}},120);}
function lfTut(i){LF.keep=false;LF.defer=true;LF.shadow=true;quitToTitle();setTimeout(()=>{try{startTut();tutGo(i);}catch(e){console.error(e);}},120);}
function lfSprite(key){LF.sp={key,fps:null,smooth:true,t:0};lfSpritePane();}
/* ===== sprite pane: plays one strip with its fps; works with or without ART.anim ===== */
const LF_IMG={};
function lfSpritePane(){let p=$('lfSp');if(!p){p=lel('div');p.id='lfSp';p.style.cssText='position:absolute;left:6px;top:6px;z-index:8;background:#07040fe8;border:1px solid #3a2b5c;border-radius:8px;padding:6px;font:14px var(--mono);color:var(--ink);max-width:calc(100% - 12px)';
    p.innerHTML='<canvas width="192" height="192" style="display:block;background:repeating-conic-gradient(#1a1230 0 25%,#120c22 0 50%) 0 0/16px 16px;border-radius:5px;width:192px;height:192px"></canvas><div id="lfSpT" style="margin:4px 0"></div><div id="lfSpB" style="display:flex;gap:4px;flex-wrap:wrap"></div>';stage.appendChild(p);
    const B=$('lfSpB');for(const [t,f] of [['SLOWER',()=>LF.sp.fps=Math.max(1,(lfSpFps()||8)-2)],['FASTER',()=>LF.sp.fps=(lfSpFps()||8)+2],['SMOOTH',()=>LF.sp.smooth=!LF.sp.smooth],['CLOSE',()=>{LF.sp=null;p.hidden=true;}]]){const b=lel('button','lc',t);b.type='button';b.style.minHeight='44px';b.addEventListener('click',f);B.append(b);}
    const cv=p.querySelector('canvas'),cx=cv.getContext('2d'),loop=t=>{if(!LF.sp||p.hidden){return;}const s=LF.sp,im=lfSpImg(s.key);cx.clearRect(0,0,192,192);cx.imageSmoothingEnabled=!!s.smooth;
      if(im&&im.complete&&im.naturalWidth){const m=lfSpMeta(s.key,im),fr=Math.floor(t/1000*(lfSpFps()||m.fps))%m.n;const k=Math.min(192/m.w,192/m.h);cx.drawImage(im,fr*m.w,0,m.w,m.h,(192-m.w*k)/2,(192-m.h*k)/2,m.w*k,m.h*k);$('lfSpT').textContent=s.key+' · '+m.n+' frames · '+(lfSpFps()||m.fps)+' fps · '+(s.smooth?'smooth':'crisp');}
      requestAnimationFrame(loop);};p._loop=loop;}
  p.hidden=false;requestAnimationFrame(p._loop);}
const lfSpFps=()=>LF.sp&&LF.sp.fps;
function lfSpImg(key){const u=ART.base+'anim/'+key+'-strip.webp';if(!LF_IMG[u]){const i=new Image();i.src=u;LF_IMG[u]=i;}return LF_IMG[u];}
function lfSpMeta(key,im){const a=window.ART&&ART.ANIM&&ART.ANIM.s&&ART.ANIM.s[key];if(a)return{n:a[0],fps:a[1],w:a[2],h:a[3]};const h=im.naturalHeight,n=Math.max(1,Math.round(im.naturalWidth/h));return{n,fps:8,w:im.naturalWidth/n,h};}
/* ===== meters ===== */
function lfMeter(){let m=$('lfMeter');if(!m){m=lel('div');m.id='lfMeter';m.style.cssText='position:absolute;left:0;right:0;bottom:var(--lfh,0px);z-index:5;font:12px var(--mono);color:var(--amber);background:#07040fcc;padding:2px 8px;white-space:pre-wrap;pointer-events:none;max-height:64px;overflow:hidden';stage.appendChild(m);}
  const on=Object.keys(LF.meter).filter(k=>LF.meter[k]);if(!on.length||!(running&&G&&G.lab)){m.hidden=true;return;}m.hidden=false;const o=[];
  for(const k of on){if(k==='fps')o.push(`${LF.fps} fps · en ${G.en.length} eb ${G.eb.length} pb ${G.pb.length} pk ${G.pk.length}`);
    else if(k==='pacing'&&window.PAC)o.push(`PAC alive ${PAC.alive?PAC.alive():'-'}/${PAC.cap?PAC.cap():'-'} soft ${PAC.soft?+PAC.soft():'-'} dph ${(PAC.dph||0).toFixed?PAC.dph.toFixed(1):PAC.dph}`);
    else if(k==='hold'&&window.HOLD)o.push(`HOLD zone ${HOLD.zone}px · leaks ${HOLD.n} · penalty ${HOLD.pen$} · back ${HOLD.back} · frac ${HOLD.frac().toFixed(2)}`);
    else if(k==='boss'){const e=labBoss();o.push(e?`${e.nm} ph ${e.ph} hp ${Math.round(e.hp)}/${e.max}`+(e.bp?` · rage ${(e.bp.rg||0).toFixed(1)} gate ${e.bp.g?e.bp.g.m:'-'}`:'')+(e.b2?` · last-stand ${(e.b2.ls||0).toFixed(1)}s · shield ${Math.max(0,e.b2.sh||0).toFixed(1)}s`:''):'no boss');}
    else if(k==='ramp'&&window.ENDR)o.push(`RAMP wave ${ENDR.w} key ${ENDR.eff||SET.diff} bullets x${(DF.bs||1).toFixed(2)} hull x${(DF.hp||1).toFixed(2)} fan ${DF.fan} el ${DF.el}`);}
  m.textContent=o.join('\n');}
/* ===== sandbox: copy the saves on entering, put them back on leaving ===== */
const lfClone=o=>{try{return JSON.parse(JSON.stringify(o));}catch(e){return null;}};
const lfPut=(dst,src)=>{if(!dst||!src)return;for(const k of Object.keys(dst))delete dst[k];Object.assign(dst,lfClone(src));};
LF.snap=()=>{const ls={};try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);ls[k]=localStorage.getItem(k);}}catch(e){}
  return{ls,GA:lfClone(GA),FG:window.FG&&FG.s?lfClone(FG.s):null,WP:{eq:WP.eq.slice(),pl:lfClone(WP.pl),lv:lfClone(WP.lv)},AB:window.ABUP?lfClone(ABUP.own):null,SS:lfClone(sSave),SET:lfClone(SET),force:window.CLS?CLS.force:null,fb:window.FG?FG.ver:0};};
LF.restore=s=>{if(!s)return;try{for(let i=localStorage.length-1;i>=0;i--){const k=localStorage.key(i);if(!(k in s.ls))localStorage.removeItem(k);}for(const k in s.ls)if(localStorage.getItem(k)!==s.ls[k])localStorage.setItem(k,s.ls[k]);}catch(e){}
  lfPut(GA,s.GA);if(s.FG&&window.FG)FG.s=lfClone(s.FG);WP.eq=s.WP.eq.slice();lfPut(WP.pl,s.WP.pl);lfPut(WP.lv,s.WP.lv);if(s.AB)lfPut(ABUP.own,s.AB);lfPut(sSave,s.SS);lfPut(SET,s.SET);if(window.CLS)CLS.force=s.force;if(window.FG)FG.ver++;WP._fk=null;
  DF=DIFFS[SET.diff]||DIFFS.normal;HARD=HARDS.includes(SET.diff);if(window.ENDR)ENDR.eff='';try{SH.recalc();}catch(e){}garageDirty=true;};
LF.mem={cls:{c:'',xp:0,own:{}}};LF.sh={};
function lfInit(){if(LF.inited)return;LF.inited=true;
  {const SP=Storage.prototype,gi=SP.getItem,si=SP.setItem,ri=SP.removeItem,gd=t=>t===localStorage&&RET.labfull&&!LF.keep&&(LF.shadow||running&&G&&G.lab);   // while the Lab runs, game saves go to a shadow copy and die with the Lab
    SP.setItem=function(k,v){if(gd(this)){LF.sh[k]=String(v);return;}return si.apply(this,arguments);};
    SP.removeItem=function(k){if(gd(this)){LF.sh[k]=null;return;}return ri.apply(this,arguments);};
    SP.getItem=function(k){if(gd(this)&&k in LF.sh)return LF.sh[k];return gi.apply(this,arguments);};}
  if(window.CLS){const sv=CLS.sv,pu=CLS.put;CLS.sv=function(){return LF.labRun()?LF.mem.cls:sv.apply(this,arguments);};CLS.put=function(s){if(LF.labRun())LF.mem.cls=s;else pu.apply(this,arguments);};}
  if(window.RU){const on=RU.on;RU.on=function(){return LF.labRun()&&LF.ru?!!RET.rules&&running&&!G.dead:on.apply(this,arguments);};const st=RU.start;RU.start=function(){if(LF.labRun())return;return st.apply(this,arguments);};}
  {const u=update;update=function(dt){if(LF.labRun()){if(LF.hold){if(LF.step<=0)return;LF.step--;}dt*=LF.slow;if(LF.inv)P.inv=Math.max(P.inv,.5);}return u.call(this,dt);};}
  {const dp=drawPlayer;drawPlayer=function(){dp.apply(this,arguments);if(LF.hb&&LF.labRun())lfBoxes();};}
  {const r=render;render=function(){LF.fr++;return r.apply(this,arguments);};}
  NR.on('tick',()=>{if(!LF.labRun())return;if(LF.inv)P.inv=Math.max(P.inv,.5);const t=performance.now();if(t-LF.fpsT>=1000){LF.fps=LF.fr;LF.fr=0;LF.fpsT=t;}if((G.lfM=(G.lfM||0)+1)%10===0){lfMeter();lfLive();}});}
LF.labRun=()=>RET.labfull&&running&&G&&G.lab;
function lfBoxes(){const c=ctx;c.save();c.lineWidth=1.5;c.strokeStyle='#ff4a5e';for(const e of G.en){if(e.dead)continue;c.beginPath();c.arc(e.x,e.y,e.r||10,0,7);c.stroke();}
  c.strokeStyle='#ffb020';for(const b of G.eb){c.beginPath();c.arc(b.x,b.y,b.r||b.rad||4,0,7);c.stroke();}c.strokeStyle='#3dff8a';c.beginPath();c.arc(P.x,P.y,P.hr||P.r||7,0,7);c.stroke();
  c.strokeStyle='#19e3ff';for(const b of G.pb){c.beginPath();c.arc(b.x,b.y,b.r||3,0,7);c.stroke();}c.restore();}
/* ===== repro ===== */
function lfRepro(){const q=new URLSearchParams(location.search);['lab','lfseed','lfstage','lfwave','lfdiff','lfspawn','boss'].forEach(k=>q.delete(k));q.set('lab','1');
  if(LF.seed!=null)q.set('lfseed',LF.seed);if(LF.stage)q.set('lfstage',LF.stage);if(LF.wave)q.set('lfwave',LF.wave);if(SET.diff)q.set('lfdiff',SET.diff);if(LF.log.length)q.set('lfspawn',LF.log.slice(-20).join(','));
  const off=Object.keys(RET).filter(k=>RET[k]===false&&/^[a-z][a-z0-9]*$/.test(k)).join(',');
  const url=location.origin+location.pathname+'?'+q.toString();return`REPRO flags-off=[${off}] seed=${LF.seed==null?'-':LF.seed} stage=${LF.stage||'-'} wave=${LF.wave||'-'} diff=${SET.diff} god=${godMode?1:0} spawn=[${LF.log.slice(-20).join(' ')}] ${url}`;}
function lfCopy(){const t=lfRepro();LF.copied=t;try{if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(()=>labNote('repro copied'),()=>lfCopyOld(t));else lfCopyOld(t);}catch(e){lfCopyOld(t);}return t;}
function lfCopyOld(t){const a=document.createElement('textarea');a.value=t;a.style.cssText='position:fixed;left:-9999px';document.body.appendChild(a);a.select();try{document.execCommand('copy');labNote('repro copied');}catch(e){labNote('copy failed: '+t.slice(0,40));}a.remove();}
/* ===== panel: DEX (search, chips, cards) and CTRL ===== */
if(RET.labfull){const st=document.createElement('style');st.textContent=`
#labP .ltabs{max-width:100%;overflow-x:auto;touch-action:pan-x;scrollbar-width:none}
@media (max-width:620px){#labP .ltabs{flex:1 1 100%}}
#labP.ldx{max-height:min(58%,420px)}
#labP .dx{grid-column:1/-1;display:flex;flex-direction:column;gap:6px;min-width:0}
#labP .dx input{width:100%;box-sizing:border-box;min-height:44px;font:700 16px var(--mono);color:var(--ink);background:#0f0a1d;border:1px solid #3a2b5c;border-radius:6px;padding:0 10px}
#labP .dx .dg{display:flex;gap:4px;overflow-x:auto;padding-bottom:3px;touch-action:pan-x}
#labP .dx .di{display:flex;flex-wrap:wrap;gap:4px}
#labP .dx .dc{background:#0f0a1d;border:1px solid #3a2b5c;border-radius:8px;padding:6px 8px;font-size:14px;line-height:1.35}
#labP .dx .dc b{color:var(--cyan)}#labP .dx .dc dl{display:grid;grid-template-columns:auto 1fr;gap:1px 8px;margin:4px 0}#labP .dx .dc dt{color:var(--dim)}#labP .dx .dc dd{margin:0;word-break:break-word}
`;document.head.appendChild(st);}
function lfItems(){const q=LF.q.trim().toLowerCase(),o=[];for(const [gid,g] of LF.R){if(!q&&gid!==LF.grp)continue;for(const it of g.items.values())if(!q||(it.id+' '+it.name+' '+gid).toLowerCase().includes(q))o.push(it);}return o;}
function lfCard(){const c=$('lfCard');if(!c)return;const it=LF.sel;if(!it){c.textContent='Tap an item: it spawns here with its card.';return;}const i=it.info||{};
  c.innerHTML=`<b>${laEsc(it.name)}</b> <small>${laEsc(it.group)}:${laEsc(it.id)}</small><dl><dt>role</dt><dd>${laEsc(i.role)}</dd><dt>hull</dt><dd>${laEsc(i.hp)}</dd><dt>telegraph</dt><dd>${laEsc(i.tele)}</dd><dt>flags</dt><dd>${laEsc(i.flags)}</dd><dt>counter</dt><dd>${laEsc(i.tip)}</dd><dt>live</dt><dd id="lfLive">-</dd></dl>`;lfLive();}
function lfLive(){const d=$('lfLive');if(!d)return;const e=LF.last&&G.en.includes(LF.last)?LF.last:null;d.textContent=e?`${e.type} hull ${Math.round(e.hp)}/${Math.round(e.max||e.hp)} r ${e.r} at ${Math.round(e.x)},${Math.round(e.y)}`:(labBoss()?`${labBoss().nm} ph ${labBoss().ph}`:'no entity of this item alive');}
function lfBuildDex(body){labEl.classList.add('ldx');lfScan();const w=lel('div','dx');body.append(w);
  const inp=lel('input');inp.type='search';inp.placeholder='SEARCH ALL (id or name)';inp.value=LF.q;inp.id='lfQ';inp.setAttribute('aria-label','Search the Lab');w.append(inp);
  const gr=lel('div','dg');w.append(gr);const list=lel('div','di');w.append(list);const card=lel('div','dc');card.id='lfCard';w.append(card);
  const draw=()=>{list.textContent='';for(const it of lfItems()){const b=lchip(list,it.name,()=>lfDo(it),{aria:it.group+' '+it.name,on:()=>LF.sel===it});b.dataset.g=it.group;b.dataset.id=it.id;b.addEventListener('click',lfCard);}
    gr.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.g===LF.grp&&!LF.q.trim()));labSync();};
  for(const [gid,nm] of LF_G){const g=LF.R.get(gid);if(!g)continue;const b=lchip(gr,nm+' '+g.items.size,()=>{LF.grp=gid;LF.q='';inp.value='';draw();},{});b.dataset.g=gid;}
  for(const [gid,g] of LF.R)if(!LF_G.some(x=>x[0]===gid)){const b=lchip(gr,gid.toUpperCase()+' '+g.items.size,()=>{LF.grp=gid;LF.q='';inp.value='';draw();},{});b.dataset.g=gid;}
  inp.addEventListener('input',()=>{LF.q=inp.value;draw();});draw();lfCard();}
function lfBuildCtrl(body){const tg=(host,label,fn,onFn,tx)=>lchip(host,label,fn,{on:onFn,text:tx});
  const p=lsec(body,'PLAYER');tg(p,'GOD MODE',()=>{godMode=!godMode;},()=>godMode,on=>on?'GOD: ON':'GOD MODE');tg(p,'INVULNERABLE',()=>{LF.inv=!LF.inv;},()=>LF.inv,on=>on?'INVULN: ON':'INVULNERABLE');
  lchip(p,'FULL HULL',()=>{P.hp=P.max;});lchip(p,'+3 EMP',()=>{P.emp=Math.min(9,P.emp+3);});
  const t=lsec(body,'TIME');for(const [n,v] of [['0.25x',.25],['0.5x',.5],['1x',1]])lchip(t,n,()=>{LF.slow=v;},{on:()=>LF.slow===v});
  tg(t,'PAUSE',()=>{LF.hold=!LF.hold;},()=>LF.hold,on=>on?'PAUSED':'PAUSE');lchip(t,'STEP',()=>{LF.hold=true;LF.step=1;},{aria:'Advance one frame'});lchip(t,'STEP 10',()=>{LF.hold=true;LF.step=10;});
  const v=lsec(body,'VIEW');tg(v,'HITBOXES',()=>{LF.hb=!LF.hb;},()=>LF.hb,on=>on?'HITBOXES: ON':'HITBOXES');tg(v,'FPS + ENTITIES',()=>{LF.meter.fps=!LF.meter.fps;lfMeter();},()=>!!LF.meter.fps);
  const s=lsec(body,'SPAWN');tg(s,'AT CURSOR',()=>{LF.place=!LF.place;lfPlace();labNote(LF.place?'tap the field to place':'spawn at the right edge');},()=>LF.place,on=>on?'AT CURSOR: ON':'AT CURSOR');
  tg(s,'ADD (keep others)',()=>{LF.add=!LF.add;},()=>LF.add);lchip(s,'AGAIN',()=>lfDo(LF.sel),{dis:()=>!LF.sel});
  lchip(s,'CLEAR ALL',()=>{G.en=G.en.filter(e=>e.type==='boss');G.eb=[];G.pb=[];G.pk=[];});lchip(s,'KILL ALL',()=>{for(const e of G.en)if(e.type!=='boss')e.hp=0;G.eb=[];},{cls:'x'});
  const d=lsec(body,'STAGE · WAVE · DIFFICULTY');for(const n of [0,1,6,10,16,22,30,40])lchip(d,n?'STAGE '+n:'STAGE AUTO',()=>{LF.stage=n;},{on:()=>LF.stage===n});
  for(const [k,n] of [['easy','Easy'],['normal','Normal'],['hard','Hard'],['vhard','V.Hard'],['legend','Legend']])lchip(d,n,()=>{LF.dKey=k;SET.diff=k;DF=DIFFS[k];HARD=HARDS.includes(k);if(window.ENDR)ENDR.real=k;},{on:()=>SET.diff===k});
  const sd=lsec(body,'SEED');tg(sd,'LOCK SEED',()=>{LF.lock=!LF.lock;if(LF.lock&&LF.seed==null)LF.seed=(Math.random()*1e6)|0;lfSeed();},()=>LF.lock,on=>on?'SEED '+LF.seed+' LOCKED':'LOCK SEED');
  lchip(sd,'NEW SEED',()=>{LF.seed=(Math.random()*1e6)|0;lfSeed();labNote('seed '+LF.seed);});lchip(sd,'FORCE 1',()=>{LF.seed=1;lfSeed();});lchip(sd,'FORCE 42',()=>{LF.seed=42;lfSeed();});lchip(sd,'FORCE 777',()=>{LF.seed=777;lfSeed();});
  const r=lsec(body,'BUG REPORT');lchip(r,'COPY REPRO',()=>lfCopy(),{cls:'hot'});lchip(r,'RESET SANDBOX',()=>LF.restore(LF.snapD));}
function lfPlace(){if(LF.pl)return;LF.pl=true;const h=e=>{if(!LF.labRun()||!LF.place||e.target.closest('button,#labP,input'))return;const t=e.touches?e.touches[0]:e;if(!t)return;LF.cur=toGame(t);e.preventDefault();e.stopImmediatePropagation();if(LF.sel)lfDo(LF.sel);};
  stage.addEventListener('touchstart',h,{capture:true,passive:false});stage.addEventListener('mousedown',h,true);}
/* ===== wiring into the Lab ===== */
function lfEnter(){if(LF.snapD)return;LF.snapD=LF.snap();LF.keep=false;LF.log=[];LF.mem={cls:Object.assign({c:'',xp:0,own:{}},lfClone(window.CLS?CLS.sv():null)||{})};LF.mem.cls.own=LF.mem.cls.own||{};
  const q=new URLSearchParams(location.search),sd=q.get('lfseed');if(sd!=null){LF.seed=+sd;LF.lock=true;}if(q.get('lfstage'))LF.stage=+q.get('lfstage');if(q.get('lfdiff')&&DIFFS[q.get('lfdiff')]){SET.diff=q.get('lfdiff');DF=DIFFS[SET.diff];HARD=HARDS.includes(SET.diff);}}
function lfLeave(){if(!LF.snapD)return;const s=LF.snapD;LF.snapD=null;LF.sh={};LF.ru=false;LF.sp=null;LF.scr=false;if($('lfSp'))$('lfSp').hidden=true;if($('lfBar'))$('lfBar').hidden=true;if($('lfMeter'))$('lfMeter').hidden=true;overEl.style.pointerEvents='';LF.hold=false;LF.slow=1;LF.inv=false;
  if(LF.defer){LF.defer=false;LF.held=s;return;}if(!LF.keep)LF.restore(s);}
function lfReplay(){const sp=(new URLSearchParams(location.search).get('lfspawn')||'').split(',').filter(Boolean);lfScan();const w=+(new URLSearchParams(location.search).get('lfwave')||0);if(w)lfWave(w);
  sp.forEach((s,i)=>setTimeout(()=>{const [g,id]=s.split(':'),it=LF.R.get(g)&&LF.R.get(g).items.get(id);if(it&&running&&G.lab){LF.add=true;lfDo(it,{replay:1,reseed:LF.seed!=null});}},400+i*250));}
if(RET.labfull&&RET.labassets!==undefined&&window.LABX){const LA_=window.LABX;const t0=LA_.tabs;LA_.tabs=()=>[['dex','DEX'],['ctrl','CTRL']].concat(t0?t0():[]);LA_.build=Object.assign(LA_.build||{},{dex:b=>{lfInit();lfBuildDex(b);},ctrl:b=>{lfInit();lfBuildCtrl(b);}});
  if(!/[?&]boss=/.test(location.search))LAB.tab='dex';
  {const ls=labSync;labSync=function(){ls();for(const t of ['dex','ctrl']){const b=$('labTab_'+t);if(b)b.classList.toggle('on',LAB.tab===t);}};}
  {const sl=labShow;labShow=function(tab){labEl.classList.remove('ldx');if(tab==='cheats')LF.keep=true;sl.apply(this,arguments);const h=labEl.offsetHeight;stage.style.setProperty('--lfh',(running&&G&&G.lab?h:0)+'px');};}
  {const sl=startLab;startLab=function(){if(running)return;lfInit();lfEnter();const r=sl.apply(this,arguments);lfReplay();return r;};}
  NR.on('runEnd',()=>{if(G&&G.lab)lfLeave();});
  NR.on('footEnd',()=>{if(LF.held){LF.restore(LF.held);LF.held=null;LF.shadow=false;LF.sh={};}});
  NR.on('runEnd',()=>{if(LF.held&&G&&!G.lab){const s=LF.held;LF.held=null;setTimeout(()=>{LF.restore(s);LF.shadow=false;LF.sh={};},50);}});
  LF.src=()=>({hyb:typeof FGR!=='undefined'?FGR.map(r=>r[2]):[],mods:typeof FGM!=='undefined'?FGM.map(m=>m[0]):[],wpn:Object.keys(WPD),ships:SHIPS.map(s=>s.id),boss:LAB_B.map(b=>b.art),bossArt:ART.bossN.slice(),rules:window.RU?RU.ORDER.slice():[],lessons:typeof LSN!=='undefined'?LSN.map(l=>l.id):[],tut:typeof TUT_S!=='undefined'?TUT_S.map(s=>s.id):[],sig:window.ENDR?ENDR.SIG.map(s=>s.id):[],
    nvT:window.NOV?[...new Set(NOV.tw.concat(NOV.UN.filter(u=>u.tw).map(u=>u.tw),NOV.EPTW))]:[],nvE:window.NOV?[...new Set(NOV.ev.concat(NOV.UN.filter(u=>u.ev).map(u=>u.ev)))]:[]});
  LF.scan=lfScan;LF.do=lfDo;LF.repro=lfRepro;LF.setWave=lfWave;LF.foot=lfFoot;LF.tutGo=lfTut;LF.sprite=lfSprite;}
