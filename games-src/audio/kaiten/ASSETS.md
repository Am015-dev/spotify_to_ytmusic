# Kaiten Kitchen: audio assets

All sounds are real CC0 recordings (Kenney packs, OpenGameArt), cut/layered/normalised by `build_kaiten.py` and bundled by `bundle_kaiten.py` (they import `../tools/dsp.py`, `sfx.py`). Checked 2026-10-03. Licence snapshots: `licence-snapshots/` here (OpenGameArt pages and Kenney `License.txt`) plus `../licence-snapshots/` (Kenney pack pages). Nothing is synthesised; the only DSP on a recording is trim, fade, layering, loop cross-fade, loudness normalisation and one 1.1 kHz low-pass on the belt hum.

## Sound effects (mono MP3 48 kbps)

| sample | source file(s) | pack | licence | length | size | use |
|---|---|---|---|---|---|---|
| `click` | `click3.ogg` | Kenney UI Audio | CC0 1.0 | 0.08 s | 1009 B | UI click |
| `clink` | `impactGlass_light_001.ogg`, `impactTin_medium_002.ogg` | Kenney Impact Sounds | CC0 1.0 | 0.17 s | 1480 B | plate clink (ceramic/glass tap + tin ring): plate lands on the counter |
| `slide` | `card-slide-4.ogg` | Kenney Casino Audio | CC0 1.0 | 0.46 s | 3204 B | plate/card slide whoosh (a pick leaving the belt) |
| `pass` | `card-slide-8.ogg` | Kenney Casino Audio | CC0 1.0 | 0.67 s | 4458 B | hands pass to the next seat (longer slide, quiet) |
| `pick` | `card-place-3.ogg` | Kenney Casino Audio | CC0 1.0 | 0.88 s | 5711 B | card chosen / placed face-down on the mat |
| `cloche` | `metalLatch.ogg`, `impactTin_medium_000.ogg`, `card-slide-2.ogg` | Kenney Casino Audio, Impact Sounds, RPG Audio | CC0 1.0 | 0.52 s | 3517 B | cloche lift (metal latch + tin ring + slide): reveal |
| `coin` | `handleCoins2.ogg` | Kenney RPG Audio | CC0 1.0 | 0.34 s | 2420 B | coins handled: score gain |
| `tick` | `tick_002.ogg` | Kenney Interface Sounds | CC0 1.0 | 0.02 s | 539 B | score tick: replay with rising `rate` while counting |
| `round` | `jingles_PIZZI09.ogg`, `jingles_PIZZI04.ogg` | Kenney Music Jingles | CC0 1.0 | 0.86 s | 5555 B | round-end chime (two plucked jingles) |
| `win` | `jingles_SAX07.ogg`, `jingles_PIZZI14.ogg` | Kenney Music Jingles | CC0 1.0 | 1.74 s | 10884 B | game-win jingle (sax + plucked layered) |
| `error` | `error_004.ogg` | Kenney Interface Sounds | CC0 1.0 | 0.10 s | 1009 B | illegal move |

## Music and ambience (mono MP3, seamless loop)

| name | track | author | source page | download | licence | loop cut | length | size |
|---|---|---|---|---|---|---|---|---|
| `main` | "Jazz Slower" | Pro Sensory | https://opengameart.org/content/jazz-slower | https://opengameart.org/sites/default/files/Jazz%20Take%202.wav | CC0 1.0 | 35.75 s-78.09 s, 1.5 s cross-fade (similarity 0.823) | 42.3 s | 212079 B (40 kbps) |
| `belt` | "The Shop collection: convenience store drinks fridge drone 2" | LEGIT Audio | https://opengameart.org/content/the-shop | https://opengameart.org/sites/default/files/02_-_legit_audio_-_theshopcollection_convenience_store_drinks_fridge_drone_2.mp3 | CC0 1.0 | 2.00 s-12.50 s, 1.5 s cross-fade, low-passed 1.1 kHz | 9.0 s | 36379 B (32 kbps) |

Totals: SFX 38 KB + music/ambience 242 KB MP3 = 281 KB; `audio-data.js` 375 KB (base64). Licence: CC0 1.0 https://creativecommons.org/publicdomain/zero/1.0/

Rebuild: `python3 build_kaiten.py <raw> <work> && python3 bundle_kaiten.py <work>` (raw = Kenney zips unpacked + `mus/` with `jazz_slower.wav` and `fridge2.mp3` downloaded from the URLs above).

## Music (2026-10-09): Treblo, replaces the CC0 jazz bed
Ten instrumental tracks made with Treblo (model v3, no vocals) from our own prompts: `treblo/*-a|b.mp3` are the sources. `audio/tools/music_treblo.py` cuts them (loops cross-faded at the seam, victory 18 s and defeat 11 s with fades), -18 LUFS, 96 kbps, into `games/kaiten-kitchen/music/` (fetched on demand: `url:music/<slot>-<a|b>.mp3` in `audio-data.js`). Slots: Menu (tavern), Game (main), Last round / boss (fight), Victory, Defeat; the Music picker (title, Menu) saves a / b / shuffle / off per slot. The belt hum ambience stays under the game.
