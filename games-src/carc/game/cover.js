// coverage: every tile type placed, every feature type scored, every expansion rule fired; mixed AI/random play;
// checkInvariants after EVERY move, full graph rebuild every 25 moves, probe-vs-real check on every placement
const fs=require('fs'),vm=require('vm');const D=__dirname+'/src/';
const src=['data.js','geo.js','engine.js','ai.js'].map(f=>fs.readFileSync(D+f,'utf8')).join('\n')+`;
globalThis.__C={};const __c=k=>__C[k]=(__C[k]||0)+1;
var __rb=0;{const a=rebuildCheck;rebuildCheck=()=>{__rb=1;try{return a()}finally{__rb=0}}}
{const a=place;place=(t,r,x,y)=>{if(__rb)return a(t,r,x,y);__c('tile:'+TT[t].id);if(TT[t].V.length)__c('river:tile');if(TT[t].lake)__c('river:pond');return a(t,r,x,y)}}
{const a=doFig;doFig=m=>{const T=G.tiles[G.cur.k];__c('fig:'+m.k+':'+TSEG[T.t][m.l].ty);return a(m)}}
{const a=complete;complete=r=>{const F=G.fd[r];const fs=figsIn(r);const s=strength(fs);if(Object.keys(s).length>1)__c('shared-feature');if(majority(fs).length>1)__c('tie-both-score');if(fs.some(f=>f.k==='big'))__c('champion-scored');if(fs.some(f=>f.k==='bld'))__c('mason-home');
  if(F.ty==='C'&&G.ex.tb&&GOODS.some(g=>F.gd[g])){__c('goods-taken');if(!fs.length)__c('goods-taken-no-follower')}if(F.ty==='C'&&F.tiles.length===2)__c('two-tile-town');return a(r)}}
{const a=canPlace;canPlace=(t,r,x,y)=>{const v=a(t,r,x,y);if(!v&&isRiver(t)&&G.rv&&x===G.rv.x+DX[G.rv.d]&&y===G.rv.y+DY[G.rv.d]){const ws=TT[t].V[0].map(e=>(e+r)%4);if(ws.includes(OPP(G.rv.d))&&ws.length===2){const q=riverTurn(t,r);if(q.lt&&q.lt===G.rv.lt)__c('river:uturn-refused')}}return v}}
{const a=startTurn;startTurn=(p,b)=>{if(b)__c('mason-extra-turn');return a(p,b)}}
globalThis.__X={get G(){return G},newGame,setSeed,sideToAct,validMoves,performMove,aiMove,checkInvariants,rebuildCheck,UI,probe,find,TT,key};`;
const N=+process.argv[2]||48;const C={};let errs=0,viol=0,done=0,moves=0,rebuilt=0,probeBad=0;const S={};
const exs=[{},{river:1},{ic:1},{tb:1},{river:1,ic:1},{river:1,tb:1},{ic:1,tb:1},{river:1,ic:1,tb:1}];
for(let g=0;g<N;g++){const ctx={console:{log(){},error:(...a)=>{errs++;if(errs<5)console.log('ERR',a.join(' ').slice(0,300))}},Math,JSON,Date};vm.createContext(ctx);vm.runInContext(src,ctx);const X=ctx.__X;
  X.setSeed(7000+g);const ex=exs[g%exs.length];let np=2+(g>>3)%5;if(np===6&&!ex.ic)np=5;const L=['easy','normal','hard'];const rnd=a=>a[Math.floor(Math.random()*a.length)];X.UI.sim=1;
  try{X.newGame({np,mode:'ai',ex,lv:Array.from({length:np},(_,i)=>L[(i+g)%3])});let n=0;
    while(!X.G.over&&n++<2000){const s=X.sideToAct();const vm_=X.validMoves(s);let m=Math.random()<.3?rnd(vm_):X.aiMove(s);
      let pr=null,pk=null;if(m.act==='place'){pr=X.probe(X.G.cur.t,m.r,m.x,m.y);pk=X.key(m.x,m.y)}
      const r=X.performMove(m,s);moves++;if(!r.success){errs++;if(errs<5)console.log('REJ',r.error);break}
      if(pr){const T=X.G.tiles[pk];for(const gp of pr.groups){if(gp.ty!=='C'&&gp.ty!=='R')continue;const F=X.G.fd[X.find(T.s0+gp.segs[0])];if(!F||(!F.done&&(F.tiles.length!==gp.tiles||F.oe.length!==gp.oe.length))){probeBad++}}}
      const iv=X.checkInvariants();if(iv.length){viol++;if(viol<5)console.log('INV',iv[0],JSON.stringify(m))}
      if(n%25===0){rebuilt++;const rb=X.rebuildCheck();if(rb.length){viol++;if(viol<5)console.log('REBUILD',rb[0])}}}
    if(X.G.over){done++;for(const k in X.G.stats.scored)S[k]=(S[k]||0)+X.G.stats.scored[k];if(X.G.stats.discards)C['discard']=(C['discard']||0)+X.G.stats.discards;if(np===6)C['six-players']=(C['six-players']||0)+1}else console.log('unfinished',g)}
  catch(e){errs++;if(errs<6)console.log('EXC',e.stack.split('\n').slice(0,3).join(' | '))}
  for(const k in ctx.__C)C[k]=(C[k]||0)+ctx.__C[k]}
console.log(`games ${N} finished ${done} moves ${moves} errors ${errs} invariant-fails ${viol} rebuild-checks ${rebuilt} probe-mismatches ${probeBad}`);
// wanted coverage
const vm2={};vm.createContext(vm2);vm.runInContext(fs.readFileSync(D+'data.js','utf8')+';globalThis.T=TT',vm2);
const want=vm2.T.map(t=>'tile:'+t.id).filter(k=>k!=='tile:RI_s');
const wantS=['road','road+tavern','town','town+basilica','priory','end-road','end-town','end-priory','end-road-zero','end-town-zero','field','field+hog','goods-majority'];
const wantR=['river:tile','river:pond','river:uturn-refused','fig:f:R','fig:f:C','fig:f:M','fig:f:F','fig:big:C','fig:big:R','fig:bld:C','fig:bld:R','fig:pig:F','mason-extra-turn','mason-home','champion-scored','goods-taken','goods-taken-no-follower','shared-feature','tie-both-score','two-tile-town','six-players'];
const miss=want.filter(k=>!C[k]);console.log('tile types placed:',want.length-miss.length,'of',want.length,miss.length?'MISSING '+miss.join(' '):'(all; the spring is laid at setup)');
const missS=wantS.filter(k=>!S[k]);console.log('scoring rules fired:',wantS.map(k=>k+'='+(S[k]||0)).join(' '),missS.length?'MISSING '+missS.join(' '):'');
const missR=wantR.filter(k=>!C[k]);console.log('expansion/figure rules fired:',wantR.map(k=>k+'='+(C[k]||0)).join(' '),missR.length?'MISSING '+missR.join(' '):'');
console.log('discards (unplaceable tiles set aside):',C['discard']||0);
console.log('MISSING TOTAL',miss.length+missS.length+missR.length);
