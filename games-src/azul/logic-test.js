// Headless rules test for Sunglaze: one assertion per numbered rule in RULES-CHECKLIST.md, against the real engine.
// Run: node games-src/azul/logic-test.js   (exit 1 if any rule fails; one line per failure: rule, expected, got)
const fs=require('fs'),path=require('path');
const SRC=path.join(__dirname,'game','src');
const code=fs.readFileSync(path.join(SRC,'data.js'),'utf8')+'\n'+fs.readFileSync(path.join(SRC,'engine.js'),'utf8');
const E=new Function(code+';return {get G(){return G},newGame,setSeed,performMove,validMoves,sideToAct,scoreFloors}')();

const WALLPOS=(k,r)=>(k+r)%5;                 // independent of the engine: colour k column in row r
const CAP=[1,2,3,4,5];
function game(np,seed){E.setSeed(seed||7);E.newGame({np,mode:'hot'});E.G.first=0;E.G.cur=0;return E.G}
function take(src,c,line,j){return E.performMove({act:'take',src,c,j:j||0,line}).success}
function moves(){return E.validMoves()}
// ends the offer: empties kilns, leaves one cobalt in the courtyard that the current player puts on rack 5
// (their mosaic row 5 must not hold cobalt; line defaults to rack 5). markerIn=cur so no Sun token changes hands.
function closeRound(G,line){const s=G.cur;G.fac=G.fac.map(()=>[]);G.ctr=[0];G.markerIn=s;take(-1,0,line===undefined?4:line)}
function fullLine(G,seat,r,c){G.pl[seat].lines[r]=Array(CAP[r]).fill(c)}
function wallRow(p,r,cols){for(const c of cols)p.wall[r][c]=((c-r)%5+5)%5}

const tests=[];const R=(n,name,fn)=>tests.push({n,name,fn});
// ---- setup ----
R(1,'100 tiles, 20 per colour',()=>{const out=[];for(const np of [2,3,4]){const G=game(np);const c=[0,0,0,0,0];[...G.bag,...G.fac.flat()].forEach(t=>c[t]++);out.push(c.join())}return [Array(3).fill('20,20,20,20,20'),out]});
for(const [n,np,f] of [[2,2,5],[3,3,7],[4,4,9]])R(n,np+' players: '+f+' kilns',()=>[f,game(np).fac.length]);
R(5,'kilns hold 4 tiles each',()=>{const out=[];for(const np of [2,3,4])out.push(game(np).fac.every(a=>a.length===4));return [[true,true,true],out]});
R(6,'sack = 100-4*kilns',()=>[[80,72,64],[2,3,4].map(np=>game(np).bag.length)]);
R(7,'Sun token in courtyard, courtyard empty',()=>{const G=game(2);return [['ctr',0],[G.markerIn,G.ctr.length]]});
R(8,'board layout',()=>{const p=game(2).pl[0];return [{caps:CAP,wall:25,empty:true,floor:0,score:0},{caps:p.lines.map((_,r)=>CAP[r]),wall:p.wall.flat().length,empty:p.wall.flat().every(v=>v<0)&&p.lines.every(l=>!l.length),floor:p.floor.length,score:p.score}]});
R(9,'mosaic colour layout',()=>{// for each row/colour, tile a full rack and see which column it lands in
  const exp=[],got=[];for(let r=0;r<5;r++)for(let k=0;k<5;k++){const G=game(2);fullLine(G,0,r,k);G.markerIn=0;
    closeRound(G,r===4?3:4);exp.push(r+'/'+k+'/'+WALLPOS(k,r));const c=G.pl[0].wall[r].findIndex(v=>v===k);got.push(r+'/'+k+'/'+c)}return [exp,got]});
