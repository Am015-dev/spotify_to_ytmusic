// hand-built boards: the feature graph (union-find over edges and half-edges) and every scoring rule, with exact expected numbers
const fs=require('fs'),vm=require('vm');const D=__dirname+'/src/';
const src=['data.js','geo.js','engine.js','ai.js'].map(f=>fs.readFileSync(D+f,'utf8')).join('\n')+';globalThis.__X={get G(){return G},set G(v){G=v},newGame,setSeed,performMove,validMoves,canPlace,probe,find,figsIn,finalScores,finish,TT,TSEG,UI,key,checkInvariants,legalPlacements,startTurn,tilesLeft};';
let pass=0,fail=0;const ok=(c,msg)=>{if(c)pass++;else{fail++;console.log('FAIL',msg)}};
function fresh(ex,np){const ctx={console,Math,JSON};vm.createContext(ctx);vm.runInContext(src,ctx);const X=ctx.__X;X.setSeed(5);X.UI.sim=1;X.newGame({np:np||2,mode:'ai',ex:ex||{}});return X}
const id=(X,s)=>{const i=X.TT.findIndex(t=>t.id===s);if(i<0)throw 'no tile '+s;return i};
// play one scripted turn: player p lays tile `tid` at x,y turned r, then an optional figure {k,l}
function play(X,p,tid,x,y,r,fig){const G=X.G;const t=id(X,tid);G.cur={p,t,bonus:false,k:null,bonusEarned:false,figPlaced:null,scored:[]};G.step='place';
  const a=X.performMove({act:'place',x,y,r},p);if(!a.success)return a;if(X.G.step==='fig'&&X.G.cur.p===p&&X.G.cur.k===X.key(x,y)){const b=X.performMove(fig?{act:'fig',k:fig.k,l:fig.l}:{act:'skip'},p);if(!b.success)return b}return a}
const rootOf=(X,x,y,l)=>{const T=X.G.tiles[X.key(x,y)];return X.find(T.s0+l)};const F=(X,x,y,l)=>X.G.fd[rootOf(X,x,y,l)];
// 1. roads ending at junctions (3-way crossings) -> 3 points
{const X=fresh();let r=play(X,0,'BA_RRR',1,0,0,{k:'f',l:2});ok(r.success,'junction east');ok(X.G.pl[0].sup.f===6,'follower used');
 r=play(X,1,'BA_RRR',-1,0,0);ok(r.success,'junction west');ok(X.G.pl[0].score===3,'road junction-to-junction = 3, got '+X.G.pl[0].score);ok(X.G.pl[0].sup.f===7,'wayfarer came home');
 ok(F(X,0,0,1).done===1&&F(X,0,0,1).tiles.length===3,'road feature 3 tiles done');
 // separate road ends at the junction stay separate features
 ok(rootOf(X,1,0,0)!==rootOf(X,1,0,2)&&rootOf(X,1,0,1)!==rootOf(X,1,0,2),'junction road ends are separate');}
// 2. road ending at a priory and at a town gate; follower placed on a road the same tile finishes scores and returns at once
{const X=fresh();play(X,0,'BA_RRR',1,0,0);let r=play(X,1,'BA_LR',2,0,1,{k:'f',l:0});ok(r.success,'priory lane placed');ok(X.G.pl[1].score===2,'junction->priory road = 2, got '+X.G.pl[1].score);ok(X.G.pl[1].sup.f===7,'returned same turn');
 r=play(X,0,'BA_CccR',1,1,2,{k:'f',l:1});ok(r.success,'town gate placed');ok(X.G.pl[0].score===2,'junction->town gate road = 2, got '+X.G.pl[0].score);
 ok(F(X,1,1,0).oe.length===3&&!F(X,1,1,0).done,'three-sided town still open on 3 sides');}
