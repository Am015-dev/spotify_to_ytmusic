# Rampart & Vine: online play (peer-to-peer)

## What was built

- **Transport.** `build.py` now inlines `../../../net/trystero.min.js` and `../../../net/netroom.js` right after `shell.js`, before the game scripts, the same way `perfhud.js` is read. New file `src/net.js` (loaded after `sound.js`, before `ui.js`) is the game's adaptation of Crown City's `net.js`. `netInit()` runs from `boot()`.
- **Seat model.** The host's page holds the real `G`, runs the engine and every computer settler. The host chooses the seat count, the expansions and the computer levels on the normal start screen, then presses Host. Seats go to the room's players in join order, with the host in seat 0. Empty seats become computer settlers. Players are named after their online names, or after the seat colour if they leave the name blank. Duplicate names get the colour added.
- **State packets.** After every change the host sends the state (throttled to 300 ms, plus a 3 s heartbeat). Each packet is the JSON of `G`, deflate-compressed, base64-encoded and cut into 3200-character chunks. A late 4-player game with every expansion is about 32 KB of JSON and at most about 10 KB compressed, so 4 chunks. The packet also carries the last 30 sound/animation cues and a recap of the last move in two voices: "Your last turn: …" for the player who moved and "X placed …" for everyone else.
- **Hidden information.** The tile bags are stripped before sending. `stack` and `rstack` (the river) go out empty, with only `stackN`/`rstackN` counts, and the client rebuilds placeholder arrays of that length so "tiles left" still works. `rng` and `seed` are removed, so a client cannot replay the shuffle. The drawn tile (`G.cur.t`) is public once it is drawn. Goods are printed on the town tiles, so they are public anyway. The pond tile id (`G.lake`) is always the last river tile, so it is public too. The test checks on every client that the received bags hold only placeholders and that there is no `rng` or `seed`.
- **Moves.** Previewing a tile (tapping glowing squares, turning it, the ghost tile, the preview list, advice) happens only on the active player's page. Only the final choices go to the host: `place {x,y,r}`, then `fig {k,l}` or `skip`. Each one is stamped with `turn:step`. `onNetAct` on the host checks, in order:
  - the sender owns a seated human seat;
  - it is that seat's turn;
  - the stamp matches the current turn and step;
  - the fields are well formed (integers in range, a known figure kind).

  It then calls `performMove(m, seat)`, the same path a local human uses, which checks legality again. Anything else is dropped without a reply. After sending, the client locks its own input until the state changes, or for at most 5 s, so a double tap can't send twice. Other players see "X is placing <tile>" and "Waiting for X…" in the panel.
- **Seat perspective.** `me()` is the single gate for everything clickable: the dock buttons, 3D taps, the 2D map, the keyboard and advice. Online, it is true only for the seat whose turn it is on that page. The panel and the chip say "(you)". There is no camera orientation per seat, because the valley is the same from every side. Computer turns pan the camera to an off-screen tile on every page. There was no hot-seat hand-off screen to suppress. The opening story popup is skipped online.
- **Simultaneous decisions.** None: turns are strictly sequential.
- **UI.**
  - The start screen has a "🌐 Play online" button. It opens a name field, Host, an invite-code field and Join (Enter works in both fields).
  - The lobby popup shows:
    - the code;
    - the invite link with Copy, which uses `navigator.clipboard` and selects the text if that fails;
    - "Looking for players…" or "N players here";
    - the players in seat order, in their colours, with "(you)" and "host";
    - the host's options (seats, expansions, computer settlers and their level);
    - Start or Close the room for the host, and "Waiting for the host…" with Leave for the others.
  - The popup closes with ✕, Esc or a tap outside, back to the start screen. There the online block shows the room and its status, with "Open the lobby" and "Leave the room".
  - Opening `#join-CODE` pre-fills the code and opens the online panel.
  - Nothing new sits over the board: the online status is a prefix in the existing top-left chip ("🌐 2 players online · 57 tiles left · ● Friend1 (you)").
  - Without WebRTC, one muted line explains that a recent browser is needed. This is what jsdom shows.
