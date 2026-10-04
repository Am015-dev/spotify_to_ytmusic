# Hollowbough: audio assets

All sounds are real CC0 recordings (Kenney, OpenGameArt), processed with `tools/build_real.py` and `tools/bundle_real.py`. Checked 2026-10-02; licence pages are snapshotted in `../licence-snapshots/`. Nothing is synthesised: no fallback synth sounds are shipped (the games keep their own built-in synth for any missing name).

## Sound effects (mono MP3 48 kbps, trimmed, loudness-normalised)

| sample | source file(s) | pack | licence | length | size | use |
|---|---|---|---|---|---|---|
| `click` | `click3.ogg` | Kenney UI Audio | CC0 1.0 | 0.08 s | 1009 B | UI click |
| `place` | `card-place-2.ogg` | Kenney Casino Audio | CC0 1.0 | 0.31 s | 2263 B | card placed on the table |
| `flip` | `card-slide-6.ogg` | Kenney Casino Audio | CC0 1.0 | 0.60 s | 3987 B | card flip / turn over |
| `twig` | `impactWood_light_000.ogg`, `impactWood_light_003.ogg` | Kenney Impact Sounds | CC0 1.0 | 0.22 s | 1793 B | twig resource (two dry wood knocks) |
| `resin` | `drop_001.ogg` | Kenney Interface Sounds | CC0 1.0 | 0.13 s | 1323 B | resin resource (soft drip) |
| `pebble` | `impactMining_001.ogg`, `impactMining_003.ogg` | Kenney Impact Sounds | CC0 1.0 | 0.73 s | 4928 B | pebble resource (two stone clicks) |
| `berry` | `pluck_002.ogg` | Kenney Interface Sounds | CC0 1.0 | 0.15 s | 1323 B | berry resource (soft pluck) |
| `worker` | `impactWood_light_001.ogg` | Kenney Impact Sounds | CC0 1.0 | 0.26 s | 2107 B | worker placed (wooden knock) |
| `season` | `jingles_PIZZI07.ogg` | Kenney Music Jingles | CC0 1.0 | 1.32 s | 8376 B | season change chime (plucked-string jingle) |
| `event` | `jingles_PIZZI03.ogg` | Kenney Music Jingles | CC0 1.0 | 1.14 s | 7279 B | event achieved (plucked-string jingle) |
| `tally` | `tick_002.ogg` | Kenney Interface Sounds | CC0 1.0 | 0.02 s | 539 B | score tally tick: play repeatedly with rising `rate` |
| `score` | `confirmation_002.ogg` | Kenney Interface Sounds | CC0 1.0 | 0.54 s | 3674 B | score total confirm |
| `turn` | `jingles_PIZZI06.ogg` | Kenney Music Jingles | CC0 1.0 | 0.69 s | 4614 B | your turn |
| `fanfare` | `jingles_PIZZI02.ogg`, `jingles_SAX07.ogg` | Kenney Music Jingles | CC0 1.0 | 2.23 s | 13862 B | end fanfare (plucked strings + sax jingle layered) |
| `lose` | `jingles_PIZZI01.ogg` | Kenney Music Jingles | CC0 1.0 | 0.99 s | 6338 B | low-score / lose sting |
| `error` | `error_004.ogg` | Kenney Interface Sounds | CC0 1.0 | 0.10 s | 1009 B | illegal move |

## Music (mono MP3, loudness-normalised, seamless loop)

| name | track | author | source page | download | licence | loop cut | similarity | length | size |
|---|---|---|---|---|---|---|---|---|---|
| `spring` | "Celtic Loop" | stereoscopic | https://opengameart.org/content/celtic-loop | https://opengameart.org/sites/default/files/celtic_0.mp3 | CC0 1.0 | 17.65 s-32.03 s, 1.5 s equal-power cross-fade | 0.853 | 14.4 s | 57968 B (32 kbps) |
| `summer` | "Medieval 5" | Tozan | https://opengameart.org/content/medieval-5 | https://opengameart.org/sites/default/files/medievalvillagesquare_0.ogg | CC0 1.0 | 22.90 s-35.11 s, 1.5 s equal-power cross-fade | 0.963 | 12.2 s | 49328 B (32 kbps) |
| `autumn` | "Northumberland" | Spring Spring | https://opengameart.org/content/northumberland | https://opengameart.org/sites/default/files/northumberland_0.mp3 | CC0 1.0 | 27.00 s-39.01 s, 1.5 s equal-power cross-fade | 0.774 | 12.0 s | 48464 B (32 kbps) |
| `winter` | "Long Winter" | Indieteur | https://opengameart.org/content/long-winter | https://opengameart.org/sites/default/files/Long%20Winter_0.mp3 | CC0 1.0 | 3.90 s-17.61 s, 1.5 s equal-power cross-fade | 0.806 | 13.7 s | 55232 B (32 kbps) |

Totals: SFX 62 KB + music 206 KB MP3; `audio-data.js` 359 KB (base64). Licence: CC0 1.0 https://creativecommons.org/publicdomain/zero/1.0/

Rebuild: `python3 tools/build_real.py <raw> <work> && python3 tools/bundle_real.py <raw> <work>` (raw = Kenney zips unpacked + `mus/` with the OGA tracks).