// 3. towns: two separate town pieces on one tile; a 2-tile town scores 4 (current edition)
{const X=fresh();let r=play(X,0,'BA_CFC_2',0,-1,0,{k:'f',l:1});ok(r.success,'two caps placed');ok(X.G.pl[0].score===4,'2-tile town = 4, got '+X.G.pl[0].score);
 ok(rootOf(X,0,-1,0)!==rootOf(X,0,-1,1),'caps on one tile are separate towns');ok(F(X,0,-1,0).oe.length===1&&!F(X,0,-1,0).done,'north cap open');
 const Y=fresh({ic:true});r=play(Y,0,'IC_CCCCG',0,-1,0);ok(r.success,'four caps placed');const roots=new Set([0,1,2,3].map(l=>rootOf(Y,0,-1,l)));ok(roots.size===4,'four separate towns on one tile');
 ok(F(Y,0,-1,3).done===1,'south cap closed with the start town');ok(F(Y,0,-1,4).ty==='F'&&F(Y,0,-1,4).ct.length===4,'inner field touches all four towns');}
// 4. fields split by roads and towns; one town pays two different fields
{const X=fresh();play(X,0,'BA_RFr',1,0,0,{k:'f',l:1});let n=0;for(const r in X.G.fd)if(X.G.fd[r].ty==='F')n++;ok(n===2,'straight road + start: 2 fields, got '+n);
 ok(rootOf(X,1,0,1)===rootOf(X,0,0,2),'north fields joined across the edge');ok(rootOf(X,1,0,2)===rootOf(X,0,0,3),'south fields joined');ok(rootOf(X,1,0,1)!==rootOf(X,1,0,2),'road splits the field');
 play(X,1,'BA_C',0,-1,2);ok(F(X,0,0,0).done===1,'start town closed by a cap');ok(X.G.pl[0].score===0&&X.G.pl[1].score===0,'nobody in the town');
 // farmer for player 1 in the cap tile's field (separate field touching the same town)
 X.G.figs.push({p:1,k:'f',s:X.G.tiles[X.key(0,-1)].s0+1});X.G.pl[1].sup.f--;
 const fsc=X.finalScores();ok(fsc.add[0].field===3,'field north of road pays 3 for the closed town, got '+fsc.add[0].field);ok(fsc.add[1].field===3,'the other field touching the same town also pays 3, got '+fsc.add[1].field);}
// 5. majority: tie scores full for both; a champion (counts 2) beats one follower
for(const big of [false,true]){const X=fresh({ic:true});play(X,0,'BA_CFc_1',0,-1,1,{k:'f',l:0});play(X,0,'BA_L',1,-1,0);let r0=play(X,1,'BA_C',1,-2,3,{k:big?'big':'f',l:0});ok(r0.success,'rival town cap');
 let r=play(X,0,'BA_Cc_1',0,-2,2);ok(r.success,'joining tile');const s0=X.G.pl[0].score,s1=X.G.pl[1].score;
 if(!big)ok(s0===8&&s1===8,'tie: both score the 4-tile town (8), got '+s0+'/'+s1);else ok(s0===0&&s1===8,'champion wins alone, got '+s0+'/'+s1);
 ok(X.G.pl[0].sup.f===7&&X.G.pl[1].sup.f===7&&X.G.pl[1].sup.big===1,'everyone home after scoring')}
// 6. priory: finished when surrounded (9); unfinished at the end = 1 + neighbours
{const X=fresh();const cells=[[0,1],[-1,1],[1,1],[-1,2],[1,2],[-1,3],[0,3],[1,3]];play(X,0,'BA_L',0,1,0,{k:'f',l:1});let okAll=true;for(const [x,y] of cells.slice(1)){const r=play(X,1,'BA_L',x,y,0);okAll=okAll&&r.success}ok(okAll,'ring of priories');
 ok(X.G.pl[0].score===0,'centre not yet placed');const r=play(X,0,'BA_L',0,2,0,{k:'f',l:1});ok(r.success,'centre priory');ok(X.G.pl[0].score===9,'surrounded priory = 9 at once, got '+X.G.pl[0].score);
 const fsc=X.finalScores();ok(fsc.add[0].priory===7,'priory at (0,1) unfinished: 1 + 6 neighbours = 7, got '+fsc.add[0].priory);}
