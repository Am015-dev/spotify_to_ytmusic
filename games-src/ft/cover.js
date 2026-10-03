// coverage: every djinn power/passive, item, cutpurse, tile action and question kind actually fires; mixed AI/random play; invariants checked every move
const fs=require('fs'),vm=require('vm');const D=__dirname+'/src/';
const src=['data.js','djinns.js','engine.js','ai.js'].map(f=>fs.readFileSync(D+f,'utf8')).join('\n')+`;
globalThis.__C={};const __c=k=>__C[k]=(__C[k]||0)+1;
{const a=runDjinn;runDjinn=(p,m)=>{__c('power:'+m.k);return a(p,m)}}
{const a=useItem;useItem=(p,m)=>{__c('item:'+m.k);return a(p,m)}}
{const a=useThief;useThief=(p,m)=>{__c('thief:'+m.k);return a(p,m)}}
{const a=gainDjinn;gainDjinn=(p,k)=>{__c('gain:'+k);return a(p,k)}}
{const a=ask;ask=(w,t,o,e)=>{if(o.length)__c('q:'+((e&&e.kind)||'?'));return a(w,t,o,e)}}
{const a=trig;trig=(k,ac,d)=>{const before=G.pl.map(q=>q.coins+q.res.length);a(k,ac,d);G.pl.forEach((q,i)=>{if(q.coins+q.res.length!==before[i])__c('passive:'+trigDj(k))})}}
{const a=doTile;doTile=m=>{const t=G.board[G.act.tile];__c("tile:"+t.k+(m.skip?":skip":""));return a(m)}}
globalThis.__X={get G(){return G},newGame,setSeed,sideToAct,validMoves,performMove,aiMove,checkInvariants,UI,scoreOf};`;
const N=+process.argv[2]||40;const C={};let errs=0,viol=0,done=0;
for(let g=0;g<N;g++){const ctx={console:{log(){},error:(...a)=>{errs++;if(errs<5)console.log('ERR',a.join(' ').slice(0,300))}},Math,JSON,Date};vm.createContext(ctx);vm.runInContext(src,ctx);const X=ctx.__X;
  X.setSeed(7000+g);const ex={artisans:g%2===0,sultan:g%3!==0,thieves:g%4!==1,promos:true};const np=2+g%4;const rnd=a=>a[Math.floor(Math.random()*a.length)];
  try{X.newGame({np,mode:'ai',ex});let n=0;while(!X.G.over&&n++<6000){const s=X.sideToAct();const vm_=X.validMoves(s);
      // favour powers, items and cutpurses so every one gets exercised
      const special=vm_.filter(m=>m.act==='djinn'||m.act==='item'||m.act==='thief'||m.thief||m.dj);let m=special.length&&Math.random()<.35?rnd(special):Math.random()<.25?rnd(vm_):X.aiMove(s);
      const r=X.performMove(m,s);if(!r.success){errs++;if(errs<5)console.log('REJ',r.error);break}const iv=X.checkInvariants();if(iv.length){viol++;if(viol<4)console.log('INV',iv[0],JSON.stringify(m))}}
    if(X.G.over)done++;else console.log('unfinished',g)}catch(e){errs++;if(errs<6)console.log('EXC',e.stack.split('\n').slice(0,3).join(' | '))}
  for(const k in ctx.__C)C[k]=(C[k]||0)+ctx.__C[k]}
console.log(`games ${N} finished ${done} errors ${errs} invariant-fails ${viol}`);
const want=[];const DJ=['tamuz','nuraya','qirsh','wahha','burhan','ghulam','dalil','rawda','jamal','ruya','suqra','fath'];
for(const k of ['tamuz','nuraya','qirsh','wahha','burhan','ghulam','rawda','jamal','ruya','suqra','fath'])want.push('power:'+k);
for(const k of ['harith','qasra','khanjar','amir','tariq','dukkan'])want.push('passive:'+k);
for(const k of ['carpet','lamp','flute','scimitar','talisman','horn'])want.push('item:'+k);
for(const k of ['assassin','builder','merchant','vizier','elder','artisan'])want.push('thief:'+k);
for(const k of ['village','sacred','oasis','small','large','workshop','exchange'])want.push('tile:'+k);
const miss=want.filter(k=>!C[k]);console.log('MISSING',miss.length?miss.join(' '):'none');
console.log(Object.entries(C).sort().map(([k,v])=>k+'='+v).join(' '))
