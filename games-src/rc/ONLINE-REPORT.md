# Shipwreck Isle: online play report

Free peer-to-peer online play over the shared NetRoom transport (Trystero WebRTC, Nostr relays only to find each other). Up to 4 castaways; empty seats are computer castaways.

## What was built

- **Transport.** `build.py` inlines `../net/trystero.min.js` and `../net/netroom.js` right after `perfhud.js`, before the game scripts. The new `net.js` sits before `ui.js`. Room names are `swi-<code>`.
- **Host runs the game.** The host's page holds the real `G`, runs the engine, the computer castaways and the story player. It broadcasts state after each change (throttled to 300 ms, plus a 3 s heartbeat): `G` with a trimmed log, the story scenes of the current day with the snapshots on screen, the scene index, "quick days" and the computer teammates' plan note. The packet is deflate-compressed and cut into 3200-character chunks.
- **Clients render only what they receive.** They never run the engine or the AI (`schedule`/`aiStep` return early on a client). A click becomes a small action (`place`, `rm`, `job`, `suggest`, `clear`, `pay`, `skill`, `item`, `disc`, `pile`, `moveask`, `ready`, `start`, `ans`, `next`, `skip`). The host checks it in `netAct` and applies it through the same functions a local click uses (`place`, `unplace`, `doJob`, `suggestCore`, `useSkill`, `answer`, `storyNext`, `startActions`…).
- **Seat model.** Players take castaways in join order: the host first, then the others. If more players join than castaways were picked, unpicked castaways are added up to 4. Extra people only watch. In `G.chars[i]`:
  - `hh` is the truth, "a person plays this castaway". The engine and AI now ask `hum(c)` instead of `c.human`.
  - `human` is a per-page lens, "this page plays it". Every page sets it to its own seat, so the advisor, the 4-step wizard, "Plan for me", the recommendations and the question boxes all work for *your* castaway with no other changes.
  - The host applies another seat's advisor actions under `withLens(seat, …)`.
- **Shared decisions.** These belong to the **first player ★** of the day, or to the host when the first player is a computer:
  - team questions (the engine already asks `firstC()`);
  - Friday, the dog and the other helper pawns;
  - starting items, discovery tokens and the signal pile;
  - "ask me tonight about moving the camp";
  - starting the day.

  The planning bar and the lobby say so.
- **Joint planning (simultaneous decision).**
  - Each player assigns only their own castaway's pawns, with their own copy of the 4-step wizard.
  - A team bar at the top of the wizard shows every castaway's jobs live, and each one's status: *planning · n to place*, *✓ ready*, or *🤖 done* for a computer castaway.
  - In step 4, everyone except the first player gets an **I'm ready** button. It is refused while any of your pawns has no job, or while a job you joined is still short of pawns. Changing your plan clears your ready mark.
  - The first player's **Start day** shows *⏳ Waiting (n)* until everyone is ready. The host checks this again.
- **Phase cards / Continue: one page-turner, not "everyone Ready".** The first player ★ presses Continue for everyone, and the host can too as a fallback. The others see "⏳ Waiting for Bob (Cook) to continue (the first player ★ turns the pages)".
  - Why: a day has about 15–25 scenes. Asking every player to press Ready on each one would be slow and nagging, while one reader keeps everyone on the same page at the same moment.
  - Each Continue carries the id of the scene on screen, so a double press (first player and host together) never skips a scene.
  - "Play by itself" is host-only and plays the scenes for everyone. "Quick days" is the host's setting and is sent to everyone, so every page skips the same scenes.
- **Seat perspective.**
  - Lives show "· you" or the player's name. The Camp drawer shows "(you)", "(name)" or "(computer)".
  - Another castaway's skills, and the shared items and tokens, are disabled for non-leads, with the reason in the tooltip.
  - The × on another player's pawn is not offered.
  - A question goes only to its castaway's page. Everyone else sees "Waiting for X to decide: …".
  - There are no hot-seat screens: the game never had pass-the-device screens. The island has no per-seat camera, so there is no camera to orient.
- **Hidden information.** This is a co-op game with open plans, which the brief asks to show live. The face-down piles (event, mystery, adventure, beast and discovery decks) are reshuffled in every packet a client receives, so their order never reaches another page.
- **UI.**
  - **🌐 Play online with friends** sits at the top of the start screen: a name field, Host, an invite code field and Join. It is a `<details>` that opens by itself for a `#join-CODE` link.
  - The lobby popup shows:
    - the status line ("Looking for players…", "N players here");
    - the code;
    - the invite link with Copy (clipboard in try/catch, the text is selected if copying fails);
    - the players;
    - the options and seat list the host chose;
    - Start, or Leave / Close the room.
  - ✕, Esc and a tap outside close the lobby back to the start screen, which then shows "Online room abcde · Open the lobby / Leave the room".
  - A small status pill in the header bar shows the code, the player count, "Reconnecting…" or "The host left", so nothing covers the board.
  - Without WebRTC (jsdom, old browsers), one muted line explains that a recent browser is needed.
