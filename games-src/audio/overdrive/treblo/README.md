# Mainhattan Overdrive: Treblo music sources (2026-10-08)

Ten instrumental tracks: five cues, two versions (a/b) of each. They were generated on treblo.com (model v3, Advanced mode: Styles = Auto with the prompt, Lyrics = None, so no vocals).

These files are **sources**: the original WAVs re-encoded to MP3 at 160 kbps. They are not game-ready.

**Pick one version per cue by ear (the owner decides).** Then copy the chosen files into the `raw/mus` folder on Linux and add them to `../../tools/music.py`, which cuts a cross-faded loop, normalises to -18 LUFS and encodes 96 kbps MP3. The prompts are in laptop `game-assets/cards/overdrive/music_prompts.txt`.

| file | length | Treblo title |
|---|---|---|
| `city_ath-a.mp3` | 2:48 |  |
| `city_ath-b.mp3` | 3:27 |  |
| `city_fra-a.mp3` | 3:19 |  |
| `city_fra-b.mp3` | 3:17 |  |
| `garage-a.mp3` | 3:03 |  |
| `garage-b.mp3` | 2:54 |  |
| `menu-a.mp3` | 2:34 |  |
| `menu-b.mp3` | 4:14 |  |
| `race-a.mp3` | 1:37 |  |
| `race-b.mp3` | 3:16 |  |
| `race_final-a.mp3` | 3:32 |  |
| `race_final-b.mp3` | 3:42 |  |
| `water-a.mp3` | 3:33 |  |
| `water-b.mp3` | 2:23 |  |
| `win-a.mp3` | 2:41 |  |
| `win-b.mp3` | 3:28 |  |

## What each cue is for
- **tavern**: menu / title loop (new, `music.tavern`)
- **main**: in-game loop (`music.main`)
- **fight**: tense moments: the final season / round or a boss chapter (new, `music.fight`)
- **victory**: win screen cue (new, `music.victory`): cut a 15-20 s section with a fade-out
- **defeat**: lose screen cue (new, `music.defeat`): cut an 8-12 s section with a fade-out

Victory and defeat are full songs, not short cues. Cut them with ffmpeg, for example:
`ffmpeg -i victory-a.mp3 -t 18 -af "afade=t=out:st=15:d=3,loudnorm=I=-18" -b:a 96k overdrive_victory.mp3`

## Licence (add to `../../ASSETS.md`)
- Generated with Treblo (treblo.com) by the project owner's account, 2026-10-08.
- Treblo Terms of Service, section 8 (Output): the user owns the Outputs, and Treblo assigns its rights to the user. The commercial-use limits in the rest of the terms "do not limit Your use of Your Outputs".
- Outputs may not be unique, and Treblo gives no warranty about whether a track can be copyrighted.
- No third-party samples were used. The prompts are our own and name no artists or works.

## Where these go in Overdrive (for the session that owns Overdrive)
This repo does not edit `games/mainhattan-overdrive/` (another session builds it). Overdrive streams `music/<name>.mp3` from `MUS_FILES`/`MUS_MAP` in the built `index.html` (around line 10533). Pick a or b per cue, copy it into the Overdrive project's `src/assets/music/` under the slot name, rebuild:

| cue files | Overdrive slot | today |
|---|---|---|
| `menu-a/b` | `menu.mp3` (menu, loading) | Suno file; replace |
| `garage-a/b` | `garage.mp3` (garage panel) | Suno file; replace |
| `city_fra-a/b` | `city_fra.mp3` (Frankfurt roam) | Suno file; replace |
| `city_ath-a/b` | `city_ath.mp3` (Athens roam) | Suno file; replace |
| `race-a/b` | `race.mp3` (race, countdown) | Suno file; replace |
| `race_final-a/b` | NEW `race_final.mp3`: map `race_final` mode to it (today it reuses race.mp3) | — |
| `water-a/b` | NEW `water.mp3`: add to `MUS_FILES`, map the boat mode (today: synth) | — |
| `win-a/b` | NEW `win.mp3`: map `results` (today: synth); 2:40-3:30 long, so fade it out after ~30 s or let it loop | — |

Tempos follow the old synth themes (Frankfurt 112, Athens 118, race 172), but nothing in gameplay is synced to the music beat.
