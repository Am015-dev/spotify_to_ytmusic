# Twin Thrones R2 (W338)

Changed (all in this game's folder + its music cue file):
1. Rules cross-check: `rules-notes.md` now tags every line VERIFIED / UNSURE; nothing needed changing (CHANGED: none). UNSURE = cost-only lines (Lookout, Customs Quay, Open Bazaar, Archery Range, four Age II green costs, Age III resource costs, four wonder costs): check against a physical copy before the paid release. `rules-test.js 200` PASS.
2. Phone pyramid: cards fill the 390 px width (64x102 px, was 64x84 with 8 px text); no text under 11 px anywhere (checked by DOM walk on title-less board, zoom and menu, phone and PC). Tap a card -> big card with every detail, chain info, cost with trade, Build / Sell / Wonder buttons (`#zoom` in `#board`, dock only shows a hint). Menu: Rules, Tutorial, Restart (two taps), Sound on/off, Music picker (only when music files exist), Back to title.
3. Hard AI: 3-ply on the best 4 moves (my move, rival best reply, my best follow-up) on the masked copy, face-down cards and decks are never read. Hard beat normal **71.0% (142-58, 200 games)** and **77.4% (154-45-1, second seed set)**; 74.2% over 400, seats alternated.
4. Assets: stems unchanged (126). Orphans found and wired: back-age1-3, res-*, sci-*, coin, icon-shield, icon-vp, city-board-p1/p2, portrait-p1/p2, military-board, fx-coin-burst, fx-lift-dust, fx-pawn-glow (all through `slot()`/`bgSlot()`/`TTA.url`, placeholders until files exist). No stem requested by code is missing from assets.json. No prompt change, so `register-assets.py` needs no re-run.
5. First-game guide (`src/tutor.js`, GXT, fixed seed 5, 8 steps): pyramid -> take free card -> build -> sell (a card that frees one above) -> rival takes the freed card (tension) -> build a red card -> pawn moved (steps 3/6/9) -> raise a wonder. Offered as the first button on the title screen on first launch, from the Menu and from the How to play drawer. End card "Play a real game". Scripted computer only sells, takes the freed card, never the guide's cards.
6. Sound (`src/sound.js`): synthesized take, build, coin, wonder, pawn, win, lose, tick + mute toggle (title + Menu, saved `tt_snd`). Music: GA + GXMUS with slots menu, age1, age2, age3, victory, defeat; `build.py` lists existing `games/twin-thrones/music/<slot>-<a|b>.mp3` into `TT_MUSIC`, so no file = silence and no 404. Cues: `games-src/next-wave/music/twin-thrones/cues-wave1.json` (6 slots x a/b, mood, bpm, loop). Drop files + rebuild, no code change.

Tests: rules-test 200 PASS; smoke.js PASS phone and PC (0 console errors); tutorial driven end to end on phone by taps (0 errors); `build-all.py --quick twin-thrones` see report line.
Not done / next: zoom has no keyboard focus trap; tutor text is English only; sounds are plain synth (replace by recorded samples through GA if wanted); the 'Tutorial' tap in an unfinished game restarts to the fixed seed, not the live game.
Orchestrator: deploy `build-all.py --deploy twin-thrones` then stamp-copyright; shell files untouched.

## Round 2b (owner corrections + audit W340)
Found -> fixed:
- Title had no Story / Quick game / How to play structure -> new title: one big "Quick game", Story (shared campaign kit, 10 chapters in 3 acts, `campaign.json`, `CAMPAIGN-DESIGN.md`), Tutorial (first on first launch), Two players, Watch, How to play, Sound.
- No stages -> `GXC.init` wired like cauldron-fair; chapter 1 plays the guided first game, then the duel; stars, boss cards, twists (extra coins, pawn head start), result screen via `GXC.finish`; Tutorial button on the map.
- Audit A (text size): every font now >= 13 px on phone and >= 16 px at 1000 px+ (`--fmin`); audit A = 0 on phone and the board at PC (kit-owned story-map and tutorial-bubble text at PC still 13-14 px).
- Audit B: yellow/grey card bands dark ink, darker coin/vp/green/clay/stone chips; drawers dark; story map override colours.
- Audit E: level buttons re-render (visible change); start screen and board are hidden while a drawer is open (no dead covered buttons); toast clears and repeats so wonder/token taps always change the DOM.
- Scenarios: card names wrap instead of clipping, military labels moved off the pawn row, toast no longer covers wonder tiles; local result 6 of 6 scenarios pass at phone and pc; the shared `menu` scenario fails only on "font is not a shelf face" because this local run lacks the fonts that build-all.py injects.
- Full games played by real taps (phone 390x763 and PC 1440x860, several seeds) reach the result screen; story chapter 1 -> tutorial -> duel -> stars verified.
- Dangerous bug caught on the way: hiding the board with `body:has(.gxc)` stayed on after the map closed (kit keeps the hidden node); selector is now `.gxc:not([hidden])`.
Local audit: `ui-audit.spec.js` phone A0 B7 E3 F1, pc A2 B17 E2 F1; what is left is the shared story map (contrast), the shared tutorial bubble at PC (13.5 px), and the audit tapping the Tutorial menu button (it starts the tutorial, then F sees 2 instruction lines). Run `build-all.py --quick twin-thrones` for the real gate (it adds the fonts).
Next: wonder tiles / tokens could open a card popup instead of a toast; story map art; music files; the deferred rules UNSURE costs.

## Round 2c: computer opponent (review R2 scored it 3)
Cause found: the old scorer sold half its cards (376 sells vs 380 builds in 30 games), hoarded coins (45-60 at the end) and ignored wonders (10 wonders in 30 games). Fixed in `src/ai.js`: weights in one `PRM` table (hill-climbed against the simple bot, then checked on fresh seeds), a card-count and wonder value, coins valued at 1 point per 3 up to 10 coins and little above, a penalty for selling a card it could build (larger when rich), science 5+ and pawn 7+ threats weigh hard on both sides (denial of the rival's science pair / military push comes from the existing denial term plus these), hard keeps the 3-ply search.
Gate (headless, `node bench-ai.js 100 <level>`, bot = take-first-affordable, raising a wonder every 4th turn, else sell; seats alternate; fresh seeds not used for tuning):
- Normal beats the bot 72% (target 55%+); Hard beats the bot 77% (target 70%+); end coins about 10 (was 45-60).
- Hard beats Normal 63% over 200 games (126-74); rules-test 120 PASS; smoke PASS.
