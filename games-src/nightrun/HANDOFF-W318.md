# W318 (branch nr/W318-pace from nr/W316-street)
Done: street3.js: cleared street (camera at stop, no foe 8 s) pulls the next wave forward; boss gate also opens at 2 s clear when no wave is left. Clock stays the upper bound. Idle still 0 clears.
Numbers: BALANCE-W318.md. streetsim 40: nearest 25, gfirst 85, dodge 70, idle 0 (gates met). Phone duelist 6/6 reach+clear (was 4/6). PC duelist 3/6 (was 5/6).
Wrong: PC reach/clear below W316; boss only ~10 s earlier. The literal rule (boss at once when clear) makes the street ~45 s and clears 100% in the sim: do not use it unless the owner wants a short street.
Next: rerun the old build on PC with 6 seeds to see if 5/6 was noise; if so keep this, else try the gap 10-12 s or a heal on the pull. Run the screenshots, streetsong/streetdraw/footvis tests. Do not deploy before.
Files: parts/street/street3.js, BALANCE-W318.md, HANDOFF-W318.md.
