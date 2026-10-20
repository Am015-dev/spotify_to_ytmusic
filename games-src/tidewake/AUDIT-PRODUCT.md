# Tidewake: product audit (Oct 2026)

Measured against `games-src/PRODUCT-BAR.md`. This is an audit only: no game code was changed.

**What I played.** I used the deployed `games/tidewake/index.html`, served locally, in headless Chromium with software WebGL.
- Guided first game at 1366x768: I won on turn 11; Cobalt was crushed by a leviathan.
- Full 4-player game against normal computers at 390x763 (phone, touch), with all four expansion pieces on. Jade won on turn 15; my junk capsized in the Rogue Wave.
- Guided game at 375x553 (phone) up to my first placement.
- Opened the hot-seat pass screen and the online host lobby. A second browser context joined by invite link.
- Opened Crews, Log, Rules, Pieces and Menu.

My moves were real taps at first (best start, turn, Place). After that the game's own advisor (normal AI) chose them through `act()`. I read both logs against `rules-notes.md` and `game/RULES-AUDIT.md`.

**Tests re-run:** `node rules-test.js` gives 38 passed, 0 failed. `checkInvariants()` came back empty after my games.

**Online note.** The sandbox blocks the public Nostr relays, so the joining page stayed on "Looking for the host..." and I could not test a real join. The p2p results in `game/ONLINE-REPORT.md` are the builder's.

The newcomer items in `game/NEWCOMER-REVIEW.md` are marked fixed; I re-checked them and do not repeat the ones that hold. Screenshots are in `audit-shots/`.

## Scores (0–5)

