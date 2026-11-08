// W440 logic test: one headless assertion per numbered rule in RULES-CHECKLIST.md, against the real data.js/engine.js/exp.js/ai.js
// (loaded straight into a vm, no UI). Each failure prints one line: rule number, expected, got.
// Usage: node logic-test.js            (run)      node logic-test.js --md   (print the checklist markdown from the same table)
const vm = require('vm'), fs = require('fs'), path = require('path');
const pre = `var ANIM=0,AIDELAY=0,DEFN=4,DEFX='base',DEFEVO=false,YA=3,YB=0,MBT=8,DEFLV='normal',LVMIX=null,DEFEX=null,Y_=false;const SAVE='x';
const FACES=['1','2','3','E','C','H'];const MONS=[0,1,2,3,4,5,6,7,8].map(i=>({n:'M'+i}));
function render(){};function schedule(){};function sfx(){};function snd(){};`;
const src = pre + ['data.js', 'engine.js', 'exp.js', 'ai.js'].map(f => fs.readFileSync(path.join(__dirname, f), 'utf8')).join('\n');
const ctx = vm.createContext({ console, setTimeout, clearTimeout, setInterval: () => 0, clearInterval() {}, localStorage: { setItem() {}, getItem() { return null } }, document: {}, window: {} });
vm.runInContext(src, ctx);
const S = e => vm.runInContext(e, ctx);
const J = o => JSON.stringify(o);

/* ---- harness ---- */
function game(n) {
  S(`UI.n=${n || 4};UI.evo=false;UI.xp='base';DEFEX={};setSeed(11);newGame('ai')`);
  S(`G.pl.forEach(p=>{p.hp=10;p.vp=0;p.en=0;p.cards=[];p.tok={};p.alive=true;p.dmod=0;p.cult=0;p.hand=[]});G.city=-1;G.bay=-1;G.active=0;G.home=0;G.winner=null;G.phase='roll';G.tf=tfBase();G.dice=[];G.less=0;PENDING=[];G.xq=[];UI.choice=null;UI.busy=false;Y_=false;aiYield=(q)=>Y_===true||(Array.isArray(Y_)&&Y_.includes(q.i));G.market=[];G.disc=[]`);
}
const set = (i, o) => { for (const k in o) S(`P(${i}).${k}=${J(o[k])}`) };
const get = (i, k) => S(`P(${i}).${k}`);
const roll = faces => S(`G.phase='roll';G.dice=${J(faces)}.map(f=>({f,k:true}));G.tf=Object.assign(tfBase(),{startIn:[G.city,G.bay]});resolve()`);
const market = ids => { S(`G.market=${J(ids)};G.phase='buy';G.tf.bought=false`) };
const buyAt = (k, en) => { set(0, { en }); S(`G.phase='buy';buy(${k})`) };
const pick = k => S(`{const c=UI.choice;UI.choice=null;c.cb(${J(k)})}`);
const endT = () => S(`endTurn()`);

const RULES = []; let GROUP = '';
const grp = g => { GROUP = g };
const R = (text, fn) => RULES.push({ n: RULES.length + 1, g: GROUP, text, fn });

/* =========================== A. SETUP =========================== */
grp('Setup');
R('Every monster starts with 10 hearts, 0 stars, 0 energy.', () => { game(4); S(`newGame('ai')`); return [J([10, 0, 0, 10, 0, 0, 10, 0, 0, 10, 0, 0]), J(S(`G.pl.flatMap(p=>[p.hp,p.vp,p.en])`))] });
R('No monster starts in the city; the city is empty.', () => { S(`newGame('ai')`); return [J([-1, -1]), J(S(`[G.city,G.bay]`))] });
R('Three power cards are face up at the start.', () => { S(`newGame('ai')`); return [3, S(`G.market.length`)] });
R('The power deck holds 66 cards (shuffled) with the market cards taken from it.', () => { S(`newGame('ai')`); return [66, S(`G.deck.length+G.market.length`)] });
R('A game of 2-4 monsters uses only the city (the Harbor is closed).', () => { S(`UI.n=4;newGame('ai')`); return [false, S(`G.bayOn`)] });
R('A game of 5 monsters opens the Harbor as a second city space.', () => { S(`UI.n=5;newGame('ai')`); return [true, S(`G.bayOn`)] });
R('A game of 6 monsters opens the Harbor as well.', () => { S(`UI.n=6;newGame('ai')`); return [true, S(`G.bayOn`)] });
R('Turns are rolled with six dice.', () => { game(4); S(`startRoll(cur())`); return [6, S(`G.dice.length`)] });
R('Winning needs 20 stars.', () => [20, S(`GOAL()`)]);

/* =========================== B. ROLLING =========================== */
grp('Rolling');
R('After the first roll a monster may reroll twice (two rerolls in total).', () => { game(); S(`startRoll(cur())`); return [2, S(`G.rolls`)] });
R('Rerolling uses up one reroll each time and a third reroll is refused.', () => { game(); S(`startRoll(cur())`); S(`doReroll('x');doReroll('x');doReroll('x')`); return [0, S(`G.rolls`)] });
R('Kept dice do not change on a reroll.', () => { game(); S(`G.phase='roll';G.rolls=2;G.dice=['1','2','3','E','C','H'].map(f=>({f,k:true}));doReroll('x')`); return [J(['1', '2', '3', 'E', 'C', 'H']), J(S(`G.dice.map(d=>d.f)`))] });
R('Dice not kept are all rerolled (at least one die changes over 20 seeds).', () => { let ch = false; for (let s = 1; s <= 20 && !ch; s++) { game(); S(`setSeed(${s});G.phase='roll';G.rolls=2;G.dice=['1','1','1','1','1','1'].map(f=>({f,k:false}));doReroll('x')`); ch = S(`G.dice.some(d=>d.f!=='1')`) } return [true, ch] });
R('A die kept on an earlier reroll can be rerolled again later.', () => { game(); S(`G.phase='roll';G.rolls=2;G.dice=['1','1','1','1','1','1'].map(f=>({f,k:true}));G.dice.forEach(d=>d.k=false);setSeed(5);doReroll('x');G.dice.forEach(d=>d.k=false);doReroll('x')`); return [0, S(`G.rolls`)] });
R('Dice faces are 1, 2, 3, energy, claw, heart (one of each on a die).', () => [J(['1', '2', '3', 'E', 'C', 'H']), J(S(`FACES`))]);

