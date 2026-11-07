# Redline Rally HANDOFF (W331)

Playable: title (track, laps, 1-5 rivals, pass-and-play 1-3 humans, easy/normal/hard), full round loop with animated cars on a top-down 2D track (follow camera, minimap, lanes), corner preview line ("Speed 9: corner burns 3 heat" / "you would spin out"), slipstream prompt, boost, Suggest button, result screen.

Files: `src/` (data, track geometry, engine, ai, art loader, ui, scn), `build.py` -> `redline-rally.html`, `gen-assets.py` (assets.json, ASSETS.md, Flow prompts, track guides), `rules-test.js` (headless), `smoke.js` (real taps, phone + PC), `register-assets.py` (run once at merge: adds rows to next-wave/expected-assets.json).

Tests run: rules-test 240 AI games all finish, 0 invariant failures; smoke.js PASS on 390x763 and 1440x860 (0 console errors); `build-all.py --quick redline-rally`: all own scenarios (menu, rr-board, rr-corner, rr-result) and ui-audit pass; the 3 visual.spec tests (title/menu/board) FAIL only because no owner-approved baselines exist yet (`build-all.py --approve-visual redline-rally` is the owner's step, I did not run it). Asset loader proven with 3 dummy files (removed). Local setup note: games-src/node_modules needed `npm install` and `@playwright/test@1.63.0 --no-save` to match /opt/pw-browsers.

Art: 40 named slots in `assets.json` (wave 1: 18, wave 2: 13, wave 3: 9). `media/<stem>.webp` is picked up at build time. Check wiring list in ASSETS.md. Not wired yet: `card-upgrade-back-*`, `icon-stress`, `icon-gear`, `icon-lap`, `icon-place`, `ui-engine-tray` (slots reserved; nothing in the base rules shows them).

Next: upgrade cards, weather and legends, sound, online, a second pass on AI (drivers behave alike), real rulebook cross-check (see rules-notes "guessed"), ghost-finger tip, campaign. `asset-registry.py` only supports Nightrun, so it was not run.
