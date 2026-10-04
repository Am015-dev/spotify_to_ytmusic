# Doorkick Dungeon: clarity report (Oct 2026)

The preview is at `games/doorkick-dungeon-next/index.html` (live link: `/doorkick-dungeon-next/`). The live game in `games/doorkick-dungeon/` is unchanged, and so are the game's rules.

**How it was tested.** Blind newcomer playtests on a 390x763 phone screen through `games-src/scripts/drive-serve.js`. Each tester only saw screenshots and had no access to the repo. Every round used two new testers:
- a **casual** player who taps the big button and keeps any tips on;
- an **impatient** player who skips every tutorial and tip.

The logs are in `playtest/` (`r1-*` is the live game before any change, `r2-*` and `r3-*` are the preview).

## Results

| Round | Build | Casual fun | Impatient fun | Average |
|---|---|---|---|---|
| r1 | live game (before) | 3 | 3 | **3.0** |
| r2 | preview, first fixes | 3.5 | 3 | **3.25** |
| r3 | preview, second fixes | 3 | 3.5 | **3.25** |

**The acceptance bar was not fully met.** The target was an average of 3.5 or more, and both rounds of the preview averaged 3.25. The brief allows three rounds, so this is the best version, shipped with the notes below.

**What did improve:**
- Every r2 and r3 tester could explain the goal (first to level 10, and the last level must come from a kill) and a whole turn.
- Every r2 and r3 tester could say why they won or lost each fight.
- The r3 testers named the cause of most level and item changes, from the new "While you waited" box.
- In r1, by contrast, lost boots, a lost race and rival level jumps were all "no idea why".

## What the r1 testers hit (live game)
1. **Things changed with no cause on screen.**
   - Boots, a longbow or a race vanished between turns.
   - The hand limit dropped from 6 to 5.
   - Rival levels jumped by 2–3 between turns.
   - A short "Ouch" toast did exist, but it was gone after 7 seconds of computer turns.
2. **The phone action panel was cut off.**
   - The hint, the roll result and the End turn button sat below the bottom edge.
   - The buttons moved between screens.
3. **The start screen hid "Computer skill" under the Start bar.** There was no guided or first game.
4. **Charity (the hand limit) was a puzzle.** "Too many cards: 7 of 5" gave no reason, it didn't say who gets the cards, and nothing said the turn would then end.
5. **Fighting a monster from your hand was a tiny grey line**, so nobody found it.
6. **Run-away odds were buried in small tip text.**
7. **The computer played slowly.** The default speed was "slow", and testers waited 8–25 seconds per round.

## What changed (in the game's own folder only)
- **"While you waited" box** at the start of your turn (`sinceTrack` and `sinceDiff` in `coach.js`). It lists every level change at the table, items and races you lost, curses now on you, and a changed hand limit. Each line comes with the diary line that caused it, for example "You lost Stompy Boots (Grub curses you: Sock Goblin…)".
- **Teach me as I play** (on by default on the start screen). It shows one short, plain lesson the first time each situation comes up: setup, your turn, winning fight, losing fight, empty room, tidy-up, charity, a rival's fight, before a rival's door. Each lesson has a Got it button and is remembered.
- **✨ Play suggested cards (N).** One tap plays the races, classes, items and level-ups the hint would play. Afterwards it says what it played and the strength before and after ("Strength 1 → 6"). After r2 feedback it never sells.
- **✨ Give away the suggested cards** for charity. The charity text now says why ("extra cards go to the lowest-level hero"), to whom, and that your turn then ends. Afterwards it lists where each card went.
- **The phone action panel puts its buttons first,** always in the same place, with the instruction, lesson or recap under them. The panel is a little taller (30% of the height) and fixed, so buttons don't jump. Disabled buttons are hidden.
- **Run away shows its odds** ("need 5+: 33%", "sure", "this monster can't be escaped").
- **Empty room:** a winnable monster in your hand gets its own "⚔ Fight X from your hand (level n): you'd win" button. Losing options stay in the card popup with their warning.
- **"You" is shown in the player strip,** and the header shows "Lv 5/10 · Your move" (or "Grub's turn"). Rivals meddling in a fight read "Tansy decides whether to meddle in Grub's fight…".
- **Short start screen on phones:** no cast list, compact buttons, and Computer skill visible above Start.
- **Selling on a phone:** the Sell and Cancel bar is pinned at the top of the panel. In r3 it was off-screen.
- **The computer now plays at "fast" by default,** and the "Ouch" toast stays for 15 seconds.
- **Fight labels on phones** show the hero and monster names under the two numbers.

## Bugs fixed (each with a test that failed on the live build and passes now, in `clarity-test.js`)
- **Choose-one questions:** in a curse's "discard one small item" question, tapping the card picture opened its details instead of choosing it (r3 casual, screens 109–125).
- **Silent changes:** a curse taking your boots on another player's turn was not explained by the time your turn came (r1 casual 029).
- **Rival level changes** were never explained (r1, both testers).
- The other five checks cover the run odds, the lessons, the "play suggested" note and one-tap charity.

## Still weak (honest notes)
- **Rival turns are long and chaotic.**
  - Computer curses rain on the leader, so levels swing 9 → 7.
  - "Let X go on" prompts appear for every rival door when you hold a curse.
  - These are the game's real rules and computer behaviour, and both r3 testers named them as the main fun drag.
  - A next step would be a "skip my chances to meddle this round" toggle, plus a computer that curses less on Easy.
- **The hand and the gear row overflow sideways** on a phone when you hold 8 or more cards or items. Card names in the fan are clipped, and the rightmost cards need a sideways swipe.
- **The fight screen is still busy:** totals, monster, banners, hint and several buttons.
- **The ask-for-help sheet lists every offer amount for every rival.** It should show only the rivals who can make you win.
- **Things that stay on purpose:**
  - A monster played from your hand on an empty room ("look for trouble") is a real rule, but newcomers find it odd.
  - So is giving your extra cards to the lowest-level rival.
- **On the 375x553 phone** the table gets very small during a fight. This was already true before, and the taller action panel makes it slightly worse.
- **The desktop board test fails** at its first phone size. At 390x844 it tries to click the desktop "hide panel" button, which phones hide. See the test table for whether the live build fails the same way.

## Tests (final run)
See the bottom of this file.
