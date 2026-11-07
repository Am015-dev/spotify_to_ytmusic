# READABLE: the first-time-player recipe (proved on Wildmark)

Owner feedback: "unplayable, unreadable, not easy to follow, the assets are super difficult to understand".
Audits passed; eyes did not. Judge every rule below by a 390x763 screenshot you LOOK at as someone who never saw the game.
Benchmarks: the old shelf games the owner likes (cauldron-fair, hollowbough) and good online versions of the same kind of game.

1. **Temp glyphs off if code says it better (judge each slot by eye).** Abstract icon art (game-icons style) means nothing to a player. Keep the slot, but
   make code-drawn the default: a prefix list (`ART.codeFirst` in `src/art.js`) skips those temp files; real art is switched on by
   naming its stem or prefix in `window.WM_REAL_ART`. Never delete a slot.
2. **Terrain = flat colour + one picture pattern.** Waves for water, small pines for forest, snow-capped peaks for mountains,
   field rows for fields, reeds with cattails for marsh. Bold enough to read on a 30px hex (`TER_PAT` in `src/art.js`).
3. **Plain table.** No busy picture behind the board: a dark neutral (slate) background so green or blue tiles never melt into it.
4. **Every animal/token has its name.** Silhouette on a light disc, its name under it at >= 13px wherever the player chooses it
   (market) or reads its score (score chips). Results and score tables lead with the plain name ("Bear"), the card title is secondary.
5. **One instruction bar, always visible, max 2 lines.** It says exactly what to do now, in verbs: "Step 1 of 3: pick a tile + animal pair
   from the market", "Step 2 of 3: tap a glowing spot", "Step 3 of 3: put the Bear on a glowing tile, or Return it", with a
   big step-number badge. First Quick game: one coach line per step for 3 turns. A "What should I do?" button shows the best move.
6. **Legal = glow, everything else = dim.** Spots: solid bright outline + soft fill (no dashed outlines). Token targets ring in gold
   and all other tiles drop to 40% opacity. Market pairs that can't be taken right now drop to 50%.
7. **Explain every score when it happens.** After each placement a plain toast: "+1: your Meadow grew to 2 joined tiles",
   "Bear +4: Groups of exactly 2 bears...", or "Fox settled, no points yet. <the card's one sentence>". Plus the floating number.
8. **The tutorial is a coached first game, not tap-tap.** Owner (22:01): forced spotlight steps are rejected. It is a real short game
   (free choices; market stacked so key cases come up). The guide explains each rule the first time it matters, in one non-blocking,
   dismissable bubble, and gives one-line verdicts on moves. The result screen walks through the score with the player's real numbers
   and lists "things you will meet later". Keep TUTORIAL-COVERAGE.md and a script that plays it with random legal moves (`tutorial-end.js`).
9. **Help opens with "How a turn works" in 5 lines** (boxed, 15px) before any detail; scoring cards keep a small diagram + one sentence.
10. **Turns read like turns.** A "Your turn" / "<Rival>'s turn" banner; the rival plays step by step (take, place, settle),
    ~1 s per step with a caption on the instruction bar and a score pop; tap anywhere to speed it up.
11. **Phone first, then PC.** Board + choices fit 390x763 with no scroll; tap targets >= 44px; no game text < 14px (13px only for
    labels under pictures). On PC let the fit-zoom go up (cap 2.5) so a small early valley isn't a speck in a big empty table.

Proof shots (before/after, phone and PC): `games-src/wildmark/readable-shots/`.

Gate notes (W376): ui-audit A, C, D, E, F = 0 on phone, phone-s and pc. B still flags 1-2 drawer headings ("Speed" in Menu,
lines in How to play). The live build flags the same kind of thing (phone B2), so this is the shared drawer, not the game:
the panel walker leaves drawers scrolled to a spot where a heading sits across the drawer edge. The fix belongs in the shell.
The tutor "Learn in 5 minutes" label is shell text too (the tutorial is now about 1 minute).
Addenda (W376, 21:10-21:30): rules-check WRONG (market pairs re-paired) and MISSING (25-acorn supply) fixed in engine.js with
rules-test cases `market-pairs-stay` and `acorn-supply-25`; SIMPLIFIED items listed in the help drawer. Turn banners and a step-by-step
rival turn added. Tutorial restored to the full 21-step staged game, now in 4 chapters; `tutorial-end.js` PASS at both sizes.
Quick game and Story stage 1 played to the result by UI taps at 390x763: PASS. ADDENDUM 3 (story-driven tutorial) not done.
