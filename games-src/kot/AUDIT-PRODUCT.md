# Crown City Smash: product audit (Oct 2026)

Measured against `games-src/PRODUCT-BAR.md`. This is an audit only, and no game code was changed.

**How it was tested.** The deployed file `games/crown-city-smash/index.html` (2.47 MB) was served locally and played in headless Chromium (SwiftShader, so graphics Auto picked **Low**).
- **iPhone 390x763.** A first game with "Play now (recommended)": the story card, the 4 tips, and my own turns following the 💡 suggestions. The game ran 10 rounds and Magmaw won with 20 ★. I opened the shop, the menu, the rules, the Monsters panel and the log.
- **Desktop 1366x768.** A full game on Hard with evolutions, costumes and curses. It ran 8 rounds and Boltbox was the last standing.
- **Online.** I hosted on desktop, and a second tab joined from the invite link.
- **Phone 375x553.** A hot-seat game with evolutions, and one roll step.
- **Save and resume** after a reload.
- **Console.** No page errors. The only errors were a blocked Google Fonts request and a 404 for the favicon.

Screenshots are in `audit-shots/`. Screenshots of the setup screen and the rules "expansions" section are deliberately not committed, because they show the original product names (see P0-1).

## Scores (0–5)

| Area | Score | Evidence |
|---|---|---|
| A. The game itself | **4** | Full base game, 2–6 monsters, both mind-token modes, evolutions and 6 more expansions. Two full games with no errors, and the scoring and city rules I checked in the log were right (4×2 = 3★, 6×1 = 4★, yield then enter, last standing). There are 3 AI levels. Some effects apply silently (P1-5). |
| B. Learning | **2** | A story card, 4 tips at the right moments, "🧭 What now?", a 5-step tracker, dashed outlines on suggested dice and a dice preview line. But there is no card reference in the game, the rules are one long page with no short version or search, and there is no glossary. |
| C. Comfort | **3** | The newspaper log ("Clarion") is readable. The desktop end screen has a full breakdown (09). The save survives a reload ("Continue saved game"). But there is no undo, sound and music are on/off only, and there is no text size, colour-blind or left-hand option. |
| D. Friends | **2** | Online has a code, an invite link, a computer that takes empty or dropped seats, and host migration (from the notes, not verified). In this sandbox the two tabs never saw each other. There are no emotes, no chat, no async play, and hot-seat shows secret evolutions with no curtain (11). |
| E. Look, sound, feel | **3** | The 3D city is strong on desktop (08), and the music and samples are real CC0. Every power card uses one of about 6 generic icons (04). The title portraits are flat 2D cartoons, while the in-game figures are 3D vinyl toys. There is no haptic feedback. |
| F. Quality | **3** | 0 page errors and keyboard shortcuts. 2.47 MB in one file. The fonts come from the network, so offline play loses them. The menu shows developer rows ("Show speed", "Test speed"). The save has no version field. |

## Problems, ranked

### P0: blocks paying users

**P0-1. Original product names in the shipped page**
- **Seen:** The setup screen's expansion buttons and the rules drawer name five of the original expansion packs by their published product names. One of them contains the original game's city name. The names of the mind-token and evolution expansions are the original product names too. The original city name also appears in about 70 code identifiers (helper functions named after it) in the shipped HTML.
- **Where:** `kot/exp.js:4` (the `EXPS` names) and `kot/ui.js:143` (`rulesHTML`). This breaks the hard rule in `BRIEF-2d-games.md` and blocks any sale.
- **Fix:** Give every expansion its own name (e.g. "Cultists", "The Tower", "Berserk", "Wickedness", "Costumes", "Curses", "Mind Tokens", "Evolutions"). Rename the code identifiers.
- **Effort:** S. **[shared]:** add a build-time banned-word check to every `build.py`.

**P0-2. Public notes name the original game**
- **Seen:** `games/crown-city-smash/rules-notes.md` is deployed publicly. It names the original game in its first line, cites the reference online implementation, and maps every monster to its original name.
- **Where:** `kot/rules-notes.md:1`, `:85-95`. The same file is copied into `games/`.
- **Fix:** Move the mapping and the sources to the private research repo. Keep a cleaned notes file that uses our names only, and stop copying notes into `games/`.
- **Effort:** S. **[shared]**

