# DESIGN-FIX: Final Approach
Reviewed 8 Nov 2026 with the impeccable critique/audit and design-review checklists, on build-all --quick shots at 390x844 and 1440x900
(title, Learn first screen, Goal card, first turn, mid-game, result) in `final-approach/design-shots/` (`390-*.webp`, `1440-*.webp`).
Bar: owner brief BRIEF-GAMEFEEL.md (no item below 7). Code was not edited. Selectors/files are under `games-src/final-approach/game/` (`src/ui*.js`, `skin.css`).

## Scores (impeccable critique / design-review, 0-10)
| Row | Phone 390 | Wide 1440 |
|---|---|---|
| Visual hierarchy (what to do first) | 7 | 5 |
| Aim clear (Learn + Goal) | 6 | 6 |
| Readability (size, contrast, words) | 5 | 6 |
| Layout / wide screen | 7 | 4 |
| Motion, feedback, messages | 7 | 7 |
| Polish / one art style | 8 | 7 |
| **Overall** | **6.7** | **5.8** |

Not reached by autoplay: the result screen (only the tutorial "Mission failed" card was seen). A worker must shoot a real finished game.

## Fix list, highest impact first
1. **Wide layout is the phone board stretched, with a dead right half.** At 1440 the cockpit window and dice rows sit in the left ~65%, `#dock` is a narrow
   strip at top-right and ~60% of the right column is empty dark teal. Change: in `skin.css` at `@media (min-width:1024px)` make the board
   `max-height:100vh` with the dice ledges (`.dice` rows) scaled to >=20% of board height, and give `#dock` a fixed 360px column that fills the
   full height (title line, big "Roll my dice", last 3 events at 16px). Remove the empty strip under the dock.
2. **Learn first step is a 40-word wall of text** ("Check ride, Captain. We win or crash together... Spare dice earn coffee. Tap Roll.") in the top-left speech
   bubble (`.tip`/story bubble, text in `src/story*.js` or `src/tut*.js`, step 1). Change to one aim sentence + 3 bullets max, each <=12 words:
   "Land the plane together." / "Fill both seats with dice." / "Keep the wings level." Move the "spare dice = coffee" line to step 3.
3. **Goal card is plain text on a dark dimmed board and says "clear all planes, lower gear and flaps, level the axis, slow down"** (4 jargon items, the
   `How to win` card, `hb-help`-style help cards in `src/ui*.js`). Change the body to: "Land together in round 4." then 3 bullets: "Match dice to the glowing
   gauges", "Keep tilt under 2", "Brake before the runway". Enlarge the icon strip (plane -> runway) to 96px and the card to 90% width on phone.
4. **Jargon prompt "Drop it on the glowing axis."** (`src/ui8.js` line 16, `Pick the die that levels...` / `Drop it on the glowing axis.`). Say "Drag the die onto the glowing scale."
   Same for "Pick a die for the axis." -> "Pick a die for the scale." Use one word for it everywhere (scale), including Learn.
5. **Tiny HUD text on phone.** The round chips (`R1/7 - 6000 ft`, the crew-flags row), the six status chips at the bottom of the phone dock
   (`#dock` stat row: flap/gear/brake counts) and the label "RAVI'S DICE" render ~9-11px. Set min `font-size:14px` for `#barstat`, the stat row and the dice captions;
   drop the altitude suffix from the chip and show it only in the cockpit window.
6. **Two competing callouts on the first screen.** The yellow hint bulb, a "Briefing" caption and the instruction line all say "tap roll". Keep only the dock
   line ("Roll your dice") and the glowing button; delete the extra caption under the dice ledge (`Round 1 of 4 - Briefing`).
7. **Title:** the tagline pill is boxed text on the painting and the Play button's sub-line ("Learn to fly, then four bosses") is 11px.
   Remove the pill background (text-shadow instead), raise the sub-line to 14px, and make "Quick game" a segmented row (Computer | Online) to match UI-BAR 7;
   the extra "New here? Learn in 5 minutes" strip below duplicates the modal that opens next, so show only one of them.
8. **Dice are small on wide.** Dice on the ledges at 1440 are ~34px. Set `.die{width:clamp(56px,6vw,84px)}` on min-width 1024 so they read as the pieces.

Re-shoot after fixes, and ask the independent audit (`scripts/ui-audit.spec.js`) to confirm. Scores are from the shots; a worker's self-report does not count.
