# Free online play (peer to peer, no server)

Static hosts (GitHub Pages, Netlify) can't pass moves between players. The free answer is WebRTC.

- **Finding each other:** browsers meet through public Nostr relays, which only carry an encrypted handshake.
- **Playing:** after that, every move goes browser to browser.
- **The code:** `assets/net/trystero.min.js` (Trystero 0.25.4, MIT, bundled with esbuild and guarded so it only loads where WebRTC exists) and `assets/net/netroom.js` (a room layer with the same shape as the claude.ai `room` capability).

## Model that worked in 7 games
- **The host runs the game.** Its page holds `G` and runs the engine and the computer seats.
  - After every change it broadcasts `G`: trimmed, deflate-compressed and cut into 3200-character chunks.
  - Broadcasts are throttled to about 300 ms, plus a 3 s heartbeat.
- **Clients only render.**
  - A client turns its clicks into small move messages.
  - The host checks the sender owns the seat, validates the move against `validMoves`, and applies it through the same code path a local click uses.
  - It ignores anything malformed. Test this with `__proto__`, oversized strings and out-of-turn moves.
- **Hidden information.**
  - The host sends each peer its own copy with `room.sendTo`, stripping:
    - other players' hands;
    - secret dials or plans;
    - deck and bag order;
    - the RNG seed.
  - The host's own screen must never draw another player's secrets either.
- **Simultaneous decisions** (dials, co-op planning, interrupt windows): the host collects one choice per seat and shows who is still deciding. Use a timeout with auto-pass where the rules allow it.
- **Seats and the lobby.**
  - Seats go in join order, host first. Empty seats go to the computer.
  - A lobby popup shows the code, an invite link (`#join-CODE`, which works inside claude.ai too) with a Copy button, the players and the host's options.
- **Leave and rejoin.**
  - When a seat leaves, the computer takes over, including any pending question.
  - The same browser uid (`NetRoom.uid()`, kept in localStorage) gets the seat back.
  - Closing a tab is reported immediately by `pagehide`.
- **Host migration** works when `G` is complete (Crown City, Sands, Sunglaze): the lowest remaining seated human takes over from the last safe state. Skip it if the host holds closures or story state, and show "The host left" instead.
- **Every other mode is untouched.** jsdom has no RTCPeerConnection, so the jsdom tests stay offline.

## Testing
- The sandbox proxy blocks WebSockets, so the real relays can't be reached.
  - Run `node assets/net/relay.js <port>`, a 30-line local Nostr relay.
  - Point pages at it with `window.NETROOM_RELAYS=['ws://127.0.0.1:PORT']; NETROOM_ICE=[]`.
  - Launch Chromium **without** the proxy.
- `assets/tests/p2p-template.js` runs a host plus N clients in separate contexts over real WebRTC.
  - Clients click only their own DOM.
  - At the end, check all pages agree, remote clicks drove moves, and there are 0 page errors.
  - Also test: a client leaves (the computer takes over), it rejoins (gets its seat back), it sends bad actions (they're ignored), and the host closes its tab.
- **Rejoin mid-game was flaky in full games under heavy load.** It sometimes failed with 3D on a software GPU, and once in a DOM game. Transport-only tests passed about 30 of 30. Report this honestly.
- **Real networks are untested from the sandbox.** Some strict networks need a TURN server, set with `window.NETROOM_TURN`.

## Bugs found along the way
- Trystero touched `TextEncoder` at load, which crashed every jsdom test until the load was guarded.
- An unhandled rejection in `DecompressionStream` came from malformed packets. Catch `write()` and `close()`.
- A "ghost peer" reappeared when a late presence message arrived after leave. Keep a `gone` set.
- `sendTo` ignored `left`.
- Two rooms open in one page: a re-join must close the old room first.
- A presence message lost once means the peers never list each other. Re-send presence every 5 s, and only report changes.
- Names from other peers must be sanitised on receive.
