# Short Fuse: online play (free peer-to-peer, no server)

Files: `net.js` (page side), `src/netstrip.js` (what a seat may see), small hooks in `ui.js`, `body.html`, `head.html`, `build.py`; shared `net/trystero.min.js` + `net/netroom.js` are inlined by `build.py`. `src/engine.js`, `src/ai.js`, `src/data.js` untouched. Tests: `tools/net-strip-test.js`, `SP/net/p2p-sf.js`.

## Model
* The host's page holds the real `G` and runs the engine, the computer seats and the real-time clock. Seats go to the players in join order (host = seat 0); empty seats are computer seats (level from the start screen).
* **Hidden information.** The host never sends `G`. For every peer it sends `netStrip(G, seat)`: a copy where every wire that seat cannot place (crewmates' uncut wires, its own flipped wires, robot, red pile, unused out-of-N wires, box), face-down gear, all decks, other seats' secret number cards / roles / restrictions, the RNG state and the seed are blanked, plus other seats' pending question options and the engine agenda. Each peer then runs the unchanged UI on that copy; `knowledge(seat)`, `validMoves(seat)`, `legal()` and `sideToAct()` give the same answers on the copy as on the real state (`net-strip-test.js`). One known concession: job 13 offers the red-triple action only while an uncut red exists (public from the marker counts), so one hidden slot, chosen by position, keeps a red id when a real hidden red exists.
* The host's own screen is drawn from `knowledge(hostSeat)` only (online: no hot-seat pass screen, no x-ray; `viewer()` = my seat).
* Clients send `{m: move}` only. The host checks: sender owns a human seat, the JSON is a small plain object with a string `a`, `legal(m, seat)` accepts it, then applies it through the same `applyMove` as a local click. Rejections are counted and sent back as a toast. Racing claims (jobs 10 and 45) are serialised by arrival order on the host; the loser gets "not legal now". The computer crew waits 2.6 s before claiming, as in local play.
* Timed jobs: the host ticks the clock; clients show the pushed clock (pushes at most every 300 ms, plus a 3 s heartbeat). Pause is host-only and shown on the clients.
* Leave: the seat becomes a computer seat (also for a pending question); same browser uid rejoining gets it back. Host leaving ends the game ("The host left. The game is over.", Leave button); no migration because the others never hold the hidden state.
* UI: start screen has "Play online" (name, Host, invite code, Join; `#join-CODE` opens it prefilled). Lobby popup: code, invite link + Copy (select fallback), players, the chosen job and crew size, Start / Change job / Close room (client: Leave). Closes with the X, Esc or a tap outside. Status line in the dock: Looking for players / N players connected / Reconnecting / Host left. Without WebRTC one muted line explains a recent browser is needed. Late joiners watch without seeing any wire. Sounds come from state diffs on every page, plus the existing "your turn" chime.

## Tests (final build)
| Test | Result |
|---|---|
| `python3 build.py && node --check x.js` | OK; `shortfuse.html` 2,472,991 bytes (was about 2.37 MB: +~100 KB for Trystero, NetRoom, net.js, netstrip.js) |
| `click.js 0 23` (jsdom, offline) | 24 games, 0 errors |
| `tools/net-strip-test.js 1` (262 games, every job and crew size, 11,025 seat views, plus a watcher view) | knowledge, validMoves, sideToAct, legal and text equal on the stripped copy: 0 differences; leak scan (hidden ids, pile, box, aside, robot, rng, seed): 0 |
| p2p `full1` (host + 1 client, job 3 with a computer seat; 2 jobs, the second through the host's Play again) | both finished (1 win, 1 win), all pages agree on result, turns, fuse, log and `knowledge(seat)`; 0 page errors; 0 hidden-info violations in 40 DOM/state/packet checks |
| p2p `full2` (host + 2, job 4, three humans) / `full3` (job 9, 4 seats with a computer) / `claim` (job 10 racing claims) / `timed` (job 19) | all finished and agree, 0 errors, 0 violations (random play often BOOMs early, which still counts as a finished job) |
| p2p `leave` (host + 2 + computer, job 3) | 21 bad/malformed/oversized/`__proto__`/out-of-turn messages: all rejected (32 rejections counting both send paths), log unchanged, invariants clean; client 1 closed its context: the computer took the seat; a new page with the same uid and `#join-CODE` (code prefilled, panel open) got the seat back and made 10 accepted moves; job finished (defused), all pages agree, 0 errors |
| p2p `hostleft` | client shows "The host left. The game is over." in the popup; Leave returns to the start screen |
| p2p `clock` | client's clock equals the host's after 7 s idle |
| p2p `ui` | Esc, tap outside and X each close the lobby; link has `#join-CODE`; Copy falls back to selecting the link when the clipboard is denied |
| Screenshots 1366x768 and 390x844 (lobby host/client, start screen in a room, client mid-job) in `shots/net_*.png` | looked at: no overlap, no page scroll |

## Known gaps
* Tested on the kit's 2D board (`?2d`) in Chromium over the local relay with host + 1 and host + 2 clients (the 3D board draws from the same `view()`); not tested on real networks, TURN, phones, or with 4-5 humans.
* No host migration; if the host closes the tab the job is over.
* Pausing and restart/mission board are host-only. Crew card choice is random or set by the host for each seat.
* Racing claims depend on network order, so a laggy player loses ties.
* `render_game_to_text` (not used by the UI) differs between real and stripped states only in the counts/ids of other seats' hidden question options and face-down gear, which is the point.

## Leak fix: red-id placeholder (p2p `leave` / `claim`)
Root cause: netStrip kept one hidden uncut slot with a red id (RED_IDS[0]) whenever any hidden uncut red existed, in EVERY job. That hint is only needed by the red-triple job (RH.redTriple.moves checks for a remaining red); in other jobs it told a seat that a hidden red exists on another stand (and p2p-sf.js flagged it as "hidden wire present / hidden id in a packet", showing up in jobs 3 and 10 once the probes-vs-reds fix made reds appear there). Fix (src/netstrip.js): the placeholder is kept only when hasRule(mission,'redTriple'); otherwise every hidden wire is id 0. Checks: net-strip-test 0 diffs/0 leaks, p2p-sf.js full1/full2/leave/hostleft/claim 0 bad and 0 page errors, click.js 0 23 0 errors. p2p-sf.js now prints which wire/seat/job a violation concerns.
