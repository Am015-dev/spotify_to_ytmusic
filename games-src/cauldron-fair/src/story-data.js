// ===== Cauldron Fair: ALL story and tutorial wording in one place (edit text here; behaviour lives in ui11.js / turnlayer.js) =====
// Cast: Granny Hask (guide, runs the Bramblemere stall), Wynne (kind rival, brews beside you), Odo (loud stall keeper), Tamsin (feather seer), Mirabel (fire brewer), Madame Vesper (holds the Golden Ladle).
const STORY = {
  guide: { id: 'hask', name: 'Granny Hask', img: 'media/camp-hask.webp' },
  rival: { id: 'wynne', name: 'Wynne', img: 'media/camp-wynne.webp' },
  // ---- Quick game: one line of flavour on the first day, one line in the result (the winner's voice)
  quickIntro: ['The lanterns are lit. Brew bold, stop wise.', 'Bramblemere Fair: the pots are on.', 'Stalls open at dusk. Mind the Fizzpods.'],
  quickWin: 'The crowd cheers your pot. The fair remembers you.',
  quickLose: 'A rival takes the crowd tonight. Tomorrow, brew bolder.',
  quickTie: 'Dead level. The judges toss a ladle.',
  // ---- the tutorial is the PROLOGUE: "The Night Before". chapters: id of the first step of each
  chapters: {
    goal: ['Ch 1 · The night before', 'Granny Hask: "Tomorrow the Golden Ladle fair opens. Tonight you and Wynne brew two practice days. Most points takes the best stall."'],
    shops1: ['Ch 3 · The stalls', 'Hask: "The potion is brewed. Now spend what you earned, apprentice."'],
    day2: ['Ch 4 · The last day', 'Hask: "Day two is the last day of the fair. Everything is on the line."'],
    report: ['Ch 2 · Counting up', 'Hask: "The pots have stopped. Let the fair count what each one earned."']
  },
  // id -> [title, say]. say may be a function. Max two short lines. The guide speaks; the glow shows where to tap, so no "click here" wording.
  steps: {
    goal: ['Ch 1 · Night before', 'Granny Hask: "Tomorrow the Golden Ladle fair opens. You and Wynne brew two practice days tonight. Most points wins."'],
    fortune: ['A fortune card', 'Hask: "Each day the fair draws a fortune. Purple happens now: the pedlar owes us rubies. Take 3."'],
    draw1: ['Reach in', 'Hask: "Rubies are shiny, chips are the brew. Reach into your bag, dear: one chip."'],
    spiral: ['It walks the spiral', () => 'Hask: "Ha! It walked ' + tn(tp().pot[0].v, 'space') + ': its number. The ring is the prize if you stop here."'],
    whites: ['The Fizzpods', 'Hask: "White Fizzpods fill the meter. Past 7 and the pot blows. Draw again, carefully."'],
    keep: ['Steady now', () => 'Hask: "Whites at ' + tws() + ' of 7. Wynne\'s pot is bubbling too. One more."'],
    flask: ['The flask', () => 'Hask: "' + tws() + ' of 7: the pot hisses! Tip the flask. It puts the last white back in the bag."'],
    seven: ['Safe at seven', 'Hask: "Phew, saved. Exactly 7 is still safe. Press on."'],
    push: ['Push your luck', 'Hask: "Seven. Any white now blows the pot. Wynne would stop here. Be bold: draw!"'],
    report: ['Ch 2 · Counting up', () => { const d = G.players[1].res && G.players[1].res.die; return 'Hask: "Spaces pay coins and points. Only a safe pot rolls the bonus die' + (d && d.length ? ': Wynne\'s did!"' : '."'); }],
    choose: ['Boom!', () => { const d = tp().q.d; return 'Hask: "Your pot went up! Take ' + tn(d.vp, 'point') + ' or ' + d.coins + ' coins to shop. Coins buy better chips: take them."'; }],
    shops1: ['Ch 3 · The stalls', 'Hask: "Now spend. Marrow is a cheap filler. Mossback pays rubies when it is one of your last two chips."'],
    shops2: ['More wares', 'Hask: "Wren Feather peeks at extra chips. Scarlet Cap slides further for every Marrow in the pot."'],
    shops3: ['Locked stalls', 'Hask: "Cinder Moth wins droplet steps. Sunroot opens on day 2, Dusk Sigh on day 3."'],
    buy: ['Buy a chip', 'Hask: "You may buy up to two chips, of different colours. Take the Wren Feather: it peeks ahead."'],
    droplet: ['The droplet', 'Hask: "Two rubies move your droplet on. Every brew then starts further along. Do it."'],
    refill: ['Refill the flask', 'Hask: "A used flask comes back for 2 rubies. Fill it, you will want it tomorrow."'],
    confirm: ['Ready for day two', 'Hask: "Chips into the bag, rubies spent. The last day awaits."'],
    day2: ['Ch 4 · Last day', 'Hask: "Last day! Blue cards last all day: the limit is 9. The rat stone helps whoever trails."'],
    d2draw: ['Draw together', 'Hask: "Today you and Wynne choose in secret, then reveal together. Reach in."'],
    peek: ['Peek and pick', 'Hask: "The feather whispers a chip. Place it as your next one, or send it back."'],
    d2stop: ['Stop here', 'Hask: "That is enough. Stopping keeps this space: its coins and points are yours."'],
    d2report: ['The final count', 'Hask: "Last day rule: every 5 coins and every 2 rubies make a point. Let us see who won."'],
    end: ['The Ladle awaits', () => { const a = G.players[0].vp, b = G.players[1].vp; return (G.winner === 0 ? 'Hask: "You win, ' + a + ' to ' + b + (a === b ? ' on the tie-break' : '') + '! Wynne grins. Tomorrow it is for real."' : G.winner < 0 ? 'Hask: "A tie, ' + a + ' each! Wynne laughs. Tomorrow it is for real."' : 'Hask: "Wynne wins, ' + b + ' to ' + a + '. She smiles. Tomorrow you get your revenge."') + ' A real fair lasts 9 days.'; }]
  },
  // ---- Story mode: a lost chapter ends with one of these (the shared kit shows one outro; turnlayer.js swaps it in when you lose)
  outroLose: {
    c1: [{ who: 'hask', text: 'The pot blew, dear. Everyone\'s does. Try again.' }],
    c2: [{ who: 'hask', text: 'Coins unspent are just weight. Shop sooner next time.' }],
    c3: [{ who: 'odo', text: 'Ha! Told you! Fresh sunroots for the loser!' }, { who: 'hask', text: 'Ignore him. Again.' }],
    c4: [{ who: 'tamsin', text: 'The feathers saw that coming. Do you want to try again?' }],
    c5: [{ who: 'hask', text: 'Three pots, and one went further. Stay close to the leader.' }],
    c6: [{ who: 'tamsin', text: 'The feathers were right. Shall we see if you can change the number?' }],
    c7: [{ who: 'mirabel', text: 'You stopped too early, or too late. Come back when you know which.' }],
    c8: [{ who: 'hask', text: 'A crowded bag is a risky bag. Count your Fizzpods and try again.' }],
    c9: [{ who: 'odo', text: 'No final for you. Better luck at the next fair!' }, { who: 'hask', text: 'Once more. We know their tricks now.' }],
    c10: [{ who: 'vesper', text: 'Not yet. The Ladle is patient. Are you?' }]
  }
};
