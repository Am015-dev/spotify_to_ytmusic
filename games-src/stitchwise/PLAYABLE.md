# Stitchwise: playable in one minute (W381, branch shelf/W381-stitchwise-playable, not deployed)

Before-shots `shots/playable/b-*`, after-shots `shots/playable/a-*` (390x763 and 1440x860, local, not committed); 4 phone after-shots
committed in `playable-shots/`. Critique done as a newcomer on the shots, before and after (impeccable critique heuristics: visible state,
plain words, recognition over recall, feedback for every action).

## The 10 worst problems: before → after
| # | Before (first minute, phone) | After |
|---|---|---|
| 1 | Offer cards were three bare numbers with tiny coin / hourglass icons ("2 ⌛3 ×0"); no patch name. | FIXED. Each card: patch name (13 px, 16 px on PC, solid backing), the shape, and three labelled chips: big number + "cost" / "time" / "earn", one colour each (gold, blue, green). Can't-buy cards say "need N more". |
| 2 | The rival's turn was invisible on phone: Marden sewed onto a quilt that was not on screen, the dock said "Marden is choosing…", then the state jumped. | FIXED. Rival turn is played step by step: banner "Marden's turn" → caption "Marden buys Long Strip for 3 buttons" + the card flashes (1 s) → the board switches to **Marden's quilt** (red "Marden's quilt" tab) and the patch is sewn on with the stitch effect, caption "Marden sews it on and moves 3 spaces", "Sewn on: −3 buttons" pop (0.8 s hold) → back to your quilt. Advance: "Marden advances 4 spaces and takes 4 buttons". Tap anywhere speeds it up (x0.3), never instant. |
| 3 | No turn banner. | FIXED. Centre banner "Your turn" (teal) / "Marden's turn" (red), ~1.1 s, no pointer events (never blocks a tap). |
| 4 | The instruction line was the same for every state and never said how. | FIXED. One always-visible line with a gold bar (red while the rival plays): "Tap a glowing patch, or tap Advance" → "Drag the patch onto your quilt" → "Good spot! Tap Sew it on"; "No patch you can buy: tap Advance"; "Free 1×1 patch! Tap any empty square". Max 2 lines, 16 px. Help-bulb auto popups are off by default (they repeated the line and covered the track; the bulb still works on tap). |
| 5 | Nothing glowed or dimmed. | FIXED. Buyable cards have a pulsing gold ring; unaffordable ones dim; after picking, the other cards dim and the quilt glows. |
| 6 | Score changes popped as a bare "+4". | FIXED. Pops carry the reason: "+4 buttons for advancing", "+3 buttons: gold spot income", "Sewn on: −3 buttons", "Free 1×1 patch". |
| 7 | Tutorial: 13 steps, 9 of them read-and-Next, ended on the title. | FIXED (final form, ADDENDUM 4): the tutorial is a **coached first game** against Marden: free choices from turn 1, no forced taps; Aunt Wren explains each rule the first time it matters (one dismissable line, never blocks input), reacts to your first buy and to Marden's moves, walks the final score through with your real numbers and lists rules not met on a "Things you'll meet later" card. Proven by `playable/play.js <size> tut` (random legal moves through the UI, PASS both sizes). |
| 8 | Two turns in a row looked like a bug. | FIXED. Banner "Your turn again" and the line "You are still behind on the track: play again" (same for the rival: "Marden plays again"). |
| 9 | Player pills said "+0 /spot". | FIXED. "income +0"; track hint says "Gold spot (income) in 5 · free patch in 20". |
| 10 | Help opened on detail. | FIXED. How to play opens with "How a turn works" in 5 numbered lines, then the details. |

Also found and fixed on the way: in Story the goal line pushed Rotate / Sew it on below the screen at 390x763 (smoke `--story2` caught it):
the dock is now compact (track hint hidden in Story on phone, 1-line prompts), so the action row is always on screen.

## Addenda 1-3 and the free art kit
- **ADDENDUM 1 + 4, tutorial = a coached real game:** see row 7 and `TUTORIAL-COVERAGE.md` (every rule explained during the game at both sizes; the later card held only the tie-break). The earlier spotlit chapter 1 was removed (0 forced steps).
- **ADDENDUM 2, rules:** `rules-check/stitchwise.md` lists WRONG 0 / MISSING 0, so rules fixed 0/0. The 3 SIMPLIFIED items are now
  stated in How to play ("Simplified on purpose").
- **ADDENDUM 3, narrative:** the tutorial is the story's prologue (guide Aunt Wren with her portrait when art exists, rival Marden with
  a reason; every step has a story reason + reaction; the judging has Aunt Wren's verdict). Story chapters keep their intros/outros and
  now have loss outros (`outroLose`, bosses speak); Quick game has a flavour intro per opponent and a result line. All text in
  `campaign.json` (`story` + chapters). Cast and arc: `STORY.md`.
- **Free art kit (installed with --force for the tests):** the `quilt-frame` picture draws a cream panel that does not line up with
  the 9x9 grid, so that slot is switched off (code frame is clearer; slot kept for real art). Text over the busy table and the light
  map got solid backing (player pills, track hint, opponent quilt panel, Story map header). Every other free picture is shown.

## Gate (local build, run without and with the free art kit, served over http)
- `build-all.py --quick stitchwise` PASS (11/11 scenarios). `rules-test.js 100` PASS.
- `playable/play.js` (fresh storage, animations ON, only centre taps on visible, uncovered UI): tutorial-to-end PASS 390x763 and 1440x860;
  tutorial = whole guided game to the result with all coverage lines; Quick game to the result PASS 390x763; Story stage 1 (map → Play → intro → game → reveal → Story result) PASS 390x763. 0 console errors.
