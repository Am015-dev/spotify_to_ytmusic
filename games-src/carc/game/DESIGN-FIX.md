# Rampart & Vine: DESIGN-FIX (D3 design review, 8 Nov 2026)

Source dir: `games-src/carc/game/src` (built by `build-all.py --quick rampart-and-vine`, BUILT). Shots: `playable-shots/d3/` (m = 390x844, d = 1440x900): title, `?scn=rv-board`, `rv-help` (how a turn works), `rv-zoom` (place a follower).
Not reached: Goal card as its own screen, a played mid-game and the result screen (reviewed `?scn=` states only). Scenario step "none ran" in this sandbox, so tests are unproven here.

## Scores (1-10)
| Row | Impeccable critique | Design review |
|---|---|---|
| Visual hierarchy | 7 | 7 |
| Consistency | 7 | 7 |
| Aesthetic fidelity (tavern table) | 7 | 7 |
| States / feedback | 7 | 7 |
| Responsive, no overlap | 6 | 6 |
| Accessibility | **6** | **6** |
| Words / clarity of aim | 7 | 7 |
| Board is the screen | **5** | **5** |
Overall: critique 6.6, review 6.6. Strongest of the four for words ("Turn, then place: tap a glow.").

## Fix list, most impact first
1. **First view of the board is 80% empty wood** (`m-scn-rv-board`): two tiles sit mid-screen at ~120px, with a mug and candle as big props. Scale the map so the placed tiles fill >= 60% of the width at start (initial zoom in `geo.js`/`paint.js` camera fit) and shrink the prop art or fade it under the tiles.
2. **Legal-spot glow is faint** (`m-scn-rv-board`): the yellow tile-sized glows are low contrast on the pale tiles. Raise the outline to 3px solid #ffd76a with a 0.25 alpha fill and a slow 1.4s pulse (the glow class painted in `paint.js`); keep it until placed.
3. **Score HUD is cramped**: `You 0 [7 meeples] / blue 0 [7] / [tile] 70 left / Hints / menu` share one 44px row; `<small>` "70 left" is 13px cream on bark. Split into two rows or drop the tile count into the tray ("70 tiles left") and make the score numbers 18px.
4. **Menu button (`#menubtn`) is a bare three-dot square, Hints is greyed** (title screen): label it "Menu" and give Hints a clear on/off state.
5. **Tile tray is small** (`m-scn-rv-board`, bottom): the tile you hold is ~90px with the name in a 14px box. Make the held tile 120px, tap it to rotate with a visible rotate arrow badge.
6. **How-to-play lists 5 numbered steps plus a title** (`m-scn-rv-help`): first line should be the aim ("Score the most points by finishing roads and towns."); put it above the steps in 18px, steps stay at 15px.
7. **Follower choice** (`m-scn-rv-zoom`): good. Add a one-line "A follower scores the road while it's unfinished" to the first-time prompt only.
8. **Title card** (`m-01 title`): the modal floats over a plain table with a 2-line picker block below; make "Play vs computer" the only filled button, move rivals/level/map chips into a "Quick game options" disclosure (same as Redline Rally).
