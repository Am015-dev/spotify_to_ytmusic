# Shipwreck Isle: product audit (Oct 2026)

Audited against `games-src/PRODUCT-BAR.md`, using the deployed `games/shipwreck-isle/index.html` (3,860,581 bytes)
served locally in headless Chromium (SwiftShader WebGL). This is an audit only: no game code was changed.

**What I played**
- **Game 1, a first game:**
  - setup: Marooned, Standard, Carpenter + Cook + Friday;
  - played at 390x763 with an iPhone user agent and touch;
  - every day planned with "💡 Plan for me", random picks on adventure choices.
  - Result: lost on day 8, when the Carpenter died of hunger after the storm and the Big Cat attack.
- **Game 2:**
  - setup: The Hexed Isle, **Easier**, same castaways;
  - played at 390x763 and 375x553, with a reload and "Continue the saved game" on day 2.
  - Result: lost on day 9 (Carpenter killed by "Collapse at Camp" with no palisade left).
- **Desktop 1366x768:**
  - title, Card list (every tab and search), Rules, the Camp/Log drawers and the settings row;
  - the online Host lobby;
  - day 1 played through.
- **Second tab joining:** not tested. The sandbox's proxy blocks the public relays, so the room stayed at "Looking for
  players…". This is a test-environment limit.
- **Log check:** I read both game logs (242 lines in game 1) against `rules-notes.md`. Everything I checked matched:
  - Production from the camp tile;
  - morale −3 turning into wounds when determination runs out;
  - heating at 1 wood per snow cloud;
  - clouds over the roof ruining food and wood;
  - storms lowering the palisade;
  - the beast fight at strength 3 against the weapon;
  - threats pushed off the left slot firing;
  - adventure cards shuffled back as events;
  - eating at 2 wounds per missing food.

## Scores

| Area | Score | Evidence |
|---|---|---|
| A. The game itself | 3 | The engine and decks are complete for the base box (73 events, 90 adventures, 52 mysteries, 16 beasts, 30 inventions…). But only **4 of the 6 non-licensed scenarios** are in: Volcano and Cannibals are missing. The computer castaways and **Plan for me win about 0–10%** (`rules-notes.md`), and following them I lost both games. |
| B. Learning the game | 4 | Best-in-suite guidance: a 4-step plan wizard ("what today needs", jobs, risks, start), *Today's priorities* with "Do it", odds on every job, a story scene per moment, and a **Card list with tabs and search**. Missing: pictures on cards, a glossary, and tile labels on phones. |
| C. Playing comfortably | 3 | The plan can be changed freely until "Start day", the log has round markers, and the save survives a reload. But there's no undo after a story choice, resume skips the unseen scenes and says "Nothing happened", and the settings are minimal. |
| D. Playing with friends | 3 | Online P2P co-op lobby with seats, empty seats played by the computer, and ready/unready. Shared-screen co-op works by setting castaways to "You" (no hidden info, so no pass screens are needed). No chat or emotes, no host migration, no player name field (the host is "Host"), no async play. |
| E. Look, sound and feel | 3 | Lit 3D diorama with day/night, rain and fire, and a journal-page story with flavour text. But on phones the island is a dark top-down blur: unexplored tiles are near-black, labels are hidden, the camp is half off-screen, and the night/end views are almost black. Cards have no art. |
| F. Quality | 3 | No game errors in the console (only a favicon 404). But it's 3.9 MB, the fonts come from Google's CDN, and the layout overlaps at 375x553. |

## Problems

### P0: blocks paying users

1. **[shared] Original names are published on the live site.**
   - **Seen:** `games/shipwreck-isle/rules-notes.md` is deployed next to the game. Line 3 names the original game, its
     publisher and its catalogue id; lines 34–35 use the original scenario names.
   - **Why it matters:** selling a faithful adaptation needs the publisher's licence (PRODUCT-BAR §26), and this file
     states exactly what it adapts.
   - **Fix:**
     - stop deploying `rules-notes.md`;
     - keep the real names only in the private research repo;
     - decide between licence and redesign before selling.
   - **Effort:** S (the file), L (the decision).

2. **A newcomer following the game's own advice loses.**
   - **Seen:** in both games I used "💡 Plan for me" every day: lost on day 8 of 12 (Standard) and day 9 of 10
     (Easier). The headless win rates in `rules-notes.md` are 0–10%, against the shelf's 30–50% target.
   - **Why it matters:** the button is named like a helper but plays badly. A paying newcomer meets "Lost on the
     island" after 30–40 minutes without being told what went wrong.
   - **Fix:**
     - strengthen the planner: its food and shelter priorities, and keep a palisade or weapon up when a beast threat
       is in the slots;
     - add an **end-of-game "what went wrong" breakdown** (food over time, wounds by cause, the threats you ignored);
     - add a gentler "first island" setup, such as Easier plus a short scripted day 1–3 with "why" on each job.
   - **Effort:** L (planner), M (breakdown).

