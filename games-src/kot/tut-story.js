// ===== Tutorial story text (W386): ALL the tutorial's words live here. The tutorial is the PROLOGUE of the Story: Dot Inkwell (the Clarion's reporter, same
// character as in Story mode) guides, Squidrik is the rival who wants the front page. Each step: `say` = the story reason + what to do (<= 20 words, glow shows
// where), `react` = Dot's reaction after the player did it. `beats` open and close each chapter. Functions get {vp, hp, rival, card, cost}.
const TUT_STORY = {
  guide: { name: 'Dot Inkwell', img: 'camp-dot.webp', color: '#e8c547', emoji: '📰' },
  rival: { name: 'Squidrik', img: 'camp-squidrik.webp', color: '#b57bff', emoji: '🦑' },
  beats: {   // chapter -> { intro (shown as the chapter starts), outro (the payoff at its end) }
    1: { name: 'First turn', intro: 'Hold the front page! A new monster just climbed out of the portal. That’s you.', outro: 'Stars in the bank and a power card in the paw. Not bad for a first night!' },
    2: { name: 'Downtown', intro: 'Squidrik wants the crown too. Downtown pays well, but everyone hits whoever sits there.', outro: 'You held the city and knew when to run. That’s the whole trick of Crown City.' },
    3: { name: 'Outside', intro: 'Out in the streets you heal, and your claws find the monster in Downtown.', outro: 'Squidrik’s bleeding and you’re healthy. The rookie is climbing.' },
    4: { name: 'The crown', intro: 'Many turns later, the whole city is watching. One big roll from the crown.', outro: 'KING OF CROWN CITY! Tomorrow’s headline just wrote itself.' } },
  steps: {
    goal:   { say: 'The Clarion wants a headline: be first to 6 ★ in this short game. Squidrik is after it too.' },
    keep:   { say: 'Two 3s! Squidrik hates a pair. Keep both: they stay put when you roll.', react: 'Locked in. Nobody takes those.' },
    roll1:  { say: 'Now throw the rest. Squidrik is watching, so make it count.', react: 'Dice in the air…' },
    third:  { say: 'A third 3! Three of a kind pays 3 ★. Keep it too.', react: 'Three 3s: stars in the bank.' },
    energy: { say: 'Those ⚡ buy power cards from the vendors. Keep both.', react: 'Energy saved. Smart.' },
    roll2:  { say: 'One throw left. Fortune favours the bold.', react: 'Last die thrown. Time to smash!' },
    done1:  { say: 'No throws left. SMASH! Let the city hear you coming.', react: 'Downtown was empty, so you marched right in.' },
    score1: { say: g => `Three 3s, three ⚡, and Downtown is yours: +1 ★. That makes ${g.vp} ★.` },
    shop:   { say: g => `The vendors are open. Read ${g.card}: it might be your lucky card.` },
    buy:    { say: g => `Spend ${g.cost} ⚡ on it. A permanent card stays with you all game.`, react: 'Shiny! It’s yours for good.' },
    end1:   { say: 'Good haul. Saved ⚡ carry over. Pass the turn.', react: 'Squidrik is up. Brace yourself.' },
    rivals: { say: g => `${g.rival} is furious. Its claws hit whoever holds Downtown: you.` },
    stay:   { say: 'Hurt, but Downtown pays 2 ★ every turn. Hold your ground: stay.', react: 'Stubborn. I like it.' },
    bonus:  { say: g => `Staying paid off: +2 ★ at turn start, ${g.vp} ★ now. No healing in Downtown, though.` },
    done2:  { say: 'From Downtown your claws hit everyone. Stop rolling and SMASH!', react: 'Both rivals felt that!' },
    score2: { say: 'Both rivals bled. The heart did nothing: you can’t heal in Downtown.' },
    sweep:  { say: 'Don’t fancy the cards? Pay 2 ⚡ and the vendors deal fresh ones.', react: 'New stock on the shelves.' },
    end2:   { say: 'Enough shopping. Pass the turn.', react: 'Here comes trouble…' },
    yield:  { say: g => `${g.rival} hit you again. Step aside: yield, and Downtown is theirs.`, react: 'Smart retreat. Live to fight.' },
    done3:  { say: 'Outside, hearts heal you and claws hit Downtown. SMASH!', react: 'Back on the offensive!' },
    score3: { say: g => `A heart healed you to ${g.hp} ♥, and your claws hit ${g.rival} in Downtown.` },
    end3:   { say: 'Squidrik still sits in Downtown. Pass the turn and let the night go on.', react: 'And the night rolls on…' },
    later:  { say: g => `You’ve ${g.vp} ★ now. Four 3s pay 3 ★ plus 1 for the extra die. SMASH!`, react: 'Four 3s! Twenty ★ in sight!' },
    win20:  { say: g => `${g.vp} ★ is the crown. End your turn with 6 and it’s yours.`, react: 'Squidrik’s face says it all.' },
    result: { say: 'First to the goal wins at once (6 ★ here, 20 in a real game), or the last monster standing. Take a bow.' } },
};