- **Leaving and rejoining.**
  - When a seated player leaves, the computer takes their castaway. During planning their pawns are taken back so the computer plans them fresh, and a pending question of theirs is answered by the computer.
  - A player who rejoins with the same uid (`gns-uid`) gets the seat back.
  - If the host leaves: "The host left. The game is over." with a button back to the start.
  - Host migration is **not** implemented. The story scenes and their snapshots live only on the host's page, so a migration would need a rebuilt story mid-day, and it isn't cheap here.
- **Sounds.** Clients play the scene sounds as each scene appears (the same `beatFx` path as the host), plus a chime when a question becomes theirs or planning opens with pawns to place.
- **Never trust a client.**
  - Malformed packets are dropped: the type must be a short string and an action at most 1.5 KB.
  - Targets are rebuilt from validated fields (type whitelist, index ranges, invention keys checked with `hasOwnProperty`).
  - Pawn ownership is checked, and seat and lead rights are checked.
  - Any exception rolls the plan back. Errors go back only to the sender, as a toast.

## Test results

Final build: `python3 build.py`, then `node --check x.js` passes.

### Existing tests

- `rules-test.js`: 24 pass, 0 fail.
- `force.js`: 2520 runs, 0 failing.
- `gauntlet.js 20`: 0 errors.
- `adv-test.js`: 0 illegal plans, 0 bad moves, 0 errors.
- `click.js` (jsdom): TOTAL errors 0 (183 s).
  - One earlier run on the busy machine (load average about 20) hit the script's 120 s-per-game limit. The **unchanged baseline build** hit the same limit in a parallel run, so it is a timing flake and not a regression.
- `lay.js` (all 4 sizes): PROBLEMS 0.
- `np.js 1366 768`: 50 shots, 0 errors.

### Real WebRTC (`net/p2p-rc.js`, local relay on port 17703)

Every game below ran to the end. On every page the end state and winner matched (`agree: true`), there were 0 page errors, and the clients acted only through their own page's DOM clicks.

| Run | Players | Result | Remote clicks / moves applied by the host |
|---|---|---|---|
| g1 | host + 1 | Cook died, round 7 | 134 / 31 |
| g5 | host + 1, with bad actions | Carpenter died, round 7 | 112 / 29; 21 illegal or malformed actions ignored, host state byte-identical |
| f2 | host + 1 | Carpenter died, round 8 | 171 / 39 |
| g3 | host + 2 + 1 computer castaway | Explorer died, round 7 | 226 / 59 |
| f3 | host + 2 + 1 computer castaway | Soldier died, round 6 | 250 / 53 |
| g4 | host + 1, client tab closed at 25 s | computer took over the Cook, game finished (round 8) | – |
| g6 | host + 2, client tab closed | computer took over, game finished (round 7) | – |
| g7 | host + 2, client left at 15 s and rejoined with the same uid | seat 1 back as a human, game finished (round 6) | – |

"Moves applied by the host" counts remote actions that changed the host's state, by kind: place, suggest, ready, start, ans, next, skip.

### Screenshots

At 1366x768 and 390x844, in `online-rc/shots/`: start screen with a `#join` link, start screen while in a room, host and client lobby, client mid-game in planning and in the story. All were checked.

They led to these fixes:
- the online block moved to the top of the start screen;
- a class name clash (`.row`) was fixed;
- the header pill is compact on phones;
- Pause is hidden online.

## Files changed

- New:
  - `rc/net.js`;
  - `net/p2p-rc.js` (WebRTC test, relay port 17703).
- Small hooks, each guarded with `typeof`, so solo, hot-seat and watch play and the node tests that load only the engine are unchanged:
  - `engine.js` (`hum()`, `ask`);
  - `phases.js` (2 lines);
  - `scen.js` (Ada);
  - `ai.js` (`allAI`, `schedule`, `aiStep`, `simOnce`, the helper pool);
  - `advisor.js` (`humanFree`, two messages);
  - `plan-ui.js` (wizard pawns, team bar, waiting text);
  - `story.js` (Continue control, auto timer, re-render key);
  - `ui.js`:
    - no autosave while online;
    - `netPush` from `refresh`;
    - the step-4 button and text;
    - the "you" labels;
    - skill, item and token guards;
    - the chip ×;
    - the lobby, the online block, the game-over buttons;
    - the click and key hooks;
    - Pause hidden online;
  - `body.html` (scripts, status pill), `head.html` (CSS), `build.py`.

## Size

`shipwreck.html` went from 3,713,697 to 3,820,504 bytes (+106,807, +2.9%):

| Part | Bytes |
|---|---|
| `trystero.min.js` | 62.6 K |
| `netroom.js` | 4.7 K |
| `net.js` | 35.2 K |
| CSS and hooks | about 4 K |

A state packet is about 2–6 KB compressed, which is 1–2 chunks.

## Known limits

- No host migration: if the host leaves, the game ends.
- No spectator view for a fifth or later player. They stay in the lobby list but are not seated.
- If the first player stops responding, the host can still turn the pages, but only the first player (or the computer, once that player leaves) can start the day.
- "Why" notes from 💡 Plan for me are not sent back to a client, so the client sees its plan without the per-job "Why:" lines.
- Testing used a local relay and no TURN server. Strict NATs in the wild may need `NETROOM_TURN`.
