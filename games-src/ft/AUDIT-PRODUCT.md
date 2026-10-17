# Sands of Qamar: product audit (Oct 2026)

Audit only. No game code was changed. The build audited is the deployed `games/sands-of-qamar/index.html`
(2,212,819 bytes; 1,165,142 bytes gzip -9). It is the older 3D (Three.js) build, not the 2D brief.

## How I tested
- **Browser:** headless Chromium with SwiftShader WebGL. Phones were emulated with touch, `isMobile` and DPR 2 at
  **390x763** and **375x553**; desktop was **1366x768**. The page came from the local static server. Google Fonts
  requests were aborted on purpose.
- **Newcomer pass at each size:** opening scene, setup, first screen, every drawer (Rules, Card list, Djinns, Players,
  Log, Settings, ☰ Menu), a tap on a card in the Card list, and an automatic audit of tap targets, text size, clipping
  and page scroll.
- **Full games vs the computer, to the end screen.** My own decisions went through real taps and clicks on visible
  buttons and 3D tiles. Hooks were used only to speed up the computer (`AIDELAY`, `ANIM=0` from round 4).
  - 390x763, 2 players, guide on: 9 rounds, 147 human decisions, lost 148–246.
  - 1366x768, 3 players: 10 rounds, 46 decisions, lost 158–160–157.
  - Also one computer-only game at 390x763, used to check the end screen.
- **Save/resume:** I reloaded mid-game in round 3 in both full games. "Continue the saved game" brought back the
  same state (round, coins and log count were identical).
- **Undo:** checked at 1366 by real clicks: lift, drop one, "Undo last drop", then "Put them back".
- **Hot-seat:** set up 2 humans at 375x553. **Online:** hosted a lobby at 375x553, and a second browser context
  opened the `#join-CODE` link.
- **Rules:** I read the log of both games. A node harness wrapped the engine for 45 computer games (2/3/4 players,
  base game) and checked:
  - every drop is adjacent, never an immediate step back, and the last meeple lands on its colour;
  - play order follows the bids, with ties going to the later bidder;
  - the game ends in the round of the last camel;
  - Advisors, Sages, tiles, palms, palaces and goods sets, recomputed independently.

  Result: **0 violations, 0 score mismatches.**
- **AI levels:** hard vs easy over 40 games, and hard vs normal over 20 (`node`, base game, seats swapped).
- **Errors:** **0 page errors and 0 game console errors** in every run. The only console lines were the
  Google Fonts requests I aborted myself, plus relay WebSocket and certificate failures during the online test.
- **Load time on localhost:** the load event at 1.1 s; the opening scene at 2.7–3.4 s on phone and desktop; the first
  game frame 3.4–4.9 s after "Begin".
- **Not tested:**
  - real devices, iPhone Safari bars and app switching;
  - real GPU frame rate and battery;
  - screen readers;
  - a full online game: the Nostr relays are unreachable from this sandbox, so the joining browser stayed on
    "Looking for the host…". The online flow is covered in `ONLINE-REPORT.md` but not re-verified here.
  - expansions in a full played game (the existing `cover.js` and `gauntlet.js` cover them).

## Scores (0–5)
| Area | Score | Evidence |
|---|---|---|
| A. Game itself | 3 | Base game plus 3 expansions and promos. My independent checks found 0 rule violations in 45 games. The in-app tie rule contradicts the engine. The computer levels barely differ (hard 22 – easy 17 – 1 tie over 40 games). |
| B. Learning | 3 | There is a guide toggle, a plan picker with "why" lines and Advise me. No step-by-step tutorial; the rules are one long page with no short version or search. The Card list has counts but no pictures for djinns, items or Cutpurses, no tap-to-zoom and no filter. |
| C. Comfort | 3 | Undo works inside a move. The log, the "While you waited…" recap and the end breakdown are good, and save/resume survived a reload. Settings cover only graphics, sound/music on-off and computer speed. |
| D. Friends | 3 | P2P lobby with code and link, rejoin and host migration (per ONLINE-REPORT; relays unreachable here). Hot-seat works (open information, so no pass screen is needed). No async play, no emotes, and no timeout message when no relay answers. |
| E. Look/sound/feel | 3 | Rich 3D table on desktop (`08`) and real CC0 samples plus music. On phones the tile names are unreadable, the meeples are about 10 px and told apart by colour only, the card "art" is code-drawn and cropped (`04`, `05`), and there are no haptics. |
| F. Quality | 3 | 0 errors, no page scroll at any size, tap targets 44 px or more on phones. 2.2 MB file, fast first screen. No colour-blind support, no service worker or manifest, Google Fonts loaded from the network, and desktop bar buttons are 40 px tall. |
| G. Product/store | 1 | `rules-notes.md` is published next to the game and names the original (P0 legal). No icon, manifest, privacy or terms page, profile or statistics. The suite reference page is not reachable from inside the game. |

