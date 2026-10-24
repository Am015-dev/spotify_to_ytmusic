# W193 on-foot sound set (flag RET.footsfx, ?footsfx=0 = old sounds)
Part: parts/audio/footsfx.js (appended in build.py after soundlab.js). Global `FTX` (not FSX: that is the fullscreen module).
- 13 synthesized sounds, 3 tone variants each (never the same twice in a row), min gap per sound, 8 voices max (oldest faded out), own bus -> limiter -> trim -> AU.sfxv. The song path is never touched.
- One Lab row each (group ON FOOT, default on): f_pistol f_smg f_shotgun f_rocket f_swish f_knifehit f_finisher f_impact f_foehurt f_foedeath f_kaihurt f_block f_pickup. Lab PLAY works (soundlab.js).
- While footsfx is on the old on-foot shot / hit / pick / hurt / graze sounds are replaced (foot.js sfx() asks FTX.owns); pick -> f_pickup, hurt -> f_kaihurt.
- Events: foot.js (fire, melee swing + hit, dmgE hurt/death, ftHurt block), streetmelee.js (finisher). Named hooks for later: FTX.guard() (W192 guard button), FTX.kick(), FTX.punch().
- Not done: footstep ticks (optional, skipped), flame / arc weapons have no shot sound (not asked for), kick / punch have no in-game trigger yet (no such move in this build; hooks only).
- Gates (qa/footsfx-test.js): 13 rows; every weapon 3 variants >= 2.3 dB apart; 60 s offline, 404 sounds: sfx peak -9.0 dB under the song peak; live 220 calls over a playing song: 0 calls on the song's gain / filter params, <= 8 voices.
- qa/soundlab-test.js expectations updated (27 ON FOOT rows, the old-gate block runs with footsfx off).
- Owner to judge by ear: levels (BUSG .12, trim .7 in footsfx.js) and tone.
