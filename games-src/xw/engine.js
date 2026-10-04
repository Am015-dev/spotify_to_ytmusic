// ---------- rules engine. State lives in G (plain JSON), transient interface state in UI. ----------
var ANIM=1, AIDELAY=600, DEFSEED=null, DEFEX=null, LVMIX=null, DEFSIZE=null;
const ROUND_CAP=100;// safety cap only: 1e has no round limit (tournaments use a clock) [#35]
let G=null;
const UI={choice:null,roll:null,pick:null,busy:false,info:true,sel:null,peek:null,pending:false,paused:false,hover:null,fx:[],banner:''};
// ---- seeded random numbers (mulberry32); all dice, shuffles and AI randomness go through rnd() ----
function rnd(n){let t=(G.rng=(G.rng+0x6D2B79F5)>>>0);t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return Math.floor(((t^t>>>14)>>>0)/4294967296*n)}
function setSeed(s){DEFSEED=s>>>0;if(G)G.rng=s>>>0}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
const ATK_FACES=['hit','hit','hit','crit','focus','focus','blank','blank'];// [R1]
const DEF_FACES=['evade','evade','evade','focus','focus','blank','blank','blank'];// [R2]
function lg(side,t){G.log.unshift({s:side,t});if(G.log.length>300)G.log.length=300;if(typeof announce==='function')announce(t)}
function mark(k){if(G)(G.fired=G.fired||{})[k]=(G.fired[k]||0)+1}
function fx(k,d){UI.fx.push(Object.assign({k,t:Date.now()},d||{}));if(UI.fx.length>60)UI.fx.shift()}
const ship=id=>G.ships.find(s=>s.id===id);
const alive=()=>G.ships.filter(s=>s.alive);
const enemiesOf=s=>G.ships.filter(o=>o.alive&&o.side!==s.side);
const B=s=>s.base==='L'?GEO.large:GEO.small;
const sname=s=>s.name;
const sideName=k=>FACTIONS[G.fac[k]].n;
const isHuman=k=>G.players[k].human;
const hasUp=(s,id)=>s.ups.some(u=>u.id===id&&!u.gone);
const crit=(s,k)=>s.dmg.some(x=>x.up&&DAMAGE[x.c].k===k);
const ab=s=>crit(s,'wounded')?null:PILOTS[s.pilot].ab;// a wounded pilot's ability is ignored
const pilotHas=(s,k)=>ab(s)===k;
const talentOn=(s,id)=>hasUp(s,id)&&!crit(s,'wounded');
const BAR=['F','E','TL','BR','BO'];
const onBar=(s,a)=>SHIPS[s.type].acts.includes(a)||exExtraBar(s).includes(a);// action icons, including ones added by cards
const canAct=s=>s.alive&&(!s.stress||exCanActStressed(s));// stressed ships can't take actions, not even free ones
function hullDmg(s){if(!s.alive&&s.deadHull!=null)return s.deadHull;return s.dmg.reduce((a,x)=>a+(x.up&&DAMAGE[x.c].k==='direct'?2:1),0)}
function agility(s){return Math.max(0,s.agi-(crit(s,'frame')?1:0)+(s.flags.juke?1:0)+exAgility(s))}
function primary(s){return Math.max(0,s.atk-(crit(s,'weak')?1:0)+exPrimary(s))}
function psOf(s){if(s.flags.psT!=null&&G.inCombat)return s.flags.psT;return s.dmg.some(x=>x.up&&DAMAGE[x.c].k==='cockpit'&&x.r<G.round)?0:s.ps+exPS(s)}
// ---- player choices: every optional human decision is a question in G.q, answered with performMove({act:'ask',k}).
// The continuation is kept in KONT (runtime only: games are saved only in the plan phase, when no question is open).
// The computer never gets a question: its code paths decide on the spot with the ai*() heuristics.
const KONT={};let KID=0;
function ask(side,key,title,text,opts,fn,extra){const id=++KID;KONT[id]=fn;G.q=Object.assign({side,key,title,text,opts,kid:id},extra||{});G.phase='ask';refresh();return 'ask'}
function resolveAsk(k){const q=G.q;if(!q)return;mark('ask:'+q.key);G.q=null;const fn=KONT[q.kid];delete KONT[q.kid];if(fn)fn(k)}
function askShip(side,key,title,text,ids,none,fn){const opts=ids.map(id=>({k:id,l:ship(id).name,p:{x:ship(id).x,y:ship(id).y,h:ship(id).h},b:B(ship(id))}));if(none)opts.push({k:'-',l:none});return ask(side,key,title,text,opts,a=>fn(a==='-'?null:ship(a)))}
function seqEach(list,f,k){let i=0;const nx=()=>{if(G.winner)return;if(i>=list.length)return k();f(list[i++],nx)};nx()}
// ---- setup [27]: initiative, alternating asteroid placement, deployment in pilot-skill order ----
function newGame(opts){if(typeof opts==='string'){const m=opts;opts={players:m==='ai'?[{human:false},{human:false}]:m==='hot'?[{human:true},{human:true}]:[{human:true},{human:false}]};if(typeof DEFSIZE!=='undefined'&&DEFSIZE){const z=SIZES.find(z=>z.k===DEFSIZE);if(z)opts.sizeK=z.k}}
  opts=opts||{};const seed=opts.seed!=null?opts.seed:DEFSEED!=null?DEFSEED:Math.floor(Math.random()*4294967296);
  for(const k in KONT)delete KONT[k];
  G={v:2,seed,rng:seed>>>0,round:0,turn:0,phase:'setup',step:0,log:[],ships:[],rocks:[],deck:[],disc:[],winner:null,winText:'',
    fac:opts.fac||[0,1],players:(opts.players||[{human:true,lvl:'normal'},{human:false,lvl:'normal'}]).map(p=>Object.assign({human:false,lvl:'normal'},p)),
    ex:opts.ex||DEFEX||{},mission:opts.mission||'dogfight',init:0,bombs:[],nb:0,q:null,order:[],oi:0,cur:null,touch:[],moves:[],pts:[0,0],stats:{},pendS:[],inCombat:false,bonus:null,again:false};
  if(LVMIX)G.players.forEach((p,k)=>{p.lvl=LVMIX[k%LVMIX.length];p.human=false});
  G.deck=shuffle(buildDamageDeck());
  const z=opts.sizeK&&SIZES.find(z=>z.k===opts.sizeK);const squads=opts.squads||(z?[z.squad(G.fac[0],G.ex),z.squad(G.fac[1],G.ex)]:[defaultSquad(G.fac[0]),defaultSquad(G.fac[1])]);
  squads.forEach((sq,k)=>{G.pts[k]=squadCost(sq);sq.forEach(e=>addShip(k,e))});
  deploySpots();
  UI.choice=null;UI.busy=false;UI.info=false;UI.sel=null;UI.fx=[];UI.banner='';
  lg(-1,`${sideName(0)} (${G.pts[0]} pts) vs ${sideName(1)} (${G.pts[1]} pts).`);
  rollInitiative(()=>placeRocks(()=>deploy(()=>startRound())))}
function addShip(side,e){const P=PILOTS[e.p],T=SHIPS[P.ship];const id='s'+(G.ships.length+1);
  const O=P.ov||{};const s={id,side,pilot:e.p,type:P.ship,name:P.n,ps:P.ps,atk:O.atk!=null?O.atk:T.atk,agi:O.agi!=null?O.agi:T.agi,hull:O.hull||T.hull,sh:O.sh!=null?O.sh:T.sh,shMax:O.sh!=null?O.sh:T.sh,base:T.base||'S',arc:T.arc||'F',
    x:0,y:0,h:0,dmg:[],crits:[],stress:0,focus:0,evade:0,ion:0,tl:null,tl2:null,dial:null,alive:true,ups:(e.u||[]).map(u=>({id:u,gone:false,used:0})),doneR:[],
    flags:{},bumped:false,rockHit:false,fired:false,moved:false,cost:pilotCost(e)};
  for(const u of s.ups){const U=UPGRADES[u.id];if(U&&U.onAdd)U.onAdd(s)}
  G.ships.push(s)}
