# Kaiten Kitchen: online play (free peer-to-peer, no server)

Files: `src/net.js` (page side), `src/netstrip.js` (engine agent's whitelist copy, unchanged), hooks in `src/ui1.js` (`canPick`), `ui3.js` (`commit`, `afterApply`, `playResolve`, queue), `ui4.js` (round pad auto-close online), `ui5.js` (boot, menu, start screen), `body.html`, `head.html`, `build.py`. Shared `net/trystero.min.js` and `netroom.js` are inlined (never edited). Engine, AI, data untouched. Tests: `net/p2p-kk.js` (desktop), `net/p2p-kk-phone.js` (390x844 touch, `?phone=1`), `net-strip-test.js` (engine agent's).

## Model (same as Hollowbough / Tidewake / Crown City)
* **Host-authoritative.** The host's page holds the real `G`, runs the engine and the computer seats (same `schedule()` / `aiPick()` driver as a local game). Clients never run the engine or the AI; they only draw their copy and send one pick.
* **Seats.** Join order, host = seat 0, up to **5 humans**; remaining seats are computers at the lobby level (2-5 seats, any mix). Late joiners watch.
* **Simultaneous picks.** The pick is not a turn: every human page can send its pick at any time while its seat has not chosen. Message: `{m:{pk:'3'} or {pk:'3,5'}, t: round*100+turn}` (indexes into the sender's own hand, a string of 1-2 small numbers). The host derives the seat from the sender's peer id (never from the message), and accepts only if: plain small object (<= 60 chars, exactly one key `pk`, matches `^\d{1,2}(,\d{1,2})?$`, no nested values / `__proto__`), `t` equals the host's current turn number (a stale click is refused with "The game moved on"), the seat is human (not played by the computer), has not chosen yet, and the pick equals one of `KK.moves(G, seat)`. The host then applies its OWN move object through `commit()` (the code path of a local click). Picks that arrive while the host is still playing the reveal animation are applied at once (state-wise) and the animations queue.
* **Hidden information (whitelist).** `netStrip(G, seat)` = `KK.stripView` (own hand, own pick and own memory only, other hands `-1`, other picks `[-1]`, deck order gone, seed / rng 0) rebuilt field by field from a whitelist. Each peer gets its own copy through `room.sendTo` (deflate, 3200-char chunks, throttled to 300 ms plus a 3 s heartbeat). Public events (reveal / pass / score / deal / gameEnd, never a hand) of the last 14 applies ride along in the packet (`evs`) so a client can play the same reveal, pass and score-pad sequence even if it missed a packet; if the packet does not line up with what the client last showed, it just snaps to the new state. The host screen draws only its own hand (`viewSeat()` = own seat online; no pass-the-device screens; a watcher sees no hands).
* **Who is still choosing** is public (`picked`): glowing seat counters, covered plates at the seats that have chosen, roster chips ("choosing" / "ready"), the prompt ("Served. Waiting for Taro and Friend2...").
* **Leaving.** A seat that leaves becomes a computer seat (at the lobby level) and the log says so; if it had not chosen, the computer picks for it. The same browser (same `NetRoom.uid()`) rejoining via `#join-CODE` (code prefilled, online panel open, press Join) gets the seat back.
* **Host leaves = game over** ("The host left. The game is over.", Back to the start). No host migration: other pages never hold the hidden state.
* **Round pad online** is non-blocking (the engine has already dealt the next round): it overlays the live table, Continue closes it, auto-closes after 30 s. Online games are never saved; guided / hot-seat / solo / Load are not offered in a room; Play again is the host's.

## UI
Start screen: "Play online" panel (name, Host, code, Join; `#join-CODE` prefills and opens it; muted line if WebRTC is missing); in a room the start screen is a small waiting card. Lobby pop-up (`#netbox`): code, invite link + Copy link (clipboard in try/catch, falls back to selecting the link), status, players with their chef avatars, host options (diners 2-5, computer level), Start game / Start a new game, Close the room (client: Leave); X, Esc and a tap outside close it. Badge in the bar (`#netst`): dot + "Room CODE · n players online" (desktop) or dot + count in a 44x44 touch button (phone).

## Tests (local relay, Chromium without proxy, pages at https://gns.test/, clients click only their own page's DOM; one test at a time on a machine loaded by other agents)
See the final hand-off message for the exact lines of the last run. Scenarios: `full` (host + 1 client, 2 seats, 2 games through Play again), `full3` (host + 2, 3 humans), `full2` (host + 2 + 1 computer), `leave` (junk messages, stale turn numbers, leave, computer takes over, rejoin with the same uid, game finished), `ui`, `hostleft`, `touch` (phone: real taps), `full5` (5 humans, not part of the required runs).
Checks on every run: all pages agree with the host (winner, totals, custard, round / turn, log number, tables, custard, hand sizes), each client's whole state is byte-equal to `netStrip(hostG, seat)`, leak scan every 6th poll (no other hand / pick / memory / deck order / seed in the page state or in any received packet, no unlisted field, only whitelisted event types), no Serve button on a page that may not pick, final card shown on every page, 0 page errors, engine invariants clean.

## Known gaps
* Real networks, TURN (strict NATs need `window.NETROOM_TURN`) and phones on mobile data are untested from the sandbox. 5 humans only tested via `full5` when time allowed; see the hand-off message.
* No host migration, no turn timer (an idle human is waited for; the host can restart, or the player leaves and the computer takes over).
* The uid is a self-declared browser id (friends game).
* A client that joins mid-game only watches; a client that misses packets snaps to the new state without animation.
* The Hint star works online for the player's own seat (normal AI on its own stripped view).
* Under heavy machine load full games took 260-400 s; the test limits are 420-500 s.

## Results of the last runs
| Scenario | Desktop | Phone (390x844 touch) |
|---|---|---|
| full (host + 1, 2 games via Play again) | 2 games, agree, exact strip, 0 leaks, 0 errors | not run |
| full3 (host + 2, 3 humans) | agree, exact strip, 207 leak checks 0, 0 errors | agree, exact strip, 144 checks 0 leaks, 0 errors |
| full2 (host + 2 + computer) | agree, exact strip, 0 errors | not run |
| leave (44 junk + 2 stale messages rejected, leave, computer takes over, rejoin) | 0 bad | 0 bad |
| ui / hostleft | 0 bad / 0 bad | 0 bad / 0 bad |
| touch (real taps: badge, lobby, X, 6 picks) | n/a | 0 bad (badge 44x44) |
`full5` (5 humans) was not run in the final pass (time/CPU), only 3-4 seat games were. Earlier failed runs of full2 / leave were harness limits (280 s play limit under load, an AI pick counted as a state change) and were fixed in `p2p-kk.js`, not in the game.
