// ---------- all story and tutorial text in one place (edit here; see ../../STORY.md). Original cast only. ----------
// Tutorial = the prologue of the story: Old Tamsin (guide) teaches Garnet (you) against Hob the Carter (rival, wants the land for his carts).
// Each step: title (<= 4 words), say (<= 20 words: the story reason, then the action, no "click here"), who ('guide'|'rival'), ch (chapter).
const STORY={
  guide:{name:'Old Tamsin',img:'media/camp-tamsin.webp',col:'#7a8a3c'},
  rival:{name:'Hob',img:'media/camp-hob.webp',col:'#b08a3e'},
  chapters:{1:'Your first turn',2:'Roads, scoring',3:'Special cases',4:'Ending the game'},
  quickTitle:'Out-build your rivals. Win the deeds of Vinemoor.',   // the Quick game intro line (title card)
  quickWin:'The deeds of Vinemoor are yours. The valley will remember it.',
  quickLose:r=>`${r} takes the deeds this time. The valley is still waiting for a rematch.`,
  quickTie:'A tie! Even the old reeve cannot split these deeds.',
  tut:{
    goal:{ch:1,who:'guide',title:'The empty valley',say:'Vinemoor has no owner. Whoever builds the best valley gets the deeds. Hob wants them too.'},
    turn:{ch:1,who:'guide',title:'Your first tile',say:'Hob is already measuring the land. Turn your tile; the road should point the right way.'},
    place1:{ch:1,who:'guide',title:'Road meets road',say:'Edges must match: road to road, field to field. Lay it where the road runs on.'},
    fig_road:{ch:1,who:'guide',title:'Claim the road',say:'A follower on the road makes it yours. You start with seven, so spend them wisely.'},
    computer:{ch:1,who:'rival',title:'Hob takes a turn',say:'Hob lays a tile and claims a spot. Anything with a follower on it is taken.'},
    place2:{ch:2,who:'guide',title:'Close the road',say:'Close your road on the left. Finished roads pay a point for every tile.'},
    fig_priory:{ch:2,who:'guide',title:'The old priory',say:'The priory stands empty. Claim it: eight tiles around it will pay 9 points.'},
    road_done:{ch:2,who:'guide',title:'The road pays',say:'Four tiles, four points, and your follower walks home to work again. Hob frowns.'},
    place3:{ch:2,who:'guide',title:'Raise a wall',say:'Towns grow where towns meet. Close the wall above before Hob can take it.'},
    fig_town:{ch:2,who:'guide',title:'Claim the town',say:'Claim it before it closes. A finished town pays 2 points for every tile.'},
    town_done:{ch:2,who:'guide',title:'The wall pays',say:'Two tiles, four points. The follower is back, and Hob grumbles.'},
    place4:{ch:3,who:'guide',title:'Ring the priory',say:'The priory needs all eight neighbours. This is the fourth. Keep building around it.'},
    fig_farmer:{ch:3,who:'guide',title:'Send a farmer',say:'A follower lying in a field is a farmer. At the end it pays 3 per finished town.'},
    place5:{ch:3,who:'guide',title:'Keep building',say:'Six neighbours are down. No follower is needed; just lay the tile.'},
    place6:{ch:3,who:'guide',title:'The last piece',say:'This tile completes the ring. The monks are ready to ring the bell.'},
    skip:{ch:3,who:'guide',title:'Keep your follower',say:'Nothing worth claiming here. Skip, and save your follower for later.'},
    priory_done:{ch:4,who:'guide',title:'The bell rings',say:'Eight tiles around it: 9 points! The follower walks home.'},
    final:{ch:4,who:'guide',title:'The final count',say:'The valley is full. Open roads and towns pay 1 per tile; your farmer pays 3 for the walled town.'},
    winner:{ch:4,who:'guide',title:'The deeds are yours',say:null}
  },
  prologue:{title:'Prologue',text:'Welcome, Garnet. Vinemoor is empty and Hob has his eye on it. Play one game with me first, and I will show you everything.'},
  tutEndTitle:'The deeds are yours',
  tutEndText:'Tamsin: "You build like a native, Garnet. Hob wants a rematch, and so does the valley."',
  tutEndStory:'Tamsin: "Now the real valley awaits. Hob is waiting at the first fence."'
};
// ---------- the coached first game (free play; Tamsin = guide, Hob = rival). Each rule is explained once, the first time it matters. t = text or fn(ctx).
STORY.coach={
  goal:{who:'guide',t:'You win with the most points when the last tile is laid. Claim roads and towns, then finish them.'},
  match:{who:'guide',t:'Tap your tile to turn it. It fits only where touching edges match: road to road, town to town, field to field.'},
  banner:{who:'guide',t:'This town tile has a banner. A finished town scores 2 per tile, and each banner adds 2 more.'},
  follower:{who:'guide',t:'Now claim something. A follower on a road, town, priory or field earns its points. You have seven; or skip.'},
  claim_road:{who:'guide',t:'A follower on a road. When the road is closed at both ends it scores 1 per tile, and your follower walks home.'},
  claim_town:{who:'guide',t:'A follower in a town. Close the walls and it scores 2 per tile, plus 2 per banner.'},
  claim_priory:{who:'guide',t:'A follower in a priory. Surround it with all eight neighbours for 9 points.'},
  claim_field:{who:'guide',t:'A follower lying in a field is a farmer. He stays until the end, then scores 3 for each finished town beside the field.'},
  one_owner:{who:'rival',t:'I claimed that one first. A road, town or field with a follower on it is taken: you can add tiles, but not claim it.'},
  score_road:{who:'guide',t:c=>`A finished road: ${c.n} tiles, ${c.pts} points. The follower goes home to be used again.`},
  score_town:{who:'guide',t:c=>`A finished town: ${c.n} tiles${c.pen?` and ${c.pen} banner${c.pen>1?'s':''}`:''}, ${c.pts} points.`},
  score_priory:{who:'guide',t:c=>c.pts>=9?'All eight neighbours: the priory pays 9 points!':`An unfinished priory pays 1 point plus 1 per neighbour. Here: ${c.pts}.`},
  majority:{who:'guide',t:'Most followers in a feature wins its points. When you are outnumbered, you score nothing from it.'},
  tie:{who:'guide',t:'A tie! When followers are level, every tied player scores the full points.'},
  rival_score:{who:'rival',t:c=>`Ha, +${c.pts} for me. Watch what I build next, friend.`},
  discard:{who:'guide',t:'That tile fits nowhere, so it is set aside and a new one is drawn. No harm done.'},
  nofig:{who:'guide',t:'No followers left. They come home when a road, town or priory they hold is finished.'},
  preview:{who:'guide',t:'The tags on the glowing squares show the points each spot scores right now. Press and hold one to see the feature it joins.'},
  rate_good:{who:'guide',t:'Good move: that was the best score on the board. Your last move is rated in the sheet above.'},
  rate_okay:{who:'guide',t:'Okay: a better spot was open. The sheet above says which, so you can compare next turn.'},
  rate_poor:{who:'guide',t:'A poor choice this time: a much better spot was open. The tags on the squares show the difference.'},
  last:{who:'guide',t:'The last tiles. When the final one is placed, the game ends and unfinished features score a point per tile.'}
};
STORY.coachEnd={
  road:c=>`Roads: ${c.a} while building + ${c.b} at the end = ${c.a+c.b}. One point per tile.`,
  town:c=>`Towns: ${c.a} while building + ${c.b} at the end = ${c.a+c.b}. Two per tile when finished, one when not.`,
  priory:c=>`Priories: ${c.a} while building + ${c.b} at the end = ${c.a+c.b}. Nine when ringed, else one plus neighbours.`,
  field:c=>`Fields: ${c.b} from farmers, three for every finished town beside their field.`,
  total:c=>c.win?`You ${c.me}, Hob ${c.hob}: the deeds of Vinemoor are yours!`:c.tie?`You ${c.me}, Hob ${c.hob}: a tie, and a shared valley.`:`You ${c.me}, Hob ${c.hob}: Hob takes the deeds this time. Try again!`,
  later:'Things you will meet later'
};
STORY.coachLater={river:'The river: a first set of tiles that must flow on without turning back twice.',inns:'Taverns: a road with an inn scores double when finished, but nothing when not. A basilica town scores triple.',goods:'Merchants: finishing a town takes its goods; most of each good at the end scores 10. Masons give extra turns, hogs make farms richer.',tie:'Ties: followers level in a feature, everyone scores in full.',majority:'Majority: more followers in a feature takes the points, the others get nothing.',discard:'A tile that fits nowhere is set aside and another is drawn.',banner:'Banners add 2 to a finished town.',score_road:'A finished road scores 1 per tile and its followers go home.',score_town:'A finished town scores 2 per tile and 2 per banner; unfinished at the end it is 1 each.',score_priory:'A priory ringed by eight tiles scores 9; unfinished at the end it is 1 plus 1 per neighbour.'};