// [R9] the lower squad total has initiative; on a tie one player rolls an attack die: hit/crit, that player chooses; otherwise the other player chooses
function rollInitiative(k){if(G.pts[0]!==G.pts[1]){G.init=G.pts[0]<G.pts[1]?0:1;lg(-1,`${sideName(G.init)} has the lower squad total and so has initiative.`);return k()}
  const f=ATK_FACES[rnd(8)],ch=f==='hit'||f==='crit'?0:1;lg(-1,`The squads tie at ${G.pts[0]} points: ${sideName(0)} rolls ${f}, so ${sideName(ch)} chooses who has initiative.`);
  const set=w=>{G.init=w;lg(-1,`${sideName(w)} has initiative.`);k()};
  if(isHuman(ch))return ask(ch,'init','Initiative','The squads are tied. With initiative your ships move first and fire first on pilot-skill ties, and you win if both last ships are destroyed together.',[{k:'me',l:'Take initiative'},{k:'opp',l:'Give it to the opponent'}],a=>set(a==='me'?ch:1-ch));
  set(ch)}// the computer takes it: firing first on ties is worth more than moving first
function rockShape(){const o={x:0,y:0,r:22+rnd(18),n:7+rnd(3),rot:rnd(628)/100,k:[]};for(let i=0;i<o.n;i++)o.k.push(.72+rnd(29)/100);return o}
function rockLegal(o){const P=rockPoly(o);if(P.some(p=>Math.min(p.x,p.y,MAT-p.x,MAT-p.y)<=2*RANGE))return false;// [R7] beyond range 2 of every edge
  return !G.rocks.some(q=>{const Q=rockPoly(q);let d=1e9;for(const p of P)d=Math.min(d,polyPointDist(p,Q));for(const p of Q)d=Math.min(d,polyPointDist(p,P));return d<RANGE})}// and beyond range 1 of each other [tournament rule]
function rockSpots(o,side){const out=[];const lo=2*RANGE+o.r+2,hi=MAT-lo;for(let j=0;j<5;j++)for(let i=0;i<5;i++){const x=lo+(hi-lo)*i/4,y=lo+(hi-lo)*(side===0?j:4-j)/4;
    if(rockLegal(Object.assign({},o,{x,y})))out.push({k:'r'+i+j,l:`${'ABCDE'[side===0?i:4-i]}${j+1}`,p:{x,y,h:0},b:o.r*2})}return out}
function placeRocks(k){const n=G.ex.noRocks?0:6;const shapes=[];for(let i=0;i<n;i++)shapes.push(rockShape());let i=0;
  const aiPlace=o=>{for(let t=0;t<400;t++){o.x=2*RANGE+o.r+rnd(MAT-4*RANGE-2*o.r);o.y=2*RANGE+o.r+rnd(MAT-4*RANGE-2*o.r);if(rockLegal(o)){G.rocks.push(o);return}}};
  const next=()=>{if(i>=n)return k();const o=shapes[i],pl=(G.init+i)%2;i++;// players alternate, the initiative player first
    if(isHuman(pl)){const sp=rockSpots(o,pl);if(sp.length)return ask(pl,'rock',`Place asteroid ${i} of ${n}`,'Choose a spot (outlined on the mat; hover a button to highlight it): columns A-E from your left, rows 1-5 from your edge. Asteroids stay beyond range 2 of every edge and beyond range 1 of each other.',sp,a=>{const c=sp.find(c=>c.k===a);o.x=c.p.x;o.y=c.p.y;G.rocks.push(o);lg(pl,`${sideName(pl)} places an asteroid.`);next()})}
    aiPlace(o);next()};
  next()}
const DEPLOY_Y=s=>s.side===0?RANGE-B(s)/2-5:MAT-RANGE+B(s)/2+5;// the whole base inside range 1 of its own edge
function deploySpots(){for(const side of [0,1]){const mine=G.ships.filter(s=>s.side===side),n=mine.length;
  mine.forEach((s,k)=>Object.assign(s,{x:MAT/2+(k-(n-1)/2)*Math.min(170,(MAT-160)/Math.max(1,n)),y:DEPLOY_Y(s),h:side===0?Math.PI/2:-Math.PI/2}))}}
function deploy(k){const I=s=>s.side===G.init?0:1;const order=G.ships.slice().sort((a,b)=>(psOf(a)-psOf(b))||(I(a)-I(b)));const placed=[];// ascending pilot skill, initiative first on ties
  for(const s of order)if(isHuman(s.side))s.flags.unplaced=true;// still in the hangar: shown at a default spot, not yet on the mat
  seqEach(order,(s,nx)=>{if(!isHuman(s.side)){placed.push(s);return nx()}
    const b=B(s),spots=[];for(let i=0;i<9;i++){const x=b/2+4+(MAT-b-8)*i/8;const p={x,y:DEPLOY_Y(s),h:s.h};if(!placed.some(o=>o.side===s.side&&polyOverlap(corners(p,b),corners(o,B(o)))))spots.push({k:'x'+i,l:`Spot ${s.side===0?i+1:9-i}`,p,b})}
    if(!spots.length){s.flags.unplaced=false;placed.push(s);return nx()}
    ask(s.side,'deploy',`Deploy ${s.name}`,`Place ${s.name} (pilot skill ${psOf(s)}) along your edge (spots 1-9 from your left), within range 1 of it, facing the enemy. Ships deploy from the lowest pilot skill up.`,spots.sort((a,b)=>+a.l.slice(5)-+b.l.slice(5)),a=>{const c=spots.find(c=>c.k===a);Object.assign(s,c.p);s.flags.unplaced=false;placed.push(s);nx()})},k)}
// ---- round flow ----
function startRound(){if(G.winner)return;G.round++;G.turn=G.round;G.phase='plan';G.step=1;G.touch=[];G.inCombat=false;
  for(const s of alive()){s.dial=null;s.bumped=false;s.rockHit=false;s.fired=false;s.moved=false;s.acted=false;s.doneR=[];
    Object.assign(s.flags,{noAtk:false,juke:false,dead:false,bonus:0,skipAct:false,adren:false,second:false,redline:false,redlining:false,gunned:false,gunnerFocus:false,captive:false,psT:null,peek:null})}
  lg(-1,`Round ${G.round}: set your maneuver dials.`);
  for(const k of [0,1])if(!isHuman(k)&&!(typeof NET!=='undefined'&&NET.on&&NET.role==='client'))aiPlan(k);
  if([0,1].every(planDone)){refresh();beginActivationLater();return}
  refresh()}
function beginActivationLater(){if(!ANIM)beginActivation();else setTimeout(()=>{if(G&&G.phase==='plan'&&[0,1].every(planDone))beginActivation()},AIDELAY)}
function planDone(k){return alive().filter(s=>s.side===k).every(s=>s.dial!=null)}
function setDial(s,mi){s.dial=mi;if([0,1].every(planDone))beginActivation();else refresh()}
function psOrder(asc){const I=s=>s.side===G.init?0:1;return alive().slice().sort((a,b)=>asc?(psOf(a)-psOf(b))||(I(a)-I(b)):(psOf(b)-psOf(a))||(I(a)-I(b)))}// [R3]
function beginActivation(){G.phase='activate';G.step=2;G.order=psOrder(true).map(s=>s.id);G.oi=0;lg(-1,'All dials set. Ships move from lowest pilot skill up.');
  seqEach(alive().filter(s=>hasUp(s,'u_spot')),(s,nx)=>exIntel(s,nx),()=>{G.phase='activate';nextActivation()})}// Spotter: start of the Activation phase [#14]
function nextActivation(){if(G.winner)return;
  while(G.oi<G.order.length&&!ship(G.order[G.oi]).alive)G.oi++;
  if(G.oi>=G.order.length){beginCombat();return}
  const s=ship(G.order[G.oi]);G.cur=s.id;G.phase='activate';revealAndMove(s)}
function dialOf(s){return SHIPS[s.type].dial}
// reveal: the "when you reveal" choices first (bombs, bank switch, Navigator, Adrenaline Rush), then the stressed-red check on the result [#2]
function revealAndMove(s){
  if(isIonized(s)){const m={s:1,t:'S',d:0,c:'w'};lg(s.side,`${sname(s)} is ionised and drifts straight 1.`);s.ion=0;s.flags.ionMove=true;proceedMove(s,m);return}
  else if(s.ion>0)s.ion=0;// a large ship with a single ion token shrugs it off at reveal [R15]
  exReveal(s,dialOf(s)[s.dial],m=>stressCheck(s,m,mm=>proceedMove(s,mm)))}
