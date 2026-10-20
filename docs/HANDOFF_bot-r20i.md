# HANDOFF bot-r20i (playtest bot)
1. Bot = `src/99c8_bot.js` (lazy chunk, GO `bot/nav`, `bot/race` on both cities, hooked via `RV3A_rows`); runner `tools/tBot.js <url>` writes `docs/BOT_REPORT.md` (`SEEDS=0,1,2,3 WP=4`, `NORACE=1`); hand-written findings live in `docs/BOT_NOTES.md`.
2. Nav drives seeded `HUB.nodes` waypoints with the game's own keys through `roamStep(1/30)` (pure pursuit, speed governor, back-out when pinned); asserts progress/5 s, stuck > 8 s, ≤ 1 auto-reset, fall, NaN, JS errors, step > 120/300 ms; each problem is filed under its 100 m cell.
3. Measured: unit 0 FAIL; TAG=life1,xf1,terrain,bot 46/46 on the built page; tBot 4 seeds: Frankfurt 4/4 nav + race pass, Athens 2/4 nav pass (both races finish, 5/5 gates), every scenario 17-38 s wall, 0 JS errors.
4. Left (route to Athens roads lane, cells in the report): enclosed pocket 1500,-2900 (graph path into a courtyard), lost leg 1400,-2400, recovery needs 4 s unbroken gas; no game code was changed (no clear small bug).
5. Not repeatable bit-for-bit: waypoints and `Math.random` are seeded, wall-clock game logic is not.
