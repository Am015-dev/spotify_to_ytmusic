# Mainhattan Nightrun: Treblo music sources for Athina (2026-10-09)

Athina (stages 13–16) has no theme of its own; it reuses `stage1`–`stage3`, and Talos uses `boss`/`boss2`. Here are two new instrumental cues, two versions (a/b) each, 160 kbps MP3 sources made on treblo.com (Lyrics = None):

| file | length | Treblo title | meant for |
|---|---|---|---|
| `athina-a.mp3` | 4:07 | Neon Aegean – Bouzouki Overdrive | stages 13–15 (prompted 120 BPM) |
| `athina-b.mp3` | 3:33 | Neon Aegean – Stage Select: Athens 2087 | stages 13–15 |
| `talos-a.mp3` | 2:47 | Bronze Colossus – Titan's Threshold | stage 16 boss TALOS (prompted 128 BPM) |
| `talos-b.mp3` | 3:25 | Bronze Colossus – Wrath of the Ancients | stage 16 boss TALOS |

**Before use (the game is beat-timed, PERFECT window ±80 ms):**
1. Pick a or b by ear.
2. Measure the real `bpm`, `offsetMs` and `gapMs` with `audio-test.js`; the prompted BPM is only a target, not a guarantee.
3. Trim the file to whole bars, normalise to -18 LUFS, and add a `tracks.json` entry (for example `athina`, `boss3`).
4. Run `analysis/song-energy.py` for `SONGM`.
5. Point stages 13–15 at it (`s.song` in `story.js` / `athens.js`), and TALOS's boss switch at the boss track.

**Licence:** generated with Treblo by the project owner's account. Under Treblo's Terms of Service, section 8, the user owns the outputs. No samples are used, and the prompts name no artists. Log it like the existing Suno tracks.