// [R4] a stressed ship that reveals a red maneuver flies a non-red one chosen by its opponent (asked when the opponent is human)
function stressCheck(s,m,k){if(!(s.stress>0&&exColor(s,m).c==='r'))return k(m);
  const wh=dialOf(s).map((x,i)=>({x,i,e:exColor(s,x)})).filter(o=>o.e.c!=='r');if(!wh.length)return k(m);
  const opp=1-s.side;const fin=o=>{mark('forced');lg(s.side,`${sname(s)} is stressed and can't fly the red ${mText(m)}; ${sideName(opp)} picks ${mText(o.x)} instead.`);k(o.x)};
  if(isHuman(opp))return ask(opp,'forced',`${s.name} is stressed`,`${s.name} revealed a red ${mText(m)} while stressed. Choose any non-red maneuver on its dial for it to fly instead.`,
    wh.map(o=>({k:''+o.i,l:mText(o.x)+(o.e.c==='g'?' (green)':''),p:finalPose(s,B(s),o.x),b:B(s)})),a=>fin(wh.find(o=>''+o.i===a)));
  fin(aiPickForcedWhite(s,wh))}
function proceedMove(s,m){const c0=m.c;m=exColor(s,m);if(m.c!==c0)mark(m.c==='r'?'engine':m.c==='w'&&s.flags.adren?'adrenwhite':hasUp(s,'u_nib')&&m.t==='S'?'nib':'assist');s.rev=m;G.phase='activate';executeMove(s,m,()=>afterMove(s,m))}
function mText(m){return m.s===0?'full stop':m.t==='S'?`straight ${m.s}`:m.t==='K'?`K-turn ${m.s}`:`${m.t==='B'?'bank':'turn'} ${m.d<0?'left':'right'} ${m.s}`}
// move with overlap back-up, obstacle and edge checks [R5][R6][R7]
function executeMove(s,m,done){const b=B(s),p0={x:s.x,y:s.y,h:s.h},L=m.s===0?0:tplLen(m),total=m.s===0?0:b+L;let q=total,fin=m.s===0?Object.assign({},p0):finalPose(p0,b,m),bumpedInto=null;
  const others=alive().filter(o=>o!==s);
  const overl=p=>others.find(o=>polyOverlap(corners(p,b),corners(o,B(o))));
  let hit=overl(fin);
  if(hit){while(q>0){q=Math.max(0,q-2);const p=poseAt(p0,b,m,q);const o=overl(p);if(!o){fin=Object.assign({},p);bumpedInto=hit;break}hit=o;if(q===0)break}if(q<=0){q=0;fin=Object.assign({},p0);bumpedInto=hit}}
  const path=[Object.assign({},p0)];for(let u=4;u<=Math.min(q,total)+1e-6;u+=Math.max(4,Math.min(q,total)/24))path.push(poseAt(p0,b,m,Math.min(u,q)));path.push(fin);// always at least start and end
  s.x=fin.x;s.y=fin.y;s.h=normA(fin.h);s.moved=true;G.moves.push({id:s.id,m,bump:!!bumpedInto});
  fx('move',{id:s.id,path,m,dur:ANIM?Math.min(1100,450+L*3):0});
  if(bumpedInto){s.bumped=true;G.touch.push([s.id,bumpedInto.id]);lg(s.side,`${sname(s)} bumps into ${sname(bumpedInto)} and skips its action.`);fx('bump',{id:s.id})}
  if(offBoard(s,b)){destroy(s,`${sname(s)} flies off the battlefield and is lost.`);done();return}
  // obstacles: the template or the final base overlapping a rock [R7]
  const tp=m.s===0?[]:tplPoints(p0,b,m,4),baseP=corners(s,b);const touched=[];
  for(const o of G.rocks){const R=rockPoly(o);const on=polyOverlap(baseP,R);const thru=!on&&tp.some(p=>polyPointDist(p,R)<=TPL_W/2);if(on||thru)touched.push({o,on,d:len(sub(o,p0))})}
  touched.sort((a,b)=>a.d-b.d);// resolve the asteroid nearest the start first; one die per asteroid [R7]
  for(const t of touched){if(!s.alive)break;s.rockHit=true;const f=ATK_FACES[rnd(8)];lg(s.side,`${sname(s)} ${t.on?'lands on':'flies through'} an asteroid: rolls ${f}.`);fx('rock',{id:s.id,f});
    if(f==='hit')dealDamage(s,1,0,null);else if(f==='crit')dealDamage(s,0,1,null);if(t.on)s.flags.noAtk=true}
  if((bumpedInto||touched.length)&&crit(s,'stunned')&&s.alive){lg(s.side,`${sname(s)}'s concussed pilot takes 1 damage from the jolt.`);dealDamage(s,1,0,null)}
  if(s.alive)exAfterMove(s,m,bumpedInto,tp);
  done()}
function afterMove(s,m){if(!s.alive){endActivation(s);return}
  const white=s.flags.ionMove;s.flags.ionMove=false;const green=m.c==='g'&&!white;
  if(m.c==='r'&&!white){addStress(s);lg(s.side,`${sname(s)} flies a red maneuver and takes a stress token.`);
    if(crit(s,'breach')){const f=ATK_FACES[rnd(8)];lg(s.side,`${sname(s)}'s hull breach strains: rolls ${f}.`);if(f==='hit')dealDamage(s,1,0,null);if(!s.alive){endActivation(s);return}}}
  if(green){if(s.stress>0){s.stress--;lg(s.side,`${sname(s)} flies a green maneuver and clears a stress token.`)}
    if(hasUp(s,'u_tinker')&&s.sh<s.shMax){s.sh++;mark('tinker');lg(s.side,`${sname(s)}'s mech "Tinker" restores a shield.`);fx('shield',{id:s.id,n:0})}}
  flushStress(()=>{if(!s.alive)return endActivation(s);
    const nightjar=nx=>green&&pilotHas(s,'nightjar')?offerFree(s,a=>a.a==='F','nightjar',`${s.name}: free focus`,`After a green maneuver ${s.name} may take a free focus action (it then can't focus again this round).`,ok=>{if(ok)mark('nightjar');nx()}):nx();
    nightjar(()=>exLark(s,green,()=>actionStep(s)))})}
function actionStep(s){if(!s.alive||s.flags.skipAct)return endActivation(s);
  const stressed=s.stress>0&&!exCanActStressed(s);
  if(s.bumped||s.rockHit||stressed||!actionsFor(s).length){if(stressed&&!s.bumped&&!s.rockHit)lg(s.side,`${sname(s)} is stressed and can't take an action.`);endActivation(s);return}
  if(s.stress>0)mark('tamsin');G.phase='action';G.cur=s.id;refresh()}
function endActivation(s){s.acted=true;s.flags.redlining=false;G.phase='activate';G.oi++;refresh();nextActivationLater()}
function nextActivationLater(){if(!ANIM)nextActivation();else setTimeout(()=>{if(G)nextActivation()},Math.max(350,AIDELAY*.6))}
// ---- actions [R8]. A ship can't perform the same action twice in a round, free or not [#10]: s.doneR ----
function actionsFor(s){const T=SHIPS[s.type],out=[];const done=a=>(s.doneR||[]).includes(a);
  const acts=crit(s,'noact')?[]:T.acts.concat(exExtraBar(s)).filter((a,i,arr)=>arr.indexOf(a)===i&&!done(a));
  if(!s.flags.redlining){// a Redline action must come from the action bar
    s.ups.forEach((u,i)=>{const U=UPGRADES[u.id];if(U&&U.act&&!u.gone&&!(U.slot==='T'&&crit(s,'wounded'))&&!done(U.act))out.push({a:U.act,l:U.actL,d:U.t,up:i})});
    s.dmg.forEach((x,i)=>{if(x.up&&DAMAGE[x.c].fix&&!done('RP'+i))out.push({a:'RP'+i,l:'Repair: '+DAMAGE[x.c].n,d:DAMAGE[x.c].t})});
    const ex=[];exActions(s,ex);ex.forEach(a=>{if(!done(a.a))out.push(a)})}
  for(const a of acts){if(a==='F')out.push({a:'F',l:'Focus',d:'Take a focus token: change all your focus results to hits when attacking, or to evades when defending.'});
    if(a==='E')out.push({a:'E',l:'Evade',d:'Take an evade token: add one evade result when defending.'});
    if(a==='TL'){const t=lockTargets(s);if(t.length)out.push({a:'TL',l:'Target lock',d:'Lock an enemy within range 1-3: when attacking it, reroll any attack dice.',targets:t})}
    if(a==='BR'){const opts=rollOptions(s);if(opts.length)out.push({a:'BR',l:'Barrel roll',d:'Slide sideways one template.',opts})}
    if(a==='BO'){const opts=boostOptions(s);if(opts.length)out.push({a:'BO',l:'Boost',d:'Surge forward a straight 1 or bank 1.',opts})}}
  return out}
