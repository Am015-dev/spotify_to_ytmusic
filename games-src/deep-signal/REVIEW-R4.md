# Deep Signal: R4 player review (7 Nov 2026)

Build: `origin/shelf/W352-deep-signal` (6209a3ea), built with `python3 build.py`, temporary icon art installed, served locally.
Played with Playwright, real touch taps on phone 390x763 and mouse clicks on PC 1440x860: first launch, tutorial ("New here?"),
Quick games (missions 6, 10 and 12, 4 crew; one random-play loss, three hint-guided wins to the result screen), Story missions 1 and 2
(both won, 3 and 2 stars), title How to play / Settings, in-game ? and Menu, a 2-human hot-seat round (4 crew, 2 at this device),
and a 2-crew drone game. Console: no script errors; one 404 for a missing media file on load.

Verdict: the rules engine and the crew AI are solid, and the shelf skeleton (Story map, tutorial, help, menu, hot-seat) is there.
But it still looks and feels like a prototype: no title art, no music, a mostly empty board, unlabelled tricks, flat result
screens, and How to play skips half the rules. I would not show this to a paying player yet.

## Scores (1-10)

| Row | Score | Why |
|---|---|---|
| First minute | 5 | Title is two drawn circles and text, no logo or picture (old shelf games open on a painted scene). Tutorial starts well but is 9 short steps over one trick. |
| Rules clarity | 5 | Title "How to play" shows only 4 cards (goal, follow suit, sonar, two divers). It never explains taking tasks, order marks, signals or the flare. Signals and tasks look almost the same in the seat panels. ★ means tricks won on the board but stars earned in Story. |
| Fun moment | 6 | Getting the last task home with the crew is satisfying, and the gold glow plus MISSION COMPLETE stamp works. Hard missions are real puzzles. |
| Feedback / juice | 4 | No music ("Music files arrive later; silent for now" shows in the Menu). Trick cards are not labelled with who played them. Quick-game win/loss screens are plain text on an empty background, with no stars or replay of the losing trick. |
| Computer crew | 7 | The crew plays sensibly: it feeds you your task cards, signals in a useful way and drafts sensibly. Hint-guided play won 3 of 3 missions. The hint bulb explains its choice. |
| Phone | 5 | The middle ~350 px of the board stays empty while the 10-13 card hand is crushed at the bottom. With 13 cards each card shows a ~28 px strip, below the 44 px tap target. The "for Kito" tag is clipped at the left edge. Coach bubbles cover the hand. |
| PC | 5 | Works, but seat panels are small and pushed to the corners, the trick floats in a big empty field, and the hand is a small strip at the bottom. Order badges overlap the seat's ★ count. |
| Structure parity (title / Story / tutorial / help / menu) | 6 | Story map with acts, bosses, stars and save, a tutorial, the ? help, the Menu (Rules / Tutorial / Restart / Title, sound, speed, accessibility) and hot-seat with a pass screen are all present. Missing next to the old shelf: title art and logo, online play, Watch mode, real story text (one-liners like "The signal grows stronger."). The captain portrait is a compass icon, and the parchment map clashes with the deep-sea game. |
| **Average** | **5.4** | |

## Bugs (with steps)

1. **Drone's face-up cards are invisible (2 crew).** Quick game, Crew 2, any mission. The drone seat shows only its tasks and a
   ★ count. Its 7 face-up stacks only appear in your hand area on the drone's own turn. You can't see them while drafting
   tasks or planning your own plays, and those face-up cards are the whole point of the 2-player rules. Blocking for 2-crew.
2. **13-card hand untappable on phone.** 2-crew game on 390 px. Each card shows a ~28 px sliver. A tap aimed at a glowing
   card's middle lands on the next card and opens the card zoom instead of playing it. Same squeeze at 10 cards (~35 px).
3. **How to play is missing core rules.** Title > How to play: 4 cards only. Taking tasks, order marks (1-5, arrows, Ω),
   signals, flare and captain-decides only show as context tips during play, so a new player can't read them up front.
   Every rules card also shows an empty grey picture box.
4. **Tutorial tap on the wrong card is silent.** Tutorial step 7 "Lead Coral 9": every card in the hand glows as legal. Tapping
   any other card does nothing visible (no "Tap the glowing Coral 9" message seen on phone), so the player thinks the game froze.
5. **Tutorial bubble hides the line and hand.** Tutorial steps 1, 8, 9 on phone: the bubble sits over the status line and the
   top of the hand. At step 9 the "Mission complete!" line is hidden, and for several seconds after the stamp there is no button
   in the bubble. From the Story the "Continue the logbook" panel does appear later.
6. **Story sheet grammar:** Mission 1 goal reads "Complete all 1 tasks." The sheet also says "Opponent: The trench" in a co-op game.
7. **Loss text grammar:** "Amber 1 was won by Kito, not You." (capital You mid-sentence).
8. **"Follow suit: tap a glowing card" shown when you are void.** When you have no card of the led colour (all cards glow),
   the line still says "Follow suit".
9. **Hand glows during "Flare or dive on?".** Quick game, before trick 1: all hand cards glow as legal while the game waits for
   Dive on / Send a flare, which suggests you should play a card.
10. **Hot-seat avatar letter.** 2 humans at this device: the first human's seat shows the initial "Y" (from "You") but is named
    "Diver 1". There's no way to enter player names. The pass screen itself is good: opaque, and it hides the hand.
11. **Menu shows a placeholder message to players:** "Music files arrive later; silent for now."
12. **Order badges overlap the seat stats.** PC and phone: the 1/2/Ω badge on a seat's task card covers the ★ count above it.
13. One 404 on load (a media file that isn't installed).

## Top 5 changes (ranked)

1. **Fill the board and label the trick.** Show the drone's 7 stacks on the board (bug 1). Put each played card at its seat
   with the player's name, and use the empty middle for the trick and task targets. On phone, give the hand two rows or a
   scroll so every card has at least 44 px to tap (bug 2).
2. **Make How to play complete and illustrated.** Add cards for tasks, order marks, signals (with the ▲ ● ▼ icons), flare and
   special missions, with a picture each instead of the empty box. Draw signals clearly differently from tasks in the seat
   panels, and stop using ★ for tricks won.
3. **Add presence: title art, logo, music, result screen.** Give the title a deep-sea scene and logo like the old shelf games.
   Add music, and remove the "arrive later" text. Quick-game results should get the stamp, stars and a short replay of the
   trick that failed.
4. **Tighten the tutorial.** Only the target card glows. A wrong tap shows a message. Move the bubble so it never covers the hand
   or line. End with a clear Continue button. Add one step each for signals, order marks and the flare.
5. **Story polish.** Write a few lines of story per mission and a real captain portrait instead of the compass. Fix the
   grammar (bugs 6, 7, 8). Add hot-seat player names, and consider Watch mode and online play for parity with the old shelf.
