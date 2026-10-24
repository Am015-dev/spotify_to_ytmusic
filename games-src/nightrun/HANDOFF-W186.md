# W186 boss pound fix + HUD off the floor: handoff (24 Oct 2026, stopped at the 45 min limit)
Branch nr/W186-pound, flag ?pound2=1 (OFF by default until the gates below pass).
DONE: streetboss.js holds the boss's depth line for the pound (red dotted line, wave only on that line) and the leap (red ring, 0.8 s wind-up).
  qa/streetsim.js bots now jump the pound line and leave the leap ring. bossprobe (RUNS=50, Q=&pound2=1 needed now that the default is off):
  dodge bot pound/leap 100%, charge 97%, throw 100%; nearest bot pound 81%, leap 75%, charge 91%; fight median 65-71 s.
  streetlook.js: with the flag, boss bar and progress bar are drawn in the HUD stack under the hint line (progress bar hidden-by-replacement during the boss).
NOT DONE:
 1. qa/pound2-test.js never reached the boss (0 boss steps): teleporting Kai to S.st.boss.x-420 does not start it. Fix the setup (set S.camX / walk right with the ctl bot), run with Q='&pound2=1', then check 0 HUD rects over the band at 390x763 and 1440x860.
 2. Remove the "HEAL" label under pickups (streetlook.js, the fairstreet branch that does fillText(d.n, ...)) under the flag.
 3. Look at phone and PC screenshots of the boss fight (not committed).
 4. E1/E3 chore: log e.tele on the gunner charge state over 50 runs, gap from tele start to bullet spawn (street2.js:56); fix if < 0.4 s.
 5. Full streetsim gates flag on/off (the bot change also shifts casual clear rates), guard.py, one smoke, simhunt; then flip the default on.
