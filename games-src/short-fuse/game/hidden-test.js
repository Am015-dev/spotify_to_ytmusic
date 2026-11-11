// Poisoned-state test: the computer teammates must decide only from knowledge(seat).
// At many decision points we copy G, scramble EVERYTHING the deciding seat cannot see (the identity of every unseen wire on
// crewmates' stands and the seat's own flipped wires, the robot's wires, the red pile, the unused "x of y" wires, the box,
// face-down equipment, every deck order, crewmates' secret number cards, hidden roles and restrictions), then ask again.
// The knowledge view and the decision (and the "what we know" helper) must be identical.   node hidden-test.js [seeds]
const {load}=require('./tools/load');const X=load(['data.js','engine.js','ai.js']);const E=X.E;
const seeds=+process.argv[2]||1;let checks=0,diffK=0,diffM=0,diffW=0,games=0;const bad=[];
let pr=987654321;const prnd=()=>{pr=(Math.imul(pr,1103515245)+12345)>>>0;return pr/4294967296};const pshuf=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(prnd()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
function visible(G,seat,si,sl){const own=G.pos[seat]===G.st[si].pos;return sl.cut||(own&&!sl.flip)||(!own&&sl.flip)}
function poison(G,seat){const P=JSON.parse(JSON.stringify(G));const holes=[];
  P.st.forEach((s,si)=>s.w.forEach(sl=>{if(!visible(P,seat,si,sl))holes.push(sl)}));
  // every id the seat cannot place: unseen slots, robot, pile, aside, box
  const pool=holes.map(sl=>sl.id).concat(P.robot?P.robot.w:[],P.pile,P.aside,P.box);pshuf(pool);let i=0;
  for(const sl of holes)sl.id=pool[i++];if(P.robot)P.robot.w=P.robot.w.map(()=>pool[i++]);P.pile=P.pile.map(()=>pool[i++]);P.aside=P.aside.map(()=>pool[i++]);P.box=P.box.map(()=>pool[i++]);
  for(const e of P.eq)if(e.down)e.id=pshuf(Object.keys(E.EQUIP))[0];pshuf(P.eqDeck);pshuf(P.eqPool);
  const scr=o=>{if(!o||typeof o!=='object')return;for(const k in o){const v=o[k];if(Array.isArray(v)&&(k==='deck'||k==='fl'||k==='box'))pshuf(v);else if(v&&typeof v==='object'&&!Array.isArray(v))scr(v)}};scr(P.ms);
  if(P.ms.mr&&P.ms.mr.fd&&P.ms.mr.fd.from!==seat)P.ms.mr.fd.v=1+Math.floor(prnd()*12);
  for(const q of P.seats){if(q.i===seat)continue;if(P.mission===29||P.mission===39)q.cards=q.cards.map(()=>1+Math.floor(prnd()*12));
    if(P.ms.mole&&P.ms.mole.hidden&&q.con){q.con='ABCDE'[Math.floor(prnd()*5)];if(q.role==='weak'&&P.seats[seat].role!=='weak'){q.role=null;const others=P.seats.filter(o=>o.i!==seat);others[Math.floor(prnd()*others.length)].role='weak'}}
    if(P.ms.roleHidden&&q.chDown)q.ch=pshuf(['ch_base1','ch_base2','ch_base3','ch_base4','ch_captain'])[0]}
  P.rng=(P.rng^0x9e3779b9)|0;return P}
// control: a cheating chooser that peeks at G must be caught by the same comparison
let cheatChecks=0,cheatCaught=0;
function cheat(seat){const K=X.knowledge(seat);if(!K.legal)return null;const hit=K.legal.plain.find(m=>E.cv(X.G.st[m.st].w[m.ks[0]].id)===m.v);return JSON.stringify(hit||K.legal.plain[0]||null)}
function checkCheat(seat){const real=X.G;const c1=cheat(seat);if(c1==null)return;const P=poison(real,seat);X.G=P;let c2;try{c2=cheat(seat)}finally{X.G=real}cheatChecks++;if(c1!==c2)cheatCaught++}
function check(seat,tag){if(X.G.step==='act'&&seat===X.G.actor&&!X.G.q&&checks%5===0)checkCheat(seat);const real=X.G;const salt=(checks*2654435761)>>>0;
  X.ai.setAiSeed(salt);const K1=JSON.stringify(X.knowledge(seat));const m1=JSON.stringify(X.ai.aiMove(seat));
  const P=poison(real,seat);X.G=P;X.ai.setAiSeed(salt);let K2,m2;try{K2=JSON.stringify(X.knowledge(seat));m2=JSON.stringify(X.ai.aiMove(seat))}finally{X.G=real}
  checks++;if(K1!==K2){diffK++;if(bad.length<6){let i=0;while(i<K1.length&&K1[i]===K2[i])i++;bad.push(tag+' K differs near: '+K1.slice(Math.max(0,i-80),i+60))}}
  if(m1!==m2){diffM++;if(bad.length<6)bad.push(tag+' move differs '+m1+' vs '+m2)}
  if(checks%7===0&&real.step==='act'&&seat===real.actor&&!real.q){X.ai.setAiSeed(salt);const w1=JSON.stringify(X.ai.whatWeKnow(seat,30));X.G=P;X.ai.setAiSeed(salt);let w2;try{w2=JSON.stringify(X.ai.whatWeKnow(seat,30))}finally{X.G=real}if(w1!==w2){diffW++;if(bad.length<6)bad.push(tag+' whatWeKnow differs')}}}
const t0=Date.now();
for(let n=1;n<=66;n++)for(const np of [2,3,4,5]){if(!X.MISSIONS[n].pl.includes(np))continue;for(let g=0;g<seeds;g++){
  X.setSeed(4242+n*31+np*7+g);X.ai.setAiSeed(99);X.newGame({np,mission:n,mode:'ai',lv:['normal','easy','hard','normal','easy'],chars:n>=31?{1:'ch_new3',2:'ch_new4',3:'ch_new1',4:'ch_new2'}:{}});games++;let k=0;
  while(!X.G.over&&k++<1500){const s=X.sideToAct();if(s>=0&&k%3===0)check(s,`job ${n} ${np}p step ${k}`);if(k%11===0)for(const q of X.G.seats)if(q.i!==s)check(q.i,`job ${n} ${np}p off-turn ${q.i}`);
    const st=X.ai.aiStep();if(!st)break;const r=X.performMove(st.m,st.seat);if(!r.success)break}}}
console.log(`hidden-test: ${games} games, ${checks} poisoned decisions; knowledge differs ${diffK}, decision differs ${diffM}, what-we-know differs ${diffW}; ${((Date.now()-t0)/1000).toFixed(0)}s`);
for(const b of bad)console.log('  ',b);
console.log(`control: a peeking chooser was caught in ${cheatCaught} of ${cheatChecks} poisoned checks`);
console.log(diffK+diffM+diffW===0&&cheatCaught>0?'PASS: the AI never reads hidden state (and the test does catch a peeking AI)':'FAIL');
