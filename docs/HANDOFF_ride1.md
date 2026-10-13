# ride-1 handoff (2026-10-13)
- Alex's "not a car" = Frankfurt traffic Big Rig v3221_1 (red cab / blue trailer): rendered as a hollow open box, cab missing, front wheel sunk.
- Fix: dropped 'truck':'ld:truck:v3221_1' from CT_SWAP.fra (src/98ct_city_lego.js); the slot falls back to the procedural truck. Model file kept.
- Checklist v90k/no-hollow added (auto: HCAR has no ld:truck:v3221_1). Build v90k --local OK.
- LEFT: (1) one-pass grid of the 21 v90j rides (none flagged yet); (2) run the HCAR check headless (playwright require from /tmp failed: run the script from the repo dir); (3) GO button for the new item; (4) repair v3221_1 conversion.
