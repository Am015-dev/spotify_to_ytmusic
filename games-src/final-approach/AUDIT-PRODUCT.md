# Final Approach: product audit (Oct 2026)

Build checked: built from source today (2026-10-04) with `game/build.py`. The output was byte-identical to the committed
`game/final-approach.html` (3,024,317 bytes; art 27 images, 497 KB), so no tracked file changed. Not deployed, not on the shelf.
Played in Chromium (Playwright) with touch enabled at 390x763 and 375x553, and with a mouse at 1366x768:
- the guided first flight at 390x763 (landed);
- full flights against the computer: Foxmere as Co-pilot at 375x553 (landed; reloaded in round 3 and resumed), Seabright Bay
  at 1366x768 (landed), Cloudspire with fuel and the clock at 390x763 (out of fuel in round 7), Palmreach with wind and an
  ability card at 1366x768 (collision in round 3), and a random-tapping newcomer flight (lost in round 1, missing Engines die);
- a full hot-seat flight at 390x763 (60 pass screens; no dice value in the DOM or in `render_game_to_text` on any of them);
- the online host screen plus a second tab that opened the invite link;
- every header drawer (Flight, Log, Rules + Reference, Menu), Configure, the end card and "Look at the panel".

Node: `rules-test.js` 68 of 68 pass. Spot checks: the off-turn reroll, the ability-card clamp and the trainee return are in the engine.
Console in offline play: no errors except a 404 for `/favicon.ico`. Load: title button after 1.5 s with 4x CPU throttling, no
external requests.

## Scores

| Area | Score | Evidence |
|---|---|---|
| A. The game itself | 4 | All 21 scenarios on 11 airports, all 8 modules and all 6 ability cards. The rules-audit fixes are in, and the logs I read match `rules-notes.md` (wind dial, traffic die, radio counting, collision). AI: normal and hard play the same, red/black airports are near 0 %, and the computer never spends a reroll or ability off its turn (another session is tuning it). |
| B. Learning | 3 | A 15-step guided flight with pulsing highlights. Strong helpers: the prompt line, legal glow, the "Fits:" line, a "what this die will do" line, Hint with a reason, and a red mandatory warning (`die-selected-390x763.jpg`). But the guided tips also run in normal flights with the wrong role (`copilot-gets-pilot-tip-375x553.jpg`). The reference is text only and sits at the end of the rules drawer. No tap-to-read and no glossary. |
| C. Playing comfortably | 2 | No undo and no confirmation: a placed die is final. Settings are on/off sound and music, AI speed, guide, story card and graphics only. Save/resume survives a reload (state identical), but it has one slot and no version. The log is a flat newest-first list. The end card has 4 stats. |
| D. Friends | 3 | The hot-seat pass screen is opaque and leaks nothing, but there are 60 of them per flight (`hotseat-pass-390x763.jpg`). Online has a code, an invite link, computer takeover and same-browser rejoin. If the host leaves, the flight ends. No emotes beyond the briefing phrases, no async play, and no error when the relays cannot be reached. |
| E. Look, sound, feel | 3 | One consistent painted style (procedural placeholder). Dice fly with squash and dust, there is a landing/crash ending, a feed line and a round recap. Real CC0 sfx and music. No haptics. On phones the labels collide, the fuel readout is overlapped and the recap card is see-through (`round-recap-overlay-390x763.jpg`). |
| F. Quality | 3 | 3.0 MB single file, fast first screen, works offline once loaded, 0 JS errors in 7 flights. Every die, slot and space has an aria-label, the keyboard Tab/Enter works and there are live regions. Seat ownership and the altitude dots rely on colour alone. Header buttons are 40x40. No favicon, manifest or service worker. |

## Problems (worst first)