| Area | Score | Evidence |
|---|---|---|
| A. The game itself | **3** | **Rules:** the base game plus all four expansion pieces, solo, easy solo, teams and calm seas are in. The logs match the rules (roll order, 6 = a new leviathan rises, tiles torn away, crushes, capsize rolls). **Guesses:** the board size (6x6), the 21 duplicate tiles and every leviathan's arrows. **Consequences:** solo "outlast all 10" is won 3–6% of the time, and AI levels barely differ (hard beats normal 53%). |
| B. Learning the game | **4** | **Guidance:** a guided game with lessons timed to events, a recommended start with a reason, a gold path preview with the stop square, and a safest-move advisor that says how many safe moves you keep next turn (04). **Wake card:** each roll is explained in numbered lines (03). **Rules:** sectioned, short version first. **Reference:** Pieces lists every tile and leviathan with arrows and counts (10). **Weak:** names are missing on phones (see #4). |
| C. Playing comfortably | **3** | **Undo:** none during play; there is a "Rewind to my last move" on defeat. **Log:** good, with turn headers. **End screen:** cause per crew (05), little else. **Settings:** sound on/off, music on/off, computer speed, animations, graphics (11), but no volume, text size, colour-blind mode or handedness. **Save:** "Continue" on the title. |
| D. Playing with friends | **3** | **Online:** a P2P lobby with code, link, seats, Change setup and an idle-turn timer (12). Interrupts reach the endangered seat with a 25 s timer, but there is no chat or emotes, and no timeout when nobody can be reached. **Async:** none. **Hot-seat:** pass screens, but captains have colour names only. |
| E. Look, sound and feel | **3** | **Desktop:** a 3D painted sea-chart board; tiles drop, junks glide, and leviathans move with arrows. **Phone:** the board looked blurry in my runs, almost half the screen sat empty, and unlabelled pieces looked like glitches (06, 07). Leviathans are coarse pixel-like sprites. **Sound:** real samples plus music. **Haptics:** none. |
| F. Quality | **3** | **Speed:** 1.9 MB, first screen in about 1.6 s locally. **Offline:** one external request to Google Fonts, which fails offline (a console error). **Errors:** no page errors in about 30 minutes of play. **Accessibility:** keyboard keys exist (1–3, R, Q, Enter, Esc), but the board is a canvas with no text alternative. |

## Problems

### P0: blocks paying users

1. **Selling needs a licence.** Tidewake copies one published tile game and its expansion (mechanics, counts, setup, turn and expansion rules); names and art are our own. A paid release needs a licence, or a redesign that is clearly ours. The guessed parts (board, leviathan arrows, tile duplicates) are already our own design and could be the start of one.
   - Also: the public repo files `PLAN.md`, `rules-notes.md`, `sources.md` and `game/RULES-AUDIT.md` name the original games and publisher. Move them to the private research repo.
   - Effort L (business).

### P1: clearly below a paid app

2. **The guessed components make the game swingy and solo almost unwinnable.**
   - On the 6x6 board, 56 currents meet 36 squares and about 10 leviathans. Leviathans cause about 65% of sinkings (ENGINE-REPORT).
   - Solo "outlast all 10" is won 3–6% of the time by the hard AI.
   - My guided game was decided by a single leviathan roll on turn 11.
   - Fix: either get the real board size and leviathan data from the private rulebook scan, or own the redesign. Offer a 7x7 option (`BW` is one constant) and retune solo to a winnable goal.
   - Effort M–L.

3. **Computer levels feel alike.** Hard beats normal 53% and normal beats easy 57% (2p, ENGINE-REPORT), so a player cannot feel the difference.
   - Fix: easy should leave visible risky openings; hard should look further ahead and use cannon and gate timing. Or tell players that luck dominates.
   - Effort M.

4. **The phone hides the names that the text relies on.** On phones the leviathans have no name tags, and the Rogue Wave, Maelstrom and Rift Gate have no labels (06, 07). Yet the wake card and warnings say things like "Krakenreach rolled 6", "Tidegrave is next to you" and "Maelstrom rises at column 6, row 1".
   - The Rogue Wave tile drawn without a label looks like a striped rendering glitch (07, at column 2, row 3).
   - Fix: short name tags on phones, or tap or long-press a piece to show its name and arrows (with the reference entry). Light up the piece a line names.
   - Effort S–M.

5. **The phone wastes half the screen.** At 390x763 the area below the board (about 45% of the screen) is empty during setup and other captains' turns (06, 07). The board itself could be bigger.
   - Fix: let the board take the free height. Put the crews strip, the last wake roll and "Since your last turn" there.
   - Effort M.

6. **The board renders blurry.** In my runs the canvas was 234x234 pixels for a 390 CSS-pixel board at DPR 2 (0.3x); on desktop it was 582 pixels for 970 CSS. "Auto" picked Low on the software GL driver.
   - This needs checking on a real iPhone. Even "Low" should render at least at DPR 1, because a blurry board reads as cheap.
   - Fix: a floor of 1x device pixels for the render scale.
   - Effort S. **[shared]**: perf-level policy.

7. **Turns are slow at default settings.** In the 4-player game one round of turns took about 15 s per turn with animations at Normal. On phones each wake roll waits for a Continue tap (08). A 4-player game is about 5 minutes of mostly watching.
   - Fix: default to Fast after the guided game, auto-dismiss the wake card after about 2 s unless the player is in danger, and show calm rolls as one line.
   - Effort S.

8. **The setup screen is a long form, not a title screen** (01). Five panels, a 2–8 player strip and per-seat colour, human/computer and level controls all come before Play. It does not match the other shelf games (Hollowbough has a card with mode buttons).
   - Fix: the shared title (Guided game / Play / Online / Continue / How to play), with Configure as a sheet. Keep this form behind Configure.
   - Effort M. **[shared]**

9. **Settings lack basics** (11): no volume sliders, no text size, no colour-blind mode, no left/right hand.
   - The colour-blind gap matters more here: 8 junk colours, including Vermilion/Saffron and Jade/Cobalt pairs, are told apart on a small board mainly by hue.
   - Fix: the shared settings panel, plus a pattern or letter on each sail.
   - Effort M. **[shared]**

10. **Web fonts come from Google's servers** (`game/head.html:8`). Offline, the request fails (a console error) and the page falls back to other fonts. Every load also sends the visitor's IP to Google, a known privacy problem in the EU. The brief asks for one self-contained file.
    - Fix: inline a small WOFF2 subset, or use system fonts.
    - Effort S. **[shared]**: `games/reference.html` does the same.

11. **Online gives no feedback when it cannot connect.** The joining page stays on "Looking for the host..." with no timeout or advice. Like Hollowbough, it depends on public Nostr relays.
    - Effort M. **[shared]**

### P2: polish

12. **Wrong turn label.** On the player's own roll the dock shows "Opponents: Vermilion is playing. The computers play by themselves..." (03, 04), where Vermilion is the player.
    - Fix: "Your roll" when it is the player's seat.
    - Effort S.

13. **Top-bar counters jump ahead of the animation.** "Monsters on board 4" appeared while six leviathans were still on screen during the first wake replay (03).
    - Fix: update the counters per replay beat.
    - Effort S.

14. **Pieces drawer count is misleading.** It says "Current tiles: 56 in the pile" while the top bar says "Tiles left 45" (10).
    - Fix: "56 in the game · 45 left in the pile".
    - Effort S.

15. **Wrong prompt at 375x553.** The text says "Tap the glowing square in front of your ship to see your tiles" while the three tiles are already showing. The "start" tag also overlaps the "Stop: column 1, row 6" label (09).
    - Effort S.

16. **Start-mark pips overlap at 1366x768.** They overlap the edge numbers and each other, for example 1U/1D on the right edge and 6L/6R near the corner (02).
    - Effort S.

17. **The log reads backwards within a turn.** It is newest first inside each turn too, so you read a turn from the bottom up.
    - Fix: newest turn on top, lines inside a turn in order.
    - Effort S.

18. **The end screen is thin** (05): winner, cause per crew, turns and leviathan moves.
    - Fix: add the board replay of the last turn (the rewind snapshot already exists) and a short per-crew line (tiles laid, near-misses).
    - Effort S–M.

19. **Hot-seat captains cannot type names**; they are only colours.
    - Effort S. **[shared]**

20. **Invite code case differs.** Tidewake shows codes in lower case ("uyfiv") while Hollowbough uses upper case ("WHHWP").
    - Effort S. **[shared]**

21. **The intro text is too long.** The start-mark step shows about 120 words in the dock (02).
    - Fix: trim it to one sentence plus "Start here".
    - Effort S.

22. **An original term ships in the HTML.** A code comment in the shipped page uses the original game's word for the monsters.
    - Fix: strip comments in `build.py`, or reword.
    - Effort S.

23. **No haptics** (for example on a sinking or a wake roll).
    - Effort S. **[shared]**

## Top 5 fixes (value for effort)

1. **Names and labels for every piece on phones**, tap-to-identify, and the named piece lit up (P1 #4, S–M). Without them the phone text points at things the player cannot find.
2. **Faster default pacing:** Fast after the guided game, and auto-dismiss calm wake cards (P1 #7, S).
3. **A bigger phone board and a render-scale floor**; use the empty half of the screen (P1 #5 + #6, M).
4. **Inline the fonts** (P1 #10, S). This makes the game truly offline and removes the third-party request.
5. **Retune solo and spread the AI levels** (P1 #2 + #3, M), so each mode and level feels different and winnable.

## Suite-level notes (fix once for every game)

- **Licences.** Both games here are faithful copies of published games. Before anything is sold, decide per game: licence, or redesign. Several public-repo planning files name the original games and publishers; move them to the private research repo.
- **`games/reference.html` is stale.** It says "three games" but lists seven. It misses Hollowbough, Tidewake and the newer games. For one game it shows section names taken from the original products' expansion names and a crossover product.
  - Fix: build the reference from each game's own data at deploy time, using our names only.
  - Use the same component as an in-game Reference drawer (see Hollowbough P0 #1).
- **One settings panel in the shell** for all games: master, music and effects volume, animation speed, computer speed, text size, colour-blind patterns, left/right hand and haptics on/off. Today each game has its own subset.
- **One start screen and one set of words.** Title → Guided game / Play / Online / Continue / How to play. Use the same names for the same drawers: "Players" vs "Crews", "Rules" vs "How to play", "Pieces" vs no reference.
- **Online (NetRoom):**
  - add a connection timeout with a clear error;
  - check relay health, and run our own relay or TURN rather than public relays (some are `staging.` hosts);
  - quick emotes;
  - one invite-code format.
  - Async play needs a server; it is absent everywhere.
- **Undo in the shell:** snapshot before each human top-level move; allow undo until hidden information is revealed.
- **Fonts, icons, credits:**
  - inline fonts (no Google Fonts calls);
  - give each game a favicon and apple-touch-icon;
  - add a shared Credits & licences page (CC0 audio, PixiJS/three.js MIT);
  - add privacy-policy and terms pages, needed for any store listing or payment.
- **Hot-seat names, pass screens with a "what the last player did" line, and log grammar for "You"** ("You places") are the same small fixes everywhere.
- **Identity and store readiness:** there are no profiles, statistics or achievements in any game, and no opt-in crash reporting. Payments or unlocks need a server. A PWA manifest and service worker exist at shelf level; the per-game pages do not link a manifest or icon.
