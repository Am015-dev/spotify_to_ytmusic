# HANDOFF pill1 (2026-10-17) — NOT green, on branch alex/pill1-wip
- Pill: CR_hud (src/93_cars_lego.js) no longer copies the arrow's marker name/distance into the top pill (.crD) while #roamPrompt is visible, so the pill shows only the STORY objective. Not looked at in a shot (no 852×393 shot taken).
- GO hudstack1/stack (src/99ui_hud.js HUDSTACK_go): resets card/prompt/pop/map/ch/sprint/lively popup/cooldown at start and retries the layout read up to 8×250 ms.
- Unit 0 FAIL. TAG=hudstack1,rv2k2/hudctl,rv2k/card passed 3/3 on two runs, but the final clean build failed hudstack1/stack ("cards shown:" empty) in the 3-tag run and in two combined runs. A debug build that only appended a state string to the GO message passed 7/7 combined/alone; cause unknown, so the reset is not proven.
- rv2k2/burst fails about half of the combined runs (passes alone); not checked on the untouched base. rv2k2/akro/close fail intermittently too.
- Left: find why no card shows in the failing runs (log RO.pm/pmT/ph in a failing run), take the shot, then push to alex/od-int2.
