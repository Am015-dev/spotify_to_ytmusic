# W309 street boss duel part 4 (branch nr/W309-duel4), 31 Oct 2026. Not deployed. Verdict: PC late, phone late and PC duelist in band at the final constants; rest of the matrix NOT RUN (over the 45 min limit).
Done: late bot spread 600 +-150 ms (qa/gauntlet-foot.js); streetboss.js: GRACE .28, TGRACE .09, HPK 8, new enrage at half hp (ENR .8, telegraphs 0.8x). Numbers: BALANCE-W309.md.
Numbers (8 seeds, boss only, real input): PC late 4/8, phone late 2/8, PC duelist 7/8. streetsim RUNS=40: gfirst 85, idle 0, nearest 28, still-foes 11.8 (all gates hold).
Wrong / open: duelist loses 0-1 hearts and the boss lasts ~70 s, not 2-3 min / 1-3 hearts. 844x390 matrix, phone duelist, dodger/idle/masher/random, full stage from the title, foot-test.js landscape STREET CLEAR: all NOT RUN at the final constants. PC late at 50% is the top of its band.
Next: run phone duelist + 844x390 late/duelist + weak bots at 4 seeds on this build; if duelist must lose more hearts, raise ENR strength (.75) only together with TGRACE and re-check streetsim nearest.
Files: parts/street/streetboss.js, qa/gauntlet-foot.js, BALANCE-W309.md, HANDOFF-W309.md. Logs (not committed): /tmp/w309/.
