# Tidewake: clarity pass (Oct 2026)

Preview: `games/tidewake-next/index.html` (live at https://am015-dev.github.io/spotify_to_ytmusic/tidewake-next/).
The live game `games/tidewake/` is untouched. The rules and the engine (`src/`) are unchanged.

## Result in one line

The blind fun score rose from 2.75 to 3.0 out of 5 over three rounds, which is **below the 3.5 target**. Every tester
could explain the goal and a turn, and why each junk sank. The remaining gap is the game itself: testers feel the
leviathan dice decide too much. More fixes went in after round 3 and have not been blind-tested (see below).

## What testers hit before (round 1, live build)

Fun scores: casual 2.5, impatient 3.

1. **Bug: the roll card appeared the moment you tapped Place**, before your own junk had sailed. It was the *next*
   captain's roll, but it read as yours, and your ship seemed to move "one screen late".
2. **Bug: the result came before its cause.** Victory or Defeat was shown while the replay was still playing. The
   sunk junk was still drawn on the board and the "Sunk! because..." card came after the result. This happened in
   4 of 5 automated games.
3. **No idea which ship was yours.** Nothing said "you are the red junk" until the end screen.
4. **"Vermilion is playing"** was shown during your own roll, and nothing said which roll belonged to whom.
5. **Unlabelled numbers** in the top bar ("T5 · 47 · 7"), and the turn number ran ahead of the replay.
6. **Things changed off-screen:** the computers kept playing while the player read, Skip jumped two turns, and
   tiles vanished under leviathans with no message. Leviathans appeared and disappeared.
7. **Stale hint:** "Tap the glowing square to see your tiles" while the tiles were already showing. When all three
   tiles showed a red cross, nothing said that turning a tile could fix it.
8. **Four tutorial cards back to back** before the first move, each about 50 words.
9. **Half the phone screen was empty** below the controls.
10. **Pace:** about 15 s of leviathan replay per wake roll, with a card to dismiss even on calm rolls.

## What changed

Bugs, each proved by a test first (`game/clarity/reveal-order.js` fails on the old build and passes on the new one):
- The roll card waits until the replay reaches its dice (`ui4.js` afterMove, `ui2.js` dice beat).
- The result card, the "Game over" strip and the goal line wait for the replay. The Sunk! card (the cause) comes
  before the result card (`ui3.js` mainHTML0, `ui7.js` phNeed / phStripHTML / phGoal).

Cause and effect:
- **The roll card says whose roll it is** ("Your roll" / "Cobalt's roll"). Each leviathan line says what the move
  did ("Saltshade moves west and smashes the tile at column 4, row 6: Cobalt's junk sinks!").
- **"Since your last move"** is a list under the controls, in the phone's empty half: every roll, move, smashed tile
  and sinking since you last acted, in order, with "(you)" after your name. Nothing changes off-screen any more,
  even after Skip.
- **The Sunk! card** says "It happened on your turn / on Cobalt's turn" (no more "Vermilion answered").

The goal and the race:
- A line that is always visible: "Last junk afloat wins. Afloat: You, Cobalt · Sunk: Jade".
- The setup strip says "You sail the Vermilion junk". The "You" tag over your junk now shows on phones.
- The top bar shows "Turn 5 / 7 monsters · 47 tiles" in words, and the turn number follows the replay. The
  top-bar buttons have labels (Crews, Log, Rules, Pieces, Menu).
- "Your turn" / "Cobalt's turn (computer)" replaces "X is playing".

Trustworthy suggestions:
- **A third tile badge.** ✓ safe, ✗ sinks, and an amber **!** when a leviathan's own arrows can bring it onto your
  route on its next wake roll. The badge shows only at about 14% or more; the hint names the leviathan, its die
  faces and the odds.
- The hint says what to do with the tiles. When every tile sinks you as turned, it says "Press Turn to find a ✓".
  When your tile also sinks a rival, it says "Good move: this tile also carries Cobalt along its line, and it sinks!".
- The default selection is a safe tile, not tile 1 unturned (which could be a red cross with Place greyed out).
- **Turn turns only the selected tile.** Each tile keeps its own turn. Before, Turn turned all three previews and
  changed the badges of tiles you were not looking at.

Guided game and pace:
- Lessons are shorter (one or two sentences) and come at most one per turn. The first lesson says "After this card,
  tap Best start".
- Calm rolls are one line, not a card to dismiss. The replay beats are shorter (a wake roll 1.4 s instead of 1.85 s,
  leviathan step 0.7 s instead of 1 s).
- **Skip → "Skip to my turn"** (single human). It skips every computer turn and roll card until you act. The
  "Since your last move" list shows what you skipped.
- The end card has no floating Continue covering it; "See the board" sits with the other buttons.
- The title's "Start with these settings" became "Play now: you vs 2 computers".

## Retest results

| Round | Build | Casual | Impatient | Notes |
|---|---|---|---|---|
| 1 | live (before) | 2.5 | 3 | Bugs above; "I won without understanding why" |
| 2 | bug fixes, labels, feed, goal line | 2.5 | 2 | Both died to leviathans with no warning; the strip text overlapped; a ✓ felt like a lie |
| 3 | + risk badge, safe default, Skip to my turn, labelled bar | 3 | 3 | Both explained every sinking; "the leviathan phase is random noise"; "no challenge vs one easy computer" |

Acceptance, honestly:
- **Goal and a turn explained by both testers: yes**, from round 1 on.
- **Why they won or lost points: yes in round 3.** Both named the cause of every sinking, their own included.
- **No unexplained changes: mostly.** Round 3 still reported counts that move without a visible cause (monsters
  6 → 5 → 3, tiles 34 → 36 after a sinking). The reasons are rules: tiles destroyed by leviathans go back under the
  pile, and the sea refills to three leviathans. Those lines are in "Since your last move", but nobody reads the
  counts against them.
- **No unreachable option: yes after the fixes.** In round 2 the end screen's second row was hidden under the
  floating Continue; that bar is removed.
- **Fun ≥ 3.5: no (3.0).**

After round 3 (built, tested automatically, **not blind-tested**):
- The risk badge only shows at about 14% or more, with the odds in words. Round 3 said "! on almost every tile
  means nothing".
- Turn turns only the selected tile.
- The "your tile also sinks Cobalt" hint.
- Skip also skips the roll cards, and reads plain "Skip" during your own roll.

## Tests (final build)

Full results are in `game/out/` (gitignored); the runner is `game/clarity/full.sh`.
- `rules-test.js`: 38 passed, 0 failed. `hidden-test.js 40`: passed (0 knowledge differences).
  `tools/net-strip-test.js`: passed (11814 stripped views, 0 problems).
- `click.js`: 27 games, 0 errors, 0 hidden-hand violations.
- `clarity/reveal-order.js` (new): 0 early roll cards, 0 early results, 0 ghost ships, on phone and at 1366x768.
- `lay.js` at 1366x768, 1920x1080, 768x1024 and 1100x700: 0 problems.
- `lay-phone.js` at 390x844, 390x763, 390x664, 375x553, 412x780, 844x390 and 750x342: 0 problems at every size.
  - On the two short phones the tile pop-up's Place button used to sit partly below the screen.
  - The check used to skip it because Place started greyed out. The new safe default tile enables Place, which
    exposed the problem.
  - The pop-up's previews are now smaller on screens under 700 px tall.
- `net/p2p-tw.js` (real WebRTC, local relay): full 34 runs 0 bad, leave 0 bad, ui 0 bad. Timeout: 11 runs 0 bad on the re-run, where the host's timer answered the silent client's interrupt. The first run was "40 runs, 1 bad": all 40 games agreed, but no interrupt ever reached the client, so the timer was never exercised (the harness marks that as bad).

Three test files were adapted to the new (correct) order: the result appears after the replay, and the Sunk! card
before the result card.
- `click.js` waits for the replay before looking for the result card, and accepts the new RISKY badge.
- `lay-phone.js` waits for the replay before dismissing cards, and taps away the Sunk! cards before checking the
  result card.
- `net/p2p-tw.js` waits for "Play again" to exist before tapping it.

`build.py` now reads the kit and audio from this folder (`tidewake/kit`, `tidewake/audio`). The old `tots/` and
`audio/tidewake/` paths no longer exist.

## Still weak

1. **Luck dominates.** On a 6x6 board with 6–9 leviathans, a 6–8 roll (44%) can end a junk with no answer. That is
   rule-accurate ("a leviathan in front of the active junk when its turn begins sinks it"). The board size and the
   leviathan arrows are our own guesses, though (see `rules-notes.md`), and are the lever if the owner wants a less
   swingy game. A 7x7 board or fewer starting leviathans would need a rules decision, not a UI change.
2. **The guided game is too easy.** Testers won against one easy computer by only pressing Place. A 3-captain
   guided game would show more stakes.
3. **Leviathan names** appear in text, but on phones only the "You" tag is drawn on the board. Tap a leviathan to
   see its name and arrows.
4. **Taps landing on moving cards.** The roll card auto-hides after about 3.5 s, and cards grow as lines appear,
   so a tap can miss.
5. The "Stop: column 6, row 4" label is still sometimes clipped at the right edge on phones.
6. Real iPhone not tried. All tests used Chromium with software WebGL.
