# The Thornbound Throne: online play (free, peer to peer)

Files: `src/net.js` (page side), `src/netstrip.js` (new, whitelist), `net-strip-test.js` (new node test), build.py (adds trystero.min.js, netroom.js, netstrip.js, net.js), `../net/p2p-tb.js`, `../net/p2p-tb-phone.js`. engine.js, data.js, ai.js untouched.
UI hooks (small): ui1.js (hotSeat/viewSeat/viewSeatForQ/humanMove/pump/saveGame/suggest hooks, pushEv at the 3 event sites), ui2.js (phone map polish), ui3.js (deciding lines, "(you)"), ui4.js (rival "you", game-over buttons), ui5.js (renderAll view, netClick, start-screen online block, menu), ui6.js (netInit), body.html, head.html.

## Model
* Host-authoritative. The host runs the engine and the computers. A client sends only `{k, n}` (move key + counter). The host checks: sender owns a human seat, seat is in G.q.seats, TB.moves(G, seat) offers that exact key; then doMove(). Everything else is ignored (a refusal sends the client a fresh state; the packet's `ack` releases the client's click lock, so a stale click is not retried in a burst).
* Hidden info: `netStrip(G, seat)` = TB.stripView then a whitelist copy (listed top-level, player, question, clash, region fields). No seed, rng, agenda, stats counters (empty object), Kingdom deck order. Each peer gets its own copy via room.sendTo (deflate, 3200-char chunks, 300 ms throttle, 3 s heartbeat, skipped when unchanged). The host's own screen draws only its seat (no pass screen).
* Simultaneous bids/face-down cards: the engine's own G.q.seats lists who has not answered; the dock says "Still to choose: ..." and rival chips highlight them; answers stay on the host until the engine reveals. Cards (bids, clash, round summary) are per page and never block the game; events travel as sanitised public records.
* Seats in join order (host seat 0, then the next factions), 2-4 seats, humans and computers mixed (levels from the start screen). Leaver: computer takes the seat and any pending question; same browser uid gets it back. Latecomers watch. `#join-CODE` links prefill and open the panel.
* Host leaves: game over, "The host left. The game is over." and Leave. No host migration (clients never hold the hidden state).
* Phone: status line (room, you are, players, Lobby, Leave) sits in the dock under the map, 44 px buttons; lobby is a closable popup.
* Clients get the computer's "Recommended" move from the host (the AI cannot run on a stripped copy). TB.moves does run on the client's copy (identical lists, tested).

## Phone map polish
Kit name banners (clipped "Spire Co..", "Thornw..", overlapping coins and region labels) are hidden on phones; tapping a location draws its name in a clear spot (below the circle for the upper locations, above for the lower side ones; two lines for long names) and opens the pop-up. Side region labels moved above their dashed panels so the location circle/ring no longer covers "The Tablelands" / "The Sinks". Checked at 390x844 and 844x390.

## Tests
| Test | Result |
|---|---|
| net-strip-test.js 12 games | 3,634 stripped copies (seats + spectator): 0 poison diffs, 0 move diffs, 0 structural leaks, 0 unlisted-field leaks; TB.moves on the copy = host list in every decision |
| p2p full (host+1, 3 players), 5 consecutive games | all finished, pages agree, 0 rejections, 0 leaks, 0 page errors (59-79 remote moves per game) |
| p2p full3 (host+2 clients), 3 players x2 games, 4 players x1 | all finished, all pages agree, 142-152 remote moves per game, 0 leaks, 0 errors |
| p2p full with host animations on | finished, agree, 0 errors |
| p2p illegal | 28 malformed/out-of-turn/`__proto__`/oversized messages: 28 rejected, 0 accepted, state unchanged, prototype clean, invariants ok |
| p2p leave | client closed at round 2: computer took over; same uid + #join-CODE rejoined in ~180-220 ms and got the seat (13-24 moves after); left again, game finished |
| p2p ui | link has #join-CODE, Esc/outside/X close, Copy fallback selects, start-screen rows "Online: name", latecomer spectates (no hand, no buttons), host closes tab -> "host left", Leave -> start screen |
| Phone (390x844 touch context): full x2, full3, leave, ui | all pass, 0 errors, 0 leaks, lobby fits, status line below the board |
| Leak checks | every host packet compared to the real G (0 leaks in >3,000 packets over the runs); each client re-checks what it receives; DOM check: no other seat's face-up card, no clickable move out of turn (0) |
| click.js 0-9 | 10 games, 0 errors, 0 hidden-info violations |
| lay-phone.js 390x844, 844x390 | PROBLEMS 0 each |

Size: thornbound.html 843,800 -> 951,426 bytes (+107 KB: Trystero 62.6 KB, netroom 5.8 KB, net.js 30 KB, netstrip 3 KB).

## Bugs found on the way
The stripped copy needs an (empty) `stats` object: the engine's eff() bumps counters and threw on clients. A packet generated before the host handled my move could unlock the click guard (fixed with the ack counter).

## Gaps
* Real networks, TURN, real phones and real touch taps in the online tests (they use DOM clicks) untested; the winner in tests is usually the computer because humans click randomly.
* Rejoin and the run speed were measured one test at a time; parallel runs on 4 cores may be flaky (transport).
* A background host tab is throttled by the browser. No host migration. Online games are not saved. Spectators get no "recommended" move.
* The throne banner is still partly covered by the at-court herald pieces (not part of this task).
