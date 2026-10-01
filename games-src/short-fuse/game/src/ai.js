// ===================== Short Fuse: computer teammates =====================
// Every decision is a pure function of knowledge(seat) (plus a salt): the AI never reads G.
// 1. buildModel(K): the unseen wires, the places they can be (stand gaps between known wires, X/flipped slots, the robot, the pile,
//    the unused "x out of y" wires) and every constraint the seat knows (sort order, tokens, tags, failed probes, sweeps, announcements).
// 2. sampleDeals(): Metropolis swaps over full consistent deals -> marginal and joint probabilities.
// 3. decide(): score every legal action (safety first, certain cuts first), use equipment, answer questions.
// easy forgets failed probes, sweeps and announcements, samples few deals, decides sloppily and rarely uses equipment.
// normal (think 1) adds the safe fixes: a re-check of every "certain" cut for a counter-example deal (the sampler can sit in one mode),
//   the most confident volunteer calls (45), the boss names the likeliest cutter (18, 51), the face-up card that is safest (26), the
//   mind-read card the cutter least likely holds (29), restriction rotation/trade (61), robot and bunker weights (43, 53, 66), the
//   oxygen chain (49), public leaked reds (54), a crewmate's flipped wire costs a real step (56, 64), off-turn signals actually sent.
// hard (think 2) plans across the crew's next turns: the card row left for the next players (47), the oxygen the next player needs
//   (49), who can still play after the hand-over (65), solo cuts kept in reserve (26, 47, 65), robot brakes kept (53), flipped wires taken
//   off a crewmate before they must gamble (64), one-shot probes saved for worse turns, the Damper kept for forced gambles, opening tokens
//   where the table cannot tell the value, public sure cuts left for crewmates, a small bonus for informative targets; 200 samples.
const AILV={easy:{S:16,noise:.6,tools:.3,think:0,forget:1,sloppy:.9,ch:1},normal:{S:60,noise:.04,tools:1,think:1,ch:1},hard:{S:200,noise:0,tools:1,think:2,ch:1,info:.12}};
let AISALT=12345,AICHAINS=0;function setAiSeed(s){AISALT=s>>>0}function setAiChains(n){AICHAINS=n}
function mkRng(seed){let a=seed>>>0;return ()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^a>>>15,a|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296}}
function kHash(K){let h=AISALT^(K.seat*2654435761);const mix=x=>{h=Math.imul(h^x,2246822519)>>>0;h^=h>>>13};mix(K.turn);mix(K.hist.length);mix(K.ann.length);mix(K.q?K.q.opts?K.q.opts.length:1:0);mix(K.legal?K.legal.plain.length:0);mix(Math.round(K.clock));return h>>>0}
const CODE=v=>v==='Y'?13:v==='R'?14:v;const UNCODE=c=>c===13?'Y':c===14?'R':c;
// ---------- the model ----------
function buildModel(K,forget){const M={bad:0,W:[],T:[],hid:[],ref:{},bins:[],glob:[],known:{}};const seat=K.seat;
  const fake=K.ms.fakeRed?K.ms.fakeRed.v:null;const U=[];
  for(let v=1;v<=K.blueMax;v++){const n=v===fake?4:(K.tot[v]||0);for(let i=0;i<n;i++)U.push({c:'b',code:v===fake?14:v,s:v})}
  for(const s of K.markers.red||[])U.push({c:'r',code:14,s});for(const s of K.markers.yel||[])U.push({c:'y',code:13,s});
  const rm=(c,s)=>{const i=U.findIndex(w=>w.c===c&&Math.abs(w.s-s)<1e-6);if(i>=0)U.splice(i,1);else M.bad++};
  // types: distinct (colour, sort)
  const tkey=w=>w.c+w.s;const tix={};for(const w of U){if(tix[tkey(w)]==null){tix[tkey(w)]=M.T.length;M.T.push({c:w.c,code:w.code,s:w.s})}}
  const xBlue=K.ms.xWire&&K.ms.xWire.mode==='extra';
  for(const st of K.stands){st.slots.forEach((x,k)=>{const key=st.i+':'+k;
      if(x.v!=null){rm(x.c,x.s);M.known[key]=CODE(x.v);return}
      const nt=x.tok.find(t=>t.t==='n');if(nt){rm('b',nt.v);M.known[key]=nt.v;M.fixedS=M.fixedS||{};M.fixedS[key]=nt.v;return}
      const h=M.hid.length;M.hid.push({st:st.i,k,u:x.u,x:x.x,flip:x.flip,owner:st.owner,tok:x.tok,not:forget?[]:x.not.map(CODE),pc:x.c||null});M.ref[key]=h})}
  for(const g of K.gone)rm(g.c,g.s);
  M.W=U.map(w=>({t:tix[tkey(w)],s:w.s,code:w.code,c:w.c}));
  // slot type filters (interval is added per gap below)
  // 54: every leaked wire was announced as a red as it went into a hand ("draws a red into stand 2, slot 5"); leaked wires are the
  // newest slots on the table, so the (reds in play - reds left in the pile) highest slot ids are the public reds
  let leaked=null;if(K.ms.redTide){const n=(K.markers.red||[]).length-K.pile;if(n>0){const us=[];for(const st of K.stands)for(const x of st.slots)us.push(x.u);us.sort((a,b)=>b-a);leaked=new Set(us.slice(0,n))}}
  const nT=M.T.length;M.ok=M.hid.map(h=>{const a=new Uint8Array(nT);for(let t=0;t<nT;t++){const T=M.T[t];let ok=true;
      for(const tk of h.tok){if(tk.t==='y'&&T.c!=='y')ok=false;if(tk.t==='p'&&(T.c!=='b'||T.code===14||(T.code%2===0)!==(tk.v==='e')))ok=false;if(tk.t==='f'&&T.code===CODE(tk.v))ok=false;if(tk.t==='c'&&T.code===14)ok=false}
      if(h.not.includes(T.code))ok=false;if(h.x&&xBlue&&T.c!=='b')ok=false;if(leaked&&leaked.has(h.u)&&T.c!=='r')ok=false;if(h.pc&&T.c!==h.pc)ok=false;a[t]=ok?1:0}return a});
  // bins: gaps between anchors in each stand's sorted region, single slots for X / flipped wires
  for(const st of K.stands){let lo=-1,run=[];const close=hi=>{if(run.length){M.bins.push({kind:'gap',slots:run,lo,hi});for(const h of run)for(let t=0;t<nT;t++)if(M.T[t].s<lo-1e-9||M.T[t].s>hi+1e-9)M.ok[h][t]=0}run=[]};
    st.slots.forEach((x,k)=>{const key=st.i+':'+k;if(x.x||x.flip){if(M.ref[key]!=null)M.bins.push({kind:'one',slots:[M.ref[key]]});return}if(x.na)return;
      if(M.ref[key]!=null){run.push(M.ref[key]);return}const s=x.s!=null?x.s:M.fixedS&&M.fixedS[key];if(s==null)return;close(s);lo=s});close(99)}
  const nb=(kind,cap,okf)=>{if(cap>0)M.bins.push({kind,cap,okT:M.T.map(okf)})};
  if(K.robot)nb('robot',K.robot.n,()=>1);nb('pile',K.pile,T=>T.c==='r'?1:0);
  if(K.markers.redQ)nb('asideR',K.markers.red.length-K.markers.redN,T=>T.c==='r'?1:0);if(K.markers.yelQ)nb('asideY',K.markers.yel.length-K.markers.yelN,T=>T.c==='y'?1:0);
  let cap=0;for(const b of M.bins)cap+=b.kind==='gap'||b.kind==='one'?b.slots.length:b.cap;
  if(cap<M.W.length)nb('slack',M.W.length-cap,()=>1);else if(cap>M.W.length)M.bad+=cap-M.W.length;
  // global constraints over slot refs: a ref is {h} (unknown) or {c:code}
  const sortOf={};for(const st of K.stands)st.slots.forEach((x,k)=>{if(x.s!=null)sortOf[st.i+':'+k]=x.s});
  const R=(si,k)=>{const key=si+':'+k;return M.ref[key]!=null?{h:M.ref[key]}:{c:M.known[key],s:sortOf[key]!=null?sortOf[key]:(M.fixedS&&M.fixedS[key])}};
  const seatSlots=s=>{const o=[];for(const st of K.stands)if(st.owner===s)st.slots.forEach((x,k)=>o.push(R(st.i,k)));return o};
  const hidOf=s=>seatSlots(s).filter(r=>r.h!=null);
  for(const st of K.stands)st.slots.forEach((x,k)=>{for(const tk of x.tok)if(tk.t==='c')M.glob.push({k:'cnt',me:R(st.i,k),all:st.slots.map((y,j)=>R(st.i,j)),n:tk.v})});
  for(const m of K.marks)M.glob.push({k:m.t,a:R(m.s,m.a),b:R(m.s,m.b)});
  const byU={};for(const st of K.stands)st.slots.forEach((x,k)=>byU[x.u]=R(st.i,k));
  for(const a of forget?[]:K.ann){if(a.k==='sweep')for(const r of a.res){const refs=r.us.map(u=>byU[u]).filter(Boolean);M.glob.push({k:'sweep',refs,code:a.v,yes:r.yes})}
    else if(a.k==='holds')M.glob.push({k:a.yes?'has':'none',refs:a.yes?seatSlots(a.seat):hidOf(a.seat),code:CODE(a.v)});
    else if(a.k==='holdsNone')for(const v of a.vals)M.glob.push({k:'none',refs:hidOf(a.seat),code:CODE(v)})}
  // a missed call proves the caller holds that value (a call needs a matching wire): while the caller has cut none of it, one of the
  // caller's hidden wires still is that value (not when wires can change hands)
  if(!forget&&!(K.eq&&K.eq.some&&K.eq.some(e=>e.st==='used'&&(e.id==='eq2'||e.id==='eq1111')))&&!K.seats.some(q=>q.chUsed&&q.ch==='ch_new2')&&!K.rules.includes('juggle')){const seen={};
    for(const h of K.hist){if(h.kind!=='dual'||h.ok||h.seat===K.seat||h.v==null||h.v==='R')continue;const key=h.seat+':'+h.v;if(seen[key])continue;seen[key]=1;const c=CODE(h.v);
      let cutIt=false;for(const st of K.stands)if(st.owner===h.seat)for(const x of st.slots)if(x.cut&&x.v!=null&&CODE(x.v)===c)cutIt=true;
      const refs=hidOf(h.seat);if(!cutIt&&refs.length)M.glob.push({k:'has',refs,code:c})}}
  for(const st of K.stands)for(const t of st.side){if(t.mean==='none')M.glob.push({k:'none',refs:hidOf(st.owner),code:CODE(t.v)});else if(t.mean==='has')M.glob.push({k:'has',refs:st.slots.map((y,j)=>R(st.i,j)),code:CODE(t.v)})}
  if(K.rules.includes('flip'))for(const q of K.seats){const fl=[];for(const st of K.stands)if(st.owner===q.i)st.slots.forEach((x,k)=>{if(x.flip)fl.push(R(st.i,k))});if(fl.length===2)M.glob.push({k:'le',a:fl[0],b:fl[1]})}
  const dealt=(K.ms.redTriple&&K.ms.redTriple.dealt)||(K.ms.tripwire&&K.ms.tripwire.dealt)||(K.ms.yellowTrio&&K.ms.yellowTrio.dealt);
  if(dealt)for(const col of ['red','yel'])if(dealt[col])for(const s of K.seats.map(q=>q.i))M.glob.push({k:'exact',refs:seatSlots(s),code:col==='red'?14:13,n:dealt[col][s]||0});
  return M}
