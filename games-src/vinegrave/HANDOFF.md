# Vinegrave (W344) handoff

Branch `shelf/W344-vinegrave` (from `alex/brave-carson-rbpmlk`). Not deployed. Slug `vinegrave`, folder `games-src/vinegrave/`.
Build: `python3 build.py` (inlines games-src/shell kits; never copies them). Gate: `VIS_SLUGS="," python3 games-src/scripts/build-all.py --quick vinegrave`.

## What plays
- Full game for 1-4: 5 rounds, one main action per turn then pass; play a card / dig (travel icons Boot, Jeep, Boat, Plane; 2 coins = Plane) /
  discover a ruin (idol + loot + a guardian wakes) / overcome a guardian (5 points + one-time boon) / buy items (coins) or artifacts (compasses,
  fire at once) / research (magnifier + notebook, temple tiles at the top). Free: guardian boons, one idol per turn into a shrine.
  Round end: explorers home, Dread card if still beside a guardian, market shifts (an item leaves, an artifact joins). Scoring breakdown on the result.
- Content: 35 items, 35 artifacts, 15 guardians, 5 camp sites, 10 level-1 + 8 level-2 ruins, 12 idols, 5 shrine boons, 8-row track + temple.
- Modes: vs 1-3 computer explorers (easy / normal / hard), hot-seat with pass-the-device screen, solo vs a rival expedition deck.
- Shelf shell: title (one primary button; first launch the primary is "Learn to play"), Story (gx-campaign, 3 acts, 10 stages, 3 bosses,
  saved progress, tutorial as stage 0), guided first round (gx-tutor, 14 steps), help bulb + coach bubbles + rules cards (gx-help),
  rules/log/scores drawers, Menu (gx-kit settings), music slots (gx-music, silent until media/music files exist), synth sfx with mute.
- Centrepiece: discovering a ruin flips the tile, then the guardian card pops ("X wakes!") with a roar; overcoming it pops a gold card.

## Tests (all from this folder)
- `node rules-test.js 200`: 15 rule checks + 200 AI games (1-4 players, solo at 3 rival levels): 0 stuck, 0 illegal, 0 invariant breaks.
  Avg scores ~30-37; hard AI wins most (72/150 seats-wins vs normal 58, easy 20). Solo: normal AI vs rival easy/normal/hard 26/22, 36/48, 37/55.
- `node smoke.js`: real input, title tap, 3 turns, forced end to the result; phone 390x763 + PC 1440x860: PASS, 0 errors.
- `node playtest.js both`: like a player with real taps, per size: tutorial offered + played to its end card, a whole game to the result,
  Story stages 1 and 2 started and 4 turns each: PASS, 0 errors.
- build-all --quick: PASS (5 ?scn= scenarios in src/scn.js: vg-board, vg-guardian, vg-overcome, vg-market, vg-result).
- ui-audit.spec.js (local staging, phone + pc): see the last line of the round report.

## Found -> fixed (my own play, Playwright)
1. Guardian badge hid the site name/reward -> smaller corner badge. 2. Toast covered the player strip -> moved down.
3. "You discovers" grammar -> engine conjugates "You" lines. 4. favicon 404 -> data: icon. 5. Story stage 2 locked in the test -> test seeds progress.
6. Coach bubble on the first turn covered the dock and doubled the instruction line -> removed (the dock line says it).
7. Icons inside buttons caught hit tests -> pointer-events none on inner parts. 8. Desktop text under 16 px in shared panels -> 16 px floor.
9. Low-contrast placeholder initials and Story map discs -> dark-on-light. 10. Rules drawer opened under the title -> drawers above overlays.
11. Game buttons under the Story map counted as dead -> game hidden while the map is open. 12. Title layout shifted after the first game -> same
    layout in both states. 13. Locked Story stages gave no feedback -> a short note. 14. Escape leaves the guided round / closes the map.
15. Pinned Playwright 1.56.1 wants a browser build that is not installed -> used 1.63.0 (matches /opt/pw-browsers chromium-1243).

## Assets
170 named slots in `assets.json` (wave 1: 41, wave 2: 118, wave 3: 11), Flow prompt files in `next-wave/flow-2d/vinegrave/`,
`ASSETS.md` with the drop-in steps, `register-assets.py` (run by the orchestrator at merge time). Loader `src/art.js` (from redline-rally):
`media/<stem>.webp` fills any `[data-art]` slot, else the code-drawn placeholder; build.py lists only files that exist (no 404s).

## Missing / weak
- Art is placeholder (initials on gradients, SVG icons). AI is one-step greedy (no long plans); hard is only a bit stronger than normal.
- No online mode, no undo, no reference drawer of every card (the card sheet explains any card you tap).
- Solo rival hard is tough for the AI (wins 2/16); tune after human play.
