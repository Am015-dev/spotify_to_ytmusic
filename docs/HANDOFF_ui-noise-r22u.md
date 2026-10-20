# HANDOFF ui-noise-r22u
- NEW src/99ui_noise.js (ORDER before 99_api.js): popup governor wrapping say()/npcSay() in roam: 1 non-essential popup per 60 s, none above 40 km/h (queued, shown after 1.5 s under 40, dropped after 20 s), same text once per 180 s; race/rescue/crash/wrong-way/results always pass. `?dbg=1` or `?uig=0` = off.
- Tutorial card (src/70_roam_world.js tutStep): hidden above 40 km/h, auto-advance 6 s (was 25 s); stays first-run only (mho_roam.tut); `?dbg=1` unchanged.
- GO ui1/governor (registered by the module when the lazy checklist chunk appears; state asserts, 7 checks, pass line "📍 ui1/governor ✅ PASS").
- NOTE: modules ordered AFTER 99_api.js in src/ORDER and not in src/LAZY land after `</script>` and never run (99c8_sfxhit.js is one). New modules go BEFORE 99_api.js.
- Left: story cards, top line merge, minimap size, rotate hint, DRIFT HERE (review items 3-8) not done.
