// Kaiten Kitchen: ALL story text in one data file (edit here; nothing else holds story wording). Cast and arc: ../STORY.md.
// Voice: warm, punchy, two short lines at most per bubble. No "click here" wording: the glow shows where.
// Tutorial = the PROLOGUE: "The Staff Lunch". Auntie Suzu (guide) teaches Mina; Odile, the dessert chef, bets the last custard on the lunch.
KK.STORY = {
  guide: { name: 'Auntie Suzu', emoji: '🍵', color: '#b5452a', portrait: 'camp-suzu.webp' },
  rivalId: 'odile',
  // one line in the game's own voice when a Quick game starts and ends
  quickIntro: 'Welcome to the Turning Plate. The belt rolls!',
  quickResult: { win: 'You cleared the belt. Auntie Suzu is proud.', lose: '%R takes the Golden Plate. Same belt tomorrow?', tie: 'A dead heat. The belt keeps turning.' },
  // Help opens with these five lines
  turn: ['1. Everyone looks at their own hand of plates.', '2. Pick ONE plate. Everybody picks at the same time.', '3. The covers lift, one diner after another, and each plate lands on its owner\'s counter.', '4. Your points pop up with the reason.', '5. Your leftover hand slides to the next diner, theirs comes to you. Repeat until the hands are empty.'],
  // the live-turn instruction line (banner | text, 8 words at most together: gate rule 5); %N = next diner, %R = a rival
  say: {
    mine: 'Your turn|Tap a dish to take it.',
    twin: 'Your turn|Tap two dishes.',
    twin2: 'Your turn|Tap a second dish.',
    tap2: 'Your turn|Tap it again.',
    wait: '%R\'s turn|Waiting for %R.',
    cover: 'Picks are in|Covers lift one by one.',
    land: 'Scoring|Dishes land on counters.',
    pass: 'Hands pass|Leftovers go to %N.',
    roundEnd: 'Round over|Counting the counters.'
  },
  // tutorial chapters: a beat before (open) and a payoff after (done). Shown as story cards in the bubble.
  chapters: {
    c1: { title: 'Chapter 1: The first plate', open: 'Staff lunch! Odile bet a custard you can\'t beat her.' },
    c2: { title: 'Chapter 2: Sets and sauce', open: 'Plates score more together. Hot paste, clever tricks.' },
    c3: { title: 'Chapter 3: The big three', open: 'Sets, a roll race, a bun ladder. The belt keeps moving.' },
    c4: { title: 'Chapter 4: The count', open: 'Lunch is over. Now the counters are counted aloud.' }
  },
  // per step: s = the story reason + the action (2 lines max), r = Suzu's reaction after the player acts, t = bubble title
  tut: {
    goal: { t: 'Welcome, Mina', s: 'Have the most points after the meal. That wins.' },
    chef: { t: 'Odile', s: 'Odile bet a custard against you. She plays by the same rules.' },
    belt: { t: 'Your plates', s: 'Take one plate. Pass the rest to Odile.' },
    pick1: { t: 'Take one dish', s: 'Start with a Crispy Prawn. Prawns love company.', r: 'Nice. Both covers lift, and the hands swap!' },
    passed: { t: 'The swap', s: 'Odile\'s leftovers are yours now. Plates rode the belt over.' },
    pick2: { t: 'A pair scores 5', s: 'A second prawn makes a pair: 5 points!', r: 'A pair! Prawns are happy.' },
    paste: { t: 'Fire Paste', s: 'Hot paste triples the next nigiri. Take it first.', r: 'Smart. The paste waits for a nigiri.' },
    nigiri: { t: 'Nigiri on paste', s: 'The Moon Nigiri lands on the paste: 3 becomes 9!', r: 'Nine points from one plate!' },
    sticksTake: { t: 'Twin Sticks', s: 'Sticks let you take two plates later. Keep them handy.', r: 'The sticks are yours. Use them next turn.' },
    sticksUse: { t: 'Use the sticks', s: 'Time for a double helping. Pick up the sticks.', r: 'Two plates this turn. Odile is nervous.' },
    twinA: { t: 'First dish', s: 'Fish Slices score 10 for three. Grab one.' },
    twinB: { t: 'Second dish', s: 'Grab the other. Sticks go back in the hand you pass.', r: 'Two Fish Slices! One more makes a set.' },
    fish3: { t: 'Complete the set', s: 'Three Fish Slices: 10 points. Find the third.', r: 'A full set. 10 points!' },
    roll: { t: 'Seaweed Rolls', s: 'Rolls race for icons. Most icons wins 6.', r: 'Three icons! Odile has one.' },
    bun: { t: 'Steam Buns', s: 'Each bun beats the last: 1, 3, 6, 10, 15.', r: 'The first bun: 1 point. More buns, more points.' },
    custard: { t: 'Custard Cup', s: 'Custard pays at the end of the game. Most cups gets 6.', r: 'Custard saved for the final count.' },
    scoreSets: { t: 'Sets counted', s: 'Prawn pair, Fish Slice set, and a Steam Bun.' },
    scoreRoll: { t: 'The roll race', s: 'More icons than Odile: you take the big prize.' },
    scoreNigiri: { t: 'Nigiri and paste', s: 'Your Moon Nigiri on the paste is the star plate.' },
    scoreChef: { t: 'Odile\'s tray', s: 'Same rules for her. Her lone Fish Slice scores nothing.' },
    scoreCustard: { t: 'Custard counts', s: 'Custard only pays at the very end of a meal.' },
    end: { t: 'The meal ends', s: 'Odile owes you a custard. A real meal lasts three rounds.' }
  },
  // chapter payoff lines (shown with the first step of the next chapter)
  payoff: {
    c1: 'First plate, first swap. You are a diner now.',
    c2: 'Paste, nigiri, sticks. A clever kitchen!',
    c3: 'A set, a race and a ladder. Not bad at all.',
    c4: 'The count is done. Now you are ready for real meals.'
  },
  result: { win: 'The Turning Plate cheers for you.', lose: 'The belt turns on. There is always the next meal.' },
  // the COACHED first game (replaces the tap-step prologue): Suzu speaks just-in-time, one bubble at a time, never blocking input.
  // ids = the rules in ../TUTORIAL-COVERAGE.md. %n = a number, %r = the rival. who: s = Suzu, o = the rival.
  coach: {
    intro: { w: 's', t: 'Odile bet you a custard, Mina. Pick any dish!' },
    pass: { w: 's', t: 'Picks flip together. Your leftovers ride the belt onward.' },
    pair: { w: 's', t: 'Prawns score 5 per PAIR. One more makes a pair.' },
    pair2: { w: 's', t: 'A pair of prawns: 5 points. Every pair scores.' },
    fish: { w: 's', t: 'Three Fish Slices score 10. One or two score nothing.' },
    bun: { w: 's', t: 'Steam Buns climb: 1, 3, 6, 10, then 15. Stack them!' },
    roll: { w: 's', t: 'Roll race: most icons wins 6, second wins 3.' },
    nigiri: { w: 's', t: 'Nigiri score on their own: Sun 1, Sunset 2, Moon 3.' },
    paste: { w: 's', t: 'Fire Paste triples your NEXT nigiri. Paste first, nigiri after!' },
    pasteNigiri: { w: 's', t: 'Nigiri on Fire Paste: tripled! The best trick on the belt.' },
    sticks: { w: 's', t: 'Twin Sticks: tap them later to take two dishes.' },
    custard: { w: 's', t: 'Custard pays at the very end: most +6, fewest -6.' },
    rival: { w: 'o', t: 'Fire Paste for me. My next nigiri triples, Mina!' },
    rival2: { w: 'o', t: 'Rolls are mine this round. You will have to race me!' },
    good: { w: 's', t: 'Lovely pick! The green +N shows what a plate scores now.' },
    poor: { w: 's', t: 'Hmm. %n was worth more. Check the green +N first.' },
    rounds: { w: 's', t: 'Round 2: a new hand. Only Custard Cups stay.' },
    round3: { w: 's', t: 'Last round! Custard gets counted right after it.' },
    walk: { w: 's', t: 'Round scored. Let us count it together, rule by rule.' },
    makiTie: { w: 's', t: 'A roll tie! The tied diners split 6. Nobody gets second.' },
    custardEnd: { w: 's', t: 'Custard: most cups +6, fewest -6. Ties split.' },
    penalty: { w: 's', t: 'With three diners, the fewest cups LOSES 6.' },
    custardTie: { w: 's', t: 'Custard ties split the points, rounded down.' },
    tieBreak: { w: 's', t: 'Equal totals? More Custard Cups wins the meal.' }
  }
};