### P0
1. **The clock is invisible on phones in the three "Against the Clock" scenarios** (Cloudspire red and black, Twin Spires black).
   On a 390x763 portrait screen the 60 s timer runs (`UI.rt.left` counted down to 56.7 s) but `#rtleft` is never drawn: it lives
   in the landscape/desktop HUD only (`game/src/ui2.js:100`, `if (r.hud) ...`). The desktop shows "⏱ 57 s".
   Where: `clock-scenario-no-timer-390x763.jpg`. Fix: show the timer in the phone status line (`#barprompt` or the altitude line)
   whenever `G.mods.real`, and pulse it red under 10 s. Effort S.

### P1
2. **Guided-flight tips appear in every normal flight, written for the Pilot at Port Alder.** With Guide "Full" (the default),
   a flight as Co-pilot at Foxmere opens with "You are Ines, the Pilot (blue). Ravi flies orange." Later tips say "Your blue dice"
   and "Ravi: four flaps". Where: `copilot-gets-pilot-tip-375x553.jpg`, `game/src/ui4.js:6-20` (TIPS `g:1`) and
   `ui4.js:24` (`coachTick` shows `g:1` tips when `c.level === 'full'`). Fix: show `g:1` tips only in guided mode. For normal
   flights, write a short role-aware set built from `name(UI.seat)` and `SEATN`. Effort S.
3. **No undo, no confirmation.** A tap on a glowing space places the die at once. Only the mandatory Axis/Engines case warns
   ("tap again"). Fix: allow undo of your own last placement while the partner has not acted since and nothing was revealed
   (the traffic die and reroll results are reveals). In hot-seat and online, offer it only before the device is passed or the move
   is sent. Effort M. **[shared]** pattern.
4. **Settings are below a paid app.** There are no volume sliders, text size, colour-blind mode, left-hand dock or animation
   speed (reduced motion is the only switch). Where: `game/src/ui4.js:119-130`. Fix: build these into the shared shell's settings
   drawer and read them from each game. Effort M. **[shared]**
5. **Hot-seat needs 60 pass screens per flight** (one per change of seat while dice are placed). This is better than in the
   review (no pass screen in the briefing), but still tiring. Fix: a "same table" mode where your own tray is covered and shows on
   hold-to-peek, with the pass screen kept for strict play. Effort M.
6. **The dock is too short at 375x553.** It is 106 px. After you pick a die only "Die 3 / Fits: Axis, Engines, Radio, Landing gear 2,"
   shows. The rest of the Fits line, the coffee − / + stepper and the effect line sit below the fold with no cue
   (`dock-clipped-375x553.jpg`). Fix: on short phones swap the round tracker and roster for a one-line summary while a die is
   selected, or let the selected-die card cover the roster. Effort S.
7. **The reference is text only and hard to reach.** It sits at the end of "How to play": 21 scenarios, the components, the
   spaces. There are no pictures, no tap or long-press to read a slot or token big, and no glossary for words such as
   aerodynamics marker, holding pattern or corridor tab. The ability cards in play are not shown on the panel at all; only the
   Flight drawer and the die buttons mention them. Fix: give the reference its own header tab with pictures from `art/`, add a
   shared long-press "inspect" popover on slots, spaces and tokens, and show small ability-card chips on the panel.
   Effort M. **[shared]** (inspect popover).
8. **Online gives no feedback when it cannot connect.** In the sandbox every signalling relay failed (certificate or proxy
   errors). The host still showed "Waiting for your crewmate..." with no error or retry. If the host leaves, the flight ends
   (`ONLINE-REPORT.md`). The lobby's airport picker is a 20 px native `<select>` (`online-lobby-390x763.jpg`). Fix: time out
   after about 15 s with "Could not reach the other player, try again", restyle the picker as 44 px rows, and add 4 to 6 quick
   emotes. Effort M. **[shared]** (netroom timeout and emotes).
9. **The last-round effect line is misleading.** In round 7 the selected-die line still says "Engines: 2 + ? against ≤6 stay,
   ≤12 one space". In the last round the plane does not move; the sum is compared with the brakes (4).
   Where: `last-round-effect-line-390x763.jpg`, `game/src/ui2.js:210` (`effectLine`). Fix: when `G.round` is the last round, print
   "Landing speed: 2 + ? must be no more than brakes 4". Effort S.