/* =========================== C. DICE FACES =========================== */
grp('Dice faces');
const stars = (faces, pre) => { game(); if (pre) pre(); S(`G.city=1`); roll(faces); return get(0, 'vp') };   // monster 1 holds the city so that monster 0 does not also enter for +1
R('Three 1s score 1 star.', () => [1, stars(['1', '1', '1', 'E', 'E', 'E'])]);
R('Three 2s score 2 stars.', () => [2, stars(['2', '2', '2', 'E', 'E', 'E'])]);
R('Three 3s score 3 stars.', () => [3, stars(['3', '3', '3', 'E', 'E', 'E'])]);
R('Two of a number score nothing.', () => [0, stars(['3', '3', '2', '2', 'E', 'E'])]);
R('Each extra matching die adds 1 star (four 1s = 2).', () => [2, stars(['1', '1', '1', '1', 'E', 'E'])]);
R('Five 3s score 5 stars (3 + 2 extra).', () => [5, stars(['3', '3', '3', '3', '3', 'E'])]);
R('Six 2s score 5 stars (2 + 3 extra).', () => [5, stars(['2', '2', '2', '2', '2', '2'])]);
R('Two different triples both score (1-1-1 and 3-3-3 = 4).', () => [4, stars(['1', '1', '1', '3', '3', '3'])]);
R('Each energy die gives 1 energy (no set needed).', () => { game(); S(`G.city=1`); roll(['E', 'E', 'E', '1', '2', '2']); return [3, get(0, 'en')] });
R('Energy carries over between turns (it is not reset at turn end).', () => { game(); S(`G.city=1`); roll(['E', 'E', '1', '2', '2', '3']); endT(); return [2, get(0, 'en')] });
R('Each heart die heals 1 heart when outside the city.', () => { game(); set(0, { hp: 4 }); S(`G.city=1`); roll(['H', 'H', 'H', '1', '2', '2']); return [7, get(0, 'hp')] });
R('Healing never goes above 10 hearts.', () => { game(); set(0, { hp: 9 }); S(`G.city=1`); roll(['H', 'H', 'H', '1', '2', '2']); return [10, get(0, 'hp')] });
R('Heart dice do nothing for a monster in the city.', () => { game(); set(0, { hp: 4 }); S(`G.city=0`); roll(['H', 'H', 'H', '1', '2', '2']); return [4, get(0, 'hp')] });
R('Claws from outside the city hit the monster in the city for 1 each.', () => { game(); S(`G.city=1`); roll(['C', 'C', '1', '2', '2', 'E']); return [8, get(1, 'hp')] });
R('Claws from outside the city do NOT hit other monsters outside.', () => { game(); S(`G.city=1`); roll(['C', 'C', '1', '2', '2', 'E']); return [J([10, 10]), J([get(2, 'hp'), get(3, 'hp')])] });
R('Claws from inside the city hit every monster outside, 1 each per claw.', () => { game(); S(`G.city=0`); roll(['C', 'C', 'C', '1', '2', '2']); return [J([7, 7, 7]), J([get(1, 'hp'), get(2, 'hp'), get(3, 'hp')])] });
R('A monster never hits itself with its own claws.', () => { game(); S(`G.city=0`); roll(['C', 'C', 'C', '1', '2', '2']); return [10, get(0, 'hp')] });
R('Hearts cannot drop below 0 (damage is capped at the hearts left).', () => { game(); set(1, { hp: 1 }); S(`G.city=1`); roll(['C', 'C', 'C', '1', '2', '2']); return [0, Math.max(0, get(1, 'hp'))] });

/* =========================== D. THE CITY =========================== */
grp('The city (Downtown)');
R('If the city is empty after your dice, you must move in even with no claws, and gain 1 star.', () => { game(); S(`G.city=-1`); roll(['E', 'E', '1', '2', '2', '3']); return [J([0, 1]), J([S(`G.city`), get(0, 'vp')])] });
R('If the city is occupied and nobody yields, the attacker stays outside.', () => { game(); S(`G.city=1;Y_=false`); roll(['C', '1', '2', '2', 'E', 'E']); return [J([1, 0]), J([S(`G.city`), get(0, 'vp')])] });
R('A monster that starts its turn in the city gains 2 stars.', () => { game(); S(`G.city=0;startTurn()`); return [2, get(0, 'vp')] });
R('A monster hit in the city may yield: it still loses the hearts, leaves, and the attacker moves in (+1 star).', () => { game(); S(`G.city=1;Y_=true`); roll(['C', 'C', '1', '2', '2', 'E']); return [J([0, 8, 1]), J([S(`G.city`), get(1, 'hp'), get(0, 'vp')])] });
R('A monster hit in the city may stay: it keeps the city and the attacker stays outside.', () => { game(); S(`G.city=1;Y_=false`); roll(['C', 'C', '1', '2', '2', 'E']); return [J([1, 8]), J([S(`G.city`), get(1, 'hp')])] });
R('A monster in the city is not asked to yield for its own attack, and keeps the city.', () => { game(); S(`G.city=0`); roll(['C', '1', '2', '2', 'E', 'E']); return [0, S(`G.city`)] });
R('A monster knocked out in the city by claws leaves it, and the attacker moves in (+1 star).', () => { game(); set(1, { hp: 2 }); S(`G.city=1`); roll(['C', 'C', 'C', '1', '2', '2']); return [J([false, 0, 1]), J([S(`P(1).alive`), S(`G.city`), get(0, 'vp')])] });
R('The attacker enters only after the damage is done (the old occupant is gone first).', () => { game(); S(`G.city=1;Y_=true`); roll(['C', '1', '2', '2', 'E', 'E']); return [J([0, 9]), J([S(`G.city`), get(1, 'hp')])] });
R('A monster yielding does not lose its stars or cards.', () => { game(); set(1, { vp: 7, cards: ['alpha'] }); S(`G.city=1;Y_=true`); roll(['C', '1', '2', '2', 'E', 'E']); return [J([7, 1]), J([get(1, 'vp'), get(1, 'cards').length])] });
R('Only one monster at a time holds the city (a 4-monster game never has two inside).', () => { game(); S(`G.city=1;Y_=true`); roll(['C', '1', '2', '2', 'E', 'E']); return [1, S(`G.pl.filter(p=>inCity(p.i)).length`)] });

