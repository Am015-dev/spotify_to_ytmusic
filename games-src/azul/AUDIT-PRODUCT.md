# Sunglaze: product audit (Oct 2026)

Audited build: `games/sunglaze/index.html` (2,956,061 bytes), served locally and played in headless Chromium
(SwiftShader; graphics Auto stepped down from High to Low by itself) at 1366x768, 390x763 and 375x553 with
iPhone touch emulation. Audit only: no game code was changed.

What I played:
- A guided first game vs one normal computer, to the end (5 rounds, 25 of my own moves via the real "Suggest a
  move" → "Do it" buttons). Result: Olive (computer) 46, Coral 33.
- A 3-seat game (2 people in hot-seat + 1 computer) with **Unmarked mosaic** and **Prism tiles**, through
  2 rounds, including the human choice of mosaic space. Then a reload and "Continue the saved game".
- Every header button and drawer, the online host lobby, and a second phone-sized tab opening the invite link.
  The public relays are blocked in this sandbox, so the tab could not connect; the builder's local-relay WebRTC
  runs (`game/ONLINE-REPORT.md`) were not repeated.
- The opening turns of a guided game at 390x763 and 375x553.

The log was checked against `game/rules-notes.md`. Overflow went to breakage, and the first take from the
courtyard took the Sun token and gave its holder the next start. Adjacency scoring was right (for example a tile
closing a 5-tile row with a 3-tile column scored +8). The game ended after the round in which a row was finished.
The end bonuses (+2 row, +7 column) and the breakdown table add up (57 − 18 + 7 = 46; 46 − 15 + 2 = 33).
Console: no errors apart from the blocked Google Fonts request.

## Scores

| Area | Score | Evidence |
|---|---|---|
| A. The game itself | 4 | Base game for 2–4 players, plus the official gray-wall variant and the joker promo; easy/normal/hard computers. No rule bug in the logs. The expansion boards and the special-factory promo are left out, and are stated as not included. The normal computer broke 18 points in 5 rounds, which is a little careless. |
| B. Learning the game | 4 | Guided "Step 1 of 3 / 2 of 3 / 3 of 3" with a "why", a result preview on every rack (`fills +1 · 2✗ −2`), Suggest with reasons, sectioned rules and a full reference. But there is no short rules card, no glossary, and no count of the tiles left in the sack by colour. |
| C. Playing comfortably | 3 | Desktop has a real confirm step ("Check and place"), but on a phone one tap on a rack plays at once, and there is no undo. Save/resume works. Settings are only graphics and the sound/music toggles. |
| D. Playing with friends | 3 | Invite link, lobby, rejoin and computer takeover; host migration exists. The client correctly says "Looking for the host…", but still also "Waiting for the host to start". No chat or emotes, no async play, and no pass-device banner (not needed: there is no hidden information). |
| E. Look, sound and feel | 4 | A warm painted 3D table, tiles with a symbol per glaze, and a very good phone rack picker (`p03-rack-picker.jpg`). CC-BY music is credited. But your own board is unreadable at 375x553, the boards are small with 3 players on desktop, and the top kiln sits under the header. |
| F. Quality | 3 | 0 game errors and a 2.9 MB file. But the developer "Show speed / Test speed" buttons sit in the main header, the phone icon buttons have no labels, the fonts come from Google, and the names of the original expansion and promo appear in the shipped text. |

## Problems

### P0 (blocks paying users)
None found in play.

### P1 (clearly below a paid app)
1. **The original expansion and promo names are in the shipped page.** The Rules "Not included" section and the
   reference "Variants" list name the published expansion boards and the special-factory promo by their original
   names (`game/src/rules-html.js:16`, `:46`, `:47`; each appears twice in `games/sunglaze/index.html`). The brief's
   hard rule is that no original names go in the shipped HTML.
   **Fix:** use generic words, such as "an expansion with pre-coloured boards (not included)" and
   "promo kilns with special powers (not included)", or drop the section. **S**
2. **No undo, and no confirm on phone.** At 390x763, tapping a rack in the picker places at once
   (`p03-rack-picker.jpg`), while desktop has a separate confirm (`d03-suggest.jpg`). A mis-tap on a crowded phone
   screen can't be taken back.
   **Fix:** use the desktop's two-step flow on phone too (tap the rack, then the big "Place" button), plus undo of
   your own move until the next seat acts. **M** [shared] for the undo pattern.
3. **No count of the tiles left.** Paid versions show how many of each glaze are left in the sack and in the
   shard box, because it decides most late-game choices. Here the dock shows only "Clay sack 72 · shard box 0".
   **Fix:** tapping the sack/box shows 5 glaze counts. They are public information (100 tiles minus everything
   visible), so this is safe online. **S**
4. **Your own board is unreadable at 375x553.** The board in the dock shrinks to about 10 px per space, and the
   other player's panel is cut off below (`p05-375x553.jpg`). At 390x763 it is fine (`p04-more-menu.jpg` shows the
   full board).
   **Fix:** on short screens, show either the kilns or your board with a toggle tab, instead of squeezing both. **M**
