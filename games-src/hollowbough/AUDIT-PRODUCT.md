# Hollowbough: product audit (Oct 2026)

Measured against `games-src/PRODUCT-BAR.md`. This is an audit only: no game code was changed.

**What I played.** I used the deployed `games/hollowbough/index.html`, served locally, in headless Chromium.
- Guided first game at 1366x768: 66 turns to the end, 54–23 against the easy computer.
- Full 3-player game against normal computers at 390x763 (phone, touch): 90 turns, 49–37–34.
- Solo against Old Grimbeard at 375x553 (phone): played to summer.
- Opened the hot-seat pass screens and the online host lobby. A second browser context joined by invite link.
- Opened every bar button (Players, Log, Rules, Menu), every board tile and event, and the card zoom.

My own moves were real taps in the first turns. After that the page's own Hint (normal AI) chose them through `act()`. I read the full guided-game log against `rules-notes.md`.

**Tests re-run:** `node rules-test.js` gives 108 passed, 0 failed. Every invariant check after my games came back empty.

**Online note.** The sandbox blocks the public Nostr relays the game uses (certificate and proxy errors in the console). The second tab sat on "Looking for the host..." for good, so I could not test joining. The local-relay results in `game/ONLINE-REPORT.md` are the builder's.

Screenshots are in `audit-shots/`.

## Scores (0–5)

| Area | Score | Evidence |
|---|---|---|
| A. The game itself | **4** | **Rules:** the full base game is in: 48 cards (128 copies), 11 forest places, 4 basic and 16 special events, 2–4 players and 3 solo levels. 108 rules tests pass. The cards, events and payments in my guided log matched `rules-notes.md`. **Missing:** the 3-year solo campaign. **AI:** easy, normal and hard, with no stalls. Solo levels 2 and 3 are almost unwinnable for the AI (0.5% wins, from ENGINE-REPORT). |
| B. Learning the game | **2** | **Good:** 10 guide cards arrive at the right moments, there is a one-line prompt, open places glow, and Hint marks a ★ move. **Weak:** the Hint's "why" only repeats the card text (03). The rules are a 3,000-character summary (08). **Missing:** any card or event reference, and a glossary. |
| C. Playing comfortably | **2** | **Missing:** no undo, and no summary of what the computers just did. **Log:** misses what players gained. **Settings:** only speed, guide and sound on/off (07). **Works:** Pass asks for confirmation, the end screen breaks down each score, and "Continue saved game" survived a reload. |
| D. Playing with friends | **3** | **Online:** a P2P lobby with code, link, seat count, computer level, rejoin and computer takeover (12), but no chat or emotes, and no timeout when nobody can be reached. **Async:** none. **Hot-seat:** pass-the-device screens with hidden hands, but players are always "Player 1–4". |
| E. Look, sound and feel | **2** | **Art:** consistent illustrated cards. **Title:** a plain form (01). **Motion:** none at all; workers, cards and resources simply appear. **Sound:** real samples and seasonal music, but no volume control and no haptics. **Phone:** fits at 390x763 (09); at 375x553 the hand is pushed below the fold (11). |
| F. Quality | **3** | **Speed and offline:** 797 KB, first screen in 0.1–0.4 s, no external requests. **Console:** no errors except a missing favicon (404). **Accessibility:** 41 of 50 board buttons have names. Pawns are told apart only by colour on the board. Escape closes pop-ups, but there are no game keys. |

## Problems

### P0: blocks paying users

