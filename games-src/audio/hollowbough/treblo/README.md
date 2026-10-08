# Hollowbough: Treblo music sources (2026-10-08)

Ten instrumental tracks: five cues, two versions (a/b) of each. They were generated on treblo.com (model v3, Advanced mode: Styles = Auto with the prompt, Lyrics = None, so no vocals).

These files are **sources**: the original WAVs re-encoded to MP3 at 160 kbps. They are not game-ready.

**Pick one version per cue by ear (the owner decides).** Then copy the chosen files into the `raw/mus` folder on Linux and add them to `../../tools/music.py`, which cuts a cross-faded loop, normalises to -18 LUFS and encodes 96 kbps MP3. The prompts are in laptop `game-assets/cards/hollowbough/music_prompts.txt`.

| file | length | Treblo title |
|---|---|---|
| `defeat-a.mp3` | 1:51 | Leaves Let Go - E Minor, Late October |
| `defeat-b.mp3` | 1:31 | Leaves Let Go - Last Chord, Golden Light |
| `fight-a.mp3` | 3:13 | Race the Frost - Last Harvest Before Winter |
| `fight-b.mp3` | 2:05 | Race the Frost - Fiddle at the Wood's Edge |
| `main-a.mp3` | 2:00 | Hearthwood Grove - Quiet Cartographer |
| `main-b.mp3` | 2:57 | Hearthwood Grove - Meadowlight Turn |
| `tavern-a.mp3` | 2:15 | Morning in Willowbrook - The Village Wakes |
| `tavern-b.mp3` | 1:23 | Morning in Willowbrook - Sunlight Through the Canopy |
| `victory-a.mp3` | 2:21 | Harvest Faire Dance - Grove of Golden Light |
| `victory-b.mp3` | 4:02 | Harvest Faire Dance - Tambourine at the Woodland Gate |

## What each cue is for
- **tavern**: menu / title loop (new, `music.tavern`)
- **main**: in-game loop (`music.main`)
- **fight**: tense moments: the final season / round or a boss chapter (new, `music.fight`)
- **victory**: win screen cue (new, `music.victory`): cut a 15-20 s section with a fade-out
- **defeat**: lose screen cue (new, `music.defeat`): cut an 8-12 s section with a fade-out

Victory and defeat are full songs, not short cues. Cut them with ffmpeg, for example:
`ffmpeg -i victory-a.mp3 -t 18 -af "afade=t=out:st=15:d=3,loudnorm=I=-18" -b:a 96k hollowbough_victory.mp3`

## Licence (add to `../../ASSETS.md`)
- Generated with Treblo (treblo.com) by the project owner's account, 2026-10-08.
- Treblo Terms of Service, section 8 (Output): the user owns the Outputs, and Treblo assigns its rights to the user. The commercial-use limits in the rest of the terms "do not limit Your use of Your Outputs".
- Outputs may not be unique, and Treblo gives no warranty about whether a track can be copyrighted.
- No third-party samples were used. The prompts are our own and name no artists or works.