### P1: clearly below a paid app

3. **Two base-box scenarios are missing.**
   - **Seen:** Volcano and Cannibals, as `rules-notes.md` says. Scenario 7 is a licensed bonus sheet and is rightly
     skipped.
   - **Fix:** build the volcano map with lava spaces and the village fights. Also number the scenarios as in the box,
     not 1–4: the in-game "4. Settlers" is the notes' scenario 6.
   - **Effort:** L.

4. **The end screen offers "Try it on Easier" on Easier.**
   - **Seen:** the buttons are added for every loss whatever `G.diff` is (`rc/ui.js:146`). It showed after the Easier
     game (`audit-shots/11-end-easier-bug.jpg`).
   - **Fix:** hide it when `G.diff==='easy'`, and show "Try it on Standard" after a win.
   - **Effort:** S.

5. **On phones the island has no tile labels.**
   - **Seen:**
     - at 390x763 the map shows only numbered circles (1, 2, 3, 5 … 15) with no meaning given;
     - the terrain, source and camp labels that desktop shows ("8 Beach · camp", "7 Plains", "?2 Explore",
       `audit-shots/07-desktop-actions.jpg`) are missing (`audit-shots/02-day1-phone.jpg`, `04-adventure-choice-phone.jpg`);
     - the camp tile sits half off the right edge;
     - at night and on the end screen the map is nearly black.
   - **Fix:**
     - show compact labels (icon plus terrain) on phones;
     - frame the camera on the explored tiles plus the camp;
     - lift the night exposure on Low graphics.
   - **Effort:** M.

6. **[shared] At 375x553, choices hide below the fold and the pinned button covers text.**
   - **Seen:**
     - the Night "treat the wounded?" choice and "Done for tonight" are off-screen with no scroll hint
       (`audit-shots/09-375-choice-hidden.jpg`);
     - on the threat scene the pinned "Continue ▶" covers the result line (`audit-shots/10-375-overlap.jpg`).
   - **Fix:** reserve room for the pinned action bar in the shared dock CSS, and auto-scroll a new choice into view.
   - **Effort:** S–M.

7. **Resume skips the story and says "Nothing happened".**
   - **Seen:** reloading during day 2's action scenes and choosing "Continue the saved game" jumped straight to the
     Night decision. The scene showed "Result: Nothing happened." (`story.js:67`, `audit-shots/08-resume-nothing-happened.jpg`).
     The action, adventure and weather results that hadn't been seen yet were lost from view.
   - **Fix:** save the scene queue position with `G` and replay the unseen scenes, or show a "While you were away" recap
     built from the log since the last seen scene.
   - **Effort:** M.

8. **The Card list is text only, and the top bar is unreachable from the title screen.**
   - **Seen:**
     - the Card list (`audit-shots/05-card-list.jpg`) is a good searchable text reference with counts, but has no
       pictures;
     - while the title box is open, the top-bar buttons sit behind the modal and can't be clicked, so Cards and Rules
       can't be opened before starting except through "How to play".
   - **Fix:**
     - card art through the art manifest;
     - a "Cards" link on the title screen;
     - make threat, adventure and event cards in the story tappable to open the same entry.
   - **Effort:** M (links), L (art).