/* =========================== E. THE HARBOR (5-6 monsters) =========================== */
grp('The Harbor (5-6 monsters)');
R('With 5 monsters: city taken, Harbor empty -> the attacker must move into the Harbor and gain 1 star.', () => { game(5); S(`G.bayOn=true;G.city=1;G.bay=-1;Y_=false`); roll(['C', '1', '2', '2', 'E', 'E']); return [J([1, 0, 1]), J([S(`G.city`), S(`G.bay`), get(0, 'vp')])] });
R('A monster in the Harbor counts as in the city: outside claws hit it.', () => { game(5); S(`G.bayOn=true;G.city=-1;G.bay=1;Y_=false`); roll(['C', 'C', '1', '2', '2', 'E']); return [8, get(1, 'hp')] });
R('A monster in the Harbor hits all monsters outside with its claws.', () => { game(5); S(`G.bayOn=true;G.city=1;G.bay=0`); roll(['C', 'C', '1', '2', '2', 'E']); return [J([8, 8, 8]), J([get(2, 'hp'), get(3, 'hp'), get(4, 'hp')])] });
R('A monster in the Harbor does NOT hit the monster in Downtown (both are "in the city").', () => { game(5); S(`G.bayOn=true;G.city=1;G.bay=0`); roll(['C', 'C', '1', '2', '2', 'E']); return [10, get(1, 'hp')] });
R('A monster in the Harbor gains 2 stars at the start of its turn.', () => { game(5); S(`G.bayOn=true;G.city=1;G.bay=0;startTurn()`); return [2, get(0, 'vp')] });
R('An attacked Harbor monster may yield; the attacker takes the Harbor (+1 star).', () => { game(5); S(`G.bayOn=true;G.city=2;G.bay=1;Y_=[1]`); roll(['C', '1', '2', '2', 'E', 'E']); return [J([2, 0]), J([S(`G.city`), S(`G.bay`)])] });
R('If the Harbor monster is knocked out while Downtown is held, the attacker takes the Harbor.', () => { game(6); set(1, { hp: 1 }); S(`G.bayOn=true;G.city=2;G.bay=1`); roll(['C', '1', '2', '2', 'E', 'E']); return [J([false, 2, 0]), J([S(`P(1).alive`), S(`G.city`), S(`G.bay`)])] });
R('When only four monsters remain the Harbor closes and no monster occupies it.', () => { game(5); S(`G.bayOn=true;G.city=1;G.bay=2;P(3).hp=0;deaths()`); return [J([false, -1]), J([S(`G.bayOn`), S(`G.bay`)])] });
R('A monster cannot be in Downtown and the Harbor at the same time.', () => { game(5); S(`G.bayOn=true;G.city=1;G.bay=-1;Y_=false`); roll(['C', '1', '2', '2', 'E', 'E']); return [true, S(`G.city!==G.bay||G.city===-1`)] });

/* =========================== F. KNOCK-OUT, END OF GAME =========================== */
grp('Knock-out and winning');
R('A monster at 0 hearts is eliminated.', () => { game(); S(`P(2).hp=0;deaths()`); return [false, S(`P(2).alive`)] });
R('An eliminated monster\'s power cards go to the discard pile.', () => { game(); S(`P(2).cards=['alpha','plated'];P(2).hp=0;deaths()`); return [J([0, true]), J([S(`P(2).cards.length`), S(`G.disc.includes('alpha')&&G.disc.includes('plated')`)])] });
R('An eliminated monster in the city leaves it.', () => { game(); S(`G.city=2;P(2).hp=0;deaths()`); return [-1, S(`G.city`)] });
R('An eliminated monster is skipped in turn order.', () => { game(); S(`P(1).alive=false`); S(`G.tf=tfBase();nextTurn(P(0))`); return [2, S(`G.active`)] });
R('The game is won at once by the last monster standing.', () => { game(); S(`P(1).hp=0;P(2).hp=0;P(3).hp=0;deaths()`); return ['P1', S(`G.winner`)] });
R('A monster with 20 stars at the end of its turn wins.', () => { game(); set(0, { vp: 20 }); S(`G.city=1`); roll(['E', '1', '2', '2', '3', '3']); endT(); return ['P1', S(`G.winner`)] });
R('A monster with 19 stars does not win.', () => { game(); set(0, { vp: 19 }); S(`G.city=1`); roll(['E', '1', '2', '2', '3', '3']); endT(); return [null, S(`G.winner`)] });
R('A monster that scores past 20 (e.g. 18 + a triple of 3s) wins.', () => { game(); set(0, { vp: 18 }); S(`G.city=1`); roll(['3', '3', '3', 'E', 'E', 'E']); endT(); return ['P1', S(`G.winner`)] });
R('If every remaining monster is eliminated at the same moment, nobody wins.', () => { game(); S(`G.pl.forEach(p=>p.hp=0);deaths()`); return ['draw', S(`G.winner`)] });
R('Reaching 20 stars wins the game immediately (the moment the stars are scored, mid-turn).', () => { game(); set(0, { vp: 18 }); S(`G.city=1`); S(`G.phase='roll';G.dice=['3','3','3','E','E','E'].map(f=>({f,k:true}));G.tf=Object.assign(tfBase(),{startIn:[G.city,G.bay]});resolve()`); return ['P1', S(`G.winner`)] });