### P2
10. **The round recap card is hard to read.** It is see-through over the panel, the slot labels show through, and it closes
    by itself after 5 s (`round-recap-overlay-390x763.jpg`, `game/head.html:155`). Fix: give it an opaque background, group
    the lines as axis / speed / radio / switches, and keep it until tapped on a first flight. Effort S.
11. **The guided tips come in a burst.** Steps 4 to 9 (dice, axis, engines, track, radio, reroll) arrive one after another
    before the first die is placed, which breaks "one idea per step" (`guided-tip-390x763.jpg`). Fix: tie each control tip to
    the first die that fits that control. Effort S.
12. **"Look at the panel" leads to a dead end.** The dock then shows only the round tracker, roster and checklist, with no
    "Fly again" or "New flight" button; you have to find Menu. Fix: put a sticky "Fly again / Next airport" bar in the dock
    when `G.result` is set. Effort S.
13. **There is a stray dark bar on the desktop end card**, top centre over the landing picture (`desktop-end-card-1366.jpg`).
    Fix: hide the empty `#endv` or feed box during the ending. Effort S.
14. **Phone labels collide.** "Brake Brake Brake Brakes 0" run together, the "Fuel 9" readout is drawn over its bar
    (`clock-scenario-no-timer-390x763.jpg`), and on desktop "Wind +2" sits on the plane icon (`desktop-midgame-wind-1366.jpg`).
    Fix: give the brake readout and the fuel/wind readouts their own boxes in `layout.js`. Effort S.
15. **Switch lights are a 12 px dot.** Whether a gear, flap or brake is already done is hard to see on a phone
    (`die-selected-390x763.jpg`; `head.html:78`). Fix: tint the whole slot frame green once its switch is done, and add a
    check mark. Effort S.
16. **Seat and turn order rely on colour.** A slot is the Pilot's or the Co-pilot's only by blue or orange, and the phone
    altitude dots are colour only. Fix: add a small P or C badge (or shape) to each slot and dot. Effort S.
17. **The save has no version and only one slot.** `saveGame` writes `{G, mode, ...}` and `loadSave` loads it as is
    (`game/src/ui1.js:67`, `game/src/ui5.js:51`). A new build with a changed `G` would resume a broken flight. Fix: store a
    `v` with the build version, and on a mismatch run `checkInvariants` or drop the save with a message. Effort S. **[shared]**
18. **The log is a flat newest-first list** with redundant "(pilot)" suffixes ("Pilot puts a 1 on the engines (pilot)").
    Fix: group it by round with collapsible headers and drop the suffix. Effort S.
19. **The header icon buttons are 40x40** (under 44) and on phones they have no captions. Effort S. **[shared]**
20. **No favicon, manifest, apple-touch-icon or service worker**, and no haptics (no `navigator.vibrate`). Effort S. **[shared]**
21. **The computer partner (brief; it is being tuned elsewhere).** It never uses Reroll, Flip side or Hand-over during the
    human's turn. Normal and hard are indistinguishable. Hint follows the same model, so it can suggest losing moves: in the
    Palmreach flight (round 3) the computer Pilot opened with a 6 on the Engines while space 3 still held a plane; the
    hinted Co-pilot reply could not keep the sum under 10, so the plane moved 2 and collided.

## Top 5 fixes (value per effort)
1. Show the 60 s clock on phones (P0-1). S.
2. Guided tips only in the guided flight, plus a role-aware short tip set for normal flights (P1-2). S.
3. Short-phone dock: selected-die card on top, roster collapsed (P1-6), and the correct last-round effect line (P1-9). S.
4. Undo of your own last placement when nothing was revealed, in vs mode first (P1-3). M.
5. Shared settings (volume, text size, colour-blind badges, left hand) and an inspect popover with a picture reference
   (P1-4, P1-7, P2-16). M, shared by every game.

