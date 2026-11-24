# Sands of Qamar: the floating tour (W655)

`src/tour.js` + styles at the end of `src/skin.css`. "Learn by playing" now starts a real 2-player game against the computer with a
floating guide window: drag it by its header, minimise it to a chip, close it; the ? button (top bar on PC, top-left on phones so the bar
stays at 5 buttons) reopens it on the map. Nothing dims the screen and nothing blocks a tap: only the window, the chip and the map labels
take taps; the pulse ring and leader lines ignore the pointer. The window places itself off its target, the map labels and any choice
the player must make (colour chooser, action buttons, glowing tiles).

1. **Map of the screen** (first): 19 labels with leader lines (Guide, Hints, Djinns, Log, Rules, Players, Menu, your strip, score, camels
   left, rival strip, prompt, turn steps, tile, people, tile points, owner marks, goods market, djinn bar, bidding spots / actions). Placed
   by a greedy search so no two overlap; each one tapped gives one sentence.
2. **27 lessons in play order**, each = one sentence + why + a real action, ringed on the board. A lesson ticks when the action happens
   (read from the real move: bid, lift, walk, last drop, claim, each tribe, each tile, sell/end, round 2, tap targets) or on Next.
   Goal and points; bid costs and no refund; who plays first (dearer first, same price later bidder first, next round in play order);
   lift; walk (one per tile, no diagonals, never straight back, pass empty tiles); last drop on its colour and take all; you must move;
   claim with a camel (permanent, none when out); Advisors (+10 per rival with fewer, ties none); Sages; Traders; Masons; Shadows (range,
   kept Advisor/Sage, claim); Mystics; Oasis palm 3; Hamlet palace 5 (even without a claim, supply out); Stall; Grand Bazaar; Shrine and
   djinns (2 Sages or Sage + Mystic); djinn powers (once per turn); selling 1..60; refill; the end; final scoring and ties; Crafters and
   items; Cutpurses; player counts and Wonder Cities.
3. **Practice**: the checklist done, the window offers Hadiya's six commissions (unchanged, `commui.js`).

Test: `node ft/tour-test.js 402x874 ft/proof` and `node ft/tour-test.js 1366x768 ft/proof` (after a build). Screenshots: `proof/tour-*.jpg`.
