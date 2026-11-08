# Stitchwise: design fix list (D4, 8 Nov 2026)

Shots: `stitchwise/playable-shots/feel/d4/` (390x844 and 1440x900: title, Learn first screen, first turn, Rules/Goal, rival turn, mid-game, end state, result via `?scn=sw-result`).
Limits: the Quick game opened with the rival's turn, so "first turn" shows "Aurelia is thinking...". The impeccable launcher is missing from the repo, so I read the project docs directly.
Built with `build-all.py --quick stitchwise`. Build OK.

## Scores (0-10, my read of the shots)
| impeccable critique | | design-review | |
|---|---|---|---|
| Hierarchy | 6 | Visual hierarchy | 7 |
| Aim clarity | 6 | Consistency | 7 |
| Readability | 5 | Aesthetic fidelity | 8 |
| Motion / feedback | 6 | Responsive | 6 |
| Polish | 7 | Accessibility | 6 |
| Pop-up discipline | 4 | Typography | 5 |
| **Mean** | **5.7** | **Mean** | **6.5** |
Rows below 7 block a visual deploy (CLAUDE.md).

## Fixes, by impact
1. **Turn banner disappears in 1.1 seconds.** `banner()` in `stitchwise/src/ui2.js:82` sets `ms = amt(sub ? 2600 : 1100)`. "Your turn again" and "Aurelia plays again" are gone before they can be read, which breaks the brief (at least 4s plus 1s per 10 words, or until tapped). Change: `ms = Math.max(4000, 4000 + words*100)` and add tap-to-dismiss on `#turnban`. Keep only one banner at a time (cancel the old timer on a new call).
2. **The banner covers the player strip on desktop.** At 1440 "Your turn again" sits on top of the "You -157" row (`#turnban`, position over `.pstrip`). Anchor it above the board instead, or inside the dock header ("Turn: you..." line), never over a score row.
3. **Score starts at -157 and reads as an alarm.** Both strips (`.pstrip`) show "You -157 / 5 income +0 / 81 gaps" at 11px with jargon. Change to a big count of buttons ("5 buttons") plus "81 empty squares" at 14px, and show the minus points only on the result card. Rename "income" to "buttons per turn" and "gaps" to "empty squares".
4. **Rules open on "How a turn works"; the Goal is one screen down.** In the Rules dialog (`stitchwise/src/` rules html, class `.gx-x` dialog), put "The goal" first: "Finish with the most points." plus 3 bullets: "1 point per button." / "+7 for a full 7x7 square." / "-2 per empty square." The Learn first coach line (Aunt Wren, "Marden swears no newcomer wins...") is charming but does not state the aim; add the goal sentence as its first line. A small broken-image box shows left of "How a turn works" at 390: check the `<img>` in that dialog.
5. **Empty beige grid is the whole top half at 390.** Before a patch is picked, the board is a flat 9x9 of dashed cells (spreadsheet look). Add faint squares of last placed patch colours or a "your quilt" label, and enlarge the patch pictograms in `.offer` cards (about 28px now) to 48px so the shape you will place is the biggest thing in the dock.
6. **Time track is tiny.** At 390 the 3-row track cells are about 18px and the two tokens are 10px dots (teal you, red rival). Make tokens 22px with initials, and label the row "Time: who plays next". Keep the glowing next-stop cell (it works).
7. **Offer card text is 10-12px** ("cost", "time", "earn", "need 5 more"). Use 14px for the three numbers and put the words in an icon legend once above the offers. "Best +9" badge is good; keep it.
8. **What works:** result card ("You win!" with quilt thumbnails and the one-line sum), "Rotate / Flip / Sew it on / Cancel" bar, and the "Tap a glowing patch, or tap Advance" instruction. Keep them as is.