- **Connection state.** "Looking for players…", "N players online", "Reconnecting…" (no packet for 8 s) and "Host left" (the host's peer left, or 25 s of silence).
- **Leaving and rejoining.**
  - If a seated player leaves, the computer takes over their seat (`away`), and the log and the stats show it.
  - Rejoining, matched by uid, gives the seat back. That works from a reload, from the invite link or by typing the code again.
  - A client that sees its own seat marked away sends a `hi` every 2.5 s, and the host then gives the seat back. This also heals a dropped and re-made connection.
- **Host leaving.** There is no host migration. Clients don't have the bag order, so a new host would have to reshuffle the remaining pool. The panel says "The host left. The game is over." with "Back to the start".
- **Sounds.**
  - Clients replay the host's cues (place, follower, score, home, goods, story, win, discard), and score pop-ups too.
  - A new `myturn` cue (the turn sample, louder; a two-note synth fallback) plays when a decision becomes yours online. The ordinary turn tick is skipped for your own turn.
- **Unchanged.** Solo, hot-seat and watch modes. Every engine path is untouched; `onMoveDone` was only split into `moveRecaps()` with the same output. All test hooks are still there (`ANIM`, `AIDELAY`, `setSeed`, `UI.sim`, `UI.pause`). Online games are never written to the local save slot.

## Tests

All runs below are on the final build (`rampart.html`, 2,402,637 bytes). `node --check x.js` passes.

**Existing tests** (all 0 errors):

| Test | Result |
|---|---|
| `graph_test.js` | 77 passed, 0 failed |
| `geo_test.js` | 85 tiles, 0 drawing errors, 0 adjacency warnings |
| `gauntlet.js` | 20 games at 2 players (base) and 10 at 3 players (all expansions): 0 errors, 0 stalls |
| `cover.js` | 48 of 48 games finished, 7,541 moves, 0 errors, 0 invariant failures, 0 probe mismatches |
| `click.js` (jsdom, all 7 configurations) | `TOTAL errors 0` |
| `lay.js` (Playwright, 4 sizes) | `PROBLEMS 0`, no page scroll, 3D taps missed 0 |

In jsdom, `NetRoom.available()` is false, so the online block shows its one muted line.

**Real WebRTC: `SP/net/p2p-carc.js`.** It runs the host and the clients in separate Chromium contexts, through a local relay on port 17707. Clients act only through their own page: DOM button clicks, plus taps on the 3D map. About 30% of the taps are real `page.mouse` clicks and the rest are DOM pointer events.

| Run | Setup | Result |
|---|---|---|
| A | host + 1 client, 2 seats, base | PASS: 71 turns, "Friend1 wins with 36 points." Host and client agree on winner, scores, tiles and turn. 57 moves applied from the client's clicks. 0 errors. 311 s. |
| B | host + 1 client, 3 seats (1 computer), Riverlands + Merchants & Masons | PASS: 107 turns, "Amber wins with 141 points." All pages agree. 46 moves from the client. 0 errors. |
| C | host + 2 clients, 4 seats (1 computer), all expansions | PASS: 125 turns. The remaining pages agree on the final result. 58 moves from the clients. 0 errors. |

What B checked along the way:
- Bad actions sent while it is not the client's turn are ignored: the host's state is byte-identical before and after. They were `null`, a string, an array, a malformed place, an unknown figure, `__proto__`, a stale stamp and a 5,000-character act.
- Illegal moves on the client's own turn are ignored too: an occupied square, an unreachable square, rotation 5, a figure during the place step, a skip during the place step, and a non-integer x.
- At turn 16 the client leaves through its own UI (New game → Leave the room). Its seat goes to the computer, which played 2 turns for it.
- The client then reloads with the `#join-` link. The code is pre-filled and the online panel is open. It clicks Join and gets seat 1 back, and the host shows the seats as human, human, computer again (`110`).

In C, Friend2 leaves for good at turn 40. The computer takes the seat and finishes the game.

Every client checks that its bags hold only placeholders and that there is no `rng` or `seed`.

**Screenshots** are in `online/shots/`:
- the lobby on host and client at 1366x768, and on the client at 390x844 (2 and 3 players);
- a client's view mid-game at 1366x768 and 390x844, plus 800x560 and 390x844 from game C;
- the start screen with the online panel opened from an invite link, at both sizes.

I looked at all of them. Two things got fixed:
1. Clients listed the lobby players with themselves first, in the wrong colours. The host now sends the seat order.
2. The name and code fields were too tall, and on a phone an invite link left the online block below the fold. The fields are tighter now and the panel scrolls to the block.

**Bugs found and fixed while testing:**
1. On the host, computer seats did not move in online games. `go()` was gated by `me()`, so the computer's move was dropped.
2. A connection that drops and comes straight back could leave a seat marked "away", or make a client declare the host gone.
   - A seat's player is now matched again by uid even when the peer id is the same.
   - A client whose seat shows away sends `hi`.
   - A host leave event only becomes "Host left" if the packets also stop for 8 s ("Reconnecting…" until then).

## Size

`rampart.html` went from 2,313,056 to 2,402,637 bytes (+89,581 bytes, +3.9%):

| Part | Size |
|---|---|
| Trystero | 62.3 KB |
| NetRoom | 4.7 KB |
| `net.js` | about 17 KB |
| CSS | about 2 KB |
| Small `ui.js` changes | rest |

## Known limits

- No host migration. If the host closes the tab, the game ends for everyone.
- The uid is per browser (localStorage). Two tabs of the same browser count as the same person, so a second tab that joins takes over the first tab's seat.
- The host can't change the options inside the lobby. ✕ goes back to the start screen, where they can change them and then open the lobby again (the clients' view updates).
- Spectators: anyone who joins after the start, with an unknown uid, can watch but not act.
- A starting 6-player online game turns on Taverns & Basilicas automatically (the same rule as offline).
- Test speed: under the shared sandbox (load average 25–30 on 4 cores), one evaluate takes 1–3 s, so a full 2-player game takes about 11 minutes.

## Note on SP/net/netroom.js (not edited)

1. **Console noise on a normal leave.** When a peer leaves normally, Trystero logs this on the other pages:

   `console.error("Trystero peer error:", OperationError: User-Initiated Abort, reason=Close called)`

   It fires on the data channel that the leaving peer closes. It showed up 1 or 2 times in 3-page runs, and it fails any "0 console errors" test. `p2p-carc.js` counts it separately as benign. Proposed patch, inside the NetRoom IIFE, run once:

   ```js
   const _ce=console.error.bind(console);
   console.error=(...a)=>{if(typeof a[0]==='string'&&/peer error:$/.test(a[0])&&/User-Initiated Abort|Close called/.test(String(a[1]&&(a[1].message||a[1]))))return;_ce(...a)};
   ```
2. **A leave event for a peer that is still there (suspected, not confirmed).** In two runs, after a rejoin, a page got a leave for a peer that went on talking:
   - once a rejoined seat ended up "away" again while its page kept playing;
   - once a client marked the host as gone while the host's packets kept arriving.

   `net.js` now copes with both. A cheap safeguard in `netroom.js` would be to debounce leaves: in `tr.onPeerLeave`, wait about 3 s before removing the peer and firing `left`, and cancel if a `p` or `g` message from that peer arrives in the meantime.
3. A small thing: `sendTo()` does not check `left` the way `emit()` does.
