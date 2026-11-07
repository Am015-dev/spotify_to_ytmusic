# Twin Thrones W335 (integration)

Done: `src/ui.js` rebuilt from engine/ai/data/art/body/head + smoke.js (title with modes and 3 levels, wonder draft, age pyramid with only uncovered cards takeable,
tap a card -> build / sell / wonder buttons with costs in the dock, city strips, conflict track with sliding pawn and loot marks, progress-token picker, age banner,
card fly + coin pops, result with victory type, drawers for cards / log / rules / city). All pictures go through `TTA` slots (title-bg, table-bg, military-pawn, result-victory/defeat, cards, wonders, tokens).
Checked: `python3 build.py` ok, `node rules-test.js` PASS, `node smoke.js` PASS phone 390x763 and PC 1440x860, 0 console errors.
Known rough spots: phone pyramid cards are small (about 28 px unit) because the two city strips and token row use most of the height; resource chips on the strips show only fixed production; no audio; "Menu" only has "Back to title".
Shelf: games/index.html lists Redline Rally, Emberclimb and Twin Thrones (code-drawn covers in games/covers/, status "Under testing", boxes added to the three bays), sw.js SLUGS updated, games/status.json refreshed by game-status.py.
Not done on purpose: built files (games/<slug>/index.html) are not committed, so the shelf cards open nothing until the orchestrator runs `build-all.py --deploy` for the three slugs and then `add-update.py`. visual.spec baselines not approved.