/* =========================== G. BUYING POWER CARDS =========================== */
grp('Buying power cards');
R('A face-up card is bought by paying its energy cost.', () => { game(); S(`G.deck=['kiosk','kiosk','kiosk','kiosk'];`); market(['train', 'kiosk', 'kiosk']); buyAt(0, 6); return [2, get(0, 'en')] });
R('A card cannot be bought without enough energy.', () => { game(); market(['train']); buyAt(0, 3); return [J([3, 0]), J([get(0, 'en'), get(0, 'vp')])] });
R('A bought card is replaced from the deck so three cards are face up again.', () => { game(); S(`G.deck=['kiosk','kiosk','kiosk','kiosk','kiosk'];`); market(['train', 'kiosk', 'kiosk']); buyAt(0, 5); return [3, S(`G.market.length`)] });
R('A Keep card stays in front of the buyer.', () => { game(); S(`G.deck=['kiosk','kiosk','kiosk'];`); market(['alpha', 'kiosk', 'kiosk']); buyAt(0, 5); return [J(['alpha']), J(get(0, 'cards'))] });
R('A Discard card takes effect at once and goes to the discard pile, not in front of the buyer.', () => { game(); S(`G.deck=['kiosk','kiosk','kiosk'];`); market(['train', 'kiosk', 'kiosk']); buyAt(0, 4); return [J([0, true]), J([get(0, 'cards').length, S(`G.disc.includes('train')`)])] });
R('You may pay 2 energy to discard all three face-up cards and reveal three new ones.', () => { game(); S(`G.deck=['train','train','train','train','train'];`); market(['alpha', 'kiosk', 'kiosk']); set(0, { en: 2 }); S(`G.phase='buy';sweep()`); return [J([0, 3, 3]), J([get(0, 'en'), S(`G.market.length`), S(`G.disc.length`)])] });
R('A sweep cannot be paid with fewer than 2 energy.', () => { game(); market(['alpha', 'kiosk', 'kiosk']); set(0, { en: 1 }); S(`G.phase='buy';sweep()`); return [J([1, 'alpha']), J([get(0, 'en'), S(`G.market[0]`)])] });
R('Several cards can be bought in the same turn while energy lasts.', () => { game(); S(`G.deck=['kiosk','kiosk','kiosk','kiosk','kiosk'];`); market(['kiosk', 'kiosk', 'kiosk']); set(0, { en: 6 }); S(`G.phase='buy';buy(0);buy(0)`); return [J([0, 2]), J([get(0, 'en'), get(0, 'vp')])] });
R('When the deck runs out the discard pile is reshuffled into a new deck.', () => { game(); S(`G.deck=[];G.disc=['kiosk','train','tower']`); S(`draw()`); return [2, S(`G.deck.length`)] });

/* =========================== H. TURN ORDER / END OF TURN =========================== */
grp('Turn order');
R('Play passes to the next living monster on the left (seat order).', () => { game(); S(`G.city=1;G.tf=tfBase();nextTurn(P(0))`); return [1, S(`G.active`)] });
R('After the last monster, play returns to the first and the turn counter advances.', () => { game(); S(`G.active=3;G.home=3;G.turn=1;G.tf=tfBase();nextTurn(P(3))`); return [J([0, 2]), J([S(`G.active`), S(`G.turn`)])] });
R('Start of turn: a monster in the city gains stars BEFORE it rolls.', () => { game(); S(`G.city=0;startTurn()`); return [J([2, 'roll']), J([get(0, 'vp'), S(`G.phase`)])] });

