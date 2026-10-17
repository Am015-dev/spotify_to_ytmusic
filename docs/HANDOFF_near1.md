# HANDOFF near-1 (2026-10-17): activities near the Frankfurt start
1. Added two existing-type activities near the start: cl3 "Stud Rush: Bankenviertel" (collect, 51 m) and sm3 "Brick Smash: Taunusanlage" (smash, 142 m). Data only: OTG entries in src/41_career_quests.js, chapter-1 gate in OCH (src/71_roam_drive.js), spots in src/02_data_json.html.
2. Measured (built tree): rv2k2/near PASS (4 within 400 m: cl3, garage, sm3, cl1; nearest 51 m); v90o/mark-road PASS (both on a road); unit 0 FAIL; limit still 4.
3. Athens already has 4 within 400 m of its start (garage, flight, atc_koulouri 252 m, e_bricks 372 m), so nothing added there; the near GO only checks Frankfurt.
4. life1,xf1,terrain: 41/42; life1/ath-density fails 59/60 windows identically on the untouched base build (not from this change).
5. Shot: docs/shots/near1_start_fra.png. Left: ath-density 59/60; a minimap close-up of the new pins.
