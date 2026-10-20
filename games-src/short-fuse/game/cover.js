// Coverage: mixed AI and random legal play over every job and player count, checkInvariants() after EVERY move.
// Proves every equipment card, character, restriction, challenge and job rule actually fires.  node cover.js [seeds] [fromJob] [toJob] [out.json]
const {load}=require('./tools/load');const fs=require('fs');
const A=process.argv.slice(2);const seeds=+A[0]||2,from=+A[1]||1,to=+A[2]||66,outF=A[3]||null;
const instr=`;
globalThis.__C={};const __c=k=>{__C[k]=(__C[k]||0)+1};
const __sig=()=>G?(G.log.length+'|'+JSON.stringify(G.ms)+'|'+G.dial+'|'+(G.q?G.q.kind:'')+'|'+G.ag.length+'|'+JSON.stringify(G.tfx)+'|'+G.over):'';
for(const k in RH)for(const h in RH[k]){const f=RH[k][h];if(typeof f!=='function')continue;RH[k][h]=function(...a){const b=__sig();const r=f.apply(this,a);
  if((r!=null&&r!==false&&r!==''&&r!==0)||__sig()!==b)__c('rule:'+k+':'+h);return r}}
{const a=useEq;useEq=id=>{__c('eq:'+id);return a(id)}}
{const a=AG.instant;AG.instant=d=>{__c('eq:'+d.id);return a(d)}}
{const a=useItem;useItem=s=>{__c('item:'+itemOf(s));__c('char:'+SP(s).ch);return a(s)}}
{const a=conVal;conVal=(s,v)=>{const r=a(s,v);if(!r)for(const c of consOf(s))if(CONSTRAINTS[c].val&&!CONSTRAINTS[c].val(v))__c('con:'+c);return r}}
{const F={noTools:'G',silent:'H',noRight:'I',noLeft:'J',noSolo:'K',double:'L'};const a=conFlag;conFlag=(s,f)=>{const r=a(s,f);if(r)__c('con:'+F[f]);return r}}
{const a=metChallenge;metChallenge=id=>{__c('chal:'+id);return a(id)}}
{const a=QH.dualHit;QH.dualHit=d=>{__c('core:dual hit');if(d.tool)__c('core:probe '+d.tool+' hit');if(d.two)__c('core:probe '+d.two+' hit');return a(d)}}
{const a=cv;cv=id=>{const r=a(id);if(r==='R'&&WIRES[id].c==='b')__c('rule:fakeRed:cv');return r}}
{const a=checkUnlocks;checkUnlocks=()=>{const b=G.eq.map(e=>e.cover);a();G.eq.forEach((e,i)=>{if(b[i]!=null&&e.cover==null)__c('rule:eqCover:clear')})}}
{const a=putTok;putTok=(si,sl,t,m)=>{if(t&&G.ms.memory)__c('rule:memory:side');return a(si,sl,t,m)}}
{const a=itemOK;itemOK=(s,it)=>{const r=a(s,it);if(r&&it==='dd'&&SP(s).chUsed)__c('rule:unlimitedDD:reuse');return r}}
{const a=dualMiss;dualMiss=d=>{__c('core:dual miss');return a(d)}}
{const a=doSolo;doSolo=(s,m)=>{__c('core:solo cut');return a(s,m)}}
{const a=revealReds;revealReds=s=>{__c('core:reveal reds');return a(s)}}
{const a=explode;explode=w=>{if(!G.over)__c('end:'+(w.includes('red')?'red wire':w.includes('fuse')?'fuse burnt':'other boom'));return a(w)}}
{const a=checkWin;checkWin=()=>{const b=G.over;a();if(!b&&G.over&&G.over.win)__c('end:win')}}
{const a=unlockEq;unlockEq=e=>{__c('core:unlock');return a(e)}}
{const a=putTok;putTok=(si,sl,t,m)=>{if(t)__c('tok:'+t.t+(m||G.ms.memory?':side':''));return a(si,sl,t,m)}}
{const a=sideTok;sideTok=(si,v,mean)=>{__c('tok:side '+mean);return a(si,v,mean)}}
{const a=sweep;sweep=(v,b)=>{__c('core:sweep');return a(v,b)}}
{const a=insertSlot;insertSlot=(si,sl)=>{__c('core:sorted insert');return a(si,sl)}}
`;
const X=load(['data.js','engine.js','ai.js'],instr);
const C={};let errs=0,viol=0,done=0,games=0,moves=0;const perJob={};const t0=Date.now();
const rnd=a=>a[Math.floor(Math.random()*a.length)];
for(let n=from;n<=to;n++)for(const np of [2,3,4,5]){if(!X.MISSIONS[n].pl.includes(np))continue;for(let g=0;g<seeds;g++){
  const seed=50000+n*97+np*13+g;X.setSeed(seed);X.ai.setAiSeed(seed);games++;
  // vary characters so the four new crew members get played from job 31 on
  const chars=[null,'ch_new1','ch_new2','ch_new3','ch_new4'];const pick={};if(n>=31)for(let i=0;i<np;i++)pick[i]=chars[1+((g+i+n)%4)];
  try{X.newGame({np,mission:n,mode:'ai',chars:pick});let k=0;
    while(!X.G.over&&k++<5000){let st=null;
      // sometimes a random off-turn seat uses an any-time card or tool
      if(Math.random()<.08&&!X.G.q){const s=Math.floor(Math.random()*np);if(s!==X.sideToAct()){const vm=X.validMoves(s).filter(m=>m.a==='eq'||m.a==='item'||m.a==='swapCon');if(vm.length)st={seat:s,m:rnd(vm)}}}
      if(!st){const s=X.sideToAct();const r=Math.random();
        if(s>=0&&r<.3){const vm=X.validMoves(s);const sp=vm.filter(m=>m.a!=='dual'&&m.a!=='solo');const m=sp.length&&Math.random()<.5?rnd(sp):vm.length?rnd(vm):null;if(m&&!m.example)st={seat:s,m}}
        if(!st)st=X.ai.aiStep()}
      if(!st){errs++;console.log('STALL',n,np,X.G.step);break}
      const r=X.performMove(st.m,st.seat);moves++;if(!r.success){errs++;if(errs<12)console.log('REJ',n,np,r.error,JSON.stringify(st.m).slice(0,160));break}
      const iv=X.checkInvariants();if(iv.length){viol++;if(viol<12)console.log('INV',n,np,iv[0],JSON.stringify(st.m).slice(0,120));break}}
    if(X.G.over){done++;perJob[n]=(perJob[n]||0)+1;C['job:'+n]=(C['job:'+n]||0)+1}else console.log('unfinished',n,np)}
  catch(e){errs++;if(errs<12)console.log('EXC',n,np,e.stack.split('\n').slice(0,4).join(' | '))}
  }}