## Earlier findings: did the fixes land?

Rules audit (`AUDIT-RULES.md`):

| # | Finding | Status | Evidence |
|---|---|---|---|
| 1 | Reroll token only on your own turn | fixed | `validMoves(G, 1)` offers `rr` while seat 0 is on turn; the button is built before the own-turn check (`game/src/ui2.js` `actions`) |
| 2 | Ability cards not validated in `newGame` | fixed | g1 drops both cards, y3 keeps 1 of 2, unknown ids dropped |
| 3 | Trainee token with nowhere to go counted as trained | fixed | rules-test "goes back to its end of the row" passes |
| 24 | Flip side / Hand-over own turn only | fixed (engine) | rules-test passes; the computer does not use them off turn (AI note) |
| 26 | Strip data single-source | still open | `rules-notes.md` §8 item 8: not checked against printed box strips |

Newcomer review (`REVIEW-NEWCOMER.md`):

| # | Finding | Status | Evidence |
|---|---|---|---|
| 1 | Nothing warns before a missing Axis/Engines die | fixed | red pulse and "Keep your last die for the Engines"; the loss card names the seat (`loss-card-375x553.jpg`) |
| 2 | Slots unlabelled | fixed | every slot captioned; "what this die will do" line (`die-selected-390x763.jpg`); wrong in the last round (P1-9) |
| 3 | Altitude labels overlap on phones | fixed | "6000 ft · You go first" plus 7 dots; still colour only (P2-16) |
| 4 | Tip sheet covers the board | fixed | banner inside the dock (`guided-tip-390x763.jpg`) |
| 5 | Dock cramped on small phones | partly | 390x763 fine; at 375x553 the selected-die card is cut (P1-6) |
| 6 | Traffic-die icons invisible | fixed | die icons and "×3" on the strip (`clock-scenario-no-timer-390x763.jpg`) |
| 7 | "Look at the panel" shows nothing | fixed | the final panel is redrawn with dice; no way back except Menu (P2-12) |
| 8 | Computer partner silent and fast | fixed | feed line ("Ravi puts a 3 on the radio. / Radio: a plane leaves space 4."), die flight, slot flash |
| 9 | No round resolution | fixed | recap card each round; readability (P2-10) |
| 10 | Pass screen for every die in hot-seat | partly | no pass screen in the briefing, but 60 per flight remain (P1-5) |
| 11 | Panel clutter | partly | marker chips, tabs and "you" fixed; brake/fuel/wind readouts still collide (P2-14) |
| 12 | Picker says "no extras" | fixed | setup and reference list Busy Sky / Tight Corridor |
| 13 | Wording mismatches | fixed | "leaving", "no more than", one short name per crew member |
| 14 | Coffee preview shows the old face | fixed | the selected die shows the coffee value (`last-round-effect-line-390x763.jpg`) |
| 15 | Guided never mentions Hint; tips late | partly | Hint is step 10; tips still arrive in a burst (P2-11) |

## G. Product and legal (game-specific)
- **Legal, blocks selling.** This is a faithful adaptation of a published co-operative dice game. The mechanics, the panel,
  the approach-strip data for all 21 scenarios, the module rules and the six ability cards follow the box. Names, text and art
  are original, which is fine for free play among friends. **Selling it needs a licence from the publisher, or a redesign big
  enough to make it our own** (new controls and track logic, not only new names). The menu says "Final Approach is an original
  co-operative landing game" (`game/src/ui4.js:129`). For a paid product that claim is wrong; reword it to say the game is an
  unofficial adaptation.
- The built HTML does not contain the original title or the publisher's name. It has no copyright header, unlike the deployed
  shelf games. One assistant-domain string remains in a code comment of the shared `net/netroom.js` (already noted in `FIX-REPORT.md`).
