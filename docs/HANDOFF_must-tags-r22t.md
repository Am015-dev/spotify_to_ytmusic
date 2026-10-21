# HANDOFF must-tags-r22t
- Tagged player-tap feedback {must:1} so the popup governor never gates it: "📍 PIN SET" (src/41_career_quests.js ~321), "ROUTE SET" in M1_nextGo (src/80_story_m1.js ~286) and in roamGo (src/71_roam_drive.js ~239).
- GO ui1/governor +1 check (src/99ui_noise.js, the GO lives there, not in 99c_checklist.js): tagged "PIN SET" say at 100 km/h shows at once, queue untouched.
- Gate (built out/uin3): unit 0 FAIL (5100 pass, 13 known); TAG=ui1,life1,xf1,terrain 44/44 PASS, 0 errors, fra + ath.
- Left: ROUTE/PIN CLEARED/OUTSIDE/NO ROAD and other untagged tap hints stay governed (see HANDOFF_ui-noise-r22u.md).
