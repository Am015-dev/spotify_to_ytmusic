// ===================== story text: ALL the tutorial / quick-game narrative lives here (edit this file, nothing else) =====================
// Cast: Hazel Quickpaw (guide), Bramble (rival). Same cast as campaign.json. Portraits are code-drawn emoji discs until art exists.
const HBS = {
  guide: { name: 'Hazel', emoji: '🐇', color: '#7a9a4a' },
  rival: { name: 'Bramble', emoji: '🦔', color: '#a0673a' },
  // tutorial steps: title (<=4 words), say (<=20 words: the story reason, then the action), react (Hazel's reaction after the action)
  // chapter: 1 First turn, 2 Building, 3 Tricks of the trade, 4 Winter's end (the chapter opener is the first step of that chapter)
  steps: {
    goal:   { ch: 1, title: 'How you win', say: 'Most points at the end wins. Your points are the star number up here.' },
    places: { title: 'Places', say: 'On your turn, send one worker to a place. Each place says what it gives.' },
    twig:   { title: 'Take twigs', say: 'Tap Twig Heap to take 3 twigs. Buildings need twigs.', react: 'Three twigs. Half a roof already!' },
    stock:  { title: 'Your goods', say: n => 'Your goods are counted here. You have ' + n + ' twigs now. Goods pay for cards.' },
    rival:  { title: 'Bramble moved', say: r => r + ' took Pebble Bank. A place that is not shared holds one worker.' },
    resin:  { title: 'Take resin', say: 'Tap Resin Pool to take 2 resin. Your Allotment card needs resin.', react: 'Resin in hand. Now you can build.' },
    hand:   { ch: 2, title: 'Your cards', say: 'These are your cards. Each shows its cost and its points. Glowing ones you can pay for.' },
    build:  { title: 'Build a card', say: 'Tap Bramble Allotment to build it. It costs 2 twigs and 1 resin.', react: 'Built! It stays in your city.' },
    city:   { title: 'Your city', say: n => 'Your city holds ' + n + ' of 15 cards. The Allotment gave you 1 berry.' },
    prep:   { title: 'Prepare', say: 'Both workers are out. Tap Prepare: they come home, you gain one, green cards pay.', react: 'Spring! You have a new worker.' },
    spring: { title: 'A new season', say: (w, b) => 'It is Spring. You have ' + w + ' workers and ' + b + ' berries.' },
    berry:  { ch: 3, title: 'Shared places', say: 'Tap Berry Patch to take 1 berry. Shared places take any number of workers.', react: 'One more berry.' },
    toad:   { title: 'Buy from the meadow', say: 'The meadow is open to everyone. Tap Reedpunt Toad to buy it for 2 berries.', react: 'Bought! The meadow fills up again.' },
    free:   { title: 'A free card', say: 'Tap Goodwife Vole. She moves into your Allotment for free.', react: 'Free! Look for these pairs.' },
    event:  { title: 'Claim a goal', say: 'You have 3 red cards, so this goal is yours. Tap it for 3 points.', react: 'Claimed! Nobody else can take it now.' },
    forest: { title: 'The forest', say: 'Tap Bumper Bramble to take 3 berries. Forest places give more.', react: 'Three berries!' },
    pass:   { ch: 4, title: 'End your game', say: 'All workers are out. Tap Pass, then Pass again. Then points are counted.' },
    score:  { title: 'Counting points', say: (s, r, t) => 'You score ' + s.total + ': cards ' + s.cards + ', tokens ' + s.tokens + ', events ' + s.events + '. ' + r + ' scores ' + t + '.' },
    end:    { title: 'Who won', say: (w, a, b) => w ? 'You win, ' + a + ' to ' + b + '. A real game lasts four seasons.' : 'Bramble wins, ' + b + ' to ' + a + '. A real game lasts four seasons.' }
  },
  chapterDone: { 1: 'Chapter 1 complete: First Turn', 2: 'Chapter 2 complete: Building', 3: 'Chapter 3 complete: Tricks of the Trade' },
  end: { title: 'You are Steward', text: 'You know workers, goods, cards, goals, seasons and scoring.' },
  quick: { intro: 'Hazel: Build the best city before winter.', win: 'Hazel: You are the new steward!', lose: 'Hazel: Not this year. Try again next thaw.' },
  turn: { you: 'Your turn', rival: n => n + "'s turn" }
};