function lockTargets(s){return exLockTargets(s,enemiesOf(s).filter(o=>rangeOf(baseDist(s,B(s),o,B(o)))<=3).map(o=>o.id))}
function poseFree(s,p){const b=B(s);if(offBoard(p,b))return false;if(alive().some(o=>o!==s&&polyOverlap(corners(p,b),corners(o,B(o)))))return false;
  if(G.rocks.some(o=>polyOverlap(corners(p,b),rockPoly(o))))return false;return true}
// barrel roll anywhere along the side (5 positions per side); large bases use the template's long edge [#23][#28]
function rollOptions(s){const out=[];const b=B(s);for(const dir of [-1,1])for(const off of rollOffsets(b)){const p=rollPose(s,b,dir,off);if(poseFree(s,p))out.push({dir,sh:Math.round(off),p})}return out}
function boostOptions(s){const out=[];for(const m of [{s:1,t:'S',d:0},{s:1,t:'B',d:-1},{s:1,t:'B',d:1}]){const p=finalPose(s,B(s),m);const tp=tplPoints(s,B(s),m,4);
  if(poseFree(s,p)&&!G.rocks.some(o=>{const R=rockPoly(o);return tp.some(q=>polyPointDist(q,R)<=TPL_W/2)}))out.push({m,p})}return out}
function actLabel(a,x){if(a.a==='TL')return 'Lock onto '+ship(x).name;if(a.a==='SL')return a.l+': '+ship(x).name;if(a.a==='SB')return 'Sabotage '+ship(x).name;
  if(a.a==='BR'||a.a==='EH')return `${a.a==='EH'?'Snap roll':'Barrel roll'} ${x.dir<0?'left':'right'}${x.sh?` (${Math.abs(x.sh)} mm ${x.sh>0?'forward':'back'})`:''}`;
  if(a.a==='DD')return `Hairpin turn ${x.m.d<0?'left':'right'}`;if(a.a==='BO')return `Boost ${x.m.t==='S'?'straight':x.m.d<0?'left':'right'}`;return a.l}
// every concrete choice of a list of actions, as {k,a,arg,l,p}
function actOpts(s,acts){const out=[];for(const a of acts){if(a.targets)a.targets.forEach(t=>out.push({k:a.a+'|'+t,a:a.a,arg:t,l:actLabel(a,t)}));
  else if(a.opts)a.opts.forEach((o,i)=>out.push({k:a.a+'|'+i,a:a.a,arg:i,l:actLabel(a,o),p:o.p||(o.m?finalPose(s,B(s),o.m):null),b:B(s)}));else out.push({k:a.a,a:a.a,l:a.l})}return out}
function doAction(s,act,arg){if(G.phase!=='action'||G.cur!==s.id)return false;
  if(act==='skip'){lg(s.side,`${sname(s)} holds its course.`);s.flags.redlining=false;endActivation(s);return true}
  return applyAction(s,act,arg,()=>postAction(s,act))}
// perform one action (in the action step or as a free action); calls k when it is fully resolved, possibly after questions
function applyAction(s,act,arg,k){const rec=()=>{mark('act:'+act.replace(/\d+$/,''));(s.doneR=s.doneR||[]).push(act)};
  if(act==='F'){rec();s.focus+=hasUp(s,'u_scout')?2:1;if(hasUp(s,'u_scout'))mark('scout');lg(s.side,`${sname(s)} focuses.`);fx('token',{id:s.id,k2:'focus'});k();return true}// Scout Specialist: every focus action, free ones too [#25]
  if(act==='E'){rec();s.evade++;lg(s.side,`${sname(s)} readies an evade.`);fx('token',{id:s.id,k:'evade'});k();return true}
  if(act==='TL'){const t=ship(arg);if(!t||!lockTargets(s).includes(arg))return false;rec();if(pilotHas(t,'kade'))mark('kade');if(rangeOf(baseDist(s,B(s),t,B(t)))>3)mark('writ');lg(s.side,`${sname(s)} locks onto ${sname(t)}.`);acquireLock(s,t,k);return true}
  if(act==='BR'){const o=rollOptions(s)[arg];if(!o)return false;rec();const from={x:s.x,y:s.y,h:s.h};Object.assign(s,{x:o.p.x,y:o.p.y});lg(s.side,`${sname(s)} barrel rolls ${o.dir<0?'left':'right'}.`);fx('move',{id:s.id,path:[from,{x:s.x,y:s.y,h:s.h}],dur:ANIM?420:0,roll:true});k();return true}
  if(act==='BO'){const o=boostOptions(s)[arg];if(!o)return false;rec();const from={x:s.x,y:s.y,h:s.h};Object.assign(s,{x:o.p.x,y:o.p.y,h:normA(o.p.h)});lg(s.side,`${sname(s)} boosts.`);fx('move',{id:s.id,path:[from,{x:s.x,y:s.y,h:s.h}],dur:ANIM?420:0});k();return true}
  if(act==='JK'){rec();s.flags.juke=true;lg(s.side,`${sname(s)}'s mech boosts its agility this round.`);fx('token',{id:s.id,k2:'evade'});k();return true}
  if(act==='MK'){rec();s.flags.dead=true;lg(s.side,`${sname(s)} takes a deadshot focus.`);fx('token',{id:s.id,k2:'focus'});k();return true}
  if(act.startsWith('RP')){const x=s.dmg[+act.slice(2)];if(!x||!x.up)return false;rec();const D=DAMAGE[x.c];const f=ATK_FACES[rnd(8)];const ok=D.fix==='any'||(D.fix==='hit'&&f==='hit')||(D.fix==='hitcrit'&&(f==='hit'||f==='crit'));
    if(ok)x.up=false;lg(s.side,`${sname(s)} tries to repair ${D.n}${D.fix==='any'?'':` (rolls ${f})`}: ${ok?'fixed, the card is flipped facedown':'no luck'}.`);k();return true}
  return exDoAction(s,act,arg,rec,k)}
// after the action step's action: Lord Castigan's second action, Redline, then the activation ends
function postAction(s,act){flushStress(()=>{
  if(s.flags.redlining){s.flags.redlining=false;addStress(s);mark('redline');lg(s.side,`${sname(s)} redlines: a second action for a stress token.`);return flushStress(()=>endActivation(s))}
  if(!s.alive)return endActivation(s);
  if(canAct(s)&&pilotHas(s,'castigan')&&!s.flags.second&&actionsFor(s).length){s.flags.second=true;mark('castigan');lg(s.side,`${sname(s)} takes a second action.`);G.phase='action';refresh();return}
  if(canAct(s)&&talentOn(s,'u_redline')&&!s.flags.redline&&!crit(s,'noact')){s.flags.redline=true;s.flags.redlining=true;
    if(actionsFor(s).length&&(isHuman(s.side)||aiWantsRedline(s))){G.phase='action';refresh();return}s.flags.redlining=false}
  endActivation(s)})}
// offer one free action to s (restricted by allow); k(true) if one was taken
function freeActs(s,allow){if(!canAct(s))return [];const r=s.flags.redlining;s.flags.redlining=false;const a=actionsFor(s).filter(allow);s.flags.redlining=r;return a}
function offerFree(s,allow,why,title,text,k){const acts=freeActs(s,allow);if(!acts.length)return k(false);
  const run=(a,arg)=>{if(!applyAction(s,a,arg,()=>flushStress(()=>k(true))))k(false)};
  if(isHuman(s.side)){const opts=actOpts(s,acts);return ask(s.side,'free',title,text,opts.concat([{k:'-',l:'No action'}]),ans=>{if(ans==='-')return k(false);const o=opts.find(o=>o.k===ans);run(o.a,o.arg)})}
  const c=aiFree(s,acts,why);if(!c||c[0]==='skip')return k(false);run(c[0],c[1])}
