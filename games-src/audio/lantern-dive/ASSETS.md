# Lantern Dive: audio assets

All sounds are real CC0 recordings (Kenney packs, OpenGameArt), cut/layered/normalised by `build_ld.py` and bundled by `bundle_ld.py` (they import `../tools/dsp.py`, `sfx.py`). Checked 2026-10-04. Licence snapshots: `licence-snapshots/` here (Kenney `License.txt` files and the two OpenGameArt pages). No synthesis; the game falls back to its built-in quiet synth only when `GA` or a sample is missing.

## Sound effects (mono MP3 48 kbps)

| sample | source file(s) | pack | licence | length | size | use |
|---|---|---|---|---|---|---|
| `click` | `click3.ogg` | Kenney UI Audio | CC0 1.0 | 0.08 s | 1009 B | UI click |
| `play` | `card-place-2.ogg` | Kenney Casino Audio | CC0 1.0 | 0.31 s | 2263 B | a card is laid on the table |
| `slide` | `card-slide-3.ogg` | Kenney Casino Audio | CC0 1.0 | 0.60 s | 3987 B | a card glides across (job card moved, card to the trick) |
| `pass` | `card-slide-7.ogg` | Kenney Casino Audio | CC0 1.0 | 0.64 s | 4301 B | cards are passed or the hand moves on (quiet) |
| `take` | `card-fan-1.ogg` | Kenney Casino Audio | CC0 1.0 | 0.72 s | 4771 B | a job card is taken |
| `ping` | `bong_001.ogg`, `impactGlass_light_000.ogg` | Kenney Impact Sounds, Interface Sounds | CC0 1.0 | 0.15 s | 1323 B | a diver shows a card with the ping (bong + glass tap) |
| `trick` | `chips-handle-3.ogg` | Kenney Casino Audio | CC0 1.0 | 0.23 s | 1793 B | a trick is swept to its winner (chips handled) |
| `done` | `confirmation_003.ogg`, `pluck_001.ogg` | Kenney Interface Sounds | CC0 1.0 | 0.32 s | 2420 B | a job is done (soft confirmation + pluck) |
| `fail` | `impactBell_heavy_003.ogg` | Kenney Impact Sounds | CC0 1.0 | 0.69 s | 4614 B | a job fails (low bell, pitched down) |
| `deal` | `card-shuffle.ogg` | Kenney Casino Audio | CC0 1.0 | 1.20 s | 7592 B | the deal (shuffle, cut to 1.2 s) |
| `tick` | `tick_002.ogg` | Kenney Interface Sounds | CC0 1.0 | 0.02 s | 539 B | counting tick, replay with a rising rate |
| `win` | `jingles_STEEL07.ogg`, `jingles_PIZZI14.ogg` | Kenney Music Jingles | CC0 1.0 | 1.55 s | 9787 B | dive won (steel chimes + plucked jingle) |
| `lose` | `jingles_SAX03.ogg` | Kenney Music Jingles | CC0 1.0 | 1.09 s | 6965 B | dive lost (one sax jingle) |
| `error` | `error_004.ogg` | Kenney Interface Sounds | CC0 1.0 | 0.10 s | 1009 B | illegal move |

## Music and ambience (mono MP3, seamless loop)

| name | track | author | source page | download | licence | loop cut | length | size |
|---|---|---|---|---|---|---|---|---|
| `main` | "Underwater Theme" | Spring Spring | https://opengameart.org/content/underwater-theme-1 | https://opengameart.org/sites/default/files/underwater%20theme%202nd%20variation%20%28my%20preferred%29_1.ogg | CC0 1.0 | 7.50 s-47.48 s, 1.5 s cross-fade (similarity 0.795) | 40.0 s | 200324 B (40 kbps) |
| `sea` | "Underwater Ambient Pad" | isaiah658 | https://opengameart.org/content/underwater-ambient-pad | https://opengameart.org/sites/default/files/Underwater-Ambient-Pad-isaiah658_0.ogg | CC0 1.0 | whole clip, low-passed 1.6 kHz, 2 s circular cross-fade | 14.7 s | 59054 B (32 kbps) |

Totals: SFX 51 KB + music/ambience 253 KB MP3 = 304 KB; `audio-data.js` 406 KB (base64). Licence: CC0 1.0 https://creativecommons.org/publicdomain/zero/1.0/

Rebuild: `python3 build_ld.py <raw> <work> && python3 bundle_ld.py <work>` (raw = Kenney zips unpacked + `mus/` with `uw_theme.ogg` and `uw_pad.ogg` downloaded from the URLs above).

The shared `audio/ASSETS.md` has no rows for this game yet: append the rows from this table when merging (they were not added here because that file is shared).
