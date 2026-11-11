# Final Approach: online play (free peer-to-peer, no server)

Files: `src/net.js` (page side), `src/netstrip.js` (whitelist copy of the state), hooks in `src/ui2.js` (`netRenderHook`), `ui3.js` (`commit`, `schedule`), `ui5.js` (online panel and `#join-CODE` links). Shared modules (`netroom.js`, Trystero) are untouched.

## Model
* **Two seats, host-authoritative.** The host's page holds the real `G`, runs the engine and, if nobody joined or the guest left, the computer crew member. The guest never runs the engine or the AI; it sends moves and renders what it receives.
* **Hidden dice.** `netStrip(G, seat)` builds the guest's copy field by field: own dice values, everything public (placed dice, tracks, tokens, who still holds dice, the briefing phrases); the other crew member's dice are `0`, `seed` and `rng` are `0`,
  scripted hands are gone, events are empty. A field that is not listed never leaves the host. `net-strip-test.js` poisons everything the seat cannot see and checks that the copy, the legal moves and the computer's choice do not change.
* **Moves from the guest** are re-built from checked fields only (`onNetAct`): move type from a fixed list, die index 0-3 or `p`, slot key from the slots in play, coffee |c| <= 3, `m` mask of four booleans; anything else is dropped and counted
  (`NET.rejected`). Then the engine's own `validMoves` decides. Messages longer than 120 characters, arrays, `__proto__` tricks and unknown types are refused.
* **Briefing talk** is a set of preset non-dice phrases (`FA.SAYS`); the guest can send nothing else.
* **Leaving.** A guest who leaves is replaced by the computer (the log says so, the roster shows it); the same browser (same `NetRoom.uid()`) joining again with the room code is put back in its seat at once. **Host leaves = flight over**
  ("The host left"), a button goes back to the start. No host migration (the other page never holds the hidden state).
* **Invite:** code of five characters and a link `.../#join-CODE` (Copy button); the start screen has the host's name box, Host, code box, Join. Lobby pop-up: crew list, seat choice, computer level, airport, Start / Close the room.
* Online games are never saved. Hot-seat is not offered online.

## Tests (local relay, port 17793, real WebRTC between two Chromium contexts without proxy, pages at https://gns.test/)
`PW=<playwright> PORT=17793 node net/p2p-fa.js final-approach/game/final-approach.html SCENARIO` and `net/p2p-fa-phone.js` (390x844 touch contexts, `?phone=1`):
* `full`: host + guest, two flights through Play again; every few clicks each page is checked for hidden dice (DOM and state), the guest's whole state must equal `netStrip(hostG, seat)` byte for byte, final card on both.
* `leave`: 18 forged / malformed messages (all refused, state unchanged, no prototype pollution), guest leaves (computer takes the seat), guest rejoins with the same uid and plays on.
* `ui`: lobby opens at start, Esc / backdrop / x close it, Copy, code and link format, crew list, no hot-seat button.
* `hostleft`: the guest gets the "host left" card and can go back to the start.
* `touch` (phone): the badge and the lobby close button are >= 44 px, the guest plays by tapping dice and spaces.
The last run's lines are in the hand-off message.

## Known gaps
* Real networks, TURN (strict NATs need `window.NETROOM_TURN`) and phones on mobile data are untested from the sandbox.
* No timer for an idle human (the host can restart, or the guest leaves and the computer takes over). The real-time module's 60 s clock is run by the host only.
* A guest that misses packets snaps to the new state without animation.
* The uid is a self-declared browser id (a friends' game).
