# HANDOFF r8a (shortcut scan)
- src/98dest_destruct.js DEST_find: nodes scanned nearest the player first (sorted once), each passing candidate published at once (DEST.sc grows, DEST_mark adds arrows to one group), 250 m spacing and cap 9 kept.
- Scan ends (DEST.done) at 9 or all nodes covered and frees its tables; DEST_step stops calling it. Callers that waited for `DEST.sc` now wait for `DEST.done` (98dest_go.js, tools/dest/shots.js).
- GO rev5fix/dest-sc-time (99c7_rev5fix.js): Athens 9 shortcuts after 38 s of steps (3rd at 25 s), all pass DEST_open, scan idle once done. Before: sc null at 300 s (670/22,700 nodes). dest/shortcut green in both cities.
- Gate: unit 0 FAIL; TAG=life1,xf1,terrain only known reds (xf1/*, terr1 tyre SLOW). Not deployed, no changelog.
- Left: shortcuts are first-found, not best-ranked; 4 of 9 are dropped by the 350 m re-check (streamed tiles), so ~5 usable per city.
