# UI audit of the LIVE site, 24 Nov 2026 03:38 UTC, phone 402x874 only (script games-src/scripts/ui-audit.spec.js)

Rules: A text >= 13 px; B contrast >= 4.5:1 / no busy background behind text; C no stretched image (>1.5x or aspect off >5%); D 3D labels; E dead button (a real tap changes nothing within 1.5 s: some are false positives, check each); F title/top-bar/instruction-line limits.

## cauldron-fair (11)
- B [panel Menu] "Graphics (now low)" busy background (edges 37%, lum spread 0.52) `div#setbody>div.mrow>div.lbl`
- B [campaign] "A Crowded Bag" busy background (edges 16%, lum spread 0.51) `div.gxc-path>button.gxc-node>span.gxc-lab`
- B [board] "9" contrast 2.36:1 (<4.5) `button.btn>span.bagwrap>span.bagn`
- B [board] "1" busy background (edges 38%, lum spread 0.40) `i.lc>svg>text`
- B [board] "3" busy background (edges 36%, lum spread 0.40) `i.lc>svg>text`
- E [panel Menu] dead button: Save `div.mrow>div.mbt>button.btn`
- E [panel Menu] dead button: Load `div.mrow>div.mbt>button.btn`
- E [panel Menu] dead button: Fast `div.mrow>div.mbt>button.btn`
- E [panel Menu] dead button: Normal `div.mrow>div.mbt>button.btn`
- F [start] title has 2 big primary buttons (want 1): New here? Lear, Playagainst th `div.ttl-in>div.tbtns>button.tbtn`
- F [board] instruction lines: 2 at once (board-first rule: 1): "Tap the bag to draw your first chip." <span> / "Tap the bag. The chip moves as many spac" <div.gx `board`

## crown-city-smash (5)
- B [panel Menu: rules, sound, speed, new game] "Reset tips" contrast 1.13:1 (<4.5) `div#gxhset>div.mrow>button.btn`
- B [panel Menu: rules, sound, speed, new game] "⏸ Pause the computer" busy background (edges 19%, lum spread 0.41) `div.menu>button#pausebtn.btn>span`
- B [panel Menu: rules, sound, speed, new game] "Show tips again" busy background (edges 14%, lum spread 0.28) `div#gxhset>div.mrow>span`
- D [start] label "Mesh" text ~1.4px tall on screen (min 13) `three:label`
- E [board] dead button: Next `div.gxh-bub>div.gxh-row2>button.gxh-ok`

