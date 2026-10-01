// ===================== Short Fuse engine =====================
// G is plain JSON. Every change goes through performMove(); engine steps waiting to run sit on the agenda G.ag as
// {h,d} (handler key + data, never closures); a pending question is G.q = {who,kind,title,opts:[{l,h,d}]}.
var ANIM=1,AIDELAY=500,DEFSEED=null;const SAVE='shortfuse_save1';
let G=null;const UI={sim:0};
const SEAT_NAMES=['Amber','Slate','Teal','Coral','Olive'];
function rnd(n){let t=(G.rng=(G.rng+0x6D2B79F5)|0);t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return Math.floor(((t^t>>>14)>>>0)/4294967296*n)}
function setSeed(s){DEFSEED=s>>>0;if(G)G.rng=s>>>0}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
function lg(t,c){G.logN++;G.log.unshift({t,c:c||'',i:G.logN,turn:G.turn});if(G.log.length>400)G.log.length=400}
const VN=v=>v==='Y'?'yellow':v==='R'?'red':String(v);
const NUMS=[1,2,3,4,5,6,7,8,9,10,11,12];
const clone=o=>JSON.parse(JSON.stringify(o));
// ---------- wires ----------
function cv(id){const w=WIRES[id];if(w.c==='r')return 'R';if(w.c==='y')return 'Y';if(G.ms.fakeRed===w.v)return 'R';return w.v}
const sv=id=>WIRES[id].s;
const isRed=id=>cv(id)==='R';
// ---------- seats, positions, stands ----------
const SP=i=>G.seats[i];
function seatAt(p){return G.pos.indexOf(p)}
function ownerOf(si){return seatAt(G.st[si].pos)}
function standsOf(seat){const p=G.pos[seat];const o=[];for(const s of G.st)if(s.pos===p)o.push(s.i);return o}
function slotsOf(seat){const o=[];for(const si of standsOf(seat))G.st[si].w.forEach((sl,k)=>o.push({s:si,k,sl}));return o}
function uncutOf(seat){return slotsOf(seat).filter(x=>!x.sl.cut)}
function hasWires(seat){return uncutOf(seat).length>0}
function findU(u){for(const s of G.st){const k=s.w.findIndex(x=>x.u===u);if(k>=0)return {s:s.i,k,sl:s.w[k]}}return null}
function leftOf(seat){return seatAt((G.pos[seat]+1)%G.np)}
function rightOf(seat){return seatAt((G.pos[seat]+G.np-1)%G.np)}
function clockFrom(seat){const o=[];for(let k=0;k<G.np;k++)o.push(seatAt((G.pos[seat]+k)%G.np));return o}
// the values a seat can see itself holding (its own flipped wires are hidden from it)
function heldVals(seat,inclX){const o={};for(const x of uncutOf(seat)){if(x.sl.flip)continue;if(x.sl.x&&!inclX&&xLocked())continue;const v=cv(x.sl.id);o[v]=(o[v]||0)+1}return o}
function xLocked(){const r=hasRule(G.mission,'xWire');return !!(r&&r.lockYellow&&remaining('Y')>0)}
// ---------- counts ----------
function cutCount(v){let n=0;for(const s of G.st)for(const x of s.w)if(x.cut&&cv(x.id)===v)n++;for(const id of G.gone)if(cv(id)===v)n++;return n}
function remaining(v){return (G.tot[v]||0)-cutCount(v)}
function allSlots(){const o=[];for(const s of G.st)s.w.forEach((sl,k)=>o.push({s:s.i,k,sl}));return o}
// ---------- agenda ----------
function now(h,d){G.ag.splice(G.agI++,0,{h,d:d||{}})}
function later(h,d){G.ag.push({h,d:d||{}})}
const AG={};const QH={};
function ask(who,kind,title,opts,ctx){if(!opts.length)return false;G.q={who,kind,title,opts,ctx:ctx||{}};return true}
function flow(){let g=0;while(G&&!G.over&&!G.q&&G.ag.length&&g++<2000){const x=G.ag.shift();G.agI=0;AG[x.h](x.d)}G.agI=0}
// ---------- setup ----------
function stCount(np,seat,cap){return np===2?2:np===3?(seat===cap?2:1):1}
function colSpec(M,np,c){const two=np===2&&M.two&&M.two[c]!==undefined;return two?M.two[c]:M[c]}
function newGame(o){o=o||{};const seed=o.seed!=null?o.seed>>>0:DEFSEED!=null?DEFSEED:Math.floor(Math.random()*2**31);const np=o.np||4;const n=o.mission||1;const M=MISSIONS[n];
  if(!M)throw new Error('no mission '+n);if(!M.pl.includes(np))throw new Error('mission '+n+' is not playable with '+np);
  G={v:1,seed,rng:seed,np,mission:n,phase:'setup',step:null,turn:0,round:0,cur:-1,actor:-1,captain:0,pos:[],seats:[],st:[],robot:null,pile:[],aside:[],box:[],gone:[],
    dial:0,eq:[],eqPool:[],eqDeck:[],tokSup:clone(INFO_TOKENS),tokBox:{},valid:[],fin:{},validOff:0,ann:[],hist:[],marks:[],ms:{},markers:{},tot:{},clock:0,ag:[],agI:0,q:null,over:null,winText:'',
    log:[],logN:0,uid:0,tfx:{},prompt:null,blockRun:0,stats:{dual:0,dualOk:0,solo:0,miss:0,eqUse:0,turns:0},opts:{turnSec:o.turnSec||12,realtime:!!o.realtime,full:!!o.full},eqOut:[],tokFam:M.tok};
  G.captain=o.captain!=null?o.captain:rnd(np);
  for(let i=0;i<np;i++){G.pos.push(i);const h=o.seats?o.seats[i]==='human':(o.mode==='hot'||(o.mode==='solo'&&i===0));
    G.seats.push({i,nm:(o.names&&o.names[i])||SEAT_NAMES[i],human:!!h,lv:(o.lv&&o.lv[i])||o.level||'normal',ch:null,chUsed:0,chDown:0,noItem:0,role:null,con:null,conDown:0,ox:0,cards:[],out:0})}
  lg(`Job ${n}: ${M.nm}. ${np} crew, ${SP(G.captain).nm} is the foreman.`,'big');
  setupWires(M);setupChars(M,o);setupEquip(M);
  G.dial=M.dial==='players'?np:M.dial==='players+1'?Math.min(DIAL_MAX,np+1):M.dial;
  for(const r of M.rules)if(RH[r.k].setup)RH[r.k].setup(r);
  // setup steps: rule pre-steps, the opening tokens, rule post-steps, then play
  for(const r of M.rules)if(RH[r.k].pre)RH[r.k].pre(r);
  infoSetup(M);
  for(const r of M.rules)if(RH[r.k].post)later('setupPost',{k:r.k});
  later('beginPlay');flow();
  if(typeof refresh==='function'&&!UI.sim)refresh();return G}
function drawCol(M,np,c){const spec=colSpec(M,np,c);const ids=c==='red'?RED_IDS:YEL_IDS;if(!spec)return {inPlay:[],aside:[],marks:[],q:0,spec:null};
  let pool=ids.filter(id=>!spec.cand||(sv(id)>=spec.cand[0]-1e-9&&sv(id)<=spec.cand[1]+1e-9));
  if(spec.m==='fixed'){const ip=ids.filter(id=>spec.vals.some(v=>Math.abs(v-sv(id))<1e-6));return {inPlay:ip,aside:[],marks:ip.map(sv),q:0,spec}}
  let n=spec.n==='players_max_4'?Math.min(np,4):spec.n;shuffle(pool);
  if(spec.m==='exact'){const ip=pool.slice(0,n);return {inPlay:ip,aside:[],marks:ip.map(sv).sort((a,b)=>a-b),q:0,spec}}
  const drawn=pool.slice(0,spec.of);const marks=drawn.map(sv).sort((a,b)=>a-b);shuffle(drawn);return {inPlay:drawn.slice(0,n),aside:drawn.slice(n),marks,q:1,spec}}
function standOrder(){const o=[];for(const seat of clockFrom(G.captain))o.push(...standsOf(seat));return o}
function newSlot(id){return {id,u:++G.uid,cut:0,tok:[],not:[],x:0,flip:0,na:0}}
function setupWires(M){const np=G.np;
  // stands: captain first, clockwise
  for(const seat of clockFrom(G.captain)){const k=stCount(np,seat,G.captain);for(let j=0;j<k;j++)G.st.push({i:G.st.length,pos:G.pos[seat],w:[],side:[]})}
  if(hasRule(G.mission,'fakeRed'))G.ms.fakeRed=1+rnd(12);
  const blue=WIRES.filter(w=>w.c==='b'&&w.v<=M.blue).map(w=>w.id);
  const R=drawCol(M,np,'red'),Y=drawCol(M,np,'yel');
  G.markers={red:R.marks,redQ:R.q,redN:R.inPlay.length,yel:Y.marks,yelQ:Y.q,yelN:Y.inPlay.length};
  G.aside=R.aside.concat(Y.aside);
  for(const id of WIRES.map(w=>w.id))if(!blue.includes(id)&&!R.inPlay.includes(id)&&!Y.inPlay.includes(id)&&!G.aside.includes(id))G.box.push(id);
  const inPlay=blue.concat(R.inPlay,Y.inPlay);
  for(const id of inPlay){const v=cv(id);if(v!=='R')G.tot[v]=(G.tot[v]||0)+1}
  const pre={};G.st.forEach(s=>pre[s.i]=[]);const order=standOrder();
  let rest=blue.slice();let specials=[];
  const xr=hasRule(G.mission,'xWire');const dealt={};
  // special deals: one per player from the foreman
  const oneEach=(ids,mode)=>{let seats=clockFrom(G.captain);if(mode.includes('skip_captain_at_5')&&np===5)seats=seats.slice(1);const got={};ids.forEach((id,i)=>{const seat=seats[i%seats.length];const sts=standsOf(seat);const j=(got[seat]||0)%sts.length;got[seat]=(got[seat]||0)+1;pre[sts[j]].push(id)});return got};
  for(const [C,col] of [[R,'red'],[Y,'yel']]){if(!C.spec)continue;const d=C.spec.deal||'';
    if(d.startsWith('one_per_player'))dealt[col]=oneEach(C.inPlay,d);else if(d==='facedown_pile_not_dealt')G.pile=C.inPlay.slice();else specials=specials.concat(C.inPlay)}
  if(dealt.red||dealt.yel)G.ms.dealt=dealt;
  // the hard-wired job: one blue per stand, unsorted at the far right, before reds/yellows go in
  shuffle(rest);const xIds={};if(xr&&xr.mode==='extra')for(const s of G.st){xIds[s.i]=rest.shift()}
  let pool=shuffle(rest.concat(specials));
  if(hasRule(G.mission,'robotPatrol')){const k={2:5,3:4,4:4,5:3}[np];G.robot={at:1,dir:1,w:pool.splice(0,k)}}
  // round-robin deal per stand, captain's first stand first
  const lastDealt={};let t=0;const base=G.st.map(s=>pre[s.i].length);
  // fill to even: deal one at a time to the stand with the fewest so far (ties in table order) - equals round-robin
  const cnt=G.st.map((s,i)=>base[i]);
  while(pool.length){let best=0;for(let i=1;i<order.length;i++)if(cnt[order[i]]<cnt[order[best]])best=i;const si=order[best];const id=pool.shift();pre[si].push(id);cnt[si]++;lastDealt[si]=id;t++}
  for(const s of G.st){let ids=pre[s.i].slice();let xid=null;
    if(xr&&xr.mode==='last'&&lastDealt[s.i]!=null){xid=lastDealt[s.i];ids.splice(ids.lastIndexOf(xid),1)}
    if(xr&&xr.mode==='extra')xid=xIds[s.i];
    ids.sort((a,b)=>sv(a)-sv(b)||a-b);s.w=ids.map(newSlot);if(xid!=null){const sl=newSlot(xid);sl.x=1;s.w.push(sl)}}
  const fr=hasRule(G.mission,'flip');if(fr)doFlips(fr)}
function doFlips(r){const who=r.who==='captain'?[G.captain]:clockFrom(G.captain);
  for(const seat of who){const sts=standsOf(seat);const all=slotsOf(seat);
    if(r.n===1){const x=all[rnd(all.length)];G.st[x.s].w.splice(x.k,1);x.sl.flip=1;G.st[x.s].w.push(x.sl)}
    else{const pick=shuffle(all.slice()).slice(0,2);for(const x of pick)G.st[x.s].w.splice(G.st[x.s].w.indexOf(x.sl),1);pick.sort((a,b)=>sv(a.sl.id)-sv(b.sl.id));
      pick[0].sl.flip=1;pick[1].sl.flip=1;const s1=G.st[sts[0]],s2=G.st[sts[sts.length-1]];s1.w.unshift(pick[0].sl);s2.w.push(pick[1].sl)}}
  lg(r.who==='captain'?`${SP(G.captain).nm} flips one wire blind to the far right.`:`Everyone flips ${r.n===1?'one wire':'two wires'} blind.`)}
function setupChars(M,o){const n=G.mission;let mode=M.chars;
  if(mode==='random_deal'||mode==='hidden_random_deal'){const d=shuffle(['ch_captain'].concat(shuffle(BASE_CHARS.slice(1)).slice(0,G.np-1)));G.seats.forEach((s,i)=>s.ch=d[i]);
    const holder=G.seats.find(s=>s.ch==='ch_captain').i;const role=hasRule(n,'rookie')?'rookie':hasRule(n,'liar')?'liar':'weak';SP(holder).role=role;
    if(mode==='hidden_random_deal'){G.seats.forEach(s=>s.chDown=1);G.ms.roleHidden=1}else lg(`${SP(holder).nm} drew the foreman card: ${role==='rookie'?'the rookie':'the fibber'} this job.`);return}
  const allowed=allowedChars(n,G.np);let nb=1;
  for(const s of G.seats){if(s.i===G.captain){s.ch='ch_captain';continue}const want=o.chars&&o.chars[s.i];
    if(want&&allowed.includes(want)&&!G.seats.some(q=>q.ch===want))s.ch=want;else{while(G.seats.some(q=>q.ch==='ch_base'+nb))nb++;s.ch='ch_base'+nb;nb++}}
  if(mode==='no_personal_items')G.seats.forEach(s=>s.noItem=1);
  if(mode==='captain_has_none')SP(G.captain).ch=null}
function allowedChars(n,np){const M=MISSIONS[n];let a=['ch_base1','ch_base2','ch_base3','ch_base4'];if(n>=31&&M.chars!=='base_only')a=a.concat(['ch_new1','ch_new2','ch_new3','ch_new4']);return a.filter(c=>!M.chEx.includes(c))}
function missionHasYellow(M){return !!colSpec(M,G.np,'yel')}
function setupEquip(M){const n=G.mission;const e=M.eq||{};
  let pool=[];if(n>=3)pool=EQ_IDS.filter(id=>EQUIP[id].pool==='base');if(n>=9&&missionHasYellow(M))pool.push('eqY');if(n>=55)pool=pool.concat(EQ_IDS.filter(id=>EQUIP[id].pool==='double'));
  pool=pool.filter(id=>!(e.ex||[]).includes(id));shuffle(pool);
  const done=()=>{const used=new Set(G.eq.map(x=>x.id).concat(G.eqPool,G.eqDeck));G.eqOut=EQ_IDS.filter(id=>!used.has(id))};
  if(e.fixed){G.eq=e.fixed.map(id=>({id,st:'ready',down:0,cover:null,perm:1}));G.eqPool=[];done();return}
  const cnt=e.n===0?0:G.np;
  if(hasRule(n,'special4')&&hasRule(n,'special4').reward==='eqDeck'){G.eqDeck=pool.splice(0,7);G.eqPool=pool;done();return}
  G.eq=pool.splice(0,cnt).map(id=>({id,st:'locked',down:hasRule(n,'eqDeckReveal')?1:0,cover:null,perm:0}));G.eqPool=pool;done()}
// opening info tokens
function infoSetup(M){let mode=M.info;const two=G.np===2&&M.two;
  if(mode==='none')return;
  for(const seat of clockFrom(G.captain)){
    if(two&&two.capNoInfo&&seat===G.captain)continue;
    if(two&&two.capRandInfo&&seat===G.captain){later('infoRand',{seat,redrawY:1});continue}
    if(mode==='rand'){later('infoRand',{seat,redrawY:G.mission!==41});continue}
    if(mode==='neg'){later('infoNeg',{seat,left:2});continue}
    if(mode==='false2'){later('infoFalse',{seat,left:2,red:1});continue}
    if(SP(seat).role==='liar'){later('infoFalse',{seat,left:2,red:0});continue}
    later('infoStd',{seat,memory:mode==='memory'})}}
// ---------- info tokens ----------
// token kinds on a wire: n (true number) y (yellow) p (even/odd) c (count on stand) f (false: "NOT v"). Beside a stand: {t:'n'|'y',v,mean:'has'|'none'}
function tokFromSupply(v){const k=v==='Y'?'Y':v;if(G.tokSup[k]>0){G.tokSup[k]--;return 1}
  // shortage (FAQ): take back a token from a wire that is already cut, else it is just "said out loud" (spoken)
  for(const s of G.st)for(const x of s.w)if(x.cut){const j=x.tok.findIndex(t=>!t.sp&&(t.t==='n'||t.t==='f')&&t.v===v||(v==='Y'&&t.t==='y'&&!t.sp));if(j>=0){x.tok.splice(j,1);return 1}}
  return 0}
function returnTok(t){if(t.sp)return;if(t.t==='n'||t.t==='f')G.tokSup[t.v==='Y'?'Y':t.v]++;else if(t.t==='y')G.tokSup.Y++}
function mkTok(kind,v){const o={t:kind,v};if(kind==='n'||kind==='y'||kind==='f'){if(!tokFromSupply(kind==='y'?'Y':v))o.sp=1}return o}
function countOnStand(si,v){return G.st[si].w.filter(x=>cv(x.id)===v).length}
// the token a wire gets for showing its value, in this job's token family
function trueTok(si,sl,called){const v=cv(sl.id);const fam=G.tokFam;
  if(fam==='none')return null;
  if(fam==='false'||(SP(ownerOf(si)).role==='liar'&&hasRule(G.mission,'liar')))return called!=null&&called!==v?mkTok('f',called):null;
  if(fam==='par'){if(v==='Y')return mkTok('y','Y');return {t:'p',v:v%2===0?'e':'o'}}
  if(fam==='cnt')return {t:'c',v:countOnStand(si,v)};
  return v==='Y'?mkTok('y','Y'):mkTok('n',v)}
