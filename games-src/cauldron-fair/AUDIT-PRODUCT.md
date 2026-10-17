# Cauldron Fair: product audit (Oct 2026)

Build checked: `games/cauldron-fair/index.html` (1.88 MB). Its engine, data, AI, net and UI code are the same as `src/`
(the only difference to `cauldron-fair.html` is the copyright header). Played in Chromium (Playwright) with touch enabled
at 390x763 and 375x553, and with a mouse at 1366x768:
- the guided first game, all 9 days (won 52 to 28 against Odo on easy);
- a full 3-maker game against the computer at 375x553 (Odo easy, Tamsin hard). Tamsin won 63, Odo 41, me 33. I reloaded
  on day 4 and resumed;
- 3 days of hot-seat with 3 people;
- the online host screen, plus a second browser that joined through the invite link;
- every header drawer (Scores, Log, Cards, Rules, Menu), Configure and Watch, and two forced fortunes (Pedlar's Pick,
  Peek and Pick).

Node runs: `rules-test.js` 95 of 95 pass. `gauntlet.js 40 3 hard easy`: 0 errors, 0 stalls, hard wins 56.7 % per seat
against easy's 3.8 %. `gauntlet.js 30 4 normal`: 0 errors, 0 stalls.
Console during offline play: no errors except a 404 for `/favicon.ico`.

## Scores

| Area | Score | Evidence |
|---|---|---|
| A. The game itself | 4 | All 9 days, 4 book sets plus a random mix, 2 to 4 players, all 24 fortunes, Stir! on day 9 and the rules-audit fixes are in. The test-tube side from the base box is missing. Three AI levels, nothing silly seen, about 5 ms per decision. |
| B. Learning | 4 | The guided game has 12 one-line tips with "More". There is a board legend (coins / VP / ruby / path), a risk bar that stays visible, a "Turn in one minute" rules card and a complete reference with counts (`guided-day1-390.jpg`, `desktop-reference.jpg`). Missing: tap a chip or card to read it big, a glossary, rules search. |
| C. Playing comfortably | 2 | No undo and no confirmation anywhere. Settings are only on/off sound and music, AI speed, guide level and graphics: no volume, text size, colour-blind mode or left hand (`desktop-menu-settings.jpg`). One save slot, and a version bump silently drops it. The end screen splits points by day only. |
| D. Friends | 3 | Hot-seat is good: an opaque pass screen, the report shown once, then private choices (`hotseat-pass-390.jpg`). Online has a code and an invite link, and an empty seat goes to the AI. The host leaving ends the game. No emotes or chat, no async play. P2P could not connect in the sandbox. |
| E. Look, sound, feel | 3 | One painted style that reads well at phone size, with chips that tween, confetti and real CC0 sounds plus music. The art is still the code-drawn placeholder set. Chip types differ only by colour. No haptics. No clipping at 390x763 or 375x553 (`brew-375x553.jpg`). |
| F. Quality | 3 | First paint about 0.1 s locally, 0 JS errors, 0 stalls. The page is not on the shelf or in the service worker, so it does not work offline. The board is one canvas with one label, Escape is the only key, and chip type is shown by colour alone. |

## Problems (worst first)

### P0
None found. No rule bugs, no crashes and no dead buttons in the games I played.

### P1
1. **No undo, no confirmation.** A mis-tap on Draw, Flask, Stop or a shop chip can't be taken back, and none of
   them asks first. Where: `src/ui3.js:34` `act()` applies at once; there is no `undo` anywhere in `src/`.
   Fix: undo the last unrevealed choice (an unconfirmed shop cart already exists; add "Undo Stop" until the AIs finish,
   and an undo for the flask). Snapshot `G` before each human move in vs mode. Effort M. **[shared]** pattern.
2. **Settings far below a paid app.** No volume sliders, text size, colour-blind mode, left-hand dock, animation
   speed or language-ready strings. Where: `desktop-menu-settings.jpg`, `src/ui5.js:83`.
   Fix: put these in the shared shell's settings drawer (`games-src/shell/`) and read them from each game. Effort M. **[shared]**
3. **Chip types differ only by colour** (green/red/orange discs with a number). That is a problem for colour-blind
   players and in dim light. Where: `fortune-choice-390.jpg`, `brew-risk-390.jpg`.
   Fix: give each colour a small symbol or pattern on the chip (leaf, feather, cap, sun, moon, moth) in `kit.js` and the
   Pixi textures, and name the chip in its aria-label. Effort M.
