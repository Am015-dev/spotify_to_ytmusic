// ===================== story text: ALL the tutorial / quick-game narrative lives here (edit this file, nothing else) =====================
// Cast: Hazel Quickpaw (guide), Bramble (rival). Same cast as campaign.json. Portraits are code-drawn emoji discs until art exists.
const HBS = {
  guide: { name: 'Hazel', emoji: '🐇', color: '#7a9a4a' },
  rival: { name: 'Bramble', emoji: '🦔', color: '#a0673a' },
  // tutorial steps: title (<=4 words), say (<=12 words, one tap), react (Hazel's reaction after the action)
  // chapter: 1 First turn, 2 Building, 3 Tricks of the trade, 4 Winter's end (the chapter opener is the first step of that chapter)
  steps: {
    goal:    { ch: 1, title: 'How you win', say: 'Most points wins. You start with 3 built cards, worth 6 points.' },
    places:  { title: 'Your turn', say: 'Each turn: send a worker, play a card, or prepare.' },
    twig:    { title: 'Take twigs', say: 'Tap Twig Heap for 3 twigs. Only one worker fits there.', react: 'Three twigs!' },
    stock:   { title: 'Your goods', say: n => 'You have ' + n + ' twigs. Goods pay for cards.' },
    rival:   { title: 'Bramble moved', say: r => r + ' took Pebble Bank. Unshared places hold one worker.' },
    resin:   { title: 'Take resin', say: 'Tap Resin Pool to take 2 resin.', react: 'Resin! Now you can build.' },
    hand:    { ch: 2, title: 'Your cards', say: 'Your cards. Each shows cost and points. You hold up to 8.' },
    build:   { title: 'Build a card', say: 'Tap Bramble Allotment to build it. It costs 2 twigs, 1 resin.', react: 'Built! It stays in your city.' },
    city:    { title: 'Your city', say: n => 'Your city: ' + n + ' of 15. Unique cards: one each. Common: any number.' },
    prep:    { title: 'Prepare', say: 'All workers out. Tap Prepare: workers return, plus one, green cards pay.', react: 'Spring! A new worker.' },
    spring:  { title: 'A new season', say: (w, b) => 'Spring! You have ' + w + ' workers and ' + b + ' berries.' },
    berry:   { ch: 3, title: 'Shared places', say: 'Tap Berry Patch. Shared places take any number of workers.', react: 'One more berry.' },
    toad:    { title: 'The meadow', say: 'The meadow holds 8 cards for all. Tap Reedpunt Toad: 2 berries.', react: 'Bought! The meadow refills.' },
    free:    { title: 'A free critter', say: 'Tap Goodwife Vole. She moves into your Allotment free.', react: 'Free! Look for these pairs.' },
    event:   { title: 'Claim an event', say: 'You have 3 red cards. Tap this event for 3 points.', react: 'Claimed! Nobody else can take it.' },
    forest:  { title: 'The forest', say: 'Tap Bumper Bramble for 3 berries. Forest places give more.', react: 'Three berries!' },
    prep2:   { ch: 4, title: 'Summer comes', say: 'Workers out again. Tap Prepare for Summer.', react: 'Summer! One more worker.' },
    summer:  { title: 'Summer cards', say: 'Summer lets you take 2 meadow cards. Tap two cards.', react: 'Two new cards.' },
    haven:   { title: 'The Haven', say: 'The Haven turns 2 cards into 1 good. Tap it.' },
    journey: { title: 'The Journey', say: 'The Journey opens in Autumn. Discard cards there for points. Tap it.' },
    inn:     { title: 'Your Inn', say: 'Your Inn: buy a meadow card 3 cheaper. Rivals too. Tap it.' },
    special: { title: 'Special events', say: 'Special events need two named cards. Tap one to see.' },
    autumn:  { title: 'Autumn', say: 'Autumn gives 2 more workers, and green cards pay again.' },
    pass:    { title: 'End your year', say: 'Real games end in Autumn. Tap Pass twice to end now.' },
    score:   { title: 'Counting points', say: (s, r, t) => 'You: ' + s.total + '. Cards ' + s.cards + ', tokens ' + s.tokens + ', events ' + s.events + '. ' + r + ': ' + t + '.' },
    bonus:   { title: 'Bonus points', say: 'Purple cards add bonus points. Ties go to most events.' },
    end:     { title: 'Who won', say: (w, a, b) => (w ? 'You win, ' + a + ' to ' + b + '.' : 'Bramble wins, ' + b + ' to ' + a + '.') + ' Now play a real game!' }
  },
  chapterDone: { 1: 'Chapter 1 complete: First Turn', 2: 'Chapter 2 complete: Building', 3: 'Chapter 3 complete: Tricks of the Trade', 4: 'Chapter 4 complete: The Year Turns' },
  end: { title: 'You are Steward', text: 'You know every rule. Your real game starts now.' },
  quick: { intro: 'Hazel: Build the best city before winter.', win: 'Hazel: You are the new steward!', lose: 'Hazel: Not this year. Try again next thaw.' },
  turn: { you: 'Your turn', rival: n => n + "'s turn" }
};