function putTok(si,sl,tok,memory){if(!tok)return;if(memory||G.ms.memory){G.st[si].side.push(Object.assign(tok,{mean:'has'}));return}sl.tok.push(tok)}
function sideTok(si,v,mean){const t=mkTok(v==='Y'?'y':'n',v);t.mean=mean;G.st[si].side.push(t)}
// own blue wires a seat may tag (flipped wires excluded: the owner cannot see them)
function ownBlue(seat,cutOk){return slotsOf(seat).filter(x=>!x.sl.flip&&WIRES[x.sl.id].c==='b'&&!isRed(x.sl.id)&&(cutOk||!x.sl.cut))}
AG.infoStd=d=>{const opts=ownBlue(d.seat,false).map(x=>({l:`Tag your ${cv(x.sl.id)} (stand ${x.s+1}, slot ${x.k+1})`,h:'infoStd',d:{seat:d.seat,u:x.sl.u,memory:d.memory}}));
  if(!opts.length)return;ask(d.seat,'infoStd','Place your opening info token on one of your blue wires',opts)};
QH.infoStd=d=>{const f=findU(d.u);putTok(f.s,f.sl,trueTok(f.s,f.sl),d.memory);lg(`${SP(d.seat).nm} places an opening token${d.memory?' beside the stand':''}.`)};
AG.infoRand=d=>{const bag=[];for(const k in G.tokSup){if(d.redrawY&&k==='Y')continue;for(let i=0;i<G.tokSup[k];i++)bag.push(k==='Y'?'Y':+k)}if(!bag.length)return;const v=bag[rnd(bag.length)];
  const m=slotsOf(d.seat).filter(x=>!x.sl.cut&&!x.sl.flip&&cv(x.sl.id)===v&&!x.sl.tok.length);
  if(m.length){const x=m[0];x.sl.tok.push(G.tokFam==='cnt'?{t:'c',v:countOnStand(x.s,v)}:G.tokFam==='par'&&v!=='Y'?{t:'p',v:v%2?'o':'e'}:mkTok(v==='Y'?'y':'n',v));lg(`${SP(d.seat).nm} draws token ${VN(v)} and places it on a matching wire.`)}
  else{sideTok(standsOf(d.seat)[0],v,'none');lg(`${SP(d.seat).nm} draws token ${VN(v)} and holds no such wire: it goes beside the stand.`)}};
AG.infoNeg=d=>{const held=heldVals(d.seat,true);const opts=NUMS.concat(['Y']).filter(v=>!held[v]&&!slotsOf(d.seat).some(x=>x.sl.flip&&cv(x.sl.id)===v)&&G.tokSup[v==='Y'?'Y':v]>0&&!G.st[standsOf(d.seat)[0]].side.some(t=>t.v===v)).map(v=>({l:`Show you hold no ${VN(v)}`,h:'infoNeg',d:{seat:d.seat,v,left:d.left}}));
  if(!opts.length)return;ask(d.seat,'infoNeg','Lay a token for a value you do NOT hold',opts)};
QH.infoNeg=d=>{const sts=standsOf(d.seat);sideTok(sts[(2-d.left)%sts.length],d.v,'none');lg(`${SP(d.seat).nm} shows they hold no ${VN(d.v)}.`);if(d.left>1)now('infoNeg',{seat:d.seat,left:d.left-1})};
AG.infoFalse=d=>{const opts=[];for(const x of slotsOf(d.seat)){if(x.sl.cut||x.sl.flip||x.sl.tok.length)continue;const real=cv(x.sl.id);if(real==='R'&&!d.red)continue;
    for(const v of NUMS)if(v!==real&&G.tokSup[v]>0)opts.push({l:`Say your stand ${x.s+1} slot ${x.k+1} is NOT ${v}`,h:'infoFalse',d:{seat:d.seat,u:x.sl.u,v,left:d.left,red:d.red}})}
  if(!opts.length)return;ask(d.seat,'infoFalse','Place a false token ("this wire is NOT this value")',opts)};
QH.infoFalse=d=>{const f=findU(d.u);f.sl.tok.push(mkTok('f',d.v));lg(`${SP(d.seat).nm} places a false token.`);if(d.left>1)now('infoFalse',{seat:d.seat,left:d.left-1,red:d.red})};
// ---------- play ----------
AG.setupPost=d=>{RH[d.k].post(rules().find(x=>x.k===d.k))};
AG.beginPlay=()=>{G.phase='turn';G.round=1;G.cur=G.captain;G.actor=G.captain;for(const r of rules())if(RH[r.k].begin)RH[r.k].begin(r);lg('The fuse is lit.','big');later('startTurn',{seat:G.captain})};
function rules(){return MISSIONS[G.mission].rules}
function hook(name,...a){for(const r of rules()){const f=RH[r.k][name];if(f)f(r,...a)}}
function hookAny(name,...a){for(const r of rules()){const f=RH[r.k][name];if(f){const x=f(r,...a);if(x!=null&&x!==false&&x!=='')return x}}return null}
AG.startTurn=d=>{if(G.over)return;G.cur=d.seat;G.actor=d.seat;G.turn++;G.stats.turns++;G.tfx={};G.step='start';
  lg(`— ${SP(d.seat).nm}'s turn —`,'turn');
  later('timeline');if(!hookAny('noForced'))later('forced');for(const r of rules())if(RH[r.k].start)later('ruleStart',{k:r.k});later('ready')};
AG.ruleStart=d=>{const r=rules().find(x=>x.k===d.k);RH[d.k].start(r,G.cur)};
AG.timeline=()=>{hook('tick')};
// at the start of a turn: a hand of only reds is revealed (forced); an empty hand passes
AG.forced=()=>{if(G.tfx.skip||G.tfx.acted)return;const s=G.actor;const u=uncutOf(s);
  if(!u.length){G.tfx.skip=1;return}
  if(u.every(x=>isRed(x.sl.id))&&!hookAny('noReveal',s)){revealReds(s);return}
  hook('forcedStart',s)};
AG.ready=()=>{if(G.over||G.tfx.wait)return;if(G.tfx.skip||G.tfx.acted){G.step='end';schedEnd();return}
  G.step='act';checkStuck()};
function checkStuck(){if(mainMoves(G.actor,true).length)return;
  if(hookAny('stuck',G.actor))return;lg(`${SP(G.actor).nm} has no legal cut left.`,'bad');explode('a crew member had no legal cut left (the bomb goes off, as the rules say for a hand that cannot be cut)')}
function endAction(){G.tfx.acted=1;G.blockRun=0;if(G.step==='act'){G.step='end';schedEnd()}}
function skipTurn(why,dial){G.tfx.acted=1;G.tfx.skipped=1;G.hist.push({seat:G.actor,kind:'skip',turn:G.turn});lg(`${SP(G.actor).nm} skips: ${why}.`);if(dial)advance(dial,'skipped turn');finishSkip()}
AG.endTurn=()=>{if(G.over)return;const s=G.cur;hook('end',s);if(G.over)return;checkWin();if(G.over)return;
  if(!G.opts.realtime)advanceClock(G.opts.turnSec);if(G.over)return;
  // safety: four full rounds in a row without any cut, card or tool means the crew is stuck
  {const h=G.hist[G.hist.length-1];if(G.tfx.skipped||!h||h.turn!==G.turn||h.kind==='skip'||h.kind==='none')G.idle=(G.idle||0)+1;else G.idle=0;const act=G.seats.filter(q=>hasWires(q.i)).length;if(G.idle>=4*Math.max(1,act)){explode('the crew made no progress for four full rounds');return}}
  if(!G.tfx.acted&&!G.tfx.skip)G.hist.push({seat:s,kind:'none',turn:G.turn});
  let next=null;
  if(G.tfx.extra)next=G.cur;else if(G.tfx.coffee!=null)next=G.tfx.coffee;
  const special=next==null?hookAny('nextTurn',s):null;if(special==='wait')return;if(special!=null&&typeof special==='number')next=special;
  if(next==null){next=null;for(let k=1;k<=G.np;k++){const q=seatAt((G.pos[s]+k)%G.np);if(hasWires(q)){next=q;break}}}
  if(next==null){checkWin();if(!G.over)explode('nobody has wires left to cut, but the bomb is not clear');return}
  // round boundary: passing the foreman's seat
  const steps=((G.pos[next]-G.pos[s])+G.np)%G.np||G.np;for(let k=1;k<=steps;k++)if((G.pos[s]+k)%G.np===G.pos[G.captain]){G.round++;hook('round');if(G.over)return;break}
  later('startTurn',{seat:next})};
function advanceClock(sec){G.clock+=sec;hook('tick')}
// ---------- fuse ----------
function advance(n,why,ctx){if(G.over||n<=0)return;if(hookAny('dialAdv',n,ctx||{}))return;G.dial-=n;lg(`The fuse burns ${n} step${n>1?'s':''} (${why}). ${Math.max(0,G.dial)} left.`,'bad');if(G.dial<=0)explode('the fuse burnt down')}
function rewind(n,why){if(G.dial==null)return;const b=G.dial;G.dial=Math.min(DIAL_MAX,G.dial+n);if(G.dial>b)lg(`The fuse turns back (${why}). ${G.dial} left.`,'good')}
function explode(why){if(G.over)return;G.over={win:false,why};G.winText='BOOM! '+why;G.phase='over';G.q=null;G.ag=[];lg('BOOM! '+why,'big')}
function checkWin(){if(G.over)return;if(G.st.some(s=>s.w.some(x=>!x.cut)))return;if(G.robot&&G.robot.w.length)return;const r=hookAny('winBlock');if(r){explode(r);return}
  G.over={win:true,why:'every wire is safe'};G.winText='Defused! Every wire is safe.';G.phase='over';G.q=null;G.ag=[];lg('Defused! The crew made it.','big')}
// ---------- cutting ----------
function cutSlot(sl){if(sl.cut)return;sl.cut=1;for(const t of sl.tok.splice(0))if(t.t==='n'||t.t==='y'||t.t==='f')returnTok(t);else sl.tok.push(t);
  if(G.tokFam==='cnt')sl.tok=sl.tok.filter(t=>t.t==='c')}
function revealReds(seat){const u=uncutOf(seat);for(const x of u)cutSlot(x.sl);lg(`${SP(seat).nm} reveals ${u.length} red wire${u.length>1?'s':''} and is done.`);G.hist.push({seat,kind:'reveal',turn:G.turn});afterCut({seat,v:'R',n:u.length,kind:'reveal',ok:1});endAction()}
// every cut ends here: validation tokens, finished values, unlocks, rule hooks, challenge checks, win
function afterCut(ev){if(ev.kind!=='reveal'&&ev.kind!=='mass')G.hist.push({seat:ev.seat,kind:ev.kind,v:ev.v,ok:ev.ok?1:0,turn:G.turn});
  for(const v of NUMS.concat(['Y']))if(!G.fin[v]&&G.tot[v]&&remaining(v)===0){G.fin[v]=1;if(v!=='Y'){if(!G.validOff&&!G.ms.memory){G.valid.push(v);lg(`All four ${v}s are cut: validation token ${v} goes on the track.`,'good');hook('valid',v)}hook('finish',v)}}
  if(ev.ok)hook('cut',ev);checkUnlocks();if(G.ms.chal)checkChallenges();checkWin()}
function afterMiss(ev){G.hist.push({seat:ev.seat,kind:ev.kind,v:ev.v,ok:0,turn:G.turn});hook('miss',ev);if(G.ms.chal)checkChallenges()}
// ---------- equipment unlock ----------
function checkUnlocks(){for(const e of G.eq){if(e.cover!=null&&cutCount(e.cover)>=2){lg(`Cover card ${e.cover} is cleared from ${EQUIP[e.id].n}.`);e.cover=null}
    if(e.st!=='locked'||e.down)continue;const E=EQUIP[e.id];if(e.cover!=null)continue;if(cutCount(E.v)>=E.need){unlockEq(e)}}}
function unlockEq(e){e.st='ready';e.down=0;const E=EQUIP[e.id];lg(`${E.n} is unlocked.`,'good');if(E.timing==='instant')now('instant',{id:e.id})}
AG.instant=d=>{const e=G.eq.find(x=>x.id===d.id&&x.st==='ready');if(!e)return;e.st='used';G.stats.eqUse++;const k=EQUIP[d.id].kind;
  if(k==='more'){const add=G.eqPool.splice(0,2);lg(`Hidden Compartment: ${add.length} more equipment card${add.length===1?'':'s'} join the job.`,'good');for(const id of add)G.eq.push({id,st:'locked',down:0,cover:null,perm:0});checkUnlocks()}
  else if(k==='refresh'){let n=0;for(const x of G.eq)if(x.st==='used'&&x!==e){x.st='ready';n++}lg(`Supply Drop: ${n} used card${n===1?'':'s'} work again.`,'good')}
  else if(k==='vapor'){vaporise()}};
function vaporise(){const bag=[];for(const k in G.tokSup)if(k!=='Y')for(let i=0;i<G.tokSup[k];i++)bag.push(+k);shuffle(bag);
  let v=null;while(bag.length){const x=bag.shift();if(remaining(x)>0){v=x;break}}
  if(v==null){lg('Vaporiser: no usable token in the supply; nothing happens.');return}
  const hit=allSlots().filter(x=>!x.sl.cut&&cv(x.sl.id)===v);for(const x of hit)cutSlot(x.sl);lg(`Vaporiser draws ${v}: every uncut ${v} on the stands is cut (${hit.length}).`,'good');afterCut({seat:G.actor,v,n:hit.length,kind:'mass',ok:1})}
// ---------- restrictions (constraint cards) ----------
function consOf(seat){const o=[];const p=SP(seat);if(p.con&&!p.conDown&&(!G.ms.mole||(p.role==='weak'&&G.ms.mole.hidden)))o.push(p.con);if(G.ms.gcon)o.push(G.ms.gcon);return o}
function conFlag(seat,f){return consOf(seat).some(c=>CONSTRAINTS[c][f])}
function conVal(seat,v){return consOf(seat).every(c=>!CONSTRAINTS[c].val||CONSTRAINTS[c].val(v))}
function canName(seat,v,ctx){if(!(v==='Y'||NUMS.includes(v)))return 'not a value';if(!G.tot[v]||remaining(v)<=0)return 'no such wire left';
  if(!conVal(seat,v))return 'your restriction forbids that value';return hookAny('name',seat,v,ctx||{})||''}
function edgeUncut(si,side){const w=G.st[si].w;const idx=w.map((x,k)=>k).filter(k=>!w[k].cut);return side==='L'?idx[0]:idx[idx.length-1]}
function canTarget(seat,si,k,ctx){const s=G.st[si];if(!s)return 'no stand';const sl=s.w[k];if(!sl)return 'no slot';if(sl.cut)return 'already cut';if(ownerOf(si)===seat)return 'that is your own stand';
  if(ctx.tool&&(sl.x||sl.flip))return 'equipment cannot touch that wire';
  if(conFlag(seat,'noRight')&&edgeUncut(si,'R')===k)return 'restriction: not the right-most wire';
  if(conFlag(seat,'noLeft')&&edgeUncut(si,'L')===k)return 'restriction: not the left-most wire';
  if(conFlag(seat,'silent')&&sl.tok.length)return 'restriction: not a wire with a token';
  return hookAny('target',seat,si,k,ctx)||''}
// ---------- tools ----------
function itemOf(seat){const c=SP(seat).ch;return c?CHARS[c].item:null}
function itemOK(seat,item){const p=SP(seat);if(itemOf(seat)!==item||p.noItem||p.chDown)return false;if(p.chUsed&&!(item==='dd'&&hasRule(G.mission,'unlimitedDD')))return false;
  if(conFlag(seat,'noTools'))return false;return !hookAny('itemBan',seat,item)}
function eqEntry(id){return G.eq.find(e=>e.id===id&&e.st==='ready'&&!e.down)}
function eqOK(seat,id){const e=eqEntry(id);if(!e)return false;const T=EQUIP[id].timing;if(T==='instant')return false;
  if((T==='turn'||T==='start')&&(seat!==G.actor||G.step!=='act'||G.tfx.acted))return false;if(T==='start'&&G.tfx.damper)return false;
  if(conFlag(seat,'noTools'))return false;if(id==='eq4'&&conFlag(seat,'silent'))return false;return !hookAny('eqBan',seat,id)}
function useEq(id){const e=eqEntry(id);if(!e.perm)e.st='used';G.stats.eqUse++}
function useItem(seat){SP(seat).chUsed=1;G.stats.eqUse++}
const TOOLN={dd:2,eq3:3,pt3:3};
// ---------- dual cut ----------
function targetsOK(seat,si){return G.st[si]&&ownerOf(si)!==seat}
function legalDual(seat,m){if(G.step!=='act'||seat!==G.actor||G.tfx.acted)return 'not your action now';
  if(!targetsOK(seat,m.st))return 'pick a crewmate stand';if(!Array.isArray(m.ks)||!m.ks.length||new Set(m.ks).size!==m.ks.length)return 'pick wires';
  const tool=m.tool||null,two=m.two||null;
  if(tool&&!['dd','eq3','pt3','eq5'].includes(tool))return 'unknown probe';if(two&&!['eq10','pt10'].includes(two))return 'unknown probe';
  if(tool==='dd'&&!itemOK(seat,'dd'))return 'Twin Probe not available';if(tool==='pt3'&&!itemOK(seat,'pt3'))return 'probe not available';
  if((tool==='eq3'||tool==='eq5')&&!eqOK(seat,tool))return 'card not available';
  if(two==='eq10'&&!eqOK(seat,'eq10'))return 'card not available';if(two==='pt10'&&!itemOK(seat,'pt10'))return 'probe not available';
  const ctx={tool:tool||two,kind:'dual',m};
  if(tool==='eq5'){const want=G.st[m.st].w.map((x,k)=>k).filter(k=>!G.st[m.st].w[k].cut&&!G.st[m.st].w[k].x&&!G.st[m.st].w[k].flip);if(want.join()!==m.ks.slice().sort((a,b)=>a-b).join())return 'the full scan points at every eligible wire of the stand'}
  else if((TOOLN[tool]||1)!==m.ks.length)return 'wrong number of wires';
  for(const k of m.ks){const r=canTarget(seat,m.st,k,ctx);if(r)return r}
  const vals=[m.v].concat(two?[m.v2]:[]);if(two&&(m.v2==null||m.v2===m.v))return 'name two different values';
  for(const v of vals){if(tool&&v==='Y')return 'a probe cannot name yellow';const r=canName(seat,v,ctx);if(r)return r}
  if(m.own==='flip'){if(tool||two)return 'no equipment on your flipped wire';if(!ownFlipSlot(seat,m.fu))return 'name one of your uncut flipped wires (fu)';if(!hasRule(G.mission,'flip'))return 'no flipped wires here'}
  else{const h=heldVals(seat);for(const v of vals)if(!h[v])return 'you must hold the value you name';}
  return hookAny('legalCut',seat,m,vals)||''}
