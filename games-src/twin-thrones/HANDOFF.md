# Twin Thrones handoff (W333)

State: playable start to finish (vs computer easy/normal/hard, two players on one device, watch). Not deployed.
Files: `src/` data, engine, ai, ui, art loader, head/body; `build.py`; `gen-assets.js` (makes assets.json, ASSETS.md and the Flow prompt files); `rules-test.js`; `smoke.js`.
Rebuild: `python3 build.py`. Tests: `node rules-test.js 300`, `node smoke.js` (NODE_PATH=/opt/node-tools/node_modules). Gate: `python3 games-src/scripts/build-all.py --quick twin-thrones`.

Art: every picture is a slot named in `assets.json` (126 stems: wave 1 = 27, wave 2 = 80, wave 3 = 19). Drop `games/twin-thrones/media/<stem>.webp` and rebuild: build.py lists existing files so nothing 404s. See ASSETS.md.

Decisions: DOM table (no PixiJS) because art is placeholder; AI hard = 2-ply search on a masked copy (hidden pyramid cards and decks are never read by the AI).
Missing / next: audio (none), online play, guided first game (only a ghost finger on move one), campaign, card text check against the rulebook (rules-notes.md lists guesses), phone shots look: strips are tight, pyramid is small on 390x763 (about 28 px unit); consider hiding the token row inside a drawer.
