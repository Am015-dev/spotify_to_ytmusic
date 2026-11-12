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
    shops1: ['Ch 3 · The stalls', 'Granny Hask: "The brew is done. Spend your coins at the stalls."'],
    day2: ['Ch 4 · The last day', 'Granny Hask: "Day two is the last day. Make it count."'],
    report: ['Ch 2 · Counting up', 'Granny Hask: "Everyone has stopped. Time to count each pot."']
  },
  // id -> [title, say]. say may be a function. Max two short lines. The guide speaks; the glow shows where to tap, so no "click here" wording.
  steps: {
    goal: ['The goal', 'Most points after nine days wins; tonight we practise two.'],
    fortune: ['Fortune card', 'Purple fortune cards happen at once, so take the rubies.'],
    draw1: ['Draw a chip', 'Everyone draws at once: tap your bag for one chip.'],
    keep: ['Moves and scores', () => 'It moved ' + tn(tp().pot[0].v, 'space') + ' and you score the next space; draw again.'],
    keep2: ['White chips', 'Whites fill the meter, over 7 explodes; stop any time, or draw.'],
    flask: ['The flask', () => 'Whites are at ' + tws() + ': tap the flask to return that white.'],
    seven: ['Seven is safe', 'The flask works once a day; draw again, 7 is safe.'],
    push: ['Push your luck', 'At 7 one more white explodes the pot; risk it.'],
    report: ['The bonus die', 'The furthest safe pot rolls: points, a ruby, droplet or orange.'],
    choose: ['Boom!', 'An exploded pot scores points or coins, not both: take coins.'],
    shops: ['The stalls', 'Stalls say what chips do; yellow opens day 2, purple day 3.'],
    buy: ['Buy chips', 'Buy up to two chips of different colours: tap Wren Feather.'],
    droplet: ['The droplet', 'Two rubies move your droplet one space on: tap it.'],
    refill: ['Refill the flask', 'Two more rubies refill your used flask: tap it.'],
    confirm: ['Next day', 'Chips join your bag (day 6 adds a white); start day 2.'],
    day2: ['Blue fortune', 'Blue cards last all day, so today the limit is 9.'],
    rats: ['Rat tails', () => { const p = tp(), o = G.players.reduce((m, x) => Math.max(m, x.vp), 0); return 'You ' + p.vp + ', leader ' + o + ': ' + tn(p.ratTails, 'rat tail') + ' between, one every second space.'; }],
    d2draw: ['Last day', () => 'So your rat starts you ' + tn(tp().ratTails, 'space') + ' ahead; draw in secret.'],
    red: ['Red chip', 'New chips in your bag: red moves 1 extra after an orange.'],
    redsaw: ['It jumped', 'Red jumped one extra space, so draw again.'],
    yellow: ['A white', 'A white came; draw, since yellow after a white can return it.'],
    yback: ['Yellow helps', 'Yellow came after a white: send that white back.'],
    bdraw: ['Blue chip', 'Draw: your blue feather peeks at a chip for you.'],
    peek: ['Peek and pick', 'Place the purple: one purple pays 1 point at the count.'],
    black: ['Black chip', 'Draw: more Cinder Moths than a neighbour wins a droplet step.'],
    green: ['Green chip', 'Draw again: a Mossback in your last two chips pays a ruby.'],
    d2stop: ['Stop here', 'Stop: score this space; a ruby on it pays one.'],
    chipfx: ['After the brew', 'Your moth won a droplet step and ruby; your moss, a ruby.'],
    d2report: ['Final count', 'No shop today: 5 coins or 2 rubies make 1 point.'],
    end: ['Well brewed', () => { const a = G.players[0].vp, b = G.players[1].vp; return (G.winner === 0 ? 'You won ' + a + ' to ' + b : G.winner < 0 ? 'A tie at ' + a : 'Wynne won ' + b + ' to ' + a) + ', and ties go to the furthest pot.'; }]
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
