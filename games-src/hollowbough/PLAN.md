# Hollowbough — build plan

An Everdell-style (BGG 199792) woodland city-building game for the Game Night Shelf.
Original names, card text and art (storybook watercolour). Full base game first; expansions later
(Pearlbrook, Spirecrest, Bellfaire, Newleaf, Mistwood), one at a time.

## Stages and owners (one owner per file set; agents never edit another stage's files)
1. Research — `rules-notes.md`, `cards.json`, `sources.md`.
2. Art kit — `kit/` (`HBKit`: cards, tokens, tree board, locations, workers, seasons).
3. Engine + AI — `game/src/engine.js`, `data.js` (built from cards.json), `ai.js`, `rules-test.js`,
   `gauntlet.js`, `cover.js` (every card/location/event forced), `hidden-test.js`.
   State in one serialisable `G`; legal-move list `moves(G, seat)`; `apply(G, move)`; seeded RNG.
   AI: easy / normal / hard for every seat, plus the solo automa (Rugwort-equivalent, renamed).
4. UI — `game/src/ui*.js`, `head.html`, `body.html`, `build.py` → `hollowbough.html`.
   PHONE FIRST: follow the phone-play spec from the start (board ≥ 0.85 of the short side, tap to act,
   pop-ups beside the board, one card at a time, ≥ 44 px targets) and the board-first desktop shell.
   Modes: vs computer (each seat), hot-seat, watch, guided first game, rules modal, log, save.
5. Online — `game/src/net.js`, `netstrip.js` (hands and deck order hidden per seat), `games-src/net/p2p-hb.js`.
6. Audio + speed tool (shared `gameaudio.js`, `perfhud.js`), shelf entry, cover image, deploy.

## Targets before shipping
- 0 errors / 0 stalls in 1000+ AI games at 1–4 players; every card, location and event used (cover.js).
- Seat win split within 40–60% between equal AIs; average game length matching the box (40–80 min).
- Rules tests for every scoring rule, season change, city limit, occupy rule, Journey/Haven, events.
- lay.js (desktop sizes) and lay-phone.js (4 phone sizes) 0 problems; click.js 0 errors incl. `?phone=1`;
  p2p full games agree with 0 leaks.
- The main session re-runs every test itself on the repo build before deploying.
