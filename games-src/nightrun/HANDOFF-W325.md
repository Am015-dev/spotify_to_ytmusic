# HANDOFF W325: casual street constants (branch nr/W325-casual, from nr/W319-rc, not deployed)
Changed (constants only): streetboss.js HPK 8 -> 7, ENR .8 -> .9; street3.js:47 clear-gap 8 -> 10 s. GRACE/TGRACE untouched.
streetsim RUNS=40: nearest 25 (band 25-40, lower edge), gfirst 90, dodge 73 (upper edge of 65+-8), idle 0, still-foes 16.9. Details: BALANCE-W325.md.
Real input: duelist PC 4/4, masher PC 0/4 OK. Boss-only late PC 4/6 (above the 20-50 band, W313 was 4/8) and phone 3/6: NOT in band on PC, 6 seeds are noisy. Full stage late: 5/6 cleared (was 1/6).
Caveats: nearest and dodge sit at band edges. HPK 7 did nothing in streetsim (casual bot dies in the street, 29/40); if the boss feels too easy, HPK 8 back is likely free for the casual bot but not measured. 844x390 and PC masher beyond 4 seeds not run.