function ownFlipSlot(seat,u){const f=u!=null&&findU(u);return f&&ownerOf(f.s)===seat&&f.sl.flip&&!f.sl.cut?f:null}
function doDual(seat,m){const tool=m.tool||null,two=m.two||null;const vals=[m.v].concat(two?[m.v2]:[]);
  hook('pay',seat,m.v,m);
  if(tool==='dd'||tool==='pt3')useItem(seat);if(two==='pt10')useItem(seat);if(tool==='eq3'||tool==='eq5')useEq(tool);if(two==='eq10')useEq('eq10');
  G.stats.dual++;const T=m.ks.map(k=>G.st[m.st].w[k]);const owner=ownerOf(m.st);
  const tn=tool==='dd'?'Twin Probe':tool==='eq3'||tool==='pt3'?'Triple Probe':tool==='eq5'?'Full Scan':'';
  lg(`${SP(seat).nm} points at ${T.length>1?T.length+' wires':'a wire'} of ${SP(owner).nm} and says "${vals.map(VN).join(' or ')}"${tn?' ('+tn+(two?' + Two-Value':'')+')':two?' (Two-Value Probe)':''}.`);
  if((tool||two)&&hasRule(G.mission,'redTriple')&&T.some(sl=>isRed(sl.id))){explode(`${SP(seat).nm}'s probe pointed at a red wire (equipment cannot choose reds)`);return}
  const match=T.filter(sl=>vals.includes(cv(sl.id)));
  const ctx={seat,st:m.st,us:T.map(x=>x.u),vals,v:m.v,tool,two,own:m.own,ownFlip:m.own==='flip',fu:m.fu};
  if(match.length){if(match.length>1){ask(owner,'pickMatch',`${SP(seat).nm} hit: choose which matching wire to cut`,match.map(sl=>({l:`Cut slot ${G.st[m.st].w.indexOf(sl)+1}`,h:'dualHit',d:Object.assign({u:sl.u},ctx)})));return}
    QH.dualHit(Object.assign({u:match[0].u},ctx));return}
  dualMiss(ctx)}
QH.dualHit=d=>{const f=findU(d.u);const v=cv(f.sl.id);const seat=d.seat;
  if(d.ownFlip){const fl=findU(d.fu);if(cv(fl.sl.id)!==v){cutSlot(f.sl);explode(`${SP(seat).nm} cut their own flipped wire and it was not ${VN(v)}`);return}cutSlot(f.sl);cutSlot(fl.sl);}
  else{let own=null;if(d.own!=null){const o=findU(d.own);if(o&&ownerOf(o.s)===seat&&!o.sl.cut&&!o.sl.flip&&cv(o.sl.id)===v)own=o}
    if(!own)own=uncutOf(seat).find(x=>!x.sl.flip&&cv(x.sl.id)===v&&!(x.sl.x&&xLocked()));cutSlot(f.sl);cutSlot(own.sl)}
  G.stats.dualOk++;lg(`Hit! ${SP(ownerOf(f.s)).nm}'s wire is ${VN(v)}; ${SP(seat).nm} cuts a matching ${VN(v)} too.`,'good');
  if(d.two){const other=d.vals.find(x=>x!==v);G.ann.push({k:'holds',seat,v:other,yes:1,turn:G.turn});}
  const ev={seat,v,n:2,kind:'dual',ok:1,st:f.s,u:f.sl.u,tool:d.tool||d.two};afterCut(ev);if(G.over)return;hook('afterDual',ev);if(!G.q&&!G.over)endAction();else if(!G.over)G.tfx.endAfterQ=1};
function dualMiss(d){const seat=d.seat;const T=d.us.map(u=>findU(u));const owner=ownerOf(d.st);
  const damper=!!G.tfx.damper;
  if(d.ownFlip){explode(`${SP(seat).nm} missed while cutting their own flipped wire`);return}
  if(T.every(x=>isRed(x.sl.id))){if(damper){lg(`The Damper smothers it: that was red! Nothing happens.`,'good');G.stats.miss++;afterMiss({seat,v:d.v,kind:'dual'});endAction();return}
    explode(`${SP(seat).nm} pointed at ${T.length>1?'only red wires':'a red wire'}`);return}
  G.stats.miss++;for(const x of T){for(const v of d.vals)if(!x.sl.not.includes(v))x.sl.not.push(v)}
  const boom=hookAny('missExplode',{seat,owner,d});if(boom&&!damper){explode(boom);return}
  let steps=conFlag(seat,'double')?2:1;steps+=hookAny('missExtra',{seat,owner,d})||0;
  lg(`Miss: none of those is ${d.vals.map(VN).join(' or ')}.`,'bad');
  const silent=conFlag(seat,'silent')||conFlag(owner,'silent');
  const nonRed=T.filter(x=>!isRed(x.sl.id));
  const fin=()=>{if(damper)lg('The Damper holds the fuse still.','good');else advance(steps,'missed cut',{miss:1});if(G.over)return;afterMiss({seat,v:d.v,kind:'dual'});if(!G.q&&!G.over)endAction();else if(!G.over)G.tfx.endAfterQ=1};
  if(silent||G.tokFam==='none'){fin();return}
  if(nonRed.length>1){ask(owner,'tagPick','Choose which pointed wire gets the info token',nonRed.map(x=>({l:`Tag slot ${x.k+1}`,h:'tagMiss',d:{u:x.sl.u,called:d.v,seat,steps,damper:damper?1:0}})));G.tfx.missFin={steps,damper:damper?1:0,v:d.v};return}
  const x=nonRed[0];putTok(x.s,x.sl,trueTok(x.s,x.sl,d.v));fin()}
QH.tagMiss=d=>{const f=findU(d.u);putTok(f.s,f.sl,trueTok(f.s,f.sl,d.called));if(d.damper)lg('The Damper holds the fuse still.','good');else advance(d.steps,'missed cut',{miss:1});if(G.over)return;afterMiss({seat:d.seat,v:d.called,kind:'dual'});endAction()};
// ---------- solo cut ----------
function legalSolo(seat,m){if(G.step!=='act'||seat!==G.actor||G.tfx.acted)return 'not your action now';if(conFlag(seat,'noSolo'))return 'restriction: no solo cut';
  const r=canName(seat,m.v,{kind:'solo',m});if(r)return r;const h=heldVals(seat)[m.v]||0;const R=remaining(m.v);
  if(m.ep){if(!eqOK(seat,'eq99'))return 'Express Pass not available';if(h<2)return 'you need two of that value';return hookAny('legalCut',seat,m,[m.v])||''}
  if(m.flip){if(!ownFlipSlot(seat,m.fu))return 'name one of your uncut flipped wires (fu)';if(h+1!==R||(R!==2&&R!==4))return 'the rest of that value is not all yours'}
  else if(h!==R||(R!==2&&R!==4))return 'all remaining wires of that value must be in your hand (all 4, or the last 2)';
  return hookAny('legalCut',seat,m,[m.v])||''}
function doSolo(seat,m){hook('pay',seat,m.v,m);let own=uncutOf(seat).filter(x=>!x.sl.flip&&cv(x.sl.id)===m.v&&!(x.sl.x&&xLocked()));
  if(m.ep){useEq('eq99');own=own.slice(0,2)}
  if(m.flip){const fl=findU(m.fu);if(cv(fl.sl.id)!==m.v){explode(`${SP(seat).nm} solo-cut their flipped wire and it was not ${VN(m.v)}`);return}own.push(fl)}
  for(const x of own)cutSlot(x.sl);G.stats.solo++;lg(`${SP(seat).nm} solo-cuts ${own.length} × ${VN(m.v)}${m.ep?' (Express Pass)':''}.`,'good');
  const ev={seat,v:m.v,n:own.length,kind:'solo',ok:1};afterCut(ev);if(G.over)return;hook('afterSolo',ev);if(!G.q&&!G.over)endAction();else if(!G.over)G.tfx.endAfterQ=1}
// ---------- move lists ----------
function teamStands(seat){return G.st.filter(s=>ownerOf(s.i)!==seat).map(s=>s.i)}
function targetable(seat,si,ctx){return G.st[si].w.map((x,k)=>k).filter(k=>!canTarget(seat,si,k,ctx))}
function nameable(seat,ctx){const h=heldVals(seat);return Object.keys(h).map(v=>v==='Y'?'Y':+v).filter(v=>v!=='R'&&!canName(seat,v,ctx))}
// all main actions for the actor; any=true returns as soon as one non-pass action is found (stall detection)
function mainMoves(seat,any,plainOnly){const o=[];const push=m=>{const extra=hookAny('dualParams',seat,m);if(extra===false)return false;if(extra)Object.assign(m,extra);if(any&&legalAny(m,seat))return false;o.push(m);return any&&!m.pass};
  if(G.step!=='act'&&!any)return o;
  const tools=[];if(itemOK(seat,'dd'))tools.push('dd');if(eqEntry('eq3')&&eqOK(seat,'eq3'))tools.push('eq3');if(itemOK(seat,'pt3'))tools.push('pt3');if(eqEntry('eq5')&&eqOK(seat,'eq5'))tools.push('eq5');
  const twos=[];if(eqEntry('eq10')&&eqOK(seat,'eq10'))twos.push('eq10');if(itemOK(seat,'pt10'))twos.push('pt10');
  const vs=nameable(seat,{kind:'dual'});const full=(G.opts.full||!any)&&!plainOnly;
  for(const si of teamStands(seat)){const tg=targetable(seat,si,{});
    for(const v of vs)for(const k of tg){if(push({a:'dual',st:si,ks:[k],v}))return o}
    if(!full)continue;
    const tgT=targetable(seat,si,{tool:'x'});const nv=vs.filter(v=>v!=='Y');
    for(const t of tools){if(t==='dd')for(let a=0;a<tgT.length;a++)for(let b=a+1;b<tgT.length;b++)for(const v of nv)push({a:'dual',st:si,ks:[tgT[a],tgT[b]],v,tool:'dd'});
      if(t==='eq3'||t==='pt3')for(let a=0;a+2<tgT.length;a++)for(const v of nv)push({a:'dual',st:si,ks:[tgT[a],tgT[a+1],tgT[a+2]],v,tool:t});
      if(t==='eq5'){const all=G.st[si].w.map((x,k)=>k).filter(k=>!G.st[si].w[k].cut&&!G.st[si].w[k].x&&!G.st[si].w[k].flip);if(all.length&&all.every(k=>tgT.includes(k)))for(const v of nv)push({a:'dual',st:si,ks:all,v,tool:'eq5'})}}
    for(const t of twos)for(let a=0;a<vs.length;a++)for(let b=a+1;b<vs.length;b++)for(const k of tgT)push({a:'dual',st:si,ks:[k],v:vs[a],v2:vs[b],two:t})}
  const myFlips=hasRule(G.mission,'flip')?slotsOf(seat).filter(x=>x.sl.flip&&!x.sl.cut):[];
  for(const f of myFlips)for(const si of teamStands(seat))for(const k of targetable(seat,si,{}))for(const v of NUMS.concat(['Y'])){if(canName(seat,v,{kind:'dual'}))continue;if(push({a:'dual',st:si,ks:[k],v,own:'flip',fu:f.sl.u}))return o}
  for(const v of Object.keys(heldVals(seat)).map(v=>v==='Y'?'Y':+v)){if(v==='R')continue;if(push({a:'solo',v}))return o;if(push({a:'solo',v,ep:1}))return o}
  for(const f of myFlips)for(const v of NUMS)if(push({a:'solo',v,flip:1,fu:f.sl.u}))return o;
  const u=uncutOf(seat);if(u.length&&u.every(x=>!x.sl.flip&&isRed(x.sl.id))&&!hookAny('noReveal',seat))if(push({a:'reveal'}))return o;
  for(const r of rules())if(RH[r.k].moves)for(const m of RH[r.k].moves(r,seat))if(push(m))return o;
  if(eqEntry('eq11')&&eqOK(seat,'eq11'))for(const q of G.seats)if(q.i!==seat&&hasWires(q.i))if(push({a:'eq',id:'eq11',next:q.i}))return o;
  return any?o.filter(m=>!m.pass):o.filter(m=>!legal(m,seat))}
function legalAny(m,seat){return legal(m,seat)}
// equipment moves for any seat (any-time cards), plus start/turn cards for the actor
function eqMoves(seat){const o=[];if(G.phase!=='turn'||G.q||G.over)return o;
  const mine=slotsOf(seat);
  for(const e of G.eq){if(e.st!=='ready'||e.down)continue;const id=e.id;if(!eqOK(seat,id))continue;
    switch(id){
    case 'eq1':case 'eq12':for(const si of standsOf(seat)){const w=G.st[si].w;for(let k=0;k+1<w.length;k++)o.push({a:'eq',id,s:si,k})}break;
    case 'eq2':for(const x of mine)if(!x.sl.cut)for(const q of G.seats)if(q.i!==seat&&hasWires(q.i))o.push({a:'eq',id,s:x.s,k:x.k,to:q.i});break;
    case 'eq4':for(const x of ownBlue(seat,G.tokFam==='cnt'))o.push(G.tokFam==='false'?{a:'eq',id,s:x.s,k:x.k,fv:cv(x.sl.id)%12+1}:{a:'eq',id,s:x.s,k:x.k});break;
    case 'eq6':if(G.dial!=null&&G.dial<DIAL_MAX)o.push({a:'eq',id});break;
    case 'eq7':{const used=G.seats.filter(q=>q.chUsed&&q.ch).map(q=>q.i);for(const a of used)o.push({a:'eq',id,who:[a]});for(let a=0;a<used.length;a++)for(let b=a+1;b<used.length;b++)o.push({a:'eq',id,who:[used[a],used[b]]});break}
    case 'eq8':for(const v of NUMS)o.push({a:'eq',id,v});break;
    case 'eq9':o.push({a:'eq',id});break;
    case 'eq22':for(const x of ownBlue(seat,true))o.push({a:'eq',id,s:x.s,k:x.k});break;
    case 'eq1111':for(const si of teamStands(seat))for(const k of targetable(seat,si,{tool:'x'}))for(const d of standsOf(seat))o.push({a:'eq',id,ts:si,tk:k,s:d});break}}
  if(itemOK(seat,'sweep'))for(const v of NUMS)o.push({a:'item',k:'sweep',v});
  if(itemOK(seat,'handsets'))for(const x of mine)if(!x.sl.cut)for(const q of G.seats)if(q.i!==seat&&hasWires(q.i))o.push({a:'item',k:'handsets',s:x.s,k2:x.k,to:q.i});
  return o.filter(m=>!legal(m,seat))}
// ---------- the public API ----------
function sideToAct(){if(!G||G.over)return -1;if(G.q)return G.q.who;if(G.phase!=='turn')return -1;const h=hookAny('sideToAct');if(h!=null)return h;return G.step==='act'?G.actor:-1}
function validMoves(seat){if(!G||G.over)return [];if(seat==null)seat=sideToAct();if(seat<0)return [];
  if(G.q)return seat===G.q.who?G.q.opts.map((o,i)=>({a:'q',i})):[];
  const o=[];if(G.phase!=='turn')return o;
  if(seat===G.actor&&G.step==='act')o.push(...mainMoves(seat,false));
  if(G.step==='act'||G.step==='claim'||G.step==='snip')o.push(...eqMoves(seat));
  for(const r of rules())if(RH[r.k].offMoves)o.push(...RH[r.k].offMoves(r,seat));
  return o}
function legal(m,seat){if(!G||G.over)return 'the job is over';if(!m||typeof m!=='object')return 'no move';
  if(m.a==='q'){if(!G.q||G.q.who!==seat)return 'no question for you';return Number.isInteger(m.i)&&m.i>=0&&m.i<G.q.opts.length?'':'bad option'}
  if(G.q)return 'answer the question first';if(G.phase!=='turn')return 'not in play';
  switch(m.a){case 'dual':return legalDual(seat,m);case 'solo':return legalSolo(seat,m);
    case 'reveal':{if(G.step!=='act'||seat!==G.actor||G.tfx.acted)return 'not now';const u=uncutOf(seat);return u.length&&u.every(x=>isRed(x.sl.id)&&!x.sl.flip)&&!hookAny('noReveal',seat)?'':'only when every wire you hold is red'}
    case 'eq':return legalEq(seat,m);case 'item':return legalItem(seat,m)}
  for(const r of rules()){const H=RH[r.k];if(H.acts&&H.acts.includes(m.a))return H.legalX(r,m,seat)||''}
  return 'unknown move'}
function performMove(m,seat){if(seat==null)seat=sideToAct();const err=legal(m,seat);if(err)return {success:false,error:err};
  if(m.a==='q'){const q=G.q;G.q=null;const o=q.opts[m.i];QH[o.h](o.d||{},q);if(!G.q&&!G.over&&G.tfx.endAfterQ){G.tfx.endAfterQ=0;if(!G.tfx.acted)endAction()}}
  else{
    switch(m.a){case 'dual':doDual(seat,m);break;case 'solo':doSolo(seat,m);break;case 'reveal':revealReds(seat);break;case 'eq':doEq(seat,m);break;case 'item':doItem(seat,m);break;
      default:for(const r of rules()){const H=RH[r.k];if(H.acts&&H.acts.includes(m.a)){H.doX(r,m,seat);break}}}}
  flow();
  // an off-turn card (a trade, a hook) can leave the active player with nothing legal: apply the same rule as at the start of a turn
  if(G&&!G.over&&!G.q&&G.phase==='turn'&&G.step==='act'&&!G.tfx.acted&&!G.ag.length){checkStuck();flow()}
  if(typeof refresh==='function'&&!UI.sim)refresh();return {success:true}}
