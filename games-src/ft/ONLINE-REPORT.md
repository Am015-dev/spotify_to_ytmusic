# Sands of Qamar: online play report

Free peer-to-peer play through `SP/net/netroom.js` (Trystero over WebRTC, Nostr relays for discovery). The design follows Crown City's `net.js`.

## What was built
- **Build:** `src/build.py` inlines `../../net/trystero.min.js` and `../../net/netroom.js` before the game scripts. The new `src/net.js` goes between `sound.js` and `ui.js`.
- **Who runs the game:** the host's page holds the real `G`, runs the engine and the computer seats, and broadcasts after every change. The broadcast goes out on `refresh()` (throttled to 300 ms) with a 3 s heartbeat, as deflate-raw JSON in 3200-character chunks.
- **Clients:** a client only renders the `G` it receives. `go(m)` on a client becomes `netSend(m)`, and only one move is in flight at a time. The plan runner waits for the reply before sending its next drop. "Undo last drop" is sent to the host as `{act:'undodrop'}`.
- **Host checks:** `onNetAct` checks that the sender's peer owns a human seat and that this seat is `sideToAct()`. It then runs the same legality test as `performMove` (including the free-form "sell" path, with type checks) before calling `go(m)`, the code path a local click uses. Anything malformed or illegal is counted in `NET.rej` and dropped. No `console.error` is raised for a rejected remote move.
- **Seats:** seats are dealt in join order, with the host first. The host chooses the player count (2–5, never fewer than the people present) and the expansions in the lobby. Empty seats go to the computer at the levels set on the start screen. Players appear under their online names, and the computer seats keep their colour names.
- **Leaving and rejoining:** a seated player who leaves becomes `away` and the computer takes over, including any question pending for that seat. When the same uid comes back, through presence or a "hi" message, the seat is returned. `pagehide` leaves the room, so the others notice at once.
- **Host migration:** this was cheap here because every `G` is a complete, safe state. The seated human with the lowest seat takes over when the host's connection is gone. Piles arrive sorted and without the seed, so the new host reshuffles them and draws a new seed.
  - The epoch and lower-peer rules settle any split.
  - A host that is only slow, but still connected, is never replaced. That page shows "Reconnecting…" instead.
- **Seat perspective:**
  - `me()` returns only the local seat, so only your own decisions are clickable.
  - Labels read "(you)", "Your turn", "Waiting for <name>…", "(left · cpu)", and the board chip shows "You · moving".
  - There is no camera orientation to set, and the game has no pass-the-device screens.
- **Simultaneous decisions:** none. Bidding and every question are sequential. Questions are JSON on `G.q` and are answered only by the seat in `q.who`.
- **Hidden information:** the base game is open information. Coins, goods and Mystics stay visible exactly as in hot-seat play, which rules-notes allows. Two things are hidden:
  - **Crafter items** are kept face down. A rival's sheet shows "N face down", and that rival's displayed total leaves out precious-item points until the end.
  - **Packets** never carry the order of the face-down piles (goods deck, bag, item pile, djinn and cutpurse decks), and the RNG seed is zeroed. Future draws cannot be read from the JSON.
- **UI:**
  - **Start screen:** a "🌐 Play online" panel with a name field, Host, an invite-code field and Join. Enter in the code field joins.
  - **Lobby:** shows the code, the invite link with Copy (`navigator.clipboard`, falling back to selecting the text), the players in seat colours, the host's options, and Start/Leave.
  - **Closing the lobby:** ✕, Esc or a tap outside closes it, and "Open the lobby" brings it back.
  - **Invite links:** `#join-CODE` skips the opening scene, pre-fills the code and opens the online panel. A link pasted into a tab that is already open (a hash change) works too.
  - **Mid-game:** "New game" opens the lobby. For the host it offers "Start a new game (ends this one)" and "Back to the game".
- **Status:** "Looking for players…", "Looking for the host…", "N players online", "Reconnecting…", "The host left…". It appears in the lobby and on the board chip. Without WebRTC, the start screen shows one muted line instead.
- **Sounds:** clients play the host's event sounds from a numbered fx list in each packet (`fx()` now numbers its entries). Every page plays a turn chime when a decision becomes its own, and gets the "+N ★" toast for its own moves.
- **Unchanged:** solo, hot-seat and watch play behave as before, and `ANIM`, `AIDELAY`, `setSeed` and `UI.sim` are untouched. Saving to localStorage is skipped only while online.

