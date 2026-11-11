# Doorkick Dungeon: online play report

Free peer-to-peer play through the shared `NetRoom` transport (Trystero WebRTC, Nostr relays for discovery). The design follows the Crown City Smash reference: the host runs the game and every other page only renders what it receives.

## What was built

**Files**
- `net.js` (new, about 21 KB).
- `build.py` inlines `../net/trystero.min.js` and `../net/netroom.js` before the game scripts, and `net.js` after `coach.js`.
- `body.html`: the script tags and a `#dkNetBody` lobby popup body.
- `head.html`: about 2 KB of CSS for the lobby, the status line and the window chips.
- Small guarded hooks:
  - `ui.js`: `mySeat` and `viewSeat` in net mode, `refresh` runs `netWindow` first and `netPush` last, `render` refreshes the lobby and the "host left" modal, `uiAct` routes to `netAct`, `data-a="net*"` clicks, the start-screen "🌐 Play online" choice, and a `dkNet` drawer.
  - `ai.js`: `schedule` never runs on a client, and never runs while a window is collecting answers.
  - `coach.js`: `autoPass` is off in net games, because the host does the same job per seat.
- Solo, hot-seat and watch modes take none of these paths: every hook checks `G.mode==='net'`.

**Seat model**
- The host presses Host and gets a code plus an invite link (`#join-code` pre-fills the code and selects the online mode). Friends type the code or open the link.
- The lobby popup shows:
  - the code;
  - the link with Copy (falls back to selecting the text);
  - the players by name;
  - the host's seat count, computer skill and expansions.
- The popup closes with ✕, Esc or a tap outside, like the other drawers. The start screen keeps an "Open the lobby" button.
- On Start, seats go to the room's players in join order, up to 6, and the rest go to computer heroes. The game has at least 3 seats, or more if the host picked more.
- Human seats take the player's own name (sanitised and de-duplicated). Computer seats keep the hero names.
- Every page renders from its own seat: "(you)" labels, its own hand and tableau at the bottom, and rivals in the top row.
- The hot-seat "pass the device" screen only exists in `mode==='hot'`, so it never appears online.
- When it is someone else's decision, the dock shows "Waiting for <name>…".

**Moves**
- A client turns its clicks into small `{act,card,tgt,opt,cards}` messages. A client keeps one move in flight until the next state arrives (at most 1.5 s).
- The host:
  1. finds the sender's seat (by peer, human seats only);
  2. whitelists and type-checks the fields (`cleanMove`);
  3. applies the move through `gameAct`/`performMove` with that seat, the same path a local click uses. `performMove` checks it against `validMoves` (or the sell ownership check).
- Malformed or illegal input is counted (`NET.bad`) and dropped.

**Hidden information**
- The host sends each peer its own packet with `room.sendTo` (deflate, 3200-character chunks, throttled to 300 ms, plus a 3 s heartbeat). In each packet:
  - every other player's hand is replaced by placeholders (id `-1`), so the opponent cards show only counts;
  - both draw decks become placeholders (counts only);
  - `rng` and `seed` are blanked, so a client cannot predict dice or shuffles;
  - a looting pool and another seat's pending choice options are masked.
- The client maps `-1` to a harmless "hidden card" definition, so the hint simulations and the opponent counts keep working.

**Simultaneous decisions (the interrupt windows)**
- Two windows involve several seats at once:
  - a fight's "last chance to interfere" (`cb.stage==='others'`);
  - the start-of-turn window for curses and level-ups (`phase==='window'`).
- In a net game the host opens the window to all listed seats at once (`G.nw`, in `netWindow`). Any listed seat may play a card or press "Let it be" (pass).
- Collecting answers:
  - The host points the engine's "whose turn" index at the seat that acts, so the move is validated exactly as in the sequential game. A play hands priority back to the fighter, as the rules say.
  - Seats with nothing to play pass automatically, as the local `autoPass` does, unless the fight would win someone the game.
  - Computer seats answer after the usual AI delay.
  - Humans have 30 s; then they pass automatically.
  - When every seat has passed, the engine's own last pass closes the window.
- The dock shows a "Last chance to interfere" box with one chip per seat ("✓ passed" / "deciding…") and the seconds left. A client's own pass shows at once.

**Leaving and rejoining**
- When a seated player's connection drops, the host marks the seat `away`. The computer takes over, including any decision that was waiting for them, and the diary logs it.
- A player who joins the room again with the same browser uid gets the seat back. That works mid-decision too, because the uid is matched on the presence join.
- If the host leaves, clients see a "The host left" modal ("the game is over") with a button back to the start screen. There is no host migration: it is not cheap here, because only the host knows the hidden hands and the deck order.
- "Play again" or "New game" on the host takes everyone back to the lobby. On a client, after the end it returns to the lobby; mid-game it leaves the room.
- A client that hears nothing from the host within 12 s of joining, or for 15 s mid-game, re-opens the room with a fresh connection. It tries this up to 6 times.