// ---------- equipment and personal tools ----------
function ownSlot(seat,s,k){if(!G.st[s]||ownerOf(s)!==seat)return null;return G.st[s].w[k]||null}
function sameVal(a,b){return cv(a)===cv(b)}
function legalEq(seat,m){if(!EQUIP[m.id])return 'unknown card';if(!eqOK(seat,m.id))return 'that card is not usable by you now';
  switch(m.id){
  case 'eq1':case 'eq12':{const a=ownSlot(seat,m.s,m.k),b=ownSlot(seat,m.s,m.k+1);if(!a||!b)return 'pick two neighbouring wires of your own';if(a.cut&&b.cut)return 'at most one may be cut';
    if(a.flip||b.flip||a.x||b.x)return 'equipment cannot touch that wire';if(G.marks.some(x=>x.t===(m.id==='eq1'?'neq':'eq')))return 'the tag is already placed';
    const eq=sameVal(a.id,b.id);if(m.id==='eq1'&&eq)return 'those two are equal';if(m.id==='eq12'&&!eq)return 'those two are not equal';return ''}
  case 'eq2':return legalSwap(seat,m.s,m.k,m.to);
  case 'eq4':{const a=ownSlot(seat,m.s,m.k);if(!a)return 'pick one of your own wires';if(a.flip||a.x)return 'equipment cannot touch that wire';if(WIRES[a.id].c!=='b'||isRed(a.id))return 'only a blue wire';if(a.cut&&G.tokFam!=='cnt')return 'only an uncut wire';
    if(G.tokFam==='false'&&(!NUMS.includes(m.fv)||m.fv===cv(a.id)))return 'name a value the wire is NOT';return ''}
  case 'eq6':return G.dial!=null&&G.dial<DIAL_MAX?'':'the fuse cannot turn back further';
  case 'eq7':{if(!Array.isArray(m.who)||!m.who.length||m.who.length>2||new Set(m.who).size!==m.who.length)return 'pick one or two crew';return m.who.every(i=>SP(i)&&SP(i).chUsed&&SP(i).ch)?'':'pick crew whose tool is spent'}
  case 'eq8':return NUMS.includes(m.v)?'':'name a number';
  case 'eq9':return '';
  case 'eq11':{if(!SP(m.next)||m.next===seat||!hasWires(m.next))return 'pick a crewmate with wires';return ''}
  case 'eq22':{const a=ownSlot(seat,m.s,m.k);if(!a||a.flip||a.x||WIRES[a.id].c!=='b'||isRed(a.id))return 'pick one of your blue wires';return countOnStand(m.s,cv(a.id))===1?'':'that value is on the stand more than once'}
  case 'eq1111':{if(!G.st[m.ts]||ownerOf(m.ts)===seat)return 'pick a crewmate wire';const t=G.st[m.ts].w[m.tk];if(!t||t.cut||t.x||t.flip)return 'pick an uncut crewmate wire';
    if(!standsOf(seat).includes(m.s))return 'pick one of your stands';return hookAny('target',seat,m.ts,m.tk,{tool:'eq1111'})||''}
  }return 'that card is used by itself'}
function legalSwap(seat,s,k,to){const a=ownSlot(seat,s,k);if(!a||a.cut)return 'pick one of your uncut wires';if(a.x||a.flip)return 'equipment cannot touch that wire';
  if(!SP(to)||to===seat||!hasWires(to))return 'pick a crewmate with wires';if(!uncutOf(to).some(x=>!x.sl.x&&!x.sl.flip))return 'they have no wire to trade';return ''}
function legalItem(seat,m){if(m.k==='sweep'){if(!itemOK(seat,'sweep'))return 'not available';return NUMS.includes(m.v)?'':'name a number'}
  if(m.k==='handsets'){if(!itemOK(seat,'handsets'))return 'not available';return legalSwap(seat,m.s,m.k2,m.to)}return 'unknown tool'}
function doEq(seat,m){const E=EQUIP[m.id];useEq(m.id);lg(`${SP(seat).nm} uses ${E.n}.`,'eq');
  switch(m.id){
  case 'eq1':case 'eq12':{const w=G.st[m.s].w;G.marks.push({t:m.id==='eq1'?'neq':'eq',a:w[m.k].u,b:w[m.k+1].u});break}
  case 'eq2':startSwap(seat,m.s,m.k,m.to);break;
  case 'eq4':{const a=G.st[m.s].w[m.k];const tok=G.tokFam==='false'?mkTok('f',m.fv):trueTok(m.s,a);putTok(m.s,a,tok);break}
  case 'eq6':rewind(1,'Rewind');break;
  case 'eq7':for(const i of m.who)SP(i).chUsed=0;lg(`${m.who.map(i=>SP(i).nm).join(' and ')} can use their tool again.`);break;
  case 'eq8':sweep(m.v,seat);break;
  case 'eq9':G.tfx.damper=1;lg('The Damper is armed for this turn\'s dual cut.');break;
  case 'eq11':G.tfx.coffee=m.next;lg(`${SP(seat).nm} takes a coffee break; ${SP(m.next).nm} goes next.`);G.hist.push({seat,kind:'coffee',turn:G.turn});hook('coffee',seat);if(!G.over)endAction();break;
  case 'eq22':{G.st[m.s].w[m.k].tok.push({t:'c',v:1});break}
  case 'eq1111':{const t=G.st[m.ts].w.splice(m.tk,1)[0];const from=ownerOf(m.ts);const k=insertSlot(m.s,t);lg(`${SP(seat).nm} hooks a wire from ${SP(from).nm} into stand ${m.s+1}, slot ${k+1}.`);dropStaleAnn(m.ts);dropStaleAnn(m.s);break}}}
function doItem(seat,m){useItem(seat);lg(`${SP(seat).nm} uses ${ITEMS[m.k].n}.`,'eq');if(m.k==='sweep')sweep(m.v,seat);else startSwap(seat,m.s,m.k2,m.to)}
// a Sweep: every stand answers yes/no for uncut blue wires of v (X wires ignored)
function sweep(v,by){const res=G.st.map(s=>({st:s.i,yes:s.w.some(x=>!x.cut&&!x.x&&!x.flip&&WIRES[x.id].c==='b'&&cv(x.id)===v)?1:0,us:s.w.filter(x=>!x.cut&&!x.x&&!x.flip).map(x=>x.u)}));
  G.ann.push({k:'sweep',by,v,res,turn:G.turn});lg(`Sweep for ${v}: ${res.map(r=>`${SP(ownerOf(r.st)).nm}${standsOf(ownerOf(r.st)).length>1?' (stand '+(r.st+1)+')':''} ${r.yes?'yes':'no'}`).join(', ')}.`)}
function dropStaleAnn(si){for(const a of G.ann)if(a.k==='side'&&a.st===si)a.stale=1}
// sorted insert: before the first sorted wire with a higher sort value (X / flipped wires stay at the ends)
function insertSlot(si,sl){const w=G.st[si].w;let lo=0,hi=w.length;while(lo<hi&&w[lo].flip)lo++;while(hi>lo&&(w[hi-1].x||w[hi-1].flip))hi--;
  let k=lo;while(k<hi&&sv(w[k].id)<=sv(sl.id))k++;w.splice(k,0,sl);return k}
function startSwap(seat,s,k,to){const give=G.st[s].w[k];const opts=uncutOf(to).filter(x=>!x.sl.x&&!x.sl.flip).map(x=>({l:`Give stand ${x.s+1} slot ${x.k+1}`,h:'swapBack',d:{seat,to,gu:give.u,ru:x.sl.u}}));
  ask(to,'swapPick',`${SP(seat).nm} offers a wire trade: pick one of yours to hand over`,opts)}
QH.swapBack=d=>{const g=findU(d.gu),r=findU(d.ru);const gs=g.s,rs=r.s;G.st[gs].w.splice(g.k,1);const r2=findU(d.ru);G.st[r2.s].w.splice(r2.k,1);
  if(G.tokFam==='cnt'){g.sl.tok=[];r.sl.tok=[]}
  const k1=insertSlot(rs,g.sl),k2=insertSlot(gs,r.sl);G.marks=G.marks.filter(x=>![g.sl.u,r.sl.u].includes(x.a)&&![g.sl.u,r.sl.u].includes(x.b));
  dropStaleAnn(gs);dropStaleAnn(rs);lg(`${SP(d.seat).nm} and ${SP(d.to).nm} trade wires: in at stand ${rs+1} slot ${k1+1} and stand ${gs+1} slot ${k2+1}.`)};
// ===================== mission rule handlers =====================
// hooks: setup pre post begin start forcedStart noReveal noForced stuck name target legalCut canPay pay dualParams moves offMoves
//        acts/legalX/doX cut miss valid finish afterDual afterSolo post end round tick nextTurn sideToAct dialAdv winBlock eqBan itemBan
//        missExplode missExtra coffee pub
const RH={};
function prompt(say){G.prompt={say,t:G.clock};lg('Narrator: '+say,'prompt')}
function drawNum(st){if(st.deck.concat(st.disc).every(v=>G.fin[v]))return null;while(true){if(!st.deck.length){st.deck=shuffle(st.disc);st.disc=[]}const v=st.deck.shift();if(G.fin[v]){st.disc.push(v);continue}return v}}
function busy(){return G.tfx.acted||G.tfx.skip}
// a crew member told to cut a value they lack: they tag one of their own wires, the fuse burns a step, the turn ends
function lacks(seat,v){G.ann.push({k:'holds',seat,v,yes:0,turn:G.turn});lg(`${SP(seat).nm} holds no ${VN(v)}.`,'bad');
  const opts=ownBlue(seat,false).filter(x=>!x.sl.tok.length).map(x=>({l:`Tag your ${cv(x.sl.id)} at stand ${x.s+1} slot ${x.k+1}`,h:'lackTag',d:{u:x.sl.u}}));
  G.tfx.acted=1;G.tfx.skipped=1;G.hist.push({seat,kind:'skip',turn:G.turn});
  if(!ask(seat,'lackTag','You lack that value: place an info token of your choice on your own wire',opts)){advance(1,'nobody could cut it');finishSkip()}}
QH.lackTag=d=>{const f=findU(d.u);putTok(f.s,f.sl,trueTok(f.s,f.sl));advance(1,'nobody could cut it');finishSkip()};
function finishSkip(){if(G.over)return;if(G.step==='act'){G.step='end';schedEnd()}}
function schedEnd(){for(const r of rules())if(RH[r.k].postAct)later('rulePost',{k:r.k});later('endTurn')}
AG.rulePost=d=>{if(G.over)return;const r=rules().find(x=>x.k===d.k);RH[d.k].postAct(r,G.cur)};
// designate who must cut value v this turn
function designate(by,v,tag){const opts=G.seats.filter(q=>hasWires(q.i)).map(q=>({l:`${q.nm}${q.i===by?' (yourself)':''} must cut ${VN(v)}`,h:'designated',d:{seat:q.i,v,tag}}));ask(by,'designate',`Card ${v}: who must cut it?`,opts)}
QH.designated=d=>{G.ms[d.tag].v=d.v;G.ms[d.tag].who=d.seat;lg(`${SP(d.seat).nm} must cut ${VN(d.v)}.`);if(!heldVals(d.seat)[d.v]){lacks(d.seat,d.v);return}G.actor=d.seat};
// special multi-wire actions: point at n uncut wires anywhere (own wires allowed) and claim them all at once
function exampleMulti(seat,kind,n,own){const all=allSlots().filter(x=>!x.sl.cut&&(own||ownerOf(x.s)!==seat));if(all.length<n)return [];return [{a:'multi',kind,tg:all.slice(0,n).map(x=>({s:x.s,k:x.k})),example:1}]}
function legalMulti(seat,m,n,own){if(G.step!=='act'||seat!==G.actor||G.tfx.acted)return 'not your action now';if(!Array.isArray(m.tg)||m.tg.length!==n)return `point at exactly ${n} wires`;
  const seen=new Set();for(const t of m.tg){const s=G.st[t.s];const sl=s&&s.w[t.k];if(!sl||sl.cut)return 'point at uncut wires';if(!own&&ownerOf(t.s)===seat)return 'point at crewmate wires';const key=t.s+':'+t.k;if(seen.has(key))return 'distinct wires';seen.add(key)}return ''}
function multiSlots(m){return m.tg.map(t=>G.st[t.s].w[t.k])}
function doMulti(seat,m,want,label,onFail){const S=multiSlots(m);lg(`${SP(seat).nm} points at ${S.length} wires and calls them all ${label}.`);
  if(S.every(sl=>cv(sl.id)===want)){for(const sl of S)cutSlot(sl);lg(`All ${S.length} are ${label}!`,'good');afterCut({seat,v:want,n:S.length,kind:'special',ok:1});if(!G.over&&!G.q)endAction();else if(!G.over)G.tfx.endAfterQ=1;return true}
  if(onFail==='explode'||S.some(sl=>isRed(sl.id))&&want!=='R'){explode(`${SP(seat).nm}'s ${label} call was wrong`);return false}
  for(const t of m.tg){const sl=G.st[t.s].w[t.k];if(cv(sl.id)!==want&&!sl.not.includes(want))sl.not.push(want);if(!sl.cut&&!isRed(sl.id)&&!sl.tok.length)putTok(t.s,sl,trueTok(t.s,sl,want))}
  advance(1,`wrong ${label} call`,{miss:1});if(G.over)return false;afterMiss({seat,v:want,kind:'special'});endAction();return false}
// ---------- 9, 16: the cut order ----------
RH.gate={setup(r){G.ms.gate={vals:shuffle(NUMS.slice()).slice(0,r.cards),at:0,req:r.req};lg(`Cut order: ${G.ms.gate.vals.join(', ')} (${r.req} of each before the next).`)},
  name(r,seat,v){const g=G.ms.gate;const i=g.vals.indexOf(v);return i>g.at?`the cut order wants ${g.vals[g.at]} first`:''},
  cut(r){const g=G.ms.gate;while(g.at<g.vals.length&&cutCount(g.vals[g.at])>=g.req){lg(`Order card ${g.vals[g.at]} is cleared.`);g.at++}},pub(){return G.ms.gate}};
// ---------- 10: free turn order (and timer) ----------
function claimOK(seat){const f=G.ms.free;if(!hasWires(seat))return false;const others=G.seats.filter(q=>q.i!==seat&&hasWires(q.i)).length;return seat!==f.last||G.np===2||others===0}
RH.freeTurns={begin(){G.ms.free={last:null}},nextTurn(r,s){G.ms.free.last=s;G.step='claim';return 'wait'},
  offMoves(r,seat){return G.step==='claim'&&!G.q&&claimOK(seat)?[{a:'claim'}]:[]},acts:['claim'],
  legalX(r,m,seat){return G.step==='claim'&&claimOK(seat)?'':'you cannot claim this turn'},
  doX(r,m,seat){G.step='start';lg(`${SP(seat).nm} calls "Snip!" and takes the turn.`);later('startTurn',{seat})},
  sideToAct(){if(G.step!=='claim')return null;const l=G.ms.free.last;for(let k=1;k<=G.np;k++){const q=seatAt((G.pos[l]+k)%G.np);if(claimOK(q))return q}return null},pub(){return G.ms.free}};
RH.timer={setup(r){const M=MISSIONS[G.mission];const lim=r.script==='m19'?SCRIPTS.m19.limit:(G.np===2&&M.timer.s2?M.timer.s2:M.timer.s);G.ms.timer={limit:lim,script:r.script,pi:0}},
  tick(r){const t=G.ms.timer;const S=SCRIPTS[t.script];while(S.prompts&&t.pi<S.prompts.length&&S.prompts[t.pi].t<=G.clock){prompt(S.prompts[t.pi].say);t.pi++}if(G.clock>=t.limit)explode('the clock ran out')},
  pub(){const t=G.ms.timer;let show=t.limit-G.clock;if(t.script==='m19'){const f=SCRIPTS.m19.fake;show=G.clock<f.jump?f.before-G.clock:f.after-G.clock}return {limit:t.limit,left:Math.max(0,t.limit-G.clock),show:Math.max(0,show)}}};
// ---------- 11: a blue value that behaves as red ----------
RH.fakeRed={setup(){lg(`Number card ${G.ms.fakeRed}: every blue ${G.ms.fakeRed} counts as red.`)},pub(){return {v:G.ms.fakeRed}}};
// ---------- 12: covering number cards ----------
RH.eqCover={setup(){const d=shuffle(NUMS.slice());G.eq.forEach((e,i)=>e.cover=d[i])},pub(){return {covers:G.eq.map(e=>e.cover)}}};
// ---------- 13: the three reds go together ----------
function holdsColour(seat,v){return uncutOf(seat).some(x=>!x.sl.flip&&cv(x.sl.id)===v)}
RH.redTriple={noReveal(){return true},forcedStart(r,seat){const u=uncutOf(seat);if(u.length&&u.every(x=>isRed(x.sl.id)))G.tfx.force='red3'},
  legalCut(r,seat,m){return G.tfx.force==='red3'?'you hold only reds: you must try the triple red cut':''},
  moves(r,seat){return remaining('R')||G.st.some(s=>s.w.some(x=>!x.cut&&isRed(x.id)))?((G.np>=4||holdsColour(seat,'R'))?exampleMulti(seat,'red3',3,true):[]):[]},acts:['multi'],
  legalX(r,m,seat){if(m.kind!=='red3')return 'not this job';if(!(G.np>=4||holdsColour(seat,'R')))return 'you need a red in hand to try this';return legalMulti(seat,m,3,true)},
  doX(r,m,seat){doMulti(seat,m,'R','red','explode')},pub(){return {dealt:G.ms.dealt}}};
// ---------- 14, 17, 28: roles ----------
RH.rookie={missExplode(r,c){return SP(c.seat).role==='rookie'?`the rookie (${SP(c.seat).nm}) missed a dual cut`:null},eqBan(r,seat,id){return SP(seat).role==='rookie'&&id==='eq9'?'the rookie may not use the Damper':null},pub(){return {rookie:G.seats.findIndex(s=>s.role==='rookie')}}};
RH.liar={eqBan(r,seat){return SP(seat).role==='liar'?'the fibber may not use equipment':null},pub(){return {liar:G.seats.findIndex(s=>s.role==='liar')}}};
RH.butterfingers={missExplode(r,c){return c.seat===G.captain?'the foreman fumbled a dual cut':null},eqBan(r,seat){return seat===G.captain?'the foreman may not use equipment':null}};
// ---------- 15: equipment revealed by a number deck ----------
function m15next(){const s=G.ms.nd;s.face=null;while(s.deck.length){const v=s.deck.shift();if(G.fin[v]){s.disc.push(v);continue}s.face=v;lg(`Number card ${v} is up: finish all four ${v}s to reveal equipment.`);return}}
RH.eqDeckReveal={setup(){G.ms.nd={deck:shuffle(NUMS.slice()),disc:[],face:null};m15next()},
  finish(r,v){const s=G.ms.nd;if(v!==s.face)return;s.disc.push(v);const e=G.eq.find(x=>x.down);if(e){e.down=0;e.st='ready';lg(`${EQUIP[e.id].n} turns face up, ready at once.`,'good');if(EQUIP[e.id].timing==='instant')now('instant',{id:e.id})}m15next()},
  pub(){return {face:G.ms.nd.face,left:G.ms.nd.deck.length}}};
// ---------- 18: searchlight ----------
RH.searchlight={setup(){G.ms.sl={deck:shuffle(NUMS.slice()),disc:[],v:null,who:null}},
  start(r,seat){if(busy())return;const v=drawNum(G.ms.sl);if(v==null)return;G.ms.sl.v=v;lg(`${SP(seat).nm} turns up ${v} and sweeps for it.`);sweep(v,seat);G.ms.sl.disc.push(v);designate(seat,v,'sl')},
  name(r,seat,v){const s=G.ms.sl;return s.v!=null&&seat===s.who&&v!==s.v?`you must cut ${s.v}`:''},end(){G.ms.sl.v=null;G.ms.sl.who=null},pub(){return {v:G.ms.sl.v,who:G.ms.sl.who}}};