// ---------- Metropolis sampler over full deals ----------
function sampleDeals(M,S,rnd0){let xs=((rnd0()*4294967296)>>>0)||0x9e3779b9;const rnd=()=>{xs^=xs<<13;xs^=xs>>>17;xs^=xs<<5;return (xs>>>0)/4294967296};const W=M.W,nW=W.length,bins=M.bins;const A=new Int16Array(M.hid.length).fill(-1);const binOf=new Int16Array(nW),mem=bins.map(()=>[]);
  const fits=(w,b)=>{const B=bins[b];if(B.okT)return B.okT[W[w].t];for(const h of B.slots)if(M.ok[h][W[w].t])return 1;return 0};
  const capOf=b=>bins[b].okT?bins[b].cap:bins[b].slots.length;
  // initial deal: earliest-deadline-first by sort value (feasible for the sort ranges whenever any deal is), random tie-breaks
  const lo=b=>bins[b].lo!=null?bins[b].lo:-1,hi=b=>bins[b].hi!=null?bins[b].hi:999;
  const attempt=pre=>{for(const m of mem)m.length=0;const done=new Uint8Array(nW);
    if(pre)for(let b=0;b<bins.length;b++){if(!bins[b].okT||bins[b].kind==='robot'||bins[b].kind==='slack')continue;const c=[...Array(nW).keys()].filter(w=>!done[w]&&bins[b].okT[W[w].t]);for(let i=c.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[c[i],c[j]]=[c[j],c[i]]}for(const w of c.slice(0,capOf(b))){done[w]=1;binOf[w]=b;mem[b].push(w)}}
    const byS=[...Array(nW).keys()].filter(w=>!done[w]).map(w=>({w,r:rnd()})).sort((x,y)=>W[x.w].s-W[y.w].s||x.r-y.r).map(x=>x.w);const left=[];
    for(const w of byS){let pick=-1,ph=1e9,pr=2;for(let b=0;b<bins.length;b++){if(mem[b].length>=capOf(b)||!fits(w,b)||lo(b)>W[w].s+1e-9||hi(b)<W[w].s-1e-9)continue;const h=hi(b),r=rnd();if(h<ph-1e-9||(Math.abs(h-ph)<1e-9&&r<pr)){pick=b;ph=h;pr=r}}
      if(pick<0){left.push(w);continue}binOf[w]=pick;mem[pick].push(w)}
    for(const w of left){const cand=[];for(let b=0;b<bins.length;b++)if(mem[b].length<capOf(b))cand.push(b);const b=cand[Math.floor(rnd()*cand.length)];binOf[w]=b;mem[b].push(w)}
    return left.length};
  let lf=attempt(false);for(let tr=0;lf&&tr<12;tr++)lf=attempt(true);
  const binV=b=>{const B=bins[b],m=mem[b];if(B.okT){let v=0;for(const w of m)v+=B.okT[W[w].t]?0:1;return v}
    if(m.length>1)m.sort((x,y)=>W[x].s-W[y].s);let v=0;for(let j=0;j<m.length;j++){const h=B.slots[j];A[h]=m[j];if(!M.ok[h][W[m[j]].t])v++}return v};
  const code=r=>r.h!=null?(A[r.h]>=0?W[A[r.h]].code:0):r.c;const srt=r=>r.h!=null?(A[r.h]>=0?W[A[r.h]].s:0):(r.s!=null?r.s:0);
  // global constraints, evaluated incrementally: each swap only re-checks the constraints that touch the two bins involved
  const G1=g=>{switch(g.k){
      case 'cnt':{const c=code(g.me);let n=0;for(const r of g.all)if(code(r)===c)n++;return n!==g.n?1:0}
      case 'le':return srt(g.a)>srt(g.b)+1e-9?1:0;
      case 'eq':return code(g.a)!==code(g.b)?1:0;case 'neq':return code(g.a)===code(g.b)?1:0;
      case 'sweep':{let any=0;for(const r of g.refs)if(code(r)===g.code){any=1;break}return any!==g.yes?1:0}
      case 'has':{for(const r of g.refs)if(code(r)===g.code)return 0;return 1}
      case 'none':for(const r of g.refs)if(code(r)===g.code)return 1;return 0;
      case 'exact':{let n=0;for(const r of g.refs)if(code(r)===g.code)n++;return Math.abs(n-g.n)}}return 0};
  const nG=M.glob.length;const gval=new Int16Array(nG);const binOfSlot=new Int16Array(M.hid.length).fill(-1);bins.forEach((B,bi)=>{if(B.slots)for(const h of B.slots)binOfSlot[h]=bi});
  const gOfBin=bins.map(()=>[]);M.glob.forEach((g,gi)=>{const rs=[g.me,g.a,g.b].concat(g.all||[],g.refs||[]).filter(r=>r&&r.h!=null);const seen=new Set();for(const r of rs){const bi=binOfSlot[r.h];if(bi>=0&&!seen.has(bi)){seen.add(bi);gOfBin[bi].push(gi)}}});
  const mark=new Int32Array(nG);let stamp=0;
  const bv=bins.map((_,b)=>binV(b));let gv=0;for(let gi=0;gi<nG;gi++){gval[gi]=G1(M.glob[gi]);gv+=gval[gi]}let V=bv.reduce((a,b)=>a+b,0)+gv;
  const nTy=M.T.length;const fitT=[];for(let t=0;t<nTy;t++){const r=new Uint8Array(bins.length);for(let b=0;b<bins.length;b++){const B=bins[b];if(B.okT)r[b]=B.okT[t];else{for(const h of B.slots)if(M.ok[h][t]){r[b]=1;break}}}fitT.push(r)}
  const out=[];const thin=Math.max(24,nW);const maxIt=S*thin*4+4000;let since=0;
  const snap=()=>{const s=new Int8Array(M.hid.length);for(let h=0;h<s.length;h++)s[h]=A[h]>=0?W[A[h]].code:0;return s};
  const touched=[],oldv=[];
  const step=()=>{if(nW<2||rnd()<.25)return;const a=Math.floor(rnd()*nW);const ba=binOf[a],ta=W[a].t;let b=-1,bb=-1;
    for(let tr=0;tr<40;tr++){const c=Math.floor(rnd()*nW);const bc=binOf[c];if(bc!==ba&&W[c].t!==ta&&fitT[ta][bc]&&fitT[W[c].t][ba]){b=c;bb=bc;break}}if(b<0)return;
    const ia=mem[ba].indexOf(a),ib=mem[bb].indexOf(b);mem[ba][ia]=b;mem[bb][ib]=a;binOf[a]=bb;binOf[b]=ba;
    const na=binV(ba),nb2=binV(bb);let dg=0;touched.length=0;oldv.length=0;stamp++;
    for(const L2 of [gOfBin[ba],gOfBin[bb]])for(const gi of L2){if(mark[gi]===stamp)continue;mark[gi]=stamp;const nv=G1(M.glob[gi]);if(nv!==gval[gi]){touched.push(gi);oldv.push(gval[gi]);dg+=nv-gval[gi];gval[gi]=nv}}
    const NV=V-bv[ba]-bv[bb]+na+nb2+dg;
    if(NV<=V||rnd()<Math.exp(-2.5*(NV-V))){bv[ba]=na;bv[bb]=nb2;gv+=dg;V=NV}
    else{for(let i=0;i<touched.length;i++)gval[touched[i]]=oldv[i];const ja=mem[ba].indexOf(b),jb=mem[bb].indexOf(a);mem[ba][ja]=a;mem[bb][jb]=b;binOf[a]=ba;binOf[b]=bb;binV(ba);binV(bb)}};
  for(let it=0;it<nW*30;it++)step();since=0;
  for(let it=0;it<maxIt&&out.length<S;it++){step();since++;if(V===0&&since>=thin){out.push(snap());since=0}}
  if(out.length)return {samples:out,exact:true};
  // the model could not be satisfied exactly (rare: juggled or thrown wires, moved wires): keep the least-violating states
  let best=V;const fb=[];for(let it=0;it<S*thin&&fb.length<S;it++){step();if(V<best)best=V;if(V<=best&&++since>=thin){fb.push(snap());since=0}}
  return {samples:fb.length?fb:[snap()],exact:false}}