## Problems

### P0: blocks paying users
1. **Original game, designer and publisher named in public files.**
   - **What I saw:**
     - `games/sands-of-qamar/rules-notes.md` is deployed beside the game and served publicly (`/sands-of-qamar/rules-notes.md` returned HTTP 200, 4,789 bytes).
     - Its first line names the original game, its designer and its publisher, and it gives the original titles of the expansions.
     - The same text is in the tracked `games-src/ft/rules-notes.md` and in `games-src/ft/build_data.py`, in a public GitHub repository.
     - The shipped HTML itself is clean (no original names).
   - **Why it blocks:** selling a faithful adaptation also needs a publisher licence, or a redesign (PRODUCT-BAR §26).
   - **Fix:**
     1. Delete `rules-notes.md` from `games/`, and stop the deploy step from copying `*.md` into `games/`.
     2. Move the named lines to the private research repository, and keep a name-free `rules-notes.md` in source.
     3. Scrub `build_data.py`.
     4. Add a pre-deploy grep that fails on a blocklist of original names. **[shared]**
   - **Effort:** S. A licence decision is still needed before any sale.

### P1: clearly below a paid app
2. **The card reference is incomplete and hard to use.** This confirms the owner's "card reference is missing"
   complaint in part. The in-game "Card list" exists (bar on desktop; ☰ → Card list on phones, which is 2 taps) and
   shows counts for meeples, tiles, goods and items. But:
   - the 28 djinns, 9 items and 6 Cutpurses have **no picture** (`06`);
   - Cutpurses and djinns show no count;
   - the tribe and tile pictures are generic SVGs, cropped (`04`);
   - it is one column of 70 cards, 14,240 px tall on a 390 px phone, with no tabs, filter or search;
   - tapping a card does nothing (checked at 1366 and 390);
   - the djinns on offer in-game show the same lamp picture, only recoloured (`05`).

   The suite page `games/reference.html` has 80 Sands entries with the same sections and texts (39 with counts). It
   is text only and opens only from the shelf, not from the game.
   - **Fix:**
     - Give every djinn, item and Cutpurse its own picture (keyed by file name).
     - Add section tabs and a search box.
     - Show a count on every entry.
     - Add tap / long-press to open any card big, in the reference, the djinn row and the market.
     - Add a "Reference" link from the game menu to `reference.html#sands`, or embed the same data. **[shared]**
   - **Effort:** M (art: L).
3. **Computer levels feel the same.** `src/ai.js:3` changes only noise and search depth. Results:
   - hard vs easy, 40 games: 22–17–1, average 223 vs 220;
   - hard vs normal, 20 games: 9–11;
   - both levels decide in about 0.8–2 ms.

   A newcomer cannot get an easier or harder opponent.
   - **Fix:** make the levels differ in strategy, not only noise:
     - easy ignores Advisor majority, overbids, and never holds goods for sets;
     - hard looks ahead to the rivals' next turn.

     Then tune them in a node gauntlet until hard beats easy at least 75%.
   - **Effort:** M.
4. **The in-app tie rule contradicts the engine.** The "How to play" text says "Ties go to the player with more
   coins" (`src/rules-html.js:34`). `finish()` (`src/engine.js:252`) shares the win instead. 1 of my 45 computer
   games ended in a tie.
   - **Fix:** check the rulebook's tie rule, then make the rules text and the engine agree. Add a rules-test for it.
   - **Effort:** S.
5. **Settings are thin** (`src/ui.js:207`, `12`).
   - Missing: volume sliders, a separate animation speed, text size, a colour-blind mode, left/right hand and
     reduced motion.
   - The developer tools "Show speed / Test speed" are exposed in the player menu.
   - **Fix:** use the shared shell's settings panel, with volume, animation speed, text size and colour-blind
     options. Move the PerfHUD buttons under an "Advanced" fold. **[shared]**
   - **Effort:** M.
