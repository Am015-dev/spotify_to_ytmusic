# Brief: add free online play (peer-to-peer rooms) to a game

SP = <workdir>

The user wants friends to play each other online for free. The games are hosted as static files on GitHub Pages, so there is no server. Browsers connect directly over WebRTC, and public Nostr relays are used only to find each other. The shared transport is already written. Your job is to wire one game to it.

## What exists
- `SP/net/trystero.min.js`: the Trystero WebRTC library (MIT), an IIFE that defines the global `Trystero`.
- `SP/net/netroom.js`: the global `NetRoom`. Read the whole file (about 70 lines).
  - `NetRoom.available()`, `NetRoom.lobby(gameKey)`.
  - `.join(roomName)` gives `room {presence(o), on(type,fn), emit(type,data), sendTo(peer,type,data), onPeers(fn), onConnection(fn), leave()}`.
  - Message: `{peer,data,by}`. Peer list: `{peer,isMe,presence,by}`.
  - `NetRoom.uid()` is a stable per-browser id, used for reconnecting.
  - Also `NetRoom.name()` / `setName()`, `newCode()`, `cleanCode()`, `linkCode()` (reads a `#join-abcde` invite link), and `inviteLink(code)`.
- **Reference integration:** Crown City Smash, `SP/kot/net.js`. Read it fully. The UI hooks are in `SP/kot/ui.js`: search for `net`, `NET.`, `isClient`, `isHost`, `mySeat`, `netSend`, `onlineBlock`, `lobbyHTML`. The model:
  - **The host runs the game.** Its page holds the real `G` and runs the engine and the computer players.
  - **The host broadcasts the state** after every change (`netPush`, throttled to about 300 ms, plus a 3 s heartbeat): the JSON of `G`, trimmed, deflate-compressed and cut into 3200-character chunks.
  - **Clients render only the received `G`.** A client never runs the engine or the AI. It turns its own clicks into small action messages (`netSend`) that the host validates and applies for that seat (`onNetAct`).
  - **Lobby:** the host clicks Host and gets a code. Friends type the code or open the invite link. The lobby lists everyone by name. The host presses Start, and seats go to the players in join order. Empty seats go to the computer.
  - **Leaving:** if a seated player leaves, the computer takes over their seat. If they rejoin, matched by `by`/uid, they get the seat back.
  - **Host migration** (if the host leaves mid-game, the lowest seated player takes over from the last safe state) is nice to have. It's required only if it's cheap for your game. Otherwise show "The host left. The game is over." and offer to go back.
- **Local test relay:** `node SP/net/relay.js 17702` (use your own port, see below).
- **Test harness to copy:** `SP/net/p2p-kot.js`. It runs a host plus N clients in separate Playwright Chromium contexts over real WebRTC:
  - `window.NETROOM_RELAYS=['ws://127.0.0.1:PORT']`;
  - `NETROOM_ICE=[]`;
  - a route that serves the built HTML at `https://gns.test/...` and aborts everything else.
  - Launch Chromium **without** a proxy. The sandbox proxy blocks WebSockets, so the real public relays can't be reached from here.
  - Set the game's graphics to Low through its localStorage key before load, or three pages under SwiftShader crawl.
  - Use `waitUntil:'domcontentloaded'` with a 120 s timeout.

## What to build for your game
1. **Include the transport.** Add `trystero.min.js` and `netroom.js` to the game's `build.py`, before the game scripts, read by relative path from `SP/net/` the same way `perfhud.js` is. Then write `net.js` for the game, adapting Crown City's `net.js` to the game's own state and action model.
   - Find where human input becomes a rules move: `performMove` / `validMoves`, or the UI handlers.
   - On a client, route that input to `netSend(move)` instead of applying it.
   - On the host, `onNetAct` checks that the sender owns the seat whose turn or decision it is, checks that the move is legal, applies it through the same code path a local human uses, then pushes.
   - Never trust a client: ignore malformed or illegal moves.
2. **Seat perspective.** Every page renders from its own seat, with "you" labels and the camera/board orientation where the game has one.
   - Hidden information stays hidden on screen: hands, secret dials, face-down cards, unrevealed plans.
   - Hot-seat "pass the device" screens must not appear in online games.
   - Only the local player's turn or decision is clickable. At other times show "Waiting for <name>…".
3. **Simultaneous decisions.** If the game has them (Nebula Aces dials, Shipwreck Isle co-op planning, Sunglaze or others as applicable), the host collects each seat's choice and resolves when all are in. Show who is still deciding.
4. **Co-op games (Shipwreck Isle).** Each human controls their own castaway(s). Shared decisions are made by the current first player, or the host if simpler. Say which in the UI.
5. **UI.** In the start screen or menu, add "🌐 Play online" (the same pattern as Crown City's `onlineBlock` p2p branch):
   - a name field, Host, and an invite-code field with Join;
   - the lobby popup shows the code, the invite link with a Copy button (`navigator.clipboard` in try/catch; on failure select the text), the players, the game options the host chose, and Start or Leave;
   - it closes with ✕/Esc/tap outside like the other popups;
   - it keeps the board-first layout: no page scroll, nothing fixed over the board;
   - opening the page with `#join-CODE` pre-fills the code and opens the online panel.
6. **Connection state.** Show a small status: "Looking for players…" before anyone else is in the lobby, a player count, and "Reconnecting…" / "Host left" as appropriate. If `NetRoom.available()` is false, show one muted line explaining that a recent browser is needed.
7. **Don't break anything.**
   - Solo, hot-seat and watch modes must behave exactly as before.
   - All test hooks stay (`ANIM`, `AIDELAY`, `setSeed`, `UI.sim`, …).
   - jsdom has no RTCPeerConnection, so `NetRoom.available()` is false there and the jsdom tests must stay green.
   - If the page is opened on claude.ai (`window.claude` exists) nothing special is needed. P2P works there too, as long as the CSP allows the relay WebSockets. Just don't depend on `window.claude`.
8. **Sounds.** Clients play the same event sounds as the host where cheap (Crown City derives them from state diffs), and a "your turn" sound when a decision becomes theirs.

## Verify
- Rebuild, run `node --check x.js`, then run the game's existing tests (see `/home/user/spotify_to_ytmusic/games-src/README.md`). All must pass with 0 errors.
- Write `SP/net/p2p-<game>.js` based on `p2p-kot.js`.
  - Play at least 2 complete games over real WebRTC with the host and 1 client, and at least 1 game with the host and 2 clients when the game allows 3+ players.
  - Clients act only through their own page's DOM clicks, using a random clicker like `tick()`.
  - Check that every page agrees on the final state and winner, that remote clicks actually drove moves, and that there are 0 page errors.
  - Also test:
    - a client that leaves mid-game: the computer takes over and the game finishes;
    - a client that rejoins with the same uid: it gets the seat back;
    - a client sending an illegal or malformed action: it's ignored.
  - Take screenshots of the lobby and of a client's view mid-game at 1366x768 and 390x844, view them, and fix anything ugly or overlapping.
- Relay port: use the one in your task so parallel agents don't collide.
- Don't publish, don't commit, and don't touch other games' folders or `SP/net/netroom.js`. If you need a change in `netroom.js`, describe it in your reply instead.
- Write `SP/<game-folder>/ONLINE-REPORT.md`. Reply with:
  - what you built (seat model, simultaneous decisions, hidden info);
  - the exact test results;
  - the size change;
  - known limits.
