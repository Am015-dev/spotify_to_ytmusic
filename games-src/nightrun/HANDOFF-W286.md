# W286 final check (branch nr/W286-final from nr/W285-deployable), 30 Oct 2026. Not deployed. Verdict: DO NOT SHIP
Logs and shots (not committed): /tmp/claude-0/-home-user-spotify-to-ytmusic/6c9bd49e-2dc3-5841-95e9-cfd53638cb70/scratchpad/ (b0 = before shots, b3 = after shots at 390x763 / 844x390 / 1440x860, g/foot and g/fph, g/fpc = street and flight shots, g/smoke = smoke logs, chk = gate logs).
Full table: RELEASE-CHECK-2026-10-30.md.
## Code changed
streetlook.js slHud: boss name bar is one thin bar (18u), placed in the free top row on short wide screens (L.hud.bar exposes it), else under the panel with the hint line below it. purefoot.js: boss draw scale floor 0.88 (was 0.45), draw only. qa/bossbar-layout-test.js reads the bar from L.hud.bar.
## Shots looked at, ranked by what a new player notices first
1. Phone flight boss warning (g/fph/phone-shooter-1-boss1.png): the HUD strip and the thin 'WARNUNG' text are small; the boss is not yet visible. German word in an English game.
2. Phone street: the boss hint line (GUARD...) and bar sit over the vending machine and head area for the first seconds; readable, slightly crowded.
3. Street result (PC): the dark overlay hides the whole scene; fine, but the boss is not shown.
4. Not taken: title, pause, 844x390 results.
## Next
Phone balance for the street boss and flight dodging (one task each, sonnet); take the missing shots; regenerate fingerprint hashes only after looking at all 8 scenes.
