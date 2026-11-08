// ===================== story text: ALL the tutorial / quick-game narrative lives here (edit this file, nothing else) =====================
// Cast: Hazel Quickpaw (guide), Bramble (rival). Same cast as campaign.json. Portraits are code-drawn emoji discs until art exists.
const HBS = {
  guide: { name: 'Hazel', emoji: '🐇', color: '#7a9a4a' },
  rival: { name: 'Bramble', emoji: '🦔', color: '#a0673a' },
  // tutorial steps: title (<=4 words), say (<=20 words: the story reason, then the action), react (Hazel's reaction after the action)
  // chapter: 1 First turn, 2 Building, 3 Tricks of the trade, 4 Winter's end (the chapter opener is the first step of that chapter)
  steps: {
    goal:   { ch: 1, title: 'Hazel: the Oak', say: 'The Elderheart Oak needs a steward. Most points wins it. Scores sit up here.' },
    places: { title: 'Hazel: the woods', say: 'Each turn, send one worker to one place. Places give goods or cards.' },
    twig:   { title: 'Hazel: a roof', say: 'A roof starts with twigs. Send a worker to the glowing Twig Heap.', react: 'Three twigs! Half a roof already.' },
    stock:  { title: 'Hazel: your pantry', say: n => 'Twigs, resin, pebbles and berries pay for buildings. You hold ' + n + ' twigs now.' },
    rival:  { title: 'Bramble beat you', say: r => r + ' took the Pebble Bank. A place without the Shared mark holds one worker.' },
    resin:  { title: 'Hazel: sticky work', say: 'A roof needs glue. Send your second worker to the Resin Pool.', react: 'Resin in hand. Chapter 1 done: you can gather!' },
    hand:   { ch: 2, title: 'Chapter 2: Building', say: 'These cards are your plans. Each shows its price. Glowing ones are affordable.' },
    build:  { title: 'Hazel: raise it', say: 'Build the Allotment: pay 2 twigs and 1 resin. It feeds you every spring.', react: 'A building! Your first stone in the valley.' },
    city:   { title: 'Hazel: your city', say: n => 'Buildings live here: ' + n + ' of 15 at most. The Allotment gave a berry.' },
    prep:   { title: 'Hazel: spring comes', say: 'All workers are out. Tap Prepare. They come home and you gain one.', react: 'Spring! Warm days and a new pair of hands.' },
    spring: { title: 'Hazel: new season', say: (w, b) => 'Spring: ' + w + ' workers, ' + b + ' berries. Seasons go Winter, Spring, Summer, Autumn.' },
    berry:  { ch: 3, title: 'Chapter 3: Shared', say: 'Shared places take many workers. Send one to the Berry Patch.', react: 'Berries for the pot. Bramble does not mind.' },
    toad:   { title: 'Hazel: the meadow', say: 'Anyone can buy from the meadow. Critters cost berries. Buy the Toad.', react: 'Bought! The meadow refills for Bramble.' },
    free:   { title: 'Hazel: a free lodger', say: 'A critter moves into its matching building free. The Goodwife fits your Allotment.', react: 'She moved in for free. That is the trick!' },
    event:  { title: 'Hazel: a flag', say: 'Three red buildings earn a flag. Send a worker to it for three points.', react: 'Claimed! Nobody else can take that one.' },
    forest: { title: 'Hazel: the forest', say: 'The forest pays more. Send your last worker to Bumper Bramble.', react: 'A heap of berries. Chapter 3 done!' },
    pass:   { ch: 4, title: 'Chapter 4: Winter ends', say: 'This lesson ends here. Tap Pass twice to finish.' },
    score:  { title: 'Hazel: the count', say: s => 'Cards ' + s.cards + ', tokens ' + s.tokens + ', events ' + s.events + '. You score ' + s.total + '.' },
    rscore: { title: 'Bramble: my count', say: (r, t) => r + ' scores ' + t + ' the same way. Passing early wastes workers.' },
    end:    { title: 'The Oak decides', say: (w, a, b) => w ? 'You win the Oak, ' + a + ' to ' + b + '. A real game has all four seasons.' : 'The higher total wins the Oak. A real game has all four seasons.' }
  },
  chapterDone: { 1: 'Chapter 1 complete: First Turn', 2: 'Chapter 2 complete: Building', 3: 'Chapter 3 complete: Tricks of the Trade' },
  end: { title: 'You are Steward', text: 'Hazel nods. You know workers, goods, cards, events, seasons and scoring.' },
  quick: { intro: 'Hazel: Build the best city before winter.', win: 'Hazel: You are the new steward!', lose: 'Hazel: Not this year. Try again next thaw.' },
  turn: { you: 'Your turn', rival: n => n + "'s turn" }
};
