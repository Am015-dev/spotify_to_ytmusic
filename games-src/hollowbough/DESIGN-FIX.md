# DESIGN-FIX: Hollowbough
Reviewed 8 Nov 2026 with the impeccable critique/audit and design-review checklists, on build-all --quick shots at 390x844 and 1440x900
(title, Learn first screen, Goal card, first turn, mid-game, result) in `hollowbough/design-shots/` (`390-*.webp`, `1440-*.webp`).
Bar: owner brief BRIEF-GAMEFEEL.md (no item below 7). Code was not edited. Selectors/files are under `games-src/hollowbough/game/` (`src/ui*.js`, `skin.css`).

## Scores (0-10)
| Row | Phone 390 | Wide 1440 |
|---|---|---|
| Visual hierarchy | 5 | 6 |
| Aim clear (Learn + Goal) | 8 | 8 |
| Readability (size, contrast, words) | 4 | 5 |
| Layout / wide screen | 5 | 6 |
| Motion, feedback, messages | 6 | 6 |
| Polish / one art style | 8 | 8 |
| **Overall** | **6.0** | **6.5** |

Result screen not reached; mid-game shots are early-game states (scn boards), so a worker must shoot a finished game.

## Fix list, highest impact first
1. **Phone board is a spreadsheet of tiny cards.** At 390 the 4x2 market grid, the row of 8 resource spots, the 2x4 region strip and the hand row stack with card
   text at ~8-10px (`Dewdrop Belfry`, `Haggle Magpie`; cost chips). Change: show 2 columns of market cards at >=110px wide in a horizontally
   scrolling row (snap), keep the region/resource strip to one row, and collapse the hand to the drawer already behind the `hb-handtoggle`. Card titles >=14px, art dominant (the painted card art is
   good, show more of it). File: `skin.css` (`.mk`, `.hand`, `.rgn` rules) and `src/ui*.js` market render.
2. **Status line collides with the top bar.** The orange "Your turn: tap a glowing spot / Pass." text is drawn behind the top bar buttons at y=0-45 (390 first turn), unreadable (<10px, low contrast on
   green). Remove it and use ONE instruction line in the footer above `Prepare | Pass` (<=8 words, 16px, dark ink on a parchment chip). Selector: the `#prompt`/bar status element in `body.html`.
3. **Title "Play" button is a tall empty green slab with the label top-left** (`.start` Play button, 390 and 1440). Center the label, 56px high, 20px bold white;
   add the one-line promise under it. The 8 mode chips (Guided/vs computer/Solo/Hot-seat/Watch/Story + Players + Computer) read as a form: show Guided as the default "Quick game"
   row and put the others behind a "More ways to play" disclosure (UI-BAR 7). Fix chip text to >=14px.
4. **First-turn bubble from Hazel is 30 words** ("The thaw is here and the Elderheart Oak needs a steward. Most points when we have both passed wins it. Start anywhere: the Twig Heap is a safe first pick.") and it
   sits over the player strips. Reduce to: "Most points wins." / "Tap the glowing spot to start." and keep it until tapped (BRIEF-GAMEFEEL 3). Text lives in the
   Hazel tutorial lines (search `Elderheart Oak` in `src/`).
5. **Goal card too thin.** "The goal: Build the best woodland city. When everyone has passed, the highest total of points wins." is good but has no scoring bullets. Add max 3 bullets
   with icons: "Cards in your city score points", "Spots give wood, berries and stone", "Seasons end the year". Make the icon strip 96px.
6. **Wide screen: the left resource ovals and the right "hand" parchment are different sizes and the right column is mostly empty brown wood** (hand slot shows 1 card in a 300px tall
   panel at 1440 mid-game). Shrink the hand panel to content height or place cards at 160px wide; enlarge the market cards to >=20% of board height.
7. **Player strips** ("You ★0 □0 ⚑2" / "Bramble") use unlabeled icon-number chips at ~10px. Replace with labeled counts at 14px ("Points 6") or hide all but points.
8. **Hint button is yellow-filled (`#hintsbtn.on`) while hints are meant to be off by default** (390 first screen shows it active). Default it off and un-filled.

Re-shoot after fixes, and ask the independent audit (`scripts/ui-audit.spec.js`) to confirm. Scores are from the shots; a worker's self-report does not count.
