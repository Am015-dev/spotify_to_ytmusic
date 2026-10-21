# HANDOFF sidequest-optin-r22q
Classification (grep of 41_career_quests, 70/71 roam, 80/81 story):
- AUTO-START (now behind `QV_AUTO`, default OFF, `?quests=auto` restores): `qvTick` ambient "?" side-quest spawner/dropper (`qvSpawn`: stranded/NPC-help/delivery/chase/ambush-twist events) and `qvEncLoad` (saved ambient markers).
- PLAYER-STARTED (unchanged): stopping on a static mark (`roamMarks` → `roamOpen` card → `chStart`), map/journal picks, story marks (`qvSqInit`, M1/M2/M3), "Part k/n · meet me in" after the player finished a part, ambush/rival/NPC lines inside a started quest, M1 hot-drop first-run tutorial (`M1.auto`, fresh save only).
- Discoverability: static event/story marks + map pins/journal stay; no popup.
- GO `quests/optin` (src/99qo_optin.js, hooked in BOT_rows): 3600 sim frames of driving, 0 dyn quests / quest / card / NPC popup in fra+ath; hand-started quest runs step 0. Gate: unit 0 FAIL, TAG=ui1,life1,xf1,terrain,bot built page: only `bot/nav#1` ath fails (also on untouched trunk) and one terrain-tyre flake (passes on rerun).
