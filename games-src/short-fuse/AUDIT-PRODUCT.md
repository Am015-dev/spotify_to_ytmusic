# Short Fuse: product audit (Oct 2026)

Audited build: the deployed file `games/short-fuse/index.html` (2.55 MB), served locally and played in headless
Chromium (SwiftShader WebGL, so the page chose "Low" graphics). Played as a newcomer:
- guided first game (job 1, 3 crew), desktop 1366x768: defused, 12 turns, 0 misses;
- guided first game (job 1, 3 crew), iPhone 390x763 (touch): defused, 13 turns, 1 miss; reloaded mid-game and
  resumed with **Continue** (works);
- job 9 "Pecking Order", me + 3 normal computers, desktop: defused, 28 turns, 2 misses; the whole log was checked
  against the job's order rule (two 3s before any 9, two 9s before any 12: respected);
- hot-seat, 3 humans, 375x553: opening tokens and four turns across seats with "Pass to X / I am X" screens;
- every drawer (Job, Gear, Know, Log, Rules, Cards, Menu), the mission board, setup, end card;
- online: hosted a room on desktop; the lobby opened with code and link. **Blocked:** the sandbox proxy rejects the
  public signalling relays, so a second page could not join (same as Kaiten). Online was audited from `game/net.js`
  and `game/ONLINE-REPORT.md`.

On my own turns I used the Suggested move ("Set it up for me") or, when the 3D canvas was hard to hit, called the
page's own tap handler `onTile(stand, wire)` for the suggested wire and then pressed the real value and Snip
buttons. Everything else was real clicks/taps. Known items in `NEWCOMER-REVIEW.md`, `RULES-AUDIT.md`,
`UI-REPORT.md`, `ENGINE-REPORT.md` and `ONLINE-REPORT.md` were checked and are not repeated unless still visible.

Screenshots: `audit-shots/` (JPEG, 12 files).

## Scores (0–5, 5 = as good as a paid app)

| Area | Score | Evidence |
|---|---|---|
| A. The game itself | 4 | All 66 jobs, every tool, crew card, restriction and dare are in, with two prior rules audits fixed. Job 9's order rule held in my game. But in job 1 the computers use a Twin Probe the human is not offered (04), and the AI crew wins only 24–30% of the last 24 jobs and never wins 9 of them (ENGINE-REPORT). |
| B. Learning the game | 3 | Coach cards, job briefings, Suggested move with a reason, glossary in Rules, full Cards list with counts. The suggestion silently disappears on many job-1 turns (03); the Cards list is text only (05); the jargon load is high. |
| C. Playing comfortably | 3 | Autosave after every move and Continue after a reload (verified). Log, result banners, end stats. Settings are on/off only (no volume, text size, colour-blind mode); no undo after Snip (fine by the rules; "Start again" exists before it). |
| D. Playing with friends | 3 | Lobby with code + link, computer takes a leaving seat, hot-seat with proper pass screens (11). Same gaps as Kaiten: no TURN, no "could not connect" state, no emotes, no async, host leaving ends the job. |
| E. Look, sound, feel | 2 | A generic 3D cartoon kit, not the painted look the brief asks for; gear cards are text panels; on phones the crewmates' racks are 8–15 px until you tap to zoom (07). Real CC0 samples, music that turns tense on the last fuse step. |
| F. Quality | 2 | 0 page errors, but fonts load from Google at runtime (breaks offline and privacy), the dual cut can only be aimed by clicking the 3D canvas (no keyboard / screen-reader path), and the phone start screen clips at 375x553 (10). |

## Problems

### P0 (blocks paying users)

1. **The original game's title, designer and publisher are in the public repo.** `rules-notes.md` (first line and
   the facts table), `sources.md`, `RESUME.md`, `research/README.md` (rulebook and catalogue URLs), `research/card-notes.txt`,
   `research/gen/missions.py` / `cards.py`, and the `ref` fields of `missions.json` (67), `equipment.json` (18),
   `characters.json` (14). The brief's hard rules say research stays in the private repo and real names appear only
   in private research data. The deployed page itself is clean (checked).
   Fix: move `rules-notes.md`'s facts table, `sources.md`, `research/` and the `ref` fields to
   `game-night-private/short-fuse-research/`; keep a scrubbed `rules-notes.md` in our own words; ask the owner whether
   to rewrite git history (the names stay in old commits otherwise). Effort S (move) / M (history).
2. **Selling needs a licence.** The 66-job campaign, its five sealed boxes, rule stickers, equipment set and mission
   numbering reproduce a 2024 co-op deduction game job by job. That is fine to share free among friends; a paid release
   needs the publisher's licence, or a redesign into our own campaign (new jobs, new tools) on the same core.
   Effort L (business). **[shared]**

### P1 (clearly below a paid app)

