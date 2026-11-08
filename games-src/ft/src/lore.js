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
  goal:{say:'Most points wins. Coins, land, people, goods, djinns all count.',later:'Most points wins: coins, land, people, goods and djinns count.'},
  bid:{say:'Pick a spot. Dearer spots play first, but coins are points.',later:'Bid for turn order: dearer plays first, coins are points.'},
  markers:{say:'Place your second marker. Same price: later bidder plays first.',later:'Two markers each. Same price: later bidder plays first.'},
  order:{say:o=>'Play order: '+o+'. Dearest spot goes first.',later:'Turn order follows the track, dearest first.'},
  tribes:{say:'Five tribes, three people per tile. Each colour has its own gift.',later:'Five tribes, three per tile, each with its own gift.'},
  lift:{say:'Tap a glowing tile to pick up everyone on it.',later:'A move picks up everyone from one tile.'},
  drop:{say:'Drop one person per tile. Never go straight back.',later:'Drop one person per tile, never straight back.'},
  lastcolour:{say:'Your last person must land on their own colour.',later:'The last person must land on their own colour.'},
  chz:{say:'Choose who stays here. Keep the colour you want last.',later:'With a mixed hand you choose who stays on each tile.'},
  take:{say:(n,c)=>'You take all '+n+' '+c+' on this tile.',later:'You take every person of that colour where you end.',rival:(n,c)=>'Farid takes '+n+' '+c+'. The last colour is taken whole.'},
  camel:{say:'Empty tile: your camel claims it. It scores its number.',later:'An emptied tile is claimed with a camel.',rival:'Farid claims the empty tile with a camel.'},
  traders:{say:'Traders bring goods. Different goods score more in sets.',later:'Traders fetch goods; sets of different goods score 1, 3, 7, 13.',rival:'Farid takes goods. Sets of different kinds score more.'},
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
LORE.coachLater=['Crafters, Cutpurses and Wonder Cities arrive in Story mode, each with its own intro.','If no move is legal, a player passes; equal scores are a shared win.'];
