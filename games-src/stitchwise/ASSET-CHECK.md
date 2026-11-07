# Stitchwise: ASSET-CHECK

Every distinct card/tile/piece/character/boss/board/background/icon id that the rules, campaign.json and the code use, and whether it has a stem in `assets.json` and a Flow prompt (`games-src/next-wave/flow-2d/stitchwise/`).

**required 63 / prompted 63 / gaps 0**

- patches: 33 (rules) -> fabric-01..fabric-33
- characters in campaign.json: 11 (3 bosses: fernsby, marguerite, aurelia)
- boards: quilt-frame, track-frame; backgrounds: bg-title, bg-table, bg-map, result-win, result-lose
- stems the code asks for (artHas/artBg/artImg/artUrl): bg-map, bg-table, bg-title, bonus-tile, icon-bonus, icon-button, icon-hourglass, icon-leather, patch-leather, quilt-frame, token-me, torn-square, track-frame, ui-offer-card; not in assets.json: none
- assets.json has 63 slots (extras beyond the required list: none)

| id | what | in assets.json | Flow prompt | wave |
|---|---|---|---|---|
| fabric-01 | patch: Ribbon Scrap | yes | yes | 1 |
| fabric-02 | patch: Bias Binding | yes | yes | 1 |
| fabric-03 | patch: Corner Patch | yes | yes | 1 |
| fabric-04 | patch: Tile Square | yes | yes | 1 |
| fabric-05 | patch: Long Strip | yes | yes | 1 |
| fabric-06 | patch: Boot Patch | yes | yes | 1 |
| fabric-07 | patch: Tab Patch | yes | yes | 1 |
| fabric-08 | patch: Wave Patch | yes | yes | 1 |
| fabric-09 | patch: Ruler Strip | yes | yes | 1 |
| fabric-10 | patch: Hook Patch | yes | yes | 1 |
| fabric-11 | patch: Step Patch | yes | yes | 1 |
| fabric-12 | patch: Pocket Patch | yes | yes | 1 |
| fabric-13 | patch: Anchor Patch | yes | yes | 2 |
| fabric-14 | patch: Cup Patch | yes | yes | 2 |
| fabric-15 | patch: Elbow Patch | yes | yes | 2 |
| fabric-16 | patch: Stair Patch | yes | yes | 2 |
| fabric-17 | patch: Cross Patch | yes | yes | 2 |
| fabric-18 | patch: Banner Patch | yes | yes | 2 |
| fabric-19 | patch: Lightning Patch | yes | yes | 2 |
| fabric-20 | patch: Leaf Patch | yes | yes | 2 |
| fabric-21 | patch: Wide Block | yes | yes | 2 |
| fabric-22 | patch: Ladder Patch | yes | yes | 2 |
| fabric-23 | patch: Kite Patch | yes | yes | 2 |
| fabric-24 | patch: Bridge Patch | yes | yes | 2 |
| fabric-25 | patch: Hammer Patch | yes | yes | 2 |
| fabric-26 | patch: Zigzag Patch | yes | yes | 2 |
| fabric-27 | patch: Arch Patch | yes | yes | 2 |
| fabric-28 | patch: Pennant Patch | yes | yes | 2 |
| fabric-29 | patch: Windmill Patch | yes | yes | 2 |
| fabric-30 | patch: Long Stair | yes | yes | 2 |
| fabric-31 | patch: Snowflake Patch | yes | yes | 2 |
| fabric-32 | patch: Frame Patch | yes | yes | 2 |
| fabric-33 | patch: Flag Patch | yes | yes | 2 |
| portrait-wren | character: Aunt Wren | yes | yes | 1 |
| portrait-poppy | character: Dame Poppy | yes | yes | 1 |
| portrait-tilly | character: Tilly Thimble | yes | yes | 2 |
| portrait-fernsby | character: Granny Fernsby | yes | yes | 3 |
| portrait-odette | character: Odette Loom | yes | yes | 2 |
| portrait-bram | character: Bram Seam | yes | yes | 2 |
| portrait-marguerite | character: Marguerite Bodkin | yes | yes | 3 |
| portrait-ivo | character: Ivo Selvage | yes | yes | 2 |
| portrait-hester | character: Hester Pinwheel | yes | yes | 2 |
| portrait-tobias | character: Tobias Quillon | yes | yes | 2 |
| portrait-aurelia | character: Queen Aurelia | yes | yes | 3 |
| bg-title | title screen | yes | yes | 1 |
| bg-table | board background | yes | yes | 1 |
| quilt-frame | 9x9 quilt board | yes | yes | 1 |
| track-frame | time track board | yes | yes | 1 |
| token-me | your time token | yes | yes | 1 |
| token-opp | opponent time token | yes | yes | 1 |
| icon-button | button currency | yes | yes | 1 |
| icon-hourglass | time cost | yes | yes | 1 |
| patch-leather | leather patch (5 on the track) | yes | yes | 1 |
| bonus-tile | 7x7 bonus tile | yes | yes | 2 |
| torn-square | story twist: torn squares | yes | yes | 2 |
| bg-map | story map | yes | yes | 3 |
| result-win | win result | yes | yes | 3 |
| result-lose | loss result | yes | yes | 3 |
| fx-sparkle | income moment | yes | yes | 3 |
| fx-stitch | sewing flourish | yes | yes | 3 |
| icon-bonus | bonus icon | yes | yes | 3 |
| icon-leather | leather space | yes | yes | 3 |
| ui-offer-card | offer card | yes | yes | 3 |

Wired (a dropped file shows with no code change): every slot in assets.json except the result/title/story backgrounds that are drawn as CSS fills when no file exists: all fabric-NN (quilt cells, offers, patch list), portrait-* (Story map/intro/boss card), bg-title, bg-table, bg-map (Story map), quilt-frame, track-frame, token-me, token-opp, icon-button, icon-hourglass, icon-leather (track), icon-bonus (player pill), bonus-tile (result screen), patch-leather, torn-square, fx-sparkle (income moment), fx-stitch (sewing), ui-offer-card (offers), result-win, result-lose.
Temporary pictures (original, code-drawn, `temp-art/make-temp-art.py`) exist for 49 of the 63 slots; missing temp art: bg-map, result-win, result-lose and the 11 portraits (emoji badges show until the Flow files arrive).

Music cues: `games-src/next-wave/music/stitchwise/cues-wave1.json` lists a cue for each gx-music slot: tavern, main, fight, victory, defeat.
