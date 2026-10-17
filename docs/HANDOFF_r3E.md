# HANDOFF r3E (lane E2, done)
1. Builder: START seed + baseplate grid + GO rv2k3/builder (module moved before 99_api in src/ORDER so the GO exists; the GO hands #hud/#touch back after BX_open). Shot builder.jpg shows terrain, grid, START.
2. Athens green sphere = the LIFE pop-up bubble (AIR TIME, src/assets/lx/code.js): now a flat coloured ground ring, no floating sphere. Shot athens_start.jpg.
3. Hint reads "HIT FAST = SMASH"; the hint now counts real smashes (SM2_smash true: >= 45 km/h or boost) as well as tap-smashes. Shot hint.jpg.
4. hudstack1/stack: GO keeps the mission card and all panels closed while measuring (a warm page opened the card within 1 s and hid the hint/pop). Gates on the built page: unit 0 FAIL; builder+hudstack1+hudctl+tiny+garage-car 5/5; life1+xf1+terrain 42/42 (xf1/grass failed once in one batch, passed solo and on rerun).
5. Left: garage ride cards are two-line but the rarity tag still clips ("SUPER ...", "AWES..."); shots in docs/shots/r3E/.