// ---- forced scenarios for conditions random play rarely reaches (challenge layouts and validation orders) ----
{const E=X.E;const B=(v,c)=>(v-1)*4+(c||0);
 const lay=(ids,cuts)=>{const G=X.G;const used=ids;G.box=[];for(let id=0;id<70;id++)if(!used.includes(id)&&!G.aside.includes(id))G.box.push(id);G.st.forEach((s,i)=>{s.w=i===0?ids.map(id=>E.newSlot(id)):[];s.side=[]});
   G.st[0].w.forEach((x,k)=>{if(cuts.includes(k))x.cut=1});G.tokSup=E.clone(E.INFO_TOKENS);G.marks=[];G.tot={};for(const id of used){const v=E.cv(id);if(v!=='R')G.tot[v]=(G.tot[v]||0)+1}};
 const cases=[[2,()=>{X.G.hist=[2,4,6,8].map((v,i)=>({seat:i%2,kind:'dual',v,ok:1,turn:i}))}],
  [3,()=>lay([B(1),B(1,1),B(2),B(3),B(3,1),B(4)],[2,5])],
  [5,()=>{X.G.hist=[{seat:0,kind:'solo',v:3,ok:1,turn:1},{seat:1,kind:'solo',v:5,ok:1,turn:2}]}],
  [4,()=>{X.G.valid=[5,6,7]}],
  [6,()=>lay([B(1),B(2),B(3),B(4),B(5),B(6),B(7),B(8),B(9),B(10)],[1,3,5,7,9])],
  [7,()=>{X.G.hist=[8,9,10].map((v,i)=>({seat:i%2,kind:'dual',v,ok:1,turn:i}))}],
  [8,()=>{const c=X.G.ms.chal.find(x=>x.id===8);X.G.valid=c.nums.slice()}],
  [9,()=>lay([B(1),B(3),B(5),B(7),B(9),B(11),B(2)],[6])],
  [10,()=>lay([B(1),B(2),B(3),B(4),B(5),B(6),B(7),B(8),B(9),B(10),B(11)],[1,2,3,4,5,6,7])]];
 {X.setSeed(9001);X.newGame({np:4,mission:55,mode:'ai'});let k=0;while(!X.G.over&&k++<100&&!(X.G.step==='act'&&!X.G.q)){const st=X.ai.aiStep();X.performMove(st.m,st.seat)}
  X.G.ms.chal=[{id:1}];const a=X.G.actor;const t=X.G.st.flatMap((s,si)=>s.w.map((x,k)=>({si,k,x}))).find(o=>X.ctx.ownerOf(o.si)!==a&&!o.x.cut&&X.E.cv(o.x.id)==='R');
  if(t){const r=X.performMove({a:'redcall',s:t.si,k:t.k},a);const met=r.success&&X.G.ms.chalDone.includes(1);console.log('forced challenge 1',met?'met':'NOT MET');if(met)X.ctx.__C['forced:chal:1']=1}else console.log('forced challenge 1: no red on a crewmate stand in this deal')}
 for(const [id,fn] of cases){X.setSeed(9000+id);X.newGame({np:4,mission:55,mode:'ai'});X.G.ms.chal=[{id,nums:id===8?[3,9]:undefined}];fn();X.G.dial=2;X.ctx.checkChallenges();
   const met=X.G.ms.chalDone.includes(id);console.log('forced challenge',id,met?'met':'NOT MET');if(met)X.ctx.__C['forced:chal:'+id]=1}}