9. **No undo for story choices.**
   - **Seen:** adventure decisions ("Leave it" against "Gain 2 food; gain 2 fur and shuffle the card into the event
     deck") and night healing apply on the first tap, with no confirmation.
   - **Fix:** confirm irreversible choices that have a later cost, or allow one undo until the next die roll.
   - **Effort:** M.

10. **[shared] Settings are minimal.**
    - **Seen:** Sound, Sea sounds, speed, graphics and New game only. There's no volume, text size, reduce motion or
      colour-blind option. Castaways are told apart by red and blue pawns.
    - **Fix:** the shared Settings sheet (see the suite notes).
    - **Effort:** M.

11. **[shared] Online is thin.**
    - **Seen:**
      - no quick chat or emotes, no player name field, no host migration (`ONLINE-REPORT.md` known limits);
      - it relies on public relays with no TURN server;
      - no async play.
    - **Fix:** name the field, add an emote/chat channel in `net/netroom.js`, and plan a relay or TURN server.
    - **Effort:** M–L.

### P2: polish

12. **Generated card text has glitches.**
    - **Seen:**
      - "Gain 1 food; gain 1 dry food.." (double full stop, day-1 threat);
      - "gain 2 fur. and shuffle the card…" (`audit-shots/04-adventure-choice-phone.jpg`);
      - "Everyone lose 1 determination" (should be "loses").
    - **Fix:** tidy the text generator (join clauses, then add one final full stop) and run a text lint over every card.
    - **Effort:** S.

13. **The top bar shows ♥10 after the Carpenter died.**
    - **Seen:** the bar shows the lowest *living* life, which reads as "everyone is fine" on the defeat screen.
    - **Fix:** show ☠ when anyone is dead, and show each castaway's life on tap.
    - **Effort:** S.

14. **A log gap: Clothes turn snow into rain silently.**
    - **Seen:** at `phases.js:220`, the night's 1 snow cloud cost no wood and nothing was logged.
    - **Fix:** add a log line, as the Furnace and Blankets already have.
    - **Effort:** S.

15. **The 🧵 thread emoji stands for crosses** ("Crosses raised: 0 of 5"), and the numbered map circles aren't
    explained.
    - **Fix:** use a cross icon, and add a legend line or tooltip.
    - **Effort:** S.

16. **[shared] Fonts come from Google's CDN** (`head.html:7-8`), there's no favicon or manifest link, and the page is
    3.9 MB.
    - **Fix:** inline subsetted fonts, add the icon and manifest, and check the art budget.
    - **Effort:** S–M.

## Top 5 fixes (value for effort)
1. **Take the original names off the live site** (P0 #1). Effort: S.
2. **End-of-game "what went wrong" breakdown**, with "Try it on Easier" shown only when it applies (#2, #4). Effort: M.
3. **Phone map:** tile labels, camera framing and night brightness (#5). Effort: M.
4. **Shared dock fix for short phones**, plus auto-scrolling new choices into view (#6). Effort: S–M.
5. **Resume recap** ("While you were away") instead of "Nothing happened", plus the text-generator tidy-up (#7, #12).
   Effort: S–M.

The largest item is a stronger Plan for me and computer castaway (#2). Until it exists, the helper should not be the
default path for a first game.

---

## Suite-level notes (fix once for every game)

1. **Legal hygiene on the live site.**
   - Deployed `games/<slug>/rules-notes.md` files name the originals: both of mine do.
   - `games/reference.html` and `games/crown-city-smash/index.html` use a real published card game's name as a card
     group and token name (from `ref_kot.json`).
   - **Fix:**
     - add a build-time check that greps every deployed file against a private deny-list of original titles,
       publishers, designers and character names;
     - stop deploying `rules-notes.md`.
   - For selling, every faithful adaptation needs a licence or a real redesign.
2. **Hide the developer tools.** "Show speed" and "Test speed" from `perf/perfhud.js` sit in player menus. Show them
   only with `?dev=1` or F9.
3. **One Settings sheet in the shell**, with labelled rows:
   - sound and music volume sliders;
   - game and AI speed;
   - text size;
   - reduce motion;
   - a colour-blind palette plus glyphs;
   - left/right hand;
   - hints on/off.
   Today each game shows bare toggles such as "On" and "normal".
4. **Card reference in every game.** The shelf already has `reference.html` with complete lists built from
   `ref_*.json`.
   - Add a shared **Cards drawer** component that loads the same data inside each game, with tap-to-zoom on any card
     in play.
   - Until then, link `../reference.html#<slug>` from every Rules drawer.
5. **Short-phone dock (375x553).** In both games the pinned action bar overlaps text and new choices land below the
   fold. Fix it in the shared dock CSS: reserved bottom padding plus scroll-into-view on new prompts.
6. **Self-host the fonts** (offline play and EU privacy), and give every game page a favicon and a
   `<link rel="manifest">` so the suite's service worker and PWA install cover each game.
7. **Saves.** Save after every move (JSON-safe pending questions, not closures), keep a version number and **migrate**
   old saves rather than dropping them, clear the save at game over, and resume with a "while you were away" recap.
8. **Online.** Add quick chat and emotes plus a name field to `net/netroom.js`. Before selling, add a TURN server and a
   small relay of our own instead of volunteer public Nostr relays. Asynchronous play needs a server in any case.
9. **End screens.** Use one shared layout across the suite: result, score or cause breakdown, what to try next (only
   valid suggestions), Rematch, New game and Look at the board.
10. **Identity and store.** There are no profiles, statistics, achievements, privacy policy, terms or opt-in crash
    reporting in either game. They are needed at suite level before any paid release.
