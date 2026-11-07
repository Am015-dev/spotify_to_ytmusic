# Stitchwise tutorial coverage (W381)

The tutorial is the story's prologue: one complete, real game against Marden (fixed seed 4242, fixed patch ring), played from setup to
the judging and the result screen. Guide: **Aunt Wren**. Rival: **Marden**, who has won the Parish Fair ribbon three years running and
swears no newcomer will take it.

- **Chapter 1 · Your first turn** is spotlit and step by step (shared tutor kit): each step needs the real action.
- **Chapters 2-4** are the same game played on, freely, with the glow showing legal moves. Aunt Wren's line in the panel (portrait,
  chapter name, 2 short lines) appears the first time each rule happens, with the reason and a reaction. The player keeps doing the real actions.
- Leave and resume: chapter 1 resumes at its step (tutor kit); from chapter 2 the game is saved like any game ("Continue your game" on the
  title), Aunt Wren's progress included.
- All text lives in `campaign.json` → `story` (prologue steps, coach lines, final lines).
- Proof: `node playable/play.js 390x763 tut` and `1440x860 tut` play the whole tutorial game by centre taps to the result screen and assert
  every line below was shown (PASS both, run on the final build).

| Rule (rules-notes.md + rules-check) | Taught by | Step / coach key | Story beat |
|---|---|---|---|
| Setup: 9x9 quilt, 5 buttons each, both tokens on space 0 | seeing | ch1 `pick` (pills show 5 buttons, empty quilt) | Marden's challenge |
| Buy one of the 3 patches after the marker; cost in buttons | doing | ch1 `pick` | "Prove them wrong: buy the long strip, 3 buttons" |
| Place without overlap, rotate / flip; empty squares cost 2 | doing | ch1 `drag` (Rotate / Flip on the panel) | "Lovely strip! Lay it on your quilt" |
| Pay, then move your token by the patch's time | doing | ch1 `sew` | "Snug fit. Sew it on" |
| The player further back on the track moves next | seeing | ch1 `opp` (Marden's whole turn, step by step) | "Watch the old fox" |
| Advance: just past the rival, 1 button per space | doing | ch1 `adv` | "Low on buttons? Advance past Marden" |
| Buttons are money and score | seeing | ch2 `start` | "Chapter 2: buttons are your money AND your score" |
| Income: passing a gold spot pays the buttons printed on your patches (0 if none) | seeing/doing | ch2 `income_me` or `income_zero`, `income_opp` | "Pay day!" |
| A patch you can't afford can't be bought (dim, "need N more") | seeing | ch3 `cant` | "Too dear for now!" |
| Same player can move several times in a row (still behind) | seeing | ch3 `again` / `again_opp` | "Quick patches buy extra turns" |
| Leather 1x1: first to pass it takes it and places it at once | doing / seeing | ch3 `leather_me` (tap a square) / `leather_opp` | "A leather scrap! Free" |
| 7x7 bonus: first to fill a 7x7 block gets +7 | seeing | ch3 `bonus` when it happens, else the judging line "the +7 rosette stayed on the table" | "the gold rosette" |
| Fill gaps late: each empty square -2 | seeing | ch4 `late` | "The fair closes soon" |
| End: when both tokens reach the last space; the first to arrive waits | seeing | ch4 `end_me` / `end_opp` | "the judges come" |
| Scoring: buttons + 7 bonus - 2 per empty square | seeing | judging (result count-down, -2 on each empty square, tally) + `final` | climax: Aunt Wren's verdict |
| Tie-break: on equal points, whoever reached the end first wins | seeing | `final` tie line (when tied) and the result's tie line; also How to play | "A dead heat!" |

## Honest gaps
- **Tie-break** is shown in the tutorial only if the game actually ends tied (it does not with this seed); otherwise it is in the result
  screen's tie line (when tied) and in How to play. Not "seen" in a normal tutorial run.
- **No room for a patch** ("no room" on a card) and **an empty patch ring** practically never happen in a 2-player game; not covered.
- **Full quilt skips the leather patch** (simplified on purpose, stated in How to play) is not shown.
- The 7x7 bonus is *seen* either being won (it was at 1440x860) or as "stayed on the table" at the judging (390x763 run).
