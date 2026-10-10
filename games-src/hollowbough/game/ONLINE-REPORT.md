# Hollowbough: online play (free peer-to-peer, no server)

Files: `net.js` (page side), `src/netstrip.js` (new: what a seat may see), small hooks in `src/ui1.js`, `ui3.js`, `ui5.js`, `ui6.js` (`ui.js` is their join), `body.html`, `head.html`, `build.py`; shared `net/trystero.min.js` and `netroom.js` are inlined by build.py (never edited). `engine.js`, `data.js`, `ai.js` untouched. Tests: `net-strip-test.js` (here), `net/p2p-hb.js`, `net/p2p-hb-phone.js`. `hollowbough.html` grows 695,411 -> 794,897 bytes (+99 KB: Trystero 62 KB, netroom 6 KB, net.js 26 KB, netstrip, CSS, hooks).

## Model (same as Tidewake / Crown City)
* **Host-authoritative.** The host's page holds the real `G`, runs the engine and the computer seats (the existing `schedule()` / `aiStep()` driver). Clients never run the engine or the AI; a client's `schedule()` only does the game-over card, the "your turn" sound and the suggestion star.
* **Seats.** Players go to seats in join order (host = seat 0, up to 4 humans); the other seats are computers at the level chosen in the lobby (2-4 seats in all, any mix). Late joiners watch (no seat). Solo is not offered online (the start screen in a room only shows the lobby card).
* **Moves.** A client sends `{m, n}` (the move without its label, plus the log number it saw). The host accepts it only if: it is a plain small object (<= 300 chars, primitive values only, no `__proto__`/nested values), the sender owns the seat that must act (`HB.actor(G)`) and that seat is human, `n` equals the host's `G.logN` (a stale click is refused with "The game moved on"), and its content equals one of `HB.moves(G, seat)`. The host then applies ITS OWN move object (never the client's) through `HB.apply`, plays the sound, and pushes. Anything else is ignored or refused with a short message (shown as a toast on the client).
* **Hidden information (whitelist).** `netStrip(G, seat)` starts from `HB.stripView` (own hand only, deck order gone, private limbo and tucked cards hidden, other seats' pending question has no options) and rebuilds the object field by field from a list of public fields (top level and per player); seed and rng are 0, the agenda is empty, `used` is empty, the log is cut to the last 150 lines, and the question title of other seats is blank. A field the engine adds later is absent until listed. Each peer gets its own copy through `room.sendTo` (deflate, 3200-char chunks, throttled to 300 ms plus a 3 s heartbeat). The host screen draws only its own hand (`viewSeat()` = my seat online, no pass-the-device screens, no x-ray; a watcher sees no hands).
* **Pending decisions** (`G.q`) are the ordinary question owned by one seat: only that page gets the options; the others read "X is deciding..." and the dock shows nothing to click.
* **Leaving.** A seat that leaves becomes a computer seat (at the lobby level) and the engine log says so; a pending question of that seat is answered by the computer. The same browser (same `NetRoom.uid()`) rejoining (link `#join-CODE` prefills the code and opens the online panel; press Join) gets the seat back, also when its old connection had not timed out yet.
* **Host leaves = the game is over.** Clients get "The host left. The game is over." with a Back to the start button. No host migration: the other pages never hold the hidden state (deck order, seed, other hands), so nobody could take over fairly.
* **Not online:** Online games are never saved; guided mode, hot-seat, solo and Load are not offered in a room; Play again is the host's.

## UI
* Start screen: a "Play online (free, peer to peer)" panel (name, Host, invite code, Join; `#join-CODE` prefills and opens it; one muted line if WebRTC is missing). In a room the start screen is a small card ("You are hosting room X / waiting for the host") with Open the lobby / Leave.
* Lobby popup (`#netbox`): code, invite link + Copy link (clipboard in try/catch, falls back to selecting the link), status, players with their pawn colours, host options (players 2/3/4, computer level), Start game (Start a new game while a game runs), Close the room (client: Leave); X, Esc and a tap outside close it. It sits above everything and is closed during play, so nothing is fixed over the board.
* Status: a badge in the top bar (`#netst`): green/amber/red dot + "Room CODE · 3 players online" (desktop) or dot + the player count in a 44x44 touch button (phone, both orientations; it replaces the season label in the phone landscape bar). Tapping it opens the lobby. It never overlaps the board or the other bar buttons (checked by the tests on every page).
* Menu: online games show Lobby / Leave instead of New game / Save / Load. Game over: the same score cards, buttons Play again (host only), Look at the board, Lobby.

## Hooks in the UI files (all inert when not in a room)
* `ui1.js`: `hotSeat()` is false online; `viewSeat()` returns the seat of this page online.
* `ui3.js`: prompt "X is deciding..." for another human's turn, "Your turn." wording, `mine` class only for my turn, watcher text.
* `ui5.js`: `newGame('net')` mode; `render()` end calls `netRenderHook()` (badge, closes a stale pop-up when the turn changes hands); `afterMove()` calls `netPush()`; `schedule()` / `aiStep()` do not run the AI on a client and are not blocked by the host's cards; `act()` on a client sends the move, on the host refuses a move for another seat; no season cards online; final card buttons; `save()` off online.
* `ui6.js`: menu row, `renderStart()` (online card / online panel), the click handler tries `netClick` first, `boot()` calls `netInit()`.
* `body.html`: two scripts (Trystero, netroom), `netstrip.js`, `net.js`, `#netst`, `#netbox`. `head.html`: CSS. `build.py`: the four files.

## Tests (final build; local relay, Chromium without proxy, pages at https://gns.test/, clients click only their own page's DOM; one test at a time)
| Test | Result |
|---|---|
| `python3 build.py && node --check x.js net.js src/netstrip.js` | OK, 794,897 bytes |
| `node net-strip-test.js 12` (12 AI games, 2-4 players, a stripped view of every seat + watcher after every second move / every question: 7,783 views) | actor, `moves(seat)` (content and labels), scores and the normal AI's choice equal on the copy; poison test (scramble other hands, deck, seed, rng, agenda, private limbo, tucks, other seats' question, an unlisted field) gives a byte-identical copy; leak scan: 0 problems |
| p2p `full` desktop (host + 1 client, 2 seats, 2 games through Play again) | both finished, all pages agree (winner, scores, turn, log number, board, hands counts), client state byte-equal to `netStrip(hostG, seat)`, 0 page errors, 0 rejected legit moves, 0 hidden-info violations in ~700 DOM/state/packet checks, questions: only the owner's page had options/buttons (0 leaks) |
| p2p `full2` desktop (host + 2 + 1 computer, 4 seats) | finished, agree, exact strip, 0 errors, 0 leaks, 324 checks |
| p2p `full3` desktop (host + 3 clients, 4 humans) | finished, agree, exact strip, 0 errors, 1,028 checks, 0 leaks |
| p2p `leave` desktop (host + 2 + 1 computer) | 44 malformed/oversized/`__proto__`/stale/non-owner junk messages from the seat whose turn it was: all rejected, plus a legal move of that seat sent by another client (rejected, state unchanged), prototype not polluted, invariants clean; client 1 closed its context: the computer took the seat; a new page with the same uid and `#join-CODE` (code prefilled, panel open) got the seat back and played; game finished, all agree, 0 errors |
| p2p `hostleft` | client shows "The host left. The game is over."; Back to the start returns to the start screen |
| p2p `ui` | Esc, tap outside and X close the lobby; link is `#join-CODE` with a 5-letter code; Copy falls back to selecting the link; players list shows "Hosty (you) · host" / "Friend1"; no hot-seat button in a room |
| phone (390x844, touch, `?phone=1`): `full` (2 games), `full2`, `leave`, `ui`, `hostleft` | same results as desktop, 0 errors, 0 leaks; layout check on every page: badge 44x44 beside the other bar buttons, not over the board, no tile covered, no page scroll, prompt still 112 px wide |
| phone `touch` (client plays 6 moves by real taps: badge, lobby, X, tile, Place worker, Prepare/Pass) | 6 moves arrived at the host, lobby opened/closed, targets >= 44 px |
| `click.js 0 14` (jsdom, offline, 15 configs incl. hot-seat, solo, watch, phone) after the hooks | 15 games, 0 errors, 0 hidden-hand violations |
| `lay-phone.js` (390x844, 844x390, 360x740, 740x360) after the hooks | 1 FAIL: `740x360 outside tap did not close` (the test taps the left edge of the top bar to close a pop-up). The same FAIL reproduces on the build from before the online work (git 5ea4860, 2 of 2 runs), so it is not caused by these hooks; everything else passes |
| Screenshots 1366x768-ish (1100x760) and 390x844: `shots/net_desk_*.png`, `shots/net_ph_*.png` (lobby host/client, start screen in a room, client and host mid-game) | looked at: no overlap, no horizontal scroll |

## Known gaps
* Real networks, TURN, phones on mobile data and 5+ people are untested from the sandbox (4 humans tested over a local relay). Strict NATs need `window.NETROOM_TURN`.
* Rejoin was not flaky in these runs (5 of 5 passes, one at a time); earlier games saw flakiness under heavy parallel load (transport level).
* The uid is a self-declared browser id: someone who learns another player's uid from the room could ask for that seat. Fine for a friends game.
* No host migration, no animations or event replay on clients (the board just updates), no season-summary card online (read the log), a late joiner can only watch, no turn timer: an idle human is waited for (the host can press Start a new game, or the player leaves and the computer takes over).
* The engine's public log lines are shown to everyone (the engine says logs are public text only).
* The suggestion star and Hint still work online for the player's own seat (they use the normal AI on the player's own stripped view).
