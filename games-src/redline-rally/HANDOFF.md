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
