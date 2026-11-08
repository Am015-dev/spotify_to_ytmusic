// ===================== all the story text of Sands of Qamar in one place (edit here; cast and arc: ../STORY.md) =====================
// The tutorial is the PROLOGUE: Old Hadiya (guide) teaches a short real game against Farid the Water-Boy, who wants the throne to pay for his village's well.
// say   = what the guide says while the glow shows where (a story reason, then the action, never "click here")
// react = what she says right after the player does it (the payoff; shown for ~2.4 s as the next beat)
const LORE={
  guide:{key:'hadiya',name:'Hadiya',face:'🧓'}, rival:{name:'Farid',face:'🧒'},
  chapters:{goal:{n:1,t:'Empty Throne'},lift:{n:2,t:'First Walk'},advisors:{n:3,t:'Rival Moves'},score:{n:4,t:'The Count'}},
  tut:{
    goal:{say:'Most points wins the throne. Almost everything you own scores.'},
    tribes:{say:'The tribes, three per tile. Each colour does something different.',react:'Farid grins. "I get the first walk!"'},
    bid1:{say:'Pricey spots play first. Take the 5-coin spot.',react:'Five coins down. Bold, child.'},
    bid2:{say:'You have two markers. Put the second on a free spot.',react:'A thrifty second caravan.'},
    order:{say:'Play order: Farid, you, Farid, you. Watch Farid go first.'},
    sages:{say:'Farid pays two Sages for a djinn. Sages are 2 points each.',react:'Farid: "A djinn! Beat that."'},
    lift:{say:'Your turn, child. Tap the glowing tile to lift everyone on it.',react:'The Traders are in your hands.'},
    drop:{say:n=>n<2?'Drop one person per tile. Never step straight back.':'Your last person must land on a Trader tile.',react:'The caravan arrives.'},
    traders:{say:'Four Traders give four goods. Your camel claims the empty tile.',react:'Four goods and a camel. The market notices.'},
    buy:{say:'Pay 3 coins for a good. Take the Mystic: it boosts Masons.',react:'A Mystic in your purse, a secret for later.'},
    sell1:{say:'Sell goods in sets of different kinds. Pick all four.',react:'A fine, varied set.'},
    sell2:{say:'Four different goods sell for 13 coins. Sell them.',react:'Thirteen coins. The throne feels closer!'},
    advisors:{say:'Advisors score 1 each, plus 10 for beating a rival.',react:'Farid: "Advisors rule the court!"'},
    lift2:{say:'The last walk, child. This tile holds two Advisors and a Mason. Lift them.',react:'Two Advisors and a Mason on the road.'},
    dropA:{say:'Tap a tile, then pick which person stays there.',react:'Left a mark on the road.'},
    dropB:{say:'Leave an Advisor here. The Mason must end on a Mason tile.',react:'One Advisor stays, one marches on.'},
    dropC:{say:n=>n<2?'Leave the other Advisor on the next tile.':'The Mason landed on a Mason tile. You take all four.',react:'The Masons are yours!'},
    masons:{say:b=>'Masons earn 1 coin per nearby blue tile ('+b+'). Mystic adds one.',react:'Coins pour in. Farid gasps.'},
    palace:{say:'The Hamlet gets a palace worth 5 points to you.',react:'A palace rises on your land!'},
    score:{say:(a,b)=>'Final count: you '+a+', Farid '+b+'. Everything you own scores.',react:()=>'The count is done.'},
    others:{say:'Grand Bazaar: 2 goods for 6 coins. Oasis: a palm. Shrine: a djinn.'},
    shadows:{say:'Red Shadows remove a nearby person, or a rival\'s Advisor or Sage.'},
    end:{say:'A real game ends when someone places their last camel.'}
  },
  endTitle:'You know the rules',
  endText:'Hadiya smiles: "Bid, walk, take a tribe, claim land, sell goods. You are ready, child."',
  endStory:'Hadiya smiles: "Bid, walk, take a tribe, claim land, sell goods. Now the real caravans come."',
  quickIntro:'Collect tribes, claim land, and score the most points.',
  win:['The bazaar sings your name. The throne of Qamar is yours!','Your camels hold the best land. Qamar bows to you.'],
  lose:['Your rival won this time. Want to try again?','So close! Want another game?'],
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
  bazaar:{say:'Grand Bazaar: pay 6 coins for two goods.',later:'Grand Bazaar: 6 coins for two goods.',rival:'Farid may buy two goods for 6 coins.'},
  shrine:{say:'Shrine: pay 2 Sages to summon a djinn.',later:'Shrine: pay 2 Sages to summon a djinn.',rival:'Farid may pay Sages for a djinn.'},
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
  end:{say:'Someone has one camel left. The last camel ends the game.',later:'The last camel laid ends the game.'}
};
LORE.coachLater=['Story mode adds Crafters, Cutpurses and Wonder Cities.','No legal move? You pass. Equal scores share the win.'];