// recompute total violations from scratch (used to keep V honest when global constraints exist)
// ---------- probabilities ----------
// several independent chains, pooled: one Metropolis chain can sit in one mode of a two-mode posterior (a red here and a 6 there,
// or the other way round) and then reports a false certainty; restarts from fresh random deals find both modes
function solve(K,S,rnd,forget,chains){const M=buildModel(K,forget);const C=Math.max(1,AICHAINS||chains||1);let r;
  if(C===1)r=sampleDeals(M,S,rnd);else{const per=Math.max(4,Math.ceil(S/C));const ok=[],bad=[];for(let c=0;c<C;c++){const x=sampleDeals(M,per,rnd);(x.exact?ok:bad).push(...x.samples)}r=ok.length?{samples:ok,exact:true}:{samples:bad,exact:false}}const P=M.hid.map(()=>new Float32Array(15));const n=r.samples.length||1;
  for(const s of r.samples)for(let h=0;h<s.length;h++)P[h][s[h]]+=1/n;
  // an inexact model (no fully consistent deal found) must never look certain
  if(!r.exact||M.bad)for(const p of P)for(let c=0;c<15;c++)p[c]=Math.min(p[c],.85);
  return {M,P,samples:r.samples,exact:r.exact&&!M.bad}}
function targetInfo(K,Z){const out={};const S=Z.samples,n=S.length;if(n<20)return out;const H=Z.M.hid.length;
  const ent=(idx,skip)=>{let tot=0;const cnt=new Int32Array(15);for(let h=0;h<H;h++){if(h===skip)continue;cnt.fill(0);for(const i of idx)cnt[S[i][h]]++;let e=0,k=0;for(let c=0;c<15;c++)if(cnt[c]){k++;const p=cnt[c]/idx.length;e-=p*Math.log2(p)}tot+=e+(k-1)/(2*idx.length*Math.LN2)}return tot};
  const all=[...Array(n).keys()];
  for(const st of K.stands){if(st.mine)continue;st.slots.forEach((x,k)=>{const h=Z.M.ref[st.i+':'+k];if(h==null||x.cut)return;const groups={};for(let i=0;i<n;i++){const c=S[i][h];(groups[c]=groups[c]||[]).push(i)}
    const gs=Object.values(groups);if(gs.length<2)return;let post=0;for(const g of gs)post+=g.length/n*ent(g,h);out[st.i+':'+k]=Math.max(0,ent(all,h)-post)})}return out}
function certainCheck(K,st,k,code,rnd,L){const M=buildModel(K,L.forget);const h=M.ref[st+':'+k];if(h==null)return true;let any=0;for(let t=0;t<M.T.length;t++)if(M.T[t].code===code){if(M.ok[h][t])any=1;M.ok[h][t]=0}
  if(!any)return true;const r=sampleDeals(M,3,rnd);return !r.exact}
function pAt(Z,st,k,code){const key=st+':'+k;if(Z.M.known[key]!=null)return Z.M.known[key]===code?1:0;const h=Z.M.ref[key];return h==null?0:Z.P[h][code]}
function pJoint(Z,cells,fn){if(!Z.samples.length)return 0;let n=0;for(const s of Z.samples){const vals=cells.map(([st,k])=>{const key=st+':'+k;return Z.M.known[key]!=null?Z.M.known[key]:s[Z.M.ref[key]]});if(fn(vals))n++}const p=n/Z.samples.length;return Z.exact?p:Math.min(p,.85)}
// ---------- scoring helpers ----------
const BOOM=1000;
function fuseLeft(K){if(K.dial!=null)return K.dial;if(K.ms.robotFuse)return Math.max(1,Math.floor((12-K.ms.robotFuse.at)/2));return 9}
function missSteps(K){let s=1;const me=K.seats[K.seat];const cons=[me.con&&me.con!=='?'&&!me.conDown?me.con:null,K.ms.globCon&&K.ms.globCon.con].filter(Boolean);if(cons.includes('L'))s=2;return s}
function missCost(K,extra){if(K.tfx.damper)return 0;const me=K.seats[K.seat];if(K.ms.rookie&&me.role==='rookie')return BOOM;if(K.rules.includes('butterfingers')&&K.seat===K.captain)return BOOM;
  const f=fuseLeft(K)-(missSteps(K)+(extra||0));if(K.ms.robotFuse)return f<=0?BOOM:1.5+4/(f+.5);if(f<=0)return BOOM;return (1.2+4/(f+.5))*1.6}
function redCost(K){return K.tfx.damper?0:BOOM}
function heldCounts(K){const o={};for(const st of K.stands)if(st.mine)for(const x of st.slots)if(!x.cut&&x.v!=null&&!x.flip)o[x.v]=(o[x.v]||0)+1;return o}
function bonusFor(K,v){let b=0;const ms=K.ms;
  if(ms.gate&&ms.gate.vals[ms.gate.at]===v)b+=.3;if(ms.line5&&ms.line5.head===v)b+=.3;
  if(ms.bus&&ms.bus.tg.includes(v))b+=1;if(ms.meteor&&ms.meteor.vals.includes(v))b+=.4;
  // 43: every robot wire must come out while its value can still be cut: take one whenever the robot stands on a value you can cut
  if(ms.robotPatrol&&ms.robotPatrol.at===v)b+=ms.robotPatrol.n>0?.5+.2*ms.robotPatrol.n:0;
  // 53: a cut on the robot's value moves it back instead of forward (worth a whole fuse step); values just ahead of it are next turns' brakes
  if(ms.robotFuse){const at=ms.robotFuse.at;const plan=(AILV[K.seats[K.seat].lv]||AILV.normal).think>=2;if(at===v)b+=Math.min(3,.9*stepCost(K));else if(plan&&typeof v==='number'&&v>at&&v<=at+3)b-=.45/(v-at);else if(plan&&typeof v==='number'&&v<at)b+=.15}
  if(ms.oxygen){const o=ms.oxygen;const c=o.v==='shared'||o.v==='depth'?(v==='Y'?1:v<=4?1:v<=8?2:3):(v==='Y'?1:v);b-=.06*c;
    if(o.v==='shared'||o.v==='bundle'){// leave enough for the crewmates still to play before the refill at the foreman's turn
      let left=0;const me=K.seats[K.seat];for(let k=1;k<K.np;k++){const q=K.seats.find(s=>s.pos===(me.pos+k)%K.np);if(q.i===K.captain)break;if(q.nUncut)left++}
      const after=(o.v==='shared'?o.res:me.ox)-c;const need=left*(o.v==='shared'?1.5:4);if(after<need)b-=.35*(need-after)}
    // 54 (own oxygen by depth): keep enough to afford my next cut; finishing a value refills everyone
    if(o.v==='depth'){const held=heldCounts(K);const me=K.seats[K.seat];const cost=x=>x==='Y'?1:x<=4?1:x<=8?2:3;let lo=9;for(const x in held){if(x==='R')continue;const xv=x==='Y'?'Y':+x;if(xv===v&&held[x]<=1)continue;lo=Math.min(lo,cost(xv))}
      if(lo<9&&me.ox-c<lo)b-=.5*(lo-(me.ox-c));const R=(K.tot[v]||0)-(K.cut[v]||0);if(R===2&&o.res>0)b+=.25}}
  if(ms.bunker)b+=bunkerBonus(K,v)*bunkerUrgency(K);
  // 29: the face-down card is one of the layer's cards: never one of mine, never a finished value
  if(ms.mindRead&&!ms.mindRead.off&&ms.mindRead.fdFrom!=null){const mine=K.seats[K.seat].cards||[];const open=[];for(let x=1;x<=12;x++)if(!K.fin[x]&&K.tot[x]&&!mine.includes(x))open.push(x);if(open.includes(v))b-=Math.min(2.5,stepCost(K))/Math.max(1,open.length)}
  return b}
function noisy(L,rnd){return (rnd()-.5)*2*L.noise}
// ---------- team-level helpers (everything from K and the sampled deals) ----------
// the price of burning one fuse step now (skips, passes, a crewmate's flipped wire)
function stepCost(K,n){if(K.ms.robotFuse){const f=Math.floor((12-K.ms.robotFuse.at-(n||1))/2);return f<=0?BOOM:1.5+4/(f+.5)}const f=fuseLeft(K)-(n||1);return f<=0?BOOM:1.2+4/(f+.5)}
// crewmates in turn order after seat s (only those who still hold wires)
function seatsAfter(K,s){const p=K.seats[s].pos;const o=[];for(let k=1;k<K.np;k++){const q=K.seats.find(x=>x.pos===(p+k)%K.np);if(q&&q.nUncut)o.push(q.i)}return o}
// per sampled deal, a bitmask per seat of the values (codes) that seat holds uncut (flipped wires excluded: their owner cannot name them)
function sampleMasks(K,Z){if(Z._masks)return Z._masks;const base=new Int32Array(K.np);
  for(const st of K.stands)st.slots.forEach((x,k)=>{if(x.cut||x.flip)return;const c=Z.M.known[st.i+':'+k];if(c!=null)base[st.owner]|=1<<c});
  const hs=[];Z.M.hid.forEach((h,i)=>{if(!h.flip)hs.push(i,h.owner)});
  const out=Z.samples.map(s=>{const m=Int32Array.from(base);for(let j=0;j<hs.length;j+=2){const c=s[hs[j]];if(c)m[hs[j+1]]|=1<<c}return m});
  if(!out.length)out.push(Int32Array.from(base));Z._masks=out;return out}
