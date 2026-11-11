# Nebula Aces: online play (peer-to-peer rooms)

## What was built
- **Transport.** `build.py` inlines `../net/trystero.min.js` and `../net/netroom.js` (before the game scripts). The new `net.js` sits after `three3d.js`. `netroom.js` was not changed.
- **Seat model.** The host's page runs the real `G`, the engine and the computer. The host flies side 0 (the first faction on the start screen). The first friend to join flies side 1, and anyone after that watches. If nobody joins, Start gives side 1 to the computer at the chosen skill. `G.players[k]` stores `{peer, uid, name, away}`.
  - If the client leaves, `human=false`, the computer takes over at once (open questions included), and a log line says so.
  - If the same browser (`uid`) comes back, it gets the seat back. That works when the host sees it join, or through a "hi" message if the old connection hasn't timed out yet.
- **Client.** The client never runs the engine or the AI. Its clicks go through `uiAct` to `netSend`, which sends a small flat message to the host only.
  - Clicking a ship to target it is converted to a fire move on the client.
  - Auto-place sends one `autoplace` message, and the host places for that seat.
- **Host checks.** `onNetAct` finds the sender's seat by peer. `netClean` whitelists the act and its keys, caps string lengths, and checks that `dials` is `{s<n>: int 0..40}`. The move then goes through `gameAct(ds, seat)` and `performMove`, the same path a local human uses, so the seat and the move are both checked against `validMoves(seat)`. A dials message is checked as a whole before any dial is set.
- **Simultaneous Planning.**
  - Both sides plan at the same time. `planSide()` only returns the page's own side when online.
  - The host resolves Activation as soon as both sides have locked.
  - Each page shows chips like "Hosty: setting dials… / You: ✓ dials locked". Other decisions show "Waiting for <name>…".
- **Hidden information.**
  - The host sends each recipient its own view (`netView(side)`) with `sendTo`. In that view:
    - the other side's dial becomes `'set'` until that ship starts its activation this round (`revR`, set by a `revealAndMove` wrapper; a stale `G.cur` doesn't count);
    - `flags.peek` is removed;
    - the damage deck order is zeroed and `rng` is masked;
    - another side's open question keeps only its keys and positions.
  - Spectators get both sides hidden.
  - The host's own UI never shows the client's dials: `planSide` and `myPlanShip` only cover the host's own side, the queue tags are empty for human enemy sides, and nothing else renders `dial`.
