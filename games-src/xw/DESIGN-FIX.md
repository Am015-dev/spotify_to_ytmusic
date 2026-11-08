# Nebula Aces: DESIGN-FIX (D3 design review, 8 Nov 2026)

Shots: `playable-shots/d3/` (m = 390x844, d = 1440x900): title, tutorial first turn, `?scn=nb-board`, `nb-help` (Goal card), `nb-tail`.
Not reached: played mid-game and result screen (my scripted taps on the title did not land; reviewed via `?scn=` states only). Build: `build-all.py --quick nebula-aces` BUILT; scenario step "none ran" in this sandbox (browser mismatch), so tests are unproven here.

## Scores (1-10)
| Row | Impeccable critique | Design review |
|---|---|---|
| Visual hierarchy | 5 | 5 |
| Consistency | 7 | 7 |
| Aesthetic fidelity | 6 | 6 |
| States / feedback | 6 | 6 |
| Responsive, no overlap | **4** | **4** |
| Accessibility | **5** | **5** |
| Words / clarity of aim | 8 | 8 |
| Board is the screen | **4** | **4** |
Overall: critique 5.6, review 5.6. Goal card ("Destroy every enemy ship...") is clear.

## Fix list, most impact first
1. **Ships are tiny and the board is empty blue grid** (`m-scn-nb-board`): the player ship is ~40px, enemy ~30px, 70% of the screen is plain grid. Scale the sprite layer so the starting ships are >= 72px at 390 wide (board.js ship draw; the token size constant), and zoom the camera to fit both squads on first view instead of the full map.
2. **Ship name label is clipped inside its token** ("Kael Varro" cut by the circle, `m-scn-nb-tutorial-play`): the `.tag.s0.sel` label (13px) is wider than the badge. Move the name to a pill below the ship, `white-space:nowrap`, and show only the first name ("Kael") on phone.
3. **Hint line "Tap your ship to plan its move" is unreadable** (`setHint`, board.js:144): grey text over the busy bottom bar with the pointing hand covering it. Give the hint element a solid dark pill (`background:rgba(10,12,30,.88); color:#fff; padding:8px 14px; border-radius:999px`) and lift it above the Auto/Fly bar; move the tutorial hand to point at the ship, not the text.
4. **Top bar icons have no labels** (ship, ?, target, bulb, gear): add 12px captions or fold into labelled Hints / Rules / Menu. The "R1 Plan [you]" chip is the only text; make it "Round 1: plan your move".
5. **Fly is a dead orange button until a plan exists with no reason shown** (`m-scn-nb-board`): show "Plan 1 ship first" inside the button (disabled label) instead of a faded "Fly".
6. **Title screen is a long settings page** (`m-01-title`): Mode, Play online, Factions, Opponent, waves all sit under the primary button. Collapse everything below "Launch" into one "Options" disclosure; keep Launch + Learn + Story only (UI-BAR rule 7). Play online (Host/Join) goes into Menu.
7. **Goal card art is two tiny arrows** (`m-scn-nb-help`): enlarge to a 2-ship picture 96px tall with a red hit flash so "destroy every enemy ship" is shown, not only told.
8. **HUD counters** "You 1 ship 5 hp vs Enemy 1 ship 3 hp" are 12px grey at the top; make them 14px and put the HP as pip bars.