function pHolds(masks,seat,mask){let n=0;for(const m of masks)if(m[seat]&mask)n++;return n/masks.length}
function myTools(K){const me=K.seats[K.seat];const it=me.ch&&typeof CHARS!=='undefined'&&CHARS[me.ch]?CHARS[me.ch].item:null;return {dd:it==='dd'&&!me.chUsed&&!me.noItem&&!me.chDown}}
// my best single dual cut (or Twin Probe) of value v, from my own knowledge
function bestFor(K,Z,v,tools){const code=CODE(v);const R=(K.tot[v]||0)-(K.cut[v]||0);const held=heldCounts(K)[v]||0;if(held&&held===R&&(R===2||R===4))return {p:1,pr:0,solo:1};
  const flipJob=K.rules.includes('flip');let best={p:0,pr:0};
  for(const st of K.stands){if(st.mine)continue;const cells=[];st.slots.forEach((x,k)=>{if(x.cut||(x.flip&&flipJob))return;cells.push([k,pAt(Z,st.i,k,code),pAt(Z,st.i,k,14)])});
    for(const c of cells)if(c[1]>best.p||(c[1]===best.p&&c[2]<best.pr))best={p:c[1],pr:c[2]};
    if(tools&&tools.dd&&code!==13&&cells.length>=2){const top=cells.slice().sort((a,b)=>b[1]-a[1]).slice(0,4);
      for(let a=0;a<top.length;a++)for(let b=a+1;b<top.length;b++){const ph=pJoint(Z,[[st.i,top[a][0]],[st.i,top[b][0]]],vs=>vs.some(c=>c===code));if(ph-.06>best.p)best={p:ph-.06,pr:0,dd:1}}}}
  return best}
function evP(K,b,mc){return b.p-(1-b.p-b.pr)*mc-b.pr*redCost(K)}
// the table's public view: my own uncut wires hidden as well (what a crewmate knows about my stand, roughly)
function publicK(K){return Object.assign({},K,{stands:K.stands.map(st=>st.mine?Object.assign({},st,{slots:st.slots.map(x=>x.cut||x.v==null?x:Object.assign({},x,{v:null,s:null,c:null}))}):st)})}
function allowMask(c){let m=0;for(let code=1;code<=13;code++){const v=code===13?'Y':code;if(!c||c==='?'||!CONSTRAINTS[c]||!CONSTRAINTS[c].val||CONSTRAINTS[c].val(v))m|=1<<code}return m}
// job 47: the values two face-up cards can make
function formMask(K,row){let f=0;for(let i=0;i<row.length;i++)for(let j=0;j<row.length;j++){if(i===j)continue;const a=row[i]+row[j],b=row[i]-row[j];if(i<j&&a<=12&&!K.fin[a])f|=1<<a;if(b>=1&&!K.fin[b])f|=1<<b}return f}
function mathCalcs(up,v){const o=[];for(let i=0;i<up.length;i++)for(let j=0;j<up.length;j++){if(i===j)continue;if(i<j&&up[i]+up[j]===v)o.push([up[i],up[j],'+']);else if(up[i]-up[j]===v)o.push([up[i],up[j],'-'])}return o}
// expected skip-burns for the next crewmates if this row is left on the table
function mathRowRisk(K,masks,row,L){const full=row.length<2?NUMS:row;const F=formMask(K,full);const nx=seatsAfter(K,K.seat);const w=L.think>=2?[1,.6,.35]:[1,.4];let r=0;
  for(let i=0;i<Math.min(w.length,nx.length);i++)r+=w[i]*(1-pHolds(masks,nx[i],F));return r}
function mathBest(K,masks,v,L){let best=null,br=1e9;for(const c of mathCalcs(K.ms.math.up,v)){const row=K.ms.math.up.slice();row.splice(row.indexOf(c[0]),1);row.splice(row.indexOf(c[1]),1);const r=mathRowRisk(K,masks,row,L);if(r<br-1e-9){br=r;best=c}}return {calc:best,risk:br}}
// job 49: who gets my oxygen (the soonest crewmate who cannot afford their cheapest cut)
function oxTarget(K,Z,paid){const masks=sampleMasks(K,Z);const order=seatsAfter(K,K.seat);if(!order.length)return null;
  // the oxygen chain: pay the next player, so each turn's spend becomes the next cutter's budget; skip a player who can already
  // afford every value they may hold when a later player cannot afford their cheapest one
  const need=s=>{let lo=0,hi=0;for(const m of masks){let a=0,b=0;for(let c=1;c<=13;c++)if(m[s]>>c&1){const cost=c===13?1:c;if(!a||cost<a)a=cost;if(cost>b)b=cost}lo+=a;hi+=b}return [lo/masks.length,hi/masks.length]};
  const nx=order[0];const [lo0,hi0]=need(nx);if(K.seats[nx].ox<hi0||order.length===1)return nx;
  for(const s of order.slice(1)){const [lo]=need(s);if(K.seats[s].ox<lo&&K.seats[s].nUncut>1)return s}return nx}
// job 66: how pressed the crew is for time on the current objective (1 = relaxed)
function bunkerUrgency(K){const b=K.ms.bunker;if(!b||!b.goal||b.goal==='finish'||b.goal==='arrange')return 1;const tpt=K.turn>1&&K.clock>0?K.clock/(K.turn-1):12;
  const T=Math.ceil((b.ends-K.clock)/Math.max(1,tpt));const need=bkDist(K,b.r,b.c)+(BUNKER.action[b.goal]?1:0);const slack=T-need;return slack<=0?2.6:slack===1?2:slack===2?1.4:1}
// ---------- decisions ----------
function aiMove(seat){const K=knowledge(seat);return decide(K)}
function decide(K){const rnd=mkRng(kHash(K));const L=AILV[K.seats[K.seat].lv]||AILV.normal;
  if(K.q&&K.q.who===K.seat)return {a:'q',i:aiAnswer(K,rnd,L)};
  if(!K.legal)return offTurn(K,rnd,L);
  return mainDecision(K,rnd,L)}
function offTurn(K,rnd,L){for(const m of K.off)if(m.a==='tada')return m;
  if(K.off.some(m=>m.a==='signal')&&K.ms.oxygen&&K.ms.oxygen.v!=='shared'){const me=K.seats[K.seat];const held=heldCounts(K);const vals=Object.keys(held).filter(v=>v!=='R').map(v=>v==='Y'?1:+v);if(vals.length&&me.ox<Math.min(...vals))return {a:'signal'}}
  // 61: if my restriction leaves me nothing to cut, trade it (one step) just before my turn, while I still can: a blocked player is skipped
  if(L.think>=1&&K.off.some(m=>m.a==='swapCon')&&K.step==='act'&&K.actor!==K.seat&&seatsAfter(K,K.actor)[0]===K.seat&&stepCost(K)<BOOM){const me=K.seats[K.seat];const c=me.con;
    if(c&&CONSTRAINTS[c]&&CONSTRAINTS[c].val&&!me.conDown){const vals=Object.keys(heldCounts(K)).filter(v=>v!=='R').map(v=>v==='Y'?'Y':+v);if(vals.length&&!vals.some(v=>CONSTRAINTS[c].val(v)))return {a:'swapCon'}}}
  return null}