## doorkick-dungeon (25)
- B [panel How to play] "If you hold more than 5 card" contrast 2.49:1 (<4.5) `div#dkRulesBody>ol>li`
- B [panel Menu: sound, speed, hints, graphics, speed test, new game] "Test speed" contrast 1.08:1 (<4.5) `div#dkMenuBody>div.menu>button.btn`
- B [campaign] "Act 3 · The Vault of the Gol" contrast 1.67:1 (<4.5) `div.gxc-path>div.gxc-act>b`
- B [campaign] "Act 2 · The Long Corridor" contrast 2.70:1 (<4.5) `div.gxc-path>div.gxc-act>b`
- B [campaign] "Learn to kick, fight and run" busy background (edges 16%, lum spread 0.51) `div.gxc-path>div.gxc-act>small`
- B [campaign] "Act 1 · The Cellar Doors" busy background (edges 14%, lum spread 0.52) `div.gxc-path>div.gxc-act>b`
- B [campaign] "The cleverest heroes in the " busy background (edges 10%, lum spread 0.46) `div.gxc-path>div.gxc-act>small`
- B [board] "Buzzsaw of Mayhem" contrast 3.17:1 (<4.5) `div.hand>button.card>span.cn`
- B [board] "+3" busy background (edges 31%, lum spread 0.70) `button.card>span.aw>span.tag`
- C [panel How to play] bg 2acc350f-94e1-46e6-aa57-c48f06 aspect off 66% (382x617 vs 1400x760) `div.gx-main>main#app.gx-board>div.tbl`
- C [panel How to play] img 241170a2-a74e-4e90-bc17-727831 aspect off 25% (170x323 vs 200x284) `span.bfdi>span.pbk>img`
- C [panel How to play] bg back-door.webp aspect off 25% (170x323 vs 300x426) `span.bfdi>span.pbk>i`
- C [panel How to play] bg 2449b743-a92e-4767-988d-bdf07e aspect off 57% (370x197 vs 1400x320) `main#app.gx-board>div.tbl>section.mine`
- C [panel Menu: sound, speed, hints, graphics, speed test, new game] bg 2acc350f-94e1-46e6-aa57-c48f06 aspect off 66% (382x617 vs 1400x760) `div.gx-main>main#app.gx-board>div.tbl`
- C [panel Menu: sound, speed, hints, graphics, speed test, new game] img 241170a2-a74e-4e90-bc17-727831 aspect off 25% (165x314 vs 200x284) `span.bfdi>span.pbk>img`
- C [panel Menu: sound, speed, hints, graphics, speed test, new game] bg back-door.webp aspect off 25% (165x314 vs 300x426) `span.bfdi>span.pbk>i`
- C [panel Menu: sound, speed, hints, graphics, speed test, new game] bg 2449b743-a92e-4767-988d-bdf07e aspect off 57% (370x197 vs 1400x320) `main#app.gx-board>div.tbl>section.mine`
- C [campaign] bg 2acc350f-94e1-46e6-aa57-c48f06 aspect off 66% (382x617 vs 1400x760) `div.gx-main>main#app.gx-board>div.tbl`
- C [campaign] img 241170a2-a74e-4e90-bc17-727831 aspect off 25% (170x322 vs 200x284) `span.bfdi>span.pbk>img`
- C [campaign] bg back-door.webp aspect off 25% (170x322 vs 300x426) `span.bfdi>span.pbk>i`
- C [campaign] bg 2449b743-a92e-4767-988d-bdf07e aspect off 57% (370x197 vs 1400x320) `main#app.gx-board>div.tbl>section.mine`
- C [board] bg 2acc350f-94e1-46e6-aa57-c48f06 aspect off 66% (382x617 vs 1400x760) `div.gx-main>main#app.gx-board>div.tbl`
- C [board] img 241170a2-a74e-4e90-bc17-727831 aspect off 25% (165x314 vs 200x284) `span.bfdi>span.pbk>img`
- C [board] bg back-door.webp aspect off 25% (165x314 vs 300x426) `span.bfdi>span.pbk>i`
- C [board] bg 2449b743-a92e-4767-988d-bdf07e aspect off 57% (370x197 vs 1400x320) `main#app.gx-board>div.tbl>section.mine`

## emberclimb (9)
- B [panel Menu] "Effects" contrast 3.01:1 (<4.5) `section#setd-sound.gx-sec>div.gx-row>div.gx-row-l`
- B [campaign] "Act 1 · The Mire Road" busy background (edges 14%, lum spread 0.52) `div.gxc-path>div.gxc-act>b`
- B [campaign] "Learn to read intents, block" busy background (edges 10%, lum spread 0.71) `div.gxc-path>div.gxc-act>small`
- B [board] "Your turn" contrast 1.10:1 (<4.5) `aside.gx-dock>div.gx-dock-head>span#dockt.gx-dt`
- B [board] "Tap a glowing card to pick i" contrast 1.10:1 (<4.5) `aside.gx-dock>div.gx-dock-body>div#dockmsg`
- C [panel rulesB] bg enemy-hex-acolyte.webp drawn 345x345 from 192x192 (1.79x) `div.enemies>div.en>div.art`
- C [panel Menu] bg enemy-hex-acolyte.webp drawn 345x345 from 192x192 (1.79x) `div.enemies>div.en>div.art`
- C [campaign] bg enemy-hex-acolyte.webp drawn 345x345 from 192x192 (1.79x) `div.enemies>div.en>div.art`
- C [board] bg enemy-hex-acolyte.webp drawn 345x345 from 192x192 (1.79x) `div.enemies>div.en>div.art`

## final-approach (1)
- B [panel How to play] "Both axis and both engine di" busy background (edges 31%, lum spread 0.66) `div.rules>ol>li`

## hollowbough (4)
- B [start] "Host" contrast 3.75:1 (<4.5) `div#netblock>div.nrow>button.btn`
- B [start] "Free and direct: your browse" busy background (edges 14%, lum spread 0.83) `details#onl.online>div#netblock>p.sm`
- E [start] dead button: Host `div#netblock>div.nrow>button.btn`
- E [start] dead button: Join `div#netblock>div.nrow>button.btn`

