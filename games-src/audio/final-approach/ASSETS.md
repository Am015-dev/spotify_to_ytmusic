# Final Approach: audio assets

Sound effects: every sample is reused from the bundles already cut, normalised and licence-checked for earlier games (mono MP3 64 kbps; music stereo 96 kbps). The per-file source, author, licence URL and date checked are in `../ASSETS.md` under the "used as" names below. Licence snapshots (Kenney pack pages and licence files, the rubberduck pack page,): `licence-snapshots/`. All CC0 1.0 (https://creativecommons.org/publicdomain/zero/1.0/). No attribution is required but credits.html names the authors anyway.

| sample here | "used as" in ../ASSETS.md | author / pack | licence |
|---|---|---|---|
| `click` | nebula/click | Kenney (Interface Sounds, Digital Audio, Sci-fi Sounds, Music Jingles, UI Audio) | CC0 1.0 |
| `error` | nebula/error | Kenney (Interface Sounds, Digital Audio, Sci-fi Sounds, Music Jingles, UI Audio) | CC0 1.0 |
| `dieland` | crown/clack | Kenney Casino Audio; rubberduck "100 CC0 SFX #2" | CC0 1.0 |
| `roll` | crown/shake | Kenney Casino Audio; rubberduck "100 CC0 SFX #2" | CC0 1.0 |
| `switch` | nebula/token | Kenney (Interface Sounds, Digital Audio, Sci-fi Sounds, Music Jingles, UI Audio) | CC0 1.0 |
| `beep` | nebula/lock | Kenney (Interface Sounds, Digital Audio, Sci-fi Sounds, Music Jingles, UI Audio) | CC0 1.0 |
| `engine` | nebula/engine | Kenney (Interface Sounds, Digital Audio, Sci-fi Sounds, Music Jingles, UI Audio) | CC0 1.0 |
| `whoosh` | crown/whoosh | Kenney Casino Audio; rubberduck "100 CC0 SFX #2" | CC0 1.0 |
| `coffee` | rampart/coins | Kenney RPG Audio | CC0 1.0 |
| `round` | nebula/turn | Kenney (Interface Sounds, Digital Audio, Sci-fi Sounds, Music Jingles, UI Audio) | CC0 1.0 |
| `win` | nebula/win | Kenney (Interface Sounds, Digital Audio, Sci-fi Sounds, Music Jingles, UI Audio) | CC0 1.0 |
| `lose` | nebula/lose | Kenney (Interface Sounds, Digital Audio, Sci-fi Sounds, Music Jingles, UI Audio) | CC0 1.0 |
| `alarm` | nebula/stress | Kenney (Interface Sounds, Digital Audio, Sci-fi Sounds, Music Jingles, UI Audio) | CC0 1.0 |
| `boom` | nebula/boom | Kenney (Interface Sounds, Digital Audio, Sci-fi Sounds, Music Jingles, UI Audio) | CC0 1.0 |
| `hum` | nebula/engine_loop | Kenney (Interface Sounds, Digital Audio, Sci-fi Sounds, Music Jingles, UI Audio) | CC0 1.0 |
| `music.<slot>-a/b` | Treblo (own prompts, 2026-10-08) | Ten instrumentals generated on treblo.com by the project owner; Treblo Terms of Service section 8: the user owns the Outputs. Cut by audio/tools/music_treblo.py (-18 LUFS, 96 kbps). Treblo gives no warranty that a track can be copyrighted. | Treblo terms |

Rebuild: `node bundle_fa.js`.