// target locks: acquiring one replaces the old one (Fire-Control Tech keeps 2), then Fire-Control Tech's second lock and Brannoc Dale's shared lock
function acquireLock(s,t,k){k=k||(()=>{});
  if(!hasUp(s,'u_fct')){s.tl=t.id;s.tl2=null}else if(s.tl!==t.id){const old=s.tl;s.tl=t.id;if(old)s.tl2=old;else if(s.tl2===t.id)s.tl2=null}
  fx('lock',{id:s.id,to:t.id});exAfterLock(s,t,k)}
// ---- combat [R10] ----
function beginCombat(){G.phase='combat';G.step=3;detonateBombs();for(const s of G.ships)s.flags.adren=false;if(checkWin())return;G.inCombat=true;
  flushStress(()=>exStartCombat(()=>{G.phase='combat';
    for(const s of alive())if(crit(s,'fire')){const f=ATK_FACES[rnd(8)];lg(s.side,`${sname(s)}'s cockpit fire flares: rolls ${f}.`);if(f==='hit')dealDamage(s,1,0,null)}if(checkWin())return;
    G.order=psOrder(false).map(s=>s.id);G.oi=0;lg(-1,'Combat: ships fire from highest pilot skill down.');flushStress(()=>{G.phase='combat';nextAttacker()})}))}
function nextAttacker(){if(G.winner)return;
  while(G.oi<G.order.length){const s=ship(G.order[G.oi]);const psNow=psOf(s);
    // ships destroyed earlier this step at the same pilot skill still fire (simultaneous fire) [R10]
    if((s.alive||s.flags.dyingPS===psNow)&&!s.fired&&weaponsFor(s).length)break;G.oi++;flushDeaths()}
  if(G.winner)return;
  if(G.oi>=G.order.length){flushDeaths();if(!G.winner)endPhase();return}
  const s=ship(G.order[G.oi]);G.cur=s.id;G.phase='target';refresh()}
function flushDeaths(){const nextPS=G.oi<G.order.length?psOf(ship(G.order[G.oi])):-1;for(const s of G.ships)if(s.flags.dyingPS!=null&&s.flags.dyingPS!==nextPS){s.flags.dyingPS=null;bury(s)}checkWin()}
// every weapon this ship could fire now, with its legal targets
function weaponsFor(s){if(s.flags.noAtk||crit(s,'noatk'))return [];const out=[];
  const prim={k:'P',n:'Primary weapon',atk:primary(s),rmin:1,rmax:3,arc:s.arc,bonus:true};
  const list=[prim];if(!(G.bonus&&G.bonus.id===s.id))s.ups.forEach((u,i)=>{const U=UPGRADES[u.id];if(U&&U.wpn&&!u.gone){// secondary weapons fire from the front arc only; an auxiliary arc is for the primary weapon [#5]
    const w={k:'U'+i,n:U.n,atk:U.wpn.atk,rmin:U.wpn.r[0],rmax:U.wpn.r[1],arc:U.wpn.arc||'F',need:U.wpn.need,spend:U.wpn.spend,ui:i,bonus:false};const r=exRange(s,w);w.rmin=r[0];w.rmax=r[1];list.push(w)}});
  for(const w of list){const t=[];for(const o of enemiesOf(s)){if(G.touch.some(p=>(p[0]===s.id&&p[1]===o.id)||(p[1]===s.id&&p[0]===o.id))&&!exTouchOK(s,o))continue;// touching ships can't attack each other [R5]
      const r=arcReach(s,B(s),o,B(o),w.arc);if(!r)continue;const rg=rangeOf(r.d);if(rg<w.rmin||rg>w.rmax)continue;
      if(!(G.again&&w.ui!=null)&&!exWeaponNeedOK(s,w,o))continue;
      const obstructed=G.rocks.some(q=>segHitsPoly(r.q,r.p,rockPoly(q)));t.push({id:o.id,rg,obstructed,p:r.p,q:r.q})}
    // a guardian pilot (Brink): friends at range 1 of it can't be attacked if the attacker could attack the guardian instead
    const guard=t.filter(x=>pilotHas(ship(x.id),'brink'));const ft=t.filter(x=>!guard.some(g=>g.id!==x.id&&ship(g.id).side===ship(x.id).side&&baseDist(ship(g.id),B(ship(g.id)),ship(x.id),B(ship(x.id)))<=RANGE));
    if(ft.length)out.push(Object.assign({},w,{targets:ft}))}
  return out}
// the dice an attack would roll before optional effects (shown on the target buttons and used by the AI) [#34]
function shotDice(s,w,t,d){const atk=Math.max(0,w.atk+(w.bonus&&t.rg===1?1:0)+(pilotHas(s,'knife')&&t.rg===1?1:0)+(s.flags.bonus||0)+exAtkBonus(s,d,w,t));
  return {atk,def:defDice(s,d,w.bonus,t.rg,t.obstructed)}}
function defDice(s,d,bonus,rg,obs){let a=agility(d);if(pilotHas(s,'wren'))a=Math.max(0,a-1);// [#15] Wren Talvo lowers the agility value itself, before any bonus dice
  return a+(bonus&&rg===3?1:0)+(obs?1:0)}
function declare(s,wk,tid){if(G.phase!=='target'||G.cur!==s.id)return false;
  if(wk==='skip'){G.bonus=null;G.again=false;lg(s.side,`${sname(s)} holds fire.`);afterAttackDone(s);return true}
  const w=weaponsFor(s).find(x=>x.k===wk);const t=w&&w.targets.find(x=>x.id===tid);if(!t)return false;
  const d=ship(tid),again=G.again,bonus=G.bonus;G.again=false;G.bonus=null;s.fired=true;mark('wpn:'+w.n);G.phase='combat';
  exPreRoll(s,d,w,t,again,P=>rollAttack(s,d,w,t,again,bonus,P));return true}
function rollAttack(s,d,w,t,again,bonus,P){const WU=w.ui!=null?UPGRADES[s.ups[w.ui].id].wpn:{};if(WU.discard&&(WU.twice?again:!again))s.ups[w.ui].gone=true;// a two-shot missile is discarded after its second attack
  let nAtk=shotDice(s,w,t,d).atk+P.extra;
  const blind=s.dmg.find(x=>x.up&&DAMAGE[x.c].k==='blinded');if(blind){nAtk=0;blind.up=false;lg(s.side,`${sname(s)} is flash-blinded and rolls no attack dice.`)}
  G.atk={a:s.id,d:d.id,w:w.k,wn:w.n,rg:t.rg,obs:t.obstructed,bonus:w.bonus,dice:[],def:[],rr:[],rrd:[],step:'amod',ups:w.ui,used:[],ion:!!WU.ion,noEvade:!!WU.noEvade,second:!!again,jammed:-1,lockSpent:P.lockSpent,gun:!!bonus};
  G.atk.dice=rollN(ATK_FACES,nAtk);if(WU.c2h)G.atk.dice=G.atk.dice.map(f=>f==='crit'?'hit':f);lg(s.side,`${sname(s)} fires ${w.k==='P'?'':w.n+' '}at ${sname(d)} (range ${t.rg}${t.obstructed?', obstructed':''}): ${diceText(G.atk.dice)}.`);
  fx('shot',{a:s.id,d:d.id,p:t.p,q:t.q,w:w.k,ion:G.atk.ion});
  G.phase=exDAMods().length?'damod':'amod';refresh()}