- Missing store needs for this game: a shelf entry, cover and icon, store screenshots, a credits page for the art generator
  (audio credits are in the rules drawer), stats per airport (only a "won" flag is stored) and achievements.

## Not tested
- A real two-browser online flight: the public signalling relays fail in the sandbox. I read `src/net.js` for rejoin, takeover
  and host-left. The invite link opens the Online screen with the code filled in, but the name and Join still need a tap.
- Real iPhone Safari (safe areas, app switch, a suspended tab), a low-end phone and landscape (844x390) this round.
- Using Flip side, Hand-over and Second look through the UI (the engine tests cover them).

## Suite-level notes (fix once for every game)

Gathered from the three audits (Lantern Dive, Cauldron Fair, Final Approach) and from reading the shelf files.
The same gaps showed up in all three games, so they belong in the shared shell or on the shelf, not in each game.

1. **Shared settings panel** [shared, M]. Every game has only sound/music on-off, AI speed, guide and graphics.
   Add to `games-src/shell/` one settings block: master/SFX/music volume, animation speed, text size (CSS
   variable), colour-blind-safe mode (shape or letter marks on top of colour), left-hand dock, haptics on/off.
   This lifts C and F in every game.
2. **Undo and confirmation pattern** [shared, M]. No game has undo, and none asks for confirmation before an
   irreversible step. Add a shell helper: "your own unconfirmed choices can be taken back" plus a confirm
   step for irreversible ones (e.g. Stop/End turn).
3. **"Read it big" card viewer** [shared, M]. No long-press or tap-to-zoom on any card, tile or chip. One shell
   popover that takes a picture + text + count would also answer "component reference in two taps".
4. **Online robustness in `net/netroom.js`** [shared, M]. No connection timeout or error when the relays can't
   be reached (both host and guest wait forever), the game ends when the host leaves (no hand-over), the invite
   link fills in the code but still needs a tap on Join, and there are no emotes. All three audits could not
   finish an online game in the sandbox (relays blocked), so real two-device tests are still needed.
5. **Save versioning** [shared, S]. Saves have one slot and no version number; a new build loads an old save
   blindly. Store `{v, build, G}` and offer "start fresh" when the version doesn't match.
6. **Shelf entry for the new games** [shared, S]. `games/lantern-dive` and `games/cauldron-fair` are deployed
   but not listed on `games/index.html`, have no cover in `games/covers/`, and are missing from `SLUGS` in
   `games/sw.js`, so they can't be kept for offline play. Game pages have no favicon (the only console error
   in all three games is the `/favicon.ico` 404), no manifest link and no home-screen icon.
7. **Phone header** [shared, S]. Top-bar icon buttons are 40x40 (under the 44 px target) and have no captions
   on phones. Use 44 px and a caption row, or a labelled overflow menu.
8. **Accessibility** [shared, M]. Suits, chips and seats are told apart by colour alone in all three games, and
   screen-reader labels and keyboard paths are uneven. The colour-blind mode in item 1 plus an aria/keyboard
   checklist in `SPEC.md` would cover it.
9. **Identity and store** [shared, L]. No profile, statistics, achievements, "recent games", privacy policy,
   terms, credits/licences page, store screenshots or app wrapper. A shelf-level credits page could gather each
   game's art/audio/PixiJS licences. Async play and payments need a server.
10. **Legal wording and licences** [shared, S for wording, L for licences]. Lantern Dive, Cauldron Fair and
    Final Approach (and Kaiten Kitchen and Hollowbough) say in their own menus that they are "an original game".
    The mechanics, numbers and structure are faithful adaptations, so that claim is wrong and should be
    reworded (e.g. "Names, text and art are original."). **Selling any faithful adaptation needs a licence from
    the publisher or a real redesign.** This is the main blocker for a paid suite. The built Final Approach page
    also lacks the copyright header the deployed pages carry, and a comment in the shared `net/netroom.js`
    still mentions an assistant product by name. Remove it before any store build.
