# W490 (8 Nov 2026): reused owner art + board view (flag body.vg-b2, on; ?b2=0 = old terraces)
- Art: 116 slots now hold owner art copied from shipwreck-isle, sands-of-qamar, emberclimb, rampart-and-vine, thornbound, hollowbough,
  tidewake (`python3 reuse-art.py`; table in ASSETS.md). Guardians renamed to match their new figures (data.js GU names).
- Board (src/ui1.js `mapB2`, style.css W490 block): one painted map (temple floor), sites = round painted places on dotted trails
  (camp bottom, ruins middle, deep ruins top), guardians stand on their site as big figures, explorer figures stand on sites,
  research = vertical path at the right (temple on top, notebook/magnifier tokens climb), fanned hand, goods as tokens with words.
- Tests: drag-test PASS (time budget 180 s; disabled "cannot pay" choice no longer tapped), touch-test updated to the tap+Go flow
  (`W=375 H=667`, `FULL=1` plays to the result), `node w490-shots.js` makes playable-shots/w490/. smoke.js still uses old #acts (fails on the old build too).
- Gameplay first: Learn to play = guided game, every core rule in order (TUTORIAL-COVERAGE.md, `node guided-tut-test.js`); tut-test.js now
  runs ?tut=coach (stale since W477). rules-test: 2 stale expectations fixed (discover refunds via loot/idol; rival stack 10). No new engine rule gaps.

# W477 (8 Nov 2026): one board, real pieces (REVIEW-FIX R1, COPY-FIX, DESIGN-FIX)
- Play screen = ONE board at every size: score strip, three site terraces (deep ruins, ruins, camp), research track (rows 0-7 + temple), market;
  your tray below (prompt + one button, explorer pawns, goods as "2 coins", hand). No Map/Market/Research tabs, no bottom sheet as the main way.
- Input (src/ui2.js `pick`, `act`, drag block): tap selects (it lifts, the line says what it does, one Go button), tap again does it;
  drag an explorer pawn onto a glowing site, a hand card up onto the island, a market card down to the tray. Snap = vibrate tick.
  Details button opens the old sheet (still used for guardian boons and idols). Rival moves: pawn / card flies, place bounces, points pop.
- Hints moved to Menu (off by default; body.hints-on). Title: Learn to play / Play (data-a=start) / Story + "Game settings" toggle.
- Result: winner first, big totals, every kind of points counts up (no table). Learn: step 1 "How to win", 3 short score steps, 1-line end card.
- Tests: `node drag-test.js` (Learn by touch to its end card, drags, a full game by taps; phone + PC). smoke.js updated; playtest.js,
  tap-play.js, touch-test.js, tut-test.js still use the old #insp flow (not updated). rules-test.js has 2 FAILs that predate W477 (same at 43a0e446).

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
  After the AI and rules fixes: 2-player avg ~39-45; solo AI vs rival easy/normal/hard 40/23, 57/46, 58/57.
- `node smoke.js`: real input, title tap, 3 turns, forced end to the result; phone 390x763 + PC 1440x860: PASS, 0 errors.
- `node playtest.js both`: like a player with real taps, per size: tutorial offered + played to its end card, a whole game to the result,
  Story stages 1 and 2 started and 4 turns each: PASS, 0 errors.
- build-all --quick: PASS (5 ?scn= scenarios in src/scn.js: vg-board, vg-guardian, vg-overcome, vg-market, vg-result).
- Story map now fits the screen (rows pulled closer, text unchanged; no scrolling at 390x763 and 1440x860; very short screens keep a scroll).
- ui-audit.spec.js (local staging via scripts/gx-serve.js, phone + pc): A0 B0 on both; E5 phone / E4 pc, all on the "panel Menu" surface.
  Logged cause (copy of the spec printing what each tap hits): when the audit lists that surface's buttons, the page's own menu walker
  (gx-scenario menuPass, started by ?scn=menu) has the Story map open; the first tap (Back) closes it and the remaining saved map-node
  positions land on Menu text. With the audit's boot() also waiting for `GXS.menuN` (walker finished) the same build gives
  **phone A0 B0 E0, pc A0 B0 E0**. Proposed one-line shared fix in scripts/ui-audit.spec.js boot():
  `await page.waitForFunction(() => GXS.menuN >= 1, null, { timeout: 60000 }).catch(() => {});`
  Every remaining E is a Story-map button tapped on the "panel Menu" surface: the `?scn=menu` page runs the shared menu walker
  (gx-scenario menuPass), which opens the Story map and scrolls it (the map is a fixed 898 px tall in gx-campaign) while the audit
  taps coordinates it saved earlier. The same buttons all pass on the audit's own "campaign" surface (checked with a logging copy
  of the spec). Not fixable inside this folder without hiding the Menu from the audit; flagged for the shared kit (shorter map rows,
  or the walker should not run while the audit drives the page). F1 = the title counts "Play now" as a second big button.
