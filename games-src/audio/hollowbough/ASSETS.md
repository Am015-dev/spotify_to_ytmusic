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

## Music (separate files in `games/hollowbough/music/`, 96 kbps stereo MP3, -18 LUFS)

Ten instrumental tracks generated with Treblo (treblo.com) from our own prompts on the owner's account, 2026-10-08. Processed by `audio/tools/music_treblo.py` from `treblo/` (loops: at most 150 s with the last 2 s cross-faded into the first 2 s; victory 18 s and defeat 11 s with fades). Treblo Terms of Service section 8 (Output): the user owns the Outputs; no third-party samples; Treblo gives no warranty that a track can be copyrighted. Details: `treblo/README.md`.

| slot | a | b | default |
|---|---|---|---|
| Menu (`tavern`) | Morning in Willowbrook: The Village Wakes | Morning in Willowbrook: Sunlight Through the Canopy | a |
| Game (`main`) | Hearthwood Grove: Quiet Cartographer | Hearthwood Grove: Meadowlight Turn | a |
| Fight / big moment (`fight`) | Race the Frost: Last Harvest Before Winter | Race the Frost: Fiddle at the Wood's Edge | a |
| Victory | Harvest Faire Dance: Grove of Golden Light | Harvest Faire Dance: Tambourine at the Woodland Gate | a |
| Defeat | Leaves Let Go: E Minor, Late October | Leaves Let Go: Last Chord, Golden Light | a |

The four CC0 season beds used before (stereoscopic, Tozan, Spring Spring, Indieteur) were retired and removed from `audio-data.js`.

## Painted art (2026-10)

Card paintings (`art/`, 47 of 48 cards), campaign portraits, card backs, tables, title and end-screen art (`games/hollowbough/media/`): generated with Google Flow (Nano Banana) from our own prompts, with no reference to any other game, its art or its publisher.

Sound effects: 62 KB in `audio-data.js` (base64). Licence for the Kenney sound effects: CC0 1.0 https://creativecommons.org/publicdomain/zero/1.0/
Rebuild: `python3 tools/build_real.py <raw> <work> && python3 tools/bundle_real.py <raw> <work>` (raw = Kenney zips unpacked + `mus/` with the OGA tracks).
