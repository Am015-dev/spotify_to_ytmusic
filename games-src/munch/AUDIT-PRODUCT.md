# Doorkick Dungeon: product audit (Oct 2026)

Measured against `games-src/PRODUCT-BAR.md`. This is an audit only, and no game code was changed.

**How it was tested.** I served the deployed `games/doorkick-dungeon/index.html` (1.86 MB) locally and played it in headless Chromium.

- **Full game on iPhone 390x763.** "Me vs computer", 4 heroes, Normal. I followed the in-game suggestions for my seat. Tansy won on turn 75 by killing a monster at level 9. I died once.
- **Full game on desktop 1366x768.** 5 heroes, Hard. It ended on turn 58.
- **Phone 375x553.** One fight, and hot-seat with 4 humans over 4 turns (9 pass screens).
- **Other checks:**
  - Card zoom, How to play, the menu and the diary.
  - Save and resume after a reload.
  - The online host screen, plus a second tab joining from the invite link.
  - The suite's `reference.html`.
- **Console:** no page errors, only the blocked Google Fonts request.

Screenshots are in `audit-shots/`.

## Scores (0–5)

| Area | Score | Evidence |
|---|---|---|
| A. The game itself | **3** | The 168-card base deck has every card effect live and 3 AI levels. Two full games ran with no errors or stalls. The log matched the rules I checked: selling 1,000 gold per level with no change, no selling to 10, the win only from a kill, charity to the lowest level, and the helper's treasure. **Missing:** trading items between players (a base rule) and the optional rules. The in-game rules contradict the Halfling card (P1-1). |
| B. Learning | **3** | Very good coaching: "Suggested: …" chains, win-chance lines in fights, who could help and why not (08), and tap-any-card zoom with "when you can play it" (03). **Missing:** a guided first game, a short rules version, search, a glossary, and any in-game card list. |
| C. Comfort | **3** | The diary, the end screen with a table (06) and Continue after a reload all work. **Missing:** undo. Sound and music are on/off only. The computer speed defaults to *slow*. The diary is capped at 400 lines, so early history is lost. Setup choices are not remembered. |
| D. Friends | **3** | Hot-seat has proper pass screens (09). Online has a code, an invite link, computer takeover, rejoin, and simultaneous interrupt windows. **But:** there is no host migration, every hot-seat seat must be human, there are no names in hot-seat, and no chat. The connection was not verifiable in this sandbox. |
| E. Look, sound, feel | **3** | All 147 cards have a consistent illustrated style, the tavern table looks good, cards fly when dealt and played, and the samples are real CC0. **But:** phone cards are 64x91 px with clipped names (02), the monster is hidden in a 375x553 fight (10), the title has no art (01), and there are no haptics. |
| F. Quality | **3** | 0 page errors, ARIA labels and keyboard use. **But:** the fonts come from the network, a desktop drawer button overflows (07), the menu shows developer rows, and starting a new game silently replaces the save. |

## Problems, ranked

### P0: blocks paying users

**P0-1. The public notes name the original game and its publisher.**
- **What I saw:** `games/doorkick-dungeon/rules-notes.md` is deployed publicly. Its first lines name the original game, its publisher, its year and its catalogue id, and they describe where the card data came from.
- **Where:** `munch/rules-notes.md:3-10`, also copied into `games/`.
- **Fix:** Move the sources and refs to the private research repo, ship a cleaned notes file, and stop copying notes into `games/`.
- **Effort:** S. **[shared]**