// ---------- 20, 35: X wires ----------
RH.xWire={target(r,seat,si,k,ctx){const sl=G.st[si].w[k];if(sl.x&&r.lockYellow&&xLocked())return 'X wires wait until every yellow is cut';return null},pub(r){return {locked:xLocked(),mode:r.mode}}};
// ---------- 22, 27: triggers on the first yellow pair ----------
RH.yellowGift={cut(){if(G.ms.yg||cutCount('Y')<2)return;G.ms.yg=1;lg('The first yellows are cut: everyone gives a token to the left.');for(const s of clockFrom(G.captain))now('giftTok',{from:s})}};
AG.giftTok=d=>{const to=leftOf(d.from);const opts=NUMS.concat(['Y']).filter(v=>G.tokSup[v==='Y'?'Y':v]>0).map(v=>({l:`Give token ${VN(v)} to ${SP(to).nm}`,h:'giftTok',d:{to,v}}));ask(d.from,'giftTok','Pick a token from the supply for your left neighbour',opts)};
QH.giftTok=d=>{placeTruthful(d.to,d.v,1);};
function placeTruthful(seat,v,fromSupply){const m=slotsOf(seat).filter(x=>!x.sl.cut&&!x.sl.flip&&cv(x.sl.id)===v);
  if(m.length){const x=m.find(y=>!y.sl.tok.length)||m[0];const t=fromSupply?mkTok(v==='Y'?'y':'n',v):{t:v==='Y'?'y':'n',v};x.sl.tok.push(t);lg(`${SP(seat).nm} places token ${VN(v)} on a matching wire.`)}
  else{const t=fromSupply?mkTok(v==='Y'?'y':'n',v):{t:v==='Y'?'y':'n',v};t.mean='none';G.st[standsOf(seat)[0]].side.push(t);lg(`${SP(seat).nm} holds no ${VN(v)}: the token goes beside the stand.`)}}
RH.yellowDraft={cut(){if(G.ms.yd||cutCount('Y')<2)return;G.ms.yd={row:[]};const bag=[];for(const k in G.tokSup)for(let i=0;i<G.tokSup[k];i++)bag.push(k==='Y'?'Y':+k);shuffle(bag);
    for(let i=0;i<G.np&&bag.length;i++){const v=bag.shift();G.tokSup[v==='Y'?'Y':v]--;G.ms.yd.row.push(v)}lg(`The first yellows are cut: tokens ${G.ms.yd.row.map(VN).join(', ')} are laid out.`);for(const s of clockFrom(G.captain))now('ydraft',{seat:s})},pub(){return G.ms.yd}};
AG.ydraft=d=>{const row=G.ms.yd.row;if(!row.length)return;ask(d.seat,'ydraft','Take one token and place it truthfully',[...new Set(row)].map(v=>({l:`Take ${VN(v)}`,h:'ydraft',d:{seat:d.seat,v}})))};
QH.ydraft=d=>{const row=G.ms.yd.row;row.splice(row.indexOf(d.v),1);placeTruthful(d.seat,d.v,0)};
// ---------- 23, 39: four wires at once ----------
RH.special4={setup(r){const v=1+rnd(12);G.ms.sp4={v,done:0,reward:r.reward};if(r.reward==='numInfo'){const rest=shuffle(NUMS.filter(x=>x!==v));G.ms.sp4.deck=rest.slice(0,8);G.ms.sp4.box=rest.slice(8)}lg(`Number card ${v}: its four wires go only all at once.`)},
  name(r,seat,v){return !G.ms.sp4.done&&v===G.ms.sp4.v?`the ${v}s only go by the four-wire action`:''},
  moves(r,seat){return G.ms.sp4.done?[]:exampleMulti(seat,'four',4,true)},acts:['multi'],
  legalX(r,m,seat){if(m.kind!=='four'||G.ms.sp4.done)return 'not available';return legalMulti(seat,m,4,true)},
  doX(r,m,seat){const ok=doMulti(seat,m,G.ms.sp4.v,'"'+G.ms.sp4.v+'"','explode');if(!ok||G.over)return;G.ms.sp4.done=1;
    if(r.reward==='eqDeck'){const n=G.eqDeck.length;for(const id of G.eqDeck.splice(0))G.eq.push({id,st:'ready',down:0,cover:null,perm:0});lg(`The rest of the equipment pile (${n}) is ready at once.`,'good');for(const e of G.eq)if(e.st==='ready'&&EQUIP[e.id].timing==='instant')now('instant',{id:e.id})}
    else{const d=G.ms.sp4.deck.splice(0);let i=0;const order=clockFrom(G.captain);for(const v of d){SP(order[i%G.np]).cards.push(v);i++}lg(`The ${d.length} remaining number cards are dealt out as extra tokens.`);for(const s of order)if(SP(s).cards.length)now('numInfo',{seat:s})}},
  round(r){if(G.ms.sp4.done)return;if(r.reward==='eqDeck'){if(G.eqDeck.length){const id=G.eqDeck.shift();G.eqOut.push(id);lg(`End of round: ${EQUIP[id].n} burns from the pile.`,'bad')}}
    else if(G.ms.sp4.deck.length){G.ms.sp4.box.push(G.ms.sp4.deck.shift());lg('End of round: a number card burns.','bad')}},
  pub(){const s=G.ms.sp4;return {v:s.v,done:s.done,pile:G.eqDeck.length,deck:s.deck?s.deck.length:0}}};
AG.numInfo=d=>{const held=heldVals(d.seat);const vals=[...new Set(SP(d.seat).cards)].filter(v=>G.tokSup[v]>0&&held[v]);if(!vals.length)return;ask(d.seat,'numInfo','Place one info token for a value on your cards',vals.map(v=>({l:`Token ${v}`,h:'numInfo',d:{seat:d.seat,v}})))};
QH.numInfo=d=>{placeTruthful(d.seat,d.v,1)};
// ---------- 25, 44, 49, 63: no talking (the interface has no chat; nothing to enforce) ----------
RH.speech={offMoves(r,seat){if(r.what!=='all'||G.q||G.phase!=='turn'||!hasWires(seat))return [];const last=G.ann.filter(a=>a.k==='needOx'&&a.seat===seat).pop();if(last&&last.turn>=G.turn-G.np+1)return [];return [{a:'signal'}]},acts:['signal'],
  legalX(r,m,seat){return RH.speech.offMoves(r,seat).length?'':'you just signalled'},doX(r,m,seat){G.ann.push({k:'needOx',seat,turn:G.turn});lg(`${SP(seat).nm} gives a thumbs-up: they need oxygen.`)}};
// ---------- 26: declare a value ----------
RH.declare={setup(){G.ms.dec={up:NUMS.slice(),down:[],v:null}},
  start(r,seat){if(busy())return;const s=G.ms.dec;s.up=s.up.filter(v=>!G.fin[v]);s.down=s.down.filter(v=>!G.fin[v]);if(!s.up.length){s.up=s.down;s.down=[]}
    const h=heldVals(seat);const opts=s.up.filter(v=>h[v]);if(!opts.length){G.ann.push({k:'holdsNone',seat,vals:s.up.slice(),turn:G.turn});skipTurn('holds none of the face-up values',0);return}
    ask(seat,'declare','Turn over a face-up number card: you must cut that value',opts.map(v=>({l:`Turn over ${v}`,h:'declare',d:{v}})))},
  name(r,seat,v){const s=G.ms.dec;return s.v!=null&&v!==s.v?`you turned over ${s.v}`:''},end(){G.ms.dec.v=null},pub(){return G.ms.dec}};
QH.declare=d=>{const s=G.ms.dec;s.up.splice(s.up.indexOf(d.v),1);s.down.push(d.v);s.v=d.v;lg(`${SP(G.actor).nm} turns over ${d.v}.`)};
// ---------- 29: the hidden forbidden value ----------
RH.mindRead={setup(){const d=shuffle(NUMS.slice());G.ms.mr={deck:d,fd:null,off:0};for(const s of clockFrom(G.captain)){const k=s===rightOf(G.captain)?3:2;SP(s).cards=d.splice(0,k)}},
  start(r,seat){if(busy()||G.ms.mr.off)return;let p=rightOf(seat);let g=0;while((p===seat||!SP(p).cards.length)&&g++<G.np)p=rightOf(p);if(p===seat||!SP(p).cards.length)return;
    ask(p,'mindCard',`Lay one of your number cards face down for ${SP(seat).nm}`,SP(p).cards.map((v,i)=>({l:`Lay ${v}`,h:'mindCard',d:{from:p,i}})))},
  end(r,seat){const m=G.ms.mr;if(m.fd){const v=m.fd.v;const hit=G.hist.some(h=>h.turn===G.turn&&h.seat===seat&&h.ok&&h.v===v);lg(`The face-down card was ${v}${hit?`, and ${SP(seat).nm} just cut it!`:'.'}`,hit?'bad':'');if(hit)advance(1,'cut the forbidden value');if(G.over)return;
      if(hasWires(seat))SP(seat).cards.push(v);else m.deck.push(v);m.fd=null}
    mrClean()},pub(){const m=G.ms.mr;return {fdFrom:m.fd?m.fd.from:null,deck:m.deck.length,off:m.off,counts:G.seats.map(s=>s.cards.length)}}};
QH.mindCard=d=>{const v=SP(d.from).cards.splice(d.i,1)[0];G.ms.mr.fd={from:d.from,v};lg(`${SP(d.from).nm} lays a number card face down.`)};
function mrClean(){const m=G.ms.mr;if(m.off)return;for(const s of G.seats){s.cards=s.cards.filter(v=>!G.fin[v]);if(!hasWires(s.i)&&s.cards.length){m.deck.push(...s.cards);s.cards=[]}}m.deck=m.deck.filter(v=>!G.fin[v]);
  for(const s of G.seats)if(hasWires(s.i))while(s.cards.length<=1&&m.deck.length){const v=m.deck.shift();if(!G.fin[v])s.cards.push(v)}
  const open=NUMS.filter(v=>!G.fin[v]&&G.tot[v]);if(open.length<=1){m.off=1;for(const s of G.seats)s.cards=[];m.deck=[];lg('Only one value is left: the number cards are put away.')}}
// ---------- 30: timed number targets ----------
RH.bus={setup(){G.ms.bus={deck:shuffle(NUMS.slice()),disc:[],pi:-1,tg:[],lock:0,stage:'run',finalEnd:null,rush:0}},
  tick(r){const b=G.ms.bus;const P=SCRIPTS.m30.phases;while(!G.over&&b.pi+1<P.length&&P[b.pi+1].t<=G.clock){b.pi++;busPhase(b.pi)}if(!G.over&&b.stage==='final'&&G.clock>=b.finalEnd)explode('the bus ran out of road')},
  name(r,seat,v){const b=G.ms.bus;if(b.lock&&!b.tg.includes(v))return 'only the three target values may be cut now';if(b.rush)return 'cut every remaining yellow at once first';return ''},
  stuck(r,seat){const b=G.ms.bus;if(b.lock&&!b.tg.some(v=>heldVals(seat)[v])){G.ann.push({k:'holdsNone',seat,vals:b.tg.slice(),turn:G.turn});skipTurn('holds none of the target values',0);return true}return false},
  moves(r,seat){const b=G.ms.bus;if(!b.rush)return [];const n=remaining('Y');return exampleMulti(seat,'rush',n,true)},acts:['multi'],
  legalX(r,m,seat){if(m.kind!=='rush'||!G.ms.bus.rush)return 'not now';return legalMulti(seat,m,remaining('Y'),true)},
  doX(r,m,seat){const ok=doMulti(seat,m,'Y','yellow','explode');if(ok&&!G.over)busRushDone()},
  legalCut(r,seat,m){return G.ms.bus.rush?'cut every remaining yellow at once first':''},
  pub(){const b=G.ms.bus;const P=SCRIPTS.m30.phases;const ph=P[b.pi];return {tg:b.tg,lock:b.lock,stage:b.stage,rush:b.rush,ends:ph?ph.t+ph.len:null,finalEnd:b.finalEnd}}};
function busRushDone(){const b=G.ms.bus;b.rush=0;b.lock=0;b.disc.push(...b.tg);b.tg=[];b.stage='final';b.finalEnd=G.clock+120;prompt('Every yellow is cut! Two minutes to finish the rest.')}
function busPhase(i){const b=G.ms.bus;const P=SCRIPTS.m30.phases;const ph=P[i];const prev=b.tg[0];const hit=prev!=null&&cutCount(prev)>=2;
  switch(ph.check){
  case 'dialIfMissed':if(!hit)advance(1,'missed the target');break;
  case 'eqIfMissed':if(!hit){const e=G.eq.filter(x=>(x.st==='ready'||x.st==='locked')&&!x.down).sort((a,c)=>(EQUIP[a.id].v==='Y'?0:EQUIP[a.id].v)-(EQUIP[c.id].v==='Y'?0:EQUIP[c.id].v))[0];if(e){e.st='used';lg(`${EQUIP[e.id].n} is lost.`,'bad')}}break;
  case 'yellowCountIfHit':if(hit)for(const s of G.seats){const n=uncutOf(s.i).filter(x=>!x.sl.flip&&cv(x.sl.id)==='Y').length;G.ann.push({k:'ycount',seat:s.i,n,turn:G.turn});lg(`${s.nm} holds ${n} yellow.`)}break;
  case 'holdIfHit':if(hit){const v=drawNum(b);if(v!=null){b.disc.push(v);const yes=heldVals(G.cur)[v]?1:0;G.ann.push({k:'holds',seat:G.cur,v,yes,turn:G.turn});lg(`${SP(G.cur).nm} draws ${v}: ${yes?'holds it':'does not hold it'}.`)}}break;
  case 'finishIfHit':if(hit){const s=allSlots().filter(x=>!x.sl.cut&&cv(x.sl.id)===prev);for(const x of s)cutSlot(x.sl);if(s.length){lg(`Bonus: the remaining ${prev}s are cut.`,'good');afterCut({seat:G.cur,v:prev,n:s.length,kind:'mass',ok:1})}}break;
  case 'rush':{const done=b.tg.every(v=>G.fin[v]);if(done){prompt('All three targets are done: the bus is safe!');G.over={win:true,why:'all three targets finished in time'};G.winText='Defused! The bus is safe.';G.phase='over';G.q=null;G.ag=[];return}
    if(remaining('Y')<=0){busRushDone();return}b.rush=1;prompt(ph.say);return}}
  if(G.over)return;if(ph.check!=='rush'){if(prev!=null)b.disc.push(...b.tg);b.tg=[];
    if(i===7){for(let k=0;k<3;k++){const v=drawNum(b);if(v!=null)b.tg.push(v)}b.lock=1}else{const v=drawNum(b);if(v!=null)b.tg.push(v)}
    prompt(ph.say+' Target'+(b.tg.length>1?'s':'')+': '+b.tg.join(', ')+'.')}}
// ---------- 31, 61: personal restrictions ----------
RH.persCon={setup(r){G.ms.pc={pool:[],fl:shuffle(CON_IDS.filter(c=>'FGHIJKL'.includes(c))),table:{},disc:[]};
    if(r.pick==='random'){const d=shuffle(['A','B','C','D','E']);for(const s of clockFrom(G.captain))SP(s).con=d.shift();if(G.np===2){G.ms.pc.table={L:d.shift(),R:d.shift()}}else if(G.np===3)G.ms.pc.table={L:d.shift()};G.ms.pc.disc.push(...d)}
    else G.ms.pc.pool=['A','B','C','D','E']},
  pre(r){if(r.pick==='draft')for(const s of clockFrom(G.captain))later('draftCon',{seat:s})},
  post(r){if(r.pick==='draft'){G.ms.pc.disc.push(...G.ms.pc.pool);G.ms.pc.pool=[]}},
  start(r,seat){if(busy())return;if(r.pick==='draft')dropIfBlocked(seat)},
  stuck(r,seat){if(r.pick==='draft')return false;return blockedSkip(r,seat)},
  round(r){if(r.rotate)now('rotateCon')},
  offMoves(r,seat){if(!r.swap||G.q||G.phase!=='turn'||!SP(seat).con||!G.ms.pc.fl.length||!hasWires(seat))return [];if(!(G.step==='act'))return [];return [{a:'swapCon'}]},acts:['swapCon'],
  legalX(r,m,seat){return r.swap&&SP(seat).con&&G.ms.pc.fl.length&&G.phase==='turn'&&G.step==='act'?'':'not available'},
  doX(r,m,seat){const old=SP(seat).con;G.ms.pc.disc.push(old);SP(seat).con=G.ms.pc.fl.shift();lg(`${SP(seat).nm} trades restriction ${old} for ${SP(seat).con} (${CONSTRAINTS[SP(seat).con].n}).`);advance(1,'restriction swap')},
  pub(){return {table:G.ms.pc.table,pool:G.ms.pc.pool,fl:G.ms.pc.fl.length}}};
AG.draftCon=d=>{let pool=G.ms.pc.pool.slice();let warn=null;if(G.np===2){const other=G.seats.find(s=>s.i!==d.seat&&s.con);if(other)warn={A:'B',B:'A',C:'D',D:'C'}[other.con]}
  ask(d.seat,'draftCon','Pick your restriction card',pool.map(c=>({l:`${c}: ${CONSTRAINTS[c].n} - ${CONSTRAINTS[c].text}${c===warn?' (the rules advise against this pairing)':''}`,h:'draftCon',d:{seat:d.seat,c}})))};
QH.draftCon=d=>{SP(d.seat).con=d.c;G.ms.pc.pool.splice(G.ms.pc.pool.indexOf(d.c),1);lg(`${SP(d.seat).nm} takes restriction ${d.c} (${CONSTRAINTS[d.c].n}).`)};
function withoutCons(seat,fn){const p=SP(seat);const a=p.conDown,g=G.ms.gcon;p.conDown=1;G.ms.gcon=null;const r=fn();p.conDown=a;G.ms.gcon=g;return r}
function dropIfBlocked(seat){const p=SP(seat);if(!p.con||p.conDown)return;const G0=G.step;G.step='act';const ok=mainMoves(seat,true).length>0;const free=ok?true:withoutCons(seat,()=>mainMoves(seat,true).length>0);G.step=G0;
  if(!ok&&free){p.conDown=1;lg(`${p.nm} cannot obey restriction ${p.con}: it is turned face down for good.`)}}
function blockedSkip(r,seat){const free=withoutCons(seat,()=>mainMoves(seat,true).length>0);if(!free)return false;
  G.blockRun++;const active=G.seats.filter(s=>hasWires(s.i)).length;skipTurn('blocked by a restriction',0);
  if(G.blockRun>=active){G.blockRun=0;if(r.roundBlock==='explode'){explode('nobody could play for a whole round');return true}if(r.roundBlock==='dial'){advance(1,'nobody could play for a whole round');if(!G.over)nextGcon()}}return true}
