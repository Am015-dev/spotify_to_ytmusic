// ===================== all the story text of Sands of Qamar in one place (edit here; cast and arc: ../STORY.md) =====================
// The tutorial is the PROLOGUE: Old Hadiya (guide) teaches a short real game against Farid the Water-Boy, who wants the throne to pay for his village's well.
// say   = what the guide says while the glow shows where (a story reason, then the action, never "click here")
// react = what she says right after the player does it (the payoff; shown for ~2.4 s as the next beat)
const LORE={
  guide:{key:'hadiya',name:'Hadiya',face:'🧓'}, rival:{name:'Farid',face:'🧒'},
  chapters:{goal:{n:1,t:'Empty Throne'},lift:{n:2,t:'First Walk'},advisors:{n:3,t:'Rival Moves'},score:{n:4,t:'The Count'}},
  tut:{
    goal:{say:'The Sultan left no heir, child. Most points when the bazaar closes takes the throne: coins, tribes, land, goods, djinns.'},
    tribes:{say:'Five tribes crowd the bazaar, three to a tile, each colour with its own gift. Farid the Water-Boy wants the throne for his village well.',react:'Farid grins. "I get the first walk!"'},
    bid1:{say:'Who walks first? Dearer spots play earlier, but coins are points too. Take the 5-coin spot.',react:'Five coins down. Bold, child.'},
    bid2:{say:'Two caravans each, so two markers. Put the second on the free 0-coin spot: cheap, but last.',react:'A thrifty second caravan.'},
    order:{say:'The order is set: Farid, you, Farid, you. Same price? The later bidder goes first. Watch Farid walk.'},
    sages:{say:'Farid walks his Sages to the Shrine, claims it, and trades two Sages for a djinn. Sages are 2 points each.',react:'Farid: "A djinn! Beat that."'},
    lift:{say:'Your turn, child! These Traders are ripe for the taking. Lift everyone from the tile and walk them out.',react:'The Traders are in your hands.'},
    drop:{say:n=>n<2?'Leave one person on each tile you cross: up, down, left or right, never straight back.':'The last walker must land on a tile of its own colour: Traders.',react:'The caravan arrives.'},
    traders:{say:'All four Traders are yours: four goods. The tile is empty, so your camel claims it. Well walked!',react:'Four goods and a camel. The market notices.'},
    buy:{say:'The Stall sells one of the first three goods for 3 coins. Take the Mystic: it never scores, but it fires up Masons.',react:'A Mystic in your purse, a secret for later.'},
    sell1:{say:'Goods sell in sets of different kinds. Gather your four goods into one set.',react:'A fine, varied set.'},
    sell2:{say:'Four different goods fetch 13 coins, and bigger sets pay far more. Cash them in!',react:'Thirteen coins. The throne feels closer!'},
    advisors:{say:'Farid\'s Advisors plant a palm. Advisors score 1 each, plus 10 for every rival with fewer. Mind your numbers.',react:'Farid: "Advisors rule the court!"'},
    lift2:{say:'The last walk, child. This tile holds two Advisors and a Mason. Lift them.',react:'Two Advisors and a Mason on the road.'},
    dropA:{say:'You choose who to leave behind. Choose the tile, then pick the person to leave.',react:'Left a mark on the road.'},
    dropB:{say:'Leave an Advisor here. Your last walker, the Mason, must reach a Mason tile.',react:'One Advisor stays, one marches on.'},
    dropC:{say:n=>n<2?'Leave the other Advisor on the next tile, and keep walking.':'The Mason lands on a Mason tile. All four Masons are yours.',react:'The Masons are yours!'},
    masons:{say:b=>'Each Mason earns 1 coin per blue tile around: '+b+' tiles. Spend your Mystic for a fifth Mason.',react:'Coins pour in. Farid gasps.'},
    palace:{say:'A Hamlet raises a palace: 5 more points for whoever holds the tile. Your camel does.',react:'A palace rises on your land!'},
    score:{say:(a,b)=>'The caravans are counted: you '+a+', Farid '+b+'. Coins, tiles, palaces, palms, Sages, Advisors, djinns and goods all count.',react:()=>'The count is done.'},
    others:{say:'Three more gifts: Grand Bazaar, 6 coins for 2 goods. Oasis, a palm worth 3. Shrine, a djinn.'},
    shadows:{say:'Beware the red Shadows: they remove any person within that many steps, or a rival\'s Advisor or Sage.'},
    end:{say:'A real game ends when someone lays their last camel; most points wins. The bazaar is yours, child.'}
  },
  endTitle:'You know the rules',
  endText:'Hadiya smiles: "Bid, walk, take a tribe, claim land, sell goods. You are ready, child."',
  endStory:'Hadiya smiles: "Bid, walk, take a tribe, claim land, sell goods. Now the real caravans come."',
  quickIntro:'The sultan\'s bazaar opens at dawn. Lead the tribes, rule the market.',
  win:['The bazaar sings your name. The throne of Qamar is yours!','Your camels hold the best land. Qamar bows to you.'],
  lose:['The rival\'s caravans were swifter today. The bazaar remembers; try again at dawn.','Close, but the throne slips away. One more walk across the sands?'],
  turn:{you:'Your turn',bid:'Bid for turn order'}
};
// ---- the coached first game: Hadiya explains each rule when it first matters (coach.js decides when; ids = TUTORIAL-COVERAGE.md) ----
// say = what she says; later = the one-line version for the "Things you'll meet later" card when the rule never came up in the game
LORE.coach={
  goal:{say:'Welcome, child. Most points when the bazaar closes takes the throne. Coins, land, people, goods and djinns all count. Play freely; I will whisper the rules as they matter.',later:'Most points wins: coins, land, people, goods and djinns all count.'},
  bid:{say:'First, bid for turn order. Dearer spots play earlier, but coins are points, so every coin you spend is a point lost. Tap a spot on the track.',later:'Bid for turn order: dearer spots play first, and coins are points.'},
  markers:{say:'Two players, so two markers each: place your next one too. Same price? The later bidder plays first.',later:'Two markers each with two players. Same price: the later bidder plays first.'},
  order:{say:o=>'The track sets the order: '+o+'. Dearer spots first; at the same price the later bidder goes first.',later:'Turn order follows the track, dearest first.'},
  tribes:{say:'Five tribes crowd the bazaar, three to a tile: Traders, Masons, Sages, Advisors and the red Shadows. Each colour has its own gift.',later:'Five tribes, three per tile, each with its own gift.'},
  lift:{say:'Tap a glowing tile to lift everyone on it. You then walk them out across the bazaar.',later:'A move lifts everyone from one tile.'},
  drop:{say:'Leave one person on each tile you cross: up, down, left or right, never straight back to the tile you just left.',later:'Drop one person per tile, never straight back.'},
  lastcolour:{say:'Your last walker must land on a tile that already has their colour. Then you take every person of that colour there.',later:'The last walker must land on its own colour, and you take all of that colour.'},
  chz:{say:'A mixed hand: you choose who stays on this tile. Keep the colour you want for your final step.',later:'With a mixed hand you choose who stays on each tile.'},
  take:{say:(n,c)=>'You took '+n+' '+c+'. You always take every person of that colour on the last tile, so aim for a crowded one.',later:'You take every person of that colour where you end.',rival:(n,c)=>'Farid took '+n+' '+c+'. Whoever ends on a colour takes all of it.'},
  camel:{say:'You emptied the tile, so your camel claims it. Held tiles score the number on them; when the last camel is laid, the game ends.',later:'An emptied tile is claimed with a camel.',rival:'Farid emptied a tile and laid a camel on it. Held tiles score their printed number.'},
  traders:{say:'Traders bring goods: take cards from the market row. Different kinds make sets worth 1, 3, 7, 13 points.',later:'Traders fetch goods; sets of different goods score 1, 3, 7, 13.',rival:'Farid\'s Traders fetch goods. Sets of different goods score more.'},
  masons:{say:'Masons earn 1 coin per blue tile around them. A Mystic adds one more Mason. Coins are points.',later:'Masons earn coins by the blue tiles around.',rival:'Farid\'s Masons earn coins for the blue tiles around.'},
  sages:{say:'Sages score 2 points each, and pay for djinns at the Shrine.',later:'Sages are 2 points each and pay for djinns.',rival:'Farid takes Sages: 2 points each, and the price of a djinn.'},
  advisors:{say:'Advisors score 1 each, plus 10 for every rival with fewer. Keep more than Farid and the court is yours.',later:'Advisors: 1 each, plus 10 per rival with fewer.',rival:'Farid\'s Advisors: 1 point each, plus 10 if he has more than you. Mind the count.'},
  shadows:{say:'Shadows strike: they remove any person within as many steps as Shadows you took, or a rival\'s Advisor or Sage.',later:'Shadows remove a person in range, or a rival\'s Advisor or Sage.',rival:'Farid\'s Shadows strike within range. Guard your Advisors.'},
  stall:{say:'Bazaar Stall: pay 3 coins for one of the first three goods in the row. Mystics never score, but boost Masons.',later:'Bazaar Stall: 3 coins for one of the first three goods.',rival:'Farid may buy a good at the Stall for 3 coins.'},
  bazaar:{say:'Grand Bazaar: pay 6 coins for two of the first six goods in the row.',later:'Grand Bazaar: 6 coins for two goods.',rival:'Farid may buy two goods at the Grand Bazaar.'},
  shrine:{say:'Shrine: pay 2 Sages, or a Sage and a Mystic, to summon a face-up djinn. Djinns score and bend the rules.',later:'Shrine: pay 2 Sages to summon a djinn.',rival:'Farid may pay Sages at the Shrine for a djinn.'},
  hamlet:{say:'Hamlet: you must raise a palace here. A palace is worth 5 points to whoever holds the tile.',later:'Hamlet: a palace, worth 5 to the tile\'s holder.',rival:'Farid raises a palace on a Hamlet: 5 points to its holder.'},
  oasis:{say:'Oasis: you must plant a palm tree here. A palm is worth 3 points to whoever holds the tile.',later:'Oasis: a palm, worth 3 to the tile\'s holder.',rival:'Farid plants a palm at an Oasis: 3 points to its holder.'},
  exchange:{say:'Spice Exchange: pay 4 coins for any one face-up goods card.',later:'Spice Exchange: 4 coins for any face-up good.',rival:'Farid may buy any face-up good at the Spice Exchange.'},
  goods:{say:'Keep different goods together: a set of 1, 2, 3 or 4 kinds scores 1, 3, 7 or 13. A repeated kind starts a new set.',later:'Goods score in sets of different kinds: 1, 3, 7, 13...'},
  mystics:{say:'A Mystic never scores itself. It is a wildcard that boosts Masons, Shadows and some djinns.',later:'Mystics never score; they boost Masons and Shadows.'},
  sell:{say:'At the end of your turn you may sell a set of different goods for coins. Or keep them: unsold goods score the same way at the end.',later:'Sell a set of different goods for coins at the end of your turn.'},
  palms:{say:'Palms: each palm on a tile you hold is worth 3 points at the end.',later:'Palms are 3 points each for the tile\'s holder.'},
  palaces:{say:'Palaces: each is worth 5 points to the holder of its tile.',later:'Palaces are 5 points each for the tile\'s holder.'},
  djinns:{say:'A djinn joined the game. Tap a djinn card to read its power; each one also scores points.',later:'Djinns have powers and score points; tap one to read it.'},
  rival:{say:'Farid plays by the same rules, one step at a time. Tap the board to speed him up.',later:'The computer plays by the same rules.'},
  end:{say:'Someone is down to the last camel. When it is laid, the game ends at the end of that turn.',later:'The last camel laid ends the game.'}
};
LORE.coachLater=['Crafters, Cutpurses and Wonder Cities arrive in Story mode, each with its own intro.','If no move is legal, a player passes; equal scores are a shared win.'];
