// Coverage: every faction card (basic + site of power), Tactic, Favour, Kingdom Card, Council and Location is forced into play, and the game
// is then played on (computer seats for everyone, the seat under test prefers the thing under test) with invariants checked after EVERY apply:
// card conservation (faction cards and Kingdom Cards each in exactly one place), Supporter/Herald/token conservation, legal hand sizes,
// no negative tokens. An item counts as "fired" when the engine's own counter for it moved (G.stats). Usage: node cover.js [tries=14]
require('./src/data.js');require('./src/engine.js');require('./src/ai.js');
const D=TB.DATA,T=TB.test;const TRIES=+(process.argv[2]||14);
const F=D.FACTIONS;let violations=0,applies=0;const problems=[];
function drive(G,item,maxSteps){let steps=0;
  while(G.phase!=='over'&&steps<maxSteps){const p=TB.pending(G);if(!p){problems.push(item.name+': stall (nothing pending) at '+G.phase+'/'+G.step);return 'stall'}
    for(const seat of p.seats.slice()){const q=TB.pending(G);if(!q||!q.seats.includes(seat))continue;const mv=TB.moves(G,seat);if(!mv.length){problems.push(item.name+': no moves for seat '+seat+' in '+q.kind);return 'nomoves'}
      let m=null;if(seat===0&&item.prefer)m=item.prefer(mv,G,q)||null;if(!m)m=TB.AI.choose(G,seat,'normal');
      const r=TB.apply(G,m);applies++;if(!r.ok){problems.push(item.name+': illegal/failed apply '+q.kind+' '+m.k+': '+r.err);return 'error'}
      const inv=TB.invariants(G);if(inv.length){violations++;problems.push(item.name+': INVARIANT after '+q.kind+' '+m.k+': '+inv.slice(0,2).join('; '));return 'inv'}steps++}
    if(item.fired&&item.fired(G))return 'fired'}
  return item.fired&&item.fired(G)?'fired':'done'}
function newG(item,tryNo){const np=2+((tryNo+(item.np||0))%3);const facs=[item.faction||F[tryNo%4]];for(const f of F)if(facs.length<np&&!facs.includes(f))facs.push(f);
  const G=TB.newGame({players:facs.map((f,i)=>({faction:f,name:'P'+i,ai:'normal'})),seed:1000+tryNo*31+(item.seed||0)});G.pl[0].ai='normal';if(item.setup)item.setup(G,tryNo);T.restart(G);return G}
const results=[];
function run(item){let fired=false,tries=0;for(let t=0;t<TRIES&&!fired;t++){tries++;let G;try{G=newG(item,t);const r=drive(G,item,item.steps||2500);if(r==='fired')fired=true;
      if(!fired&&item.fired&&item.fired(G))fired=true}catch(e){problems.push(item.name+': EXCEPTION '+e.message+' @ '+(e.stack||'').split('\n')[1]);break}}
  results.push({cat:item.cat,name:item.name,fired,tries})}
const act=(m,a)=>m.t==='act'&&m.a===a;
const pickKey=(mv,pred)=>mv.find(pred);
// ---------------------------------------------------------------- Kingdom Cards
for(let n=1;n<=51;n++){const k=D.KC[n-1];
  for(const mode of ['slot','road']){if(mode==='slot'&&k.place!=='board')continue;
    run({cat:'Kingdom Card',name:'kc'+n+' '+k.nm+' ('+mode+')',seed:n,steps:2200,
      setup(G,t){if(mode==='slot'){const occ=G.pl[0].hand.find(id=>id%100!==13);T.giveKC(G,0,n,occ,0);if(t%2)G.pl[0].herald=-1}else{T.road(G,3,n)}
        // some scenes need lore, cards in councils, a Lost Pile, Supporters on the Map...
        if(n===31||n===25||n===29){for(const id of [G.pl[0].deck[0],G.pl[0].deck[1]])T.put(G,id,'lost')}
        if(n===24||n===16||n===2||n===21){T.put(G,G.pl[0].deck[0],'council',['relics','secrets','oaths'][t%3])}
        if(n===36)T.put(G,0*100+2,'disc');if(n===14)T.put(G,0*100+10,'disc')},
      prefer(mv,G,q){
        if(mode==='road'){if(q.kind==='bid'){const best=mv.slice().sort((a,b)=>TB.cardInfo(G,b.id).strength-TB.cardInfo(G,a.id).strength)[0];return best}
          if(q.kind==='bidRes'){const t=mv.find(m=>m.t==='take'&&m.kc===n);if(t)return t}}
        if(n===34&&q.kind==='bidRes'){const d=mv.find(m=>m.dk!=null);if(d)return d}
        if(n===39){const f=mv.find(m=>m.t==='act'&&m.a==='cmd:flank'&&m.p.card%100===13);if(f)return f}
        if(n===9&&q.kind==='bidRes'){const d=mv.find(m=>m.t==='steal');if(d)return d}
        const a=mv.find(m=>m.t==='act'&&(m.a==='kc'+n||m.a==='kc'+n+'a'));if(a)return a;
        if(n===28){const f=mv.find(m=>m.t==='act'&&/^fav:/.test(m.a));if(f)return f}
        if(n===38){}return null},
      fired(G){const s=G.stats;return !!(s['kc'+n]||s['act:kc'+n]||s['act:kc'+n+'a'])}})}}
