# Sunglaze copy-fix table
Game: Sunglaze (azul/game/src) | Date: 2026-11-08

## Goal card

Status: fixed. The Goal card (`.gl` in games-src/azul/game/src/ui8.js:100, shown by phGoalHTML) is three sentences, not one aim.

- Current: `Most ★ wins. The game ends after a round in which someone completes a mosaic row. Then: full row +2, full column +7, all 5 of a glaze +10.`
- Fixed (one sentence): `Set glazed tiles on your mosaic and finish with the most ★.`
- Keep the short `.gs` line (`Most ★ wins · ends after a mosaic row is full · end bonus: row +2, column +7, glaze +10`) as the rules reminder under it.

## Table

| file:line | old line | new line |
|---|---|---|
| src/tutor.js:34 | `Tile the palace wall; most stars wins` | `Fill your wall with tiles. Most stars wins.` |
| src/tutor.js:34 | `Kilns hold four tiles; take from a kiln or the middle` | `Each kiln holds four tiles. Take from a kiln or the middle.` |
| src/tutor.js:34 | `Take EVERY tile of one colour from one place` | `Take every tile of one colour from one place.` |
| src/tutor.js:35 | `Pattern row n holds n tiles of ONE colour` | `Row n holds n tiles of one colour.` |
| src/tutor.js:35 | `Taking from the middle: the first to do so takes the Sun token` | `The first to take from the middle gets the Sun token.` |
| src/tutor.js:36 | `Floor spaces cost -1 -1 -2 -2 -2 -3 -3` | `Floor spaces cost more stars the further along they are.` |
| src/tutor.js:36 | `The Sun token costs a floor space and you start the next round` | `The Sun token fills a floor space, but you start next round.` |
| src/tutor.js:37 | `A row that is not full keeps its tiles for later` | `A part-filled row keeps its tiles for next round.` |
| src/tutor.js:37 | `A colour already on a wall row cannot go on that row` | `Each colour can appear once in a wall row.` |
| src/tutor.js:38 | `Each full row sends ONE tile to the wall, the rest is discarded` | `A full row sends one tile to the wall. The rest are discarded.` |
| src/tutor.js:38 | `Touching tiles score row line + column line` | `A tile scores for the tiles it touches in its row and column.` |
| src/tutor.js:39 | `Floor penalties apply at round end (score never below 0)` | `Floor tiles cost stars at round end. Score stays at 0 or more.` |
| src/tutor.js:39 | `The game ends after the round in which a wall row is complete` | `The game ends after a round with a full wall row.` |
| src/tutor.js:40 | `End bonuses: row +2, column +7, all five of a colour +10` | `End bonuses: row +2, column +7, five of one colour +10.` |
| src/tutor.js:40 | `Most points wins; a tie goes to the most full rows` | `Most points wins. A tie goes to more full rows.` |
| src/tutor.js:87 | `Welcome, apprentice. You and Tamsin tile the Sun King\'s wall; most stars wins. Each kiln holds four tiles. Tap one tile: you take every tile of that colour.` | `Welcome! Tap a tile to take every tile of that colour.` |
| src/tutor.js:88 | `Free play from here: any kiln, any row. One hint: the lone Frost completes your top row, your Frost column and all five Frost.` | `Play freely. Hint: the lone Frost completes your top row.` |
| src/tutor.js:91 | `The middle: the first player to take from it also takes the Sun token, which costs a floor space. Not always bad, but know it.` | `The first to take from the middle gets the Sun token.` |
| src/tutor.js:92 | `The middle holds what the kilns left over. Take all of one colour, as always.` | `The middle holds leftovers. Take all of one colour, as usual.` |
| src/tutor.js:93 | `'You take every '+nm+' tile on a kiln at once ('+n+' here). Now tap a glowing row.'` | `'You took '+cgPl(n,nm+' tile')+'. Now tap a glowing row.'` |
| src/tutor.js:95 | `', so that row is closed to '+nm+': a glaze appears once per wall row.'` | `'. Each colour can appear once in a wall row.'` |
| src/tutor.js:96 | `Tap the floor: those tiles cost stars, but you must take them.` | `Tap the floor.` |
| src/tutor.js:99 | `Straight to the floor: each floor space costs stars when the round ends: −1, −1, −2, −2, −2, −3, −3.` | `Floor tiles cost stars at round end, more for each one.` |
| src/tutor.js:99 | `' tiles straight to the floor is '+I.pen+' stars.'` | `' tiles on the floor cost '+I.pen+' stars.'` |
| src/tutor.js:100 | `' crack onto the floor. Floor spaces cost −1, −1, −2, −2, −2, −3, −3 when the round ends.'` | `' fall to the floor and cost stars.'` |
| src/tutor.js:102 | `Look for a row that fits all '+I.n+'.` | `Try a row that fits all '+I.n+'.` |
| src/tutor.js:103 | `This tile fills your last gap in a wall row: when a wall row is complete the game ends after this round.` | `This completes a wall row, so the game ends after this round.` |
| src/tutor.js:104 | `' tiles of one colour, and you filled it. At round end one tile goes to your wall.'` | `' is full. At round end one tile goes to your wall.'` |
| src/tutor.js:106 | `'). It keeps its tiles for the next round; nothing is lost.'` | `'). It keeps them for next round.'` |
| src/tutor.js:108 | `You took from the middle first: the Sun token sits on your floor (−1), but you open the next round.` | `You took the Sun token (−1), so you start next round.` |
| src/tutor.js:110 | `'. The '+I.rest+' she leaves slide to the middle.'` | `'. The other '+I.rest+' slide to the middle.'` |
| src/tutor.js:111 | `' took the Sun token: it costs her a floor space, but she opens the next round.'` | `' took the Sun token. She starts next round.'` |
| src/tutor.js:112 | `' onto her floor: tiles that do not fit cost stars at round end.'` | `' on her floor. Those cost stars.'` |
| src/tutor.js:113 | `' tiles: leftovers always slide to the middle for anyone to claim.'` | `' tiles. Leftovers slide to the middle.'` |
| src/tutor.js:114 | `' you left slid to the middle: anyone may take them from there.'` | `' you left slid to the middle.'` |
| src/tutor.js:118 | `Every kiln and the middle are empty: the round is over. Each full row sends ONE tile to your wall; the other tiles of that row go to the shard box. Rows that are not full keep their tiles.` | `Round over. Each full row sends one tile to your wall.` |
| src/tutor.js:120 | `This tile touches no other tile, so it scores 1 star. Everyone starts small.` | `This tile touches none, so it scores 1 star.` |
| src/tutor.js:122 | `' stars. Touching lines count, so build in clusters.'` | `' stars. Build in clusters to score more.'` |
| src/tutor.js:124 | `'. Floor spaces cost −1, −1, −2, −2, −2, −3, −3.'` | `'.'` |
| src/tutor.js:127 | `A wall row is complete, so the game ends. Your bonuses: ` | `Game over. Your bonuses: ` |
| src/tutor.js:129 | `Most points wins; on a tie, the most full rows.` | `Most points wins. A tie goes to more full rows.` |
| src/tutor.js:144 | `You hold the Sun token, so you take the first turn this round.` | `You hold the Sun token, so you go first.` |
| src/tutor.js:180 | `Play one coached game: a guide explains each rule just as it matters.` | `Play one game with a guide who explains each rule.` |
| src/hlp.js:24 | `Pick a kiln and a colour. You take every tile of that colour. The rest slide to the middle.` | `Take every tile of one colour from a kiln.` |
| src/hlp.js:25 | `Taking from the middle first also takes the Sun token. It costs floor points, but you start next round.` | `The first to take from the middle gets the Sun token.` |
| src/hlp.js:26 | `When every kiln and the middle are empty, each full row sends one tile to your wall.` | `Full rows send one tile to your wall each round.` |
| src/hlp.js:27 | `A full wall row ends the game. Bonuses: row +2, column +7, all five of a colour +10.` | `A full wall row ends the game. Bonus stars follow.` |
| src/hlp.js:28 | `Row 3 holds three tiles of a single colour. You cannot mix colours in a row.` | `Row 3 holds three tiles, all one colour.` |
| src/hlp.js:29 | `A row is blocked if its wall row already has that colour. Blocked and full rows do not glow.` | `A row is blocked if the wall row already has that colour.` |
| src/hlp.js:30 | `Extra tiles fall to the floor: −1, −1, −2, −2, −2, −3, −3 points. You can also drop tiles there.` | `Extra tiles fall to the floor and cost points.` |
| src/hlp.js:31 | `A set tile scores 1 alone, or its row line plus its column line when it touches others.` | `A lone tile scores 1. Touching tiles add their row and column lines.` |
| src/hlp.js:32 | `On the grey wall choose any empty space in the row. No colour may repeat in a row or column.` | `Pick any empty space. No colour repeats in a row or column.` |
| src/hlp.js:33 | `A tile scores 1 alone, or the length of its row line plus its column line if it touches others.` | `A lone tile scores 1. Touching tiles add their row and column lines.` |
| src/hlp.js:34 | `Fill your wall with tiles. Touching tiles score more. Most points wins.` | `Fill your wall with tiles and score the most points.` |
| src/hlp.js:46 | `No better choice: every other move scores less this round.` | `Every other move scores less this round.` |
| src/hlp.js:47 | `, minus ${-pv.pen} breakage` | `, minus ${-pv.pen} for the floor` |
| src/ui8.js:100 | `Most ★ wins. The game ends after a round in which someone completes a mosaic row. Then: full row +2, full column +7, all 5 of a glaze +10.` | `Set glazed tiles on your mosaic and finish with the most ★.` |
| src/ui8.js:99 | `Only ${left} tile${left===1?'':'s'} left this round: every tile must be taken, and what fits no rack breaks.` | `Only ${left} tile${left===1?'':'s'} left. Tiles that fit no rack hit the floor.` |
| src/ui8.js:105 | `choose a glaze to take` | `pick a colour to take` |
| src/ui8.js:105 | `All tiles of the glaze you choose come with you.` | `You take every tile of the colour you pick.` |
| src/ui8.js:105 | ` The first courtyard take also gets the Sun token (−1, you start next round).` | ` The first take here also gets the Sun token (−1).` |
| src/ui8.js:120 | `Rack N holds N tiles of one glaze. Full racks score at round end; extra tiles break.` | `Rack N holds N tiles of one colour. Extras fall to the floor.` |
| src/ui8.js:121 | `Tap a glaze: you take <b>every</b> tile of it here. The rest of a kiln slides to the courtyard.` | `Tap a colour to take <b>every</b> tile of it here.` |
| src/ui8.js:153 | `The number is what it scores now.` | `The number is its score.` |
| src/ui8.js:153 | `Unmarked mosaic: no glaze twice in a row or column.` | `No colour twice in a row or column.` |
| src/ui.js:50 | `Watch the table: each glazier takes every tile of one glaze from one kiln or from the courtyard. When the kilns and courtyard are empty, full racks move one tile into the mosaic.` | `Watch: each player takes all tiles of one colour from one place.` |
| src/ui.js:54 | `On the unmarked mosaic you choose the space: a glaze may not repeat in any row or column.` | `You pick the space. No colour repeats in a row or column.` |
| src/ui.js:54 | `A rack of only prisms may go to any empty space in its row.` | `A rack of prisms can go to any empty space.` |
| src/ui.js:54 | ` Tap a glowing space, or pick below. The number is what it scores now.` | ` Tap a glowing space. The number shows its score.` |
| src/ui.js:81 | `That was your guided first game: next time the guide starts switched off. The Guide button brings it back at any time.` | `Next time the guide starts off. Tap Guide to turn it on.` |
| src/ui.js:143 | `The game ends after a round in which someone completes a mosaic row.` | `The game ends after a round with a full mosaic row.` |
| src/ui.js:143 | `Each tile you set scores 1 for every tile in the lines it joins.` | `Each tile you set scores for the tiles it touches.` |
| src/ui.js:143 | `Broken tiles cost points.` | `Tiles on the floor cost points.` |
| src/ui.js:152 | `Tap one of the tiles to take every tile of its glaze.` | `Tap a tile to take all tiles of that colour.` |
| src/ui.js:124 | `Draft glazed tiles and set them into the palace mosaic.` | `Pick glazed tiles and set them in the palace mosaic.` |
| src/ui9.js:440 | `Tile the king’s palace wall.<br><b>Most ★ wins.</b>` | `Tile the king’s palace wall and finish with the most ★.` |
| src/engine.js:26 | `The clay sack is empty: every tile in the shard box goes back into the sack.` | `The sack is empty, so the shard box tiles go back in.` |
| src/engine.js:29 | `The sack and the shard box have run dry: some kilns stay short this round.` | `No tiles left to load, so some kilns stay short.` |
| src/engine.js:31 | `No tiles are left anywhere to hand out: the atelier closes.` | `No tiles are left, so the game ends.` |
| src/engine.js:67 | `— The offer is empty: tiles move to the mosaics. —` | `— All tiles taken: full racks now fill the mosaics. —` |
| src/engine.js:87 | `A mosaic row is complete: the atelier closes after this round.` | `A mosaic row is full, so the game ends after this round.` |
| src/engine.js:84 | ` (only ${loss}: a score never drops below 0)` | ` (only ${loss}: scores stop at 0)` |
| src/engine.js:56 | `; takes the Sun token (−1 slot)` | `; takes the Sun token (−1)` |
| src/engine.js:76 | ` has no legal space on the unmarked mosaic: all ${L.length} tiles drop to breakage.` | ` has no legal space, so all ${L.length} tiles drop to the floor.` |
| src/net.js:143 | `Online play needs a recent browser with WebRTC (Chrome, Edge, Firefox or Safari).` | `Online play needs a recent Chrome, Edge, Firefox or Safari.` |
| src/net.js:145 | `Free and direct: your browsers connect to each other. Host a game, then send friends the code or the link.` | `Host a game, then send friends the code or link.` |
| src/body.html:46 | `Guided play: the panel explains every step` | `Guide: explains each step as you play` |
| src/body.html:53 | `Graphics quality (Auto picks by device; drops a level if frames stutter)` | `Graphics quality. Auto picks the best for your device.` |
| src/body.html:55 | `Measure each graphics level and recommend one` | `Find the best graphics level` |
| src/body.html:35 | `Tap a glowing tile to pick its glaze, then a glowing rack. Drag to tilt, scroll to zoom, double-click to reset.` | `Tap a glowing tile, then a glowing rack. Drag to tilt.` |
| src/rules-html.js:3 | `Tap a colour on a kiln (or in the middle): you take every tile of it.` | `Tap a colour to take every tile of it.` |
| src/rules-html.js:3 | `When every kiln and the middle are empty, each full rack sends one tile to your wall and scores.` | `When all tiles are taken, each full rack sends one tile to your wall.` |
| src/rules-html.js:4 | `Each round you draft glazed tiles, dry them on your racks and set them into your mosaic.` | `Each round, fill racks with tiles and set them in your mosaic.` |
| src/rules-html.js:4 | `Points come from tiles that touch other tiles, and from finished rows, columns and glazes at the end.` | `Touching tiles score more. Finished rows, columns and glazes give end bonuses.` |
| src/rules-html.js:8 | `A rack holds only one glaze. You cannot start a glaze on a rack if that mosaic row already has that glaze.` | `A rack holds one glaze. Its mosaic row must not already have it.` |
| src/rules-html.js:8 | `When your breakage line is full, further tiles go to the shard box with no extra penalty.` | `Tiles past the seventh breakage space go to the shard box free.` |
| src/rules-html.js:8 | `You must take something if you can: there is no passing.` | `You must take tiles; passing is not allowed.` |
| src/rules-html.js:9 | `drafting ends when every kiln and the courtyard are empty.` | `taking ends when every kiln and the courtyard are empty.` |
| src/rules-html.js:11 | `otherwise count the unbroken line of tiles it forms left-right (including itself), and the unbroken line up-down, and add both. A tile in both a row and a column line is counted twice.` | `otherwise add its row line and its column line.` |
| src/rules-html.js:14 | `The game ends after the setting phase of the round in which anyone completes a <b>horizontal row</b> of 5.` | `The game ends after the round when anyone completes a <b>row</b> of 5.` |
| src/rules-html.js:30 | `Round coaster loaded with 4 tiles each round. 2 players use 5, 3 players use 7, 4 players use 9 (twice the players plus one).` | `Holds 4 tiles. Use 5 kilns for 2 players, 7 for 3, 9 for 4.` |
| src/rules-html.js:29 | `Wild tile. Take all the prisms from one place, optionally with all of one other glaze there. Joins any rack with one glaze; a prism is what goes to the mosaic from a full rack. Counts for rows and columns, never for the full-glaze bonus.` | `A wild tile. It counts for rows and columns, not glaze bonuses.` |
| src/rules-html.js:32 | `Starts each round in the courtyard. The first player to take from the courtyard takes it onto their breakage line (it fills a penalty space) and starts the next round.` | `First to take from the courtyard gets it and starts next round.` |
| src/rules-html.js:33 | `Holds the tiles that are drawn to load the kilns. When empty, the shard box is poured back into it.` | `Holds tiles for loading kilns. When empty, refill it from the shard box.` |
| src/rules-html.js:34 | `Used tiles wait here: the spare tiles of set racks, breakage tiles, and tiles beyond the 7th breakage space.` | `Used tiles wait here until the clay sack runs out.` |
| src/rules-html.js:36 | `Alone: 1 point. Otherwise: length of its unbroken left-right line (if 2 or more) plus length of its unbroken up-down line (if 2 or more).` | `Alone: 1 point. Otherwise: row line plus column line.` |
| src/rules-html.js:37 | `Each round, lose the printed amount for every filled breakage space. A score never drops below 0.` | `Each round, lose points for each filled breakage space.` |
| src/rules-html.js:39 | `Grey mosaic: set each tile on any empty space of its row, never repeating a glaze in a row or column. A full rack with no legal space drops all its tiles to breakage.` | `Set each tile on any empty space in its row. No glaze repeats.` |

Lines fixed: 109
