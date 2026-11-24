# Hollowbough lessons: card placement (W743, 24 Nov 2026)

Done
- Phone (tall): while a lesson runs, the layout keeps a band under the top bar for the lesson card (`src/ui2.js`, `room`); places switch to
  the 4-across short board so labels stay readable; the card spans the width and is shorter (`pv.css`, end).
- keepClear (`src/lessons.js`): HUD, tabs, the panels (places, meadow, city, goals), hand cards, Prepare. keepPlace on.
- Bramble stops once a lesson is won or failed (`aiStep` wrapper in lessons.js).
- `?lesson=<id>` opens a lesson directly (for contact sheets: `--urls "?lesson=twig,?lesson=meadow"`).
- Probe (card rect vs HUD/tabs/panels/hand cards/Prepare): phone 8/8 clear (was 8/8 covering HUD + tabs); pc 8/8 clear of HUD, places,
  meadow and Prepare (was 3 over the top bar, 2 over meadow cards). Sheets: proof/w743/lessons-402-sheet.jpg, lessons-1366-sheet.jpg.

Still weak / not done
- pc: the card sits bottom-left over the "Hand 3/8" label (empty part of the hand row).
- phone build/meadow: the 3-line top-bar prompt grows after the card is placed and touches the card top by a few px.
- pc: the WIN card (261 px tall) can jump once ~1-2 s after minimise/restore (cost of its spot changes as panels settle); lessons-test.js
  pc failed "close left the card" in about 1 of 3 runs during work, last runs PASS. Fix idea: put the result card in a fixed spot.
- Task (b) not done: old GXT tour in ui12.js, tutor-test.js, learn-touch.js still there (out of time). TUTORIAL-COVERAGE.md still
  describes the old tour.
- Contact sheets via scripts/contact-sheet.js not run (needs build-all); sheets above come from the lesson probe at the same sizes.
