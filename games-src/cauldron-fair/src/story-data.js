// ===== Cauldron Fair: ALL story and tutorial wording in one place (edit text here; behaviour lives in ui11.js / turnlayer.js) =====
// Cast: Granny Hask (guide, runs the Bramblemere stall), Wynne (kind rival, brews beside you), Odo (loud stall keeper), Tamsin (feather seer), Mirabel (fire brewer), Madame Vesper (holds the Golden Ladle).
const STORY = {
  guide: { id: 'hask', name: 'Granny Hask', img: 'media/camp-hask.webp' },
  rival: { id: 'wynne', name: 'Wynne', img: 'media/camp-wynne.webp' },
  // ---- Quick game: one line of flavour on the first day, one line in the result (the winner's voice)
  quickIntro: ['The lanterns are lit. Brew bold, stop wise.', 'Bramblemere Fair: the pots are on.', 'Stalls open at dusk. Mind the Fizzpods.'],
  quickWin: 'The crowd cheers your pot. You win!',
  quickLose: 'A rival won this one. Try again.',
  quickTie: 'It is a tie.',
  // ---- the tutorial is the PROLOGUE: "The Night Before". chapters: id of the first step of each
  chapters: {
    goal: ['Ch 1 · The night before', 'Granny Hask: "Tomorrow the fair opens. Tonight you and Wynne play two practice days. Most points wins."'],
    shops1: ['Ch 3 · The stalls', 'Hask: "The brew is done. Spend your coins at the stalls."'],
    day2: ['Ch 4 · The last day', 'Hask: "Day two is the last day. Make it count."'],
    report: ['Ch 2 · Counting up', 'Hask: "Everyone has stopped. Time to count each pot."']
  },
  // id -> [title, say]. say may be a function. Max two short lines. The guide speaks; the glow shows where to tap, so no "click here" wording.
  steps: {
    goal: ['The goal', 'Most points after nine days wins; tonight we practise two.'],
    fortune: ['Fortune card', 'Purple fortune cards happen at once, so take the rubies.'],
    draw1: ['Draw a chip', 'Everyone draws at once: tap your bag for one chip.'],
    spiral: ['The spiral', () => 'Your chip moved ' + tn(tp().pot[0].v, 'space') + ', the number on it.'],
    ring: ['Your score space', 'The space after your last chip is the one you score.'],
    whites: ['White chips', 'White chips fill this meter; over 7 and the pot explodes.'],
    keep: ['Draw again', 'Keep going: tap your bag for another chip.'],
    stopany: ['Stop any time', 'You may stop after any chip and keep your space.'],
    keep2: ['One more', 'Still safe, so tap your bag once more.'],
    flask: ['The flask', () => 'Whites are at ' + tws() + ': tap the flask to return that white.'],
    seven: ['Seven is safe', 'The flask works once a day; draw again, 7 is safe.'],
    push: ['Push your luck', 'At 7 one more white explodes the pot; risk it.'],
    report: ['The bonus die', 'Only the furthest pot that did not explode rolls the die.'],
    die: ['Die faces', 'The die gives points, a ruby, a droplet step, or Marrow.'],
    ruby: ['Ruby spaces', 'A ruby on your score space earns you one ruby.'],
    choose: ['Boom!', 'An exploded pot scores points or coins, not both: take coins.'],
    shops1: ['Mossback', 'Mossback earns a ruby as one of your last two chips.'],
    shops2: ['Wren Feather', 'Wren Feather lets you peek at extra chips and pick one.'],
    shops3: ['Cinder Moth', 'More Cinder Moths than a neighbour wins a droplet step.'],
    shops4: ['Later stalls', 'Sunroot opens on day two, Dusk Sigh on day three.'],
    buy: ['Buy chips', 'Buy up to two chips of different colours: tap Wren Feather.'],
    droplet: ['The droplet', 'Two rubies move your droplet one space on: tap it.'],
    refill: ['Refill the flask', 'Two more rubies refill your used flask: tap it.'],
    confirm: ['Next day', 'New chips go into your bag: tap to start day two.'],
    day2: ['Blue fortune', 'Blue fortune cards last all day: today the limit is 9.'],
    rat: ['Rat tails', 'You trail, so your rat stone gives you a head start.'],
    d2draw: ['Secret draw', 'On the last day you both choose in secret: tap the bag.'],
    peek: ['Peek and pick', 'The feather found a chip: place it as your next chip.'],
    d2stop: ['Stop here', 'Stop now to keep this space, its coins and its points.'],
    d2report: ['Final count', 'No shop today: 5 coins or 2 rubies make 1 point.'],
    ties: ['Ties', 'A tie goes to whoever got furthest on the last day.'],
    six: ['Day six', 'In a full game everyone adds a white chip before day six.'],
    end: ['Well brewed', () => { const a = G.players[0].vp, b = G.players[1].vp; return G.winner === 0 ? 'You won ' + a + ' to ' + b + '; now the real fair begins.' : G.winner < 0 ? 'A tie at ' + a + ' each; now the real fair begins.' : 'Wynne won ' + b + ' to ' + a + '; win the real fair instead.'; }]
  },
  // ---- Story mode: a lost chapter ends with one of these (the shared kit shows one outro; turnlayer.js swaps it in when you lose)
  outroLose: {
    c1: [{ who: 'hask', text: 'Your pot exploded. It happens to everyone. Try again.' }],
    c2: [{ who: 'hask', text: 'Unspent coins do nothing. Shop earlier next time.' }],
    c3: [{ who: 'odo', text: 'Ha! Told you! Fresh sunroots for the loser!' }, { who: 'hask', text: 'Ignore him. Again.' }],
    c4: [{ who: 'tamsin', text: 'The feathers saw that coming. Try again?' }],
    c5: [{ who: 'hask', text: 'Another pot went further. Stay close to the leader.' }],
    c6: [{ who: 'tamsin', text: 'The feathers were right. Can you change the score?' }],
    c7: [{ who: 'mirabel', text: 'You stopped too early or too late. Try again.' }],
    c8: [{ who: 'hask', text: 'Too many Fizzpods is risky. Count them and try again.' }],
    c9: [{ who: 'odo', text: 'No final for you. Better luck at the next fair!' }, { who: 'hask', text: 'Once more. Now you know their tricks.' }],
    c10: [{ who: 'vesper', text: 'Not yet. Try again.' }]
  }
};
