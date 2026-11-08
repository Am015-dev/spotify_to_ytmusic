# DESIGN-FIX: Lantern Dive
Reviewed 8 Nov 2026 with the impeccable critique/audit and design-review checklists, on build-all --quick shots at 390x844 and 1440x900
(title, Learn first screen, Goal card, first turn, mid-game, result) in `lantern-dive/design-shots/` (`390-*.webp`, `1440-*.webp`).
Bar: owner brief BRIEF-GAMEFEEL.md (no item below 7). Code was not edited. Selectors/files are under `games-src/lantern-dive/game/` (`src/ui*.js`, `skin.css`).

## Scores (0-10)
| Row | Phone 390 | Wide 1440 |
|---|---|---|
| Visual hierarchy | 7 | 5 |
| Aim clear (Learn + Goal) | 7 | 7 |
| Readability (size, contrast, words) | 6 | 5 |
| Layout / wide screen | 7 | 3 |
| Motion, feedback, messages | 7 | 6 |
| Polish / one art style | 7 | 7 |
| **Overall** | **6.8** | **5.5** |

Result screen: only a watching-mode late shot (a trick in progress) was captured; no result card seen. A worker must shoot one.

## Fix list, highest impact first
1. **Wide layout is almost empty.** At 1440 first turn the "Coral over Kelp" job is one 110x45px chip floating in a 1400x600px empty blue field, divers pinned at the far
   left/right edges and the table is mostly void (`390-4` is fine; `1440-4/5` is not). Change: at `min-width:1024px` centre a 640px play area, make `.jcard` (`skin.css` line 47) at least 240x120 with font 22px,
   place the three diner seats on a ring around it (top / left / right, 200px from centre), hand cards 110px wide. Delete the full-width empty frame.
2. **Hand cards on phone are cropped by the bottom edge and numbers read upside-down.** The two rows of 5 overlap, the lower row is cut at y=844 and the mirrored number in the bottom corner (rotated 180deg) makes every card
   look like two numbers. Change: one row of 6 with horizontal scroll, snap, 64px wide, show the number once (top-left, 24px), no mirrored corner on phone.
3. **First-turn guidance is a tiny white 12px line at the top** ("Tap a job to take it.", `M.p` in `src/ui2.js` line 313) and the Pass button floats in the middle-bottom. Move the line to a visible 16px caption chip
   above the hand and have the hand glow as the target; Pass becomes a secondary button next to the hand, not centred over the table.
4. **Learn step 1 bubble ("Brack here. The bay nets are tangled. You, Dag and Sumi dive as one crew; each job is one diver's.") is 30 words** on a dark overlay with text ~12px, and the progress bar
   shows 21 dots. Rewrite: "Dive as a crew." / "Finish every job card." / "No talking: use the ping." and show "Step 1 of 6". Selector: tutorial bubble (`.tip`) text in `src/story*.js`.
5. **Goal card has no scoring/lose line.** "The whole crew wins or loses together. Finish every job card and the dive is won." Add: "You lose if the air runs out" (or the real fail rule) as bullet 2, and
   "Pings are your only talk" as bullet 3. Icons at 96px.
6. **Seat chips and stat pills are 10-11px** ("10 [] 0 * 0", `Bram`, `Nerea`, `Sumi`) and the labels are flush against the screen edge on wide. Use 14px, 16px inset (UI-BAR 2), replace the card/star icons with words ("Cards 10", "Stars 0").
7. **Mid-game shot (watch mode) shows a "Sumi plays Coral 7" banner over the table plus an empty dashed grid**; the dashed trick slots are low-contrast (<3:1). Brighten the active slot outline to #ffd24a and
   hide empty slots not in play, and keep the banner >=4s as the brief demands.
8. **Title: "Dive together. Say nothing. Trust the lantern." is 14px light-grey on the painted water.** Raise to 18px with a shadow; the four-button Quick game row (Story/Descent/Free play/Online) has equal weight, so
   make "Free play" the filled primary and the others secondary.

Re-shoot after fixes, and ask the independent audit (`scripts/ui-audit.spec.js`) to confirm. Scores are from the shots; a worker's self-report does not count.
