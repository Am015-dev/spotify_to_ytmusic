# Tutorial coverage: the COACHED first game (W408, owner's addendum 4: no forced tap-tap steps)

The tutorial is a real two-player game (You vs Farid) on a stacked bazaar and market (`src/tutdata.js`), three camels each so it ends in a few rounds. Every legal move is allowed from turn 1; the computer plays normally; nothing is saved; zero forced taps.
Old Hadiya (`src/coach.js`, text in `src/lore.js` LORE.coach) explains each rule the first time it matters: one bubble at a time, see-through to taps (only its X answers), a new rule replaces the old one after 2.6 s, Farid explains what he does the first time he does it.
She also reacts to your turn (only one X taken, three or more taken, +8 or more, no points) with one line of why. The final count is walked through in 6 pages with the real numbers (coins and land, palms and palaces, people, djinns and goods, total, "Things you'll meet later"). Rules that never came up in the game are listed on the last page.
Script: `node coach-test.js 390x763 [shotsDir]` and `node coach-test.js 1440x860`: starts the game from the title menu, plays any legal moves by the hint finger's target with real touches, reads each bubble, walks the count, asserts at least 14 rules were explained in play, the later card lists every unseen rule, both totals are shown and "Play a real game" returns to the menu.

| Rule id (LORE.coach) | When it is told |
|---|---|
| goal, bid, markers, order | game start; your first bid; your second marker; first turn |
| lift, drop, chz, lastcolour | your first lift; first drop; mixed hand (who stays); last walker |
| take, tribes, camel | after your first take; next take; emptied tile claimed with a camel |
| traders, masons, sages, advisors, shadows | the first time that colour is taken (you or Farid) |
| stall, bazaar, shrine, hamlet, oasis, exchange | the first time you or Farid stand on that tile with its action |
| goods, mystics, sell | you hold goods; you hold a Mystic; your sell step |
| palms, palaces, djinns, rival, end | one is on the board; a djinn is summoned; Farid walks; a player has one camel left |

Not in the coached game (told on the last page or in Story): Crafters, Cutpurses, Wonder Cities, each djinn's power (the lightbulb and the Djinns drawer), no-legal-move pass and ties.
