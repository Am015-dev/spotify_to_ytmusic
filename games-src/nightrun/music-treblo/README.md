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

## Adding a song to the district pools (flag `RET.dpool`, `parts/ret.js`, B18)
Every district has a pool of songs (`RET.DP.base` = what exists today, `RET.DP.rows` = songs still to come). A stage takes the next pool song that is not the one before; the same rule runs the Endless loop. Bosses take the first loaded entry of `RET.DP.bossT[k]` (`boss-d1`..`boss-d4`, then the old boss songs). A new song needs three steps:
1. **File:** copy the mp3 (trimmed to whole bars, -18 LUFS) into `games/mainhattan-nightrun/music/`.
2. **Measure:** run `audio-test.js`, take the real `bpm`, `offsetMs` and `gapMs`, and add the entry to `music/tracks.json` (`stage` = the key, for example `d1a`). Optionally run `analysis/song-energy.py` for its `SONGM` line.
3. **Row:** make sure the key has a row in `DP.rows` (`{k:'d1a',bpm:118,d:[0]}`, `d` = district indexes 0 Bank, 1 Main, 2 Ostend, 3 Messe, 4 Athens). The keys from `cues-polish.json` (`d1a`..`d4b`, `boss-d1`..`boss-d4`) already have rows; a row without a loaded song is ignored. For a boss theme use its `boss-dN` key.
Then run `ret-dpool-test.js` and `audio-test.js` (the beat grid must stay within 40 ms).

## B18 district and boss cues (2026-10-17)
The 12 slots from `games-src/next-wave/music/mainhattan-nightrun/cues-polish.json` (`d1a`..`d4b`, `boss-d1`..`boss-d4`), two versions (a/b) each, made on treblo.com (Instrumental, Song description = the cue prompt) and stored as 160 kbps MP3. Same steps as above before use: pick a/b by ear, measure `bpm`/`offsetMs`/`gapMs` with `audio-test.js` (the prompted BPM is a target only), trim to whole bars, -18 LUFS, `tracks.json` entry under the cue key; the `DP.rows`/`DP.bossT` keys already exist.

| file | length | cue key | meant for |
|---|---|---|---|
| `boss-d1-a.mp3` | 3:58 | `boss-d1` | Bank boss theme (prompted 120 BPM) |
| `boss-d1-b.mp3` | 3:21 | `boss-d1` | Bank boss theme (prompted 120 BPM) |
| `boss-d2-a.mp3` | 3:37 | `boss-d2` | Main boss theme (prompted 124 BPM) |
| `boss-d2-b.mp3` | 3:06 | `boss-d2` | Main boss theme (prompted 124 BPM) |
| `boss-d3-a.mp3` | 3:07 | `boss-d3` | Ostend boss theme (prompted 128 BPM) |
| `boss-d3-b.mp3` | 3:12 | `boss-d3` | Ostend boss theme (prompted 128 BPM) |
| `boss-d4-a.mp3` | 3:31 | `boss-d4` | Messe boss theme (prompted 132 BPM) |
| `boss-d4-b.mp3` | 3:41 | `boss-d4` | Messe boss theme (prompted 132 BPM) |
| `d1a-a.mp3` | 1:38 | `d1a` | Bank district pool (prompted 118 BPM) |
| `d1a-b.mp3` | 2:40 | `d1a` | Bank district pool (prompted 118 BPM) |
| `d1b-a.mp3` | 3:23 | `d1b` | Bank district pool (prompted 120 BPM) |
| `d1b-b.mp3` | 2:02 | `d1b` | Bank district pool (prompted 120 BPM) |
| `d2a-a.mp3` | 4:34 | `d2a` | Main district pool (prompted 124 BPM) |
| `d2a-b.mp3` | 4:17 | `d2a` | Main district pool (prompted 124 BPM) |
| `d2b-a.mp3` | 4:06 | `d2b` | Main district pool (prompted 124 BPM) |
| `d2b-b.mp3` | 3:21 | `d2b` | Main district pool (prompted 124 BPM) |
| `d3a-a.mp3` | 1:58 | `d3a` | Ostend district pool (prompted 128 BPM) |
| `d3a-b.mp3` | 2:37 | `d3a` | Ostend district pool (prompted 128 BPM) |
| `d3b-a.mp3` | 2:30 | `d3b` | Ostend district pool (prompted 128 BPM) |
| `d3b-b.mp3` | 1:55 | `d3b` | Ostend district pool (prompted 128 BPM) |
| `d4a-a.mp3` | 3:08 | `d4a` | Messe district pool (prompted 132 BPM) |
| `d4a-b.mp3` | 3:52 | `d4a` | Messe district pool (prompted 132 BPM) |
| `d4b-a.mp3` | 3:12 | `d4b` | Messe district pool (prompted 132 BPM) |
| `d4b-b.mp3` | 3:18 | `d4b` | Messe district pool (prompted 132 BPM) |

**Licence:** generated with Treblo by the project owner's account; Treblo Terms of Service section 8: the user owns the outputs. No samples, no artist names in the prompts.