- Hot-seat (pass-the-device screen, then the next player's hand) and solo (rival card after each action) checked with real taps.
- Picture loader proven with 3 dummy files (title-bg, card-trail, site-c-spring): drawn at slot aspect, 0 failed requests; files deleted.

## Addendum gates (orchestrator, 7 Nov)
- AI gate (`node ai-gate.js 100`, 2 players, seats alternated, vs a bot taking the first legal non-pass action): Hard wins 96%
  (avg 74.4 vs 30.6), Normal 85% (58.1 vs 29.6); Hard vs Normal head to head: Hard wins 80% (after the first-arrival and Dread-supply rules). Hard looks one of its own turns ahead
  for its 6 best moves (gather now, spend next turn). Spending: 4.2 (hard) / 6.0 (normal) resources left at the end in total, no hoarding.
  Fix that got there: the AI overvalued hand cards and idle explorers (dug 73 times vs the bot's 179, passed early 45 times in 20 games).
- ASSET-CHECK.md (`python3 asset-check.py`): 148 picture ids required by rules, UI and campaign cast; 148 with a stem, 148 with a
  Flow prompt, gaps 0. Music cues for the 5 gx-music slots: `next-wave/music/vinegrave/cues-wave1.json`.
- Card reference: 'All cards' (gx-kit reference drawer, 123 entries: items, artifacts, starting cards, guardians, ruins, camp sites, idols;
  search, chips, large view with full text) from the Rules drawer, Menu > Help and every card sheet. Tapping a site shows its guardian large.
- Menu: Restart, Title, Story map (Game); Sound effects + Music on/off + Pick songs (Sound); Rules, Tutorial (Help). Tapping any card
  (hand or market) opens it large with its full text, cost, travel icon and points.
- Offline: the game loads only index.html (+ media/*.webp and music/*.mp3 that exist; build.py lists only existing files).
  `offline-manifest.py vinegrave` on a temporary copy in games/ gave {"files":[index.html 491 KB]} (copy removed again).
  `offline-test.js` cannot run before deploy: it needs the slug in games/sw.js SLUGS, an entry in its ID map and the game on
  sync.html (deploy-time shelf edits I may not make). Orchestrator: add `vinegrave` to games/sw.js SLUGS at deploy.
- Reuse: shell, build layout, title/Story/tutorial/help wiring follow cauldron-fair (shell kits inlined from games-src/shell);
  art loader + register-assets.py from redline-rally. Emberclimb/hollowbough were not copied: my deck/market/worker-spot code was
  already written and tested (rules-test, playtest) before the reuse addendum arrived; nothing weaker was left to replace.
- Temporary art: 38 slots from game-icons.net (CC BY 3.0) via `temp-art/temp-art.js` -> assets-inbox (credits in temp-art/CREDITS.md, ASSETS.md, Menu > About).
- Web: no open-source implementation exists (GitHub/web search), so nothing ported and no THIRD-PARTY.md. Rules cross-checked
  against a published rulebook summary; 7 mismatches fixed (see rules-notes.md). Layout follows the common digital pattern:
  board centre, market row along the board, hand + actions at the bottom (phone) / right (desktop), tap for a large card view.

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
- Added late: first-arrival research rewards (rows 2, 4, 6, 7) and the 19-card Dread supply (then fear tiles, -2). Not in: assistants. Tune the rival after human play.