## kaiten-kitchen (3)
- B [start] "1" contrast 4.34:1 (<4.5) `ol.menuboard>li>b`
- B [start] "2" contrast 4.34:1 (<4.5) `ol.menuboard>li>b`
- B [start] "3" contrast 4.34:1 (<4.5) `ol.menuboard>li>b`

## lantern-dive (4)
- B [panel How to play] "Job cards are drawn until th" contrast 3.92:1 (<4.5) `div.rules>ol>li`
- B [board] "Nerea" busy background (edges 9%, lum spread 0.64) `button.seat>span.top>span.nm`
- B [board] "Bram" busy background (edges 9%, lum spread 0.65) `button.seat>span.top>span.nm`
- B [board] "Sumi" busy background (edges 9%, lum spread 0.65) `button.seat>span.top>span.nm`

## nebula-aces (3)
- D [start] near-black untextured mesh in "BoxGeometry|" `three:BoxGeometry|`
- D [board] near-black untextured mesh in "BoxGeometry|" `three:BoxGeometry|`
- D [board] near-black untextured mesh in "CircleGeometry|" `three:CircleGeometry|`

## perch-and-plume (5)
- B [board] "4" contrast 2.11:1 (<4.5) `div.bc>div.pic>span.vp`
- E [board] dead button: grub die `div#mid>div#feeder>button.die`
- E [board] dead button: rodent die `div#mid>div#feeder>button.die`
- E [board] dead button: berry die `div#mid>div#feeder>button.die`
- E [board] dead button: seed die `div#mid>div#feeder>button.die`

## rampart-and-vine (6)
- B [panel menubtn] "Your turn. Turn, then place " contrast 4.32:1 (<4.5) `div#main>main#board>div#srlive`
- B [panel menubtn] "tiles" contrast 4.48:1 (<4.5) `div#left>span.lt>small`
- B [panel menubtn] "0" busy background (edges 21%, lum spread 0.40) `div.seat>span.sl1>b`
- B [panel menubtn] "You" busy background (edges 19%, lum spread 0.47) `div.seat>span.sl1>span.nm`
- B [panel menubtn] "Cobalt" busy background (edges 18%, lum spread 0.46) `div.seat>span.sl1>span.nm`
- B [panel menubtn] "7" busy background (edges 16%, lum spread 0.42) `div.seat>span.sl2>span.fl`

## sands-of-qamar (14)
- B [panel Djinns (help)] "Drop 3 people from the bag o" contrast 1.90:1 (<4.5) `div.cgrid>div.card>p`
- B [panel Rules] "1. Bid for turn order" busy background (edges 35%, lum spread 0.55) `div#rulesbody.gx-drawer-body>div.rules>h3`
- B [panel Menu] "New game" busy background (edges 11%, lum spread 0.51) `section#menud.gx-drawer>div.gx-drawer-body>button.btn`
- B [campaign] "The strongest claimants play" contrast 3.89:1 (<4.5) `div.gxc-path>div.gxc-act>small`
- B [campaign] "The old Sultan is dead. Lear" busy background (edges 33%, lum spread 0.44) `div.gxc-path>div.gxc-act>small`
- B [campaign] "The Copper Scales" busy background (edges 20%, lum spread 0.25) `div.gxc-path>button.gxc-node>span.gxc-lab`
- B [campaign] "Djinn-Smoke" busy background (edges 17%, lum spread 0.30) `div.gxc-path>button.gxc-node>span.gxc-lab`
- B [board] "🐪" contrast 1.18:1 (<4.5) `div#cleg>span.lc>i`
- B [board] "free" contrast 3.10:1 (<4.5) `div.bidt>div.spot>span.sp-c`
- B [board] "9th" contrast 3.36:1 (<4.5) `div.bidt>div.spot>small.ord`
- B [board] "8th" contrast 3.68:1 (<4.5) `div.bidt>div.spot>small.ord`
- B [board] "2" busy background (edges 12%, lum spread 0.57) `div.ms>span.mg>b`
- B [board] "3" busy background (edges 12%, lum spread 0.56) `div.ms>span.mg>b`
- B [board] "1" busy background (edges 12%, lum spread 0.39) `div.ms>span.mg>b`