// ---------------------------------------------------------------- Tactics, Favours, HQ and site cards
for(const f of F){const T_=D.TACTICS[f];
  T_.forEach((t,i)=>run({cat:'Tactic',name:D.FNAME[f]+': '+t.nm,faction:f,seed:i,steps:2200,
    setup(G){if(t.id==='nob_t3'||true){}},
    prefer(mv,G,q){if(q.kind==='edict'){const y=mv.find(m=>m.yes);if(y)return y}return mv.find(m=>m.t==='act'&&m.a==='t:'+t.id)||null},
    fired(G){return !!G.stats['t:'+t.id]}}));
  run({cat:'Favour',name:D.FNAME[f]+': '+D.FAVOUR[f].nm,faction:f,steps:2200,setup(G){G.fav.h=0;G.fav.u=3},prefer(mv){return mv.find(m=>m.t==='act'&&/^fav:/.test(m.a))||null},fired(G){return !!G.stats['fav:'+f]}});
  D.SITE[f].forEach((c,i)=>run({cat:c.kind==='hq'?'HQ card':'Advanced card',name:D.FNAME[f]+': '+c.nm,faction:f,seed:i,steps:2600,setup(G){G.pl[0].lore=7},
    prefer(mv,G,q){if(q.kind==='siteBuy'&&q.t==='sel'){const id=0*100+14+i;const m=mv.find(x=>x.t==='sel'&&x.v===id);if(m)return m}
      const cmdAct=mv.find(m=>m.t==='act'&&['card:fang','card:hallseats','card:rampart','card:whisperer','hq:'+c.id,'t:'+c.id].includes(m.a));return cmdAct||null},
    fired(G){return !!G.stats['site:'+c.id]}}))}
// ---------------------------------------------------------------- Councils and Locations
for(const c of D.COUNCILS)run({cat:'Council',name:D.COUNCIL_NAMES[c],steps:2600,setup(G){const P=G.pl[0];for(const id of [P.deck[0],P.deck[1],P.deck[2]])T.put(G,id,'council',c);G.pl[0].mk[3]=2},
  prefer(mv,G,q){if(q.kind==='herald'){return mv.find(m=>m.loc===3)||null}return mv.find(m=>m.t==='act'&&m.a==='council:'+c)||null},
  fired(G){return c==='relics'?!!G.stats.relicsUse:c==='secrets'?!!G.stats.councilSecrets:!!G.stats.councilOaths}});
for(let l=0;l<6;l++)run({cat:'Location',name:D.LOCS[l][1],steps:2600,
  setup(G){for(const P of G.pl)if(P.seat>0){}},prefer(mv,G,q){if(q.kind==='location'){const m=mv.find(x=>x.loc===l);if(m)return m}
    if(q.kind==='castle'||q.kind==='wilderness'||q.kind==='harvest'){const m=mv.find(x=>!x.skip&&(x.yes!==0));if(m)return m}
    if(q.kind==='bid'){return mv.slice().sort((a,b)=>b.id%100-a.id%100)[0]}return null},fired(G){return !!G.stats['loc'+l]}});
for(const f of F)D.BASIC.forEach((b,i)=>run({cat:'Basic card',name:D.FNAME[f]+': '+D.BASICNAMES[f][i],faction:f,seed:i,steps:3000,prefer(mv,G,q){if(q.kind==='place'){return mv.find(m=>m.id%100===i)||null}if(q.kind==='tie'||q.kind==='ambushCard'){return mv.find(m=>m.id%100===i)||null}return null},fired(G){return !!G.stats['reveal:'+f+':'+b.id]}}));
// ---------------------------------------------------------------- rules / commands / traits counters (from ordinary play)
const RULES=[['Ambush','ambush'],['Retreat','retreat'],['Flank','flank'],['Rally','rally'],['Deploy','deploy'],['Deadly / Elimination','elim'],['Attrition','attrition'],['Steal a Kingdom Card','steal'],['Govern','govern'],['Journey','journey'],['Clash tie','clashTie'],['Herald Reward','heraldRw'],['Favour claim','favour']];
RULES.push(['Invulnerable (prevents Elimination)','invulnerable'],['Resilient (Eliminated card to Discard)','resilient'],['Pathfinder (Journey card to Discard)','pathfinder'],['Supporters add Strength','supporterStrength'],['Tied Clash starts a new Clash','reclash'],['Deploy tokens decay in Winter','tokenDecay'],['Hand size clamp (3..8)','hsClamp']);
for(const [name,key] of RULES)run({cat:'Rule',name,steps:6000,prefer:null,setup(G){if(key==='hsClamp'){G.pl[0].hs=8;T.giveKC(G,0,17,G.pl[0].hand.find(id=>id%100!==13),0)}},fired(G){return !!G.stats[key]}});
run({cat:'Rule',name:'Empty Site of Power: Lore becomes Influence at game end',steps:6000,setup(G){G.pl[0].lore=6;for(const id of G.pl[0].site.slice())T.put(G,id,'disc')},fired(G){return !!G.stats.loreToInfluence}});
// ---------------------------------------------------------------- report
const cats={};for(const r of results){(cats[r.cat]=cats[r.cat]||{n:0,ok:0,miss:[]});cats[r.cat].n++;if(r.fired)cats[r.cat].ok++;else cats[r.cat].miss.push(r.name)}
console.log('COVERAGE  (item counts as fired when the engine counter for it moved; invariants checked after every apply)');
let tn=0,tok=0;for(const c in cats){const x=cats[c];tn+=x.n;tok+=x.ok;console.log('  '+c.padEnd(18)+x.ok+' / '+x.n+(x.miss.length?'   NOT FIRED: '+x.miss.join(' | '):''))}
console.log('  total '+tok+' / '+tn+'   applies checked '+applies+'   invariant violations '+violations+'   problems '+problems.length);
for(const p of problems.slice(0,20))console.log('  PROBLEM '+p);
process.exit(violations||problems.length?1:0);
