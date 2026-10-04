# Rampart & Vine: product audit (Oct 2026)

Audited build: `games/rampart-and-vine/index.html` (2,445,504 bytes), served locally and played in headless
Chromium (SwiftShader, so the game picks the Low graphics level by itself) at 1366x768, 390x763 and 375x553 with
iPhone touch emulation. Audit only: no game code was changed.

What I played:
- A guided first game vs one normal computer, Riverlands on, to the end (83 turns, 41 of my own turns via the
  real "What would you do?" → "Do it" buttons). Result: Cobalt (computer) 132, Garnet 121.
- A 3-seat game (2 people in hot-seat + 1 hard computer, all three expansions) for 11 turns, then a page reload
  and "Continue the saved game".
- Every header button and drawer, the online host lobby, and a second (phone-sized) tab opening the invite link.
  In this sandbox the public relay servers are blocked (certificate errors), so the second tab could not connect;
  the builder's own real WebRTC runs on a local relay (`game/ONLINE-REPORT.md`) were not repeated.
- The opening turns of a guided game at 390x763 and 375x553.

The log was read against `game/rules-notes.md`: river turning rule, set-aside start tile, 2 per town tile + 2 per
banner (a 2-tile town scored 4, 3 tiles + 1 banner scored 8), 9 per finished priory, end-of-game scoring and the
end breakdown all matched. Players and end tables add up. Console: no errors apart from the blocked Google Fonts
request and a missing favicon (404).

## Scores

| Area | Score | Evidence |
|---|---|---|
| A. The game itself | 4 | Base game + all three expansions in the notes, 2–6 players, easy/normal/hard computers. No rule bug in a full game's log. Computer turns are quick and sensible. |
| B. Learning the game | 3 | A coaching panel, "why" on the advice, a scoring preview on every follower choice. But it is coaching, not a scripted lesson. The rules have no short version, the tile list uses flat diagrams rather than the painted tiles, and nothing shows how many of each tile are left. |
| C. Playing comfortably | 2 | No undo anywhere, and a follower is placed on the first tap. Settings only cover graphics: no volumes, text size or colour-blind mode. Save/resume works, but the setup screen forgets your last options. |
| D. Playing with friends | 3 | Invite link, lobby, rejoin and computer takeover all exist. But there is no host migration (the game ends if the host leaves), no chat or emotes, and no async play. A client that can't reach anyone still says "Waiting for the host to start". |
| E. Look, sound and feel | 3 | A good-looking 3D table, real samples and music. But the follower ghosts are large overlapping blobs, the tiles and pieces are small on a phone, and the phone menu and lists are clipped. |
| F. Quality | 3 | 0 game errors. 2.4 MB in one file. But fonts load from Google, there is no favicon, manifest or link back to the shelf, and players are told apart by colour alone. |

## Problems

### P0 (blocks paying users)
None found in play. The engine, AI, save and end screen all held up.

### P1 (clearly below a paid app)
1. **No undo, and no confirm on the follower step.** Desktop: tapping "Wayfarer on the road" in the dock
   (`audit-shots/d02-follower-ghosts.jpg`) places it at once. Phone: one tap on a follower choice does the same
   (`p03-follower-list-clipped.jpg`). The rules notes list "no undo" as a known gap.
   **Fix:** keep a snapshot of `G` at the start of each human turn, and add "Undo" until the turn passes to
   another seat (offline only; online, the host could allow it before the next seat acts). **M** [shared] for the
   snapshot/button pattern.
2. **Phone: the bottom of the menu and of the follower list is cut off.** At 390x763 the menu's last row
   (Rules / Settings / New game) ends at y≈775 (`p04-menu-clipped.jpg`). The follower list's 5th choice is half off
   screen (`p03-follower-list-clipped.jpg`). The same happens at 375x553 (`p05-375x553.jpg`), and the start
   screen's "Play online" is clipped (`p02-setup-clipped.jpg`).
   **Fix:** give the phone popups `max-height: calc(100dvh - top bar - safe area)` with inner scroll, or fewer,
   smaller rows. Add 390x763 to `lay-phone.js` with a check that the last button fits. **S**
3. **Settings are graphics only.** There is no sound or music volume (only on/off), no text size, no colour-blind
   mode, no reduced motion switch (only the OS setting), no AI speed on the start screen, and no left/right hand
   option (`game/src/ui.js:247`).
   **Fix:** one shared Settings panel in the shell, with sliders, text scale and a colour-blind palette or
   patterns, which the game extends with its graphics block. **M** [shared]
4. **Players are told apart by colour alone.** The followers are plain coloured pieces and the dock rows use
   colour bars. Garnet/Olive/Amber are hard to tell apart for red–green colour blindness (`d06-hotseat-3p.jpg`).
   **Fix:** give each seat a small emblem shown on the pieces' heads, in the chips and in the log, plus a
   colour-blind palette. **M**
