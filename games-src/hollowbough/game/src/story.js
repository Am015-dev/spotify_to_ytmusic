// ===================== story text: ALL the tutorial / quick-game narrative lives here (edit this file, nothing else) =====================
// Cast: Hazel Quickpaw (guide), Bramble (rival). Same cast as campaign.json. Portraits are code-drawn emoji discs until art exists.
const HBS = {
  guide: { name: 'Hazel', emoji: '🐇', color: '#7a9a4a' },
  rival: { name: 'Bramble', emoji: '🦔', color: '#a0673a' },
  // tutorial steps: title (<=4 words), say (<=20 words: the story reason, then the action), react (Hazel's reaction after the action)
  // chapter: 1 First turn, 2 Building, 3 Tricks of the trade, 4 Winter's end (the chapter opener is the first step of that chapter)
  steps: {
    goal:   { ch: 1, title: 'Hazel: the Oak', say: 'The thaw is here and the Elderheart Oak needs a steward. Most points when both pass wins it. Scores sit up here.' },
    places: { title: 'Hazel: the woods', say: 'The woods are generous. Every place gives goods or cards, and each turn you send one worker to one place.' },
    twig:   { title: 'Hazel: a roof', say: 'A roof starts with twigs. Send a worker to the glowing Twig Heap.', react: 'Three twigs! Half a roof already.' },
    stock:  { title: 'Hazel: your pantry', say: n => 'Twigs, resin, pebbles and berries pay for buildings. You hold ' + n + ' twigs now.' },
    rival:  { title: 'Bramble beat you', say: r => r + ' raced to the Pebble Bank. A place without the Shared mark holds one worker only.' },
    resin:  { title: 'Hazel: sticky work', say: 'A roof needs glue. Send your second worker to the Resin Pool.', react: 'Resin in hand. Chapter 1 done: you can gather!' },
    hand:   { ch: 2, title: 'Chapter 2: Building', say: 'Bramble is already hammering. These cards are your plans: each shows its price, and glowing ones you can afford.' },
    build:  { title: 'Hazel: raise it', say: 'Raise the Allotment: pay 2 twigs and 1 resin. It will feed you every spring.', react: 'A building! Your first stone in the valley.' },
    city:   { title: 'Hazel: your city', say: n => 'Buildings live here, ' + n + ' of 15: that is the limit. The Allotment already gave a berry.' },
    prep:   { title: 'Hazel: spring comes', say: 'Every worker is out. Prepare: they come home, you gain one, and the Allotment grows a berry.', react: 'Spring! Warm days and a new pair of hands.' },
    spring: { title: 'Hazel: new season', say: (w, b) => 'Spring: ' + w + ' workers, ' + b + ' berries. Seasons run Winter, Spring, Summer, Autumn. Chapter 2 done!' },
    berry:  { ch: 3, title: 'Chapter 3: Shared', say: 'Even rivals share. Shared places take many workers: send one to the Berry Patch.', react: 'Berries for the pot. Bramble does not mind.' },
    toad:   { title: 'Hazel: the meadow', say: 'The meadow is open to everyone. Critters cost berries: buy the Toad.', react: 'Bought! The meadow refills for Bramble.' },
    free:   { title: 'Hazel: a free lodger', say: 'A critter moves into its matching building free. The Goodwife loves your Allotment.', react: 'She moved in for free. That is the trick!' },
    event:  { title: 'Hazel: a flag', say: 'Three red buildings earn a flag. Send a worker to the glowing flag: three points.', react: 'Claimed! Nobody else can take that one.' },
    forest: { title: 'Hazel: the forest', say: 'The forest pays more. Send your last worker to Bumper Bramble for berries.', react: 'A heap of berries. Chapter 3 done!' },
    pass:   { ch: 4, title: 'Chapter 4: Winter ends', say: 'Summer would bring more hands, but our tale is short. Pass now: tap Pass twice to end the season.' },
    score:  { title: 'Hazel: the count', say: s => 'Cards ' + s.cards + ', tokens ' + s.tokens + ', events ' + s.events + '. You score ' + s.total + '. Every point is a home.' },
    rscore: { title: 'Bramble: my count', say: (r, t) => r + ' scores ' + t + ' the same way. Passing early leaves workers unused.' },
    end:    { title: 'The Oak decides', say: (w, a, b) => w ? 'The Oak bows to you, ' + a + ' to ' + b + '. A real game plays all four seasons.' : 'The Oak picks the higher total. A real game plays all four seasons.' }
  },
  chapterDone: { 1: 'Chapter 1 complete: First Turn', 2: 'Chapter 2 complete: Building', 3: 'Chapter 3 complete: Tricks of the Trade' },
  end: { title: 'You are Steward', text: 'Hazel nods: workers, goods, cards, events, seasons, scoring. The Oak is yours to keep.' },
  quick: { intro: 'Hazel: A fresh thaw. Build the finest city before winter.', win: 'Hazel: The Oak has a new steward!', lose: 'Hazel: Not this year. The Oak waits for next thaw.' },
  turn: { you: 'Your turn', rival: n => n + "'s turn" }
};
