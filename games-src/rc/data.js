// ---------- characters, inventions, items, discovery tokens, scenarios and the island map ----------
const BEAST_SP={boa:'disc',gorilla:'disc',iguana:'wound1',jaguar:'nomed2',puma:'nomed2','wild-dog':'nomed2'};
// island map: 15 hex spaces in rows of 3,5,4,3 (rows offset); camp starts on space 7 with tile 8 (the beach)
const MAP=[{id:0,q:1,r:0,adj:[4,5,1]},{id:1,q:2,r:0,adj:[0,2,5,6]},{id:2,q:3,r:0,adj:[1,6,7]},
 {id:3,q:0,r:1,adj:[4,8]},{id:4,q:1,r:1,adj:[3,0,5,8]},{id:5,q:2,r:1,adj:[0,1,4,6,9,10]},{id:6,q:3,r:1,adj:[1,2,5,7,10,11]},{id:7,q:4,r:1,adj:[2,6,11]},
 {id:8,q:0.5,r:2,adj:[3,4,9,12]},{id:9,q:1.5,r:2,adj:[4,5,8,10,12,13]},{id:10,q:2.5,r:2,adj:[5,6,9,11,13,14]},{id:11,q:3.5,r:2,adj:[6,7,10,14]},
 {id:12,q:1,r:3,adj:[8,9,13]},{id:13,q:2,r:3,adj:[9,10,12,14]},{id:14,q:3,r:3,adj:[10,11,13]}];
const START_POS=7,START_TILE=8;
// characters: life track (die at wound N), morale-down arrows after wound N, 4 skills
const CHARS={
 carpenter:{n:'Carpenter',die:13,arrows:[4,7,9],inv:'snare',skills:[
  {k:'thrifty',n:'Thrifty Build',c:2,x:'Spend 1 wood fewer on one action this round.'},
  {k:'craft',n:'Master Craft',c:2,x:'Reroll one build die of your action.',reroll:'build'},
  {k:'idea',n:'Bright Idea',c:3,x:'Look at 5 invention cards and put one of them on the board.'},
  {k:'hands',n:'Extra Hands',c:3,x:'An extra pawn for one build action this round.'}]},
 cook:{n:'Cook',die:14,arrows:[3,6,8,11],inv:'fireplace',skills:[
  {k:'remedy',n:'Home Remedy',c:2,x:'Discard 1 food to heal 2 wounds, split as you like.'},
  {k:'forager',n:"Forager's Eye",c:2,x:'Reroll one gather die of your action.',reroll:'gather'},
  {k:'broth',n:'Pebble Broth',c:3,x:'Gain 1 food.'},
  {k:'moonshine',n:'Moonshine',c:3,x:'In the weather phase ignore 1 rain cloud, or turn 1 snow cloud into rain.'}]},
 explorer:{n:'Explorer',die:12,arrows:[5,10],inv:'shortcut',skills:[
  {k:'lucky',n:'Lucky Break',c:2,x:'Reroll one explore die of your action.',reroll:'explore'},
  {k:'recon',n:'Scout Ahead',c:2,x:'Look at the top 3 island tiles and put one of them on top.'},
  {k:'peptalk',n:'Pep Talk',c:3,x:'Morale +1.'},
  {k:'keeneye',n:'Keen Eye',c:3,x:'Draw 2 discovery tokens, keep one.'}]},
 soldier:{n:'Soldier',die:12,arrows:[4,8],inv:'spear',skills:[
  {k:'track',n:'Tracker',c:2,x:'Look at the top beast of the hunting deck; leave it on top or put it at the bottom.'},
  {k:'fortify',n:'Fortify',c:2,x:'Palisade +1 or weapon +1.'},
  {k:'rage',n:'Battle Rage',c:3,x:'+3 weapon for your next fight this round.'},
  {k:'drive',n:'Drive the Game',c:4,x:'Shuffle the top card of the beast deck into the hunting deck.'}]}};
