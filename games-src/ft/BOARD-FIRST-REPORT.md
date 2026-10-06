# Sands of Qamar: board-first rework (6 Oct 2026)
Before: 3D canvas plus a dock panel of text, plans, advice and tips; phone-check failed (text over 8 words, no board marker).
After: 2D bazaar grid with big tiles and people; tap a tile to lift its people, glowing tiles show where to drop; each drop,
the final take, palm/palace/camel, goods and djinn cards animate; scores sit in seat chips and pop where earned; one line of at most
8 words; ghost finger on the first moves; computer moves animate (about 0.6 s a step, tap the table to hurry). No panels or advice cards.
Table (`data-board`) is about 75-80% of a portrait screen. Story mode: 10 chapters, 3 acts, 3 bosses (see CAMPAIGN-DESIGN.md).
Checks: `build-all.py sands-of-qamar` PASS; `node sweep.js 24 sands.html 3` (games at 390x763 and 375x553 plus story chapters) clean;
`node rotate-test.js 6` clean; `node gauntlet.js`, `cover.js` clean; `node camp-sim.js` calibrates the chapters.
