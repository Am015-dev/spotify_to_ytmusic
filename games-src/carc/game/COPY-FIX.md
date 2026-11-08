# Rampart and Vine copy fixes

Goal card verdict: rewritten (bf.js:229 had 4 bullets plus an extra line; replacement is row 1, marked GOAL).

Notes: tutor.js step titles and say lines are overridden by STORY.tut (retired forced tutorial), so they are not listed. Line numbers are approximate (src/ files under games-src/carc/game/src/).

| # | file:line | old line | new line |
|---|---|---|---|
| 1 | src/bf.js:229 GOAL | <p>Most points when the last tile is laid.</p><ul><li><b>Town</b> finished: 2 per tile</li><li><b>Road</b> finished: 1 per tile</li><li><b>Priory</b> ringed by 8 tiles: 9</li><li><b>Field</b>: 3 per finished town, at the end</li></ul><p class="gsub">Only your followers earn you points.</p> | <p>Win by having the most points when the last tile is down.</p><ul><li>Finished road: 1 per tile. Finished town: 2 per tile.</li><li>Priory with 8 tiles around it: 9</li><li>Farmer: 3 per finished town, at the end</li></ul> (delete the gsub line; "Only your followers score" is taught by the coach) |
| 2 | src/story.js:8 | Out-build your rivals. Win the deeds of Vinemoor. | Build the best valley. Win the deeds to Vinemoor. |
| 3 | src/story.js:9 | The deeds of Vinemoor are yours. The valley will remember it. | You win the deeds to Vinemoor! |
| 4 | src/story.js:10 | takes the deeds this time. The valley is still waiting for a rematch. | wins the deeds this time. Want a rematch? |
| 5 | src/story.js:11 | A tie! Even the old reeve cannot split these deeds. | A tie! You share the deeds. |
| 6 | src/story.js:7 | 2:'Roads, scoring',3:'Special cases' | 2:'Scoring',3:'Farmers and priories' |
| 7 | src/story.js:14 | Hob is already measuring the land. Turn your tile; the road should point the right way. | Tap your tile to turn it. Point the road the right way. |
| 8 | src/story.js:15 | Edges must match: road to road, field to field. Lay it where the road runs on. | Edges must match. Lay it where the road continues. |
| 9 | src/story.js:16 | A follower on the road makes it yours. You start with seven, so spend them wisely. | A follower on a road claims it. You start with seven. |
| 10 | src/story.js:17 | Hob lays a tile and claims a spot. Anything with a follower on it is taken. | Hob plays a tile. A road, town or field with a follower is taken. |
| 11 | src/story.js:18 | Close your road on the left. Finished roads pay a point for every tile. | Close your road on the left. A finished road scores 1 per tile. |
| 12 | src/story.js:19 | The priory stands empty. Claim it: eight tiles around it will pay 9 points. | Put a follower on the priory. Eight tiles around it score 9. |
| 13 | src/story.js:20 | Four tiles, four points, and your follower walks home to work again. Hob frowns. | Four tiles, four points. Your follower goes home. |
| 14 | src/story.js:21 | Towns grow where towns meet. Close the wall above before Hob can take it. | Join town to town. Close the town above before Hob claims it. |
| 15 | src/story.js:22 | A finished town pays 2 points for every tile. | A finished town scores 2 per tile. |
| 16 | src/story.js:23 | Two tiles, four points. The follower is back, and Hob grumbles. | Two tiles, four points. Your follower goes home. |
| 17 | src/story.js:24 | The priory needs all eight neighbours. This is the fourth. Keep building around it. | A priory needs eight neighbours. This is the fourth. |
| 18 | src/story.js:25 | A follower lying in a field is a farmer. At the end it pays 3 per finished town. | A follower in a field is a farmer. At the end it scores 3 per finished town. |
| 19 | src/story.js:26 | Six neighbours are down. No follower is needed; just lay the tile. | Six neighbours are down. Place the tile. You need no follower. |
| 20 | src/story.js:27 | This tile completes the ring. The monks are ready to ring the bell. | This tile completes the ring around your priory. |
| 21 | src/story.js:28 | Nothing worth claiming here. Skip, and save your follower for later. | Nothing to claim here. Tap Skip to keep your follower. |
| 22 | src/story.js:29 | Eight tiles around it: 9 points! The follower walks home. | Eight tiles around it: 9 points! Your follower goes home. |
| 23 | src/story.js:30 | The valley is full. Open roads and towns pay 1 per tile; your farmer pays 3 for the walled town. | The valley is full. Unfinished roads and towns score 1 per tile. Your farmer scores 3. |
| 24 | src/story.js:20 | title:'The road pays' | title:'Road finished' |
| 25 | src/story.js:21 title | title:'Raise a wall' | title:'Build a town' |
| 26 | src/story.js:23 title | title:'The wall pays' | title:'Town finished' |
| 27 | src/story.js:19 title | title:'The old priory' | title:'Claim the priory' |
| 28 | src/story.js:24 title | title:'Ring the priory' | title:'Fill the ring' |
| 29 | src/story.js:27 title | title:'The last piece' | title:'The last tile' |
| 30 | src/story.js:29 title | title:'The bell rings' | title:'Priory scored' |
| 31 | src/story.js:30 title | title:'The final count' | title:'Final scoring' |
| 32 | src/story.js:33 | Welcome, Garnet. Vinemoor is empty and Hob has his eye on it. Play one game with me first, and I will show you everything. | Welcome, Garnet. Vinemoor is empty, and Hob wants it. Play one game with me first. I will explain each rule as it comes up. |
| 33 | src/story.js:35 | You build like a native, Garnet. Hob wants a rematch, and so does the valley. | Well built, Garnet. Hob wants a rematch. |
| 34 | src/story.js:36 | Now the real valley awaits. Hob is waiting at the first fence. | Now the real game starts. Hob waits at the first fence. |
| 35 | src/story.js:40 | Vinemoor has no owner. Build it tile by tile, claim it with followers, and most points wins the deeds. | Lay tiles and claim things with followers. Most points wins the deeds. |
| 36 | src/story.js:41 | Tap your tile to turn it. It fits only where touching edges match: road to road, town to town, field to field. | Tap your tile to turn it. Touching edges must match: road to road, town to town, field to field. |
| 37 | src/story.js:42 | This town tile has a banner. A finished town scores 2 per tile, and each banner adds 2 more. | This town has a banner. A finished town scores 2 per tile. Each banner adds 2. |
| 38 | src/story.js:43 | Now claim something. A follower on a road, town, priory or field earns its points. You have seven; or skip. | Claim something with a follower, or tap Skip. You have seven. |
| 39 | src/story.js:44 | A follower on a road. When the road is closed at both ends it scores 1 per tile, and your follower walks home. | A finished road scores 1 per tile. Your follower goes home. |
| 40 | src/story.js:45 | A follower in a town. Close the walls and it scores 2 per tile, plus 2 per banner. | A finished town scores 2 per tile, plus 2 per banner. |
| 41 | src/story.js:46 | A follower in a priory. Surround it with all eight neighbours for 9 points. | Surround your priory with eight tiles to score 9. |
| 42 | src/story.js:47 | A follower lying in a field is a farmer. He stays until the end, then scores 3 for each finished town beside the field. | A follower in a field is a farmer. He stays until the end. Then he scores 3 per finished town beside the field. |
| 43 | src/story.js:48 | I claimed that one first. A road, town or field with a follower on it is taken: you can add tiles, but not claim it. | I claimed that first. A road, town or field with a follower is taken. |
| 44 | src/story.js:49 | The follower goes home to be used again. | The follower goes home. |
| 45 | src/story.js:51 | All eight neighbours: the priory pays 9 points! | Eight neighbours: the priory scores 9 points! |
| 46 | src/story.js:51 b | An unfinished priory pays 1 point plus 1 per neighbour. Here: | An unfinished priory scores 1 plus 1 per neighbour. Here: |
| 47 | src/story.js:52 | Most followers in a feature wins its points. When you are outnumbered, you score nothing from it. | The most followers wins the points. With fewer, you score nothing. |
| 48 | src/story.js:53 | A tie! When followers are level, every tied player scores the full points. | A tie! Players with equal followers each score in full. |
| 49 | src/story.js:54 | Ha, +${c.pts} for me. Watch what I build next, friend. | Ha, +${c.pts} for me! |
| 50 | src/story.js:55 | That tile fits nowhere, so it is set aside and a new one is drawn. No harm done. | That tile fits nowhere. You draw a new one. |
| 51 | src/story.js:56 | No followers left. They come home when a road, town or priory they hold is finished. | No followers left. Finish a road, town or priory to get them back. |
| 52 | src/story.js:57 | The tags on the glowing squares show the points each spot scores right now. Press and hold one to see the feature it joins. | Each glowing square shows the points it would score. Press and hold to see what it joins. |
| 53 | src/story.js:58 | Good move: that was the best score on the board. Your last move is rated in the sheet above. | Good move! It was the best score on the board. |
| 54 | src/story.js:59 | Okay: a better spot was open. The sheet above says which, so you can compare next turn. | Okay. A better spot was open. Tap the scores above to see which. |
| 55 | src/story.js:60 | A poor choice this time: a much better spot was open. The tags on the squares show the difference. | Not your best. A much better spot was open. Compare the tags on the squares. |
| 56 | src/story.js:61 | The last tiles. When the final one is placed, the game ends and unfinished features score a point per tile. | Last tiles! After the final tile, the game ends. Unfinished roads and towns score 1 per tile. |
| 57 | src/story.js:64 | Roads: ${c.a} while building + ${c.b} at the end = ${c.a+c.b}. One point per tile. | Roads: ${c.a} during play, ${c.b} at the end, ${c.a+c.b} in all. 1 point per tile. |
| 58 | src/story.js:65 | Towns: ${c.a} while building + ${c.b} at the end = ${c.a+c.b}. Two per tile when finished, one when not. | Towns: ${c.a} during play, ${c.b} at the end, ${c.a+c.b} in all. 2 per tile if finished, 1 if not. |
| 59 | src/story.js:66 | Priories: ${c.a} while building + ${c.b} at the end = ${c.a+c.b}. Nine when ringed, else one plus neighbours. | Priories: ${c.a} during play, ${c.b} at the end, ${c.a+c.b} in all. 9 with 8 neighbours, else 1 plus 1 per neighbour. |
| 60 | src/story.js:67 | Fields: ${c.b} from farmers, three for every finished town beside their field. | Fields: ${c.b} from farmers. 3 for each finished town beside their field. |
| 61 | src/story.js:68 | : the deeds of Vinemoor are yours! | . You win the deeds! |
| 62 | src/story.js:68 b | : a tie, and a shared valley. | . A tie! |
| 63 | src/story.js:68 c | : Hob takes the deeds this time. Try again! | . Hob wins this time. Play again? |
| 64 | src/story.js:69 | later:'Things you will meet later' | later:'Rules to learn later' |
| 65 | src/story.js:71 | river:'The river: a first set of tiles that must flow on without turning back twice.' | river:'The river: tiles that must continue the river. It cannot turn the same way twice.' |
| 66 | src/story.js:71 b | Taverns: a road with an inn scores double when finished, but nothing when not. A basilica town scores triple. | Taverns: a finished road with a tavern scores double. Unfinished, it scores nothing. A basilica town scores triple. |
| 67 | src/story.js:71 c | Merchants: finishing a town takes its goods; most of each good at the end scores 10. Masons give extra turns, hogs make farms richer. | Merchants: finish a town to take its goods. The most of each good scores 10. Masons give extra turns. Hogs make fields score more. |
| 68 | src/story.js:71 d | Ties: followers level in a feature, everyone scores in full. | Ties: equal followers on a road, town or field each score in full. |
| 69 | src/story.js:71 e | Majority: more followers in a feature takes the points, the others get nothing. | Majority: the most followers takes the points. Others get nothing. |
| 70 | src/story.js:71 f | A tile that fits nowhere is set aside and another is drawn. | A tile that fits nowhere is set aside. You draw another. |
| 71 | src/story.js:71 g | Banners add 2 to a finished town. | Each banner adds 2 to a finished town. |
| 72 | src/story.js:71 h | A finished town scores 2 per tile and 2 per banner; unfinished at the end it is 1 each. | A finished town scores 2 per tile and 2 per banner. Unfinished at the end, 1 per tile. |
| 73 | src/story.js:71 i | A priory ringed by eight tiles scores 9; unfinished at the end it is 1 plus 1 per neighbour. | A priory with eight tiles around it scores 9. Unfinished at the end, 1 plus 1 per neighbour. |
| 74 | src/coach.js:84 | (i === pages.length - 1 ? 'Next' : 'Next') | (i === pages.length - 1 ? 'Continue' : 'Next') |
| 75 | src/coach.js:69 | aria-label="Score walk" | aria-label="Score summary" |
| 76 | src/hlp.js:38 | Your rival does the same, step by step. Most points wins. | Your rival takes a turn. Most points wins. |
| 77 | src/hlp.js:43 | Closed means points | Finished means points |
| 78 | src/hlp.js:43 b | A road or town scores when nothing is left open. Longer ones are worth more. | A road or town scores when it is finished. Longer ones score more. |
| 79 | src/hlp.js:44 | Your mason’s road or town just grew, so you draw and place another tile. | Your mason’s road or town grew. Draw and place another tile. |
| 80 | src/hlp.js:46 | Each one must carry the river on from the last tile. | Each river tile must continue the river. |
| 81 | src/hlp.js:48 | After the last river tile, normal tiles begin and you build outward. | After the last river tile, you play normal tiles. |
| 82 | src/hlp.js:53 | Place a mason on a road or town you already hold. Each tile that grows it gives an extra turn. | Put a mason on your own road or town. Each tile added gives an extra turn. |
| 83 | src/hlp.js:58 | The first seat always starts. The mason’s extra turn counts even when its tile finishes the feature. Tile art follows common open sets. | The first player always starts. A mason’s extra turn counts even if that tile finishes the road or town. |
| 84 | src/hlp.js:29 | Tap a glow. Tap the tile to turn. | Tap a glowing square. Tap your tile to turn it. |
| 85 | src/hlp.js:30 | Carry the river on. Tap a glow. | Continue the river. Tap a glowing square. |
| 86 | src/hlp.js:31 | Mason bonus tile. Tap a glow. | Extra tile from your mason. Tap a glowing square. |
| 87 | src/hlp.js:74 | The safest spot: it keeps your options open. | A safe spot. It keeps your choices open. |
| 88 | src/hlp.js:80 | Send a farmer into this field. It pays at the end. | Put a farmer in this field. It scores at the end. |
| 89 | src/bf.js:149 | Follow the river: tap a glow. | Continue the river: tap a glowing square. |
| 90 | src/bf.js:149 b | Turn, then place: tap a glow. | Turn your tile, then tap a glowing square. |
| 91 | src/bf.js:149 c | Place your tile: tap a glow. | Tap a glowing square to place your tile. |
| 92 | src/bf.js:29 | priory ringed by 8 tiles | priory with 8 tiles around it |
| 93 | src/bf.js:29 b | open priory | unfinished priory |
| 94 | src/bf.js:225 | Draw a tile. Turn it, then lay it so every edge matches. | Draw a tile. Turn it and lay it so edges match. |
| 95 | src/bf.js:225 b | Then stand a follower on a road, town, priory or field, or skip. | Then put a follower on a road, town, priory or field, or skip. |
| 96 | src/bf.js:225 c | Finish a road or town: its owner scores, the follower comes home. | Finish a road or town. Its owner scores and the follower goes home. |
| 97 | src/bf.js:225 d | A priory ringed by eight tiles scores 9. | A priory with eight tiles around it scores 9. |
| 98 | src/preview.js:32 | badge: 'feeds' | badge: 'helps them' |
| 99 | src/preview.js:39 | field: 3 per town at end | field: 3 per finished town |
| 100 | src/preview.js:40 | priory: 9 when ringed | priory: 9 with 8 tiles around |
| 101 | src/preview.js:43 | ' if closed' | ' when finished' |
| 102 | src/preview.js:84 | a stronger spot was open. | a better spot was open. |
| 103 | src/engine.js:40 | River tiles come first; each must carry the river on, and it may not turn the same way twice in a row. | River tiles come first. Each must continue the river. It cannot turn the same way twice. |
| 104 | src/engine.js:42 | A new valley waits for ${np} settlers${exList()}. | A new game for ${np} players${exList()}. |
| 105 | src/engine.js:24 | river:'The Riverlands' | river:'River' |
| 106 | src/engine.js:24 b | ic:'Taverns & Basilicas' | ic:'Taverns' |
| 107 | src/engine.js:24 c | tb:'Merchants & Masons' | tb:'Merchants' |
| 108 | src/engine.js:85 | fits nowhere yet; it goes back under the river pile. | fits nowhere yet. It goes back in the river pile. |
| 109 | src/engine.js:86 | No legal place for “${TT[t].n}”: it is set aside and a new tile is drawn. | “${TT[t].n}” fits nowhere. It is set aside and you draw again. |
| 110 | src/engine.js:89 | lg(`— ${P(p).nm}${bonus?' (mason’s extra turn)':''} draws “${TT[t].n}” —` | lg(`${P(p).nm} draws “${TT[t].n}”${bonus?' (extra turn)':''}.` |
| 111 | src/engine.js:93 | The river reaches its pond. Now the ordinary tiles begin. | The river ends at the pond. Normal tiles come next. |
| 112 | src/engine.js:96 | 🔨 ${p.nm}’s mason works on: an extra turn after this one. | ${p.nm}’s mason earns an extra turn after this one. |
| 113 | src/engine.js:107 | ${p.nm} sets a  | ${p.nm} puts a  |
| 114 | src/engine.js:126 | ✔ The ${what} is finished: ${win.map(w=>P(w).nm).join(' and ')} score | The ${what} is finished. ${win.map(w=>P(w).nm).join(' and ')} score |
| 115 | src/engine.js:127 | is finished, but nobody stands in it. | is finished. Nobody has a follower there. |
| 116 | src/engine.js:130 | 🧺 ${p.nm} closed it and takes | ${p.nm} finished it and takes |
| 117 | src/engine.js:135 | Half the tiles are down. Smoke rises from new hearths, and the valley is starting to look like a country. | Half the tiles are down. |
| 118 | src/engine.js:136 | The walls of the great town close: ${d.win.map(w=>P(w).nm).join(' and ')}’s followers claim ${d.pts} points. | A big town is finished. ${d.win.map(w=>P(w).nm).join(' and ')} score ${d.pts} points. |
| 119 | src/engine.js:152 | Unfinished roads, towns and priories score, then the farmers are counted. | Unfinished roads, towns and priories score. Then farmers score. |
| 120 | src/engine.js:155 | ${w.length>1?'share the valley':'wins'} with ${top} points. | ${w.length>1?'tie':'wins'} with ${top} points. |
| 121 | src/tutor.js:112 | Learn the rules in 5 minutes, one tap at a time. | Learn the rules in 5 minutes. |
| 122 | ../campaign.json chapters/1/intro/2 | Put a warden in a small town and close it fast. A 2-tile town is 4 points. | Put a follower in a small town and finish it fast. A 2-tile town scores 4. |
| 123 | ../campaign.json chapters/1/outro/0 | Small towns closed quickly bring your wardens home for the next one. | Finish small towns fast and your followers come home. |
| 124 | ../campaign.json chapters/2/intro/1 | each field pays 3 points for every finished town it touches. | each field scores 3 per finished town it touches. |
| 125 | ../campaign.json chapters/2/outro/1 | Fields are the quiet points. Many games are won in the last count. | Fields are quiet points. Many games are won at the end. |
| 126 | ../campaign.json chapters/3/intro/1 | A priory surrounded by 8 tiles is worth 9. Unfinished, it pays 1 per tile around it. | A priory with 8 tiles around it scores 9. Unfinished, it scores 1 plus 1 per neighbour. |
| 127 | ../campaign.json chapters/3/outro/0 | Your roads, towns, fields and priories... the valley speaks for you. | You built roads, towns, fields and priories. Well done. |
| 128 | ../campaign.json chapters/3/outro/1 | Word travels downriver. Merchants will come now, and harder rivals. | Merchants are coming, and harder rivals. |
| 129 | ../campaign.json chapters/3/easier | Just win; any score will do. | Just win. Any score will do. |
| 130 | ../campaign.json chapters/4/intro/2 | Ferro plays properly now: he finishes what he starts. Watch his followers. | Ferro plays properly now. He finishes what he starts. |
| 131 | ../campaign.json chapters/4/outro/0 | You crossed well. Keep the ferry fee, you earned it. | You crossed well. Keep the ferry fee. |
| 132 | ../campaign.json chapters/5/intro/1 | Careful: a road with a tavern or a town with a basilica pays nothing if unfinished. | Careful. A tavern road or basilica town scores nothing if unfinished. |
| 133 | ../campaign.json chapters/6/intro/1 | Whoever closes a town takes its goods. The most wine, grain or cloth is worth 10 each. | Finish a town to take its goods. The most of each good scores 10. |
| 134 | ../campaign.json chapters/6/intro/2 | your hog fattens a field. | your hog makes a field score more. |
| 135 | ../campaign.json chapters/7/intro/1 | She plays the best game you have faced: she counts the tiles still in the bag. | She plays the best game yet. She counts the tiles left. |
| 136 | ../campaign.json chapters/7/intro/2 | No tricks this time. Just the base valley, and the river. | No extras this time. Just the base game and the river. |
| 137 | ../campaign.json chapters/9/intro/1 | All three expansions, his best play, and a head start. This is the last deed. | All three extras, his best play, and a head start. This is the last deed. |
| 138 | ../campaign.json chapters/9/goal | Win the game against the Baron's 15-point head start. | Win, even with the Baron's 15-point head start. |

ROWS: 138
