# W313 (branch nr/W313-duel5 from nr/W309-duel4). Measurement only; no code or constant changed. Numbers: BALANCE-W313.md.
Done: boss-only matrix at the final constants, full stage from the title (24 runs), foot-test.js run. Logs (not committed): /tmp/w313/.
Numbers: 844x390 late 5/8, duelist 8/8; phone duelist 8/8; masher/random/idle 0/4 everywhere; dodger PC 4/4 and 844x390 4/4 (FAIL, band <= 20%), phone 0/4. Full stage: PC duelist 3/6, PC late 0/6, phone duelist 0/6, phone late 0/6.
Wrong: (1) dodger over band on PC and 844x390; constants left alone because every lever also drops late, already above band at 844x390 (62%). Owner/orchestrator decide: make the bot less reactive, or tighten GRACE together with ENR and re-check streetsim nearest 25-40%. (2) The street before the boss kills duelist/late bots (phone 0/6 reach the boss): the full stage is not playable for them; that is the real "sellable" blocker. (3) foot-test.js landscape audit: fBomb / fGuard overlap; pause toggle and stats checks fail.
Not run: re-measure of PC late, phone late, PC duelist (W309 numbers used); streetsim.
Files: BALANCE-W313.md, HANDOFF-W313.md. Ran past the 45 min limit.