function nextAttackerLater(){if(!ANIM)nextAttacker();else setTimeout(()=>{if(G)nextAttacker()},Math.max(300,AIDELAY*.5))}
function rollN(faces,n){const out=[];for(let i=0;i<n;i++)out.push(faces[rnd(8)]);return out}
const cnt=(d,f)=>d.filter(x=>x===f).length;
function diceText(d){const o=['crit','hit','evade','focus','blank'].filter(f=>cnt(d,f)).map(f=>cnt(d,f)+' '+f);return o.join(', ')||'no dice'}
// choose dice for a reroll or a forced reroll: one die directly, or toggles and a confirm [#1]; fn(null) = cancelled
function pickDice(side,which,title,pool,max,fn,sel){sel=sel||[];const A=G.atk,faces=which==='atk'?A.dice:A.def;const lab=i=>`${which==='atk'?'Attack':'Defense'} die ${i+1}: ${faces[i]}`;
  if(max===1)return ask(side,'dice',title,'Choose the die.',pool.map(i=>({k:'d'+i,l:lab(i)})).concat([{k:'x',l:'Cancel'}]),a=>fn(a==='x'?null:[+a.slice(1)]));
  return ask(side,'dice',title,`Tick ${max>=pool.length?'any of the':'up to '+max} dice, then confirm. A die can only be rerolled once per attack.`,pool.map(i=>({k:'t'+i,l:(sel.includes(i)?'☑ ':'☐ ')+lab(i)})).concat([{k:'ok',l:`Confirm (${sel.length} chosen)`,pri:1},{k:'x',l:'Cancel'}]),a=>{
    if(a==='x')return fn(null);if(a==='ok')return fn(sel.length?sel:null);const i=+a.slice(1);pickDice(side,which,title,pool,max,fn,sel.includes(i)?sel.filter(j=>j!==i):sel.length<max?sel.concat([i]):sel)})}
// attacker modification options [R11]
function atkMods(){const A=G.atk,s=ship(A.a),d=ship(A.d),out=[];const hex=pilotHas(d,'hex');
  if(!hex&&(s.tl===A.d||s.tl2===A.d)&&rerollPool('tl').length)out.push({k:'tl',l:'Spend target lock: reroll',d:'Choose any of your dice and reroll them.'});
  if(A.w!=='P'&&UPGRADES[s.ups[A.ups].id].wpn.f2c&&!A.used.includes('f2c')&&cnt(A.dice,'focus'))out.push({k:'f2c',l:'Torpedo: focus → crit',d:'Change 1 focus result to a crit.'});
  if(s.flags.dead&&!A.used.includes('dead')&&cnt(A.dice,'focus'))out.push({k:'dead',l:'Deadshot focus',d:'Change 1 focus to a crit and the other focus results to hits.'});
  if(!hex&&s.focus>0&&cnt(A.dice,'focus'))out.push({k:'focus',l:'Spend focus',d:`Turn ${cnt(A.dice,'focus')} focus into hits.`});
  exAMods(out);
  return out}
const REROLL_MAX={tl:99,horace:99,wailer:1,krell:1,iveth:1,joren:2};
function rerollPool(k){const A=G.atk;const idx=A.dice.map((f,i)=>i).filter(i=>!A.rr[i]);if(k==='horace')return idx.filter(i=>A.dice[i]==='blank');return idx}
function applyAtkMod(k,sel){const A=G.atk,s=ship(A.a);const back=()=>{G.phase='amod';fx('mod',{id:s.id});refresh()};
  if(REROLL_MAX[k]){const pool=rerollPool(k);
    if(!sel){if(isHuman(s.side))return pickDice(s.side,'atk',(atkMods().find(m=>m.k===k)||{l:'Reroll'}).l,pool,REROLL_MAX[k],x=>x?applyAtkMod(k,x):back());sel=aiRerollAtk(s,pool,REROLL_MAX[k])}
    mark('amod:'+k);A.used.push(k);if(k==='tl'){if(s.tl===A.d)s.tl=null;else s.tl2=null;A.lockSpent=true}
    for(const i of sel){A.dice[i]=ATK_FACES[rnd(8)];A.rr[i]=true}lg(s.side,`${sname(s)} ${k==='tl'?'spends its lock and ':''}rerolls ${sel.length} ${sel.length===1?'die':'dice'}: ${diceText(A.dice)}.`);return back()}
  mark('amod:'+k);
  if(k==='jax'){A.used.push('jax');const pool=rerollPool('jax');for(const i of pool){A.dice[i]=ATK_FACES[rnd(8)];A.rr[i]=true}lg(s.side,`${sname(s)} rerolls everything: ${diceText(A.dice)}.`);return back()}
  if(k==='focus'){A.dice=A.dice.map(f=>f==='focus'?'hit':f);lg(s.side,`${sname(s)} spends focus: ${diceText(A.dice)}.`);return spendFocus(s,back)}
  if(k==='f2c'){A.used.push('f2c');const i=A.dice.indexOf('focus');if(i>=0)A.dice[i]='crit';lg(s.side,`${sname(s)} primes the torpedo: ${diceText(A.dice)}.`)}
  else if(k==='dead'){A.used.push('dead');let one=false;A.dice=A.dice.map(f=>f==='focus'?(one?'hit':(one=true,'crit')):f);lg(s.side,`${sname(s)} takes the deadshot: ${diceText(A.dice)}.`)}
  else exApplyAMod(k);
  back()}
function damodDone(){flushStress(()=>{G.phase='amod';refresh()})}
function applyDAMod(k,sel){exApplyDAMod(k,sel,()=>{fx('mod',{id:G.atk.d});if(!exDAMods().length)damodDone();else{G.phase='damod';refresh()}})}
function atkDone(){const A=G.atk,s=ship(A.a),d=ship(A.d);const n=defDice(s,d,A.bonus,A.rg,A.obs);
  A.def=rollN(DEF_FACES,n);A.defN=n;A.step='dmod';lg(d.side,`${sname(d)} rolls ${n} defense ${n===1?'die':'dice'}: ${diceText(A.def)}.`);G.phase='dmod';refresh()}
function defMods(){const A=G.atk,d=ship(A.d),out=[];if(d.focus>0&&cnt(A.def,'focus'))out.push({k:'focus',l:'Spend focus',d:`Turn ${cnt(A.def,'focus')} focus into evades.`});
  if(d.evade>0&&!A.noEvade)out.push({k:'evade',l:'Spend evade token',d:'Add one evade result.'});
  if(pilotHas(d,'kael')&&!A.used.includes('kael')&&cnt(A.def,'focus'))out.push({k:'kael',l:`${d.name}: focus → evade`,d:'Change 1 of your focus results to an evade (free).'});
  exDMods(out);return out}
function applyDefMod(k,sel){const A=G.atk,d=ship(A.d);const back=()=>{G.phase='dmod';fx('mod',{id:d.id});refresh()};
  if(k==='focus'){mark('dmod:focus');A.def=A.def.map(f=>f==='focus'?'evade':f);lg(d.side,`${sname(d)} spends focus: ${diceText(A.def)}.`);return spendFocus(d,back)}
  if(k==='evade'){mark('dmod:evade');d.evade--;A.def.push('evade');lg(d.side,`${sname(d)} spends an evade token.`);return back()}
  if(k==='kael'){mark('dmod:kael');A.used.push('kael');const i=A.def.indexOf('focus');if(i>=0)A.def[i]='evade';lg(d.side,`${sname(d)} jinks: ${diceText(A.def)}.`);return back()}
  exApplyDMod(k,sel,back)}
// what the attack would do right now (for the live preview)
function preview(A){if(typeof exPreview==='function')return exPreview(A);let hits=cnt(A.dice,'hit'),crits=cnt(A.dice,'crit');let ev=cnt(A.def||[],'evade');const c1=Math.min(ev,hits);hits-=c1;ev-=c1;crits-=Math.min(ev,crits);return {hits,crits}}
// the attack hits if at least one hit or crit is left uncancelled; an ion hit is a hit too [#3]
function defDone(){const A=G.atk,s=ship(A.a),d=ship(A.d);const r=preview(A);A.hit=r.hits+r.crits>0;if(pilotHas(s,'oren')&&cnt(A.dice,'crit')&&cnt(A.def,'evade'))mark('oren');G.stats[s.id]=G.stats[s.id]||{shots:0,dmg:0};G.stats[s.id].shots++;G.phase='combat';
  if(A.ion){if(A.hit){d.ion++;mark('ion');G.stats[s.id].dmg++;lg(d.side,`${sname(d)} is hit by ion fire: 1 damage and an ion token; the other dice are cancelled.`);return dealDamage(d,1,0,s,()=>exAfterAttack(s,d,A))}
    lg(d.side,`${sname(d)} evades the ion blast.`);return exAfterAttack(s,d,A)}
  if(!A.hit){lg(d.side,`${sname(d)} evades every shot.`);fx('miss',{id:d.id});return exAfterAttack(s,d,A)}
  const go=()=>{lg(s.side,`${sname(s)} hits ${sname(d)}: ${r.hits} damage${r.crits?` and ${r.crits} critical`:''}.`);G.stats[s.id].dmg+=r.hits+r.crits;dealDamage(d,r.hits,r.crits,s,()=>exAfterAttack(s,d,A),{varn:true})};
  const h=r.crits>0&&friendsOf(d).find(o=>talentOn(o,'u_heat')&&within(o,d,1));if(!h)return go();
  const take=()=>{r.crits--;mark('heat');lg(h.side,`${sname(h)} takes the heat: 1 crit meant for ${sname(d)}.`);dealDamage(h,0,1,s,go)};
  if(isHuman(h.side))return ask(h.side,'heat','Take the Heat',`${d.name} is about to take ${r.crits} crit${r.crits>1?'s':''}. Should ${h.name} suffer 1 of them instead?`,[{k:'y',l:'Take the heat'},{k:'n',l:'No'}],a=>a==='y'?take():go());
  remaining(h)>remaining(d)?take():go()}
