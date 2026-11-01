# HANDOFF W295 (copy audit and fixes, 31 Oct 2026)
Branch nr/W295-copy. Audit: COPY-AUDIT-2026-10-31.md. Test: qa/copy-test.js (14 PASS lines at 390x763 and 1440x860). Extractor: qa/copy-extract.py.
Done: 21 string edits (list in the audit): German UI words WARNUNG, SCHICHT, SEKTOR FREI, Kurierflug, KURIER ABGESTÜRZT now English; owner test checklist button and "owner test list" hub row no longer reach players (`?chk=1` brings the button back); PLACEHOLDER tag, TAP TEST, Test flight reworded; raw numbers explained (Neon, you:); 10 UNTESTABLE settings sentences reworded to what the setting does or removed; boss warning chip 17 px (floor 16), size constants only in render/calm.js (W291 owns placement).
Checks run after the change: copy-test, claims-check (PASS all), flow-test and gauntlet-shell (no FAIL lines; only PASS lines hidden by my filter). hub-test.js: expectations edited (checklist door removed, nth-child shifted) but NOT run: it crashed on start here (own server setup). g-checks.js and asset-coverage.js still click the checklist button: they need `?chk=1`.
Not fixed (looked at the shots, 390x763):
1. Story card: an achievement toast ("BRONZE ACHIEVEMENT Short and ...") and the "Saved" toast sit over the card's "tap to continue" and cut the text. Layout, not copy: needs the toast to wait while a card is open.
2. The b.js boss warning ("WARNING · <boss> · sub") was not reached in the capture (only the carrier warning); its fallback to the boss name is untested.
3. Game over repeats "Stage 1 failed" above COURIER DOWN; "Reached 1 · FIRST RUN" says no "stage".
4. Settings rows without a description (FPS cap, Ducking, Music reacts) stay label-only; "Ducking" is jargon.
5. Static list is a heuristic (3028 literals, many in lab/ developer tools); the runtime capture is what players reach, but lab/ screens were not captured.