function mainDecision(K,rnd,L){const lg2=K.legal;const held=heldCounts(K);const me=K.seats[K.seat];const ms=K.ms;
  let Z=null;const getZ=()=>Z||(Z=solve(K,L.S,rnd,L.forget,L.ch));
  // jobs where the order of cuts matters: certain cuts are scored with everything else instead of going first
  const plan=L.think>=1&&!!(ms.math||ms.robotFuse||ms.robotPatrol||ms.bunker||(ms.oxygen&&ms.oxygen.v==='gift'));
  if(ms.oxygen&&ms.oxygen.v==='gift'){let to=null;if(L.think>=1)to=oxTarget(K,getZ());else{const sig=K.ann.filter(a=>a.k==='needOx'&&a.seat!==K.seat).pop();if(sig)to=sig.seat}
    if(to!=null)for(const m of lg2.plain.concat(lg2.solo,lg2.flip))if(m.oxTo!=null)m.oxTo=to}
  // free, certain progress first: solo cuts (not when a restriction or the cards say otherwise: the engine already filtered)
  const solos=lg2.solo.filter(m=>!m.ep&&!m.flip).sort((a,b)=>(held[b.v]||0)-(held[a.v]||0));
  // equipment that is simply good to use now
  const eqm=lg2.eq;const pickEq=id=>eqm.filter(m=>m.id===id);
  if(K.dial!=null&&pickEq('eq6').length&&(K.dial<=2||K.dial<K.np-1))return pickEq('eq6')[0];
  const rc=pickEq('eq7').filter(m=>m.who.length===Math.min(2,K.seats.filter(q=>q.chUsed&&q.ch).length)).sort((a,b)=>(b.who.includes(K.seat)?1:0)-(a.who.includes(K.seat)?1:0));if(rc.length&&rnd()<L.tools)return rc[0];
  if(L.tools>=1||rnd()<L.tools){const st=pickEq('eq4');if(st.length)return bestTag(K,st,rnd);
    const tg=pickEq('eq12').concat(pickEq('eq1'));const okTg=tg.filter(m=>{const s=K.stands[m.s].slots;return !s[m.k].cut&&!s[m.k+1].cut});if(okTg.length)return okTg[Math.floor(rnd()*okTg.length)];
    const lone=pickEq('eq22').filter(m=>!K.stands[m.s].slots[m.k].cut);if(lone.length)return lone[0]}
  if(solos.length&&!plan){const out=stripWhy(solos[0]);if(ms.math&&out.calc){const c=bestCalc(K,out.v);if(c)out.calc=c}return out}
  const ex=lg2.solo.filter(m=>m.ep);if(ex.length&&!plan)return ex[0];
  getZ();
  const cand=[];
  const F=fuseLeft(K);const mc=missCost(K);const rcst=redCost(K);const sc1=stepCost(K);const flipOthers=K.rules.includes('flip');
  if(plan){for(const m of solos)cand.push({m,ev:1.05+bonusFor(K,m.v)+(m.n===4||(held[m.v]||0)>=4?.15:0),p:1,why:'a solo cut cannot fail'});for(const m of ex)cand.push({m,ev:1.1+bonusFor(K,m.v),p:1,why:'a solo cut cannot fail'})}
  for(const m of lg2.plain){const p=pAt(Z,m.st,m.ks[0],CODE(m.v)),pr=pAt(Z,m.st,m.ks[0],14);const extra=K.stands[m.st].slots[m.ks[0]].flip&&flipOthers?1:0;
    // a crewmate's flipped wire (56, 64) burns a step even when the cut is right
    let fx=extra?(L.think>=1?stepCost(K):.8):0;
    // ...but a crewmate left with nothing but flipped wires must gamble on them (a wrong guess explodes): take one off them first
    if(extra&&L.think>=2){const q=K.stands[m.st].owner;let nf=0;for(const st of K.stands)if(st.owner===q)for(const x of st.slots)if(!x.cut&&!x.flip)nf++;if(nf===0)fx-=2.5*sc1;else if(nf===1)fx-=1.1*sc1}
    const ev=p*(1+bonusFor(K,m.v))-(1-p-pr)*(missCost(K,extra)-.25)-pr*rcst-fx+noisy(L,rnd);cand.push({m,ev,p,why:`${Math.round(p*100)}% that this wire is ${VN(m.v)}`})}
  // own flipped wires (38, 56, 64): a wrong guess explodes, so a "certain" guess is checked for a counter-example deal first
  const flipSure=m=>{for(const st of K.stands)if(st.mine)for(let k=0;k<st.slots.length;k++){const x=st.slots[k];if(x.flip&&!x.cut&&x.u===m.fu)return L.think<1||certainCheck(K,st.i,k,CODE(m.v),rnd,L)}return false};
  for(const m of lg2.solo.filter(x=>x.flip)){let p=pFlipOwn(K,Z,m);if(p>.985&&!flipSure(m))p=.5;cand.push({m,ev:p*2-(1-p)*BOOM,p,why:`your flipped wire is ${VN(m.v)} with ${Math.round(p*100)}%`})}
  for(const m of lg2.flip){let p=pFlipOwn(K,Z,m);const pt=pAt(Z,m.st,m.ks[0],CODE(m.v));if(p*pt>.985&&!(flipSure(m)&&(L.think<1||certainCheck(K,m.st,m.ks[0],CODE(m.v),rnd,L))))p=.5;const pp=p*pt;cand.push({m,ev:pp*1.2-(1-pp)*BOOM,p:pp,why:`own flipped wire and target both ${VN(m.v)}: ${Math.round(pp*100)}%`})}
  // probes
  const T=lg2.tools;const best1=cand.reduce((a,c)=>Math.max(a,c.p),0);
  if(best1<.995&&(T.dd||T.eq3||T.pt3||T.eq5||T.eq10||T.pt10)&&rnd()<L.tools)probeCands(K,Z,cand,T,held,mc,rcst,rnd,L);
  for(const m of lg2.special){const c=specialCand(K,Z,m,rnd);if(c)cand.push(c)}
  for(const m of lg2.other){const c=otherCand(K,Z,m,mc,rnd,L);if(c)cand.push(c)}
  // hard: what a cut teaches the table. Hit or miss, the pointed wire's value becomes public (cut, or a token), so a target whose
  // value pins down its neighbours is worth a little more (mutual information with the other unseen wires, in bits)
  if(L.think>=2&&L.info){const mi=targetInfo(K,Z);for(const c of cand){const m=c.m;if(m.a==='dual'&&m.ks.length===1&&c.p<.995){const g=mi[m.st+':'+m.ks[0]];if(g)c.ev+=L.info*g}}}
  // hard: a wire whose value is public (a true info token) is a sure cut for any crewmate holding that value; when I also have a sure
  // cut of my own, take mine and leave the public one for them
  if(L.think>=2){const sure=cand.filter(c=>c.p>=.995&&(c.m.a==='dual'||c.m.a==='solo'));if(sure.length>1){const pub=c=>{const m=c.m;if(m.a!=='dual'||m.ks.length!==1)return false;const x=K.stands[m.st].slots[m.ks[0]];return x.tok.some(t=>t.t==='n'&&t.v===m.v)};
    const priv=sure.filter(c=>!pub(c));if(priv.length)for(const c of sure)if(pub(c)){const R=(K.tot[c.m.v]||0)-(K.cut[c.m.v]||0)-(held[c.m.v]||0)-1;if(R>0)c.ev-=.08}}}
  // 47: every cut spends two face-up cards; keep a row the next crewmates can still use
  if(ms.math&&L.think>=2){const masks=sampleMasks(K,Z);const base=mathRowRisk(K,masks,ms.math.up,L);
    for(const c of cand){const m=c.m;if((m.a==='dual'||m.a==='solo')&&m.v!=='Y'){const b=mathBest(K,masks,m.v,L);if(b.calc){c.calc=b.calc;c.ev-=b.risk*sc1*.8}}else if(m.a==='pass')c.ev-=base*sc1*.8}}
  // hard: a solo cut stays available (nobody else holds that value), so in jobs that force or limit values keep it for a turn
  // when every other option is a gamble, as long as something else is nearly safe now
  if(L.think>=2&&(ms.math||ms.declare||ms.hotPotato)){const alt=cand.filter(c=>c.m.a==='dual'&&c.p>=.92&&c.ev>.4);if(alt.length)for(const c of cand)if(c.m.a==='solo'&&!c.m.flip)c.ev-=.45}
  // 49: the oxygen I pay is the receiver's budget: a cut too cheap to let the next player afford anything costs their turn (a step)
  if(ms.oxygen&&ms.oxygen.v==='gift'&&L.think>=2){const masks=sampleMasks(K,Z);const nx=seatsAfter(K,K.seat)[0];
    if(nx!=null){const ox=K.seats[nx].ox;const lo=masks.map(m=>{for(let c=1;c<=13;c++)if(m[nx]>>c&1)return c===13?1:c;return 0}).map((c,i)=>(masks[i][nx]>>13&1)?1:c);
      for(const c of cand){const m=c.m;let pay=0;if((m.a==='dual'||m.a==='solo')&&m.oxTo===nx)pay=m.v==='Y'?1:m.v;else if(m.a!=='pass'&&m.a!=='dual'&&m.a!=='solo')continue;
        const short=lo.filter(x=>x>ox+pay).length/lo.length;c.ev-=short*sc1*.9;
        // and keep enough for my own next turn if nobody is likely to refill me
        if(pay&&me.ox-pay<1)c.ev-=.15}}}
  cand.sort((a,b)=>b.ev-a.ev);
  // a "certain" single cut is checked once more: look for a consistent deal in which that wire is NOT the value; if one exists the
  // sampler missed a mode, and the cut is only likely
  if(L.think>=1&&L.verify!==0)for(let i=0;i<Math.min(3,cand.length);i++){const c=cand[i];const m=c.m;if(m.a!=='dual'||m.ks.length!==1||m.own||m.v2!=null||c.p<.985||!Z.exact)break;
    if(!certainCheck(K,m.st,m.ks[0],CODE(m.v),rnd,L)){c.p=.8;c.ev-=.2*mc+.4;cand.sort((a,b)=>b.ev-a.ev);i=-1}else break}
  let top=cand[0];if(AIDBG)AIDBG.cand=cand.slice(0,8).map(c=>({m:JSON.stringify(c.m),ev:+c.ev.toFixed(2),p:+c.p.toFixed(2)}));
  if(L.sloppy&&cand.length>1){const ok=cand.filter(c=>c.ev>top.ev-L.sloppy&&c.ev>-BOOM/2);top=ok[Math.floor(rnd()*ok.length)]||top}
  // Damper before a risky dual cut; Sweep when nothing is safe; Coffee Break when every option is bad
  if(top&&top.m.a==='dual'&&top.p<.93&&!K.tfx.damper){const dm=pickEq('eq9');if(dm.length&&(F<=2||top.p<.7||(L.think>=2&&top.p<.85&&forcedJob(K))))return dm[0]}
  if(top&&top.p<.75&&top.m.a==='dual'&&!K.ann.some(a=>a.k==='sweep'&&a.turn===K.turn&&a.by===K.seat)){const sw=pickEq('eq8').concat(lg2.eq.filter(m=>m.a==='item'&&m.k==='sweep'));if(sw.length&&rnd()<L.tools)return bestSweep(K,Z,sw)}
  if(!top)return lg2.other[0]||null;
  AILAST={p:top.p,ev:top.ev,why:top.why,exact:Z.exact,n:Z.samples.length};const out=stripWhy(top.m);if(ms.math&&out.calc){const c=top.calc||bestCalc(K,out.v);if(c)out.calc=c}return out}