4. **The shop is below the fold on short phones.** At 375x553 the day report opens on the table and log. The stalls
   start under the fold and the only cue is a purple edge (`report-shop-hidden-375x553.jpg`).
   Fix: on phones, collapse the table and log to one summary line ("You +1, Odo +3, Tamsin +0 · details") while you
   have to decide, or scroll the decision into view. Effort S.
5. **Online is fragile.** In the sandbox every public signalling relay failed (certificate/proxy errors). After 45 s the
   guest still showed "Connecting..." and "Waiting for the host to start..." with no error and no retry
   (`online-join-waiting-390.jpg`). When the host leaves, the game ends for everyone (`src/net.js:48`). No emotes.
   Fix: time out after about 15 s with "Could not reach the other player - check the code / try again". Let a guest
   take over as host from the last state. Add 4 to 6 quick emotes. Effort M (timeout S). **[shared]** (netroom).
6. **Test-tube side missing.** It is the advanced variant printed on the back of the player board in the base box
   (`rules-notes.md` "Not built"). The rewards per tube are still unknown.
   Fix: read the tubes off a photo of the real board, then build it as a setup toggle. Effort M.
7. **Not on the shelf, so no PWA or offline play.** No favicon (404), no apple-touch-icon or manifest link, and no
   service-worker registration on the page. The game is not in `games/index.html` or `games/covers/`.
   Fix: add it to the shelf (cover, icon, sw precache list) like the other games. Effort S. **[shared]**
8. **End screen and history are thin.** It splits points by day only, with no split by source (scoring space, die,
   chip powers, fortunes, conversion), no stats and no "rematch with the same settings". It says "Wynne wins" rather
   than "You win" (`final-guided-390.jpg`, `src/engine.js:686`). The log calls you "Wynne" while the table says "You".
   Fix: add a per-source breakdown row and use "You" for the viewer in log and end text. Effort S to M. **[shared]**
   end-screen pattern.

### P2
9. **Typo "rubyies".** Seen in the log ("takes 3 rubyies (Pedlar's Pick)") and on two option labels.
   Where: `src/engine.js:148`, `:274`, `:288` (`'ruby' + (n > 1 ? 'ies' : '')`). Fix: `n > 1 ? 'rubies' : 'ruby'`. Effort S.
10. **Wrong hot-seat dock line.** Behind the pass screen the dock says "The computers are brewing." in a game with
    3 humans. Where: `src/ui2.js:45`. Fix: say "Waiting for <name>". Effort S.
11. **Header icons still have no text on phones.** A first-game banner explains them once (`guided-day1-390.jpg`).
    After that, Log, Cards and Rules look alike. Fix: tiny captions under the icons at width ≥ 360. Effort S. **[shared]**
12. **Small tap targets.** The legend close button is 44x28 and the fortune bar is 29 px high. At 375x553 the
    fortune bar sits below the Draw button and is cut off. Fix: make the fortune bar 44 px tall or put it into the
    sticky line. Effort S.
13. **The rules drawer is long and has no search** (about 900 words). The short card on top helps, but there is
    nothing to collapse or search (`src/ui5.js:3`). Fix: shared collapsible sections and a filter box. Effort S. **[shared]**
14. **Stir! floods the log on day 9.** When one cauldron is left, every chip adds "X has decided." and "Stir!
    Everybody shows their choice." Fix: skip the commit step when only one cauldron can still draw. Effort S.
15. **No long-press or tap-to-read.** Tapping a chip on the board, the fortune or a stall chip does not open a big
    readable card. The text exists in the reference. Fix: a shared "inspect" popover on long-press or tap. Effort M. **[shared]**
16. **Resume is the third title button** (`src/ui5.js:117`), and New game overwrites the single save without asking.
    Fix: put Resume first when a save exists, and confirm before replacing it. Effort S. **[shared]**
17. **No haptics** on draw or explosion (no `navigator.vibrate` anywhere). Effort S. **[shared]**

## Top 5 fixes (value per effort)
1. Undo the last unrevealed choice, and confirm Flask/Stop on a first game (P1-1).
2. Shared settings: volume, text size, colour-blind symbols on chips, left hand (P1-2, P1-3).
3. Short-phone report: collapse the table while a shop or ruby decision is open (P1-4).
4. Online timeout with a clear error and retry, plus emotes; then host hand-over (P1-5).
5. Shelf entry with icon, favicon and the service worker, plus the "rubyies" and "computers are brewing" text fixes
   (P1-7, P2-9, P2-10). All of them are S.