5. **The invite link on a phone lands below the fold.** Opening `#join-CODE` shows the setup screen with the name,
   code and Join fields hidden under the sticky Begin bar (`p01-invite-link-landing.jpg`). Rampart & Vine scrolls
   to the block.
   **Fix:** when the URL has `#join-`, open a small "Join Alex's game" dialog with only the name field and Join. **S** [shared]
6. **Settings are thin.** There is no volume, text size, colour-blind or reduced-motion switch, and no AI speed in
   the phone menu (`p04-more-menu.jpg` has Guide, Tile list, Music, Graphics and New game only).
   **Fix:** the shared settings panel (see the suite notes). **M** [shared]
7. **No way back to the shelf, and no favicon, touch icon or manifest link** in the game page. **S** [shared]

### P2 (polish)
8. **Developer tools in the main header.** "Show speed" and "Test speed" sit next to New game on desktop
   (`d02-turn1.jpg`, `game/src/body.html:38`). **Fix:** move them into a Settings → Advanced section. **S**
9. **Phone icon buttons have no accessible names.** Players, Log and Rules in the phone top bar have empty
   labels for screen readers. **Fix:** add `aria-label`s. **S**
10. **Grammar in the log:** "Olive sets a Obsidian tile" (`game/src/engine.js:78`). **Fix:** use "an" before a
    vowel. **S**
11. **The round title shows three times at once** on desktop: chip, banner and an italic line (`d02-turn1.jpg`).
    The top-left chip also covers part of the top kiln, and the clay sack and shard box labels are too small to
    read. **S**
12. **On desktop the "Do it" advice button is below the fold** of the dock (at 1366x768 you have to scroll the
    panel). **Fix:** show the advice above the rack list, or pin it. **S**
13. **The boards are small with 3–4 players on desktop**: mosaic spaces are about 20 px at 1366x768
    (`d06-hotseat-3p-unmarked.jpg`). **Fix:** a "focus my board" zoom, or larger boards for the active player. **S**
14. **The computer breaks a lot of tiles.** In a 5-round normal game it lost 18 points to breakage, including
    taking 6 from the courtyard onto a rack with room for 4. Worth a tuning pass on normal/hard. **M**
15. **Fonts come from Google Fonts**, so the fallback serif is used offline. **S** [shared]
16. **No achievements, stats or profile.** **L** [shared]

## Top 5 fixes (value for effort)
1. Remove the original expansion/promo names from the shipped page (P1-1). **S**
2. Glaze counts left in the sack and box (P1-3). **S**
3. Phone confirm step plus undo (P1-2). **M**
4. Short-screen layout: board / kilns toggle at 375x553 (P1-4). **M**
5. Invite-link join dialog, with header dev tools moved into Settings (P1-5, P2-8). **S**

## Legal / selling note
The mechanics follow a published game exactly (that is the point of the build). Names, art and text are original
apart from P1-1. The music is CC-BY and credited. Selling would still need a licence from the rights holder, or
a redesign.

---

## Suite-level notes (fix once, for every game)
From auditing these two games side by side, the same gaps appear in both and belong in the shared shell
(`games-src/shell/`), not per game:

1. **Undo / take-back pattern.** A snapshot of `G` at the start of each human decision, with an "Undo" button
   until another seat acts, offline and hot-seat; online, the host decides. Neither game has it.
2. **One Settings panel.** Sound and music volume sliders, text size, colour-blind palette plus seat emblems,
   reduced motion, AI speed, left/right hand, and graphics/PerfHUD (with the developer buttons under "Advanced").
   Today each game has a different subset: Rampart has a graphics drawer only; Sunglaze has header toggles and dev
   buttons.
3. **Phone popups must fit.** Both games clip or hide content at 390x763 or 375x553. A shell rule (max-height in
   `dvh` minus bars and safe area, inner scroll) and a `lay-phone.js` check that the last control of every popup is
   fully on screen would catch this everywhere.
4. **Online polish shared by all games:**
   - a clear "can't reach the host" state after a timeout;
   - a join-only dialog for `#join-` links;
   - quick emotes;
   - host migration (Sunglaze has it, Rampart doesn't);
   - in the long run, a TURN/relay service. The public relays used today were unreachable from this sandbox, and
     some carrier networks will behave the same way.
5. **App identity in every game page.** A Shelf/home button, favicon, `apple-touch-icon` and a
   `<link rel="manifest">` to the shelf manifest. Remember the last setup per game, and add a "Rematch" on the end
   screen.
6. **Self-host the fonts** (offline play and privacy). Also a **Credits & licences page** listing the code
   (three.js MIT, Trystero), the audio and the art, linked from every game.
7. **Live component counts in the reference.** "How many are left" (tiles, cards) is what paid apps put on the
   reference screen. It can be computed from public state in every game and shown per item, with tap-to-zoom.
8. **Store / product layer (needs the owner):**
   - profile, stats and achievements on the shelf;
   - a privacy page and opt-in crash reporting;
   - a PWA/iOS wrapper;
   - for any paid release, licences from the publishers of the original games, or redesigns.
