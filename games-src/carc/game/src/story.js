// ---------- all story and tutorial text in one place (edit here; see ../../STORY.md). Original cast only. ----------
// Tutorial = the prologue of the story: Old Tamsin (guide) teaches Garnet (you) against Hob the Carter (rival, wants the land for his carts).
// Each step: title (<= 4 words), say (<= 20 words: the story reason, then the action, no "click here"), who ('guide'|'rival'), ch (chapter).
const STORY={
  guide:{name:'Old Tamsin',img:'media/camp-tamsin.webp',col:'#7a8a3c'},
  rival:{name:'Hob',img:'media/camp-hob.webp',col:'#b08a3e'},
  chapters:{1:'Your first turn',2:'Roads, scoring',3:'Special cases',4:'Ending the game'},
  quickIntro:r=>`The deeds of Vinemoor are up for grabs. Out-build ${r}.`,
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
  tutEndTitle:'The deeds are yours',
  tutEndText:'Tamsin: "You build like a native, Garnet. Hob wants a rematch, and so does the valley."',
  tutEndStory:'Tamsin: "Now the real valley awaits. Hob is waiting at the first fence."'
};