## Earlier findings: did the fixes land?

Rules audit (`AUDIT-RULES.md`):

| # | Finding | Status | Evidence |
|---|---|---|---|
| 1 | Trade wind kept the purples it traded | fixed | `src/engine.js:454` discards them; rules-test passes |
| 2 | Upgrade sigh moved the scoring space | fixed | the space is frozen when powers start (rules-notes "Audit fixes"); test passes |
| 3 | VP from purple fortunes counted after the rat tails | fixed | `engine.js:91,393`. Log, day 2: Clear the Pods points come before "trails by 2 rat tails" |
| 4 | Do-over offered after an exploding 5th chip | fixed | `engine.js:204` (`!p.boom`) |
| 5 | No day-9 Stir! | fixed | seen in both full games ("has decided" ... "Stir!") |
| 6 | Optional powers could not be lowered | fixed | Gentle sigh asks for a level (`engine.js:289`); the Lucky-seven slide can be declined |
| 7 | Bonus-die faces | still open | changed to 1 VP twice (`data.js:99`); still unverified against a real die |
| 8 | Haggler's Hour white upgrades | fixed | `engine.js:131` uses only coloured chips |
| - | Test-tube variant | still open | not built |

Newcomer review (`REVIEW-NEWCOMER.md`):

| # | Finding | Status | Evidence |
|---|---|---|---|
| 1 | Risk hidden behind the buttons | fixed | sticky "33 % to explode, 9 coins, 1 VP" above Draw/Stop, also at 375x553 (`brew-375x553.jpg`) |
| 2 | Tips cover the board | fixed | one-line tip card with More / Got it in the dock (`guided-day1-390.jpg`) |
| 3 | Tips late or hidden behind the report | partly | there is now a tip slot inside the report (`ui4.js:30`); not checked for every tip |
| 4 | Fortune choices clipped | fixed | 2-column grid, all 6 Peek and Pick options visible (`fortune-choice-390.jpg`) |
| 5 | White limit 7 vs 9 | fixed | "White limit N today (reason)" (`ui2.js:63`); the guided day 1 fortune does not change the limit |
| 6 | Rules a wall of text | partly | "Turn in one minute" card added; no collapsing or search |
| 7 | Spiral unreadable | partly | legend strip and path arrows added, gold ring shown before the first draw; VP badges still small on phones |
| 8 | Shop scroll reset, bare prices | fixed | scroll position kept (`ui4.js:26`), coin icon on every price |
| 9 | Pointless day-9 chip rewards | fixed | rules-test "day 9: ... skipped or reduced" passes |
| 10 | Setup hides the guided game | fixed | Guided is the green primary button; one Done |
| 11 | Header icons without text | partly | one-time explainer banner; icons still have no captions |
| 12 | Report modal resizes, winner leaks | fixed | fixed-height report, "Choose above first"; the final modal covers the dock |
| 13 | Hot-seat repeats the report | fixed | table shown once, then "Next: private choices" with a pass screen per player |
| 14 | Landscape tight | not retested | |
| 15 | Wording, "(0 of 9)", flask too prominent | fixed | "(0 of 9 chips would explode)"; Flask is a smaller secondary button |

## G. Product and legal (game-specific)
- **Legal, blocks selling.** This is a faithful adaptation of a published bag-building game: same mechanics, the
  54-space track values, every book cost, all 24 fortune effects and the component counts. Names, text and art are
  original, which is fine for free play among friends. **Selling it needs a licence from the publisher, or a redesign
  big enough to make it our own.** That would mean a new track and economy, new chip powers and new fortunes, not
  only new names. Both the menu and the rules say "Cauldron Fair is an original game ... the rules follow the box"
  (`src/ui5.js:38`, `:96`). For a paid product that claim is wrong; reword it to "an adaptation, unofficial".
- Store needs that are missing for this game: shelf cover and icon, store screenshots, a credits page that lists the
  art generator (audio credits exist in the rules drawer), stats and achievements.
- Copyright and legal hygiene: the deployed file has the copyright header. I did not find the original title in the
  shipped HTML.

## Not tested
- A real WebRTC game: the public signalling relays fail in this sandbox (certificate and proxy errors), so I read
  the code for rejoin and AI takeover (`src/net.js:8`, `:48`).
- Real iPhone Safari: safe areas, app switch and resume after the tab is suspended. Low-end phone speed. Landscape.
