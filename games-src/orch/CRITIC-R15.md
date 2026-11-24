# CRITIC R15: live shelf, independent scores

Scored from live contact sheets (https://am015-dev.github.io/spotify_to_ytmusic), phone 402x874 and pc 1366x768, 24 Nov 2026. Sheets: games-src/orch/r15/<game>-<phone|pc>-sheet.jpg. Six games with no scenario list (gloamwar, meadowfold, ochre-horizon, onyx-atelier, via-tessera, wickdeep) were captured with their ?scn= board/action/result ids (cells x0-x3).

Rows: R1 Readability, R2 Game-not-spreadsheet, R3 Layout, R4 Finish, R5 First-minute clarity. Scored as a paying $5 customer. PASS = every row >= 7 on both sizes.

**Result: PASS 0 / FAIL 29.** No game may get a visual deploy on these scores. The most common defects across the shelf: text at 7-9px on phone and pc, empty/blank panels opened in normal states, label-value strips under the board, and pc layouts that leave 25-50% of the screen empty.

## Scores (worst first)

| # | game | phone R1-R5 | pc R1-R5 | min | verdict |
|---|---|---|---|---|---|
| 1 | kaiten-kitchen | 5/3/4/3/4 | 5/3/4/3/4 | 3 | FAIL |
| 2 | sands-of-qamar | 3/5/5/4/4 | 3/5/4/4/4 | 3 | FAIL |
| 3 | nebula-aces | 5/6/5/3/5 | 4/5/4/3/5 | 3 | FAIL |
| 4 | thornbound | 4/6/6/3/5 | 4/6/5/4/5 | 3 | FAIL |
| 5 | cauldron-fair | 6/8/7/7/7 | 5/3/4/5/4 | 3 | FAIL |
| 6 | short-fuse | 7/7/6/4/6 | 6/7/5/3/6 | 3 | FAIL |
| 7 | shipwreck-isle | 6/5/6/4/6 | 5/5/5/4/5 | 4 | FAIL |
| 8 | vinegrave | 4/5/6/6/5 | 4/6/6/4/5 | 4 | FAIL |
| 9 | hollowbough | 6/5/6/5/6 | 4/5/5/5/5 | 4 | FAIL |
| 10 | lantern-dive | 6/5/5/6/5 | 5/5/4/6/5 | 4 | FAIL |
| 11 | wickdeep | 5/5/5/5/6 | 4/6/5/5/6 | 4 | FAIL |
| 12 | crown-city-smash | 4/6/4/6/6 | 4/7/6/5/6 | 4 | FAIL |
| 13 | ochre-horizon | 4/5/5/6/6 | 5/6/5/6/6 | 4 | FAIL |
| 14 | gloamwar | 5/8/5/4/6 | 5/8/5/4/6 | 4 | FAIL |
| 15 | rampart-and-vine | 6/8/7/4/6 | 5/7/5/4/6 | 4 | FAIL |
| 16 | doorkick-dungeon | 6/7/7/5/7 | 4/7/5/5/6 | 4 | FAIL |
| 17 | onyx-atelier | 4/7/6/7/6 | 4/7/6/6/6 | 4 | FAIL |
| 18 | stitchwise | 5/7/7/6/6 | 4/7/6/6/6 | 4 | FAIL |
| 19 | twin-thrones | 5/7/7/6/6 | 4/7/6/7/6 | 4 | FAIL |
| 20 | redline-rally | 6/7/7/7/6 | 4/8/6/7/6 | 4 | FAIL |
| 21 | tidewake | 5/5/6/5/6 | 5/6/6/5/6 | 5 | FAIL |
| 22 | vale-of-banners | 5/6/6/6/6 | 5/7/6/7/6 | 5 | FAIL |
| 23 | final-approach | 6/6/7/7/6 | 5/6/6/6/6 | 5 | FAIL |
| 24 | wildmark | 6/7/7/6/7 | 5/6/5/6/6 | 5 | FAIL |
| 25 | meadowfold | 6/7/7/6/7 | 5/6/5/6/7 | 5 | FAIL |
| 26 | sunglaze | 6/8/7/5/7 | 5/7/5/6/6 | 5 | FAIL |
| 27 | via-tessera | 5/7/6/6/6 | 5/8/6/7/6 | 5 | FAIL |
| 28 | emberclimb | 6/8/7/6/7 | 5/7/5/6/6 | 5 | FAIL |
| 29 | perch-and-plume | 6/6/7/7/7 | 5/6/6/7/7 | 5 | FAIL |

## Top 3 defects per game (cell id -> fix)

### 1. kaiten-kitchen (min 3)
1. kk-board/kk-uibar (both): the belt and the dishes are not on screen, only 'Nothing served yet' rows. Fix: render the conveyor belt with the current hand of dishes as the centre hero (kaiten/game/src/ui2.js seatEl ~l.108 draws the 'none' placeholder; the belt/hand renderer must run in phase 'pick' and fill the middle 50%).
2. menu (phone): blank parchment panel with only a header. Fix: menu drawer content not rendered in that state; populate the drawer before opening (same renderer as kk-art menu).
3. pc kk-board: grey empty 'dessert' placeholder boxes + right panel empty below 3 rows. Fix: hide empty dessert slot until a dessert exists; move the hand/belt into the right panel space or widen board to full width.
- Seen: kk-board/kk-uibar/kk-zoom: no belt and no dishes on screen - three rows saying "Nothing served yet" on blank cream plus a row of tiny "+3/+6/end" chips; the game's hero object is missing at both sizes; menu cell phone: full blank parchment panel with only a header; pc: grey empty "dessert" placeholder boxes and right panel empty below 3 rows

### 2. sands-of-qamar (min 3)
1. sq-art (both): literal placeholder text 'Name' painted over the tile grid. Fix: remove/fill the unbound label in the board art layer (find.sh 'Name' sands-of-qamar).
2. sq-board (phone): 30 identical tiles with ~7px labels. Fix: tiles min 13px labels, drop the text label when the tile art is distinct, enlarge the selected/legal tiles; allow pinch zoom.
3. bottom '1st 18 / 2nd 12 ...' table + 'YOU owns 0' chips. Fix: replace with a single icon strip (or move into a Scores drawer); pc: board bottom row is cut off, fit grid to viewport height.
- Seen: pc: bottom tile row cut off by viewport; right sidebar ~7px text + score table; sq-art: literal placeholder text "Name" painted over the tile grid; board = 6x5 grid of identical tiles with ~7px "Shrine/Hamlet/Oasis" labels and number badges, unreadable on phone; bottom "1st 18 / 2nd 12 / 3rd 8..." score table rows + "YOU owns 0 / TEAL owns 0" chips = spreadsheet; top player boxes "0 coins, 11 camels left, People 0 - Goods 0" ~8px

### 3. nebula-aces (min 3)
1. nb-tail / nb-tutorial-play: coach bubble renders EMPTY (only 'Got it'). Fix: xw/guide.js COACH (l.75) - bubble text not set for these steps; never show a bubble with empty text.
2. pc nb-art: 'Squads' panel is a blank blue slab; phone menu cell: blank framed rectangle. Fix: populate panel before showing, or do not open it.
3. board: ships ~20px in an empty starfield, pc playfield narrow column with ~35% dead each side. Fix: scale the arena to the viewport (fit height on phone, fit width on pc) and enlarge ship sprites 2x.
- Seen: nb-tail + nb-tutorial-play: coach bubble renders EMPTY (blank cream box, only "Got it"); pc nb-art: "Squads" panel is a blank blue slab; phone menu cell: blank framed rectangle over the field; pc menu cell = full-screen wall of ~8px rules prose; board: ships ~20px in a tall empty starfield, pc playfield is a narrow centre column with ~35% dead space each side

### 4. thornbound (min 3)
1. menu (phone): full-screen EMPTY parchment panel. Fix: thornbound/game/src/ui5.js renderMenu (l.113) is not filling the panel in this state; render before open.
2. tb-over: 'ends with 0 Influence', every row 0 on a win screen. Fix: end screen must show real totals (or hide the breakdown when the scenario has no score).
3. board labels + hand cards ~7px, pc left column 70% empty. Fix: labels >= 13px, hand cards 1.5x; on pc move rivals into a top strip and give the board the full height.
- Seen: menu cell phone: whole screen is an EMPTY parchment panel (no buttons); tb-over: "The Salt Crown ends with 0 Influence", all three rows show 0 - win screen with zeros; board location labels ("Bell Tower", "+1") ~7px and the hand cards "10 Heir Rally" ~7px; pc left column (You/Reedfolk/Guild) is three thin rows over ~70% empty dark, tb-zoom card text spills outside parchment frame

### 5. cauldron-fair (min 3)
1. pc cf-art/cf-board/cf-draw/cf-ui: the cauldron chip-track board is not drawn - empty fairground only (menu cell shows it). Fix: the pc layout must render the pot on first paint (check the pc branch of the board render in games-src/cauldron-fair/src; if it is a late load, render a static pot immediately).
2. phone pot spiral numbers ~8px and densely packed. Fix: show only the next 6-8 spaces large, fade the rest; numbers >= 13px.
3. cf-zoom score bars empty + story-scene blank dark bg. Fix: give bars a min fill / hide when 0; put the fair art behind the story bubble.
- Seen: pc cf-art/cf-board/cf-draw/cf-ui: the cauldron chip-track board is NOT drawn at all - empty fairground, only menu cell shows it (board missing or renders >450ms late); phone pot spiral numbers ~8px dense, cf-zoom score bars empty; story-scene blank dark bg; pc cf-zoom market stalls are empty brown shelves with tiny text

### 6. short-fuse (min 3)
1. pc sf-zoom: 'Job card' modal entirely blank. Fix: zoom modal content missing on pc; render the job card art/text.
2. sf-art (both): menu opens as an empty panel with only 'TIPS'/'LEARN' headings; pc blank blue slab over 40% of board. Fix: populate menu rows before showing.
3. rival racks: identical blank navy backs, pills 'You 0 Teal 0' ~8px. Fix: show known wires/clues on racks, pills >= 13px.
- Seen: pc sf-art: blank blue slab covers right 40% of board; pc sf-zoom: "Job card" modal is entirely blank (blue band + empty cream); sf-art: menu sheet opens as an EMPTY parchment panel with only "TIPS" and "LEARN" headings (no controls); sf-zoom: zoom card renders as a blank blue rectangle across the top 20%; rival racks are rows of identical blank navy wire backs with no hint of what is known; "You 0 Teal 0 Plum 0" pills ~8px

### 7. shipwreck-isle (min 4)
1. board = flat navy hexes with '?' only. Fix: unexplored tile art (sea/fog) instead of flat fill.
2. story narrator 'T' letter avatar. Fix: real portrait.
3. start is a settings form; pc right panel mostly empty. Fix: title art + 2 buttons, options under More.
- Seen: pc: right panel parchment column mostly empty, crew icons ~8px; hexes huge flat navy with "?" and faint numbers; board = flat navy hexes each with a "?" and no terrain art - looks like a wireframe; right-hand column of 3 empty dark slot boxes; story-scene narrator portrait is a letter "T" in a circle (placeholder avatar); start: settings form (Scenario/Players/Difficulty pills) instead of a title screen

### 8. vinegrave (min 4)
1. pc menu cell: board area is an EMPTY dark-green field. Fix: board must render behind the menu in that state.
2. resource row '2 coins 0 compasses 0 tablets...' label-value strip. Fix: icon + big number only.
3. phone card grid 6 rows deep, text ~7px. Fix: collapse market into a drawer, cards >= 13px text.
- Seen: pc menu cell: the whole board area is an EMPTY dark-green field (no ruins, no market) above the hand bar; resource row "2 coins 0 compasses 0 tablets 0 arrows 0 jewels" = label-value spreadsheet strip on both sizes; ruin/camp cards and market text ~7px on phone, card grid 6 rows deep with no focal point

### 9. hollowbough (min 4)
1. ui-log + ui-rivals: full-screen blank cream panels. Fix: render content (rivals' cities, log lines) or don't open.
2. main screen = labelled tile grid + '0 twigs 0 resin...' row reads as a form. Fix: resource icons with large numbers only, places as a painted board.
3. pc: 4 dense columns ~8px, 'My city' empty dark grid 25%. Fix: text >= 13px; hide empty city grid until first card.
- Seen: ui-log + ui-rivals: full-screen blank cream panel (log has 1 line, rivals panel empty) both sizes; main screen = 3x5 grid of labelled place tiles + "0 twigs 0 resin 0 pebbles 0 berries" label-value row: reads as a form; pc: 4 dense columns with ~8px text, "My city" panel is an empty dark grid taking ~25%

### 10. lantern-dive (min 4)
1. pc ld-art/ld-board/menu: player's hand is NOT shown. Fix: pc layout must render the hand row (it only appears in ld-zoom).
2. centre ~50% empty water with one card. Fix: put the trick area + jobs in the centre at 2x size.
3. opponent pods ~8px pinned to edges. Fix: >= 13px.
- Seen: ld-board/ld-art/menu: centre ~50% of screen is empty dark water with one "Predict (secret)" card; pc ld-art/ld-board/menu: player's HAND IS NOT SHOWN at all (only in ld-zoom) - nothing to tap; opponent pods ~8px text pinned to edges, "0 tricks" label-value; job card text ~9px

### 11. wickdeep (min 4)
1. x2 campaign map is a 2-column list of '13 ??' grey boxes. Fix: draw it as a path map like the other games' story maps.
2. x0 phone: hand cards are tall blank parchment slabs with ~9px text; board ~25% of screen. Fix: shorter cards with large numbers, board 50%+.
3. x3 Victory: 3 lines on an empty black screen. Fix: a result card with art; pc card strip text ~7px running off the right edge.
- Seen: x2 campaign map is a 2-column list of grey boxes labelled "13 ??" etc - a spreadsheet, not a map (both sizes; pc uses left 25%, rest empty); x0 phone: hand cards are tall blank parchment slabs with 2 lines of ~9px text, board only ~25% of screen; x3 Victory: 3 text lines on empty black screen; pc card strip text ~7px and runs off right edge

### 12. crown-city-smash (min 4)
1. phone: top ~35% empty orange sunburst while board text is ~6px. Fix: move the city board up and scale it to fill; text >= 13px.
2. pc: market row of five empty '0 cards' slots. Fix: show market cards or hide empty slots.
3. player list ~7px label-value. Fix: monster portraits with big VP/HP numbers.
- Seen: pc: market row = five empty "0 cards" slots, green dice tray mostly empty, player list top-left ~7px label-value; phone every board cell: top ~35% is empty orange sunburst while the city board + monster tiles are squeezed into a strip with ~6px text ("Squidrik rules the city", HP/VP digits); cc-uibar/cc-zoom player cards ~6px; start: title panel sits over a blurred grey background screenshot

### 13. ochre-horizon (min 4)
1. bottom bar = two rows of label-value boxes (credits/steel/... and Cards played/Tags/VP/Actions/Effects) - the spreadsheet look. Fix: collapse into one icon resource strip; move tags/effects into a drawer.
2. phone planet hexes ~12px, markers unreadable, names truncated under rating badge. Fix: planet fills width (zoom-to-fit), badge beside not on top of the name.
3. pc left column empty below 3 rows, gauge ticks ~7px. Fix: put the player panels above the planet or widen planet; ticks >= 11px.
- Seen: bottom bar = two rows of label-value boxes (credits/steel/... then Cards played/Tags/VP/Actions/Effects with 0s) - pure spreadsheet, ~9px labels; phone planet hexes ~12px, markers unreadable, player names truncated under rating badge ("Rating 20 - Cometi"); pc x0-x2 left column (rival/you panel) ~12% width, empty dark below 3 rows; temp/oxygen gauge ticks ~7px

### 14. gloamwar (min 4)
1. start + result screens: bare cream page with default buttons, 'Victory' = one line. Fix: add the painted title art and a real result card (winner, turns, regions).
2. map region names collide with unit tokens and are cut at edges. Fix: label collision avoidance or hide names under tokens; clamp map pan so edges are not clipped.
3. pc: map runs under the turn banner and bottom bar; faction stats ~9px. Fix: inset map by HUD heights; stats >= 13px.
- Seen: start + x3(result): bare cream page with default-HTML buttons, no art, Victory = 1 line of text (both sizes); map region names collide with unit tokens and are cut at edges (ph "ettlecross", "I Tower"); pc x0/x2: map runs under turn banner and bottom bar, a region name is half-hidden behind "Turn 1 - Action phase" pill; side-panel faction stats ~9px label-value text

### 15. rampart-and-vine (min 4)
1. start/ui-start: 6-7 EMPTY blank option pills. Fix: label them or remove.
2. rv-art: empty bubble with only an 'x'. Fix: never open an empty bubble.
3. pc: tiles ~5% of the table. Fix: zoom-to-fit placed tiles.
- Seen: pc: 3 placed tiles occupy ~5% of a 1366 table - board far too small, no zoom-to-fit; start + ui-start: option grid shows 6-7 EMPTY blank pill buttons next to "1 rival"/"Easy" (labels missing); rv-art: an empty bubble panel with only an "x" floats top-right; top score chips "0 / 7" ~8px; placed tiles small in a large empty table

### 16. doorkick-dungeon (min 4)
1. dk-diary: placeholder 'Test line 0-3: Pip defeats the Plutonium Dragon' (games-src/munch/scn.js l.88 seeds it) and on pc the diary panel is EMPTY. Fix: scenario must seed real log lines; pc log panel must render G.log.
2. dk-win-*: Level/Kills/Helps/Deaths/Cursed table of 0s. Fix: replace with a winner card + 2-3 highlight stats, hide all-zero columns.
3. phone hand: most cards render as blank brown/gold slabs; pc table mostly empty with ~7px strip text. Fix: show card faces in the fan; pc scale door/decks/hand up 1.5x.
- Seen: dk-diary phone shows placeholder text "Test line 3: Pip defeats the Plutonium Dragon..." x4, and on pc the diary panel is completely EMPTY parchment; dk-win-*: end screen is a Level/Kills/Helps/Deaths/Cursed table full of 0s (spreadsheet + zeros); phone hand: 4-6 cards render as blank brown/gold slabs with no face, only the rightmost card has art; pc: door + decks small in a wide empty wooden table, player strip text ~7px

### 17. onyx-atelier (min 4)
1. jewel cards: cost pips + points ~7-8px at both sizes. Fix: cards larger, pips >= 14px.
2. x3 win dialog 'You 0 pts - Rival 0 pts'. Fix: show real totals.
3. player strips '0/20 pts 0/10 0/10' label-value. Fix: icon progress rings.
- Seen: jewel cards: cost pips + point numbers ~7-8px, unreadable on both sizes; top/bottom player strips "0/20 pts 0/10 0/10" tiny label-value row; x3 win dialog says "You 0 pts - Rival 0 pts" (zero result on a win screen) and covers only a sliver; pc x0/x1 bottom-left under gem grid ~20% empty

### 18. stitchwise (min 4)
1. patch offers ~8px stats in a cramped tray. Fix: 3 larger patch cards, numbers >= 13px.
2. time track ~10px tall. Fix: double height, markers with portraits.
3. sw-result 'You win! -132 vs -150'. Fix: present as positive score or explain penalty prominently.
- Seen: pc: player rows + time track + rival quilt crammed in a narrow middle column with ~7px text; patch offer cards: "10 buttons / 5 time / +1 income / need 3 more" ~8px, three tiny patches in a cramped bottom tray; time track strip of ~40 cells ~10px tall, markers unreadable; sw-result: "You win! You -132 - -150 Marden" with a Buttons/7x7 bonus/Empty table - a win at -132 reads broken

### 19. twin-thrones (min 4)
1. card names/costs ~7px. Fix: >= 12px.
2. pc 'Your city' empty strip. Fix: show built cards or hide.
3. phone empty circle rows look unfinished. Fix: show placeholders as faint icons.
- Seen: card names/costs on pyramid ~7px ("Stake Fence 3 pts"); pc: pyramid sits in centre with card text ~7px and the "Your city: built cards land here" bar is an empty strip; phone menu cell: rival military row of 5 empty circles + face-down gaps look unfinished; science-bonus row icons ~10px

### 20. redline-rally (min 4)
1. pc: control strip squeezed into a 60px band, card labels ~7px. Fix: 140px+ control dock, labels >= 13px.
2. phone: 8 hand cards with ~8px labels. Fix: 2 rows of 4 or larger cards.
3. footer 'Engine heat/Dead heat' ~8px. Fix: >= 13px.
- Seen: pc: whole control strip (gear 1-4, hand of speed cards, Go) squeezed into a 60px bottom band, card labels "move 2/random" ~7px, standings list right edge ~7px; phone: hand cards 8 across with "Speed/Stress/move 1" ~8px labels; "Engine heat / Dead heat in hand" footer ~8px

### 21. tidewake (min 5)
1. below the board: risk line + Goal pill + numbered text log = the spreadsheet HUD (~45% of phone height). Fix: show only 'your turn' + tile choices; log into a drawer; risk as an icon on the tile.
2. menu cell: empty cream box (phone), empty teal column + unlabelled buttons (pc). Fix: populate or hide.
3. board tile art and coordinates ~8px. Fix: board fills width, coords >= 11px.
- Seen: below the board: "Safest: 15% risk, keeps 4 moves open" line + "Goal Cobalt You" pill + numbered "Since your last move" text log = the spreadsheet HUD the owner named, takes ~45% of phone height; menu cell: an empty cream box pops under the player chips (phone) and the pc right panel is 2 chips over an empty teal column with three unlabelled header buttons; board tile art and coordinates ~8px

### 22. vale-of-banners (min 5)
1. vb-result label-value table as the win screen. Fix: winner card + score bars.
2. phone 'Your move' panel 3 lines ~9px. Fix: one short line, >= 13px.
3. tile names ~7px, pc right panel half empty. Fix: >= 12px; tighten panel.
- Seen: vb-result: "silver left / goods left / workers / Total" label-value table ~8px as the win screen; phone bottom "Your move" panel = 3 lines of ~9px rules text + empty dashed goods slots; estate/market tile names ("Barge/Lore/Mint") ~7px; pc right panel half empty white

### 23. final-approach (min 5)
1. pc menu cell: black empty slab on the right 30%. Fix: overlay must cover full width.
2. phone menu cell opens a long scenario list instead of the menu. Fix: open the menu.
3. board of identical labelled buttons ~9px. Fix: instrument art per slot, labels >= 12px.
- Seen: menu cell (pc): title overlay covers left 70% only, a black empty slab on the right 30%; phone menu cell opens a long "How to play" scenario list instead of a menu; board is a grid of identical rounded buttons labelled "Gear 1-2/Brake/Flap" ~9px - reads like a control form; pc right panel text ~9px

### 24. wildmark (min 5)
1. wm-result: table of 0 0 0 rows. Fix: hide zero rows, show winner card.
2. pc: valley ~15% of screen, big dead green. Fix: scale valley to fill centre.
3. 'Largest area' + tally ~7px. Fix: >= 12px.
- Seen: wm-result: under the win card a Source/You/Bram/Sorrel table with rows of 0 0 0 (Bear/Elk/Salmon/Hawk/Fox) - spreadsheet of zeros; pc: valley ~15% of screen in the centre, left column "Bram's valley / Season log 1 line" mostly empty, big dead green between valley and market; "Largest area" icon row + animal tally ~7px

### 25. meadowfold (min 5)
1. pc: board ~25% of width with huge empty margins. Fix: scale board to viewport height and move cards beside it.
2. hexes are blank cream tiles. Fix: paper/terrain texture on empty hexes.
3. phone card numbers ~9px, 'Lessons' clipped at right edge. Fix: >= 13px; fit top bar.
- Seen: pc: board uses ~25% of width, centre-right; huge empty green margins left+right; animal cards stacked tiny top-left with ~9px numbers; hexes are blank cream tiles (no terrain texture) so board reads as a form; phone animal card numbers ~9px, "Lessons" button clipped at right edge

### 26. sunglaze (min 5)
1. sg-art phone: player wall panel is a blank cream rectangle. Fix: render the wall in that state.
2. pc menu/sg-buttons: player's own wall not shown, right 45% empty. Fix: always show own wall on pc.
3. floor strip ~8px. Fix: >= 13px.
- Seen: sg-art phone: player wall panel renders as a blank cream rectangle (whole lower 40% empty); pc menu + sg-buttons: player's own wall/rack is not shown at all, right 45% of table is empty art; floor penalty strip "-1 -1 -2..." ~8px

### 27. via-tessera (min 5)
1. start: dialog floats on a blank brown void with stray icons. Fix: map art behind the title dialog, hide game HUD on start.
2. city names ~7px. Fix: >= 12px or show on tap only.
3. phone hand row cut off at bottom, map icons clipped at edges. Fix: reserve hand height, clamp map pan.
- Seen: start: title dialog floats on blank dark-brown void with stray icon buttons top-right and two orphan grey circles (no map behind); city names on map ~7px, unreadable at both sizes; phone x0-x2 hand-card row is cut off at bottom and map icons clipped at left/right edges; top-left player strips "0/15 2 6 7" ~8px

### 28. emberclimb (min 5)
1. menu cell: fighter portraits are empty brown circles. Fix: wire portrait art for Garrick/Hex Acolyte in that state.
2. pc: right sidebar ~25% width mostly empty; card/HUD text ~9px. Fix: shrink sidebar to content or move relics/deck under the board; text >= 13px.
3. story-scene blank grey bg; phone ec-event/ec-map lower 35% empty. Fix: scene art behind bubble; centre/scale content vertically.
- Seen: menu cell: fighter portraits are empty brown circles (Garrick/Hex Acolyte no art); story-scene: blank grey bg behind dialog both sizes; pc: right sidebar ~25% width mostly empty dark column, fight board squeezed left, card/HUD text ~9px; phone ec-event/ec-map bottom 35% empty

### 29. perch-and-plume (min 5)
1. pc left column of list rows ~7px. Fix: >= 13px, collapse into tabs.
2. pp-result table ~8px on empty field. Fix: winner card + bars.
3. phone lower 45% button form. Fix: compact action bar.
- Seen: pc left column = stacked list rows "Forest nothing yet / Round goals ..." ~7px text (spreadsheet sidebar); pp-result: Player/Birds/Bonus/Goals/Eggs/... table ~8px floating on an empty painted field (both sizes); phone lower 45% is a button form (Play a bird / Get food / Lay eggs / Draw birds) with ~9px sublabels

## Notes for the orchestrator
- Cells with a blank panel (kaiten menu, thornbound menu, hollowbough ui-log/ui-rivals, short-fuse sf-art/sf-zoom, nebula nb-tail, sunglaze sg-art, vinegrave pc menu, doorkick pc dk-diary) were captured 450 ms after load; if a fix-worker finds the panel fills later, the defect is still real: a player sees the empty frame first.
- crown-city-smash pc crashed once in the batch run and was re-captured alone; result is the second run.
- Shared fix with the biggest payoff: a shell-wide minimum font size of 13px for HUD/card text and a rule that empty panels never open. Both are in the shell, so one build-all.
