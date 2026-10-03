// coverage: every rule actually fires in mixed AI/random play, invariants (incl. tile conservation) after every move; plus exact rule scenarios
const fs=require('fs'),vm=require('vm');const D=__dirname+'/src/';
const src=['data.js','engine.js','ai.js'].map(f=>fs.readFileSync(D+f,'utf8')).join('\n')+`;
globalThis.__C={};const __c=k=>__C[k]=(__C[k]||0)+1;
{const a=applyTake;applyTake=(S,seat,m)=>{const r=a(S,seat,m);if(S===G){__c(m.src<0?'take:courtyard':'take:kiln');if(r.sun)__c('sun:taken');if(r.sun&&r.lid)__c('sun:full-breakage-displaces');if(m.line===5)__c('take:straight-to-breakage');else if(r.fl)__c('take:overflow-to-breakage');if(r.lid)__c('breakage:overflow-to-shard-box');if(m.c===PRISM)__c('prism:only');else if(r.nj)__c('prism:with-glaze');if(m.src>=0&&S.ctr.length)__c('kiln:rest-to-courtyard')}return r}}
{const a=placeWall;placeWall=(p,r,c)=>{const L=p.lines[r];const pj=L.includes(PRISM),lc=lineColour(L);const before=p.score;a(p,r,c);const pts=p.score-before;
  const w=p.wall;let h=0,v=0;for(let x=0;x<5;x++)if(x!==c&&w[r][x]>=0&&Math.abs(x-c)===1)h=1;for(let y=0;y<5;y++)if(y!==r&&w[y][c]>=0&&Math.abs(y-r)===1)v=1;
  __c('wall:'+(h&&v?'both-lines':h?'row-line':v?'column-line':'isolated'));if(pts>=6)__c('wall:chain>=6');if(pj)__c(lc<0?'prism:all-prism-rack-to-wall':'prism:to-wall-on-glaze');if(G.ex.gray)__c('gray:placed')}}
{const a=lineToFloor;lineToFloor=(p,r)=>{__c('gray:rack-blocked-to-breakage');a(p,r)}}
{const a=scoreFloors;scoreFloors=()=>{for(const p of G.pl){if(p.floor.length){__c('breakage:penalty');if(-floorPenalty(p.floor.length)>p.score)__c('breakage:clamped-at-0');if(p.floor.length===7)__c('breakage:all-7')}}a()}}
{const a=draw;draw=()=>{const e=!G.bag.length;const r=a();if(e&&r>=0)__c('sack:refilled-from-shard-box');if(r<0)__c('sack:ran-dry');return r}}
{const a=newRound;newRound=()=>{a();if(G.fac.some(f=>f.length<PER_FACTORY))__c('round:short-kilns')}}
{const a=finish;finish=()=>{a();__c('end:game');const b=G.pl.map(p=>endBonus(p));if(b.some(x=>x.rows))__c('end:row-bonus');if(b.some(x=>x.cols))__c('end:column-bonus');if(b.some(x=>x.colours))__c('end:glaze-bonus');if(G.over.tie&&G.over.win.length===1)__c('end:tie-broken-by-rows');if(G.over.win.length>1)__c('end:shared-win')}}
globalThis.__X={get G(){return G},set G(v){G=v},newGame,setSeed,sideToAct,validMoves,performMove,aiMove,checkInvariants,UI,adjPts,floorPenalty,finish,runWall,beginWall,wallCells,endBonus,applyTake,legalTakes,lineOk,newRound,scoreFloors};`;
const N=+process.argv[2]||60;const C={};let errs=0,viol=0,done=0,moves=0;
const mk=()=>{const ctx={console:{log(){},error:(...a)=>{errs++;if(errs<5)console.log('ERR',a.join(' ').slice(0,300))}},Math,JSON,Date};vm.createContext(ctx);vm.runInContext(src,ctx);return ctx};
for(let g=0;g<N;g++){const ctx=mk();const X=ctx.__X;X.setSeed(7000+g);const ex={gray:g%2===1,prism:g%3!==0};const np=2+g%3;const rnd=a=>a[Math.floor(Math.random()*a.length)];
  try{X.newGame({np,mode:'ai',ex,lv:['easy','normal','hard','normal'].slice(0,np)});let n=0;while(!X.G.over&&n++<3000){const s=X.sideToAct();const vm_=X.validMoves(s);
      const pr=g%5===4?.7:.25;const m=Math.random()<pr?rnd(vm_):X.aiMove(s);const r=X.performMove(m,s);moves++;if(!r.success){errs++;if(errs<5)console.log('REJ',r.error);break}
      const iv=X.checkInvariants();if(iv.length){viol++;if(viol<4)console.log('INV',iv[0],JSON.stringify(m))}}
    if(X.G.over)done++;else console.log('unfinished',g)}catch(e){errs++;if(errs<6)console.log('EXC',e.stack.split('\n').slice(0,3).join(' | '))}
  for(const k in ctx.__C)C[k]=(C[k]||0)+ctx.__C[k]}