6. **Colour is the only cue for the tribes and the players.**
   - The tribes are identical turned pawns told apart only by yellow, white, green, blue and red.
   - Green Traders and red Shadows look the same to red-green colour-blind players.
   - On phones a pawn is about 10 px and the tile names are unreadable (`02`, `10`).
   - **Fix:** a shape or emblem per tribe (a hat or headgear on the pawn and on the chips), a high-contrast tile
     label mode on phones, and a "tap a tile to see its contents" sheet.
   - **Effort:** M.
7. **Desktop bid buttons start below the fold.** At 1366x768 the expanded "While you waited…" recap pushes the
   bid "Take" buttons out of view from round 2 onwards (`07`), so the player must scroll the dock to bid.
   - **Fix:** put the decision first and the recap below it (or collapsed). Auto-scroll the dock to the first
     action button.
   - **Effort:** S.
8. **No real tutorial, and the guide repeats itself and hides the controls on phones.**
   - The guide is a toggle that shows a full-screen coach card with "Continue" before many decisions. The same
     "Your turn" text came back in round 3 (`03`).
   - The coach card covers the plan and undo buttons until it is dismissed.
   - There is no guided first game that teaches one idea per step, and no short-rules page or glossary.
   - **Fix:**
     - Show each tip once, then keep a one-line hint in the dock.
     - Add a scripted 2-round guided game, a one-screen "Rules in 1 minute", and tap-for-definition on game words
       (Mystic, Shrine, set…).
   - **Effort:** L.
9. **Not an installable product yet.**
   - No app icon, web manifest or service worker, so the game can't be opened offline from a home screen.
   - Google Fonts load from the network.
   - No privacy, terms or credits page outside the rules drawer.
   - No statistics, profile or achievements.
   - **Fix:** shelf-level PWA (manifest, service worker, icons), bundled fonts, and a suite legal page. **[shared]**
   - **Effort:** M.

### P2: polish
10. **Stale hint on the end screen.** After the game ends, the dock still says "You are 2 behind Teal. ⏳ A player is
    down to their last camels: the end is near." (`09`).
    - **Fix:** hide the progress hints when `G.over` (`src/ui.js:35`).
    - **Effort:** S.
11. **Log grammar and flavour text.**
    - "Onyx's Shadow takes **a Advisor**" (`src/engine.js:133`).
    - In the recap, a Shadow's kill is followed by "The Advisors bow and join your court."
    - **Fix:** use the right article ("an Advisor"), and add flavour only to tribe actions you take, not to kills.
    - **Effort:** S.
12. **No timeout message on a failed online connection.** When no relay answers, the joining player sees "Looking
    for the host…" for good, with no explanation or retry (`11`).
    - **Fix:** after about 20 s, say that the connection could not be made, and offer Retry or "Play hot-seat
      instead". **[shared]**
    - **Effort:** S.
13. **The lobby's sticky Start button overlaps the seat text at 375x553** (`11`, "Seats go in the order…").
    - **Fix:** give the lobby body bottom padding equal to the sticky footer's height.
    - **Effort:** S.
14. **Desktop tap targets are 40 px tall.** This applies to the top-bar buttons, the drawer close (×) and the plan
    "Show / Do this" buttons (32 px). Phones pass. The player-sheet labels are 11.5 px.
    - **Fix:** a minimum height of 44 px, and 12 px or larger for small text. **[shared]**
    - **Effort:** S.
15. **One 3D tile tap missed.** In the phone game, two taps at the projected centre of tile 9 did not register, so the
    harness fell back to its hook. The plan buttons always worked.
    - **Fix:** use a larger pick radius on touch, or pick by the tile's top face rather than the pawns.
    - **Effort:** S.
16. **Simplifications already listed in `rules-notes.md`:**
    - the Sultan's whim cards are left out;
    - the item mix, some djinn points and the 5-player track are guessed.

    Confirm them against the rulebook before claiming "complete".
    - **Effort:** M.
17. **No end-of-game rematch, statistics or history,** and no "last turn" summary outside the recap.
    - **Fix:** a "Rematch with same settings" button and a per-game history in local storage. **[shared]**
    - **Effort:** S.

## Top 5 fixes (value for effort)
1. **Remove `rules-notes.md` from `games/`** and scrub the names from the tracked sources, and add a deploy
   blocklist grep (P0, S, [shared]). Decide on licence vs redesign before any sale.
2. **Make the Card list complete:** pictures for every djinn, item and Cutpurse; counts everywhere; tabs and
   search; tap-to-zoom; and a link from the in-game menu to the suite `reference.html` (P1, M, [shared]).
