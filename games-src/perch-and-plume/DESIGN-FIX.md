# Perch & Plume: DESIGN-FIX (D3 design review, 8 Nov 2026)

Shots: `playable-shots/d3/` (m = 390x844, d = 1440x900): title, tutorial turn + Goal card, starting hand, first turn, mid, `?scn=pp-board`, `pp-play`, `pp-result`.
Not reached: a played-out mid-game by hand (drove it by `?scn=` states). Build: `build-all.py --quick perch-and-plume` BUILT; its scenario step reported "none ran" in this sandbox (browser mismatch), so test results are unproven here.

## Scores (1-10; every row must reach 7 before a visual deploy)
| Row | Impeccable critique | Design review |
|---|---|---|
| Visual hierarchy | 7 | 7 |
| Consistency | 7 | 7 |
| Aesthetic fidelity (art-led, calm) | 8 | 8 |
| States / feedback | 6 | 6 |
| Responsive, no overlap | **3** | **3** (starting-hand screen) |
| Accessibility (size, contrast, touch) | 6 | 6 |
| Words / clarity of aim | 8 | 8 |
| Result screen not a spreadsheet | **5** | **5** |
Overall: critique 6.0, review 6.0. Goal card and tutorial coach are the strong parts.

## Fix list, most impact first
1. **Starting-hand screen is broken at both sizes** (`m-04`, `d-04`): bird cards overflow, power text runs one word per line, cards overlap each other and the bonus cards. Cause: `cardHTML(id,'hand')` returns the wide `.bc.big` row card (head.html:348, `min-height:180px; overflow:visible`), but `.keepgrid .bc{width:104px;height:150px}` (head.html:186) squeezes it. Change: in `src/screens.js` `showKeep` draw(), call a compact card (`cardHTML(id,'slot')`-style `.bc.mini` with name, VP, cost only) for the five offered birds; keep the power text in the tap-to-zoom card. Or CSS: `.keepgrid .bc.big{width:min(100%,340px);height:auto}` with `.keepgrid{flex-direction:column;align-items:center}` at <=600px. Check at 390x844 and 1440x900.
2. **Result screen is a 7-column table** (`m-scn-pp-result`): `Player/Birds/Bonus/Goals/Eggs/Food/Tucked/Total`. Replace with two big score cards (winner first, huge total, one line "20 birds, 16 goals..." only for the top 2 categories); full breakdown behind a "Details" disclosure. Element: the table in the `#result` panel, built in `src/screens.js` (search "Tucked"). Also say who you are: winner headline "Fern wins the year." with "You: 58, Fern: 70" under it.
3. **Hand carousel card swallows the phone** (`m-06-mid`): the `.bc.big` "Bird 1 of 3" card in the turn panel is ~45% of the screen and pushes the board off. Cap it: `#hand .bc.big{max-height:150px}` and put power text on a second tap; board must stay visible while choosing a spot (glowing slots).
4. **Board rows are three thin strips with five empty dashed slots on phone** (`m-scn-pp-board`): slots are ~30px wide, so placed birds will be tiny. Make the slot width at 390px `calc((100vw - 90px)/5)` min 56px, row height >= 84px, and shrink the action panel to a bottom sheet (`.gx-sheet`) with one primary row.
5. **Unlabelled top-bar icons** (target, notes, rules, book, menu) on phone: add 12px caption text under each or merge to Hints / Rules / Menu (UI-BAR rule 4: at most 5, labelled).
6. **Turn panel repeats itself**: "Round 1 of 4 / 8 actions left" plus "Round ends when everyone has used all their actions." plus coach bubble plus "Choose one action". Keep the first line and the action cards; delete the grey explainer line under the pips (`.rinfo small`).
7. **Fonts under 12px on phone**: `.bc .pwt{font-size:10.5px}` (head.html:123) and `.bc .tk`. Raise to 12px min on phone (14px target per brief).
8. **Title** (`m-01-title`): three tiny bird cards are decorative and half the screen below the buttons is empty. Enlarge the card trio to 110px wide and move the buttons down to the thumb zone.
