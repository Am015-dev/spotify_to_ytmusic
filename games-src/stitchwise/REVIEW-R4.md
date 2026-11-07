# Stitchwise: independent review R4 (7 Nov 2026)

Build: `origin/shelf/W351-stitchwise` @ f387a961, built locally with `python3 build.py`, temporary art copied next to `media/`.
Played with real input: phone 390x763 (touch, CDP touch events) and PC 1440x860 (mouse). Covered: first launch, full tutorial
(13 steps), two full Quick games vs Normal computer to the result screen (phone and PC), Hard computer start + hint, two-player start,
Story chapters 1 and 2 (won both on phone, lost/tied chapter 1 twice), every menu item (Rules, Tutorial, Restart, Title, Sound,
Speed, Help, Accessibility, About), Patches drawer, Rules drawer, opponent quilt sheet, patch detail sheet, "Look at the quilts".
Console: no page errors in any run (one 404 on first phone load only).

## Scores (1-10, strict: below 7 = I would not show it to a paying player yet)

| Row | Score | Why |
|---|---|---|
| First minute | 6 | Clean title, tutorial offered at once. But the title is a flat cream card on a blue gradient (no cover art, no frame, plain type), and the "New here?" toast stays on top of tutorial step 1, covering the player bar. |
| Rules clarity | 7 | The tutorial walks the whole loop (buy, place, time, opponent, advance, income, leather, bonus, end) and finishes cleanly. How to play reads well; second tap on a patch explains cost/time/income in plain words. The time track is the weak point: two rows of tiny cells on phone, a 9x6 grid on PC with no visible path direction. |
| Fun moment | 6 | Picking a patch, dragging the ghost and watching it snap is satisfying, and the finger offset on touch is right. But the game ends flat: totals like -2 v 9 or 2 v 12, no final quilt reveal, no build-up to the last spaces. |
| Feedback / juice | 5 | Coins fly from button spots and the count bumps (good). Everything else is quiet: Quick-game result is a bare table on an empty background, Story result stars stack vertically, no win celebration, no sound/visual on the 7x7 bonus that I saw, music slots are silent. |
| Computer opponent | 7 | Plays tidy quilts and times its advances sensibly; Hard looks ahead. Story chapter 1 beat a hint-quality player who accepted the default ghost spot 2 games out of 3 (one 9-9 tie counted as a loss), while chapter 2 lost 21-6 to good placement. Difficulty curve is uneven for chapter 1. |
| Phone | 6 | Fully playable by touch, board-first layout fits 390x763. Problems: Story "Goal:" toast sits on the player chips for many turns, opponent names truncate ("Ma...", "Til..."), menu tab chips overlap each other, map header wraps mid-word, the track cells are ~10 px. |
| PC | 6 | Works with mouse and keys; quilt is big and readable. But the right dock is ~70% empty while the opponent's quilt (vital information) is hidden behind a chip tap; the dock's collapse button renders as a blank white square. |
| Structure parity with old shelf | 7 | All the pieces are there: title, Story map with acts/bosses/stars, tutorial, How to play, hint bulb, Rules and Patches drawers, full shelf Menu. Visually it is well below the old shelf games (painted backdrop, framed parchment title, display font on Sunglaze/Tidewake). |
| **Average** | **6.25** | Not ready for a paying player. Rules engine and controls are solid; presentation and the end-of-game moment are not. |

## Bugs (with steps)

1. **Repo hard-rule breach (blocking for merge).** `games-src/stitchwise/rules-notes.md` names the original game in two GitHub
   repository paths (section "Data check against public sources"). Project hard rule: never write the original game's name in the repo.
   Steps: `grep -il` the source folder for the original title. Fix: describe the sources without the repository slugs.
2. **"New here?" toast covers the tutorial.** Fresh profile, phone: open the page, tap Tutorial within ~3 s. The toast stays over
   step 1 ("Your quilt") and hides the player bar. Should be dismissed when the tutorial starts.
3. **Story "Goal:" toast blocks the player chips for most of the game.** Phone, Story > First Stitches > Play > Next > Next > Start,
   play 8 turns: "Goal: Win the game." still covers You/opponent buttons and income. Same in chapter 2 ("Goal: Finish with at least -5
   points and win."). Show once, then move it into the bar or fade after a few seconds.
4. **Story result shows no score.** PC, Story chapter 1, finish a game 9-9: screen says "Not this time" with grey stars and no totals and
   no word about the tie-break. The player cannot tell why a tie is a loss or by how much they lost.
5. **"Score 0 or more" star not given on a loss with score 9.** Same game as 4. Either the star list should say "Win, and..." or the
   star should be awarded.
6. **Story result stars stack vertically.** Phone and PC, win or lose any chapter: the three big stars are in a column, pushing the card
   tall. Should be one row.
7. **Best score never saved.** After winning chapters 1 and 2, `GXC.progress().ch.c1.best` is `null` (also c2), so the map has no best to
   show.
8. **Menu tabs overlap on phone.** 390x763, Menu: the chips "Game Sound Speed Help Accessibility About" overflow their pills and overlap
   ("Hel|Accessibility"). Also the Game section has a duplicate "Game / Game" heading.
9. **Map header wraps mid-word.** Phone, Story: the header reads "The / Quilt / er's / Year" in a narrow column between Back and Tutorial.
10. **Dock collapse button is blank.** Phone and PC, any turn: the button at the top right of the dock is an empty white square (its "⇥"
    glyph is not visible).
11. **Developer text shown to players.** Menu > Sound: "Silent until the music files are added". Hide the music row until tracks exist.
12. **Opponent names truncate on phone.** 390x763: "Ma..." (Marden), "Da..." (Dame Poppy), "Til..." (Tilly), "Au..." (Aurelia) in the chips.
13. **Restart has no confirmation.** Menu > Restart throws away the current game at once.
14. Minor: Quick-game result screen hides the board entirely; "Look at the quilts" returns to a board showing only your quilt and a
    "See the result" button, with no side-by-side comparison.
15. Minor: on first phone load one resource returns 404 (not seen on PC).

## Top 5 changes, ranked

1. **Give it a real finish.** End-of-game sequence: both quilts side by side, empty squares counted down with the -2 ticks, bonus
   badge, winner banner with sound; Story result shows the totals and the tie-break line, stars in a row. This is the moment players
   remember and today it is a bare table.
2. **Bring the title and table up to the shelf look.** Painted backdrop and framed title card like the old shelf games, a display font,
   patch art on the title; the temporary code-drawn art is fine for patches but the shell around them looks unfinished.
3. **Show the opponent's quilt in play on PC** (the right dock has the room) and a mini quilt on phone, so buying decisions can read the
   other side without an extra tap.
4. **Make the time track readable.** One clear snaking path with a direction arrow, bigger cells on phone, the next button and leather
   spots highlighted ahead of each token, a preview of where a patch's time cost would land you.
5. **Clean the overlays and small UI bugs:** kill the "New here?" toast when the tutorial starts, move the Story goal off the chips,
   fix menu tabs, map header wrap, blank collapse icon, truncated names, music dev text; remove the original title from
   rules-notes.md before any merge.