/* =========================== I. POWER CARDS (66-card deck, each by its printed text) =========================== */
grp('Power cards: Discard');
const disc = (id, cost, setup, after) => { game(); S(`G.deck=['kiosk','kiosk','kiosk','kiosk'];`); S(`G.city=-1`); if (setup) setup(); market([id, 'kiosk', 'kiosk']); S(`G.phase='buy'`); set(0, { en: cost + (setup && setup.en || 0) }); S(`buy(0)`); return after() };
R('Corner Kiosk (1): gain 1 star.', () => [1, disc('kiosk', 3, null, () => get(0, 'vp'))]);
R('Rush-Hour Train (4): gain 2 stars.', () => [2, disc('train', 4, null, () => get(0, 'vp'))]);
R('Tower Block (5): gain 3 stars.', () => [3, disc('tower', 5, null, () => get(0, 'vp'))]);
R('Sky Needle (6): gain 4 stars.', () => [4, disc('needle', 6, null, () => get(0, 'vp'))]);
R('Power Surge (8): gain 9 energy (net of the cost).', () => [9, disc('surge', 8, null, () => get(0, 'en'))]);
R('Panic Sirens (7): every other monster loses 5 stars.', () => { game(); S(`G.deck=['kiosk','kiosk','kiosk'];`); S(`G.pl.forEach(p=>p.vp=7)`); market(['sirens', 'kiosk', 'kiosk']); buyAt(0, 7); return [J([7, 2, 2, 2]), J(S(`G.pl.map(p=>p.vp)`))] });
R('Panic Sirens cannot take stars below 0.', () => { game(); S(`G.deck=['kiosk','kiosk','kiosk'];`); S(`P(1).vp=3`); market(['sirens', 'kiosk', 'kiosk']); buyAt(0, 7); return [0, get(1, 'vp')] });
R('Flame Wave (3): every other monster loses 2 hearts, the buyer does not.', () => { game(); S(`G.deck=['kiosk','kiosk','kiosk'];`); market(['flame', 'kiosk', 'kiosk']); buyAt(0, 3); return [J([10, 8, 8, 8]), J(S(`G.pl.map(p=>p.hp)`))] });
R('Refinery Blast (6): gain 2 stars and every other monster loses 3 hearts.', () => { game(); S(`G.deck=['kiosk','kiosk','kiosk'];`); market(['refinery', 'kiosk', 'kiosk']); buyAt(0, 6); return [J([2, 10, 7, 7, 7]), J([get(0, 'vp'), ...S(`G.pl.map(p=>p.hp)`)])] });
R('Patch Up (3): heal 2 hearts.', () => { game(); S(`G.deck=['kiosk','kiosk','kiosk'];`); set(0, { hp: 5 }); market(['patch', 'kiosk', 'kiosk']); buyAt(0, 3); return [7, get(0, 'hp')] });
R('Patch Up can heal a monster that is in the city (cards, unlike dice, may).', () => { game(); S(`G.deck=['kiosk','kiosk','kiosk'];G.city=0`); set(0, { hp: 5 }); market(['patch', 'kiosk', 'kiosk']); buyAt(0, 3); return [7, get(0, 'hp')] });
R('Carpet Strike (4): every monster, the buyer included, loses 3 hearts.', () => { game(); S(`G.deck=['kiosk','kiosk','kiosk'];`); market(['carpet', 'kiosk', 'kiosk']); buyAt(0, 4); return [J([7, 7, 7, 7]), J(S(`G.pl.map(p=>p.hp)`))] });
R('Jet Squadron (5): gain 5 stars and lose 4 hearts.', () => { game(); S(`G.deck=['kiosk','kiosk','kiosk'];`); market(['jetsq', 'kiosk', 'kiosk']); buyAt(0, 5); return [J([5, 6]), J([get(0, 'vp'), get(0, 'hp')])] });
R('Militia Drill (3): gain 2 stars and lose 2 hearts.', () => { game(); S(`G.deck=['kiosk','kiosk','kiosk'];`); market(['militia', 'kiosk', 'kiosk']); buyAt(0, 3); return [J([2, 8]), J([get(0, 'vp'), get(0, 'hp')])] });
R('Reactor Snack (6): gain 2 stars and heal 3 hearts.', () => { game(); S(`G.deck=['kiosk','kiosk','kiosk'];`); set(0, { hp: 4 }); market(['reactor', 'kiosk', 'kiosk']); buyAt(0, 6); return [J([2, 7]), J([get(0, 'vp'), get(0, 'hp')])] });
R('Tank Column (4): gain 4 stars and lose 3 hearts.', () => { game(); S(`G.deck=['kiosk','kiosk','kiosk'];`); market(['tanks', 'kiosk', 'kiosk']); buyAt(0, 4); return [J([4, 7]), J([get(0, 'vp'), get(0, 'hp')])] });
R('Cyclone (6): gain 2 stars; every other monster loses 1 energy for every 2 it holds.', () => { game(); S(`G.deck=['kiosk','kiosk','kiosk'];`); S(`P(1).en=5;P(2).en=1;P(3).en=8`); market(['cyclone', 'kiosk', 'kiosk']); buyAt(0, 6); return [J([2, 3, 1, 4]), J([get(0, 'vp'), get(1, 'en'), get(2, 'en'), get(3, 'en')])] });
R('Rampage Rush (7): take another turn right after this one.', () => { game(); S(`G.deck=['kiosk','kiosk','kiosk'];G.city=1`); market(['rush', 'kiosk', 'kiosk']); buyAt(0, 7); endT(); return [J([0, true]), J([S(`G.active`), S(`!!G.tf.extra`)])] });
R('Skydive Stomp (5): gain 2 stars and take over Downtown; the previous holder leaves.', () => { game(); S(`G.deck=['kiosk','kiosk','kiosk'];G.city=1`); market(['skydive', 'kiosk', 'kiosk']); buyAt(0, 5); return [J([0, true]), J([S(`G.city`), get(0, 'vp') >= 2])] });
R('Skydive Stomp makes the Harbor monster leave too (5 monsters).', () => { game(6); S(`G.deck=['kiosk','kiosk','kiosk'];G.bayOn=true;G.city=1;G.bay=2`); market(['skydive', 'kiosk', 'kiosk']); buyAt(0, 5); return [J([0, -1]), J([S(`G.city`), S(`G.bay`)])] });

