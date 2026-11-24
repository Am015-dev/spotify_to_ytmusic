# Sands lessons handoff (W737r, 24 Nov 2026)
- Learn to play = 7 GXST scenario lessons in ft/src/lessons.js (move, take, masons, sell, palace, shadow, djinn). State built by comm.js commNew(-1, spec).
- Test: node ft/lessons-test.js (logic + 402x874 + 1366x768, ~18 s); --logic for headless only.
- Screens: ?lesson=menu | ?lesson=<id>[&step=n|win].
- Removed: tour.js, commui.js and their CSS. Still in the build but unreachable: guide.js / coach.js (old coached game). Delete them in a follow-up.
- Weak: on phone the board fills the screen, so the card sits over a board edge row (never over the highlighted target). Visual baselines for sands are missing (build-all visual rows fail on "no snapshot").
- Not taught yet: bidding for turn order, Advisor majority, last camel ending the game.