3. **Put the decision first in the dock and show each coach tip once** (P1, S–M). This fixes the bid buttons below
   the fold on desktop and the controls hidden on phones.
4. **Real difficulty levels**, tuned in node until hard beats easy at least 75% (P1, M).
5. **Shared settings and accessibility pass** (P1, M, [shared]):
   - volume, animation speed, text size and colour-blind mode;
   - a tribe emblem on each pawn;
   - 44 px buttons on desktop;
   - fix the tie-rule text, the stale end hint and the log grammar (all S).

## Screenshots (`games-src/ft/audit-shots/`)
`01-opening-390`, `02-move-dock-390`, `03-coach-card-covers-controls-390`, `04-cardlist-tribes-cropped-art-390`,
`05-djinn-art-placeholder-390`, `06-cardlist-djinns-no-pictures-1366`, `07-bid-buttons-below-fold-1366`,
`08-plan-picker-1366`, `09-end-stale-hint-1366`, `10-end-390`, `11-online-lobby-375`, `12-settings-390` (all `.jpg`).

## Suite-level notes (fix once for every game)
These came from auditing both this game and The Thornbound Throne (`games-src/thornbound/AUDIT-PRODUCT.md`).

1. **Legal and name hygiene (P0).**
   - Real titles, publisher and designer names sit in tracked public files: rules notes, sources, card data and build scripts in several game folders. One is even deployed under `games/`.
   - **Fix:**
     - Move all research text to the private research repo.
     - Stop the deploy step from copying `*.md` into `games/`.
     - Add a pre-commit or deploy blocklist grep.
     - Scrub the history before the repo or any paid build goes public.
   - Selling a faithful adaptation needs a publisher licence, or the game must be redesigned enough to be our own. Decide this per game before any store work.
2. **One reference component.**
   - Both games fail the "every component with picture, text and count, two taps away, tap to read big" bar:
     - Thornbound has no reference at all.
     - Sands has a Card list without pictures or counts for djinns, items and Cutpurses.
   - The shelf's `reference.html` covers some games, but only from the shelf.
   - **Fix:** a shell drawer that renders each game's own data tables (the same source as `refpage/gen.py`), with tabs, search, counts and zoom, opened from every game's menu and from every card pop-up.
3. **One settings panel in the shell.**
   - Every game rolls its own thin menu.
   - **Fix:** a shared panel with:
     - SFX and music volume;
     - animation and computer speed;
     - text size, colour-blind palette and reduced motion;
     - left/right hand;
     - graphics level;
     - language-ready strings;
     - credits and licences generated from the audio and font asset lists, so they don't go stale. Thornbound still claims "placeholder synthesised tones".
   - Keep developer tools (PerfHUD buttons) under an "Advanced" fold.
4. **Edit-until-confirm and undo.**
   - Give secret or simultaneous choices a shared "commit row": change your mind until "Confirm" or until the last player locks in.
   - Give a single-step undo for unrevealed own moves.
5. **End screen and history.**
   - A shared end card with:
     - a full score breakdown (every source plus steals, never top-5 only);
     - a per-round score graph;
     - "Rematch with the same settings";
     - a local game history and stats.
   - The same card should work online, where clients get the stats.
6. **Online robustness.**
   - Both games depend on free public Nostr relays and show "Looking for…" forever when none answers.
   - **Fix in `netroom`:**
     - a timeout with a clear message and Retry, plus "Play hot-seat instead";
     - quick emotes;
     - a consistent host-leaves policy (Sands migrates the host; Thornbound ends the game).
   - A paid product needs our own small signalling/relay server, which also enables async play.
7. **Save format.** Saves are versioned (`v:1`) but never checked on load.
   - **Fix:** one shared `saveGame/loadSave` with a version check, plus an "your old save is from an older version" message.
8. **PWA and store basics.**
   - **Fix:**
     - a manifest, icons and the service worker for every promoted game (including preview slugs once promoted);
     - bundled fonts, not Google Fonts;
     - a privacy/terms/credits page;
     - opt-in crash reporting.
9. **Phone layout rule.**
   - On small phones (375x553) both games give the board most of the height while the decision gets about 90–150 px.
   - **Fix:** add a shared `phfit` option to collapse the board to a strip on list questions, and a rule of one decision first, recap after.
10. **Tips and coaching.**
    - Both games repeat tips or show the wrong phase's tip.
    - **Fix:** a shared coach helper that shows each tip once per concept, per phase, and keeps a one-line hint in the dock afterwards.