AG.rotateCon=()=>{ask(G.captain,'rotateCon','Rotate every restriction card one seat?',[{l:'Leave them',h:'rotateCon',d:{dir:0}},{l:'Rotate clockwise',h:'rotateCon',d:{dir:1}},{l:'Rotate counter-clockwise',h:'rotateCon',d:{dir:-1}}])};
QH.rotateCon=d=>{if(!d.dir)return;const ring=[];const T=G.ms.pc.table;for(const s of clockFrom(G.captain)){ring.push({seat:s});if(s===G.captain&&T.L)ring.push({t:'L'})}if(T.R)ring.push({t:'R'});
  const vals=ring.map(x=>x.seat!=null?SP(x.seat).con:T[x.t]);const n=ring.length;ring.forEach((x,i)=>{const v=vals[(i-d.dir+n)%n];if(x.seat!=null)SP(x.seat).con=v;else T[x.t]=v});lg(`The restriction cards rotate ${d.dir>0?'clockwise':'counter-clockwise'}.`)};
// ---------- 32, 37, 57: a shared restriction ----------
function nextGcon(){const g=G.ms.gc;G.ms.gcon=g.deck.length?g.deck.shift():null;lg(G.ms.gcon?`New restriction for everyone: ${G.ms.gcon} (${CONSTRAINTS[G.ms.gcon].n}).`:'The restriction deck is empty: no restriction now.')}
RH.globCon={setup(r){G.ms.gc={deck:shuffle(CON_IDS.slice()),pair:null};if(r.mode==='paired'){const d=G.ms.gc.deck.splice(0);G.ms.gc.pair={};NUMS.forEach((v,i)=>G.ms.gc.pair[v]=d[i]);G.ms.gcon=null}else nextGcon()},
  start(r,seat){if(busy())return;if(r.mode==='captain'&&G.ms.gcon!==undefined&&(G.ms.gc.deck.length||G.ms.gcon))now('replaceCon')},
  stuck(r,seat){return blockedSkip(r,seat)},
  finish(r,v){if(r.mode==='onFinish')nextGcon()},
  valid(r,v){if(r.mode==='paired'){G.ms.gcon=G.ms.gc.pair[v];lg(`Validation ${v} switches on restriction ${G.ms.gcon} (${CONSTRAINTS[G.ms.gcon].n}).`)}},
  pub(){return {con:G.ms.gcon,deck:G.ms.gc.deck.length,pair:G.ms.gc.pair}}};
AG.replaceCon=()=>{ask(G.captain,'replaceCon',`Restriction ${G.ms.gcon||'none'} is up. Keep it or turn the next card?`,[{l:'Keep it',h:'replaceCon',d:{r:0}},{l:'Turn the next card',h:'replaceCon',d:{r:1}}])};
QH.replaceCon=d=>{if(d.r)nextGcon()};
// ---------- 34: the weak link ----------
RH.mole={setup(){G.ms.mole={hidden:1};const d=shuffle(['A','B','C','D','E']);G.seats.forEach(s=>s.con=d.shift())},
  itemBan(){return G.ms.mole.hidden?'personal tools wait until the weak link is unmasked':null},
  stuck(r,seat){if(!G.ms.mole.hidden||SP(seat).role!=='weak')return false;const free=withoutCons(seat,()=>mainMoves(seat,true).length>0);if(!free)return false;
    lg(`${SP(seat).nm} is blocked by a hidden restriction: the weak link stumbles!`,'bad');advance(2,'the weak link was blocked');if(G.over)return true;
    G.ms.mole.hidden=0;G.ms.mole.gone=1;for(const s of G.seats){s.con=null;s.ch=null;s.chDown=0}lg('Every restriction and crew card is discarded.');later('ready');return true},
  moves(r,seat){if(!G.ms.mole.hidden||G.tfx.accused)return [];const o=[];for(const q of G.seats)if(q.i!==seat)for(const c of 'ABCDE')o.push({a:'accuse',who:q.i,con:c,pass:1});return o},acts:['accuse'],
  legalX(r,m,seat){if(!G.ms.mole.hidden||G.tfx.accused||G.step!=='act'||seat!==G.actor||G.tfx.acted)return 'not now';if(!SP(m.who)||m.who===seat||!'ABCDE'.includes(m.con))return 'name a crewmate and a restriction A-E';return ''},
  doX(r,m,seat){G.tfx.accused=1;const ok=SP(m.who).role==='weak'&&SP(m.who).con===m.con;lg(`${SP(seat).nm} accuses ${SP(m.who).nm} of being the weak link with restriction ${m.con}...`);
    if(ok){G.ms.mole.hidden=0;G.ms.roleHidden=0;for(const s of G.seats){s.chDown=0;s.con=null}lg('Right! Crew cards turn face up, restrictions are discarded, personal tools are back.','good')}else{lg('Wrong.','bad');advance(1,'false accusation')}},
  pub(){return {hidden:G.ms.mole.hidden,gone:!!G.ms.mole.gone}}};
// ---------- 36: the five-card line ----------
function lineHead(){const l=G.ms.ln;return l.vals.length?(l.end==='L'?l.vals[0]:l.vals[l.vals.length-1]):null}
RH.line5={setup(){G.ms.ln={vals:shuffle(NUMS.slice()).slice(0,5),end:'L'}},pre(){later('lineEnd')},
  name(r,seat,v){const l=G.ms.ln;if(l.vals.includes(v)&&v!==lineHead())return `the line wants ${lineHead()} first`;return ''},
  cut(r,ev){const h=lineHead();if(h!=null&&cutCount(h)>=2){const l=G.ms.ln;l.vals.splice(l.end==='L'?0:l.vals.length-1,1);lg(`Line card ${h} is cleared.`);if(l.vals.length>1)now('lineFlip',{seat:ev.seat});else RH.line5.cut(r,ev)}},
  pub(){return {vals:G.ms.ln.vals,end:G.ms.ln.end,head:lineHead()}}};
AG.lineEnd=()=>{const l=G.ms.ln;ask(G.captain,'lineEnd',`Number line ${l.vals.join(' ')}: which end does the arrow start at?`,[{l:`Left (${l.vals[0]} first)`,h:'lineEnd',d:{e:'L'}},{l:`Right (${l.vals[4]} first)`,h:'lineEnd',d:{e:'R'}}])};
QH.lineEnd=d=>{G.ms.ln.end=d.e;lg(`The arrow starts at the ${d.e==='L'?'left':'right'}: ${lineHead()} first.`)};
AG.lineFlip=d=>{const l=G.ms.ln;ask(d.seat,'lineFlip','Keep the arrow at this end or move it to the other end?',[{l:`Keep (${lineHead()} next)`,h:'lineFlip',d:{f:0}},{l:`Move (${l.end==='L'?l.vals[l.vals.length-1]:l.vals[0]} next)`,h:'lineFlip',d:{f:1}}])};
QH.lineFlip=d=>{const l=G.ms.ln;if(d.f)l.end=l.end==='L'?'R':'L';const h=lineHead();if(h!=null&&cutCount(h)>=2)RH.line5.cut(null,{seat:G.actor})};
// ---------- 38, 56, 64: flipped wires ----------
RH.flip={target(r,seat,si,k,ctx){const sl=G.st[si].w[k];if(!sl.flip)return null;if(r.who==='captain')return 'only the foreman may cut that wire';if(ctx.tool)return 'equipment cannot touch a flipped wire';return null},
  afterDual(r,ev){if(r.others){const f=findU(ev.u);if(f&&f.sl.flip)advance(1,"cutting a crewmate's flipped wire")}},
  missExtra(r,c){if(!r.others)return 0;return c.d.us.some(u=>{const f=findU(u);return f&&f.sl.flip})?1:0},
  stuck(r,seat){if(r.who==='captain'&&seat!==G.captain){skipTurn("only the foreman's flipped wire would be left to cut",1);return true}return false}};
// ---------- 41: snare wires ----------
RH.tripwire={name(r,seat,v){return v==='Y'?'snare wires only go by the snare action':''},
  start(r,seat){if(busy())return;const u=uncutOf(seat).filter(x=>!isRed(x.sl.id));if(u.length&&u.every(x=>cv(x.sl.id)==='Y')){if(!G.seats.some(q=>q.i!==seat&&hasWires(q.i))){explode('nobody is left to point at the last snare wire');return}skipTurn('only their own snare wire is left',0)}},
  moves(r,seat){const o=[];for(const si of teamStands(seat))G.st[si].w.forEach((x,k)=>{if(!x.cut)o.push({a:'trip',s:si,k})});return o},acts:['trip'],
  legalX(r,m,seat){if(G.step!=='act'||seat!==G.actor||G.tfx.acted)return 'not now';const s=G.st[m.s];if(!s||ownerOf(m.s)===seat)return 'point at a crewmate wire';const sl=s.w[m.k];return sl&&!sl.cut?'':'point at an uncut wire'},
  doX(r,m,seat){const sl=G.st[m.s].w[m.k];lg(`${SP(seat).nm} points at a wire of ${SP(ownerOf(m.s)).nm}: "snare!"`);
    if(cv(sl.id)==='Y'){cutSlot(sl);lg('It is a snare wire, safely cut.','good');rewind(1,'snare found');afterCut({seat,v:'Y',n:1,kind:'special',ok:1});if(!G.over)endAction();return}
    if(isRed(sl.id)){explode(`${SP(seat).nm} pointed at a red wire`);return}
    sl.not.push('Y');putTok(m.s,sl,trueTok(m.s,sl,'Y'));advance(1,'wrong snare call',{miss:1});if(G.over)return;afterMiss({seat,v:'Y',kind:'special'});endAction()},
  pub(){return {dealt:G.ms.dealt}}};
// ---------- 42: the circus ----------
RH.circus={setup(){G.ms.cir={ai:0,tada:0,said:1,last:null}},
  tick(){const c=G.ms.cir;const A=SCRIPTS.m42.acts;while(!G.over&&c.ai<A.length&&A[c.ai].t<=G.clock){const a=A[c.ai++];prompt(a.say);circusAct(a.act)}},
  cut(r,ev){const c=G.ms.cir;if(c.tada&&ev.kind!=='mass'&&ev.kind!=='reveal'){c.said=0;c.last=ev.seat}},
  offMoves(r,seat){const c=G.ms.cir;return c.tada&&!c.said&&c.last===seat&&!G.q?[{a:'tada'}]:[]},acts:['tada'],
  legalX(r,m,seat){const c=G.ms.cir;return c.tada&&!c.said&&c.last===seat?'':'nothing to shout'},doX(r,m,seat){G.ms.cir.said=1;lg(`${SP(seat).nm}: "Ta-da!"`)},
  pub(){const c=G.ms.cir;return {tada:c.tada,said:c.said,last:c.last,next:SCRIPTS.m42.acts[c.ai]?SCRIPTS.m42.acts[c.ai].t:null}}};
function circusAct(a){const seat=G.cur;const np=G.np;
  if(a==='magician'){const vals=NUMS.concat(['Y']).filter(v=>allSlots().filter(x=>x.sl.cut&&cv(x.sl.id)===v).length>=2);if(vals.length)ask(seat,'magic','Magician: pick a value; a pair of its cut wires goes back, uncut',vals.map(v=>({l:`Return two ${VN(v)}s`,h:'magic',d:{v}})))}
  else if(a==='tamerL'||a==='tamerR'){const d=a==='tamerL'?1:np-1;G.pos=G.pos.map(p=>(p+d)%np);lg(`Everyone moves one seat to the ${a==='tamerL'?'left':'right'}; the stands stay put.`)}
  else if(a==='juggler'){const mine=[];for(const si of standsOf(seat))G.st[si].w.forEach((x,k)=>{if(x.cut)mine.push({s:si,k})});const o=[];
    for(let i=0;i<mine.length;i++)for(let j=i+1;j<mine.length;j++)if(mine[i].s===mine[j].s&&cv(G.st[mine[i].s].w[mine[i].k].id)!==cv(G.st[mine[j].s].w[mine[j].k].id))o.push({l:`Swap slots ${mine[i].k+1} and ${mine[j].k+1} on stand ${mine[i].s+1}`,h:'juggle',d:{s:mine[i].s,a:mine[i].k,b:mine[j].k}});
    if(o.length)ask(seat,'juggle','Juggler: swap two of your cut wires of different values',o.slice(0,40))}
  else if(a==='knife'){let n=0;for(const si of standsOf(seat)){const s=G.st[si];const keep=[];for(const x of s.w){if(x.cut){G.gone.push(x.id);n++;G.marks=G.marks.filter(m=>m.a!==x.u&&m.b!==x.u)}else keep.push(x)}s.w=keep;dropStaleAnn(si)}lg(`${SP(seat).nm} throws ${n} cut wire${n===1?'':'s'} into the box.`)}
  else if(a==='tadaOn'){G.ms.cir.tada=1}
  else if(a==='clouds'){G.validOff=1;G.valid=[];lg('The validation tokens are gone.')}
  else if(a==='trampoline'){const c=G.ms.cir;if(c.tada&&!c.said&&c.last!=null){lg(`${SP(c.last).nm} forgot to shout "ta-da!".`,'bad');c.said=1;advance(1,'no ta-da')}}}
QH.magic=d=>{G.tfx.skip=1;const xs=allSlots().filter(x=>x.sl.cut&&cv(x.sl.id)===d.v).slice(0,2);for(const x of xs){const w=G.st[x.s].w;w.splice(w.indexOf(x.sl),1);x.sl.cut=0;x.sl.na=0;insertSlot(x.s,x.sl)}lg(`Two cut ${VN(d.v)}s are back on their stands, uncut.`)};
QH.juggle=d=>{const w=G.st[d.s].w;[w[d.a],w[d.b]]=[w[d.b],w[d.a]];w[d.a].na=1;w[d.b].na=1;lg('Two cut wires are juggled out of order.')};
// ---------- 43: the patrolling robot ----------
RH.robotPatrol={end(){const r=G.robot;r.at+=r.dir;if(r.at>=12){r.at=12;r.dir=-1}else if(r.at<=1){r.at=1;r.dir=1}},
  cut(r,ev){if(ev.kind==='mass'||ev.kind==='reveal'||ev.v!==G.robot.at||!G.robot.w.length)return;const seat=ev.seat;const sts=standsOf(seat);
    if(sts.length>1)now('robotStand',{seat});else robotGive(seat,sts[0])},
  pub(){return {at:G.robot.at,dir:G.robot.dir,n:G.robot.w.length}}};
AG.robotStand=d=>{ask(d.seat,'robotStand','The robot hands you a wire: which stand?',standsOf(d.seat).map(si=>({l:`Stand ${si+1}`,h:'robotStand',d:{seat:d.seat,si}})))};
QH.robotStand=d=>robotGive(d.seat,d.si);
function robotGive(seat,si){if(!G.robot.w.length)return;const id=G.robot.w.splice(rnd(G.robot.w.length),1)[0];const sl=newSlot(id);const k=insertSlot(si,sl);lg(`The robot hands ${SP(seat).nm} a wire: it goes into stand ${si+1}, slot ${k+1}.`)}
// ---------- 44, 49, 54, 63: oxygen ----------
const depth=v=>v==='Y'?1:v<=4?1:v<=8?2:3;
function oxCost(r,v){return r.variant==='shared'||r.variant==='depth'?depth(v):(v==='Y'?1:v)}
RH.oxygen={setup(r){const np=G.np;G.ms.ox={res:0,v:r.variant};
    if(r.variant==='shared')G.ms.ox.res=2*np;
    if(r.variant==='gift')G.seats.forEach(s=>s.ox={2:7,3:6,4:5,5:4}[np]);
    if(r.variant==='depth'){const k={2:9,3:6,4:3,5:2}[np];G.seats.forEach(s=>s.ox=k);G.ms.ox.res=Math.max(0,30-np*k)}
    if(r.variant==='bundle')SP(G.captain).ox={2:14,3:18,4:24,5:30}[np];
    G.ms.ox.total=G.ms.ox.res+G.seats.reduce((a,s)=>a+s.ox,0)},
  canPay(r,seat,v){if(G.tfx.noOx)return true;const c=oxCost(r,v);return r.variant==='shared'?G.ms.ox.res>=c:SP(seat).ox>=c},
  legalCut(r,seat,m,vals){if(G.tfx.noOx)return '';if(!RH.oxygen.canPay(r,seat,m.v))return 'not enough oxygen';if(r.variant==='gift'&&m.a==='dual'||r.variant==='gift'&&m.a==='solo'){if(m.oxTo==null||!SP(m.oxTo)||m.oxTo===seat)return 'name the crewmate who gets your oxygen'}return ''},
  dualParams(r,seat,m){if(r.variant!=='gift'||(m.a!=='dual'&&m.a!=='solo'))return null;const to=G.seats.filter(q=>q.i!==seat).sort((a,b)=>a.ox-b.ox)[0];return {oxTo:to.i}},
  pay(r,seat,v,m){const c=oxCost(r,v);if(r.variant==='shared'){G.ms.ox.res-=c;SP(seat).ox+=c}else if(r.variant==='gift'){SP(seat).ox-=c;SP(m.oxTo).ox+=c}else{SP(seat).ox-=c;G.ms.ox.res+=c}lg(`${SP(seat).nm} spends ${c} oxygen.`)},
  round(r){if(r.variant==='shared'){G.ms.ox.res=2*G.np;G.seats.forEach(s=>s.ox=0);lg('The reserve is refilled: all oxygen is back in the middle.')}
    if(r.variant==='bundle'&&G.ms.ox.res){const to=clockFrom(G.captain).find(q=>hasWires(q));if(to!=null){SP(to).ox+=G.ms.ox.res;lg(`${SP(to).nm} collects ${G.ms.ox.res} oxygen from the reserve.`);G.ms.ox.res=0}}},
  stuck(r,seat){G.tfx.noOx=1;const free=mainMoves(seat,true).length>0;G.tfx.noOx=0;if(!free)return false;if(eqOK(seat,'eq9')&&ask(seat,'stuckDamper','You cannot pay: use the Damper to ignore the fuse step?',[{l:'Use the Damper (no step)',h:'stuckDamper',d:{seat,use:1}},{l:'Skip and burn a step',h:'stuckDamper',d:{seat,use:0}}]))return true;skipTurn('not enough oxygen',1);return true},
  moves(r,seat){return r.variant==='shared'||r.variant==='gift'?[{a:'pass',pass:1}]:[]},acts:['pass'],
  legalX(r,m,seat){return G.step==='act'&&seat===G.actor&&!G.tfx.acted&&(r.variant==='shared'||r.variant==='gift')?'':'you may not pass'},
  doX(r,m,seat){G.tfx.acted=1;G.hist.push({seat,kind:'skip',turn:G.turn});lg(`${SP(seat).nm} passes.`);if(G.tfx.damper)lg('The Damper cancels the step.');else advance(1,'passing');if(!G.over){G.step='end';schedEnd()}},
  end(r,seat){if(r.variant==='bundle'&&SP(seat).ox){let to=leftOf(seat);let g=0;while(!hasWires(to)&&to!==seat&&g++<G.np)to=leftOf(to);if(to!==seat){SP(to).ox+=SP(seat).ox;SP(seat).ox=0}}
    if(r.variant==='gift')for(const s of G.seats)if(!hasWires(s.i)&&s.ox){G.ms.ox.lost=(G.ms.ox.lost||0)+s.ox;s.ox=0}},
  valid(r){if(r.variant!=='depth')return;for(const s of clockFrom(G.captain))if(G.ms.ox.res>0){G.ms.ox.res--;SP(s).ox++}lg('Fresh air: everyone takes one oxygen from the reserve (while it lasts).')},
  pub(r){return {res:G.ms.ox.res,v:r.variant,seats:G.seats.map(s=>s.ox)}}};