console.log(`games ${N} finished ${done} moves ${moves} errors ${errs} invariant-fails ${viol}`);
// ---- exact rule scenarios on hand-built states ----
const S={};const ok=(k,c)=>{S[k]=!!c;if(!c)console.log('SCENARIO FAIL',k)};
{const ctx=mk(),X=ctx.__X;X.setSeed(1);X.newGame({np:2,mode:'ai'});const w=[0,1,2,3,4].map(()=>[-1,-1,-1,-1,-1]);
  ok('score: isolated tile = 1',X.adjPts(w,2,2)===1);w[2][0]=0;w[2][1]=0;w[2][3]=0;w[0][2]=0;w[1][2]=0;w[2][2]=0;ok('score: 4 across + 3 down = 7',X.adjPts(w,2,2)===7);
  const w2=[0,1,2,3,4].map(()=>[-1,-1,-1,-1,-1]);w2[0][0]=0;w2[0][1]=1;ok('score: row only = 2',X.adjPts(w2,0,1)===2);
  ok('breakage: 4 tiles + Sun token = -8',X.floorPenalty(5)===-8);ok('breakage: all 7 = -14',X.floorPenalty(7)===-14);ok('breakage: over 7 capped',X.floorPenalty(9)===-14)}
{const ctx=mk(),X=ctx.__X;X.setSeed(2);X.newGame({np:2,mode:'ai'});const G=X.G;G.fac=[[0,0,1,2],[],[],[],[]];G.ctr=[3,3,3];G.markerIn='ctr';const p=G.pl[G.cur];p.floor=[1,1,1,1,1,1,1];const lid0=G.lid.length;
  const info=X.applyTake(G,G.cur,{act:'take',src:-1,c:3,j:0,line:0});ok('sun token taken with a full breakage line displaces a tile to the shard box',p.floor.includes(6)&&p.floor.length===7&&G.lid.length>=lid0+1);
  ok('rest of the courtyard take: 3 obsidian, 1 on rack 1, 2 to shard box',p.lines[0].length===1&&info.lid===3)}
{const ctx=mk(),X=ctx.__X;X.setSeed(3);X.newGame({np:2,mode:'ai'});const G=X.G;const p=G.pl[0];p.wall[0]=[0,1,2,3,4];ok('rack blocked for a glaze its row has',!X.lineOk(G,p,0,2)&&X.lineOk(G,p,1,2))}
{const ctx=mk(),X=ctx.__X;X.setSeed(4);X.newGame({np:2,mode:'ai',ex:{gray:true}});const G=X.G;const p=G.pl[0];p.wall[1][2]=0;p.lines[0]=[0];ok('unmarked mosaic: column rule removes column 3 for Cobalt in row 1',JSON.stringify(X.wallCells(p,0))==='[0,1,3,4]');
  p.wall[0]=[-1,1,2,3,4];p.wall[1]=[0,-1,-1,-1,-1];p.lines[0]=[0];ok('unmarked mosaic: no legal space found',X.wallCells(p,0).length===0)}
{const ctx=mk(),X=ctx.__X;X.setSeed(5);X.newGame({np:2,mode:'ai'});const G=X.G;G.pl[0].score=5;G.pl[1].score=5;G.pl[0].wall[0]=[0,1,2,3,4];G.pl[1].wall[0]=[0,1,2,3,4];G.pl[1].wall[1]=[4,0,1,2,3];
  G.pl[0].score=7;X.finish();ok('tie on points broken by more complete rows',G.over.win.length===1&&G.over.win[0]===1&&G.pl[0].score===G.pl[1].score)}
{const ctx=mk(),X=ctx.__X;X.setSeed(6);X.newGame({np:2,mode:'ai'});const G=X.G;G.pl[0].wall[0]=[0,1,2,3,4];G.pl[1].wall[0]=[0,1,2,3,4];X.finish();ok('equal points and rows: shared win',G.over.win.length===2)}
{const ctx=mk(),X=ctx.__X;X.setSeed(7);X.newGame({np:2,mode:'ai'});const G=X.G;const p=G.pl[0];for(let r=0;r<5;r++)p.wall[r][(0+r)%5]=0;for(let c=0;c<5;c++)p.wall[c][0]=(0-c+5*5)%5;p.wall[0]=[0,1,2,3,4];
  const b=X.endBonus(p);ok('end bonus counts row, column and full glaze',b.rows===1&&b.cols===1&&b.colours===1)}
{const ctx=mk(),X=ctx.__X;X.setSeed(8);X.newGame({np:2,mode:'ai',ex:{prism:true}});const G=X.G;ok('prism setup (2p): 95 glazes + 5 prisms = 100',G.total===100&&G.counts[5]===5&&G.counts[0]===19);
  const ctx2=mk(),Y=ctx2.__X;Y.setSeed(8);Y.newGame({np:3,mode:'ai',ex:{prism:true}});ok('prism setup (3-4p): 90 + 10',Y.G.counts[5]===10&&Y.G.counts[0]===18);
  G.pl[0].wall[0]=[4,-1,-1,-1,-1];G.pl[0].lines[0]=[5];G.phase='wall';G.wt={order:[0,1],k:0,r:0,q:null};G.fac=G.fac.map(()=>[]);G.ctr=[];X.runWall();ok('all-prism rack on the printed mosaic asks for a space',G.wt.q&&G.wt.q.cells.length===4)}
{const ctx=mk(),X=ctx.__X;X.setSeed(9);X.newGame({np:4,mode:'ai'});const G=X.G;const all=G.bag.concat(...G.fac);G.lid=[];G.bag=all.slice(0,10);G.fac=G.fac.map(()=>[]);G.ctr=[];G.pl[0].floor=all.slice(10);X.newRound();X.scoreFloors();
  ok('sack and shard box empty: some kilns stay short',G.fac.filter(f=>f.length<4).length>0&&X.checkInvariants().filter(v=>!/stuck|no legal/.test(v)).length===0)}
{const ctx=mk(),X=ctx.__X;X.setSeed(10);X.newGame({np:2,mode:'ai'});const G=X.G;G.pl[1].score=3;G.pl[1].floor=[0,0,0,0];G.fac=G.fac.map(()=>[]);G.lid.push(...G.ctr.splice(0));X.scoreFloors();ok('score never below 0',G.pl[1].score===0)}
const want=['take:kiln','take:courtyard','kiln:rest-to-courtyard','sun:taken','take:straight-to-breakage','take:overflow-to-breakage','breakage:overflow-to-shard-box','breakage:penalty','breakage:clamped-at-0','breakage:all-7',
 'wall:isolated','wall:row-line','wall:column-line','wall:both-lines','wall:chain>=6','gray:placed','gray:rack-blocked-to-breakage','prism:only','prism:with-glaze','prism:to-wall-on-glaze','prism:all-prism-rack-to-wall',
 'sack:refilled-from-shard-box','end:game','end:row-bonus','end:column-bonus','end:glaze-bonus'];
const miss=want.filter(k=>!C[k]);console.log('MISSING in play',miss.length?miss.join(' '):'none');console.log('in play:',Object.entries(C).sort().map(([k,v])=>k+'='+v).join(' '));
console.log('scenarios:',Object.keys(S).length,'pass',Object.values(S).filter(Boolean).length);for(const k in S)console.log(' ',S[k]?'PASS':'FAIL',k);
