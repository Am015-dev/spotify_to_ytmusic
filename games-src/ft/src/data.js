// ---------- Sands of Qamar: components (numbers from the research in ../rules.md; names are original) ----------
const MNAME={vizier:'Advisor',elder:'Sage',merchant:'Trader',builder:'Mason',assassin:'Shadow',artisan:'Crafter'};
const MPLUR={vizier:'Advisors',elder:'Sages',merchant:'Traders',builder:'Masons',assassin:'Shadows',artisan:'Crafters'};
const MHELP={vizier:'Keep them. 1 point each, and 10 more for every rival with fewer Advisors.',elder:'Keep them. 2 points each; spend them to summon djinns.',
  merchant:'Take that many goods cards from the front of the market row.',builder:'Earn coins: Masons × blue tiles in the 3×3 around the tile (+1 per Mystic you add).',
  assassin:'Remove one person within that many steps (+1 per Mystic), or one Advisor or Sage kept by a rival.',artisan:'Keep them and draw that many items: keep 1, discard the rest.'};
const MEEPLE_COUNT={vizier:16,elder:20,merchant:18,builder:18,assassin:18};
// tiles: k, name, colour (blue counts for Masons), value, count, set
const TILEDEF={
  village:{n:'Hamlet',blue:true,x:'Place a palace here (you must).'},
  sacred:{n:'Shrine',blue:true,x:'You may pay 2 Sages, or 1 Sage and 1 Mystic, to summon a face-up djinn.'},
  oasis:{n:'Oasis',blue:false,x:'Plant a palm tree here (you must).'},
  small:{n:'Bazaar Stall',blue:false,x:'You may pay 3 coins for 1 of the first 3 goods in the market row.'},
  large:{n:'Grand Bazaar',blue:false,x:'You may pay 6 coins for 2 of the first 6 goods in the market row.'},
  workshop:{n:'Workshop',blue:true,x:'You may pay 1 Crafter or 2 Mystics to take the top item.'},
  exchange:{n:'Spice Exchange',blue:false,x:'You may pay 4 coins for any 1 face-up goods card.'},
  ravine:{n:'Ravine',blue:false,x:'Impassable. Nothing may ever stand here.',block:1},
  lake:{n:'Great Lake',blue:true,x:'Impassable. Palms and palaces on tiles touching it score double.',block:1},
  city:{n:'Wonder City',blue:true,x:'A city of wonders: the more of them you hold, the more they are worth (5 / 20 / 45 / 80 / 125).'}};
const TILESET=[['village',5,5],['sacred',6,4],['sacred',10,1],['sacred',12,1],['sacred',15,1],['oasis',8,6],['small',6,8],['large',4,4]];
const TILESET_ART=[['workshop',5,3],['exchange',10,2],['ravine',0,1]];
const TILESET_WHIM=[['city',5,3,'blue'],['city',5,2,'red'],['lake',0,1]];
function mkTiles(set,ex){const o=[];for(const [k,v,n,col] of set)for(let i=0;i<n;i++)o.push({k,v,blue:col?col==='blue':TILEDEF[k].blue,ex});return o}
// goods (54 base): Mystics are the special cards
const RNAME={ivory:'Ivory',jewels:'Jewels',gold:'Gold',papyrus:'Papyrus',silk:'Silk',spice:'Spice',fish:'Fish',wheat:'Wheat',pottery:'Pottery',fakir:'Mystic'};
const RICON={ivory:'🦷',jewels:'💎',gold:'🥇',papyrus:'📜',silk:'🧣',spice:'🌶️',fish:'🐟',wheat:'🌾',pottery:'🏺',fakir:'🔮'};
const RESOURCE_COUNT={ivory:2,jewels:2,gold:2,papyrus:4,silk:4,spice:4,fish:6,wheat:6,pottery:6,fakir:18};
const SETVP=[0,1,3,7,13,21,30,40,50,60];
// turn-order track: cost per spot; several spots may share a cost ("stack" spots: a later bidder goes first)
const BIDTRACK_STD=[18,12,8,5,3,1,0,0,0];const BIDTRACK_5=[18,12,8,5,5,3,3,1,1,0,0,0];
const CAMELS={2:11,3:8,4:8,5:8};
// items (Artisans): 9 precious + 9 magic. The split per kind is an assumption (see rules-notes).
const ITEMS={
  gem5:{n:'Silver Bangle',kind:'precious',vp:5,cp:3,x:'Worth 5 points at the end.'},
  gem7:{n:'Jade Casket',kind:'precious',vp:7,cp:3,x:'Worth 7 points at the end.'},
  gem9:{n:'Sun Diadem',kind:'precious',vp:9,cp:3,x:'Worth 9 points at the end.'},
  carpet:{n:'Wind Rug',kind:'magic',cp:2,x:'This turn your last person may be dropped on any tile holding its colour, ignoring distance and mountains.'},
  lamp:{n:'Brass Lamp',kind:'magic',cp:2,x:'Take one face-up djinn for free.'},
  flute:{n:'Reed Pipe',kind:'magic',cp:2,x:'Before your move, bring up to 5 people from neighbouring tiles onto one tile.'},
  scimitar:{n:'Ember Blade',kind:'magic',cp:1,x:'Remove any 2 people from the board; you claim tiles this empties.'},
  talisman:{n:'Storm Charm',kind:'magic',cp:1,x:'Move one of your camels to an empty tile.'},
  horn:{n:'Plenty Horn',kind:'magic',cp:1,x:'Replace the market row with 9 new goods.'}};
// thieves (one per colour)
const THIEVES={
  assassin:{n:'Red Cutpurse',x:'Each rival lifts one of their camels off a tile; you claim one of those tiles.'},
  builder:{n:'Blue Cutpurse',x:'Each rival gives up one palm tree or palace from their tiles; you place one of them on any tile.'},
  merchant:{n:'Green Cutpurse',x:'Each rival discards 2 goods; you take 2 of them.'},
  vizier:{n:'Gold Cutpurse',x:'Each rival gives up an Advisor; you keep one.'},
  elder:{n:'White Cutpurse',x:'Each rival gives up a djinn; you take one of them.'},
  artisan:{n:'Purple Cutpurse',x:'Each rival gives up an item; you take one of them.'}};
