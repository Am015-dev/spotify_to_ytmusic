# Final Approach: Treblo music sources (2026-10-08)

Ten instrumental tracks: five cues, two versions (a/b) of each. They were generated on treblo.com (model v3, Advanced mode: Styles = Auto with the prompt, Lyrics = None, so no vocals).

These files are **sources**: the original WAVs re-encoded to MP3 at 160 kbps. They are not game-ready.

**Pick one version per cue by ear (the owner decides).** Then copy the chosen files into the `raw/mus` folder on Linux and add them to `../../tools/music.py`, which cuts a cross-faded loop, normalises to -18 LUFS and encodes 96 kbps MP3. The prompts are in laptop `game-assets/cards/final-approach/music_prompts.txt`.

| file | length | Treblo title |
|---|---|---|
| `defeat-a.mp3` | 2:59 | Sheepish Shuffle - Deflating Plink |
| `defeat-b.mp3` | 3:11 | Sheepish Shuffle - Oops, Trombone |
| `fight-a.mp3` | 2:17 | Final Approach - Runway Lights |
| `fight-b.mp3` | 2:17 | Final Approach - Ninety Seconds Out |
| `main-a.mp3` | 3:26 | Cockpit Drift - Holding Pattern |
| `main-b.mp3` | 2:51 | Cockpit Drift - Felt Keys and Flight Paths |
| `tavern-a.mp3` | 0:47 | Gate 47, 6 A.M. - Boarding Pass Daydream |
| `tavern-b.mp3` | 2:10 | Gate 47, 6 A.M. - Wanderlust Departures |
| `victory-a.mp3` | 3:54 | Final Descent, Perfect Landing - Applause at Altitude |
| `victory-b.mp3` | 2:26 | Final Descent, Perfect Landing - Homecoming Fanfare |

## What each cue is for
- **tavern**: menu / title loop (new, `music.tavern`)
- **main**: in-game loop (`music.main`)
- **fight**: tense moments: the final season / round or a boss chapter (new, `music.fight`)
- **victory**: win screen cue (new, `music.victory`): cut a 15-20 s section with a fade-out
- **defeat**: lose screen cue (new, `music.defeat`): cut an 8-12 s section with a fade-out

Victory and defeat are full songs, not short cues. Cut them with ffmpeg, for example:
`ffmpeg -i victory-a.mp3 -t 18 -af "afade=t=out:st=15:d=3,loudnorm=I=-18" -b:a 96k final-approach_victory.mp3`

## Licence (add to `../../ASSETS.md`)
- Generated with Treblo (treblo.com) by the project owner's account, 2026-10-08.
- Treblo Terms of Service, section 8 (Output): the user owns the Outputs, and Treblo assigns its rights to the user. The commercial-use limits in the rest of the terms "do not limit Your use of Your Outputs".
- Outputs may not be unique, and Treblo gives no warranty about whether a track can be copyrighted.
- No third-party samples were used. The prompts are our own and name no artists or works.

## Short menu loops (2026-10-09)
Shorter alternatives for the menu/title screen, generated with Treblo's Duration Control (max 1:00, which Treblo treats as a guide). Anything longer was trimmed to 58 s with a fade-out, so loop these with a short crossfade.

| file | length | note |
|---|---|---|
| `tavern-short-a.mp3` | 0:58 | trimmed from 73 s, 3 s fade-out |
| `tavern-short-b.mp3` | 0:48 | as generated |
