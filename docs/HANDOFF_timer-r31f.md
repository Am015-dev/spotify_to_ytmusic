# timer-r31f: race timer back under og3 OFF (REVIEW_2K_47)
- Fix: src/40_hud_input_menu.js updHud writes #tRace again, guarded by `if(!OG3)`, so og3 OFF shows the race time; og3 ON keeps the kit's #hkTime.
- GO race/timer (src/99crm_racemode_go.js): race starts, after ~6 s the timer is not 00:00.0 and grew. Measured on built page, phone profile: fra+ath OFF PASS, og3 ON PASS.
- Also: race/one-speedo PASS OFF+ON (fra 23/23, ath 19/19); unit 0 FAIL (5022 pass, 13 known); gate TAG=life1,xf1,terrain 42/42 PASS (OFF). Not measured: GO on the pre-fix build (expected FAIL from the code read).