**Status line and sounds**
- The dock shows a status line: "🌐 Online · room code · N connected · you host / Reconnecting… / Host left · 🤖 playing for X".
- The lobby shows "Looking for players…" while the host is alone, then the player count.
- Without WebRTC (jsdom, very old browsers), the start screen shows one muted line instead of the online choice.
- Clients play the host's event sounds from the shared fx list, plus a "your turn" sound whenever a decision becomes theirs.

## Test results

**Existing tests on the final build (all 0 errors)**
- `node --check x.js`: OK.
- `rules-test.js`: 46 passed, 0 failed.
- `cards-test.js`: 147 cards, 0 problems.
- `force.js`: 0 errors. It reports the same unlogged names as before the change.
- `gauntlet.js` (10 games): errors 0.
- `click.js` (F and hot, anim 0 and 1): TOTAL errors 0, rejected 0.
- `warn-check.js 20`: 207 situations, warning shown 207, missed 0, false alarms 0, errors 0.
- `cover.js 5`: errors 0, invariants [].
- `board-test.js` (Playwright, 10 sizes and themes): ALL OK.
- `newcomer.js` (1366x768, seed 7): the game ends (Tansy wins), errors 0.

**Real WebRTC: `SP/net/p2p-dk.js`**
- Local relay on port 17705, separate Chromium contexts, graphics Low.
- Clients act only through clicks on their own page's DOM.

| run | pages | seats | result |
|---|---|---|---|
| game 1 | host + 1 client | 3 (1 AI) | Pip won, turn 33; all pages agree (winner, turn, levels, end screen); 100 remote clicks; 0 page errors (Google Fonts requests, which the harness blocks on purpose, are filtered) |
| game 2 | host + 1 client | 3 (1 AI) | Pip won, turn 31; agree; 99 remote clicks; 17 windows, 7 with 2+ humans; 0 errors |
| game 3 | host + 2 clients | 4 (1 AI) | Pip won, turn 22; all 3 pages agree; 108 remote clicks; 19 windows, 6 with 2+ humans, 18 human passes, 5 window plays; 0 errors |
| churn A | host + 2 clients | 3 | 14 malformed or illegal actions all ignored (0 log lines added). A client closed its page at turn 6; the computer took over after 13.5 s. It rejoined with the same uid and got seat 2 back after 4.4 s. The game was still running at the 800 s limit. 0 errors |
| churn B | host + 2 clients | 4 | Bad actions ignored 14/14. Leave, then computer takeover after 13.8 s. The game finished (Hosty won, turn 45, the remaining client agrees). The rejoin page never connected (see the limits below). 0 errors |
| churn C | host + 2 clients (final build) | 4 | Bad actions ignored 14/14. Leave, then takeover after 13.8 s. The game finished (Friend1 won, turn 57, the remaining client agrees). The rejoin page never connected, even after 6 automatic retries. 0 errors |

- **Hidden-hand check (every run):**
  - the client's own hand holds real ids;
  - every rival hand and both decks hold placeholders only, and `rng` is blanked;
  - the hand counts on the rival badges equal the host's real hand sizes.
- **Screenshots** (`SP/shots/dk-online*`, `dk-g1`, `dk-g3`, `dk-g5`): the lobby on host and client at 1366x768 and 390x844, and a client mid-game at both sizes, including the interrupt box with "passed / deciding" chips. I looked at them all.
- **Fixes after viewing the screenshots:**
  - The lobby closed itself on the start screen.
  - Guests saw seat options they cannot change; they now see a note instead.
  - The lobby's colour tokens differed per page; they were removed.
  - The start card re-ran its entry animation on every lobby update.

## Size

`doorkick.html` went from 1,749,527 to 1,841,693 bytes, an increase of 92 KB (+5.3%):

| part | size |
|---|---|
| trystero.min.js | 62.6 KB |
| netroom.js | 4.7 KB |
| net.js | 21 KB |
| CSS and hooks | about 3.5 KB |

## Known limits

- **Flaky rejoin after a leave (transport).** In this harness, a page that reconnects after a seated peer has left sometimes never gets a WebRTC connection to the host, although it does connect to the other client.
  - It happened in 3 of 5 churn runs and in 1 of 4 iterations of a minimal repro (`SP/net/dbg3.js`).
  - The relay log shows the signalling working: the host and the new peer exchange offers and answers on their inbox kinds, twice, and the data channel still never opens. New Trystero instances (6 retries) do not help, so the stuck state is on the host's side.
  - When the connection does form, the seat comes back in 1 to 8 s, so the game-level reclaim works. Crown City and the other games should hit the same problem.
- **Slow leave detection.** A closed tab is noticed only when Trystero drops the peer, after 11 to 23 s here. Until then the seat still waits for that player; windows time out after 30 s.
- **No host migration**: when the host leaves, the game ends for everyone.
- **Sequential choices stay sequential**:
  - asking for help;
  - loot picks;
  - charity;
  - the setup phase.
  
  Each of these is a single-seat decision and shows "Waiting for <name>…".
- **Stale clicks.** A click made on a slightly old state can reach the host after the state has moved on. The host rejects it as illegal (about 1 in 6 random remote clicks in the tests); a real player just sees the new state.
- **Shorter client diary.** The diary on clients holds the last 60 entries; the host keeps 400.
