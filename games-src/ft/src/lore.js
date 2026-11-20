// ===================== all the story text of Sands of Qamar in one place (edit here; cast and arc: ../STORY.md) =====================
// The tutorial is the PROLOGUE: Old Hadiya (guide) teaches a short real game against Farid the Water-Boy, who wants the throne to pay for his village's well.
// say   = what the guide says while the glow shows where (a story reason, then the action, never "click here")
// react = what she says right after the player does it (the payoff; shown for ~2.4 s as the next beat)
const LORE={
  guide:{key:'hadiya',name:'Hadiya',face:'🧓'}, rival:{name:'Farid',face:'🧒'},
  endTitle:'You know the rules',
  endText:'Hadiya smiles: "Bid, walk, take a tribe, claim land, sell goods. You are ready, child."',
  endStory:'Hadiya smiles: "Bid, walk, take a tribe, claim land, sell goods. Now the real caravans come."',
  quickIntro:'Collect tribes, claim land, and score the most points.',
  win:['The bazaar sings your name. The throne of Qamar is yours!','Your camels hold the best land. Qamar bows to you.'],
  lose:['Your rival won this time. Want to try again?','Another try? Every game teaches something.'],
  loseClose:['So close! Just a few points short. Another game?','A hair\'s breadth! One better walk and it was yours.'],
  loseFar:['The rival ran away with this one. Try grabbing more land and selling goods in sets.','A tough game. Next time aim for big Advisor and Sage hauls and full goods sets.'],
  turn:{you:'Your turn',bid:'Bid for turn order'}
};
// ---- the coached first game: Hadiya explains each rule when it first matters (coach.js decides when; ids = TUTORIAL-COVERAGE.md) ----
// say = what she says; later = the one-line version for the "Things you'll meet later" card when the rule never came up in the game
LORE.coach={
  goal:{say:'Have the most points when the game ends. Almost everything you own scores.',later:'Most points wins. Almost everything you own scores.'},
  bid:{say:'Pick a spot. Dearer spots play first, but coins are points.',later:'Bid for turn order: dearer plays first, coins are points.'},
  markers:{say:'Place your second marker. A tie goes to the later bidder.',later:'Two markers each. Same price: later bidder plays first.'},
  order:{say:o=>'Play order: '+o+'. Dearest spot goes first.',later:'Turn order follows the track, dearest first.'},
  tribes:{say:'The tribes, three people per tile. Each colour has its own gift.',later:'The tribes, three per tile, each with its own gift.'},
  lift:{say:'Tap a glowing tile to pick up everyone on it.',later:'A move picks up everyone from one tile.'},
  drop:{say:'Drop one person per tile. Never go straight back.',later:'Drop one person per tile, never straight back.'},
  lastcolour:{say:'Your last person must land on their own colour.',later:'The last person must land on their own colour.'},
  chz:{say:'Pick who stays on this tile. Keep your landing colour for last.',later:'With a mixed hand you choose who stays on each tile.'},
  take:{say:(n,c)=>'You take all '+n+' '+c+' on this tile.',later:'You take every person of that colour where you end.',rival:(n,c)=>'Farid takes '+n+' '+c+', all of that colour here.'},
  camel:{say:'Empty tile: your camel claims it. It scores its number.',later:'An emptied tile is claimed with a camel.',rival:'Farid claims the empty tile with a camel.'},
  traders:{say:'Traders bring goods. Different goods score more in sets.',later:'Traders bring goods. Different goods in a set score 1, 3, 7, 13.',rival:'Farid takes goods. Sets of different kinds score more.'},
  masons:{say:'Masons earn 1 coin for each blue tile around them.',later:'Masons earn coins by the blue tiles around.',rival:'Farid\'s Masons earn coins from blue tiles.'},
  sages:{say:'Sages are 2 points each. They also pay for djinns.',later:'Sages are 2 points each and pay for djinns.',rival:'Farid takes Sages: 2 points each.'},
  advisors:{say:'Advisors: 1 point each, plus 10 for beating a rival.',later:'Advisors: 1 each, plus 10 per rival with fewer.',rival:'Farid\'s Advisors: 10 bonus if he has more than you.'},
  shadows:{say:'Shadows remove a person in range, or a rival\'s Advisor or Sage.',later:'Shadows remove a person in range, or a rival\'s Advisor or Sage.',rival:'Farid\'s Shadows strike. Guard your Advisors.'},
  stall:{say:'Stall: pay 3 coins for one of the first three goods.',later:'Bazaar Stall: 3 coins for one of the first three goods.',rival:'Farid may buy one good for 3 coins.'},
  bazaar:{say:'Grand Bazaar: pay 6 coins for 2 of the first 6 goods.',later:'Grand Bazaar: 6 coins for 2 of the first 6 goods.',rival:'Farid may buy 2 of the first 6 goods for 6 coins.'},
  shrine:{say:'Shrine: pay 2 Sages, or 1 Sage and 1 Mystic, to summon a djinn.',later:'Shrine: 2 Sages, or 1 Sage and 1 Mystic, summon a djinn.',rival:'Farid may pay 2 Sages, or a Sage and a Mystic, for a djinn.'},
  hamlet:{say:'Hamlet: you raise a palace. It is worth 5 points.',later:'Hamlet: a palace, worth 5 points.',rival:'Farid raises a palace here: 5 points.'},
  oasis:{say:'Oasis: you plant a palm. It is worth 3 points.',later:'Oasis: a palm, worth 3 points.',rival:'Farid plants a palm here: 3 points.'},
  exchange:{say:'Spice Exchange: pay 4 coins for any good.',later:'Spice Exchange: 4 coins for any face-up good.',rival:'Farid may buy any good for 4 coins.'},
  goods:{say:'Different goods in one set score 1, 3, 7, 13.',later:'Goods score in sets of different kinds: 1, 3, 7, 13.'},
  mystics:{say:'Mystics never score. They boost Masons and Shadows.',later:'Mystics never score; they boost Masons and Shadows.'},
  sell:{say:'Sell a set for coins now, or keep it for the end.',later:'Sell a set of different goods for coins at turn end.'},
  palms:{say:'Each palm on your tiles scores 3 points.',later:'Palms are 3 points each for the tile holder.'},
  palaces:{say:'Each palace on your tiles scores 5 points.',later:'Palaces are 5 points each for the tile holder.'},
  djinns:{say:'A djinn joined. Tap any djinn to read its power.',later:'Djinns have powers and score points; tap one to read it.'},
  rival:{say:'Farid follows the same rules. Tap the board to speed him up.',later:'The computer plays by the same rules.'},
  end:{say:'Someone has one camel left. When the last camel is placed, the game ends at the end of that round.',later:'The last camel placed ends the game at the end of that round.'}
};
LORE.coachLater=['Story mode adds Crafters, Cutpurses and Wonder Cities.','If no one can make a legal move, the game ends after the round. Equal scores share the win.'];