// ===== Coached first game (Addendum 4): the player plays freely from turn 1; Dot speaks once, just in time, one bubble at a time (never blocks input, tap x to dismiss).
// `rules` are the TUTORIAL-COVERAGE.md ids this tip explains. `when()` runs after every render during the coached game. Words stay <= 22.
const me_ = () => G.pl.findIndex(p => p.human), myTurn_ = () => G.active === me_() && !G.winner && !UI.intro && !UI.choice;
const cnt_ = () => { const c = {}; G.dice.forEach(d => { c[d.f] = (c[d.f] || 0) + 1 }); return c };
const COACH_TIPS = [
  { id: 'goal', rules: ['setup', 'goal', 'roll3'], say: 'Welcome, rookie! This short game ends at 6 ★ (real games: 20), or the last monster standing. Each turn: roll six dice, up to three times.', when: () => myTurn_() && G.phase === 'roll' && G.dice.length },
  { id: 'faces', rules: ['faces'], say: 'Each die says what it does: STAR dice score in sets, ENERGY buys cards, HEAL mends you, HIT smashes rivals.', when: () => myTurn_() && G.phase === 'roll' && G.dice.length && G.rolls <= 2 },
  { id: 'preview', rules: ['preview'], say: 'See the yellow line above your dice? It shows what you would score if you smashed right now. Check it before every roll.', when: () => myTurn_() && G.phase === 'roll' && G.dice.length && G.rolls <= 2 },
  { id: 'keep', rules: ['keep', 'rekeep'], say: 'Tap dice to keep them, then Roll for the rest. Kept dice can be tapped again to roll them too.', when: () => myTurn_() && G.phase === 'roll' && G.rolls >= 1 && G.dice.length },
  { id: 'pair', rules: ['pair', 'triple'], say: 'A pair of numbers scores nothing. Three of a kind scores that number in ★. Chase the third!', when: () => myTurn_() && G.phase === 'roll' && ['1', '2', '3'].some(f => cnt_()[f] === 2) },
  { id: 'extra', rules: ['extra'], say: 'Four of a kind! Every extra matching die adds 1 ★ on top.', when: () => myTurn_() && G.phase === 'roll' && ['1', '2', '3'].some(f => cnt_()[f] >= 4) },
  { id: 'energy', rules: ['energy'], say: 'Energy dice give 1 ⚡ each. Spend ⚡ on power cards in the buy step. Unspent ⚡ is saved for later.', when: () => myTurn_() && G.phase === 'roll' && cnt_().E },
  { id: 'hearts', rules: ['hearts', 'noheal'], say: () => inCity(me_()) ? 'Hearts do nothing in Downtown: no healing there. Leave to heal.' : 'Heart dice heal 1 ♥ each, up to 10. You can’t heal inside Downtown.', when: () => myTurn_() && G.phase === 'roll' && cnt_().H },
  { id: 'claws', rules: ['claws'], say: () => inCity(me_()) ? 'From Downtown your claws hit every rival outside.' : 'From outside, your claws hit the monster in Downtown. If it’s empty, nobody is hit.', when: () => myTurn_() && G.phase === 'roll' && cnt_().C },
  { id: 'stop', rules: ['stop'], say: 'Happy with these dice? You may stop early: tap SMASH! to use them.', when: () => myTurn_() && G.phase === 'roll' && G.rolls <= 1 && G.dice.length },
  { id: 'enter', rules: ['enter'], say: 'Downtown was empty, so you moved in: +1 ★. In the city you score more, but everyone outside hits you.', when: () => myTurn_() && G.phase === 'buy' && inCity(me_()) },
  { id: 'start2', rules: ['start2'], say: 'Starting a turn in Downtown pays +2 ★. That’s the reward for holding the city.', when: () => myTurn_() && G.phase === 'roll' && G.rolls === 2 && inCity(me_()) && G.tid > 2 },
  { id: 'buy', rules: ['cards', 'types', 'sweep', 'endturn'], say: 'Power cards: tap one to read it, tap again to buy. PERMANENT stays, ONE-SHOT is used once. ♻ swaps the three for 2 ⚡. Then End turn.', when: () => myTurn_() && G.phase === 'buy' },
  { id: 'rivals', rules: ['rivals'], say: g => `${g.rival} plays too: it rolls, keeps, smashes and buys like you. Watch the caption at the top.`, when: () => !G.winner && G.active !== me_() && !UI.intro },
  { id: 'yield', rules: ['yield'], say: 'Hit in Downtown? Stay and keep earning 2 ★ a turn, or yield: you leave, and the attacker moves in.', when: () => UI.choice && /Stay or yield/.test(UI.choice.title) },
  { id: 'ko', rules: ['ko'], say: 'At 0 ♥ a monster is knocked out. Last one standing wins, even below the star goal.', when: () => G.pl.some(p => p.alive && p.hp <= 3) },
  { id: 'near', rules: ['win20'], say: 'Nearly there! End a turn holding the star goal and you win. The check happens when your turn ends.', when: () => G.pl.some(p => p.vp >= GOAL() - 4) && !G.winner },
];
// rules this short game may not show: said on the card at the end
const COACH_LATER = [
  ['harbor', 'Harbor: with 5-6 monsters a second city space opens on the water.'],
  ['tie', 'Ties: if two monsters hit the goal in one turn, the one whose turn it is wins.'],
  ['omen', 'Options: evolutions, curses and the Omen die, Brainjack, costumes, Tower and Berserk dice. Switch them on in Customise; the lightbulb explains each.'],
  ['extra-turn', 'Some cards give an extra turn right after yours.']];
