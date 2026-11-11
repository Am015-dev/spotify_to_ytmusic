/* ---------- expansion switches and setup: cultists, tower, berserk, menace, costumes, curses ---------- */
const EXPS=[
 {k:'evo',n:'Evolutions',d:'Each monster has its own 8 evolution cards. Start with one; whenever you resolve three hearts, pick another. Keep them secret and play them when their text allows.'},
 {k:'cult',n:'Cultists',d:'Resolve four of a kind to gain a cultist (one per face). Spend one on your turn for a heart, an energy or an extra reroll.'},
 {k:'tower',n:'The Spire',d:'If you are already in the city, resolve four 1s to climb a level of the Tower. Levels 1 and 2 give hearts and energy each turn. Reaching the top wins at once.'},
 {k:'bers',n:'Rampage',d:'Resolve four claws to go on a rampage and roll the rampage die too. Healing with hearts calms you down.'},
 {k:'wick',n:'Menace gauge',d:'Each three 1s gives 2 menace and each three 2s gives 1 (up to 10). At 3, 6 and 10 take a menace tile.'},
 {k:'cost',n:'Costume Party',d:'Everyone starts in a costume with a power. Smash a monster with 3+ claws to buy its costume off its back.'},
 {k:'curse',n:'Curses',d:'A curse changes the rules for everyone. The Omen Die can swap it, punish you or bless you, and the Brass Beetle protects its holder from some curses.'}];
const BFACES=['C2','E2','O','C','C','E'];   /* rampage die: double claw, double energy, ouch (lose 1 heart), claw, claw, energy */
const FFACES=['FE','FW','FS','FA'];        /* Omen Die: eye, water, snake, ankh */
function faceOf(d){return d.t==='b'?BFACES[rnd(6)]:d.t==='f'?FFACES[rnd(4)]:FACES[rnd(6)]}
function exSetup(done){
  G.tower=[-1,-1,-1];G.pl.forEach(p=>{p.cult=0;p.wk=0;p.stats={dmg:0,stars:0,cards:0,city:0,kos:0}});
  G.wtiles={3:Object.keys(WTILES).filter(k=>WTILES[k].lv===3),6:Object.keys(WTILES).filter(k=>WTILES[k].lv===6),10:Object.keys(WTILES).filter(k=>WTILES[k].lv===10)};
  if(exOn('curse')){G.curseDeck=shuffle(Object.keys(CURSES));G.curseDisc=[];G.curse=G.curseDeck.pop();G.scarab=G.pl.length-1;
    if(G.curse==='k_ra')G.pl.forEach(q=>{if(q.hp>8)q.hp=8});
    lg(-1,`Curse in play: ${CURSES[G.curse].n}: ${CURSES[G.curse].x} ${mname(P(G.scarab))} starts with the Brass Beetle.`)}
  if(!exOn('cost')){done();return}
  const pool=shuffle(Object.keys(COSTUMES));
  seq(G.pl.slice(),(p,next)=>{const two=[pool.pop(),pool.pop()];
    ask(p.i,'Pick your costume',`${mname(p)}, choose the costume you start the game in. The other goes into the power card deck.`,two.map(k=>({k,l:COSTUMES[k].n,d:COSTUMES[k].x})),
      ()=>two.slice().sort((a,b)=>COSTUMES[b].v-COSTUMES[a].v)[0],k=>{p.cards.push(k);G.deck.push(two.find(x=>x!==k));lg(p.i,`${mname(p)} dresses up in the ${COSTUMES[k].n}.`);next()},{nocancel:true})},
    ()=>{G.deck.push(...pool);shuffle(G.deck);done()})}
function exDice(p){const x=[];if(exOn('bers')&&p.tok.berserk)x.push({f:BFACES[rnd(6)],k:false,x:true,t:'b'});if(exOn('curse')&&!G.tf.nofate)x.push({f:FFACES[rnd(4)],k:false,x:true,t:'f'});return x}