5. **Tile reference is weaker than a paid app's.** It lists all 85+ tiles with counts (`d05-tiles-ref.jpg`). But
   the thumbnails are flat diagrams, not the painted tiles, and the intro wrongly says "drawn as it looks in the
   game". You can't tap a tile to see it big. Above all, it doesn't show how many of each tile are still in the
   bag, which every paid version shows and good players use every turn.
   **Fix:** add a "left" count per type (computed from the public placed tiles, so it's safe online), a tap-to-zoom
   view with the painted texture, and a filter (towns / roads / priories / expansion). **M**
6. **Online gives no failure state.** A client that hasn't found the host shows "The host is choosing the game…
   Waiting for the host to start the game…" (`p01-join-client.jpg`, `game/src/net.js:116`). It also lists itself in
   Garnet's colour as if it were seated. The game relies on public relay servers, with no TURN fallback, so some
   mobile networks will never connect.
   **Fix:** "Looking for the host…" until the first packet, then after ~20 s "Can't reach the host: check the code
   or try another network", with Retry. Long term, a small paid relay/TURN. **S** for the text, **L** for TURN [shared]
7. **No host migration.** If the host closes the tab, the game ends for everyone (`game/ONLINE-REPORT.md`).
   Sunglaze already migrates the host from the last state. Here the bag order is kept from clients, so a new host
   would have to reshuffle the remaining tiles. That is acceptable, because the remaining set is public.
   **Fix:** port the migration from Sunglaze, and reshuffle the known remaining multiset on takeover. **M**
8. **No way back to the shelf, and no app identity.** There is no home button, favicon, `apple-touch-icon` or
   manifest link in the page, so "Add to Home Screen" from the game gives a blank icon.
   **Fix:** a shell top-bar "Shelf" link plus the shared icon/manifest tags. **S** [shared]

### P2 (polish)
9. **Follower ghosts are oversized and overlap.** On a road/field tile, four ghost followers plus the road one
   cover the whole tile and each other (`d02-follower-ghosts.jpg`, `p03…`). **Fix:** draw the ghosts at about 60%
   size as flat discs with an icon, and show the full follower only on hover/selection. **S**
10. **The camera doesn't follow play or refit at the end.** The end board is cut off on the right
    (`d04-end.jpg`), and in hot-seat the open square was at the screen edge (`d06-hotseat-3p.jpg`).
    **Fix:** `fitAll()` on game over, and ease to include the frontier on each human turn. **S**
11. **The setup screen forgets the last setup.** After a reload it is back to 2 players with Riverlands only,
    even though a 3-player all-expansions game was saved. The speed also resets. **Fix:** store the last setup.
    **S** [shared]
12. **Phone tips block the menu.** While a guided "Tip" card is up, the ☰ menu does nothing. The tip also covers
    the tile you are holding (`p05-375x553.jpg`). **Fix:** make tips non-modal and short, sitting above the dock. **S**
13. **No pass-device banner in hot-seat.** There is no hidden information, so this is optional, but the turn
    change between two people is easy to miss. **Fix:** a short "Cobalt's turn" banner with the seat colour. **S**
14. **Fonts come from Google Fonts**, so they fail offline and in the sandbox (fallback serif). Self-hosting
    keeps the look offline and avoids a third-party request (privacy policy). **S** [shared]
15. **Credits don't list three.js (MIT)** or the other code licences; the credits list only audio
    (`CREDITS_HTML` in `game/src/ui.js`). **Fix:** a shared Credits & licences page. **S** [shared]
16. **The phone setup is the full desktop form** rather than "summary + Configure" as the brief asks
    (`p02-setup-clipped.jpg`). **S**
17. **No achievements, stats or profile.** Shelf-level work. **L** [shared]
18. **The shared reference page (`games/reference.html`) has no Rampart entries**, although Sunglaze is listed
    there. **S**

## Top 5 fixes (value for effort)
1. Clip-free phone popups and menu at 390x763 / 375x553 (P1-2). **S**
2. Undo of your own turn plus a confirm on the follower (P1-1). **M**
3. A "left in the bag" count per tile and tap-to-zoom in the Tiles drawer (P1-5). **M**
4. Clear online connection states, and host migration ported from Sunglaze (P1-6, P1-7). **S + M**
5. A shared settings panel (volumes, text size, colour-blind emblems) with a shelf link and icons (P1-3, P1-4,
   P1-8). **M**, mostly [shared]

## Legal / selling note
The rules are a faithful adaptation of a published game and its expansions; all names, text and art are
original and no original names appear in the page. The code contains the word `meeple` in identifiers (not
shown). Selling would still need a licence from the rights holder, or a redesign.
