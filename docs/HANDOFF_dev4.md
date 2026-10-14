# HANDOFF dev-4 (small bugs + GO fixes) — alex/od-dev4, merged into alex/od-int2 (last push 1f88c7f)

## Done (all with a GO item in src/99c_checklist.js, ver v90k)
- GO fixes: shadow (car:'' target), palms (says its race), park-sit (exits car), Athens chip skips Frankfurt-only items (cityOnly in pinItems), bigrig retired.
- Ramp seam: no grass median within 70 m of a motorway-ramp start (90_fixes_cv_ju.js CV_streets, CV.medP) → ramp-seam.
- WRONG WAY banner hides over roamCard/chRes/spRes/npcSay/m1Cs (70_roam_world.js raceHud) → ww-card.
- rv tests: kerb-park, ped-gap (rule already right), ath-flip (sync 10 seeds, not reproducible), sky-tower (Messeturm grounded).
- Hollow ride audit of all 159 rides: only the Sightseeing Bus (t_bus, also city traffic bus) was an empty open-top frame → roof added in 98bc_bigcars.js BC_bus → hollow-bus (roof 69→98 %). CK_pit() in 99c is the top-view height-map helper.
- Portrait STORY pill (#m1Next, CSS in 93_cars_lego.js): ellipsis inside the box → pill-fit.
- District collectible OG.imC = solid LEGO brick (85_audio_feel_sp_otg.js) → lego-col.
- art1/road-gap 4.9 s and ath-flip 4.7 s as synchronous state asserts; tools/tChkGo.js: ❌ = FAIL, waits for slow GOs, warms first draw.
- swoosh GO (guard only): not reproducible on int2.

## Live audit of beta.19 (tools/tGo.sh): 288/304, 0 console errors (only benign music/menu.mp3 abort)
Ranked: 1) boot time on Pages fra 66 s / ath 83 s (v90m/ath-boot ❌; hot-1 owns it). 2) park-sit failed on live only, passes on od-int2. 3) road-gap/ath-flip slow flags, fixed on od-int2. Race → Cliff Run starts, 0 errors.

## Open / next
- Network boot size (hot-1). Ghost/green blob and the green studded plate across junctions (road-gap family) belong to art-1/dev-5.
- 12 bx-* GO items are spawn-only; laps need tools/bx/tTracks.js.
- Lane-only GO: `TAG=v90k/hollow-bus,v90k/pill-fit,... node tools/tChkGo.js <url> <out>`.
