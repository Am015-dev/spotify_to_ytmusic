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
    goal: ['Ch 1 · Night before', 'Granny Hask: "Tomorrow the fair opens. Tonight you and Wynne play two practice days. Most points wins."'],
    fortune: ['A fortune card', 'Hask: "Each day starts with a fortune card. Purple cards are instant. Take 3 rubies."'],
    draw1: ['Reach in', 'Hask: "Tap your bag to pull one chip."'],
    spiral: ['It walks the spiral', () => 'Hask: "It moved ' + tn(tp().pot[0].v, 'space') + ', its number. The ring marks your score if you stop."'],
    whites: ['The Fizzpods', 'Hask: "White Fizzpods fill the meter. Over 7 and the pot explodes. Draw again."'],
    keep: ['Steady now', () => 'Hask: "Whites at ' + tws() + ' of 7. Draw one more.\'s pot is bubbling too. One more."'],
    flask: ['The flask', () => 'Hask: "' + tws() + ' of 7is risky. Tap the flask to put the last white back."'],
    seven: ['Safe at seven', 'Hask: "The white is back in your bag. Exactly 7 is safe. Draw again."'],
    push: ['Push your luck', 'Hask: "At 7, any white chip explodes the pot. Tap the bag to risk it."'],
    report: ['Ch 2 · Counting up', () => { const d = G.players[1].res && G.players[1].res.die; return 'Hask: "Your space pays coins and points. Only safe pots roll the bonus die' + (d && d.length ? ': Wynne\'s did!"' : '."'); }],
    choose: ['Boom!', () => { const d = tp().q.d; return 'Hask: "Your pot exploded. Pick ' + tn(d.vp, 'point') + ' or ' + d.coins + ' coins. Take the coins to shop."'; }],
    shops1: ['Ch 3 · The stalls', 'Hask: "Marrow is cheap and has no power. Mossback gives rubies when it is one of your last two chips."'],
    shops2: ['More wares', 'Hask: "Wren Feather peeks at extra chips. Scarlet Cap moves further for each Marrow in your pot."'],
    shops3: ['Locked stalls', 'Hask: "Cinder Moth wins droplet steps. Sunroot opens on day 2. Dusk Sigh opens on day 3."'],
    buy: ['Buy a chip', 'Hask: "Buy up to two chips of different colours. Take the Wren Feather."'],
    droplet: ['The droplet', 'Hask: "Spend 2 rubies to move your droplet one space. Tap it."'],
    refill: ['Refill the flask', 'Hask: "Refill a used flask for 2 rubies. Tap the flask."'],
    confirm: ['Ready for day two', 'Hask: "Your chips go in the bag. Day two is next."'],
    day2: ['Ch 4 · Last day', 'Hask: "Last day! The limit is 9 today. The rat stone helps whoever is behind."'],
    d2draw: ['Draw together', 'Hask: "You and Wynne choose in secret, then show together. Tap your bag."'],
    peek: ['Peek and pick', 'Hask: "The feather shows a chip. Place it as your next chip, or put it back."'],
    d2stop: ['Stop here', 'Hask: "Stopping keeps this space, with its coins and points. Tap Stop."'],
    d2report: ['The final count', 'Hask: "Every 5 coins and every 2 rubies make 1 point. Tap to see who won."'],
    end: ['The Ladle awaits', () => { const a = G.players[0].vp, b = G.players[1].vp; return (G.winner === 0 ? 'Hask: "You win, ' + a + ' to ' + b + (a === b ? ' on the tie-break' : '') + '! Wynne grins. The real fair starts tomorrow."' : G.winner < 0 ? 'Hask: "A tie, ' + a + ' each! Wynne laughs. Tomorrow it is for real."' : 'Hask: "Wynne wins, ' + b + ' to ' + a + '. She smiles. Win it back tomorrow."') + ' A real fair lasts 9 days.'; }]
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