1. **There is no component reference anywhere** (this is the owner's example). Nothing lists the 48 cards, 11 forest places, 8 basic places or 20 events with their text and counts. You can read a card only when it happens to be in the meadow, your hand or a city (04), or an event by tapping it.
   - Where: the Menu → Info row has only Rules and Speed tool (07). `src/ui6.js` has no reference drawer.
   - Fix: add a Reference drawer built from `HB.DATA`. It should show every card with picture, cost, points, colour, unique or common, copies, paired card and text, plus forest and basic places and the 4+16 events. Add filter chips by colour and type, a search box, and an "in this game" tab. Make it reachable from the bar in two taps and from every card pop-up.
   - Effort M. **[shared]**: the drawer frame and search belong in the shell; each game supplies its data.

2. **Selling needs a licence.** Hollowbough copies the mechanics, numbers and card structure of one published game exactly; only names, text and art are its own. Free play among friends is the current basis, but a paid release needs a licence from the rights holder, or a redesign deep enough to be our own game.
   - Also: the public repo files `PLAN.md`, `rules-notes.md`, `sources.md` and `game/ENGINE-REPORT.md` name the original title, publisher and BGG id. The brief allows real names only in private research data.
   - Fix: decide licence or redesign, and move those files to the private research repo.
   - Effort L (business).

### P1: clearly below a paid app

3. **Original role names show up in the game.** Players see card names that do not exist in this game:
   - The Rules drawer says "Some cards (Inn, Crane, Dungeon, Judge, Hostler) change the price" (`src/ui6.js:31`).
   - Four special-event texts use the original roles: "Husband+Wife pair", "prisoner in your Dungeon", "worker in your Monastery", "worker buried in your Cemetery" (`cards.json:1857,1889,1904,1957`).
   - The shipped HTML also carries every original role name as the internal `key` (for example `"key":"barge_toad"`, `"req":["monk","dungeon"]`) and "1 Ever Tree piece" in the component data.

   This confuses players (the cards are called Lantern Rest, Pulley Lift, Thornhold Cells, Hostler Hedgehog and so on) and weakens the "all names are ours" claim.
   - Fix: rewrite these texts with our own card names. Have `gen-data.py` replace keys with neutral ids in the build.
   - Effort S.

4. **There is no motion at all.** Placing a worker, playing a card, gaining resources and the computers' turns all happen instantly. The only CSS transition in `head.html` is an opacity fade. A computer turn shows up only as a small pawn on a tile (05). The brief and the bar ask for pieces that visibly fly.
   - Fix: FLIP-animate the pawn to its place, the card from meadow or hand to the city, and resource chips to the player panel. Flash the tile a computer used for about 1.5 s.
   - Effort M–L.

5. **No "what did the others just do?".** After a computer turn the dock goes straight back to "Your turn" and nothing on screen says, for example, "Bramble placed a worker on Gossip Glade". You have to open the Log.
   - Fix: a "Since your last turn" line in the dock: one line per rival, tap to see more.
   - Effort S.

6. **At 375x553 the hand is off-screen.** The dock scrolls (`#dockbody` is 290 px of content in a 187 px box), and the hand row starts at y=582, below the 553 px screen. Nothing hints that you can scroll (11).
   - Fix: pin the hand row to the bottom of the dock, and collapse the city strip to a "City 8/15" chip on short screens.
   - Effort M.

7. **The rules are a summary only** (08). These are missing:
   - the list of basic places and what each gives;
   - the event list;
   - Old Grimbeard's routine and scoring (one sentence today);
   - the occupy and card-playing ability details;
   - the hand limit when you receive cards;
   - the Long Road details beyond one line.

   The drawer has no search or table of contents.
   - Fix: add a "Full rules" section in our own words from `rules-notes.md` (collapsible, with a table of contents).
   - Effort M.

8. **There is no undo.** Multi-step choices (resource picks, gives, discards) cannot be taken back, even before anything hidden is revealed.
   - Fix: snapshot `G` before each human top-level move, and allow Undo until a draw or reveal happens.
   - Effort M. **[shared]**

9. **Settings are thin** (07). There is Sound "On" only: no volume, no separate music switch, no text size, no colour-blind mode, no left/right hand, no animation speed.
   - Fix: a shared settings panel.
   - Effort M. **[shared]**

10. **Solo is incomplete and its difficulty is unknown for humans.**
    - The rules describe three years in a row (one campaign), but the game offers three unconnected games.
    - Gruff and Ghastly are labelled "very hard"; the AI wins them 0.5% and 0.3% of the time.
    - Fix: a campaign mode that chains the three years and carries the result. Playtest the levels with humans.
    - Effort M.

11. **Online gives no feedback when it cannot connect.** The joining page shows "Looking for the host..." with no timeout and no advice. The connection depends on third-party public Nostr relays (one host is called `staging.`).
    - Fix: after about 15 s, show "Can't reach the meeting servers. Check your connection or try again", plus a relay health check. Consider our own relay or TURN.
    - Effort M. **[shared]**

12. **The title screen is not painted.** It is a plain form card on a green gradient (01), while the brief asks for a painted title. Kaiten-style art would lift the first impression.
    - Effort M.

### P2: polish

13. **Log grammar.** It reads "You goes first", "You places a worker", "You pays", and the end card says "You wins!" (06), because `engine.js` logs third person with the name "You".
    - Fix: second-person verbs when the name is "You".
    - Effort S. **[shared]**: the same pattern recurs elsewhere.

14. **The log leaves out gains.** It does not record resources gained from places, the Toppled Hall refund and draw, or production results. For example, "You places a worker: Foragers Crossing" never says which two resources.
    - Effort S.

15. **Hint gives no real reason.** It repeats the place or card text (03) instead of why the move is good. `src/ui4.js` has reason strings only for a few move types.
    - Effort S–M.

16. **Desktop 1366x768 wastes space and text is tiny** (05):
    - about 80 px of empty band above the board and about 140 px below it;
    - meadow card text renders at roughly 7 px on screen;
    - hand cards are about 55 px wide with no readable text;
    - the city strip overflows sideways ("Hoard Cell…" cut off);
    - "Lost Parchments Unearthed" runs past its event tile.

    - Fix: scale the board to the free height, and use bigger hand and city cards.
    - Effort M.

17. **Phone board is hard to read** (09):
    - Place tiles show icons only, with no names.
    - Event tiles show only "3" or "?", so you must tap each one.
    - The Long Road "2-5" label is covered by pawns.
    - One forest tile's label reads as "* 2e".

    - Fix: short names under the icons, and a requirement mini-icon on events.
    - Effort S–M.

18. **Guided game wording and guide-card placement.**
    - The guided prompt says "Read the card, then Continue." while the button says "Got it".
    - On desktop the guide card replaces the dock, so hand and resources are hidden while you read (02).
    - Effort S.

19. **Pass looks like the main action.** It is the big green button from turn 1. A confirmation exists (`src/ui4.js:213`), but Prepare or Hint should be the visual default.
    - Effort S.

20. **Hot-seat has no name entry** ("Player 1..4"), and the pass screen does not say what the last player did.
    - Effort S. **[shared]**

21. **"Continue saved game" is hard to find.** It sits at the very bottom of the title, below the online panel. The brief says Resume belongs at the top.
    - Effort S.

22. **The credits are inaccurate.** They say "Art is drawn procedurally; no outside assets" (`src/ui6.js:80`), but CC0 sound samples are bundled (`audio/hollowbough/`), and there is no credits or licences page in the game. There is also no favicon (404 on every load).
    - Effort S. **[shared]**

23. **No haptics** on phones.
    - Effort S. **[shared]**

## Top 5 fixes (value for effort)

1. **Reference drawer** for every card, place and event, with counts and search (P0 #1, M). It is the owner's own example and the biggest gap for learning.
2. **Replace the original role names** in the rules, event texts and shipped keys (P1 #3, S). It costs little, removes confusion and cleans up the IP side.
3. **A "Since your last turn" line plus a 1.5 s highlight** of each computer action (P1 #5, S). It makes the rivals readable without the Log.
4. **Fix short phones:** pin the hand, add names under place icons and requirement icons on events (P1 #6 + P2 #17, M).
5. **Basic motion** for pawn, card and resource moves (P1 #4, M–L). It is the clearest visible difference from a paid app.