const FRIDAY={n:'Friday',die:4};
// inventions: t = terrain needed, it = items needed, r = resources {wood,fur,food}, alt = pay one of; kind: start | normal | personal
const INVENTIONS={
 bricks:{n:'Bricks',kind:'start',t:'hills',x:'Palisade +1.'},
 dam:{n:'Dam',kind:'start',t:'river',r:{wood:1},x:'Gain 2 non-perishable food.'},
 fire:{n:'Fire',kind:'start',t:'mountains',x:'Palisade +1.'},
 knife:{n:'Knife',kind:'start',t:'mountains',x:'Weapon +1.'},
 map:{n:'Map',kind:'start',t:'river',x:'An extra pawn for explore actions, every round.'},
 medicine:{n:'Medicine',kind:'start',t:'plains',x:'Many injuries and illnesses hurt less.'},
 pot:{n:'Pot',kind:'start',t:'hills',x:'Once each night: 1 food heals 1 wound.'},
 rope:{n:'Rope',kind:'start',t:'plains',x:'Needed for other inventions.'},
 shovel:{n:'Shovel',kind:'start',t:'beach',x:'Needed for other inventions and many threats.'},
 basket:{n:'Basket',kind:'normal',t:'plains',x:'One successful gather action a round gives 1 more resource.'},
 bed:{n:'Bed',kind:'normal',t:'plains',x:'Resting heals 2 wounds and gives 1 determination.'},
 belts:{n:'Belts',kind:'normal',it:['knife'],r:{fur:1},x:'An extra pawn for gather actions, every round.'},
 bow:{n:'Bow',kind:'normal',it:['rope','knife'],r:{wood:1},x:'Weapon +3.'},
 cellar:{n:'Cellar',kind:'normal',it:['shovel'],x:'Food no longer spoils at night.'},
 corral:{n:'Corral',kind:'normal',it:['rope'],r:{wood:1},x:'A bird source next to camp is used up, but the camp tile makes 1 more food.'},
 diary:{n:'Diary',kind:'normal',r:{fur:1},x:'+1 determination in each morale phase.'},
 drums:{n:'Drums',kind:'normal',t:'hills',r:{fur:1},x:'+2 determination in each morale phase.'},
 furnace:{n:'Furnace',kind:'normal',it:['bricks'],x:'Ignore 1 snow cloud in each weather phase.'},
 lantern:{n:'Lantern',kind:'normal',t:'hills',it:['fire'],x:'An extra pawn for build actions, every round.'},
 moat:{n:'Moat',kind:'normal',it:['shovel'],r:{wood:1},x:'Palisade +2.'},
 pit:{n:'Pit',kind:'normal',it:['shovel'],r:{wood:1},x:'In production roll the build wound die: on a wound face gain 2 food.'},
 raft:{n:'Raft',kind:'normal',it:['rope'],r:{wood:2},x:'An extra pawn for gather or explore actions, every round.'},
 sack:{n:'Sack',kind:'normal',r:{fur:1},x:'One successful gather action a round gives 1 more resource.'},
 shield:{n:'Shield',kind:'normal',it:['rope'],r:{wood:1},x:'An extra pawn for hunting, every round.'},
 sling:{n:'Sling',kind:'normal',alt:[{fur:1},{wood:1}],x:'Weapon +2.'},
 wall:{n:'Stone Wall',kind:'normal',it:['bricks'],x:'Palisade +2.'},
 snare:{n:'Snare',kind:'personal',owner:'carpenter',it:['rope'],x:'The camp tile makes 1 more food.'},
 fireplace:{n:'Fireplace',kind:'personal',owner:'cook',it:['fire'],x:'Once each night: 1 food heals 2 wounds.'},
 shortcut:{n:'Shortcut',kind:'personal',owner:'explorer',it:['map'],x:'Mark a tile next to camp: production gives 1 resource from it.'},
 spear:{n:'Spear',kind:'personal',owner:'soldier',it:['knife'],r:{wood:1},x:'Weapon +3.'}};
// starting items: shared, 2 uses each
const ITEMS={
 biscuits:{n:'Ship’s Biscuits',x:'Gain 1 non-perishable food.'},
 bottle:{n:'Empty Bottle',x:'Weapon +1.'},
 rum:{n:'Flask of Rum',x:'At night, heal 1 wound.'},
 hammer:{n:'Hammer and Nails',x:'An extra pawn for one build action.'},
 pipe:{n:'Pipe and Tobacco',x:'The user gains 2 determination.'},
 pistol:{n:'Flintlock Pistol',x:'+3 weapon for one fight.'},
 stormglass:{n:'Storm Glass',x:'Roll this round’s weather dice before planning (they still apply in the weather phase).'},
 bible:{n:'Prayer Book',x:'When arranging the camp: 3 determination and heal 1 wound, instead of 2 determination.'}};