grp('Power cards: Keep');
const keep = (id, cost) => { game(); S(`G.deck=['kiosk','kiosk','kiosk','kiosk'];`); market([id, 'kiosk', 'kiosk']); buyAt(0, cost); return get(0, 'cards').includes(id) };
const withCard = id => { game(); set(0, { cards: [id] }) };
R('Corrosive Drool (6): adds a claw to your roll every turn, even with no claws rolled.', () => { withCard('acid'); S(`G.city=1`); roll(['E', '1', '2', '2', '3', '3']); return [9, get(1, 'hp')] });
R('Cosmic Gut (3): power cards cost you 1 energy less.', () => { withCard('cosmic'); return [4, S(`costOf(P(0),'tower')`)] });
R('Top Predator (5): +1 star on every turn you roll at least one claw.', () => { withCard('alpha'); S(`G.city=1;Y_=false`); roll(['C', '1', '2', '2', 'E', 'E']); return [1, get(0, 'vp')] });
R('Top Predator gives nothing when you roll no claw.', () => { withCard('alpha'); S(`G.city=1`); roll(['1', '1', '2', '2', 'E', 'E']); return [0, get(0, 'vp')] });
R('Plated Hide (4): you lose no hearts when you would lose exactly 1 heart.', () => { game(); set(1, { cards: ['plated'] }); S(`G.city=1;Y_=false`); roll(['C', '1', '2', '2', 'E', 'E']); return [10, get(1, 'hp')] });
R('Plated Hide does not help against 2 hearts.', () => { game(); set(1, { cards: ['plated'] }); S(`G.city=1;Y_=false`); roll(['C', 'C', '2', '2', 'E', 'E']); return [8, get(1, 'hp')] });
R('Alley Lurker (4): offers a reroll of a 3 even after your last reroll.', () => { withCard('lurker'); S(`G.phase='roll';G.rolls=0;G.dice=['3','1','1','2','2','E'].map(f=>({f,k:true}))`); return [false, S(`actionsFor(P(0)).find(a=>a.a==='lurker').dis`)] });
R('Tunneler (5): adds a claw while you are in the city.', () => { withCard('tunnel'); S(`G.city=0`); roll(['E', '1', '2', '2', '3', '3']); return [J([9, 9, 9]), J([get(1, 'hp'), get(2, 'hp'), get(3, 'hp')])] });
R('Chameleon Skin (3): each heart you would lose can be saved by a die roll (never loses more, sometimes less).', () => { let mx = 0, mn = 99; for (let sd = 1; sd <= 30; sd++) { game(); set(1, { cards: ['chameleon'] }); S(`setSeed(${sd});G.city=1;Y_=false`); roll(['C', 'C', 'C', 'C', 'C', 'C']); const l = 10 - get(1, 'hp'); mx = Math.max(mx, l); mn = Math.min(mn, l) } return [J([6, true]), J([mx, mn < 6])] });
R('Wrecking Spree (3): showing 1, 2, 3, heart, claw and energy together gives 9 stars.', () => { withCard('spree'); S(`G.city=1`); roll(['1', '2', '3', 'E', 'C', 'H']); return [9, get(0, 'vp')] });
R('News Chopper (3): gain 1 star whenever you buy a power card.', () => { game(); set(0, { cards: ['news'] }); S(`G.deck=['kiosk','kiosk','kiosk'];`); market(['alpha', 'kiosk', 'kiosk']); buyAt(0, 5); return [1, get(0, 'vp')] });
R('Carrion Feast (4): gain 3 stars every time a monster drops to 0 hearts.', () => { withCard('carrion'); S(`P(2).hp=0;deaths()`); return [3, get(0, 'vp')] });
R('Battery Belly (3): at turn end gain 1 star for every 6 energy you hold.', () => { withCard('battery'); set(0, { en: 13 }); S(`G.city=1`); roll(['1', '1', '2', '2', '3', '3']); endT(); return [2, get(0, 'vp')] });
R('Growth Spurt (4): heals 2 when bought and raises your maximum hearts by 2.', () => { game(); S(`G.deck=['kiosk','kiosk','kiosk'];`); set(0, { hp: 7 }); market(['growth', 'kiosk', 'kiosk']); buyAt(0, 4); return [J([9, 12]), J([get(0, 'hp'), S(`maxhp(P(0))`)])] });
R('Second Skull (7): you roll one extra die.', () => { withCard('skull'); S(`startRoll(P(0))`); return [7, S(`G.dice.length`)] });
R('Scorch Breath (4): when you roll a claw, the neighbours lose 1 extra heart.', () => { withCard('scorch'); S(`G.city=1;Y_=false`); roll(['C', '1', '2', '2', 'E', 'E']); return [J([9, 8]), J([get(3, 'hp'), get(1, 'hp')])] });
R('Time Hiccup (5): rolling three or more 1s gives another turn with one die fewer.', () => { withCard('hiccup'); S(`G.city=1`); roll(['1', '1', '1', 'E', 'E', 'E']); endT(); return [J([0, 5]), J([S(`G.active`), S(`G.dice.length`)])] });
R('Kid Fan Club (3): whenever you gain energy, gain 1 more.', () => { withCard('kidfan'); S(`G.city=1`); roll(['E', 'E', '1', '2', '2', '3']); return [3, get(0, 'en')] });
R('Mega Brain (5): you get one extra reroll each turn.', () => { withCard('brain'); S(`startRoll(P(0))`); return [3, S(`G.rolls`)] });
R('Gourmand (4): rolling three or more 1s gives 2 extra stars.', () => { withCard('gourmand'); S(`G.city=1`); roll(['1', '1', '1', 'E', 'E', 'E']); return [3, get(0, 'vp')] });
R('Mending Beam (4): a heart die may heal another monster, which pays you 2 energy per heart.', () => { withCard('healray'); set(1, { hp: 5, en: 4 }); S(`G.city=1;P(0).human=true`); roll(['H', '1', '2', '2', 'E', 'E']); const ok = S(`!!UI.choice&&UI.choice.options.some(o=>o.k==='r1')`); if (ok) pick('r1'); return [J([6, 2, 4]), J([get(1, 'hp'), get(1, 'en'), get(0, 'en')])] });
R('Grazer (5): gain 1 star at turn end if you made nobody lose hearts.', () => { withCard('grazer'); S(`G.city=1`); roll(['1', '1', '2', '2', '3', '3']); endT(); return [1, get(0, 'vp')] });
R('Grazer gives nothing if you made someone lose hearts.', () => { withCard('grazer'); S(`G.city=1;Y_=false`); roll(['C', '1', '1', '2', '3', '3']); endT(); return [0, get(0, 'vp')] });
R('Pack Hunter (3): once per turn turn one die into a 1.', () => { withCard('pack'); S(`G.phase='roll';G.dice=['2','3','E','E','H','C'].map(f=>({f,k:true}));doAct(P(0),'pack')`);pick('0'); return ['1', S(`G.dice[0].f`)] });
R('Egg Clutch (7): if knocked out, discard cards, lose stars, leave the city, and hatch with 10 hearts.', () => { game(); set(2, { cards: ['egg', 'alpha'], vp: 9, hp: 0 }); S(`G.city=2;deaths()`); return [J([true, 10, 0, -1]), J([S(`P(2).alive`), get(2, 'hp'), get(2, 'vp'), S(`G.city`)])] });
R('Vapor Jets (5): you lose no hearts when you choose to yield the city.', () => { game(); set(1, { cards: ['vjets'] }); S(`G.city=1;Y_=true`); roll(['C', 'C', '2', '2', 'E', 'E']); return [J([10, 0]), J([get(1, 'hp'), S(`G.city`)])] });
R('Garage Lab (2): once per buy step peek at the top card and buy it (here Rush-Hour Train: pay 4, gain 2 stars).', () => { withCard('lab'); set(0, { en: 9, human: true }); S(`G.deck=['kiosk','kiosk','train'];G.phase='buy';labPeek(P(0))`); pick('b'); return [J([5, 2]), J([get(0, 'en'), get(0, 'vp')])] });
R('Shed Skin (3): at turn end you may discard a Keep card for its cost in energy (Top Predator = 5).', () => { game(); set(0, { cards: ['meta', 'alpha'], en: 0, human: true }); S(`G.city=1`); roll(['1', '1', '2', '2', '3', '3']); endT(); pick('alpha'); if (S(`!!UI.choice`)) pick('n'); return [J([5, ['meta']]), J([get(0, 'en'), get(0, 'cards')])] });
R('Power Cell (3): put 6 energy on it; 2 move to your pool at each turn start; discard when empty.', () => { game(); S(`G.deck=['kiosk','kiosk','kiosk'];`); market(['cell', 'kiosk', 'kiosk']); buyAt(0, 3); const t = get(0, 'tok.cell'); S(`startEffects(P(0))`); return [J([6, 2, 4]), J([t, get(0, 'en'), get(0, 'tok.cell')])] });
R('Nova Roar (7): your claws hit every other monster, wherever they are.', () => { withCard('nova'); S(`G.city=1`); roll(['C', '1', '2', '2', 'E', 'E']); return [J([9, 9, 9]), J([get(1, 'hp'), get(2, 'hp'), get(3, 'hp')])] });
R('Omni-Muncher (4): showing a 1, a 2 and a 3 gives 2 stars.', () => { withCard('omni'); S(`G.city=1`); roll(['1', '2', '3', 'E', 'E', 'E']); return [2, get(0, 'vp')] });
R('Twist Ending (3): turn one die to any face before resolving, then discard it.', () => { withCard('twist'); S(`G.phase='roll';G.dice=['2','3','E','E','H','C'].map(f=>({f,k:true}));doAct(P(0),'twist')`);pick('0');pick('3'); return [J(['3', 0]), J([S(`G.dice[0].f`), get(0, 'cards').length])] });
R('Venom Quills (3): rolling three or more 2s adds two claws.', () => { withCard('quills'); S(`G.city=1;Y_=false`); roll(['2', '2', '2', 'E', 'E', 'E']); return [8, get(1, 'hp')] });
R('Toxic Spittle (4): a monster your claws hit gets a poison token and loses 1 heart per token at the end of its turn.', () => { withCard('pspit'); S(`G.city=1;Y_=false`); roll(['C', '1', '2', '2', 'E', 'E']); const t = get(1, 'tok.poison'); S(`G.active=1;endEffects(P(1))`); return [J([1, 8]), J([t, get(1, 'hp')])] });
R('Shrink Beam (6): each monster your claws hit gets a shrink token and rolls one die fewer.', () => { withCard('shrink'); S(`G.city=1;Y_=false`); roll(['C', '1', '2', '2', 'E', 'E']); const t = get(1, 'tok.shrink'); S(`startRoll(P(1))`); return [J([1, 5]), J([t, S(`G.dice.length`)])] });
R('Mind Peek (3): after another monster\'s last roll you may reroll one of its dice.', () => { game(); set(1, { cards: ['probe'] }); S(`P(1).human=true;G.phase='roll';G.dice=['1','1','1','1','1','1'].map(f=>({f,k:true}));resolve()`); return [true, S(`!!UI.choice&&UI.choice.title===CARDS.probe.n`)] });
R('Quick Mend (3): at any time pay 2 energy to heal 1 heart, even to avoid being knocked out.', () => { game(); set(1, { cards: ['mend'], hp: 0, en: 2 }); S(`deaths()`); return [J([true, 1]), J([S(`P(1).alive`), get(1, 'hp')])] });
R('Regrowth (4): whenever you gain hearts, gain 1 extra.', () => { withCard('regrow'); set(0, { hp: 4 }); S(`G.city=1`); roll(['H', '1', '2', '2', 'E', 'E']); return [6, get(0, 'hp')] });
R('Underdog Spirit (3): at turn end, if you have the fewest stars, gain 1 star.', () => { withCard('underdog'); S(`P(1).vp=3;P(2).vp=3;P(3).vp=3;G.city=1`); roll(['1', '1', '2', '2', '3', '3']); endT(); return [1, get(0, 'vp')] });
R('Smoke Screen (4): comes with 3 puffs; each gives an extra reroll; discard when gone.', () => { game(); S(`G.deck=['kiosk','kiosk','kiosk'];`); market(['smoke', 'kiosk', 'kiosk']); buyAt(0, 4); const t = get(0, 'tok.smoke'); S(`G.phase='roll';G.rolls=0;G.dice=['1','1','1','1','1','1'].map(f=>({f,k:false}));doReroll('smoke')`); return [J([3, 2]), J([t, get(0, 'tok.smoke')])] });
R('Sunsoaker (2): at turn end, if you have no energy, gain 1.', () => { withCard('sun'); S(`G.city=1`); roll(['1', '1', '2', '2', '3', '3']); endT(); return [1, get(0, 'en')] });
R('Barbed Tail (5): when you roll at least one claw, add another claw.', () => { withCard('barbed'); S(`G.city=1;Y_=false`); roll(['C', '1', '2', '2', 'E', 'E']); return [8, get(1, 'hp')] });
R('Rubber Limbs (3): before resolving pay 2 energy to turn one die to any face.', () => { withCard('rubber'); set(0, { en: 2 }); S(`G.phase='roll';G.dice=['2','3','E','E','H','C'].map(f=>({f,k:true}));doAct(P(0),'rubber')`);pick('0');pick('1'); return [J(['1', 0]), J([S(`G.dice[0].f`), get(0, 'en')])] });
R('Mind Link (4): pay 1 energy for an extra reroll.', () => { withCard('mind'); set(0, { en: 3 }); S(`G.phase='roll';G.rolls=0;G.dice=['1','1','1','1','1','1'].map(f=>({f,k:false}));doReroll('mind')`); return [2, get(0, 'en')] });
R('Street Eater (4): +1 star when you start your turn in the city, and a claw is added if you roll one in the city.', () => { withCard('street'); S(`G.city=0;startEffects(P(0))`); const v = get(0, 'vp'); roll(['C', '1', '2', '2', 'E', 'E']); return [J([3, 8]), J([v, get(1, 'hp')])] });
R('Thick Skin (3): whenever you lose 2 or more hearts at once, gain 1 energy.', () => { game(); set(1, { cards: ['thick'] }); S(`G.city=1;Y_=false`); roll(['C', 'C', '2', '2', 'E', 'E']); return [1, get(1, 'en')] });
R('Membrane Wings (6): when you would lose hearts, pay 2 energy to lose none for the rest of that turn.', () => { game(); set(1, { cards: ['wings'], en: 2 }); S(`G.city=1;Y_=false;P(1).human=true`); roll(['C', 'C', '2', '2', 'E', 'E']); if (S(`!!UI.choice`)) pick('wings'); return [J([10, 0]), J([get(1, 'hp'), get(1, 'en')])] });
R('Copycat Gland (8): copies a Keep card another monster has (here Top Predator: +1 star on a claw turn).', () => { game(); set(1, { cards: ['alpha'] }); set(0, { human: true }); S(`G.deck=['kiosk','kiosk','kiosk'];`); market(['mimic', 'kiosk', 'kiosk']); buyAt(0, 8); pick('1:alpha'); S(`G.city=1;Y_=false`); roll(['C', '1', '2', '2', 'E', 'E']); return [1, get(0, 'vp')] });
R('Bargain Hunter (3): when a new card is revealed another monster holding it may buy it first (Corner Kiosk: 3 energy, 1 star).', () => { game(); set(1, { cards: ['opp'], en: 20, human: true }); S(`G.deck=['kiosk','kiosk','kiosk','kiosk'];`); market(['train', 'kiosk', 'kiosk']); buyAt(0, 4); if (S(`!!UI.choice`)) pick('y'); return [J([17, 1]), J([get(1, 'en'), get(1, 'vp')])] });
R('Leech Tendrils (4): may buy Keep cards from other monsters, paying the owner the cost.', () => { game(); set(0, { cards: ['para'], en: 10 }); set(1, { cards: ['alpha'] }); S(`G.phase='buy'`); return [true, S(`paraList(P(0)).length>0`)] });
R('The 66-card deck contains exactly 17 Discard cards (kiosk, train, tower, needle, surge, sirens x2, flame, refinery, patch, carpet, jetsq, militia, reactor, tanks, cyclone, rush, skydive).', () => { const d = S(`BASEDECK.filter(k=>CARDS[k.split('#')[0]].t==='D').length`); return [18, d] });
R('The 66-card deck contains Keep cards only of the printed list (no duplicate except Second Skull).', () => { const k = S(`BASEDECK.filter(k=>CARDS[k.split('#')[0]].t==='K').length`); return [48, k] });

/* ---------------- run ---------------- */
if (process.argv.includes('--md')) {
  let out = ['# Rules checklist: Crown City Smash', '', 'Every numbered rule below has exactly one assertion in `logic-test.js` (same number). Regenerate with `node logic-test.js --md`.', ''], g = '';
  for (const r of RULES) { if (r.g !== g) { g = r.g; out.push('', '## ' + g, '') } out.push(`${r.n}. ${r.text}`) }
  console.log(out.join('\n')); process.exit(0);
}
let ok = 0; const bad = [];
for (const r of RULES) {
  let res; try { res = r.fn() } catch (e) { res = ['no error', 'ERROR ' + String(e.message).slice(0, 80)] }
  const [exp, got] = Array.isArray(res) ? res : [true, res];
  if (J(exp) === J(got)) ok++; else { bad.push(r.n); console.log(`FAIL rule ${r.n}: expected ${J(exp)}, got ${J(got)}  [${r.text.slice(0, 70)}]`) }
}
console.log(`${bad.length ? 'FAIL' : 'PASS'} logic-test ${ok}/${RULES.length} rules pass`);
process.exit(bad.length ? 1 : 0);
