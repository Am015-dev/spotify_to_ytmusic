# HANDOFF traffic (rv4B -> trunk)
- Landed alex/rv4B-wip (1acd73c: Athens traffic fixes, AYD_clear behind window.OD_AYDCLR=false) on alex/od-int2 by fast-forward (rv4B already contained trunk 9c43c09).
- Unit 0 FAIL. rv2k2 x2 on both builds: close red on trunk too (1/2 trunk, 2/2 rv4B: gap 88-94 m vs trunk 2054 m "did not finish", flaky both ways), pace#1 red on both; akro red once in batch on rv4B only, 3/3 green solo on rv4B and trunk (load flake).
- Gate TAG=rv2k2,ath-traf,life1,xf1,terrain: rv4B-only reds burst, xf1/assist both green solo on rv4B and trunk; remaining reds are the known trunk flakes (xf1/*, life1/*, terr1/*, SLOW under load).
- No bisect needed; c.yo sidestep not implicated.
- Left: rv2k2/close and pace#1 are trunk baseline reds; not caused by rv4B.
