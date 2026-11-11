// Gauntlet: computer-vs-computer games, every player count and faction combination. Reports errors, stalls, win rates, seat split, length.
//   node gauntlet.js [N=300] [--np 2,3,4] [--levels normal | easy,normal,hard] [--seed 1] [--budget 200] [--quiet] [--json]
// Errors = exception / illegal AI move / invariant violation. Stall = pending decision nobody can answer or step cap reached.
require('./src/data.js');require('./src/engine.js');require('./src/ai.js');
const args=process.argv.slice(2);const opt=n=>{const i=args.indexOf('--'+n);return i>=0?args[i+1]:null};
const N=+(args.find(a=>/^\d+$/.test(a))||300);const NPS=(opt('np')||'2,3,4').split(',').map(Number);const LEVELS=(opt('levels')||'normal').split(',');const SEED=+(opt('seed')||1);const QUIET=args.includes('--quiet');
if(opt('budget'))TB.AI.budgetMs=+opt('budget');
const F=['nobility','clans','uprising','gathering'];
function combos(np){const out=[];const rec=(start,cur)=>{if(cur.length===np){out.push(cur.slice());return}for(let i=start;i<F.length;i++){cur.push(F[i]);rec(i+1,cur);cur.pop()}};rec(0,[]);return out}
let rs=SEED*7919;const prnd=()=>{rs=(Math.imul(rs,1103515245)+12345)>>>0;return rs/4294967296};
const stats={games:0,errors:0,stalls:0,invViol:0,moves:0,ms:0};const errs=[];
const byNp={};
for(const np of NPS)byNp[np]={games:0,fWins:{},fGames:{},fScore:{},seatWins:Array(np).fill(0),posWins:Array(np).fill(0),lvWins:{},lvGames:{},lvScore:{},rounds:0,moves:0,win:0,scores:0,margin:0,ties:0,tieFav:0,tieOrd:0,logLines:0,cards:{}};
const t0=Date.now();
const per=Math.ceil(N/NPS.length);
for(const np of NPS){const cb=combos(np);const B=byNp[np];
  for(let g=0;g<per;g++){const facs=cb[g%cb.length].slice();for(let i=facs.length-1;i>0;i--){const j=Math.floor(prnd()*(i+1));[facs[i],facs[j]]=[facs[j],facs[i]]}
    const lv=facs.map((f,i)=>LEVELS[(i+g)%LEVELS.length]);const seed=SEED*100000+np*10000+g;
    let G;const ts=Date.now();
    try{G=TB.newGame({players:facs.map((f,i)=>({faction:f,name:'P'+i,ai:lv[i]})),seed,length:'standard'});
      const startOrder=G.order.slice();let steps=0,stalled=false;
      while(G.phase!=='over'){const r=TB.AI.step(G,{});if(!r.moved){stalled=true;break}steps+=r.moved;if(steps>8000){stalled=true;break}
        if(steps%20===0){const inv=TB.invariants(G);if(inv.length){stats.invViol++;errs.push('INV seed '+seed+': '+inv.slice(0,3).join('; '));break}}}
      if(stalled){stats.stalls++;errs.push('STALL seed '+seed+' '+facs.join(',')+' pending '+(G.q?G.q.kind:'none')+' phase '+G.phase+' step '+G.step)}
      else{const inv=TB.invariants(G);if(inv.length){stats.invViol++;errs.push('INV(end) seed '+seed+': '+inv.slice(0,3).join('; '))}
        const w=G.over.winner;B.games++;B.moves+=steps;B.rounds+=G.round;B.win+=G.pl[w].inf;B.scores+=G.pl.reduce((a,p)=>a+p.inf,0)/np;
        const rk=G.over.ranking;B.margin+=G.pl[rk[0]].inf-G.pl[rk[1]].inf;if(G.over.tieBreak){B.ties++;if(G.over.tieBreak==='favour')B.tieFav++;else B.tieOrd++}
        B.seatWins[w]++;B.posWins[startOrder.indexOf(w)]++;B.logLines+=G.logN;
        facs.forEach((f,i)=>{B.fGames[f]=(B.fGames[f]||0)+1;B.fScore[f]=(B.fScore[f]||0)+G.pl[i].inf;if(i===w)B.fWins[f]=(B.fWins[f]||0)+1;
          B.lvGames[lv[i]]=(B.lvGames[lv[i]]||0)+1;B.lvScore[lv[i]]=(B.lvScore[lv[i]]||0)+G.pl[i].inf;if(i===w)B.lvWins[lv[i]]=(B.lvWins[lv[i]]||0)+1});
        for(const k in G.stats)B.cards[k]=(B.cards[k]||0)+G.stats[k]}
    }catch(e){stats.errors++;errs.push('ERROR seed '+seed+' '+facs.join(',')+': '+e.message.split('\n')[0]+(e.stack?' @ '+e.stack.split('\n')[1].trim():''))}
    stats.games++;stats.ms+=Date.now()-ts;
    if(!QUIET&&stats.games%100===0)console.error('... '+stats.games+' games, '+((Date.now()-t0)/1000).toFixed(0)+'s')}}
const pct=(a,b)=>b?(100*a/b).toFixed(1)+'%':'-';
console.log('GAUNTLET  games '+stats.games+'  levels '+LEVELS.join('/')+'  counts '+NPS.join('/')+'  time '+((Date.now()-t0)/1000).toFixed(1)+'s');
console.log('errors '+stats.errors+'   stalls '+stats.stalls+'   invariant violations '+stats.invViol);
for(const np of NPS){const B=byNp[np];if(!B.games)continue;console.log('\n== '+np+' players: '+B.games+' games ==');
  console.log('avg rounds '+(B.rounds/B.games).toFixed(2)+'  avg decisions '+(B.moves/B.games).toFixed(0)+'  avg winner score '+(B.win/B.games).toFixed(1)+'  avg score '+(B.scores/B.games).toFixed(1)+'  avg margin '+(B.margin/B.games).toFixed(1)+'  ties broken '+pct(B.ties,B.games)+' (favour '+B.tieFav+', order '+B.tieOrd+')');
  console.log('fair share '+pct(1,np));
  for(const f of F)if(B.fGames[f])console.log('  '+(TB.DATA.FSHORT[f]+' ').padEnd(18)+'win '+pct(B.fWins[f]||0,B.fGames[f]).padStart(6)+'   avg score '+(B.fScore[f]/B.fGames[f]).toFixed(1)+'   ('+B.fGames[f]+' seats)');
  console.log('  seat index wins: '+B.seatWins.map((x,i)=>i+':'+pct(x,B.games)).join('  '));
  console.log('  start-order position wins (1 = first on the track): '+B.posWins.map((x,i)=>(i+1)+':'+pct(x,B.games)).join('  '));
  if(LEVELS.length>1)console.log('  by level: '+Object.keys(B.lvGames).map(l=>l+' win '+pct(B.lvWins[l]||0,B.lvGames[l])+' avg '+(B.lvScore[l]/B.lvGames[l]).toFixed(1)).join('  |  '))}
if(args.includes('--cards')){const tot={};for(const np of NPS)for(const k in byNp[np].cards)tot[k]=(tot[k]||0)+byNp[np].cards[k];console.log('\nstat counters (all games):');console.log(Object.keys(tot).sort().map(k=>k+':'+tot[k]).join('  '))}
if(errs.length){console.log('\nFIRST PROBLEMS:');for(const e of errs.slice(0,15))console.log('  '+e)}
if(args.includes('--json'))console.log(JSON.stringify({stats,byNp}));
process.exit(stats.errors||stats.stalls||stats.invViol?1:0);
