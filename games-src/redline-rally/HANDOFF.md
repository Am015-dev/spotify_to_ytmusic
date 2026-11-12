# Redline Rally HANDOFF (W331)

Playable: title (track, laps, 1-5 rivals, pass-and-play 1-3 humans, easy/normal/hard), full round loop with animated cars on a top-down 2D track (follow camera, minimap, lanes), corner preview line ("Speed 9: corner burns 3 heat" / "you would spin out"), slipstream prompt, boost, Suggest button, result screen.

Files: `src/` (data, track geometry, engine, ai, art loader, ui, scn), `build.py` -> `redline-rally.html`, `gen-assets.py` (assets.json, ASSETS.md, Flow prompts, track guides), `rules-test.js` (headless), `smoke.js` (real taps, phone + PC), `register-assets.py` (run once at merge: adds rows to next-wave/expected-assets.json).

Tests run: rules-test 240 AI games all finish, 0 invariant failures; smoke.js PASS on 390x763 and 1440x860 (0 console errors); `build-all.py --quick redline-rally`: all own scenarios (menu, rr-board, rr-corner, rr-result) and ui-audit pass; the 3 visual.spec tests (title/menu/board) FAIL only because no owner-approved baselines exist yet (`build-all.py --approve-visual redline-rally` is the owner's step, I did not run it). Asset loader proven with 3 dummy files (removed). Local setup note: games-src/node_modules needed `npm install` and `@playwright/test@1.63.0 --no-save` to match /opt/pw-browsers.

Art: 40 named slots in `assets.json` (wave 1: 18, wave 2: 13, wave 3: 9). `media/<stem>.webp` is picked up at build time. Check wiring list in ASSETS.md. Not wired yet: `card-upgrade-back-*`, `icon-stress`, `icon-gear`, `icon-lap`, `icon-place`, `ui-engine-tray` (slots reserved; nothing in the base rules shows them).

Next: upgrade cards, weather and legends, sound, online, a second pass on AI (drivers behave alike), real rulebook cross-check (see rules-notes "guessed"), ghost-finger tip, campaign. `asset-registry.py` only supports Nightrun, so it was not run.

## W424 (branch shelf/W424-redline)
- Rules: starting upgrades (house values), cooldown in the React step, weather (house), Harbour Ring track, 3-track championship (house points). 23 rules cases in rules-test.js; list in RULES-COVERAGE.md.
- Race feel (src/race.js): start lights, speedometer + gear lever + heat gauge, live leaderboard, spin red flash + skids + shake, space-by-space moves with ticks, podium, engine/skid/beep sounds.
- Addendum 5: phase strip (Shift Play Move React Discard) + round/lap/deck/discard in the dock head; on-track preview (path, ghost car, corner colours, heat cost / SPIN, slipstream likely); reason pops ("-2 heat: 7 in a 5"); one-line round rating in the banner vs the computer's best play.
- Tests: champ-test.js (championship to a champion), shoot-v3.js (v3 shots). Visual baselines (title/menu/board) still need the owner's --approve-visual.
- Addendum 7: Play (default) is clean: board, hand, tracker (phase strip + round/lap/deck), one score line ("You 2nd of 5 · Kit leads by 3", tap = why), Goal card before turn 1. Hints toggle (top bar, off by default, saved in rr_hints) brings back the track preview, corner warnings, round rating, leaderboard, Suggest, the bulb and the engine tray. Learn to play = the coached game (Hints forced on there). Scenario rr-play checks the clean screen.

## W475 (branch shelf/W475-redline-feel): race-feel check against BRIEF-GAMEFEEL
- Fixed: speedometer read 0 while planning (now revs to the planned speed as you tap cards); gear lever ignored the gear you
  pick (now follows it and slides through the H-gate); rival turn said "Oto is up" twice; on-track pops vanished in 1.5 s and
  stacked (now one at a time, hold 3 s + 1 s fade); no vibrate tick (card/gear/boost/spin/lights buzz via navigator.vibrate);
  13px text on phone (all now 14px; card labels kept on one line); tap outside no longer closes locked cards (Goal, Learn intro).
- Learn to play: first tutor step 'How you win' (cross the line first after one lap + 3 short points, Next). Cards step
  targets two real cards (tutCard), so taps on the highlight land and the tutorial finishes by touch with no Skip.
- Feel gate (feel-audit.js --secs 120 on the local build): (a)-(e) all 0; Learn ends at the result on phone and PC, 0 skips.
  Long coach/rules lines split to <= 12 words.
- shoot-feel.js: whole race by touch (390x844) and mouse (1440x900), shots in playable-shots/feel/, small-text check after 10 turns.
- r2-test.js guide check expects the old 7-step tutorial (replaced in 3154a433): stale before W475, left as is.
- Phone dock: the merged shell capped it at 44dvh, which pushed Go below the screen in Learn to play at 390x763; the dock now
  takes up to 62dvh in portrait (head.html).
- Still open: visual baselines need the owner's --approve-visual; cars are small on phone (camera zoom), lights overlay sits on
  the board while turn 1 is already playable.

## W475 round 2 (shelf/W475-redline-r2): reviewer R9 fixes
- PC 1440x900: board fills the width; gears, hand and Go are one bottom dock (head.html, min-width 1000px).
- Camera close (cam.s 0.75-1.3, cars ~70-100 px). sceneryLayer() in race.js: grass, trees, tents, stands, run-off sand and
  tyre walls in the track art's flat style, drawn over the art with the road cut out.
- Title: Quick game options collapsed everywhere; bg-title scaled 6% past cover so its white side bars fall off (titleBg).
- Phone: bigger cards (13.8vw, slight overlap), Go is the big button, Boost/Swap small beside it.
- Drag a card up to play it (lift, glow, drop zone, snap); tap still works. drag-test.js covers touch and mouse.

## W475 polish (shelf/W475-redline-polish)
- Scenery repainted (race.js sceneryLayer): lit grass with brush dabs, layered tree canopies with soft cast shadows,
  gradient tents, shaded stands, raked sand and tyre walls. No owner art exists for this game (assets-inbox has none).
  Road cut-out now uses an opaque stroke (a translucent stroke left the road tinted).
- PC gears: disabled gears stay readable (dashed, #9aa7bd); name tag is a dark pill ahead of the car in its lane, drawn last.
- drag-test.js: real CDP touch drag + real mouse drag; asserts lift (scale), gold glow, drop zone, snap class, play; tap works.
- tut-test.js: waits 700 ms before forced-step taps (the shell now ignores taps in a step's first 600 ms).

## W496 fix round (shelf/W496-redline-gameplay): reviewer G5 (4.0 FAIL, stopper)
- Stopper: tutorial questions (boost, slipstream, discard) that the current step does not teach are never shown (ui.js askBoost/askSlip/askDiscard);
  answered questions leave the screen at once. tut-test.js watches for question buttons that stay visible but untappable (dead taps).
- Rules: computer cars commit gear and cards in startResolve (simultaneous, face down, start-of-round board); boost decided in their own react
  step (ai.js aiBoost). logic-test R70-R72; RULES-CHECKLIST 69-70.
- Pacing: rival turns ~1 s (UI.rival scales waits/tweens; shift/cool/done steps only update the HUD); tap = faster still. Discard step keeps all after 5 s.
- Difficulty: Easy is the default; easy rivals never use gear 4 or boost and are heat-shy. Suggest always plans at hard strength.
  Sim (200 races, 5 cars, 2 laps): careful newcomer bot podium 67% on easy, following Suggest 75%; normal/hard unchanged.
- Small screens: top bar fits 375 (pill words hidden < 390), pops drawn in screen space inside the board and clear of the minimap,
  opaque minimap, start lights a small strip top-left on short boards, podium title on a dark plate, place-aware losing line.
- Tutorial spin-out: the Stress card now shows in hand; the stall uses it as the one playable card. race-touch.js = full default race by touch.

## W496 round 4 (R9 re-review 4.0 FAIL fixes)
- Rules: boost toggle removed; boost is asked after the reveal every turn with 1+ engine heat ("No boost" default after 2.5 s,
  "risky" tag, Suggested mark with Hints). Discard step offered every round (no slow-card / every-third-round gate), nothing
  pre-selected, "Keep all" default after 2.5 s. Wording quoted in rules-notes.md. Logic R73-R75.
- Tutorial: discard any non-Heat/Stress card, boost question after the reveal (as raced), Brake/Burst line.
- Easy rivals slower (ai.js AIP.easy): sim plain newcomer who boosts at 5+ heat avg 2.6-2.7, podium ~78%.
- Board: last round's pops cleared when you plan; one preview label ("safe · slip +2"); round rating banner left of the minimap.
- race-touch.js: plain player = sim-levels D (biggest cards, gear down near corners, boost at 5+ heat); gate counts skip taps.
- r2: 375 board has no dashboard (gear, heat, next corner in the dock line, race.js dashOff); 1.5 s defaults, tap-anywhere;
  ?seed= now seeds the game. Touch placings: 390 seeds 11/21-24: 1,2,2,3,3; 375: 5,1,4,3. Go->next ~10 s in the test.

## W496 round 5 (R19 re-review 6.8 FAIL fixes)
- Planning camera (ui.js planFrame): frames your car, the next corner sign and the move preview; zooms out as far as needed
  (grass beyond the board), the next corner sign keeps a readable size and pulses gold.
- No timers: boost and discard questions wait for a tap (qTimer is a no-op). Boost is offered even when any flip spins you
  ("spins you" tag); line says "flip to the next speed card".
- Waits: rivals ~0.7 s each (UI.rival 0.16), own turn pace 0.38. newcomer-touch.js: tap->next decision avg 1.3 s, max <= 4 s.
- Easy rivals gentler (AIP.easy noise 10, mis 0.8/5, lift 0.97): sim plain newcomer vs 4 Easy win 65%, podium 99%.
  Normal/Hard unchanged; ladder order holds.
- Plan line: "Corner 5 in 4: speed 5 or less is safe." (planAdvice); hints off still shows corner burn / spin.
- Podium line fits the race (spins / heat / shift sooner); 375 result card compact (no scrolling under the buttons).
- Tests: newcomer-touch.js (R19 gate, shots in playable-shots/r19/), tut-test.js now counts ignored taps.