## Test results
All runs use real WebRTC (`SP/net/p2p-ft.js`, a local relay on port 17702, separate Chromium contexts). Clients act only through DOM clicks on their own page and real mouse clicks on the 3D board.

| Run | Pages and seats | Turns | Clicks | Remote clicks | Moves the host applied | All pages agree | Errors |
|---|---|---|---|---|---|---|---|
| 1 | host + 1 client, 2 seats, base game | 32 | 291 | 156 | 50 | yes | 0 |
| 2 | host + 1 client, 3 seats (1 computer), Crafters and Cutpurses | 39 | 215 | 106 | 115 | yes | 0 |
| 3 | host + 2 clients, 4 seats, all expansions; client 2 leaves at 51 s | 44 | 228 | 114 | 113 | host and client 1 yes | 0 |
| 4 | host + 2 clients, 4 seats, Crafters and Cutpurses; leave at 48 s, rejoin at 75 s | 44 | 272 | 183 | 192 | all 3 yes | 0 |
| 5 | host + 2 clients, 3 seats; the host's tab closes at turn 10 | 30 | 227 | 124 | 74 | yes | 0 |

- **Run 1 (bad moves):** 12 bad messages were sent, including an illegal bid, a non-object, null, an array, a string or objects as `kinds`, a move when it wasn't that seat's turn, a 5000-character `act`, a `__proto__` djinn and an undo with no move in progress. All 12 were rejected, and the log did not move.
- **Run 3 (leave):** the computer took over within 11 s ("Friend1 left the game: the computer takes over.") and the game finished.
- **Run 4 (rejoin):** the reopened page got seat 2 back with the same uid, as a human again, 15 s after it reopened.
- **Run 5 (host migration):** Friend0's page took over, the game finished, and all remaining pages agreed.
- **Earlier build:** run 1 also caught a false migration while the host page was stalled. Every page still agreed. The silence-based takeover was then removed.
- **Lobby (all runs):** the lobby filled in 0.3–0.6 s, and the invite link pre-filled the code and opened the panel.
- **Existing tests:** all pass with 0 errors.
  - `gauntlet.js`: 2, 3, 4 and 5 players with 20 games each, plus all expansions with 10 games.
  - `cover.js`: 40 games, 0 invariant failures, nothing missing.
  - `click.js`: 7 configurations.
  - `lay.js`: 4 sizes, 0 problems.
  - `perf.js`: runs normally.
  - The jsdom "getContext not implemented" lines were there before this change.
- **Screenshots** (`ft/netshots/`): host and client lobby, the client mid-game, and the start screen with the online panel, at 1366x768 and 390x844. They were checked by eye.
  - The client's player list now follows the host's seat order.
  - The chip text was shortened to fit phones.

## Size
`sands.html` went from 2,090,177 to 2,180,332 bytes (+90 KB):
- Trystero: 62.6 KB
- netroom.js: 4.7 KB
- net.js: about 19.6 KB
- CSS and hooks: about 3 KB

## Known limits
- **Slow start in tests:** starting a game in the test harness took 4–7 minutes. A local game is just as slow there: about 15 s for the first `sync3D` under SwiftShader, and the machine was shared, with a load of 25–30 on 4 cores. This is not caused by the network code.
- **Rejoin in the same Chromium process:** when the rejoining page was opened in the same Chromium process where a page had just closed, WebRTC sometimes stopped forming any new connections in that process. This happened about 1 time in 9 in a lobby-only test and in both in-game attempts.
  - The relay log shows the offer and answer passing in both directions, but no connection forms.
  - Fresh peers in other contexts of that process failed too.
  - Rejoining from a separate browser process (run 4) works.
  - This looks like a headless Chromium or Trystero problem, not a game-logic one.
- **Hidden piles on migration:** the order of the face-down piles is not sent, so a migrated game continues with freshly shuffled piles. That is fair, but it is not the same order the old host had.
- **Item identities in the JSON:** item identities are hidden on screen only. The broadcast `G` still contains rivals' items.
- **No emotes, and no spectators** beyond the 5 seats. A 6th person in the room just watches the lobby.