**P0-2. There is no component reference inside the game** (this is the owner's example).
- **What I saw:**
  - Tapping a card zooms it (03), which is good.
  - But there is no way to browse the 147 cards: what monsters exist, which curses are in the deck, how many go-up-a-level cards there are.
  - The suite page `games/reference.html` lists all of them with counts (12). It is text only, has no pictures, and no button in the game links to it.
- **Fix:** Build a shared Reference drawer, fed by `CARDS`. It needs pictures (the game already renders the card art), search, filters by deck and type, and counts. Reach it from the menu and from "long-press any card → see all cards of this type".
- **Effort:** M. **[shared]**

**P0-3. Selling needs a licence.**
- **What I saw:** The game is a faithful adaptation of a published game, with the same card set and numbers.
- **Fix:** Before charging money, get a licence from the publisher or redesign it enough to be our own. Free sharing among friends is fine.
- **Effort:** L. **[shared]**

### P1: clearly below a paid app

**P1-1. The rules text contradicts the card and the engine on Halfling.**
- **What I saw:**
  - How to play says: "Halfling: sell one item a turn for double. If you fail to run away, discard a card to roll again."
  - The Halfling card says "−1 to run away. Once per turn, sell one item for double its price."
  - The engine applies −1 (`runMod`) and has no discard-to-reroll.
- **Where:** `munch/rules-html.js:34` versus `munch/cards.js` (base-halfling) and `munch/engine.js:244`.
- **Fix:** Make the rules text match the card. Add a test that every race/class line in the rules matches its card text.
- **Effort:** S.

**P1-2. Trading items between players is missing.**
- **What I saw:** Trading is part of the base rules ("Not included" in `rules-notes.md:127-129`). The optional rules are missing too.
- **Fix:** Add a "Trade" action on your own turn, outside a fight: offer an item for an item or a card. Computer players accept when it raises their strength.
- **Effort:** M.

**P1-3. On a small phone, the monster is hidden in a fight.**
- **What I saw:** At 375x553 the monster card sits under the player strip. You see "1 vs 6" and only the monster's top edge (10).
- **Fix:** In the fight phase on short screens, collapse the player strip, or show the monster as a compact row with its name, level and Bad Stuff.
- **Effort:** M.

**P1-4. The phone hand is cramped.**
- **What I saw:**
  - Hand cards are 64x91 px, and their names are cut ("Fizzing Doom…", "Mirror Tw…").
  - The 8th card runs off the screen edge, with no sign that the hand scrolls (02).
  - The hero name is cut to "Pip (…" and the "in play" line is clipped.
- **Fix:** Show a fan or a two-row hand with a "+2" overflow marker, and put the name under the card in the 13-px UI font.
- **Effort:** M.

**P1-5. Hot-seat is all or nothing.**
- **What I saw:**
  - "Friends on one device" makes every seat human. Two friends cannot play with two computer heroes.
  - Players can't type names; seats stay "Pip / Morwen / …".
- **Fix:** On the setup screen, add a Human/Computer toggle and a name field for each seat.
- **Effort:** S–M.

**P1-6. Online play has gaps.**
- **What I saw:**
  - There is no host migration. If the host leaves, the game ends ("The host left"), as `ONLINE-REPORT.md` says.
  - The joining tab showed "Reconnecting…" for more than 20 s, with no failure message or advice. In this sandbox WebRTC could not connect, so a full online game was not verified.
  - The host lobby says "Expansions: none. Change these on the start screen", but the start screen has no expansion options (11).
  - There are no emotes or quick chat.
- **Fix:**
  - Show a connection-failed state with Retry.
  - Remove the expansions line.
  - Add emotes. **[shared]**
  - Host migration needs the hidden hands handed over. That is L, so note it for later.
- **Effort:** S–M.

**P1-7. The diary forgets early events.**
- **What I saw:** The diary keeps only the last 400 lines. In the 75-turn game, `G.ln` was 532 and `G.log.length` was 400, so my own death on about turn 20 was no longer in the diary.
- **Where:** `munch/engine.js:17` (`lg`).
- **Fix:** Keep the full log, or keep a per-round summary for trimmed rounds.
- **Effort:** S.

**P1-8. There is no guided first game, and the title is plain.**
- **What I saw:**
  - "Me vs computer" goes straight into setup, with hints on.
  - There are no step-by-step lessons that explain kicking the door, fighting, running away and charity.
  - The title screen is a parchment page of text with no art (01).
- **Fix:** Add a scripted first game with a seeded deck that makes each key moment happen once. Add a painted title image.
- **Effort:** M.

**P1-9. Settings are thin.** **[shared]**
- **What I saw:**
  - Sound and music are on/off only.
  - There is no text size, which matters with 64-px cards, and no colour-blind mode: card types are told apart by banner colour (crimson, violet, teal, blue, …).
  - The computer speed defaults to *slow*.
  - "Show speed" and "Test speed" are developer tools shown to players (05).
- **Fix:** Use the same Settings sheet as the other games. Default to normal speed, and hide the PerfHUD rows behind `?debug`.
- **Effort:** M.

**P1-10. There is no undo.**
- **What I saw:** Equipping, selling and playing a card are final as soon as you tap them.
- **Fix:** Add Undo for actions that reveal no new information: equip, unequip, sell and "ready".
- **Effort:** M.

### P2: polish

**P2-1. The title screen footer hides a label.**
- **What I saw:** At 390x763 the "Computer skill" label is hidden under the sticky Start / How to play bar (01).
- **Effort:** S.

**P2-2. A drawer button overflows on desktop.**
- **What I saw:** In the desktop card drawer, the "Become Warrior ← suggested" button runs past the drawer's right edge (07).
- **Effort:** S.

**P2-3. The setup suggestion is confusing.**
- **What I saw:** The setup suggestion chain includes "Put on Frilly Longbow (carried: sell it later)" for an item the hero can't use (07). Suggesting that you put on unusable items confuses newcomers.
- **Fix:** Leave those out of the chain.
- **Effort:** S.

**P2-4. Starting a new game silently replaces the save.**
- **What I saw:**
  - "Start" (gold, pulsing) sits next to "Continue saved game" (screenshot not kept). Starting a new game overwrites the save with no confirmation (`ui.js` saves on every refresh).
  - Skill and hero count are not remembered: Hard came back as Normal.
- **Fix:** Make Continue the primary button when a save exists, confirm before replacing a save, and remember the setup.
- **Effort:** S.

**P2-5. The notes are out of date.**
- **What I saw:** `rules-notes.md:130` says online play is "not included", but it was built (`ONLINE-REPORT.md`).
- **Effort:** S.

**P2-6. Fonts, haptics and install.** **[shared]**
- **What I saw:** The fonts come from Google Fonts, and offline the Cinzel and Alegreya look is lost. There is no vibration on hits, deaths or level-ups, and the page has no install prompt.
- **Effort:** S.

## Top 5 fixes (value for effort)

1. **Remove the original names from the public notes** and add a banned-word build check (P0-1). S, [shared].
2. **Add a shared in-game Reference drawer** with pictures, search and counts, reusing the card art the game already draws (P0-2). M, [shared].
3. **Make the Halfling rules text match the card,** with a test that checks rules text against card text (P1-1). S.
4. **Fix the phone fight and hand layout** at 375x553 and 390x763 (P1-3, P1-4). M.
5. **Let hot-seat mix humans and computers, with player names** (P1-5). S–M.

---

## Suite-level notes (fix once for every game)

1. **Banned-word build check.** Add one shared script that fails the build if the page, or anything copied into `games/`, contains:
   - the original game's name, its publisher or its designer;
   - the original expansion or product names;
   - reference-site names.

   Both games failed this: Crown City's setup screen and rules name the original expansion packs, and both games ship public `rules-notes.md` files that name the originals. Also stop copying `rules-notes.md` into `games/<slug>/`, because GitHub Pages serves it.
2. **Shared Reference drawer.**
   - Build it into `shell/` and feed it from each game's card table: picture, text, counts, search and filters.
   - Open it from the menu, and with a long-press on any card.
   - The existing `games/reference.html` holds the data, but it is text only and no game links to it. Its intro also says "the three games on the shelf" above seven games.
3. **Shared Settings sheet.** It should hold:
   - SFX and music volume sliders;
   - text size;
   - a colour-blind-safe palette and shapes;
   - reduced motion;
   - left/right-hand dock;
   - computer speed (default normal).

   Hide the PerfHUD "Show speed / Test speed" rows behind `?debug`. Both games show them to players today.
4. **Shared rules component.**
   - A one-screen summary first, then collapsible sections, search, and a glossary of game words linked from the text.
   - A test that checks race/class/card wording in the rules against the card tables, since Doorkick's Halfling line drifted.
5. **Shared online polish in `net/`.** Neither game has these:
   - auto-join from the invite link;
   - a "can't reach the host, Retry" state after about 15 s;
   - a display-name field;
   - 6 quick emotes.
6. **Hot-seat standard.**
   - A blocking pass-the-device screen before any hidden pick. Crown City shows secret evolutions without one.
   - A Human/Computer toggle and a name for each seat.
7. **Undo.** Add a shared snapshot/undo helper for choices that reveal no information. Neither game has undo.
8. **Offline and app shell.**
   - Inline subset fonts. Both games load Google Fonts, so offline play loses the look.
   - Link the suite manifest from each game page, register the existing `sw.js`, and add `navigator.vibrate` haptics behind a setting.
9. **Save versioning.** Every save should carry a format version and a "this save is from an older version" message. Crown City's save has none.
10. **Logs.** Never trim the history the player can scroll back through, and log every automatic effect with its cause. Doorkick trims at 400 lines, and Crown City applies start-of-turn curses silently.
11. **Store readiness (all games).** No game has a profile, statistics, achievements, a privacy/terms page or crash reporting. The licence question decides whether any of the faithful adaptations can be sold (P0-3 here, P0-4 in Crown City).
