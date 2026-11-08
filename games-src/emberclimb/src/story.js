// Emberclimb story: ALL narrative text lives here (cast, tutorial prologue, Story chapter scenes, boss lines, Quick game lines). Edit freely.
// Original names only. Tutorial entries: say = story reason + what to do (max 2 short lines), react = what the guide says after it is done.
window.EC_STORY = {
  cast: {
    guide: { name: 'Warden Ashgrove', role: 'last keeper of the Cinder Tower', emoji: '🔥', color: '#c8472b' },
    rival: { name: 'The Gatekeeper', role: 'iron lord who wants the tower sealed', emoji: '🚪', color: '#7a6a5a' }
  },
  // the tutorial is the prologue: Garrick's first climb, the night the Gatekeeper starts to close the summit gate
  prologue: {
    chapters: [
      { title: 'Prologue 1: The First Ember', intro: 'The summit ember is fading, and the Gatekeeper means to seal it away for good.', outro: 'Your first foe is down. The tower noticed you.' },
      { title: 'Prologue 2: The Mire Path', intro: 'The Gatekeeper sends his iron sentries down the stair to stop you.', outro: 'You fought dirty magic and won. Onward.' },
      { title: 'Prologue 3: The Quiet Floors', intro: 'Between fights the tower offers rest, trade and strange bargains.', outro: 'Rested, armed, a little richer. The crown room waits.' },
      { title: 'Prologue 4: The Gate', intro: 'His captain guards the last door. Beat it before the gate locks.', outro: 'The gate stays open. The ember lives, for now.' }
    ],
    steps: {
      setup: { say: 'I am Ashgrove, keeper of this tower. You are Garrick: 80 HP, ten honest cards.\nIf your HP hits 0, the climb is over.', react: 'Good. Steady hands. Let us begin.' },
      intent: { say: 'A Gnawer blocks the stair. Above it you can read its next move:\nit will bite for 4.', react: 'Always read them first. Monsters are honest about that much.' },
      energy: { say: 'Each turn you draw 5 cards and hold 3 embers of energy.\nA card costs the number in its corner.', react: 'Spend it all. Embers do not keep overnight.' },
      attack: { say: 'Crack its hide open with Anvil Blow:\nit hits and leaves the beast Vulnerable.', react: 'Hear that crack? Vulnerable. Your next hit lands double.' },
      block: { say: 'That bite is coming. Raise Plate Guard:\nBlock soaks damage until your next turn.', react: 'Shield up. Let it come.' },
      end: { say: 'Your embers are spent. End your turn\nand let the beast make its move.', react: 'Now we watch. Never look away from an enemy turn.' },
      enemyturn: { say: 'It bit, and your Block ate the damage.\nBlock fades when your next turn starts.', react: 'Not a scratch. That is how a warden fights.' },
      piles: { say: 'Draw: cards still waiting. Used: cards you played.\nWhen Draw runs dry, Used is shuffled back in.', react: 'Your deck is a wheel. It always comes round.' },
      finish: { say: 'It is Vulnerable and wobbling.\nFinish it with Cinder Strike.', react: 'Down it goes! The first ember of your climb is lit.' },
      reward: { say: 'Every win teaches you something new.\nAdd this card to your deck.', react: 'A sharper deck climbs higher.' },
      leave1: { say: 'The stair goes on.\nBack to the map.', react: '' },
      map: { say: 'The tower map: glowing rooms are your next step.\nA chest gleams ahead. Go claim it.', react: '' },
      relic: { say: 'An old relic, warm to the touch.\nTake it: its gift lasts the whole climb.', react: 'It likes you. Relics choose their bearers.' },
      leave2: { say: 'Back to the stair.', react: '' },
      map2: { say: 'Crossed swords: the Gatekeeper\'s sentries.\nMeet them.', react: '' },
      junkintent: { say: 'An Iron Warden. It will stuff 2 Dazed into your deck:\njunk cards you can never play.', react: 'His sentries fight dirty. So will we.' },
      potion: { say: 'Potions are free and break after one use.\nPour the Venom Vial on it.', react: 'Hiss! Poison is in its gears now.' },
      poison: { say: 'Poison bites at the end of your turn, through any Block.\nAnd it stays until the thing falls.', react: '' },
      power: { say: 'Powers burn for the whole fight.\nPlay Kindle: +2 Strength on every hit.', react: 'Feel that fire in your arms? Every swing hits 2 harder.' },
      exhaust: { say: 'Roar at it: it goes Weak and hits softer.\nThe roar exhausts: gone until the next fight.', react: 'It flinched. Weak things hit soft.' },
      die: { say: 'Some cards roll the tower\'s die: 1-6, low to high.\nSwing wild!', react: 'Ha! Fortune favours the bold.' },
      end2: { say: 'Hold the rest and end your turn.\nWatch the poison chew.', react: '' },
      junk: { say: 'There: the Dazed cards fell into your used pile.\nThey will clog your hand when you draw them.', react: 'Mud in the gears. Fight through it.' },
      win2: { say: 'Your fight now: play your cards, then end the turn.\nBreak the sentry.', react: 'Scrap metal! The Gatekeeper will hear of this.' },
      skip: { say: 'Sometimes the best card is no card.\nSkip it: a lean deck draws its best cards more often.', react: 'Wise. Weight slows a climber.' },
      leave3: { say: 'On we go.', react: '' },
      campfire: { say: 'A campfire flickers on the next floor.\nYou have earned it.', react: '' },
      rest: { say: 'Rest to heal, or Smith to sharpen one card.\nYou are bruised: rest.', react: 'Breathe. The tower will still be here.' },
      shopnode: { say: 'A trader set up shop on the stair.\nSee what she sells.', react: '' },
      shopitem: { say: 'Gold buys cards, relics and potions,\nand she will burn away a card for a fee.', react: '' },
      buy: { say: 'Buy it.', react: 'Spent well. Gold is for spending.' },
      shopleave: { say: 'Time to go.', react: '' },
      event: { say: 'A ? room: the tower likes surprises.\nStep inside.', react: '' },
      choose: { say: 'An ember shrine hums with warmth.\nPray to heal.', react: 'The tower is on your side tonight.' },
      evleave: { say: 'One room left.', react: '' },
      boss: { say: 'The crown room. The Gatekeeper\'s captain guards his gate.\nWin, and the climb is yours.', react: '' },
      spikes: { say: 'Captains fight to a pattern. When it grows Spikes,\nattacks on it cut you back: block that turn.', react: 'Read it, then strike. You know how.' },
      win3: { say: 'This is it, Garrick.\nRead its move each turn and break it.', react: 'The captain falls! The gate stays open!' },
      bossrelic: { say: 'The captain dropped three relics.\nTake one for the road.', react: '' },
      leave4: { say: 'Finish the climb.', react: '' },
      result: { say: 'You reached the gate before it locked.\nThe ember will burn another night.', react: '' },
      heroes: { say: 'Others will climb with you: a poison Rogue, a clockwork Automaton,\na Monk of stances. Story mode tells their tale.', react: '' }
    },
    end: { title: 'The ember lives', text: 'You beat the Gatekeeper\'s captain and kept the summit open. The real climb starts now.' }
  },
  // coached first climb (the tutorial): one line the first time each rule matters; keys are the rules in TUTORIAL-COVERAGE.md
  coach: {
    start: 'The summit ember is fading and the Gatekeeper wants it sealed. Climb, Garrick. I will talk when it matters.',
    rules: {
      energy: 'You hold 3 energy a turn. A card costs the number in its corner.',
      intent: 'Above each enemy: its next move. Plan around it.',
      block: 'An attack is coming. Block cards soak damage until your next turn.',
      endturn: 'No playable cards left: End turn. The enemy then acts step by step.',
      target: 'Several enemies: after lifting an attack, tap the enemy you want to hit.',
      vuln: 'Vulnerable: the next hit on it deals double.',
      weak: 'Weak: each hit deals 3 less.',
      poison: 'Poison: 1 HP per token at the end of the turn, through Block. It stays.',
      strength: 'Strength adds to every hit you make this fight.',
      power: 'A Power card lasts the whole fight. Play it early.',
      exhaust: 'Exhaust cards vanish for the rest of this fight once played.',
      die: 'Die cards roll 1-6: low, middle or high result.',
      junk: 'Junk cards like Dazed can never be played. They just clog your hand.',
      piles: 'Your draw pile ran dry: your used cards were shuffled back in.',
      potion: 'You carry a potion: free to use, one use. Tap it in the dock.',
      reward: 'Each win: pick one card for your deck, or skip to keep it lean.',
      gold: 'Gold piles up. Spend it at shops.',
      relic: 'A relic: a lasting bonus for the whole climb.',
      map: 'Your path: glowing rooms are your next step. Pick one.',
      rest: 'Campfire: rest to heal, or smith to upgrade one card.',
      shop: 'A shop: tap an item to read it, then Buy. You can also pay to remove a card.',
      event: 'A ? room: a choice with a price or a prize.',
      elite: 'An elite: tougher than a normal foe, better loot.',
      boss: 'The boss repeats a pattern. On its Spikes turn, attacks hurt you: block instead.',
      lose: 'If your HP hits 0, the climb ends.',
      preview: 'Lift a card: each foe shows the exact damage it would take, and you see the Block you would gain.',
      frail: 'Frail: your Block cards give a quarter less while it lasts.',
      acts: 'A full climb has three acts, each with its own foes and guardian, plus a final act. Each new act heals you fully.',
      laststand: 'Last Stand: with two heroes in a boss fight, the first to fall stays at 1 HP. The second fall ends the climb.',
      shiv: 'Shivs: 0-cost knives that hit for 3. At most 5 in hand.',
      orbs: 'Orbs: Lightning zaps, Frost blocks, Dark grows. A full row fires the oldest.',
      stance: 'Stances: Wrath adds 3 per hit but costs 3 HP at turn end; leaving Calm gives 2 energy.',
      scry: 'Scry: look at the top cards of your draw pile and discard the ones you do not want.',
      retain: 'Retain: this card stays in your hand when the turn ends.'
    },
    good: { kill: 'Clean kill!', double: 'Double damage on a Vulnerable foe. Nicely done.', blocked: 'Fully blocked. That is how a warden fights.' },
    poor: { hurt: 'Ouch. A Block card would have soaked some of that.', spikes: 'Spikes bit you. On its Spikes turn, block instead.', leftover: 'You ended with energy left. Spend it all next time.' },
    end: { title: 'You climbed the tower', later: 'Things you will meet later', play: 'Play a real game', title2: 'Title' }
  },
  // Story mode scenes per chapter (id from campaign.json): intro (2-3 lines), win and loss outros, boss lines before and after
  chapters: {
    c1: { intro: [['guide', 'A new climber. The Gatekeeper wants this tower sealed, and only climbers keep the gate open.'], ['guide', 'Let me show you how we fight here.']], win: [['guide', 'You kept the gate open tonight. Now the real road.']], lose: [['guide', 'Everyone falls once. Get up.']] },
    c2: { intro: [['guide', 'The Mire Road. Garrick goes first, as always.'], ['rival', 'Climbers. I sent my captain to meet you.'], ['guide', 'His Warden Captain grows Spikes: block that turn, strike the next.']], win: [['guide', 'The captain is down, and a Rogue was watching from the reeds. She wants in.']], lose: [['rival', 'Spikes cut both ways, warden.'], ['guide', 'Block on the spike turn. Again.']], bossPre: 'My captain waits. Turn back, or bleed on his spikes.', bossPost: 'One captain. I have a hundred more.' },
    c3: { intro: [['guide', 'Sable the Rogue takes the Thorn Gate, where the Mire Behemoth wallows. Poison stays and bites every turn.'], ['rival', 'My Behemoth fills your deck with slime. Act one ends in the mud.']], win: [['guide', 'The first guardian sinks. Act one is done: the Ash Stair is next, and its foes are tougher.']], lose: [['guide', 'Slime clogs your hand. Stack poison early and let it work.']], bossPre: 'My Behemoth is hungry. Feed it.', bossPost: 'The mire will rise again.' },
    c4: { intro: [['guide', 'Act two, the Ash Stair. An Automaton wakes; it channels orbs of lightning, frost and dark.'], ['rival', 'My Skyclaw hunts from above. Ash wisps make your shields thin: that is Frail.']], win: [['guide', 'The Skyclaw falls. A Monk has been meditating in the Quiet Hall for a hundred years.']], lose: [['guide', 'Three quick claws: block before the flurry, not after.']], bossPre: 'Look up, little machine.', bossPost: 'Feathers. Only feathers.' },
    c5: { intro: [['guide', 'Brother Quill, the Monk. Calm stores energy; Wrath hits 3 harder but burns 3 HP to stay in.'], ['rival', 'Patience will not save you, priest.']], win: [['guide', 'Calm and fury, both mastered. Act two ends; the Gatekeeper is angry now.']], lose: [['guide', 'Leave Wrath before the big hits come.']], bossPre: 'Silence, monk.', bossPost: 'Your calm is unbearable.' },
    c6: { intro: [['guide', 'Back to Garrick, and the Ashen Wraith that guards the top of act two.'], ['rival', 'My wraith burns every hand it touches.']], win: [['guide', 'The wraith is smoke. Act three: the Cinder Gate, where the dead keep watch.']], lose: [['guide', 'Burns pile up. End the fight quickly.']], bossPre: 'My wraith will burn your deck to cinders.', bossPost: 'Smoke. Only smoke.' },
    c7: { intro: [['guide', 'Act three. Sable again, in the tombs below the gate. Grave knights and bone callers.'], ['rival', 'The Tomb King has slept a thousand years. Wake him.']], win: [['guide', 'The king lies down again. Only the Hall of Gears stands before the gate.']], lose: [['guide', 'His Frail makes your Block thin. Kill fast, block big.']], bossPre: 'Kneel before your king.', bossPost: 'Back to the dust.' },
    c8: { intro: [['guide', 'The Automaton in the Hall of Gears, a long climb with no rest for its circuits.'], ['rival', 'My Thorn Brute grows stronger with every skill you play.']], win: [['guide', 'The hall is silent. Tomorrow: the Cinder Gate itself.']], lose: [['guide', 'Every skill fed the Brute. Attack on its turn to grow.']], bossPre: 'Every trick you play feeds my Brute.', bossPost: 'Thorns grow back.' },
    c9: { intro: [['guide', 'The Cinder Gate. Brother Quill climbs, and the Gatekeeper himself stands in the door.'], ['rival', 'I have sealed a hundred towers. Yours is the last.'], ['guide', 'His Wyrm strikes for 24: be in Calm with Block up.']], win: [['guide', 'The gate stands open. But below the summit the ember has a master of its own.']], lose: [['rival', 'Sealed. As it should be.'], ['guide', 'Not yet. Again.']], bossPre: 'This gate closes tonight.', bossPost: 'Then go on. The Tyrant will finish you.' },
    c10: { intro: [['guide', 'The final act. Garrick and Ione climb together to the Ember Heart.'], ['rival', 'You opened my gate. Now meet what I kept locked behind it.'], ['guide', 'Two climbers: if one falls to the Tyrant, a Last Stand keeps them at 1 HP. The second fall ends it.']], win: [['guide', 'The Tyrant is ash and the ember burns free. The tower is yours, climbers.']], lose: [['rival', 'The Heart keeps its master.'], ['guide', 'Together, again. Watch the 30 hit.']], bossPre: 'Burn, all of you.', bossPost: 'The ember... is yours.' }
  },
  quick: {
    intro: ['The ember flickers at the summit. Climb before the Gatekeeper locks the gate.', 'Another night, another climb. The gate is still open.', 'The tower shifts its rooms every night. Find a way up.'],
    won: 'The gate stays open another night. The tower remembers your name.',
    lost: 'The Gatekeeper smiles as the gate grinds shut. Climb again.'
  }
};