// 7. tavern road 2/tile finished, 0 unfinished; basilica town 3/tile finished, 0 unfinished
{const X=fresh({ic:true});play(X,0,'IC_RFr_iG',1,0,0,{k:'f',l:0});ok(X.G.fd[rootOf(X,1,0,0)].inn===1,'tavern flag on the road');ok(X.finalScores().add[0].road===0,'unfinished tavern road = 0');
 play(X,1,'BA_RRR',2,0,0);play(X,1,'BA_RRR',-1,0,0);ok(X.G.pl[0].score===8,'4-tile tavern road = 8, got '+X.G.pl[0].score);
 play(X,1,'IC_Cccc_c',0,-1,0,{k:'f',l:0});ok(X.finalScores().add[1].town===0,'unfinished basilica town = 0');
 const Y=fresh({ic:true});play(Y,0,'IC_Cccc_c',0,-1,0,{k:'f',l:0});play(Y,1,'BA_C',-1,-1,1);play(Y,1,'BA_C',1,-1,3);let r=play(Y,1,'BA_C',0,-2,2);ok(r.success,'caps around the basilica');ok(Y.G.pl[0].score===15,'5-tile basilica town = 15, got '+Y.G.pl[0].score);}
// 8. banners: 2 each finished, 1 each unfinished
{const X=fresh();play(X,0,'BA_CFcp',0,-1,1,{k:'f',l:0});ok(X.finalScores().add[0].town===3,'unfinished 2 tiles + banner = 3, got '+X.finalScores().add[0].town);play(X,1,'BA_C',0,-2,2);ok(X.G.pl[0].score===8,'3 tiles + banner = 8, got '+X.G.pl[0].score);}
// 9. road loop: four bends close on themselves = 4
{const X=fresh();play(X,0,'BA_Rr',0,1,3,{k:'f',l:0});play(X,1,'BA_Rr',1,1,0);play(X,1,'BA_Rr',0,2,2);ok(X.G.pl[0].score===0,'loop still open');const r=play(X,1,'BA_Rr',1,2,1);ok(r.success,'last bend');ok(X.G.pl[0].score===4,'loop of 4 = 4, got '+X.G.pl[0].score);}
// 10. river: spring first, no two bends the same way in a row, the base start tile goes into the bag
{const X=fresh({river:true});ok(X.G.stack.includes(id(X,'BA_RCr_start')),'start tile shuffled in');ok(X.G.tiles['0,0'].t===id(X,'RI_s'),'spring in the centre');ok(X.G.rstack.length+1===10&&X.G.lake!=null&&X.TT[X.G.cur.t].set==='river','10 river tiles (one in hand) + pond');
 const bend=id(X,'RI_1_II');ok(X.canPlace(bend,0,1,0),'first bend (right) ok');ok(!X.canPlace(bend,0,2,0),'river tile must continue the river');let r=play(X,0,'RI_1_II',1,0,0);ok(r.success,'bend placed');
 ok(!X.canPlace(bend,1,1,1),'second right bend refused (U-turn)');ok(X.canPlace(bend,2,1,1),'left bend allowed');ok(X.canPlace(id(X,'RI_1_IFI'),1,1,1),'straight allowed');
 r=play(X,1,'RI_1_IFI',1,1,1);ok(r.success,'straight');ok(!X.canPlace(bend,1,1,2),'still no second right bend after a straight');ok(!X.canPlace(id(X,'BA_RFr'),0,1,2),'ordinary tiles wait for the river');}