function afterAttackDone(s){G.atk=null;G.phase='combat';s.fired=true;G.oi++;refresh();if(checkWin())return;nextAttackerLater()}
// damage: shields first, then cards; crits face up [R12]. With k the damage may stop for questions (Varn Kessik's choice, Brakk crew,
// Munitions Jam) and k runs when it is done; without k it resolves at once and those choices are decided by the heuristics.
function dealDamage(d,hits,crits,src,k,o){o=o||{};if(!d.alive&&d.flags.dyingPS==null){if(k)k();return}
  let sh=Math.min(d.sh,hits+crits);const shH=Math.min(sh,hits);hits-=shH;sh-=shH;const shC=Math.min(sh,crits);crits-=shC;d.sh-=shH+shC;
  if(shH+shC)fx('shield',{id:d.id,n:shH+shC});
  const cards=[];for(let i=0;i<hits;i++)cards.push(false);for(let i=0;i<crits;i++)cards.push(true);let i=0;
  const next=()=>{if(i)destroyCheck(d,src);// destroyed as soon as the damage reaches the hull
    if(i<cards.length&&(d.alive||d.flags.dyingPS!=null))return dealOne(d,cards[i++],src,!!k,o,next);if(cards.length)fx('hull',{id:d.id,n:cards.length});if(k)k()};next()}
// one faceup damage card dealt straight to the ship, past its shields (Plasma Bombs) [#6]
function dealCardDirect(d,src){if(!d.alive)return;dealOne(d,true,src,false,{},()=>{fx('hull',{id:d.id,n:1});destroyCheck(d,src)})}
// drawn cards wait in G.limbo while a question about them is open, so the deck count stays whole
const hold=c=>{(G.limbo=G.limbo||[]).push(c);return c},unhold=c=>{const i=(G.limbo||[]).indexOf(c);if(i>=0)G.limbo.splice(i,1);return c};
function dealOne(d,faceup,src,inter,o,k){const human=side=>inter&&isHuman(side);
  const place=c=>{
    const keep=()=>{unhold(c);if(!faceup){d.dmg.push({c,up:false});return k()}const D=DAMAGE[c];
      if(pilotHas(d,'grawl')){mark('grawl');lg(d.side,`${sname(d)} shrugs it off: ${D.n} goes facedown.`);d.dmg.push({c,up:false});return k()}
      if(D.tr==='Pilot'&&talentOn(d,'u_will')){mark('will');G.disc.push(c);lg(d.side,`${sname(d)}'s iron will shrugs off ${D.n}.`);return k()}
      const x={c,up:true,r:G.round};d.dmg.push(x);lg(d.side,`${sname(d)} suffers a critical hit: ${D.n}. ${D.t}`);fx('crit',{id:d.id,c});critNow(d,x,inter,k)};
    if(hasUp(d,'u_brakk')){const use=()=>{unhold(c);mark('brakk');useUp(d,'u_brakk');G.disc.push(c);if(d.sh<d.shMax)d.sh++;lg(d.side,`${sname(d)}'s copilot Brakk patches it up: the damage card is discarded and a shield recovered.`);k()};
      if(human(d.side))return ask(d.side,'brakk','Brakk',`${d.name} is dealt ${faceup?'a faceup card: '+DAMAGE[c].n+' ('+DAMAGE[c].t+')':'a facedown damage card'}. Discard it with Brakk (and recover 1 shield)? Brakk is then discarded.`,[{k:'y',l:'Discard it with Brakk'},{k:'n',l:'Keep Brakk for later'}],a=>a==='y'?use():keep());
      if(aiBrakk(d,c,faceup))return use()}
    keep()};
  if(faceup&&o.varn&&src&&pilotHas(src,'varn')){const three=[hold(drawDamage()),hold(drawDamage()),hold(drawDamage())];
    const pick=j=>{const c=three.splice(j,1)[0];three.forEach(unhold);G.disc.push(...three);mark('varn');lg(src.side,`${sname(src)} draws 3 damage cards and deals ${DAMAGE[c].n}.`);place(c)};
    if(human(src.side))return ask(src.side,'varn',src.name,`Choose which of the 3 drawn damage cards to deal faceup to ${d.name}; the others are discarded.`,three.map((c,j)=>({k:''+j,l:`${DAMAGE[c].n}: ${DAMAGE[c].t}`})),a=>pick(+a));
    return pick(aiMaarek(three))}
  place(hold(drawDamage()))}
function destroyCheck(d,src){if(hullDmg(d)>=d.hull&&d.alive&&exDelayDeath(d)){if(!d.flags.doomed){d.flags.doomed=true;mark('grudge');lg(d.side,`${sname(d)} is crippled but keeps fighting until the end of combat!`)}return}
  if(hullDmg(d)>=d.hull&&d.alive){const same=G.inCombat&&!!src&&psOf(src)===psOf(d);destroy(d,`${sname(d)} is destroyed!`,same)}}
function critNow(d,x,inter,k){k=k||(()=>{});const K=DAMAGE[x.c].k;
  if(K==='minor'){x.up=false;const f=ATK_FACES[rnd(8)];lg(d.side,`${sname(d)}: secondary blast rolls ${f}.`);if(f==='hit')dealDamage(d,1,0,null);return k()}
  if(K==='thrust'){x.up=false;addStress(d);return k()}
  if(K==='munitions'){x.up=false;const ws=d.ups.filter(u=>!u.gone&&UPGRADES[u.id].wpn);const lose=u=>{if(u){u.gone=true;lg(d.side,`${sname(d)} loses its ${UPGRADES[u.id].n}.`)}k()};
    if(ws.length>1&&inter&&isHuman(d.side))return ask(d.side,'munitions','Munitions Jam','Choose the secondary weapon to discard.',ws.map(u=>({k:u.id,l:UPGRADES[u.id].n})),a=>lose(ws.find(u=>u.id===a)));
    return lose(ws.slice().sort((a,b)=>UPGRADES[a.id].pts-UPGRADES[b.id].pts)[0])}
  k()}
function drawDamage(){if(!G.deck.length){G.deck=shuffle(G.disc);G.disc=[]}if(!G.deck.length)G.deck=shuffle(buildDamageDeck());return G.deck.pop()}
// a destroyed ship's damage cards go to the discard pile [#24] (a ship still due to fire simultaneously keeps them until it has fired)
function bury(s){if(s.deadHull!=null)return;s.deadHull=s.dmg.reduce((a,x)=>a+(x.up&&DAMAGE[x.c].k==='direct'?2:1),0);for(const x of s.dmg)G.disc.push(x.c);s.dmg=[]}
function destroy(s,text,simultaneous){s.alive=false;for(const o of G.ships){if(o.tl===s.id)o.tl=o.tl2||null,o.tl2=null;else if(o.tl2===s.id)o.tl2=null}// locks on a destroyed ship go away
  if(simultaneous&&!s.fired)s.flags.dyingPS=psOf(s);else bury(s);lg(s.side,text);fx('boom',{id:s.id});if(!simultaneous)checkWin()}
// both last ships destroyed together: the initiative player wins [#9]
function checkWin(){if(G.winner)return true;const a=[0,1].map(k=>G.ships.some(s=>s.side===k&&(s.alive||s.flags.dyingPS!=null)));
  if(a[0]&&a[1])return missionCheck();
  if(!a[0]&&!a[1]){const w=G.init;G.winner='P'+(w+1);G.winText=`${sideName(w)} wins: both squadrons were destroyed together, and ${sideName(w)} has initiative.`}else{const w=a[0]?0:1;G.winner='P'+(w+1);G.winText=`${sideName(w)} wins: every enemy ship is destroyed.`}
  G.phase='over';G.step=5;lg(-1,G.winText);return true}
