W206 boss strips: attack / hit / idle / defeat (flag `bossart`, `?bossart=0` = before).
Shots: stage-1 boss (the eagle) in its attack strip, phone 390x763 and PC 1440x860 (WebP q82). They were taken through the LAB boss deep link (`?boss=`), so the LAB header and test grid are visible; they show the boss art, not a normal-play frame.
Comparison with a boss frame of a well-regarded modern side-scrolling shoot-'em-up: no reference URL was verified in this session, so none is given here (repo benchmark/flight holds only normal-play frames). Owner: please paste the URL you want us measured against.

## game-look "Check before reporting" (honest, from the one pair above; both shots are LAB frames, not normal play, and I did not run the impeccable critique/colorize passes: this task changes boss animation state only, not colour or layout)
- SHIPS: the boss now uses all four owner states (idle, attack, hit, defeat) and never holds one frame. Still sloppy: the eagle is small next to the screen (about 1/6 of the PC play height) and its outline and pixel density do not match the backdrop; hit is the 0.34 s strip plus the existing white flash, longer than the 0.1 s the skill asks for. Not changed.
- BULLETS: not touched. In the shot the boss shots are plain round dots, not distinct per attack. Needs its own task.
- ENVIRONMENT: not touched. The PC shot shows a flat test grid over the scene (LAB overlay); the backdrop plane looks as bright as the boss. Most of this still looks pasted.
- FEEL: attack now reads as an attack and a hit reads as a hit (probe: attack on every wind-up and shot, hit within 1 frame). Not judged by eye in real-time play; the owner's play is the test. Explosion after defeat is unchanged.