- ui-audit A-F: phone 0/0/0/0/0/0, phone-s 0/0/0/0/0/0, pc 0/0/0/0/0/0 (without and with the free art).
- Existing tests still PASS: smoke (390x763, 375x553 --full, 1440x860 --full, --tut, --story2 at 390x763 / 844x390 / 1440x860), menu-test, first-launch-test (updated: step 1 is now an action).

## Notes / not done
- Shared kit blocker: `games-src/scripts/modmap.py` has no `stitchwise` row, so guard.py stops every build on this branch. I added the row
  locally to run the gate and did NOT commit it (shared file); the orchestrator should add
  `"stitchwise": ("Stitchwise", "stitchwise", "stitchwise"),` to modmap.GAMES.
- Two 404s on load are the missing temp art (portraits etc., listed in HANDOFF.md); the tests ignore "Failed to load resource".
- Track on phone is still 3 rows of small squares; it reads via the gold "next spot" ring and the hint line, but real track art would help.

## Addendum 5: see how you score (W381c, branch shelf/W381c-stitchwise)
- **Turn tracker** (panel heading, always on): "Turn: you · behind by 1 · 46 left" (whose turn, why: the token further back moves, spaces left); the turn banner says why it changed ("Marden is behind now").
- **Value preview** when a patch is picked or dragged: the line reads "Sew it on: worth +18" and the detail shows +squares×2, −cost, +income (buttons × gold spots still ahead), time and 7×7 progress (n/49) with the ghost counted. Value = 2 per square − cost + buttons × gold spots ahead.
- **Best-value badge** ("Best +21") on the strongest of the 3 patches you can buy.
- **Score always visible:** each player pill shows the total, ★ for the leader, buttons, income and gaps (empty squares, −2 each); on PC a score bar adds "(buttons − gaps×2)" per player.
- **Points pop** after sewing: "+12 pts: 6 squares covered, −3 buttons"; income and advance pops keep their reasons.
- **Rating after each of your turns:** "Last turn: good / okay / poor (+N). Best was <patch> (+M)", compared with the best value on offer (Advance included).
- The coached first game uses the same preview, badge and rating.
- Shots: playable-shots/score-preview-phone.webp, score-rating-phone.webp, score-preview-pc.webp, score-coach-phone.webp.
- Story on phone keeps the detail line hidden (the goal line needs the room); there the prompt still shows "worth +N".

## Game feel pass (W470, 8 Nov, branch shelf/W470-stitchwise-feel)
- Offer cards: the patch shape is big and clear on a calm cream panel (busy card fabric kept as a faint frame); cells outlined.
- Legal squares glow while you place a patch; a vibrate tick when the ghost snaps to a legal spot.
- No fast pop-ups: the 1-second turn banner is gone (hot-seat hand-over card stays 4 s); pops are short numbers only
  ("+12 pts"); toasts stay 4 s + 1 s per 10 words and close on tap, under any open panel.
- Goal card: "Win with the most points when time runs out." + 3 short bullets; the rival waits until you tap Start.
- Learn to play opens with the same aim sentence. Player pills: name, big score, "5 buttons · 81 gaps".
- Rival turn slower (1.9 s caption, then the sew on their quilt). Result: the long sum line is gone (the table shows it).
- 375x667 uses the compact dock so the quilt stays big; top bar fits at 375 px.
- Shots: playable-shots/feel/ (390x844 and 1440x900). `node playable/feel-shots.js WxH` plays a full game by touch / mouse.
- Feel gate (W470b): `feel-audit.js stitchwise --secs 120` (a)-(e) all 0 (baseline 6/14/3/37/0). Learn button is `data-a="learn"`,
  Quick game is `data-a="start"`; the coached Learn game reports as a running tutorial (GXT.running) so drivers find it.
  Coach lines and value detail cut to <= 12 words per sentence; phone text >= 14px; pill tap in Learn shows no toast;
  no turn banner at all. Learn to play finishes by touch, no Skip: `playable/play.js 390x844 tut` and `1440x900 tut` PASS.
- Reviewer R2 fix list (W470c): turn line in words ("You are 3 spaces behind, so you go next"); bigger track (cells 24-26 px,
  16 px icons, 20 px tokens); score explained on the Goal card and first Learn line ("buttons minus 2 for each empty square");
  pills "6 buttons · 47 empty"; patch cards show a button icon + price, an hourglass + time, "+N" + button for income;
  rival turn swaps in their quilt while they buy (2.2 s), the patch flies onto it, holds 2 s; PC shows the rival's real quilt
  under the track (one table scene); result drops the per-square -2 chips; owner/free art now loads in a played game: cast
  portraits on the title, bg-map behind Quick game setup, result-win/lose banner, bonus rosette on the Goal card.
  feel-audit a-e 0; ui-audit phone B1 (shared kit Vibration text, came with the base shell update), pc E1 (a player pill).
- W470d: tokens walk the track space by space; PC dock holds three big patch cards (art first, 24 px icons + 22 px numbers), pills no longer clip; in Learn a toast never stacks on the coach bubble. feel-audit a-e 0; Learn tut PASS both sizes.
- R8 (W470e): quilt-frame around the quilt, patch-leather on leather spots, torn-square swatch next to "N empty", icon-bonus at the finish space, result pictures preloaded at game start: asset-usage 63/63 (100%, was 57/63). Card numbers carry words ("7 buttons", "4 time", "+2 income", 14 px). Title tagline and Learn step 1: "Most points wins: your buttons, minus 2 per empty square." No toast at all in Learn (coach bubble only). feel-audit a-e 0; Learn tut PASS both sizes; logic 65/65.
