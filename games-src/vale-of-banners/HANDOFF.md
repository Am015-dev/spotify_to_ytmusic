# Vale of Banners (W350) - handoff

Branch `shelf/W350-vale-of-banners` (not deployed). Slug `vale-of-banners`, folder `games-src/vale-of-banners/`. Build: `python3 build.py`
(one self-contained html, ~350 KB). Added to `GAMES` + `SWEEPS` in `scripts/build-all.py` and to `scripts/modmap.py`.

## What plays
- Full rules: 5 seasons x 5 rounds, 2 dice each, take / build / sell / workers, workers bend dice (6<->1 wraps), back lane for silver,
  Keeps (free action), Mines, 26 Lore tiles, 8 Buildings (no duplicate per quarter), Pastures, Barges + banner track, region and colour
  scoring by season, white die places the round's goods, end scoring. Our own estate map. Details: `rules-notes.md` (confirmed vs guessed).
- Centrepiece: the chain turn. Moot Hall (and Keeps) open a free build at once; each chained tile flies in, a gold ribbon links it to the
  last one, "Chain xN" pops and the dock shows the chain banner.
- 2-4 players, 1-3 computer stewards (easy / normal / hard) and hot-seat friends.
- Title: Story (primary), Quick game, Continue, Tutorial, How to play. Menu: Rules, Tutorial, Restart, Title, Sound, Music (+Songs picker).
- Tutorial (gx-tutor): staged first turn (take, build next to land, end turn), offered on the title, replayable from Menu/Story map.
- Story (gx-campaign): 10 chapters / 3 acts, bosses Cass Ferrow (barges), Lord Haskel (keeps), Ivo Grath (silver); seasons grow 2 -> 5,
  AI easy -> hard, twists (boss silver/workers/first, closed back lane). `campaign.json`, `CAMPAIGN-DESIGN.md`.
- Help: rules drawer, hint bulb (suggested move + why), coach bubbles on Keep / Moot Hall / Barge questions.
- Every tile can be tapped to read it large with its full text and the action buttons ("Take (die 3, 1 worker)").
- Music: gx-music slots title/main/finale/victory/defeat, silent until `games/vale-of-banners/music/<slot>-a.mp3` exist (build lists them). Synth sfx, mute.

## AI (headless, `node gauntlet.js N A B [players]`)
| match | games | win % | avg score |
|---|---|---|---|
| hard vs first-legal bot | 100 | 100% | 159 vs 26 |
| normal vs first-legal bot | 100 | 100% | 135 vs 28 |
| easy vs first-legal bot | 100 | 100% | 105 vs 30 |
| hard vs normal | 24 (40 earlier) | 88% (85%) | 154 vs 133 |
| normal vs first, 4 players | 40 | 100% | 149 vs 39 |
Spending: hard ends with 3.6 silver / 2.8 workers, normal 6.8 / 5.9 (both count as points at the end; normal still keeps a few workers).

## Tests (all pass)
- `node rules-test.js`: 28 checks (one per tricky rule) + 300 AI games over 2-4 players: 300/300 finished, 0 stuck, 0 invariant breaks.
- `node smoke.js` (real taps, phone 390x763 touch + PC 1440x860 mouse): title -> 3 turns -> forced end -> result: PASS both.
  `FULL=1 node smoke.js`: a whole 25-round game by taps to the result screen, twice per size: PASS, 0 errors.
- `node story-test.js`: Story chapter 1 played fully by taps (won, 3 stars, progress saved) and chapter 2 started/finished, both sizes, 0 errors.
- `node tut-test.js`: tutorial walked by real taps to the end screen, both sizes, 0 errors.
- `VIS_SLUGS="," python3 scripts/build-all.py --quick vale-of-banners`: PASS (6/6 ?scn= scenarios: vb-board, vb-chain, vb-result + kit menu).
- `scripts/ui-audit.spec.js` (phone + pc, local gx-serve): A0 B0 C0 D0 F0, E2 = locked/off-screen chapter nodes of the shared Story map on the
  duplicate "panel Menu" surface only (the same map passes on the "campaign" surface; it looks like the audit taps nodes clamped at the map's
  scroll edge). Shared files are read-only for me; left for the orchestrator.
- Picture slots: proved with 3 dummy webp files (bg-title, tile-keep, portrait-odo): all drawn at slot size, no failed request; dummies deleted.
- Offline: the page is one file and requests nothing else until media/music files exist (checked: 0 extra requests). offline.json is written by
  build-all at deploy; make sure the slug is in games/sw.js SLUGS at deploy so `offline-test.js vale-of-banners` can run.

## Found -> fixed (played it myself)
1. Phone: market overlapped the estate -> estate placed under the measured market.
2. Phone: dock too tall, buttons below the fold -> dice + money in one row, storage + goods in one row.
3. Phone: back lane stacked 4 tiles high -> its own horizontal row.
4. Coach bubble covered estate numbers and made 2 instruction lines -> no auto bubble on the plain turn (bulb + tutorial teach it).
5. Title had 4 "primary" buttons -> Story is the one primary.
6. PC text under 16 px (bar labels, Story map labels) -> floored to 16 px in our CSS.
7. Space numbers and tile glyphs low contrast -> numbers on cream discs, glyphs drawn by CSS.
8. Locked Story chapters did nothing on tap -> a toast says to win the previous chapter.
9. Normal AI ended with ~9 unused workers -> worker value capped (now ~6).
10. Tutorial piece was invisible behind the bubble on phone -> bubble sides set by the kit; verified by tap test.

## Missing / next
- Art: all code-drawn placeholders (92 slots, Flow prompts ready: ASSETS.md, ASSET-CHECK 92/92/0). Music files not made (cues ready).
- Online P2P not built (not in this brief). No undo. Estate on phone is ~36 px hexes (tap OK, could be bigger if the dock collapses).
- Story score thresholds are estimates; the act-3 chapters vs hard AI are tough (hard averages ~155).
