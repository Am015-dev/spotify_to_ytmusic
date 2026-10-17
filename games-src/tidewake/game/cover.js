// Coverage: mixed AI and random legal moves, checkInvariants() after every move, and a list of every rule/piece with whether it fired.
// node cover.js [games per config]
const {load}=require('./tools/load');const X=load(['data.js','engine.js','ai.js']);const N=+process.argv[2]||40;
const RULES={chain:'path follows chained currents',place:'tile placement',collision:'two ships on one wake sink',edgeKill:'board-edge loss',pathMonKill:'wake runs into a leviathan tile',
 levMove:'leviathan moves',levTurn:'leviathan turns (rotate arrow)',levCrush:'leviathan destroys a leviathan',monOff:'leviathan leaves the board',levKillShip:'leviathan sinks a ship on a tile',tileDestroyed:'tile destroyed to bottom of pile',
 monRoll:'6/7/8 roll moves leviathans',calmRoll:'other rolls',spawn6:'roll of 6 spawns a leviathan',levSpawn:'leviathan placed (setup/spawn/refill)',refill:'minimum-3 refill (no roll)',blocked:'leviathan in front of the active ship',relocate:'blocked start relocates',
 bonusOffer:'elimination bonus offered',bonusSwap:'elimination bonus swap',elim:'ship eliminated',over:'game ends',
 cannonKeep:'Deck Cannon kept on draw',cannonDiscard:'Deck Cannon discarded on draw',cannonSave:'Deck Cannon interrupt',cannonShoot:'Deck Cannon played on own turn',
 gatePlay:'Rift Gate placed',gateRescue:'Rift Gate interrupt rescue',gateTeleport:'Rift Gate transport',gateEnter:'ship wake runs into a Rift Gate',gateMon:'leviathan flung by a Rift Gate',
 waveSpawn:'Rogue Wave placed',waveMove:'Rogue Wave moves',waveCheck:'Rogue Wave roll',waveCapsize:'Rogue Wave capsizes a ship',waveOff:'Rogue Wave leaves (marker too)',
 maelSpawn:'Maelstrom placed',maelMove:'Maelstrom moves',maelOff:'Maelstrom leaves',maelKillShip:'Maelstrom sinks a ship',maelEatLev:'Maelstrom destroys a leviathan',levSwallowed:'leviathan moving into Maelstrom is removed'};
const CF=[];for(const np of [2,3,4,5,6,8])for(const e of [{},{rift:1,cannon:1},{wave:1,maelstrom:1},{rift:1,wave:1,maelstrom:1,cannon:1}])CF.push({np,e});
CF.push({np:1,v:'solo',e:{rift:1,cannon:1,wave:1,maelstrom:1}},{np:1,v:'easysolo',e:{}},{np:4,v:'teams',e:{rift:1,cannon:1,wave:1,maelstrom:1}});
const fired={};let games=0,moves=0,errs=0,wins={};const t0=Date.now();
for(const c of CF)for(let g=0;g<N;g++){X.setSeed(g*911+c.np*7);X.ai.setAiSeed(g);X.newGame({players:c.np,variant:c.v,exp:c.e,level:['easy','normal','hard'][g%3]});let k=0,r=g*17+1;const rr=()=>{r=(Math.imul(r,1103515245)+12345)>>>0;return r/4294967296};
  try{while(X.G.phase!=='over'&&k++<5000){const s=X.sideToAct();let m;const mode=rr();
      if(mode<.55){const st=X.ai.aiStep(true);m=st&&st.m}else{const mv=X.validMoves(s);m=mv[Math.floor(rr()*mv.length)]}
      if(!m){errs++;console.log('NOMOVE',JSON.stringify(c),g);break}
      const res=X.performMove(m,s);if(!res.success){errs++;console.log('REJ',res.error,JSON.stringify(m));break}moves++;
      const iv=X.checkInvariants();if(iv.length){errs++;console.log('INV',JSON.stringify(c),g,iv[0]);break}}
    if(X.G.phase!=='over'){errs++;console.log('STALL',JSON.stringify(c),g)}else{const w=X.G.over.win.length?'win':'loss';wins[c.v||'base']=wins[c.v||'base']||{};wins[c.v||'base'][w]=(wins[c.v||'base'][w]||0)+1}}
  catch(e){errs++;console.log('EXC',JSON.stringify(c),g,e.stack.split('\n').slice(0,3).join(' | '))}
  games++;for(const k2 in X.G.stats)fired[k2]=(fired[k2]||0)+X.G.stats[k2]}
let missing=0;for(const k in RULES){const n=fired[k]||0;if(!n)missing++;console.log((n?'FIRED  ':'MISSING')+' '+k.padEnd(14)+String(n).padStart(7)+'  '+RULES[k])}
console.log(`games ${games} moves ${moves} errors ${errs} rules missing ${missing} time ${((Date.now()-t0)/1000).toFixed(0)}s`);console.log('ends',JSON.stringify(wins));process.exit(errs||missing?1:0);