// jobs that force the value (or the cutter): the Damper is worth more on the turn's gamble
function forcedJob(K){const ms=K.ms;return !!(ms.volunteer||ms.sir||ms.declare||ms.math||ms.hotPotato||ms.searchlight)}
var AILAST=null,AIDBG=null;
function stripWhy(m){const o=Object.assign({},m);delete o.example;delete o.pass;return o}
// job 47: among the card pairs that make the value, keep the row that can still make the most unfinished values
function bestCalc(K,v){const up=K.ms.math.up;let best=null,bs=-1;const formable=row=>{if(row.length<2)return 99;const f=new Set();for(let i=0;i<row.length;i++)for(let j=0;j<row.length;j++){if(i===j)continue;const a=row[i]+row[j],b=row[i]-row[j];if(i<j&&a<=12&&!K.fin[a])f.add(a);if(b>=1&&!K.fin[b])f.add(b)}return f.size};
  for(let i=0;i<up.length;i++)for(let j=0;j<up.length;j++){if(i===j)continue;let c=null;if(i<j&&up[i]+up[j]===v)c=[up[i],up[j],'+'];else if(up[i]-up[j]===v)c=[up[i],up[j],'-'];if(!c)continue;const row=up.slice();row.splice(row.indexOf(c[0]),1);row.splice(row.indexOf(c[1]),1);const sc=formable(row);if(sc>bs){bs=sc;best=c}}return best}
function pFlipOwn(K,Z,m){for(const st of K.stands)if(st.mine)for(let k=0;k<st.slots.length;k++){const x=st.slots[k];if(x.flip&&!x.cut&&x.u===m.fu)return pAt(Z,st.i,k,CODE(m.v))}return 0}
function probeCands(K,Z,cand,T,held,mc,rcst,rnd,L){
  // hard: a one-shot probe is worth more later, when single cuts are worse: early in the job it has to buy more safety to be spent
  let spend=0;if(L.think>=2&&L.spend!==0){let n=0,u=0;for(const st of K.stands)for(const x of st.slots){n++;if(!x.cut)u++}spend=.15*u/Math.max(1,n)}const byStand={};for(const m of K.legal.plain){if(m.v==='Y')continue;const x=K.stands[m.st].slots[m.ks[0]];if(x.x||x.flip)continue;(byStand[m.st+':'+m.v]=byStand[m.st+':'+m.v]||[]).push(m)}
  const base=m=>{const o=Object.assign({},m);delete o.ks;return o};
  for(const key in byStand){const ms=byStand[key];const st=ms[0].st,v=ms[0].v;const code=CODE(v);const ranked=ms.map(m=>({m,p:pAt(Z,st,m.ks[0],code)})).sort((a,b)=>b.p-a.p);const top=ranked.slice(0,5);
    const evOf=(ks,tool,cost)=>{const cells=ks.map(k=>[st,k]);const ph=pJoint(Z,cells,vs=>vs.some(c=>c===code));const pr=pJoint(Z,cells,vs=>vs.every(c=>c===14));
      return {m:Object.assign(base(ms[0]),{ks,tool}),ev:ph*(1+bonusFor(K,v))-(1-ph-pr)*(mc-.25)-pr*rcst-cost+noisy(L,rnd),p:ph,why:`${Math.round(ph*100)}% that one of these is ${v}`}};
    const ddCost=K.rules.includes('unlimitedDD')?0:.35+spend;
    if(T.dd)for(let a=0;a<top.length;a++)for(let b=a+1;b<top.length;b++)cand.push(evOf([top[a].m.ks[0],top[b].m.ks[0]].sort((x,y)=>x-y),'dd',ddCost));
    for(const t of ['eq3','pt3'])if(T[t]&&top.length>=3){for(let a=0;a<top.length;a++)for(let b=a+1;b<top.length;b++)for(let c=b+1;c<top.length;c++)cand.push(evOf([top[a].m.ks[0],top[b].m.ks[0],top[c].m.ks[0]].sort((x,y)=>x-y),t,.4+spend))}
    if(T.eq5){const all=K.stands[st].slots.map((x,k)=>k).filter(k=>{const x=K.stands[st].slots[k];return !x.cut&&!x.x&&!x.flip});if(all.length&&all.every(k=>ms.some(m=>m.ks[0]===k)))cand.push(evOf(all,'eq5',.5))}}
  for(const t of ['eq10','pt10'])if(T[t]){const bySlot={};for(const m of K.legal.plain){const x=K.stands[m.st].slots[m.ks[0]];if(x.x||x.flip)continue;(bySlot[m.st+':'+m.ks[0]]=bySlot[m.st+':'+m.ks[0]]||[]).push(m)}
    for(const key in bySlot){const ms=bySlot[key];if(ms.length<2)continue;const ranked=ms.map(m=>({m,p:pAt(Z,m.st,m.ks[0],CODE(m.v))})).sort((a,b)=>b.p-a.p);const a=ranked[0],b=ranked[1];const p=a.p+b.p;const pr=pAt(Z,a.m.st,a.m.ks[0],14);
      cand.push({m:Object.assign({},a.m,{v2:b.m.v,two:t}),ev:p*(1+bonusFor(K,a.m.v))-(1-p-pr)*(mc-.25)-pr*rcst-.3+noisy(L,rnd),p,why:`${Math.round(p*100)}% that it is ${VN(a.m.v)} or ${VN(b.m.v)}`})}}}
function specialCand(K,Z,m,rnd){const n=m.tg.length;const want={red3:14,four:K.ms.special4?K.ms.special4.v:0,sevens:7,y3:13,lever:13,rush:13}[m.kind];if(!want)return null;
  const cells=[];for(const st of K.stands)st.slots.forEach((x,k)=>{if(!x.cut)cells.push([st.i,k,pAt(Z,st.i,k,want)])});cells.sort((a,b)=>b[2]-a[2]);const top=cells.slice(0,Math.min(cells.length,n+2));
  let best=null,bp=-1;const combo=(start,acc)=>{if(acc.length===n){const p=pJoint(Z,acc.map(c=>[c[0],c[1]]),vs=>vs.every(c=>c===want));if(p>bp){bp=p;best=acc.slice()}return}for(let i=start;i<top.length;i++){acc.push(top[i]);combo(i+1,acc);acc.pop()}};combo(0,[]);
  if(!best)return null;const failBoom=['red3','four','sevens','rush'].includes(m.kind);const forced=K.tfx.force||m.kind==='rush';
  const ev=bp*(n*.9+1)-(1-bp)*(failBoom?BOOM:missCost(K))+(forced?BOOM/2:0);
  return {m:{a:'multi',kind:m.kind,tg:best.map(c=>({s:c[0],k:c[1]}))},ev,p:bp,why:`${Math.round(bp*100)}% that all ${n} are right`}}
function otherCand(K,Z,m,mc,rnd,L){switch(m.a){
  case 'trip':{const p=pAt(Z,m.s,m.k,13),pr=pAt(Z,m.s,m.k,14);return {m,ev:p*2-(1-p-pr)*mc-pr*BOOM+noisy(L,rnd),p,why:`${Math.round(p*100)}% snare wire`}}
  case 'redcall':{const p=pAt(Z,m.s,m.k,14);return {m,ev:p*2-(1-p)*BOOM,p,why:`${Math.round(p*100)}% red`}}
  case 'pass':return {m,ev:-mc-.2,p:0,why:'passing costs a fuse step but risks nothing else'};
  case 'eq':if(m.id==='eq11'){if(L.think<1)return {m,ev:-.6,p:0,why:'a coffee break skips a turn safely'};const nx=seatsAfter(K,K.seat);if(m.next!==nx[0])return null;
      // only to the player who is next anyway, unless they could not pay their oxygen (then the one after)
      const ox=K.ms.oxygen;const poor=q=>ox&&ox.v!=='shared'&&K.seats[q].ox<1;let to=nx[0];if(poor(to)&&nx[1]!=null&&!poor(nx[1]))to=nx[1];return {m:Object.assign({},m,{next:to}),ev:-.6,p:0,why:'a coffee break skips a turn safely'}}return null;
  case 'accuse':{const g=moleGuess(K);if(g&&g.who===m.who&&g.con===m.con&&(K.seats[K.seat].lv!=='easy'))return {m,ev:3,p:1,why:'only one crewmate fits a restriction'};return null}}
  return null}
function bestTag(K,ms,rnd){// a token where crewmates hold that value most often
  const held=heldCounts(K);let best=null,bv=-1e9;for(const m of ms){const x=K.stands[m.s].slots[m.k];if(x.cut||x.tok.length)continue;const v=x.v;const left=(K.tot[v]||0)-(K.cut[v]||0)-(held[v]||0);const sc=left+rnd()*.5-(m.k===0||m.k===K.stands[m.s].slots.length-1?.5:0);if(sc>bv){bv=sc;best=m}}return best||ms[0]}
function bestSweep(K,Z,ms){const held=heldCounts(K);let best=ms[0],bv=-1;for(const m of ms){if(!held[m.v])continue;let u=0;for(let h=0;h<Z.M.hid.length;h++){const p=Z.P[h][m.v];u+=p*(1-p)}if(u>bv){bv=u;best=m}}return best}
// the weak link: the only crewmate whose own cuts all fit one restriction they could hold
function moleGuess(K){const mine=K.seats[K.seat].con;const fits=[];for(const q of K.seats){if(q.i===K.seat)continue;const cuts=K.hist.filter(h=>h.seat===q.i&&['dual','solo','special'].includes(h.kind)&&h.v!=null&&h.v!=='R');if(cuts.length<3)return null;
    for(const c of 'ABCDE'){if(c===mine)continue;if(cuts.every(h=>CONSTRAINTS[c].val(h.v)))fits.push({who:q.i,con:c})}}return fits.length===1?fits[0]:null}