- **Perspective.**
  - "You" labels come from `soloSide()`, which returns this page's side when online.
  - Side 1's camera is turned 180° (`fitCam` yaw π, with the centring signs fixed), and the 2D fallback map is mirrored too.
  - Guided pauses are off online (they would stop the host's engine), and so is the pass-the-device screen (`bothHuman()` is false).
- **Sounds and effects.** Effects are numbered on the host and replayed on the client, so moves, shots, hits and their sounds come through `drainFx`. New log lines feed the client's notices, radio and recap. A "turn" sound plays when a decision becomes yours. While an attack is running the client keeps the same `G.atk` object, so the result cards work there too.
- **UI.**
  - **Start screen:** a "🌐 Play online" block with a name field, Host, an invite code field and Join. A `#join-code` link pre-fills the code and highlights the block. If WebRTC is missing, one muted line explains that a recent browser is needed.
  - **Lobby popup:** the code, the invite link with Copy (it falls back to selecting the text), the "Looking for players…" or player-count status, the pilots and their sides, the host's battle settings, and Start or Leave.
  - **Closing the lobby:** ✕, Esc and a tap outside all close it, and the room stays open. While in a room the start screen's Launch button becomes "Back to the lobby".
  - **In game:** a one-line `#netbar` in the dock shows the status (connected count, "Reconnecting…", "Host left", or "your friend left: computer flies"). When a game ends the host gets "Rematch lobby", and the client follows the host back to the lobby.
  - **Host leaves:** the client sees "The host left. The game is over." with a button back to the menu. There is no host migration, because the engine's open questions are closures (`KONT`) that can't be serialized.
- **Squads.** They come from the battle size the host picked: Core duel, Skirmish 60, Standard 100, or Custom, which uses the host's own squad builder for both sides. This was chosen over squads built by each player because it is reliable.
- **Other changes.**
  - `gameAct` now returns the `performMove` result.
  - `customSquads()` was factored out of `startGame`.
  - `loop3D` no longer reads `G` when it is null (in the lobby between battles).
  - Net timers start only with the first room, so headless tests still exit.

## Test results (real WebRTC, local relay 17704, `SP/net/p2p-xw.js`)
The host and the client run in separate Chromium contexts. The client acts only through DOM clicks on its own page. The machine had a load average of about 27 on 4 cores, shared with other agents, during these runs.

**WebGL (SwiftShader) run** (`onl/final-3d.txt`), errors 0:
- **Game 1** (Core duel): P2 won in 6 rounds. All pages agree on the final state. 44 remote clicks, 23 accepted.
- **Game 2** (Skirmish 60): P2 won in 9 rounds. All pages agree. 78 remote clicks.
- **Illegal and malformed actions:** 18 sent, 18 rejected, 0 accepted, and the host state was unchanged.

**2D run** (`onl/final-flat.txt` + `final-flat3.txt`, WebGL off), errors 0:
- **Game 1:** P2 won in 28 rounds, all pages agree.
- **Game 2:** P2 won in 8 rounds, all pages agree. The illegal-action test gave 18/18 rejected again.
- **Game 3:**
  - The client tab closed in round 2 and the computer took over.
  - The same uid rejoined through a `#join-` link, which pre-filled the code. It got its seat back in about 0.5 s.
  - The client then left for good in round 6, and the computer finished the game.

**Hidden info and clickability, every game:**
- Enemy dial still secret but arriving as a number: 0 times. Packets where it correctly arrived as `'set'`: 36 to 240 per game.
- The host's screen never showed a client dial: 0 violations.
- Another side's decision clickable on a page: 0 times.
- Pass-the-device screen shown: 0 times.

**Rejected clicks:** the other host rejections (stale double clicks sent before the host's answer arrived) were harmless.

**Screenshots** (in `xw/onl/`, at 1366x768 and 390x844): `lobby-host-1366`, `lobby-client-1366/390`, `client-plan-390`, `client-game-1366/390`, `host-game-1366`.

**Existing tests:**
- `unit.js`: 27 ok, 0 failed.
- `gxw2.js nebula.html 20`: errors 0.
- `pwshell.js`: ALL OK at 5 sizes, 0 console errors.
- `pwplay.js`: won, errors [].
- `cover.js pilots/ups 1` and `coverh.js pilots/ups 1` (TLIM=150000 because the box was overloaded): errors 0, every game finished and won, 0 rejected moves.

## Size
`nebula.html` went from 2,837,443 to 2,930,213 bytes (+92.8 KB, +3.3%). Gzipped it went from 1,616,288 to 1,649,952 (+33.7 KB). Of that, Trystero is 62.6 KB, NetRoom 4.7 KB and `net.js` about 21 KB.

## Known limits
- **Players and squads.** There are 2 seats and no host migration. Squads are the host's presets or the host's builder; each player can't bring their own.
- **Mid-game joins under heavy load.** With software WebGL on this overloaded box, a peer joining an already-running room (a rejoin, or even a fresh uid) was never answered by the busy host page: 120 s, even with the client re-opening the room. Measurements:
  - with WebGL off, the same test reconnects in 0.3 to 1 s;
  - plain NetRoom pages connect late joiners in under 1 s;
  - the host page's main thread under SwiftShader is too slow to answer Trystero's offers in time.
  
  Real GPUs should be fine, but it is untested here.
- **Leave detection.** Trystero can take more than 8 s to notice a closed tab. A quick reload is handled by uid.
- **Spoofing.** Uids travel in the room's presence messages, so a room member could claim another player's seat by spoofing their uid.