QH.stuckDamper=d=>{if(d.use){useEq('eq9');lg('The Damper cancels the step.','good');skipTurn('not enough oxygen',0)}else skipTurn('not enough oxygen',1)};
// ---------- 45: volunteers ----------
RH.volunteer={setup(){G.ms.vol={deck:shuffle(NUMS.slice()),disc:[],v:null,who:null}},noForced(){return true},
  start(r,seat){const s=G.ms.vol;s.who=null;const v=drawNum(s);if(v==null){for(const q of G.seats){const u=uncutOf(q.i);if(u.length&&u.every(x=>isRed(x.sl.id))){for(const x of u)cutSlot(x.sl);lg(`${q.nm} reveals their reds.`)}}G.tfx.skip=1;checkWin();if(!G.over&&!G.seats.some(q=>hasWires(q.i)&&uncutOf(q.i).some(x=>!isRed(x.sl.id))))explode('no number card is left to call');return}s.v=v;s.disc.push(v);lg(`${SP(G.captain).nm} turns up ${v}: who calls it?`);G.tfx.wait=1;G.step='snip'},
  sideToAct(){return G.step==='snip'?G.captain:null},
  offMoves(r,seat){if(G.step!=='snip'||G.q)return [];const o=[];const u=uncutOf(seat);if(u.length)o.push({a:'snip'});if(u.length&&u.every(x=>isRed(x.sl.id)))o.push({a:'snipReveal'});if(seat===G.captain)o.push({a:'nosnip'});return o},acts:['snip','nosnip','snipReveal'],
  legalX(r,m,seat){if(G.step!=='snip')return 'not now';if(m.a==='nosnip')return seat===G.captain?'':'only the foreman';if(!hasWires(seat))return 'you have no wires';if(m.a==='snipReveal')return uncutOf(seat).every(x=>isRed(x.sl.id))?'':'only with a hand of reds';return ''},
  doX(r,m,seat){const s=G.ms.vol;if(m.a==='snipReveal'){const u=uncutOf(seat);for(const x of u)cutSlot(x.sl);lg(`${SP(seat).nm} reveals their reds.`);afterCut({seat,v:'R',n:u.length,kind:'reveal',ok:1});return}
    if(m.a==='nosnip'){designate(G.captain,s.v,'vol');G.step='start';G.tfx.wait=0;later('ready');return}
    if(!heldVals(seat)[s.v]){lg(`${SP(seat).nm} calls "Snip!" without holding ${s.v}.`,'bad');advance(1,'false call');return}
    s.who=seat;G.actor=seat;lg(`${SP(seat).nm} calls "Snip!" and must cut ${s.v}.`);G.step='start';G.tfx.wait=0;later('ready')},
  name(r,seat,v){const s=G.ms.vol;return s.v!=null&&v!==s.v?`you must cut ${s.v}`:''},
  nextTurn(){return G.captain},end(){G.ms.vol.v=null},pub(){return {v:G.ms.vol.v,who:G.ms.vol.who}}};
// ---------- 46: the 7s go last ----------
RH.sevens={name(r,seat,v){return v===7?'the 7s go last, all four at once':''},
  forcedStart(r,seat){const u=uncutOf(seat);if(u.length&&u.every(x=>cv(x.sl.id)===7))G.tfx.force='sevens'},
  legalCut(){return G.tfx.force==='sevens'?'you hold only 7s: cut all four at once':''},
  moves(r,seat){const u=uncutOf(seat);return u.length&&u.every(x=>!x.sl.flip&&cv(x.sl.id)===7)?exampleMulti(seat,'sevens',remaining(7),true):[]},acts:['multi'],
  legalX(r,m,seat){if(m.kind!=='sevens')return 'not this job';const u=uncutOf(seat);if(!u.length||!u.every(x=>cv(x.sl.id)===7))return 'only a hand of nothing but 7s';return legalMulti(seat,m,remaining(7),true)},
  doX(r,m,seat){doMulti(seat,m,7,'7','explode')}};
// ---------- 47: arithmetic ----------
// the default pair keeps the most useful cards: it spends cards whose own value is already finished, then the ones least needed
function mathPair(v){const u=G.ms.mt.up;let best=null,bs=1e9;const cost=x=>(G.fin[x]?0:2)+Math.abs(x-6.5)/12;
  for(let i=0;i<u.length;i++)for(let j=0;j<u.length;j++){if(i===j)continue;let p=null;if(u[i]+u[j]===v&&i<j)p=[u[i],u[j],'+'];else if(u[i]-u[j]===v)p=[u[i],u[j],'-'];if(!p)continue;const sc=cost(p[0])+cost(p[1]);if(sc<bs){bs=sc;best=p}}return best}
RH.math={setup(){G.ms.mt={up:NUMS.slice()}},
  dualParams(r,seat,m){if(m.a!=='dual'&&m.a!=='solo')return null;if(m.v==='Y')return false;const p=mathPair(m.v);return p?{calc:p}:false},
  legalCut(r,seat,m){if(m.a!=='dual'&&m.a!=='solo')return '';const c=m.calc;const u=G.ms.mt.up;if(!Array.isArray(c)||c.length!==3)return 'pick two number cards to make the value';const [a,b,op]=c;
    if(a===b&&u.filter(x=>x===a).length<2||!u.includes(a)||!u.includes(b))return 'those cards are not available';const res=op==='+'?a+b:op==='-'?a-b:null;return res===m.v?'':'the cards do not make that value'},
  pay(r,seat,v,m){const u=G.ms.mt.up;u.splice(u.indexOf(m.calc[0]),1);u.splice(u.indexOf(m.calc[1]),1);lg(`${SP(seat).nm} uses ${m.calc[0]} ${m.calc[2]} ${m.calc[1]} = ${v}.`);if(u.length<2){G.ms.mt.up=NUMS.slice();lg('The number cards are laid out again.')}},
  moves(){return [{a:'pass',pass:1}]},acts:['pass'],legalX(r,m,seat){return G.step==='act'&&seat===G.actor&&!G.tfx.acted?'':'not now'},
  doX(r,m,seat){G.tfx.acted=1;G.hist.push({seat,kind:'skip',turn:G.turn});lg(`${SP(seat).nm} cannot or will not play.`);advance(1,'no sum played');if(!G.over){G.step='end';schedEnd()}},
  stuck(r,seat){skipTurn('no card pair makes a value they hold',1);return true},pub(){return G.ms.mt}};
// ---------- 48: three yellows at once ----------
RH.yellowTrio={name(r,seat,v){return v==='Y'?'the yellows go only all three at once':''},
  moves(r,seat){return remaining('Y')>0&&(G.np>=4||holdsColour(seat,'Y'))?exampleMulti(seat,'y3',remaining('Y'),true):[]},acts:['multi'],
  legalX(r,m,seat){if(m.kind!=='y3')return 'not this job';if(!(G.np>=4||holdsColour(seat,'Y')))return 'you need a yellow to try this';return legalMulti(seat,m,remaining('Y'),true)},
  doX(r,m,seat){doMulti(seat,m,'Y','yellow','tag')},pub(){return {dealt:G.ms.dealt}}};
// ---------- 50: lights out ----------
RH.memory={setup(){G.ms.memory=1;G.validOff=1}};
// ---------- 51: the boss picks ----------
RH.sir={setup(){G.ms.sir={deck:shuffle(NUMS.slice()),disc:[],v:null,who:null}},
  start(r,seat){if(busy())return;const v=drawNum(G.ms.sir);if(v==null)return;G.ms.sir.disc.push(v);lg(`Boss ${SP(seat).nm} turns up ${v}.`);designate(seat,v,'sir')},
  name(r,seat,v){const s=G.ms.sir;return s.v!=null&&seat===s.who&&v!==s.v?`you must cut ${s.v}`:''},end(){G.ms.sir.v=null;G.ms.sir.who=null},pub(){return {v:G.ms.sir.v,who:G.ms.sir.who}}};
// ---------- 53: the robot is the fuse ----------
RH.robotFuse={setup(){G.ms.rf={at:0}},dialAdv(r,n,ctx){if(ctx.miss){G.tfx.rfMiss=1;return true}G.ms.rf.at+=n;lg(`The robot lurches ${n} space${n>1?'s':''} forward (${G.ms.rf.at}).`,'bad');if(G.ms.rf.at>=12)explode('the robot reached 12');return true},
  cut(r,ev){if(ev.kind!=='mass'&&ev.kind!=='reveal'){G.tfx.cutOk=1;G.tfx.cutV=ev.v}},
  end(){const f=G.ms.rf;let d=0;if(G.tfx.rfMiss)d=2;else if(G.tfx.cutOk)d=G.tfx.cutV===f.at?-1:1;if(!d)return;f.at=Math.max(0,f.at+d);lg(`The robot moves to ${f.at}.`,d>0?'bad':'good');if(f.at>=12)explode('the robot reached 12')},
  pub(){return {at:G.ms.rf.at}}};
// ---------- 54: the red tide ----------
RH.redTide={setup(){G.ms.rt={ei:0,limit:SCRIPTS.m54.limit}},
  tick(){const t=G.ms.rt;const E=SCRIPTS.m54.events;while(!G.over&&t.ei<E.length&&E[t.ei].t<=G.clock){const e=E[t.ei++];prompt(e.say);tideEvent(e.ev)}if(!G.over&&G.clock>=t.limit)explode('the sub flooded: time ran out')},
  pub(){return {left:Math.max(0,G.ms.rt.limit-G.clock),pile:G.pile.length}}};
function tideEvent(ev){const seat=G.cur;
  if(ev==='leak'){if(!G.pile.length)return;const sts=standsOf(seat);if(sts.length>1)now('leakStand',{seat});else leakTo(seat,sts[0])}
  else if(ev==='extra')G.tfx.extra=1;
  else if(ev==='bottle'){if(G.ms.ox.res>0){G.ms.ox.res--;SP(seat).ox++;lg(`${SP(seat).nm} finds a bottle: +1 oxygen.`,'good')}}
  else if(ev==='transfer'){const o=[{l:'No transfer',h:'transfer',d:{seat,to:null,n:0}}];for(const q of G.seats)if(q.i!==seat){for(const n of [1,2]){if(SP(seat).ox>=n)o.push({l:`Give ${n} to ${q.nm}`,h:'transfer',d:{seat,to:q.i,n}});if(q.ox>=n)o.push({l:`Take ${n} from ${q.nm}`,h:'transfer',d:{seat,to:q.i,n:-n}})}}ask(seat,'transfer','Oxygen transfer with one crewmate',o)}}
AG.leakStand=d=>{ask(d.seat,'leakStand','A red leaks into your hand: which stand?',standsOf(d.seat).map(si=>({l:`Stand ${si+1}`,h:'leakStand',d:{seat:d.seat,si}})))};
QH.leakStand=d=>leakTo(d.seat,d.si);
function leakTo(seat,si){const id=G.pile.splice(rnd(G.pile.length),1)[0];const k=insertSlot(si,newSlot(id));lg(`${SP(seat).nm} draws a red into stand ${si+1}, slot ${k+1}.`,'bad')}
QH.transfer=d=>{if(!d.n)return;if(d.n>0){SP(d.seat).ox-=d.n;SP(d.to).ox+=d.n}else{SP(d.to).ox+=d.n;SP(d.seat).ox-=d.n}lg(`Oxygen moves: ${Math.abs(d.n)} ${d.n>0?'to':'from'} ${SP(d.to).nm}.`)};
// ---------- 55, 60: challenges ----------
RH.challenges={setup(){const d=shuffle([1,2,3,4,5,6,7,8,9,10]);G.ms.chal=d.slice(0,G.np).map(id=>{const c={id};if(id===8)c.nums=shuffle(NUMS.slice()).slice(0,2);return c});G.ms.chalOut=d.slice(G.np);G.ms.chalDone=[];lg(`Challenges: ${G.ms.chal.map(c=>CHALLENGES[c.id].n+(c.nums?' ('+c.nums.join(' & ')+')':'')).join(', ')}.`)},
  moves(r,seat){if(!G.ms.chal.some(c=>c.id===1))return [];const o=[];for(const si of teamStands(seat))G.st[si].w.forEach((x,k)=>{if(!x.cut)o.push({a:'redcall',s:si,k})});return o},acts:['redcall'],
  legalX(r,m,seat){if(!G.ms.chal.some(c=>c.id===1))return 'no such challenge';if(G.step!=='act'||seat!==G.actor||G.tfx.acted)return 'not now';const s=G.st[m.s];if(!s||ownerOf(m.s)===seat)return 'point at a crewmate wire';const sl=s.w[m.k];return sl&&!sl.cut?'':'point at an uncut wire'},
  doX(r,m,seat){const sl=G.st[m.s].w[m.k];lg(`${SP(seat).nm} points at a wire of ${SP(ownerOf(m.s)).nm}: "red!"`);if(!isRed(sl.id)){explode(`${SP(seat).nm} called red on a wire that was not red`);return}
    cutSlot(sl);lg('It is red, and safely revealed.','good');metChallenge(1);afterCut({seat,v:'R',n:1,kind:'special',ok:1});if(!G.over)endAction()},
  pub(){return {cards:G.ms.chal,done:G.ms.chalDone}}};
function metChallenge(id){const i=G.ms.chal.findIndex(c=>c.id===id);if(i<0)return;const c=G.ms.chal.splice(i,1)[0];G.ms.chalDone.push(c.id);lg(`Challenge met: ${CHALLENGES[id].n}!`,'good');rewind(1,'challenge met')}
function runs(stand){const o=[];let cur=0;for(const x of stand.w){if(!x.cut)cur++;else{if(cur)o.push(cur);cur=0}}if(cur)o.push(cur);return o}
function checkChallenges(){if(!G.ms.chal||G.over)return;const H=G.hist.filter(h=>h.kind!=='reveal');const last=n=>H.slice(-n);
  const okCut=h=>h.ok&&['dual','solo','special'].includes(h.kind)&&typeof h.v==='number';
  for(const c of G.ms.chal.slice()){let met=false;switch(c.id){
    case 2:{const l=last(4);met=l.length===4&&l.every(h=>okCut(h)&&h.v%2===0);break}
    case 3:met=G.st.some(s=>{const r=runs(s);return r.length>0&&r.every(n=>n===2)});break;
    case 4:if(G.valid.length>=3){met=G.valid[0]+G.valid[1]+G.valid[2]===18;if(!met)c.dead=1}break;
    case 5:{const l=last(2);met=l.length===2&&l.every(h=>h.kind==='solo'&&h.ok);break}
    case 6:met=G.st.some(s=>s.w.filter((x,k)=>!x.cut&&(k===0||s.w[k-1].cut)&&(k===s.w.length-1||s.w[k+1].cut)).length>=5);break;
    case 7:{const l=last(3);met=l.length===3&&l.every(okCut)&&((l[1].v===l[0].v+1&&l[2].v===l[1].v+1)||(l[1].v===l[0].v-1&&l[2].v===l[1].v-1));break}
    case 8:if(G.valid.length>=2){met=c.nums.includes(G.valid[0])&&c.nums.includes(G.valid[1]);if(!met)c.dead=1}break;
    case 9:met=G.st.some(s=>{const b=s.w.filter(x=>!x.cut&&WIRES[x.id].c==='b');return b.length>=6&&b.every(x=>WIRES[x.id].v%2===1)});break;
    case 10:met=G.st.some(s=>s.w.length>=9&&s.w.filter(x=>x.cut).length>=7&&!s.w[0].cut&&!s.w[s.w.length-1].cut);break}
    if(met&&!c.dead)metChallenge(c.id)}}
// ---------- 58 ----------
RH.unlimitedDD={};
// ---------- 59: the robot guide ----------
RH.robotLine={setup(){const line=shuffle(NUMS.slice());const at=line.indexOf(7);G.ms.rl={line,at,dir:(11-at)>=at?1:-1,v:null}},
  start(r,seat){if(busy())return;const s=G.ms.rl;const h=heldVals(seat);const opts=[];const ok=p=>!G.fin[s.line[p]]&&h[s.line[p]]&&!canName(seat,s.line[p],{kind:'dual'});
    if(ok(s.at))opts.push({l:`Leave the robot on ${s.line[s.at]}`,h:'robotGo',d:{p:s.at}});for(let p=s.at+s.dir;p>=0&&p<12;p+=s.dir)if(ok(p))opts.push({l:`Move it forward to ${s.line[p]}`,h:'robotGo',d:{p}});
    if(!opts.length){G.ann.push({k:'holdsNone',seat,vals:s.line.filter((v,p)=>(p-s.at)*s.dir>=0&&!G.fin[v]),turn:G.turn});s.dir=-s.dir;skipTurn('no value under or ahead of the robot',1);return}
    ask(seat,'robotGo','Robot guide: leave it or move it forward to a value you hold',opts)},
  name(r,seat,v){const s=G.ms.rl;return s.v!=null&&v!==s.v?`the robot stands on ${s.v}`:''},
  stuck(r,seat){const s=G.ms.rl;if(s.v==null)return false;s.dir=-s.dir;s.v=null;skipTurn('the robot value can no longer be cut',1);return true},
  postAct(r,seat){const s=G.ms.rl;if(s.v==null)return;s.v=null;if(G.tfx.skipped||G.over)return;ask(seat,'robotTurn','Turn the robot around?',[{l:'Keep its facing',h:'robotTurn',d:{t:0}},{l:'Turn it around',h:'robotTurn',d:{t:1}}])},
  pub(){return G.ms.rl}};