// 11. merchants: whoever closes a town takes its goods even with no follower; majorities 10 each, ties both
{const X=fresh({tb:true});let r=play(X,1,'TB_Cc_w',0,-1,3);// corner town (wine) joined to the start cap: town open
 ok(r.success,'wine town placed');const open=F(X,0,0,0).oe.length;r=play(X,0,'BA_C',-1,-1,1);ok(X.G.pl[0].goods.wine===1&&X.G.pl[1].goods.wine===0,'closer takes the wine (open was '+open+')');
 X.G.pl[1].goods.grain=2;X.G.pl[0].goods.grain=2;const fsc=X.finalScores();ok(fsc.add[0].goods===20&&fsc.add[1].goods===10,'wine majority + grain tie: 20 / 10, got '+fsc.add[0].goods+'/'+fsc.add[1].goods);}
// 12. mason: extra turn when extending its road; never two in a row
{const X=fresh({tb:true});play(X,0,'BA_RFr',1,0,0,{k:'f',l:0});let r=play(X,0,'BA_RFr',2,0,0,{k:'bld',l:0});ok(r.success&&X.G.figs.some(f=>f.k==='bld'),'mason placed on own road');ok(!X.G.stats.bonus,'placing it gives no bonus');
 const G=X.G;G.cur={p:0,t:id(X,'BA_RFr'),bonus:false,k:null,bonusEarned:false,figPlaced:null,scored:[]};G.step='place';X.performMove({act:'place',x:3,y:0,r:0},0);ok(X.G.cur.bonusEarned,'extending the mason road earns a turn');X.performMove({act:'skip'},0);
 ok(X.G.cur.p===0&&X.G.cur.bonus===true,'same player takes the extra turn');}
// 13. hog: +1 per finished town for the field holder
{const X=fresh({tb:true});play(X,0,'BA_C',0,-1,2);const T=X.G.tiles['0,0'];X.G.figs.push({p:0,k:'f',s:T.s0+2});X.G.pl[0].sup.f--;// farmer in the start's north field (touches the closed town)
 let s=X.finalScores();ok(s.add[0].field===3,'farmer alone: 3, got '+s.add[0].field);X.G.figs.push({p:0,k:'pig',s:T.s0+2});X.G.pl[0].sup.pig--;s=X.finalScores();ok(s.add[0].field===4,'with hog: 4, got '+s.add[0].field);}
// 14. an unplaceable tile is set aside and another drawn; every tile still counted once
{const X=fresh();const G=X.G;G.stack.unshift(G.cur.t);G.stack.unshift(id(X,'RI_1_IFI'));G.total++;X.startTurn(1,false);ok(G.disc.length===1&&G.stats.discards===1,'river tile with no river to join is set aside');ok(X.checkInvariants().length===0,'invariants after discard: '+X.checkInvariants().join(';'))}
// 15. the probe predicts exactly what placing does (open edges, tiles) on random boards
{let bad=0,n=0;for(let g=0;g<6;g++){const X=fresh({ic:true,tb:true,river:g%2===0},2+g%3);X.setSeed(40+g);const G0=X.G;let k=0;while(!X.G.over&&k++<60){const s=X.G.cur.p;const moves=X.validMoves(s);const m=moves[Math.floor(Math.random()*moves.length)];
   if(m.act==='place'){const pr=X.probe(X.G.cur.t,m.r,m.x,m.y);X.performMove(m,s);const T=X.G.tiles[X.key(m.x,m.y)];pr.groups.forEach(gp=>{if(gp.ty!=='C'&&gp.ty!=='R')return;n++;const Fd=X.G.fd[X.find(T.s0+gp.segs[0])];if(Fd.tiles.length!==gp.tiles||Fd.oe.length!==gp.oe.length)bad++})}else X.performMove(m,s)}}
 ok(bad===0,`probe vs real placement mismatches ${bad} of ${n}`)}
console.log(`graph tests: ${pass} passed, ${fail} failed`);