// ---- offer ----
R(10,'kiln: take all of one colour',()=>{const G=game(2);G.fac[0]=[0,0,1,2];take(0,0,2);return [[0,0],G.pl[0].lines[2]]});
R(11,'kiln: others go to courtyard',()=>{const G=game(2);G.fac[0]=[0,0,1,2];take(0,0,2);return [[1,2],G.ctr.slice().sort()]});
R(12,'kiln left empty',()=>{const G=game(2);G.fac[0]=[0,0,1,2];take(0,0,2);return [0,G.fac[0].length]});
R(13,'absent colour illegal',()=>{const G=game(2);G.fac[0]=[0,0,1,1];return [false,take(0,2,0)]});
R(14,'courtyard: take all of one colour',()=>{const G=game(2);G.ctr=[0,0,1,2];take(-1,0,3);return [[1,2],G.ctr.slice().sort()]});
R(15,'first courtyard taker gets Sun on breakage',()=>{const G=game(2);G.ctr=[0,0,1];take(-1,0,3);return [{m:0,f:[6]},{m:G.markerIn,f:G.pl[0].floor}]});
R(16,'later courtyard takers get no Sun',()=>{const G=game(2);G.ctr=[0,0,1,1];take(-1,0,3);take(-1,1,3);return [{m:0,f1:[]},{m:G.markerIn,f1:G.pl[1].floor}]});
R(17,'Sun counts in breakage penalty (-8)',()=>{const G=game(2);const p=G.pl[0];p.score=20;p.floor=[6,0,0,0,0];G.markerIn=0;E.scoreFloors();return [12,p.score]});
R(18,'kiln take gives no Sun',()=>{const G=game(2);G.fac[0]=[0,1];take(0,0,0);return [['ctr',[]],[G.markerIn,G.pl[0].floor]]});
R(19,'turn order wraps',()=>{const G=game(3);G.cur=1;G.fac[0]=[0,0,1,1];G.fac[1]=[2,2,3,3];G.fac[2]=[4,4,0,0];take(0,0,4);const a=G.cur;take(1,2,4);const b=G.cur;take(2,4,4);return [[2,0,1],[a,b,G.cur]]});
R(20,'all taken tiles to one rack',()=>{const G=game(2);G.fac[0]=[0,0,0,1];take(0,0,2);const p=G.pl[0];return [[[],[],[0,0,0],[],[]],p.lines]});
R(21,'overflow to breakage',()=>{const G=game(2);G.fac[0]=[0,0,0,1];take(0,0,1);const p=G.pl[0];return [{l:[0,0],f:[0]},{l:p.lines[1],f:p.floor}]});
function mvLines(G,c){return [...new Set(E.validMoves().filter(m=>m.c===c&&m.src===0).map(m=>m.line))].sort()}
R(22,'one colour per rack',()=>{const G=game(2);G.fac[0]=[2,2,3];G.pl[0].lines[1]=[1];return [false,mvLines(G,2).includes(1)]});
R(23,'colour already in mosaic row blocked',()=>{const G=game(2);G.fac[0]=[0,0,3];G.pl[0].wall[2][WALLPOS(0,2)]=0;const l=mvLines(G,0);return [{blocked:true,others:true},{blocked:!l.includes(2),others:l.includes(1)&&l.includes(3)}]});
R(24,'full rack takes no more',()=>{const G=game(2);G.fac[0]=[0,0,3];G.pl[0].lines[0]=[0];return [false,mvLines(G,0).includes(0)]});
R(25,'same colour onto part-filled rack',()=>{const G=game(2);G.fac[0]=[1,1,3];G.pl[0].lines[2]=[1];take(0,1,2);return [[1,1,1],G.pl[0].lines[2]]});
R(26,'breakage always legal',()=>{const G=game(2);G.fac[0]=[0,0,3];for(let r=0;r<5;r++){G.pl[0].lines[r]=Array(CAP[r]).fill(4);}return [true,mvLines(G,0).includes(5)]});
R(27,'breakage holds 7, rest to shard box',()=>{const G=game(2);G.fac[0]=[0,0,3];G.markerIn=1;G.pl[0].floor=[0,0,0,0,0,0,0];const lid=G.lid.length;take(0,0,5);return [{f:7,lid:lid+2},{f:G.pl[0].floor.length,lid:G.lid.length}]});
R(28,'Sun taken even if all tiles to breakage',()=>{const G=game(2);G.ctr=[0,0,1];take(-1,0,5);return [{m:0,f:[6,0,0]},{m:G.markerIn,f:G.pl[0].floor}]});
R(29,'no passing: every move is a take',()=>{const G=game(2);return [true,E.validMoves().length>0&&E.validMoves().every(m=>m.act==='take')]});
R(30,'offer ends only when all empty',()=>{const G=game(2);G.fac=[[0,0],[1],[],[],[]];G.ctr=[];G.markerIn=0;take(0,0,4);const mid=G.rsum;take(1,1,3);return [[undefined,true],[mid,!!G.rsum||G.round>1]]});
R(31,'Sun alone in courtyard not a source',()=>{const G=game(2);return [false,E.validMoves().some(m=>m.src===-1)]});
// ---- wall-tiling ----
R(32,'full rack: tile to mosaic space of its colour',()=>{const G=game(2);fullLine(G,0,2,1);closeRound(G);return [1,G.pl[0].wall[2][WALLPOS(1,2)]]});
R(33,'rest of the rack to shard box',()=>{const G=game(2);fullLine(G,0,2,1);const l=G.lid.length;closeRound(G);return [l+2,G.lid.length]});
R(34,'incomplete racks unchanged',()=>{const G=game(2);G.pl[0].lines[3]=[2,2];closeRound(G);return [[[2,2],[0]],[G.pl[0].lines[3],G.pl[0].lines[4]]]});
function scoreCase(setup){const G=game(2);const p=G.pl[0];setup(G,p);closeRound(G);return p.score}
R(35,'isolated tile = 1',()=>[1,scoreCase((G,p)=>fullLine(G,0,0,0))]);
R(36,'horizontal run',()=>[3,scoreCase((G,p)=>{fullLine(G,0,0,0);wallRow(p,0,[1,2])})]);
R(37,'vertical run',()=>[3,scoreCase((G,p)=>{fullLine(G,0,0,0);p.wall[1][0]=4;p.wall[2][0]=3})]);
R(38,'both runs add',()=>[6,scoreCase((G,p)=>{fullLine(G,0,0,0);wallRow(p,0,[1,2]);p.wall[1][0]=4;p.wall[2][0]=3})]);
R(39,'gap stops a run',()=>[1,scoreCase((G,p)=>{fullLine(G,0,0,4);wallRow(p,0,[0,1])})]);
R(40,'breakage penalty table',()=>{const exp=[-1,-2,-4,-6,-8,-11,-14],got=[];for(let n=1;n<=7;n++){const G=game(2);const p=G.pl[0];p.score=20;p.floor=Array(n).fill(0);G.markerIn='ctr';E.scoreFloors();got.push(p.score-20)}return [exp,got]});
R(41,'penalty after scoring, floor at 0',()=>{const G=game(2);const p=G.pl[0];p.score=1;p.floor=[0,0,0];G.markerIn='ctr';E.scoreFloors();return [0,p.score]});
R(42,'breakage tiles to shard box',()=>{const G=game(2);const p=G.pl[0];p.floor=[0,1,2];G.markerIn='ctr';const l=G.lid.length;E.scoreFloors();return [{lid:l+3,f:0},{lid:G.lid.length,f:p.floor.length}]});
R(43,'Sun returns to courtyard',()=>{const G=game(2);const p=G.pl[1];p.floor=[6,0];G.markerIn=1;const l=G.lid.length;E.scoreFloors();return [{m:'ctr',lid:l+1},{m:G.markerIn,lid:G.lid.length}]});
R(44,'Sun holder starts next round',()=>{const G=game(2);G.pl[1].floor=[6];G.markerIn=1;G.first=0;closeRound(G);return [{first:1,cur:1},{first:G.first,cur:G.cur}]});
R(45,'all players tiled and scored',()=>{const G=game(2);fullLine(G,0,0,0);fullLine(G,1,1,1);closeRound(G);return [[1,1],G.pl.map(p=>p.score)]});
// ---- refill ----
R(46,'refill every kiln with 4',()=>{const G=game(2);closeRound(G);return [Array(5).fill(4),G.fac.map(a=>a.length)]});
R(47,'round counter +1',()=>{const G=game(2);closeRound(G);return [2,G.round]});
R(48,'empty sack refills from shard box',()=>{const G=game(2);G.bag=[0,1,2];G.lid=Array(40).fill(3);G.lid=G.lid.map((_,i)=>i%5);closeRound(G);return [{f:Array(5).fill(4),first3:[2,1,0],lid:0,bag:23},{f:G.fac.map(a=>a.length),first3:G.fac[0].slice(0,3),lid:G.lid.length,bag:G.bag.length}]});
R(49,'shard box kept while sack has tiles',()=>{const G=game(2);G.bag=Array(40).fill(1);G.lid=Array(10).fill(2);closeRound(G);return [{lid:10,bag:20},{lid:G.lid.length,bag:G.bag.length}]});
R(50,'both empty: kilns stay short',()=>{const G=game(2);G.bag=[0,1,2,3,4,0];G.lid=[];closeRound(G);return [[4,2,0,0,0],G.fac.map(a=>a.length)]});
// ---- end ----
R(51,'row complete ends game after tiling',()=>{const G=game(2);wallRow(G.pl[0],0,[1,2,3,4]);fullLine(G,0,0,0);closeRound(G);return [true,!!G.over]});
R(52,'no row: game goes on',()=>{const G=game(2);fullLine(G,0,0,0);closeRound(G);return [{over:false,round:2},{over:!!G.over,round:G.round}]});
R(53,'column alone does not end',()=>{const G=game(2);for(let r=1;r<5;r++)G.pl[0].wall[r][0]=((0-r)%5+5)%5;fullLine(G,0,0,0);closeRound(G);return [false,!!G.over]});
function endCase(setup){const G=game(2);setup(G,G.pl[0],G.pl[1]);closeRound(G);return G}
R(54,'+2 per row',()=>{const G=endCase((G,p)=>{wallRow(p,0,[0,1,2,3,4]);p.score=10});return [12,G.pl[0].score]});
R(55,'+7 per column',()=>{const G=endCase((G,p)=>{wallRow(p,0,[0,1,2,3,4]);for(let r=1;r<5;r++)p.wall[r][0]=((0-r)%5+5)%5;p.score=10});return [10+2+7,G.pl[0].score]});
R(56,'+10 per full colour',()=>{const G=endCase((G,p)=>{wallRow(p,0,[0,1,2,3,4]);for(let r=1;r<5;r++)p.wall[r][WALLPOS(1,r)]=1;p.score=10});return [10+2+10,G.pl[0].score]});
R(57,'bonus after final penalty clamp',()=>{const G=endCase((G,p)=>{wallRow(p,0,[0,1,2,3,4]);p.score=0;p.floor=[0,0]});return [2,G.pl[0].score]});
R(58,'highest score wins',()=>{const G=endCase((G,p,q)=>{wallRow(p,0,[0,1,2,3,4]);wallRow(q,0,[0,1,2,3,4]);p.score=30;q.score=20});return [[0],G.over&&G.over.win]});
R(59,'tie: more rows wins',()=>{const G=endCase((G,p,q)=>{wallRow(p,0,[0,1,2,3,4]);wallRow(p,1,[0,1,2,3,4]);wallRow(q,0,[0,1,2,3,4]);p.score=10;q.score=12});return [[14,14,[0]],[G.pl[0].score,G.pl[1].score,G.over&&G.over.win]]});
R(60,'tie on score and rows: shared',()=>{const G=endCase((G,p,q)=>{wallRow(p,0,[0,1,2,3,4]);wallRow(q,0,[0,1,2,3,4]);p.score=10;q.score=10});return [[0,1],G.over&&G.over.win.slice().sort()]});
R(61,'last round: everyone finishes tiling',()=>{const G=game(2);G.first=0;wallRow(G.pl[0],0,[1,2,3,4]);fullLine(G,0,0,0);G.pl[1].score=5;fullLine(G,1,1,1);G.pl[1].floor=[0,0];closeRound(G);return [{over:true,s1:4,rack:[]},{over:!!G.over,s1:G.pl[1].score,rack:G.pl[1].lines[1]}]});

// ---- run ----
const md=fs.readFileSync(path.join(__dirname,'RULES-CHECKLIST.md'),'utf8');
const mdN=(md.match(/^\d+\. /gm)||[]).length;
let pass=0;const fails=[];
tests.sort((a,b)=>a.n-b.n);
const seen=new Set(tests.map(t=>t.n));
for(let i=1;i<=mdN;i++)if(!seen.has(i))fails.push(`rule ${i}: no test`);
for(const t of tests){let exp,got;try{[exp,got]=t.fn()}catch(e){exp='no exception';got='threw '+e.message}
  if(JSON.stringify(exp)===JSON.stringify(got))pass++;else fails.push(`rule ${t.n} (${t.name}): expected ${JSON.stringify(exp)}, got ${JSON.stringify(got)}`)}
console.log(fails.join('\n'));
console.log(`logic-test: ${pass}/${mdN} rules pass (${tests.length} tests, ${mdN} rules in checklist)`);
process.exit(pass===mdN&&tests.length===mdN?0:1);
