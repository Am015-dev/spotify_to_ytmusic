# DESIGN-FIX: Kaiten Kitchen
Reviewed 8 Nov 2026 with the impeccable critique/audit and design-review checklists, on build-all --quick shots at 390x844 and 1440x900
(title, Learn first screen, Goal card, first turn, mid-game, result) in `kaiten/design-shots/` (`390-*.webp`, `1440-*.webp`).
Bar: owner brief BRIEF-GAMEFEEL.md (no item below 7). Code was not edited. Selectors/files are under `games-src/kaiten/game/` (`src/ui*.js`, `skin.css`).

## Scores (0-10)
| Row | Phone 390 | Wide 1440 |
|---|---|---|
| Visual hierarchy | 7 | 6 |
| Aim clear (Learn + Goal) | 6 | 6 |
| Readability (size, contrast, words) | 7 | 6 |
| Layout / wide screen | 7 | 4 |
| Motion, feedback, messages | 7 | 7 |
| Polish / one art style | 9 | 8 |
| **Overall** | **7.2** | **6.2** |

Best of the four on phone: the painted belt, reveal ("Reveal!") and scoring screens are strong. Result: reached on 1440 (scoring), 390 shows round scoring.

## Fix list, highest impact first
1. **The player lanes are empty wooden trays at the start and the board is mostly wood texture.** At 390 and 1440 the three rows say "Nothing served yet" / are blank
   cream bars; the screen is a big empty board with the hand at the very bottom. Change: render a faint ghost plate silhouette in each lane (`.lane` in `src/ui2.js` line ~107, the `span.none`)
   and make the lane height 25% smaller so the hand can grow. Add the dish count target per lane ("0 of 9").
2. **Hand cards are small on phone (~58px wide, label ~11px) and clipped by the belt strip at the bottom.** Two rows overlap ("Fish Slice" over "Sunset Nigiri") and the lower row touches the screen edge.
   Change: one row of 5 cards, horizontally scrollable with snap, each >=76px wide, name 14px (`.hand .card b`, `skin.css`); keep the belt strip decorative at 28px height and below the safe area.
3. **Wide layout: 40% of the 1440 screen is dark brown void** (below the narrow dock, and the right of the play area when the reveal is shown). Make the board `max-width:none`,
   dock full height, hand cards at 120px wide, and fill the reveal area with the three revealed dishes at 200px (they are ~70px at 1440).
4. **Goal / Learn step 1 does not state how you win.** The first screen is "Pick and pass: Everyone takes one dish at the same time. Then every hand passes to the next diner." (a 10-step tutorial, dots only).
   Add step 0: "Score the most points after 3 rounds." with bullets "Sets of dishes score", "Roll race: most rolls wins", "Dessert counts at the end" (text in `src/story.js`/tutorial data). Keep the pass-the-belt picture as step 1.
5. **Round-scoring screen at 390 shows 17 score badges and yellow outlines at once** (`390-6`): overlapping hex/outline groups on the lane images, "= 5", "+6", "1st +6", "x2" all at 10px. Show one total per diner
   (24px) by default and tap a diner to expand the breakdown; yellow outlines only on the tapped group.
6. **"Got it" bubble covers the scoring and the "Next round" button.** The tip must not overlay the primary action (it sits on top of the lane totals). Dock it above the footer, and keep it until tapped (already tap-to-dismiss, so just move it).
7. **Top bar top-left "Round 1/3 / Turn 1 of 9" is 11px**, and the 1440 header has the same info in tiny type next to the title. Set 14px and make the round the bar title.
8. **Title screen: "Kaiten Kitchen" tagline ("Grab a plate, pass the belt.") is 12px, 60% opacity** on a busy photo-like painting. 18px, solid cream, text-shadow. The red "New here? Learn in 5 minutes"
   and the Quick game buttons are good; keep as is.

Re-shoot after fixes, and ask the independent audit (`scripts/ui-audit.spec.js`) to confirm. Scores are from the shots; a worker's self-report does not count.