QH.robotGo=d=>{const s=G.ms.rl;s.at=d.p;s.v=s.line[d.p];lg(`The robot stands on ${s.v}.`)};
QH.robotTurn=d=>{if(d.t){G.ms.rl.dir=-G.ms.rl.dir;lg('The robot turns around.')}};
// ---------- 62: meteor cards ----------
RH.meteor={setup(){G.ms.met={vals:shuffle(NUMS.slice()).slice(0,G.np)};lg(`Meteor cards: ${G.ms.met.vals.join(', ')}.`)},finish(r,v){const m=G.ms.met;const i=m.vals.indexOf(v);if(i>=0){m.vals.splice(i,1);rewind(1,`meteor ${v} cleared`)}},pub(){return G.ms.met}};
// ---------- 65: hot potato ----------
RH.hotPotato={setup(){const d=shuffle(NUMS.slice());const order=clockFrom(G.captain);const per=G.np===3?[4,4,4]:G.np===4?[3,3,3,3]:[3,3,2,2,2];order.forEach((s,i)=>SP(s).cards=d.splice(0,per[i]))},
  start(r,seat){if(busy())return;const h=heldVals(seat);const up=SP(seat).cards.filter(v=>!G.fin[v]);if(!up.some(v=>h[v])){G.ann.push({k:'holdsNone',seat,vals:up,turn:G.turn});skipTurn('holds none of their card values',1)}},
  name(r,seat,v){const up=SP(seat).cards.filter(x=>!G.fin[x]);return up.includes(v)?'':'you may only cut values on your number cards'},
  postAct(r,seat){const up=SP(seat).cards.filter(v=>!G.fin[v]);if(!up.length)return;const o=[];for(const v of up)for(const q of G.seats)if(q.i!==seat)o.push({l:`Give ${v} to ${q.nm}`,h:'potato',d:{from:seat,v,to:q.i}});ask(seat,'potato','Hand one of your number cards to a crewmate',o)},
  pub(){return {cards:G.seats.map(s=>s.cards.map(v=>({v,up:!G.fin[v]})))}}};
QH.potato=d=>{const c=SP(d.from).cards;c.splice(c.indexOf(d.v),1);SP(d.to).cards.push(d.v);lg(`${SP(d.from).nm} hands card ${d.v} to ${SP(d.to).nm}.`)};
// ---------- 66: the bunker ----------
const DIRS={U:[-1,0],D:[1,0],L:[0,-1],R:[0,1]};
function bkWall(f,a,b){const F=BUNKER.floors[f];const k1=a+'|'+b,k2=b+'|'+a;const bk=G.ms.bk;if(F.walls.includes(k1)||F.walls.includes(k2))return true;if(f===0&&!bk.door&&(F.door===k1||F.door===k2))return true;if(f===1&&bk.laser&&F.laser&&(F.laser.includes(k1)||F.laser.includes(k2)))return true;return false}
function bkSquare(f,r,c){return BUNKER.floors[f].squares[r+','+c]||null}
function bkStep(f,r,c,d){const [dr,dc]=DIRS[d];const r2=r+dr,c2=c+dc;if(r2<0||r2>3||c2<0||c2>2)return null;if(bkWall(f,r+','+c,r2+','+c2))return null;return [r2,c2]}
const BK_GOAL=['key','guard','stairs','lever','arrange','doctor','finish'];
RH.bunker={setup(){const d=shuffle(['A','B','C','D','E']);G.ms.bk={f:0,r:3,c:0,obj:0,objT:0,door:0,laser:1,sides:{U:d[0],R:d[1],D:d[2],L:d[3]},action:d[4]};lg(`Bunker: up ${d[0]}, right ${d[1]}, down ${d[2]}, left ${d[3]}, action ${d[4]}.`)},
  begin(){G.ms.bk.objT=G.clock;prompt(SCRIPTS.m66.objectives[0].say)},
  name(r,seat,v){if(v==='Y')return 'yellows only go at the lever';return ''},
  tick(){const b=G.ms.bk;const O=SCRIPTS.m66.objectives;if(b.obj<O.length&&G.clock>=b.objT+O[b.obj].len){if(BK_GOAL[b.obj]==='arrange'){bkNext();return}explode(`objective missed: ${O[b.obj].say}`)}},
  moves(r,seat){const b=G.ms.bk;if(BK_GOAL[b.obj]!=='lever'||b.f!==1||bkSquare(1,b.r,b.c)!=='lever'||remaining('Y')<=0)return [];return exampleMulti(seat,'lever',remaining('Y'),true)},acts:['multi'],
  legalX(r,m,seat){const b=G.ms.bk;if(m.kind!=='lever'||BK_GOAL[b.obj]!=='lever'||b.f!==1||bkSquare(1,b.r,b.c)!=='lever')return 'only on the lever square';return legalMulti(seat,m,remaining('Y'),true)},
  doX(r,m,seat){const ok=doMulti(seat,m,'Y','yellow','tag');if(ok&&!G.over){G.ms.bk.laser=0;lg('The laser is off.','good');bkNext()}},
  winBlock(){return G.ms.bk.obj<6?'every wire was cut before the doctor was caught':null},
  postAct(r,seat){const last=G.hist[G.hist.length-1];if(!last||last.turn!==G.turn||!['dual','solo'].includes(last.kind)||G.tfx.skipped)return;const steps=last.kind==='solo'&&G.tfx.soloN===4?2:1;for(let i=0;i<steps;i++)now('bkMove',{seat,v:last.v,ok:last.ok})},
  afterSolo(r,ev){G.tfx.soloN=ev.n},
  pub(){const b=G.ms.bk;return Object.assign({goal:BK_GOAL[b.obj],ends:b.objT+(SCRIPTS.m66.objectives[b.obj]||{len:0}).len},b)}};
function bkNext(){const b=G.ms.bk;b.obj++;b.objT=G.clock;const O=SCRIPTS.m66.objectives;if(b.obj<O.length){prompt(O[b.obj].say);if(BK_GOAL[b.obj]==='arrange')now('bkArrange')}}
function bkOptions(v,ok){const b=G.ms.bk;const o=[];const sq=bkSquare(b.f,b.r,b.c);
  if(ok&&sq&&BUNKER.action[sq]&&sq===BK_GOAL[b.obj]&&sq!=='lever'&&v!=='Y'&&CONSTRAINTS[b.action].val(v))o.push({l:`Do the ${sq} action here`,h:'bkMove',d:{act:sq}});
  for(const d of ['U','R','D','L'])if(v!=='Y'&&CONSTRAINTS[b.sides[d]].val(v)){const p=bkStep(b.f,b.r,b.c,d);if(p)o.push({l:`Move ${({U:'up',R:'right',D:'down',L:'left'})[d]}`,h:'bkMove',d:{dir:d}})}
  return o}
AG.bkMove=d=>{if(G.over)return;const o=bkOptions(d.v,d.ok);if(!o.length){lg('The crew cannot move: they stay put.');return}ask(d.seat,'bkMove','Bunker: where does the crew go?',o)};
QH.bkMove=d=>{const b=G.ms.bk;if(d.act){lg(`Action at the ${d.act}!`,'good');if(d.act==='key')b.door=1;bkNext();return}
  const p=bkStep(b.f,b.r,b.c,d.dir);b.r=p[0];b.c=p[1];const sq=bkSquare(b.f,b.r,b.c);lg(`The crew moves to row ${b.r+1}, column ${b.c+1}${sq?' ('+sq+')':''}.`);
  if(sq==='trap')advance(1,'a trap');if(sq==='stairs'&&b.f===0){b.f=1;b.r=BUNKER.floors[1].stairs[0];b.c=BUNKER.floors[1].stairs[1];lg('Down the stairs to the basement.');if(BK_GOAL[b.obj]==='stairs')bkNext()}};
AG.bkArrange=()=>{const b=G.ms.bk;const o=[{l:'Keep the cards',h:'bkArrange',d:{sw:null}}];for(const d of ['U','R','D','L'])o.push({l:`Swap the action card ${b.action} with the ${d} side ${b.sides[d]}`,h:'bkArrange',d:{sw:d}});ask(G.captain,'bkArrange','Bonus: rearrange the restriction cards?',o)};
QH.bkArrange=d=>{const b=G.ms.bk;if(d.sw){const t=b.sides[d.sw];b.sides[d.sw]=b.action;b.action=t;lg('The bunker cards are rearranged.')}bkNext()};
// ===================== per-seat knowledge =====================
// knowledge(seat) returns ONLY what that seat may know: its own wires (not its own flipped ones), every cut or revealed wire,
// crewmates' flipped wires, tokens, tags, public announcements, public mission state and its own private cards.
// It is built field by field (never a copy of G), so hidden wire identities cannot leak through it.
function slotView(seat,si,sl){const own=ownerOf(si)===seat;const vis=sl.cut||(own&&!sl.flip)||(!own&&sl.flip);
  const o={u:sl.u,cut:sl.cut,x:sl.x,flip:sl.flip,na:sl.na,tok:sl.tok.map(t=>({t:t.t,v:t.v})),not:sl.not.slice()};
  if(vis){o.v=cv(sl.id);o.s=sv(sl.id);o.c=WIRES[sl.id].c}else{o.v=null;o.s=null;o.c=null}return o}
function seatView(seat,q){const self=q.i===seat;const roleVis=self||!G.ms.roleHidden;const conVis=self||!G.ms.mole;const cardsVis=self||G.mission===65;
  return {i:q.i,nm:q.nm,pos:G.pos[q.i],human:q.human,lv:q.lv,ch:(self||!q.chDown)?q.ch:null,chDown:q.chDown,chUsed:q.chUsed,noItem:q.noItem,role:roleVis?q.role:null,
    con:conVis?q.con:(q.con?'?':null),conDown:q.conDown,ox:q.ox,cards:cardsVis?q.cards.slice():null,nCards:q.cards.length,nUncut:uncutOf(q.i).length,stands:standsOf(q.i)}}
function knowledge(seat){if(!G)return null;const M=MISSIONS[G.mission];
  const K={seat,np:G.np,mission:G.mission,title:M.nm,captain:G.captain,cur:G.cur,actor:G.actor,phase:G.phase,step:G.step,turn:G.turn,round:G.round,
    dial:G.dial,dialMax:DIAL_MAX,clock:G.clock,prompt:G.prompt?Object.assign({},G.prompt):null,tokFam:G.tokFam,blueMax:M.blue,over:G.over?Object.assign({},G.over):null,
    markers:clone(G.markers),tot:Object.assign({},G.tot),cut:{},fin:Object.assign({},G.fin),valid:G.valid.slice(),validOff:G.validOff,
    stands:G.st.map(s=>({i:s.i,owner:ownerOf(s.i),mine:ownerOf(s.i)===seat,slots:s.w.map(sl=>slotView(seat,s.i,sl)),side:s.side.map(t=>({t:t.t,v:t.v,mean:t.mean}))})),
    marks:G.marks.map(m=>{const a=findU(m.a),b=findU(m.b);return a&&b?{t:m.t,s:a.s,a:a.k,b:b.k}:null}).filter(Boolean),
    robot:G.robot?{at:G.robot.at,dir:G.robot.dir,n:G.robot.w.length}:null,pile:G.pile.length,aside:G.aside.length,gone:G.gone.map(id=>({v:cv(id),s:sv(id),c:WIRES[id].c})),
    eq:G.eq.map(e=>({id:e.down?null:e.id,st:e.st,down:e.down,cover:e.cover,perm:e.perm})),eqDeck:G.eqDeck.length,
    ann:clone(G.ann),hist:clone(G.hist),seats:G.seats.map(q=>seatView(seat,q)),ms:{},rules:M.rules.map(r=>r.k),
    tfx:{damper:!!G.tfx.damper,acted:!!G.tfx.acted,force:G.tfx.force||null,accused:!!G.tfx.accused},
    q:G.q?(G.q.who===seat?{who:seat,kind:G.q.kind,title:G.q.title,opts:G.q.opts.map(o=>({l:o.l,d:clone(o.d||{})}))}:{who:G.q.who,kind:G.q.kind}):null};
  for(const v of NUMS.concat(['Y']))K.cut[v]=cutCount(v);
  for(const r of M.rules)if(RH[r.k].pub)K.ms[r.k]=clone(RH[r.k].pub(r,seat)||{});
  // the seat's own legal options (computed from public facts and its own hand only; the hidden-state test checks this)
  if(!G.q&&G.phase==='turn'&&G.step==='act'&&seat===G.actor&&!G.over)K.legal=legalSummary(seat);
  K.off=G.over||G.q?[]:rules().flatMap(r=>RH[r.k].offMoves?RH[r.k].offMoves(r,seat):[]);
  return K}
function legalSummary(seat){const mm=mainMoves(seat,false,true);const o={plain:[],flip:[],solo:[],special:[],other:[],tools:{},eq:[]};
  for(const m of mm){if(m.a==='dual')(m.own==='flip'?o.flip:o.plain).push(m);else if(m.a==='solo')o.solo.push(m);else if(m.a==='multi')o.special.push(m);else o.other.push(m)}
  o.tools={dd:itemOK(seat,'dd'),pt3:itemOK(seat,'pt3'),pt10:itemOK(seat,'pt10'),eq3:!!(eqEntry('eq3')&&eqOK(seat,'eq3')),eq5:!!(eqEntry('eq5')&&eqOK(seat,'eq5')),eq10:!!(eqEntry('eq10')&&eqOK(seat,'eq10'))};
  o.eq=eqMoves(seat).filter(m=>!(m.a==='eq'&&m.id==='eq11'));return o}
// ===================== invariants =====================
function checkInvariants(){const v=[];if(!G)return v;const seen=new Array(WIRE_COUNT).fill(0);const add=id=>{if(id<0||id>=WIRE_COUNT||!Number.isInteger(id))v.push('bad wire id '+id);else seen[id]++};
  for(const s of G.st)for(const x of s.w)add(x.id);if(G.robot)G.robot.w.forEach(add);G.pile.forEach(add);G.aside.forEach(add);G.box.forEach(add);G.gone.forEach(add);
  seen.forEach((n,id)=>{if(n!==1)v.push(`wire ${id} is in ${n} places`)});
  const us=new Set();for(const s of G.st)for(const x of s.w){if(us.has(x.u))v.push('duplicate slot uid '+x.u);us.add(x.u)}
  if(G.dial!=null){if(G.dial>DIAL_MAX)v.push('fuse above the maximum');if(!G.over&&G.dial<1)v.push('fuse at 0 but no explosion');if(G.dial<0&&!G.over)v.push('negative fuse')}
  // info tokens: supply + tokens on wires + beside stands + laid-out row = 26 (spoken tokens are extra)
  let tk=0;for(const k in G.tokSup){if(G.tokSup[k]<0||G.tokSup[k]>INFO_TOKENS[k])v.push('token supply out of range '+k);tk+=G.tokSup[k]}
  for(const s of G.st){for(const x of s.w)for(const t of x.tok)if(!t.sp&&(t.t==='n'||t.t==='y'||t.t==='f'))tk++;for(const t of s.side)if(!t.sp)tk++}
  if(G.ms.yd)tk+=G.ms.yd.row.length;if(tk!==26)v.push(`info tokens counted ${tk}, expected 26`);
  // equipment: each of the 18 cards in exactly one place
  const eqc={};for(const id of EQ_IDS)eqc[id]=0;for(const e of G.eq)eqc[e.id]++;for(const id of G.eqPool.concat(G.eqDeck,G.eqOut))eqc[id]++;for(const id in eqc)if(eqc[id]!==1)v.push(`equipment ${id} in ${eqc[id]} places`);
  // stands stay sorted (X, flipped and juggled wires excepted)
  for(const s of G.st){let last=-1;for(const x of s.w){if(x.x||x.flip||x.na)continue;if(sv(x.id)<last-1e-9){v.push(`stand ${s.i} out of order`);break}last=sv(x.id)}}
  if(G.valid.length>12||new Set(G.valid).size!==G.valid.length)v.push('validation tokens');
  if(G.ms.ox){const t=G.ms.ox.res+G.seats.reduce((a,s)=>a+s.ox,0)+(G.ms.ox.lost||0);if(t!==G.ms.ox.total)v.push(`oxygen ${t} != ${G.ms.ox.total}`)}
  if(G.q&&(!SP(G.q.who)||!G.q.opts.length))v.push('bad question');
  for(const k in G.tfx)if(typeof G.tfx[k]==='function')v.push('function in G');
  if(G.phase==='turn'&&!G.over&&!G.q&&!G.ag.length&&!['act','claim','snip'].includes(G.step))v.push('stalled step '+G.step);
  return v}
// ===================== text view, save, clock =====================
function wireText(seat,si,sl){const x=slotView(seat,si,sl);let s=x.v==null?'??':x.v==='R'?'R'+(x.s!=null?x.s:''):x.v==='Y'?'Y'+x.s:String(x.v);if(x.cut)s='['+s+']';if(x.x)s+='X';if(x.flip)s+='~';if(x.tok.length)s+='{'+x.tok.map(t=>t.t+(t.v!=null?t.v:'')).join(',')+'}';return s}
function render_game_to_text(seat){if(!G)return '{}';const sp=seat==null?-1:seat;
  return JSON.stringify({job:G.mission,title:MISSIONS[G.mission].nm,np:G.np,turn:G.turn,round:G.round,phase:G.phase,step:G.step,cur:G.cur,actor:G.actor,fuse:G.dial,clock:G.clock,
    q:G.q&&{who:G.q.who,kind:G.q.kind,n:G.q.opts.length},over:G.over,
    stands:G.st.map(s=>`${SP(ownerOf(s.i)).nm}#${s.i}: `+s.w.map(sl=>sp<0?((sl.cut?'[':'')+(cv(sl.id))+(sl.cut?']':'')+(sl.x?'X':'')+(sl.flip?'~':'')):wireText(sp,s.i,sl)).join(' ')),
    eq:G.eq.map(e=>`${EQUIP[e.id].n}:${e.down?'down':e.st}`),valid:G.valid,ms:Object.fromEntries(rules().filter(r=>RH[r.k].pub).map(r=>[r.k,RH[r.k].pub(r,sp)])),log:G.log.slice(0,6).map(l=>l.t)})}
function saveGame(){try{localStorage.setItem(SAVE,JSON.stringify(G))}catch(e){}}
function loadGame(){try{const s=localStorage.getItem(SAVE);if(s){G=JSON.parse(s);return true}}catch(e){}return false}
// real-time jobs: the UI calls tick(seconds) with real elapsed play time (pause it during narration); headless runs add opts.turnSec per turn
function tick(dt){if(!G||G.over||G.phase!=='turn')return;G.clock+=dt;if(!G.q)hook('tick');flow();if(typeof refresh==='function'&&!UI.sim)refresh()}
function describeMove(m){if(!m)return '';switch(m.a){case 'dual':return `dual cut ${VN(m.v)}${m.v2!=null?'/'+VN(m.v2):''} at ${SP(ownerOf(m.st)).nm} stand ${m.st+1} slot${m.ks.length>1?'s':''} ${m.ks.map(k=>k+1).join(',')}${m.tool?' with '+(m.tool==='dd'?'Twin Probe':EQUIP[m.tool]?EQUIP[m.tool].n:'Triple Probe'):''}${m.own==='flip'?' using your flipped wire':''}`;
  case 'solo':return `solo cut ${VN(m.v)}${m.ep?' (Express Pass)':''}${m.flip?' including your flipped wire':''}`;case 'reveal':return 'reveal your reds';case 'eq':return 'use '+EQUIP[m.id].n;case 'item':return 'use '+ITEMS[m.k].n;
  case 'multi':return `point at ${m.tg.length} wires (${m.kind})`;case 'q':return 'answer: '+(G.q&&G.q.opts[m.i]?G.q.opts[m.i].l:m.i);default:return m.a}}
