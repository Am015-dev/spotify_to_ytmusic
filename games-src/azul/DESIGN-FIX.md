# Sunglaze: design fix list (D5, 8 Nov 2026)

Shots: `games-src/azul/playable-shots/design/` (390x844 and 1440x900: title, coached-game prompt, first turn, mid, 45-tap end; story card at 1440). Build: `build-all.py --quick sunglaze` staged (scenario gate "none ran" under file://, not a game fault).
Method: impeccable critique + audit and design-review run on those shots. Not reached by the autoplayer: Learn first screen (the coached game starts straight on the board), Goal card, result. Scores marked * are from code/earlier shots, not a new shot.

## Scores (0-10)
| Row | Score |
|---|--:|
| Visual hierarchy (board first) | 8 |
| Aim clear in one sentence | 6 |
| Readability (size, contrast) | 7 |
| Words (short, plain) | 8 |
| Motion / pacing * | 7 |
| Consistency / craft | 8 |
| Accessibility | 7 |
| Responsive (phone vs desktop) | 6 |
| **Overall** | **7.1** (rows 6 = below the 7 gate) |

## Fix list, highest impact first
1. **Title card has no win sentence.** Element: the `Sunglaze` title card subtitle "Draft glazed tiles and set them into the palace mosaic." (file `azul/game/src/ui.js`, title card markup, `.card p` under the h1). Change to: "Take tiles, fill rows, score the most stars." Keep one sentence, no bullets. This is the owner's "aim must be clear" row.
2. **"New here?" prompt covers the title and hides Begin.** Element: the `New here?` dialog opened by `Begin ▶` (ui.js, first-visit prompt). Change: make "Play the coached game" the only filled button and move "Just play" to a text link under it; the dialog is fine on phone but its backdrop dims the whole title, so the player sees a half-hidden form. Remove the 0.5 dark scrim to 0.25.
3. **Coach bubble sits over the kilns on the first turn.** Element: the `MOTHER OCHRE` coach card (`tutor.js`, bubble anchored above the rack, ~y 505-560 at 390x844). It covers the lower-left kiln and the bottom of the centre. Change: anchor it to the top strip (under the "Coached game" bar, y 50-110) on phone, and keep the finger hand on the target tile. Also lengthen dwell: it is a tap-to-dismiss card, keep it (good), but shorten its text to one sentence of 12 words.
4. **Desktop: header and side panel text are washed out.** Elements: top bar buttons `Players / Log / Rules / Menu` and the right log panel ("Olive is choosing...") at 1440x900 render at ~35% opacity behind the story modal blur, and the log body text under it is below 4.5:1. Change in `shell.css`: give `.dock`/log text `color:#f4ead2` on the solid navy, not the translucent panel; raise log font from ~13px to 14px.
5. **Story card is a wall at 1440.** Element: the "Sun King" modal (`ui.js` line ~144, `data-ui="story-ok"`). The 4 bullets are the scoring rules, good, but the first line is story text. Change: put the bold bullet "Most ★ wins" as the first line above the story paragraph, make the picture 40% shorter so "Enter the courtyard" is visible without scrolling on a 667-high phone.
6. **Rack rows have no numbers.** Element: the five pattern rows on the player board (`ui.js` rack render). Change: add a small 14px number (1-5) in the arrow cell at the end of each row so "Row 3 holds 3" is readable; the tutorial text already says it.
7. **Floor row is red-on-pink at 12px.** Element: the `-1 -1 -2 -2 -2 -3 -3` chips and the word "floor" (`skin.css`). Change: 14px, dark red `#7a1f1f` on `#fbe9e4`, and label "Broken tiles" instead of "floor".
8. **Score chips top bar on phone.** `You ★0` and `Olive ★0 +1` are 15px but the `+1` badge is 11px. Change the badge to 14px.
