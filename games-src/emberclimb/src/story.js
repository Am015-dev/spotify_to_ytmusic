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
  // Story mode scenes per chapter (id from campaign.json): intro (2-3 lines), win and loss outros, boss lines before and after
  chapters: {
    c1: { intro: [['guide', 'A new climber. The Gatekeeper wants this tower sealed, and only climbers keep the gate open.'], ['guide', 'Let me show you how we fight here.']], win: [['guide', 'You kept the gate open tonight. Now the real road.']], lose: [['guide', 'Everyone falls once. Get up.']] },
    c2: { intro: [['guide', 'The Mire Road. Garrick goes first, as always.'], ['rival', 'Climbers. I sent my captain to meet you.'], ['guide', 'His Warden Captain grows Spikes: block that turn, strike the next.']], win: [['guide', 'The captain is down, and a Rogue was watching from the reeds. She wants in.']], lose: [['rival', 'Spikes cut both ways, warden.'], ['guide', 'Block on the spike turn. Again.']], bossPre: 'My captain waits. Turn back, or bleed on his spikes.', bossPost: 'One captain. I have a hundred more.' },
    c3: { intro: [['guide', 'Sable the Rogue takes the Thorn Gate. Poison is her art: it stays and bites every turn.'], ['rival', 'My Thorn Brute grows stronger with every skill you play.']], win: [['guide', 'Thorns cut, poison kept biting. Somewhere above, gears are turning.']], lose: [['guide', 'The Brute grew too strong. Stack your poison early.']], bossPre: 'Every trick you play feeds my Brute.', bossPost: 'Thorns grow back, thief.' },
    c4: { intro: [['guide', 'An Automaton wakes on the Ash Stair. It channels orbs of lightning, frost and dark.'], ['rival', 'My statue sleeps. Pray it keeps sleeping.']], win: [['guide', 'The statue crumbles. A Monk has been meditating in the Quiet Hall for a hundred years.']], lose: [['guide', 'Do not wake the statue before you are ready.']], bossPre: 'Shh. Let my statue sleep.', bossPost: 'Stone is patient. So am I.' },
    c5: { intro: [['guide', 'Brother Quill, the Monk. Calm stores energy; Wrath hits 3 harder but burns 3 HP to stay in.'], ['rival', 'Patience will not save you, priest.']], win: [['guide', 'Calm and fury, both mastered. Act two ends; the Gatekeeper is angry now.']], lose: [['guide', 'Leave Wrath before the big hits come.']], bossPre: 'Silence, monk.', bossPost: 'Your calm is unbearable.' },
    c6: { intro: [['guide', 'Back to Garrick, and the Behemoth that drowns the lower mire.'], ['rival', 'My Behemoth fills your deck with slime.']], win: [['guide', 'The mire drains. The Gatekeeper sends his wraith next.']], lose: [['guide', 'Too much slime. Thin your deck at shops.']], bossPre: 'My Behemoth is hungry. Feed it.', bossPost: 'The mire will rise again.' },
    c7: { intro: [['guide', 'Sable again, on the Wraith Stair. The wraith burns your cards.'], ['rival', 'Ash to ash, little thief.']], win: [['guide', 'The wraith is smoke. Only the Hall of Gears stands before the gate.']], lose: [['guide', 'Burns pile up. End fights quickly.']], bossPre: 'My wraith will burn your deck to cinders.', bossPost: 'Smoke. Only smoke.' },
    c8: { intro: [['guide', 'The Automaton in the Hall of Gears, a long climb with no rest for its circuits.'], ['rival', 'One more hall and you are at my door.']], win: [['guide', 'The hall is silent. Tomorrow: the Cinder Gate itself.']], lose: [['guide', 'Focus your orbs; frost keeps you alive.']], bossPre: 'Turn back while you still can.', bossPost: 'Impossible.' },
    c9: { intro: [['guide', 'The Cinder Gate. Brother Quill climbs, and the Gatekeeper himself stands in the door.'], ['rival', 'I have sealed a hundred towers. Yours is the last.'], ['guide', 'His Colossus strikes for 24: be in Calm with Block up.']], win: [['guide', 'The gate stands open forever. The ember is safe. Thank you, climbers.']], lose: [['rival', 'Sealed. As it should be.'], ['guide', 'Not yet. Again.']], bossPre: 'This gate closes tonight.', bossPost: 'Then keep your tower... warden.' }
  },
  quick: {
    intro: ['The ember flickers at the summit. Climb before the Gatekeeper locks the gate.', 'Another night, another climb. The gate is still open.', 'The tower shifts its rooms every night. Find a way up.'],
    won: 'The gate stays open another night. The tower remembers your name.',
    lost: 'The Gatekeeper smiles as the gate grinds shut. Climb again.'
  }
};
