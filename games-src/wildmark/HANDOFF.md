# Wildmark (W343) handoff

Habitat tile-and-animal-token drafting game: hex map per player, 4-pair market, keystones and acorns, sweeps, 5 animal
cards (set A), habitats with majority bonuses, solo mode. Branch `shelf/W343-wildmark` (not deployed).

## What plays
- Title: **Story** (one primary), Resume (when a save exists), Quick game (solo / 1-3 rivals, easy/normal/hard, 1-4 players
  on this device = hot-seat with pass screens), Tutorial (offered as "New here?" on first launch), How to play.
- Board-first play: tap a market column, glowing spots on the map, ghost tile, Turn / Place / Back, glowing token targets,
  Return token. Scoring pop + the pattern lights up (centrepiece). Pan (drag), pinch, wheel zoom, +/-/fit buttons, auto-fit.
- Acorns: free pick (any tile + any token), replace any tokens. Sweep 3 button. Four-of-a-kind sweeps itself.
- Story (`campaign.json`, `CAMPAIGN-DESIGN.md`): 3 acts, 10 chapters, 3 bosses, twists boss-acorns / short-season / no-sweep.
  Tutorial runs as the Story prologue until finished once.
- Help: coach bubble per phase (first time), lightbulb = hard-AI suggestion + rules cards, Rules drawer, Scores drawer, Menu
  (GX.settings), synth sfx + mute, music slots via gx-music (silent until games/wildmark/music/*.mp3 exist).

## Tests (all from this folder)
| Test | Result |
|------|--------|
| `node rules-test.js 240` (scoring cases + 240 AI games, 1-4 players, invariants every move) | PASS, 0 illegal/stuck; win rate hard 56% / normal 41% / easy 3% |
| `node smoke.js` (title tap, 3 turns by taps, forced end, result; phone + PC) | PASS |
| `node playthrough.js` (full 20-turn game, tutorial, Story c1 + c2 by real taps; phone + PC) | PASS, run twice |
| `node extra-test.js` (hot-seat, boss/short-season/no-sweep twists, bear-pair pop; phone + PC) | PASS |
| `VIS_SLUGS="," build-all.py --quick wildmark` (scenarios wm-board/place/token/sweep/story/boss/result + menu) | PASS |
| `ui-audit.spec.js` phone + pc | A0 B0 C0 D0 E3 F0 (E3 = audit race, see below) |

E3: "panel How to play: Help / Accessibility / About dead". The audit boots `?scn=menu`, which starts the shared
menu walk (gx-scenario `menuPass`) in the background; the walk opens the Menu drawer while the audit is tapping the
How-to-play surface, so the audit lists the Menu's section chips and taps them after the walk moved on. Tapped directly
(walk finished) the same chips cause 9/6/6 DOM changes (chips show the picked section). Same harness: cauldron-fair live = E7.

## Found -> fixed (playing it myself)
- Tutorial stuck on "any token" (target was the whole market) -> target the fox token.
- Story portraits requested missing media/portrait-*.webp (10 404s) -> portrait hook returns a file only when it exists,
  else a drawn silhouette in the cast colour.
- Two instruction lines at once (status line + coach bubble) -> the line steps aside while a bubble shows.
- Toast covered the result heading; "a Elk" -> toast cleared on the result, a/an fixed.
- Phone top bar overflowed -> score pill hidden on phones (seat chips show scores).
- PC text under 16 px in shared panels, map-disc contrast, 4 "big" title buttons -> overrides in skin.css only.
- Title art filled the menu panel (dummy-art test) -> title-bg is now the screen background behind the panel.

## Assets
44 slots in `assets.json` (wave 1: 17, wave 2: 15, wave 3: 12); prompts in `next-wave/flow-2d/wildmark/`; `ASSETS.md`.
Loader proven with 3 dummy files (tok-bear, ter-forest, title-bg drawn, 0 missing requests), dummies deleted.
`register-assets.py` works but was NOT committed into `next-wave/expected-assets.json` (one-line file, every branch
conflicts): run it at merge time.

## Missing / next
- Scoring card sets B-D (slots exist, rules not implemented); online play; real art and music; balance of the Story
  targets checked only with the normal AI as stand-in player (c1 50+ is easy, c2 vs easy Pip is close for a weak player).
- Local Playwright: the installed browser is build 1243; 1.56.1 expects 1194 headless shell. I added a local symlink shim
  under /opt/pw-browsers/chromium_headless_shell-1194 (machine only, nothing committed); scripts here use
  executablePath /opt/pw-browsers/chromium.