// ---------- questions ----------
function aiAnswer(K,rnd,L){rnd=rnd||mkRng(kHash(K));L=L||AILV[K.seats[K.seat].lv]||AILV.normal;const q=K.q;const O=q.opts;const held=heldCounts(K);const pick=f=>{let bi=0,bv=-1e9;O.forEach((o,i)=>{const v=f(o.d,i);if(v>bv){bv=v;bi=i}});return bi};
  const slotOf=u=>{for(const st of K.stands){const k=st.slots.findIndex(x=>x.u===u);if(k>=0)return {st,k,x:st.slots[k]}}return null};
  switch(q.kind){
  case 'infoStd':case 'lackTag':if(L.think>=2){// a token is worth most where the table cannot already tell the value (public view) and crewmates hold that value
      const Zp=solve(publicK(K),40,rnd,0,2);return pick(d=>{const f=slotOf(d.u);const v=f.x.v;const left=(K.tot[v]||0)-(K.cut[v]||0)-(held[v]||0);const pp=pAt(Zp,f.st.i,f.k,CODE(v));return left*(1-pp)+.6*(1-pp)+rnd()*.05})}
    return pick(d=>{const f=slotOf(d.u);const v=f.x.v;const left=(K.tot[v]||0)-(K.cut[v]||0)-(held[v]||0);return left*1+(f.k>0&&f.k<f.st.slots.length-1?.5:0)+rnd()*.4});
  case 'infoFalse':return pick(d=>{const f=slotOf(d.u);const real=f.x.v;return typeof real==='number'?-Math.abs(real-d.v)+rnd()*.3:rnd()});
  case 'infoNeg':return pick(d=>(d.v==='Y'?.5:1)+rnd());
  case 'designate':{if(L.think<1){const Z=solve(K,Math.min(L.S,30),rnd);const code=CODE(O[0].d.v);return pick(d=>{if(d.seat===K.seat)return held[d.v]?2+(held[d.v]||0):-5;let p=0;for(const st of K.stands)if(st.owner===d.seat)st.slots.forEach((x,k)=>{if(!x.cut)p=Math.max(p,pAt(Z,st.i,k,code))});return p+rnd()*.05})}
    return pickDesignee(K,rnd,L,O,held)}
  case 'declare':if(L.think>=1)return pickDeclare(K,rnd,L,O,held);
  case 'robotGo':{const Z=solve(K,Math.min(L.S,40),rnd);return pick(d=>{const v=d.v!=null?d.v:(K.ms.robotLine?K.ms.robotLine.line[d.p]:0);const R=(K.tot[v]||0)-(K.cut[v]||0);if(held[v]===R&&(R===2||R===4))return 5;
    let p=0;for(const st of K.stands)if(st.owner!==K.seat)st.slots.forEach((x,k)=>{if(!x.cut)p=Math.max(p,pAt(Z,st.i,k,CODE(v)))});return p+rnd()*.01})}
  case 'mindCard':{const cards=K.seats[K.seat].cards;if(L.think<1)return pick(d=>{const v=cards[d.i];return (K.cut[v]||0)+rnd()*.5});
    // lay the value the active crewmate is least likely to hold (and so least likely to cut)
    const Z=solve(K,Math.min(L.S,40),rnd);const masks=sampleMasks(K,Z);const a=K.cur;return pick(d=>{const v=cards[d.i];return -pHolds(masks,a,1<<CODE(v))+rnd()*.02})}
  case 'draftCon':return pick(d=>{let n=0;for(const v in held)if(v!=='R'&&CONSTRAINTS[d.c].val(v==='Y'?'Y':+v))n+=held[v];return n+rnd()*.2});
  case 'replaceCon':{const c=K.ms.globCon&&K.ms.globCon.con;const recent=K.hist.slice(-K.np);if(c&&recent.some(h=>h.kind==='skip'))return 1;if(!c||!CONSTRAINTS[c].val)return 0;let ok=0,all=0;for(const v in held){if(v==='R')continue;all+=held[v];if(CONSTRAINTS[c].val(v==='Y'?'Y':+v))ok+=held[v]}return ok*2<all?1:0}
  case 'lineEnd':case 'lineFlip':return pick((d,i)=>{const l=K.ms.line5;const v=q.kind==='lineEnd'?(d.e==='L'?l.vals[0]:l.vals[l.vals.length-1]):(i===0?l.head:(l.end==='L'?l.vals[l.vals.length-1]:l.vals[0]));return (held[v]||0)+rnd()*.2});
  case 'ydraft':case 'numInfo':return pick(d=>(held[d.v]?1:0)+rnd()*.3);
  case 'giftTok':return pick(d=>(d.v==='Y'?.3:1)+rnd());
  case 'transfer':return pick(d=>{const me=K.seats[K.seat];if(!d.n)return me.ox>=2?1:0;if(d.n<0)return me.ox<2?1+K.seats[d.to].ox*.1:-1;return -1});
  case 'potato':{const Z=solve(K,L.think>=2?Math.min(L.S,60):20,rnd);if(L.think<2)return pick(d=>{let p=0;for(const st of K.stands)if(st.owner===d.to)st.slots.forEach((x,k)=>{if(!x.cut)p=Math.max(p,pAt(Z,st.i,k,CODE(d.v)))});return p+rnd()*.01});
    // keep every crewmate able to play: score the chance that each upcoming player holds a value on their cards after the hand-over
    const masks=sampleMasks(K,Z);const order=seatsAfter(K,K.seat);const cm=K.seats.map(q=>(q.cards||[]).filter(v=>!K.fin[v]).reduce((m,v)=>m|1<<CODE(v),0));const w=[1,.8,.6,.45];
    return pick(d=>{const c=cm.slice();c[d.from]&=~(1<<CODE(d.v));c[d.to]|=1<<CODE(d.v);let sc=0;order.forEach((s,i)=>{sc+=(w[i]||.4)*pHolds(masks,s,c[s])});sc+=.5*pHolds(masks,K.seat,c[K.seat]);return sc+rnd()*.005})}
  case 'rotateCon':if(L.think>=1)return pickRotate(K,rnd,L,O);return 0;
  // (proposed engine question, 61: trade a blocking restriction at the start of the turn)
  case 'blockedSwap':return L.think>=1&&stepCost(K)<BOOM&&O.length>1?1:0;
  case 'bkMove':return pick(d=>bunkerOptScore(K,d)+rnd()*.01);
  case 'robotTurn':{const s=K.ms.robotLine;let ahead=0,behind=0;s.line.forEach((v,p)=>{if(K.fin[v])return;if((p-s.at)*s.dir>0)ahead+=held[v]||0;else if(p!==s.at)behind+=held[v]||0});return behind>ahead?1:0}
  default:return 0}}
function pickBy(O,f){let bi=0,bv=-1e9;O.forEach((o,i)=>{const v=f(o.d,i);if(v>bv){bv=v;bi=i}});return bi}
// 18 / 51: who must cut value v. Me: my own best cut. A crewmate: the chance they hold it times what the table publicly knows
// about the wires outside their hand; lacking it costs a step.
function pickDesignee(K,rnd,L,O,held){const v=O[0].d.v;const code=CODE(v);const Z=solve(K,Math.min(L.S,80),rnd,0,L.ch);const masks=sampleMasks(K,Z);const mc=missCost(K);const sc=stepCost(K);
  let Zp=null;const pub=()=>Zp||(Zp=solve(publicK(K),L.think>=2?60:30,rnd));
  return pickBy(O,d=>{if(d.seat===K.seat){if(!held[v])return -sc-.3;return evP(K,bestFor(K,Z,v,myTools(K)),mc)+.02}
    const ph=pHolds(masks,d.seat,1<<code);if(ph<.02)return -sc-.3;const Zq=pub();let hp=0,hr=0;
    for(const st of K.stands){if(st.owner===d.seat)continue;st.slots.forEach((x,k)=>{if(x.cut)return;const p=pAt(Zq,st.i,k,code);if(p>hp){hp=p;hr=pAt(Zq,st.i,k,14)}})}
    // they also see their own hand (and know which values are theirs): a little better than the public view
    hp=Math.min(1,hp+.12*(1-hp));const R=(K.tot[v]||0)-(K.cut[v]||0);let pSolo=0;if(R===2||R===4){let n=0;const hs=[];Z.M.hid.forEach((h,i)=>{if(h.owner===d.seat&&!h.flip)hs.push(i)});
      for(const s of Z.samples){let c=0;for(const i of hs)if(s[i]===code)c++;if(c===R)n++}pSolo=Z.samples.length?n/Z.samples.length:0}
    const pc=Math.max(hp,0);const evc=pc-(1-pc-hr)*mc-hr*redCost(K);return pSolo+(ph-pSolo)*evc-(1-ph)*sc+rnd()*.005})}
// 26: which face-up card to turn over (= the value I must cut now)
function pickDeclare(K,rnd,L,O,held){const Z=solve(K,Math.min(L.S,80),rnd,0,L.ch);const mc=missCost(K);const tools=myTools(K);
  const sc=O.map(o=>{const b=bestFor(K,Z,o.d.v,tools);return {b,ev:evP(K,b,mc)}});
  // hard: a value I can solo stays mine (nobody else can turn its card over): keep it in reserve while another option is nearly safe
  if(L.think>=2&&sc.length>1){const alt=Math.max(...sc.filter(x=>!x.b.solo).map(x=>x.b.p),0);if(alt>=.93)for(const x of sc)if(x.b.solo)x.ev-=.4}
  return pickBy(O,(d,i)=>sc[i].ev+rnd()*.002)}