function missionCheck(){if(G.round>=(G.ex.roundCap||ROUND_CAP)){const sc=[0,1].map(k=>G.ships.filter(s=>s.side!==k&&!s.alive).reduce((a,s)=>a+s.cost,0));const w=sc[0]===sc[1]?-1:sc[0]>sc[1]?0:1;
    G.winner=w<0?'draw':'P'+(w+1);G.winText=w<0?'Time: a draw on points destroyed.':`Time: ${sideName(w)} wins on points destroyed (${sc[w]} to ${sc[1-w]}).`;G.phase='over';G.step=5;lg(-1,G.winText);return true}return false}
function endPhase(){G.phase='end';G.step=4;G.inCombat=false;for(const s of alive())if(s.flags.doomed&&hullDmg(s)>=s.hull)destroy(s,`${sname(s)} finally breaks apart.`);if(checkWin()){refresh();return}
  for(const s of alive()){if(!exKeepFocus(s))s.focus=0;else if(s.focus)mark('kite');s.evade=0;s.flags.juke=false;s.flags.dead=false;s.flags.allin=false;s.flags.psT=null}// [R13] unused focus/evade tokens are removed; target locks stay
  exEndPhase(()=>{G.phase='end';if(!checkWin()){lg(-1,`End of round ${G.round}.`);if(ANIM)setTimeout(()=>{if(G&&!G.winner)startRound()},AIDELAY*.8);else startRound()}refresh()})}
// ---- one entry point for every player action: UI clicks, 3D clicks, keys, network, tests ----
function validMoves(side){if(!G||G.winner)return [];const out=[];
  if(G.phase==='plan'){for(const s of alive().filter(x=>x.side===side&&x.dial==null))dialOf(s).forEach((m,i)=>out.push({act:'dial',ship:s.id,m:i}));return out}
  if(G.phase==='ask'){if(G.q&&G.q.side===side)G.q.opts.forEach(o=>out.push({act:'ask',k:o.k}));return out}
  if(G.phase==='damod'){if(G.atk&&ship(G.atk.d).side===side){exDAMods().forEach(m=>out.push({act:'damod',k:m.k}));out.push({act:'damod',k:'done'})}return out}
  if(G.phase==='dmod'){if(G.atk&&ship(G.atk.d).side===side){defMods().forEach(m=>out.push({act:'dmod',k:m.k}));out.push({act:'dmod',k:'done'})}return out}
  const s=G.cur&&ship(G.cur);if(!s||s.side!==side)return [];
  if(G.phase==='action'){for(const a of actionsFor(s)){if(a.targets)a.targets.forEach(t=>out.push({act:'action',a:a.a,arg:t}));else if(a.opts)a.opts.forEach((o,i)=>out.push({act:'action',a:a.a,arg:i}));else out.push({act:'action',a:a.a})}out.push({act:'action',a:'skip'})}
  if(G.phase==='target'){for(const w of weaponsFor(s))for(const t of w.targets)out.push({act:'fire',w:w.k,t:t.id});out.push({act:'fire',w:'skip'})}
  if(G.phase==='amod'){atkMods().forEach(m=>out.push({act:'amod',k:m.k}));out.push({act:'amod',k:'done'})}
  return out}
function sideToAct(){if(!G||G.winner)return -1;if(G.phase==='plan'){const k=[0,1].find(k=>!planDone(k));return k==null?-1:k}if(G.phase==='ask')return G.q?G.q.side:-1;if(G.phase==='dmod'||G.phase==='damod')return ship(G.atk.d).side;const s=G.cur&&ship(G.cur);return s&&['action','target','amod'].includes(G.phase)?s.side:-1}
function performMove(mv,side){if(side==null)side=sideToAct();if(!G)return {success:false,error:'no game: call newGame() first'};
  if(G.winner)return {success:false,error:'the game is over'};
  const ok=validMoves(side).some(v=>JSON.stringify(v)===JSON.stringify(mv));
  if(!ok)return {success:false,error:`illegal move ${JSON.stringify(mv)} for side ${side} in phase ${G.phase}; legal: ${JSON.stringify(validMoves(side).slice(0,6))}${validMoves(side).length>6?'…':''}`};
  if(mv.act==='dial')setDial(ship(mv.ship),mv.m);
  else if(mv.act==='action')doAction(ship(G.cur),mv.a,mv.arg);
  else if(mv.act==='fire')declare(ship(G.cur),mv.w,mv.t);
  else if(mv.act==='amod'){if(mv.k==='done')atkDone();else applyAtkMod(mv.k)}
  else if(mv.act==='dmod'){if(mv.k==='done')defDone();else applyDefMod(mv.k)}
  else if(mv.act==='damod'){if(mv.k==='done')damodDone();else applyDAMod(mv.k)}
  else if(mv.act==='ask')resolveAsk(mv.k);
  return {success:true,state:render_game_to_text(side)}}
// what one side may see: enemy dials stay hidden until revealed
function getPlayerView(g,side){const v=JSON.parse(JSON.stringify(g));v.ships.forEach(s=>{if(s.side!==side&&g.phase==='plan'&&s.dial!=null)s.dial='set'});v.deck=v.deck.length;v.rng=null;return v}
function render_game_to_text(side){if(!G)return '{}';if(side==null)side=0;const v=getPlayerView(G,side);return JSON.stringify({round:v.round,phase:v.phase,cur:v.cur,winner:v.winner,q:v.q&&{key:v.q.key,side:v.q.side,opts:v.q.opts.length},
  ships:v.ships.map(s=>({id:s.id,side:s.side,n:s.name,ps:s.ps,x:Math.round(s.x),y:Math.round(s.y),h:+s.h.toFixed(2),hull:s.hull-(s.alive?s.dmg.reduce((a,x)=>a+(x.up&&DAMAGE[x.c].k==='direct'?2:1),0):s.deadHull||0),sh:s.sh,st:s.stress,f:s.focus,e:s.evade,ion:s.ion,tl:s.tl,tl2:s.tl2,dial:s.dial,alive:s.alive})),
  atk:v.atk&&{a:v.atk.a,d:v.atk.d,dice:v.atk.dice,def:v.atk.def},valid:validMoves(side).length})}
// rules that must always hold (called by the test scripts every tick)
function checkInvariants(){if(!G)return [];const bad=[];
  for(const s of G.ships){if(s.sh<0||s.sh>s.shMax)bad.push(`${s.id} shields ${s.sh}`);if(s.stress<0||s.focus<0||s.evade<0)bad.push(`${s.id} negative tokens`);
    if(s.alive&&!s.flags.doomed&&hullDmg(s)>=s.hull)bad.push(`${s.id} alive with ${hullDmg(s)} damage`);if(s.alive&&offBoard(s,B(s)))bad.push(`${s.id} alive off the board`);
    if(s.tl&&s.tl===s.tl2)bad.push(`${s.id} holds two locks on one ship`);if(new Set(s.doneR||[]).size!==(s.doneR||[]).length)bad.push(`${s.id} repeated an action this round: ${s.doneR}`)}
  const al=alive().filter(s=>!s.flags.unplaced);for(let i=0;i<al.length;i++)for(let j=i+1;j<al.length;j++)if(polyOverlap(corners(al[i],B(al[i])),corners(al[j],B(al[j]))))bad.push(`${al[i].id} overlaps ${al[j].id}`);
  const n=G.deck.length+G.disc.length+(G.limbo||[]).length+G.ships.reduce((a,s)=>a+s.dmg.length,0);if(n%DAMAGE_TOTAL!==0&&n<DAMAGE_TOTAL)bad.push(`damage cards lost: ${n}/${DAMAGE_TOTAL}`);
  if(G.round>(G.ex.roundCap||ROUND_CAP)+1)bad.push('game did not end');
  if(G.phase==='ask'&&(!G.q||!KONT[G.q.kid]))bad.push('a question with no answer handler');
  if(!G.winner&&sideToAct()<0&&['plan','action','target','amod','dmod','damod','ask'].includes(G.phase))bad.push(`no side can act in phase ${G.phase}`);
  return bad}
