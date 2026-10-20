# roads-r21e scan scripts (need a one-line debug export, not in the game)
Add before the final `({BOT_go,...})` line of src/99c8_bot.js, then tools/build.sh <ver> and serve out/<ver> (python3 -m http.server 8813):
`window.__botG={BOT_leg,BOT_rec,roamWarp,rfSnap,RO,roamHit,navPath,groundY,groundAt,roamTerr,roamFree,HUB};`
- dump.js <fra|ath> out.json: node list; scc.js out.json: strongly connected components (Athens: 47, 46 isolated islands, 1830 nodes); path.js out.json x0 z0 x1 z1: directed route.
- multi.js <city> <seeds> [base]: nav seeds on ONE page with trace of failing legs; hairs.js <city> <max> out.json: drives every dead-end U-turn link (Athens: 198 links, 29 fail); replay.js: replays one leg from a warp.
Paths in the scripts point at a scratch dir; adjust.