## shipwreck-isle (11)
- B [panel Rules] "Tips" busy background (edges 16%, lum spread 0.32) `div.hlp-rules-set>div.gxh-set>span`
- B [panel Rules] "Scenarios 4, 5 and 7 are not" busy background (edges 12%, lum spread 0.72) `div#rulesbody.gx-drawer-body>ul>li`
- B [panel More: sound, speed, graphics, new game] "Learn by doing, step by step" busy background (edges 14%, lum spread 0.72) `div#tutset.tutset>button.gx-ibtn>span`
- B [campaign] "Act 2 · The Hexed Isle" contrast 2.88:1 (<4.5) `div.gxc-path>div.gxc-act>b`
- B [campaign] "Act 3 · The Way Home" contrast 3.84:1 (<4.5) `div.gxc-path>div.gxc-act>b`
- B [campaign] "‹ Back" contrast 4.32:1 (<4.5) `div.gxc-screen>div.gxc-head>button.gxc-ib`
- B [campaign] "Tutorial" contrast 4.32:1 (<4.5) `div.gxc-screen>div.gxc-head>button.gxc-ib`
- B [campaign] "★ 0/30" contrast 4.32:1 (<4.5) `div.gxc-screen>div.gxc-head>button.gxc-ib`
- B [campaign] "Something on this island kee" busy background (edges 9%, lum spread 0.62) `div.gxc-path>div.gxc-act>small`
- E [panel More: sound, speed, graphics, new game] dead button: Sea sounds `header.gx-bar>div#moremenu.more>button#musbtn.gx-ibtn`
- E [panel More: sound, speed, graphics, new game] dead button: Reset tips `div#hlpset.hlpset>div.gxh-set>button`

## short-fuse (2)
- B [panel How to play] "Each player gets a stand of " contrast 2.30:1 (<4.5) `div#rulesbody.gx-drawer-body>ol>li`
- B [panel Menu] "Tutorial" contrast 3.18:1 (<4.5) `div.row>button.btn>b`

## stitchwise (8)
- B [panel Menu] "Short buzz on your turn and " busy background (edges 12%, lum spread 0.76) `div.gx-row>div.gx-row-l>small`
- B [board] "▶ 0" contrast 4.16:1 (<4.5) `div#track>div.tk>span.tkn`
- B [board] "0" contrast 4.35:1 (<4.5) `div#track>div.tk>span.tkn`
- B [board] "☝️" busy background (edges 24%, lum spread 0.79) `button.offer>span.hand>i`
- E [board] dead button: Long Stair: cost 10 butt `div#dockbody.gx-dock-body>div#offers.ring>button.offer`
- E [board] dead button: Kite Patch: cost 1 butto `div#dockbody.gx-dock-body>div#offers.ring>button.offer`
- E [board] dead button: Windmill Patch: cost 8 b `div#dockbody.gx-dock-body>div#offers.ring>button.offer`
- E [board] dead button: Hook Patch, not for sale `div#dockbody.gx-dock-body>div#offers.ring>div.offer`

## sunglaze (2)
- B [panel Menu] "Middle" contrast 1.12:1 (<4.5) `div.bf-table>div.bf-pool>span.bf-pl`
- B [panel How to play] "Floor tiles cost points. A f" busy background (edges 10%, lum spread 0.80) `div.turn5>ol>li`

## thornbound (7)
- B [panel How to play] "The guided first game walks " busy background (edges 12%, lum spread 0.61) `div.rules>div.quick>p`
- B [panel Menu] "Test speed" busy background (edges 16%, lum spread 0.34) `div#setbody>div.mrow>button.btn`
- E [panel Menu] dead button: Save now `div#setbody>div.mrow>button.btn`
- E [panel Menu] dead button: TutorialLearn by doing,  `div#setbody>div.mrow>button.btn`
- E [panel Menu] dead button: On `div.mrow>div.seg>button.on`
- E [panel Menu] dead button: Light `div.mrow>div.seg>button`
- E [panel Menu] dead button: Off `div.mrow>div.seg>button`