3. **Job 1: the computers use a tool the human is not given.** `ui.js:52` hides gear and personal tools in job 1
   (`noGear()`, UI only), but the engine and AI still allow the Twin Probe. My guided game log: "Plum points at 2 wires
   of Amber and says "6" (Twin Probe)"; the Defused card shows "1 gear used" in a job whose card says "no equipment"
   (04). Fix: enforce the job-1 restriction in the engine (`legal()` / `validMoves`) so AI and humans match, or offer
   the probe to the human with a coach card. Effort S.
4. **Job 1: the Suggested move vanishes.** `tipHTML()` (`ui.js:336`) drops the whole suggestion when the AI's best
   move uses a tool in job 1, and computes no fallback. On my 3rd turn of the guided game the suggestion was
   `{"a":"dual","st":3,"v":5,"ks":[4,5],"tool":"dd"}` → the card disappeared and the dock only said "Tap a glowing
   wire" (03). The guided game is exactly where it is needed. Fix: ask the AI for the best move without tools when
   `noGear()`. Effort S.
5. **Fonts come from Google at runtime** (`game/head.html:8-9`). The page is not self-contained: offline (shelf
   "keep this game") and in blocked networks it falls back to system fonts (the title and buttons look different),
   and every visit sends the player's IP to Google (EU courts have fined sites for this). Fix: embed subsetted woff2
   of the two fonts in the build (~60 KB). Effort S. **[shared]** (check every game's head).
6. **Aiming a dual cut needs the 3D canvas.** On desktop the only way to point at a crewmate's wire is to click its
   tile in the 3D scene ("Tap a glowing wire on the table"); there is no list of wires in the dock (unlike the opening
   token, which has buttons). Keyboard and screen-reader players cannot play, and on desktop the tiles of the side
   racks are ~15 px and seen edge-on (02): my first click missed. Fix: a "Point at" row per crewmate in the dock
   (letters A–M with known tokens), keyboard arrows to move the highlight. Effort M.
7. **Phone table is unreadable until zoomed, and the zoom is confusing.** At 390x763 the board is 390x365 with the
   bomb board in the middle and the racks in the corners; crewmate wires are ~8–15 px (07). Tapping a rack zooms in, but
   a 2-stand crewmate's two stands overlap in the zoom with no wire letters visible, and my tap selected "Teal's wire
   D (stand 2)" while the header said "Teal · stand 1" (09). Fix: on phones draw crewmate racks as flat 2D rows
   (wire backs with letter + token, 36 px+) above the strip, keep 3D for the overview only; one stand per zoom. Effort M.
8. **The phone start screen does not fit.** At 390x763 the mission board is a box showing one row of jobs (06); at
   375x553 no job tile is visible at all and the Start button is cut off at the bottom (10). There is no painted
   title (Play / Online / Resume / How to play) as the brief and Kaiten have; the first screen is a dense form.
   Fix: Kaiten's title → setup flow: title with Play / Online / Continue / How to play, then a one-line setup summary
   with Configure, and the mission board as its own full-screen sheet. Effort M. **[shared]** (one start-screen
   pattern for the suite).
9. **Art is placeholder-grade next to the shelf's reference.** A flat-shaded 3D kit (racks, a bomb, cardboard
   cards), gear cards are text on a striped panel (05), crew cards are tiny 3D cards; the brief asks for a painted 2D
   PixiJS set with `ART-PROMPTS.md`, which this game does not have. Fix: write ART-PROMPTS.md (table mat, wire tiles
   blue/yellow/red, 18 gear cards, 9 crew portraits, bomb dial, title), paint them, show gear and crew cards as
   pictures in the drawers. Effort L.
10. **Card reference has no pictures and is missing from the shelf reference page.** The Cards drawer is 180 text
    rows with counts (good content) but no picture, no search and no index (05); tapping a gear chip on the phone
    shows the text card. `UI-REPORT.md` says `dump_ref.js` wrote `SP/ref_shortfuse.json`, but that file is not in
    the repo and `refpage/gen.py` does not read it, so `games/reference.html` has no Short Fuse section. Fix: commit
    the dump, add it to `gen.py`; in-game add a search box and pictures from the kit's card atlas. Effort M.
    **[shared]**
11. **The AI crew is the product in a co-op game, and it is weak late.** Win rate with normal teammates is 24%
    (jobs 43–54) and 30% (55–66); jobs 29, 43, 45, 47, 51, 61, 64, 65, 66 were never won in 16 tries; hard is only
    slightly stronger than normal (ENGINE-REPORT). A player who carries the campaign will hit a wall where the
    teammates, not the puzzle, lose the job. Fix: per-job heuristics for the nine zero-win jobs, a memory of public
    events for the AI (it has none), and a "careful" level that never takes a <70% call when a safer action exists.
    Effort L.
12. **Settings below the bar** (same as Kaiten): sound/music on/off, crew speed, graphics, Suggested move, Lesson
    tips. Missing: volume sliders, text size, reduce motion toggle, haptics, left/right hand. Colour is not the only
    cue for wires (red tiles carry a bomb icon, yellow a bolt: good). Effort M. **[shared]**
