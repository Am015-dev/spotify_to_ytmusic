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
    goal:   { say: 'The Clarion wants a headline: be first to 20 ★. Squidrik is after it too.' },
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
    win20:  { say: g => `${g.vp} ★ is the crown. End your turn with 20 and it’s yours.`, react: 'Squidrik’s face says it all.' },
    result: { say: 'First to 20 ★ wins at once, or the last monster standing. Take a bow.' } },
};
