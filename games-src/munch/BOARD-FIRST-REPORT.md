# Doorkick Dungeon: board-first report (Oct 2026)

The preview is at `games/doorkick-dungeon-next/index.html` (live link: `/doorkick-dungeon-next/`). The live game in `games/doorkick-dungeon/` is unchanged. The rules engine is unchanged, and the computer players have one bug fix (see below).

**The acceptance bar was not met.** The brief allows three rework rounds, and all three were used. This is the best build, shipped with the honest numbers below.

## What changed (all in the game's own folder: `bf.js`, `bf.css`, plus one line in `ai.js`)

1. **The board is the screen.** In phone portrait there is one line of at most 8 words ("Kick the door!", "Losing! Add cards, get help, or run") and one row of buttons. The bar is always the same height, so buttons don't jump. Hints, lessons, tips and the "While you waited" box no longer fill the dock. Toasts sit in a thin strip over the board.
2. **Touch the thing itself.** You can drag a card, or tap it to pick it up (tap it again for its details). Its legal targets then glow, each with a label saying what will happen ("Wear it", "Curse Grub", "Boost Kamikaze Toads"):
   - your hero (a big portrait during setup, the avatar and gear row after);
   - the hero or monster side of a fight, or one monster;
   - a rival's chip, the door (fight a monster from your hand) or the discard.

   Each drop runs exactly one move from `validMoves()`. Several moves on the same spot open the card's own choice pop-up. Moves that hurt you (curse yourself, boost your own monster) never glow and stay in the details pop-up.
   - **Glow colours:** gold or blue means good for you now, red means against a rival, and dim means not now.
   - **Ask for help:** the rivals glow with their strength and whether they'll say yes ("+5 ✓ yes"). Tap one to ask. This replaced the sheet of offer buttons.
3. **The fun moment, made big: the door kick.** On your turn the door fills the table with a breathing "KICK!" and a boot. Tap it, or the bar's Kick button:
   - the table shakes and the door cracks (thud sound, vibration);
   - the doors burst apart and the card flips in;
   - "A MONSTER!" (with a roar), "CURSED!" or "Into your hand" slams in, with the monster's level and your strength.

   Rival kicks get the same reveal, shorter, and the computer waits for it. The reveal never blocks a tap.
4. **Rivals ganging up, shown on the board.** When a rival boosts your monster, sends in another monster or plays a one-shot:
   - the card flies from their chip onto the target;
   - a speech bubble pops up ("Boost the monster!");
   - the fight totals float "+5" where they changed.

   Level changes float on the player chips. Lost gear ("Lost: Brave Bucket") and gear you carry but can't wear (with the reason) show as notes. Carried gear is marked "✗ not worn".
5. **First game without reading.** A ghost finger drags the suggested card onto your hero once, then taps the door once. It stops as soon as you copy it. The first "teach me" game starts against Easy computers, which you can still change on the start screen. Prompts where none of your cards could do anything are skipped, and so are curse chances before a trailing rival's door. The status chip says "Grub's fight: meddle?" instead of "Your move".

## Blind testers (390x763, three new testers per round, first 8 words of any text only, `playtest/bf/drive-drag.js`)

| Round | Lost after 1st minute | Dead taps | Fun (average) | Named an exciting moment | Said the goal |
|---|---|---|---|---|---|
| Baseline (preview before) | 2 / 1 / 3 | 5 / 4* / 5 | 4.0 / 2.0 / 2.8 (**2.9**) | 2 of 3 | 3 of 3 |
| Round 1 | 4 / 4 / 4 | 3 / 8 / 3 | 2.5 / 2.8 / 3.3 (**2.9**) | 3 of 3 | 3 of 3 |
| Round 2 | 5 / 3 / 4 | 6 / 4 / 6 | 3.0 / 2.3 / 3.5 (**2.9**) | 3 of 3 | 3 of 3 |
| Round 3 (final) | 2 / 3 / 6 | 2 / 3 / 6 | 2.8 / 2.8 / 2.3 (**2.6**) | 3 of 3 | 3 of 3 |

\*Baseline T2's first dead taps were on a blank page: the test driver had not opened the game yet. That was my setup slip, not the game.

Against the bar (all three testers must have ≤ 2 lost moments after the first minute, ≤ 3 dead taps, fun ≥ 4/5, an exciting moment and the goal):
- **Met:** every final tester named an exciting moment, all of them on the board (the reveal, a dragged card turning a fight, a rival flipping a fight, tapping a rival for help), and every tester could say the goal.
- **Not met:** lost moments and dead taps (one of three testers within bar in round 3), and fun (2.6 against 4).
- **Fun did not move.** Every round's testers gave the same reasons: long computer turns, staying at level 1 while rivals level up, curses taking their best item, and a hand of monsters they can't use. These come from the game's real rules and the computer's behaviour, which the brief keeps.
- **Some lost moments and dead taps came from the test driver.** Its tap-by-text picks the first button containing that text, so "Run", "Auto" or "Fight" sometimes hit a hand card whose rules text contains the word. Rounds 1 and 2 also hit two real problems, both fixed for round 3: the rival's reveal swallowed taps, and glowing cards would have hurt the player.

Logs: `playtest/bf/r0-baseline.md`, `r1.md`, `r2.md`, `r3.md`.

## Before and after (390x763, same game state)

| | Before | After |
|---|---|---|
| Setup | ![](playtest/bf/shots/ba-before-1-setup.png) | ![](playtest/bf/shots/ba-after-1-setup.png) |
| Your door | ![](playtest/bf/shots/ba-before-2-door.png) | ![](playtest/bf/shots/ba-after-2-door.png) |
| Your fight | ![](playtest/bf/shots/ba-before-3-fight.png) | ![](playtest/bf/shots/ba-after-3-fight.png) |
| A rival's fight, a card picked up | ![](playtest/bf/shots/ba-before-4-meddle.png) | ![](playtest/bf/shots/ba-after-4-meddle.png) |

## Bug fixed (with a test that fails on the build before this rework and passes now)

- **Easy computer:** 22% of the time it picks a random legal move, and that move could be a bare "sell" with no cards, which the engine rejects. It surfaced as 68 rejected moves in a 40-game Easy gauntlet. Fix: `ai.js` leaves out `sell` from that random pick. Test: `clarity-test.js` "easy computer never picks a bare sell" (fails on the old build: "bare sell at try 5").

## Tests (final build)

See `TESTS` below. The tests were updated only for the new interaction:
- `lay-phone.js`: the first tap picks the card up and lights targets, and the second opens the pop-up. Ask mode uses glowing rivals.
- `click.js` and `click-ph.js` also tap glowing targets.
- `clarity-test.js`: the Run label check now reads "Run (33%)".