13. **Online gaps** (same as Kaiten): no TURN server, no "could not connect" state, no emotes or quick signals
    (the rules allow a few: the page already models crew calls), no turn timer, host leaving ends the job, no async.
    Effort M. **[shared]**

### P2 (polish)

1. The log still says "The fuse is lit." after the opening tokens (`G.log`, seen in both games); the newcomer review
   marked it renamed, but only the dock line changed. S.
2. "Miss: none of those is 6." is written for a one-wire dual cut. Say "Miss: that wire is not 6." S.
3. After the guided game, the setup screen's computer level is Easy (it was Normal before; newcomer review item 9
   says the guided game no longer overwrites the setup). S.
4. With Lesson tips on (the default), a normal job 9 game opens with "Welcome to the crew!" again. Switch lesson
   tips off after the guided game is finished. S.
5. Suggested move is on by default for every job and the "What we know" table lists every possible value: in a
   deduction game this plays the puzzle for the player, and the rules forbid recalling earlier information. Keep it,
   but default it off after job 3 and say in Rules that it is a digital aid. S.
6. Saves have no build version or invariant check on load (`ui.js:598`, `ui.js:611`); a save from an older build
   can resume into a broken state. S.
7. Desktop mission tile labels clip ("Butterfinge", 01); the online Host button is white text on light orange (low
   contrast, 12). S.
8. `RESUME.md` says "work in progress, not on the shelf" although the game is deployed. S.
9. No favicon / meta Open Graph tags (invite links show a bare URL), no stats or achievements beyond the per-job
   best. S/M. **[shared]**

## Top 5 fixes (value for effort)

1. Move the research files and real names out of the public repo (P0-1) — S, it is a hard rule.
2. Job 1 fixes: same tool rules for AI and human, and a tool-free suggestion (P1-3, P1-4) — S, the first game.
3. Embed the fonts (P1-5) — S, restores offline and removes the Google call.
4. "Point at" wire buttons in the dock (P1-6) — M, keyboard/screen-reader play and no more missed clicks.
5. Kaiten-style title + full-screen mission board on phones (P1-8) — M, the first impression on iPhone.

---

## Suite-level notes (fix once for every game)

1. **Autosave in the shell.** Give `shell/` a `GX.autosave(key, getState, version)` that saves on every turn and on
   `pagehide`/`visibilitychange`, and a Resume button contract for the title. Kaiten (the reference) has none;
   Short Fuse has its own. Copying Kaiten spreads the gap.
2. **Title/drawer z-order.** Kaiten's title (`z-index:60`) hides the shell drawers (`41`): "How to play" from the
   title is dead. Put a guard in the shell (drawers opened while a full-screen start layer is up go above it) and add
   a click-test assertion that every button changes what is on top (`elementFromPoint`), not only the DOM.
3. **One settings drawer for all games**: volume sliders (effects/music), text size, reduce motion, haptics
   (`navigator.vibrate` on Android; none on iPhone), colour-blind check, left/right hand, language-ready strings.
4. **Card reference everywhere.** `games/reference.html` covers 7 games and misses at least Kaiten Kitchen and
   Short Fuse. Make each build emit `ref_<slug>.json` (Short Fuse already has `refEntries()` / `dump_ref.js`), have
   `refpage/gen.py` read every file in a folder, and give every game a "Cards" bar button plus a shared "read it big"
   sheet (tap or long-press any card).
5. **Online on real networks**: configure TURN in `net/netroom.js` (it already supports `window.NETROOM_TURN`, but
   no game sets it), add a 15 s "could not connect" state with advice, canned emotes, an optional pick timer.
   Sandbox note: the public relays were unreachable from this test machine, so no real join was tested here.
6. **Self-contained pages**: no runtime font/CDN loads (Short Fuse uses Google Fonts); a favicon, meta description
   and Open Graph tags per game so invite links preview well; remove dev pages from `games/` (e.g.
   `kaiten-kitchen/preview.html`).
7. **One look and one flow.** Kaiten (painted 2D, title → setup → table) and Short Fuse (3D kit, form-like start
   screen, different lobby) feel like two products. Pick Kaiten's flow as the suite standard and port the start,
   lobby, end and settings screens.
8. **Identity and store needs** live at shelf level: profile name/avatar shared across games (each game asks for a
   name again), stats and achievements, privacy policy and terms pages, an opt-in crash report, age rating, and the
   PWA wrapper the shelf already has (`manifest.webmanifest`, `sw.js`) extended to app-store wrappers.
9. **Legal.** Every faithful adaptation needs a publisher licence before it can be sold. Before any sale, scrub
   original names from the public repo (Short Fuse has many) and from internal ids (Kaiten uses the original
   component words as ids); consider making the source repo private.