## tidewake (2)
- B [panel Menu] "Tutorial" contrast 1.29:1 (<4.5) `div.row>button.btn>b`
- B [panel Menu] "Learn by doing, step by step" contrast 4.44:1 (<4.5) `div.row>button.btn>span`

## twin-thrones (18)
- A [board] "Stake Fence" 12px (min 13) `div#pyr>div#c0.card>div.nm`
- A [board] "1" 12px (min 13) `div.ef>span.e1>b`
- A [board] "Open Stage" 12px (min 13) `div#pyr>div#c1.card>div.nm`
- A [board] "3 pts" 12px (min 13) `div.ef>span.e1>b`
- A [board] "Stone Depot" 12px (min 13) `div#pyr>div#c5.card>div.nm`
- A [board] "Scribe Room" 12px (min 13) `div#pyr>div#c6.card>div.nm`
- A [board] "Weights Hall" 12px (min 13) `div#pyr>div#c7.card>div.nm`
- A [board] "Clay Depot" 12px (min 13) `div#pyr>div#c8.card>div.nm`
- A [board] "Brick Cut" 12px (min 13) `div#pyr>div#c14.card>div.nm`
- A [board] "+1" 12px (min 13) `div.ef>span.e1>b`
- A [board] "Reed Press" 12px (min 13) `div#pyr>div#c16.card>div.nm`
- A [board] "Mud Basin" 12px (min 13) `div#pyr>div#c17.card>div.nm`
- A [board] "Free" 11px (min 13) `div#c17.card>div.pr>span.fr`
- A [board] "Lookout" 12px (min 13) `div#pyr>div#c18.card>div.nm`
- A [board] "Rock Face" 12px (min 13) `div#pyr>div#c19.card>div.nm`
- B [board] "Free" contrast 1.20:1 (<4.5) `div#c19.card>div.pr>span.fr`
- B [board] "Free" contrast 1.21:1 (<4.5) `div#c17.card>div.pr>span.fr`
- B [board] "Free" contrast 1.24:1 (<4.5) `div#c18.card>div.pr>span.fr`

## vale-of-banners (10)
- B [panel How to play] "(dark green): one free actio" contrast 2.81:1 (<4.5) `div.rules>ul>li`
- B [panel Menu] "Vibration" contrast 2.81:1 (<4.5) `section#setd-sound.gx-sec>div.gx-row>div.gx-row-l`
- B [board] "★" contrast 1.22:1 (<4.5) `div#goods>button#gd-6.gbtn>span.bestq`
- B [board] "★ leads" busy background (edges 14%, lum spread 0.69) `button.och>span.oh>span.lead`
- E [board] dead button: Roll of the Drovers in s `div.stall>div.sttiles>button#mt-1-1.tilebtn`
- E [board] dead button: Delver's Lamp in stall 2 `div.stall>div.sttiles>button#mt-2-0.tilebtn`
- E [board] dead button: Keep in stall 2 `div.stall>div.sttiles>button#mt-2-1.tilebtn`
- E [board] dead button: Carter's Rule in stall 3 `div.stall>div.sttiles>button#mt-3-0.tilebtn`
- E [board] dead button: Fair Green in stall 3 `div.stall>div.sttiles>button#mt-3-1.tilebtn`
- E [board] dead button: Barge in stall 4 `div.stall>div.sttiles>button#mt-4-0.tilebtn`

## vinegrave (2)
- B [campaign] "🔒" busy background (edges 34%, lum spread 0.78) `button.gxc-node>span.gxc-disc>i.gxc-lock`
- F [start] title has 2 big primary buttons (want 1): Learn to play, Play `div#start.ov>div.tbox>button.tbtn`

## wildmark (6)
- E [board] dead button: Salmon: River Runs card, `main#board.gx-board>div#cards>button.cc`
- E [board] dead button: Hawk: Lone Perches card, `main#board.gx-board>div#cards>button.cc`
- E [board] dead button: Fox: Curious Fox card, y `main#board.gx-board>div#cards>button.cc`
- E [board] dead button: You 10 `main#board.gx-board>div#seats>button.seat`
- E [board] dead button: Bram 10 `main#board.gx-board>div#seats>button.seat`
- E [board] dead button: Zoom out `main#board.gx-board>div#zoom>button#zoutB.zb`
