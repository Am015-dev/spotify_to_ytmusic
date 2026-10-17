# Sunglaze: online play (peer-to-peer rooms)

## What was built
- **Transport.** `build.py` now inlines `net/trystero.min.js` and `net/netroom.js` (after the audio files, before the game scripts), plus the new `src/net.js` (after `sound.js`, before `ui.js`).
- **Model: the host runs the game.** The host's page holds the real `G` and runs the engine and the computer glaziers. After every change (from `refresh()`) it broadcasts `G`: the log is cut to 60 lines, the JSON is deflate-compressed and split into 3200-character chunks. Pushes are throttled to about 300 ms, with a 3 s heartbeat. The last 30 effect events are sent along with it.
- **Clients only render.** A client renders the `G` it receives. It never runs the engine or the AI: `schedule()` is a no-op on a client and nothing is saved locally.
  - Picking a glaze and a rack stays a local UI selection.
  - The final move (Place, a wall space, or "Do it" on advice) goes through `go()`, which on a client becomes `netSend(move)`. There is a one-send-per-state guard that is released after 2.5 s.
  - "Suggest a move" asks the host, which computes the advice and replies only to that peer.
- **Host validation (`onNetAct`).** The host checks that:
  - the sender owns a seated human seat;
  - it is that seat's turn (`sideToAct()`);
  - the move matches a legal move from `validMoves(seat)` field by field, with integers only. The matched engine object is applied with `performMove`, the same path a local human uses.

  Anything else, including junk, wrong types and out-of-turn moves, is counted in `NET.rejected` and ignored.
- **Seats.** Seats go to the players in join order, host first, up to 4. The host's chosen glazier count, variants and computer levels apply, and empty seats go to the computer. Seat names are the players' names.
  - **Leaving:** the computer takes over the seat (`away`).
  - **Rejoining:** a player who comes back with the same `NetRoom.uid()` gets the seat back. The host matches them on the peer join, or on their first message.
- **Sequential turns; wall tiling belongs to its owner.** Turns are sequential and there is no hidden information. The wall phase runs player by player as in the engine (`G.wt.q.p`). On the unmarked-mosaic variant, a wall-space choice is made only by the page of the seat that owns it. There are no simultaneous decisions to collect.
- **Seat perspective.**
  - Each page centres the 3D table and the 2D map on its own board (`focusSeat()` returns `NET.mySeat`).
  - Labels say "(you)" on your board header, score chip and players drawer.
  - Only your own decision is clickable (`me()` requires `sideToAct()===NET.mySeat`). Otherwise the dock says "Waiting for <name>…".
  - Online, there is no story or hot-seat screen and no "<name>, your turn" pass prompt.
- **Host migration.** This was cheap because all game state is in `G`. When the host's connection is reported gone, the lowest seated player still present takes over from the last received `G`. Missing players are marked away so the computer plays for them, and the epoch rules from Crown City resolve conflicts.
  - Silence alone triggers a takeover only after 60 s, since a slow or backgrounded host tab is not a departed host.
  - If nobody can take over, the page shows "The host left. The game is over." with Leave.
- **UI.**
  - **Start screen:** a "🌐 Play online" `<details>` panel with a name field, Host a game, an invite-code field and Join. Opening `#join-CODE` fills in the code and opens the panel.
  - **Lobby popup:** the code, the invite link with Copy link (clipboard in try/catch; on failure the text is selected), the status, the players in seat order with their colours, the host's options, and Start/Close the room (host) or Leave (others). It closes with ✕, Esc or a tap outside: back to the board if a game exists, otherwise to the start screen, which then offers "Back to the online lobby".
  - **In game:** a compact dock line shows the room, you, the status, Lobby and Leave.
  - **New game:** on the host it goes through the lobby. Clients see "The host can start another game".
- **Status.** The status line shows "Looking for players…", "N players connected", "Looking for the host…", "Reconnecting…" (no packet for 7 s), and "The host left…". Without WebRTC there is one muted line saying a recent browser is needed.
- **Sounds.** Clients replay the host's effect events (numbered `fx` with `n`), so take, place, wall, breakage, sun, round and win sounds and the recap lines match. A short "turn" chime plays on any page when a decision becomes yours.
- **Other changes:**
  - `engine.js`: `fx()` numbers its events (`UI.fxN`).
  - `sound.js`: adds the `turn` synth chime.
  - `three3d.js`: `focusSeat()` and the "(you)" label.
  - `ui.js`: the hooks listed above.
  - `head.html`: CSS for the online panel.

## Tests (final build)
- `node --check x.js`: OK.
- `click.js` (jsdom, 7 configs): **TOTAL errors 0**. `NetRoom.available()` is false there.
- `cover.js 60`: **60/60 games, 0 errors, 0 invariant fails, scenarios 19/19 pass**.
- `run_gauntlet.sh`: every player count and variant, plus mixed levels. **All done, errs=0, stalls=0, no violations.**
- `lay.js '{"np":3,"ex":{"prism":true}}' net 1366x768,390x844` (Playwright, real WebGL): **PROBLEMS 0**, 6 turns at each size, 0 missed 3D taps, 0 errors.
- `net/p2p-sunglaze.js` (real WebRTC, local relay on 17706, separate Chromium contexts, clients act only through DOM clicks with a random clicker):

| Scenario | Result |
|---|---|
| full1, host+1, game 1 (base, final build) | 52 turns, all pages agree (winner, turn, scores, walls), 26 remote moves, 0 errors |
| full1, host+1, game 2 (unmarked + prism, started from the end screen via the lobby) | 75 turns, agree, 74 remote moves in total, 0 errors. The client showed the final state 10 s after the host under load |
| full2, host+2, 4 seats (1 hard computer), unmarked | over, agree, 58 remote moves, 0 errors |
| leave: host+2, prism | 12 junk/illegal actions plus 2 junk state packets: 16 rejected, turn unchanged. Client 1 left: seat 1 went to the computer. Rejoined in a new context with the same uid via `#join-CODE` (code pre-filled): seat 1 came back (`sameSeat:true`), 65 more remote moves, game finished, all agree, 0 errors |
| migrate: host+2 | host tab closed at turn 6. Friend1's page took over in 11.6 s (via the peer-left event), the host's seat went to the computer, the game finished, the remaining pages agree, 0 errors |

- **Screenshots** (`shots/net_*.png`): host and client lobby at 1366x768 and 390x844, the start screen in a room, a client mid-game at both sizes, and a waiting client.
  - No page scroll; `scrollHeight` equals the viewport at both sizes.
  - Nothing is fixed over the board.

Earlier runs on the build before the last two small fixes (start-screen tidy-up, catching bad deflate data): host+1 passed twice. A run that fell foul of the old 15 s silence takeover was the reason for the 60 s rule.

## Size
`sunglaze.html` went from 2,824,506 to 2,914,891 bytes (+90,385 bytes). Of that, Trystero is 62.6 KB, netroom 4.7 KB and `net.js` 19.6 KB.

## Known limits
- Tests ran on a machine shared with other agents (load average 25–36 on 4 cores), so games were slow (2–14 min each).
  - In one of two `leave` runs, the reloaded client page took 85 s to load and did not connect within the 30 s window. With a 90 s window it connected and got its seat back.
  - Under that load, an early version that took over after 15 s of host silence migrated falsely. That is why the threshold is now 60 s, or immediately when the host's peer is reported gone.
- Spectators: a 5th or later joiner watches (seat −1) and cannot play.
- The client gets the last 60 log lines, not the full log.
- The host's `G` is trusted by clients (structure-checked only), which is the brief's model.