// 61: rotate the restriction cards so that as many crewmates as possible can play
function pickRotate(K,rnd,L,O){const Z=solve(K,Math.min(L.S,40),rnd);const masks=sampleMasks(K,Z);const T=(K.ms.persCon&&K.ms.persCon.table)||{};
  const cw=[K.captain];{const p=K.seats[K.captain].pos;for(let k=1;k<K.np;k++){const q=K.seats.find(x=>x.pos===(p+k)%K.np);if(q)cw.push(q.i)}}
  const ring=[];for(const s of cw){ring.push({seat:s});if(s===K.captain&&T.L)ring.push({t:'L'})}if(T.R)ring.push({t:'R'});
  const vals=ring.map(x=>x.seat!=null?K.seats[x.seat].con:T[x.t]);const n=ring.length;
  return pickBy(O,d=>{let sc=0;ring.forEach((x,i)=>{if(x.seat==null)return;const q=K.seats[x.seat];if(!q.nUncut)return;const c=d.dir?vals[(i-d.dir+n)%n]:vals[i];sc+=pHolds(masks,x.seat,allowMask(c))});return sc+(d.dir?0:.03)+rnd()*.001})}
// 45: how keen this seat is to call "Snip!" for v (its best cut of v, from its own knowledge)
function volunteerScore(K,v){const L=AILV[K.seats[K.seat].lv]||AILV.normal;const held=heldCounts(K)[v]||0;if(!held)return -1;const R=(K.tot[v]||0)-(K.cut[v]||0);
  if(L.think<1)return held+(R===held?5:0);const Z=solve(K,Math.min(L.S,60),mkRng(kHash(K)^0x45),0,L.ch);const b=bestFor(K,Z,v,myTools(K));return b.p-b.pr*3}
// ---------- the bunker (job 66) ----------
function bkGoalSquare(K){const b=K.ms.bunker;const want={key:[0,'key'],guard:[0,'guard'],stairs:[0,'stairs'],lever:[1,'lever'],doctor:[1,'doctor']}[b.goal];if(!want)return null;if(want[0]!==b.f)return b.f===0?bkFind(0,'stairs'):null;return bkFind(want[0],want[1])}
function bkFind(f,name){const sq=BUNKER.floors[f].squares;for(const k in sq)if(sq[k]===name)return k.split(',').map(Number);return null}
function bkDist(K,r,c){const b=K.ms.bunker;const g=bkGoalSquare(K);if(!g)return 0;const W=(a,z)=>{const F=BUNKER.floors[b.f];const k1=a+'|'+z,k2=z+'|'+a;if(F.walls.includes(k1)||F.walls.includes(k2))return true;if(b.f===0&&!b.door&&(F.door===k1||F.door===k2))return true;if(b.f===1&&b.laser&&F.laser&&(F.laser.includes(k1)||F.laser.includes(k2)))return true;return false};
  const seen={};const Q=[[r,c,0]];seen[r+','+c]=1;while(Q.length){const [y,x,d]=Q.shift();if(y===g[0]&&x===g[1])return d;for(const [dy,dx] of [[-1,0],[1,0],[0,-1],[0,1]]){const y2=y+dy,x2=x+dx;if(y2<0||y2>3||x2<0||x2>2||seen[y2+','+x2]||W(y+','+x,y2+','+x2))continue;
      const sq=BUNKER.floors[b.f].squares[y2+','+x2];const pen=sq==='trap'?2:0;seen[y2+','+x2]=1;Q.push([y2,x2,d+1+pen])}}return 9}
function bunkerOptScore(K,d){const b=K.ms.bunker;if(d.act)return 100;const [dy,dx]={U:[-1,0],D:[1,0],L:[0,-1],R:[0,1]}[d.dir];const r=b.r+dy,c=b.c+dx;const sq=BUNKER.floors[b.f].squares[r+','+c];if(sq==='stairs'&&b.goal!=='stairs')return -50;return -bkDist(K,r,c)-(sq==='trap'?2:0)}
function bunkerBonus(K,v){const b=K.ms.bunker;if(v==='Y'||!b)return 0;const now=bkDist(K,b.r,b.c);const sq=BUNKER.floors[b.f].squares[b.r+','+b.c];if(sq&&sq===b.goal&&BUNKER.action[sq]&&sq!=='lever'&&CONSTRAINTS[b.action].val(v))return 2.5;
  let best=null;for(const d of ['U','D','L','R'])if(CONSTRAINTS[b.sides[d]].val(v)){const [dy,dx]={U:[-1,0],D:[1,0],L:[0,-1],R:[0,1]}[d];const r=b.r+dy,c=b.c+dx;if(r<0||r>3||c<0||c>2)continue;
    const F=BUNKER.floors[b.f];const k1=b.r+','+b.c+'|'+r+','+c,k2=r+','+c+'|'+b.r+','+b.c;if(F.walls.includes(k1)||F.walls.includes(k2)||(b.f===0&&!b.door&&(F.door===k1||F.door===k2))||(b.f===1&&b.laser&&F.laser&&(F.laser.includes(k1)||F.laser.includes(k2))))continue;
    const s2=F.squares[r+','+c];const dist=(s2==='stairs'&&b.goal!=='stairs')?20:bkDist(K,r,c)+(s2==='trap'?2:0);const dl=dist-now;if(best==null||dl<best)best=dl}
  if(best==null)return -.2;return best<0?1.2:best===0?0:-.9}
// ---------- the driver: who acts next in a computer-only (or mixed) game ----------
// returns {seat, m}; handles off-turn shouts, open turn claims (job 10) and volunteers (job 45)
function aiStep(){if(!G||G.over)return null;
  for(const q of G.seats){if(q.human)continue;const K=knowledge(q.i);const t=K.off.find(m=>m.a==='tada');if(t)return {seat:q.i,m:t};
    // other off-turn signals and trades (oxygen thumbs-up, restriction swap)
    if(K.off.length&&!K.legal&&!K.q){const L=AILV[q.lv]||AILV.normal;if(L.think>=1){const m=offTurn(K,mkRng(kHash(K)),L);if(m&&m.a!=='tada'&&!legal(m,q.i))return {seat:q.i,m}}}}
  if(!G.q&&G.step==='claim'){const elig=G.seats.filter(q=>!q.human&&validMoves(q.i).some(m=>m.a==='claim'));if(!elig.length)return null;let best=elig[0],bv=-1;
    for(const q of elig){const K=knowledge(q.i);const sc=quickCertain(K);if(sc>bv){bv=sc;best=q}}return {seat:best.i,m:{a:'claim'}}}
  if(!G.q&&G.step==='snip'){let best=null,bv=-1;for(const q of G.seats){if(q.human)continue;const K=knowledge(q.i);const v=K.ms.volunteer.v;const sc=volunteerScore(K,v);if(sc<0)continue;if(sc>bv){bv=sc;best=q}}
    if(best)return {seat:best.i,m:{a:'snip'}};const red=G.seats.find(q=>!q.human&&validMoves(q.i).some(m=>m.a==='snipReveal'));if(red)return {seat:red.i,m:{a:'snipReveal'}};return {seat:G.captain,m:{a:'nosnip'}}}
  const s=sideToAct();if(s<0)return null;if(SP(s).human)return null;const m=aiMove(s);return m?{seat:s,m}:null}
function quickCertain(K){const held=heldCounts(K);let sc=0;for(const v in held){const R=(K.tot[v]||0)-(K.cut[v]||0);if(held[v]===R&&(R===2||R===4))sc=Math.max(sc,3)}
  for(const st of K.stands)if(!st.mine)for(const x of st.slots){if(x.cut)continue;const nt=x.tok.find(t=>t.t==='n');const v=x.v!=null?x.v:nt?nt.v:null;if(v!=null&&held[v])sc=Math.max(sc,2)}return sc+Math.min(1,Object.keys(held).length/20)}
// ---------- "what we know": for the human's helper panel ----------
function whatWeKnow(seat,samples){const K=knowledge(seat);const rnd=mkRng(kHash(K));const Z=solve(K,samples||80,rnd);
  const slots=[];Z.M.hid.forEach((h,i)=>{const poss={};for(let c=1;c<=14;c++)if(Z.P[i][c]>0.004)poss[VN(UNCODE(c))]=Math.round(Z.P[i][c]*100)/100;
    const can=[...new Set(Z.M.T.filter((T,t)=>Z.M.ok[i][t]).map(T=>VN(UNCODE(T.code))))];slots.push({st:h.st,k:h.k,owner:h.owner,possible:can,prob:poss,certain:Object.keys(poss).length===1?Object.keys(poss)[0]:null})});
  let suggestion=null;if(K.legal){const L=AILV.hard;const m=mainDecision(K,mkRng(kHash(K)),L);suggestion={m,text:describeMove(m),why:explain(K,Z,m)}}
  return {slots,consistent:Z.exact&&Z.M.bad===0,samples:Z.samples.length,suggestion}}
function explain(K,Z,m){if(!m)return '';if(m.a==='solo')return 'All remaining wires of that value are in your hand: a solo cut cannot fail.';
  if(m.a==='dual'){const code=CODE(m.v);if(m.ks.length===1){const p=pAt(Z,m.st,m.ks[0],code);return p>=.999?`Certain: that wire must be ${VN(m.v)} from the sorted order and what is known.`:`Best odds: ${Math.round(p*100)}% that it is ${VN(m.v)}${m.v2!=null?' or '+VN(m.v2):''}.`}
    const p=pJoint(Z,m.ks.map(k=>[m.st,k]),vs=>vs.some(c=>c===code||c===CODE(m.v2)));return `${Math.round(p*100)}% that one of the pointed wires is ${VN(m.v)}.`}
  if(m.a==='eq')return `${EQUIP[m.id].n} is worth using now.`;if(m.a==='multi')return 'The all-at-once action looks safe.';return 'Best available option.'}