**P0-3. No component reference in the game** (the owner's example)
- **Seen:** "Cards" opens only the 3-card shop (04). There is no list of the 64 power cards, 24 mind-token cards, 72 evolutions, 12 costumes, 24 curses or 10 wickedness tiles. Monsters and Yours show only what is in play (`audit-shots/` 05).
- **Where:** The suite's `games/reference.html` lists the cards, but as text only, with no pictures, and nothing in the game links to it.
- **Fix:** Add a Reference drawer to the shared shell, fed from each game's card tables. It needs search, sections, a picture, the text and the copy count, and it should be reachable from the menu and by long-pressing any card. Then add a "Reference" row to every game's menu.
- **Effort:** M. **[shared]**

**P0-4. Selling is blocked without a licence**
- **Seen:** The game is a faithful adaptation (same mechanics, numbers and card set).
- **Fix:** Before charging money, get a licence from the publisher or redesign it enough to be our own. Free sharing among friends is fine.
- **Effort:** L. **[shared]**

### P1: clearly below a paid app

**P1-1. Customise collapses after every tap**
- **Seen:** Every tap on an expansion, skill or player-count button closes the Customise panel, so setting up 3 options takes 6 taps.
- **Where:** `kot/ui.js:118` renders `<details … ${UI.custOpen?'open':''}>`, but nothing ever sets `UI.custOpen`. Confirmed with real clicks at 1366x768 (`open` became `false` after each choice).
- **Fix:** Add a `toggle` listener that stores `UI.custOpen`.
- **Effort:** S.

**P1-2. Hot-seat leaks hidden cards**
- **Seen:** The secret evolution pick says "📱 Pass the device to Voltusk" inside the same panel that already shows both secret cards (11). There is no curtain.
- **Fix:** Use a blocking pass screen ("I'm Voltusk: show my cards") before any panel that shows a hand or a pick, as Doorkick Dungeon does.
- **Effort:** S–M.

**P1-3. Card art is generic**
- **Seen:** `cardIcon()` picks one of about 6 icons (dice, claw, heart, bolt, star, brain) from the card text, so nearly every card in the shop shows a dice (04). This is far from a paid app's one illustration per card. The title portraits (2D) and the game figures (3D) also don't match.
- **Where:** `kot/art.js:88-89`.
- **Fix:** Paint one picture per card and evolution through the art manifest, as the art plan describes.
- **Effort:** L.

**P1-4. The rules are one long page, partly out of date**
- **Seen:** There is no short version, no search and no glossary (06).
- **Where:** `kot/ui.js:143`. The "Online play" section tells players to "share it with them as Contributors or Editors first". That text is left over from an earlier hosting platform and is wrong on GitHub Pages. `rules-notes.md` §v6 says the same.
- **Fix:** Fix the text now (S). Then add a one-screen summary, collapsible sections and search (M, **[shared]** shell component).

**P1-5. Some effects happen silently**
- **Seen:** Start-of-turn curse effects ("lose 2 stars", "the monster with the most hearts loses 1") apply with no log line. In my Hard game, stars and hearts changed with no explanation.
- **Where:** `kot/engine.js:152` and the line after (`loseVP` / `hitSync` with no `lg()`).
- **Fix:** Log every automatic gain or loss with its cause.
- **Effort:** S.

**P1-6. Settings are thin**
- **Seen:** Sound and music are on/off only. There is no volume, text size, colour-blind mode (the dice colours carry meaning) or left-hand dock. "Show speed" and "Test speed" are developer tools shown to players (05).
- **Fix:** Add a shared Settings sheet with sliders and toggles, and move the PerfHUD rows behind `?debug`.
- **Effort:** M. **[shared]**

**P1-7. Online play is rough at the edges**
- **Seen:**
  - The invite link pre-fills the code but still needs a Join tap.
  - The joining tab kept saying "Waiting for the host to start the game…" with "Players here (1)" and gave no "can't reach the host" message after 20 s. (In this sandbox WebRTC could not connect, so a full online game was not verified.)
  - The host has no way to set its display name ("You (you)").
  - There are no emotes or quick chat.
- **Fix:** Auto-join from the link, show a connection-failed state with a retry button after about 15 s, and add a name field and 6 quick emotes in the shared net shell.
- **Effort:** M. **[shared]**

**P1-8. No undo**
- **Seen:** Buying a card and pressing "Done" are final, and there is no confirmation for ending a turn with energy left. Paid apps let you undo unconfirmed choices.
- **Fix:** Snapshot `G` at the start of each human step and add "Undo" until the dice are resolved or new information is revealed.
- **Effort:** M.

### P2: polish

**P2-1. Contradictory dice hint**
- **Seen:** After "💡 Keep suggested", the banner says "Kept the suggested dice", but another die still has the "suggested" outline (02: the 3 is outlined, and only the claw was kept).
- **Fix:** Recompute the outline after keeping, or keep everything that is outlined.
- **Effort:** S.

**P2-2. Story text runs behind the button**
- **Seen:** On 390x763 the story card's bullet text runs behind the sticky "Let's smash" button (01).
- **Effort:** S.

**P2-3. Marquee clipped on desktop**
- **Seen:** The desktop marquee sign is clipped ("…L OF STREN…", 08).
- **Effort:** S.

**P2-4. Save has no version**
- **Seen:** `load()` parses whatever is stored, so a later release can load an incompatible save.
- **Where:** `kot/engine.js:828`.
- **Fix:** Add a `v` field and discard saves from an older format with a message.
- **Effort:** S.

**P2-5. Fonts need the network**
- **Seen:** The fonts load from Google Fonts. Offline, the "Bangers" and "Nunito" look falls back to system fonts.
- **Fix:** Inline subset WOFF2 files.
- **Effort:** S. **[shared]**

**P2-6. No haptics and no install**
- **Seen:** There is no haptic feedback (`navigator.vibrate` is unused) and no per-game "Add to Home Screen" prompt. The suite has a manifest, but the game page doesn't link it.
- **Effort:** S. **[shared]**

**P2-7. Short games on Normal**
- **Seen:** Games are short on Normal: the computer won in 8–10 rounds both times. That is fine for this game, but a "rematch with the same monsters" button would help.
- **Effort:** S.

## Top 5 fixes (value for effort)

1. **Remove the original names** from the page and from the public notes, and add a banned-word check to the build (P0-1, P0-2). S, [shared].
2. **Add an in-game Reference drawer** in the shared shell, fed by the card tables, with long-press zoom (P0-3). M, [shared].
3. **Keep Customise open** while choosing options (P1-1). S.
4. **Add a hot-seat curtain** before secret picks, and log every automatic effect (P1-2, P1-5). S.
5. **Fix the online rules text and the join flow:** auto-join from the link and show a connection-failed state (P1-4 text, P1-7). S–M, [shared].

(The largest single gap after these is card art, P1-3, at L.)
