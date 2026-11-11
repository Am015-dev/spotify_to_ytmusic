# Cauldron Fair: audio assets

All sounds are real CC0 recordings (Kenney packs, OpenGameArt), cut/layered/normalised by `build_cauldron.py` and bundled by `bundle_cauldron.py` (they import `../../audio/tools/dsp.py`, `sfx.py`). Checked 2026-10-04. Licence snapshots: `licence-snapshots/` here. Nothing is synthesised; the browser synth in the game is only a fallback when a sample is missing.

## Sound effects (mono MP3 48 kbps; `bubbling` 32 kbps)

| sample | source file(s) | pack | licence | length | size | use |
|---|---|---|---|---|---|---|
| `click` | `ui-audio/click3.ogg` | Kenney UI Audio | CC0 1.0 | 0.08 s | 1009 B | buttons |
| `draw` | `rpg-audio/handleSmallLeather.ogg` | Kenney RPG Audio | CC0 1.0 | 0.25 s | 1950 B | a chip leaves the bag |
| `plop` | `plop_01.ogg` | 100 CC0 SFX | CC0 1.0 | 0.16 s | 1480 B | a chip lands in the pot |
| `splash` | `splash_02.ogg` | 40 CC0 water splash, slime SFX | CC0 1.0 | 0.61 s | 4144 B | a bigger splash (orange chip, droplet moves) |
| `boom` | `sci-fi-sounds/explosionCrunch_001.ogg`, `explosion.ogg` | 100 CC0 SFX, Kenney Sci-fi Sounds | CC0 1.0 | 1.36 s | 8533 B | the cauldron overflows |
| `flask` | `impact-sounds/impactGlass_light_000.ogg`, `bubble_01.ogg` | 40 CC0 water splash, slime SFX, Kenney Impact Sounds | CC0 1.0 | 0.63 s | 4301 B | flask used (glass + bubble) |
| `ruby` | `impact-sounds/impactGlass_light_003.ogg`, `music-jingles/Pizzicato jingles/jingles_PIZZI14.ogg` | Kenney Impact Sounds, Kenney Music Jingles | CC0 1.0 | 0.94 s | 6182 B | a ruby is earned or spent |
| `coin` | `rpg-audio/handleCoins2.ogg` | Kenney RPG Audio | CC0 1.0 | 0.34 s | 2420 B | coins gained |
| `tick` | `interface-sounds/tick_002.ogg` | Kenney Interface Sounds | CC0 1.0 | 0.02 s | 539 B | score counting, rising `rate` |
| `die` | `casino-audio/die-throw-2.ogg` | Kenney Casino Audio | CC0 1.0 | 0.65 s | 4301 B | bonus die rolled |
| `page` | `rpg-audio/bookFlip2.ogg` | Kenney RPG Audio | CC0 1.0 | 0.42 s | 2890 B | day report / rules page turns |
| `round` | `music-jingles/Pizzicato jingles/jingles_PIZZI09.ogg`, `music-jingles/Pizzicato jingles/jingles_PIZZI04.ogg` | Kenney Music Jingles | CC0 1.0 | 0.86 s | 5555 B | round ends |
| `win` | `music-jingles/Sax jingles/jingles_SAX07.ogg`, `music-jingles/Pizzicato jingles/jingles_PIZZI14.ogg` | Kenney Music Jingles | CC0 1.0 | 1.74 s | 10884 B | game over, winner |
| `error` | `interface-sounds/error_004.ogg` | Kenney Interface Sounds | CC0 1.0 | 0.10 s | 1009 B | illegal move |
| `buy` | `rpg-audio/handleCoins.ogg`, `casino-audio/chip-lay-2.ogg` | Kenney Casino Audio, Kenney RPG Audio | CC0 1.0 | 0.76 s | 4928 B | an ingredient is bought |
| `bubble` | `bubble_02.ogg` | 40 CC0 water splash, slime SFX | CC0 1.0 | 0.27 s | 2107 B | a bubble pops (pot flavour) |
| `pass` | `casino-audio/card-slide-8.ogg` | Kenney Casino Audio | CC0 1.0 | 0.67 s | 4458 B | hot-seat pass screen |
| `bubbling` | `water_boiling.ogg` | 30 CC0 SFX loops | CC0 1.0 | 3.49 s | 14332 B | pot simmering loop (quiet, under music) |

## Music (mono MP3 40 kbps, seamless loop)

| name | track | author | source page | licence | loop cut | length | size |
|---|---|---|---|---|---|---|---|
| `main` | "Medieval: Market Day" (`Loop_Market_Day.wav`) | RandomMind | https://opengameart.org/content/medieval-market-day | CC0 1.0 | 17.55 s-50.01 s, 1.5 s cross-fade (similarity 0.779) | 32.5 s | 162708 B |

Totals: SFX 79 KB + music 158 KB MP3; `audio-data.js` 317 KB (base64). Licence: CC0 1.0 https://creativecommons.org/publicdomain/zero/1.0/

Rebuild: `python3 build_cauldron.py <raw> <work> && python3 bundle_cauldron.py <work>` (raw = Kenney zips unpacked + `oga/` rubberduck packs unpacked + `mus/Loop_Market_Day.wav`).