// discovery tokens (22): pot = only with the Pot built
const DISCS={
 candles:{n:'Candle Stubs',cp:2,x:'A one-time extra pawn for a build action.'},
 fallentree:{n:'Fallen Tree',cp:2,x:'Gain 1 wood.'},
 goat:{n:'Wild Goat',cp:2,x:'With weapon 1 or more: gain 1 food and 1 fur.'},
 healherbs:{n:'Healing Leaves',cp:1,pot:1,x:'With a Pot: make Medicine for free.'},
 herbs:{n:'Calming Herbs',cp:1,pot:1,x:'With a Pot: morale +1.'},
 leaves:{n:'Big Leaves',cp:1,x:'Ignore 1 rain cloud in a weather phase.'},
 larvae:{n:'Grubs',cp:2,x:'Gain 2 food.'},
 machete:{n:'Old Machete',cp:1,x:'Weapon +1.'},
 poison:{n:'Poison Sap',cp:1,pot:1,x:'With a Pot: weapon +2.'},
 thorns:{n:'Thorn Bushes',cp:1,x:'Palisade +1 (needs a shelter).'},
 tobacco:{n:'Wild Tobacco',cp:1,x:'Morale +1.'},
 treasure:{n:'Glint in the Sand',cp:2,x:'Draw mystery cards until a treasure, and take it.'},
 veggies:{n:'Wild Vegetables',cp:1,pot:1,x:'With a Pot: heal 2 wounds at night.'},
 sc1:{n:'Scenario find I',cp:1,sc:0,x:''},sc2:{n:'Scenario find II',cp:1,sc:1,x:''},sc3:{n:'Scenario find III',cp:1,sc:2,x:''},sc4:{n:'Scenario find IV',cp:1,sc:3,x:''}};
// scenarios: weather dice per round, goal, special rules; book and totem effects are code in scen.js
const SCENARIOS={
 marooned:{ref:'scen-1-castaways',n:'Marooned',no:1,rounds:12,x:'Keep a signal fire ready. Build Fire and stack a 15-wood signal pile (1, then 2, 3, 4, 5 wood, one stage a round). Have both in round 10, 11 or 12 and a ship sees you.',
  wx:{4:['rain'],5:['rain'],6:['rain'],7:['rain','snow','animals'],8:['rain','snow','animals'],9:['rain','snow','animals'],10:['rain','snow','animals'],11:['rain','snow','animals'],12:['rain','snow','animals']},
  finds:[{n:'Healing Moss',x:'Heal 1 wound.',ops:[['heal','choose',1]]},{n:'Lamp Oil',x:'2 wood, only for the signal pile.',ops:[['pileWood',2]]},{n:'Rusty Cutlass',x:'Weapon +1.',ops:[['weapon',1]]},{n:'Silver Medallion',x:'3 determination.',ops:[['det','choose',3]]}],
  invs:{hatchet:{n:'Hatchet',kind:'scen',t:'mountains',r:{wood:1},x:'The camp tile makes 1 more wood.'},mast:{n:'Mast',kind:'scen',it:['rope'],r:{wood:1,fur:1},x:'3 wood straight onto the signal pile.'}},
  book:'none',totem:'none'},
 hexed:{ref:'scen-2-cursed-island',n:'The Hexed Isle',no:2,rounds:10,x:'Break the curse: raise a Cross on five different island tiles.',
  wx:{6:['snow'],7:['snow'],8:['snow'],9:['snow'],10:['snow']},
  finds:[{n:'Cultist Candle',x:'A one-time extra pawn.',ops:[['keepPawn','any',1]]},{n:'Strange Vial',x:'Make Medicine for free.',ops:[['buildFree',['medicine']]]},{n:'Carved Bell',x:'Remove up to 2 fog tokens.',ops:[['unfog',2]]},{n:'Ritual Knife',x:'+3 weapon in fights (you take 1 wound each time).',ops:[['keep','ritualknife']]}],
  invs:{cross:{n:'Cross',kind:'scen',r:{wood:2},multi:1,x:'Raise a cross on a tile (one per tile). Five wins.'},bell:{n:'Sacred Bell',kind:'scen',t:'hills',it:['rope'],multi:1,x:'Remove up to 3 fog tokens.'}},
  book:'fog',totem:'hexed'}};
