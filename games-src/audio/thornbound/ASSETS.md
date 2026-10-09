# The Thornbound Throne: audio assets

All sounds are real CC0 recordings (Kenney, OpenGameArt), processed with `tools/build_real.py` and `tools/bundle_real.py`. Checked 2026-10-02; licence pages are snapshotted in `../licence-snapshots/`. Nothing is synthesised: no fallback synth sounds are shipped (the games keep their own built-in synth for any missing name).

## Sound effects (mono MP3 64 kbps, trimmed, loudness-normalised)

| sample | source file(s) | pack | licence | length | size | use |
|---|---|---|---|---|---|---|
| `click` | `click_002.ogg` | Kenney Interface Sounds | CC0 1.0 | 0.01 s | 669 B | UI click |
| `place` | `card-shove-2.ogg`, `impactSoft_heavy_000.ogg` | Kenney Casino Audio, Impact Sounds | CC0 1.0 | 0.77 s | 6730 B | card placed face-down (shove + soft thud) |
| `flip` | `card-slide-7.ogg` | Kenney Casino Audio | CC0 1.0 | 0.64 s | 5685 B | card reveal / flip |
| `clash` | `impactMetal_heavy_001.ogg`, `impactPunch_heavy_000.ogg` | Kenney Impact Sounds | CC0 1.0 | 0.47 s | 4431 B | clash hit (heavy metal impact + punch) |
| `win` | `jingles_STEEL03.ogg` | Kenney Music Jingles | CC0 1.0 | 1.39 s | 11745 B | win sting (steel jingle) |
| `influence` | `handleCoins.ogg` | Kenney RPG Audio | CC0 1.0 | 0.74 s | 6521 B | influence gained (coins) |
| `herald` | `footstep03.ogg`, `metalClick.ogg` | Kenney RPG Audio | CC0 1.0 | 0.47 s | 4431 B | herald step (footstep + latch click) |
| `bid` | `handleCoins2.ogg` | Kenney RPG Audio | CC0 1.0 | 0.34 s | 3177 B | bid (coin handful) |
| `bell` | `impactBell_heavy_000.ogg` | Kenney Impact Sounds | CC0 1.0 | 1.25 s | 10492 B | round bell (heavy bell) |
| `fanfare` | `jingles_STEEL07.ogg`, `jingles_HIT15.ogg` | Kenney Music Jingles | CC0 1.0 | 1.55 s | 12999 B | end fanfare (steel + hit jingle layered) |
| `lose` | `jingles_STEEL01.ogg` | Kenney Music Jingles | CC0 1.0 | 1.38 s | 11536 B | lose sting (steel jingle) |
| `error` | `error_006.ogg` | Kenney Interface Sounds | CC0 1.0 | 0.26 s | 2550 B | illegal move |

## Music (mono MP3, loudness-normalised, seamless loop)

| name | track | author | source page | download | licence | loop cut | similarity | length | size |
|---|---|---|---|---|---|---|---|---|---|
| `main` (retired 2026-10-08, no longer shipped) | "Dark Forest Theme" | cynicmusic | https://opengameart.org/content/dark-forest-theme | https://opengameart.org/sites/default/files/GameMusic_ForestTheme_24_0.mp3 | CC0 1.0 | 9.40 s-29.43 s, 1.5 s equal-power cross-fade | 0.891 | 20.0 s | 100664 B (40 kbps) |
| `tense` (retired 2026-10-08, no longer shipped) | "Dungeon Ambience" | yd | https://opengameart.org/content/dungeon-ambience | https://opengameart.org/sites/default/files/dungeon002_0.ogg | CC0 1.0 | 8.40 s-22.42 s, 1.5 s equal-power cross-fade | 0.891 | 14.0 s | 70604 B (40 kbps) |

Totals: SFX 79 KB + music 167 KB MP3; `audio-data.js` 328 KB (base64). Licence: CC0 1.0 https://creativecommons.org/publicdomain/zero/1.0/

Rebuild: `python3 tools/build_real.py <raw> <work> && python3 tools/bundle_real.py <raw> <work>` (raw = Kenney zips unpacked + `mus/` with the OGA tracks).

## Music (2026-10-08): Treblo, shipped as separate files in `games/thornbound/music/`
Ten instrumental tracks (tavern = title, main = game, fight = final round, victory, defeat; versions a and b of each). Sources and licence note: `treblo/README.md`. Generated with Treblo (treblo.com) by the project owner's account; Treblo Terms of Service s.8: the user owns the outputs. No third-party samples; prompts name no artists or works.
Processing (ffmpeg): tavern first 100 s, main first 110 s, fight a 56 s / b 80 s, each cut into a loop with a 1.5 s cross-fade; victory first 18 s and defeat first 10 s with a 3 s fade-out; all -18 LUFS, stereo 96 kbps MP3. `audio-data.js` was edited by hand to point at them (`url:music/<name>.mp3`): re-running `tools/bundle_real.py` would overwrite that.
