# Stitchwise tutorial coverage (W491: guided first game, replaces the coached half-game below)

"Learn: your first game" is now a guided first game (`tutStart` in `src/ui4.js`). Every step is one line of 12 words or fewer and
exactly one highlighted thing to tap; wrong taps are refused with a shake. Steps, in order (8 rules):
1 buy (only the 3 after the spool) - 2 pay (drag, Sew it on) - 3 time and who goes next (watch Marden play) - 4 advance (1 button per space)
- 5 income (pass a gold spot) - 6 leather (first past it sews it, tap a square) - 7 the 7x7 bonus (fill the gap) - 8 end and scoring
(score card with your real numbers). "Play a real game" then starts a fresh full game. Later steps jump the fair ahead so each rule
comes up on cue. Proof: `node tut-walk.js 390x844 [--full] [--shots DIR]` (real touch; asserts order, word count, one highlight,
a refused wrong tap, the hand-over, and with --full a whole real game to the result).

---

# Stitchwise tutorial coverage (W381, ADDENDUM 4: a coached first game)

The tutorial is the story's prologue and a **real game with free choices from turn 1** against Marden (fixed seed 4242 and patch ring
so the situations come up; easy AI). It is a **short fair**: both tokens start at space 26 (halfway), so a first game takes about half as long; 5 gold spots and 3 leather scraps are still ahead. No forced spotlight steps at all (0 of the allowed 2): every legal move works, the glow shows them.
**Aunt Wren** (guide, portrait when art exists) speaks just in time in one line in the panel: when a rule first matters, when you make a
good or poor first buy, and when Marden does something worth learning. One line at a time, never blocks input, × dismisses it.
Rules that did not come up are listed on a **"Things you'll meet later"** card at the judging; the judging walks your score through
with your real numbers ("Your score: 27 buttons + 0 bonus − 18 empty × 2 = −9. Marden: …").

Leave and resume: the coached game is saved like any game ("Continue your game" on the title), Aunt Wren's progress included.
All text: `campaign.json` → `story` (coach lines, later card, final lines). Proof: `node playable/play.js 390x763 tut` and
`1440x860 tut` start the tutorial from the title and play it to the result by choosing **random legal moves through the UI**
(random glowing patch, sometimes Advance), then assert every rule below was explained in the game or on the later card.

| Rule (rules-notes.md + rules-check) | Explained when | Coach key | Story beat / reaction |
|---|---|---|---|
| Setup: 9x9 quilt, 5 buttons each (normal games start on space 0; the tutorial starts halfway); buy one of the 3 patches; or Advance | turn 1 | `start` | "Marden swears no newcomer wins a ribbon. Buy any glowing patch, or Advance" |
| Place without overlap (rotate/flip); empty squares −2 | first patch picked | `pick` | "Lay it on your quilt, then Sew it on" |
| Pay buttons, move by time; what makes a buy good | first buy | `buy_good` / `buy_big` / `buy_cheap` / `buy_poor` | one line why it was good or poor |
| The player further back moves next | Marden's first turn | `who_next` | "Now that is Marden: watch" |
| Advance: just past the rival, +1 button per space | your first Advance (else in `start`) | `adv_me` | "Handy when you are broke" |
| Income at gold spots (0 if no buttons on your patches) | first gold spot passed | `income_me` / `income_zero` / `income_opp` | "Pay day!" |
| A patch you can't afford stays dim | first unaffordable offer | `cant` | "Too dear for now!" |
| Several turns in a row | first time it happens / Marden buys slow | `again` / `again_opp` / `opp_slow` | "Quick patches buy extra turns" |
| Leather 1x1: first to pass it, placed at once | first scrap | `leather_me` (you place it) / `leather_opp` | "A leather scrap! Free" |
| 7x7 bonus +7 | when won, else at the judging ("stayed on the table") | `bonus` | "the gold rosette" |
| Fill gaps late | your token reaches space 40 | `late` | "The fair closes soon" |
| End: both reach the last space; the first waits | first to arrive | `end_me` / `end_opp` | "then the judges come" |
| Scoring: buttons + 7 − 2 per empty square | judging | `final` + walk-through | Aunt Wren's verdict (win / lose / tie) |
| Tie-break: equal points → first to reach the end wins | judging on a tie, else the later card | later card | "A dead heat!" |

Both runs (390x763 and 1440x860) explained every rule during the game; the later card held only the tie-break (no tie).

## Honest gaps
- "No room for a patch" and an empty patch ring practically never happen in a 2-player game; not explained.
- A full quilt skipping the leather patch (simplified on purpose) is stated in How to play only.