for(const k in X.ctx.__C)C[k]=(C[k]||0)+X.ctx.__C[k];
const want=[];
for(const id of ['eq1','eq2','eq3','eq4','eq5','eq6','eq7','eq8','eq9','eq10','eq11','eq12','eqY','eq22','eq33','eq99','eq1010','eq1111'])want.push('eq:'+id);
for(const k of ['dd','sweep','handsets','pt3','pt10'])want.push('item:'+k);
for(const c of ['ch_captain','ch_base1','ch_base2','ch_base3','ch_base4','ch_new1','ch_new2','ch_new3','ch_new4'])want.push('char:'+c);
for(const c of 'ABCDEFGHIJKL')want.push('con:'+c);for(let i=1;i<=10;i++)want.push('chal:'+i);
for(const k of ['dual hit','dual miss','solo cut','reveal reds','unlock','sweep','sorted insert','probe dd hit','probe eq3 hit','probe eq5 hit','probe eq10 hit'])want.push('core:'+k);
for(const k of ['win','red wire','fuse burnt'])want.push('end:'+k);
for(const k of ['n','y','p','c','f','n:side','side none'])want.push('tok:'+k);
const ruleKeys=[...new Set(Object.values(X.MISSIONS).flatMap(M=>M.rules.map(r=>r.k)))];
for(const k of ruleKeys)want.push('rule:'+k);for(let n=from;n<=to;n++)want.push('job:'+n);
const ruleFired=k=>Object.keys(C).some(x=>x.startsWith('rule:'+k+':')&&!x.endsWith(':setup')&&!x.endsWith(':pub')&&!x.endsWith(':pre')&&!x.endsWith(':post')&&!x.endsWith(':begin'));
const have=k=>k.startsWith('rule:')?ruleFired(k.slice(5)):!!(C[k]||C['forced:'+k]);
const miss=want.filter(k=>!have(k));
console.log(`games ${games} finished ${done} moves ${moves} errors ${errs} invariant-fails ${viol} (checked after every move) time ${((Date.now()-t0)/1000).toFixed(0)}s`);
console.log('MISSING',miss.length?miss.join(' '):'none');
console.log(want.filter(have).map(k=>k+(k.startsWith('rule:')?'':'='+C[k])).join(' '));
if(outF)fs.writeFileSync(outF,JSON.stringify({C,games,done,moves,errs,viol}));
