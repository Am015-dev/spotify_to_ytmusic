// ---------- all story and tutorial text in one place (edit here; see ../../STORY.md). Original cast only. ----------
// Tutorial = the prologue of the story: Old Tamsin (guide) teaches Garnet (you) against Hob the Carter (rival, wants the land for his carts).
// Each step: title (<= 4 words), say (<= 20 words: the story reason, then the action, no "click here"), who ('guide'|'rival'), ch (chapter).
const STORY={
  guide:{name:'Old Tamsin',img:'media/camp-tamsin.webp',col:'#7a8a3c'},
  rival:{name:'Hob',img:'media/camp-hob.webp',col:'#b08a3e'},
  chapters:{1:'Your first turn',2:'Scoring',3:'Farmers and priories',4:'Ending the game'},
  quickTitle:'Build the best valley. Win the deeds to Vinemoor.',   // the Quick game intro line (title card)
  quickWin:'You win the deeds to Vinemoor!',
  quickLose:r=>`${r} wins the deeds this time. Want a rematch?`,
  quickTie:'A tie! You share the deeds.',
  tut:{
    goal:{ch:1,who:'guide',title:'The empty valley',say:'Lay tiles and claim them with followers. Most points wins.'},
    turn:{ch:1,who:'guide',title:'Your first tile',say:'This is your tile. Tap it to turn it.'},
    place1:{ch:1,who:'guide',title:'Road meets road',say:'Edges must match: road to road. Tap the glowing square.'},
    fig_road:{ch:1,who:'guide',title:'Claim the road',say:'Tap the circle: a follower claims this road. You have seven.'},
    computer:{ch:1,who:'rival',title:'Hob takes a turn',say:'Hob laid a tile and claimed it. Tap Hob’s lit tile.'},
    place2:{ch:2,who:'guide',title:'Close the road',say:'Close your road. Followers go only on the tile just laid.'},
    fig_priory:{ch:2,who:'guide',title:'Claim the priory',say:'Claim the priory. Eight tiles around it score 9.'},
    road_done:{ch:2,who:'guide',title:'Road finished',say:'Finished road: 1 point per tile. Tap the lit tiles.'},
    place3:{ch:2,who:'guide',title:'Build a town',say:'Town meets town. Tap the square to close the town.'},
    fig_town:{ch:2,who:'guide',title:'Claim the town',say:'Claim the town before it closes.'},
    town_done:{ch:2,who:'guide',title:'Town finished',say:'Finished town: 2 points per tile. Tap the lit tiles.'},
    place4:{ch:3,who:'guide',title:'Fill the ring',say:'A priory needs all eight neighbours. Lay the fourth.'},
    fig_farmer:{ch:3,who:'guide',title:'Send a farmer',say:'A follower in a field is a farmer. It never comes home.'},
    place5:{ch:3,who:'guide',title:'Keep building',say:'Lay this tile. No follower needed this time.'},
    place6:{ch:3,who:'guide',title:'The last tile',say:'This tile closes the ring around your priory.'},
    skip:{ch:3,who:'guide',title:'Keep your follower',say:'Nothing to claim here. Tap Skip to keep your follower.'},
    priory_done:{ch:4,who:'guide',title:'Priory scored',say:'Eight neighbours: the priory scores 9. Follower comes home.'},
    final:{ch:4,who:'guide',title:'Final scoring',say:'Last tile! Open things: 1 per tile. Farmers: 3 per finished town.'},
    claimed:{ch:1,who:'guide',title:'One owner',say:'A claimed road or town takes no second follower. Tap the tile.'},
    pennant:{ch:2,who:'guide',title:'Banners',say:'Each banner in a finished town adds 2 points. Tap the tiles.'},
    majority:{ch:3,who:'guide',title:'Most followers',say:'Most followers on a road or town scores it. Tap the tiles.'},
    tie:{ch:3,who:'guide',title:'Ties',say:'Tied for most followers? Both score in full. Tap the tiles.'},
    discard:{ch:3,who:'guide',title:'No fit',say:'A tile that fits nowhere is swapped for a new one.'},
    winner:{ch:4,who:'guide',title:'The deeds are yours',say:null}
  },
  prologue:{title:'Prologue',text:'Welcome, Garnet. Vinemoor is empty, and Hob wants it. Play one game with me first. I will explain each rule as it comes up.'},
  tutEndTitle:'The deeds are yours',
  tutEndText:'Tamsin: "Well built, Garnet. Hob wants a rematch."',
  tutEndStory:'Tamsin: "Now the real game starts. Hob waits at the first fence."'
};
// ---------- the coached first game (free play; Tamsin = guide, Hob = rival). Each rule is explained once, the first time it matters. t = text or fn(ctx).
STORY.coach={
  goal:{who:'guide',t:'Most points when the last tile is down wins. Claim roads and towns, then finish them.'},
  match:{who:'guide',t:'Tap your tile to turn it. Touching edges must match. Road to road, town to town, field to field.'},
  banner:{who:'guide',t:'This town has a banner. A finished town scores 2 per tile. Each banner adds 2.'},
  follower:{who:'guide',t:'Claim something with a follower, or tap Skip. You have seven.'},
  claim_road:{who:'guide',t:'A finished road scores 1 per tile. Your follower goes home.'},
  claim_town:{who:'guide',t:'A finished town scores 2 per tile, plus 2 per banner.'},
  claim_priory:{who:'guide',t:'Surround your priory with eight tiles to score 9.'},
  claim_field:{who:'guide',t:'A follower in a field is a farmer. He stays until the end. Then he scores 3 per finished town beside the field.'},
  one_owner:{who:'rival',t:'I claimed that first. A road, town or field with a follower is taken.'},
  score_road:{who:'guide',t:c=>`A finished road: ${c.n} tiles, ${c.pts} points. The follower goes home.`},
  score_town:{who:'guide',t:c=>`A finished town: ${c.n} tiles${c.pen?` and ${c.pen} banner${c.pen>1?'s':''}`:''}, ${c.pts} points.`},
  score_priory:{who:'guide',t:c=>c.pts>=9?'Eight neighbours: the priory scores 9 points!':`An unfinished priory scores 1 plus 1 per neighbour. Here: ${c.pts}.`},
  majority:{who:'guide',t:'The most followers wins the points. With fewer, you score nothing.'},
  tie:{who:'guide',t:'A tie! Players with equal followers each score in full.'},
  rival_score:{who:'rival',t:c=>`Ha, +${c.pts} for me!`},
  discard:{who:'guide',t:'That tile fits nowhere. You draw a new one.'},
  nofig:{who:'guide',t:'No followers left. Finish a road, town or priory to get them back.'},
  preview:{who:'guide',t:'Each glowing square shows the points it would score. Press and hold to see what it joins.'},
  rate_good:{who:'guide',t:'Good move! It was the best score on the board.'},
  rate_okay:{who:'guide',t:'Okay. A better spot was open. Tap the scores above to see which.'},
  rate_poor:{who:'guide',t:'Not your best. A much better spot was open. Compare the tags on the squares.'},
  last:{who:'guide',t:'Last tiles! After the final tile, the game ends. Unfinished roads and towns score 1 per tile.'}
};
STORY.coachEnd={
  road:c=>`Roads: ${c.a} during play, ${c.b} at the end, ${c.a+c.b} in all. 1 point per tile.`,
  town:c=>`Towns: ${c.a} during play, ${c.b} at the end, ${c.a+c.b} in all. 2 per tile if finished, 1 if not.`,
  priory:c=>`Priories: ${c.a} during play, ${c.b} at the end, ${c.a+c.b} in all. 9 with 8 neighbours, else 1 plus 1 per neighbour.`,
  field:c=>`Fields: ${c.b} from farmers. 3 for each finished town beside their field.`,
  total:c=>c.win?`You ${c.me}, Hob ${c.hob}. You win the deeds!`:c.tie?`You ${c.me}, Hob ${c.hob}. A tie!`:`You ${c.me}, Hob ${c.hob}. Hob wins this time. Play again?`,
  later:'Rules to learn later'
};
STORY.coachLater={river:'River: each tile must continue the river.',inns:'Taverns: a finished tavern road scores double.',goods:'Merchants: the most of each good scores 10.',tie:'Ties: equal followers both score in full.',majority:'Most followers takes the points.',discard:'A tile that fits nowhere is swapped.',banner:'Each banner adds 2 to a finished town.',score_road:'A finished road scores 1 per tile.',score_town:'A finished town scores 2 per tile.',score_priory:'A priory with 8 neighbours scores 9.'};
